/**
 * Cliente HTTP centralizado con interceptores
 * Manejo de autenticación, errores y configuración base
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import config from '../config';
import { ApiError, ApiResponse } from '../types';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Request Interceptor ====================
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Agregar token de autenticación si existe
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.access_token) {
          config.headers.Authorization = `Bearer ${user.access_token}`;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==================== Response Interceptor ====================
apiClient.interceptors.response.use(
  (response) => {
    // Retornar solo los datos de la respuesta
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Manejo centralizado de errores
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;

        case 403:
          console.error('Forbidden: No tienes permisos para esta acción');
          break;

        case 404:
          console.error('Not Found: Recurso no encontrado');
          break;

        case 500:
          console.error('Server Error: Error interno del servidor');
          break;

        default:
          console.error(`Error ${status}:`, data?.detail || 'Error desconocido');
      }

      return Promise.reject({
        status,
        message: data?.detail || 'Error en la petición',
      });
    } else if (error.request) {
      // Error de red
      console.error('Network Error: Sin respuesta del servidor');
      return Promise.reject({
        status: 0,
        message: 'Error de conexión. Verifica tu conexión a internet.',
      });
    } else {
      // Error al configurar la petición
      console.error('Error:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
      });
    }
  }
);

// ==================== Helper Functions ====================

/**
 * GET request
 */
export const get = async <T = any>(url: string, params?: any): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.data !== undefined ? response.data.data : (response.data as T);
};

/**
 * POST request
 */
export const post = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data !== undefined ? response.data.data : (response.data as T);
};

/**
 * PUT request
 */
export const put = async <T = any>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  return response.data.data !== undefined ? response.data.data : (response.data as T);
};

/**
 * DELETE request
 */
export const del = async <T = any>(url: string): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.data !== undefined ? response.data.data : (response.data as T);
};

/**
 * PATCH request
 */
export const patch = async <T = any>(url: string, data?: any): Promise<T> => {
  const response = await apiClient.patch<ApiResponse<T>>(url, data);
  return response.data.data !== undefined ? response.data.data : (response.data as T);
};

export default apiClient;
