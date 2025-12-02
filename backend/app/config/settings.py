"""
Configuración centralizada de la aplicación.
Utiliza Pydantic Settings para gestión de variables de entorno.
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
from functools import lru_cache


class Settings(BaseSettings):
    """
    Configuración de la aplicación.
    Lee automáticamente del archivo .env
    """
    # =========================================================
    # CONFIGURACIÓN DE LA APLICACIÓN
    # =========================================================
    app_name: str = "API de Análisis de Bienestar"
    debug: bool = True
    api_version: str = "2.0.0"

    # =========================================================
    # CONFIGURACIÓN DE SUPABASE
    # =========================================================
    supabase_url: str
    supabase_key: str

    # =========================================================
    # CONFIGURACIÓN DE CORS
    # =========================================================
    cors_origins: Union[str, List[str]] = "http://localhost:5173,http://127.0.0.1:5173"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """Convierte string separado por comas en lista."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # =========================================================
    # CONFIGURACIÓN DE MODELOS NLP
    # =========================================================
    sentiment_model: str = "pysentimiento/robertuito-sentiment-analysis"
    emotion_model: str = "pysentimiento/robertuito-emotion-analysis"
    fallback_model: str = "dccuchile/bert-base-spanish-wwm-cased"

    # =========================================================
    # CONFIGURACIÓN DE GEMINI AI
    # =========================================================
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # =========================================================
    # CONFIGURACIÓN DE EMAIL
    # =========================================================
    gmail_sender: str = ""
    gmail_smtp_password: str = ""
    alert_fallback_email: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna una instancia única de Settings (Singleton).
    Usa lru_cache para garantizar una sola instancia.
    """
    return Settings()
