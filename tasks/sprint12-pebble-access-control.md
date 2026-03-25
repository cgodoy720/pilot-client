# Sprint 12: Pebble Access Control (Track B — Production Guardrails)

## Context

Before multiple users access Pebble, we need proper RBAC permissions and per-user cost limits. Current state:
- `use_pebble_chat` permission EXISTS (gates Ask Pebble tab + nav item)
- `PEBBLE_CHAT_ALLOWED_EMAILS` env var is an interim email whitelist
- Per-prospect budget cap EXISTS (`ProspectBudgetTracker`, ~$0.50/query)
- Per-user daily/monthly cost limit does NOT exist
- `use_pebble_research` permission does NOT exist
- Rate limiting EXISTS (30/min chat, 15/min research, 2/min batch)
- Async LLM calls: ALREADY RESOLVED via `asyncio.to_thread()` wrappers in orchestrator.py (Sprint 6). The todo.md blocker about "sync LLM calls block event loop" is stale.

## Prerequisites

- None -- can run in parallel with Track A (Sprint 9-11)

## Scope

### 1. Add `use_pebble_research` RBAC permission

Currently `use_pebble_chat` gates the Ask Pebble tab. Need `use_pebble_research` to gate the full research pipeline (tiered research, batch research, upload CSV).

Files to modify:
- `financial_forecasting/db/init.sql` -- add `use_pebble_research` to permission profile seeds
- `financial_forecasting/routes/permissions.py` -- add to known keys list (line 28)
- `financial_forecasting/frontend/src/pages/Pebble.tsx` -- gate Research tab with `can('use_pebble_research')`
- `financial_forecasting/frontend/src/pages/Settings.tsx` -- add to permission list display
- `pebble/main.py` -- check permission on `/api/v1/research/*` endpoints (needs auth integration)

### 2. Per-user daily cost limit

`ProspectBudgetTracker` caps per-query cost but has no per-user aggregate. Add a daily cost ceiling (e.g., $5/user/day) tracked in the database.

Options:
- Add `pebble_user_usage` table: `user_email, date, total_cost_usd, query_count`
- Check at request start; reject if daily limit exceeded
- Display remaining budget in the UI

### 3. Upgrade from interim email whitelist to RBAC

Replace `PEBBLE_CHAT_ALLOWED_EMAILS` env var with proper permission checks. The `use_pebble_chat` and `use_pebble_research` permissions should be the sole access control mechanism.

### 4. Mark todo.md async LLM blocker as resolved

The "Sync LLM calls block event loop" item in `tasks/todo.md` was fixed by Sprint 6's `asyncio.to_thread()` wrappers. Mark it as resolved.

## Verification

- Assign `use_pebble_research` to one user, verify others can't access research endpoints
- Run 10+ research queries as one user, verify daily cost tracking works
- Hit cost limit, verify user gets a clear error message
- Remove `PEBBLE_CHAT_ALLOWED_EMAILS`, verify permission-only access still works

## Estimated effort

Small-medium -- 1 session.
