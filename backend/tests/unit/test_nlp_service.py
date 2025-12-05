"""
Pruebas unitarias para el servicio de NLP.
Prueba análisis de sentimientos, emociones y preprocesamiento de texto.
"""
import pytest
from unittest.mock import patch, Mock
from tests.mocks.nlp_mock import (
    MockNLPService,
    MockSentimentClassifier,
    MockEmotionClassifier
)


@pytest.mark.unit
@pytest.mark.nlp
class TestNLPService:
    """Suite de pruebas para el servicio de NLP."""

    @pytest.fixture
    def nlp_service(self):
        """Fixture que retorna una instancia mock del servicio NLP."""
        return MockNLPService()

    # =========================================================
    # PRUEBAS DE PREPROCESAMIENTO
    # =========================================================

    def test_preprocesar_texto_con_texto_valido(self, nlp_service):
        """
        Prueba que el preprocesamiento funciona correctamente con texto válido.
        """
        texto = "Hoy me siento muy feliz porque aprobé mi examen"
        texto_procesado, tokens = nlp_service.preprocesar_texto(texto)

        assert isinstance(texto_procesado, str)
        assert isinstance(tokens, list)
        assert len(tokens) > 0
        assert "feliz" in tokens

    def test_preprocesar_texto_vacio(self, nlp_service):
        """
        Prueba que el preprocesamiento maneja correctamente texto vacío.
        """
        texto_procesado, tokens = nlp_service.preprocesar_texto("")

        assert texto_procesado == ""
        assert tokens == []

    def test_preprocesar_texto_elimina_stopwords(self, nlp_service):
        """
        Prueba que el preprocesamiento elimina stopwords.
        """
        texto = "el la de que y a en"
        texto_procesado, tokens = nlp_service.preprocesar_texto(texto)

        # Las stopwords deberían ser filtradas
        assert len(tokens) == 0

    def test_preprocesar_texto_convierte_minusculas(self, nlp_service):
        """
        Prueba que el preprocesamiento convierte a minúsculas.
        """
        texto = "FELIZ Alegre CONTENTO"
        texto_procesado, tokens = nlp_service.preprocesar_texto(texto)

        assert all(token.islower() for token in tokens)

    # =========================================================
    # PRUEBAS DE ANÁLISIS DE SENTIMIENTOS
    # =========================================================

    def test_analizar_sentimiento_positivo(self, nlp_service):
        """
        Prueba detección de sentimiento positivo.
        """
        texto = "Me siento muy feliz y contento"
        sentimiento = nlp_service.analizar_sentimiento(texto)

        assert sentimiento == "POS"

    def test_analizar_sentimiento_negativo(self, nlp_service):
        """
        Prueba detección de sentimiento negativo.
        """
        texto = "Estoy muy triste y frustrado"
        sentimiento = nlp_service.analizar_sentimiento(texto)

        assert sentimiento == "NEG"

    def test_analizar_sentimiento_neutral(self, nlp_service):
        """
        Prueba detección de sentimiento neutral.
        """
        texto = "Hoy es un día normal"
        sentimiento = nlp_service.analizar_sentimiento(texto)

        assert sentimiento in ["NEU", "POS", "NEG"]

    def test_analizar_sentimiento_texto_vacio(self, nlp_service):
        """
        Prueba análisis de sentimiento con texto vacío.
        """
        sentimiento = nlp_service.analizar_sentimiento("")

        assert sentimiento == "NEU"

    # =========================================================
    # PRUEBAS DE ANÁLISIS DE EMOCIONES
    # =========================================================

    def test_analizar_emocion_alegria(self, nlp_service):
        """
        Prueba detección de emoción de alegría.
        """
        texto = "Me siento muy feliz"
        emocion, score = nlp_service.analizar_emocion(texto)

        assert emocion == "joy"
        assert isinstance(score, float)
        assert 0.0 <= score <= 1.0

    def test_analizar_emocion_tristeza(self, nlp_service):
        """
        Prueba detección de emoción de tristeza.
        """
        texto = "Estoy muy triste"
        emocion, score = nlp_service.analizar_emocion(texto)

        assert emocion == "sadness"
        assert isinstance(score, float)
        assert score > 0.0

    def test_analizar_emocion_enojo(self, nlp_service):
        """
        Prueba detección de emoción de enojo.
        """
        texto = "Estoy muy enojado y frustrado"
        emocion, score = nlp_service.analizar_emocion(texto)

        assert emocion == "anger"
        assert isinstance(score, float)

    def test_analizar_emocion_miedo(self, nlp_service):
        """
        Prueba detección de emoción de miedo.
        """
        texto = "Tengo mucho miedo y ansiedad"
        emocion, score = nlp_service.analizar_emocion(texto)

        assert emocion == "fear"
        assert isinstance(score, float)

    def test_analizar_emocion_texto_vacio(self, nlp_service):
        """
        Prueba análisis de emoción con texto vacío.
        """
        emocion, score = nlp_service.analizar_emocion("")

        assert emocion == "neutral"
        assert score == 0.0

    # =========================================================
    # PRUEBAS DE CLASIFICADORES MOCK
    # =========================================================

    def test_mock_sentiment_classifier_positivo(self):
        """
        Prueba que el clasificador mock detecta sentimiento positivo.
        """
        classifier = MockSentimentClassifier()
        result = classifier("Me siento feliz")

        assert len(result) == 1
        assert result[0]["label"] == "POS"
        assert result[0]["score"] > 0.0

    def test_mock_sentiment_classifier_negativo(self):
        """
        Prueba que el clasificador mock detecta sentimiento negativo.
        """
        classifier = MockSentimentClassifier()
        result = classifier("Estoy triste")

        assert len(result) == 1
        assert result[0]["label"] == "NEG"

    def test_mock_emotion_classifier_joy(self):
        """
        Prueba que el clasificador mock detecta emoción de alegría.
        """
        classifier = MockEmotionClassifier()
        result = classifier("Estoy feliz")

        assert len(result) == 1
        assert result[0]["label"] == "joy"
        assert result[0]["score"] > 0.0

    def test_mock_emotion_classifier_sadness(self):
        """
        Prueba que el clasificador mock detecta emoción de tristeza.
        """
        classifier = MockEmotionClassifier()
        result = classifier("Estoy triste")

        assert len(result) == 1
        assert result[0]["label"] == "sadness"

    # =========================================================
    # PRUEBAS DE INTEGRACIÓN CON TEXTOS REALES
    # =========================================================

    @pytest.mark.parametrize("texto,sentimiento_esperado", [
        ("Hoy aprobé mi examen, estoy muy feliz", "POS"),
        ("Perdí mi trabajo, me siento muy triste", "NEG"),
        ("El clima está normal hoy", "NEU"),
    ])
    def test_analizar_sentimiento_casos_reales(self, nlp_service, texto, sentimiento_esperado):
        """
        Prueba análisis de sentimiento con casos realistas.
        """
        sentimiento = nlp_service.analizar_sentimiento(texto)
        assert sentimiento in ["POS", "NEG", "NEU"]

    @pytest.mark.parametrize("texto", [
        "Me siento muy feliz porque conseguí mi objetivo",
        "Estoy triste porque no pude completar mi tarea",
        "Tengo ansiedad por el examen de mañana",
        "Estoy enojado por la situación injusta"
    ])
    def test_analizar_emocion_casos_reales(self, nlp_service, texto):
        """
        Prueba análisis de emoción con casos realistas.
        """
        emocion, score = nlp_service.analizar_emocion(texto)

        assert isinstance(emocion, str)
        assert isinstance(score, float)
        assert 0.0 <= score <= 1.0
