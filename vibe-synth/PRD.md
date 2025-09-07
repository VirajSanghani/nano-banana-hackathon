# Product Requirements Document: Vibe-Synth
## The Emotion-Powered Instrument

### Executive Summary
Vibe-Synth creates a revolutionary musical instrument that translates emotions and voice into real-time audiovisual art. Using sentiment analysis, voice processing, and generative visuals, users create unique, personal soundscapes by speaking, offering a new form of creative expression and emotional release.

### Problem Statement
- Traditional instruments require years of training
- People struggle to express emotions creatively
- Music creation tools are complex and intimidating
- Existing apps don't connect emotion to creation

### Solution
A web-based instrument that analyzes speech (content and delivery) to generate real-time music and visuals, creating a synesthetic experience where emotions become art.

### Target Users
**Primary**: Creative individuals (18-40) seeking new expression
**Secondary**: Wellness/meditation practitioners
**Tertiary**: Musicians, artists, content creators

### Core Features (MVP)

#### 1. Voice Capture & Analysis (P0)
- Real-time microphone input
- Pitch detection (fundamental frequency)
- Volume/amplitude tracking
- Speech-to-text transcription

#### 2. Emotion Detection (P0)
- Sentiment analysis of spoken words
- Emotional categories: Joy, Sadness, Calm, Energy
- Confidence scoring
- Real-time processing

#### 3. Musical Synthesis (P0)
- Emotion-to-music mapping
  - Joy → Major scales, bright timbres
  - Sadness → Minor scales, soft pads
  - Energy → Fast tempo, rhythmic elements
  - Calm → Ambient drones, slow evolution
- Voice pitch controls lead melody
- Volume controls intensity/dynamics

#### 4. Visual Generation (P0)
- Particle system responding to audio
- Color palette based on emotion
- Movement patterns from voice dynamics
- Abstract, generative art style

#### 5. Session Recording (P1)
- Capture audio/visual performance
- Playback functionality
- Export as video file
- Share via link

#### 6. Presets & Modes (P1)
- Meditation mode (calming responses)
- Energy mode (uplifting responses)
- Free mode (full emotional range)

### Technical Requirements

#### Frontend
- **Audio**: Web Audio API
- **Synthesis**: Tone.js
- **Visuals**: Three.js or p5.js
- **UI Framework**: React
- **State**: Zustand

#### Backend
- **API**: FastAPI
- **Sentiment**: Google Cloud Natural Language
- **Speech**: Web Speech API
- **Session Storage**: Redis

#### AI Integration
- **Gemini 2.5 Flash**: Mood board generation
- **Sentiment Analysis**: Real-time emotion detection
- **Fal AI**: Background texture generation

#### Performance Requirements
- Audio latency: < 50ms
- Visual sync: < 100ms
- Sentiment analysis: < 200ms
- Smooth 60 FPS visuals
- CPU usage < 60%

### User Flow

1. **Permission & Setup**
   - Microphone permission request
   - Audio level check
   - Brief tutorial

2. **Main Interface**
   - Dark, minimal design
   - Central visualization area
   - Emotion indicator
   - Recording button

3. **Interaction**
   - User speaks/sings
   - Real-time audio response
   - Visual evolution
   - Emotion feedback

4. **Performance**
   - Continuous creation
   - Natural pauses respected
   - Smooth transitions

5. **Capture & Share**
   - Save performance
   - Review playback
   - Share or export

### Technical Architecture

```
Microphone Input → Web Audio API → Audio Analysis
                         ↓               ↓
                  Speech-to-Text    Pitch/Volume
                         ↓               ↓
                 Sentiment Analysis  Parameter Mapping
                         ↓               ↓
                    Tone.js Synth ← Control Parameters
                         ↓               ↓
                   Audio Output    Visual Engine
                                        ↓
                                  Three.js Display
```

### Audio-Emotion Mapping

```javascript
{
  joy: {
    scale: 'major',
    tempo: 120,
    brightness: 0.8,
    reverb: 0.3
  },
  sadness: {
    scale: 'minor',
    tempo: 60,
    brightness: 0.3,
    reverb: 0.7
  },
  energy: {
    scale: 'mixolydian',
    tempo: 140,
    brightness: 0.9,
    reverb: 0.2
  },
  calm: {
    scale: 'pentatonic',
    tempo: 80,
    brightness: 0.5,
    reverb: 0.5
  }
}
```

### Visual System

#### Particle Behavior
- **Count**: Emotion intensity (100-1000)
- **Speed**: Voice volume
- **Color**: Emotion mapping
- **Size**: Pitch frequency
- **Trails**: Sustain/reverb amount

#### Color Palettes
- Joy: Warm yellows, oranges
- Sadness: Cool blues, purples
- Energy: Bright reds, greens
- Calm: Soft pastels, whites

### Success Metrics
- Session length > 3 minutes
- Return usage rate > 50%
- Social shares > 20%
- Performance recordings > 40%
- Positive sentiment > 85%

### Demo Strategy (Hackathon)
1. Pre-test microphone setup
2. Judge speaks a poem/story
3. Show real-time emotion detection
4. Demonstrate musical response
5. Record and playback session
6. Show shareability

### Risk Mitigation
- **Microphone Issues**: Fallback to text input
- **Performance Problems**: Reduce particle count
- **Latency**: Prioritize audio over visuals
- **Browser Compatibility**: Chrome-only for demo
- **Audio Feedback**: Headphone detection

### Implementation Priority
1. Voice capture and analysis
2. Basic synthesis engine
3. Emotion detection
4. Visual particle system
5. Synchronization
6. Recording/playback

### Simplified MVP Approach
Given time constraints, consider:
- Pre-defined emotion presets
- Simplified particle visuals
- Basic musical scales only
- Skip recording initially
- Focus on live experience

### Future Enhancements (Post-MVP)
- Multi-user jam sessions
- AI-generated lyrics from emotions
- VR/AR visualization
- Therapeutic mode with guidance
- Music theory education mode
- Export to DAW formats
- Biometric integration (heartrate)

### Competitive Advantages
1. **Zero Barrier**: No musical knowledge needed
2. **Emotional Connection**: Direct feeling-to-art
3. **Unique Output**: Never the same twice
4. **Therapeutic Value**: Emotional release tool
5. **Social Interest**: Shareable performances

### Resource Requirements
- 2 developers (audio experience crucial)
- 16-hour development sprint (HIGH RISK)
- Quality microphone for testing
- Multiple browsers/devices

### Success Criteria for Hackathon
✅ Voice input creates music in real-time
✅ Emotion detection influences sound
✅ Synchronized visual response
✅ Smooth, lag-free performance
✅ Clear emotion-to-music mapping
✅ Impressive live demonstration

### Recommendation
While innovative, Vibe-Synth is the highest risk project due to:
- Complex real-time requirements
- Less emphasis on Gemini's image capabilities
- Longer development time (16 hrs vs 12 hrs)
- Higher chance of demo failure

Consider as backup if other projects face issues.