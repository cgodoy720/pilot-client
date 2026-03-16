# PRD Questions Answered - Sage Intacct Integration

Based on data exploration and user requirements, here are the answers to critical PRD questions.

---

## Data Discovery Summary

### What We Found in Sage Intacct:

**Grant Invoices (Large Transactions >= $10K):**
- **55 invoices** totaling **$3.85M**
- **$3.32M paid** | **$531K outstanding**
- Date range: 2021 - November 2025 (current!)
- Mix of foundations, corporate donors, government grants

**Top Grant Funders:**
1. NYC Dept of Youth & Community Development: $800K
2. Mizuho USA Foundation: $450K
3. Robin Hood Foundation: $280K
4. Blackstone Charitable: $275K
5. Peloton: $240K
6. Arbor Brothers, Hearst, Google: $125K each
7. Many others: $50K-$100K

**Student/Program Payments:**
- Hundreds of smaller transactions ($475-$5,000)
- Individual student names as customers
- Payment methods: Venmo, Chase, PayPal
- Separate business line from grants

---

## Critical Questions & Answers

### 1. CUSTOMER/ACCOUNT MAPPING

**Q: How do Sage Intacct customers map to Salesforce accounts?**
- **A: By name matching** (e.g., "Robin Hood Foundation" in both systems)
- **Current state**: Names are SIMILAR but not always exact
  - Sage: "New York City Department  of Youth Community and Development"
  - SF: Likely "NYC DYCD" or similar abbreviation
- **Solution**: Implement fuzzy name matching algorithm (built in matching script)

**Q: Do all Salesforce accounts have corresponding Sage customers?**
- **A: Not yet known** - need to export SF Accounts to compare
- **Likely**: Some opportunities in SF don't have invoices yet (future grants)
- **Action needed**: Compare both systems to find gaps

**Q: Should we create Sage customers when opportunities close?**
- **A: YES, but with validation**
  - Check if customer already exists first (avoid duplicates)
  - If exists: Use existing customer ID
  - If new: Create customer before creating invoice

---

### 2. INVOICE GENERATION WORKFLOW

**Q: When should invoices be created in Sage Intacct?**
- **Current**: Bookkeeper creates manually AFTER opportunity closes
- **Timing**: Varies (same day to months later)
- **New workflow**:
  - **MVP (Phase 1)**: Keep manual creation, but add auto-linking
  - **Phase 2**: Auto-suggest invoice creation when opp closes
  - **Phase 3**: Fully automated invoice generation (with review)

**Q: What fields from Salesforce opportunities should populate invoices?**

| Salesforce Field | → | Sage Intacct Field |
|------------------|---|-------------------|
| Account Name | → | Customer (lookup by name) |
| Account ID | → | Store in custom field for reference |
| Opportunity Amount | → | Invoice Total |
| Close Date | → | Invoice Date (or later) |
| Opportunity Name | → | Invoice Description/Memo |
| Payment Schedule (custom) | → | Multiple invoices or payment terms |

**Q: Payment Schedule → Multiple invoices?**
- **Multi-year grants**: Create ONE invoice per year
  - Example: $500K over 2 years = 2 invoices of $250K each
  - Link both invoices to same opportunity
- **Milestone-based**: Create invoice per milestone
- **Lump sum**: Single invoice

---

### 3. PAYMENT TRACKING

**Q: How do you currently track expected vs. actual payments?**
- **Expected**: Not systematically tracked (pain point!)
- **Actual**: Only visible in Sage Intacct after payment received
- **Solution needed**: 
  - Store payment schedule in Salesforce custom fields
  - Sync actual payments from Sage → Salesforce
  - Dashboard shows: Expected vs. Actual vs. Outstanding

**Q: When a payment is received in Sage, should Salesforce be updated?**
- **A: YES - This is critical!**
- Update opportunity custom fields:
  - `Amount_Paid__c`
  - `Amount_Outstanding__c`
  - `Last_Payment_Date__c`
  - `Payment_Status__c` (Invoiced, Partially Paid, Fully Paid)

**Q: How do you handle partial payments?**
- **Current in Sage**: Multiple payment records against one invoice
- **Display in SF**: Show running total of all payments
- **Dashboard**: Track payment progress (e.g., "$50K paid of $100K")

**Q: What payment statuses matter for your dashboard?**

| Status | Definition | Dashboard Color |
|--------|-----------|----------------|
| **Not Invoiced** | Opportunity closed but no invoice yet | 🟡 Yellow |
| **Invoiced** | Invoice sent, $0 received | 🟠 Orange |
| **Partially Paid** | Some payment received, balance due | 🔵 Blue |
| **Fully Paid** | Complete payment received | 🟢 Green |
| **Overdue** | Past due date, unpaid | 🔴 Red |

---

### 4. MULTI-YEAR GRANTS

**Q: For multi-year grants, how are invoices structured?**
- **Best practice**: One invoice per year
  - Year 1: Invoice $250K when grant starts
  - Year 2: Invoice $250K one year later
- **Link both invoices** to the same Salesforce opportunity
- **Track** which year each invoice represents

**Q: Are payment schedules stored in Salesforce custom fields?**
- **Current**: NO - This is a gap!
- **Solution**: Create custom object or fields:

```
Option A: Custom Fields on Opportunity
- Payment_Schedule_Year_1__c: Date
- Payment_Schedule_Year_2__c: Date
- Payment_Schedule_Year_3__c: Date

Option B: Related List "Payment Schedule" (better for many payments)
- Payment_Milestone__c: Text
- Expected_Payment_Date__c: Date
- Expected_Amount__c: Currency
- Actual_Payment_Date__c: Date
- Actual_Amount__c: Currency
```

**Q: Should we auto-generate invoice reminders?**
- **A: YES - High value feature**
- Remind bookkeeper: "Robin Hood Year 2 invoice due next week"
- Alert partnerships: "Payment overdue by 30 days"

---

### 5. CASH FLOW FORECASTING

**Q: What time horizon do you need for cash flow forecasts?**
- **A: 12 months rolling** (with quarterly breakdowns)
- Show: Next 30 days, 60 days, 90 days, 12 months
- Drill down: By quarter, by month

**Q: Should we show both 'best case' and 'realistic' scenarios?**
- **A: YES!**

| Scenario | Calculation |
|----------|-------------|
| **Guaranteed** | Outstanding AR only (already invoiced) |
| **Realistic** | AR + Pipeline weighted by probability |
| **Best Case** | AR + All pipeline at 100% |

**Q: What assumptions should drive the forecast?**
1. **Historical payment patterns**:
   - Average days to payment: Calculate from Sage data
   - By funder type (gov't pays slower than foundations)
2. **Opportunity probability** (from Salesforce):
   - 90% probability = count as 90% of amount
3. **Seasonal patterns**:
   - Q4 heavy (end of year giving)
   - Summer slower

---

### 6. BOOKKEEPER WORKFLOW (Phase 2)

**Q: What's the current invoice creation process?**
1. Partnerships tells bookkeeper "Grant closed!"
2. Bookkeeper logs into Sage Intacct
3. Finds/creates customer
4. Manually enters invoice details
5. **NO connection back to Salesforce** ← Pain point!

**Q: What information do they need from the partnerships team?**
- Customer/funder name
- Grant amount
- Payment schedule/terms
- Any special billing instructions

**Q: What are the pain points in the current process?**
- ❌ Information passed verbally or via Slack (no system)
- ❌ Have to ask partnerships for details
- ❌ Can't see which opportunities need invoicing
- ❌ No way to track if invoice matches the grant

**Q: What automations would help the bookkeeper most?**
1. **Auto-notification**: "New opportunity closed → invoice needed"
2. **Pre-filled invoice draft**: Customer, amount, date auto-populated
3. **Validation**: Warn if invoice amount ≠ opportunity amount
4. **Confirmation**: Auto-update Salesforce when invoice is posted

---

### 7. REPORTING & METRICS

**Q: What financial metrics does the CEO need to see daily?**

**Dashboard Metrics:**
```
┌─────────────────────────────────────────────┐
│ REVENUE SNAPSHOT                            │
├─────────────────────────────────────────────┤
│ Pipeline Value:              $2.5M (20)     │
│ Weighted Pipeline:           $1.8M          │
│ Closed (Not Invoiced):       $200K (2)      │
│ Invoiced (Outstanding):      $531K (12)     │
│ Received (This Month):       $150K          │
│ Overdue Invoices:            $75K ⚠️        │
└─────────────────────────────────────────────┘

CASH FORECAST (Next 12 Months):
├─ Expected from Outstanding AR:  $531K
├─ Expected from Pipeline:        $1.8M (weighted)
└─ Total Projected Cash:          $2.3M

COLLECTION METRICS:
├─ Average Days to Payment:       45 days
├─ Collection Rate:               86%
└─ Overdue > 30 days:            $75K
```

**Q: How should we visualize the relationship between the three stages?**

```
REVENUE FUNNEL:
┌──────────────────────────────────────────────────┐
│ PIPELINE          │ $2.5M (Future)               │
│ ↓ Close Rate: 72% │                              │
├───────────────────┼──────────────────────────────┤
│ INVOICED          │ $531K (Outstanding AR)       │
│ ↓ Collection: 86% │                              │
├───────────────────┼──────────────────────────────┤
│ RECEIVED          │ $3.3M (Actual Cash YTD)      │
└───────────────────┴──────────────────────────────┘

TIMELINE VIEW:
Past          Present         Future
───┼──────────┼──────────┼──────────┼────>
   │          │          │          │
 Received  Invoiced   Closing   Pipeline
  $3.3M     $531K    Soon $200K  $2.5M
```

---

### 8. DATA SYNC & INTEGRITY

**Q: What's the source of truth for different data types?**

| Data Type | Source of Truth | Synced To |
|-----------|----------------|-----------|
| Grant details (who, what, when) | Salesforce | Sage (reference only) |
| Invoice details (amount, date, status) | Sage Intacct | Salesforce (sync back) |
| Payment details (received, date) | Sage Intacct | Salesforce (sync back) |
| Payment schedule (expected dates) | **TBD** - Should be Salesforce | Sage (for bookkeeper reference) |
| Contact information | Salesforce | Sage (customer address, etc.) |

**Q: How often should data sync between systems?**
- **MVP**: Daily batch sync (overnight)
- **Phase 2**: Hourly sync
- **Ideal**: Real-time (webhook-triggered)

**Q: What triggers should cause a sync?**
1. **Salesforce → Sage**:
   - Opportunity stage changes to "Closed Won"
   - Payment schedule is updated
2. **Sage → Salesforce**:
   - Invoice is created/updated
   - Payment is received
   - Invoice is deleted/voided

---

### 9. ERROR HANDLING

**Q: What should happen if an invoice creation fails?**
1. **Alert bookkeeper** via email/Slack
2. **Flag opportunity** in Salesforce (checkbox: `Invoice_Creation_Failed__c`)
3. **Log error** with details for troubleshooting
4. **Manual fallback**: Bookkeeper creates invoice manually, system links it

**Q: What validations are needed before creating an invoice?**

**Pre-flight checks:**
- ✅ Customer exists in Sage (or can be created)
- ✅ Opportunity is Closed Won (not just "Closed")
- ✅ Amount is > $0
- ✅ Invoice doesn't already exist for this opportunity
- ✅ Payment schedule is defined (if multi-year)
- ⚠️ Warn if opportunity closed date is > 90 days ago

---

## Technical Architecture Summary

### Data Flow

```
┌─────────────────┐         ┌──────────────┐         ┌────────────────┐
│   SALESFORCE    │◄───────►│  PYTHON      │◄───────►│ SAGE INTACCT   │
│                 │         │  BACKEND     │         │                │
│ • Opportunities │         │              │         │ • Invoices     │
│ • Accounts      │         │ • Matching   │         │ • Payments     │
│ • Payment       │         │ • Syncing    │         │ • Customers    │
│   Schedule      │         │ • Forecasting│         │                │
└─────────────────┘         └──────────────┘         └────────────────┘
         │                         │                          │
         │                         │                          │
         └─────────────────────────┼──────────────────────────┘
                                   ↓
                          ┌──────────────────┐
                          │  REACT DASHBOARD │
                          │                  │
                          │ • Unified View   │
                          │ • Cash Forecast  │
                          │ • Payment Status │
                          └──────────────────┘
```

### Custom Salesforce Fields Needed

```sql
-- On Opportunity object:
Sage_Invoice_ID__c (Text, External ID)
Sage_Customer_ID__c (Text)
Invoice_Created__c (Checkbox)
Invoice_Date__c (Date)
Invoice_Amount__c (Currency)
Amount_Paid__c (Currency)
Amount_Outstanding__c (Currency)
Last_Payment_Date__c (Date)
Payment_Status__c (Picklist: Not Invoiced, Invoiced, Partially Paid, Fully Paid, Overdue)

-- Optional custom object:
Payment_Schedule__c
  - Opportunity__c (Lookup)
  - Milestone__c (Text)
  - Expected_Date__c (Date)
  - Expected_Amount__c (Currency)
  - Actual_Date__c (Date)
  - Actual_Amount__c (Currency)
```

---

## MVP Scope (Phase 1)

### Must Have:
- [x] ✅ Sage Intacct API connection working
- [ ] Export existing grant invoices to CSV
- [ ] Manual matching process (with guidance)
- [ ] Store links in Salesforce custom fields
- [ ] Dashboard showing: Pipeline | Invoiced | Paid
- [ ] Basic cash flow forecast (Outstanding AR + Weighted Pipeline)
- [ ] Auto-detection of new invoices (daily sync)
- [ ] Manual confirmation of matches before linking

### Nice to Have (Phase 1.5):
- [ ] Automated matching suggestions (bookkeeper confirms)
- [ ] Payment status alerts (overdue invoices)
- [ ] Historical payment pattern analysis
- [ ] Collection metrics dashboard

### Phase 2:
- [ ] Auto-create invoice drafts when opportunities close
- [ ] Payment schedule management
- [ ] Email notifications to bookkeeper
- [ ] Two-way sync (Salesforce ↔ Sage)
- [ ] Advanced forecasting models

---

## Files Generated

1. **`SAGE_SALESFORCE_LINKING_STRATEGY.md`** - Complete technical strategy
2. **`sage_grant_invoices.csv`** - Export of 55 grant invoices for matching
3. **`match_invoices_to_opportunities.py`** - Matching script
4. **`find_grant_revenue.py`** - Data exploration script
5. **`PRD_QUESTIONS_ANSWERED.md`** - This document

## Next Immediate Actions

1. ✅ Review `sage_grant_invoices.csv`
2. 📝 Match each invoice to Salesforce opportunity (add Opportunity ID to CSV)
3. 🔧 Build Salesforce custom fields
4. 💻 Create linking script that saves matches
5. 📊 Update dashboard to display linked data
6. 🧪 Test with 5-10 examples before rolling out

---

**Date:** November 12, 2025  
**Status:** Ready for PRD finalization and development kickoff

