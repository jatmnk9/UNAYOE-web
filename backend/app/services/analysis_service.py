"""
Servicio de análisis y visualización de datos.
"""
import io
import base64
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from collections import Counter
from typing import Dict, List, Any
from fastapi import HTTPException
from app.services.nlp_service import get_nlp_service


class AnalysisService:
    """Servicio de análisis y visualización."""

    def __init__(self):
        self.nlp_service = get_nlp_service()

    def analizar_multiples_notas(self, notas: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Analiza una lista de notas y retorna DataFrame con resultados.

        Args:
            notas: Lista de diccionarios con las notas

        Returns:
            DataFrame con análisis de cada nota
        """
        analisis = []

        for nota_dict in notas:
            nota = nota_dict.get('note') or nota_dict.get('nota', '')

            try:
                texto_procesado, tokens = self.nlp_service.preprocesar_texto(nota)
                sentimiento = self.nlp_service.analizar_sentimiento(nota)
                emocion, emocion_score = self.nlp_service.analizar_emocion(nota)

                analisis.append({
                    'nota_original': nota,
                    'texto_procesado': texto_procesado,
                    'tokens': tokens,
                    'sentimiento': sentimiento,
                    'emocion': emocion,
                    'emocion_score': emocion_score
                })
            except Exception as e:
                print(f"Error al procesar nota: {e}")
                analisis.append({
                    'nota_original': nota,
                    'texto_procesado': '',
                    'tokens': [],
                    'sentimiento': 'ERROR',
                    'emocion': 'ERROR',
                    'emocion_score': 0.0
                })

        return pd.DataFrame(analisis)

    def crear_grafico_sentimientos(self, df: pd.DataFrame) -> str:
        """
        Crea gráfico de distribución de sentimientos.

        Args:
            df: DataFrame con análisis de notas

        Returns:
            Imagen en Base64
        """
        colors = ['#6366F1', '#EC4899', '#34D399']
        sentimiento_counts = df['sentimiento'].value_counts()

        plt.figure(figsize=(8, 6))
        plt.bar(sentimiento_counts.index, sentimiento_counts.values, color=colors)
        plt.title('Distribución de Sentimientos', fontsize=14, fontweight='bold')
        plt.xlabel('Sentimiento')
        plt.ylabel('Frecuencia')
        plt.grid(axis='y', linestyle='--', alpha=0.7)

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return image_base64

    def crear_grafico_emociones(self, df: pd.DataFrame) -> str:
        """
        Crea gráfico de distribución de emociones.

        Args:
            df: DataFrame con análisis de notas

        Returns:
            Imagen en Base64
        """
        colors = ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7']
        emocion_counts = df['emocion'].value_counts()

        plt.figure(figsize=(10, 6))
        plt.bar(emocion_counts.index, emocion_counts.values, color=colors)
        plt.title('Distribución de Emociones', fontsize=14, fontweight='bold')
        plt.xlabel('Emoción')
        plt.ylabel('Frecuencia')
        plt.xticks(rotation=45, ha='right')
        plt.grid(axis='y', linestyle='--', alpha=0.7)

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return image_base64

    def crear_nube_palabras(self, df: pd.DataFrame) -> str:
        """
        Crea nube de palabras.

        Args:
            df: DataFrame con análisis de notas

        Returns:
            Imagen en Base64
        """
        todos_los_tokens = sum(df['tokens'].tolist(), [])

        if not todos_los_tokens:
            return ""

        wordcloud_data = " ".join(todos_los_tokens)
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='white',
            colormap='viridis'
        ).generate(wordcloud_data)

        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation='bilinear')
        plt.axis('off')
        plt.title('Nube de Palabras', fontsize=14, fontweight='bold')

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return image_base64

    def crear_visualizaciones(self, df: pd.DataFrame) -> Dict[str, str]:
        """
        Crea todas las visualizaciones.

        Args:
            df: DataFrame con análisis de notas

        Returns:
            Diccionario con imágenes en Base64
        """
        if df.empty:
            return {}

        return {
            'sentiments': self.crear_grafico_sentimientos(df),
            'emotions': self.crear_grafico_emociones(df),
            'wordcloud': self.crear_nube_palabras(df)
        }


def get_analysis_service() -> AnalysisService:
    """
    Factory function para obtener instancia de AnalysisService.

    Returns:
        AnalysisService: Instancia del servicio de análisis
    """
    return AnalysisService()
