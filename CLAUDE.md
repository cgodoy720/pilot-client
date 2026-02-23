# Admissions Dashboard Agent Guardrails

You are a full-stack agent that modifies the Admissions Dashboard UI and can make targeted backend changes to support frontend features.

## Two Repos

- **pilot-client** (this repo) — React front-end. You may READ and MODIFY files here (within allowed paths).
- **test-pilot-server** (sibling directory) — Express backend. You may READ all files and MODIFY files in queries/, controllers/, and routes/ directories.

## Allowed Modification Paths — pilot-client

- `src/pages/AdmissionsDashboard/**` — all files in the Admissions Dashboard page directory
- `src/components/ui/**` — shared UI components

## Allowed Modification Paths — test-pilot-server (prefix with "server:")

- `queries/**` — SQL query files (add fields to SELECT clauses, create new query functions)
- `controllers/**` — route handlers (expose new data, adjust response shapes)
- `routes/**` — route definitions (add new endpoints if needed)

**When a backend change is simpler and more correct (e.g. adding a field to a SQL SELECT), prefer that over client-side workarounds like N+1 API calls.**

## Forbidden Modifications — pilot-client

- `package.json`, `package-lock.json` — no dependency changes
- `.env`, `.env.*` — no environment files
- `vite.config.*`, `tsconfig.*`, `tailwind.config.*`, `postcss.config.*` — no build config
- `index.html` — no HTML changes
- `src/main.*`, `src/App.*` — no app entry point changes
- `src/routes/**`, `src/auth/**` — no routing or auth changes
- Any page outside `src/pages/AdmissionsDashboard/` — no other pages

## Forbidden Modifications — test-pilot-server

- `db/dbConfig.*`, `db/schema*`, `db/migrations/*` — **NO database schema or connection changes**
- `server.js`, `app.js` — no server entry point changes
- `middleware/auth*`, `middleware/activeUser*`, `middleware/permission*` — no auth/permission middleware
- `config/*` — no configuration changes
- `services/*`, `utils/*` — no service layer or utility changes
- `package.json`, `.env*` — no dependency or environment changes

## Forbidden Actions

- Do NOT install new npm packages
- Do NOT create new page routes (server API routes in routes/*.js are OK)
- Do NOT delete existing files
- Do NOT modify imports from packages not already in use
- Do NOT add environment variables
- Do NOT modify any test configuration
- Do NOT modify database schema, run migrations, or change table structures
- Do NOT modify authentication or authorization middleware

## Design System

- **CSS Framework**: Tailwind CSS with utility classes
- **Component Library**: shadcn/ui
- **Brand Colors**:
  - Pursuit Purple: `#4242EA`
  - Carbon Black: `#1E1E1E`
- **Font**: Proxima Nova
- Use existing color variables and design tokens where available

## Code Style

- React functional components with hooks
- Follow existing patterns in the codebase
- Keep changes minimal — do the least amount of work to fulfill the request
- **Use edit_file for existing files** — do NOT rewrite large files with write_file
- Use write_file only for creating brand new files
- If the request is unclear or would require out-of-scope changes, make NO changes and explain why in your output
