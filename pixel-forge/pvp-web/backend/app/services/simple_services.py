"""
Simple service implementations for demo
"""
import time
import random
import logging
import uuid
from typing import Dict, List, Optional, Any
from enum import Enum

logger = logging.getLogger(__name__)

# Simple weapon generator for demo
class WeaponGenerator:
    def __init__(self):
        self.cache = {}
        self.is_initialized = False
        
        # Pre-defined weapon templates
        self.weapon_templates = {
            "sword": {"damage": 70, "speed": 60, "range": 30, "ammo": 1, "cooldown": 2000, "special": "slash"},
            "bow": {"damage": 60, "speed": 80, "range": 150, "ammo": 20, "cooldown": 1500, "special": "pierce"},
            "staff": {"damage": 50, "speed": 40, "range": 120, "ammo": 10, "cooldown": 3000, "special": "magic"},
            "cannon": {"damage": 90, "speed": 30, "range": 180, "ammo": 5, "cooldown": 4000, "special": "explosive"},
            "dagger": {"damage": 45, "speed": 90, "range": 25, "ammo": 1, "cooldown": 1000, "special": "poison"},
        }
    
    async def initialize(self):
        self.is_initialized = True
        logger.info("🔧 Weapon Generator initialized (demo mode)")
    
    async def cleanup(self):
        pass
    
    def is_healthy(self):
        return True
    
    async def generate_weapon(self, prompt: str, player_id: str, match_id: str):
        """Generate a weapon from a prompt using templates"""
        # Parse prompt for weapon type
        prompt_lower = prompt.lower()
        
        # Find matching template
        template_name = "sword"  # default
        for name in self.weapon_templates:
            if name in prompt_lower:
                template_name = name
                break
        
        # Check for elements/modifiers
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
        
        # Get base template
        template = self.weapon_templates[template_name].copy()
        
        # Apply modifiers
        weapon_data = {
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
        
        # Return as mock weapon object
        class MockWeapon:
            def __init__(self, data):
                self.__dict__.update(data)
            
            def dict(self):
                return self.__dict__
        
        return MockWeapon(weapon_data)

# Simple physics engine for demo
class PhysicsEngine:
    def __init__(self):
        self.active_modifications = {}
        self.modification_history = []
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
            }
        ]
        logger.info("🔧 Physics Engine initialized")
    
    async def apply_master_prompt(self, prompt: str, match_id: str):
        """Apply physics modification from prompt"""
        prompt_lower = prompt.lower()
        
        # Find matching modification
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
                        "match_id": match_id,
                        "is_active": lambda: True  # Mock function
                    }
                    
                    if match_id not in self.active_modifications:
                        self.active_modifications[match_id] = []
                    
                    self.active_modifications[match_id].append(modification)
                    self.modification_history.append(modification)
                    
                    class MockModification:
                        def __init__(self, data):
                            self.__dict__.update(data)
                        def dict(self):
                            return self.__dict__
                    
                    return MockModification(modification)
        
        return None
    
    def get_active_modifications(self, match_id: str):
        return self.active_modifications.get(match_id, [])

# Simple match manager for demo  
class MatchManager:
    def __init__(self, weapon_generator, physics_engine):
        self.weapon_generator = weapon_generator
        self.physics_engine = physics_engine
        self.active_matches = {}
        self.player_matches = {}
        logger.info("🔧 Match Manager initialized")
    
    async def find_or_create_match(self, player_id: str):
        """Find or create a match for a player"""
        # Create a simple match
        match_id = f"match_{int(time.time())}"
        
        match_data = {
            "id": match_id,
            "status": "waiting",
            "players": [
                {
                    "id": player_id,
                    "name": f"Player_{player_id[-4:]}",
                    "health": 100,
                    "position": {"x": 300, "y": 300},
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
        
        class MockMatch:
            def __init__(self, data):
                self.__dict__.update(data)
                
            def dict(self):
                return self.__dict__
                
            def get_duration(self):
                return 0.0
        
        match = MockMatch(match_data)
        self.active_matches[match_id] = match
        self.player_matches[player_id] = match_id
        
        return match
    
    async def start_match(self, match_id: str):
        """Start a match"""
        if match_id in self.active_matches:
            self.active_matches[match_id].status = "active"
            self.active_matches[match_id].start_time = time.time()
    
    def get_match(self, match_id: str):
        return self.active_matches.get(match_id)
    
    def get_player_state(self, match_id: str, player_id: str):
        match = self.active_matches.get(match_id)
        if match:
            for player in match.players:
                if player["id"] == player_id:
                    class MockPlayer:
                        def __init__(self, data):
                            self.__dict__.update(data)
                    return MockPlayer(player)
        return None
    
    def get_active_matches(self):
        return list(self.active_matches.values())
    
    def get_active_match_count(self):
        return len(self.active_matches)
    
    async def update_matches(self):
        """Update match states"""
        pass
    
    async def handle_player_input(self, match_id: str, player_id: str, input_data: Dict):
        """Handle player input"""
        pass
    
    async def use_weapon(self, match_id: str, player_id: str, weapon_id: str, target_position: Dict):
        """Handle weapon usage"""
        pass
    
    async def remove_player(self, player_id: str):
        """Remove player from match"""
        if player_id in self.player_matches:
            del self.player_matches[player_id]

# Simple connection manager for demo
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}
        self.connection_info = {}
        self.player_matches = {}
        logger.info("🔌 Connection Manager initialized")
    
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
                import json
                await websocket.send_text(json.dumps(message.dict() if hasattr(message, 'dict') else message))
                return True
            except:
                self.disconnect(player_id)
                return False
        return False
    
    def get_connected_count(self):
        return len(self.active_connections)