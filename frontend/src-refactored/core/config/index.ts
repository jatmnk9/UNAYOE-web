/**
 * Configuración centralizada de la aplicación
 * Uso de variables de entorno para diferentes ambientes
 */

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
  };
  features: {
    enableAI: boolean;
    enableAnalytics: boolean;
  };
}

const config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
    timeout: 30000, // 30 segundos
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'UNAYOE Bienestar',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  features: {
    enableAI: import.meta.env.VITE_ENABLE_AI_FEATURES === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
};

export default config;
