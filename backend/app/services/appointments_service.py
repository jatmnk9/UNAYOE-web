"""
Servicio de gestión de citas.
Gestiona la creación, consulta, actualización y asignación de citas.
"""
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from datetime import datetime

from app.db.supabase import get_supabase_client
from app.models.schemas import CitaCreate, CitaUpdate, CitaAsignarPsicologo


class AppointmentsService:
    """Servicio de gestión de citas."""

    def __init__(self):
        """Inicializa el servicio de citas."""
        self.supabase = get_supabase_client()

    async def crear_cita(
        self,
        cita_data: CitaCreate,
        id_usuario: str
    ) -> Dict[str, Any]:
        """
        Crea una nueva cita para un estudiante.

        Args:
            cita_data: Datos de la cita a crear.
            id_usuario: ID del usuario que crea la cita.

        Returns:
            Diccionario con la cita creada.

        Raises:
            HTTPException: Si ocurre un error al crear la cita.
        """
        try:
            # Verificar que el usuario existe y es un estudiante
            usuario_response = self.supabase.table("usuarios")\
                .select("id, rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Usuario no encontrado"
                )

            if usuario_response.data.get("rol") != "estudiante":
                raise HTTPException(
                    status_code=403,
                    detail="Solo los estudiantes pueden crear citas"
                )

            # Crear la cita
            cita = {
                "titulo": cita_data.titulo,
                "fecha_cita": cita_data.fecha_cita.isoformat(),
                "id_usuario": id_usuario,
                "fecha_creacion": datetime.now().isoformat()
            }

            response = self.supabase.table("citas")\
                .insert(cita)\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Error al crear la cita"
                )

            return {
                "message": "Cita creada exitosamente",
                "data": response.data[0]
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al crear cita: {str(e)}"
            )

    async def obtener_citas_pendientes(self) -> List[Dict[str, Any]]:
        """
        Obtiene todas las citas sin psicólogo asignado (para el administrador).

        Returns:
            Lista de citas pendientes de asignación.

        Raises:
            HTTPException: Si ocurre un error al obtener las citas.
        """
        try:
            response = self.supabase.table("citas")\
                .select(
                    "id_cita, titulo, fecha_creacion, fecha_cita, id_usuario, "
                    "id_psicologo, usuarios!citas_id_usuario_fkey("
                    "nombre, apellido, correo_institucional)"
                )\
                .is_("id_psicologo", "null")\
                .order("fecha_cita", desc=False)\
                .execute()

            citas = []
            for cita in response.data:
                usuario = cita.pop("usuarios", {})
                cita_formateada = {
                    **cita,
                    "nombre_usuario": usuario.get("nombre"),
                    "apellido_usuario": usuario.get("apellido"),
                    "correo_usuario": usuario.get("correo_institucional")
                }
                citas.append(cita_formateada)

            return citas

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas pendientes: {str(e)}"
            )

    async def obtener_todas_las_citas(self) -> List[Dict[str, Any]]:
        """
        Obtiene todas las citas del sistema (para el administrador).

        Returns:
            Lista de todas las citas con información completa.

        Raises:
            HTTPException: Si ocurre un error al obtener las citas.
        """
        try:
            response = self.supabase.table("citas")\
                .select(
                    "id_cita, titulo, fecha_creacion, fecha_cita, id_usuario, "
                    "id_psicologo, "
                    "usuario:usuarios!citas_id_usuario_fkey(nombre, apellido, correo_institucional), "
                    "psicologo:usuarios!citas_id_psicologo_fkey(nombre, apellido, especialidad)"
                )\
                .order("fecha_cita", desc=False)\
                .execute()

            citas = []
            for cita in response.data:
                usuario = cita.pop("usuario", {})
                psicologo = cita.pop("psicologo", {})

                cita_formateada = {
                    **cita,
                    "nombre_usuario": usuario.get("nombre"),
                    "apellido_usuario": usuario.get("apellido"),
                    "correo_usuario": usuario.get("correo_institucional"),
                    "nombre_psicologo": psicologo.get("nombre") if psicologo else None,
                    "apellido_psicologo": psicologo.get("apellido") if psicologo else None,
                    "especialidad_psicologo": psicologo.get("especialidad") if psicologo else None
                }
                citas.append(cita_formateada)

            return citas

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener todas las citas: {str(e)}"
            )

    async def obtener_citas_usuario(self, id_usuario: str) -> Dict[str, Any]:
        """
        Obtiene las citas de un usuario específico.
        Incluye tanto citas creadas como citas asignadas (para psicólogos).

        Args:
            id_usuario: ID del usuario.

        Returns:
            Diccionario con las citas del usuario.

        Raises:
            HTTPException: Si ocurre un error al obtener las citas.
        """
        try:
            # Verificar rol del usuario
            usuario_response = self.supabase.table("usuarios")\
                .select("id, rol")\
                .eq("id", id_usuario)\
                .single()\
                .execute()

            if not usuario_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Usuario no encontrado"
                )

            rol = usuario_response.data.get("rol")

            if rol == "estudiante":
                # Obtener citas creadas por el estudiante
                response = self.supabase.table("citas")\
                    .select(
                        "id_cita, titulo, fecha_creacion, fecha_cita, "
                        "id_usuario, id_psicologo, "
                        "psicologo:usuarios!citas_id_psicologo_fkey(nombre, apellido, especialidad)"
                    )\
                    .eq("id_usuario", id_usuario)\
                    .order("fecha_cita", desc=False)\
                    .execute()

                citas = []
                for cita in response.data:
                    psicologo = cita.pop("psicologo", {})
                    cita_formateada = {
                        **cita,
                        "nombre_psicologo": psicologo.get("nombre") if psicologo else None,
                        "apellido_psicologo": psicologo.get("apellido") if psicologo else None,
                        "especialidad_psicologo": psicologo.get("especialidad") if psicologo else None
                    }
                    citas.append(cita_formateada)

                return {
                    "message": "Citas del estudiante obtenidas exitosamente",
                    "citas_creadas": citas,
                    "total_citas": len(citas)
                }

            elif rol == "psicologo":
                # Obtener citas asignadas al psicólogo
                response = self.supabase.table("citas")\
                    .select(
                        "id_cita, titulo, fecha_creacion, fecha_cita, "
                        "id_usuario, id_psicologo, "
                        "usuario:usuarios!citas_id_usuario_fkey(nombre, apellido, correo_institucional)"
                    )\
                    .eq("id_psicologo", id_usuario)\
                    .order("fecha_cita", desc=False)\
                    .execute()

                citas = []
                for cita in response.data:
                    usuario = cita.pop("usuario", {})
                    cita_formateada = {
                        **cita,
                        "nombre_usuario": usuario.get("nombre"),
                        "apellido_usuario": usuario.get("apellido"),
                        "correo_usuario": usuario.get("correo_institucional")
                    }
                    citas.append(cita_formateada)

                return {
                    "message": "Citas asignadas al psicólogo obtenidas exitosamente",
                    "citas_asignadas": citas,
                    "total_citas": len(citas)
                }

            else:
                raise HTTPException(
                    status_code=403,
                    detail="Rol no autorizado para ver citas"
                )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener citas del usuario: {str(e)}"
            )

    async def obtener_cita_por_id(self, id_cita: int) -> Dict[str, Any]:
        """
        Obtiene una cita específica por su ID.

        Args:
            id_cita: ID de la cita.

        Returns:
            Diccionario con la información de la cita.

        Raises:
            HTTPException: Si la cita no existe o hay un error.
        """
        try:
            response = self.supabase.table("citas")\
                .select(
                    "id_cita, titulo, fecha_creacion, fecha_cita, id_usuario, "
                    "id_psicologo, "
                    "usuario:usuarios!citas_id_usuario_fkey(nombre, apellido, correo_institucional), "
                    "psicologo:usuarios!citas_id_psicologo_fkey(nombre, apellido, especialidad)"
                )\
                .eq("id_cita", id_cita)\
                .single()\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Cita no encontrada"
                )

            cita = response.data
            usuario = cita.pop("usuario", {})
            psicologo = cita.pop("psicologo", {})

            cita_formateada = {
                **cita,
                "nombre_usuario": usuario.get("nombre"),
                "apellido_usuario": usuario.get("apellido"),
                "correo_usuario": usuario.get("correo_institucional"),
                "nombre_psicologo": psicologo.get("nombre") if psicologo else None,
                "apellido_psicologo": psicologo.get("apellido") if psicologo else None,
                "especialidad_psicologo": psicologo.get("especialidad") if psicologo else None
            }

            return cita_formateada

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener la cita: {str(e)}"
            )

    async def asignar_psicologo(
        self,
        id_cita: int,
        asignacion: CitaAsignarPsicologo
    ) -> Dict[str, Any]:
        """
        Asigna un psicólogo a una cita (solo administrador).

        Args:
            id_cita: ID de la cita.
            asignacion: Datos de asignación con el ID del psicólogo.

        Returns:
            Diccionario con la cita actualizada.

        Raises:
            HTTPException: Si hay un error en la asignación.
        """
        try:
            # Verificar que el psicólogo existe y tiene el rol correcto
            psicologo_response = self.supabase.table("usuarios")\
                .select("id, rol")\
                .eq("id", asignacion.id_psicologo)\
                .single()\
                .execute()

            if not psicologo_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Psicólogo no encontrado"
                )

            if psicologo_response.data.get("rol") != "psicologo":
                raise HTTPException(
                    status_code=400,
                    detail="El usuario seleccionado no es un psicólogo"
                )

            # Verificar que la cita existe
            cita_response = self.supabase.table("citas")\
                .select("id_cita, id_psicologo")\
                .eq("id_cita", id_cita)\
                .single()\
                .execute()

            if not cita_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Cita no encontrada"
                )

            # Actualizar la cita con el psicólogo asignado
            update_response = self.supabase.table("citas")\
                .update({"id_psicologo": asignacion.id_psicologo})\
                .eq("id_cita", id_cita)\
                .execute()

            if not update_response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Error al asignar psicólogo"
                )

            return {
                "message": "Psicólogo asignado exitosamente",
                "data": update_response.data[0]
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al asignar psicólogo: {str(e)}"
            )

    async def actualizar_cita(
        self,
        id_cita: int,
        cita_update: CitaUpdate,
        id_usuario: str
    ) -> Dict[str, Any]:
        """
        Actualiza una cita existente (solo el creador puede actualizar).

        Args:
            id_cita: ID de la cita a actualizar.
            cita_update: Datos a actualizar.
            id_usuario: ID del usuario que intenta actualizar.

        Returns:
            Diccionario con la cita actualizada.

        Raises:
            HTTPException: Si hay un error en la actualización.
        """
        try:
            # Verificar que la cita existe y pertenece al usuario
            cita_response = self.supabase.table("citas")\
                .select("id_cita, id_usuario")\
                .eq("id_cita", id_cita)\
                .single()\
                .execute()

            if not cita_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Cita no encontrada"
                )

            if cita_response.data.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permisos para actualizar esta cita"
                )

            # Preparar datos de actualización
            update_data = {}
            if cita_update.titulo is not None:
                update_data["titulo"] = cita_update.titulo
            if cita_update.fecha_cita is not None:
                update_data["fecha_cita"] = cita_update.fecha_cita.isoformat()

            if not update_data:
                raise HTTPException(
                    status_code=400,
                    detail="No se proporcionaron datos para actualizar"
                )

            # Actualizar la cita
            update_response = self.supabase.table("citas")\
                .update(update_data)\
                .eq("id_cita", id_cita)\
                .execute()

            if not update_response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Error al actualizar la cita"
                )

            return {
                "message": "Cita actualizada exitosamente",
                "data": update_response.data[0]
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al actualizar la cita: {str(e)}"
            )

    async def eliminar_cita(self, id_cita: int, id_usuario: str) -> Dict[str, Any]:
        """
        Elimina una cita (solo el creador puede eliminar).

        Args:
            id_cita: ID de la cita a eliminar.
            id_usuario: ID del usuario que intenta eliminar.

        Returns:
            Diccionario con mensaje de confirmación.

        Raises:
            HTTPException: Si hay un error en la eliminación.
        """
        try:
            # Verificar que la cita existe y pertenece al usuario
            cita_response = self.supabase.table("citas")\
                .select("id_cita, id_usuario")\
                .eq("id_cita", id_cita)\
                .single()\
                .execute()

            if not cita_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Cita no encontrada"
                )

            if cita_response.data.get("id_usuario") != id_usuario:
                raise HTTPException(
                    status_code=403,
                    detail="No tienes permisos para eliminar esta cita"
                )

            # Eliminar la cita
            self.supabase.table("citas")\
                .delete()\
                .eq("id_cita", id_cita)\
                .execute()

            return {
                "message": "Cita eliminada exitosamente"
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al eliminar la cita: {str(e)}"
            )

    async def obtener_psicologos_disponibles(self) -> List[Dict[str, Any]]:
        """
        Obtiene la lista de psicólogos disponibles para asignar a citas.

        Returns:
            Lista de psicólogos.

        Raises:
            HTTPException: Si hay un error al obtener los psicólogos.
        """
        try:
            response = self.supabase.table("usuarios")\
                .select("id, nombre, apellido, especialidad, correo_institucional")\
                .eq("rol", "psicologo")\
                .execute()

            if not response.data:
                return []

            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener psicólogos: {str(e)}"
            )


# Instancia única del servicio
appointments_service = AppointmentsService()
