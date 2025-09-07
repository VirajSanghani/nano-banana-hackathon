# CLAUDE.md - Nano Banana Hackathon Project with BMAD System

## BMAD System Integration
This project uses the BMAD (Breakthrough Method for Agile AI-Driven Development) system for structured development workflow. Key components:
- **Agents**: Specialized AI personas in `bmad-core/agents/` (analyst, pm, architect, dev, qa, sm)
- **Templates**: Document templates in `bmad-core/templates/`
- **Tasks**: Executable workflows in `bmad-core/tasks/`
- **Commands**: Type `*help` to see available BMAD commands

### Quick BMAD Commands
- `*analyst` - Activate Business Analyst for brainstorming and research
- `*pm` - Activate Product Manager for PRD creation
- `*architect` - Activate Solution Architect for technical design
- `*dev` - Activate Developer for implementation
- `*qa` - Activate QA Engineer for testing
- `*sm` - Activate Scrum Master for task management

## Project Context
This is a hackathon project for the Nano Banana Hackathon (September 6, 2025) focused on building consumer applications using Google's Gemini 2.5 Flash Image model (aka Nano Banana). The hackathon is judged by the Google DeepMind team with over $50K in Gemini API credits as prizes.

## Project Status
- **Phase**: Initial setup and ideation
- **Team Size**: Max 4 people (currently forming)
- **Location**: San Francisco (in-person only)
- **Partners**: ElevenLabs (audio AI) and Fal AI (200+ models)

## Technical Stack
### Core APIs
- **Gemini 2.5 Flash Image**: Primary image generation/editing model ($0.039/image)
- **ElevenLabs**: Voice synthesis, ~75ms latency with Flash v2.5
- **Fal AI**: Additional models including FLUX for fast image generation

### Development Environment
- **Languages**: Python primary, JavaScript/TypeScript for web
- **Frameworks**: FastAPI for backend, Next.js/React for frontend
- **Key Libraries**: google-genai, elevenlabs, fal

## Project Structure
```
nano-banana/
├── src/
│   ├── gemini_client.py      # Gemini image generation wrapper
│   ├── elevenlabs_client.py  # Audio synthesis wrapper
│   └── fal_client.py         # Fal AI models wrapper
├── HACKATHON_RESOURCES.md    # Complete hackathon guide
├── API_KEYS_SETUP.md         # API key setup instructions
├── requirements.txt          # Python dependencies
├── package.json             # Node dependencies
└── .env.example            # Environment variables template
```

## Key Capabilities to Leverage
1. **Gemini Strengths**: Character consistency, conversational editing, world knowledge
2. **ElevenLabs**: Real-time voice with 32 language support
3. **Fal AI**: Sub-second image generation with FLUX Schnell

## Hackathon Strategy
- Focus on consumer-facing applications
- Leverage all three platforms for competitive advantage
- Emphasize Gemini's unique character consistency feature
- Build something that demonstrates technical sophistication to Google DeepMind judges

## Current Tasks
1. Form team (max 4 people)
2. Submit application for approval
3. Brainstorm consumer project ideas
4. Design architecture leveraging all three APIs
5. Develop MVP for demo
6. Prepare presentation for judges

## Development Guidelines
- **Error Handling**: Always wrap API calls with try-except
- **Rate Limits**: Gemini 15 RPM, plan accordingly
- **Caching**: Cache generated content to avoid hitting limits
- **Testing**: Use test scripts before hackathon
- **Demo Prep**: Have offline fallbacks ready

## Important Commands
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Test APIs
python test_apis.py

# Run development server
python -m uvicorn src.main:app --reload

# Environment setup
cp .env.example .env
# Then add your API keys
```

## Notes for Claude
- This is a time-sensitive hackathon project - prioritize speed and functionality
- The primary goal is impressing Google DeepMind judges with innovative use of Gemini 2.5 Flash Image
- Partner integrations (ElevenLabs, Fal) should enhance but not overshadow Gemini usage
- Focus on consumer appeal and real-world applications
- Remember to demonstrate character consistency - it's Gemini's unique strength

## Quick Reference
- **Gemini Model**: gemini-2.5-flash-image-preview
- **ElevenLabs Fast Model**: eleven_flash_v2_5
- **Fal Fast Model**: fal-ai/flux/schnell
- **Hackathon Date**: September 6, 2025
- **Location**: San Francisco