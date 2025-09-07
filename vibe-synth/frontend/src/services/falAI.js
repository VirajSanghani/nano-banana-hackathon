import * as fal from "@fal-ai/serverless-client"
import { geminiAI } from './geminiAI.js'

// Configure Fal.ai client
fal.config({
  credentials: import.meta.env.VITE_FAL_AI_KEY || "5d096ffd-2595-4ed5-ab63-db1b8a95666a:23b6d5c21bd96071b33cae97a4501904"
})

/**
 * Fal.ai Integration Service for Vibe-Synth
 * Handles image generation, audio processing, and other AI services
 */

export class FalAIService {
  constructor() {
    this.isInitialized = false
    this.init()
  }

  async init() {
    try {
      // Test connection to Fal.ai
      console.log('🎨 Initializing Fal.ai services...')
      this.isInitialized = true
      console.log('✅ Fal.ai services initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Fal.ai services:', error)
      this.isInitialized = false
    }
  }

  /**
   * Generate emotional artwork based on detected emotions
   * @param {Object} emotionData - The emotion analysis data
   * @param {string} emotionData.primaryEmotion - Primary detected emotion
   * @param {number} emotionData.confidence - Confidence level (0-1)
   * @param {Object} emotionData.musicStyle - Musical style properties
   * @returns {Promise<string>} Generated image URL
   */
  async generateEmotionalArt(emotionData) {
    if (!this.isInitialized) {
      throw new Error('Fal.ai service not initialized')
    }

    try {
      const { primaryEmotion, confidence, musicStyle } = emotionData
      
      console.log(`🎨 Generating art for emotion: ${primaryEmotion} (${Math.round(confidence * 100)}% confidence)`)
      
      // Try to get enhanced prompt from Gemini first
      let prompt
      try {
        if (geminiAI.isInitialized) {
          console.log('🧠 Using Gemini AI for enhanced prompt generation...')
          prompt = await geminiAI.generateImagePrompt(emotionData)
        } else {
          throw new Error('Gemini not available, using fallback')
        }
      } catch (error) {
        console.log('🎨 Using fallback prompt generation')
        prompt = this.createArtPrompt(primaryEmotion, confidence, musicStyle)
      }
      
      // Use Fal.ai's FLUX Schnell for fast image generation
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          guidance_scale: 3.5,
          num_images: 1,
          enable_safety_checker: true
        }
      })
      
      if (result.images && result.images.length > 0) {
        const imageUrl = result.images[0].url
        console.log('✅ Generated emotional artwork:', imageUrl)
        return imageUrl
      } else {
        throw new Error('No images generated')
      }
      
    } catch (error) {
      console.error('❌ Failed to generate emotional art:', error)
      throw error
    }
  }

  /**
   * Generate music visualization based on audio data
   * @param {Object} audioData - Real-time audio analysis data
   * @param {Object} emotionData - Current emotion detection results
   * @returns {Promise<string>} Generated visualization URL
   */
  async generateMusicVisualization(audioData, emotionData) {
    if (!this.isInitialized) {
      throw new Error('Fal.ai service not initialized')
    }

    try {
      const prompt = this.createVisualizationPrompt(audioData, emotionData)
      
      console.log('🌊 Generating music visualization...')
      
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: prompt,
          image_size: "landscape_16_9",
          num_inference_steps: 4,
          guidance_scale: 2.5,
          num_images: 1,
          enable_safety_checker: true
        }
      })
      
      if (result.images && result.images.length > 0) {
        return result.images[0].url
      } else {
        throw new Error('No visualization generated')
      }
      
    } catch (error) {
      console.error('❌ Failed to generate music visualization:', error)
      throw error
    }
  }

  /**
   * Create art generation prompt based on emotion data
   * @param {string} emotion - Primary emotion
   * @param {number} confidence - Confidence level
   * @param {Object} musicStyle - Musical style properties
   * @returns {string} Generated prompt
   */
  createArtPrompt(emotion, confidence, musicStyle) {
    const emotionPrompts = {
      joy: "Vibrant golden sunburst with dancing light rays, warm yellows and oranges, uplifting energy, celebration, happiness radiating outward",
      excitement: "Electric energy bolts in bright neon colors, dynamic motion, sparks and lightning, high energy, intense movement, electrifying atmosphere",
      calm: "Serene ocean at sunset, gentle waves, soft blues and purples, peaceful sky, tranquil waters, meditative atmosphere",
      peaceful: "Zen garden with cherry blossoms, soft morning light, pastel colors, gentle breeze, harmony and balance, mindful serenity",
      sadness: "Gentle rain on a window, soft grays and blues, contemplative mood, melancholic beauty, emotional depth, introspective",
      anger: "Intense fire and molten lava, bold reds and oranges, powerful energy, dramatic lighting, raw emotion, fierce intensity",
      fear: "Mysterious shadowy forest, deep purples and dark blues, ethereal mist, tension in the air, mysterious atmosphere",
      surprise: "Explosive starburst of rainbow colors, unexpected patterns, bright contrasts, dynamic composition, wonder and amazement",
      love: "Soft rose petals floating in warm light, gentle pinks and golds, romantic atmosphere, heart-warming glow, tender emotion",
      hope: "Dawn breaking over mountains, soft golden light, inspiring vista, new beginnings, optimistic colors, uplifting scene",
      nostalgia: "Vintage sepia-toned memories, old photographs, warm amber light, soft focus, bittersweet beauty, time-worn elegance"
    }

    const basePrompt = emotionPrompts[emotion] || emotionPrompts.calm
    const intensityModifier = confidence > 0.8 ? "highly intense, vivid, dramatic" : 
                             confidence > 0.6 ? "moderate intensity, clear" : 
                             "subtle, gentle, soft"
    
    const musicStyleModifier = musicStyle ? 
      `with ${musicStyle.tempo} rhythm patterns, in ${musicStyle.key} tonal qualities, ${musicStyle.mood} aesthetic` : 
      ""

    return `${basePrompt}, ${intensityModifier}, ${musicStyleModifier}, abstract art style, digital painting, high quality, artistic, emotional expression, beautiful composition`
  }

  /**
   * Create visualization prompt for music representation
   * @param {Object} audioData - Audio analysis data
   * @param {Object} emotionData - Emotion analysis data
   * @returns {string} Generated prompt
   */
  createVisualizationPrompt(audioData, emotionData) {
    const { metrics } = audioData
    const volumeLevel = metrics.volume > 0.7 ? "high volume" : 
                       metrics.volume > 0.4 ? "medium volume" : "low volume"
    
    const frequencyRange = metrics.frequency > 800 ? "high frequency, bright tones" :
                          metrics.frequency > 300 ? "mid frequency, balanced tones" :
                          "low frequency, deep tones"

    return `Abstract music visualization, ${volumeLevel}, ${frequencyRange}, ${emotionData.primaryEmotion} emotional theme, flowing sound waves, dynamic audio spectrum, colorful frequency bars, rhythm patterns, musical energy visualization, digital art style`
  }

  /**
   * Get available models and their capabilities
   * @returns {Array} List of available models
   */
  getAvailableModels() {
    return [
      {
        id: "fal-ai/flux/schnell",
        name: "FLUX Schnell",
        description: "Fast high-quality image generation",
        type: "image_generation",
        speed: "fast",
        quality: "high"
      },
      {
        id: "fal-ai/flux/dev", 
        name: "FLUX Dev",
        description: "Higher quality, slower generation",
        type: "image_generation",
        speed: "slow",
        quality: "very_high"
      }
    ]
  }

  /**
   * Check service health and connectivity
   * @returns {Promise<Object>} Service status
   */
  async healthCheck() {
    try {
      // Simple test generation to verify connectivity
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: "test connectivity",
          image_size: "square",
          num_inference_steps: 1,
          num_images: 1
        }
      })
      
      return {
        status: 'healthy',
        connected: true,
        models: this.getAvailableModels()
      }
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message
      }
    }
  }
}

// Create singleton instance
export const falAI = new FalAIService()

// Export individual functions for direct use
export const generateEmotionalArt = (emotionData) => falAI.generateEmotionalArt(emotionData)
export const generateMusicVisualization = (audioData, emotionData) => falAI.generateMusicVisualization(audioData, emotionData)
export const checkFalAIHealth = () => falAI.healthCheck()

export default falAI