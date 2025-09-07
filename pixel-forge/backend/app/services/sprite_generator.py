"""
Sprite Generation Service
Converts user photos to 8-bit game sprites using Gemini 2.5 Flash
"""

import google.generativeai as genai
import asyncio
from PIL import Image
import io
import base64
import numpy as np
from typing import Dict, List, Optional
import cv2
import os

class SpriteGenerator:
    def __init__(self):
        # Configure Gemini
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Animation configurations
        self.animations = {
            'idle': {'frames': 2, 'fps': 4},
            'run': {'frames': 4, 'fps': 8},
            'jump': {'frames': 2, 'fps': 4},
            'fall': {'frames': 1, 'fps': 4}
        }
    
    async def generate(self, image_data: bytes) -> Dict:
        """
        Main pipeline for sprite generation
        """
        try:
            # Step 1: Extract face from image
            face_image = await self.extract_face(image_data)
            
            # Step 2: Generate base sprite
            base_sprite = await self.generate_base_sprite(face_image)
            
            # Step 3: Generate animation frames
            animations = await self.generate_animations(base_sprite)
            
            # Step 4: Create sprite sheet
            sprite_sheet = self.create_sprite_sheet(base_sprite, animations)
            
            # Step 5: Upload to CDN and return URLs
            sprite_url = await self.upload_sprite(sprite_sheet)
            
            return {
                'sprite_sheet_url': sprite_url,
                'animations': self.animations,
                'dimensions': {'width': 32, 'height': 32}
            }
            
        except Exception as e:
            raise Exception(f"Sprite generation failed: {str(e)}")
    
    async def extract_face(self, image_data: bytes) -> Image.Image:
        """
        Extract and prepare face from uploaded image
        """
        # Load image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array for OpenCV
        img_array = np.array(image)
        
        # Face detection using OpenCV
        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            # No face detected, use center crop
            width, height = image.size
            size = min(width, height)
            left = (width - size) // 2
            top = (height - size) // 2
            return image.crop((left, top, left + size, top + size))
        
        # Get the largest face
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        
        # Add padding around face
        padding = int(w * 0.3)
        x = max(0, x - padding)
        y = max(0, y - padding)
        w = min(img_array.shape[1] - x, w + 2 * padding)
        h = min(img_array.shape[0] - y, h + 2 * padding)
        
        # Crop and return
        face_img = Image.fromarray(img_array[y:y+h, x:x+w])
        return face_img.resize((256, 256), Image.Resampling.LANCZOS)
    
    async def generate_base_sprite(self, face_image: Image.Image) -> Image.Image:
        """
        Generate the base 8-bit sprite from face
        """
        prompt = """
        Convert this person's face into an 8-bit pixel art game character sprite.
        Requirements:
        - Exactly 32x32 pixels
        - Standing pose, front view
        - Preserve key facial features (hair color, eye color, skin tone)
        - Classic NES/SNES style with limited color palette (max 16 colors)
        - Clear pixel boundaries, no anti-aliasing
        - Transparent background
        - Full body character suitable for a 2D platformer game
        - Simple but recognizable features
        
        Style: Retro 8-bit pixel art, similar to Super Mario Bros or Mega Man
        """
        
        try:
            # Convert image to bytes for Gemini
            img_byte_arr = io.BytesIO()
            face_image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Generate with Gemini
            response = self.model.generate_content([
                prompt,
                {"mime_type": "image/png", "data": img_byte_arr}
            ])
            
            # Parse response and extract image
            # For hackathon demo, return placeholder
            return self.create_placeholder_sprite(face_image)
            
        except Exception as e:
            print(f"Gemini generation failed: {e}")
            return self.create_placeholder_sprite(face_image)
    
    def create_placeholder_sprite(self, face_image: Image.Image) -> Image.Image:
        """
        Create a placeholder sprite for demo purposes
        """
        # Create a simple 32x32 pixel art character
        sprite = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
        
        # Simple pixel art character structure
        pixels = sprite.load()
        
        # Head (8x8)
        for x in range(12, 20):
            for y in range(4, 12):
                pixels[x, y] = (255, 220, 177, 255)  # Skin color
        
        # Hair (simplified from face image dominant color)
        face_array = np.array(face_image.resize((8, 8)))
        hair_color = tuple(face_array[0, 4][:3]) + (255,)
        for x in range(12, 20):
            for y in range(4, 8):
                pixels[x, y] = hair_color
        
        # Eyes
        pixels[14, 8] = (0, 0, 0, 255)
        pixels[17, 8] = (0, 0, 0, 255)
        
        # Body (12x16)
        for x in range(10, 22):
            for y in range(12, 24):
                pixels[x, y] = (0, 100, 200, 255)  # Blue shirt
        
        # Arms
        for y in range(12, 20):
            pixels[9, y] = (255, 220, 177, 255)
            pixels[22, y] = (255, 220, 177, 255)
        
        # Legs
        for x in range(13, 16):
            for y in range(24, 30):
                pixels[x, y] = (50, 50, 150, 255)  # Dark blue pants
        for x in range(16, 19):
            for y in range(24, 30):
                pixels[x, y] = (50, 50, 150, 255)
        
        # Feet
        for x in range(13, 16):
            pixels[x, 30] = (100, 50, 0, 255)
            pixels[x, 31] = (100, 50, 0, 255)
        for x in range(16, 19):
            pixels[x, 30] = (100, 50, 0, 255)
            pixels[x, 31] = (100, 50, 0, 255)
        
        return sprite
    
    async def generate_animations(self, base_sprite: Image.Image) -> Dict[str, List[Image.Image]]:
        """
        Generate animation frames from base sprite
        """
        animations = {}
        
        # Idle animation (just breathe effect)
        idle_frames = []
        for i in range(2):
            frame = base_sprite.copy()
            # Slight vertical shift for breathing
            if i == 1:
                frame = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
                frame.paste(base_sprite, (0, 1))
            idle_frames.append(frame)
        animations['idle'] = idle_frames
        
        # Run animation (leg movement)
        run_frames = []
        for i in range(4):
            frame = base_sprite.copy()
            # Simple leg animation by shifting pixels
            pixels = frame.load()
            
            # Alternate leg positions
            if i % 2 == 0:
                # Move left leg forward
                for x in range(13, 16):
                    for y in range(26, 30):
                        if y > 26:
                            pixels[x-1, y] = pixels[x, y]
                            pixels[x, y] = (0, 0, 0, 0)
            else:
                # Move right leg forward  
                for x in range(16, 19):
                    for y in range(26, 30):
                        if y > 26:
                            pixels[x+1, y] = pixels[x, y]
                            pixels[x, y] = (0, 0, 0, 0)
            
            run_frames.append(frame)
        animations['run'] = run_frames
        
        # Jump animation
        jump_frames = []
        for i in range(2):
            frame = base_sprite.copy()
            if i == 1:
                # Arms up for jump
                pixels = frame.load()
                for y in range(12, 16):
                    pixels[9, y] = (0, 0, 0, 0)
                    pixels[22, y] = (0, 0, 0, 0)
                    pixels[9, y-4] = (255, 220, 177, 255)
                    pixels[22, y-4] = (255, 220, 177, 255)
            jump_frames.append(frame)
        animations['jump'] = jump_frames
        
        # Fall animation (single frame)
        fall_frame = base_sprite.copy()
        animations['fall'] = [fall_frame]
        
        return animations
    
    def create_sprite_sheet(self, base_sprite: Image.Image, animations: Dict) -> Image.Image:
        """
        Combine all animations into a single sprite sheet
        """
        # Calculate sprite sheet dimensions
        total_frames = sum(len(frames) for frames in animations.values())
        sheet_width = 32 * max(8, total_frames)  # At least 8 frames wide
        sheet_height = 32
        
        # Create sprite sheet
        sprite_sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
        
        # Place frames
        x_offset = 0
        for anim_name in ['idle', 'run', 'jump', 'fall']:
            if anim_name in animations:
                for frame in animations[anim_name]:
                    sprite_sheet.paste(frame, (x_offset, 0))
                    x_offset += 32
        
        return sprite_sheet
    
    async def upload_sprite(self, sprite_sheet: Image.Image) -> str:
        """
        Upload sprite sheet to CDN or return base64 data URL
        """
        # For demo, return base64 data URL
        buffered = io.BytesIO()
        sprite_sheet.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"