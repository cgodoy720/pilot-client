# Joanna's Handoff Doc
_Last updated: 2026-03-05_

This doc captures the state of the build, key architectural decisions, and the roadmap as of Joanna's leave. Read this alongside the PRD (`20251113 Job tracking data pipelines PRD.md` on Joanna's desktop).

## Branch Status
- Both `pilot-client` and `test-pilot-server` `joanna` branches have been merged with `upstream/main` (cgodoy720) as of 2026-02-27
- Upstream remotes are configured: `git remote add upstream git@github.com:cgodoy720/[repo].git`
- **Sputnik = `SalesTracker` page** (`src/pages/SalesTracker/`) — tabs: Dashboard, All Leads, Job Postings, Leaderboard, Staff Inbox, Builder Insights
- **Staff Inbox** and **Builder Insights** are both tabs in Sputnik (`SalesTracker.jsx`)

---

## How to Run the Server

```bash
cd test-pilot-server
npx nodemon server.js
```

- Runs on port 4001 (or as configured in `.env`)
- Uses `pg-promise` for all DB queries (`db.any()`, `db.one()`, `db.oneOrNone()` — **not** `db.query()`)
- DB import: `require('../db/dbConfig')`

## Environment Variables (`.env`)
Key vars to have set:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Render) |
| `JWT_SECRET` | Auth token signing |
| `ANTHROPIC_API_KEY` | Claude Haiku calls for company enrichment |
| `SLACK_WEBHOOK_URL` | Slack notifications for intro requests |
| `VITE_API_URL` | (frontend) API base URL |

---

## Key Accounts (for testing)

| Role | Email | Notes |
|---|---|---|
| Staff | `joanna+1@pursuit.org` | user_id: 10 |
| Staff | `jp@pursuit.org` | user_id: 158 |
| Builder | `joanna+2@pursuit.org` | pw: Pursuit1234! |

---

## Database

- **Host**: Render — `dpg-cvm52hq4d50c7380hh70-a.oregon-postgres.render.com`
- **State as of 2026-02-23**: 12,637 contacts, 13 staff members, Joanna has 2,309 LinkedIn connections imported

### Employment Engine Tables
| Table | Purpose |
|---|---|
| `contacts` | Unified people registry (staff network) |
| `staff_contact_relationships` | Who on staff knows whom (source, strength) |
| `intro_requests` | Builder requests for staff-brokered introductions |
| `job_postings` | Staff-shared job openings |
| `job_applications` | Builder job application history |
| `networking_activities` | Builder outreach activity log |
| `outreach` | Staff outreach records (extended with `interaction_log` JSONB) |
| `companies` | Company profiles with enriched industry/size/stage data |

---

## What's Been Built (Employment Engine)

### Shipped as of 2026-03-03

#### Backend endpoints (`/api/employment-engine/`)
| Method | Route | Who | What |
|---|---|---|---|
| GET | `/network` | Builders | Browse staff contact network (filter by company, industry, size) |
| GET | `/network/:contactId` | Builders | Single contact detail |
| POST | `/intro-requests` | Builders | Submit intro request (quality gates enforced) |
| GET | `/intro-requests` | Both | List intro requests (scoped by role) |
| PUT | `/intro-requests/:id` | Both | Staff respond; builders withdraw |
| GET | `/builder-activity` | Staff | Builder company targeting dashboard (last 60 days) |
| GET | `/jobs` | Builders | Browse shared job postings |
| POST | `/jobs/:jobId/interest` | Builders | Mark interest in a job |
| POST | `/outreach/:outreachId/interactions` | Staff | Log interaction event |
| POST | `/import-linkedin` | Staff | Upload LinkedIn CSV → create contacts + relationships |
| POST | `/enrich-companies` | Staff | Trigger background AI company enrichment |
| GET | `/enrich-status` | Staff | Check enrichment progress |
| GET | `/filter-options` | All | Return valid industries/size buckets for dropdowns |
| GET | `/builder-insights?period=7\|30\|all` | Staff | Top companies/industries builders are targeting + suggested intros |
| POST | `/enrich-builder-companies` | Staff | Upsert builder-signal companies into `companies` table and trigger enrichment |

#### Key service files
- `services/slackService.js` — Slack webhook notifications (new intro requests + status updates)
- `services/enrichmentService.js` — Claude Haiku calls to enrich company industry/size/stage
- `controllers/employmentEngineController.js` — All employment engine logic

#### Intro Request Quality Gates (enforced on submission)
Builders must provide: `specific_ask`, `request_context` (100+ chars), `builder_preparation` (80+ chars), `demo_url`, and check all four `readiness_checks`.

#### LinkedIn Import / Dedup Logic
Dedup key priority: `linkedin:<slug>` → `email:<addr>` → `name_company:<name>_<company>`
- The Feb-19 bulk import used `linkedin:<slug>` keys
- LinkedIn CSV exports do **not** include a URL column — the controller handles cross-format matching via name+company fallback

#### Company Enrichment
- Background process fires Claude Haiku calls per company
- Module-level `isEnriching` flag prevents duplicate runs
- Enriches: `industry`, `company_size`, `stage`, `description`

#### Builder Insights tab (Sputnik) — shipped 2026-03-05
- **`src/pages/SalesTracker/components/BuilderInsights.jsx`** — ~650 lines
- Three panels: Top Companies, Top Industries, Suggested Introductions
- Time filter buttons: Last 7 Days / Last 30 Days (default) / All Time
- **Top Companies**: ranked list with signal badge breakdown. **Click any row** → lazy-fetches `/builder-insights/company-detail` → shows per-builder signal list (applied where, networked with whom, intro requested).
- **Top Industries**: ranked list from enriched company data + "Enrich" button. **Click any row** → lazy-fetches `/builder-insights/industry-detail` → shows companies in that industry with per-builder signals.
- **Suggested Introductions**: **Click a card** to expand → "Builders Targeting" section (amber pills — click a builder pill to see their signals) + "Staff Contacts" section (clickable chips opening **ContactModal**).
- Drill-down caches keyed by company/industry name; cleared on period change to avoid stale data.
- Uses `useAuth()` for token — never `localStorage.getItem('token')`

---

## Frontend Pages (pilot-client, relevant to employment engine)

| Page | Path | Who sees it |
|---|---|---|
| `PathfinderNetwork` | `/pathfinder/network` | Builders — browse staff contacts, filter by industry/size, request intros |
| `PathfinderNetworking` | `/pathfinder/networking` | Builders — view their intro requests and outreach activity |
| `PathfinderJobs` | `/pathfinder/jobs` | Builders — browse staff-shared job postings |
| `StaffNetworkDashboard` | `/staff/network` | Staff — manage their contacts, upload LinkedIn CSV, view enrichment status, "My Network" tab |

Note: The **Jobs tab was intentionally removed from the Pathfinder nav** (commit `b4932d2`) — builders access jobs at the direct route but it's not surfaced in the main nav for now.

---

## What's Next (Roadmap)

These items come from the PRD and Joanna's latest thinking. Roughly prioritized:

### 1. Staff Actions for Builders _(P1)_
- Staff can proactively recommend an intro to a specific builder
- Staff can push a job posting directly to a builder whose background matches

### 3. Staff Advocacy for Builder Projects _(P1)_
- Once a builder's project is on the lookbook, staff can mobilize their network to share/amplify it
- Requires lookbook integration

### 4. Personalized Recommendations for Builders _(P2)_
- Builders get pushed job recs based on interests/background (vs. flat list browsing)
- Builders get suggested contacts from the network based on target companies

### 5. Program Analytics Dashboard _(P1–P2)_
- Trends by industry, role/function, company size
- Funnel analysis: application → interview → offer conversion
- Hustle efficacy: outreach volume, demo counts, response rates, what's working

### 6. Market Intelligence _(P2 / agentic)_
- Automated pulse on hiring trends, mapped to Pursuit's efforts
- Identify and test focus areas (e.g., "push ops roles this quarter")

### 7. Builder Profiles _(future)_
- Rich profiles synthesized from retro/standup responses, assessments, staff POV
- Powers better matching and recommendations across all of the above

---

## Architectural Notes & Gotchas

- **pg-promise**: Always use `db.any()`, `db.one()`, `db.oneOrNone()`. Never `db.query()`.
- **Auth**: `useAuth()` in frontend returns `{ token, user }` from AuthContext. Backend uses `authenticateToken` middleware.
- **API base URL**: Frontend reads from `import.meta.env.VITE_API_URL` — set in `.env` at `pilot-client` root.
- **Slack**: Webhook URL is in `.env` as `SLACK_WEBHOOK_URL`. Failures are caught silently (never break the main request).
- **Branch**: Both repos are on branch `joanna`.
- **Server**: Run with `npx nodemon server.js` (not `node server.js`).
- **SSL**: `PG_SSL=true` must be set in `.env` — wired in `db/dbConfig.js`. Without it, parallel queries that open new pool connections fail with "SSL/TLS required".
- **`users` table**: Uses `first_name` and `last_name` columns — **not** `full_name`.

---

## Questions?
Reach Joanna on Slack (when she resurfaces from new-parent mode 👶).
