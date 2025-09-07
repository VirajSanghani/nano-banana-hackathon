# Vibe-Synth Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Quick Setup

1. **Clone and Navigate**
   ```bash
   cd vibe-synth
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (see API_KEYS_SETUP.md)
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   cd ..
   
   # Frontend
   cd frontend
   npm install
   cd ..
   ```

4. **Start Services**
   
   **Terminal 1 - Backend:**
   ```bash
   cd backend
   python main.py
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open Browser**
   - Navigate to `http://localhost:3000`
   - Allow microphone permissions
   - Click record and start speaking!

### Docker Alternative
```bash
# Setup environment
cp .env.example .env
# Edit .env with your API keys

# Start everything
docker-compose up
```

## 🎯 Testing the Demo

### Quick Test Phrases
Try these to see different emotions:

**Joy:**
- "I'm so happy and excited today! This is amazing!"
- "I love this beautiful sunny day!"

**Sadness:**
- "I feel lonely and sad today"
- "This is heartbreaking and painful"

**Energy:**
- "Let's go! I'm pumped and ready to rock!"
- "This is intense and powerful!"

**Calm:**
- "I feel peaceful and serene right now"
- "Everything is tranquil and balanced"

### Expected Behavior
1. **Voice Input** → Real-time pitch/volume detection
2. **Speech Recognition** → Text analysis for emotion
3. **Emotion Display** → Visual feedback with confidence
4. **Audio Synthesis** → Music generated based on emotion
5. **Particle Visuals** → 3D visualization responds to audio

## 🔧 Troubleshooting

### Common Issues

**Microphone Not Working:**
- Check browser permissions
- Try Chrome/Firefox (Safari may have issues)
- Use HTTPS in production

**Backend Connection Fails:**
- Check if backend is running on port 8000
- Verify CORS settings in main.py
- Check firewall/antivirus blocking

**No Audio Output:**
- Click anywhere to start audio context
- Check browser audio settings
- Verify Tone.js initialization

**Emotion Detection Not Working:**
- Check backend logs for errors
- Verify speech recognition is working
- Try speaking more clearly/loudly

### Performance Tips
- Close other browser tabs
- Use headphones to prevent feedback
- Reduce particle count if visuals lag
- Check browser DevTools for errors

## 🎮 Demo Script (For Hackathon)

### 30-Second Demo
1. **Introduction (5s)**
   "This is Vibe-Synth - it turns your voice into music and art"

2. **Joy Demo (8s)**
   "I'm so happy and excited!"
   *Show bright particles and uplifting music*

3. **Sadness Transition (8s)**
   "But sometimes I feel sad and lonely"
   *Show color change and melancholic tones*

4. **Energy Finale (9s)**
   "But now I'm pumped and ready to rock!"
   *Show explosive particles and energetic music*

### Longer Demo (2 Minutes)
1. Show emotion detection accuracy
2. Demonstrate real-time synthesis
3. Explain Gemini integration for visuals
4. Show recording/playback feature
5. Discuss applications and potential

## 🔑 API Keys Required

**Essential:**
- **Gemini API Key** - For visual generation (get from Google AI Studio)

**Optional:**
- **ElevenLabs** - For enhanced voice synthesis
- **Fal AI** - For additional visual models

See `API_KEYS_SETUP.md` for detailed instructions.

## 📊 Architecture Overview

```
Browser (Frontend)
├── Audio Capture (Web Audio API)
├── Speech Recognition (Web Speech API)
├── Music Synthesis (Tone.js)
└── 3D Visuals (Three.js)
    │
    ├── WebSocket ──→ FastAPI Backend
    │                 ├── Emotion Analysis (TextBlob)
    │                 ├── Gemini Visual Generation
    │                 └── Session Management
    │
    └── REST API ────→ External Services
```

## 🎯 Next Steps

After getting it running:
1. Test with different voices/accents
2. Experiment with different emotions
3. Try the recording feature
4. Adjust visual settings
5. Explore the code structure
6. Add your own enhancements!

## 🆘 Need Help?

1. Check browser DevTools console
2. Check backend terminal logs
3. Verify all dependencies installed
4. Test individual components
5. Review the full documentation in `IMPLEMENTATION_PLAN.md`

---

**Remember:** This is a hackathon project - expect some rough edges but enjoy the creativity! 🎨🎵