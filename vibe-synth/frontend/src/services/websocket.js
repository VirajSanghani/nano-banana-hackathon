import io from 'socket.io-client'

let socket = null

export function connectWebSocket(handlers = {}) {
  if (socket) return socket
  
  socket = io('http://localhost:8000', {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  })
  
  socket.on('connect', () => {
    console.log('Connected to Vibe-Synth backend')
  })
  
  socket.on('disconnect', () => {
    console.log('Disconnected from backend')
  })
  
  // Handle emotion updates from backend
  socket.on('emotion_update', (data) => {
    if (handlers.onEmotionUpdate) {
      handlers.onEmotionUpdate(data)
    }
  })
  
  // Handle synthesis parameter updates
  socket.on('synthesis_update', (data) => {
    if (handlers.onSynthesisUpdate) {
      handlers.onSynthesisUpdate(data)
    }
  })
  
  // Handle visual generation updates
  socket.on('visual_update', (data) => {
    if (handlers.onVisualUpdate) {
      handlers.onVisualUpdate(data)
    }
  })
  
  // Handle errors
  socket.on('error', (error) => {
    console.error('WebSocket error:', error)
    if (handlers.onError) {
      handlers.onError(error)
    }
  })
  
  return socket
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function emitAudioData(data) {
  if (socket && socket.connected) {
    socket.emit('audio_data', data)
  }
}

export function emitTextAnalysis(text) {
  if (socket && socket.connected) {
    socket.emit('analyze_text', { text })
  }
}

export function requestVisualGeneration(emotion, text) {
  if (socket && socket.connected) {
    socket.emit('generate_visual', { emotion, text })
  }
}