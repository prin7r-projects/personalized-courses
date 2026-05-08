# Curriculum7 — Personalized courses on demand

> An agent-native learning studio. Tell us your goal and your current level, get back a personalized syllabus — readings, videos, exercises, evaluations — generated for you and dripped at a sustainable pace.

- **Live**: <https://curriculum7.com> (alias <https://personalized-courses.prin7r.com>)
- **Notion opportunity**: `3543ceec-2619-81ed-a815-e1475713e1e5`
- **Wave**: 2 · **Stack**: SaaS · **Status**: landing live · app stub
- **Brand**: a private tutor's notebook (parchment + walnut + gilt + marginalia red)

## Repo structure

```
/DESIGN.md            Canonical design + style guide (15 sections)
/README.md            This file
/docs/                The 10 strategy / design docs + pitch deck
  01-brand-identity.md      02-architecture.md       03-user-journeys.md
  04-pain-points.md         05-audience-profile.md   06-sales-channels.md
  07-sales-strategy.md      08-marketing-strategy.md 09-go-to-market.md
  10-pitch-deck.md          pitch-deck.html
  screenshots/        Desktop + mobile production screenshots
/apps/
  landing/            Next.js 15 + ShadCN-style — public marketing site
  app/                Wasp / Open-SaaS scaffold (stub for Wave 2 batch)
/Dockerfile.landing   Multistage Next.js standalone build
/docker-compose.yml   Single landing service · Traefik labels · env_file: .env
/.github/workflows/   CI: validates `next build`
/.env.example         Public surface for env (live values live on the deploy host)
/LICENSE              MIT
```

## Quickstart

```bash
# 1. install + dev
pnpm --dir apps/landing install
pnpm --dir apps/landing dev    # http://localhost:3000

# 2. local production build
pnpm --dir apps/landing build && pnpm --dir apps/landing start

# 3. container build
docker compose build && docker compose up -d
```

For NOWPayments crypto checkout to function, the runtime must have `NOWPAYMENTS_API_KEY` and `NOWPAYMENTS_IPN_SECRET` set. See `.env.example`. Live values live in `/opt/prin7r-deploys/personalized-courses/.env` on the storage-contabo deploy host (gitignored).

## Screenshots

Production screenshots are committed at `/docs/screenshots/landing-desktop.png` and `/docs/screenshots/landing-mobile.png`. They are linked in `DESIGN.md` section 13.

![Curriculum7 landing — desktop](docs/screenshots/landing-desktop.png)
![Curriculum7 landing — mobile](docs/screenshots/landing-mobile.png)

## Brand sketch

- Essence: **Bibliographic.** A private tutor's reading list — written for one student.
- Palette: parchment `#F4ECD8`, vellum `#EADFC2`, walnut `#3A2A1A`, oak `#5C4327`, sepia `#8A6E45`, gilt `#A87E2C`, marginalia `#A4321F`, scholar-green `#3F5A3F`.
- Type: EB Garamond (display + body) · Inter (UI labels) · Caveat (handwritten margin notes) · JetBrains Mono (kickers, dates).
- Voice: editorial, declarative, slightly under-stated. We say "a syllabus of one", not "AI-powered learning".

Full brand identity in [`/docs/01-brand-identity.md`](docs/01-brand-identity.md). All design tokens locked in [`/DESIGN.md`](DESIGN.md).

## License

MIT — see [`LICENSE`](LICENSE).
