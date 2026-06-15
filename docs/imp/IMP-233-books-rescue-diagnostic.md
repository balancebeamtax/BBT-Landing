# IMP-233 — Books Rescue Diagnostic Funnel

> **Repo build record.** Location: `docs/imp/IMP-233-books-rescue-diagnostic.md`
> GitHub-side mirror of the Notion IMP-233 record. Every commit carries the `[IMP-233]` prefix so the Git log maps back here.

| Field | Value |
|---|---|
| Logical IMP | **IMP-233** (canonical; follows IMP-231 — there is **no IMP-232**, see Numbering note) |
| Lane | **BBTeam** — `balancebeamteam.com` only |
| Domain | `balancebeamteam.com` (no `balancebeamtax.com` in any client-facing asset) |
| Status | Not started |
| Priority | P1 — High |
| Updated | 2026-06-14 |
| Repo | `balancebeamtax/BBT-Landing` (confirm rename to `bbteam-landing` before use) |
| Branch | `feature/IMP-233-books-rescue-diagnostic` |
| Commit prefix | `[IMP-233]` on every commit |
| Notion record | IMP-233 — Books Rescue Diagnostic Funnel (🛠️ Build Improvements Log, auto-ID 241) |

---

## Numbering note (read first)

- The **MP-233 → IMP-233** rename (renumbering log 2026-06-14) brings the packet into the canonical `IMP-###` series. **IMP-233 is kept** as the logical ID.
- Per **🔒 BBTeam canonical hard-rules**, **there is no IMP-232** — that number was a `+10`-offset artifact that has already been reconciled. The real preceding logical IMP is **IMP-231**.
- The Notion **auto-ID column** is a monotonic counter. The IMP-233 row's auto-ID must be **verified after creation** and recorded in Notes.
- The "n8n lead-ops infrastructure" dependency referenced as "IMP-232" should be **re-linked to its verified canonical IMP** before this spec is locked. Do not assert IMP-232 as evidence (anti-drift rule).

---

## Scope

A diagnostic-quiz-first conversion funnel on `balancebeamteam.com` that moves a qualified small-business owner from bookkeeping anxiety to a booked Books Rescue call.

`quiz cover → 5–7 low-friction qualification steps → "analyzing" transition → scored result + audit scorecard → contact capture → result/booking page → embedded calendar → confirmation + reminder sequence.`

## In scope

- `books-rescue-diagnostic.html` — result page (PAS stack, audit scorecard, booking block).
- `books-rescue-quiz-v3.html` — multi-step diagnostic quiz + scoring.
- n8n intake workflow — webhook → spam checks → quality scorer → GHL handoff → tier alerts.
- GHL workflow specs (4 tiers) — Emergency, Crisis, At-Risk, Stable follow-up sequences.
- "Slate Ember" palette + Instrument Serif / Plus Jakarta Sans typography.

## Out of scope

- Lead-magnet PDF delivery (proposed follow-on — verify IMP number before linking).
- Pricing tiers / engagement-letter language for the rescue service.
- Production deploy, DNS cutover, A2P 10DLC resubmission (owner-gated).

---

## SUPERRULE LOCK

- **Domain:** `balancebeamteam.com` ONLY — no `balancebeamtax.com` in any client-facing asset.
- **Internal alerts TO:** `leads@balancebeamtax.com` (approved cross-lane bridge — only exception), subject prefix `[bbt-team/books-rescue]`.
- **FROM email:** `no-reply@balancebeamteam.com` (system) / `hello@balancebeamteam.com` (client-facing).
- **GHL Location:** `j8g8NJAU4pj2Qz8YM50v` (BBTeam sub-account only).
- **Webhooks by ID suffix only** — never place a real GHL webhook URL in committed code or docs. Use an IMP-233-specific suffix; never reuse `d811fb0c`. Real URLs live only in server-only env vars.
- **No PR opened by Claude Code; no merge to main without owner approval.**
- **GHL workflow mappings are owner-only edits.**

---

## File manifest

| File | Purpose |
|---|---|
| `books-rescue-diagnostic.html` | Result page — PAS, audit scorecard, booking block |
| `books-rescue-quiz-v3.html` | Multi-step diagnostic quiz + client-side scoring |
| `04_n8n_workflow_spec.md` | n8n intake: webhook → spam → scorer → GHL → tier alerts |
| `06_ghl_workflow_spec.md` | 4-tier GHL follow-up automation specs |
| `docs/imp/IMP-233-books-rescue-diagnostic.md` | This build record |

## n8n intake flow

```
 Webhook Trigger (POST /books-rescue-submit)
      ↓
 Honeypot  →   Time Guard (≥12000ms)  →   Turnstile Validate
      ↓ pass
 Quality Scorer
      ↓
 IF score ≥ 60 ?
     ├─ YES →  GHL Create/Update Contact →  Tag Writer →  Pipeline Stage
     │         →  Tier Router (emergency | crisis | at-risk | stable) → Resend tier alert
     └─ NO  →  Tag: quality-hold →  Log (no alert fired)
```

## GHL follow-up tiers

| Tier | Trigger tag | Shape |
|---|---|---|
| Emergency | `books-rescue-emergency` | Push alert → SMS → 3-email urgency sequence, booking-gated exits |
| Crisis | `books-rescue-crisis` | High-urgency follow-up sequence |
| At-Risk | `books-rescue-at-risk` | Soft alert → 5-email nurture, booking-gated exits |
| Stable | `books-rescue-stable` | Low-urgency nurture / upsell |

All four triggered by **Contact Tag Added**. Do **not** clone from any prior IMP workflow. Do **not** activate in production until smoketest passes.

---

## QA checklist

- [ ] Quiz renders + scores correctly on a 390px-wide phone; result CTA in first viewport.
- [ ] Honeypot, time-guard (≥12s), and Turnstile all reject synthetic submits.
- [ ] Quality scorer thresholds route to the correct tier tag.
- [ ] GHL contact created/updated; tier tag + pipeline stage set.
- [ ] Internal alert lands at `leads@balancebeamtax.com` with `[bbt-team/books-rescue]` prefix.
- [ ] No real webhook URL present in any committed file or client bundle.
- [ ] Calendar embeds directly under the result/booking block.

## Smoketest checklist

- [ ] Adversarial smoke on Preview URL (spam-path curl tests).
- [ ] One real quick submit + one full-intake submit; verify GHL + notification.
- [ ] Confirmation + reminder/reconfirmation sequence fires without duplicates.

## Owner-only actions (human-gated)

- [ ] GHL field mapping + workflow publish.
- [ ] Vercel env vars (`GHL_LANDING_WEBHOOK_URL`, Turnstile keys, Calendly URL).
- [ ] PR open + merge to main.
- [ ] Production deploy + DNS verification.
- [ ] Notion row write/lock (BBTeam single-writer rule).

---

## Change log

| Date | Phase | Note |
|---|---|---|
| 2026-06-14 | Spec drafted | Build record created from Perplexity council deliverables; MP-233→IMP-233 reconciled |
