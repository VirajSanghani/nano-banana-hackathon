"""
Pixel-Forge PvP Simple Demo Server
"""

import os
import json
import asyncio
import time
import random
import uuid
import logging
from typing import Dict, List, Optional, Any
from enum import Enum

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Game Types
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

# Simple Services
class WeaponGenerator:
    def __init__(self):
        self.templates = {
            "sword": {"damage": 70, "speed": 60, "range": 30, "ammo": 1, "cooldown": 2000, "special": "slash"},
            "bow": {"damage": 60, "speed": 80, "range": 150, "ammo": 20, "cooldown": 1500, "special": "pierce"},
            "staff": {"damage": 50, "speed": 40, "range": 120, "ammo": 10, "cooldown": 3000, "special": "magic"},
            "cannon": {"damage": 90, "speed": 30, "range": 180, "ammo": 5, "cooldown": 4000, "special": "explosive"},
            "dagger": {"damage": 45, "speed": 90, "range": 25, "ammo": 1, "cooldown": 1000, "special": "poison"},
        }
    
    async def generate_weapon(self, prompt: str, player_id: str, match_id: str):
        """Generate weapon from prompt"""
        await asyncio.sleep(0.5)  # Simulate generation time
        
        prompt_lower = prompt.lower()
        template_name = "sword"
        
        for name in self.templates:
            if name in prompt_lower:
                template_name = name
                break
        
        element = "normal"
        multiplier = 1.0
        
        if "fire" in prompt_lower:
            element = "fire"
            multiplier = 1.1
        elif "ice" in prompt_lower:
            element = "ice" 
            multiplier = 0.9
        elif "lightning" in prompt_lower:
            element = "lightning"
            multiplier = 1.2
        elif "poison" in prompt_lower:
            element = "poison"
            multiplier = 0.95
        
        template = self.templates[template_name]
        
        return {
            "id": str(uuid.uuid4()),
            "name": f"{element.title()} {template_name.title()}",
            "category": "projectile" if template_name in ["bow", "cannon"] else "melee",
            "properties": {
                "damage": int(template["damage"] * multiplier),
                "speed": template["speed"],
                "range": template["range"],
                "ammo": template["ammo"],
                "cooldown": template["cooldown"],
                "special_effect": f"{element}_{template['special']}",
                "effect_parameters": {"element": element}
            },
            "sprite_url": f"/sprites/{element}_{template_name}.png",
            "generated_at": time.time(),
            "balance_score": 75.0,
            "player_id": player_id
        }

class PhysicsEngine:
    def __init__(self):
        self.active_modifications = {}
        self.physics_library = [
            {
                "type": "gravity",
                "description": "Low Gravity",
                "keywords": ["low gravity", "moon gravity", "float", "weightless"],
                "parameters": {"multiplier": 0.3},
                "duration": 15.0
            },
            {
                "type": "bounce", 
                "description": "Bouncy World",
                "keywords": ["bouncy", "rubber", "trampoline", "bounce", "elastic"],
                "parameters": {"multiplier": 2.5},
                "duration": 18.0
            },
            {
                "type": "friction",
                "description": "Ice Floor",
                "keywords": ["ice", "slippery", "slide", "slick", "smooth"],
                "parameters": {"multiplier": 0.1},
                "duration": 20.0
            },
            {
                "type": "time_scale",
                "description": "Slow Motion",
                "keywords": ["slow motion", "bullet time", "matrix", "slow down"],
                "parameters": {"scale": 0.5},
                "duration": 8.0
            },
            {
                "type": "gravity",
                "description": "High Gravity",
                "keywords": ["high gravity", "heavy gravity", "weight", "pull down"],
                "parameters": {"multiplier": 2.0},
                "duration": 15.0
            }
        ]
    
    async def apply_master_prompt(self, prompt: str, match_id: str):
        """Apply physics modification from prompt"""
        prompt_lower = prompt.lower()
        
        for mod_data in self.physics_library:
            for keyword in mod_data["keywords"]:
                if keyword in prompt_lower:
                    modification = {
                        "id": f"mod_{int(time.time() * 1000)}",
                        "type": mod_data["type"],
                        "description": mod_data["description"],
                        "parameters": mod_data["parameters"].copy(),
                        "duration": mod_data["duration"],
                        "start_time": time.time(),
                        "match_id": match_id
                    }
                    
                    if match_id not in self.active_modifications:
                        self.active_modifications[match_id] = []
                    
                    self.active_modifications[match_id].append(modification)
                    return modification
        
        return None

# Global instances
weapon_generator = WeaponGenerator()
physics_engine = PhysicsEngine()

# Connection management
connections: Dict[str, WebSocket] = {}
active_matches: Dict[str, Dict] = {}
player_matches: Dict[str, str] = {}

# FastAPI app
app = FastAPI(title="Pixel-Forge PvP Demo", version="1.0.0")

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
        "name": "Pixel-Forge PvP Demo", 
        "status": "ready",
        "version": "1.0.0",
        "description": "Revolutionary AI-powered combat arena (Demo Mode)",
        "active_matches": len(active_matches),
        "connected_players": len(connections)
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_matches": len(active_matches),
        "connected_players": len(connections),
        "services": {
            "weapon_generator": True,
            "physics_engine": True,
            "match_manager": True
        }
    }

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    """Main WebSocket endpoint"""
    try:
        await websocket.accept()
        connections[player_id] = websocket
        logger.info(f"✅ Player {player_id} connected")
        
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "player_connect",
            "data": {
                "player_id": player_id,
                "message": "Connected to Pixel-Forge PvP Demo!",
                "server_time": time.time()
            },
            "timestamp": time.time()
        }))
        
        while True:
            # Receive message
            raw_data = await websocket.receive_text()
            message_data = json.loads(raw_data)
            
            # Handle message
            await handle_message(player_id, message_data)
            
    except WebSocketDisconnect:
        logger.info(f"❌ Player {player_id} disconnected")
        await handle_disconnect(player_id)
    except Exception as e:
        logger.error(f"WebSocket error for {player_id}: {e}")
        await handle_disconnect(player_id)

async def handle_message(player_id: str, message_data: Dict):
    """Handle incoming player messages"""
    try:
        message_type = message_data.get("type")
        data = message_data.get("data", {})
        
        if message_type == "find_match":
            await handle_find_match(player_id, data)
        elif message_type == "weapon_generate":
            await handle_weapon_generate(player_id, data)
        elif message_type == "master_prompt":
            await handle_master_prompt(player_id, data)
        elif message_type == "player_input":
            await handle_player_input(player_id, data)
        elif message_type == "weapon_use":
            await handle_weapon_use(player_id, data)
        else:
            logger.warning(f"Unknown message type: {message_type}")
            
    except Exception as e:
        logger.error(f"Error handling message from {player_id}: {e}")

async def handle_find_match(player_id: str, data: Dict):
    """Handle matchmaking"""
    try:
        # Create or find match
        match_id = f"match_{int(time.time())}"
        
        match = {
            "id": match_id,
            "status": "waiting",
            "players": [
                {
                    "id": player_id,
                    "name": data.get("player_name", f"Player_{player_id[-4:]}"),
                    "health": 100,
                    "position": {"x": 300 + random.randint(-50, 50), "y": 300 + random.randint(-50, 50)},
                    "velocity": {"x": 0, "y": 0},
                    "weapons": [],
                    "weapon_cooldown": 0.0,
                    "is_alive": True,
                    "kills": 0,
                    "deaths": 0
                }
            ],
            "projectiles": [],
            "physics": {
                "gravity": 800,
                "friction": 0.8,
                "restitution": 0.3,
                "time_scale": 1.0,
                "active_modifications": []
            },
            "start_time": None,
            "end_time": None,
            "winner_id": None,
            "last_master_prompt": 0
        }
        
        active_matches[match_id] = match
        player_matches[player_id] = match_id
        
        # Notify match found
        await send_to_player(player_id, {
            "type": "match_found",
            "data": {
                "match_id": match_id,
                "players": [{"id": p["id"], "name": p["name"]} for p in match["players"]],
                "status": match["status"]
            },
            "timestamp": time.time()
        })
        
        # Start match immediately for demo
        await asyncio.sleep(1)
        match["status"] = "active"
        match["start_time"] = time.time()
        
        await send_to_player(player_id, {
            "type": "match_start", 
            "data": {
                "match_id": match_id,
                "arena_config": {
                    "width": 1200,
                    "height": 600,
                    "gravity": match["physics"]["gravity"]
                }
            },
            "timestamp": time.time()
        })
        
        logger.info(f"🎯 Match {match_id} created and started for {player_id}")
        
    except Exception as e:
        logger.error(f"Error in find_match for {player_id}: {e}")

async def handle_weapon_generate(player_id: str, data: Dict):
    """Handle weapon generation"""
    try:
        prompt = data.get("prompt", "").strip()
        match_id = data.get("match_id")
        
        if not prompt:
            await send_to_player(player_id, {
                "type": "weapon_generated",
                "data": {"success": False, "error": "Empty prompt"},
                "timestamp": time.time()
            })
            return
        
        if len(prompt) > 100:
            await send_to_player(player_id, {
                "type": "weapon_generated", 
                "data": {"success": False, "error": "Prompt too long (max 100 chars)"},
                "timestamp": time.time()
            })
            return
        
        # Check cooldown (simplified)
        match = active_matches.get(match_id)
        if match:
            for player in match["players"]:
                if player["id"] == player_id:
                    if len(player["weapons"]) >= 5:
                        await send_to_player(player_id, {
                            "type": "weapon_generated",
                            "data": {"success": False, "error": "Max weapons reached (5/5)"},
                            "timestamp": time.time()
                        })
                        return
                    break
        
        # Generate weapon
        start_time = time.time()
        weapon = await weapon_generator.generate_weapon(prompt, player_id, match_id)
        generation_time = time.time() - start_time
        
        if weapon and match:
            # Add weapon to player
            for player in match["players"]:
                if player["id"] == player_id:
                    player["weapons"].append(weapon)
                    player["weapon_cooldown"] = time.time() + 12.0  # 12 second cooldown
                    break
            
            await send_to_player(player_id, {
                "type": "weapon_generated",
                "data": {
                    "success": True,
                    "weapon": weapon,
                    "player_id": player_id,
                    "generation_time": generation_time
                },
                "timestamp": time.time()
            })
            
            logger.info(f"⚔️ Generated weapon '{weapon['name']}' for {player_id}")
        else:
            await send_to_player(player_id, {
                "type": "weapon_generated",
                "data": {"success": False, "error": "Generation failed"},
                "timestamp": time.time()
            })
            
    except Exception as e:
        logger.error(f"Error in weapon generation for {player_id}: {e}")

async def handle_master_prompt(player_id: str, data: Dict):
    """Handle master prompt physics modification"""
    try:
        prompt = data.get("prompt", "").strip()
        match_id = data.get("match_id")
        
        if not prompt:
            return
        
        match = active_matches.get(match_id)
        if not match:
            return
        
        # Apply physics modification
        modification = await physics_engine.apply_master_prompt(prompt, match_id)
        
        if modification:
            match["physics"]["active_modifications"].append(modification)
            
            # Notify player
            await send_to_player(player_id, {
                "type": "physics_changed",
                "data": {
                    "modification": modification,
                    "physics_state": match["physics"]
                },
                "timestamp": time.time()
            })
            
            logger.info(f"🌀 Applied physics modification '{modification['description']}' to match {match_id}")
            
    except Exception as e:
        logger.error(f"Error in master prompt for {player_id}: {e}")

async def handle_player_input(player_id: str, data: Dict):
    """Handle player input"""
    # For demo, just acknowledge input
    pass

async def handle_weapon_use(player_id: str, data: Dict):
    """Handle weapon usage"""
    # For demo, just acknowledge weapon use
    pass

async def handle_disconnect(player_id: str):
    """Handle player disconnection"""
    if player_id in connections:
        del connections[player_id]
    
    if player_id in player_matches:
        match_id = player_matches[player_id]
        del player_matches[player_id]
        
        # Clean up match if empty
        if match_id in active_matches:
            match = active_matches[match_id]
            match["players"] = [p for p in match["players"] if p["id"] != player_id]
            
            if not match["players"]:
                del active_matches[match_id]

async def send_to_player(player_id: str, message: Dict):
    """Send message to specific player"""
    if player_id in connections:
        try:
            await connections[player_id].send_text(json.dumps(message))
        except:
            await handle_disconnect(player_id)

# Background game loop
async def game_loop():
    """Simple game loop for demo"""
    while True:
        try:
            # Update all active matches
            for match in list(active_matches.values()):
                if match["status"] == "active":
                    # Send simple game state update
                    for player in match["players"]:
                        if player["id"] in connections:
                            await send_to_player(player["id"], {
                                "type": "game_state_update",
                                "data": {
                                    "match_id": match["id"],
                                    "players": match["players"],
                                    "projectiles": match["projectiles"],
                                    "physics": match["physics"],
                                    "duration": time.time() - match["start_time"] if match["start_time"] else 0
                                },
                                "timestamp": time.time()
                            })
            
            await asyncio.sleep(1/20)  # 20 FPS for demo
            
        except Exception as e:
            logger.error(f"Error in game loop: {e}")
            await asyncio.sleep(1)

# Auto physics modification for demo
async def auto_physics_loop():
    """Automatically apply physics modifications for demo"""
    random_prompts = ["low gravity", "bouncy world", "ice floor", "slow motion", "high gravity"]
    
    while True:
        try:
            await asyncio.sleep(30)  # Every 30 seconds
            
            for match in list(active_matches.values()):
                if match["status"] == "active" and match["players"]:
                    # Apply random modification
                    prompt = random.choice(random_prompts)
                    modification = await physics_engine.apply_master_prompt(prompt, match["id"])
                    
                    if modification:
                        match["physics"]["active_modifications"].append(modification)
                        match["last_master_prompt"] = time.time()
                        
                        # Notify all players in match
                        for player in match["players"]:
                            await send_to_player(player["id"], {
                                "type": "physics_changed",
                                "data": {
                                    "modification": modification,
                                    "physics_state": match["physics"],
                                    "auto_generated": True
                                },
                                "timestamp": time.time()
                            })
                        
                        logger.info(f"🔄 Auto-applied '{modification['description']}' to match {match['id']}")
        
        except Exception as e:
            logger.error(f"Error in auto physics loop: {e}")

# Start background tasks
@app.on_event("startup")
async def startup():
    logger.info("🚀 Starting Pixel-Forge PvP Demo Server")
    asyncio.create_task(game_loop())
    asyncio.create_task(auto_physics_loop())

@app.on_event("shutdown")
async def shutdown():
    logger.info("🔄 Shutting down Pixel-Forge PvP Demo Server")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("simple_server:app", host="0.0.0.0", port=8000, reload=True)