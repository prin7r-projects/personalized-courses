import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, courses, drips, modules } from "@/lib/db";
import { eq, and, gte, isNull } from "drizzle-orm";
import { z } from "zod";

const pauseSchema = z.object({
  days: z.number().int().min(1).max(90),
});

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

  if (course.status !== "active") {
    return NextResponse.json(
      { error: "course not active" },
      { status: 409 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = pauseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { days } = parsed.data;
  const now = new Date();
  const pausedUntil = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Mark course paused
  await db
    .update(courses)
    .set({ status: "paused" })
    .where(eq(courses.id, id));

  // Shift all unsent drips by `days`
  const unsentDrips = await db
    .select({ id: drips.id, scheduledAt: drips.scheduledAt })
    .from(drips)
    .innerJoin(modules, eq(modules.id, drips.moduleId))
    .where(
      and(
        eq(modules.courseId, id),
        isNull(drips.sentAt),
        gte(drips.scheduledAt!, now)
      )
    );

  for (const drip of unsentDrips) {
    if (drip.scheduledAt) {
      const newTime = new Date(
        drip.scheduledAt.getTime() + days * 24 * 60 * 60 * 1000
      );
      await db
        .update(drips)
        .set({ scheduledAt: newTime })
        .where(eq(drips.id, drip.id));
    }
  }

  return NextResponse.json({ paused_until: pausedUntil.toISOString() });
}
