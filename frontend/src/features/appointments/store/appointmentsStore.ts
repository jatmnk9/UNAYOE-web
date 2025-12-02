import { create } from 'zustand';
import { Appointment } from '../../../core/types';
import { appointmentsService } from '../services/appointmentsService';

interface AppointmentsState {
  appointments: Appointment[];
  availablePsychologists: any[];
  isLoading: boolean;
  error: string | null;
}

interface AppointmentsActions {
  setAppointments: (appointments: Appointment[]) => void;
  setAvailablePsychologists: (psychologists: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAppointments: (userId: string) => Promise<void>;
  fetchAvailablePsychologists: () => Promise<void>;
  createAppointment: (appointmentData: any) => Promise<boolean>;
  updateAppointment: (appointmentId: number, appointmentData: any) => Promise<boolean>;
  deleteAppointment: (appointmentId: number) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

type AppointmentsStore = AppointmentsState & AppointmentsActions;

/**
 * Store global de citas usando Zustand
 * Gestiona el estado de las citas y psicólogos disponibles
 */
export const useAppointmentsStore = create<AppointmentsStore>((set) => ({
  appointments: [],
  availablePsychologists: [],
  isLoading: false,
  error: null,

  setAppointments: (appointments) => set({ appointments }),

  setAvailablePsychologists: (psychologists) =>
    set({ availablePsychologists: psychologists }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      appointments: [],
      availablePsychologists: [],
      isLoading: false,
      error: null,
    }),

  fetchAppointments: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const appointments = await appointmentsService.getAppointmentsByUser(userId);
      set({ appointments, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar las citas',
        isLoading: false,
      });
    }
  },

  fetchAvailablePsychologists: async () => {
    set({ isLoading: true, error: null });

    try {
      const psychologists = await appointmentsService.getAvailablePsychologists();
      set({ availablePsychologists: psychologists, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar psicólogos disponibles',
        isLoading: false,
      });
    }
  },

  createAppointment: async (appointmentData) => {
    set({ isLoading: true, error: null });

    try {
      const newAppointment = await appointmentsService.createAppointment(appointmentData);

      set((state) => ({
        appointments: [newAppointment, ...state.appointments],
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al crear la cita',
        isLoading: false,
      });
      return false;
    }
  },

  updateAppointment: async (appointmentId, appointmentData) => {
    set({ isLoading: true, error: null });

    try {
      const updatedAppointment = await appointmentsService.updateAppointment(
        appointmentId,
        appointmentData
      );

      set((state) => ({
        appointments: state.appointments.map((app) =>
          app.id === appointmentId ? updatedAppointment : app
        ),
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al actualizar la cita',
        isLoading: false,
      });
      return false;
    }
  },

  deleteAppointment: async (appointmentId) => {
    set({ isLoading: true, error: null });

    try {
      await appointmentsService.deleteAppointment(appointmentId);

      set((state) => ({
        appointments: state.appointments.filter((app) => app.id !== appointmentId),
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al eliminar la cita',
        isLoading: false,
      });
      return false;
    }
  },
}));
