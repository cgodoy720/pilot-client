---
type: architecture-doc
id: arch-data-model
status: draft
created: 2026-03-13
updated: 2026-03-13
referenced_by: ["[[opportunity-pipeline]]", "[[leads-tracker]]", "[[calendar-tasks]]", "[[network-search]]", "[[transcript-pipeline]]"]
---

# Data Model

## Design principles

1. **Graph-compatible:** Every entity should map cleanly to a markdown file with YAML frontmatter. Fields become frontmatter keys. Relationships become wikilinks. See [[knowledge-graph-compat]].
2. **ID patterns:** Use human-readable, collision-resistant IDs: `opp-2026-001`, `lead-2026-042`, `contact-sarah-chen`. These become filenames in the future graph.
3. **Source tracking:** Every record should know where it came from (CSV import, manual entry, network search, converted lead) and carry a `source_quality` when relevant.
4. **Soft deletes:** Never hard-delete records. Use `status: archived` so history is preserved.
5. **Timestamps everywhere:** `created_at` and `updated_at` on every entity. These are essential for audit trails and graph synchronization.

## Entities

### Contact
The fundamental unit — a person in Pursuit's network.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `contact-{slug}` e.g., `contact-sarah-chen` |
| first_name | string | yes | |
| last_name | string | yes | |
| email | string | no | May be missing from LinkedIn exports |
| phone | string | no | |
| organization | string | no | Current employer / primary affiliation |
| title | string | no | LinkedIn headline or known title |
| linkedin_url | string | no | |
| connection_date | date | no | When Nick connected on LinkedIn |
| source | enum | yes | `linkedin-import`, `salesforce-import`, `manual`, `prospect-list` |
| wealth_tier | enum | no | `tier-1`, `tier-2`, `tier-3`, `tier-4`, `unknown` |
| composite_score | number | no | 0-100, populated by network search |
| notes | text | no | Free text, supports wikilinks in future graph |
| tags | string[] | no | Flexible categorization |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### Account (Organization)
A company, foundation, government entity, or other organization.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `acct-{slug}` e.g., `acct-goldman-sachs-foundation` |
| name | string | yes | |
| type | enum | yes | `corporation`, `foundation`, `government`, `individual`, `other` |
| industry | string | no | |
| website | string | no | |
| hq_location | string | no | |
| annual_revenue_range | string | no | |
| philanthropic_interests | string[] | no | |
| notes | text | no | |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### Opportunity
An active fundraising opportunity (nonprofit or PBC).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `opp-2026-{nnn}` e.g., `opp-2026-003` |
| name | string | yes | Descriptive name for the opportunity |
| account_id | string | yes | References Account |
| primary_contact_id | string | yes | References Contact |
| amount_estimated | number | no | In USD |
| amount_confirmed | number | no | In USD, set when Closed Won |
| stage | enum | yes | `identified`, `qualified`, `proposal-sent`, `in-negotiation`, `verbal-commit`, `closed-won`, `closed-lost` |
| revenue_stream | enum | yes | `nonprofit`, `pbc` |
| service_type | enum | no | `donation`, `consulting`, `apprenticeship`, `fde`, `other` |
| expected_close_date | date | no | |
| assigned_to | string | yes | Team member name or ID |
| probability | number | no | 0-100, defaults from stage |
| notes | text | no | |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

**Stage probability defaults:**
| Stage | Probability |
|-------|------------|
| identified | 10% |
| qualified | 25% |
| proposal-sent | 50% |
| in-negotiation | 75% |
| verbal-commit | 90% |
| closed-won | 100% |
| closed-lost | 0% |

### Lead
A prospect not yet qualified into the pipeline.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `lead-2026-{nnn}` |
| contact_id | string | yes | References Contact |
| source | enum | yes | `inbound-referral`, `event`, `cold-outreach`, `network-search-hit`, `other` |
| status | enum | yes | `new`, `contacted`, `qualifying`, `converted`, `archived` |
| assigned_to | string | no | |
| score | number | no | Lead score (Phase 2), 0-100 |
| notes | text | no | |
| created_at | datetime | yes | |
| converted_at | datetime | no | Set when converted to opportunity |
| opportunity_id | string | no | References Opportunity, set on conversion |

### Task
A deadline or action item linked to an opportunity or lead.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `task-2026-{nnn}` |
| title | string | yes | |
| description | text | no | |
| type | enum | yes | `follow-up`, `proposal-draft`, `meeting`, `deliverable`, `internal-review`, `stewardship` |
| due_date | date | yes | |
| completed_at | datetime | no | |
| priority | enum | yes | `high`, `medium`, `low` |
| assigned_to | string | yes | |
| opportunity_id | string | no | References Opportunity |
| lead_id | string | no | References Lead |
| status | enum | yes | `pending`, `in-progress`, `completed`, `cancelled` |
| created_at | datetime | yes | |
| updated_at | datetime | yes | |

### NetworkMatch
A match between a LinkedIn contact and a prospect list record.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `match-{linkedin-slug}-{source}` |
| linkedin_contact_id | string | yes | References Contact (LinkedIn) |
| prospect_list_source | string | yes | Which list this match came from |
| match_confidence | number | yes | 0-100, from Fuse.js |
| wealth_tier_matched | enum | no | From prospect list |
| composite_score | number | yes | 0-100, weighted algorithm |
| outreach_priority | enum | yes | `hot` (>=75), `warm` (50-74), `worth-exploring` (<50) |
| reviewed | boolean | yes | Has a human reviewed this match? Default: false |
| added_to_leads | boolean | yes | Has this been pushed to leads? Default: false |
| lead_id | string | no | References Lead, if added |
| created_at | datetime | yes | |

### Activity
A logged interaction (call, email, meeting, note).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | yes | Pattern: `act-2026-{nnn}` |
| type | enum | yes | `call`, `email`, `meeting`, `note` |
| date | datetime | yes | |
| contact_id | string | no | References Contact |
| opportunity_id | string | no | References Opportunity |
| lead_id | string | no | References Lead |
| summary | text | yes | |
| logged_by | string | yes | |
| source_type | enum | no | `manual`, `fireflies-transcript`, `brain-dump`. For future [[transcript-pipeline]] |
| source_quality | enum | no | `high`, `medium`, `low`. For future [[transcript-pipeline]] |
| created_at | datetime | yes | |

## Relationships

```
Contact ↔ Account         many-to-many (via ContactAccount junction)
Opportunity → Account     many-to-one (account_id)
Opportunity → Contact     many-to-one (primary_contact_id)
Opportunity ↔ Task        one-to-many (task.opportunity_id)
Opportunity ↔ Activity    one-to-many (activity.opportunity_id)
Lead → Contact            one-to-one (lead.contact_id)
Lead → Opportunity        one-to-one on conversion (lead.opportunity_id)
Lead ↔ Task               one-to-many (task.lead_id)
NetworkMatch → Contact    many-to-one (match.linkedin_contact_id)
NetworkMatch → Lead       one-to-one if added (match.lead_id)
Activity → Contact        many-to-one (activity.contact_id)
```

## IndexedDB implementation notes (Dexie.js)

```typescript
// Dexie schema — version 1
db.version(1).stores({
  contacts: 'id, last_name, organization, source, wealth_tier, created_at',
  accounts: 'id, name, type, industry',
  opportunities: 'id, account_id, primary_contact_id, stage, revenue_stream, assigned_to, expected_close_date',
  leads: 'id, contact_id, source, status, assigned_to, created_at',
  tasks: 'id, due_date, priority, assigned_to, opportunity_id, lead_id, status',
  networkMatches: 'id, linkedin_contact_id, composite_score, outreach_priority, reviewed, added_to_leads',
  activities: 'id, type, date, contact_id, opportunity_id, lead_id',
  contactAccounts: '[contact_id+account_id], contact_id, account_id'
});
```

## Migration path to PostgreSQL

The IndexedDB schema is designed to map directly to PostgreSQL tables. When migrating:
- String IDs become primary keys (not auto-increment integers — preserves graph compatibility)
- Enum fields become PostgreSQL enums or constrained varchar
- The ContactAccount junction table becomes a proper many-to-many with foreign keys
- Add indexes on all foreign key columns and commonly filtered fields
- Add `UNIQUE` constraints where appropriate (e.g., one lead per contact)

See [[knowledge-graph-compat]] for how this maps to the markdown file convention.
