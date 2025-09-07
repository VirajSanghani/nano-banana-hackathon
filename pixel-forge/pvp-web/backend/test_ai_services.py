#!/usr/bin/env python3
"""
Test script to verify all AI services are working properly
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(__file__))

from ultimate_server import UltimateWeaponGenerator

async def test_ai_services():
    """Test all three AI services"""
    print("🧪 Testing Pixel-Forge AI Services Integration")
    print("=" * 50)
    
    # Initialize the weapon generator
    print("🔧 Initializing AI systems...")
    generator = UltimateWeaponGenerator()
    
    # Test Gemini AI weapon generation
    print("\n🧠 Testing Gemini AI weapon generation...")
    try:
        weapon = await generator._generate_weapon_with_gemini("ice crystal sword")
        print(f"✅ Gemini AI: Generated '{weapon.get('name', 'Unknown')}' weapon")
        print(f"   Type: {weapon.get('weapon_type', 'Unknown')}")
        print(f"   Element: {weapon.get('element', 'Unknown')}")
        print(f"   Damage: {weapon.get('damage', 0)}")
    except Exception as e:
        print(f"❌ Gemini AI Error: {e}")
    
    # Test Fal AI sprite generation  
    print("\n🎨 Testing Fal AI sprite generation...")
    try:
        sprite_url = await generator._generate_weapon_sprite("ice crystal sword")
        if sprite_url and sprite_url.startswith('http'):
            print(f"✅ Fal AI: Generated sprite URL: {sprite_url[:50]}...")
        else:
            print("⚠️  Fal AI: Using fallback sprite (balance exhausted)")
    except Exception as e:
        print(f"❌ Fal AI Error: {e}")
    
    # Test ElevenLabs voice generation
    print("\n🎤 Testing ElevenLabs voice generation...")
    try:
        weapon_data = {"name": "Ice Crystal Sword", "rarity": "legendary", "element": "ice", "weapon_type": "sword"}
        audio_data = await generator._create_voice_narration(weapon_data)
        if audio_data:
            print(f"✅ ElevenLabs: Generated voice narration ({len(audio_data)} bytes)")
        else:
            print("⚠️  ElevenLabs: Voice generation returned empty")
    except Exception as e:
        print(f"❌ ElevenLabs Error: {e}")
    
    print("\n🎮 AI Services Test Complete!")
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(test_ai_services())