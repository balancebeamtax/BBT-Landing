# bbt-landing

Landing page funnels for **balancebeamteam.com** — Balance Beam Bookkeeping & Tax.

> ⚠️ **Architecture lock:** `balancebeamteam.com` and `balancebeamtax.com` are separate projects. This repo serves the team domain only. Do not introduce blog routes, SEO content, or bb-portal artifacts here.

## Stack

- Next.js 14 (App Router, static export)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui (Radix UI primitives, copy-pasted into `src/components/ui/`)
- react-hook-form + zod for forms
- Deployed to Vercel

## Local dev

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev                  # http://localhost:3000
```

## Structure

```
src/
  app/
    layout.tsx                       # root layout, fonts, GA/GTM
    page.tsx                         # homepage (placeholder for now)
    extension-cleanup-review/
      page.tsx                       # /extension-cleanup-review/
  components/
    ui/                              # shadcn/ui primitives (Radix-based)
    landing/                         # landing-page-specific blocks (Hero, Form, etc.)
  lib/
    utils.ts                         # cn() classname merge helper
    analytics.ts                     # GA4/GTM event helpers
    schemas/
      extension-cleanup.ts           # zod schema for the intake form
legacy/                              # archived static HTML + assets (do not edit; reference only)
```

## Funnels

| URL | Status | Spec |
|---|---|---|
| `/extension-cleanup-review` | In build (v1) | `legacy/landing-pages/extension-cleanup-review.md` |
| `/small-business-accounting` | Planned | — |
| `/quickbooks-cleanup` | Planned | — |

## Permanent rules

- Each funnel has its own dedicated Calendly event type + URL. Never share Calendly URLs across funnels.
- Lead notifications consolidate to `leads@balancebeamtax.com` via GHL workflows. Subject prefix `[bbt-team/<funnel>]`.
- Visitor-facing contact addresses live on `balancebeamteam.com`: `dave.rios@`, `admin@`, `leads@` (forwarder).
- TCPA compliance: every SMS includes `Reply STOP to opt out`. Sender number must be A2P 10DLC registered.
- Brand voice follows the BBT brand voice skill (calm, plain-English, no fear hooks, no hacks/loopholes/secrets).

## Related

- Notion hub: [Balance Beam Team — Landing Page Funnels](https://www.notion.so/3690198d6abc81d2bbc6f5c128c63306)
- Workflow build spec: `extension-cleanup-workflow-build-spec.md` (workspace; not in repo)
- Tax-side companion: [`bb-portal`](https://github.com/balancebeamtax/bb-portal)
