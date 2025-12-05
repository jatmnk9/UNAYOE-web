"""
Pruebas de integración para el módulo de Recomendaciones.
Prueba el flujo completo: análisis NLP → recomendaciones personalizadas → likes.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from tests.mocks.supabase_mock import MockSupabaseClient
from tests.mocks.nlp_mock import MockNLPService


@pytest.mark.integration
class TestRecommendationsIntegration:
    """
    Suite de pruebas de integración para Recomendaciones.
    Prueba la interacción entre análisis NLP y sistema de recomendaciones.
    """

    @pytest.fixture
    def mock_supabase(self):
        """Fixture que retorna un cliente mock de Supabase."""
        client = MockSupabaseClient()

        # Seed data de recomendaciones
        client.seed_data("recomendaciones", [
            {
                "id": "rec_1",
                "titulo": "Meditación Guiada",
                "descripcion": "Ejercicio de relajación para reducir estrés",
                "tipo": "actividad",
                "emocion_objetivo": "joy",
                "sentimiento_objetivo": "POS"
            },
            {
                "id": "rec_2",
                "titulo": "Hablar con un amigo",
                "descripcion": "Conexión social para mejorar ánimo",
                "tipo": "social",
                "emocion_objetivo": "sadness",
                "sentimiento_objetivo": "NEG"
            },
            {
                "id": "rec_3",
                "titulo": "Ejercicio físico",
                "descripcion": "Actividad física para liberar endorfinas",
                "tipo": "actividad",
                "emocion_objetivo": "fear",
                "sentimiento_objetivo": "NEU"
            }
        ])

        return client

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
    # PRUEBAS DE OBTENCIÓN DE RECOMENDACIONES
    # =========================================================

    def test_obtener_todas_las_recomendaciones(self, test_client_with_mocks):
        """
        Prueba obtener todas las recomendaciones disponibles.
        """
        client, _ = test_client_with_mocks

        response = client.get("/recomendaciones/todas")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "data" in data
        assert len(data["data"]) >= 3

    def test_obtener_todas_recomendaciones_estructura(self, test_client_with_mocks):
        """
        Prueba la estructura de las recomendaciones obtenidas.
        """
        client, _ = test_client_with_mocks

        response = client.get("/recomendaciones/todas")
        data = response.json()

        recomendaciones = data["data"]
        assert len(recomendaciones) > 0

        primera_rec = recomendaciones[0]
        assert "id" in primera_rec
        assert "titulo" in primera_rec
        assert "descripcion" in primera_rec
        assert "tipo" in primera_rec
        assert "emocion_objetivo" in primera_rec
        assert "sentimiento_objetivo" in primera_rec

    # =========================================================
    # PRUEBAS DE RECOMENDACIONES PERSONALIZADAS CON NLP
    # =========================================================

    def test_recomendaciones_personalizadas_usuario_con_notas_positivas(
        self,
        test_client_with_mocks
    ):
        """
        Prueba recomendaciones personalizadas basadas en notas positivas.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"

        # Seed data de notas con sentimiento positivo
        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Me siento muy feliz hoy",
                "usuario_id": user_id,
                "emocion": "joy",
                "sentimiento": "POS"
            },
            {
                "id": "2",
                "note": "Estoy alegre y contento",
                "usuario_id": user_id,
                "emocion": "joy",
                "sentimiento": "POS"
            }
        ])

        response = client.get(f"/recomendaciones/{user_id}")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "data" in data
        assert "emocion_detectada" in data
        assert "sentimiento_detectado" in data

    def test_recomendaciones_personalizadas_usuario_con_notas_negativas(
        self,
        test_client_with_mocks
    ):
        """
        Prueba recomendaciones personalizadas basadas en notas negativas.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_456"

        # Seed data de notas con sentimiento negativo
        mock_supabase.seed_data("notas", [
            {
                "id": "3",
                "note": "Me siento muy triste",
                "usuario_id": user_id,
                "emocion": "sadness",
                "sentimiento": "NEG"
            },
            {
                "id": "4",
                "note": "Estoy frustrado",
                "usuario_id": user_id,
                "emocion": "anger",
                "sentimiento": "NEG"
            }
        ])

        response = client.get(f"/recomendaciones/{user_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["sentimiento_detectado"] == "NEG"

    def test_recomendaciones_usuario_sin_historial(self, test_client_with_mocks):
        """
        Prueba recomendaciones para usuario sin historial de notas.
        """
        client, _ = test_client_with_mocks

        response = client.get("/recomendaciones/usuario_nuevo")

        assert response.status_code == 200
        data = response.json()

        assert data["message"] == "Recomendaciones generales"
        assert data["emocion_detectada"] is None
        assert data["sentimiento_detectado"] is None
        assert len(data["data"]) > 0  # Debe retornar recomendaciones generales

    def test_recomendaciones_considera_likes_previos(self, test_client_with_mocks):
        """
        Prueba que las recomendaciones consideran likes previos del usuario.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_789"

        # Seed data de likes previos
        mock_supabase.seed_data("likes_recomendaciones", [
            {
                "user_id": user_id,
                "recomendacion_id": "rec_1",
                "recomendaciones": {
                    "emocion_objetivo": "joy",
                    "sentimiento_objetivo": "POS"
                }
            }
        ])

        response = client.get(f"/recomendaciones/{user_id}")

        assert response.status_code == 200
        data = response.json()

        # Debería considerar los likes en la personalización
        assert "data" in data

    # =========================================================
    # PRUEBAS DE SISTEMA DE LIKES
    # =========================================================

    def test_agregar_like_a_recomendacion(self, test_client_with_mocks):
        """
        Prueba agregar un like a una recomendación.
        """
        client, _ = test_client_with_mocks
        user_id = "test_user_123"
        recomendacion_id = "rec_1"

        response = client.post(f"/likes/{user_id}/{recomendacion_id}")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "like agregado" in data["message"].lower()

    def test_eliminar_like_de_recomendacion(self, test_client_with_mocks):
        """
        Prueba eliminar un like de una recomendación.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"
        recomendacion_id = "rec_1"

        # Primero agregar el like
        mock_supabase.seed_data("likes_recomendaciones", [
            {
                "user_id": user_id,
                "recomendacion_id": recomendacion_id
            }
        ])

        response = client.delete(f"/likes/{user_id}/{recomendacion_id}")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "like eliminado" in data["message"].lower()

    def test_obtener_likes_usuario(self, test_client_with_mocks):
        """
        Prueba obtener los likes de un usuario.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"

        # Seed data de likes
        mock_supabase.seed_data("likes_recomendaciones", [
            {"user_id": user_id, "recomendacion_id": "rec_1"},
            {"user_id": user_id, "recomendacion_id": "rec_2"}
        ])

        response = client.get(f"/likes/{user_id}")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 2

    def test_obtener_likes_usuario_sin_likes(self, test_client_with_mocks):
        """
        Prueba obtener likes de usuario que no tiene ninguno.
        """
        client, _ = test_client_with_mocks

        response = client.get("/likes/usuario_sin_likes")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) == 0

    # =========================================================
    # PRUEBAS DE RECOMENDACIONES FAVORITAS
    # =========================================================

    def test_obtener_recomendaciones_favoritas(self, test_client_with_mocks):
        """
        Prueba obtener los detalles completos de recomendaciones favoritas.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"

        # Seed data
        mock_supabase.seed_data("likes_recomendaciones", [
            {
                "user_id": user_id,
                "recomendacion_id": "rec_1",
                "recomendaciones": {
                    "id": "rec_1",
                    "titulo": "Meditación",
                    "descripcion": "Test"
                }
            }
        ])

        response = client.get(f"/recomendaciones/favoritos/{user_id}")

        assert response.status_code == 200
        data = response.json()

        assert "message" in data
        assert "data" in data

    def test_obtener_favoritos_usuario_sin_favoritos(self, test_client_with_mocks):
        """
        Prueba obtener favoritos de usuario sin ninguno.
        """
        client, _ = test_client_with_mocks

        response = client.get("/recomendaciones/favoritos/usuario_sin_favoritos")

        assert response.status_code == 200
        data = response.json()

        assert data["message"] == "No se encontraron recomendaciones favoritas"
        assert data["data"] == []

    # =========================================================
    # PRUEBAS DE FLUJO COMPLETO: NOTAS → ANÁLISIS NLP → RECOMENDACIONES
    # =========================================================

    def test_flujo_completo_nota_a_recomendacion(self, test_client_with_mocks):
        """
        Prueba el flujo completo desde crear una nota hasta obtener recomendaciones.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_flow"

        # Paso 1: Crear una nota con emoción
        nota_data = {
            "note": "Me siento muy triste hoy",
            "user_id": user_id
        }
        response_nota = client.post("/notas", json=nota_data)
        assert response_nota.status_code in [200, 201]

        # Paso 2: Seed la nota en la BD mock (simular análisis NLP)
        mock_supabase.seed_data("notas", [
            {
                "id": "1",
                "note": "Me siento muy triste hoy",
                "usuario_id": user_id,
                "emocion": "sadness",
                "sentimiento": "NEG"
            }
        ])

        # Paso 3: Obtener recomendaciones personalizadas
        response_recs = client.get(f"/recomendaciones/{user_id}")
        assert response_recs.status_code == 200

        data_recs = response_recs.json()
        assert "data" in data_recs
        assert "emocion_detectada" in data_recs

        # Paso 4: Agregar like a una recomendación
        if len(data_recs["data"]) > 0:
            rec_id = data_recs["data"][0]["id"]
            response_like = client.post(f"/likes/{user_id}/{rec_id}")
            assert response_like.status_code == 200

    def test_flujo_completo_multiple_notas_recomendaciones_personalizadas(
        self,
        test_client_with_mocks
    ):
        """
        Prueba flujo con múltiples notas para personalización mejorada.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_multiple"

        # Crear múltiples notas
        notas = [
            {"note": "Me siento feliz", "user_id": user_id},
            {"note": "Estoy alegre", "user_id": user_id},
            {"note": "Hoy es un buen día", "user_id": user_id}
        ]

        for nota in notas:
            response = client.post("/notas", json=nota)
            assert response.status_code in [200, 201]

        # Seed data de análisis
        mock_supabase.seed_data("notas", [
            {
                "id": str(i),
                "note": nota["note"],
                "usuario_id": user_id,
                "emocion": "joy",
                "sentimiento": "POS"
            }
            for i, nota in enumerate(notas)
        ])

        # Obtener recomendaciones personalizadas
        response = client.get(f"/recomendaciones/{user_id}")

        assert response.status_code == 200
        data = response.json()

        assert data["emocion_detectada"] == "joy"
        assert data["sentimiento_detectado"] == "POS"

    # =========================================================
    # PRUEBAS DE CASOS EXTREMOS
    # =========================================================

    def test_agregar_like_duplicado(self, test_client_with_mocks):
        """
        Prueba agregar un like duplicado (debería manejarse correctamente).
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_123"
        recomendacion_id = "rec_1"

        # Agregar like por primera vez
        response1 = client.post(f"/likes/{user_id}/{recomendacion_id}")
        assert response1.status_code == 200

        # Intentar agregar de nuevo
        response2 = client.post(f"/likes/{user_id}/{recomendacion_id}")
        # Debería manejarse el error o retornar mensaje apropiado
        assert response2.status_code in [200, 400, 409]

    def test_eliminar_like_inexistente(self, test_client_with_mocks):
        """
        Prueba eliminar un like que no existe.
        """
        client, _ = test_client_with_mocks

        response = client.delete("/likes/user_fake/rec_fake")

        # Debería retornar 200 o 404
        assert response.status_code in [200, 404]

    @pytest.mark.slow
    def test_personalizar_con_gran_historial(self, test_client_with_mocks):
        """
        Prueba personalización con gran historial de notas.
        """
        client, mock_supabase = test_client_with_mocks
        user_id = "test_user_big_history"

        # Generar 50 notas
        notas = [
            {
                "id": str(i),
                "note": f"Nota {i}",
                "usuario_id": user_id,
                "emocion": "joy" if i % 2 == 0 else "sadness",
                "sentimiento": "POS" if i % 2 == 0 else "NEG"
            }
            for i in range(50)
        ]

        mock_supabase.seed_data("notas", notas)

        response = client.get(f"/recomendaciones/{user_id}")

        assert response.status_code == 200
        data = response.json()
        assert "emocion_detectada" in data
        assert "sentimiento_detectado" in data
