"""PostgreSQL connection pool for the Projects backend."""

import os
import logging
from pathlib import Path

import asyncpg

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None

DB_DIR = Path(__file__).parent / "db"


async def init_db() -> None:
    """Create connection pool and run init.sql if tables don't exist."""
    global _pool
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://bedrock@localhost:5432/bedrock")

    try:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=10)
        logger.info("PostgreSQL pool created")

        # Run init.sql (idempotent — uses IF NOT EXISTS)
        init_sql = DB_DIR / "init.sql"
        if init_sql.exists():
            async with _pool.acquire() as conn:
                await conn.execute(init_sql.read_text())
            logger.info("Database schema initialized")
    except Exception as e:
        logger.warning(f"PostgreSQL not available: {e}")
        _pool = None


async def close_db() -> None:
    """Shut down the connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("PostgreSQL pool closed")


async def get_db() -> asyncpg.Connection:
    """FastAPI dependency — yields a connection from the pool."""
    if _pool is None:
        raise Exception("Database not available")
    async with _pool.acquire() as conn:
        yield conn
