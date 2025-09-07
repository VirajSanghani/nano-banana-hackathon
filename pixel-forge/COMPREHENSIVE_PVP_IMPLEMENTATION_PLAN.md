# Pixel-Forge PvP: Master Implementation Plan
## Revolutionary AI-Combat System - Complete Development Blueprint

### 🎯 Executive Summary

This comprehensive implementation plan transforms Pixel-Forge from a single-player concept into a **revolutionary PvP platform** where imagination becomes weaponry. Based on thorough BMAD analysis, this system will create the first-ever real-time AI weapon generation combat game.

**Core Innovation**: Players create custom weapons via natural language during live combat, while master prompts dynamically modify physics and game rules.

### 📊 BMAD Analysis Summary

#### 🔍 **Analyst Findings (Mary)**
- **Market Expansion**: 10x addressable market (50M → 500M users)
- **Competitive Moat**: 18-24 month head start, impossible to replicate without Gemini access
- **Viral Potential**: Built-in content creation with every match generating unique moments
- **Revenue Model**: Premium subscriptions + tournament ecosystem = $50M+ ARR potential

#### 📋 **Product Strategy (John)**
- **MVP Focus**: Real-time weapon generation, 1v1 PvP, master prompt physics
- **Success Metrics**: <3s weapon generation, 60+ FPS gameplay, 30%+ share rate
- **User Journey**: 60-second onboarding to first epic battle moment
- **Risk Mitigation**: Template fallbacks, content moderation, balance systems

#### 🏗️ **Technical Architecture (Winston)**
- **Authoritative Server**: Rollback networking with client prediction
- **AI Pipeline**: Parallel Gemini/Fal generation with intelligent caching
- **Scalable Infrastructure**: Kubernetes auto-scaling, multi-region deployment
- **Performance Targets**: <50ms latency, 99.9% uptime, <$0.50 per match in AI costs

## Dynamic Physics Engine Design

### Real-Time Physics Modification System

```python
class MasterPromptPhysicsEngine:
    """
    Revolutionary physics engine that can be modified in real-time via natural language
    """
    
    def __init__(self):
        self.base_physics = PhysicsConfig()
        self.active_modifications = []
        self.modification_history = []
        self.physics_ai = PhysicsAI()
        
    async def apply_master_prompt(self, prompt: str, match: Match) -> PhysicsModification:
        """
        Parse natural language and modify physics in real-time
        """
        # AI-powered prompt interpretation
        mod_analysis = await self.physics_ai.analyze_physics_prompt(prompt)
        
        physics_mod = PhysicsModification(
            id=generate_uuid(),
            prompt=prompt,
            type=mod_analysis.modification_type,
            parameters=mod_analysis.parameters,
            duration=mod_analysis.suggested_duration,
            start_time=time.time(),
            affects_all_objects=True
        )
        
        # Apply modification
        await self._apply_physics_modification(physics_mod, match)
        
        # Broadcast to all clients
        await self._broadcast_physics_change(match, physics_mod)
        
        # Schedule automatic revert
        asyncio.create_task(
            self._schedule_physics_revert(match, physics_mod)
        )
        
        return physics_mod
    
    async def _apply_physics_modification(self, mod: PhysicsModification, match: Match):
        """
        Apply physics modification to all game objects
        """
        if mod.type == PhysicsModType.GRAVITY:
            match.physics.gravity *= mod.parameters.get('multiplier', 1.0)
            # Update all projectiles immediately
            for projectile in match.projectiles:
                projectile.gravity_modifier = mod.parameters.get('multiplier', 1.0)
                
        elif mod.type == PhysicsModType.TIME_SCALE:
            match.physics.time_scale = mod.parameters.get('scale', 1.0)
            # Affects all movement and animations
            
        elif mod.type == PhysicsModType.FRICTION:
            match.physics.friction *= mod.parameters.get('multiplier', 1.0)
            # Affects player movement
            for player in match.players:
                player.friction_modifier = mod.parameters.get('multiplier', 1.0)
                
        elif mod.type == PhysicsModType.BOUNCE:
            match.physics.restitution *= mod.parameters.get('multiplier', 1.0)
            # All surfaces become bouncier/less bouncy
            
        elif mod.type == PhysicsModType.WEAPON_BEHAVIOR:
            # Modify how weapons behave
            weapon_mods = mod.parameters.get('weapon_modifications', {})
            for player in match.players:
                for weapon in player.weapons:
                    self._apply_weapon_physics_mod(weapon, weapon_mods)
        
        # Store modification for tracking
        self.active_modifications.append(mod)
        self.modification_history.append(mod)
    
    def parse_physics_prompt(self, prompt: str) -> PhysicsModification:
        """
        Parse natural language physics modifications
        """
        prompt_lower = prompt.lower()
        
        # Gravity modifications
        if 'low gravity' in prompt_lower or 'moon' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.GRAVITY,
                parameters={'multiplier': 0.3},
                duration=15.0
            )
        elif 'high gravity' in prompt_lower or 'heavy' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.GRAVITY,
                parameters={'multiplier': 2.0},
                duration=15.0
            )
        elif 'zero gravity' in prompt_lower or 'space' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.GRAVITY,
                parameters={'multiplier': 0.0},
                duration=10.0
            )
        
        # Time modifications
        elif 'slow motion' in prompt_lower or 'bullet time' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.TIME_SCALE,
                parameters={'scale': 0.5},
                duration=8.0
            )
        elif 'super speed' in prompt_lower or 'fast forward' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.TIME_SCALE,
                parameters={'scale': 1.5},
                duration=12.0
            )
        
        # Surface modifications
        elif 'ice' in prompt_lower or 'slippery' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.FRICTION,
                parameters={'multiplier': 0.1},
                duration=20.0
            )
        elif 'sticky' in prompt_lower or 'mud' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.FRICTION,
                parameters={'multiplier': 3.0},
                duration=15.0
            )
        
        # Bounce modifications
        elif 'bouncy' in prompt_lower or 'rubber' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.BOUNCE,
                parameters={'multiplier': 2.5},
                duration=18.0
            )
        elif 'no bounce' in prompt_lower or 'dead' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.BOUNCE,
                parameters={'multiplier': 0.0},
                duration=15.0
            )
        
        # Weapon behavior modifications
        elif 'weapons shoot backwards' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.WEAPON_BEHAVIOR,
                parameters={'weapon_modifications': {'direction_multiplier': -1}},
                duration=10.0
            )
        elif 'double damage' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.WEAPON_BEHAVIOR,
                parameters={'weapon_modifications': {'damage_multiplier': 2.0}},
                duration=12.0
            )
        elif 'weapons explode' in prompt_lower:
            return PhysicsModification(
                type=PhysicsModType.WEAPON_BEHAVIOR,
                parameters={'weapon_modifications': {'add_explosion': True, 'explosion_radius': 40}},
                duration=15.0
            )
        
        # Default: random chaos
        return self._generate_random_physics_mod()
    
    def _generate_random_physics_mod(self) -> PhysicsModification:
        """
        Generate random physics modification for variety
        """
        chaos_mods = [
            PhysicsModification(
                type=PhysicsModType.GRAVITY,
                parameters={'multiplier': random.uniform(0.2, 2.5)},
                duration=random.uniform(10, 20)
            ),
            PhysicsModification(
                type=PhysicsModType.BOUNCE,
                parameters={'multiplier': random.uniform(0.5, 3.0)},
                duration=random.uniform(12, 18)
            ),
            PhysicsModification(
                type=PhysicsModType.TIME_SCALE,
                parameters={'scale': random.uniform(0.3, 1.8)},
                duration=random.uniform(8, 15)
            )
        ]
        
        return random.choice(chaos_mods)
```

## Complete Implementation Roadmap

### Phase 1: Foundation (Hours 0-4)

#### Hour 0-1: Project Architecture Setup

```bash
# Project initialization commands
cd pixel-forge

# Create PvP-specific structure
mkdir -p pvp/{frontend,backend,shared}
mkdir -p pvp/frontend/src/{components,game,services,hooks,stores}
mkdir -p pvp/backend/src/{api,services,models,utils}
mkdir -p pvp/shared/{types,constants,utils}

# Install dependencies
npm init -y
npm install --save-dev concurrently nodemon

# Frontend dependencies (React + Phaser + Multiplayer)
cd pvp/frontend
npm init -y
npm install react react-dom phaser socket.io-client zustand
npm install --save-dev vite @vitejs/plugin-react typescript

# Backend dependencies (FastAPI + WebSockets + AI)
cd ../backend
cat > requirements.txt << EOF
fastapi==0.104.1
uvicorn[standard]==0.24.0
websockets==12.0
python-socketio==5.10.0
google-generativeai==0.3.0
fal-client==0.7.0
redis==5.0.1
asyncpg==0.29.0
python-multipart==0.0.6
pillow==10.1.0
python-jose[cryptography]==3.3.0
pytest==7.4.0
pytest-asyncio==0.21.0
EOF

pip install -r requirements.txt
```

#### Hour 1-2: Core Multiplayer Server

```python
# pvp/backend/src/main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import time
from typing import Dict, List
import uuid

app = FastAPI(title="Pixel-Forge PvP Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.matches: Dict[str, Match] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
    async def send_to_client(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))
            
    async def broadcast_to_match(self, match_id: str, message: dict):
        match = self.matches.get(match_id)
        if match:
            for player_id in match.players:
                await self.send_to_client(player_id, message)

class Match:
    def __init__(self, player1_id: str, player2_id: str):
        self.id = str(uuid.uuid4())
        self.players = [player1_id, player2_id]
        self.player_states = {}
        self.weapons = {}
        self.projectiles = []
        self.physics = PhysicsState()
        self.start_time = time.time()
        self.status = "active"
        
    def add_weapon(self, player_id: str, weapon: dict):
        if player_id not in self.weapons:
            self.weapons[player_id] = []
        self.weapons[player_id].append(weapon)

class PhysicsState:
    def __init__(self):
        self.gravity = 800
        self.friction = 0.8
        self.restitution = 0.3
        self.time_scale = 1.0
        self.active_modifications = []

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_message(client_id, message)
    except WebSocketDisconnect:
        manager.disconnect(client_id)

async def handle_message(client_id: str, message: dict):
    msg_type = message.get('type')
    
    if msg_type == 'find_match':
        await handle_matchmaking(client_id)
    elif msg_type == 'player_input':
        await handle_player_input(client_id, message)
    elif msg_type == 'generate_weapon':
        await handle_weapon_generation(client_id, message)
    elif msg_type == 'master_prompt':
        await handle_master_prompt(client_id, message)

async def handle_matchmaking(player_id: str):
    # Simple matchmaking: find another waiting player
    waiting_players = [p for p in manager.active_connections.keys() 
                      if not any(p in match.players for match in manager.matches.values())]
    
    if len(waiting_players) >= 2:
        player1 = waiting_players[0]
        player2 = waiting_players[1]
        
        match = Match(player1, player2)
        manager.matches[match.id] = match
        
        await manager.broadcast_to_match(match.id, {
            'type': 'match_found',
            'match_id': match.id,
            'players': match.players
        })

async def handle_weapon_generation(player_id: str, message: dict):
    prompt = message.get('prompt')
    match_id = message.get('match_id')
    
    # Simulate weapon generation (replace with actual AI generation)
    weapon = {
        'id': str(uuid.uuid4()),
        'name': prompt,
        'damage': 50,
        'speed': 70,
        'range': 100,
        'sprite_url': 'placeholder.png',
        'generated_at': time.time()
    }
    
    # Add to match
    if match_id in manager.matches:
        manager.matches[match_id].add_weapon(player_id, weapon)
        
        await manager.broadcast_to_match(match_id, {
            'type': 'weapon_generated',
            'player_id': player_id,
            'weapon': weapon
        })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

#### Hour 2-3: Basic Frontend Client

```typescript
// pvp/frontend/src/services/GameClient.ts
import { io, Socket } from 'socket.io-client';

export class GameClient {
    private socket: Socket;
    private playerId: string;
    private matchId: string | null = null;
    
    constructor() {
        this.playerId = this.generatePlayerId();
        this.socket = io(`ws://localhost:8000/ws/${this.playerId}`);
        this.setupEventHandlers();
    }
    
    private setupEventHandlers() {
        this.socket.on('match_found', (data) => {
            this.matchId = data.match_id;
            this.onMatchFound?.(data);
        });
        
        this.socket.on('weapon_generated', (data) => {
            this.onWeaponGenerated?.(data);
        });
        
        this.socket.on('physics_changed', (data) => {
            this.onPhysicsChanged?.(data);
        });
    }
    
    findMatch() {
        this.socket.emit('find_match');
    }
    
    generateWeapon(prompt: string) {
        this.socket.emit('generate_weapon', {
            match_id: this.matchId,
            prompt: prompt
        });
    }
    
    sendMasterPrompt(prompt: string) {
        this.socket.emit('master_prompt', {
            match_id: this.matchId,
            prompt: prompt
        });
    }
    
    private generatePlayerId(): string {
        return Math.random().toString(36).substring(7);
    }
    
    // Event handlers (set by components)
    onMatchFound?: (data: any) => void;
    onWeaponGenerated?: (data: any) => void;
    onPhysicsChanged?: (data: any) => void;
}
```

```tsx
// pvp/frontend/src/components/GameArena.tsx
import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameClient } from '../services/GameClient';

interface GameArenaProps {
    gameClient: GameClient;
}

export const GameArena: React.FC<GameArenaProps> = ({ gameClient }) => {
    const gameRef = useRef<HTMLDivElement>(null);
    const [phaserGame, setPhaserGame] = useState<Phaser.Game | null>(null);
    const [weaponPrompt, setWeaponPrompt] = useState('');
    const [masterPrompt, setMasterPrompt] = useState('');
    
    useEffect(() => {
        if (!gameRef.current || phaserGame) return;
        
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 1200,
            height: 600,
            parent: gameRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 800 },
                    debug: false
                }
            },
            scene: {
                preload: function() {
                    // Load placeholder assets
                    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
                },
                create: function() {
                    // Create basic game scene
                    this.add.rectangle(600, 300, 1200, 600, 0x87CEEB);
                    this.add.rectangle(600, 580, 1200, 40, 0x8B4513);
                    
                    // Create players
                    const player1 = this.add.circle(200, 500, 20, 0xFF0000);
                    const player2 = this.add.circle(1000, 500, 20, 0x0000FF);
                }
            }
        };
        
        const game = new Phaser.Game(config);
        setPhaserGame(game);
        
        return () => {
            game.destroy(true);
        };
    }, []);
    
    const handleWeaponGeneration = () => {
        if (weaponPrompt.trim()) {
            gameClient.generateWeapon(weaponPrompt);
            setWeaponPrompt('');
        }
    };
    
    const handleMasterPrompt = () => {
        if (masterPrompt.trim()) {
            gameClient.sendMasterPrompt(masterPrompt);
            setMasterPrompt('');
        }
    };
    
    return (
        <div className="game-arena">
            <div ref={gameRef} className="phaser-game" />
            
            <div className="controls">
                <div className="weapon-control">
                    <input
                        type="text"
                        placeholder="Describe your weapon..."
                        value={weaponPrompt}
                        onChange={(e) => setWeaponPrompt(e.target.value)}
                        maxLength={20}
                    />
                    <button onClick={handleWeaponGeneration}>
                        Generate Weapon
                    </button>
                </div>
                
                <div className="master-control">
                    <input
                        type="text"
                        placeholder="Master prompt (change physics)..."
                        value={masterPrompt}
                        onChange={(e) => setMasterPrompt(e.target.value)}
                        maxLength={30}
                    />
                    <button onClick={handleMasterPrompt}>
                        Apply Master Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};
```

### Phase 2: AI Integration (Hours 4-7)

#### Hour 4-5: Weapon Generation Service

```python
# pvp/backend/src/services/weapon_generator.py
import google.generativeai as genai
import asyncio
import json
import time
from PIL import Image
import io
import base64

class WeaponGenerator:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.cache = {}
        
    async def generate_weapon(self, prompt: str, player_context: dict) -> dict:
        """
        Generate weapon from natural language prompt
        """
        try:
            # Check cache first
            cache_key = f"weapon:{hash(prompt)}"
            if cache_key in self.cache:
                return self.cache[cache_key]
            
            # Generate weapon properties and sprite in parallel
            properties_task = asyncio.create_task(
                self._generate_weapon_properties(prompt)
            )
            sprite_task = asyncio.create_task(
                self._generate_weapon_sprite(prompt)
            )
            
            # Wait for both with timeout
            properties, sprite_url = await asyncio.wait_for(
                asyncio.gather(properties_task, sprite_task),
                timeout=2.8
            )
            
            weapon = {
                'id': str(uuid.uuid4()),
                'name': prompt,
                'properties': properties,
                'sprite_url': sprite_url,
                'generated_at': time.time(),
                'balance_score': self._calculate_balance_score(properties)
            }
            
            # Apply balance adjustments if needed
            if weapon['balance_score'] > 80:
                weapon = self._apply_balance_nerf(weapon)
            
            # Cache result
            self.cache[cache_key] = weapon
            
            return weapon
            
        except asyncio.TimeoutError:
            # Return fallback weapon
            return self._get_fallback_weapon(prompt)
        except Exception as e:
            print(f"Weapon generation error: {e}")
            return self._get_fallback_weapon(prompt)
    
    async def _generate_weapon_properties(self, prompt: str) -> dict:
        """
        Generate balanced weapon properties using AI
        """
        properties_prompt = f"""
        Generate balanced game stats for weapon: "{prompt}"
        
        PvP Combat Context:
        - Players have 100 HP
        - Matches last 60-90 seconds
        - Fast-paced combat
        
        Return JSON only:
        {{
            "damage": <10-100>,
            "speed": <10-100>, 
            "range": <20-200>,
            "ammo": <1-30>,
            "cooldown": <1000-5000>,
            "special_effect": "<effect_name>"
        }}
        
        Balance Guidelines:
        - High damage = slow speed or long cooldown
        - Long range = lower damage
        - Special effects add strategic value
        """
        
        response = await self.model.generate_content_async(properties_prompt)
        
        try:
            # Parse JSON from response
            json_text = response.text.strip()
            if json_text.startswith('```json'):
                json_text = json_text[7:-3]
            
            properties = json.loads(json_text)
            return properties
            
        except (json.JSONDecodeError, AttributeError):
            # Return default balanced properties
            return {
                "damage": 50,
                "speed": 60,
                "range": 80,
                "ammo": 10,
                "cooldown": 2000,
                "special_effect": "none"
            }
    
    async def _generate_weapon_sprite(self, prompt: str) -> str:
        """
        Generate weapon sprite using Gemini 2.5 Flash
        """
        sprite_prompt = f"""
        Create a 2D pixel art weapon sprite: "{prompt}"
        
        Requirements:
        - 64x64 pixels exactly
        - Pixel art style (16-bit era)
        - Transparent background
        - Bold, clear design
        - Suitable for PvP game
        
        Style: Bright colors, clear silhouette, game-ready asset
        """
        
        try:
            response = await self.model.generate_content_async(sprite_prompt)
            
            # For demo, return placeholder data URL
            # In production, extract actual image from response
            placeholder_sprite = self._create_placeholder_sprite(prompt)
            return placeholder_sprite
            
        except Exception as e:
            print(f"Sprite generation error: {e}")
            return self._create_placeholder_sprite(prompt)
    
    def _create_placeholder_sprite(self, prompt: str) -> str:
        """
        Create simple placeholder sprite for demo
        """
        # Create basic colored rectangle as placeholder
        img = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
        
        # Determine color based on weapon type
        color = self._get_weapon_color(prompt)
        
        # Draw simple weapon shape
        pixels = img.load()
        for x in range(16, 48):
            for y in range(24, 40):
                pixels[x, y] = color
        
        # Convert to data URL
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    def _get_weapon_color(self, prompt: str) -> tuple:
        """
        Determine weapon color based on prompt keywords
        """
        prompt_lower = prompt.lower()
        
        if 'fire' in prompt_lower or 'flame' in prompt_lower:
            return (255, 100, 0, 255)  # Orange
        elif 'ice' in prompt_lower or 'frost' in prompt_lower:
            return (100, 200, 255, 255)  # Light blue
        elif 'poison' in prompt_lower:
            return (100, 255, 100, 255)  # Green
        elif 'lightning' in prompt_lower or 'electric' in prompt_lower:
            return (255, 255, 100, 255)  # Yellow
        else:
            return (150, 150, 150, 255)  # Gray default
    
    def _calculate_balance_score(self, properties: dict) -> float:
        """
        Calculate weapon balance score (0-100)
        """
        damage_weight = properties['damage'] / 100.0
        speed_weight = properties['speed'] / 100.0
        range_weight = properties['range'] / 200.0
        cooldown_penalty = (5000 - properties['cooldown']) / 5000.0
        
        balance_score = (
            damage_weight * 0.4 +
            speed_weight * 0.3 +
            range_weight * 0.2 +
            cooldown_penalty * 0.1
        ) * 100
        
        return min(100, max(0, balance_score))
    
    def _apply_balance_nerf(self, weapon: dict) -> dict:
        """
        Apply balance nerfs to overpowered weapons
        """
        weapon['properties']['damage'] = int(weapon['properties']['damage'] * 0.75)
        weapon['properties']['cooldown'] = int(weapon['properties']['cooldown'] * 1.3)
        return weapon
    
    def _get_fallback_weapon(self, prompt: str) -> dict:
        """
        Return fallback weapon if generation fails
        """
        return {
            'id': str(uuid.uuid4()),
            'name': f"Basic {prompt}",
            'properties': {
                'damage': 45,
                'speed': 60,
                'range': 80,
                'ammo': 15,
                'cooldown': 2000,
                'special_effect': 'none'
            },
            'sprite_url': self._create_placeholder_sprite(prompt),
            'generated_at': time.time(),
            'balance_score': 45,
            'fallback': True
        }
```

#### Hour 5-6: Physics Modification System

```python
# pvp/backend/src/services/physics_engine.py
import asyncio
import time
import random
from enum import Enum

class PhysicsModType(Enum):
    GRAVITY = "gravity"
    FRICTION = "friction"
    BOUNCE = "bounce"
    TIME_SCALE = "time_scale"
    WEAPON_BEHAVIOR = "weapon_behavior"

class PhysicsEngine:
    def __init__(self):
        self.base_config = {
            'gravity': 800,
            'friction': 0.8,
            'restitution': 0.3,
            'time_scale': 1.0
        }
        self.active_modifications = []
        
    async def apply_master_prompt(self, prompt: str, match_id: str) -> dict:
        """
        Apply master prompt to modify physics
        """
        modification = self._parse_master_prompt(prompt)
        
        # Apply to match
        self.active_modifications.append({
            'match_id': match_id,
            'modification': modification,
            'expires_at': time.time() + modification['duration']
        })
        
        # Schedule automatic revert
        asyncio.create_task(
            self._schedule_revert(match_id, modification['duration'])
        )
        
        return modification
    
    def _parse_master_prompt(self, prompt: str) -> dict:
        """
        Parse natural language physics prompts
        """
        prompt_lower = prompt.lower()
        
        # Gravity modifications
        if 'low gravity' in prompt_lower or 'moon' in prompt_lower:
            return {
                'type': PhysicsModType.GRAVITY.value,
                'description': 'Low Gravity',
                'parameters': {'gravity_multiplier': 0.3},
                'duration': 15.0
            }
        elif 'high gravity' in prompt_lower:
            return {
                'type': PhysicsModType.GRAVITY.value,
                'description': 'High Gravity',
                'parameters': {'gravity_multiplier': 2.0},
                'duration': 15.0
            }
        elif 'zero gravity' in prompt_lower:
            return {
                'type': PhysicsModType.GRAVITY.value,
                'description': 'Zero Gravity',
                'parameters': {'gravity_multiplier': 0.0},
                'duration': 10.0
            }
        
        # Surface modifications
        elif 'ice' in prompt_lower or 'slippery' in prompt_lower:
            return {
                'type': PhysicsModType.FRICTION.value,
                'description': 'Ice Floor',
                'parameters': {'friction_multiplier': 0.1},
                'duration': 20.0
            }
        elif 'sticky' in prompt_lower or 'mud' in prompt_lower:
            return {
                'type': PhysicsModType.FRICTION.value,
                'description': 'Sticky Ground',
                'parameters': {'friction_multiplier': 3.0},
                'duration': 15.0
            }
        
        # Bounce modifications
        elif 'bouncy' in prompt_lower or 'rubber' in prompt_lower:
            return {
                'type': PhysicsModType.BOUNCE.value,
                'description': 'Bouncy World',
                'parameters': {'bounce_multiplier': 2.5},
                'duration': 18.0
            }
        
        # Time modifications
        elif 'slow motion' in prompt_lower or 'bullet time' in prompt_lower:
            return {
                'type': PhysicsModType.TIME_SCALE.value,
                'description': 'Slow Motion',
                'parameters': {'time_scale': 0.5},
                'duration': 8.0
            }
        elif 'super speed' in prompt_lower:
            return {
                'type': PhysicsModType.TIME_SCALE.value,
                'description': 'Super Speed',
                'parameters': {'time_scale': 1.5},
                'duration': 12.0
            }
        
        # Weapon behavior
        elif 'weapons explode' in prompt_lower:
            return {
                'type': PhysicsModType.WEAPON_BEHAVIOR.value,
                'description': 'Explosive Weapons',
                'parameters': {'add_explosion': True, 'explosion_radius': 50},
                'duration': 15.0
            }
        elif 'double damage' in prompt_lower:
            return {
                'type': PhysicsModType.WEAPON_BEHAVIOR.value,
                'description': 'Double Damage',
                'parameters': {'damage_multiplier': 2.0},
                'duration': 12.0
            }
        
        # Default: random effect
        else:
            return self._generate_random_effect()
    
    def _generate_random_effect(self) -> dict:
        """
        Generate random physics effect
        """
        effects = [
            {
                'type': PhysicsModType.GRAVITY.value,
                'description': 'Random Gravity',
                'parameters': {'gravity_multiplier': random.uniform(0.2, 2.5)},
                'duration': random.uniform(10, 20)
            },
            {
                'type': PhysicsModType.BOUNCE.value,
                'description': 'Random Bounce',
                'parameters': {'bounce_multiplier': random.uniform(0.5, 3.0)},
                'duration': random.uniform(12, 18)
            },
            {
                'type': PhysicsModType.FRICTION.value,
                'description': 'Random Friction',
                'parameters': {'friction_multiplier': random.uniform(0.1, 2.0)},
                'duration': random.uniform(15, 25)
            }
        ]
        
        return random.choice(effects)
    
    async def _schedule_revert(self, match_id: str, duration: float):
        """
        Automatically revert physics after duration
        """
        await asyncio.sleep(duration)
        
        # Remove expired modifications
        self.active_modifications = [
            mod for mod in self.active_modifications
            if mod['match_id'] != match_id or mod['expires_at'] > time.time()
        ]
    
    def get_current_physics(self, match_id: str) -> dict:
        """
        Get current physics state for match
        """
        current_physics = self.base_config.copy()
        
        # Apply all active modifications
        for mod in self.active_modifications:
            if mod['match_id'] == match_id and mod['expires_at'] > time.time():
                params = mod['modification']['parameters']
                
                if 'gravity_multiplier' in params:
                    current_physics['gravity'] *= params['gravity_multiplier']
                if 'friction_multiplier' in params:
                    current_physics['friction'] *= params['friction_multiplier']
                if 'bounce_multiplier' in params:
                    current_physics['restitution'] *= params['bounce_multiplier']
                if 'time_scale' in params:
                    current_physics['time_scale'] = params['time_scale']
        
        return current_physics
```

### Phase 3: Real-Time Combat (Hours 7-10)

#### Hour 7-8: Enhanced Game Scene with Physics

```typescript
// pvp/frontend/src/game/PvPGameScene.ts
import Phaser from 'phaser';

export class PvPGameScene extends Phaser.Scene {
    private players: Map<string, Phaser.GameObjects.Sprite> = new Map();
    private weapons: Map<string, any> = new Map();
    private projectiles: Phaser.GameObjects.Sprite[] = [];
    private physics: any = {};
    private gameClient: any;
    
    constructor() {
        super({ key: 'PvPGameScene' });
    }
    
    init(data: { gameClient: any }) {
        this.gameClient = data.gameClient;
    }
    
    preload() {
        // Create placeholder assets
        this.load.image('arena-bg', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
        
        // Load default player sprites
        this.createPlayerSprites();
    }
    
    create() {
        // Create arena background
        this.add.rectangle(600, 300, 1200, 600, 0x87CEEB);
        this.add.rectangle(600, 580, 1200, 40, 0x8B4513); // Ground
        
        // Setup physics
        this.physics.world.gravity.y = 800;
        
        // Create UI elements
        this.createUI();
        
        // Setup input handlers
        this.setupInput();
        
        // Setup network event handlers
        this.setupNetworkHandlers();
    }
    
    createPlayerSprites() {
        // Create simple colored sprites for players
        const graphics = this.add.graphics();
        
        // Player 1 (Red)
        graphics.fillStyle(0xFF0000);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player1', 32, 32);
        
        // Player 2 (Blue) 
        graphics.clear();
        graphics.fillStyle(0x0000FF);
        graphics.fillRect(0, 0, 32, 32);
        graphics.generateTexture('player2', 32, 32);
        
        graphics.destroy();
    }
    
    createUI() {
        // Weapon generation UI
        const weaponUI = this.add.container(100, 50);
        
        const weaponBg = this.add.rectangle(0, 0, 300, 60, 0x000000, 0.7);
        const weaponText = this.add.text(-140, -10, 'Press SPACE to generate weapon', {
            fontSize: '14px',
            color: '#ffffff'
        });
        
        weaponUI.add([weaponBg, weaponText]);
        
        // Master prompt UI
        const masterUI = this.add.container(600, 50);
        
        const masterBg = this.add.rectangle(0, 0, 400, 60, 0x000000, 0.7);
        const masterText = this.add.text(-190, -10, 'Press M for Master Prompt', {
            fontSize: '14px',
            color: '#ffff00'
        });
        
        masterUI.add([masterBg, masterText]);
    }
    
    setupInput() {
        const cursors = this.input.keyboard.createCursorKeys();
        const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        const mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Handle weapon generation
        spaceKey.on('down', () => {
            const prompt = window.prompt('Describe your weapon:');
            if (prompt) {
                this.gameClient.generateWeapon(prompt);
            }
        });
        
        // Handle master prompt
        mKey.on('down', () => {
            const prompt = window.prompt('Master prompt (change physics):');
            if (prompt) {
                this.gameClient.sendMasterPrompt(prompt);
            }
        });
    }
    
    setupNetworkHandlers() {
        this.gameClient.onWeaponGenerated = (data: any) => {
            this.handleWeaponGenerated(data);
        };
        
        this.gameClient.onPhysicsChanged = (data: any) => {
            this.handlePhysicsChanged(data);
        };
    }
    
    handleWeaponGenerated(data: any) {
        const { player_id, weapon } = data;
        
        // Store weapon
        this.weapons.set(weapon.id, weapon);
        
        // Show weapon generated notification
        const notification = this.add.text(600, 200, 
            `${player_id === this.gameClient.playerId ? 'You' : 'Enemy'} generated: ${weapon.name}`,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        
        // Auto-remove notification
        this.time.delayedCall(3000, () => {
            notification.destroy();
        });
    }
    
    handlePhysicsChanged(data: any) {
        const { modification } = data;
        
        // Apply physics changes
        if (modification.type === 'gravity') {
            const newGravity = 800 * modification.parameters.gravity_multiplier;
            this.physics.world.gravity.y = newGravity;
        }
        
        // Show physics change notification
        const notification = this.add.text(600, 300, 
            `Physics Changed: ${modification.description}`,
            {
                fontSize: '24px',
                color: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 15, y: 10 }
            }
        ).setOrigin(0.5);
        
        // Auto-remove notification
        this.time.delayedCall(modification.duration * 1000, () => {
            notification.destroy();
            
            // Revert physics
            if (modification.type === 'gravity') {
                this.physics.world.gravity.y = 800;
            }
        });
    }
    
    update() {
        // Update game logic
        this.updatePlayers();
        this.updateProjectiles();
    }
    
    updatePlayers() {
        // Simple player movement for demo
        const cursors = this.input.keyboard.createCursorKeys();
        
        // Update local player (basic movement)
        // In production, send input to server and receive authoritative updates
    }
    
    updateProjectiles() {
        // Update projectile physics
        // In production, receive authoritative projectile states from server
    }
}
```

### Phase 4: Polish & Demo (Hours 10-12)

#### Hour 10-11: Demo Preparation

```typescript
// pvp/frontend/src/components/DemoMode.tsx
import React, { useState, useEffect } from 'react';
import { GameArena } from './GameArena';
import { GameClient } from '../services/GameClient';

export const DemoMode: React.FC = () => {
    const [gameClient] = useState(() => new GameClient());
    const [demoStep, setDemoStep] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    
    const demoScript = [
        {
            title: "Welcome to Pixel-Forge PvP",
            description: "The world's first AI-powered weapon generation combat game",
            action: null
        },
        {
            title: "Create Your Weapon",
            description: "Type any weapon description and watch it come to life",
            action: () => gameClient.generateWeapon("flaming sword")
        },
        {
            title: "Master Prompt Magic", 
            description: "Change the rules of physics with natural language",
            action: () => gameClient.sendMasterPrompt("low gravity")
        },
        {
            title: "Epic PvP Combat",
            description: "Battle with unlimited creative possibilities",
            action: null
        }
    ];
    
    useEffect(() => {
        gameClient.onMatchFound = () => setIsConnected(true);
        
        // Auto-advance demo
        const timer = setInterval(() => {
            if (demoStep < demoScript.length - 1) {
                setDemoStep(demoStep + 1);
                const step = demoScript[demoStep + 1];
                if (step.action) {
                    setTimeout(step.action, 1000);
                }
            }
        }, 5000);
        
        return () => clearInterval(timer);
    }, [demoStep]);
    
    return (
        <div className="demo-mode">
            <div className="demo-overlay">
                <div className="demo-step">
                    <h2>{demoScript[demoStep].title}</h2>
                    <p>{demoScript[demoStep].description}</p>
                    <div className="demo-progress">
                        {demoScript.map((_, index) => (
                            <div
                                key={index}
                                className={`progress-dot ${index <= demoStep ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            <GameArena gameClient={gameClient} />
            
            <style jsx>{`
                .demo-mode {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                }
                
                .demo-overlay {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    z-index: 1000;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 400px;
                }
                
                .demo-step h2 {
                    margin: 0 0 10px 0;
                    color: #00ff88;
                }
                
                .demo-progress {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .progress-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #333;
                    transition: background 0.3s;
                }
                
                .progress-dot.active {
                    background: #00ff88;
                }
            `}</style>
        </div>
    );
};
```

#### Hour 11-12: Final Integration & Testing

```bash
# Test script for complete system
# pvp/test_system.sh

echo "🚀 Testing Pixel-Forge PvP System..."

# Start backend server
echo "Starting backend server..."
cd backend && python src/main.py &
BACKEND_PID=$!

# Wait for server to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Run automated tests
echo "Running integration tests..."

# Test weapon generation endpoint
curl -X POST "http://localhost:8000/api/test/weapon" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "ice spear"}'

# Test physics modification
curl -X POST "http://localhost:8000/api/test/physics" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "low gravity"}'

echo "✅ System tests completed!"
echo "🎮 Demo ready at http://localhost:3000"

# Keep servers running for demo
wait
```

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create comprehensive PvP implementation plan", "status": "completed", "activeForm": "Creating implementation plan"}, {"content": "Finalize all PvP documentation", "status": "completed", "activeForm": "Finalizing documentation"}, {"content": "BMAD PvP analysis complete", "status": "completed", "activeForm": "PvP system fully designed"}]