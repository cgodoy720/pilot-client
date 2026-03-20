"""API response cache — SQLite-backed with TTL expiration.

Avoids duplicate API calls on re-research and helps stay within free-tier limits.
Uses the same DB file as the rest of Pebble (pebble.db).
"""

import json
import sqlite3
from datetime import datetime, timedelta, timezone

from .db import DB_PATH


def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def get_cached(source: str, key: str) -> dict | None:
    """Return cached response if it exists and has not expired, else None."""
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT response_json, expires_at FROM api_cache WHERE source = ? AND lookup_key = ?",
            (source, key),
        ).fetchone()
        if not row:
            return None
        expires_at = row["expires_at"]
        if expires_at:
            now = datetime.now(timezone.utc).isoformat()
            if now > expires_at:
                # Expired — delete and return None
                conn.execute(
                    "DELETE FROM api_cache WHERE source = ? AND lookup_key = ?",
                    (source, key),
                )
                conn.commit()
                return None
        return json.loads(row["response_json"])
    finally:
        conn.close()


def set_cached(source: str, key: str, data: dict, ttl_seconds: int = 86400) -> None:
    """Store an API response with a TTL (default 24 hours)."""
    now = datetime.now(timezone.utc)
    created_at = now.isoformat()
    expires_at = (now + timedelta(seconds=ttl_seconds)).isoformat()
    response_json = json.dumps(data, default=str)

    conn = _get_conn()
    try:
        conn.execute(
            """INSERT OR REPLACE INTO api_cache (source, lookup_key, response_json, created_at, expires_at)
               VALUES (?, ?, ?, ?, ?)""",
            (source, key, response_json, created_at, expires_at),
        )
        conn.commit()
    finally:
        conn.close()


def clear_expired() -> int:
    """Delete all expired cache entries. Returns number of rows deleted."""
    now = datetime.now(timezone.utc).isoformat()
    conn = _get_conn()
    try:
        cursor = conn.execute(
            "DELETE FROM api_cache WHERE expires_at IS NOT NULL AND expires_at < ?",
            (now,),
        )
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()
