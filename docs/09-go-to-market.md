# 09 · Go-to-market — first 90 days

## Frame

The first 90 days is a small, deliberate flywheel:

1. Hand-write the first 10 syllabi (week 1–4).
2. Publish one polished public syllabus to HN (week 5).
3. Open the desk to inbound and email cohorts (week 5–9).
4. Run the first cohort cleanly (week 9–12).
5. Reflect, document, decide whether to scale generation (week 13).

We are not optimizing for top-of-funnel volume. We are optimizing for the studio knowing _exactly_ how a personalized course works end to end before we invite a wave.

## Week 1 — Open the door

- Day 1. Landing live at `personalized-courses.prin7r.com` (this build).
- Day 2. NOWPayments live invoice tested end-to-end.
- Day 3. The first three personal-network buyers (existing peers in Mara's profile) receive an email: "we built this; come buy a course at $0 in exchange for a public testimonial".
- Day 5. Three free syllabi drafted, edited, locked. Drips queued. Three students reply with edits; we honour two-thirds.
- Day 7. **Milestone: 3 active courses, all on different topics, all hand-built.**

## Week 2 — Run the first three drips

- Mon. Module 01 ships to all three students at their chosen 09:00 local time.
- Wed. We start drafting the first public syllabus (Rust CLI in 30 days), the one that will go to HN later.
- Fri. End-of-module evaluations submitted by two of three students; we grade by Sunday.
- **Milestone: first end-of-module feedback delivered.**

## Week 3 — Tutor recruit + cohort warm-up

- Mon. Email five private tutors (language, mathematics, music, oral coaching) we know by name, asking to pilot the affiliate model.
- Wed. Two say yes-with-questions, two say no, one says "let me think about it".
- Fri. Run the second drip; correct three pacing mistakes from week 2 (a module too dense, a reading too long, a rubric line ambiguous). Document.
- **Milestone: 1 tutor opted in to pilot; documentation of pacing mistakes.**

## Week 4 — First paid sale + first finished course

- Mon. The first hand-built course finishes for the first student. Final evaluation graded; one-page closing PDF generated.
- Wed. The first paid sale (the third hand-built course's student converts at $149 to extend their goal).
- Fri. Public syllabus draft done; lead pedagogue does final pass.
- **Milestone: $149 in revenue, 1 finished course, 1 testimonial in hand.**

## Week 5 — HN launch (the public syllabus)

- Mon AM (UK time, ≈ 6 ET). Post the public Rust CLI syllabus to HN: title is "A 4-module syllabus for shipping a Rust CLI in 30 days", body is a CC-BY syllabus, sign-off is one sentence pointing at the home page.
- Mon afternoon. Reply to every comment. Apologize where the syllabus is wrong; revise where the criticism is fair.
- Tue. The first wave of buyers arrives — target 8–15 single-course sales in the first 48 hours.
- Wed. **Send the first cohort enquiry response.** (One email landed in `cohorts@`.)
- Fri. Run the third drip; six students now active.
- **Milestone: 10–20 paid buyers, 1 cohort lead, public syllabus in the wild.**

## Week 6 — Stabilise the drip

- Mon. Drip cadence stabilizes for ~12 active courses.
- Wed. Set up a weekly internal review: pacing, citation-verification failures, grading turn-around. Document the three biggest gaps.
- Fri. Second cohort enquiry; reply with the one-page agreement.
- **Milestone: drip cadence stable; cohort pipeline = 2.**

## Week 7 — First newsletter placement

- Mon. Place the first paid newsletter ad (Bytes or TLDR), copy is editorial — describes the public syllabus and one new one we'll release in week 9.
- Wed. ~25–40 new buyers from the placement.
- Fri. The first cohort closes — 5 seats × 12 months × $35.
- **Milestone: newsletter conversion model validated; 1 cohort signed.**

## Week 8 — Second public syllabus + Twitter threads

- Mon. Draft the second public syllabus (Spanish B1 → B2 in 90 days).
- Wed. Lead pedagogue starts the Twitter / X presence. First thread: "What we cut from the Rust CLI syllabus and why".
- Fri. Cohort kickoff; five intakes received; five syllabi drafted.
- **Milestone: 30+ paid courses running, 1 cohort active.**

## Week 9 — Cohort drip Mon, Wed round-robin

- Mon. Cohort drip begins. Each engineer in the cohort gets their first module at 09:00 local.
- Wed. First cohort round-robin (25 minutes, four of five attend).
- Fri. Lead pedagogue publishes the first "What we cut" essay on Substack + a HN crosspost.
- **Milestone: cohort ritual established.**

## Week 10–11 — Steady state

- Continue weekly drip, weekly Wednesday round-robin, weekly desk hours.
- Onboard the second tutor-affiliate (Lola pattern).
- Publish the second "What we cut" essay; promote it to engineering-newsletter audiences.
- Reach ~50 active courses across single + subscription.

## Week 12 — Evaluate and decide

- End-of-quarter completion review: target ≥60% of finished single-course tier.
- Refund rate review: target ≤8%.
- Cohort renewal probability assessment.
- **Decision gate**: do we automate syllabus generation more aggressively in Q2, or keep hand-building? The answer depends on whether the LLM-generated syllabi can pass the studio's own rubric review without edits.

## Week 13 — Plan Q2

- Document the first quarter as a public retrospective (a "Year One" document, even though it's quarter one). Honest about what worked and what didn't.
- Send the first re-engagement email to single-course graduates: "want to keep going?"
- Open Wave 3 (Open-SaaS port for the in-app surface).

## Budget (90 days)

| Line                                        | Cost (USD)        | Notes                                                          |
|---------------------------------------------|-------------------|----------------------------------------------------------------|
| Hosting (storage-contabo Wave 2 share)      | $0                | already paid; landing is a single Docker container             |
| LLM costs (≈ 50 courses × $5 avg)           | $250              | GLM 5.1 + Claude 4.7 Haiku                                     |
| Tutor pool (coached tier 70%)               | pass-through      | revenue-share, no out-of-pocket                                |
| Newsletter placements (3 quarters × 1 ad)   | $1,800            | $600 / placement avg                                           |
| Lead pedagogue (part-time)                  | $9,000            | $3K / month × 3                                                |
| Editorial + grader pool (part-time)         | $4,500            | $1.5K / month × 3                                              |
| **Total**                                   | **$15,550**       |                                                                |

## Revenue target (90 days)

| Stream                    | Volume            | ARPU       | Revenue (USD)   |
|---------------------------|-------------------|------------|-----------------|
| Single-course sales       | 50                | $149       | $7,450          |
| Standing subscription     | 12 (avg-active)   | $39 / mo   | $1,404          |
| Coach-augmented           | 4 (avg-active)    | $299 / mo  | $3,588          |
| Cohort                    | 1 cohort × 5 seats| $35 / seat | $525 (qtr)      |
| **Total revenue Q1**      |                   |            | **$12,967**     |

Q1 is intentionally cash-negative (–$2.6 K) — the spend is editorial pool + paid newsletter placements. Q2 turns positive at the same trajectory. The studio breaks even cumulatively at month 6 if subscription churn stays under 5% / month.
