"""
Cliente de Supabase (Singleton).
Proporciona una única instancia del cliente de base de datos.
"""
from supabase import create_client, Client
from functools import lru_cache
from app.config.settings import get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """
    Retorna una instancia única del cliente de Supabase (Singleton).
    Usa lru_cache para garantizar una sola instancia en toda la aplicación.

    Returns:
        Client: Cliente de Supabase configurado
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_key)
