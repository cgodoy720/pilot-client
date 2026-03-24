"""Tests for FINRA BrokerCheck data source module."""

from unittest.mock import patch, call

import pytest

from pebble.data_sources.finra import (
    search_individual,
    search_firm,
    get_broker_detail,
)


# ---------------------------------------------------------------------------
# Fixtures — reusable ES response shapes
# ---------------------------------------------------------------------------

INDIVIDUAL_ES_RESPONSE = {
    "hits": {
        "hits": [
            {
                "_source": {
                    "ind_source_id": "12345",
                    "ind_firstname": "John",
                    "ind_lastname": "Doe",
                    "ind_bc_scope": "Active",
                    "ind_ia_scope": "Inactive",
                    "ind_bc_disclosure_fl": "N",
                    "ind_current_employments": [
                        {"firm_name": "Big Corp Securities"}
                    ],
                }
            }
        ]
    }
}

FIRM_ES_RESPONSE = {
    "hits": {
        "hits": [
            {
                "_source": {
                    "firm_source_id": "99999",
                    "firm_name": "Acme Financial LLC",
                    "firm_bc_scope": "Active",
                }
            }
        ]
    }
}

BROKER_DETAIL = {
    "ind_source_id": "12345",
    "ind_firstname": "John",
    "ind_lastname": "Doe",
    "registrations": [{"firm_name": "Big Corp Securities"}],
    "disclosures": [],
}


# ---------------------------------------------------------------------------
# TestSearchIndividual
# ---------------------------------------------------------------------------


class TestSearchIndividual:
    """Tests for search_individual()."""

    @patch("pebble.data_sources.finra.set_cached")
    @patch("pebble.data_sources.finra._get", return_value=INDIVIDUAL_ES_RESPONSE)
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_basic_search(self, mock_get_cached, mock_get, mock_set_cached):
        """Cache miss triggers API call and caches _source dicts."""
        results = search_individual("John Doe")

        assert len(results) == 1
        assert results[0]["ind_source_id"] == "12345"
        assert results[0]["ind_firstname"] == "John"
        mock_set_cached.assert_called_once_with(
            "finra_individual", "john doe",
            {"results": results},
            ttl_seconds=604_800,
        )

    @patch("pebble.data_sources.finra._get")
    @patch("pebble.data_sources.finra.get_cached")
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns stored results without calling the API."""
        mock_get_cached.return_value = {"results": [{"ind_firstname": "John"}]}

        results = search_individual("John Doe")
        assert results == [{"ind_firstname": "John"}]
        mock_get.assert_not_called()

    @patch("pebble.data_sources.finra.set_cached")
    @patch("pebble.data_sources.finra._get", return_value={"hits": {"hits": []}})
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_empty_results(self, mock_get_cached, mock_get, mock_set_cached):
        """Empty ES hits returns empty list."""
        results = search_individual("Nobody Real")
        assert results == []

    @patch("pebble.data_sources.finra._get", return_value=None)
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_api_error_returns_empty(self, mock_get_cached, mock_get):
        """API failure (None response) returns empty list."""
        results = search_individual("John Doe")
        assert results == []

    @patch("pebble.data_sources.finra._get")
    def test_empty_name_returns_empty(self, mock_get):
        """Empty name short-circuits without calling API."""
        results = search_individual("")
        assert results == []
        mock_get.assert_not_called()


# ---------------------------------------------------------------------------
# TestSearchFirm
# ---------------------------------------------------------------------------


class TestSearchFirm:
    """Tests for search_firm()."""

    @patch("pebble.data_sources.finra.set_cached")
    @patch("pebble.data_sources.finra._get", return_value=FIRM_ES_RESPONSE)
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_basic_search(self, mock_get_cached, mock_get, mock_set_cached):
        """Cache miss triggers API call and returns _source dicts."""
        results = search_firm("Acme Financial")

        assert len(results) == 1
        assert results[0]["firm_name"] == "Acme Financial LLC"
        mock_set_cached.assert_called_once_with(
            "finra_firm", "acme financial",
            {"results": results},
            ttl_seconds=604_800,
        )

    @patch("pebble.data_sources.finra._get")
    @patch("pebble.data_sources.finra.get_cached")
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns stored results without calling the API."""
        mock_get_cached.return_value = {"results": [{"firm_name": "Acme Financial LLC"}]}

        results = search_firm("Acme Financial")
        assert results == [{"firm_name": "Acme Financial LLC"}]
        mock_get.assert_not_called()


# ---------------------------------------------------------------------------
# TestGetBrokerDetail
# ---------------------------------------------------------------------------


class TestGetBrokerDetail:
    """Tests for get_broker_detail()."""

    @patch("pebble.data_sources.finra.set_cached")
    @patch("pebble.data_sources.finra._get", return_value=BROKER_DETAIL)
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_basic_detail(self, mock_get_cached, mock_get, mock_set_cached):
        """Cache miss fetches detail and caches it."""
        result = get_broker_detail("12345")

        assert result["ind_source_id"] == "12345"
        assert result["ind_firstname"] == "John"
        mock_set_cached.assert_called_once_with(
            "finra_detail", "12345",
            BROKER_DETAIL,
            ttl_seconds=604_800,
        )

    @patch("pebble.data_sources.finra._get")
    @patch("pebble.data_sources.finra.get_cached", return_value=BROKER_DETAIL)
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns stored detail without calling the API."""
        result = get_broker_detail("12345")

        assert result == BROKER_DETAIL
        mock_get.assert_not_called()

    @patch("pebble.data_sources.finra._get", return_value=None)
    @patch("pebble.data_sources.finra.get_cached", return_value=None)
    def test_not_found(self, mock_get_cached, mock_get):
        """API returning None yields None."""
        result = get_broker_detail("00000")
        assert result is None

    @patch("pebble.data_sources.finra._get")
    def test_empty_source_id(self, mock_get):
        """Empty source_id short-circuits without calling API."""
        result = get_broker_detail("")
        assert result is None
        mock_get.assert_not_called()
