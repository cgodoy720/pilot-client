# Sage Intacct ↔ Salesforce Linking Strategy

## Problem Statement

**Current State:**
- Salesforce: Opportunities track grant pipeline (future revenue)
- Sage Intacct: Invoices are created manually after opportunities close
- ❌ **NO CONNECTION** between Opportunities and Invoices
- Result: Can't track which invoices belong to which grants

**Goal:**
1. **Link existing invoices** to opportunities retroactively
2. **Link new invoices** to opportunities going forward
3. **Display unified view** in dashboard

---

## Data We Have

### From Sage Intacct (55+ Grant Invoices):
```
- Customer Name (e.g., "Robin Hood Foundation")
- Customer ID (e.g., "C1268")
- Invoice Amount (e.g., "$280,000")
- Invoice Date (e.g., "05/13/2024")
- Record Number (unique ID)
```

### From Salesforce (Opportunities):
```
- Account Name (e.g., "Robin Hood Foundation")
- Account ID
- Opportunity Amount
- Close Date
- Opportunity ID
- Stage
```

---

## Solution Design

### Phase 1: Retroactive Linking (Match Existing Data)

#### Matching Algorithm

**Match invoices to opportunities using:**

1. **Primary Match: Account Name + Amount + Date Range**
   ```
   IF:
     Sage Customer Name = Salesforce Account Name
     AND Sage Invoice Amount ≈ Opportunity Amount (within ±5%)
     AND Invoice Date within 90 days of Close Date
   THEN: Likely match
   ```

2. **Secondary Match: Account Name + Amount Only**
   ```
   IF:
     Customer Name = Account Name
     AND Invoice Amount ≈ Opportunity Amount
   THEN: Possible match (requires manual review)
   ```

3. **Manual Review Required:**
   - Multiple invoices for same opportunity (multi-year grants)
   - Partial invoices (installment payments)
   - Name mismatches (e.g., "Blackstone Charitable Foundation" vs "Blackstone, Inc.")

#### Implementation

**Step 1: Export Data**
```python
# Get all Sage Intacct invoices >= $10,000
sage_invoices = await sage.get_invoices(limit=1000)
large_invoices = [inv for inv in invoices if amount >= 10000]

# Get all Salesforce closed-won opportunities
sf_opportunities = await sf.query(
    "SELECT Id, Name, AccountId, Account.Name, Amount, CloseDate, StageName 
     FROM Opportunity 
     WHERE IsWon = true 
     AND Amount >= 10000"
)
```

**Step 2: Match Records**
```python
matches = []
for invoice in sage_invoices:
    for opportunity in sf_opportunities:
        score = calculate_match_score(invoice, opportunity)
        if score >= 0.8:  # High confidence
            matches.append({
                'invoice': invoice,
                'opportunity': opportunity,
                'confidence': score,
                'match_type': 'automatic'
            })
```

**Step 3: Store the Link**

Option A: Store in Salesforce (Recommended)
```
Opportunity Custom Fields:
- Sage_Invoice_ID__c (Text)
- Sage_Customer_ID__c (Text)
- Invoice_Created_Date__c (Date)
- Invoice_Amount__c (Currency)
```

Option B: Store in Sage Intacct
```
Custom field on Invoice:
- SFDC_OPPORTUNITY_ID (stored in memo or custom field)
```

**Recommendation: Use BOTH**
- Store Sage Invoice ID in Salesforce (easier to query)
- Store SF Opportunity ID in Sage (for bookkeeper reference)

---

### Phase 2: Ongoing Linking (New Invoices)

#### Workflow A: Manual with Auto-Suggest

**When bookkeeper creates invoice:**

1. **In Sage Intacct**: Create invoice for customer "Mizuho USA Foundation" - $450,000
2. **System detects**: New invoice created (via polling or webhook)
3. **System searches**: Salesforce for matching opportunity
4. **System suggests**: "This invoice may match Opportunity: Mizuho 2025 Grant - $450,000"
5. **Bookkeeper confirms**: Links the two records
6. **System updates**: Both Salesforce and Sage with the link

#### Workflow B: Fully Automated

**When opportunity closes in Salesforce:**

1. **Opportunity stage** changes to "Closed Won"
2. **Trigger fires**: Automation detects stage change
3. **System checks**: Does customer exist in Sage Intacct?
   - If YES: Continue
   - If NO: Create customer first
4. **System creates**: Draft invoice in Sage Intacct
5. **Bookkeeper reviews**: Makes any edits, then posts invoice
6. **Link stored**: Opportunity ID ↔ Invoice ID

**Recommendation for MVP: Use Workflow A (Manual with Auto-Suggest)**
- Less risky (bookkeeper has control)
- Catches edge cases (partial invoices, timing issues)
- Can move to Workflow B in Phase 2

---

### Phase 3: Dashboard Display

#### Unified View

**Opportunity Card Shows:**
```
Opportunity: Robin Hood Foundation 2024 Grant
Amount: $280,000
Stage: Closed Won ✅
Close Date: 03/15/2024

INVOICING STATUS:
├─ Invoice Created: ✅ 05/13/2024
├─ Invoice #: 19785
├─ Amount Invoiced: $280,000
└─ Payment Status: 
    └─ Paid: $100,000 (11/17/2021)
    └─ Outstanding: $180,000

NEXT ACTION: Follow up on outstanding payment
```

#### Dashboard Metrics

**Pipeline vs. Reality:**
```
┌─────────────────────────────────────┐
│ REVENUE STAGES                      │
├─────────────────────────────────────┤
│ In Pipeline:        $2.5M (20 opps) │
│ Closed (Invoiced):  $1.8M (15 opps) │
│ Paid (Received):    $1.2M           │
│ Outstanding AR:     $600K           │
└─────────────────────────────────────┘

CASH FLOW FORECAST (Next 12 Months):
├─ Expected from Pipeline: $1.5M (weighted by probability)
├─ Expected from Outstanding AR: $600K
└─ Total Expected Cash: $2.1M
```

---

## Technical Implementation

### Data Model

#### Salesforce Custom Fields (on Opportunity)

```sql
CREATE CUSTOM FIELDS ON Opportunity:
- Sage_Invoice_ID__c (Text, External ID) ← Link to Sage
- Sage_Customer_ID__c (Text)
- Invoice_Created__c (Checkbox)
- Invoice_Date__c (Date)
- Invoice_Amount__c (Currency)
- Amount_Paid__c (Currency, Formula: Sum of payments)
- Amount_Outstanding__c (Currency, Formula: Invoice - Paid)
- Last_Payment_Date__c (Date)
- Payment_Status__c (Picklist: Not Invoiced, Invoiced, Partially Paid, Fully Paid)
```

#### Sync Logic

```python
class OpportunityInvoiceLinker:
    """Link Salesforce Opportunities to Sage Intacct Invoices."""
    
    async def sync_invoice_to_opportunity(self, sage_invoice_id: str):
        """When an invoice is created/updated in Sage, sync to SF."""
        
        # Get invoice from Sage
        invoice = await sage.get_invoice(sage_invoice_id)
        
        # Find matching opportunity
        opp = await self.find_matching_opportunity(invoice)
        
        if opp:
            # Update Salesforce with invoice data
            await sf.update_opportunity(opp['Id'], {
                'Sage_Invoice_ID__c': invoice['RECORDNO'],
                'Sage_Customer_ID__c': invoice['CUSTOMERID'],
                'Invoice_Created__c': True,
                'Invoice_Date__c': invoice['WHENCREATED'],
                'Invoice_Amount__c': invoice['TOTALENTERED'],
            })
            
            # Get payments for this invoice
            payments = await sage.get_payments_for_invoice(sage_invoice_id)
            total_paid = sum(p['amount'] for p in payments)
            
            await sf.update_opportunity(opp['Id'], {
                'Amount_Paid__c': total_paid,
                'Amount_Outstanding__c': invoice['TOTALENTERED'] - total_paid,
                'Last_Payment_Date__c': payments[-1]['date'] if payments else None,
                'Payment_Status__c': self.calculate_payment_status(invoice, total_paid)
            })
    
    def find_matching_opportunity(self, invoice):
        """Match invoice to opportunity using matching algorithm."""
        # Implementation of matching logic
        pass
    
    def calculate_payment_status(self, invoice, total_paid):
        """Determine payment status."""
        total = float(invoice['TOTALENTERED'])
        if total_paid == 0:
            return 'Invoiced'
        elif total_paid >= total:
            return 'Fully Paid'
        else:
            return 'Partially Paid'
```

---

## Questions to Resolve

### 1. Multi-Year Grants
**Question:** If a grant is $500K over 2 years ($250K/year), do you:
- [ ] A) Create ONE opportunity for $500K, then multiple invoices?
- [ ] B) Create TWO opportunities ($250K each), one invoice per opp?
- [ ] C) Something else?

### 2. Partial Payments
**Question:** If an invoice is $100K and they pay $50K, then $50K:
- [ ] A) Track all payments against the same invoice in Sage?
- [ ] B) Create multiple invoices for each payment?

### 3. Customer Name Matching
**Question:** Sage has different customer names sometimes:
- "Blackstone Charitable Foundation" (C1028)
- "Blackstone, Inc." (C1781)

Are these:
- [ ] A) Same funder (should be linked to same SF Account)?
- [ ] B) Different entities (separate SF Accounts)?

### 4. Invoice Timing
**Question:** How long after an opportunity closes is the invoice typically created?
- [ ] A) Same day
- [ ] B) Within a week
- [ ] C) Within a month
- [ ] D) Varies widely

This helps set the matching date range.

### 5. Amendment Scenarios
**Question:** If a grant amount changes (amendment), do you:
- [ ] A) Update the existing opportunity in SF?
- [ ] B) Create a new opportunity?
- [ ] C) Create a change order/amendment record?

And in Sage:
- [ ] A) Update existing invoice?
- [ ] B) Create new invoice?
- [ ] C) Create credit memo + new invoice?

---

## Next Steps

1. **Answer questions above** to finalize matching rules
2. **Export sample data** (5-10 recent grants) to test matching
3. **Build matching script** to link existing invoices
4. **Review matches** with bookkeeper before saving
5. **Implement ongoing sync** for new invoices
6. **Update dashboard** to show linked data

---

## Success Metrics

**Phase 1 Success:**
- [ ] 80%+ of historical invoices (>$10K) matched to opportunities
- [ ] 100% of ambiguous matches reviewed and resolved
- [ ] All links stored in both systems

**Phase 2 Success:**
- [ ] 100% of new invoices linked within 24 hours of creation
- [ ] <5% false matches requiring manual correction
- [ ] Bookkeeper spends <5 minutes per invoice on linking

**Phase 3 Success:**
- [ ] CEO can see complete pipeline → invoice → payment flow
- [ ] Cash flow forecast accuracy improves to 90%+
- [ ] Time spent on manual tracking reduced by 80 hours/month

