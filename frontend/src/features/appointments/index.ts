/**
 * Feature: Citas
 * Exportación centralizada de todos los módulos de citas
 */

// Services
export { appointmentsService } from './services/appointmentsService';

// Store
export { useAppointmentsStore } from './store/appointmentsStore';

// Hooks
export { useAppointments } from './hooks/useAppointments';

// Components
export { AppointmentForm, AppointmentCard, AppointmentList } from './components';

// Pages
export { AppointmentsPage } from './pages';
