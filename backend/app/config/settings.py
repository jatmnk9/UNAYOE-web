"""
Application settings and configuration
Loads environment variables and provides centralized configuration
"""
import os
from typing import List

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using environment variables directly.")
    pass


class Settings:
    """Application settings loaded from environment variables"""
    
    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    
    # Gemini AI Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    
    # Email Configuration
    GMAIL_SENDER: str = os.getenv("GMAIL_SENDER", "")
    GMAIL_SMTP_PASSWORD: str = os.getenv("GMAIL_SMTP_PASSWORD", "")
    ALERT_FALLBACK_EMAIL: str = os.getenv("ALERT_FALLBACK_EMAIL", "")
    
    # Gmail API Configuration (Optional)
    GMAIL_SERVICE_ACCOUNT_JSON: str = os.getenv("GMAIL_SERVICE_ACCOUNT_JSON", "")
    GMAIL_DELEGATED_USER: str = os.getenv("GMAIL_DELEGATED_USER", "")
    
    # CORS Configuration
    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Encryption Configuration
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")
    
    @classmethod
    def validate(cls) -> None:
        """Validate that required environment variables are set"""
        required_vars = {
            "SUPABASE_URL": cls.SUPABASE_URL,
            "SUPABASE_SERVICE_KEY": cls.SUPABASE_SERVICE_KEY,
        }
        
        missing = [key for key, value in required_vars.items() if not value]
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}. "
                f"Please check your .env file."
            )


# Global settings instance
settings = Settings()
