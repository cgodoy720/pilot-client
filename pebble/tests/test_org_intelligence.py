"""Tests for org intelligence module (Sprint 4)."""

import asyncio
from unittest.mock import patch, AsyncMock, MagicMock

import pytest

from pebble.clusters.org_intelligence import (
    investigate_connected_orgs,
    _collect_connected_orgs,
    _deduplicate_orgs,
    _rank_orgs,
    _assess_priority,
)
from pebble.clusters.budget import ClusterBudget
from pebble.research_context import ProspectResearchContext


def _make_ctx(**raw_data_overrides) -> ProspectResearchContext:
    """Create a minimal ProspectResearchContext with optional raw_data."""
    ctx = ProspectResearchContext(
        prospect_id="test_prospect",
        person_name="Test Person",
        org_name="Test Org",
    )
    for key, value in raw_data_overrides.items():
        ctx.add_source(key, value)
    return ctx


class TestCollectConnectedOrgs:
    """Tests for _collect_connected_orgs."""

    def test_from_connected_orgs(self):
        ctx = _make_ctx(connected_orgs=[
            {"name": "Org A", "source": "opencorporates", "relationship": "officer"},
        ])
        orgs = _collect_connected_orgs(ctx)
        assert len(orgs) == 1
        assert orgs[0]["name"] == "Org A"

    def test_from_ein_orgs(self):
        ctx = _make_ctx(ein_orgs=[
            {"name": "Foundation X", "ein": 123456789},
        ])
        orgs = _collect_connected_orgs(ctx)
        assert len(orgs) == 1
        assert orgs[0]["name"] == "Foundation X"
        assert orgs[0]["ein"] == "123456789"

    def test_deduplicates_across_sources(self):
        ctx = _make_ctx(
            connected_orgs=[
                {"name": "Acme Corp", "source": "opencorporates", "relationship": "officer"},
            ],
            ein_orgs=[
                {"name": "acme corp", "ein": 111},  # same name, different case
                {"name": "Other Org", "ein": 222},
            ],
        )
        orgs = _collect_connected_orgs(ctx)
        names = [o["name"] for o in orgs]
        # "Acme Corp" from connected_orgs wins, "acme corp" from ein_orgs is deduped
        assert len(orgs) == 2
        assert "Acme Corp" in names
        assert "Other Org" in names

    def test_no_data(self):
        ctx = _make_ctx()
        assert _collect_connected_orgs(ctx) == []


class TestDeduplicateOrgs:
    def test_removes_duplicates(self):
        orgs = [
            {"name": "Org A"},
            {"name": "org a"},
            {"name": "Org B"},
        ]
        result = _deduplicate_orgs(orgs)
        assert len(result) == 2

    def test_first_occurrence_wins(self):
        orgs = [
            {"name": "Org A", "ein": "111"},
            {"name": "org a", "ein": "222"},
        ]
        result = _deduplicate_orgs(orgs)
        assert result[0]["ein"] == "111"


class TestRankOrgs:
    def test_ein_first(self):
        orgs = [
            {"name": "No EIN"},
            {"name": "Has EIN", "ein": "123"},
        ]
        ranked = _rank_orgs(orgs)
        assert ranked[0]["name"] == "Has EIN"

    def test_alphabetical_tiebreaker(self):
        orgs = [
            {"name": "Zebra Org"},
            {"name": "Acme Org"},
        ]
        ranked = _rank_orgs(orgs)
        assert ranked[0]["name"] == "Acme Org"


class TestAssessPriority:
    def test_crm_match_is_high(self):
        assert _assess_priority(None, {"Name": "Found"}) == "high"

    def test_high_revenue_is_high(self):
        assert _assess_priority({"revenue": 50_000_000}, None) == "high"

    def test_medium_revenue_is_medium(self):
        assert _assess_priority({"revenue": 5_000_000}, None) == "medium"

    def test_low_revenue_is_low(self):
        assert _assess_priority({"revenue": 100_000}, None) == "low"

    def test_no_data_is_low(self):
        assert _assess_priority(None, None) == "low"


class TestInvestigateConnectedOrgs:
    """Integration tests for investigate_connected_orgs — mocked external calls."""

    @pytest.mark.asyncio
    async def test_basic_investigation(self):
        """Connected orgs → search → fetch → CRM check → recommendations."""
        ctx = _make_ctx(connected_orgs=[
            {"name": "Good Foundation", "source": "opencorporates", "relationship": "officer"},
        ])
        budget = ClusterBudget(max_api_calls=10, max_seconds=30.0)

        mock_crm = MagicMock()
        mock_crm.search_accounts = AsyncMock(return_value=[{"Name": "Good Foundation", "Id": "001xx"}])

        with patch("pebble.data_sources.propublica.search_organizations", return_value=[{"ein": 999}]), \
             patch("pebble.data_sources.propublica.fetch_organization", return_value={
                 "organization": {"name": "Good Foundation", "ein": 999, "latest_object_id": "abc123"},
                 "filings_with_data": [{"tax_prd_yr": 2023, "totrevenue": 5000000, "totassetsend": 10000000}],
             }), \
             patch("pebble.data_sources.propublica.download_990_xml", return_value=None), \
             patch("pebble.data_sources.propublica.extract_org_financials", return_value={
                 "org_name": "Good Foundation", "ein": "999", "tax_year": 2023,
                 "revenue": 5000000, "total_assets": 10000000,
             }):
            recs, claims = await investigate_connected_orgs(
                ctx, "Test Person", mock_crm, budget, max_orgs=5, enable_xml=True,
            )

        assert len(recs) == 1
        assert recs[0]["entity_name"] == "Good Foundation"
        assert recs[0]["recommendation_type"] == "investigate_org"
        assert recs[0]["crm_match"]["Name"] == "Good Foundation"
        assert recs[0]["priority"] == "high"  # has CRM match

    @pytest.mark.asyncio
    async def test_budget_exhaustion(self):
        """Budget runs out → stops investigating."""
        ctx = _make_ctx(connected_orgs=[
            {"name": f"Org {i}", "source": "test"} for i in range(10)
        ])
        budget = ClusterBudget(max_api_calls=3, max_seconds=30.0)

        mock_crm = MagicMock()
        mock_crm.search_accounts = AsyncMock(return_value=None)

        with patch("pebble.data_sources.propublica.search_organizations", return_value=[]), \
             patch("pebble.data_sources.propublica.fetch_organization", return_value=None), \
             patch("pebble.data_sources.propublica.extract_org_financials", return_value=None):
            recs, claims = await investigate_connected_orgs(
                ctx, "Test Person", mock_crm, budget, max_orgs=10, enable_xml=False,
            )

        # With 3 API calls total: first org uses search(1) + CRM(1) = 2 calls,
        # second org uses search(1) = 3 calls → budget exhausted before CRM
        # Both orgs still produce recommendations (budget check is per-API-call, not per-org)
        assert budget.api_calls_used == 3
        assert len(recs) == 2

    @pytest.mark.asyncio
    async def test_xml_top_1_only(self):
        """XML download only happens for the first org."""
        ctx = _make_ctx(connected_orgs=[
            {"name": "Org A", "source": "test", "ein": "111"},
            {"name": "Org B", "source": "test", "ein": "222"},
        ])
        budget = ClusterBudget(max_api_calls=20, max_seconds=30.0)

        mock_crm = MagicMock()
        mock_crm.search_accounts = AsyncMock(return_value=None)

        download_calls = []

        def mock_download(oid):
            download_calls.append(oid)
            return None

        org_data_a = {
            "organization": {"name": "Org A", "ein": 111, "latest_object_id": "obj_a"},
            "filings_with_data": [{"tax_prd_yr": 2023}],
        }
        org_data_b = {
            "organization": {"name": "Org B", "ein": 222, "latest_object_id": "obj_b"},
            "filings_with_data": [{"tax_prd_yr": 2023}],
        }

        def mock_fetch(ein):
            return org_data_a if str(ein) == "111" else org_data_b

        with patch("pebble.data_sources.propublica.search_organizations", return_value=[{"ein": 111}]), \
             patch("pebble.data_sources.propublica.fetch_organization", side_effect=mock_fetch), \
             patch("pebble.data_sources.propublica.download_990_xml", side_effect=mock_download), \
             patch("pebble.data_sources.propublica.extract_org_financials", return_value=None):
            recs, claims = await investigate_connected_orgs(
                ctx, "Test Person", mock_crm, budget, max_orgs=5, enable_xml=True,
            )

        # Only 1 XML download, even though 2 orgs have object_ids
        # Verify it was the top-ranked org (Org A sorts first alphabetically)
        assert len(download_calls) == 1
        assert download_calls[0] == "obj_a"

    @pytest.mark.asyncio
    async def test_missing_object_id_skips_xml(self):
        """Org without latest_object_id → no XML download, no crash."""
        ctx = _make_ctx(connected_orgs=[
            {"name": "No XML Org", "source": "test"},
        ])
        budget = ClusterBudget(max_api_calls=10, max_seconds=30.0)

        mock_crm = MagicMock()
        mock_crm.search_accounts = AsyncMock(return_value=None)

        # org_data has NO latest_object_id
        org_data = {
            "organization": {"name": "No XML Org", "ein": 555},
            "filings_with_data": [],
        }

        with patch("pebble.data_sources.propublica.search_organizations", return_value=[{"ein": 555}]), \
             patch("pebble.data_sources.propublica.fetch_organization", return_value=org_data), \
             patch("pebble.data_sources.propublica.download_990_xml") as mock_download, \
             patch("pebble.data_sources.propublica.extract_org_financials", return_value=None):
            recs, claims = await investigate_connected_orgs(
                ctx, "Test Person", mock_crm, budget, max_orgs=5, enable_xml=True,
            )

        # download_990_xml should NOT have been called
        mock_download.assert_not_called()
        assert len(recs) == 1  # recommendation still created

    @pytest.mark.asyncio
    async def test_no_connected_orgs(self):
        """No connected orgs → empty results."""
        ctx = _make_ctx()
        budget = ClusterBudget(max_api_calls=10, max_seconds=30.0)

        recs, claims = await investigate_connected_orgs(
            ctx, "Test Person", None, budget,
        )
        assert recs == []
        assert claims == []
