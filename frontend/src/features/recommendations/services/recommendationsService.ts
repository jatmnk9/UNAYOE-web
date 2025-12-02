/**
 * Servicio de Recomendaciones (PsicoTips)
 * Maneja recomendaciones personalizadas y sistema de likes
 */

import { get, post, del } from '../../../core/api/client';
import { Recommendation, PersonalizedRecommendationResponse } from '../../../core/types';

class RecommendationsService {
  /**
   * Obtener todas las recomendaciones disponibles
   */
  async getAllRecommendations(): Promise<Recommendation[]> {
    const response = await get<{ data: Recommendation[] }>('/recomendaciones/todas');
    return response.data || [];
  }

  /**
   * Obtener recomendación personalizada basada en última emoción del usuario
   */
  async getPersonalizedRecommendation(userId: string): Promise<PersonalizedRecommendationResponse> {
    const response = await get<PersonalizedRecommendationResponse>(`/recomendaciones/${userId}`);
    return response;
  }

  /**
   * Obtener likes/favoritos de un usuario
   */
  async getUserLikes(userId: string): Promise<number[]> {
    const response = await get<number[]>(`/likes/${userId}`);
    return response;
  }

  /**
   * Agregar like a una recomendación
   */
  async addLike(userId: string, recommendationId: number): Promise<void> {
    await post(`/likes/${userId}/${recommendationId}`);
  }

  /**
   * Eliminar like de una recomendación
   */
  async removeLike(userId: string, recommendationId: number): Promise<void> {
    await del(`/likes/${userId}/${recommendationId}`);
  }

  /**
   * Toggle like (agregar si no existe, eliminar si existe)
   */
  async toggleLike(userId: string, recommendationId: number, isLiked: boolean): Promise<void> {
    if (isLiked) {
      await this.removeLike(userId, recommendationId);
    } else {
      await this.addLike(userId, recommendationId);
    }
  }
}

export const recommendationsService = new RecommendationsService();
export default recommendationsService;
