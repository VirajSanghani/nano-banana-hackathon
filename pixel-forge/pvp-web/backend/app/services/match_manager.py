"""
Match Manager Service
Handles game sessions, player matching, and combat state management
"""

import time
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
import math

# Import shared types
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'shared'))
from types.game_types import (
    MatchState, MatchStatus, PlayerState, Projectile, 
    WeaponCategory, Weapon
)

logger = logging.getLogger(__name__)

class MatchManager:
    """Manages game matches, player states, and combat mechanics"""
    
    def __init__(self, weapon_generator, physics_engine):
        self.matches: Dict[str, MatchState] = {}
        self.waiting_players: List[str] = []
        self.player_match_map: Dict[str, str] = {}  # player_id -> match_id
        
        self.weapon_generator = weapon_generator
        self.physics_engine = physics_engine
        
        # Combat configuration
        self.arena_width = 1200
        self.arena_height = 600
        self.max_match_duration = 90.0  # seconds
        
        logger.info("🎮 Match Manager initialized")
    
    async def find_or_create_match(self, player_id: str) -> Optional[MatchState]:
        """Find existing match or create new one for player"""
        try:
            # Check if player already in a match
            if player_id in self.player_match_map:
                match_id = self.player_match_map[player_id]
                if match_id in self.matches:
                    return self.matches[match_id]
                else:
                    # Clean up stale mapping
                    del self.player_match_map[player_id]
            
            # Look for waiting match
            for match in self.matches.values():
                if match.status == MatchStatus.WAITING and len(match.players) < 2:
                    # Add player to existing match
                    player_state = PlayerState(
                        id=player_id,
                        name=f"Player_{player_id[:6]}",
                        position={"x": 1000, "y": 500}  # Player 2 starting position
                    )
                    match.players.append(player_state)
                    self.player_match_map[player_id] = match.id
                    
                    logger.info(f"Added player {player_id} to existing match {match.id}")
                    return match
            
            # Create new match
            match_id = f"match_{int(time.time() * 1000)}"
            player_state = PlayerState(
                id=player_id,
                name=f"Player_{player_id[:6]}",
                position={"x": 200, "y": 500}  # Player 1 starting position
            )
            
            match = MatchState(
                id=match_id,
                status=MatchStatus.WAITING,
                players=[player_state]
            )
            
            self.matches[match_id] = match
            self.player_match_map[player_id] = match_id
            
            logger.info(f"Created new match {match_id} for player {player_id}")
            return match
            
        except Exception as e:
            logger.error(f"Error finding/creating match for {player_id}: {e}")
            return None
    
    async def start_match(self, match_id: str) -> bool:
        """Start a match when ready"""
        try:
            match = self.matches.get(match_id)
            if not match or len(match.players) < 2:
                return False
            
            match.status = MatchStatus.ACTIVE
            match.start_time = time.time()
            match.last_master_prompt = time.time()
            
            # Initialize player positions
            match.players[0].position = {"x": 200, "y": 500}
            match.players[1].position = {"x": 1000, "y": 500}
            
            # Reset health
            for player in match.players:
                player.health = 100
                player.is_alive = True
                player.weapons = []
                player.weapon_cooldown = 0
            
            logger.info(f"Started match {match_id} with {len(match.players)} players")
            return True
            
        except Exception as e:
            logger.error(f"Error starting match {match_id}: {e}")
            return False
    
    async def update_matches(self):
        """Update all active matches - called from game loop"""
        try:
            current_time = time.time()
            
            for match_id in list(self.matches.keys()):
                match = self.matches[match_id]
                
                if match.status == MatchStatus.ACTIVE:
                    # Update projectiles
                    await self._update_projectiles(match)
                    
                    # Check collision detection
                    await self._check_collisions(match)
                    
                    # Check win conditions
                    if match.is_finished():
                        await self._end_match(match)
                
                elif match.status == MatchStatus.FINISHED:
                    # Clean up old matches after 5 minutes
                    if match.end_time and current_time - match.end_time > 300:
                        await self._cleanup_match(match_id)
                
                elif match.status == MatchStatus.WAITING:
                    # Clean up waiting matches after 2 minutes
                    if current_time - (match.start_time or current_time) > 120:
                        await self._cleanup_match(match_id)
        
        except Exception as e:
            logger.error(f"Error updating matches: {e}")
    
    async def _update_projectiles(self, match: MatchState):
        """Update projectile positions and physics"""
        try:
            current_physics = self.physics_engine.calculate_current_physics(match.id)
            dt = 1/60  # 60 FPS delta time
            
            # Update existing projectiles
            active_projectiles = []
            
            for projectile in match.projectiles:
                if not projectile.is_expired():
                    # Apply physics
                    projectile.velocity["y"] += current_physics["gravity"] * dt
                    
                    # Apply time scale
                    time_scale = current_physics["time_scale"]
                    projectile.position["x"] += projectile.velocity["x"] * dt * time_scale
                    projectile.position["y"] += projectile.velocity["y"] * dt * time_scale
                    
                    # Check bounds
                    if (0 <= projectile.position["x"] <= self.arena_width and
                        0 <= projectile.position["y"] <= self.arena_height):
                        active_projectiles.append(projectile)
                
            match.projectiles = active_projectiles
            
        except Exception as e:
            logger.error(f"Error updating projectiles: {e}")
    
    async def _check_collisions(self, match: MatchState):
        """Check collisions between projectiles and players"""
        try:
            for projectile in match.projectiles[:]:  # Create copy to allow modification
                for player in match.players:
                    if (player.id != projectile.player_id and 
                        player.is_alive and
                        self._check_projectile_player_collision(projectile, player)):
                        
                        # Apply damage
                        await self._apply_damage(match, projectile, player)
                        
                        # Remove projectile
                        if projectile in match.projectiles:
                            match.projectiles.remove(projectile)
                        
                        break
        
        except Exception as e:
            logger.error(f"Error checking collisions: {e}")
    
    def _check_projectile_player_collision(self, projectile: Projectile, player: PlayerState) -> bool:
        """Check if projectile collides with player"""
        # Simple rectangle collision (player is ~32x32, projectile is ~8x8)
        player_bounds = {
            "left": player.position["x"] - 16,
            "right": player.position["x"] + 16,
            "top": player.position["y"] - 16,
            "bottom": player.position["y"] + 16
        }
        
        projectile_bounds = {
            "left": projectile.position["x"] - 4,
            "right": projectile.position["x"] + 4,
            "top": projectile.position["y"] - 4,
            "bottom": projectile.position["y"] + 4
        }
        
        return (projectile_bounds["right"] > player_bounds["left"] and
                projectile_bounds["left"] < player_bounds["right"] and
                projectile_bounds["bottom"] > player_bounds["top"] and
                projectile_bounds["top"] < player_bounds["bottom"])
    
    async def _apply_damage(self, match: MatchState, projectile: Projectile, player: PlayerState):
        """Apply damage from projectile to player"""
        try:
            # Get current physics for damage multiplier
            current_physics = self.physics_engine.calculate_current_physics(match.id)
            damage_multiplier = current_physics.get("damage_multiplier", 1.0)
            
            # Calculate final damage
            final_damage = int(projectile.damage * damage_multiplier)
            
            # Apply damage
            player.health = max(0, player.health - final_damage)
            
            # Check if player died
            if player.health <= 0:
                player.is_alive = False
                player.deaths += 1
                
                # Award kill to shooter
                shooter = self.get_player_state(match.id, projectile.player_id)
                if shooter:
                    shooter.kills += 1
                
                logger.info(f"Player {player.id} eliminated by {projectile.player_id}")
        
        except Exception as e:
            logger.error(f"Error applying damage: {e}")
    
    async def _end_match(self, match: MatchState):
        """End a match and determine winner"""
        try:
            match.status = MatchStatus.FINISHED
            match.end_time = time.time()
            
            # Determine winner
            winner = match.get_winner()
            if winner:
                match.winner_id = winner.id
                logger.info(f"Match {match.id} ended - Winner: {winner.id}")
            else:
                logger.info(f"Match {match.id} ended in a draw")
            
            # Clean up physics modifications
            self.physics_engine.remove_match_modifications(match.id)
            
        except Exception as e:
            logger.error(f"Error ending match {match.id}: {e}")
    
    async def _cleanup_match(self, match_id: str):
        """Clean up finished match"""
        try:
            match = self.matches.get(match_id)
            if match:
                # Remove player mappings
                for player in match.players:
                    if player.id in self.player_match_map:
                        del self.player_match_map[player.id]
                
                # Remove match
                del self.matches[match_id]
                
                # Clean up physics
                self.physics_engine.remove_match_modifications(match_id)
                
                logger.info(f"Cleaned up match {match_id}")
        
        except Exception as e:
            logger.error(f"Error cleaning up match {match_id}: {e}")
    
    async def handle_player_input(self, match_id: str, player_id: str, input_data: Dict):
        """Handle player movement and action input"""
        try:
            match = self.matches.get(match_id)
            if not match or match.status != MatchStatus.ACTIVE:
                return
            
            player = self.get_player_state(match_id, player_id)
            if not player or not player.is_alive:
                return
            
            # Get current physics
            current_physics = self.physics_engine.calculate_current_physics(match_id)
            time_scale = current_physics["time_scale"]
            friction = current_physics["friction"]
            
            # Handle movement
            move_speed = 200 * time_scale  # pixels per second
            
            if input_data.get("left"):
                player.velocity["x"] = -move_speed
            elif input_data.get("right"):
                player.velocity["x"] = move_speed
            else:
                # Apply friction
                player.velocity["x"] *= friction
            
            # Handle jumping
            if input_data.get("jump") and abs(player.velocity["y"]) < 10:  # On ground check
                jump_strength = -400 * time_scale
                player.velocity["y"] = jump_strength
            
            # Update position
            dt = 1/60
            player.position["x"] += player.velocity["x"] * dt
            player.position["y"] += player.velocity["y"] * dt
            
            # Apply gravity
            player.velocity["y"] += current_physics["gravity"] * dt
            
            # Ground collision (simple)
            if player.position["y"] > 500:  # Ground level
                player.position["y"] = 500
                player.velocity["y"] = 0
            
            # Bounds checking
            player.position["x"] = max(16, min(self.arena_width - 16, player.position["x"]))
            player.position["y"] = max(16, min(self.arena_height - 16, player.position["y"]))
        
        except Exception as e:
            logger.error(f"Error handling player input: {e}")
    
    async def use_weapon(self, match_id: str, player_id: str, weapon_id: str, target_position: Dict):
        """Handle weapon usage and projectile creation"""
        try:
            match = self.matches.get(match_id)
            if not match or match.status != MatchStatus.ACTIVE:
                return
            
            player = self.get_player_state(match_id, player_id)
            if not player or not player.is_alive:
                return
            
            # Find weapon
            weapon = None
            for w in player.weapons:
                if w.id == weapon_id:
                    weapon = w
                    break
            
            if not weapon:
                return
            
            # Get current physics for weapon modifications
            current_physics = self.physics_engine.calculate_current_physics(match_id)
            
            # Create projectile(s) based on weapon
            if weapon.category in [WeaponCategory.PROJECTILE, WeaponCategory.MAGIC]:
                await self._create_projectile(match, player, weapon, target_position, current_physics)
            elif weapon.category == WeaponCategory.AREA_EFFECT:
                await self._create_area_effect(match, player, weapon, target_position, current_physics)
            
            # Apply weapon cooldown (modified by physics)
            cooldown_multiplier = current_physics.get("cooldown_multiplier", 1.0)
            player.weapon_cooldown = time.time() + (weapon.properties.cooldown / 1000.0) * cooldown_multiplier
        
        except Exception as e:
            logger.error(f"Error using weapon: {e}")
    
    async def _create_projectile(self, match: MatchState, player: PlayerState, weapon: Weapon, target_pos: Dict, physics: Dict):
        """Create projectile from weapon"""
        try:
            # Calculate direction to target
            dx = target_pos["x"] - player.position["x"]
            dy = target_pos["y"] - player.position["y"]
            distance = math.sqrt(dx*dx + dy*dy)
            
            if distance == 0:
                return
            
            # Normalize direction
            dx /= distance
            dy /= distance
            
            # Apply physics modifications
            direction_multiplier = physics.get("direction_multiplier", 1.0)
            size_multiplier = physics.get("size_multiplier", 1.0)
            damage_multiplier = physics.get("damage_multiplier", 1.0)
            
            # Calculate velocity
            projectile_speed = weapon.properties.speed * 5  # Scale for game
            velocity_x = dx * projectile_speed * direction_multiplier
            velocity_y = dy * projectile_speed * direction_multiplier
            
            # Create projectile
            projectile = Projectile(
                id=f"proj_{int(time.time() * 1000)}",
                weapon_id=weapon.id,
                player_id=player.id,
                position=player.position.copy(),
                velocity={"x": velocity_x, "y": velocity_y},
                damage=int(weapon.properties.damage * damage_multiplier),
                created_at=time.time(),
                expires_at=time.time() + (weapon.properties.range / projectile_speed)
            )
            
            match.projectiles.append(projectile)
        
        except Exception as e:
            logger.error(f"Error creating projectile: {e}")
    
    async def _create_area_effect(self, match: MatchState, player: PlayerState, weapon: Weapon, target_pos: Dict, physics: Dict):
        """Create area effect from weapon"""
        try:
            # Area effects could damage all players in radius
            damage_multiplier = physics.get("damage_multiplier", 1.0)
            
            for target_player in match.players:
                if target_player.id != player.id and target_player.is_alive:
                    # Check if in range
                    dx = target_player.position["x"] - target_pos["x"]
                    dy = target_player.position["y"] - target_pos["y"]
                    distance = math.sqrt(dx*dx + dy*dy)
                    
                    if distance <= weapon.properties.range:
                        # Apply damage
                        damage = int(weapon.properties.damage * damage_multiplier)
                        target_player.health = max(0, target_player.health - damage)
                        
                        if target_player.health <= 0:
                            target_player.is_alive = False
                            target_player.deaths += 1
                            player.kills += 1
        
        except Exception as e:
            logger.error(f"Error creating area effect: {e}")
    
    async def remove_player(self, player_id: str):
        """Remove player from any active match"""
        try:
            if player_id in self.player_match_map:
                match_id = self.player_match_map[player_id]
                match = self.matches.get(match_id)
                
                if match:
                    # Remove player from match
                    match.players = [p for p in match.players if p.id != player_id]
                    
                    # End match if not enough players
                    if len(match.players) < 2 and match.status == MatchStatus.ACTIVE:
                        await self._end_match(match)
                
                del self.player_match_map[player_id]
                logger.info(f"Removed player {player_id} from match {match_id}")
        
        except Exception as e:
            logger.error(f"Error removing player {player_id}: {e}")
    
    def get_match(self, match_id: str) -> Optional[MatchState]:
        """Get match by ID"""
        return self.matches.get(match_id)
    
    def get_player_state(self, match_id: str, player_id: str) -> Optional[PlayerState]:
        """Get player state from match"""
        match = self.matches.get(match_id)
        if not match:
            return None
        
        for player in match.players:
            if player.id == player_id:
                return player
        
        return None
    
    def get_active_matches(self) -> List[MatchState]:
        """Get all active matches"""
        return [match for match in self.matches.values() 
                if match.status == MatchStatus.ACTIVE]
    
    def get_active_match_count(self) -> int:
        """Get count of active matches"""
        return len(self.get_active_matches())
    
    def get_stats(self) -> Dict:
        """Get match manager statistics"""
        return {
            "total_matches": len(self.matches),
            "active_matches": len(self.get_active_matches()),
            "waiting_matches": len([m for m in self.matches.values() 
                                   if m.status == MatchStatus.WAITING]),
            "finished_matches": len([m for m in self.matches.values() 
                                    if m.status == MatchStatus.FINISHED]),
            "total_players": len(self.player_match_map)
        }