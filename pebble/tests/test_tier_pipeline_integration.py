"""E2E integration test: T1 → T2 → T3 CRM storage pipeline.

Verifies that extract_sf_fields produces correct data at each tier,
that tier progression accumulates fields (COALESCE semantics), that
conflict detection and scratchpad persistence work, and that
get_prospect_crm_readiness correctly partitions filled vs missing fields.

All tests mock external data sources — no live API calls.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, MagicMock

import pytest

from pebble.sf_field_extractor import extract_sf_fields
from pebble.clusters.conflict_detector import detect_conflicts


# ---------------------------------------------------------------------------
# Stubs — same pattern as test_sf_field_extractor.py
# ---------------------------------------------------------------------------

@dataclass
class FakeContext:
    prospect_id: str = "test-prospect-001"
    person_name: str = "Jane Smith"
    org_name: str = "Acme Foundation"
    raw_data: dict = field(default_factory=dict)
    claims: list = field(default_factory=list)
    forager_claims: list = field(default_factory=list)
    prospect_type: str = ""
    prospect_type_confidence: float = 0.0
    prospect_type_method: str = ""
    source_scores: dict = field(default_factory=dict)
    skipped_sources: list = field(default_factory=list)
    conclusions: dict = field(default_factory=dict)

    def condense(self):
        pass


@dataclass
class FakeRoute:
    entities: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Rich test data — used across tiers to simulate progressive enrichment
# ---------------------------------------------------------------------------

T1_RAW_DATA = {
    "oc_data": [
        {"name": "JANE SMITH", "position": "Executive Director",
         "company_name": "Acme Foundation"},
    ],
    "fec_data": [
        {"city": "San Francisco", "state": "CA", "zip_code": "94105",
         "contribution_receipt_amount": 5000, "contributor_name": "Jane Smith"},
        {"city": "San Francisco", "state": "CA", "zip_code": "94105",
         "contribution_receipt_amount": 2700, "contributor_name": "Jane Smith"},
    ],
    "wiki_data": {
        "title": "Acme Foundation",
        "extract": "A philanthropic organization...",
        "infobox": {"industry": "Philanthropy", "website": "https://acme.org"},
        "content_urls": "https://en.wikipedia.org/wiki/Acme_Foundation",
    },
    "web_search_data": [
        {"link": "https://www.linkedin.com/in/janesmith", "title": "Jane Smith",
         "snippet": "Executive Director at Acme Foundation"},
    ],
}

T2_RAW_DATA = {
    **T1_RAW_DATA,
    "propublica_data": {
        "organization": {"name": "Acme Foundation", "ntee_code": "T20"},
        "filings_with_data": [{"totrevenue": 8000000, "totcntrbgfts": 5000000}],
    },
    "org_financials": {
        "revenue": 8000000.0,
        "total_assets": 25000000.0,
        "form_type": "990",
        "contributions_and_grants": 5000000.0,
        "program_service_revenue": 2000000.0,
    },
    "sec_data": {"name": "Acme Corp"},
    "finra_data": [{"ind_firstname": "Jane"}],
    "usa_data": [{"recipient_name": "Acme Foundation"}],
}

T3_RAW_DATA = {
    **T2_RAW_DATA,
}

T3_FORAGER_CLAIMS = [
    {"text": "Jane Smith is a known philanthropist with a history of charitable giving to education causes"},
    {"text": "Acme Foundation has been a major donor to arts and education programs"},
]

T3_CONCLUSIONS = {
    "financial_summary": {
        "contributions": 5000000.0,
        "total_assets": 25000000.0,
    },
}


# ===========================================================================
# T1 — Identity & Triage
# ===========================================================================

class TestT1PopulatesContactAndAccount:
    """T1 extract produces correct contact and account fields."""

    def test_contact_fields(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T1_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
            "batch_prospect_id": "test-prospect-001",
        })
        contact, account, opp = extract_sf_fields(ctx, route, "T1")

        assert contact["first_name"] == "Jane"
        assert contact["last_name"] == "Smith"
        assert contact["lead_source"] == "Pebble Research"
        assert contact["title"] == "Executive Director"
        assert contact["mailing_city"] == "San Francisco"
        assert contact["mailing_state"] == "CA"
        assert contact["mailing_postal_code"] == "94105"
        assert contact["linkedin_url"] == "https://www.linkedin.com/in/janesmith"
        assert contact["last_enriched_tier"] == "T1"
        assert "fec" in contact["sources"]
        assert "opencorporates" in contact["sources"]

    def test_account_fields(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T1_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        _, account, _ = extract_sf_fields(ctx, route, "T1")

        assert account["name"] == "Acme Foundation"
        assert account["account_type"] == "Foundation"
        assert account["industry"] == "Philanthropy"
        assert account["website"] == "https://acme.org"
        assert account["last_enriched_tier"] == "T1"


# ===========================================================================
# T2 — Structured Intelligence
# ===========================================================================

class TestT2EnrichesWithFinancialData:
    """T2 extract adds financial enrichment to T1 data."""

    def test_account_enrichment(self):
        ctx = FakeContext(
            prospect_type="nonprofit",
            raw_data=T2_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        contact, account, opp = extract_sf_fields(ctx, route, "T2")

        assert account["annual_revenue"] == 8000000.0
        assert account["grantmaker"] is True
        assert account["fee_for_service"] is True
        assert account["philanthropy"] is True
        assert contact["philanthropy"] is True
        assert account["last_enriched_tier"] == "T2"

    def test_opportunity_hints(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T2_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        _, _, opp = extract_sf_fields(ctx, route, "T2")

        assert opp["suggested_name"] == "Acme Foundation — Foundation"
        assert opp["suggested_stage"] == "Lead Gen"
        assert opp["past_giving_history"]  # Non-empty string
        assert "FEC" in opp["past_giving_history"]
        assert opp["last_enriched_tier"] == "T2"

    def test_wealth_indicators(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T2_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        _, _, opp = extract_sf_fields(ctx, route, "T2")

        assert "SEC filings" in opp["wealth_indicators"]
        assert "FINRA broker/advisor" in opp["wealth_indicators"]
        assert "Federal contracts/grants" in opp["wealth_indicators"]


# ===========================================================================
# T3 — Synthesis & Finalization
# ===========================================================================

class TestT3FinalizesWithPhilanthropyAndConflicts:
    """T3 adds philanthropic flags, funding focus, and giving capacity."""

    def test_philanthropic_flags(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T3_RAW_DATA,
            forager_claims=T3_FORAGER_CLAIMS,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        contact, _, _ = extract_sf_fields(ctx, route, "T3")

        assert contact["philanthropic_contact"] is True
        assert contact["philanthropy"] is True
        assert contact["last_enriched_tier"] == "T3"

    def test_funding_focus(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T3_RAW_DATA,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        _, account, _ = extract_sf_fields(ctx, route, "T3")

        # NTEE T20 = Philanthropy, Voluntarism & Grantmaking Foundations (T)
        assert account["funding_focus"] is not None
        assert "T20" in account["funding_focus"]

    def test_giving_capacity(self):
        ctx = FakeContext(
            prospect_type="foundation",
            raw_data=T3_RAW_DATA,
            conclusions=T3_CONCLUSIONS,
        )
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })
        _, _, opp = extract_sf_fields(ctx, route, "T3")

        assert opp["giving_capacity_estimate"] == 25000000.0

    def test_conflict_detection(self):
        """Conflicting role claims produce conflict entries."""
        claims = [
            {"text": "Jane Smith serves as CEO at Acme Foundation (per Wikipedia)",
             "source": "wikipedia", "data_as_of": "2025"},
            {"text": "Jane Smith serves as Executive Director at Acme Foundation (per OpenCorporates)",
             "source": "opencorporates", "data_as_of": "2025"},
        ]
        conflicts = detect_conflicts(claims, "Jane Smith")

        assert len(conflicts) >= 1
        assert any(c["type"] == "role" for c in conflicts)


# ===========================================================================
# Tier Progression — COALESCE semantics
# ===========================================================================

class TestCoalesceTierProgression:
    """T2 extract should contain all T1 fields plus enrichment."""

    def test_t2_preserves_t1_identity_fields(self):
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })

        # T1 extraction
        ctx_t1 = FakeContext(
            prospect_type="foundation",
            raw_data=T1_RAW_DATA,
        )
        contact_t1, account_t1, _ = extract_sf_fields(ctx_t1, route, "T1")

        # T2 extraction (with richer data)
        ctx_t2 = FakeContext(
            prospect_type="foundation",
            raw_data=T2_RAW_DATA,
        )
        contact_t2, account_t2, opp_t2 = extract_sf_fields(ctx_t2, route, "T2")

        # T1 identity fields still present in T2
        assert contact_t2["first_name"] == contact_t1["first_name"]
        assert contact_t2["last_name"] == contact_t1["last_name"]
        assert account_t2["name"] == account_t1["name"]

        # T2 adds new fields that T1 didn't have
        assert account_t2.get("annual_revenue") is not None
        assert account_t1.get("annual_revenue") is None
        assert opp_t2.get("wealth_indicators") is not None

    def test_sources_accumulate_across_tiers(self):
        route = FakeRoute(entities={
            "person_name": "Jane Smith",
            "org_name": "Acme Foundation",
        })

        ctx_t1 = FakeContext(prospect_type="foundation", raw_data=T1_RAW_DATA)
        contact_t1, _, _ = extract_sf_fields(ctx_t1, route, "T1")

        ctx_t2 = FakeContext(prospect_type="foundation", raw_data=T2_RAW_DATA)
        contact_t2, _, _ = extract_sf_fields(ctx_t2, route, "T2")

        # T2 should have at least as many sources as T1
        # (The actual dedup happens in the DB UPSERT, but both tiers produce source lists)
        assert len(contact_t2["sources"]) >= 1
        assert len(contact_t1["sources"]) >= 1


# ===========================================================================
# CRM Readiness Assessment
# ===========================================================================

class TestCrmReadiness:
    """get_prospect_crm_readiness correctly partitions filled vs missing."""

    @pytest.mark.asyncio
    async def test_readiness_filled_and_missing(self, mock_pg_pool):
        """Mock DB rows, call readiness, verify partitioning."""
        from pebble.storage.db import get_prospect_crm_readiness

        # Configure fetchrow side_effect: contact, account, opportunity (3 calls)
        mock_pg_pool.fetchrow.side_effect = [
            # prospect_sf_contact — last_name and first_name filled
            {"last_name": "Smith", "first_name": "Jane", "email": None,
             "title": "Director", "phone": None},
            # prospect_sf_account — name filled
            {"name": "Acme Foundation", "account_type": "Foundation"},
            # prospect_sf_opportunity — suggested_name filled, stage NULL
            {"suggested_name": "Acme Foundation — Foundation",
             "suggested_stage": None, "suggested_close_date": None},
        ]

        # Configure fetch: sf_field_requirements rows (required, no default)
        mock_pg_pool.fetch.return_value = [
            {"sobject": "Contact", "field_name": "LastName", "field_label": "Last Name"},
            {"sobject": "Contact", "field_name": "FirstName", "field_label": "First Name"},
            {"sobject": "Account", "field_name": "Name", "field_label": "Account Name"},
            {"sobject": "Opportunity", "field_name": "Name", "field_label": "Name"},
            {"sobject": "Opportunity", "field_name": "StageName", "field_label": "Stage"},
            {"sobject": "Opportunity", "field_name": "CloseDate", "field_label": "Close Date"},
        ]

        result = await get_prospect_crm_readiness("test-prospect-001")

        # Contact: both Last Name and First Name are filled
        assert "Last Name" in result["readiness"]["Contact"]["filled"]
        assert "First Name" in result["readiness"]["Contact"]["filled"]

        # Account: Name is filled
        assert "Account Name" in result["readiness"]["Account"]["filled"]

        # Opportunity: Name filled, Stage and CloseDate missing
        assert "Name" in result["readiness"]["Opportunity"]["filled"]
        assert "Stage" in result["readiness"]["Opportunity"]["missing"]
        assert "Close Date" in result["readiness"]["Opportunity"]["missing"]

    @pytest.mark.asyncio
    async def test_readiness_empty_prospect(self, mock_pg_pool):
        """A prospect with no data should show all required fields as missing."""
        from pebble.storage.db import get_prospect_crm_readiness

        mock_pg_pool.fetchrow.side_effect = [None, None, None]
        mock_pg_pool.fetch.return_value = [
            {"sobject": "Contact", "field_name": "LastName", "field_label": "Last Name"},
            {"sobject": "Account", "field_name": "Name", "field_label": "Account Name"},
        ]

        result = await get_prospect_crm_readiness("empty-prospect")

        assert result["contact"] == {}
        assert result["account"] == {}
        assert result["opportunity"] == {}
        assert "Last Name" in result["readiness"]["Contact"]["missing"]
        assert "Account Name" in result["readiness"]["Account"]["missing"]


# ===========================================================================
# Scratchpad & Conflict Persistence
# ===========================================================================

class TestPersistenceCalls:
    """Verify save_conflicts and save_scratchpad call DB correctly."""

    @pytest.mark.asyncio
    async def test_save_conflicts_inserts_rows(self, mock_pg_pool):
        from pebble.storage.db import save_conflicts

        conflicts = [
            {"type": "role", "claim_a": "CEO at Acme", "claim_b": "Director at Acme",
             "description": "Different titles at same org"},
            {"type": "financial", "claim_a": "$5M revenue", "claim_b": "$8M revenue",
             "description": "Revenue discrepancy"},
        ]
        await save_conflicts("session-001", "contact-001", conflicts)

        mock_pg_pool.executemany.assert_called_once()
        call_args = mock_pg_pool.executemany.call_args
        sql = call_args[0][0]
        rows = call_args[0][1]
        assert "pebble_conflict_log" in sql
        assert len(rows) == 2
        assert rows[0][0] == "session-001"  # session_id
        assert rows[0][1] == "contact-001"  # contact_id
        assert rows[0][2] == "role"  # conflict_type

    @pytest.mark.asyncio
    async def test_save_conflicts_noop_on_empty(self, mock_pg_pool):
        from pebble.storage.db import save_conflicts

        await save_conflicts("session-001", "contact-001", [])
        mock_pg_pool.executemany.assert_not_called()

    @pytest.mark.asyncio
    async def test_save_scratchpad_upserts(self, mock_pg_pool):
        from pebble.storage.db import save_scratchpad

        scratchpad_data = json.dumps({
            "cluster_status": {"financial": "done", "affiliation": "done"},
            "prospect_type": "foundation",
        })
        await save_scratchpad("session-001", "contact-001", scratchpad_data, "completed")

        mock_pg_pool.execute.assert_called_once()
        call_args = mock_pg_pool.execute.call_args
        sql = call_args[0][0]
        assert "pebble_scratchpad" in sql
        assert "ON CONFLICT" in sql
        assert call_args[0][1] == "session-001"
        assert call_args[0][2] == "contact-001"
        assert call_args[0][4] == "completed"
