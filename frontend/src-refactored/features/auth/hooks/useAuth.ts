import { useAuthStore } from '../store/authStore';

/**
 * Hook personalizado para acceder al estado y acciones de autenticación
 * Simplifica el acceso al store de auth
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * const handleLogin = async () => {
 *   const success = await login(email, password);
 *   if (success) {
 *     navigate('/student/dashboard');
 *   }
 * };
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  };
};
