"""Payment schedule CRUD endpoints."""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth
from dependencies import get_mcp_client
from mcp_client import UnifiedMCPClient
from routes.permissions import check_permission
from security import validate_salesforce_id, escape_soql_string

logger = logging.getLogger(__name__)

router = APIRouter(tags=["payment-schedules"])


class PaymentScheduleItem(BaseModel):
    amount: float
    scheduled_date: str  # YYYY-MM-DD format


class CreatePaymentScheduleRequest(BaseModel):
    opportunity_id: str
    payments: List[PaymentScheduleItem]
    delete_existing: bool = True


# ---------------------------------------------------------------------------
# GET payment schedule
# ---------------------------------------------------------------------------

@router.get("/api/opportunities/{opportunity_id}/payment-schedule")
async def get_payment_schedule(
    opportunity_id: str,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Get payment schedule for an opportunity."""
    validate_salesforce_id(opportunity_id, "opportunity_id")
    safe_id = escape_soql_string(opportunity_id)
    try:
        salesforce = client.salesforce

        opp_result = await salesforce.query(
            f"SELECT Id, Name, Amount, StageName FROM Opportunity WHERE Id = '{safe_id}'"
        )
        if not opp_result.get("records"):
            raise HTTPException(status_code=404, detail="Opportunity not found")

        opportunity = opp_result["records"][0]

        payment_result = await salesforce.query(
            f"""SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c,
                       npe01__Paid__c, npe01__Payment_Date__c
            FROM npe01__OppPayment__c
            WHERE npe01__Opportunity__c = '{safe_id}'
            ORDER BY npe01__Scheduled_Date__c ASC"""
        )
        payments = payment_result.get("records", [])

        return {
            "success": True,
            "opportunity": {
                "Id": opportunity["Id"],
                "Name": opportunity["Name"],
                "Amount": opportunity.get("Amount", 0),
                "StageName": opportunity.get("StageName"),
            },
            "payments": [
                {
                    "Id": p["Id"],
                    "Amount": p.get("npe01__Payment_Amount__c", 0),
                    "ScheduledDate": p.get("npe01__Scheduled_Date__c"),
                    "Paid": p.get("npe01__Paid__c", False),
                    "PaymentDate": p.get("npe01__Payment_Date__c"),
                }
                for p in payments
            ],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_payment_schedule")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# CREATE payment schedule
# ---------------------------------------------------------------------------

@router.post("/api/opportunities/create-payment-schedule")
async def create_payment_schedule(
    request: CreatePaymentScheduleRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("manage_payment_schedules")),
):
    """Create payment schedule for an opportunity."""
    # TODO: Phase 3 — use per-user SF tokens when available for write attribution
    validate_salesforce_id(request.opportunity_id, "opportunity_id")
    safe_id = escape_soql_string(request.opportunity_id)
    try:
        salesforce = client.salesforce

        # Get opportunity
        opp_result = await salesforce.query(
            f"SELECT Id, Name, Amount FROM Opportunity WHERE Id = '{safe_id}'"
        )
        if not opp_result.get("records"):
            raise HTTPException(status_code=404, detail="Opportunity not found")

        opp = opp_result["records"][0]
        opp_amount = float(opp.get("Amount", 0))

        # Validate payment total
        payment_total = sum(p.amount for p in request.payments)
        if abs(payment_total - opp_amount) > 0.01:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Payment total doesn't match opportunity amount",
                    "opportunity_amount": opp_amount,
                    "payment_total": payment_total,
                    "difference": payment_total - opp_amount,
                    "message": f"Payment total (${payment_total:,.2f}) must equal opportunity amount (${opp_amount:,.2f})",
                },
            )

        # Delete existing payments if requested
        if request.delete_existing:
            existing_result = await salesforce.query(
                f"SELECT Id FROM npe01__OppPayment__c WHERE npe01__Opportunity__c = '{safe_id}'"
            )
            for payment in existing_result.get("records", []):
                await salesforce.delete_record("npe01__OppPayment__c", payment["Id"])

        # Create new payments
        created_payments = []
        for i, payment in enumerate(request.payments):
            result = await salesforce.create_record(
                "npe01__OppPayment__c",
                {
                    "npe01__Opportunity__c": request.opportunity_id,
                    "npe01__Payment_Amount__c": payment.amount,
                    "npe01__Scheduled_Date__c": payment.scheduled_date,
                    "npe01__Paid__c": False,
                },
            )
            created_payments.append({
                "Id": result["id"],
                "Amount": payment.amount,
                "ScheduledDate": payment.scheduled_date,
                "Number": i + 1,
            })

        return {
            "success": True,
            "message": f"Created {len(created_payments)} payment(s) totaling ${payment_total:,.2f}",
            "payments": created_payments,
            "opportunity_name": opp.get("Name"),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in create_payment_schedule")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# Aspirational endpoints (not yet in simple_server.py — stub for future)
# ---------------------------------------------------------------------------

@router.put("/api/opportunities/{opportunity_id}/payment-schedule/{payment_id}")
async def update_payment(
    opportunity_id: str,
    payment_id: str,
    user=Depends(check_permission("manage_payment_schedules")),
):
    """Update a single payment in a schedule. (Not yet implemented.)"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/api/opportunities/{opportunity_id}/payment-schedule/{payment_id}")
async def delete_payment(
    opportunity_id: str,
    payment_id: str,
    user=Depends(check_permission("manage_payment_schedules")),
):
    """Delete a single payment from a schedule. (Not yet implemented.)"""
    raise HTTPException(status_code=501, detail="Not implemented")
