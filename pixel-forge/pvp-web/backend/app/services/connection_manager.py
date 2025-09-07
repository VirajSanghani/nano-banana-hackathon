"""
Connection Manager Service
Handles WebSocket connections and real-time messaging between players
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect

# Import shared types
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'shared'))
from types.game_types import GameMessage, MessageType

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time multiplayer"""
    
    def __init__(self):
        # Active WebSocket connections
        self.active_connections: Dict[str, WebSocket] = {}
        
        # Player to match mapping
        self.player_matches: Dict[str, str] = {}
        
        # Connection metadata
        self.connection_info: Dict[str, Dict] = {}
        
        logger.info("🔌 Connection Manager initialized")
    
    async def connect(self, websocket: WebSocket, player_id: str):
        """Accept new WebSocket connection"""
        try:
            await websocket.accept()
            
            # Store connection
            self.active_connections[player_id] = websocket
            
            # Initialize connection info
            self.connection_info[player_id] = {
                "connected_at": asyncio.get_event_loop().time(),
                "messages_sent": 0,
                "messages_received": 0,
                "last_activity": asyncio.get_event_loop().time()
            }
            
            logger.info(f"✅ Player {player_id} connected. Total connections: {len(self.active_connections)}")
            
        except Exception as e:
            logger.error(f"Failed to connect player {player_id}: {e}")
            raise
    
    def disconnect(self, player_id: str):
        """Disconnect player and cleanup"""
        try:
            if player_id in self.active_connections:
                # Close WebSocket if still active
                websocket = self.active_connections[player_id]
                
                # Remove from active connections
                del self.active_connections[player_id]
                
                # Remove from match mapping
                if player_id in self.player_matches:
                    del self.player_matches[player_id]
                
                # Remove connection info
                if player_id in self.connection_info:
                    del self.connection_info[player_id]
                
                logger.info(f"❌ Player {player_id} disconnected. Total connections: {len(self.active_connections)}")
        
        except Exception as e:
            logger.error(f"Error disconnecting player {player_id}: {e}")
    
    async def send_to_player(self, player_id: str, message: GameMessage):
        """Send message to specific player"""
        try:
            if player_id not in self.active_connections:
                logger.warning(f"Attempted to send message to disconnected player: {player_id}")
                return False
            
            websocket = self.active_connections[player_id]
            
            # Convert message to JSON
            message_json = json.dumps(message.dict())
            
            # Send message
            await websocket.send_text(message_json)
            
            # Update statistics
            if player_id in self.connection_info:
                self.connection_info[player_id]["messages_sent"] += 1
                self.connection_info[player_id]["last_activity"] = asyncio.get_event_loop().time()
            
            return True
            
        except WebSocketDisconnect:
            logger.info(f"Player {player_id} disconnected during message send")
            self.disconnect(player_id)
            return False
        except Exception as e:
            logger.error(f"Failed to send message to {player_id}: {e}")
            self.disconnect(player_id)
            return False
    
    async def send_to_match(self, match_id: str, message: GameMessage, exclude_player: Optional[str] = None):
        """Send message to all players in a match"""
        try:
            # Find all players in the match
            match_players = [
                player_id for player_id, player_match_id in self.player_matches.items()
                if player_match_id == match_id and player_id != exclude_player
            ]
            
            # Send to each player
            success_count = 0
            for player_id in match_players:
                if await self.send_to_player(player_id, message):
                    success_count += 1
            
            logger.debug(f"Sent message to {success_count}/{len(match_players)} players in match {match_id}")
            return success_count
            
        except Exception as e:
            logger.error(f"Failed to send message to match {match_id}: {e}")
            return 0
    
    async def broadcast_to_all(self, message: GameMessage, exclude_player: Optional[str] = None):
        """Broadcast message to all connected players"""
        try:
            success_count = 0
            total_players = len(self.active_connections)
            
            for player_id in list(self.active_connections.keys()):
                if player_id != exclude_player:
                    if await self.send_to_player(player_id, message):
                        success_count += 1
            
            logger.debug(f"Broadcast message to {success_count}/{total_players} connected players")
            return success_count
            
        except Exception as e:
            logger.error(f"Failed to broadcast message: {e}")
            return 0
    
    def add_player_to_match(self, player_id: str, match_id: str):
        """Associate player with a match"""
        self.player_matches[player_id] = match_id
        logger.debug(f"Added player {player_id} to match {match_id}")
    
    def remove_player_from_match(self, player_id: str):
        """Remove player from match association"""
        if player_id in self.player_matches:
            match_id = self.player_matches[player_id]
            del self.player_matches[player_id]
            logger.debug(f"Removed player {player_id} from match {match_id}")
    
    def get_players_in_match(self, match_id: str) -> List[str]:
        """Get all players currently in a specific match"""
        return [
            player_id for player_id, player_match_id in self.player_matches.items()
            if player_match_id == match_id
        ]
    
    def get_player_match(self, player_id: str) -> Optional[str]:
        """Get the match ID for a specific player"""
        return self.player_matches.get(player_id)
    
    def is_player_connected(self, player_id: str) -> bool:
        """Check if player is currently connected"""
        return player_id in self.active_connections
    
    def get_connected_count(self) -> int:
        """Get total number of connected players"""
        return len(self.active_connections)
    
    def get_connected_players(self) -> List[str]:
        """Get list of all connected player IDs"""
        return list(self.active_connections.keys())
    
    def get_connection_stats(self) -> Dict:
        """Get connection statistics"""
        current_time = asyncio.get_event_loop().time()
        
        total_messages_sent = sum(
            info.get("messages_sent", 0) for info in self.connection_info.values()
        )
        
        total_messages_received = sum(
            info.get("messages_received", 0) for info in self.connection_info.values()
        )
        
        # Calculate average connection time
        connection_times = [
            current_time - info.get("connected_at", current_time)
            for info in self.connection_info.values()
        ]
        avg_connection_time = sum(connection_times) / len(connection_times) if connection_times else 0
        
        return {
            "total_connections": len(self.active_connections),
            "active_matches": len(set(self.player_matches.values())),
            "total_messages_sent": total_messages_sent,
            "total_messages_received": total_messages_received,
            "average_connection_time": avg_connection_time,
            "connection_info": dict(self.connection_info)
        }
    
    async def ping_all_connections(self):
        """Send ping to all connections to check health"""
        try:
            disconnected_players = []
            
            for player_id, websocket in self.active_connections.items():
                try:
                    # Send ping message
                    ping_message = GameMessage(
                        type=MessageType.PLAYER_CONNECT,  # Use as ping
                        data={"ping": True, "timestamp": asyncio.get_event_loop().time()}
                    )
                    
                    await self.send_to_player(player_id, ping_message)
                    
                except Exception as e:
                    logger.warning(f"Player {player_id} failed ping check: {e}")
                    disconnected_players.append(player_id)
            
            # Clean up disconnected players
            for player_id in disconnected_players:
                self.disconnect(player_id)
            
            if disconnected_players:
                logger.info(f"Cleaned up {len(disconnected_players)} dead connections")
                
        except Exception as e:
            logger.error(f"Error during connection health check: {e}")
    
    async def cleanup_idle_connections(self, max_idle_time: float = 300.0):
        """Remove connections that have been idle for too long"""
        try:
            current_time = asyncio.get_event_loop().time()
            idle_players = []
            
            for player_id, info in self.connection_info.items():
                last_activity = info.get("last_activity", current_time)
                if current_time - last_activity > max_idle_time:
                    idle_players.append(player_id)
            
            # Disconnect idle players
            for player_id in idle_players:
                logger.info(f"Disconnecting idle player: {player_id}")
                self.disconnect(player_id)
            
            return len(idle_players)
            
        except Exception as e:
            logger.error(f"Error cleaning up idle connections: {e}")
            return 0