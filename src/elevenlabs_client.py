"""
ElevenLabs Audio Client
Complete wrapper for voice synthesis and audio generation
"""

import os
import asyncio
from typing import Optional, List, Dict, Any
from elevenlabs.client import ElevenLabs, AsyncElevenLabs
from elevenlabs import play, stream, save
from dotenv import load_dotenv

load_dotenv()

class ElevenLabsAudioClient:
    """Client for ElevenLabs audio generation and voice synthesis"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize ElevenLabs client with API key"""
        self.api_key = api_key or os.getenv('ELEVENLABS_API_KEY')
        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY not found in environment variables")
        
        self.client = ElevenLabs(api_key=self.api_key)
        self.async_client = AsyncElevenLabs(api_key=self.api_key)
        
        # Default voice IDs (you can get more from the API)
        self.default_voices = {
            "male": "JBFqnCBsd6RMkjVDRZzb",  # George
            "female": "EXAVITQu4vr4xnSDxMaL",  # Bella
            "narrator": "pNInz6obpgDQGcFmaJgB"  # Adam
        }
        
        # Model options
        self.models = {
            "fast": "eleven_flash_v2_5",  # Ultra-low latency
            "quality": "eleven_multilingual_v2",  # High quality
            "turbo": "eleven_turbo_v2_5"  # Balance of speed and quality
        }
    
    def list_voices(self) -> List[Dict[str, Any]]:
        """Get all available voices"""
        try:
            response = self.client.voices.search()
            voices = []
            for voice in response.voices:
                voices.append({
                    "voice_id": voice.voice_id,
                    "name": voice.name,
                    "description": voice.description,
                    "labels": voice.labels
                })
            return voices
        except Exception as e:
            print(f"Error listing voices: {e}")
            return []
    
    def text_to_speech(self, 
                      text: str,
                      voice: str = "male",
                      model: str = "fast",
                      save_path: Optional[str] = None,
                      play_audio: bool = False) -> bytes:
        """
        Convert text to speech
        
        Args:
            text: Text to convert to speech
            voice: Voice preset or voice_id
            model: Model preset (fast/quality/turbo)
            save_path: Optional path to save audio file
            play_audio: Whether to play the audio immediately
            
        Returns:
            Audio bytes
        """
        try:
            # Get voice ID
            voice_id = self.default_voices.get(voice, voice)
            model_id = self.models.get(model, model)
            
            audio = self.client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=model_id,
                output_format="mp3_44100_128"
            )
            
            if save_path:
                save(audio, save_path)
                print(f"Audio saved to {save_path}")
            
            if play_audio:
                play(audio)
            
            return audio
            
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            return b""
    
    def stream_speech(self, 
                     text: str,
                     voice: str = "male",
                     model: str = "fast") -> None:
        """
        Stream audio in real-time as it's generated
        
        Args:
            text: Text to stream as speech
            voice: Voice preset or voice_id
            model: Model preset (fast/quality/turbo)
        """
        try:
            voice_id = self.default_voices.get(voice, voice)
            model_id = self.models.get(model, model)
            
            audio_stream = self.client.text_to_speech.stream(
                text=text,
                voice_id=voice_id,
                model_id=model_id
            )
            
            stream(audio_stream)
            
        except Exception as e:
            print(f"Error streaming speech: {e}")
    
    async def async_text_to_speech(self, 
                                  text: str,
                                  voice: str = "male",
                                  model: str = "fast") -> bytes:
        """
        Async version of text-to-speech
        
        Args:
            text: Text to convert to speech
            voice: Voice preset or voice_id
            model: Model preset (fast/quality/turbo)
            
        Returns:
            Audio bytes
        """
        try:
            voice_id = self.default_voices.get(voice, voice)
            model_id = self.models.get(model, model)
            
            audio = await self.async_client.text_to_speech.convert(
                text=text,
                voice_id=voice_id,
                model_id=model_id,
                output_format="mp3_44100_128"
            )
            
            return audio
            
        except Exception as e:
            print(f"Error in async text-to-speech: {e}")
            return b""
    
    def clone_voice(self, 
                   name: str,
                   audio_files: List[str],
                   description: Optional[str] = None) -> Optional[str]:
        """
        Clone a voice from audio samples
        
        Args:
            name: Name for the cloned voice
            audio_files: List of paths to audio files for cloning
            description: Optional description of the voice
            
        Returns:
            Voice ID of the cloned voice
        """
        try:
            voice = self.client.voices.ivc.create(
                name=name,
                description=description or f"Cloned voice: {name}",
                files=audio_files
            )
            
            print(f"Voice cloned successfully! Voice ID: {voice.voice_id}")
            return voice.voice_id
            
        except Exception as e:
            print(f"Error cloning voice: {e}")
            return None
    
    def generate_dialogue(self,
                         dialogue: List[Dict[str, str]],
                         save_dir: Optional[str] = None) -> List[bytes]:
        """
        Generate audio for a dialogue with multiple speakers
        
        Args:
            dialogue: List of dicts with 'speaker' and 'text' keys
            save_dir: Optional directory to save audio files
            
        Returns:
            List of audio bytes for each line
        """
        audio_files = []
        
        if save_dir:
            os.makedirs(save_dir, exist_ok=True)
        
        for i, line in enumerate(dialogue):
            speaker = line.get('speaker', 'narrator')
            text = line.get('text', '')
            
            # Map speaker to voice
            voice = self.default_voices.get(speaker, speaker)
            
            audio = self.text_to_speech(
                text=text,
                voice=voice,
                model="quality",
                save_path=f"{save_dir}/line_{i+1}_{speaker}.mp3" if save_dir else None
            )
            
            audio_files.append(audio)
            print(f"Generated line {i+1}/{len(dialogue)}: {speaker}")
        
        return audio_files
    
    def generate_story_narration(self,
                                story_parts: List[str],
                                voice: str = "narrator",
                                with_music: bool = False) -> List[bytes]:
        """
        Generate narration for a story with optional background music
        
        Args:
            story_parts: List of story segments
            voice: Voice to use for narration
            with_music: Whether to add background music (requires additional processing)
            
        Returns:
            List of audio bytes for each part
        """
        narration_parts = []
        
        for i, part in enumerate(story_parts):
            print(f"Generating narration for part {i+1}/{len(story_parts)}")
            
            audio = self.text_to_speech(
                text=part,
                voice=voice,
                model="quality",
                save_path=f"story_part_{i+1}.mp3"
            )
            
            narration_parts.append(audio)
        
        if with_music:
            print("Note: Background music requires additional audio processing libraries")
        
        return narration_parts


def main():
    """Example usage of the ElevenLabs Audio Client"""
    client = ElevenLabsAudioClient()
    
    # Example 1: Simple text-to-speech
    print("Generating simple speech...")
    client.text_to_speech(
        text="Welcome to the Nano Banana hackathon! Let's build something amazing.",
        voice="male",
        model="fast",
        save_path="welcome.mp3",
        play_audio=True
    )
    
    # Example 2: List available voices
    print("\nAvailable voices:")
    voices = client.list_voices()
    for voice in voices[:5]:  # Show first 5 voices
        print(f"- {voice['name']}: {voice['description'][:50]}...")
    
    # Example 3: Generate dialogue
    print("\nGenerating dialogue...")
    dialogue = [
        {"speaker": "male", "text": "Have you seen the new Gemini image model?"},
        {"speaker": "female", "text": "Yes! It's incredible for generating consistent characters."},
        {"speaker": "narrator", "text": "And so they began their hackathon journey."}
    ]
    
    client.generate_dialogue(dialogue, save_dir="dialogue_output")
    
    # Example 4: Stream speech (real-time)
    print("\nStreaming speech...")
    client.stream_speech(
        text="This audio is being generated and played in real-time using the Flash model!",
        voice="female",
        model="fast"
    )
    
    # Example 5: Async generation
    async def async_example():
        audio = await client.async_text_to_speech(
            text="This was generated asynchronously!",
            voice="narrator",
            model="turbo"
        )
        save(audio, "async_output.mp3")
        print("Async audio saved!")
    
    asyncio.run(async_example())


if __name__ == "__main__":
    main()