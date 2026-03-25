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

## Pebble: Blocking — Must Resolve Before Production

> These items prevent features from working correctly. Code is built but cannot be fully tested or used until these are resolved.

- [ ] **Web search APIs need setup (team admin)** — Pebble supports two web search backends (Google CSE + Serper.dev). Neither is configured. Without at least one, all web search returns empty — no biographical info, no board positions, no news results. Setup: `pebble/README.md` → "Web search setup." *JP + team admin.*
- [ ] **OpenCorporates needs API key** — Code ready, cache in place. `search_officers()` returns empty without credentials. No officer/director data until configured.
## Pebble: Resolved

- [x] **SEC CIK caching** — API response cache layer added (Stage 1C). SQLite TTL cache in `pebble/storage/cache.py`.
- [x] **Google OAuth configured** — Set up 2026-03-20. See `tasks/google-oauth-setup.md`.
- [x] **Frontend UX gaps** — Resolved in Stage 1: research history sidebar, text feedback, download export, stop button, previous feedback display on reopen. Remaining: cost display, failed_agents visibility.
- [x] **Sync LLM calls block event loop** — Resolved in Sprint 6. All harness calls wrapped in `asyncio.to_thread()` (orchestrator.py:503, 556). Data source fetches also wrapped. Thread pool handles concurrency.
- [x] **No unit/integration tests** — 236 tests now passing across data sources, clusters, router, CRM agent, and web search.

## Pebble Stage 1 Complete (2026-03-20)

- [x] Pebble + Upload pages merged into single tabbed page
- [x] Stop button with backend cancel checkpoints (cooperative cancellation)
- [x] Wikipedia full article + infobox parsing (board memberships, career history)
- [x] Temporal accuracy in LLM prompts (current vs former roles)
- [x] API response cache layer (SQLite TTL)
- [x] Markdown export with download button
- [x] Session history (last 100, right sidebar drawer)
- [x] Text feedback + display on reopen + trends endpoint
- See `tasks/pebble-evolution-roadmap.md` for Stages 2-4 (future work)
- See `tasks/pebble-stage1-issues.md` for known issues and deferred items

## Future Considerations

- **Pipeline Cleanup Tool**: Build a dedicated cleanup/hygiene feature for stale opportunities (past close date or no updates in 30+ days). Removed from Overview dashboard — belongs as its own tool, not on the main dashboard.
