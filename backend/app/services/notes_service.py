"""
Servicio de gestión de notas del diario.
"""
from typing import List, Dict, Any
from fastapi import HTTPException
from app.db.supabase import get_supabase_client
from app.services.nlp_service import get_nlp_service


class NotesService:
    """Servicio de gestión de notas."""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.nlp_service = get_nlp_service()

    def obtener_notas_por_usuario(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtiene todas las notas de un usuario.

        Args:
            user_id: ID del usuario

        Returns:
            Lista de notas del usuario

        Raises:
            HTTPException: Si ocurre un error durante la consulta
        """
        try:
            response = self.supabase.table("notas")\
                .select("*")\
                .eq("usuario_id", user_id)\
                .order("created_at", desc=True)\
                .execute()

            return response.data or []

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al recuperar notas: {str(e)}"
            )

    def guardar_nota(
        self,
        nota_texto: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Analiza y guarda una nueva nota en la base de datos.

        Args:
            nota_texto: Contenido de la nota
            user_id: ID del usuario

        Returns:
            Dict con los datos de la nota guardada

        Raises:
            HTTPException: Si ocurre un error durante el guardado
        """
        try:
            texto_procesado, tokens = self.nlp_service.preprocesar_texto(nota_texto)
            sentimiento = self.nlp_service.analizar_sentimiento(nota_texto)
            emocion, emocion_score = self.nlp_service.analizar_emocion(nota_texto)

            response = self.supabase.table("notas").insert({
                "usuario_id": user_id,
                "nota": nota_texto,
                "sentimiento": sentimiento,
                "emocion": emocion,
                "emocion_score": emocion_score,
                "tokens": tokens
            }).execute()

            return response.data[0] if response.data else {}

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error al guardar nota: {str(e)}"
            )


def get_notes_service() -> NotesService:
    """
    Factory function para obtener instancia de NotesService.

    Returns:
        NotesService: Instancia del servicio de notas
    """
    return NotesService()
