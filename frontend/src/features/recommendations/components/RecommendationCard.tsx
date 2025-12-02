import * as React from 'react';
import { Recommendation } from '../../../core/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

interface RecommendationCardProps {
  recommendation: Recommendation;
  isLiked: boolean;
  onToggleLike: (id: number) => void;
}

/**
 * Tarjeta para mostrar una recomendación
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isLiked,
  onToggleLike,
}) => {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recommendation.titulo}</CardTitle>
          <Badge variant={recommendation.categoria === 'Académico' ? 'default' : 'secondary'}>
            {recommendation.categoria}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{recommendation.descripcion}</p>

        {recommendation.url && (
          <a
            href={recommendation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Ver más información
          </a>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-xs text-gray-500">
            {recommendation.likes_count || 0} personas encontraron esto útil
          </span>

          <Button
            variant={isLiked ? 'default' : 'outline'}
            size="sm"
            onClick={() => onToggleLike(recommendation.id)}
            className="gap-2"
          >
            <svg
              className="h-4 w-4"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {isLiked ? 'Me gusta' : 'Útil'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
