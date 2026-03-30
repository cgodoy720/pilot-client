"""Schema drift detection — compare live Salesforce describe() against sf_field_requirements.

Detects 5 drift types: field_added, field_removed, type_changed,
is_required_changed, updateable_changed. Logs all drifts to
sf_schema_drift_log for HITL (human-in-the-loop) review.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)

_DEFAULT_SOBJECTS = ["Opportunity", "Contact", "Account", "npe01__OppPayment__c"]


async def detect_schema_drift(
    conn,
    mcp_client,
    sobjects: list[str] | None = None,
) -> list[dict]:
    """Compare live SF describe() output against sf_field_requirements rows.

    For each sobject, fetches stored requirements and live metadata, then
    detects and logs any differences. Returns a per-sobject summary.

    Args:
        conn: asyncpg connection.
        mcp_client: UnifiedMCPClient with .salesforce.describe_sobject().
        sobjects: SObjects to scan. Defaults to all 4 tracked objects.

    Returns:
        List of dicts: [{"sobject": str, "drifts_found": int, "details": [...], "error": str|None}]
    """
    if sobjects is None:
        sobjects = list(_DEFAULT_SOBJECTS)

    results = []
    for sobject in sobjects:
        try:
            result = await _scan_sobject(conn, mcp_client, sobject)
            results.append(result)
        except Exception as e:
            logger.warning("Drift scan failed for %s: %s", sobject, e)
            results.append({
                "sobject": sobject,
                "drifts_found": 0,
                "details": [],
                "error": str(e),
            })

    return results


async def _scan_sobject(conn, mcp_client, sobject: str) -> dict:
    """Run drift detection for a single sobject."""
    # 1. Fetch stored requirements
    req_rows = await conn.fetch(
        "SELECT field_name, field_type, is_required, has_default, is_updateable "
        "FROM bedrock.sf_field_requirements WHERE sobject = $1",
        sobject,
    )
    stored = {row["field_name"]: dict(row) for row in req_rows}

    # 2. Fetch live describe()
    describe_result = await mcp_client.salesforce.describe_sobject(sobject)
    live_fields_raw: list[dict[str, Any]] = describe_result.get("fields", [])
    live = {f["name"]: f for f in live_fields_raw}

    # 3. Compare
    drifts: list[dict] = []

    # Check stored fields against live
    for field_name, req in stored.items():
        if field_name not in live:
            drifts.append(_make_drift(
                sobject, field_name, "field_removed",
                old_value=req["field_type"], new_value=None,
            ))
            continue

        live_field = live[field_name]

        # type_changed
        if req["field_type"] != live_field.get("type"):
            drifts.append(_make_drift(
                sobject, field_name, "type_changed",
                old_value=req["field_type"],
                new_value=live_field.get("type"),
            ))

        # is_required_changed
        # SF: nillable=False means required (except booleans always have defaults)
        live_required = (
            not live_field.get("nillable", True)
            and live_field.get("type") != "boolean"
            and live_field.get("updateable", False)
        )
        if req["is_required"] != live_required:
            drifts.append(_make_drift(
                sobject, field_name, "is_required_changed",
                old_value=str(req["is_required"]),
                new_value=str(live_required),
            ))

        # updateable_changed
        if req["is_updateable"] != live_field.get("updateable", False):
            drifts.append(_make_drift(
                sobject, field_name, "updateable_changed",
                old_value=str(req["is_updateable"]),
                new_value=str(live_field.get("updateable", False)),
            ))

    # Check for new custom fields not in requirements
    for field_name, live_field in live.items():
        if field_name not in stored and field_name.endswith("__c"):
            drifts.append(_make_drift(
                sobject, field_name, "field_added",
                old_value=None,
                new_value=live_field.get("type"),
            ))

    # 4. Persist drifts
    if drifts:
        await conn.executemany(
            "INSERT INTO bedrock.sf_schema_drift_log "
            "(sobject, field_name, drift_type, old_value, new_value) "
            "VALUES ($1, $2, $3, $4, $5)",
            [
                (d["sobject"], d["field_name"], d["drift_type"],
                 d["old_value"], d["new_value"])
                for d in drifts
            ],
        )

    # 5. Update last_verified_at
    await conn.execute(
        "UPDATE bedrock.sf_field_requirements SET last_verified_at = now() "
        "WHERE sobject = $1",
        sobject,
    )

    return {
        "sobject": sobject,
        "drifts_found": len(drifts),
        "details": drifts,
        "error": None,
    }


def _make_drift(
    sobject: str,
    field_name: str,
    drift_type: str,
    old_value: str | None,
    new_value: str | None,
) -> dict:
    return {
        "sobject": sobject,
        "field_name": field_name,
        "drift_type": drift_type,
        "old_value": old_value,
        "new_value": new_value,
    }


async def get_unresolved_drifts(conn) -> list[dict]:
    """Fetch all unresolved schema drift entries."""
    rows = await conn.fetch(
        "SELECT id, sobject, field_name, drift_type, old_value, new_value, "
        "detected_at, resolved_at, resolved_by, action_taken "
        "FROM bedrock.sf_schema_drift_log "
        "WHERE resolved_at IS NULL "
        "ORDER BY detected_at DESC",
    )
    return [dict(r) for r in rows]


async def resolve_drift(
    conn,
    drift_id: int,
    resolved_by: str,
    action_taken: str,
) -> dict | None:
    """Mark a drift entry as resolved. Returns the updated row, or None if not found."""
    row = await conn.fetchrow(
        "UPDATE bedrock.sf_schema_drift_log "
        "SET resolved_at = now(), resolved_by = $2, action_taken = $3 "
        "WHERE id = $1 AND resolved_at IS NULL "
        "RETURNING id, sobject, field_name, drift_type, old_value, new_value, "
        "detected_at, resolved_at, resolved_by, action_taken",
        drift_id, resolved_by, action_taken,
    )
    return dict(row) if row else None
