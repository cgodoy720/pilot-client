# Admin / Staff Product Requirements

> Living document. Updated as features are discussed and built. When a new request contradicts something here, stop and confirm before implementing. No emojis anywhere in the UI.

---

## Navigation

### Program dropdown (4 items)
| Label | Route | Was |
|-------|-------|-----|
| Cohort Hub | `/admin-dashboard` | "Cohort Stats" |
| Program Analytics | `/program-analytics` | (new) |
| Content Mgmt | `/content-preview` | unchanged |
| External Cohorts | `/external-cohorts` | unchanged |

**Removed from nav:** Assessments, Attendance (both now live inside Cohort Hub tabs).

**Status:** Shipped in PR `b5bf9f1`.

---

## Cohort Hub (`/admin-dashboard`)

Formerly "Admin Dashboard" / "Cohort Stats". Per-cohort facilitator workspace.

### Page header
- Title: "Cohort Hub"
- Cohort selector dropdown (propagates to all tabs)
- No legacy dashboard link

### Tabs (8 total)

| Tab | Source | Status |
|-----|--------|--------|
| Overview | `OverviewTab.jsx` | Built, needs cohort KPI row |
| Roster | `BuildersTab.jsx` | Built (371 LOC) |
| Performance | `PerformanceTab.jsx` | New — extracts task analysis + peer feedback + video scores from old SummaryTab |
| Attendance | `AttendanceTab.jsx` | New — wraps TodaysAttendanceOverview + AttendanceManagement + CohortPerformanceDashboard |
| NPS | `SurveyTab.jsx` | Built, migrated to native endpoints |
| Assessments | `AssessmentsTab.jsx` | New — wraps GradesTab + empty state |
| L2 | `L2SelectionsTab.jsx` | Built |
| Logs | `LogsTab.jsx` | New — facilitator logs + tag cloud |

### Tab badges
- **Assessments**: show pending feedback count (e.g. "Assessments (4)")
- **Roster**: red dot when enrollment not verified (null or >30 days old)

### Empty states (all new tabs)
- Consistent pattern: icon + "No [data type] yet for this cohort."
- Assessments: "No assessment periods yet."
- L2: "No L2 selection period active."
- Logs: "No logs yet — add the first one."

---

### Overview Tab
- Cohort KPI row: active builders, attendance %, submission rate, NPS (per selected cohort)
- Platform-wide section below
- AI action queue (PR 2): ranked nudge list — at-risk builders, pending assessments, NPS drops

### Roster Tab
- Builder list with attendance %, submission %, status
- Enrollment verification: "Verify Enrollment" button → `EnrollmentVerificationDrawer`
- Red dot on tab when enrollment_verified_at is null or >30 days old
- AI status badges (PR 2): colored dot per builder (green/yellow/red) + hover tooltip

### Performance Tab
Three sections:
1. **Task Analysis** — task name, submitted count, avg score, # below 70%
2. **Peer Feedback** — builder, received count, given count, sentiment
3. **Video Scores** — per builder per week: communication, technical, clarity, overall

### Attendance Tab
Three sub-tabs mirroring the old standalone page:
1. **Today's Attendance** — daily overview, mark attendance
2. **Manage Attendance** — historical editing
3. **Cohort Performance** — trend charts

### NPS Tab
- NPS chart + individual responses
- AI theme summary card (PR 2): "Key themes this week" — top positive, top concern

### Assessments Tab
- Period selector dropdown
- Builder list: score, feedback sent status, "Review & Send →" button
- "Review & Send →" opens existing `GradeViewModal` (AI feedback already populated via BQ analysis)
- Bulk send via existing `MassEmailModal`
- Empty state: "No assessment periods yet."

### L2 Tab
- Builder list: demo ratings, attendance %, grades, selection status
- CSV export
- No AI additions

### Logs Tab
- Facilitator logs + support tickets (`GET /support-tickets?cohortId=X`)
- Tag cloud: aggregate `tags[]` from `builder_logs` by category (no new AI needed — tags already written by Haiku)
- "Add Log" → `BuilderLogModal`
- Filter by tag, search by builder name

---

## Program Analytics (`/program-analytics`)

Cross-cohort leadership view. Three sub-tabs.

**Status:** Page + route shipped in PR `b5bf9f1`. Funnel tab fully built.

### Sub-tabs

| Tab | Content |
|-----|---------|
| Pipeline Funnel | Full funnel dashboard (see below) |
| Cohort Metrics | All active cohorts side-by-side (no per-cohort selector — cross-cohort by design) |
| NPS | Cross-cohort NPS trend lines + comparison table |

### Cohort Metrics sub-tab
- Table: each cohort row → builders, attendance %, submission rate, avg grade, NPS
- Reuses `CohortAnalyticsTab` for attendance trend chart section
- Period selector: last 30d / this week / this month

### NPS sub-tab
- Multi-line chart: one line per cohort over time
- Summary table: current NPS per cohort + trend direction

---

## Pipeline Funnel (Program Analytics → Funnel tab)

### Funnel visualization
- 10 stages: Leads → Registered → Applied → Admitted → Enrolled → L1 Completed → L2 Completed → L3 Completed → Any Employment → FT Employed
- Default state: centered on Leads (Leads = full-width reference bar)
- Each stage bar scales proportionally from the centered stage
- Stages above the centered stage show full-width with a multiplier label: "X× [next stage]"
- Centered stage marked with purple dot (●) and purple label text
- Conversion % badge per stage (% from previous stage), color-coded green/yellow/red

### Click behavior (CONFIRMED 2026-04-02)
- **Single click on a stage** → both simultaneously:
  1. Recenter the scale on that stage
  2. Open the drill-down table for that stage
- Clicking the same stage again → closes the drill-down (toggle)

### Drill-down table
- Fixed height (~480px), scrollable within container
- Infinite scroll via IntersectionObserver
- Debounced search (300ms), server-side, filters name + email
- Sortable column headers; default sort = most recent first
- Close (×) dismisses

### Summary stats (above funnel)
- Builders Employed (any employment, % of L3 grads)
- FT Employed (count, % of L3 grads)
- Avg Salary — show "—" + "no salary data yet" when null

### Filters
- Cohort selector dropdown
- Demographic filters panel: gender, NYCHA resident, referral source

### Data rules
- **Leads** = deduplicated UNION of `lead` + `applicant` tables. Multiplier label: "X× Registered"
- **Admitted** = accepted from `applicant_stage`
- **Enrolled** = admitted applicants matched to `user_enrollment` via email OR backup_email. Admitted ≥ Enrolled always.
- **Salary** = `employment_records.payment_amount` — currently all NULL

### Stage ID mapping
| Label | Frontend ID | Backend param |
|-------|-------------|---------------|
| Leads | `leads` | `leads` |
| Registered | `applicants` | `applicants` |
| Applied | `submitted` | `submitted` |
| Admitted | `admitted` | `admitted` |
| Enrolled | `enrolled` | `enrolled` |
| L1 Completed | `l1_completed` | `l1_completed` |
| L2 Completed | `l2_completed` | `l2_completed` |
| L3 Completed | `l3_completed` | `l3_completed` |
| Any Employment | `any_employment` | `any_employment` |
| FT Employed | `ft_employed` | `ft_employed` |

---

## AI Features (PR 2 — not yet built)

All require `authenticateToken + requireAttendanceAdminAccess`.

| Feature | Endpoint | Where |
|---------|----------|-------|
| Overview action queue | `POST /cohort-action-queue` | Overview tab — ranked nudge list for at-risk builders |
| NPS themes | `POST /nps-themes` | NPS tab — "Key themes this week" card |
| Roster AI badges | existing `builder-insights-summary` | Roster tab — colored dot + hover tooltip per builder. Staggered queue (5 at a time, 100ms delay — not Promise.all) |

---

## Deferred / Out of Scope

| Feature | Notes |
|---------|-------|
| ConversationTab | Uses mock data — backend exists but not production-ready |
| Weekly AI reports in Overview | Out of scope for now |
| Program funnel milestone feed | Good future candidate for Program Analytics sidebar |
| Mobile / PWA | Out of scope |
| L2 AI recommendations | Removed — existing data (attendance, grades, demos) is sufficient |
| Draft-assessment-feedback endpoint | Not needed — AI feedback already exists via BQ analysis in GradeViewModal |

---

## Change Log

| Date | Change | Note |
|------|--------|------|
| 2026-04-01 | Nav restructured: 5 → 4 items, Assessments + Attendance removed as nav items | Shipped |
| 2026-04-01 | Added Enrolled stage to funnel | Shipped |
| 2026-04-01 | Fixed admitted ≥ enrolled via backup_email join | Shipped |
| 2026-04-01 | SummaryTab + VideoSubmissionsTab deleted | Dissolved into Performance + Logs tabs |
| 2026-04-02 | **Funnel click behavior**: was single-click=recenter only + double-click=drill. Corrected to single-click=BOTH | Contradiction caught in review |
