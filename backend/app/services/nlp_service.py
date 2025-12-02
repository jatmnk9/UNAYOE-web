"""
Servicio de Procesamiento de Lenguaje Natural (NLP).
Implementa patrón Singleton para cargar modelos una sola vez.
"""
import re
import nltk
from typing import Tuple, List
from transformers import pipeline
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from functools import lru_cache
from app.config.settings import get_settings


class NLPService:
    """
    Servicio de NLP con patrón Singleton.
    Carga los modelos de análisis de sentimiento y emoción una sola vez.
    """
    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(NLPService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Inicializa los modelos de NLP solo una vez."""
        if not NLPService._initialized:
            self._initialize_nltk_resources()
            self._initialize_models()
            NLPService._initialized = True

    def _initialize_nltk_resources(self) -> None:
        """Descarga recursos necesarios de NLTK."""
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            print("Descargando stopwords de NLTK...")
            nltk.download('stopwords', quiet=True)

        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            print("Descargando punkt de NLTK...")
            nltk.download('punkt', quiet=True)

    def _initialize_models(self) -> None:
        """Inicializa los modelos de transformers."""
        settings = get_settings()

        try:
            print("Cargando modelos de PNL optimizados para español...")
            self.sentiment_classifier = pipeline(
                "sentiment-analysis",
                model=settings.sentiment_model
            )
            self.emotion_classifier = pipeline(
                "sentiment-analysis",
                model=settings.emotion_model
            )
            print("✅ Modelos de NLP cargados exitosamente")
        except Exception as e:
            print(f"⚠️ Error al cargar modelos específicos: {e}")
            print(f"Usando modelo alternativo: {settings.fallback_model}")
            self.sentiment_classifier = pipeline(
                "sentiment-analysis",
                model=settings.fallback_model
            )
            self.emotion_classifier = pipeline(
                "sentiment-analysis",
                model=settings.fallback_model
            )

    def preprocesar_texto(self, texto: str) -> Tuple[str, List[str]]:
        """
        Limpia y tokeniza el texto.

        Args:
            texto: Texto a procesar

        Returns:
            Tupla de (texto_procesado, lista_de_tokens)
        """
        if not texto:
            return "", []

        texto = texto.lower()
        texto = re.sub(r'http\S+|www\S+|https\S+', '', texto, flags=re.MULTILINE)
        texto = re.sub(r'[^\w\s]', '', texto)

        try:
            tokens = word_tokenize(texto, language='spanish')
        except Exception:
            tokens = texto.split()

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
            texto: Texto a analizar

        Returns:
            Label del sentimiento (POS/NEG/NEU)
        """
        if not texto:
            return "NEU"

        try:
            result = self.sentiment_classifier(texto)[0]
            return result['label']
        except Exception as e:
            print(f"Error en análisis de sentimiento: {e}")
            return "ERROR"

    def analizar_emocion(self, texto: str) -> Tuple[str, float]:
        """
        Analiza la emoción de un texto.

        Args:
            texto: Texto a analizar

        Returns:
            Tupla de (label_emocion, score_confianza)
        """
        if not texto:
            return "neutro", 0.0

        try:
            result = self.emotion_classifier(texto)[0]
            return result['label'], result['score']
        except Exception as e:
            print(f"Error en análisis de emoción: {e}")
            return "ERROR", 0.0


@lru_cache()
def get_nlp_service() -> NLPService:
    """
    Retorna una instancia única de NLPService (Singleton).

    Returns:
        NLPService: Instancia del servicio de NLP
    """
    return NLPService()
