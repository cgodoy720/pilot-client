# Auto Review — Planning Doc for Re-enabling

**Status:** Archived (hidden from MVP nav). Route and backend remain.

## Current State

- **Route:** `/automation-review`
- **Page:** `financial_forecasting/frontend/src/pages/AutomationReview.tsx`
- **Backend:** `simple_server.py` — `_automation_queue`, endpoints:
  - `GET /api/automation-review/pending`
  - `GET /api/automation-review/all`
  - `POST /api/automation-review/{item_id}/approve`
  - `POST /api/automation-review/{item_id}/reject`
  - `POST /api/automation-review/ingest-pipeline`
- **Slack:** Messages from `#pipeline-updates` parsed and queued for review

## Dependencies

- Slack bot token (`SLACK_BOT_TOKEN`)
- Salesforce per-user or service account
- User auth (JWT)

## Before Re-enabling

1. Verify Slack pipeline channel is configured and bot has access
2. Verify automation queue ingest logic matches current Slack message format
3. Test approve/reject flows with real Salesforce updates
4. Add to `MVP_PATHS` in `Layout.tsx` when ready

## Security

- Endpoints require `get_current_user`
- Approve/reject should attribute changes to the logged-in user

## Acceptance Criteria for Wiring In

- [ ] Nav item visible when `REACT_APP_NAV_PHASE` allows
- [ ] Pending items load and display
- [ ] Approve/reject update Salesforce and remove from queue
- [ ] Ingest from Slack works end-to-end
