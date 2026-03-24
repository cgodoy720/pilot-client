"""ProspectResearchContext — accumulates data across tiers.

Solves the tier data sharing problem: T1 fetches 3 sources, T2 reads
T1's data and only fetches the 6 remaining, T3 reads T2's accumulated
claims and skips directly to quorum + synthesis.

In-memory store keyed by prospect_id with 5-minute TTL cleanup.

Concurrency model: all ctx mutations happen in the async event loop
after awaiting thread results (asyncio.to_thread returns data, threads
never touch ctx). asyncio's event loop is single-threaded — synchronous
code between await points runs atomically. No locks needed.

Each user request gets its own context (keyed by prospect_id), so
concurrent users don't share state. Within a request, clusters run
concurrently via asyncio.gather but their ctx writes are serialized
by the event loop.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from typing import Any, Optional

logger = logging.getLogger("pebble.research_context")

# In-memory store — prospect_id → context
# Safe for single-process asyncio (event loop serializes access).
# If scaling to multi-worker uvicorn, swap for Redis.
_active_contexts: dict[str, ProspectResearchContext] = {}


@dataclass
class ProspectResearchContext:
    """Accumulated research data for a single prospect across tiers."""

    prospect_id: str
    person_name: str
    org_name: str

    # Raw data from sources (populated incrementally by each tier)
    # Keys: "wiki_data", "fec_data", "oc_data", "edgar_data", "usa_data",
    #        "propublica_data", "sec_data", "web_search_data",
    #        "finra_data", "insider_data", "lda_lobbyists", "lda_filings",
    #        "federal_register_data", "fec_committees_data"
    raw_data: dict[str, Any] = field(default_factory=dict)

    # Structured claims accumulated across tiers
    claims: list[dict] = field(default_factory=list)

    # Which tiers have completed
    completed_tiers: list[str] = field(default_factory=list)

    # Person-level enrichments (990 officer match, web search extractions, etc.)
    person_extractions: dict[str, Any] = field(default_factory=dict)

    # Prospect type classification
    prospect_type: str = ""              # ProspectType enum value
    prospect_type_confidence: float = 0.0
    prospect_type_method: str = ""       # "crm_record_type", "crm_account_type", "wikipedia", "heuristic", "llm", "default"

    # Source richness scores (from score_source_richness)
    source_scores: dict[str, float] = field(default_factory=dict)

    # Forager claims (kept separate for T3 to merge)
    forager_claims: list[dict] = field(default_factory=list)

    # Timestamps
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)

    def has_source(self, source_name: str) -> bool:
        """Check if a data source has already been fetched."""
        return source_name in self.raw_data

    def add_source(self, source_name: str, data: Any) -> None:
        """Store fetched data from a source."""
        self.raw_data[source_name] = data
        self.updated_at = time.time()

    def add_claims(self, new_claims: list[dict]) -> None:
        """Add claims, avoiding duplicates by text."""
        existing_texts = {c.get("text", "") for c in self.claims}
        for claim in new_claims:
            text = claim.get("text", "")
            if text and text not in existing_texts:
                self.claims.append(claim)
                existing_texts.add(text)
        self.updated_at = time.time()

    def mark_tier_complete(self, tier: str) -> None:
        """Mark a tier as completed."""
        if tier not in self.completed_tiers:
            self.completed_tiers.append(tier)
        self.updated_at = time.time()

    def tier_completed(self, tier: str) -> bool:
        """Check if a tier has already completed."""
        return tier in self.completed_tiers

    def all_raw_data(self) -> dict:
        """Get all accumulated raw data as a flat dict (for T2/T3 processing)."""
        return dict(self.raw_data)

    def all_claims(self) -> list[dict]:
        """Get all accumulated claims including forager claims."""
        return list(self.claims) + list(self.forager_claims)


def get_or_create_context(
    prospect_id: str,
    person_name: str = "",
    org_name: str = "",
) -> ProspectResearchContext:
    """Get an existing context or create a new one for this prospect."""
    clear_stale_contexts()

    if prospect_id in _active_contexts:
        ctx = _active_contexts[prospect_id]
        # Update name/org if provided and context was created with defaults
        if person_name and not ctx.person_name:
            ctx.person_name = person_name
        if org_name and not ctx.org_name:
            ctx.org_name = org_name
        return ctx

    ctx = ProspectResearchContext(
        prospect_id=prospect_id,
        person_name=person_name,
        org_name=org_name,
    )
    _active_contexts[prospect_id] = ctx
    logger.info("Created research context for %s (%s)", prospect_id, person_name or "unnamed")
    return ctx


def get_context(prospect_id: str) -> Optional[ProspectResearchContext]:
    """Get an existing context or None."""
    return _active_contexts.get(prospect_id)


def clear_context(prospect_id: str) -> None:
    """Remove a prospect's context."""
    _active_contexts.pop(prospect_id, None)


def clear_stale_contexts(max_age_seconds: float = 300) -> None:
    """Remove contexts older than max_age_seconds (default 5 minutes)."""
    now = time.time()
    stale = [
        pid for pid, ctx in _active_contexts.items()
        if now - ctx.updated_at > max_age_seconds
    ]
    for pid in stale:
        logger.debug("Clearing stale context for %s", pid)
        del _active_contexts[pid]
