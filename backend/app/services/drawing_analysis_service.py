"""
Drawing analysis service for psychological assessment
Analyzes drawings and provides quantitative metrics and AI insights
"""
import cv2
import numpy as np
import base64
import io
from typing import Dict, Optional, Tuple
from skimage import morphology
import warnings
from app.config.settings import settings
from app.services.gemini_service import GeminiService
import google.generativeai as genai


class DrawingAnalysisService:
    """Service for analyzing drawings and providing insights"""
    
    @staticmethod
    def decode_base64_image(image_base64: str) -> Optional[np.ndarray]:
        """
        Decode base64 image string to OpenCV image
        
        Args:
            image_base64: Base64 encoded image string (with or without data URL prefix)
            
        Returns:
            OpenCV image array or None if error
        """
        try:
            # Remove data URL prefix if present
            if ',' in image_base64:
                image_base64 = image_base64.split(',')[1]
            
            # Decode base64
            image_bytes = base64.b64decode(image_base64)
            
            # Convert to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            
            # Decode image
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            print(f"Error decoding base64 image: {e}")
            return None
    
    @staticmethod
    def encode_image_to_base64(img: np.ndarray, format: str = 'png') -> str:
        """
        Encode OpenCV image to base64 string
        
        Args:
            img: OpenCV image array
            format: Image format ('png' or 'jpg')
            
        Returns:
            Base64 encoded image string
        """
        try:
            # Encode image
            if format == 'png':
                _, buffer = cv2.imencode('.png', img)
            else:
                _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 90])
            
            # Convert to base64
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            return image_base64
        except Exception as e:
            print(f"Error encoding image to base64: {e}")
            return ""
    
    @staticmethod
    def quantify_drawing(img: np.ndarray) -> Optional[Dict]:
        """
        Analyze a drawing and extract quantitative metrics
        
        Args:
            img: OpenCV image array
            
        Returns:
            Dictionary with metrics or None if error
        """
        if img is None:
            return None
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            img_gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            altura, ancho = img_gris.shape

            # Binarización (Umbral de Otsu automático)
            _, img_binaria = cv2.threshold(img_gris, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            pixeles_trazo = np.sum(img_binaria == 255)
            pixeles_totales = img_binaria.size
            densidad_trazo = (pixeles_trazo / pixeles_totales) * 100

            # Complejidad de Bordes (Canny)
            img_bordes_canny = cv2.Canny(img_gris, 100, 200)
            complejidad_bordes = np.sum(img_bordes_canny == 255)
            complejidad_relativa = (complejidad_bordes / pixeles_totales) * 100

            # Número de Esquinas (Harris Corner)
            img_gris_float = np.float32(img_gris)
            dst = cv2.cornerHarris(img_gris_float, 2, 3, 0.04)
            num_esquinas = np.sum(dst > 0.01 * dst.max())

            # Contraste General (Desviación Estándar de la imagen en grises)
            media_intensidad, std_dev_intensidad = cv2.meanStdDev(img_gris)
            contraste_general = std_dev_intensidad[0][0]

            # Esqueletización (Longitud del Trazo)
            img_esqueleto = morphology.skeletonize(img_binaria > 0)
            longitud_esqueleto = np.sum(img_esqueleto)

            # Uso del Espacio (Bounding Box)
            puntos = cv2.findNonZero(img_binaria)
            uso_espacio = 0.0
            if puntos is not None:
                x, y, w, h = cv2.boundingRect(puntos)
                area_dibujo = w * h
                area_total = ancho * altura
                uso_espacio = (area_dibujo / area_total) * 100

            metricas = {
                "densidad_trazo_porcentaje": round(densidad_trazo, 2),
                "complejidad_bordes_relativa_porcentaje": round(complejidad_relativa, 2),
                "longitud_total_esqueleto_pixeles": int(longitud_esqueleto),
                "numero_esquinas_detectadas": int(num_esquinas),
                "contraste_general_std_dev": round(contraste_general, 2),
                "uso_del_espacio_porcentaje": round(uso_espacio, 2),
            }
            return metricas
    
    @staticmethod
    def create_visualization_steps(img: np.ndarray, metrics: Optional[Dict] = None) -> Dict[str, str]:
        """
        Create visualization steps of the analysis process
        
        Args:
            img: OpenCV image array
            metrics: Optional metrics dictionary
            
        Returns:
            Dictionary with base64 encoded visualization images
        """
        if img is None:
            return {}
        
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            img_original_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img_gris = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            altura, ancho = img_gris.shape

            visualizations = {}
            
            # Paso 0: Imagen Original
            visualizations["original"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_original_rgb, cv2.COLOR_RGB2BGR)
            )

            # Paso 1: Binarización
            _, img_binaria = cv2.threshold(img_gris, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            visualizations["binarizacion"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_binaria, cv2.COLOR_GRAY2BGR)
            )

            # Paso 2: Bordes Canny
            img_bordes_canny = cv2.Canny(img_gris, 100, 200)
            visualizations["bordes_canny"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_bordes_canny, cv2.COLOR_GRAY2BGR)
            )

            # Paso 3: Esquinas Harris
            img_gris_float = np.float32(img_gris)
            dst = cv2.cornerHarris(img_gris_float, 2, 3, 0.04)
            img_con_esquinas = img_original_rgb.copy()
            dst_dilatado = cv2.dilate(dst, None)
            img_con_esquinas[dst_dilatado > 0.01 * dst_dilatado.max()] = [255, 0, 0]  # Rojo
            visualizations["esquinas_harris"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_con_esquinas, cv2.COLOR_RGB2BGR)
            )

            # Paso 4: Esqueleto
            img_esqueleto = morphology.skeletonize(img_binaria > 0)
            img_esqueleto_uint8 = (img_esqueleto.astype(np.uint8) * 255)
            visualizations["esqueleto"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_esqueleto_uint8, cv2.COLOR_GRAY2BGR)
            )

            # Paso 5: Bounding Box
            puntos = cv2.findNonZero(img_binaria)
            img_con_bbox = img_original_rgb.copy()
            if puntos is not None:
                x, y, w, h = cv2.boundingRect(puntos)
                cv2.rectangle(img_con_bbox, (x, y), (x + w, y + h), (0, 255, 0), 3)
            visualizations["bounding_box"] = DrawingAnalysisService.encode_image_to_base64(
                cv2.cvtColor(img_con_bbox, cv2.COLOR_RGB2BGR)
            )

            return visualizations
    
    @staticmethod
    def generate_ai_insights(metrics: Dict) -> str:
        """
        Generate AI insights from drawing metrics using Gemini
        
        Args:
            metrics: Dictionary with drawing metrics
            
        Returns:
            AI-generated insights text
        """
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            SYSTEM_PROMPT = (
                "Eres un asistente de análisis de datos visuales que ayuda a psicólogos. "
                "Tu tarea es tomar métricas numéricas de un dibujo y transformarlas en una descripción cualitativa. "
                "Luego, basado **solamente en la descripción visual**, sugiere **posibles áreas de enfoque** o **preguntas visuales** "
                "para el psicólogo, sin emitir ningún juicio psicológico directo, diagnóstico o interpretación emocional. "
                "Mantén un tono objetivo y de apoyo, centrándote en lo que los patrones visuales 'podrían indicar' "
                "desde una perspectiva visual, dejando la interpretación psicológica al experto humano. "
                "Ejemplo: 'El dibujo muestra una densidad de trazo media con bordes suaves. Visualmente, esto podría sugerir una aproximación fluida al espacio. ¿Podría la uniformidad en el trazo indicar un patrón de consistencia?'"
                "NO uses lenguaje como 'el paciente podría sentir...' o 'indica ansiedad'. Céntrate en lo visual."
            )

            USER_PROMPT = (
                f"Aquí están las métricas del dibujo: {metrics}. "
                "Por favor, dame la descripción objetiva y las sugerencias visuales."
            )

            model = genai.GenerativeModel(
                model_name='gemini-2.0-flash-exp',
                system_instruction=SYSTEM_PROMPT
            )
            
            response = model.generate_content(USER_PROMPT)
            return response.text
            
        except Exception as e:
            error_message = str(e)
            if "API_KEY_INVALID" in error_message:
                return "Error: La API Key proporcionada no es válida."
            elif "404" in error_message:
                return f"Error 404: No se encuentra el modelo. Verifica el nombre del modelo. {e}"
            else:
                return f"Error al contactar la API de Gemini: {e}"
    
    @staticmethod
    def analyze_drawing(image_base64: str) -> Dict:
        """
        Complete analysis pipeline: decode, quantify, visualize, and generate insights
        
        Args:
            image_base64: Base64 encoded image string
            
        Returns:
            Dictionary with complete analysis results
        """
        # Decode image
        img = DrawingAnalysisService.decode_base64_image(image_base64)
        if img is None:
            return {"error": "No se pudo decodificar la imagen"}
        
        # Quantify drawing
        metrics = DrawingAnalysisService.quantify_drawing(img)
        if metrics is None:
            return {"error": "No se pudieron calcular las métricas"}
        
        # Create visualizations
        visualizations = DrawingAnalysisService.create_visualization_steps(img, metrics)
        
        # Generate AI insights
        ai_insights = DrawingAnalysisService.generate_ai_insights(metrics)
        
        return {
            "metrics": metrics,
            "visualizations": visualizations,
            "ai_insights": ai_insights
        }

