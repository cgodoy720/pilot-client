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
| **Short term** | This repo | **Slack-driven pipeline updates** (bot parses → in-thread confirm → Salesforce; unconfirmed → Automation Review queue); **custom reports** (basic prompts + pre-built filters); **Claude API intelligence** (prospect scoring, suggested actions); **Leads in Salesforce** (SF Lead as system of record; see home-page-spec §6.3). |
| **AI-writable fields & edit history** | This repo | **Field map:** which fields each object exposes to AI tooling (Task, Chatter, Opportunity, Lead, Contact, Account, Payment); all writes human-confirmed. **Edit history:** running markdown file per object so we know edit history on every record. See `product/fundraising-team/phases/ai-writable-fields-and-edit-history.md`. |
| **Stage-change checkpoints & rules** | This repo | **Checkpoints:** what must be true before an Opportunity stage or Lead status change (e.g. closed-won requires amount_confirmed). **Rules:** forward/backward moves, who can change, audit. See `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md`. |
| **Admin view** | This repo | **See other users' activities:** calendar, tasks, pipeline, automation review queue, and activity feed by user (admin role only). Supports oversight, coaching, and handoffs. See § Admin view below. |
| **Transcript enrichment agent** | This repo / learning platform | **Pre-extraction:** Agent ingests raw Fireflies transcripts and improves them using the knowledge graph, MCP, Drive, and other connectors (correct names/entities, suggest speaker IDs, resolve acronyms) before the transcript is included in the extraction pipeline. See `product/fundraising-team/raw-prds/prospect-dashboard/specs/transcript-pipeline.md` § Transcript enrichment agent. |
| **Medium term** | This repo → learning platform | Bedrock feature-complete here; begin integration: shared auth, API contracts, data model alignment. |
| **Long term** | Learning platform | Bedrock lives in unified app; one login, one nav; fundraising and learning data coexist with clear boundaries and shared identity. |

---

## Week 1 prototype: spreadsheet → weekly priority list

**Problem:** Messy spreadsheet (Nick’s prospect/contact list) with no link to grant deadlines.

**Deliverable:** (1) Import spreadsheet/CSV into a simple prospect/contact model. (2) Use grant deadlines from this repo’s Salesforce (or stub). (3) One view: **actionable weekly priority list** — prospects and tasks by dates relevant to grant deadlines (e.g. proposals due, follow-up by, close date).

**Out of scope for week 1:** Network search, LinkedIn cross-reference, shared DB persistence.

**Spec (includes where to build and implementation order):** `product/fundraising-team/phases/week-1-prototype.md`.

---

## Slack-driven pipeline updates & Automation Review

**Goal:** Team updates Salesforce from Slack in 3 seconds. A Slack bot parses natural language, proposes a structured change in-thread, and writes on confirmation. **Nothing is written to the DB until a human confirms.**

**Two paths, one guarantee:**

- **Fast path (Slack bot):** Team posts in `#pipeline-updates` → bot parses (rule-based, zero cost; AI fallback via Haiku, <$3/month) → proposes change in thread with current→proposed diff → user confirms via Slack button → writes to Salesforce immediately. Confirmed updates are logged as **auto-approved** in the Automation Review queue.
- **Integration hub (Automation Review):** Unified queue in Bedrock (see `home-page-spec.md` §3.4) for all automated sources: unconfirmed Slack proposals, GCal meeting matches, GDrive document detections, Gmail activity, Fireflies transcript summaries, and future Knowledge Graph / Learning Platform signals. Reviewed weekly (pipeline meeting) or ad hoc. Everything in-line editable.

**Spec:** `product/fundraising-team/phases/slack-data-entry-and-review.md`.

---

## Custom reports (prompts + pre-built filters)

**Goal:** Useful reports without a full report builder. **V1:** Basic prompts (e.g. “Pipeline by stage this quarter,” “Payments last 30 days by account”) that map to saved reports or parameterized queries; pre-built filters (date range, stage, owner, account type, revenue stream, payment status); table/summary + CSV export. No complex joins or formula builder. **Later (optional):** Advanced report builder (Salesforce-style) for power users.

**Spec:** `product/fundraising-team/phases/custom-reports.md`.

---

## Admin view: see other users’ activities

**Goal:** Allow users with an **admin** role to view another user’s home-style activity: their calendar & tasks, top prospects, action items, Active Comms / Inactive, and automation review queue (e.g. “view as Nick” or select user from a list). Supports oversight, coaching, coverage during leave, and handoffs.

**Scope:** Read-only view of the selected user’s data (opportunities they own, their calendar/tasks, their suggested matches and pending automation items). No impersonation for writes; admin actions (e.g. confirming a match on behalf of someone) should be auditable (who did what, when).

**Access:** Gated by role (e.g. `admin` or `fundraising_admin`); align with learning platform’s RBAC when merged. See security-requirements (least privilege, admin/team/executive view).

**Placement:** Dedicated route/screen (e.g. “Team activity” or “View as…”) or admin section in nav; can reuse Home page layout with a user selector and backend filtered by `OwnerId` / user identity.

**References:** `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`; home-page-spec for data sources (calendar, tasks, prospects, automation review).

---

## AI-writable fields & edit history per object

**Goal:** (1) Know exactly which fields on each object (Opportunity, Lead, Contact, Account, Task, Chatter, Payment) can be **proposed or written by AI** in the app — all such writes require human confirmation. (2) Maintain a **running markdown file per object instance** so we have a clear edit history on every record (who changed what, when, and whether an AI proposal was confirmed or rejected).

**Spec:** `product/fundraising-team/phases/ai-writable-fields-and-edit-history.md` — field map by object, edit-history convention (one file per record, append-only, example format), and implementation notes. Prototype can keep history in DB with markdown export; post-merge align with learning platform audit trail.

---

## Stage-change checkpoints & rules

**Goal:** Before any **Opportunity** stage or **Lead** status change (manual or AI-confirmed), enforce **checkpoints** (e.g. closed-won only if amount_confirmed set) and **rules** (forward/backward moves, who can change, audit). Ensures pipeline hygiene and consistent reporting.

**Spec:** `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md` — Opportunity stage order and checkpoints per target stage; Lead status order and checkpoints; rules for who can change, skipping stages, closed = terminal; implementation checklist. Stage/status changes are always logged in the object’s edit-history file.

---

## Transcript enrichment agent (pre-extraction)

**Goal:** Before raw Fireflies meeting transcripts are fed into the extraction pipeline, a **dedicated agent** improves them by comparing the transcript to the **knowledge graph** (contacts, accounts, opportunities, past meeting extracts) and to **MCP, Drive, and other connectors**. The agent corrects names/entities, suggests speaker IDs from contacts, resolves acronyms, and fixes obvious errors so the **improved transcript** is what gets included in extraction — raising quality of downstream structured extracts.

**Placement:** Phase 4+ with the rest of the meeting transcript pipeline. Spec: `product/fundraising-team/raw-prds/prospect-dashboard/specs/transcript-pipeline.md` (§ Transcript enrichment agent). MCP/Drive connector details TBD per environment.

---

## Software development standards

- **Secrets:** No keys or tokens in code/git; `.env` + `.gitignore` for env and data files. See `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`.
- **Salesforce auth:** A **Salesforce connection exists in Settings** (user OAuth connect/disconnect). The backend may still use a server-side SF config (e.g. `config.py`) with shared credentials as fallback. **Eventually:** remove that SF config with secrets and use **user-based Salesforce connection only** where possible (per-user OAuth from Settings). See security-requirements § Salesforce connection (current vs target).
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
- **Admin view** — see § Admin view above (other users’ activities; admin role only)
- `product/fundraising-team/phases/ai-writable-fields-and-edit-history.md` — AI-writable field map and edit-history markdown per object
- `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md` — checkpoints and rules for Opportunity stage and Lead status changes
- `product/fundraising-team/phases/home-page-spec.md` — Home page (calendar, prospects, automation review)
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/transcript-pipeline.md` — meeting transcript pipeline + transcript enrichment agent (pre-extraction)
- `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md` — areas requiring more structure before build
