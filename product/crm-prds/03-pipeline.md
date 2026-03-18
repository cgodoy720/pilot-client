# PRD 03 — Revenue Pipeline (Opportunity Management)

> Version: 0.1 | Status: Draft | Date: 2026-03-16
> Author: Jac (with Claude)

---

## Purpose

Provide the fundraising team and CEO with a single, filterable view of all opportunities — open, collecting, and closed — so leadership can answer "where does the money stand?" at any time. Enhances the existing Opportunities DataGrid with richer filtering, pipeline summary totals, and stale detection.

Serves **Core Job #4:** "Show leadership where the money stands."

---

## Scope

**In scope:**
- Rich filtering: Owner, Stage, `revenue_stream`, Priority, AIJI flag, Amount range, Close Date range
- Pipeline summary totals above the grid (total pipeline, weighted pipeline, count by stage)
- Stale opportunity detection and visual flagging (30-day rule)
- Sortable columns (all filterable columns)
- Three view modes: Open Pipeline, Collecting/In Effect, Closed (already exists)

**Out of scope:**
- Kanban/drag-drop stage changes (defer to F07, post-MVP)
- CSV export (defer to F25 — evaluate for first version)
- Opportunity creation/editing (already exists in current code)
- Payment tracking details (PRD 04)
- Campaign attribution (PRD 05)
- Stage progression automation (keep manual for now)

---

## User Stories

- As a partnerships IC, I need to filter the pipeline by Owner so I can see just my deals or a colleague's portfolio.
- As a partnerships IC, I need to filter by Stage and revenue_stream so I can focus on grants vs. PBC contracts at specific stages.
- As the CEO, I need to see weighted pipeline totals above the grid so I can instantly gauge our projected revenue.
- As the CEO, I need to filter by Close Date range so I can see what's expected this quarter vs. next.
- As a partnerships IC, I need stale opportunities visually flagged so I can prioritize re-engagement.
- As the CEO, I need to filter by Amount range so I can focus on high-value opportunities.

---

## Data Requirements

**Entities touched:**
- Opportunity (all stages, all users)
- Account (for display names and funder context)
- User (for Owner filter dropdown)
- Payment (for Collecting view — payment progress)

**Key fields:**
- Opportunity: `name`, `account_id`, `stage`, `amount_estimated`, `amount_confirmed`, `probability`, `expected_close_date`, `assigned_to`, `revenue_stream`, `salesforce_id`, `LastModifiedDate`
- Computed: `expected_value` = `amount × probability / 100`; `is_stale` = no activity AND no stage change in 30 days

**Reference:** `product/crm-architecture/entity-map.md`, `product/crm-architecture/canonical-definitions.md` Section 1 (stages)

---

## Functional Requirements

### Filtering

1. The system must provide a filter bar above the DataGrid with the following filters:
   - **Owner** — dropdown populated from SF Users; multi-select
   - **Stage** — dropdown with canonical stages; multi-select
   - **Revenue Stream** — `nonprofit` | `pbc` toggle/dropdown
   - **Amount range** — min/max number inputs
   - **Close Date range** — start/end date pickers
   - **AIJI flag** — toggle (filters to opportunities with "AIJI" in name)
   - **Stale only** — toggle (shows only stale opportunities)
2. Filters must be combinable (AND logic).
3. A "Clear all filters" button must reset all filters.
4. Active filter count must be visible when filters are applied.
5. Filter state should persist across tab switches (Open/Collecting/Closed) within the same session.

### Pipeline Summary

6. The system must display summary metrics above the grid:
   - **Total Pipeline:** sum of `amount_estimated` for filtered opportunities
   - **Weighted Pipeline:** sum of `amount_estimated × probability / 100` for filtered opportunities
   - **Count by Stage:** horizontal bar or chips showing count per stage
7. Summary metrics must update reactively when filters change.

### Stale Detection

8. Opportunities with no activity AND no stage change in the last 30 days must be flagged with a visual indicator (icon + row highlight).
9. The stale flag must be computed client-side from `LastModifiedDate` (MVP) or from Activity records (post-MVP).

### Existing Functionality (Preserve)

10. Three view tabs: Open Pipeline, Collecting/In Effect, Closed — must continue to work.
11. Inline cell editing for Stage, Amount, Probability, CloseDate — must continue to work.
12. TaskPanel and ActivityIntelligencePanel per-row — must continue to work.
13. Existing Philanthropy/PBC/AIJI filter chips — replace with the new filter bar (superset).

### Sorting

14. All columns must be sortable (ascending/descending toggle).
15. Default sort: Open = by `expected_close_date` ascending; Collecting = by `Most_Recent_Payment_Date` descending; Closed = by `CloseDate` descending.

---

## Non-Functional Requirements

- **Performance:** Grid must render <500 rows with filters applied in <1s. Filtering must be client-side (data already loaded).
- **Security:** All users see all opportunities (no row-level security for MVP). Respect read-only vs. edit permissions per role (post-MVP, PRD 08).
- **Reliability:** If SF API is slow, show loading skeleton. Never show stale cached data without indicator.
- **Scale limits:** Designed for <2,000 total opportunities across all stages.

---

## Integration Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| PRD 01 (Data Model) | Soft | Can use SF schema directly for MVP |
| Salesforce API | Hard | Existing `/api/salesforce/opportunities` endpoint |
| PRD 09 (SF Sync) | Soft | Data flows from SF; sync doesn't need to change |

---

## Open Questions

1. Kanban view (drag-drop stage changes) — include now or defer to post-MVP?
2. CSV export — include in first version? (Simple: export current filtered view as CSV)
3. Any new columns needed beyond what's currently in the DataGrid?
4. Should the pipeline summary include a "by quarter" breakdown?
5. Salesforce stages (Lead Gen, New Lead, Qualifying, etc.) — map to canonical 7 or keep SF stages as-is for display?
6. Probability values: use SF values or canonical values from `canonical-definitions.md`?

---

## Acceptance Criteria

### Positive scenarios
- Given I select Owner = "Sarah" and Stage = "proposal-sent", when I view the pipeline, then I see only Sarah's opportunities at the proposal-sent stage, and the summary totals reflect only those filtered results.
- Given I set Amount range min = 100000, when I view the pipeline, then only opportunities with `amount_estimated >= 100000` are shown.
- Given an opportunity was last modified 45 days ago with no activity, when I view the pipeline, then that row is flagged as stale with a visual indicator.
- Given I apply 3 filters, when I click "Clear all filters", then all filters reset and the full pipeline is shown.
- Given I switch from Open to Collecting tab, when I return to Open, then my filter selections are preserved.

### Negative scenarios
- Given I set Close Date range to Q3 2026, when no opportunities match, then the grid shows an empty state message and summary totals show $0.
- Given I enter an invalid Amount range (min > max), then the system shows a validation message and does not apply the filter.

### Data invariants
- Pipeline summary totals always equal the sum of visible rows (after filtering).
- `expected_value` is always `amount × probability / 100` — never manually overridden.
- Stale flag is deterministic: same data always produces the same stale/not-stale result.

---

## Existing Code to Enhance

| File | What exists | What changes |
|------|------------|-------------|
| `Opportunities.tsx` (526 lines) | DataGrid with 3 view tabs, inline editing, Philanthropy/PBC/AIJI chips, task panel | Add filter bar (Owner, Stage, revenue_stream, Amount, CloseDate, Stale); add summary totals above grid; replace existing chips with new filters |
| `useOpportunityData` hook | Fetches opps, users, accounts from SF | Add stale computation; ensure all filter fields are fetched |
| `/api/salesforce/opportunities` | Returns opps with stage/type params | No API changes needed — filtering is client-side |
| `/api/salesforce/users` | Returns all SF users | Already used for Owner lookup; will populate Owner filter dropdown |

---

## Feature Register Mapping

F01 (Create/edit Opportunity — already exists), F02 (Pipeline view — enhance), F05 (Stage progression — manual, existing), F06 (Stale detection — new), F07 (Kanban — deferred)
