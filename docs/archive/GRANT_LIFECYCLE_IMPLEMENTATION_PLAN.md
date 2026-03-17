# Grant Lifecycle Implementation Plan
**Demo Date:** Tomorrow
**Status:** Planning → Implementation

---

## Workflow Overview

```
1. Partnerships creates opportunity → Links account & contact
2. Updates opportunity through pipeline stages
3. Reaches "Closed Won" → Payment schedule prompt
4. Finance team sees new closed won opp with schedule
5. Finance initiates invoice in Sage Intacct
   → Opportunity auto-moves to "Collecting / In Effect"
6. Track payments against invoice
   → When fully paid → Auto-move to "Closed / Completed"
```

---

## Phase 1: Payment Schedule Management (3-4 hours)

### Requirements
- [ ] When opportunity reaches "Closed Won", trigger payment schedule modal
- [ ] Natural language input: "3 payments of $100k each, quarterly starting Jan 2026"
- [ ] AI parsing to structured table (Payment Date, Amount, Status)
- [ ] Manual editing capability (add/edit/delete rows)
- [ ] Save payment schedule to Salesforce custom object
- [ ] Display payment schedule on opportunity detail page

### Technical Implementation

**Backend (FastAPI):**
```python
# New endpoint: POST /api/opportunities/{opp_id}/payment-schedule
- Accept natural language text
- Call OpenAI API to parse into structured data
- Validate totals match opportunity amount
- Create NPSP Payment records in Salesforce
- Link to opportunity

# New endpoint: GET /api/opportunities/{opp_id}/payment-schedule
- Fetch NPSP Payment records
- Return structured payment schedule

# New endpoint: PUT /api/opportunities/{opp_id}/payment-schedule
- Update existing payment schedule
- Validate changes
```

**Frontend (React):**
```typescript
// Component: PaymentScheduleModal.tsx
- Triggers when stage changes to "Closed Won"
- Natural language text input
- "Generate Schedule" button → calls AI parser
- Editable table with columns: Date, Amount, Status
- Add/Delete row buttons
- Total amount validation
- "Confirm" saves to Salesforce

// Component: PaymentScheduleTable.tsx
- Display on opportunity detail page
- Show payment status (Scheduled/Received/Overdue)
- Edit capability
```

**Data Model (Salesforce NPSP):**
```
Use existing NPSP Payment object:
- npe01__Opportunity__c (lookup to opportunity)
- npe01__Payment_Amount__c
- npe01__Payment_Date__c
- npe01__Scheduled_Date__c
- npe01__Paid__c (boolean)
- npe01__Payment_Method__c
```

---

## Phase 2: Finance Team View (2 hours)

### Requirements
- [ ] New "Finance Dashboard" page
- [ ] Show all "Closed Won" opportunities awaiting invoice creation
- [ ] Display opportunity details + payment schedule
- [ ] "Create Invoice" button for each opportunity
- [ ] Show all "Collecting / In Effect" opportunities with payment tracking
- [ ] Filter by: Awaiting Invoice, Active Collection, Overdue Payments

### Technical Implementation

**Backend:**
```python
# New endpoint: GET /api/finance/awaiting-invoices
- Query Salesforce for StageName = "Closed Won"
- Include payment schedule data
- Return opportunities ready for invoicing

# New endpoint: GET /api/finance/active-collections
- Query for StageName = "Collecting / In Effect"
- Include payment schedule with status
- Calculate overdue payments
```

**Frontend:**
```typescript
// New page: FinanceDashboard.tsx
- Tab 1: "Awaiting Invoice" (Closed Won opps)
- Tab 2: "Active Collections" (Collecting/In Effect)
- Tab 3: "Completed" (Closed/Completed)

// Each row shows:
- Opportunity name, Account, Amount
- Payment schedule summary
- Action button ("Create Invoice" or "Track Payments")
```

---

## Phase 3: Invoice Creation & Sage Integration (3-4 hours)

### Requirements
- [ ] "Create Invoice" button in Finance Dashboard
- [ ] Modal to confirm invoice details
- [ ] Create invoice in Sage Intacct via API
- [ ] Link invoice ID back to Salesforce opportunity
- [ ] Auto-update opportunity stage to "Collecting / In Effect"
- [ ] Store invoice-opportunity link in JSON + custom Salesforce object

### Technical Implementation

**Backend:**
```python
# New endpoint: POST /api/finance/create-invoice
{
  "opportunity_id": "006...",
  "account_name": "Goldman Sachs",
  "contact_email": "contact@gs.com",
  "amount": 150000,
  "payment_schedule": [...],
  "description": "Q1 2026 Grant Payment"
}

# Steps:
1. Call Sage Intacct API to create invoice
2. Get invoice ID from Sage
3. Update Salesforce opportunity custom field: Sage_Invoice_ID__c
4. Update opportunity stage to "Collecting / In Effect"
5. Create Grant_Invoice__c record (junction object)
6. Return invoice details
```

**Sage Intacct API Call:**
```python
async def create_invoice(
    customer_id: str,
    amount: float,
    description: str,
    items: List[dict]
):
    # Use existing SageIntacctMCPService
    xml_request = build_create_invoice_xml(...)
    response = await sage_service.call_api('create', xml_request)
    return invoice_id
```

**Frontend:**
```typescript
// Component: CreateInvoiceModal.tsx
- Pre-filled with opportunity data
- Editable fields: Description, Invoice Date, Due Date
- Payment schedule breakdown
- "Confirm & Create" button
- Success message with invoice ID
```

---

## Phase 4: Payment Tracking (2-3 hours)

### Requirements
- [ ] Finance can mark individual payments as "Received"
- [ ] Update payment status in Salesforce NPSP Payment records
- [ ] Update payment status in Sage Intacct (if applicable)
- [ ] Visual indicator: Scheduled, Received, Overdue
- [ ] Auto-calculate: Total Received, Total Outstanding
- [ ] When all payments received → Auto-move to "Closed / Completed"

### Technical Implementation

**Backend:**
```python
# New endpoint: PUT /api/payments/{payment_id}/mark-received
{
  "payment_id": "a1Q...",
  "received_date": "2026-01-15",
  "received_amount": 100000,
  "payment_method": "Wire Transfer"
}

# Steps:
1. Update NPSP Payment record: npe01__Paid__c = true
2. Set npe01__Payment_Date__c = received_date
3. Check if all payments for opportunity are received
4. If all received → Update opportunity stage to "Closed / Completed"
5. Return updated payment schedule
```

**Frontend:**
```typescript
// Component: PaymentTracker.tsx
- Table with all payments for opportunity
- Each row: Date, Amount, Status, Action
- "Mark Received" button → opens confirmation modal
- Color coding: Green (received), Yellow (upcoming), Red (overdue)
- Progress bar: X of Y payments received ($X of $Y)
```

**Auto-Complete Logic:**
```typescript
// When marking payment as received:
const allPaymentsReceived = payments.every(p => p.paid);
if (allPaymentsReceived) {
  await updateOpportunityStage(opp_id, "Closed / Completed");
  showSuccessMessage("All payments received! Opportunity marked complete.");
}
```

---

## Phase 5: Demo Workflow Testing (1 hour)

### Test Scenario
```
1. CREATE: New opportunity "Goldman Sachs Q1 2026 Grant"
   - Account: Goldman Sachs
   - Contact: Jane Smith
   - Amount: $300,000
   - Stage: New Lead

2. UPDATE: Progress through stages
   - New Lead → Qualifying → Proposal Creation → Closed Won

3. PAYMENT SCHEDULE: Enter schedule when Closed Won
   - Input: "3 payments of $100k, quarterly starting Jan 2026"
   - AI generates: 01/15/2026, 04/15/2026, 07/15/2026
   - Confirm schedule

4. FINANCE VIEW: Switch to Finance Dashboard
   - See new opportunity in "Awaiting Invoice" tab
   - Click "Create Invoice"
   - Confirm details, create in Sage

5. VERIFY: Check opportunity moved to "Collecting / In Effect"

6. PAYMENT TRACKING: Mark first payment as received
   - Click "Mark Received" on 01/15/2026 payment
   - Confirm $100k received on 01/20/2026

7. COMPLETE: Mark remaining payments
   - Mark 04/15 payment received
   - Mark 07/15 payment received
   - Verify opportunity auto-moved to "Closed / Completed"

8. VERIFY: Check all dashboards
   - Partnerships: See completed opportunity
   - Finance: See in "Completed" tab
   - Executive: See reflected in cash flow metrics
```

---

## Implementation Order

### Priority 1 (Must Have for Demo)
1. **Payment Schedule Management** (Phase 1)
   - Modal on Closed Won
   - Natural language parsing
   - Manual editing
   - Save to Salesforce

2. **Finance Dashboard** (Phase 2)
   - Basic view of Closed Won opps
   - Display payment schedules
   - Create Invoice button

3. **Invoice Creation** (Phase 3)
   - Create in Sage Intacct
   - Link to Salesforce
   - Auto-stage update

4. **Payment Tracking** (Phase 4)
   - Mark received functionality
   - Auto-complete logic

### Priority 2 (Nice to Have)
- Overdue payment indicators
- Email notifications
- Payment method tracking
- Invoice PDF generation

---

## Technical Dependencies

### Required
- ✅ Salesforce API access (already configured)
- ✅ Sage Intacct API access (credentials verified)
- ✅ OpenAI API for natural language parsing
- ✅ Existing FastAPI backend
- ✅ React frontend with Material-UI

### To Add
- [ ] Salesforce custom fields on Opportunity:
  - `Sage_Invoice_ID__c` (Text)
  - `Invoice_Created_Date__c` (Date)
- [ ] Use existing NPSP Payment object (no new objects needed)
- [ ] Grant_Invoice__c junction object (already defined)

---

## Time Estimate

| Phase | Tasks | Time | Priority |
|-------|-------|------|----------|
| Phase 1 | Payment Schedule Management | 3-4 hours | P0 |
| Phase 2 | Finance Dashboard | 2 hours | P0 |
| Phase 3 | Invoice Creation | 3-4 hours | P0 |
| Phase 4 | Payment Tracking | 2-3 hours | P0 |
| Phase 5 | Testing & Demo Prep | 1 hour | P0 |
| **Total** | **End-to-end workflow** | **11-14 hours** | **MVP** |

---

## Success Criteria for Demo

✅ **User can:**
1. Create a new opportunity with account and contact
2. Update opportunity through all stages to Closed Won
3. Enter payment schedule when reaching Closed Won (natural language)
4. Finance team sees the opportunity in their dashboard
5. Finance creates an invoice in Sage Intacct
6. Opportunity automatically moves to "Collecting / In Effect"
7. Finance marks payments as received
8. When all payments received, opportunity automatically moves to "Closed / Completed"
9. All updates reflect in real-time across all dashboards

✅ **System demonstrates:**
1. Seamless integration between Salesforce and Sage Intacct
2. Intelligent automation (stage transitions, payment validation)
3. Real-time data sync across all views
4. Clear workflow for both partnerships and finance teams

---

## Next Steps

1. **Review & Approve** this plan
2. **Start with Phase 1** (Payment Schedule Management)
3. **Iterative implementation** - test each phase before moving to next
4. **Full integration testing** with sample data
5. **Demo rehearsal** with real workflow

**Ready to start implementation?** 🚀

