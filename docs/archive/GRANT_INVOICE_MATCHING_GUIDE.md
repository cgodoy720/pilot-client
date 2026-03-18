# 🔗 Grant Invoice Matching - Complete Guide

## Overview
This guide explains how to match Sage Intacct grant invoices to Salesforce opportunities and sync them to create `Grant_Invoice__c` records.

---

## Architecture

```
┌─────────────────────┐
│   Sage Intacct      │
│   Grant Invoices    │──┐
│   (11,300 invoices) │  │
└─────────────────────┘  │
                         │  1. Export
                         ▼
┌──────────────────────────────────────┐
│  nonprofit_grant_invoices.csv        │
│  • Filtered: No Pursuit Bond students│
│  • Filtered: No PBC, nonprofit only  │
│  • Module: 4.AR (grants/philanthropy)│
└──────────────────────────────────────┘
                         │
                         │  2. Match via UI
                         ▼
┌──────────────────────────────────────┐
│  Matching UI (matching_ui.py)       │
│  • Search invoices                   │
│  • Enter Salesforce Opportunity IDs  │
│  • Set confidence level              │
│  • Save matches                      │
└──────────────────────────────────────┘
                         │
                         │  3. Saves to
                         ▼
┌──────────────────────────────────────┐
│  invoice_opportunity_matches.json    │
│  {                                   │
│    "815": {                          │
│      "opportunity_id": "006...",     │
│      "confidence": "Confirmed",      │
│      "notes": "Q1 payment"           │
│    }                                 │
│  }                                   │
└──────────────────────────────────────┘
                         │
                         │  4. Sync to Salesforce
                         ▼
┌──────────────────────────────────────┐
│  Salesforce: Grant_Invoice__c       │
│  • Lookup to Opportunity             │
│  • Sage invoice details              │
│  • Payment tracking                  │
│  • Rollup summaries on Opportunity   │
└──────────────────────────────────────┘
```

---

## Step-by-Step Workflow

### Step 1: Export Grant Invoices ✅ (Already Done!)

The invoices have been exported to `nonprofit_grant_invoices.csv`:
- **11,300 nonprofit grant invoices**
- **Filtered out:** Pursuit Bond students (CUSTTYPE != 'Pursuit Bond')
- **Filtered out:** PBC entity (MEGAENTITYID != 'PBC')
- **Included only:** MODULEKEY = '4.AR' (Accounts Receivable / Philanthropy)

```bash
# To re-export if needed:
python3 export_nonprofit_grants_final.py
```

---

### Step 2: Create Salesforce Object

Before matching, create the `Grant_Invoice__c` custom object in Salesforce:

#### Option A: Manual Setup (Recommended for first time)
1. Go to **Setup → Object Manager → Create → Custom Object**
2. Follow the instructions in `salesforce_grant_invoice_object.md`
3. Create all custom fields listed in the guide
4. Add the "Grant Invoices" related list to the Opportunity page layout

#### Option B: API/Metadata Deployment
```bash
# Coming soon - automated deployment script
```

---

### Step 3: Match Invoices to Opportunities

Start the matching UI:

```bash
python3 matching_ui.py
```

Then open your browser to: **http://localhost:5000**

#### In the UI:
1. **Search** for invoices by customer name or amount
2. **Filter** to show only unmatched invoices
3. **Enter Salesforce Opportunity ID** in the text field
4. **Select confidence level:**
   - **Confirmed**: You're 100% sure this is correct
   - **High**: Very likely match (e.g., matching customer name and amount)
   - **Medium**: Probable match but needs review
   - **Low**: Uncertain, flagged for manual review
5. **Click "Save"** to store the match
6. **Repeat** for all grant invoices

#### Tips:
- Match large/recent grants first (biggest impact)
- Use Salesforce reports to get Opportunity IDs
- You can match multiple invoices to the same opportunity (payment schedules)
- Matches are saved incrementally to `invoice_opportunity_matches.json`

---

### Step 4: Sync to Salesforce

Once you've matched invoices, sync them to Salesforce:

```bash
python3 sync_to_salesforce.py
```

This script will:
1. Read `invoice_opportunity_matches.json`
2. Load invoice details from `nonprofit_grant_invoices.csv`
3. Create/update `Grant_Invoice__c` records in Salesforce
4. Link each invoice to its matched Opportunity

The sync uses **upsert** (create or update) on the `Sage_Invoice_ID__c` field, so:
- ✅ New matches create new records
- ✅ Updated matches update existing records
- ✅ No duplicates

---

## Data Flow: Invoice → Opportunity → Tracking

After syncing, here's what you get in Salesforce:

### On the Opportunity Record:
**Related List: Grant Invoices**

| Invoice # | Customer | Amount | Amount Paid | Amount Due | Status | Invoice Date |
|-----------|----------|--------|-------------|------------|--------|--------------|
| INV-2024-001 | Google LLC | $75,000 | $75,000 | $0 | Paid | 01/15/2024 |
| INV-2024-Q2 | Google LLC | $25,000 | $25,000 | $0 | Paid | 04/15/2024 |
| INV-2024-Q3 | Google LLC | $25,000 | $0 | $25,000 | Posted | 07/15/2024 |

**Rollup Fields** (if configured):
- Total Invoiced: $125,000
- Total Paid: $100,000
- Total Outstanding: $25,000

---

## Salesforce Integration Benefits

### 1. Unified View
- See grant opportunity AND financial status in one place
- Track invoicing and payment progress
- Identify overdue payments

### 2. Reporting
- Create reports on invoice aging
- Track payment velocity by funder
- Forecast cash flow based on outstanding invoices

### 3. Automation (Future)
- Auto-create invoices from opportunities
- Alert on overdue payments
- Update opportunity stages based on payment status

---

## File Reference

| File | Purpose |
|------|---------|
| `nonprofit_grant_invoices.csv` | Exported grant invoices from Sage Intacct |
| `matching_ui.py` | Flask web app for matching |
| `templates/matching.html` | UI template |
| `invoice_opportunity_matches.json` | Saved matches (local backup) |
| `sync_to_salesforce.py` | Syncs matches to Salesforce |
| `salesforce_grant_invoice_object.md` | Salesforce object definition |
| `export_nonprofit_grants_final.py` | Export script (re-run if needed) |

---

## FAQ

### Q: Can one opportunity have multiple invoices?
**A:** Yes! This is common for payment schedules. Match each invoice separately to the same opportunity.

### Q: What if I make a mistake?
**A:** No problem! Just:
1. Click "Delete" in the UI to remove the match
2. Enter the correct Opportunity ID
3. Click "Save" again
4. Re-run `sync_to_salesforce.py`

### Q: Do I need to match all 11,300 invoices?
**A:** No. Start with:
- Recent grants (last 2 years)
- Large grants (> $10K)
- Active opportunities (not closed)

You can match the rest over time or in batches.

### Q: How do I update invoice amounts if they change in Sage?
**A:** Re-run:
1. `export_nonprofit_grants_final.py` (gets latest data)
2. `sync_to_salesforce.py` (updates Salesforce)

The sync will update existing `Grant_Invoice__c` records with new amounts.

### Q: What about payments?
**A:** Payments in Sage Intacct are automatically linked to invoices. Once you've linked an invoice to an opportunity, you can query Sage to get all payments for that invoice.

Future enhancement: Add a `Grant_Payment__c` object to track individual payments.

---

## Next Steps

1. ✅ **Create `Grant_Invoice__c` object in Salesforce**
2. ✅ **Start matching UI**: `python3 matching_ui.py`
3. ⏳ **Match your first 10 grants** (get comfortable with the process)
4. ⏳ **Sync to Salesforce**: `python3 sync_to_salesforce.py`
5. ⏳ **Verify in Salesforce** (check one opportunity)
6. ⏳ **Continue matching** in batches
7. 🚀 **Automate:** Set up scheduled syncs

---

## Support

If you run into issues:
1. Check the error messages in terminal
2. Verify Salesforce credentials are configured
3. Ensure `Grant_Invoice__c` object exists in Salesforce
4. Check that Opportunity IDs are valid (18-character Salesforce IDs)

---

**Ready to start?** Run: `python3 matching_ui.py` 🚀

