/**
 * Curriculum7 Syllabus Worker
 * Polls for draft courses every 5 minutes, generates syllabi via Claude 4.7,
 * persists modules, and emails the student.
 *
 * Usage: node --import tsx worker/syllabus.ts
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, isNull, and } from "drizzle-orm";
import * as schema from "../src/lib/db/schema.js";

// ── Config ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(client, { schema });

// ── LLM ────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an editorial syllabus designer for Curriculum7, a personalized-course studio. You build courses for one student at a time, based on their stated goal and current level.

Rules:
- Output valid JSON only — no preamble, no markdown fences.
- Create 6–10 modules (default 8). Each module is one week of study.
- Each module MUST name ≥1 citable reading: book + chapter, paper + section, or repository + file path. Be specific. "Klabnik & Nichols, The Rust Programming Language, ch. 4" is good. "the Rust book" is not.
- Each module includes an exercise that tests the reading.
- Each module includes a 3-criterion rubric for grading the exercise.
- The syllabus must respect the student's stated current level — do not assign readings they have already completed.
- If the student's level context names books they have started, reference where they left off.
- Tone: editorial, plain-spoken, no enthusiasm. Write to one person.

Output schema:
{
  "modules": [
    {
      "title": "Module title",
      "readings": [
        {
          "citation": "Author, Title, chapter/section",
          "source": "crossref" | "openlibrary" | "github" | "manual"
        }
      ],
      "exercise": "Exercise description in markdown",
      "rubric": [
        { "criterion": "Criterion name", "weight": 0.34 }
      ]
    }
  ]
}`;

interface Reading {
  citation: string;
  source: "crossref" | "openlibrary" | "github" | "manual";
}

interface RubricCriterion {
  criterion: string;
  weight: number;
}

interface GeneratedModule {
  title: string;
  readings: Reading[];
  exercise: string;
  rubric: RubricCriterion[];
}

interface GeneratedSyllabus {
  modules: GeneratedModule[];
}

async function generateSyllabus(
  goal: string,
  levelContext: string,
  locale: string
): Promise<GeneratedSyllabus | null> {
  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set — skipping LLM call");
    return null;
  }

  const userMessage = `Goal: ${goal}\n\nCurrent level: ${levelContext}\n\nPreferred language: ${locale}`;

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
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
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

    // Extract JSON from response (handle possible markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in LLM response:", text.slice(0, 200));
      return null;
    }

    return JSON.parse(jsonMatch[0]) as GeneratedSyllabus;
  } catch (err) {
    console.error("LLM call failed:", err);
    return null;
  }
}

// ── Email ──────────────────────────────────────────────────────────────────

async function sendSyllabusDraftEmail(
  email: string,
  courseId: string
): Promise<void> {
  const POSTMARK_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
  if (!POSTMARK_TOKEN) {
    console.warn("POSTMARK_SERVER_TOKEN not set — skipping email");
    return;
  }

  const approveUrl = `${process.env.AUTH_URL ?? "http://localhost:3100"}/dashboard`;

  await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_TOKEN,
    },
    body: JSON.stringify({
      From: "Curriculum7 <courses@reading-list.prin7r.com>",
      To: email,
      Subject: "Your syllabus draft is ready",
      HtmlBody: `
        <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Syllabus draft</p>
          <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
          <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">Your syllabus draft is ready</h1>
          <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55; margin: 16px 0 8px;">We have drafted a syllabus based on your goal and current level. Sign in to review and approve it.</p>
          <a href="${approveUrl}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A; margin-top: 16px;">Review & approve →</a>
        </div>
      `,
      TextBody: `Your syllabus draft is ready. Sign in to review it at ${approveUrl}`,
      MessageStream: "outbound",
    }),
  });
}

// ── Main loop ──────────────────────────────────────────────────────────────

async function processCourse(
  course: typeof schema.courses.$inferSelect
): Promise<void> {
  console.log(`Processing course ${course.id}: "${course.goal.slice(0, 60)}..."`);

  // Check if modules already exist
  const existingModules = await db
    .select({ id: schema.modules.id })
    .from(schema.modules)
    .where(eq(schema.modules.courseId, course.id))
    .limit(1);

  if (existingModules.length > 0) {
    console.log(`  Course ${course.id} already has modules, skipping`);
    return;
  }

  // Generate syllabus
  const syllabus = await generateSyllabus(
    course.goal,
    course.levelContext ?? "",
    course.locale ?? "en"
  );

  if (!syllabus || !syllabus.modules?.length) {
    console.log(`  Failed to generate syllabus for ${course.id}, will retry`);
    // Don't retry; keep as syllabus_pending — operator will see it
    return;
  }

  // Persist modules
  for (let i = 0; i < syllabus.modules.length; i++) {
    const mod = syllabus.modules[i];
    await db.insert(schema.modules).values({
      courseId: course.id,
      idx: i + 1,
      title: mod.title,
      readings: mod.readings,
      exerciseMd: mod.exercise,
      rubric: mod.rubric,
    });
  }

  // Update course status
  await db
    .update(schema.courses)
    .set({
      status: "syllabus_pending",
      nModules: syllabus.modules.length,
    })
    .where(eq(schema.courses.id, course.id));

  console.log(
    `  Generated ${syllabus.modules.length} modules for course ${course.id}`
  );

  // Find user email for notification
  if (course.userId) {
    const [user] = await db
      .select({ email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, course.userId))
      .limit(1);

    if (user?.email) {
      await sendSyllabusDraftEmail(user.email, course.id);
    }
  }
}

async function poll(): Promise<void> {
  console.log(`[${new Date().toISOString()}] Polling for draft courses...`);

  try {
    const draftCourses = await db
      .select()
      .from(schema.courses)
      .where(
        and(
          eq(schema.courses.status, "syllabus_pending"),
          // Only courses without modules
        )
      )
      .limit(5);

    // Filter to only those without modules
    const toProcess = [];
    for (const course of draftCourses) {
      const modCount = await db
        .select({ id: schema.modules.id })
        .from(schema.modules)
        .where(eq(schema.modules.courseId, course.id))
        .limit(1);
      if (modCount.length === 0) {
        toProcess.push(course);
      }
    }

    if (toProcess.length > 0) {
      console.log(`Found ${toProcess.length} courses to process`);
      for (const course of toProcess) {
        await processCourse(course);
      }
    } else {
      console.log("No draft courses to process");
    }
  } catch (err) {
    console.error("Poll error:", err);
  }
}

// ── Start ──────────────────────────────────────────────────────────────────

console.log("Curriculum7 Syllabus Worker starting...");
console.log(`Poll interval: ${POLL_INTERVAL_MS / 1000}s`);
console.log(
  `Anthropic: ${ANTHROPIC_API_KEY ? "configured" : "NOT CONFIGURED"}`
);

// Initial poll, then interval
poll();
setInterval(poll, POLL_INTERVAL_MS);

// Graceful shutdown
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
