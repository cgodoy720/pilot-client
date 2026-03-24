"""Cluster budget and research scratchpad — bounded autonomy primitives.

Each cluster gets its own budget (max API calls + max wall-clock seconds).
The scratchpad tracks overall research state across all three clusters.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

from ..prospect_type import ProspectType


@dataclass
class ClusterBudget:
    """Bounded budget for a single research cluster."""

    max_api_calls: int
    max_seconds: float
    api_calls_used: int = 0
    started_at: float = 0.0
    failed_sources: list[str] = field(default_factory=list)

    def start(self) -> None:
        """Mark the start time for this cluster."""
        self.started_at = time.time()

    def can_call(self) -> bool:
        """Check if we're within both call count and time limits."""
        if self.api_calls_used >= self.max_api_calls:
            return False
        if self.started_at > 0 and self.elapsed() >= self.max_seconds:
            return False
        return True

    def record_call(self) -> None:
        """Increment the API call counter."""
        self.api_calls_used += 1

    def elapsed(self) -> float:
        """Seconds since cluster started."""
        if self.started_at <= 0:
            return 0.0
        return time.time() - self.started_at


@dataclass
class ResearchScratchpad:
    """Tracks state across all three concurrent clusters."""

    prospect_type: ProspectType
    financial_budget: ClusterBudget = field(
        default_factory=lambda: ClusterBudget(max_api_calls=15, max_seconds=60.0)
    )
    affiliation_budget: ClusterBudget = field(
        default_factory=lambda: ClusterBudget(max_api_calls=15, max_seconds=60.0)
    )
    profile_budget: ClusterBudget = field(
        default_factory=lambda: ClusterBudget(max_api_calls=5, max_seconds=30.0)
    )
    cluster_status: dict[str, str] = field(
        default_factory=lambda: {
            "financial": "pending",
            "affiliation": "pending",
            "public_profile": "pending",
        }
    )
    connected_orgs: list[dict] = field(default_factory=list)
    findings_summary: str = ""
    skipped_sources: list[str] = field(default_factory=list)
    source_outcomes: dict[str, str] = field(default_factory=dict)

    def mark_running(self, cluster: str) -> None:
        self.cluster_status[cluster] = "running"

    def mark_done(self, cluster: str) -> None:
        self.cluster_status[cluster] = "done"

    def mark_timeout(self, cluster: str) -> None:
        self.cluster_status[cluster] = "timeout"

    def mark_error(self, cluster: str) -> None:
        self.cluster_status[cluster] = "error"
