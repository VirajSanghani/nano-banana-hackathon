import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const PermissionStep = ({ onComplete, onCanProceedChange }) => {
  const { 
    audio,
    actions: { 
      trackEvent, 
      setAudioState, 
      showNotification,
      handleError 
    } 
  } = useVibeStore()
  
  const [startTime] = useState(Date.now())
  const [permissionState, setPermissionState] = useState('requesting') // requesting, granted, denied, error
  const [errorDetails, setErrorDetails] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [testingAudio, setTestingAudio] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  
  useEffect(() => {
    trackEvent('onboarding_permission_started')
    requestMicrophonePermission()
  }, [])
  
  const requestMicrophonePermission = async () => {
    try {
      setPermissionState('requesting')
      setErrorDetails(null)
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      
      // Test the audio stream
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      
      source.connect(analyser)
      analyser.fftSize = 256
      
      // Update store with audio capabilities
      setAudioState({
        hasPermission: true,
        stream: stream,
        audioContext: audioContext,
        analyser: analyser,
        isSupported: true,
        sampleRate: audioContext.sampleRate,
        deviceId: stream.getAudioTracks()[0]?.getSettings()?.deviceId
      })
      
      setPermissionState('granted')
      onCanProceedChange(true)
      
      trackEvent('onboarding_permission_granted', {
        sampleRate: audioContext.sampleRate,
        deviceId: stream.getAudioTracks()[0]?.getSettings()?.deviceId
      })
      
      // Start audio level testing
      startAudioTest(analyser)
      
    } catch (error) {
      console.error('Microphone permission error:', error)
      
      let errorType = 'unknown'
      let userMessage = 'Unable to access microphone'
      let suggestions = []
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorType = 'permission_denied'
        userMessage = 'Microphone access was denied'
        suggestions = [
          'Click the microphone icon in your browser\'s address bar',
          'Select "Allow" when prompted for microphone access',
          'Check your browser\'s privacy settings'
        ]
      } else if (error.name === 'NotFoundError') {
        errorType = 'no_microphone'
        userMessage = 'No microphone found on this device'
        suggestions = [
          'Check that your microphone is properly connected',
          'Try refreshing the page',
          'Check your system\'s audio settings'
        ]
      } else if (error.name === 'NotReadableError') {
        errorType = 'microphone_busy'
        userMessage = 'Microphone is being used by another application'
        suggestions = [
          'Close other applications that might be using your microphone',
          'Try refreshing the page',
          'Restart your browser'
        ]
      }
      
      setErrorDetails({
        type: errorType,
        message: userMessage,
        suggestions,
        originalError: error.message
      })
      
      setPermissionState('denied')
      setAudioState({
        hasPermission: false,
        error: error.message,
        isSupported: false
      })
      
      trackEvent('onboarding_permission_denied', {
        errorType,
        errorMessage: error.message
      })
      
      handleError(error, 'microphone_permission', {
        context: 'onboarding',
        errorType,
        userAgent: navigator.userAgent
      })
    }
  }
  
  const startAudioTest = (analyser) => {
    setTestingAudio(true)
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const updateLevel = () => {
      if (permissionState === 'granted' && testingAudio) {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
        setAudioLevel(average / 255)
        requestAnimationFrame(updateLevel)
      }
    }
    
    updateLevel()
    
    // Stop testing after 10 seconds
    setTimeout(() => {
      setTestingAudio(false)
    }, 10000)
  }
  
  const handleRetry = async () => {
    setIsRetrying(true)
    trackEvent('onboarding_permission_retry')
    
    await requestMicrophonePermission()
    
    setTimeout(() => {
      setIsRetrying(false)
    }, 1000)
  }
  
  const handleSkipWithLimitations = () => {
    trackEvent('onboarding_permission_skipped')
    showNotification('warning', 'You can explore the app, but voice features will be limited', 4000)
    
    const timeSpent = Date.now() - startTime
    onComplete({ 
      timeSpent, 
      hasPermission: false, 
      skippedPermission: true 
    })
  }
  
  const handleComplete = () => {
    const timeSpent = Date.now() - startTime
    trackEvent('onboarding_permission_completed', { 
      timeSpent,
      hasPermission: permissionState === 'granted',
      audioLevel: audioLevel
    })
    
    onComplete({ 
      timeSpent, 
      hasPermission: permissionState === 'granted',
      audioLevel: audioLevel
    })
  }
  
  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome')) {
      return {
        browser: 'Chrome',
        instructions: [
          'Look for the microphone icon in the address bar',
          'Click on it and select "Always allow"',
          'Reload the page if needed'
        ]
      }
    } else if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        instructions: [
          'Look for the microphone icon in the address bar',
          'Click "Allow" when the permission dialog appears',
          'You can manage permissions in Firefox settings'
        ]
      }
    } else if (userAgent.includes('safari')) {
      return {
        browser: 'Safari',
        instructions: [
          'Check Safari > Preferences > Websites > Microphone',
          'Make sure this site is set to "Allow"',
          'Reload the page after changing settings'
        ]
      }
    }
    
    return {
      browser: 'your browser',
      instructions: [
        'Look for a microphone icon near the address bar',
        'Allow microphone access when prompted',
        'Reload the page if permissions were blocked'
      ]
    }
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      
      {/* Requesting State */}
      {permissionState === 'requesting' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.3)',
                  '0 0 60px rgba(59, 130, 246, 0.6)',
                  '0 0 20px rgba(59, 130, 246, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-5xl">🎤</div>
            </motion.div>
            
            {/* Spinning permission ring */}
            <motion.div
              className="absolute inset-0 border-4 border-transparent border-t-blue-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Enable Your Voice
            </h3>
            <p className="text-lg text-gray-300 max-w-md">
              We need access to your microphone to transform your voice into music.
              Your audio is processed locally and never stored.
            </p>
            <p className="text-sm text-gray-400">
              Please allow microphone access when prompted by your browser.
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Granted State */}
      {permissionState === 'granted' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="relative">
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
              animate={{
                scale: testingAudio ? [1, 1 + audioLevel * 0.3, 1] : 1,
                boxShadow: testingAudio 
                  ? `0 0 ${20 + audioLevel * 40}px rgba(34, 197, 94, 0.${Math.floor(3 + audioLevel * 5)})` 
                  : '0 0 20px rgba(34, 197, 94, 0.5)'
              }}
              transition={{ duration: 0.1 }}
            >
              <div className="text-5xl">✅</div>
            </motion.div>
            
            {/* Audio level indicator */}
            {testingAudio && audioLevel > 0.1 && (
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm">🎵</div>
              </motion.div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-green-400">
              Perfect! Microphone Connected
            </h3>
            <p className="text-lg text-gray-300">
              {testingAudio 
                ? (audioLevel > 0.1 
                  ? "Great! We can hear you clearly. Try speaking to see the audio visualization." 
                  : "Microphone is ready. Try saying something to test it.")
                : "Your microphone is working perfectly!"
              }
            </p>
            
            {/* Audio level visualization */}
            {testingAudio && (
              <div className="flex justify-center items-end gap-1 h-16">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 bg-gradient-to-t from-green-500 to-emerald-400 rounded-full"
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
            )}
            
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-full text-lg hover:shadow-lg hover:scale-105 transition-all"
              onClick={handleComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Voice Setup →
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Denied State */}
      {permissionState === 'denied' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 max-w-2xl"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <div className="text-5xl">🚫</div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-red-400">
              Microphone Access Needed
            </h3>
            <p className="text-lg text-gray-300">
              {errorDetails?.message || 'Unable to access your microphone'}
            </p>
            
            {errorDetails?.suggestions && (
              <div className="bg-gray-800/50 p-6 rounded-xl text-left">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <div className="text-lg">💡</div>
                  How to fix this in {getBrowserInstructions().browser}:
                </h4>
                <ul className="space-y-2 text-gray-300">
                  {getBrowserInstructions().instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="text-blue-400 mt-1">•</div>
                      {instruction}
                    </li>
                  ))}
                </ul>
                
                {errorDetails.suggestions.length > 0 && (
                  <>
                    <h5 className="font-medium text-white mt-4 mb-2">Additional steps:</h5>
                    <ul className="space-y-2 text-gray-300">
                      {errorDetails.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="text-blue-400 mt-1">•</div>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
              onClick={handleRetry}
              disabled={isRetrying}
              whileHover={!isRetrying ? { scale: 1.05 } : {}}
              whileTap={!isRetrying ? { scale: 0.95 } : {}}
            >
              {isRetrying ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Retrying...
                </div>
              ) : (
                'Try Again'
              )}
            </motion.button>
            
            <motion.button
              className="px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-full transition-colors"
              onClick={handleSkipWithLimitations}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue Without Voice Features
            </motion.button>
          </div>
          
          {process.env.NODE_ENV === 'development' && errorDetails && (
            <div className="mt-6 p-4 bg-red-900/20 rounded-lg text-left text-xs">
              <div className="font-mono text-red-400">
                Debug: {errorDetails.originalError}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default PermissionStep