import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useVoiceInput } from '../hooks/useVoiceInput';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StoryCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 30px;
  max-width: 800px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  margin-bottom: 20px;
`;

const StoryImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 15px;
  margin-bottom: 20px;
`;

const StoryText = styled.div`
  font-size: 1.2rem;
  line-height: 1.6;
  color: #333;
  text-align: center;
`;

const NavigationControls = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const NavButton = styled(motion.button)`
  padding: 15px 30px;
  border-radius: 50px;
  border: none;
  background: #667eea;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
`;

const VoiceIndicator = styled(motion.div)<{ $isListening: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$isListening ? '#ff6b6b' : '#6c5ce7'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  margin: 20px 0;
`;

const PageInfo = styled.div`
  color: white;
  font-size: 1.1rem;
  margin: 10px 0;
  text-align: center;
`;

export const SimpleStoryViewer: React.FC = () => {
  const { currentStory, currentPage, setCurrentPage } = useStore();
  const { isListening, startListening, stopListening, transcript, isSupported, speakText } = useVoiceInput();
  const [magicalEffect, setMagicalEffect] = useState(false);

  useEffect(() => {
    // Listen for magical effects
    const handleMagicalSpell = () => {
      setMagicalEffect(true);
      setTimeout(() => setMagicalEffect(false), 2000);
    };

    window.addEventListener('magicalSpell', handleMagicalSpell);
    return () => window.removeEventListener('magicalSpell', handleMagicalSpell);
  }, []);

  useEffect(() => {
    // Auto-narrate when page changes
    if (currentStory && speakText) {
      const currentPageData = currentStory.pages[currentPage];
      
      // Check if we have ElevenLabs audio URL
      if (currentPageData.audioUrl) {
        // Play the AI-generated audio
        const audio = new Audio(currentPageData.audioUrl);
        audio.play().catch(error => {
          console.warn('Audio playback failed, using TTS fallback:', error);
          // Fallback to browser TTS
          setTimeout(() => {
            speakText(currentPageData.text);
          }, 500);
        });
      } else {
        // Use browser TTS as fallback
        setTimeout(() => {
          speakText(currentPageData.text);
        }, 500);
      }
    }
  }, [currentPage, currentStory, speakText]);

  if (!currentStory) {
    return (
      <Container>
        <StoryCard>
          <StoryText>No story to display. Please create a story first!</StoryText>
        </StoryCard>
      </Container>
    );
  }

  const currentPageData = currentStory.pages[currentPage];
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < currentStory.pages.length - 1;

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      setCurrentPage(currentPage + 1);
    }
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Container>
      <PageInfo>
        📖 {currentStory.title} - Page {currentPage + 1} of {currentStory.pages.length}
      </PageInfo>

      <StoryCard
        animate={{
          scale: magicalEffect ? [1, 1.05, 1] : 1,
          rotate: magicalEffect ? [0, 2, -2, 0] : 0,
        }}
        transition={{ duration: 0.5 }}
      >
        <StoryImage
          src={currentPageData.imageUrl || 'https://via.placeholder.com/800x300/88B0D3/FFFFFF?text=Magical+Story'}
          alt={`Story page ${currentPage + 1}`}
          onClick={() => {
            // Tap interaction
            speakText("You discovered something magical!");
          }}
        />
        
        <StoryText>{currentPageData.text}</StoryText>
      </StoryCard>

      {isSupported && (
        <VoiceIndicator
          $isListening={isListening}
          onClick={toggleVoiceListening}
          animate={{
            scale: isListening ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: isListening ? Infinity : 0,
          }}
        >
          🎤
        </VoiceIndicator>
      )}

      {transcript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'rgba(255,255,255,0.9)',
            padding: '10px',
            borderRadius: '10px',
            margin: '10px',
            color: '#333'
          }}
        >
          "👄 {transcript}"
        </motion.div>
      )}

      <NavigationControls>
        <NavButton
          onClick={handlePrevious}
          disabled={!canGoBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ opacity: canGoBack ? 1 : 0.5 }}
        >
          ← Previous
        </NavButton>
        
        <NavButton
          onClick={() => speakText(currentPageData.text)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔊 Read Again
        </NavButton>

        <NavButton
          onClick={handleNext}
          disabled={!canGoForward}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ opacity: canGoForward ? 1 : 0.5 }}
        >
          Next →
        </NavButton>
      </NavigationControls>

      {magicalEffect && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '3rem',
            pointerEvents: 'none',
          }}
        >
          ✨ ABRACADABRA! ✨
        </motion.div>
      )}

      <motion.div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(255,255,255,0.9)',
          padding: '10px',
          borderRadius: '10px',
          fontSize: '0.9rem',
          color: '#666',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        🎤 Try saying: "next page", "abracadabra", "read again"
      </motion.div>
    </Container>
  );
};