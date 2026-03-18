# Stage-Change Checkpoints & Rules

**Goal:** Define **checkpoints** (what must be true before a stage/status change is allowed) and **rules** (validation, who can change, forward/backward moves, audit) for **Opportunity** stage and **Lead** status in Bedrock. Applies to both manual UI changes and AI-proposed changes (which still require human confirmation). Roadmap: `product/ROADMAP-AND-STANDARDS.md`. Edit history: `product/fundraising-team/phases/ai-writable-fields-and-edit-history.md`.

---

## 1. Opportunity stage: order and definitions

Canonical order (linear progression; closed stages are terminal):

| Order | Stage (API/value) | Display name | Probability default |
|-------|-------------------|--------------|----------------------|
| 1 | `identified` | Identified | 10% |
| 2 | `qualified` | Qualified | 25% |
| 3 | `proposal-sent` | Proposal Sent | 50% |
| 4 | `in-negotiation` | In Negotiation | 75% |
| 5 | `verbal-commit` | Verbal Commit | 90% |
| 6a | `closed-won` | Closed Won | 100% |
| 6b | `closed-lost` | Closed Lost | 0% |

**Source:** `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md`.

---

## 2. Opportunity: checkpoints (before allowing a stage change)

Before the system allows a transition **to** a given stage, the following must hold. If a checkpoint fails, the UI (or API) should block the change and surface the missing requirement; AI proposals that would violate checkpoints can be rejected or shown with a warning.

| Target stage | Checkpoint (required before move) | Notes |
|--------------|-----------------------------------|--------|
| **qualified** | `account_id` set; `primary_contact_id` set (or org policy: contact optional for qualified) | Must have account and preferably contact. |
| **proposal-sent** | `account_id`, `primary_contact_id`; `expected_close_date` set | Don’t send proposal without a close date. |
| **in-negotiation** | Same as proposal-sent; optional: at least one Task or Activity linked | Soft: “has had some follow-up.” |
| **verbal-commit** | `amount_estimated` or `amount_confirmed` set (or both) | Verbal = we know the number. |
| **closed-won** | `amount_confirmed` set; `expected_close_date` set (or CloseDate in SF) | Won = confirmed amount and date. |
| **closed-lost** | Optional: note or reason (recommended for reporting). | No hard block; encourage a note. |

**General:** `name` and `assigned_to` are required at creation; no stage change should clear them.

**Implementation:** Checkpoints can be enforced in backend (Salesforce flows, validation rules, or Bedrock API) and/or in frontend before submitting. If Salesforce is source of truth, replicate only the rules we own in Bedrock and document any SF-specific overrides.

---

## 3. Opportunity: rules for stage changes

- **Forward moves (e.g. identified → qualified):** Allowed if checkpoints for the **target** stage are satisfied. Skipping stages (e.g. identified → proposal-sent) is **allowed** but can trigger a one-time confirmation in UI (“Skip stages?”) and/or require a short reason for audit.
- **Backward moves (e.g. qualified → identified):** Allowed for any **open** stage. Useful for corrections or re-qualification. Log in edit history with actor and optional reason.
- **Moving to closed-won or closed-lost:** One-way; no moving back to an open stage without a dedicated “reopen” action (if we support it later). For now: closed = terminal; reopening = new product decision.
- **Who can change:** Owner of the opportunity, or any user with “team”/“fundraising” role; admins can change any. AI can only **propose**; a human must confirm (see ai-writable-fields-and-edit-history).
- **Audit:** Every stage change is appended to the opportunity’s edit-history file (and to Salesforce history if we use it): timestamp, actor, old_stage → new_stage, optional reason/source.

---

## 4. Lead status: order and definitions

| Order | Status (API/value) | Display name | Notes |
|-------|--------------------|--------------|--------|
| 1 | `new` | New | Just entered. |
| 2 | `contacted` | Contacted | First touch made. |
| 3 | `qualifying` | Qualifying | In process of qualifying. |
| 4 | `converted` | Converted | Converted to Opportunity. |
| — | `archived` | Archived | Disqualified or dormant (not in pipeline). |

**Source:** data-model (Lead status enum). App Leads may use a superset (e.g. `unqualified`) per `weeklyPriorities` types; map to this canonical set for SF sync.

---

## 5. Lead: checkpoints (before allowing a status change)

| Target status | Checkpoint | Notes |
|---------------|------------|--------|
| **contacted** | Lead has `contact_id` or at least email/name. | So we know who was contacted. |
| **qualifying** | Same as contacted; optional: note or next step. | Soft. |
| **converted** | `opportunity_id` set (link to created Opportunity). | Conversion = linked opp. |
| **archived** | Optional: note or reason. | Encourage reason for reporting. |

**General:** No status change should clear `contact_id` or `assigned_to` unless explicitly “unassign.”

---

## 6. Lead: rules for status changes

- **Forward/backward:** Allowed between `new`, `contacted`, `qualifying` freely; moving to `converted` or `archived` is effectively terminal unless we add “reopen” later.
- **Converted:** Once set, require `opportunity_id`. UI: “Convert to opportunity” creates (or links) the Opportunity and sets status to `converted`.
- **Who can change:** Owner or team/fundraising role; admins any. AI can only propose; human confirms.
- **Audit:** Every status change appended to the lead’s edit-history file; timestamp, actor, old_status → new_status, optional reason/source.

---

## 7. Implementation checklist (high level)

- [ ] **Backend or SF:** Enforce Opportunity checkpoints (e.g. block closed-won without amount_confirmed); document SF validation rules if we rely on them.
- [ ] **Frontend:** Before submitting a stage/status change, run checkpoint checks; show clear errors or “missing: X” and block submit until satisfied (or user explicitly overrides with reason if policy allows).
- [ ] **AI proposals:** When AI suggests a stage/status change, run same checkpoints; if fail, show warning in review queue (“Missing amount_confirmed for Closed Won”) and require user to fix or reject.
- [ ] **Edit history:** Append every stage/status change (manual or confirmed AI) to the object’s edit-history file per ai-writable-fields-and-edit-history.
- [ ] **Reopen (optional):** If we later allow reopening closed opportunities or unconverting leads, add a dedicated action and document in this file.

---

## 8. References

- **Data model (stages):** `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md`
- **Opportunity pipeline UI:** `product/fundraising-team/raw-prds/prospect-dashboard/specs/opportunity-pipeline.md`
- **AI-writable fields & edit history:** `product/fundraising-team/phases/ai-writable-fields-and-edit-history.md`
- **Slack/AI proposals:** `product/fundraising-team/phases/slack-data-entry-and-review.md`, home-page-spec §3.3–3.4
