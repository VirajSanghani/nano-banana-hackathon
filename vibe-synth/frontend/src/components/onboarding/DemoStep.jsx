import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const DemoStep = ({ onComplete, onCanProceedChange }) => {
  const { actions: { trackEvent } } = useVibeStore()
  const [startTime] = useState(Date.now())
  const [demoPhase, setDemoPhase] = useState('intro')
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioRef = useRef(null)
  const animationRef = useRef(null)
  
  // Demo phases timeline
  const demoTimeline = [
    { phase: 'intro', duration: 3000, title: 'Watch the Magic Happen' },
    { phase: 'voice-input', duration: 5000, title: 'Speaking Emotions...' },
    { phase: 'processing', duration: 2000, title: 'AI Understanding...' },
    { phase: 'music-generation', duration: 8000, title: 'Creating Music...' },
    { phase: 'result', duration: 5000, title: 'Your Emotion as Music!' }
  ]
  
  useEffect(() => {
    trackEvent('onboarding_demo_started')
    
    // Auto-progress through demo phases
    let totalTime = 0
    demoTimeline.forEach(({ phase, duration }) => {
      totalTime += duration
      setTimeout(() => {
        setDemoPhase(phase)
        if (phase === 'voice-input') {
          startVoiceAnimation()
        } else if (phase === 'music-generation') {
          startMusicVisualization()
        } else if (phase === 'result') {
          onCanProceedChange(true)
        }
      }, totalTime)
    })
  }, [])
  
  const startVoiceAnimation = () => {
    setIsPlaying(true)
    // Simulate voice input with animated audio levels
    const animate = () => {
      const level = 0.3 + Math.random() * 0.7
      setAudioLevel(level)
      animationRef.current = setTimeout(animate, 100)
    }
    animate()
    
    // Stop after voice phase
    setTimeout(() => {
      setIsPlaying(false)
      setAudioLevel(0)
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }, 5000)
  }
  
  const startMusicVisualization = () => {
    // This will trigger the music visualization during the music generation phase
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 8000)
  }
  
  const handleComplete = () => {
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_demo_completed', { timeSpent, demoPhase })
    onComplete({ timeSpent, completedFullDemo: true })
  }
  
  const handleSkip = () => {
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_demo_skipped', { timeSpent, demoPhase })
    onComplete({ timeSpent, completedFullDemo: false })
  }
  
  const getCurrentPhaseConfig = () => {
    return demoTimeline.find(p => p.phase === demoPhase) || demoTimeline[0]
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Demo Title */}
      <motion.h2 
        className="text-3xl font-bold text-white mb-8"
        key={demoPhase}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {getCurrentPhaseConfig().title}
      </motion.h2>
      
      {/* Main Demo Area */}
      <div className="relative w-full max-w-4xl h-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        
        {/* Intro Phase */}
        {demoPhase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-xl text-gray-300">
                Let's see how Sarah transforms her emotions into music
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Voice Input Phase */}
        {demoPhase === 'voice-input' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              {/* Microphone with audio visualization */}
              <div className="relative">
                <motion.div
                  className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center"
                  animate={{
                    scale: isPlaying ? [1, 1 + audioLevel * 0.3, 1] : 1,
                    boxShadow: isPlaying ? `0 0 ${audioLevel * 50}px rgba(239, 68, 68, 0.5)` : 'none'
                  }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="text-4xl">🎤</div>
                </motion.div>
                
                {/* Audio level bars */}
                {isPlaying && (
                  <div className="flex justify-center mt-4 gap-1">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-2 bg-red-400 rounded-full"
                        animate={{
                          height: [4, 4 + (audioLevel * 40 * Math.random()), 4]
                        }}
                        transition={{
                          duration: 0.2,
                          repeat: Infinity,
                          delay: i * 0.05
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <motion.p
                className="text-lg text-gray-300 italic"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                "I'm feeling really excited about this new opportunity..."
              </motion.p>
            </div>
          </motion.div>
        )}
        
        {/* Processing Phase */}
        {demoPhase === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              <motion.div
                className="w-24 h-24 border-4 border-vibe-purple border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <p className="text-lg text-gray-300">
                AI analyzing emotional patterns...
              </p>
              <div className="flex justify-center gap-2">
                <div className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">
                  Excitement: 85%
                </div>
                <div className="px-3 py-1 bg-blue-900/50 rounded-full text-sm text-blue-300">
                  Optimism: 92%
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Music Generation Phase */}
        {demoPhase === 'music-generation' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* Animated particles representing music creation */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `hsl(${280 + i * 10}, 70%, 60%)`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    scale: [0, 1.5, 0],
                    opacity: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 200],
                    y: [0, (Math.random() - 0.5) * 200]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
            
            {/* Central music note */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-8xl"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity
                }}
              >
                🎵
              </motion.div>
            </div>
            
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-lg text-gray-300">
                Generating uplifting melody with energetic rhythm...
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Result Phase */}
        {demoPhase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="text-center space-y-6">
              <motion.div
                className="w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(251, 191, 36, 0.3)',
                    '0 0 60px rgba(251, 191, 36, 0.6)',
                    '0 0 20px rgba(251, 191, 36, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-6xl">🎶</div>
              </motion.div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-yellow-400">
                  "Excited Opportunity" - Your Musical Creation
                </h3>
                <p className="text-gray-300 max-w-lg">
                  A bright, energetic melody in C major with rising scales 
                  and syncopated rhythms that perfectly captures the feeling 
                  of excitement and anticipation.
                </p>
                
                {/* Fake play button */}
                <motion.button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    // Just visual feedback for demo
                    trackEvent('demo_play_clicked')
                  }}
                >
                  <div className="text-lg">▶️</div>
                  Play Your Music
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Demo Progress */}
      <div className="mt-8 flex items-center gap-4">
        {demoTimeline.map((phase, index) => (
          <div
            key={phase.phase}
            className={`w-3 h-3 rounded-full transition-colors ${
              demoTimeline.findIndex(p => p.phase === demoPhase) >= index
                ? 'bg-vibe-purple'
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      {/* Skip option */}
      <motion.button
        className="mt-6 text-gray-400 hover:text-white transition-colors"
        onClick={handleSkip}
        whileHover={{ scale: 1.05 }}
      >
        Skip Demo →
      </motion.button>
      
      {/* Continue button (appears in result phase) */}
      {demoPhase === 'result' && (
        <motion.button
          className="mt-6 px-8 py-4 bg-gradient-to-r from-vibe-purple to-vibe-blue text-white font-semibold rounded-full text-lg hover:shadow-lg hover:scale-105 transition-all"
          onClick={handleComplete}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          I Want to Try This! →
        </motion.button>
      )}
    </div>
  )
}

export default DemoStep