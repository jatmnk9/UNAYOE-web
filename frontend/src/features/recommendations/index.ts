/**
 * Feature: Recomendaciones
 * Exportación centralizada de todos los módulos de recomendaciones
 */

// Services
export { recommendationsService } from './services/recommendationsService';

// Store
export { useRecommendationsStore } from './store/recommendationsStore';

// Hooks
export { useRecommendations } from './hooks/useRecommendations';

// Components
export {
  RecommendationCard,
  RecommendationList,
  PersonalizedRecommendation,
} from './components';

// Pages
export { RecommendationsPage } from './pages';
