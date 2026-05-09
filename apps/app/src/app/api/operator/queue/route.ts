import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, modules, drips } from "@/lib/db";
import { eq, isNull, lte, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isOperator) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Operator queue: syllabi pending approval, sorted by deadline
  const now = new Date();
  const pendingCourses = await db
    .select({
      courseId: courses.id,
      goal: courses.goal,
      levelContext: courses.levelContext,
      status: courses.status,
      createdAt: courses.createdAt,
      moduleCount: modules.id,
    })
    .from(courses)
    .leftJoin(modules, eq(modules.courseId, courses.id))
    .where(
      and(
        eq(courses.status, "syllabus_pending"),
        lte(courses.createdAt, now)
      )
    )
    .orderBy(courses.createdAt);

  // Deduplicate by courseId (left join creates duplicates)
  const seen = new Set<string>();
  const queue = [];
  for (const row of pendingCourses) {
    if (!seen.has(row.courseId)) {
      seen.add(row.courseId);
      queue.push({
        course_id: row.courseId,
        goal: row.goal,
        level_context: row.levelContext,
        status: row.status,
        created_at: row.createdAt,
        deadline: new Date(
          (row.createdAt ?? new Date()).getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }
  }

  // Also include flagged grades
  const flaggedSubmissions = await db
    .select({
      courseId: courses.id,
      moduleIdx: modules.idx,
      moduleTitle: modules.title,
      submissionId: drips.id,
    })
    .from(drips)
    .innerJoin(modules, eq(modules.id, drips.moduleId))
    .innerJoin(courses, eq(courses.id, modules.courseId))
    .where(eq(drips.status, "delivery_blocked"))
    .limit(20);

  return NextResponse.json({
    queue,
    flagged: flaggedSubmissions,
  });
}
