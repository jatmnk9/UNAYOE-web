import { create } from 'zustand';
import { Recommendation } from '../../../core/types';
import { recommendationsService } from '../services/recommendationsService';

interface RecommendationsState {
  recommendations: Recommendation[];
  personalizedRecommendation: Recommendation | null;
  userLikes: number[];
  isLoading: boolean;
  error: string | null;
}

interface RecommendationsActions {
  setRecommendations: (recommendations: Recommendation[]) => void;
  setPersonalizedRecommendation: (recommendation: Recommendation | null) => void;
  setUserLikes: (likes: number[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRecommendations: () => Promise<void>;
  fetchPersonalizedRecommendation: (userId: string) => Promise<void>;
  fetchUserLikes: (userId: string) => Promise<void>;
  toggleLike: (userId: string, recommendationId: number) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

type RecommendationsStore = RecommendationsState & RecommendationsActions;

/**
 * Store global de recomendaciones usando Zustand
 * Gestiona el estado de recomendaciones y likes
 */
export const useRecommendationsStore = create<RecommendationsStore>((set, get) => ({
  recommendations: [],
  personalizedRecommendation: null,
  userLikes: [],
  isLoading: false,
  error: null,

  setRecommendations: (recommendations) => set({ recommendations }),

  setPersonalizedRecommendation: (recommendation) =>
    set({ personalizedRecommendation: recommendation }),

  setUserLikes: (likes) => set({ userLikes: likes }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      recommendations: [],
      personalizedRecommendation: null,
      userLikes: [],
      isLoading: false,
      error: null,
    }),

  fetchRecommendations: async () => {
    set({ isLoading: true, error: null });

    try {
      const recommendations = await recommendationsService.getAllRecommendations();
      set({ recommendations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar las recomendaciones',
        isLoading: false,
      });
    }
  },

  fetchPersonalizedRecommendation: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const recommendation = await recommendationsService.getPersonalizedRecommendation(userId);
      set({ personalizedRecommendation: recommendation, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar la recomendación personalizada',
        isLoading: false,
      });
    }
  },

  fetchUserLikes: async (userId) => {
    try {
      const likes = await recommendationsService.getUserLikes(userId);
      set({ userLikes: likes });
    } catch (error: any) {
      console.error('Error loading user likes:', error);
    }
  },

  toggleLike: async (userId, recommendationId) => {
    const { userLikes } = get();
    const isLiked = userLikes.includes(recommendationId);

    try {
      await recommendationsService.toggleLike(userId, recommendationId);

      set({
        userLikes: isLiked
          ? userLikes.filter((id) => id !== recommendationId)
          : [...userLikes, recommendationId],
      });

      return true;
    } catch (error: any) {
      set({ error: error.message || 'Error al actualizar el like' });
      return false;
    }
  },
}));
