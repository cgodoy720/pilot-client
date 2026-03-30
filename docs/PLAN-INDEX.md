# Sprint & Milestone Index

Master index of all planned and completed milestones. Unique numbering — no duplicates, no ambiguity.

**Last completed:** M18 (Project Soft-Delete, 2026-03-30)
**Last shipped:** M18 (Project Soft-Delete, 2026-03-30)

---

## Execution Order & Dependencies

```
M9  ✅  Schema Qualification
M10 ✅  Activities Foundation (backend)
M11 ✅  Pebble PostgreSQL Migration
M12 ✅  Pebble Access Control
M18 ✅  Project Soft-Delete
 │
 ├──► M13 (Activities Timeline)  ─► M15 (Chrome Extension) ─► M16 (Integration + QA)
 ├──► M17 (SF Audit + UX Polish)     ← quick win
 ├──► M19 (Project Ownership)         ← deferred from M8
 └──► M14 (Pebble Persistence)       ← BLOCKED on SF field definitions
```

**M13 and M17 are unblocked.** M14 is code-ready but blocked on external SF field definitions from senior devs.

---

## Open (actionable)

| Milestone | Plan File | Depends On | Size | Status | Summary |
|-----------|-----------|------------|------|--------|---------|
| **M13: Activities Timeline + Modals** | `tasks/sprint9-activities-extension-plan.md` (9B section) | M10 ✅ | L | Ready | ActivityTimeline component, Opportunity/Contact detail modals. |
| **M14: Pebble Persistence + CRM Bridge** | `tasks/sprint11-pebble-persistence-crm.md` | M11 ✅ | M (~1-2 sessions) | BLOCKED on SF field definitions | Wire conflict_log, scratchpad; PATCH/PUT to CRM bridge. |
| **M15: Activities Chrome Extension** | `tasks/sprint9-activities-extension-plan.md` (9C section) | M13 | L | Planned | Manifest V3, Gmail/GCal content scripts, Opp-first cascade, GCS attachments, thread detection. |
| **M16: Activities Integration + QA** | `tasks/sprint9-activities-extension-plan.md` (9D section) | M15 | M | Planned | Wire modals into pages, global search, full regression. Worktree for safety. |
| **M17: SF Audit + UX Polish** | `tasks/sprint13-sf-audit-ux-polish.md` | M12 ✅ | S (~1 session) | Ready | Audit SF required fields via describe(), sync frontend validation. M12 already shipped the budget chip. |
| **M19: Project Ownership Model** | (plan needed) | M18 ✅ | S-M | Planned | owner_email + contributors, owner-only delete. Deferred from M8 scope. |
| Bedrock UI Improvements | `tasks/bedrock-ui-improvements.md` | Nothing | Ongoing | Mixed | 5 small, 7 medium, 3 large. Parallel with all tracks. |
| Google OAuth Setup | (in .cursor/plans/) | Nothing | S | Partially done | FRONTEND_URL env, OAUTH_SPRINT_CHECKLIST, redirect fix. |

### Blocked Items (external dependency)

| Item | Plan File | Blocked On |
|------|-----------|------------|
| Serper Integration | `tasks/serper-integration-sprint.md` | Serper.dev API key not configured |
| OpenCorporates Data | (tracked in `tasks/todo.md`) | OpenCorporates API key not obtained |
| M14: Pebble Persistence | `tasks/sprint11-pebble-persistence-crm.md` | SF field definitions from senior devs |

---

## Completed

| Milestone | Date |
|-----------|------|
| M1: Production-Grade Security MVP | 2026-03-18 |
| M2: MVP Performance Pass | |
| M3: Bedrock Rollout and Pebble Alignment | |
| Bedrock PR Roadmap (PRs 1-10) | 2026-03-20 |
| Funnel Polish and AI | |
| Funnel Visual Redesign | |
| Calendar Layout Simplification | |
| Dashboard and Backend Plan | |
| Pipeline Scenario Cards | |
| Revenue vs Cashflow Layout | |
| Notification Bell Dropdown | |
| Stage B Sprint 1 — LDA/FINRA/affiliation | |
| M6: Agentic alignment + test coverage | |
| M7: Opportunity edit dialog + permissions | |
| M7.5: SF field audit + NPSP payment summary | |
| M8: Multi-object editing (Account, Contact, Payment) | 2026-03-26 |
| M8 Delete-Safety Planning | 2026-03-26 |
| M9: Schema Qualification — 23 tables deployed to segundo-db | 2026-03-27 |
| M10: Activities Foundation — backend-only, 11 endpoints, SF sync | 2026-03-29 |
| M12: Pebble Access Control — RBAC, cost limits, budget chip | 2026-03-29 |
| M11: Pebble PostgreSQL Migration — SQLite → asyncpg/psycopg2 | 2026-03-30 |
| M18: Project Soft-Delete — cascade soft-delete, trash UI, restore & purge | 2026-03-30 |

## Superseded

| Plan | Superseded By |
|------|---------------|
| Funnel Net Indicator Polish | Funnel Polish and AI |
| Sprint 7 — UX polish (original Pebble roadmap) | M7 became Opportunity edit dialog; UX items → M17 |
| Sprint 8 — Team enablement (original Pebble roadmap) | M8 became multi-object editing; team items → M12 |

## Old Sprint → New Milestone Mapping

For reference, the old sprint names map to:

| Old Name | New Milestone |
|----------|---------------|
| Sprint 9 — Schema qualification (Track A) | **M9** |
| Sprint 9A — Activities Foundation (Track D) | **M10** |
| Sprint 9B — Activities Timeline (Track D) | **M13** |
| Sprint 9C — Activities Extension (Track D) | **M15** |
| Sprint 9D — Activities Integration (Track D) | **M16** |
| Sprint 10 — Pebble PostgreSQL (Track A) | **M11** |
| Sprint 11 — Pebble Persistence (Track A) | **M14** |
| Sprint 12 — Pebble Access Control (Track B) | **M12** |
| Sprint 13 — SF Audit + UX (Track B) | **M17** |
| (new) Project Soft-Delete | **M18** |
| (new) Project Ownership Model | **M19** |

## Reference (strategic, no implementation)

| Plan |
|-----|
| Pebble Bedrock Integration Architecture |
| Pebble PRD Review and Team Prompt |
| CRM Duplicate Detection (`tasks/crm-duplicate-detection-plan.md`) — ready when needed |
