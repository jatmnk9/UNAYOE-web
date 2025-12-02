import * as React from 'react';
import { Recommendation } from '../../../core/types';
import { RecommendationCard } from './RecommendationCard';
import { Skeleton } from '../../../shared/components/ui/loading';

interface RecommendationListProps {
  recommendations: Recommendation[];
  userLikes: number[];
  isLoading?: boolean;
  onToggleLike: (id: number) => void;
}

/**
 * Lista de recomendaciones con estados de carga
 */
export const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  userLikes,
  isLoading = false,
  onToggleLike,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          No hay recomendaciones disponibles
        </h3>
        <p className="text-sm text-gray-500">Vuelve más tarde para ver nuevas sugerencias</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recommendations.map((recommendation) => (
        <RecommendationCard
          key={recommendation.id}
          recommendation={recommendation}
          isLiked={userLikes.includes(recommendation.id)}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
};
