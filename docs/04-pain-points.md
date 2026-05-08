# 04 · Pain points (root-cause)

The pains below are real, specific, and observed — they are why a self-directed learner who has bought two Udemy courses, finished none, and read half a textbook will pay $149 for a syllabus that is 40 pages and 4 weeks instead of $19 for a course that is 47 hours and infinite.

## Pain 1 — "The course was not built for me"

**Symptom.** The buyer takes a Coursera or Udemy course and watches the first three lectures at 2x speed. The instructor explains things the buyer already knows (variables, loops, what an API is). The buyer fast-forwards. By lesson five, the instructor introduces a hard concept too quickly. The buyer abandons.

**Root cause.** The course was authored for an _imagined average student_. The pedagogy fits no real student because it has to fit a marketing target. There is no syllabus-of-one because the unit economics of mass-market online learning don't allow it.

**Curriculum7 remedy.** Every course is generated against (a) one declared goal and (b) one current-level paragraph. Modules the buyer doesn't need are cut at draft time, not skipped at watch time.

## Pain 2 — "I can't tell what is true"

**Symptom.** The buyer asks a chatbot tutor about Rust lifetimes. The chatbot answers fluently. The buyer realizes, three days later, that the answer was wrong. The buyer no longer trusts the chatbot. The buyer also no longer trusts their own intuition because they don't know which other answers were quietly wrong.

**Root cause.** Frontier LLMs hallucinate confidently. Self-directed learners cannot afford a single hallucination — it poisons the rest of the course. The "AI tutor" pattern is uniquely badly suited for the population that needs it most.

**Curriculum7 remedy.** The studio names every reading. The studio verifies every named reading against an open citation database (Crossref, OpenLibrary) at draft time. Where verification fails, the syllabus marks the reading "tutor to verify" and a human replaces it before the drip ships. The course is an _editorial_ artifact, not a chat session.

## Pain 3 — "I can't sustain the cadence"

**Symptom.** The buyer subscribes to Brilliant or MasterClass. They watch one module on day one. They miss day three. By day fourteen, they have skipped a week. By day twenty-eight, they unsubscribe. The product blames them ("you broke your streak!") and the buyer feels ashamed.

**Root cause.** The product packs the entire library in front of the buyer. The buyer is responsible for self-pacing. The platform has no view of the buyer's schedule, energy budget, or the rest of their life. Streak-shaming is the platform's only retention lever — and it actively hurts the audience.

**Curriculum7 remedy.** The drip is the discipline. One module per week (or two, or four — buyer's choice at intake). The next module ships at a fixed time the buyer chose. The buyer cannot accidentally over-consume. There are no streaks; there are weeks. A week is the unit. Adults respect weeks.

## Pain 4 — "The cohort doesn't fit my life"

**Symptom.** The buyer signs up for a four-week cohort that meets Tuesdays 7pm Eastern. Their child gets sick. Their CEO calls a Tuesday meeting. They miss two of four sessions. They cannot make up the gap because the cohort is over.

**Root cause.** Synchronous cohort schedules are rigid for a reason — it's how cohorts make economic sense for the seller. But it's actively hostile for the buyer who has any caregiving, shift work, time-zone, or health constraint.

**Curriculum7 remedy.** Asynchronous by default. Drip at the buyer's chosen day + hour. The optional coach-augmented tier offers a 30-minute weekly call, scheduled in the buyer's timezone, that can be rescheduled with 48 hours' notice. The course is independent of any cohort — modules drip whether or not anyone else is reading.

## Pain 5 — "I bought it; I never finished it"

**Symptom.** The buyer has six unfinished Udemy courses. Three half-read O'Reilly books. Two language apps with 12-day stale streaks. Their LinkedIn says they are "always learning". They feel guilty whenever a friend mentions a course.

**Root cause.** Marketplace courses optimize for sale, not completion. The marginal cost of a sold-but-unfinished course is zero to the seller; the cost is psychological-to-the-buyer. The buyer is the loser of every transaction.

**Curriculum7 remedy.** The studio has a refund clause for the syllabus (one paragraph, one email, money back if it doesn't feel written for you). The drip ends in a graded evaluation, which forces a closing event. The course exists to be finished. The economic incentives are aligned: we make money on subscription renewal, which only happens if last quarter's course closed well.

## Pain 6 — "I want to learn the niche thing, but no one made a course for it"

**Symptom.** The buyer wants to learn the Erlang OTP supervisor patterns specific to a 50-node fault-tolerant cluster. Or the rules for arguing a contract dispute in a particular jurisdiction. Or the 90-day prep for an oral cellist audition. There is no course for the niche thing because the audience is too small.

**Root cause.** Marketplace economics produce only courses with at least 5,000 prospective buyers. Niches get nothing.

**Curriculum7 remedy.** Generation per buyer. The audience for one course is one. Niches are first-class. The reading verifier and the rubric library are the only fixed costs; everything else scales per-buyer.

## Pain 7 — "I want my work, not theirs"

**Symptom.** The buyer takes a course, finishes it, looks back, and realizes they cannot point at anything they made. They watched 40 hours of someone else writing code. They have no repo, no essay, no audio recording.

**Root cause.** Video-first pedagogy is a transmission model — the buyer is a passive receiver. There is no artifact unless the course explicitly demands one, which most don't because completion rates would crater.

**Curriculum7 remedy.** Every module ends in a small artifact: a paragraph, a function, a recording, a translated page. By the end of a 4-module course, the buyer has 4 artifacts, all signed-off, all exportable. The course is a body of writing about your own learning that you can re-read in a year.
