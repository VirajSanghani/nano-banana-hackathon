from textblob import TextBlob
import re
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    def __init__(self):
        # Emotion keyword mappings
        self.emotion_keywords = {
            'joy': [
                'happy', 'joyful', 'excited', 'cheerful', 'delighted', 'ecstatic',
                'euphoric', 'glad', 'pleased', 'content', 'satisfied', 'blissful',
                'upbeat', 'optimistic', 'elated', 'thrilled', 'wonderful', 'amazing',
                'fantastic', 'great', 'awesome', 'brilliant', 'love', 'adore'
            ],
            'sadness': [
                'sad', 'depressed', 'melancholy', 'gloomy', 'sorrowful', 'mournful',
                'dejected', 'despondent', 'downcast', 'blue', 'unhappy', 'miserable',
                'heartbroken', 'disappointed', 'lonely', 'isolated', 'empty',
                'hopeless', 'tragic', 'devastating', 'painful', 'hurt', 'crying'
            ],
            'energy': [
                'energetic', 'dynamic', 'vibrant', 'powerful', 'intense', 'fierce',
                'passionate', 'enthusiastic', 'motivated', 'driven', 'determined',
                'strong', 'bold', 'confident', 'ambitious', 'aggressive', 'active',
                'alive', 'charged', 'electric', 'pumped', 'hyped', 'wild'
            ],
            'calm': [
                'calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'zen',
                'meditative', 'composed', 'centered', 'balanced', 'quiet',
                'still', 'gentle', 'soft', 'soothing', 'restful', 'mellow',
                'harmonious', 'stable', 'grounded', 'mindful', 'present'
            ]
        }
        
        # Synthesis parameters for each emotion
        self.synthesis_params = {
            'joy': {
                'scale': ['C4', 'E4', 'G4', 'B4', 'D5'],
                'tempo': 120,
                'brightness': 0.8,
                'reverb': 0.3,
                'filter_frequency': 2000,
                'delay': 0.2
            },
            'sadness': {
                'scale': ['A3', 'C4', 'E4', 'G4', 'B4'],
                'tempo': 60,
                'brightness': 0.3,
                'reverb': 0.7,
                'filter_frequency': 600,
                'delay': 0.4
            },
            'energy': {
                'scale': ['D4', 'F#4', 'A4', 'C5', 'E5'],
                'tempo': 140,
                'brightness': 0.9,
                'reverb': 0.2,
                'filter_frequency': 3000,
                'delay': 0.1
            },
            'calm': {
                'scale': ['G3', 'A3', 'C4', 'D4', 'F4'],
                'tempo': 80,
                'brightness': 0.5,
                'reverb': 0.5,
                'filter_frequency': 800,
                'delay': 0.3
            }
        }
    
    def analyze_text(self, text: str) -> Dict:
        """Analyze text and return emotion with confidence and synthesis parameters"""
        if not text or not text.strip():
            return self._get_default_result()
        
        try:
            # Clean text
            cleaned_text = self._clean_text(text)
            
            # Get sentiment from TextBlob
            blob = TextBlob(cleaned_text)
            polarity = blob.sentiment.polarity  # -1 (negative) to 1 (positive)
            subjectivity = blob.sentiment.subjectivity  # 0 (objective) to 1 (subjective)
            
            # Keyword-based emotion detection
            keyword_emotions = self._analyze_keywords(cleaned_text)
            
            # Combine approaches
            emotion, confidence = self._combine_analyses(polarity, subjectivity, keyword_emotions)
            
            # Get synthesis parameters
            parameters = self.synthesis_params.get(emotion, self.synthesis_params['calm'])
            
            # Adjust parameters based on confidence
            adjusted_params = self._adjust_parameters(parameters, confidence)
            
            result = {
                'emotion': emotion,
                'confidence': confidence,
                'parameters': adjusted_params,
                'polarity': polarity,
                'subjectivity': subjectivity,
                'keyword_matches': keyword_emotions
            }
            
            logger.info(f"Emotion analysis: {emotion} ({confidence:.2f}) - Text: {text[:30]}...")
            return result
            
        except Exception as e:
            logger.error(f"Error in emotion analysis: {e}")
            return self._get_default_result()
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text for analysis"""
        # Convert to lowercase
        text = text.lower().strip()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?]', '', text)
        
        return text
    
    def _analyze_keywords(self, text: str) -> Dict[str, float]:
        """Analyze text for emotion keywords"""
        words = text.lower().split()
        emotion_scores = {emotion: 0 for emotion in self.emotion_keywords.keys()}
        
        for word in words:
            for emotion, keywords in self.emotion_keywords.items():
                if word in keywords:
                    emotion_scores[emotion] += 1
        
        # Normalize scores
        total_words = len(words)
        if total_words > 0:
            emotion_scores = {k: v / total_words for k, v in emotion_scores.items()}
        
        return emotion_scores
    
    def _combine_analyses(self, polarity: float, subjectivity: float, keyword_emotions: Dict[str, float]) -> tuple:
        """Combine sentiment analysis and keyword analysis"""
        # Start with keyword-based results
        max_keyword_emotion = max(keyword_emotions.items(), key=lambda x: x[1])
        keyword_emotion, keyword_score = max_keyword_emotion
        
        # Sentiment-based emotion mapping
        if polarity > 0.3:
            sentiment_emotion = 'joy'
            sentiment_confidence = polarity
        elif polarity < -0.3:
            sentiment_emotion = 'sadness'
            sentiment_confidence = abs(polarity)
        elif subjectivity > 0.7:
            sentiment_emotion = 'energy'
            sentiment_confidence = subjectivity
        else:
            sentiment_emotion = 'calm'
            sentiment_confidence = 1 - subjectivity
        
        # Combine approaches
        if keyword_score > 0.05:  # Keywords found
            # Use keyword result but adjust confidence with sentiment
            emotion = keyword_emotion
            confidence = min(1.0, keyword_score * 10 + sentiment_confidence * 0.5)
        else:
            # Use sentiment-based result
            emotion = sentiment_emotion
            confidence = sentiment_confidence
        
        # Ensure confidence is in valid range
        confidence = max(0.1, min(1.0, confidence))
        
        return emotion, confidence
    
    def _adjust_parameters(self, base_params: Dict, confidence: float) -> Dict:
        """Adjust synthesis parameters based on confidence"""
        adjusted = base_params.copy()
        
        # Scale intensity-based parameters with confidence
        adjusted['brightness'] *= confidence
        adjusted['reverb'] = base_params['reverb'] * (0.3 + confidence * 0.7)
        
        # Adjust tempo slightly based on confidence
        tempo_variation = int(base_params['tempo'] * 0.2 * (confidence - 0.5))
        adjusted['tempo'] = base_params['tempo'] + tempo_variation
        
        return adjusted
    
    def _get_default_result(self) -> Dict:
        """Return default calm emotion result"""
        return {
            'emotion': 'calm',
            'confidence': 0.5,
            'parameters': self.synthesis_params['calm'],
            'polarity': 0.0,
            'subjectivity': 0.0,
            'keyword_matches': {}
        }
    
    def analyze_emotion_sequence(self, texts: List[str]) -> Dict:
        """Analyze a sequence of texts for emotion trends"""
        if not texts:
            return self._get_default_result()
        
        emotions = []
        confidences = []
        
        for text in texts:
            result = self.analyze_text(text)
            emotions.append(result['emotion'])
            confidences.append(result['confidence'])
        
        # Find dominant emotion
        emotion_counts = {}
        for emotion in emotions:
            emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
        
        dominant_emotion = max(emotion_counts.items(), key=lambda x: x[1])[0]
        avg_confidence = sum(confidences) / len(confidences)
        
        return {
            'dominant_emotion': dominant_emotion,
            'confidence': avg_confidence,
            'emotion_sequence': emotions,
            'parameters': self.synthesis_params[dominant_emotion]
        }