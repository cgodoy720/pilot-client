# Sprint Execution Plan — Post-M18

> Updated: 2026-03-30 | Rollout: 2026-03-31
> Source of truth for milestone status: `docs/PLAN-INDEX.md`

## Completed Milestones

| Milestone | Shipped | Summary |
|-----------|---------|---------|
| M9: Schema Qualification | 2026-03-27 | 23 tables deployed, `bedrock.` prefix on all 93 SQL statements |
| M10: Activities Foundation | 2026-03-29 | 11 endpoints, SF sync, full-text search, soft delete |
| M11: Pebble PostgreSQL Migration | 2026-03-30 | SQLite → asyncpg/psycopg2 |
| M12: Pebble Access Control | 2026-03-29 | RBAC, per-user cost limits, budget chip |
| M18: Project Soft-Delete | 2026-03-30 | Cascade soft-delete, trash UI, restore, admin purge |

## Corrected Dependency Graph

```
M10 ✅ ──┬──► M13 (2 sessions) ──┐
         │                        ├──► M16 (1 session)
         └──► M15 (2 sessions) ──┘
M12 ✅ ──► M17 (1 session)
M18 ✅ ──► M19 (1 session)
M11 ✅ ──► M14 (BLOCKED — waiting on SF field definitions)
```

**Key correction:** M15 (Chrome Extension) depends on M10's API endpoints only — NOT on M13's frontend components. M13 and M15 can run in parallel.

## Session-by-Session Breakdown

Every session is scoped to ship in one focused terminal session (3-5 hours).

### Immediate (pre-rollout)

| Session | Milestone | What ships | Depends on |
|---------|-----------|------------|------------|
| **1** | **M17** | SF field validation — audit via `describe()`, sync frontend validation rules | M12 ✅ |

### Activities Track (parallel streams)

| Session | Milestone | What ships | Depends on |
|---------|-----------|------------|------------|
| **2** | **M13 session 1** | Activity TS types + API service methods + ActivityTimeline component | M10 ✅ |
| **3** | **M13 session 2** | OpportunityDetailModal (5 tabs) + ContactDetailModal (3 tabs) + page wiring | M13.1 |
| **4** | **M15 session 1** | Manifest V3 + service worker + Gmail/GCal content scripts + API client | M10 ✅ |
| **5** | **M15 session 2** | Popup UI: OppPicker + TaskLinker + CascadeFlow + ThreadPreview + testing | M15.1 |
| **6** | **M16** | Wire modals into Opportunities/Contacts pages, global search, full regression | M13 + M15 |

### Independent

| Session | Milestone | What ships | Depends on |
|---------|-----------|------------|------------|
| **7** | **M19** | `owner_email` column, `project_contributor` table, owner-only delete | M18 ✅ |

### Blocked

| Milestone | Blocked on | Can start when |
|-----------|-----------|----------------|
| **M14**: Pebble Persistence + CRM Bridge | SF field definitions from senior devs | External unblock |

## Optimal Execution Order

```
Session 1:  M17  (SF validation — quick win for rollout)
Session 2:  M13.1  (ActivityTimeline — core visibility)
Session 3:  M13.2  (Detail modals — full activities UX)
Session 4:  M15.1  (Extension scaffold — can parallel with M13.2)
Session 5:  M15.2  (Extension UI + flows)
Session 6:  M16  (Integration + QA — ties it all together)
Session 7:  M19  (Project ownership — slot anywhere)
```

M19 is independent and can be inserted between any sessions if the team needs ownership gates sooner.

## Scope Notes from Codebase Verification

- **M17 is narrower than originally planned.** Pebble cost display and failed agent visibility were already shipped in M12. M17's remaining scope is just SF `describe()` audit + frontend validation alignment.
- **M13 frontend is 0% complete.** No Activity TypeScript types, no API methods, no components exist yet. Backend (M10) is fully ready.
- **M15 is self-contained.** Extension builds its own popup UI from scratch — it calls M10's API endpoints directly, not M13's React components.
- **M16 is wiring only.** All components will exist from M13 + M15. M16 just connects them to existing pages and runs regression.
