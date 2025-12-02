"""
Punto de entrada principal de la aplicación UNAYOE.
Configura FastAPI con todos los routers y middleware.
"""
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import get_settings
from app.models.schemas import HealthResponse
from app.routers import (
    auth,
    users,
    notes,
    analysis,
    recommendations,
    appointments
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.api_version,
    description="Sistema backend para análisis de bienestar estudiantil con NLP",
    debug=settings.debug
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(notes.router)
app.include_router(analysis.router)
app.include_router(recommendations.router)
app.include_router(appointments.router)


@app.get("/", response_model=HealthResponse)
async def root():
    """Endpoint raíz - Health check."""
    return {
        "status": "healthy",
        "version": settings.api_version,
        "timestamp": datetime.utcnow()
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.api_version,
        "timestamp": datetime.utcnow()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
