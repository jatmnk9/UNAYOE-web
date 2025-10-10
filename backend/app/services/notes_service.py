"""
Servicio de gestión de notas.
Gestiona la creación, consulta y análisis de notas del diario.
"""
import io
import pandas as pd
from typing import List, Dict, Any
from fastapi import HTTPException
from fastapi.responses import StreamingResponse

from app.db.supabase import get_supabase_client
from app.services.nlp_service import nlp_service
from app.services.analysis_service import analysis_service


class NotesService:
    """Servicio de gestión de notas."""

    def __init__(self):
        """Inicializa el servicio de notas."""
        self.supabase = get_supabase_client()

    async def obtener_notas_por_usuario(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Obtiene todas las notas de un usuario.

        Args:
            user_id: ID del usuario.

        Returns:
            Lista de notas del usuario.

        Raises:
            HTTPException: Si ocurre un error al obtener las notas.
        """
        try:
            response = self.supabase.table("notas")\
                .select("*")\
                .eq("usuario_id", user_id)\
                .order("created_at", desc=True)\
                .execute()

            if not response.data:
                return []

            return response.data

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error interno al buscar notas: {e}"
            )

    async def guardar_nota(self, nota_texto: str, user_id: str) -> Dict[str, Any]:
        """
        Analiza y guarda una nueva nota.

        Args:
            nota_texto: Texto de la nota.
            user_id: ID del usuario.

        Returns:
            Diccionario con la nota guardada.

        Raises:
            HTTPException: Si ocurre un error al guardar la nota.
        """
        try:
            texto_procesado, tokens = nlp_service.preprocesar_texto(nota_texto)
            sentimiento = nlp_service.analizar_sentimiento(nota_texto)
            emocion, emocion_score = nlp_service.analizar_emocion(nota_texto)

            response = self.supabase.table("notas").insert([{
                "usuario_id": user_id,
                "nota": nota_texto,
                "sentimiento": sentimiento,
                "emocion": emocion,
                "emocion_score": emocion_score,
                "tokens": tokens
            }]).execute()

            return {
                "message": "Nota guardada con éxito",
                "data": response.data
            }

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def analizar_notas_usuario(
        self,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Analiza todas las notas de un usuario y genera visualizaciones.

        Args:
            user_id: ID del usuario.

        Returns:
            Diccionario con el análisis y las notas.

        Raises:
            HTTPException: Si ocurre un error al analizar.
        """
        notas_data = await self.obtener_notas_por_usuario(user_id)

        if not notas_data:
            return {
                "message": "Análisis completado sin datos",
                "analysis": {},
                "notes": []
            }

        df = pd.DataFrame(notas_data)
        df = df.rename(columns={'nota': 'note'})

        df_analizado = analysis_service.analizar_multiples_notas(
            df['note'].tolist()
        )

        analysis_images = analysis_service.crear_visualizaciones(df_analizado)

        return {
            "message": "Análisis completado con éxito",
            "analysis": analysis_images,
            "notes": notas_data
        }

    async def exportar_reporte_usuario(
        self,
        user_id: str
    ) -> StreamingResponse:
        """
        Exporta el reporte de un usuario en formato CSV.

        Args:
            user_id: ID del usuario.

        Returns:
            Respuesta con el archivo CSV.

        Raises:
            HTTPException: Si no hay notas o ocurre un error.
        """
        notas_data = await self.obtener_notas_por_usuario(user_id)

        if not notas_data:
            raise HTTPException(
                status_code=404,
                detail="No hay notas para exportar."
            )

        df = pd.DataFrame(notas_data).rename(
            columns={'nota': 'note', 'usuario_id': 'user_id'}
        )

        df_analizado = analysis_service.analizar_multiples_notas(
            df['note'].tolist()
        )

        output = io.StringIO()
        df_analizado.to_csv(output, index=False, sep=';', encoding='utf-8')

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=reporte_diario_{user_id}.csv"
            }
        )


# Instancia única del servicio
notes_service = NotesService()
