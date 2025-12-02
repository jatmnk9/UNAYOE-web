import * as React from 'react';
import { Recommendation } from '../../../core/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';

interface PersonalizedRecommendationProps {
  recommendation: Recommendation;
  isLiked: boolean;
  onToggleLike: (id: number) => void;
}

/**
 * Tarjeta destacada para mostrar la recomendación personalizada
 */
export const PersonalizedRecommendation: React.FC<PersonalizedRecommendationProps> = ({
  recommendation,
  isLiked,
  onToggleLike,
}) => {
  return (
    <Card className="border-l-4 border-[var(--color-primary)] bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <Badge variant="default">Recomendación Personalizada</Badge>
          <Badge variant="secondary">{recommendation.categoria}</Badge>
        </div>

        <CardTitle className="text-2xl">{recommendation.titulo}</CardTitle>
        <CardDescription className="text-base">
          Esta recomendación se generó especialmente para ti
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-700">{recommendation.descripcion}</p>

        {recommendation.url && (
          <a
            href={recommendation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-[var(--color-primary)] hover:underline"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-sm text-gray-600">
            ¿Te resultó útil esta recomendación?
          </span>

          <Button
            variant={isLiked ? 'default' : 'outline'}
            onClick={() => onToggleLike(recommendation.id)}
            className="gap-2"
          >
            <svg
              className="h-5 w-5"
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
            {isLiked ? 'Me gusta' : 'Marcar como útil'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
