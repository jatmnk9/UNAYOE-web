/**
 * Feature: Psicólogo
 * Exportación centralizada de todos los módulos del dashboard del psicólogo
 */

// Services
export { psychologistService } from './services/psychologistService';

// Store
export { usePsychologistStore } from './store/psychologistStore';

// Hooks
export { usePsychologist } from './hooks/usePsychologist';

// Components
export {
  StudentCard,
  StudentList,
  AlertCard,
  AlertList,
  StudentDetailModal,
} from './components';

// Pages
export { PsychologistDashboardPage } from './pages';
