"""
Módulo de routers de la API.
"""
from app.routers import (
    auth,
    users,
    notes,
    analysis,
    recommendations
)

__all__ = [
    "auth",
    "users",
    "notes",
    "analysis",
    "recommendations"
]
