# 02 · Architecture

## High-level diagram

```mermaid
flowchart LR
    subgraph BROWSER[Buyer's browser]
      LAND[apps/landing<br/>Next.js 15 + Tailwind]
      INTAKE[Intake form<br/>(Wave 3 in apps/app)]
    end

    subgraph EDGE[Edge / proxy]
      TR[storage-contabo<br/>Traefik · Let's Encrypt]
    end

    subgraph LANDING_HOST[storage-contabo · /opt/prin7r-deploys/personalized-courses]
      LANDC[Docker · landing<br/>Next.js standalone]
      ENVF[/.env file<br/>NOWPAYMENTS_API_KEY<br/>NOWPAYMENTS_IPN_SECRET/]
    end

    subgraph PAYMENTS[NOWPayments]
      INV[Hosted invoice]
      IPN[IPN webhook<br/>HMAC-SHA512]
    end

    subgraph APP_LAYER[apps/app · Wave 3]
      WASP[Wasp / Open-SaaS<br/>Auth · Prisma · React]
      WORKER[Drip worker<br/>Bun]
      LLM_GATE[LLM gateway<br/>GLM 5.1 + Claude 4.7]
      CIT[Reading verifier<br/>Crossref · OpenLibrary]
    end

    subgraph DATA[Data]
      PG[(Postgres<br/>orders · students · courses · drips)]
      OBJ[(S3-compatible<br/>essays · audio · code)]
      MAIL[Email · Postmark]
    end

    LAND -- "POST /api/checkout/nowpayments" --> LANDC
    LANDC -- "POST /v1/invoice (x-api-key)" --> INV
    INV -- "303 redirect" --> BROWSER
    INV -- "buyer pays USDT/USDC" --> IPN
    IPN -- "POST /api/webhooks/nowpayments<br/>(x-nowpayments-sig)" --> LANDC
    LANDC -- "verifyHmacSha512()" --> LANDC
    BROWSER -- "intake (Wave 3)" --> INTAKE
    INTAKE -- "save goal+level" --> WASP
    WASP -- "course id, plan" --> WORKER
    WORKER -- "draft syllabus" --> LLM_GATE
    LLM_GATE -- "verify named refs" --> CIT
    CIT -- "ok / replace" --> WORKER
    WORKER -- "weekly drip" --> MAIL
    WORKER --> PG
    INTAKE -- "essays / code" --> OBJ
    LANDC --> ENVF
    BROWSER --> TR --> LANDC
```

## Components — Wave 2 (shipped)

| Component                | Tech                          | Owns                                                   |
|--------------------------|-------------------------------|--------------------------------------------------------|
| `apps/landing`           | Next.js 15 + Tailwind         | marketing site, three-tier pricing, NOWPayments CTA    |
| `/api/checkout/nowpayments` | Next.js route handler      | creates a hosted invoice, returns the redirect URL     |
| `/api/webhooks/nowpayments` | Next.js route handler      | verifies HMAC-SHA512, logs `paid=true` events          |
| `lib/nowpayments.ts`     | Server module                 | `PLANS`, `createNowpaymentsInvoice`, `verifyNowpaymentsIpn` |
| `lib/env.ts`             | Server module                 | `optionalEnv`, `requiredEnv`, `MissingEnvError`        |
| `Dockerfile.landing`     | Alpine multistage             | reproducible standalone build                          |
| `docker-compose.yml`     | Compose v2                    | Traefik labels, `env_file: .env`, restart policy       |

## Components — Wave 3 (planned, stubbed)

| Component             | Tech              | Owns                                                              |
|-----------------------|-------------------|-------------------------------------------------------------------|
| `apps/app` (Wasp)     | Wasp / Open-SaaS  | auth, intake form, course library, payments billing               |
| `worker/drip`         | Bun + cron        | reads `course_drip` rows, dispatches the next module to email     |
| `worker/syllabus`     | Bun               | LLM-driven syllabus draft, rubric synthesis, verification of cites |
| `worker/grade`        | Bun + Claude      | grades student submissions against the rubric, returns notes      |
| `db`                  | Postgres 16       | `students`, `courses`, `modules`, `drips`, `submissions`, `orders` |
| `obj`                 | S3-compatible     | student-submitted artifacts (essays, audio, code)                  |
| `mail`                | Postmark          | drip emails, evaluation feedback, reactivation                     |

## Data flow — landing to invoice (live in Wave 2)

1. Buyer clicks the **Take ${tier} →** button on the landing.
2. `pricing-cta.tsx` POSTs `{ plan }` to `/api/checkout/nowpayments`.
3. Route handler validates `plan ∈ {single, subscription, coached}`, looks up `PLANS[plan]`, and computes `baseUrl`.
4. Server module `createNowpaymentsInvoice` calls `POST https://api.nowpayments.io/v1/invoice` with the API key from `NOWPAYMENTS_API_KEY` and a synthetic `order_id` of shape `readinglist_<plan>_<ts>_<rand>`.
5. NOWPayments returns `{ id, invoice_url, ... }`. The route handler returns `{ invoice_url, invoice_id, ... }`.
6. Client redirects the browser to the hosted invoice page.
7. NOWPayments calls `POST /api/webhooks/nowpayments` once the invoice is paid (or otherwise transitions). The handler reads `x-nowpayments-sig`, recomputes HMAC-SHA512 over the alphabetically-sorted JSON, and accepts only on a timing-safe match.
8. Verified payloads are logged with the `[READING_LIST_NOWPAYMENTS_IPN]` tag. Order-state persistence is a Wave 3 concern.

## Data flow — buyer to course (Wave 3)

1. After invoice settlement, buyer creates an account at `app.personalized-courses.prin7r.com` (one-time link emailed).
2. Intake form: one declared goal (200 chars), one current-level paragraph (800 chars), preferred cadence (1 / 2 / 4 modules per month), preferred language.
3. `worker/syllabus` drafts the syllabus with GLM 5.1 Flash, applies the rubric template for the topic family, and submits each named citation to the verifier (`worker/cite-verify`) which queries Crossref + OpenLibrary.
4. Tutor (human) reviews the syllabus draft, edits, signs off. Wave 3 ships a 24-hour SLA for first review.
5. Buyer receives the syllabus by email. Buyer can request revisions; up to three rounds before lock.
6. On lock, `worker/drip` schedules one row per module in `course_drip`, with the timestamp the buyer chose.
7. Each Monday at the buyer's local 09:00, `worker/drip` posts the next module to email + the in-app inbox.
8. Buyer submits their work. `worker/grade` runs Claude 4.7 against the locked rubric (or, on the coached tier, hands off to a human grader who annotates inline).

## Deploy topology

- **Domain**: `personalized-courses.prin7r.com` (Wave 2) and `app.personalized-courses.prin7r.com` (reserved for Wave 3, no DNS yet).
- **Wildcard DNS**: `*.prin7r.com → 161.97.99.120` already exists; no per-subdomain record required.
- **Reverse proxy**: `dokploy-traefik` on storage-contabo (host network mode), HTTP-01 LE, `letsencrypt` resolver, email `kee22r@gmail.com`.
- **Container**: `personalized-courses-landing` (single replica), exposed on container port 3000, Traefik labels select it.
- **Env injection**: `env_file: .env` in `docker-compose.yml`, `.env` lives in `/opt/prin7r-deploys/personalized-courses/.env` only — never committed.
- **Logs**: `journalctl -u docker.service` on the host plus `docker logs personalized-courses-landing`.

## Security posture (Wave 2)

- The IPN secret is verified via `crypto.timingSafeEqual` over hex-decoded buffers — no string-equality leak.
- The API key is read from env at runtime; no module-level capture and no logging of the key value.
- Every `/api/checkout/nowpayments` response sets `Cache-Control: no-store` implicitly via `dynamic = "force-dynamic"`.
- Server-only NOWPayments calls; the API key never touches the browser bundle.
- Failed env reads emit HTTP 503 with a `missing_env` body — operator-readable, not user-helpful, by design.
