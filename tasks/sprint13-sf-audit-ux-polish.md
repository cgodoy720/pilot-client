# Sprint 13: SF Required Fields Audit + Pebble UX Polish (Track B — Production Guardrails)

## Context

Two remaining items before real users can comfortably use the system:
1. Frontend must validate the same required fields that exist in Pursuit's Salesforce org
2. Pebble UX has two remaining items from Stage 1 that affect usability for non-JP users

## Prerequisites

- Salesforce API access (OAuth connected)
- Sprint 12 complete (Pebble access control in place)

## Scope

### 1. SF Required Fields Audit

Ref: `tasks/sprint-backlog-sf-audit.md`

- Hit Salesforce `describe()` API for Opportunity, Task, Contact, Account
- Compare required fields against frontend validation
- Add frontend validation for any required fields we're not checking
- Document findings in `product/reference/`

Files to examine:
- Frontend edit dialogs: `OpportunityEditDialog.tsx`, `ContactEditDialog.tsx`, `AccountEditDialog.tsx`, `PaymentEditDialog.tsx`
- Backend PUT endpoints in `main.py` and `routes/`
- SF describe response vs current SOQL SELECT fields

### 2. Pebble UX Polish

Remaining items from Stage 1 completion notes in `tasks/todo.md`:
- **Cost display** -- Show LLM cost per research query (data exists in `cost_usd` fields, not surfaced in UI)
- **Failed agents visibility** -- Show which agents failed/timed out (data exists in `failed_agents` array, not surfaced in UI)

Files to modify:
- `financial_forecasting/frontend/src/pages/Pebble.tsx` -- add cost badge and failed agents indicator to research results

## Verification

- Create an Opportunity with missing required fields -> verify frontend shows validation error
- Run Pebble research -> verify cost is displayed
- Run research with intentional source failures (e.g., missing API key) -> verify failed agents are visible

## Estimated effort

Small -- 1 session. SF audit is mostly research + validation rules. UX items are display-only.
