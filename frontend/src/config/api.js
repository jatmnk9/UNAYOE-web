// Configuración centralizada de la API
// En desarrollo: http://localhost:8000
// En producción: usar variable de entorno VITE_BACKEND_URL

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  return fetch(url, options);
};

export const getApiUrl = () => API_BASE_URL;

export default API_BASE_URL;

