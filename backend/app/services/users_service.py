"""
Servicio de gestión de usuarios (estudiantes y psicólogos).
"""
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from app.db.supabase import get_supabase_client
from app.models.schemas import EstudianteCreate, PsicologoCreate


class UsersService:
    """Servicio de gestión de usuarios."""

    def __init__(self):
        self.supabase = get_supabase_client()

    def crear_estudiante(self, estudiante: EstudianteCreate) -> Dict[str, Any]:
        """
        Crea un nuevo estudiante en el sistema.

        Args:
            estudiante: Datos del estudiante a crear

        Returns:
            Dict con mensaje y datos del estudiante creado

        Raises:
            HTTPException: Si ocurre un error durante la creación
        """
        try:
            auth_response = self.supabase.auth.sign_up({
                "email": estudiante.correo_institucional,
                "password": estudiante.dni
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=400,
                    detail="No se pudo crear el usuario en el sistema de autenticación"
                )

            user_id = auth_response.user.id

            estudiante_data = estudiante.model_dump()
            estudiante_data["id"] = user_id
            estudiante_data["rol"] = "estudiante"

            response = self.supabase.table("usuarios")\
                .insert(estudiante_data)\
                .execute()

            return {
                "message": "Estudiante creado con éxito",
                "data": response.data
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear estudiante: {str(e)}"
            )

    def crear_psicologo(self, psicologo: PsicologoCreate) -> Dict[str, Any]:
        """
        Crea un nuevo psicólogo en el sistema.

        Args:
            psicologo: Datos del psicólogo a crear

        Returns:
            Dict con mensaje y datos del psicólogo creado

        Raises:
            HTTPException: Si ocurre un error durante la creación
        """
        try:
            auth_response = self.supabase.auth.sign_up({
                "email": psicologo.correo_institucional,
                "password": psicologo.dni
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=400,
                    detail="No se pudo crear el usuario en el sistema de autenticación"
                )

            user_id = auth_response.user.id

            psicologo_data = psicologo.model_dump()
            psicologo_data["id"] = user_id
            psicologo_data["rol"] = "psicologo"

            response = self.supabase.table("usuarios")\
                .insert(psicologo_data)\
                .execute()

            return {
                "message": "Psicólogo creado con éxito",
                "data": response.data
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear psicólogo: {str(e)}"
            )

    def obtener_estudiantes(
        self,
        psychologist_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Obtiene la lista de estudiantes.

        Args:
            psychologist_id: ID del psicólogo (opcional, para filtrar)

        Returns:
            Dict con mensaje y lista de estudiantes

        Raises:
            HTTPException: Si ocurre un error durante la consulta
        """
        try:
            query = self.supabase.table("usuarios")\
                .select("id, nombre, apellido, codigo_alumno")\
                .eq("rol", "estudiante")

            if psychologist_id:
                query = query.eq("psicologo_id", psychologist_id)

            response = query.execute()

            if not response.data:
                return {
                    "message": "No se encontraron estudiantes",
                    "data": []
                }

            return {
                "message": "Estudiantes recuperados con éxito",
                "data": response.data
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al buscar estudiantes: {str(e)}"
            )

    def obtener_psicologos_disponibles(self) -> List[Dict[str, Any]]:
        """
        Obtiene la lista de psicólogos disponibles.

        Returns:
            Lista de psicólogos

        Raises:
            HTTPException: Si ocurre un error durante la consulta
        """
        try:
            response = self.supabase.table("usuarios")\
                .select("id, nombre, apellido, especialidad")\
                .eq("rol", "psicologo")\
                .execute()

            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener psicólogos: {str(e)}"
            )


def get_users_service() -> UsersService:
    """
    Factory function para obtener instancia de UsersService.

    Returns:
        UsersService: Instancia del servicio de usuarios
    """
    return UsersService()
