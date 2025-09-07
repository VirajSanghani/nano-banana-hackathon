import * as Tone from 'tone'

export class VibeSynthesizer {
  constructor() {
    this.isInitialized = false
    this.currentEmotion = 'calm'
    this.emotionIntensity = 0.5
    
    // Initialize advanced audio effects chain
    this.reverb = new Tone.Reverb(2).toDestination()
    this.delay = new Tone.FeedbackDelay('8n', 0.3).connect(this.reverb)
    this.filter = new Tone.Filter(800, 'lowpass').connect(this.delay)
    
    // Advanced 3D spatial audio effects
    this.panner3D = new Tone.Panner3D({
      positionX: 0,
      positionY: 0,
      positionZ: -1,
      orientationX: 0,
      orientationY: 0,
      orientationZ: 1
    }).connect(this.filter)
    
    // Harmonic enhancement
    this.chorus = new Tone.Chorus(4, 2.5, 0.5).connect(this.panner3D)
    this.harmonicDistortion = new Tone.Distortion(0.4).connect(this.chorus)
    
    // Dynamic compressor for consistent levels
    this.compressor = new Tone.Compressor(-30, 3).connect(this.harmonicDistortion)
    
    // Frequency shifter for unique textures
    this.frequencyShifter = new Tone.FrequencyShifter().connect(this.compressor)
    
    // Phaser for movement
    this.phaser = new Tone.Phaser({
      frequency: 0.5,
      octaves: 3,
      stages: 10,
      Q: 10,
      baseFrequency: 350
    }).connect(this.frequencyShifter)
    
    // Create multiple synth layers
    this.leadSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.4,
        release: 2
      }
    }).connect(this.phaser)
    
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
    
    // Comprehensive emotion-based presets with 16 distinct emotions
    this.emotionPresets = {
      // Positive Emotions
      joy: {
        scale: ['C4', 'E4', 'G4', 'B4', 'D5'],
        tempo: 120,
        reverb: 0.3,
        filter: 2000,
        delay: 0.2,
        oscillator: 'triangle',
        harmonics: [1, 0.5, 0.25],
        brightness: 0.8
      },
      excitement: {
        scale: ['D4', 'F#4', 'A4', 'C5', 'E5'],
        tempo: 140,
        reverb: 0.2,
        filter: 3000,
        delay: 0.1,
        oscillator: 'sawtooth',
        harmonics: [1, 0.7, 0.4, 0.2],
        brightness: 0.9
      },
      love: {
        scale: ['F4', 'A4', 'C5', 'E5', 'G5'],
        tempo: 90,
        reverb: 0.6,
        filter: 1500,
        delay: 0.3,
        oscillator: 'sine',
        harmonics: [1, 0.4, 0.2, 0.1],
        brightness: 0.6
      },
      bliss: {
        scale: ['G4', 'B4', 'D5', 'F#5', 'A5'],
        tempo: 70,
        reverb: 0.8,
        filter: 1200,
        delay: 0.5,
        oscillator: 'triangle',
        harmonics: [1, 0.3, 0.15, 0.08],
        brightness: 0.5
      },
      hope: {
        scale: ['E4', 'G#4', 'B4', 'D5', 'F#5'],
        tempo: 100,
        reverb: 0.4,
        filter: 1800,
        delay: 0.25,
        oscillator: 'triangle',
        harmonics: [1, 0.6, 0.3, 0.15],
        brightness: 0.7
      },
      euphoria: {
        scale: ['A4', 'C#5', 'E5', 'G#5', 'B5'],
        tempo: 160,
        reverb: 0.3,
        filter: 4000,
        delay: 0.1,
        oscillator: 'square',
        harmonics: [1, 0.8, 0.6, 0.4, 0.2],
        brightness: 1.0
      },

      // Calm/Peaceful Emotions  
      calm: {
        scale: ['G3', 'A3', 'C4', 'D4', 'F4'],
        tempo: 80,
        reverb: 0.5,
        filter: 800,
        delay: 0.3,
        oscillator: 'sine',
        harmonics: [1, 0.3, 0.1],
        brightness: 0.4
      },
      peaceful: {
        scale: ['C4', 'D4', 'F4', 'G4', 'A4'],
        tempo: 65,
        reverb: 0.7,
        filter: 600,
        delay: 0.4,
        oscillator: 'sine',
        harmonics: [1, 0.2, 0.05],
        brightness: 0.3
      },
      zen: {
        scale: ['A3', 'C4', 'D4', 'F4', 'G4'],
        tempo: 50,
        reverb: 0.9,
        filter: 400,
        delay: 0.6,
        oscillator: 'sine',
        harmonics: [1, 0.1, 0.02],
        brightness: 0.2
      },
      
      // Sad/Melancholy Emotions
      sadness: {
        scale: ['A3', 'C4', 'E4', 'G4', 'B4'],
        tempo: 60,
        reverb: 0.7,
        filter: 600,
        delay: 0.4,
        oscillator: 'triangle',
        harmonics: [1, 0.4, 0.2],
        brightness: 0.3
      },
      melancholy: {
        scale: ['D3', 'F3', 'A3', 'C4', 'E4'],
        tempo: 55,
        reverb: 0.8,
        filter: 500,
        delay: 0.5,
        oscillator: 'triangle',
        harmonics: [1, 0.3, 0.1],
        brightness: 0.25
      },
      longing: {
        scale: ['G3', 'Bb3', 'D4', 'F4', 'A4'],
        tempo: 75,
        reverb: 0.6,
        filter: 700,
        delay: 0.35,
        oscillator: 'sine',
        harmonics: [1, 0.5, 0.25],
        brightness: 0.35
      },

      // Intense/Energetic Emotions
      anger: {
        scale: ['E3', 'G3', 'B3', 'D4', 'F#4'],
        tempo: 130,
        reverb: 0.2,
        filter: 2500,
        delay: 0.15,
        oscillator: 'sawtooth',
        harmonics: [1, 0.8, 0.6, 0.4],
        brightness: 0.85
      },
      passion: {
        scale: ['F#3', 'A3', 'C#4', 'E4', 'G#4'],
        tempo: 110,
        reverb: 0.4,
        filter: 1800,
        delay: 0.2,
        oscillator: 'sawtooth',
        harmonics: [1, 0.7, 0.5, 0.3],
        brightness: 0.75
      },
      determination: {
        scale: ['C4', 'Eb4', 'G4', 'Bb4', 'D5'],
        tempo: 120,
        reverb: 0.3,
        filter: 2200,
        delay: 0.18,
        oscillator: 'square',
        harmonics: [1, 0.6, 0.4, 0.25],
        brightness: 0.8
      },

      // Complex Emotions
      nostalgia: {
        scale: ['Bb3', 'D4', 'F4', 'A4', 'C5'],
        tempo: 85,
        reverb: 0.6,
        filter: 1000,
        delay: 0.3,
        oscillator: 'triangle',
        harmonics: [1, 0.4, 0.2, 0.1],
        brightness: 0.45
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
    
    // Update 3D spatial position based on emotion
    this.update3DSpatialEffects(emotion, intensity)
    
    // Update harmonic effects
    this.updateHarmonicEffects(emotion, intensity)
    
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
  
  // Advanced 3D spatial audio control
  update3DSpatialEffects(emotion, intensity) {
    try {
      // Map emotions to 3D positions for immersive experience
      const spatialMappings = {
        // Uplifting emotions - higher position
        joy: { x: 0, y: 1 * intensity, z: -0.5 },
        excitement: { x: 0.5 * intensity, y: 0.8 * intensity, z: -0.3 },
        love: { x: 0, y: 0.6 * intensity, z: 0 },
        bliss: { x: 0, y: 1.2 * intensity, z: -0.8 },
        hope: { x: 0.3 * intensity, y: 0.8 * intensity, z: -0.5 },
        euphoria: { x: 0.8 * intensity, y: 1.5 * intensity, z: -0.2 },
        
        // Calm emotions - centered position
        calm: { x: 0, y: 0, z: -1 },
        peaceful: { x: 0, y: -0.2 * intensity, z: -1.5 },
        zen: { x: 0, y: -0.5 * intensity, z: -2 },
        
        // Melancholy emotions - lower position
        sadness: { x: -0.3 * intensity, y: -0.8 * intensity, z: -1 },
        melancholy: { x: -0.5 * intensity, y: -1 * intensity, z: -1.2 },
        longing: { x: -0.2 * intensity, y: -0.6 * intensity, z: -0.8 },
        
        // Intense emotions - dynamic movement
        anger: { x: 0.8 * Math.sin(Date.now() * 0.01), y: 0.3, z: -0.5 },
        passion: { x: 0.6 * Math.cos(Date.now() * 0.008), y: 0.5, z: -0.3 },
        determination: { x: 0.4 * intensity, y: 0.2, z: -0.6 },
        
        // Complex emotions - subtle movement
        nostalgia: { x: -0.3 * Math.sin(Date.now() * 0.005), y: -0.4 * intensity, z: -1.5 }
      }
      
      const position = spatialMappings[emotion] || { x: 0, y: 0, z: -1 }
      
      // Smoothly transition spatial position
      this.panner3D.positionX.rampTo(position.x, 2)
      this.panner3D.positionY.rampTo(position.y, 2)
      this.panner3D.positionZ.rampTo(position.z, 2)
      
      // Adjust listener orientation for different emotions
      const orientations = {
        excitement: { x: 0.1, y: 0.2, z: 1 },
        calm: { x: 0, y: -0.1, z: 1 },
        anger: { x: 0.2 * Math.sin(Date.now() * 0.02), y: 0, z: 1 }
      }
      
      const orientation = orientations[emotion] || { x: 0, y: 0, z: 1 }
      
      this.panner3D.orientationX.rampTo(orientation.x, 1)
      this.panner3D.orientationY.rampTo(orientation.y, 1)
      this.panner3D.orientationZ.rampTo(orientation.z, 1)
      
    } catch (error) {
      console.warn('3D spatial effects update failed:', error)
    }
  }
  
  // Advanced harmonic effects control
  updateHarmonicEffects(emotion, intensity) {
    try {
      // Chorus settings per emotion
      const chorusSettings = {
        joy: { frequency: 1.5, delayTime: 2.5, depth: 0.7 },
        excitement: { frequency: 2.0, delayTime: 1.5, depth: 0.9 },
        calm: { frequency: 0.5, delayTime: 4.0, depth: 0.3 },
        sadness: { frequency: 0.3, delayTime: 5.0, depth: 0.4 },
        anger: { frequency: 3.0, delayTime: 1.0, depth: 1.0 }
      }
      
      const setting = chorusSettings[emotion] || chorusSettings.calm
      
      this.chorus.frequency.rampTo(setting.frequency * intensity, 1)
      this.chorus.delayTime = setting.delayTime
      this.chorus.depth = setting.depth * intensity
      
      // Harmonic distortion based on emotion intensity
      const distortionAmount = {
        anger: 0.8,
        passion: 0.6,
        excitement: 0.4,
        joy: 0.2,
        calm: 0.1,
        sadness: 0.15
      }
      
      const distortion = (distortionAmount[emotion] || 0.2) * intensity
      this.harmonicDistortion.distortion = Math.min(0.9, distortion)
      
      // Frequency shifter for unique textures
      const shiftAmounts = {
        nostalgia: -50 * intensity,
        melancholy: -30 * intensity,
        hope: 40 * intensity,
        euphoria: 80 * intensity,
        excitement: 60 * intensity
      }
      
      const shift = shiftAmounts[emotion] || 0
      this.frequencyShifter.frequency.rampTo(shift, 0.5)
      
      // Phaser modulation
      const phaserSettings = {
        excitement: { frequency: 1.2, depth: 0.8 },
        joy: { frequency: 0.8, depth: 0.6 },
        calm: { frequency: 0.2, depth: 0.3 },
        anger: { frequency: 2.0, depth: 1.0 }
      }
      
      const phaserSetting = phaserSettings[emotion] || { frequency: 0.5, depth: 0.4 }
      
      this.phaser.frequency.rampTo(phaserSetting.frequency * intensity, 1)
      this.phaser.Q.rampTo(10 + (phaserSetting.depth * intensity * 20), 1)
      
    } catch (error) {
      console.warn('Harmonic effects update failed:', error)
    }
  }
  
  dispose() {
    // Clean up all Tone.js instances
    this.leadSynth.dispose()
    this.padSynth.dispose()
    this.bassSynth.dispose()
    this.reverb.dispose()
    this.delay.dispose()
    this.filter.dispose()
    this.panner3D.dispose()
    this.chorus.dispose()
    this.harmonicDistortion.dispose()
    this.compressor.dispose()
    this.frequencyShifter.dispose()
    this.phaser.dispose()
  }
}