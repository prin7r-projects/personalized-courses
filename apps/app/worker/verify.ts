/**
 * Curriculum7 Citation Verifier
 * Polls for unverified readings and checks against Crossref, OpenLibrary,
 * and GitHub raw. Updates readings with verified_at timestamps.
 *
 * Usage: node --import tsx worker/verify.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, isNull, and, sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema.js";

// ── Config ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // optional, increases rate limit
const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
const USER_AGENT = "Curriculum7 (mailto:hi@reading-list.prin7r.com)";

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(client, { schema });

// ── Verifiers ──────────────────────────────────────────────────────────────

interface Reading {
  citation: string;
  source: "crossref" | "openlibrary" | "github" | "manual";
  url?: string;
  verifiedAt?: string;
}

async function verifyCrossref(citation: string): Promise<boolean> {
  try {
    // Extract title/author from citation for search
    const query = encodeURIComponent(citation.slice(0, 200));
    const res = await fetch(
      `https://api.crossref.org/works?query=${query}&rows=1`,
      {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as {
      message?: { items?: unknown[] };
    };
    return (data.message?.items?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

async function verifyOpenLibrary(citation: string): Promise<boolean> {
  try {
    // Search OpenLibrary by title
    const query = encodeURIComponent(citation.slice(0, 200));
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${query}&limit=1`,
      {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { numFound?: number };
    return (data.numFound ?? 0) > 0;
  } catch {
    return false;
  }
}

async function verifyGitHub(citation: string): Promise<boolean> {
  try {
    // Parse owner/repo from citation
    // e.g. "rust-lang/rust/blob/master/README.md" → owner=rust-lang, repo=rust, path=README.md
    const match = citation.match(
      /([\w.-]+)\/([\w.-]+)(?:\/blob\/\w+\/(.+))?/
    );
    if (!match) return false;

    const [, owner, repo, path] = match;
    const url = path
      ? `https://raw.githubusercontent.com/${owner}/${repo}/refs/heads/master/${path}`
      : `https://api.github.com/repos/${owner}/${repo}`;

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
    };
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function verifyReading(reading: Reading): Promise<Reading> {
  const source = reading.source ?? "crossref";

  const verifiers: Record<string, (c: string) => Promise<boolean>> = {
    crossref: verifyCrossref,
    openlibrary: verifyOpenLibrary,
    github: verifyGitHub,
  };

  const verify = verifiers[source];
  if (!verify) {
    // Manual sources are pre-verified
    return { ...reading, verifiedAt: new Date().toISOString() };
  }

  const start = Date.now();
  const ok = await verify(reading.citation);
  const elapsed = Date.now() - start;

  console.log(
    `  [${source}] ${ok ? "✓" : "✗"} ${reading.citation.slice(0, 60)}... (${elapsed}ms)`
  );

  if (ok) {
    return { ...reading, verifiedAt: new Date().toISOString() };
  }

  return reading;
}

// ── Main loop ──────────────────────────────────────────────────────────────

async function processModule(
  mod: typeof schema.modules.$inferSelect
): Promise<boolean> {
  const readings = (mod.readings ?? []) as Reading[];
  if (readings.length === 0 || readings.every((r) => r.verifiedAt)) {
    return true; // Already verified
  }

  console.log(
    `  Verifying module ${mod.idx}: "${mod.title}" (${readings.length} readings)`
  );

  const updatedReadings: Reading[] = [];
  for (const reading of readings) {
    const verified = await verifyReading(reading);
    updatedReadings.push(verified);
  }

  // Check if all verified
  const allVerified = updatedReadings.every((r) => !!r.verifiedAt);

  await db
    .update(schema.modules)
    .set({ readings: updatedReadings as any })
    .where(eq(schema.modules.id, mod.id));

  return allVerified;
}

async function poll(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Verifying readings...`);

  try {
    // Find modules that need verification (belong to courses that are syllabus_pending)
    const unverifiedModules = await db
      .select({
        module: schema.modules,
      })
      .from(schema.modules)
      .innerJoin(
        schema.courses,
        eq(schema.courses.id, schema.modules.courseId)
      )
      .where(
        and(
          eq(schema.courses.status, "syllabus_pending"),
        )
      )
      .limit(20);

    if (unverifiedModules.length === 0) {
      console.log("  No modules to verify");
      return;
    }

    console.log(`  Found ${unverifiedModules.length} modules to verify`);

    for (const row of unverifiedModules) {
      await processModule(row.module);
    }
  } catch (err) {
    console.error("Poll error:", err);
  }
}

// ── Start ──────────────────────────────────────────────────────────────────

console.log("Curriculum7 Citation Verifier starting...");
console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
console.log(`GitHub token: ${GITHUB_TOKEN ? "configured" : "not configured (60 req/h)"}`);

poll();
setInterval(poll, POLL_INTERVAL_MS);

process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await client.end();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("\nShutting down...");
  await client.end();
  process.exit(0);
});
