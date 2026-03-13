---
type: decision
id: dec-2026-03-13-indexeddb-prototype
date: 2026-03-13
status: accepted
decided_by: jp
---

# Decision: Use IndexedDB for Prototype Data Persistence

## Context

The Prospect Dashboard needs to persist data across browser sessions during the prototype phase (Phases 1-3). We need to choose between: a server-side database from day one, or client-side persistence with a migration path.

## Decision

Use IndexedDB (via Dexie.js wrapper) for Phases 1-3. Migrate to PostgreSQL in Phase 4+.

## Reasoning

- **Speed to ship:** IndexedDB requires no backend server, no database setup, no hosting costs. We can focus entirely on the frontend and ship a working prototype in weeks.
- **Dexie.js:** Provides a clean Promise-based API over IndexedDB that feels similar to working with a real database. This means the code patterns translate reasonably well to a future backend.
- **Sufficient for prototype:** The team is small (3-5 users). Data volumes are modest (thousands of contacts, hundreds of opportunities). IndexedDB handles this easily.
- **No auth needed yet:** Without a backend, we skip the entire authentication/authorization complexity for now.

## Alternatives considered

- **PostgreSQL from day one:** Would give us proper encryption, backups, multi-user access. Rejected because it doubles the build timeline and adds deployment complexity. We'd be building infrastructure instead of shipping a tool the team can use.
- **SQLite via sql.js (in-browser):** More SQL-like than IndexedDB, but adds a WASM dependency and is less well-supported in the Dexie ecosystem. No significant advantage for our use case.
- **JSON files on a server:** Simple but no query capability, no concurrent access, fragile.

## Risks

- **No encryption at rest:** IndexedDB data is accessible to anyone with physical access to the machine. Acceptable for Pursuit-managed devices, not acceptable for personal devices. See [[security-requirements]].
- **No backup:** If a user clears browser data, it's gone. Mitigation: regular CSV exports. Document this for the team.
- **Single-device lock-in:** Each user's data is local to their browser. No shared state between team members until Phase 4 migration. Mitigation: team uses the deployed version (Vercel/Netlify), not local dev.
- **Migration effort:** Moving from IndexedDB to PostgreSQL will require a data export/import process. Mitigation: design the IndexedDB schema to mirror the future PostgreSQL schema exactly (see [[data-model]]).

## Follow-up

- Design IndexedDB schema to be PostgreSQL-compatible from day one ([[data-model]])
- Document CSV export as a backup mechanism for the team
- Plan the PostgreSQL migration as a Phase 4 workstream
