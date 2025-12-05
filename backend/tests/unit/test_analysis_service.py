"""
Pruebas unitarias para el servicio de análisis.
Prueba análisis de múltiples notas y creación de visualizaciones.
"""
import pytest
import pandas as pd
from unittest.mock import Mock, patch, MagicMock
from tests.mocks.nlp_mock import MockNLPService


@pytest.mark.unit
@pytest.mark.nlp
class TestAnalysisService:
    """Suite de pruebas para el servicio de análisis."""

    @pytest.fixture
    def mock_analysis_service(self):
        """
        Fixture que retorna un mock del servicio de análisis.
        """
        from app.services.analysis_service import AnalysisService

        with patch('app.services.analysis_service.get_nlp_service') as mock_get_nlp:
            mock_get_nlp.return_value = MockNLPService()
            service = AnalysisService()
            return service

    # =========================================================
    # PRUEBAS DE ANÁLISIS DE MÚLTIPLES NOTAS
    # =========================================================

    def test_analizar_multiples_notas_con_datos_validos(self, mock_analysis_service):
        """
        Prueba que el análisis de múltiples notas funciona correctamente.
        """
        notas = [
            {"note": "Me siento muy feliz hoy"},
            {"note": "Estoy triste por la situación"},
            {"note": "Tengo ansiedad por el examen"}
        ]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert isinstance(df_resultado, pd.DataFrame)
        assert len(df_resultado) == 3
        assert "nota_original" in df_resultado.columns
        assert "texto_procesado" in df_resultado.columns
        assert "tokens" in df_resultado.columns
        assert "sentimiento" in df_resultado.columns
        assert "emocion" in df_resultado.columns
        assert "emocion_score" in df_resultado.columns

    def test_analizar_multiples_notas_lista_vacia(self, mock_analysis_service):
        """
        Prueba que el análisis maneja correctamente una lista vacía.
        """
        notas = []

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert isinstance(df_resultado, pd.DataFrame)
        assert len(df_resultado) == 0

    def test_analizar_multiples_notas_con_formato_alternativo(self, mock_analysis_service):
        """
        Prueba que el análisis maneja diferentes formatos de nota.
        """
        notas = [
            {"nota": "Me siento feliz"},  # Clave 'nota' en lugar de 'note'
            {"note": "Estoy triste"}       # Clave 'note'
        ]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert isinstance(df_resultado, pd.DataFrame)
        assert len(df_resultado) == 2

    def test_analizar_multiples_notas_contiene_sentimientos_correctos(self, mock_analysis_service):
        """
        Prueba que los sentimientos analizados son válidos.
        """
        notas = [
            {"note": "Me siento muy feliz"},
            {"note": "Estoy muy triste"}
        ]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        sentimientos = df_resultado['sentimiento'].tolist()
        assert all(s in ["POS", "NEG", "NEU"] for s in sentimientos)

    def test_analizar_multiples_notas_contiene_emociones_validas(self, mock_analysis_service):
        """
        Prueba que las emociones analizadas son válidas.
        """
        notas = [
            {"note": "Me siento muy feliz"},
            {"note": "Estoy muy triste"}
        ]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert "emocion" in df_resultado.columns
        assert "emocion_score" in df_resultado.columns

        # Verificar que los scores están en rango válido
        scores = df_resultado['emocion_score'].tolist()
        assert all(0.0 <= score <= 1.0 for score in scores)

    def test_analizar_multiples_notas_preserva_texto_original(self, mock_analysis_service):
        """
        Prueba que el texto original se preserva en el análisis.
        """
        texto_original = "Me siento muy feliz hoy"
        notas = [{"note": texto_original}]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert df_resultado.iloc[0]['nota_original'] == texto_original

    # =========================================================
    # PRUEBAS DE CREACIÓN DE VISUALIZACIONES
    # =========================================================

    def test_crear_grafico_sentimientos_retorna_base64(self, mock_analysis_service):
        """
        Prueba que la creación de gráfico de sentimientos retorna Base64.
        """
        df = pd.DataFrame({
            'sentimiento': ['POS', 'NEG', 'POS', 'NEU'],
            'emocion': ['joy', 'sadness', 'joy', 'neutral'],
            'tokens': [['feliz'], ['triste'], ['alegre'], ['normal']]
        })

        imagen_base64 = mock_analysis_service.crear_grafico_sentimientos(df)

        assert isinstance(imagen_base64, str)
        assert len(imagen_base64) > 0

    def test_crear_grafico_emociones_retorna_base64(self, mock_analysis_service):
        """
        Prueba que la creación de gráfico de emociones retorna Base64.
        """
        df = pd.DataFrame({
            'sentimiento': ['POS', 'NEG'],
            'emocion': ['joy', 'sadness'],
            'tokens': [['feliz'], ['triste']]
        })

        imagen_base64 = mock_analysis_service.crear_grafico_emociones(df)

        assert isinstance(imagen_base64, str)
        assert len(imagen_base64) > 0

    def test_crear_nube_palabras_retorna_base64(self, mock_analysis_service):
        """
        Prueba que la creación de nube de palabras retorna Base64.
        """
        df = pd.DataFrame({
            'sentimiento': ['POS', 'NEG'],
            'emocion': ['joy', 'sadness'],
            'tokens': [['feliz', 'alegre'], ['triste', 'mal']]
        })

        imagen_base64 = mock_analysis_service.crear_nube_palabras(df)

        assert isinstance(imagen_base64, str)
        assert len(imagen_base64) > 0

    def test_crear_nube_palabras_con_tokens_vacios(self, mock_analysis_service):
        """
        Prueba que la nube de palabras maneja tokens vacíos.
        """
        df = pd.DataFrame({
            'sentimiento': ['NEU'],
            'emocion': ['neutral'],
            'tokens': [[]]
        })

        imagen_base64 = mock_analysis_service.crear_nube_palabras(df)

        assert imagen_base64 == ""

    def test_crear_visualizaciones_retorna_diccionario(self, mock_analysis_service):
        """
        Prueba que crear_visualizaciones retorna un diccionario completo.
        """
        df = pd.DataFrame({
            'sentimiento': ['POS', 'NEG', 'POS'],
            'emocion': ['joy', 'sadness', 'joy'],
            'tokens': [['feliz'], ['triste'], ['alegre']]
        })

        visualizaciones = mock_analysis_service.crear_visualizaciones(df)

        assert isinstance(visualizaciones, dict)
        assert 'sentiments' in visualizaciones
        assert 'emotions' in visualizaciones
        assert 'wordcloud' in visualizaciones

    def test_crear_visualizaciones_con_dataframe_vacio(self, mock_analysis_service):
        """
        Prueba que crear_visualizaciones maneja DataFrame vacío.
        """
        df = pd.DataFrame()

        visualizaciones = mock_analysis_service.crear_visualizaciones(df)

        assert isinstance(visualizaciones, dict)
        assert len(visualizaciones) == 0

    # =========================================================
    # PRUEBAS DE CASOS EXTREMOS
    # =========================================================

    def test_analizar_notas_con_texto_muy_largo(self, mock_analysis_service):
        """
        Prueba análisis con textos muy largos.
        """
        texto_largo = " ".join(["palabra"] * 1000)
        notas = [{"note": texto_largo}]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert len(df_resultado) == 1
        assert df_resultado.iloc[0]['nota_original'] == texto_largo

    def test_analizar_notas_con_caracteres_especiales(self, mock_analysis_service):
        """
        Prueba análisis con caracteres especiales.
        """
        notas = [
            {"note": "¡Me siento feliz! 😊"},
            {"note": "Estoy triste... 😢"}
        ]

        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert len(df_resultado) == 2

    @pytest.mark.parametrize("notas,cantidad_esperada", [
        ([{"note": "Feliz"}], 1),
        ([{"note": "Feliz"}, {"note": "Triste"}], 2),
        ([{"note": "Feliz"}] * 10, 10),
        ([{"note": "Feliz"}] * 100, 100),
    ])
    def test_analizar_diferentes_cantidades_notas(
        self,
        mock_analysis_service,
        notas,
        cantidad_esperada
    ):
        """
        Prueba análisis con diferentes cantidades de notas.
        """
        df_resultado = mock_analysis_service.analizar_multiples_notas(notas)

        assert len(df_resultado) == cantidad_esperada
