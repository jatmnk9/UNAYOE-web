# 📅 API de Gestión de Citas - Documentación para Frontend

## 📋 Tabla de Contenidos
- [Introducción](#introducción)
- [Base URL](#base-url)
- [Endpoints Disponibles](#endpoints-disponibles)
- [Casos de Uso](#casos-de-uso)
- [Ejemplos de Integración](#ejemplos-de-integración)

---

## Introducción

Esta API permite gestionar el sistema de citas entre estudiantes y psicólogos. Los estudiantes pueden crear citas, los administradores pueden asignar psicólogos, y los psicólogos pueden ver sus citas asignadas.

### Roles del Sistema
- **Estudiante**: Puede crear, actualizar, eliminar y ver sus propias citas
- **Psicólogo**: Puede ver las citas que le han sido asignadas
- **Administrador**: Puede ver todas las citas, asignar psicólogos y gestionar el sistema

---

## Base URL

```
http://localhost:8000/citas
```

---

## Endpoints Disponibles

### 1. Crear Nueva Cita 🆕

**Endpoint:** `POST /citas`

**Descripción:** Permite a un estudiante crear una nueva cita.

**Parámetros Query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_usuario` | string (UUID) | ✅ | ID del estudiante que crea la cita |

**Body (JSON):**
```json
{
  "titulo": "string",
  "fecha_cita": "2025-10-15T10:30:00"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `titulo` | string | ✅ | Título o motivo de la cita (min 1 carácter) |
| `fecha_cita` | datetime (ISO 8601) | ✅ | Fecha y hora programada para la cita |

**Respuesta Exitosa (201 Created):**
```json
{
  "message": "Cita creada exitosamente",
  "data": {
    "id_cita": 1,
    "titulo": "Consulta de ansiedad",
    "fecha_cita": "2025-10-15T10:30:00",
    "fecha_creacion": "2025-10-10T08:00:00",
    "id_usuario": "uuid-del-estudiante",
    "id_psicologo": null
  }
}
```

**Errores Posibles:**
- `404`: Usuario no encontrado
- `403`: El usuario no es un estudiante
- `500`: Error interno del servidor

---

### 2. Obtener Citas Pendientes ⏳

**Endpoint:** `GET /citas/pendientes`

**Descripción:** Obtiene todas las citas que NO tienen psicólogo asignado (para administradores).

**Parámetros:** Ninguno

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Citas pendientes obtenidas exitosamente",
  "total": 5,
  "data": [
    {
      "id_cita": 1,
      "titulo": "Consulta de ansiedad",
      "fecha_creacion": "2025-10-10T08:00:00",
      "fecha_cita": "2025-10-15T10:30:00",
      "id_usuario": "uuid-del-estudiante",
      "id_psicologo": null,
      "nombre_usuario": "Juan",
      "apellido_usuario": "Pérez",
      "correo_usuario": "juan.perez@universidad.edu"
    }
  ]
}
```

**Notas:**
- Solo muestra citas donde `id_psicologo` es `null`
- Ordenadas por `fecha_cita` ascendente
- Incluye información del estudiante que creó la cita

---

### 3. Obtener Todas las Citas 📊

**Endpoint:** `GET /citas/todas`

**Descripción:** Obtiene TODAS las citas del sistema (con y sin psicólogo asignado).

**Parámetros:** Ninguno

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Todas las citas obtenidas exitosamente",
  "total": 15,
  "data": [
    {
      "id_cita": 1,
      "titulo": "Consulta de ansiedad",
      "fecha_creacion": "2025-10-10T08:00:00",
      "fecha_cita": "2025-10-15T10:30:00",
      "id_usuario": "uuid-del-estudiante",
      "id_psicologo": "uuid-del-psicologo",
      "nombre_usuario": "Juan",
      "apellido_usuario": "Pérez",
      "correo_usuario": "juan.perez@universidad.edu",
      "nombre_psicologo": "María",
      "apellido_psicologo": "González",
      "especialidad_psicologo": "Psicología Clínica"
    }
  ]
}
```

**Notas:**
- Incluye información completa del estudiante y psicólogo (si está asignado)
- Ordenadas por `fecha_cita` ascendente
- Solo accesible para administradores

---

### 4. Obtener Citas de un Usuario 👤

**Endpoint:** `GET /citas/usuario/{id_usuario}`

**Descripción:** Obtiene las citas de un usuario específico. El comportamiento cambia según el rol:
- **Estudiante**: Retorna las citas que ha creado
- **Psicólogo**: Retorna las citas que le han sido asignadas

**Parámetros URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_usuario` | string (UUID) | ✅ | ID del usuario (estudiante o psicólogo) |

**Respuesta para Estudiante (200 OK):**
```json
{
  "message": "Citas del estudiante obtenidas exitosamente",
  "total_citas": 3,
  "citas_creadas": [
    {
      "id_cita": 1,
      "titulo": "Consulta de ansiedad",
      "fecha_creacion": "2025-10-10T08:00:00",
      "fecha_cita": "2025-10-15T10:30:00",
      "id_usuario": "uuid-del-estudiante",
      "id_psicologo": "uuid-del-psicologo",
      "nombre_psicologo": "María",
      "apellido_psicologo": "González",
      "especialidad_psicologo": "Psicología Clínica"
    }
  ]
}
```

**Respuesta para Psicólogo (200 OK):**
```json
{
  "message": "Citas asignadas al psicólogo obtenidas exitosamente",
  "total_citas": 8,
  "citas_asignadas": [
    {
      "id_cita": 1,
      "titulo": "Consulta de ansiedad",
      "fecha_creacion": "2025-10-10T08:00:00",
      "fecha_cita": "2025-10-15T10:30:00",
      "id_usuario": "uuid-del-estudiante",
      "id_psicologo": "uuid-del-psicologo",
      "nombre_usuario": "Juan",
      "apellido_usuario": "Pérez",
      "correo_usuario": "juan.perez@universidad.edu"
    }
  ]
}
```

**Errores Posibles:**
- `404`: Usuario no encontrado
- `403`: Rol no autorizado para ver citas

---

### 5. Obtener Detalle de una Cita 🔍

**Endpoint:** `GET /citas/{id_cita}`

**Descripción:** Obtiene la información completa de una cita específica.

**Parámetros URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_cita` | integer | ✅ | ID de la cita |

**Respuesta Exitosa (200 OK):**
```json
{
  "id_cita": 1,
  "titulo": "Consulta de ansiedad",
  "fecha_creacion": "2025-10-10T08:00:00",
  "fecha_cita": "2025-10-15T10:30:00",
  "id_usuario": "uuid-del-estudiante",
  "id_psicologo": "uuid-del-psicologo",
  "nombre_usuario": "Juan",
  "apellido_usuario": "Pérez",
  "correo_usuario": "juan.perez@universidad.edu",
  "nombre_psicologo": "María",
  "apellido_psicologo": "González",
  "especialidad_psicologo": "Psicología Clínica"
}
```

**Errores Posibles:**
- `404`: Cita no encontrada

---

### 6. Asignar Psicólogo a una Cita 👨‍⚕️

**Endpoint:** `PUT /citas/{id_cita}/asignar-psicologo`

**Descripción:** Permite al administrador asignar un psicólogo a una cita existente.

**Parámetros URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_cita` | integer | ✅ | ID de la cita |

**Body (JSON):**
```json
{
  "id_psicologo": "uuid-del-psicologo"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id_psicologo` | string (UUID) | ✅ | ID del psicólogo a asignar |

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Psicólogo asignado exitosamente",
  "data": {
    "id_cita": 1,
    "titulo": "Consulta de ansiedad",
    "fecha_cita": "2025-10-15T10:30:00",
    "fecha_creacion": "2025-10-10T08:00:00",
    "id_usuario": "uuid-del-estudiante",
    "id_psicologo": "uuid-del-psicologo"
  }
}
```

**Errores Posibles:**
- `404`: Cita no encontrada o psicólogo no encontrado
- `400`: El usuario seleccionado no es un psicólogo
- `500`: Error al asignar psicólogo

---

### 7. Actualizar una Cita ✏️

**Endpoint:** `PUT /citas/{id_cita}`

**Descripción:** Permite al creador de la cita actualizar su título o fecha.

**Parámetros URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_cita` | integer | ✅ | ID de la cita |

**Parámetros Query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_usuario` | string (UUID) | ✅ | ID del usuario que intenta actualizar |

**Body (JSON):**
```json
{
  "titulo": "Consulta de depresión",
  "fecha_cita": "2025-10-20T14:00:00"
}
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `titulo` | string | ❌ | Nuevo título (opcional) |
| `fecha_cita` | datetime (ISO 8601) | ❌ | Nueva fecha (opcional) |

**Nota:** Al menos uno de los campos debe ser proporcionado.

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Cita actualizada exitosamente",
  "data": {
    "id_cita": 1,
    "titulo": "Consulta de depresión",
    "fecha_cita": "2025-10-20T14:00:00",
    "fecha_creacion": "2025-10-10T08:00:00",
    "id_usuario": "uuid-del-estudiante",
    "id_psicologo": "uuid-del-psicologo"
  }
}
```

**Errores Posibles:**
- `404`: Cita no encontrada
- `403`: No tienes permisos para actualizar esta cita
- `400`: No se proporcionaron datos para actualizar

---

### 8. Eliminar una Cita 🗑️

**Endpoint:** `DELETE /citas/{id_cita}`

**Descripción:** Permite al creador de la cita eliminarla del sistema.

**Parámetros URL:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_cita` | integer | ✅ | ID de la cita |

**Parámetros Query:**
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `id_usuario` | string (UUID) | ✅ | ID del usuario que intenta eliminar |

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Cita eliminada exitosamente"
}
```

**Errores Posibles:**
- `404`: Cita no encontrada
- `403`: No tienes permisos para eliminar esta cita

---

### 9. Obtener Psicólogos Disponibles 👥

**Endpoint:** `GET /citas/psicologos/disponibles`

**Descripción:** Obtiene la lista de todos los psicólogos registrados (para que el administrador pueda asignarlos).

**Parámetros:** Ninguno

**Respuesta Exitosa (200 OK):**
```json
{
  "message": "Psicólogos disponibles obtenidos exitosamente",
  "total": 10,
  "data": [
    {
      "id": "uuid-del-psicologo",
      "nombre": "María",
      "apellido": "González",
      "especialidad": "Psicología Clínica",
      "correo_institucional": "maria.gonzalez@universidad.edu"
    }
  ]
}
```

---

## Casos de Uso

### 🎓 Caso de Uso 1: Estudiante Crea una Cita

**Actores:** Estudiante

**Flujo:**
1. El estudiante inicia sesión en el sistema
2. El estudiante navega a la sección de "Crear Cita"
3. El estudiante completa el formulario:
   - Título: "Necesito ayuda con ansiedad ante exámenes"
   - Fecha: Selecciona una fecha y hora disponible
4. El sistema valida que el usuario sea un estudiante
5. El sistema crea la cita en estado "pendiente" (sin psicólogo asignado)
6. El estudiante recibe confirmación de la cita creada

**Endpoint a usar:**
```javascript
POST /citas?id_usuario={uuid-estudiante}
Body: {
  "titulo": "Necesito ayuda con ansiedad ante exámenes",
  "fecha_cita": "2025-10-20T10:00:00"
}
```

**Resultado esperado:**
- Cita creada exitosamente
- `id_psicologo` es `null` inicialmente
- La cita aparece en la lista de citas pendientes del administrador

---

### 🏥 Caso de Uso 2: Administrador Asigna Psicólogo a una Cita

**Actores:** Administrador

**Flujo:**
1. El administrador inicia sesión en el sistema
2. El administrador navega a "Citas Pendientes"
3. El sistema muestra todas las citas sin psicólogo asignado
4. El administrador selecciona una cita
5. El administrador consulta la lista de psicólogos disponibles
6. El administrador selecciona un psicólogo según su especialidad
7. El sistema asigna el psicólogo a la cita
8. El sistema notifica al estudiante y al psicólogo (si implementan notificaciones)

**Endpoints a usar:**

**Paso 1 - Obtener citas pendientes:**
```javascript
GET /citas/pendientes
```

**Paso 2 - Obtener psicólogos disponibles:**
```javascript
GET /citas/psicologos/disponibles
```

**Paso 3 - Asignar psicólogo:**
```javascript
PUT /citas/1/asignar-psicologo
Body: {
  "id_psicologo": "uuid-del-psicologo-seleccionado"
}
```

**Resultado esperado:**
- La cita ya no aparece en "Citas Pendientes"
- El estudiante puede ver el psicólogo asignado en sus citas
- El psicólogo puede ver la cita en su lista de citas asignadas

---

### 👨‍⚕️ Caso de Uso 3: Psicólogo Visualiza sus Citas Asignadas

**Actores:** Psicólogo

**Flujo:**
1. El psicólogo inicia sesión en el sistema
2. El psicólogo navega a "Mis Citas"
3. El sistema muestra todas las citas asignadas al psicólogo
4. El psicólogo puede ver:
   - Información del estudiante (nombre, apellido, correo)
   - Fecha y hora de la cita
   - Motivo de la consulta (título)
5. El psicólogo puede prepararse para las sesiones

**Endpoint a usar:**
```javascript
GET /citas/usuario/{uuid-del-psicologo}
```

**Respuesta esperada:**
```json
{
  "message": "Citas asignadas al psicólogo obtenidas exitosamente",
  "total_citas": 5,
  "citas_asignadas": [
    {
      "id_cita": 1,
      "titulo": "Necesito ayuda con ansiedad ante exámenes",
      "fecha_cita": "2025-10-20T10:00:00",
      "nombre_usuario": "Juan",
      "apellido_usuario": "Pérez",
      "correo_usuario": "juan.perez@universidad.edu"
    }
  ]
}
```

---

### 🎓 Caso de Uso 4: Estudiante Visualiza sus Citas

**Actores:** Estudiante

**Flujo:**
1. El estudiante inicia sesión en el sistema
2. El estudiante navega a "Mis Citas"
3. El sistema muestra todas las citas creadas por el estudiante
4. El estudiante puede ver:
   - Citas pendientes (sin psicólogo asignado)
   - Citas confirmadas (con psicólogo asignado)
   - Información del psicólogo asignado (nombre, especialidad)
5. El estudiante puede gestionar sus citas (actualizar o eliminar)

**Endpoint a usar:**
```javascript
GET /citas/usuario/{uuid-del-estudiante}
```

**Respuesta esperada:**
```json
{
  "message": "Citas del estudiante obtenidas exitosamente",
  "total_citas": 3,
  "citas_creadas": [
    {
      "id_cita": 1,
      "titulo": "Consulta de ansiedad",
      "fecha_cita": "2025-10-20T10:00:00",
      "id_psicologo": "uuid-psicologo",
      "nombre_psicologo": "María",
      "apellido_psicologo": "González",
      "especialidad_psicologo": "Psicología Clínica"
    },
    {
      "id_cita": 2,
      "titulo": "Seguimiento",
      "fecha_cita": "2025-10-25T14:00:00",
      "id_psicologo": null,
      "nombre_psicologo": null,
      "apellido_psicologo": null,
      "especialidad_psicologo": null
    }
  ]
}
```

**Nota:** Las citas con `id_psicologo: null` están pendientes de asignación.

---

### ✏️ Caso de Uso 5: Estudiante Actualiza una Cita

**Actores:** Estudiante

**Flujo:**
1. El estudiante inicia sesión
2. El estudiante navega a "Mis Citas"
3. El estudiante selecciona una cita que desea modificar
4. El estudiante puede cambiar:
   - El título/motivo de la cita
   - La fecha y hora de la cita
5. El sistema valida que el estudiante sea el creador de la cita
6. El sistema actualiza la cita
7. El estudiante recibe confirmación

**Endpoint a usar:**
```javascript
PUT /citas/1?id_usuario={uuid-estudiante}
Body: {
  "titulo": "Consulta de estrés académico",
  "fecha_cita": "2025-10-22T15:00:00"
}
```

**Notas importantes:**
- Solo el creador puede actualizar la cita
- Puedes actualizar solo el título, solo la fecha, o ambos
- Si la cita ya tiene psicólogo asignado, la actualización no afecta la asignación

---

### 🗑️ Caso de Uso 6: Estudiante Cancela una Cita

**Actores:** Estudiante

**Flujo:**
1. El estudiante inicia sesión
2. El estudiante navega a "Mis Citas"
3. El estudiante selecciona una cita que desea cancelar
4. El estudiante confirma la cancelación
5. El sistema valida que el estudiante sea el creador
6. El sistema elimina la cita de la base de datos
7. El estudiante recibe confirmación de cancelación

**Endpoint a usar:**
```javascript
DELETE /citas/1?id_usuario={uuid-estudiante}
```

**Notas importantes:**
- Solo el creador puede eliminar la cita
- La eliminación es permanente
- Se recomienda implementar una confirmación en el frontend

---

### 📊 Caso de Uso 7: Administrador Visualiza Dashboard de Citas

**Actores:** Administrador

**Flujo:**
1. El administrador inicia sesión
2. El administrador navega al "Dashboard de Citas"
3. El sistema muestra estadísticas:
   - Total de citas en el sistema
   - Citas pendientes de asignación
   - Citas asignadas
4. El administrador puede filtrar y gestionar las citas

**Endpoints a usar:**

**Todas las citas:**
```javascript
GET /citas/todas
```

**Solo citas pendientes:**
```javascript
GET /citas/pendientes
```

**Ejemplo de uso para calcular estadísticas:**
```javascript
// Obtener todas las citas
const todasLasCitas = await fetch('/citas/todas');
const { data, total } = await todasLasCitas.json();

// Calcular estadísticas
const citasPendientes = data.filter(cita => cita.id_psicologo === null).length;
const citasAsignadas = data.filter(cita => cita.id_psicologo !== null).length;

// Mostrar en el dashboard
console.log(`Total: ${total}`);
console.log(`Pendientes: ${citasPendientes}`);
console.log(`Asignadas: ${citasAsignadas}`);
```

---

## Ejemplos de Integración

### 🔧 Ejemplo con Fetch API (Vanilla JavaScript)

**Crear una cita:**
```javascript
async function crearCita(idUsuario, titulo, fechaCita) {
  try {
    const response = await fetch(`/citas?id_usuario=${idUsuario}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: titulo,
        fecha_cita: fechaCita
      })
    });

    if (!response.ok) {
      throw new Error('Error al crear la cita');
    }

    const data = await response.json();
    console.log('Cita creada:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
crearCita(
  'uuid-del-estudiante',
  'Consulta de ansiedad',
  '2025-10-20T10:00:00'
);
```

**Obtener citas del usuario:**
```javascript
async function obtenerCitasUsuario(idUsuario) {
  try {
    const response = await fetch(`/citas/usuario/${idUsuario}`);

    if (!response.ok) {
      throw new Error('Error al obtener las citas');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
const citas = await obtenerCitasUsuario('uuid-del-usuario');
console.log(citas);
```

**Asignar psicólogo:**
```javascript
async function asignarPsicologo(idCita, idPsicologo) {
  try {
    const response = await fetch(`/citas/${idCita}/asignar-psicologo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_psicologo: idPsicologo
      })
    });

    if (!response.ok) {
      throw new Error('Error al asignar psicólogo');
    }

    const data = await response.json();
    console.log('Psicólogo asignado:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uso
asignarPsicologo(1, 'uuid-del-psicologo');
```

---

### ⚛️ Ejemplo con React + Axios

**Hook personalizado para gestionar citas:**
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/citas';

// Hook para obtener citas del usuario
export const useCitasUsuario = (idUsuario) => {
  const [citas, setCitas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/usuario/${idUsuario}`);
        setCitas(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setCitas(null);
      } finally {
        setLoading(false);
      }
    };

    if (idUsuario) {
      fetchCitas();
    }
  }, [idUsuario]);

  return { citas, loading, error };
};

// Hook para crear cita
export const useCrearCita = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const crearCita = async (idUsuario, titulo, fechaCita) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}?id_usuario=${idUsuario}`,
        {
          titulo,
          fecha_cita: fechaCita
        }
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { crearCita, loading, error };
};

// Componente ejemplo
function MisCitas({ idUsuario, rol }) {
  const { citas, loading, error } = useCitasUsuario(idUsuario);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  const listaCitas = rol === 'estudiante'
    ? citas?.citas_creadas
    : citas?.citas_asignadas;

  return (
    <div>
      <h2>Mis Citas ({citas?.total_citas})</h2>
      {listaCitas?.map(cita => (
        <div key={cita.id_cita}>
          <h3>{cita.titulo}</h3>
          <p>Fecha: {new Date(cita.fecha_cita).toLocaleString()}</p>
          {rol === 'estudiante' && cita.nombre_psicologo && (
            <p>Psicólogo: {cita.nombre_psicologo} {cita.apellido_psicologo}</p>
          )}
          {rol === 'psicologo' && (
            <p>Estudiante: {cita.nombre_usuario} {cita.apellido_usuario}</p>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 🎨 Ejemplo con Vue.js

**Servicio de Citas:**
```javascript
// services/citasService.js
import axios from 'axios';

const API_URL = 'http://localhost:8000/citas';

export default {
  async crearCita(idUsuario, citaData) {
    const response = await axios.post(
      `${API_URL}?id_usuario=${idUsuario}`,
      citaData
    );
    return response.data;
  },

  async obtenerCitasUsuario(idUsuario) {
    const response = await axios.get(`${API_URL}/usuario/${idUsuario}`);
    return response.data;
  },

  async obtenerCitasPendientes() {
    const response = await axios.get(`${API_URL}/pendientes`);
    return response.data;
  },

  async asignarPsicologo(idCita, idPsicologo) {
    const response = await axios.put(
      `${API_URL}/${idCita}/asignar-psicologo`,
      { id_psicologo: idPsicologo }
    );
    return response.data;
  },

  async obtenerPsicologos() {
    const response = await axios.get(`${API_URL}/psicologos/disponibles`);
    return response.data;
  },

  async actualizarCita(idCita, idUsuario, citaData) {
    const response = await axios.put(
      `${API_URL}/${idCita}?id_usuario=${idUsuario}`,
      citaData
    );
    return response.data;
  },

  async eliminarCita(idCita, idUsuario) {
    const response = await axios.delete(
      `${API_URL}/${idCita}?id_usuario=${idUsuario}`
    );
    return response.data;
  }
};
```

**Componente Vue:**
```vue
<template>
  <div class="citas-container">
    <h2>Mis Citas</h2>

    <div v-if="loading">Cargando...</div>
    <div v-else-if="error">Error: {{ error }}</div>

    <div v-else>
      <div v-for="cita in listaCitas" :key="cita.id_cita" class="cita-card">
        <h3>{{ cita.titulo }}</h3>
        <p>Fecha: {{ formatearFecha(cita.fecha_cita) }}</p>

        <div v-if="cita.id_psicologo">
          <p>
            Psicólogo: {{ cita.nombre_psicologo }} {{ cita.apellido_psicologo }}
          </p>
          <p>Especialidad: {{ cita.especialidad_psicologo }}</p>
        </div>
        <div v-else>
          <p class="pendiente">Pendiente de asignación</p>
        </div>

        <button @click="editarCita(cita)">Editar</button>
        <button @click="eliminarCita(cita.id_cita)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script>
import citasService from '@/services/citasService';

export default {
  name: 'MisCitas',

  data() {
    return {
      citas: null,
      loading: false,
      error: null
    };
  },

  computed: {
    listaCitas() {
      return this.citas?.citas_creadas || [];
    }
  },

  async mounted() {
    await this.cargarCitas();
  },

  methods: {
    async cargarCitas() {
      try {
        this.loading = true;
        this.citas = await citasService.obtenerCitasUsuario(this.$store.state.user.id);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString('es-ES');
    },

    editarCita(cita) {
      this.$router.push({ name: 'EditarCita', params: { id: cita.id_cita } });
    },

    async eliminarCita(idCita) {
      if (confirm('¿Estás seguro de eliminar esta cita?')) {
        try {
          await citasService.eliminarCita(idCita, this.$store.state.user.id);
          await this.cargarCitas();
        } catch (err) {
          alert('Error al eliminar la cita');
        }
      }
    }
  }
};
</script>
```

---

## 📝 Notas Importantes

### Formato de Fechas
- Todas las fechas deben estar en formato **ISO 8601**: `YYYY-MM-DDTHH:mm:ss`
- Ejemplo: `2025-10-20T14:30:00`
- En JavaScript: `new Date().toISOString()` o `fecha.toISOString().slice(0, 19)`

### IDs de Usuario
- Todos los `id_usuario` y `id_psicologo` son **UUID** (strings)
- Ejemplo: `"550e8400-e29b-41d4-a716-446655440000"`

### Manejo de Errores
Todos los endpoints pueden retornar los siguientes códigos de estado:
- `200`: Éxito
- `201`: Recurso creado exitosamente
- `400`: Petición inválida (datos incorrectos)
- `403`: Prohibido (sin permisos)
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

### Autenticación
- Actualmente los endpoints reciben `id_usuario` como parámetro
- En producción se recomienda usar tokens JWT en el header `Authorization`
- El backend debería extraer el `id_usuario` del token en lugar de recibirlo como parámetro

### CORS
- El backend ya tiene CORS habilitado para desarrollo
- Para producción, configurar los dominios permitidos en el backend

---

## 🆘 Soporte

Si encuentran algún problema o tienen dudas sobre la integración:
1. Revisen la documentación de Swagger/OpenAPI en: `http://localhost:8000/docs`
2. Verifiquen que el backend esté corriendo: `http://localhost:8000/health`
3. Contacten al equipo de backend con el código de error específico

---

**Fecha de actualización:** 10 de Octubre, 2025
**Versión de la API:** 2.0.0
**Mantenido por:** Equipo Backend
