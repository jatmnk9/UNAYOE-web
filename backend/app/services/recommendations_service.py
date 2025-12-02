"""
Servicio de gestión de recomendaciones.
"""
import pandas as pd
from typing import List, Dict, Any
from fastapi import HTTPException
from app.db.supabase import get_supabase_client


class RecommendationsService:
    """Servicio de gestión de recomendaciones."""

    def __init__(self):
        self.supabase = get_supabase_client()

    def obtener_todas_recomendaciones(self) -> List[Dict[str, Any]]:
        """Obtiene todas las recomendaciones disponibles."""
        try:
            response = self.supabase.table("recomendaciones").select("*").execute()
            return response.data or []
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener recomendaciones: {str(e)}"
            )

    def obtener_recomendaciones_personalizadas(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Genera recomendaciones personalizadas basadas en emociones y likes del usuario.
        """
        try:
            notas_response = self.supabase.table("notas")\
                .select("emocion, sentimiento")\
                .eq("usuario_id", user_id)\
                .order("created_at", desc=True)\
                .limit(5)\
                .execute()

            notas_data = notas_response.data or []

            likes_response = self.supabase.table("likes_recomendaciones")\
                .select("recomendaciones:recomendacion_id(emocion_objetivo, sentimiento_objetivo)")\
                .eq("user_id", user_id)\
                .execute()

            likes_data = [
                r["recomendaciones"] for r in likes_response.data
                if r.get("recomendaciones")
            ]

            emociones = [n["emocion"] for n in notas_data] + \
                       [l["emocion_objetivo"] for l in likes_data]
            sentimientos = [n["sentimiento"] for n in notas_data] + \
                          [l["sentimiento_objetivo"] for l in likes_data]

            if not emociones:
                recs = self.supabase.table("recomendaciones").select("*").execute()
                return {
                    "message": "Recomendaciones generales",
                    "data": recs.data,
                    "emocion_detectada": None,
                    "sentimiento_detectado": None
                }

            emocion_principal = pd.Series(emociones).mode()[0]
            sentimiento_principal = pd.Series(sentimientos).mode()[0]

            recs_response = self.supabase.table("recomendaciones").select("*").execute()
            df = pd.DataFrame(recs_response.data)
            mask = (df["emocion_objetivo"] == emocion_principal) | \
                   (df["sentimiento_objetivo"] == sentimiento_principal)
            recomendadas = df[mask]

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
                detail=f"Error generando recomendaciones: {str(e)}"
            )

    def obtener_favoritos_usuario(self, user_id: str) -> List[Dict[str, Any]]:
        """Obtiene las recomendaciones favoritas de un usuario."""
        try:
            response = self.supabase.table("likes_recomendaciones")\
                .select("recomendaciones(*)")\
                .eq("user_id", user_id)\
                .execute()

            if response.data:
                return [
                    item["recomendaciones"] for item in response.data
                    if item.get("recomendaciones")
                ]
            return []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener favoritos: {str(e)}"
            )

    def agregar_like(self, user_id: str, recomendacion_id: str) -> Dict[str, str]:
        """Agrega un like a una recomendación."""
        try:
            self.supabase.table("likes_recomendaciones").insert({
                "user_id": user_id,
                "recomendacion_id": recomendacion_id
            }).execute()
            return {"message": "Like agregado"}
        except Exception as e:
            return {"message": f"No se pudo agregar el like: {str(e)}"}

    def eliminar_like(self, user_id: str, recomendacion_id: str) -> Dict[str, str]:
        """Elimina un like de una recomendación."""
        try:
            self.supabase.table("likes_recomendaciones")\
                .delete()\
                .eq("user_id", user_id)\
                .eq("recomendacion_id", recomendacion_id)\
                .execute()
            return {"message": "Like eliminado"}
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al eliminar like: {str(e)}"
            )

    def obtener_likes_usuario(self, user_id: str) -> List[str]:
        """Obtiene IDs de recomendaciones con like del usuario."""
        try:
            res = self.supabase.table("likes_recomendaciones")\
                .select("recomendacion_id")\
                .eq("user_id", user_id)\
                .execute()
            return [r["recomendacion_id"] for r in res.data]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al obtener likes: {str(e)}"
            )


def get_recommendations_service() -> RecommendationsService:
    """Factory function para obtener instancia de RecommendationsService."""
    return RecommendationsService()
