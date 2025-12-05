"""
Pruebas de integración para los módulos de Notas y Análisis.
Prueba el flujo completo: crear notas → analizar → generar visualizaciones.
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from tests.mocks.supabase_mock import MockSupabaseClient
from tests.mocks.nlp_mock import MockNLPService


@pytest.mark.integration
class TestNotesAnalysisIntegration:
    """
    Suite de pruebas de integración para Notas y Análisis.
    Prueba la interacción entre routers, servicios y base de datos.
    """

    @pytest.fixture
    def mock_supabase(self):
        """Fixture que retorna un cliente mock de Supabase."""
        return MockSupabaseClient()

    @pytest.fixture
    def mock_nlp(self):
        """Fixture que retorna un servicio mock de NLP."""
        return MockNLPService()

    @pytest.fixture
    def test_client_with_mocks(self, mock_supabase, mock_nlp):
        """
        Fixture que retorna un cliente de prueba con mocks inyectados.
        """
        from main import app

        with patch('app.db.supabase.get_supabase_client') as mock_get_supabase, \
             patch('app.services.nlp_service.get_nlp_service') as mock_get_nlp:

            mock_get_supabase.return_value = mock_supabase
            mock_get_nlp.return_value = mock_nlp

            with TestClient(app) as client:
                yield client, mock_supabase

    # =========================================================
    # PRUEBAS DE FLUJO COMPLETO: CREAR NOTA → ANALIZAR
    # =========================================================

    def test_flujo_completo_guardar_y_analizar_nota(self, test_client_with_mocks):
        """
        Prueba el flujo completo de guardar una nota y luego analizarla.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"

        # Seed data en mock
        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Me siento muy feliz hoy",
                "usuario_id": user_id,
                "sentimiento": "POS",
                "emocion": "joy",
                "emocion_score": 0.95
            }
        ])

        # Paso 1: Guardar una nota
        nota_data = {
            "note": "Me siento muy feliz hoy",
            "user_id": user_id
        }

        response_guardar = client.post("/notas", json=nota_data)
        assert response_guardar.status_code in [200, 201]

        # Paso 2: Obtener notas del usuario
        response_obtener = client.get(f"/notas/{user_id}")
        assert response_obtener.status_code == 200

        data_obtener = response_obtener.json()
        assert "data" in data_obtener
        assert len(data_obtener["data"]) >= 1

        # Paso 3: Analizar las notas del usuario
        response_analizar = client.get(f"/analyze/{user_id}")
        assert response_analizar.status_code == 200

        data_analizar = response_analizar.json()
        assert "analysis" in data_analizar
        assert "notes" in data_analizar

    def test_guardar_nota_positiva_con_nlp(self, test_client_with_mocks):
        """
        Prueba guardar una nota positiva y verificar análisis NLP.
        """
        client, _ = test_client_with_mocks

        nota_data = {
            "note": "Hoy aprobé mi examen, estoy muy feliz y orgulloso",
            "user_id": "test_user_123"
        }

        response = client.post("/notas", json=nota_data)

        assert response.status_code in [200, 201]
        data = response.json()
        assert data["message"] == "Nota guardada con éxito"

    def test_guardar_nota_negativa_con_nlp(self, test_client_with_mocks):
        """
        Prueba guardar una nota negativa y verificar análisis NLP.
        """
        client, _ = test_client_with_mocks

        nota_data = {
            "note": "Estoy muy triste porque no pude completar mi proyecto",
            "user_id": "test_user_123"
        }

        response = client.post("/notas", json=nota_data)

        assert response.status_code in [200, 201]
        data = response.json()
        assert data["message"] == "Nota guardada con éxito"

    # =========================================================
    # PRUEBAS DE ANÁLISIS DE MÚLTIPLES NOTAS
    # =========================================================

    def test_analizar_multiples_notas_diferentes_sentimientos(self, test_client_with_mocks):
        """
        Prueba análisis de múltiples notas con diferentes sentimientos.
        """
        client, mock_supabase = test_client_with_mocks

        # Seed data con notas variadas
        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Estoy muy feliz",
                "usuario_id": "test_user_123",
                "sentimiento": "POS",
                "emocion": "joy",
                "emocion_score": 0.95
            },
            {
                "id": "2",
                "note": "Estoy muy triste",
                "usuario_id": "test_user_123",
                "sentimiento": "NEG",
                "emocion": "sadness",
                "emocion_score": 0.89
            },
            {
                "id": "3",
                "note": "Me siento ansioso",
                "usuario_id": "test_user_123",
                "sentimiento": "NEU",
                "emocion": "fear",
                "emocion_score": 0.88
            }
        ])

        # Analizar notas del usuario
        response = client.get("/analyze/test_user_123")

        assert response.status_code == 200
        data = response.json()

        assert "analysis" in data
        assert "notes" in data
        assert len(data["notes"]) == 3

    def test_analizar_usuario_sin_notas(self, test_client_with_mocks):
        """
        Prueba análisis de usuario sin notas.
        """
        client, _ = test_client_with_mocks

        response = client.get("/analyze/usuario_sin_notas")

        assert response.status_code == 200
        data = response.json()

        assert data["message"] == "Análisis completado sin datos"
        assert data["analysis"] == {}
        assert data["notes"] == []

    def test_endpoint_analyze_post_con_lista_notas(self, test_client_with_mocks):
        """
        Prueba el endpoint POST /analyze con una lista de notas.
        """
        client, _ = test_client_with_mocks

        notas = [
            {"note": "Me siento feliz", "user_id": "test_user_123"},
            {"note": "Estoy triste", "user_id": "test_user_123"},
            {"note": "Tengo ansiedad", "user_id": "test_user_123"}
        ]

        response = client.post("/analyze", json=notas)

        assert response.status_code == 200
        data = response.json()

        # Debe retornar visualizaciones
        assert isinstance(data, dict)

    def test_endpoint_analyze_post_sin_notas(self, test_client_with_mocks):
        """
        Prueba el endpoint POST /analyze sin notas.
        """
        client, _ = test_client_with_mocks

        response = client.post("/analyze", json=[])

        assert response.status_code == 400
        data = response.json()
        assert "detail" in data

    # =========================================================
    # PRUEBAS DE EXPORTACIÓN DE ANÁLISIS
    # =========================================================

    def test_exportar_reporte_csv(self, test_client_with_mocks):
        """
        Prueba exportación de reporte en CSV.
        """
        client, mock_supabase = test_client_with_mocks

        # Seed data
        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Estoy muy feliz",
                "usuario_id": "test_user_123",
                "sentimiento": "POS",
                "emocion": "joy"
            }
        ])

        response = client.get("/export/test_user_123")

        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv; charset=utf-8"
        assert "Content-Disposition" in response.headers

    def test_exportar_reporte_usuario_sin_notas(self, test_client_with_mocks):
        """
        Prueba exportación de reporte para usuario sin notas.
        """
        client, _ = test_client_with_mocks

        response = client.get("/export/usuario_sin_notas")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data

    # =========================================================
    # PRUEBAS DE ALERTA EN BACKGROUND
    # =========================================================

    @patch('app.services.alert_service.AlertService.trigger_alert_if_keywords')
    def test_guardar_nota_dispara_alerta_background(
        self,
        mock_trigger_alert,
        test_client_with_mocks
    ):
        """
        Prueba que guardar una nota dispara la verificación de alertas.
        """
        client, _ = test_client_with_mocks

        nota_data = {
            "note": "Tengo pensamientos de hacerme daño",
            "user_id": "test_user_123"
        }

        response = client.post("/notas", json=nota_data)

        assert response.status_code in [200, 201]
        # La alerta debería ejecutarse en background
        # No podemos verificar directamente la llamada en background tasks

    # =========================================================
    # PRUEBAS DE RENDIMIENTO Y VOLUMEN
    # =========================================================

    @pytest.mark.slow
    def test_analizar_gran_volumen_notas(self, test_client_with_mocks):
        """
        Prueba análisis con gran volumen de notas.
        """
        client, mock_supabase = test_client_with_mocks

        # Generar 100 notas
        notas = [
            {
                "id": str(i),
                "note": f"Nota número {i}",
                "usuario_id": "test_user_123",
                "sentimiento": "NEU",
                "emocion": "neutral"
            }
            for i in range(100)
        ]

        mock_supabase.seed_data("notas", notas)

        response = client.get("/analyze/test_user_123")

        assert response.status_code == 200
        data = response.json()
        assert len(data["notes"]) == 100

    # =========================================================
    # PRUEBAS DE VALIDACIÓN DE DATOS
    # =========================================================

    def test_guardar_nota_sin_user_id(self, test_client_with_mocks):
        """
        Prueba validación cuando falta user_id.
        """
        client, _ = test_client_with_mocks

        nota_data = {
            "note": "Nota sin usuario"
        }

        response = client.post("/notas", json=nota_data)

        assert response.status_code == 422  # Validation error

    def test_guardar_nota_sin_texto(self, test_client_with_mocks):
        """
        Prueba validación cuando falta el texto de la nota.
        """
        client, _ = test_client_with_mocks

        nota_data = {
            "user_id": "test_user_123"
        }

        response = client.post("/notas", json=nota_data)

        assert response.status_code == 422  # Validation error

    def test_obtener_notas_formato_respuesta(self, test_client_with_mocks):
        """
        Prueba que el formato de respuesta de obtener notas es correcto.
        """
        client, mock_supabase = test_client_with_mocks

        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Test",
                "usuario_id": "test_user_123"
            }
        ])

        response = client.get("/notas/test_user_123")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "data" in data
        assert isinstance(data["data"], list)
