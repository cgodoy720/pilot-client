"""Tests for web search: Serper.dev backend, merge logic, and integration."""

from unittest.mock import patch, MagicMock

import httpx
import pytest

from pebble.data_sources.serper_search import search_serper
from pebble.data_sources.web_search import _merge_results, search_web, search_person


# ---------------------------------------------------------------------------
# Fixtures — reusable response shapes
# ---------------------------------------------------------------------------

SERPER_API_RESPONSE = {
    "organic": [
        {
            "title": "Jane Smith - Goldman Sachs",
            "link": "https://www.goldmansachs.com/about/people/jane-smith",
            "snippet": "Jane Smith is a Managing Director at Goldman Sachs.",
            "position": 1,
        },
        {
            "title": "Jane Smith Board Member",
            "link": "https://example.org/board/jane-smith",
            "snippet": "Jane Smith serves on the board of directors.",
            "position": 2,
        },
    ]
}

CSE_RESULT_A = {
    "title": "Jane Smith - Chronicle of Philanthropy",
    "link": "https://www.philanthropy.com/article/jane-smith",
    "snippet": "Major gift from Jane Smith to education nonprofit.",
    "display_link": "www.philanthropy.com",
}

CSE_RESULT_B = {
    "title": "Jane Smith Profile",
    "link": "https://www.goldmansachs.com/about/people/jane-smith",
    "snippet": "Jane Smith is a Managing Director.",
    "display_link": "www.goldmansachs.com",
}

SERPER_RESULT_A = {
    "title": "Jane Smith - Goldman Sachs",
    "link": "https://www.goldmansachs.com/about/people/jane-smith",
    "snippet": "Jane Smith is a Managing Director at Goldman Sachs.",
    "display_link": "www.goldmansachs.com",
}

SERPER_RESULT_B = {
    "title": "Jane Smith Board Member",
    "link": "https://example.org/board/jane-smith",
    "snippet": "Jane Smith serves on the board of directors.",
    "display_link": "example.org",
}


# ---------------------------------------------------------------------------
# TestSearchSerper
# ---------------------------------------------------------------------------


class TestSearchSerper:
    """Tests for search_serper() — the Serper.dev backend."""

    @patch("pebble.data_sources.serper_search._API_KEY", "test-key")
    @patch("pebble.data_sources.serper_search.httpx.post")
    def test_successful_search(self, mock_post):
        """Successful API call returns formatted results with display_link."""
        mock_resp = MagicMock()
        mock_resp.json.return_value = SERPER_API_RESPONSE
        mock_resp.raise_for_status = MagicMock()
        mock_post.return_value = mock_resp

        results = search_serper("Jane Smith Goldman Sachs")

        assert len(results) == 2
        assert results[0]["title"] == "Jane Smith - Goldman Sachs"
        assert results[0]["link"] == "https://www.goldmansachs.com/about/people/jane-smith"
        assert results[0]["snippet"] == "Jane Smith is a Managing Director at Goldman Sachs."
        assert results[0]["display_link"] == "www.goldmansachs.com"
        assert results[1]["display_link"] == "example.org"

        mock_post.assert_called_once_with(
            "https://google.serper.dev/search",
            headers={"X-API-KEY": "test-key", "Content-Type": "application/json"},
            json={"q": "Jane Smith Goldman Sachs", "num": 10},
            timeout=10.0,
        )

    @patch("pebble.data_sources.serper_search._API_KEY", "test-key")
    @patch("pebble.data_sources.serper_search.httpx.post")
    def test_timeout_returns_empty(self, mock_post):
        """Timeout returns empty list without raising."""
        mock_post.side_effect = httpx.TimeoutException("timed out")

        results = search_serper("Jane Smith")
        assert results == []

    @patch("pebble.data_sources.serper_search._API_KEY", "test-key")
    @patch("pebble.data_sources.serper_search.httpx.post")
    def test_http_error_returns_empty(self, mock_post):
        """HTTP error returns empty list without raising."""
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        mock_resp.raise_for_status.side_effect = httpx.HTTPStatusError(
            "rate limited", request=MagicMock(), response=mock_resp,
        )
        mock_post.return_value = mock_resp

        results = search_serper("Jane Smith")
        assert results == []

    @patch("pebble.data_sources.serper_search._API_KEY", "")
    def test_missing_api_key_returns_empty(self):
        """Missing API key returns empty list with warning."""
        results = search_serper("Jane Smith")
        assert results == []


# ---------------------------------------------------------------------------
# TestMergeResults
# ---------------------------------------------------------------------------


class TestMergeResults:
    """Tests for _merge_results() — deduplication and ordering."""

    def test_merge_with_overlap(self):
        """CSE + Serper with overlapping link → deduplicated, CSE first."""
        cse = [CSE_RESULT_A, CSE_RESULT_B]
        serper = [SERPER_RESULT_A, SERPER_RESULT_B]

        merged = _merge_results(cse, serper)

        assert len(merged) == 3  # A unique, B duplicate (Goldman link), B' unique
        links = [r["link"] for r in merged]
        assert links[0] == CSE_RESULT_A["link"]  # CSE first
        assert links[1] == CSE_RESULT_B["link"]  # CSE version of Goldman link
        assert links[2] == SERPER_RESULT_B["link"]  # Serper-only result

    def test_trailing_slash_dedup(self):
        """Trailing slash variants are treated as the same URL."""
        cse = [{"title": "A", "link": "https://example.com/page/", "snippet": "a", "display_link": "example.com"}]
        serper = [{"title": "B", "link": "https://example.com/page", "snippet": "b", "display_link": "example.com"}]

        merged = _merge_results(cse, serper)
        assert len(merged) == 1
        assert merged[0]["title"] == "A"  # CSE version wins

    def test_cse_empty_returns_serper(self):
        """When CSE is empty, Serper results are returned."""
        merged = _merge_results([], [SERPER_RESULT_A, SERPER_RESULT_B])
        assert len(merged) == 2

    def test_both_empty(self):
        """Both empty → empty list."""
        assert _merge_results([], []) == []

    def test_cap_at_num_results(self):
        """Merged results are capped at num_results."""
        many = [
            {"title": f"R{i}", "link": f"https://example.com/{i}", "snippet": "", "display_link": "example.com"}
            for i in range(10)
        ]
        merged = _merge_results(many, [], num_results=3)
        assert len(merged) == 3


# ---------------------------------------------------------------------------
# TestSearchWebIntegration
# ---------------------------------------------------------------------------


class TestSearchWebIntegration:
    """Tests for search_web() — both backends mocked."""

    @patch("pebble.data_sources.web_search.search_serper")
    @patch("pebble.data_sources.web_search._search_cse")
    def test_both_succeed(self, mock_cse, mock_serper):
        """Both backends succeed → merged results."""
        mock_cse.return_value = [CSE_RESULT_A]
        mock_serper.return_value = [SERPER_RESULT_B]

        results = search_web("Jane Smith")
        assert len(results) == 2
        assert results[0] == CSE_RESULT_A
        assert results[1] == SERPER_RESULT_B

    @patch("pebble.data_sources.web_search.search_serper")
    @patch("pebble.data_sources.web_search._search_cse")
    def test_cse_fails_serper_succeeds(self, mock_cse, mock_serper):
        """CSE fails → Serper results only."""
        mock_cse.return_value = []
        mock_serper.return_value = [SERPER_RESULT_A]

        results = search_web("Jane Smith")
        assert len(results) == 1
        assert results[0] == SERPER_RESULT_A

    @patch("pebble.data_sources.web_search.search_serper")
    @patch("pebble.data_sources.web_search._search_cse")
    def test_serper_fails_cse_succeeds(self, mock_cse, mock_serper):
        """Serper fails → CSE results only."""
        mock_cse.return_value = [CSE_RESULT_A]
        mock_serper.return_value = []

        results = search_web("Jane Smith")
        assert len(results) == 1
        assert results[0] == CSE_RESULT_A

    @patch("pebble.data_sources.web_search.search_serper")
    @patch("pebble.data_sources.web_search._search_cse")
    def test_both_fail(self, mock_cse, mock_serper):
        """Both fail → empty list."""
        mock_cse.return_value = []
        mock_serper.return_value = []

        results = search_web("Jane Smith")
        assert results == []


# ---------------------------------------------------------------------------
# TestSearchPerson
# ---------------------------------------------------------------------------


class TestSearchPerson:
    """Tests for search_person() — query construction unchanged."""

    @patch("pebble.data_sources.web_search.search_web")
    def test_general_query(self, mock_search_web):
        """General query includes quoted name and org."""
        mock_search_web.return_value = [CSE_RESULT_A]

        results = search_person("Jane Smith", "Goldman Sachs")
        mock_search_web.assert_called_once_with('"Jane Smith" Goldman Sachs')
        assert results == [CSE_RESULT_A]

    @patch("pebble.data_sources.web_search.search_web")
    def test_boards_focus(self, mock_search_web):
        """Boards focus adds board-related terms."""
        mock_search_web.return_value = []

        search_person("Jane Smith", "Goldman Sachs", focus="boards")
        call_query = mock_search_web.call_args[0][0]
        assert "board OR director OR trustee OR advisory" in call_query
        assert '"Goldman Sachs"' in call_query

    @patch("pebble.data_sources.web_search.search_web")
    def test_empty_name_returns_empty(self, mock_search_web):
        """Empty person name short-circuits without searching."""
        results = search_person("")
        assert results == []
        mock_search_web.assert_not_called()
