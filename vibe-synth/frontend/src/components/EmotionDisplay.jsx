import { motion } from 'framer-motion'
import useVibeStore from '../stores/vibeStore'

function EmotionDisplay() {
  const { emotion, emotionConfidence } = useVibeStore()
  
  const emotionConfig = {
    joy: {
      emoji: '😊',
      color: 'from-yellow-400 to-orange-400',
      label: 'Joyful'
    },
    sadness: {
      emoji: '😔',
      color: 'from-blue-400 to-indigo-400',
      label: 'Melancholic'
    },
    energy: {
      emoji: '⚡',
      color: 'from-red-400 to-pink-400',
      label: 'Energetic'
    },
    calm: {
      emoji: '🍃',
      color: 'from-green-400 to-teal-400',
      label: 'Calm'
    }
  }
  
  const config = emotionConfig[emotion] || emotionConfig.calm
  
  return (
    <motion.div
      className="flex items-center gap-4 bg-black/30 backdrop-blur-md rounded-full px-6 py-3"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Emotion Emoji */}
      <motion.div
        className="text-4xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse'
        }}
      >
        {config.emoji}
      </motion.div>
      
      {/* Emotion Label */}
      <div className="flex flex-col">
        <span className={`text-lg font-semibold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
          {config.label}
        </span>
        
        {/* Confidence Bar */}
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
          <motion.div
            className={`h-full bg-gradient-to-r ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${emotionConfidence * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
      
      {/* Pulse indicator */}
      <div className="relative">
        <motion.div
          className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${config.color}`}
          animate={{
            scale: [1, 2, 2.5],
            opacity: [0.5, 0.2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      </div>
    </motion.div>
  )
}

export default EmotionDisplay