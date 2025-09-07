import { create } from 'zustand';
import { Story, GenerationProgress, AppSettings, VoiceInputState } from '../types';

interface StoryStore {
  // Current Story
  currentStory: Story | null;
  currentPage: number;
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  
  // Story Library
  stories: Story[];
  
  // Voice Input
  voiceInput: VoiceInputState;
  
  // Settings
  settings: AppSettings;
  
  // Actions
  setCurrentStory: (story: Story) => void;
  setCurrentPage: (page: number) => void;
  setGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: GenerationProgress | null) => void;
  addStory: (story: Story) => void;
  removeStory: (id: string) => void;
  setVoiceInput: (input: Partial<VoiceInputState>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  reset: () => void;
}

const initialSettings: AppSettings = {
  nightMode: false,
  autoNightMode: true,
  narrationSpeed: 1,
  musicVolume: 0.2,
  textSize: 'medium',
  parentLock: false,
};

const initialVoiceInput: VoiceInputState = {
  isListening: false,
  transcript: '',
  confidence: 0,
};

export const useStore = create<StoryStore>((set) => ({
  // State
  currentStory: null,
  currentPage: 0,
  isGenerating: false,
  generationProgress: null,
  stories: [],
  voiceInput: initialVoiceInput,
  settings: initialSettings,
  
  // Actions
  setCurrentStory: (story) => set({ currentStory: story, currentPage: 0 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  addStory: (story) => set((state) => ({
    stories: [story, ...state.stories].slice(0, 20), // Keep max 20 stories
  })),
  
  removeStory: (id) => set((state) => ({
    stories: state.stories.filter((s) => s.id !== id),
  })),
  
  setVoiceInput: (input) => set((state) => ({
    voiceInput: { ...state.voiceInput, ...input },
  })),
  
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings },
  })),
  
  reset: () => set({
    currentStory: null,
    currentPage: 0,
    isGenerating: false,
    generationProgress: null,
  }),
}));