## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- This includes UI changes — plan and ask clarifying questions before building
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 2a. Agent Teams (Claude Code)
- When using Claude Code for development, prefer Agent Teams for complex multi-step work where parallel exploration adds value: cross-layer coordination, debugging with competing hypotheses, or research across different aspects
- Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (requires Claude Code v2.1.32+)

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Target Platform Compatibility

This project will integrate into the Pursuit AI-native learning platform. Keep these stack and pattern choices in mind:

- **Target stack**: React 19 + Vite + Tailwind + shadcn/ui | Node.js + Express | PostgreSQL + pgvector
- **Auth**: JWT (via `authenticateToken` middleware), tokens in localStorage, `Authorization: Bearer` header
- **API pattern**: REST `/api/{resource}`, JSON errors `{error, details?}`, standard HTTP status codes
- **Frontend conventions**: `fetchWithAuth` utility, pages in `src/pages/`, shared components in `src/components/`, context providers in `src/context/`
- **DB**: PostgreSQL with `db.one()`, `db.any()`, `db.none()` query helpers
- **Infra**: Google Cloud (Storage, BigQuery, Cloud Run), OpenRouter for LLM calls
- **User roles to anticipate**: `builder`, `staff`, `admin`, `applicant`, `volunteer`, `enterprise_admin`
- When making architectural choices, prefer patterns that port cleanly to this stack

## Documentation Map

- **Product docs (start here):** `product/README.md` — full hierarchy and reading order
- **Developer setup:** `financial_forecasting/DEV_SETUP_GUIDE.md` — run locally, env vars, production checklist
- **Doc hygiene:** `docs/DOCUMENTATION-HYGIENE.md` — where things go, when to update, avoid orphans
- **Plan index:** `docs/PLAN-INDEX.md` — status of all Cursor plans (completed, open, superseded)
- **Scope & boundaries:** `product/crm-scope-constitution.md`
- **Canonical names/enums:** `product/crm-architecture/canonical-definitions.md` (this file governs)
- **Data model:** `product/crm-architecture/entity-map.md`
- **Feature inventory:** `product/crm-architecture/feature-register.md`
- **PRD index:** `product/crm-prds/README.md` (14 PRDs, one per component)
- **Phase specs:** `product/fundraising-team/phases/`
- **Technical reference:** `product/reference/` (Sage, Salesforce, Slack setup)
- **Architecture decisions:** `docs/architecture-decisions.md`
- **Historical PRD:** `PRD.md` (Nov 2025, partially superseded by crm-architecture/)
- **Archived product specs:** `product/archive/ARCHIVE-INDEX.md`
- **Archived session artifacts:** `docs/archive/` (index in docs/archive/README.md)
