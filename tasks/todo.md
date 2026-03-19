# Bedrock PR Roadmap

> Master tracker for all planned PRs. Each PR has a detailed plan in `tasks/prs/`.
> Update checkboxes as work progresses.

## Production-Grade Security MVP (2026-03-18)

- [x] Phase 1: Security hardening (JWT/Fernet, prod secret, dev bypass, debug, calendar, SOQL)
- [x] Phase 2: Calendar re-auth UX, Settings Google reconnect
- [x] Phase 3: Archived feature planning docs (5 docs)
- [x] Phase 4: Documentation (lessons, env template, DEV_SETUP_GUIDE, hygiene)
- [x] Phase 5: tasks/todo.md updated
- [x] Phase 6: Manual verification (Priorities, Dashboard, Pipeline, Settings)

## Ship Order

| # | PR | Status | Size | Depends On |
|---|-----|--------|------|------------|
| 1 | [Ranking Stability Bug Fix](prs/pr-01-ranking-stability.md) | `todo` | S | — |
| 2 | [Stage Colors & Ordering](prs/pr-02-stage-colors.md) | `todo` | M | — |
| 3 | [Column Sorting](prs/pr-03-column-sorting.md) | `todo` | M | PR 1 |
| 4 | [Revenue Snapshot Filter](prs/pr-04-revenue-snapshot-filter.md) | `todo` | S | — |
| 5 | [Calendar Expansion + Toggles](prs/pr-05-calendar-expansion.md) | `todo` | L | — |
| 6 | [Task Inbox](prs/pr-06-task-inbox.md) | `todo` | L | — |
| 7 | [Home Page Layout](prs/pr-07-home-layout.md) | `todo` | M | PR 5, PR 6 |
| 8 | [Pipeline Funnel Accountability](prs/pr-08-pipeline-funnel.md) | `todo` | L | — |
| 9 | [Projects Page](prs/pr-09-projects-page.md) | `todo` | XL | Needs separate deep planning |
| 10 | [Logo Redesign](prs/pr-10-logo.md) | `todo` | S | — |

## Status Legend

- `todo` — not started
- `in-progress` — actively being worked
- `in-review` — PR open, awaiting review
- `done` — merged

## Dependency Graph

```
PR 1 (ranking bug) ──► PR 3 (column sorting)

PR 5 (calendar) ──┐
                   ├──► PR 7 (home layout)
PR 6 (task inbox) ─┘

All others ship independently.
```

## Notes

- PRs 1, 2, 4, 10 are quick wins — ship first for momentum.
- PR 9 (Projects) needs its own planning session — informed by AIJI Project Tracker_v6.xlsx.
- All work happens in `financial_forecasting/frontend/` (React + MUI stack).
- Backend changes needed for PR 6 (task `created_by`, `is_urgent`) and PR 8 (stage history).

## Pebble: Task Guardrails (2026-03-19)

- [x] `TaskSpec` dataclass + `PROMPT_TEMPLATES` registry in `harness.py`
- [x] `register_template()` decorator + templates for `api_response_extractor` and `batch_summarizer`
- [x] `execute_task()` method — required path for sub-Queen tiers
- [x] Block raw `execute()` for WORKER/DRONE/FORAGER (returns SKIPPED)
- [x] Tier-aware system prompt prefix ("ONE task, JSON only")
- [x] `max_input_tokens` enforcement (safety net)
- [x] `TIER_HARNESS_DEFAULTS` + `harness_config_for_agent()` — tier-appropriate limits
- [x] `origin` field: `"template"` on all claim_templates, `"llm_extracted"` on orchestrator LLM claims
- [x] `verify_urls()` — HTTP HEAD pre-filter for dead URLs before Opus fact-check
- [x] Wire URL pre-filter into `main.py` before stage 3
- [x] Orchestrator updated: `execute_task()` + `TaskSpec` for sub-Queen, `harness_config_for_agent()` for all
- [ ] Manual verification: startup + curl tests

## Future Considerations

- **Pipeline Cleanup Tool**: Build a dedicated cleanup/hygiene feature for stale opportunities (past close date or no updates in 30+ days). Removed from Overview dashboard — belongs as its own tool, not on the main dashboard.
