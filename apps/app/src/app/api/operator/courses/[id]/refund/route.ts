import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, drips, modules, orders, auditLog } from "@/lib/db";
import { eq, and, gte } from "drizzle-orm";

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

  if (course.status === "refunded") {
    return NextResponse.json({ error: "already refunded" }, { status: 409 });
  }

  // Check drip count — block refund if >3 drips have been sent
  const sentDrips = await db
    .select({ id: drips.id })
    .from(drips)
    .innerJoin(modules, eq(modules.id, drips.moduleId))
    .where(
      and(
        eq(modules.courseId, id),
        eq(drips.status, "sent")
      )
    );

  if (sentDrips.length > 3) {
    return NextResponse.json(
      {
        error: "refund blocked",
        reason: `More than 3 drips sent (${sentDrips.length}). Operator override required.`,
      },
      { status: 409 }
    );
  }

  const now = new Date();

  // Cancel remaining unsent drips for this course
  const courseModuleIds = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.courseId, id));

  for (const mod of courseModuleIds) {
    await db
      .update(drips)
      .set({ status: "delivery_blocked" })
      .where(
        and(
          eq(drips.moduleId, mod.id),
          eq(drips.status, "pending")
        )
      );
  }

  // Mark course refunded
  await db
    .update(courses)
    .set({ status: "refunded" })
    .where(eq(courses.id, id));

  // Update order status
  await db
    .update(orders)
    .set({ status: "refunded" })
    .where(eq(orders.courseId, id));

  // Audit log
  await db.insert(auditLog).values({
    action: "refund",
    actorId: session.user.id,
    targetType: "course",
    targetId: id,
    details: {
      previousStatus: course.status,
      sentDrips: sentDrips.length,
    },
  });

  return NextResponse.json({
    status: "refunded",
    audited: true,
  });
}
