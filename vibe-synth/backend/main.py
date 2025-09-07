from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import socketio
import asyncio
import json
from typing import Dict, List
import logging

from services.emotion_analyzer import EmotionAnalyzer
from services.gemini_service import GeminiVisualGenerator
from models.session import Session, EmotionData
from config.settings import get_settings

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Vibe-Synth Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins=["http://localhost:3000"],
    async_mode='asgi'
)

# Combine FastAPI and Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# Global services
settings = get_settings()
emotion_analyzer = EmotionAnalyzer()
visual_generator = None  # Initialize only if API key is available

# Active sessions storage
active_sessions: Dict[str, Session] = {}

# Initialize Gemini service if API key is available
@app.on_event("startup")
async def startup_event():
    global visual_generator
    if settings.gemini_api_key:
        visual_generator = GeminiVisualGenerator(settings.gemini_api_key)
        logger.info("Gemini Visual Generator initialized")
    else:
        logger.warning("Gemini API key not found, visual generation disabled")

@app.get("/")
async def root():
    return {"message": "Vibe-Synth Backend is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "emotion_analyzer": "active",
            "gemini_service": "active" if visual_generator else "disabled"
        },
        "active_sessions": len(active_sessions)
    }

# Socket.IO Events
@sio.event
async def connect(sid, environ):
    logger.info(f"Client {sid} connected")
    await sio.emit('connected', {'message': 'Connected to Vibe-Synth backend'}, room=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"Client {sid} disconnected")
    # Clean up session if exists
    if sid in active_sessions:
        del active_sessions[sid]

@sio.event
async def analyze_text(sid, data):
    """Analyze text for emotion and send synthesis parameters"""
    try:
        text = data.get('text', '')
        if not text.strip():
            return
        
        logger.info(f"Analyzing text from {sid}: {text[:50]}...")
        
        # Analyze emotion
        emotion_data = emotion_analyzer.analyze_text(text)
        
        # Store in session
        if sid not in active_sessions:
            active_sessions[sid] = Session(session_id=sid)
        
        active_sessions[sid].add_emotion(
            EmotionData(
                emotion=emotion_data['emotion'],
                confidence=emotion_data['confidence'],
                text=text
            )
        )
        
        # Send emotion update to client
        await sio.emit('emotion_update', {
            'emotion': emotion_data['emotion'],
            'confidence': emotion_data['confidence'],
            'parameters': emotion_data['parameters']
        }, room=sid)
        
        # Generate visual if Gemini is available and confidence is high
        if visual_generator and emotion_data['confidence'] > 0.7:
            asyncio.create_task(
                generate_visual_async(sid, emotion_data['emotion'], text)
            )
            
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        await sio.emit('error', {'message': 'Failed to analyze text'}, room=sid)

@sio.event
async def audio_data(sid, data):
    """Handle real-time audio data"""
    try:
        # Extract audio metrics from client
        pitch = data.get('pitch', 0)
        volume = data.get('volume', 0)
        
        # Store in session
        if sid not in active_sessions:
            active_sessions[sid] = Session(session_id=sid)
        
        active_sessions[sid].add_audio_data(pitch, volume)
        
        # Send synthesis update (if needed)
        await sio.emit('synthesis_update', {
            'pitch': pitch,
            'volume': volume
        }, room=sid)
        
    except Exception as e:
        logger.error(f"Error processing audio data: {e}")

@sio.event
async def request_visual_generation(sid, data):
    """Manual visual generation request"""
    try:
        emotion = data.get('emotion', 'calm')
        text = data.get('text', '')
        
        if visual_generator:
            await generate_visual_async(sid, emotion, text)
        else:
            await sio.emit('error', {
                'message': 'Visual generation not available'
            }, room=sid)
            
    except Exception as e:
        logger.error(f"Error in visual generation request: {e}")

async def generate_visual_async(sid: str, emotion: str, text: str):
    """Generate visual description asynchronously"""
    try:
        if not visual_generator:
            return
            
        visual_params = await visual_generator.generate_mood_board(emotion, text)
        
        await sio.emit('visual_update', {
            'emotion': emotion,
            'visual_params': visual_params
        }, room=sid)
        
        logger.info(f"Visual generated for {sid}: {emotion}")
        
    except Exception as e:
        logger.error(f"Error generating visual: {e}")

@app.get("/sessions")
async def get_sessions():
    """Get active sessions info"""
    return {
        "active_sessions": len(active_sessions),
        "sessions": [
            {
                "session_id": session.session_id,
                "duration": len(session.emotion_history),
                "last_emotion": session.emotion_history[-1].emotion if session.emotion_history else None
            }
            for session in active_sessions.values()
        ]
    }

@app.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get specific session data"""
    if session_id not in active_sessions:
        return {"error": "Session not found"}
    
    session = active_sessions[session_id]
    return {
        "session_id": session.session_id,
        "created_at": session.created_at,
        "emotion_history": [
            {
                "emotion": e.emotion,
                "confidence": e.confidence,
                "timestamp": e.timestamp,
                "text": e.text
            }
            for e in session.emotion_history
        ]
    }

# For development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)