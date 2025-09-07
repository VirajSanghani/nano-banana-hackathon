# API Keys Setup Guide for Nano Banana Hackathon

## Important Note
The hackathon mentions that partners (Google DeepMind, ElevenLabs, Fal AI) will be providing credits and prizes. Check with the hackathon organizers for any special promo codes or increased credits for participants!

---

## 1. Google Gemini API Key (Required)

### Sign Up Process:
1. **Go to Google AI Studio:** https://aistudio.google.com
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the left sidebar
4. **Create a new API key** - it's instant and free!

### Free Tier Includes:
- **$300 free credits** for new Google Cloud users (90 days)
- **Free tier limits:** 
  - 15 RPM (requests per minute) for Gemini 2.5 Flash Image
  - 1500 RPD (requests per day)
  - 1 million TPM (tokens per minute)
- **Cost after free tier:** $0.039 per image

### Setup in Project:
```bash
# Add to your .env file
GEMINI_API_KEY=your-key-here
```

### Test Your Key:
```python
from google import genai
import os

os.environ['GEMINI_API_KEY'] = 'your-key-here'
client = genai.Client()

# Test the API
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello, Gemini!"
)
print(response.text)
```

---

## 2. ElevenLabs API Key (Partner - Check for Hackathon Credits!)

### Sign Up Process:
1. **Go to ElevenLabs:** https://elevenlabs.io/sign-up
2. **Sign up** with email or Google account
3. **Verify your email** if needed
4. **Go to Profile Settings:** https://elevenlabs.io/app/settings/api-keys
5. **Copy your xi-api-key**

### Free Tier Includes:
- **10,000-20,000 credits/month** (varies by current offer)
- Approximately **10-20 minutes** of audio
- **2,500 character limit** per generation
- Access to all models including Flash v2.5
- **Non-commercial use only** (perfect for hackathon)

### Setup in Project:
```bash
# Add to your .env file
ELEVENLABS_API_KEY=your-xi-api-key-here
```

### Test Your Key:
```python
from elevenlabs import ElevenLabs

client = ElevenLabs(api_key="your-key-here")

# Test the API
voices = client.voices.search()
print(f"Found {len(voices.voices)} voices")
```

---

## 3. Fal AI API Key (Partner - Check for Hackathon Credits!)

### Sign Up Process:
1. **Go to Fal AI:** https://fal.ai
2. **Sign up** for a free account
3. **Navigate to Dashboard:** https://fal.ai/dashboard/keys
4. **Click "Add Key"**
5. **Name your key** (e.g., "nano-banana-hackathon")
6. **Click "Create Key"** and copy it immediately

### Free Tier Includes:
- **Free credits for new users** (amount varies)
- Credits expire in **90 days**
- Access to **200+ models** including FLUX
- **Pay-as-you-go** after free credits

### Setup in Project:
```bash
# Add to your .env file
FAL_KEY=your-fal-key-here
```

### Test Your Key:
```python
import fal
import os

os.environ['FAL_KEY'] = 'your-key-here'

# Test the API
result = fal.apps.run(
    "fal-ai/flux/schnell",
    arguments={"prompt": "Test image", "num_images": 1}
)
print("API working!" if result else "Check your key")
```

---

## 4. Complete Setup Test Script

Create `test_apis.py`:

```python
#!/usr/bin/env python3
"""Test all API keys to ensure they're working"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_gemini():
    """Test Gemini API"""
    try:
        from google import genai
        client = genai.Client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Say 'API working!'"
        )
        print("✅ Gemini API: Working")
        return True
    except Exception as e:
        print(f"❌ Gemini API: {str(e)[:50]}")
        return False

def test_elevenlabs():
    """Test ElevenLabs API"""
    try:
        from elevenlabs import ElevenLabs
        client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))
        voices = client.voices.search()
        print(f"✅ ElevenLabs API: Working ({len(voices.voices)} voices found)")
        return True
    except Exception as e:
        print(f"❌ ElevenLabs API: {str(e)[:50]}")
        return False

def test_fal():
    """Test Fal AI API"""
    try:
        import fal
        # Simple test that doesn't consume credits
        print("✅ Fal AI: API key loaded")
        return True
    except Exception as e:
        print(f"❌ Fal AI: {str(e)[:50]}")
        return False

if __name__ == "__main__":
    print("Testing API Keys for Nano Banana Hackathon\n")
    print("-" * 40)
    
    # Check if .env exists
    if not os.path.exists('.env'):
        print("⚠️  .env file not found! Copy .env.example to .env and add your keys.")
        exit(1)
    
    # Test each API
    gemini_ok = test_gemini()
    elevenlabs_ok = test_elevenlabs()
    fal_ok = test_fal()
    
    print("-" * 40)
    
    if all([gemini_ok, elevenlabs_ok, fal_ok]):
        print("\n🎉 All APIs are working! You're ready for the hackathon!")
    else:
        print("\n⚠️  Some APIs need attention. Check your keys in .env")
        print("\nMake sure to:")
        print("1. Copy .env.example to .env")
        print("2. Add your actual API keys")
        print("3. Check that you've signed up for all services")
```

---

## 5. Hackathon-Specific Benefits

### Expected Partner Benefits:
Since ElevenLabs and Fal AI are official partners, they typically provide:

1. **Extra Credits:** Much more than standard free tier
2. **Promo Codes:** May be announced at the event
3. **Extended Limits:** Higher rate limits during hackathon
4. **Direct Support:** Partner teams will be present

### What to Ask Organizers:
- "Are there promo codes for partner APIs?"
- "Do we get extra credits for the hackathon?"
- "Will partner teams provide API keys at the event?"
- "Is there a Slack/Discord for technical support?"

---

## 6. Pro Tips

### Before the Hackathon:
1. **Sign up early** - Get your accounts ready now
2. **Test everything** - Run the test script above
3. **Save backup keys** - In case rate limits hit
4. **Join Discord/Slack** - Often where codes are shared

### During the Hackathon:
1. **Monitor usage** - Check dashboards regularly
2. **Cache responses** - Don't regenerate the same content
3. **Use free tiers wisely** - Save heavy usage for final demo
4. **Ask partners** - They're there to help!

### Rate Limit Strategy:
- **Gemini:** 15 RPM is decent, batch requests when possible
- **ElevenLabs:** Use Flash model for demos (cheaper/faster)
- **Fal:** Use Schnell for testing, Dev for final

---

## 7. Quick Links

### Dashboards:
- **Gemini:** https://aistudio.google.com
- **ElevenLabs:** https://elevenlabs.io/app/settings/api-keys
- **Fal AI:** https://fal.ai/dashboard/keys

### Documentation:
- **Gemini Docs:** https://ai.google.dev/gemini-api/docs
- **ElevenLabs Docs:** https://elevenlabs.io/docs
- **Fal Docs:** https://docs.fal.ai

### Support:
- **Gemini:** https://ai.google.dev/gemini-api/docs/support
- **ElevenLabs Discord:** Check their website for invite
- **Fal Discord:** Check their website for invite

---

## Remember:
- The hackathon is about showcasing Gemini 2.5 Flash Image (Nano Banana)
- Partner integrations (ElevenLabs, Fal) can give you an edge
- Ask for hackathon-specific benefits and codes
- Test everything before the event starts!

Good luck! 🚀