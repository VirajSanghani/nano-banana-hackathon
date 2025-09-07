#!/bin/bash

# 🎪 Magical Storybook AI - API Key Setup Script

echo "🎭 Setting up your Magical Storybook AI..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file"
else
    echo "📋 Found existing .env file"
fi

echo ""
echo "🔑 To add your API keys, edit the .env file:"
echo "   nano .env"
echo "   # or use your favorite editor"
echo ""
echo "🌐 Get your API keys from:"
echo "   • Gemini AI: https://ai.google.dev/"
echo "   • ElevenLabs: https://elevenlabs.io/"
echo "   • Fal AI: https://fal.ai/"
echo ""
echo "🚀 Your app is running at:"
echo "   • http://localhost:4000"
echo ""
echo "✨ The app works in demo mode even without API keys!"
echo "   Just visit the URL above and start creating magical stories!"
echo ""
echo "🎤 Voice Commands to try:"
echo "   • Say 'next page' to navigate"
echo "   • Say 'abracadabra' for magic!"
echo "   • Say 'read again' to repeat"
echo ""
echo "Happy storytelling! 📖✨"