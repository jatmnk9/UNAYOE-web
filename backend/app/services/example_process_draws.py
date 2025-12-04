import cv2
import numpy as np
import matplotlib.pyplot as plt # Necesario para la visualización
from skimage import morphology
import warnings
import google.generativeai as genai
import sys

# --- Función para Cuantificar el Dibujo (sin cambios mayores) ---
def cuantificar_dibujo(ruta_imagen):
    """
    Carga un dibujo y extrae métricas numéricas cuantificables.
    """
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        img_original = cv2.imread(ruta_imagen)
    
    if img_original is None:
        print(f"Error: No se pudo cargar la imagen: {ruta_imagen}", file=sys.stderr)
        return None

    img_gris = cv2.cvtColor(img_original, cv2.COLOR_BGR2GRAY)
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

# --- Nueva Función para Visualizar los Pasos ---
def visualizar_pasos_de_procesamiento(ruta_imagen, metricas_cuantificadas=None):
    """
    Carga un dibujo y muestra visualmente cada paso del
    análisis cuantitativo en una cuadrícula.
    """
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        img_original = cv2.imread(ruta_imagen)
    
    if img_original is None:
        print(f"Error: No se pudo cargar la imagen: {ruta_imagen}", file=sys.stderr)
        return

    img_original_rgb = cv2.cvtColor(img_original, cv2.COLOR_BGR2RGB)
    img_gris = cv2.cvtColor(img_original, cv2.COLOR_BGR2GRAY)
    altura, ancho = img_gris.shape

    fig, axes = plt.subplots(3, 2, figsize=(12, 18))
    fig.suptitle('Visualización del Procesamiento Paso a Paso', fontsize=16)
    axes = axes.ravel() 

    # --- Paso 0: Imagen Original ---
    axes[0].imshow(img_original_rgb)
    axes[0].set_title('0. Imagen Original')
    axes[0].axis('off')

    # --- Paso 1: Binarización (para Densidad) ---
    _, img_binaria = cv2.threshold(img_gris, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    densidad_str = f"Densidad: {metricas_cuantificadas['densidad_trazo_porcentaje']:.2f}%" if metricas_cuantificadas else ""
    axes[1].imshow(img_binaria, cmap='gray')
    axes[1].set_title(f'1. Binarización ({densidad_str})')
    axes[1].axis('off')

    # --- Paso 2: Bordes Canny (para Complejidad) ---
    img_bordes_canny = cv2.Canny(img_gris, 100, 200)
    complejidad_str = f"Complejidad: {metricas_cuantificadas['complejidad_bordes_relativa_porcentaje']:.2f}%" if metricas_cuantificadas else ""
    axes[2].imshow(img_bordes_canny, cmap='gray')
    axes[2].set_title(f'2. Bordes Canny ({complejidad_str})')
    axes[2].axis('off')

    # --- Paso 3: Esquinas Harris (para Angulosidad) ---
    img_gris_float = np.float32(img_gris)
    dst = cv2.cornerHarris(img_gris_float, 2, 3, 0.04)
    img_con_esquinas = img_original_rgb.copy()
    dst_dilatado = cv2.dilate(dst, None)
    img_con_esquinas[dst_dilatado > 0.01 * dst_dilatado.max()] = [255, 0, 0] # Rojo
    num_esquinas_str = f"Total: {metricas_cuantificadas['numero_esquinas_detectadas']}" if metricas_cuantificadas else ""
    axes[3].imshow(img_con_esquinas)
    axes[3].set_title(f'3. Esquinas Harris ({num_esquinas_str})')
    axes[3].axis('off')

    # --- Paso 4: Esqueleto (para Longitud de Trazo) ---
    img_esqueleto = morphology.skeletonize(img_binaria > 0)
    longitud_esqueleto_str = f"Longitud: {metricas_cuantificadas['longitud_total_esqueleto_pixeles']} px" if metricas_cuantificadas else ""
    axes[4].imshow(img_esqueleto, cmap='gray')
    axes[4].set_title(f'4. Esqueleto ({longitud_esqueleto_str})')
    axes[4].axis('off')

    # --- Paso 5: Bounding Box (para Uso de Espacio) ---
    puntos = cv2.findNonZero(img_binaria)
    img_con_bbox = img_original_rgb.copy()
    uso_espacio_str = ""
    if puntos is not None:
        x, y, w, h = cv2.boundingRect(puntos)
        cv2.rectangle(img_con_bbox, (x, y), (x + w, y + h), (0, 255, 0), 3)
        uso_espacio_str = f"BBox: {metricas_cuantificadas['uso_del_espacio_porcentaje']:.2f}%" if metricas_cuantificadas else ""
        
    axes[5].imshow(img_con_bbox)
    axes[5].set_title(f'5. Uso de Espacio ({uso_espacio_str})')
    axes[5].axis('off')

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.show()

# --- Función para llamar a Gemini (con el modelo corregido y prompt ajustado) ---
def llamar_a_gemini(metricas, api_key):
    """
    Envía las métricas a la API de Gemini para una descripción objetiva con sugerencias.
    """
    try:
        genai.configure(api_key=api_key)
        
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
            f"Aquí están las métricas del dibujo: {metricas}. "
            "Por favor, dame la descripción objetiva y las sugerencias visuales."
        )

        model = genai.GenerativeModel(
            model_name='gemini-flash-latest', # Modelo corregido
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

# --- --- --- --- --- --- --- --- --- --- ---
# --- PUNTO DE ENTRADA PRINCIPAL DEL SCRIPT ---
# --- --- --- --- --- --- --- --- --- --- ---
if __name__ == "__main__":
    
    # 1. Pega tu API Key aquí (asegúrate de que sea la correcta)
    MI_API_KEY = "AIzaSyDIumJs1m-gqOyRFR-L_zLgdJfoaC_KCCg" 

    if MI_API_KEY == "AQUI_VA_TU_API_KEY_DE_GEMINI":
        print("Error: Reemplaza 'AQUI_VA_TU_API_KEY_DE_GEMINI' con tu API Key real.", file=sys.stderr)
        sys.exit(1)

    # 2. Creación de un dibujo de ejemplo (opcional, si no tienes uno)
    print("Creando 'dibujo_ejemplo.png' para demostración si no existe...")
    dummy_drawing_path = 'dibujo_ejemplo.png'
    try:
        if not cv2.imread(dummy_drawing_path) is None: # Si el archivo existe y es una imagen válida
            print(f"'{dummy_drawing_path}' ya existe. Usando archivo existente.")
        else:
            raise FileNotFoundError # Forzar la creación si no es válido
    except (FileNotFoundError, AttributeError): # Si no existe o no es una imagen válida
        print(f"'{dummy_drawing_path}' no encontrado o inválido. Creando uno nuevo...")
        dummy_drawing = np.zeros((400, 400), dtype=np.uint8) + 255 # Fondo blanco
        cv2.circle(dummy_drawing, (200, 200), 150, 0, 10) # Círculo grande y grueso
        cv2.line(dummy_drawing, (50, 50), (350, 350), 0, 3) # Línea diagonal fina
        cv2.rectangle(dummy_drawing, (250, 80), (320, 150), 0, -1) # Rectángulo relleno (simula trazo denso)
        cv2.putText(dummy_drawing, "Test?", (70, 300), cv2.FONT_HERSHEY_SIMPLEX, 2, 0, 4)
        cv2.imwrite(dummy_drawing_path, dummy_drawing)
        print("Dibujo de ejemplo 'dibujo_ejemplo.png' creado.")

    # 3. Define la ruta de la imagen a analizar
    # !!! CAMBIA ESTO A TU IMAGEN REAL SI NO ES 'depresion.jpeg' !!!
    ruta_de_tu_dibujo = 'depresion.jpeg'
    
    print(f"\n--- Iniciando análisis para: {ruta_de_tu_dibujo} ---")
    
    # 4. Obtener métricas objetivas
    resultados_cuantitativos = cuantificar_dibujo(ruta_de_tu_dibujo)
    
    if resultados_cuantitativos:
        print("\n--- [PASO 1] Resultados del Análisis Cuantitativo ---")
        for metrica, valor in resultados_cuantitativos.items():
            print(f"  - {metrica}: {valor}")
        print("--------------------------------------------------")

        # 5. Visualizar los pasos de procesamiento (¡ahora se mostrará la ventana!)
        print("\nMostrando los pasos de procesamiento de imagen...")
        visualizar_pasos_de_procesamiento(ruta_de_tu_dibujo, resultados_cuantitativos)
        print("Ventana de visualización cerrada.")

        # 6. Obtener descripción de la IA
        print("\nContactando a la API de Gemini para un resumen y sugerencias...")
        descripcion_ia = llamar_a_gemini(resultados_cuantitativos, MI_API_KEY)
        
        print("\n--- [PASO 2] Resumen Descriptivo y Sugerencias de la IA (para el psicólogo) ---")
        print(descripcion_ia)
        print("-----------------------------------------------------------------------------")