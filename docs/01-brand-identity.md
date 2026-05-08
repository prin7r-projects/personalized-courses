# 01 · Brand identity

## Brand pyramid

- **Essence (1 word)**: Bibliographic.
- **Personality (3 traits)**: Editorial · Patient · Plain-spoken.
- **Values (3)**: Fit-for-one · Honesty about effort · A finished course beats a heroic platform.
- **Attributes (5)**: Hand-built · Slow-dripped · Cite-everything · Refundable · Owned by the student.

## Positioning statement

> For self-directed adult learners who have bounced off Coursera, Udemy, and YouTube boilerplate, **Curriculum7** is a personalized-course studio that turns one declared goal and one paragraph of context into a short, fully-graded syllabus dripped at a sustainable pace — unlike content marketplaces that sell you the same course as a million other students, because we build the course around your specific ignorance and your specific deadline.

## Audience persona — primary

**Mara, 34, backend engineer in Lisbon.** Ten years of Python at three startups. Wants to ship a Rust CLI by end of June for an internal tool. Bought the Klabnik book in January, read 150 pages, lost the borrow checker, has a Trello card titled "finish Rust" that has been there for two years. Reads Hacker News on the weekend. Lives in Telegram, GitHub, a single Notion workspace. Has paid for two Udemy courses she never finished. Will not pay for anything that does not respect her time. Pays in EUR, comfortable with USDC, hates dealing with international card fees.

**Goals**: ship the CLI · stop feeling stupid about lifetimes · have something concrete to point at on her CV.

**Frustrations**: 47-hour video courses · "AI tutor" chatbots that sound enthusiastic but are wrong · forums full of dunning · cohorts that meet on a fixed week she doesn't have free.

**Channels**: Hacker News, the Rust subreddit, GitHub trending, two Telegram engineering chats.

## Audience persona — secondary

**Diego, 41, product manager in Mexico City.** Wants to take his Spanish from B1 to B2 by autumn so he can pitch in Spanish at his next two off-sites. Has tried Babbel, three weeks. Tried Duolingo, six. Tried iTalki, lost the rhythm when his calendar shifted. Has a private tutor he sees twice a month and respects, but the tutor only has one hour per session and gives him reading lists on paper. Pays in USD via the local Mexican rail; comfortable with crypto for cross-border purchases.

**Goals**: pitch in Spanish · stop sounding apologetic · make the reading lists from his tutor scale.

**Frustrations**: gamified streak apps · classroom-style cohorts on Eastern Time · "personalized" plans that just permute a 200-card deck.

**Channels**: Twitter (in Spanish), private WhatsApp study group, monthly newsletters from working linguists.

## Voice & tone

**Three do's**

1. **Use the editorial voice.** The studio is the desk; the student is the reader. We write _to_ a single person, not _for_ a market.
2. **Name every reading.** Specificity is the brand. "Klabnik & Nichols ch. 4" is good; "the Rust book" is not.
3. **Use restraint.** One italicized phrase per paragraph at most. One marginalia note per section. Less is the brand.

**Three don'ts**

1. **Never say "AI tutor".** We have agents and a human-in-the-loop tier. We are not an "AI tutor", because the phrase is everywhere and means nothing.
2. **Never claim certificates or "career outcomes".** We build courses; outcomes belong to students.
3. **Never gamify.** No streaks, no points, no leaderboards. Adult learners come here to escape gamification, not buy more of it.

**Sample sentence**

> "Tell us your goal in one sentence and your current level in two. Curriculum7 answers with a syllabus written for one student — readings, exercises, evaluations — dripped at a pace that respects how an adult studies."

## Visual system

**Palette** (locked in `/apps/landing/tailwind.config.ts` and `/DESIGN.md` §4):

| Role          | Token         | Hex        | Notes                                          |
|---------------|---------------|------------|------------------------------------------------|
| surface       | `parchment`   | `#F4ECD8`  | the page itself · warm aged paper              |
| surface alt   | `vellum`      | `#EADFC2`  | cards on the parchment, slightly heavier       |
| ink (primary) | `walnut`      | `#3A2A1A`  | headings, navigation, primary text             |
| body          | `oak`         | `#5C4327`  | long passages, descriptions                    |
| muted         | `sepia`       | `#8A6E45`  | mono kickers, captions, dates                  |
| accent        | `gilt`        | `#A87E2C`  | hairlines, eyebrow rules, focus rings          |
| editorial     | `marginalia` | `#A4321F`  | margin notes, button hover, sparing flourish   |
| affirmative   | `scholar`     | `#3F5A3F`  | "passed" / "completed" markers in the app      |

**Typography**

- **Display + body**: EB Garamond (Google Fonts). The course is a printed thing on a paper page.
- **UI labels**: Inter — for buttons, form fields, the rare bit of UI chrome.
- **Margin notes**: Caveat — handwritten, marginalia red, sparing.
- **Kickers / dates**: JetBrains Mono — small caps, 11px, 0.18em tracking.

**Logo concept**

A walnut square plate, EB Garamond `C7` foil-stamped in parchment, a single gilt rule across the bottom. Nothing else. The wordmark `curriculum7.` runs to the right of it in mono, with a marginalia-red period — a small stamp at the end of a sentence.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect x="0" y="0" width="64" height="64" rx="2" fill="#3A2A1A"/>
  <text x="32" y="44" text-anchor="middle"
        font-family="EB Garamond, Georgia, serif"
        font-weight="600" font-size="34" fill="#F4ECD8">C7</text>
  <rect x="14" y="52" width="36" height="2" fill="#A87E2C"/>
</svg>
```

**Spacing & radius scale**

- 1rem = 16 px. Multiples of 4 / 6 / 8 / 12 / 16 / 24 / 28 / 40 / 56.
- Radius: `0` everywhere except SVG corners (`2px`) and pill chips (`9999px` for the rare role badge).
- Hairlines: 1 px @ `walnut/15` opacity for soft separators; 1.5 px gilt for eyebrow rules.

**Motion principles**

- 100 ms linear hover transitions. Nothing eases longer than 350 ms.
- Animations are reserved for two things: the small `ink-dot` pulse on the kickoff stamp, and `prefers-reduced-motion` is respected (animations stop).
- No parallax. No scroll-jacking. No "AI typing" effects.

## Forbidden

- Edtech orange & blue (e.g. Khan, Coursera primary).
- "AI tutor" purple gradients (Cody, Brilliant 2024 era, Anthropic-adjacent).
- Stock photos of a laptop on a wooden table with a coffee mug.
- Certificate badge mockups in the hero.
- Streak counters, XP, leaderboards, "personalized for you in 30 seconds!" copy.
- Lorem ipsum, "TODO" copy, or any AI-generated buzzphrase ("supercharge", "revolutionize", "10x").
