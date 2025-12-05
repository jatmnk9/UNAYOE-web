"""
Mocks para servicios de NLP/IA.
Simula análisis de sentimientos, emociones y preprocesamiento.
"""
from typing import Tuple, List
from unittest.mock import Mock


class MockNLPService:
    """
    Mock del servicio de NLP.
    Simula análisis de sentimientos y emociones sin cargar modelos reales.
    """

    def __init__(self):
        """Inicializa el mock sin cargar modelos reales."""
        self._sentiment_map = {
            "feliz": "POS",
            "alegre": "POS",
            "contento": "POS",
            "triste": "NEG",
            "enojado": "NEG",
            "frustrado": "NEG",
            "ansioso": "NEU",
            "normal": "NEU"
        }

        self._emotion_map = {
            "feliz": ("joy", 0.95),
            "alegre": ("joy", 0.90),
            "contento": ("joy", 0.85),
            "triste": ("sadness", 0.89),
            "enojado": ("anger", 0.92),
            "frustrado": ("anger", 0.87),
            "ansioso": ("fear", 0.88),
            "miedo": ("fear", 0.91),
            "normal": ("neutral", 0.75)
        }

    def preprocesar_texto(self, texto: str) -> Tuple[str, List[str]]:
        """
        Mock del preprocesamiento de texto.

        Args:
            texto: Texto a procesar

        Returns:
            Tupla de (texto_procesado, tokens)
        """
        if not texto:
            return "", []

        # Simulación simple de preprocesamiento
        texto_lower = texto.lower()
        tokens = texto_lower.split()

        # Filtrar palabras comunes (stopwords simuladas)
        stopwords = {"el", "la", "de", "que", "y", "a", "en", "un", "una", "por"}
        tokens_limpios = [t for t in tokens if t not in stopwords]

        texto_procesado = " ".join(tokens_limpios)

        return texto_procesado, tokens_limpios

    def analizar_sentimiento(self, texto: str) -> str:
        """
        Mock del análisis de sentimiento.

        Args:
            texto: Texto a analizar

        Returns:
            Label del sentimiento (POS/NEG/NEU)
        """
        if not texto:
            return "NEU"

        texto_lower = texto.lower()

        # Buscar palabras clave en el texto
        for keyword, sentiment in self._sentiment_map.items():
            if keyword in texto_lower:
                return sentiment

        # Por defecto neutral
        return "NEU"

    def analizar_emocion(self, texto: str) -> Tuple[str, float]:
        """
        Mock del análisis de emoción.

        Args:
            texto: Texto a analizar

        Returns:
            Tupla de (label_emocion, score_confianza)
        """
        if not texto:
            return "neutral", 0.0

        texto_lower = texto.lower()

        # Buscar palabras clave en el texto
        for keyword, emotion_data in self._emotion_map.items():
            if keyword in texto_lower:
                return emotion_data

        # Por defecto neutral
        return "neutral", 0.75


class MockSentimentClassifier:
    """Mock del clasificador de sentimientos de transformers."""

    def __call__(self, text: str) -> List[dict]:
        """
        Simula la clasificación de sentimientos.

        Args:
            text: Texto a clasificar

        Returns:
            Lista con resultado de clasificación
        """
        text_lower = text.lower()

        if any(word in text_lower for word in ["feliz", "alegre", "contento", "bien"]):
            return [{"label": "POS", "score": 0.95}]
        elif any(word in text_lower for word in ["triste", "mal", "enojado", "frustrado"]):
            return [{"label": "NEG", "score": 0.89}]
        else:
            return [{"label": "NEU", "score": 0.75}]


class MockEmotionClassifier:
    """Mock del clasificador de emociones de transformers."""

    def __call__(self, text: str) -> List[dict]:
        """
        Simula la clasificación de emociones.

        Args:
            text: Texto a clasificar

        Returns:
            Lista con resultado de clasificación
        """
        text_lower = text.lower()

        if any(word in text_lower for word in ["feliz", "alegre", "contento"]):
            return [{"label": "joy", "score": 0.95}]
        elif any(word in text_lower for word in ["triste"]):
            return [{"label": "sadness", "score": 0.89}]
        elif any(word in text_lower for word in ["enojado", "frustrado"]):
            return [{"label": "anger", "score": 0.92}]
        elif any(word in text_lower for word in ["ansioso", "miedo"]):
            return [{"label": "fear", "score": 0.88}]
        else:
            return [{"label": "neutral", "score": 0.75}]


def get_mock_nlp_service() -> MockNLPService:
    """
    Factory function para obtener servicio mock de NLP.

    Returns:
        MockNLPService: Servicio mock de NLP
    """
    return MockNLPService()


def get_mock_sentiment_classifier() -> MockSentimentClassifier:
    """
    Factory function para obtener clasificador mock de sentimientos.

    Returns:
        MockSentimentClassifier: Clasificador mock
    """
    return MockSentimentClassifier()


def get_mock_emotion_classifier() -> MockEmotionClassifier:
    """
    Factory function para obtener clasificador mock de emociones.

    Returns:
        MockEmotionClassifier: Clasificador mock
    """
    return MockEmotionClassifier()
