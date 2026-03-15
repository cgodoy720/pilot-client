# Pursuit Financial Forecasting & Bedrock

Project instructions for Claude Code when working in this repo (CLI or IDE). Keep this file in sync with `.cursor/rules/bedrock-and-week1.mdc` for Cursor.

---

## Project overview

- **Main app:** `financial_forecasting/` — React (CRA) + MUI + FastAPI, wired to Salesforce and Sage Intacct (Revenue Hub / grants pipeline).
- **Product docs:** `product/` — vision, roadmap, phase specs, requirements gaps. Bedrock (fundraising CRM, prospect intelligence, reporting) will eventually live in the unified learning platform; we prototype here first.

---

## Week 1 prototype (current focus)

- **Build in:** `financial_forecasting/frontend/`. **New page:** `financial_forecasting/frontend/src/pages/WeeklyPriorities.tsx`.
- **Stack:** **React + MUI** (existing app). Do **not** switch to Vite/Tailwind/shadcn for week 1 — we use the current stack to reuse Salesforce and ship fast.
- **Spec:** `product/fundraising-team/phases/week-1-prototype.md` — inputs, output, build decisions (prospect↔grant link, “this week” = next 7 days, CSV mapping, validation, ID format), implementation order.
- **Rigor:** `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md` — contracts, invariants, testable acceptance criteria.
- **API:** Use `apiService.getOpportunities()` from `financial_forecasting/frontend/src/services/api.ts`; filter client-side for close date in next 7 days. CSV in browser (e.g. PapaParse); no new backend for week 1.

---

## Prospect-dashboard (net-new work, later)

- **Specs:** `product/fundraising-team/raw-prds/prospect-dashboard/` — vision, specs, architecture, decisions.
- **Stack for that work:** React + Vite + Tailwind + shadcn/ui (see `product/fundraising-team/raw-prds/prospect-dashboard/CLAUDE.md` and `decisions/2026-03-13-react-vite-stack.md`). This does **not** apply to the week-1 prototype in `financial_forecasting`.

---

## Conventions

- No secrets or CSV data in git; `.env` and data files in `.gitignore`.
- **Product:** `product/overview.md`, `product/ROADMAP-AND-STANDARDS.md`, `product/fundraising-team/phases/` (week-1, Slack, custom reports).
- **Grants PRD:** root `PRD.md` (Salesforce/Sage, pipeline, payments).

---

## Useful commands

- Frontend: `cd financial_forecasting/frontend && npm start`
- Backend: from `financial_forecasting/` run the FastAPI server per project README
