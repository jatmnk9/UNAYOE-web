# Diagrama de Flujo Principal - Sistema UNAYOE

## Descripción General
Sistema de apoyo psicológico universitario que permite a estudiantes registrar emociones en un diario digital, recibir recomendaciones personalizadas, agendar citas y monitorear su bienestar emocional. Los psicólogos pueden monitorear estudiantes, detectar alertas de riesgo y gestionar citas asignadas.

---

## 1. Flujo de Autenticación y Registro

```mermaid
graph TD
    A[Usuario Accede al Sistema] --> B{¿Tiene Cuenta?}
    B -->|No| C[Página de Registro /signup]
    B -->|Sí| D[Página de Login /login]

    C --> E[Completar Formulario de Registro]
    E --> F{Tipo de Usuario}
    F -->|Estudiante| G[POST /usuarios/estudiantes]
    F -->|Psicólogo| H[POST /usuarios/psicologos]

    G --> I[Crear Perfil en Supabase]
    H --> I
    I --> J[Redirigir a Login]

    D --> K[Ingresar Credenciales]
    K --> L[POST /login]
    L --> M[AuthService.login]
    M --> N[Validar con Supabase Auth]
    N --> O{Credenciales Válidas?}

    O -->|No| P[Mostrar Error]
    P --> D

    O -->|Sí| Q[Obtener Datos de Usuario]
    Q --> R[Generar Token de Acceso]
    R --> S[Guardar en LocalStorage]
    S --> T{Rol del Usuario?}

    T -->|Estudiante| U[Dashboard Estudiante /dashboard]
    T -->|Psicólogo| V[Dashboard Psicólogo /psychologist/dashboard]

    style A fill:#e1f5ff
    style U fill:#c8e6c9
    style V fill:#fff9c4
```

---

## 2. Flujo Principal - Estudiante

### 2.1 Gestión del Diario Emocional

```mermaid
graph TD
    A[Dashboard Estudiante] --> B[Página de Diario /diary]
    B --> C[DiaryPage]
    C --> D[Cargar Notas Existentes]
    D --> E[GET /notas/:user_id]
    E --> F[NotesService.obtener_notas_por_usuario]
    F --> G[Consultar Supabase tabla 'notas']
    G --> H[Mostrar Lista de Notas con NoteCard]

    C --> I[Escribir Nueva Nota]
    I --> J[NoteForm - Ingresar Texto]
    J --> K[Botón 'Guardar Nota']
    K --> L[POST /notas]
    L --> M[NotesService.guardar_nota]

    M --> N[NLPService.preprocesar_texto]
    N --> O[Limpieza y Tokenización]
    O --> P[NLPService.analizar_sentimiento]
    P --> Q[Modelo: nlptown/bert-base-multilingual]

    M --> R[NLPService.analizar_emocion]
    R --> S[Modelo: finiteautomata/beto-sentiment-analysis]

    Q --> T[Guardar en Supabase tabla 'notas']
    S --> T
    T --> U[Nota Guardada con Análisis]

    U --> V[BackgroundTasks]
    V --> W[AlertService.trigger_alert_if_keywords]
    W --> X{Contiene Palabras Severas?}

    X -->|No| Y[Fin del Proceso]
    X -->|Sí| Z[Detectar Palabras de Riesgo]
    Z --> AA[Obtener Psicólogo Asignado]
    AA --> AB[Construir Email de Alerta]
    AB --> AC[Enviar Email SMTP]
    AC --> AD[Alerta Enviada al Psicólogo]

    U --> AE[Actualizar Vista]
    AE --> H

    H --> AF[AccompanimentMessage]
    AF --> AG[Mostrar Mensaje Personalizado según Emoción]

    style A fill:#e1f5ff
    style U fill:#c8e6c9
    style AD fill:#ffcdd2
```

**Palabras Clave de Riesgo Monitoreadas:**
- morir, muerte, suicidio, lastimarme, quitarme la vida, autolesión, cortarme
- Frases: "no quiero vivir", "me quiero morir", "no tengo ganas de vivir"

---

### 2.2 Sistema de Recomendaciones Personalizadas

```mermaid
graph TD
    A[Dashboard Estudiante] --> B[Página de Recomendaciones /recommendations]
    B --> C[RecommendationsPage]
    C --> D[Cargar Recomendaciones Personalizadas]
    D --> E[GET /recomendaciones/:user_id]
    E --> F[RecommendationsService.obtener_recomendaciones_personalizadas]

    F --> G[Obtener Últimas 10 Notas del Usuario]
    G --> H[Analizar Emociones Recientes]
    H --> I[Calcular Distribución de Emociones]
    I --> J[Identificar Emoción Predominante]

    F --> K[Obtener Gustos del Usuario tabla 'gustos']
    K --> L[Filtrar por tipo: actividad, video, canción, lectura]

    J --> M[Obtener Recomendaciones de tabla 'recomendaciones']
    L --> M
    M --> N[Filtrar por Emoción y Gustos]
    N --> O[Seleccionar Recomendaciones Relevantes]

    O --> P[Cargar Favoritos del Usuario]
    P --> Q[GET /likes/:user_id]
    Q --> R[Mostrar RecommendationCard]

    R --> S{Usuario Interactúa}
    S -->|Like| T[POST /likes/:user_id/:recomendacion_id]
    S -->|Unlike| U[DELETE /likes/:user_id/:recomendacion_id]

    T --> V[Guardar en tabla 'likes']
    U --> W[Eliminar de tabla 'likes']

    V --> X[Actualizar Vista de Favoritos]
    W --> X

    C --> Y[Ver Favoritos]
    Y --> Z[GET /recomendaciones/favoritos/:user_id]
    Z --> AA[Mostrar Solo Recomendaciones con Like]

    style A fill:#e1f5ff
    style O fill:#c8e6c9
    style R fill:#fff9c4
```

**Tipos de Recomendaciones:**
- Actividades (ejercicio, meditación, salidas)
- Videos (motivacionales, educativos)
- Canciones (relajantes, energizantes)
- Lecturas (libros, artículos)

---

### 2.3 Gestión de Citas Psicológicas

```mermaid
graph TD
    A[Dashboard Estudiante] --> B[Página de Citas /appointments]
    B --> C[AppointmentsPage]
    C --> D[Cargar Citas del Estudiante]
    D --> E[GET /citas/usuario/:id_usuario]
    E --> F[AppointmentsService.obtener_citas_usuario]
    F --> G[Consultar tabla 'citas' por id_creador]
    G --> H[Mostrar AppointmentList]

    C --> I[Crear Nueva Cita]
    I --> J[AppointmentForm]
    J --> K[Completar Datos de la Cita]
    K --> L[Fecha, Hora, Modalidad, Motivo]
    L --> M[POST /citas?id_usuario=xxx]
    M --> N[AppointmentsService.crear_cita]

    N --> O{Validar Usuario es Estudiante}
    O -->|No| P[Error 403: Solo estudiantes pueden crear citas]
    O -->|Sí| Q[Validar Fecha Futura]

    Q --> R{Fecha Válida?}
    R -->|No| S[Error 400: Fecha debe ser futura]
    R -->|Sí| T[Crear Cita en Supabase]

    T --> U[Estado: 'pendiente']
    U --> V[Psicologo_id: null]
    V --> W[Cita Creada Exitosamente]
    W --> X[Actualizar Vista]
    X --> H

    H --> Y{Estudiante Interactúa}
    Y -->|Editar Cita| Z[PUT /citas/:id_cita?id_usuario=xxx]
    Y -->|Eliminar Cita| AA[DELETE /citas/:id_cita?id_usuario=xxx]

    Z --> AB[AppointmentsService.actualizar_cita]
    AB --> AC{Es el Creador?}
    AC -->|No| AD[Error 403: No autorizado]
    AC -->|Sí| AE[Actualizar en Supabase]
    AE --> X

    AA --> AF[AppointmentsService.eliminar_cita]
    AF --> AG{Es el Creador?}
    AG -->|No| AD
    AG -->|Sí| AH[Eliminar de Supabase]
    AH --> X

    H --> AI[AppointmentCard]
    AI --> AJ[Mostrar Estado de Cita]
    AJ --> AK{Estado}
    AK -->|Pendiente| AL[Amarillo: Sin psicólogo asignado]
    AK -->|Confirmada| AM[Verde: Psicólogo asignado]
    AK -->|Completada| AN[Azul: Cita realizada]
    AK -->|Cancelada| AO[Rojo: Cita cancelada]

    style A fill:#e1f5ff
    style W fill:#c8e6c9
    style AD fill:#ffcdd2
```

**Estados de Citas:**
- **Pendiente**: Cita creada, sin psicólogo asignado
- **Confirmada**: Psicólogo asignado, pendiente de realizar
- **Completada**: Cita realizada
- **Cancelada**: Cita cancelada

---

## 3. Flujo Principal - Psicólogo

### 3.1 Dashboard y Monitoreo de Estudiantes

```mermaid
graph TD
    A[Dashboard Psicólogo] --> B[/psychologist/dashboard]
    B --> C[PsychologistDashboardPage]
    C --> D[Cargar Estudiantes con Alertas]
    D --> E[GET /usuarios/psychologist/students-alerts?psychologist_id=xxx]
    E --> F[AlertService.get_students_with_alerts]

    F --> G[Obtener Estudiantes Asignados]
    G --> H[Filtrar por psicologo_id si se proporciona]
    H --> I[Para Cada Estudiante]

    I --> J[Obtener Últimas N Notas tabla 'notas']
    J --> K[AlertService.compute_sadness_risk]
    K --> L[Analizar Emociones de las Notas]

    L --> M{Detectar Emoción 'Tristeza'}
    M --> N[Calcular Métricas de Riesgo]
    N --> O[count: total de notas analizadas]
    O --> P[sad_count: notas con tristeza]
    P --> Q[ratio: sad_count / count]
    Q --> R[max_sad_score: score máximo de tristeza]
    R --> S[latest_sad_score: score de última nota]

    S --> T{Determinar Nivel de Riesgo}
    T -->|latest_sad_score >= 0.9 O ratio >= 0.6| U[RIESGO ALTO]
    T -->|ratio >= 0.4 O max_sad_score >= 0.75| V[RIESGO MEDIO]
    T -->|ratio > 0| W[RIESGO BAJO]
    T -->|Ninguna tristeza| X[SIN RIESGO]

    U --> Y[AlertCard - Rojo]
    V --> Z[AlertCard - Naranja]
    W --> AA[AlertCard - Amarillo]
    X --> AB[StudentCard - Verde]

    Y --> AC[Mensaje: ALERTA - Posibles tendencias depresivas]
    Z --> AD[Mensaje: Atención - Señales moderadas de tristeza]
    W --> AE[Mensaje: Leves señales de tristeza]
    X --> AF[Mensaje: Sin señales de tristeza]

    C --> AG[AlertList - Mostrar Alertas Ordenadas]
    AG --> AH{Psicólogo Selecciona Estudiante}
    AH --> AI[StudentDetailModal]
    AI --> AJ[Mostrar Información Completa]
    AJ --> AK[Nombre, Código, Nivel de Riesgo]
    AK --> AL[Historial de Notas Recientes]
    AL --> AM[Análisis de Sentimientos]

    C --> AN[Ver Todos los Estudiantes]
    AN --> AO[GET /usuarios/psychologist/students?psychologist_id=xxx]
    AO --> AP[UsersService.obtener_estudiantes]
    AP --> AQ[StudentList]

    style A fill:#fff9c4
    style U fill:#ffcdd2
    style V fill:#ffe0b2
    style W fill:#fff9c4
    style X fill:#c8e6c9
```

**Criterios de Alertas:**
- **Alto**: Última nota con score >= 0.9 de tristeza O 60%+ notas tristes
- **Medio**: 40%+ notas tristes O score máximo >= 0.75
- **Bajo**: Al menos una nota con tristeza
- **Sin riesgo**: Ninguna nota con tristeza

---

### 3.2 Gestión de Citas (Psicólogo)

```mermaid
graph TD
    A[Dashboard Psicólogo] --> B[Sección de Citas]
    B --> C[Ver Citas Pendientes]
    C --> D[GET /citas/pendientes]
    D --> E[AppointmentsService.obtener_citas_pendientes]
    E --> F[Filtrar citas con psicologo_id = null]
    F --> G[Mostrar AppointmentList]

    B --> H[Ver Citas Asignadas]
    H --> I[GET /citas/usuario/:id_usuario]
    I --> J[AppointmentsService.obtener_citas_usuario]
    J --> K[Filtrar citas por id_psicologo_asignado]
    K --> L[Mostrar Mis Citas]

    G --> M{Psicólogo Asigna Cita}
    M --> N[Seleccionar Cita Pendiente]
    N --> O[PUT /citas/:id_cita/asignar-psicologo]
    O --> P[AppointmentsService.asignar_psicologo]

    P --> Q{Validar Estado}
    Q -->|Estado != 'pendiente'| R[Error 400: Cita ya asignada]
    Q -->|Estado = 'pendiente'| S[Actualizar Cita]

    S --> T[Asignar psicologo_id]
    T --> U[Cambiar estado a 'confirmada']
    U --> V[Guardar en Supabase]
    V --> W[Cita Confirmada]
    W --> X[Actualizar Vista]

    L --> Y{Psicólogo Actualiza Cita}
    Y -->|Cambiar Estado| Z[PUT /citas/:id_cita]
    Y -->|Completar Cita| AA[Cambiar estado a 'completada']
    Y -->|Cancelar Cita| AB[Cambiar estado a 'cancelada']

    Z --> AC[AppointmentsService.actualizar_cita]
    AC --> AD[Actualizar en Supabase]
    AD --> X

    B --> AE[Ver Todas las Citas]
    AE --> AF[GET /citas/todas]
    AF --> AG[AppointmentsService.obtener_todas_las_citas]
    AG --> AH[Mostrar Todas las Citas del Sistema]

    style A fill:#fff9c4
    style W fill:#c8e6c9
    style R fill:#ffcdd2
```

---

### 3.3 Análisis y Exportación de Datos

```mermaid
graph TD
    A[Dashboard Psicólogo] --> B[Seleccionar Estudiante]
    B --> C[Acceder a Análisis de Estudiante]
    C --> D[GET /analyze/:user_id]
    D --> E[AnalysisService.analizar_multiples_notas]

    E --> F[Obtener Notas del Estudiante]
    F --> G[NotesService.obtener_notas_por_usuario]
    G --> H[Procesar Cada Nota]

    H --> I[Crear DataFrame con Pandas]
    I --> J[Columnas: fecha, nota, sentimiento, emoción, score]
    J --> K[AnalysisService.crear_visualizaciones]

    K --> L[Gráfico 1: Distribución de Emociones]
    K --> M[Gráfico 2: Evolución Temporal del Sentimiento]
    K --> N[Gráfico 3: Scores de Confianza de Emociones]

    L --> O[Matplotlib - Generar Gráfico]
    M --> O
    N --> O
    O --> P[Convertir a Base64]
    P --> Q[Retornar JSON con Imágenes]

    Q --> R[Mostrar Visualizaciones en Frontend]

    C --> S[Exportar Reporte]
    S --> T[GET /export/:user_id]
    T --> U[AnalysisService - Generar CSV]
    U --> V[Crear DataFrame Analizado]
    V --> W[DataFrame.to_csv]
    W --> X[StreamingResponse]
    X --> Y[Descargar archivo reporte_diario_[user_id].csv]

    Y --> Z[Archivo CSV con:]
    Z --> AA[- Fecha de cada nota]
    Z --> AB[- Texto de la nota]
    Z --> AC[- Sentimiento detectado]
    Z --> AD[- Emoción detectada]
    Z --> AE[- Score de confianza]

    style A fill:#fff9c4
    style Q fill:#c8e6c9
    style Y fill:#bbdefb
```

**Visualizaciones Generadas:**
1. **Distribución de Emociones**: Gráfico de barras con frecuencia de cada emoción
2. **Evolución Temporal**: Línea de tiempo mostrando cambios de sentimiento
3. **Scores de Confianza**: Análisis de certeza de las predicciones

---

## 4. Flujo de Procesamiento NLP

```mermaid
graph TD
    A[Nota de Estudiante] --> B[NLPService.preprocesar_texto]
    B --> C[Convertir a Minúsculas]
    C --> D[Eliminar URLs]
    D --> E[Eliminar Caracteres Especiales]
    E --> F[Tokenización con NLTK]
    F --> G[Eliminar Stop Words en Español]
    G --> H[Filtrar Tokens < 3 caracteres]
    H --> I[Texto Preprocesado]

    I --> J[NLPService.analizar_sentimiento]
    J --> K[Modelo: nlptown/bert-base-multilingual-uncased-sentiment]
    K --> L[Pipeline de Transformers]
    L --> M[Clasificación: POS / NEG / NEU]
    M --> N[Score de Confianza]

    I --> O[NLPService.analizar_emocion]
    O --> P[Modelo: finiteautomata/beto-sentiment-analysis]
    P --> Q[Pipeline de Transformers]
    Q --> R[Clasificación de Emociones:]
    R --> S[- Alegría / Joy]
    R --> T[- Tristeza / Sadness]
    R --> U[- Enojo / Anger]
    R --> V[- Miedo / Fear]
    R --> W[- Sorpresa / Surprise]

    S --> X[Score de Confianza 0.0 - 1.0]
    T --> X
    U --> X
    V --> X
    W --> X

    N --> Y[Guardar en DB]
    X --> Y
    Y --> Z[Tabla 'notas' con Análisis Completo]

    style A fill:#e1f5ff
    style M fill:#c8e6c9
    style R fill:#fff9c4
    style Z fill:#bbdefb
```

**Modelos de Machine Learning Utilizados:**
- **Sentimiento**: nlptown/bert-base-multilingual-uncased-sentiment
- **Emoción**: finiteautomata/beto-sentiment-analysis (BETO - BERT en Español)
- **Fallback**: distilbert-base-uncased (si fallan los anteriores)

---

## 5. Arquitectura del Sistema

### 5.1 Backend (FastAPI)

```
backend/
├── app/
│   ├── routers/
│   │   ├── auth.py              # POST /login
│   │   ├── users.py             # Gestión de estudiantes y psicólogos
│   │   ├── notes.py             # GET /notas/:user_id, POST /notas
│   │   ├── appointments.py      # CRUD de citas
│   │   ├── recommendations.py   # GET /recomendaciones/:user_id, likes
│   │   └── analysis.py          # GET /analyze/:user_id, /export/:user_id
│   ├── services/
│   │   ├── auth_service.py      # Autenticación con Supabase
│   │   ├── users_service.py     # Lógica de usuarios
│   │   ├── notes_service.py     # Gestión de notas
│   │   ├── appointments_service.py  # Lógica de citas
│   │   ├── recommendations_service.py  # Algoritmo de recomendaciones
│   │   ├── nlp_service.py       # Procesamiento NLP (Singleton)
│   │   ├── analysis_service.py  # Análisis y visualizaciones
│   │   └── alert_service.py     # Sistema de alertas y emails
│   ├── models/
│   │   └── schemas.py           # Pydantic models
│   ├── db/
│   │   └── supabase.py          # Cliente de Supabase
│   └── config/
│       └── settings.py          # Configuración y variables de entorno
```

### 5.2 Frontend (React + TypeScript)

```
frontend/src/
├── features/
│   ├── auth/                    # Login/Signup
│   ├── diary/                   # Diario emocional
│   ├── appointments/            # Gestión de citas
│   ├── recommendations/         # Recomendaciones personalizadas
│   └── psychologist/            # Dashboard psicólogo
├── shared/
│   ├── components/
│   │   ├── layout/              # Header, Sidebar, Layouts
│   │   └── ui/                  # Componentes reutilizables
│   ├── hooks/                   # Custom hooks
│   └── utils/                   # Utilidades
├── core/
│   ├── api/
│   │   └── client.ts            # Cliente HTTP
│   ├── types/
│   │   └── index.ts             # Tipos TypeScript
│   └── config/
│       └── constants.ts         # Constantes
└── app/
    └── router/
        └── routes.tsx           # Definición de rutas
```

---

## 6. Base de Datos (Supabase)

### Tablas Principales:

**usuarios**
- id (PK)
- email
- nombre, apellido
- rol: 'estudiante' | 'psicologo'
- codigo_alumno (estudiantes)
- psicologo_id (FK a usuarios, para estudiantes)

**notas**
- id (PK)
- usuario_id (FK)
- texto
- sentimiento: 'POS' | 'NEG' | 'NEU'
- emocion: 'alegria' | 'tristeza' | 'enojo' | 'miedo' | 'sorpresa'
- emocion_score (0.0 - 1.0)
- created_at

**citas**
- id (PK)
- id_creador (FK a usuarios - estudiante)
- id_psicologo_asignado (FK a usuarios - psicólogo)
- fecha_hora
- modalidad: 'presencial' | 'virtual'
- motivo
- estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'

**recomendaciones**
- id (PK)
- titulo
- descripcion
- tipo: 'actividad' | 'video' | 'cancion' | 'lectura'
- emocion_objetivo
- link (opcional)

**likes**
- id (PK)
- usuario_id (FK)
- recomendacion_id (FK)

**gustos**
- id (PK)
- usuario_id (FK)
- tipo_gusto: 'actividad' | 'video' | 'cancion' | 'lectura'

---

## 7. Flujo de Datos Completo

```mermaid
sequenceDiagram
    actor E as Estudiante
    participant F as Frontend
    participant B as Backend API
    participant N as NLP Service
    participant S as Supabase
    participant A as Alert Service
    participant P as Psicólogo

    E->>F: Escribe nota en diario
    F->>B: POST /notas
    B->>N: Preprocesar texto
    N->>N: Limpiar y tokenizar
    B->>N: Analizar sentimiento
    N-->>B: POS/NEG/NEU + score
    B->>N: Analizar emoción
    N-->>B: Emoción + score
    B->>S: Guardar nota con análisis
    S-->>B: Nota guardada

    B->>A: [Background] Verificar palabras severas
    A->>A: Detectar palabras de riesgo
    alt Contiene palabras severas
        A->>S: Obtener psicólogo asignado
        S-->>A: Datos del psicólogo
        A->>A: Enviar email de alerta
        A-->>P: Email de alerta urgente
    end

    B-->>F: Nota guardada exitosamente
    F-->>E: Mostrar nota con mensaje de acompañamiento

    Note over P: Dashboard del Psicólogo
    P->>F: Accede a dashboard
    F->>B: GET /usuarios/psychologist/students-alerts
    B->>S: Obtener estudiantes y notas recientes
    S-->>B: Datos de estudiantes
    B->>A: Calcular riesgo de tristeza
    A->>A: Analizar distribución de emociones
    A-->>B: Niveles de riesgo calculados
    B-->>F: Alertas de estudiantes
    F-->>P: Mostrar estudiantes con alertas
```

---

## 8. Tecnologías Utilizadas

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: Supabase (PostgreSQL)
- **NLP**:
  - Transformers (Hugging Face)
  - NLTK
  - Modelos: BETO, BERT multilingual
- **Análisis**:
  - Pandas
  - Matplotlib
- **Email**: SMTP (Gmail)

### Frontend
- **Framework**: React 18
- **Lenguaje**: TypeScript
- **Routing**: React Router v6
- **Estado**: Zustand
- **Estilos**: Tailwind CSS
- **HTTP**: Axios

### Infraestructura
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (opcional)

---

## 9. Casos de Uso Críticos

### 9.1 Detección de Riesgo Suicida
1. Estudiante escribe nota con palabras como "suicidio" o "no quiero vivir"
2. NLP analiza y guarda la nota
3. Alert Service detecta palabras severas en background
4. Sistema envía email inmediato al psicólogo asignado
5. Psicólogo recibe alerta con contexto de la nota
6. Dashboard del psicólogo muestra estudiante con RIESGO ALTO

### 9.2 Recomendaciones Adaptativas
1. Estudiante tiene 7 de 10 últimas notas con emoción "tristeza"
2. Sistema identifica tristeza como emoción predominante
3. Usuario tiene gustos registrados: "música", "lectura"
4. Algoritmo filtra recomendaciones para tristeza + gustos del usuario
5. Frontend muestra recomendaciones personalizadas:
   - Canciones relajantes (gusto: música)
   - Lecturas motivacionales (gusto: lectura)
   - Actividades de bienestar

### 9.3 Seguimiento Longitudinal
1. Psicólogo accede a análisis de estudiante
2. Sistema genera gráficos de evolución emocional
3. Visualiza tendencias: ¿Mejora o empeora?
4. Exporta CSV con datos completos para análisis externo
5. Toma decisiones informadas sobre intervención

---

## Resumen de Endpoints Principales

### Autenticación
- `POST /login` - Iniciar sesión

### Usuarios
- `POST /usuarios/estudiantes` - Crear estudiante
- `POST /usuarios/psicologos` - Crear psicólogo
- `GET /usuarios/psychologist/students` - Listar estudiantes
- `GET /usuarios/psychologist/students-alerts` - Estudiantes con alertas

### Notas
- `GET /notas/:user_id` - Obtener notas de un usuario
- `POST /notas` - Guardar nota (con análisis NLP)

### Citas
- `POST /citas` - Crear cita (solo estudiantes)
- `GET /citas/pendientes` - Citas sin asignar
- `GET /citas/usuario/:id_usuario` - Citas de un usuario
- `PUT /citas/:id_cita/asignar-psicologo` - Asignar psicólogo
- `PUT /citas/:id_cita` - Actualizar cita
- `DELETE /citas/:id_cita` - Eliminar cita

### Recomendaciones
- `GET /recomendaciones/:user_id` - Recomendaciones personalizadas
- `GET /recomendaciones/favoritos/:user_id` - Favoritos del usuario
- `POST /likes/:user_id/:recomendacion_id` - Agregar like
- `DELETE /likes/:user_id/:recomendacion_id` - Quitar like

### Análisis
- `GET /analyze/:user_id` - Análisis con gráficos
- `GET /export/:user_id` - Exportar reporte CSV

---

**Fecha de Creación**: 2025-12-04
**Sistema**: UNAYOE - Plataforma de Apoyo Psicológico Universitario
