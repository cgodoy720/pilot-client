# Pursuit CRM (Bedrock) — Entity & Relationship Map

> Phase 1 Deliverable | Version: 1.0 | Date: 2026-03-15
>
> Companion to: `product/crm-scope-constitution.md`
> Aligns with: `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md`

---

## Design Principles

1. **Graph-compatible IDs.** Human-readable, collision-resistant: `opp-2026-001`, `contact-sarah-chen`, `acct-goldman-sachs-foundation`. These become filenames in the future knowledge graph.
2. **Source tracking.** Every record knows where it came from (Salesforce sync, CSV import, manual entry, Slack ingest, prospect conversion).
3. **Soft deletes.** Never hard-delete. Use `status: archived` so history is preserved.
4. **Timestamps everywhere.** `created_at` and `updated_at` on every entity.
5. **Revenue stream tagging.** Opportunities and payments carry `revenue_stream: nonprofit | pbc` so reporting can always split or combine.

---

## Entity Definitions

### 1. Account (Organization)

**What it is:** A company, foundation, government entity, or individual donor — any organization Pursuit has or may have a financial relationship with.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `acct-{slug}` |
| name | string | Required |
| type | enum | `corporation`, `foundation`, `government`, `individual`, `other` |
| industry | string | |
| website | string | |
| salesforce_id | string | For sync; nullable for manually-created records |
| revenue_streams | enum[] | `nonprofit`, `pbc`, or both — which streams this org participates in |

**Revenue stream:** Both. A single Account (e.g., Goldman Sachs Foundation) may have grant Opportunities (nonprofit) and contract Opportunities (PBC).

---

### 2. Contact (Person)

**What it is:** A person in Pursuit's network — a funder, prospect, program officer, board member, or other relationship.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `contact-{slug}` |
| first_name | string | Required |
| last_name | string | Required |
| email | string | |
| phone | string | |
| title | string | |
| organization | string | Display name; may or may not match an Account |
| linkedin_url | string | |
| source | enum | See `canonical-definitions.md` Section 7 |
| salesforce_id | string | For sync; nullable |
| wealth_tier | enum | `tier-1` through `tier-4`, `unknown` — populated by network search |
| composite_score | number | 0–100, populated by prospect intelligence |
| intelligence_updated_at | datetime | When prospect intelligence (score, tier) was last refreshed. Null = never scored. |
| intelligence_source | string | What produced the current score (e.g., "network-search-v1", "claude-api-2026-03") |
| intelligence_confidence | enum | `verified` (human-reviewed), `high` (multiple signals), `low` (single source or stale >90 days) |

**Intelligence reliability:** Prospect scores decay. If `intelligence_updated_at` is >90 days old, `intelligence_confidence` should auto-downgrade to `low`. Decisions based on stale intelligence must note this in the Decision record.

**Revenue stream:** Neither directly. Contacts participate via Opportunities and Prospects.

---

### 3. Opportunity (Potential Revenue)

**What it is:** A specific fundraising or revenue opportunity — a grant application, a contract negotiation, a sponsorship deal.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `opp-{year}-{nnn}` |
| name | string | Required |
| account_id | string | → Account |
| primary_contact_id | string | → Contact |
| amount_estimated | number | USD |
| amount_confirmed | number | USD; set when closed-won |
| stage | enum | See stage definitions below |
| revenue_stream | enum | `nonprofit` or `pbc` — **required**, drives pipeline separation |
| expected_close_date | date | |
| assigned_to | string | Team member |
| probability | number | 0–100; defaults from stage |
| salesforce_id | string | For sync |
| service_type | enum | `donation`, `consulting`, `apprenticeship`, `fde`, `other` |

**Stage definitions:** See `canonical-definitions.md` Section 1. Seven stages (`identified` → `closed-won` / `closed-lost`), each with probability defaults and revenue-stream-specific interpretations. The canonical file also maps legacy PRD.md stage names.

**Revenue stream:** One per Opportunity (`nonprofit` or `pbc`, required). An Account may have Opportunities across both streams.

---

### 3a. Grant Requirements (child of Opportunity, nonprofit only)

**What it is:** The programmatic obligations attached to a nonprofit grant — what Pursuit must deliver, measure, and report. One-to-one with Opportunity where `revenue_stream = nonprofit`. Not applicable to PBC opportunities.

**Why a separate entity (not fields on Opportunity):** Grant requirements contain structured lists (multiple inputs, outputs, outcomes, reporting dates). Embedding these as flat fields on Opportunity would create sparse columns and make PBC opportunities carry irrelevant fields. A dedicated entity keeps Opportunity lean and grants well-documented.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `grant-req-{opp-id}` (mirrors parent Opportunity ID) |
| opportunity_id | string | → Opportunity (required, one-to-one) |
| grant_start_date | date | When the grant period begins |
| grant_end_date | date | When the grant period ends |
| reporting_requirements | ReportingReq[] | See structure below |
| program_inputs | ProgramMetric[] | What Pursuit must deliver (e.g., "50 Builders enrolled who are NYCHA residents") |
| program_outputs | ProgramMetric[] | Measurable results during program (e.g., "Level 2 pass rate ≥ 80%") |
| program_outcomes | ProgramMetric[] | Long-term impact metrics (e.g., "income increase ≥ 30% for L3+ completers within 12 months") |
| notes | text | Additional funder requirements or context |

**ReportingReq structure:**

```typescript
interface ReportingReq {
  type: 'interim' | 'annual' | 'final' | 'financial' | 'other';
  due_date: date;            // When the report is due
  description: string;       // What the report must contain
  status: 'pending' | 'submitted' | 'accepted';
}
```

**ProgramMetric structure:**

```typescript
interface ProgramMetric {
  name: string;              // e.g., "NYCHA resident enrollment"
  target_value: string;      // e.g., "50 Builders" or "≥ 80%"
  actual_value?: string;     // Filled in during/after program
  measurement_method: string; // How this is measured
  status: 'not-started' | 'in-progress' | 'met' | 'not-met' | 'pending-verification';
}
```

**Examples:**

```yaml
# Program Inputs (what Pursuit must deliver)
- name: NYCHA resident enrollment
  target_value: "50 Builders"
  measurement_method: "Enrollment records cross-referenced with NYCHA residency verification"

# Program Outputs (measurable results during program)
- name: Level 2 pass rate
  target_value: "≥ 80%"
  measurement_method: "Assessment scores from LMS"

# Program Outcomes (long-term impact)
- name: Income increase post-program
  target_value: "≥ 30% within 12 months for L3+ completers"
  measurement_method: "Follow-up survey at 6 and 12 months post-completion"

- name: Employment rate
  target_value: "≥ 85% within 6 months for L3+ completers"
  measurement_method: "Employer verification and self-report survey"
```

---

### 4. Payment / Transaction

**What it is:** A single payment event — a check received, a wire transfer, an invoice paid. Payments are children of Opportunities.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `pay-{year}-{nnn}` |
| opportunity_id | string | → Opportunity (required) |
| amount | number | USD |
| expected_date | date | When the payment is expected |
| received_date | date | When actually received; null if outstanding |
| status | enum | See `canonical-definitions.md` Section 6 |
| sage_id | string | Sage Intacct reference; nullable until Phase 2 |
| payment_method | string | `check`, `wire`, `ach`, `credit-card`, `other` |
| notes | string | |

**Revenue stream:** Inherited from parent Opportunity.

**Key question resolved:** Payments attach to Opportunities, not Campaigns. A Campaign may *influence* an Opportunity, but money flows through Opportunities.

---

### 5. Campaign (Post-MVP — deferred to keep MVP lean)

**What it is (Post-MVP):** A fundraising campaign or initiative that groups Opportunities. Deferred as a full entity — **MVP uses a simple `campaign_name` string field on Opportunity** instead of a separate entity with junction tables.

**MVP approach:** Add `campaign_name: string (optional)` to Opportunity. This covers basic attribution ("FY2026 Annual Fund") without the overhead of Campaign CRUD, CampaignOpportunity junction tables, or attribution logic. Promote to full entity in Post-MVP if reporting demands it.

**Post-MVP entity (if promoted):**

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `camp-{year}-{slug}` |
| name | string | Required |
| goal_amount | number | USD target |
| start_date | date | |
| end_date | date | |
| status | enum | `planned`, `active`, `completed`, `cancelled` |

**Revenue stream:** Both. A single Account may have Opportunities across both streams linked to one campaign.

---

### 6. Prospect (formerly "Lead" — renamed to avoid confusion with learning platform)

**What it is:** A fundraising prospect not yet qualified into the pipeline. Prospects convert to Opportunities when qualified. Renamed from "Lead" to distinguish from the learning platform's admissions Lead entity.

**Authority:** Bedrock is the prototype authority. In production, Prospects sync to Salesforce Lead object (custom record type `Fundraising_Lead`). The learning platform's `lead` table is for admissions — distinct lifecycle, no cross-write.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `prospect-{year}-{nnn}` |
| contact_id | string | → Contact (required) |
| source | enum | See `canonical-definitions.md` Section 7 |
| status | enum | See `canonical-definitions.md` Section 6 |
| assigned_to | string | |
| score | number | 0–100; populated by prospect intelligence (Phase 2+) |
| opportunity_id | string | → Opportunity; set on conversion |
| converted_at | datetime | |

**On conversion:** `Prospect.opportunity_id` is set, creating a one-to-one link. The Opportunity does not store a back-reference — trace conversion history by querying Prospects with `opportunity_id = {opp}`.

**Revenue stream:** Not assigned until conversion to Opportunity.

**Migration path:** Prototype (IndexedDB/in-memory) → Salesforce Lead with RecordType `Fundraising_Lead` → optional PostgreSQL `fundraising_prospect` table for cross-platform joins when merged with learning platform.

---

### 7. Task (Action Item / Deadline)

**What it is:** A to-do linked to an Opportunity, Prospect, or standalone.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `task-{year}-{nnn}` |
| title | string | Required |
| type | enum | See `canonical-definitions.md` Section 6 |
| due_date | date | Required |
| priority | enum | `high`, `medium`, `low` |
| assigned_to | string | Required |
| opportunity_id | string | → Opportunity (optional) |
| prospect_id | string | → Prospect (optional); at most one of `opportunity_id` or `prospect_id` may be set |
| status | enum | See `canonical-definitions.md` Section 6 |

---

### 8. Activity (Interaction Log)

**What it is:** A logged interaction — call, email, meeting, note, Slack message.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `act-{year}-{nnn}` |
| type | enum | `call`, `email`, `meeting`, `note`, `slack-message` |
| date | datetime | Required |
| contact_id | string | → Contact (optional) |
| opportunity_id | string | → Opportunity (optional) |
| prospect_id | string | → Prospect (optional) |
| summary | text | Required |
| logged_by | string | Who logged this |
| source_type | enum | See `canonical-definitions.md` Section 7 |

---

### 9. User (Internal Staff)

**What it is:** A Pursuit team member who uses Bedrock.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `user-{slug}` |
| name | string | Required |
| email | string | Required |
| role | enum | `partnerships-ic`, `executive`, `finance`, `program-staff`, `admin` |
| active | boolean | |

---

### 10. Decision (Audit Trail)

**What it is:** A record of a fundraising decision — why a prospect was pursued or deprioritized, why a grant was submitted or passed on, why an opportunity's strategy changed. Decisions are the institutional memory that survives team turnover.

**Why this entity matters:** Prospect intelligence is only valuable if the reasoning behind decisions is preserved. Six months later, "why did we pass on this funder?" needs an answer. Without Decision records, that knowledge lives only in someone's head.

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `dec-{year}-{nnn}` |
| type | enum | `pursue`, `deprioritize`, `strategy-change`, `escalate`, `pass` |
| rationale | text | Required. The *why* — plain language explanation of reasoning |
| made_by | string | → User who made the decision |
| date | datetime | When the decision was made |
| contact_id | string | → Contact (optional) |
| prospect_id | string | → Prospect (optional) |
| opportunity_id | string | → Opportunity (optional) |
| intelligence_snapshot | text | Key data points at the time of decision (e.g., "composite_score: 78, wealth_tier: tier-2, last meeting: 2026-02-15"). Frozen at decision time — not a live reference. |
| outcome | enum | `pending`, `validated`, `invalidated` — set retroactively to track decision quality |
| outcome_notes | text | What actually happened (set later) |

**Design principle:** Decisions capture *reasoning at a point in time*. The `intelligence_snapshot` freezes the data that informed the decision, so even if scores or tiers change later, the original basis is preserved.

---

### 11. NetworkMatch (Prospect Intelligence — Post-MVP, minimal MVP schema)

**What it is:** A match between a LinkedIn contact and a prospect list record — output of the network search feature.

**MVP schema (4 fields only):**

| Key Attribute | Type | Notes |
|---------------|------|-------|
| id | string | `match-{contact-slug}-{source}` |
| linkedin_contact_id | string | → Contact (the LinkedIn connection) |
| prospect_contact_id | string | → Contact (the prospect list record) |
| match_confidence | number | 0–100 (Fuse.js fuzzy match score) |

**Post-MVP additions** (add when scoring algorithm is defined):

| Key Attribute | Type | Notes |
|---------------|------|-------|
| composite_score | number | 0–100; weighted algorithm (spec required before implementation) |
| outreach_priority | enum | `hot` (≥75), `warm` (50–74), `worth-exploring` (<50) — derived from composite_score |
| reviewed | boolean | Human verification flag |
| prospect_id | string | → Prospect, if promoted to pipeline |

> **Post-MVP schema deferred until** the prospect scoring algorithm is specified. Do not implement these fields until composite_score calculation logic is documented and reviewed.

---

## Relationships (Visual Summary)

```
┌──────────┐     many-to-many      ┌──────────┐
│ Contact  │◄────────────────────►  │ Account  │
└────┬─────┘   (ContactAccount)     └────┬─────┘
     │                                    │
     │ one-to-one                         │ many-to-one
     ▼                                    ▼
┌──────────┐                        ┌──────────────┐
│ Prospect │───── converts to ────► │ Opportunity   │
└──────────┘                        │              │
                                    │ campaign_name│ ← simple string (MVP)
                                    └──────┬───────┘
                                           │
                         ┌─────────────────┼─────────────────┐
                         │                 │                  │
                    one-to-many       one-to-many        one-to-many
                         ▼                 ▼                  ▼
                   ┌──────────┐     ┌──────────┐      ┌──────────┐
                   │ Payment  │     │  Task    │      │ Activity │
                   └──────────┘     └──────────┘      └──────────┘

┌──────────────┐  (nonprofit only)  ┌──────────────────┐
│ Opportunity  │◄── one-to-one ────│ GrantRequirements │
└──────────────┘                   └──────────────────┘

┌──────────────┐   promotes to   ┌──────────┐
│ NetworkMatch │─ ─ ─ ─ ─ ─ ─ ► │ Prospect │
└──────────────┘                 └──────────┘
       │
       │ many-to-one
       ▼
┌──────────┐
│ Contact  │
└──────────┘

┌──────────┐  records reasoning   ┌───────────┐   ┌─────────────┐
│ Decision │──────────────────── │ Prospect  │   │ Opportunity │
│          │──────────────────── │           │   │             │
└──────────┘                     └───────────┘   └─────────────┘
```

### Junction Tables

| Junction | Purpose |
|----------|---------|
| ContactAccount | Many-to-many: a Contact can belong to multiple Accounts (e.g., board member at two foundations) |

> **Campaign junction (CampaignOpportunity) removed from MVP.** Campaign attribution in MVP is handled by `campaign_name` string on Opportunity. If Campaign becomes a full entity in Post-MVP, the junction table will be added then.

---

## Key Design Questions — Resolved

| Question | Resolution |
|----------|-----------|
| Can a Contact belong to multiple Accounts? | **Yes.** Via ContactAccount junction. Common: board members, consultants, people who change jobs. |
| What does a Payment attach to? | **Opportunity only.** Not Campaign. Money flows through Opportunities. Campaigns are the *why*, Opportunities are the *what*. |
| What's the difference between nonprofit and PBC Opportunities? | **`revenue_stream` enum on Opportunity.** Same entity, same stages, but different stage *meanings* (see table above) and different reporting rollups. |
| Where does cash flow projection get its data? | **Opportunities (pipeline value × probability) + Payments (scheduled vs. received).** No separate projection entity — it's a computed view. |
| Is Prospect separate from Contact? | **Yes.** A Prospect references a Contact but adds pipeline qualification state. A Contact exists independently (may never be a Prospect). A Prospect converts to an Opportunity. Renamed from "Lead" to avoid confusion with learning platform admissions leads. |
| Where is Salesforce the source of truth? | **Opportunity, Account, Contact.** Salesforce IDs are stored on Bedrock records. Sync is bidirectional for these entities. Prospects, Tasks, Activities are Bedrock-native initially; Prospects sync to SF Lead (RecordType: `Fundraising_Lead`) in production. |
| Why was "Lead" renamed to "Prospect"? | The learning platform uses "Lead" for admissions prospects (future Builders). Fundraising prospects are a different lifecycle. Renaming to "Prospect" eliminates ambiguity across systems. |
| Why is Campaign a string, not an entity? | A team of 4 ICs doesn't need Campaign CRUD, junction tables, and attribution logic in MVP. A `campaign_name` string on Opportunity covers basic grouping. Promote to full entity if reporting demands it. |

---

## Example Records

Concrete examples of what populated records look like. All fields use canonical names from `canonical-definitions.md`.

### Account

```yaml
id: acct-goldman-sachs-foundation
name: Goldman Sachs Foundation
type: foundation
industry: Financial Services
website: https://www.goldmansachs.com/foundation
salesforce_id: 001Dn00000ABC1234
revenue_streams: [nonprofit]
created_at: 2025-06-15T10:30:00Z
updated_at: 2026-02-20T14:15:00Z
```

### Contact

```yaml
id: contact-sarah-chen
first_name: Sarah
last_name: Chen
email: sarah.chen@goldmansachs.com
phone: null
title: Program Officer
organization: Goldman Sachs Foundation
linkedin_url: https://linkedin.com/in/sarah-chen
source: salesforce-import
salesforce_id: 003Dn00000DEF5678
wealth_tier: unknown       # Not a donor; a program officer
composite_score: null
created_at: 2025-06-15T10:30:00Z
updated_at: 2026-01-10T09:00:00Z
```

### Opportunity

```yaml
id: opp-2026-003
name: GS Foundation Workforce Dev Grant 2026
account_id: acct-goldman-sachs-foundation
primary_contact_id: contact-sarah-chen
amount_estimated: 300000
amount_confirmed: null     # Not yet closed-won
stage: proposal-sent
revenue_stream: nonprofit
expected_close_date: 2026-04-15
assigned_to: user-jp
probability: 50            # Default for proposal-sent
salesforce_id: 006Dn00000GHI9012
service_type: donation
campaign_name: FY2026 Annual Fund  # Simple string, not entity
created_at: 2026-01-05T11:00:00Z
updated_at: 2026-03-10T16:45:00Z
```
