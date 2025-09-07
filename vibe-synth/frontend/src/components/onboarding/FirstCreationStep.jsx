import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const FirstCreationStep = ({ onComplete, onCanProceedChange }) => {
  const { 
    audio, 
    emotion,
    user,
    actions: { 
      trackEvent, 
      setEmotionState,
      setAudioState,
      showNotification,
      handleError 
    } 
  } = useVibeStore()
  
  const [startTime] = useState(Date.now())
  const [creationPhase, setCreationPhase] = useState('instructions') // instructions, listening, processing, generated, complete
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [emotionAnalysis, setEmotionAnalysis] = useState(null)
  const [generatedMusic, setGeneratedMusic] = useState(null)
  const [userSatisfaction, setUserSatisfaction] = useState(null)
  
  const recordingTimerRef = useRef(null)
  const animationFrameRef = useRef(null)
  const maxRecordingTime = 5000 // 5 seconds for faster demo
  
  // Suggested prompts to help users get started
  const suggestionPrompts = [
    {
      emotion: 'excited',
      text: "I just got accepted to my dream school!",
      color: 'from-yellow-400 to-orange-500',
      icon: '🎉'
    },
    {
      emotion: 'peaceful',
      text: "I love watching the sunset by the ocean",
      color: 'from-blue-400 to-teal-500',
      icon: '🌅'
    },
    {
      emotion: 'nostalgic',
      text: "I miss the summers when I was a kid",
      color: 'from-purple-400 to-pink-500',
      icon: '💭'
    },
    {
      emotion: 'hopeful',
      text: "Tomorrow is going to be a great day",
      color: 'from-green-400 to-emerald-500',
      icon: '✨'
    }
  ]
  
  useEffect(() => {
    trackEvent('onboarding_first_creation_started')
    
    // Since we're simulating, always proceed
    console.log('🎨 Starting first music creation experience')
    
    // Auto-advance to ready state after instructions
    setTimeout(() => {
      setCreationPhase('ready')
      onCanProceedChange(false) // Don't allow proceed until creation is complete
      console.log('📍 FirstCreationStep ready - waiting for user to click microphone')
    }, 3000)
    
    return () => {
      stopRecording()
    }
  }, [])
  
  const startRecording = () => {
    if (isRecording) return
    
    console.log('🎤 Starting simulated recording...')
    setIsRecording(true)
    setRecordingDuration(0)
    setCreationPhase('listening')
    onCanProceedChange(false)
    
    const startTime = Date.now()
    
    // Simulate recording timer
    recordingTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setRecordingDuration(elapsed)
      
      // Simulate audio level fluctuations
      const simulatedLevel = 0.2 + Math.random() * 0.3 + Math.sin(elapsed / 200) * 0.2
      setAudioLevel(Math.max(0, Math.min(1, simulatedLevel)))
      
      if (elapsed >= maxRecordingTime) {
        stopRecording()
      }
    }, 100)
    
    trackEvent('first_creation_recording_started')
  }
  
  const stopRecording = () => {
    if (!isRecording) return
    
    console.log('⏹️ Stopping recording...')
    setIsRecording(false)
    setAudioLevel(0)
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    // Move to processing phase
    setCreationPhase('processing')
    
    // Simulate emotion analysis and music generation
    processRecording()
    
    trackEvent('first_creation_recording_stopped', {
      duration: recordingDuration
    })
  }
  
  const processRecording = async () => {
    try {
      // Simulate emotion analysis (in real app, this would call the emotion detection API)
      setTimeout(() => {
        const emotions = analyzeEmotions()
        setEmotionAnalysis(emotions)
        setEmotionState({
          currentEmotions: emotions,
          confidence: emotions.confidence,
          lastAnalysis: Date.now()
        })
        
        // Generate music based on emotions
        generateMusic(emotions)
      }, 2000)
      
    } catch (error) {
      handleError(error, 'first_creation_processing')
      showNotification('error', 'Unable to process your voice. Please try again.', 4000)
      setCreationPhase('ready')
      onCanProceedChange(true)
    }
  }
  
  const analyzeEmotions = () => {
    // Simulate emotion detection based on audio characteristics
    const emotionOptions = [
      { name: 'Joy', value: 0.8, color: '#FFD700' },
      { name: 'Excitement', value: 0.7, color: '#FF6B35' },
      { name: 'Calm', value: 0.6, color: '#4ECDC4' },
      { name: 'Hope', value: 0.75, color: '#45B7D1' },
      { name: 'Contentment', value: 0.65, color: '#96CEB4' }
    ]
    
    // Pick primary emotion based on "analysis"
    const primary = emotionOptions[Math.floor(Math.random() * emotionOptions.length)]
    
    return {
      primary: primary.name.toLowerCase(),
      confidence: primary.value,
      emotions: emotionOptions.map(e => ({
        name: e.name.toLowerCase(),
        intensity: e === primary ? e.value : Math.random() * 0.4,
        color: e.color
      })),
      musicStyle: determineMusicStyle(primary.name.toLowerCase())
    }
  }
  
  const determineMusicStyle = (emotion) => {
    const styleMap = {
      joy: { tempo: 'upbeat', key: 'C major', instruments: ['piano', 'strings', 'flute'] },
      excitement: { tempo: 'energetic', key: 'D major', instruments: ['guitar', 'drums', 'brass'] },
      calm: { tempo: 'slow', key: 'F major', instruments: ['piano', 'cello', 'ambient pads'] },
      hope: { tempo: 'moderate', key: 'G major', instruments: ['piano', 'violin', 'soft percussion'] },
      contentment: { tempo: 'gentle', key: 'Bb major', instruments: ['acoustic guitar', 'strings', 'warm pads'] }
    }
    
    return styleMap[emotion] || styleMap.calm
  }
  
  const generateMusic = (emotions) => {
    console.log('🎵 Starting music generation...')
    // Simulate music generation
    setTimeout(() => {
      const music = {
        title: `${emotions.primary.charAt(0).toUpperCase() + emotions.primary.slice(1)} Melody`,
        description: `A ${emotions.musicStyle.tempo} composition in ${emotions.musicStyle.key} featuring ${emotions.musicStyle.instruments.join(', ')}`,
        duration: 45, // seconds
        style: emotions.musicStyle,
        emotionalProfile: emotions,
        createdAt: Date.now(),
        isFirstCreation: true
      }
      
      console.log('✅ Music generated:', music)
      setGeneratedMusic(music)
      setCreationPhase('generated')
      
      trackEvent('first_creation_music_generated', {
        emotion: emotions.primary,
        confidence: emotions.confidence,
        musicStyle: emotions.musicStyle
      })
      
      // Enable proceed button after user has time to see the result
      setTimeout(() => {
        console.log('🔄 Enabling proceed button')
        onCanProceedChange(true)
      }, 3000)
      
    }, 3000)
  }
  
  const handleSatisfactionRating = (rating) => {
    setUserSatisfaction(rating)
    
    trackEvent('first_creation_satisfaction_rated', {
      rating,
      emotion: emotionAnalysis?.primary,
      confidence: emotionAnalysis?.confidence
    })
    
    // Update user profile with first creation data
    const creationData = {
      firstCreationCompleted: true,
      firstCreationDate: new Date().toISOString(),
      firstEmotionDetected: emotionAnalysis?.primary,
      satisfactionRating: rating,
      preferredMusicStyle: generatedMusic?.style
    }
    
    // This would update the user store
    showNotification('success', 'Thank you for your feedback! This helps us improve.', 3000)
  }
  
  const handleComplete = () => {
    console.log('🚀 FirstCreationStep handleComplete called')
    console.log('onComplete type:', typeof onComplete)
    console.log('generatedMusic:', generatedMusic)
    console.log('emotionAnalysis:', emotionAnalysis)
    
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_first_creation_completed', {
      timeSpent,
      emotion: emotionAnalysis?.primary,
      satisfactionRating: userSatisfaction,
      recordingDuration
    })
    
    const completionData = {
      timeSpent,
      firstCreation: generatedMusic,
      emotionAnalysis,
      satisfactionRating: userSatisfaction,
      recordingDuration
    }
    
    console.log('📦 Completion data being sent:', completionData)
    
    if (typeof onComplete === 'function') {
      console.log('✅ Calling onComplete callback')
      onComplete(completionData)
    } else {
      console.error('❌ onComplete is not a function:', onComplete)
    }
  }
  
  const handleTryAgain = () => {
    setCreationPhase('ready')
    setEmotionAnalysis(null)
    setGeneratedMusic(null)
    setUserSatisfaction(null)
    onCanProceedChange(true)
    
    trackEvent('first_creation_try_again')
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      
      <AnimatePresence mode="wait">
        
        {/* Instructions Phase */}
        {creationPhase === 'instructions' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8 max-w-3xl"
          >
            <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto">
              <div className="text-5xl">🎨</div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">
                Create Your First Musical Masterpiece
              </h2>
              <p className="text-lg text-gray-300">
                Express any emotion or feeling through your voice, and watch as it transforms into beautiful music.
              </p>
              <p className="text-sm text-gray-400">
                Speak naturally about something that makes you feel - happy memories, future hopes, or present moments.
              </p>
            </div>
            
            {/* Suggestion prompts */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {suggestionPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.emotion}
                  className={`p-4 bg-gradient-to-br ${prompt.color} bg-opacity-20 border border-opacity-30 rounded-xl`}
                  style={{ borderColor: prompt.color.split(' ')[1] }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="text-2xl mb-2">{prompt.icon}</div>
                  <p className="text-sm text-gray-300 italic">"{prompt.text}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Ready Phase */}
        {creationPhase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <motion.div
              className="w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.4)',
                  '0 0 40px rgba(168, 85, 247, 0.6)',
                  '0 0 20px rgba(168, 85, 247, 0.4)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-6xl">🎤</div>
            </motion.div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-white">
                Ready to Create?
              </h3>
              <p className="text-lg text-gray-300">
                Click the microphone and speak about something that moves you
              </p>
              <p className="text-sm text-gray-400">
                Maximum 10 seconds - make it count!
              </p>
            </div>
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full text-lg"
              onClick={startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎤 Start Recording
            </motion.button>
          </motion.div>
        )}
        
        {/* Listening Phase */}
        {creationPhase === 'listening' && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="relative">
              <motion.div
                className="w-48 h-48 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1 + audioLevel * 0.5, 1],
                  boxShadow: `0 0 ${20 + audioLevel * 60}px rgba(239, 68, 68, 0.${Math.floor(4 + audioLevel * 6)})`
                }}
                transition={{ duration: 0.1 }}
              >
                <div className="text-7xl">🎤</div>
              </motion.div>
              
              {/* Recording indicator */}
              <motion.div
                className="absolute -top-4 -right-4 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                REC
              </motion.div>
              
              {/* Audio level bars */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-3 bg-red-400 rounded-full"
                      animate={{
                        height: [8, 8 + (audioLevel * 40 * (0.5 + Math.random() * 0.5)), 8]
                      }}
                      transition={{
                        duration: 0.2,
                        repeat: Infinity,
                        delay: i * 0.05
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-red-400">
                Listening to Your Voice...
              </h3>
              <p className="text-lg text-gray-300">
                Speak naturally about your emotions
              </p>
              
              {/* Timer */}
              <div className="text-xl font-mono text-white">
                {Math.ceil((maxRecordingTime - recordingDuration) / 1000)}s
              </div>
            </div>
            
            <motion.button
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
              onClick={stopRecording}
              whileHover={{ scale: 1.05 }}
            >
              ⏹️ Stop Recording
            </motion.button>
          </motion.div>
        )}
        
        {/* Processing Phase */}
        {creationPhase === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-8"
          >
            <motion.div
              className="w-32 h-32 border-8 border-purple-500 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-purple-400">
                Creating Your Music...
              </h3>
              <p className="text-lg text-gray-300">
                AI is analyzing your emotions and composing your unique melody
              </p>
              
              <div className="flex justify-center gap-2 mt-4">
                <motion.div
                  className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Analyzing emotions...
                </motion.div>
                <motion.div
                  className="px-3 py-1 bg-blue-900/50 rounded-full text-sm text-blue-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  Composing melody...
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Generated Phase */}
        {creationPhase === 'generated' && generatedMusic && emotionAnalysis && (
          <motion.div
            key="generated"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center space-y-8 max-w-4xl"
          >
            <motion.div
              className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.4)',
                  '0 0 60px rgba(251, 191, 36, 0.7)',
                  '0 0 20px rgba(251, 191, 36, 0.4)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-7xl">🎶</div>
            </motion.div>
            
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-yellow-400">
                🎉 Your Music is Ready!
              </h3>
              
              {/* Music Details */}
              <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 rounded-2xl border border-gray-700">
                <h4 className="text-2xl font-bold text-white mb-2">
                  "{generatedMusic.title}"
                </h4>
                <p className="text-gray-300 mb-4">
                  {generatedMusic.description}
                </p>
                
                {/* Emotion Analysis Display */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-purple-900/30 rounded-xl">
                    <h5 className="font-semibold text-purple-400">Primary Emotion</h5>
                    <p className="text-xl text-white capitalize">
                      {emotionAnalysis.primary}
                    </p>
                    <p className="text-sm text-gray-400">
                      {Math.round(emotionAnalysis.confidence * 100)}% confidence
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-900/30 rounded-xl">
                    <h5 className="font-semibold text-blue-400">Musical Style</h5>
                    <p className="text-lg text-white">
                      {generatedMusic.style.tempo} • {generatedMusic.style.key}
                    </p>
                    <p className="text-sm text-gray-400">
                      {generatedMusic.duration}s composition
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-900/30 rounded-xl">
                    <h5 className="font-semibold text-green-400">Instruments</h5>
                    <p className="text-sm text-white">
                      {generatedMusic.style.instruments.join(', ')}
                    </p>
                  </div>
                </div>
                
                {/* Play Button (simulated) */}
                <motion.button
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => trackEvent('first_creation_play_clicked')}
                >
                  <div className="text-2xl">▶️</div>
                  Play Your Creation
                </motion.button>
              </div>
              
              {/* Satisfaction Rating */}
              {!userSatisfaction && (
                <div className="space-y-4">
                  <p className="text-gray-300">How do you feel about your first creation?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <motion.button
                        key={rating}
                        className="text-3xl hover:scale-110 transition-transform"
                        onClick={() => handleSatisfactionRating(rating)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ⭐
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
                  onClick={handleTryAgain}
                  whileHover={{ scale: 1.05 }}
                >
                  🎤 Try Different Emotion
                </motion.button>
                
                <motion.button
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full"
                  onClick={handleComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  This is Amazing! Continue →
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        
      </AnimatePresence>
      
      {/* Recording Progress */}
      {isRecording && (
        <div className="absolute bottom-8 left-0 right-0">
          <div className="max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                animate={{ width: `${(recordingDuration / maxRecordingTime) * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FirstCreationStep