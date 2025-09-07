import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { storyAPI } from '../services/api';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const MagicAnimation = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: 30px;
`;

const StatusText = styled(motion.h2)`
  color: white;
  font-size: 1.5rem;
  text-align: center;
  margin-bottom: 20px;
`;

const ProgressContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
`;

const ProgressStep = styled(motion.div)<{ $active: boolean; $complete: boolean }>`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  color: white;
  opacity: ${props => props.$complete ? 1 : props.$active ? 1 : 0.5};
`;

const StepIcon = styled.span`
  font-size: 1.5rem;
`;

const StepText = styled.span`
  font-size: 1.1rem;
`;

const FunFact = styled(motion.p)`
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  text-align: center;
  padding: 20px;
  max-width: 500px;
`;

const ErrorMessage = styled.div`
  background: white;
  color: red;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
`;

const RetryButton = styled(motion.button)`
  padding: 15px 30px;
  border-radius: 25px;
  border: none;
  background: white;
  color: #667eea;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
`;

const steps = [
  { id: 'text', icon: '✏️', text: 'Finding the perfect words...' },
  { id: 'images', icon: '🎨', text: 'Painting beautiful pictures...' },
  { id: 'audio', icon: '🎤', text: 'Adding the narrator\'s voice...' },
  { id: 'music', icon: '🎵', text: 'Composing gentle music...' },
];

const funFacts = [
  'Did you know foxes can jump 3 feet high?',
  'Dragons in stories often guard treasures of wisdom!',
  'The moon is about 238,855 miles away from Earth!',
  'Penguins can\'t fly, but they\'re excellent swimmers!',
  'Every story you create is completely unique!',
];

export const GenerationLoading: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentStory, addStory, setGenerating, setGenerationProgress } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [funFactIndex, setFunFactIndex] = useState(0);
  
  const prompt = location.state?.prompt || '';
  
  const generateStory = useCallback(async () => {
    try {
      setError(null);
      setGenerating(true);
      
      // Simulate progress through steps
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setGenerationProgress({
          stage: steps[i].id as any,
          message: steps[i].text,
          progress: (i + 1) / steps.length * 100,
        });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Generate the actual story
      const story = await storyAPI.generateMagicalStory(prompt);
      
      // Save to store
      setCurrentStory(story);
      addStory(story);
      setGenerating(false);
      setGenerationProgress(null);
      
      // Navigate to story viewer
      navigate('/story');
      
    } catch (err) {
      console.error('Story generation failed:', err);
      setError('Oops! Something went wrong. Let\'s try again!');
      setGenerating(false);
      setGenerationProgress(null);
    }
  }, [prompt, navigate, setCurrentStory, addStory, setGenerating, setGenerationProgress]);

  useEffect(() => {
    if (!prompt) {
      navigate('/');
      return;
    }
    
    generateStory();
  }, [prompt, generateStory, navigate]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleRetry = () => {
    setError(null);
    generateStory();
  };
  
  return (
    <Container>
      <MagicAnimation
        animate={{
          rotate: [0, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        ✨
      </MagicAnimation>
      
      <StatusText
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Your story is being written by magic...
      </StatusText>
      
      <ProgressContainer>
        {steps.map((step, index) => (
          <ProgressStep
            key={step.id}
            $active={index === currentStep}
            $complete={index < currentStep}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.2 }}
          >
            <StepIcon>
              {index < currentStep ? '✓' : step.icon}
            </StepIcon>
            <StepText>{step.text}</StepText>
          </ProgressStep>
        ))}
      </ProgressContainer>
      
      {!error && (
        <FunFact
          key={funFactIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {funFacts[funFactIndex]}
        </FunFact>
      )}
      
      {error && (
        <>
          <ErrorMessage>{error}</ErrorMessage>
          <RetryButton
            onClick={handleRetry}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </RetryButton>
        </>
      )}
    </Container>
  );
};