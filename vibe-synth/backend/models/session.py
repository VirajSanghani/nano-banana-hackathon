from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum

class EmotionType(str, Enum):
    JOY = "joy"
    SADNESS = "sadness"
    ENERGY = "energy"
    CALM = "calm"

class EmotionData(BaseModel):
    emotion: EmotionType
    confidence: float
    text: Optional[str] = None
    timestamp: datetime = datetime.now()

class AudioData(BaseModel):
    pitch: float
    volume: float
    timestamp: datetime = datetime.now()

class VisualParameters(BaseModel):
    primary_color: List[float]
    particle_behavior: str
    intensity: float
    description: Optional[str] = None

class Session(BaseModel):
    session_id: str
    created_at: datetime = datetime.now()
    emotion_history: List[EmotionData] = []
    audio_history: List[AudioData] = []
    visual_generations: List[VisualParameters] = []
    
    def add_emotion(self, emotion_data: EmotionData):
        self.emotion_history.append(emotion_data)
        # Keep only last 50 emotions
        if len(self.emotion_history) > 50:
            self.emotion_history = self.emotion_history[-50:]
    
    def add_audio_data(self, pitch: float, volume: float):
        self.audio_history.append(AudioData(pitch=pitch, volume=volume))
        # Keep only last 100 audio data points
        if len(self.audio_history) > 100:
            self.audio_history = self.audio_history[-100:]
    
    def add_visual(self, visual_params: VisualParameters):
        self.visual_generations.append(visual_params)
        # Keep only last 10 visual generations
        if len(self.visual_generations) > 10:
            self.visual_generations = self.visual_generations[-10:]
    
    def get_current_emotion(self) -> Optional[EmotionData]:
        return self.emotion_history[-1] if self.emotion_history else None
    
    def get_emotion_trend(self, count: int = 5) -> List[EmotionData]:
        return self.emotion_history[-count:] if self.emotion_history else []

class SynthesisParameters(BaseModel):
    scale: List[str]
    tempo: int
    brightness: float
    reverb: float
    filter_frequency: float
    delay: float