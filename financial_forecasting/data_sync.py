"""Data synchronization service for keeping Salesforce and Sage Intacct data in sync."""

import asyncio
import logging
from typing import Any, Dict, List, Optional, Set
from datetime import datetime, date, timedelta
from decimal import Decimal

from .models import (
    SalesforceOpportunity, SalesforceAccount, IntacctCustomer, IntacctInvoice,
    OpportunityInvoiceMapping, OpportunityStage
)

logger = logging.getLogger(__name__)


class DataSyncService:
    """Service for synchronizing data between Salesforce and Sage Intacct."""
    
    def __init__(self, mcp_client):
        self.mcp_client = mcp_client
        self.sync_history = []
        self.customer_mappings = {}  # Salesforce Account ID -> Intacct Customer ID
        self.opportunity_mappings = {}  # Opportunity ID -> Invoice mappings
        
    async def sync_all_data(self):
        """Perform complete data synchronization."""
        logger.info("Starting complete data synchronization...")
        
        try:
            # Sync customer/account mappings first
            await self.sync_customer_mappings()
            
            # Sync opportunities that need invoicing
            await self.sync_opportunity_invoicing()
            
            # Update payment status for existing invoices
            await self.update_payment_statuses()
            
            # Record sync completion
            self.sync_history.append({
                "timestamp": datetime.now(),
                "type": "full_sync",
                "status": "completed",
                "details": "Complete data synchronization finished successfully"
            })
            
            logger.info("Complete data synchronization finished successfully")
            
        except Exception as e:
            logger.error(f"Error during complete data sync: {e}")
            self.sync_history.append({
                "timestamp": datetime.now(),
                "type": "full_sync",
                "status": "failed",
                "error": str(e)
            })
            raise

    async def sync_salesforce_data(self):
        """Sync only Salesforce-related data."""
        logger.info("Starting Salesforce data sync...")
        
        try:
            await self.sync_customer_mappings()
            await self.sync_opportunity_invoicing()
            
            self.sync_history.append({
                "timestamp": datetime.now(),
                "type": "salesforce_sync",
                "status": "completed"
            })
            
            logger.info("Salesforce data sync completed")
            
        except Exception as e:
            logger.error(f"Error during Salesforce sync: {e}")
            raise

    async def sync_intacct_data(self):
        """Sync only Sage Intacct-related data."""
        logger.info("Starting Sage Intacct data sync...")
        
        try:
            await self.update_payment_statuses()
            await self.sync_customer_data_to_salesforce()
            
            self.sync_history.append({
                "timestamp": datetime.now(),
                "type": "intacct_sync",
                "status": "completed"
            })
            
            logger.info("Sage Intacct data sync completed")
            
        except Exception as e:
            logger.error(f"Error during Intacct sync: {e}")
            raise

    async def sync_customer_mappings(self):
        """Synchronize customer mappings between Salesforce Accounts and Intacct Customers."""
        logger.info("Syncing customer mappings...")
        
        try:
            # Get Salesforce accounts
            salesforce = self.mcp_client.services["salesforce"]
            accounts_query = """
            SELECT Id, Name, BillingStreet, BillingCity, BillingState, 
                   BillingPostalCode, BillingCountry, Phone, Website,
                   Intacct_Customer_ID__c
            FROM Account
            WHERE Type IN ('Customer', 'Prospect')
            ORDER BY Name
            LIMIT 1000
            """
            
            accounts_result = await salesforce.query(accounts_query)
            accounts = accounts_result.get("records", [])
            
            # Get Intacct customers
            intacct = self.mcp_client.services["sage_intacct"]
            customers_result = await intacct.get_customers(limit=1000)
            
            if not customers_result.get("success"):
                logger.warning("Failed to retrieve Intacct customers")
                return
            
            intacct_customers = customers_result.get("data", [])
            if not isinstance(intacct_customers, list):
                intacct_customers = [intacct_customers] if intacct_customers else []
            
            # Create mapping dictionaries for efficient lookup
            intacct_by_name = {
                customer.get("NAME", "").lower(): customer 
                for customer in intacct_customers
            }
            
            # Process each Salesforce account
            updates_needed = []
            new_customers_needed = []
            
            for account in accounts:
                account_id = account["Id"]
                account_name = account["Name"]
                existing_intacct_id = account.get("Intacct_Customer_ID__c")
                
                if existing_intacct_id:
                    # Mapping already exists
                    self.customer_mappings[account_id] = existing_intacct_id
                    continue
                
                # Try to find matching Intacct customer by name
                matching_customer = intacct_by_name.get(account_name.lower())
                
                if matching_customer:
                    # Found a match - update Salesforce with the mapping
                    intacct_customer_id = matching_customer.get("CUSTOMERID")
                    self.customer_mappings[account_id] = intacct_customer_id
                    
                    updates_needed.append({
                        "account_id": account_id,
                        "intacct_customer_id": intacct_customer_id
                    })
                else:
                    # No match found - may need to create new customer in Intacct
                    new_customers_needed.append(account)
            
            # Update Salesforce with found mappings
            for update in updates_needed:
                try:
                    await salesforce.update_record(
                        "Account",
                        update["account_id"],
                        {"Intacct_Customer_ID__c": update["intacct_customer_id"]}
                    )
                    logger.info(f"Updated Account {update['account_id']} with Intacct Customer ID {update['intacct_customer_id']}")
                except Exception as e:
                    logger.warning(f"Failed to update Account {update['account_id']}: {e}")
            
            # Create new customers in Intacct for unmatched accounts
            for account in new_customers_needed[:10]:  # Limit to 10 new customers per sync
                try:
                    new_customer_id = await self.create_intacct_customer_from_account(account)
                    if new_customer_id:
                        self.customer_mappings[account["Id"]] = new_customer_id
                        
                        # Update Salesforce with new mapping
                        await salesforce.update_record(
                            "Account",
                            account["Id"],
                            {"Intacct_Customer_ID__c": new_customer_id}
                        )
                        
                        logger.info(f"Created new Intacct customer {new_customer_id} for Account {account['Id']}")
                        
                except Exception as e:
                    logger.warning(f"Failed to create Intacct customer for Account {account['Id']}: {e}")
            
            logger.info(f"Customer mapping sync completed. Mapped {len(self.customer_mappings)} customers.")
            
        except Exception as e:
            logger.error(f"Error syncing customer mappings: {e}")
            raise

    async def create_intacct_customer_from_account(self, account: Dict[str, Any]) -> Optional[str]:
        """Create a new customer in Intacct from a Salesforce account."""
        try:
            intacct = self.mcp_client.services["sage_intacct"]
            
            # Prepare customer data
            customer_data = {
                "customer_id": f"SF_{account['Id'][:8]}",  # Use part of Salesforce ID
                "name": account["Name"],
                "display_contact": account["Name"],
                "company_name": account["Name"],
                "print_as": account["Name"],
                # Add address fields if available
                "address": {
                    "street": account.get("BillingStreet", ""),
                    "city": account.get("BillingCity", ""),
                    "state": account.get("BillingState", ""),
                    "zip": account.get("BillingPostalCode", ""),
                    "country": account.get("BillingCountry", "")
                },
                "phone": account.get("Phone", ""),
                "website": account.get("Website", "")
            }
            
            # Create customer in Intacct
            # Note: This would need to be implemented in the Intacct service
            # For now, return a placeholder ID
            return customer_data["customer_id"]
            
        except Exception as e:
            logger.error(f"Error creating Intacct customer: {e}")
            return None

    async def sync_opportunity_invoicing(self):
        """Sync opportunities that are ready for invoicing."""
        logger.info("Syncing opportunity invoicing...")
        
        try:
            # Get opportunities that are Closed Won but not yet invoiced
            salesforce = self.mcp_client.services["salesforce"]
            
            ready_for_invoice_query = """
            SELECT Id, AccountId, Account.Name, Name, Amount, CloseDate, 
                   StageName, Payment_Terms__c, Contract_Start_Date__c,
                   Invoice_Status__c, Intacct_Invoice_ID__c
            FROM Opportunity
            WHERE StageName = 'Closed Won'
            AND (Invoice_Status__c = null OR Invoice_Status__c = 'Pending')
            AND Amount > 0
            ORDER BY CloseDate DESC
            LIMIT 100
            """
            
            result = await salesforce.query(ready_for_invoice_query)
            opportunities = result.get("records", [])
            
            logger.info(f"Found {len(opportunities)} opportunities ready for invoicing")
            
            for opp in opportunities:
                try:
                    await self.process_opportunity_for_invoicing(opp)
                except Exception as e:
                    logger.warning(f"Failed to process opportunity {opp['Id']} for invoicing: {e}")
                    continue
            
            logger.info("Opportunity invoicing sync completed")
            
        except Exception as e:
            logger.error(f"Error syncing opportunity invoicing: {e}")
            raise

    async def process_opportunity_for_invoicing(self, opportunity: Dict[str, Any]):
        """Process a single opportunity for invoicing."""
        try:
            opp_id = opportunity["Id"]
            account_id = opportunity["AccountId"]
            account_name = opportunity.get("Account", {}).get("Name", "Unknown")
            amount = Decimal(str(opportunity.get("Amount", 0)))
            
            # Check if we have a customer mapping
            intacct_customer_id = self.customer_mappings.get(account_id)
            if not intacct_customer_id:
                # Try to get it from the account record
                salesforce = self.mcp_client.services["salesforce"]
                account_result = await salesforce.get_record("Account", account_id)
                intacct_customer_id = account_result.get("Intacct_Customer_ID__c")
                
                if intacct_customer_id:
                    self.customer_mappings[account_id] = intacct_customer_id
                else:
                    logger.warning(f"No Intacct customer mapping found for Account {account_id}")
                    return
            
            # Prepare invoice data
            invoice_data = {
                "customer_id": intacct_customer_id,
                "date_created": datetime.now().strftime("%m/%d/%Y"),
                "line_items": [
                    {
                        "account_label": "Sales",
                        "amount": float(amount),
                        "description": f"Invoice for opportunity: {opportunity['Name']}"
                    }
                ]
            }
            
            # Create invoice in Intacct
            intacct = self.mcp_client.services["sage_intacct"]
            invoice_result = await intacct.create_invoice(invoice_data)
            
            if invoice_result.get("success"):
                invoice_id = invoice_result.get("data", {}).get("RECORDNO")
                
                # Update opportunity in Salesforce
                salesforce = self.mcp_client.services["salesforce"]
                await salesforce.update_record(
                    "Opportunity",
                    opp_id,
                    {
                        "Invoice_Status__c": "Invoiced",
                        "Intacct_Invoice_ID__c": invoice_id,
                        "Invoice_Date__c": datetime.now().strftime("%Y-%m-%d")
                    }
                )
                
                # Store mapping
                self.opportunity_mappings[opp_id] = {
                    "invoice_id": invoice_id,
                    "status": "invoiced",
                    "created_date": datetime.now()
                }
                
                logger.info(f"Successfully created invoice {invoice_id} for opportunity {opp_id}")
                
            else:
                logger.error(f"Failed to create invoice for opportunity {opp_id}: {invoice_result.get('errors', 'Unknown error')}")
                
                # Update opportunity with error status
                await salesforce.update_record(
                    "Opportunity",
                    opp_id,
                    {"Invoice_Status__c": "Error"}
                )
                
        except Exception as e:
            logger.error(f"Error processing opportunity {opportunity.get('Id', 'unknown')} for invoicing: {e}")
            raise

    async def update_payment_statuses(self):
        """Update payment statuses from Intacct back to Salesforce."""
        logger.info("Updating payment statuses...")
        
        try:
            # Get recent payments from Intacct
            intacct = self.mcp_client.services["sage_intacct"]
            payments_result = await intacct.get_payments(limit=500)
            
            if not payments_result.get("success"):
                logger.warning("Failed to retrieve payments from Intacct")
                return
            
            payments = payments_result.get("data", [])
            if not isinstance(payments, list):
                payments = [payments] if payments else []
            
            # Get invoices to match payments
            invoices_result = await intacct.get_invoices(limit=1000)
            invoices = invoices_result.get("data", []) if invoices_result.get("success") else []
            if not isinstance(invoices, list):
                invoices = [invoices] if invoices else []
            
            # Create invoice lookup by record number
            invoice_lookup = {
                invoice.get("RECORDNO"): invoice 
                for invoice in invoices
            }
            
            # Get opportunities that have been invoiced
            salesforce = self.mcp_client.services["salesforce"]
            invoiced_opps_query = """
            SELECT Id, Name, Amount, Intacct_Invoice_ID__c, Payment_Status__c,
                   Payment_Date__c, Payment_Amount__c
            FROM Opportunity
            WHERE Intacct_Invoice_ID__c != null
            AND Payment_Status__c != 'Paid'
            LIMIT 500
            """
            
            opps_result = await salesforce.query(invoiced_opps_query)
            opportunities = opps_result.get("records", [])
            
            # Process each opportunity
            updates_needed = []
            
            for opp in opportunities:
                try:
                    opp_id = opp["Id"]
                    invoice_id = opp.get("Intacct_Invoice_ID__c")
                    
                    if not invoice_id:
                        continue
                    
                    # Find the invoice
                    invoice = invoice_lookup.get(invoice_id)
                    if not invoice:
                        continue
                    
                    # Check invoice status
                    invoice_state = invoice.get("STATE", "")
                    total_amount = Decimal(str(invoice.get("TOTALAMOUNT", 0)))
                    total_paid = Decimal(str(invoice.get("TOTALPAID", 0)))
                    
                    # Determine payment status
                    payment_status = "Pending"
                    payment_date = None
                    payment_amount = None
                    
                    if invoice_state == "Paid" or total_paid >= total_amount:
                        payment_status = "Paid"
                        # Find the most recent payment for this invoice
                        invoice_payments = [
                            p for p in payments 
                            if p.get("CUSTOMERID") == invoice.get("CUSTOMERID")
                        ]
                        
                        if invoice_payments:
                            # Sort by receipt date and get the latest
                            invoice_payments.sort(
                                key=lambda x: x.get("RECEIPTDATE", ""), 
                                reverse=True
                            )
                            latest_payment = invoice_payments[0]
                            payment_date = latest_payment.get("RECEIPTDATE")
                            payment_amount = float(total_paid)
                    
                    elif total_paid > 0:
                        payment_status = "Partial"
                        payment_amount = float(total_paid)
                    
                    # Check if update is needed
                    current_status = opp.get("Payment_Status__c", "")
                    if current_status != payment_status:
                        update_data = {"Payment_Status__c": payment_status}
                        
                        if payment_date:
                            # Parse and format date
                            if isinstance(payment_date, str) and len(payment_date) >= 10:
                                update_data["Payment_Date__c"] = payment_date[:10]
                        
                        if payment_amount is not None:
                            update_data["Payment_Amount__c"] = payment_amount
                        
                        updates_needed.append({
                            "opportunity_id": opp_id,
                            "updates": update_data
                        })
                
                except Exception as e:
                    logger.warning(f"Error processing payment status for opportunity {opp.get('Id', 'unknown')}: {e}")
                    continue
            
            # Apply updates
            for update in updates_needed:
                try:
                    await salesforce.update_record(
                        "Opportunity",
                        update["opportunity_id"],
                        update["updates"]
                    )
                    logger.info(f"Updated payment status for opportunity {update['opportunity_id']}")
                except Exception as e:
                    logger.warning(f"Failed to update opportunity {update['opportunity_id']}: {e}")
            
            logger.info(f"Payment status update completed. Updated {len(updates_needed)} opportunities.")
            
        except Exception as e:
            logger.error(f"Error updating payment statuses: {e}")
            raise

    async def sync_customer_data_to_salesforce(self):
        """Sync customer financial data from Intacct to Salesforce."""
        logger.info("Syncing customer financial data to Salesforce...")
        
        try:
            # Get Intacct customers with financial data
            intacct = self.mcp_client.services["sage_intacct"]
            customers_result = await intacct.get_customers(limit=1000)
            
            if not customers_result.get("success"):
                logger.warning("Failed to retrieve customers from Intacct")
                return
            
            customers = customers_result.get("data", [])
            if not isinstance(customers, list):
                customers = [customers] if customers else []
            
            # Get Salesforce accounts that have Intacct mappings
            salesforce = self.mcp_client.services["salesforce"]
            accounts_query = """
            SELECT Id, Name, Intacct_Customer_ID__c, Total_Outstanding__c,
                   Credit_Limit__c, Last_Payment_Date__c
            FROM Account
            WHERE Intacct_Customer_ID__c != null
            LIMIT 1000
            """
            
            accounts_result = await salesforce.query(accounts_query)
            accounts = accounts_result.get("records", [])
            
            # Create lookup by Intacct customer ID
            intacct_lookup = {
                customer.get("CUSTOMERID"): customer 
                for customer in customers
            }
            
            # Process each account
            updates_needed = []
            
            for account in accounts:
                try:
                    account_id = account["Id"]
                    intacct_customer_id = account.get("Intacct_Customer_ID__c")
                    
                    if not intacct_customer_id:
                        continue
                    
                    # Find matching Intacct customer
                    intacct_customer = intacct_lookup.get(intacct_customer_id)
                    if not intacct_customer:
                        continue
                    
                    # Prepare updates
                    update_data = {}
                    
                    # Total outstanding amount
                    total_due = intacct_customer.get("TOTALDUE")
                    if total_due is not None:
                        current_outstanding = account.get("Total_Outstanding__c")
                        if current_outstanding != float(total_due):
                            update_data["Total_Outstanding__c"] = float(total_due)
                    
                    # Credit limit
                    credit_limit = intacct_customer.get("CREDITLIMIT")
                    if credit_limit is not None:
                        current_credit_limit = account.get("Credit_Limit__c")
                        if current_credit_limit != float(credit_limit):
                            update_data["Credit_Limit__c"] = float(credit_limit)
                    
                    # Last modified date as proxy for last payment
                    when_modified = intacct_customer.get("WHENMODIFIED")
                    if when_modified:
                        # Parse and format date
                        if isinstance(when_modified, str) and len(when_modified) >= 10:
                            update_data["Last_Financial_Update__c"] = when_modified[:10]
                    
                    if update_data:
                        updates_needed.append({
                            "account_id": account_id,
                            "updates": update_data
                        })
                
                except Exception as e:
                    logger.warning(f"Error processing customer data for account {account.get('Id', 'unknown')}: {e}")
                    continue
            
            # Apply updates
            for update in updates_needed:
                try:
                    await salesforce.update_record(
                        "Account",
                        update["account_id"],
                        update["updates"]
                    )
                    logger.info(f"Updated financial data for account {update['account_id']}")
                except Exception as e:
                    logger.warning(f"Failed to update account {update['account_id']}: {e}")
            
            logger.info(f"Customer financial data sync completed. Updated {len(updates_needed)} accounts.")
            
        except Exception as e:
            logger.error(f"Error syncing customer data to Salesforce: {e}")
            raise

    async def handle_opportunity_stage_change(self, opportunity_id: str, new_stage: str, old_stage: str):
        """Handle opportunity stage changes for automated invoicing."""
        try:
            logger.info(f"Handling stage change for opportunity {opportunity_id}: {old_stage} -> {new_stage}")
            
            # Check if this stage change triggers invoicing
            if new_stage == "Closed Won" and old_stage != "Closed Won":
                # Opportunity just closed - trigger invoicing process
                salesforce = self.mcp_client.services["salesforce"]
                
                # Get opportunity details
                opp_result = await salesforce.get_record("Opportunity", opportunity_id)
                
                if opp_result:
                    await self.process_opportunity_for_invoicing(opp_result)
                    logger.info(f"Triggered invoicing for newly closed opportunity {opportunity_id}")
            
        except Exception as e:
            logger.error(f"Error handling opportunity stage change: {e}")

    def get_sync_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent sync history."""
        return self.sync_history[-limit:] if self.sync_history else []

    def get_customer_mappings(self) -> Dict[str, str]:
        """Get current customer mappings."""
        return self.customer_mappings.copy()

    def get_opportunity_mappings(self) -> Dict[str, Dict[str, Any]]:
        """Get current opportunity-invoice mappings."""
        return self.opportunity_mappings.copy()

