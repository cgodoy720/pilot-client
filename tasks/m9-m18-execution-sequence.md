# Complete Execution Sequence: M9 → M18

**Purpose**: Definitive execution order for all remaining milestones, database-schema-first.
**Context**: Dev team reviewing schema today. Going live on segundo-db next week. JP executing this weekend.
**Decision**: Pebble stays Python/FastAPI (performance + security advantages for I/O-bound LLM workload).

---

## Execution Sequence

### Step 1: M9 — Complete Database Schema Deployment

**Scope (expanded)**: Schema qualification of existing SQL + ALL new table DDL in one step.

**What gets done:**
1. Prefix all 93 existing SQL statements across 7 files with `bedrock.`
2. Add `bedrock.activity` table DDL (1 table, indexes, FTS trigger, updated_at trigger)
3. Add 12 `bedrock.pebble_*` table DDLs (indexes, FKs, updated_at triggers for 4 tables)
4. Update `database-schema-rundown.md`:
   - Add activity table documentation (Section 1.5)
   - Add missing `project_opportunity` table (gap found — exists in init.sql but not in schema doc)
   - Update Sprint Roadmap section to use M9-M18 numbering
   - Note: Pebble stays Python/FastAPI (PRD Node.js reference was about target platform, not Pebble)
5. Verify against segundo-db: `SELECT tablename FROM pg_tables WHERE schemaname = 'bedrock';` → 23 tables

**Files modified:**
- `financial_forecasting/db/init.sql` — prefix existing DDL + append activity + pebble tables
- `financial_forecasting/db/seed.sql` — prefix existing seed data
- `financial_forecasting/routes/projects.py` — prefix 14 SQL statements
- `financial_forecasting/routes/permissions.py` — prefix 23 SQL statements
- `financial_forecasting/routes/sf_dependencies.py` — prefix 4 SQL statements
- `financial_forecasting/main.py` — prefix 3 SQL statements
- `financial_forecasting/routes/ai.py` — prefix 1 SQL statement
- `docs/database-schema-rundown.md` — add activity table, add project_opportunity, update sprint references

**Tables created on segundo-db (23 total):**

Existing Bedrock (10):
```
bedrock.project
bedrock.workstream
bedrock.milestone
bedrock.project_task
bedrock.sf_task_dependency
bedrock.sf_task_project
bedrock.project_opportunity
bedrock.permission_profile    ← seeded with Admin/Fundraiser/Manager
bedrock.app_user
bedrock.opportunity_lock
```

New — Activity (1):
```
bedrock.activity              ← soft delete, FTS, FK to project_task
```

New — Pebble (12):
```
bedrock.pebble_profiles
bedrock.pebble_research_sessions
bedrock.pebble_feedback
bedrock.pebble_harness_log
bedrock.pebble_source_scores
bedrock.pebble_api_cache
bedrock.pebble_chat_conversations    ← needs updated_at trigger
bedrock.pebble_chat_messages         ← FK to chat_conversations
bedrock.pebble_research_batches      ← needs updated_at trigger
bedrock.pebble_batch_prospects       ← FK to research_batches, needs updated_at trigger
bedrock.pebble_conflict_log          ← FK to research_sessions
bedrock.pebble_scratchpad            ← FK to research_sessions, needs updated_at trigger
```

**Bug caught during consolidation**: 4 pebble tables have `updated_at` columns but M11 plan didn't include triggers. Must add standalone `set_updated_at()` triggers for: pebble_chat_conversations, pebble_research_batches, pebble_batch_prospects, pebble_scratchpad.

**Safety verification:**
- FK ordering: all referenced tables created before referencing tables ✅
- IF NOT EXISTS on all CREATE TABLE/INDEX — idempotent ✅
- Empty tables have zero impact on running application ✅
- No circular FKs, no cross-group FKs (activity ↔ pebble) ✅

**Pre-deployment check:**
```sql
-- Verify bedrock schema is empty before first run
SELECT tablename FROM pg_tables WHERE schemaname = 'bedrock';
-- Should return 0 rows

-- After running init.sql
SELECT tablename FROM pg_tables WHERE schemaname = 'bedrock' ORDER BY tablename;
-- Should return 23 rows
```

**Detailed M10 plan**: `tasks/m10-activities-foundation-plan.md` (activity table schema, all decisions, concurrency model)
**Pebble table DDL source**: `docs/database-schema-rundown.md` Section 3
**Schema qualification source**: `tasks/sprint9-schema-qualification.md`

---

### Step 2: M10 — Activities Foundation (application code only)

**Scope**: All M10 application code. Table already exists from Step 1.

**What gets done:**
1. `db.py` — add `get_pool()` accessor
2. `dependencies.py` — move `_sync_lock` from main.py, add `get_data_sync_service()`
3. `models.py` — add ActivityType, ActivitySource, Activity, ActivityCreate, ActivityUpdate, insights models
4. `data_sync.py` — add `db_pool` param, `sync_activities()` method, wire into `sync_all_data()` with error isolation
5. `routes/activities.py` — NEW file, 11 endpoints (CRUD, search, sync, match-context, insights)
6. `main.py` — register router, update DataSyncService construction, update imports
7. `tests/conftest.py` — add mock factories
8. `tests/test_activities.py` — NEW file, full test suite
9. `tests/test_api_endpoints.py` — update `_sync_lock` import/patch target

**Detailed plan**: `tasks/m10-activities-foundation-plan.md` — every endpoint, every decision, concurrency model verified.

---

### Step 3: M11 — Pebble PostgreSQL Migration (storage rewrite only)

**Scope**: Rewrite Pebble's storage layer from SQLite to asyncpg. Tables already exist from Step 1.

**What gets done:**
1. `pebble/storage/db.py` — replace sqlite3 with asyncpg pool, all functions become async
2. `pebble/storage/cache.py` — async pool access for `get_cached()`, `set_cached()`, `clear_expired()`
3. `pebble/main.py` — async `init_db()`, `await` all storage calls (~15 call sites)
4. `pebble/harness.py` — `log_harness_outcome()` becomes async
5. `pebble/data_sources/finra.py`, `lda.py`, `propublica.py` — async cache calls
6. Propagate async to ~26 dependent files (handlers, orchestrator)
7. Remove `asyncio.to_thread()` wrappers that were bridging sync SQLite calls

**Detailed plan**: `tasks/sprint10-pebble-postgresql.md`

---

### Step 4: M12 — Pebble Access Control

**Scope**: RBAC permissions and cost limits before multi-user access.

**What gets done:**
1. Add `use_pebble_research` permission to init.sql seed data + permissions.py known keys
2. Per-user daily cost limit (query pebble_harness_log for user's daily total)
3. Remove interim `PEBBLE_CHAT_ALLOWED_EMAILS` env var whitelist
4. Gate research endpoints with permission check

**Detailed plan**: `tasks/sprint12-pebble-access-control.md`

---

### Step 5: M18 — Project Soft-Delete

**Scope**: Protect project hierarchy from accidental irreversible deletion.

**What gets done:**
1. Add `deleted_at TIMESTAMPTZ` to project, workstream, milestone, project_task
2. Replace `DELETE FROM` with `UPDATE SET deleted_at = now()` in routes/projects.py
3. Add `WHERE deleted_at IS NULL` to all SELECT queries
4. Application-level cascade soft-delete (transaction wrapping)
5. Restore endpoint: `POST /api/projects/{id}/restore`

**Detailed plan**: `tasks/project-soft-delete-plan.md`
**Depends on**: M10 (proves the soft-delete pattern with the activity table)

---

### Step 6: M14 — Pebble Persistence + CRM Bridge

**Scope**: Wire conflict_log and scratchpad into research pipeline, add SF update capability.

**What gets done:**
1. `pebble/storage/db.py` — add `save_conflicts()`, `save_scratchpad()`, `update_scratchpad()` async functions
2. `pebble/orchestrator.py` — call persistence at tier boundaries
3. `pebble/crm_bridge.py` — add `update_contact()`, `update_account()` methods
4. CRM agent tools — add update tools

**BLOCKED ON**: SF field definitions from senior devs (which Contact/Account fields to write)
**Detailed plan**: `tasks/sprint11-pebble-persistence-crm.md`

---

### Step 7: M17 — SF Audit + UX Polish

**Scope**: Validate frontend against actual SF org, polish Pebble UX.

**What gets done:**
1. Audit SF required fields via `describe()` API
2. Sync frontend validation to match SF org
3. Add cost display to Pebble results
4. Show failed agents in research output

**Detailed plan**: `tasks/sprint13-sf-audit-ux-polish.md`

---

### Steps 8-10: Frontend Activities Track (M13 → M15 → M16)

**Step 8: M13** — Activities Timeline + Modals (depends on M10)
- ActivityTimeline component, Opportunity/Contact detail modals
- Plan: `tasks/sprint9-activities-extension-plan.md` (9B section)

**Step 9: M15** — Chrome Extension (depends on M13)
- Manifest V3, Gmail/GCal content scripts, GCS attachments, thread detection
- Plan: `tasks/sprint9-activities-extension-plan.md` (9C section)

**Step 10: M16** — Integration + QA (depends on M15)
- Wire modals into pages, global search, full regression
- Plan: `tasks/sprint9-activities-extension-plan.md` (9D section)

---

## Dependency Graph (Updated)

```
Step 1: M9 (Schema + ALL DDL) ─── FIRST
 │
 ├──► Step 2: M10 (Activities code)  ─┬─► Step 5: M18 (Soft-Delete)
 │                                    └─► Step 8: M13 (Timeline) → M15 → M16
 │
 ├──► Step 3: M11 (Pebble storage)  ──► Step 6: M14 (Persistence) [BLOCKED on SF fields]
 │
 └──► Step 4: M12 (Access Control)  ──► Step 7: M17 (SF Audit)
```

**Steps 2 + 3 + 4 can run in parallel** after Step 1 completes.

---

## What the Dev Team Reviews Today

The complete `bedrock` schema: 23 tables with all columns, types, constraints, indexes, triggers, FKs, and seed data. Documented in:
- `docs/database-schema-rundown.md` — full DDL with commentary
- `financial_forecasting/db/init.sql` — executable SQL (after M9 prefixing)

Key points for team discussion:
1. All tables in `bedrock` schema — `bedrock_user` has CREATE + USAGE
2. Pebble tables use `pebble_` prefix — no FK contamination with SF data (PRD requirement)
3. Activity table has soft delete (sync resurrection prevention) + full-text search
4. Pebble tables are empty until M11 rewires storage from SQLite
5. Cloud SQL networking: VPC Connector or Auth Proxy for Cloud Run → segundo-db (Cloud SQL managed)

---

## Blocked Items (External)

| Item | Blocked On | Impact |
|------|-----------|--------|
| M14: CRM bridge PATCH | SF field definitions from senior devs | Can't write research data back to SF Contact/Account |
| Serper Integration | Serper.dev API key | No biographical web search data |
| OpenCorporates | API key | No officer/director lookup |
| Cloud Run deployment | VPC Connector setup for Cloud SQL | Can develop/test from whitelisted dev machines; Cloud Run needs infra setup before prod deploy |
