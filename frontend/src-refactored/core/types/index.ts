/**
 * Tipos globales TypeScript
 */

import { USER_ROLES, SENTIMENTS, APPOINTMENT_STATUS } from '../config/constants';

// ==================== User Types ====================
export interface User {
  id: string;
  email: string;
  rol: UserRole;
  nombre: string;
  apellido?: string;
  codigo_alumno?: string;
  access_token: string;
  refresh_token: string;
}

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// ==================== API Response Types ====================
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
}

export interface ApiError {
  detail: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Note/Diary Types ====================
export interface Note {
  id: number;
  nota: string;
  sentimiento: Sentiment;
  emocion: string;
  emocion_score: number;
  created_at: string;
  user_id: string;
}

export type Sentiment = typeof SENTIMENTS[keyof typeof SENTIMENTS];

export interface NoteInput {
  note: string;
  user_id: string;
}

export interface AccompanimentResponse {
  accompaniment?: string | object;
}

// ==================== Recommendation Types ====================
export interface Recommendation {
  id: number;
  titulo: string;
  descripcion: string;
  miniatura?: string;
  url: string;
  categoria?: string;
}

export interface PersonalizedRecommendationResponse {
  data: Recommendation[];
  emocion_detectada: string;
  sentimiento_detectado: Sentiment;
}

// ==================== Appointment Types ====================
export interface Appointment {
  id_cita: number;
  titulo: string;
  fecha_cita: string;
  id_usuario: string;
  id_psicologo?: string;
  nombre_psicologo?: string;
  apellido_psicologo?: string;
  especialidad_psicologo?: string;
  estado?: AppointmentStatus;
  created_at?: string;
  updated_at?: string;
}

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];

export interface AppointmentInput {
  titulo: string;
  fecha_cita: string;
}

export interface AppointmentsResponse {
  citas_creadas: Appointment[];
  citas_asignadas: Appointment[];
}

export interface Psychologist {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string;
}

// ==================== Student Types ====================
export interface Student {
  id: string;
  nombre: string;
  apellido: string;
  codigo_alumno: string;
  email?: string;
  risk?: string;
  alert_message?: string;
}

export interface StudentReport {
  student: Student;
  notes: Note[];
  statistics: {
    total_notes: number;
    sentiments: Record<string, number>;
    emotions: Record<string, number>;
    term_frequency: Array<{ term: string; count: number }>;
  };
}

// ==================== Auth Types ====================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  nombre: string;
  apellido: string;
  codigo_alumno?: string;
  rol: UserRole;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

// ==================== Common Types ====================
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

// ==================== Form Types ====================
export interface FormErrors<T> {
  [K in keyof T]?: string;
}
