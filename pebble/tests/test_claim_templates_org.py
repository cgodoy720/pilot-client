"""Tests for claims_from_org_officers (Sprint 4)."""

from pebble.claim_templates import claims_from_org_officers


class TestClaimsFromOrgOfficers:
    """Tests for the org-level officer claim template."""

    def test_basic(self):
        """Generates one claim per officer with correct format."""
        officers = [
            {"name": "Jane Doe", "title": "Executive Director", "compensation": 250000},
            {"name": "John Smith", "title": "Board Chair", "compensation": 0},
        ]
        claims = claims_from_org_officers(officers, "Acme Foundation", ein="123456789", tax_year="2023")

        assert len(claims) == 2

        # First officer
        assert "Jane Doe is Executive Director at Acme Foundation" in claims[0]["text"]
        assert "2023 Form 990" in claims[0]["text"]
        assert "$250,000" in claims[0]["text"]
        assert claims[0]["source_url"] == "https://projects.propublica.org/nonprofits/organizations/123456789"
        assert claims[0]["confidence"] == "high"
        assert claims[0]["origin"] == "template"
        assert claims[0]["source_currency"] == "delayed"

        # Board member with zero comp — no compensation text
        assert "$" not in claims[1]["text"]

    def test_empty_officers(self):
        assert claims_from_org_officers([], "Acme") == []

    def test_empty_org_name(self):
        assert claims_from_org_officers([{"name": "X", "title": "Y"}], "") == []

    def test_officer_without_name_skipped(self):
        officers = [
            {"title": "Ghost", "compensation": 100000},
            {"name": "Real Person", "title": "Director", "compensation": 50000},
        ]
        claims = claims_from_org_officers(officers, "Test Org")
        assert len(claims) == 1
        assert "Real Person" in claims[0]["text"]

    def test_capped_at_max_claims(self):
        """More than MAX_CLAIMS officers → capped at 10."""
        officers = [
            {"name": f"Person {i}", "title": "Director", "compensation": i * 10000}
            for i in range(15)
        ]
        claims = claims_from_org_officers(officers, "Big Org")
        assert len(claims) == 10

    def test_no_ein(self):
        """Missing EIN → empty source_url."""
        officers = [{"name": "Test", "title": "Director"}]
        claims = claims_from_org_officers(officers, "Org")
        assert claims[0]["source_url"] == ""

    def test_no_tax_year(self):
        """Missing tax year → 'IRS Form 990' instead of year."""
        officers = [{"name": "Test", "title": "Director"}]
        claims = claims_from_org_officers(officers, "Org")
        assert "IRS Form 990" in claims[0]["text"]

    def test_none_title_defaults_to_officer(self):
        """title=None should produce 'Officer', not literal 'None' in text."""
        officers = [{"name": "Test Person", "title": None, "compensation": 100000}]
        claims = claims_from_org_officers(officers, "Acme")
        assert "None" not in claims[0]["text"]
        assert "Officer" in claims[0]["text"]

    def test_none_compensation_no_crash(self):
        """compensation=None should not crash or produce '$0'."""
        officers = [{"name": "Test", "title": "Director", "compensation": None}]
        claims = claims_from_org_officers(officers, "Org")
        assert "$" not in claims[0]["text"]
