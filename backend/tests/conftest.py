"""
Configuración global de pytest y fixtures compartidos.
"""
import sys
import pytest
from pathlib import Path
from typing import Generator, Dict, Any
from unittest.mock import Mock, MagicMock
from fastapi.testclient import TestClient

# Agregar directorio raíz al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app
from app.config.settings import Settings


# =========================================================
# FIXTURES DE CONFIGURACIÓN
# =========================================================

@pytest.fixture(scope="session")
def test_settings() -> Settings:
    """
    Fixture de configuración para pruebas.
    Usa configuración de prueba en lugar de producción.
    """
    return Settings(
        app_name="UNAYOE Test",
        debug=True,
        api_version="2.0.0-test",
        supabase_url="https://test.supabase.co",
        supabase_key="test_key",
        cors_origins=["http://localhost:3000"],
        sentiment_model="pysentimiento/robertuito-sentiment-analysis",
        emotion_model="pysentimiento/robertuito-emotion-analysis",
        gemini_api_key="test_gemini_key",
        gemini_model="gemini-2.0-flash",
        gmail_sender="test@example.com",
        gmail_smtp_password="test_password",
        alert_fallback_email="alert@example.com"
    )


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    """
    Cliente de prueba de FastAPI.
    Usado para pruebas de integración de endpoints.
    """
    with TestClient(app) as test_client:
        yield test_client


# =========================================================
# FIXTURES DE MOCK PARA SUPABASE
# =========================================================

@pytest.fixture
def mock_supabase_client():
    """
    Mock del cliente de Supabase.
    Simula operaciones de base de datos.
    """
    mock_client = MagicMock()

    # Mock de tabla
    mock_table = MagicMock()
    mock_client.table.return_value = mock_table

    # Mock de operaciones CRUD
    mock_table.select.return_value = mock_table
    mock_table.insert.return_value = mock_table
    mock_table.update.return_value = mock_table
    mock_table.delete.return_value = mock_table
    mock_table.eq.return_value = mock_table
    mock_table.order.return_value = mock_table
    mock_table.limit.return_value = mock_table

    # Mock de execute
    mock_execute = MagicMock()
    mock_execute.data = []
    mock_table.execute.return_value = mock_execute

    return mock_client


@pytest.fixture
def mock_supabase_response():
    """
    Mock de respuesta exitosa de Supabase.
    """
    mock_response = MagicMock()
    mock_response.data = []
    return mock_response


# =========================================================
# FIXTURES DE DATOS DE PRUEBA
# =========================================================

@pytest.fixture
def sample_note_data() -> Dict[str, Any]:
    """Datos de ejemplo para una nota."""
    return {
        "note": "Hoy me siento muy feliz porque aprobé mi examen",
        "user_id": "test_user_123"
    }


@pytest.fixture
def sample_notes_list() -> list:
    """Lista de notas de ejemplo para pruebas."""
    return [
        {
            "note": "Hoy me siento muy feliz porque aprobé mi examen",
            "user_id": "test_user_123"
        },
        {
            "note": "Estoy triste porque no pude terminar mi proyecto",
            "user_id": "test_user_123"
        },
        {
            "note": "Me siento ansioso por la presentación de mañana",
            "user_id": "test_user_123"
        }
    ]


@pytest.fixture
def sample_analyzed_notes() -> list:
    """Notas ya analizadas con sentimientos y emociones."""
    return [
        {
            "note": "Hoy me siento muy feliz",
            "user_id": "test_user_123",
            "sentimiento": "POS",
            "emocion": "joy",
            "emocion_score": 0.95
        },
        {
            "note": "Estoy muy triste",
            "user_id": "test_user_123",
            "sentimiento": "NEG",
            "emocion": "sadness",
            "emocion_score": 0.89
        }
    ]


@pytest.fixture
def sample_recommendations() -> list:
    """Recomendaciones de ejemplo."""
    return [
        {
            "id": "rec_1",
            "titulo": "Meditación Guiada",
            "descripcion": "Ejercicio de relajación",
            "tipo": "actividad",
            "emocion_objetivo": "joy",
            "sentimiento_objetivo": "POS"
        },
        {
            "id": "rec_2",
            "titulo": "Hablar con un amigo",
            "descripcion": "Conexión social",
            "tipo": "social",
            "emocion_objetivo": "sadness",
            "sentimiento_objetivo": "NEG"
        }
    ]


@pytest.fixture
def sample_user_id() -> str:
    """ID de usuario de prueba."""
    return "test_user_123"


# =========================================================
# FIXTURES DE MOCK PARA SERVICIOS NLP
# =========================================================

@pytest.fixture
def mock_sentiment_classifier():
    """
    Mock del clasificador de sentimientos.
    Retorna respuestas predefinidas.
    """
    mock_classifier = Mock()
    mock_classifier.return_value = [{"label": "POS", "score": 0.95}]
    return mock_classifier


@pytest.fixture
def mock_emotion_classifier():
    """
    Mock del clasificador de emociones.
    Retorna respuestas predefinidas.
    """
    mock_classifier = Mock()
    mock_classifier.return_value = [{"label": "joy", "score": 0.89}]
    return mock_classifier


@pytest.fixture
def mock_nlp_service(mock_sentiment_classifier, mock_emotion_classifier):
    """
    Mock completo del servicio NLP.
    """
    mock_service = MagicMock()
    mock_service.sentiment_classifier = mock_sentiment_classifier
    mock_service.emotion_classifier = mock_emotion_classifier

    # Métodos del servicio
    mock_service.preprocesar_texto.return_value = (
        "texto procesado",
        ["texto", "procesado"]
    )
    mock_service.analizar_sentimiento.return_value = "POS"
    mock_service.analizar_emocion.return_value = ("joy", 0.89)

    return mock_service


# =========================================================
# FIXTURES DE CLEANUP
# =========================================================

@pytest.fixture(autouse=True)
def reset_singletons():
    """
    Resetea singletons entre pruebas para evitar contaminación.
    """
    yield
    # Aquí se pueden limpiar cachés o singletons si es necesario


# =========================================================
# CONFIGURACIÓN DE MARCADORES
# =========================================================

def pytest_configure(config):
    """Configuración adicional de pytest."""
    config.addinivalue_line(
        "markers", "integration: marca prueba como integración"
    )
    config.addinivalue_line(
        "markers", "unit: marca prueba como unitaria"
    )
    config.addinivalue_line(
        "markers", "nlp: marca prueba de servicios NLP/IA"
    )
    config.addinivalue_line(
        "markers", "slow: marca prueba como lenta"
    )
    config.addinivalue_line(
        "markers", "db: marca prueba que requiere BD"
    )
