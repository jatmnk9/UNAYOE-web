"""
Router de notas del diario.
Maneja endpoints de creación y consulta de notas.
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from app.models.schemas import Note, MessageResponse
from app.services.notes_service import get_notes_service, NotesService
from app.services.alert_service import get_alert_service, AlertService

router = APIRouter(prefix="/notas", tags=["Notas"])


@router.get("/{user_id}")
async def get_notas_by_user(
    user_id: str,
    notes_service: NotesService = Depends(get_notes_service)
):
    """Obtiene todas las notas de un usuario específico."""
    notas = notes_service.obtener_notas_por_usuario(user_id)

    if not notas:
        return {"message": "No se encontraron notas para este usuario", "data": []}

    return {"message": "Notas recuperadas con éxito", "data": notas}


@router.post("", response_model=MessageResponse)
async def guardar_nota(
    note_data: Note,
    background_tasks: BackgroundTasks,
    notes_service: NotesService = Depends(get_notes_service),
    alert_service: AlertService = Depends(get_alert_service)
):
    """
    Analiza y guarda una nueva nota en la base de datos.
    Dispara alerta en background si detecta palabras severas.
    """
    nota_guardada = notes_service.guardar_nota(
        note_data.note,
        note_data.user_id
    )

    background_tasks.add_task(
        alert_service.trigger_alert_if_keywords,
        note_data.user_id,
        note_data.note
    )

    return {
        "message": "Nota guardada con éxito",
        "data": nota_guardada
    }
