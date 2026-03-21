"""Slack integration endpoints — health, account activity, channel messages, pipeline updates."""

import logging
import os
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import require_auth
from dependencies import get_mcp_client
from mcp_client import UnifiedMCPClient
from models import ApiResponse
from services.cache import cache

logger = logging.getLogger(__name__)

router = APIRouter(tags=["slack"])

SLACK_PIPELINE_CHANNEL = os.getenv("SLACK_PIPELINE_CHANNEL", "pipeline-updates")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@router.get("/api/slack/health")
async def slack_health_check(
    client: UnifiedMCPClient = Depends(get_mcp_client),
):
    """Check Slack service health."""
    if "slack" not in getattr(client, "_connected_services", set()):
        return ApiResponse(
            success=True,
            data={"status": "not_configured", "message": "Slack service not connected"},
        )
    try:
        slack_service = client.services.get("slack")
        if slack_service and slack_service.is_authenticated:
            info = await slack_service.get_service_info()
            return ApiResponse(
                success=True,
                data={"status": "healthy", "config": info.get("config", {})},
            )
        return ApiResponse(
            success=True,
            data={"status": "unhealthy", "message": "Not authenticated"},
        )
    except Exception as e:
        return ApiResponse(
            success=True,
            data={"status": "error", "message": str(e)},
        )


# ---------------------------------------------------------------------------
# Account activity (search messages mentioning an account)
# ---------------------------------------------------------------------------

@router.get("/api/slack/account-activity/{account_name}")
async def get_slack_account_activity(
    account_name: str,
    limit: int = Query(20, le=100),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Get Slack messages mentioning an account."""
    slack_service = client.services.get("slack")
    if not slack_service:
        raise HTTPException(status_code=503, detail="Slack service not connected")
    try:
        results = await slack_service.search_messages(account_name, count=limit)
        messages = (
            results.get("messages", {}).get("matches", [])
            if isinstance(results, dict)
            else []
        )
        activity = [
            {
                "id": msg.get("ts", ""),
                "type": "slack_message",
                "channel": (
                    msg.get("channel", {}).get("name", "")
                    if isinstance(msg.get("channel"), dict)
                    else str(msg.get("channel", ""))
                ),
                "text": msg.get("text", ""),
                "user": msg.get("username", msg.get("user", "")),
                "timestamp": msg.get("ts", ""),
                "permalink": msg.get("permalink", ""),
                "source": "slack",
            }
            for msg in messages[:limit]
        ]
        return ApiResponse(
            success=True,
            data=activity,
            meta={"count": len(activity), "account": account_name},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Slack activity for {account_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Channel messages (generic — any public channel by name)
# ---------------------------------------------------------------------------

@router.get("/api/slack/channel-messages/{channel_name}")
async def get_slack_channel_messages(
    channel_name: str,
    limit: int = 50,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Fetch recent messages from a named Slack channel."""
    slack_service = client.services.get("slack")
    if not slack_service:
        raise HTTPException(status_code=503, detail="Slack service not connected")
    try:
        clean_name = channel_name.lstrip("#")
        history = await slack_service.get_channel_history(clean_name, limit=limit)

        if not history:
            raise HTTPException(
                status_code=404,
                detail=f"Channel #{clean_name} not found or bot is not a member",
            )

        messages_raw = history.get("messages", []) if isinstance(history, dict) else []
        messages = []
        for msg in messages_raw:
            uid = msg.get("user", "")
            ts = msg.get("ts", "")
            channel_id = msg.get("channel_id", history.get("channel_id", ""))
            messages.append(
                {
                    "text": msg.get("text", ""),
                    "user_name": msg.get("user_name", uid),
                    "user_id": uid,
                    "timestamp": ts,
                    "permalink": (
                        f"https://slack.com/archives/{channel_id}/p{ts.replace('.', '')}"
                        if ts and channel_id
                        else ""
                    ),
                    "thread_ts": msg.get("thread_ts"),
                }
            )

        return {"channel": clean_name, "messages": messages, "total": len(messages)}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Pipeline updates (dedicated cached endpoint)
# ---------------------------------------------------------------------------

@router.get("/api/slack/pipeline-updates")
async def get_slack_pipeline_updates(
    limit: int = 50,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Dedicated endpoint for #pipeline-updates channel messages (cached 60s)."""
    cache_key = f"slack:pipeline-updates:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    slack_service = client.services.get("slack")
    if not slack_service:
        raise HTTPException(status_code=503, detail="Slack service not connected")

    try:
        history = await slack_service.get_channel_history(
            SLACK_PIPELINE_CHANNEL, limit=limit
        )

        if not history:
            return {
                "channel": SLACK_PIPELINE_CHANNEL,
                "messages": [],
                "total": 0,
                "error": f"Channel #{SLACK_PIPELINE_CHANNEL} not found",
            }

        messages_raw = history.get("messages", []) if isinstance(history, dict) else []
        messages = []
        for msg in messages_raw:
            uid = msg.get("user", "")
            ts = msg.get("ts", "")
            channel_id = msg.get("channel_id", history.get("channel_id", ""))
            messages.append(
                {
                    "text": msg.get("text", ""),
                    "user_name": msg.get("user_name", uid),
                    "user_id": uid,
                    "timestamp": ts,
                    "permalink": (
                        f"https://slack.com/archives/{channel_id}/p{ts.replace('.', '')}"
                        if ts and channel_id
                        else ""
                    ),
                    "thread_ts": msg.get("thread_ts"),
                }
            )

        result = {
            "channel": SLACK_PIPELINE_CHANNEL,
            "messages": messages,
            "total": len(messages),
        }
        cache.set(cache_key, result, ttl_seconds=60)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
