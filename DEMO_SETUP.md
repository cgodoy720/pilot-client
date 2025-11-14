# 🚀 Demo Setup Guide for Tomorrow

**Complete this checklist today to ensure smooth demo tomorrow!**

---

## ✅ **Pre-Demo Checklist (Do Today)**

### **1. Test Sage Intacct Integration** ⭐ **CRITICAL**

```bash
python test_sage_integration.py
```

**What it tests:**
- ✅ Sage credentials work
- ✅ Authentication succeeds
- ✅ Can create invoices
- ✅ Customer exists in Sage

**Expected output:**
```
✅ SUCCESS! Sage Intacct integration is working
```

**If it fails:**
1. Check `.env` file has all Sage credentials
2. Verify Sage Web Services subscription is active
3. Create "Acme Foundation" customer in Sage
4. Contact Sage admin if still failing

---

### **2. Add Invoice__c Field to Salesforce** ⭐ **CRITICAL**

```bash
python add_invoice_field_to_payments.py
```

**What it does:**
- Creates `Invoice__c` lookup field on `npe01__OppPayment__c`
- Links Salesforce payments to Sage invoices
- Required for the system to work

**Expected output:**
```
✅ SUCCESS! Invoice__c field is ready
```

**If it fails:**
- Follow manual steps in the output
- Takes 2 minutes in Salesforce UI

---

### **3. Verify Salesforce Objects Exist**

**Check these objects exist:**
- [ ] `Sage_Invoice__c` - Custom object for tracking invoices
- [ ] `npe01__OppPayment__c` - NPSP Payment object
- [ ] `Opportunity` - Standard object

**To check:**
```bash
# Or log into Salesforce → Setup → Object Manager
```

**If `Sage_Invoice__c` doesn't exist:**
```bash
python create_sage_invoice_object_oauth.py
```

---

### **4. Create Test Data in Salesforce**

**Option A: Use existing opportunity**
- Find a test opportunity in "Closed Won" stage
- Amount: $50,000 or similar
- Account: Must match a customer in Sage

**Option B: Create new opportunity**
1. Go to Salesforce
2. Create Account: "Acme Foundation"
3. Create Opportunity:
   - Name: "Acme Foundation 2025 General Support"
   - Amount: $50,000
   - Stage: "Prospecting" (we'll change to Closed Won in demo)
   - Close Date: Today

---

### **5. Verify Backend & Frontend Work**

**Terminal 1 - Start Backend:**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting
python simple_server.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Start Frontend:**
```bash
cd /Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/frontend
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

**Test it:**
1. Open http://localhost:3000
2. Click "Finance Dashboard"
3. Should see "Awaiting Invoice", "Active Collections", "Completed" tabs
4. If empty, that's OK - means no data yet

---

### **6. Create Customer in Sage Intacct** ⭐ **CRITICAL**

**Steps:**
1. Log into Sage Intacct
2. Go to: Accounts Receivable → Customers
3. Click "+" to create new customer
4. Customer ID: **"Acme Foundation"** (exact match!)
5. Name: Acme Foundation
6. Save

**Why critical:** Invoice creation will fail if customer doesn't exist

---

## 📋 **Day-Of Demo Checklist (Tomorrow Morning)**

### **30 Minutes Before Demo:**

**1. Start Services:**
- [ ] Terminal 1: Backend running (`python simple_server.py`)
- [ ] Terminal 2: Frontend running (`npm start`)
- [ ] Browser: http://localhost:3000 open to Finance Dashboard
- [ ] Browser tab 2: Salesforce open
- [ ] Browser tab 3: Sage Intacct open (to show invoice after creation)

**2. Verify Test Data:**
- [ ] Test opportunity exists and is ready
- [ ] Acme Foundation customer exists in Sage
- [ ] No existing invoices for test opportunity (clean slate)

**3. Do a Quick Dry Run:**
- [ ] Create opportunity (or have one ready)
- [ ] Change to Closed Won
- [ ] Create payment schedule
- [ ] Create invoice
- [ ] Mark payment received
- [ ] Mark complete
- [ ] **THEN DELETE EVERYTHING** (fresh for actual demo)

**4. Have Backup Plan:**
- [ ] Screen recording of successful test in case live demo fails
- [ ] DEMO_SCRIPT.md open for reference
- [ ] Error scenarios prepared (see demo script)

---

## 🔧 **Environment Variables Needed**

**In `/Users/jacquelinereverand/pursuit-mcp-client/financial_forecasting/.env`:**

```bash
# Salesforce
SALESFORCE_USERNAME=your_username@pursuit.org
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_token
SALESFORCE_DOMAIN=login  # or 'test' for sandbox

# Sage Intacct
SAGE_COMPANY_ID=your_company_id
SAGE_USER_ID=your_user_id
SAGE_USER_PASSWORD=your_password
SAGE_SENDER_ID=your_sender_id
SAGE_SENDER_PASSWORD=your_sender_password

# JWT for sessions
JWT_SECRET_KEY=your_random_secret_key
```

---

## 🚨 **Troubleshooting Guide**

### **Problem: "Customer not found in Sage"**
**Solution:** Create "Acme Foundation" customer in Sage Intacct

### **Problem: "Invoice already exists"**
**Solution:** This is duplicate detection working! Delete existing invoice or use different opportunity

### **Problem: "Sage_Invoice__c object not found"**
**Solution:** Run `python create_sage_invoice_object_oauth.py`

### **Problem: "Invoice__c field not found"**
**Solution:** Run `python add_invoice_field_to_payments.py`

### **Problem: Backend won't start**
**Solution:**
```bash
cd financial_forecasting
pip install -r requirements.txt
python simple_server.py
```

### **Problem: Frontend won't start**
**Solution:**
```bash
cd financial_forecasting/frontend
npm install
npm start
```

### **Problem: "Payment schedule total doesn't match"**
**Solution:** This is validation working! Adjust payment amounts to equal opportunity amount

---

## 📊 **Demo Flow Reminder**

**The 7-Step Demo:**
1. Create Opportunity ($50k)
2. Mark as Closed Won
3. Create Payment Schedule
4. Create Invoice in Sage
5. Show Active Collections
6. Mark Payment Received
7. Mark Complete

**Time:** 8 minutes + 2 minutes Q&A

---

## 🎯 **Success Criteria**

**Demo is successful if:**
- ✅ Invoice created in Sage (real API call)
- ✅ No errors during flow
- ✅ Duplicate detection works (if tested)
- ✅ Finance team understands the value
- ✅ You can explain "promise vs fulfillment" clearly

**Demo is STILL successful even if:**
- ⚠️  You encounter an error (use it as teaching moment)
- ⚠️  Need to reference the demo script
- ⚠️  Takes longer than 10 minutes
- ⚠️  Phase 2 questions come up (that's good!)

---

## 📞 **Emergency Contacts**

**If something breaks:**
1. Check this troubleshooting guide first
2. Check DEMO_SCRIPT.md for error scenarios
3. Have backup screen recording ready
4. Explain it's "Phase 1" and we're iterating

**Remember:** The goal is feedback, not perfection!

---

## ✅ **Final Check (Run This Now)**

```bash
# 1. Test Sage
python test_sage_integration.py

# 2. Add Invoice field
python add_invoice_field_to_payments.py

# 3. Start backend (leave running)
cd financial_forecasting && python simple_server.py &

# 4. Start frontend (new terminal)
cd financial_forecasting/frontend && npm start
```

**All green?** ✅ You're ready for tomorrow!

**Any red?** ❌ Fix it now before demo!

---

**Good luck! You've got this!** 🚀

**Key message for demo:**
> "This is Phase 1 - simple, safe, and real. We're proving the concept and getting your feedback to build Phase 2 right."

**Remember:** The discovery questionnaire responses will determine what we build next. This demo is just the start!

