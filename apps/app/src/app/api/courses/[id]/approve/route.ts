import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, modules, drips } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { sendSyllabusDraftEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, id), eq(courses.userId!, session.user.id)))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  if (course.status !== "syllabus_pending") {
    return NextResponse.json(
      { error: "course not in syllabus_pending state" },
      { status: 409 }
    );
  }

  const now = new Date();

  // Mark course as approved
  await db
    .update(courses)
    .set({ status: "syllabus_approved", approvedAt: now })
    .where(eq(courses.id, id));

  // Schedule drip 1 at now + 24h
  const [firstModule] = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id))
    .orderBy(modules.idx)
    .limit(1);

  if (firstModule) {
    const dripTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await db.insert(drips).values({
      moduleId: firstModule.id,
      scheduledAt: dripTime,
      status: "pending",
    });
  }

  return NextResponse.json({ status: "syllabus_approved" });
}
