"""Gmail MCP service integration."""

from typing import Any, Dict, List, Optional
import asyncio
import os
from datetime import datetime

from .base import BaseMCPService


class GmailMCPService(BaseMCPService):
    """Gmail service for email activity tracking."""

    SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

    def __init__(self, client, credentials_file: Optional[str] = None, token_file: Optional[str] = None):
        super().__init__(client)
        self.credentials_file = credentials_file or self.get_config_value("GOOGLE_CREDENTIALS_FILE", "credentials.json")
        self.token_file = token_file or self.get_config_value("GMAIL_TOKEN_FILE", "gmail_token.json")
        self._gmail_service = None

    async def authenticate(self) -> bool:
        """Authenticate with Gmail API."""
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
                    return False  # Need interactive OAuth flow

            loop = asyncio.get_event_loop()
            self._gmail_service = await loop.run_in_executor(
                None, lambda: build("gmail", "v1", credentials=creds)
            )

            # Test connection
            profile = await loop.run_in_executor(
                None, lambda: self._gmail_service.users().getProfile(userId="me").execute()
            )
            if profile:
                self._authenticated = True
                self._config["email"] = profile.get("emailAddress", "")
                return True
            return False
        except Exception as e:
            print(f"Gmail authentication failed: {e}")
            return False

    async def get_service_info(self) -> Dict[str, Any]:
        await self.ensure_authenticated()
        return {
            "service": "gmail",
            "authenticated": self._authenticated,
            "config": self._config,
        }

    async def search_emails(self, query: str, max_results: int = 20) -> List[Dict[str, Any]]:
        """Search emails by query string."""
        await self.ensure_authenticated()
        try:
            loop = asyncio.get_event_loop()
            results = await loop.run_in_executor(
                None,
                lambda: self._gmail_service.users().messages().list(
                    userId="me", q=query, maxResults=max_results
                ).execute()
            )
            messages = results.get("messages", [])
            emails = []
            for msg_ref in messages:
                msg = await loop.run_in_executor(
                    None,
                    lambda mid=msg_ref["id"]: self._gmail_service.users().messages().get(
                        userId="me", id=mid, format="metadata",
                        metadataHeaders=["From", "To", "Subject", "Date"]
                    ).execute()
                )
                headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
                emails.append({
                    "id": msg["id"],
                    "thread_id": msg.get("threadId", ""),
                    "subject": headers.get("Subject", ""),
                    "from": headers.get("From", ""),
                    "to": headers.get("To", ""),
                    "date": headers.get("Date", ""),
                    "snippet": msg.get("snippet", ""),
                })
            return emails
        except Exception as e:
            print(f"Gmail search failed: {e}")
            return []

    async def get_account_activity(self, account_name: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get email activity related to a specific account."""
        emails = await self.search_emails(account_name, max_results=limit)
        return [
            {
                "id": e["id"],
                "type": "email",
                "subject": e["subject"],
                "from": e["from"],
                "to": e["to"],
                "date": e["date"],
                "snippet": e["snippet"],
                "source": "gmail",
            }
            for e in emails
        ]
