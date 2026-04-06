# Bedrock Database Schema Atlas

> Version: 1.0 | Date: 2026-04-06 | Author: JP
>
> **Audience:** Jac (Senior PM) + engineering team
>
> **Purpose:** Complete map of every table in the `bedrock` schema, how objects relate to each other,
> how Bedrock coexists with the learning platform's 136+ tables in `public.*` on segundo-db,
> and open architecture decisions for the upcoming review session.
>
> **Source of truth:** `financial_forecasting/db/init.sql` (951 lines, all DDL)
>
> **Companion docs:**
> - `docs/database-schema-rundown.md` — operational reference (how to query, connection model)
> - `product/crm-architecture/entity-map.md` — CRM entity definitions
> - `product/crm-architecture/canonical-definitions.md` — enums, field names, ID patterns
> - `docs/architecture-decisions.md` — payment/invoice architecture decisions

---

## Table of Contents

1. [Schema Isolation Strategy](#1-schema-isolation-strategy)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Domain 1: Project Management](#3-domain-1-project-management)
4. [Domain 2: CRM Bridge Tables](#4-domain-2-crm-bridge-tables)
5. [Domain 3: Permissions & Users](#5-domain-3-permissions--users)
6. [Domain 4: Activities](#6-domain-4-activities)
7. [Domain 5: Payments & Invoices](#7-domain-5-payments--invoices)
8. [Domain 6: Pebble Intelligence Pipeline](#8-domain-6-pebble-intelligence-pipeline)
9. [Domain 7: Pebble Debugging & Schema Governance](#9-domain-7-pebble-debugging--schema-governance)
10. [Cross-Domain Integration Map](#10-cross-domain-integration-map)
11. [Namespace Collision Analysis](#11-namespace-collision-analysis)
12. [Design Pattern: Conflict & Resolution Logs](#12-design-pattern-conflict--resolution-logs)
13. [Open Questions for Review](#13-open-questions-for-review)
14. [Appendix: All Tables Quick Reference](#14-appendix-all-tables-quick-reference)

---

## 1. Schema Isolation Strategy

### The Problem

Bedrock lives inside **segundo-db**, the shared Pursuit platform database on GCP (34.57.101.141:5432). The learning platform already has **136+ tables in the `public` schema** — users, admissions, curriculum, Pathfinder/Sputnik career tools, lead management, and more.

### The Solution

Every Bedrock table lives in a **dedicated `bedrock` schema**. This means:

```
segundo-db
  ├── public.*           ← Learning platform (136+ tables)
  │     users, lead, companies, job_applications, ...
  │
  └── bedrock.*          ← Fundraising CRM + Pebble (31 tables)
        project, activity, pebble_profiles, ...
```

**Why this works:**

| Concern | How We Handle It |
|---------|-----------------|
| **Name collisions** | `bedrock.activity` and `public.activity` (if it existed) are completely separate objects. PostgreSQL schema qualification prevents any conflict. |
| **Access control** | `bedrock_user` role has `CREATE + USAGE` on `bedrock` schema but only `SELECT` on `public` schema. We can read the learning platform's data but cannot accidentally modify it. |
| **Backups** | Same database = same backup schedule. No separate backup system needed. |
| **Future integration** | Cross-schema JOINs work natively: `SELECT * FROM bedrock.activity a JOIN public.users u ON a.logged_by = u.email` |

**Naming conventions within bedrock:**
- **Core tables:** Plain names (`project`, `activity`, `app_user`)
- **Pebble tables:** `pebble_` prefix (`pebble_profiles`, `pebble_research_sessions`)
- **SF bridge tables:** `sf_` prefix (`sf_task_dependency`, `sf_field_requirements`)
- **Prospect mapping:** `prospect_sf_` prefix (`prospect_sf_contact`, `prospect_sf_account`)

All SQL in the codebase is **schema-qualified** (e.g., `bedrock.project`, never just `project`), enforced by code review.

---

## 2. High-Level Architecture

Bedrock's data lives across three systems. The `bedrock` schema stores only what Salesforce and Sage cannot.

```
┌──────────────────────────────────────────────────────────────────┐
│                        SALESFORCE (SoT)                          │
│                                                                  │
│  ┌────────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Opportunity │  │  Account  │  │ Contact  │  │   Task/Event │ │
│  │ (pipeline)  │  │  (orgs)   │  │ (people) │  │ (CRM tasks)  │ │
│  └──────┬─────┘  └─────┬─────┘  └────┬─────┘  └──────┬───────┘ │
│         │              │             │               │          │
│  ┌──────┴──────┐  ┌────┴────────┐                               │
│  │OppPayment   │  │ Invoice__c  │                               │
│  │(NPSP pmts)  │  │(SF↔Sage)    │                               │
│  └─────────────┘  └─────────────┘                               │
└──────────────────────────┬───────────────────────────────────────┘
                           │ API reads/writes
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              BEDROCK SCHEMA (segundo-db, 31 tables)              │
│                                                                  │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ Project Mgmt    │  │ Auth & Perms     │  │ Activities     │  │
│  │ (8 tables)      │  │ (4 tables)       │  │ (1 table)      │  │
│  │ project         │  │ permission_      │  │ activity       │  │
│  │ workstream      │  │   profile        │  │ (30+ cols,     │  │
│  │ milestone       │  │ app_user         │  │  FTS, soft     │  │
│  │ project_task    │  │ opportunity_lock │  │  delete)       │  │
│  │ project_        │  │ permission_      │  └────────────────┘  │
│  │   contributor   │  │   unlock_request │                      │
│  │ project_        │  └──────────────────┘                      │
│  │   opportunity   │                                             │
│  │ sf_task_        │  ┌──────────────────┐                      │
│  │   dependency    │  │ Schema Gov.      │                      │
│  │ sf_task_project │  │ (2 tables)       │                      │
│  └─────────────────┘  │ sf_field_        │                      │
│                       │   requirements   │                      │
│  ┌─────────────────┐  │ sf_schema_       │                      │
│  │ Pebble Research │  │   drift_log      │                      │
│  │ (13 tables)     │  └──────────────────┘                      │
│  │ pebble_*        │                                             │
│  │ prospect_sf_*   │  ┌──────────────────┐                      │
│  │ (3 CRM maps)    │  │ Sage Integration │                      │
│  └─────────────────┘  │ (no local tables │                      │
│                       │  — reads SF +    │                      │
│                       │  Sage APIs)      │                      │
│                       └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │ Cross-schema reads (future)
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│              PUBLIC SCHEMA (learning platform, 136+ tables)      │
│                                                                  │
│  users, applicant, lead, companies, job_applications,            │
│  interviews, networking_activities, organizations, ...           │
└──────────────────────────────────────────────────────────────────┘
```

**Data authority model:**

| Data | Source of Truth | Bedrock Role |
|------|----------------|-------------|
| Opportunities, Accounts, Contacts | Salesforce | Read/write via API |
| Payments (OppPayment) | Salesforce (NPSP) | Read/write via API |
| Invoices | Salesforce Invoice__c ↔ Sage Intacct | Create Invoice__c, read Sage |
| Projects, Workstreams, Milestones, Tasks | **Bedrock** (local) | Full CRUD |
| Activities | **Bedrock** (local mirror + extensions) | Mirror SF + local entries |
| Permissions, Users | **Bedrock** (local) | Full CRUD |
| Prospect Research | **Bedrock/Pebble** (local) | Full CRUD |
| Builder career data | Learning platform (`public.*`) | Read-only (future) |

---

## 3. Domain 1: Project Management

### Hierarchy

```
bedrock.project
  │
  ├── owner_email (single owner)
  ├── bedrock.project_contributor (many editors)
  ├── bedrock.project_opportunity (many CRM opportunities)
  │
  └── bedrock.workstream
        │
        └── bedrock.milestone
              │
              └── bedrock.project_task
                    │
                    ├── depends_on (UUID[] — self-referential)
                    └── ← bedrock.activity.project_task_id
```

### Entity Relationship Diagram

```
┌──────────────────────────────────┐
│         bedrock.project          │
├──────────────────────────────────┤
│ id            UUID PK            │
│ name          TEXT NOT NULL       │
│ description   TEXT DEFAULT ''     │
│ opportunity_id TEXT (legacy)      │
│ owner_email   TEXT (M19)         │
│ created_by    TEXT (M19)         │
│ deleted_at    TIMESTAMPTZ (M18)  │
│ deleted_by    TEXT                │
│ created_at    TIMESTAMPTZ        │
│ updated_at    TIMESTAMPTZ        │
└─────────┬───────────┬────────────┘
          │           │
     CASCADE     CASCADE
          │           │
          ▼           ▼
┌─────────────────┐  ┌────────────────────┐  ┌────────────────────────┐
│ project_        │  │ project_           │  │ project_               │
│ contributor     │  │ opportunity        │  │                        │
├─────────────────┤  ├────────────────────┤  │    (continues below)   │
│ id         UUID │  │ id         UUID    │  └────────────────────────┘
│ project_id UUID │  │ project_id UUID    │
│ user_email TEXT  │  │ opportunity_id TEXT│
│ role       TEXT  │  │ role       TEXT    │
│ added_by   TEXT  │  │ created_at        │
│ added_at        │  │ UNIQUE(proj, opp)  │
│ UNIQUE(proj,    │  └────────────────────┘
│   user_email)   │
└─────────────────┘

┌──────────────────────────────────┐
│        bedrock.workstream        │
├──────────────────────────────────┤
│ id            UUID PK            │
│ project_id    UUID FK → project  │ ← CASCADE
│ name          TEXT NOT NULL       │
│ description   TEXT DEFAULT ''     │
│ sort_order    INT DEFAULT 0      │
│ deleted_at / deleted_by          │
│ created_at / updated_at          │
└─────────────┬────────────────────┘
              │ CASCADE
              ▼
┌──────────────────────────────────┐
│        bedrock.milestone         │
├──────────────────────────────────┤
│ id            UUID PK            │
│ workstream_id UUID FK → ws       │ ← CASCADE
│ title         TEXT NOT NULL       │
│ status        TEXT (On Track |   │
│               At Risk | Needs    │
│               Attention |        │
│               Completed)         │
│ priority      TEXT (Now | Later  │
│               | On-going)        │
│ owner         TEXT (free text)   │
│ description   TEXT               │
│ source_links  TEXT[]             │
│ sort_order    INT                │
│ deleted_at / deleted_by          │
│ created_at / updated_at          │
└─────────────┬────────────────────┘
              │ CASCADE
              ▼
┌──────────────────────────────────┐
│       bedrock.project_task       │
├──────────────────────────────────┤
│ id            UUID PK            │
│ milestone_id  UUID FK → ms       │ ← CASCADE
│ title         TEXT NOT NULL       │
│ status        TEXT (Not Started | │
│               In Progress |       │
│               Completed |         │
│               Blocked | On Hold)  │
│ owner         TEXT (free text)   │
│ deadline      DATE               │
│ start_date    DATE (Gantt, M18)  │
│ description   TEXT               │
│ updates       TEXT               │
│ links         TEXT[]             │
│ depends_on    UUID[] (self-ref)  │
│ sort_order    INT                │
│ deleted_at / deleted_by          │
│ created_at / updated_at          │
└──────────────────────────────────┘
```

### Key Design Decisions

- **Soft delete (M18):** All four hierarchy tables have `deleted_at` + `deleted_by`. Partial indexes (`WHERE deleted_at IS NULL`) keep queries efficient. Restore logic uses cascade timestamp to only restore children deleted at the same time.
- **60-day retention:** Hard purge (`DELETE`) only allowed after 60 days of soft deletion. Admin-only.
- **Ownership (M19):** `owner_email` on project is the single owner. Contributors table adds editors. Owner transfer promotes old owner to editor atomically.
- **Task dependencies:** `depends_on UUID[]` on `project_task` — self-referential array, no FK constraint (by design — allows flexible dependency graphs).
- **Updated-at triggers:** All four tables use `bedrock.set_updated_at()` trigger function.

---

## 4. Domain 2: CRM Bridge Tables

These tables store relationships that Salesforce cannot natively represent.

### `bedrock.sf_task_dependency`

Salesforce Tasks have no native dependency support. This table stores dependency edges locally.

```
┌──────────────────────────────────┐
│    bedrock.sf_task_dependency    │
├──────────────────────────────────┤
│ id              UUID PK          │
│ task_id         TEXT NOT NULL     │ ← SF Task ID (00T...)
│ depends_on_id   TEXT NOT NULL     │ ← SF Task ID
│ external_source TEXT 'salesforce' │
│ created_at      TIMESTAMPTZ      │
│ UNIQUE(task_id, depends_on_id)   │
└──────────────────────────────────┘
```

**Migration path:** When moving off Salesforce, convert these edges to `project_task.depends_on` UUID arrays.

### `bedrock.sf_task_project`

The critical coupling point between external CRM and local project management. SF tasks appear inside local project views.

```
┌──────────────────────────────────┐
│     bedrock.sf_task_project      │
├──────────────────────────────────┤
│ id              UUID PK          │
│ sf_task_id      TEXT NOT NULL     │ ← SF Task ID (UNIQUE)
│ external_source TEXT 'salesforce' │
│ project_id      UUID FK → project│ ← CASCADE
│ milestone_id    UUID FK → ms     │ ← SET NULL
│ sort_order      INT DEFAULT 0    │
│ created_at / updated_at          │
└──────────────────────────────────┘
```

**Design note:** All task data lives in Salesforce — this table only stores the relationship. `milestone_id` uses `SET NULL` (not CASCADE) so the bridge survives milestone deletion.

---

## 5. Domain 3: Permissions & Users

### RBAC Model

```
┌─────────────────────────────────┐         ┌────────────────────────────────┐
│  bedrock.permission_profile     │         │       bedrock.app_user         │
├─────────────────────────────────┤         ├────────────────────────────────┤
│ id          UUID PK             │◄────────│ profile_id UUID FK (SET NULL)  │
│ name        TEXT UNIQUE         │         │ id          UUID PK            │
│ description TEXT                │         │ sf_user_id  TEXT UNIQUE        │
│ is_default  BOOLEAN             │         │ email       TEXT UNIQUE        │
│ permissions JSONB (32 keys)     │         │ name        TEXT               │
│ created_at / updated_at         │         │ is_active   BOOLEAN            │
└────────────────┬────────────────┘         │ created_at / updated_at        │
                 │                          └────────────────────────────────┘
                 │ CASCADE
                 ▼
┌─────────────────────────────────┐         ┌────────────────────────────────┐
│ permission_unlock_request       │         │   bedrock.opportunity_lock     │
├─────────────────────────────────┤         ├────────────────────────────────┤
│ id              UUID PK         │         │ sf_opportunity_id TEXT PK      │
│ requester_email TEXT             │         │ locked_by         TEXT         │
│ profile_id      UUID FK         │         │ locked_at         TIMESTAMPTZ  │
│ permission_key  TEXT             │         └────────────────────────────────┘
│ status (pending|approved|       │
│         rejected)               │
│ admin_note      TEXT             │
│ created_at / resolved_at        │
│ resolved_by     TEXT             │
└─────────────────────────────────┘
```

### Permission Profiles (4 seeded)

| Profile | Default? | Key Capabilities |
|---------|----------|-----------------|
| **Admin** | No | All 32 permissions enabled |
| **Relationship Manager** | Yes | Edit own opps/tasks, create accounts/contacts, view dashboards |
| **Executive** | No | View pipeline, view projects (read-only), edit permission profiles |
| **Project Manager** | No | Full project CRUD, CRM read-only |

### Permission Keys (32 total)

| Category | Keys |
|----------|------|
| **Opportunities** (7) | `view_opportunities`, `edit_own_opportunities`, `edit_all_opportunities`, `create_opportunities`, `bulk_update_opportunities`, `lock_own_opportunities`, `reassign_opportunities` |
| **Tasks** (4) | `view_tasks`, `edit_own_tasks`, `edit_all_tasks`, `create_tasks` |
| **Accounts & Contacts** (4) | `edit_accounts`, `create_accounts`, `edit_contacts`, `create_contacts` |
| **Payments & Finance** (7) | `edit_payments`, `create_payments`, `view_sage_invoices_payments`, `create_sage_invoices`, `match_invoices`, `manage_payment_schedules`, `generate_financial_reports` |
| **Projects** (2) | `view_projects`, `edit_projects` |
| **Dashboards** (2) | `view_revenue_dashboard`, `view_cashflow_forecasts` |
| **Pebble AI** (3) | `use_pebble_chat`, `use_pebble_research`, `pebble_crm_write` |
| **System Admin** (3) | `trigger_data_sync`, `manage_users_roles`, `edit_permission_profiles` |

### Key Behaviors

- **Auto-provisioning:** First user gets Admin. Subsequent users get the default profile (Relationship Manager).
- **System keys:** `manage_users_roles`, `edit_permission_profiles`, `trigger_data_sync`, `pebble_crm_write` require admin approval via unlock request workflow even when a profile editor tries to toggle them.
- **Opportunity locking:** Pessimistic lock when a user opens an edit dialog. Only the opportunity owner (verified against SF `OwnerId`) can lock.

---

## 6. Domain 4: Activities

### `bedrock.activity` — The Richest Table (30+ columns)

Activities are the local mirror of SF Tasks/Events plus manual entries from the Chrome extension, Gmail sync, and calendar sync.

```
┌──────────────────────────────────────────────────────────────────┐
│                      bedrock.activity                            │
├──────────────────────────────────────────────────────────────────┤
│ IDENTITY                                                         │
│   id                  UUID PK                                    │
│   sf_id               TEXT UNIQUE (mirror sync key)              │
│   sf_type             TEXT ('Task' | 'Event')                    │
│                                                                  │
│ CORE                                                             │
│   type                TEXT ('call'|'email'|'meeting'|'note'|     │
│                              'slack-message'|'calendar-event')   │
│   subject             TEXT NOT NULL                               │
│   description         TEXT                                       │
│   description_html    TEXT                                       │
│   activity_date       TIMESTAMPTZ NOT NULL                       │
│                                                                  │
│ ASSOCIATION (Opportunity-first model)                            │
│   opportunity_id      TEXT (SF Opp ID — no FK, queried via API)  │
│   account_id          TEXT (SF Account ID)                       │
│   contact_ids         TEXT[] (SF Contact IDs — GIN indexed)      │
│   project_task_id     UUID FK → project_task (SET NULL)          │
│   sf_task_id          TEXT                                       │
│                                                                  │
│ SOURCE TRACKING                                                  │
│   source              TEXT ('salesforce'|'extension'|'manual'|   │
│                              'gmail-sync'|'calendar-sync')       │
│   source_ref          TEXT                                       │
│   source_thread_id    TEXT (email thread grouping)               │
│                                                                  │
│ EMAIL-SPECIFIC                                                   │
│   email_from          TEXT                                       │
│   email_to            TEXT[]                                     │
│   email_cc            TEXT[]                                     │
│   email_snippet       TEXT                                       │
│                                                                  │
│ MEETING-SPECIFIC                                                 │
│   meeting_duration_minutes  INTEGER                              │
│   meeting_attendees         JSONB                                │
│   meeting_location          TEXT                                 │
│                                                                  │
│ ATTACHMENTS                                                      │
│   attachments         JSONB DEFAULT '[]' (GCS URLs, M15)         │
│                                                                  │
│ OWNERSHIP                                                        │
│   logged_by           TEXT                                       │
│   owner_id            TEXT                                       │
│                                                                  │
│ SYNC METADATA                                                    │
│   sf_last_modified    TIMESTAMPTZ (sync watermark)               │
│   synced_at           TIMESTAMPTZ                                │
│   sf_sync_status      TEXT ('synced'|'pending'|'failed')         │
│                                                                  │
│ SEARCH                                                           │
│   search_vector       TSVECTOR (A: subject, B: snippet,         │
│                                 C: description)                  │
│                                                                  │
│ LIFECYCLE                                                        │
│   deleted_at          TIMESTAMPTZ (prevents sync resurrection)   │
│   created_at          TIMESTAMPTZ                                │
│   updated_at          TIMESTAMPTZ                                │
└──────────────────────────────────────────────────────────────────┘
```

### Activity Data Flow

```
Sources:                      Association Model:
                              (Opportunity-first)
  Salesforce ──────┐
    Tasks/Events   │          ┌───────────────┐
                   │          │  Opportunity   │ ← primary association
  Chrome ext. ─────┤──────►   │  (SF ID, TEXT) │
    (manual log)   │          ├───────────────┤
                   │          │  Account       │ ← derived from Opp
  Gmail sync ──────┤          │  (SF ID, TEXT) │
                   │          ├───────────────┤
  Calendar sync ───┘          │  Contact(s)   │ ← many, GIN indexed
                              │  (TEXT[])     │
                              ├───────────────┤
                              │  Project Task │ ← optional local FK
                              │  (UUID, SET   │
                              │   NULL)       │
                              └───────────────┘
```

### Indexes (11 total)

| Index | Type | Purpose |
|-------|------|---------|
| `idx_activity_opportunity` | btree | Filter by SF Opportunity |
| `idx_activity_account` | btree | Filter by SF Account |
| `idx_activity_contact` | GIN | Array containment search on contact_ids |
| `idx_activity_date` | btree DESC | Reverse chronological listing |
| `idx_activity_type` | btree | Filter by activity type |
| `idx_activity_source` | btree | Filter by source |
| `idx_activity_sf_id` | btree | Sync dedup |
| `idx_activity_search` | GIN | Full-text search on tsvector |
| `idx_activity_thread` | btree | Email thread grouping |
| `idx_activity_not_deleted` | partial | Soft delete filtering |
| `idx_activity_project_task` | btree | Join to project tasks |

### Full-Text Search

Weighted search across three fields:
- **A weight** (highest): `subject`
- **B weight**: `email_snippet`
- **C weight** (lowest): `description`

Trigger `trg_activity_search_vector` rebuilds the vector on every INSERT or UPDATE. Queries use `plainto_tsquery` for injection safety and `ts_rank` for relevance ordering.

---

## 7. Domain 5: Payments & Invoices

Payments and invoices have **no local tables in bedrock** — they live entirely in Salesforce and Sage. Bedrock reads and writes them via API.

### Data Flow

```
┌────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│    Salesforce       │     │    Bedrock        │     │    Sage     │
│                     │     │    (API layer)    │     │  Intacct    │
│  Opportunity ───────┤     │                   │     │             │
│    │                │     │  Payment Schedule │     │             │
│    ▼                │◄───►│  endpoints        │────►│  Create     │
│  npe01__            │     │  /api/opps/{id}/  │     │  Invoice    │
│  OppPayment__c      │     │  payment-schedule │     │             │
│  ┌────────────────┐ │     │                   │     │  Returns    │
│  │ Amount         │ │     │  Finance          │◄────│  RECORDNO   │
│  │ Scheduled_Date │ │     │  endpoints        │     │             │
│  │ Paid (boolean) │ │     │  /api/finance/*   │     │  Customers  │
│  │ Payment_Date   │ │     │                   │     │  GL Accts   │
│  │ Payment_Method │ │     │  Sage endpoints   │     │  Depts      │
│  └───────┬────────┘ │     │  /api/sage/*      │     │             │
│          │          │     │                   │     │             │
│          ▼          │     │                   │     │             │
│  Invoice__c         │     │                   │     │             │
│  ┌────────────────┐ │     │                   │     │             │
│  │ Sage_Invoice_  │ │     │                   │     │             │
│  │   ID           │ │     │                   │     │             │
│  │ Invoice_Amount │ │     │                   │     │             │
│  │ Invoice_Date   │ │     │                   │     │             │
│  │ Invoice_Status │ │     │                   │     │             │
│  │ Opportunity__c │ │     │                   │     │             │
│  └────────────────┘ │     │                   │     │             │
└────────────────────┘     └──────────────────┘     └─────────────┘
```

### Salesforce Payment Object (`npe01__OppPayment__c`)

This is the NPSP (Nonprofit Success Pack) payment record. Bedrock reads and writes these via the Salesforce API.

| Field | Type | Notes |
|-------|------|-------|
| `npe01__Payment_Amount__c` | Currency | Amount of this payment |
| `npe01__Scheduled_Date__c` | Date | When payment is expected |
| `npe01__Paid__c` | Boolean | Whether payment was received |
| `npe01__Payment_Date__c` | Date | When actually received |
| `npe01__Payment_Method__c` | Picklist | check, wire, ach, etc. |

### Salesforce Invoice Object (`Invoice__c`)

Custom object linking SF Payments to Sage Intacct invoices.

| Field | Type | Notes |
|-------|------|-------|
| `Opportunity__c` | Lookup | Parent Opportunity |
| `Sage_Invoice_ID__c` | Text | Sage Intacct RECORDNO |
| `Invoice_Amount__c` | Currency | Invoice total |
| `Invoice_Date__c` | Date | When invoice was created |
| `Invoice_Status__c` | Picklist | Draft, Sent, Paid, etc. |

### Permission Gating

| Endpoint | Required Permission |
|----------|-------------------|
| View payment schedules | (currently ungated) |
| Create payment schedule | `manage_payment_schedules` |
| View Sage data | `view_sage_invoices_payments` |
| Create invoice | `create_sage_invoices` |

### Open Architecture Decision: Invoice__c Object

**See [Section 13: Open Questions for Review](#13-open-questions-for-review)** for the full trade-off analysis on whether to keep Invoice__c or simplify to a direct field.

---

## 8. Domain 6: Pebble Intelligence Pipeline

Pebble is Pursuit's AI-powered prospect research system. It runs as a separate service (port 8001) that communicates with Bedrock (port 8000) via internal API.

### Research Lifecycle

```
User submits prospect
        │
        ▼
┌───────────────────┐     ┌──────────────────────┐
│  pebble_research  │────►│  pebble_scratchpad   │
│  _batches         │     │  (intermediate state) │
│                   │     └──────────────────────┘
│  total_prospects  │
│  completed_       │     ┌──────────────────────┐
│  target_tier      │────►│  pebble_batch_       │
│  status           │     │  prospects           │
│  total_cost_usd   │     │                      │
└───────────────────┘     │  prospect_name       │
                          │  prospect_org        │
                          │  current_tier        │──── T1 → T2 → T3
                          │  identity_confidence │
                          │  crm_status          │
                          │  result_json         │
                          └──────────┬───────────┘
                                     │ CASCADE (1:1 each)
                     ┌───────────────┼───────────────┐
                     ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────────┐
              │prospect_  │   │prospect_  │   │prospect_sf_  │
              │sf_contact │   │sf_account │   │opportunity   │
              │           │   │           │   │              │
              │last_name  │   │name       │   │suggested_    │
              │first_name │   │account_   │   │  name        │
              │title      │   │  type     │   │suggested_    │
              │email      │   │industry   │   │  amount      │
              │phone      │   │website    │   │suggested_    │
              │linkedin   │   │grantmaker │   │  stage       │
              │dept       │   │annual_rev │   │giving_cap    │
              │sources[]  │   │sources[]  │   │wealth_ind    │
              │...        │   │...        │   │sources[]     │
              └──────────┘   └──────────┘   └──────────────┘
```

### Research Session & State Tables

```
┌──────────────────────────────────┐
│  bedrock.pebble_research_sessions│
├──────────────────────────────────┤
│ id              UUID PK          │
│ contact_id      TEXT (indexed)   │
│ profile_json    TEXT             │
│ cost_usd        NUMERIC         │
│ prospect_name   TEXT             │
│ prospect_org    TEXT             │
│ status          TEXT 'completed' │
│ tier            TEXT (T1-T3)     │
│ agents_log_json TEXT (telemetry) │
│ batch_id        TEXT             │
│ created_at      TIMESTAMPTZ     │
└────────┬────────────┬────────────┘
         │            │
    1:many        1:1 (UNIQUE)
         │            │
         ▼            ▼
┌─────────────┐  ┌────────────────┐
│ pebble_     │  │ pebble_        │
│ conflict_log│  │ scratchpad     │
├─────────────┤  ├────────────────┤
│ session_id  │  │ session_id     │
│ contact_id  │  │   (UNIQUE idx) │
│ conflict_   │  │ contact_id     │
│   type      │  │ scratchpad_json│
│ claim_a     │  │ status         │
│ claim_b     │  │   (active |    │
│ description │  │    completed | │
│ resolution  │  │    failed |    │
│ created_at  │  │    timeout)    │
└─────────────┘  │ created_at     │
                 │ updated_at     │
                 └────────────────┘
```

### Chat System

```
┌──────────────────────────────────┐
│  bedrock.pebble_chat_            │
│  conversations                   │
├──────────────────────────────────┤
│ id              UUID PK          │
│ user_email      TEXT             │
│ title           TEXT             │
│ total_cost_usd  NUMERIC         │
│ created_at / updated_at         │
└────────────┬─────────────────────┘
             │ 1:many
             ▼
┌──────────────────────────────────┐
│  bedrock.pebble_chat_messages    │
├──────────────────────────────────┤
│ id              UUID PK          │
│ conversation_id UUID FK          │
│ role            TEXT (user|asst)  │
│ content         TEXT             │
│ tier            TEXT (T0-T3)     │
│ cost_usd        NUMERIC         │
│ metadata_json   TEXT             │
│ created_at      TIMESTAMPTZ     │
└──────────────────────────────────┘
```

### Research Tiers

| Tier | Name | Cost | Speed | What Happens |
|------|------|------|-------|-------------|
| **L0** | CRM Lookup | Free | <1s | Direct CRM query, no LLM |
| **L1** | CRM Analysis | ~$0.003 | 2-5s | CRM query + Haiku synthesis |
| **T1** | ID & Triage | ~$0.005 | 5-10s | Identity confirmation, quick profile card |
| **T2** | Structured Intel | ~$0.05 | 15-30s | Balanced findings across 5 dimensions |
| **T3** | Full Research Brief | ~$0.20-0.50 | 60-120s | Verified profile (Opus synthesis, 3-way quorum) |

### Agent Hierarchy

| Tier | Model | Role | Example Agents |
|------|-------|------|---------------|
| **Worker** | Haiku | Instant extraction, routing | `api_response_extractor`, `verifier_source`, `query_classifier` |
| **Drone** | Haiku | Batch summarization | Batch operations |
| **Forager** | Sonnet | Cross-source analysis | `wealth_indicator_agent`, `philanthropy_agent`, `entity_resolution_agent` |
| **Queen** | Opus | Synthesis, final verdict | `profile_synthesizer`, `fact_check_agent` |

**Escalation chain:** Worker → Forager → Queen → fail

### Final Output

```
bedrock.pebble_profiles
┌──────────────────────────────────┐
│ contact_id    TEXT PK             │ ← SF Contact ID
│ profile_json  TEXT                │ ← {summary, claims[], confidence_score}
│ cost_usd      NUMERIC            │
│ created_at    TIMESTAMPTZ        │
└──────────────────────────────────┘
```

The `profile_json` contains:
- `summary`: 2-3 sentence research brief
- `claims[]`: Verified claims with source attribution
- `confidence_score`: high | medium | low
- `conflicts_noted[]`: Any unresolved conflicts
- `skipped_sources[]`: Sources that failed or were skipped

---

## 9. Domain 7: Pebble Debugging & Schema Governance

### Debugging Artifacts

#### `bedrock.pebble_harness_log` — Agent Execution Telemetry

Every agent execution is logged with outcome, cost, and performance data.

```
┌──────────────────────────────────┐
│  bedrock.pebble_harness_log      │
├──────────────────────────────────┤
│ id              UUID PK          │
│ agent_name      TEXT             │ ← e.g., 'wealth_indicator_agent'
│ outcome         TEXT             │ ← success | killed_timeout | killed_budget |
│                                  │    killed_retries | killed_schema_fail |
│                                  │    escalated | skipped | quorum_rejection
│ cost_usd        NUMERIC         │
│ tokens_input    INTEGER         │
│ tokens_output   INTEGER         │
│ attempts        INTEGER         │
│ elapsed_seconds NUMERIC         │
│ error           TEXT             │
│ prospect_id     TEXT             │
│ user_email      TEXT             │
│ created_at      TIMESTAMPTZ     │
└──────────────────────────────────┘
```

**Use this table to answer:** "Why did this research run cost $0.45?" or "Which agents are timing out?"

#### `bedrock.pebble_source_scores` — Stigmergy Pheromone Trail

Records how "rich" each data source was for each prospect — informs which Forager agents to activate.

```
┌──────────────────────────────────┐
│  bedrock.pebble_source_scores    │
├──────────────────────────────────┤
│ id              UUID PK          │
│ source_name     TEXT             │ ← e.g., 'propublica', 'fec', 'sec'
│ richness_score  NUMERIC         │ ← 0 = empty, 1 = partial, 2 = rich
│ prospect_id     TEXT             │
│ created_at      TIMESTAMPTZ     │
└──────────────────────────────────┘
```

#### `bedrock.pebble_feedback` — Claim Accuracy Tracking

Human feedback on research claim accuracy. Builds training signal for future quality improvements.

```
┌──────────────────────────────────┐
│  bedrock.pebble_feedback         │
├──────────────────────────────────┤
│ id              UUID PK          │
│ claim_id        TEXT             │
│ correct         BOOLEAN         │
│ text            TEXT             │ ← User's comment
│ contact_id      TEXT             │
│ user_id         TEXT             │
│ created_at      TIMESTAMPTZ     │
└──────────────────────────────────┘
```

#### `bedrock.pebble_api_cache` — Response Deduplication

Prevents redundant API calls with TTL-based expiration.

```
┌──────────────────────────────────┐
│  bedrock.pebble_api_cache        │
├──────────────────────────────────┤
│ id              UUID PK          │
│ source          TEXT             │
│ lookup_key      TEXT             │
│ response_json   TEXT             │
│ created_at      TIMESTAMPTZ     │
│ expires_at      TIMESTAMPTZ     │
│ UNIQUE(source, lookup_key)      │
└──────────────────────────────────┘
```

#### `bedrock.pebble_daily_usage` — Cost Tracking

Per-user, per-day cost accumulation for access control and budgeting.

```
┌──────────────────────────────────┐
│  bedrock.pebble_daily_usage      │
├──────────────────────────────────┤
│ user_email      TEXT             │
│ date            DATE             │
│ total_cost_usd  NUMERIC         │
│ query_count     INTEGER         │
│ updated_at      TIMESTAMPTZ     │
│ PRIMARY KEY (user_email, date)  │
└──────────────────────────────────┘
```

### Schema Governance

#### `bedrock.sf_field_requirements` — SF Field Metadata

Reference table populated from Salesforce `describe()` audit. Maps which fields Pebble can populate at which tier.

```
┌──────────────────────────────────┐
│  bedrock.sf_field_requirements   │
├──────────────────────────────────┤
│ id              SERIAL PK        │
│ sobject         TEXT             │ ← Opportunity | Contact | Account | npe01__OppPayment__c
│ field_name      TEXT             │
│ field_label     TEXT             │
│ field_type      TEXT             │
│ is_required     BOOLEAN         │
│ has_default     BOOLEAN         │
│ default_value   TEXT             │
│ is_updateable   BOOLEAN         │
│ pebble_source_tier TEXT         │ ← Which tier can populate (T1, T2, T3, NULL)
│ notes           TEXT             │
│ last_verified_at TIMESTAMPTZ    │
│ UNIQUE(sobject, field_name)     │
└──────────────────────────────────┘
```

Seeded with ~35 rows covering required and key optional fields across Opportunity, Contact, Account, and Payment objects.

#### `bedrock.sf_schema_drift_log` — Change Detection

Automated detection of differences between live Salesforce `describe()` results and the `sf_field_requirements` table. All changes require human review — no automatic schema updates.

```
┌──────────────────────────────────┐
│  bedrock.sf_schema_drift_log     │
├──────────────────────────────────┤
│ id              SERIAL PK        │
│ sobject         TEXT             │
│ field_name      TEXT             │
│ drift_type      TEXT             │ ← field_removed | field_added | type_changed |
│                                  │   is_required_changed | updateable_changed
│ old_value       TEXT             │
│ new_value       TEXT             │
│ detected_at     TIMESTAMPTZ     │
│ resolved_at     TIMESTAMPTZ     │ ← NULL until reviewed
│ resolved_by     TEXT             │
│ action_taken    TEXT             │
└──────────────────────────────────┘
```

**Partial index:** `idx_sf_drift_unresolved` on `resolved_at WHERE resolved_at IS NULL` — quick lookup of unresolved drift events.

---

## 10. Cross-Domain Integration Map

How domains connect to each other. Three IDs thread across almost everything.

### Thread 1: `opportunity_id` (TEXT — SF Opportunity ID)

```
Salesforce Opportunity
        │
        ├── bedrock.project.opportunity_id (legacy 1:1 link)
        ├── bedrock.project_opportunity.opportunity_id (M:M link)
        ├── bedrock.activity.opportunity_id (activities logged against opps)
        ├── bedrock.opportunity_lock.sf_opportunity_id (edit locking)
        └── npe01__OppPayment__c (SF Payment → parent Opp)
```

### Thread 2: `contact_id` (TEXT — SF Contact ID)

```
Salesforce Contact
        │
        ├── bedrock.activity.contact_ids[] (activities mention contacts)
        ├── bedrock.pebble_profiles.contact_id (research output per contact)
        ├── bedrock.pebble_research_sessions.contact_id (research history)
        ├── bedrock.pebble_conflict_log.contact_id (conflicts about a contact)
        ├── bedrock.pebble_scratchpad.contact_id (intermediate research)
        └── bedrock.pebble_feedback.contact_id (claim feedback per contact)
```

### Thread 3: `project_task_id` (UUID — local FK)

```
bedrock.project_task
        │
        └── bedrock.activity.project_task_id (activities linked to tasks)
```

### Thread 4: `prospect_id` (UUID — Pebble batch prospect)

```
bedrock.pebble_batch_prospects
        │
        ├── bedrock.prospect_sf_contact.prospect_id (1:1)
        ├── bedrock.prospect_sf_account.prospect_id (1:1)
        └── bedrock.prospect_sf_opportunity.prospect_id (1:1)
```

### Thread 5: `user_email` (TEXT — user identity)

```
User's email address
        │
        ├── bedrock.app_user.email (auth identity)
        ├── bedrock.project.owner_email (project ownership)
        ├── bedrock.project.created_by (audit trail)
        ├── bedrock.project_contributor.user_email (project editors)
        ├── bedrock.activity.logged_by (who logged the activity)
        ├── bedrock.pebble_daily_usage.user_email (cost tracking)
        ├── bedrock.pebble_chat_conversations.user_email (chat owner)
        ├── bedrock.pebble_research_batches.user_email (batch owner)
        ├── bedrock.pebble_harness_log.user_email (agent telemetry)
        ├── bedrock.permission_unlock_request.requester_email
        └── bedrock.opportunity_lock.locked_by
```

---

## 11. Namespace Collision Analysis

### Method

The learning platform has 136+ tables in the `public` schema. Below is a table-by-table comparison of every `bedrock.*` table against known `public.*` tables. Since all Bedrock tables live in the `bedrock` schema, **namespace collisions are structurally impossible** — but this analysis confirms there are no *semantic* collisions that would cause confusion when building cross-system features.

### Table-by-Table Comparison

| bedrock.* Table | Similar public.* Table? | Collision Risk | Notes |
|-----------------|------------------------|---------------|-------|
| `project` | None | None | Learning platform has no project management tables |
| `workstream` | None | None | Unique to Bedrock |
| `milestone` | None | None | Unique to Bedrock |
| `project_task` | None | None | Learning platform has `tasks` (curriculum), different domain |
| `project_contributor` | None | None | Unique to Bedrock |
| `project_opportunity` | None | None | Unique to Bedrock |
| `sf_task_dependency` | None | None | SF-specific bridge |
| `sf_task_project` | None | None | SF-specific bridge |
| `permission_profile` | None | None | Learning platform uses JWT roles, not profile-based RBAC |
| `app_user` | `public.users` | **Semantic overlap** | Both represent people. `app_user` is fundraising-specific with permission profiles; `users` is the learning platform identity. **Integration point:** join on `email` for cross-system identity |
| `opportunity_lock` | None | None | SF-specific locking |
| `permission_unlock_request` | None | None | Bedrock-specific RBAC |
| `activity` | `public.networking_activities` | **Name similarity** | Different domains: Bedrock activities are fundraising interactions (calls, emails, meetings); learning platform networking activities are Builder career networking. No data overlap. |
| `pebble_profiles` | None | None | `pebble_` prefix prevents confusion |
| `pebble_research_sessions` | None | None | `pebble_` prefix |
| `pebble_feedback` | None | None | `pebble_` prefix |
| `pebble_harness_log` | None | None | `pebble_` prefix |
| `pebble_source_scores` | None | None | `pebble_` prefix |
| `pebble_api_cache` | None | None | `pebble_` prefix |
| `pebble_chat_conversations` | None | None | `pebble_` prefix |
| `pebble_chat_messages` | None | None | `pebble_` prefix |
| `pebble_research_batches` | None | None | `pebble_` prefix |
| `pebble_batch_prospects` | None | None | `pebble_` prefix |
| `pebble_conflict_log` | None | None | `pebble_` prefix |
| `pebble_scratchpad` | None | None | `pebble_` prefix |
| `pebble_daily_usage` | None | None | `pebble_` prefix |
| `sf_field_requirements` | None | None | `sf_` prefix |
| `prospect_sf_contact` | None | None | `prospect_sf_` prefix |
| `prospect_sf_account` | None | None | `prospect_sf_` prefix |
| `prospect_sf_opportunity` | None | None | `prospect_sf_` prefix |
| `sf_schema_drift_log` | None | None | `sf_` prefix |

### Semantic Overlap: Key Integration Points

These are the places where Bedrock and the learning platform share concepts. Future cross-system features should use these integration points:

#### 1. People Identity (`email` as join key)

```sql
-- "Is this fundraising contact also a Builder?"
SELECT bu.email, bu.name, pu.role, pu.cohort_id
FROM bedrock.app_user bu
JOIN public.users pu ON bu.email = pu.email;
```

Bedrock `app_user` = internal staff who use the fundraising CRM. Learning platform `users` = builders, staff, admins. A person can exist in both (staff member who is also a Bedrock user). The `email` field is the natural join key.

#### 2. Organizations ↔ Accounts

```sql
-- "Which Builders have job applications at this funder's company?"
-- (Jac's Pathfinder integration scenario)
SELECT c.name AS company, ja.status, u.first_name, u.last_name
FROM public.companies c
JOIN public.job_applications ja ON ja.company_id = c.id
JOIN public.users u ON ja.user_id = u.id
WHERE c.name ILIKE '%MetLife%';
```

Bedrock tracks **Accounts** (funders) via Salesforce. The learning platform tracks **companies** (employers where Builders apply for jobs). These are different records representing the same real-world organization. Integration would match on company name or a future shared org ID.

#### 3. Leads ↔ Prospects

| System | Table | Meaning |
|--------|-------|---------|
| Learning platform | `public.lead` | Admissions lead — person considering becoming a Builder |
| Bedrock | (Salesforce Lead, RecordType `Fundraising_Lead`) | Fundraising prospect — potential donor or partner |

These are **distinct lifecycles** with no cross-write. The word "lead" means different things in each system. Bedrock deliberately uses "Prospect" to avoid confusion. See `product/crm-scope-constitution.md` for the full boundary definition.

#### 4. Career Data (Pathfinder) — Future Read Path

```sql
-- "How many Builders at Company X got placed? (for donor pitch)"
SELECT c.name, COUNT(*) as placements
FROM public.job_applications ja
JOIN public.companies c ON ja.company_id = c.id
WHERE ja.status = 'accepted'
GROUP BY c.name;
```

Bedrock never writes to Pathfinder tables. Future integration is read-only: enriching fundraising conversations with employment outcome data.

#### 5. Events & Workshops

The learning platform tracks `events`, `workshops`, and registrations. Bedrock records the **fundraising outcome** of events (e.g., "Met Prospect X at Gala") as Activities. No table overlap; the integration is: "Did this prospect attend any of our events?" via contact matching.

### Summary

- **Zero namespace collisions** — `bedrock.*` schema isolation makes this structurally impossible
- **5 semantic integration points** where cross-system queries will be needed
- **No refactoring required** when building Pathfinder features that surface company info — just cross-schema JOINs on known keys (email, company name)

---

## 12. Design Pattern: Conflict & Resolution Logs

### Why "Conflict & Resolution Log" Instead of "Conflict Log"

The Claude Certified Architect course defines a standard **Conflict Log** pattern: a table that records when agents produce contradictory outputs. It answers the question *"what conflicted?"*

Bedrock's implementation — `bedrock.pebble_conflict_log` — goes further. It is a **Conflict & Resolution Log** that captures the full lifecycle:

```
Standard "Conflict Log":              Bedrock "Conflict & Resolution Log":

  Detection                            Detection
    └── what conflicted                   ├── what conflicted (claim_a, claim_b)
                                          ├── classification (conflict_type)
                                          ├── context (description)
                                          └── Resolution
                                                └── how it was resolved (resolution)
```

### The Table

```sql
CREATE TABLE bedrock.pebble_conflict_log (
    id              UUID PRIMARY KEY,
    session_id      UUID REFERENCES bedrock.pebble_research_sessions(id),
    contact_id      TEXT,
    conflict_type   TEXT,     -- 'role' | 'financial' | 'temporal'
    claim_a         TEXT,     -- First conflicting claim
    claim_b         TEXT,     -- Second conflicting claim
    description     TEXT,     -- Human-readable explanation of the conflict
    resolution      TEXT,     -- How the system resolved it
    created_at      TIMESTAMPTZ
);
```

### Three Conflict Types

| Type | What It Detects | Example |
|------|----------------|---------|
| **Role** | Different current titles at the same org | "CEO at Acme Foundation" vs. "Board Chair at Acme Foundation" |
| **Financial** | Significantly different amounts for the same metric | "$2.1M in revenue" vs. "$890K in revenue" |
| **Temporal** | One source says "current," another says "former" | "serves as VP" vs. "served as VP" |

### Why This Design Is Better

1. **Closed-loop audit trail.** A standard Conflict Log tells you what broke. A Conflict & Resolution Log tells you what broke *and how it was fixed*. When a donor officer reads a research brief, they can trace back to any conflict and see the resolution rationale.

2. **Resolution pattern analysis.** Over time, you can query: "How often do temporal conflicts get resolved by the system vs. deferred to the user?" This informs whether to invest in better temporal parsing.

3. **Aligned with agentic design principles.** The Pebble agentic architecture requires explicit plan/progress/conclusions tracking at every iteration. A conflict without a recorded resolution violates this principle — it's a loose end in the agent's reasoning chain.

4. **Synthesis integration.** Detected conflicts and their resolutions are passed directly to the Opus synthesis prompt:
   > "Data conflicts detected: Alice held Board seat 2015-2018 vs. 2018-2022. Address discrepancies in your analysis."

   The synthesizer incorporates this context, and the final profile reflects the resolution. The log preserves the evidence chain.

### How Conflict Detection Works

Pebble uses **heuristic regex-based detection**, not ML. This is a deliberate choice: all claim text is template-generated with predictable patterns (e.g., "serves as X at Y", "reported $X in revenue"). Regex is correct for structured input. The detector runs after clusters complete but before synthesis.

```
Raw claims from all sources
        │
        ▼
┌───────────────────────┐
│   Conflict Detector   │
│   (regex patterns)    │
│                       │
│   ~36 known patterns  │
│   for role, financial,│
│   and temporal        │
│   conflicts           │
└───────────┬───────────┘
            │
            ├──► pebble_conflict_log (persisted)
            │
            └──► Synthesis prompt (injected as context)
```

---

## 13. Open Questions for Review

### Question 1: Invoice__c Object — Keep or Simplify?

**Current implementation:**
```
Payment → Invoice__c (junction object in SF) → Sage Invoice ID
```

**Simpler alternative:**
```
Payment.Sage_Invoice_ID__c → "30555" (direct field on Payment)
```

| Aspect | Current (Invoice__c Object) | Simpler (Direct Field) |
|--------|---------------------------|----------------------|
| Complexity | More complex | Simpler to maintain |
| Data tracking | Can track invoice status in SF | Status only in Sage |
| Relationship | Supports M:M (if needed) | 1:1 only |
| Queries | More joins needed | Direct access |
| Audit trail | Full invoice history in SF | Minimal SF history |

**Current decision:** Keep Invoice__c object (flexibility + cleaner model)

**What Jac should weigh in on:**
- Does Finance actually need invoice status tracked in SF, or do they always check Sage?
- Are there scenarios where one invoice covers multiple payments (M:M)?
- After 3 months of production usage, will we have enough data to decide?

**Full analysis:** `docs/architecture-decisions.md`, Decision #1

---

### Question 2: Partial Payment Tracking

**Current:** Binary `npe01__Paid__c` (TRUE/FALSE) on SF Payment records. No tracking of partial amounts.

**Gap scenario:** Invoice for $50K, customer pays $25K on Jan 10 and $25K on Jan 20. Currently shows "Not Paid" until both received.

**Options:**
- A: Add `Sage_Amount_Paid__c` field (recommended if partial payments are common)
- B: Split payment records (changes payment schedule retroactively)
- C: Accept limitation (partial details only visible in Sage)

**What Jac should weigh in on:** How common are partial payments? Does Finance need to see partial progress in SF?

---

### Question 3: Pathfinder Integration Points

When Pursuit builds features that surface company info across systems (Jac's concern from the 2026-04-03 conversation), the integration paths are:

| Use Case | How It Works | Refactoring Needed? |
|----------|-------------|-------------------|
| "Is this donor contact also a Builder?" | JOIN `bedrock.app_user` ↔ `public.users` on `email` | None |
| "Show Builders at this funder's company" | JOIN `public.companies` ↔ SF Account on company name | None (might want a `company_id` mapping table later) |
| "Prospect looked up — check jobs DB" | Query `public.companies` + `public.job_applications` by company name | None |
| "Employment outcomes for donor pitch" | Aggregate `public.job_applications` WHERE status = 'accepted' | None |

**Key insight:** The `bedrock` schema prefix means no tables need renaming. Cross-schema JOINs already work. The only potential future addition is a **mapping table** (`bedrock.org_identity_map`) to handle cases where SF Account name doesn't exactly match `public.companies.name` (e.g., "Ford Foundation" vs. "The Ford Foundation").

---

### Question 4: Sage Customer Matching

**Current:** Invoices use the SF Account name to find the Sage customer. Exact name mismatch is a known risk.

**Future fix:** Add `Sage_Customer_ID__c` field to SF Account, do a one-time mapping, use the ID for invoice creation.

**What Jac should weigh in on:** Should this be done before production launch, or can it wait?

---

## 14. Appendix: All Tables Quick Reference

### 31 Tables in `bedrock` Schema

| # | Table | Domain | Columns | FKs | Soft Delete? |
|---|-------|--------|---------|-----|-------------|
| 1 | `project` | Project Mgmt | 10 | 0 | Yes |
| 2 | `workstream` | Project Mgmt | 9 | 1 (project) | Yes |
| 3 | `milestone` | Project Mgmt | 12 | 1 (workstream) | Yes |
| 4 | `project_task` | Project Mgmt | 14 | 1 (milestone) | Yes |
| 5 | `project_contributor` | Project Mgmt | 6 | 1 (project) | No |
| 6 | `project_opportunity` | CRM Bridge | 5 | 1 (project) | No |
| 7 | `sf_task_dependency` | CRM Bridge | 5 | 0 | No |
| 8 | `sf_task_project` | CRM Bridge | 7 | 2 (project, milestone) | No |
| 9 | `permission_profile` | Auth | 7 | 0 | No |
| 10 | `app_user` | Auth | 8 | 1 (profile) | No |
| 11 | `opportunity_lock` | Auth | 3 | 0 | No |
| 12 | `permission_unlock_request` | Auth | 9 | 1 (profile) | No |
| 13 | `activity` | Activities | 30+ | 1 (project_task) | Yes |
| 14 | `pebble_profiles` | Pebble | 4 | 0 | No |
| 15 | `pebble_research_sessions` | Pebble | 11 | 0 | No |
| 16 | `pebble_feedback` | Pebble | 7 | 0 | No |
| 17 | `pebble_harness_log` | Pebble | 12 | 0 | No |
| 18 | `pebble_source_scores` | Pebble | 5 | 0 | No |
| 19 | `pebble_api_cache` | Pebble | 6 | 0 | No |
| 20 | `pebble_chat_conversations` | Pebble | 6 | 0 | No |
| 21 | `pebble_chat_messages` | Pebble | 8 | 1 (conversation) | No |
| 22 | `pebble_research_batches` | Pebble | 8 | 0 | No |
| 23 | `pebble_batch_prospects` | Pebble | 10 | 1 (batch) | No |
| 24 | `pebble_conflict_log` | Pebble | 9 | 1 (session) | No |
| 25 | `pebble_scratchpad` | Pebble | 7 | 1 (session) | No |
| 26 | `pebble_daily_usage` | Pebble | 5 | 0 | No |
| 27 | `sf_field_requirements` | Governance | 12 | 0 | No |
| 28 | `prospect_sf_contact` | CRM Mapping | 20 | 1 (batch_prospect) | No |
| 29 | `prospect_sf_account` | CRM Mapping | 17 | 1 (batch_prospect) | No |
| 30 | `prospect_sf_opportunity` | CRM Mapping | 16 | 1 (batch_prospect) | No |
| 31 | `sf_schema_drift_log` | Governance | 9 | 0 | No |

### Trigger Summary

| Trigger Function | Tables Using It |
|-----------------|----------------|
| `bedrock.set_updated_at()` | project, workstream, milestone, project_task, pebble_chat_conversations, pebble_research_batches, pebble_batch_prospects, pebble_scratchpad, pebble_daily_usage, prospect_sf_contact, prospect_sf_account, prospect_sf_opportunity |
| `bedrock.activity_search_vector_update()` | activity (BEFORE INSERT OR UPDATE) |

### Index Summary

- **5 partial indexes** (soft-delete filtering): project, workstream, milestone, project_task, activity + sf_schema_drift_log (unresolved)
- **2 GIN indexes**: activity.contact_ids (array), activity.search_vector (FTS)
- **1 UNIQUE index**: pebble_scratchpad.session_id (ON CONFLICT support)
- **20+ btree indexes**: FK columns, lookup columns, sort columns

---

> **Related documentation:**
> - `docs/database-schema-rundown.md` — operational reference (connection model, query patterns)
> - `product/crm-architecture/entity-map.md` — CRM entity definitions and examples
> - `product/crm-architecture/canonical-definitions.md` — enums, field names, ID patterns (this file governs)
> - `docs/architecture-decisions.md` — payment/invoice architecture trade-offs
> - `product/learning-platform-integration.md` — how Bedrock will merge with the learning platform
> - `product/crm-scope-constitution.md` — what Bedrock does and does not do
