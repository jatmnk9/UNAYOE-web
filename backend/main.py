"""
API de Análisis de Bienestar Estudiantil.

Sistema de análisis de notas con procesamiento de lenguaje natural,
detección de emociones y sistema de recomendaciones personalizadas.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routers import (
    auth,
    users,
    notes,
    analysis,
    recommendations,
    appointments
)


def create_application() -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.

    Returns:
        FastAPI: Instancia de la aplicación configurada.
    """
    application = FastAPI(
        title=settings.app_name,
        description="API para análisis de bienestar estudiantil con NLP",
        version="2.0.0",
        debug=settings.debug
    )

    # Configurar CORS
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins(),
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Registrar routers
    application.include_router(auth.router)
    application.include_router(users.router)
    application.include_router(notes.router)
    application.include_router(analysis.router)
    application.include_router(recommendations.router)
    application.include_router(recommendations.router_likes)
    application.include_router(appointments.router)

    return application


# Crear instancia de la aplicación
app = create_application()


@app.get("/")
async def root():
    """
    Ruta raíz de la API.

    Returns:
        Diccionario con información de la API.
    """
    return {
        "message": "API de Análisis de Bienestar Estudiantil",
        "version": "2.0.0",
        "status": "active",
        "endpoints": {
            "auth": "/login",
            "users": "/usuarios",
            "notes": "/notas",
            "analysis": "/analyze, /export",
            "recommendations": "/recomendaciones",
            "likes": "/likes",
            "appointments": "/citas"
        }
    }


@app.get("/health")
async def health_check():
    """
    Verifica el estado de salud de la API.

    Returns:
        Diccionario con el estado de la API.
    """
    return {
        "status": "healthy",
        "app_name": settings.app_name
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
