# Reading List — application

This directory is the placeholder for the Reading List SaaS app — the surface that lets a buyer take an intake, receive a syllabus, drip modules, submit work, and receive evaluations. It is intentionally a stub for the Wave 2 batch.

## Stack target

- **Framework**: [Wasp / Open-SaaS](https://github.com/wasp-lang/open-saas) — full-stack TypeScript with Prisma, Auth, Stripe-style billing slots, and a React app.
- **Domain**: `app.personalized-courses.prin7r.com` (subdomain reserved; not yet wired in DNS / Traefik).
- **Auth**: Open-SaaS's email + magic-link, plus optional GitHub for the engineer-learner cohort.
- **Billing rail**: NOWPayments crypto invoice (mirrored from `apps/landing/`), with Plisio as backup. The same `lib/nowpayments.ts` pattern in the landing applies here for course-purchase invoicing.
- **Storage**: Postgres (managed) + S3-compatible object store for student-submitted artifacts (essays, audio, code archives).
- **Course generation**: GLM 5.1 Flash for syllabus drafts (cheap, good for structured output), Claude 4.7 Sonnet for evaluation grading (precise rubric application). Reading verification against an open citation database (Crossref / OpenLibrary).
- **Drip queue**: a small worker that reads scheduled deliveries from a `course_drip` table and posts the next module via email + in-app inbox.

## Why a stub for Wave 2 batch

The Wave 2 batch deliverable is the landing + the buying motion + the brand. Generating courses requires a per-student LLM cost ($1.50–$3.50 per course at current GLM/Claude pricing), reading-verification infra, an email infrastructure with deliverability sorted, and an onboarding flow that is honest about what gets generated vs. authored. None of those are usefully shippable inside the batch window — but the landing's `/api/checkout/nowpayments` route already sends real, named order ids, so when this app boots, the orders flow into a real billing trail from day one.

## Bootstrap when the time comes

```bash
# 1. fork open-saas in place
gh repo clone wasp-lang/open-saas /tmp/open-saas
rsync -a /tmp/open-saas/template/ ./
rm -rf .git  # keep the parent repo's git history

# 2. swap the brand
#    - apps/app/src/client/theme.ts ← /apps/landing/app/globals.css palette
#    - apps/app/main.wasp ← name "ReadingList", title "Reading List"
#    - apps/app/src/client/icon.svg ← /apps/landing/app/icon.svg

# 3. wire NOWPayments
#    - port apps/landing/lib/nowpayments.ts → apps/app/src/server/payments/
#    - add `course_purchase` row when an IPN fires `paid=true`
#    - kick off the syllabus-generation worker on `paid=true`

# 4. add the intake form
#    - one declared goal (rich text, 200 char hard cap)
#    - one current-level paragraph (rich text, 800 char soft cap)
#    - one desired cadence (1 / 2 / 4 modules per month)
```

## Status

- 2026-05-08 — stub created with Wave 2 landing.
- _Next_ — fork open-saas after the cohort-building wave finishes (Wave 3 milestone).

For now, the landing is the real product surface. Buyers email `tutor@personalized-courses.prin7r.com` after invoice settlement and the studio hand-builds the first cohort of syllabi to validate the rubric pipeline before automating it. This is intentional: the syllabus is a content product first and an LLM artefact second.
