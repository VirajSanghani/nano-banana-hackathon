import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from './stores/vibeStore'

// Core Components
import { AppErrorBoundary } from './components/core/ErrorBoundary'

// Live Components
import LiveVoiceSynth from './components/live/LiveVoiceSynth'

// Audio & Processing
import AudioProcessor from './components/audio/AudioProcessor'
import EmotionDetector from './components/emotion/EmotionDetector'

// Visualization
import ParticleSystem from './components/visualization/ParticleSystem'

// Main App Component
function App() {
  const { 
    user, 
    ui, 
    session,
    actions: { 
      initializeApp, 
      trackEvent,
      showNotification,
      setUIState
    } 
  } = useVibeStore()
  
  const [appState, setAppState] = useState('initializing') // initializing, onboarding, main, error
  const [audioData, setAudioData] = useState(null)
  const [emotionData, setEmotionData] = useState(null)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  
  useEffect(() => {
    // Initialize app
    const init = async () => {
      try {
        await initializeApp()
        
        // Check if user needs onboarding
        if (!user.isOnboarded) {
          setAppState('onboarding')
          trackEvent('app_started_onboarding')
        } else {
          setAppState('main')
          trackEvent('app_started_main')
        }
        
      } catch (error) {
        console.error('App initialization failed:', error)
        setAppState('error')
      }
    }
    
    init()
    
    // Debug mode toggle (development only)
    if (process.env.NODE_ENV === 'development') {
      const handleKeyPress = (e) => {
        if (e.key === 'D' && e.shiftKey && e.ctrlKey) {
          setShowDebugPanel(prev => !prev)
        }
      }
      
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])
  
  const handleOnboardingComplete = (completionData) => {
    trackEvent('onboarding_flow_completed', completionData)
    showNotification('success', 'Welcome to Vibe-Synth! Your musical journey begins now! 🎵', 4000)
    
    setAppState('main')
    setUIState({ currentStep: 'main', onboardingProgress: 100 })
  }
  
  const handleAudioData = (data) => {
    setAudioData(data)
  }
  
  const handleEmotionDetected = (emotionData) => {
    setEmotionData(emotionData)
    
    // Trigger music generation based on emotion
    if (emotionData.confidence > 0.7) {
      trackEvent('high_confidence_emotion_detected', {
        emotion: emotionData.primaryEmotion,
        confidence: emotionData.confidence
      })
    }
  }
  
  // Loading/Initializing State
  if (appState === 'initializing') {
    return (
      <AppErrorBoundary>
        <div className="min-h-screen bg-vibe-dark flex items-center justify-center">
          <motion.div 
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Loading Logo */}
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-vibe-purple to-vibe-blue rounded-full flex items-center justify-center mx-auto"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1.5, repeat: Infinity }
              }}
            >
              <div className="text-5xl">🎵</div>
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-vibe-purple to-vibe-blue bg-clip-text text-transparent">
                Vibe-Synth
              </h1>
              <p className="text-xl text-gray-300">
                Initializing your musical experience...
              </p>
              
              {/* Loading animation */}
              <div className="flex justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-vibe-purple rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </AppErrorBoundary>
    )
  }
  
  // Error State
  if (appState === 'error') {
    return (
      <AppErrorBoundary>
        <div className="min-h-screen bg-vibe-dark flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md">
            <div className="text-6xl">😵</div>
            <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
            <p className="text-gray-300">We're having trouble starting the app. Please refresh and try again.</p>
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-vibe-purple to-vibe-blue text-white font-semibold rounded-lg"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Refresh App
            </motion.button>
          </div>
        </div>
      </AppErrorBoundary>
    )
  }
  
  // Live Experience State (replacing onboarding)
  if (appState === 'onboarding' || appState === 'main') {
    return (
      <AppErrorBoundary>
        <LiveVoiceSynth />
      </AppErrorBoundary>
    )
  }
  
  // Global Notifications (overlay on all states)
  return (
    <>
      {/* Global Notifications */}
      <AnimatePresence>
        {ui.notification && (
          <motion.div
            className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg z-50 ${
              ui.notification.type === 'success' ? 'bg-green-600' :
              ui.notification.type === 'error' ? 'bg-red-600' :
              ui.notification.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-white font-medium">{ui.notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App