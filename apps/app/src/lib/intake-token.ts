import { createHmac, randomBytes } from "crypto";
import { db, intakeTokens } from "@/lib/db";
import { eq, and, isNull } from "drizzle-orm";

const INTAKE_SECRET = () =>
  process.env.AUTH_SECRET ?? "curriculum7-intake-fallback";

export function generateIntakeToken(email: string, courseId: string): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${email}:${courseId}:${nonce}`;
  const hmac = createHmac("sha256", INTAKE_SECRET())
    .update(payload)
    .digest("hex");
  return `${nonce}.${hmac}`;
}

export function verifyIntakeToken(token: string): {
  email: string;
  courseId: string;
} | null {
  const [nonce, hmac] = token.split(".");
  if (!nonce || !hmac) return null;

  // We need the db record to verify; the HMAC alone isn't enough for lookup
  return null; // Actual verification is done against the DB
}

export async function storeIntakeToken(
  email: string,
  courseId: string
): Promise<string> {
  const token = generateIntakeToken(email, courseId);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(intakeTokens).values({
    token,
    email,
    courseId,
    expiresAt,
  });

  return token;
}

export async function redeemIntakeToken(
  token: string
): Promise<{ email: string; courseId: string } | null> {
  const now = new Date();

  const record = await db
    .select()
    .from(intakeTokens)
    .where(
      and(
        eq(intakeTokens.token, token),
        isNull(intakeTokens.usedAt),
      )
    )
    .limit(1);

  if (record.length === 0) return null;

  const t = record[0];
  if (new Date(t.expiresAt) < now) {
    // Expired — mark as used so it can't be retried
    await db
      .update(intakeTokens)
      .set({ usedAt: now })
      .where(eq(intakeTokens.id, t.id));
    return null;
  }

  // Mark as used
  await db
    .update(intakeTokens)
    .set({ usedAt: now })
    .where(eq(intakeTokens.id, t.id));

  return { email: t.email, courseId: t.courseId ?? "" };
}
