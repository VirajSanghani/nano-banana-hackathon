import { useEffect, useRef } from 'react'
import useVibeStore from '../stores/vibeStore'
import { analyzeAudio } from '../services/audioAnalyzer'
import { VibeSynthesizer } from '../services/synthesizer'
import { connectWebSocket } from '../services/websocket'

function AudioCapture() {
  const { 
    isRecording, 
    audioContext,
    updateAudioMetrics,
    updateEmotion,
    emotion
  } = useVibeStore()
  
  const analyserRef = useRef(null)
  const synthRef = useRef(null)
  const socketRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!isRecording || !audioContext) return

    // Initialize synthesizer
    synthRef.current = new VibeSynthesizer()
    
    // Initialize WebSocket
    socketRef.current = connectWebSocket({
      onEmotionUpdate: (data) => {
        updateEmotion(data.emotion, data.confidence)
        if (synthRef.current) {
          synthRef.current.updateEmotion(data.emotion, data.confidence)
        }
      }
    })

    // Setup audio capture
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        analyserRef.current = analyser

        // Start audio analysis loop
        const analyze = () => {
          if (!isRecording) return
          
          const metrics = analyzeAudio(analyser)
          updateAudioMetrics(metrics.pitch, metrics.volume)
          
          // Play notes based on pitch and volume
          if (synthRef.current && metrics.volume > 0.1) {
            synthRef.current.playNote(metrics.pitch, metrics.volume)
          }
          
          requestAnimationFrame(analyze)
        }
        analyze()

        // Setup speech recognition
        if ('webkitSpeechRecognition' in window) {
          const recognition = new window.webkitSpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'
          
          recognition.onresult = (event) => {
            const last = event.results.length - 1
            const transcript = event.results[last][0].transcript
            
            // Send to backend for emotion analysis
            if (socketRef.current && event.results[last].isFinal) {
              socketRef.current.emit('analyze_text', { text: transcript })
            }
          }
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error)
          }
          
          recognition.start()
          recognitionRef.current = recognition
        }
      })
      .catch(err => {
        console.error('Error accessing microphone:', err)
      })

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (synthRef.current) {
        synthRef.current.dispose()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isRecording, audioContext, updateAudioMetrics, updateEmotion])

  // Update synth emotion when it changes
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.updateEmotion(emotion, 0.8)
    }
  }, [emotion])

  return null // This component doesn't render anything
}

export default AudioCapture