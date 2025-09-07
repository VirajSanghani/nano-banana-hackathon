# Nano Banana Hackathon Starter

Minimal starter to wire up API keys and run a local API for:
- Gemini 2.5 Flash Image (aka Nano Banana)
- ElevenLabs TTS
- Fal AI FLUX models

Use this to validate keys fast, generate outputs, and back your demo UI.

## 1) Setup

1. Create a virtualenv and install deps
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Add your API keys
```
cp .env.example .env
# Edit .env and fill:
# GEMINI_API_KEY=...
# ELEVENLABS_API_KEY=...
# FAL_KEY=...
```

## 2) Quick test

Run basic checks and save sample outputs in `outputs/`:
```
python examples/test_apis.py
```

Expected artifacts if keys are valid:
- `outputs/gemini_sample.png`
- `outputs/tts_sample.mp3`
- `outputs/fal_result.json`

## 3) Run local API server

Start FastAPI (Gemini, ElevenLabs, Fal endpoints):
```
python app/server.py
# or
uvicorn app.server:app --reload --host 127.0.0.1 --port 8000
```

Endpoints:
- `POST /gemini/generate-image` (form: `prompt`)
- `POST /gemini/edit-image` (form: `edit_prompt`, file: `image`)
- `POST /audio/tts` (form: `text`, optional: `voice_id`)
- `POST /fal/flux` (form: `prompt`)

## Notes
- Be mindful of model costs and rate limits during dev.
- For live demos, cache representative outputs and add graceful error handling.
- See `HACKATHON_RESOURCES.md` for strategy and deeper integration tips.
