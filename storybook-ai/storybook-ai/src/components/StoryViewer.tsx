import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Container = styled.div`
  min-height: 100vh;
  background: #FFF8DC;
  position: relative;
  overflow: hidden;
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
`;

const PageIndicator = styled.span`
  color: #666;
  font-weight: 500;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const ImageContainer = styled(motion.div)`
  width: 100%;
  height: 60vh;
  margin-top: 60px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const StoryImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  padding: 20px;
  background: white;
  border-radius: 20px 20px 0 0;
  margin-top: -20px;
  position: relative;
  min-height: 30vh;
`;

const StoryText = styled(motion.p)`
  font-size: 1.2rem;
  line-height: 1.8;
  color: #2C3E50;
  font-family: 'Baskerville', serif;
`;

const AudioControls = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
`;

const PlayButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChoiceOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
`;

const ChoiceTitle = styled.h2`
  color: white;
  font-size: 1.8rem;
  margin-bottom: 30px;
  text-align: center;
`;

const ChoiceButton = styled(motion.button)`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  margin: 10px;
  background: white;
  border: none;
  border-radius: 20px;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
`;

const ChoiceIcon = styled.span`
  font-size: 2rem;
`;

const NavigationHint = styled.div`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  color: #999;
  font-size: 0.9rem;
  text-align: center;
`;

const CompletionScreen = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 20px;
`;

const CompletionTitle = styled.h1`
  color: white;
  font-size: 3rem;
  margin-bottom: 30px;
  font-family: 'Baskerville', serif;
`;

const CompletionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
`;

export const StoryViewer: React.FC = () => {
  const navigate = useNavigate();
  const { currentStory, currentPage, setCurrentPage } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    if (!currentStory) {
      navigate('/');
    }
  }, [currentStory, navigate]);
  
  if (!currentStory) {
    return null;
  }
  
  const page = currentStory.pages[currentPage];
  const isLastPage = currentPage === currentStory.pages.length - 1;
  
  const handleNextPage = () => {
    if (page?.hasChoice && !showChoice) {
      setShowChoice(true);
    } else if (!isLastPage) {
      setCurrentPage(currentPage + 1);
      setShowChoice(false);
    } else {
      setIsComplete(true);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setShowChoice(false);
    }
  };
  
  const handleChoice = (choiceId: string) => {
    setShowChoice(false);
    handleNextPage();
  };
  
  const handleSwipe = (direction: number) => {
    if (direction > 0) {
      handlePreviousPage();
    } else {
      handleNextPage();
    }
  };
  
  const handleReadAgain = () => {
    setCurrentPage(0);
    setIsComplete(false);
  };
  
  const handleNewStory = () => {
    navigate('/');
  };
  
  const handleSaveToLibrary = () => {
    // Already saved in store
    navigate('/library');
  };
  
  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← Back
        </BackButton>
        <PageIndicator>
          Page {currentPage + 1} of {currentStory.pages.length}
        </PageIndicator>
        <MenuButton>⋮</MenuButton>
      </Header>
      
      <AnimatePresence mode="wait">
        {page && (
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            onPanEnd={(e, info) => {
              if (Math.abs(info.offset.x) > 100) {
                handleSwipe(info.offset.x);
              }
            }}
            style={{ touchAction: 'pan-y' }}
          >
            <ImageContainer>
              <StoryImage src={page.imageUrl} alt={`Page ${currentPage + 1}`} />
            </ImageContainer>
            
            <TextContainer>
              <StoryText>{page.text}</StoryText>
              {!isLastPage && (
                <NavigationHint>Swipe to turn the page →</NavigationHint>
              )}
            </TextContainer>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AudioControls>
        <PlayButton onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? '⏸' : '▶'}
        </PlayButton>
      </AudioControls>
      
      <AnimatePresence>
        {showChoice && page?.choices && (
          <ChoiceOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChoiceTitle>What should {currentStory.mainCharacter.name} do?</ChoiceTitle>
            {page.choices.map((choice) => (
              <ChoiceButton
                key={choice.id}
                onClick={() => handleChoice(choice.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChoiceIcon>{choice.icon}</ChoiceIcon>
                <span>{choice.text}</span>
              </ChoiceButton>
            ))}
          </ChoiceOverlay>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isComplete && (
          <CompletionScreen
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              style={{ fontSize: '4rem' }}
            >
              🎉
            </motion.div>
            <CompletionTitle>The End</CompletionTitle>
            <CompletionButtons>
              <Button onClick={handleSaveToLibrary}>
                💾 Save to My Library
              </Button>
              <Button onClick={handleReadAgain}>
                🔄 Read Again
              </Button>
              <Button onClick={handleNewStory}>
                ✨ Create New Story
              </Button>
            </CompletionButtons>
          </CompletionScreen>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Button = styled(motion.button)`
  padding: 15px 30px;
  border-radius: 25px;
  border: none;
  background: white;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;