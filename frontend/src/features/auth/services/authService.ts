/**
 * Servicio de Autenticación
 * Maneja login, logout y registro de usuarios
 */

import { get, post } from '../../../core/api/client';
import { AuthResponse, LoginCredentials, SignupData, User } from '../../../core/types';

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await post<{ user: User }>('/login', credentials);
    return response;
  }

  /**
   * Registrar nuevo usuario
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await post<{ user: User }>('/signup', data);
    return response;
  }

  /**
   * Cerrar sesión (solo limpia el estado local)
   */
  logout(): void {
    localStorage.removeItem('user');
  }

  /**
   * Obtener usuario actual del localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Guardar usuario en localStorage
   */
  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken(): string | null {
    const user = this.getCurrentUser();
    return user?.access_token || null;
  }
}

export const authService = new AuthService();
export default authService;
