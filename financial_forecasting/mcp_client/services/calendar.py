"""Google Calendar MCP service integration."""

from typing import Any, Dict, List, Optional
import asyncio
import os
from datetime import datetime, timedelta

from .base import BaseMCPService


class GoogleCalendarMCPService(BaseMCPService):
    """Google Calendar service for scheduling context."""

    SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]

    def __init__(self, client, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        super().__init__(client)
        self.credentials_file = credentials_file or self.get_config_value("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        self.token_file = token_file or self.get_config_value("CALENDAR_TOKEN_FILE", "calendar_token.json")
        self._calendar_service = None

    async def authenticate(self) -> bool:
        """Authenticate with Google Calendar API."""
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build

            creds = None
            if os.path.exists(self.token_file):
                creds = Credentials.from_authorized_user_file(self.token_file, self.SCOPES)

            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(None, lambda: creds.refresh(Request()))
                else:
                    return False

            loop = asyncio.get_event_loop()
            self._calendar_service = await loop.run_in_executor(
                None, lambda: build("calendar", "v3", credentials=creds)
            )

            # Test connection
            calendars = await loop.run_in_executor(
                None, lambda: self._calendar_service.calendarList().list(maxResults=1).execute()
            )
            if calendars:
                self._authenticated = True
                return True
            return False
        except Exception as e:
            print(f"Google Calendar authentication failed: {e}")
            return False

    async def get_service_info(self) -> Dict[str, Any]:
        await self.ensure_authenticated()
        return {
            "service": "google_calendar",
            "authenticated": self._authenticated,
            "config": self._config,
        }

    async def search_events(self, query: str, days_back: int = 90, days_forward: int = 30, max_results: int = 50, calendar_id: str = "primary") -> List[Dict[str, Any]]:
        """Search calendar events by query."""
        await self.ensure_authenticated()
        try:
            now = datetime.utcnow()
            time_min = (now - timedelta(days=days_back)).isoformat() + "Z"
            time_max = (now + timedelta(days=days_forward)).isoformat() + "Z"

            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self._calendar_service.events().list(
                    calendarId=calendar_id,
                    q=query,
                    timeMin=time_min,
                    timeMax=time_max,
                    maxResults=max_results,
                    singleEvents=True,
                    orderBy="startTime",
                ).execute()
            )
            events = results.get("items", [])
            return [
                {
                    "id": e.get("id", ""),
                    "summary": e.get("summary", ""),
                    "start": e.get("start", {}).get("dateTime", e.get("start", {}).get("date", "")),
                    "end": e.get("end", {}).get("dateTime", e.get("end", {}).get("date", "")),
                    "attendees": [a.get("email", "") for a in e.get("attendees", [])],
                    "description": e.get("description", ""),
                    "location": e.get("location", ""),
                    "status": e.get("status", ""),
                }
                for e in events
            ]
        except Exception as e:
            print(f"Calendar search failed: {e}")
            return []

    async def get_account_activity(self, account_name: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get calendar events related to a specific account."""
        events = await self.search_events(account_name, max_results=limit)
        return [
            {
                "id": e["id"],
                "type": "meeting",
                "title": e["summary"],
                "start": e["start"],
                "end": e["end"],
                "attendees": e["attendees"],
                "location": e.get("location", ""),
                "source": "google_calendar",
            }
            for e in events
        ]
