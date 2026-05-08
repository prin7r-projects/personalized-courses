# 11 · User stories and scenarios

> Reading List is a personalized-course studio. This document drives both frontend (apps/landing,
> the future apps/app intake) and backend (drip workers, syllabus generator, grader) by enumerating
> who shows up, what they want to do, what they get, and what we never build.

## 1. Personas summary

- **Mara, 34, backend engineer in Lisbon.** Wants to ship a Rust CLI by end of June; bought
  Klabnik & Nichols in January, fell off at borrowing. Pays in EUR, comfortable in USDC. Lives in
  Hacker News, GitHub, Telegram, one Notion. Will not pay for a 47-hour video course. — see
  `05-audience-profile.md` §Mara for full background.
- **Diego, 41, product manager in Mexico City.** B1 Spanish → B2 by autumn for off-site pitches.
  Has a respected human tutor (paper reading lists, twice a month) but the tutor doesn't scale.
  Pays in USD or USDC; cross-border friction is the trigger to try crypto rails. — see
  `05-audience-profile.md` §Diego.
- **Reading List Studio (operator).** The Prin7r-side human-in-the-loop curator who approves
  syllabi before they drip, watches the rubric pass, and intervenes on flagged grades. Acts on
  the editorial guarantee that no course goes out without an editor's name on it.

## 2. Primary user stories (12)

1. **As Mara**, I want to read a one-screen pitch and the three tier prices, so that I can decide
   in under 60 seconds whether Reading List is even in my price range.
2. **As Mara**, I want to pay with USDC without giving a credit card or signing up for an account
   first, so that I can convert from a Hacker News tab without a friction wall.
3. **As Mara**, I want to declare my goal in one sentence and my current level in two paragraphs,
   so that the syllabus is built around what I already know rather than a lowest-common-denominator
   curriculum.
4. **As Mara**, I want to receive my syllabus draft within 24h with named, citable readings (book +
   chapter, paper + section, repo + file path), so that I can sanity-check it before any drip
   begins.
5. **As Mara**, I want to receive one drip per week (configurable: 5–9 days), each with a reading,
   an exercise, and an evaluation rubric, so that the pace fits a working week without forcing my
   calendar.
6. **As Mara**, I want to submit my exercise (code or essay) and receive a graded response within
   48h that points at what was wrong with line numbers or page references, so that I can correct
   without guessing what the grader wanted.
7. **As Diego**, I want to receive my drips in Spanish (and so should the rubrics), so that the
   course feels native rather than translated.
8. **As Diego**, I want to pause my course for two weeks and resume on the same module, so that
   one travel disruption doesn't invalidate the whole study plan.
9. **As Mara**, I want a single visible refund window (30 days, no questions asked through drip 3),
   so that paying $399 does not feel like a leap.
10. **As Reading List Studio operator**, I want to see a queue of "syllabi awaiting editor sign-off"
    sorted by deadline, so that I can act on the freshest ones first.
11. **As Reading List Studio operator**, I want every cited reading to be machine-verified
    (Crossref, OpenLibrary, GitHub) before the syllabus reaches the student, so that I never
    embarrass the studio with a hallucinated title.
12. **As Reading List Studio operator**, I want graded submissions to be flagged when the model's
    confidence is below 0.7 OR the rubric coverage is below 80%, so that I can intervene before
    the student receives a weak grade.

## 3. Main scenarios (happy paths)

### Scenario A — Mara converts from Hacker News, pays in USDC, gets her draft

1. **Trigger.** Mara reads a Hacker News submission "Show HN: I built a personalized-course studio
   that names every reading" at 19:42 local. Clicks through.
2. **Step 1.** Lands on `/`. Reads the positioning + the three tier cards (Studio, Studio Plus,
   Studio Bespoke). Picks Studio at $399.
3. **Step 2.** Clicks "Start a course." `/api/checkout/nowpayments` posts to NOWPayments,
   receives a hosted-invoice URL, redirects.
4. **Step 3.** Pays 399 USDC on TRC-20. Returns to `/payment/return?invoiceId=...`.
5. **Step 4.** Receives a transactional email (Postmark) with a one-time intake link. Opens it on
   her laptop, fills in goal ("ship a Rust CLI for an internal task-runner by end of June") and
   level (two paragraphs of context).
6. **Step 5.** 23h later, receives a draft syllabus email: 8 modules, each named "Module 4 · The
   borrow checker · Klabnik & Nichols ch. 4 + the Rustonomicon ch. 6 + a 90-line exercise."
7. **Step 6.** Approves the draft from the email link.
8. **Step 7.** First drip arrives 24h later.
9. **Success criteria.** `orders.status = 'paid'` AND `courses.status = 'syllabus_approved'` AND
   first `drips.scheduled_at < now() + 25h` AND Mara has not contacted support.
10. **Frontend touch-points.** `/` (landing), tier card CTA, `/payment/return`, intake form (Wave 3
    in `apps/app`).
11. **Backend touch-points.** `POST /api/checkout/nowpayments`, NOWPayments invoice API,
    `POST /api/webhooks/nowpayments` IPN, syllabus worker, Crossref + OpenLibrary verifier, Postmark.

### Scenario B — Diego buys via card-fallback link, requests Spanish

1. **Trigger.** Diego's tutor recommends Reading List in WhatsApp.
2. **Step 1.** Diego lands on `/`, reads the positioning, decides Studio Plus ($899) gives him
   live editor calls.
3. **Step 2.** Clicks "Start a course." Crypto checkout offered first; Diego clicks "Card or
   Wise" fallback (Wave 3 — for now, manual invoice via support).
4. **Step 3.** A studio operator emails him a manual invoice within 1h.
5. **Step 4.** Pays via Wise. Operator sets `orders.status = 'paid_manual'`, mints intake link.
6. **Step 5.** Diego fills in goal (B1 → B2 Spanish for pitching) and selects Spanish drip language.
7. **Step 6.** Receives a draft syllabus in Spanish 22h later: 10 modules, each with a named
   reading from a working linguist + a recorded-pitch exercise.
8. **Success criteria.** Drip 1 in Spanish lands. Diego does not ask "is this translated?".
9. **Frontend touch-points.** `/`, fallback "Card / Wise" CTA, intake (Wave 3), language toggle.
10. **Backend touch-points.** Manual invoice flow, syllabus worker (locale=`es`), Postmark (Spanish
    template), studio operator dashboard (Wave 3).

### Scenario C — Studio operator approves a syllabus with one reading replaced

1. **Trigger.** Pager: "Syllabus awaiting editor sign-off, deadline 23h."
2. **Step 1.** Operator opens the queue, picks Mara's syllabus.
3. **Step 2.** Sees green checks on 7 of 8 modules; module 5 is yellow ("reading not verifiable").
   The proposed reading is a 2019 blog post; Crossref and OpenLibrary returned no canonical entry.
4. **Step 3.** Operator clicks "Replace reading." Suggests a verified replacement (a section from
   *Programming Rust* 2nd ed.) The verifier accepts.
5. **Step 4.** Operator clicks "Approve." Email to Mara fires.
6. **Success criteria.** All 8 modules have verified citations. Approval timestamp recorded.
7. **Frontend touch-points.** `apps/app` operator queue (Wave 3).
8. **Backend touch-points.** Syllabus DB, citation verifier, Postmark, audit log.

### Scenario D — Drip + grade loop runs for 8 weeks

1. **Trigger.** `cron: 0 9 * * 1` fires the drip worker.
2. **Step 1.** Worker selects all `drips` where `scheduled_at <= now()` AND `sent_at IS NULL`.
3. **Step 2.** For each, it composes the email (markdown → MJML → Postmark), with the reading,
   the exercise, the rubric, and a personal-token submission link.
4. **Step 3.** Mara replies with her code. The submit endpoint stores it in S3 and queues a grade
   job.
5. **Step 4.** Grader (Claude 4.7) runs the rubric, returns a score + per-criterion notes. If
   confidence < 0.7, queues operator review.
6. **Step 5.** Mara receives the grade email within 48h.
7. **Step 6.** Loop repeats for 8 modules.
8. **Success criteria.** All 8 drips delivered on schedule; all 8 graded within SLA; no missed
   weeks.

### Scenario E — Pause/resume

1. **Trigger.** Diego clicks "Pause my course" from a drip email; specifies "two weeks."
2. **Step 1.** `POST /api/courses/:id/pause` shifts every future `drip.scheduled_at` by 14 days.
3. **Step 2.** Diego receives a confirmation email.
4. **Step 3.** Two weeks later, drip resumes on the next module.
5. **Success criteria.** Drip 6 lands two weeks later than originally scheduled, no skips.

### Scenario F — Refund within 30 days

1. **Trigger.** Mara emails support after drip 2 saying "this isn't for me."
2. **Step 1.** Operator runs the refund tool: marks the order refunded, cancels remaining drips,
   issues a USDC refund (NOWPayments mass-payout or manual).
3. **Step 2.** Mara receives a confirmation.
4. **Success criteria.** Refund processed within 5 business days. `courses.status = 'refunded'`.

## 4. Edge case scenarios

### Edge A — Hallucinated reading slips past the verifier

The syllabus generator emits "Klabnik & Nichols ch. 12" — but the book has 11 chapters. Crossref
returns no DOI for "ch. 12." The verifier flags it red. Operator queue prioritizes red flags;
operator either replaces or asks the LLM to retry. Drip is not sent until the entire syllabus is
green.

### Edge B — Student submits an empty file

Grader treats `length(submission) < 50 chars OR no_code_blocks AND no_text` as `submission_empty`.
The student receives a polite "we couldn't grade an empty submission, please resubmit" email
within 5 minutes. No grade recorded; the rubric counter does not advance.

### Edge C — IPN replay

NOWPayments retries IPN delivery on 5xx. The webhook handler computes
`(invoice_id, payment_id, status)` as a unique key and is idempotent: second arrival increments a
counter but does not re-trigger downstream provisioning.

### Edge D — Late drip after Postmark outage

If Postmark returns 5xx three times, the drip is rescheduled +1h with exponential backoff up to
24h. After 24h of failure, page the operator. Drip status becomes `delivery_blocked`.

### Edge E — Two students share the same email

Refused at intake: emails are unique (`students.email UNIQUE`). Show "this email already has a
course" with a help link.

### Edge F — Concurrent drips on a single course

Deduplicate at send: `UNIQUE (course_id, module_index)` on `drips`. The cron worker uses
`SELECT ... FOR UPDATE SKIP LOCKED` semantics so two workers never grab the same row.

## 5. Anti-scenarios

The product explicitly does **not** do these things, even when asked:

1. **No streaks, points, leaderboards, or "30-day challenges."** Adult learners come here to escape
   gamification. We will say no.
2. **No certificates or "career outcomes."** We build courses; outcomes belong to the student.
   Do not add a "verified completion" badge.
3. **No live cohorts on a fixed timetable.** Drips are personal and pausable. We do not run
   "starts October 14, ends December 9" cohorts.
4. **No AI-tutor chatbot in the student inbox.** Grading is async and editorial. We will not ship a
   real-time chatbot in the drip emails.
5. **No marketplace of courses by other authors.** Reading List is the studio. Every syllabus has
   a Reading List editor's name on it.
