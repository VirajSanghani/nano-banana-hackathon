# Product Requirements Document: Pixel-Forge
## The AI 2D Game Generator

### Executive Summary
Pixel-Forge democratizes game creation by allowing anyone to build a personalized 2D platformer using natural language and their own photo as the hero. Leveraging Gemini 2.5 Flash's image generation, we create viral-worthy, shareable mini-games that tap into the $180B gaming market and creator economy.

### Problem Statement
- 65% of gamers want to create games but lack programming skills
- Existing game makers are complex and time-consuming
- Players want personalized gaming experiences
- Social media demands unique, shareable content

### Solution
A web-based tool that generates playable 2D platformer games from text prompts, featuring the user as an 8-bit hero created from their selfie.

### Target Users
**Primary**: Casual gamers aged 13-35
**Secondary**: Content creators, streamers, social media users
**Tertiary**: Educators wanting custom educational games

### Core Features (MVP)

#### 1. Natural Language Game Design (P0)
- Text prompt for game theme/setting
- AI interprets and generates appropriate assets
- Pre-defined templates for quick start

#### 2. Selfie-to-Sprite Hero (P0)
- Upload photo → 8-bit character sprite
- Automatic sprite sheet generation (idle, run, jump)
- Face preservation with pixel art style

#### 3. AI-Generated Game Assets (P0)
- Themed platforms (3 types)
- Collectible items (coins/gems/custom)
- Background scenery
- One enemy type

#### 4. Instant Playable Game (P0)
- Physics-based platformer mechanics
- Keyboard/touch controls
- Win condition: Collect all items
- Death/retry system

#### 5. Natural Language Modifications (P1)
- "Make jumps higher"
- "Add more enemies"
- "Change to space theme"
- Real-time parameter adjustments

#### 6. Share & Play (P1)
- Unique URL for each game
- No login required to play
- Social media preview cards
- High score tracking

### Technical Requirements

#### Frontend
- **Game Engine**: Phaser.js 3.60+
- **Framework**: React for UI wrapper
- **Controls**: Keyboard + Touch support
- **Target**: Modern browsers (Chrome, Safari, Firefox)

#### Backend
- **API**: FastAPI
- **Game Storage**: JSON game definitions
- **Asset CDN**: CloudFlare
- **URL Shortener**: Custom implementation

#### AI Integration
- **Gemini 2.5 Flash**: Sprite/asset generation
- **Fal AI FLUX**: Quick asset variations
- **Prompt Templates**: Pre-optimized for consistency

#### Performance Requirements
- Game load time: < 3 seconds
- Sprite generation: < 10 seconds
- Asset generation: < 5 seconds per type
- Smooth 60 FPS gameplay
- Mobile-responsive

### User Flow

1. **Landing Page**
   - "Create Your Game in 60 Seconds!"
   - Example games carousel
   - Start button

2. **Game Setup**
   - Describe your game (text input)
   - Upload selfie for hero
   - Select difficulty preset

3. **Generation Phase**
   - Progress indicator
   - Preview of generating assets
   - Fun facts/tips while waiting

4. **Game Ready**
   - Instant play button
   - Tutorial overlay (controls)
   - Modification panel

5. **Gameplay**
   - Smooth platformer physics
   - Score/progress display
   - Pause/restart options

6. **Victory/Share**
   - Completion celebration
   - Share link generation
   - "Make Another" option

### Game Specifications (MVP)

#### Physics Parameters
```javascript
{
  gravity: 800,        // Adjustable via "make gravity lighter"
  playerSpeed: 160,    // Adjustable via "make me faster"
  jumpVelocity: -330,  // Adjustable via "jump higher"
  playerBounce: 0.2
}
```

#### Level Structure
- Width: 3200px (2 screens)
- Platforms: 8-12 randomly placed
- Collectibles: 5-8 items
- Enemies: 1-3 (moving patterns)
- Win: Collect all items

### Success Metrics
- Game creation time < 60 seconds
- Sprite recognition accuracy > 90%
- Game completion rate > 70%
- Share rate > 30%
- Return visitor rate > 40%

### Demo Strategy (Hackathon)
1. Pre-generate assets for common themes
2. Live selfie-to-sprite with judge
3. Create game from judge's idea
4. Play game immediately
5. Show viral potential (QR code to play)

### Risk Mitigation
- **Sprite Generation Failure**: Fallback to generic avatars
- **Inappropriate Images**: Content filtering + pre-made sprites
- **Performance Issues**: Limit game complexity
- **Browser Compatibility**: Focus on Chrome for demo

### Implementation Priority
1. Basic Phaser.js platformer template
2. Selfie-to-sprite pipeline (CRITICAL PATH)
3. Theme-based asset generation
4. Natural language parameters
5. Sharing system
6. Polish and optimization

### Technical Architecture

```
User Input → FastAPI Backend → AI Services
                ↓                    ↓
         Game Definition ← Asset Generation
                ↓
         Phaser.js Engine
                ↓
         Playable Game
```

### Sprite Generation Pipeline
1. Face detection and extraction
2. Gemini prompt: "8-bit pixel art character, front view"
3. Composite onto body template
4. Generate animation frames
5. Create sprite sheet

### Future Enhancements (Post-MVP)
- Multiplayer racing mode
- Level editor
- Power-ups and abilities
- Boss battles
- Mobile app version
- NFT/blockchain integration
- Tournament system

### Competitive Advantages
1. **Instant Gratification**: 60-second creation
2. **Personal Investment**: You ARE the hero
3. **Social Virality**: Shareable, unique games
4. **No Skills Required**: Natural language input
5. **Free to Play**: No barriers to entry

### Resource Requirements
- 2 developers (game dev experience preferred)
- 12-hour development sprint
- Test photos (diverse faces)
- Multiple test devices

### Success Criteria for Hackathon
✅ Convert selfie to playable sprite
✅ Generate themed game assets
✅ Playable platformer with physics
✅ Natural language modifications work
✅ Shareable game links
✅ Fun, viral-worthy demonstration