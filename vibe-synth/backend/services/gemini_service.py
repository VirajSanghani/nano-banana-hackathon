import google.generativeai as genai
from typing import Dict, List, Optional
import asyncio
import logging
import re
import json
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class GeminiVisualGenerator:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.generation_cache = {}
        self.rate_limit_tracker = {}
        
    async def generate_mood_board(self, emotion: str, text: str, context: Optional[Dict] = None) -> Dict:
        """Generate visual parameters based on emotion and text"""
        try:
            # Check rate limits
            if not self._check_rate_limit():
                logger.warning("Rate limit exceeded, using cached result")
                return self._get_cached_or_default(emotion)
            
            # Create prompt
            prompt = self._create_visual_prompt(emotion, text, context)
            
            # Check cache
            cache_key = f"{emotion}_{hash(text[:100])}"
            if cache_key in self.generation_cache:
                cached_result = self.generation_cache[cache_key]
                if datetime.now() - cached_result['timestamp'] < timedelta(minutes=5):
                    logger.info("Using cached visual generation")
                    return cached_result['data']
            
            # Generate with Gemini
            response = await self._generate_async(prompt)
            
            # Parse response
            visual_params = self._parse_visual_response(response, emotion)
            
            # Cache result
            self.generation_cache[cache_key] = {
                'data': visual_params,
                'timestamp': datetime.now()
            }
            
            # Update rate limit tracker
            self._update_rate_limit()
            
            logger.info(f"Generated visual parameters for emotion: {emotion}")
            return visual_params
            
        except Exception as e:
            logger.error(f"Error in visual generation: {e}")
            return self._get_default_visual_params(emotion)
    
    def _create_visual_prompt(self, emotion: str, text: str, context: Optional[Dict] = None) -> str:
        """Create a prompt for visual generation"""
        base_prompt = f"""
Generate visual parameters for an abstract particle system that represents the emotion "{emotion}" 
based on this text: "{text}"

Please provide:
1. A primary color palette (3 RGB values 0-1)
2. Secondary color palette (3 RGB values 0-1)
3. Particle behavior pattern (one word: flowing, explosive, gentle, pulsing, swirling, dancing)
4. Movement intensity (0.1-2.0)
5. Particle size variation (0.5-3.0)
6. Trail length (0.1-1.0)
7. A brief atmospheric description (one sentence)

Format your response as JSON with these exact keys:
{{
    "primary_color": [r, g, b],
    "secondary_color": [r, g, b],
    "behavior": "word",
    "intensity": number,
    "size_variation": number,
    "trail_length": number,
    "description": "sentence"
}}
"""
        
        if context:
            base_prompt += f"\nAdditional context: {json.dumps(context, indent=2)}"
        
        return base_prompt
    
    async def _generate_async(self, prompt: str) -> str:
        """Generate content asynchronously"""
        try:
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.model.generate_content(prompt)
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation error: {e}")
            raise
    
    def _parse_visual_response(self, response: str, emotion: str) -> Dict:
        """Parse Gemini response into visual parameters"""
        try:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                parsed = json.loads(json_str)
                
                # Validate and clean the parsed data
                return self._validate_visual_params(parsed, emotion)
            else:
                # Fallback parsing if JSON not found
                return self._fallback_parse(response, emotion)
                
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {e}")
            return self._get_default_visual_params(emotion)
        except Exception as e:
            logger.error(f"Response parsing error: {e}")
            return self._get_default_visual_params(emotion)
    
    def _validate_visual_params(self, params: Dict, emotion: str) -> Dict:
        """Validate and clean visual parameters"""
        cleaned = {}
        
        # Validate primary color
        primary_color = params.get('primary_color', [0.5, 0.5, 0.5])
        if isinstance(primary_color, list) and len(primary_color) == 3:
            cleaned['primary_color'] = [max(0, min(1, float(c))) for c in primary_color]
        else:
            cleaned['primary_color'] = self._get_emotion_color(emotion)
        
        # Validate secondary color
        secondary_color = params.get('secondary_color', cleaned['primary_color'])
        if isinstance(secondary_color, list) and len(secondary_color) == 3:
            cleaned['secondary_color'] = [max(0, min(1, float(c))) for c in secondary_color]
        else:
            cleaned['secondary_color'] = cleaned['primary_color']
        
        # Validate other parameters
        cleaned['behavior'] = str(params.get('behavior', 'gentle'))
        cleaned['intensity'] = max(0.1, min(2.0, float(params.get('intensity', 1.0))))
        cleaned['size_variation'] = max(0.5, min(3.0, float(params.get('size_variation', 1.5))))
        cleaned['trail_length'] = max(0.1, min(1.0, float(params.get('trail_length', 0.5))))
        cleaned['description'] = str(params.get('description', f'Abstract visualization of {emotion}'))
        
        return cleaned
    
    def _fallback_parse(self, response: str, emotion: str) -> Dict:
        """Fallback parsing when JSON extraction fails"""
        logger.info("Using fallback parsing for visual response")
        
        # Extract color information from text
        color_words = {
            'red': [0.9, 0.2, 0.2],
            'blue': [0.2, 0.3, 0.8],
            'green': [0.2, 0.8, 0.3],
            'yellow': [0.9, 0.9, 0.2],
            'purple': [0.7, 0.2, 0.8],
            'orange': [0.9, 0.5, 0.1],
            'pink': [0.9, 0.4, 0.7]
        }
        
        primary_color = self._get_emotion_color(emotion)
        for word, color in color_words.items():
            if word in response.lower():
                primary_color = color
                break
        
        # Extract behavior
        behavior_words = ['flowing', 'explosive', 'gentle', 'pulsing', 'swirling', 'dancing']
        behavior = 'gentle'
        for word in behavior_words:
            if word in response.lower():
                behavior = word
                break
        
        return {
            'primary_color': primary_color,
            'secondary_color': primary_color,
            'behavior': behavior,
            'intensity': 1.0,
            'size_variation': 1.5,
            'trail_length': 0.5,
            'description': f'Visual representation of {emotion}'
        }
    
    def _get_emotion_color(self, emotion: str) -> List[float]:
        """Get default color for emotion"""
        emotion_colors = {
            'joy': [1.0, 0.8, 0.2],      # Warm yellow
            'sadness': [0.2, 0.3, 0.8],  # Deep blue
            'energy': [0.9, 0.2, 0.3],   # Vibrant red
            'calm': [0.5, 0.8, 0.6]      # Soft green
        }
        return emotion_colors.get(emotion, [0.5, 0.5, 0.5])
    
    def _get_default_visual_params(self, emotion: str) -> Dict:
        """Get default visual parameters for emotion"""
        defaults = {
            'joy': {
                'primary_color': [1.0, 0.8, 0.2],
                'secondary_color': [1.0, 0.6, 0.1],
                'behavior': 'dancing',
                'intensity': 1.5,
                'size_variation': 2.0,
                'trail_length': 0.3,
                'description': 'Bright, uplifting particles that dance with joy'
            },
            'sadness': {
                'primary_color': [0.2, 0.3, 0.8],
                'secondary_color': [0.3, 0.4, 0.9],
                'behavior': 'flowing',
                'intensity': 0.7,
                'size_variation': 1.2,
                'trail_length': 0.8,
                'description': 'Gentle, melancholic particles that flow like tears'
            },
            'energy': {
                'primary_color': [0.9, 0.2, 0.3],
                'secondary_color': [1.0, 0.4, 0.2],
                'behavior': 'explosive',
                'intensity': 2.0,
                'size_variation': 2.5,
                'trail_length': 0.2,
                'description': 'Dynamic, powerful particles bursting with energy'
            },
            'calm': {
                'primary_color': [0.5, 0.8, 0.6],
                'secondary_color': [0.4, 0.7, 0.5],
                'behavior': 'gentle',
                'intensity': 0.8,
                'size_variation': 1.0,
                'trail_length': 0.6,
                'description': 'Peaceful, serene particles floating tranquilly'
            }
        }
        
        return defaults.get(emotion, defaults['calm'])
    
    def _check_rate_limit(self) -> bool:
        """Check if we can make another API call"""
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old entries
        self.rate_limit_tracker = {
            timestamp: count for timestamp, count in self.rate_limit_tracker.items()
            if timestamp > minute_ago
        }
        
        # Count requests in last minute
        total_requests = sum(self.rate_limit_tracker.values())
        return total_requests < 10  # Max 10 requests per minute
    
    def _update_rate_limit(self):
        """Update rate limit tracking"""
        now = datetime.now()
        self.rate_limit_tracker[now] = self.rate_limit_tracker.get(now, 0) + 1
    
    def _get_cached_or_default(self, emotion: str) -> Dict:
        """Get cached result or default for emotion"""
        # Look for any cached result for this emotion
        for key, cached in self.generation_cache.items():
            if emotion in key:
                return cached['data']
        
        return self._get_default_visual_params(emotion)