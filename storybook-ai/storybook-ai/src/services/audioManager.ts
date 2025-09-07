/**
 * Advanced Audio Management System
 * Handles narration, background music, and sound effects without collisions
 */

export class AudioManager {
  private static instance: AudioManager;
  private currentNarration: HTMLAudioElement | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundEffects: HTMLAudioElement[] = [];
  private isNarrationPlaying = false;
  private isMuted = false;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Play narration audio with proper management
   */
  async playNarration(audioUrl: string, fallbackText?: string): Promise<void> {
    console.log('🎵 Playing narration:', audioUrl ? 'AI Audio' : 'TTS Fallback');

    // Stop any existing narration
    this.stopNarration();

    try {
      if (audioUrl) {
        // Play ElevenLabs audio
        await this.playElevenLabsAudio(audioUrl);
      } else if (fallbackText) {
        // Fallback to browser TTS
        await this.playTextToSpeech(fallbackText);
      }
    } catch (error) {
      console.warn('Narration failed, trying TTS fallback:', error);
      if (fallbackText) {
        await this.playTextToSpeech(fallbackText);
      }
    }
  }

  /**
   * Play ElevenLabs audio with proper error handling
   */
  private async playElevenLabsAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.currentNarration = new Audio(audioUrl);
      this.currentNarration.volume = 0.8;
      
      this.currentNarration.onloadeddata = () => {
        console.log('✅ ElevenLabs audio loaded successfully');
      };

      this.currentNarration.onplay = () => {
        this.isNarrationPlaying = true;
        console.log('🎤 AI narration started');
      };

      this.currentNarration.onended = () => {
        this.isNarrationPlaying = false;
        console.log('✨ AI narration completed');
        resolve();
      };

      this.currentNarration.onerror = (error) => {
        console.warn('❌ ElevenLabs audio error:', error);
        this.isNarrationPlaying = false;
        reject(error);
      };

      // Start playing
      this.currentNarration.play().catch(reject);
    });
  }

  /**
   * Play text-to-speech as fallback
   */
  private async playTextToSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      // Stop any existing speech synthesis
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      if ('speechSynthesis' in window && text) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Enhanced voice settings for children
        utterance.rate = 0.85; // Slightly slower for kids
        utterance.pitch = 1.1;  // Slightly higher pitch
        utterance.volume = 0.9;

        // Try to find a child-friendly voice
        const voices = window.speechSynthesis.getVoices();
        const childFriendlyVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('child') ||
          voice.lang.startsWith('en-')
        );

        if (childFriendlyVoice) {
          utterance.voice = childFriendlyVoice;
        }

        utterance.onstart = () => {
          this.isNarrationPlaying = true;
          console.log('🗣️ TTS narration started');
        };

        utterance.onend = () => {
          this.isNarrationPlaying = false;
          console.log('✨ TTS narration completed');
          resolve();
        };

        utterance.onerror = () => {
          this.isNarrationPlaying = false;
          console.warn('❌ TTS error');
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  /**
   * Stop all narration
   */
  stopNarration(): void {
    // Stop ElevenLabs audio
    if (this.currentNarration) {
      this.currentNarration.pause();
      this.currentNarration.currentTime = 0;
      this.currentNarration = null;
    }

    // Stop browser TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    this.isNarrationPlaying = false;
    console.log('🔇 All narration stopped');
  }

  /**
   * Play background music
   */
  async playBackgroundMusic(musicUrl: string, volume: number = 0.3): Promise<void> {
    try {
      // Stop existing background music
      this.stopBackgroundMusic();

      this.backgroundMusic = new Audio(musicUrl);
      this.backgroundMusic.volume = volume;
      this.backgroundMusic.loop = true;

      this.backgroundMusic.onloadeddata = () => {
        console.log('🎼 Background music loaded');
      };

      this.backgroundMusic.onplay = () => {
        console.log('🎵 Background music started');
      };

      await this.backgroundMusic.play();
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic = null;
      console.log('🔇 Background music stopped');
    }
  }

  /**
   * Play magical sound effect
   */
  playMagicalEffect(effectType: 'sparkle' | 'whoosh' | 'chime' | 'celebration'): void {
    // Create simple sound effects using Web Audio API or pre-defined sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let frequency = 440;
    let duration = 500;
    
    switch (effectType) {
      case 'sparkle':
        frequency = 800;
        duration = 300;
        break;
      case 'whoosh':
        frequency = 200;
        duration = 700;
        break;
      case 'chime':
        frequency = 660;
        duration = 800;
        break;
      case 'celebration':
        frequency = 523;
        duration = 1000;
        break;
    }

    this.playTone(audioContext, frequency, duration);
  }

  /**
   * Generate simple tones for sound effects
   */
  private playTone(context: AudioContext, frequency: number, duration: number): void {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  }

  /**
   * Getters for state
   */
  get isPlayingNarration(): boolean {
    return this.isNarrationPlaying;
  }

  get isPlayingMusic(): boolean {
    return this.backgroundMusic !== null && !this.backgroundMusic.paused;
  }

  /**
   * Volume controls
   */
  setNarrationVolume(volume: number): void {
    if (this.currentNarration) {
      this.currentNarration.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setMusicVolume(volume: number): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Mute all audio
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopNarration();
      this.stopBackgroundMusic();
    }
    
    return this.isMuted;
  }
}

export const audioManager = AudioManager.getInstance();