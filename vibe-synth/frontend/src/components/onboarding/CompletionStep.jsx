import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../../stores/vibeStore'

const CompletionStep = ({ onComplete, onCanProceedChange }) => {
  console.log('🎊 CompletionStep component mounted')
  
  const { 
    user,
    actions: { 
      trackEvent, 
      setUserProfile,
      showNotification 
    } 
  } = useVibeStore()
  
  const [startTime] = useState(Date.now())
  const [celebrationPhase, setCelebrationPhase] = useState('celebration')
  const [userGoals, setUserGoals] = useState([])
  const [selectedGoals, setSelectedGoals] = useState(new Set())
  const [customGoal, setCustomGoal] = useState('')
  
  // Goal options for users to select what they want to achieve
  const goalOptions = [
    {
      id: 'emotional-expression',
      title: 'Express My Emotions',
      description: 'Turn feelings into beautiful music daily',
      icon: '🎭',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'stress-relief',
      title: 'Reduce Stress & Anxiety',
      description: 'Use music creation as a calming outlet',
      icon: '🧘',
      color: 'from-blue-500 to-teal-500'
    },
    {
      id: 'creative-exploration',
      title: 'Explore Musical Creativity',
      description: 'Discover new sounds and musical styles',
      icon: '🎨',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'mood-tracking',
      title: 'Track My Emotional Journey',
      description: 'Create a musical diary of my feelings',
      icon: '📊',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'social-sharing',
      title: 'Share & Connect',
      description: 'Share musical moments with others',
      icon: '🤝',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'mindfulness',
      title: 'Practice Mindfulness',
      description: 'Use voice and music for meditation',
      icon: '🌸',
      color: 'from-pink-500 to-rose-500'
    }
  ]
  
  // Achievement statistics to show user's journey
  const achievements = [
    { label: 'Onboarding Completed', value: '100%', icon: '✅' },
    { label: 'Voice Calibrated', value: 'Perfect', icon: '🎤' },
    { label: 'First Creation', value: 'Amazing', icon: '🎵' },
    { label: 'Ready to Create', value: 'Yes!', icon: '🚀' }
  ]
  
  useEffect(() => {
    trackEvent('onboarding_completion_started')
    
    // Auto-advance through celebration phases with shorter delays
    setTimeout(() => setCelebrationPhase('achievements'), 1500)
    setTimeout(() => setCelebrationPhase('goals'), 3000)
    setTimeout(() => {
      if (typeof onCanProceedChange === 'function') {
        onCanProceedChange(true)
      }
    }, 4000)
    
    // Auto-select first two goals for better UX
    setTimeout(() => {
      setSelectedGoals(new Set(['emotional-expression', 'creative-exploration']))
    }, 3500)
  }, [])
  
  const handleGoalToggle = (goalId) => {
    const newSelected = new Set(selectedGoals)
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId)
    } else {
      newSelected.add(goalId)
    }
    setSelectedGoals(newSelected)
    
    trackEvent('onboarding_goal_selected', { goalId, selected: newSelected.has(goalId) })
  }
  
  const handleCustomGoalSubmit = () => {
    if (customGoal.trim()) {
      const customGoalData = {
        id: 'custom-' + Date.now(),
        title: customGoal.trim(),
        description: 'Personal goal',
        icon: '⭐',
        color: 'from-gray-500 to-gray-600',
        custom: true
      }
      
      setUserGoals(prev => [...prev, customGoalData])
      setSelectedGoals(prev => new Set([...prev, customGoalData.id]))
      setCustomGoal('')
      
      trackEvent('onboarding_custom_goal_added', { goal: customGoal.trim() })
    }
  }
  
  const handleComplete = () => {
    console.log('🚀 handleComplete called')
    
    const selectedGoalObjects = [
      ...goalOptions.filter(g => selectedGoals.has(g.id)),
      ...userGoals.filter(g => selectedGoals.has(g.id))
    ]
    
    // Update user profile with completion data
    const completionData = {
      onboardingCompletedAt: new Date().toISOString(),
      selectedGoals: selectedGoalObjects,
      onboardingDuration: Date.now() - startTime,
      isOnboarded: true,
      preferences: {
        primaryGoals: Array.from(selectedGoals),
        completedFirstCreation: true,
        preferredExperience: selectedGoals.has('stress-relief') ? 'wellness' : 
                             selectedGoals.has('creative-exploration') ? 'creative' : 'balanced'
      }
    }
    
    setUserProfile(completionData)
    
    trackEvent('onboarding_completed_successfully', {
      timeSpent: Date.now() - startTime,
      goalCount: selectedGoals.size,
      selectedGoals: Array.from(selectedGoals),
      hasCustomGoal: userGoals.length > 0
    })
    
    showNotification('success', 'Welcome to Vibe-Synth! Your musical journey begins now! 🎵', 4000)
    
    // Call onComplete if provided, otherwise just log
    if (typeof onComplete === 'function') {
      onComplete({
        timeSpent: Date.now() - startTime,
        goals: selectedGoalObjects,
        completionData
      })
    } else {
      console.log('✅ Onboarding completed! No onComplete handler provided.')
      console.log('Completion data:', completionData)
    }
  }
  
  const getMotivationalMessage = () => {
    if (selectedGoals.has('stress-relief')) {
      return "Your voice will be your sanctuary. Let music calm your mind."
    } else if (selectedGoals.has('creative-exploration')) {
      return "Every emotion is a new song waiting to be discovered."
    } else if (selectedGoals.has('emotional-expression')) {
      return "Your feelings matter. Let them sing through your music."
    } else if (selectedGoals.has('mindfulness')) {
      return "Find peace in the harmony between your voice and soul."
    } else if (selectedGoals.has('social-sharing')) {
      return "Your musical emotions can touch and inspire others."
    } else {
      return "Every voice has a story. Let yours create beautiful music."
    }
  }
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      
      {/* Celebration Phase */}
      {celebrationPhase === 'celebration' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          {/* Confetti-like particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, (Math.random() - 0.5) * 200, 0],
                  rotate: [0, 360, 0],
                  scale: [1, 1.5, 0]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
          
          <motion.div
            className="w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
              boxShadow: [
                '0 0 30px rgba(251, 191, 36, 0.5)',
                '0 0 60px rgba(251, 191, 36, 0.8)',
                '0 0 30px rgba(251, 191, 36, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-8xl">🎉</div>
          </motion.div>
          
          <div className="space-y-4">
            <motion.h1
              className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Congratulations!
            </motion.h1>
            <h2 className="text-2xl font-semibold text-white">
              You're Now Part of Vibe-Synth! 🎵
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl">
              You've successfully completed your journey from voice to music. 
              Your emotional expression now has a soundtrack!
            </p>
          </div>
        </motion.div>
      )}
      
      {/* Achievements Phase */}
      {celebrationPhase === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-4xl"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <div className="text-5xl">🏆</div>
          </div>
          
          <h3 className="text-3xl font-bold text-green-400">
            Your Onboarding Achievements
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.label}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-6 rounded-xl border border-green-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className="font-semibold text-white mb-1">{achievement.label}</h4>
                <p className="text-green-400 font-bold">{achievement.value}</p>
              </motion.div>
            ))}
          </div>
          
          <p className="text-lg text-gray-300">
            You're fully set up and ready to create amazing music with your voice!
          </p>
        </motion.div>
      )}
      
      {/* Goals Phase */}
      {celebrationPhase === 'goals' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-6xl"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <div className="text-5xl">🎯</div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-white">
              What Do You Hope to Achieve?
            </h3>
            <p className="text-lg text-gray-300">
              Select your goals to personalize your Vibe-Synth experience
            </p>
          </div>
          
          {/* Goal Selection Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalOptions.map((goal) => (
              <motion.div
                key={goal.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedGoals.has(goal.id)
                    ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/50'
                    : 'border-gray-600 hover:border-gray-500 bg-gradient-to-br from-gray-800/50 to-gray-900/50'
                }`}
                onClick={() => handleGoalToggle(goal.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{goal.icon}</div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white mb-2">{goal.title}</h4>
                    <p className="text-sm text-gray-400">{goal.description}</p>
                  </div>
                  {selectedGoals.has(goal.id) && (
                    <motion.div
                      className="text-purple-400 text-xl ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✅
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Custom Goal Input */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Have another goal?</h4>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Enter your personal goal..."
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomGoalSubmit()}
              />
              <motion.button
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors"
                onClick={handleCustomGoalSubmit}
                disabled={!customGoal.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>
          </div>
          
          {/* Custom Goals Display */}
          {userGoals.length > 0 && (
            <div className="space-y-2">
              {userGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`inline-block p-3 rounded-full border-2 cursor-pointer transition-all ${
                    selectedGoals.has(goal.id)
                      ? 'border-purple-500 bg-purple-900/50'
                      : 'border-gray-600 bg-gray-800/50'
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <span className="text-white">{goal.icon} {goal.title}</span>
                  {selectedGoals.has(goal.id) && <span className="text-purple-400 ml-2">✅</span>}
                </div>
              ))}
            </div>
          )}
          
          {/* Motivational Message */}
          {selectedGoals.size > 0 && (
            <motion.div
              className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-lg italic text-gray-300">
                "{getMotivationalMessage()}"
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Complete Button */}
      {celebrationPhase === 'goals' && (
        <motion.div
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm text-gray-400 text-center">
            {selectedGoals.size === 0 
              ? 'Select at least one goal to continue' 
              : `${selectedGoals.size} goal${selectedGoals.size > 1 ? 's' : ''} selected`
            }
          </p>
          
          <motion.button
            className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleComplete}
            disabled={selectedGoals.size === 0}
            whileHover={selectedGoals.size > 0 ? { scale: 1.05 } : {}}
            whileTap={selectedGoals.size > 0 ? { scale: 0.95 } : {}}
          >
            🚀 Begin Your Musical Journey
          </motion.button>
          
          {selectedGoals.size > 0 && (
            <motion.p
              className="text-center text-green-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Great choices! Vibe-Synth is now personalized for your goals.
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default CompletionStep