# Documentación del Sistema de Citas - UNAYOE

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Arquitectura General](#arquitectura-general)
3. [Backend - API](#backend---api)
4. [Frontend - Interfaz de Usuario](#frontend---interfaz-de-usuario)
5. [Flujo de Datos](#flujo-de-datos)
6. [Guía de Integración](#guía-de-integración)

---

## Introducción

Este documento describe la implementación completa del sistema de gestión de citas médicas/psicológicas entre estudiantes y psicólogos. El sistema permite:

- Crear citas por parte de estudiantes
- Asignar psicólogos a citas
- Gestionar el estado de las citas
- Consultar citas por usuario y rol
- Actualizar y eliminar citas con validación de permisos

---

## Arquitectura General

### Stack Tecnológico

**Backend:**
- FastAPI (Python)
- Supabase (Base de datos PostgreSQL)
- Pydantic (Validación de datos)

**Frontend:**
- React + TypeScript
- Zustand (Gestión de estado)
- React Router (Enrutamiento)
- Tailwind CSS (Estilos)

### Base de Datos

**Tabla: `citas`**

```sql
CREATE TABLE citas (
  id_cita SERIAL PRIMARY KEY,
  titulo VARCHAR NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_cita TIMESTAMP NOT NULL,
  id_usuario UUID NOT NULL REFERENCES usuarios(id),
  id_psicologo UUID REFERENCES usuarios(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_psicologo) REFERENCES usuarios(id)
);
```

**Campos:**
- `id_cita`: ID autoincremental de la cita
- `titulo`: Título o motivo de la cita
- `fecha_creacion`: Fecha de creación automática
- `fecha_cita`: Fecha y hora programada para la cita
- `id_usuario`: ID del estudiante que crea la cita
- `id_psicologo`: ID del psicólogo asignado (nullable)

**Tabla relacionada: `usuarios`**
- Contiene campos: `id`, `rol`, `nombre`, `apellido`, `correo_institucional`, `especialidad` (para psicólogos)

---

## Backend - API

### Estructura de Archivos

```
backend/
├── app/
│   ├── routers/
│   │   └── appointments.py          # Endpoints de citas
│   ├── services/
│   │   └── appointments_service.py  # Lógica de negocio
│   ├── models/
│   │   └── schemas.py               # Modelos Pydantic
│   └── db/
│       └── supabase.py              # Cliente de Supabase
```

### 1. Schemas (Modelos de Datos)

**Ubicación:** `backend/app/models/schemas.py`

#### CitaCreate
```python
class CitaCreate(BaseModel):
    titulo: str = Field(..., min_length=1, description="Título de la cita")
    fecha_cita: datetime = Field(..., description="Fecha y hora de la cita")
```

**Uso:** Crear una nueva cita

#### CitaUpdate
```python
class CitaUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, description="Título de la cita")
    fecha_cita: Optional[datetime] = Field(None, description="Fecha y hora de la cita")
```

**Uso:** Actualizar parcialmente una cita existente

#### CitaAsignarPsicologo
```python
class CitaAsignarPsicologo(BaseModel):
    id_psicologo: str = Field(..., description="ID del psicólogo a asignar")
```

**Uso:** Asignar un psicólogo a una cita pendiente

#### CitaResponse
```python
class CitaResponse(BaseModel):
    id_cita: int
    titulo: str
    fecha_creacion: datetime
    fecha_cita: datetime
    id_usuario: str
    id_psicologo: Optional[str] = None
    nombre_usuario: Optional[str] = None
    apellido_usuario: Optional[str] = None
    correo_usuario: Optional[str] = None
    nombre_psicologo: Optional[str] = None
    apellido_psicologo: Optional[str] = None
    especialidad_psicologo: Optional[str] = None
```

**Uso:** Respuesta completa con información de la cita

### 2. Endpoints (Rutas)

**Ubicación:** `backend/app/routers/appointments.py`

#### POST `/citas` - Crear Cita

```python
@router.post("", response_model=CitaResponse)
async def crear_cita(
    cita_data: CitaCreate,
    id_usuario: str = Query(..., description="ID del usuario que crea la cita"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Restricción:** Solo estudiantes pueden crear citas

**Request:**
```json
{
  "titulo": "Consulta por ansiedad",
  "fecha_cita": "2025-12-15T10:00:00"
}
```

**Query Params:**
- `id_usuario`: ID del estudiante

**Response:** Objeto `CitaResponse`

#### GET `/citas/pendientes` - Obtener Citas Pendientes

```python
@router.get("/pendientes")
async def obtener_citas_pendientes(
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Descripción:** Retorna citas sin psicólogo asignado (`id_psicologo` IS NULL)

**Response:**
```json
{
  "message": "Citas pendientes recuperadas con éxito",
  "data": [
    {
      "id_cita": 1,
      "titulo": "Consulta por ansiedad",
      "fecha_cita": "2025-12-15T10:00:00",
      "id_usuario": "uuid-estudiante",
      "id_psicologo": null,
      "usuarios": {
        "nombre": "Juan",
        "apellido": "Pérez",
        "correo_institucional": "juan@univ.edu"
      }
    }
  ]
}
```

#### GET `/citas/todas` - Obtener Todas las Citas

```python
@router.get("/todas")
async def obtener_todas_las_citas(
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Response:**
```json
{
  "message": "Todas las citas recuperadas con éxito",
  "data": [...]
}
```

#### GET `/citas/usuario/{id_usuario}` - Obtener Citas de Usuario

```python
@router.get("/usuario/{id_usuario}")
async def obtener_citas_usuario(
    id_usuario: str,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Lógica por Rol:**
- **Estudiante:** Retorna citas donde `id_usuario = {id_usuario}`
- **Psicólogo:** Retorna citas donde `id_psicologo = {id_usuario}`
- **Otro rol:** Retorna todas las citas

**Response:**
```json
{
  "message": "Citas del usuario recuperadas con éxito",
  "data": [...]
}
```

#### GET `/citas/{id_cita}` - Obtener Cita por ID

```python
@router.get("/{id_cita}", response_model=CitaResponse)
async def obtener_cita_por_id(
    id_cita: int,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Response:** Objeto `CitaResponse`

#### PUT `/citas/{id_cita}/asignar-psicologo` - Asignar Psicólogo

```python
@router.put("/{id_cita}/asignar-psicologo", response_model=CitaResponse)
async def asignar_psicologo(
    id_cita: int,
    asignacion: CitaAsignarPsicologo,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Validación:** Verifica que el `id_psicologo` corresponda a un usuario con rol "psicologo"

**Request:**
```json
{
  "id_psicologo": "uuid-psicologo"
}
```

**Response:** Objeto `CitaResponse` actualizado

#### PUT `/citas/{id_cita}` - Actualizar Cita

```python
@router.put("/{id_cita}", response_model=CitaResponse)
async def actualizar_cita(
    id_cita: int,
    cita_update: CitaUpdate,
    id_usuario: str = Query(..., description="ID del usuario que actualiza"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Restricción:** Solo el creador de la cita puede actualizarla

**Request:**
```json
{
  "titulo": "Consulta por depresión",
  "fecha_cita": "2025-12-16T11:00:00"
}
```

**Query Params:**
- `id_usuario`: ID del usuario que intenta actualizar

**Response:** Objeto `CitaResponse` actualizado

#### DELETE `/citas/{id_cita}` - Eliminar Cita

```python
@router.delete("/{id_cita}", response_model=MessageResponse)
async def eliminar_cita(
    id_cita: int,
    id_usuario: str = Query(..., description="ID del usuario que elimina"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
)
```

**Restricción:** Solo el creador de la cita puede eliminarla

**Query Params:**
- `id_usuario`: ID del usuario que intenta eliminar

**Response:**
```json
{
  "message": "Cita eliminada con éxito"
}
```

#### GET `/citas/psicologos/disponibles` - Obtener Psicólogos Disponibles

```python
@router.get("/psicologos/disponibles")
async def obtener_psicologos_disponibles(
    users_service: UsersService = Depends(get_users_service)
)
```

**Nota:** Este endpoint utiliza `UsersService` (no `AppointmentsService`)

**Response:**
```json
{
  "message": "Psicólogos disponibles recuperados con éxito",
  "data": [
    {
      "id": "uuid-psicologo",
      "nombre": "María",
      "apellido": "González",
      "especialidad": "Psicología Clínica"
    }
  ]
}
```

### 3. Servicio (Lógica de Negocio)

**Ubicación:** `backend/app/services/appointments_service.py`

#### Clase AppointmentsService

```python
class AppointmentsService:
    def __init__(self):
        self.supabase = get_supabase_client()
```

**Métodos principales:**

##### crear_cita(cita_data: CitaCreate, id_usuario: str)

1. Verifica que el usuario sea estudiante
2. Inserta la cita en la base de datos
3. Retorna la cita creada

**Validaciones:**
- El usuario debe tener rol "estudiante"

**Query Supabase:**
```python
self.supabase.table("citas").insert({
    "titulo": cita_data.titulo,
    "fecha_cita": cita_data.fecha_cita.isoformat(),
    "id_usuario": id_usuario
}).execute()
```

##### obtener_citas_pendientes()

Retorna citas con `id_psicologo IS NULL` e incluye información del estudiante

**Query Supabase:**
```python
self.supabase.table("citas")\
    .select("*, usuarios:id_usuario(nombre, apellido, correo_institucional)")\
    .is_("id_psicologo", "null")\
    .execute()
```

##### obtener_citas_usuario(id_usuario: str)

1. Obtiene el rol del usuario
2. Filtra las citas según el rol:
   - **Estudiante:** `id_usuario = {id_usuario}`
   - **Psicólogo:** `id_psicologo = {id_usuario}`
   - **Otro:** Todas las citas

##### asignar_psicologo(id_cita: int, asignacion: CitaAsignarPsicologo)

1. Verifica que el ID corresponda a un psicólogo
2. Actualiza la cita con el `id_psicologo`

**Validaciones:**
- El `id_psicologo` debe tener rol "psicologo"

##### actualizar_cita(id_cita: int, cita_update: CitaUpdate, id_usuario: str)

1. Obtiene la cita actual
2. Verifica que el `id_usuario` sea el creador
3. Actualiza solo los campos proporcionados

**Validaciones:**
- Solo el creador (`id_usuario`) puede actualizar

##### eliminar_cita(id_cita: int, id_usuario: str)

1. Obtiene la cita actual
2. Verifica que el `id_usuario` sea el creador
3. Elimina la cita

**Validaciones:**
- Solo el creador (`id_usuario`) puede eliminar

### 4. Manejo de Errores

Todos los métodos manejan errores con:

```python
try:
    # Lógica
except HTTPException:
    raise  # Re-lanza excepciones HTTP
except Exception as e:
    raise HTTPException(
        status_code=500,
        detail=f"Error al [operación]: {str(e)}"
    )
```

**Códigos de estado:**
- `403`: Forbidden (no tiene permisos)
- `404`: Not Found (recurso no encontrado)
- `500`: Internal Server Error

---

## Frontend - Interfaz de Usuario

### Estructura de Archivos

```
frontend/src/features/appointments/
├── components/
│   ├── AppointmentCard.tsx      # Tarjeta individual de cita
│   ├── AppointmentForm.tsx      # Formulario crear/editar cita
│   ├── AppointmentList.tsx      # Lista de citas
│   └── index.ts                 # Exportaciones
├── hooks/
│   └── useAppointments.ts       # Hook personalizado
├── pages/
│   ├── AppointmentsPage.tsx     # Página principal
│   └── index.ts                 # Exportaciones
├── services/
│   └── appointmentsService.ts   # Cliente API
├── store/
│   └── appointmentsStore.ts     # Estado global (Zustand)
└── index.ts                     # Exportaciones del módulo
```

### 1. Tipos de Datos

**Ubicación:** `frontend/src/core/types/index.ts`

#### Appointment
```typescript
export interface Appointment {
  id_cita: number;
  titulo: string;
  fecha_cita: string;  // ISO 8601 string
  id_usuario: string;
  id_psicologo?: string;
  nombre_psicologo?: string;
  apellido_psicologo?: string;
  especialidad_psicologo?: string;
  estado?: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
}
```

#### AppointmentInput
```typescript
export interface AppointmentInput {
  titulo: string;
  fecha_cita: string;  // ISO 8601 string
}
```

#### AppointmentsResponse
```typescript
export interface AppointmentsResponse {
  citas_creadas: Appointment[];
  citas_asignadas: Appointment[];
}
```

#### Psychologist
```typescript
export interface Psychologist {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string;
}
```

### 2. Servicio de API

**Ubicación:** `frontend/src/features/appointments/services/appointmentsService.ts`

#### Clase AppointmentsService

Métodos disponibles:

```typescript
class AppointmentsService {
  // Crear cita
  async createAppointment(
    userId: string,
    appointmentData: AppointmentInput
  ): Promise<Appointment>

  // Obtener citas pendientes
  async getPendingAppointments(): Promise<Appointment[]>

  // Obtener todas las citas
  async getAllAppointments(): Promise<Appointment[]>

  // Obtener citas de un usuario
  async getUserAppointments(userId: string): Promise<AppointmentsResponse>

  // Obtener detalle de cita
  async getAppointmentDetail(appointmentId: number): Promise<Appointment>

  // Asignar psicólogo
  async assignPsychologist(
    appointmentId: number,
    psychologistId: string
  ): Promise<Appointment>

  // Actualizar cita
  async updateAppointment(
    appointmentId: number,
    userId: string,
    appointmentData: Partial<AppointmentInput>
  ): Promise<Appointment>

  // Eliminar cita
  async deleteAppointment(
    appointmentId: number,
    userId: string
  ): Promise<void>

  // Obtener psicólogos disponibles
  async getAvailablePsychologists(): Promise<Psychologist[]>
}
```

**Uso del cliente API:**

```typescript
import { get, post, put, del } from '../../../core/api/client';

// Ejemplo: Crear cita
const response = await post<Appointment>(
  `/citas?id_usuario=${userId}`,
  appointmentData
);
```

**Nota:** Los métodos `get`, `post`, `put`, `del` manejan automáticamente:
- Headers de autenticación
- Parsing de respuestas
- Manejo de errores HTTP

### 3. Store (Gestión de Estado)

**Ubicación:** `frontend/src/features/appointments/store/appointmentsStore.ts`

#### Estado Global con Zustand

```typescript
interface AppointmentsState {
  appointments: Appointment[];
  availablePsychologists: any[];
  isLoading: boolean;
  error: string | null;
}

interface AppointmentsActions {
  setAppointments: (appointments: Appointment[]) => void;
  setAvailablePsychologists: (psychologists: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAppointments: (userId: string) => Promise<void>;
  fetchAvailablePsychologists: () => Promise<void>;
  createAppointment: (appointmentData: any) => Promise<boolean>;
  updateAppointment: (appointmentId: number, appointmentData: any) => Promise<boolean>;
  deleteAppointment: (appointmentId: number) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}
```

**Uso:**

```typescript
import { useAppointmentsStore } from '../store/appointmentsStore';

const {
  appointments,
  isLoading,
  createAppointment,
  fetchAppointments
} = useAppointmentsStore();
```

**Acciones importantes:**

##### fetchAppointments(userId: string)
```typescript
// Obtiene citas del usuario y actualiza el estado
await fetchAppointments(user.id);
```

##### createAppointment(appointmentData)
```typescript
const success = await createAppointment({
  titulo: "Consulta",
  fecha_cita: "2025-12-15T10:00:00"
});
// Retorna: true si fue exitoso, false si hubo error
```

##### deleteAppointment(appointmentId)
```typescript
const success = await deleteAppointment(123);
// Actualiza el estado eliminando la cita de la lista
```

**Nota sobre el código actual:**

El store tiene una inconsistencia en la línea 61:
```typescript
const appointments = await appointmentsService.getAppointmentsByUser(userId);
```

Este método no existe en `appointmentsService`. Debería ser:
```typescript
const response = await appointmentsService.getUserAppointments(userId);
const appointments = [...response.citas_creadas, ...response.citas_asignadas];
```

### 4. Hook Personalizado

**Ubicación:** `frontend/src/features/appointments/hooks/useAppointments.ts`

Simplifica el acceso al store:

```typescript
export const useAppointments = () => {
  const {
    appointments,
    availablePsychologists,
    isLoading,
    error,
    fetchAppointments,
    fetchAvailablePsychologists,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    clearError,
    reset,
  } = useAppointmentsStore();

  return {
    appointments,
    availablePsychologists,
    isLoading,
    error,
    fetchAppointments,
    fetchAvailablePsychologists,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    clearError,
    reset,
  };
};
```

**Uso en componentes:**

```typescript
const {
  appointments,
  isLoading,
  createAppointment
} = useAppointments();
```

### 5. Componentes

#### AppointmentCard

**Ubicación:** `frontend/src/features/appointments/components/AppointmentCard.tsx`

**Props:**
```typescript
interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointmentId: number) => void;
  isCancelling?: boolean;
}
```

**Características:**
- Muestra información de la cita en formato tarjeta
- Badge de estado con colores (pendiente, confirmada, completada, cancelada)
- Botón de cancelar (solo para estados pendiente/confirmada)
- Formato de fecha/hora amigable

**Estados visuales:**
```typescript
const getStatusConfig = (status: string) => {
  const configs = {
    pendiente: { variant: 'warning', label: 'Pendiente' },
    confirmada: { variant: 'success', label: 'Confirmada' },
    completada: { variant: 'secondary', label: 'Completada' },
    cancelada: { variant: 'destructive', label: 'Cancelada' },
  };
  return configs[status] || configs.pendiente;
};
```

#### AppointmentList

**Ubicación:** `frontend/src/features/appointments/components/AppointmentList.tsx`

**Props:**
```typescript
interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onCancel?: (appointmentId: number) => void;
  cancellingId?: number | null;
}
```

**Características:**
- Muestra lista de `AppointmentCard`
- Estados de carga con skeletons
- Estado vacío con ilustración
- Manejo de cancelación individual

**Estados visuales:**
- **Loading:** Muestra 3 skeletons
- **Empty:** Mensaje "No hay citas registradas" con ícono
- **With data:** Lista de tarjetas

#### AppointmentForm

**Ubicación:** `frontend/src/features/appointments/components/AppointmentForm.tsx`

**Props:**
```typescript
interface AppointmentFormProps {
  onSubmit: (appointmentData: any) => Promise<void>;
  isLoading?: boolean;
  psychologists?: any[];
  initialData?: any;
  submitLabel?: string;
}
```

**Campos del formulario:**

1. **Motivo** (textarea)
   - Requerido
   - Mínimo 10 caracteres
   - Placeholder: "Describe brevemente el motivo de tu consulta..."

2. **Fecha y hora** (datetime-local)
   - Requerido
   - Debe ser fecha futura
   - Mínimo: fecha/hora actual

3. **Psicólogo** (select - opcional)
   - Solo si hay psicólogos disponibles
   - Opción por defecto: "Asignar automáticamente"

**Validaciones:**

```typescript
const validateForm = (): boolean => {
  // Motivo requerido y mínimo 10 caracteres
  if (!formData.motivo.trim()) {
    newErrors.motivo = 'El motivo es requerido';
  } else if (formData.motivo.length < 10) {
    newErrors.motivo = 'El motivo debe tener al menos 10 caracteres';
  }

  // Fecha debe ser futura
  if (!formData.fecha_hora) {
    newErrors.fecha_hora = 'La fecha y hora son requeridas';
  } else {
    const selectedDate = new Date(formData.fecha_hora);
    const now = new Date();
    if (selectedDate < now) {
      newErrors.fecha_hora = 'La fecha debe ser futura';
    }
  }

  // Psicólogo opcional
  if (!formData.psicologo_id && psychologists.length > 0) {
    newErrors.psicologo_id = 'Selecciona un psicólogo';
  }

  return Object.values(newErrors).every((error) => !error);
};
```

### 6. Página Principal

**Ubicación:** `frontend/src/features/appointments/pages/AppointmentsPage.tsx`

#### Funcionalidad Principal

1. **Carga inicial de datos:**
```typescript
useEffect(() => {
  if (user?.id) {
    fetchAppointments(user.id);
    fetchAvailablePsychologists();
  }
}, [user?.id]);
```

2. **Crear cita:**
```typescript
const handleCreateAppointment = async (appointmentData: any) => {
  if (!user?.id) return;

  const success = await createAppointment({
    ...appointmentData,
    estudiante_id: user.id,
  });

  if (success) {
    showSuccess('Cita solicitada exitosamente');
    setIsNewModalOpen(false);
  } else {
    showError('Error al solicitar la cita');
  }
};
```

3. **Cancelar cita:**
```typescript
const handleCancelAppointment = async (appointmentId: number) => {
  const confirmed = window.confirm('¿Estás seguro de cancelar esta cita?');
  if (!confirmed) return;

  setCancellingId(appointmentId);
  const success = await deleteAppointment(appointmentId);

  if (success) {
    showSuccess('Cita cancelada exitosamente');
  } else {
    showError('Error al cancelar la cita');
  }
  setCancellingId(null);
};
```

4. **Filtrado de citas:**
```typescript
const filteredAppointments = React.useMemo(() => {
  if (filter === 'all') return appointments;
  return appointments.filter((app) => app.estado === filter);
}, [appointments, filter]);
```

**Filtros disponibles:**
- Todas
- Pendientes
- Confirmadas
- Completadas
- Canceladas

#### Elementos UI

1. **Header:**
   - Título "Mis Citas"
   - Descripción
   - Botón "Nueva cita"

2. **Card informativa:**
   - Información sobre el servicio
   - Políticas de cancelación

3. **Filtros:**
   - Botones para filtrar por estado

4. **Lista de citas:**
   - `AppointmentList` con citas filtradas

5. **Modal de creación:**
   - `AppointmentForm` para nueva cita

### 7. Rutas

**Ubicación:** `frontend/src/app/router/routes.tsx`

#### Ruta de Estudiante

```typescript
{
  element: (
    <ProtectedRoute requiredRole="estudiante">
      <StudentLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/appointments',
      element: <AppointmentsPage />,
    },
    // ... otras rutas
  ],
}
```

**Características:**
- Requiere rol "estudiante"
- Lazy loading del componente
- Layout específico de estudiante

**Lazy loading:**

```typescript
const AppointmentsPage = lazy(() =>
  import('../../features/appointments/pages').then((module) => ({
    default: module.AppointmentsPage,
  }))
);
```

---

## Flujo de Datos

### 1. Crear Cita (Estudiante)

```
[Usuario] Formulario
    ↓
[Frontend] AppointmentForm.handleSubmit
    ↓
[Frontend] AppointmentsPage.handleCreateAppointment
    ↓
[Frontend Store] createAppointment(appointmentData)
    ↓
[Frontend Service] appointmentsService.createAppointment(userId, data)
    ↓
[API Client] POST /citas?id_usuario={userId}
    ↓
[Backend Router] crear_cita(cita_data, id_usuario)
    ↓
[Backend Service] appointments_service.crear_cita(cita_data, id_usuario)
    ↓
[Validación] Verifica que usuario es estudiante
    ↓
[Database] Supabase.table("citas").insert({...})
    ↓
[Response] Retorna cita creada
    ↓
[Frontend Store] Agrega cita al estado
    ↓
[Frontend UI] Actualiza lista y muestra toast de éxito
```

### 2. Listar Citas de Usuario

```
[Usuario] Carga página de citas
    ↓
[Frontend] useEffect en AppointmentsPage
    ↓
[Frontend Store] fetchAppointments(userId)
    ↓
[Frontend Service] appointmentsService.getUserAppointments(userId)
    ↓
[API Client] GET /citas/usuario/{userId}
    ↓
[Backend Router] obtener_citas_usuario(id_usuario)
    ↓
[Backend Service] appointments_service.obtener_citas_usuario(id_usuario)
    ↓
[Validación] Obtiene rol del usuario
    ↓
[Database Query según rol]
  - Estudiante: WHERE id_usuario = {userId}
  - Psicólogo: WHERE id_psicologo = {userId}
  - Otro: Todas
    ↓
[Response] Retorna lista de citas
    ↓
[Frontend Store] Actualiza estado de appointments
    ↓
[Frontend UI] Renderiza AppointmentList con datos
```

### 3. Asignar Psicólogo (Admin/Psicólogo)

```
[Usuario Psicólogo] Selecciona cita pendiente
    ↓
[Frontend] Formulario de asignación
    ↓
[Frontend Service] appointmentsService.assignPsychologist(appointmentId, psychologistId)
    ↓
[API Client] PUT /citas/{appointmentId}/asignar-psicologo
    ↓
[Backend Router] asignar_psicologo(id_cita, asignacion)
    ↓
[Backend Service] appointments_service.asignar_psicologo(id_cita, asignacion)
    ↓
[Validación] Verifica que id_psicologo es un psicólogo válido
    ↓
[Database] Supabase.table("citas").update({id_psicologo: ...})
    ↓
[Response] Retorna cita actualizada
    ↓
[Frontend] Actualiza UI con nueva información
```

### 4. Cancelar Cita (Estudiante)

```
[Usuario] Click en "Cancelar cita"
    ↓
[Frontend UI] window.confirm("¿Estás seguro?")
    ↓
[Frontend] AppointmentsPage.handleCancelAppointment
    ↓
[Frontend Store] deleteAppointment(appointmentId)
    ↓
[Frontend Service] appointmentsService.deleteAppointment(appointmentId, userId)
    ↓
[API Client] DELETE /citas/{appointmentId}?id_usuario={userId}
    ↓
[Backend Router] eliminar_cita(id_cita, id_usuario)
    ↓
[Backend Service] appointments_service.eliminar_cita(id_cita, id_usuario)
    ↓
[Validación] Verifica que id_usuario es el creador
    ↓
[Database] Supabase.table("citas").delete().eq("id_cita", ...)
    ↓
[Response] {"message": "Cita eliminada con éxito"}
    ↓
[Frontend Store] Elimina cita del estado
    ↓
[Frontend UI] Actualiza lista y muestra toast de éxito
```

---

## Guía de Integración

Esta sección proporciona instrucciones para integrar el sistema de citas en un proyecto con estructura diferente.

### Parte 1: Backend (FastAPI)

#### Paso 1: Configurar Base de Datos

Crear la tabla `citas`:

```sql
CREATE TABLE citas (
  id_cita SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cita TIMESTAMP NOT NULL,
  id_usuario UUID NOT NULL,
  id_psicologo UUID,
  CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  CONSTRAINT fk_psicologo FOREIGN KEY (id_psicologo) REFERENCES usuarios(id)
);

-- Índices recomendados
CREATE INDEX idx_citas_usuario ON citas(id_usuario);
CREATE INDEX idx_citas_psicologo ON citas(id_psicologo);
CREATE INDEX idx_citas_fecha ON citas(fecha_cita);
```

#### Paso 2: Crear Modelos Pydantic

En tu archivo de schemas (puede tener otro nombre como `models.py`, `schemas.py`, etc.):

```python
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CitaCreate(BaseModel):
    titulo: str = Field(..., min_length=1)
    fecha_cita: datetime

class CitaUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1)
    fecha_cita: Optional[datetime] = None

class CitaAsignarPsicologo(BaseModel):
    id_psicologo: str

class CitaResponse(BaseModel):
    id_cita: int
    titulo: str
    fecha_creacion: datetime
    fecha_cita: datetime
    id_usuario: str
    id_psicologo: Optional[str] = None
    # Campos adicionales según necesites
```

#### Paso 3: Implementar Servicio

Crear un archivo de servicio (ej: `appointments_service.py`, `citas_service.py`):

```python
from typing import List, Dict, Any
from fastapi import HTTPException

class AppointmentsService:
    def __init__(self, db_client):
        """
        db_client puede ser:
        - Supabase client
        - SQLAlchemy session
        - Cualquier cliente de base de datos
        """
        self.db = db_client

    def crear_cita(self, cita_data: CitaCreate, id_usuario: str) -> Dict[str, Any]:
        """
        IMPORTANTE:
        1. Verificar que el usuario tenga rol "estudiante"
        2. Insertar en la base de datos
        3. Manejar errores apropiadamente
        """
        # Ejemplo con Supabase:
        usuario = self.db.table("usuarios")\
            .select("rol")\
            .eq("id", id_usuario)\
            .single()\
            .execute()

        if not usuario.data or usuario.data.get("rol") != "estudiante":
            raise HTTPException(status_code=403, detail="Solo estudiantes pueden crear citas")

        response = self.db.table("citas").insert({
            "titulo": cita_data.titulo,
            "fecha_cita": cita_data.fecha_cita.isoformat(),
            "id_usuario": id_usuario
        }).execute()

        return response.data[0] if response.data else {}

    def obtener_citas_pendientes(self) -> List[Dict[str, Any]]:
        """Retorna citas sin psicólogo asignado"""
        # Implementación según tu ORM/cliente DB
        pass

    def obtener_citas_usuario(self, id_usuario: str) -> List[Dict[str, Any]]:
        """
        IMPORTANTE:
        - Si es estudiante: filtrar por id_usuario
        - Si es psicólogo: filtrar por id_psicologo
        - Si es admin: retornar todas
        """
        pass

    def asignar_psicologo(self, id_cita: int, asignacion: CitaAsignarPsicologo) -> Dict[str, Any]:
        """
        IMPORTANTE:
        1. Verificar que id_psicologo sea un psicólogo válido
        2. Actualizar la cita
        """
        pass

    def actualizar_cita(self, id_cita: int, cita_update: CitaUpdate, id_usuario: str) -> Dict[str, Any]:
        """
        IMPORTANTE:
        - Solo el creador puede actualizar
        - Validar permisos antes de actualizar
        """
        pass

    def eliminar_cita(self, id_cita: int, id_usuario: str) -> Dict[str, str]:
        """
        IMPORTANTE:
        - Solo el creador puede eliminar
        - Validar permisos antes de eliminar
        """
        pass
```

#### Paso 4: Crear Endpoints

En tu archivo de rutas (puede ser `routers.py`, `routes.py`, `api.py`, etc.):

```python
from fastapi import APIRouter, Depends, Query, HTTPException

router = APIRouter(prefix="/citas", tags=["Citas"])

# Dependencia para obtener el servicio
def get_appointments_service():
    # Retorna instancia del servicio
    # Puede inyectar dependencias (DB session, etc.)
    pass

@router.post("", response_model=CitaResponse)
async def crear_cita(
    cita_data: CitaCreate,
    id_usuario: str = Query(..., description="ID del usuario que crea la cita"),
    service = Depends(get_appointments_service)
):
    return service.crear_cita(cita_data, id_usuario)

@router.get("/pendientes")
async def obtener_citas_pendientes(service = Depends(get_appointments_service)):
    citas = service.obtener_citas_pendientes()
    return {"message": "Citas pendientes recuperadas", "data": citas}

@router.get("/usuario/{id_usuario}")
async def obtener_citas_usuario(
    id_usuario: str,
    service = Depends(get_appointments_service)
):
    citas = service.obtener_citas_usuario(id_usuario)
    return {"message": "Citas del usuario recuperadas", "data": citas}

@router.get("/{id_cita}", response_model=CitaResponse)
async def obtener_cita_por_id(
    id_cita: int,
    service = Depends(get_appointments_service)
):
    return service.obtener_cita_por_id(id_cita)

@router.put("/{id_cita}/asignar-psicologo", response_model=CitaResponse)
async def asignar_psicologo(
    id_cita: int,
    asignacion: CitaAsignarPsicologo,
    service = Depends(get_appointments_service)
):
    return service.asignar_psicologo(id_cita, asignacion)

@router.put("/{id_cita}", response_model=CitaResponse)
async def actualizar_cita(
    id_cita: int,
    cita_update: CitaUpdate,
    id_usuario: str = Query(...),
    service = Depends(get_appointments_service)
):
    return service.actualizar_cita(id_cita, cita_update, id_usuario)

@router.delete("/{id_cita}")
async def eliminar_cita(
    id_cita: int,
    id_usuario: str = Query(...),
    service = Depends(get_appointments_service)
):
    return service.eliminar_cita(id_cita, id_usuario)

@router.get("/psicologos/disponibles")
async def obtener_psicologos_disponibles(
    # Dependencia de servicio de usuarios
):
    # Retornar psicólogos disponibles
    pass
```

#### Paso 5: Registrar el Router

En tu archivo principal (`main.py`, `app.py`, etc.):

```python
from fastapi import FastAPI
from .routers import appointments_router  # Ajusta el import según tu estructura

app = FastAPI()

app.include_router(appointments_router)
```

### Parte 2: Frontend (React + TypeScript)

#### Estructura Recomendada

Puedes adaptar esta estructura a tu proyecto:

```
src/
├── features/
│   └── appointments/            # O el nombre que uses
│       ├── api/                 # Servicios de API
│       │   └── appointmentsApi.ts
│       ├── components/          # Componentes UI
│       │   ├── AppointmentCard.tsx
│       │   ├── AppointmentForm.tsx
│       │   └── AppointmentList.tsx
│       ├── hooks/               # Hooks personalizados
│       │   └── useAppointments.ts
│       ├── pages/               # Páginas
│       │   └── AppointmentsPage.tsx
│       ├── store/               # Estado global
│       │   └── appointmentsStore.ts
│       └── types/               # Tipos TypeScript
│           └── appointment.types.ts
```

#### Paso 1: Definir Tipos

Archivo: `appointment.types.ts` (o en tu archivo de tipos global)

```typescript
export interface Appointment {
  id_cita: number;
  titulo: string;
  fecha_cita: string;  // ISO string
  id_usuario: string;
  id_psicologo?: string;
  nombre_psicologo?: string;
  apellido_psicologo?: string;
  especialidad_psicologo?: string;
  estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentInput {
  titulo: string;
  fecha_cita: string;
}

export interface Psychologist {
  id: string;
  nombre: string;
  apellido: string;
  especialidad?: string;
}
```

#### Paso 2: Crear Servicio de API

Archivo: `appointmentsApi.ts`

```typescript
// Ajusta según tu cliente HTTP (axios, fetch, etc.)
import { apiClient } from '@/lib/api-client';  // Tu cliente HTTP

class AppointmentsService {
  async createAppointment(userId: string, data: AppointmentInput): Promise<Appointment> {
    const response = await apiClient.post(`/citas?id_usuario=${userId}`, data);
    return response.data;
  }

  async getPendingAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get('/citas/pendientes');
    return response.data.data;  // Ajusta según tu estructura de respuesta
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    const response = await apiClient.get(`/citas/usuario/${userId}`);
    return response.data.data;
  }

  async getAppointmentById(appointmentId: number): Promise<Appointment> {
    const response = await apiClient.get(`/citas/${appointmentId}`);
    return response.data;
  }

  async assignPsychologist(appointmentId: number, psychologistId: string): Promise<Appointment> {
    const response = await apiClient.put(
      `/citas/${appointmentId}/asignar-psicologo`,
      { id_psicologo: psychologistId }
    );
    return response.data;
  }

  async updateAppointment(
    appointmentId: number,
    userId: string,
    data: Partial<AppointmentInput>
  ): Promise<Appointment> {
    const response = await apiClient.put(
      `/citas/${appointmentId}?id_usuario=${userId}`,
      data
    );
    return response.data;
  }

  async deleteAppointment(appointmentId: number, userId: string): Promise<void> {
    await apiClient.delete(`/citas/${appointmentId}?id_usuario=${userId}`);
  }

  async getAvailablePsychologists(): Promise<Psychologist[]> {
    const response = await apiClient.get('/citas/psicologos/disponibles');
    return response.data.data;
  }
}

export const appointmentsService = new AppointmentsService();
```

#### Paso 3: Crear Store de Estado

Si usas **Zustand**:

```typescript
import { create } from 'zustand';
import { appointmentsService } from '../api/appointmentsApi';
import { Appointment, Psychologist } from '../types/appointment.types';

interface AppointmentsStore {
  // Estado
  appointments: Appointment[];
  psychologists: Psychologist[];
  isLoading: boolean;
  error: string | null;

  // Acciones
  fetchAppointments: (userId: string) => Promise<void>;
  fetchPsychologists: () => Promise<void>;
  createAppointment: (userId: string, data: AppointmentInput) => Promise<boolean>;
  deleteAppointment: (appointmentId: number, userId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAppointmentsStore = create<AppointmentsStore>((set) => ({
  appointments: [],
  psychologists: [],
  isLoading: false,
  error: null,

  fetchAppointments: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const appointments = await appointmentsService.getUserAppointments(userId);
      set({ appointments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchPsychologists: async () => {
    set({ isLoading: true, error: null });
    try {
      const psychologists = await appointmentsService.getAvailablePsychologists();
      set({ psychologists, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createAppointment: async (userId, data) => {
    set({ isLoading: true, error: null });
    try {
      const newAppointment = await appointmentsService.createAppointment(userId, data);
      set((state) => ({
        appointments: [newAppointment, ...state.appointments],
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteAppointment: async (appointmentId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await appointmentsService.deleteAppointment(appointmentId, userId);
      set((state) => ({
        appointments: state.appointments.filter((a) => a.id_cita !== appointmentId),
        isLoading: false,
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
```

Si usas **Redux Toolkit**:

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentsService } from '../api/appointmentsApi';

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (userId: string) => {
    return await appointmentsService.getUserAppointments(userId);
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async ({ userId, data }: { userId: string; data: AppointmentInput }) => {
    return await appointmentsService.createAppointment(userId, data);
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    appointments: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.appointments = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.error = action.error.message;
        state.isLoading = false;
      })
      // ... más casos
  },
});

export default appointmentsSlice.reducer;
```

#### Paso 4: Crear Hook Personalizado

```typescript
import { useAppointmentsStore } from '../store/appointmentsStore';

export const useAppointments = () => {
  // Adapta según tu solución de estado (Zustand, Redux, Context, etc.)
  const store = useAppointmentsStore();

  return {
    appointments: store.appointments,
    psychologists: store.psychologists,
    isLoading: store.isLoading,
    error: store.error,
    fetchAppointments: store.fetchAppointments,
    fetchPsychologists: store.fetchPsychologists,
    createAppointment: store.createAppointment,
    deleteAppointment: store.deleteAppointment,
    clearError: store.clearError,
  };
};
```

#### Paso 5: Crear Componentes

##### AppointmentCard.tsx

```typescript
import { Appointment } from '../types/appointment.types';
import { Card, Badge, Button } from '@/components/ui';  // Tus componentes UI

interface Props {
  appointment: Appointment;
  onCancel?: (id: number) => void;
  isCancelling?: boolean;
}

export const AppointmentCard: React.FC<Props> = ({
  appointment,
  onCancel,
  isCancelling
}) => {
  const canCancel = appointment.estado === 'pendiente' || appointment.estado === 'confirmada';

  return (
    <Card>
      <div>
        <Badge variant={getVariant(appointment.estado)}>
          {appointment.estado}
        </Badge>
        <p>{formatDate(appointment.fecha_cita)}</p>
      </div>

      <div>
        <h4>Motivo:</h4>
        <p>{appointment.titulo}</p>
      </div>

      {appointment.nombre_psicologo && (
        <p>Psicólogo: {appointment.nombre_psicologo}</p>
      )}

      {canCancel && onCancel && (
        <Button
          onClick={() => onCancel(appointment.id_cita)}
          disabled={isCancelling}
        >
          Cancelar cita
        </Button>
      )}
    </Card>
  );
};

function getVariant(estado?: string) {
  // Lógica de colores según estado
}

function formatDate(date: string) {
  // Formatear fecha
}
```

##### AppointmentForm.tsx

```typescript
import { useState } from 'react';
import { AppointmentInput, Psychologist } from '../types/appointment.types';
import { Button, Input, Textarea, Select } from '@/components/ui';

interface Props {
  onSubmit: (data: AppointmentInput) => Promise<void>;
  psychologists?: Psychologist[];
  isLoading?: boolean;
}

export const AppointmentForm: React.FC<Props> = ({
  onSubmit,
  psychologists = [],
  isLoading
}) => {
  const [formData, setFormData] = useState<AppointmentInput>({
    titulo: '',
    fecha_cita: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo || formData.titulo.length < 10) {
      newErrors.titulo = 'El título debe tener al menos 10 caracteres';
    }

    if (!formData.fecha_cita) {
      newErrors.fecha_cita = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.fecha_cita);
      if (selectedDate < new Date()) {
        newErrors.fecha_cita = 'La fecha debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        label="Motivo de la consulta"
        value={formData.titulo}
        onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
        error={errors.titulo}
        required
      />

      <Input
        type="datetime-local"
        label="Fecha y hora"
        value={formData.fecha_cita}
        onChange={(e) => setFormData({ ...formData, fecha_cita: e.target.value })}
        error={errors.fecha_cita}
        min={new Date().toISOString().slice(0, 16)}
        required
      />

      {psychologists.length > 0 && (
        <Select
          label="Psicólogo (opcional)"
          options={[
            { value: '', label: 'Asignar automáticamente' },
            ...psychologists.map((p) => ({
              value: p.id,
              label: `${p.nombre} ${p.apellido}`,
            })),
          ]}
        />
      )}

      <Button type="submit" disabled={isLoading}>
        Solicitar cita
      </Button>
    </form>
  );
};
```

##### AppointmentList.tsx

```typescript
import { Appointment } from '../types/appointment.types';
import { AppointmentCard } from './AppointmentCard';
import { Skeleton } from '@/components/ui';

interface Props {
  appointments: Appointment[];
  isLoading?: boolean;
  onCancel?: (id: number) => void;
  cancellingId?: number | null;
}

export const AppointmentList: React.FC<Props> = ({
  appointments,
  isLoading,
  onCancel,
  cancellingId,
}) => {
  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay citas registradas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id_cita}
          appointment={appointment}
          onCancel={onCancel}
          isCancelling={cancellingId === appointment.id_cita}
        />
      ))}
    </div>
  );
};
```

#### Paso 6: Crear Página Principal

```typescript
import { useEffect, useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '@/features/auth/hooks/useAuth';  // Tu hook de auth
import { AppointmentForm } from '../components/AppointmentForm';
import { AppointmentList } from '../components/AppointmentList';
import { Modal, Button } from '@/components/ui';
import { toast } from '@/lib/toast';  // Tu sistema de notificaciones

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    psychologists,
    isLoading,
    fetchAppointments,
    fetchPsychologists,
    createAppointment,
    deleteAppointment,
  } = useAppointments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
      fetchPsychologists();
    }
  }, [user?.id]);

  const handleCreate = async (data: AppointmentInput) => {
    if (!user?.id) return;

    const success = await createAppointment(user.id, data);

    if (success) {
      toast.success('Cita solicitada exitosamente');
      setIsModalOpen(false);
    } else {
      toast.error('Error al solicitar la cita');
    }
  };

  const handleCancel = async (appointmentId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    if (!user?.id) return;

    setCancellingId(appointmentId);
    const success = await deleteAppointment(appointmentId, user.id);

    if (success) {
      toast.success('Cita cancelada');
    } else {
      toast.error('Error al cancelar');
    }
    setCancellingId(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Nueva cita
        </Button>
      </div>

      <AppointmentList
        appointments={appointments}
        isLoading={isLoading}
        onCancel={handleCancel}
        cancellingId={cancellingId}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solicitar Nueva Cita"
      >
        <AppointmentForm
          onSubmit={handleCreate}
          psychologists={psychologists}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
};
```

#### Paso 7: Configurar Rutas

```typescript
// En tu archivo de rutas (routes.tsx, App.tsx, etc.)
import { lazy } from 'react';

const AppointmentsPage = lazy(() =>
  import('@/features/appointments/pages/AppointmentsPage')
    .then(module => ({ default: module.AppointmentsPage }))
);

// Agregar a tu configuración de rutas
{
  path: '/appointments',
  element: (
    <ProtectedRoute role="estudiante">
      <AppointmentsPage />
    </ProtectedRoute>
  ),
}
```

---

## Consideraciones Importantes

### Seguridad

1. **Autenticación:**
   - Todos los endpoints deben validar autenticación
   - Usar tokens JWT o sesiones seguras

2. **Autorización:**
   - Verificar roles antes de operaciones
   - Solo estudiantes crean citas
   - Solo creadores pueden actualizar/eliminar
   - Solo psicólogos válidos pueden ser asignados

3. **Validación:**
   - Validar todos los datos de entrada
   - Sanitizar strings para prevenir XSS
   - Usar Pydantic en backend para validación automática

### Performance

1. **Backend:**
   - Índices en campos frecuentemente consultados (id_usuario, id_psicologo, fecha_cita)
   - Paginación para listar citas (si el volumen es alto)
   - Cachear lista de psicólogos disponibles

2. **Frontend:**
   - Lazy loading de componentes
   - Optimistic updates en operaciones
   - Debouncing en filtros de búsqueda

### Escalabilidad

1. **Notificaciones:**
   - Implementar sistema de notificaciones para:
     - Confirmación de cita creada
     - Asignación de psicólogo
     - Recordatorios de cita próxima

2. **Estados adicionales:**
   - Considerar estados: "en_progreso", "reagendada"
   - Sistema de reagendamiento
   - Historial de cambios

3. **Reportes:**
   - Dashboard de estadísticas
   - Exportación de citas (CSV, PDF)
   - Métricas de uso

### Testing

1. **Backend:**
```python
# Ejemplo de test
import pytest

def test_crear_cita_estudiante():
    # Arrange
    service = AppointmentsService(db_client)
    cita_data = CitaCreate(titulo="Test", fecha_cita=datetime.now())

    # Act
    result = service.crear_cita(cita_data, "estudiante-id")

    # Assert
    assert result["titulo"] == "Test"
    assert result["id_usuario"] == "estudiante-id"

def test_crear_cita_no_estudiante_falla():
    with pytest.raises(HTTPException) as exc:
        service.crear_cita(cita_data, "psicologo-id")
    assert exc.value.status_code == 403
```

2. **Frontend:**
```typescript
// Ejemplo de test con React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { AppointmentForm } from './AppointmentForm';

test('valida que el título tenga mínimo 10 caracteres', async () => {
  const onSubmit = jest.fn();
  render(<AppointmentForm onSubmit={onSubmit} />);

  const input = screen.getByLabelText(/motivo/i);
  fireEvent.change(input, { target: { value: 'Test' } });

  const button = screen.getByRole('button', { name: /solicitar/i });
  fireEvent.click(button);

  expect(screen.getByText(/al menos 10 caracteres/i)).toBeInTheDocument();
  expect(onSubmit).not.toHaveBeenCalled();
});
```

---

## Anexos

### Anexo A: Variables de Entorno

**Backend (.env):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://user:pass@host:port/db
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

### Anexo B: Estructura Completa de Response

**Respuesta completa de cita con joins:**

```json
{
  "id_cita": 1,
  "titulo": "Consulta por ansiedad",
  "fecha_creacion": "2025-12-01T10:00:00Z",
  "fecha_cita": "2025-12-15T10:00:00Z",
  "id_usuario": "uuid-estudiante",
  "id_psicologo": "uuid-psicologo",
  "nombre_usuario": "Juan",
  "apellido_usuario": "Pérez",
  "correo_usuario": "juan@univ.edu",
  "nombre_psicologo": "María",
  "apellido_psicologo": "González",
  "especialidad_psicologo": "Psicología Clínica"
}
```

### Anexo C: Migraciones de Base de Datos

**Alembic (si usas SQLAlchemy):**

```python
# alembic/versions/xxx_create_citas_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'citas',
        sa.Column('id_cita', sa.Integer(), primary_key=True),
        sa.Column('titulo', sa.String(255), nullable=False),
        sa.Column('fecha_creacion', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('fecha_cita', sa.DateTime(), nullable=False),
        sa.Column('id_usuario', sa.String(36), nullable=False),
        sa.Column('id_psicologo', sa.String(36)),
        sa.ForeignKeyConstraint(['id_usuario'], ['usuarios.id']),
        sa.ForeignKeyConstraint(['id_psicologo'], ['usuarios.id']),
    )

    op.create_index('idx_citas_usuario', 'citas', ['id_usuario'])
    op.create_index('idx_citas_psicologo', 'citas', ['id_psicologo'])
    op.create_index('idx_citas_fecha', 'citas', ['fecha_cita'])

def downgrade():
    op.drop_table('citas')
```

### Anexo D: Endpoints Summary

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| POST | `/citas` | Crear cita | ✓ | Estudiante |
| GET | `/citas/pendientes` | Listar pendientes | ✓ | Cualquiera |
| GET | `/citas/todas` | Listar todas | ✓ | Cualquiera |
| GET | `/citas/usuario/{id}` | Citas de usuario | ✓ | Cualquiera |
| GET | `/citas/{id}` | Detalle de cita | ✓ | Cualquiera |
| PUT | `/citas/{id}/asignar-psicologo` | Asignar psicólogo | ✓ | Admin/Psicólogo |
| PUT | `/citas/{id}` | Actualizar cita | ✓ | Creador |
| DELETE | `/citas/{id}` | Eliminar cita | ✓ | Creador |
| GET | `/citas/psicologos/disponibles` | Listar psicólogos | ✓ | Cualquiera |

---

## Conclusión

Esta documentación proporciona una guía completa para implementar el sistema de citas en un nuevo proyecto. Los puntos clave son:

1. **Backend:** Implementar endpoints con validaciones de roles y permisos
2. **Frontend:** Crear componentes reutilizables y gestión de estado clara
3. **Seguridad:** Validar autenticación y autorización en cada operación
4. **UX:** Proveer feedback claro al usuario en cada acción
5. **Performance:** Optimizar queries y usar lazy loading

Para cualquier duda sobre la integración, referirse a los archivos fuente mencionados en esta documentación.

---

**Versión:** 1.0
**Fecha:** 2025-12-04
**Equipo:** UNAYOE Development Team
