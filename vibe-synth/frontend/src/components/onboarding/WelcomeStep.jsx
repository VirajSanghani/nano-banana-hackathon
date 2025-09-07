import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const WelcomeStep = ({ onComplete, onCanProceedChange }) => {
  const { actions: { trackEvent } } = useVibeStore()
  const [startTime] = useState(Date.now())
  const [animationPhase, setAnimationPhase] = useState('intro')
  
  useEffect(() => {
    // Track step start
    trackEvent('onboarding_welcome_started')
    
    // Auto-advance through animation phases
    const timeline = [
      { phase: 'intro', duration: 2000 },
      { phase: 'story', duration: 8000 },
      { phase: 'value-prop', duration: 4000 },
      { phase: 'ready', duration: 1000 }
    ]
    
    let totalTime = 0
    timeline.forEach(({ phase, duration }) => {
      totalTime += duration
      setTimeout(() => {
        setAnimationPhase(phase)
        if (phase === 'ready') {
          onCanProceedChange(true)
        }
      }, totalTime)
    })
    
    // Allow manual proceed after minimum time
    setTimeout(() => {
      onCanProceedChange(true)
    }, 5000)
  }, [])
  
  const handleComplete = () => {
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_welcome_completed', { timeSpent })
    onComplete({ timeSpent, animationPhase })
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* Animated Logo/Brand */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: 'backOut' }}
      >
        <div className="relative">
          <div className="w-32 h-32 bg-gradient-to-br from-vibe-purple to-vibe-blue rounded-full flex items-center justify-center">
            <motion.div
              className="text-4xl"
              animate={animationPhase === 'story' ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎵
            </motion.div>
          </div>
          
          {/* Pulse rings */}
          {animationPhase !== 'intro' && (
            <>
              <motion.div
                className="absolute inset-0 border-2 border-vibe-purple rounded-full"
                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div
                className="absolute inset-0 border-2 border-vibe-blue rounded-full"
                animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
            </>
          )}
        </div>
      </motion.div>
      
      {/* Content based on animation phase */}
      <AnimatePresence mode="wait">
        {animationPhase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-vibe-purple to-vibe-blue bg-clip-text text-transparent">
              Welcome to Vibe-Synth
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl">
              Where your voice becomes music, and your emotions become art
            </p>
          </motion.div>
        )}
        
        {animationPhase === 'story' && (
          <motion.div
            key="story"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 max-w-3xl"
          >
            <h3 className="text-2xl font-semibold text-white">
              Meet Sarah's Story
            </h3>
            
            <div className="space-y-4 text-lg text-gray-300">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Sarah struggled to express her feelings in words. When she was happy, 
                sad, or excited, she could never quite capture the depth of her emotions.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Then she discovered Vibe-Synth. By simply speaking her thoughts, 
                her emotions transformed into beautiful, unique music that perfectly 
                captured how she felt.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-vibe-blue font-medium"
              >
                Now, every feeling has its own soundtrack. Every emotion has its own song.
              </motion.p>
            </div>
          </motion.div>
        )}
        
        {animationPhase === 'value-prop' && (
          <motion.div
            key="value-prop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 max-w-4xl"
          >
            <h3 className="text-2xl font-semibold text-white">
              Your Voice, Your Music, Your Way
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-xl border border-purple-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-3xl mb-3">🎭</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  No Musical Training Needed
                </h4>
                <p className="text-gray-400">
                  Just speak naturally. Our AI understands your emotions and creates music instantly.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-3xl mb-3">✨</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Unique Every Time
                </h4>
                <p className="text-gray-400">
                  Every creation is one-of-a-kind, just like your emotions in that moment.
                </p>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-pink-900/30 to-pink-800/30 p-6 rounded-xl border border-pink-700/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-3xl mb-3">🤝</div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  Share Your Journey
                </h4>
                <p className="text-gray-400">
                  Connect with others through the universal language of emotional music.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {animationPhase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-6"
          >
            <h3 className="text-3xl font-semibold text-white">
              Ready to Discover Your Musical Voice?
            </h3>
            
            <p className="text-lg text-gray-300">
              Let's start with a quick demo to show you how it works!
            </p>
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-vibe-purple to-vibe-blue text-white font-semibold rounded-full text-lg hover:shadow-lg hover:scale-105 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleComplete}
            >
              Yes, Show Me How! →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Ambient particles for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-vibe-purple rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 4
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default WelcomeStep