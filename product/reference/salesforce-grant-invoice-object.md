# Salesforce Custom Object: Grant_Invoice__c

## Overview
This custom object creates a junction between Salesforce Opportunities and Sage Intacct invoices, enabling tracking of multiple invoices per grant opportunity and their payment status.

## Object Setup

### Basic Information
- **Label**: Grant Invoice
- **Plural Label**: Grant Invoices
- **Object Name**: Grant_Invoice__c
- **Record Name**: Grant Invoice Name
- **Data Type**: Auto Number
- **Display Format**: GI-{00000}
- **Starting Number**: 1

### Deployment Status
- Deployed

---

## Custom Fields

### 1. Opportunity (Lookup Relationship)
- **Field Label**: Opportunity
- **Field Name**: Opportunity__c
- **Data Type**: Lookup Relationship
- **Related To**: Opportunity
- **Required**: Yes
- **Child Relationship Name**: Grant_Invoices
- **Description**: Links this invoice to the Salesforce Opportunity (grant)

### 2. Sage Invoice ID
- **Field Label**: Sage Invoice ID
- **Field Name**: Sage_Invoice_ID__c
- **Data Type**: Text
- **Length**: 50
- **Unique**: Yes
- **External ID**: Yes
- **Required**: Yes
- **Description**: The RECORDNO from Sage Intacct (e.g., "815")

### 3. Sage Invoice Number
- **Field Label**: Sage Invoice Number
- **Field Name**: Sage_Invoice_Number__c
- **Data Type**: Text
- **Length**: 100
- **Description**: The human-readable invoice number from Sage (e.g., "INV-2024-0123")

### 4. Invoice Amount
- **Field Label**: Invoice Amount
- **Field Name**: Invoice_Amount__c
- **Data Type**: Currency
- **Length**: 16, 2
- **Required**: Yes
- **Description**: Total invoice amount from Sage Intacct

### 5. Amount Paid
- **Field Label**: Amount Paid
- **Field Name**: Amount_Paid__c
- **Data Type**: Currency
- **Length**: 16, 2
- **Default**: 0
- **Description**: Total amount paid against this invoice

### 6. Amount Due
- **Field Label**: Amount Due
- **Field Name**: Amount_Due__c
- **Data Type**: Currency
- **Length**: 16, 2
- **Default**: 0
- **Description**: Remaining balance on this invoice

### 7. Invoice Date
- **Field Label**: Invoice Date
- **Field Name**: Invoice_Date__c
- **Data Type**: Date
- **Description**: Date invoice was created in Sage Intacct

### 8. Due Date
- **Field Label**: Due Date
- **Field Name**: Due_Date__c
- **Data Type**: Date
- **Description**: Date payment is due

### 9. Status
- **Field Label**: Status
- **Field Name**: Status__c
- **Data Type**: Picklist
- **Values**:
  - Draft
  - Posted
  - Partially Paid
  - Paid
  - Voided
- **Default**: Posted
- **Description**: Current status of the invoice in Sage Intacct

### 10. Customer Name
- **Field Label**: Customer Name
- **Field Name**: Customer_Name__c
- **Data Type**: Text
- **Length**: 255
- **Description**: Customer name from Sage Intacct

### 11. Customer Type
- **Field Label**: Customer Type
- **Field Name**: Customer_Type__c
- **Data Type**: Text
- **Length**: 100
- **Description**: Customer classification (Individual, Corporate, Foundation, etc.)

### 12. Description
- **Field Label**: Description
- **Field Name**: Description__c
- **Data Type**: Long Text Area
- **Length**: 32,768
- **Visible Lines**: 3
- **Description**: Invoice description or notes from Sage

### 13. Last Synced
- **Field Label**: Last Synced
- **Field Name**: Last_Synced__c
- **Data Type**: Date/Time
- **Description**: Last time this record was synced from Sage Intacct

### 14. Sage Entity
- **Field Label**: Sage Entity
- **Field Name**: Sage_Entity__c
- **Data Type**: Text
- **Length**: 100
- **Description**: Entity from Sage (PURSUIT, PBC, etc.)

### 15. Match Confidence
- **Field Label**: Match Confidence
- **Field Name**: Match_Confidence__c
- **Data Type**: Picklist
- **Values**:
  - Confirmed
  - High
  - Medium
  - Low
  - Manual Review Needed
- **Description**: Confidence level of the invoice-to-opportunity match

### 16. Match Notes
- **Field Label**: Match Notes
- **Field Name**: Match_Notes__c
- **Data Type**: Long Text Area
- **Length**: 32,768
- **Visible Lines**: 3
- **Description**: Notes about why this invoice was matched to this opportunity

---

## Page Layouts

### Grant Invoice Layout
**Sections:**

#### Invoice Information
- Sage Invoice ID
- Sage Invoice Number
- Customer Name
- Customer Type
- Status
- Sage Entity

#### Financial Details
- Invoice Amount
- Amount Paid
- Amount Due
- Invoice Date
- Due Date

#### Relationship
- Opportunity (Lookup)

#### Matching Information
- Match Confidence
- Match Notes

#### System Information
- Last Synced
- Created By
- Last Modified By

---

## Related Lists to Add

### On Opportunity Page Layout
Add a related list: **Grant Invoices**
- Display Fields: 
  - Grant Invoice Name
  - Sage Invoice Number
  - Invoice Amount
  - Amount Paid
  - Amount Due
  - Status
  - Invoice Date
  - Due Date

---

## Rollup Summary Fields (Optional - Create on Opportunity)

### Total Invoiced
- **Field Label**: Total Invoiced
- **Field Name**: Total_Invoiced__c
- **Data Type**: Rollup Summary (Currency)
- **Summarized Object**: Grant Invoice
- **Rollup Type**: SUM
- **Field to Aggregate**: Invoice Amount

### Total Paid
- **Field Label**: Total Paid  
- **Field Name**: Total_Paid__c
- **Data Type**: Rollup Summary (Currency)
- **Summarized Object**: Grant Invoice
- **Rollup Type**: SUM
- **Field to Aggregate**: Amount Paid

### Total Outstanding
- **Field Label**: Total Outstanding
- **Field Name**: Total_Outstanding__c
- **Data Type**: Rollup Summary (Currency)
- **Summarized Object**: Grant Invoice
- **Rollup Type**: SUM
- **Field to Aggregate**: Amount Due

---

## Security & Sharing

### Object-Level Security
- Grant Read access to: All Users
- Grant Create/Edit access to: System Administrators, Finance Team
- Grant Delete access to: System Administrators only

### Field-Level Security
- All fields visible to users with Read access
- Sage Invoice ID: Read-only for non-admins (prevent changes)

---

## Quick Start: Create Object via Setup

1. **Go to Setup** → Object Manager → Create → Custom Object
2. **Fill in basic info** (see "Object Setup" above)
3. **Add all custom fields** (see "Custom Fields" above)
4. **Create page layout** (see "Page Layouts" above)
5. **Add to Opportunity page layout** (related list)
6. **Set permissions** (see "Security & Sharing" above)

---

## Alternative: Deploy via Metadata API

You can also deploy this using the Salesforce CLI or deploy script we'll create in `sync_to_salesforce.py`.

