# Guía de Migración - Backend Refactorizado

## 🎯 Objetivo

Migrar de un archivo monolítico (`backend.py`) a una arquitectura MVC limpia y organizada.

## 📝 Pasos de Migración

### 1. Instalar Dependencias

```bash
pip install python-dotenv
```

### 2. Configurar Variables de Entorno

1. Copia `ENV_EXAMPLE.txt` a `.env`:
   ```bash
   cp ENV_EXAMPLE.txt .env
   ```

2. Completa el archivo `.env` con tus credenciales reales (las que estaban hardcodeadas en `backend.py`)

### 3. Actualizar Importaciones en backend.py

#### Antes:
```python
from supabase import create_client, Client
url = "https://xygadfvudziwnddcicbb.supabase.co"
service_key = "eyJhbGciOi..."
supabase: Client = create_client(url, service_key)
```

#### Después:
```python
from app.db.supabase_client import supabase
# Ya está inicializado y listo para usar
```

### 4. Usar Servicios en lugar de Funciones Globales

#### Ejemplo: Análisis de Texto

**Antes:**
```python
def preprocesar_texto(texto):
    # código aquí...
    
texto_procesado, tokens = preprocesar_texto(nota_texto)
```

**Después:**
```python
from app.services.text_analysis_service import TextAnalysisService

texto_procesado, tokens = TextAnalysisService.preprocess_text(nota_texto)
analysis = TextAnalysisService.analyze_diary_complete(df)
```

#### Ejemplo: Envío de Emails

**Antes:**
```python
sender = "unayoesupabase@gmail.com"
smtp_pass = "mqerkifvvylbdoye"
send_email_via_smtp(sender, smtp_pass, to_email, subject, body)
```

**Después:**
```python
from app.services.email_service import EmailService

EmailService.send_alert_email(to_email, subject, body)
```

#### Ejemplo: Gemini AI

**Antes:**
```python
api_key = "AIzaSyBx_X4hSpLg5yzXZujgrShUIv6P1OSFLME"
genai.configure(api_key=api_key)
```

**Después:**
```python
from app.services.gemini_service import GeminiService

accompaniment = GeminiService.generate_accompaniment(texto)
insight = GeminiService.generate_insight(texts)
```

### 5. Usar Modelos de app/models/

**Antes:**
```python
class Estudiante(BaseModel):
    # definición aquí...
```

**Después:**
```python
from app.models.schemas import Estudiante, Psicologo, Note, LoginRequest
# Ya están definidos
```

## 🔄 Migración Gradual

Puedes migrar gradualmente:

1. **Fase 1**: Configurar `.env` y usar `app.config.settings`
2. **Fase 2**: Reemplazar funciones globales por servicios
3. **Fase 3**: Mover endpoints a routers separados (opcional)

## ✅ Checklist de Migración

- [ ] Instalar `python-dotenv`
- [ ] Crear archivo `.env` con credenciales
- [ ] Actualizar importaciones de Supabase
- [ ] Reemplazar funciones de análisis de texto
- [ ] Reemplazar funciones de email
- [ ] Reemplazar llamadas a Gemini
- [ ] Reemplazar funciones de reconocimiento facial
- [ ] Actualizar modelos Pydantic
- [ ] Probar todos los endpoints
- [ ] Verificar que no haya variables hardcodeadas

## 🚨 Notas Importantes

1. **Backward Compatibility**: El código nuevo tiene fallbacks para mantener compatibilidad durante la migración
2. **Variables de Entorno**: Todas las credenciales deben estar en `.env`, nunca en el código
3. **Testing**: Verifica cada endpoint después de migrar
4. **Git**: Asegúrate de que `.env` esté en `.gitignore`

## 📚 Estructura de Servicios Disponibles

- `TextAnalysisService`: Análisis de texto y NLP
- `AlertService`: Detección de alertas y riesgo
- `EmailService`: Envío de emails
- `GeminiService`: Integración con Gemini AI
- `FaceRecognitionService`: Reconocimiento facial
- `VisualizationService`: Creación de gráficos

## 🔍 Ejemplo Completo de Migración

Ver `EXAMPLES_MIGRATION.md` para ejemplos completos de migración de endpoints.

