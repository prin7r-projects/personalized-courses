"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function IntakeFormPage() {
  const router = useRouter();
  const [intakeToken, setIntakeToken] = useState<string>("");
  const [goal, setGoal] = useState("");
  const [levelContext, setLevelContext] = useState("");
  const [locale, setLocale] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "done" | "expired">("form");

  // Extract token from URL path
  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const tokenFromPath = pathParts[pathParts.length - 1];
    if (tokenFromPath && tokenFromPath !== "intake") {
      setIntakeToken(tokenFromPath);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intake_token: intakeToken,
          goal,
          level_context: levelContext,
          locale,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError("This intake link has expired or was already used.");
          setStep("expired");
          return;
        }
        setError(
          data.error ?? "Something went wrong. Please try again."
        );
        setLoading(false);
        return;
      }

      setStep("done");
    } catch {
      setError("Could not submit. Please contact hi@reading-list.prin7r.com.");
    }
    setLoading(false);
  }

  if (step === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="note-frame p-8 max-w-md text-center">
          <p className="kicker">Curriculum7</p>
          <div className="eyebrow-rule mx-auto" />
          <h1 className="font-display font-semibold text-[28px] tracking-tightest text-walnut mt-4">
            Link expired or already used
          </h1>
          <p className="mt-4 font-serif text-[17px] text-oak leading-relaxed">
            Each intake link can only be used once and expires after 7 days.
          </p>
          <p className="mt-3 font-serif text-[15px] text-sepia">
            Contact{" "}
            <a
              href="mailto:hi@reading-list.prin7r.com"
              className="text-gilt underline underline-offset-4"
            >
              hi@reading-list.prin7r.com
            </a>{" "}
            for a new link.
          </p>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="note-frame p-8 max-w-md text-center">
          <p className="kicker">Curriculum7</p>
          <div className="eyebrow-rule mx-auto" />
          <h1 className="font-display font-semibold text-[28px] tracking-tightest text-walnut mt-4">
            Intake received
          </h1>
          <p className="mt-4 font-serif text-[17px] text-oak leading-relaxed">
            We have your goal and your current level. Your syllabus draft will
            arrive within 24 hours.
          </p>
          <p className="mt-4 font-serif text-[15px] text-sepia">
            We sent a sign-in link to your email. Use it to track your course
            progress.
          </p>
          <div className="mt-6">
            <span className="ink-dot mr-2" />
            <span className="kicker">Syllabus being drafted</span>
          </div>
        </div>
      </div>
    );
  }

  if (!intakeToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="font-serif text-[17px] text-oak">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="note-frame p-8">
          <p className="kicker">Curriculum7 · Intake</p>
          <div className="eyebrow-rule" />
          <h1 className="font-display font-semibold text-[28px] tracking-tightest leading-tight text-walnut">
            Tell us about your course
          </h1>
          <p className="mt-4 font-serif text-[17px] text-oak leading-relaxed">
            Your answers shape the syllabus. Be specific — name the books you
            have tried, the topics you know, the gaps that frustrate you.
          </p>

          {error && (
            <div className="mt-6 p-4 bg-vellum border border-marginalia">
              <p className="font-serif text-[15px] text-marginalia">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="goal">Your goal in one sentence</label>
              <p className="font-serif text-[13px] text-sepia mb-2">
                e.g. &ldquo;Ship a Rust CLI for an internal task-runner by end
                of June.&rdquo;
              </p>
              <input
                id="goal"
                type="text"
                required
                maxLength={200}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you want to be able to do?"
              />
              <p className="font-mono text-[10px] text-cloud-dark mt-1 text-right">
                {goal.length}/200
              </p>
            </div>

            <div>
              <label htmlFor="level">
                Your current level (two paragraphs)
              </label>
              <p className="font-serif text-[13px] text-sepia mb-2">
                What you already know, what you have tried, where you got stuck.
                Be honest — the syllabus is sharper when the gaps are clear.
              </p>
              <textarea
                id="level"
                required
                maxLength={800}
                rows={6}
                value={levelContext}
                onChange={(e) => setLevelContext(e.target.value)}
                placeholder="I have read chapters 1–3 but got stuck on the borrow checker. I can write Python fluently but Rust's ownership model is alien. I have two hours per weekday."
                className="w-full bg-parchment border border-walnut/25 text-walnut font-serif text-[17px] px-4 py-3 focus:outline-none focus:border-gilt resize-y"
                style={{ borderRadius: 0 }}
              />
              <p className="font-mono text-[10px] text-cloud-dark mt-1 text-right">
                {levelContext.length}/800
              </p>
            </div>

            <div>
              <label htmlFor="locale">Language</label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full bg-parchment border border-walnut/25 text-walnut font-serif text-[17px] px-4 py-3 focus:outline-none focus:border-gilt"
                style={{ borderRadius: 0 }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn w-full">
              {loading ? "Submitting…" : "Submit intake form"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
