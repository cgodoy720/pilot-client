# ✅ Complete Workflow Test Guide

## 🎯 **The Full Flow: Opportunity → Payment Schedule → Invoicing**

You've completed Step 1 & 2! Now let's test the finance workflow.

---

## 📋 **Complete Workflow**

### **✅ Step 1: Create Opportunity** (DONE)
- Created opportunity in Salesforce
- Set amount (e.g., $100)

### **✅ Step 2: Create Payment Schedule** (DONE)
- Changed stage to "Collecting / In Effect" in app
- System redirected to payment schedule page
- Created payment schedule (e.g., 2 x $50)
- Saved → Opportunity moved to "Collecting / In Effect"

### **➡️ Step 3: Finance Team Creates Invoices** (NEXT)

---

## 🚀 **Finance Dashboard Workflow**

### **1. Navigate to Finance Dashboard**
```
http://localhost:3000/finance-dashboard
```

### **2. Click "Payments" Tab**
This is the first tab. You should see:
- List of all payments without invoices
- From opportunities in "Collecting / In Effect" stage
- Your newly created payments should appear here

**Columns you'll see:**
- Opportunity Name
- Account Name
- Payment Amount
- Due Date (Scheduled Date)
- Opportunity Close Date
- **"Create Invoice" button**

### **3. Create Invoice for a Payment**
- Click **"Create Invoice"** button on any payment
- Confirm the prompt
- System will:
  - ✅ Create invoice in Sage Intacct for that payment amount
  - ✅ Link invoice to that payment
  - ✅ Remove payment from "Payments" tab (now has invoice)
  - ✅ Add invoice to "Unsent Invoices" tab

### **4. Send Invoice** (Manual in Sage)
- Log into Sage Intacct
- AR > Invoices > Find the invoice
- Click "Email" to send to funder

### **5. Track Payment**
- When payment received in Sage, mark invoice as paid
- In app: Click **"Sync from Sage"** button
- System automatically:
  - ✅ Marks invoice as paid
  - ✅ Marks payment as paid
  - ✅ Moves to "Active Collections" tab
  - ✅ When ALL payments paid → Auto-completes opportunity

---

## 🧪 **Test Scenario**

Let's test with your $100 opportunity (2 x $50 payments):

### **A. View Payments Ready to Invoice**
1. Go to Finance Dashboard
2. Click "Payments" tab
3. **Expected:** See 2 rows for your $50 payments

### **B. Create Invoice for Payment #1**
1. Click "Create Invoice" on first $50 payment
2. Confirm prompt
3. **Expected:**
   - Success toast: "Invoice [ID] created!"
   - Payment disappears from "Payments" tab
   - Invoice appears in "Unsent Invoices" tab
4. Check Sage Intacct
   - **Expected:** New invoice for $50 created

### **C. Send Invoice** (Manual)
1. In Sage: AR > Invoices > Find invoice
2. Click Email button
3. Send to test email

### **D. Mark as Paid** (Simulated Payment)
1. In Sage: Mark invoice as paid
2. In app: Go to "Unsent Invoices" tab
3. Click **"Sync from Sage"**
4. **Expected:**
   - Payment #1 marked as paid in Salesforce
   - Shows in "Active Collections" tab
   - Opportunity shows 1 of 2 payments received

### **E. Complete Second Payment**
1. Repeat steps B-D for Payment #2
2. After second payment synced:
   - **Expected:** Opportunity auto-completes to "Closed / Completed"
   - Shows in "Completed" tab

---

## 📊 **Finance Dashboard Tabs Explained**

### **Tab 1: Payments (Awaiting Invoice)**
- Shows: Individual payments without invoices
- Filter: Opp stage = "Collecting / In Effect", no invoice, not paid
- Action: "Create Invoice" button per payment

### **Tab 2: Unsent Invoices**
- Shows: Invoices created but not emailed
- Action: "Send Email" button (marks as sent, instructions for Sage)
- Action: "Sync from Sage" button (updates status from Sage)

### **Tab 3: Active Collections**
- Shows: Opportunities with invoices, some payments still outstanding
- Info: Payment tracking, amounts received vs. outstanding
- Action: "Track Payments" to see detail

### **Tab 4: Completed**
- Shows: Opportunities with all payments received
- Filter: All payments marked as paid
- Status: "Closed / Completed"

---

## ⚡ **Quick Test Commands**

### **Start Backend:**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python simple_server.py
```

### **Start Frontend:**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm start
```

### **Test Payment Query (Backend Running):**
```bash
curl http://localhost:8000/api/finance/awaiting-invoices | python3 -m json.tool
```

Should return your 2 payments ready to invoice.

---

## 🎯 **Expected Results Summary**

After completing the full workflow:

1. **Payments Tab:** Empty (all payments have invoices)
2. **Unsent Invoices Tab:** Empty (all sent)
3. **Active Collections Tab:** Empty (all paid)
4. **Completed Tab:** Your opportunity showing as completed

**Salesforce:**
- Opportunity stage: "Closed / Completed"
- 2 payments: Both marked as paid (`npe01__Paid__c = true`)
- 2 invoices: Both linked to payments

**Sage Intacct:**
- 2 invoices created for $50 each
- Both marked as paid

---

## ✅ **What's Working**

- ✅ Payment schedule creation with validation
- ✅ Automatic stage enforcement
- ✅ Per-payment invoice creation
- ✅ Invoice-payment linking
- ✅ Sage integration for invoice creation
- ✅ Payment status syncing from Sage
- ✅ Automatic opportunity completion

---

## 🎉 **Ready to Test!**

1. Start both servers
2. Go to Finance Dashboard
3. Click "Payments" tab
4. See your payments
5. Create invoices!

Let me know if you see your payments in the Finance Dashboard! 🚀

