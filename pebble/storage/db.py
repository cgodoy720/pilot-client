"""PostgreSQL storage for Pebble (asyncpg).

Migrated from SQLite in M11. Tables are managed by Bedrock's init.sql
in the bedrock schema with pebble_ prefix. This module only reads/writes.

Pool-level codecs convert UUID→str and NUMERIC→float automatically so
callers never deal with uuid.UUID or Decimal objects.
"""

import json
import logging
import os
from collections import OrderedDict
from datetime import datetime, timedelta, timezone
from typing import Any

import asyncpg

logger = logging.getLogger(__name__)

_pool: asyncpg.Pool | None = None


# ---------------------------------------------------------------------------
# Pool management
# ---------------------------------------------------------------------------

async def _init_connection(conn: asyncpg.Connection) -> None:
    """Pool-level codecs registered on every new connection.

    UUID→str:   Pebble convention — all IDs are str(uuid4()).
    NUMERIC→float: Pebble cost values are simple floats, not Decimal.
    """
    await conn.set_type_codec(
        "uuid", encoder=str, decoder=str,
        schema="pg_catalog", format="text",
    )
    await conn.set_type_codec(
        "numeric", encoder=str, decoder=float,
        schema="pg_catalog", format="text",
    )


async def init_db() -> None:
    """Create asyncpg connection pool.

    Tables are managed by Bedrock's init.sql — NOT created here.
    Verifies that the expected pebble tables exist as a health check.
    """
    global _pool
    database_url = os.getenv(
        "DATABASE_URL", "postgresql://bedrock@localhost:5432/bedrock",
    )
    _pool = await asyncpg.create_pool(
        database_url, min_size=2, max_size=5, init=_init_connection,
    )
    async with _pool.acquire() as conn:
        count = await conn.fetchval(
            "SELECT COUNT(*) FROM pg_tables "
            "WHERE schemaname = 'bedrock' AND tablename LIKE 'pebble_%'",
        )
        if count < 12:
            logger.warning(
                "Expected 12+ pebble tables, found %d. Run Bedrock init.sql.",
                count,
            )
        else:
            logger.info("Pebble storage connected — %d tables verified", count)


async def close_db() -> None:
    """Gracefully close the connection pool on shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    """Return the connection pool.  Raises if init_db() was not called."""
    if _pool is None:
        raise RuntimeError(
            "Pebble DB pool not initialized — call init_db() first",
        )
    return _pool


# ---------------------------------------------------------------------------
# Harness telemetry
# ---------------------------------------------------------------------------

async def log_harness_outcome(
    agent_name: str,
    outcome: str,
    cost_usd: float | None = None,
    tokens_input: int = 0,
    tokens_output: int = 0,
    attempts: int = 0,
    elapsed_seconds: float = 0,
    error: str | None = None,
    prospect_id: str | None = None,
    user_email: str | None = None,
) -> None:
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_harness_log
               (agent_name, outcome, cost_usd, tokens_input, tokens_output,
                attempts, elapsed_seconds, error, prospect_id, user_email)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)""",
            agent_name, outcome, cost_usd, tokens_input, tokens_output,
            attempts, elapsed_seconds, error, prospect_id, user_email,
        )


async def get_daily_usage(user_email: str, date_str: str) -> dict | None:
    """Get daily cost usage for a user.  Returns None if no usage recorded."""
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT total_cost_usd, query_count "
            "FROM bedrock.pebble_daily_usage "
            "WHERE user_email = $1 AND date = $2",
            user_email, date_str,
        )
        return dict(row) if row else None


async def increment_daily_usage(
    user_email: str, date_str: str, cost: float,
) -> None:
    """Atomically increment daily cost and query count for a user."""
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_daily_usage
               (user_email, date, total_cost_usd, query_count)
               VALUES ($1, $2, $3, 1)
               ON CONFLICT (user_email, date) DO UPDATE SET
                   total_cost_usd = bedrock.pebble_daily_usage.total_cost_usd
                                    + EXCLUDED.total_cost_usd,
                   query_count = bedrock.pebble_daily_usage.query_count + 1""",
            user_email, date_str, cost,
        )


# ---------------------------------------------------------------------------
# Profiles
# ---------------------------------------------------------------------------

async def save_profile(
    contact_id: str, profile: dict, cost_usd: float | None = None,
) -> None:
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_profiles
               (contact_id, profile_json, cost_usd)
               VALUES ($1, $2, $3)
               ON CONFLICT (contact_id) DO UPDATE SET
                   profile_json = EXCLUDED.profile_json,
                   cost_usd = EXCLUDED.cost_usd""",
            contact_id, json.dumps(profile), cost_usd,
        )


async def get_profile(contact_id: str) -> dict | None:
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(
            "SELECT profile_json FROM bedrock.pebble_profiles "
            "WHERE contact_id = $1",
            contact_id,
        )
        if row:
            return json.loads(row["profile_json"])
        return None


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

async def save_feedback(
    claim_id: str,
    correct: bool,
    text: str | None = None,
    contact_id: str | None = None,
    user_id: str | None = None,
) -> None:
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_feedback
               (claim_id, correct, text, contact_id, user_id)
               VALUES ($1, $2, $3, $4, $5)""",
            claim_id, correct, text, contact_id, user_id,
        )


async def get_feedback_for_contact(contact_id: str) -> list[dict]:
    """Return all feedback rows for a contact, newest first."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, claim_id, correct, text, contact_id, user_id, created_at "
            "FROM bedrock.pebble_feedback "
            "WHERE contact_id = $1 ORDER BY created_at DESC",
            contact_id,
        )
        return [dict(r) for r in rows]


async def get_feedback_trends(days: int = 30) -> dict:
    """Return feedback trend stats over the last N days."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    async with get_pool().acquire() as conn:
        # Overall counts
        row = await conn.fetchrow(
            "SELECT COUNT(*) AS total, "
            "SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_count, "
            "SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END) AS incorrect_count "
            "FROM bedrock.pebble_feedback WHERE created_at >= $1",
            cutoff,
        )
        total = row["total"] or 0
        correct_count = row["correct_count"] or 0
        incorrect_count = row["incorrect_count"] or 0
        correct_pct = (
            round(correct_count / total * 100, 1) if total > 0 else 0.0
        )

        # By contact
        by_contact_rows = await conn.fetch(
            "SELECT contact_id, COUNT(*) AS total, "
            "SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_count "
            "FROM bedrock.pebble_feedback "
            "WHERE created_at >= $1 AND contact_id IS NOT NULL "
            "GROUP BY contact_id ORDER BY total DESC",
            cutoff,
        )
        by_contact = [
            {
                "contact_id": r["contact_id"],
                "total": r["total"],
                "correct_count": r["correct_count"] or 0,
            }
            for r in by_contact_rows
        ]

        return {
            "total": total,
            "correct_count": correct_count,
            "incorrect_count": incorrect_count,
            "correct_pct": correct_pct,
            "by_contact": by_contact,
        }


# ---------------------------------------------------------------------------
# Source scores (stigmergy)
# ---------------------------------------------------------------------------

async def save_source_scores(
    prospect_id: str, scores: dict[str, float],
) -> None:
    """Stigmergy: write source richness scores to environment."""
    async with get_pool().acquire() as conn:
        await conn.executemany(
            """INSERT INTO bedrock.pebble_source_scores
               (source_name, richness_score, prospect_id)
               VALUES ($1, $2, $3)""",
            [(name, score, prospect_id) for name, score in scores.items()],
        )


async def get_source_reliability(source_name: str) -> float:
    """Stigmergy: read pheromone trail — success rate over last 50 runs."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """SELECT outcome FROM bedrock.pebble_harness_log
               WHERE agent_name = $1 ORDER BY created_at DESC LIMIT 50""",
            source_name,
        )
        if not rows:
            return 1.0  # No history — neutral multiplier
        successes = sum(1 for r in rows if r["outcome"] == "success")
        return successes / len(rows)


# ---------------------------------------------------------------------------
# Session history
# ---------------------------------------------------------------------------

async def save_session(
    session_id: str,
    contact_id: str,
    profile: dict,
    prospect_name: str,
    prospect_org: str,
    cost_usd: float | None = None,
    status: str = "completed",
    tier: str | None = None,
    agents_log: list[dict] | None = None,
    batch_id: str | None = None,
) -> None:
    """Insert a research session record."""
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_research_sessions
               (id, contact_id, profile_json, cost_usd, prospect_name,
                prospect_org, status, tier, agents_log_json, batch_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)""",
            session_id, contact_id, json.dumps(profile), cost_usd,
            prospect_name, prospect_org, status, tier,
            json.dumps(agents_log) if agents_log else None, batch_id,
        )


async def update_session_metadata(
    contact_id: str,
    tier: str | None = None,
    agents_log: list[dict] | None = None,
    batch_id: str | None = None,
) -> None:
    """Update the most recent session for a contact with metadata fields."""
    async with get_pool().acquire() as conn:
        await conn.execute(
            """UPDATE bedrock.pebble_research_sessions
               SET tier = COALESCE($1, tier),
                   agents_log_json = COALESCE($2, agents_log_json),
                   batch_id = COALESCE($3, batch_id)
               WHERE id = (
                   SELECT id FROM bedrock.pebble_research_sessions
                   WHERE contact_id = $4
                   ORDER BY created_at DESC LIMIT 1
               )""",
            tier,
            json.dumps(agents_log) if agents_log else None,
            batch_id,
            contact_id,
        )


async def get_recent_sessions(limit: int = 100) -> list[dict]:
    """Return recent research sessions ordered by created_at DESC."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """SELECT id, contact_id, prospect_name, prospect_org, status,
                      profile_json, tier, batch_id, cost_usd, created_at
               FROM bedrock.pebble_research_sessions
               ORDER BY created_at DESC
               LIMIT $1""",
            limit,
        )
        results = []
        for r in rows:
            profile = json.loads(r["profile_json"])
            results.append({
                "id": r["id"],
                "contact_id": r["contact_id"],
                "prospect_name": r["prospect_name"],
                "prospect_org": r["prospect_org"],
                "status": r["status"],
                "tier": r["tier"],
                "batch_id": r["batch_id"],
                "cost_usd": r["cost_usd"],
                "claims_count": len(profile.get("claims", [])),
                "confidence_score": profile.get("confidence_score", "unknown"),
                "created_at": r["created_at"],
            })
        return results


async def get_session(session_id: str) -> dict | None:
    """Return a full session record including profile_json (parsed)."""
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(
            """SELECT id, contact_id, profile_json, cost_usd,
                      prospect_name, prospect_org, status,
                      agents_log_json, tier, batch_id, created_at
               FROM bedrock.pebble_research_sessions WHERE id = $1""",
            session_id,
        )
        if not row:
            return None
        result = dict(row)
        result["profile"] = json.loads(result.pop("profile_json"))
        agents_log_raw = result.pop("agents_log_json", None)
        result["agents_log"] = (
            json.loads(agents_log_raw) if agents_log_raw else None
        )
        return result


async def get_sessions_grouped(limit: int = 100) -> list[dict]:
    """Return sessions grouped: batch -> prospect -> tier runs."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """SELECT id, contact_id, prospect_name, prospect_org, status,
                      profile_json, tier, batch_id, cost_usd, created_at
               FROM bedrock.pebble_research_sessions
               ORDER BY created_at DESC LIMIT $1""",
            limit,
        )

    batches: OrderedDict[str, dict] = OrderedDict()

    for r in rows:
        profile = json.loads(r["profile_json"])
        session = {
            "id": r["id"],
            "contact_id": r["contact_id"],
            "prospect_name": r["prospect_name"],
            "prospect_org": r["prospect_org"],
            "status": r["status"],
            "tier": r["tier"],
            "batch_id": r["batch_id"],
            "cost_usd": r["cost_usd"],
            "claims_count": len(profile.get("claims", [])),
            "confidence_score": profile.get("confidence_score", "unknown"),
            "created_at": r["created_at"],
        }

        batch_key = r["batch_id"] or f"_implicit_{r['id']}"
        if batch_key not in batches:
            batches[batch_key] = {
                "batch_id": r["batch_id"],
                "created_at": r["created_at"],
                "prospects": OrderedDict(),
            }

        prospect_key = r["contact_id"]
        if prospect_key not in batches[batch_key]["prospects"]:
            batches[batch_key]["prospects"][prospect_key] = {
                "prospect_name": r["prospect_name"],
                "prospect_org": r["prospect_org"],
                "contact_id": r["contact_id"],
                "runs": [],
            }
        batches[batch_key]["prospects"][prospect_key]["runs"].append(session)

    result = []
    for batch in batches.values():
        batch["prospects"] = list(batch["prospects"].values())
        result.append(batch)
    return result


# ---------------------------------------------------------------------------
# Chat persistence (Ask Pebble)
# ---------------------------------------------------------------------------

async def ensure_conversation(
    conversation_id: str, user_email: str,
) -> None:
    """Create a conversation record if it doesn't exist."""
    async with get_pool().acquire() as conn:
        await conn.execute(
            """INSERT INTO bedrock.pebble_chat_conversations (id, user_email)
               VALUES ($1, $2)
               ON CONFLICT (id) DO NOTHING""",
            conversation_id, user_email,
        )


async def save_chat_message(
    message_id: str,
    conversation_id: str,
    role: str,
    content: str,
    tier: str | None = None,
    cost_usd: float = 0.0,
    metadata: dict | None = None,
) -> None:
    """Save a chat message and update conversation cost.

    Uses a transaction for atomicity: message insert + cost update
    either both succeed or neither does.
    """
    metadata_json = json.dumps(metadata) if metadata else None
    async with get_pool().acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """INSERT INTO bedrock.pebble_chat_messages
                   (id, conversation_id, role, content, tier, cost_usd, metadata_json)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)""",
                message_id, conversation_id, role, content, tier,
                cost_usd, metadata_json,
            )
            if cost_usd > 0:
                # updated_at handled by trigger — no manual SET needed
                await conn.execute(
                    """UPDATE bedrock.pebble_chat_conversations
                       SET total_cost_usd = total_cost_usd + $1
                       WHERE id = $2""",
                    cost_usd, conversation_id,
                )


async def get_conversation_messages(
    conversation_id: str, limit: int = 50,
) -> list[dict]:
    """Get recent messages for a conversation."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """SELECT id, role, content, tier, cost_usd,
                      metadata_json, created_at
               FROM bedrock.pebble_chat_messages
               WHERE conversation_id = $1
               ORDER BY created_at ASC
               LIMIT $2""",
            conversation_id, limit,
        )
    results = []
    for r in rows:
        msg = dict(r)
        if msg.get("metadata_json"):
            msg["metadata"] = json.loads(msg.pop("metadata_json"))
        else:
            msg.pop("metadata_json", None)
            msg["metadata"] = None
        results.append(msg)
    return results


async def get_recent_conversations(
    user_email: str | None = None, limit: int = 20,
) -> list[dict]:
    """Get recent conversations, optionally filtered by user."""
    async with get_pool().acquire() as conn:
        if user_email:
            rows = await conn.fetch(
                """SELECT id, user_email, title, total_cost_usd,
                          created_at, updated_at
                   FROM bedrock.pebble_chat_conversations
                   WHERE user_email = $1
                   ORDER BY updated_at DESC
                   LIMIT $2""",
                user_email, limit,
            )
        else:
            rows = await conn.fetch(
                """SELECT id, user_email, title, total_cost_usd,
                          created_at, updated_at
                   FROM bedrock.pebble_chat_conversations
                   ORDER BY updated_at DESC
                   LIMIT $1""",
                limit,
            )
        return [dict(r) for r in rows]


async def get_conversation_context(conversation_id: str) -> dict | None:
    """Get the last assistant message's metadata for context resolution."""
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(
            """SELECT metadata_json FROM bedrock.pebble_chat_messages
               WHERE conversation_id = $1 AND role = 'assistant'
               ORDER BY created_at DESC LIMIT 1""",
            conversation_id,
        )
        if row and row["metadata_json"]:
            return json.loads(row["metadata_json"])
        return None


# ---------------------------------------------------------------------------
# Batch research persistence (Ask Pebble Phase 4)
# ---------------------------------------------------------------------------

async def create_batch(
    batch_id: str, user_email: str, prospects: list[dict],
) -> None:
    """Create a batch and its prospect rows.

    Uses a transaction for atomicity: either all prospects are inserted
    or none (prevents partial batches on failure).
    """
    async with get_pool().acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """INSERT INTO bedrock.pebble_research_batches
                   (id, user_email, total_prospects)
                   VALUES ($1, $2, $3)""",
                batch_id, user_email, len(prospects),
            )
            for p in prospects:
                await conn.execute(
                    """INSERT INTO bedrock.pebble_batch_prospects
                       (id, batch_id, prospect_name, prospect_org)
                       VALUES ($1, $2, $3, $4)""",
                    p["id"], batch_id, p.get("name", ""),
                    p.get("organization", ""),
                )


async def update_batch_prospect(
    prospect_id: str,
    current_tier: str,
    identity_confidence: str = "none",
    crm_status: str = "unknown",
    result_json: str | None = None,
    cost_usd: float = 0.0,
) -> None:
    """Update a prospect's tier result in a batch."""
    # updated_at handled by trigger — no manual SET needed
    async with get_pool().acquire() as conn:
        await conn.execute(
            """UPDATE bedrock.pebble_batch_prospects
               SET current_tier = $1, identity_confidence = $2,
                   crm_status = $3, result_json = $4, cost_usd = $5
               WHERE id = $6""",
            current_tier, identity_confidence, crm_status,
            result_json, cost_usd, prospect_id,
        )


async def update_batch_status(
    batch_id: str,
    status: str,
    completed_prospects: int | None = None,
    total_cost_usd: float | None = None,
) -> None:
    """Update batch-level status."""
    # updated_at handled by trigger — no manual SET needed
    params: list[Any] = [status]
    sets = ["status = $1"]
    idx = 2
    if completed_prospects is not None:
        sets.append(f"completed_prospects = ${idx}")
        params.append(completed_prospects)
        idx += 1
    if total_cost_usd is not None:
        sets.append(f"total_cost_usd = ${idx}")
        params.append(total_cost_usd)
        idx += 1
    params.append(batch_id)
    async with get_pool().acquire() as conn:
        await conn.execute(
            f"UPDATE bedrock.pebble_research_batches "
            f"SET {', '.join(sets)} WHERE id = ${idx}",
            *params,
        )


async def get_batch_status(batch_id: str) -> dict | None:
    """Get batch status and summary."""
    async with get_pool().acquire() as conn:
        row = await conn.fetchrow(
            """SELECT id, user_email, total_prospects, completed_prospects,
                      target_tier, status, total_cost_usd, created_at, updated_at
               FROM bedrock.pebble_research_batches WHERE id = $1""",
            batch_id,
        )
        return dict(row) if row else None


async def get_batch_prospects(batch_id: str) -> list[dict]:
    """Get all prospects in a batch."""
    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """SELECT id, prospect_name, prospect_org, current_tier,
                      identity_confidence, crm_status, result_json, cost_usd
               FROM bedrock.pebble_batch_prospects
               WHERE batch_id = $1
               ORDER BY prospect_name ASC""",
            batch_id,
        )
    results = []
    for r in rows:
        item = dict(r)
        if item.get("result_json"):
            item["result"] = json.loads(item.pop("result_json"))
        else:
            item.pop("result_json", None)
            item["result"] = None
        results.append(item)
    return results
