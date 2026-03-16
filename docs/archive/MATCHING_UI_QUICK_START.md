# 🚀 Matching UI Quick Start Guide

## What This Tool Does

The Matching UI is a **web-based interface** that helps you link Sage Intacct grant invoices to Salesforce opportunities. It provides:

- ✅ Visual review of all grant invoices
- ✅ Easy matching interface (just enter Opportunity ID)
- ✅ Search and filter capabilities
- ✅ Progress tracking (matched vs. unmatched)
- ✅ Export functionality
- ✅ Local storage with JSON backup

---

## Step 1: Find All Grant Invoices

First, run the comprehensive search to find ALL grant invoices (not just large ones):

```bash
cd /Users/jacquelinereverand/pursuit-mcp-client
python3 find_all_grants.py
```

**This will:**
- Connect to Sage Intacct
- Find all invoices from companies/foundations (not students)
- Export to `all_grant_invoices.csv`
- Show you statistics about grant revenue

**Expected output:**
```
✅ Found 42 grant invoices from companies/foundations
✅ Found 23 uncertain invoices (might be individual donors)
💰 Total Grant Revenue: $2.6M+
📝 Exported to: all_grant_invoices.csv
```

---

## Step 2: Start the Matching UI

Launch the web-based matching interface:

```bash
python3 matching_ui.py
```

**You should see:**
```
================================================================================
  INVOICE ↔ OPPORTUNITY MATCHING UI
================================================================================

✅ Loaded 42 invoices
✅ Loaded 0 existing matches

🌐 Starting web server...

📱 Open your browser to: http://localhost:5000

⚠️  Press Ctrl+C to stop the server
```

---

## Step 3: Open in Your Browser

Open your web browser and go to:

```
http://localhost:5000
```

You'll see a beautiful interface with:
- **Dashboard**: Total invoices, matched count, unmatched count, total amount
- **Search box**: Filter by customer name, amount, or date
- **Invoice table**: All grant invoices listed
- **Action buttons**: Match, Edit, Delete

---

## Step 4: Match Invoices to Opportunities

For each invoice in the table:

### 4a. Click "Match" Button

The invoice row will show:
- Customer name (e.g., "Robin Hood Foundation")
- Invoice amount (e.g., "$280,000")
- Invoice date (e.g., "05/13/2024")

### 4b. Enter Salesforce Opportunity ID

In the popup modal:

1. **Opportunity ID**: Enter the 18-character Salesforce ID
   - Example: `0061234567890ABCDE`
   - Find this in Salesforce URL or by searching

2. **Match Confidence**: Select how confident you are
   - **High**: Customer name and amount match exactly
   - **Medium**: Names similar, amounts close
   - **Low**: Uncertain, needs review
   - **Manual**: You verified manually

3. **Notes** (optional): Add context
   - Example: "Multi-year grant, Year 1 of 3"
   - Example: "Amendment increased from $250K to $280K"

### 4c. Save the Match

Click "Save Match" and the system will:
- ✅ Save to `invoice_opportunity_matches.json`
- ✅ Update the UI (row turns green)
- ✅ Show toast notification "Match saved successfully!"

---

## Step 5: Continue Matching

**Tips for efficient matching:**

### Use Search
- Type in search box to filter (e.g., "Robin Hood")
- Shows only matching invoices
- Clear search to see all

### Match Largest First
- Start with biggest grants ($100K+)
- These have biggest impact on forecasting
- Easier to find in Salesforce (fewer large grants)

### Handle Multi-Year Grants
If a grant has multiple invoices (e.g., Year 1, Year 2):
- Match BOTH to the SAME Opportunity ID
- Use notes to differentiate:
  - "Year 1 of 2"
  - "Year 2 of 2"

### Skip Uncertain Ones
If you're unsure about a match:
- Leave it unmatched for now
- Add to notes: "Need to verify with partnerships team"
- Come back to it later

---

## Step 6: Export Your Matches

When you're done (or want to save progress):

1. Click **"Export Matches"** button
2. System creates: `matched_invoices_YYYYMMDD_HHMMSS.csv`
3. Open in Excel/Google Sheets to review
4. Share with team if needed

**The export includes:**
- All invoice details
- Matched Opportunity IDs
- Confidence scores
- Your notes
- Timestamp of when matched

---

## Step 7: Review Your Progress

The dashboard shows real-time stats:

```
┌──────────────────────────────────┐
│ Total Invoices:        42        │
│ Matched:              30 ✅      │
│ Unmatched:            12 ⚠️      │
│ Total Amount:      $2.6M         │
└──────────────────────────────────┘
```

**Goal**: Get to 100% matched!

---

## Where is Data Saved?

### Locally (Immediate)
```
invoice_opportunity_matches.json
├─ Saved on your computer
├─ Updated in real-time as you match
└─ Can be version controlled (git)
```

### Export (Backup)
```
matched_invoices_20251112_153045.csv
├─ Timestamped snapshot
├─ Can share with team
└─ Import to Salesforce later
```

### Salesforce (Next Step)
After matching is complete:
- Create custom fields on Opportunity
- Sync script reads JSON and updates Salesforce
- Data becomes accessible to whole team

---

## Common Scenarios

### Scenario 1: Exact Match
```
Invoice: Robin Hood Foundation - $280,000 - 05/13/2024
Salesforce: Robin Hood Foundation 2024 Grant - $280,000 - Closed 03/15/2024

Action:
✅ Enter Opportunity ID
✅ Confidence: High
✅ Save
```

### Scenario 2: Name Mismatch
```
Invoice: NYC Dept of Youth Community Development - $454,203
Salesforce: New York City DYCD FY22 - $454,203

Action:
✅ Enter Opportunity ID (even though names differ)
✅ Confidence: High (amounts match exactly)
✅ Notes: "Customer name abbreviated in Salesforce"
```

### Scenario 3: Amount Mismatch
```
Invoice: Google LLC - $75,000 - 07/02/2024
Salesforce: Google.org 2024 Grant - $100,000 - Closed 06/15/2024

Possible reasons:
- Multi-year grant (this is Year 1 payment)
- Amendment reduced amount
- Partial invoice

Action:
✅ Enter Opportunity ID if you can verify
✅ Confidence: Medium or Low
✅ Notes: "Invoice is $75K but opportunity is $100K - need to verify"
⚠️  OR skip and investigate first
```

### Scenario 4: Multiple Invoices, Same Opportunity
```
Invoice 1: Blackstone Charitable - $250,000 - 11/27/2023
Invoice 2: Blackstone Charitable - $25,000 - 01/15/2024

Same grant, two invoices? Possible:
- Multi-year installments
- Original + supplemental grant
- Correction/amendment

Action:
✅ Match BOTH to the SAME Opportunity ID
✅ Notes on Invoice 1: "Initial payment"
✅ Notes on Invoice 2: "Supplemental grant"
```

---

## Troubleshooting

### Can't Find Opportunity in Salesforce

**Problem**: You have an invoice but can't find matching opportunity

**Solutions**:
1. Search by customer/account name in Salesforce
2. Check if opportunity is in different stage (not just Closed Won)
3. Ask partnerships team about this grant
4. Might be old grant before Salesforce was implemented
5. Leave unmatched and investigate later

### Multiple Opportunities Match

**Problem**: Same customer has 3 grants, which opportunity does this invoice belong to?

**Solutions**:
1. Match by close date (invoice date near opp close date)
2. Match by amount (if amounts are different)
3. Check opportunity name for year/program (e.g., "2024 Grant")
4. Ask bookkeeper which grant this invoice was for

### Uncertain if It's a Grant

**Problem**: Large amount but individual name (might be major donor)

**Example**: "Soo Kim - $40,000"

**Solutions**:
1. Check Salesforce for "Soo Kim" as account
2. Ask partnerships if this is a grant or something else
3. Use confidence: Low
4. Notes: "Verify if this is grant revenue"

---

## Tips for Success

### Before You Start
- ✅ Open Salesforce in another tab (to look up Opportunity IDs)
- ✅ Set aside focused time (30-60 minutes)
- ✅ Have partnerships contact info handy for questions

### While Matching
- ✅ Start with invoices you recognize
- ✅ Use search to find related invoices
- ✅ Save progress frequently (auto-saved, but export as backup)
- ✅ Add good notes (helps others understand your thinking)

### After Matching
- ✅ Export final CSV
- ✅ Review unmatched invoices
- ✅ Create Salesforce custom fields
- ✅ Run sync script to push to Salesforce

---

## Keyboard Shortcuts

- **Ctrl+F** / **Cmd+F**: Focus search box
- **Enter** in search: Start filtering
- **Esc**: Close modal
- **Ctrl+C** in terminal: Stop server

---

## Need Help?

### Check These Files:
- `WHERE_LINKS_ARE_SAVED.md` - Explains data storage
- `PRD_QUESTIONS_ANSWERED.md` - Context on the project
- `SAGE_SALESFORCE_LINKING_STRATEGY.md` - Technical details

### Common Issues:
- **Port 5000 already in use**: Something else is using that port
  - Solution: Kill that process or change port in `matching_ui.py`
- **CSV not found**: Run `find_all_grants.py` first
- **Matches not saving**: Check file permissions on directory

---

## Success Metrics

**You're done when:**
- ✅ 80%+ of invoices matched (goal: 100%)
- ✅ All large invoices (>$50K) matched
- ✅ Unmatched invoices have notes explaining why
- ✅ Export CSV created and reviewed
- ✅ Ready to sync to Salesforce

**Typical time**: 30-60 minutes for ~40 invoices

---

## What Happens Next?

After you finish matching:

1. **Create Salesforce Fields**
   - Add custom fields to Opportunity object
   - See `WHERE_LINKS_ARE_SAVED.md` for field specs

2. **Sync to Salesforce**
   - Run sync script (to be created)
   - Validates matches
   - Updates Salesforce via API

3. **Build Dashboard**
   - Display pipeline → invoice → payment flow
   - Show cash flow forecast
   - Track payment status

4. **Automate Going Forward**
   - New invoices auto-suggest matches
   - Daily sync keeps data current
   - Bookkeeper confirms matches

---

## Ready to Start?

```bash
# Step 1: Find all grants
python3 find_all_grants.py

# Step 2: Start matching UI
python3 matching_ui.py

# Step 3: Open browser
open http://localhost:5000

# Step 4: Start matching! 🚀
```

**Good luck!** 🎉

