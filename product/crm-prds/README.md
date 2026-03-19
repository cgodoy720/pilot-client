# Pursuit CRM (Bedrock) — PRD Index

> Phase 6 Deliverable | Version: 1.0 | Date: 2026-03-15
>
> Each PRD covers one logical component of the system. PRDs follow the template in this file.
> All PRDs reference the architecture docs in `product/crm-architecture/`.

---

## PRD Breakdown

| PRD | Scope | Phase | Features Covered | Status |
|-----|-------|-------|-----------------|--------|
| **01 — Data Model** | Full schema, all entities, all relationships, nonprofit/PBC separation, ID patterns, migration path | MVP | Foundation for all features | Draft (see `entity-map.md`) |
| **02 — Account & Contact Management** | CRUD, search, org hierarchy, Contact↔Account many-to-many, dedup | MVP | F03, F04, F44 | Not started |
| **03 — Opportunity Management** | Lifecycle, stages, pipeline views, stale detection, nonprofit vs. PBC | MVP | F01, F02, F05, F06, F07 | **Draft** (`03-pipeline.md`) |
| **04 — Payments & Revenue Tracking** | Payment recording, schedules, Opportunity linkage, status tracking, reconciliation fields | Post-MVP | F27, F28, F31 | Not started |
| **05 — Campaign Management** | Campaign CRUD, Campaign↔Opportunity linkage, attribution reporting | Post-MVP | F32, F33, F23 | Not started |
| **06 — Reporting & Cash Flow** | Executive dashboard, cash flow projection, revenue by stream, win rate, CSV export | MVP | F19, F20, F21, F22, F24, F25, F26 | Not started |
| **07 — Sage Integration** | Data contract, invoice push, payment pull, reconciliation sync, error handling | Post-MVP | F29, F30, F39 | Not started |
| **08 — User Roles & Permissions** | Role definitions, visibility rules, access control | MVP | F42, F43 | Not started |
| **09 — Salesforce Migration & Sync** | Initial data import, field mapping, transformation rules, validation, ongoing bidirectional sync | MVP | F38, F40, F45 | Partially exists (sync code in `data_sync.py`) |
| **10 — Unified Home Page** | Calendar view, tasks grouped by parent opp, top prospects, stale detection, 14-day window | MVP | F09, F12, F13, F06 | **Draft** (`10-home.md`) |
| **11 — Prospect Intelligence** | Prospect tracker, conversion, network search, scoring, intelligence freshness, AI enrichment | Post-MVP | F14, F15, F16, F17, F18, F47 | Not started |
| **12 — Activity & Interaction Logging** | Manual logging, Slack ingest, timeline view, transcript pipeline | MVP (manual) / Post-MVP (Slack) | F34, F35, F36, F37 | MCP Client exists for Slack |
| **13 — Grant Programmatic Requirements** | Grant date range, reporting schedule, program inputs/outputs/outcomes, metrics dashboard | MVP (capture) / Post-MVP (reporting) | F49, F50, F51 | Not started |
| **14 — Decision Audit Trail** | Decision logging with rationale, intelligence snapshot, outcome tracking | MVP | F48 | Not started |

---

## Suggested Authoring Order

**CEO demo focus:** 10 (Home Page) → 03 (Pipeline) — these two are drafted and ready for review.
**Then MVP:** 01 (Data Model) → 02 (Account/Contact) → 09 (SF Sync) → 06 (Reporting) → 08 (RBAC) → 12 (Activity) → 13 (Grant Requirements) → 14 (Decision Trail)
**Then Post-MVP:** 04 (Payments) → 07 (Sage) → 05 (Campaign) → 11 (Prospect Intelligence)

---

## PRD Template

Every PRD follows this structure. Copy and fill in.

```markdown
# PRD — [Component Name]

> Version: 0.1 | Status: Draft | Date: YYYY-MM-DD
> Author: [name]

---

## Purpose

One paragraph: what problem does this component solve and for whom?

---

## Scope

**In scope:**
- ...

**Out of scope:**
- ...

---

## User Stories

- As a [role], I need to [do something] so that [outcome].
- ...

---

## Data Requirements

Entities touched, fields needed, relationships assumed.
Reference: `product/crm-architecture/entity-map.md`

---

## Functional Requirements

1. The system must ...
2. The system must ...
3. ...

---

## Non-Functional Requirements

- **Performance:** ...
- **Security:** ...
- **Reliability:** ...
- **Scale limits:** ...

---

## Integration Dependencies

What other PRDs or systems must exist first?

| Dependency | Type | Notes |
|-----------|------|-------|
| PRD XX | Hard / Soft | ... |

---

## Open Questions

Decisions not yet made. Resolve before development starts.

1. ...
2. ...

---

## Acceptance Criteria

How do we know this is done and working?

### Positive scenarios
- Given [context], when [action], then [expected result].

### Negative scenarios
- Given [context], when [invalid action], then [expected error handling].

### Data invariants
- [Invariant that must always hold true]
```

---

## Future Feature Specs

Specs for features that are planned but blocked on external dependencies.
These are separated from the numbered PRD sequence to prevent scope creep
while ensuring the vision isn't lost.

| Spec | Depends On | Status |
|------|-----------|--------|
| [Pebble Network Intro Routing](pebble-network-intro.md) | Learning platform integration (LinkedIn contacts) | Future — blocked |

---

## Cross-References

- **Read first:** `product/crm-architecture/canonical-definitions.md` (stages, field names, IDs, enums — this file governs)
- **Architecture docs:** All in `product/crm-architecture/` (entity-map, user-journey-matrix, information-flows, integration-register, feature-register, error-contract)
- **Scope:** `product/crm-scope-constitution.md` — every PRD must trace to core jobs
- **Gaps:** `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md` — open questions to resolve
