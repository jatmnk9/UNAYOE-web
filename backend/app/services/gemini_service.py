"""
Gemini AI service for generating content and insights
"""
import os
import requests
from typing import Optional
from app.config.settings import settings


class GeminiService:
    """Service for interacting with Gemini AI"""
    # Preferred models in order of likelihood to be enabled
    _FALLBACK_MODELS = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro"
    ]

    @staticmethod
    def _post_generate(model: str, payload: dict, api_key: str) -> requests.Response:
        """
        Perform POST to Gemini generateContent endpoint.

        Uses v1beta endpoint and `x-goog-api-key` header.
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        headers = {
            "Content-Type": "application/json",
            # Docs use lowercase; header names are case-insensitive but we keep consistent
            "x-goog-api-key": api_key,
        }
        return requests.post(url, json=payload, headers=headers, timeout=10)
    
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
        
        # Usar modelo desde variable de entorno con valor por defecto
        model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        
        # Build payload
        
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
        
        # Try requested model first then fall back if 4xx (e.g., 403 Forbidden for disabled models)
        try_models = [model] + [m for m in GeminiService._FALLBACK_MODELS if m != model]
        for m in try_models:
            try:
                response = GeminiService._post_generate(m, payload, api_key)
                if response.status_code >= 400:
                    # Log structured error for troubleshooting
                    try:
                        err = response.json()
                    except Exception:
                        err = {"raw": response.text}
                    print(f"[GEMINI_ACCOMPANIMENT] Model '{m}' error {response.status_code}: {err}")
                    # If the key is leaked or invalid, stop trying and surface message
                    if isinstance(err, dict) and isinstance(err.get("error"), dict):
                        message = err["error"].get("message", "")
                        status = err["error"].get("status", "")
                        if "reported as leaked" in message or status in ("PERMISSION_DENIED", "UNAUTHENTICATED"):
                            return "No se pudo generar acompañamiento: la API key de Gemini está invalidada. Genera y configura una nueva clave."
                    # If client error, try next fallback; if server error, break
                    if 500 <= response.status_code < 600:
                        break
                    continue
                data = response.json()
                print(f"[GEMINI_ACCOMPANIMENT] Using model '{m}'")
                result = GeminiService._extract_text_from_response(data)
                if not result:
                    print(f"[GEMINI_ACCOMPANIMENT] No text extracted. Full response: {data}")
                return result
            except requests.exceptions.RequestException as e:
                print(f"[GEMINI_ACCOMPANIMENT] Request error with model '{m}': {e}")
                continue
        # All attempts failed
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
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return "No se pudo generar insight: API key no configurada"
        
        # Usar modelo desde variable de entorno con valor por defecto
        model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        
        # Build payload
        
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
        
        payload = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }
        
        # Try requested model then fallbacks
        try_models = [model] + [m for m in GeminiService._FALLBACK_MODELS if m != model]
        for m in try_models:
            try:
                response = GeminiService._post_generate(m, payload, api_key)
                if response.status_code >= 400:
                    try:
                        err = response.json()
                    except Exception:
                        err = {"raw": response.text}
                    print(f"[GEMINI_INSIGHT] Model '{m}' error {response.status_code}: {err}")
                    if isinstance(err, dict) and isinstance(err.get("error"), dict):
                        message = err["error"].get("message", "")
                        status = err["error"].get("status", "")
                        if "reported as leaked" in message or status in ("PERMISSION_DENIED", "UNAUTHENTICATED"):
                            return "No se pudo generar insight: la API key de Gemini está invalidada. Genera y configura una nueva clave."
                    if 500 <= response.status_code < 600:
                        break
                    continue
                data = response.json()
                print(f"[GEMINI_INSIGHT] Using model '{m}'")
                result = GeminiService._extract_text_from_response(data)
                return result.strip() if result else "No se pudo generar insight"
            except requests.exceptions.RequestException as e:
                print(f"[GEMINI_INSIGHT] Request error with model '{m}': {e}")
                continue
        return "No se pudo generar insight"
    
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
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            return "No se pudo generar respuesta: API key no configurada"
        
        # Usar modelo desde variable de entorno con valor por defecto
        model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        
        # Build payload
        
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
        
        payload = {
            "contents": [
                {"parts": [{"text": prompt}]}
            ]
        }
        
        # Try requested model then fallbacks
        try_models = [model] + [m for m in GeminiService._FALLBACK_MODELS if m != model]
        for m in try_models:
            try:
                response = GeminiService._post_generate(m, payload, api_key)
                if response.status_code >= 400:
                    try:
                        err = response.json()
                    except Exception:
                        err = {"raw": response.text}
                    print(f"[GEMINI_CHATBOT] Model '{m}' error {response.status_code}: {err}")
                    if isinstance(err, dict) and isinstance(err.get("error"), dict):
                        message = err["error"].get("message", "")
                        status = err["error"].get("status", "")
                        if "reported as leaked" in message or status in ("PERMISSION_DENIED", "UNAUTHENTICATED"):
                            return "No se pudo generar respuesta: la API key de Gemini está invalidada. Genera y configura una nueva clave."
                    if 500 <= response.status_code < 600:
                        break
                    continue
                data = response.json()
                print(f"[GEMINI_CHATBOT] Using model '{m}'")
                result = GeminiService._extract_text_from_response(data)
                return result.strip() if result else "No se pudo generar respuesta"
            except requests.exceptions.RequestException as e:
                print(f"[GEMINI_CHATBOT] Request error with model '{m}': {e}")
                continue
        return "No se pudo generar respuesta"
    
    @staticmethod
    def _extract_text_from_response(data: dict) -> Optional[str]:
        """Extract text from Gemini API response"""
        if not isinstance(data, dict):
            print(f"[GEMINI_EXTRACT] Data is not a dict: {type(data)}")
            return None
        
        # La estructura típica de Gemini API v1beta es:
        # {
        #   "candidates": [
        #     {
        #       "content": {
        #         "parts": [
        #           {"text": "..."}
        #         ]
        #       }
        #     }
        #   ]
        # }
        
        candidates = data.get('candidates')
        if not candidates or not isinstance(candidates, list) or len(candidates) == 0:
            print(f"[GEMINI_EXTRACT] No candidates found. Keys: {list(data.keys())}")
            return None
        
        first_candidate = candidates[0]
        if not isinstance(first_candidate, dict):
            print(f"[GEMINI_EXTRACT] First candidate is not a dict: {type(first_candidate)}")
            return None
        
        # Intentar obtener content.parts (estructura estándar de Gemini)
        content = first_candidate.get('content')
        if content and isinstance(content, dict):
            parts = content.get('parts')
            if parts and isinstance(parts, list):
                collected = []
                for part in parts:
                    if isinstance(part, dict) and part.get('text'):
                        collected.append(part.get('text'))
                if collected:
                    result = ' '.join(collected)
                    print(f"[GEMINI_EXTRACT] Extracted text (length: {len(result)})")
                    return result
        
        # Fallback: intentar parts directamente en el candidate
        parts = first_candidate.get('parts')
        if parts and isinstance(parts, list):
            collected = []
            for part in parts:
                if isinstance(part, dict) and part.get('text'):
                    collected.append(part.get('text'))
            if collected:
                result = ' '.join(collected)
                print(f"[GEMINI_EXTRACT] Extracted text from parts (length: {len(result)})")
                return result
        
        # Fallback: buscar campos directos
        text = (
            first_candidate.get('content') or 
            first_candidate.get('output') or 
            first_candidate.get('text')
        )
        
        if text:
            if isinstance(text, str):
                print(f"[GEMINI_EXTRACT] Extracted text from direct field (length: {len(text)})")
                return text
            elif isinstance(text, dict):
                # Si content es un dict, intentar extraer parts
                parts = text.get('parts')
                if parts:
                    collected = []
                    for part in parts:
                        if isinstance(part, dict) and part.get('text'):
                            collected.append(part.get('text'))
                    if collected:
                        result = ' '.join(collected)
                        print(f"[GEMINI_EXTRACT] Extracted text from content.parts (length: {len(result)})")
                        return result
        
        print(f"[GEMINI_EXTRACT] Could not extract text. Candidate keys: {list(first_candidate.keys()) if isinstance(first_candidate, dict) else 'N/A'}")
        return None

