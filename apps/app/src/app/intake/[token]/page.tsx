import { redeemIntakeToken } from "@/lib/intake-token";
import { redirect } from "next/navigation";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await redeemIntakeToken(token);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="note-frame p-8 max-w-md text-center">
          <p className="kicker">Curriculum7</p>
          <div className="eyebrow-rule mx-auto" />
          <h1 className="font-display font-semibold text-[28px] tracking-tightest text-walnut mt-4">
            Link expired or already used
          </h1>
          <p className="mt-4 font-serif text-[17px] text-oak leading-relaxed">
            Each intake link can only be used once and expires after 7 days. If
            you need a new link, please contact{" "}
            <a
              href="mailto:hi@reading-list.prin7r.com"
              className="text-gilt underline underline-offset-4"
            >
              hi@reading-list.prin7r.com
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login with the email pre-filled and course_id
  redirect(
    `/login?email=${encodeURIComponent(result.email)}&course_id=${result.courseId}`
  );
}
