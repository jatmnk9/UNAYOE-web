"""
Router de análisis.
Gestiona las rutas relacionadas con análisis de notas y reportes.
"""
from typing import List
from fastapi import APIRouter

from app.models.schemas import Note
from app.services.notes_service import notes_service
from app.services.analysis_service import analysis_service

router = APIRouter(
    prefix="",
    tags=["Análisis"]
)


@router.post("/analyze")
async def analyze_notes(notes: List[Note]):
    """
    Analiza una lista de notas y devuelve visualizaciones.

    Args:
        notes: Lista de notas a analizar.

    Returns:
        Diccionario con las imágenes de análisis en Base64.
    """
    if not notes:
        return {"message": "No se proporcionaron notas para analizar."}

    textos_notas = [note.note for note in notes]
    df_analizado = analysis_service.analizar_multiples_notas(textos_notas)

    if df_analizado.empty:
        return {"message": "Análisis completado sin datos", "data": {}}

    analysis_images = analysis_service.crear_visualizaciones(df_analizado)
    return analysis_images


@router.get("/analyze/{user_id}")
async def analyze_student_notes(user_id: str):
    """
    Analiza todas las notas de un estudiante y devuelve visualizaciones.

    Args:
        user_id: ID del usuario.

    Returns:
        Diccionario con el análisis y las notas.
    """
    return await notes_service.analizar_notas_usuario(user_id)


@router.get("/export/{user_id}")
async def export_student_report(user_id: str):
    """
    Exporta el reporte de un estudiante en formato CSV.

    Args:
        user_id: ID del usuario.

    Returns:
        Archivo CSV con el reporte.
    """
    return await notes_service.exportar_reporte_usuario(user_id)
