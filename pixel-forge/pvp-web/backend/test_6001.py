#!/usr/bin/env python3
"""Test WebSocket connection to port 6001"""
import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://localhost:6001/ws/test_client_123"
    print(f"Connecting to {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Wait for welcome message
            message = await websocket.recv()
            print(f"Received: {message}")
            
            # Send find_match request
            request = {
                "type": "find_match",
                "data": {"player_name": "TestPlayer"},
                "timestamp": 123456789
            }
            await websocket.send(json.dumps(request))
            print(f"Sent: {request}")
            
            # Receive responses
            for _ in range(3):
                message = await websocket.recv()
                print(f"Received: {message}")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())