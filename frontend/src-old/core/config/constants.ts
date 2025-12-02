/**
 * Constantes globales de la aplicación
 */

// Roles de usuario
export const USER_ROLES = {
  STUDENT: 'estudiante',
  PSYCHOLOGIST: 'psicologo',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Rutas de la aplicación
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',

  // Student routes
  STUDENT: {
    ROOT: '/student',
    DASHBOARD: '/student',
    DIARY: '/student/diario',
    RECOMMENDATIONS: '/student/recomendaciones',
    FAVORITES: '/student/favoritos',
    APPOINTMENTS: '/student/citas',
    APPOINTMENTS_CREATE: '/student/citas/crear',
    APPOINTMENTS_EDIT: (id: string | number) => `/student/citas/editar/${id}`,
  },

  // Psychologist routes
  PSYCHOLOGIST: {
    ROOT: '/psychologist',
    DASHBOARD: '/psychologist',
    FOLLOW_UP: '/psychologist/seguimiento',
    STUDENT_REPORT: (id: string) => `/psychologist/seguimiento/${id}`,
    APPOINTMENTS: '/psychologist/citas',
    APPOINTMENTS_DASHBOARD: '/psychologist/citas/dashboard',
  },
} as const;

// Estados de citas
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

// Sentimientos
export const SENTIMENTS = {
  POSITIVE: 'POS',
  NEGATIVE: 'NEG',
  NEUTRAL: 'NEU',
} as const;

// Límites de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  NOTES_PER_PAGE: 3,
} as const;

// Tiempos de cache (ms)
export const CACHE_TIME = {
  NOTES: 5 * 60 * 1000, // 5 minutos
  RECOMMENDATIONS: 10 * 60 * 1000, // 10 minutos
  APPOINTMENTS: 2 * 60 * 1000, // 2 minutos
  STUDENTS: 5 * 60 * 1000, // 5 minutos
} as const;

// Mensajes de error
export const ERROR_MESSAGES = {
  GENERIC: 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
  NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
  UNAUTHORIZED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  FORBIDDEN: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'Recurso no encontrado.',
  VALIDATION: 'Por favor verifica los datos ingresados.',
} as const;

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  NOTE_CREATED: 'Nota guardada correctamente',
  NOTE_UPDATED: 'Nota actualizada correctamente',
  NOTE_DELETED: 'Nota eliminada correctamente',
  APPOINTMENT_CREATED: 'Cita creada correctamente',
  APPOINTMENT_UPDATED: 'Cita actualizada correctamente',
  APPOINTMENT_DELETED: 'Cita cancelada correctamente',
  LOGIN_SUCCESS: 'Bienvenido a UNAYOE',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
} as const;
