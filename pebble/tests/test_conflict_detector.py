"""Tests for claim conflict detection."""

import pytest

from pebble.clusters.conflict_detector import detect_conflicts, _normalize_org


class TestNormalizeOrg:

    def test_strips_suffix(self):
        assert _normalize_org("Acme Corp.") == _normalize_org("Acme Corporation")

    def test_case_insensitive(self):
        assert _normalize_org("ACME") == _normalize_org("acme")

    def test_strips_punctuation(self):
        assert _normalize_org("Good Foundation, Inc.") == _normalize_org("Good Foundation")

    def test_empty_string(self):
        assert _normalize_org("") == ""


class TestRoleConflicts:

    def test_different_titles_same_org(self):
        claims = [
            {"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia — verify current status)"},
            {"text": "Jane Doe is CFO at Acme Corp (2023 Form 990)"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        role_conflicts = [c for c in conflicts if c["type"] == "role"]
        assert len(role_conflicts) == 1
        assert "CEO" in role_conflicts[0]["description"]
        assert "CFO" in role_conflicts[0]["description"]

    def test_same_title_no_conflict(self):
        claims = [
            {"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia — verify current status)"},
            {"text": "Jane Doe is CEO at Acme Corp (2023 Form 990)"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        role_conflicts = [c for c in conflicts if c["type"] == "role"]
        assert len(role_conflicts) == 0

    def test_different_orgs_no_conflict(self):
        claims = [
            {"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia)"},
            {"text": "Jane Doe is Director at Other Inc (2023 Form 990)"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        role_conflicts = [c for c in conflicts if c["type"] == "role"]
        assert len(role_conflicts) == 0

    def test_former_title_not_flagged_as_role_conflict(self):
        claims = [
            {"text": "Jane Doe served as CEO at Acme Corp"},
            {"text": "Jane Doe is CFO at Acme Corp (2023 Form 990)"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        role_conflicts = [c for c in conflicts if c["type"] == "role"]
        # "served as" is former, "is" is current — different temporal, so no role conflict
        assert len(role_conflicts) == 0

    def test_propublica_officer_pattern(self):
        """Test the 'was listed as' pattern from propublica_officers with year."""
        claims = [
            {"text": "Jane Doe was listed as President at Good Foundation in the 2023 Form 990"},
            {"text": "Jane Doe is Executive Director at Good Foundation (2024 Form 990)"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        role_conflicts = [c for c in conflicts if c["type"] == "role"]
        # "was listed as" is former — no role conflict with current
        assert len(role_conflicts) == 0


class TestFinancialConflicts:

    def test_different_revenue_same_year(self):
        claims = [
            {"text": "Acme Foundation reported $5,000,000 in revenue (2023 Form 990)", "data_as_of": "2023"},
            {"text": "Acme Foundation reported $2,000,000 in revenue (2023 Form 990)", "data_as_of": "2023"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        fin_conflicts = [c for c in conflicts if c["type"] == "financial"]
        assert len(fin_conflicts) == 1

    def test_similar_amounts_no_conflict(self):
        claims = [
            {"text": "Acme reported $5,000,000 in revenue (2023 Form 990)", "data_as_of": "2023"},
            {"text": "Acme reported $4,500,000 in revenue (2023 Form 990)", "data_as_of": "2023"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        fin_conflicts = [c for c in conflicts if c["type"] == "financial"]
        assert len(fin_conflicts) == 0  # 10% diff < 20% threshold

    def test_different_years_no_conflict(self):
        claims = [
            {"text": "Acme reported $5,000,000 in revenue (2023 Form 990)", "data_as_of": "2023"},
            {"text": "Acme reported $2,000,000 in revenue (2020 Form 990)", "data_as_of": "2020"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        fin_conflicts = [c for c in conflicts if c["type"] == "financial"]
        assert len(fin_conflicts) == 0


class TestTemporalConflicts:

    def test_current_vs_former_same_role(self):
        claims = [
            {"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia)", "temporal_status": "current"},
            {"text": "Jane Doe served as CEO at Acme Corp", "temporal_status": "former"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        temp_conflicts = [c for c in conflicts if c["type"] == "temporal"]
        assert len(temp_conflicts) == 1

    def test_unknown_temporal_no_conflict(self):
        claims = [
            {"text": "Jane Doe has served as CEO at Acme Corp", "temporal_status": "unknown"},
            {"text": "Jane Doe served as CEO at Acme Corp", "temporal_status": "former"},
        ]
        conflicts = detect_conflicts(claims, "Jane Doe")
        temp_conflicts = [c for c in conflicts if c["type"] == "temporal"]
        assert len(temp_conflicts) == 0


class TestEdgeCases:

    def test_empty_claims(self):
        assert detect_conflicts([], "Jane Doe") == []

    def test_single_claim(self):
        claims = [{"text": "Jane Doe serves as CEO at Acme Corp (per Wikipedia)"}]
        assert detect_conflicts(claims, "Jane Doe") == []

    def test_claims_without_text(self):
        claims = [{"source_url": "http://example.com"}, {}]
        assert detect_conflicts(claims, "Jane Doe") == []
