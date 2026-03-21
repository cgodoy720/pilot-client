"""Salesforce MCP service integration."""

from typing import Any, Dict, List, Optional
import asyncio
from simple_salesforce import Salesforce
from simple_salesforce.exceptions import SalesforceAuthenticationFailed

from .base import BaseMCPService


class SalesforceMCPService(BaseMCPService):
    """Salesforce MCP service integration."""

    def __init__(
        self,
        client,
        username: Optional[str] = None,
        password: Optional[str] = None,
        security_token: Optional[str] = None,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        domain: Optional[str] = None,
    ):
        super().__init__(client)
        self.username = username or self.get_config_value("SALESFORCE_USERNAME")
        self.password = password or self.get_config_value("SALESFORCE_PASSWORD")
        self.security_token = security_token or self.get_config_value("SALESFORCE_SECURITY_TOKEN")
        self.client_id = client_id or self.get_config_value("SALESFORCE_CLIENT_ID")
        self.client_secret = client_secret or self.get_config_value("SALESFORCE_CLIENT_SECRET")
        self.domain = domain or self.get_config_value("SALESFORCE_DOMAIN", "login")
        self.sf_client: Optional[Salesforce] = None
        
        # Check if we have either security token method or OAuth method
        has_security_token = all([self.username, self.password, self.security_token])
        has_oauth = all([self.username, self.password, self.client_id, self.client_secret])
        
        if not (has_security_token or has_oauth):
            raise ValueError("Salesforce credentials are required: either (username, password, security_token) or (username, password, client_id, client_secret)")

    async def authenticate(self) -> bool:
        """Authenticate with Salesforce API."""
        try:
            # Run in thread pool since simple_salesforce is synchronous
            loop = asyncio.get_event_loop()
            
            # Try OAuth first if client_id and client_secret are provided
            if self.client_id and self.client_secret:
                # Use OAuth 2.0 Client Credentials flow
                import requests
                
                # Determine the correct OAuth endpoint
                oauth_url = f"https://{self.domain}.salesforce.com/services/oauth2/token" if self.domain != 'login' else "https://login.salesforce.com/services/oauth2/token"
                
                # Get OAuth token
                oauth_data = {
                    'grant_type': 'client_credentials',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
                
                oauth_response = await loop.run_in_executor(
                    None,
                    lambda: requests.post(oauth_url, data=oauth_data)
                )
                
                if oauth_response.status_code == 200:
                    token_data = oauth_response.json()
                    
                    self.sf_client = await loop.run_in_executor(
                        None,
                        lambda: Salesforce(
                            instance_url=token_data['instance_url'],
                            session_id=token_data['access_token']
                        )
                    )
                else:
                    # Fallback to username/password with OAuth if client credentials fail
                    if self.username and self.password:
                        self.sf_client = await loop.run_in_executor(
                            None,
                            lambda: Salesforce(
                                username=self.username,
                                password=self.password,
                                consumer_key=self.client_id,
                                consumer_secret=self.client_secret,
                                domain=self.domain,
                            )
                        )
                    else:
                        raise Exception(f"OAuth failed: {oauth_response.text}")
            else:
                # Fall back to security token method
                self.sf_client = await loop.run_in_executor(
                    None,
                    lambda: Salesforce(
                        username=self.username,
                        password=self.password,
                        security_token=self.security_token,
                        domain=self.domain,
                    )
                )
            
            # Test connection by getting user info
            user_info = await loop.run_in_executor(
                None, lambda: self.sf_client.query("SELECT Id, Name FROM User WHERE Username = '{}'".format(self.username))
            )
            
            if user_info["totalSize"] > 0:
                self._authenticated = True
                self._config.update({
                    "user_id": user_info["records"][0]["Id"],
                    "user_name": user_info["records"][0]["Name"],
                    "instance_url": self.sf_client.sf_instance,
                    "session_id": self.sf_client.session_id,
                })
                return True
            return False
            
        except SalesforceAuthenticationFailed as e:
            print(f"Salesforce authentication failed: {e}")
            # Last resort: SalesforceLogin without security token
            if self.username and self.password:
                try:
                    from simple_salesforce import SalesforceLogin
                    loop = asyncio.get_event_loop()
                    session_id, instance = await loop.run_in_executor(
                        None,
                        lambda: SalesforceLogin(
                            username=self.username,
                            password=self.password,
                            domain=self.domain or "login",
                        )
                    )
                    self.sf_client = Salesforce(instance=instance, session_id=session_id)
                    self._authenticated = True
                    print(f"Salesforce connected via SalesforceLogin fallback: {self.username}")
                    return True
                except Exception as fallback_err:
                    print(f"Salesforce fallback auth also failed: {fallback_err}")
            return False
        except Exception as e:
            print(f"Salesforce connection error: {e}")
            return False

    async def get_service_info(self) -> Dict[str, Any]:
        """Get Salesforce service information."""
        await self.ensure_authenticated()
        
        return {
            "service": "salesforce",
            "authenticated": self._authenticated,
            "config": self._config,
            "available_tools": await self._get_available_tools(),
        }

    async def _get_available_tools(self) -> List[str]:
        """Get available Salesforce tools from MCP server."""
        tools = []
        if not self.client:
            return tools
        for tool_name, tool_def in self.client.available_tools.items():
            if "salesforce" in tool_name.lower() or "sf" in tool_name.lower():
                tools.append(tool_name)
        return tools

    async def query(self, soql: str) -> Dict[str, Any]:
        """Execute SOQL query."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_query" in self.client.available_tools:
                return await self.client.call_tool(
                    "salesforce_query",
                    {"query": soql}
                )
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, lambda: self.sf_client.query(soql)
                )
                return result
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to execute query: {e}")

    async def query_all(self, soql: str) -> Dict[str, Any]:
        """Execute SOQL query with automatic pagination (returns all records)."""
        await self.ensure_authenticated()
        try:
            if self.sf_client:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, lambda: self.sf_client.query_all(soql)
                )
                return result
            raise Exception("No Salesforce client available")
        except Exception as e:
            raise Exception(f"Failed to execute query: {e}")

    async def create_record(self, sobject: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_create" in self.client.available_tools:
                return await self.client.call_tool(
                    "salesforce_create",
                    {"sobject": sobject, "data": data}
                )
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                sobject_client = getattr(self.sf_client, sobject)
                result = await loop.run_in_executor(
                    None, lambda: sobject_client.create(data)
                )
                return result
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to create record: {e}")

    async def update_record(
        self, sobject: str, record_id: str, data: Dict[str, Any]
    ) -> bool:
        """Update an existing record."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_update" in self.client.available_tools:
                result = await self.client.call_tool(
                    "salesforce_update",
                    {"sobject": sobject, "id": record_id, "data": data}
                )
                return result.get("success", False)
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                sobject_client = getattr(self.sf_client, sobject)
                result = await loop.run_in_executor(
                    None, lambda: sobject_client.update(record_id, data)
                )
                return result == 204  # HTTP 204 No Content indicates success
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to update record: {e}")

    async def delete_record(self, sobject: str, record_id: str) -> bool:
        """Delete a record."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_delete" in self.client.available_tools:
                result = await self.client.call_tool(
                    "salesforce_delete",
                    {"sobject": sobject, "id": record_id}
                )
                return result.get("success", False)
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                sobject_client = getattr(self.sf_client, sobject)
                result = await loop.run_in_executor(
                    None, lambda: sobject_client.delete(record_id)
                )
                return result == 204  # HTTP 204 No Content indicates success
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to delete record: {e}")

    async def get_record(self, sobject: str, record_id: str) -> Dict[str, Any]:
        """Get a record by ID."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_get" in self.client.available_tools:
                return await self.client.call_tool(
                    "salesforce_get",
                    {"sobject": sobject, "id": record_id}
                )
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                sobject_client = getattr(self.sf_client, sobject)
                result = await loop.run_in_executor(
                    None, lambda: sobject_client.get(record_id)
                )
                return result
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to get record: {e}")

    async def describe_sobject(self, sobject: str) -> Dict[str, Any]:
        """Describe an SObject (get metadata)."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_describe" in self.client.available_tools:
                return await self.client.call_tool(
                    "salesforce_describe",
                    {"sobject": sobject}
                )
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                sobject_client = getattr(self.sf_client, sobject)
                result = await loop.run_in_executor(
                    None, lambda: sobject_client.describe()
                )
                return result
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to describe SObject: {e}")

    async def search(self, sosl: str) -> Dict[str, Any]:
        """Execute SOSL search."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if self.client and "salesforce_search" in self.client.available_tools:
                return await self.client.call_tool(
                    "salesforce_search",
                    {"query": sosl}
                )
            
            # Fallback to direct API call
            if self.sf_client:
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None, lambda: self.sf_client.search(sosl)
                )
                return result
            
            raise Exception("No Salesforce client available")
            
        except Exception as e:
            raise Exception(f"Failed to execute search: {e}")
