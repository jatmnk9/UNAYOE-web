"""
Router de recomendaciones.
Gestiona las rutas relacionadas con el sistema de recomendaciones.
"""
from fastapi import APIRouter

from app.services.recommendations_service import recommendations_service

router = APIRouter(
    prefix="/recomendaciones",
    tags=["Recomendaciones"]
)


@router.get("/todas")
async def obtener_todas_recomendaciones():
    """
    Obtiene todas las recomendaciones disponibles.

    Returns:
        Diccionario con todas las recomendaciones.
    """
    recomendaciones = await recommendations_service.obtener_todas_recomendaciones()
    return {
        "message": "Todas las recomendaciones recuperadas con éxito" if recomendaciones else "No se encontraron recomendaciones",
        "data": recomendaciones
    }


@router.get("/favoritos/{user_id}")
async def obtener_recomendaciones_favoritas(user_id: str):
    """
    Obtiene las recomendaciones favoritas de un usuario.

    Args:
        user_id: ID del usuario.

    Returns:
        Diccionario con las recomendaciones favoritas.
    """
    favoritas = await recommendations_service.obtener_favoritos_usuario(user_id)
    return {
        "message": "Favoritos recuperados con éxito" if favoritas else "No se encontraron recomendaciones favoritas",
        "data": favoritas
    }


@router.get("/{user_id}")
async def obtener_recomendaciones_personalizadas(user_id: str):
    """
    Genera recomendaciones personalizadas para un usuario.

    Args:
        user_id: ID del usuario.

    Returns:
        Diccionario con las recomendaciones personalizadas.
    """
    return await recommendations_service.obtener_recomendaciones_personalizadas(user_id)


# =========================================================
# RUTAS DE LIKES
# =========================================================

router_likes = APIRouter(
    prefix="/likes",
    tags=["Likes"]
)


@router_likes.post("/{user_id}/{recomendacion_id}")
async def agregar_like(user_id: str, recomendacion_id: str):
    """
    Agrega un like a una recomendación.

    Args:
        user_id: ID del usuario.
        recomendacion_id: ID de la recomendación.

    Returns:
        Diccionario con mensaje de confirmación.
    """
    return await recommendations_service.agregar_like(user_id, recomendacion_id)


@router_likes.delete("/{user_id}/{recomendacion_id}")
async def eliminar_like(user_id: str, recomendacion_id: str):
    """
    Elimina un like de una recomendación.

    Args:
        user_id: ID del usuario.
        recomendacion_id: ID de la recomendación.

    Returns:
        Diccionario con mensaje de confirmación.
    """
    return await recommendations_service.eliminar_like(user_id, recomendacion_id)


@router_likes.get("/{user_id}")
async def obtener_likes_usuario(user_id: str):
    """
    Obtiene los IDs de las recomendaciones que le gustan al usuario.

    Args:
        user_id: ID del usuario.

    Returns:
        Lista de IDs de recomendaciones.
    """
    return await recommendations_service.obtener_likes_usuario(user_id)
