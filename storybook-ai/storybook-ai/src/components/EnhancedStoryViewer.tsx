import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { audioManager } from '../services/audioManager';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  touch-action: pan-y;
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background 0.2s;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const PageIndicator = styled.span`
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
`;

const AudioControlButton = styled(motion.button)<{ $isPlaying: boolean }>`
  background: ${props => props.$isPlaying ? '#ff6b6b' : '#6c5ce7'};
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoryContainer = styled(motion.div)`
  padding-top: 80px;
  padding-bottom: 100px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StoryCard = styled(motion.div)`
  background: white;
  border-radius: 25px;
  padding: 0;
  max-width: 90%;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
`;

const ImageContainer = styled(motion.div)`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
`;

const StoryImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const MagicalOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  pointer-events: none;
`;

const TextContainer = styled.div`
  padding: 25px;
  background: white;
`;

const StoryText = styled(motion.div)`
  font-size: 1.3rem;
  line-height: 1.7;
  color: #2C3E50;
  font-family: 'Georgia', serif;
  text-align: center;
  margin-bottom: 20px;
`;

const InteractiveHints = styled(motion.div)`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
`;

const HintBadge = styled(motion.span)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const NavigationControls = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 15px;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const NavButton = styled(motion.button)<{ $disabled?: boolean }>`
  padding: 12px 20px;
  border-radius: 25px;
  border: none;
  background: ${props => props.$disabled ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
  font-size: 0.9rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  font-weight: 600;
  opacity: ${props => props.$disabled ? 0.5 : 1};
`;

const VoiceIndicator = styled(motion.div)<{ $isListening: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$isListening ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 'linear-gradient(135deg, #6c5ce7, #5f4fcf)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: white;
  cursor: pointer;
`;

const MagicalEffectOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MagicalText = styled(motion.div)`
  font-size: 4rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.6));
`;

const AudioVisualization = styled(motion.div)<{ $isPlaying: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$isPlaying ? 'rgba(255, 107, 107, 0.8)' : 'rgba(108, 92, 231, 0.8)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
`;

export const EnhancedStoryViewer: React.FC = () => {
  const { currentStory, currentPage, setCurrentPage } = useStore();
  const { isListening, startListening, stopListening, transcript, isSupported } = useVoiceInput();
  const [magicalEffect, setMagicalEffect] = useState<string | null>(null);
  const [showInteractiveHints, setShowInteractiveHints] = useState(true);
  const [tapEffects, setTapEffects] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const effectIdRef = useRef(0);

  // Auto-hide hints after some time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInteractiveHints(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Handle page navigation and audio
  useEffect(() => {
    if (currentStory && currentPage < currentStory.pages.length) {
      const currentPageData = currentStory.pages[currentPage];
      
      // Play narration with proper audio management
      const playNarration = async () => {
        try {
          if (currentPageData.audioUrl) {
            await audioManager.playNarration(currentPageData.audioUrl, currentPageData.narrationText || currentPageData.text);
          } else {
            await audioManager.playNarration('', currentPageData.narrationText || currentPageData.text);
          }
        } catch (error) {
          console.warn('Failed to play narration:', error);
        }
      };

      // Delay narration slightly to allow page transition
      const timer = setTimeout(playNarration, 800);
      return () => clearTimeout(timer);
    }
  }, [currentPage, currentStory]);

  // Handle background music
  useEffect(() => {
    if (currentStory?.backgroundMusicUrl) {
      audioManager.playBackgroundMusic(currentStory.backgroundMusicUrl, 0.3);
    }

    // Cleanup when component unmounts
    return () => {
      audioManager.stopNarration();
      audioManager.stopBackgroundMusic();
    };
  }, [currentStory]);

  // Voice command handling
  useEffect(() => {
    if (transcript && transcript.length > 0) {
      const command = transcript.toLowerCase();
      
      if (command.includes('next') || command.includes('forward')) {
        handleNext();
      } else if (command.includes('back') || command.includes('previous')) {
        handlePrevious();
      } else if (command.includes('again') || command.includes('repeat')) {
        handleReadAgain();
      } else if (command.includes('abracadabra') || command.includes('magic')) {
        triggerMagicalEffect('✨ ABRACADABRA! ✨');
        audioManager.playMagicalEffect('sparkle');
      }
    }
  }, [transcript]);

  if (!currentStory) {
    return (
      <Container>
        <StoryContainer>
          <StoryCard>
            <TextContainer>
              <StoryText>No story to display. Please create a story first!</StoryText>
            </TextContainer>
          </StoryCard>
        </StoryContainer>
      </Container>
    );
  }

  const currentPageData = currentStory.pages[currentPage];
  const canGoBack = currentPage > 0;
  const canGoForward = currentPage < currentStory.pages.length - 1;

  const handlePrevious = () => {
    if (canGoBack) {
      audioManager.stopNarration();
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoForward) {
      audioManager.stopNarration();
      setCurrentPage(currentPage + 1);
    } else {
      // Story completed
      triggerMagicalEffect('🎉 THE END! 🎉');
      audioManager.playMagicalEffect('celebration');
    }
  };

  const handleReadAgain = () => {
    audioManager.stopNarration();
    if (currentPageData.audioUrl) {
      audioManager.playNarration(currentPageData.audioUrl, currentPageData.narrationText || currentPageData.text);
    } else {
      audioManager.playNarration('', currentPageData.narrationText || currentPageData.text);
    }
  };

  const triggerMagicalEffect = (effect: string) => {
    setMagicalEffect(effect);
    setTimeout(() => setMagicalEffect(null), 2000);
  };

  const handleImageTap = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create tap effect
    const effectId = effectIdRef.current++;
    setTapEffects(prev => [...prev, { id: effectId, x, y }]);
    
    // Remove effect after animation
    setTimeout(() => {
      setTapEffects(prev => prev.filter(effect => effect.id !== effectId));
    }, 1000);

    // Trigger magical interaction
    const magicalResponses = [
      '✨ Magical sparkles! ✨',
      '🌟 You found magic! 🌟',
      '🦋 Beautiful butterflies! 🦋',
      '🌈 Rainbow magic! 🌈'
    ];
    
    const randomResponse = magicalResponses[Math.floor(Math.random() * magicalResponses.length)];
    triggerMagicalEffect(randomResponse);
    audioManager.playMagicalEffect('sparkle');
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
      <Header>
        <BackButton onClick={() => { audioManager.stopNarration(); audioManager.stopBackgroundMusic(); window.history.back(); }}>
          ← Back
        </BackButton>
        <PageIndicator>
          📖 Page {currentPage + 1} of {currentStory.pages.length}
        </PageIndicator>
        <AudioControlButton
          $isPlaying={audioManager.isPlayingNarration}
          onClick={handleReadAgain}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔊
        </AudioControlButton>
      </Header>

      <StoryContainer>
        <AnimatePresence mode="wait">
          <StoryCard
            key={currentPage}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <ImageContainer onClick={handleImageTap}>
              <StoryImage
                src={currentPageData.imageUrl || 'https://via.placeholder.com/500x300/88B0D3/FFFFFF?text=Magical+Story'}
                alt={`Story page ${currentPage + 1}`}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                onError={(e) => {
                  console.error('Image failed to load:', currentPageData.imageUrl);
                  e.currentTarget.src = 'https://via.placeholder.com/500x300/FF6B6B/FFFFFF?text=Loading+Image...';
                }}
                onLoad={() => console.log('Image loaded successfully:', currentPageData.imageUrl)}
              />
              
              <AudioVisualization $isPlaying={audioManager.isPlayingNarration}>
                {audioManager.isPlayingNarration ? '🎵' : '🔇'}
              </AudioVisualization>

              <MagicalOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Tap effects */}
              <AnimatePresence>
                {tapEffects.map(effect => (
                  <motion.div
                    key={effect.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                      position: 'absolute',
                      left: effect.x,
                      top: effect.y,
                      transform: 'translate(-50%, -50%)',
                      fontSize: '2rem',
                      pointerEvents: 'none',
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </AnimatePresence>
            </ImageContainer>

            <TextContainer>
              {showInteractiveHints && (
                <InteractiveHints>
                  <HintBadge>👆 Tap image for magic</HintBadge>
                  <HintBadge>🎤 Say "abracadabra"</HintBadge>
                </InteractiveHints>
              )}
              
              <StoryText
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {currentPageData.text}
              </StoryText>
            </TextContainer>
          </StoryCard>
        </AnimatePresence>
      </StoryContainer>

      <NavigationControls>
        <NavButton
          $disabled={!canGoBack}
          onClick={handlePrevious}
          whileHover={{ scale: canGoBack ? 1.05 : 1 }}
          whileTap={{ scale: canGoBack ? 0.95 : 1 }}
        >
          ← Previous
        </NavButton>

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

        <NavButton
          onClick={handleNext}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {canGoForward ? 'Next →' : '🎉 Finish'}
        </NavButton>
      </NavigationControls>

      {/* Magical effects overlay */}
      <AnimatePresence>
        {magicalEffect && (
          <MagicalEffectOverlay
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 0.5 }}
          >
            <MagicalText
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                repeat: 3
              }}
            >
              {magicalEffect}
            </MagicalText>
          </MagicalEffectOverlay>
        )}
      </AnimatePresence>

      {/* Voice transcript display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '15px 20px',
              borderRadius: '20px',
              color: '#333',
              fontSize: '1rem',
              maxWidth: '80%',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            }}
          >
            👄 "{transcript}"
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};