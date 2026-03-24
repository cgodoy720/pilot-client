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


# ---------------------------------------------------------------------------
# Critical sources per prospect type — defines which sources, if missing due
# to API failure, warrant a retry.  Common sources (fec_core, wikipedia,
# web_search) are excluded because they are queried for ALL types.
# ---------------------------------------------------------------------------

_CRITICAL_SOURCES: dict[str, list[str]] = {
    "foundation":  ["propublica_data"],
    "nonprofit":   ["propublica_data"],
    "academic":    ["propublica_data", "usa_data"],
    "government":  ["lda_lobbyists", "federal_register_data"],
    "corporate":   ["sec_data", "edgar_data"],
    "individual":  ["fec_data"],
    "daf":         ["fec_data"],
    "unknown":     [],
}

_SOURCE_TO_CLUSTER: dict[str, str] = {
    "fec_data": "financial", "fec_committees_data": "financial",
    "propublica_data": "financial", "sec_data": "financial",
    "edgar_data": "financial", "insider_data": "financial",
    "usa_data": "financial", "finra_data": "financial",
    "oc_data": "affiliation", "lda_lobbyists": "affiliation",
    "lda_filings": "affiliation", "federal_register_data": "affiliation",
    "wiki_data": "public_profile",
    "web_search_boards": "public_profile", "web_search_giving": "public_profile",
}


# ---------------------------------------------------------------------------
# Sufficiency assessment + retry helpers
# ---------------------------------------------------------------------------

def _assess_sufficiency(
    scratchpad: ResearchScratchpad,
    ctx: ProspectResearchContext,
) -> tuple[bool, list[str]]:
    """Check if critical sources returned data.  Only retry API failures.

    Returns (is_sufficient, retryable_cluster_names).
    - source NOT in ctx.raw_data → API failure → retryable
    - source in ctx.raw_data as None → legitimate no-data → NOT retryable
    - source in ctx.raw_data with data → sufficient
    """
    critical = _CRITICAL_SOURCES.get(scratchpad.prospect_type.value, [])
    retry_clusters: set[str] = set()
    for source_key in critical:
        if source_key not in ctx.raw_data:
            cluster = _SOURCE_TO_CLUSTER.get(source_key)
            if cluster:
                retry_clusters.add(cluster)
    return len(retry_clusters) == 0, sorted(retry_clusters)


def _create_retry_budget(original: ClusterBudget) -> Optional[ClusterBudget]:
    """Build a retry budget from the original.  Returns None if exhausted."""
    remaining = original.max_api_calls - original.api_calls_used
    if remaining <= 0:
        return None
    return ClusterBudget(
        max_api_calls=remaining,
        max_seconds=min(original.max_seconds * 1.5, 90.0),
    )


def _get_cluster_budget(scratchpad: ResearchScratchpad, name: str) -> ClusterBudget:
    """Look up the budget object for a cluster by name."""
    return {
        "financial": scratchpad.financial_budget,
        "affiliation": scratchpad.affiliation_budget,
        "public_profile": scratchpad.profile_budget,
    }[name]


def _build_cluster_coro(
    name: str,
    ctx: ProspectResearchContext,
    person_name: str,
    org_name: str,
    source_config: SourceConfig,
    budget: ClusterBudget,
    client,
):
    """Dispatch a single cluster coroutine by name."""
    if name == "financial":
        return run_financial_cluster(ctx, person_name, org_name, source_config, budget)
    if name == "affiliation":
        return run_affiliation_cluster(ctx, person_name, org_name, source_config, budget)
    if name == "public_profile":
        return run_public_profile_cluster(ctx, person_name, org_name, budget, client)
    raise ValueError(f"Unknown cluster: {name}")


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
            scratchpad.source_outcomes[name] = "ok"
            return result
        except asyncio.TimeoutError:
            scratchpad.mark_timeout(name)
            scratchpad.source_outcomes[name] = "timeout"
            logger.warning("Cluster %s timed out after %.0fs", name, cluster_budget.max_seconds)
            return []
        except Exception as e:
            scratchpad.mark_error(name)
            scratchpad.source_outcomes[name] = "error"
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

    # --- Collect initial claims ---
    all_claims: list[dict] = []
    for cluster_claims in results:
        all_claims.extend(cluster_claims)

    # --- Sufficiency check + retry ---
    retry_budgets: dict[str, ClusterBudget] = {}
    is_sufficient, failed_clusters = _assess_sufficiency(scratchpad, ctx)

    if not is_sufficient and failed_clusters:
        logger.info(
            "Research sufficiency: INSUFFICIENT — retrying clusters: %s",
            failed_clusters,
        )
        for cluster_name in failed_clusters:
            original = _get_cluster_budget(scratchpad, cluster_name)
            retry = _create_retry_budget(original)
            if retry:
                retry_budgets[cluster_name] = retry

        if retry_budgets:
            retry_coros = []
            for cname, rbudget in retry_budgets.items():
                scratchpad.cluster_status[cname] = "pending"
                coro = _build_cluster_coro(
                    cname, ctx, person_name, org_name,
                    source_config, rbudget, client,
                )
                retry_coros.append(_run_with_timeout(cname, coro, rbudget))

            retry_results = await asyncio.gather(*retry_coros)
            for cluster_claims in retry_results:
                all_claims.extend(cluster_claims)

            # Re-assess after retry
            still_ok, still_failed = _assess_sufficiency(scratchpad, ctx)
            if still_failed:
                logger.warning(
                    "Research sufficiency: still insufficient after retry — %s",
                    still_failed,
                )
            else:
                logger.info("Research sufficiency: sufficient after retry")
    else:
        logger.info("Research sufficiency: sufficient")

    # --- Aggregate skipped_sources ---
    for bud in [scratchpad.financial_budget, scratchpad.affiliation_budget,
                scratchpad.profile_budget]:
        scratchpad.skipped_sources.extend(bud.failed_sources)
    for bud in retry_budgets.values():
        scratchpad.skipped_sources.extend(bud.failed_sources)
    # Also flag critical sources that returned no data (legitimate None)
    for source_key in _CRITICAL_SOURCES.get(scratchpad.prospect_type.value, []):
        if source_key in ctx.raw_data and ctx.raw_data[source_key] is None:
            scratchpad.skipped_sources.append(source_key)
    scratchpad.skipped_sources = sorted(set(scratchpad.skipped_sources))

    # --- Deduplicate and finalize ---
    ctx.add_claims(all_claims)
    ctx.skipped_sources = list(scratchpad.skipped_sources)
    ctx.condense()

    total_calls = (
        scratchpad.profile_budget.api_calls_used
        + scratchpad.financial_budget.api_calls_used
        + scratchpad.affiliation_budget.api_calls_used
    )

    logger.info(
        "Cluster research complete: type=%s, %d claims, %d API calls, "
        "statuses=%s, skipped=%s",
        prospect_type.value,
        len(all_claims),
        total_calls,
        scratchpad.cluster_status,
        scratchpad.skipped_sources or "none",
    )

    return scratchpad, all_claims
