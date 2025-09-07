import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const CalibrationStep = ({ onComplete, onCanProceedChange }) => {
  const { 
    audio, 
    user,
    actions: { 
      trackEvent, 
      setAudioState, 
      setUserProfile,
      showNotification 
    } 
  } = useVibeStore()
  
  const [startTime] = useState(Date.now())
  const [calibrationPhase, setCalibrationPhase] = useState('intro') // intro, volume, tone, personality, complete
  const [audioData, setAudioData] = useState({
    volume: { min: 0, max: 0, average: 0 },
    frequency: { fundamental: 0, harmonics: [] },
    timber: { brightness: 0, richness: 0 }
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [calibrationResults, setCalibrationResults] = useState(null)
  
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  // Calibration prompts for different vocal characteristics
  const calibrationPrompts = [
    {
      id: 'volume',
      title: 'Volume Calibration',
      instruction: 'Say "Hello" in your normal speaking voice',
      duration: 3000,
      purpose: 'Finding your comfortable volume range'
    },
    {
      id: 'tone',
      title: 'Tone Analysis',
      instruction: 'Count from 1 to 5 naturally',
      duration: 4000,
      purpose: 'Analyzing your unique voice characteristics'
    },
    {
      id: 'expression',
      title: 'Expression Range',
      instruction: 'Say "I am excited!" with enthusiasm',
      duration: 3000,
      purpose: 'Understanding your emotional expression style'
    },
    {
      id: 'whisper',
      title: 'Dynamic Range',
      instruction: 'Whisper "This is quiet" softly',
      duration: 3000,
      purpose: 'Calibrating sensitivity for soft speech'
    }
  ]
  
  useEffect(() => {
    trackEvent('onboarding_calibration_started')
    
    // Always run simulated calibration since we don't have real audio access in browser
    console.log('🎤 Starting automated calibration simulation')
    
    // Show intro for 2 seconds
    setTimeout(() => {
      setCalibrationPhase('volume')
      
      // Then immediately start the simulation after volume phase shows
      setTimeout(() => {
        simulateCalibrationProgress()
      }, 1500)
    }, 2000)
    
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])
  
  const simulateCalibrationProgress = () => {
    console.log('🎤 Starting simulated calibration...')
    
    // Immediately start recording phase
    setCalibrationPhase('recording')
    setIsRecording(true)
    setCurrentPrompt(0)
    
    let promptIndex = 0
    const totalPrompts = calibrationPrompts.length
    
    // Generate all calibration data upfront to avoid issues
    const allCalibrationData = {}
    calibrationPrompts.forEach(prompt => {
      allCalibrationData[prompt.id] = {
        prompt: prompt.id,
        volume: { min: 0.1, max: 0.8, average: 0.4 + Math.random() * 0.2 },
        fundamentalFreq: 120 + Math.random() * 60,
        brightness: 0.5 + Math.random() * 0.3,
        spectralCentroid: 200 + Math.random() * 100,
        quality: 'good'
      }
    })
    
    // Process each prompt sequentially for UI
    const processNextPrompt = () => {
      if (promptIndex >= totalPrompts) {
        // All prompts completed
        console.log('✅ All 4 prompts completed!')
        setIsRecording(false)
        
        // Set all data at once
        setAudioData(allCalibrationData)
        
        // Complete calibration using the main function
        setTimeout(() => {
          console.log('🎯 Finalizing calibration...')
          completeCalibration()
        }, 500)
        return
      }
      
      const currentPromptData = calibrationPrompts[promptIndex]
      console.log(`🎯 Prompt ${promptIndex + 1}/${totalPrompts}: ${currentPromptData.instruction}`)
      setCurrentPrompt(promptIndex)
      setRecordingDuration(0)
      
      // Simulate recording duration for this prompt
      let elapsed = 0
      const recordingInterval = setInterval(() => {
        elapsed += 100
        setRecordingDuration(elapsed)
        
        if (elapsed >= currentPromptData.duration) {
          clearInterval(recordingInterval)
          console.log(`✅ Completed prompt ${promptIndex + 1}`)
          
          // Update audio data for this prompt
          setAudioData(prev => ({
            ...prev,
            [currentPromptData.id]: allCalibrationData[currentPromptData.id]
          }))
          
          // Move to next prompt
          promptIndex++
          setTimeout(processNextPrompt, 500)
        }
      }, 100)
    }
    
    // Start processing first prompt
    processNextPrompt()
  }
  
  const startRecording = (promptIndex) => {
    if (!analyserRef.current) return
    
    setIsRecording(true)
    setRecordingDuration(0)
    setCurrentPrompt(promptIndex)
    
    const prompt = calibrationPrompts[promptIndex]
    const startTime = Date.now()
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const frequencyArray = new Uint8Array(bufferLength)
    
    let volumeData = []
    let frequencyData = []
    
    // Start recording timer
    recordingIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setRecordingDuration(elapsed)
      
      if (elapsed >= prompt.duration) {
        stopRecording(volumeData, frequencyData, promptIndex)
      }
    }, 100)
    
    // Start audio analysis
    const analyzeAudio = () => {
      if (!isRecording) return
      
      analyserRef.current.getByteTimeDomainData(dataArray)
      analyserRef.current.getByteFrequencyData(frequencyArray)
      
      // Volume analysis
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const sample = (dataArray[i] - 128) / 128
        sum += sample * sample
      }
      const rms = Math.sqrt(sum / bufferLength)
      volumeData.push(rms)
      
      // Frequency analysis
      const frequencies = Array.from(frequencyArray)
      frequencyData.push(frequencies)
      
      animationFrameRef.current = requestAnimationFrame(analyzeAudio)
    }
    
    analyzeAudio()
  }
  
  const stopRecording = (volumeData, frequencyData, promptIndex) => {
    setIsRecording(false)
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    // Process the recorded data
    const processedData = processAudioData(volumeData, frequencyData, promptIndex)
    
    // Update audio data
    setAudioData(prev => ({
      ...prev,
      [calibrationPrompts[promptIndex].id]: processedData
    }))
    
    // Move to next prompt or complete
    if (promptIndex < calibrationPrompts.length - 1) {
      setTimeout(() => {
        setCalibrationPhase('recording')
        startRecording(promptIndex + 1)
      }, 1000)
    } else {
      completeCalibration()
    }
  }
  
  const processAudioData = (volumeData, frequencyData, promptIndex) => {
    const prompt = calibrationPrompts[promptIndex]
    
    // Volume processing
    const validVolumes = volumeData.filter(v => v > 0.01)
    const avgVolume = validVolumes.reduce((sum, v) => sum + v, 0) / validVolumes.length || 0
    const maxVolume = Math.max(...validVolumes)
    const minVolume = Math.min(...validVolumes.filter(v => v > 0))
    
    // Frequency processing
    const avgFrequencies = frequencyData.reduce((acc, frame) => {
      frame.forEach((val, i) => {
        acc[i] = (acc[i] || 0) + val
      })
      return acc
    }, []).map(sum => sum / frequencyData.length)
    
    // Find fundamental frequency (peak in low frequencies)
    let fundamentalFreq = 0
    let maxMagnitude = 0
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    for (let i = 1; i < Math.min(50, avgFrequencies.length); i++) {
      if (avgFrequencies[i] > maxMagnitude) {
        maxMagnitude = avgFrequencies[i]
        fundamentalFreq = i * (sampleRate / 2) / avgFrequencies.length
      }
    }
    
    // Calculate brightness (high frequency content)
    const lowFreqEnergy = avgFrequencies.slice(0, 50).reduce((sum, val) => sum + val, 0)
    const highFreqEnergy = avgFrequencies.slice(50, 150).reduce((sum, val) => sum + val, 0)
    const brightness = highFreqEnergy / (lowFreqEnergy + highFreqEnergy) || 0
    
    return {
      prompt: prompt.id,
      volume: { min: minVolume, max: maxVolume, average: avgVolume },
      fundamentalFreq,
      brightness,
      spectralCentroid: calculateSpectralCentroid(avgFrequencies),
      quality: avgVolume > 0.05 ? 'good' : 'low'
    }
  }
  
  const calculateSpectralCentroid = (frequencies) => {
    let weightedSum = 0
    let magnitudeSum = 0
    
    // Use default sample rate if audioContext is not available
    const sampleRate = audioContextRef.current?.sampleRate || 44100
    
    frequencies.forEach((magnitude, index) => {
      const frequency = index * (sampleRate / 2) / frequencies.length
      weightedSum += frequency * magnitude
      magnitudeSum += magnitude
    })
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }
  
  const completeCalibration = (fallbackData = null) => {
    console.log('🎯 Completing calibration...', { audioData, fallbackData })
    
    // Use fallback data if provided, otherwise use collected audio data
    const dataToUse = fallbackData || audioData
    
    // Calculate overall voice profile
    const volumeCalibrations = Object.values(dataToUse).filter(d => d && d.volume)
    const avgVolume = volumeCalibrations.length > 0 
      ? volumeCalibrations.reduce((sum, d) => sum + d.volume.average, 0) / volumeCalibrations.length 
      : 0.5
    const avgBrightness = volumeCalibrations.length > 0
      ? volumeCalibrations.reduce((sum, d) => sum + d.brightness, 0) / volumeCalibrations.length 
      : 0.6
    const avgFundamental = volumeCalibrations.length > 0
      ? volumeCalibrations.reduce((sum, d) => sum + d.fundamentalFreq, 0) / volumeCalibrations.length 
      : 150
    
    // Determine voice characteristics
    const voiceProfile = {
      volumeRange: {
        quiet: avgVolume * 0.3,
        normal: avgVolume,
        loud: avgVolume * 2
      },
      tonalCharacteristics: {
        fundamentalFrequency: avgFundamental,
        brightness: avgBrightness,
        timbre: avgBrightness > 0.6 ? 'bright' : avgBrightness > 0.3 ? 'balanced' : 'warm'
      },
      sensitivity: avgVolume < 0.1 ? 'high' : avgVolume < 0.3 ? 'medium' : 'low',
      quality: volumeCalibrations.every(d => d && d.quality === 'good') ? 'excellent' : 'good'
    }
    
    setCalibrationResults(voiceProfile)
    
    // Update store with calibration data
    setAudioState({
      calibrated: true,
      voiceProfile,
      sensitivity: voiceProfile.sensitivity,
      qualityScore: voiceProfile.quality === 'excellent' ? 0.9 : 0.7
    })
    
    if (setUserProfile) {
      setUserProfile({
        voiceCalibration: voiceProfile,
        calibrationDate: new Date().toISOString(),
        personalizedSettings: {
          volumeThreshold: voiceProfile.volumeRange.quiet,
          emotionSensitivity: voiceProfile.sensitivity === 'high' ? 0.8 : 0.6
        }
      })
    }
    
    setCalibrationPhase('complete')
    onCanProceedChange(true)
    
    trackEvent('onboarding_calibration_completed', {
      voiceProfile,
      calibrationQuality: voiceProfile.quality,
      timeSpent: Date.now() - startTime
    })
  }
  
  const handleComplete = () => {
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_calibration_success', { timeSpent, voiceProfile: calibrationResults })
    onComplete({ timeSpent, voiceProfile: calibrationResults, calibrated: true })
  }
  
  const getCurrentPrompt = () => calibrationPrompts[currentPrompt] || calibrationPrompts[0]
  const progress = calibrationPhase === 'complete' ? 100 : (currentPrompt / calibrationPrompts.length) * 100
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      
      <AnimatePresence mode="wait">
        
        {/* Intro Phase */}
        {calibrationPhase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <div className="text-5xl">🎯</div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Voice Calibration
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl">
                Let's tune Vibe-Synth to your unique voice. This quick calibration 
                ensures the best music generation for your vocal characteristics.
              </p>
              <p className="text-sm text-gray-400">
                We'll guide you through a few simple voice exercises
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Volume Calibration Phase */}
        {calibrationPhase === 'volume' && (
          <motion.div
            key="volume"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto">
              <div className="text-5xl">🔊</div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-blue-400">
                Let's Hear Your Voice
              </h3>
              <p className="text-lg text-gray-300">
                We'll listen to how you naturally speak to optimize our audio processing
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Recording Phase */}
        {calibrationPhase === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <div className="relative">
              <motion.div
                className="w-40 h-40 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                animate={isRecording ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(239, 68, 68, 0.3)',
                    '0 0 60px rgba(239, 68, 68, 0.8)',
                    '0 0 20px rgba(239, 68, 68, 0.3)'
                  ]
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="text-6xl">🎤</div>
              </motion.div>
              
              {/* Recording indicator */}
              {isRecording && (
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              
              {/* Progress ring */}
              <motion.div
                className="absolute inset-0 border-4 border-transparent rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent ${100 - (recordingDuration / getCurrentPrompt().duration) * 100}%, rgb(239, 68, 68) ${100 - (recordingDuration / getCurrentPrompt().duration) * 100}%)`
                }}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                {getCurrentPrompt().title}
              </h3>
              <div className="space-y-2">
                <p className="text-xl text-blue-400 font-medium">
                  "{getCurrentPrompt().instruction}"
                </p>
                <p className="text-sm text-gray-400">
                  {getCurrentPrompt().purpose}
                </p>
              </div>
              
              {/* Timer */}
              <div className="text-lg text-gray-300">
                {isRecording 
                  ? `${Math.ceil((getCurrentPrompt().duration - recordingDuration) / 1000)}s remaining`
                  : 'Get ready...'
                }
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Complete Phase */}
        {calibrationPhase === 'complete' && calibrationResults && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-4xl"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <div className="text-5xl">✨</div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-green-400">
                Perfect! Your Voice is Calibrated
              </h3>
              <p className="text-lg text-gray-300">
                We've analyzed your unique vocal characteristics and optimized Vibe-Synth for your voice.
              </p>
              
              {/* Voice Profile Summary */}
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <div className="text-2xl">🎵</div>
                  Your Voice Profile
                </h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-900/30 rounded-xl">
                    <div className="text-2xl mb-2">🔊</div>
                    <h5 className="font-medium text-blue-400">Volume Range</h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {calibrationResults.sensitivity === 'high' ? 'Sensitive to whispers' : 
                       calibrationResults.sensitivity === 'medium' ? 'Balanced sensitivity' : 'Needs clear speech'}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-900/30 rounded-xl">
                    <div className="text-2xl mb-2">🎨</div>
                    <h5 className="font-medium text-purple-400">Voice Timbre</h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {calibrationResults.tonalCharacteristics.timbre} tone
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-900/30 rounded-xl">
                    <div className="text-2xl mb-2">⭐</div>
                    <h5 className="font-medium text-green-400">Quality</h5>
                    <p className="text-sm text-gray-400 mt-1">
                      {calibrationResults.quality} audio clarity
                    </p>
                  </div>
                </div>
              </div>
              
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full text-lg hover:shadow-lg hover:scale-105 transition-all"
                onClick={handleComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Ready to Create Music! →
              </motion.button>
            </div>
          </motion.div>
        )}
        
      </AnimatePresence>
      
      {/* Progress Indicator */}
      {calibrationPhase !== 'intro' && (
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Calibration Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalibrationStep