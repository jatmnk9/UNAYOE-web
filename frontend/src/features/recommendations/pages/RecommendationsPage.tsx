import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { useAuth } from '../../auth/hooks/useAuth';
import { RecommendationList } from '../components/RecommendationList';
import { PersonalizedRecommendation } from '../components/PersonalizedRecommendation';
import { Button } from '../../../shared/components/ui/button';
import { useToast } from '../../../shared/components/ui/toast';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    recommendations,
    personalizedRecommendation,
    userLikes,
    isLoading,
    fetchRecommendations,
    fetchPersonalizedRecommendation,
    fetchUserLikes,
    toggleLike,
  } = useRecommendations();

  const { success: showSuccess, error: showError } = useToast();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchRecommendations();
    if (user?.id) {
      fetchUserLikes(user.id);
    }
  }, [user?.id]);

  const handleGeneratePersonalized = async () => {
    if (!user?.id) return;
    await fetchPersonalizedRecommendation(user.id);
  };

  const handleToggleLike = async (recommendationId: number) => {
    if (!user?.id) return;

    const success = await toggleLike(user.id, recommendationId);
    if (success) {
      showSuccess('Preferencia actualizada');
    } else {
      showError('Error al actualizar preferencia');
    }
  };

  const filteredRecommendations = React.useMemo(() => {
    if (filter === 'all') return recommendations;
    return recommendations.filter((rec) => rec.categoria === filter);
  }, [recommendations, filter]);

  const categories = React.useMemo(() => {
    const cats = new Set(recommendations.map((rec) => rec.categoria));
    return ['all', ...Array.from(cats)];
  }, [recommendations]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-dark)]">
          Recomendaciones
        </h1>
        <p className="text-gray-600">
          Recursos y consejos para tu bienestar académico y emocional
        </p>
      </div>

      {personalizedRecommendation ? (
        <PersonalizedRecommendation
          recommendation={personalizedRecommendation}
          isLiked={userLikes.includes(personalizedRecommendation.id)}
          onToggleLike={handleToggleLike}
        />
      ) : (
        <div className="rounded-lg bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-accent)]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-1 text-lg font-semibold text-[var(--color-dark)]">
                Obtén una recomendación personalizada
              </h3>
              <p className="text-sm text-gray-600">
                Basada en tus notas del diario y estado emocional reciente
              </p>
            </div>
            <Button onClick={handleGeneratePersonalized} isLoading={isLoading}>
              Generar recomendación
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[var(--color-dark)]">
            Todas las Recomendaciones
          </h2>

          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(category)}
              >
                {category === 'all' ? 'Todas' : category}
              </Button>
            ))}
          </div>
        </div>

        <RecommendationList
          recommendations={filteredRecommendations}
          userLikes={userLikes}
          isLoading={isLoading}
          onToggleLike={handleToggleLike}
        />
      </div>
    </div>
  );
};
