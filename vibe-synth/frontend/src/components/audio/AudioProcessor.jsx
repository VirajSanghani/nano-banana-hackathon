import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const AudioProcessor = ({ onAudioData, isActive = false }) => {
  const { 
    audio,
    actions: { 
      setAudioState, 
      handleError, 
      trackEvent 
    } 
  } = useVibeStore()
  
  const [processingState, setProcessingState] = useState('idle') // idle, initializing, active, error
  const [audioMetrics, setAudioMetrics] = useState({
    volume: 0,
    frequency: 0,
    clarity: 0,
    emotionalIntensity: 0
  })
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const processorRef = useRef(null)
  const animationFrameRef = useRef(null)
  const streamRef = useRef(null)
  
  useEffect(() => {
    if (isActive && audio.hasPermission) {
      initializeAudioProcessing()
    } else {
      stopAudioProcessing()
    }
    
    return () => {
      stopAudioProcessing()
    }
  }, [isActive, audio.hasPermission])
  
  const initializeAudioProcessing = async () => {
    try {
      setProcessingState('initializing')
      
      // Use existing audio context if available, otherwise create new
      const audioContext = audio.audioContext || new (window.AudioContext || window.webkitAudioContext)()
      const stream = audio.stream || await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      })
      
      audioContextRef.current = audioContext
      streamRef.current = stream
      
      // Create analyser node
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3
      analyserRef.current = analyser
      
      // Create source node
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      // Create script processor for real-time analysis
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      analyser.connect(processor)
      processor.connect(audioContext.destination)
      processorRef.current = processor
      
      // Set up real-time audio processing
      processor.onaudioprocess = (event) => {
        if (!isActive) return
        
        const inputBuffer = event.inputBuffer.getChannelData(0)
        const audioData = processAudioBuffer(inputBuffer)
        
        // Update metrics
        setAudioMetrics(audioData.metrics)
        
        // Send processed data to parent component
        if (onAudioData) {
          onAudioData(audioData)
        }
      }
      
      // Update store with audio processing info
      setAudioState({
        audioContext,
        analyser,
        stream,
        isProcessing: true,
        processingQuality: 'high'
      })
      
      setProcessingState('active')
      trackEvent('audio_processing_started')
      
    } catch (error) {
      console.error('Audio processing initialization failed:', error)
      handleError(error, 'audio_processing_init')
      setProcessingState('error')
    }
  }
  
  const processAudioBuffer = (audioBuffer) => {
    const bufferLength = analyserRef.current.frequencyBinCount
    const frequencyData = new Uint8Array(bufferLength)
    const timeDomainData = new Uint8Array(bufferLength)
    
    analyserRef.current.getByteFrequencyData(frequencyData)
    analyserRef.current.getByteTimeDomainData(timeDomainData)
    
    // Calculate volume (RMS)
    let sum = 0
    for (let i = 0; i < audioBuffer.length; i++) {
      sum += audioBuffer[i] * audioBuffer[i]
    }
    const volume = Math.sqrt(sum / audioBuffer.length)
    
    // Calculate dominant frequency
    let maxMagnitude = 0
    let dominantFrequency = 0
    const sampleRate = audioContextRef.current.sampleRate
    
    for (let i = 1; i < bufferLength / 4; i++) { // Focus on lower frequencies
      if (frequencyData[i] > maxMagnitude) {
        maxMagnitude = frequencyData[i]
        dominantFrequency = (i * sampleRate) / (bufferLength * 2)
      }
    }
    
    // Calculate spectral centroid (brightness)
    let weightedFreqSum = 0
    let magnitudeSum = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i * sampleRate) / (bufferLength * 2)
      const magnitude = frequencyData[i]
      weightedFreqSum += frequency * magnitude
      magnitudeSum += magnitude
    }
    
    const spectralCentroid = magnitudeSum > 0 ? weightedFreqSum / magnitudeSum : 0
    
    // Calculate zero crossing rate (voice quality indicator)
    let zeroCrossings = 0
    for (let i = 1; i < timeDomainData.length; i++) {
      if ((timeDomainData[i - 1] - 128) * (timeDomainData[i] - 128) < 0) {
        zeroCrossings++
      }
    }
    const zeroCrossingRate = zeroCrossings / timeDomainData.length
    
    // Calculate emotional intensity based on multiple factors
    const volumeIntensity = Math.min(volume * 10, 1) // Normalize volume
    const frequencySpread = spectralCentroid / 4000 // Normalize frequency spread
    const vocalActivity = zeroCrossingRate * 10 // Voice activity indicator
    
    const emotionalIntensity = (volumeIntensity + frequencySpread + vocalActivity) / 3
    
    // Calculate clarity score
    const signalToNoise = maxMagnitude / (magnitudeSum / bufferLength + 1)
    const clarity = Math.min(signalToNoise / 5, 1)
    
    return {
      timestamp: Date.now(),
      rawAudio: audioBuffer,
      frequencies: Array.from(frequencyData),
      timeDomain: Array.from(timeDomainData),
      metrics: {
        volume: Math.min(volume * 5, 1), // Normalize and scale
        frequency: dominantFrequency,
        clarity: clarity,
        emotionalIntensity: Math.min(emotionalIntensity, 1),
        spectralCentroid,
        zeroCrossingRate,
        signalToNoise
      },
      features: {
        isVoicePresent: volume > 0.01 && zeroCrossingRate > 0.01,
        isSpeaking: volume > 0.05 && zeroCrossingRate > 0.02,
        voiceQuality: clarity > 0.3 ? 'good' : clarity > 0.15 ? 'fair' : 'poor',
        emotionalState: categorizeEmotion(emotionalIntensity, spectralCentroid, dominantFrequency)
      }
    }
  }
  
  const categorizeEmotion = (intensity, centroid, frequency) => {
    // Simple emotion categorization based on audio features
    if (intensity > 0.7) {
      return centroid > 2000 ? 'excited' : 'energetic'
    } else if (intensity > 0.4) {
      return frequency > 200 ? 'happy' : 'content'
    } else if (intensity > 0.2) {
      return centroid < 1000 ? 'calm' : 'neutral'
    } else {
      return 'peaceful'
    }
  }
  
  const stopAudioProcessing = () => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    setProcessingState('idle')
    setAudioMetrics({ volume: 0, frequency: 0, clarity: 0, emotionalIntensity: 0 })
    
    setAudioState({
      isProcessing: false
    })
  }
  
  const getProcessingStatusColor = () => {
    switch (processingState) {
      case 'active': return 'text-green-400'
      case 'initializing': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }
  
  const getProcessingStatusIcon = () => {
    switch (processingState) {
      case 'active': return '🎵'
      case 'initializing': return '⏳'
      case 'error': return '❌'
      default: return '⏸️'
    }
  }
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
      {/* Processing Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{getProcessingStatusIcon()}</div>
        <div>
          <h3 className="font-semibold text-white">Audio Processing</h3>
          <p className={`text-sm capitalize ${getProcessingStatusColor()}`}>
            {processingState.replace('-', ' ')}
          </p>
        </div>
        
        {processingState === 'active' && (
          <motion.div
            className="w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      
      {/* Audio Metrics */}
      {processingState === 'active' && (
        <div className="grid grid-cols-2 gap-4">
          {/* Volume Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Volume</span>
              <span className="text-white">{Math.round(audioMetrics.volume * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
                animate={{ width: `${audioMetrics.volume * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
          
          {/* Clarity Meter */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Clarity</span>
              <span className="text-white">{Math.round(audioMetrics.clarity * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                animate={{ width: `${audioMetrics.clarity * 100}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
          
          {/* Frequency Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Frequency</span>
              <span className="text-white">{Math.round(audioMetrics.frequency)}Hz</span>
            </div>
          </div>
          
          {/* Emotional Intensity */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Intensity</span>
              <span className="text-white">{Math.round(audioMetrics.emotionalIntensity * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                animate={{ width: `${audioMetrics.emotionalIntensity * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {processingState === 'error' && (
        <div className="text-center py-4">
          <p className="text-red-400 mb-2">Audio processing failed</p>
          <motion.button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            onClick={initializeAudioProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </div>
      )}
    </div>
  )
}

export default AudioProcessor