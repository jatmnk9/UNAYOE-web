# 🧪 Documentación de Pruebas - UNAYOE Backend

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura de Pruebas](#arquitectura-de-pruebas)
3. [Configuración](#configuración)
4. [Ejecución de Pruebas](#ejecución-de-pruebas)
5. [Cobertura de Pruebas](#cobertura-de-pruebas)
6. [Módulos Probados](#módulos-probados)
7. [Mocks y Fixtures](#mocks-y-fixtures)
8. [CI/CD](#cicd)
9. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

Este proyecto implementa un sistema completo de pruebas automatizadas para el backend de UNAYOE, incluyendo:

- ✅ **Pruebas Unitarias** - Servicios NLP/IA y análisis
- ✅ **Pruebas de Integración** - Módulos de Notas, Análisis y Recomendaciones
- ✅ **Mocks** - Supabase y servicios externos
- ✅ **CI/CD** - GitHub Actions automatizado

### 🔍 Módulos con Cobertura de Pruebas

**Módulo 1: Notes + Analysis (con servicios NLP/IA)**
- Router de notas ([app/routers/notes.py](app/routers/notes.py))
- Router de análisis ([app/routers/analysis.py](app/routers/analysis.py))
- Servicio NLP ([app/services/nlp_service.py](app/services/nlp_service.py))
- Servicio de análisis ([app/services/analysis_service.py](app/services/analysis_service.py))

**Módulo 2: Recommendations (con personalización NLP)**
- Router de recomendaciones ([app/routers/recommendations.py](app/routers/recommendations.py))
- Servicio de recomendaciones ([app/services/recommendations_service.py](app/services/recommendations_service.py))

---

## 🏗️ Arquitectura de Pruebas

```
backend/tests/
├── __init__.py
├── conftest.py                          # Configuración global y fixtures
├── pytest.ini                           # Configuración de pytest
│
├── unit/                                # Pruebas unitarias
│   ├── __init__.py
│   ├── test_nlp_service.py             # Pruebas de servicios NLP/IA
│   └── test_analysis_service.py        # Pruebas de análisis
│
├── integration/                         # Pruebas de integración
│   ├── __init__.py
│   ├── test_notes_analysis_integration.py      # Integración Notes + Analysis
│   └── test_recommendations_integration.py     # Integración Recommendations
│
├── mocks/                               # Mocks para servicios externos
│   ├── __init__.py
│   ├── supabase_mock.py                # Mock de Supabase
│   └── nlp_mock.py                     # Mock de servicios NLP/IA
│
└── fixtures/                            # Fixtures compartidos
    └── __init__.py
```

---

## ⚙️ Configuración

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:

```env
APP_NAME="UNAYOE Test"
DEBUG=true
API_VERSION="2.0.0-test"
SUPABASE_URL="https://test.supabase.co"
SUPABASE_KEY="test_key"
CORS_ORIGINS="http://localhost:3000"
SENTIMENT_MODEL="pysentimiento/robertuito-sentiment-analysis"
EMOTION_MODEL="pysentimiento/robertuito-emotion-analysis"
GEMINI_API_KEY="test_gemini_key"
GEMINI_MODEL="gemini-2.0-flash"
GMAIL_SENDER="test@example.com"
GMAIL_SMTP_PASSWORD="test_password"
ALERT_FALLBACK_EMAIL="alert@example.com"
```

---

## 🚀 Ejecución de Pruebas

### Ejecutar Todas las Pruebas

```bash
cd backend
pytest
```

### Ejecutar Pruebas Específicas

**Pruebas Unitarias:**
```bash
pytest tests/unit -v
```

**Pruebas de Integración:**
```bash
pytest tests/integration -v
```

**Pruebas de Servicios NLP/IA:**
```bash
pytest -m nlp -v
```

**Pruebas con Marcadores:**
```bash
# Solo pruebas unitarias
pytest -m unit -v

# Solo pruebas de integración
pytest -m integration -v

# Excluir pruebas lentas
pytest -m "not slow" -v
```

### Ejecutar un Archivo Específico

```bash
pytest tests/unit/test_nlp_service.py -v
```

### Ejecutar una Prueba Específica

```bash
pytest tests/unit/test_nlp_service.py::TestNLPService::test_analizar_sentimiento_positivo -v
```

---

## 📊 Cobertura de Pruebas

### Generar Reporte de Cobertura

```bash
pytest --cov=app --cov-report=html --cov-report=term-missing
```

### Ver Reporte HTML

```bash
# En Windows
start htmlcov/index.html

# En Linux/Mac
open htmlcov/index.html
```

### Objetivo de Cobertura

El proyecto está configurado con un mínimo de **70% de cobertura**.

---

## 🧩 Módulos Probados

### 1️⃣ Módulo: Notes + Analysis (NLP/IA)

#### Funcionalidades Probadas:

**Servicio NLP ([test_nlp_service.py](tests/unit/test_nlp_service.py)):**
- ✅ Preprocesamiento de texto (tokenización, limpieza)
- ✅ Análisis de sentimientos (POS/NEG/NEU)
- ✅ Análisis de emociones (joy, sadness, anger, fear)
- ✅ Manejo de textos vacíos y casos extremos
- ✅ Clasificadores mock de transformers

**Servicio de Análisis ([test_analysis_service.py](tests/unit/test_analysis_service.py)):**
- ✅ Análisis de múltiples notas
- ✅ Creación de visualizaciones (gráficos de sentimientos, emociones)
- ✅ Generación de nubes de palabras
- ✅ Manejo de DataFrames vacíos
- ✅ Casos extremos (textos largos, caracteres especiales)

**Integración ([test_notes_analysis_integration.py](tests/integration/test_notes_analysis_integration.py)):**
- ✅ Flujo completo: Guardar nota → Analizar con NLP → Obtener resultados
- ✅ Endpoints de creación de notas
- ✅ Endpoints de análisis de notas
- ✅ Exportación de reportes CSV
- ✅ Sistema de alertas en background
- ✅ Validación de datos

#### Ejemplo de Uso:

```python
# Crear una nota y analizarla
response = client.post("/notas", json={
    "note": "Me siento muy feliz hoy",
    "user_id": "test_user_123"
})

# Analizar notas del usuario
response = client.get("/analyze/test_user_123")
```

---

### 2️⃣ Módulo: Recommendations (Personalización con NLP)

#### Funcionalidades Probadas:

**Integración ([test_recommendations_integration.py](tests/integration/test_recommendations_integration.py)):**
- ✅ Obtención de todas las recomendaciones
- ✅ Recomendaciones personalizadas basadas en análisis NLP
- ✅ Sistema de likes (agregar, eliminar, obtener)
- ✅ Recomendaciones favoritas
- ✅ Flujo completo: Nota → Análisis NLP → Recomendación personalizada
- ✅ Consideración de likes previos en personalización
- ✅ Casos sin historial (recomendaciones generales)

#### Ejemplo de Uso:

```python
# Obtener recomendaciones personalizadas (usa análisis NLP de notas previas)
response = client.get("/recomendaciones/test_user_123")

# Agregar like a una recomendación
response = client.post("/likes/test_user_123/rec_1")

# Obtener favoritos
response = client.get("/recomendaciones/favoritos/test_user_123")
```

---

## 🎭 Mocks y Fixtures

### Mock de Supabase ([supabase_mock.py](tests/mocks/supabase_mock.py))

Simula operaciones de base de datos:
- `select()`, `insert()`, `update()`, `delete()`
- `eq()`, `order()`, `limit()`
- `execute()`

```python
# Uso en pruebas
mock_supabase = MockSupabaseClient()
mock_supabase.seed_data("notas", [
    {"id": "1", "note": "Test", "usuario_id": "user_123"}
])
```

### Mock de Servicios NLP ([nlp_mock.py](tests/mocks/nlp_mock.py))

Simula análisis de NLP sin cargar modelos reales:
- Análisis de sentimientos
- Análisis de emociones
- Preprocesamiento de texto

```python
# Uso en pruebas
mock_nlp = MockNLPService()
sentimiento = mock_nlp.analizar_sentimiento("Me siento feliz")
# Retorna: "POS"
```

### Fixtures Globales ([conftest.py](tests/conftest.py))

Fixtures disponibles para todas las pruebas:
- `test_settings` - Configuración de prueba
- `client` - Cliente TestClient de FastAPI
- `mock_supabase_client` - Mock de Supabase
- `mock_nlp_service` - Mock de servicios NLP
- `sample_note_data` - Datos de ejemplo
- `sample_recommendations` - Recomendaciones de ejemplo

---

## 🔄 CI/CD

### GitHub Actions

El proyecto incluye un workflow de CI/CD ([.github/workflows/backend-tests.yml](../.github/workflows/backend-tests.yml)) que se ejecuta automáticamente en:
- Push a ramas: `main`, `develop`, `refactorbackend`
- Pull Requests a `main` y `develop`

#### Jobs del Pipeline:

**1. Test Job:**
- ✅ Ejecuta pruebas en Python 3.10 y 3.11
- ✅ Pruebas unitarias
- ✅ Pruebas de servicios NLP/IA
- ✅ Pruebas de integración
- ✅ Reporte de cobertura (Codecov)

**2. Code Quality Job:**
- ✅ Verificación de formato con Black
- ✅ Verificación de imports con isort
- ✅ Linting con flake8

#### Ver Estado del Pipeline:

```bash
# Badge en README (agregar)
![Tests](https://github.com/usuario/UNAYOE-web/workflows/Backend%20Tests%20CI%2FCD/badge.svg)
```

---

## ✨ Mejores Prácticas

### 1. Nombrar Pruebas de Forma Descriptiva

```python
# ✅ BIEN
def test_analizar_sentimiento_positivo_con_texto_feliz():
    pass

# ❌ MAL
def test_1():
    pass
```

### 2. Usar Marcadores

```python
@pytest.mark.integration
@pytest.mark.nlp
def test_flujo_completo_nlp():
    pass
```

### 3. Usar Fixtures para Datos Compartidos

```python
@pytest.fixture
def sample_note():
    return {"note": "Test", "user_id": "123"}

def test_guardar_nota(sample_note):
    # Usar sample_note
    pass
```

### 4. Probar Casos Extremos

```python
def test_analizar_texto_vacio():
    result = nlp_service.analizar_sentimiento("")
    assert result == "NEU"
```

### 5. Usar Parametrize para Múltiples Casos

```python
@pytest.mark.parametrize("texto,sentimiento_esperado", [
    ("Me siento feliz", "POS"),
    ("Estoy triste", "NEG"),
    ("Día normal", "NEU"),
])
def test_sentimientos(texto, sentimiento_esperado):
    result = nlp_service.analizar_sentimiento(texto)
    assert result == sentimiento_esperado
```

### 6. Mantener Pruebas Independientes

Las pruebas deben poder ejecutarse en cualquier orden sin dependencias entre ellas.

### 7. Usar Mocks para Servicios Externos

Siempre mockear:
- Base de datos (Supabase)
- APIs externas (Gemini, Gmail)
- Modelos de ML (transformers)

---

## 📈 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Pruebas Totales** | 50+ |
| **Pruebas Unitarias** | 25+ |
| **Pruebas de Integración** | 25+ |
| **Cobertura Mínima** | 70% |
| **Módulos Probados** | 2 (Notes+Analysis, Recommendations) |
| **Servicios NLP Probados** | ✅ Sí |

---

## 🆘 Solución de Problemas

### Error: "ModuleNotFoundError"

```bash
# Asegurarse de estar en el directorio correcto
cd backend

# Reinstalar dependencias
pip install -r requirements.txt
```

### Error: "No module named 'app'"

```bash
# Agregar directorio raíz al PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# O ejecutar desde el directorio backend
cd backend && pytest
```

### Pruebas Lentas

```bash
# Excluir pruebas marcadas como "slow"
pytest -m "not slow"
```

### Ver Salida Detallada

```bash
# Modo verbose con output completo
pytest -v -s
```

---

## 📚 Referencias

- [Pytest Documentation](https://docs.pytest.org/)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Pytest-cov](https://pytest-cov.readthedocs.io/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 👥 Contribuir

Para agregar nuevas pruebas:

1. Crear archivo de prueba en `tests/unit/` o `tests/integration/`
2. Seguir la convención de nombres: `test_*.py`
3. Usar fixtures del [conftest.py](tests/conftest.py)
4. Agregar marcadores apropiados
5. Ejecutar pruebas localmente antes de commit
6. Verificar cobertura

---

## 📄 Licencia

Este proyecto es parte de UNAYOE - Sistema de Análisis de Bienestar Estudiantil.

---

**Última actualización:** 2025-12-05
**Versión:** 2.0.0
