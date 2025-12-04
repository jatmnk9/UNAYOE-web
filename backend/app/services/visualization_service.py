"""
Visualization service for creating charts and graphs
"""
import io
import base64
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from collections import Counter
import pandas as pd
from typing import Dict


class VisualizationService:
    """Service for creating data visualizations"""
    
    @staticmethod
    def create_visualizations(df_analyzed: pd.DataFrame) -> Dict[str, str]:
        """
        Create visualizations from analyzed diary data
        
        Args:
            df_analyzed: DataFrame with analysis results
            
        Returns:
            Dictionary with base64 encoded images (sentiments, emotions, wordcloud)
        """
        images = {}
        colors = ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7']
        
        # 1. Sentiment distribution chart
        if 'sentimiento' in df_analyzed.columns:
            sentiment_counts = df_analyzed['sentimiento'].value_counts()
            plt.figure(figsize=(8, 6))
            plt.bar(sentiment_counts.index, sentiment_counts.values, color=colors)
            plt.title('Distribución de Sentimientos')
            plt.xlabel('Sentimiento')
            plt.ylabel('Frecuencia')
            plt.grid(axis='y', linestyle='--', alpha=0.7)
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            images['sentiments'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
        
        # 2. Emotion distribution chart
        if 'emocion' in df_analyzed.columns:
            emotion_counts = df_analyzed['emocion'].value_counts()
            plt.figure(figsize=(10, 6))
            plt.bar(emotion_counts.index, emotion_counts.values, color=colors)
            plt.title('Distribución de Emociones')
            plt.xlabel('Emoción')
            plt.ylabel('Frecuencia')
            plt.grid(axis='y', linestyle='--', alpha=0.7)
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            images['emotions'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
        
        # 3. Word cloud
        if 'tokens' in df_analyzed.columns:
            all_tokens = []
            for tokens_list in df_analyzed['tokens']:
                if isinstance(tokens_list, list):
                    all_tokens.extend(tokens_list)
            
            if all_tokens:
                wordcloud_data = " ".join(all_tokens)
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
                images['wordcloud'] = base64.b64encode(buf.getvalue()).decode('utf-8')
                plt.close()
        
        return images

