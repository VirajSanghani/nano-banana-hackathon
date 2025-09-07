#!/usr/bin/env python3
"""
Test weapon generation through WebSocket
"""
import asyncio
import websockets
import json
import sys

async def test_weapon_generation():
    """Test weapon generation functionality"""
    try:
        print("🔌 Connecting for weapon generation test...")
        
        # Connect to the WebSocket server
        uri = "ws://localhost:6000/ws/weapon_test_789"
        async with websockets.connect(uri) as websocket:
            print("✅ Connected!")
            
            # Wait for welcome
            welcome_response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            print(f"📨 {json.loads(welcome_response).get('type', 'UNKNOWN')}")
            
            # Send weapon generation request
            weapon_request = {
                "type": "weapon_generate",
                "data": {
                    "prompt": "ice crystal sword of frozen death"
                },
                "timestamp": 1694000000000,
                "player_id": "weapon_test_789"
            }
            
            print("⚔️  Requesting weapon generation...")
            await websocket.send(json.dumps(weapon_request))
            
            # Wait for weapon response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=15.0)
                message = json.loads(response)
                
                msg_type = message.get('type', 'UNKNOWN')
                print(f"📨 Received: {msg_type}")
                
                if msg_type == 'weapon_generated':
                    data = message.get('data', {})
                    if data.get('success'):
                        weapon = data.get('weapon', {})
                        print("🎉 WEAPON GENERATED SUCCESSFULLY!")
                        print(f"   Name: {weapon.get('name', 'Unknown')}")
                        print(f"   Type: {weapon.get('weapon_type', 'Unknown')}")
                        print(f"   Element: {weapon.get('element', 'Unknown')}")
                        print(f"   Damage: {weapon.get('damage', 0)}")
                        print(f"   Rarity: {weapon.get('rarity', 'Unknown')}")
                        return True
                    else:
                        print(f"❌ Weapon generation failed: {data.get('error', 'Unknown')}")
                        return False
                        
            except asyncio.TimeoutError:
                print("⏰ Timeout waiting for weapon generation")
                return False
                    
    except Exception as e:
        print(f"❌ Weapon generation test failed: {e}")
        return False

if __name__ == "__main__":
    print("🗡️  Testing Pixel-Forge Weapon Generation")
    print("=" * 50)
    
    success = asyncio.run(test_weapon_generation())
    
    print("=" * 50)
    if success:
        print("🎯 Weapon generation working!")
    else:
        print("💥 Weapon generation failed!")
        sys.exit(1)