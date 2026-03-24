"""Tests for the LDA (Lobbying Disclosure Act) data source module."""

from unittest.mock import patch, call

from pebble.data_sources.lda import (
    search_lobbyists,
    search_filings,
    search_contributions,
)

MOCK_LDA = "pebble.data_sources.lda"


class TestSearchLobbyists:
    """Tests for search_lobbyists()."""

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_basic_search(self, mock_get_cached, mock_get, mock_set_cached):
        """Fetches lobbyists from API and caches the results."""
        mock_get.return_value = {
            "results": [{"first_name": "John", "last_name": "Doe",
                         "registrant": {"name": "ACME Lobbying"}}],
            "next": None,
        }

        results = search_lobbyists("John Doe")

        assert len(results) == 1
        assert results[0]["last_name"] == "Doe"
        mock_set_cached.assert_called_once_with(
            "lda", "lobbyists:john doe",
            {"results": results},
            ttl_seconds=604_800,
        )

    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached")
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns cached data without calling the API."""
        mock_get_cached.return_value = {"results": [{"first_name": "Jane"}]}

        results = search_lobbyists("Jane")

        assert results == [{"first_name": "Jane"}]
        mock_get.assert_not_called()

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get_url")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_pagination_follows_next(self, mock_get_cached, mock_get,
                                     mock_get_url, mock_set_cached):
        """Pagination follows next URL to collect results from multiple pages."""
        mock_get.return_value = {
            "results": [{"first_name": "Page1"}],
            "next": "http://lda.senate.gov/api/v1/lobbyists/?page=2",
        }
        mock_get_url.return_value = {
            "results": [{"first_name": "Page2"}],
            "next": None,
        }

        results = search_lobbyists("Test", max_pages=2)

        assert len(results) == 2
        mock_get_url.assert_called_once()

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get_url")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_pagination_caps_at_max_pages(self, mock_get_cached, mock_get,
                                          mock_get_url, mock_set_cached):
        """Pagination stops after max_pages even if next URL exists."""
        mock_get.return_value = {
            "results": [{"first_name": "Only"}],
            "next": "http://lda.senate.gov/api/v1/lobbyists/?page=2",
        }

        results = search_lobbyists("Test", max_pages=1)

        assert len(results) == 1
        mock_get_url.assert_not_called()

    @patch(f"{MOCK_LDA}._get", return_value=None)
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_api_error_returns_empty(self, mock_get_cached, mock_get):
        """API failure returns empty list."""
        assert search_lobbyists("Nobody") == []

    @patch(f"{MOCK_LDA}._get")
    def test_empty_name_returns_empty(self, mock_get):
        """Empty name short-circuits to empty list without API call."""
        assert search_lobbyists("") == []
        mock_get.assert_not_called()


class TestSearchFilings:
    """Tests for search_filings()."""

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_basic_search(self, mock_get_cached, mock_get, mock_set_cached):
        """Fetches filings from API and returns results."""
        mock_get.return_value = {
            "results": [{"filing_uuid": "abc-123", "filing_year": 2025,
                         "client": {"name": "ACME Corp"}}],
            "next": None,
        }

        results = search_filings(client_name="ACME Corp", filing_year=2025)

        assert len(results) == 1
        assert results[0]["filing_uuid"] == "abc-123"

    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached")
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns cached filings without API call."""
        mock_get_cached.return_value = {
            "results": [{"filing_uuid": "cached-1"}],
        }

        results = search_filings(client_name="Test")

        assert results == [{"filing_uuid": "cached-1"}]
        mock_get.assert_not_called()

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_cache_key_includes_params(self, mock_get_cached, mock_get,
                                       mock_set_cached):
        """Cache key incorporates client, registrant, and year."""
        mock_get.return_value = {"results": [], "next": None}

        search_filings(client_name="Acme", registrant_name="Lobby Inc",
                       filing_year=2024)

        mock_get_cached.assert_called_once_with("lda", "filings:Acme:Lobby Inc:2024")


class TestSearchContributions:
    """Tests for search_contributions()."""

    @patch(f"{MOCK_LDA}.set_cached")
    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached", return_value=None)
    def test_basic_search(self, mock_get_cached, mock_get, mock_set_cached):
        """Fetches contributions from API and returns results."""
        mock_get.return_value = {
            "results": [{"lobbyist_name": "John Doe", "amount": 5000}],
            "next": None,
        }

        results = search_contributions(lobbyist_name="John Doe")

        assert len(results) == 1
        assert results[0]["amount"] == 5000

    @patch(f"{MOCK_LDA}._get")
    @patch(f"{MOCK_LDA}.get_cached")
    def test_cache_hit(self, mock_get_cached, mock_get):
        """Cache hit returns cached contributions without API call."""
        mock_get_cached.return_value = {
            "results": [{"lobbyist_name": "Cached"}],
        }

        results = search_contributions(lobbyist_name="Cached")

        assert results == [{"lobbyist_name": "Cached"}]
        mock_get.assert_not_called()
