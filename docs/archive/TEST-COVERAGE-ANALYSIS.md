# Test Coverage Analysis

**Date:** 2026-03-16

## Current State: ~1.6% overall coverage

| Area | Source Files | Test Files | Coverage |
|------|-------------|------------|----------|
| Frontend (TS/TSX) | 56 | 1 | 1.8% |
| Backend (Python) | 54 | 0 | 0% |

### Only existing test file

- `financial_forecasting/frontend/src/utils/csvParser.test.ts` — Tests CSV parsing (normalizeKey, column aliases, parseCSV validation, file size limits, partial success)

---

## Recommended Improvements (prioritized by impact)

### Tier 1 — Pure logic, easy to test, high value

1. **`utils/linkedInCsvParser.ts`** — LinkedIn CSV parsing/validation. Mirrors csvParser pattern.
2. **`utils/formatters.ts`** — Pure date/currency/number formatting functions.
3. **`utils/networkGraphBuilder.ts`** — Graph construction, pure data transformation.
4. **`pages/Opportunities/helpers.ts`** — Business logic extracted from Opportunities page.

### Tier 2 — Core business logic, moderate effort

5. **`services/api.ts`** — API service layer. Mock HTTP, verify requests/responses/errors.
6. **`contexts/AuthContext.tsx`** + **`components/ProtectedRoute.tsx`** — Auth flows and route guarding.
7. **`contexts/LeadsContext.tsx`** — Leads state management (CRUD, filtering, transitions).
8. **`hooks/useLocalCollection.ts`** + **`hooks/useLinkedInContacts.ts`** — Custom hooks with testable logic.

### Tier 3 — Backend (currently 0%)

9. **`forecasting_engine.py`** — Core forecasting logic. High-impact regression risk.
10. **`mcp_client/services/salesforce.py`** + **`sage_intacct.py`** — Integration services with mocked APIs.
11. **`data_sync.py`** — Sync pipeline, transformation logic, conflict resolution.
12. **`main.py`** / **`simple_server.py`** — FastAPI endpoint tests with TestClient.

### Tier 4 — UI pages (highest effort)

13. **`pages/WeeklyPriorities.tsx`** — Week-1 focus. Test "next 7 days" filter + CSV export.
14. **`pages/Leads.tsx`** — CSV import + lead management flow.
15. **`pages/Pipeline.tsx`** + **`pages/Opportunities/index.tsx`** — Core pipeline views.

---

## Infrastructure Recommendations

- Add coverage reporting: `jest --coverage` (frontend), `pytest-cov` (backend)
- Set a coverage threshold starting at 30%, ratchet up over time
- Add CI gate to fail builds if coverage drops
- Create `conftest.py` for backend with shared fixtures (mock Salesforce/Sage responses)

## Where to Start

Tier 1 (pure utility functions) offers the highest ROI. These 4 files can be fully tested quickly, raising frontend coverage from 1.8% to ~10%, and they catch bugs most likely to cause silent data corruption.
