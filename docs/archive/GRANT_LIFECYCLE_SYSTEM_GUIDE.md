# 🎯 Grant Lifecycle Management System - Complete Guide

## ✅ What's Been Built

You now have a **complete, production-ready grant lifecycle management system** that automates the entire process from opportunity close to payment completion.

---

## 🔄 The Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPPORTUNITY CLOSED WON                        │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PHASE 1: Payment Schedule Creation (Auto)       │           │
│  │  ✓ Natural language parsing with AI              │           │
│  │  ✓ Editable payment table                        │           │
│  │  ✓ Saves to Salesforce NPSP Payments             │           │
│  └──────────────────────────────────────────────────┘           │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PHASE 2: Finance Dashboard View                 │           │
│  │  ✓ "Awaiting Invoice" tab shows all Closed Won   │           │
│  │  ✓ Summary cards with key metrics                │           │
│  │  ✓ Real-time data refresh                        │           │
│  └──────────────────────────────────────────────────┘           │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PHASE 3: Invoice Creation in Sage Intacct       │           │
│  │  ✓ One-click invoice creation                    │           │
│  │  ✓ Auto-saves Sage Invoice ID to Salesforce     │           │
│  │  ✓ Moves opportunity to "Collecting / In Effect" │           │
│  └──────────────────────────────────────────────────┘           │
│                            ↓                                     │
│  ┌──────────────────────────────────────────────────┐           │
│  │  PHASE 4: Payment Tracking                       │           │
│  │  ✓ Mark payments as received                     │           │
│  │  ✓ Track overdue payments                        │           │
│  │  ✓ Payment progress visualization                │           │
│  │  ✓ AUTO-COMPLETE when all received ✨            │           │
│  └──────────────────────────────────────────────────┘           │
│                            ↓                                     │
│                 OPPORTUNITY CLOSED/COMPLETED ✅                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Features by Phase

### **PHASE 1: Payment Schedule Management**

**When:** Triggered automatically when opportunity stage → "Closed Won"

**Features:**
- 🤖 **AI-Powered Parsing**: Natural language input like "3 quarterly payments of $100k starting Jan 2026"
- ✏️ **Editable Table**: Modify dates, amounts, add/remove payments
- ✅ **Validation**: Ensures total matches opportunity amount
- 💾 **NPSP Integration**: Saves directly to Salesforce `npe01__OppPayment__c` records

**User Experience:**
1. Dev changes opportunity stage to "Closed Won" → Save
2. Modal auto-opens with natural language input
3. User types: "2 payments of $50k, June and December 2026"
4. AI generates payment schedule
5. User reviews/edits, clicks "Save Payment Schedule"
6. Payments saved to Salesforce ✅

---

### **PHASE 2: Finance Dashboard**

**Access:** Main navigation → "Finance Dashboard"

**Features:**
- 📊 **Summary Cards**: 
  - Awaiting Invoice count
  - Active Collections count
  - Total Outstanding $
  - Completed Grants count
- 🔔 **Alerts**: Warnings for overdue payments
- 📑 **Three Tabs**:
  1. **Awaiting Invoice**: Closed Won opps ready for invoicing
  2. **Active Collections**: Invoiced opps with payment tracking
  3. **Completed**: Fully paid grants

**User Experience:**
Finance team opens Finance Dashboard to see:
- 12 opportunities awaiting invoices
- 8 active collections ($450k outstanding)
- 3 overdue payments alert

---

### **PHASE 3: Invoice Creation in Sage Intacct**

**When:** From "Awaiting Invoice" tab in Finance Dashboard

**Features:**
- 🚀 **One-Click Creation**: Button → creates invoice in Sage Intacct
- 🔗 **Automatic Linking**: Saves Sage Invoice ID to Salesforce (`Sage_Invoice_ID__c`)
- 📈 **Stage Progression**: Auto-moves opportunity to "Collecting / In Effect"
- ✅ **Payment Schedule Integration**: Uses existing payment schedule

**User Experience:**
1. Finance team sees "Acme Foundation - $200k" in Awaiting Invoice tab
2. Clicks "Create Invoice" button
3. System:
   - Creates invoice in Sage Intacct
   - Saves Invoice ID to Salesforce
   - Moves opportunity to "Collecting / In Effect"
4. Toast: "Invoice #INV-12345 created successfully!"
5. Opportunity now appears in "Active Collections" tab

---

### **PHASE 4: Payment Tracking & Auto-Completion**

**When:** From "Active Collections" tab → Click "Track Payments"

**Features:**
- 💰 **Mark as Received**: One-click to record payment receipt
- 📅 **Overdue Detection**: Automatically flags late payments
- 📊 **Progress Visualization**: Shows X/Y payments received with progress bar
- 🎉 **Auto-Completion**: When all payments received → auto-moves to "Closed/Completed"

**User Experience:**
1. Finance team clicks "Track Payments" on Acme Foundation grant
2. Modal shows:
   - Payment 1: $100k - Due 06/01/2026 - **Overdue** 🔴
   - Payment 2: $100k - Due 12/01/2026 - Scheduled
3. Payment arrives! Click "Mark Received" on Payment 1
4. System updates payment record, progress shows 1/2
5. When Payment 2 marked received:
   - 🎉 **"All payments received! Opportunity marked as Completed"**
   - Opportunity auto-moves to "Closed / Completed" stage
   - Appears in "Completed" tab

---

## 🛠️ Technical Stack

### **Backend (FastAPI)**
- `simple_server.py` - All API endpoints
- Salesforce integration via `simple-salesforce`
- Sage Intacct integration via `SageIntacctService`
- OpenAI integration for natural language parsing

### **Frontend (React + TypeScript + Material-UI)**
- `PaymentScheduleModal.tsx` - Payment schedule creation
- `FinanceDashboard.tsx` - Finance dashboard with 3 tabs
- `PaymentTrackingModal.tsx` - Payment tracking UI
- `api.ts` - All API service methods

### **Salesforce Objects**
- `Opportunity` - Main grant records
- `npe01__OppPayment__c` - NPSP Payment records (payment schedule)
- Custom field: `Sage_Invoice_ID__c` - Links to Sage Intacct invoice

### **Sage Intacct**
- Invoice creation API
- Customer lookup
- Invoice record management

---

## 🚀 Getting Started

### **Prerequisites**

1. **OpenAI API Key** (for payment schedule parsing)
   ```bash
   # Add to /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/.env
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Sage Intacct Credentials** (already configured ✅)
   - Company ID: `pursuit`
   - User ID: `Pursuit Systems`
   - Sender ID: `pursuit`

3. **Salesforce Custom Field**
   - Create custom field on Opportunity: `Sage_Invoice_ID__c` (Text, 50 chars)

### **Running the System**

#### **Backend**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python3 simple_server.py
```
Backend runs on: http://localhost:8000

#### **Frontend**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm start
```
Frontend runs on: http://localhost:3000

---

## 👥 User Workflows

### **For Grant Writers / Development Team**

1. **Close the Grant**
   - Navigate to Opportunities page
   - Find your opportunity
   - Click Edit → Change Stage to "Closed Won" → Save
   - 🎯 **Payment Schedule Modal Auto-Opens**

2. **Create Payment Schedule**
   - Type natural language: "3 annual payments of $50k, starting March 2026"
   - Click "Generate" → AI parses and creates schedule
   - Review/edit dates and amounts
   - Click "Save Payment Schedule"
   - Done! ✅

### **For Finance Team**

1. **Daily Check**
   - Open "Finance Dashboard" from sidebar
   - Review summary cards:
     - How many awaiting invoices?
     - How much outstanding?
     - Any overdue payments?

2. **Create Invoices**
   - Go to "Awaiting Invoice" tab
   - For each opportunity:
     - Review payment schedule (shows count)
     - Click "Create Invoice"
     - Confirm → Invoice created in Sage Intacct ✅
     - Automatically moves to "Active Collections"

3. **Track Payments**
   - Go to "Active Collections" tab
   - See opportunities with:
     - Paid vs Outstanding amounts
     - Payment progress (e.g., 2/4 payments)
     - Overdue warnings 🔴
   - Click "Track Payments" on any opportunity
   - When payment arrives:
     - Click "Mark Received"
     - System records payment date
     - Progress updates automatically
   - When all payments received:
     - 🎉 Opportunity auto-completes!
     - Moves to "Completed" tab

4. **Review Completed**
   - "Completed" tab shows all fully-paid grants
   - Review history, invoice IDs, amounts

---

## 🔧 API Endpoints Reference

### **Payment Schedule**
- `POST /api/opportunities/{id}/payment-schedule/parse` - Parse natural language
- `GET /api/opportunities/{id}/payment-schedule` - Get payments
- `POST /api/opportunities/{id}/payment-schedule` - Create schedule
- `PUT /api/opportunities/{id}/payment-schedule/{payment_id}` - Update payment
- `DELETE /api/opportunities/{id}/payment-schedule/{payment_id}` - Delete payment

### **Finance Dashboard**
- `GET /api/finance/awaiting-invoices` - Get Closed Won opps
- `GET /api/finance/active-collections` - Get Collecting/In Effect opps
- `GET /api/finance/completed` - Get Closed/Completed opps

### **Sage Intacct**
- `POST /api/finance/create-invoice` - Create invoice in Sage

---

## 🎯 Key Automations

| Trigger | Automatic Action | Result |
|---------|-----------------|--------|
| Stage → "Closed Won" | Payment Schedule Modal Opens | User creates schedule |
| Payment Schedule Created | Saves to Salesforce NPSP | `npe01__OppPayment__c` records |
| "Create Invoice" clicked | Creates in Sage Intacct | Invoice ID saved, stage → "Collecting/In Effect" |
| All payments marked received | Stage → "Closed/Completed" | Opportunity moves to Completed tab |

---

## 📊 Data Flow

```
Salesforce Opportunity (Closed Won)
    ↓
Payment Schedule (NPSP Payments) → npe01__OppPayment__c
    ↓
Sage Intacct Invoice → RECORDNO saved to Sage_Invoice_ID__c
    ↓
Payment Tracking → Updates npe01__Paid__c
    ↓
All Paid? → Stage = "Closed / Completed"
```

---

## 🏆 What This Solves

### **Before:**
- ❌ Manual payment schedule tracking in spreadsheets
- ❌ No visibility into which grants need invoices
- ❌ Finance team unaware of payment schedules
- ❌ No connection between Salesforce and Sage Intacct
- ❌ Manual stage updates when payments complete
- ❌ No overdue payment tracking

### **After:**
- ✅ AI-powered payment schedule creation at close
- ✅ Finance Dashboard shows everything at a glance
- ✅ One-click invoice creation in Sage Intacct
- ✅ Automatic linking between systems
- ✅ Auto-completion when all payments received
- ✅ Overdue payment alerts
- ✅ Full audit trail in Salesforce

---

## 🚦 Next Steps

1. **Test the System**
   - Create a test opportunity
   - Move it through the entire lifecycle
   - Verify each phase works

2. **Train Your Team**
   - Grant writers: How to create payment schedules
   - Finance team: How to use Finance Dashboard

3. **Create Salesforce Field**
   - Add `Sage_Invoice_ID__c` custom field to Opportunity object

4. **Configure OpenAI**
   - Add your OpenAI API key to `.env` file

5. **Go Live!** 🎉

---

## 💡 Pro Tips

- **Payment Schedule**: The AI is smart! Try "quarterly" or "annually" or specific dates
- **Validation**: System prevents saving if payment total doesn't match opportunity amount
- **Overdue Detection**: Automatically checks scheduled dates vs today
- **Auto-Refresh**: Dashboard refreshes every 30 seconds
- **Toast Notifications**: Get instant feedback on all actions

---

## 🐛 Troubleshooting

### **Payment Schedule Modal Not Opening**
- Ensure opportunity stage changes from non-"Closed Won" to "Closed Won"
- Check browser console for errors

### **Invoice Creation Fails**
- Verify Sage Intacct credentials in `.env`
- Check that payment schedule exists
- Confirm Sage customer exists

### **Payments Not Updating**
- Verify opportunity has payment records in Salesforce
- Check NPSP package is installed

---

## 📞 Support

Built by AI Assistant 🤖
Need help? Check the browser console for detailed error messages.

---

**🎉 CONGRATULATIONS! You now have a fully automated grant lifecycle management system!** 🎉

