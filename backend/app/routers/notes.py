"""
Router de notas.
Gestiona las rutas relacionadas con el diario de notas.
"""
from fastapi import APIRouter

from app.models.schemas import Note
from app.services.notes_service import notes_service

router = APIRouter(
    prefix="/notas",
    tags=["Notas"]
)


@router.get("/{user_id}")
async def obtener_notas_por_usuario(user_id: str):
    """
    Obtiene todas las notas de un usuario específico.

    Args:
        user_id: ID del usuario.

    Returns:
        Diccionario con las notas del usuario.
    """
    notas = await notes_service.obtener_notas_por_usuario(user_id)
    return {
        "message": "Notas recuperadas con éxito" if notas else "No se encontraron notas para este usuario",
        "data": notas
    }


@router.post("")
async def guardar_nota(note_data: Note):
    """
    Analiza y guarda una nueva nota en la base de datos.

    Args:
        note_data: Datos de la nota.

    Returns:
        Diccionario con la nota guardada.
    """
    return await notes_service.guardar_nota(
        note_data.note,
        note_data.user_id
    )
