# Cashflow — Planning Doc for Re-enabling

**Status:** Archived (hidden from MVP nav).

## Current State

- **Route:** `/cashflow` (or revenue page)
- **Backend:** Cash flow summary from Sage Intacct + Salesforce
- **Overlap:** Dashboard below-fold has cash flow cards and 12‑month forecast

## Dependencies

- Sage Intacct credentials and API
- Salesforce opportunities (payment schedules)
- `apiService.getCashFlowSummary()`

## Overlap with Dashboard

- Dashboard lazy-loads `DashboardBelowFoldCharts` with cash flow cards and charts
- Cashflow page may have fuller revenue/cash flow views
- Decide: consolidate into Dashboard or keep separate page for finance-focused users

## Security

- Sage credentials server-side only
- Cash flow data may be sensitive; role-based access if needed

## Acceptance Criteria for Wiring In

- [ ] Nav item visible when phase allows
- [ ] Sage integration verified
- [ ] Clear separation or consolidation with Dashboard below-fold
- [ ] Cash flow projections accurate
