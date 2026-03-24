"""Tests for LDA lobbying and FINRA BrokerCheck claim template functions."""

import pytest

from pebble.claim_templates import claims_from_lobbying, claims_from_finra


class TestClaimsFromLobbying:
    """Tests for claims_from_lobbying()."""

    def test_lobbyist_match(self):
        """Matching lobbyist generates registered-lobbyist claim."""
        lobbyists = [
            {"first_name": "John", "last_name": "Doe", "registrant": {"name": "ACME Lobbying"}},
        ]
        claims = claims_from_lobbying(lobbyists=lobbyists, person_name="John Doe")

        assert len(claims) == 1
        assert "registered lobbyist at ACME Lobbying" in claims[0]["text"]
        assert claims[0]["source_url"] == "https://lda.senate.gov/"
        assert claims[0]["confidence"] == "high"

    def test_lobbyist_no_match(self):
        """Non-matching lobbyist name returns empty list."""
        lobbyists = [
            {"first_name": "Alice", "last_name": "Smith", "registrant": {"name": "ACME Lobbying"}},
        ]
        claims = claims_from_lobbying(lobbyists=lobbyists, person_name="John Doe")
        assert claims == []

    def test_filing_claims(self):
        """Filing generates claim with registrant, client, year, income, and issues."""
        filings = [{
            "client": {"name": "Big Corp"},
            "registrant": {"name": "ACME Lobbying"},
            "filing_year": 2025,
            "income": "120000",
            "lobbying_activities": [{"general_issue_code_display": "Trade"}],
            "filing_document_url": "https://lda.senate.gov/filings/abc",
        }]
        claims = claims_from_lobbying(filings=filings)

        assert len(claims) == 1
        text = claims[0]["text"]
        assert "ACME Lobbying" in text
        assert "Big Corp" in text
        assert "2025" in text
        assert "120,000" in text
        assert "Trade" in text

    def test_filing_with_document_url(self):
        """Filing source_url uses filing_document_url when available."""
        filings = [{
            "client": {"name": "Big Corp"},
            "registrant": {"name": "ACME Lobbying"},
            "filing_year": 2025,
            "income": "0",
            "lobbying_activities": [],
            "filing_document_url": "https://lda.senate.gov/filings/abc",
        }]
        claims = claims_from_lobbying(filings=filings)

        assert len(claims) == 1
        assert claims[0]["source_url"] == "https://lda.senate.gov/filings/abc"

    def test_empty_lobbyists(self):
        """None lobbyists returns empty list."""
        claims = claims_from_lobbying(lobbyists=None, person_name="John Doe")
        assert claims == []

    def test_empty_filings(self):
        """None filings produces no filing claims."""
        claims = claims_from_lobbying(filings=None, person_name="John Doe")
        assert claims == []

    def test_both_lobbyists_and_filings(self):
        """Passing both lobbyists and filings returns combined claims."""
        lobbyists = [
            {"first_name": "John", "last_name": "Doe", "registrant": {"name": "ACME Lobbying"}},
        ]
        filings = [{
            "client": {"name": "Big Corp"},
            "registrant": {"name": "ACME Lobbying"},
            "filing_year": 2025,
            "income": "120000",
            "lobbying_activities": [{"general_issue_code_display": "Trade"}],
            "filing_document_url": "https://lda.senate.gov/filings/abc",
        }]
        claims = claims_from_lobbying(lobbyists=lobbyists, filings=filings, person_name="John Doe")

        assert len(claims) == 2
        assert "registered lobbyist" in claims[0]["text"]
        assert "lobbied on behalf of" in claims[1]["text"]


class TestClaimsFromFinra:
    """Tests for claims_from_finra()."""

    def _make_individual(self, **overrides):
        """Helper to build a FINRA individual dict with sensible defaults."""
        base = {
            "ind_source_id": "12345",
            "ind_firstname": "John",
            "ind_lastname": "Doe",
            "ind_bc_scope": "Inactive",
            "ind_ia_scope": "Inactive",
            "ind_bc_disclosure_fl": "N",
            "ind_current_employments": [{"firm_name": "Big Corp Securities"}],
        }
        base.update(overrides)
        return base

    def test_active_broker(self):
        """Active broker-dealer generates registration claim with firm name."""
        ind = self._make_individual(ind_bc_scope="Active")
        claims = claims_from_finra([ind], person_name="John Doe")

        assert len(claims) >= 1
        assert "registered broker-dealer" in claims[0]["text"]
        assert "Big Corp Securities" in claims[0]["text"]

    def test_active_advisor(self):
        """Active investment advisor generates advisor claim."""
        ind = self._make_individual(ind_ia_scope="Active")
        claims = claims_from_finra([ind], person_name="John Doe")

        assert len(claims) >= 1
        assert "registered investment advisor" in claims[0]["text"]

    def test_both_active(self):
        """Both active scopes produces combined registration claim."""
        ind = self._make_individual(ind_bc_scope="Active", ind_ia_scope="Active")
        claims = claims_from_finra([ind], person_name="John Doe")

        assert len(claims) >= 1
        assert "registered broker-dealer" in claims[0]["text"]
        assert "registered investment advisor" in claims[0]["text"]

    def test_disclosure_flag(self):
        """Disclosure flag Y generates disclosure claim."""
        ind = self._make_individual(ind_bc_scope="Active", ind_bc_disclosure_fl="Y")
        claims = claims_from_finra([ind], person_name="John Doe")

        disclosure_claims = [c for c in claims if "disclosure" in c["text"].lower()]
        assert len(disclosure_claims) == 1
        assert "disclosure events" in disclosure_claims[0]["text"]

    def test_name_mismatch(self):
        """Non-matching person_name returns empty list."""
        ind = self._make_individual(ind_bc_scope="Active")
        claims = claims_from_finra([ind], person_name="Jane Smith")
        assert claims == []

    def test_none_input(self):
        """None individuals returns empty list."""
        claims = claims_from_finra(None, person_name="John Doe")
        assert claims == []

    def test_empty_list(self):
        """Empty list returns empty list."""
        claims = claims_from_finra([], person_name="John Doe")
        assert claims == []

    def test_source_url_has_source_id(self):
        """Source URL contains the individual's source ID."""
        ind = self._make_individual(ind_source_id="99887", ind_bc_scope="Active")
        claims = claims_from_finra([ind], person_name="John Doe")

        assert len(claims) >= 1
        assert "99887" in claims[0]["source_url"]
