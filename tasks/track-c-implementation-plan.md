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

### Session 3: Schema-Driven Inline Editing + Edit Buttons (M2) ✅ BUILT (2026-03-25)

**Scope expanded beyond original M2 to include 4 features:**

1. **Schema-driven dynamic columns** — Accounts + Contacts grids auto-generate columns from SF schema describe API. Users toggle ANY field via GridToolbar Columns button. Column prefs persisted to localStorage.
2. **Inline cell editing** — Any updateable non-formula field is editable in-grid (text, picklist, date, boolean, Account/User lookups). Permission-gated via `edit_accounts`/`edit_contacts`.
3. **Edit button per row** — Pencil icon on Opportunities, Accounts, Contacts rows opens full edit dialog (OpportunityEditDialog, AccountEditDialog, ContactEditDialog).
4. **Stackable dialogs with guardrails** — DialogStackContext manages up to 3 stacked edit dialogs.

**Decisions resolved:**
- #6: ALL SF updateable fields are inline-editable (schema-driven, not a fixed subset)
- #7: Contact Name split into FirstName + LastName. ALL updateable fields inline-editable.

**New files:** `utils/schemaColumns.tsx`, `components/EditRowButton.tsx`, `contexts/DialogStackContext.tsx`
**Modified:** `Accounts.tsx`, `Contacts.tsx`, `Opportunities.tsx`, `Opportunities/columns.tsx`, `Pipeline.tsx`, `routes/salesforce_schema.py`

---

### Session 4: Notifications Overhaul (M3) ✅ BUILT (2026-03-25)

**Scope: Personal activity feed with overlay click-through**

Transformed NotificationDropdown from mini Task Inbox into real notification center with 3 types:
1. **Task assignments** — "JP assigned you a task: [subject]" (from existing my-tasks data, filtered by CreatedById)
2. **Opportunity ownership changes** — gained/lost ownership (new backend endpoint)
3. **Close date warnings** — opps closing within 14 days (from existing opportunities data)

**Decisions resolved:**
- #8: Task assignments + ownership changes + close date warnings (personal activity feed, not pipeline warnings)
- #9: Frontend aggregation via `useNotifications` hook + new `ownership-history` backend endpoint

**Key features:**
- Expand/collapse inline previews with type icons and severity-colored borders
- Click-through opens **TaskPanel drawer** or **OpportunityEditDialog modal** on current page — no navigation away
- TaskPanel + OpportunityEditDialog lifted to Layout as overlays (both verified standalone)
- Mark-all-seen on dropdown open, badge with unread count
- Dual-match on ownership changes (handles SF FieldHistory storing IDs or names)
- Backend resolves User IDs to names via secondary SOQL when needed

**New files:** `types/notifications.ts`, `hooks/useNotifications.ts`, `routes/opportunities_extra.py` (ownership-history endpoint)
**Modified:** `NotificationDropdown.tsx` (rewritten), `Layout.tsx` (hook + overlays), `TaskInbox.tsx` (CreatedDate), `api.ts` (getOwnershipHistory)

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

### Session 6: Global Search (L1) ✅ SHIPPED (PR #73, 2026-03-26)

**Decision #10 resolved:** Option C — click opens edit dialog, secondary icon navigates to Pipeline with tab + filter.

**What shipped:**
- `GlobalSearch.tsx` — search input in Layout AppBar with instant local cache typeahead, debounced SOSL results, search history (localStorage, last 10), keyboard nav (⌘K toggle, arrows, Enter, Escape), mobile overlay
- Layout.tsx — GlobalSearch integration, Account/Contact edit dialog state, cache prefetch for accounts + contacts
- Pipeline.tsx — URL-driven tab selection (`?tab=accounts&search=Name`)
- Accounts.tsx + Contacts.tsx — URL-driven DataGrid quick filter via `useSearchParams`
- api.ts — `globalSearch()` method, NotificationDropdown type alignment

**Follow-up: Add Tasks to global search**
- Currently searches Opportunities, Accounts, Contacts (SOSL cross-entity)
- Tasks should also be searchable — users need to find tasks by subject, description, or associated contact/opportunity
- Requires: backend SOSL update to include Task entity in RETURNING clause, frontend GlobalSearch section for Tasks, click action (open TaskPanel or navigate to Priorities)
- **Target: Session 7 scope expansion or Session 8 if Session 7 stays focused on GCal**

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
