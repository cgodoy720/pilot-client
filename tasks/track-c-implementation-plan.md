# Track C: UI Improvements — Implementation Plan

> Generated 2026-03-25. Verified against codebase. Source spec: `tasks/bedrock-ui-improvements.md`

---

## 7 Sessions, 13 Decisions

### Session 1: Small UI Polish Batch (S1 + S3 + S4) ✅ SHIPPED (PR #67, 2026-03-25)

**S1 — Accounts stage colors**
- Status: ✅ Complete — switched to shared `getStageHexColor()`, deleted local function
- Spec says all Pipeline sub-pages need stage colors. **Codebase audit found only Accounts.tsx needs fixing:**
  - `Opportunities.tsx` — already uses `getStageHexColor` via `columns.tsx:401` ✓
  - `Contacts.tsx` — doesn't render stages at all (contacts don't have stages) ✓
  - `Leads.tsx` — renders Lead status, not Opportunity stages (different domain) ✓
  - `Accounts.tsx` — has a local `getStageColor()` (~line 259) returning MUI color names (`success`/`error`) instead of hex. Opportunity stage chips in the account detail dialog (~lines 535-540) use this. **Fix: import and use `getStageHexColor` from `types/salesforce.ts`.**
- Files: `financial_forecasting/frontend/src/pages/Accounts.tsx`

**S3 — Nav icon swap + Pipeline rename**
- Status: 3 decisions needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 1 | Dashboard icon | Swap to `TrendingUpIcon` (current Pipeline icon)? | Yes — upward arrow fits revenue/cashflow |
| 2 | Pipeline icon | `TableChartIcon`, `ViewListIcon`, `GridViewIcon`, `FilterListIcon` | `TableChartIcon` — conveys grid/spreadsheet |
| 3 | Pipeline rename | Keep "Pipeline" or rename to "Reports"? | Keep "Pipeline" — it's a known sales term |

- Current nav icons (from `Layout.tsx`):
  - Priorities → `HomeIcon`
  - Dashboard → `DashboardIcon`
  - Pipeline → `TrendingUpIcon`
  - Pebble → `SearchIcon`
  - Projects → `AccountTreeIcon`
  - Settings → `SettingsIcon`
- Files: `financial_forecasting/frontend/src/components/Layout.tsx`

**S4 — Dashboard dead space tightening**
- Status: 1 decision needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 4 | Quarterly section layout | (a) Compact metrics into single-line rows, "View Details" button on right edge, reduce grid spacing from 3→2. (b) Something else? | Option (a) |

- Current structure in `Overview.tsx`:
  - 4 hero cards in a row (Total Pipeline, Upside, Base Case, Downside) — these are fine
  - Current Quarter section: 4 nested grid items with separate "View Details" `<Button>` elements rendered below metric values when count > 0
  - Top 5 Strategic Value list in a Card
  - PipelineFunnel chart
  - Below-fold lazy-loaded DashboardBelowFoldCharts
- Files: `financial_forecasting/frontend/src/pages/Overview.tsx`

---

### Session 2: M1 + M4 + S2 ✅ SHIPPED (2026-03-25)

**M1 — Weighted Toggle Bug (fixed)**
- Sort-before-slice logic was already correct; rankings are stable across row count changes
- Fixed: Rows TextField converted from uncontrolled (`defaultValue`) to controlled (`value` + `onChange`)
- Fixed: Added `staleTime: 5min` to opportunities query to prevent background-refetch ranking flickers
- Decision #5 resolved: JP confirmed bug may already be fixed; re-sort on Weighted toggle is expected behavior

**M4 — Task Contact Names (added)**
- Backend: Added `Who.Name` to `/api/salesforce/my-tasks` SOQL
- Frontend: WhoName surfaced in TaskInbox (meta line with AccountCircle icon) and PriorityTable (→ Contact below Subject in both pending and completed task rows)
- Types updated: PriorityOpp task type, InboxTask interface
- Mappings added: MyDashboard.tsx (priorityOpps + inboxTasks), Layout.tsx (NotificationDropdown)

**S2 — Stage Selector Ordering (verified)**
- Already implemented: PriorityTable sorts stages by `stageIndex()` (line 477-481)
- PipelineFilterBar uses `OPPORTUNITY_STAGES` which is already in pipeline order
- No code changes needed — closed as verified

---

### Session 3: Inline Editing for Pipeline (M2)

**Status: 2 decisions needed**

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 6 | Account inline-editable fields | Name, Type, Industry, Phone, Website, AccountSource, Owner — which subset? | All of these |
| 7 | Contact inline-editable fields | FirstName, LastName, Title, Email, Phone, Account, Owner — which subset? | All of these |

- **Codebase audit finding:** Spec says "inline editing is missing from Pipeline page." Partially true:
  - `Opportunities.tsx` — HAS inline editing (cell edit mode for Name, Account, Owner, Amount, Probability, CloseDate, PaymentDate)
  - `Leads.tsx` — HAS inline editing (most fields, with custom edit cells for grant_id, status, wealth_tier, priority)
  - `Accounts.tsx` — READ-ONLY DataGrid ✗
  - `Contacts.tsx` — READ-ONLY DataGrid ✗
- Pattern to follow: Opportunities uses MUI DataGrid's `processRowUpdate` callback → API call → optimistic update. Reuse same pattern.
- Backend endpoints exist:
  - Accounts: need to verify if PUT/PATCH endpoint exists (check `routes/` and MCP client)
  - Contacts: same verification needed
- Files: `Accounts.tsx`, `Contacts.tsx`, `services/api.ts` (for save endpoints)

---

### Session 4: Notifications Overhaul (M3)

**Status: 2 decisions needed**

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 8 | Notification types | Stage changes on your opps, tasks assigned in last 24h, close dates approaching (7/14 day), overdue escalation (>7 days), new leads — pick which | Stage changes + close date warnings + overdue escalation |
| 9 | Backend scope | (a) New `/api/notifications` endpoint that aggregates recent SF activity, (b) Frontend-only using already-fetched data | Option (a) — frontend-only can't detect stage changes without polling |

- Current state (`NotificationDropdown.tsx`):
  - Shows max 8 overdue/due-today tasks
  - Sorted by due date then priority
  - Color-coded left border (red=overdue, yellow=due today)
  - Click → navigates to `/priorities`
  - Essentially a mini Task Inbox — not differentiated
- Files: `NotificationDropdown.tsx` (~6KB), new `routes/notifications.py`, `Layout.tsx` (passes tasks to dropdown)

---

### Session 5: Pebble Output Metadata (S5)

**Status: No blocking decisions**

- Spec: Add cost, agent count, work log to every research output. Scratchpad viewable via click-through.
- Sprint 13 already shipped cost display + failed agents. This extends with full agent log.
- Pebble backend tables available:
  - `bedrock.pebble_harness_log` — has `cost_usd`, `tokens_input`, `tokens_output`, `elapsed_seconds` per agent
  - `bedrock.pebble_scratchpad` — has persistent intermediate research state
  - `bedrock.pebble_research_sessions` — one row per completed run
- Files: `Pebble.tsx` (~41KB), research result display components, possibly `pebbleApi.ts`
- Session task: audit what Sprint 13 shipped, then add the remaining metadata

---

### Session 6: Global Search (L1)

**Status: 1 decision needed**

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 10 | Click behavior for search results | (A) Navigate to Pipeline with record filtered, (B) Open edit dialog directly, (C) Click opens edit dialog + "View in Pipeline" link inside | Option C |

- Backend ready (`routes/salesforce_search.py`):
  - `GET /api/salesforce/search?q=...` — SOSL cross-entity (Contact, Account, Opportunity)
  - `GET /api/salesforce/contacts/search?q=...` — SOQL Contact search
  - `GET /api/salesforce/accounts/search?q=...` — SOQL Account search
  - `GET /api/salesforce/opportunities/search?q=...` — SOQL Opportunity search
  - Auth: `require_auth_or_internal` (JWT cookie or `X-Internal-Key` header)
- Frontend work:
  - Search input in Layout.tsx top bar (rounded, debounced ~300ms)
  - Result dropdown with type grouping (Opportunities / Accounts / Contacts sections)
  - Navigation/dialog opening on click
  - Keyboard navigation (arrow keys, Enter to select, Escape to close)
  - Empty state, loading state, no-results state
- Files: new `components/GlobalSearch.tsx`, `Layout.tsx` (integration), `services/api.ts` (if search methods missing)

---

### Session 7: GCal Toggle + Privacy (M5)

**Status: 3 decisions needed**

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| 11 | Toggle persistence | (a) Database (`bedrock.app_user` column), (b) localStorage | Database — survives across devices, consistent |
| 12 | Privacy enforcement | (a) Frontend-only (don't render), (b) Backend-enforced (API refuses other users' data) | Backend-enforced — privacy must not depend on UI |
| 13 | Pebble calendar consent | (a) Design consent mechanism now, (b) Defer to later sprint | Defer — keep this session focused |

- Current state:
  - Google OAuth scopes include `calendar.readonly` (in `routes/auth.py`)
  - Calendar data fetched via `GET /calendar/account-activity/{account_name}` (in `routes/activity_intelligence.py`)
  - No per-user toggle exists — calendar shows for everyone
  - No backend filtering by user identity on calendar endpoints
- Files: `MyDashboard.tsx` (calendar section), `routes/activity_intelligence.py`, `routes/auth.py`, `db/init.sql` (if adding column to app_user)

---

## Items NOT in these 7 sessions

| Item | Status | Reason |
|------|--------|--------|
| S2 (Stage selector ordering) | ✅ Verified in Session 2 | Already implemented — PriorityTable sorts by `stageIndex()`, PipelineFilterBar uses `OPPORTUNITY_STAGES` in pipeline order. ROYGBIV color overhaul deferred. |
| M4 (Task contact names) | Ready to build | Small scope. Can join Session 1 or be its own quick session. Backend already returns `WhoId`/`WhoName` on per-opportunity task queries. Fix: add `WhoId, Who.Name` to `/api/salesforce/my-tasks` SOQL, then surface in `TaskInbox.tsx`/`TaskPanel.tsx`. |
| M6 (AIJI filter) | Blocked | Need to know how AIJI opportunities are identified in Salesforce (Campaign? Name pattern? Custom field?) |
| M7 (AIJI tracker) | Blocked | Need Johnny's tracker spreadsheet |
| L2 (Accountability) | Blocked | Needs product design session |
| L3 (News ticker) | Deferred | Not urgent, cost decision needed |
| P1, P2 (Pebble research) | Investigation only | Not UI work |

---

## Decision Summary

| # | Session | Item | Decision needed | JP's answer |
|---|---------|------|----------------|-------------|
| 1 | 1 | S3 | Dashboard icon → `TrendingUpIcon`? | |
| 2 | 1 | S3 | Pipeline icon → `TableChartIcon`? | |
| 3 | 1 | S3 | Rename Pipeline to "Reports"? | |
| 4 | 1 | S4 | Compact quarterly metrics, "View Details" on right? | |
| 5 | 2 | M1 | Exact reproduction steps for the weighted toggle bug? | |
| 6 | 3 | M2 | Which Account fields are inline-editable? | |
| 7 | 3 | M2 | Which Contact fields are inline-editable? | |
| 8 | 4 | M3 | Which notification types to show? | |
| 9 | 4 | M3 | New backend endpoint or frontend-only? | |
| 10 | 6 | L1 | Click search result → Option A, B, or C? | |
| 11 | 7 | M5 | Toggle persistence: database or localStorage? | |
| 12 | 7 | M5 | Privacy: frontend-only or backend-enforced? | |
| 13 | 7 | M5 | Pebble calendar consent: now or defer? | |
