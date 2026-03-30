"""Pebble test configuration — ensure imports resolve correctly."""

import os
import sys
from unittest.mock import AsyncMock, MagicMock

import pytest

# Add project root to sys.path so `from pebble.xxx import ...` works
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))


@pytest.fixture
def mock_pg_pool(monkeypatch):
    """Mock asyncpg connection pool for unit tests.

    Returns the mock connection object so tests can configure
    fetchrow/fetch/execute return values.
    """
    pool = MagicMock()
    conn = AsyncMock()

    # Make pool.acquire() work as async context manager
    acm = AsyncMock()
    acm.__aenter__ = AsyncMock(return_value=conn)
    acm.__aexit__ = AsyncMock(return_value=False)
    pool.acquire.return_value = acm

    monkeypatch.setattr("pebble.storage.db._pool", pool)
    return conn
