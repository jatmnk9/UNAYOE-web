"""
Router de citas.
Gestiona todos los endpoints relacionados con las citas médicas.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from app.models.schemas import (
    CitaCreate,
    CitaUpdate,
    CitaAsignarPsicologo,
    CitaResponse,
    CitasListResponse,
    MessageResponse
)
from app.services.appointments_service import appointments_service


router = APIRouter(
    prefix="/citas",
    tags=["Citas"]
)


@router.post(
    "",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nueva cita"
)
async def crear_cita(cita: CitaCreate, id_usuario: str):
    """
    Crea una nueva cita para un estudiante.

    - **titulo**: Título o motivo de la cita
    - **fecha_cita**: Fecha y hora programada para la cita
    - **id_usuario**: ID del estudiante que crea la cita

    Solo los usuarios con rol 'estudiante' pueden crear citas.
    """
    return await appointments_service.crear_cita(cita, id_usuario)


@router.get(
    "/pendientes",
    response_model=CitasListResponse,
    summary="Obtener citas pendientes de asignación"
)
async def obtener_citas_pendientes():
    """
    Obtiene todas las citas que aún no tienen psicólogo asignado.

    Este endpoint es útil para que el administrador pueda ver
    qué citas necesitan ser asignadas a un psicólogo.

    Solo accesible para usuarios con rol 'administrador'.
    """
    citas = await appointments_service.obtener_citas_pendientes()
    return {
        "message": "Citas pendientes obtenidas exitosamente",
        "total": len(citas),
        "data": citas
    }


@router.get(
    "/todas",
    response_model=CitasListResponse,
    summary="Obtener todas las citas del sistema"
)
async def obtener_todas_las_citas():
    """
    Obtiene todas las citas del sistema con información completa.

    Incluye citas con y sin psicólogo asignado.
    Solo accesible para usuarios con rol 'administrador'.
    """
    citas = await appointments_service.obtener_todas_las_citas()
    return {
        "message": "Todas las citas obtenidas exitosamente",
        "total": len(citas),
        "data": citas
    }


@router.get(
    "/usuario/{id_usuario}",
    summary="Obtener citas de un usuario"
)
async def obtener_citas_usuario(id_usuario: str):
    """
    Obtiene las citas asociadas a un usuario específico.

    - Si es **estudiante**: Retorna las citas que ha creado
    - Si es **psicólogo**: Retorna las citas que le han sido asignadas

    **Parámetros:**
    - **id_usuario**: ID del usuario (estudiante o psicólogo)

    **Respuesta para estudiante:**
    - citas_creadas: Lista de citas creadas por el estudiante
    - total_citas: Número total de citas

    **Respuesta para psicólogo:**
    - citas_asignadas: Lista de citas asignadas al psicólogo
    - total_citas: Número total de citas
    """
    return await appointments_service.obtener_citas_usuario(id_usuario)


@router.get(
    "/{id_cita}",
    response_model=CitaResponse,
    summary="Obtener cita por ID"
)
async def obtener_cita(id_cita: int):
    """
    Obtiene la información detallada de una cita específica.

    **Parámetros:**
    - **id_cita**: ID de la cita

    **Respuesta:**
    Información completa de la cita incluyendo:
    - Datos básicos de la cita
    - Información del estudiante que la creó
    - Información del psicólogo asignado (si existe)
    """
    return await appointments_service.obtener_cita_por_id(id_cita)


@router.put(
    "/{id_cita}/asignar-psicologo",
    response_model=MessageResponse,
    summary="Asignar psicólogo a una cita"
)
async def asignar_psicologo(id_cita: int, asignacion: CitaAsignarPsicologo):
    """
    Asigna un psicólogo a una cita existente.

    **Parámetros:**
    - **id_cita**: ID de la cita
    - **id_psicologo**: ID del psicólogo a asignar

    Solo accesible para usuarios con rol 'administrador'.
    El sistema verifica que:
    - La cita existe
    - El usuario asignado tiene rol de psicólogo
    """
    return await appointments_service.asignar_psicologo(id_cita, asignacion)


@router.put(
    "/{id_cita}",
    response_model=MessageResponse,
    summary="Actualizar una cita"
)
async def actualizar_cita(
    id_cita: int,
    cita_update: CitaUpdate,
    id_usuario: str
):
    """
    Actualiza los datos de una cita existente.

    **Parámetros:**
    - **id_cita**: ID de la cita a actualizar
    - **titulo**: Nuevo título (opcional)
    - **fecha_cita**: Nueva fecha (opcional)
    - **id_usuario**: ID del usuario que intenta actualizar

    Solo el creador de la cita puede actualizarla.
    """
    return await appointments_service.actualizar_cita(
        id_cita,
        cita_update,
        id_usuario
    )


@router.delete(
    "/{id_cita}",
    response_model=MessageResponse,
    summary="Eliminar una cita"
)
async def eliminar_cita(id_cita: int, id_usuario: str):
    """
    Elimina una cita del sistema.

    **Parámetros:**
    - **id_cita**: ID de la cita a eliminar
    - **id_usuario**: ID del usuario que intenta eliminar

    Solo el creador de la cita puede eliminarla.
    """
    return await appointments_service.eliminar_cita(id_cita, id_usuario)


@router.get(
    "/psicologos/disponibles",
    summary="Obtener psicólogos disponibles"
)
async def obtener_psicologos_disponibles():
    """
    Obtiene la lista de todos los psicólogos registrados en el sistema.

    Este endpoint es útil para que el administrador pueda ver
    qué psicólogos están disponibles para asignar a las citas.

    **Respuesta:**
    Lista de psicólogos con:
    - id: ID del psicólogo
    - nombre: Nombre del psicólogo
    - apellido: Apellido del psicólogo
    - especialidad: Especialidad del psicólogo
    - correo_institucional: Correo del psicólogo
    """
    psicologos = await appointments_service.obtener_psicologos_disponibles()
    return {
        "message": "Psicólogos disponibles obtenidos exitosamente",
        "total": len(psicologos),
        "data": psicologos
    }
