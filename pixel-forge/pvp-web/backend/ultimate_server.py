"""
Ultimate Pixel-Forge PvP Server with Triple AI Integration
- Gemini 2.5 Flash Image for intelligent weapon generation and balancing
- Fal AI for high-quality weapon sprite generation
- ElevenLabs for immersive voice narration and sound effects
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
import google.generativeai as genai
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure AI Services
fal_client.api_key = os.getenv("FAL_KEY")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
elevenlabs_client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

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
    sprite_data: Optional[str] = None
    generated_at: float = 0.0
    balance_score: float = 75.0
    player_id: str = ""
    ai_description: Optional[str] = None
    voice_narration: Optional[str] = None

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

# Ultimate Weapon Generator with Gemini Intelligence
class UltimateWeaponGenerator:
    def __init__(self):
        self.cache = {}
        self.is_initialized = False
        self.generation_count = 0
        
        # Initialize Gemini model
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash-image-preview')
        
        # Base weapon archetypes
        self.weapon_archetypes = {
            "sword": {"base_damage": 70, "base_speed": 60, "base_range": 30, "category": "melee"},
            "bow": {"base_damage": 60, "base_speed": 80, "base_range": 150, "category": "projectile"},
            "staff": {"base_damage": 50, "base_speed": 40, "base_range": 120, "category": "magic"},
            "cannon": {"base_damage": 90, "base_speed": 30, "base_range": 180, "category": "projectile"},
            "dagger": {"base_damage": 45, "base_speed": 90, "base_range": 25, "category": "melee"},
            "axe": {"base_damage": 85, "base_speed": 50, "base_range": 35, "category": "melee"},
            "orb": {"base_damage": 65, "base_speed": 70, "base_range": 100, "category": "magic"},
            "spear": {"base_damage": 75, "base_speed": 65, "base_range": 45, "category": "melee"},
            "rifle": {"base_damage": 80, "base_speed": 85, "base_range": 200, "category": "projectile"},
            "hammer": {"base_damage": 95, "base_speed": 35, "base_range": 40, "category": "melee"}
        }
        
        # Advanced element system
        self.elements = {
            "fire": {"damage_mult": 1.2, "speed_mult": 1.0, "special": "burning_damage"},
            "ice": {"damage_mult": 0.9, "speed_mult": 0.8, "special": "freeze_effect"},
            "lightning": {"damage_mult": 1.1, "speed_mult": 1.3, "special": "chain_lightning"},
            "poison": {"damage_mult": 0.95, "speed_mult": 1.1, "special": "poison_dot"},
            "shadow": {"damage_mult": 1.0, "speed_mult": 1.2, "special": "stealth_bonus"},
            "light": {"damage_mult": 1.05, "speed_mult": 1.1, "special": "healing_aura"},
            "earth": {"damage_mult": 1.3, "speed_mult": 0.7, "special": "armor_pierce"},
            "wind": {"damage_mult": 0.8, "speed_mult": 1.4, "special": "knockback"},
            "void": {"damage_mult": 1.4, "speed_mult": 0.9, "special": "mana_drain"},
            "crystal": {"damage_mult": 1.1, "speed_mult": 1.0, "special": "critical_chance"}
        }
    
    async def initialize(self):
        self.is_initialized = True
        logger.info("🧠 Ultimate Weapon Generator initialized with Gemini AI")
    
    async def cleanup(self):
        pass
    
    def is_healthy(self):
        return True
    
    async def generate_weapon(self, prompt: str, player_id: str, match_id: str) -> WeaponData:
        """Generate intelligent weapon using Gemini AI + Fal AI sprites + ElevenLabs narration"""
        try:
            self.generation_count += 1
            start_time = time.time()
            
            # Step 1: Use Gemini AI for intelligent weapon analysis and design
            weapon_design = await self._analyze_prompt_with_gemini(prompt)
            
            # Step 2: Generate weapon sprite with Fal AI
            sprite_data = await self._generate_sprite_with_fal(weapon_design)
            
            # Step 3: Create voice narration with ElevenLabs
            voice_narration = await self._create_voice_narration(weapon_design)
            
            # Step 4: Build final weapon data
            weapon_id = f"ultimate_{int(time.time() * 1000)}_{random.randint(1000, 9999)}"
            
            weapon_data = WeaponData(
                id=weapon_id,
                name=weapon_design["name"],
                category=weapon_design["category"],
                properties=weapon_design["properties"],
                sprite_url=f"/sprites/{weapon_id}.png",
                sprite_data=sprite_data,
                generated_at=time.time(),
                balance_score=weapon_design["balance_score"],
                player_id=player_id,
                ai_description=weapon_design["description"],
                voice_narration=voice_narration
            )
            
            generation_time = time.time() - start_time
            logger.info(f"🎯 Generated ultimate weapon '{weapon_design['name']}' in {generation_time:.2f}s")
            
            return weapon_data
            
        except Exception as e:
            logger.error(f"Error in ultimate weapon generation: {e}")
            # Fallback to enhanced template generation
            return await self._generate_enhanced_template_weapon(prompt, player_id, match_id)
    
    async def _analyze_prompt_with_gemini(self, prompt: str) -> Dict:
        """Use Gemini AI to intelligently analyze weapon prompt and create balanced design"""
        try:
            analysis_prompt = f"""
            You are the Ultimate Weapon Designer AI for a competitive PvP game. Analyze this weapon request and create a balanced, creative weapon design.
            
            Player Request: "{prompt}"
            
            Design a weapon that is:
            1. Creative and unique based on the prompt
            2. Balanced for competitive gameplay
            3. Interesting and fun to use
            4. Thematically consistent
            
            Available weapon types: sword, bow, staff, cannon, dagger, axe, orb, spear, rifle, hammer
            Available elements: fire, ice, lightning, poison, shadow, light, earth, wind, void, crystal
            
            Provide your response as a JSON object with:
            {{
                "name": "Weapon name (2-3 words max)",
                "weapon_type": "base weapon type",
                "element": "primary element or 'normal'",
                "category": "melee/projectile/magic/area_effect/utility",
                "damage": "number 30-120",
                "speed": "number 20-100",
                "range": "number 20-250",
                "ammo": "number 1-30",
                "cooldown": "number 800-5000 (milliseconds)",
                "special_effects": ["effect1", "effect2"],
                "balance_score": "number 60-95",
                "description": "Brief tactical description",
                "rarity": "common/rare/epic/legendary"
            }}
            
            Ensure the weapon is balanced - high damage should mean lower speed or higher cooldown.
            """
            
            response = await asyncio.get_event_loop().run_in_executor(
                None, self.gemini_model.generate_content, analysis_prompt
            )
            
            # Parse JSON response
            weapon_data = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
            
            # Build properties dict
            weapon_data["properties"] = {
                "damage": int(weapon_data["damage"]),
                "speed": int(weapon_data["speed"]),
                "range": int(weapon_data["range"]),
                "ammo": int(weapon_data["ammo"]),
                "cooldown": int(weapon_data["cooldown"]),
                "special_effects": weapon_data["special_effects"],
                "element": weapon_data["element"],
                "rarity": weapon_data["rarity"]
            }
            
            return weapon_data
            
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            return await self._fallback_weapon_analysis(prompt)
    
    async def _generate_sprite_with_fal(self, weapon_design: Dict) -> Optional[str]:
        """Generate weapon sprite using Fal AI"""
        try:
            sprite_prompt = f"""
            A detailed pixel art weapon sprite for a 2D game:
            {weapon_design['name']} - {weapon_design['description']}
            
            Style: 64x64 pixel art, clean background, sharp details, 
            vibrant colors, fantasy RPG style, {weapon_design['element']} elemental effects,
            {weapon_design['rarity']} quality with appropriate visual effects,
            centered composition, game-ready sprite
            """
            
            handler = fal_client.submit(
                "fal-ai/flux/schnell",
                arguments={
                    "prompt": sprite_prompt,
                    "image_size": "square_hd",
                    "num_images": 1,
                    "enable_safety_checker": True,
                }
            )
            
            result = handler.get()
            
            if result and "images" in result and len(result["images"]) > 0:
                image_url = result["images"][0]["url"]
                
                response = requests.get(image_url, timeout=10)
                if response.status_code == 200:
                    image_data = base64.b64encode(response.content).decode('utf-8')
                    return f"data:image/png;base64,{image_data}"
            
            return None
            
        except Exception as e:
            logger.error(f"Fal AI sprite generation failed: {e}")
            return None
    
    async def _create_voice_narration(self, weapon_design: Dict) -> Optional[str]:
        """Generate voice narration using ElevenLabs"""
        try:
            narration_text = f"Behold the {weapon_design['name']}! A {weapon_design['rarity']} {weapon_design['element']} {weapon_design['weapon_type']} with devastating power!"
            
            # Use ElevenLabs client to generate audio
            audio = elevenlabs_client.text_to_speech.convert(
                text=narration_text,
                voice_id="pNInz6obpgDQGcFmaJgB",  # Adam voice (epic announcer)
                model_id="eleven_flash_v2_5"
            )
            
            # Convert audio to base64
            audio_data = base64.b64encode(audio).decode('utf-8')
            return f"data:audio/mp3;base64,{audio_data}"
            
        except Exception as e:
            logger.error(f"ElevenLabs narration failed: {e}")
            return None
    
    async def _fallback_weapon_analysis(self, prompt: str) -> Dict:
        """Smart fallback weapon analysis without Gemini"""
        prompt_lower = prompt.lower().strip()
        
        # Determine weapon type
        weapon_type = "sword"
        for w_type in self.weapon_archetypes:
            if w_type in prompt_lower:
                weapon_type = w_type
                break
        
        # Determine element
        element = "normal"
        element_data = {"damage_mult": 1.0, "speed_mult": 1.0, "special": "none"}
        for elem, data in self.elements.items():
            if elem in prompt_lower:
                element = elem
                element_data = data
                break
        
        archetype = self.weapon_archetypes[weapon_type]
        
        # Create balanced weapon
        damage = int(archetype["base_damage"] * element_data["damage_mult"] * random.uniform(0.9, 1.1))
        speed = int(archetype["base_speed"] * element_data["speed_mult"] * random.uniform(0.9, 1.1))
        
        return {
            "name": f"{element.title()} {weapon_type.title()}",
            "weapon_type": weapon_type,
            "element": element,
            "category": archetype["category"],
            "damage": damage,
            "speed": speed,
            "range": archetype["base_range"],
            "ammo": 1 if archetype["category"] == "melee" else random.randint(10, 30),
            "cooldown": random.randint(1000, 3000),
            "special_effects": [element_data["special"], "enhanced_damage"],
            "balance_score": min(95, max(60, 90 - abs(damage - 75) - abs(speed - 65))),
            "description": f"A {element} {weapon_type} with {element_data['special']} effects",
            "rarity": random.choice(["common", "rare", "epic"]),
            "properties": {}
        }
    
    async def _generate_enhanced_template_weapon(self, prompt: str, player_id: str, match_id: str) -> WeaponData:
        """Enhanced template fallback with smart analysis"""
        design = await self._fallback_weapon_analysis(prompt)
        
        weapon_id = f"enhanced_{int(time.time() * 1000)}"
        
        return WeaponData(
            id=weapon_id,
            name=design["name"],
            category=design["category"],
            properties=design["properties"] or {
                "damage": design["damage"],
                "speed": design["speed"],
                "range": design["range"],
                "ammo": design["ammo"],
                "cooldown": design["cooldown"],
                "special_effects": design["special_effects"]
            },
            sprite_url=f"/sprites/{weapon_id}.png",
            generated_at=time.time(),
            balance_score=design["balance_score"],
            player_id=player_id,
            ai_description=design["description"]
        )

# Enhanced Physics Engine with Voice Feedback
class UltimatePhysicsEngine:
    def __init__(self):
        self.active_modifications = {}
        self.modification_history = []
        self.physics_library = self._create_physics_library()
        logger.info("⚡ Ultimate Physics Engine initialized")
    
    async def apply_master_prompt(self, prompt: str, match_id: str) -> Optional[PhysicsModification]:
        """Apply physics modification with voice announcement"""
        try:
            prompt_lower = prompt.lower()
            
            # Find matching modification
            for mod_data in self.physics_library:
                for keyword in mod_data["keywords"]:
                    if keyword in prompt_lower:
                        modification = PhysicsModification(
                            id=f"ultimate_mod_{int(time.time() * 1000)}",
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
                        
                        # Generate voice announcement
                        await self._announce_physics_change(modification)
                        
                        logger.info(f"⚡ Applied '{modification.description}' to match {match_id}")
                        return modification
            
            return None
            
        except Exception as e:
            logger.error(f"Error applying master prompt: {e}")
            return None
    
    async def _announce_physics_change(self, modification: PhysicsModification):
        """Create voice announcement for physics changes"""
        try:
            announcement_text = f"Reality shift activated! {modification.description} is now in effect!"
            
            from elevenlabs import generate
            
            audio = generate(
                text=announcement_text,
                voice="Adam",  # Deep announcer voice
                model="eleven_flash_v2_5",
                api_key=os.getenv("ELEVENLABS_API_KEY")
            )
            
            # Could broadcast this audio to all players in the match
            logger.info(f"🔊 Generated voice announcement for {modification.description}")
            
        except Exception as e:
            logger.error(f"Voice announcement failed: {e}")
    
    def _create_physics_library(self):
        """Comprehensive physics modification library"""
        return [
            {
                "type": "gravity",
                "description": "Moon Gravity",
                "keywords": ["low gravity", "moon gravity", "float", "weightless", "light"],
                "parameters": {"multiplier": 0.3},
                "duration": 15.0
            },
            {
                "type": "gravity",
                "description": "Heavy Gravity",
                "keywords": ["high gravity", "heavy gravity", "weight", "pull down", "heavy"],
                "parameters": {"multiplier": 2.0},
                "duration": 15.0
            },
            {
                "type": "bounce",
                "description": "Bouncy Arena",
                "keywords": ["bouncy", "rubber", "trampoline", "bounce", "elastic", "springy"],
                "parameters": {"multiplier": 2.5},
                "duration": 18.0
            },
            {
                "type": "friction",
                "description": "Ice World",
                "keywords": ["ice", "slippery", "slide", "slick", "smooth", "skating"],
                "parameters": {"multiplier": 0.1},
                "duration": 20.0
            },
            {
                "type": "time_scale",
                "description": "Bullet Time",
                "keywords": ["slow motion", "bullet time", "matrix", "slow", "time"],
                "parameters": {"scale": 0.5},
                "duration": 8.0
            },
            {
                "type": "weapon_behavior",
                "description": "Power Surge",
                "keywords": ["double damage", "power up", "stronger", "boost", "enhanced"],
                "parameters": {"damage_multiplier": 2.0},
                "duration": 12.0
            },
            {
                "type": "weapon_behavior",
                "description": "Rapid Fire Mode",
                "keywords": ["rapid fire", "machine gun", "spray", "burst", "fast fire"],
                "parameters": {"cooldown_multiplier": 0.3},
                "duration": 10.0
            }
        ]
    
    def get_active_modifications(self, match_id: str):
        return self.active_modifications.get(match_id, [])

# Ultimate Match Manager and Connection Manager
class UltimateMatchManager:
    def __init__(self, weapon_generator, physics_engine):
        self.weapon_generator = weapon_generator
        self.physics_engine = physics_engine
        self.active_matches = {}
        self.player_matches = {}
        logger.info("🎮 Ultimate Match Manager initialized")
    
    async def find_or_create_match(self, player_id: str):
        match_id = f"ultimate_match_{int(time.time())}"
        
        match_data = {
            "id": match_id,
            "status": "waiting",
            "players": [{
                "id": player_id,
                "name": f"Ultimate_Player_{player_id[-4:]}",
                "health": 100,
                "position": {"x": 300, "y": 300},
                "velocity": {"x": 0, "y": 0},
                "weapons": [],
                "weapon_cooldown": 0.0,
                "is_alive": True,
                "kills": 0,
                "deaths": 0,
                "ai_weapons_generated": 0,
                "voice_lines_heard": 0
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
            "ai_features_enabled": True,
            "voice_enabled": True
        }
        
        class UltimateMatch:
            def __init__(self, data):
                self.__dict__.update(data)
            def dict(self):
                return self.__dict__
        
        match = UltimateMatch(match_data)
        self.active_matches[match_id] = match
        self.player_matches[player_id] = match_id
        
        return match
    
    def get_match(self, match_id: str):
        return self.active_matches.get(match_id)

class UltimateConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.connection_info = {}
        logger.info("🌐 Ultimate Connection Manager initialized")
    
    async def connect(self, websocket, player_id: str):
        await websocket.accept()
        self.active_connections[player_id] = websocket
        self.connection_info[player_id] = {
            "connected_at": time.time(),
            "messages_sent": 0,
            "messages_received": 0,
            "ai_features_used": 0
        }
        logger.info(f"🎯 Ultimate player {player_id} connected")
    
    def disconnect(self, player_id: str):
        if player_id in self.active_connections:
            del self.active_connections[player_id]
        if player_id in self.connection_info:
            del self.connection_info[player_id]
        logger.info(f"🚪 Ultimate player {player_id} disconnected")
    
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

# Create Ultimate FastAPI app
app = FastAPI(title="Ultimate Pixel-Forge PvP Server", version="3.0.0")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5172", "http://127.0.0.1:5172", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Ultimate Services
weapon_generator = UltimateWeaponGenerator()
physics_engine = UltimatePhysicsEngine()
match_manager = UltimateMatchManager(weapon_generator, physics_engine)
connection_manager = UltimateConnectionManager()

@app.on_event("startup")
async def startup_event():
    await weapon_generator.initialize()
    logger.info("🚀 Ultimate Pixel-Forge PvP Server Started with Triple AI Power!")

@app.on_event("shutdown")
async def shutdown_event():
    await weapon_generator.cleanup()
    logger.info("🛑 Ultimate Server Shutdown")

# Ultimate API Routes
@app.get("/health")
async def health_check():
    return {
        "status": "ultimate",
        "timestamp": time.time(),
        "active_matches": len(match_manager.active_matches),
        "connected_players": connection_manager.get_connected_count(),
        "ai_services": {
            "gemini": bool(os.getenv("GEMINI_API_KEY")),
            "fal_ai": bool(os.getenv("FAL_KEY")),
            "elevenlabs": bool(os.getenv("ELEVENLABS_API_KEY"))
        },
        "weapons_generated": weapon_generator.generation_count,
        "services": {
            "ultimate_weapon_generator": weapon_generator.is_healthy(),
            "ultimate_physics_engine": True,
            "ultimate_match_manager": True
        }
    }

@app.post("/generate_weapon")
async def generate_ultimate_weapon(request: dict):
    """Generate ultimate weapon with triple AI integration"""
    prompt = request.get("prompt", "sword")
    player_id = request.get("player_id", "ultimate_player")
    match_id = request.get("match_id", "ultimate_match")
    
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
            "balance_score": weapon.balance_score,
            "ai_description": weapon.ai_description,
            "voice_narration": weapon.voice_narration,
            "generation_type": "ultimate_ai"
        }
    }

@app.websocket("/ws/{player_id}")
async def ultimate_websocket_endpoint(websocket: WebSocket, player_id: str):
    await connection_manager.connect(websocket, player_id)
    
    # Create ultimate match
    match = await match_manager.find_or_create_match(player_id)
    
    try:
        # Send player connect confirmation
        welcome_msg = {
            "type": "player_connect",
            "data": {
                "player_id": player_id,
                "match_id": match.id,
                "ai_features": {
                    "gemini_intelligence": True,
                    "fal_sprites": True,
                    "elevenlabs_voice": True
                },
                "message": "🎯 Welcome to Ultimate Pixel-Forge PvP with Triple AI Power!"
            },
            "timestamp": int(time.time() * 1000),
            "player_id": player_id
        }
        await websocket.send_text(json.dumps(welcome_msg))
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types from frontend
            message_type = message.get("type", "")
            
            if message_type == "find_match":
                # Send match found response
                match_found_msg = {
                    "type": "match_found",
                    "data": {
                        "match_id": match.id,
                        "players": [{"id": player_id, "name": f"Player_{player_id[:8]}"}],
                        "max_players": 4
                    },
                    "timestamp": int(time.time() * 1000),
                    "player_id": player_id
                }
                await websocket.send_text(json.dumps(match_found_msg))
                
                # Send match start after a brief delay
                await asyncio.sleep(1)
                match_start_msg = {
                    "type": "match_start",
                    "data": {
                        "match_id": match.id,
                        "countdown": 3
                    },
                    "timestamp": int(time.time() * 1000),
                    "player_id": player_id
                }
                await websocket.send_text(json.dumps(match_start_msg))
                
            elif message_type in ["generate_weapon", "weapon_generate"]:
                prompt = message.get("prompt", "sword")
                
                # Generate ultimate weapon
                weapon = await weapon_generator.generate_weapon(prompt, player_id, match.id)
                
                response = {
                    "type": "weapon_generated",
                    "data": {
                        "success": True,
                        "weapon": {
                            "id": weapon.id,
                            "name": weapon.name,
                            "category": weapon.category,
                            "weapon_type": weapon.category,  # Add both for compatibility
                            "element": getattr(weapon, 'element', 'neutral'),
                            "rarity": getattr(weapon, 'rarity', 'common'),
                            "damage": weapon.properties.get('damage', 50),
                            "properties": weapon.properties,
                            "sprite_url": weapon.sprite_data,
                            "balance_score": weapon.balance_score,
                            "ai_description": weapon.ai_description,
                            "voice_narration": weapon.voice_narration,
                            "player_id": player_id
                        },
                        "generation_time": 2000
                    },
                    "timestamp": int(time.time() * 1000),
                    "player_id": player_id
                }
                await websocket.send_text(json.dumps(response))
            
            elif message_type in ["master_prompt", "physics_modify"]:
                prompt = message.get("prompt", "")
                modification = await physics_engine.apply_master_prompt(prompt, match.id)
                
                if modification:
                    response = {
                        "type": "physics_changed",
                        "data": {
                            "modification": {
                                "id": modification.id,
                                "description": modification.description,
                                "duration": modification.duration,
                                "parameters": modification.parameters,
                                "type": getattr(modification, 'type', 'gravity')
                            },
                            "auto_generated": False
                        },
                        "timestamp": int(time.time() * 1000),
                        "player_id": player_id
                    }
                    await websocket.send_text(json.dumps(response))
            
            elif message["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "ultimate_pong"}))
    
    except WebSocketDisconnect:
        connection_manager.disconnect(player_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6000, reload=True)