"""Output contracts for cluster results.

Each cluster returns a list of claims (dicts) — these models are for
documentation and future validation, not runtime enforcement.
The claim dict schema matches existing claim_templates output.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class ClusterResult:
    """Result from a single research cluster."""
    cluster_name: str
    claims: list[dict] = field(default_factory=list)
    sources_queried: list[str] = field(default_factory=list)
    sources_skipped: list[str] = field(default_factory=list)
    api_calls_used: int = 0
    elapsed_seconds: float = 0.0
    error: str = ""
