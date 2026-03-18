# 🚀 Quick Setup Guide - Grant Lifecycle System

## ✅ What's Ready to Go

Your system is **fully built** and **backend is running**! Just need to create one Salesforce object and you're ready to test.

---

## 📋 Setup Checklist

### **1. Create Salesforce Custom Object** (2-5 minutes)

**🚀 AUTOMATED OPTION (Recommended - 2 minutes):**

We've generated a deployment package for you!

```bash
# Already generated! Just deploy it:
# File: Sage_Invoice_Deployment.zip
```

**Deploy via Salesforce Workbench:**
1. Go to: https://workbench.developerforce.com/
2. Login with your Salesforce credentials
3. Click **"migration"** → **"Deploy"**
4. Choose file: `Sage_Invoice_Deployment.zip` (in the project root)
5. Check **"Single Package"**
6. Click **"Next"** → **"Deploy"**
7. Wait 30 seconds ✅
8. Done!

**Then add to page layout:**
1. Setup → Object Manager → Opportunity → Page Layouts
2. Edit your layout → Add "Sage Invoices" related list
3. Save

---

**OR MANUAL OPTION (5 minutes):**

#### **Step 1: Create the Object**
1. Go to **Setup** → **Object Manager** → **Create** → **Custom Object**
2. Fill in:
   - **Label**: `Sage Invoice`
   - **Plural Label**: `Sage Invoices`
   - **Record Name**: Select **Auto Number**
   - **Display Format**: `INV-{0000}`
   - **Starting Number**: `1`
3. Click **Save**

#### **Step 2: Create Fields**

Create these fields (click **New** in Fields & Relationships):

**a) Opportunity (Master-Detail)**
- Field Type: **Master-Detail Relationship**
- Related To: **Opportunity**
- Field Label: `Opportunity`
- Child Relationship Name: `Sage_Invoices`
- Required: **Yes**
- Click **Next** → **Next** → **Save**

**b) Sage Invoice ID**
- Field Type: **Text**
- Field Label: `Sage Invoice ID`
- Length: `100`
- ✅ Check **Unique**
- ✅ Check **External ID**
- Required: **Yes**
- Click **Next** → **Next** → **Save**

**c) Invoice Amount**
- Field Type: **Currency**
- Field Label: `Invoice Amount`
- Length: `16`, Decimal Places: `2`
- Required: **Yes**
- Click **Next** → **Next** → **Save**

**d) Invoice Date**
- Field Type: **Date**
- Field Label: `Invoice Date`
- Required: **Yes**
- Click **Next** → **Next** → **Save**

**e) Due Date**
- Field Type: **Date**
- Field Label: `Due Date`
- Required: **No**
- Click **Next** → **Next** → **Save**

**f) Invoice Status**
- Field Type: **Picklist**
- Field Label: `Invoice Status`
- Values (one per line):
  ```
  Draft
  Sent
  Partially Paid
  Paid
  Overdue
  Cancelled
  ```
- Default: `Draft`
- Required: **Yes**
- Click **Next** → **Next** → **Save**

**g) Description**
- Field Type: **Long Text Area**
- Field Label: `Description`
- Length: `32768`
- Visible Lines: `3`
- Required: **No**
- Click **Next** → **Next** → **Save**

#### **Step 3: Add to Opportunity Layout**
1. Go to **Setup** → **Object Manager** → **Opportunity** → **Page Layouts**
2. Edit your active layout
3. Scroll down to **Related Lists**
4. Drag **Sage Invoices** onto the layout
5. Click **Save**

---

### **2. Verify Backend is Running** (30 seconds)

```bash
# Check backend status
curl http://localhost:8000/health

# Should see:
# {"status":"healthy","timestamp":"..."}
```

If not running:
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python3 simple_server.py
```

---

### **3. Start Frontend** (1 minute)

```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm start
```

Opens at: http://localhost:3000

---

## 🎯 Test the Complete Flow (5 minutes)

### **Test 1: Create Payment Schedule**
1. Go to **Opportunities** page
2. Edit any opportunity
3. Change **Stage** to **"Closed Won"**
4. Click **Save**
5. ✅ **Payment Schedule Modal opens automatically!**
6. You'll see 1 payment with the full opportunity amount
7. Click **"Add Payment"** to split into multiple payments
8. Edit dates and amounts:
   - Payment 1: $50,000 on 06/01/2026
   - Payment 2: $50,000 on 12/01/2026
9. Click **"Save Payment Schedule"**
10. ✅ **Success!** Payments saved to Salesforce

### **Test 2: Finance Dashboard**
1. Go to **Finance Dashboard** (sidebar)
2. See your opportunity in **"Awaiting Invoice"** tab
3. Should show: 2 payments scheduled
4. ✅ **Dashboard working!**

### **Test 3: Create Invoice**
1. Still on **Finance Dashboard** → **"Awaiting Invoice"** tab
2. Find your opportunity
3. Click **"Create Invoice"**
4. Confirm
5. ✅ **Invoice created in Sage Intacct!**
6. ✅ **Sage_Invoice__c record created in Salesforce!**
7. ✅ **Opportunity moved to "Collecting / In Effect"!**
8. Opportunity now appears in **"Active Collections"** tab

### **Test 4: View Invoice in Salesforce**
1. Go to Salesforce → Open the opportunity
2. Scroll down to **"Sage Invoices"** related list
3. ✅ **See your invoice!** Shows:
   - Invoice Number (INV-0001)
   - Sage Invoice ID
   - Amount
   - Date
   - Status

### **Test 5: Track Payments**
1. Back to **Finance Dashboard** → **"Active Collections"** tab
2. Find your opportunity
3. Click **"Track Payments"**
4. Modal shows all scheduled payments
5. Click **"Mark Received"** on first payment
6. ✅ **Payment updated!**
7. When all payments marked received:
   - ✅ **Opportunity auto-moves to "Closed / Completed"!**
   - ✅ **Success notification!**

---

## 📊 What You'll See

### **Finance Dashboard:**

**Awaiting Invoice Tab:**
| Opportunity | Account | Amount | Payments | Actions |
|-------------|---------|--------|----------|---------|
| Acme Foundation | Acme Corp | $100,000 | 2 scheduled ✅ | **Create Invoice** |

**Active Collections Tab:**
| Opportunity | Account | Invoices | Paid | Outstanding | Progress | Status | Actions |
|-------------|---------|----------|------|-------------|----------|--------|---------|
| Acme Foundation | Acme Corp | 1 | $50k | $50k | 1/2 payments | On Track ✅ | **Track Payments** |

**Completed Tab:**
| Opportunity | Account | Amount | Invoices | Invoice IDs |
|-------------|---------|--------|----------|-------------|
| Beta Foundation | Beta Inc | $200,000 | 1 invoice(s) | INV-0001 |

---

## ✨ Key Features Working

- ✅ **No OpenAI Required** - Pure manual entry
- ✅ **Multiple Invoices** - One opportunity → many invoices
- ✅ **Auto-Trigger** - Payment schedule on Closed Won
- ✅ **One-Click Invoice** - Creates in Sage + Salesforce
- ✅ **Payment Tracking** - Mark as received
- ✅ **Auto-Complete** - When all payments in
- ✅ **Overdue Detection** - Red flags for late payments
- ✅ **Real-Time Dashboard** - Refreshes every 30 sec

---

## 🐛 Troubleshooting

### **"Sage_Invoice__c not found" error**
→ You need to create the custom object in Salesforce (see Step 1 above)

### **Backend not responding**
```bash
# Check if running
curl http://localhost:8000/health

# If not, start it
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python3 simple_server.py
```

### **Frontend shows errors**
```bash
# Restart frontend
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm start
```

### **Payment Schedule modal doesn't open**
- Make sure you're changing stage FROM something else TO "Closed Won"
- If stage is already "Closed Won", change it to something else first, then back to "Closed Won"

### **Can't see invoices in Salesforce**
- Make sure you added "Sage Invoices" related list to Opportunity page layout
- Check the opportunity record → should be under Related tab

---

## 📚 Documentation

- **Full System Guide**: `GRANT_LIFECYCLE_SYSTEM_GUIDE.md`
- **Recent Changes**: `SYSTEM_UPDATES_SUMMARY.md`
- **Salesforce Object Details**: `salesforce_sage_invoice_object.md`

---

## 🎊 You're All Set!

**Total Setup Time:** ~10 minutes  
**What You Get:** Complete grant lifecycle automation from close to completion!

**Questions?** Check the full guide or browser console for detailed error messages.

**Enjoy your new automated grant management system! 🚀**

