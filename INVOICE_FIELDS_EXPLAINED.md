# 📋 Invoice Fields - Complete Reference

## ✅ **All Fields in Invoice Creation Form**

### **Auto-Populated (from Salesforce)**
These are pre-filled but can be edited:

1. **Customer** - From `Account.Name`
2. **Opportunity** - From `Opportunity.Name`
3. **Payment Amount** - From `npe01__Payment_Amount__c`
4. **Due Date** - From `npe01__Scheduled_Date__c`
5. **Description** - Auto-generated: "{Opportunity Name} - Payment"

---

### **Editable by Finance Team**

#### **Invoice Header:**
| Field | Default | Options | Required | Notes |
|-------|---------|---------|----------|-------|
| **Invoice Date** | Today | Any date | ✅ Yes | When invoice is created |
| **Due Date** | From payment schedule | Any date | ✅ Yes | Payment deadline |
| **Payment Terms** | Net 30 | Net 30, Net 60, Net 90, Due on Receipt | ✅ Yes | Standard terms |
| **Reference Number** | Empty | Free text | ❌ No | PO#, Grant#, Contract# |

#### **Line Item:**
| Field | Default | Options | Required | Notes |
|-------|---------|---------|----------|-------|
| **Description** | "{Opp} - Payment" | Free text | ✅ Yes | What invoice is for |
| **Amount** | From payment | Any number | ✅ Yes | Invoice amount |
| **GL Account** | 4010 | See list below | ✅ Yes | Revenue account |

#### **Sage Dimensions (Required):**
| Field | Default | Options | Required | Notes |
|-------|---------|---------|----------|-------|
| **Location** | PURSUIT | See list below | ✅ Yes | Physical location |
| **Department** | 204 | See list below | ✅ Yes | Cost center |
| **Class** | 10 | See list below | ✅ Yes | Program/category |

#### **Optional:**
| Field | Default | Options | Required | Notes |
|-------|---------|---------|----------|-------|
| **Internal Memo** | Empty | Free text | ❌ No | Not visible to customer |

---

## 🏢 **GL Accounts (Revenue)**

These map to your Sage Intacct chart of accounts:

| Code | Description | When to Use |
|------|-------------|-------------|
| **4010** | Individual Contributions | Personal donations |
| **4020** | Foundation Grants | Grants from foundations |
| **4030** | Corporate Grants | Corporate sponsorships |
| **4040** | Government Grants | Federal/state/local grants |

**Action Needed:** Verify these match your actual Sage GL accounts!

---

## 📍 **Sage Intacct Dimensions**

### **Locations**
Currently only:
- **PURSUIT** - Main office

**Action Needed:** Add more if you have multiple locations in Sage.

### **Departments**
Currently set to:
- **204** - Philanthropy (default)
- **201** - Programs
- **202** - Operations  
- **203** - Development

**Action Needed:** Verify department codes match your Sage setup!

### **Classes**
Currently set to:
- **10** - General Operating (default)
- **20** - Programs
- **30** - Restricted

**Action Needed:** Verify class codes match your Sage setup!

---

## 🚨 **Current Assumptions**

### **What We're Defaulting:**
1. **Location = 'PURSUIT'** - Assuming single location
2. **Department = '204'** - Assuming philanthropy/development team
3. **Class = '10'** - Assuming general operating funds

### **Why These Matter:**
- Sage Intacct **requires** these dimensions for GL account 4010
- Without correct values, invoice creation will fail
- These determine how revenue is categorized in your financial reports

---

## ✅ **What You Should Verify**

### **1. Check Your Sage GL Accounts:**
```
Sage Intacct > General Ledger > Chart of Accounts
Look for revenue accounts (4000 series)
```

### **2. Check Your Departments:**
```
Sage Intacct > Company > Departments
Get list of department IDs and names
```

### **3. Check Your Classes:**
```
Sage Intacct > Company > Classes  
Get list of class IDs and names
```

### **4. Check Your Locations:**
```
Sage Intacct > Company > Locations
Get list of location IDs
```

---

## 📝 **How to Update the Dropdowns**

Once you have the correct codes from Sage, update these constants in:
`financial_forecasting/frontend/src/components/CreateInvoiceModal.tsx`

```typescript
const GL_ACCOUNTS = [
  { value: 'YOUR_CODE', label: 'YOUR_CODE - Your Description' },
  // Add your actual GL accounts
];

const DEPARTMENTS = [
  { value: 'YOUR_CODE', label: 'YOUR_CODE - Your Department' },
  // Add your actual departments
];

const CLASSES = [
  { value: 'YOUR_CODE', label: 'YOUR_CODE - Your Class' },
  // Add your actual classes
];

const LOCATIONS = [
  { value: 'YOUR_CODE', label: 'Your Location Name' },
  // Add your actual locations
];
```

---

## 🎯 **Additional Fields to Consider**

### **Optional Fields We Could Add:**

1. **Project** - For project/grant tracking
   - Useful if you track grants as projects in Sage
   
2. **Customer Contact** - Specific contact person
   - For multi-contact accounts
   
3. **Billing Address** - If different from account default
   - For grants sent to specific departments
   
4. **Custom Fields** - Any custom dimensions you use
   - Check Sage for custom fields on invoices

### **Do You Need Any of These?**
Let me know and I can add them to the form!

---

## 💡 **Summary**

### **Currently Captured:**
✅ Customer
✅ Invoice & Due Dates  
✅ Payment Terms
✅ Reference Number
✅ Description & Amount
✅ GL Account
✅ Location, Department, Class
✅ Internal Memo

### **Currently Assumed (Need Verification):**
⚠️ GL Account codes (4010, 4020, etc.)
⚠️ Department codes (201, 202, 203, 204)
⚠️ Class codes (10, 20, 30)
⚠️ Location codes (PURSUIT)

### **Next Steps:**
1. Verify codes against your Sage instance
2. Update dropdowns with correct values
3. Add any additional fields you need
4. Test invoice creation with real Sage API

---

**Questions to Answer:**
1. Are the GL account codes correct?
2. Are department codes correct?
3. Are class codes correct?
4. Do you have multiple locations?
5. Do you need project tracking?
6. Do you use any custom dimensions?

