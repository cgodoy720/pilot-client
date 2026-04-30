"""Backfill bedrock.award rows for all currently-won Philanthropy opportunities.

One-shot, idempotent. Re-running creates no duplicates (relies on the
partial UNIQUE INDEX on opportunity_id WHERE deleted_at IS NULL).

Plan: tasks/bedrock-redesign-data-model.md §5.

Usage (from financial_forecasting/):

    # Dry-run — counts only, no writes
    python -m scripts.backfill_awards --dry-run

    # Verification (recommended before any backfill): check what stages
    # actually exist for Philanthropy opps in this SF org
    python -m scripts.backfill_awards --verify-stages

    # Real run (writes)
    python -m scripts.backfill_awards --yes

Requires DATABASE_URL and a valid SF session (same auth path as the API).
"""

from __future__ import annotations

import argparse
import asyncio
import logging
import os
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional

import asyncpg
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.awards_service import (  # noqa: E402
    PHILANTHROPY_RECORD_TYPE_NAME,
    WON_PHILANTHROPY_STAGES,
    is_award_eligible,
    initial_award_status,
)

load_dotenv(override=False)
logger = logging.getLogger("backfill_awards")


# Stages we *might* see on Philanthropy that count as award-eligible.
# Keep in sync with services/awards_service.WON_PHILANTHROPY_STAGES.
_BACKFILL_STAGES: List[str] = sorted(WON_PHILANTHROPY_STAGES)


# ── SF helpers ────────────────────────────────────────────────────────────


def _build_sf_client():
    """Minimal SF client for one-shot scripts.

    Uses simple_salesforce with env-provided creds. The API runtime uses
    UnifiedMCPClient via dependencies.get_mcp_client; this script bypasses
    that since we don't need MCP transport semantics.
    """
    from simple_salesforce import Salesforce

    instance = os.getenv("SF_INSTANCE_URL")
    session_id = os.getenv("SF_SESSION_ID")
    if instance and session_id:
        return Salesforce(instance_url=instance, session_id=session_id)

    username = os.getenv("SALESFORCE_USERNAME")
    password = os.getenv("SALESFORCE_PASSWORD")
    token = os.getenv("SALESFORCE_SECURITY_TOKEN")
    domain = os.getenv("SALESFORCE_DOMAIN", "login")
    if not (username and password and token):
        raise SystemExit(
            "No SF credentials. Set SF_INSTANCE_URL+SF_SESSION_ID, or "
            "SALESFORCE_USERNAME+PASSWORD+SECURITY_TOKEN."
        )
    return Salesforce(
        username=username, password=password, security_token=token, domain=domain
    )


def _verify_stages(sf) -> None:
    """Print a count of Philanthropy opps grouped by StageName.

    Maps to plan doc §14.1 — "Open items needing JP confirmation". Run this
    before any real backfill to confirm the stage allowlist is complete.
    """
    soql = (
        "SELECT StageName, COUNT(Id) total "
        "FROM Opportunity "
        f"WHERE RecordType.Name = '{PHILANTHROPY_RECORD_TYPE_NAME}' "
        "  AND IsDeleted = false "
        "GROUP BY StageName "
        "ORDER BY COUNT(Id) DESC"
    )
    result = sf.query_all(soql)
    print(f"\n  Philanthropy stage distribution ({result.get('totalSize', 0)} groups):\n")
    print(f"    {'StageName':<55} {'Count':>8}   {'Eligible?'}")
    print(f"    {'-' * 55} {'-' * 8}   {'-' * 9}")
    for r in result.get("records", []):
        stage = r.get("StageName") or "(null)"
        count = r.get("total", 0)
        eligible = "yes" if stage in WON_PHILANTHROPY_STAGES else "no"
        print(f"    {stage:<55} {count:>8}   {eligible}")
    print()
    print("  If 'eligible? no' rows look like they should be backfilled,")
    print("  update services/awards_service.WON_PHILANTHROPY_STAGES.\n")


def _query_eligible_opps(sf) -> List[Dict[str, Any]]:
    """Pull all award-eligible Philanthropy opps from SF."""
    stage_clause = ", ".join(f"'{s}'" for s in _BACKFILL_STAGES)
    soql = (
        "SELECT Id, Name, StageName, CloseDate, RecordType.Name "
        "FROM Opportunity "
        f"WHERE RecordType.Name = '{PHILANTHROPY_RECORD_TYPE_NAME}' "
        f"  AND StageName IN ({stage_clause}) "
        "  AND IsDeleted = false"
    )
    result = sf.query_all(soql)
    records = result.get("records", [])
    return [
        {
            "Id": r.get("Id"),
            "Name": r.get("Name"),
            "StageName": r.get("StageName"),
            "CloseDate": r.get("CloseDate"),
            "RecordTypeName": (r.get("RecordType") or {}).get("Name"),
        }
        for r in records
    ]


# ── DB helpers ────────────────────────────────────────────────────────────


async def _connect_db() -> asyncpg.Connection:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise SystemExit("DATABASE_URL is not set.")
    return await asyncpg.connect(db_url)


async def _insert_awards(
    conn: asyncpg.Connection,
    opps: Iterable[Dict[str, Any]],
    *,
    dry_run: bool,
) -> Dict[str, int]:
    counts = {"eligible": 0, "inserted": 0, "skipped_existing": 0}
    for opp in opps:
        if not is_award_eligible(opp["StageName"], opp["RecordTypeName"]):
            continue
        counts["eligible"] += 1

        if dry_run:
            continue

        existing = await conn.fetchval(
            "SELECT id FROM bedrock.award "
            "WHERE opportunity_id = $1 AND deleted_at IS NULL",
            opp["Id"],
        )
        if existing:
            counts["skipped_existing"] += 1
            continue

        await conn.execute(
            """
            INSERT INTO bedrock.award
                (opportunity_id, award_status, award_date, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT DO NOTHING
            """,
            opp["Id"],
            initial_award_status(opp["StageName"]),
            opp["CloseDate"],
            f"Backfilled 2026-04-30 from SF stage={opp['StageName']}",
        )
        counts["inserted"] += 1
    return counts


# ── Entrypoint ────────────────────────────────────────────────────────────


async def _main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true",
                        help="Count only, no writes.")
    parser.add_argument("--verify-stages", action="store_true",
                        help="Print Philanthropy stage distribution and exit.")
    parser.add_argument("--yes", action="store_true",
                        help="Confirm production write.")
    args = parser.parse_args(argv)

    if not (args.dry_run or args.verify_stages or args.yes):
        parser.error("Pass --dry-run, --verify-stages, or --yes.")

    logging.basicConfig(level=logging.INFO, format="%(message)s")

    sf = _build_sf_client()

    if args.verify_stages:
        _verify_stages(sf)
        return 0

    print(f"\n  Backfill mode: {'DRY-RUN' if args.dry_run else 'WRITE'}")
    print(f"  Eligible stages: {_BACKFILL_STAGES}\n")

    opps = _query_eligible_opps(sf)
    print(f"  SF returned {len(opps)} candidate opps.\n")

    conn = await _connect_db()
    try:
        counts = await _insert_awards(conn, opps, dry_run=args.dry_run)
    finally:
        await conn.close()

    print("  Summary:")
    print(f"    eligible (passed predicate): {counts['eligible']}")
    print(f"    inserted:                    {counts['inserted']}")
    print(f"    skipped (already existed):   {counts['skipped_existing']}\n")

    if args.dry_run:
        print("  (Dry run — no writes performed. Re-run with --yes to apply.)")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(_main()))
