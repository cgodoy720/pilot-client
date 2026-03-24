"""Tests for cluster research dispatcher, timeout handling, and budget."""

import asyncio
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from dataclasses import dataclass

from pebble.clusters.budget import ClusterBudget, ResearchScratchpad
from pebble.prospect_type import ProspectType
from pebble.research_context import ProspectResearchContext


class TestClusterBudget:
    """Tests for ClusterBudget bounded autonomy."""

    def test_initial_state(self):
        b = ClusterBudget(max_api_calls=10, max_seconds=30.0)
        assert b.api_calls_used == 0
        assert b.can_call() is True
        assert b.failed_sources == []

    def test_budget_exhausted(self):
        b = ClusterBudget(max_api_calls=2, max_seconds=30.0)
        b.record_call()
        b.record_call()
        assert b.can_call() is False

    def test_failed_sources_tracking(self):
        b = ClusterBudget(max_api_calls=10, max_seconds=30.0)
        b.failed_sources.append("fec_data")
        b.failed_sources.append("sec_data")
        assert b.failed_sources == ["fec_data", "sec_data"]


class TestResearchScratchpad:
    """Tests for ResearchScratchpad state tracking."""

    def test_initial_state(self):
        s = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        assert s.cluster_status == {
            "financial": "pending",
            "affiliation": "pending",
            "public_profile": "pending",
        }
        assert s.skipped_sources == []
        assert s.source_outcomes == {}
        assert s.findings_summary == ""

    def test_status_transitions(self):
        s = ResearchScratchpad(prospect_type=ProspectType.CORPORATE)
        s.mark_running("financial")
        assert s.cluster_status["financial"] == "running"
        s.mark_done("financial")
        assert s.cluster_status["financial"] == "done"

    def test_source_outcomes(self):
        s = ResearchScratchpad(prospect_type=ProspectType.INDIVIDUAL)
        s.source_outcomes["financial"] = "ok"
        s.source_outcomes["affiliation"] = "timeout"
        assert s.source_outcomes == {"financial": "ok", "affiliation": "timeout"}


class TestRunClusterResearch:
    """Tests for the main run_cluster_research dispatcher."""

    @pytest.mark.asyncio
    async def test_empty_names_returns_early(self):
        from pebble.clusters import run_cluster_research
        from pebble.orchestrator import ProspectBudgetTracker

        ctx = ProspectResearchContext(
            prospect_id="test", person_name="", org_name="",
        )
        budget = ProspectBudgetTracker(prospect_id="test")
        scratchpad, claims = await run_cluster_research(
            ctx, "", "", ProspectType.UNKNOWN, budget,
        )
        assert claims == []

    @pytest.mark.asyncio
    async def test_clusters_run_and_merge_claims(self):
        from pebble.clusters import run_cluster_research
        from pebble.orchestrator import ProspectBudgetTracker

        ctx = ProspectResearchContext(
            prospect_id="test", person_name="Jane", org_name="Acme",
        )
        budget = ProspectBudgetTracker(prospect_id="test")

        mock_claims_fin = [{"text": "claim from financial", "source_url": ""}]
        mock_claims_aff = [{"text": "claim from affiliation", "source_url": ""}]
        mock_claims_pp = [{"text": "claim from profile", "source_url": ""}]

        with patch("pebble.clusters.run_financial_cluster", new_callable=AsyncMock, return_value=mock_claims_fin), \
             patch("pebble.clusters.run_affiliation_cluster", new_callable=AsyncMock, return_value=mock_claims_aff), \
             patch("pebble.clusters.run_public_profile_cluster", new_callable=AsyncMock, return_value=mock_claims_pp):
            scratchpad, claims = await run_cluster_research(
                ctx, "Jane", "Acme", ProspectType.UNKNOWN, budget,
            )

        assert len(claims) == 3
        assert scratchpad.source_outcomes.get("financial") == "ok"
        assert scratchpad.source_outcomes.get("affiliation") == "ok"
        assert scratchpad.source_outcomes.get("public_profile") == "ok"

    @pytest.mark.asyncio
    async def test_cluster_timeout_returns_empty_claims(self):
        from pebble.clusters import run_cluster_research
        from pebble.orchestrator import ProspectBudgetTracker

        ctx = ProspectResearchContext(
            prospect_id="test", person_name="Jane", org_name="Acme",
        )
        budget = ProspectBudgetTracker(prospect_id="test")

        async def slow_cluster(*args, **kwargs):
            await asyncio.sleep(999)
            return [{"text": "should not appear"}]

        with patch("pebble.clusters.run_financial_cluster", side_effect=slow_cluster), \
             patch("pebble.clusters.run_affiliation_cluster", new_callable=AsyncMock, return_value=[]), \
             patch("pebble.clusters.run_public_profile_cluster", new_callable=AsyncMock, return_value=[]):
            scratchpad, claims = await run_cluster_research(
                ctx, "Jane", "Acme", ProspectType.UNKNOWN, budget,
            )

        assert scratchpad.source_outcomes.get("financial") == "timeout"
        # UNKNOWN type has no critical sources, so no retry
        assert "should not appear" not in [c.get("text") for c in claims]

    @pytest.mark.asyncio
    async def test_cluster_error_returns_empty_claims(self):
        from pebble.clusters import run_cluster_research
        from pebble.orchestrator import ProspectBudgetTracker

        ctx = ProspectResearchContext(
            prospect_id="test", person_name="Jane", org_name="Acme",
        )
        budget = ProspectBudgetTracker(prospect_id="test")

        async def failing_cluster(*args, **kwargs):
            raise RuntimeError("API is down")

        with patch("pebble.clusters.run_financial_cluster", side_effect=failing_cluster), \
             patch("pebble.clusters.run_affiliation_cluster", new_callable=AsyncMock, return_value=[]), \
             patch("pebble.clusters.run_public_profile_cluster", new_callable=AsyncMock, return_value=[]):
            scratchpad, claims = await run_cluster_research(
                ctx, "Jane", "Acme", ProspectType.UNKNOWN, budget,
            )

        assert scratchpad.source_outcomes.get("financial") == "error"
