/**
 * ElevenLabs Voice AI Integration Service for Vibe-Synth
 * Handles voice synthesis, audio processing, and voice analysis
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1'

export class ElevenLabsService {
  constructor() {
    this.isInitialized = false
    this.availableVoices = []
    this.init()
  }

  async init() {
    try {
      console.log('🎤 Initializing ElevenLabs voice services...')
      
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured')
      }
      
      // Load available voices
      await this.loadVoices()
      
      this.isInitialized = true
      console.log('✅ ElevenLabs voice services initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize ElevenLabs services:', error)
      this.isInitialized = false
    }
  }

  /**
   * Load available voices from ElevenLabs
   */
  async loadVoices() {
    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      })

      if (response.ok) {
        const data = await response.json()
        this.availableVoices = data.voices || []
        console.log(`🎤 Loaded ${this.availableVoices.length} available voices`)
      }
    } catch (error) {
      console.warn('Could not load voices, using fallback')
      this.availableVoices = []
    }
  }

  /**
   * Analyze voice characteristics and detect emotion
   * @param {AudioBuffer} audioBuffer - Audio data to analyze
   * @returns {Promise<Object>} Voice analysis results
   */
  async analyzeVoice(audioBuffer) {
    if (!this.isInitialized) {
      throw new Error('ElevenLabs service not initialized')
    }

    try {
      console.log('🎤 Analyzing voice characteristics...')
      
      // Convert AudioBuffer to audio data format for analysis
      const audioData = this.audioBufferToWav(audioBuffer)
      
      // Note: ElevenLabs doesn't have a direct voice analysis endpoint
      // We'll implement client-side analysis for basic characteristics
      const analysis = this.analyzeAudioCharacteristics(audioBuffer)
      
      console.log('✅ Voice analysis complete:', analysis)
      return analysis
      
    } catch (error) {
      console.error('❌ Failed to analyze voice:', error)
      
      // Return fallback analysis
      return this.createFallbackVoiceAnalysis()
    }
  }

  /**
   * Analyze audio characteristics client-side
   * @param {AudioBuffer} audioBuffer - Audio buffer to analyze
   * @returns {Object} Voice characteristics
   */
  analyzeAudioCharacteristics(audioBuffer) {
    try {
      const channelData = audioBuffer.getChannelData(0)
      const sampleRate = audioBuffer.sampleRate
      
      // Calculate basic audio characteristics
      let totalEnergy = 0
      let maxAmplitude = 0
      let zeroCrossings = 0
      
      for (let i = 0; i < channelData.length; i++) {
        const sample = channelData[i]
        totalEnergy += sample * sample
        maxAmplitude = Math.max(maxAmplitude, Math.abs(sample))
        
        if (i > 0 && Math.sign(channelData[i-1]) !== Math.sign(sample)) {
          zeroCrossings++
        }
      }
      
      const rms = Math.sqrt(totalEnergy / channelData.length)
      const averageFrequency = (zeroCrossings * sampleRate) / (2 * channelData.length)
      
      // Estimate emotional characteristics based on audio features
      const volume = rms
      const energy = maxAmplitude
      const pitch = averageFrequency
      
      // Simple emotion detection based on audio characteristics
      let primaryEmotion = 'calm'
      let confidence = 0.6
      
      if (energy > 0.7 && pitch > 200) {
        primaryEmotion = 'excitement'
        confidence = 0.8
      } else if (energy > 0.5 && pitch > 150) {
        primaryEmotion = 'joy'
        confidence = 0.7
      } else if (energy < 0.2 && pitch < 100) {
        primaryEmotion = 'sadness'
        confidence = 0.6
      } else if (energy > 0.6 && pitch < 120) {
        primaryEmotion = 'anger'
        confidence = 0.7
      }
      
      return {
        primaryEmotion,
        confidence,
        voiceCharacteristics: {
          volume: Math.min(1.0, volume * 10),
          energy: Math.min(1.0, energy),
          pitch: Math.min(500, pitch),
          clarity: Math.min(1.0, 1.0 - (zeroCrossings / channelData.length * 1000))
        },
        audioMetrics: {
          rms,
          maxAmplitude,
          averageFrequency,
          duration: audioBuffer.duration
        }
      }
      
    } catch (error) {
      console.error('Failed to analyze audio characteristics:', error)
      return this.createFallbackVoiceAnalysis()
    }
  }

  /**
   * Generate emotional narration using ElevenLabs TTS
   * @param {Object} emotionData - Emotion data to narrate
   * @param {string} voiceId - Voice ID to use (optional)
   * @returns {Promise<Blob>} Generated audio blob
   */
  async generateEmotionalNarration(emotionData, voiceId = null) {
    if (!this.isInitialized) {
      throw new Error('ElevenLabs service not initialized')
    }

    try {
      const { primaryEmotion, confidence } = emotionData
      
      // Select appropriate voice
      const selectedVoice = voiceId || this.selectVoiceForEmotion(primaryEmotion)
      
      // Create emotional narration text
      const narrationText = this.createNarrationText(emotionData)
      
      console.log(`🎤 Generating emotional narration: ${primaryEmotion}`)
      
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: narrationText,
          model_id: 'eleven_flash_v2_5', // Fast, low-latency model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: this.getStyleForEmotion(primaryEmotion),
            use_speaker_boost: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      console.log('✅ Generated emotional narration audio')
      
      return audioBlob
      
    } catch (error) {
      console.error('❌ Failed to generate emotional narration:', error)
      throw error
    }
  }

  /**
   * Select appropriate voice for emotion
   * @param {string} emotion - Target emotion
   * @returns {string} Voice ID
   */
  selectVoiceForEmotion(emotion) {
    // Default voice IDs (these are common ElevenLabs voice IDs)
    const emotionVoices = {
      joy: 'EXAVITQu4vr4xnSDxMaL', // Bella - cheerful
      excitement: 'ErXwobaYiN019PkySvjV', // Antoni - energetic
      calm: 'MF3mGyEYCl7XYWbV9V6O', // Elli - gentle
      peaceful: 'oWAxZDx7w5VEj9dCyTzz', // Grace - soothing
      sadness: 'TxGEqnHWrfWFTfGW9XjX', // Josh - deeper, warmer
      love: 'XrExE9yKIg1WjnnlVkGX', // Matilda - warm
      anger: '29vD33N1CtxCmqQRPOHJ', // Drew - stronger
      hope: 'flq6f7yk4E4fJM5XTYuZ'  // Michael - inspiring
    }
    
    return emotionVoices[emotion] || emotionVoices.calm
  }

  /**
   * Get voice style settings for emotion
   * @param {string} emotion - Target emotion
   * @returns {number} Style value (0-1)
   */
  getStyleForEmotion(emotion) {
    const emotionStyles = {
      joy: 0.8,
      excitement: 0.9,
      calm: 0.2,
      peaceful: 0.1,
      sadness: 0.3,
      love: 0.6,
      anger: 0.7,
      hope: 0.5
    }
    
    return emotionStyles[emotion] || 0.5
  }

  /**
   * Create narration text for emotion data
   * @param {Object} emotionData - Emotion analysis data
   * @returns {string} Narration text
   */
  createNarrationText(emotionData) {
    const { primaryEmotion, confidence, musicStyle } = emotionData
    
    const emotionDescriptions = {
      joy: "Your voice radiates with pure happiness and vibrant energy",
      excitement: "There's an electric energy in your voice, full of anticipation and thrill",
      calm: "Your voice flows with serene tranquility and peaceful harmony",
      peaceful: "A gentle serenity emanates from your voice, like a quiet morning",
      sadness: "Your voice carries a beautiful melancholy, deep and contemplative",
      love: "Warmth and tenderness flow through your voice like a gentle embrace",
      anger: "Your voice pulses with intense energy and powerful determination", 
      hope: "Your voice lifts with inspiring optimism and bright possibility",
      fear: "There's a delicate vulnerability in your voice, seeking comfort",
      surprise: "Your voice sparkles with wonder and delightful amazement",
      nostalgia: "Your voice carries the bittersweet beauty of cherished memories"
    }
    
    const description = emotionDescriptions[primaryEmotion] || "Your voice carries unique emotional depth"
    const confidenceText = confidence > 0.8 ? "with remarkable clarity" : 
                          confidence > 0.6 ? "with beautiful expression" : 
                          "with subtle nuance"
    
    return `${description} ${confidenceText}. This becomes your musical signature.`
  }

  /**
   * Convert AudioBuffer to WAV format
   * @param {AudioBuffer} audioBuffer - Audio buffer to convert
   * @returns {Uint8Array} WAV audio data
   */
  audioBufferToWav(audioBuffer) {
    try {
      const length = audioBuffer.length
      const sampleRate = audioBuffer.sampleRate
      const channels = audioBuffer.numberOfChannels
      
      const arrayBuffer = new ArrayBuffer(44 + length * channels * 2)
      const view = new DataView(arrayBuffer)
      
      // WAV header
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + length * channels * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, channels, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * channels * 2, true)
      view.setUint16(32, channels * 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, length * channels * 2, true)
      
      // Audio data
      let offset = 44
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < channels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
          offset += 2
        }
      }
      
      return new Uint8Array(arrayBuffer)
    } catch (error) {
      console.error('Failed to convert audio buffer to WAV:', error)
      return new Uint8Array()
    }
  }

  /**
   * Create fallback voice analysis
   * @returns {Object} Basic voice analysis
   */
  createFallbackVoiceAnalysis() {
    return {
      primaryEmotion: 'calm',
      confidence: 0.5,
      voiceCharacteristics: {
        volume: 0.5,
        energy: 0.5,
        pitch: 150,
        clarity: 0.7
      },
      audioMetrics: {
        rms: 0.1,
        maxAmplitude: 0.3,
        averageFrequency: 150,
        duration: 1.0
      }
    }
  }

  /**
   * Check service health and connectivity
   * @returns {Promise<Object>} Service status
   */
  async healthCheck() {
    try {
      if (!ELEVENLABS_API_KEY) {
        return {
          status: 'error',
          connected: false,
          error: 'API key not configured'
        }
      }

      // Test API connectivity
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY
        }
      })

      if (response.ok) {
        return {
          status: 'healthy',
          connected: true,
          service: 'ElevenLabs Voice AI',
          voicesAvailable: this.availableVoices.length
        }
      } else {
        return {
          status: 'error',
          connected: false,
          error: `HTTP ${response.status}`
        }
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
export const elevenLabs = new ElevenLabsService()

// Export individual functions for direct use  
export const analyzeVoice = (audioBuffer) => elevenLabs.analyzeVoice(audioBuffer)
export const generateEmotionalNarration = (emotionData, voiceId) => elevenLabs.generateEmotionalNarration(emotionData, voiceId)
export const checkElevenLabsHealth = () => elevenLabs.healthCheck()

export default elevenLabs