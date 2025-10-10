"""
Router de usuarios.
Gestiona las rutas relacionadas con estudiantes y psicólogos.
"""
from fastapi import APIRouter






from app.models.schemas import EstudianteCreate, PsicologoCreate
from app.services.users_service import users_service

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)


@router.post("/estudiantes")
async def crear_estudiante(estudiante: EstudianteCreate):
    """
    Crea un nuevo estudiante en el sistema.

    Args:
        estudiante: Datos del estudiante a crear.

    Returns:
        Diccionario con el mensaje de éxito y los datos del estudiante.
    """
    return await users_service.crear_estudiante(estudiante)


@router.post("/psicologos")
async def crear_psicologo(psicologo: PsicologoCreate):
    """
    Crea un nuevo psicólogo en el sistema.

    Args:
        psicologo: Datos del psicólogo a crear.

    Returns:
        Diccionario con el mensaje de éxito y los datos del psicólogo.
    """
    return await users_service.crear_psicologo(psicologo)


@router.get("/psychologist/students")
async def obtener_estudiantes():
    """
    Obtiene la lista de todos los estudiantes.

    Returns:
        Diccionario con la lista de estudiantes.
    """
    estudiantes = await users_service.obtener_estudiantes()
    return {
        "message": "Estudiantes recuperados con éxito" if estudiantes else "No se encontraron estudiantes",
        "data": estudiantes
    }
