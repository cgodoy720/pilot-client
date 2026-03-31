"""PostgreSQL connection pool for the Projects backend."""

import os
import logging
from pathlib import Path
from urllib.parse import urlparse

import asyncpg
from fastapi import HTTPException

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None
_db_init_status: str = "not_started"

DB_DIR = Path(__file__).parent / "db"


def _log_connection_target(url: str) -> None:
    """Log the database connection target with password masked."""
    try:
        parsed = urlparse(url)
        masked = f"{parsed.scheme}://{parsed.username}:****@{parsed.hostname}:{parsed.port}{parsed.path}"
        logger.info(f"Connecting to: {masked}")
    except Exception:
        logger.info("Connecting to PostgreSQL (URL parse failed)")


async def init_db() -> None:
    """Create connection pool and run init.sql if tables don't exist.

    Pool creation and schema initialization are independent — if the pool
    connects but init.sql fails (permissions, already-applied DDL, etc.),
    the pool stays alive for queries.
    """
    global _pool, _db_init_status
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bedrock@localhost:5432/bedrock")

    _log_connection_target(DATABASE_URL)

    # Step 1: Create connection pool
    try:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        logger.info("PostgreSQL pool created")
    except Exception as e:
        logger.error(f"PostgreSQL pool creation failed: {e}")
        _pool = None
        _db_init_status = "disconnected"
        return

    # Step 2: Run schema init (pool stays alive even if this fails)
    try:
        init_sql = DB_DIR / "init.sql"
        if init_sql.exists():
            async with _pool.acquire() as conn:
                await conn.execute(init_sql.read_text())
            logger.info("Database schema initialized")
    except Exception as e:
        logger.warning(f"Schema init failed (pool kept alive): {e}")
        _db_init_status = "init_failed"

    # Step 3: Run seed data (idempotent — ON CONFLICT DO NOTHING)
    try:
        seed_sql = DB_DIR / "seed.sql"
        if seed_sql.exists():
            async with _pool.acquire() as conn:
                await conn.execute(seed_sql.read_text())
            logger.info("Seed data applied")
    except Exception as e:
        logger.warning(f"Seed data failed (pool kept alive): {e}")

    if _db_init_status != "init_failed":
        _db_init_status = "connected"


async def close_db() -> None:
    """Shut down the connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("PostgreSQL pool closed")


def get_pool() -> asyncpg.Pool:
    """Return the connection pool (for services that need direct access)."""
    if _pool is None:
        raise HTTPException(status_code=503, detail="Database not available — check server logs")
    return _pool


async def get_db() -> asyncpg.Connection:
    """FastAPI dependency — yields a connection from the pool."""
    if _pool is None:
        raise HTTPException(status_code=503, detail="Database not available — check server logs")
    async with _pool.acquire() as conn:
        yield conn


def get_db_status() -> str:
    """Return current database connection status for health reporting."""
    return _db_init_status
