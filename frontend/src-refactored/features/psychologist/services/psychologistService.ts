/**
 * Servicio de Psicólogo
 * Maneja operaciones de seguimiento de estudiantes y reportes
 */

import { get } from '../../../core/api/client';
import { Student, StudentReport } from '../../../core/types';

class PsychologistService {
  /**
   * Obtener lista de estudiantes asignados al psicólogo
   */
  async getStudents(psychologistId?: string): Promise<Student[]> {
    const params = psychologistId ? `?psychologist_id=${psychologistId}` : '';
    const response = await get<{ data: Student[] }>(`/psychologist/students${params}`);
    return response.data || [];
  }

  /**
   * Obtener lista de estudiantes con alertas de riesgo
   */
  async getStudentsWithAlerts(psychologistId?: string): Promise<Student[]> {
    const params = psychologistId ? `?psychologist_id=${psychologistId}` : '';
    const response = await get<{ data: Student[] }>(`/psychologist/students-alerts${params}`);
    return response.data || [];
  }

  /**
   * Obtener reporte detallado de un estudiante
   */
  async getStudentReport(studentId: string): Promise<StudentReport> {
    const response = await get<StudentReport>(`/psychologist/student/${studentId}/report`);
    return response;
  }

  /**
   * Obtener notas de un estudiante específico
   */
  async getStudentNotes(studentId: string): Promise<any> {
    const response = await get(`/notas/${studentId}`);
    return response;
  }

  /**
   * Obtener estadísticas de un estudiante
   */
  async getStudentStatistics(studentId: string): Promise<any> {
    const response = await get(`/psychologist/student/${studentId}/statistics`);
    return response;
  }
}

export const psychologistService = new PsychologistService();
export default psychologistService;
