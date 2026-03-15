# Pursuit CRM (Bedrock) — Information Flow Diagrams

> Phase 3 Deliverable | Version: 1.0 | Date: 2026-03-15
>
> Companion to: `product/crm-scope-constitution.md`, `product/crm-architecture/entity-map.md`

---

## Flow 1: Opportunity Lifecycle

**From first contact to payment received.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OPPORTUNITY LIFECYCLE                                │
│                                                                             │
│  Partnerships IC                Bedrock                    External Systems  │
│  ─────────────                 ────────                   ────────────────── │
│                                                                             │
│  1. Identifies prospect  ───►  Create Prospect                              │
│     (network search,           (status: new)                                │
│      referral, event)          Link to Contact                              │
│                                                                             │
│  2. Qualifies Prospect   ───►  Convert Prospect to        Sync Opportunity  │
│     (meeting held,             Opportunity                 ───► Salesforce  │
│      alignment confirmed)      (stage: identified/                          │
│                                 qualified)                                  │
│                                                                             │
│  3. Submits proposal     ───►  Update stage:              Salesforce        │
│                                proposal-sent               auto-syncs       │
│                                Set close date                               │
│                                                                             │
│  4. Negotiates           ───►  Update stage:                                │
│     Logs Activities            in-negotiation                               │
│     (calls, meetings)          Activities logged                            │
│                                                                             │
│  5. Gets commitment      ───►  Update stage:                                │
│                                verbal-commit                                │
│                                Update amount_confirmed                      │
│                                                                             │
│  6. Award received       ───►  Update stage:              Salesforce        │
│                                closed-won                  stage synced      │
│                                                                             │
│  7. Payment schedule     ───►  Create Payment records     ─ ─ ─ ─ ─ ─ ─ ► │
│     established                (status: scheduled)         (Phase 2)        │
│                                                            Sage: create     │
│                                                            invoices         │
│                                                                             │
│  8. Bookkeeper invoices  ───►  Update Payment:            Sage: invoice     │
│     (Phase 2)                  status → invoiced           created          │
│                                sage_id set                                  │
│                                                                             │
│  9. Payment received     ◄───  Update Payment:            Sage: payment    │
│                                status → received           matched          │
│                                received_date set                            │
│                                                                             │
│  ► Cash flow projection        Computed from:                               │
│    updates automatically       Opportunities × probability                  │
│                                + Payment schedule                           │
│                                + Received amounts                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Data Events

| Step | Data Created/Modified | Triggers |
|------|----------------------|----------|
| Prospect created | Prospect, Contact (if new) | Weekly priorities view updates |
| Prospect → Opportunity | Opportunity created, Prospect status = converted | Pipeline metrics update, Salesforce sync |
| Stage change | Opportunity.stage, probability recalculated | Dashboard metrics update, stale detection resets |
| Closed-won | Opportunity.stage, amount_confirmed | Cash flow projection updates, payment schedule creation |
| Payment received | Payment.status, received_date | Cash position updates, reconciliation queue |

---

## Flow 2: Cash Flow Projection

Three data layers, all grouped by month/quarter and splittable by revenue stream, Account, or IC:

| Layer | Source | Computation |
|-------|--------|-------------|
| **Weighted Pipeline** (uncertain) | Open Opportunities | Σ (amount_estimated × probability) grouped by expected_close_date |
| **Expected Inflows** (committed) | Closed-won Opps + Payments (scheduled/invoiced) | Σ (Payment.amount) grouped by expected_date |
| **Actual Received** | Payments (status = received) | Σ (Payment.amount) grouped by received_date |

**Update triggers:** Opportunity stage/amount change, Payment status change, Salesforce sync, Sage sync (Phase 2).

**Alerts:** Overdue = Payment past expected_date and not received. Concentration risk = any single Account >30% of weighted pipeline.

---

## Integration Touchpoints (Summary)

These flows surface the following integration requirements (detailed in `integration-register.md`):

| Touchpoint | Direction | When | What |
|-----------|-----------|------|------|
| Opportunity sync | Bedrock ↔ Salesforce | On stage change, on create | Opportunity fields |
| Account/Contact sync | Bedrock ↔ Salesforce | On create/update | Account and Contact fields |
| Invoice creation | Bedrock → Sage | On payment schedule creation (Phase 2) | Invoice data |
| Payment reconciliation | Sage → Bedrock | On payment receipt (Phase 2) | Payment status, date, amount |
| Activity logging | Slack → Bedrock | On Slack message (via MCP) | Activity summary, contact reference |
