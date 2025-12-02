import { usePsychologistStore } from '../store/psychologistStore';

/**
 * Hook personalizado para acceder al store del psicólogo
 */
export const usePsychologist = () => {
  const store = usePsychologistStore();

  return {
    students: store.students,
    alerts: store.alerts,
    selectedStudent: store.selectedStudent,
    isLoading: store.isLoading,
    error: store.error,
    fetchStudents: store.fetchStudents,
    fetchAlerts: store.fetchAlerts,
    markAlertAsRead: store.markAlertAsRead,
    setSelectedStudent: store.setSelectedStudent,
    clearError: store.clearError,
  };
};
