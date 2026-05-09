import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, submissions } from "@/lib/db";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Accept multipart or JSON with raw_text
  const contentType = req.headers.get("content-type") ?? "";

  let dripId: string;
  let rawText: string | undefined;
  let artifactUrl: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    dripId = formData.get("drip_id") as string;
    const file = formData.get("file") as File | null;
    if (file) {
      // In Phase 4, upload to Backblaze B2; for now store filename
      artifactUrl = `submissions://${file.name}`;
    }
    rawText = (formData.get("raw_text") as string) ?? undefined;
  } else {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid json" }, { status: 400 });
    }
    const parsed = z
      .object({ drip_id: z.string().uuid(), raw_text: z.string().optional() })
      .safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    dripId = parsed.data.drip_id;
    rawText = parsed.data.raw_text;
  }

  if (!dripId) {
    return NextResponse.json({ error: "drip_id required" }, { status: 400 });
  }

  const [submission] = await db
    .insert(submissions)
    .values({
      dripId,
      rawText,
      artifactUrl,
    })
    .returning({ id: submissions.id });

  return NextResponse.json({ submission_id: submission.id });
}
