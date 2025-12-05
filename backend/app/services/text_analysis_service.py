"""
Text analysis service using NLP models
Handles sentiment, emotion analysis and topic modeling
"""
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from transformers import pipeline
from typing import Tuple, List, Dict
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
import numpy as np

# Download NLTK resources if not available
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    print("Downloading NLTK stopwords...")
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("Downloading NLTK punkt tokenizer...")
    nltk.download('punkt')

# Initialize NLP pipelines
try:
    print("Loading NLP models optimized for Spanish...")
    sentiment_classifier = pipeline(
        "sentiment-analysis", 
        model="pysentimiento/robertuito-sentiment-analysis"
    )
    emotion_classifier = pipeline(
        "sentiment-analysis", 
        model="pysentimiento/robertuito-emotion-analysis"
    )
except Exception as e:
    print(f"Error loading specific models: {e}. Using alternatives.")
    sentiment_classifier = pipeline(
        "sentiment-analysis", 
        model="dccuchile/bert-base-spanish-wwm-cased"
    )
    emotion_classifier = pipeline(
        "sentiment-analysis", 
        model="dccuchile/bert-base-spanish-wwm-cased"
    )


class TextAnalysisService:
    """Service for text analysis operations"""
    
    @staticmethod
    def preprocess_text(text: str) -> Tuple[str, list]:
        """
        Clean and tokenize text
        
        Args:
            text: Raw text input
            
        Returns:
            Tuple of (processed_text, tokens)
        """
        text = text.lower()
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        text = re.sub(r'[^\w\s]', '', text)
        tokens = word_tokenize(text, language='spanish')
        stop_words = set(stopwords.words('spanish'))
        clean_tokens = [
            token for token in tokens 
            if token not in stop_words and len(token) > 2
        ]
        return " ".join(clean_tokens), clean_tokens
    
    @staticmethod
    def analyze_diary_complete(diary_df: pd.DataFrame) -> Tuple[pd.DataFrame, List[Dict]]:
        """
        Analyze diary entries and return analysis data with topics

        Args:
            diary_df: DataFrame with 'note' column containing diary entries

        Returns:
            Tuple of (DataFrame with analysis results, List of global topics)
        """
        analysis = []
        all_texts = []

        for note in diary_df['note']:
            try:
                processed_text, tokens = TextAnalysisService.preprocess_text(note)
                sentiment_result = sentiment_classifier(note)[0]
                emotion_result = emotion_classifier(note)[0]

                analysis.append({
                    'nota_original': note,
                    'texto_procesado': processed_text,
                    'tokens': tokens,
                    'sentimiento': sentiment_result['label'],
                    'emocion': emotion_result['label'],
                    'emocion_score': emotion_result['score']
                })
                all_texts.append(note)
            except Exception as e:
                print(f"Error processing note: {e}")
                analysis.append({
                    'nota_original': note,
                    'texto_procesado': '',
                    'tokens': [],
                    'sentimiento': 'ERROR',
                    'emocion': 'ERROR',
                    'emocion_score': 0.0
                })
                all_texts.append(note)

        df_analysis = pd.DataFrame(analysis)

        # Extraer topics globales
        global_topics = TextAnalysisService.extract_topics(all_texts, n_topics=3)

        # Asignar topics a cada nota
        df_analysis = TextAnalysisService.assign_topics_to_notes(df_analysis, global_topics)

        return df_analysis, global_topics
    
    @staticmethod
    def analyze_single_note(note_text: str) -> dict:
        """
        Analyze a single note
        
        Args:
            note_text: Text to analyze
            
        Returns:
            Dictionary with analysis results
        """
        processed_text, tokens = TextAnalysisService.preprocess_text(note_text)
        sentiment_result = sentiment_classifier(note_text)[0]
        emotion_result = emotion_classifier(note_text)[0]
        
        return {
            'texto_procesado': processed_text,
            'tokens': tokens,
            'sentimiento': sentiment_result['label'],
            'emocion': emotion_result['label'],
            'emocion_score': emotion_result['score']
        }

    @staticmethod
    def extract_topics(texts: List[str], n_topics: int = 3, n_top_words: int = 5) -> List[Dict]:
        """
        Extract topics from a collection of texts using NMF and TF-IDF

        Args:
            texts: List of text documents
            n_topics: Number of topics to extract
            n_top_words: Number of top words per topic

        Returns:
            List of topic dictionaries with name, keywords, and frequency
        """
        if len(texts) < n_topics:
            n_topics = min(len(texts), 2)  # Reducir si hay pocos textos

        if len(texts) < 2:
            # Si hay muy pocos textos, crear un topic genérico
            all_words = []
            for text in texts:
                _, tokens = TextAnalysisService.preprocess_text(text)
                all_words.extend(tokens)

            if all_words:
                # Contar frecuencia de palabras
                word_freq = {}
                for word in all_words:
                    word_freq[word] = word_freq.get(word, 0) + 1

                top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:n_top_words]
                keywords = [word for word, _ in top_words]

                return [{
                    'name': TextAnalysisService._categorize_topic(keywords),
                    'keywords': keywords,
                    'frequency': 100
                }]
            else:
                return []

        try:
            # Preprocesar textos
            processed_texts = []
            for text in texts:
                processed, _ = TextAnalysisService.preprocess_text(text)
                processed_texts.append(processed)

            # Crear TF-IDF matrix
            vectorizer = TfidfVectorizer(max_df=0.95, min_df=1, stop_words=stopwords.words('spanish'))
            tfidf_matrix = vectorizer.fit_transform(processed_texts)

            # Aplicar NMF
            nmf_model = NMF(n_components=n_topics, random_state=42, max_iter=200)
            nmf_matrix = nmf_model.fit_transform(tfidf_matrix)

            # Obtener nombres de características
            feature_names = vectorizer.get_feature_names_out()

            topics = []
            for topic_idx, topic in enumerate(nmf_model.components_):
                # Obtener las palabras más importantes para este topic
                top_words_idx = topic.argsort()[:-n_top_words-1:-1]
                keywords = [feature_names[i] for i in top_words_idx]

                # Calcular frecuencia del topic (promedio de pesos)
                topic_weights = nmf_matrix[:, topic_idx]
                frequency = int((topic_weights.mean() / topic_weights.max()) * 100) if topic_weights.max() > 0 else 0

                topic_name = TextAnalysisService._categorize_topic(keywords)

                topics.append({
                    'name': topic_name,
                    'keywords': keywords,
                    'frequency': max(frequency, 10)  # Mínimo 10% para visibilidad
                })

            # Ordenar por frecuencia
            topics.sort(key=lambda x: x['frequency'], reverse=True)
            return topics

        except Exception as e:
            print(f"Error en topic modeling: {e}")
            # Fallback: crear topics basados en palabras más frecuentes
            return TextAnalysisService._fallback_topic_extraction(texts, n_topics, n_top_words)

    @staticmethod
    def _categorize_topic(keywords: List[str]) -> str:
        """
        Categoriza un topic basado en sus palabras clave
        """
        keyword_text = ' '.join(keywords).lower()

        # Categorías comunes en contexto terapéutico
        categories = {
            'Ansiedad Social': ['ansiedad', 'social', 'miedo', 'gente', 'hablar', 'temblar', 'sudor', 'rubor', 'evitar', 'rechazo', 'publico', 'grupos'],
            'Depresión': ['triste', 'cansado', 'motivacion', 'energia', 'dormir', 'comer', 'interes', 'placer', 'culpa', 'fracaso', 'vacio', 'esperanza'],
            'Estrés Académico': ['estudiar', 'examen', 'notas', 'presion', 'tiempo', 'concentracion', 'universidad', 'clases', 'rendimiento', 'aprender'],
            'Problemas de Relación': ['pareja', 'amigos', 'familia', 'conflicto', 'comunicacion', 'soledad', 'discusion', 'celos', 'abandono', 'amor'],
            'Baja Autoestima': ['valer', 'merecer', 'capaz', 'inteligente', 'atractivo', 'confianza', 'critica', 'fracaso', 'comparacion', 'inutil'],
            'Trastornos Alimenticios': ['comer', 'peso', 'cuerpo', 'dieta', 'vomitar', 'ejercicio', 'control', 'imagen', 'hambre', 'apetito'],
            'Problemas de Sueño': ['dormir', 'despertar', 'insomnio', 'cansado', 'pesadillas', 'desvelo', 'noche', 'descansar', 'despierto'],
            'Estrés Laboral': ['trabajo', 'jefe', 'presion', 'tiempo', 'responsabilidades', 'burnout', 'cansado', 'frustrado', 'empresa'],
            'Ansiedad General': ['ansioso', 'preocupado', 'nervioso', 'tension', 'inquieto', 'angustiado', 'ataque', 'panico', 'respirar'],
            'Ataques de Pánico': ['panico', 'ataque', 'corazon', 'respirar', 'morir', 'locura', 'control', 'pecho', 'mareo', 'sudoracion'],
            'TOC (Trastorno Obsesivo)': ['pensamientos', 'intrusivos', 'rituales', 'compulsiones', 'limpiar', 'contar', 'verificar', 'orden', 'obsesion'],
            'Trauma/Abuso': ['trauma', 'abuso', 'violencia', 'miedo', 'flashbacks', 'pesadillas', 'confianza', 'seguridad', 'pasado', 'herida'],
            'Adicciones': ['adiccion', 'alcohol', 'drogas', 'control', 'consumo', 'dependencia', 'necesidad', 'problema', 'ayuda'],
            'Duelo/Pérdida': ['perdida', 'muerte', 'duelo', 'tristeza', 'vacío', 'recordar', 'ausencia', 'despedida', 'difícil'],
            'Problemas Familiares': ['familia', 'padres', 'hermanos', 'presion', 'expectativas', 'conflictos', 'apoyo', 'entender', 'casa'],
            'Conflictos Interpersonales': ['conflicto', 'persona', 'problema', 'entender', 'comunicar', 'frustracion', 'molesto', 'situacion'],
            'Problemas de Identidad': ['identidad', 'ser', 'persona', 'confundido', 'direccion', 'futuro', 'decisiones', 'cambio', 'crecer'],
            'Aislamiento Social': ['solo', 'aislado', 'amigos', 'contacto', 'social', 'conectar', 'soledad', 'rechazo', 'dificil'],
            'Estrés Financiero': ['dinero', 'economico', 'deudas', 'presupuesto', 'trabajar', 'necesidades', 'preocupacion', 'futuro'],
            'Problemas de Salud': ['salud', 'enfermedad', 'medico', 'dolor', 'tratamiento', 'diagnostico', 'preocupacion', 'cuerpo'],
            'Burnout Académico': ['agotado', 'universidad', 'estudiar', 'presion', 'rendimiento', 'motivacion', 'cansado', 'estresado'],
            'Miedo al Fracaso': ['fracasar', 'miedo', 'intentarlo', 'riesgo', 'equivocarme', 'perfeccionista', 'presion', 'exito'],
            'Problemas de Concentración': ['concentrar', 'atencion', 'distraido', 'pensar', 'mente', 'claro', 'olvido', 'foco'],
            'Ansiedad por el Futuro': ['futuro', 'incertidumbre', 'preocupado', 'planes', 'cambio', 'desconocido', 'seguridad', 'decisiones'],
            'Problemas de Autoimagen': ['apariencia', 'cuerpo', 'imagen', 'peso', 'aspecto', 'mirada', 'criticas', 'aceptar'],
            'Estrés por Cambios': ['cambio', 'adaptar', 'nuevo', 'dificil', 'transicion', 'incertidumbre', 'comodo', 'rutina'],
            'Soledad Emocional': ['solo', 'emocional', 'entender', 'compartir', 'conectar', 'sentimientos', 'aislado', 'relacion']
        }

        max_score = 0
        best_category = 'Tema General'

        for category, category_keywords in categories.items():
            score = sum(1 for keyword in category_keywords if keyword in keyword_text)
            if score > max_score:
                max_score = score
                best_category = category

        # Si no hay coincidencias suficientes, intentar una categorización más general
        if max_score < 2:
            if any(word in keyword_text for word in ['panico', 'ataque', 'corazon', 'respirar']):
                best_category = 'Ataques de Pánico'
            elif any(word in keyword_text for word in ['pensamientos', 'intrusivos', 'rituales', 'compulsiones']):
                best_category = 'TOC (Trastorno Obsesivo)'
            elif any(word in keyword_text for word in ['trauma', 'abuso', 'violencia', 'flashbacks']):
                best_category = 'Trauma/Abuso'
            elif any(word in keyword_text for word in ['adiccion', 'alcohol', 'drogas', 'consumo']):
                best_category = 'Adicciones'
            elif any(word in keyword_text for word in ['perdida', 'muerte', 'duelo', 'ausencia']):
                best_category = 'Duelo/Pérdida'
            elif any(word in keyword_text for word in ['dinero', 'economico', 'deudas', 'presupuesto']):
                best_category = 'Estrés Financiero'
            elif any(word in keyword_text for word in ['salud', 'enfermedad', 'medico', 'dolor']):
                best_category = 'Problemas de Salud'
            elif any(word in keyword_text for word in ['concentrar', 'atencion', 'distraido', 'olvido']):
                best_category = 'Problemas de Concentración'
            elif any(word in keyword_text for word in ['futuro', 'incertidumbre', 'planes', 'desconocido']):
                best_category = 'Ansiedad por el Futuro'
            elif any(word in keyword_text for word in ['cambio', 'adaptar', 'nuevo', 'transicion']):
                best_category = 'Estrés por Cambios'
            elif any(word in keyword_text for word in ['solo', 'emocional', 'entender', 'conectar']):
                best_category = 'Soledad Emocional'
            elif any(word in keyword_text for word in ['ansiedad', 'miedo', 'preocupacion', 'nervioso']):
                best_category = 'Ansiedad General'
            elif any(word in keyword_text for word in ['triste', 'deprimido', 'bajo']):
                best_category = 'Depresión'
            elif any(word in keyword_text for word in ['estudiar', 'examen', 'universidad']):
                best_category = 'Estrés Académico'
            elif any(word in keyword_text for word in ['relacion', 'pareja', 'amigos', 'familia']):
                best_category = 'Problemas Relacionales'
            else:
                best_category = 'Tema Personal'

        return best_category

    @staticmethod
    def _fallback_topic_extraction(texts: List[str], n_topics: int, n_top_words: int) -> List[Dict]:
        """
        Método de fallback para extracción de topics cuando NMF falla
        """
        try:
            all_words = []
            for text in texts:
                _, tokens = TextAnalysisService.preprocess_text(text)
                all_words.extend(tokens)

            if not all_words:
                return []

            # Contar frecuencia de palabras
            word_freq = {}
            for word in all_words:
                word_freq[word] = word_freq.get(word, 0) + 1

            # Crear topics basados en las palabras más frecuentes
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

            # Dividir en grupos para crear "topics"
            topics = []
            words_per_topic = max(1, len(top_words) // n_topics)

            for i in range(min(n_topics, len(top_words) // words_per_topic + 1)):
                start_idx = i * words_per_topic
                end_idx = min((i + 1) * words_per_topic, len(top_words))
                topic_words = top_words[start_idx:end_idx]

                if topic_words:
                    keywords = [word for word, _ in topic_words[:n_top_words]]
                    frequency = int((sum(freq for _, freq in topic_words) / len(all_words)) * 100)

                    topics.append({
                        'name': TextAnalysisService._categorize_topic(keywords),
                        'keywords': keywords,
                        'frequency': max(frequency, 5)
                    })

            return topics

        except Exception as e:
            print(f"Error en fallback topic extraction: {e}")
            return []

    @staticmethod
    def assign_topics_to_notes(notes_df: pd.DataFrame, global_topics: List[Dict]) -> pd.DataFrame:
        """
        Asigna topics específicos a cada nota individual basado en similitud con topics globales
        y categorías terapéuticas predefinidas

        Args:
            notes_df: DataFrame con las notas
            global_topics: Lista de topics globales extraídos

        Returns:
            DataFrame con columna 'topics' agregada
        """
        if not global_topics:
            notes_df['topics'] = [[] for _ in range(len(notes_df))]
            return notes_df

        def get_note_topics(note_text: str) -> List[str]:
            try:
                processed_text, tokens = TextAnalysisService.preprocess_text(note_text)
                note_topics = []

                # Primero intentar asignar basado en topics globales extraídos
                for topic in global_topics:
                    # Verificar si las palabras clave del topic aparecen en la nota
                    keyword_matches = sum(1 for keyword in topic['keywords'] if keyword in processed_text)
                    # Si al menos 1 palabra clave coincide, asignar el topic
                    if keyword_matches >= 1:
                        note_topics.append(topic['name'])

                # Si no se asignaron topics globales, intentar categorización directa
                if not note_topics:
                    direct_topic = TextAnalysisService._categorize_topic(tokens)
                    if direct_topic and direct_topic != 'Tema General':
                        note_topics.append(direct_topic)

                # Si aún no hay topics, hacer una asignación más flexible basada en palabras individuales
                if not note_topics:
                    try:
                        note_topics.extend(TextAnalysisService._flexible_topic_assignment(processed_text))
                    except Exception as e:
                        print(f"Error en asignación flexible: {e}")

                return note_topics

            except Exception as e:
                print(f"Error asignando topics a nota: {e}")
                return []

        notes_df['topics'] = notes_df['nota_original'].apply(get_note_topics)
        return notes_df

    @staticmethod
    def _flexible_topic_assignment(processed_text: str) -> List[str]:
        """
        Asignación flexible de topics basada en palabras clave individuales
        """
        topics_assigned = []
        text_lower = processed_text.lower()

        # Mapeo flexible de palabras individuales a categorías
        flexible_mappings = {
            'Ansiedad Social': ['ansioso', 'publico', 'gente', 'social', 'hablar', 'temblar', 'sudor', 'rubor', 'evitar'],
            'Depresión': ['triste', 'cansado', 'energia', 'dormir', 'motivacion', 'vacío', 'esperanza'],
            'Estrés Académico': ['examen', 'estudiar', 'notas', 'presion', 'concentracion', 'universidad', 'clases'],
            'Problemas de Relación': ['pareja', 'amigos', 'familia', 'conflicto', 'comunicacion', 'soledad', 'abandono', 'discusion'],
            'Baja Autoestima': ['valer', 'merecer', 'capaz', 'inteligente', 'confianza', 'critica', 'comparacion'],
            'Trastornos Alimenticios': ['comer', 'peso', 'cuerpo', 'dieta', 'vomitar', 'apetito', 'imagen'],
            'Problemas de Sueño': ['dormir', 'despertar', 'insomnio', 'pesadillas', 'desvelo', 'descansar'],
            'Estrés Laboral': ['trabajo', 'jefe', 'presion', 'tiempo', 'responsabilidades', 'agotado'],
            'Ansiedad General': ['preocupado', 'nervioso', 'tension', 'inquieto', 'angustiado'],
            'Ataques de Pánico': ['panico', 'ataque', 'corazon', 'respirar', 'morir', 'pecho', 'mareo'],
            'TOC (Trastorno Obsesivo)': ['pensamientos', 'intrusivos', 'rituales', 'compulsiones', 'limpiar', 'contar', 'verificar'],
            'Trauma/Abuso': ['trauma', 'abuso', 'violencia', 'flashbacks', 'miedo', 'seguridad'],
            'Adicciones': ['adiccion', 'alcohol', 'drogas', 'consumo', 'dependencia'],
            'Duelo/Pérdida': ['perdida', 'muerte', 'duelo', 'ausencia', 'vacío'],
            'Problemas Familiares': ['familia', 'padres', 'hermanos', 'presion', 'expectativas'],
            'Conflictos Interpersonales': ['conflicto', 'persona', 'frustracion', 'molesto', 'situacion'],
            'Problemas de Identidad': ['identidad', 'persona', 'confundido', 'direccion', 'futuro'],
            'Aislamiento Social': ['solo', 'aislado', 'amigos', 'contacto', 'conectar', 'soledad'],
            'Estrés Financiero': ['dinero', 'economico', 'deudas', 'presupuesto', 'necesidades'],
            'Problemas de Salud': ['salud', 'enfermedad', 'medico', 'dolor', 'diagnostico', 'preocupacion'],
            'Burnout Académico': ['agotado', 'universidad', 'quemado', 'rendimiento', 'motivacion'],
            'Miedo al Fracaso': ['fracasar', 'miedo', 'intentar', 'riesgo', 'perfeccionista'],
            'Problemas de Concentración': ['concentrar', 'atencion', 'distraido', 'mente', 'olvido'],
            'Ansiedad por el Futuro': ['futuro', 'incertidumbre', 'planes', 'desconocido', 'paraliza'],
            'Problemas de Autoimagen': ['apariencia', 'aspecto', 'comparo', 'redes'],
            'Estrés por Cambios': ['cambio', 'adaptar', 'nuevo', 'dificil', 'transicion', 'comodo'],
            'Soledad Emocional': ['solo', 'emocional', 'entender', 'compartir', 'conectar', 'intimidad']
        }

        for category, keywords in flexible_mappings.items():
            if any(keyword in text_lower for keyword in keywords):
                topics_assigned.append(category)

        # Limitar a máximo 2 topics por nota para evitar sobrecarga
        return topics_assigned[:2]

