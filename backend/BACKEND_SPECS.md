# 📘 Especificaciones Completas del Backend UNAYOE

## 📋 Tabla de Contenidos
- [Información General](#información-general)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Tecnologías y Dependencias](#tecnologías-y-dependencias)
- [Configuración del Entorno](#configuración-del-entorno)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Modelos de Datos](#modelos-de-datos)
- [Endpoints de la API](#endpoints-de-la-api)
- [Servicios del Backend](#servicios-del-backend)
- [Base de Datos](#base-de-datos)
- [Instrucciones de Migración](#instrucciones-de-migración)

---

## Información General

### Descripción
Sistema backend para análisis de bienestar estudiantil con procesamiento de lenguaje natural, detección de emociones y sistema de recomendaciones personalizadas.

### Versión
2.0.0

### Framework Principal
FastAPI 0.115.0

### Python Version
Python 3.10+

---

## Estructura del Proyecto

```
backend/
├── .env                          # Variables de entorno (NO COMMITEAR)
├── .env.example                  # Ejemplo de variables de entorno
├── requirements.txt              # Dependencias Python
├── main.py                       # Punto de entrada de la aplicación
├── backend.py                    # Archivo legacy (NO USAR)
├── ARQUITECTURA_SISTEMA.md       # Documentación de arquitectura
├── BACKEND_SPECS.md              # Este archivo
│
├── app/
│   ├── __init__.py
│   │
│   ├── config/                   # Configuraciones
│   │   ├── __init__.py
│   │   └── settings.py           # Configuración centralizada
│   │
│   ├── db/                       # Base de datos
│   │   ├── __init__.py
│   │   └── supabase.py           # Cliente de Supabase
│   │
│   ├── models/                   # Modelos Pydantic
│   │   ├── __init__.py
│   │   └── schemas.py            # Todos los esquemas de datos
│   │
│   ├── routers/                  # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── auth.py               # Autenticación
│   │   ├── users.py              # Usuarios (estudiantes, psicólogos)
│   │   ├── notes.py              # Notas del diario
│   │   ├── analysis.py           # Análisis de notas
│   │   ├── recommendations.py    # Recomendaciones y likes
│   │   └── appointments.py       # Citas médicas
│   │
│   └── services/                 # Lógica de negocio
│       ├── __init__.py
│       ├── auth_service.py       # Servicio de autenticación
│       ├── users_service.py      # Servicio de usuarios
│       ├── notes_service.py      # Servicio de notas
│       ├── nlp_service.py        # Procesamiento NLP
│       ├── analysis_service.py   # Análisis y visualizaciones
│       ├── recommendations_service.py  # Sistema de recomendaciones
│       └── appointments_service.py     # Gestión de citas
│
└── .venv/                        # Entorno virtual (NO COMMITEAR)
```

---

## Tecnologías y Dependencias

### Framework y Servidor
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
python-multipart==0.0.12
```

### Validación de Datos
```
pydantic==2.9.2
pydantic-settings==2.6.0
```

### Base de Datos
```
supabase==2.9.0
```

### NLP & Machine Learning
```
transformers==4.46.0
torch>=2.0.0
nltk==3.9.1
scikit-learn==1.5.2
```

### Procesamiento de Datos
```
pandas==2.2.3
numpy==2.1.2
```

### Visualización
```
matplotlib==3.9.2
wordcloud>=1.9.0
```

### HTTP & Networking
```
httpx==0.27.2
email-validator
```

### Desarrollo
```
python-dotenv==1.0.1
```

---

## Configuración del Entorno

### Archivo `.env`

**IMPORTANTE**: Este archivo contiene información sensible y NO debe ser commiteado a Git.

```env
# =========================================================
# CONFIGURACIÓN DE LA APLICACIÓN
# =========================================================
APP_NAME="API de Análisis de Bienestar"
DEBUG=True

# =========================================================
# CONFIGURACIÓN DE SUPABASE
# =========================================================
SUPABASE_URL=https://xygadfvudziwnddcicbb.supabase.co
SUPABASE_KEY=<SERVICE_ROLE_KEY>

# =========================================================
# CONFIGURACIÓN DE CORS
# =========================================================
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# =========================================================
# CONFIGURACIÓN DE MODELOS NLP
# =========================================================
SENTIMENT_MODEL=pysentimiento/robertuito-sentiment-analysis
EMOTION_MODEL=pysentimiento/robertuito-emotion-analysis
FALLBACK_MODEL=dccuchile/bert-base-spanish-wwm-cased
```

### Configuración de Settings (`app/config/settings.py`)

```python
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union

class Settings(BaseSettings):
    # API Configuration
    app_name: str = "API de Análisis de Bienestar"
    debug: bool = True

    # Supabase Configuration
    supabase_url: str
    supabase_key: str

    # CORS Configuration
    cors_origins: Union[str, List[str]]

    # NLP Model Configuration
    sentiment_model: str = "pysentimiento/robertuito-sentiment-analysis"
    emotion_model: str = "pysentimiento/robertuito-emotion-analysis"
    fallback_model: str = "dccuchile/bert-base-spanish-wwm-cased"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"
```

---

## Arquitectura del Sistema

### Patrón de Diseño
- **Arquitectura en Capas**: Router → Service → Database
- **Singleton**: Servicios y cliente de Supabase
- **Dependency Injection**: Uso de instancias únicas de servicios

### Flujo de Datos
```
Cliente HTTP
    ↓
FastAPI Router (app/routers/)
    ↓
Service Layer (app/services/)
    ↓
Database Client (Supabase)
    ↓
PostgreSQL Database
```

### Componentes Principales

1. **Routers**: Definen endpoints y validación de entrada
2. **Services**: Contienen la lógica de negocio
3. **Models/Schemas**: Validan datos con Pydantic
4. **Database**: Cliente de Supabase para interactuar con PostgreSQL

---

## Modelos de Datos

### Usuarios

#### EstudianteCreate
```python
{
    "nombre": str,
    "apellido": str,
    "codigo_alumno": str,
    "dni": str,
    "edad": int,
    "genero": str,
    "celular": str,
    "facultad": str,
    "escuela": str,
    "direccion": str,
    "ciclo": str,
    "tipo_paciente": str,
    "correo_institucional": EmailStr,
    "universidad": str,
    "psicologo_id": Optional[str]
}
```

#### PsicologoCreate
```python
{
    "nombre": str,
    "apellido": str,
    "dni": str,
    "edad": int,
    "genero": str,
    "celular": str,
    "especialidad": str,
    "correo_institucional": EmailStr
}
```

### Autenticación

#### LoginRequest
```python
{
    "email": EmailStr,
    "password": str
}
```

#### UserResponse
```python
{
    "id": str,
    "email": str,
    "rol": str,
    "nombre": str,
    "access_token": str,
    "refresh_token": str
}
```

### Notas

#### Note
```python
{
    "note": str,  # min_length=1
    "user_id": str
}
```

#### NoteResponse
```python
{
    "id": str,
    "usuario_id": str,
    "nota": str,
    "sentimiento": str,
    "emocion": str,
    "emocion_score": float,
    "tokens": List[str],
    "created_at": datetime
}
```

### Citas

#### CitaCreate
```python
{
    "titulo": str,  # min_length=1
    "fecha_cita": datetime
}
```

#### CitaUpdate
```python
{
    "titulo": Optional[str],
    "fecha_cita": Optional[datetime]
}
```

#### CitaAsignarPsicologo
```python
{
    "id_psicologo": str
}
```

#### CitaResponse
```python
{
    "id_cita": int,
    "titulo": str,
    "fecha_creacion": datetime,
    "fecha_cita": datetime,
    "id_usuario": str,
    "id_psicologo": Optional[str],
    "nombre_usuario": Optional[str],
    "apellido_usuario": Optional[str],
    "correo_usuario": Optional[str],
    "nombre_psicologo": Optional[str],
    "apellido_psicologo": Optional[str],
    "especialidad_psicologo": Optional[str]
}
```

---

## Endpoints de la API

### 1. Autenticación (`/`)

#### POST `/login`
- **Descripción**: Inicia sesión de un usuario
- **Body**: `LoginRequest`
- **Response**: `UserResponse`
- **Lógica**:
  1. Autentica con Supabase Auth
  2. Obtiene perfil de tabla `usuarios`
  3. Retorna usuario + tokens

---

### 2. Usuarios (`/usuarios`)

#### POST `/usuarios/estudiantes`
- **Descripción**: Crea un nuevo estudiante
- **Body**: `EstudianteCreate`
- **Response**: Mensaje de éxito + datos del estudiante
- **Lógica**:
  1. Crea usuario en Supabase Auth
  2. Inserta perfil en tabla `usuarios` con rol `estudiante`
  3. Retorna ID del usuario creado

#### POST `/usuarios/psicologos`
- **Descripción**: Crea un nuevo psicólogo
- **Body**: `PsicologoCreate`
- **Response**: Mensaje de éxito + datos del psicólogo
- **Lógica**: Similar a estudiantes pero con rol `psicologo`

#### GET `/usuarios/psychologist/students`
- **Descripción**: Obtiene lista de estudiantes
- **Response**: Lista de estudiantes (id, nombre, apellido, codigo_alumno)

---

### 3. Notas (`/notas`)

#### GET `/notas/{user_id}`
- **Descripción**: Obtiene todas las notas de un usuario
- **Params**: `user_id` (string)
- **Response**: Lista de notas ordenadas por `created_at` DESC

#### POST `/notas`
- **Descripción**: Guarda y analiza una nueva nota
- **Body**: `Note`
- **Response**: Nota guardada con análisis NLP
- **Lógica**:
  1. Preprocesa el texto (limpieza, tokenización)
  2. Analiza sentimiento (RoBERTa)
  3. Analiza emoción (BETO)
  4. Guarda en BD con análisis

---

### 4. Análisis (`/`)

#### POST `/analyze`
- **Descripción**: Analiza una lista de notas y genera visualizaciones
- **Body**: `List[Note]`
- **Response**: Imágenes Base64 (sentimientos, emociones, wordcloud)

#### GET `/analyze/{user_id}`
- **Descripción**: Analiza todas las notas de un usuario
- **Params**: `user_id` (string)
- **Response**: Análisis + visualizaciones + notas

#### GET `/export/{user_id}`
- **Descripción**: Exporta reporte en CSV
- **Params**: `user_id` (string)
- **Response**: Archivo CSV con análisis completo

---

### 5. Recomendaciones (`/recomendaciones`)

#### GET `/recomendaciones/todas`
- **Descripción**: Obtiene todas las recomendaciones disponibles
- **Response**: Lista de todas las recomendaciones

#### GET `/recomendaciones/{user_id}`
- **Descripción**: Genera recomendaciones personalizadas
- **Params**: `user_id` (string)
- **Response**: Recomendaciones filtradas por emoción/sentimiento
- **Lógica**:
  1. Obtiene últimas 5 emociones de notas del usuario
  2. Obtiene emociones de los likes del usuario
  3. Calcula emoción y sentimiento principal
  4. Filtra recomendaciones por coincidencia

#### GET `/recomendaciones/favoritos/{user_id}`
- **Descripción**: Obtiene recomendaciones favoritas del usuario
- **Params**: `user_id` (string)
- **Response**: Lista de recomendaciones marcadas como favoritas

---

### 6. Likes (`/likes`)

#### POST `/likes/{user_id}/{recomendacion_id}`
- **Descripción**: Agrega un like a una recomendación
- **Params**: `user_id`, `recomendacion_id`
- **Response**: Mensaje de confirmación

#### DELETE `/likes/{user_id}/{recomendacion_id}`
- **Descripción**: Elimina un like
- **Params**: `user_id`, `recomendacion_id`
- **Response**: Mensaje de confirmación

#### GET `/likes/{user_id}`
- **Descripción**: Obtiene IDs de recomendaciones con like
- **Params**: `user_id` (string)
- **Response**: Lista de IDs

---

### 7. Citas (`/citas`)

#### POST `/citas`
- **Descripción**: Crea una nueva cita
- **Body**: `CitaCreate`
- **Query Param**: `id_usuario` (string)
- **Response**: Cita creada
- **Validación**: Solo estudiantes pueden crear citas

#### GET `/citas/pendientes`
- **Descripción**: Obtiene citas sin psicólogo asignado
- **Response**: Lista de citas pendientes con info del estudiante
- **Uso**: Administrador

#### GET `/citas/todas`
- **Descripción**: Obtiene todas las citas del sistema
- **Response**: Lista completa de citas
- **Uso**: Administrador

#### GET `/citas/usuario/{id_usuario}`
- **Descripción**: Obtiene citas de un usuario específico
- **Params**: `id_usuario` (string)
- **Response**:
  - Estudiante: citas creadas
  - Psicólogo: citas asignadas

#### GET `/citas/{id_cita}`
- **Descripción**: Obtiene una cita por ID
- **Params**: `id_cita` (int)
- **Response**: Información completa de la cita

#### PUT `/citas/{id_cita}/asignar-psicologo`
- **Descripción**: Asigna un psicólogo a una cita
- **Params**: `id_cita` (int)
- **Body**: `CitaAsignarPsicologo`
- **Response**: Cita actualizada
- **Validación**: El psicólogo debe tener rol `psicologo`

#### PUT `/citas/{id_cita}`
- **Descripción**: Actualiza una cita
- **Params**: `id_cita` (int)
- **Body**: `CitaUpdate`
- **Query Param**: `id_usuario` (string)
- **Response**: Cita actualizada
- **Validación**: Solo el creador puede actualizar

#### DELETE `/citas/{id_cita}`
- **Descripción**: Elimina una cita
- **Params**: `id_cita` (int)
- **Query Param**: `id_usuario` (string)
- **Response**: Mensaje de confirmación
- **Validación**: Solo el creador puede eliminar

#### GET `/citas/psicologos/disponibles`
- **Descripción**: Obtiene lista de psicólogos disponibles
- **Response**: Lista de psicólogos (id, nombre, apellido, especialidad)

---

## Servicios del Backend

### 1. AuthService (`auth_service.py`)

**Responsabilidad**: Autenticación de usuarios

**Métodos**:
- `login(email, password)`: Autentica usuario y retorna perfil + tokens

**Uso del Cliente Supabase**:
- `supabase.auth.sign_in_with_password()`
- `supabase.table("usuarios").select().eq("id", user_id)`

---

### 2. UsersService (`users_service.py`)

**Responsabilidad**: Gestión de usuarios

**Métodos**:
- `crear_estudiante(estudiante)`: Crea usuario en Auth y perfil en BD
- `crear_psicologo(psicologo)`: Crea psicólogo en Auth y perfil en BD
- `obtener_estudiantes()`: Lista todos los estudiantes

**Lógica de Creación**:
1. `supabase.auth.sign_up()` con email y DNI como password
2. Obtiene `user_id` del Auth
3. Inserta en tabla `usuarios` con el `user_id` y rol correspondiente

---

### 3. NotesService (`notes_service.py`)

**Responsabilidad**: Gestión de notas del diario

**Métodos**:
- `obtener_notas_por_usuario(user_id)`: Obtiene notas ordenadas por fecha
- `guardar_nota(nota_texto, user_id)`: Analiza y guarda nota
- `analizar_notas_usuario(user_id)`: Genera análisis completo
- `exportar_reporte_usuario(user_id)`: Exporta CSV

**Integración con NLP**:
- Usa `nlp_service.preprocesar_texto()`
- Usa `nlp_service.analizar_sentimiento()`
- Usa `nlp_service.analizar_emocion()`

---

### 4. NLPService (`nlp_service.py`)

**Responsabilidad**: Procesamiento de lenguaje natural

**Modelos Cargados** (Singleton):
- `sentiment_classifier`: RoBERTa para sentimientos (POS/NEG/NEU)
- `emotion_classifier`: BETO para emociones (joy, sadness, anger, fear, surprise)

**Métodos**:
- `preprocesar_texto(texto)`: Limpia, tokeniza, elimina stopwords
- `analizar_sentimiento(texto)`: Retorna label del sentimiento
- `analizar_emocion(texto)`: Retorna (label, score) de la emoción

**Recursos NLTK**:
- Stopwords en español
- Tokenizador `punkt`

---

### 5. AnalysisService (`analysis_service.py`)

**Responsabilidad**: Análisis y visualización de datos

**Métodos**:
- `analizar_nota(nota)`: Analiza una nota individual
- `analizar_multiples_notas(notas)`: Analiza lista de notas
- `crear_grafico_sentimientos(df)`: Genera gráfico de barras
- `crear_grafico_emociones(df)`: Genera gráfico de barras
- `crear_nube_palabras(df)`: Genera WordCloud
- `crear_visualizaciones(df)`: Crea todas las visualizaciones

**Formato de Salida**: Imágenes en Base64 (PNG)

**Librerías**:
- Matplotlib para gráficos
- WordCloud para nube de palabras
- Pandas para procesamiento de datos

---

### 6. RecommendationsService (`recommendations_service.py`)

**Responsabilidad**: Sistema de recomendaciones

**Métodos**:
- `obtener_todas_recomendaciones()`: Lista todas las recomendaciones
- `obtener_recomendaciones_personalizadas(user_id)`: Filtra por emoción/sentimiento
- `obtener_favoritos_usuario(user_id)`: Obtiene favoritos
- `agregar_like(user_id, recomendacion_id)`: Agrega like
- `eliminar_like(user_id, recomendacion_id)`: Elimina like
- `obtener_likes_usuario(user_id)`: Obtiene IDs de likes

**Algoritmo de Personalización**:
1. Obtiene últimas 5 notas del usuario
2. Obtiene emociones de los likes previos
3. Combina ambas fuentes
4. Calcula emoción y sentimiento más frecuentes (moda)
5. Filtra recomendaciones por coincidencia

---

### 7. AppointmentsService (`appointments_service.py`)

**Responsabilidad**: Gestión de citas médicas

**Métodos**:
- `crear_cita(cita_data, id_usuario)`: Crea nueva cita
- `obtener_citas_pendientes()`: Citas sin psicólogo
- `obtener_todas_las_citas()`: Todas las citas
- `obtener_citas_usuario(id_usuario)`: Citas por usuario (según rol)
- `obtener_cita_por_id(id_cita)`: Detalles de una cita
- `asignar_psicologo(id_cita, asignacion)`: Asigna psicólogo
- `actualizar_cita(id_cita, cita_update, id_usuario)`: Actualiza cita
- `eliminar_cita(id_cita, id_usuario)`: Elimina cita
- `obtener_psicologos_disponibles()`: Lista psicólogos

**Validaciones**:
- Solo estudiantes pueden crear citas
- Solo el creador puede actualizar/eliminar su cita
- Solo psicólogos pueden ser asignados a citas

---

## Base de Datos

### Proveedor
Supabase (PostgreSQL)

### Tablas Principales

#### 1. `usuarios`
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    nombre VARCHAR,
    apellido VARCHAR,
    dni VARCHAR UNIQUE,
    edad INT,
    genero VARCHAR,
    celular VARCHAR,
    correo_institucional VARCHAR UNIQUE,
    rol VARCHAR CHECK (rol IN ('estudiante', 'psicologo', 'administrador')),

    -- Campos específicos de estudiantes
    codigo_alumno VARCHAR,
    facultad VARCHAR,
    escuela VARCHAR,
    direccion VARCHAR,
    ciclo VARCHAR,
    tipo_paciente VARCHAR,
    universidad VARCHAR,
    psicologo_id UUID REFERENCES usuarios(id),

    -- Campos específicos de psicólogos
    especialidad VARCHAR,

    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `notas`
```sql
CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    nota TEXT NOT NULL,
    sentimiento VARCHAR,
    emocion VARCHAR,
    emocion_score FLOAT,
    tokens JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `recomendaciones`
```sql
CREATE TABLE recomendaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR,
    emocion_objetivo VARCHAR,
    sentimiento_objetivo VARCHAR,
    contenido TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `likes_recomendaciones`
```sql
CREATE TABLE likes_recomendaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    recomendacion_id UUID REFERENCES recomendaciones(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recomendacion_id)
);
```

#### 5. `citas`
```sql
CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_cita TIMESTAMP NOT NULL,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    id_psicologo UUID REFERENCES usuarios(id) ON DELETE SET NULL
);
```

---

## Instrucciones de Migración

### 1. Clonar el Repositorio en Nueva Rama

```bash
git checkout -b nueva-rama
```

### 2. Instalar Dependencias

```bash
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

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz de `backend/`:

```env
APP_NAME="API de Análisis de Bienestar"
DEBUG=True

SUPABASE_URL=<TU_SUPABASE_URL>
SUPABASE_KEY=<TU_SERVICE_ROLE_KEY>

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

SENTIMENT_MODEL=pysentimiento/robertuito-sentiment-analysis
EMOTION_MODEL=pysentimiento/robertuito-emotion-analysis
FALLBACK_MODEL=dccuchile/bert-base-spanish-wwm-cased
```

### 4. Configurar Base de Datos en Supabase

#### A. Crear Tablas

Ejecutar los siguientes scripts SQL en Supabase:

**Tabla `usuarios`:**
```sql
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    apellido VARCHAR NOT NULL,
    dni VARCHAR UNIQUE NOT NULL,
    edad INT,
    genero VARCHAR,
    celular VARCHAR,
    correo_institucional VARCHAR UNIQUE NOT NULL,
    rol VARCHAR CHECK (rol IN ('estudiante', 'psicologo', 'administrador')) NOT NULL,
    codigo_alumno VARCHAR,
    facultad VARCHAR,
    escuela VARCHAR,
    direccion VARCHAR,
    ciclo VARCHAR,
    tipo_paciente VARCHAR,
    universidad VARCHAR,
    psicologo_id UUID REFERENCES usuarios(id),
    especialidad VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabla `notas`:**
```sql
CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
    nota TEXT NOT NULL,
    sentimiento VARCHAR,
    emocion VARCHAR,
    emocion_score FLOAT,
    tokens JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notas_usuario_id ON notas(usuario_id);
CREATE INDEX idx_notas_created_at ON notas(created_at);
```

**Tabla `recomendaciones`:**
```sql
CREATE TABLE recomendaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR NOT NULL,
    descripcion TEXT,
    tipo VARCHAR,
    emocion_objetivo VARCHAR,
    sentimiento_objetivo VARCHAR,
    contenido TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabla `likes_recomendaciones`:**
```sql
CREATE TABLE likes_recomendaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
    recomendacion_id UUID REFERENCES recomendaciones(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, recomendacion_id)
);

CREATE INDEX idx_likes_user_id ON likes_recomendaciones(user_id);
```

**Tabla `citas`:**
```sql
CREATE TABLE citas (
    id_cita SERIAL PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_cita TIMESTAMP NOT NULL,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE NOT NULL,
    id_psicologo UUID REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE INDEX idx_citas_usuario ON citas(id_usuario);
CREATE INDEX idx_citas_psicologo ON citas(id_psicologo);
CREATE INDEX idx_citas_fecha ON citas(fecha_cita);
```

#### B. Configurar Row Level Security (RLS)

**IMPORTANTE**: Habilitar RLS en todas las tablas:

```sql
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes_recomendaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
```

**Crear políticas** (ajustar según tus necesidades de seguridad):

```sql
-- Política para Service Role (backend)
CREATE POLICY "Service role bypass" ON usuarios FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON notas FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON recomendaciones FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON likes_recomendaciones FOR ALL USING (true);
CREATE POLICY "Service role bypass" ON citas FOR ALL USING (true);
```

### 5. Ejecutar el Servidor

```bash
# Desde la carpeta backend/
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Verificar Funcionamiento

Acceder a:
- Documentación interactiva: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`
- Root: `http://localhost:8000/`

---

## Notas Importantes

### Seguridad

1. **NUNCA commitear `.env`**: Agregar a `.gitignore`
2. **Usar Service Role Key**: Solo en backend, nunca en frontend
3. **Validar roles**: Verificar permisos en cada endpoint crítico
4. **CORS**: Configurar solo orígenes confiables en producción

### Modelos NLP

1. Los modelos se cargan al inicio (singleton)
2. Primera ejecución descarga modelos (puede tardar)
3. Requiere conexión a internet para descargar modelos de Hugging Face
4. Los modelos se guardan en cache local

### Rendimiento

1. **Singleton pattern**: Servicios y cliente de BD se instancian una vez
2. **Índices en BD**: Asegurar índices en campos frecuentemente consultados
3. **Paginación**: Considerar implementar paginación para listas grandes
4. **Cache**: Los modelos NLP se mantienen en memoria

### Errores Comunes

1. **Error de CORS**: Verificar `CORS_ORIGINS` en `.env`
2. **Error de Supabase**: Verificar credenciales en `.env`
3. **Error de modelos**: Verificar conexión a internet y espacio en disco
4. **Error de NLTK**: Los recursos se descargan automáticamente

---

## Contacto y Soporte

Para preguntas sobre la migración, consultar:
- Archivo `ARQUITECTURA_SISTEMA.md`
- Documentación de FastAPI: https://fastapi.tiangolo.com/
- Documentación de Supabase: https://supabase.com/docs

---

**Fecha de Creación**: Diciembre 2, 2025
**Versión del Backend**: 2.0.0
**Autor**: Sistema UNAYOE
