import os
from typing import Optional

from dotenv import load_dotenv

try:
    from elevenlabs.client import ElevenLabs
except Exception:
    ElevenLabs = None  # type: ignore


load_dotenv()


def _get_client():
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        raise RuntimeError("Missing ELEVENLABS_API_KEY. Set it in your .env file.")
    if ElevenLabs is None:
        raise RuntimeError("elevenlabs package not installed")
    return ElevenLabs(api_key=api_key)


def tts_to_bytes(text: str, voice_id: str = "JBFqnCBsd6RMkjVDRZzb", model_id: str = "eleven_flash_v2_5") -> Optional[bytes]:
    """Generate speech audio bytes (mp3) from text."""
    client = _get_client()
    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
        output_format="mp3_44100_128",
    )
    # SDK may return a generator or bytes; normalize to bytes
    if hasattr(audio, "read"):
        return audio.read()
    if isinstance(audio, (bytes, bytearray)):
        return bytes(audio)
    # Fall back: try to join iterable chunks
    try:
        return b"".join(audio)
    except Exception:  # pragma: no cover
        return None

