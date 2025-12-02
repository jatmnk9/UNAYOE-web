"""
Router de recomendaciones.
Maneja endpoints de recomendaciones y likes.
"""
from typing import List
from fastapi import APIRouter, Depends
from app.services.recommendations_service import (
    get_recommendations_service,
    RecommendationsService
)

router = APIRouter(tags=["Recomendaciones"])


@router.get("/recomendaciones/todas")
async def obtener_todas_las_recomendaciones(
    recs_service: RecommendationsService = Depends(get_recommendations_service)
):
    """Recupera todas las entradas de la tabla 'recomendaciones'."""
    recomendaciones = recs_service.obtener_todas_recomendaciones()

    if not recomendaciones:
        return {"message": "No se encontraron recomendaciones", "data": []}

    return {
        "message": "Todas las recomendaciones recuperadas con éxito",
        "data": recomendaciones
    }


@router.get("/recomendaciones/{user_id}")
async def obtener_recomendaciones(
    user_id: str,
    recs_service: RecommendationsService = Depends(get_recommendations_service)
):
    """
    Genera recomendaciones personalizadas considerando emociones recientes
    y gustos del usuario.
    """
    return recs_service.obtener_recomendaciones_personalizadas(user_id)


@router.get("/recomendaciones/favoritos/{user_id}")
async def obtener_recomendaciones_favoritas(
    user_id: str,
    recs_service: RecommendationsService = Depends(get_recommendations_service)
):
    """Obtiene los detalles completos de las recomendaciones favoritas del usuario."""
    favoritas = recs_service.obtener_favoritos_usuario(user_id)

    if not favoritas:
        return {
            "message": "No se encontraron recomendaciones favoritas",
            "data": []
        }

    return {
        "message": "Favoritos recuperados con éxito",
        "data": favoritas
    }


@router.post("/likes/{user_id}/{recomendacion_id}")
async def agregar_like(
    user_id: str,
    recomendacion_id: str,
    recs_service: RecommendationsService = Depends(get_recommendations_service)
):
    """Agrega un like a una recomendación."""
    return recs_service.agregar_like(user_id, recomendacion_id)


@router.delete("/likes/{user_id}/{recomendacion_id}")
async def eliminar_like(
    user_id: str,
    recomendacion_id: str,
    recs_service: RecommendationsService = Depends(get_recommendations_service)
):
    """Elimina un like de una recomendación."""
    return recs_service.eliminar_like(user_id, recomendacion_id)


@router.get("/likes/{user_id}")
async def obtener_likes_usuario(
    user_id: str,
    recs_service: RecommendationsService = Depends(get_recommendations_service)
) -> List[str]:
    """Obtiene IDs de recomendaciones con like del usuario."""
    return recs_service.obtener_likes_usuario(user_id)
