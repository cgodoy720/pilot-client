# ✅ Payment Schedule Management - Complete!

## 🎯 What's New

You now have a **Payment Schedule Management** page where you can:
- Create/edit payment schedules for opportunities
- Validates totals match opportunity amount
- Automatically moves opportunity to "Collecting / In Effect" after saving
- Prevents orphan opportunities without payment schedules

---

## 🔄 The Workflow

### **Step 1: Create or Find Opportunity**
In Salesforce:
- Create a new opportunity (e.g., "$100,000 Foundation Grant")
- Set amount and close date
- **Keep in stage "Closed Won" for now**

### **Step 2: Create Payment Schedule in App**
Navigate to:
```
http://localhost:3000/payment-schedule/OPPORTUNITY_ID
```

**Example:**
```
http://localhost:3000/payment-schedule/0061300000GFYd4AAH
```

### **Step 3: Configure Payments**
In the payment schedule page:
1. Enter payment amounts and due dates
2. Click "Add Payment" to add more payments
3. Ensure total equals opportunity amount
4. Click "Save & Move to Collecting"

**Example: Multi-Year Grant**
```
Payment 1: $50,000 - Due: 2024-01-15
Payment 2: $50,000 - Due: 2025-01-15
Total: $100,000 ✅
```

### **Step 4: Automatic Stage Change**
When you save:
- ✅ Payments created in Salesforce (`npe01__OppPayment__c`)
- ✅ Opportunity moved to "Collecting / In Effect"
- ✅ Redirects to Finance Dashboard
- ✅ Payments appear in "Payments" tab ready for invoicing

---

## 📊 What Happens Behind the Scenes

### 1. **Validation**
- Checks payment total = opportunity amount
- Ensures all payments have amounts and dates
- Prevents invalid payment schedules

### 2. **Saves to Salesforce**
```
Creates npe01__OppPayment__c records:
  - npe01__Opportunity__c = opportunity ID
  - npe01__Payment_Amount__c = amount
  - npe01__Scheduled_Date__c = due date
  - npe01__Paid__c = false
```

### 3. **Updates Opportunity Stage**
```
Opportunity.StageName = "Collecting / In Effect"
```

### 4. **Shows in Finance Dashboard**
```
Finance Dashboard > "Payments" tab
→ Shows all unpaid payments ready to invoice
```

---

## 🚀 Quick Example

### Test Scenario: $100 Grant, 2 Payments

**1. Create Opportunity in Salesforce**
- Name: "Test Grant"
- Amount: $100
- Stage: "Closed Won"
- Copy the Opportunity ID

**2. Navigate to Payment Schedule**
```
http://localhost:3000/payment-schedule/YOUR_OPP_ID
```

**3. Configure Payments**
```
Payment 1: $50 - Due: 2024-12-15
Payment 2: $50 - Due: 2025-01-15
```

**4. Save**
- Click "Save & Move to Collecting"
- Opportunity moves to "Collecting / In Effect"
- Go to Finance Dashboard > Payments tab
- See both $50 payments ready to invoice

**5. Create Invoices**
- Click "Create Invoice" on Payment 1
- Invoice created in Sage for $50
- Repeat for Payment 2 when due

---

## 🔑 API Endpoints

### Get Existing Payment Schedule
```
GET /api/opportunities/{opportunityId}/payment-schedule
```

### Save Payment Schedule
```
POST /api/opportunities/create-payment-schedule
{
  "opportunity_id": "string",
  "payments": [
    {"amount": 50000, "scheduled_date": "2024-01-15"},
    {"amount": 50000, "scheduled_date": "2025-01-15"}
  ],
  "delete_existing": true
}
```

### Update Opportunity Stage
```
POST /api/opportunities/update-stage
{
  "opportunity_id": "string",
  "new_stage": "Collecting / In Effect"
}
```

---

## ⚠️ Important Notes

### Validation Rules
1. **Payment total MUST equal opportunity amount**
   - Difference must be < $0.01
   - System blocks saving if mismatch

2. **All payments must have:**
   - Amount > $0
   - Scheduled date

3. **Stage requirement:**
   - Opportunity must exist in Salesforce
   - Will move to "Collecting / In Effect" after saving

### Existing Payments
- If opportunity already has payments, they'll be loaded automatically
- Saving replaces ALL existing payments (delete_existing: true)
- Edit and re-save to update schedule

---

## 🎨 UI Features

- ✅ Real-time total calculation
- ✅ Validation warnings
- ✅ Add/remove payment rows
- ✅ Date picker for scheduled dates
- ✅ Color-coded validation (green = valid, red = invalid)
- ✅ Prevents saving invalid schedules

---

## 🔗 Integration with Invoice Creation

Once payment schedule is saved:

1. **Payments appear in Finance Dashboard**
   - Finance Dashboard > "Payments" tab
   - Shows all payments without invoices

2. **Create invoices per payment**
   - Click "Create Invoice" on any payment
   - Creates invoice in Sage for that specific payment
   - Links invoice to payment

3. **Track payments automatically**
   - "Sync from Sage" marks payments as paid
   - Auto-completes opportunity when all payments paid

---

## 📋 Future Enhancements (Optional)

- **Template Schedules:** Quarterly, annual, etc.
- **Quick Actions:** "Split Evenly" button
- **Payment Schedule from Salesforce:** Link from opportunity detail page
- **Validation on Stage Change:** Block "Collecting / In Effect" without schedule

---

## ✅ Ready to Use!

The payment schedule workflow is complete and integrated with the invoice system.

**To test:**
1. Create opportunity in Salesforce
2. Navigate to `/payment-schedule/OPP_ID`
3. Create schedule
4. Go to Finance Dashboard
5. Create invoices per payment

🎉 Enjoy!

