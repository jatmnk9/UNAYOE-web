import { useAppointmentsStore } from '../store/appointmentsStore';

/**
 * Hook personalizado para acceder al estado y acciones de citas
 * Simplifica el acceso al store de appointments
 *
 * @example
 * const { appointments, isLoading, createAppointment } = useAppointments();
 *
 * useEffect(() => {
 *   fetchAppointments(user.id);
 *   fetchAvailablePsychologists();
 * }, []);
 */
export const useAppointments = () => {
  const {
    appointments,
    availablePsychologists,
    isLoading,
    error,
    fetchAppointments,
    fetchAvailablePsychologists,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    clearError,
    reset,
  } = useAppointmentsStore();

  return {
    appointments,
    availablePsychologists,
    isLoading,
    error,
    fetchAppointments,
    fetchAvailablePsychologists,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    clearError,
    reset,
  };
};
