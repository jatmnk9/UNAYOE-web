"""
Servicio de gestión de usuarios.
Gestiona la creación y consulta de estudiantes y psicólogos.
"""
from typing import List, Dict, Any
from fastapi import HTTPException

from app.db.supabase import get_supabase_client
from app.models.schemas import Estudiante, EstudianteCreate, PsicologoCreate



class UsersService:
    """Servicio de gestión de usuarios."""

    def __init__(self):
        """Inicializa el servicio de usuarios."""
        self.supabase = get_supabase_client()

    async def crear_estudiante(self, estudiante: EstudianteCreate) -> Dict[str, Any]:
        """
        Crea un nuevo estudiante en Auth y en la tabla usuarios.

        Args:
            estudiante: Datos del estudiante.

        Returns:
            Diccionario con el estudiante creado.

        Raises:
            HTTPException: Si ocurre un error al crear el estudiante.
        """
        try:
            # Paso 1: Crear usuario en Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": estudiante.correo_institucional,
                "password": estudiante.dni, 
                "options": {
                    "data": {
                        "nombre": estudiante.nombre,
                        "apellido": estudiante.apellido,
                        "rol": "estudiante"
                    }
                }
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=500,
                    detail="Error al crear usuario en el sistema de autenticación"
                )

            # Paso 2: Obtener el ID del usuario creado
            user_id = auth_response.user.id

            # Paso 3: Crear perfil en la tabla usuarios
            data = estudiante.model_dump()
            data["id"] = user_id
            data["rol"] = "estudiante"

            response = self.supabase.table("usuarios")\
                .insert(data)\
                .execute()

            return {
                "message": "Estudiante creado con éxito",
                "data": response.data[0] if response.data else None,
                "user_id": user_id
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def crear_psicologo(self, psicologo: PsicologoCreate) -> Dict[str, Any]:
        """
        Crea un nuevo psicólogo en Auth y en la tabla usuarios.

        Args:
            psicologo: Datos del psicólogo.

        Returns:
            Diccionario con el psicólogo creado.

        Raises:
            HTTPException: Si ocurre un error al crear el psicólogo.
        """
        try:
            # Paso 1: Crear usuario en Supabase Auth
            auth_response = self.supabase.auth.sign_up({
                "email": psicologo.correo_institucional,
                "password": psicologo.dni,
                "options": {
                    "data": {
                        "nombre": psicologo.nombre,
                        "apellido": psicologo.apellido,
                        "rol": "psicologo"
                    }
                }
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=500,
                    detail="Error al crear usuario en el sistema de autenticación"
                )

            # Paso 2: Obtener el ID del usuario creado
            user_id = auth_response.user.id

            # Paso 3: Crear perfil en la tabla usuarios
            data = psicologo.model_dump()
            data["id"] = user_id
            data["rol"] = "psicologo"

            response = self.supabase.table("usuarios")\
                .insert(data)\
                .execute()

            return {
                "message": "Psicólogo creado con éxito",
                "data": response.data[0] if response.data else None,
                "user_id": user_id
            }

        except HTTPException:
            raise
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
