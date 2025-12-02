import { create } from 'zustand';
import { psychologistService } from '../services/psychologistService';

interface Student {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  codigo_estudiante: string;
  nivel_alerta?: string;
  ultima_nota?: string;
  fecha_ultima_nota?: string;
  proxima_cita?: string;
}

interface Alert {
  id: number;
  estudiante_id: number;
  estudiante_nombre: string;
  tipo: string;
  nivel: string;
  mensaje: string;
  fecha_creacion: string;
  leida: boolean;
}

interface PsychologistStore {
  students: Student[];
  alerts: Alert[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStudents: (psychologistId: number) => Promise<void>;
  fetchAlerts: (psychologistId: number) => Promise<void>;
  markAlertAsRead: (alertId: number) => Promise<boolean>;
  setSelectedStudent: (student: Student | null) => void;
  clearError: () => void;
}

export const usePsychologistStore = create<PsychologistStore>((set, get) => ({
  students: [],
  alerts: [],
  selectedStudent: null,
  isLoading: false,
  error: null,

  fetchStudents: async (psychologistId: number) => {
    set({ isLoading: true, error: null });
    try {
      const students = await psychologistService.getAssignedStudents(psychologistId);
      set({ students, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al obtener estudiantes',
        isLoading: false,
      });
    }
  },

  fetchAlerts: async (psychologistId: number) => {
    set({ isLoading: true, error: null });
    try {
      const alerts = await psychologistService.getAlerts(psychologistId);
      set({ alerts, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al obtener alertas',
        isLoading: false,
      });
    }
  },

  markAlertAsRead: async (alertId: number) => {
    try {
      await psychologistService.markAlertAsRead(alertId);
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === alertId ? { ...alert, leida: true } : alert
        ),
      }));
      return true;
    } catch (error: any) {
      set({ error: error.message || 'Error al marcar alerta como leída' });
      return false;
    }
  },

  setSelectedStudent: (student: Student | null) => {
    set({ selectedStudent: student });
  },

  clearError: () => {
    set({ error: null });
  },
}));
