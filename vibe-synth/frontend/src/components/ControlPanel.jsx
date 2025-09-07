import { useState } from 'react'
import { motion } from 'framer-motion'
import useVibeStore from '../stores/vibeStore'

function ControlPanel() {
  const { 
    isRecording, 
    startSession, 
    stopSession,
    sessionRecording,
    resetSession 
  } = useVibeStore()
  
  const [showSettings, setShowSettings] = useState(false)
  const [mode, setMode] = useState('free') // free, meditation, energy
  
  const handleRecord = () => {
    if (isRecording) {
      stopSession()
    } else {
      startSession()
    }
  }
  
  const handleExport = () => {
    if (sessionRecording.length === 0) {
      alert('No recording to export. Start a session first!')
      return
    }
    
    // Create JSON export of the session
    const exportData = {
      timestamp: Date.now(),
      duration: sessionRecording.length,
      data: sessionRecording
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vibe-synth-session-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const modeConfig = {
    free: {
      icon: '🎨',
      label: 'Free Mode',
      description: 'Full emotional range'
    },
    meditation: {
      icon: '🧘',
      label: 'Meditation',
      description: 'Calming responses only'
    },
    energy: {
      icon: '🚀',
      label: 'Energy Mode',
      description: 'Uplifting and energetic'
    }
  }
  
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Main Controls */}
      <div className="flex items-center gap-4">
        {/* Record Button */}
        <motion.button
          onClick={handleRecord}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-vibe-purple hover:bg-vibe-blue'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isRecording ? (
            <motion.div
              className="w-6 h-6 bg-white rounded-sm"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <div className="w-8 h-8 bg-white rounded-full" />
          )}
          
          {/* Pulse effect when recording */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.5, 0.2, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          )}
        </motion.button>
        
        {/* Secondary Controls */}
        <div className="flex gap-2">
          {/* Reset Button */}
          <motion.button
            onClick={resetSession}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Reset Session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
          
          {/* Export Button */}
          <motion.button
            onClick={handleExport}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Export Session"
            disabled={sessionRecording.length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </motion.button>
          
          {/* Settings Button */}
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </div>
      </div>
      
      {/* Mode Selector (shown when settings is open) */}
      {showSettings && (
        <motion.div
          className="flex gap-2 bg-black/30 backdrop-blur-md rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          {Object.entries(modeConfig).map(([key, config]) => (
            <motion.button
              key={key}
              onClick={() => setMode(key)}
              className={`px-4 py-2 rounded-xl transition-all ${
                mode === key
                  ? 'bg-vibe-purple text-white'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{config.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-semibold">{config.label}</div>
                  <div className="text-xs opacity-70">{config.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
      
      {/* Status Text */}
      <div className="text-center">
        {isRecording && (
          <motion.p
            className="text-sm text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Recording: {Math.floor(sessionRecording.length / 20)}s
          </motion.p>
        )}
      </div>
    </div>
  )
}

export default ControlPanel