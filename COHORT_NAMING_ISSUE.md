# Cohort Naming Inconsistency — curriculum_days Table

## Summary

The `curriculum_days` table has stale cohort name strings that don't match the rest of the system. This causes **task analysis data to return 0 results** for December 2025 L1, September 2025 L1, and June 2025 L1 cohorts in the admin dashboard Summary tab and the legacy admin dashboard.

## What Happened

All migration files (050-059) were committed together on **Feb 9, 2026** (commit `ccf3cea`).

1. **Migration 051** (`051_data_mapping.sql`) set up the organizational hierarchy and created enrollments. At this point, cohorts were named without level suffixes: "December 2025", "September 2025", "June 2025".

2. **Migration 052** (`052_map_curriculum_to_cohorts.sql`) renamed cohorts to include level suffixes for consistency. It updated the `cohort.name`, `users.cohort`, `curriculum_days.cohort`, `assessments.cohort`, `builder_feedback.cohort`, and several other tables — all from "December 2025" → "December 2025 L1" (same for September and June).

3. **Migration 052 ROLLBACK** (`052_ROLLBACK.sql`) was run at some point to undo this rename. It reverted `curriculum_days.cohort`, `users.cohort`, `cohort.name`, and all other tables back to the original names without L1 suffixes.

4. **Something subsequently re-applied the L1 suffix** to `cohort.name` and `users.cohort` — likely through the application layer, signup flow, or a partial re-run of migration 052 — but **did not update `curriculum_days.cohort`**. This created the current mismatch.

## Current State

| Table | Column | Value | Status |
|---|---|---|---|
| `cohort` | `name` | "December 2025 L1" | Has L1 suffix |
| `users` | `cohort` | "December 2025 L1" | Has L1 suffix |
| `user_enrollment` | linked via `cohort_id` | Correctly linked | OK |
| **`curriculum_days`** | **`cohort`** | **"December 2025"** | **Missing L1 suffix** |
| `assessments` | `cohort` | Unknown — may also be stale | Needs verification |
| `builder_feedback` | `cohort` | Unknown — may also be stale | Needs verification |
| `task_pattern_analysis` | `cohort` | Unknown — may also be stale | Needs verification |

## Why This Matters

The weekly report system and task analysis queries in the legacy admin dashboard join on `curriculum_days.cohort` as a string:

```sql
-- From weeklyReportQueries.js
WHERE cd.cohort = $1  -- $1 = "December 2025 L1"
```

Since `curriculum_days.cohort` = "December 2025" (no L1), this WHERE clause matches 0 rows. Result: **0 tasks shown** for any cohort affected by the rollback, even though the data exists.

### Affected Cohorts
- **December 2025 L1** — 79 users, 44 with graded tasks, but 0 tasks in summary
- **September 2025 L1** — likely same issue
- **June 2025 L1** — likely same issue

### Not Affected
- **March 2025 L2** — was never renamed (always had level suffix), shows 257 tasks correctly
- **January 2026 L2** — created after the rollback with correct naming
- **March 2026 L1** — created after the rollback with correct naming

## What's Broken

1. **Admin Dashboard Summary tab** — Task Analysis shows "0 tasks" for Dec/Sep/Jun cohorts
2. **Legacy admin dashboard** — Same issue, weekly-summary API returns 0 taskDetails
3. **Weekly reports** — Any report querying by cohort string against `curriculum_days` returns incomplete data
4. **Task pattern analysis** — May be affected if it also joins on the string field

## What Still Works

- Builder performance data (queries `users` table directly — correct L1 suffix)
- Builder detail drill-down (queries by `user_id`, not cohort string)
- Attendance data (uses `user_enrollment` + `cohort_id` UUID, not string)
- Video submissions (queries by user, not curriculum_days)
- Peer feedback (queries by user, not curriculum_days)
- NPS/Survey data (separate table, not affected)

## Recommended Fix

Run these 3 UPDATE statements against the production database to align `curriculum_days.cohort` with the current naming:

```sql
BEGIN;

UPDATE curriculum_days SET cohort = 'June 2025 L1' WHERE cohort = 'June 2025';
UPDATE curriculum_days SET cohort = 'September 2025 L1' WHERE cohort = 'September 2025';
UPDATE curriculum_days SET cohort = 'December 2025 L1' WHERE cohort = 'December 2025';

-- Verify
SELECT cohort, COUNT(*) as days FROM curriculum_days
WHERE cohort IN ('June 2025', 'September 2025', 'December 2025', 'June 2025 L1', 'September 2025 L1', 'December 2025 L1')
GROUP BY cohort ORDER BY cohort;

COMMIT;
```

Also verify and fix these tables if affected by the same rollback:
- `assessments.cohort`
- `builder_feedback.cohort`
- `task_pattern_analysis.cohort`
- `weekly_goals.cohort`
- `curriculum_change_history.cohort`

## Longer-Term Recommendation

Migrate all queries to use `cohort_id` (UUID foreign key) instead of `cohort` (string). The string-based approach is fragile — any rename breaks joins. The UUID-based approach through `user_enrollment` and `cohort.cohort_id` is already in place for newer features like attendance and enrollment management.
