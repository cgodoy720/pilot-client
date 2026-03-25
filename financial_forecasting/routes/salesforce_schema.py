"""Salesforce schema describe endpoint — audit tool for field discovery.

Calls the Salesforce Opportunity describe() API and returns a slim field list.
Use ?compare=true to see which fields are currently fetched in the SOQL query.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import require_auth_or_internal
from dependencies import get_mcp_client
from mcp_client import UnifiedMCPClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/salesforce", tags=["salesforce-schema"])

# Snapshot of fields currently fetched in the Opportunity SOQL query (main.py:292-303).
# This is an audit reference — intentionally not imported from main.py.
OPPORTUNITY_FETCHED_FIELDS = {
    "Id", "AccountId", "Account.Name", "Name", "StageName", "Amount", "Probability",
    "CloseDate", "ForecastCategory", "LeadSource", "NextStep",
    "Description", "Type", "OwnerId", "Owner.Name", "CreatedDate", "LastModifiedDate",
    "LastActivityDate", "RenewalRepeat__c",
    "npe01__Payments_Made__c", "Outstanding_Payments__c",
    "Number_of_Payments_Received__c", "Most_Recent_Payment_Date__c",
    "Last_Actual_Payment__c", "npe01__Number_of_Payments__c",
    "PaymentDate__c", "Earliest_Scheduled_Payment__c",
    "RecordType.Name", "Active_Opportunity__c",
    "Payment_Terms__c", "Contract_Start_Date__c", "Contract_End_Date__c",
    "Billing_Frequency__c", "ExpectedRevenue",
}


def _slim_field(field: Dict[str, Any], fetched_set: Optional[set]) -> Dict[str, Any]:
    """Extract the useful subset of a Salesforce field describe result."""
    slim: Dict[str, Any] = {
        "name": field.get("name"),
        "label": field.get("label"),
        "type": field.get("type"),
        "custom": field.get("custom", False),
        "updateable": field.get("updateable", False),
        "calculated": field.get("calculated", False),
        "nillable": field.get("nillable", False),
        "defaultValue": field.get("defaultValue"),
    }
    # Include picklist values for picklist/multipicklist fields
    if field.get("type") in ("picklist", "multipicklist"):
        slim["picklistValues"] = [
            {
                "value": pv.get("value"),
                "label": pv.get("label"),
                "active": pv.get("active", True),
            }
            for pv in field.get("picklistValues", [])
        ]
    if fetched_set is not None:
        slim["fetched"] = field.get("name") in fetched_set
    return slim


# Map of sobject -> fetched fields for the compare feature
_FETCHED_FIELDS_BY_SOBJECT: Dict[str, set] = {
    "Opportunity": OPPORTUNITY_FETCHED_FIELDS,
}


@router.get("/schema/{sobject}")
async def describe_sobject(
    sobject: str,
    compare: bool = Query(False, description="Compare against currently fetched fields"),
    custom_only: bool = Query(False, description="Only return custom fields"),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth_or_internal),
):
    """Describe a Salesforce SObject — returns field metadata for schema auditing."""
    try:
        salesforce = client.salesforce
        result = await salesforce.describe_sobject(sobject)

        fields_raw: List[Dict[str, Any]] = result.get("fields", [])
        fetched_set = _FETCHED_FIELDS_BY_SOBJECT.get(sobject) if compare else None

        fields = [
            _slim_field(f, fetched_set)
            for f in fields_raw
            if not custom_only or f.get("custom", False)
        ]

        response: Dict[str, Any] = {
            "sobject": sobject,
            "totalFields": len(fields_raw),
            "returnedFields": len(fields),
            "fields": fields,
        }

        if compare and fetched_set is not None:
            response["currentlyFetched"] = sorted(fetched_set)
            response["notFetched"] = sorted(
                f["name"] for f in fields if not f.get("fetched", True)
            )

        return response

    except Exception as e:
        logger.error(f"Error describing {sobject}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to describe {sobject}: {e}")
