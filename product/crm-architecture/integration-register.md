# Pursuit CRM (Bedrock) — Integration & External Dependency Register

> Phase 4 Deliverable | Version: 1.0 | Date: 2026-03-15
>
> Companion to: `product/crm-scope-constitution.md`, `product/crm-architecture/information-flows.md`

---

## Integration Summary

| # | System | Direction | Phase | Status |
|---|--------|-----------|-------|--------|
| 1 | Salesforce | Bidirectional | MVP (Phase 1) | Active — existing integration |
| 2 | Sage Intacct | Bidirectional | Phase 2 | Not started |
| 3 | Slack Bot | Slack → Salesforce (fast path) / Slack → Bedrock queue (slow path) | Phase 1 | Specified; bot architecture defined |
| 4 | LinkedIn CSV | Import only | Phase 1 | In-browser parsing (no API) |
| 5 | Prospect Lists (CSV) | Import only | Phase 1 | In-browser parsing |
| 6 | Google Calendar | Read only | Phase 2+ | Not started |
| 7 | Claude API | Bedrock → Claude | Phase 2+ | Not started |
| 8 | Learning Platform | Shared identity | Long-term | Architecture defined |

---

## Integration Details

### 1. Salesforce

**Direction:** Bedrock ↔ Salesforce (bidirectional)

**What syncs:**

| Entity | Bedrock → SF | SF → Bedrock | Key Fields |
|--------|-------------|-------------|------------|
| Opportunity | Create, stage change, amount, close date | All fields on record | `salesforce_id` as link key |
| Account | Create, update name/type | All fields on record | `salesforce_id` as link key |
| Contact | Create, update | All fields on record | `salesforce_id` as link key |

**Trigger:** On create/update in Bedrock → push to Salesforce. Periodic pull (every 15 min or on-demand) from Salesforce → Bedrock.

**Frequency:** Near-real-time for writes (Bedrock → SF); polling or webhook for reads (SF → Bedrock).

**Conflict resolution:** Salesforce wins on field-level conflicts (it's the system of record for these entities). Bedrock can create records, but SF is authoritative.

**Owner:** Engineering (backend integration in `financial_forecasting/data_sync.py`).

**Current state:** Working integration exists for Opportunities, Accounts, Contacts via FastAPI backend.

#### Salesforce Field Mapping

> **This is the authoritative field mapping.** Code in `data_sync.py` must match this table.
> See `canonical-definitions.md` for field naming rules.

**Opportunity:**

| Bedrock Field | Salesforce API Name | Transform | Notes |
|---------------|-------------------|-----------|-------|
| `id` | — | Not synced | Bedrock-only primary key |
| `salesforce_id` | `Id` | Direct | 18-char SF ID |
| `name` | `Name` | Direct | |
| `account_id` | `AccountId` | Lookup: Bedrock acct by `salesforce_id` | |
| `primary_contact_id` | `npsp__Primary_Contact__c` | Lookup: Bedrock contact by `salesforce_id` | NPSP custom field |
| `amount_estimated` | `Amount` | Direct | |
| `amount_confirmed` | `Amount` | Same field; Bedrock separates estimated vs. confirmed | Only written when `stage = closed-won` |
| `stage` | `StageName` | Map via legacy stage table in `canonical-definitions.md` | SF uses old stage names |
| `revenue_stream` | `Type` or custom `Revenue_Stream__c` | Map: if Type contains "Grant" → `nonprofit`, else → `pbc` | Verify custom field exists in SF |
| `expected_close_date` | `CloseDate` | Direct (date format) | |
| `assigned_to` | `OwnerId` | Lookup: Bedrock user by SF User ID | |
| `probability` | `Probability` | Direct (0–100) | |
| `service_type` | `npsp__Grant_Type__c` or custom | TBD | May need custom field |
| `campaign_name` | `CampaignId` → `Campaign.Name` | Lookup: resolve Campaign ID to name | MVP: string only |

**Account:**

| Bedrock Field | Salesforce API Name | Transform | Notes |
|---------------|-------------------|-----------|-------|
| `id` | — | Not synced | |
| `salesforce_id` | `Id` | Direct | |
| `name` | `Name` | Direct | |
| `type` | `Type` | Map: `Foundation` → `foundation`, `Corporate` → `corporation`, `Government` → `government` | |
| `industry` | `Industry` | Direct | |
| `website` | `Website` | Direct | |

**Contact:**

| Bedrock Field | Salesforce API Name | Transform | Notes |
|---------------|-------------------|-----------|-------|
| `id` | — | Not synced | |
| `salesforce_id` | `Id` | Direct | |
| `first_name` | `FirstName` | Direct | |
| `last_name` | `LastName` | Direct | |
| `email` | `Email` | Direct | |
| `phone` | `Phone` | Direct | |
| `title` | `Title` | Direct | |
| `organization` | `Account.Name` | Lookup via `AccountId` | |

**Payment (NPSP):**

| Bedrock Field | Salesforce API Name | Transform | Notes |
|---------------|-------------------|-----------|-------|
| `id` | — | Not synced | |
| `salesforce_id` | `Id` | Direct | NPSP Payment record |
| `opportunity_id` | `npe01__Opportunity__c` | Lookup | |
| `amount` | `npe01__Payment_Amount__c` | Direct | |
| `expected_date` | `npe01__Scheduled_Date__c` | Direct | |
| `received_date` | `npe01__Payment_Date__c` | Direct; null if not received | |
| `status` | `npe01__Paid__c` | Map: `true` → `received`, `false` + past date → `overdue`, `false` + future date → `scheduled` | |
| `payment_method` | `npe01__Payment_Method__c` | Direct | |
| `sage_id` | `Sage_Invoice_ID__c` | Direct | Custom field; Phase 2 |

---

### 2. Sage Intacct (Phase 2)

**Direction:** Bidirectional. Sage is financial SoT; Sage wins on payment data.

**Syncs:** Invoices (Bedrock → Sage on `invoiced` status, bookkeeper-triggered), Payment receipts (Sage → Bedrock, batch daily). `sage_id` on Payment as link key.

**Current state:** Not started. Requires Sage API access.

**Open questions (resolve before Phase 2):** Which Sage API (REST/SDK)? Push invoices directly or bookkeeper reviews in Sage first? Partial payment handling for milestone-based grants? **Owner:** Engineering + Finance.

---

### 3. Slack Bot

**Direction:** Slack → Salesforce (fast path, on user confirmation) OR Slack → Bedrock Automation Review queue (slow path, for unconfirmed/complex proposals)

**What flows:**

| Data | Source | Target | Processing |
|------|--------|--------|-----------|
| Pipeline updates | Slack messages in `#pipeline-updates` | Opportunity, Account, Contact, Payment fields in Salesforce | Bot parses (rule-based + Haiku AI fallback) → proposes in-thread → user confirms → writes to SF |
| Unconfirmed proposals | Slack proposals that timed out (24hr) or were too complex | Automation Review queue in Bedrock | Flows to queue as pending; user reviews in pipeline meeting |

**Trigger:** Message in `#pipeline-updates` channel, OR `@BedrockBot` mention in other channels, OR DM from allowlisted user.

**Frequency:** Real-time (Slack Events API / Socket Mode). On confirm → immediate SF write. Unconfirmed → queue after 24hr.

**Conflict resolution:** Nothing is written without human confirmation (Slack button or Automation Review). Confirmed Slack updates are logged as auto-approved in the queue for optional post-hoc review. Concurrent write protection via SF `LastModifiedDate` check.

**Owner:** Engineering (Slack bot; see `product/fundraising-team/phases/slack-data-entry-and-review.md`).

**Current state:** Bot architecture fully specified (two-layer parsing, entity resolution, confirmation flow, security requirements). Automation Review queue specified in `home-page-spec.md` §3.4. Implementation not yet started.

---

### 4. LinkedIn CSV Import

**Direction:** Import only (file → Bedrock)

**What flows:**

| Data | Source | Target | Processing |
|------|--------|--------|-----------|
| Contact records | LinkedIn "Connections" CSV export | Contact entity | PapaParse in-browser; column mapping; dedup by name+org |

**Trigger:** Manual file upload by user.

**Frequency:** Ad-hoc (when user exports new connections).

**Owner:** Frontend (in-browser parsing, no backend).

**Current state:** Specified for week-1 prototype (CSV import in `WeeklyPriorities.tsx`). Column mapping and validation rules locked.

---

### 5. Prospect Lists (CSV)

**Direction:** Import only (file → Bedrock)

**What flows:**

| Data | Source | Target | Processing |
|------|--------|--------|-----------|
| HNWI / prospect records | External prospect lists (CSV) | Contact entity + NetworkMatch | PapaParse; fuzzy match (Fuse.js) against existing Contacts |

**Trigger:** Manual file upload.

**Frequency:** Ad-hoc (when new prospect list is acquired).

**Owner:** Frontend (Phase 1 prototype); backend (Phase 2+ for larger lists).

**Current state:** Architecture defined in prospect-dashboard specs. Merge key and dedup logic specified in `REQUIREMENTS-GAPS-AND-STRUCTURE.md` as needing further definition.

---

### 6. Google Calendar (Phase 2+)

Read-only. Meeting events → Task/Activity suggestions in Bedrock. Not started. See `product/fundraising-team/phases/home-page-spec.md`.

---

### 7. Claude API (Phase 2+)

Bedrock → Claude. Sends Contact/Account context, receives prospect scores and research summaries. Also processes Fireflies meeting transcripts into structured Activity records. On-demand or nightly batch. **PII constraint:** minimize data sent; no donor financial details; cache results locally.

---

### 8. Learning Platform (Long-term)

**Direction:** Shared identity + optional data links

**What flows:**

| Data | Bedrock → Platform | Platform → Bedrock |
|------|-------------------|-------------------|
| User identity | Shared JWT auth, roles | Same |
| Organization links | Funder Accounts | Employer Companies (optional cross-link) |
| People links | Contacts (funders) | Users (Builders) — shared identity where applicable |

**Trigger:** Shared authentication; optional API calls for cross-references.

**Frequency:** On login (auth); on-demand (cross-reference queries).

**Owner:** Engineering (joint with learning platform team).

**Current state:** Architecture defined in `product/learning-platform-integration.md`. No code yet. Long-term phase.

**Key constraint:** Fundraising prospects stay in Salesforce (system of record via `Fundraising_Lead` record type), not in the learning platform's `lead` table. Optional `fundraising_prospect` table in PostgreSQL for cross-platform joins post-merge. See entity-map.md for the Lead→Prospect rename rationale.

---

## Integration Principles

1. **One system of record per entity.** Salesforce for Opportunities/Accounts/Contacts. Sage for financial transactions. Bedrock for Prospects/Tasks/Activities (Bedrock-native). Never let two systems both claim authority over the same field.

2. **Human-in-the-loop for ingest.** Data from Slack, CSV imports, and AI enrichment is always *proposed*, never auto-written. Review queue required.

3. **Idempotent sync operations.** Every sync operation must be safe to retry. Use external IDs (`salesforce_id`, `sage_id`) as dedup keys.

4. **Fail visibly.** Sync failures surface in an admin dashboard or notification — never silently swallowed. See Scope Constitution success criterion #8.

5. **Minimize PII in external calls.** Claude API, Slack logging, and any future integrations receive the minimum data necessary. No donor financial details in API calls.
