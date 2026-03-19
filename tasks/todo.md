# Bedrock PR Roadmap

> Master tracker for all planned PRs. Each PR has a detailed plan in `tasks/prs/`.
> Update checkboxes as work progresses.

## Production-Grade Security MVP (2026-03-18)

- [x] Phase 1: Security hardening (JWT/Fernet, prod secret, dev bypass, debug, calendar, SOQL)
- [x] Phase 2: Calendar re-auth UX, Settings Google reconnect
- [x] Phase 3: Archived feature planning docs (5 docs)
- [x] Phase 4: Documentation (lessons, env template, DEV_SETUP_GUIDE, hygiene)
- [x] Phase 5: tasks/todo.md updated
- [ ] Phase 6: Manual verification (Priorities, Dashboard, Pipeline, Settings)

## Ship Order

| # | PR | Status | Size | Depends On | Remaining |
|---|-----|--------|------|------------|-----------|
| 1 | [Ranking Stability Bug Fix](prs/pr-01-ranking-stability.md) | `done` | S | — | Tiebreaker is deterministic (`Id.localeCompare`); no code changes needed |
| 2 | [Stage Colors & Ordering](prs/pr-02-stage-colors.md) | `done` | M | — | Colored dots added to PriorityTable stage filter + PipelineFilterBar stage Autocomplete |
| 3 | [Column Sorting](prs/pr-03-column-sorting.md) | `done` | M | PR 1 | — |
| 4 | [Revenue Snapshot Filter](prs/pr-04-revenue-snapshot-filter.md) | `done` | S | — | — |
| 5 | [Calendar Expansion + Toggles](prs/pr-05-calendar-expansion.md) | `done` | L | — | Time-axis grid with hourly layout (7am–8pm), current-time indicator, all-day task row; overlap detection deferred |
| 6 | [Task Inbox](prs/pr-06-task-inbox.md) | `done` | L | — | Urgent toggle persisted in localStorage; SOQL includes CreatedBy.Name + Owner.Name; backend persistence deferred |
| 7 | [Home Page Layout](prs/pr-07-home-layout.md) | `skip` | M | PR 5, PR 6 | Current resizable-panel layout is functional; not in MVP scope |
| 8 | [Pipeline Funnel Accountability](prs/pr-08-pipeline-funnel.md) | `done` | L | — | — |
| 9 | [Projects Page](prs/pr-09-projects-page.md) | `in-progress` | XL | Needs separate deep planning | Read-only UI with 4 views exists; no backend, no CRUD, no data import (hardcoded sample data) |
| 10 | [Logo Redesign](prs/pr-10-logo.md) | `done` | S | — | SVG + sidebar + manifest done; favicon PNGs missing (optional) |

## Status Legend

- `todo` — not started
- `in-progress` — actively being worked
- `in-review` — PR open, awaiting review
- `done` — merged

## Dependency Graph

```
PR 1 (ranking bug) ──► PR 3 (column sorting) ✓ done

PR 5 (calendar) ──┐
                   ├──► PR 7 (home layout)
PR 6 (task inbox) ─┘

PRs 2, 4✓, 8✓, 9, 10✓ ship independently.
```

## Notes

- **Audit date**: 2026-03-18 — reconciled against PRs #15–18 and `feature/nick-view-page-roles` branch.
- **8 PRs done** (1, 2, 3, 4, 5, 6, 8, 10). PR 7 skipped (functional as-is). PR 9 needs own planning session.
- PR 9 (Projects) needs its own planning session — informed by AIJI Project Tracker_v6.xlsx.
- All frontend work in `financial_forecasting/frontend/` (React + MUI stack).
- **Deferred**: PR 6 backend persistence (toggle API, Salesforce sync); PR 5 meeting overlap detection.

## Future Considerations

- **Pipeline Cleanup Tool**: Build a dedicated cleanup/hygiene feature for stale opportunities (past close date or no updates in 30+ days). Removed from Overview dashboard — belongs as its own tool, not on the main dashboard.
