# 📘 Guía de Uso del Backend Refactorizado

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar repositorio
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# Importante: NUNCA commitear el archivo .env
```

### 3. Ejecutar

```bash
# Modo desarrollo (con auto-reload)
python main.py

# O usando uvicorn directamente
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Probar

Abrir navegador en:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 Ejemplos de Uso

### Cómo Agregar un Nuevo Endpoint

#### 1. Crear el Schema (si es necesario)

`app/models/schemas.py`:
```python
class MiNuevoRequest(BaseModel):
    """Esquema para mi nuevo endpoint."""
    campo1: str = Field(..., description="Descripción del campo")
    campo2: int = Field(..., gt=0)
```

#### 2. Crear el Servicio

`app/services/mi_servicio.py`:
```python
"""
Servicio para mi nueva funcionalidad.
"""
from fastapi import HTTPException
from app.db.supabase import get_supabase_client


class MiServicio:
    """Servicio de mi funcionalidad."""

    def __init__(self):
        self.supabase = get_supabase_client()

    def mi_metodo(self, param: str) -> dict:
        """
        Descripción del método.

        Args:
            param: Parámetro de entrada

        Returns:
            Dict con el resultado

        Raises:
            HTTPException: Si ocurre un error
        """
        try:
            # Lógica de negocio aquí
            result = self.supabase.table("mi_tabla")\
                .select("*")\
                .eq("campo", param)\
                .execute()

            return {"data": result.data}

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error: {str(e)}"
            )


def get_mi_servicio() -> MiServicio:
    """Factory function para obtener instancia."""
    return MiServicio()
```

#### 3. Crear el Router

`app/routers/mi_router.py`:
```python
"""
Router de mi funcionalidad.
Maneja endpoints relacionados con mi feature.
"""
from fastapi import APIRouter, Depends
from app.models.schemas import MiNuevoRequest
from app.services.mi_servicio import get_mi_servicio, MiServicio

router = APIRouter(prefix="/mi-ruta", tags=["Mi Feature"])


@router.post("/crear")
async def crear_algo(
    request: MiNuevoRequest,
    mi_servicio: MiServicio = Depends(get_mi_servicio)
):
    """
    Crea algo nuevo.

    Args:
        request: Datos de la petición

    Returns:
        Resultado de la creación
    """
    return mi_servicio.mi_metodo(request.campo1)


@router.get("/listar")
async def listar_algo(
    mi_servicio: MiServicio = Depends(get_mi_servicio)
):
    """Lista todos los elementos."""
    return {"items": []}
```

#### 4. Registrar el Router en main.py

`main.py`:
```python
from app.routers import (
    auth,
    users,
    notes,
    # ... otros routers
    mi_router  # 👈 Agregar import
)

# ... después de create app ...

app.include_router(auth.router)
app.include_router(users.router)
# ... otros routers
app.include_router(mi_router.router)  # 👈 Registrar router
```

### Cómo Usar Servicios Existentes

#### En un Router:

```python
from fastapi import APIRouter, Depends
from app.services.notes_service import get_notes_service, NotesService

router = APIRouter()

@router.get("/mi-endpoint")
async def mi_endpoint(
    notes_service: NotesService = Depends(get_notes_service)
):
    """Uso de servicio existente."""
    notas = notes_service.obtener_notas_por_usuario("user_123")
    return {"notas": notas}
```

#### En un Servicio (composición):

```python
class MiServicio:
    def __init__(self):
        self.supabase = get_supabase_client()
        self.nlp_service = get_nlp_service()  # 👈 Reutilizar servicio

    def mi_metodo(self, texto: str):
        # Usar NLP service
        texto_limpio, tokens = self.nlp_service.preprocesar_texto(texto)
        sentimiento = self.nlp_service.analizar_sentimiento(texto)

        return {
            "texto_procesado": texto_limpio,
            "sentimiento": sentimiento
        }
```

### Cómo Agregar una Nueva Configuración

#### 1. Agregar en .env:

```env
MI_NUEVA_CONFIG=valor
MI_API_KEY=secret-key
```

#### 2. Agregar en Settings:

`app/config/settings.py`:
```python
class Settings(BaseSettings):
    # ... configuraciones existentes ...

    # Nueva configuración
    mi_nueva_config: str = "default_value"
    mi_api_key: str = ""

    class Config:
        env_file = ".env"
```

#### 3. Usar en Servicios:

```python
from app.config.settings import get_settings

class MiServicio:
    def __init__(self):
        self.settings = get_settings()

    def mi_metodo(self):
        api_key = self.settings.mi_api_key
        # Usar configuración...
```

## 🧪 Testing

### Estructura de Tests Recomendada

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Fixtures compartidos
│   │
│   ├── unit/                 # Tests unitarios
│   │   ├── test_nlp_service.py
│   │   ├── test_auth_service.py
│   │   └── ...
│   │
│   └── integration/          # Tests de integración
│       ├── test_auth_router.py
│       ├── test_notes_router.py
│       └── ...
```

### Ejemplo de Test Unitario

`tests/unit/test_nlp_service.py`:
```python
import pytest
from app.services.nlp_service import NLPService


def test_preprocesar_texto():
    """Test de preprocesamiento de texto."""
    nlp = NLPService()

    texto = "¡Hola! ¿Cómo estás? http://ejemplo.com"
    procesado, tokens = nlp.preprocesar_texto(texto)

    assert "http" not in procesado
    assert "¡" not in procesado
    assert len(tokens) > 0


def test_analizar_sentimiento():
    """Test de análisis de sentimiento."""
    nlp = NLPService()

    texto_positivo = "Estoy muy feliz y contento"
    sentimiento = nlp.analizar_sentimiento(texto_positivo)

    assert sentimiento in ["POS", "NEG", "NEU"]
```

### Ejemplo de Test de Integración

`tests/integration/test_notes_router.py`:
```python
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_crear_nota():
    """Test de creación de nota."""
    response = client.post(
        "/notas",
        json={
            "note": "Esta es una nota de prueba",
            "user_id": "test-user-id"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "data" in data
```

### Ejecutar Tests

```bash
# Instalar pytest
pip install pytest pytest-cov

# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=app tests/

# Tests específicos
pytest tests/unit/test_nlp_service.py
```

## 🔍 Debugging

### Agregar Logging

```python
import logging

logger = logging.getLogger(__name__)


class MiServicio:
    def mi_metodo(self, param: str):
        logger.info(f"Ejecutando mi_metodo con param: {param}")

        try:
            # Lógica aquí
            resultado = ...
            logger.debug(f"Resultado: {resultado}")
            return resultado

        except Exception as e:
            logger.error(f"Error en mi_metodo: {e}", exc_info=True)
            raise
```

### Usar Debugger de Python

```python
# Agregar breakpoint
def mi_funcion():
    x = 10
    breakpoint()  # 👈 Pausa aquí
    y = x * 2
    return y
```

### Ver Requests en FastAPI

```python
from fastapi import Request

@router.post("/mi-endpoint")
async def mi_endpoint(request: Request):
    # Ver headers
    print(f"Headers: {request.headers}")

    # Ver body
    body = await request.json()
    print(f"Body: {body}")
```

## 📊 Monitoreo y Métricas

### Health Check Personalizado

`main.py`:
```python
@app.get("/health/detailed")
async def health_check_detailed():
    """Health check detallado."""
    try:
        # Verificar conexión a BD
        supabase = get_supabase_client()
        supabase.table("usuarios").select("id").limit(1).execute()
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "version": settings.api_version,
        "timestamp": datetime.utcnow(),
        "services": {
            "database": db_status,
            "nlp": "healthy"  # Verificar si modelos están cargados
        }
    }
```

## 🚨 Manejo de Errores

### Error Handler Global

`main.py`:
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Maneja excepciones no capturadas."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "message": "Error interno del servidor",
            "detail": str(exc) if settings.debug else "Error procesando solicitud"
        }
    )
```

### Errores Personalizados

```python
class MiErrorPersonalizado(HTTPException):
    def __init__(self, detalle: str):
        super().__init__(
            status_code=400,
            detail=f"Error personalizado: {detalle}"
        )


# Uso
if not condicion:
    raise MiErrorPersonalizado("Condición no cumplida")
```

## 📝 Mejores Prácticas

### 1. Siempre Usar Type Hints

```python
# ❌ Mal
def mi_funcion(param):
    return param * 2

# ✅ Bien
def mi_funcion(param: int) -> int:
    return param * 2
```

### 2. Siempre Documentar

```python
def mi_funcion(param: str) -> dict:
    """
    Descripción breve.

    Descripción detallada de qué hace la función.

    Args:
        param: Descripción del parámetro

    Returns:
        Dict con el resultado

    Raises:
        HTTPException: Si ocurre un error

    Example:
        >>> mi_funcion("test")
        {"result": "..."}
    """
    ...
```

### 3. Validar Inputs

```python
# Usar Pydantic para validación automática
class MiRequest(BaseModel):
    email: EmailStr  # Valida formato de email
    edad: int = Field(..., ge=0, le=120)  # Entre 0 y 120
    nombre: str = Field(..., min_length=1, max_length=100)
```

### 4. Manejar Errores Apropiadamente

```python
try:
    resultado = operacion_peligrosa()
except ValueError as e:
    # Error específico
    raise HTTPException(status_code=400, detail=str(e))
except Exception as e:
    # Error genérico
    logger.error(f"Error inesperado: {e}")
    raise HTTPException(status_code=500, detail="Error interno")
```

### 5. No Hardcodear Valores

```python
# ❌ Mal
api_key = "mi-clave-secreta"

# ✅ Bien
settings = get_settings()
api_key = settings.mi_api_key
```

## 🔐 Seguridad

### Validar Roles

```python
def verificar_rol_admin(user_id: str):
    """Verifica que el usuario sea administrador."""
    supabase = get_supabase_client()
    user = supabase.table("usuarios")\
        .select("rol")\
        .eq("id", user_id)\
        .single()\
        .execute()

    if user.data.get("rol") != "administrador":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado: se requiere rol de administrador"
        )


@router.delete("/usuarios/{user_id}")
async def eliminar_usuario(
    user_id: str,
    admin_id: str = Query(...)
):
    verificar_rol_admin(admin_id)
    # Proceder con eliminación...
```

### Sanitizar Inputs

```python
import bleach

def sanitizar_html(texto: str) -> str:
    """Elimina HTML peligroso."""
    return bleach.clean(
        texto,
        tags=[],  # No permitir tags
        strip=True
    )
```

## 📦 Deployment

### Usando Docker

`Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Variables de Entorno en Producción

```bash
# NUNCA usar DEBUG=True en producción
DEBUG=False

# Usar secretos seguros
SUPABASE_KEY=<secret-from-env-vault>
GMAIL_SMTP_PASSWORD=<secret-from-env-vault>
```

---

**Próximos Pasos:**
1. Leer [README.md](README.md) para visión general
2. Revisar [BACKEND_SPECS.md](BACKEND_SPECS.md) para especificaciones técnicas
3. Ver [ARQUITECTURA_VISUAL.md](ARQUITECTURA_VISUAL.md) para diagramas
4. Consultar [REFACTORIZACION_RESUMEN.md](REFACTORIZACION_RESUMEN.md) para ver cambios realizados

**¿Dudas?** Revisar la documentación interactiva en http://localhost:8000/docs
