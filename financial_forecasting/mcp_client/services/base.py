"""Base service class for MCP integrations."""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import os
from dotenv import load_dotenv

from ..client import MCPClient
from ..transport import Transport

load_dotenv()


class BaseMCPService(ABC):
    """Base class for MCP service integrations."""

    def __init__(self, client: MCPClient):
        self.client = client
        self._config: Dict[str, Any] = {}
        self._authenticated = False

    @abstractmethod
    async def authenticate(self) -> bool:
        """Authenticate with the service."""
        pass

    @abstractmethod
    async def get_service_info(self) -> Dict[str, Any]:
        """Get service information."""
        pass

    @property
    def is_authenticated(self) -> bool:
        """Check if service is authenticated."""
        return self._authenticated

    def get_config_value(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """Get configuration value from environment or config."""
        return os.getenv(key, default)

    async def ensure_authenticated(self) -> None:
        """Ensure the service is authenticated."""
        if not self._authenticated:
            success = await self.authenticate()
            if not success:
                raise Exception(f"Failed to authenticate with {self.__class__.__name__}")
