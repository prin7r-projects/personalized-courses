import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, modules, drips } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isOperator) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const now = new Date();

  await db
    .update(courses)
    .set({
      status: "syllabus_approved",
      approvedAt: now,
    })
    .where(eq(courses.id, id));

  // Schedule drip 1
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

  return NextResponse.json({ approved_at: now.toISOString() });
}
