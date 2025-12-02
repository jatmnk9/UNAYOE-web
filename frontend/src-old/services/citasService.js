/**
 * Servicio para la gestión de citas
 * Implementa todos los endpoints documentados en ENDPOINTS_CITAS.md
 */

const API_BASE_URL = 'http://localhost:8000/citas';

/**
 * Manejo de errores centralizado
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `Error ${response.status}`);
  }
  return response.json();
};

const citasService = {
  /**
   * 1. Crear Nueva Cita
   * POST /citas?id_usuario={uuid}
   * @param {string} idUsuario - UUID del estudiante
   * @param {object} citaData - { titulo, fecha_cita }
   */
  crearCita: async (idUsuario, citaData) => {
    const response = await fetch(`${API_BASE_URL}?id_usuario=${idUsuario}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(citaData),
    });
    return handleResponse(response);
  },

  /**
   * 2. Obtener Citas Pendientes (sin psicólogo asignado)
   * GET /citas/pendientes
   * Para administradores
   */
  obtenerCitasPendientes: async () => {
    const response = await fetch(`${API_BASE_URL}/pendientes`);
    return handleResponse(response);
  },

  /**
   * 3. Obtener Todas las Citas
   * GET /citas/todas
   * Para administradores
   */
  obtenerTodasLasCitas: async () => {
    const response = await fetch(`${API_BASE_URL}/todas`);
    return handleResponse(response);
  },

  /**
   * 4. Obtener Citas de un Usuario
   * GET /citas/usuario/{id_usuario}
   * Retorna citas creadas (estudiante) o asignadas (psicólogo)
   * @param {string} idUsuario - UUID del usuario
   */
  obtenerCitasUsuario: async (idUsuario) => {
    const response = await fetch(`${API_BASE_URL}/usuario/${idUsuario}`);
    return handleResponse(response);
  },

  /**
   * 5. Obtener Detalle de una Cita
   * GET /citas/{id_cita}
   * @param {number} idCita - ID de la cita
   */
  obtenerDetalleCita: async (idCita) => {
    const response = await fetch(`${API_BASE_URL}/${idCita}`);
    return handleResponse(response);
  },

  /**
   * 6. Asignar Psicólogo a una Cita
   * PUT /citas/{id_cita}/asignar-psicologo
   * @param {number} idCita - ID de la cita
   * @param {string} idPsicologo - UUID del psicólogo
   */
  asignarPsicologo: async (idCita, idPsicologo) => {
    const response = await fetch(`${API_BASE_URL}/${idCita}/asignar-psicologo`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_psicologo: idPsicologo }),
    });
    return handleResponse(response);
  },

  /**
   * 7. Actualizar una Cita
   * PUT /citas/{id_cita}?id_usuario={uuid}
   * @param {number} idCita - ID de la cita
   * @param {string} idUsuario - UUID del usuario que actualiza
   * @param {object} citaData - { titulo?, fecha_cita? }
   */
  actualizarCita: async (idCita, idUsuario, citaData) => {
    const response = await fetch(`${API_BASE_URL}/${idCita}?id_usuario=${idUsuario}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(citaData),
    });
    return handleResponse(response);
  },

  /**
   * 8. Eliminar una Cita
   * DELETE /citas/{id_cita}?id_usuario={uuid}
   * @param {number} idCita - ID de la cita
   * @param {string} idUsuario - UUID del usuario que elimina
   */
  eliminarCita: async (idCita, idUsuario) => {
    const response = await fetch(`${API_BASE_URL}/${idCita}?id_usuario=${idUsuario}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  /**
   * 9. Obtener Psicólogos Disponibles
   * GET /citas/psicologos/disponibles
   * Para que el administrador pueda asignarlos
   */
  obtenerPsicologosDisponibles: async () => {
    const response = await fetch(`${API_BASE_URL}/psicologos/disponibles`);
    return handleResponse(response);
  },
};

export default citasService;
