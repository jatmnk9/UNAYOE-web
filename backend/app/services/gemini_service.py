"""
Gemini AI service for generating content and insights
"""
import requests
from typing import Optional
from app.config.settings import settings


class GeminiService:
    """Service for interacting with Gemini AI"""
    
    @staticmethod
    def generate_accompaniment(text: str) -> Optional[str]:
        """
        Generate emotional accompaniment message for a diary note
        
        Args:
            text: Diary note text
            
        Returns:
            Generated accompaniment text or None if error
        """
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return None
        
        model = settings.GEMINI_ACCOMPANIMENT_MODEL
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent"
        )
        
        prompt_text = (
            "Eres un asistente empático que ofrece acompañamiento emocional breve y respetuoso. "
            "Después de leer la nota del usuario, responde con un mensaje de apoyo que refleje "
            "lo que el usuario escribió, ofrece una observación o consejo breve y termina siempre "
            "con una frase motivadora corta. No ofrezcas diagnóstico médico ni consejos terapéuticos "
            "detallados; si es necesario, sugiere buscar ayuda profesional. Responde en español.\n\n"
            f"Nota del usuario: {text}\n\nRespuesta:"
        )
        
        payload = {
            "contents": [
                {"parts": [{"text": prompt_text}]}
            ]
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-goog-api-key": api_key
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            return GeminiService._extract_text_from_response(data)
        except Exception as e:
            print(f"Error generating accompaniment: {e}")
            return None
    
    @staticmethod
    def generate_insight(texts: list[str]) -> str:
        """
        Generate insight and action plan from learning texts
        
        Args:
            texts: List of learning texts from attendance
            
        Returns:
            Generated insight text
        """
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        prompt = (
            "Eres un psicólogo universitario. Analiza brevemente los siguientes "
            "aprendizajes obtenidos por el estudiante en sus citas y genera:\n"
            "- Un resumen breve (máximo 3 líneas).\n"
            "- Una recomendación breve y concreta como plan de acción para la siguiente "
            "sesión (máximo 2 líneas).\n"
            "El resultado debe estar en español, estar en prosa, ser breve y ser útil "
            "para el psicólogo.\n\n"
        )
        
        for idx, text in enumerate(texts, 1):
            prompt += f"Aprendizaje {idx}: {text}\n"
        
        prompt += "\nInsight y plan de acción:"
        
        response = model.generate_content(prompt)
        return response.text.strip()
    
    @staticmethod
    def generate_chatbot_response(context: dict, question: str) -> str:
        """
        Generate chatbot response for psychological assistant
        
        Args:
            context: Context dictionary with sentimientos and emociones
            question: Question from psychologist
            
        Returns:
            Generated response text
        """
        import google.generativeai as genai
        
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        
        prompt = (
            "Eres un asistente psicológico empático y conversacional. "
            "Responde de forma breve (1 a 3 líneas), con tono cálido, humano y natural. "
            "Anima a seguir conversando o preguntando. Evita respuestas largas o formales.\n\n"
            "Contexto del estudiante:\n"
        )
        
        if context.get("sentimientos"):
            prompt += f"Sentimientos: {context['sentimientos']}\n"
        if context.get("emociones"):
            prompt += f"Emociones: {context['emociones']}\n"
        
        prompt += f"\nConsulta del psicólogo: {question}\nRespuesta:"
        
        response = model.generate_content(prompt)
        return response.text.strip()
    
    @staticmethod
    def _extract_text_from_response(data: dict) -> Optional[str]:
        """Extract text from Gemini API response"""
        if not isinstance(data, dict):
            return None
        
        candidates = data.get('candidates') or data.get('outputs') or data.get('items')
        if not candidates or not isinstance(candidates, list) or len(candidates) == 0:
            return None
        
        first = candidates[0]
        if not isinstance(first, dict):
            return None
        
        # Try parts first
        parts = first.get('parts') or first.get('content')
        if parts and isinstance(parts, list):
            collected = []
            for part in parts:
                if isinstance(part, dict) and part.get('text'):
                    collected.append(part.get('text'))
            if collected:
                return ' '.join(collected)
        
        # Try direct content
        return (
            first.get('content') or 
            first.get('output') or 
            first.get('text')
        )

