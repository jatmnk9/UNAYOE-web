"""
Text analysis service using NLP models
Handles sentiment and emotion analysis
"""
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from transformers import pipeline
from typing import Tuple
import pandas as pd

# Download NLTK resources if not available
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    print("Downloading NLTK stopwords...")
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt')

# Initialize NLP pipelines
try:
    print("Loading NLP models optimized for Spanish...")
    sentiment_classifier = pipeline(
        "sentiment-analysis", 
        model="pysentimiento/robertuito-sentiment-analysis"
    )
    emotion_classifier = pipeline(
        "sentiment-analysis", 
        model="pysentimiento/robertuito-emotion-analysis"
    )
except Exception as e:
    print(f"Error loading specific models: {e}. Using alternatives.")
    sentiment_classifier = pipeline(
        "sentiment-analysis", 
        model="dccuchile/bert-base-spanish-wwm-cased"
    )
    emotion_classifier = pipeline(
        "sentiment-analysis", 
        model="dccuchile/bert-base-spanish-wwm-cased"
    )


class TextAnalysisService:
    """Service for text analysis operations"""
    
    @staticmethod
    def preprocess_text(text: str) -> Tuple[str, list]:
        """
        Clean and tokenize text
        
        Args:
            text: Raw text input
            
        Returns:
            Tuple of (processed_text, tokens)
        """
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'[^\w\s]', '', text)
        tokens = word_tokenize(text, language='spanish')
        stop_words = set(stopwords.words('spanish'))
        clean_tokens = [
            token for token in tokens 
            if token not in stop_words and len(token) > 2
        ]
        return " ".join(clean_tokens), clean_tokens
    
    @staticmethod
    def analyze_diary_complete(diary_df: pd.DataFrame) -> pd.DataFrame:
        """
        Analyze diary entries and return analysis data
        
        Args:
            diary_df: DataFrame with 'note' column containing diary entries
            
        Returns:
            DataFrame with analysis results
        """
        analysis = []
        for note in diary_df['note']:
            try:
                processed_text, tokens = TextAnalysisService.preprocess_text(note)
                sentiment_result = sentiment_classifier(note)[0]
                emotion_result = emotion_classifier(note)[0]
                
                analysis.append({
                    'nota_original': note,
                    'texto_procesado': processed_text,
                    'tokens': tokens,
                    'sentimiento': sentiment_result['label'],
                    'emocion': emotion_result['label'],
                    'emocion_score': emotion_result['score']
                })
            except Exception as e:
                print(f"Error processing note: {e}")
                analysis.append({
                    'nota_original': note,
                    'texto_procesado': '',
                    'tokens': [],
                    'sentimiento': 'ERROR',
                    'emocion': 'ERROR',
                    'emocion_score': 0.0
                })
        return pd.DataFrame(analysis)
    
    @staticmethod
    def analyze_single_note(note_text: str) -> dict:
        """
        Analyze a single note
        
        Args:
            note_text: Text to analyze
            
        Returns:
            Dictionary with analysis results
        """
        processed_text, tokens = TextAnalysisService.preprocess_text(note_text)
        sentiment_result = sentiment_classifier(note_text)[0]
        emotion_result = emotion_classifier(note_text)[0]
        
        return {
            'texto_procesado': processed_text,
            'tokens': tokens,
            'sentimiento': sentiment_result['label'],
            'emocion': emotion_result['label'],
            'emocion_score': emotion_result['score']
        }

