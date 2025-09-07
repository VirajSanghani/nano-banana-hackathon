"""
Simple working WebSocket server for testing
"""
import asyncio
import json
import logging
from typing import Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for everything
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
active_connections: Set[WebSocket] = set()

@app.get("/")
async def root():
    return {"message": "WebSocket server running on port 7000"}

@app.get("/test")
async def test_page():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>WebSocket Test</title>
    </head>
    <body>
        <h1>WebSocket Test Page</h1>
        <button onclick="connect()">Connect</button>
        <button onclick="send()">Send Message</button>
        <div id="messages"></div>
        <script>
            let ws;
            function connect() {
                ws = new WebSocket('ws://localhost:7000/ws/test123');
                ws.onopen = () => {
                    document.getElementById('messages').innerHTML += '<p>Connected!</p>';
                };
                ws.onmessage = (event) => {
                    document.getElementById('messages').innerHTML += '<p>Received: ' + event.data + '</p>';
                };
                ws.onerror = (error) => {
                    document.getElementById('messages').innerHTML += '<p>Error: ' + error + '</p>';
                };
                ws.onclose = () => {
                    document.getElementById('messages').innerHTML += '<p>Disconnected</p>';
                };
            }
            function send() {
                if (ws) {
                    ws.send(JSON.stringify({type: 'test', data: 'Hello!'}));
                }
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections.add(websocket)
    logger.info(f"Client {client_id} connected")
    
    try:
        # Send welcome message
        logger.info(f"Sending welcome to {client_id}")
        await websocket.send_json({
            "type": "player_connect",
            "data": {"message": f"Welcome {client_id}!"},
            "timestamp": 1234567890
        })
        logger.info(f"Welcome sent to {client_id}")
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            logger.info(f"Received from {client_id}: {data}")
            
            # Parse and handle message
            try:
                message = json.loads(data)
                
                if message.get("type") == "find_match":
                    # Send match found response
                    logger.info(f"Sending match_found to {client_id}")
                    await websocket.send_json({
                        "type": "match_found",
                        "data": {"match_id": "match123", "players": 2},
                        "timestamp": 1234567890
                    })
                    
                    # Send match start after a delay
                    await asyncio.sleep(1)
                    logger.info(f"Sending match_start to {client_id}")
                    await websocket.send_json({
                        "type": "match_start",
                        "data": {"arena": "desert", "mode": "deathmatch"},
                        "timestamp": 1234567890
                    })
                else:
                    # Echo back
                    await websocket.send_json({
                        "type": "echo",
                        "data": message,
                        "timestamp": 1234567890
                    })
                    
            except json.JSONDecodeError:
                await websocket.send_text(f"Echo: {data}")
            except Exception as e:
                logger.error(f"Error handling message from {client_id}: {e}")
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected normally")
        active_connections.remove(websocket)
    except Exception as e:
        logger.error(f"Unexpected error for {client_id}: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=6001)