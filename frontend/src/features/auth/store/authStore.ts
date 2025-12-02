import { create } from 'zustand';
import { User } from '../../../core/types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    nombre: string,
    email: string,
    password: string,
    rol: 'estudiante' | 'psicologo'
  ) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Store global de autenticación usando Zustand
 * Gestiona el estado del usuario y las operaciones de auth
 */
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al iniciar sesión',
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (nombre, email, password, rol) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.signup({
        nombre,
        email,
        password,
        rol,
      });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al registrarse',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const user = authService.getCurrentUser();
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));
