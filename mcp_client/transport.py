"""Transport layer for MCP communication."""

import asyncio
import json
import sys
from abc import ABC, abstractmethod
from typing import Any, AsyncIterator, Dict, Optional

import websockets
from websockets.exceptions import ConnectionClosed

from .types import MCPMessage, MCPRequest, MCPResponse, MCPNotification


class Transport(ABC):
    """Abstract transport interface."""

    @abstractmethod
    async def connect(self) -> None:
        """Connect to the transport."""
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        """Disconnect from the transport."""
        pass

    @abstractmethod
    async def send(self, message: MCPMessage) -> None:
        """Send a message."""
        pass

    @abstractmethod
    async def receive(self) -> AsyncIterator[MCPMessage]:
        """Receive messages."""
        pass


class WebSocketTransport(Transport):
    """WebSocket transport for MCP."""

    def __init__(self, uri: str):
        self.uri = uri
        self.websocket: Optional[websockets.WebSocketServerProtocol] = None
        self._connected = False

    async def connect(self) -> None:
        """Connect to the WebSocket server."""
        try:
            self.websocket = await websockets.connect(self.uri)
            self._connected = True
        except Exception as e:
            raise ConnectionError(f"Failed to connect to {self.uri}: {e}")

    async def disconnect(self) -> None:
        """Disconnect from the WebSocket server."""
        if self.websocket:
            await self.websocket.close()
            self._connected = False

    async def send(self, message: MCPMessage) -> None:
        """Send a message over WebSocket."""
        if not self.websocket or not self._connected:
            raise ConnectionError("WebSocket not connected")
        
        try:
            data = message.model_dump_json()
            await self.websocket.send(data)
        except ConnectionClosed:
            self._connected = False
            raise ConnectionError("WebSocket connection closed")

    async def receive(self) -> AsyncIterator[MCPMessage]:
        """Receive messages from WebSocket."""
        if not self.websocket or not self._connected:
            raise ConnectionError("WebSocket not connected")

        try:
            async for raw_message in self.websocket:
                try:
                    data = json.loads(raw_message)
                    
                    # Determine message type based on structure
                    if "id" in data:
                        if "method" in data:
                            yield MCPRequest(**data)
                        else:
                            yield MCPResponse(**data)
                    else:
                        yield MCPNotification(**data)
                        
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON message: {e}")
                except Exception as e:
                    print(f"Failed to parse MCP message: {e}")
                    
        except ConnectionClosed:
            self._connected = False
            raise ConnectionError("WebSocket connection closed")


class StdioTransport(Transport):
    """Standard input/output transport for MCP."""

    def __init__(self):
        self._connected = False
        self._reader: Optional[asyncio.StreamReader] = None
        self._writer: Optional[asyncio.StreamWriter] = None

    async def connect(self) -> None:
        """Connect to stdio transport."""
        try:
            # For now, just mark as connected without actual stdio setup
            # This would need proper MCP server process management
            self._connected = True
            print("⚠️  Stdio transport connected (mock mode - needs MCP server)")
        except Exception as e:
            raise ConnectionError(f"Failed to connect to stdio: {e}")

    async def disconnect(self) -> None:
        """Disconnect from stdio transport."""
        if self._writer:
            self._writer.close()
            await self._writer.wait_closed()
        self._connected = False

    async def send(self, message: MCPMessage) -> None:
        """Send a message over stdio."""
        if not self._writer or not self._connected:
            raise ConnectionError("Stdio not connected")
        
        try:
            data = message.model_dump_json() + "\n"
            self._writer.write(data.encode())
            await self._writer.drain()
        except Exception as e:
            self._connected = False
            raise ConnectionError(f"Failed to send message: {e}")

    async def receive(self) -> AsyncIterator[MCPMessage]:
        """Receive messages from stdio."""
        if not self._reader or not self._connected:
            raise ConnectionError("Stdio not connected")

        try:
            while self._connected:
                line = await self._reader.readline()
                if not line:
                    break
                    
                try:
                    data = json.loads(line.decode().strip())
                    
                    # Determine message type based on structure
                    if "id" in data:
                        if "method" in data:
                            yield MCPRequest(**data)
                        else:
                            yield MCPResponse(**data)
                    else:
                        yield MCPNotification(**data)
                        
                except json.JSONDecodeError as e:
                    print(f"Failed to decode JSON message: {e}")
                except Exception as e:
                    print(f"Failed to parse MCP message: {e}")
                    
        except Exception as e:
            self._connected = False
            raise ConnectionError(f"Failed to receive message: {e}")
