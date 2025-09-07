"""
Physics Engine Service
Handles dynamic physics modifications via natural language master prompts
"""

import time
import random
import logging
from typing import Dict, List, Optional

# Import shared types - will be loaded from main

logger = logging.getLogger(__name__)

class PhysicsEngine:
    """Dynamic physics engine that can modify rules in real-time"""
    
    def __init__(self):
        self.active_modifications: Dict[str, List[PhysicsModification]] = {}
        self.modification_history: List[PhysicsModification] = []
        
        # Pre-defined physics modifications
        self.physics_library = self._create_physics_library()
        
        logger.info("🔧 Physics Engine initialized")
    
    async def apply_master_prompt(self, prompt: str, match_id: str) -> Optional[PhysicsModification]:
        """
        Parse natural language prompt and apply physics modification
        """
        try:
            # Parse prompt to determine modification
            modification = self._parse_physics_prompt(prompt, match_id)
            
            if not modification:
                return None
            
            # Add to active modifications for this match
            if match_id not in self.active_modifications:
                self.active_modifications[match_id] = []
            
            self.active_modifications[match_id].append(modification)
            self.modification_history.append(modification)
            
            logger.info(f"Applied physics modification '{modification.description}' to match {match_id}")
            
            return modification
            
        except Exception as e:
            logger.error(f"Error applying master prompt '{prompt}': {e}")
            return None
    
    def _parse_physics_prompt(self, prompt: str, match_id: str) -> Optional[PhysicsModification]:
        """Parse natural language physics prompts into modifications"""
        prompt_lower = prompt.lower().strip()
        
        # Try to match against known modifications
        for mod_data in self.physics_library:
            for keyword in mod_data["keywords"]:
                if keyword in prompt_lower:
                    return PhysicsModification(
                        id=f"mod_{int(time.time() * 1000)}",
                        type=PhysicsModType(mod_data["type"]),
                        description=mod_data["description"],
                        parameters=mod_data["parameters"].copy(),
                        duration=mod_data["duration"],
                        start_time=time.time(),
                        match_id=match_id
                    )
        
        # If no specific match, generate random effect
        return self._generate_random_modification(match_id)
    
    def _create_physics_library(self) -> List[Dict]:
        """Create library of physics modifications"""
        return [
            # Gravity modifications
            {
                "type": "gravity",
                "description": "Low Gravity",
                "keywords": ["low gravity", "moon gravity", "float", "weightless"],
                "parameters": {"multiplier": 0.3},
                "duration": 15.0
            },
            {
                "type": "gravity", 
                "description": "High Gravity",
                "keywords": ["high gravity", "heavy gravity", "weight", "pull down"],
                "parameters": {"multiplier": 2.0},
                "duration": 15.0
            },
            {
                "type": "gravity",
                "description": "Zero Gravity", 
                "keywords": ["zero gravity", "no gravity", "space", "float free"],
                "parameters": {"multiplier": 0.0},
                "duration": 10.0
            },
            {
                "type": "gravity",
                "description": "Reverse Gravity",
                "keywords": ["reverse gravity", "upside down", "gravity flip"],
                "parameters": {"multiplier": -1.0},
                "duration": 12.0
            },
            
            # Friction modifications
            {
                "type": "friction",
                "description": "Ice Floor",
                "keywords": ["ice", "slippery", "slide", "slick", "smooth"],
                "parameters": {"multiplier": 0.1},
                "duration": 20.0
            },
            {
                "type": "friction", 
                "description": "Sticky Ground",
                "keywords": ["sticky", "mud", "tar", "glue", "slow movement"],
                "parameters": {"multiplier": 3.0},
                "duration": 15.0
            },
            {
                "type": "friction",
                "description": "Super Slippery",
                "keywords": ["super slippery", "oil", "banana peel", "slide everywhere"],
                "parameters": {"multiplier": 0.05},
                "duration": 18.0
            },
            
            # Bounce modifications  
            {
                "type": "bounce",
                "description": "Bouncy World",
                "keywords": ["bouncy", "rubber", "trampoline", "bounce", "elastic"],
                "parameters": {"multiplier": 2.5},
                "duration": 18.0
            },
            {
                "type": "bounce",
                "description": "Super Bouncy",
                "keywords": ["super bouncy", "mega bounce", "spring", "boing"],
                "parameters": {"multiplier": 4.0},
                "duration": 15.0
            },
            {
                "type": "bounce",
                "description": "No Bounce", 
                "keywords": ["no bounce", "dead bounce", "flat", "absorb"],
                "parameters": {"multiplier": 0.0},
                "duration": 15.0
            },
            
            # Time scale modifications
            {
                "type": "time_scale",
                "description": "Slow Motion",
                "keywords": ["slow motion", "bullet time", "matrix", "slow down"],
                "parameters": {"scale": 0.5},
                "duration": 8.0
            },
            {
                "type": "time_scale",
                "description": "Super Speed",
                "keywords": ["super speed", "fast forward", "speed up", "quick"],
                "parameters": {"scale": 1.5},
                "duration": 12.0
            },
            {
                "type": "time_scale",
                "description": "Hyper Speed",
                "keywords": ["hyper speed", "lightning fast", "blur", "sonic"],
                "parameters": {"scale": 2.0},
                "duration": 6.0
            },
            
            # Weapon behavior modifications
            {
                "type": "weapon_behavior",
                "description": "Double Damage",
                "keywords": ["double damage", "power up", "stronger", "boost"],
                "parameters": {"damage_multiplier": 2.0},
                "duration": 12.0
            },
            {
                "type": "weapon_behavior",
                "description": "Rapid Fire",
                "keywords": ["rapid fire", "machine gun", "spray", "burst"],
                "parameters": {"cooldown_multiplier": 0.3},
                "duration": 10.0
            },
            {
                "type": "weapon_behavior",
                "description": "Giant Weapons",
                "keywords": ["giant weapons", "big weapons", "huge", "massive"],
                "parameters": {"size_multiplier": 2.0, "damage_multiplier": 1.5},
                "duration": 15.0
            },
            {
                "type": "weapon_behavior",
                "description": "Explosive Weapons", 
                "keywords": ["explosive", "boom", "explode", "blast"],
                "parameters": {"add_explosion": True, "explosion_radius": 50},
                "duration": 15.0
            },
            {
                "type": "weapon_behavior",
                "description": "Backwards Weapons",
                "keywords": ["backwards", "reverse", "opposite", "wrong way"],
                "parameters": {"direction_multiplier": -1.0},
                "duration": 10.0
            }
        ]
    
    def _generate_random_modification(self, match_id: str) -> PhysicsModification:
        """Generate a random physics modification for variety"""
        random_mods = [
            {
                "type": PhysicsModType.GRAVITY,
                "description": "Random Gravity",
                "parameters": {"multiplier": random.uniform(0.2, 2.5)},
                "duration": random.uniform(10, 20)
            },
            {
                "type": PhysicsModType.BOUNCE,
                "description": "Random Bounce",
                "parameters": {"multiplier": random.uniform(0.5, 3.0)},
                "duration": random.uniform(12, 18)
            },
            {
                "type": PhysicsModType.FRICTION,
                "description": "Random Friction",
                "parameters": {"multiplier": random.uniform(0.1, 2.0)},
                "duration": random.uniform(15, 25)
            },
            {
                "type": PhysicsModType.TIME_SCALE,
                "description": "Random Time",
                "parameters": {"scale": random.uniform(0.3, 1.8)},
                "duration": random.uniform(8, 15)
            }
        ]
        
        mod_data = random.choice(random_mods)
        
        return PhysicsModification(
            id=f"random_{int(time.time() * 1000)}",
            type=mod_data["type"],
            description=mod_data["description"],
            parameters=mod_data["parameters"],
            duration=mod_data["duration"],
            start_time=time.time(),
            match_id=match_id
        )
    
    def get_active_modifications(self, match_id: str) -> List[PhysicsModification]:
        """Get all active physics modifications for a match"""
        if match_id not in self.active_modifications:
            return []
        
        # Filter out expired modifications
        current_time = time.time()
        active_mods = [
            mod for mod in self.active_modifications[match_id]
            if mod.is_active()
        ]
        
        # Update the list to remove expired mods
        self.active_modifications[match_id] = active_mods
        
        return active_mods
    
    def calculate_current_physics(self, match_id: str) -> Dict[str, float]:
        """Calculate current physics state with all active modifications"""
        # Base physics values
        physics = {
            "gravity": 800,
            "friction": 0.8,
            "restitution": 0.3,
            "time_scale": 1.0,
            "damage_multiplier": 1.0,
            "cooldown_multiplier": 1.0,
            "size_multiplier": 1.0
        }
        
        # Apply all active modifications
        active_mods = self.get_active_modifications(match_id)
        
        for mod in active_mods:
            if mod.type == PhysicsModType.GRAVITY:
                multiplier = mod.parameters.get("multiplier", 1.0)
                physics["gravity"] *= multiplier
                
            elif mod.type == PhysicsModType.FRICTION:
                multiplier = mod.parameters.get("multiplier", 1.0)
                physics["friction"] *= multiplier
                
            elif mod.type == PhysicsModType.BOUNCE:
                multiplier = mod.parameters.get("multiplier", 1.0)
                physics["restitution"] *= multiplier
                
            elif mod.type == PhysicsModType.TIME_SCALE:
                scale = mod.parameters.get("scale", 1.0)
                physics["time_scale"] = scale
                
            elif mod.type == PhysicsModType.WEAPON_BEHAVIOR:
                if "damage_multiplier" in mod.parameters:
                    physics["damage_multiplier"] *= mod.parameters["damage_multiplier"]
                if "cooldown_multiplier" in mod.parameters:
                    physics["cooldown_multiplier"] *= mod.parameters["cooldown_multiplier"]
                if "size_multiplier" in mod.parameters:
                    physics["size_multiplier"] *= mod.parameters["size_multiplier"]
        
        return physics
    
    def cleanup_expired_modifications(self):
        """Clean up expired physics modifications"""
        current_time = time.time()
        
        for match_id in list(self.active_modifications.keys()):
            active_mods = [
                mod for mod in self.active_modifications[match_id]
                if mod.is_active()
            ]
            
            if active_mods:
                self.active_modifications[match_id] = active_mods
            else:
                # Remove empty match
                del self.active_modifications[match_id]
        
        # Keep only recent history (last 100 modifications)
        if len(self.modification_history) > 100:
            self.modification_history = self.modification_history[-100:]
    
    def remove_match_modifications(self, match_id: str):
        """Remove all modifications for a specific match"""
        if match_id in self.active_modifications:
            del self.active_modifications[match_id]
            logger.info(f"Removed all physics modifications for match {match_id}")
    
    def get_modification_history(self, limit: int = 50) -> List[PhysicsModification]:
        """Get recent modification history"""
        return self.modification_history[-limit:]
    
    def get_stats(self) -> Dict:
        """Get physics engine statistics"""
        return {
            "active_matches": len(self.active_modifications),
            "total_active_modifications": sum(
                len(mods) for mods in self.active_modifications.values()
            ),
            "total_modifications_applied": len(self.modification_history),
            "available_modifications": len(self.physics_library)
        }