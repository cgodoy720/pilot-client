"""Sage Intacct master data endpoints for invoice form dropdowns."""

import asyncio
import csv
import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import require_auth
from routes.permissions import check_permission

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sage", tags=["sage"])

SAGE_ENABLED = os.getenv("SAGE_ENABLED", "").lower() in ("true", "1", "yes")


# ---------------------------------------------------------------------------
# Sage helper — DRY wrapper for all readByQuery endpoints
# ---------------------------------------------------------------------------

def _get_sage_service():
    """Create and return a SageIntacctService instance."""
    from mcp_client.services.sage_intacct_sync import SageIntacctService

    config = {
        "company_id": os.getenv("SAGE_COMPANY_ID"),
        "user_id": os.getenv("SAGE_USER_ID"),
        "user_password": os.getenv("SAGE_USER_PASSWORD"),
        "sender_id": os.getenv("SAGE_SENDER_ID"),
        "sender_password": os.getenv("SAGE_SENDER_PASSWORD"),
    }
    return SageIntacctService(config)


def _sage_query_sync(
    control_id: str,
    object_name: str,
    fields: str = "*",
    query: str = "",
    pagesize: int = 1000,
) -> Dict[str, Any]:
    """Execute a Sage readByQuery and return parsed data (synchronous)."""
    sage = _get_sage_service()
    function_xml = f"""
    <function controlid="{control_id}">
        <readByQuery>
            <object>{object_name}</object>
            <query>{query}</query>
            <fields>{fields}</fields>
            <pagesize>{pagesize}</pagesize>
        </readByQuery>
    </function>"""

    response = sage._make_api_request(function_xml)
    if not response.get("success"):
        raise HTTPException(status_code=500, detail=f"Failed to fetch {object_name}")

    data = response.get("data", {})
    # Sage returns the object name in lowercase as key
    key = object_name.lower()
    records = data.get(key, [])

    # Normalize singleton → list
    if not isinstance(records, list):
        records = [records] if records else []

    return records


async def _sage_query(
    control_id: str,
    object_name: str,
    fields: str = "*",
    query: str = "",
    pagesize: int = 1000,
) -> List[Dict]:
    """Async wrapper around synchronous Sage API call."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, _sage_query_sync, control_id, object_name, fields, query, pagesize
    )


def _require_sage():
    """Raise 503 if Sage is not enabled."""
    if not SAGE_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Sage integration is disabled. Set SAGE_ENABLED=true in .env to enable.",
        )


# ---------------------------------------------------------------------------
# Customers (from CSV, not Sage API)
# ---------------------------------------------------------------------------

@router.get("/customers")
async def get_sage_customers(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get grant customers from exported CSV."""
    _require_sage()
    try:
        csv_path = Path(__file__).resolve().parent.parent.parent / "nonprofit_grant_invoices.csv"

        if not csv_path.exists():
            raise HTTPException(status_code=404, detail="Grant invoices CSV not found")

        customers_map = {}
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cust_id = row.get("customer_id")
                cust_name = row.get("customer_name")
                cust_type = row.get("customer_type", "")
                if cust_id and cust_name and cust_id not in customers_map:
                    customers_map[cust_id] = {
                        "id": cust_id,
                        "name": cust_name,
                        "type": cust_type or None,
                        "status": "active",
                    }

        customers = sorted(customers_map.values(), key=lambda x: x["name"])
        return {"success": True, "count": len(customers), "customers": customers}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_customers")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# GL Accounts
# ---------------------------------------------------------------------------

@router.get("/gl-accounts")
async def get_sage_gl_accounts(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get GL accounts for invoice line items."""
    _require_sage()
    try:
        accounts_data = await _sage_query(
            "get-glaccount", "GLACCOUNT", "ACCOUNTNO,TITLE,ACCOUNTTYPE"
        )
        accounts = [
            {
                "value": acc.get("ACCOUNTNO"),
                "label": f"{acc.get('ACCOUNTNO')} - {acc.get('TITLE')}",
                "type": acc.get("ACCOUNTTYPE"),
            }
            for acc in accounts_data
            if acc.get("ACCOUNTNO")
        ]
        return {"success": True, "count": len(accounts), "accounts": accounts}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_gl_accounts")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/gl-accounts-balance")
async def get_sage_gl_accounts_balance(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get GL account balances (balance sheet + cash accounts)."""
    _require_sage()
    try:
        accounts_data = await _sage_query(
            "get-gl-balances",
            "GLACCOUNT",
            "ACCOUNTNO,TITLE,ACCOUNTTYPE,NORMALBALANCE",
            query="ACCOUNTTYPE = 'balancesheet' OR ACCOUNTTYPE = 'cash'",
        )
        return {"success": True, "count": len(accounts_data), "accounts": accounts_data}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_gl_accounts_balance")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# Departments, Classes, Locations
# ---------------------------------------------------------------------------

@router.get("/departments")
async def get_sage_departments(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get departments for invoice line items."""
    _require_sage()
    try:
        dept_data = await _sage_query(
            "get-departments", "DEPARTMENT", "DEPARTMENTID,TITLE", pagesize=500
        )
        departments = [
            {"value": d.get("DEPARTMENTID"), "label": f"{d.get('DEPARTMENTID')} - {d.get('TITLE')}"}
            for d in dept_data
            if d.get("DEPARTMENTID")
        ]
        return {"success": True, "count": len(departments), "departments": departments}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_departments")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/classes")
async def get_sage_classes(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get classes for invoice line items."""
    _require_sage()
    try:
        class_data = await _sage_query(
            "get-classes", "CLASS", "CLASSID,NAME", pagesize=500
        )
        classes = [
            {"value": c.get("CLASSID"), "label": f"{c.get('CLASSID')} - {c.get('NAME')}"}
            for c in class_data
            if c.get("CLASSID")
        ]
        return {"success": True, "count": len(classes), "classes": classes}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_classes")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/locations")
async def get_sage_locations(
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get locations for invoice line items."""
    _require_sage()
    try:
        loc_data = await _sage_query(
            "get-locations", "LOCATION", "LOCATIONID,NAME", pagesize=500
        )
        locations = [
            {"value": loc.get("LOCATIONID"), "label": f"{loc.get('LOCATIONID')} - {loc.get('NAME')}"}
            for loc in loc_data
            if loc.get("LOCATIONID")
        ]
        return {"success": True, "count": len(locations), "locations": locations}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_locations")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# Expenses, Unpaid Bills
# ---------------------------------------------------------------------------

@router.get("/expenses")
async def get_sage_expenses(
    limit: int = Query(1000, le=2000),
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get AP bills (expenses) from Sage Intacct."""
    _require_sage()
    try:
        expenses_data = await _sage_query("get-expenses", "APBILL", pagesize=limit)
        return {"success": True, "count": len(expenses_data), "expenses": expenses_data}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_expenses")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/unpaid-bills")
async def get_sage_unpaid_bills(
    limit: int = Query(500, le=2000),
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    """Get AP bills with outstanding balance."""
    _require_sage()
    try:
        bills_data = await _sage_query(
            "get-unpaid-bills",
            "APBILL",
            "RECORDNO,RECORDID,VENDORID,VENDORNAME,DESCRIPTION,WHENCREATED,WHENDUE,WHENPAID,TOTALENTERED,TOTALDUE,TOTALPAID,STATE,RAWSTATE,PAYMENTPRIORITY,ONHOLD,DOCNUMBER",
            query="TOTALDUE &gt; 0",
            pagesize=limit,
        )
        return {"success": True, "count": len(bills_data), "bills": bills_data}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error in get_sage_unpaid_bills")
        raise HTTPException(status_code=500, detail="Internal server error")
