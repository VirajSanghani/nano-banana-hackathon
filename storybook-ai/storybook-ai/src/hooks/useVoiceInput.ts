import { useState, useCallback } from 'react';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    setIsListening(true);
    console.log('Voice listening started (demo mode)');
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    console.log('Voice listening stopped');
  }, []);

  const speakText = useCallback((text: string) => {
    console.log('Speaking:', text);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const getCurrentEmotion = useCallback(() => {
    return null;
  }, []);

  const setLanguage = useCallback((language: string) => {
    console.log('Language set to:', language);
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
    transcript,
    speakText,
    getCurrentEmotion,
    setLanguage,
    isSupported: !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition,
  };
};