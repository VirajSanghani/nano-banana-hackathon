import io
import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from src.gemini.client import generate_image, edit_image
from src.elevenlabs.client import tts_to_bytes
from src.fal.client import flux_schnell


load_dotenv()

app = FastAPI(title="Nano Banana Starter API")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/gemini/generate-image")
def api_gemini_generate_image(prompt: str = Form(...)):
    img = generate_image(prompt)
    if img is None:
        raise HTTPException(502, "Gemini did not return an image")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@app.post("/gemini/edit-image")
async def api_gemini_edit_image(edit_prompt: str = Form(...), image: UploadFile = File(...)):
    # Save uploaded image to temp path for PIL
    data = await image.read()
    tmp_path = "_upload_input.png"
    with open(tmp_path, "wb") as f:
        f.write(data)
    try:
        img = edit_image(tmp_path, edit_prompt)
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass
    if img is None:
        raise HTTPException(502, "Gemini edit did not return an image")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@app.post("/audio/tts")
def api_tts(text: str = Form(...), voice_id: Optional[str] = Form(None)):
    audio = tts_to_bytes(text, voice_id=voice_id or "JBFqnCBsd6RMkjVDRZzb")
    if not audio:
        raise HTTPException(502, "TTS failed")
    return StreamingResponse(io.BytesIO(audio), media_type="audio/mpeg")


@app.post("/fal/flux")
def api_flux(prompt: str = Form(...)):
    result = flux_schnell(prompt)
    return JSONResponse(result)


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.server:app", host=host, port=port, reload=True)

