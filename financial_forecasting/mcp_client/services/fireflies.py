"""Fireflies.ai MCP service integration."""

from typing import Any, Dict, List, Optional
import os
import aiohttp

from .base import BaseMCPService


class FirefliesMCPService(BaseMCPService):
    """Fireflies.ai meeting transcript service."""

    GRAPHQL_URL = "https://api.fireflies.ai/graphql"

    def __init__(self, client, api_key: Optional[str] = None):
        super().__init__(client)
        self.api_key = api_key or self.get_config_value("FIREFLIES_API_KEY")
        self._session: Optional[aiohttp.ClientSession] = None

    async def authenticate(self) -> bool:
        """Authenticate with Fireflies API."""
        if not self.api_key:
            return False
        try:
            self._session = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            )
            # Test auth with a simple query
            result = await self._graphql_query("{ user { email } }")
            if result and "data" in result:
                self._authenticated = True
                self._config["email"] = result["data"].get("user", {}).get("email", "")
                return True
            return False
        except Exception as e:
            print(f"Fireflies authentication failed: {e}")
            return False

    async def _graphql_query(self, query: str, variables: Dict = None) -> Optional[Dict]:
        """Execute a GraphQL query."""
        if not self._session:
            self._session = aiohttp.ClientSession(
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            )
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        async with self._session.post(self.GRAPHQL_URL, json=payload) as resp:
            if resp.status == 200:
                return await resp.json()
            return None

    async def get_service_info(self) -> Dict[str, Any]:
        await self.ensure_authenticated()
        return {
            "service": "fireflies",
            "authenticated": self._authenticated,
            "config": self._config,
        }

    async def search_transcripts(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search meeting transcripts by keyword."""
        await self.ensure_authenticated()
        gql = """
        query SearchTranscripts($query: String!, $limit: Int) {
            transcripts(limit: $limit) {
                id
                title
                date
                duration
                participants
                summary { overview action_items }
                sentences { text speaker_name }
            }
        }
        """
        result = await self._graphql_query(gql, {"query": query, "limit": limit})
        if not result or "data" not in result:
            return []
        transcripts = result["data"].get("transcripts", [])
        # Filter by query in title, participants, or transcript text
        query_lower = query.lower()
        return [
            t for t in transcripts
            if query_lower in (t.get("title", "") or "").lower()
            or any(query_lower in (p or "").lower() for p in (t.get("participants", []) or []))
            or any(query_lower in (s.get("text", "") or "").lower() for s in (t.get("sentences", []) or []))
        ]

    async def get_transcript(self, transcript_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific transcript by ID."""
        await self.ensure_authenticated()
        gql = """
        query GetTranscript($id: String!) {
            transcript(id: $id) {
                id
                title
                date
                duration
                participants
                summary { overview action_items }
                sentences { text speaker_name start_time end_time }
            }
        }
        """
        result = await self._graphql_query(gql, {"id": transcript_id})
        if result and "data" in result:
            return result["data"].get("transcript")
        return None

    async def get_account_meetings(self, account_name: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get meetings related to a specific account."""
        transcripts = await self.search_transcripts(account_name, limit=limit)
        return [
            {
                "id": t.get("id"),
                "title": t.get("title", ""),
                "date": t.get("date", ""),
                "duration": t.get("duration", 0),
                "participants": t.get("participants", []),
                "summary": t.get("summary", {}).get("overview", ""),
                "action_items": t.get("summary", {}).get("action_items", []),
                "source": "fireflies",
            }
            for t in transcripts
        ]

    async def disconnect(self):
        if self._session:
            await self._session.close()
            self._session = None
