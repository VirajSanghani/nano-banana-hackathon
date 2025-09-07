# Vibe-Synth Implementation Plan
## Emotion-Powered Musical Instrument for Nano Banana Hackathon

### 🎯 Project Vision
Transform spoken words and emotions into real-time audiovisual art, creating a zero-barrier musical instrument that anyone can play with their voice.

---

## 📊 Strategic Analysis (Business Analyst Perspective)

### Market Opportunity
- **Gap**: No existing product combines real-time voice sentiment with audiovisual synthesis
- **Audience**: 500M+ content creators, wellness practitioners, music educators
- **Differentiator**: Zero musical skill requirement, instant emotional expression

### Risk Mitigation Strategy
1. **Technical Complexity**: Modular architecture allows feature reduction
2. **Demo Reliability**: Pre-recorded fallback videos ready
3. **Gemini Integration**: Enhanced visual generation to showcase API

---

## 📋 Product Strategy (Product Manager Perspective)

### MVP Definition (12-Hour Build)
**Core Loop**: Speak → Analyze → Generate → Experience

### Feature Prioritization
**P0 - Must Have (6 hours)**
- Voice capture & analysis
- 4-state emotion detection
- Basic audio synthesis
- Simple particle visuals

**P1 - Should Have (4 hours)**
- Gemini mood boards
- Recording capability
- Share functionality

**P2 - Nice to Have (2 hours)**
- Presets & modes
- Export features
- Advanced visuals

### Success Metrics
- 30-second compelling demo
- Zero crashes during presentation
- Clear emotion-to-output mapping
- Judge engagement > 2 minutes

---

## 🏗️ Technical Architecture (Architect Perspective)

### System Design
```
Frontend (React + Vite)
├── Audio Pipeline (Web Audio API + Tone.js)
├── Visual Engine (Three.js + React Three Fiber)
└── State Management (Zustand)
    │
    ├── WebSocket ──→ Backend (FastAPI)
    │                 ├── Sentiment Analysis
    │                 ├── Gemini Integration
    │                 └── Session Management
    │
    └── REST API ────→ External Services
                      ├── Gemini 2.5 Flash
                      ├── ElevenLabs
                      └── Fal AI
```

### Technology Stack
**Frontend:**
- React 18 + Vite (fast builds)
- Tone.js (audio synthesis)
- Three.js (3D visuals)
- Tailwind CSS (rapid styling)

**Backend:**
- FastAPI (async performance)
- Redis (session state)
- python-socketio (real-time)
- google-genai (Gemini API)

---

## 🚀 Implementation Roadmap

### Hour 0-2: Foundation Setup
```bash
# Project structure
vibe-synth/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioCapture.jsx
│   │   │   ├── EmotionDisplay.jsx
│   │   │   └── VibeCanvas.jsx
│   │   ├── hooks/
│   │   │   └── useAudioAnalysis.js
│   │   └── services/
│   │       └── audioProcessor.js
│   └── package.json
├── backend/
│   ├── main.py
│   ├── services/
│   │   ├── sentiment.py
│   │   └── synthesis.py
│   └── requirements.txt
└── docker-compose.yml
```

**Tasks:**
- [ ] Initialize React + Vite frontend
- [ ] Setup FastAPI backend
- [ ] Configure WebSocket connection
- [ ] Implement microphone access

### Hour 2-4: Audio Pipeline
**Frontend Audio Capture:**
```javascript
// useAudioAnalysis.js
const useAudioAnalysis = () => {
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);
  
  useEffect(() => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        
        const detectPitch = () => {
          // Pitch detection logic
          const dataArray = new Float32Array(analyser.frequencyBinCount);
          analyser.getFloatFrequencyData(dataArray);
          // Process and setPitch
        };
        
        setInterval(detectPitch, 50); // 20Hz update rate
      });
  }, []);
  
  return { pitch, volume };
};
```

**Backend Sentiment Analysis:**
```python
# services/sentiment.py
from textblob import TextBlob
import numpy as np

class EmotionAnalyzer:
    def analyze_text(self, text: str) -> dict:
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        # Map to emotions
        if polarity > 0.5:
            emotion = "joy"
            confidence = polarity
        elif polarity < -0.5:
            emotion = "sadness"
            confidence = abs(polarity)
        elif subjectivity > 0.7:
            emotion = "energy"
            confidence = subjectivity
        else:
            emotion = "calm"
            confidence = 1 - subjectivity
            
        return {
            "emotion": emotion,
            "confidence": confidence,
            "parameters": self.get_synthesis_params(emotion)
        }
```

### Hour 4-6: Synthesis Engine
**Tone.js Integration:**
```javascript
// services/synthesizer.js
import * as Tone from 'tone';

class VibeSynthesizer {
  constructor() {
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.reverb = new Tone.Reverb(2).toDestination();
    this.synth.connect(this.reverb);
  }
  
  updateEmotion(emotion, confidence) {
    const presets = {
      joy: {
        scale: ['C4', 'E4', 'G4', 'C5'],
        tempo: 120,
        reverb: 0.3
      },
      sadness: {
        scale: ['A3', 'C4', 'E4', 'A4'],
        tempo: 60,
        reverb: 0.7
      }
    };
    
    const preset = presets[emotion];
    this.reverb.wet.value = preset.reverb;
    // Apply other parameters
  }
  
  playNote(pitch, volume) {
    const note = this.pitchToNote(pitch);
    this.synth.triggerAttackRelease(note, '8n', undefined, volume);
  }
}
```

### Hour 6-8: Visual System
**Three.js Particle System:**
```javascript
// components/ParticleField.jsx
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';

function ParticleField({ emotion, intensity }) {
  const mesh = useRef();
  const particleCount = 1000;
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const emotionColors = {
      joy: [1, 0.8, 0.2],      // Yellow
      sadness: [0.2, 0.3, 0.8], // Blue
      energy: [0.9, 0.2, 0.3],  // Red
      calm: [0.5, 0.8, 0.6]     // Green
    };
    
    const color = emotionColors[emotion];
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }
    
    return [positions, colors];
  }, [emotion]);
  
  useFrame((state) => {
    mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} vertexColors />
    </points>
  );
}
```

### Hour 8-10: Gemini Integration
**Visual Generation Service:**
```python
# services/gemini_visual.py
import google.generativeai as genai
from typing import Dict
import asyncio

class GeminiVisualGenerator:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
    async def generate_mood_board(self, emotion: str, text: str) -> str:
        prompt = f"""
        Generate an abstract visual description for:
        Emotion: {emotion}
        Text: "{text}"
        
        Describe colors, shapes, movement patterns, and atmosphere
        that would represent this emotional state visually.
        Keep it abstract and suitable for particle effects.
        """
        
        response = await self.model.generate_content_async(prompt)
        return self.parse_visual_params(response.text)
    
    def parse_visual_params(self, description: str) -> Dict:
        # Extract visual parameters from description
        return {
            "primary_color": self.extract_color(description),
            "particle_behavior": self.extract_movement(description),
            "intensity": self.extract_intensity(description)
        }
```

### Hour 10-11: Integration & Polish
**WebSocket Real-time Communication:**
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

app = FastAPI()
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

@sio.on('audio_data')
async def handle_audio(sid, data):
    # Process audio chunk
    text = data.get('transcript')
    pitch = data.get('pitch')
    volume = data.get('volume')
    
    # Analyze emotion
    emotion_data = emotion_analyzer.analyze_text(text)
    
    # Generate visuals (async)
    if should_update_visuals():
        asyncio.create_task(
            generate_and_emit_visuals(sid, emotion_data)
        )
    
    # Emit synthesis parameters
    await sio.emit('synthesis_update', {
        'emotion': emotion_data['emotion'],
        'parameters': emotion_data['parameters'],
        'pitch': pitch,
        'volume': volume
    }, to=sid)
```

### Hour 11-12: Testing & Demo Prep
**Demo Checklist:**
- [ ] Test with different voice types
- [ ] Verify emotion transitions
- [ ] Check visual synchronization
- [ ] Prepare fallback recordings
- [ ] Test on presentation hardware
- [ ] Create 30-second highlight reel

**Demo Script:**
1. "Let me show you Vibe-Synth - where your voice becomes music"
2. Speak a happy phrase → Show joy response
3. Speak a sad phrase → Show mood shift
4. Demonstrate pitch control
5. Show Gemini-generated visuals
6. Play back recorded session

---

## 🎮 Quick Start Commands

```bash
# Setup
git clone <repo>
cd vibe-synth

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:socket_app --reload

# Frontend
cd frontend
npm install
npm run dev

# Docker (alternative)
docker-compose up
```

---

## 🚨 Critical Path & Risk Management

### High-Risk Areas
1. **Audio latency** → Solution: Client-side synthesis
2. **Emotion detection accuracy** → Solution: Pre-defined test phrases
3. **Visual performance** → Solution: Adjustable particle count
4. **API rate limits** → Solution: Caching & request batching

### Fallback Plan
If time runs short, focus on:
1. Basic audio → emotion → simple visual
2. Skip recording/sharing
3. Use preset emotions instead of real-time detection
4. Simple 2D canvas instead of Three.js

---

## 📈 Post-Hackathon Potential

### Monetization Strategy
- **Freemium**: Basic features free, premium exports
- **B2B**: Wellness apps, therapy platforms
- **Education**: Music theory teaching tool

### Scale Opportunities
- Mobile app development
- VR/AR experiences
- Multi-user jam sessions
- AI-generated lyrics
- Biometric integration

### Technical Improvements
- WebGPU for better performance
- Edge computing for lower latency
- Advanced music theory integration
- Professional audio export (DAW formats)

---

## ✅ Definition of Done

### MVP Success Criteria
- [ ] Voice input creates music in real-time
- [ ] 4 distinct emotional states detected
- [ ] Visual response synchronized with audio
- [ ] No crashes during 5-minute demo
- [ ] Gemini API integrated for visuals
- [ ] Recording and playback functional

### Demo Success Criteria
- [ ] 30-second impressive demonstration
- [ ] Clear value proposition communicated
- [ ] Technical sophistication evident
- [ ] Judge questions answered confidently
- [ ] Backup demo video ready

---

## 🎯 Final Notes

**Remember**: This is a hackathon - prioritize working demo over perfect code. Focus on the emotional impact and user experience. The judges want to see innovative use of Gemini, so ensure that integration is prominent in the demo.

**Key Message**: "Vibe-Synth transforms anyone into a musician, using only their voice and emotions. It's not just an app - it's a new form of human expression."