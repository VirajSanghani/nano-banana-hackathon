import { Story, StoryPage } from '../types';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const ELEVENLABS_API_KEY = process.env.REACT_APP_ELEVENLABS_API_KEY;
const FAL_API_KEY = process.env.REACT_APP_FAL_API_KEY;

export class StoryAPI {
  private requestCount = 0;

  async generateMagicalStory(prompt: string): Promise<Story> {
    console.log('🎭 Starting magical story generation for:', prompt);
    
    try {
      // Enhanced magical story generation with real APIs
      const story = await this.generateEnhancedStory(prompt);
      return story;
    } catch (error) {
      console.warn('Enhanced story generation failed, using demo mode:', error);
      // Fallback to demo story
      return this.generateDemoStory(prompt);
    }
  }

  private async generateEnhancedStory(prompt: string): Promise<Story> {
    console.log('🚀 Creating enhanced story with AI...');

    // Step 1: Generate enhanced story content with Gemini
    const storyContent = await this.generateStoryContentWithGemini(prompt);
    
    // Step 2: Generate images for each page with Gemini
    const pagesWithImages = await this.generateImagesWithGemini(storyContent.pages, prompt);
    
    // Step 3: Add audio narration with ElevenLabs
    const pagesWithAudio = await this.generateAudioWithElevenLabs(pagesWithImages);
    
    // Step 4: Generate background music
    const backgroundMusicUrl = await this.generateBackgroundMusic(prompt);

    const story: Story = {
      ...storyContent,
      pages: pagesWithAudio,
      backgroundMusicUrl,
      createdAt: new Date(),
    };

    console.log('✨ Enhanced story completed:', story.title);
    return story;
  }

  private async generateStoryContentWithGemini(prompt: string): Promise<Omit<Story, 'createdAt' | 'backgroundMusicUrl'>> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a magical, engaging 3-page children's story about "${prompt}". 

Requirements:
- Make it magical and age-appropriate for children 3-8 years old
- Each page should be 2-3 sentences
- Include a brave main character who learns something important
- Use vivid, colorful descriptions that will work well for image generation
- Make it interactive and engaging
- Include gentle life lessons about friendship, courage, or kindness

IMPORTANT for imagePrompt fields:
- Create EXTREMELY detailed, visual descriptions for each page
- Include specific colors, lighting, atmosphere, and art style
- Describe character poses, expressions, and clothing in detail
- Include environmental details like background, weather, time of day
- Specify camera angle (close-up, wide shot, bird's eye view, etc.)
- Use artistic terms like "watercolor", "digital painting", "soft pastels"
- Make each prompt at least 50-100 words for maximum visual detail

Return ONLY a JSON object in this exact format:
{
  "id": "unique_id",
  "title": "The Magical Adventure of [prompt]",
  "childPrompt": "${prompt}",
  "mainCharacter": {
    "name": "character_name",
    "appearance": "VERY detailed physical description including: hair color/style, eye color, skin tone, height, clothing colors and style, any accessories, distinguishing features",
    "personality": "personality traits",
    "specialTraits": ["trait1", "trait2"],
    "visualAnchors": ["specific visual elements that appear in EVERY image for consistency like 'red cape with golden stars', 'blue wizard hat', 'glowing green amulet'"]
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "engaging story text with vivid descriptions",
      "imagePrompt": "[ULTRA DETAILED 50-100 word description] Example: Wide shot of a small dragon with emerald green scales and golden eyes, sitting on a cloud-covered mountain peak at sunrise. The dragon wears a tiny red scarf. Soft pink and orange sky with fluffy white clouds below. Watercolor children's book illustration style with magical sparkles floating in the air. Warm lighting from the rising sun creates a hopeful, adventurous mood.",
      "hasChoice": false
    },
    {
      "pageNumber": 2,
      "text": "continuing the adventure",
      "imagePrompt": "[ULTRA DETAILED 50-100 word description with consistent character appearance]",
      "hasChoice": false
    },
    {
      "pageNumber": 3,
      "text": "magical conclusion with life lesson",
      "imagePrompt": "[ULTRA DETAILED 50-100 word happy ending description]",
      "hasChoice": false
    }
  ],
  "theme": "adventure"
}`
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated by Gemini');
      }

      // Parse the JSON response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Gemini response');
      }

      const storyData = JSON.parse(jsonMatch[0]);
      console.log('📚 Story content generated with Gemini');
      return storyData;

    } catch (error) {
      console.error('Gemini story generation error:', error);
      throw error;
    }
  }

  private async generateImagesWithGemini(pages: StoryPage[], prompt: string): Promise<StoryPage[]> {
    console.log('🎨 Generating images with Gemini Nano...');

    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log('Gemini API key not configured, using enhanced demo images');
      return this.generateEnhancedDemoImages(pages, prompt);
    }

    const pagesWithImages = [];
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      try {
        console.log(`🖼️ Generating image for page ${page.pageNumber}...`);
        
        // First, try to generate with Gemini's Imagen (if available)
        let imageUrl = await this.generateImageWithGeminiNanoBanana(page.imagePrompt, prompt);
        
        if (!imageUrl) {
          // Try again with a simpler prompt
          console.log('🔄 Retrying with simplified prompt...');
          const simplifiedPrompt = `Children's book illustration: ${page.imagePrompt}`;
          imageUrl = await this.generateImageWithGeminiNanoBanana(simplifiedPrompt, prompt);
        }
        
        pagesWithImages.push({
          ...page,
          imageUrl: imageUrl || this.getEnhancedDemoImage(i, prompt)
        });
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.warn(`Image generation failed for page ${page.pageNumber}, using fallback:`, error);
        pagesWithImages.push({
          ...page,
          imageUrl: this.getEnhancedDemoImage(i, prompt)
        });
      }
    }

    return pagesWithImages;
  }

  private async generateImageWithGeminiNanoBanana(originalPrompt: string, storyTheme: string): Promise<string | null> {
    // Gemini 2.5 Flash Image (Nano Banana) generates images directly!
    if (!GEMINI_API_KEY) {
      console.error('❌ Gemini API key is required for image generation');
      return null;
    }

    try {
      console.log('🍌 Using Gemini Nano Banana to generate image...');
      console.log('📝 Original prompt:', originalPrompt);
      
      // Create an ultra-detailed prompt for maximum quality
      const detailedPrompt = `Create a photorealistic children's storybook illustration. ${originalPrompt}. 
Art style: Soft watercolor painting with vibrant colors and magical sparkles. 
Lighting: Warm, golden hour sunlight with soft shadows. 
Mood: Whimsical, joyful, and enchanting. 
Composition: Dynamic with rule of thirds, depth of field. 
Details: Ultra-detailed with rich textures, expressive characters, magical atmosphere. 
Theme: ${storyTheme}. 
Quality: Award-winning children's book illustration, 4K, masterpiece.`;
      
      console.log('🎨 Enhanced prompt for Gemini:', detailedPrompt);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: detailedPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini Nano Banana API error:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      console.log('📦 Gemini API response received');
      
      // Check if we got an image in the response
      const parts = data.candidates?.[0]?.content?.parts;
      if (parts && parts.length > 0) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            // We got a base64 image!
            const mimeType = part.inlineData.mimeType || 'image/png';
            const base64Image = part.inlineData.data;
            const imageUrl = `data:${mimeType};base64,${base64Image}`;
            console.log('✅ Gemini Nano Banana generated image successfully!');
            return imageUrl;
          }
        }
        
        // If we got text instead of image, log it
        if (parts[0]?.text) {
          console.log('ℹ️ Gemini returned text instead of image:', parts[0].text.substring(0, 100));
        }
      }
      
      console.warn('⚠️ No image data in Gemini response');
      return null;
      
    } catch (error) {
      console.error('❌ Gemini Nano Banana generation error:', error);
      return null;
    }
  }
  

  private async enhanceImagePromptWithGemini(originalPrompt: string, storyTheme: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      // Without API key, return original prompt
      return originalPrompt;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an expert children's book illustrator. Transform this basic prompt into an ULTRA-DETAILED image generation prompt for a magical children's storybook.

Story Theme: "${storyTheme}"
Basic Prompt: "${originalPrompt}"

Create a 100+ word detailed prompt that includes ALL of these elements:

1. COMPOSITION: Specify exact camera angle (wide shot, close-up, bird's eye, worm's eye, 3/4 view)
2. CHARACTER DETAILS: Precise descriptions of poses, expressions, clothing textures, colors
3. ENVIRONMENT: Detailed background with at least 5 specific elements
4. LIGHTING: Exact lighting setup (key light direction, fill light, rim lighting, color temperature)
5. COLOR PALETTE: List 5-7 specific colors with their emotional purpose
6. ART STYLE: Specific medium and technique (e.g., "soft watercolor with visible paper texture")
7. ATMOSPHERE: Weather, time of day, magical effects, particle effects
8. MOOD: The exact emotional tone and how it's conveyed visually
9. QUALITY MARKERS: "masterpiece", "award-winning", "highly detailed", "4K"
10. STYLE REFERENCE: Reference famous children's book illustrators style

Make it vivid, magical, and perfect for children aged 3-8.

Return ONLY the enhanced prompt, no explanations.`
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 500,
          },
        })
      });

      const data = await response.json();
      const enhancedPrompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (enhancedPrompt && enhancedPrompt.length > 50) {
        console.log('✨ Gemini created ultra-detailed prompt');
        return enhancedPrompt;
      }
      
      // Fallback to original prompt
      return originalPrompt;
    } catch (error) {
      console.warn('Prompt enhancement failed, using original:', error);
      return originalPrompt;
    }
  }


  private generateEnhancedDemoImages(pages: StoryPage[], prompt: string): StoryPage[] {
    return pages.map((page, index) => ({
      ...page,
      imageUrl: this.getEnhancedDemoImage(index, prompt)
    }));
  }

  private getEnhancedDemoImage(index: number, prompt: string): string {
    // Return a placeholder or empty string since we're only using Gemini
    console.log(`⚠️ No fallback image available for page ${index + 1} - Gemini API required`);
    // Return a data URL for a simple placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBHZW5lcmF0aW9uIFJlcXVpcmVzIEdlbWluaSBBUEkgS2V5PC90ZXh0Pjwvc3ZnPg==';
  }

  private async generateAudioWithElevenLabs(pages: StoryPage[]): Promise<StoryPage[]> {
    console.log('🎤 Generating narration with ElevenLabs...');

    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY === 'your_elevenlabs_api_key_here') {
      console.log('ElevenLabs API key not configured, will use browser TTS');
      return pages;
    }

    const pagesWithAudio = [];
    
    for (const page of pages) {
      try {
        console.log(`🎵 Generating audio for page ${page.pageNumber}...`);
        
        // Enhanced narration text for better flow
        const narrativeText = this.enhanceNarrativeText(page.text);
        const audioUrl = await this.callElevenLabsAPI(narrativeText);
        
        pagesWithAudio.push({ 
          ...page, 
          audioUrl,
          narrationText: narrativeText
        });
        
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.warn(`Audio generation failed for page ${page.pageNumber}:`, error);
        pagesWithAudio.push({
          ...page,
          narrationText: page.text
        });
      }
    }

    return pagesWithAudio;
  }

  private enhanceNarrativeText(originalText: string): string {
    // Add natural pauses and emphasis for better narration
    return originalText
      .replace(/\./g, '... ') // Add pauses after sentences
      .replace(/!/g, '! ') // Add emphasis pauses
      .replace(/\?/g, '? ') // Add question pauses
      .replace(/,/g, ', ') // Small pauses for commas
      .trim();
  }

  private async callElevenLabsAPI(text: string): Promise<string> {
    try {
      // Using a child-friendly voice model
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.7, // More stable for children
            similarity_boost: 0.6,
            style: 0.2, // Less dramatic
            use_speaker_boost: true
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('✅ ElevenLabs audio generated');
        return audioUrl;
      } else {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    } catch (error) {
      console.warn('ElevenLabs API call failed:', error);
      throw error;
    }
  }

  private async generateBackgroundMusic(prompt: string): Promise<string | undefined> {
    console.log('🎼 Generating background music...');

    try {
      // Use royalty-free background music based on story themes
      const musicLibrary = {
        adventure: 'https://www.soundjay.com/misc/sounds-effects/bell-ringing-05.wav',
        friendship: 'https://www.soundjay.com/misc/sounds-effects/magical-chime-02.wav',
        learning: 'https://www.soundjay.com/misc/sounds-effects/page-flip-01.wav',
        magic: 'https://www.soundjay.com/misc/sounds-effects/magical-chime.wav',
        nature: 'https://www.soundjay.com/misc/sounds-effects/wind-chimes-01.wav',
        default: 'https://www.soundjay.com/misc/sounds-effects/fairy-tale.wav'
      };
      
      // Determine theme from prompt
      const theme = this.extractThemeFromPrompt(prompt.toLowerCase());
      const musicUrl = musicLibrary[theme] || musicLibrary.default;
      
      console.log(`🎵 Selected ${theme} music theme for story`);
      return musicUrl;
      
    } catch (error) {
      console.warn('Background music generation failed:', error);
      return undefined;
    }
  }

  private extractThemeFromPrompt(prompt: string): 'adventure' | 'friendship' | 'learning' | 'magic' | 'nature' {
    if (prompt.includes('adventure') || prompt.includes('quest') || prompt.includes('journey')) {
      return 'adventure';
    } else if (prompt.includes('friend') || prompt.includes('together') || prompt.includes('help')) {
      return 'friendship';
    } else if (prompt.includes('learn') || prompt.includes('school') || prompt.includes('teach')) {
      return 'learning';
    } else if (prompt.includes('magic') || prompt.includes('wizard') || prompt.includes('spell') || prompt.includes('fairy')) {
      return 'magic';
    } else if (prompt.includes('forest') || prompt.includes('animal') || prompt.includes('nature') || prompt.includes('tree')) {
      return 'nature';
    }
    return 'magic'; // Default to magic theme for children's stories
  }

  private async generateDemoStory(prompt: string): Promise<Story> {
    console.log('📖 Generating demo story...');
    
    // Enhanced demo story as fallback
    const demoPages: StoryPage[] = [
      {
        pageNumber: 1,
        text: `Once upon a time, in a magical realm filled with sparkling wonder, there lived a brave little adventurer who was about to discover the enchanting world of ${prompt}. The air shimmered with possibility, and magical creatures danced in the golden sunlight!`,
        imagePrompt: `A magical opening scene with a brave child character discovering ${prompt}, fantasy art style, colorful and whimsical`,
        hasChoice: false,
        imageUrl: this.getEnhancedDemoImage(0, prompt),
        narrationText: `Once upon a time, in a magical realm filled with sparkling wonder... there lived a brave little adventurer who was about to discover the enchanting world of ${prompt}. The air shimmered with possibility... and magical creatures danced in the golden sunlight!`
      },
      {
        pageNumber: 2,
        text: `Our hero's amazing journey with ${prompt} led to the most incredible discoveries! Everything around them glowed with rainbow magic, and they realized that with courage, kindness, and a believing heart, any dream could come true.`,
        imagePrompt: `The child character on an exciting magical adventure with ${prompt}, surrounded by rainbow magic and wonder`,
        hasChoice: false,
        imageUrl: this.getEnhancedDemoImage(1, prompt),
        narrationText: `Our hero's amazing journey with ${prompt} led to the most incredible discoveries! Everything around them glowed with rainbow magic... and they realized that with courage, kindness, and a believing heart... any dream could come true.`
      },
      {
        pageNumber: 3,
        text: `And so, the magical adventure of ${prompt} came to a wonderful, heartwarming end. Our brave little hero learned that the greatest magic of all comes from being kind to others, believing in yourself, and sharing joy with everyone around you. The End!`,
        imagePrompt: `A happy, heartwarming ending scene with the character and ${prompt}, celebration with magical sparkles and joy`,
        hasChoice: false,
        imageUrl: this.getEnhancedDemoImage(2, prompt),
        narrationText: `And so... the magical adventure of ${prompt} came to a wonderful, heartwarming end. Our brave little hero learned that the greatest magic of all comes from being kind to others... believing in yourself... and sharing joy with everyone around you. The End!`
      }
    ];

    // Generate background music for the story
    const backgroundMusicUrl = await this.generateBackgroundMusic(prompt);

    const story: Story = {
      id: Date.now().toString(),
      title: `The Magical Adventure of ${prompt}`,
      childPrompt: prompt,
      mainCharacter: {
        name: 'Brave Little Hero',
        appearance: 'A kind and curious child with sparkling eyes, wearing a magical cloak that shimmers with rainbow colors',
        personality: 'curious, brave, kind, and full of wonder',
        specialTraits: ['magical', 'adventurous', 'kind-hearted'],
        visualAnchors: ['rainbow-colored magical cloak', 'sparkling eyes', 'warm smile', 'child-like wonder']
      },
      pages: demoPages,
      backgroundMusicUrl,
      createdAt: new Date(),
      theme: 'adventure'
    };

    // Simulate enhanced API delay
    return new Promise(resolve => setTimeout(() => resolve(story), 3000));
  }
}

export const storyAPI = new StoryAPI();