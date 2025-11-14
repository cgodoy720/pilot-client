# ✅ **ACTUAL Sage Intacct Dimensions Found**

## 📊 **GL Accounts (Revenue)**

From actual invoice line items:
- **4010** - Individual contributions  
- **5010** - Pursuit Bond ISA

## 📍 **Locations**

- **PURSUIT** - Pursuit Transformation Company

## 🏢 **Departments**

- **204** - Management & Board
- **304** - Pursuit Bond

## 📂 **Classes**

- **22** - PURPOSE RESTRICTION (from earlier query)
- *None found in line items sampled*

---

## ⚠️ **API Limitations**

The Sage API `readByQuery` is only returning 1 invoice at a time despite requesting 200, which suggests:
1. Permissions limiting results
2. Query syntax needs adjustment
3. Need to use pagination with result IDs

## 💡 **Recommendation for Invoice Form**

### **Use These Values:**

```typescript
GL_ACCOUNTS = [
  { value: '4010', label: '4010 - Individual Contributions' },
  { value: '5010', label: '5010 - Pursuit Bond ISA' },
  // Add more as finance team discovers them
];

LOCATIONS = [
  { value: 'PURSUIT', label: 'Pursuit Transformation Company' },
];

DEPARTMENTS = [
  { value: '204', label: '204 - Management & Board' },
  { value: '304', label: '304 - Pursuit Bond' },
];

CLASSES = [
  { value: '22', label: '22 - PURPOSE RESTRICTION' },
];
```

### **Defaults for Grant Invoices:**
- **GL Account:** 4010 (Individual Contributions)
- **Location:** PURSUIT  
- **Department:** 204 (Management & Board)
- **Class:** 22 (PURPOSE RESTRICTION)

---

## 🎯 **Next Steps**

1. **Update the invoice form** with these actual values
2. **Make fields editable** so finance can adjust if needed
3. **Add "Other" option** or free-text for GL accounts not in the list
4. **Ask finance team** what other GL accounts they commonly use

---

## 📝 **How We Found These**

- Queried actual invoice line items from `ARINVOICEITEM` object
- Extracted `ACCOUNTNO`, `DEPARTMENTID`, `LOCATIONID`, `CLASSID` from real data
- These are values actually being used in your Sage instance

Would you like me to update the invoice form with these values now?

