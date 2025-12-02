"""
Router de análisis de notas.
Maneja endpoints de análisis y exportación.
"""
import io
import pandas as pd
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import Note
from app.services.notes_service import get_notes_service, NotesService
from app.services.analysis_service import get_analysis_service, AnalysisService

router = APIRouter(tags=["Análisis"])


@router.post("/analyze")
async def analyze_notes(
    notes: List[Note],
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Recibe una lista de notas, analiza el texto y devuelve gráficos como imágenes Base64.
    """
    if not notes:
        raise HTTPException(
            status_code=400,
            detail="No se proporcionaron notas para analizar."
        )

    notes_dict = [note.model_dump() for note in notes]
    df_analizado = analysis_service.analizar_multiples_notas(notes_dict)

    if df_analizado.empty:
        return {"message": "Análisis completado sin datos", "data": {}}

    analysis_images = analysis_service.crear_visualizaciones(df_analizado)

    return analysis_images


@router.get("/analyze/{user_id}")
async def analyze_student_notes(
    user_id: str,
    notes_service: NotesService = Depends(get_notes_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Obtiene todas las notas de un estudiante, las analiza y devuelve gráficos Base64.
    """
    notes_data = notes_service.obtener_notas_por_usuario(user_id)

    if not notes_data:
        return {
            "message": "Análisis completado sin datos",
            "analysis": {},
            "notes": []
        }

    df_analizado = analysis_service.analizar_multiples_notas(notes_data)
    analysis_images = analysis_service.crear_visualizaciones(df_analizado)

    return {
        "message": "Análisis completado con éxito",
        "analysis": analysis_images,
        "notes": notes_data
    }


@router.get("/export/{user_id}")
async def export_student_report(
    user_id: str,
    notes_service: NotesService = Depends(get_notes_service),
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Obtiene las notas de un estudiante, las analiza y devuelve un archivo CSV.
    """
    notes_data = notes_service.obtener_notas_por_usuario(user_id)

    if not notes_data:
        raise HTTPException(
            status_code=404,
            detail="No hay notas para exportar."
        )

    df_analizado = analysis_service.analizar_multiples_notas(notes_data)

    output = io.StringIO()
    df_analizado.to_csv(output, index=False, sep=';', encoding='utf-8')

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=reporte_diario_{user_id}.csv"
        }
    )
