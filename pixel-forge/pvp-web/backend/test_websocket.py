#!/usr/bin/env python3
"""
Test WebSocket weapon generation functionality
"""
import asyncio
import websockets
import json
import sys

async def test_websocket():
    """Test WebSocket connection and weapon generation"""
    try:
        print("🔌 Connecting to WebSocket server...")
        
        # Connect to the WebSocket server
        uri = "ws://localhost:6000/ws/test_player_123"
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to Pixel-Forge PvP Server!")
            
            # Send weapon generation request
            weapon_request = {
                "type": "WEAPON_GENERATE",
                "data": {
                    "prompt": "fire sword of ultimate destruction"
                },
                "timestamp": 1694000000000,
                "player_id": "test_player_123"
            }
            
            print("🗡️  Requesting weapon generation...")
            await websocket.send(json.dumps(weapon_request))
            
            # Wait for response
            print("⏳ Waiting for AI weapon generation...")
            
            # Listen for messages for a few seconds
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    message = json.loads(response)
                    
                    print(f"📨 Received: {message.get('type', 'UNKNOWN')}")
                    
                    if message.get('type') == 'WEAPON_GENERATED':
                        weapon_data = message.get('data', {})
                        if weapon_data.get('success'):
                            weapon = weapon_data.get('weapon', {})
                            print(f"🎉 SUCCESS! Generated weapon: {weapon.get('name', 'Unknown')}")
                            print(f"   Type: {weapon.get('weapon_type', 'Unknown')}")
                            print(f"   Element: {weapon.get('element', 'Unknown')}")
                            print(f"   Damage: {weapon.get('damage', 0)}")
                            print(f"   Rarity: {weapon.get('rarity', 'Unknown')}")
                            break
                        else:
                            print(f"❌ Weapon generation failed: {weapon_data.get('error', 'Unknown error')}")
                            break
                    
            except asyncio.TimeoutError:
                print("⏰ Timeout waiting for weapon generation")
                
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🎮 Testing Pixel-Forge PvP WebSocket Functionality")
    print("=" * 55)
    
    success = asyncio.run(test_websocket())
    
    print("=" * 55)
    if success:
        print("🎯 WebSocket test completed!")
    else:
        print("💥 WebSocket test failed!")
        sys.exit(1)