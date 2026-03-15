# Roadmap, Standards & Week 1 Prototype

Bedrock vision, **unified platform** (Bedrock lives in the learning platform eventually), **phased plan**, **week 1** (spreadsheet → weekly priority list), and standards: dev, fundraising, security/redundancy.

---

## Unified platform: where Bedrock lives

**Target:** One Pursuit platform — the app that runs the learning system (builders, admissions, Pathfinder/Sputnik). **Bedrock** (fundraising CRM, prospect intelligence, reporting) will **live inside that codebase** (and DB where appropriate), not as a separate product. **Now:** We prototype in **this repo** (Salesforce/Sage already here). **Later:** Merge into learning platform (shared auth, identity, optional shared PostgreSQL, one UI). Tech stack and design alignment with the learning platform (React 19 + Vite + Tailwind + shadcn, Node + Express, PostgreSQL, JWT, API patterns) are in `product/learning-platform-integration.md`; use app-context.md and database-schema.sql as the source of truth for the target platform.

---

## Phased plan (high level)

| Phase | Where | Goal |
|-------|--------|------|
| **Week 1** | This repo | Working prototype: import messy prospect/contact spreadsheet + grant deadlines → **actionable weekly priority list** (see below). |
| **Week 2** | This repo | Pipeline CRM features (Leads tab + enrichment with giving capacity, wealth tier), personal dashboard (Home), network relationship graph (force-directed, LinkedIn CSV import, SF data visualization). Rebrand to “Bedrock.” See `product/fundraising-team/phases/week-2-pipeline-dashboard-network.md`. |
| **Home page (next)** | This repo | **Customizable home:** calendarized view (day/week/2 weeks) with Google Calendar + matching confirmation; top 5/10/25 prospects by weighted score; Active Comms / Inactive; automation review (weekly). See `product/fundraising-team/phases/home-page-spec.md`. |
| **Short term** | This repo | **Slack-driven data entry + human verification** (pending changes → weekly review → confirm to DB); **custom reports** (basic prompts + pre-built filters); **Claude API intelligence** (prospect scoring, suggested actions); **Leads in Salesforce** (SF Lead as system of record; see home-page-spec §6.3). |
| **Medium term** | This repo → learning platform | Bedrock feature-complete here; begin integration: shared auth, API contracts, data model alignment. |
| **Long term** | Learning platform | Bedrock lives in unified app; one login, one nav; fundraising and learning data coexist with clear boundaries and shared identity. |

---

## Week 1 prototype: spreadsheet → weekly priority list

**Problem:** Messy spreadsheet (Nick’s prospect/contact list) with no link to grant deadlines.

**Deliverable:** (1) Import spreadsheet/CSV into a simple prospect/contact model. (2) Use grant deadlines from this repo’s Salesforce (or stub). (3) One view: **actionable weekly priority list** — prospects and tasks by dates relevant to grant deadlines (e.g. proposals due, follow-up by, close date).

**Out of scope for week 1:** Network search, LinkedIn cross-reference, shared DB persistence.

**Spec (includes where to build and implementation order):** `product/fundraising-team/phases/week-1-prototype.md`.

---

## Slack-driven data entry & human verification

**Goal:** Team posts updates in Slack (messy OK); system proposes changes to Opportunity, Lead, Contact, Account, or Payment (Sage). **Nothing is written to the DB until a human confirms** — required for all entities, critical for Payments.

**Flow:** (1) Ingest from designated channel/DM. (2) Parse message → proposed pending change(s) for the right entity; store in review queue. (3) Weekly (or ad hoc) review in Bedrock: list of proposed updates with original message; **Confirm** (apply to Salesforce/Sage) or **Reject**/Edit. (4) On confirm, write to Salesforce or Sage; log who and when.

**Spec:** `product/fundraising-team/phases/slack-data-entry-and-review.md`.

---

## Custom reports (prompts + pre-built filters)

**Goal:** Useful reports without a full report builder. **V1:** Basic prompts (e.g. “Pipeline by stage this quarter,” “Payments last 30 days by account”) that map to saved reports or parameterized queries; pre-built filters (date range, stage, owner, account type, revenue stream, payment status); table/summary + CSV export. No complex joins or formula builder. **Later (optional):** Advanced report builder (Salesforce-style) for power users.

**Spec:** `product/fundraising-team/phases/custom-reports.md`.

---

## Software development standards

- **Secrets:** No keys or tokens in code/git; `.env` + `.gitignore` for env and data files. See `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`.
- **Version control:** Meaningful commits; agreed branch strategy (e.g. `main` + feature branches).
- **Docs:** Vision in `product/`; specs in `product/fundraising-team/raw-prds/prospect-dashboard/specs/` and `phases/`; keep changelog/last-updated where relevant.
- **Done criteria:** Each phase has clear acceptance criteria (e.g. week 1: weekly priority list driven by spreadsheet + grant dates).
- **Technical debt:** Prototype shortcuts (IndexedDB-only, no auth) documented so they’re not treated as production-ready.

---

## Fundraising best practices

- **Relationship-first:** Moves management and cultivation, not just transactions; notes, tasks, deadlines support “who to contact and when.”
- **Pipeline hygiene:** One source of truth; no duplicate opportunities; clear ownership; stale/past-due items surface as “needs attention.”
- **Confidentiality:** Donor/prospect PII and strategy are sensitive; access restricted; see Security below.
- **Capacity/wealth:** Used for prioritization only; stored minimally with access control.
- **Clean data:** Deduplication and clear source on import; soft deletes (e.g. archived) for audit trail.

---

## Database security and redundancy

**Security** (see `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`): Least privilege (admin, team, executive view); HTTPS + encryption at rest for prod DB/backups; PII minimized and access logged; no secrets in client. **Redundancy (production):** 3-2-1 backups; automated daily; restore tested periodically; read replica/failover where needed. **Prototype:** IndexedDB/in-memory is not production-grade; no backup requirement until we use server/PostgreSQL. **When Bedrock merges into learning platform:** Inherit that platform’s backup, auth, and RBAC. See `product/learning-platform-integration.md`.

---

## Checklist before calling “week 1” done

- [ ] Messy spreadsheet (or CSV) can be imported without errors; fields mapped to a simple prospect/contact model.
- [ ] Grant/opportunity deadlines (from this repo’s Salesforce-backed data or a stub) drive the weekly view.
- [ ] One view shows an **actionable weekly priority list** (prospects/tasks by dates relevant to grant deadlines).
- [ ] No secrets or CSV data committed to git; `.gitignore` covers `.env` and data files.
- [ ] Product docs updated if scope changed (this file, `overview.md`, and week-1 scope in phase docs).

---

## Requirements gaps (must fix before or during build)

Areas where the current docs are underspecified and would lead to bad or inconsistent code if ignored: **`product/REQUIREMENTS-GAPS-AND-STRUCTURE.md`**. Covers week 1 (prospect↔grant link, “this week” definition, CSV mapping, validation), Slack (entity resolution, pending change schema, conflicts, failures), custom reports (prompt→report catalog, filter semantics), network search (LinkedIn/prospect list schemas, dedupe), data model (stage alignment, ID authority, lead storage), and validation/errors. Use it to tighten specs before implementation.

---

## References

- `product/overview.md` — vision, capabilities
- `product/learning-platform-integration.md` — unified platform, data touchpoints
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md` — security
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md` — data model
- `product/fundraising-team/phases/week-1-prototype.md` — week 1 spec
- `product/fundraising-team/phases/slack-data-entry-and-review.md` — Slack + review
- `product/fundraising-team/phases/custom-reports.md` — custom reports
- `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md` — areas requiring more structure before build
