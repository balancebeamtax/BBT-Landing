# IMP-233 — Books Rescue Diagnostic Page — Build Packet

**Status:** Ready to build (depends on the locked contract)
**Lane:** BBTeam — `balancebeamteam.com` only
**Funnel:** Books Rescue Diagnostic (IMP-233) — route `/books-rescue-diagnostic`
**Architecture:** Path B (page → `/api/books-rescue-submit` → n8n)
**Date:** 2026-06-16

**Reads from (locked):**
- `imp-233-books-rescue-quiz-scorer-contract.md` — the 7 questions, point values, cutoffs (130/102/66), deadline floor, and the **Section 8 payload** the page must emit. *Place this in `docs/imp/` so Claude Code can read it.*
- `imp-233-books-rescue-submit-handler-spec.md` — the route this page POSTs to.
- `books-rescue-wireframe.md` — result-page structure + base copy.

**This is a port-and-correct, not greenfield.** The static prototypes `public/books-rescue-quiz-v3.html` and `public/books-rescue-diagnostic.html` are the visual/layout starting point. They have **drifted** from canon and must be corrected on the way in (Section 4). The target `src/app/books-rescue-diagnostic/page.tsx` does not exist yet.

---

## 1. What's being built

A single client-driven page at `/books-rescue-diagnostic` that runs the full funnel as a state machine — no page reloads, score held in client state:

```
cover → 7 quiz steps (progress) → "analyzing" → result (headline + diagnosis + scorecard)
      → contact capture (POST to n8n here) → booking (Calendly) → confirmation note
```

**Submission timing:** the POST to `/api/books-rescue-submit` fires at **contact capture** — the first point we have an email — carrying the quiz answers + client-computed score/tier + contact + attribution. Booking follows on success. (This guarantees the lead is captured even if they don't finish booking. The capture-gating point is adjustable — flag if you want results gated *behind* capture instead of shown before it.)

---

## 2. Build approach (read the repo first)

- **Mirror the live Extension Cleanup page's structure** as the proven template for this repo — its client-interactivity pattern, how it POSTs to its API route, how it consumes the design system, and the build/render config. Use it as a *structural* reference only. Do **not** copy its copy, slug, env vars, webhook, or Calendly URL, and do **not** modify its files.
- **Do not assume `output: 'export'`/static-only.** The repo has working API routes, so follow the existing `next.config` and rendering setup exactly — don't change it.
- The page is interactive → a client component (`"use client"`) rendered by `page.tsx`.
- **Slate Ember design system** — carry the tokens already in the prototypes (`--bg:#ECEAE5`, `--primary:#017B82`, `--accent:#B87D3A`, full light + dark), fonts Instrument Serif (headings) + Plus Jakarta Sans (body). Follow whatever styling mechanism the repo already uses (Tailwind config vs CSS modules vs global CSS) — match the Extension Cleanup page; don't introduce a new styling approach.
- Mobile-first, 390px baseline. One dominant CTA throughout. Sticky bottom CTA on mobile (per wireframe).

---

## 3. The quiz (from the contract — do not invent)

Seven single-select steps, exact rewrite copy and point values from the contract, in this order:

1. `recency` · 2. `confidence` · 3. `deadline_pressure` · 4. `tx_complexity` · 5. `owner_burden` · 6. `surprise_rate` · 7. `decision_drag`

Each step records `{ key, choiceIndex }` in state. After step 7, the page computes a **display** score/tier using the contract's rubric, cutoffs (Emergency ≥130, Crisis ≥102, At-Risk ≥66, else Stable) and the deadline floor (Q3 idx 3 → min Crisis). Put the rubric/cutoffs/floor in a shared module `src/lib/books-rescue/scoring.ts` and import it — single source in the repo, mirroring the contract. **This client score is display-only; n8n recomputes authoritatively.** On submit, the answers are flattened to `q_<key>` integer keys (see §6) — n8n reads those.

---

## 4. Drift fixes (mandatory — the prototype has these wrong)

1. **Alarming copy → subtle-urgency copy.** The result prototype uses "exposure," "triage," "critical bookkeeping situation," "serious legal, tax, and operational exposure." **Remove all of it.** Result copy comes from `books-rescue-wireframe.md` and the tier variants in Section 5 — calm, plain-English, self-description not verdict, no fear hooks.
2. **Calendly: one multi-duration event, not per-tier mocks.** The prototype shows 20/30/45-min and "emergency slot" mocks. Replace with a **single real embed** of the "Books Rescue and Diagnostic" event (durations 15/30/45/60, invitee picks) reading `NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE`. Same event for all tiers.
3. **Quiz: the 7 contract questions**, not the prototype's `q1`–`q6` with `data-score-cat="reconciliation"` etc.
4. **Length-neutral call copy.** The wireframe's "In 15 minutes, the call reviews…" must become length-neutral ("a short call to walk through your results") since the call can run up to 60 min.
5. **Security fields present.** The capture form emits `website_val` (hidden honeypot, must stay empty), `time_elapsed_ms` (ms elapsed since the page/form rendered), and `cf_turnstile_response` (Turnstile token) so the deployed n8n gates work — honeypot drops if non-empty, time-guard drops if `< 12000`, Turnstile drops if invalid. If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, render the Turnstile widget; otherwise omit it. *(The earlier `_hp` / `_t` names are retired — n8n reads `website_val` / `time_elapsed_ms`.)*

---

## 5. Result section (structure from wireframe + tier copy)

Order (mobile viewports): eyebrow → **tier headline** → diagnosis → audit scorecard → "what happens on the call" → primary CTA → booking widget → confirmation reassurance.

**Tier headline + intro — DRAFT copy for review** (extends the wireframe's single version; calm, specific, no alarm):

| Tier | Headline | Intro line |
|---|---|---|
| Emergency | Your books need a structured rescue — and the timing matters. | Your answers point to meaningful gaps with a deadline already pressing. This is the most time-sensitive path, and a focused call is the fastest way through it. |
| Crisis | Your books likely need a focused cleanup before they're reliable. | Your answers suggest the books have drifted enough to affect confident reporting, with a deadline in view. A short call maps the fastest cleanup path. |
| At-Risk | A few areas of your books are worth addressing before they compound. | Your answers show some gaps building up — manageable now, easier to fix early. A short call clarifies what to tackle first. |
| Stable | Your books are in decent shape, with a few areas to tighten. | Your answers suggest you're mostly current. A short call can confirm what's solid and tune the rest for year-round confidence. |

**Diagnosis paragraph, "what happens on the call," CTAs:** use the wireframe copy verbatim, with the length-neutral fix (#4). Primary CTA "Schedule my rescue call." 

**Audit scorecard** — data-driven from the dimension subtotals (contract Section 3 / 11). Five categories: Bookkeeping currentness, Reconciliation confidence, Tax readiness, Decision clarity, Urgency level. Each shows a severity band (low/moderate/elevated/high) derived from its source question(s) per the contract's Section 11 mapping, and the matching interpretation sentence from the wireframe's scorecard table.

**Secondary CTA — OPEN ITEM, do not wire blindly.** The wireframe lists "Send me the checklist first." Books Rescue has no checklist asset of its own, and the Extension Cleanup checklist is **out of lane for this funnel** — do not link to it. Either (a) drop the secondary CTA for v1, or (b) David provides a Books-Rescue-specific checklist. **Default: omit it** until decided.

---

## 6. Contact capture → submission

Fields: **required** first name + email; **optional** phone, company. (Phone improves follow-up for Emergency/Crisis — encourage but don't require.)

On submit, build the **contract §8 flat payload** and POST to `/api/books-rescue-submit`:
- Flat snake_case keys: `first_name`, `last_name`, `email`, `phone`, `company_name` from the form; the seven `q_recency … q_decision_drag` integer indexes (0–3) from state; `quiz_score` / `tier` from the shared scoring module (telemetry only — n8n ignores them for routing); `utm_*` flat keys from F18 if present; `website_val` + `time_elapsed_ms` + `cf_turnstile_response` for the gates; `submission_id` + `submitted_at` generated client-side.
- On `{ ok: true }` → advance to booking. On error → friendly inline retry message; do not expose internals.
- **Honeypot:** a text input named `website_val`, visually hidden **off-screen** (not `display:none`), `aria-hidden`, `tabindex={-1}`, `autocomplete="off"` — must stay empty.
- **Double-submit guard:** disable the submit control while the POST is in flight (prevents duplicate leads).
- **Preserve state on error:** keep the user's entered fields on a failed submit so they can retry without re-typing.
- The page POSTs to the **same-origin** route only — never to n8n directly; the n8n URL/secret never touch the client.

---

## 7. Booking + confirmation

- Embed the Calendly "Books Rescue and Diagnostic" event from `NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE` (invitee picks 15/30/45/60). Lazy-load the Calendly script (don't block first paint).
- Confirmation reassurance copy from the wireframe. Calendly's own confirmation handles the booked-state; the `/books-rescue-diagnostic/confirmed` redirect is a later add (Calendly default is fine for v1).

---

## 8. Env vars

| Key | Owner action | Notes |
|---|---|---|
| `NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE` | Vercel | Public; the multi-duration event URL. Per-funnel — never reuse Extension Cleanup's. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Vercel (optional) | Only if enabling Turnstile; pairs with the handler's `TURNSTILE_ENABLED`. |

(The handler's `BOOKS_RESCUE_N8N_WEBHOOK_URL` + `_SECRET` are covered in the handler spec.)

---

## 9. OWASP 2025 touchpoints

This page is client-side; the authoritative controls live server-side (handler + n8n). The client-relevant items, made concrete:

- **A02 Security Misconfiguration** — only `NEXT_PUBLIC_` values in the client (the Calendly URL and Turnstile **site** key — both public). The Turnstile **secret** is never client-side (it lives in n8n). If the repo sets a Content-Security-Policy (check `next.config` headers / middleware), extend it to allow **exactly** Calendly (`https://assets.calendly.com` script, `https://calendly.com` frame) and, when Turnstile is on, `https://challenges.cloudflare.com` (script + frame) — nothing broader, no `unsafe-eval`. If no CSP exists, do not add one in this PR.
- **A03 Software Supply Chain** — load Calendly and Turnstile from their **official origins via the official `<script>`** (Next `<Script>`, lazy), not a new npm wrapper. Add **no new npm dependencies**. Lazy-load Calendly only at the booking step.
- **A05 Injection / XSS** — **no `dangerouslySetInnerHTML` anywhere.** Result/confirmation copy is fixed, tier-keyed strings; any interpolation of user input (e.g. "Thanks, {firstName}") goes through React's default escaping. Client validation is UX only; the server re-validates.
- **A06 Insecure Design** — the page's score/tier is **display + telemetry only**; n8n recomputes and routes on its own result, so the client value can't drive routing even though it's sent.
- **A07 / A09** — the page POSTs only to the **same-origin** `/api/books-rescue-submit` (never to n8n directly), so no webhook URL or secret ever reaches the client bundle; no PII written to the client console in production.
- **A10 Mishandling of Exceptional Conditions** — on a failed/timed-out submit, show a friendly retry and **preserve the entered form state** so the lead isn't lost; never surface handler/n8n internals.

**Launch-config coupling (A02):** Turnstile only works end-to-end when all four agree — the page renders the widget (site key set), the handler's `TURNSTILE_ENABLED=true`, n8n's Turnstile node is active, and n8n's `TURNSTILE_SECRET_KEY` is set. Flip them together before public launch.

---

## 10. QA + smoketest

- [ ] Renders cleanly at 390px; primary CTA reachable in the first result viewport
- [ ] All 7 questions render with exact contract copy; progress indicator advances
- [ ] Client score/tier matches the contract for spot-check inputs (e.g., the worked examples: 114→Crisis, 60→Stable, 144→Emergency, deadline-passed-only→floored to Crisis)
- [ ] Capture POSTs the exact §8 flat payload (`q_*` indexes, `website_val`, `time_elapsed_ms`, `cf_turnstile_response`); honeypot stays empty
- [ ] Each of the 4 tiers shows its headline/intro + a sensible data-driven scorecard
- [ ] Calendly embeds the one multi-duration event; no 20/30/45 mocks remain; no "in 15 minutes" copy remains
- [ ] No alarming prototype copy ("exposure," "triage," "critical") anywhere
- [ ] No Extension Cleanup identifiers; no checklist link; client-facing strings are balancebeamteam.com only
- [ ] No `dangerouslySetInnerHTML`; user input rendered only via React escaping
- [ ] Honeypot is off-screen + aria-hidden + tabindex=-1; submit disabled while in flight; form state survives a failed submit
- [ ] Calendly/Turnstile loaded from official origins via `<Script>`; no new npm deps; `npm audit` count not worsened
- [ ] No webhook URL/secret in the client bundle; only `NEXT_PUBLIC_` values present

---

## 11. Claude Code prompt

```
You are working in the balancebeamtax/BBT-Landing repository (Next.js 14 App Router,
TypeScript strict). Default branch is main. Do NOT open a PR or merge — David opens PRs.

GOAL: Build the /books-rescue-diagnostic page as a single client-driven funnel (quiz → analyzing
→ result → contact capture → booking), porting and correcting the existing static prototypes.

READ FIRST (do not skip):
- docs/imp/imp-233-books-rescue-quiz-scorer-contract.md — questions, point values, cutoffs
  (Emergency >=130, Crisis >=102, At-Risk >=66, else Stable), deadline floor (deadline_pressure
  idx 3 -> min Crisis), and the Section 8 payload shape. This governs scoring and the POST body.
- public/books-rescue-quiz-v3.html and public/books-rescue-diagnostic.html — the visual/layout
  starting point (DRIFTED — correct per "MUST FIX" below).
- The existing live Extension Cleanup page + its API-post pattern — use as a STRUCTURAL template
  only (rendering config, design-system usage, client interactivity). Do NOT copy its copy, slug,
  env vars, webhook, or Calendly URL, and do NOT modify its files.

BUILD
1. Branch feature/IMP-233-books-rescue-page off main.
2. src/lib/books-rescue/scoring.ts — export the rubric, dimension map, cutoffs, and deadline-floor
   logic exactly as the contract defines. Pure functions, unit-tested.
3. src/app/books-rescue-diagnostic/page.tsx (+ a client component) — the state machine:
   cover -> 7 quiz steps with progress -> "analyzing" transition -> result -> contact capture -> booking.
   - Quiz: the 7 contract questions in order (recency, confidence, deadline_pressure, tx_complexity,
     owner_burden, surprise_rate, decision_drag), exact rewrite copy/labels. Record {key, choiceIndex}.
   - After step 7 compute display score/tier via scoring.ts (display only).
   - Result: tier-keyed headline/intro (from the packet table), wireframe diagnosis + "what happens
     on the call" (length-neutral, NOT "in 15 minutes"), data-driven audit scorecard.
   - Capture: required first name + email, optional phone + company. On submit build the contract
     §8 FLAT snake_case body and POST to /api/books-rescue-submit:
       first_name, last_name, email, phone, company_name,
       q_recency, q_confidence, q_deadline_pressure, q_tx_complexity, q_owner_burden,
       q_surprise_rate, q_decision_drag  (each integer 0-3, from quiz state),
       quiz_score + tier (from scoring.ts, telemetry only),
       utm_* (flat, if present), website_val (honeypot, empty), time_elapsed_ms (ms since render),
       cf_turnstile_response (if Turnstile enabled), submission_id, submitted_at.
     On {ok:true} advance to booking; on error show a friendly retry.
   - Booking: embed NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE (one multi-duration event), lazy-loaded.
4. Styling: Slate Ember tokens (--bg #ECEAE5, --primary #017B82, --accent #B87D3A, light+dark),
   Instrument Serif headings + Plus Jakarta Sans body, mobile-first 390px, one dominant CTA, sticky
   bottom CTA on mobile. Match the repo's existing styling mechanism — do not introduce a new one.
5. .env.example: add NEXT_PUBLIC_CALENDLY_URL_BOOKS_RESCUE (placeholder) and, commented,
   NEXT_PUBLIC_TURNSTILE_SITE_KEY.
6. Tests: scoring.ts unit tests against the contract's worked examples; a render/smoke test for the
   page. npm run test, typecheck, lint — all clean.
7. Commit: [IMP-233] Build /books-rescue-diagnostic page (quiz + result + capture + booking) from locked contract
8. Push. Do NOT open a PR. Report branch + SHA + test results.

MUST FIX (prototype drift — do not carry forward):
- Remove ALL alarming copy: "exposure", "triage", "critical bookkeeping situation", "legal/tax
  exposure". Use the calm subtle-urgency copy only.
- Remove the 20/30/45-min and "emergency slot" Calendly mocks; one real multi-duration embed.
- Use the 7 contract questions, NOT the prototype's q1-q6 categories.
- No secondary "checklist" CTA (omit for v1 — do NOT link the Extension Cleanup checklist).

SECURITY (OWASP 2025 — must hold)
- No dangerouslySetInnerHTML anywhere; rely on React escaping for any interpolated user input.
- Load Calendly + Turnstile from their official origins via Next <Script> (lazy); add NO new npm deps.
- Honeypot website_val: text input, off-screen hidden (NOT display:none), aria-hidden, tabindex=-1,
  autocomplete=off, must stay empty.
- Disable the submit button while the POST is in flight; preserve form state on a failed submit.
- POST only to same-origin /api/books-rescue-submit — never to n8n directly. Only NEXT_PUBLIC_ values
  in the client; never the Turnstile secret.
- If the repo has a CSP (next.config headers / middleware), extend it to allow ONLY
  assets.calendly.com (script) + calendly.com (frame) + challenges.cloudflare.com (script+frame,
  when Turnstile on) — nothing broader, no unsafe-eval. If there is no CSP, do not add one here.

ANTI-DRIFT (must not violate)
- Client-facing strings: balancebeamteam.com only. No Extension Cleanup identifiers (slug
  /extension-cleanup-review, suffixes d811fb0c / 85b4e792, GHL_LANDING_WEBHOOK_URL).
- Page score is display-only; never send a tier the server is asked to trust (n8n recomputes).
- No secrets in client; only NEXT_PUBLIC_ values, which are public.
- Do not modify the Extension Cleanup page/route or next.config beyond what's strictly required.
- No PR, no merge.
```

---

## 12. Open items for owner

1. **Secondary CTA** (Section 5): omit for v1, or supply a Books-Rescue checklist asset.
2. **Capture gating** (Section 1): results shown before capture (default), or gated behind it.
3. **Tier headline/intro copy** (Section 5): draft — confirm or hand to council for a voice pass.
4. **Scorecard interpretation sentences** (Section 5): finalize wording (display layer, non-blocking).

---

## 13. Change log

| Date | Change |
|---|---|
| 2026-06-16 | Created. Page-port packet for `/books-rescue-diagnostic`: funnel state machine, drift fixes (copy, Calendly, quiz, security), tier result copy draft, contract-driven payload + scoring, Claude Code prompt. |
| 2026-06-19 | Wire format synced to the deployed n8n: payload is flat snake_case. Quiz answers ship as `q_<key>` integer indexes (0–3); honeypot/time/Turnstile fields renamed to `website_val` / `time_elapsed_ms` / `cf_turnstile_response`; `quiz_score` + `tier` flat telemetry-only. Retired the nested `contact{}` / `quiz.answers[]` / `_hp` / `_t` shape. |
| 2026-06-19 | Security pre-flight (OWASP Top 10:2025). Client-side hardening made concrete: no `dangerouslySetInnerHTML`; official-origin lazy `<Script>` for Calendly/Turnstile + no new deps; off-screen aria-hidden honeypot; double-submit guard + preserve-state-on-error; same-origin POST only; narrowly-scoped CSP additions; Turnstile launch-config coupling. §9 expanded, §6 + build prompt + QA checklist updated. |
