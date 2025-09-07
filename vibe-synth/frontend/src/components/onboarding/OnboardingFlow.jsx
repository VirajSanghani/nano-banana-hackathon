import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'
import WelcomeStep from './WelcomeStep'
import DemoStep from './DemoStep'
import PermissionStep from './PermissionStep'
import CalibrationStep from './CalibrationStep'
import FirstCreationStep from './FirstCreationStep'
import CompletionStep from './CompletionStep'

const OnboardingFlow = ({ onComplete }) => {
  const { 
    user, 
    ui,
    actions: { setUIState, trackEvent, showNotification } 
  } = useVibeStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [stepData, setStepData] = useState({})
  const [canProceed, setCanProceed] = useState(false)
  
  const steps = [
    {
      id: 'welcome',
      component: WelcomeStep,
      title: 'Welcome to Vibe-Synth',
      description: 'Transform your voice into music',
      duration: 15,
      skippable: false
    },
    {
      id: 'demo',
      component: DemoStep,
      title: 'See How It Works',
      description: 'Watch emotions become music',
      duration: 30,
      skippable: true
    },
    {
      id: 'permission',
      component: PermissionStep,
      title: 'Enable Your Voice',
      description: 'Grant microphone access',
      duration: null,
      skippable: false
    },
    {
      id: 'calibration',
      component: CalibrationStep,
      title: 'Voice Calibration',
      description: 'Tune your unique voice signature',
      duration: 20,
      skippable: false
    },
    {
      id: 'first-creation',
      component: FirstCreationStep,
      title: 'Create Your First Masterpiece',
      description: 'Speak your emotions into music',
      duration: null,
      skippable: false
    },
    {
      id: 'completion',
      component: CompletionStep,
      title: 'Welcome to Your Musical Journey',
      description: 'You\'re ready to create amazing music',
      duration: 10,
      skippable: false
    }
  ]
  
  const currentStepConfig = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  
  useEffect(() => {
    // Track onboarding start
    trackEvent('onboarding_started', {
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    })
    
    // Set initial UI state
    setUIState({
      currentStep: 'onboarding',
      onboardingProgress: 0
    })
  }, [])
  
  useEffect(() => {
    // Update UI progress
    setUIState({
      onboardingProgress: progress
    })
  }, [currentStep, progress])
  
  const handleStepComplete = (data = {}) => {
    console.log(`✅ Step ${currentStep} (${currentStepConfig.id}) completed`)
    console.log('Step data received:', data)
    
    // Store step data
    setStepData(prev => ({
      ...prev,
      [currentStepConfig.id]: data
    }))
    
    // Track step completion
    trackEvent('onboarding_step_completed', {
      stepId: currentStepConfig.id,
      stepIndex: currentStep,
      stepData: data,
      duration: data.timeSpent || 0
    })
    
    // Check if this is the last step
    if (currentStep === steps.length - 1) {
      console.log('🏁 This was the last step - completing onboarding')
      handleOnboardingComplete()
    } else {
      console.log(`➡️ Moving to step ${currentStep + 1}`)
      nextStep()
    }
  }
  
  const handleStepSkip = () => {
    if (currentStepConfig.skippable) {
      trackEvent('onboarding_step_skipped', {
        stepId: currentStepConfig.id,
        stepIndex: currentStep
      })
      
      if (currentStep === steps.length - 1) {
        handleOnboardingComplete()
      } else {
        nextStep()
      }
    }
  }
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1
      console.log(`🔄 Transitioning from step ${currentStep} to step ${newStep} (${steps[newStep].id})`)
      setCurrentStep(newStep)
      setCanProceed(false)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setCanProceed(true)
    }
  }
  
  const handleOnboardingComplete = () => {
    const completionData = {
      completedAt: Date.now(),
      totalSteps: steps.length,
      skippedSteps: Object.keys(stepData).length < steps.length ? steps.length - Object.keys(stepData).length : 0,
      stepData,
      userAgent: navigator.userAgent
    }
    
    // Update user state
    useVibeStore.setState((state) => {
      state.user.onboardingComplete = true
      state.user.profile.onboardingData = completionData
    })
    
    // Track completion
    trackEvent('onboarding_completed', completionData)
    
    // Show success notification
    showNotification('success', 'Welcome to Vibe-Synth! You\'re ready to create amazing music.', 3000)
    
    // Call completion handler
    if (onComplete) {
      onComplete(completionData)
    }
  }
  
  const CurrentStepComponent = currentStepConfig.component
  
  return (
    <div className="fixed inset-0 bg-vibe-dark z-50 flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-800 h-1">
        <motion.div
          className="h-full bg-gradient-to-r from-vibe-purple to-vibe-blue"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {currentStepConfig.title}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {currentStepConfig.description}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Step Counter */}
          <div className="text-sm text-gray-400">
            {currentStep + 1} of {steps.length}
          </div>
          
          {/* Skip Button */}
          {currentStepConfig.skippable && (
            <button
              onClick={handleStepSkip}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <CurrentStepComponent
              stepData={stepData[currentStepConfig.id] || {}}
              onComplete={handleStepComplete}
              onSkip={handleStepSkip}
              onCanProceedChange={setCanProceed}
              canProceed={canProceed}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <div className="p-6 border-t border-gray-800 flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Back
        </button>
        
        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-vibe-purple' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={() => canProceed && handleStepComplete()}
          disabled={!canProceed}
          className="px-6 py-2 bg-vibe-purple hover:bg-vibe-blue transition-colors rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
        </button>
      </div>
      
      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-20 right-4 bg-black/80 p-4 rounded text-xs text-gray-300">
          <div>Step: {currentStepConfig.id}</div>
          <div>Progress: {Math.round(progress)}%</div>
          <div>Can Proceed: {canProceed.toString()}</div>
          <div>Step Data: {Object.keys(stepData).length}</div>
        </div>
      )}
    </div>
  )
}

export default OnboardingFlow