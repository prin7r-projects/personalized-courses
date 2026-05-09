import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, modules } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const replaceSchema = z.object({
  module_idx: z.number().int().min(1),
  reading_idx: z.number().int().min(0),
  new_reading: z.object({
    citation: z.string().min(1),
    source: z.enum(["crossref", "openlibrary", "github", "manual"]),
    url: z.string().optional(),
  }),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isOperator) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = replaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { module_idx, reading_idx, new_reading } = parsed.data;

  // Find the module
  const [mod] = await db
    .select()
    .from(modules)
    .where(
      and(eq(modules.courseId, id), eq(modules.idx, module_idx))
    )
    .limit(1);

  if (!mod) {
    return NextResponse.json({ error: "module not found" }, { status: 404 });
  }

  // Update the reading
  const readings = (mod.readings ?? []) as any[];
  if (reading_idx < 0 || reading_idx >= readings.length) {
    return NextResponse.json(
      { error: "reading_idx out of range" },
      { status: 400 }
    );
  }

  readings[reading_idx] = {
    ...new_reading,
    verifiedAt: new Date().toISOString(), // operator replacements are pre-verified
  };

  await db
    .update(modules)
    .set({ readings })
    .where(eq(modules.id, mod.id));

  return NextResponse.json({
    module_id: mod.id,
    replaced: reading_idx,
    reading: readings[reading_idx],
  });
}
