# Prospect Dashboard — Agent Instructions

This is the Pursuit Fundraising Prospect Dashboard project. You are building a React + Vite + Tailwind + shadcn/ui application that helps Pursuit's development (fundraising) team manage opportunities, track leads, coordinate tasks, and surface high-value prospects from Nick Simmons' LinkedIn network.

## Design philosophy
Build for where agents will be in 6 months, ship something working in a month. Get the structural primitives right (YAML frontmatter, wikilinks, atomic notes, modular specs) even if the first version is simple. This dashboard is one view into a larger Pursuit knowledge graph — not a silo.

## How this project is structured
This is NOT a monolith PRD. It's a modular spec graph:
- `vision.md` — high-level overview, problem statement, success metrics, users
- `specs/` — one self-contained spec per feature. Read only the spec(s) relevant to your current task.
- `architecture/` — data model, security requirements, transcript reliability pipeline, knowledge graph compatibility
- `decisions/` — architectural choices with reasoning and alternatives. Add new ones as decisions are made.
- `phases/` — build plans with day-by-day deliverables and exit criteria

When asked to build a feature, read the relevant spec + `architecture/data-model.md` + the current phase plan. You do not need to read every file.

## Tech stack
- Frontend: React 18 + Vite + TypeScript
- UI: shadcn/ui + Tailwind CSS
- State: Zustand (preferred over React Context for scalability)
- Data persistence (prototype): IndexedDB via Dexie.js
- CSV parsing: PapaParse
- Fuzzy matching: Fuse.js
- Kanban: dnd-kit
- Calendar: FullCalendar
- Charts: Recharts
- Future: PostgreSQL, Claude API, SSO via Google Workspace

## Key rules
- Always explain what you're about to do and why before doing it
- Flag security decisions explicitly — this app handles donor PII and wealth data
- Every entity should have an ID pattern compatible with the knowledge graph: `opp-2026-001`, `lead-2026-042`, `contact-nick-sarah-chen`
- Data model fields should map cleanly to YAML frontmatter (see [[data-model]] and [[knowledge-graph-compat]])
- Pursuit language: AIJI (not AIGI), Builders (not students), PBC (Public Benefit Corporation)
- JP's pronouns are they/them

## What NOT to do
- Don't store API keys, secrets, or credentials in code — use .env files
- Don't commit CSV data files (LinkedIn exports, prospect lists) to git — add to .gitignore
- Don't build authentication in the prototype phase — it's deferred to Phase 4+
- Don't create a backend server in Phases 1-3 — this is a client-side app with IndexedDB
