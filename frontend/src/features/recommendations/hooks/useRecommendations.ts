import { useRecommendationsStore } from '../store/recommendationsStore';

/**
 * Hook personalizado para acceder al estado y acciones de recomendaciones
 * Simplifica el acceso al store de recomendaciones
 *
 * @example
 * const { recommendations, isLoading, toggleLike } = useRecommendations();
 *
 * useEffect(() => {
 *   fetchRecommendations();
 *   fetchUserLikes(user.id);
 * }, []);
 */
export const useRecommendations = () => {
  const {
    recommendations,
    personalizedRecommendation,
    userLikes,
    isLoading,
    error,
    fetchRecommendations,
    fetchPersonalizedRecommendation,
    fetchUserLikes,
    toggleLike,
    clearError,
    reset,
  } = useRecommendationsStore();

  return {
    recommendations,
    personalizedRecommendation,
    userLikes,
    isLoading,
    error,
    fetchRecommendations,
    fetchPersonalizedRecommendation,
    fetchUserLikes,
    toggleLike,
    clearError,
    reset,
  };
};
