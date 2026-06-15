# IMP-233 — n8n Workflow Spec

> **Source file:** `04_n8n_workflow_spec.md`
> Transcribed and formatted from the IMP-233 canonical build packet (Combined Master Document, Part 1 of 3). Build record: [`IMP-233-books-rescue-diagnostic.md`](./IMP-233-books-rescue-diagnostic.md).

| Field | Value |
|---|---|
| Workflow name | **BBT — Books Rescue Diagnostic Submit** |
| Trigger | Webhook (POST) from `books-rescue-diagnostic.html` → `/api/books-rescue-submit` |
| Domain lock | `balancebeamteam.com` ONLY — no other sub-accounts, no IMP-232 nodes reused |

---

## SUPERRULE LOCK (Updated 2026-06-14)

- IMP number: **IMP-233** (confirmed — renumbering log 2026-06-14)
- Domain: `balancebeamteam.com` ONLY
- Internal alerts TO: `leads@balancebeamtax.com` (SUPER RULE bridge — only exception)
- FROM email: `no-reply@balancebeamteam.com` (notifications) / `hello@balancebeamteam.com` (client-facing)
- GHL Location: `j8g8NJAU4pj2Qz8YM50v` (BBTeam sub-account only)
- GHL Webhook: IMP-233-specific suffix — never reuse `d811fb0c` (LP-001/Extension Cleanup)
- Repo: `balancebeamtax/BBT-Landing` (confirm rename to `bbteam-landing` before use)
- Branch: `feature/IMP-233-books-rescue-diagnostic`
- Commit prefix: `[IMP-233]` on every commit
- No PR opened by Claude Code — human gate required
- No merge to main without human approval
- Preceding IMP: IMP-232 (n8n lead-ops infrastructure)
- Follow-on IMP: IMP-239 (Lead magnet PDF delivery)

> **Editor's note (anti-drift) —** The build record's *Numbering note* states there is **no IMP-232** (a reconciled `+10`-offset artifact) and instructs *"do not assert IMP-232 as evidence."* The `Preceding IMP: IMP-232` and `Follow-on IMP: IMP-239` lines above are transcribed from the source packet and **must be re-linked to verified canonical IMPs before this spec is locked.**

---

## Workflow flow

```
[1] Webhook Trigger
        ↓
[2] Spam Check: Honeypot
        ↓ pass
[3] Spam Check: Time Guard
        ↓ pass
[4] Spam Check: Turnstile Validate (HTTP → Cloudflare API)
        ↓ pass
[5] Quality Scorer
        ↓
[6] IF: Quality Score ≥ 60?
       ├── YES → [7] GHL Create/Update Contact
       │               ↓
       │          [8] GHL Tag Writer
       │               ↓
       │          [9] GHL Pipeline Stage Setter
       │               ↓
       │          [10] Tier Router (Switch)
       │               ├── emergency → [11a] Resend Alert (Emergency)
       │               ├── crisis    → [11b] Resend Alert (Crisis)
       │               ├── at-risk   → [11c] Resend Alert (At-Risk)
       │               └── stable    → [11d] Resend Alert (Stable)
       │
       └── NO  → [12] GHL Tag: quality-hold
                      ↓
                 [13] Log: quality-hold (no alert fired)
```

---

## NODE 1 — Webhook Trigger

| Field | Value |
|---|---|
| Node type | `n8n-nodes-base.webhook` |
| HTTP Method | POST |
| Path | `/books-rescue-submit` |
| Response Mode | Immediately |
| Response Code | 200 |
| Response Body | `{"status":"received"}` |
| Authentication | None (Turnstile validates client-side legitimacy) |

**Expected incoming payload fields:**

```
first_name, last_name, email, phone, company_name,
quiz_score, raw_score, tier,
cf_turnstile_response,
submission_ts, time_elapsed_ms,
source, domain,
website_val (honeypot mirror)
```

---

## NODE 2 — Spam Check: Honeypot

| Field | Value |
|---|---|
| Node type | `n8n-nodes-base.if` |
| Condition | `{{ $json.website_val }}` equals `""` (empty string) |
| TRUE path | Continue to Node 3 |
| FALSE path | → `n8n-nodes-base.noOp` labeled **SPAM DROP: honeypot** → Stop |

**Expression:**

```js
{{ $json.website_val === '' || $json.website_val === undefined }}
```

---

## NODE 3 — Spam Check: Time Guard

| Field | Value |
|---|---|
| Node type | `n8n-nodes-base.if` |
| Condition | `{{ $json.time_elapsed_ms }}` greater than or equal to `12000` |
| TRUE path | Continue to Node 4 |
| FALSE path | → `n8n-nodes-base.noOp` labeled **SPAM DROP: time_guard** → Stop |

**Expression:**

```js
{{ Number($json.time_elapsed_ms) >= 12000 }}
```

---

## NODE 4 — Spam Check: Turnstile Validate

| Field | Value |
|---|---|
| Node type | `n8n-nodes-base.httpRequest` |
| Method | POST |
| URL | `https://challenges.cloudflare.com/turnstile/v0/siteverify` |
| Body Type | Form |
| Body Params | `secret = {{ $env.TURNSTILE_SECRET_KEY }}` |
|  | `response = {{ $json.cf_turnstile_response }}` |
|  | `remoteip = {{ $json.remoteip }}` (optional, pass if available) |

**Follow-up IF node:**

- Condition: `{{ $json.success === true }}`
- TRUE → Continue to Node 5
- FALSE → **SPAM DROP: turnstile** → Stop

---

## NODE 5 — Quality Scorer

| Field | Value |
|---|---|
| Node type | `n8n-nodes-base.code` |
| Language | JavaScript |

**Code:**

```js
const data = $input.first().json;
let score = 100;

// Email domain quality
const email = (data.email || '').toLowerCase();
const disposableDomains = [
  'test.com','mailinator.com','guerrillamail.com','tempmail.com',
  'throwaway.email','yopmail.com','sharklasers.com','dispostable.com'
];
const emailDomain = email.split('@')[1]
```

> **⚠️ Source gap (not in canonical packet) —** The remainder of the Node 5 scoring logic is marked in the source master document as:
> *"[...rest of NODE 5 code and subsequent nodes remain as in your updated Part F file...]"*
> The full scorer body (disposable-domain penalty, remaining quality heuristics, and the `score` return shape) is **not present in the available source files** and must be supplied from the *Part F* working file before build. **Do not invent scoring weights here.**

---

## NODES 6–13 — Routing & GHL handoff

> The detailed node-level configurations for Nodes 6–13 are **not present in the available source files** (the source carries only the flow-diagram level for these). Build from the flow above; confirm field mappings with the owner. Summary per the flow diagram:

| Node | Role |
|---|---|
| [6] IF: Quality Score ≥ 60? | Gate. YES → contact handoff (7–11); NO → quality-hold (12–13) |
| [7] GHL Create/Update Contact | Upsert contact in BBTeam sub-account (`j8g8NJAU4pj2Qz8YM50v`) |
| [8] GHL Tag Writer | Write the tier-specific tag (`books-rescue-emergency` / `-crisis` / `-at-risk` / `-stable`) — this tag triggers the GHL workflows (see `06_ghl_workflow_spec.md`) |
| [9] GHL Pipeline Stage Setter | Set pipeline stage |
| [10] Tier Router (Switch) | Branch on `tier` → emergency / crisis / at-risk / stable |
| [11a–d] Resend Alert (per tier) | Internal alert to `leads@balancebeamtax.com`, subject prefix `[bbt-team/books-rescue]` |
| [12] GHL Tag: quality-hold | Applied when score < 60 |
| [13] Log: quality-hold | Record only — **no alert fired** |

---

## GitHub + Notion integration

- Branch: `feature/IMP-233-books-rescue-diagnostic`
- Repo: `balancebeamtax/BBT-Landing`
- Commit prefix: `[IMP-233]` on every commit
- PR title: `[IMP-233] Books Rescue Diagnostic Funnel — books-rescue-diagnostic.html`
- **No PR by Claude Code. No merge without human approval.**
- Notion page: IMP-233 — Books Rescue Diagnostic Funnel
- Notion log: Update Change Log in Notion after each phase: branch created, GHL built, smoketest passed, PR merged, deploy verified.
