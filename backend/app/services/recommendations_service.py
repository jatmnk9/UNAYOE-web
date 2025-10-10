"""
Servicio de recomendaciones.
Gestiona el sistema de recomendaciones basado en contenido y emociones.
"""
import pandas as pd
from typing import List, Dict, Any
from fastapi import HTTPException

from app.db.supabase import get_supabase_client


class RecommendationsService:
    """Servicio de recomendaciones."""

    def __init__(self):
        """Inicializa el servicio de recomendaciones."""
        self.supabase = get_supabase_client()

    async def obtener_todas_recomendaciones(self) -> List[Dict[str, Any]]:
        """
        Obtiene todas las recomendaciones disponibles.

        Returns:
            Lista de todas las recomendaciones.

        Raises:
            HTTPException: Si ocurre un error al obtener las recomendaciones.
        """
        try:
            response = self.supabase.table("recomendaciones")\
                .select("*")\
                .execute()

            if not response.data:
                return []

            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al buscar todas las recomendaciones: {e}"
            )

    async def obtener_recomendaciones_personalizadas(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Genera recomendaciones personalizadas basadas en emociones y gustos.

        Args:
            user_id: ID del usuario.

        Returns:
            Diccionario con las recomendaciones personalizadas.

        Raises:
            HTTPException: Si ocurre un error al generar las recomendaciones.
        """
        try:
            # Obtener últimas emociones del usuario
            notas_response = self.supabase.table("notas")\
                .select("emocion, sentimiento")\
                .eq("usuario_id", user_id)\
                .order("created_at", desc=True)\
                .limit(5)\
                .execute()

            notas_data = notas_response.data or []

            # Obtener emociones de los likes
            likes_response = self.supabase.table("likes_recomendaciones")\
                .select("recomendaciones:recomendacion_id(emocion_objetivo, sentimiento_objetivo)")\
                .eq("user_id", user_id)\
                .execute()

            likes_data = [
                r["recomendaciones"]
                for r in likes_response.data
                if r.get("recomendaciones")
            ]

            # Combinar emociones
            emociones = (
                [n["emocion"] for n in notas_data] +
                [l["emocion_objetivo"] for l in likes_data]
            )
            sentimientos = (
                [n["sentimiento"] for n in notas_data] +
                [l["sentimiento_objetivo"] for l in likes_data]
            )

            # Si no hay datos, devolver recomendaciones generales
            if not emociones:
                recs = await self.obtener_todas_recomendaciones()
                return {
                    "message": "Recomendaciones generales",
                    "data": recs
                }

            # Calcular emociones principales
            emocion_principal = pd.Series(emociones).mode()[0]
            sentimiento_principal = pd.Series(sentimientos).mode()[0]

            # Buscar coincidencias
            recs_response = self.supabase.table("recomendaciones")\
                .select("*")\
                .execute()

            df = pd.DataFrame(recs_response.data)
            mask = (
                (df["emocion_objetivo"] == emocion_principal) |
                (df["sentimiento_objetivo"] == sentimiento_principal)
            )
            recomendadas = df[mask]

            # Si no hay coincidencias, devolver aleatorias
            if recomendadas.empty:
                recomendadas = df.sample(min(3, len(df)))

            return {
                "message": "Recomendaciones personalizadas con éxito",
                "data": recomendadas.to_dict(orient="records"),
                "emocion_detectada": emocion_principal,
                "sentimiento_detectado": sentimiento_principal
            }

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generando recomendaciones: {e}"
            )

    async def obtener_favoritos_usuario(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Obtiene las recomendaciones favoritas de un usuario.

        Args:
            user_id: ID del usuario.

        Returns:
            Lista de recomendaciones favoritas.

        Raises:
            HTTPException: Si ocurre un error al obtener los favoritos.
        """
        try:
            response = self.supabase.table("likes_recomendaciones")\
                .select("recomendaciones(*)")\
                .eq("user_id", user_id)\
                .execute()

            if not response.data:
                return []

            favoritas = [
                item["recomendaciones"]
                for item in response.data
                if item.get("recomendaciones")
            ]

            return favoritas

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al buscar favoritos: {e}"
            )

    async def agregar_like(
        self,
        user_id: str,
        recomendacion_id: str
    ) -> Dict[str, str]:
        """
        Agrega un like a una recomendación.

        Args:
            user_id: ID del usuario.
            recomendacion_id: ID de la recomendación.

        Returns:
            Diccionario con mensaje de confirmación.
        """
        try:
            self.supabase.table("likes_recomendaciones").insert({
                "user_id": user_id,
                "recomendacion_id": recomendacion_id
            }).execute()

            return {"message": "Like agregado"}

        except Exception as e:
            return {"message": f"No se pudo agregar el like: {e}"}

    async def eliminar_like(
        self,
        user_id: str,
        recomendacion_id: str
    ) -> Dict[str, str]:
        """
        Elimina un like de una recomendación.

        Args:
            user_id: ID del usuario.
            recomendacion_id: ID de la recomendación.

        Returns:
            Diccionario con mensaje de confirmación.
        """
        self.supabase.table("likes_recomendaciones")\
            .delete()\
            .eq("user_id", user_id)\
            .eq("recomendacion_id", recomendacion_id)\
            .execute()

        return {"message": "Like eliminado"}

    async def obtener_likes_usuario(self, user_id: str) -> List[str]:
        """
        Obtiene los IDs de las recomendaciones que le gustan al usuario.

        Args:
            user_id: ID del usuario.

        Returns:
            Lista de IDs de recomendaciones.
        """
        response = self.supabase.table("likes_recomendaciones")\
            .select("recomendacion_id")\
            .eq("user_id", user_id)\
            .execute()

        return [r["recomendacion_id"] for r in response.data]


# Instancia única del servicio
recommendations_service = RecommendationsService()
