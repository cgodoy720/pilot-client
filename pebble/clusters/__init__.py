"""Cluster research dispatcher — concurrent execution of 3 research clusters.

Entry point: run_cluster_research() launches Financial, Affiliation, and
Public Profile clusters concurrently with bounded budgets and timeout handling.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from ..prospect_type import ProspectType
from ..research_context import ProspectResearchContext
from ..orchestrator import ProspectBudgetTracker
from .source_router import SourceConfig, get_source_config
from .budget import ClusterBudget, ResearchScratchpad
from .financial import run_financial_cluster
from .affiliation import run_affiliation_cluster
from .public_profile import run_public_profile_cluster

logger = logging.getLogger("pebble.clusters")


async def run_cluster_research(
    ctx: ProspectResearchContext,
    person_name: str,
    org_name: str,
    prospect_type: ProspectType,
    budget: ProspectBudgetTracker,
    client=None,
) -> tuple[ResearchScratchpad, list[dict]]:
    """Dispatch research across 3 concurrent clusters.

    1. Look up SourceConfig for the prospect_type
    2. Create ResearchScratchpad with per-cluster budgets
    3. Launch all 3 clusters concurrently via asyncio.gather
    4. Each cluster wrapped in asyncio.wait_for with timeout
    5. If a cluster times out, log and continue with others
    6. Merge and deduplicate claims

    Returns (scratchpad, merged_claims).
    """
    source_config = get_source_config(prospect_type)
    scratchpad = ResearchScratchpad(prospect_type=prospect_type)

    # Guard: if both names are empty, no useful research is possible
    if not person_name and not org_name:
        logger.warning("Cluster research skipped — both person_name and org_name are empty")
        return scratchpad, []

    logger.info(
        "Starting cluster research: type=%s, person=%s, org=%s",
        prospect_type.value, person_name, org_name,
    )

    # --- Launch all 3 clusters concurrently ---
    async def _run_with_timeout(
        name: str,
        coro,
        cluster_budget: ClusterBudget,
    ) -> list[dict]:
        """Run a cluster coroutine with timeout and error handling."""
        scratchpad.mark_running(name)
        try:
            result = await asyncio.wait_for(coro, timeout=cluster_budget.max_seconds)
            scratchpad.mark_done(name)
            return result
        except asyncio.TimeoutError:
            scratchpad.mark_timeout(name)
            logger.warning("Cluster %s timed out after %.0fs", name, cluster_budget.max_seconds)
            return []
        except Exception as e:
            scratchpad.mark_error(name)
            logger.error("Cluster %s failed: %s", name, e, exc_info=True)
            return []

    results = await asyncio.gather(
        _run_with_timeout(
            "public_profile",
            run_public_profile_cluster(
                ctx, person_name, org_name,
                scratchpad.profile_budget, client,
            ),
            scratchpad.profile_budget,
        ),
        _run_with_timeout(
            "financial",
            run_financial_cluster(
                ctx, person_name, org_name,
                source_config, scratchpad.financial_budget,
            ),
            scratchpad.financial_budget,
        ),
        _run_with_timeout(
            "affiliation",
            run_affiliation_cluster(
                ctx, person_name, org_name,
                source_config, scratchpad.affiliation_budget,
            ),
            scratchpad.affiliation_budget,
        ),
    )

    # --- Merge claims from all clusters ---
    all_claims = []
    for cluster_claims in results:
        all_claims.extend(cluster_claims)

    # Deduplicate via ctx.add_claims (which checks by text)
    ctx.add_claims(all_claims)

    total_calls = (
        scratchpad.profile_budget.api_calls_used
        + scratchpad.financial_budget.api_calls_used
        + scratchpad.affiliation_budget.api_calls_used
    )

    logger.info(
        "Cluster research complete: type=%s, %d claims, %d API calls, statuses=%s",
        prospect_type.value,
        len(all_claims),
        total_calls,
        scratchpad.cluster_status,
    )

    return scratchpad, all_claims
