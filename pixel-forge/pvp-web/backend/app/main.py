"""
Pixel-Forge PvP Backend Server
Real-time AI-powered combat arena with weapon generation
"""

import os
import sys
import json
import asyncio
import time
from typing import Dict, List, Optional, Set
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Add shared types to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'shared'))
try:
    from types.game_types import *
except ImportError:
    # Define minimal types for demo
    from enum import Enum
    from typing import Dict, List, Optional, Any
    from pydantic import BaseModel
    import time
    
    class WeaponCategory(Enum):
        PROJECTILE = "projectile"
        MELEE = "melee"
        AREA_EFFECT = "area_effect"
        UTILITY = "utility"
        MAGIC = "magic"
    
    class PhysicsModType(Enum):
        GRAVITY = "gravity"
        FRICTION = "friction"
        BOUNCE = "bounce"
        TIME_SCALE = "time_scale"
        WEAPON_BEHAVIOR = "weapon_behavior"
    
    class MatchStatus(Enum):
        WAITING = "waiting"
        STARTING = "starting"
        ACTIVE = "active"
        FINISHED = "finished"
        CANCELLED = "cancelled"
    
    class WeaponProperties(BaseModel):
        damage: int
        speed: int
        range: int
        ammo: int
        cooldown: int
        special_effect: str
        effect_parameters: Dict[str, Any] = {}
    
    class Weapon(BaseModel):
        id: str
        name: str
        category: WeaponCategory
        properties: WeaponProperties
        sprite_url: str
        generated_at: float
        balance_score: float
        player_id: str
    
    class PhysicsModification(BaseModel):
        id: str
        type: PhysicsModType
        description: str
        parameters: Dict[str, float]
        duration: float
        start_time: float
        match_id: str
        
        def is_active(self) -> bool:
            return time.time() < (self.start_time + self.duration)
    
    class PhysicsState(BaseModel):
        gravity: float = 800
        friction: float = 0.8
        restitution: float = 0.3
        time_scale: float = 1.0
        active_modifications: List[PhysicsModification] = []
    
    class PlayerState(BaseModel):
        id: str
        name: str
        health: int = 100
        position: Dict[str, float] = {"x": 0, "y": 0}
        velocity: Dict[str, float] = {"x": 0, "y": 0}
        weapons: List[Weapon] = []
        weapon_cooldown: float = 0.0
        is_alive: bool = True
        kills: int = 0
        deaths: int = 0
    
    class Projectile(BaseModel):
        id: str
        weapon_id: str
        player_id: str
        position: Dict[str, float]
        velocity: Dict[str, float]
        damage: int
        created_at: float
        expires_at: float
    
    class MatchState(BaseModel):
        id: str
        status: MatchStatus = MatchStatus.WAITING
        players: List[PlayerState] = []
        projectiles: List[Projectile] = []
        physics: PhysicsState = PhysicsState()
        start_time: Optional[float] = None
        end_time: Optional[float] = None
        winner_id: Optional[str] = None
        last_master_prompt: float = 0
        
        def get_duration(self) -> float:
            if self.start_time:
                end = self.end_time or time.time()
                return end - self.start_time
            return 0.0
    
    class MessageType(Enum):
        PLAYER_CONNECT = "player_connect"
        PLAYER_DISCONNECT = "player_disconnect"
        FIND_MATCH = "find_match"
        MATCH_FOUND = "match_found"
        MATCH_START = "match_start"
        MATCH_END = "match_end"
        PLAYER_INPUT = "player_input"
        GAME_STATE_UPDATE = "game_state_update"
        WEAPON_GENERATE = "weapon_generate"
        WEAPON_GENERATED = "weapon_generated"
        WEAPON_USE = "weapon_use"
        MASTER_PROMPT = "master_prompt"
        PHYSICS_CHANGED = "physics_changed"
        PROJECTILE_FIRED = "projectile_fired"
        PLAYER_HIT = "player_hit"
        PLAYER_DEATH = "player_death"
    
    class GameMessage(BaseModel):
        type: MessageType
        data: Dict[str, Any]
        timestamp: float = time.time()
        player_id: Optional[str] = None

from services.simple_services import WeaponGenerator, PhysicsEngine, MatchManager, ConnectionManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global services
weapon_generator = WeaponGenerator()
physics_engine = PhysicsEngine()
match_manager = MatchManager(weapon_generator, physics_engine)
connection_manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting Pixel-Forge PvP Server")
    
    # Initialize services
    await weapon_generator.initialize()
    
    # Start background tasks
    asyncio.create_task(game_loop())
    asyncio.create_task(master_prompt_scheduler())
    
    yield
    
    logger.info("🔄 Shutting down Pixel-Forge PvP Server")
    await weapon_generator.cleanup()

# Create FastAPI app
app = FastAPI(
    title="Pixel-Forge PvP",
    description="Revolutionary AI-powered combat arena",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "name": "Pixel-Forge PvP",
        "status": "ready",
        "version": "1.0.0",
        "description": "Revolutionary AI-powered combat arena",
        "active_matches": match_manager.get_active_match_count(),
        "connected_players": connection_manager.get_connected_count()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_matches": match_manager.get_active_match_count(),
        "connected_players": connection_manager.get_connected_count(),
        "services": {
            "weapon_generator": weapon_generator.is_healthy(),
            "physics_engine": True,
            "match_manager": True
        }
    }

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    """Main WebSocket endpoint for real-time multiplayer"""
    try:
        await connection_manager.connect(websocket, player_id)
        logger.info(f"Player {player_id} connected")
        
        # Send welcome message
        await connection_manager.send_to_player(player_id, GameMessage(
            type=MessageType.PLAYER_CONNECT,
            data={
                "player_id": player_id,
                "message": "Connected to Pixel-Forge PvP!",
                "server_time": time.time()
            }
        ))
        
        while True:
            # Receive message from client
            raw_data = await websocket.receive_text()
            message_data = json.loads(raw_data)
            message = GameMessage(**message_data)
            
            # Handle message
            await handle_player_message(player_id, message)
            
    except WebSocketDisconnect:
        logger.info(f"Player {player_id} disconnected")
        await handle_player_disconnect(player_id)
    except Exception as e:
        logger.error(f"WebSocket error for player {player_id}: {e}")
        await handle_player_disconnect(player_id)

async def handle_player_message(player_id: str, message: GameMessage):
    """Handle incoming messages from players"""
    try:
        message.player_id = player_id
        
        if message.type == MessageType.FIND_MATCH:
            await handle_find_match(player_id, message.data)
        
        elif message.type == MessageType.PLAYER_INPUT:
            await handle_player_input(player_id, message.data)
        
        elif message.type == MessageType.WEAPON_GENERATE:
            await handle_weapon_generation(player_id, message.data)
        
        elif message.type == MessageType.WEAPON_USE:
            await handle_weapon_use(player_id, message.data)
        
        elif message.type == MessageType.MASTER_PROMPT:
            await handle_master_prompt(player_id, message.data)
        
        else:
            logger.warning(f"Unknown message type: {message.type}")
            
    except Exception as e:
        logger.error(f"Error handling message from {player_id}: {e}")
        await connection_manager.send_to_player(player_id, GameMessage(
            type=MessageType.PLAYER_DISCONNECT,
            data={"error": str(e)}
        ))

async def handle_find_match(player_id: str, data: Dict):
    """Handle matchmaking request"""
    try:
        match = await match_manager.find_or_create_match(player_id)
        
        if match:
            # Notify players about match
            for player in match.players:
                await connection_manager.send_to_player(player.id, GameMessage(
                    type=MessageType.MATCH_FOUND,
                    data={
                        "match_id": match.id,
                        "players": [{"id": p.id, "name": p.name} for p in match.players],
                        "status": match.status.value
                    }
                ))
            
            # Start match if enough players
            if len(match.players) >= 2 and match.status == MatchStatus.WAITING:
                await match_manager.start_match(match.id)
                
                # Notify match start
                for player in match.players:
                    await connection_manager.send_to_player(player.id, GameMessage(
                        type=MessageType.MATCH_START,
                        data={
                            "match_id": match.id,
                            "arena_config": {
                                "width": 1200,
                                "height": 600,
                                "gravity": match.physics.gravity
                            }
                        }
                    ))
    
    except Exception as e:
        logger.error(f"Error in find_match for {player_id}: {e}")
        await connection_manager.send_to_player(player_id, GameMessage(
            type=MessageType.PLAYER_DISCONNECT,
            data={"error": "Matchmaking failed"}
        ))

async def handle_weapon_generation(player_id: str, data: Dict):
    """Handle weapon generation request"""
    try:
        prompt = data.get("prompt", "").strip()
        match_id = data.get("match_id")
        
        if not prompt or len(prompt) > 20:
            await connection_manager.send_to_player(player_id, GameMessage(
                type=MessageType.WEAPON_GENERATED,
                data={"success": False, "error": "Invalid prompt (max 20 words)"}
            ))
            return
        
        # Check if player can generate weapon (cooldown)
        match = match_manager.get_match(match_id)
        if not match:
            await connection_manager.send_to_player(player_id, GameMessage(
                type=MessageType.WEAPON_GENERATED,
                data={"success": False, "error": "Match not found"}
            ))
            return
        
        player_state = match_manager.get_player_state(match_id, player_id)
        if not player_state:
            await connection_manager.send_to_player(player_id, GameMessage(
                type=MessageType.WEAPON_GENERATED,
                data={"success": False, "error": "Player not in match"}
            ))
            return
        
        if time.time() < player_state.weapon_cooldown:
            remaining = int(player_state.weapon_cooldown - time.time())
            await connection_manager.send_to_player(player_id, GameMessage(
                type=MessageType.WEAPON_GENERATED,
                data={"success": False, "error": f"Cooldown: {remaining}s remaining"}
            ))
            return
        
        # Generate weapon
        start_time = time.time()
        weapon = await weapon_generator.generate_weapon(prompt, player_id, match_id)
        generation_time = time.time() - start_time
        
        if weapon:
            # Set cooldown
            player_state.weapon_cooldown = time.time() + 12.0  # 12 second cooldown
            
            # Add weapon to player
            player_state.weapons.append(weapon)
            
            # Notify all players in match
            for player in match.players:
                await connection_manager.send_to_player(player.id, GameMessage(
                    type=MessageType.WEAPON_GENERATED,
                    data={
                        "success": True,
                        "weapon": weapon.dict(),
                        "player_id": player_id,
                        "generation_time": generation_time
                    }
                ))
        else:
            await connection_manager.send_to_player(player_id, GameMessage(
                type=MessageType.WEAPON_GENERATED,
                data={"success": False, "error": "Weapon generation failed"}
            ))
    
    except Exception as e:
        logger.error(f"Error in weapon generation for {player_id}: {e}")
        await connection_manager.send_to_player(player_id, GameMessage(
            type=MessageType.WEAPON_GENERATED,
            data={"success": False, "error": "Generation failed"}
        ))

async def handle_master_prompt(player_id: str, data: Dict):
    """Handle master prompt physics modification"""
    try:
        prompt = data.get("prompt", "").strip()
        match_id = data.get("match_id")
        
        if not prompt:
            return
        
        match = match_manager.get_match(match_id)
        if not match:
            return
        
        # Apply physics modification
        modification = await physics_engine.apply_master_prompt(prompt, match_id)
        
        if modification:
            match.physics.active_modifications.append(modification)
            match.physics.apply_modifications()
            
            # Notify all players in match
            for player in match.players:
                await connection_manager.send_to_player(player.id, GameMessage(
                    type=MessageType.PHYSICS_CHANGED,
                    data={
                        "modification": modification.dict(),
                        "physics_state": match.physics.dict()
                    }
                ))
    
    except Exception as e:
        logger.error(f"Error in master prompt for {player_id}: {e}")

async def handle_player_input(player_id: str, data: Dict):
    """Handle player input for movement and actions"""
    try:
        match_id = data.get("match_id")
        input_data = data.get("input", {})
        
        if match_id and input_data:
            match = match_manager.get_match(match_id)
            if match:
                # Update player state based on input
                await match_manager.handle_player_input(match_id, player_id, input_data)
    
    except Exception as e:
        logger.error(f"Error handling player input for {player_id}: {e}")

async def handle_weapon_use(player_id: str, data: Dict):
    """Handle weapon usage"""
    try:
        match_id = data.get("match_id")
        weapon_id = data.get("weapon_id")
        target_position = data.get("target_position", {})
        
        if match_id and weapon_id:
            await match_manager.use_weapon(match_id, player_id, weapon_id, target_position)
    
    except Exception as e:
        logger.error(f"Error handling weapon use for {player_id}: {e}")

async def handle_player_disconnect(player_id: str):
    """Handle player disconnection"""
    try:
        # Remove from active match
        await match_manager.remove_player(player_id)
        
        # Remove from connection manager
        connection_manager.disconnect(player_id)
        
    except Exception as e:
        logger.error(f"Error handling disconnect for {player_id}: {e}")

async def game_loop():
    """Main game loop - runs at 60 FPS"""
    while True:
        try:
            start_time = time.time()
            
            # Update all active matches
            await match_manager.update_matches()
            
            # Send game state updates to players
            for match in match_manager.get_active_matches():
                if match.status == MatchStatus.ACTIVE:
                    game_state = {
                        "match_id": match.id,
                        "players": [p.dict() for p in match.players],
                        "projectiles": [proj.dict() for proj in match.projectiles],
                        "physics": match.physics.dict(),
                        "duration": match.get_duration()
                    }
                    
                    # Send to all players in match
                    for player in match.players:
                        await connection_manager.send_to_player(player.id, GameMessage(
                            type=MessageType.GAME_STATE_UPDATE,
                            data=game_state
                        ))
            
            # Maintain 60 FPS
            elapsed = time.time() - start_time
            sleep_time = max(0, 1/60 - elapsed)
            await asyncio.sleep(sleep_time)
            
        except Exception as e:
            logger.error(f"Error in game loop: {e}")
            await asyncio.sleep(1/60)

async def master_prompt_scheduler():
    """Automatically trigger master prompts every 30-45 seconds"""
    while True:
        try:
            await asyncio.sleep(35)  # Wait 35 seconds
            
            # Apply random master prompts to active matches
            for match in match_manager.get_active_matches():
                if match.status == MatchStatus.ACTIVE:
                    time_since_last = time.time() - match.last_master_prompt
                    
                    if time_since_last > 30:  # At least 30 seconds since last
                        # Generate random master prompt
                        random_prompts = [
                            "low gravity",
                            "bouncy world", 
                            "ice floor",
                            "slow motion",
                            "high gravity",
                            "super speed",
                            "sticky ground"
                        ]
                        
                        import random
                        prompt = random.choice(random_prompts)
                        
                        # Apply modification
                        modification = await physics_engine.apply_master_prompt(prompt, match.id)
                        
                        if modification:
                            match.physics.active_modifications.append(modification)
                            match.physics.apply_modifications()
                            match.last_master_prompt = time.time()
                            
                            # Notify all players
                            for player in match.players:
                                await connection_manager.send_to_player(player.id, GameMessage(
                                    type=MessageType.PHYSICS_CHANGED,
                                    data={
                                        "modification": modification.dict(),
                                        "physics_state": match.physics.dict(),
                                        "auto_generated": True
                                    }
                                ))
        
        except Exception as e:
            logger.error(f"Error in master prompt scheduler: {e}")
            await asyncio.sleep(35)

# Serve static files for frontend
if os.path.exists("../frontend/dist"):
    app.mount("/static", StaticFiles(directory="../frontend/dist"), name="static")

@app.get("/game")
async def serve_game():
    """Serve the game frontend"""
    if os.path.exists("../frontend/dist/index.html"):
        return FileResponse("../frontend/dist/index.html")
    else:
        return HTMLResponse("""
        <html>
            <head><title>Pixel-Forge PvP</title></head>
            <body>
                <h1>🎮 Pixel-Forge PvP Server Running</h1>
                <p>Backend server is active. Build and serve the frontend to play!</p>
                <p>Active matches: <span id="matches">Loading...</span></p>
                <p>Connected players: <span id="players">Loading...</span></p>
                
                <script>
                    async function updateStats() {
                        try {
                            const response = await fetch('/health');
                            const data = await response.json();
                            document.getElementById('matches').textContent = data.active_matches;
                            document.getElementById('players').textContent = data.connected_players;
                        } catch (e) {
                            console.error('Failed to fetch stats:', e);
                        }
                    }
                    
                    updateStats();
                    setInterval(updateStats, 5000);
                </script>
            </body>
        </html>
        """)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=bool(os.getenv("DEBUG", True)),
        log_level="info"
    )