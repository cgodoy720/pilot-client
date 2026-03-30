"""Tests for SF Field Extractor — maps research context to Salesforce-typed fields."""

import pytest
from dataclasses import dataclass, field
from typing import Any

from pebble.sf_field_extractor import extract_sf_fields, _best_oc_title, _find_linkedin_url


# --- Minimal stubs for ProspectResearchContext and RouteResult ---

@dataclass
class FakeContext:
    prospect_id: str = "test_id"
    person_name: str = "Jane Doe"
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
        """Stub — no-op for testing unless conclusions set."""
        pass


@dataclass
class FakeRoute:
    entities: dict = field(default_factory=dict)


class TestT1Extraction:
    """T1 extracts identity fields: name, title, org, prospect type."""

    def test_basic_name_parsing(self):
        ctx = FakeContext()
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Acme Foundation"})
        contact, account, opp = extract_sf_fields(ctx, route, "T1")

        assert contact["first_name"] == "Jane"
        assert contact["last_name"] == "Doe"
        assert account["name"] == "Acme Foundation"
        assert contact["lead_source"] == "Pebble Research"

    def test_multi_word_last_name(self):
        ctx = FakeContext()
        route = FakeRoute(entities={"person_name": "Maria De La Cruz", "org_name": ""})
        contact, account, _ = extract_sf_fields(ctx, route, "T1")

        assert contact["first_name"] == "Maria"
        assert contact["last_name"] == "De La Cruz"

    def test_prospect_type_mapping(self):
        ctx = FakeContext(prospect_type="foundation")
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Good Foundation"})
        _, account, _ = extract_sf_fields(ctx, route, "T1")

        assert account["account_type"] == "Foundation"

    def test_all_prospect_types(self):
        expected = {
            "corporate": "Corporate",
            "government": "Government",
            "foundation": "Foundation",
            "nonprofit": "Nonprofit",
            "academic": "Academic",
            "daf": "DAF",
            "individual": "Household",
        }
        for pt, expected_type in expected.items():
            ctx = FakeContext(prospect_type=pt)
            route = FakeRoute(entities={"person_name": "Test", "org_name": "Org"})
            _, account, _ = extract_sf_fields(ctx, route, "T1")
            assert account.get("account_type") == expected_type, f"Failed for {pt}"

    def test_unknown_type_no_account_type(self):
        ctx = FakeContext(prospect_type="unknown")
        route = FakeRoute(entities={"person_name": "Test", "org_name": "Org"})
        _, account, _ = extract_sf_fields(ctx, route, "T1")

        assert account.get("account_type") is None

    def test_oc_title_extraction(self):
        ctx = FakeContext(raw_data={
            "oc_data": [
                {"name": "JANE DOE", "position": "Director", "company_name": "Acme Corp"},
                {"name": "JOHN SMITH", "position": "Secretary", "company_name": "Other Corp"},
            ],
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Acme"})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert contact["title"] == "Director"

    def test_fec_mailing_address(self):
        ctx = FakeContext(raw_data={
            "fec_data": [
                {"city": "New York", "state": "NY", "zip_code": "10001",
                 "contribution_receipt_amount": 1000, "contributor_name": "Jane Doe"},
            ],
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert contact["mailing_city"] == "New York"
        assert contact["mailing_state"] == "NY"
        assert contact["mailing_postal_code"] == "10001"

    def test_wikipedia_industry_website(self):
        ctx = FakeContext(raw_data={
            "wiki_data": {
                "title": "Acme Foundation",
                "extract": "A foundation...",
                "infobox": {"industry": "Philanthropy", "website": "https://acme.org"},
                "content_urls": "https://en.wikipedia.org/wiki/Acme_Foundation",
            },
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Acme Foundation"})
        _, account, _ = extract_sf_fields(ctx, route, "T1")

        assert account["industry"] == "Philanthropy"
        assert account["website"] == "https://acme.org"

    def test_linkedin_url_from_web_search(self):
        ctx = FakeContext(raw_data={
            "web_search_data": [
                {"link": "https://www.linkedin.com/in/janedoe", "title": "Jane Doe", "snippet": "..."},
                {"link": "https://example.com", "title": "Other", "snippet": "..."},
            ],
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert contact["linkedin_url"] == "https://www.linkedin.com/in/janedoe"

    def test_sources_populated(self):
        ctx = FakeContext(raw_data={
            "oc_data": [{"name": "Jane Doe", "position": "CEO", "company_name": "Acme"}],
            "fec_data": [{"city": "NY", "state": "NY", "zip_code": "10001",
                         "contribution_receipt_amount": 100, "contributor_name": "Jane Doe"}],
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert "fec" in contact["sources"]
        assert "opencorporates" in contact["sources"]

    def test_tier_in_metadata(self):
        ctx = FakeContext()
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, account, opp = extract_sf_fields(ctx, route, "T1")

        assert contact["last_enriched_tier"] == "T1"
        assert account["last_enriched_tier"] == "T1"
        assert opp["last_enriched_tier"] == "T1"


class TestT2Extraction:
    """T2 adds enrichment: revenue, grantmaker, giving history, wealth indicators."""

    def test_propublica_revenue_from_org_financials(self):
        ctx = FakeContext(
            prospect_type="nonprofit",
            raw_data={
                "org_financials": {
                    "revenue": 5000000.0,
                    "total_assets": 10000000.0,
                    "form_type": "990",
                    "contributions_and_grants": 3000000.0,
                    "program_service_revenue": 2000000.0,
                },
                "propublica_data": {"organization": {"name": "Acme"}},
            },
        )
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Acme Nonprofit"})
        contact, account, opp = extract_sf_fields(ctx, route, "T2")

        assert account["annual_revenue"] == 5000000.0
        assert account["grantmaker"] is True  # contributions_and_grants > 0
        assert account["fee_for_service"] is True  # program_service_revenue > 0
        assert account["philanthropy"] is True  # propublica_data exists
        assert contact["philanthropy"] is True

    def test_propublica_990pf_grantmaker(self):
        ctx = FakeContext(
            raw_data={
                "org_financials": {
                    "revenue": 1000000.0,
                    "form_type": "990-PF",
                    "contributions_and_grants": 0,
                    "program_service_revenue": 0,
                },
            },
        )
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Private Foundation"})
        _, account, _ = extract_sf_fields(ctx, route, "T2")

        assert account["grantmaker"] is True  # 990-PF = private foundation

    def test_raw_propublica_fallback(self):
        ctx = FakeContext(raw_data={
            "propublica_data": {
                "organization": {"name": "Acme", "ntee_code": "T20"},
                "filings_with_data": [{"totrevenue": 2000000, "totcntrbgfts": 500000}],
            },
        })
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Acme"})
        _, account, _ = extract_sf_fields(ctx, route, "T2")

        assert account["annual_revenue"] == 2000000
        assert account["grantmaker"] is True

    def test_fec_giving_history(self):
        ctx = FakeContext(raw_data={
            "fec_data": [
                {"contribution_receipt_amount": 2500, "contributor_name": "Jane Doe"},
                {"contribution_receipt_amount": 1500, "contributor_name": "Jane Doe"},
                {"contribution_receipt_amount": "invalid"},  # Should be skipped
            ],
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        _, _, opp = extract_sf_fields(ctx, route, "T2")

        assert opp["past_giving_history"] == "$4,000 across 2 FEC-reported contributions"

    def test_wealth_indicators(self):
        ctx = FakeContext(raw_data={
            "sec_data": {"name": "Acme Corp"},
            "finra_data": [{"ind_firstname": "Jane"}],
            "usa_data": [{"recipient_name": "Acme"}],
        })
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Acme"})
        _, _, opp = extract_sf_fields(ctx, route, "T2")

        assert "SEC filings" in opp["wealth_indicators"]
        assert "FINRA broker/advisor" in opp["wealth_indicators"]
        assert "Federal contracts/grants" in opp["wealth_indicators"]

    def test_suggested_name_and_stage(self):
        ctx = FakeContext(prospect_type="corporate")
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Acme Corp"})
        _, _, opp = extract_sf_fields(ctx, route, "T2")

        assert opp["suggested_name"] == "Acme Corp — Corporate"
        assert opp["suggested_stage"] == "Lead Gen"


class TestT3Extraction:
    """T3 adds finalization: philanthropic flags, funding focus, capacity."""

    def test_philanthropic_from_forager_claims(self):
        ctx = FakeContext(
            forager_claims=[
                {"text": "Jane is a known philanthropist with a history of charitable giving"},
            ],
        )
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T3")

        assert contact["philanthropic_contact"] is True
        assert contact["philanthropy"] is True

    def test_funding_focus_from_ntee(self):
        ctx = FakeContext(raw_data={
            "propublica_data": {
                "organization": {"name": "Health Foundation", "ntee_code": "E20"},
                "filings_with_data": [],
            },
        })
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Health Foundation"})
        _, account, _ = extract_sf_fields(ctx, route, "T3")

        assert account["funding_focus"] == "Health Care (E20)"

    def test_giving_capacity_from_total_assets(self):
        ctx = FakeContext(raw_data={
            "org_financials": {
                "total_assets": 50000000.0,
                "revenue": 5000000.0,
                "form_type": "990",
                "contributions_and_grants": 0,
                "program_service_revenue": 0,
            },
        })
        route = FakeRoute(entities={"person_name": "Jane", "org_name": "Big Foundation"})
        _, _, opp = extract_sf_fields(ctx, route, "T3")

        assert opp["giving_capacity_estimate"] == 50000000.0

    def test_conclusions_fallback(self):
        ctx = FakeContext(
            conclusions={
                "financial_summary": {
                    "contributions": 100000.0,
                    "total_assets": 5000000.0,
                },
            },
        )
        route = FakeRoute(entities={"person_name": "Jane", "org_name": ""})
        _, _, opp = extract_sf_fields(ctx, route, "T3")

        assert opp["past_giving_history"] == "$100,000 in total contributions"
        assert opp["giving_capacity_estimate"] == 5000000.0


class TestEdgeCases:
    """Graceful handling of empty, None, and malformed data."""

    def test_empty_context(self):
        ctx = FakeContext()
        route = FakeRoute(entities={"person_name": "", "org_name": ""})
        contact, account, opp = extract_sf_fields(ctx, route, "T1")

        assert contact["lead_source"] == "Pebble Research"
        assert contact["last_enriched_tier"] == "T1"

    def test_none_raw_data(self):
        ctx = FakeContext(raw_data={
            "oc_data": None,
            "fec_data": None,
            "wiki_data": None,
            "propublica_data": None,
        })
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": "Acme"})
        contact, account, opp = extract_sf_fields(ctx, route, "T2")

        assert contact["first_name"] == "Jane"
        assert contact["last_name"] == "Doe"
        assert account["name"] == "Acme"

    def test_empty_lists(self):
        ctx = FakeContext(raw_data={"oc_data": [], "fec_data": []})
        route = FakeRoute(entities={"person_name": "Jane Doe", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert contact.get("title") is None
        assert contact.get("mailing_city") is None

    def test_single_name(self):
        ctx = FakeContext()
        route = FakeRoute(entities={"person_name": "Madonna", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T1")

        assert contact["first_name"] == "Madonna"
        assert contact["last_name"] == "Madonna"  # Single word → both first and last

    def test_notes_contain_tier_and_date(self):
        ctx = FakeContext(claims=[{"text": "claim1"}, {"text": "claim2"}])
        route = FakeRoute(entities={"person_name": "Jane", "org_name": ""})
        contact, _, _ = extract_sf_fields(ctx, route, "T2")

        assert "[T2" in contact["notes"]
        assert "2 claims" in contact["notes"]


class TestBestOcTitle:
    """Unit tests for _best_oc_title helper."""

    def test_exact_match(self):
        data = [{"name": "JANE DOE", "position": "Director", "company_name": "Acme"}]
        assert _best_oc_title(data, "Jane Doe") == "Director"

    def test_no_match(self):
        data = [{"name": "JOHN SMITH", "position": "Secretary", "company_name": "Acme"}]
        assert _best_oc_title(data, "Jane Doe") is None

    def test_best_match_selected(self):
        data = [
            {"name": "JANE DOE", "position": "CEO", "company_name": "Acme"},
            {"name": "JANE ELIZABETH DOE", "position": "Director", "company_name": "Other"},
        ]
        # Both match "Jane Doe" with 2 word overlap; first wins (same score)
        result = _best_oc_title(data, "Jane Doe")
        assert result in ("CEO", "Director")

    def test_empty_data(self):
        assert _best_oc_title([], "Jane Doe") is None
        assert _best_oc_title(None, "Jane Doe") is None

    def test_missing_fields(self):
        data = [{"name": "", "position": "", "company_name": ""}]
        assert _best_oc_title(data, "Jane Doe") is None


class TestFindLinkedinUrl:
    """Unit tests for _find_linkedin_url helper."""

    def test_found_in_web_search(self):
        ctx = FakeContext(raw_data={
            "web_search_data": [
                {"link": "https://www.linkedin.com/in/janedoe", "title": "Jane"},
            ],
        })
        assert _find_linkedin_url(ctx) == "https://www.linkedin.com/in/janedoe"

    def test_found_in_web_search_boards(self):
        ctx = FakeContext(raw_data={
            "web_search_boards": [
                {"link": "https://linkedin.com/in/janedoe-123", "title": "Jane"},
            ],
        })
        assert _find_linkedin_url(ctx) == "https://linkedin.com/in/janedoe-123"

    def test_not_found(self):
        ctx = FakeContext(raw_data={
            "web_search_data": [
                {"link": "https://example.com", "title": "Jane"},
            ],
        })
        assert _find_linkedin_url(ctx) is None

    def test_empty(self):
        ctx = FakeContext()
        assert _find_linkedin_url(ctx) is None


class TestScratchpadSerialization:
    """Tests for ClusterBudget.to_dict() and ResearchScratchpad.to_dict()."""

    def test_cluster_budget_to_dict(self):
        from pebble.clusters.budget import ClusterBudget
        budget = ClusterBudget(max_api_calls=15, max_seconds=60.0)
        budget.api_calls_used = 10
        budget.failed_sources = ["sec_data"]

        d = budget.to_dict()
        assert d["max_api_calls"] == 15
        assert d["api_calls_used"] == 10
        assert d["max_seconds"] == 60.0
        assert d["failed_sources"] == ["sec_data"]
        assert isinstance(d["elapsed_seconds"], float)

    def test_cluster_budget_not_started(self):
        from pebble.clusters.budget import ClusterBudget
        budget = ClusterBudget(max_api_calls=5, max_seconds=30.0)
        d = budget.to_dict()
        assert d["elapsed_seconds"] == 0.0

    def test_scratchpad_to_dict(self):
        from pebble.clusters.budget import ResearchScratchpad, ClusterBudget
        from pebble.prospect_type import ProspectType

        sp = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        sp.mark_running("financial")
        sp.mark_done("financial")
        sp.mark_done("affiliation")
        sp.mark_timeout("public_profile")
        sp.skipped_sources = ["finra_data"]
        sp.source_outcomes = {"propublica": "success", "sec": "no_data"}

        d = sp.to_dict()
        assert d["prospect_type"] == "foundation"
        assert d["cluster_status"]["financial"] == "done"
        assert d["cluster_status"]["public_profile"] == "timeout"
        assert d["skipped_sources"] == ["finra_data"]
        assert d["source_outcomes"]["propublica"] == "success"
        assert "financial_budget" in d
        assert d["financial_budget"]["max_api_calls"] == 15
