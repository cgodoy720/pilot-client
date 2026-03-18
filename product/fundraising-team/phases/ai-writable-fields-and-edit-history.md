# AI-Writable Fields & Edit History per Object

**Goal:** (1) Map which fields on each object can be **proposed or written by AI tooling** in the app (Gmail/Slack ingestion, calendar matching, suggested tasks). (2) Require a **running markdown file per object** so we have a clear edit history on every record. Roadmap: `product/ROADMAP-AND-STANDARDS.md`. All AI-proposed writes require **human confirmation** before apply (see home-page-spec §3.3–3.4 and slack-data-entry-and-review). **Stage/status changes** must also satisfy checkpoints and rules in `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md`.

---

## 1. AI-writable fields by object

AI tooling may **propose** changes to these fields; nothing is written to Salesforce/Sage until a human confirms in the automation review (or Slack review queue). “Propose” = show in review queue; “Write (after confirm)” = system can create/update the record once user confirms.

| Object | System | Fields AI can propose / write | Notes |
|--------|--------|-------------------------------|--------|
| **Task (Activity)** | Salesforce | Subject, ActivityDate, Description, WhatId, WhoId, OwnerId (assignee) | Created **only after** user confirms suggested task. Gmail/meetings: create Task for LastActivityDate; Slack: create Task that summarizes + Chatter post. |
| **FeedItem (Chatter)** | Salesforce | Body (post text) | Slack only: post summary to Chatter for visibility; always also create a Task so LastActivityDate updates. |
| **Opportunity** | Salesforce | Stage, CloseDate, Amount, OwnerId, Description (note) | Slack/LLM can propose; human must confirm. No AI-only writes. |
| **Lead** | Salesforce / App | Status, OwnerId (assigned_to), Description (note); **App Lead:** last_activity_at | SF Lead: Task with WhoId updates LastActivityDate. App Leads: `last_activity_at` updated when Gmail/Slack matches the lead. |
| **Contact** | Salesforce | Name, Email, Phone, Title, (org via Account); optional note | Slack/LLM can propose; human must confirm. |
| **Account** | Salesforce | Name, Type, optional note | Slack/LLM can propose; human must confirm. |
| **Payment** | Sage (+ SF sync) | Amount, Date, Account/Opp reference, reference id | **Critical:** human verification required before any write. No AI-only writes. |

**Out of scope for AI writes:** System-only or audit fields (e.g. CreatedDate, LastModifiedDate, CreatedById). Currency, record type, and other governance fields: human or system only unless explicitly added above.

---

## 2. Edit history: running markdown file per object

We keep a **running edit-history document per object instance** so we know who changed what and when (and whether it was AI-proposed and then confirmed or rejected).

### 2.1 Convention

- **One markdown file per record.** Location: decided per environment (e.g. `edit-history/{ObjectType}/{RecordId}.md` in repo or in a docs store; or a dedicated edit-history store in DB that can export to markdown).
- **Format:** Each entry is a dated line or block: who (user id or “AI proposed”), action (created / updated / proposed / confirmed / rejected), field(s), old → new (or “proposed: value”), and optional source (e.g. “Slack #fundraising”, “Gmail”, “Calendar match”).
- **Append-only.** No deleting or rewriting history; corrections are new entries (e.g. “Rejected AI proposal for Stage; user set Stage = Qualified”).

### 2.2 Per-object applicability

| Object | Edit-history file | When to append |
|--------|-------------------|-----------------|
| Opportunity | `edit-history/Opportunity/{OpportunityId}.md` | Any change to Stage, CloseDate, Amount, Owner, note; every AI proposal and its confirm/reject. |
| Lead | `edit-history/Lead/{LeadId}.md` | Any change to Status, Owner, note, last_activity_at; every AI proposal and confirm/reject. |
| Contact | `edit-history/Contact/{ContactId}.md` | Any change to Name, Email, Phone, Title, org/Account; every AI proposal and confirm/reject. |
| Account | `edit-history/Account/{AccountId}.md` | Any change to Name, Type, note; every AI proposal and confirm/reject. |
| Task | `edit-history/Task/{TaskId}.md` | Creation (and if edited: Subject, ActivityDate, Owner); note if created from AI suggestion + confirm. |
| Payment | `edit-history/Payment/{PaymentId}.md` | Any change; every AI proposal and confirm/reject (audit-critical). |

Chatter (FeedItem) can be logged under the **parent record** (e.g. Opportunity) as “Chatter post added” in that record’s edit-history file, with a pointer to the FeedItem id if needed.

### 2.3 Example entry (Opportunity)

```markdown
# Edit history: Opportunity opp-2026-003

| Date (UTC) | Actor | Action | Field(s) | Old → New | Source |
|------------|-------|--------|---------|-----------|--------|
| 2026-03-14T14:00:00Z | AI proposed | proposed | Stage | Proposal → Qualified | Slack #fundraising |
| 2026-03-14T14:05:00Z | user:nick.simmons | confirmed | Stage | Identified → Qualified | Review queue |
| 2026-03-14T15:30:00Z | user:jane.doe | updated | CloseDate | 2026-04-01 → 2026-04-15 | Manual (UI) |
```

### 2.4 Implementation notes

- **Prototype:** Edit history can be maintained in app storage (e.g. backend table or append-only log) with export to markdown for docs or compliance. Paths above are logical; actual storage (DB table, file in repo, or doc store) is an implementation choice.
- **Merge to learning platform:** Align with that platform’s audit trail / activity log; the “running markdown per object” can be a view or export of the same data so we retain a single source of truth and still satisfy “we know the edit history on every object.”

---

## 3. References

- **Stage-change checkpoints & rules:** `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md` — checkpoints and rules for Opportunity stage and Lead status (required before allowing Stage/Status writes).
- **Home page & automation:** `product/fundraising-team/phases/home-page-spec.md` (§3.3 Activity-driven dates, §3.4 Weekly review).
- **Slack-driven proposals:** `product/fundraising-team/phases/slack-data-entry-and-review.md`.
- **Data model:** `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md`.
- **Security (RBAC, audit):** `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`.
