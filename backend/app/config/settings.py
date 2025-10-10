"""
Configuración centralizada de la aplicación.
Gestiona variables de entorno y configuraciones globales.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union


class Settings(BaseSettings):
    """
    Configuraciones de la aplicación.
    Lee valores desde variables de entorno.
    """
    # API Configuration
    app_name: str = "API de Análisis de Bienestar"
    debug: bool = True

    # Supabase Configuration
    supabase_url: str = "https://xygadfvudziwnddcicbb.supabase.co"
    supabase_key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z2FkZnZ1ZHppd25kZGNpY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxOTczNCwiZXhwIjoyMDc1MDk1NzM0fQ.KSc84hsragAyua8RhRaekeiJ1mPqtI28sXZmOzdQKOg" 

    # CORS Configuration - Acepta tanto string como lista
    cors_origins: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    # NLP Model Configuration
    sentiment_model: str = "pysentimiento/robertuito-sentiment-analysis"
    emotion_model: str = "pysentimiento/robertuito-emotion-analysis"
    fallback_model: str = "dccuchile/bert-base-spanish-wwm-cased"

    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Convierte string separado por comas en lista o mantiene lista existente."""
        if isinstance(v, str):
            # Si es un string, lo dividimos por comas
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        elif isinstance(v, list):
            # Si ya es una lista, la devolvemos tal cual
            return v
        return v

    def get_cors_origins(self) -> List[str]:
        """Retorna los orígenes CORS como lista."""
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(',') if origin.strip()]
        return self.cors_origins

    class Config:
        """Configuración de Pydantic."""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


settings = Settings()
