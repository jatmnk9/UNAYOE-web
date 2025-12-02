"""
Router de citas médicas.
Maneja endpoints de gestión de citas.
"""
from fastapi import APIRouter, Depends, Query
from app.models.schemas import (
    CitaCreate,
    CitaUpdate,
    CitaAsignarPsicologo,
    CitaResponse,
    MessageResponse
)
from app.services.appointments_service import (
    get_appointments_service,
    AppointmentsService
)
from app.services.users_service import get_users_service, UsersService

router = APIRouter(prefix="/citas", tags=["Citas"])


@router.post("", response_model=CitaResponse)
async def crear_cita(
    cita_data: CitaCreate,
    id_usuario: str = Query(..., description="ID del usuario que crea la cita"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Crea una nueva cita. Solo estudiantes pueden crear citas."""
    return appointments_service.crear_cita(cita_data, id_usuario)


@router.get("/pendientes")
async def obtener_citas_pendientes(
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Obtiene citas sin psicólogo asignado."""
    citas = appointments_service.obtener_citas_pendientes()
    return {
        "message": "Citas pendientes recuperadas con éxito",
        "data": citas
    }


@router.get("/todas")
async def obtener_todas_las_citas(
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Obtiene todas las citas del sistema."""
    citas = appointments_service.obtener_todas_las_citas()
    return {
        "message": "Todas las citas recuperadas con éxito",
        "data": citas
    }


@router.get("/usuario/{id_usuario}")
async def obtener_citas_usuario(
    id_usuario: str,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """
    Obtiene citas de un usuario específico.
    - Estudiante: citas creadas
    - Psicólogo: citas asignadas
    """
    citas = appointments_service.obtener_citas_usuario(id_usuario)
    return {
        "message": "Citas del usuario recuperadas con éxito",
        "data": citas
    }


@router.get("/{id_cita}", response_model=CitaResponse)
async def obtener_cita_por_id(
    id_cita: int,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Obtiene una cita por ID."""
    return appointments_service.obtener_cita_por_id(id_cita)


@router.put("/{id_cita}/asignar-psicologo", response_model=CitaResponse)
async def asignar_psicologo(
    id_cita: int,
    asignacion: CitaAsignarPsicologo,
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Asigna un psicólogo a una cita."""
    return appointments_service.asignar_psicologo(id_cita, asignacion)


@router.put("/{id_cita}", response_model=CitaResponse)
async def actualizar_cita(
    id_cita: int,
    cita_update: CitaUpdate,
    id_usuario: str = Query(..., description="ID del usuario que actualiza"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Actualiza una cita. Solo el creador puede actualizar."""
    return appointments_service.actualizar_cita(id_cita, cita_update, id_usuario)


@router.delete("/{id_cita}", response_model=MessageResponse)
async def eliminar_cita(
    id_cita: int,
    id_usuario: str = Query(..., description="ID del usuario que elimina"),
    appointments_service: AppointmentsService = Depends(get_appointments_service)
):
    """Elimina una cita. Solo el creador puede eliminar."""
    return appointments_service.eliminar_cita(id_cita, id_usuario)


@router.get("/psicologos/disponibles")
async def obtener_psicologos_disponibles(
    users_service: UsersService = Depends(get_users_service)
):
    """Obtiene lista de psicólogos disponibles."""
    psicologos = users_service.obtener_psicologos_disponibles()
    return {
        "message": "Psicólogos disponibles recuperados con éxito",
        "data": psicologos
    }
