/**
 * Servicio de Diario de Bienestar
 * Maneja operaciones CRUD de notas del diario
 */

import { get, post, put, del } from '../../../core/api/client';
import { Note, NoteInput, ApiResponse, AccompanimentResponse } from '../../../core/types';

class DiaryService {
  /**
   * Obtener todas las notas de un usuario
   */
  async getNotes(userId: string): Promise<Note[]> {
    const response = await get<{ data: Note[] }>(`/notas/${userId}`);
    return response.data || [];
  }

  /**
   * Crear una nueva nota
   */
  async createNote(noteData: NoteInput): Promise<Note & AccompanimentResponse> {
    const response = await post<{ data: Note[]; accompaniment?: string | object }>('/notas', noteData);

    const note = response.data?.[0];
    return {
      ...note,
      accompaniment: response.accompaniment,
    };
  }

  /**
   * Actualizar una nota existente
   */
  async updateNote(noteId: number, userId: string, noteData: Partial<NoteInput>): Promise<Note> {
    const response = await put<Note>(`/notas/${noteId}?user_id=${userId}`, noteData);
    return response;
  }

  /**
   * Eliminar una nota
   */
  async deleteNote(noteId: number, userId: string): Promise<void> {
    await del(`/notas/${noteId}?user_id=${userId}`);
  }

  /**
   * Obtener estadísticas de notas de un usuario
   */
  async getNotesStatistics(userId: string): Promise<any> {
    const response = await get(`/notas/${userId}/statistics`);
    return response;
  }
}

export const diaryService = new DiaryService();
export default diaryService;
