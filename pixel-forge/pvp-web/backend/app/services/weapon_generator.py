"""
Weapon Generation Service
Converts natural language prompts into balanced combat weapons using AI
"""

import os
import json
import time
import asyncio
import logging
import hashlib
from typing import Dict, List, Optional, Tuple
import base64
import io
# PIL and numpy will be installed later if needed
# from PIL import Image, ImageDraw
# import numpy as np

# Import AI services (commented out for demo without API key)
genai = None  # Will be enabled when API key is provided

# Import shared types - we'll define them locally for demo
import uuid

logger = logging.getLogger(__name__)

class WeaponGenerator:
    """High-performance AI weapon generator with fallbacks and caching"""
    
    def __init__(self):
        self.cache: Dict[str, Weapon] = {}
        self.generation_stats = {
            "total_requests": 0,
            "cache_hits": 0,
            "ai_generations": 0,
            "fallback_generations": 0,
            "avg_generation_time": 0.0
        }
        self.is_initialized = False
        
        # Weapon templates for rapid generation
        self.weapon_templates = self._create_weapon_templates()
        
        # Initialize Gemini if available
        if genai and os.getenv("GEMINI_API_KEY"):
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.gemini_model = None
            logger.warning("Gemini AI not configured - using fallbacks only")
    
    async def initialize(self):
        """Initialize the weapon generator"""
        logger.info("🔧 Initializing Weapon Generator")
        
        # Pre-generate common weapon sprites
        await self._pre_generate_common_weapons()
        
        self.is_initialized = True
        logger.info("✅ Weapon Generator initialized")
    
    def is_healthy(self) -> bool:
        """Check if the service is healthy"""
        return self.is_initialized
    
    async def generate_weapon(self, prompt: str, player_id: str, match_id: str) -> Optional[Weapon]:
        """
        Generate weapon from natural language prompt
        Must complete in <3 seconds as per requirements
        """
        start_time = time.time()
        self.generation_stats["total_requests"] += 1
        
        try:
            # Input validation
            if not prompt or len(prompt.strip()) == 0:
                return None
            
            prompt = prompt.strip().lower()
            
            # Check cache first
            cache_key = hashlib.md5(prompt.encode()).hexdigest()
            if cache_key in self.cache:
                self.generation_stats["cache_hits"] += 1
                weapon = self.cache[cache_key]
                # Create new instance with current player
                return Weapon(
                    id=Weapon.generate_id(),
                    name=weapon.name,
                    category=weapon.category,
                    properties=weapon.properties,
                    sprite_url=weapon.sprite_url,
                    generated_at=time.time(),
                    balance_score=weapon.balance_score,
                    player_id=player_id
                )
            
            # Try AI generation with timeout
            weapon = None
            try:
                weapon = await asyncio.wait_for(
                    self._generate_with_ai(prompt, player_id),
                    timeout=2.5  # Leave 0.5s buffer
                )
                self.generation_stats["ai_generations"] += 1
                
            except asyncio.TimeoutError:
                logger.warning(f"AI generation timeout for prompt: {prompt}")
                
            # Fallback to template-based generation
            if not weapon:
                weapon = self._generate_from_template(prompt, player_id)
                self.generation_stats["fallback_generations"] += 1
            
            # Cache the result (without player_id specific data)
            if weapon:
                cache_weapon = Weapon(
                    id="template",
                    name=weapon.name,
                    category=weapon.category,
                    properties=weapon.properties,
                    sprite_url=weapon.sprite_url,
                    generated_at=weapon.generated_at,
                    balance_score=weapon.balance_score,
                    player_id="template"
                )
                self.cache[cache_key] = cache_weapon
            
            # Update stats
            generation_time = time.time() - start_time
            self.generation_stats["avg_generation_time"] = (
                (self.generation_stats["avg_generation_time"] * (self.generation_stats["total_requests"] - 1) + 
                 generation_time) / self.generation_stats["total_requests"]
            )
            
            if generation_time > 3.0:
                logger.warning(f"Weapon generation exceeded 3s limit: {generation_time:.2f}s")
            
            return weapon
            
        except Exception as e:
            logger.error(f"Error generating weapon for prompt '{prompt}': {e}")
            # Emergency fallback
            return self._create_emergency_weapon(prompt, player_id)
    
    async def _generate_with_ai(self, prompt: str, player_id: str) -> Optional[Weapon]:
        """Generate weapon using Gemini AI"""
        if not self.gemini_model:
            return None
        
        try:
            # Generate weapon properties
            properties_prompt = f"""
            Generate balanced weapon stats for a PvP combat game.
            Weapon description: "{prompt}"
            
            Game context:
            - Players have 100 HP
            - Matches last 60-90 seconds
            - Fast-paced competitive combat
            
            Return ONLY valid JSON in this exact format:
            {{
                "damage": <integer 15-85>,
                "speed": <integer 20-95>,
                "range": <integer 30-180>,
                "ammo": <integer 3-25>,
                "cooldown": <integer 1500-4000>,
                "special_effect": "<effect_name>",
                "category": "<projectile|melee|area_effect|utility|magic>"
            }}
            
            Balance rules:
            - High damage weapons must have slow speed or high cooldown
            - Long range weapons need lower damage
            - Special effects add strategic value but don't break balance
            """
            
            response = await self.gemini_model.generate_content_async(properties_prompt)
            
            # Parse response
            try:
                json_text = response.text.strip()
                if json_text.startswith('```json'):
                    json_text = json_text.split('```json')[1].split('```')[0].strip()
                elif json_text.startswith('```'):
                    json_text = json_text.split('```')[1].split('```')[0].strip()
                
                properties_data = json.loads(json_text)
                
                # Validate and create properties
                properties = WeaponProperties(
                    damage=max(15, min(85, properties_data.get("damage", 50))),
                    speed=max(20, min(95, properties_data.get("speed", 60))),
                    range=max(30, min(180, properties_data.get("range", 100))),
                    ammo=max(3, min(25, properties_data.get("ammo", 10))),
                    cooldown=max(1500, min(4000, properties_data.get("cooldown", 2000))),
                    special_effect=properties_data.get("special_effect", "none")
                )
                
                # Determine category
                category_str = properties_data.get("category", "projectile").lower()
                category = WeaponCategory.PROJECTILE
                for cat in WeaponCategory:
                    if cat.value == category_str:
                        category = cat
                        break
                
                # Generate sprite
                sprite_url = self._generate_weapon_sprite(prompt, category)
                
                # Calculate balance score
                balance_score = self._calculate_balance_score(properties)
                
                # Apply balance adjustments if needed
                if balance_score > 80:
                    properties = self._apply_balance_nerf(properties)
                    balance_score = self._calculate_balance_score(properties)
                
                weapon = Weapon(
                    id=Weapon.generate_id(),
                    name=self._generate_weapon_name(prompt),
                    category=category,
                    properties=properties,
                    sprite_url=sprite_url,
                    generated_at=time.time(),
                    balance_score=balance_score,
                    player_id=player_id
                )
                
                return weapon
                
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                logger.warning(f"Failed to parse AI response: {e}")
                return None
        
        except Exception as e:
            logger.warning(f"AI generation failed: {e}")
            return None
    
    def _generate_from_template(self, prompt: str, player_id: str) -> Optional[Weapon]:
        """Generate weapon from pre-defined templates"""
        try:
            # Find best matching template
            best_template = self._find_best_template(prompt)
            
            if not best_template:
                return self._create_emergency_weapon(prompt, player_id)
            
            # Create weapon from template with variations
            properties = WeaponProperties(**best_template["properties"])
            
            # Add some randomization to make it feel unique
            variation = hash(prompt) % 20 - 10  # -10 to +10
            properties.damage = max(15, min(85, properties.damage + variation))
            properties.speed = max(20, min(95, properties.speed + variation))
            
            weapon = Weapon(
                id=Weapon.generate_id(),
                name=self._generate_weapon_name(prompt),
                category=WeaponCategory(best_template["category"]),
                properties=properties,
                sprite_url=best_template["sprite_url"],
                generated_at=time.time(),
                balance_score=self._calculate_balance_score(properties),
                player_id=player_id
            )
            
            return weapon
            
        except Exception as e:
            logger.error(f"Template generation failed: {e}")
            return self._create_emergency_weapon(prompt, player_id)
    
    def _find_best_template(self, prompt: str) -> Optional[Dict]:
        """Find the best matching weapon template"""
        prompt_words = prompt.lower().split()
        
        best_match = None
        best_score = 0
        
        for template in self.weapon_templates:
            score = 0
            
            # Check name matches
            template_name = template["name"].lower()
            for word in prompt_words:
                if word in template_name:
                    score += 3
                
            # Check keyword matches  
            for keyword in template.get("keywords", []):
                if keyword.lower() in prompt:
                    score += 2
            
            # Check category hints
            for word in prompt_words:
                if word in template.get("category_hints", []):
                    score += 1
            
            if score > best_score:
                best_score = score
                best_match = template
        
        return best_match if best_score > 0 else self.weapon_templates[0]  # Default to first template
    
    def _generate_weapon_sprite(self, prompt: str, category: WeaponCategory) -> str:
        """Generate weapon sprite image as base64 data URL"""
        try:
            # Create 64x64 image
            img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Determine color scheme based on prompt
            colors = self._get_weapon_colors(prompt)
            
            # Draw weapon based on category
            if category == WeaponCategory.PROJECTILE:
                self._draw_projectile_weapon(draw, colors)
            elif category == WeaponCategory.MELEE:
                self._draw_melee_weapon(draw, colors)
            elif category == WeaponCategory.AREA_EFFECT:
                self._draw_area_weapon(draw, colors)
            elif category == WeaponCategory.UTILITY:
                self._draw_utility_weapon(draw, colors)
            else:
                self._draw_magic_weapon(draw, colors)
            
            # Convert to base64 data URL
            buffered = io.BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Sprite generation failed: {e}")
            return self._get_default_sprite()
    
    def _get_weapon_colors(self, prompt: str) -> Dict[str, tuple]:
        """Determine color scheme based on prompt keywords"""
        prompt_lower = prompt.lower()
        
        if any(word in prompt_lower for word in ['fire', 'flame', 'burn', 'hot']):
            return {
                'primary': (255, 100, 0, 255),    # Orange
                'secondary': (255, 200, 0, 255),  # Yellow
                'accent': (255, 255, 255, 255)    # White
            }
        elif any(word in prompt_lower for word in ['ice', 'frost', 'cold', 'freeze']):
            return {
                'primary': (100, 200, 255, 255),   # Light blue
                'secondary': (200, 230, 255, 255), # Pale blue
                'accent': (255, 255, 255, 255)     # White
            }
        elif any(word in prompt_lower for word in ['poison', 'toxic', 'venom', 'green']):
            return {
                'primary': (50, 255, 50, 255),     # Bright green
                'secondary': (100, 200, 100, 255), # Medium green
                'accent': (200, 255, 200, 255)     # Light green
            }
        elif any(word in prompt_lower for word in ['lightning', 'electric', 'shock', 'thunder']):
            return {
                'primary': (255, 255, 100, 255),   # Bright yellow
                'secondary': (200, 200, 255, 255), # Light purple
                'accent': (255, 255, 255, 255)     # White
            }
        else:
            # Default metallic colors
            return {
                'primary': (150, 150, 150, 255),   # Gray
                'secondary': (200, 200, 200, 255), # Light gray
                'accent': (100, 100, 100, 255)     # Dark gray
            }
    
    def _draw_projectile_weapon(self, draw, colors):
        """Draw a projectile weapon (bow, gun, etc.)"""
        # Draw weapon body
        draw.rectangle([20, 25, 45, 35], fill=colors['primary'])
        draw.rectangle([25, 30, 50, 35], fill=colors['secondary'])
        
        # Draw projectile/arrow
        draw.line([50, 32, 60, 32], fill=colors['accent'], width=2)
        draw.polygon([(58, 30), (62, 32), (58, 34)], fill=colors['accent'])
    
    def _draw_melee_weapon(self, draw, colors):
        """Draw a melee weapon (sword, axe, etc.)"""
        # Draw handle
        draw.rectangle([30, 40, 35, 55], fill=colors['secondary'])
        
        # Draw blade
        draw.polygon([(32, 15), (28, 40), (37, 40)], fill=colors['primary'])
        
        # Draw guard
        draw.rectangle([25, 38, 40, 42], fill=colors['accent'])
    
    def _draw_area_weapon(self, draw, colors):
        """Draw an area effect weapon (bomb, orb, etc.)"""
        # Draw main orb
        draw.ellipse([25, 25, 40, 40], fill=colors['primary'])
        draw.ellipse([28, 28, 37, 37], fill=colors['secondary'])
        
        # Draw energy effects
        for i in range(4):
            angle = i * 90
            x = 32 + 15 * (1 if angle % 180 == 0 else 0)
            y = 32 + 15 * (1 if angle % 360 < 180 else -1)
            draw.line([32, 32, x, y], fill=colors['accent'], width=2)
    
    def _draw_utility_weapon(self, draw, colors):
        """Draw a utility weapon (shield, tool, etc.)"""
        # Draw shield shape
        draw.polygon([(32, 15), (45, 25), (45, 45), (32, 50), (20, 45), (20, 25)], 
                    fill=colors['primary'])
        draw.polygon([(32, 20), (40, 28), (40, 42), (32, 45), (25, 42), (25, 28)], 
                    fill=colors['secondary'])
    
    def _draw_magic_weapon(self, draw, colors):
        """Draw a magic weapon (staff, wand, etc.)"""
        # Draw staff
        draw.line([32, 15, 32, 50], fill=colors['secondary'], width=4)
        
        # Draw magic orb
        draw.ellipse([27, 12, 37, 22], fill=colors['primary'])
        draw.ellipse([29, 14, 35, 20], fill=colors['accent'])
        
        # Draw sparkles
        for x, y in [(25, 20), (40, 25), (35, 30)]:
            draw.ellipse([x-1, y-1, x+1, y+1], fill=colors['accent'])
    
    def _create_weapon_templates(self) -> List[Dict]:
        """Create pre-defined weapon templates for rapid generation"""
        return [
            {
                "name": "Fire Sword",
                "category": "melee",
                "keywords": ["fire", "flame", "sword", "blade", "burn"],
                "category_hints": ["sword", "blade", "melee"],
                "properties": {
                    "damage": 65, "speed": 70, "range": 40, "ammo": 1,
                    "cooldown": 2000, "special_effect": "burn_damage"
                },
                "sprite_url": self._get_default_sprite()
            },
            {
                "name": "Ice Spear",
                "category": "projectile", 
                "keywords": ["ice", "frost", "spear", "cold", "freeze"],
                "category_hints": ["spear", "arrow", "projectile"],
                "properties": {
                    "damage": 55, "speed": 85, "range": 120, "ammo": 8,
                    "cooldown": 1800, "special_effect": "freeze_target"
                },
                "sprite_url": self._get_default_sprite()
            },
            {
                "name": "Lightning Hammer",
                "category": "melee",
                "keywords": ["lightning", "thunder", "hammer", "electric", "shock"],
                "category_hints": ["hammer", "mace", "melee"],
                "properties": {
                    "damage": 75, "speed": 45, "range": 50, "ammo": 1,
                    "cooldown": 2800, "special_effect": "area_lightning"
                },
                "sprite_url": self._get_default_sprite()
            },
            {
                "name": "Poison Dagger",
                "category": "melee",
                "keywords": ["poison", "toxic", "dagger", "venom", "green"],
                "category_hints": ["dagger", "knife", "blade"],
                "properties": {
                    "damage": 40, "speed": 90, "range": 30, "ammo": 1,
                    "cooldown": 1500, "special_effect": "poison_dot"
                },
                "sprite_url": self._get_default_sprite()
            },
            {
                "name": "Magic Shield",
                "category": "utility",
                "keywords": ["shield", "protect", "defense", "magic", "barrier"],
                "category_hints": ["shield", "defense", "utility"],
                "properties": {
                    "damage": 20, "speed": 40, "range": 60, "ammo": 1,
                    "cooldown": 3500, "special_effect": "damage_reduction"
                },
                "sprite_url": self._get_default_sprite()
            },
            {
                "name": "Explosive Bomb",
                "category": "area_effect",
                "keywords": ["bomb", "explosive", "boom", "blast", "explode"],
                "category_hints": ["bomb", "grenade", "explosive"],
                "properties": {
                    "damage": 60, "speed": 30, "range": 80, "ammo": 3,
                    "cooldown": 3000, "special_effect": "area_explosion"
                },
                "sprite_url": self._get_default_sprite()
            }
        ]
    
    def _calculate_balance_score(self, properties: WeaponProperties) -> float:
        """Calculate weapon balance score (0-100)"""
        # Normalize values
        damage_norm = properties.damage / 100.0
        speed_norm = properties.speed / 100.0
        range_norm = properties.range / 200.0
        cooldown_penalty = (5000 - properties.cooldown) / 5000.0
        
        # Calculate power score
        power_score = (
            damage_norm * 0.4 +
            speed_norm * 0.3 +
            range_norm * 0.2 +
            cooldown_penalty * 0.1
        )
        
        # Special effect multiplier
        effect_multipliers = {
            "burn_damage": 1.2,
            "freeze_target": 1.15,
            "area_explosion": 1.3,
            "poison_dot": 1.25,
            "area_lightning": 1.25,
            "damage_reduction": 0.8,
            "none": 1.0
        }
        
        multiplier = effect_multipliers.get(properties.special_effect, 1.0)
        balance_score = power_score * multiplier * 100
        
        return min(100, max(0, balance_score))
    
    def _apply_balance_nerf(self, properties: WeaponProperties) -> WeaponProperties:
        """Apply balance nerfs to overpowered weapons"""
        # Reduce damage and increase cooldown
        properties.damage = int(properties.damage * 0.8)
        properties.cooldown = int(properties.cooldown * 1.2)
        
        return properties
    
    def _generate_weapon_name(self, prompt: str) -> str:
        """Generate a proper weapon name from prompt"""
        words = prompt.strip().split()
        if len(words) == 1:
            return words[0].capitalize()
        elif len(words) == 2:
            return f"{words[0].capitalize()} {words[1].capitalize()}"
        else:
            return " ".join(word.capitalize() for word in words[:2])
    
    def _create_emergency_weapon(self, prompt: str, player_id: str) -> Weapon:
        """Create emergency fallback weapon if all else fails"""
        return Weapon(
            id=Weapon.generate_id(),
            name=f"Basic {prompt.split()[0].capitalize() if prompt else 'Weapon'}",
            category=WeaponCategory.PROJECTILE,
            properties=WeaponProperties(
                damage=50, speed=60, range=100, ammo=10,
                cooldown=2000, special_effect="none"
            ),
            sprite_url=self._get_default_sprite(),
            generated_at=time.time(),
            balance_score=50,
            player_id=player_id
        )
    
    def _get_default_sprite(self) -> str:
        """Get default weapon sprite as base64 data URL"""
        # Create simple default sprite
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw simple sword shape
        draw.rectangle([30, 40, 35, 55], fill=(139, 69, 19, 255))  # Handle
        draw.polygon([(32, 15), (28, 40), (37, 40)], fill=(192, 192, 192, 255))  # Blade
        draw.rectangle([25, 38, 40, 42], fill=(255, 215, 0, 255))  # Guard
        
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    async def _pre_generate_common_weapons(self):
        """Pre-generate sprites for common weapon templates"""
        logger.info("Pre-generating common weapon sprites...")
        
        for template in self.weapon_templates:
            try:
                category = WeaponCategory(template["category"])
                sprite_url = self._generate_weapon_sprite(template["name"], category)
                template["sprite_url"] = sprite_url
            except Exception as e:
                logger.warning(f"Failed to pre-generate sprite for {template['name']}: {e}")
                template["sprite_url"] = self._get_default_sprite()
        
        logger.info(f"Pre-generated {len(self.weapon_templates)} weapon sprites")
    
    def get_stats(self) -> Dict:
        """Get generation statistics"""
        return self.generation_stats.copy()
    
    async def cleanup(self):
        """Cleanup resources"""
        self.cache.clear()
        logger.info("🔧 Weapon Generator cleaned up")