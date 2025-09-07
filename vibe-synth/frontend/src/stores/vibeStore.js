import { create } from 'zustand'
import { persist, subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { falAI, generateEmotionalArt } from '../services/falAI.js'
import { geminiAI, analyzeEmotionalContent } from '../services/geminiAI.js'
import { elevenLabs, analyzeVoice } from '../services/elevenLabsAI.js'

// Enhanced Zustand Store with Persistence and Error Handling
const useVibeStore = create(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // User state
          user: {
            id: null,
            preferences: {
              audioQuality: 'high',
              visualStyle: 'particles',
              emotionSensitivity: 0.8,
              privacyMode: false,
              notifications: true
            },
            profile: {
              emotionalBaseline: null,
              voiceCharacteristics: null,
              learningData: [],
              creationCount: 0,
              favoriteEmotions: []
            },
            onboardingComplete: false,
            lastActiveDate: null
          },
          
          // Enhanced session management
          session: {
            id: null,
            isInitialized: false,
            initTime: null,
            aiServiceStatuses: {},
            isRecording: false,
            isPaused: false,
            startTime: null,
            duration: 0,
            audioContext: null,
            recordingBuffer: [],
            emotionJourney: [],
            transcriptBuffer: [],
            qualityMetrics: {
              audioLevel: 0,
              noiseLevel: 0,
              confidence: 0,
              speechProbability: 0
            },
            performanceMonitor: null
          },
          
          // Enhanced audio state with advanced features
          audio: {
            pitch: 0,
            volume: 0,
            frequency: 0,
            mfcc: [],
            spectralCentroid: 0,
            zeroCrossingRate: 0,
            isProcessing: false,
            deviceInfo: null,
            calibrationData: null
          },
          
          // Enhanced emotion system with personalization
          emotion: {
            current: 'calm',
            confidence: 0.5,
            history: [],
            personalizedWeights: {
              joy: 1.0,
              sadness: 1.0,
              energy: 1.0,
              calm: 1.0
            },
            contextualFactors: {
              timeOfDay: null,
              previousSessions: [],
              userFeedback: [],
              environmentalContext: null
            },
            learningEnabled: true
          },
          
          // Enhanced visual state with performance tracking
          visual: {
            theme: 'default',
            intensity: 0.5,
            colors: {
              primary: [0.5, 0.8, 0.6],
              secondary: [0.3, 0.6, 0.4],
              accent: [0.7, 0.9, 0.8],
              background: [0.02, 0.02, 0.05]
            },
            particles: {
              count: 500,
              behavior: 'gentle',
              size: 1.0,
              opacity: 0.8,
              trails: true,
              physics: {
                gravity: 0.1,
                friction: 0.98,
                bounce: 0.8
              }
            },
            performance: {
              fps: 60,
              frameTime: 16.67,
              gpuMemory: 0,
              adaptiveQuality: true,
              lastFrame: null
            }
          },
          
          // UI state management
          ui: {
            currentStep: 'welcome',
            onboardingProgress: 0,
            showHelp: false,
            notifications: [],
            loading: false,
            error: null,
            modal: null,
            sidebar: {
              open: false,
              activeTab: 'sessions'
            }
          },
          
          // Social and sharing features
          social: {
            shareHistory: [],
            friends: [],
            collaborations: [],
            communityFeed: [],
            achievements: []
          },
          
          // Debug and analytics
          debug: {
            errors: [],
            performanceMetrics: [],
            userActions: [],
            featureFlags: {
              advancedAudio: true,
              socialFeatures: true,
              personalizedLearning: true
            }
          },
          
          // Actions with enhanced functionality
          actions: {
            // App initialization
            initializeApp: async () => {
              try {
                console.log('🎵 Initializing Vibe-Synth app...')
                
                const serviceStatuses = {}
                
                // Initialize Fal.ai service
                try {
                  const falStatus = await falAI.healthCheck()
                  serviceStatuses.falAI = falStatus
                  console.log('🎨 Fal.ai status:', falStatus.status)
                } catch (error) {
                  serviceStatuses.falAI = { status: 'error', error: error.message }
                  console.warn('⚠️ Fal.ai initialization issue:', error.message)
                }
                
                // Initialize Gemini AI service
                try {
                  const geminiStatus = await geminiAI.healthCheck()
                  serviceStatuses.geminiAI = geminiStatus
                  console.log('🧠 Gemini AI status:', geminiStatus.status)
                } catch (error) {
                  serviceStatuses.geminiAI = { status: 'error', error: error.message }
                  console.warn('⚠️ Gemini AI initialization issue:', error.message)
                }
                
                // Initialize ElevenLabs service
                try {
                  const elevenLabsStatus = await elevenLabs.healthCheck()
                  serviceStatuses.elevenLabs = elevenLabsStatus
                  console.log('🎤 ElevenLabs status:', elevenLabsStatus.status)
                } catch (error) {
                  serviceStatuses.elevenLabs = { status: 'error', error: error.message }
                  console.warn('⚠️ ElevenLabs initialization issue:', error.message)
                }
                
                // Set app as initialized
                set((state) => {
                  state.session.isInitialized = true
                  state.session.initTime = Date.now()
                  state.session.aiServiceStatuses = serviceStatuses
                })
                
                console.log('✅ Vibe-Synth app initialized successfully')
                console.log('📊 AI Services Status:', serviceStatuses)
                
                return { success: true, serviceStatuses }
              } catch (error) {
                console.error('❌ App initialization failed:', error)
                throw error
              }
            },

            // Enhanced session management with error handling
            startSession: async () => {
              try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)({
                  sampleRate: 44100,
                  latencyHint: 'interactive'
                })
                
                // Enhanced audio context setup
                if (audioContext.state === 'suspended') {
                  await audioContext.resume()
                }
                
                set((state) => {
                  state.session.isRecording = true
                  state.session.audioContext = audioContext
                  state.session.id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  state.session.startTime = Date.now()
                  state.session.recordingBuffer = []
                  state.session.emotionJourney = []
                  state.session.transcriptBuffer = []
                  state.ui.loading = false
                  state.ui.error = null
                })
                
                // Start performance monitoring
                get().actions.startPerformanceMonitoring()
                
                // Track session start
                get().actions.trackEvent('session_started', {
                  sessionId: get().session.id,
                  timestamp: Date.now()
                })
                
                return { success: true, sessionId: get().session.id }
              } catch (error) {
                console.error('Failed to start session:', error)
                get().actions.handleError('SESSION_START_FAILED', error)
                return { success: false, error: error.message }
              }
            },
            
            // Enhanced session stop with data persistence
            stopSession: async () => {
              try {
                const { audioContext, performanceMonitor, id, emotionJourney } = get().session
                
                // Stop audio context
                if (audioContext && audioContext.state !== 'closed') {
                  await audioContext.close()
                }
                
                // Stop performance monitoring
                if (performanceMonitor) {
                  clearInterval(performanceMonitor)
                }
                
                // Calculate session statistics
                const endTime = Date.now()
                const duration = endTime - get().session.startTime
                
                // Save session data
                const sessionData = {
                  id,
                  duration,
                  emotionJourney,
                  transcriptBuffer: get().session.transcriptBuffer,
                  qualityMetrics: get().session.qualityMetrics,
                  endTime
                }
                
                set((state) => {
                  state.session.isRecording = false
                  state.session.audioContext = null
                  state.session.performanceMonitor = null
                  state.session.duration = duration
                  
                  // Add to user profile
                  state.user.profile.creationCount += 1
                  state.user.lastActiveDate = endTime
                })
                
                // Persist session data
                await get().actions.saveSession(sessionData)
                
                // Track session end
                get().actions.trackEvent('session_ended', {
                  sessionId: id,
                  duration,
                  emotionCount: emotionJourney.length
                })
                
                return { success: true, sessionData }
              } catch (error) {
                console.error('Failed to stop session:', error)
                get().actions.handleError('SESSION_STOP_FAILED', error)
                return { success: false, error: error.message }
              }
            },
            
            // Enhanced emotion update with learning
            updateEmotion: (emotion, confidence, context = {}) => {
              set((state) => {
                const timestamp = Date.now()
                const emotionData = {
                  emotion,
                  confidence,
                  timestamp,
                  context,
                  personalizedWeight: state.emotion.personalizedWeights[emotion] || 1.0
                }
                
                // Update current emotion
                state.emotion.current = emotion
                state.emotion.confidence = confidence
                
                // Add to history with size limit
                state.emotion.history.push(emotionData)
                if (state.emotion.history.length > 100) {
                  state.emotion.history = state.emotion.history.slice(-100)
                }
                
                // Update session journey
                if (state.session.isRecording) {
                  state.session.emotionJourney.push(emotionData)
                }
                
                // Update visual parameters
                const colors = get().actions.getEmotionColors(emotion)
                const particles = get().actions.getEmotionParticleConfig(emotion, confidence)
                
                state.visual.colors = colors
                state.visual.particles = { ...state.visual.particles, ...particles }
                state.visual.intensity = confidence
              })
              
              // Trigger machine learning update
              if (get().emotion.learningEnabled) {
                get().actions.updatePersonalizedWeights(emotion, confidence, context)
              }
            },
            
            // Audio metrics update with quality assessment
            updateAudioMetrics: (metrics) => {
              set((state) => {
                // Update basic metrics
                state.audio.pitch = metrics.pitch || 0
                state.audio.volume = metrics.volume || 0
                state.audio.frequency = metrics.frequency || 0
                
                // Update advanced features
                if (metrics.mfcc) state.audio.mfcc = metrics.mfcc
                if (metrics.spectralCentroid) state.audio.spectralCentroid = metrics.spectralCentroid
                if (metrics.zeroCrossingRate) state.audio.zeroCrossingRate = metrics.zeroCrossingRate
                
                // Update quality metrics
                if (metrics.noiseLevel !== undefined) {
                  state.session.qualityMetrics.noiseLevel = metrics.noiseLevel
                }
                if (metrics.speechProbability !== undefined) {
                  state.session.qualityMetrics.speechProbability = metrics.speechProbability
                }
                
                state.session.qualityMetrics.audioLevel = metrics.volume || 0
                state.session.qualityMetrics.confidence = metrics.confidence || 0
              })
            },
            
            // Enhanced error handling system
            handleError: (errorType, error, context = {}) => {
              const errorData = {
                type: errorType,
                message: error?.message || String(error),
                stack: error?.stack,
                timestamp: Date.now(),
                context,
                userAgent: navigator.userAgent,
                url: window.location.href,
                sessionId: get().session.id,
                userId: get().user.id
              }
              
              console.error('Vibe-Synth Error:', errorData)
              
              set((state) => {
                // Store error for debugging
                state.debug.errors.push(errorData)
                if (state.debug.errors.length > 50) {
                  state.debug.errors = state.debug.errors.slice(-50)
                }
                
                // Set UI error state
                state.ui.error = {
                  type: errorType,
                  message: get().actions.getUserFriendlyErrorMessage(errorType),
                  canRetry: get().actions.isRetryableError(errorType),
                  timestamp: Date.now()
                }
                
                state.ui.loading = false
              })
              
              // Send error to monitoring service (in production)
              if (process.env.NODE_ENV === 'production') {
                get().actions.reportErrorToService(errorData)
              }
            },
            
            // Performance monitoring
            startPerformanceMonitoring: () => {
              const monitor = setInterval(() => {
                const now = performance.now()
                const currentPerf = get().visual.performance
                
                set((state) => {
                  const frameTime = now - (currentPerf.lastFrame || now)
                  state.visual.performance.frameTime = frameTime
                  state.visual.performance.lastFrame = now
                  state.visual.performance.fps = frameTime > 0 ? Math.round(1000 / frameTime) : 60
                  
                  // Adaptive quality adjustment
                  if (state.visual.performance.adaptiveQuality) {
                    if (state.visual.performance.fps < 45) {
                      state.visual.particles.count = Math.max(100, state.visual.particles.count * 0.8)
                    } else if (state.visual.performance.fps > 55 && state.visual.particles.count < 1000) {
                      state.visual.particles.count = Math.min(1000, state.visual.particles.count * 1.1)
                    }
                  }
                })
              }, 1000)
              
              set((state) => {
                state.session.performanceMonitor = monitor
              })
            },
            
            // Utility functions
            getEmotionColors: (emotion) => {
              const colorMap = {
                joy: {
                  primary: [1.0, 0.8, 0.2],
                  secondary: [1.0, 0.6, 0.1],
                  accent: [1.0, 0.9, 0.4]
                },
                sadness: {
                  primary: [0.2, 0.3, 0.8],
                  secondary: [0.3, 0.4, 0.9],
                  accent: [0.4, 0.5, 1.0]
                },
                energy: {
                  primary: [0.9, 0.2, 0.3],
                  secondary: [1.0, 0.4, 0.2],
                  accent: [1.0, 0.6, 0.3]
                },
                calm: {
                  primary: [0.5, 0.8, 0.6],
                  secondary: [0.4, 0.7, 0.5],
                  accent: [0.6, 0.9, 0.7]
                }
              }
              return colorMap[emotion] || colorMap.calm
            },
            
            getEmotionParticleConfig: (emotion, confidence) => {
              const configMap = {
                joy: {
                  count: Math.floor(600 + confidence * 400),
                  behavior: 'dancing',
                  size: 1.2,
                  opacity: 0.9
                },
                sadness: {
                  count: Math.floor(300 + confidence * 200),
                  behavior: 'flowing',
                  size: 0.8,
                  opacity: 0.6
                },
                energy: {
                  count: Math.floor(800 + confidence * 500),
                  behavior: 'explosive',
                  size: 1.5,
                  opacity: 1.0
                },
                calm: {
                  count: Math.floor(400 + confidence * 300),
                  behavior: 'gentle',
                  size: 1.0,
                  opacity: 0.7
                }
              }
              return configMap[emotion] || configMap.calm
            },
            
            getUserFriendlyErrorMessage: (errorType) => {
              const messages = {
                'SESSION_START_FAILED': 'Unable to start recording. Please check your microphone permissions.',
                'SESSION_STOP_FAILED': 'Session ended unexpectedly. Your progress has been saved.',
                'AUDIO_PROCESSING_FAILED': 'Audio processing error. Please try speaking more clearly.',
                'EMOTION_ANALYSIS_FAILED': 'Unable to analyze emotions right now. Please try again.',
                'NETWORK_ERROR': 'Connection issue. Please check your internet connection.',
                'PERMISSION_DENIED': 'Microphone access is required for Vibe-Synth to work.',
                'UNSUPPORTED_BROWSER': 'Your browser may not support all features. Try Chrome or Firefox.'
              }
              return messages[errorType] || 'Something went wrong. Please try again.'
            },
            
            isRetryableError: (errorType) => {
              const retryableErrors = [
                'SESSION_START_FAILED',
                'AUDIO_PROCESSING_FAILED',
                'EMOTION_ANALYSIS_FAILED',
                'NETWORK_ERROR'
              ]
              return retryableErrors.includes(errorType)
            },
            
            // Personalization and learning
            updatePersonalizedWeights: (emotion, confidence, context) => {
              // Simple learning algorithm - adjust weights based on user feedback
              set((state) => {
                const currentWeight = state.emotion.personalizedWeights[emotion] || 1.0
                const adjustment = (confidence - 0.5) * 0.1 // Small adjustment
                state.emotion.personalizedWeights[emotion] = Math.max(0.1, Math.min(2.0, currentWeight + adjustment))
              })
            },
            
            // Event tracking for analytics
            trackEvent: (eventName, properties = {}) => {
              const eventData = {
                event: eventName,
                properties: {
                  ...properties,
                  timestamp: Date.now(),
                  userId: get().user.id,
                  sessionId: get().session.id
                }
              }
              
              // Store in debug for development
              set((state) => {
                state.debug.userActions.push(eventData)
                if (state.debug.userActions.length > 1000) {
                  state.debug.userActions = state.debug.userActions.slice(-1000)
                }
              })
              
              // Send to analytics service in production
              if (process.env.NODE_ENV === 'production') {
                // Implementation for production analytics
                console.log('Analytics Event:', eventData)
              }
            },
            
            // Session data persistence
            saveSession: async (sessionData) => {
              try {
                // Save to localStorage for now, could be sent to backend
                const sessions = JSON.parse(localStorage.getItem('vibe-synth-sessions') || '[]')
                sessions.push(sessionData)
                
                // Keep only last 50 sessions
                const recentSessions = sessions.slice(-50)
                localStorage.setItem('vibe-synth-sessions', JSON.stringify(recentSessions))
                
                console.log('Session saved:', sessionData.id)
                return { success: true }
              } catch (error) {
                console.error('Failed to save session:', error)
                return { success: false, error: error.message }
              }
            },
            
            // UI actions
            setUIState: (updates) => {
              set((state) => {
                Object.assign(state.ui, updates)
              })
            },
            
            // Audio state management
            setAudioState: (updates) => {
              set((state) => {
                Object.assign(state.audio, updates)
              })
            },
            
            // Emotion state management
            setEmotionState: (emotionData) => {
              set((state) => {
                if (emotionData.currentEmotions) {
                  state.emotion.current = emotionData.currentEmotions.primary || state.emotion.current
                  state.emotion.confidence = emotionData.confidence || state.emotion.confidence
                }
                if (emotionData.lastAnalysis) {
                  state.emotion.contextualFactors = {
                    ...state.emotion.contextualFactors,
                    lastAnalysis: emotionData.lastAnalysis
                  }
                }
              })
            },

            setUserProfile: (profileData) => {
              set((state) => {
                Object.assign(state.user, profileData)
              })
            },
            
            showNotification: (type, message, duration = 5000) => {
              const notification = {
                id: Date.now(),
                type,
                message,
                timestamp: Date.now()
              }
              
              set((state) => {
                state.ui.notifications.push(notification)
              })
              
              // Auto-remove after duration
              setTimeout(() => {
                set((state) => {
                  state.ui.notifications = state.ui.notifications.filter(n => n.id !== notification.id)
                })
              }, duration)
            },
            
            // Complete session reset
            resetSession: () => {
              set((state) => {
                state.session = {
                  id: null,
                  isRecording: false,
                  isPaused: false,
                  startTime: null,
                  duration: 0,
                  audioContext: null,
                  recordingBuffer: [],
                  emotionJourney: [],
                  transcriptBuffer: [],
                  qualityMetrics: {
                    audioLevel: 0,
                    noiseLevel: 0,
                    confidence: 0,
                    speechProbability: 0
                  },
                  performanceMonitor: null
                }
                
                state.emotion.current = 'calm'
                state.emotion.confidence = 0.5
                
                state.audio = {
                  pitch: 0,
                  volume: 0,
                  frequency: 0,
                  mfcc: [],
                  spectralCentroid: 0,
                  zeroCrossingRate: 0,
                  isProcessing: false,
                  deviceInfo: null,
                  calibrationData: null
                }
                
                state.ui.error = null
                state.ui.loading = false
              })
            }
          }
        }))
      ),
      {
        name: 'vibe-synth-storage',
        version: 3,
        partialize: (state) => ({
          user: {
            preferences: state.user.preferences,
            profile: {
              emotionalBaseline: state.user.profile.emotionalBaseline,
              creationCount: state.user.profile.creationCount,
              favoriteEmotions: state.user.profile.favoriteEmotions
            },
            onboardingComplete: state.user.onboardingComplete
          },
          emotion: {
            personalizedWeights: state.emotion.personalizedWeights,
            history: state.emotion.history.slice(-10) // Only keep recent history
          },
          visual: {
            theme: state.visual.theme
          }
        }),
        migrate: (persistedState, version) => {
          // Handle state migrations when store structure changes
          if (version < 3) {
            // Migration logic for older versions
            return {
              ...persistedState,
              user: {
                ...persistedState.user,
                onboardingComplete: false
              }
            }
          }
          return persistedState
        }
      }
    ),
    { name: 'vibe-synth-store' }
  )
)

export default useVibeStore