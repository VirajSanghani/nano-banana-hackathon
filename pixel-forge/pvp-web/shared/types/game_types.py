"""
Shared type definitions for Pixel-Forge PvP
"""

from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel
from enum import Enum
import time
import uuid

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
    damage: int  # 10-100
    speed: int   # 10-100
    range: int   # 20-200
    ammo: int    # 1-30
    cooldown: int  # 1000-5000 ms
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
    
    @classmethod
    def generate_id(cls) -> str:
        return str(uuid.uuid4())

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
    
    def apply_modifications(self):
        """Apply all active physics modifications"""
        # Reset to base values
        self.gravity = 800
        self.friction = 0.8
        self.restitution = 0.3
        self.time_scale = 1.0
        
        # Apply active modifications
        for mod in self.active_modifications:
            if mod.is_active():
                if mod.type == PhysicsModType.GRAVITY:
                    multiplier = mod.parameters.get('multiplier', 1.0)
                    self.gravity *= multiplier
                elif mod.type == PhysicsModType.FRICTION:
                    multiplier = mod.parameters.get('multiplier', 1.0)
                    self.friction *= multiplier
                elif mod.type == PhysicsModType.BOUNCE:
                    multiplier = mod.parameters.get('multiplier', 1.0)
                    self.restitution *= multiplier
                elif mod.type == PhysicsModType.TIME_SCALE:
                    self.time_scale = mod.parameters.get('scale', 1.0)

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
    
    def is_expired(self) -> bool:
        return time.time() > self.expires_at

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
    
    def is_finished(self) -> bool:
        alive_players = [p for p in self.players if p.is_alive]
        return (
            len(alive_players) <= 1 or
            self.get_duration() > 90 or  # Max 90 seconds
            self.status == MatchStatus.FINISHED
        )
    
    def get_winner(self) -> Optional[PlayerState]:
        alive_players = [p for p in self.players if p.is_alive]
        if len(alive_players) == 1:
            return alive_players[0]
        elif len(alive_players) == 0:
            # Draw - return player with most kills
            if self.players:
                return max(self.players, key=lambda p: p.kills)
        elif self.get_duration() > 90:
            # Time limit - return player with highest health
            return max(self.players, key=lambda p: p.health)
        return None

# Network message types
class MessageType(Enum):
    # Connection
    PLAYER_CONNECT = "player_connect"
    PLAYER_DISCONNECT = "player_disconnect"
    
    # Matchmaking
    FIND_MATCH = "find_match"
    MATCH_FOUND = "match_found"
    MATCH_START = "match_start"
    MATCH_END = "match_end"
    
    # Gameplay
    PLAYER_INPUT = "player_input"
    GAME_STATE_UPDATE = "game_state_update"
    WEAPON_GENERATE = "weapon_generate"
    WEAPON_GENERATED = "weapon_generated"
    WEAPON_USE = "weapon_use"
    
    # Physics
    MASTER_PROMPT = "master_prompt"
    PHYSICS_CHANGED = "physics_changed"
    
    # Combat
    PROJECTILE_FIRED = "projectile_fired"
    PLAYER_HIT = "player_hit"
    PLAYER_DEATH = "player_death"

class GameMessage(BaseModel):
    type: MessageType
    data: Dict[str, Any]
    timestamp: float = time.time()
    player_id: Optional[str] = None

class WeaponGenerationRequest(BaseModel):
    prompt: str
    player_id: str
    match_id: str
    
class WeaponGenerationResponse(BaseModel):
    success: bool
    weapon: Optional[Weapon] = None
    error: Optional[str] = None
    generation_time: float

class MasterPromptRequest(BaseModel):
    prompt: str
    match_id: str
    
class MasterPromptResponse(BaseModel):
    success: bool
    modification: Optional[PhysicsModification] = None
    error: Optional[str] = None