"""Google Drive MCP service integration."""

from typing import Any, Dict, List, Optional
import asyncio
import os
import json
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .base import BaseMCPService


class GoogleDriveMCPService(BaseMCPService):
    """Google Drive MCP service integration."""

    SCOPES = [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
    ]

    def __init__(
        self,
        client,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        credentials_file: Optional[str] = None,
        token_file: Optional[str] = None,
    ):
        super().__init__(client)
        self.client_id = client_id or self.get_config_value("GOOGLE_CLIENT_ID")
        self.client_secret = client_secret or self.get_config_value("GOOGLE_CLIENT_SECRET")
        self.redirect_uri = redirect_uri or self.get_config_value("GOOGLE_REDIRECT_URI", "http://localhost:8080/callback")
        self.credentials_file = credentials_file or "credentials.json"
        self.token_file = token_file or "token.json"
        self.credentials: Optional[Credentials] = None
        self.drive_service = None
        
        if not all([self.client_id, self.client_secret]):
            raise ValueError("Google OAuth credentials are required")

    async def authenticate(self) -> bool:
        """Authenticate with Google Drive API."""
        try:
            # Load existing credentials
            if os.path.exists(self.token_file):
                self.credentials = Credentials.from_authorized_user_file(
                    self.token_file, self.SCOPES
                )
            
            # If credentials are not valid, refresh or get new ones
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    # Refresh credentials
                    loop = asyncio.get_event_loop()
                    await loop.run_in_executor(
                        None, lambda: self.credentials.refresh(Request())
                    )
                else:
                    # Get new credentials using OAuth flow
                    await self._run_oauth_flow()
                
                # Save credentials
                with open(self.token_file, "w") as token:
                    token.write(self.credentials.to_json())
            
            # Build Drive service
            loop = asyncio.get_event_loop()
            self.drive_service = await loop.run_in_executor(
                None, lambda: build("drive", "v3", credentials=self.credentials)
            )
            
            # Test connection
            about = await loop.run_in_executor(
                None, lambda: self.drive_service.about().get(fields="user").execute()
            )
            
            if about and "user" in about:
                self._authenticated = True
                self._config.update({
                    "user_email": about["user"]["emailAddress"],
                    "user_name": about["user"]["displayName"],
                    "photo_link": about["user"].get("photoLink"),
                })
                return True
            return False
            
        except Exception as e:
            print(f"Google Drive authentication failed: {e}")
            return False

    async def _run_oauth_flow(self) -> None:
        """Run OAuth flow to get credentials."""
        # Create credentials info
        client_config = {
            "web": {
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [self.redirect_uri],
            }
        }
        
        # Write temporary credentials file
        temp_creds_file = "temp_credentials.json"
        with open(temp_creds_file, "w") as f:
            json.dump(client_config, f)
        
        try:
            # Run OAuth flow
            flow = InstalledAppFlow.from_client_secrets_file(
                temp_creds_file, self.SCOPES
            )
            
            loop = asyncio.get_event_loop()
            self.credentials = await loop.run_in_executor(
                None, lambda: flow.run_local_server(port=8080)
            )
        finally:
            # Clean up temp file
            if os.path.exists(temp_creds_file):
                os.remove(temp_creds_file)

    async def get_service_info(self) -> Dict[str, Any]:
        """Get Google Drive service information."""
        await self.ensure_authenticated()
        
        return {
            "service": "google_drive",
            "authenticated": self._authenticated,
            "config": self._config,
            "available_tools": await self._get_available_tools(),
        }

    async def _get_available_tools(self) -> List[str]:
        """Get available Google Drive tools from MCP server."""
        tools = []
        for tool_name, tool_def in self.client.available_tools.items():
            if "drive" in tool_name.lower() or "google" in tool_name.lower():
                tools.append(tool_name)
        return tools

    async def list_files(
        self, 
        query: Optional[str] = None, 
        page_size: int = 100,
        order_by: str = "modifiedTime desc"
    ) -> Dict[str, Any]:
        """List files in Google Drive."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_list_files" in self.client.available_tools:
                return await self.client.call_tool(
                    "gdrive_list_files",
                    {"query": query, "page_size": page_size, "order_by": order_by}
                )
            
            # Fallback to direct API call
            if self.drive_service:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.drive_service.files().list(
                        q=query,
                        pageSize=page_size,
                        orderBy=order_by,
                        fields="nextPageToken, files(id, name, mimeType, modifiedTime, size, parents)"
                    ).execute()
                )
                return result
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to list files: {e}")

    async def get_file(self, file_id: str) -> Dict[str, Any]:
        """Get file metadata."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_get_file" in self.client.available_tools:
                return await self.client.call_tool(
                    "gdrive_get_file",
                    {"file_id": file_id}
                )
            
            # Fallback to direct API call
            if self.drive_service:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.drive_service.files().get(
                        fileId=file_id,
                        fields="id, name, mimeType, modifiedTime, size, parents, webViewLink"
                    ).execute()
                )
                return result
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to get file: {e}")

    async def download_file(self, file_id: str) -> bytes:
        """Download file content."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_download_file" in self.client.available_tools:
                result = await self.client.call_tool(
                    "gdrive_download_file",
                    {"file_id": file_id}
                )
                # Assume the result contains base64 encoded content
                import base64
                return base64.b64decode(result.get("content", ""))
            
            # Fallback to direct API call
            if self.drive_service:
                loop = asyncio.get_event_loop()
                request = self.drive_service.files().get_media(fileId=file_id)
                content = await loop.run_in_executor(
                    None, lambda: request.execute()
                )
                return content
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to download file: {e}")

    async def upload_file(
        self, 
        name: str, 
        content: bytes, 
        mime_type: str = "application/octet-stream",
        parent_folder_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a file to Google Drive."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_upload_file" in self.client.available_tools:
                import base64
                return await self.client.call_tool(
                    "gdrive_upload_file",
                    {
                        "name": name,
                        "content": base64.b64encode(content).decode(),
                        "mime_type": mime_type,
                        "parent_folder_id": parent_folder_id,
                    }
                )
            
            # Fallback to direct API call
            if self.drive_service:
                from googleapiclient.http import MediaInMemoryUpload
                
                file_metadata = {"name": name}
                if parent_folder_id:
                    file_metadata["parents"] = [parent_folder_id]
                
                media = MediaInMemoryUpload(content, mimetype=mime_type)
                
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.drive_service.files().create(
                        body=file_metadata,
                        media_body=media,
                        fields="id, name, mimeType, webViewLink"
                    ).execute()
                )
                return result
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to upload file: {e}")

    async def create_folder(
        self, name: str, parent_folder_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a folder in Google Drive."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_create_folder" in self.client.available_tools:
                return await self.client.call_tool(
                    "gdrive_create_folder",
                    {"name": name, "parent_folder_id": parent_folder_id}
                )
            
            # Fallback to direct API call
            if self.drive_service:
                file_metadata = {
                    "name": name,
                    "mimeType": "application/vnd.google-apps.folder",
                }
                if parent_folder_id:
                    file_metadata["parents"] = [parent_folder_id]
                
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    lambda: self.drive_service.files().create(
                        body=file_metadata,
                        fields="id, name, webViewLink"
                    ).execute()
                )
                return result
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to create folder: {e}")

    async def delete_file(self, file_id: str) -> bool:
        """Delete a file from Google Drive."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_delete_file" in self.client.available_tools:
                result = await self.client.call_tool(
                    "gdrive_delete_file",
                    {"file_id": file_id}
                )
                return result.get("success", False)
            
            # Fallback to direct API call
            if self.drive_service:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    None,
                    lambda: self.drive_service.files().delete(fileId=file_id).execute()
                )
                return True
            
            raise Exception("No Google Drive service available")
            
        except HttpError as e:
            raise Exception(f"Failed to delete file: {e}")

    async def search_files(self, query: str, max_results: int = 50) -> Dict[str, Any]:
        """Search for files in Google Drive."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "gdrive_search_files" in self.client.available_tools:
                return await self.client.call_tool(
                    "gdrive_search_files",
                    {"query": query, "max_results": max_results}
                )
            
            # Fallback to direct API call - use list_files with query
            return await self.list_files(query=query, page_size=max_results)
            
        except Exception as e:
            raise Exception(f"Failed to search files: {e}")
