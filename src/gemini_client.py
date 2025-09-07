"""
Gemini 2.5 Flash Image Model Client
Complete wrapper for the Nano Banana hackathon
"""

import os
from typing import Optional, List, Union
from PIL import Image
from io import BytesIO
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

class GeminiImageClient:
    """Client for Gemini 2.5 Flash Image model operations"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Gemini client with API key"""
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        os.environ['GEMINI_API_KEY'] = self.api_key
        self.client = genai.Client()
        self.model_id = "gemini-2.5-flash-image-preview"
    
    def generate_image(self, prompt: str, save_path: Optional[str] = None) -> Optional[Image.Image]:
        """
        Generate an image from a text prompt
        
        Args:
            prompt: Text description for image generation
            save_path: Optional path to save the generated image
            
        Returns:
            PIL Image object or None if generation fails
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            
            image_parts = [
                part.inline_data.data
                for part in response.candidates[0].content.parts
                if part.inline_data
            ]
            
            if image_parts:
                image = Image.open(BytesIO(image_parts[0]))
                if save_path:
                    image.save(save_path)
                    print(f"Image saved to {save_path}")
                return image
            
        except Exception as e:
            print(f"Error generating image: {e}")
            return None
    
    def edit_image(self, 
                   image_path: str, 
                   edit_prompt: str, 
                   save_path: Optional[str] = None) -> Optional[Image.Image]:
        """
        Edit an existing image using natural language
        
        Args:
            image_path: Path to the source image
            edit_prompt: Natural language description of edits
            save_path: Optional path to save the edited image
            
        Returns:
            PIL Image object or None if editing fails
        """
        try:
            image_input = Image.open(image_path)
            
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[edit_prompt, image_input]
            )
            
            image_parts = [
                part.inline_data.data
                for part in response.candidates[0].content.parts
                if part.inline_data
            ]
            
            if image_parts:
                edited_image = Image.open(BytesIO(image_parts[0]))
                if save_path:
                    edited_image.save(save_path)
                    print(f"Edited image saved to {save_path}")
                return edited_image
                
        except Exception as e:
            print(f"Error editing image: {e}")
            return None
    
    def blend_images(self, 
                     image_paths: List[str], 
                     blend_prompt: str,
                     save_path: Optional[str] = None) -> Optional[Image.Image]:
        """
        Blend multiple images into one using a prompt
        
        Args:
            image_paths: List of paths to source images
            blend_prompt: Description of how to blend the images
            save_path: Optional path to save the blended image
            
        Returns:
            PIL Image object or None if blending fails
        """
        try:
            images = [Image.open(path) for path in image_paths]
            contents = [blend_prompt] + images
            
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents
            )
            
            image_parts = [
                part.inline_data.data
                for part in response.candidates[0].content.parts
                if part.inline_data
            ]
            
            if image_parts:
                blended_image = Image.open(BytesIO(image_parts[0]))
                if save_path:
                    blended_image.save(save_path)
                    print(f"Blended image saved to {save_path}")
                return blended_image
                
        except Exception as e:
            print(f"Error blending images: {e}")
            return None
    
    def generate_character_series(self, 
                                  character_description: str,
                                  scenes: List[str],
                                  save_dir: Optional[str] = None) -> List[Image.Image]:
        """
        Generate a series of images with consistent character
        
        Args:
            character_description: Detailed description of the character
            scenes: List of scene descriptions for the character
            save_dir: Optional directory to save all images
            
        Returns:
            List of PIL Image objects
        """
        generated_images = []
        
        for i, scene in enumerate(scenes):
            prompt = f"This exact character: {character_description}. Scene: {scene}. Maintain identical features and appearance."
            
            image = self.generate_image(prompt)
            if image:
                generated_images.append(image)
                if save_dir:
                    os.makedirs(save_dir, exist_ok=True)
                    save_path = os.path.join(save_dir, f"scene_{i+1}.png")
                    image.save(save_path)
                    print(f"Scene {i+1} saved to {save_path}")
        
        return generated_images
    
    def conversational_edit(self, 
                           image_path: str,
                           edits: List[str]) -> List[Image.Image]:
        """
        Apply multiple edits to an image conversationally
        
        Args:
            image_path: Path to the source image
            edits: List of edit instructions to apply sequentially
            
        Returns:
            List of PIL Image objects showing progression
        """
        edited_images = []
        current_image_path = image_path
        
        for i, edit in enumerate(edits):
            edited_image = self.edit_image(current_image_path, edit)
            if edited_image:
                edited_images.append(edited_image)
                temp_path = f"temp_edit_{i}.png"
                edited_image.save(temp_path)
                current_image_path = temp_path
        
        # Clean up temp files
        for i in range(len(edits)):
            temp_path = f"temp_edit_{i}.png"
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        return edited_images


def main():
    """Example usage of the Gemini Image Client"""
    client = GeminiImageClient()
    
    # Example 1: Generate an image
    print("Generating image...")
    image = client.generate_image(
        prompt="A futuristic cityscape at sunset with flying cars and neon lights, cyberpunk style",
        save_path="generated_city.png"
    )
    
    # Example 2: Edit an image
    if image:
        print("\nEditing image...")
        edited = client.edit_image(
            image_path="generated_city.png",
            edit_prompt="Add a giant holographic banana floating above the city",
            save_path="city_with_banana.png"
        )
    
    # Example 3: Generate character series
    print("\nGenerating character series...")
    character = "A friendly robot with blue LED eyes, silver metallic body, and antenna on head"
    scenes = [
        "Standing in a modern kitchen making coffee",
        "Sitting at a desk coding on a computer",
        "Walking in a park with cherry blossoms"
    ]
    
    series = client.generate_character_series(
        character_description=character,
        scenes=scenes,
        save_dir="character_series"
    )
    
    print(f"\nGenerated {len(series)} character images")


if __name__ == "__main__":
    main()