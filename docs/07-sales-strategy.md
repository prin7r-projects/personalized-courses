# 07 · Sales strategy

## Motion

**Hybrid PLG + lightweight desk-led sales.**

- The landing's three-tier pricing + the NOWPayments invoice path is the **PLG self-serve path**. ~70% of buyers will pay through this path without ever emailing the desk.
- The `tutor@` and `cohorts@` mailboxes are the **desk-led path**. ~30% of buyers (and 100% of cohort sales) go through one human-in-the-loop email round before paying.
- We don't run sales calls for the single-course or single-seat subscription. We do for cohort sales — a 30-minute scheduled video call, used once, never iterated.

Why hybrid: adults with money and a learning goal _want_ to self-serve when the offer is honest. Adults with $1,800+ ACV (cohorts) want one human conversation to make the decision feel responsible. We respect both.

## Pricing tiers (live on landing)

| Tier                          | Price             | Cadence                         | What's included                                                                  | Margin notes                                                  |
|-------------------------------|-------------------|----------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------|
| **A single course**           | **$149** one-time | Lifetime access · 4-week drip   | 1 personalized course, 4 modules max, machine-graded evaluations.                | LLM cost ≈ $4–7 (GLM 5.1 Flash for syllabus, Claude 4.7 Haiku for grading). 95% gross margin. |
| **A standing subscription**   | **$39 / month**   | Cancel any time                  | 1 new course per quarter, library, unlimited revisions, re-evaluation.            | Quarterly LLM cost ≈ $5–8; monthly recurring covers it 4× over. |
| **Coach-augmented**           | **$299 / month**  | 30-day notice                    | Subscription + weekly 30-min Zoom + hand-graded feedback + quarterly course rewrite. | Tutor takes 70% ($209), studio takes 30% ($90). Margin set by tutor pool, not LLM. |

Volume rate (cohort) — _not on landing, surfaced via desk reply_:

| Cohort tier              | Price                   | Min size      | Term         | Notes                                              |
|--------------------------|-------------------------|---------------|--------------|----------------------------------------------------|
| **Eng / study cohort**   | **$35 / seat / month**  | 5 seats       | 12 months    | One-page agreement, monthly invoice, audit log    |
| **Coach-augmented cohort** | **$249 / seat / month** | 5 seats       | 12 months    | Tutor-shared, 70/30 split as above                 |

## The pricing logic

- **$149 single course.** Below the price elasticity inflection where adults stop deliberating ("$50 is impulse, $150 is considered, $500 is meeting-with-spouse"). Above the price floor where buyers expect free-trial / freemium.
- **$39 / month subscription.** Roughly 1× the price of a Substack premium feed. The subscription frame _legitimizes_ the cost — it's "a subscription to a private tutor's reading list", not "a course on a platform".
- **$299 / month coached.** The mid-range of independent tutoring. A Spanish tutor in Mexico City with iTalki credentials charges $25–60 per hour; four 30-minute sessions + grading + the syllabus pipeline is a fair $299. The 70/30 split makes the tutor more, per hour, than they earn on iTalki.
- **Why no $999 / "enterprise" tier?** Because we don't sell enterprise. The cohort tier exists for teams; everything bigger requires a different studio.

## Objection handling

We pre-answer the six most common objections in `app/page.tsx::Faq()`. The desk's email replies use the same answers.

**O1. "Why crypto checkout instead of card?"**
We're cross-border. Card processing in our markets eats 3–5%. Crypto is the cleanest rail. If the buyer prefers Wise / Payoneer / Mexican rail, the desk hand-wires the invoice within a day.

**O2. "Is this just an LLM?"**
The LLM drafts the syllabus and grades against a rubric. The rubric and the readings come from a small team of educators. Every named reading is verified against an open citation database. We don't ship hallucinated readings — that's the one thing self-directed learners can't tolerate.

**O3. "How is this different from Coursera / Udemy?"**
They sell mass-market courses; we generate one course per buyer, against your declared goal. Their completion rate is <5%; ours is targeting 70–80% because the syllabus was built around your level. Different unit economics, different product.

**O4. "What if the course doesn't fit me?"**
The first-week refund clause: if the syllabus we send you in the first week doesn't feel written for you, refund in full. One paragraph email, no friction. We don't claw it back; we mark the syllabus as a learning data point and move on.

**O5. "Can I cancel? Can I export my work?"**
Yes to both. Cancel any time from the account page (Wave 3). Export your library as a folder of Markdown + PDFs at any time. The course is yours; we hold the schedule.

**O6. "What languages can the course be delivered in?"**
English by default. Spanish, Portuguese, Russian, Polish, Indonesian in production. Other languages on 48-hour confirmation. We refuse a course rather than ship one in a language we can't grade properly.

## Closing the cohort sale (the only sales call we run)

**One 30-minute video call.** Same agenda every time:

1. (5 min) Hannah describes the team and their goals.
2. (5 min) The studio shows two real syllabi (with names redacted) for two different goals.
3. (5 min) The studio walks the cadence: drip Mondays, 25-min Wednesday round-robin, monthly export.
4. (5 min) Pricing and the one-page agreement on screen.
5. (10 min) Q&A.

We never run a second call. If Hannah needs a second call, we lost. The studio doesn't have a sales pipeline; it has a desk that answers email well.

## Refunds, claw-backs, abuse

- **First-week refund** is honoured one time per buyer per twelve months. Abuse (e.g. someone refunding three single-courses in a row) results in a polite "we don't think we're the right fit for you" email. No public list, no shaming.
- **Subscription** can be cancelled instantly with no proration; we don't withhold the library. The library export endpoint stays accessible for 90 days post-cancellation.
- **Cohort** has the one-page-agreement minimum twelve months; we don't pro-rate, but we will mid-term renegotiate the seat count if a team member departs.

## Discounts and discounts we won't run

- **Annual prepay**: 2 months free on the standing subscription, never marketed publicly. Available on request.
- **Founder / student / early-career**: a one-time 30% off the single-course tier, for buyers who write to the desk. We approve ~80% of requests, no questions asked beyond a one-line context.
- **Black Friday / Cyber Monday**: never. The brand explicitly does not run holiday discounts. We don't want the buyer who buys because of a sale.
- **Affiliate kickbacks**: not for the studio's marketing, only for the tutor-affiliate revenue split.
