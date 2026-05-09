import { requiredEnv } from "./env";

const POSTMARK_TOKEN = () => requiredEnv("POSTMARK_SERVER_TOKEN");
const POSTMARK_API = "https://api.postmarkapp.com";

interface EmailPayload {
  To: string;
  Subject: string;
  HtmlBody: string;
  TextBody: string;
  MessageStream?: string;
}

async function sendWithPostmark(payload: EmailPayload): Promise<void> {
  const res = await fetch(`${POSTMARK_API}/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": POSTMARK_TOKEN(),
    },
    body: JSON.stringify({
      From: "Curriculum7 <courses@reading-list.prin7r.com>",
      ...payload,
      MessageStream: payload.MessageStream ?? "outbound",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Postmark error ${res.status}: ${body}`);
  }
}

// ── Magic Link (NextAuth) ─────────────────────────────────────────────────
export async function sendMagicLinkEmail(
  email: string,
  url: string
): Promise<void> {
  await sendWithPostmark({
    To: email,
    Subject: "Sign in to Curriculum7",
    HtmlBody: `
      <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7</p>
        <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
        <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">Sign in to your course</h1>
        <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55; margin: 16px 0 24px;">Click the link below to sign in to Curriculum7. This link expires in 24 hours and can only be used once.</p>
        <a href="${url}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A;">Sign in →</a>
        <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 15px; color: #8A6E45; margin-top: 24px;">If you did not request this email, you can safely ignore it.</p>
      </div>
    `,
    TextBody: `Sign in to Curriculum7: ${url}`,
  });
}

// ── Intake Link ───────────────────────────────────────────────────────────
export async function sendIntakeEmail(
  email: string,
  intakeUrl: string
): Promise<void> {
  await sendWithPostmark({
    To: email,
    Subject: "Your Curriculum7 course is ready",
    HtmlBody: `
      <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7</p>
        <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
        <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">Payment received — your course awaits</h1>
        <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55; margin: 16px 0 8px;">Thank you for your payment. Click below to tell us about your goal and current level. The link is valid for 7 days and can only be used once.</p>
        <a href="${intakeUrl}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A; margin-top: 16px;">Begin your course →</a>
        <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 15px; color: #8A6E45; margin-top: 24px;">If you have questions, reply to this email or write to hi@reading-list.prin7r.com.</p>
      </div>
    `,
    TextBody: `Your Curriculum7 course is ready. Visit ${intakeUrl} to set your goal and begin.`,
  });
}

// ── Syllabus Draft ────────────────────────────────────────────────────────
export async function sendSyllabusDraftEmail(
  email: string,
  courseId: string,
  approveUrl: string
): Promise<void> {
  await sendWithPostmark({
    To: email,
    Subject: "Your syllabus draft is ready",
    HtmlBody: `
      <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Syllabus draft</p>
        <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
        <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">Your syllabus draft</h1>
        <p style="font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55; margin: 16px 0 8px;">We have drafted a syllabus for your course. Review it and approve it to begin receiving weekly modules.</p>
        <a href="${approveUrl}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A; margin-top: 16px;">Review & approve →</a>
      </div>
    `,
    TextBody: `Your syllabus draft is ready. Review and approve it at ${approveUrl}`,
  });
}

// ── Drip ──────────────────────────────────────────────────────────────────
export async function sendDripEmail(
  email: string,
  moduleTitle: string,
  moduleIdx: number,
  nModules: number,
  readingMd: string,
  exerciseMd: string,
  submitUrl: string
): Promise<void> {
  await sendWithPostmark({
    To: email,
    Subject: `Module ${moduleIdx} of ${nModules}: ${moduleTitle}`,
    HtmlBody: `
      <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Module ${moduleIdx} of ${nModules}</p>
        <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
        <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">${moduleTitle}</h1>
        <div style="margin: 16px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55;">${readingMd}</div>
        <div style="margin: 16px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #3A2A1A; line-height: 1.55;">${exerciseMd}</div>
        <a href="${submitUrl}" style="display: inline-block; background: #3A2A1A; color: #FAFAF8; font-family: Inter, sans-serif; font-weight: 500; font-size: 14.5px; padding: 14px 22px; text-decoration: none; border: 1px solid #3A2A1A; margin-top: 16px;">Submit your work →</a>
      </div>
    `,
    TextBody: `Module ${moduleIdx} of ${nModules}: ${moduleTitle}\n\nReading: ${readingMd}\n\nExercise: ${exerciseMd}\n\nSubmit at: ${submitUrl}`,
  });
}

// ── Grade ─────────────────────────────────────────────────────────────────
export async function sendGradeEmail(
  email: string,
  moduleTitle: string,
  score: number,
  notes: string
): Promise<void> {
  await sendWithPostmark({
    To: email,
    Subject: `Graded: ${moduleTitle} — ${score}%`,
    HtmlBody: `
      <div style="font-family: 'EB Garamond', Georgia, serif; max-width: 560px; margin: 0 auto; background: #FAFAF8; padding: 40px 32px;">
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A6E45;">Curriculum7 · Graded</p>
        <div style="width: 36px; height: 2px; background: #A87E2C; margin: 16px 0;"></div>
        <h1 style="font-family: 'EB Garamond', Georgia, serif; font-weight: 600; font-size: 28px; color: #3A2A1A; letter-spacing: -0.012em; margin: 0;">${moduleTitle}: ${score}%</h1>
        <div style="margin: 16px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 17px; color: #5C4327; line-height: 1.55;">${notes}</div>
      </div>
    `,
    TextBody: `${moduleTitle}: ${score}%\n\n${notes}`,
  });
}
