# Week 1 Prototype: Spreadsheet → Weekly Priority List

**Goal:** Turn a messy prospect/contact spreadsheet (e.g. Nick’s research and contact list) into an **actionable weekly priority list** laid out by **dates relevant to grant deadlines**, so the team knows what to focus on each week.

**Reference:** `product/ROADMAP-AND-STANDARDS.md` (phased plan, week 1 deliverable, checklist).

---

## Inputs

1. **Messy spreadsheet (or CSV export)**  
   Prospect/contact list with at least: names, and ideally org, title, notes, source. Parser should tolerate missing columns and extra columns (map what exists; ignore or flag the rest).

2. **Grant/opportunity deadlines**  
   From this repo’s existing Salesforce-backed opportunities: close date, stage, and any other date fields we use (e.g. proposal due, follow-up by). If Salesforce isn’t wired for week 1, use a stub or small CSV of “grant name, close date, stage” so the weekly view has something to sort by.

---

## Output

- **One view: “This week’s priorities”**  
  - A list of **prospects/contacts to focus on this week**, ordered or grouped by **dates relevant to grants** (e.g. close date this week, proposal due, follow-up by).  
  - Each row (or card) should answer: who, why this week (which grant/deadline), and what action (e.g. “Follow up,” “Send proposal,” “Check in before close date”).

- Optional: simple filters (e.g. “only show items due in next 7 days” or “by grant”).

---

## Scope (in / out)

**In scope for week 1:**

- Import spreadsheet/CSV into a simple prospect/contact structure (in-memory or IndexedDB).
- Use grant deadlines (from Salesforce or stub) to drive ordering/grouping.
- Single screen: weekly priority list with dates and clear “why” (tied to a grant/deadline).
- No secrets or data files in git; `.gitignore` for `.env` and CSVs.

**Out of scope for week 1:**

- Full network search, LinkedIn cross-reference, or HNWI matching.
- Persistence in a shared/remote DB (local/IndexedDB or in-memory is fine).
- Auth, RBAC, or audit logging.
- Full CRM (that comes in later phases).

---

## Success criteria (definition of done)

- [ ] User can upload the messy spreadsheet (or CSV) and see prospects/contacts in the app.
- [ ] Grant/opportunity deadlines (real or stub) are visible and used for ordering.
- [ ] One view shows “this week’s priorities” — prospects and tasks laid out by dates relevant to grant deadlines.
- [ ] No CSV or secrets committed; `.gitignore` updated as needed.
- [ ] Product/roadmap docs updated if scope changed.

---

## Data model (minimal for week 1)

- **Prospect/contact (from spreadsheet):** id (or generated), first_name, last_name, organization, title, notes, source (e.g. “nick_spreadsheet”). Optional: email, phone if present in sheet.
- **Grant/opportunity (from Salesforce or stub):** id, name, close_date, stage; optional: proposal_due_date, follow_up_by.
- **Weekly priority item:** prospect + grant/deadline + suggested action (e.g. “Follow up before close date 2026-03-20”). Derived from “what’s due this week” and “who is linked to that grant” (link can be manual at first, e.g. “this prospect is relevant to Grant X”).

If the spreadsheet doesn’t yet have “linked grant,” week 1 can show: (1) list of prospects from sheet, (2) list of grants with deadlines this week, and (3) a simple way to assign a prospect to a grant so they appear together in the weekly list. Full linkage can be refined in the next phase.

---

## References

- `product/ROADMAP-AND-STANDARDS.md` — unified platform, phased plan, standards, week 1 checklist.
- `product/overview.md` — Bedrock vision and capabilities.
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md` — Contact, Lead, Opportunity; week 1 uses a minimal subset.
- `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md` — gaps and rigor; week 1 contract and acceptance criteria.

---

## Week 1 build decisions (locked for implementation)

So we can build without re-deciding mid-sprint, these are the chosen options. Update only if product explicitly changes them.

| Decision | Choice | Notes |
|----------|--------|--------|
| **Prospect ↔ grant link** | User assigns prospect to one grant via a **dropdown of opportunities** (grants with deadlines in the chosen “this week” range). Stored as `grant_id` (opportunity id) on the prospect. | No spreadsheet column matching in week 1. |
| **“This week”** | **Next 7 days** from today (inclusive). A grant is “due this week” if `close_date` is within [today, today+6]. | Easy to compute; no timezone dependency beyond “user’s today.” |
| **CSV column mapping** | **Required:** at least one of `name` or `first_name`+`last_name`. **Optional:** organization, title, notes, email, phone. **Aliases:** Name, First Name/FirstName, Last Name/LastName, Company/Org, Title, Notes, Email, Phone (normalize trim + lower). **Missing required:** skip row, add to `errors` with row number; do not fail entire file. **Max rows:** 10,000; **max file size:** 5 MB. | Partial success allowed; user sees imported + errors. |
| **Validation** | Required per row: (name) or (first_name and last_name). Empty rows skipped. Invalid rows in `errors[]`. | |
| **ID generation** | `prospect-{Date.now()}-{index}` (e.g. `prospect-1710000000000-0`). Index = row index in parsed file (0-based). | Unique and sortable. |

---

## Where to build & implementation order

**Repo:** This repo only. **App:** `financial_forecasting` (React + MUI, FastAPI). **New page:** `financial_forecasting/frontend/src/pages/WeeklyPriorities.tsx`. **Route/nav:** Add `/weekly-priorities` in `App.tsx` and a nav item in `Layout.tsx`. **CSV:** Parse in browser (e.g. PapaParse); no new backend. **Grants:** Use existing `apiService.getOpportunities()`; filter client-side for close date in next 7 days (stub if API lacks close date). **State:** In-memory React state; optional IndexedDB. **Types:** Optional `types/weeklyPriorities.ts` for Prospect, Grant, WeeklyPriorityItem.

**Order:** (1) Types + column aliases. (2) CSV parse (max 10k rows, 5 MB; skip bad rows into `errors`). (3) Page shell: file input, parse, show imported + errors. (4) Fetch opportunities, filter “this week.” (5) Prospect ↔ grant dropdown; store `grant_id`. (6) Priorities view: by grant, who/why/action. (7) Import result as contract shape; smoke-test. **Dependencies:** `papaparse`. No new backend endpoint. **After week 1:** See roadmap (network search, Slack review, custom reports).
