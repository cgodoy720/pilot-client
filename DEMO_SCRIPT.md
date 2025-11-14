# 🎬 Grant Lifecycle System - Demo Script

**Duration:** 10 minutes  
**Date:** Tomorrow  
**Audience:** Finance & Philanthropy Teams

---

## 🎯 **Demo Goal**

Show the complete flow from grant opportunity creation to completion, with real Sage Intacct integration.

---

## 📊 **Understanding the Data Flow First** (2 minutes)

**KEY CONCEPT:** There are TWO types of "payments":

### **Salesforce Payments (npe01__OppPayment__c)**
- These are EXPECTED payments - the payment schedule
- Created when finance team plans invoice
- Example: "$50k due on 12/15/2025"
- Think of these as the **promise** of payment

### **Sage Intacct Payments (ARPAYMENT)**
- These are ACTUAL payments received
- Created when money arrives in bank
- Applied TO the invoice in Sage
- Think of these as the **fulfillment** of the promise

### **The Connection: Sage Invoices (ARINVOICE)**
- Bridge between promise and fulfillment
- Salesforce payments → Linked to → Sage Invoice
- Actual payments → Applied to → Sage Invoice
- **This is why we added the Invoice__c field!**

**Visual:**
```
Salesforce                    Sage Intacct
----------                    ------------
Opportunity ($50k)
    ↓
Payment Schedule              
  - Payment 1: $50k ----→  Invoice ($50k) ←---- Payment ($50k received)
    (expected)                                  (actual)
```

---

## 🎬 **The Demo Flow** (8 minutes)

### **Step 1: Create Opportunity** (1 min)

**What to say:**
> "We just received a $50k grant from Acme Foundation. Let me show you how we track this..."

**Actions:**
1. Open Salesforce
2. Create new Opportunity:
   - Name: "Acme Foundation 2025 General Support"
   - Amount: $50,000
   - Account: "Acme Foundation"
   - Close Date: Today
   - Stage: "Prospecting"
3. Click Save

**What to explain:**
> "This is the grant opportunity. Notice it starts in 'Prospecting' stage. We'll move it through the stages as we win the grant and collect payment."

---

### **Step 2: Win the Grant** (30 sec)

**What to say:**
> "Great news - we won the grant! Now we need to track when we'll invoice and receive payment..."

**Actions:**
1. Edit Opportunity
2. Change Stage to: "Closed Won"
3. Click Save

**What to explain:**
> "When we mark it as 'Closed Won', the grant is official. Now finance needs to set up the payment schedule."

**KEY POINT TO EMPHASIZE:**
> "Notice we're NOT automatically creating the payment schedule. This was a critical design decision - we want finance to control this based on the actual signed grant agreement, not have the grant writer guess the payment terms."

---

### **Step 3: Create Payment Schedule** (2 min)

**What to say:**
> "Now let's open the Finance Dashboard. This is the finance team's command center..."

**Actions:**
1. Navigate to Finance Dashboard
2. Click "Awaiting Invoice" tab
3. Show the Acme Foundation grant in the list
4. Click "Create Payment Schedule" button

**Modal opens:**

**What to explain:**
> "The system initializes with one payment for the full amount. For this demo, it's a simple single payment grant. But we could split this into multiple payments - say, $25k now and $25k in 6 months."

**Actions in Modal:**
1. Show Payment 1: $50,000
2. Set Scheduled Date: 30 days from today
3. Click "Save Payment Schedule"

**What to explain:**
> "The payment schedule is now saved in Salesforce as NPSP Payment records. These represent EXPECTED payments - the promise in the grant agreement."

---

### **Step 4: Create Invoice in Sage** (2 min)

**What to say:**
> "Now we're ready to invoice the funder. Watch what happens when I click 'Create Invoice'..."

**Actions:**
1. Still in Finance Dashboard
2. Same grant should now show "Create Invoice" button enabled
3. Click "Create Invoice"
4. **WATCH THE MAGIC:**
   - System validates (no duplicate, payment schedule matches amount)
   - Creates invoice in Sage Intacct (REAL API CALL)
   - Creates Sage_Invoice__c record in Salesforce
   - Links the payment to the invoice (Invoice__c field)
   - Updates opportunity stage to "Collecting / In Effect"

**What to explain:**
> "Behind the scenes, several things just happened:
> 
> 1. **Validation**: System checked that payment schedule totals match the grant amount ($50k = $50k ✓)
> 2. **Duplicate Prevention**: System verified no invoice already exists for this grant
> 3. **Sage Invoice Created**: Real API call to Sage Intacct created invoice #[XXXXX]
> 4. **Salesforce Tracking**: We created a Sage_Invoice__c record to track this invoice
> 5. **Payment Linking**: Our payment schedule is now linked to this specific invoice
> 6. **Stage Updated**: Opportunity moved to 'Collecting / In Effect' - we're waiting for payment"

**If error occurs:**
> "If you see an error, it's likely:
> - Customer doesn't exist in Sage (need to create 'Acme Foundation' customer first)
> - Sage credentials not configured
> - Network issue
> 
> For the demo, I've pre-configured everything, so this should work smoothly."

---

### **Step 5: Show Active Collections** (1 min)

**What to say:**
> "Now let's see the 'Active Collections' tab - grants we're waiting to collect payment on..."

**Actions:**
1. Click "Active Collections" tab
2. Show the Acme Foundation grant now appears here
3. Point out columns:
   - Invoice Count: 1
   - Payment Count: 1
   - Received Count: 0 (none received yet)
   - Outstanding: $50,000

**What to explain:**
> "This is the finance team's tracking dashboard. They can see:
> - Which grants have invoices out
> - Which payments are outstanding
> - What's overdue (if any)
> 
> This invoice is now in Sage Intacct. The funder will receive it and eventually send us a check."

---

### **Step 6: Receive Payment** (1.5 min)

**What to say:**
> "Great news - the check arrived! Let's record that we received the $50k payment..."

**Actions:**
1. In Active Collections tab
2. Click "Track Payments" button for Acme grant
3. **Payment Tracking Modal opens**
4. Show the payment: $50,000 due on [date]
5. Click "Mark as Received" button
6. Confirm: "Yes, mark as received today"

**What happens:**
- npe01__OppPayment__c record updated: `Paid__c = true`
- Payment_Date__c set to today
- Modal refreshes

**What to explain:**
> "We just marked the payment as received in Salesforce. In a real scenario, this payment would also be recorded in Sage Intacct when it hits our bank account.
> 
> **Important**: In Sage, the payment (ARPAYMENT) is applied TO the invoice we created. That's why linking payments to invoices is critical."

---

### **Step 7: Complete the Grant** (1 min)

**What to say:**
> "All payments are now received. Let's mark this grant as complete..."

**Actions:**
1. In Payment Tracking Modal, click "Mark Complete" button
2. Confirm
3. Modal closes
4. Click "Completed" tab
5. Show Acme Foundation grant now in Completed list

**What to explain:**
> "The grant is now fully complete:
> - Invoice sent ✓
> - Payment received ✓
> - Opportunity stage: 'Closed / Completed' ✓
> 
> This grant is now in our completed tab. We have a full audit trail:
> - When it was won
> - When invoice was created
> - When payment was received
> - Full history in both Salesforce and Sage"

---

## 🎯 **Key Points to Emphasize**

### **1. Safety Features Built In**
- ✅ Duplicate detection (can't create two invoices for same grant)
- ✅ Validation (payment schedule must match grant amount)
- ✅ No auto-create (finance controls payment schedule, not automatic)
- ✅ Error handling (clear messages if something fails)

### **2. Real Integration**
- ✅ This is NOT a mockup - real Sage Intacct API calls
- ✅ Invoice actually created in Sage
- ✅ Two-way data flow (Salesforce ↔ Sage)

### **3. Data Integrity**
- ✅ Payments linked to invoices (critical for multi-invoice scenarios)
- ✅ Audit trail preserved
- ✅ Both systems stay in sync

### **4. Designed for Your Workflow**
- ✅ Finance team controls when to create payment schedule
- ✅ Manual completion (not automatic) for safety
- ✅ Clear dashboard to see what needs attention

---

## ❓ **Expected Questions & Answers**

### **Q: What if the funder pays us before we create the invoice?**
**A:** We can still create the invoice in Sage and then immediately mark the payment as received. The system is flexible.

### **Q: What if we need to create multiple invoices for one grant?**
**A:** That's Phase 2! Right now, MVP supports one invoice per grant. Phase 2 will add multi-invoice support (e.g., $100k grant with $50k invoice year 1, $50k invoice year 2).

### **Q: What if the payment amount doesn't match? (e.g., they send $49k instead of $50k)**
**A:** Great question! For now, you'd need to adjust the payment schedule in Salesforce first, then mark as received. Phase 2 will add variance tracking.

### **Q: Can we delete an invoice if we make a mistake?**
**A:** For safety, deletion is restricted. You'd need to void the invoice in Sage, then manually update Salesforce. We can add a "void invoice" button in Phase 2.

### **Q: How do we know when to send the invoice to the funder?**
**A:** When you create the invoice, it appears in Sage. You can configure Sage to auto-send or manually review and send. That's controlled in Sage, not in this system.

### **Q: What if the same person tries to create an invoice twice?**
**A:** The system checks for duplicates before creating. You'll see an error: "Invoice already exists for this opportunity" with details about the existing invoice.

### **Q: Does this replace our current process?**
**A:** No! Phase 1 runs alongside your current process. You can still do everything manually if needed. This just makes it faster and prevents errors.

### **Q: What about multi-year grants with multiple payments?**
**A:** Perfect use case! You'd create multiple payments in the schedule (e.g., 4 quarterly payments). The system creates one invoice with all payments as line items. In Phase 2, we'll support creating multiple invoices over time.

---

## 🚨 **If Something Goes Wrong During Demo**

### **Error: "Customer not found in Sage"**
**What to say:**
> "Ah, this funder doesn't exist in Sage yet. In production, we'd create the customer first. Let me show you what the error message tells us..."

**Show:** The detailed error message with suggestion
**Point out:** Good error handling prevents bad data

---

### **Error: "Invoice already exists"**
**What to say:**
> "Perfect! This shows our duplicate detection working. You can see it's telling us invoice #[XXXX] already exists. This prevents us from accidentally double-billing a funder."

**Show:** The error details
**Point out:** This is a FEATURE, not a bug

---

### **Error: "Payment schedule total doesn't match"**
**What to say:**
> "This is our validation at work. The system is preventing us from creating an invoice that doesn't match the grant amount. Let me fix the payment schedule..."

**Show:** How to edit payment schedule
**Point out:** Catches data entry errors

---

## 📋 **Pre-Demo Checklist**

**Day Before:**
- [ ] Run Sage test invoice manually to verify API works
- [ ] Create test customer in Sage ("Acme Foundation")
- [ ] Verify Salesforce credentials work
- [ ] Run `add_invoice_field_to_payments.py` to add Invoice__c field
- [ ] Test full flow once end-to-end
- [ ] Have backup data if demo environment fails

**30 Minutes Before:**
- [ ] Backend server running (`cd financial_forecasting && python simple_server.py`)
- [ ] Frontend running (`cd financial_forecasting/frontend && npm start`)
- [ ] Fresh opportunity ready OR ability to create quickly
- [ ] Browser open to Finance Dashboard
- [ ] Sage Intacct open in another tab (to show invoice created)

---

## 🎓 **Demo Tips**

**DO:**
- ✅ Explain the "promise vs fulfillment" concept upfront
- ✅ Show each step slowly and clearly
- ✅ Point out the safety features as you go
- ✅ Show the Sage invoice in Sage Intacct after creation
- ✅ Emphasize this is Phase 1 (simple scenarios)
- ✅ Ask "What questions do you have?" frequently

**DON'T:**
- ❌ Rush through the payment schedule step
- ❌ Forget to explain why we're not auto-creating schedules
- ❌ Skip showing the Finance Dashboard overview
- ❌ Hide errors (use them as teaching moments)
- ❌ Oversell features not in Phase 1

---

## 🎬 **Closing**

**What to say:**
> "That's the complete grant lifecycle:
> 1. Win the grant ✓
> 2. Set payment schedule ✓
> 3. Create invoice in Sage ✓
> 4. Track payment receipt ✓
> 5. Mark complete ✓
> 
> This is Phase 1 - simple, safe, and real. No mockups, actual Sage integration.
> 
> Phase 2 will add:
> - Multi-invoice support
> - Amendments
> - Variance tracking
> - Automatic payment sync from Sage
> 
> But we wanted to start simple, prove it works, and get your feedback.
> 
> Questions?"

---

## 📞 **Follow-Up Actions**

After demo, send:
- [ ] Link to FINANCE_TEAM_DISCOVERY_QUESTIONS.md
- [ ] Request 3-5 pilot grants to test with
- [ ] Schedule follow-up meeting in 1 week
- [ ] Share this demo script for reference

---

**Good luck with the demo!** 🚀

Remember: The goal is to show value, get feedback, and validate the approach. It's OK if it's not perfect - that's why it's Phase 1!

