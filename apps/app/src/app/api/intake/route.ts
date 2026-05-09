import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, intakeTokens } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

const intakeSchema = z.object({
  course_id: z.string().uuid().optional(),
  intake_token: z.string().optional(),
  goal: z.string().min(1).max(200),
  level_context: z.string().min(1).max(800),
  locale: z.enum(["en", "es", "pt"]).default("en"),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = intakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { course_id, intake_token, goal, level_context, locale } = parsed.data;

  // Auth via session OR intake token
  let userId: string | null = null;

  // Try session auth first
  const session = await auth();
  if (session?.user?.id) {
    userId = session.user.id;
  }

  // Try intake token auth
  if (!userId && intake_token) {
    const now = new Date();
    const [tokenRecord] = await db
      .select()
      .from(intakeTokens)
      .where(
        and(
          eq(intakeTokens.token, intake_token),
          isNull(intakeTokens.usedAt)
        )
      )
      .limit(1);

    if (
      tokenRecord &&
      new Date(tokenRecord.expiresAt) > now
    ) {
      // Token is valid — use the email as identity
      // Mark token as used
      await db
        .update(intakeTokens)
        .set({ usedAt: now })
        .where(eq(intakeTokens.id, tokenRecord.id));

      // For now, use a placeholder userId — actual account is created on first login
      // The course is linked via the intake token's email
    }
  }

  if (!userId && !intake_token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // If course_id provided, update existing (verify ownership)
  if (course_id) {
    if (userId) {
      const [existing] = await db
        .select({ id: courses.id })
        .from(courses)
        .where(and(eq(courses.id, course_id), eq(courses.userId!, userId)))
        .limit(1);

      if (!existing) {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
    }

    await db
      .update(courses)
      .set({
        goal,
        levelContext: level_context,
        locale,
        status: "syllabus_pending",
      })
      .where(eq(courses.id, course_id));

    return NextResponse.json({ course_id, status: "syllabus_pending" });
  }

  // Create new course
  const [course] = await db
    .insert(courses)
    .values({
      userId: userId ?? undefined,
      goal,
      levelContext: level_context,
      locale,
      status: "syllabus_pending",
    })
    .returning({ id: courses.id });

  return NextResponse.json({
    course_id: course.id,
    status: "syllabus_pending",
  });
}
