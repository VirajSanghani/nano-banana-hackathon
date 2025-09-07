"""
Enhanced Pixel-Forge PvP Server with Fal AI Integration
Real AI weapon generation with beautiful sprites
"""

import os
import time
import random
import logging
import uuid
import asyncio
import json
import base64
import requests
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import fal_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Fal AI
fal_client.api_key = os.getenv("FAL_KEY")

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

@dataclass
class WeaponData:
    id: str
    name: str
    category: str
    properties: Dict[str, Any]
    sprite_url: str
    sprite_data: Optional[str] = None  # Base64 encoded image
    generated_at: float = 0.0
    balance_score: float = 75.0
    player_id: str = ""

@dataclass
class PhysicsModification:
    id: str
    type: PhysicsModType
    description: str
    parameters: Dict[str, Any]
    duration: float
    start_time: float
    match_id: str
    
    def is_active(self) -> bool:
        return time.time() < (self.start_time + self.duration)

# Enhanced Weapon Generator with Fal AI
class EnhancedWeaponGenerator:
    def __init__(self):
        self.cache = {}
        self.is_initialized = False
        self.generation_count = 0
        
        # Enhanced weapon templates with detailed prompts
        self.weapon_templates = {
            "sword": {
                "damage": 70, "speed": 60, "range": 30, "ammo": 1, "cooldown": 2000,
                "special": "slash", "prompt_base": "medieval fantasy sword weapon"
            },
            "bow": {
                "damage": 60, "speed": 80, "range": 150, "ammo": 20, "cooldown": 1500,
                "special": "pierce", "prompt_base": "fantasy archer bow weapon"
            },
            "staff": {
                "damage": 50, "speed": 40, "range": 120, "ammo": 10, "cooldown": 3000,
                "special": "magic", "prompt_base": "magical wizard staff weapon"
            },
            "cannon": {
                "damage": 90, "speed": 30, "range": 180, "ammo": 5, "cooldown": 4000,
                "special": "explosive", "prompt_base": "steampunk cannon weapon"
            },
            "dagger": {
                "damage": 45, "speed": 90, "range": 25, "ammo": 1, "cooldown": 1000,
                "special": "poison", "prompt_base": "assassin dagger weapon"
            },
            "axe": {
                "damage": 85, "speed": 50, "range": 35, "ammo": 1, "cooldown": 2500,
                "special": "cleave", "prompt_base": "viking battle axe weapon"
            },
            "orb": {
                "damage": 65, "speed": 70, "range": 100, "ammo": 15, "cooldown": 1800,
                "special": "energy", "prompt_base": "magical energy orb weapon"
            }
        }
        
        # Element effects for AI prompts
        self.elements = {
            "fire": {"multiplier": 1.1, "color": "red orange flames", "effect": "burning"},
            "ice": {"multiplier": 0.9, "color": "blue white frost", "effect": "freezing"},
            "lightning": {"multiplier": 1.2, "color": "electric blue yellow", "effect": "shocking"},
            "poison": {"multiplier": 0.95, "color": "green purple toxic", "effect": "venomous"},
            "shadow": {"multiplier": 1.0, "color": "dark purple black", "effect": "cursed"},
            "light": {"multiplier": 1.05, "color": "golden white radiant", "effect": "holy"},
            "earth": {"multiplier": 1.0, "color": "brown green stone", "effect": "crushing"},
            "wind": {"multiplier": 0.85, "color": "light blue white", "effect": "swift"}
        }
    
    async def initialize(self):
        self.is_initialized = True
        logger.info("🔧 Enhanced Weapon Generator initialized with Fal AI")
    
    async def cleanup(self):
        pass
    
    def is_healthy(self):
        return True
    
    async def generate_weapon(self, prompt: str, player_id: str, match_id: str) -> WeaponData:
        """Generate a weapon with real AI sprite using Fal AI"""
        try:
            self.generation_count += 1
            
            # Parse prompt for weapon type and element
            prompt_lower = prompt.lower().strip()
            
            # Find weapon type
            weapon_type = "sword"  # default
            for weapon_name in self.weapon_templates:
                if weapon_name in prompt_lower:
                    weapon_type = weapon_name
                    break
            
            # Find element
            element = "normal"
            element_data = {"multiplier": 1.0, "color": "", "effect": "normal"}
            for elem_name, elem_data in self.elements.items():
                if elem_name in prompt_lower:
                    element = elem_name
                    element_data = elem_data
                    break
            
            # Get base template
            template = self.weapon_templates[weapon_type]
            
            # Create AI prompt for weapon sprite generation
            ai_prompt = self._create_weapon_prompt(weapon_type, element, element_data, template, prompt)
            
            # Generate weapon sprite with Fal AI
            sprite_data = await self._generate_weapon_sprite(ai_prompt)
            
            # Calculate weapon stats with element modifiers
            weapon_stats = self._calculate_weapon_stats(template, element_data, prompt_lower)
            
            # Create weapon data
            weapon_id = f"weapon_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
            weapon_name = f"{element.title()} {weapon_type.title()}" if element != "normal" else weapon_type.title()
            
            weapon_data = WeaponData(
                id=weapon_id,
                name=weapon_name,
                category=self._determine_category(weapon_type),
                properties=weapon_stats,
                sprite_url=f"/sprites/{weapon_id}.png",
                sprite_data=sprite_data,
                generated_at=time.time(),
                balance_score=self._calculate_balance_score(weapon_stats),
                player_id=player_id
            )
            
            logger.info(f"Generated weapon '{weapon_name}' for player {player_id}")
            return weapon_data
            
        except Exception as e:
            logger.error(f"Error generating weapon: {e}")
            # Fallback to template-based generation
            return await self._generate_template_weapon(prompt, player_id, match_id)
    
    def _create_weapon_prompt(self, weapon_type: str, element: str, element_data: dict, template: dict, original_prompt: str) -> str:
        """Create detailed AI prompt for weapon sprite generation"""
        base_prompt = template["prompt_base"]
        element_desc = ""
        
        if element != "normal":
            colors = element_data["color"]
            effect = element_data["effect"]
            element_desc = f"with {colors} {effect} magical effects, glowing {element} elemental energy"
        
        # Enhanced prompt engineering for better weapon sprites
        prompt = f"""
        A detailed pixel art style {base_prompt} {element_desc}, 
        64x64 pixels, game sprite, clean background, 
        sharp details, vibrant colors, fantasy RPG style,
        suitable for 2D top-down game, centered composition,
        high contrast, pixel perfect art
        """
        
        # Add any specific details from user prompt
        if "legendary" in original_prompt.lower():
            prompt += ", legendary quality with golden accents"
        if "cursed" in original_prompt.lower():
            prompt += ", dark cursed aura with purple smoke"
        if "crystal" in original_prompt.lower():
            prompt += ", made of magical crystal material"
        
        return prompt.strip()
    
    async def _generate_weapon_sprite(self, prompt: str) -> str:
        """Generate weapon sprite using Fal AI"""
        try:
            # Use Fal AI's fast image generation
            handler = fal_client.submit(
                "fal-ai/flux/schnell",
                arguments={
                    "prompt": prompt,
                    "image_size": "square_hd",
                    "num_images": 1,
                    "enable_safety_checker": True,
                }
            )
            
            # Wait for result
            result = handler.get()
            
            if result and "images" in result and len(result["images"]) > 0:
                image_url = result["images"][0]["url"]
                
                # Download image and convert to base64
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_data = base64.b64encode(response.content).decode('utf-8')
                    return f"data:image/png;base64,{image_data}"
            
            return None
            
        except Exception as e:
            logger.error(f"Fal AI generation failed: {e}")
            return None
    
    def _calculate_weapon_stats(self, template: dict, element_data: dict, prompt_lower: str) -> dict:
        """Calculate weapon statistics with modifiers"""
        base_stats = template.copy()
        multiplier = element_data["multiplier"]
        
        # Apply element multiplier
        base_stats["damage"] = int(base_stats["damage"] * multiplier)
        
        # Apply prompt-based modifiers
        if "heavy" in prompt_lower or "massive" in prompt_lower:
            base_stats["damage"] = int(base_stats["damage"] * 1.2)
            base_stats["speed"] = int(base_stats["speed"] * 0.8)
        elif "light" in prompt_lower or "swift" in prompt_lower:
            base_stats["speed"] = int(base_stats["speed"] * 1.3)
            base_stats["damage"] = int(base_stats["damage"] * 0.9)
        
        if "long" in prompt_lower or "extended" in prompt_lower:
            base_stats["range"] = int(base_stats["range"] * 1.4)
        
        # Add special effect based on element
        element_name = None
        for elem in self.elements:
            if elem in prompt_lower:
                element_name = elem
                break
        
        if element_name:
            base_stats["special_effect"] = f"{element_name}_{base_stats['special']}"
            base_stats["effect_parameters"] = {
                "element": element_name,
                "intensity": random.uniform(0.8, 1.2)
            }
        
        return base_stats
    
    def _determine_category(self, weapon_type: str) -> str:
        """Determine weapon category"""
        if weapon_type in ["bow", "cannon"]:
            return "projectile"
        elif weapon_type in ["staff", "orb"]:
            return "magic"
        else:
            return "melee"
    
    def _calculate_balance_score(self, stats: dict) -> float:
        """Calculate weapon balance score"""
        damage = stats.get("damage", 50)
        speed = stats.get("speed", 50)
        range_val = stats.get("range", 50)
        
        # Balance formula
        total_power = (damage * 0.4) + (speed * 0.3) + (range_val * 0.3)
        balance_score = max(0, min(100, 100 - abs(total_power - 65)))
        
        return round(balance_score, 1)
    
    async def _generate_template_weapon(self, prompt: str, player_id: str, match_id: str) -> WeaponData:
        """Fallback template-based weapon generation"""
        prompt_lower = prompt.lower()
        
        # Find matching template
        template_name = "sword"
        for name in self.weapon_templates:
            if name in prompt_lower:
                template_name = name
                break
        
        # Find element
        element = "normal"
        multiplier = 1.0
        for elem_name, elem_data in self.elements.items():
            if elem_name in prompt_lower:
                element = elem_name
                multiplier = elem_data["multiplier"]
                break
        
        template = self.weapon_templates[template_name].copy()
        
        weapon_id = f"template_{int(time.time() * 1000)}"
        weapon_data = WeaponData(
            id=weapon_id,
            name=f"{element.title()} {template_name.title()}",
            category=self._determine_category(template_name),
            properties={
                "damage": int(template["damage"] * multiplier),
                "speed": template["speed"],
                "range": template["range"],
                "ammo": template["ammo"],
                "cooldown": template["cooldown"],
                "special_effect": f"{element}_{template['special']}",
                "effect_parameters": {"element": element}
            },
            sprite_url=f"/sprites/{element}_{template_name}.png",
            generated_at=time.time(),
            balance_score=75.0,
            player_id=player_id
        )
        
        return weapon_data

# Enhanced Physics Engine (same as before but with logging)
class EnhancedPhysicsEngine:
    def __init__(self):
        self.active_modifications = {}
        self.modification_history = []
        self.physics_library = self._create_physics_library()
        logger.info("🔧 Enhanced Physics Engine initialized")
    
    async def apply_master_prompt(self, prompt: str, match_id: str) -> Optional[PhysicsModification]:
        """Apply physics modification from master prompt"""
        prompt_lower = prompt.lower()
        
        # Find matching modification
        for mod_data in self.physics_library:
            for keyword in mod_data["keywords"]:
                if keyword in prompt_lower:
                    modification = PhysicsModification(
                        id=f"mod_{int(time.time() * 1000)}",
                        type=PhysicsModType(mod_data["type"]),
                        description=mod_data["description"],
                        parameters=mod_data["parameters"].copy(),
                        duration=mod_data["duration"],
                        start_time=time.time(),
                        match_id=match_id
                    )
                    
                    if match_id not in self.active_modifications:
                        self.active_modifications[match_id] = []
                    
                    self.active_modifications[match_id].append(modification)
                    self.modification_history.append(modification)
                    
                    logger.info(f"Applied '{modification.description}' to match {match_id}")
                    return modification
        
        return None
    
    def _create_physics_library(self):
        """Create comprehensive physics modification library"""
        return [
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
                "keywords": ["bouncy", "rubber", "trampoline", "bounce"],
                "parameters": {"multiplier": 2.5},
                "duration": 18.0
            },
            {
                "type": "friction",
                "description": "Ice Floor",
                "keywords": ["ice", "slippery", "slide", "slick"],
                "parameters": {"multiplier": 0.1},
                "duration": 20.0
            },
            {
                "type": "time_scale",
                "description": "Slow Motion",
                "keywords": ["slow motion", "bullet time", "matrix"],
                "parameters": {"scale": 0.5},
                "duration": 8.0
            },
            {
                "type": "weapon_behavior",
                "description": "Double Damage",
                "keywords": ["double damage", "power up", "stronger"],
                "parameters": {"damage_multiplier": 2.0},
                "duration": 12.0
            }
        ]
    
    def get_active_modifications(self, match_id: str):
        return self.active_modifications.get(match_id, [])

# Enhanced Match Manager and Connection Manager (similar structure)
class EnhancedMatchManager:
    def __init__(self, weapon_generator, physics_engine):
        self.weapon_generator = weapon_generator
        self.physics_engine = physics_engine
        self.active_matches = {}
        self.player_matches = {}
        logger.info("🔧 Enhanced Match Manager initialized")
    
    async def find_or_create_match(self, player_id: str):
        """Create enhanced match with AI support"""
        match_id = f"match_{int(time.time())}"
        
        match_data = {
            "id": match_id,
            "status": "waiting",
            "players": [{
                "id": player_id,
                "name": f"Player_{player_id[-4:]}",
                "health": 100,
                "position": {"x": 300, "y": 300},
                "velocity": {"x": 0, "y": 0},
                "weapons": [],
                "weapon_cooldown": 0.0,
                "is_alive": True,
                "kills": 0,
                "deaths": 0,
                "ai_weapons_generated": 0
            }],
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
            "last_master_prompt": 0,
            "ai_generation_enabled": True
        }
        
        class MockMatch:
            def __init__(self, data):
                self.__dict__.update(data)
            def dict(self):
                return self.__dict__
        
        match = MockMatch(match_data)
        self.active_matches[match_id] = match
        self.player_matches[player_id] = match_id
        
        return match
    
    def get_match(self, match_id: str):
        return self.active_matches.get(match_id)

class EnhancedConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.connection_info = {}
        logger.info("🔌 Enhanced Connection Manager initialized")
    
    async def connect(self, websocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        self.connection_info[player_id] = {
            "connected_at": time.time(),
            "messages_sent": 0,
            "messages_received": 0
        }
        logger.info(f"✅ Player {player_id} connected")
    
    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        if player_id in self.connection_info:
            del self.connection_info[player_id]
        logger.info(f"❌ Player {player_id} disconnected")
    
    async def send_to_player(self, player_id: str, message):
        if player_id in self.active_connections:
            websocket = self.active_connections[player_id]
            try:
                await websocket.send_text(json.dumps(message.dict() if hasattr(message, 'dict') else message))
                return True
            except:
                self.disconnect(player_id)
                return False
        return False
    
    def get_connected_count(self):
        return len(self.active_connections)

# Create FastAPI app
app = FastAPI(title="Pixel-Forge PvP Enhanced Server", version="2.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
weapon_generator = EnhancedWeaponGenerator()
physics_engine = EnhancedPhysicsEngine()
match_manager = EnhancedMatchManager(weapon_generator, physics_engine)
connection_manager = EnhancedConnectionManager()

@app.on_event("startup")
async def startup_event():
    await weapon_generator.initialize()
    logger.info("🚀 Enhanced Pixel-Forge PvP Server Started with Fal AI!")

@app.on_event("shutdown")
async def shutdown_event():
    await weapon_generator.cleanup()
    logger.info("🛑 Enhanced Server Shutdown")

# API Routes
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "active_matches": len(match_manager.active_matches),
        "connected_players": connection_manager.get_connected_count(),
        "ai_enabled": fal_client.api_key is not None,
        "weapons_generated": weapon_generator.generation_count,
        "services": {
            "weapon_generator": weapon_generator.is_healthy(),
            "physics_engine": True,
            "match_manager": True
        }
    }

@app.post("/generate_weapon")
async def generate_weapon_endpoint(request: dict):
    """Generate weapon via REST API"""
    prompt = request.get("prompt", "sword")
    player_id = request.get("player_id", "test_player")
    match_id = request.get("match_id", "test_match")
    
    weapon = await weapon_generator.generate_weapon(prompt, player_id, match_id)
    return {
        "success": True,
        "weapon": {
            "id": weapon.id,
            "name": weapon.name,
            "category": weapon.category,
            "properties": weapon.properties,
            "sprite_url": weapon.sprite_url,
            "sprite_data": weapon.sprite_data,
            "balance_score": weapon.balance_score
        }
    }

@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await connection_manager.connect(websocket, player_id)
    
    # Create or join match
    match = await match_manager.find_or_create_match(player_id)
    
    try:
        # Send welcome message with AI capability
        welcome_msg = {
            "type": "welcome",
            "player_id": player_id,
            "match_id": match.id,
            "ai_enabled": True,
            "message": "Welcome to Pixel-Forge PvP with AI weapon generation!"
        }
        await websocket.send_text(json.dumps(welcome_msg))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "generate_weapon":
                prompt = message.get("prompt", "sword")
                
                # Generate weapon with AI
                weapon = await weapon_generator.generate_weapon(prompt, player_id, match.id)
                
                response = {
                    "type": "weapon_generated",
                    "weapon": {
                        "id": weapon.id,
                        "name": weapon.name,
                        "category": weapon.category,
                        "properties": weapon.properties,
                        "sprite_data": weapon.sprite_data,
                        "balance_score": weapon.balance_score
                    }
                }
                await websocket.send_text(json.dumps(response))
            
            elif message["type"] == "master_prompt":
                prompt = message.get("prompt", "")
                modification = await physics_engine.apply_master_prompt(prompt, match.id)
                
                if modification:
                    response = {
                        "type": "physics_modified",
                        "modification": {
                            "id": modification.id,
                            "description": modification.description,
                            "duration": modification.duration,
                            "parameters": modification.parameters
                        }
                    }
                    await websocket.send_text(json.dumps(response))
            
            elif message["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    
    except WebSocketDisconnect:
        connection_manager.disconnect(player_id)

# Serve static files for sprites
@app.get("/sprites/{filename}")
async def get_sprite(filename: str):
    return {"message": f"Sprite {filename} would be served here"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)