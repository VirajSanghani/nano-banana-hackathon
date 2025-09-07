import os
from io import BytesIO
from typing import Optional, List

from PIL import Image
from dotenv import load_dotenv

try:
    # google-genai official client
    from google import genai
    from google.genai import types as genai_types  # type: ignore
except Exception as e:  # pragma: no cover
    genai = None
    genai_types = None


load_dotenv()


def _get_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY. Set it in your .env file.")
    return genai.Client(api_key=api_key)


def _extract_image_bytes(candidate) -> List[bytes]:
    parts = getattr(candidate, "content", None)
    if parts is None:
        return []
    out: List[bytes] = []
    for part in parts.parts:
        inline_data = getattr(part, "inline_data", None)
        if inline_data and getattr(inline_data, "data", None):
            out.append(inline_data.data)
    return out


def generate_image(prompt: str) -> Optional[Image.Image]:
    """Text-to-image with Gemini 2.5 Flash Image preview.

    Returns a PIL.Image or None if generation failed.
    """
    if genai is None:
        raise RuntimeError("google-genai is not installed")

    client = _get_client()
    resp = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=prompt,
    )
    if not resp or not resp.candidates:
        return None
    images = _extract_image_bytes(resp.candidates[0])
    if not images:
        return None
    return Image.open(BytesIO(images[0]))


def edit_image(image_path: str, edit_prompt: str) -> Optional[Image.Image]:
    """Image editing via prompt + input image.

    Returns a PIL.Image or None if no edited image returned.
    """
    if genai is None:
        raise RuntimeError("google-genai is not installed")

    client = _get_client()

    # Load input image as Pillow object; google-genai accepts PIL images as content parts
    base_img = Image.open(image_path)

    resp = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=[edit_prompt, base_img],
    )
    if not resp or not resp.candidates:
        return None
    images = _extract_image_bytes(resp.candidates[0])
    if not images:
        return None
    return Image.open(BytesIO(images[0]))

