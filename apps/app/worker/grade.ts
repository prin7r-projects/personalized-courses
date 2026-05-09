/**
 * Curriculum7 Grade Worker
 * Grades student submissions against the module rubric using Claude 4.7.
 * Flags submissions where confidence < 0.7 or rubric coverage < 80%.
 *
 * Usage: node --import tsx worker/grade.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, isNull, and } from "drizzle-orm";
import * as schema from "../src/lib/db/schema.js";

// ── Config ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const POLL_INTERVAL_MS = 30 * 1000; // 30 seconds
const MAX_RETRIES = 2;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(client, { schema });

// ── LLM grading ────────────────────────────────────────────────────────────

const GRADER_PROMPT = `You are an editorial grader for Curriculum7. Grade the student's submission against the provided rubric. Be precise and direct. Point at specific errors. Never flatter.

Output valid JSON only — no preamble, no markdown fences:

{
  "score": 0-100,
  "confidence": 0.0-1.0,
  "per_criterion": [
    { "criterion": "Criterion name", "score": 0-100, "note": "One sentence on what was right or wrong" }
  ],
  "summary": "Two-sentence overall assessment referencing specific passages or errors."
}`;

interface RubricCriterion {
  criterion: string;
  weight: number;
}

interface GradeResult {
  score: number;
  confidence: number;
  per_criterion: {
    criterion: string;
    score: number;
    note: string;
  }[];
  summary: string;
}

async function gradeSubmission(
  exerciseMd: string,
  rubric: RubricCriterion[],
  submissionText: string
): Promise<GradeResult | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — skipping grading");
    return null;
  }

  const rubricText = rubric
    .map((r, i) => `${i + 1}. ${r.criterion} (weight: ${r.weight})`)
    .join("\n");

  const userMessage = `Exercise:\n${exerciseMd}\n\nRubric:\n${rubricText}\n\nStudent submission:\n${submissionText}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: GRADER_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`Anthropic API error ${res.status}: ${err.slice(0, 200)}`);
      return null;
    }

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
    };
    const text = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON in grade response:", text.slice(0, 200));
      return null;
    }

    const result = JSON.parse(jsonMatch[0]) as GradeResult;

    // Validate score range
    result.score = Math.max(0, Math.min(100, result.score));
    result.confidence = Math.max(0, Math.min(1, result.confidence));

    return result;
  } catch (err) {
    console.error("Grading LLM call failed:", err);
    return null;
  }
}

// ── Email ──────────────────────────────────────────────────────────────────

async function sendGradeEmail(
  email: string,
  moduleTitle: string,
  score: number,
  summary: string
): Promise<void> {
  if (!POSTMARK_TOKEN) return;

  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_TOKEN,
    },
    body: JSON.stringify({
      From: "Curriculum7 <courses@reading-list.prin7r.com>",
      To: email,
      Subject: `Graded: ${moduleTitle} — ${score}%`,
      HtmlBody: `
        <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Graded</p>
          <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
          <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">${moduleTitle}: ${score}%</h1>
          <div style="margin: 16px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55;">${summary}</div>
        </div>
      `,
      TextBody: `${moduleTitle}: ${score}%\n\n${summary}`,
      MessageStream: "outbound",
    }),
  });
}

// ── Main loop ──────────────────────────────────────────────────────────────

async function processSubmission(
  sub: typeof schema.submissions.$inferSelect,
  retries: number = 0
): Promise<void> {
  console.log(`  Grading submission ${sub.id}...`);

  // Get the associated drip → module → rubric
  const [drip] = await db
    .select()
    .from(schema.drips)
    .where(eq(schema.drips.id, sub.dripId))
    .limit(1);

  if (!drip) {
    console.log(`  No drip found for submission ${sub.id}`);
    return;
  }

  const [mod] = await db
    .select()
    .from(schema.modules)
    .where(eq(schema.modules.id, drip.moduleId))
    .limit(1);

  if (!mod) {
    console.log(`  No module found for drip ${drip.id}`);
    return;
  }

  const rubric = (mod.rubric ?? []) as RubricCriterion[];
  if (rubric.length === 0) {
    console.log(`  No rubric for module ${mod.id}, skipping grade`);
    return;
  }

  const submissionText = sub.rawText ?? sub.artifactUrl ?? "";
  const result = await gradeSubmission(
    mod.exerciseMd ?? "",
    rubric,
    submissionText
  );

  if (!result) {
    if (retries < MAX_RETRIES) {
      console.log(`  Retrying submission ${sub.id} (${retries + 1}/${MAX_RETRIES})`);
      // Simple delay before retry
      await new Promise((r) => setTimeout(r, 5000));
      return processSubmission(sub, retries + 1);
    }
    console.log(`  Max retries reached for submission ${sub.id} — flagging`);
    await db.insert(schema.grades).values({
      submissionId: sub.id,
      status: "flagged",
      score: 0,
      confidence: 0,
    });
    return;
  }

  // Determine status
  const rubricCoverage =
    rubric.length > 0
      ? result.per_criterion.filter(
          (pc) =>
            rubric.some((r) => r.criterion === pc.criterion)
        ).length / rubric.length
      : 1;

  let gradeStatus: "auto" | "flagged" = "auto";
  if (result.confidence < 0.7 || rubricCoverage < 0.8) {
    gradeStatus = "flagged";
    console.log(
      `  Flagged: confidence=${result.confidence.toFixed(2)}, coverage=${rubricCoverage.toFixed(2)}`
    );
  }

  await db.insert(schema.grades).values({
    submissionId: sub.id,
    score: result.score,
    confidence: Math.round(result.confidence * 100),
    perCriterion: result.per_criterion,
    status: gradeStatus,
  });

  console.log(
    `  Graded: ${result.score}% (${gradeStatus})`
  );

  // Get user email for notification
  const [course] = await db
    .select({ userId: schema.courses.userId })
    .from(schema.courses)
    .innerJoin(schema.modules, eq(schema.modules.courseId, schema.courses.id))
    .where(eq(schema.modules.id, mod.id))
    .limit(1);

  if (course?.userId) {
    const [user] = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, course.userId))
      .limit(1);

    if (user?.email) {
      await sendGradeEmail(
        user.email,
        mod.title ?? `Module ${mod.idx}`,
        result.score,
        result.summary
      );
    }
  }
}

async function poll(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Checking for submissions to grade...`);

  try {
    // Find submissions without grades
    const ungraded = await db
      .select({
        submission: schema.submissions,
      })
      .from(schema.submissions)
      .leftJoin(
        schema.grades,
        eq(schema.grades.submissionId, schema.submissions.id)
      )
      .where(isNull(schema.grades.id))
      .limit(10);

    if (ungraded.length === 0) {
      return;
    }

    console.log(`  Found ${ungraded.length} submissions to grade`);

    for (const row of ungraded) {
      await processSubmission(row.submission);
    }
  } catch (err) {
    console.error("Poll error:", err);
  }
}

// ── Start ──────────────────────────────────────────────────────────────────

console.log("Curriculum7 Grade Worker starting...");
console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
console.log(`Anthropic: ${ANTHROPIC_API_KEY ? "configured" : "NOT CONFIGURED"}`);
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
