# 03 · User journeys

Three journeys, each from first contact to recurring use. The system is designed so each journey converges on the same drip cadence by the end of week one.

## Journey 1 — Mara, the engineer with a 30-day deadline

**Discovery (T0).** Mara reads a Hacker News comment that links to `personalized-courses.prin7r.com`. She lands on the masthead. She reads the hero, scans the syllabus-of-one card, sees "ship a Rust CLI in 30 days" and laughs because that is literally on her Trello. She scrolls to the sample syllabus and reads the modules. She closes the tab. (Day 0.)

**Return (T+24 h).** A friend in the engineering Telegram pastes the same link with the comment "this looks honest". Mara opens it on her phone, reads the FAQ, jumps to pricing, clicks "Take A single course →". The hosted NOWPayments invoice opens. She has USDC in MetaMask. She pays $149 in USDC on Polygon. The invoice clears in 90 seconds. She gets a confirmation email pointing her at the intake form.

**First value (T+48 h, Wave 3).** Mara fills the intake. Goal: "Ship a working Rust CLI with tests in 30 days." Level: "Ten years of Python. Read half the Rust book once. Got stuck at lifetimes." Cadence: weekly. Language: English. Within an hour, she gets a syllabus draft on a single page. She edits two lines: drops the introduction-to-iterators bullet because she already knows them, and asks for a tougher exercise in module 3. The studio incorporates the edits and locks the syllabus.

**Recurring use (T+8 d).** Monday 09:00 Lisbon, her first module arrives in her inbox. One Klabnik chapter, six borrow-checker drills, one evaluation that says "rewrite a Python class as a Rust struct, paste below". She submits a struct on Friday. The grader (Wave 3 worker) returns notes within 24 hours: "Module passed. Lifetimes annotation in `process_logs` is unnecessarily strict — see your own line 14." She clicks reply, asks a question, gets an answer the next morning.

**Conversion to subscription (T+30 d).** On day 30 she ships the CLI. The course closes with a one-page summary of what she built and what she learned. She gets an email asking if she'd like to keep going on a new goal. She picks "B1 → B2 Spanish for the next quarter" and converts to the standing subscription at $39/month.

## Journey 2 — Diego, the PM who already has a tutor

**Discovery (T0).** Diego's private Spanish tutor (Lola, in Mexico City) emails him a screenshot of a Twitter thread that mentions Reading List. He clicks. He reads the hero with skepticism — he has been burned by Babbel and Duolingo. He scrolls to the pricing. He sees the **coach-augmented** tier at $299/month. He reads the bullet "30-minute live tutoring call once per week" and feels suspicious.

**Return (T+3 d, with a question).** He emails `tutor@personalized-courses.prin7r.com` with: "Can the tutor be the one I already have, paid through my account here?" The studio replies in ten hours: "Yes, if Lola opts in. We sign her up as a 'studio tutor', she takes 70% of the coached-tier fee, we take 30%, and we run the syllabus + grading. Send us her email."

**First value (T+10 d).** Lola opts in. Diego subscribes to the coached tier. Intake: "B1 → B2 Spanish, with the ability to pitch product strategy in Spanish at off-sites." Level: "B1 confident in past tense, weak on subjunctive, native conversational accent." Cadence: 2 modules per month. Language of the syllabus: English (so the metadata is searchable for him), but every reading and exercise is in Spanish.

**Recurring use (T+14 d).** Lola gets a Wednesday-afternoon Zoom slot. The syllabus arrives Friday. Module one ships Monday: a podcast episode (transcribed), three vocabulary expansion drills, and an evaluation — record yourself describing your last off-site for 90 seconds. He records, uploads, Lola annotates. The next module adapts: subjunctive is brought forward two weeks because Lola's note says "ready earlier than I thought".

**Recurring use (T+90 d).** Diego pitches in Spanish at a leadership off-site. He keeps the subscription for two more quarters. Lola earns more in two months than she does in three months on iTalki.

## Journey 3 — Hannah, the eng manager buying for a 5-person study group

**Discovery (T0).** Hannah is a senior engineering manager at a 200-person company in Berlin. Her L&D budget got slashed; her team's Coursera-for-Business renewal is due in six weeks. She asks in the engineering managers' Slack: "Anyone using something other than Coursera for self-directed learning?" An older manager replies with a link to Reading List.

**Return (T+1 d).** Hannah scrolls to the "For teams · for tutors" block in the pricing section. She emails `cohorts@personalized-courses.prin7r.com` asking about a five-seat cohort. The studio replies: "$35/seat/month, minimum five seats, twelve-month commitment. Each engineer declares their own goal. We can run a Wednesday round-robin if you want shared ritual."

**First value (T+7 d).** Five engineers each fill an intake. Five different goals: Rust, Kubernetes operators, a PhD-style stats refresher, advanced PostgreSQL, ML system design. Each gets a personalized syllabus. The Wednesday round-robin is optional but four of five take it.

**Recurring use (T+30 d).** Modules drip Mondays. The Wednesday round-robin is a 25-minute meeting where each engineer reads aloud a paragraph from their reading and explains it. Hannah notices the team starts citing each other's modules in PR reviews. The accuracy of intuition on system-design discussions visibly improves.

**Recurring use (T+12 m).** Renewal time. All five seats stay; one engineer left the company; the seat is reassigned to a new joiner who picks "Erlang in 90 days". Hannah extends the contract to seven seats.

## Common journey shape

In each journey, the conversion path is:

1. The hero copy is read with skepticism.
2. The sample syllabus is read with skepticism, but slower.
3. The pricing copy is read with curiosity.
4. The FAQ is read carefully, especially "Is this just an LLM?".
5. The buyer either (a) clicks **Take ${tier} →** and pays, or (b) emails the desk and pays after one round of human reassurance.

Reading List is built for the second path as well as the first. The desk replies within ten hours, hand-wires invoices when needed, and treats every email as part of the product.
