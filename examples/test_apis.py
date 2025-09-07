import os
from dotenv import load_dotenv

from src.gemini.client import generate_image
from src.elevenlabs.client import tts_to_bytes
from src.fal.client import flux_schnell


def main():
    load_dotenv()

    print("Checking env vars...")
    missing = [
        name for name in ["GEMINI_API_KEY", "ELEVENLABS_API_KEY", "FAL_KEY"] if not os.getenv(name)
    ]
    if missing:
        print("Missing:", ", ".join(missing))
        print("Fill .env (copy from .env.example) before running live tests.")
        return

    print("Testing Gemini image generation...")
    img = generate_image("A friendly banana astronaut exploring a nano galaxy, 1024x1024")
    print("Gemini image:", "OK" if img else "FAILED")
    if img:
        os.makedirs("outputs", exist_ok=True)
        img.save("outputs/gemini_sample.png")
        print("Saved outputs/gemini_sample.png")

    print("Testing ElevenLabs TTS...")
    audio = tts_to_bytes("Nano Banana says hello from the hackathon!")
    print("ElevenLabs TTS:", "OK" if audio else "FAILED")
    if audio:
        os.makedirs("outputs", exist_ok=True)
        with open("outputs/tts_sample.mp3", "wb") as f:
            f.write(audio)
        print("Saved outputs/tts_sample.mp3")

    print("Testing Fal FLUX schnell...")
    res = flux_schnell("A cinematic nano-banana in a lab")
    ok = bool(res)
    print("Fal result:", "OK" if ok else "FAILED")
    if ok:
        os.makedirs("outputs", exist_ok=True)
        # The result often contains images in 'images' or 'output' keys; just dump JSON
        import json

        with open("outputs/fal_result.json", "w") as f:
            json.dump(res, f, indent=2)
        print("Saved outputs/fal_result.json")


if __name__ == "__main__":
    main()

