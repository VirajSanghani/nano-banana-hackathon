import os
from typing import Any, Dict

from dotenv import load_dotenv

try:
    import fal
except Exception:
    fal = None  # type: ignore


load_dotenv()


def _ensure_auth():
    key = os.getenv("FAL_KEY")
    if not key:
        raise RuntimeError("Missing FAL_KEY. Set it in your .env file.")
    # Newer SDKs can read env automatically; keep explicit for clarity
    os.environ.setdefault("FAL_KEY", key)


def flux_schnell(prompt: str, image_size: str = "1024x1024") -> Dict[str, Any]:
    """Generate an image with fal FLUX.1 [schnell] model.

    Returns the raw fal response dict (contains URLs to images and metadata).
    """
    if fal is None:
        raise RuntimeError("fal package not installed")
    _ensure_auth()
    result = fal.apps.run(
        "fal-ai/flux/schnell",
        arguments={
            "prompt": prompt,
            "num_images": 1,
            "image_size": image_size,
        },
    )
    return result

