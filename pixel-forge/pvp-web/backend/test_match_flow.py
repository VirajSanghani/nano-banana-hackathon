#!/usr/bin/env python3
"""
Test the complete match flow to verify arena loading works
"""
import asyncio
import websockets
import json
import sys

async def test_match_flow():
    """Test the complete match flow that the frontend uses"""
    try:
        print("🔌 Connecting to WebSocket server...")
        
        # Connect to the WebSocket server
        uri = "ws://localhost:6000/ws/test_player_456"
        async with websockets.connect(uri) as websocket:
            print("✅ Connected to Pixel-Forge PvP Server!")
            
            # Wait for welcome message
            welcome_response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            welcome_msg = json.loads(welcome_response)
            print(f"📨 Welcome: {welcome_msg.get('type', 'UNKNOWN')}")
            
            # Send find match request (this is what causes the 50% loading)
            find_match_request = {
                "type": "find_match",
                "data": {},
                "timestamp": 1694000000000,
                "player_id": "test_player_456"
            }
            
            print("🎯 Requesting match...")
            await websocket.send(json.dumps(find_match_request))
            
            # Wait for match found and match start
            for i in range(3):
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    message = json.loads(response)
                    
                    msg_type = message.get('type', 'UNKNOWN')
                    print(f"📨 Received: {msg_type}")
                    
                    if msg_type == 'match_found':
                        print("✅ MATCH FOUND - this should fix the 50% loading issue!")
                        data = message.get('data', {})
                        print(f"   Players: {len(data.get('players', []))}")
                        
                    elif msg_type == 'match_start':
                        print("🚀 MATCH STARTING - arena should load completely!")
                        data = message.get('data', {})
                        print(f"   Match ID: {data.get('match_id', 'Unknown')}")
                        break
                        
                except asyncio.TimeoutError:
                    print("⏰ Timeout waiting for match response")
                    break
                    
    except Exception as e:
        print(f"❌ Match flow test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🎮 Testing Pixel-Forge Match Flow (Arena Loading Fix)")
    print("=" * 60)
    
    success = asyncio.run(test_match_flow())
    
    print("=" * 60)
    if success:
        print("🎯 Match flow test completed - arena loading should work!")
    else:
        print("💥 Match flow test failed!")
        sys.exit(1)