import { NextRequest, NextResponse } from "next/server";
import { redeemIntakeToken } from "@/lib/intake-token";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { token } = body as { token?: string };
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 });
  }

  const result = await redeemIntakeToken(token);
  if (!result) {
    return NextResponse.json(
      { error: "expired or already used" },
      { status: 410 }
    );
  }

  // Return the email + course_id so the client can redirect to sign-in
  return NextResponse.json({
    email: result.email,
    course_id: result.courseId,
    redirect: `/login?email=${encodeURIComponent(result.email)}&course_id=${result.courseId}`,
  });
}
