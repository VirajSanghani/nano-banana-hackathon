import * as Tone from 'tone'

export class VibeSynthesizer {
  constructor() {
    this.isInitialized = false
    this.currentEmotion = 'calm'
    this.emotionIntensity = 0.5
    
    // Initialize Tone.js components
    this.reverb = new Tone.Reverb(2).toDestination()
    this.delay = new Tone.FeedbackDelay('8n', 0.3).connect(this.reverb)
    this.filter = new Tone.Filter(800, 'lowpass').connect(this.delay)
    
    // Create multiple synth layers
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 2
      }
    }).connect(this.filter)
    
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.8,
        release: 4
      },
      volume: -10
    }).connect(this.reverb)
    
    this.bassSynth = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1
      },
      volume: -5
    }).connect(this.reverb)
    
    // Emotion-based presets
    this.emotionPresets = {
      joy: {
        scale: ['C4', 'E4', 'G4', 'B4', 'D5'],
        tempo: 120,
        reverb: 0.3,
        filter: 2000,
        delay: 0.2
      },
      sadness: {
        scale: ['A3', 'C4', 'E4', 'G4', 'B4'],
        tempo: 60,
        reverb: 0.7,
        filter: 600,
        delay: 0.4
      },
      energy: {
        scale: ['D4', 'F#4', 'A4', 'C5', 'E5'],
        tempo: 140,
        reverb: 0.2,
        filter: 3000,
        delay: 0.1
      },
      calm: {
        scale: ['G3', 'A3', 'C4', 'D4', 'F4'],
        tempo: 80,
        reverb: 0.5,
        filter: 800,
        delay: 0.3
      }
    }
    
    // Start with calm preset
    this.updateEmotion('calm', 0.5)
  }
  
  async initialize() {
    if (this.isInitialized) return
    await Tone.start()
    this.isInitialized = true
  }
  
  updateEmotion(emotion, intensity) {
    this.currentEmotion = emotion
    this.emotionIntensity = intensity
    
    const preset = this.emotionPresets[emotion]
    if (!preset) return
    
    // Update effects based on emotion
    this.reverb.wet.value = preset.reverb * intensity
    this.delay.wet.value = preset.delay * intensity
    this.filter.frequency.rampTo(preset.filter, 0.5)
    
    // Update synth parameters
    this.leadSynth.set({
      envelope: {
        attack: 0.1 / intensity,
        release: 2 * intensity
      }
    })
    
    // Set tempo for any sequences
    Tone.Transport.bpm.value = preset.tempo
  }
  
  playNote(pitch, volume) {
    if (!this.isInitialized) {
      this.initialize()
    }
    
    const preset = this.emotionPresets[this.currentEmotion]
    const scale = preset.scale
    
    // Map pitch to scale note
    const noteIndex = Math.floor((pitch / 800) * scale.length)
    const note = scale[Math.min(noteIndex, scale.length - 1)]
    
    // Adjust volume based on emotion intensity
    const adjustedVolume = volume * this.emotionIntensity
    
    // Play the note with slight randomization for organic feel
    const detune = (Math.random() - 0.5) * 20 // ±10 cents
    this.leadSynth.triggerAttackRelease(
      note,
      '16n',
      undefined,
      adjustedVolume
    )
    
    // Add harmony based on emotion
    if (this.emotionIntensity > 0.6) {
      this.playHarmony(note, adjustedVolume * 0.5)
    }
    
    // Add bass note occasionally
    if (Math.random() < 0.2) {
      this.playBass(note, adjustedVolume * 0.7)
    }
  }
  
  playHarmony(rootNote, volume) {
    const noteNumber = Tone.Frequency(rootNote).toMidi()
    
    // Choose harmony based on emotion
    const harmonyIntervals = {
      joy: [4, 7], // Major third and fifth
      sadness: [3, 7], // Minor third and fifth
      energy: [5, 7], // Fourth and fifth
      calm: [7, 12] // Fifth and octave
    }
    
    const intervals = harmonyIntervals[this.currentEmotion] || [7]
    
    intervals.forEach((interval, i) => {
      setTimeout(() => {
        const harmonyNote = Tone.Frequency(noteNumber + interval, 'midi')
        this.padSynth.triggerAttackRelease(
          harmonyNote,
          '2n',
          undefined,
          volume
        )
      }, i * 50) // Slight arpeggio effect
    })
  }
  
  playBass(rootNote, volume) {
    const noteNumber = Tone.Frequency(rootNote).toMidi()
    const bassNote = Tone.Frequency(noteNumber - 12, 'midi') // One octave down
    
    this.bassSynth.triggerAttackRelease(
      bassNote,
      '4n',
      undefined,
      volume
    )
  }
  
  // Create ambient pad
  startAmbientPad() {
    const preset = this.emotionPresets[this.currentEmotion]
    const chord = preset.scale.slice(0, 3)
    
    // Play sustained chord
    this.padSynth.triggerAttack(chord)
  }
  
  stopAmbientPad() {
    this.padSynth.releaseAll()
  }
  
  dispose() {
    // Clean up all Tone.js instances
    this.leadSynth.dispose()
    this.padSynth.dispose()
    this.bassSynth.dispose()
    this.reverb.dispose()
    this.delay.dispose()
    this.filter.dispose()
  }
}