"""API response cache — sync PostgreSQL via psycopg2.

Stays synchronous intentionally: data sources (finra, lda, propublica) run
in thread pool via asyncio.to_thread().  Using psycopg2 preserves the
lock-free concurrency architecture documented in research_context.py.

Table: bedrock.pebble_api_cache (managed by Bedrock init.sql).
"""

import json
import logging
import os

import psycopg2
import psycopg2.extras

logger = logging.getLogger(__name__)


def _get_conn():
    """Return a psycopg2 connection to the bedrock database."""
    return psycopg2.connect(
        os.getenv("DATABASE_URL", "postgresql://bedrock@localhost:5432/bedrock"),
        cursor_factory=psycopg2.extras.RealDictCursor,
    )


def get_cached(source: str, key: str) -> dict | None:
    """Sync cache read.  Returns parsed JSON or None if miss/expired."""
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT response_json FROM bedrock.pebble_api_cache "
                "WHERE source = %s AND lookup_key = %s AND expires_at > now()",
                (source, key),
            )
            row = cur.fetchone()
            if row:
                return json.loads(row["response_json"])
        return None
    finally:
        conn.close()


def set_cached(
    source: str, key: str, data: dict, ttl_seconds: int = 86400,
) -> None:
    """Sync cache write with TTL.  Upserts on (source, lookup_key)."""
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO bedrock.pebble_api_cache
                   (source, lookup_key, response_json, created_at, expires_at)
                   VALUES (%s, %s, %s, now(),
                           now() + %s * INTERVAL '1 second')
                   ON CONFLICT (source, lookup_key) DO UPDATE SET
                       response_json = EXCLUDED.response_json,
                       created_at = EXCLUDED.created_at,
                       expires_at = EXCLUDED.expires_at""",
                (source, key, json.dumps(data), ttl_seconds),
            )
        conn.commit()
    finally:
        conn.close()


def clear_expired() -> int:
    """Delete expired cache entries.  Returns count removed."""
    conn = _get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM bedrock.pebble_api_cache WHERE expires_at <= now()",
            )
            count = cur.rowcount
        conn.commit()
        return count
    finally:
        conn.close()
