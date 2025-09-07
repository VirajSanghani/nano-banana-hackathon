import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from './stores/vibeStore'

// Core Components
import { AppErrorBoundary } from './components/core/ErrorBoundary'

// Onboarding Components
import OnboardingFlow from './components/onboarding/OnboardingFlow'

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
  
  // Onboarding State
  if (appState === 'onboarding') {
    return (
      <AppErrorBoundary>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </AppErrorBoundary>
    )
  }
  
  // Main Application State
  return (
    <AppErrorBoundary>
      <div className="min-h-screen bg-vibe-dark text-white relative overflow-hidden">
        
        {/* Background Particle System */}
        <div className="absolute inset-0 z-0">
          <ParticleSystem
            audioData={audioData}
            isActive={!!audioData}
            emotionState={emotionData?.primaryEmotion || 'neutral'}
            className="w-full h-full"
            particleCount={30}
          />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
          
          {/* Header */}
          <header className="p-6 bg-black/20 backdrop-blur-sm border-b border-gray-700/50">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-vibe-purple to-vibe-blue rounded-full flex items-center justify-center">
                  <div className="text-2xl">🎵</div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-vibe-purple to-vibe-blue bg-clip-text text-transparent">
                    Vibe-Synth
                  </h1>
                  <p className="text-sm text-gray-400">Transform your voice into music</p>
                </div>
              </motion.div>
              
              <div className="flex items-center gap-4">
                {/* User greeting */}
                <div className="text-right">
                  <p className="text-sm text-gray-400">Welcome back</p>
                  <p className="font-medium">
                    {user.profile?.name || 'Music Creator'}
                  </p>
                </div>
                
                {/* Settings/Profile button */}
                <motion.button
                  className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showNotification('info', 'Settings panel coming soon!', 2000)}
                >
                  ⚙️
                </motion.button>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              
              {/* Welcome Message */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Create Music?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Speak your emotions and watch them transform into beautiful, unique musical compositions.
                </p>
              </motion.div>
              
              {/* Control Panel */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Audio Processing */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <AudioProcessor
                    onAudioData={handleAudioData}
                    isActive={true}
                  />
                </motion.div>
                
                {/* Emotion Detection */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <EmotionDetector
                    audioData={audioData}
                    onEmotionDetected={handleEmotionDetected}
                    isActive={true}
                  />
                </motion.div>
              </div>
              
              {/* Music Creation Button */}
              <div className="text-center">
                <motion.button
                  className="px-12 py-6 bg-gradient-to-r from-vibe-purple to-vibe-blue text-white font-bold rounded-2xl text-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    trackEvent('create_music_clicked')
                    showNotification('info', 'Music generation coming soon! Keep speaking to see emotion detection.', 3000)
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  🎤 Start Creating Music
                </motion.button>
                
                <motion.p 
                  className="text-sm text-gray-400 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1 }}
                >
                  Click the button above and start speaking to begin your musical creation
                </motion.p>
              </div>
            </div>
          </main>
          
          {/* Footer */}
          <footer className="p-6 bg-black/20 backdrop-blur-sm border-t border-gray-700/50">
            <div className="max-w-6xl mx-auto text-center text-sm text-gray-400">
              <p>© 2025 Vibe-Synth. Transform your emotions into music. 🎵</p>
            </div>
          </footer>
        </div>
        
        {/* Development Debug Panel */}
        {process.env.NODE_ENV === 'development' && showDebugPanel && (
          <motion.div
            className="fixed top-4 right-4 w-80 bg-black/90 backdrop-blur-sm p-4 rounded-lg border border-gray-600 text-xs max-h-96 overflow-y-auto z-50"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-yellow-400">Debug Panel</h4>
              <button
                onClick={() => setShowDebugPanel(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-blue-400">App State:</h5>
                <p className="text-white">{appState}</p>
              </div>
              
              {audioData && (
                <div>
                  <h5 className="font-medium text-green-400">Audio Data:</h5>
                  <pre className="text-gray-300 whitespace-pre-wrap break-all">
                    {JSON.stringify(audioData.metrics, null, 2)}
                  </pre>
                </div>
              )}
              
              {emotionData && (
                <div>
                  <h5 className="font-medium text-purple-400">Emotion Data:</h5>
                  <pre className="text-gray-300 whitespace-pre-wrap break-all">
                    {JSON.stringify({
                      primary: emotionData.primaryEmotion,
                      confidence: emotionData.confidence,
                      secondary: emotionData.secondaryEmotions
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-600">
              <p className="text-gray-400">
                Press <kbd className="bg-gray-700 px-1 rounded">Ctrl+Shift+D</kbd> to toggle
              </p>
            </div>
          </motion.div>
        )}
        
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
      </div>
    </AppErrorBoundary>
  )
}

export default App