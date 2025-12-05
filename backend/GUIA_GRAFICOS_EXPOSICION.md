# GUÍA DE GRÁFICOS PARA EXPOSICIÓN FINAL - UNAYOE

## Índice
1. [Diagrama de Contexto](#1-diagrama-de-contexto)
2. [Diagrama de Arquitectura](#2-diagrama-de-arquitectura)
3. [Diagrama C4](#3-diagrama-c4)
4. [Herramientas Recomendadas](#4-herramientas-recomendadas)

---

## 1. DIAGRAMA DE CONTEXTO

### Descripción
El diagrama de contexto muestra el sistema UNAYOE y cómo interactúa con usuarios externos y sistemas externos. Es una vista de alto nivel que no entra en detalles técnicos.

### Elementos a Incluir

#### Sistema Principal
- **UNAYOE** (Sistema de Salud Mental Estudiantil)

#### Actores Externos (Usuarios)
1. **Estudiante**
   - Registra notas diarias en su diario emocional
   - Solicita citas con psicólogos
   - Recibe recomendaciones personalizadas
   - Visualiza análisis de su estado emocional

2. **Psicólogo**
   - Revisa estudiantes asignados
   - Recibe alertas de estudiantes en riesgo
   - Gestiona citas solicitadas
   - Analiza estado emocional de pacientes

#### Sistemas Externos
1. **Supabase**
   - Almacena datos de usuarios, notas, citas y recomendaciones
   - Gestiona autenticación
   - Proporciona APIs REST

2. **Hugging Face Transformers**
   - Proporciona modelos de análisis de sentimientos
   - Proporciona modelos de análisis de emociones
   - Modelos: RoBERTuito Sentiment/Emotion Analysis

3. **Google Gemini AI**
   - Genera recomendaciones personalizadas
   - Procesa contexto emocional del estudiante
   - Modelo: gemini-2.0-flash

4. **Gmail SMTP**
   - Envía alertas por correo a psicólogos
   - Notifica situaciones de riesgo
   - Alertas de palabras clave severas

### Relaciones (Flechas)

```
Estudiante → UNAYOE: Registra notas, solicita citas
Psicólogo → UNAYOE: Gestiona pacientes, atiende citas
UNAYOE → Supabase: Almacena/consulta datos
UNAYOE → Hugging Face: Analiza sentimientos/emociones
UNAYOE → Gemini AI: Genera recomendaciones
UNAYOE → Gmail: Envía alertas
UNAYOE → Estudiante: Muestra análisis, recomendaciones
UNAYOE → Psicólogo: Muestra alertas, pacientes en riesgo
```

### Ejemplo Visual (Texto)

```
                    ┌─────────────────┐
                    │   Estudiante    │
                    └────────┬────────┘
                             │
                             │ Registra notas
                             │ Solicita citas
                             ▼
    ┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
    │  Psicólogo  │───▶│     UNAYOE       │◀───│  Supabase   │
    └─────────────┘    │  Sistema Salud   │    │  (BaaS)     │
         ▲             │     Mental       │    └─────────────┘
         │             └────────┬─────────┘
         │                      │
         │ Recibe alertas       │ Usa IA
         │                      ▼
         │             ┌──────────────────┐
         │             │ Hugging Face     │
         │             │ Gemini AI        │
         │             │ Gmail SMTP       │
         │             └──────────────────┘
         │
         └─────────── Envía alertas por email
```

### Texto Explicativo para Exposición

> "El sistema UNAYOE actúa como un puente entre estudiantes y psicólogos. Los estudiantes registran sus emociones diarias, y el sistema utiliza inteligencia artificial para analizar su estado mental. Cuando detecta situaciones de riesgo, alerta automáticamente a los psicólogos mediante correo electrónico. El sistema se apoya en Supabase para la persistencia de datos, modelos de Hugging Face para análisis de lenguaje natural en español, y Google Gemini para generar recomendaciones personalizadas."

---

## 2. DIAGRAMA DE ARQUITECTURA

### Descripción
Muestra la arquitectura técnica del sistema, incluyendo capas, componentes principales y tecnologías utilizadas.

### Arquitectura en Capas

#### CAPA 1: Presentación (Frontend)
```
┌─────────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN                   │
│                  (Frontend)                         │
│  ┌──────────────────────────────────────────────┐  │
│  │  React + TypeScript + Tailwind CSS           │  │
│  │  - Interfaz de usuario                       │  │
│  │  - Gestión de estado                         │  │
│  │  - Visualizaciones (Chart.js)                │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
                         │ HTTP/REST
                         ▼
```

#### CAPA 2: API Gateway (Backend - Routers)
```
┌─────────────────────────────────────────────────────┐
│            CAPA DE API (Routers)                    │
│              FastAPI Endpoints                      │
│  ┌─────────┬──────────┬────────┬───────────────┐  │
│  │  auth   │  users   │ notes  │  analysis     │  │
│  │  .py    │  .py     │ .py    │  .py          │  │
│  ├─────────┼──────────┼────────┼───────────────┤  │
│  │ recommendations.py │ appointments.py        │  │
│  └────────────────────┴────────────────────────┘  │
│                                                     │
│  - Validación de entrada (Pydantic)                │
│  - Manejo de errores HTTP                          │
│  - Inyección de dependencias                       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
```

#### CAPA 3: Lógica de Negocio (Services)
```
┌─────────────────────────────────────────────────────┐
│         CAPA DE LÓGICA DE NEGOCIO                   │
│               (Services)                            │
│  ┌─────────────┬──────────────┬─────────────────┐  │
│  │AuthService  │UsersService  │NotesService     │  │
│  ├─────────────┼──────────────┼─────────────────┤  │
│  │NLPService   │AnalysisService│RecommendationsService│
│  ├─────────────┼──────────────┼─────────────────┤  │
│  │AppointmentsService│AlertService│              │  │
│  └─────────────┴──────────────┴─────────────────┘  │
│                                                     │
│  - Reglas de negocio                               │
│  - Orquestación de operaciones                     │
│  - Procesamiento NLP/IA                            │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
```

#### CAPA 4: Persistencia y Servicios Externos
```
┌─────────────────────────────────────────────────────┐
│        CAPA DE DATOS Y SERVICIOS EXTERNOS           │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │  Supabase    │  │ Hugging Face │  │ Gemini   │ │
│  │  PostgreSQL  │  │ Transformers │  │    AI    │ │
│  │     +        │  │              │  │          │ │
│  │     Auth     │  │ - RoBERTuito │  │  Flash   │ │
│  └──────────────┘  └──────────────┘  └──────────┘ │
│                                                     │
│  ┌──────────────┐                                  │
│  │ Gmail SMTP   │                                  │
│  │   Alertas    │                                  │
│  └──────────────┘                                  │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos Completo

```
1. Estudiante escribe nota
         ↓
2. Frontend envía POST /notas
         ↓
3. Router valida datos (Pydantic)
         ↓
4. NotesService procesa nota
         ↓
5. NLPService analiza sentimiento/emoción
         ↓
6. Supabase almacena nota + análisis
         ↓
7. AlertService verifica palabras clave
         ↓
8. Si detecta riesgo → Gmail envía alerta
         ↓
9. Frontend muestra confirmación
```

### Tecnologías por Capa

#### Backend (Python)
- **Framework:** FastAPI 0.115.0
- **Servidor:** Uvicorn 0.32.0
- **Validación:** Pydantic 2.9.2
- **NLP:** Transformers 4.46.0, PyTorch, NLTK 3.9.1
- **Visualización:** Matplotlib 3.9.2, WordCloud, Pandas 2.2.3
- **IA Generativa:** Google Gemini AI 0.3.0+

#### Base de Datos
- **BaaS:** Supabase 2.9.0
- **Motor:** PostgreSQL

#### Servicios Externos
- **Análisis NLP:** Hugging Face (pysentimiento/robertuito)
- **IA Generativa:** Google Gemini (gemini-2.0-flash)
- **Email:** Gmail SMTP SSL

### Patrones de Diseño Implementados

1. **Singleton Pattern**
   - Settings (configuración)
   - Supabase Client (BD)
   - NLPService (modelos IA)

2. **Factory Pattern**
   - Creación de servicios

3. **Dependency Injection**
   - FastAPI Depends()

4. **Repository Pattern**
   - Abstracción de acceso a datos

5. **MVC Adaptado**
   - Model: Pydantic Schemas
   - View: FastAPI Routers
   - Controller: Services

6. **Observer Pattern**
   - Background Tasks para alertas

### Texto Explicativo para Exposición

> "UNAYOE implementa una arquitectura en capas moderna basada en FastAPI. La capa de presentación se comunica con los routers mediante API REST. Los routers delegan la lógica de negocio a los servicios, que orquestan operaciones complejas como análisis NLP con modelos de Hugging Face, generación de recomendaciones con Gemini AI, y envío de alertas automáticas. La persistencia se gestiona mediante Supabase, que combina PostgreSQL con autenticación integrada. El sistema implementa patrones como Singleton para optimizar memoria (modelos NLP pesan ~500MB), Dependency Injection para facilitar testing, y Observer para tareas asíncronas."

---

## 3. DIAGRAMA C4

El modelo C4 proporciona cuatro niveles de abstracción: Contexto, Contenedores, Componentes y Código. Para tu exposición, recomiendo presentar los primeros tres niveles.

### NIVEL 1: DIAGRAMA DE CONTEXTO (C4)

Es similar al diagrama de contexto anterior, pero con la notación C4 estándar.

#### Elementos

**Sistema de Software:**
- **UNAYOE** [Sistema de Software]
  - Plataforma web para monitoreo y soporte de salud mental estudiantil

**Personas:**
- **Estudiante** [Persona]
  - Estudiante universitario que necesita apoyo en salud mental

- **Psicólogo** [Persona]
  - Profesional de salud mental que atiende estudiantes

**Sistemas Externos:**
- **Supabase** [Sistema Externo]
  - Backend as a Service - Base de datos y autenticación

- **Hugging Face Models** [Sistema Externo]
  - Modelos de NLP para análisis de sentimientos y emociones

- **Google Gemini AI** [Sistema Externo]
  - IA generativa para recomendaciones personalizadas

- **Gmail SMTP** [Sistema Externo]
  - Servicio de correo para alertas

#### Relaciones

```
Estudiante → UNAYOE
  "Registra emociones diarias, solicita citas, ve recomendaciones"

Psicólogo → UNAYOE
  "Revisa pacientes, gestiona citas, recibe alertas"

UNAYOE → Supabase
  "Lee y escribe datos de usuarios, notas, citas [HTTPS/REST]"

UNAYOE → Hugging Face Models
  "Analiza sentimientos y emociones [Python API]"

UNAYOE → Google Gemini AI
  "Genera recomendaciones personalizadas [REST API]"

UNAYOE → Gmail SMTP
  "Envía alertas de riesgo [SMTP/SSL]"
```

### NIVEL 2: DIAGRAMA DE CONTENEDORES (C4)

Muestra los contenedores (aplicaciones/servicios) que componen el sistema.

#### Contenedores

1. **Aplicación Web Frontend** [Contenedor: React + TypeScript]
   - Interfaz de usuario de página única (SPA)
   - Tecnologías: React, TypeScript, Tailwind CSS, Chart.js
   - Desplegado en: Servidor web estático

2. **API Backend** [Contenedor: FastAPI + Python]
   - Proporciona funcionalidades de UNAYOE mediante API REST
   - Tecnologías: FastAPI, Python 3.10+, Uvicorn
   - Desplegado en: Servidor de aplicaciones Python

3. **NLP Service** [Contenedor: Python + Transformers]
   - Servicio de análisis de lenguaje natural
   - Modelos: RoBERTuito Sentiment/Emotion Analysis
   - Tecnologías: PyTorch, Transformers, NLTK
   - Singleton dentro del Backend

4. **Base de Datos** [Contenedor: PostgreSQL via Supabase]
   - Almacena usuarios, notas, citas, recomendaciones
   - Esquema: usuarios, notas, citas, recomendaciones, likes_recomendaciones
   - Gestionada por: Supabase

5. **Servicio de Autenticación** [Contenedor: Supabase Auth]
   - Gestiona registro y login de usuarios
   - JWT tokens (access + refresh)
   - Integrado con Supabase

#### Relaciones entre Contenedores

```
Estudiante/Psicólogo → Aplicación Web Frontend
  "Usa [HTTPS]"

Aplicación Web Frontend → API Backend
  "Hace llamadas API a [JSON/HTTPS]"

API Backend → Base de Datos
  "Lee/escribe datos [SQL/HTTPS]"

API Backend → Servicio de Autenticación
  "Autentica usuarios [HTTPS]"

API Backend → NLP Service
  "Analiza texto [Python API]"

API Backend → Hugging Face Models
  "Usa modelos de NLP [Python Transformers]"

API Backend → Google Gemini AI
  "Genera recomendaciones [REST/HTTPS]"

API Backend → Gmail SMTP
  "Envía alertas [SMTP/TLS]"
```

### NIVEL 3: DIAGRAMA DE COMPONENTES (C4)

Descompone el contenedor "API Backend" en sus componentes principales.

#### Componentes del API Backend

**Capa de API (Routers)**

1. **Auth Router** [Componente: FastAPI Router]
   - POST /login
   - Maneja autenticación de usuarios

2. **Users Router** [Componente: FastAPI Router]
   - POST /usuarios/estudiantes
   - POST /usuarios/psicologos
   - GET /usuarios/psychologist/students
   - GET /usuarios/psychologist/students-alerts
   - Gestiona usuarios y alertas

3. **Notes Router** [Componente: FastAPI Router]
   - GET /notas/{user_id}
   - POST /notas
   - Gestiona notas del diario

4. **Analysis Router** [Componente: FastAPI Router]
   - POST /analyze
   - GET /analyze/{user_id}
   - GET /export/{user_id}
   - Genera análisis y visualizaciones

5. **Recommendations Router** [Componente: FastAPI Router]
   - GET /recomendaciones/todas
   - GET /recomendaciones/{user_id}
   - POST /likes/{user_id}/{recomendacion_id}
   - Gestiona recomendaciones y favoritos

6. **Appointments Router** [Componente: FastAPI Router]
   - POST /citas
   - GET /citas/pendientes
   - PUT /citas/{id_cita}/asignar-psicologo
   - Gestiona citas médicas

**Capa de Servicios (Business Logic)**

7. **AuthService** [Componente: Service]
   - Lógica de autenticación
   - Integración con Supabase Auth

8. **UsersService** [Componente: Service]
   - Registro de estudiantes y psicólogos
   - Gestión de perfiles

9. **NotesService** [Componente: Service]
   - Guardado de notas con análisis NLP
   - Consulta de historial

10. **NLPService** [Componente: Service - Singleton]
    - Preprocesamiento de texto
    - Análisis de sentimientos (POS/NEG/NEU)
    - Análisis de emociones (alegría, tristeza, etc.)

11. **AnalysisService** [Componente: Service]
    - Generación de gráficos (sentimientos, emociones, wordcloud)
    - Exportación a CSV

12. **RecommendationsService** [Componente: Service]
    - Generación de recomendaciones con Gemini AI
    - Sistema de likes
    - Filtrado por emoción/sentimiento

13. **AppointmentsService** [Componente: Service]
    - CRUD de citas
    - Asignación de psicólogos
    - Autorización por rol

14. **AlertService** [Componente: Service]
    - Detección de palabras clave severas
    - Envío de emails de alerta
    - Background tasks

**Capa de Configuración e Infraestructura**

15. **Settings** [Componente: Config - Singleton]
    - Configuración centralizada
    - Variables de entorno

16. **Supabase Client** [Componente: DB Client - Singleton]
    - Conexión a base de datos
    - Autenticación

17. **Pydantic Schemas** [Componente: Models]
    - EstudianteCreate, PsicologoCreate
    - LoginRequest, UserResponse
    - NoteResponse, CitaCreate
    - Validación de datos

#### Relaciones entre Componentes

```
Routers → Services [Usa - Dependency Injection]
Services → Supabase Client [Usa - Singleton]
Services → NLPService [Usa - Singleton]
Services → Settings [Usa - Singleton]
Routers → Pydantic Schemas [Valida con]
Services → Pydantic Schemas [Retorna]

NotesService → AlertService [Trigger alert via Background Task]
RecommendationsService → Gemini AI [Genera recomendaciones]
NLPService → Hugging Face [Carga modelos]
AlertService → Gmail SMTP [Envía emails]
```

### NIVEL 4: DIAGRAMA DE CÓDIGO (Opcional)

Este nivel muestra clases, métodos e interfaces. Dado el alcance de tu exposición, recomiendo omitirlo o mostrar solo un ejemplo de una clase clave.

#### Ejemplo: NLPService Class

```python
class NLPService:
    # Atributos
    - _instance: NLPService (Singleton)
    - _initialized: bool
    - sentiment_classifier: Pipeline
    - emotion_classifier: Pipeline
    - stopwords: set
    - lemmatizer: WordNetLemmatizer

    # Métodos
    + __new__() → NLPService
    + __init__() → None
    + _initialize_models() → None
    + preprocesar_texto(texto: str) → tuple[str, list[str]]
    + analizar_sentimiento(texto: str) → str
    + analizar_emocion(texto: str) → tuple[str, float]
```

### Código PlantUML para C4

Si deseas generar los diagramas automáticamente, aquí está el código PlantUML:

#### C4 Nivel 1: Contexto

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

Person(estudiante, "Estudiante", "Estudiante universitario que necesita apoyo en salud mental")
Person(psicologo, "Psicólogo", "Profesional de salud mental que atiende estudiantes")

System(unayoe, "UNAYOE", "Plataforma web para monitoreo y soporte de salud mental estudiantil")

System_Ext(supabase, "Supabase", "Backend as a Service - Base de datos y autenticación")
System_Ext(huggingface, "Hugging Face Models", "Modelos de NLP para análisis de sentimientos y emociones")
System_Ext(gemini, "Google Gemini AI", "IA generativa para recomendaciones personalizadas")
System_Ext(gmail, "Gmail SMTP", "Servicio de correo para alertas")

Rel(estudiante, unayoe, "Registra emociones diarias, solicita citas, ve recomendaciones")
Rel(psicologo, unayoe, "Revisa pacientes, gestiona citas, recibe alertas")

Rel(unayoe, supabase, "Lee y escribe datos", "HTTPS/REST")
Rel(unayoe, huggingface, "Analiza sentimientos y emociones", "Python API")
Rel(unayoe, gemini, "Genera recomendaciones", "REST API")
Rel(unayoe, gmail, "Envía alertas de riesgo", "SMTP/SSL")

@enduml
```

#### C4 Nivel 2: Contenedores

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

Person(estudiante, "Estudiante", "Estudiante universitario")
Person(psicologo, "Psicólogo", "Profesional de salud mental")

System_Boundary(unayoe, "UNAYOE") {
    Container(web_app, "Aplicación Web Frontend", "React + TypeScript", "Interfaz de usuario SPA")
    Container(api, "API Backend", "FastAPI + Python", "Proporciona funcionalidades mediante API REST")
    Container(nlp_service, "NLP Service", "Python + Transformers", "Análisis de lenguaje natural")
    ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacena usuarios, notas, citas, recomendaciones")
}

System_Ext(supabase_auth, "Supabase Auth", "Servicio de autenticación")
System_Ext(huggingface, "Hugging Face", "Modelos de NLP")
System_Ext(gemini, "Google Gemini AI", "IA generativa")
System_Ext(gmail, "Gmail SMTP", "Servicio de email")

Rel(estudiante, web_app, "Usa", "HTTPS")
Rel(psicologo, web_app, "Usa", "HTTPS")
Rel(web_app, api, "Hace llamadas API", "JSON/HTTPS")
Rel(api, db, "Lee/escribe datos", "SQL/HTTPS")
Rel(api, supabase_auth, "Autentica usuarios", "HTTPS")
Rel(api, nlp_service, "Analiza texto", "Python API")
Rel(nlp_service, huggingface, "Usa modelos", "Python Transformers")
Rel(api, gemini, "Genera recomendaciones", "REST/HTTPS")
Rel(api, gmail, "Envía alertas", "SMTP/TLS")

@enduml
```

#### C4 Nivel 3: Componentes

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

LAYOUT_WITH_LEGEND()

Container(web_app, "Aplicación Web Frontend", "React + TypeScript")
Container_Ext(db, "Base de Datos", "PostgreSQL")
System_Ext(supabase_auth, "Supabase Auth")
System_Ext(huggingface, "Hugging Face")
System_Ext(gemini, "Google Gemini AI")
System_Ext(gmail, "Gmail SMTP")

Container_Boundary(api, "API Backend") {
    Component(auth_router, "Auth Router", "FastAPI Router", "Endpoints de autenticación")
    Component(users_router, "Users Router", "FastAPI Router", "Endpoints de usuarios")
    Component(notes_router, "Notes Router", "FastAPI Router", "Endpoints de notas")
    Component(analysis_router, "Analysis Router", "FastAPI Router", "Endpoints de análisis")
    Component(recommendations_router, "Recommendations Router", "FastAPI Router", "Endpoints de recomendaciones")
    Component(appointments_router, "Appointments Router", "FastAPI Router", "Endpoints de citas")

    Component(auth_service, "AuthService", "Service", "Lógica de autenticación")
    Component(users_service, "UsersService", "Service", "Gestión de usuarios")
    Component(notes_service, "NotesService", "Service", "Gestión de notas")
    Component(nlp_service, "NLPService", "Service - Singleton", "Análisis NLP")
    Component(analysis_service, "AnalysisService", "Service", "Generación de análisis")
    Component(recommendations_service, "RecommendationsService", "Service", "Sistema de recomendaciones")
    Component(appointments_service, "AppointmentsService", "Service", "Gestión de citas")
    Component(alert_service, "AlertService", "Service", "Sistema de alertas")

    Component(supabase_client, "Supabase Client", "DB Client - Singleton", "Conexión a BD")
    Component(settings, "Settings", "Config - Singleton", "Configuración")
    Component(schemas, "Pydantic Schemas", "Models", "Validación de datos")
}

Rel(web_app, auth_router, "Usa", "JSON/HTTPS")
Rel(web_app, users_router, "Usa", "JSON/HTTPS")
Rel(web_app, notes_router, "Usa", "JSON/HTTPS")
Rel(web_app, analysis_router, "Usa", "JSON/HTTPS")
Rel(web_app, recommendations_router, "Usa", "JSON/HTTPS")
Rel(web_app, appointments_router, "Usa", "JSON/HTTPS")

Rel(auth_router, auth_service, "Usa")
Rel(users_router, users_service, "Usa")
Rel(notes_router, notes_service, "Usa")
Rel(notes_router, alert_service, "Usa")
Rel(analysis_router, analysis_service, "Usa")
Rel(recommendations_router, recommendations_service, "Usa")
Rel(appointments_router, appointments_service, "Usa")

Rel(auth_service, supabase_client, "Usa")
Rel(users_service, supabase_client, "Usa")
Rel(notes_service, supabase_client, "Usa")
Rel(notes_service, nlp_service, "Usa")
Rel(analysis_service, supabase_client, "Usa")
Rel(analysis_service, nlp_service, "Usa")
Rel(recommendations_service, supabase_client, "Usa")
Rel(recommendations_service, gemini, "Genera recomendaciones")
Rel(appointments_service, supabase_client, "Usa")
Rel(alert_service, supabase_client, "Usa")
Rel(alert_service, gmail, "Envía emails")

Rel(nlp_service, huggingface, "Carga modelos")
Rel(supabase_client, db, "Consulta")
Rel(auth_service, supabase_auth, "Autentica")

@enduml
```

### Texto Explicativo para Exposición - C4

> "El modelo C4 nos permite visualizar la arquitectura en diferentes niveles de abstracción. En el nivel de Contexto, vemos que UNAYOE interactúa con estudiantes y psicólogos, y se integra con cuatro sistemas externos clave. En el nivel de Contenedores, identificamos tres componentes principales: el frontend React, el backend FastAPI, y el servicio NLP que procesa el lenguaje. En el nivel de Componentes, descomponemos el backend en 6 routers que exponen los endpoints, 8 servicios que implementan la lógica de negocio, y 3 componentes de infraestructura que gestionan configuración, base de datos y validación."

---

## 4. HERRAMIENTAS RECOMENDADAS

### Para Crear los Diagramas

#### Opción 1: Draw.io / Diagrams.net (Recomendado)
- **URL:** https://app.diagrams.net/
- **Ventajas:**
  - Gratis y sin registro
  - Plantillas C4 disponibles
  - Exporta a PNG, SVG, PDF
  - Interfaz visual drag-and-drop
- **Cómo usar:**
  1. Ir a https://app.diagrams.net/
  2. File → New → Create
  3. Buscar "C4" en plantillas o empezar en blanco
  4. Usar formas rectangulares con colores:
     - Azul para personas
     - Verde para sistemas externos
     - Gris para tu sistema
     - Amarillo para contenedores

#### Opción 2: PlantUML + C4-PlantUML
- **URL:** https://plantuml.com/
- **Ventajas:**
  - Diagramas como código (reproducibles)
  - Sintaxis estándar C4
  - Versionable en Git
- **Desventajas:**
  - Requiere instalación o usar online
  - Menos control visual
- **Cómo usar:**
  1. Copiar el código PlantUML de arriba
  2. Ir a http://www.plantuml.com/plantuml/uml/
  3. Pegar el código
  4. Descargar imagen generada

#### Opción 3: Lucidchart
- **URL:** https://www.lucidchart.com/
- **Ventajas:**
  - Interfaz profesional
  - Colaboración en tiempo real
  - Plantillas C4 disponibles
- **Desventajas:**
  - Requiere registro
  - Plan gratuito limitado

#### Opción 4: Miro
- **URL:** https://miro.com/
- **Ventajas:**
  - Excelente para presentaciones
  - Muy visual
  - Colaboración en tiempo real
- **Desventajas:**
  - Requiere registro

#### Opción 5: Excalidraw (Minimalista)
- **URL:** https://excalidraw.com/
- **Ventajas:**
  - Estilo hand-drawn (sketchy)
  - Gratis y sin registro
  - Muy rápido
- **Desventajas:**
  - Menos profesional

### Paleta de Colores Recomendada

Para mantener consistencia visual:

```
Personas:           #08427B (Azul oscuro)
Sistema UNAYOE:     #1168BD (Azul medio)
Contenedores:       #438DD5 (Azul claro)
Componentes:        #85BBF0 (Azul muy claro)
Sistemas Externos:  #999999 (Gris)
```

### Consejos para la Exposición

1. **Orden de presentación:**
   - Diagrama de Contexto (vista general)
   - Diagrama de Arquitectura (tecnologías)
   - C4 Nivel 2: Contenedores (estructura)
   - C4 Nivel 3: Componentes (detalle)

2. **Tiempo estimado:**
   - Contexto: 2-3 minutos
   - Arquitectura: 3-4 minutos
   - C4 Contenedores: 2-3 minutos
   - C4 Componentes: 3-4 minutos
   - **Total: ~12 minutos**

3. **Tips de presentación:**
   - Empezar desde lo general a lo específico
   - Usar puntero láser o resaltado en los diagramas
   - Mencionar las tecnologías clave (FastAPI, Transformers, Gemini)
   - Destacar los patrones de diseño (Singleton, DI, MVC)
   - Explicar el flujo de datos de un caso de uso
   - Mencionar las decisiones arquitectónicas importantes

4. **Caso de uso para explicar flujo:**

   > "Imaginemos que un estudiante escribe: 'Me siento muy triste y solo, no tiene sentido seguir'. El frontend envía esta nota al backend. El NotesRouter la recibe, el NotesService la procesa, el NLPService detecta sentimiento negativo y emoción de tristeza con alta confianza. La nota se guarda en Supabase. Luego, el AlertService detecta la palabra clave 'no tiene sentido seguir' y dispara un email automático al psicólogo asignado con prioridad alta. Simultáneamente, el RecommendationsService consulta a Gemini AI para generar recomendaciones personalizadas basadas en el estado emocional detectado."

5. **Preguntas anticipadas:**
   - **¿Por qué Supabase?** BaaS que combina BD + Auth en una sola plataforma, reduce complejidad.
   - **¿Por qué modelos en español?** RoBERTuito está entrenado específicamente en español latinoamericano, mejor precisión.
   - **¿Cómo escala el NLP?** Singleton carga modelos una vez, ahorra memoria (~500MB).
   - **¿Cómo se asegura la privacidad?** Datos sensibles en Supabase con encriptación, acceso por roles.

---

## RESUMEN EJECUTIVO

Para tu exposición final, necesitarás crear **3 tipos de gráficos**:

1. **Diagrama de Contexto**: Muestra UNAYOE, sus usuarios (Estudiante, Psicólogo) y sistemas externos (Supabase, Hugging Face, Gemini AI, Gmail). Vista de alto nivel.

2. **Diagrama de Arquitectura**: Muestra las 4 capas (Frontend, API, Servicios, Datos), tecnologías utilizadas (FastAPI, React, Transformers, PostgreSQL), y patrones de diseño (Singleton, DI, MVC).

3. **Diagramas C4**: Tres niveles de detalle:
   - **Nivel 1 (Contexto)**: Similar al diagrama de contexto pero con notación C4
   - **Nivel 2 (Contenedores)**: Frontend, Backend API, NLP Service, Base de Datos
   - **Nivel 3 (Componentes)**: 6 routers + 8 servicios + 3 componentes de infraestructura

**Herramienta recomendada:** Draw.io (https://app.diagrams.net/) - Gratis, fácil de usar, exporta a formatos profesionales.

**Duración estimada de presentación:** 10-15 minutos cubriendo los 3 tipos de gráficos.

**Elemento diferenciador:** Destaca el uso de IA en español (RoBERTuito), sistema de alertas automático, y generación de recomendaciones con Gemini AI.
