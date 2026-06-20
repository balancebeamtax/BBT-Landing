# IMP-233 — Books Rescue Quiz ↔ Scorer Contract

**Status:** LOCKED — cutoffs + deadline floor blessed by owner 2026-06-16
**Lane:** BBTeam — `balancebeamteam.com` only
**Funnel:** Books Rescue Diagnostic (IMP-233) — slug `/books-rescue-diagnostic`
**Architecture:** Path B (Next.js → n8n → GHL + Resend), confirmed 2026-06-16
**Wire format:** flat snake_case (page → n8n); the seven answers ship as `q_<dimension>` integer indexes 0–3
**Backend status:** scorer + validity gate DEPLOYED and connector-verified in n8n workflow `bBOl4vZI86LcGJED` (Draft) — 2026-06-19
**Date:** 2026-06-16 (wire format + scorer reconciled to the deployed n8n 2026-06-19)

**Canonical sources reconciled here:**
- `quiz-rewrite-reference.md` (the 7-question subtle-urgency instrument + per-answer points) — **governs the questions and scoring**
- BBTeam Books Rescue n8n + HighLevel + Resend build guide (the workflow topology) — **governs the pipeline**
- `books-rescue-wireframe.md` (result-page PAS + audit scorecard) — **governs the display layer**

**This document SUPERSEDES** the scorer in the n8n build guide (Node B), which scored a 0–100 value from inputs the quiz does not collect (`monthsBehind`, `unreconciledAccounts`, `payrollOrSalesTaxIssue`, `taxNoticeReceived`, `booksConfidence`, `deadlineDays`). Those inputs are **retired**. The quiz is the only intake instrument; the scorer is rebuilt to consume it.

---

## 1. Why this contract exists

The page, the n8n scorer, and the GHL tier tags were each written against a different idea of the input. The quiz asks 7 reframed self-description questions on a 17–158 point scale; the old scorer expected hard numbers on a 0–100 scale with 80/60/35 cutoffs. They cannot interoperate as written. This document defines one input shape, one score model, one set of cutoffs, and one tier→tag map that all three layers read from.

**Authority rule:** scoring is recomputed **server-side in n8n** and is authoritative. Any score the page computes is display-only and is never trusted for routing (OWASP A06 — Insecure Design; never trust a client-supplied score or points).

---

## 2. The 7 questions (locked — rewrite copy)

Each question is single-select, 4 options, ordered by severity (`choiceIndex` 0 = least severe → 3 = most severe). Point values are exact from `quiz-rewrite-reference.md`.

### Q1 — `recency` (dimension: `deadline_risk`)
*"When was the last time your books were where you'd want them — not in progress, but actually done?"*

| idx | label | points |
|---|---|---|
| 0 | Within the last month | 2 |
| 1 | A couple of months ago | 8 |
| 2 | Several months back | 16 |
| 3 | I'm honestly not sure | 24 |

### Q2 — `confidence` (dimension: `confidence_risk`)
*"If you needed to share your financials with someone outside the business today — accountant, lender, or partner — how ready would you feel?"*

| idx | label | points |
|---|---|---|
| 0 | Ready to share as-is | 2 |
| 1 | I'd add a quick note or two | 8 |
| 2 | I'd want to walk them through it first | 16 |
| 3 | I'd need to do some prep before sharing | 22 |

### Q3 — `deadline_pressure` (dimension: `deadline_risk`)
*"Is there a financial or tax deadline coming up — and how does your current bookkeeping situation line up with it?"*

| idx | label | points |
|---|---|---|
| 0 | Nothing major coming up | 4 |
| 1 | Something is on the calendar this quarter | 10 |
| 2 | A deadline is coming up soon — within six weeks | 18 |
| 3 | A deadline has passed or I'm already in catch-up mode | 24 |

### Q4 — `tx_complexity` (dimension: `ops_drag`)
*"How would you describe the way money flows through your business — bank accounts, cards, platforms, payment tools?"*

| idx | label | points |
|---|---|---|
| 0 | Clean and mostly automatic | 3 |
| 1 | Manageable — some manual steps but nothing broken | 9 |
| 2 | A few different tools that don't always talk to each other | 17 |
| 3 | Genuinely hard to follow without digging | 23 |

### Q5 — `owner_burden` (dimension: `ops_drag`)
*"In a typical week, how much of your personal time goes toward bookkeeping — categorizing, reconciling, chasing down receipts, fixing syncs?"*

| idx | label | points |
|---|---|---|
| 0 | Very little — it mostly takes care of itself | 2 |
| 1 | An hour or two, spread across the week | 8 |
| 2 | Enough to notice — it pulls me away from other things | 15 |
| 3 | It's become its own unpredictable project | 21 |

### Q6 — `surprise_rate` (dimension: `confidence_risk`)
*"How often do you come across something in the books that you thought was already handled — a duplicate, a wrong category, a missing entry?"*

| idx | label | points |
|---|---|---|
| 0 | Rarely — things usually stay put | 2 |
| 1 | Sometimes — a couple of times a month | 9 |
| 2 | Regularly enough that it feels normal | 16 |
| 3 | Frequently — I can't fully trust what I'm looking at | 22 |

### Q7 — `decision_drag` (dimension: `ops_drag`)
*"In the last few months, has uncertainty about the finances made you pause on something — a pricing decision, a hire, a plan you wanted to move forward on?"*

| idx | label | points |
|---|---|---|
| 0 | No — things have moved forward as planned | 2 |
| 1 | Once or twice — small delays, nothing significant | 8 |
| 2 | A few times — it slowed things down noticeably | 16 |
| 3 | Pretty regularly — it's become a recurring friction point | 22 |

---

## 3. Score model

**Raw score = sum of the 7 selected answer points.**

- Theoretical minimum: **17** (every answer at idx 0)
- Theoretical maximum: **158** (every answer at idx 3)
- Usable span: **141**

**Dimension subtotals** (used for the result-page scorecard, Section 11):

| dimension | questions | min | max |
|---|---|---|---|
| `deadline_risk` | Q1 recency + Q3 deadline_pressure | 6 | 48 |
| `confidence_risk` | Q2 confidence + Q6 surprise_rate | 4 | 44 |
| `ops_drag` | Q4 tx_complexity + Q5 owner_burden + Q7 decision_drag | 7 | 66 |

Note `ops_drag` carries the most weight (max 66), then `deadline_risk` (48), then `confidence_risk` (44). This is inherited from the council instrument and is intentional — operational drag is the strongest cleanup signal.

---

## 4. Canonical points table (the rubric n8n holds)

```
recency:           [2, 8, 16, 24]
confidence:        [2, 8, 16, 22]
deadline_pressure: [4, 10, 18, 24]
tx_complexity:     [3, 9, 17, 23]
owner_burden:      [2, 8, 15, 21]
surprise_rate:     [2, 9, 16, 22]
decision_drag:     [2, 8, 16, 22]
```

The page sends only the answer index (0–3) per question, as flat `q_<key>` keys (§8). n8n derives points from this table — it never trusts client-sent points.

---

## 5. Tier cutoffs — LOCKED (owner-blessed 2026-06-16)

Recalibrated from the n8n guide's original intent (emergency ≥80%, crisis ≥60%, at-risk ≥35% of scale) onto the 17–158 span, anchored at the 17 floor: `threshold = 17 + pct × 141`.

| Tier | Raw score band | Tag |
|---|---|---|
| **Emergency** | 130 – 158 | `books-rescue-emergency` |
| **Crisis** | 102 – 129 | `books-rescue-crisis` |
| **At-Risk** | 66 – 101 | `books-rescue-at-risk` |
| **Stable** | 17 – 65 | `books-rescue-stable` |

**Worked examples (sanity check):**

- *Moderately behind, deadline soon, some friction* (16+16+18+17+15+16+16 = 114) → **Crisis** ✓
- *Minor drift across the board* (8+8+10+9+8+9+8 = 60) → **Stable** ✓
- *Severe everywhere* (16+22+24+23+21+16+22 = 144) → **Emergency** ✓
- *Operationally messy, no urgency* (ops maxed 66 + everything else at floor 10 = 76) → **At-Risk** ✓

Owner-blessed 2026-06-16. Defensible **starting** calibration — recommend revisiting after the first ~50 completions, which is a tuning change, not a re-open.

---

## 6. Deadline floor override — LOCKED (owner-blessed 2026-06-16)

Pure additive scoring has one false-negative: a passed deadline can land in Stable if every other answer is mild. Example: Q3 = "deadline passed" (24) + Q1 = "not sure" (24) + everything else at floor → total 59 → **Stable** under pure additive, which is wrong for a time-sensitive situation.

**Recommended (ON):** If `deadline_pressure` = idx 3 ("A deadline has passed or I'm already in catch-up mode"), the tier is raised to **at least Crisis**, regardless of total.

**Optional (OFF by default):** If `recency` = idx 3 **and** `deadline_pressure` = idx 3 (no idea where the books are *and* a deadline blew by), raise to **Emergency**.

**Locked: floor ON. Optional Emergency escalation OFF** (per owner agreement with the recommended assessment, 2026-06-16).

---

## 7. Tier → tag map (locked)

```
emergency → books-rescue-emergency
crisis    → books-rescue-crisis
at-risk   → books-rescue-at-risk
stable    → books-rescue-stable
```

These four tags are reserved for IMP-233 and must never collide with Extension Cleanup assets.

---

## 8. Submission payload — page → n8n

POSTed by the Next.js submit handler to the n8n intake webhook (server-side, behind the `x-bbt-intake-secret` header). **Flat snake_case** — this is the deployed contract; the n8n spam gates and scorer read these exact keys off `$json.body`. The page sends the **selections**, not the score.

```json
{
  "submission_id": "br_20260616_182900_abc123",
  "submitted_at": "2026-06-16T18:29:00-07:00",
  "source": "balancebeamteam.com/books-rescue-diagnostic",
  "first_name": "",
  "last_name": "",
  "email": "",
  "phone": "",
  "company_name": "",
  "q_recency": 2,
  "q_confidence": 1,
  "q_deadline_pressure": 2,
  "q_tx_complexity": 2,
  "q_owner_burden": 2,
  "q_surprise_rate": 2,
  "q_decision_drag": 2,
  "website_val": "",
  "time_elapsed_ms": 18342,
  "cf_turnstile_response": "<turnstile-token>",
  "utm_source": "", "utm_medium": "", "utm_campaign": "", "utm_term": "", "utm_content": "",
  "quiz_score": 114,
  "tier": "crisis"
}
```

- The seven `q_*` keys are **required**, each an integer **0–3** (the `choiceIndex`). Missing or out-of-range → the scorer sets `valid: false` → routed to **DROP — invalid** (fail closed, Section 9).
- **Spam fields** map to the deployed gates: `website_val` (honeypot, drop if non-empty), `time_elapsed_ms` (drop if `< 12000`), `cf_turnstile_response` (Turnstile token, drop if invalid).
- `quiz_score` / `tier` are **display/telemetry only**. n8n recomputes and routes on its own result; the client values are ignored for routing (OWASP A06).
- `utm_*` forwarded as flat keys. Attribution (gclid/fbclid/gbraid/wbraid/msclkid) is reserved for **F18** — add as flat keys when it lands; n8n forwards whatever arrives.
- `time_elapsed_ms` may be injected server-side by the Next handler (stronger than client-computed); the deployed gate reads whatever value arrives under that key.

---

## 9. Authoritative scorer — n8n "Quality Scorer" Code node (DEPLOYED & VERIFIED 2026-06-19)

Live in workflow `bBOl4vZI86LcGJED`, node **Quality Scorer**; connector-verified 2026-06-19. Reads the flat `q_*` answer indexes off `$json.body`, recomputes the 17–158 score, applies the 130/102/66 cutoffs and the deadline floor, and emits `valid` / `missing` plus the envelope the downstream nodes read (`contact`, `score`, `tier`, `tag`, `dimensions`, `summary`, `ghl`, `resend`, `submissionId`). The next node, **Check Valid Submission**, routes `valid === false` to a **DROP — invalid** dead-end (fail closed; OWASP A10). This is the exact deployed source:

```javascript
const body = $json.body ?? $json;
const RUBRIC = {
  recency:           [2, 8, 16, 24],
  confidence:        [2, 8, 16, 22],
  deadline_pressure: [4, 10, 18, 24],
  tx_complexity:     [3, 9, 17, 23],
  owner_burden:      [2, 8, 15, 21],
  surprise_rate:     [2, 9, 16, 22],
  decision_drag:     [2, 8, 16, 22],
};
const DIM_OF = {
  recency: 'deadline_risk', deadline_pressure: 'deadline_risk',
  confidence: 'confidence_risk', surprise_rate: 'confidence_risk',
  tx_complexity: 'ops_drag', owner_burden: 'ops_drag', decision_drag: 'ops_drag',
};
const KEYS = Object.keys(RUBRIC);
let score = 0;
const dims = { deadline_risk: 0, confidence_risk: 0, ops_drag: 0 };
const missing = [];
for (const key of KEYS) {
  const idx = Number(body['q_' + key]);
  if (!Number.isInteger(idx) || idx < 0 || idx > 3) { missing.push(key); continue; }
  score += RUBRIC[key][idx];
  dims[DIM_OF[key]] += RUBRIC[key][idx];
}
const email = String(body.email || '').trim().toLowerCase();
const valid = missing.length === 0 && !!email;
let tier = 'stable';
if (score >= 130) tier = 'emergency';
else if (score >= 102) tier = 'crisis';
else if (score >= 66) tier = 'at-risk';
const rank = { stable: 0, 'at-risk': 1, crisis: 2, emergency: 3 };
if (Number(body.q_deadline_pressure) === 3 && rank[tier] < rank.crisis) tier = 'crisis';
const tag = `books-rescue-${tier}`;
const firstName = (body.first_name || '').trim();
const lastName = (body.last_name || '').trim();
const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Books Rescue Lead';
const summary = KEYS.map(k => `${k}:${Number(body['q_' + k])}`).join(' | ');
return { json: {
  valid, missing,
  submissionId: body.submission_id,
  submittedAt: body.submitted_at,
  source: body.source || 'balancebeamteam.com/books-rescue-diagnostic',
  contact: { firstName, lastName, name: fullName, email, phone: body.phone || '', companyName: body.company_name || '' },
  dimensions: dims, score, tier, tag, summary,
  ghl: { locationId: 'j8g8NJAU4pj2Qz8YM50v' },
  resend: { from: 'Balance Beam Team <admin@balancebeamteam.com>', to: ['leads@balancebeamtax.com'], cc: ['admin@balancebeamteam.com'] }
} };
```

**Deferred — opportunity fields:** the deployed scorer emits only `ghl.locationId`. The earlier `ghl.pipelineId` / `pipelineStageId` (for a Create-Opportunity node) are intentionally **not** emitted yet — that node is pending the `stage_id` pull. When it's added: re-introduce those two fields here and insert a "Create Opportunity" node after the GHL upsert.

**Behavior note vs. the earlier draft:** this version never early-returns. It always emits a record carrying `valid` (and `missing`), and the **Check Valid Submission** gate does the dropping. Same fail-closed outcome, just enforced by the gate rather than an `{ ok: false }` return.

---

## 10. Downstream nodes (deployed topology, connector-verified 2026-06-19)

Live chain: `Webhook → Check Honeypot → Check Time Guard → Turnstile Validate → Check Turnstile → Quality Scorer → Check Valid Submission → GHL Create/Update Contact → Resend Alert`. Spam branches dead-end at three `SPAM DROP` no-ops; invalid submissions dead-end at `DROP — invalid`.

- **GHL Create/Update Contact** — POST `/contacts/upsert`, writes `tags: ["books-rescue", "books-rescue-diagnostic", books-rescue-{tier}]`. That tier tag is what fires the four GHL follow-up workflows — it is load-bearing, do not drop it.
- **Resend Alert** — single consolidated node (the old `Route by Tier` switch + four per-tier nodes were removed). Subject and intro vary by `$json.tier`; carries `Idempotency-Key` = `{submissionId}-{tier}-alert` and `cc admin@balancebeamteam.com`.
- **Not yet present:** a Create-Opportunity node (pending `stage_id`) and an error workflow (a GHL/Resend failure currently dies silently). Both are tracked open items; neither blocks the Preview smoke test.

---

## 11. Result-page scorecard mapping (proposed — display layer, tunable)

The wireframe's 5 audit-scorecard categories, mapped to underlying questions. Each category shows a severity band from its source question(s); the band selects the interpretation sentence (final copy from `books-rescue-wireframe.md`, finalized in the page-port packet).

| Scorecard category | Source | Band logic |
|---|---|---|
| Bookkeeping currentness | Q1 `recency` | by choiceIndex 0–3 |
| Reconciliation confidence | Q4 `tx_complexity` + Q6 `surprise_rate` | by combined band |
| Tax readiness | Q2 `confidence` + Q3 `deadline_pressure` | by combined band |
| Decision clarity | Q7 `decision_drag` | by choiceIndex 0–3 |
| Urgency level | overall `tier` | tier-driven |

This layer is **presentational and adjustable** — the scoring in Sections 2–6 is the locked, load-bearing part.

---

## 12. Anti-drift, governance & security

- **Lane:** all client-facing strings use `balancebeamteam.com`. The only `balancebeamtax.com` reference is the internal alert recipient `leads@balancebeamtax.com` (documented cross-lane exception). Repo is `balancebeamtax/BBT-Landing` (correct).
- **Funnel:** tags, slug, and pipeline are Books Rescue's own. No Extension Cleanup identifiers; webhook suffix must differ from `d811fb0c` / `85b4e792`.
- **No secrets in this doc:** the n8n webhook URL, GHL PIT, Resend key, and shared secret live only in Vercel/Bitwarden. `<GHL_STAGE_ID_FROM_PREREQ>` is a placeholder resolved by the owner's PIT shell command.
- **OWASP A06 (Insecure Design):** scoring is server-authoritative; client score is ignored for routing.
- **OWASP A10 (Mishandling of Exceptional Conditions):** incomplete or no-email submissions fail closed with a structured error, never a partial intake.

---

## 13. Open items for owner sign-off

1. ~~Tier cutoffs (Section 5)~~ — **LOCKED 130 / 102 / 66** (owner-blessed 2026-06-16).
2. ~~Deadline floor (Section 6)~~ — **LOCKED: floor ON, escalation OFF** (owner-blessed 2026-06-16).
3. **Scorecard interpretation copy** (Section 11): finalized at page-port time, not blocking.

Sections 1–2 are blessed, so this contract is **LOCKED** and is now the input to the submit-handler spec and the n8n scorer-node update.

---

## 14. Change log

| Date | Change |
|---|---|
| 2026-06-16 | Created. Reconciled the 7-question council quiz (17–158 scale) with the n8n scorer; retired the obsolete `monthsBehind`/etc. input schema; recalibrated tier cutoffs; added deadline floor; defined the page→n8n payload and the authoritative scorer node. DRAFT pending owner blessing of cutoffs + floor. |
| 2026-06-16 | **LOCKED.** Owner blessed cutoffs (130/102/66), deadline floor ON, optional Emergency escalation OFF. No code change — Section 9 constants already reflect the blessed values. |
