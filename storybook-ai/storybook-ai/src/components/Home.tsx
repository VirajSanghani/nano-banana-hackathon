import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useVoiceInput } from '../hooks/useVoiceInput';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  color: white;
  margin-bottom: 10px;
  font-family: 'SF Rounded', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 400px;
`;

const Button = styled(motion.button)<{ $primary?: boolean }>`
  padding: 20px 30px;
  border-radius: 25px;
  border: none;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: ${props => props.$primary 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'white'};
  color: ${props => props.$primary ? 'white' : '#667eea'};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MicIcon = styled(motion.div)<{ $isListening: boolean }>`
  font-size: 2rem;
  animation: ${props => props.$isListening ? 'pulse 1.5s infinite' : 'none'};
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const TranscriptBox = styled(motion.div)`
  background: white;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
`;

const TranscriptText = styled.p`
  color: #333;
  font-size: 1.1rem;
  line-height: 1.5;
  min-height: 60px;
`;

const LibraryButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const TextInput = styled.textarea`
  width: 100%;
  padding: 15px;
  border: 2px solid #667eea;
  border-radius: 15px;
  font-size: 1.1rem;
  font-family: inherit;
  resize: none;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #764ba2;
  }
`;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { stories, setGenerating } = useStore();
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput();
  const [inputMode, setInputMode] = useState<'voice' | 'text' | null>(null);
  const [textInput, setTextInput] = useState('');
  
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        handleGenerateStory(transcript);
      }
    } else {
      setInputMode('voice');
      startListening();
    }
  };
  
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleGenerateStory(textInput);
    }
  };
  
  const handleGenerateStory = async (prompt: string) => {
    setGenerating(true);
    navigate('/generate', { state: { prompt } });
  };
  
  return (
    <Container>
      <Header>
        <Title
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🌙 Storybook AI
        </Title>
        <Subtitle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          What magical story shall we create?
        </Subtitle>
      </Header>
      
      {inputMode === null && (
        <ButtonContainer>
          <Button
            $primary
            onClick={() => setInputMode('voice')}
            disabled={!isSupported}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MicIcon $isListening={false}>🎙️</MicIcon>
            Tap to Speak
          </Button>
          
          <Button
            onClick={() => setInputMode('text')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⌨️ Type Instead
          </Button>
        </ButtonContainer>
      )}
      
      {inputMode === 'voice' && (
        <>
          <Button
            $primary
            onClick={handleVoiceClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MicIcon $isListening={isListening}>🎙️</MicIcon>
            {isListening ? 'Stop & Create Story' : 'Start Speaking'}
          </Button>
          
          {transcript && (
            <TranscriptBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <TranscriptText>{transcript}</TranscriptText>
            </TranscriptBox>
          )}
        </>
      )}
      
      {inputMode === 'text' && (
        <>
          <TextInput
            placeholder="Tell me about your story... A brave fox who wants to fly to the moon..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <ButtonContainer style={{ marginTop: '20px' }}>
            <Button
              $primary
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ Create Story
            </Button>
            <Button
              onClick={() => setInputMode(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </Button>
          </ButtonContainer>
        </>
      )}
      
      {stories.length > 0 && (
        <LibraryButton
          onClick={() => navigate('/library')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          📚
        </LibraryButton>
      )}
    </Container>
  );
};