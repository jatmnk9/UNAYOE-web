"""
Servicio de análisis y visualización de datos.
Gestiona el análisis de notas y la creación de gráficos.
"""
import io
import base64
import pandas as pd
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from collections import Counter
from typing import Dict, List, Any

from app.services.nlp_service import nlp_service


class AnalysisService:
    """Servicio de análisis y visualización."""

    @staticmethod
    def analizar_nota(nota: str) -> Dict[str, Any]:
        """
        Analiza una nota individual.

        Args:
            nota: Texto de la nota.

        Returns:
            Diccionario con el análisis de la nota.
        """
        try:
            texto_procesado, tokens = nlp_service.preprocesar_texto(nota)
            sentimiento = nlp_service.analizar_sentimiento(nota)
            emocion, emocion_score = nlp_service.analizar_emocion(nota)

            return {
                'nota_original': nota,
                'texto_procesado': texto_procesado,
                'tokens': tokens,
                'sentimiento': sentimiento,
                'emocion': emocion,
                'emocion_score': emocion_score
            }
        except Exception as e:
            print(f"Error al procesar la nota: {e}")
            return {
                'nota_original': nota,
                'texto_procesado': '',
                'tokens': [],
                'sentimiento': 'ERROR',
                'emocion': 'ERROR',
                'emocion_score': 0.0
            }

    @staticmethod
    def analizar_multiples_notas(notas: List[str]) -> pd.DataFrame:
        """
        Analiza múltiples notas.

        Args:
            notas: Lista de textos de notas.

        Returns:
            DataFrame con los análisis de todas las notas.
        """
        analisis = [
            AnalysisService.analizar_nota(nota)
            for nota in notas
        ]
        return pd.DataFrame(analisis)

    @staticmethod
    def crear_grafico_sentimientos(df_analizado: pd.DataFrame) -> str:
        """
        Crea un gráfico de distribución de sentimientos.

        Args:
            df_analizado: DataFrame con análisis de notas.

        Returns:
            Imagen en formato Base64.
        """
        colors = ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7']
        sentimiento_counts = df_analizado['sentimiento'].value_counts()

        plt.figure(figsize=(8, 6))
        plt.bar(sentimiento_counts.index, sentimiento_counts.values, color=colors)
        plt.title('Distribución de Sentimientos')
        plt.xlabel('Sentimiento')
        plt.ylabel('Frecuencia')
        plt.grid(axis='y', linestyle='--', alpha=0.7)

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        imagen_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return imagen_base64

    @staticmethod
    def crear_grafico_emociones(df_analizado: pd.DataFrame) -> str:
        """
        Crea un gráfico de distribución de emociones.

        Args:
            df_analizado: DataFrame con análisis de notas.

        Returns:
            Imagen en formato Base64.
        """
        colors = ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7']
        emocion_counts = df_analizado['emocion'].value_counts()

        plt.figure(figsize=(10, 6))
        plt.bar(emocion_counts.index, emocion_counts.values, color=colors)
        plt.title('Distribución de Emociones')
        plt.xlabel('Emoción')
        plt.ylabel('Frecuencia')
        plt.grid(axis='y', linestyle='--', alpha=0.7)

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        imagen_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return imagen_base64

    @staticmethod
    def crear_nube_palabras(df_analizado: pd.DataFrame) -> str:
        """
        Crea una nube de palabras.

        Args:
            df_analizado: DataFrame con análisis de notas.

        Returns:
            Imagen en formato Base64.
        """
        todos_los_tokens = sum(df_analizado['tokens'], [])
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
        plt.title('Nube de Palabras')

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        imagen_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()

        return imagen_base64

    @staticmethod
    def crear_visualizaciones(df_analizado: pd.DataFrame) -> Dict[str, str]:
        """
        Crea todas las visualizaciones.

        Args:
            df_analizado: DataFrame con análisis de notas.

        Returns:
            Diccionario con las imágenes en Base64.
        """
        return {
            'sentiments': AnalysisService.crear_grafico_sentimientos(df_analizado),
            'emotions': AnalysisService.crear_grafico_emociones(df_analizado),
            'wordcloud': AnalysisService.crear_nube_palabras(df_analizado)
        }


# Instancia única del servicio
analysis_service = AnalysisService()
