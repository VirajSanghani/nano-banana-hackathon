"""
Pixel-Forge Backend API
AI-powered 2D game generator for Nano Banana Hackathon
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.services.sprite_generator import SpriteGenerator
from app.services.asset_generator import AssetGenerator
from app.services.game_assembler import GameAssembler
from app.services.cache_service import CacheService
from app.models.game import GameConfig, GameResponse
from app.models.sprite import SpriteRequest, SpriteResponse

load_dotenv()

# Initialize services
cache = CacheService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await cache.connect()
    yield
    # Shutdown
    await cache.disconnect()

app = FastAPI(
    title="Pixel-Forge API",
    description="Transform selfies into 8-bit heroes and generate custom platformer games",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
sprite_gen = SpriteGenerator()
asset_gen = AssetGenerator()
game_assembler = GameAssembler()

@app.get("/")
async def root():
    return {
        "name": "Pixel-Forge API",
        "status": "ready",
        "version": "1.0.0",
        "endpoints": {
            "sprite": "/api/sprite/generate",
            "assets": "/api/assets/generate",
            "game": "/api/game/assemble",
            "play": "/api/game/{game_id}"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/sprite/generate", response_model=SpriteResponse)
async def generate_sprite(file: UploadFile = File(...)):
    """
    Convert uploaded photo to 8-bit sprite sheet
    """
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(400, "File must be an image")
        
        # Read image data
        image_data = await file.read()
        
        # Check cache first
        cache_key = f"sprite:{hash(image_data)}"
        cached = await cache.get(cache_key)
        if cached:
            return JSONResponse(cached)
        
        # Generate sprite
        sprite_result = await sprite_gen.generate(image_data)
        
        # Cache result
        await cache.set(cache_key, sprite_result, ttl=3600)
        
        return sprite_result
        
    except Exception as e:
        raise HTTPException(500, f"Sprite generation failed: {str(e)}")

@app.post("/api/assets/generate")
async def generate_assets(theme: str, custom_prompt: str = None):
    """
    Generate themed game assets using AI
    """
    try:
        # Check cache
        cache_key = f"assets:{theme}:{custom_prompt or ''}"
        cached = await cache.get(cache_key)
        if cached:
            return JSONResponse(cached)
        
        # Generate assets
        assets = await asset_gen.generate_theme_assets(theme, custom_prompt)
        
        # Cache for reuse
        await cache.set(cache_key, assets, ttl=7200)
        
        return assets
        
    except Exception as e:
        raise HTTPException(500, f"Asset generation failed: {str(e)}")

@app.post("/api/game/assemble", response_model=GameResponse)
async def assemble_game(config: GameConfig):
    """
    Assemble sprite and assets into playable game configuration
    """
    try:
        # Create game configuration
        game_data = await game_assembler.create_game(
            sprite_url=config.sprite_url,
            assets=config.assets,
            theme=config.theme,
            difficulty=config.difficulty
        )
        
        # Generate shareable ID
        game_id = await game_assembler.save_game(game_data)
        
        return GameResponse(
            game_id=game_id,
            config=game_data,
            share_url=f"https://pixelforge.fun/play/{game_id}"
        )
        
    except Exception as e:
        raise HTTPException(500, f"Game assembly failed: {str(e)}")

@app.get("/api/game/{game_id}")
async def get_game(game_id: str):
    """
    Retrieve game configuration by ID
    """
    try:
        game_data = await game_assembler.load_game(game_id)
        if not game_data:
            raise HTTPException(404, "Game not found")
        
        return game_data
        
    except Exception as e:
        raise HTTPException(500, f"Failed to load game: {str(e)}")

@app.patch("/api/game/{game_id}/modify")
async def modify_game(game_id: str, modification: str):
    """
    Apply natural language modifications to game
    """
    try:
        # Load existing game
        game_data = await game_assembler.load_game(game_id)
        if not game_data:
            raise HTTPException(404, "Game not found")
        
        # Apply modifications
        modified_game = await game_assembler.apply_modification(
            game_data,
            modification
        )
        
        # Save updated version
        await game_assembler.update_game(game_id, modified_game)
        
        return modified_game
        
    except Exception as e:
        raise HTTPException(500, f"Modification failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)