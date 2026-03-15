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

## Flow 2: Campaign → Revenue

> **Post-MVP flow.** In MVP, Campaign is a `campaign_name` string on Opportunity — no Campaign entity, no junction tables. This flow describes the Post-MVP target if Campaign is promoted to a full entity. See `entity-map.md` Section 5.

**MVP version:** IC sets `campaign_name` on Opportunity at creation. Reports group Opportunities by `campaign_name`. No CRUD, no linking, no attribution logic.

**Post-MVP version (if Campaign becomes a full entity):**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CAMPAIGN TO REVENUE (Post-MVP)                            │
│                                                                             │
│  Campaign Owner             Bedrock                      Reporting          │
│  ─────────────             ────────                     ─────────           │
│                                                                             │
│  1. Plan campaign    ───►  Create Campaign entity                           │
│     (annual fund,          Set goal, dates                                  │
│      gala, corp drive)                                                      │
│                                                                             │
│  2. Identify targets ───►  Link Contacts to Campaign                        │
│                            Create Prospects for new                         │
│                            prospects                                        │
│                                                                             │
│  3. Outreach begins  ───►  Log Activities                                   │
│     (calls, events,        Create Opportunities                             │
│      proposals)            Link via Campaign junction                       │
│                                                                             │
│  4. Pipeline builds  ───►  Opportunities progress       Campaign dashboard: │
│                            through stages                goal vs. pipeline  │
│                                                                             │
│  5. Deals close      ───►  Opportunity: closed-won      Revenue attributed  │
│                            Payments scheduled            to Campaign         │
│                                                                             │
│  6. Campaign ends    ───►  Status: completed             Final report       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Campaign Attribution (Post-MVP Only)

- Revenue is attributed to a Campaign when a linked Opportunity reaches closed-won.
- If an Opportunity links to multiple Campaigns, revenue is attributed to all (for reporting — not double-counted in total pipeline).
- Campaign ROI = Total Payments Received from Linked Opps / Campaign Cost (if tracked).

---

## Flow 3: Cash Flow Projection

**What data feeds the projection and how it updates.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CASH FLOW PROJECTION                                  │
│                                                                             │
│  Data Sources               Computation                  Output             │
│  ────────────              ───────────                  ──────              │
│                                                                             │
│  PIPELINE (Uncertain)                                                       │
│  ┌─────────────────┐                                                        │
│  │ Open Opps       │                                                        │
│  │ amount_estimated │──► amount × probability ──►  Weighted Pipeline       │
│  │ probability      │    grouped by                 by Month/Quarter        │
│  │ close_date       │    expected_close_date                                │
│  └─────────────────┘                                                        │
│                                                                             │
│  COMMITTED (High Confidence)                                                │
│  ┌─────────────────┐                                                        │
│  │ Closed-Won Opps │                                                        │
│  │ + Scheduled     │──► amount by                                           │
│  │   Payments      │    expected_date       ──►  Expected Inflows          │
│  │                 │                              by Month/Quarter          │
│  └─────────────────┘                                                        │
│                                                                             │
│  RECEIVED (Actual)                                                          │
│  ┌─────────────────┐                                                        │
│  │ Payments with   │                                                        │
│  │ status=received │──► amount by           ──►  Actual Cash Received      │
│  │ received_date   │    received_date             by Month/Quarter          │
│  └─────────────────┘                                                        │
│                                                                             │
│  COMBINED VIEW                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  Month    │ Weighted Pipeline │ Expected Inflows │ Actual Recv  │       │
│  │  ─────    │ ──────────────── │ ──────────────── │ ───────────  │       │
│  │  Mar 2026 │       $120K      │      $80K        │    $45K      │       │
│  │  Apr 2026 │       $200K      │      $150K       │     —        │       │
│  │  May 2026 │       $350K      │      $50K        │     —        │       │
│  │  ...      │       ...        │      ...         │    ...       │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│  SPLITS AVAILABLE:                                                          │
│  • By revenue_stream (nonprofit / PBC)                                      │
│  • By quarter / year                                                        │
│  • By Account (concentration risk)                                          │
│  • By assigned_to (IC performance)                                          │
│                                                                             │
│  UPDATE TRIGGERS:                                                           │
│  • Any Opportunity stage change                                             │
│  • Any Opportunity amount change                                            │
│  • Any Payment status change                                                │
│  • Salesforce sync completion                                               │
│  • Sage sync completion (Phase 2)                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Projection Rules

1. **Weighted pipeline** = Σ (amount_estimated × probability) for all open Opportunities, grouped by expected_close_date month.
2. **Expected inflows** = Σ (Payment.amount) where status ∈ {scheduled, invoiced}, grouped by expected_date month.
3. **Actual received** = Σ (Payment.amount) where status = received, grouped by received_date month.
4. **Overdue highlight** = Payments where expected_date < today AND status ≠ received.
5. **Concentration risk** = Flag if any single Account represents >30% of weighted pipeline.

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
