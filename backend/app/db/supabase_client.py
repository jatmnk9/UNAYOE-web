"""
Supabase database client
Provides singleton instance for database operations
"""
from supabase import create_client, Client
from app.config.settings import settings


class SupabaseClient:
    """Singleton Supabase client"""
    _instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get or create Supabase client instance"""
        if cls._instance is None:
            # Use settings or fallback to environment variables for backward compatibility
            supabase_url = settings.SUPABASE_URL or ""
            supabase_key = settings.SUPABASE_SERVICE_KEY or ""
            
            if not supabase_url or not supabase_key:
                raise ValueError(
                    "Supabase credentials not configured. "
                    "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env file"
                )
            
            cls._instance = create_client(supabase_url, supabase_key)
        return cls._instance


# Export singleton instance
supabase: Client = SupabaseClient.get_client()
