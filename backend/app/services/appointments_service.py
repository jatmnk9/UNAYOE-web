"""
Servicio de gestión de citas médicas/psicológicas.
Maneja la lógica de negocio para operaciones CRUD de citas.
"""
from typing import List, Dict, Any
from urllib import response
from fastapi import HTTPException
from app.db.supabase_client import supabase
from app.models.schemas import CitaCreate, CitaUpdate, CitaAsignarPsicologo


class AppointmentsService:
    """Servicio de gestión de citas"""

    @staticmethod
    def crear_cita(cita_data: CitaCreate, id_usuario: str) -> Dict[str, Any]:
        """
        Crea una nueva cita.
        Solo estudiantes pueden crear citas.
        """
        try:
            # Verificar que el usuario sea estudiante
            usuario = supabase.table("usuarios")\
                .select("rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario.data or usuario.data.get("rol") != "estudiante":
                raise HTTPException(
                    status_code=403,
                    detail="Solo los estudiantes pueden crear citas"
                )

            # Insertar la cita
            response = supabase.table("citas").insert({
                "titulo": cita_data.titulo,
                "fecha_cita": cita_data.fecha_cita,
                "id_usuario": id_usuario
            }).select().execute()

            print(f"Response: {response}")
            print(f"Data: {response.data}")

            return response.data[0] if response.data else {}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear cita: {str(e)}"
            )

    @staticmethod
    def obtener_citas_pendientes() -> List[Dict[str, Any]]:
        """Obtiene citas sin psicólogo asignado"""
        try:
            response = supabase.table("citas")\
                .select("""
                    *,
                    usuarios:id_usuario(nombre, apellido, correo_institucional)
                """)\
                .is_("id_psicologo", "null")\
                .execute()

            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas pendientes: {str(e)}"
            )

    @staticmethod
    def obtener_todas_las_citas() -> List[Dict[str, Any]]:
        """Obtiene todas las citas del sistema"""
        try:
            response = supabase.table("citas").select("*").execute()
            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas: {str(e)}"
            )

    @staticmethod
    def obtener_citas_usuario(id_usuario: str) -> List[Dict[str, Any]]:
        """Obtiene citas de un usuario según su rol"""
        try:
            # Obtener rol del usuario
            usuario = supabase.table("usuarios")\
                .select("rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            rol = usuario.data.get("rol")

            # Filtrar según rol
            if rol == "estudiante":
                response = supabase.table("citas")\
                    .select("*")\
                    .eq("id_usuario", id_usuario)\
                    .execute()
            elif rol == "psicologo":
                response = supabase.table("citas")\
                    .select("*")\
                    .eq("id_psicologo", id_usuario)\
                    .execute()
            else:
                # Administrador u otro rol ve todas las citas
                response = supabase.table("citas").select("*").execute()

            return response.data or []

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas del usuario: {str(e)}"
            )

    @staticmethod
    def obtener_cita_por_id(id_cita: int) -> Dict[str, Any]:
        """Obtiene una cita por ID"""
        try:
            response = supabase.table("citas")\
                .select("*")\
                .eq("id_cita", id_cita)\
                .single()\
                .execute()

            if not response.data:
                raise HTTPException(status_code=404, detail="Cita no encontrada")

            return response.data

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener cita: {str(e)}"
            )

    @staticmethod
    def asignar_psicologo(
        id_cita: int,
        asignacion: CitaAsignarPsicologo
    ) -> Dict[str, Any]:
        """Asigna un psicólogo a una cita"""
        try:
            # Verificar que el ID corresponda a un psicólogo
            psicologo = supabase.table("usuarios")\
                .select("rol")\
                .eq("id", asignacion.id_psicologo)\
                .single()\
                .execute()

            if not psicologo.data or psicologo.data.get("rol") != "psicologo":
                raise HTTPException(
                    status_code=400,
                    detail="El ID proporcionado no corresponde a un psicólogo"
                )

            # Actualizar la cita
            response = supabase.table("citas")\
                .update({"id_psicologo": asignacion.id_psicologo})\
                .eq("id_cita", id_cita)\
                .execute()

            return response.data[0] if response.data else {}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al asignar psicólogo: {str(e)}"
            )

    @staticmethod
    def actualizar_cita(
        id_cita: int,
        cita_update: CitaUpdate,
        id_usuario: str
    ) -> Dict[str, Any]:
        """Actualiza una cita. Solo el creador puede actualizar."""
        try:
            # Obtener la cita actual
            cita_actual = AppointmentsService.obtener_cita_por_id(id_cita)

            # Verificar que el usuario sea el creador
            if cita_actual.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="Solo el creador puede actualizar la cita"
                )

            # Preparar datos de actualización
            update_data = {}
            if cita_update.titulo is not None:
                update_data["titulo"] = cita_update.titulo
            if cita_update.fecha_cita is not None:
                update_data["fecha_cita"] = cita_update.fecha_cita

            if not update_data:
                return cita_actual

            # Actualizar la cita
            response = supabase.table("citas")\
                .update(update_data)\
                .eq("id_cita", id_cita)\
                .execute()

            return response.data[0] if response.data else {}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al actualizar cita: {str(e)}"
            )

    @staticmethod
    def eliminar_cita(id_cita: int, id_usuario: str) -> Dict[str, str]:
        """Elimina una cita. Solo el creador puede eliminar."""
        try:
            # Obtener la cita actual
            cita_actual = AppointmentsService.obtener_cita_por_id(id_cita)

            # Verificar que el usuario sea el creador
            if cita_actual.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="Solo el creador puede eliminar la cita"
                )

            # Eliminar la cita
            supabase.table("citas")\
                .delete()\
                .eq("id_cita", id_cita)\
                .execute()

            return {"message": "Cita eliminada con éxito"}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al eliminar cita: {str(e)}"
            )

    @staticmethod
    def obtener_psicologos_disponibles() -> List[Dict[str, Any]]:
        """Obtiene lista de psicólogos disponibles"""
        try:
            response = supabase.table("usuarios")\
                .select("id, nombre, apellido, correo_institucional")\
                .eq("rol", "psicologo")\
                .execute()

            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener psicólogos: {str(e)}"
            )
