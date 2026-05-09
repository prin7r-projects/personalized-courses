import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const intakeSchema = z.object({
  course_id: z.string().uuid().optional(),
  goal: z.string().min(1).max(200),
  level_context: z.string().min(1).max(800),
  locale: z.enum(["en", "es", "pt"]).default("en"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  const { course_id, goal, level_context, locale } = parsed.data;

  // If course_id provided, update existing (verify ownership)
  if (course_id) {
    const [existing] = await db
      .select({ id: courses.id })
      .from(courses)
      .where(and(eq(courses.id, course_id), eq(courses.userId!, session.user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
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
      userId: session.user.id,
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
