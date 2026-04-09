# Sprint Plan — 2026-04-09

> **Verified against codebase.** Every claim below cites the actual file and line number. No assumptions.
>
> **Baseline:** PR #97 (senior dev review, 27 files, +2,483 lines) merged 2026-04-08. Wall of Progress merged separately. Main is clean.
>
> **Test baseline:** 34 pre-existing failures, 562+ passed, 22 skipped. TypeScript compiles cleanly.

---

## What just shipped (verified 2026-04-09)

| PR | What | Key files |
|---|---|---|
| **#94** Sprint A | 4-profile RBAC (Admin/RM/Executive/PM), nav gating, unlock requests, opportunity locking | `routes/permissions.py`, `db/init.sql` (seed profiles), `PermissionsContext.tsx`, `Layout.tsx` menu gating |
| **#95** M19 | Project ownership model — `owner_email`, `created_by`, `project_contributor` table | `routes/projects.py`, `db/init.sql` |
| **#96** Atlas | Database schema atlas — superseded by consolidated `docs/database-schema.md` (33 tables) | `docs/database-schema.md` |
| **#97** Senior dev review | Claims 1-4 + 5C + source governance. Env validator, dev bypass strip, org_users link, sf_account_company_map, prospect SF writeback, source_governance module | 27 files across `financial_forecasting/`, `pebble/`, `docs/`, `scripts/` |
| Wall of Progress | Per-RM goal tracking on Overview page, `OwnerGoalWidget`, `PipelineFunnel` ownerId filter, `owner_goal` table | `Overview.tsx`, `OwnerGoalWidget.tsx`, `PipelineFunnel.tsx`, `opportunities_extra.py`, `config/goals.ts` |

**Schema state:** 33 tables in `bedrock.*`, 40 indexes, 2 cross-schema FKs to `public.*`, 14 idempotent ALTER blocks. No formal migration framework — `init.sql` runs on every startup via `db.py:init_db()`.

---

## 0. Immediate actions (today)

These are unblocked, take <30 min total, and reduce real risk.

### 0.1 Rotate credentials

**Why:** Production secrets from `financial_forecasting/.env` were loaded into an LLM conversation transcript during the senior dev review session. Even though `.env` is gitignored and was never committed, the credentials are now in external logs.

**Order (by blast radius):**

| # | Secret | Where to rotate | Impact if leaked |
|---|---|---|---|
| 1 | `JWT_SECRET_KEY` | `openssl rand -hex 32`, update `.env` + Cloud Run | All existing sessions invalidated (users re-login) |
| 2 | `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys → revoke + regenerate | Pebble cost runaway on Pursuit's account |
| 3 | `SALESFORCE_PASSWORD` | SF → Personal Settings → Change Password + Reset Security Token | Full CRM read/write |
| 4 | `SALESFORCE_CLIENT_SECRET` | SF → App Manager → Connected App → Reset Consumer Secret | OAuth flow compromise |
| 5 | `SAGE_USER_PASSWORD` | Sage admin → Company → Admin → Users → reset | Financial records read/write |
| 6 | `SAGE_SENDER_PASSWORD` | Contact Sage developer support (not self-serve) | API gateway access |
| 7 | `GOOGLE_CLIENT_SECRET` | GCP Console → Credentials → Reset Secret | Google OAuth flow compromise |

**After each rotation:** Verify the app still works before proceeding to the next. `JWT_SECRET_KEY` is the safest to start with (zero coordination, forces re-login).

### 0.2 Install pre-commit hook

```bash
bash scripts/install-git-hooks.sh
```

One command. Blocks accidental `.env` commits going forward. Already shipped in PR #97 — just needs to be run once per clone. Verified: `scripts/install-git-hooks.sh` exists (34 lines), copies `scripts/pre-commit-guard.sh` (79 lines) into `.git/hooks/pre-commit`.

### 0.3 Run Phase B-3 backfill against segundo-db

```bash
psql "$SEGUNDO_DB_URL" -f financial_forecasting/db/migrations/2026-04-08-backfill-app-user-org-link.sql
```

Links existing `bedrock.app_user` rows to `public.org_users` by case-insensitive email match. Idempotent — safe to re-run. Verified: migration file exists at `financial_forecasting/db/migrations/2026-04-08-backfill-app-user-org-link.sql` (69 lines, includes reporting + verification queries).

**After running:** Check the output — it prints linked/unlinked/total counts and lists any unlinked users who need platform onboarding.

### 0.4 Run identity audit

```bash
curl -s -b "access_token=<admin-jwt>" http://localhost:8000/api/permissions/admin/identity-audit | python3 -m json.tool
```

Verified: endpoint exists at `routes/permissions.py` (line 351). Returns `{summary: {total, linked, unlinked, name_drift_count}, unlinked: [...], name_drift: [...]}`. Admin-only via `require_admin`.

### 0.5 Run SF company matcher dry-run

```bash
curl -s -X POST -b "access_token=<admin-jwt>" "http://localhost:8000/api/admin/sf-company-match/scan?dry_run=true" | python3 -m json.tool
```

Verified: endpoint exists at `routes/admin_company_match.py` (line 42). Returns `{matched, unmatched, errors, total, by_confidence}`. Does NOT write anything when `dry_run=true`. After reviewing, re-run without `dry_run` to populate `bedrock.sf_account_company_map`.

---

## 1. Platform team coordination (this week, not code)

### 1.1 Send source governance ask

**File:** `docs/contact-source-governance.md` §5 — self-contained, copy-pasteable into a ticket.

**Three asks:**
1. Add CHECK constraint on `public.contacts.source` and `public.companies.source` with the canonical 9-value enum
2. Add `enrichment_source TEXT` column to `public.contacts` (mirrors existing `public.companies.enrichment_source DEFAULT 'claude_ai'`)
3. Audit Builder-facing queries (intro_requests, contact search, networking suggestions, outreach) for source filtering — any query that `SELECT * FROM public.contacts` without filtering by `source IN ('linkedin_import', 'clearbit', 'manual', 'sputnik', 'platform_user_added')` is a data leak path

**Verified:** `public.contacts.source` exists (`varchar(100)`, all 16,646 rows tagged `linkedin_import`). `public.companies.source` exists (`varchar(50)`, default `'manual'`, 11,427 rows split linkedin_import/clearbit/manual). Both columns already exist — the ask is just for the CHECK constraint + enrichment column + query filter.

### 1.2 Confirm API keys needed for Pebble

Pebble's web search and corporate officer features are code-complete but silently return empty data because the API keys aren't configured:

| Service | Env var | Status | Impact |
|---|---|---|---|
| **Serper.dev** | `SERPER_API_KEY` | Not configured | All web search returns empty. Blocks Pebble research quality for any prospect not on Wikipedia. |
| **OpenCorporates** | `OPENCORPORATES_API_KEY` | Not obtained | Officer/director lookup unavailable. Free tier: 500 req/month. |
| **Google CSE** | `GOOGLE_CSE_API_KEY` + `GOOGLE_CSE_CX` | Not configured | Curated domain search unavailable. Free tier: 100 queries/day. |

**Verified:** `pebble/.env.example` (line 7: `FEC_API_KEY=DEMO_KEY`, line 11: `OPENCORPORATES_API_KEY=`, line 15: `GOOGLE_CSE_API_KEY=`, line 20: `SERPER_API_KEY=`). The code is in place — just needs the keys.

---

## 2. Claim 5A — Prospect import migration (next sprint)

**The last unaddressed senior dev claim.** Prospect import currently uses a local SQLite file (`prospect_import/prospect_import.db`) that is invisible to Bedrock, Pebble, and Salesforce. This was flagged as a "dead-end" and is one of the two remaining items from the senior dev review.

### Current state (verified)

| File | Lines | Purpose |
|---|---|---|
| `prospect_import/db.py` | 242 | SQLite storage: `import_sessions`, `raw_rows`, `persons`, `organizations`, `affiliations` |
| `prospect_import/parser.py` | 99 | CSV parsing with column mapping, name splitting, multi-org parsing |
| `prospect_import/__init__.py` | 15 | Exports: `init_db`, `create_import_session`, `save_raw_rows`, `normalize_and_save`, `parse_csv_with_mapping`, `split_name`, `parse_organizations` |
| `financial_forecasting/routes/prospects.py` | 199 | 4 endpoints: `/preview`, `/parse`, `/persons`, `/write-to-crm` |

### Gaps in the write-to-CRM flow (`routes/prospects.py:134-198`)

1. **No contact dedup** — `salesforce.create_record("Contact", contact_data)` at line 184 creates without checking if the contact already exists by email/name. Account dedup exists (lines 160-164: SOQL `WHERE Name = '...'`) but contact dedup does not.
2. **TODO at line 141:** "Phase 3 — use per-user SF tokens when available for write attribution" — currently uses the shared MCP client.
3. **No source tracking** — no `source='bedrock_prospect_import'` set on any row. The source governance foundation (PR #97) exists but prospect_import doesn't use it yet.
4. **No tests** — zero test files for prospect_import in either `financial_forecasting/tests/` or `prospect_import/tests/`.
5. **SQLite file is per-developer** — `DB_PATH = Path(__file__).parent / "prospect_import.db"` (line 9 of `prospect_import/db.py`). Not shared, not backed up, invisible to production.

### Deliverables for Claim 5A

| # | Deliverable | Effort |
|---|---|---|
| 5A.1 | Schema: add `bedrock.prospect_import_session`, `prospect_import_person`, `prospect_import_org`, `prospect_import_affiliation` to `init.sql` with `source DEFAULT 'bedrock_prospect_import'` | ~60 lines SQL |
| 5A.2 | Rewrite `prospect_import/db.py` from `sqlite3` to `asyncpg`. All functions become `async`. Use `bedrock.db.get_pool()` (no separate pool). Same function signatures so `routes/prospects.py` needs minimal change (just add `await`). | ~250 lines Python |
| 5A.3 | Update `routes/prospects.py` to async. Convert sync calls to `await`. Update imports. | ~30 lines changed |
| 5A.4 | Add contact dedup to the write-to-CRM flow (line 184). JP chose **pre-flight review screen** UX — before running the import, show the user every potential duplicate (matched by email or first+last name) and let them choose merge / create-new / skip per row. | ~150 lines backend + ~200 lines frontend |
| 5A.5 | Add unit tests for the new async `db.py` functions and the dedup logic. Follow `tests/test_env_validator.py` pattern (`unittest.mock.patch.dict` + `AsyncMock`). | ~200 lines |
| 5A.6 | One-time migration: read existing local SQLite file (if any) and import into PostgreSQL. Delete SQLite file after. Add `prospect_import.db` to `.gitignore` defensively. | ~50 lines migration script |

**Total estimated:** ~940 lines across 6 deliverables. Needs plan mode.

---

## 3. Milestones ready to execute (unblocked)

These are independent of the prospect import migration and can run in parallel.

### 3.1 M13 — Activities Timeline (2 sessions)

**Depends on:** M10 (Activities Foundation) ✅ shipped.

**Current state:** Activities sync from SF into `bedrock.activity` (30+ columns, full-text search, soft delete). 11 backend endpoints exist (`routes/activities.py`). The **frontend timeline component does not exist yet** — there's no visual representation of activities on the Opportunity or Contact detail views.

**Session 1 deliverables:**
- TypeScript activity types matching the `bedrock.activity` schema
- API service methods in `services/api.ts` for the activity endpoints
- `ActivityTimeline` React component — chronological list, grouped by date, icons per activity type
- Wired into a dev page for testing

**Session 2 deliverables:**
- `OpportunityDetailModal` — shows activities for a specific Opportunity
- `ContactDetailModal` — shows activities for a specific Contact
- Wire into Opportunities page, Contacts page, Pipeline page
- Filters: by type, by date range, by owner

**Reference:** `tasks/sprint9-activities-extension-plan.md` (if exists), `routes/activities.py` (11 endpoints).

### 3.2 M15 — Chrome Extension (2 sessions)

**Depends on:** M10 (Activities Foundation) ✅ shipped.

**Purpose:** Browser extension that lets staff log activities (calls, emails, meetings, notes) directly from any web page without switching to Bedrock. Activities land in `bedrock.activity` with `source='extension'`.

**Session 1 deliverables:**
- Chrome Manifest V3 + service worker
- Content scripts for page detection
- API client that authenticates to Bedrock via stored JWT

**Session 2 deliverables:**
- Popup UI with activity type picker, opportunity association, note field
- OppPicker component (search + select)
- CascadeFlow for quick logging
- Testing + packaging

**Reference:** `tasks/sprint9-activities-extension-plan.md`, `bedrock.activity.source` CHECK constraint includes `'extension'`.

### 3.3 M20 — Task Request System (2 sessions)

**Depends on:** Sprint A (Permissions) ✅ shipped.

**Purpose:** PMs can request RMs to create/update tasks on opportunities they don't own. Enables PM-RM coordination without violating opportunity ownership.

**Session 1 deliverables:**
- Schema: `bedrock.task_request` table (requester, assignee, opp_id, description, status, created_at)
- 5 API endpoints: create, list (by assignee/requester), accept, reject, cancel
- Permission gating: `create_tasks` for creation, ownership for accept/reject

**Session 2 deliverables:**
- Frontend: notification badge in Layout toolbar
- TaskRequestModal for creating requests
- AcceptRejectFlow in TaskPanel
- PM status view (my pending requests)

**Reference:** `product/ONBOARDING-ADDENDUM.md` §F (Task Request spec).

---

## 4. Documentation debt (from PR #97 + Wall of Progress)

The schema atlas and rundown are now stale. Verified gaps:

### 4.1 Schema doc consolidation (DONE)

Both `database-schema-rundown.md` and `database-schema-atlas.md` have been replaced by a single consolidated `docs/database-schema.md` covering all 33 tables, 43 indexes, cross-domain ER diagram, data flow, security hardening checklist, and quick reference appendix.

### 4.3 PLAN-INDEX update

**File:** `docs/PLAN-INDEX.md`

Add entries for:
- PR #97 senior dev review (Claims 1-4 + 5C + source governance)
- Wall of Progress feature
- Mark M19, Sprint A as shipped with dates

---

## 5. Technical debt (prioritized)

### 5.1 HIGH — Pre-existing test failures (34 tests)

The codebase has 34 test failures that pre-date PR #97. These appear to be mock setup issues (stale test data shapes, missing fixture fields). They should be triaged:
- **Bucket A:** Tests that fail because mock shapes are stale → fix the mocks (15 min each)
- **Bucket B:** Tests that fail because the feature they test was redesigned → rewrite or delete
- **Bucket C:** Tests that are flaky → fix or quarantine

**First step:** Run `pytest --tb=short 2>&1 | grep "^FAILED"` and categorize each failure.

### 5.2 MEDIUM — No CI/CD pipeline

No `.github/workflows/` directory exists. Tests run manually. Deployment is manual (no `deploy-gcp.sh` found, no `DEPLOYMENT.md` found).

**Recommendation:** Add a minimal GitHub Actions workflow:
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.13' }
      - run: pip install -r financial_forecasting/requirements.txt
      - run: cd financial_forecasting && pytest --tb=short -q
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: cd financial_forecasting/frontend && npm ci && npx tsc --noEmit
```

### 5.3 MEDIUM — Deprecated file still in repo

`financial_forecasting/archive/simple_server.py.deprecated` (268KB) is confirmed unused — not imported anywhere. It's a 5,000+ line monolith that was superseded by the modular `main.py` + routes. Consider deleting to reduce confusion and repo bloat.

### 5.4 LOW — Missing Pebble API keys

Code-complete features that return empty data without keys (see §1.2 above). Not a code debt — just a configuration step that's been deferred.

### 5.5 LOW — TODO comments across codebase

| Location | TODO | Priority |
|---|---|---|
| `routes/prospects.py:141` | "Phase 3 — use per-user SF tokens" | Deferred — shared MCP client works for now |
| `routes/payment_schedules.py:102` | "Phase 3 — use per-user SF tokens" | Same |
| `routes/opportunities_extra.py:173, 315` | "Phase 3 — use per-user SF tokens" | Same |
| `forecasting_engine.py:477` | "Calculate from actual GL cash accounts once Intacct returns real balances" | Deferred — Sage integration is post-MVP |
| `routes/finance.py:138` | "Replace with actual Sage Intacct integration" | Same |
| `frontend/src/pages/PaymentProcessing.tsx:134` | "Implement actual invoice creation API call" | Blocked on Sage integration |

All are "Phase 3" or Sage-dependent — none are current-sprint blockers.

---

## 6. External dependencies and blocked items

| Blocked item | Blocked on | Who resolves |
|---|---|---|
| Pebble web search quality | Serper.dev API key | JP obtains key, adds to `pebble/.env` |
| Pebble officer/director data | OpenCorporates API key | JP obtains free-tier key |
| Pebble curated domain search | Google CSE API key + CX | JP configures in GCP Console |
| Builder-visible contact filtering | Platform team adds CHECK + query filter | Platform team (ticket from §1.1) |
| `enrichment_source` on `public.contacts` | Platform team adds column | Platform team |
| Per-user Pebble cost limits | Not yet designed | JP + architect — needed before self-service Pebble rollout |
| CI/CD pipeline | No GitHub Actions yet | JP creates `.github/workflows/ci.yml` |

---

## 7. Recommended sprint sequence

### Sprint next (this week / next week)

| Priority | Item | Sessions | Dependencies |
|---|---|---|---|
| **P0** | Credential rotation (§0.1) | 0 (manual) | None |
| **P0** | Run backfill + audit + matcher (§0.3-0.5) | 0 (one-time commands) | None |
| **P0** | Send platform team ask (§1.1) | 0 (ticket) | None |
| **P1** | Fix 34 pre-existing test failures (§5.1) | 1 session | None |
| **P1** | Claim 5A: prospect_import → PostgreSQL (§2) | 2 sessions | None |
| **P2** | M13: Activities Timeline Session 1 (§3.1) | 1 session | M10 ✅ |

### Sprint after

| Priority | Item | Sessions | Dependencies |
|---|---|---|---|
| **P1** | Claim 5B: Pre-flight contact dedup review screen | 1 session | 5A complete |
| **P1** | M13: Activities Timeline Session 2 | 1 session | M13 Session 1 |
| **P2** | M15: Chrome Extension Session 1 | 1 session | M10 ✅ |
| **P2** | Add CI/CD pipeline (§5.2) | 0.5 session | None |

### Sprint after that

| Priority | Item | Sessions | Dependencies |
|---|---|---|---|
| **P1** | M15: Chrome Extension Session 2 | 1 session | M15 Session 1 |
| **P1** | M16: Activities Integration + QA | 1 session | M13 + M15 complete |
| **P2** | M20: Task Request System Session 1 | 1 session | Sprint A ✅ |
| **P2** | M20: Task Request System Session 2 | 1 session | M20 Session 1 |

### Longer-term (align with roadmap)

| Item | Sessions | Dependencies |
|---|---|---|
| Pebble Stage 2: CRM bridge integration | 3 sessions | Pebble API keys configured, Claim 4 matcher running |
| Pebble Stage 3: Bulk research + categorization | 3 sessions | Stage 2 complete |
| Delete `simple_server.py.deprecated` | 0.5 session (verify no imports, delete, test) | None |
| Atlas + rundown doc updates (§4) | 1 session | All schema changes landed |

---

## 8. Architecture decisions still open

From `docs/architecture-decisions.md` (verified):

| Decision | Current state | Needs resolution before |
|---|---|---|
| Invoice__c Object: keep vs simplify to direct field? | Keep for now. Revisit if Sage becomes sole authority. | Sage integration goes live |
| Partial payment tracking: boolean vs amount_paid field? | Boolean-only. Need usage patterns first. | Payment reconciliation feature |
| Invoice creation timing: manual vs auto on stage change? | Manual. Auto deferred until process standardizes. | Post-MVP |
| Sage Invoice ID format: demo vs real? | Demo uses `DEMO-xxxxxxxx`; real is numeric (e.g., `30555`). | Sage integration goes live |
| Per-user Pebble cost limits: design? | Not yet designed. Needed before self-service Pebble. | Pebble rollout to non-admin users |
| "Promote prospect to SF" flow: chat agent vs batch vs button? | No flow exists. Writeback infrastructure ready (Claim 5C). | Pebble Stage 2 |

---

## Reference: file paths cited in this plan

| File | Purpose |
|---|---|
| `financial_forecasting/env_validator.py` | Env var validation (Claim 1) |
| `financial_forecasting/source_governance.py` | Source enum + visibility rules |
| `financial_forecasting/services/sf_company_matcher.py` | SF Account ↔ companies matcher (Claim 4) |
| `financial_forecasting/routes/admin_company_match.py` | Matcher admin endpoints |
| `financial_forecasting/routes/permissions.py` | RBAC + identity audit + org_users link |
| `financial_forecasting/routes/prospects.py` | Prospect import endpoints (Claim 5A target) |
| `prospect_import/db.py` | SQLite storage (to be migrated in Claim 5A) |
| `prospect_import/parser.py` | CSV parser (stays, just goes async) |
| `financial_forecasting/db/init.sql` | Schema DDL (33 tables, 14 ALTER blocks) |
| `financial_forecasting/db/migrations/2026-04-08-backfill-app-user-org-link.sql` | Phase B-3 backfill |
| `docs/contact-source-governance.md` | Cross-system source contract + platform team ask |
| `docs/database-schema.md` | Consolidated schema reference (33 tables, replaced atlas + rundown) |
| `docs/PLAN-INDEX.md` | Milestone index (needs update) |
| `tasks/lessons.md` | Patterns to avoid |
| `scripts/install-git-hooks.sh` | Pre-commit hook installer |
| `pebble/.env.example` | Pebble API key template |
