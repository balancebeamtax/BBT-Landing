# IMP-233 — GHL Workflow Spec (4-Tier Follow-up)

> **Source file:** `06_ghl_workflow_spec.md`
> Transcribed and formatted from the IMP-233 canonical build packet (Combined Master Document, Parts 2 & 3). Build record: [`IMP-233-books-rescue-diagnostic.md`](./IMP-233-books-rescue-diagnostic.md) · n8n handoff: [`04_n8n_workflow_spec.md`](./04_n8n_workflow_spec.md).

| Field | Value |
|---|---|
| Platform | GoHighLevel (GHL) — **Balance Beam Team sub-account ONLY** |
| GHL Location | `j8g8NJAU4pj2Qz8YM50v` |
| Domain lock | `balancebeamteam.com` — no IMP-232 workflows reused |
| Trigger source | Tier tag written by **n8n Node 8** after the quality check passes |

---

## SUPERRULE LOCK (Updated 2026-06-14)

- IMP number: **IMP-233** (confirmed — renumbering log 2026-06-14)
- Domain: `balancebeamteam.com` ONLY
- Internal alerts TO: `leads@balancebeamtax.com` (SUPER RULE bridge — only exception)
- FROM email: `no-reply@balancebeamteam.com` (notifications) / `hello@balancebeamteam.com` (client-facing)
- GHL Location: `j8g8NJAU4pj2Qz8YM50v` (BBTeam sub-account only)
- GHL Webhook: IMP-233-specific suffix — never reuse `d811fb0c` (LP-001/Extension Cleanup)

> **Editor's note (anti-drift) —** Per the build record's *Numbering note*, **there is no IMP-232**; do not assert it as evidence. Reconcile any preceding/follow-on IMP references to verified canonical IMPs before lock.

---

## GHL Workflow Setup Rules

Before building any workflow in GHL:

- ✅ Confirm you are in the **Balance Beam Team** sub-account
- ✅ Confirm sub-account slug is **balancebeamteam** (not balancebeamtax)
- ❌ Do **NOT** clone or copy from any prior IMP workflow
- ❌ Do **NOT** activate workflows in production until smoketest is complete
- ❌ Do **NOT** use any trigger from `d811fb0c` sub-account (LP-001/Extension Cleanup webhook — use IMP-233-specific suffix only)

All 4 workflows are triggered by **Contact Tag Added** — specifically the tier-specific tag written by **n8n Node 8** after the quality check passes.

---

# WORKFLOW 1 — Emergency Tier

| Field | Value |
|---|---|
| Workflow name | **BBT — Books Rescue: Emergency Follow-up** |
| Trigger | Contact Tag Added = `books-rescue-emergency` |
| Enrollment condition | Contact tag contains `books-rescue-emergency` AND does NOT contain `quality-hold` |
| Re-enrollment | OFF — one enrollment per contact |

### Emergency — Workflow Node Sequence

```
[TRIGGER] Tag Added: books-rescue-emergency
        ↓
[1] Wait: 0 min (immediate)
        ↓
[2] Internal Notification — Push Alert to Team
        ↓
[3] SMS to Contact — Emergency acknowledgment
        ↓
[4] Wait: 5 minutes
        ↓
[5] Email 1 — "Your Books Are in Critical Condition"
        ↓
[6] Wait: 1 day
        ↓
[7] IF: Appointment Booked?
        ├── YES → [8] Remove from sequence (tag: booked-call)
        └── NO  → [9] Email 2 — "The Cost of Waiting"
                        ↓
                  [10] Wait: 2 days
                        ↓
                  [11] IF: Appointment Booked?
                        ├── YES → [12] Remove from sequence
                        └── NO  → [13] Email 3 — "Last Chance: Emergency Slots"
                                        ↓
                                  [14] Wait: 3 days
                                        ↓
                                  [15] IF: Appointment Booked?
                                        ├── YES → Remove from sequence
                                        └── NO  → [16] Tag: emergency-sequence-complete
```

### Emergency — Node Configurations

**Node 2 — Internal Push Alert**

- Action type: Send Internal Notification
- To: Team (all assigned users) OR specific user email
- Subject: `🚨 EMERGENCY LEAD: {{contact.firstName}} {{contact.lastName}}`

```
Body:
  New Emergency Books Rescue lead just submitted.
  Name:    {{contact.firstName}} {{contact.lastName}}
  Email:   {{contact.email}}
  Phone:   {{contact.phone}}
  Company: {{contact.companyName}}
  Score:   {{contact.books_rescue_score}}/100
  Tier:    EMERGENCY
  → Call within 2 hours for best conversion rate.
  → Calendly: https://calendly.com/balancebeamteam/books-rescue
```

**Node 3 — SMS to Contact**

- Action type: Send SMS
- From: BBT main number (Balance Beam Team GHL number)
- To: `{{contact.phone}}`

```
Message:
Hi {{contact.firstName}} — thanks for taking the Books Rescue diagnostic.
Your score shows your books need immediate attention.
I'd love to hop on a quick 20-min call to walk you through exactly
what we'd do to fix this — no cost, no pressure.
Grab a time here: https://calendly.com/balancebeamteam/books-rescue
— Balance Beam Team
```

> ⚠️ SMS sends only if contact phone is present AND opted in to SMS. Add GHL condition: **Contact Phone is not empty.**

**Node 5 — Email 1: "Your Books Are in Critical Condition"**

- Action type: Send Email
- From name: Balance Beam Team
- From email: `hello@balancebeamteam.com`
- Reply-to: `hello@balancebeamteam.com`
- Subject: `🚨 Your Books Rescue Score: {{contact.books_rescue_score}}/100 — Here's what it means`
- Preview text: `You scored in the Emergency tier. Here's what that means and what to do next.`

```
Body (HTML — use GHL email builder):
  Hi {{contact.firstName}},
  You just completed the Books Rescue Diagnostic, and your score
  of {{contact.books_rescue_score}}/100 placed you in our
  Emergency tier — the most urgent category we see.
  That's not a scare tactic. It means your books have significant
  gaps that are costing you money right now — in missed deductions,
  compounding penalties, and decisions made without real numbers.
  Here's what happens if you let it sit another 30 days:
  → IRS interest and penalties continue to accrue
  → The catch-up cost grows with every month you wait
  → You stay blind to where your money is actually going
  We've helped businesses with worse books than yours get fully
  current in 3–4 weeks. It's not as painful as you think.
  The first step is a free 20-minute call.
  No prep needed. No judgment. Just answers.
  [Book My Emergency Rescue Call — Free, 20 Min]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
  balancebeamteam.com
  P.S. We take a maximum of 4 Books Rescue clients per month.
  Emergency slots are usually the first to fill.
```

**Node 9 — Email 2: "The Cost of Waiting"**

- Subject: `The longer your books sit, the more it costs — here's the math`
- Preview text: `A quick breakdown of what staying behind actually costs your business.`

```
Body:
  Hi {{contact.firstName}},
  I wanted to follow up because I know how easy it is to keep
  putting this off. "I'll deal with it next month" is something
  we hear constantly — and it's almost always the most expensive
  decision a business owner makes.
  Here's what being 6+ months behind typically costs:
  → $500–$2,000 in IRS late filing / payment penalties
  → $1,500–$4,000 extra in accountant catch-up fees at tax time
  → Unknown deductions lost — typically $3,000–$8,000 for a
    service business at your revenue level
  → Decisions made on bad numbers — the invisible cost
  The fix is not as expensive or time-consuming as you think.
  Our Books Rescue engagement for Emergency clients typically
  runs 3–4 weeks and includes everything you need to get clean.
  I'd love to talk through your situation specifically.
  15–20 minutes. Free. No pitch, just a plan.
  [Book Your Call Now →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
```

**Node 13 — Email 3: "Last Chance: Emergency Slots"**

- Subject: `Final note — our Emergency slots for this month`
- Preview text: `We're almost at capacity for June. One spot remaining.`

```
Body:
  Hi {{contact.firstName}},
  This is my last note — I don't want to keep showing up in your
  inbox if the timing isn't right.
  But if it IS right and you've just been putting it off,
  I want you to know: we have one Emergency slot remaining
  for this month.
  Once it's filled, the next availability is 4–6 weeks out.
  If you're ready to stop worrying about your books and actually
  do something about it — grab the last spot now.
  [Claim the Last Emergency Slot →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  If now's not the right time, no worries at all.
  You can always reach us at hello@balancebeamteam.com.
  — The Balance Beam Team
  P.S. Your diagnostic score and results will be saved.
  When you're ready, we'll know exactly where you stand.
```

**Node 16 — Tag: emergency-sequence-complete**

- Action type: Add Tag
- Tag: `emergency-sequence-complete`
- Purpose: Marks end of automated sequence — contact moves to manual review queue

---

# WORKFLOW 2 — Crisis Tier

| Field | Value |
|---|---|
| Workflow name | **BBT — Books Rescue: Crisis Follow-up** |
| Trigger | Contact Tag Added = `books-rescue-crisis` |
| Enrollment condition | Tag contains `books-rescue-crisis` AND NOT `quality-hold` |
| Re-enrollment | OFF |

### Crisis — Workflow Node Sequence

```
[TRIGGER] Tag Added: books-rescue-crisis
        ↓
[1] Wait: 0 min (immediate)
        ↓
[2] Internal Notification — Push Alert
        ↓
[3] Wait: 15 minutes
        ↓
[4] Email 1 — "Your Books Are Behind — Here's the Real Cost"
        ↓
[5] Wait: 2 days
        ↓
[6] IF: Appointment Booked?
        ├── YES → Remove from sequence
        └── NO  → [7] Email 2 — "What a Books Cleanup Actually Involves"
                        ↓
                  [8] Wait: 3 days
                        ↓
                  [9] IF: Appointment Booked?
                        ├── YES → Remove from sequence
                        └── NO  → [10] Email 3 — "The Question I Ask Every Crisis Client"
                                        ↓
                                  [11] Wait: 4 days
                                        ↓
                                  [12] IF: Appointment Booked?
                                        ├── YES → Remove from sequence
                                        └── NO  → [13] Tag: crisis-sequence-complete
```

### Crisis — Email subjects (per sequence)

| Node | Email | Subject |
|---|---|---|
| [4] | Email 1 | "Your Books Are Behind — Here's the Real Cost" |
| [7] | Email 2 | "What a Books Cleanup Actually Involves" |
| [10] | Email 3 | "The Question I Ask Every Crisis Client" |

> **⚠️ Source gap (not in canonical packet) —** Crisis node configurations and full email bodies are marked `[...full Crisis node configurations...]` in the source master document. The **email subjects and node sequence above are transcribed**, but Node 2 (Push Alert) config, the From/Preview/Body for Emails 1–3, and any send conditions are **not present in the available source files** and must be supplied from the *Part M* working file before build. **Do not invent the body copy.** (Suggested timing/alert pattern mirrors the Emergency tier with the 15-min/2-day/3-day/4-day cadence shown above.)

---

# WORKFLOW 3 — At-Risk Tier

| Field | Value |
|---|---|
| Workflow name | **BBT — Books Rescue: At-Risk Nurture** |
| Trigger | Contact Tag Added = `books-rescue-at-risk` |
| Enrollment condition | Tag contains `books-rescue-at-risk` AND NOT `quality-hold` |
| Re-enrollment | OFF |

### At-Risk — Workflow Node Sequence

```
[TRIGGER] Tag Added: books-rescue-at-risk
        ↓
[1] Wait: 0 min (immediate)
        ↓
[2] Internal Notification — Soft Alert
        ↓
[3] Wait: 30 minutes
        ↓
[4] Email 1 — "Your Score + What It Means for Your Business"
        ↓
[5] Wait: 3 days
        ↓
[6] IF: Appointment Booked?
        ├── YES → Remove from sequence
        └── NO  → [7] Email 2 — "The $12K Conversation"
                        ↓
                  [8] Wait: 4 days
                        ↓
                  [9] IF: Appointment Booked?
                        ├── YES → Remove from sequence
                        └── NO  → [10] Email 3 — "What Your Books Are Actually Telling You"
                                        ↓
                                  [11] Wait: 5 days
                                        ↓
                                  [12] IF: Appointment Booked?
                                        ├── YES → Remove from sequence
                                        └── NO  → [13] Email 4 — "The Tune-Up vs. The Rebuild"
                                                        ↓
                                                  [14] Wait: 7 days
                                                        ↓
                                                  [15] IF: Appointment Booked?
                                                        ├── YES → Remove from sequence
                                                        └── NO  → [16] Email 5 — "Still Here If You Need Us"
                                                                        ↓
                                                                  [17] Tag: at-risk-sequence-complete
```

### At-Risk — Node Configurations

**Node 2 — Internal Soft Alert**

- Action type: Send Internal Notification
- Subject: `🟡 At-Risk Lead: {{contact.firstName}} — Score {{contact.books_rescue_score}}/100`

```
Body:
  At-Risk Books Rescue lead submitted.
  Name:    {{contact.firstName}} {{contact.lastName}}
  Email:   {{contact.email}}
  Phone:   {{contact.phone}}
  Company: {{contact.companyName}}
  Score:   {{contact.books_rescue_score}}/100
  Tier:    AT-RISK
  → Nurture sequence started. No immediate action required.
  → Monitor for appointment booking over next 3 weeks.
```

**Node 4 — Email 1: "Your Score + What It Means"**

- Subject: `Your Books Rescue Score: {{contact.books_rescue_score}}/100 — here's the honest take`
- Preview text: `You're in our At-Risk tier. Not broken — but there are gaps worth fixing now.`

```
Body:
  Hi {{contact.firstName}},
  You just completed the Books Rescue Diagnostic, and your score
  of {{contact.books_rescue_score}}/100 puts you in our At-Risk tier.
  That's actually good news in a way — you're not in crisis.
  Your books are functional. But there are gaps that, left alone,
  tend to compound into much more expensive problems.
  Here's what At-Risk usually looks like in practice:
  → Books that are mostly current but have uncategorized transactions
  → A P&L you sort of trust but wouldn't want to hand to a bank
  → Tax time that involves more scrambling than it should
  → Deductions you're probably missing because categorization isn't clean
  None of this is catastrophic. All of it is fixable — and quickly.
  Most At-Risk clients are fully current within 2–3 weeks,
  and leave with a clean system that actually stays clean.
  If you'd like to talk through what that looks like for {{contact.companyName}},
  I'm happy to spend 20 minutes with you — free, no obligation.
  [Book My Free Books Health Call →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
  balancebeamteam.com
```

**Node 7 — Email 2: "The $12K Conversation"**

- Subject: `The $12K conversation I have with a lot of At-Risk clients`
- Preview text: `A story about what "mostly fine" books were actually hiding.`

```
Body:
  Hi {{contact.firstName}},
  I want to share something that comes up constantly with
  At-Risk clients — a version of this conversation happens
  more often than you'd think.
  A marketing agency owner came to us convinced her books
  were "basically fine." She was mostly current, had a CPA
  she trusted, and felt like things were under control.
  When we did a proper cleanup and review, we found:
  → $7,400 in legitimate business deductions that had been
    miscategorized as personal expenses
  → $4,800 in software and contractor costs that were never
    entered at all
  → Three months of bank transactions that didn't match
    her accounting software
  Total recovered value: over $12,000. From books she thought
  were "mostly fine."
  This isn't unusual. It's actually one of the most common
  outcomes we see with At-Risk clients — the gaps look small
  on the surface and turn out to be meaningful.
  Worth 20 minutes to find out what yours might be hiding?
  [Book the Call — Free, 20 Min →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
```

**Node 10 — Email 3: "What Your Books Are Actually Telling You"**

- Subject: `What your books are telling you (that you might not be hearing)`
- Preview text: `Three financial signals most At-Risk business owners are missing.`

```
Body:
  Hi {{contact.firstName}},
  Clean books don't just keep you out of trouble with the IRS.
  They tell you things about your business that you can't see any other way.
  Here are three things most At-Risk business owners are missing
  right now because their books aren't clean enough to show them:
  1. Which services or clients are actually profitable.
     Revenue looks good on paper — but after accounting for time,
     costs, and overhead, some clients are net negative.
     Clean books make this visible.
  2. When your slow months are coming.
     Cash flow forecasting requires accurate historical data.
     If your books have gaps, your forecasts are guesses.
  3. Whether you're over- or under-paying yourself.
     Owners with clean books make better owner compensation decisions.
     It's that simple.
  None of this requires a complicated system.
  It requires books that are current, categorized correctly,
  and reviewed with someone who knows what to look for.
  That's exactly what a Books Health call is for.
  [Book My Free Books Health Call →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
```

**Node 13 — Email 4: "The Tune-Up vs. The Rebuild"**

- Subject: `The difference between a tune-up and a rebuild (and which one you need)`
- Preview text: `At-Risk is the last tier where a tune-up is still possible.`

```
Body:
  Hi {{contact.firstName}},
  There are two ways businesses fix their books:
  The tune-up: You're behind by weeks, not months. The gaps
  are real but manageable. A focused 2–3 week engagement
  gets you fully current. Cost is reasonable. Disruption is minimal.
  The rebuild: You've waited too long. Books are 6+ months behind.
  Reconciliation takes weeks of intensive work. Cost is 3–5×
  higher. Stress is significant. This is what we call Emergency level.
  Right now, you're in tune-up territory.
  Your score says there are gaps — but they're closable without
  a full rebuild. The window to fix this cleanly, quickly, and
  affordably is open right now.
  It won't stay open indefinitely.
  [Book the Tune-Up Conversation — Free →]
  (Button → https://calendly.com/balancebeamteam/books-rescue)
  — The Balance Beam Team
```

**Node 16 — Email 5: "Still Here If You Need Us"**

- Subject: `Last note — we'll be here when the timing is right`
- Preview text: `No pressure. Just making sure you know where to find us.`

```
Body:
  Hi {{contact.firstName}},
  This is my last email in this sequence — I don't want to
  wear out my welcome in your inbox.
  If the timing isn't right right now, that's completely fine.
  Books cleanup is one of those things that tends to happen
  when it becomes urgent enough to prioritize.
  When that time comes, we'll be here.
  A few ways to reach us:
  → Book a call anytime: calendly.com/balancebeamteam/books-rescue
  → Email us directly: hello@balancebeamteam.com
  → Your diagnostic score is saved — we'll remember where you stand
  Wishing you and {{contact.companyName}} a great rest of the year.
  — The Balance Beam Team
  balancebeamteam.com
```

---

# WORKFLOW 4 — Stable Tier

| Field | Value |
|---|---|
| Workflow name | **BBT — Books Rescue: Stable → Bookkeeping Starter Upsell** |
| Trigger | Contact Tag Added = `books-rescue-stable` |
| Enrollment condition | Tag contains `books-rescue-stable` AND NOT `quality-hold` |
| Re-enrollment | OFF |

### Stable — Workflow Node Sequence

```
[TRIGGER] Tag Added: books-rescue-stable
        ↓
[1] Wait: 0 min
        ↓
[2] Internal Notification — FYI Alert
        ↓
[3] Wait: 1 hour
        ↓
[4] Email 1 — "Your Score + The Bookkeeping Starter Plan"
        ↓
[5] Wait: 4 days
        ↓
[6] IF: Appointment Booked?
        ├── YES → Remove from sequence
        └── NO  → [7] Email 2 — "What Stable Businesses Do Differently"
                        ↓
                  [8] Wait: 5 days
                        ↓
                  [9] IF: Appointment Booked?
                        ├── YES → Remove from sequence
                        └── NO  → [10] Email 3 — "The One Thing Your CPA Wishes You Had"
                                        ↓
                                  [11] Wait: 7 days
                                        ↓
                                  [12] IF: Appointment Booked?
                                        ├── YES → Remove from sequence
                                        └── NO  → [13] Tag: stable-sequence-complete
```

### Stable — Email subjects (per sequence)

| Node | Email | Subject |
|---|---|---|
| [4] | Email 1 | "Your Score + The Bookkeeping Starter Plan" |
| [7] | Email 2 | "What Stable Businesses Do Differently" |
| [10] | Email 3 | "The One Thing Your CPA Wishes You Had" |

> **⚠️ Source gap (not in canonical packet) —** Stable node configurations and full email bodies are marked `[...full Stable node configurations and email bodies...]` in the source master document. The **email subjects and node sequence above are transcribed**, but Node 2 (FYI Alert) config and the From/Preview/Body for Emails 1–3 are **not present in the available source files** and must be supplied from the *Part O* working file before build. **Do not invent the body copy.** This tier is the **Bookkeeping Starter upsell** path (low-urgency nurture).

---

## GitHub + Notion integration

- Branch: `feature/IMP-233-books-rescue-diagnostic`
- Repo: `balancebeamtax/BBT-Landing`
- Commit prefix: `[IMP-233]` on every commit
- PR title: `[IMP-233] Books Rescue Diagnostic Funnel — books-rescue-diagnostic.html`
- **No PR by Claude Code. No merge without human approval.**
- **GHL workflow mappings are owner-only edits.** Agents draft specs; the owner executes in the GHL UI.
- Notion log: Update Change Log in Notion after each phase: branch created → GHL built → smoketest passed → PR merged → deploy verified.
