"""
Servicio de gestión de usuarios.
Gestiona la creación y consulta de estudiantes y psicólogos.
"""
from typing import List, Dict, Any
from fastapi import HTTPException

from app.db.supabase import get_supabase_client
from app.models.schemas import Estudiante, Psicologo


class UsersService:
    """Servicio de gestión de usuarios."""

    def __init__(self):
        """Inicializa el servicio de usuarios."""
        self.supabase = get_supabase_client()

    async def crear_estudiante(self, estudiante: Estudiante) -> Dict[str, Any]:
        """
        Crea un nuevo estudiante.

        Args:
            estudiante: Datos del estudiante.

        Returns:
            Diccionario con el estudiante creado.

        Raises:
            HTTPException: Si ocurre un error al crear el estudiante.
        """
        try:
            data = estudiante.dict()
            data["rol"] = "estudiante"

            response = self.supabase.table("usuarios")\
                .insert(data)\
                .execute()

            return {
                "message": "Estudiante creado con éxito",
                "data": response.data
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def crear_psicologo(self, psicologo: Psicologo) -> Dict[str, Any]:
        """
        Crea un nuevo psicólogo.

        Args:
            psicologo: Datos del psicólogo.

        Returns:
            Diccionario con el psicólogo creado.

        Raises:
            HTTPException: Si ocurre un error al crear el psicólogo.
        """
        try:
            data = psicologo.dict()
            data["rol"] = "psicologo"

            response = self.supabase.table("usuarios")\
                .insert(data)\
                .execute()

            return {
                "message": "Psicólogo creado con éxito",
                "data": response.data
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def obtener_estudiantes(self) -> List[Dict[str, Any]]:
        """
        Obtiene la lista de todos los estudiantes.

        Returns:
            Lista de estudiantes.

        Raises:
            HTTPException: Si ocurre un error al obtener los estudiantes.
        """
        try:
            response = self.supabase.table("usuarios")\
                .select("id, nombre, apellido, codigo_alumno")\
                .eq("rol", "estudiante")\
                .execute()

            if not response.data:
                return []

            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al buscar estudiantes: {e}"
            )


# Instancia única del servicio
users_service = UsersService()
