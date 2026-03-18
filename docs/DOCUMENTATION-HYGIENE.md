# Documentation and Architecture Hygiene

Guidelines for keeping docs and architecture clean and maintainable.

## Documentation

### Single source of truth

Each concept lives in one place. Link, don't duplicate. If something changes, update the canonical doc and fix broken links.

### Where things go

| Content | Location |
|---------|----------|
| Product vision, scope, specs | `product/` |
| Phase specs, sprint plans | `product/fundraising-team/phases/` |
| Deferred/archived features | `product/archive/` (index in ARCHIVE-INDEX.md) |
| Technical reference (Sage, Salesforce, Slack) | `product/reference/` |
| Architecture decisions | `docs/architecture-decisions.md` |
| Setup, run, deploy | `financial_forecasting/DEV_SETUP_GUIDE.md`, `env.production.template` |
| Session lessons, todos | `tasks/lessons.md`, `tasks/todo.md` |

### When to update

After any change that affects behavior, config, or architecture. Keep ARCHIVE-INDEX, CLAUDE.md Documentation Map, and `product/README.md` in sync when adding or moving docs.

### Archive policy

- **docs/archive/** — Historical session artifacts. Keep for reference; do not treat as current. Do not create new docs here.
- **product/archive/** — Archived product specs; index in ARCHIVE-INDEX.md.

**When to check archives:** Before implementing a feature, check `product/archive/ARCHIVE-INDEX.md` for deferred specs and `docs/archive/README.md` for session artifacts on related topics. Grep for keywords (e.g. `cashflow`, `research`) if unsure.

### Avoid

- Stale READMEs
- Duplicate env templates
- Orphaned docs

Grep before creating; prefer updating existing docs.

---

## Architecture

### Canonical definitions

Use `product/crm-architecture/canonical-definitions.md` for names, enums, and terms. Don't invent new names without checking.

### Feature register

When adding features, update `product/crm-architecture/feature-register.md` (phase, dependencies).

### Decisions

Non-obvious choices go in `docs/architecture-decisions.md` with context and trade-offs.

### Archive before delete

When deprecating a feature, add a planning doc to `product/archive/` and update ARCHIVE-INDEX before removing from nav or code.

---

## Ongoing

- Review docs when touching related code. Fix broken links and outdated examples.
- Keep `product/README.md` and CLAUDE.md Documentation Map as the entry points; they should reflect the current structure.
