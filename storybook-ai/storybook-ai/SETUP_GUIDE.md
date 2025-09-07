# 🎪 Magical Storybook AI - Setup Guide

## 🚀 Your app is running at:
- **Main App**: http://localhost:3001
- **Development**: http://localhost:3000 (if available)

## 📋 Quick Setup Steps:

### 1. Set up API Keys (Optional but Recommended)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env file and add your API keys:
```

**Get your API keys from:**
- **Gemini AI**: https://ai.google.dev/ (for image generation)
- **ElevenLabs**: https://elevenlabs.io/ (for voice narration) 
- **Fal AI**: https://fal.ai/ (for background music)

### 2. Demo Mode (No API Keys Needed)
The app works in demo mode without API keys! Just visit http://localhost:3001 and start creating stories.

## 🎭 Features to Test:

### ✨ Voice Commands (Say these out loud):
- **"Next page"** - Navigate forward
- **"Go back"** - Navigate backward  
- **"Read again"** - Repeat narration
- **"Abracadabra"** - Cast magic spell!
- **"Please"** - Politeness magic
- **"Thank you"** - Gratitude magic

### 🎮 Interactive Elements:
- **Shake Device** - Activate magical effects
- **Blow into Microphone** - Create wind magic
- **Tap Images** - Discover hidden hotspots
- **Voice Recognition** - Natural language interaction

### 🎨 Story Creation:
1. Visit http://localhost:3001
2. Click "Create New Story"
3. Enter a story prompt (e.g., "A brave fox goes on an adventure")
4. Watch the magic happen!

## 🛠️ Development Commands:
```bash
# Install dependencies (if needed)
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 🎯 Testing Checklist:
- [ ] App loads at http://localhost:3001
- [ ] Can create new story with text prompt
- [ ] Voice commands work (test with "next page")
- [ ] Can navigate through story pages
- [ ] Images load (demo placeholders if no API keys)
- [ ] Voice narration works (text-to-speech if no API keys)

## 🔧 Troubleshooting:
- If voice doesn't work: Check browser permissions for microphone
- If images don't load: This is normal in demo mode without API keys
- If app won't start: Try `npm install` then `npm start`

## 🌟 Ready to Test!
Your magical storybook is ready! Visit http://localhost:3001 and start creating enchanting stories for children.