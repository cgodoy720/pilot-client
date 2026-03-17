# Where Invoice-Opportunity Links Are Saved

## Overview

The matching UI saves links in **THREE locations** to ensure data integrity and accessibility:

---

## 1. Local JSON File (Immediate Storage)

**File**: `invoice_opportunity_matches.json`

**Purpose**: Fast, local storage during matching process

**Structure**:
```json
{
  "19785": {
    "opportunity_id": "0061234567890ABC",
    "confidence": "high",
    "notes": "Robin Hood 2024 Grant",
    "matched_at": "2025-11-12T15:30:00",
    "invoice_data": {
      "customer_name": "Robin Hood Foundation",
      "invoice_amount": "280000",
      "invoice_date": "05/13/2024"
    }
  },
  "30302": {
    "opportunity_id": "0061234567890XYZ",
    "confidence": "high",
    "notes": "Mizuho 2025 Grant",
    "matched_at": "2025-11-12T15:35:00",
    "invoice_data": {
      "customer_name": "Mizuho USA Foundation",
      "invoice_amount": "450000",
      "invoice_date": "11/07/2025"
    }
  }
}
```

**Pros**:
- ✅ Fast to read/write
- ✅ Easy to edit manually if needed
- ✅ Version controllable (can commit to git)
- ✅ Works offline

**Cons**:
- ❌ Only accessible locally
- ❌ Not automatically synced to cloud
- ❌ Need to manually distribute to team

---

## 2. Salesforce Custom Fields (Source of Truth)

**Location**: Opportunity object in Salesforce

**Custom Fields to Create**:
```
Sage_Invoice_ID__c (Text, External ID, Unique)
├─ Stores: Sage Intacct invoice record number
├─ Example: "19785"
└─ Use: Link back to invoice

Sage_Customer_ID__c (Text)
├─ Stores: Sage Intacct customer ID  
├─ Example: "C1268"
└─ Use: Reference to customer record

Invoice_Created__c (Checkbox)
├─ Stores: Whether invoice exists
└─ Use: Quick filter for invoiced opps

Invoice_Date__c (Date)
├─ Stores: Date invoice was created
└─ Use: Track timing from close to invoice

Invoice_Amount__c (Currency)
├─ Stores: Invoice total
└─ Use: Verify matches opportunity amount

Amount_Paid__c (Currency)
├─ Stores: Total payments received
└─ Use: Track how much has been collected

Amount_Outstanding__c (Currency, Formula)
├─ Formula: Invoice_Amount__c - Amount_Paid__c
└─ Use: Show remaining balance

Last_Payment_Date__c (Date)
├─ Stores: Most recent payment date
└─ Use: Track collection timing

Payment_Status__c (Picklist)
├─ Values:
│   • Not Invoiced
│   • Invoiced
│   • Partially Paid
│   • Fully Paid
│   • Overdue
└─ Use: Quick status at a glance
```

**How Data Gets There**:
1. Matching UI creates the link locally
2. Sync script reads `invoice_opportunity_matches.json`
3. For each match, updates Salesforce via API:
   ```python
   sf.update_opportunity(opportunity_id, {
       'Sage_Invoice_ID__c': '19785',
       'Sage_Customer_ID__c': 'C1268',
       'Invoice_Created__c': True,
       'Invoice_Date__c': '2024-05-13',
       'Invoice_Amount__c': 280000
   })
   ```

**Pros**:
- ✅ Centralized source of truth
- ✅ Accessible to entire team
- ✅ Integrated with existing workflows
- ✅ Can build reports and dashboards
- ✅ Mobile accessible

**Cons**:
- ⚠️ Requires Salesforce admin to create fields
- ⚠️ Need API access to update

---

## 3. Sage Intacct Custom Field (Optional, Bidirectional Link)

**Location**: Invoice object in Sage Intacct

**Custom Field**:
```
SFDC_OPPORTUNITY_ID (Text, 18 characters)
├─ Stores: Salesforce opportunity ID
├─ Example: "0061234567890ABC"
└─ Use: Bookkeeper can see which opp invoice belongs to
```

**How Data Gets There**:
```python
# When creating/updating invoice
sage.update_invoice(invoice_id, {
    'custom_fields': {
        'SFDC_OPPORTUNITY_ID': '0061234567890ABC'
    }
})
```

**Pros**:
- ✅ Bookkeeper can see link in Sage
- ✅ Bidirectional linking (both systems know about each other)
- ✅ Helps prevent duplicate invoices

**Cons**:
- ⚠️ Requires Sage Intacct admin permissions
- ⚠️ Custom field setup may need Sage support
- ⚠️ Not all Sage Intacct versions support custom fields easily

---

## Recommended Approach

### Phase 1: MVP (Quick Start)
```
1. Use matching UI → saves to JSON file
2. Manual sync to Salesforce (export CSV, import via Data Loader)
3. OR: Python script reads JSON and updates Salesforce via API
```

### Phase 2: Automated (Production)
```
1. Matching UI → saves to JSON
2. Automated daily sync → updates Salesforce
3. Python backend → updates both systems
4. Dashboard → reads from Salesforce
```

### Phase 3: Real-Time (Future)
```
1. Webhook in Sage Intacct → triggers when invoice created
2. Auto-match algorithm → finds Salesforce opportunity
3. Immediate update → both systems linked in real-time
4. Notification → bookkeeper confirms match
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCHING UI (Web Interface)              │
│  • Review invoices                                          │
│  • Enter Salesforce Opportunity IDs                         │
│  • Add notes and confidence scores                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ Saves to ↓
           ┌───────────▼───────────┐
           │ invoice_opportunity_  │
           │    matches.json       │
           │  (Local JSON file)    │
           └───────────┬───────────┘
                       │ Read by ↓
           ┌───────────▼──────────────────────┐
           │    SYNC SCRIPT (Python)          │
           │  • Reads JSON file               │
           │  • Connects to Salesforce API    │
           │  • Updates opportunity fields    │
           │  • (Optional) Updates Sage       │
           └───────────┬──────────────────────┘
                       │ Writes to ↓
         ┌─────────────▼─────────────────────┐
         │      SALESFORCE                   │
         │  Opportunity.Sage_Invoice_ID__c   │
         │  Opportunity.Invoice_Amount__c    │
         │  Opportunity.Amount_Paid__c       │
         │  (etc - all custom fields)        │
         └─────────────┬─────────────────────┘
                       │ Displayed in ↓
         ┌─────────────▼─────────────────────┐
         │        DASHBOARD                  │
         │  • Pipeline → Invoice → Payment   │
         │  • Cash flow forecast             │
         │  • Payment status                 │
         └───────────────────────────────────┘
```

---

## File Locations Summary

| What | Where | File/Field Name |
|------|-------|----------------|
| **Matches (Local)** | Your computer | `invoice_opportunity_matches.json` |
| **Export CSV** | Your computer | `matched_invoices_YYYYMMDD_HHMMSS.csv` |
| **Invoice Data** | Your computer | `all_grant_invoices.csv` |
| **Link in SF** | Salesforce | `Opportunity.Sage_Invoice_ID__c` |
| **Payment Data** | Salesforce | `Opportunity.Amount_Paid__c` |
| **Link in Sage** | Sage Intacct | `ARINVOICE.SFDC_OPPORTUNITY_ID` (optional) |

---

## How to Access the Data

### From Matching UI:
```bash
# View saved matches
cat invoice_opportunity_matches.json

# Export to CSV
# Click "Export Matches" button in UI
# OR run: curl http://localhost:5000/api/export_matches
```

### From Salesforce:
```sql
-- SOQL query to see linked opportunities
SELECT Id, Name, Amount, Sage_Invoice_ID__c, 
       Invoice_Amount__c, Amount_Paid__c, Payment_Status__c
FROM Opportunity
WHERE Sage_Invoice_ID__c != null
```

### From Python:
```python
import json

# Load matches
with open('invoice_opportunity_matches.json') as f:
    matches = json.load(f)

# Find a specific invoice
invoice_19785 = matches.get('19785')
print(f"Opportunity ID: {invoice_19785['opportunity_id']}")
```

---

## Backup & Version Control

### Recommended Backup Strategy:

1. **Git**: Commit JSON file to repository
   ```bash
   git add invoice_opportunity_matches.json
   git commit -m "Updated invoice matches"
   git push
   ```

2. **Salesforce**: Data is automatically backed up by Salesforce
   - Weekly exports via Data Loader
   - Opportunity history tracks changes

3. **Export**: Regular CSV exports as snapshots
   ```bash
   # Keep dated exports
   cp matched_invoices_20251112.csv backups/
   ```

---

## Security & Access Control

### Who Can Access What:

| Role | Local JSON | Salesforce Fields | Sage Intacct |
|------|-----------|-------------------|--------------|
| **You** | ✅ Read/Write | ✅ Read/Write (with perms) | ✅ Read |
| **Bookkeeper** | ❌ No access | ✅ Read only | ✅ Read/Write |
| **Partnerships** | ❌ No access | ✅ Read/Write | ❌ No access |
| **CEO** | ❌ No access | ✅ Read only (reports) | ❌ No access |
| **Dashboard** | ❌ No access | ✅ Read only (API) | ✅ Read only (API) |

### Best Practices:
- 🔒 Never commit `.env` file with credentials
- 🔒 Use Salesforce API user with minimal permissions
- 🔒 Store API keys in environment variables
- 🔒 Regular backups of JSON file
- 🔒 Audit log of who changed what

---

## Next Steps

1. **Use Matching UI** to create links
2. **Review** `invoice_opportunity_matches.json`
3. **Create Salesforce fields** (one-time setup)
4. **Run sync script** to push matches to Salesforce
5. **Verify** in Salesforce that fields are populated
6. **Build dashboard** to display linked data

The matching UI is ready to use right now! The Salesforce integration will come after you create the custom fields.

