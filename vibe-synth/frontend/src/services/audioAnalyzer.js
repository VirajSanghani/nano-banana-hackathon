// Audio analysis utilities for pitch and volume detection

export function analyzeAudio(analyser) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Float32Array(bufferLength)
  analyser.getFloatFrequencyData(dataArray)
  
  // Calculate volume (RMS)
  const volume = calculateVolume(dataArray)
  
  // Detect pitch using autocorrelation
  const pitch = detectPitch(analyser)
  
  return { pitch, volume }
}

function calculateVolume(dataArray) {
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    sum += Math.pow(10, dataArray[i] / 20)
  }
  const rms = Math.sqrt(sum / dataArray.length)
  return Math.min(1, rms * 10) // Normalize to 0-1
}

function detectPitch(analyser) {
  const bufferLength = analyser.fftSize
  const buffer = new Float32Array(bufferLength)
  analyser.getFloatTimeDomainData(buffer)
  
  // Simple autocorrelation-based pitch detection
  const sampleRate = analyser.context.sampleRate
  const minPeriod = Math.floor(sampleRate / 800) // 800 Hz max
  const maxPeriod = Math.floor(sampleRate / 80)  // 80 Hz min
  
  let maxCorrelation = 0
  let bestPeriod = 0
  
  for (let period = minPeriod; period < maxPeriod; period++) {
    let correlation = 0
    for (let i = 0; i < bufferLength - period; i++) {
      correlation += buffer[i] * buffer[i + period]
    }
    
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation
      bestPeriod = period
    }
  }
  
  const frequency = bestPeriod > 0 ? sampleRate / bestPeriod : 0
  return frequency
}

// Convert frequency to musical note
export function frequencyToNote(frequency) {
  if (frequency < 80 || frequency > 800) return null
  
  const A4 = 440
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  
  const halfSteps = 12 * Math.log2(frequency / A4)
  const noteIndex = Math.round(halfSteps + 9) % 12
  const octave = Math.floor((halfSteps + 9) / 12) + 4
  
  return notes[noteIndex] + octave
}

// Map pitch to synthesizer parameters
export function pitchToSynthParams(pitch, emotion) {
  const baseNote = frequencyToNote(pitch) || 'C4'
  
  // Adjust based on emotion
  const emotionOffsets = {
    joy: 2,      // Major third up
    sadness: -3, // Minor third down
    energy: 0,   // No change
    calm: -5     // Perfect fourth down
  }
  
  const offset = emotionOffsets[emotion] || 0
  return {
    note: baseNote,
    offset: offset
  }
}