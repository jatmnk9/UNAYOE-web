# Refactorización MVC - Backend UNAYOE

## 📋 Resumen de Cambios

Este documento describe la refactorización del backend a una arquitectura MVC limpia con separación de responsabilidades y variables de entorno.

## 🏗️ Nueva Estructura

```
backend/
├── app/
│   ├── __init__.py
│   ├── config/
│   │   ├── __init__.py
│   │   └── settings.py          # Configuración centralizada
│   ├── db/
│   │   ├── __init__.py
│   │   └── supabase_client.py   # Cliente Supabase singleton
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py           # Modelos Pydantic
│   ├── services/
│   │   ├── __init__.py
│   │   ├── text_analysis_service.py    # Análisis de texto NLP
│   │   ├── alert_service.py            # Detección de alertas
│   │   ├── email_service.py            # Envío de emails
│   │   ├── gemini_service.py           # Integración Gemini AI
│   │   ├── face_recognition_service.py # Reconocimiento facial
│   │   └── visualization_service.py    # Gráficos y visualizaciones
│   └── routers/                # (Por crear) Endpoints organizados
├── backend.py                  # Archivo principal FastAPI
└── .env                        # Variables de entorno (NO COMMIT)
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Supabase Configuration
SUPABASE_URL=https://xygadfvudziwnddcicbb.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key_aqui

# Gemini AI Configuration
GEMINI_API_KEY=tu_gemini_api_key_aqui
GEMINI_MODEL=gemini-2.5-flash
GEMINI_ACCOMPANIMENT_MODEL=gemini-2.0-flash

# Email Configuration (Gmail SMTP)
GMAIL_SENDER=unayoesupabase@gmail.com
GMAIL_SMTP_PASSWORD=tu_password_aqui
ALERT_FALLBACK_EMAIL=fallback@example.com

# Gmail API Configuration (Optional)
GMAIL_SERVICE_ACCOUNT_JSON=
GMAIL_DELEGATED_USER=

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Environment
ENVIRONMENT=development
```

**⚠️ IMPORTANTE:** 
- NUNCA comitees el archivo `.env` al repositorio
- Usa `.env.example` como plantilla (sin valores reales)
- En producción, usa variables de entorno del sistema o servicios de secrets

## 📦 Dependencias Adicionales

Necesitas instalar `python-dotenv` para cargar variables de entorno:

```bash
pip install python-dotenv
```

## 🔄 Migración de Variables Hardcodeadas

### Antes (backend.py):
```python
url = "https://xygadfvudziwnddcicbb.supabase.co"
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
api_key = "AIzaSyBx_X4hSpLg5yzXZujgrShUIv6P1OSFLME"
sender = "unayoesupabase@gmail.com"
smtp_pass = "mqerkifvvylbdoye"
```

### Después (usando settings):
```python
from app.config.settings import settings

# Acceder a variables
supabase_url = settings.SUPABASE_URL
api_key = settings.GEMINI_API_KEY
```

## 🚀 Próximos Pasos

1. **Completar routers**: Organizar endpoints en módulos separados
2. **Refactorizar backend.py**: Usar los nuevos servicios y routers
3. **Testing**: Verificar que toda la funcionalidad sigue funcionando
4. **Documentación**: Actualizar documentación de la API

## ✅ Beneficios de la Nueva Arquitectura

- ✅ **Separación de responsabilidades**: Cada módulo tiene una función clara
- ✅ **Seguridad mejorada**: Credenciales fuera del código
- ✅ **Mantenibilidad**: Código más organizado y fácil de mantener
- ✅ **Testeable**: Servicios pueden probarse independientemente
- ✅ **Escalable**: Fácil agregar nuevas funcionalidades
- ✅ **Clean Code**: Sigue buenas prácticas de desarrollo

