from pydantic import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # API Keys
    gemini_api_key: Optional[str] = os.getenv("GEMINI_API_KEY")
    elevenlabs_api_key: Optional[str] = os.getenv("ELEVENLABS_API_KEY")
    fal_api_key: Optional[str] = os.getenv("FAL_API_KEY")
    
    # Redis Configuration
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Server Configuration
    host: str = os.getenv("HOST", "0.0.0.0")
    port: int = int(os.getenv("PORT", "8000"))
    
    # Emotion Analysis Settings
    sentiment_threshold: float = 0.3
    emotion_confidence_threshold: float = 0.5
    
    # Visual Generation Settings
    visual_generation_interval: int = 5  # seconds
    max_visual_requests_per_minute: int = 10
    
    # Audio Settings
    audio_sample_rate: int = 44100
    audio_buffer_size: int = 1024
    
    # CORS Settings
    allowed_origins: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    return Settings()