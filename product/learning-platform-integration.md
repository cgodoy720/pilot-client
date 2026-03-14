# Learning Platform Integration — Bedrock Alignment

This doc summarizes the **Pursuit AI Native** learning platform (builders, admissions, Pathfinder/Sputnik, etc.) so Bedrock can be designed to integrate cleanly. Source: **app-context.md** + **database-schema.sql** (shared by the team).

**Unified platform target:** The **unified Pursuit platform** is the learning platform codebase (React + Node + PostgreSQL). Bedrock (fundraising CRM, prospect intelligence, reporting) will **live inside that same application** — same auth, same deployment, optional shared PostgreSQL — so staff have one place for both learning and fundraising. This repo is the prototype and integration staging ground until that merge.

---

## Learning platform at a glance

- **Purpose:** Learning management for workforce development — builders from application through job placement; AI curriculum, attendance, assessments, career outcomes.
- **Stack:** React 19 + Vite + Tailwind + shadcn/ui → Node.js + Express → PostgreSQL + pgvector | OpenRouter, GCS, BigQuery, Cloud Run | JWT auth.
- **Auth:** `POST /api/unified-auth` → JWT (7d users, 30d applicants) → `Authorization: Bearer`; roles: `builder`, `staff`, `admin`, `applicant`, `volunteer`, `workshop_*`, `enterprise_*`.
- **API pattern:** REST under `/api/*`; errors as JSON `{error, details?}`; HTTP 200/201/400/401/403/404/500. Frontend: `fetchWithAuth('/api/endpoint')`.
- **DB:** `const db = require('./db/dbConfig'); db.one()`, `db.any()`, `db.none()`. Tables grouped as in database-schema.sql (users, curriculum, admissions, events, career, lead, outreach, etc.).

**Key areas:** Auth & users, curriculum/tasks/AI chat, admissions pipeline, attendance, assessments, **Pathfinder (career/jobs — Sputnik, interviews, networking)**, volunteers, workshops/events, email automation, Lookbook, sales tracker.

**When Bedrock merges:** Adopt the same stack (Vite + Tailwind + shadcn, Express, PostgreSQL), same auth (JWT, roles), same API and error conventions. Add fundraising-specific routes (e.g. `/api/fundraising/*` or under existing resource paths) and, if needed, a dedicated schema or table prefix (e.g. `fundraising_lead`) so backups and access control stay consistent.

---

## Data model touchpoints for Bedrock

| Concept | Learning platform | Bedrock (this repo) |
|--------|-------------------|----------------------|
| **People** | `users` (user_id, role, cohort_id), `user_profiles` (linkedin_url, etc.), `applicant` (applicant_id, pre-enrollment) | Contacts, opportunity owners; future: same person as Builder/staff |
| **Leads** | `lead` (email, first_name, last_name, status, applicant_id, user_id), `lead_source`, `lead_engagement`, `lead_note` | Prospect/network-search “Add to Leads” → should map to same notion of “lead” where possible |
| **Orgs** | `organizations` (workshop/event partners), `companies` (Pathfinder/job applications) | Accounts (funders); future: link funders ↔ companies where relevant |
| **Career/jobs** | Pathfinder: `job_applications`, `interviews`, `networking_activities`, `companies`, `weekly_goals` | No direct Bedrock equivalent; Bedrock focuses on fundraising pipeline; shared “Builder” identity only |
| **Admissions** | `applicant`, `application`, `applicant_stage`, `onboarding_tasks` | No direct equivalent; optional future: “prospect attended event” or referral from learning platform |

**Important:** Learning platform `lead` is **admissions/marketing lead** (prospective Builder). Bedrock “lead” is **fundraising prospect** (donor/HNWI/institution). They are different lifecycles; the link is **identity** (same person could be in both systems) and **optional cross-links** (e.g. “this donor is also a Builder” or “this contact works at Company X where we have job_applications”).

**Where Bedrock leads live:** Bedrock fundraising leads use **Salesforce Lead** as the system of record; the SF data model supports it and no separate DB is required. The learning platform’s `lead` table is **not** used for fundraising prospects. Post-merge, an optional **`fundraising_lead`** table in PostgreSQL can hold a sync/cache from SF (or vice versa) for cross-platform joins (e.g. “prospect attended workshop X”); see home-page-spec §6.3.

---

## How to keep Bedrock and the learning platform integrable

1. **Shared identity**
   - Use stable, exportable IDs for people and orgs. Learning platform: `user_id`, `applicant_id`, `organization_id`, `company_id`. Bedrock/Salesforce: Account/Opportunity/Contact IDs. Future integration: mapping table or canonical ID (e.g. email or Pursuit-wide person_id) so we can join “same person” across systems.

2. **Auth**
   - Learning platform uses JWT and `fetchWithAuth`. Bedrock currently uses its own auth (e.g. Salesforce OAuth). For a unified Bedrock UI that staff use for both fundraising and (later) learning insights: consider same JWT issuer or a small auth gateway that can accept both.

3. **APIs**
   - Learning platform exposes REST under `/api/*` (e.g. `/api/users`, `/api/admissions`, `/api/pathfinder/applications`). Bedrock can later call these to:
     - Resolve “is this contact already a Builder?” (user_id / applicant_id).
     - Show “Builders at this company” when viewing a funder Account.
     - Enrich prospect context (e.g. “attended workshop X” or “referred by Builder Y”).

4. **Data model**
   - Avoid redefining “lead” in Bedrock in a way that conflicts with learning platform `lead`. Prefer terms like **fundraising lead**, **prospect**, or **fundraising prospect** in Bedrock. **Store Bedrock leads in Salesforce Lead** (system of record). If we add a table in the learning platform DB for fundraising, use a distinct name (e.g. **`fundraising_lead`**) and a clear mapping (e.g. `salesforce_lead_id`); do not reuse the admissions `lead` table for fundraising prospects.

5. **Sputnik / Pathfinder**
   - Job prospects, interviews, hustle — all live in learning platform. Bedrock does not duplicate them. Integration = Bedrock can link **people** and **companies** to that data (e.g. “This funder contact is VP at Company X; we have N Builders with job_applications at Company X”) for reporting and relationship intelligence.

---

## Security and redundancy when Bedrock lives in the learning platform

When Bedrock is merged into the unified platform:

- **Auth:** Use the learning platform’s existing JWT auth and role model (`admin`, `staff`, `builder`, etc.). Add fundraising-specific roles or permissions (e.g. “fundraising_team”, “executive_view”) without duplicating auth systems.
- **Database:** If fundraising entities (prospects, opportunities, matches) live in the same PostgreSQL instance, apply the same backup, encryption, and access policies as the rest of the learning platform. Do not introduce a second DB stack; extend the existing schema with clear naming (e.g. `fundraising_*` or a dedicated schema) so backups and replication cover everything.
- **PII and compliance:** Donor and prospect data in the learning platform DB must follow the same PII handling and access logging as other sensitive data (see `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`). Redundancy and 3-2-1 backup rules apply to any PostgreSQL that holds fundraising data.

---

## Summary

- **Bedrock** = CRM + prospect intelligence + reporting for **fundraising** (Salesforce/Sage, grants, HNWI, network mapping).
- **Learning platform** = **training, admissions, Pathfinder/Sputnik**, career outcomes.
- **Unified platform** = learning platform codebase; Bedrock will live inside it with shared auth, optional shared DB, and one UI.
- **Integration** = shared notion of people and orgs, shared auth, and API calls so Bedrock can surface “Builder/company/event” context and the learning platform can surface “funder/opportunity” context where useful. Security and redundancy inherit from the learning platform when we merge.

Keeping these boundaries clear will let both systems evolve without blocking each other, while we design Bedrock (IDs, entities, APIs) so that the eventual merge is a consolidation, not a rewrite.
