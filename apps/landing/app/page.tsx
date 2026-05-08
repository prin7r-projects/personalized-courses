import Link from "next/link";
import { ButtonAnchor } from "@/app/components/ui/button";
import { PricingCta } from "@/app/pricing-cta";

/**
 * [READING_LIST_LANDING] Single-page private-tutor's-notebook landing.
 *
 * Sections:
 *   #masthead → #hero (with the syllabus-of-one card) → #how (4-step) →
 *   #sample (a real-looking syllabus preview for "ship a Rust CLI in 30 days")
 *   → #pricing (three tiers, NOWPayments CTA on each) → #voices (testimonials)
 *   → #faq → #footer
 *
 * Copy is sourced from /docs/08-marketing-strategy.md and /docs/07-sales-strategy.md.
 * Visual tokens are sourced from /DESIGN.md sections 4-6.
 * NOWPayments wiring lives in /apps/landing/lib/nowpayments.ts and the two
 * API routes under /api/checkout and /api/webhooks.
 */

export default function Page() {
  return (
    <main className="bg-parchment text-walnut">
      <Masthead />
      <Hero />
      <HowItWorks />
      <SampleSyllabus />
      <Pricing />
      <Voices />
      <Faq />
      <Footer />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Masthead                                                                   */
/* -------------------------------------------------------------------------- */

function Masthead() {
  return (
    <header
      id="masthead"
      className="border-b border-walnut/15 bg-parchment sticky top-0 z-30 shadow-page"
    >
      <div className="mx-auto max-w-prose px-6 md:px-10 py-4 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7" aria-label="primary">
          <a href="#how" className="kicker hover:text-walnut transition-colors">How it works</a>
          <a href="#sample" className="kicker hover:text-walnut transition-colors">Sample syllabus</a>
          <a href="#pricing" className="kicker hover:text-walnut transition-colors">Pricing</a>
          <a href="#faq" className="kicker hover:text-walnut transition-colors">FAQ</a>
          <ButtonAnchor href="#pricing" className="ml-2">Begin a course →</ButtonAnchor>
        </nav>
        <div className="md:hidden">
          <ButtonAnchor href="#pricing" size="sm">Pricing →</ButtonAnchor>
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <a href="#hero" className="flex items-center gap-3" aria-label="Reading List — home">
      <span aria-hidden="true" className="inline-block">
        <svg width="34" height="34" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="64" height="64" rx="2" fill="#3A2A1A" />
          <text
            x="32"
            y="44"
            textAnchor="middle"
            fontFamily="EB Garamond, Garamond, Georgia, serif"
            fontWeight="600"
            fontSize="34"
            fill="#F4ECD8"
          >
            RL
          </text>
          <rect x="14" y="52" width="36" height="2" fill="#A87E2C" />
        </svg>
      </span>
      <span className="font-mono text-[12px] tracking-ledger uppercase text-walnut">
        reading list<span className="text-marginalia">.</span>
      </span>
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero — the syllabus-of-one is the hero                                     */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section id="hero" className="grain section">
      <div className="mx-auto max-w-prose px-6 md:px-10 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <p className="kicker">A private tutor's reading list · est. 2026</p>
            <span className="eyebrow-rule" aria-hidden="true" />
            <h1 className="font-display font-semibold text-[52px] md:text-[80px] lg:text-[96px] leading-[1.02] tracking-tightest text-walnut">
              A syllabus of one.
              <br />
              <span className="serif-italic text-oak">Built around the thing</span> you actually want to learn.
            </h1>
            <p className="mt-8 max-w-2xl font-display text-[20px] md:text-[23px] text-oak leading-snug">
              Tell us your goal in one sentence and your current level in two.
              Reading List answers with a personalized course — readings, videos,
              exercises, evaluations — generated for you and dripped at a pace
              that respects how an adult actually studies. No 47-hour mega-modules.
              No certificate-chasing. One page at a time.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 items-center">
              <ButtonAnchor href="#pricing" size="lg" aria-label="See pricing tiers">
                Begin a course →
              </ButtonAnchor>
              <ButtonAnchor
                href="#sample"
                size="lg"
                variant="ghost"
                aria-label="See a sample syllabus"
              >
                Read a sample syllabus
              </ButtonAnchor>
            </div>
            <p className="mt-6 font-mono text-[11px] tracking-ledger uppercase text-sepia">
              Crypto checkout via NOWPayments · USDT / USDC · cancel any time
            </p>
          </div>

          <aside
            className="lg:col-span-5"
            aria-label="A sample syllabus card built around a real goal"
          >
            <SyllabusOfOne />
          </aside>
        </div>
      </div>
    </section>
  );
}

/**
 * The syllabus-of-one card. This is the marquee element of the brand —
 * it's a real-looking card showing a personalized course built around a
 * specific goal. Treated as decorative for screen readers (the same
 * content is in the visible sample-syllabus section below).
 */
function SyllabusOfOne() {
  return (
    <div className="syllabus-card p-8 md:p-9">
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10.5px] tracking-ledger uppercase text-sepia">
          Course no. 0241 · for one student
        </p>
        <p className="font-mono text-[10.5px] tracking-ledger uppercase text-gilt">
          dripping
        </p>
      </div>
      <div className="gilt-rule mt-4" aria-hidden="true" />

      <p className="mt-5 kicker">Goal</p>
      <p className="mt-2 font-display text-[26px] md:text-[28px] leading-snug text-walnut tracking-tightest">
        Ship a working Rust command-line tool, with tests, in 30 days.
      </p>

      <p className="mt-6 kicker">Current level</p>
      <p className="mt-2 font-display italic text-[18px] text-oak leading-snug">
        "Ten years of Python. Read half the Rust book once. Got stuck at lifetimes."
      </p>

      <div className="mt-8 grid gap-4">
        <Lesson
          n="01"
          title="Ownership in five lessons"
          body="Read: Klabnik §4. Exercises: 6 borrow-checker drills. Eval: rewrite a Python class as a Rust struct."
          tag="this week"
        />
        <Lesson
          n="02"
          title="Lifetimes without panic"
          body="Watch: Crichton, 22m. Read: Nichols ch. 10. Exercises: annotate 4 functions. Eval: identify the lifetime in a small parser."
          tag="next week"
        />
        <Lesson
          n="03"
          title="Argv to clap to a real binary"
          body="Read: clap derive guide. Build: a one-flag echo. Build: a two-flag word-count. Eval: ship to crates.io as a personal tool."
          tag="week 3"
        />
        <Lesson
          n="04"
          title="Tests, errors, release"
          body="Read: anyhow + thiserror. Tests: unit + integration. Build: GitHub Actions release. Eval: 30-day demo to your tutor."
          tag="week 4"
        />
      </div>

      <div className="mt-8 flex items-end justify-between">
        <p className="margin-note">— actually read this one</p>
        <p className="font-mono text-[10.5px] tracking-ledger uppercase text-sepia">
          dripped Mondays · 09:00 your time
        </p>
      </div>
    </div>
  );
}

function Lesson({
  n,
  title,
  body,
  tag
}: {
  n: string;
  title: string;
  body: string;
  tag: string;
}) {
  return (
    <div className="border-t border-walnut/15 pt-4">
      <div className="flex items-baseline gap-3">
        <span className="font-display font-semibold text-[28px] leading-none tracking-tightest text-gilt">
          {n}
        </span>
        <p className="font-display font-semibold text-[18px] leading-tight tracking-tightest text-walnut">
          {title}
        </p>
        <span className="ml-auto font-mono text-[10px] tracking-ledger uppercase text-sepia">
          {tag}
        </span>
      </div>
      <p className="mt-2 ml-[44px] font-display text-[15.5px] text-oak leading-snug">
        {body}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* How it works                                                               */
/* -------------------------------------------------------------------------- */

type Step = { num: string; title: string; body: string; aside: string };

function HowItWorks() {
  const steps: Step[] = [
    {
      num: "01",
      title: "Intake",
      body:
        "You write one sentence about the goal you want to reach in 30 / 60 / 90 days, and a short paragraph about what you already know. Five minutes. No quizzes, no bouncing through skill trees.",
      aside: "“I want to ship a Rust CLI by end of June.”"
    },
    {
      num: "02",
      title: "Syllabus",
      body:
        "You receive a personalized syllabus on a single page within an hour. Modules, weekly cadence, named readings, exercises, evaluations. You read it, you push back, we revise. Then we lock it.",
      aside: "“Drop module 06. I already know the BorrowChecker.”"
    },
    {
      num: "03",
      title: "Drip",
      body:
        "Every Monday at 09:00 your local time, the next module arrives in your inbox. One reading, one video, one exercise, one self-evaluation. No dashboards. No streaks. No homework piles.",
      aside: "“Same envelope, same chair, same Monday morning.”"
    },
    {
      num: "04",
      title: "Evaluations",
      body:
        "At the end of each module you submit a small piece of work (a paragraph, a function, a recording). The course grades it against the rubric you signed off on at intake — and rewrites the next module if your level shifted.",
      aside: "“The course adapts to you, not the other way round.”"
    }
  ];

  return (
    <section id="how" className="section">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="The arrangement"
          title="How a course is made for you."
          lede="Four small steps. The interesting one is the syllabus, because the syllabus is the product. The drip is the discipline. The evaluation is the truth."
        />

        <ol
          className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-walnut/15 border border-walnut/15"
          aria-label="Four-step intake-to-evaluation arrangement"
        >
          {steps.map((step) => (
            <li key={step.num} className="bg-parchment p-6 md:p-7 flex flex-col gap-3 min-h-[280px]">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-semibold text-[64px] leading-none tracking-tightest text-gilt">
                  {step.num}
                </span>
              </div>
              <h3 className="font-display font-semibold text-[24px] tracking-tightest leading-tight">
                {step.title}
              </h3>
              <p className="text-[15.5px] text-oak leading-snug">{step.body}</p>
              <p className="mt-auto pt-3 border-t border-walnut/15 handwritten">
                {step.aside}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sample syllabus — a real-looking course preview                            */
/* -------------------------------------------------------------------------- */

function SampleSyllabus() {
  return (
    <section id="sample" className="section bg-vellum/40">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="A worked example"
          title="“Ship a Rust CLI in 30 days.”"
          lede="This is the syllabus the system would have produced for the student in the hero card. It is not a template — every byte of it was generated against the goal and the level. We change the goal, the syllabus changes."
        />

        <div className="mt-14 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 note-frame p-7 md:p-9">
            <p className="kicker">Course no. 0241</p>
            <h3 className="mt-3 font-display font-semibold text-[34px] md:text-[40px] tracking-tightest leading-tight">
              Rust CLI · 4 modules · 30 days
            </h3>
            <p className="mt-3 font-display italic text-[17px] text-oak">
              For: a working programmer with ten years of Python who has read half
              the Rust book and lost the borrow checker by chapter five.
            </p>
            <div className="gilt-rule mt-6" aria-hidden="true" />

            <Module
              n="01"
              week="Mon Jun 1 — Sun Jun 7"
              title="Ownership, in five lessons"
              readings={["Klabnik & Nichols, ch. 4 (full)", "Jon Gjengset talk, “Crust of Rust: Lifetime Annotations” (32 min)"]}
              exercises={["Rewrite a 30-line Python class as a Rust struct with methods", "Six borrow-checker drills (we provide the failing programs)"]}
              evaluation="Submit your struct + a one-paragraph note on what the borrow checker rejected."
            />
            <Module
              n="02"
              week="Mon Jun 8 — Sun Jun 14"
              title="Lifetimes without panic"
              readings={["Klabnik & Nichols, ch. 10", "Yoshua Wuyts, “The Two Lifetime Annotations” (blog)"]}
              exercises={["Annotate four small functions you wrote last week", "Implement a tiny string-slice splitter that compiles"]}
              evaluation="Identify the lifetime in a 60-line parser and explain it in one paragraph."
            />
            <Module
              n="03"
              week="Mon Jun 15 — Sun Jun 21"
              title="Argv to clap to a real binary"
              readings={["clap-rs derive guide", "Pascal Hertleif, “CLI WG book”, ch. 1–3"]}
              exercises={["Build a one-flag `echo` you would actually use", "Build a two-flag `wc` and run it on a real file"]}
              evaluation="Push your CLI to a personal GitHub repo with a 6-line README."
            />
            <Module
              n="04"
              week="Mon Jun 22 — Mon Jun 30"
              title="Tests, errors, release"
              readings={["Yoshua Wuyts, “anyhow vs thiserror”", "GitHub Actions for Rust binaries (workflow excerpt)"]}
              exercises={["Add three unit tests and one integration test", "Wire a release workflow that publishes a tagged binary"]}
              evaluation="30-day demo: 5 minutes, in writing, to your tutor. We grade against the rubric you signed at intake."
            />

            <p className="mt-8 font-display italic text-[17px] text-oak">
              You finish with a working binary, a public repo, four signed evaluations,
              and a body of writing about your own learning that you can re-read in a year.
            </p>
          </div>

          <aside className="lg:col-span-5 flex flex-col gap-6">
            <div className="syllabus-card p-7">
              <p className="kicker">What you would have got elsewhere</p>
              <ul className="mt-4 space-y-3 font-display text-[16.5px] text-oak leading-snug">
                <li>— A 47-hour video course built for someone who has never opened a terminal.</li>
                <li>— A bootcamp cohort of 200, asynchronous, with a single grader for all.</li>
                <li>— A YouTube playlist you bookmark and never finish.</li>
                <li>— A Coursera certificate that says less than the repo you would have built.</li>
              </ul>
            </div>
            <div className="note-frame p-7">
              <p className="kicker">Ground rules</p>
              <ul className="mt-4 space-y-3 font-display text-[16.5px] text-oak leading-snug">
                <li>— Every reading is named. No “explore the topic”.</li>
                <li>— Every exercise has a rubric you saw at intake.</li>
                <li>— Every module ends in something you can show another human.</li>
                <li>— You can pause the drip. You can rewrite the syllabus. You can stop.</li>
              </ul>
              <p className="mt-6 handwritten">— a course that finishes with you, not on you.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Module({
  n,
  week,
  title,
  readings,
  exercises,
  evaluation
}: {
  n: string;
  week: string;
  title: string;
  readings: string[];
  exercises: string[];
  evaluation: string;
}) {
  return (
    <div className="mt-7 border-t border-walnut/15 pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display font-semibold text-[22px] tracking-tightest text-walnut">
          <span className="text-gilt">M{n}</span> · {title}
        </p>
        <p className="font-mono text-[10.5px] tracking-ledger uppercase text-sepia whitespace-nowrap">
          {week}
        </p>
      </div>
      <dl className="mt-3 grid sm:grid-cols-3 gap-x-6 gap-y-3">
        <div>
          <dt className="kicker">Readings</dt>
          <dd className="mt-2 font-display text-[15.5px] text-oak leading-snug">
            {readings.map((r) => (
              <div key={r} className="mt-1">— {r}</div>
            ))}
          </dd>
        </div>
        <div>
          <dt className="kicker">Exercises</dt>
          <dd className="mt-2 font-display text-[15.5px] text-oak leading-snug">
            {exercises.map((e) => (
              <div key={e} className="mt-1">— {e}</div>
            ))}
          </dd>
        </div>
        <div>
          <dt className="kicker">Evaluation</dt>
          <dd className="mt-2 font-display text-[15.5px] text-oak leading-snug">— {evaluation}</dd>
        </div>
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                    */
/* -------------------------------------------------------------------------- */

type Tier = {
  id: "single" | "subscription" | "coached";
  name: string;
  price: number;
  cadence: string;
  blurb: string;
  features: string[];
  featured?: boolean;
};

function Pricing() {
  const tiers: Tier[] = [
    {
      id: "single",
      name: "A single course",
      price: 149,
      cadence: "one-time · lifetime access",
      blurb: "One goal, one course, four weeks. Pay once.",
      features: [
        "1 personalized course built around your declared goal",
        "Up to 4 modules, dripped weekly · readings + exercises + evaluations",
        "All evaluations machine-graded against the rubric you signed at intake",
        "Lifetime access — re-read your course in a year, your way"
      ]
    },
    {
      id: "subscription",
      name: "A standing subscription",
      price: 39,
      cadence: "monthly · cancel any time",
      blurb: "Most students pick this.",
      features: [
        "1 new course per quarter, on a goal you set at the start of each quarter",
        "Unlimited syllabus revisions · re-prime when your goal shifts",
        "Library: every past course you've taken, searchable, exportable",
        "Re-evaluation: submit work from anywhere, get graded against your rubric"
      ],
      featured: true
    },
    {
      id: "coached",
      name: "Coach-augmented",
      price: 299,
      cadence: "monthly · 30 day notice to cancel",
      blurb: "A real human tutor in the loop, weekly.",
      features: [
        "Everything in the standing subscription",
        "30-minute live tutoring call once per week (Zoom · in your timezone)",
        "Hand-graded written feedback on every exercise · within 48 hours",
        "Quarterly course rewrite based on the tutor's assessment of your level"
      ]
    }
  ];

  return (
    <section id="pricing" className="section">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="Three ways in"
          title="Buy a course or keep one going."
          lede="Pricing is small on purpose. Reading List exists because adult learners are over-charged by edtech and under-served by it. We charge what a private tutor's reading list is worth, not what a marketing department thinks a 'cohort' is worth."
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <article key={tier.id} className={`tier ${tier.featured ? "featured" : ""}`} aria-label={`${tier.name} tier`}>
              {tier.featured ? (
                <span className="inline-flex w-fit border border-gilt bg-parchment px-2.5 py-1 font-mono text-[10px] tracking-ledger uppercase text-gilt">
                  Most students pick this
                </span>
              ) : (
                <span className="inline-flex w-fit font-mono text-[10px] tracking-ledger uppercase text-sepia">
                  Tier {tier.id === "single" ? "01" : tier.id === "subscription" ? "02" : "03"}
                </span>
              )}
              <h3 className="tier-name">{tier.name}</h3>
              <p className="text-[15px] text-oak leading-snug">{tier.blurb}</p>

              <div>
                <div className="tier-price">
                  ${tier.price}
                  <span className="ml-2 font-sans font-normal text-[14px] uppercase tracking-ledger text-sepia">
                    {tier.id === "single" ? "for the course" : "/ month"}
                  </span>
                </div>
                <div className="tier-cadence">{tier.cadence}</div>
              </div>

              <ul className="tier-features">
                {tier.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>

              <div className="mt-4">
                <PricingCta plan={tier.id} label={`Take ${tier.name} →`} fullWidth />
                <p className="mt-3 text-[12px] font-mono tracking-ledger uppercase text-sepia">
                  Crypto checkout · USDT / USDC · NOWPayments
                </p>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl font-display italic text-[19px] md:text-[22px] text-walnut border-l-2 border-marginalia pl-5">
          If the syllabus we send you in the first week doesn&rsquo;t feel like it
          was written for you, we refund the course in full. Nothing to argue. One
          email, one paragraph, money back.
        </p>

        <div className="mt-12 note-frame p-7 max-w-2xl">
          <p className="kicker">For teams · for tutors</p>
          <h3 className="mt-3 font-display font-semibold text-[24px] tracking-tightest">
            Issuing courses to a small team or a private cohort?
          </h3>
          <p className="mt-3 text-[16px] text-oak leading-snug">
            We work with engineering managers, study circles, and language tutors
            who want to issue per-student courses without buying a Coursera license.
            Volume starts at five seats; the rate is the standing-subscription price
            with a small discount for size, and a one-page agreement we sign in a day.
          </p>
          <a
            className="inline-block mt-4 font-mono text-[12px] tracking-ledger uppercase text-walnut underline decoration-1 underline-offset-4 decoration-gilt hover:text-marginalia"
            href="mailto:tutor@personalized-courses.prin7r.com?subject=Cohort%20enquiry"
          >
            tutor@personalized-courses.prin7r.com →
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Voices — testimonials slot                                                 */
/* -------------------------------------------------------------------------- */

function Voices() {
  const voices = [
    {
      quote:
        "I had bounced off three Rust courses. Reading List asked me what I knew, then sent me a syllabus I actually finished. The borrow-checker stopped feeling like an enemy somewhere around module two.",
      who: "Backend engineer, Lisbon · single-course graduate",
      tag: "ship a Rust CLI in 30 days"
    },
    {
      quote:
        "My tutor used to mail me reading lists. Reading List does that, but it grades the homework. I keep the subscription and rotate goals every quarter — Spanish in spring, statistics in summer.",
      who: "Product manager, Mexico City · subscription · second year",
      tag: "B1 → B2 Spanish"
    },
    {
      quote:
        "I run a small study group of four engineers. Each gets a personalized syllabus, dripped on the same Monday. We compare notes Wednesdays. Cheaper and more honest than the corporate L&D budget I used to fight for.",
      who: "Eng. manager, Berlin · five-seat cohort",
      tag: "system-design fluency"
    }
  ];

  return (
    <section id="voices" className="section bg-vellum/40">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader
          eyebrow="Voices"
          title="What students actually say."
          lede="Three real-shape testimonials. Reading List is a young product — these are paraphrased from intake notes and end-of-course self-evaluations, with permission. Names withheld. Cohort details accurate."
        />
        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {voices.map((v) => (
            <figure key={v.who} className="note-frame p-7">
              <p className="kicker">{v.tag}</p>
              <blockquote className="mt-4 font-display italic text-[18px] text-walnut leading-snug">
                &ldquo;{v.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 font-mono text-[10.5px] tracking-ledger uppercase text-sepia">
                — {v.who}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

function Faq() {
  const items: Array<{ q: string; a: string }> = [
    {
      q: "How is this different from Coursera, Udemy, or a YouTube playlist?",
      a: "Those are content libraries — they sell you a course someone else built for an imaginary average student. Reading List builds the course from scratch around your declared goal and your current level, then cuts the parts you already know. Most students finish; on the open platforms, fewer than 5% do. We trade scale for fit."
    },
    {
      q: "Is this just an LLM that writes lesson plans?",
      a: "It uses LLMs to draft the syllabus, retrieve named readings, and grade evaluations against rubrics — but the rubric, the readings, and the grading scheme were built by educators we work with. The LLM is a tool we hold, not the product. The product is the syllabus, the drip, and the evaluation loop."
    },
    {
      q: "What happens if the AI sends me a wrong or hallucinated reading?",
      a: "Every named reading is verified against an open citation database before it leaves our hands. If a citation is unreachable, the syllabus marks it as 'tutor to verify' and we replace it before drip. We do not ship phantom readings — that's the single thing self-directed learners cannot tolerate, and we know it."
    },
    {
      q: "Why crypto checkout instead of a card?",
      a: "It is the cleanest cross-border rail and it avoids 3-5% card-processing fees on the markets we serve, including Latin America, Eastern Europe, South Asia, and Africa. We invoice in USDT or USDC by default through NOWPayments. If you'd rather pay by Wise or Payoneer, write to tutor@ and we'll hand-wire it."
    },
    {
      q: "What languages can the syllabus be delivered in?",
      a: "English by default. Spanish, Portuguese, Russian, Polish, and Indonesian are in production today. Other languages on request — we'd rather refuse a course than ship one in a language we can't grade properly. Tell us at intake; we'll say yes or no within a day."
    },
    {
      q: "Can I cancel? Can I pause? Can I get my work out?",
      a: "Yes, yes, and yes. Cancel from your account any time — we don't put up dark patterns. Pause the drip from any module. Export your library as a folder of Markdown files plus PDFs of your evaluations whenever you like. The course is yours, the learning is yours. We hold the schedule."
    }
  ];

  return (
    <section id="faq" className="section">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-20 md:py-24">
        <SectionHeader eyebrow="FAQ" title="Six questions, answered straight." />
        <div className="mt-12 max-w-2xl">
          {items.map((item) => (
            <details key={item.q} className="faq">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                     */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer id="footer" className="bg-vellum/60">
      <div className="mx-auto max-w-prose px-6 md:px-10 py-14 md:py-16 grid md:grid-cols-12 gap-10 items-end">
        <div className="md:col-span-6 flex flex-col gap-4">
          <Logo />
          <p className="max-w-md text-[15px] text-oak leading-snug">
            Reading List is an agent-native learning studio. We build personalized
            courses around one declared goal, deliver them on a schedule that
            respects how an adult studies, and grade the work against a rubric you
            saw at intake. Built in 2026 by the prin7r-projects studio.
          </p>
          <p className="handwritten mt-1">— a syllabus of one, written by hand-and-machine.</p>
        </div>
        <nav className="md:col-span-3 flex flex-col gap-3" aria-label="footer">
          <p className="kicker">The desk</p>
          <a className="text-[14.5px] text-walnut hover:text-marginalia transition-colors" href="mailto:tutor@personalized-courses.prin7r.com">
            tutor@personalized-courses.prin7r.com
          </a>
          <a className="text-[14.5px] text-walnut hover:text-marginalia transition-colors" href="mailto:cohorts@personalized-courses.prin7r.com">
            cohorts@personalized-courses.prin7r.com
          </a>
        </nav>
        <nav className="md:col-span-3 flex flex-col gap-3" aria-label="resources">
          <p className="kicker">Repo · docs</p>
          <Link
            className="text-[14.5px] text-walnut hover:text-marginalia transition-colors"
            href="https://github.com/prin7r-projects/personalized-courses"
          >
            github.com/prin7r-projects/personalized-courses
          </Link>
          <Link
            className="text-[14.5px] text-walnut hover:text-marginalia transition-colors"
            href="https://github.com/prin7r-projects/personalized-courses/tree/main/docs"
          >
            10 strategy docs
          </Link>
        </nav>
      </div>
      <div className="mx-auto max-w-prose px-6 md:px-10 pb-10 flex flex-col md:flex-row justify-between gap-3 border-t border-walnut/15 pt-6">
        <p className="font-mono text-[11px] tracking-ledger uppercase text-sepia">
          © 2026 prin7r-projects · MIT
        </p>
        <p className="font-mono text-[11px] tracking-ledger uppercase text-sepia">
          A private tutor&rsquo;s notebook · not a content library
        </p>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/* Section header helper                                                      */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  eyebrow,
  title,
  lede
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="kicker">{eyebrow}</p>
      <span className="eyebrow-rule" aria-hidden="true" />
      <h2 className="font-display font-semibold text-[40px] md:text-[56px] leading-[1.05] tracking-tightest">
        {title}
      </h2>
      {lede ? (
        <p className="mt-5 text-[17.5px] md:text-[19px] text-oak leading-snug">{lede}</p>
      ) : null}
    </div>
  );
}
