import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const EmotionDetector = ({ audioData, onEmotionDetected, isActive = false }) => {
  const { 
    emotion,
    user,
    actions: { 
      setEmotionState, 
      trackEvent, 
      handleError 
    } 
  } = useVibeStore()
  
  const [detectionState, setDetectionState] = useState('idle') // idle, analyzing, detected, error
  const [currentAnalysis, setCurrentAnalysis] = useState(null)
  const [emotionHistory, setEmotionHistory] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [personalizedModel, setPersonalizedModel] = useState(null)
  
  const analysisIntervalRef = useRef(null)
  const audioBufferRef = useRef([])
  const modelCacheRef = useRef(new Map())
  
  // Emotion categories with enhanced detection
  const emotionCategories = {
    joy: {
      keywords: ['happy', 'excited', 'great', 'amazing', 'wonderful', 'fantastic', 'love', 'perfect'],
      audioFeatures: { minVolume: 0.4, minIntensity: 0.6, frequencyRange: [200, 800] },
      color: '#FFD700',
      musicStyle: { tempo: 'upbeat', key: 'C major', mood: 'bright' }
    },
    excitement: {
      keywords: ['excited', 'thrilled', 'pumped', 'energized', 'hyped', 'awesome', 'incredible'],
      audioFeatures: { minVolume: 0.6, minIntensity: 0.8, frequencyRange: [300, 1000] },
      color: '#FF6B35',
      musicStyle: { tempo: 'fast', key: 'D major', mood: 'energetic' }
    },
    calm: {
      keywords: ['calm', 'peaceful', 'relaxed', 'serene', 'quiet', 'gentle', 'soothing'],
      audioFeatures: { maxVolume: 0.3, maxIntensity: 0.4, frequencyRange: [100, 400] },
      color: '#87CEEB',
      musicStyle: { tempo: 'slow', key: 'F major', mood: 'peaceful' }
    },
    sadness: {
      keywords: ['sad', 'upset', 'disappointed', 'down', 'blue', 'melancholy', 'sorrowful'],
      audioFeatures: { maxVolume: 0.4, maxIntensity: 0.3, frequencyRange: [80, 300] },
      color: '#4682B4',
      musicStyle: { tempo: 'slow', key: 'D minor', mood: 'melancholy' }
    },
    anger: {
      keywords: ['angry', 'furious', 'mad', 'frustrated', 'irritated', 'annoyed', 'outraged'],
      audioFeatures: { minVolume: 0.5, minIntensity: 0.7, frequencyRange: [400, 1200] },
      color: '#DC143C',
      musicStyle: { tempo: 'aggressive', key: 'E minor', mood: 'intense' }
    },
    fear: {
      keywords: ['afraid', 'scared', 'nervous', 'anxious', 'worried', 'frightened', 'terrified'],
      audioFeatures: { variableVolume: true, minIntensity: 0.5, frequencyRange: [200, 600] },
      color: '#8B008B',
      musicStyle: { tempo: 'tense', key: 'F# minor', mood: 'suspenseful' }
    },
    surprise: {
      keywords: ['surprised', 'shocked', 'amazed', 'stunned', 'wow', 'incredible', 'unbelievable'],
      audioFeatures: { suddenVolume: true, minIntensity: 0.6, frequencyRange: [300, 900] },
      color: '#FFA500',
      musicStyle: { tempo: 'dynamic', key: 'G major', mood: 'dramatic' }
    },
    love: {
      keywords: ['love', 'adore', 'cherish', 'affection', 'heart', 'romantic', 'tender'],
      audioFeatures: { minVolume: 0.2, gentleIntensity: true, frequencyRange: [150, 500] },
      color: '#FF69B4',
      musicStyle: { tempo: 'gentle', key: 'Bb major', mood: 'romantic' }
    },
    hope: {
      keywords: ['hope', 'optimistic', 'positive', 'bright', 'future', 'dream', 'aspire'],
      audioFeatures: { risingTone: true, minIntensity: 0.4, frequencyRange: [250, 700] },
      color: '#32CD32',
      musicStyle: { tempo: 'moderate', key: 'G major', mood: 'uplifting' }
    },
    nostalgia: {
      keywords: ['remember', 'past', 'memory', 'nostalgic', 'used to', 'back then', 'miss'],
      audioFeatures: { softVolume: true, maxIntensity: 0.5, frequencyRange: [120, 400] },
      color: '#DDA0DD',
      musicStyle: { tempo: 'reflective', key: 'A minor', mood: 'wistful' }
    }
  }
  
  useEffect(() => {
    if (isActive) {
      startEmotionDetection()
      loadPersonalizedModel()
    } else {
      stopEmotionDetection()
    }
    
    return () => {
      stopEmotionDetection()
    }
  }, [isActive])
  
  const loadPersonalizedModel = () => {
    // Load user's emotion history and preferences for personalization
    const userEmotionHistory = user.profile?.emotionHistory || []
    const userPreferences = user.profile?.emotionPreferences || {}
    
    // Create personalized weights based on user history
    const personalizedWeights = {}
    Object.keys(emotionCategories).forEach(emotion => {
      const userFrequency = userEmotionHistory.filter(h => h.emotion === emotion).length
      const totalSessions = Math.max(userEmotionHistory.length, 1)
      personalizedWeights[emotion] = {
        baseWeight: userFrequency / totalSessions,
        preference: userPreferences[emotion] || 0.5,
        sensitivity: user.profile?.emotionSensitivity?.[emotion] || 0.5
      }
    })
    
    setPersonalizedModel(personalizedWeights)
  }
  
  const startEmotionDetection = () => {
    setDetectionState('analyzing')
    
    // Start periodic analysis
    analysisIntervalRef.current = setInterval(() => {
      if (audioData && audioData.features?.isVoicePresent) {
        analyzeEmotion(audioData)
      }
    }, 500) // Analyze every 500ms
    
    trackEvent('emotion_detection_started')
  }
  
  const stopEmotionDetection = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current)
    }
    setDetectionState('idle')
    setCurrentAnalysis(null)
  }
  
  const analyzeEmotion = (audioData) => {
    try {
      // Store audio data for analysis
      audioBufferRef.current.push({
        timestamp: Date.now(),
        ...audioData
      })
      
      // Keep only recent data (last 5 seconds)
      const fiveSecondsAgo = Date.now() - 5000
      audioBufferRef.current = audioBufferRef.current.filter(
        data => data.timestamp > fiveSecondsAgo
      )
      
      // Perform emotion analysis
      const emotionAnalysis = performEmotionAnalysis(audioBufferRef.current)
      
      if (emotionAnalysis.confidence > 0.6) {
        setCurrentAnalysis(emotionAnalysis)
        setConfidence(emotionAnalysis.confidence)
        
        // Update emotion history
        const newEmotionEntry = {
          emotion: emotionAnalysis.primaryEmotion,
          confidence: emotionAnalysis.confidence,
          timestamp: Date.now(),
          audioFeatures: audioData.metrics,
          secondaryEmotions: emotionAnalysis.secondaryEmotions
        }
        
        setEmotionHistory(prev => [...prev.slice(-19), newEmotionEntry]) // Keep last 20
        
        // Update global state
        setEmotionState({
          currentEmotions: emotionAnalysis.emotions,
          primaryEmotion: emotionAnalysis.primaryEmotion,
          confidence: emotionAnalysis.confidence,
          lastAnalysis: Date.now(),
          emotionHistory: emotionHistory
        })
        
        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected(emotionAnalysis)
        }
        
        setDetectionState('detected')
        
        trackEvent('emotion_detected', {
          emotion: emotionAnalysis.primaryEmotion,
          confidence: emotionAnalysis.confidence,
          audioFeatures: audioData.metrics
        })
      }
      
    } catch (error) {
      console.error('Emotion analysis error:', error)
      handleError(error, 'emotion_detection')
      setDetectionState('error')
    }
  }
  
  const performEmotionAnalysis = (audioBuffer) => {
    if (audioBuffer.length === 0) {
      return { emotions: {}, primaryEmotion: 'neutral', confidence: 0 }
    }
    
    // Extract features from audio buffer
    const features = extractAudioFeatures(audioBuffer)
    
    // Analyze text content if available (simulated for now)
    const textFeatures = extractTextFeatures(audioBuffer)
    
    // Calculate emotion scores
    const emotionScores = {}
    
    Object.entries(emotionCategories).forEach(([emotion, config]) => {
      let score = 0
      
      // Audio feature matching
      score += matchAudioFeatures(features, config.audioFeatures) * 0.7
      
      // Text feature matching (if available)
      score += matchTextFeatures(textFeatures, config.keywords) * 0.3
      
      // Apply personalization
      if (personalizedModel && personalizedModel[emotion]) {
        const personalization = personalizedModel[emotion]
        score *= (1 + personalization.preference * personalization.sensitivity)
      }
      
      emotionScores[emotion] = Math.min(score, 1.0)
    })
    
    // Find primary and secondary emotions
    const sortedEmotions = Object.entries(emotionScores)
      .sort(([,a], [,b]) => b - a)
      .filter(([,score]) => score > 0.1)
    
    const primaryEmotion = sortedEmotions[0]?.[0] || 'neutral'
    const primaryScore = sortedEmotions[0]?.[1] || 0
    
    const secondaryEmotions = sortedEmotions
      .slice(1, 3)
      .map(([emotion, score]) => ({ emotion, score }))
    
    // Calculate overall confidence
    const confidence = Math.min(primaryScore * 1.2, 1.0)
    
    // Create emotion distribution
    const emotions = Object.fromEntries(
      Object.entries(emotionScores).map(([emotion, score]) => [
        emotion, 
        Math.round(score * 100) / 100
      ])
    )
    
    return {
      emotions,
      primaryEmotion,
      secondaryEmotions,
      confidence,
      features,
      musicStyle: emotionCategories[primaryEmotion]?.musicStyle || { tempo: 'moderate', key: 'C major', mood: 'neutral' }
    }
  }
  
  const extractAudioFeatures = (audioBuffer) => {
    const recent = audioBuffer.slice(-10) // Last 10 samples
    
    const volumes = recent.map(data => data.metrics?.volume || 0)
    const intensities = recent.map(data => data.metrics?.emotionalIntensity || 0)
    const frequencies = recent.map(data => data.metrics?.frequency || 0)
    
    const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    const maxVolume = Math.max(...volumes)
    const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length
    const avgFrequency = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length
    
    // Detect volume changes (for surprise/sudden emotions)
    const volumeVariance = volumes.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / volumes.length
    
    // Detect frequency trends (rising/falling tone)
    const frequencyTrend = frequencies.length > 1 ? 
      frequencies[frequencies.length - 1] - frequencies[0] : 0
    
    return {
      avgVolume,
      maxVolume,
      avgIntensity,
      avgFrequency,
      volumeVariance,
      frequencyTrend,
      sampleCount: recent.length
    }
  }
  
  const extractTextFeatures = (audioBuffer) => {
    // In a real implementation, this would use speech-to-text
    // For now, return empty features
    return {
      words: [],
      sentimentScore: 0,
      keywordMatches: {}
    }
  }
  
  const matchAudioFeatures = (features, emotionFeatures) => {
    let score = 0
    const checks = []
    
    // Volume checks
    if (emotionFeatures.minVolume && features.avgVolume >= emotionFeatures.minVolume) {
      checks.push(0.3)
    }
    if (emotionFeatures.maxVolume && features.avgVolume <= emotionFeatures.maxVolume) {
      checks.push(0.3)
    }
    if (emotionFeatures.softVolume && features.avgVolume < 0.3) {
      checks.push(0.4)
    }
    
    // Intensity checks
    if (emotionFeatures.minIntensity && features.avgIntensity >= emotionFeatures.minIntensity) {
      checks.push(0.4)
    }
    if (emotionFeatures.maxIntensity && features.avgIntensity <= emotionFeatures.maxIntensity) {
      checks.push(0.4)
    }
    if (emotionFeatures.gentleIntensity && features.avgIntensity < 0.4) {
      checks.push(0.3)
    }
    
    // Special pattern checks
    if (emotionFeatures.suddenVolume && features.volumeVariance > 0.1) {
      checks.push(0.5)
    }
    if (emotionFeatures.variableVolume && features.volumeVariance > 0.05) {
      checks.push(0.3)
    }
    if (emotionFeatures.risingTone && features.frequencyTrend > 50) {
      checks.push(0.4)
    }
    
    // Frequency range checks
    if (emotionFeatures.frequencyRange) {
      const [min, max] = emotionFeatures.frequencyRange
      if (features.avgFrequency >= min && features.avgFrequency <= max) {
        checks.push(0.3)
      }
    }
    
    // Calculate weighted average
    score = checks.reduce((sum, check) => sum + check, 0) / Math.max(checks.length, 1)
    
    return Math.min(score, 1.0)
  }
  
  const matchTextFeatures = (textFeatures, keywords) => {
    // Simple keyword matching (would be more sophisticated in real implementation)
    const matchedKeywords = textFeatures.words.filter(word => 
      keywords.some(keyword => word.toLowerCase().includes(keyword.toLowerCase()))
    )
    
    return matchedKeywords.length > 0 ? 0.8 : 0
  }
  
  const getEmotionColor = (emotion) => {
    return emotionCategories[emotion]?.color || '#C0C0C0'
  }
  
  const getDetectionStateIcon = () => {
    switch (detectionState) {
      case 'analyzing': return '🧠'
      case 'detected': return '✨'
      case 'error': return '❌'
      default: return '⏸️'
    }
  }
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      {/* Detection Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{getDetectionStateIcon()}</div>
        <div>
          <h3 className="font-semibold text-white">Emotion Detection</h3>
          <p className={`text-sm capitalize ${
            detectionState === 'detected' ? 'text-green-400' :
            detectionState === 'analyzing' ? 'text-yellow-400' :
            detectionState === 'error' ? 'text-red-400' : 'text-gray-400'
          }`}>
            {detectionState.replace('-', ' ')}
          </p>
        </div>
        
        {detectionState === 'analyzing' && (
          <motion.div
            className="w-3 h-3 bg-yellow-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Current Emotion Analysis */}
      {currentAnalysis && detectionState === 'detected' && (
        <div className="space-y-4">
          {/* Primary Emotion */}
          <div className="flex items-center gap-4">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ backgroundColor: getEmotionColor(currentAnalysis.primaryEmotion) + '20' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {currentAnalysis.primaryEmotion === 'joy' ? '😊' :
               currentAnalysis.primaryEmotion === 'excitement' ? '🤩' :
               currentAnalysis.primaryEmotion === 'calm' ? '😌' :
               currentAnalysis.primaryEmotion === 'sadness' ? '😢' :
               currentAnalysis.primaryEmotion === 'anger' ? '😠' :
               currentAnalysis.primaryEmotion === 'fear' ? '😰' :
               currentAnalysis.primaryEmotion === 'surprise' ? '😲' :
               currentAnalysis.primaryEmotion === 'love' ? '🥰' :
               currentAnalysis.primaryEmotion === 'hope' ? '🌟' :
               currentAnalysis.primaryEmotion === 'nostalgia' ? '💭' : '😐'}
            </motion.div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white capitalize">
                {currentAnalysis.primaryEmotion}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Confidence:</span>
                <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getEmotionColor(currentAnalysis.primaryEmotion) }}
                    animate={{ width: `${confidence * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm text-white font-medium">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Secondary Emotions */}
          {currentAnalysis.secondaryEmotions.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-400">Also detected:</h5>
              <div className="flex gap-2 flex-wrap">
                {currentAnalysis.secondaryEmotions.map(({ emotion, score }) => (
                  <div
                    key={emotion}
                    className="px-3 py-1 rounded-full text-xs text-white"
                    style={{ backgroundColor: getEmotionColor(emotion) + '40' }}
                  >
                    {emotion} ({Math.round(score * 100)}%)
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Music Style Preview */}
          {currentAnalysis.musicStyle && (
            <div className="bg-purple-900/20 p-3 rounded-lg">
              <h5 className="text-sm font-medium text-purple-400 mb-2">Musical Style</h5>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Tempo:</span>
                  <p className="text-white capitalize">{currentAnalysis.musicStyle.tempo}</p>
                </div>
                <div>
                  <span className="text-gray-400">Key:</span>
                  <p className="text-white">{currentAnalysis.musicStyle.key}</p>
                </div>
                <div>
                  <span className="text-gray-400">Mood:</span>
                  <p className="text-white capitalize">{currentAnalysis.musicStyle.mood}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Error State */}
      {detectionState === 'error' && (
        <div className="text-center py-4">
          <p className="text-red-400 mb-2">Emotion detection failed</p>
          <motion.button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            onClick={startEmotionDetection}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </div>
      )}
      
      {/* Emotion History */}
      {emotionHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <h5 className="text-sm font-medium text-gray-400 mb-2">Recent Emotions</h5>
          <div className="flex gap-1 overflow-x-auto">
            {emotionHistory.slice(-10).map((entry, index) => (
              <motion.div
                key={index}
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: getEmotionColor(entry.emotion) }}
                title={`${entry.emotion} (${Math.round(entry.confidence * 100)}%)`}
                animate={{ scale: [0, 1] }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmotionDetector