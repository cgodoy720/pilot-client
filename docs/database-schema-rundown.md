# Database Schema Rundown

> Created: 2026-03-25 | Meeting with senior devs
> Production DB: `segundo-db` on GCP (34.57.101.141:5432), role `bedrock_user`, schema `bedrock`

## Production Database Model

- **Database**: `segundo-db` (shared Pursuit platform DB, 136+ tables in `public`)
- **Schema**: `bedrock` (owned by `postgres`, `bedrock_user` has CREATE + USAGE)
- **Role**: `bedrock_user` — read-only on `public.*`, write on `bedrock.*`
- **Convention**: All SQL is schema-qualified (`bedrock.project`, `bedrock.pebble_profiles`)

---

## 1. BEDROCK — Salesforce is the backend, few exceptions

Bedrock reads/writes Salesforce for CRM data. The **exceptions** live in our `bedrock` schema:

### `bedrock.permission_profile`
Roles with JSONB permission flags. Salesforce has no equivalent.
```
id              UUID PK
name            TEXT UNIQUE        -- 'Admin', 'Fundraiser', 'Manager'
description     TEXT
is_default      BOOLEAN
permissions     JSONB              -- 26 boolean keys (view/edit/create per feature)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```
Seeded with 3 profiles on init.

### `bedrock.app_user`
Local user directory linking Google login to permissions + optional SF user.
```
id              UUID PK
sf_user_id      TEXT UNIQUE NULL   -- links to SF User record (optional)
email           TEXT UNIQUE        -- from Google OAuth
name            TEXT
profile_id      UUID FK -> permission_profile
is_active       BOOLEAN
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```
Auto-provisioned on first Google OAuth login.

### `bedrock.opportunity_lock`
Pessimistic locking when someone opens an Opportunity edit dialog.
```
sf_opportunity_id   TEXT PK        -- Salesforce Opportunity ID
locked_by           TEXT           -- user email
locked_at           TIMESTAMPTZ
```

### What Bedrock reads FROM Salesforce (no local tables needed)
- **Opportunities** -- Id, Name, Amount, StageName, CloseDate, Payment_Terms__c, Invoice_Status__c, etc.
- **Accounts** -- Id, Name, Billing fields, Intacct_Customer_ID__c
- **Contacts** -- via Pebble's CRM bridge
- **Tasks** -- fetched on demand via SF API
- **npe01__OppPayment__c** -- NPSP payment records
- **OpportunityFieldHistory** -- stage change tracking

### What Bedrock writes TO Salesforce (no local tables needed)
- **Opportunity fields**: Invoice_Status__c, Intacct_Invoice_ID__c, Invoice_Date__c, Payment_Status__c, Payment_Date__c, Payment_Amount__c
- **Account fields**: Intacct_Customer_ID__c, Total_Outstanding__c, Credit_Limit__c, Last_Financial_Update__c
- **Invoice__c** (custom object): created when invoicing an opportunity
- **npe01__OppPayment__c**: links payment to Invoice__c

---

## 2. PROJECT TRACKING — Local-first with SF bridges

Projects/tasks/milestones are local (PostgreSQL), with bridge tables linking SF objects.

### `bedrock.project`
```
id              UUID PK
name            TEXT
description     TEXT
opportunity_id  TEXT NULL          -- optional link to SF Opportunity
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `bedrock.workstream`
```
id              UUID PK
project_id      UUID FK -> project (CASCADE)
name            TEXT
description     TEXT
sort_order      INT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `bedrock.milestone`
```
id              UUID PK
workstream_id   UUID FK -> workstream (CASCADE)
title           TEXT
status          TEXT CHECK ('On Track'|'At Risk'|'Needs Attention'|'Completed')
priority        TEXT CHECK ('Now'|'Later'|'On-going')
owner           TEXT               -- free text, not FK'd to app_user
description     TEXT
source_links    TEXT[]
sort_order      INT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `bedrock.project_task`
```
id              UUID PK
milestone_id    UUID FK -> milestone (CASCADE)
title           TEXT
status          TEXT CHECK ('Not Started'|'In Progress'|'Completed'|'Blocked'|'On Hold')
owner           TEXT               -- free text
deadline        DATE
start_date      DATE               -- for Gantt chart
description     TEXT
updates         TEXT
links           TEXT[]
depends_on      UUID[]             -- references other project_task.id
sort_order      INT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

### `bedrock.sf_task_dependency`
SF Tasks don't support native dependencies. Stored locally.
```
id              UUID PK
task_id         TEXT               -- Salesforce Task ID (00T...)
depends_on_id   TEXT               -- Salesforce Task ID
external_source TEXT DEFAULT 'salesforce'
created_at      TIMESTAMPTZ
UNIQUE (task_id, depends_on_id)
```

### `bedrock.sf_task_project`
Bridge: SF Tasks appear inside local project views.
```
id              UUID PK
sf_task_id      TEXT UNIQUE        -- Salesforce Task ID
external_source TEXT DEFAULT 'salesforce'
project_id      UUID FK -> project (CASCADE)
milestone_id    UUID FK -> milestone (SET NULL)
sort_order      INT
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

---

## 3. PEBBLE — New tables (fresh start, `pebble_` prefix)

All tables in `bedrock` schema with `pebble_` prefix. Created fresh (no SQLite data migration).

### `bedrock.pebble_profiles` -- Final research output per contact
```
contact_id      TEXT PK            -- Salesforce Contact ID
profile_json    TEXT               -- JSON: claims[], summary, confidence_score
cost_usd        NUMERIC
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_research_sessions` -- One row per completed research run
```
id              UUID PK DEFAULT uuid_generate_v4()
contact_id      TEXT               -- indexed
profile_json    TEXT
cost_usd        NUMERIC
prospect_name   TEXT
prospect_org    TEXT
status          TEXT DEFAULT 'completed'
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_feedback` -- Claim accuracy tracking
```
id              UUID PK DEFAULT uuid_generate_v4()
claim_id        TEXT
correct         BOOLEAN
text            TEXT NULL
contact_id      TEXT NULL
user_id         TEXT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_harness_log` -- Agent execution metrics
```
id              UUID PK DEFAULT uuid_generate_v4()
agent_name      TEXT
outcome         TEXT               -- success|failure|escalated
cost_usd        NUMERIC
tokens_input    INTEGER
tokens_output   INTEGER
attempts        INTEGER
elapsed_seconds NUMERIC
error           TEXT NULL
prospect_id     TEXT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_source_scores` -- Stigmergy pheromone trail
```
id              UUID PK DEFAULT uuid_generate_v4()
source_name     TEXT
richness_score  NUMERIC
prospect_id     TEXT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_api_cache` -- Response deduplication with TTL
```
id              UUID PK DEFAULT uuid_generate_v4()
source          TEXT
lookup_key      TEXT
response_json   TEXT
created_at      TIMESTAMPTZ DEFAULT now()
expires_at      TIMESTAMPTZ NULL
UNIQUE (source, lookup_key)
```

### `bedrock.pebble_chat_conversations` -- Ask Pebble sessions
```
id              UUID PK
user_email      TEXT
title           TEXT NULL
total_cost_usd  NUMERIC DEFAULT 0.0
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_chat_messages` -- Chat message history
```
id              UUID PK
conversation_id UUID FK -> pebble_chat_conversations
role            TEXT               -- 'user' or 'assistant'
content         TEXT
tier            TEXT NULL          -- T0, T0.5, T1, T2, T3
cost_usd        NUMERIC DEFAULT 0.0
metadata_json   TEXT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_research_batches` -- Bulk research jobs
```
id              UUID PK
user_email      TEXT
total_prospects INTEGER DEFAULT 0
completed_prospects INTEGER DEFAULT 0
target_tier     TEXT DEFAULT 'T1'
status          TEXT DEFAULT 'pending'
total_cost_usd  NUMERIC DEFAULT 0.0
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_batch_prospects` -- Individual prospects in a batch
```
id              UUID PK
batch_id        UUID FK -> pebble_research_batches
prospect_name   TEXT
prospect_org    TEXT
current_tier    TEXT DEFAULT 'pending'
identity_confidence TEXT DEFAULT 'none'
crm_status      TEXT DEFAULT 'unknown'
result_json     TEXT NULL
cost_usd        NUMERIC DEFAULT 0.0
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_conflict_log` -- NEW: Persist detected conflicts
```
id              UUID PK DEFAULT uuid_generate_v4()
session_id      UUID FK -> pebble_research_sessions
contact_id      TEXT
conflict_type   TEXT               -- 'role'|'financial'|'temporal'
claim_a         TEXT
claim_b         TEXT
description     TEXT
resolution      TEXT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### `bedrock.pebble_scratchpad` -- NEW: Persist intermediate research state
```
id              UUID PK DEFAULT uuid_generate_v4()
session_id      UUID FK -> pebble_research_sessions
contact_id      TEXT
scratchpad_json TEXT               -- full ResearchScratchpad + ProspectResearchContext
status          TEXT               -- 'active'|'completed'|'failed'|'timeout'
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

---

## Data Flow: Pebble <-> Salesforce

| Data | Destination | Method | Status |
|---|---|---|---|
| New Account | Salesforce | CRM bridge POST | Working |
| New Contact | Salesforce | CRM bridge POST | Working |
| New Opportunity | Salesforce | CRM bridge POST | Working |
| Update existing Contact/Account fields | Salesforce | CRM bridge PATCH | NOT YET BUILT (Sprint 11) |
| Full research profile | Our DB (pebble_profiles) | Direct insert | Working |
| Session history | Our DB (pebble_research_sessions) | Direct insert | Working |

---

## Decisions Made (2026-03-25)

- **Schema-qualify all SQL** -- Every table reference uses `bedrock.table_name`. 93 existing SQL statements across 7 files need prefixing (Sprint 9).
- **Shared DB, `pebble_` prefix** -- e.g., `bedrock.pebble_profiles`
- **Fresh start** -- No SQLite data migration. Create empty PostgreSQL tables.
- **Persist conflict logs + scratchpads** -- For audit trail, debugging, and multi-worker scaling.
- **Pebble should UPDATE existing SF records** -- Blocked on senior devs defining target SF fields.

## Sprint Roadmap

See `tasks/sprint9-*.md` through `tasks/sprint13-*.md` for detailed sprint plans.

```
TRACK A: Database Infrastructure (sequential)
  Sprint 9:  Schema Qualification (bedrock. prefix)
  Sprint 10: Pebble PostgreSQL + Async Migration
  Sprint 11: Pebble Persistence + CRM Bridge

TRACK B: Production Guardrails (parallel with Track A)
  Sprint 12: Pebble Access Control
  Sprint 13: SF Required Fields Audit + Pebble UX Polish
```
