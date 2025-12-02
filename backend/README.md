# 🧠 Backend UNAYOE - Sistema de Análisis de Bienestar Estudiantil

Sistema backend refactorizado con arquitectura MVC, patrones de diseño y buenas prácticas de programación.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Documentación API](#documentación-api)
- [Patrones de Diseño](#patrones-de-diseño)
- [Tecnologías](#tecnologías)

## ✨ Características

- ✅ **Arquitectura MVC** completa y bien organizada
- ✅ **Patrones de Diseño**: Singleton, Factory, Dependency Injection
- ✅ **Análisis NLP** con modelos optimizados para español
- ✅ **Sistema de Alertas** automático por email
- ✅ **Recomendaciones Personalizadas** basadas en IA
- ✅ **Gestión de Citas** médicas
- ✅ **Visualizaciones** de datos emocionales
- ✅ **Código Limpio** con documentación completa

## 🏗️ Arquitectura

El proyecto sigue el patrón **MVC (Model-View-Controller)** adaptado para FastAPI:

```
┌─────────────────────────────────────────┐
│           FastAPI Router                │
│         (Controllers/Views)             │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Service Layer                   │
│       (Business Logic)                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     Supabase Client (Database)          │
│         PostgreSQL                      │
└─────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
backend/
├── .env                        # Variables de entorno (NO COMMITEAR)
├── .env.example                # Ejemplo de variables de entorno
├── .gitignore                  # Archivos ignorados por Git
├── requirements.txt            # Dependencias Python
├── main.py                     # Punto de entrada de la aplicación
├── README.md                   # Este archivo
│
├── app/
│   ├── __init__.py
│   │
│   ├── config/                 # Configuración
│   │   ├── __init__.py
│   │   └── settings.py         # Configuración centralizada (Singleton)
│   │
│   ├── db/                     # Base de datos
│   │   ├── __init__.py
│   │   └── supabase.py         # Cliente de Supabase (Singleton)
│   │
│   ├── models/                 # Modelos Pydantic
│   │   ├── __init__.py
│   │   └── schemas.py          # Esquemas de validación
│   │
│   ├── routers/                # Endpoints (Controllers)
│   │   ├── __init__.py
│   │   ├── auth.py             # Autenticación
│   │   ├── users.py            # Usuarios
│   │   ├── notes.py            # Notas del diario
│   │   ├── analysis.py         # Análisis de notas
│   │   ├── recommendations.py  # Recomendaciones
│   │   └── appointments.py     # Citas médicas
│   │
│   └── services/               # Lógica de negocio (Services)
│       ├── __init__.py
│       ├── auth_service.py     # Servicio de autenticación
│       ├── users_service.py    # Servicio de usuarios
│       ├── notes_service.py    # Servicio de notas
│       ├── nlp_service.py      # Procesamiento NLP (Singleton)
│       ├── analysis_service.py # Servicio de análisis
│       ├── recommendations_service.py  # Sistema de recomendaciones
│       ├── appointments_service.py     # Gestión de citas
│       └── alert_service.py    # Alertas y emails
│
└── .venv/                      # Entorno virtual (NO COMMITEAR)
```

## 🚀 Instalación

### 1. Requisitos Previos

- Python 3.10+
- Git
- Cuenta de Supabase

### 2. Clonar el Repositorio

```bash
git clone <repository-url>
cd backend
```

### 3. Crear Entorno Virtual

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

### 4. Instalar Dependencias

```bash
pip install -r requirements.txt
```

## ⚙️ Configuración

### 1. Crear Archivo `.env`

Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Configurar Variables de Entorno

Editar `.env` con tus credenciales:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Email (opcional)
GMAIL_SENDER=tu-email@gmail.com
GMAIL_SMTP_PASSWORD=tu-app-password

# Gemini AI (opcional)
GEMINI_API_KEY=tu-api-key
```

### 3. Configurar Base de Datos

Ejecutar los scripts SQL en Supabase (ver `BACKEND_SPECS.md`).

## 🏃 Ejecución

### Modo Desarrollo

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

O simplemente:

```bash
python main.py
```

### Modo Producción

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📖 Documentación API

Una vez iniciado el servidor, acceder a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🎯 Patrones de Diseño

### 1. Singleton Pattern

Usado en:
- `Settings` (configuración)
- `Supabase Client` (conexión a BD)
- `NLPService` (modelos NLP)

```python
@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

### 2. Factory Pattern

Usado en todos los servicios:

```python
def get_auth_service() -> AuthService:
    return AuthService()
```

### 3. Dependency Injection

FastAPI gestiona las dependencias automáticamente:

```python
@router.post("/login")
async def login(
    credentials: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.login(credentials)
```

### 4. Repository Pattern

Los servicios encapsulan el acceso a datos:

```python
class NotesService:
    def __init__(self):
        self.supabase = get_supabase_client()

    def obtener_notas_por_usuario(self, user_id: str):
        return self.supabase.table("notas")...
```

## 🛠️ Tecnologías

### Framework & Server
- **FastAPI** 0.115.0 - Framework web moderno
- **Uvicorn** 0.32.0 - Servidor ASGI

### Validación
- **Pydantic** 2.9.2 - Validación de datos
- **Pydantic Settings** 2.6.0 - Gestión de configuración

### Base de Datos
- **Supabase** 2.9.0 - Backend as a Service
- **PostgreSQL** - Base de datos relacional

### NLP & ML
- **Transformers** 4.46.0 - Modelos de lenguaje
- **PyTorch** 2.0.0+ - Framework de ML
- **NLTK** 3.9.1 - Procesamiento de lenguaje natural
- **Scikit-learn** 1.5.2 - Machine Learning

### Visualización
- **Matplotlib** 3.9.2 - Gráficos
- **WordCloud** 1.9.0+ - Nubes de palabras
- **Pandas** 2.2.3 - Análisis de datos

### Otros
- **Google Gemini AI** - Generación de texto
- **Python-dotenv** 1.0.1 - Variables de entorno

## 📝 Buenas Prácticas Implementadas

1. ✅ **Separación de responsabilidades** (MVC)
2. ✅ **Dependency Injection** para testing
3. ✅ **Type Hints** en todo el código
4. ✅ **Docstrings** en funciones y clases
5. ✅ **Manejo centralizado de errores**
6. ✅ **Validación de datos con Pydantic**
7. ✅ **Configuración centralizada**
8. ✅ **Logging apropiado**
9. ✅ **Código DRY** (Don't Repeat Yourself)
10. ✅ **SOLID Principles**

## 🔒 Seguridad

- ✅ Variables de entorno para secretos
- ✅ Service Role Key solo en backend
- ✅ Validación de roles en endpoints
- ✅ CORS configurado
- ✅ Sanitización de inputs
- ✅ `.gitignore` configurado correctamente

## 📊 Endpoints Principales

### Autenticación
- `POST /login` - Inicio de sesión

### Usuarios
- `POST /usuarios/estudiantes` - Crear estudiante
- `POST /usuarios/psicologos` - Crear psicólogo
- `GET /usuarios/psychologist/students` - Listar estudiantes

### Notas
- `GET /notas/{user_id}` - Obtener notas
- `POST /notas` - Crear nota (con análisis NLP)

### Análisis
- `GET /analyze/{user_id}` - Analizar notas de usuario
- `GET /export/{user_id}` - Exportar reporte CSV

### Recomendaciones
- `GET /recomendaciones/{user_id}` - Recomendaciones personalizadas
- `POST /likes/{user_id}/{recomendacion_id}` - Dar like

### Citas
- `POST /citas` - Crear cita
- `GET /citas/usuario/{id_usuario}` - Citas del usuario
- `PUT /citas/{id_cita}/asignar-psicologo` - Asignar psicólogo

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte del sistema UNAYOE.

## 👥 Autores

Sistema UNAYOE - Análisis de Bienestar Estudiantil

---

**Versión**: 2.0.0
**Fecha**: Diciembre 2025
**Python**: 3.10+
**FastAPI**: 0.115.0
