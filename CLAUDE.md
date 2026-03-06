# Pursuit AI Native Platform

Learning management platform for workforce development. Two repos: `pilot-client` (React 19 + Vite + Tailwind + shadcn/ui) and `test-pilot-server` (Node.js + Express + PostgreSQL via pg-promise).

## Developer Context
Stefano Barros (stefano@pursuit.org) — L3 Program Facilitator. Uses Claude Code as primary build tool. Not a professional developer — explain tradeoffs, flag risks before acting.

## Frontend Patterns

- **Path alias**: `@/*` → `./src/*`
- **Routing**: `main.jsx` = public routes, `App.jsx` = protected routes inside `<Layout>`. Pathfinder is nested — `Pathfinder.jsx` renders tab nav + `<Outlet/>`
- **API calls are mixed** — some use inline `fetch()` with token header, some use `fetchWithAuth()` from `utils/api.js`, some use axios. Match whatever pattern the surrounding code uses.
- **State**: useState + useContext only. No Redux. `useAuth()` gives user, token, isAuthenticated.
- **Styling**: Tailwind utilities first. Brand colors: `pursuit-purple: #4242EA`, `carbon-black: #1E1E1E`, `stardust: #E3E3E3`. Dark mode via next-themes.
- **Notifications**: `Swal.fire()` (SweetAlert2) for toasts/confirmations.
- **UI primitives**: shadcn/ui (33+ components in `components/ui/`). Use these before building custom.
- **Reference implementation**: `PathfinderEventHub/` — shows the pattern for Pathfinder feature pages with filters, cards, detail views, and dialog forms.

## Backend Patterns

- **Route mounting**: Controllers are Express Routers mounted directly in `app.js`: `app.use('/api/pathfinder/events', pathfinderEventHubController)`
- **Controller → Queries → DB**: Controllers handle HTTP, queries handle SQL. Keep them separate.
- **Query layer**: Raw SQL with pg-promise parameterized queries (`$1`, `$2`). Use `db.one()` (exactly one row), `db.oneOrNone()` (one or null), `db.any()` (array), `db.none()` (no return).
- **Auth inconsistency**: Sometimes `req.user.userId`, sometimes `req.user.user_id`. Check existing Pathfinder controllers for which one they use, and match it.
- **Error pattern**: Try-catch in every handler, `console.error()`, generic 500 to client. No centralized logger.
- **Migrations**: `db/migrations/` — ~40 files. Use descriptive filenames. Always use `IF NOT EXISTS` and wrap in `BEGIN/COMMIT`.
- **No test suite**: Backend has no automated tests. Test manually by running queries and hitting endpoints.

## Naming Conventions
- Frontend: PascalCase folders/files for components (`PathfinderEventHub.jsx`), camelCase for utils/services
- Backend: `featureNameController.js` + matching `featureName.js` in queries/
- DB columns: snake_case. Primary keys: SERIAL with `_id` suffix. Timestamps: `created_at`/`updated_at` with `DEFAULT NOW()`

## Collaboration — Do Not Break
- **Stefano's fork**: `dkydkydky/pilot-client` and `dkydkydky/test-pilot-server`
- **Upstream**: `cgodoy720/pilot-client` and `cgodoy720/test-pilot-server`
- **Joanna (joannap07)** is building Employment Engine (Sputnik) on `origin/joanna` — creates `contacts`, `staff_contact_relationships`, `intro_requests` tables. Do NOT modify those tables or `outreach`.
- Before creating migrations, check for conflicts with recent upstream changes.
- "Builders" is always capitalized in all communications and UI text.

## Current Scope — Phase 1 ONLY
Build ONLY these features:
- Builder interests/goals (My Strategy)
- Resume upload and storage (up to 5)
- Resume-to-application linking (nullable `resume_id` on `job_applications` — the ONLY existing table alteration)
- Dashboard redesign with goal statement + simplified layout
- Builder-owned weekly goals with progress bar
- Staff weekly goal suggestions per cohort

Do NOT build Phase 1.5+ features: `work_type`, `linked_build_id`, payment fields, connected tracking, pipeline view — those require Sputnik coordination.

## Rules for AI Assistants (Claude Code + Cursor)
1. Use Tailwind utility classes as the primary styling approach. When writing standalone CSS (co-located .css files), use BEM naming conventions. Do not mix the two in the same context.
2. Before making any changes, explain the plan and ask for approval before writing code or creating files. For multi-step work, break into phases and get approval at each phase.
3. Only touch one file at a time when making updates. Wait for acceptance before moving to the next file.
4. Always explain what you are doing and why — especially for architectural decisions or choosing between patterns in the codebase.
5. Follow the current project's file structure and style conventions. When in doubt, reference `PathfinderEventHub/` as the pattern for new Pathfinder features.
6. Entry points: Backend starts at `app.js`, Frontend starts at `main.jsx`. Pathfinder routes are nested — `Pathfinder.jsx` renders tab nav + `<Outlet/>`.
7. Never modify, create, or edit any files without explicit user approval. Always explain what you want to change and wait for permission.
8. Do not modify tables owned by Sputnik: `contacts`, `staff_contact_relationships`, `intro_requests`, `outreach`.
9. "Builders" is always capitalized in UI text, comments, and communications.
10. Commit after each completed step or logical milestone. Don't let multiple steps pile up uncommitted. Use conventional commit messages like `feat(pathfinder): add builder interests API`.
11. Never push to upstream. Only push to origin (fork). All merges to upstream happen via PR with explicit approval.

## Workflow
- Use Plan Mode for any task with 3+ steps. Present the plan for review before executing. If something goes sideways, STOP and re-plan — don't keep pushing.
- If `tasks/todo.md` or `tasks/lessons.md` exist in the project, read them at session start.
