// Configuración centralizada de la API
// En desarrollo: http://127.0.0.1:8000
// En producción: usar variable de entorno VITE_API_URL

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const getApiUrl = () => API_URL;

export default API_URL;

