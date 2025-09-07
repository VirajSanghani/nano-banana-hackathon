# Pixel-Forge PvP: Revolutionary AI Combat Arena

> **🚀 Revolutionary Gaming Experience**: Create weapons with natural language prompts, battle in real-time with dynamic physics modifications, and experience the future of AI-powered competitive gaming.

## 🌟 Overview

Pixel-Forge PvP is a groundbreaking multiplayer combat game that introduces a new gaming genre where:

- **🤖 AI-Generated Weapons**: Create unique weapons using natural language prompts in <3 seconds
- **🌀 Dynamic Physics**: Master prompts change gravity, friction, time, and weapon behavior in real-time
- **⚡ Real-Time Combat**: 60 FPS multiplayer battles with authoritative server architecture
- **🎯 Competitive Balance**: AI-powered balance scoring prevents overpowered weapons
- **🌐 Web-Based**: No downloads required - runs entirely in your browser

## 🏗️ Architecture

### Backend (Python + FastAPI)
```
pvp-web/backend/
├── app/
│   ├── main.py                    # FastAPI server with WebSocket multiplayer
│   └── services/
│       ├── weapon_generator.py    # AI weapon generation (<3s requirement)
│       ├── physics_engine.py      # Dynamic physics modifications
│       ├── match_manager.py       # Game state management
│       └── connection_manager.py  # WebSocket connection handling
├── requirements.txt               # Python dependencies
└── shared/types/                  # Shared type definitions
```

### Frontend (React + Phaser.js + TypeScript)
```
pvp-web/frontend/
├── src/
│   ├── App.tsx                   # Main application orchestrator
│   ├── components/               # React UI components
│   │   ├── MainMenu.tsx         # Landing page with instructions
│   │   ├── GameContainer.tsx    # Main game interface
│   │   └── game/                # In-game UI components
│   ├── game/scenes/             # Phaser.js game engine
│   ├── services/                # WebSocket & API services
│   ├── store/                   # Zustand state management
│   └── types/                   # TypeScript definitions
├── package.json                 # Node.js dependencies
└── vite.config.ts              # Build configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.8+
- **Google Gemini API Key** (for AI weapon generation)

### 1. Setup Environment
```bash
# Clone and navigate
cd /Users/vs/nano-banana/pixel-forge/pvp-web

# Create environment file
cp .env.example .env
# Add your GEMINI_API_KEY to .env
```

### 2. Start Backend
```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Start Frontend
```bash
# Install Node dependencies
cd ../frontend
npm install

# Start development server
npm run dev
```

### 4. Open Game
Navigate to http://localhost:5173 in your browser

## 🎮 How to Play

### Controls
- **WASD** - Move your character
- **Mouse** - Aim weapons
- **Left Click** - Fire current weapon
- **Numbers 1-5** - Switch weapons
- **TAB** - Toggle performance stats
- **L** - Toggle leaderboard
- **ESC** - Pause menu

### Weapon Generation
1. Type a weapon description in the prompt box
2. Examples: `"fire sword"`, `"ice cannon"`, `"lightning bow"`
3. Wait for AI generation (max 3 seconds)
4. Use your new weapon immediately!

### Master Prompts
Special physics modifications that affect all players:
- `"low gravity"` - Reduce gravity effects
- `"bouncy world"` - Increase surface restitution
- `"ice floor"` - Reduce friction
- `"slow motion"` - Reduce time scale
- `"high gravity"` - Increase downward force

## 🔧 Technical Features

### AI Weapon Generation
- **Sub-3-second generation** with fallback templates
- **Balance scoring system** prevents overpowered weapons
- **Natural language processing** for creative prompts
- **Template fallback system** ensures 100% success rate
- **Caching system** for performance optimization

### Real-Time Multiplayer
- **Authoritative server** architecture
- **60 FPS game loop** with client prediction
- **WebSocket communication** for minimal latency
- **State synchronization** across all clients
- **Automatic reconnection** on connection loss

### Dynamic Physics System
- **Real-time physics modification** during gameplay
- **Natural language physics prompts** 
- **Automatic physics scheduling** every 30-45 seconds
- **Visual effects** for physics changes
- **Cumulative modifications** support

### Performance Optimization
- **Client-side prediction** for smooth gameplay
- **Server reconciliation** for accuracy
- **Efficient state updates** (only changed data)
- **Weapon generation caching** 
- **Particle system optimization**

## 🏆 Game Mechanics

### Victory Conditions
1. **Last Player Standing** - Eliminate all opponents
2. **Time Limit** - Highest health after 90 seconds
3. **Kill Leader** - Most eliminations in case of tie

### Weapon System
- **5 weapon slots** maximum per player
- **12-second cooldown** between generations
- **Categories**: Projectile, Melee, Area Effect, Utility, Magic
- **Dynamic properties**: Damage, Speed, Range, Ammo, Cooldown
- **Special effects**: Explosions, status effects, unique behaviors

### Physics Modifications
- **Duration-based** effects (8-25 seconds)
- **Multiplicative stacking** for multiple effects
- **Type categories**: Gravity, Friction, Bounce, Time Scale, Weapon Behavior
- **Visual indicators** show active modifications

## 🔑 API Integration

### Required API Keys
```bash
# .env configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Gemini 2.5 Flash Image Features
- **Character consistency** across weapon generations
- **Fast generation** (<3 second requirement)
- **Creative interpretation** of natural language prompts
- **Visual sprite generation** for weapons
- **Property inference** from descriptions

## 📊 Performance Metrics

### Target Performance
- ⚡ **<3s weapon generation** (with fallback)
- 🎯 **60 FPS gameplay** maintained
- 📡 **<100ms network latency** for input
- 🔄 **100% uptime** for weapon generation
- 🌐 **4-8 player support** per match

### Monitoring
- Real-time FPS counter
- Network latency display
- Memory usage tracking
- WebSocket connection health
- Match statistics dashboard

## 🚀 Hackathon Innovation

This project showcases revolutionary gaming concepts for the **Nano Banana Hackathon (September 2025)**:

### 🎯 Core Innovations
1. **First-ever AI weapon generation** in competitive gaming
2. **Natural language physics control** creating dynamic gameplay
3. **Sub-3-second asset generation** for real-time competitive play
4. **Revolutionary game genre** blending creativity with competition

### 🏅 Competition Advantages
- **Leverages Gemini 2.5 Flash Image** as primary innovation driver
- **Demonstrates technical sophistication** with authoritative networking
- **Shows consumer appeal** with intuitive natural language interface
- **Proves scalability** with efficient caching and fallback systems

### 🔬 Technical Achievements
- **Authoritative server architecture** for competitive integrity
- **Client-side prediction** for responsive gameplay
- **AI generation pipeline** with guaranteed success
- **Dynamic game rule modification** during runtime
- **Cross-platform web deployment** with no installation required

## 🌟 Future Enhancements

### Planned Features
- **Tournament mode** with bracket progression
- **Weapon crafting system** combining multiple prompts
- **Custom arena builder** with physics presets
- **Spectator mode** with match replay
- **Mobile optimization** for touch controls
- **Voice-controlled prompts** using ElevenLabs integration
- **3D arena visualization** with advanced graphics
- **AI commentary system** for matches

### Scalability Roadmap
- **Dedicated server deployment** for production
- **Load balancing** for multiple concurrent matches  
- **Database persistence** for player progression
- **Anti-cheat systems** for competitive integrity
- **Analytics dashboard** for match insights

## 🛠️ Development

### Build Commands
```bash
# Backend
cd backend
python -m uvicorn app.main:app --reload

# Frontend  
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test
```

### Environment Variables
```bash
# Backend (.env)
GEMINI_API_KEY=your_api_key
HOST=0.0.0.0
PORT=8000
DEBUG=true

# Frontend (automatically handled by Vite)
VITE_API_URL=http://localhost:8000
```

## 📖 Documentation

- **[Game Design Document](./PVP_PRD.md)** - Complete product requirements
- **[Technical Architecture](./PVP_TECHNICAL_ARCHITECTURE.md)** - System design
- **[Weapon Generation System](./WEAPON_GENERATION_SYSTEM.md)** - AI pipeline details
- **[Implementation Plan](./COMPREHENSIVE_PVP_IMPLEMENTATION_PLAN.md)** - Development roadmap

## 🤝 Contributing

This is a hackathon project developed for the Nano Banana Hackathon. The codebase demonstrates:

- **Rapid prototyping** techniques for competitive development
- **AI integration** best practices
- **Real-time multiplayer** architecture patterns
- **Web-based game development** with modern tools

## 🏆 Hackathon Results

**Target Achievements:**
- ✅ Revolutionary gaming concept implementation
- ✅ Advanced AI integration with Gemini 2.5 Flash Image  
- ✅ Technical sophistication demonstration
- ✅ Consumer-ready application prototype
- ✅ Complete web-based deployment

**Impact Metrics:**
- **10x market expansion** potential (new gaming genre)
- **Sub-3-second generation** competitive advantage  
- **60 FPS performance** on standard hardware
- **Cross-platform compatibility** with web deployment
- **Infinite content generation** through AI creativity

---

## ⚡ Ready to Battle?

**Experience the future of competitive gaming where creativity meets skill!**

1. **🚀 Start the servers** (Backend + Frontend)
2. **🎮 Open http://localhost:5173** 
3. **⚔️ Enter your battle name**
4. **🌟 Create your first AI weapon**
5. **🏆 Dominate the arena!**

*Built with ❤️ for the Nano Banana Hackathon - Showcasing the revolutionary potential of AI-powered gaming experiences.*