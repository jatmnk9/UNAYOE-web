/**
 * Servicio de Gestión de Citas
 * Maneja operaciones CRUD de citas entre estudiantes y psicólogos
 */

import { get, post, put, del } from '../../../core/api/client';
import {
  Appointment,
  AppointmentInput,
  AppointmentsResponse,
  Psychologist
} from '../../../core/types';

class AppointmentsService {
  /**
   * Crear una nueva cita
   */
  async createAppointment(userId: string, appointmentData: AppointmentInput): Promise<Appointment> {
    const response = await post<Appointment>(`/citas?id_usuario=${userId}`, appointmentData);
    return response;
  }

  /**
   * Obtener citas pendientes (sin psicólogo asignado)
   */
  async getPendingAppointments(): Promise<Appointment[]> {
    const response = await get<Appointment[]>('/citas/pendientes');
    return response;
  }

  /**
   * Obtener todas las citas
   */
  async getAllAppointments(): Promise<Appointment[]> {
    const response = await get<Appointment[]>('/citas/todas');
    return response;
  }

  /**
   * Obtener citas de un usuario específico
   */
  async getUserAppointments(userId: string): Promise<AppointmentsResponse> {
    const response = await get<AppointmentsResponse>(`/citas/usuario/${userId}`);
    return response;
  }

  /**
   * Obtener detalle de una cita específica
   */
  async getAppointmentDetail(appointmentId: number): Promise<Appointment> {
    const response = await get<Appointment>(`/citas/${appointmentId}`);
    return response;
  }

  /**
   * Asignar psicólogo a una cita
   */
  async assignPsychologist(appointmentId: number, psychologistId: string): Promise<Appointment> {
    const response = await put<Appointment>(
      `/citas/${appointmentId}/asignar-psicologo`,
      { id_psicologo: psychologistId }
    );
    return response;
  }

  /**
   * Actualizar una cita
   */
  async updateAppointment(
    appointmentId: number,
    userId: string,
    appointmentData: Partial<AppointmentInput>
  ): Promise<Appointment> {
    const response = await put<Appointment>(
      `/citas/${appointmentId}?id_usuario=${userId}`,
      appointmentData
    );
    return response;
  }

  /**
   * Eliminar/Cancelar una cita
   */
  async deleteAppointment(appointmentId: number, userId: string): Promise<void> {
    await del(`/citas/${appointmentId}?id_usuario=${userId}`);
  }

  /**
   * Obtener lista de psicólogos disponibles
   */
  async getAvailablePsychologists(): Promise<Psychologist[]> {
    const response = await get<Psychologist[]>('/citas/psicologos/disponibles');
    return response;
  }
}

export const appointmentsService = new AppointmentsService();
export default appointmentsService;
