# Salesforce Custom Object: Sage_Invoice__c

## Purpose
Junction object to link Salesforce Opportunities to Sage Intacct Invoices, supporting one-to-many relationships (one opportunity can have multiple invoices).

## Object Details
- **API Name**: `Sage_Invoice__c`
- **Label**: Sage Invoice
- **Plural Label**: Sage Invoices
- **Record Name**: Sage Invoice Name
- **Data Type**: Auto Number
- **Display Format**: INV-{0000}
- **Starting Number**: 1

## Custom Fields

### 1. Opportunity (Master-Detail Relationship)
- **Field Name**: `Opportunity__c`
- **Field Label**: Opportunity
- **Type**: Master-Detail Relationship
- **Related To**: Opportunity
- **Child Relationship Name**: Sage_Invoices
- **Required**: Yes
- **Description**: Links this invoice to a Salesforce Opportunity

### 2. Sage Invoice ID
- **Field Name**: `Sage_Invoice_ID__c`
- **Field Label**: Sage Invoice ID
- **Type**: Text
- **Length**: 100
- **Unique**: Yes
- **External ID**: Yes
- **Required**: Yes
- **Description**: The invoice ID/record number from Sage Intacct (e.g., RECORDNO or invoice number)

### 3. Invoice Amount
- **Field Name**: `Invoice_Amount__c`
- **Field Label**: Invoice Amount
- **Type**: Currency
- **Length**: 16
- **Decimal Places**: 2
- **Required**: Yes
- **Description**: Total amount of the invoice

### 4. Invoice Date
- **Field Name**: `Invoice_Date__c`
- **Field Label**: Invoice Date
- **Type**: Date
- **Required**: Yes
- **Description**: Date the invoice was created in Sage Intacct

### 5. Due Date
- **Field Name**: `Due_Date__c`
- **Field Label**: Due Date
- **Type**: Date
- **Required**: No
- **Description**: Payment due date for this invoice

### 6. Invoice Status
- **Field Name**: `Invoice_Status__c`
- **Field Label**: Invoice Status
- **Type**: Picklist
- **Values**:
  - Draft
  - Sent
  - Partially Paid
  - Paid
  - Overdue
  - Cancelled
- **Default**: Draft
- **Required**: Yes
- **Description**: Current status of the invoice

### 7. Description
- **Field Name**: `Description__c`
- **Field Label**: Description
- **Type**: Long Text Area
- **Length**: 32,768
- **Visible Lines**: 3
- **Required**: No
- **Description**: Description or notes about this invoice

### 8. Sage Customer ID
- **Field Name**: `Sage_Customer_ID__c`
- **Field Label**: Sage Customer ID
- **Type**: Text
- **Length**: 100
- **Required**: No
- **Description**: The customer ID in Sage Intacct (for reference)

### 9. Created in Sage Date
- **Field Name**: `Created_in_Sage_Date__c`
- **Field Label**: Created in Sage Date
- **Type**: Date/Time
- **Required**: No
- **Description**: Timestamp when this invoice was created in Sage Intacct

## Page Layout

### Sage Invoice Layout
**Sections:**

1. **Information**
   - Sage Invoice ID
   - Opportunity (lookup)
   - Invoice Amount
   - Invoice Status

2. **Dates**
   - Invoice Date
   - Due Date
   - Created in Sage Date

3. **Details**
   - Sage Customer ID
   - Description

4. **System Information**
   - Created By
   - Last Modified By

## Related Lists

Add to **Opportunity** page layout:
- **Sage Invoices** (Related List)
  - Columns: Sage Invoice Name, Sage Invoice ID, Invoice Amount, Invoice Date, Invoice Status

## Validation Rules

### Invoice ID Required
- **Rule Name**: Sage_Invoice_ID_Required
- **Error Condition Formula**: `ISBLANK(Sage_Invoice_ID__c)`
- **Error Message**: "Sage Invoice ID is required"
- **Error Location**: Sage Invoice ID field

### Amount Positive
- **Rule Name**: Invoice_Amount_Must_Be_Positive
- **Error Condition Formula**: `Invoice_Amount__c <= 0`
- **Error Message**: "Invoice amount must be greater than zero"
- **Error Location**: Invoice Amount field

## Workflow / Process Builder

### Auto-Update Opportunity Stage
When all invoices for an opportunity are marked as "Paid", update opportunity stage to appropriate value.

## Reports & Dashboards

### Useful Reports:
1. **Outstanding Invoices by Opportunity**
   - Filter: Invoice Status NOT "Paid", "Cancelled"
   - Group by: Opportunity
   
2. **Overdue Invoices**
   - Filter: Invoice Status = "Overdue"
   - Sort by: Due Date

3. **Invoice Revenue by Month**
   - Filter: Invoice Status = "Paid"
   - Group by: Invoice Date (Month)

## Security & Sharing

- **OWD (Organization-Wide Default)**: Controlled by Parent (Opportunity)
- **Profile Permissions**:
  - System Administrator: Full Access
  - Finance Team: Read, Create, Edit
  - Grant Writers: Read Only

## Benefits

1. **One-to-Many Support**: Single opportunity can have multiple invoices (installments, amendments, etc.)
2. **Historical Tracking**: Full audit trail of all invoices created
3. **Reporting**: Easy to create reports on invoice status, amounts, aging
4. **Flexibility**: Can add more fields as needed (payment terms, PO number, etc.)
5. **Data Integrity**: Master-detail ensures invoices can't exist without an opportunity

## Implementation Steps

1. Create custom object `Sage_Invoice__c`
2. Add all custom fields
3. Create page layout
4. Add related list to Opportunity layout
5. Set up validation rules
6. Configure security/sharing
7. Update backend code to create records in this object
8. Test with sample data

## Migration

If you have existing opportunities with `Sage_Invoice_ID__c` field:
1. Query all opportunities with non-null `Sage_Invoice_ID__c`
2. Create `Sage_Invoice__c` records for each
3. Link to parent opportunity
4. Verify data
5. (Optional) Remove old `Sage_Invoice_ID__c` field from Opportunity

## Example Usage

```javascript
// Create a new Sage Invoice record
Sage_Invoice__c invoice = new Sage_Invoice__c(
    Opportunity__c = 'OPP_ID_HERE',
    Sage_Invoice_ID__c = 'INV-12345',
    Invoice_Amount__c = 100000,
    Invoice_Date__c = Date.today(),
    Due_Date__c = Date.today().addDays(30),
    Invoice_Status__c = 'Sent',
    Description__c = 'First installment payment'
);
insert invoice;

// Query invoices for an opportunity
List<Sage_Invoice__c> invoices = [
    SELECT Id, Sage_Invoice_ID__c, Invoice_Amount__c, Invoice_Status__c
    FROM Sage_Invoice__c
    WHERE Opportunity__c = :oppId
    ORDER BY Invoice_Date__c
];

// Calculate total invoiced amount
Decimal totalInvoiced = 0;
for(Sage_Invoice__c inv : invoices) {
    totalInvoiced += inv.Invoice_Amount__c;
}
```

## Notes

- This is a **Master-Detail** relationship, so invoices will be deleted if the parent opportunity is deleted
- Consider adding roll-up summary fields on Opportunity:
  - Total Invoiced Amount
  - Number of Invoices
  - Outstanding Invoice Amount
- Can be extended with additional fields like:
  - Payment Terms
  - PO Number
  - Bill To Contact
  - Ship To Address

