"""
Fal AI Client
Complete wrapper for Fal AI models including FLUX and other generative models
"""

import os
import asyncio
from typing import Optional, List, Dict, Any, Union
from PIL import Image
import fal
from dotenv import load_dotenv
import requests
from io import BytesIO

load_dotenv()

class FalAIClient:
    """Client for Fal AI platform - access to 200+ generative models"""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Fal client with API key"""
        self.api_key = api_key or os.getenv('FAL_KEY')
        if not self.api_key:
            raise ValueError("FAL_KEY not found in environment variables")
        
        os.environ['FAL_KEY'] = self.api_key
        
        # Available models
        self.models = {
            "flux_schnell": "fal-ai/flux/schnell",  # Fastest
            "flux_dev": "fal-ai/flux/dev",  # High quality
            "flux_pro": "fal-ai/flux-pro",  # Professional
            "flux_lora": "fal-ai/flux-lora",  # With LoRA support
            "stable_diffusion": "fal-ai/stable-diffusion-xl",
            "controlnet": "fal-ai/controlnet",
            "img2img": "fal-ai/flux/dev/image-to-image",
            "video": "fal-ai/stable-video",  # Video generation
            "music": "fal-ai/musicgen",  # Music generation
            "3d": "fal-ai/triposr"  # 3D model generation
        }
    
    def generate_image(self,
                      prompt: str,
                      model: str = "flux_schnell",
                      num_images: int = 1,
                      image_size: str = "1024x1024",
                      save_path: Optional[str] = None) -> List[Image.Image]:
        """
        Generate images using specified model
        
        Args:
            prompt: Text prompt for generation
            model: Model to use (flux_schnell/flux_dev/flux_pro)
            num_images: Number of images to generate
            image_size: Size of the generated images
            save_path: Optional path to save images
            
        Returns:
            List of PIL Image objects
        """
        try:
            model_id = self.models.get(model, model)
            
            result = fal.apps.run(
                model_id,
                arguments={
                    "prompt": prompt,
                    "num_images": num_images,
                    "image_size": image_size,
                    "num_inference_steps": 4 if "schnell" in model else 28,
                    "guidance_scale": 3.5,
                    "enable_safety_checker": True
                }
            )
            
            images = []
            for i, img_data in enumerate(result.get("images", [])):
                img_url = img_data.get("url")
                if img_url:
                    response = requests.get(img_url)
                    img = Image.open(BytesIO(response.content))
                    images.append(img)
                    
                    if save_path:
                        filename = f"{save_path}_{i}.png" if num_images > 1 else f"{save_path}.png"
                        img.save(filename)
                        print(f"Image saved to {filename}")
            
            return images
            
        except Exception as e:
            print(f"Error generating image: {e}")
            return []
    
    def image_to_image(self,
                      source_image_path: str,
                      prompt: str,
                      strength: float = 0.85,
                      save_path: Optional[str] = None) -> Optional[Image.Image]:
        """
        Transform an existing image using a prompt
        
        Args:
            source_image_path: Path to source image
            prompt: Transformation prompt
            strength: How much to change the image (0-1)
            save_path: Optional path to save result
            
        Returns:
            PIL Image object or None
        """
        try:
            # Upload image and get URL
            with open(source_image_path, 'rb') as f:
                image_data = f.read()
            
            result = fal.apps.run(
                self.models["img2img"],
                arguments={
                    "image_url": source_image_path,  # In production, upload to cloud first
                    "prompt": prompt,
                    "strength": strength,
                    "num_inference_steps": 28,
                    "guidance_scale": 3.5,
                    "enable_safety_checker": True
                }
            )
            
            img_url = result.get("images", [{}])[0].get("url")
            if img_url:
                response = requests.get(img_url)
                img = Image.open(BytesIO(response.content))
                
                if save_path:
                    img.save(save_path)
                    print(f"Transformed image saved to {save_path}")
                
                return img
                
        except Exception as e:
            print(f"Error in image-to-image: {e}")
            return None
    
    def generate_with_lora(self,
                          prompt: str,
                          lora_url: str,
                          lora_scale: float = 1.0,
                          save_path: Optional[str] = None) -> Optional[Image.Image]:
        """
        Generate image with LoRA adaptation
        
        Args:
            prompt: Generation prompt
            lora_url: URL to LoRA weights
            lora_scale: LoRA influence strength
            save_path: Optional save path
            
        Returns:
            PIL Image object or None
        """
        try:
            result = fal.apps.run(
                self.models["flux_lora"],
                arguments={
                    "prompt": prompt,
                    "loras": [
                        {
                            "path": lora_url,
                            "scale": lora_scale
                        }
                    ],
                    "num_images": 1,
                    "guidance_scale": 3.5
                }
            )
            
            img_url = result.get("images", [{}])[0].get("url")
            if img_url:
                response = requests.get(img_url)
                img = Image.open(BytesIO(response.content))
                
                if save_path:
                    img.save(save_path)
                    print(f"LoRA image saved to {save_path}")
                
                return img
                
        except Exception as e:
            print(f"Error generating with LoRA: {e}")
            return None
    
    def generate_video(self,
                      image_path: str,
                      motion_bucket_id: int = 127,
                      save_path: Optional[str] = None) -> Optional[str]:
        """
        Generate video from an image
        
        Args:
            image_path: Path to source image
            motion_bucket_id: Amount of motion (1-255)
            save_path: Optional path to save video
            
        Returns:
            Path to video file or None
        """
        try:
            result = fal.apps.run(
                self.models["video"],
                arguments={
                    "image_url": image_path,  # In production, upload to cloud first
                    "motion_bucket_id": motion_bucket_id,
                    "fps": 25,
                    "num_frames": 25
                }
            )
            
            video_url = result.get("video", {}).get("url")
            if video_url:
                response = requests.get(video_url)
                
                output_path = save_path or "generated_video.mp4"
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"Video saved to {output_path}")
                return output_path
                
        except Exception as e:
            print(f"Error generating video: {e}")
            return None
    
    def generate_music(self,
                      prompt: str,
                      duration: int = 10,
                      save_path: Optional[str] = None) -> Optional[str]:
        """
        Generate music from text description
        
        Args:
            prompt: Music description
            duration: Duration in seconds
            save_path: Optional save path
            
        Returns:
            Path to audio file or None
        """
        try:
            result = fal.apps.run(
                self.models["music"],
                arguments={
                    "prompt": prompt,
                    "duration": duration,
                    "top_k": 250,
                    "top_p": 0.95,
                    "temperature": 1.0
                }
            )
            
            audio_url = result.get("audio", {}).get("url")
            if audio_url:
                response = requests.get(audio_url)
                
                output_path = save_path or "generated_music.wav"
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"Music saved to {output_path}")
                return output_path
                
        except Exception as e:
            print(f"Error generating music: {e}")
            return None
    
    @fal.function(
        "virtualenv",
        requirements=["pillow", "numpy"],
    )
    def serverless_process(self, prompt: str) -> Dict[str, Any]:
        """
        Example of serverless function execution on Fal
        This runs in Fal's cloud infrastructure
        """
        import numpy as np
        from PIL import Image
        
        # Your processing code here
        # This runs serverlessly on Fal's infrastructure
        
        result = {
            "status": "processed",
            "prompt": prompt,
            "timestamp": str(np.datetime64('now'))
        }
        
        return result
    
    async def stream_generation(self, 
                               prompt: str,
                               model: str = "flux_dev") -> None:
        """
        Stream generation progress in real-time
        
        Args:
            prompt: Generation prompt
            model: Model to use
        """
        try:
            model_id = self.models.get(model, model)
            
            # Note: This is pseudo-code as actual streaming depends on fal client version
            async for event in fal.stream(model_id, {"prompt": prompt}):
                if event.get("type") == "progress":
                    print(f"Progress: {event.get('progress')}%")
                elif event.get("type") == "complete":
                    print("Generation complete!")
                    return event.get("result")
                    
        except Exception as e:
            print(f"Error in streaming: {e}")


def main():
    """Example usage of the Fal AI Client"""
    client = FalAIClient()
    
    # Example 1: Fast image generation with FLUX Schnell
    print("Generating with FLUX Schnell (fastest)...")
    images = client.generate_image(
        prompt="A majestic mountain landscape with aurora borealis, photorealistic",
        model="flux_schnell",
        num_images=1,
        save_path="flux_schnell_output"
    )
    print(f"Generated {len(images)} images with FLUX Schnell")
    
    # Example 2: High quality generation with FLUX Dev
    print("\nGenerating with FLUX Dev (high quality)...")
    images = client.generate_image(
        prompt="Portrait of a cyberpunk character with neon lighting, highly detailed",
        model="flux_dev",
        num_images=1,
        save_path="flux_dev_output"
    )
    
    # Example 3: Generate music
    print("\nGenerating background music...")
    music_path = client.generate_music(
        prompt="Upbeat electronic music for a tech presentation, energetic and modern",
        duration=15,
        save_path="background_music"
    )
    
    # Example 4: Serverless function
    print("\nRunning serverless function...")
    result = client.serverless_process("Process this in the cloud!")
    print(f"Serverless result: {result}")


if __name__ == "__main__":
    main()