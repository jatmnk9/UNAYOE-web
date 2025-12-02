"""
Router de usuarios.
Maneja endpoints de creación y consulta de estudiantes y psicólogos.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from app.models.schemas import EstudianteCreate, PsicologoCreate, MessageResponse
from app.services.users_service import get_users_service, UsersService
from app.services.alert_service import get_alert_service, AlertService

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.post("/estudiantes", response_model=MessageResponse)
async def crear_estudiante(
    estudiante: EstudianteCreate,
    users_service: UsersService = Depends(get_users_service)
):
    """Crea un nuevo estudiante en el sistema."""
    return users_service.crear_estudiante(estudiante)


@router.post("/psicologos", response_model=MessageResponse)
async def crear_psicologo(
    psicologo: PsicologoCreate,
    users_service: UsersService = Depends(get_users_service)
):
    """Crea un nuevo psicólogo en el sistema."""
    return users_service.crear_psicologo(psicologo)


@router.get("/psychologist/students")
async def get_students(
    psychologist_id: Optional[str] = None,
    users_service: UsersService = Depends(get_users_service)
):
    """Obtiene lista de estudiantes, opcionalmente filtrada por psicólogo."""
    return users_service.obtener_estudiantes(psychologist_id)


@router.get("/psychologist/students-alerts")
async def get_students_with_alerts(
    limit_notes: int = Query(5, description="Número de notas recientes a analizar"),
    psychologist_id: Optional[str] = None,
    alert_service: AlertService = Depends(get_alert_service)
):
    """
    Obtiene estudiantes con alertas de riesgo de tristeza/depresión.
    """
    return alert_service.get_students_with_alerts(limit_notes, psychologist_id)
