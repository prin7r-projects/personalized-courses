# 13 · Implementation plan

> **Hand-off ready.** A fresh implementation agent should read `01-brand-identity.md`,
> `02-architecture.md`, `11-user-stories-and-scenarios.md`, and `12-technical-specification.md`
> before this doc. Phase 0 has already shipped (Wave 2 landing, NOWPayments wired). Phases 1–6
> are Wave 3 build work and remain to be implemented.
>
> **Repo:** https://github.com/prin7r-projects/personalized-courses
> **Live:** https://personalized-courses.prin7r.com (landing live, app stubbed)
> **Deploy host:** storage-contabo (`/opt/prin7r-deploys/personalized-courses`)
> **Secrets path:** `/Users/keer/.nth-kir-keys.env` (NOWPAYMENTS_API_KEY, NOWPAYMENTS_IPN_SECRET,
> POSTMARK_SERVER_TOKEN, ANTHROPIC_API_KEY, B2_KEY_ID, B2_APP_KEY, DATABASE_URL)
> **Tone constraint:** editorial / parchment-vellum-walnut palette, lowercase headings, no emoji.
> See `01-brand-identity.md` §Visual.

## Phase 0 — Wave 2 landing (DONE)

- **Goal.** Public landing + crypto checkout + branded payment-error page.
- **Tasks.** ✅ all delivered.
- **DoD.** ✅ HTTP 200, NOWPayments invoice round-trip, branded 503 fallback when env unset, Postmark
  receipt email working, screenshots in `/docs/screenshots/`.

## Phase 1 — Wasp / Open-SaaS scaffold + auth

- **Goal.** Stand up `apps/app` on the same compose stack with email + magic-link auth and a
  one-time intake-token redemption flow.
- **Tasks.**
  1. Fork `wasp-lang/open-saas`, lift the `template/app` directory to `apps/app`.
  2. Strip Stripe + Lemon Squeezy modules; we route payments through Wave 2's landing only.
  3. Add `IntakeToken` model: `{token, email, course_id, expires_at}` (HMAC + 7 day expiry).
  4. Implement `POST /api/intake/redeem` that mints a session from a valid token.
  5. Wire Postmark for transactional emails (templates: intake link, syllabus draft, drip, grade).
  6. Compose: `apps/app` on port 3100, Traefik label `app.prin7r.com` (subdomain decision pending
     — fallback to `personalized-courses.prin7r.com/app`).
  7. Smoke-test: pay → IPN → email with intake link → click → session.
- **Dependencies.** Phase 0 (NOWPayments live), `.env` populated.
- **Effort.** ~120 agent tool-uses, ~6h wall-clock.
- **DoD.**
  - Pay 1 USDC test invoice, receive intake email within 60s of `payment_status=finished`.
  - Intake token redeems exactly once; second click shows "expired or used".
  - `apps/app` Docker image builds reproducibly.
  - Magic-link login works in incognito.
- **Hand-off context.** `apps/landing/.env` is the source-of-truth for NOWPayments. Do NOT
  duplicate keys in `apps/app/.env`; instead share via compose `env_file:` from a parent `.env`
  symlink. Postmark is rate-limited to 10k/day on free tier.

## Phase 2 — Intake form + syllabus worker (LLM, no verifier yet)

- **Goal.** Student submits goal + level → syllabus draft persists 24h later.
- **Tasks.**
  1. `apps/app` route: `/intake/[token]` form (goal: 1 sentence required, level: 2 paragraphs
     required, locale: en|es|pt).
  2. `POST /api/intake` saves into `courses` (`status=draft`).
  3. Worker `worker/syllabus`: cron every 5min, picks `status=draft` courses, calls Claude 4.7
     with the studio system prompt (lifted from `01-brand-identity.md` §Voice).
  4. Persist syllabus into `modules` table; mark `status=syllabus_pending`.
  5. Email student with the draft + an "approve" link.
  6. Approve link → `POST /api/courses/:id/approve` → `status=syllabus_approved`, schedule drip 1.
- **Dependencies.** Phase 1 complete; ANTHROPIC_API_KEY in `.env`.
- **Effort.** ~150 tool-uses, ~8h.
- **DoD.**
  - Mara persona scenario A end-to-end: pay → intake → draft email lands within 24h.
  - Syllabus has 6–10 modules (default 8). Each module names ≥1 reading.
  - Approval flips status; drip 1 schedules at `now() + 24h`.
- **Hand-off context.** Use a system prompt of ≤2000 tokens (cache it). Output schema is JSON;
  validate with Zod. Editorial guarantee: do NOT include readings unless they look citable
  (book/chapter, paper, or repo path) — even before the verifier exists.

## Phase 3 — Citation verifier + operator queue

- **Goal.** Every reading is machine-verified before drip 1; operator can replace red flags.
- **Tasks.**
  1. `worker/verify`: for each module, check Crossref / OpenLibrary / GitHub raw based on the
     `source` field. Store `verified_at` per reading.
  2. Surface in `apps/app` operator queue: red flags first, deadline next.
  3. `POST /api/operator/syllabi/:id/replace_reading` accepts `{module_idx, reading_idx, new_reading}`
     and re-verifies.
  4. Block drip 1 from sending until all modules `verified_at IS NOT NULL`.
  5. Operator dashboard sortable by deadline.
- **Dependencies.** Phase 2 complete.
- **Effort.** ~120 tool-uses, ~6h.
- **DoD.**
  - Scenario C end-to-end: operator replaces yellow → verifier accepts → drip 1 sends.
  - Crossref / OpenLibrary lookup p95 < 800ms.
  - No drip ever leaves the system with a red-flagged reading (test by injecting a hallucinated
     ISBN and verifying the drip stays unsent).
- **Hand-off context.** Crossref is polite-pool; set the `User-Agent: Reading List
  (mailto:hi@reading-list.prin7r.com)`. Cache hits 24h; misses 1h.

## Phase 4 — Drip cron + grade loop

- **Goal.** 8 weekly drips per course, with submit + grade roundtrip.
- **Tasks.**
  1. `worker/drip` cron `0 9 * * 1` (UTC; per-student local-time scheduling is a Phase 6 task).
  2. Send via Postmark; mark `sent_at`.
  3. `POST /api/submissions` accepts file or markdown text; uploads to Backblaze B2; queues a
     grade job.
  4. `worker/grade` runs Claude 4.7 with the rubric → score + per-criterion notes.
     `confidence < 0.7 OR coverage < 80%` → `status=flagged`, queue for operator.
  5. Email student with grade.
- **Dependencies.** Phases 1–3 complete; B2 bucket + DATABASE_URL.
- **Effort.** ~140 tool-uses, ~7h.
- **DoD.**
  - Scenario D end-to-end across 8 modules in a sped-up test (compress drip schedule to hours).
  - Grade returns within 48h on a synthetic submission.
  - Flagged submissions appear in operator queue.
- **Hand-off context.** Postmark batch-API is faster for >50 emails. `worker/grade` should retry
  up to 2× on LLM 5xx; on 3rd failure, operator queue.

## Phase 5 — Pause/resume + refund tooling

- **Goal.** Self-serve pause; operator-driven refund.
- **Tasks.**
  1. `POST /api/courses/:id/pause` shifts all unsent drips by `days`.
  2. Email confirmation + dashboard banner.
  3. Operator-only `POST /api/operator/courses/:id/refund` cancels remaining drips, calls
     NOWPayments mass-payout (or queues a manual refund task), marks `status=refunded`.
  4. Audit log every refund.
- **Dependencies.** Phase 4 done.
- **Effort.** ~80 tool-uses, ~4h.
- **DoD.**
  - Diego scenario E end-to-end.
  - Refund within 30 days (drip ≤3) succeeds; after drip 3, refund tool blocks with operator
    override required.

## Phase 6 — Localization + production polish

- **Goal.** Spanish / Portuguese drips; per-student timezone scheduling; perf budget hit.
- **Tasks.**
  1. Add `locale` to drip template selection; translate Postmark templates.
  2. Per-student local-time drip scheduling (default 09:00 in `students.tz`).
  3. Lighthouse pass on `/`; LCP < 2.0s p95.
  4. Loki + Grafana dashboard published; pager wired to operator phone.
  5. Backups: weekly Postgres dump → B2; verify restore.
- **Dependencies.** Phases 1–5.
- **Effort.** ~100 tool-uses, ~5h.
- **DoD.**
  - Scenario B end-to-end in Spanish.
  - p95 latencies match `12-technical-specification.md` §9.
  - Restore-from-backup drill executed and passes.

## Cross-cutting concerns

- **Accessibility:** all email templates pass WCAG AA contrast; alt text on every image; landing
  passes axe-core. Address in Phase 0 (already partial) and revisit in Phase 6.
- **i18n:** introduced in Phase 6, but every user-facing string from Phase 1 onward goes through
  `t(key)` so the wiring is in place.
- **Mobile:** landing is mobile-first from Phase 0. The intake form (Phase 2) and operator queue
  (Phase 3) must both render usable on a 375px viewport.
- **Telemetry:** structured logs from Phase 1; metrics from Phase 4; alerts in Phase 6.

## Risk register

| Risk | Owner | Mitigation |
|---|---|---|
| LLM hallucinated readings reach a student | Studio operator + verifier | Phase 3 hard-gate; red flag stops drip; operator queue surfaces all red-flagged before drip 1. |
| NOWPayments outage during peak | Ops | Manual Wise invoice fallback; operator can mint orders manually; banner on `/` if NOW returns 5xx. |
| Postmark rate limit hit on big drip morning | Ops | Stagger drip cron across the hour; batch-API for >50 emails. |
| Grader confidence degrades silently | Studio operator | Confidence histogram alert (`p50 < 0.6 for 24h` pages). |
| Student data PII leak | All engineering | No PII in logs; redact list enforced; quarterly audit. |

## Resume instructions for a cold-start agent

1. `git clone https://github.com/prin7r-projects/personalized-courses && cd personalized-courses`
2. Read `01`, `02`, `11`, `12` in order.
3. Check `wave2-status.json` for the current state of Wave 2 deploy (it's COMPLETE).
4. Pick the next phase whose DoD is unmet. Run that phase's tasks; update DoD when each item
   passes; commit per task; push.
5. When all phases done, this doc graduates to a v2 with the post-mortem.
