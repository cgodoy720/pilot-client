# 🏗️ Architecture Decisions & Questions

## ⚠️ **Flagged for Review**

### **1. Invoice__c Object - Is it needed?**

**Current Implementation:**
```
Payment → Invoice__c (junction object) → Sage Invoice ID
```

**Alternative (Simpler):**
```
Payment.Sage_Invoice_ID__c → "30555" (direct field)
```

**Trade-offs:**

| Aspect | Current (Invoice__c Object) | Simpler (Direct Field) |
|--------|---------------------------|----------------------|
| Complexity | More complex | Simpler to maintain |
| Data tracking | Can track invoice status in SF | Status only in Sage |
| Relationship | Supports M:M (if needed) | 1:1 only |
| Queries | More joins needed | Direct access |
| Audit trail | Full invoice history in SF | Minimal SF history |

**Current Decision:** Keep Invoice__c object for now

**Reason:** Provides flexibility and cleaner data model

**Revisit When:** 
- System is in production for 3+ months
- We have usage patterns data
- Finance team feedback on what data they actually need in SF

**Recommendation for Future:**
If we find we're always querying Sage for invoice details anyway, and the Invoice__c object is just a lookup table with no real value-add, consider simplifying to direct field.

---

### **2. Partial Payment Tracking**

**Current Implementation:**
- Boolean only: `npe01__Paid__c` (TRUE/FALSE)
- No tracking of partial amounts

**Gap:**
```
Scenario: Invoice for $50,000
- Customer pays $25,000 on Jan 10
- Customer pays $25,000 on Jan 20

Current System: 
- Shows as "Not Paid" until both payments received
- Can't see partial progress
```

**Potential Solutions:**

#### **Option A: Add Amount Paid Field** (Recommended)
```sql
-- Add to npe01__OppPayment__c:
Sage_Amount_Paid__c (Currency)

-- Sync logic:
if amount_paid >= scheduled_amount:
    npe01__Paid__c = TRUE
else:
    npe01__Paid__c = FALSE
    
Sage_Amount_Paid__c = amount_paid (always updated)
```

**Dashboard shows:**
- Expected: $50,000
- Received: $25,000
- Status: Partially Paid (50%)

#### **Option B: Split Payment Records**
When partial payment received, split into:
- Payment 1: $25,000 (Paid)
- Payment 2: $25,000 (Unpaid)

**Cons:** Retroactively changes payment schedule ❌

#### **Option C: Accept Current Limitation**
- Partial payment details only visible in Sage
- Salesforce shows binary paid/unpaid
- Good enough if partial payments are rare

**Current Decision:** Keep boolean for now (Option C)

**Reason:** Need to understand how common partial payments are

**Data to Collect:**
1. How often do partial payments happen?
2. Do they eventually pay in full, or are there write-offs?
3. What does finance team need to see in SF vs. what they check in Sage?

**Revisit When:**
- Finance team reports confusion about payment status
- Partial payments become common
- We need better cash flow forecasting

---

### **3. Invoice Creation - When and How?**

**Current:** Manual creation by finance team via dashboard

**Alternatives:**

#### **Option A: Fully Manual** (Current)
- Finance decides when to create invoice
- Full control over timing and details
- Good for complex situations

#### **Option B: Auto-create on Stage Change**
- When opportunity moves to "Collecting / In Effect"
- Automatically create invoices for all payments
- Could be optional with confirmation

#### **Option C: Auto-create on Payment Due Date**
- Background job creates invoice X days before due date
- Sends reminder to finance team
- More proactive

**Current Decision:** Manual (Option A)

**Reason:** 
- Early in system adoption
- Finance team wants control
- Not all grants follow same process

**Revisit When:**
- Process is more standardized
- Team is comfortable with system
- Volume increases

---

### **4. Sage Invoice ID Format**

**Current Issue:** Demo mode uses `DEMO-xxxxxxxx` format

**Real Sage Format:** Numeric ID (e.g., `30555`)

**Questions:**
1. Should we generate a Sage invoice number in advance?
2. Or create invoice in Sage first, then get ID back?
3. How to handle duplicate detection?

**Current Decision:** Create in Sage first (when ready), get ID back

**To Implement:**
- Replace DEMO mode with real Sage invoice creation
- Use Sage's `create` API to generate invoice
- Store returned RECORDNO in Sage_Invoice_ID__c

---

### **5. Customer Matching - Salesforce Account → Sage Customer**

**Challenge:** Salesforce Account names might not exactly match Sage Customer names

**Example:**
- Salesforce: "Ford Foundation"
- Sage: "The Ford Foundation"

**Current Solution:** Use exact Account name from Salesforce opportunity

**Potential Issues:**
- Customer might not exist in Sage
- Name might not match exactly
- Could create duplicate customers

**Better Solution (To Build):**
1. Add `Sage_Customer_ID__c` field to Salesforce Account
2. One-time mapping: Link SF Accounts to Sage Customers
3. Invoice creation uses the Sage Customer ID
4. If no mapping, show dropdown to select/create

**Current Decision:** Use Account name, let finance edit on form

**Reason:** Simple for MVP

**Revisit When:** 
- Customer matching errors occur
- Need to create invoices in Sage (not DEMO mode)

---

### **6. Multi-Currency Support**

**Current:** Assumes all grants in USD

**Future Consideration:**
- International funders pay in different currencies
- Need currency conversion tracking
- Sage supports multi-currency

**Not addressed yet.** Flag for Phase 2.

---

### **7. Invoice Line Items**

**Current:** Each invoice has one line item (the payment amount)

**Potential Need:**
- Itemized invoices (Program A: $25k, Program B: $25k)
- Multiple GL accounts per invoice
- Tax/fees as separate line items

**Current Decision:** Single line item per invoice (simple)

**Reason:** Matches most grant use cases

**Revisit If:** Finance team requests itemization

---

## 📊 **Decision Log**

| Decision | Date | Status | Owner |
|----------|------|--------|-------|
| Keep Invoice__c object | 2025-11-13 | ⚠️ Flagged for review | TBD |
| Partial payments: Boolean only | 2025-11-13 | ⚠️ Flagged for review | TBD |
| Manual invoice creation | 2025-11-13 | ✅ Accepted | Finance Team |
| Create invoice in Sage first | 2025-11-13 | 🔄 To Implement | Dev |
| Simple customer matching | 2025-11-13 | ✅ Accepted (MVP) | Finance Team |

---

## 🎯 **Next Review:**

Schedule architecture review after:
- [ ] 100 invoices created
- [ ] 3 months of usage
- [ ] Feedback from finance team collected
- [ ] Common pain points identified

Then decide on simplifications or enhancements.

