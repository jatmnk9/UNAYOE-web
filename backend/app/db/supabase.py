"""
Cliente de Supabase.
Gestiona la conexión y proporciona una instancia única del cliente.
"""
from supabase import create_client, Client
from app.config.settings import settings


_supabase_client: Client | None = None


def get_supabase_client() -> Client:
    """
    Obtiene la instancia del cliente de Supabase (Singleton).

    Returns:
        Client: Instancia del cliente de Supabase.
    """
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )

    return _supabase_client
