"""
Servicio de procesamiento de lenguaje natural (NLP).
Gestiona la carga de modelos y el análisis de texto.
"""
import re
import nltk
from typing import Tuple, List
from transformers import pipeline
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

from app.config.settings import settings


class NLPService:
    """Servicio de procesamiento de lenguaje natural."""

    def __init__(self):
        """Inicializa el servicio de NLP y carga los modelos."""
        self._download_nltk_resources()
        self.sentiment_classifier = self._load_sentiment_model()
        self.emotion_classifier = self._load_emotion_model()

    def _download_nltk_resources(self) -> None:
        """Descarga recursos necesarios de NLTK."""
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            print("Descargando stopwords...")
            nltk.download('stopwords')

        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            print("Descargando punkt...")
            nltk.download('punkt')

    def _load_sentiment_model(self):
        """Carga el modelo de análisis de sentimientos."""
        try:
            print(f"Cargando modelo de sentimientos: {settings.sentiment_model}")
            return pipeline(
                "sentiment-analysis",
                model=settings.sentiment_model
            )
        except Exception as e:
            print(f"Error al cargar modelo de sentimientos: {e}. Usando fallback.")
            return pipeline(
                "sentiment-analysis",
                model=settings.fallback_model
            )

    def _load_emotion_model(self):
        """Carga el modelo de análisis de emociones."""
        try:
            print(f"Cargando modelo de emociones: {settings.emotion_model}")
            return pipeline(
                "sentiment-analysis",
                model=settings.emotion_model
            )
        except Exception as e:
            print(f"Error al cargar modelo de emociones: {e}. Usando fallback.")
            return pipeline(
                "sentiment-analysis",
                model=settings.fallback_model
            )

    def preprocesar_texto(self, texto: str) -> Tuple[str, List[str]]:
        """
        Limpia y tokeniza el texto.

        Args:
            texto: Texto a procesar.

        Returns:
            Tupla con (texto_procesado, tokens_limpios).
        """
        texto = texto.lower()
        texto = re.sub(r'http\S+|www\S+|https\S+', '', texto, flags=re.MULTILINE)
        texto = re.sub(r'[^\w\s]', '', texto)

        tokens = word_tokenize(texto, language='spanish')
        stop_words = set(stopwords.words('spanish'))
        tokens_limpios = [
            token for token in tokens
            if token not in stop_words and len(token) > 2
        ]

        return " ".join(tokens_limpios), tokens_limpios

    def analizar_sentimiento(self, texto: str) -> str:
        """
        Analiza el sentimiento de un texto.

        Args:
            texto: Texto a analizar.

        Returns:
            Etiqueta del sentimiento detectado.
        """
        resultado = self.sentiment_classifier(texto)[0]
        return resultado['label']

    def analizar_emocion(self, texto: str) -> Tuple[str, float]:
        """
        Analiza la emoción de un texto.

        Args:
            texto: Texto a analizar.

        Returns:
            Tupla con (emoción, score).
        """
        resultado = self.emotion_classifier(texto)[0]
        return resultado['label'], resultado['score']


# Instancia única del servicio (singleton)
nlp_service = NLPService()
