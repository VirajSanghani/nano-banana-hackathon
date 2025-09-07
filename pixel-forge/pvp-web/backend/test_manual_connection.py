#!/usr/bin/env python3
"""
Test WebSocket connection manually
"""
import asyncio
import websockets
import json

async def test_connection():
    """Test basic WebSocket connection"""
    try:
        # Connect to the WebSocket server
        uri = "ws://localhost:6000/ws/manual_test_123"
        print(f"🔌 Connecting to: {uri}")
        
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Wait for welcome message
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            message = json.loads(response)
            print(f"📨 Received: {message.get('type')}")
            
            # Send find_match message
            find_match_msg = {
                "type": "find_match",
                "data": {
                    "player_name": "ManualTestPlayer",
                    "preferences": {}
                },
                "timestamp": 1694000000000,
                "player_id": "manual_test_123"
            }
            
            print("🎮 Sending find_match...")
            await websocket.send(json.dumps(find_match_msg))
            
            # Wait for response
            response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            message = json.loads(response)
            print(f"📨 Received: {message.get('type')}")
            
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing WebSocket Connection")
    print("=" * 50)
    
    success = asyncio.run(test_connection())
    
    print("=" * 50)
    if success:
        print("✅ Connection test PASSED")
    else:
        print("❌ Connection test FAILED")