/**
 * Curriculum7 Drip Worker
 * Sends scheduled module drips via Postmark. Checks that all readings
 * are verified before sending (Phase 3 hard-gate).
 *
 * Usage: node --import tsx worker/drip.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, isNull, lte, sql } from "drizzle-orm";
import * as schema from "../src/lib/db/schema.js";

// ── Config ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const APP_URL = process.env.AUTH_URL ?? "http://localhost:3100";
const POLL_INTERVAL_MS = 60 * 1000; // 1 minute

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(client, { schema });

// ── Helpers ────────────────────────────────────────────────────────────────

interface Reading {
  citation: string;
  source: string;
  url?: string;
  verifiedAt?: string;
}

function formatReadingList(readings: Reading[]): string {
  if (!readings?.length) return "";
  return readings
    .map(
      (r) =>
        `<p style="margin: 4px 0; font-style: italic;">— ${r.citation}${r.url ? ` <a href="${r.url}" style="color: #A87E2C;">↗</a>` : ""}</p>`
    )
    .join("");
}

async function sendDripEmail(
  email: string,
  moduleTitle: string,
  moduleIdx: number,
  nModules: number,
  readings: Reading[],
  exerciseMd: string,
  submitUrl: string
): Promise<boolean> {
  if (!POSTMARK_TOKEN) {
    console.warn("POSTMARK_SERVER_TOKEN not set — skipping email");
    return false;
  }

  const readingHtml = formatReadingList(readings);

  try {
    const res = await fetch("https://api.postmarkapp.com/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Postmark-Server-Token": POSTMARK_TOKEN,
      },
      body: JSON.stringify({
        From: "Curriculum7 <courses@reading-list.prin7r.com>",
        To: email,
        Subject: `Module ${moduleIdx} of ${nModules}: ${moduleTitle}`,
        HtmlBody: `
          <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Module ${moduleIdx} of ${nModules}</p>
            <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
            <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0 0 16px;">${moduleTitle}</h1>
            <div style="font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55;">
              <p style="font-weight: 600; color: #3A2A1A;">Reading</p>
              ${readingHtml}
            </div>
            <div style="margin: 24px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #3A2A1A; line-height: 1.55;">
              <p style="font-weight: 600;">Exercise</p>
              <div>${exerciseMd}</div>
            </div>
            <a href="${submitUrl}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A;">Submit your work →</a>
          </div>
        `,
        TextBody: `Module ${moduleIdx} of ${nModules}: ${moduleTitle}\n\n${exerciseMd}\n\nSubmit at: ${submitUrl}`,
        MessageStream: "outbound",
      }),
    });

    return res.ok;
  } catch (err) {
    console.error(`Email failed for ${email}:`, err);
    return false;
  }
}

function allReadingsVerified(mod: { readings: unknown }): boolean {
  const readings = (mod.readings ?? []) as Reading[];
  return readings.length > 0 && readings.every((r) => !!r.verifiedAt);
}

// ── Main loop ──────────────────────────────────────────────────────────────

async function poll(): Promise<void> {
  const now = new Date();
  console.log(`[${now.toISOString()}] Checking drips...`);

  try {
    // Find drips that are due and pending
    const dueDrips = await db
      .select({
        drip: schema.drips,
        module: schema.modules,
        course: schema.courses,
      })
      .from(schema.drips)
      .innerJoin(schema.modules, eq(schema.modules.id, schema.drips.moduleId))
      .innerJoin(
        schema.courses,
        eq(schema.courses.id, schema.modules.courseId)
      )
      .where(
        and(
          eq(schema.drips.status, "pending"),
          isNull(schema.drips.sentAt),
          lte(schema.drips.scheduledAt!, now)
        )
      )
      .limit(10);

    if (dueDrips.length === 0) {
      return;
    }

    console.log(`  Found ${dueDrips.length} drips to send`);

    for (const row of dueDrips) {
      // Phase 3 hard-gate: block if any module in course has unverified readings
      const courseModules = await db
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.courseId, row.course.id))
        .orderBy(schema.modules.idx);

      const allVerified = courseModules.every(allReadingsVerified);
      if (!allVerified) {
        console.log(
          `  Blocking drip for course ${row.course.id} — unverified readings`
        );
        await db
          .update(schema.drips)
          .set({ status: "delivery_blocked" })
          .where(eq(schema.drips.id, row.drip.id));
        continue;
      }

      // Get user email
      if (!row.course.userId) {
        console.log(`  No userId for course ${row.course.id}, skipping`);
        continue;
      }

      const [user] = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, row.course.userId))
        .limit(1);

      if (!user?.email) {
        console.log(`  No email for user ${row.course.userId}, skipping`);
        continue;
      }

      // Send the drip
      const readings = (row.module.readings ?? []) as Reading[];
      const submitUrl = `${APP_URL}/dashboard`;
      const nModules = courseModules.length;

      const sent = await sendDripEmail(
        user.email,
        row.module.title ?? `Module ${row.module.idx}`,
        row.module.idx,
        nModules,
        readings,
        row.module.exerciseMd ?? "",
        submitUrl
      );

      if (sent) {
        await db
          .update(schema.drips)
          .set({
            sentAt: now,
            status: "sent",
          })
          .where(eq(schema.drips.id, row.drip.id));

        // If course was syllabus_approved, mark as active
        if (row.course.status === "syllabus_approved") {
          await db
            .update(schema.courses)
            .set({ status: "active" })
            .where(eq(schema.courses.id, row.course.id));
        }

        console.log(
          `  Sent module ${row.module.idx} to ${user.email}`
        );
      } else {
        console.error(
          `  Failed to send module ${row.module.idx} to ${user.email}`
        );
      }
    }
  } catch (err) {
    console.error("Poll error:", err);
  }
}

// ── Start ──────────────────────────────────────────────────────────────────

console.log("Curriculum7 Drip Worker starting...");
console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
console.log(`Postmark: ${POSTMARK_TOKEN ? "configured" : "NOT CONFIGURED"}`);

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
