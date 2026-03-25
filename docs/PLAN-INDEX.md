# Cursor Plan Index

Status of all plans in `.cursor/plans/`. Use this to find which plans are still actionable.

## Open (actionable)

| Plan | Remaining Items |
|------|-----------------|
| Google OAuth Sprint Setup | Add FRONTEND_URL to env.production.template; create OAUTH_SPRINT_CHECKLIST.md; change post-login redirect from /overview to /priorities |
| Bedrock UI improvements (Track C) | 5 small, 7 medium, 3 large — see `tasks/bedrock-ui-improvements.md`. Parallel with all other tracks. |
| Sprint 9 — Schema qualification (Track A) | Prefix 93 SQL statements with `bedrock.`, test against segundo-db |
| Sprint 10 — Pebble PostgreSQL + async (Track A) | SQLite -> asyncpg, 12 tables, 7 core + 26 dependent files |
| Sprint 11 — Pebble persistence + CRM bridge (Track A) | Wire conflict_log, scratchpad; add PATCH/PUT to CRM bridge (blocked on SF field definition) |
| Sprint 12 — Pebble access control (Track B) | `use_pebble_research` RBAC, per-user daily cost limits |
| Sprint 13 — SF required fields audit + UX polish (Track B) | Validate SF org fields in frontend, cost display, failed agents visibility |

## Completed

| Plan |
|-----|
| Production-Grade Security MVP |
| MVP Performance Pass |
| Bedrock Rollout and Pebble Alignment |
| Bedrock PR Roadmap |
| Funnel Polish and AI |
| Funnel Visual Redesign |
| Calendar Layout Simplification |
| Dashboard and Backend Plan |
| Pipeline Scenario Cards |
| Revenue vs Cashflow Layout |
| Notification Bell Dropdown |
| Stage B Sprint 1 — LDA/FINRA/affiliation |
| Sprint 6 — Agentic alignment + test coverage |
| Sprint 7 — Opportunity edit dialog + permissions |
| Sprint 7.5 — SF field audit + NPSP payment summary |
| Sprint 8 — Multi-object editing (Account, Contact, Payment) |

## Superseded

| Plan | Superseded By |
|------|---------------|
| Funnel Net Indicator Polish | Funnel Polish and AI |
| Sprint 7 — UX polish (original Pebble roadmap) | Sprint 7 became Opportunity edit dialog; UX items moved to Sprint 13 |
| Sprint 8 — Team enablement (original Pebble roadmap) | Sprint 8 became multi-object editing; team items moved to Sprint 12 |

## Reference (strategic, no implementation)

| Plan |
|-----|
| Pebble Bedrock Integration Architecture |
| Pebble PRD Review and Team Prompt |

## Meta

| Plan |
|-----|
| Plan Overlap Cleanup |
