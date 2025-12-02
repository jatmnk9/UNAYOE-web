"""
Servicio de gestión de citas médicas.
"""
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from app.db.supabase import get_supabase_client
from app.models.schemas import CitaCreate, CitaUpdate, CitaAsignarPsicologo


class AppointmentsService:
    """Servicio de gestión de citas."""

    def __init__(self):
        self.supabase = get_supabase_client()

    def crear_cita(self, cita_data: CitaCreate, id_usuario: str) -> Dict[str, Any]:
        """Crea una nueva cita."""
        try:
            usuario = self.supabase.table("usuarios")\
                .select("rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario.data or usuario.data.get("rol") != "estudiante":
                raise HTTPException(
                    status_code=403,
                    detail="Solo los estudiantes pueden crear citas"
                )

            response = self.supabase.table("citas").insert({
                "titulo": cita_data.titulo,
                "fecha_cita": cita_data.fecha_cita.isoformat(),
                "id_usuario": id_usuario
            }).execute()

            return response.data[0] if response.data else {}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al crear cita: {str(e)}"
            )

    def obtener_citas_pendientes(self) -> List[Dict[str, Any]]:
        """Obtiene citas sin psicólogo asignado."""
        try:
            response = self.supabase.table("citas")\
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

    def obtener_todas_las_citas(self) -> List[Dict[str, Any]]:
        """Obtiene todas las citas del sistema."""
        try:
            response = self.supabase.table("citas").select("*").execute()
            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas: {str(e)}"
            )

    def obtener_citas_usuario(self, id_usuario: str) -> List[Dict[str, Any]]:
        """Obtiene citas de un usuario según su rol."""
        try:
            usuario = self.supabase.table("usuarios")\
                .select("rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario.data:
                raise HTTPException(status_code=404, detail="Usuario no encontrado")

            rol = usuario.data.get("rol")

            if rol == "estudiante":
                response = self.supabase.table("citas")\
                    .select("*")\
                    .eq("id_usuario", id_usuario)\
                    .execute()
            elif rol == "psicologo":
                response = self.supabase.table("citas")\
                    .select("*")\
                    .eq("id_psicologo", id_usuario)\
                    .execute()
            else:
                response = self.supabase.table("citas").select("*").execute()

            return response.data or []

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas del usuario: {str(e)}"
            )

    def obtener_cita_por_id(self, id_cita: int) -> Dict[str, Any]:
        """Obtiene una cita por ID."""
        try:
            response = self.supabase.table("citas")\
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

    def asignar_psicologo(
        self,
        id_cita: int,
        asignacion: CitaAsignarPsicologo
    ) -> Dict[str, Any]:
        """Asigna un psicólogo a una cita."""
        try:
            psicologo = self.supabase.table("usuarios")\
                .select("rol")\
                .eq("id", asignacion.id_psicologo)\
                .single()\
                .execute()

            if not psicologo.data or psicologo.data.get("rol") != "psicologo":
                raise HTTPException(
                    status_code=400,
                    detail="El ID proporcionado no corresponde a un psicólogo"
                )

            response = self.supabase.table("citas")\
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

    def actualizar_cita(
        self,
        id_cita: int,
        cita_update: CitaUpdate,
        id_usuario: str
    ) -> Dict[str, Any]:
        """Actualiza una cita."""
        try:
            cita_actual = self.obtener_cita_por_id(id_cita)

            if cita_actual.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="Solo el creador puede actualizar la cita"
                )

            update_data = cita_update.model_dump(exclude_unset=True)

            if "fecha_cita" in update_data:
                update_data["fecha_cita"] = update_data["fecha_cita"].isoformat()

            response = self.supabase.table("citas")\
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

    def eliminar_cita(self, id_cita: int, id_usuario: str) -> Dict[str, str]:
        """Elimina una cita."""
        try:
            cita_actual = self.obtener_cita_por_id(id_cita)

            if cita_actual.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="Solo el creador puede eliminar la cita"
                )

            self.supabase.table("citas")\
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


def get_appointments_service() -> AppointmentsService:
    """Factory function para obtener instancia de AppointmentsService."""
    return AppointmentsService()
