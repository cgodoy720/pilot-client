"""Tests for agentic alignment features: sufficiency, retry, condense."""

import pytest

from pebble.clusters import _assess_sufficiency, _create_retry_budget
from pebble.clusters.budget import ClusterBudget, ResearchScratchpad
from pebble.prospect_type import ProspectType
from pebble.research_context import ProspectResearchContext


class TestAssessSufficiency:

    def test_foundation_missing_propublica(self):
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        # propublica_data not in raw_data → insufficient
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is False
        assert "financial" in retry

    def test_foundation_with_propublica_data(self):
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.add_source("propublica_data", {"org": "test"})
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is True
        assert retry == []

    def test_foundation_propublica_none_not_retried(self):
        """Legitimate no-data (None stored) should NOT trigger retry."""
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.add_source("propublica_data", None)
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is True
        assert retry == []

    def test_unknown_type_always_sufficient(self):
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.UNKNOWN)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is True

    def test_corporate_missing_both(self):
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.CORPORATE)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is False
        assert "financial" in retry

    def test_government_missing_lda(self):
        scratchpad = ResearchScratchpad(prospect_type=ProspectType.GOVERNMENT)
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.add_source("federal_register_data", [])
        is_sufficient, retry = _assess_sufficiency(scratchpad, ctx)
        assert is_sufficient is False
        assert "affiliation" in retry


class TestCreateRetryBudget:

    def test_creates_retry_with_remaining_calls(self):
        original = ClusterBudget(max_api_calls=15, max_seconds=60.0)
        original.api_calls_used = 5
        retry = _create_retry_budget(original)
        assert retry is not None
        assert retry.max_api_calls == 10
        assert retry.max_seconds == 90.0  # 60 * 1.5

    def test_returns_none_when_exhausted(self):
        original = ClusterBudget(max_api_calls=5, max_seconds=60.0)
        original.api_calls_used = 5
        retry = _create_retry_budget(original)
        assert retry is None

    def test_caps_at_90_seconds(self):
        original = ClusterBudget(max_api_calls=15, max_seconds=80.0)
        retry = _create_retry_budget(original)
        assert retry is not None
        assert retry.max_seconds == 90.0


class TestCondense:

    def test_extracts_conclusions(self):
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.claims = [
            {"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia)", "source_url": "https://wiki"},
            {"text": "Acme Corp reported $5,000,000 in revenue (2023 Form 990)", "source_url": ""},
        ]
        ctx.raw_data["connected_orgs"] = [{"name": "Partner Inc"}]
        ctx.raw_data["fec_data"] = [{"some": "data"}]
        ctx.condense()
        assert "person_roles" in ctx.conclusions
        assert "financial_summary" in ctx.conclusions
        assert ctx.conclusions["source_count"] >= 1
        assert len(ctx.conclusions["org_connections"]) == 1

    def test_condense_preserves_raw_data(self):
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.raw_data["wiki_data"] = {"title": "Test"}
        ctx.claims = []
        ctx.condense()
        assert ctx.raw_data.get("wiki_data") is not None

    def test_condense_empty_claims(self):
        ctx = ProspectResearchContext(prospect_id="test", person_name="J", org_name="O")
        ctx.claims = []
        ctx.condense()
        assert ctx.conclusions["person_roles"] == []
        assert ctx.conclusions["financial_summary"] == {}
