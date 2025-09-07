# Nano Banana Hackathon - Complete Resource Guide

## Event Overview
- **Date:** Saturday, September 6, 2025
- **Location:** San Francisco (In-person only)
- **Focus:** Building consumer applications with Gemini 2.5 Flash Image model (aka Nano Banana)
- **Prizes:** Over $50K in Gemini API credits
- **Judges:** Google DeepMind team members
- **Team Size:** Maximum 4 people
- **Requirements:** Application approval required, space limited

## 1. Gemini 2.5 Flash Image Model (Nano Banana)

### Model Capabilities
- **Text-to-Image Generation:** Create high-quality images from text descriptions
- **Image Editing:** Precise local edits using natural language
- **Image Fusion:** Blend multiple images into one
- **Character Consistency:** Maintain character appearance across multiple generations
- **World Knowledge:** Leverages Gemini's reasoning for realistic outputs

### Key Features
- **Model ID:** `gemini-2.5-flash-image-preview`
- **Pricing:** $0.039 per image (1290 output tokens)
- **Input:** Text + Images (up to 32,768 tokens)
- **Output:** Text + Images (up to 32,768 tokens)
- **SynthID Watermarking:** All generated images include invisible AI watermark

### Setup Instructions

```bash
# Install Google Gemini SDK
pip install google-genai python-dotenv pillow

# Or using npm for JavaScript
npm install @google/generative-ai
```

### Python Quick Start

```python
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import os

# Set API key
os.environ['GEMINI_API_KEY'] = 'your-api-key'
client = genai.Client()

# Text-to-Image Generation
def generate_image(prompt):
    response = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=prompt
    )
    
    image_parts = [
        part.inline_data.data
        for part in response.candidates[0].content.parts
        if part.inline_data
    ]
    
    if image_parts:
        image = Image.open(BytesIO(image_parts[0]))
        return image
    return None

# Image Editing
def edit_image(image_path, edit_prompt):
    image_input = Image.open(image_path)
    
    response = client.models.generate_content(
        model="gemini-2.5-flash-image-preview",
        contents=[edit_prompt, image_input]
    )
    
    # Extract and save edited image
    image_parts = [
        part.inline_data.data
        for part in response.candidates[0].content.parts
        if part.inline_data
    ]
    
    if image_parts:
        edited_image = Image.open(BytesIO(image_parts[0]))
        return edited_image
    return None
```

### Best Practices
1. **Prompting:** Use descriptive narratives instead of keyword lists
2. **Character Consistency:** Use "this exact [character]" with specific features
3. **Editing:** Be specific about what to change and what to preserve
4. **Multi-turn:** Use conversational editing for iterative improvements

## 2. ElevenLabs Audio Integration

### Models Available
- **Eleven v3:** Most advanced, high emotional range, multilingual
- **Flash v2.5:** Ultra-low latency (~75ms), 32 languages, real-time capable
- **Turbo v2.5:** Balance of quality and speed

### Setup Instructions

```bash
# Python SDK
pip install elevenlabs

# JavaScript SDK
npm install elevenlabs
```

### Python Quick Start

```python
from elevenlabs.client import ElevenLabs
from elevenlabs import play, stream

# Initialize client
client = ElevenLabs(api_key="your-elevenlabs-api-key")

# Text-to-Speech
def generate_speech(text, voice_id="JBFqnCBsd6RMkjVDRZzb"):
    audio = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_flash_v2_5",  # For low latency
        output_format="mp3_44100_128"
    )
    return audio

# Streaming Audio
def stream_speech(text, voice_id="JBFqnCBsd6RMkjVDRZzb"):
    audio_stream = client.text_to_speech.stream(
        text=text,
        voice_id=voice_id,
        model_id="eleven_flash_v2_5"
    )
    stream(audio_stream)

# Voice Cloning
def clone_voice(name, audio_files):
    voice = client.voices.ivc.create(
        name=name,
        description="Custom voice for hackathon",
        files=audio_files
    )
    return voice.voice_id
```

### JavaScript Quick Start

```javascript
import { ElevenLabs } from 'elevenlabs';

const client = new ElevenLabs({
    apiKey: 'your-elevenlabs-api-key'
});

// Generate speech
async function generateSpeech(text) {
    const audio = await client.textToSpeech.convert({
        text: text,
        voice_id: "JBFqnCBsd6RMkjVDRZzb",
        model_id: "eleven_flash_v2_5"
    });
    return audio;
}
```

### Key Features
- **Languages:** 32 languages supported
- **Voice Library:** Pre-made voices available
- **Voice Cloning:** Instant voice cloning from samples
- **Streaming:** Real-time audio generation
- **Pricing:** Flash model optimized for cost

## 3. Fal AI Platform Integration

### Available Models
- **FLUX.1 [schnell]:** Fastest, 1-4 steps, $0.003/megapixel
- **FLUX.1 [dev]:** High quality, $0.025/megapixel
- **FLUX.1.1 [pro] ultra:** 2K resolution, photo-realistic
- **200+ Other Models:** Including video, 3D, and specialized models

### Setup Instructions

```bash
# Python SDK
pip install fal

# JavaScript SDK
npm install @fal-ai/client
```

### Python Quick Start

```python
import fal

# Authenticate
fal.auth.login()  # Or use FAL_KEY environment variable

# Function decorator for serverless execution
@fal.function(
    "virtualenv",
    requirements=["pillow", "numpy"],
)
def generate_with_flux(prompt):
    # This runs in fal's cloud
    result = fal.apps.run(
        "fal-ai/flux/schnell",
        arguments={
            "prompt": prompt,
            "num_images": 1,
            "image_size": "1024x1024"
        }
    )
    return result

# Direct API usage
def quick_generate(prompt):
    result = fal.apps.run(
        "fal-ai/flux/schnell",
        arguments={"prompt": prompt}
    )
    return result
```

### JavaScript Quick Start

```javascript
import { fal } from "@fal-ai/client";

// Configure client
fal.config({
    credentials: "your-fal-key" // or use FAL_KEY env var
});

// Generate image with FLUX
async function generateImage(prompt) {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
            prompt: prompt,
            num_images: 1,
            image_size: "1024x1024"
        }
    });
    return result;
}

// Stream generation for real-time updates
async function streamGeneration(prompt) {
    const stream = await fal.stream("fal-ai/flux/dev", {
        input: { prompt: prompt }
    });
    
    for await (const event of stream) {
        console.log("Progress:", event);
    }
    
    return await stream.done();
}
```

### Advanced Features
- **LoRA Support:** Custom style adaptations
- **Image-to-Image:** Transform existing images
- **Serverless Functions:** Run Python code in the cloud
- **Auto-scaling:** Scales to 0 when not in use

## 4. Development Environment Setup

### Required API Keys
1. **Gemini API Key:** Get from [Google AI Studio](https://aistudio.google.com)
2. **ElevenLabs API Key:** Get from [ElevenLabs Dashboard](https://elevenlabs.io)
3. **Fal AI Key:** Get from [Fal Dashboard](https://fal.ai/dashboard/keys)

### Environment Variables (.env)

```bash
# Create .env file
GEMINI_API_KEY=your-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
FAL_KEY=your-fal-api-key
```

### Project Structure

```
nano-banana/
├── .env                    # API keys (don't commit!)
├── .gitignore             # Include .env
├── requirements.txt       # Python dependencies
├── package.json          # Node dependencies
├── src/
│   ├── gemini/          # Gemini integration
│   ├── elevenlabs/      # Audio generation
│   ├── fal/             # Additional AI models
│   └── main.py          # Main application
├── examples/            # Code examples
└── docs/               # Documentation
```

## 5. Project Ideas & Strategies

### Winning Strategies
1. **Leverage All Three Platforms:** Combine image (Gemini), audio (ElevenLabs), and additional AI (Fal)
2. **Focus on Consumer Appeal:** Make it useful for everyday users
3. **Character Consistency:** Use Gemini's strength in maintaining characters
4. **Real-time Features:** Use ElevenLabs Flash for instant audio
5. **Multi-modal:** Combine text, image, and audio creatively

### Example Project Ideas
1. **Interactive Story Creator:** Generate illustrated stories with narration
2. **Virtual Fashion Assistant:** Try on clothes with consistent model
3. **Language Learning App:** Visual + audio language lessons
4. **Recipe Visualizer:** Turn recipes into step-by-step visual guides
5. **Personal Brand Generator:** Create consistent brand assets
6. **Virtual Tour Guide:** Generate location images with audio descriptions
7. **Children's Book Maker:** Illustrated stories with character voices
8. **Product Mockup Generator:** Consistent product visualizations

## 6. Quick Reference

### API Endpoints
- **Gemini:** `gemini-2.5-flash-image-preview`
- **ElevenLabs:** `eleven_flash_v2_5` (low latency), `eleven_multilingual_v2` (quality)
- **Fal:** `fal-ai/flux/schnell` (fast), `fal-ai/flux/dev` (quality)

### Rate Limits & Costs
- **Gemini:** $0.039/image, 32K token limits
- **ElevenLabs:** Varies by tier, Flash model 50% cheaper
- **Fal:** $0.003-0.025/megapixel depending on model

### Documentation Links
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Fal AI Docs](https://docs.fal.ai)

## 7. Testing & Debugging

### Test Scripts

```python
# test_apis.py
import os
from dotenv import load_dotenv

load_dotenv()

def test_gemini():
    print("Testing Gemini...")
    # Add Gemini test

def test_elevenlabs():
    print("Testing ElevenLabs...")
    # Add ElevenLabs test

def test_fal():
    print("Testing Fal...")
    # Add Fal test

if __name__ == "__main__":
    test_gemini()
    test_elevenlabs()
    test_fal()
    print("All APIs tested successfully!")
```

## 8. Presentation Tips

### For Google DeepMind Judges
1. **Technical Sophistication:** Show understanding of model capabilities
2. **Innovation:** Novel use of image generation/editing features
3. **User Experience:** Smooth, intuitive interface
4. **Scalability:** Consider how it could serve millions
5. **Real-world Impact:** Solve actual consumer problems

### Demo Preparation
- Have offline fallbacks ready
- Pre-generate some examples
- Test on hackathon WiFi early
- Have video backup of working demo
- Practice 3-minute pitch

## Remember
- **Application Required:** Submit early for approval
- **In-person Only:** Be in San Francisco
- **Team Limit:** Maximum 4 people
- **Consumer Focus:** Build for everyday users
- **Partner Credits:** Use ElevenLabs and Fal AI for bonus points

Good luck with the hackathon!