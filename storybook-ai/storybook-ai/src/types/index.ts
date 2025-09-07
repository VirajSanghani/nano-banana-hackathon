export interface CharacterProfile {
  name: string;
  appearance: string;
  personality: string;
  specialTraits: string[];
  visualAnchors: string[];
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imagePrompt: string;
  audioUrl?: string;
  narrationText?: string;
  hasChoice?: boolean;
  choices?: StoryChoice[];
}

export interface StoryChoice {
  id: string;
  text: string;
  icon: string;
  consequence: string;
}

export interface Story {
  id: string;
  title: string;
  childPrompt: string;
  mainCharacter: CharacterProfile;
  pages: StoryPage[];
  coverImageUrl?: string;
  backgroundMusicUrl?: string;
  createdAt: Date;
  duration?: number;
  theme: 'adventure' | 'friendship' | 'learning' | 'magic' | 'nature';
}

export interface GenerationProgress {
  stage: 'text' | 'images' | 'audio' | 'music' | 'complete';
  message: string;
  progress: number;
}

export interface VoiceInputState {
  isListening: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

export interface AppSettings {
  nightMode: boolean;
  autoNightMode: boolean;
  narrationSpeed: number;
  musicVolume: number;
  textSize: 'small' | 'medium' | 'large';
  parentLock: boolean;
}