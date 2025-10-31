import sys
import pandas as pd
import re
import io
import base64
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from transformers import pipeline
import nltk
import google.generativeai as genai
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from collections import Counter
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from supabase import create_client, Client
import os
from fastapi import Depends
import json # Necesario para manejar la serialización de Supabase si los tokens son complejos
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
import traceback
import requests
from pydantic import BaseModel
from fastapi import Request

# =========================================================
# 🧠 SISTEMA DE RECOMENDACIONES BASADO EN CONTENIDO
# =========================================================

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# --- Configuración de Supabase (Asumo que estas credenciales son válidas y solo de ejemplo) ---
url = "https://xygadfvudziwnddcicbb.supabase.co"
# python/main.py (Backend FastAPI)

# ⚠️ ADVERTENCIA: Esta clave tiene permisos de SUPERUSUARIO. ¡Úsala con cuidado!
# DEBE estar en una variable de entorno en producción.
# Asegúrate de usar la Service Role Key de tus ajustes de Supabase.
service_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Z2FkZnZ1ZHppd25kZGNpY2JiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxOTczNCwiZXhwIjoyMDc1MDk1NzM0fQ.KSc84hsragAyua8RhRaekeiJ1mPqtI28sXZmOzdQKOg" 
supabase: Client = create_client(url, service_key)
# --- Modelos Pydantic ---

class Estudiante(BaseModel):
    nombre: str
    apellido: str
    codigo_alumno: str
    dni: str
    edad: int
    genero: str
    celular: str
    facultad: str
    escuela: str
    direccion: str
    ciclo: str
    tipo_paciente: str
    correo_institucional: str
    universidad: str
    psicologo_id: str | None = None  # Acepta string (UUID) o None
    id: str # Tipo UUID en la BD, pero lo manejamos como str en Python/Pydantic


class Psicologo(BaseModel):
    nombre: str
    apellido: str
    dni: str
    codigo_minsa: str
    celular: str
    correo_institucional: str
    perfil_academico: str
    genero: str
    estado: str
    id: str

class AsistenciaRequest(BaseModel):
    id_usuario: str
    fecha_atencion: str
    nro_sesion: int
    modalidad_atencion: str
    motivo_atencion: str
    detalle_problema_actual: str
    acude_profesional_particular: bool
    diagnostico_particular: str | None = None
    tipo_tratamiento_actual: str
    comodidad_unayoe: bool
    aprendizaje_obtenido: str


# Define la estructura de datos para una nota (Añadido user_id)
class Note(BaseModel):
    note: str
    # 🔑 user_id DEBE venir en el cuerpo de la petición POST
    user_id: str 
class LoginRequest(BaseModel):
    email: str
    password: str

# Inicializa la aplicación FastAPI
app = FastAPI(title="API de Análisis de Bienestar")

# Configura CORS para permitir que el frontend se conecte
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=".*",  # ✅ Permite cualquier origen local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lógica de Procesamiento del Código Python ---

# Descarga las stop words de NLTK y el tokenizer 'punkt'
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    print("El recurso 'stopwords' no se encontró. Descargándolo...")
    nltk.download('stopwords')

try:
    nltk.data.find('tokenizers/punkt') # Corregido: 'punkt_tab' no es un recurso estándar.
except LookupError:
    print("El recurso 'punkt' no se encontró. Descargándolo...")
    nltk.download('punkt')

# Inicializa pipelines para sentimiento y emociones
try:
    print("Cargando modelos de PNL optimizados para español...")
    sentiment_classifier = pipeline("sentiment-analysis", model="pysentimiento/robertuito-sentiment-analysis")
    emotion_classifier = pipeline("sentiment-analysis", model="pysentimiento/robertuito-emotion-analysis")
except Exception as e:
    print(f"Error al cargar los modelos específicos: {e}. Usando alternativas.")
    sentiment_classifier = pipeline("sentiment-analysis", model="dccuchile/bert-base-spanish-wwm-cased")
    emotion_classifier = pipeline("sentiment-analysis", model="dccuchile/bert-base-spanish-wwm-cased")

def preprocesar_texto(texto):
    """Limpia y tokeniza el texto."""
    texto = texto.lower()
    texto = re.sub(r'http\S+|www\S+|https\S+', '', texto, flags=re.MULTILINE)
    texto = re.sub(r'[^\w\s]', '', texto)
    # Cambiado a 'word_tokenize(texto, language='spanish')' si 'punkt' está instalado
    tokens = word_tokenize(texto, language='spanish') 
    stop_words = set(stopwords.words('spanish'))
    tokens_limpios = [token for token in tokens if token not in stop_words and len(token) > 2]
    return " ".join(tokens_limpios), tokens_limpios

@app.post("/attendance-insight")
async def generate_attendance_insight(payload: dict):
    texts = payload.get("texts", [])
    if not texts:
        raise HTTPException(status_code=400, detail="No se proporcionaron aprendizajes.")

    prompt = (
        "Eres un psicólogo universitario. Analiza brevemente los siguientes aprendizajes obtenidos por el estudiante en sus citas y genera:\n"
        "- Un resumen breve (máximo 3 líneas).\n"
        "- Una recomendación breve y concreta como plan de acción para la siguiente sesión (máximo 2 líneas).\n"
        "El resultado debe estar en español, estar en prosa, ser breve y ser útil para el psicólogo.\n\n"
    )
    for idx, t in enumerate(texts):
        prompt += f"Aprendizaje {idx+1}: {t}\n"
    prompt += "\nInsight y plan de acción:"

    try:
        genai.configure(api_key="AIzaSyBJ0fo-zWzwu4licYxom3bYXLtB5qoal4k")
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        summary = response.text.strip()
        return {"summary": summary}
    except Exception as e:
        print(f"Error en Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando insight: {e}")
    
@app.post("/asistencia")
async def registrar_asistencia(asistencia: AsistenciaRequest):
    try:
        data = asistencia.dict()
        response = supabase.table("asistencia").insert(data).execute()
        return {"message": "Asistencia registrada con éxito", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar asistencia: {e}")

@app.post("/usuarios/estudiantes")
async def crear_estudiante(estudiante: Estudiante):
    try:
        data = estudiante.dict()
        data["rol"] = "estudiante"
        
        # 🔑 Supabase usa el ID proporcionado para la clave foránea
        response = supabase.table("usuarios").insert(data).execute()
        return {"message": "Estudiante creado con éxito", "data": response.data}
    except Exception as e:
        # Esto atrapará el error si el ID ya existe o es inválido
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/usuarios/psicologos")
async def crear_psicologo(psicologo: Psicologo):
    try:
        data = psicologo.dict()
        data["rol"] = "psicologo"
        response = supabase.table("usuarios").insert(data).execute()
        return {"message": "Psicólogo creado con éxito", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def analizar_diario_completo(diario_df):
    """Analiza las notas del diario y devuelve los datos del análisis."""
    analisis = []
    for nota in diario_df['note']:
        try:
            texto_procesado, tokens = preprocesar_texto(nota)
            sentimiento = sentiment_classifier(nota)[0]['label']
            emocion_analisis = emotion_classifier(nota)[0]
            emocion = emocion_analisis['label']
            emocion_score = emocion_analisis['score']
            analisis.append({
                'nota_original': nota,
                'texto_procesado': texto_procesado,
                'tokens': tokens,
                'sentimiento': sentimiento,
                'emocion': emocion,
                'emocion_score': emocion_score
            })
        except Exception as e:
            print(f"Error al procesar la nota: {e}")
            analisis.append({
                'nota_original': nota,
                'texto_procesado': '',
                'tokens': [],
                'sentimiento': 'ERROR',
                'emocion': 'ERROR',
                'emocion_score': 0.0
            })
    return pd.DataFrame(analisis)
@app.post("/login")
async def login_user(credentials: LoginRequest):
    try:
        # 1️⃣ Verificar credenciales
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Credenciales inválidas")

        user_id = auth_response.user.id

        # 2️⃣ Obtener el rol desde tu tabla 'usuarios'
        profile_response = supabase.table("usuarios").select("*").eq("id", user_id).single().execute()

        if not profile_response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado en tabla 'usuarios'")

        user_profile = profile_response.data

        # 3️⃣ Retornar usuario + tokens
        return JSONResponse({
            "message": "Inicio de sesión exitoso",
            "user": {
                "id": user_id,
                "email": credentials.email,
                "rol": user_profile["rol"],
                "nombre": user_profile.get("nombre", ""),
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# (Nota: la ruta /notas/{user_id} está definida más abajo; se eliminó esta definición duplicada
# para evitar comportamiento inesperado y facilitar la depuración.)


# 🔑 RUTA POST CORREGIDA: user_id ahora viene en el cuerpo de la petición Note
@app.post("/notas")
async def guardar_nota(note_data: Note):
    """Analiza y guarda una nueva nota en la base de datos."""
    try:
        # Extraer datos del modelo Note
        user_id = note_data.user_id
        nota_texto = note_data.note
        
        texto_procesado, tokens = preprocesar_texto(nota_texto)
        sentimiento = sentiment_classifier(nota_texto)[0]['label']
        emocion_analisis = emotion_classifier(nota_texto)[0]
        emocion = emocion_analisis['label']
        emocion_score = emocion_analisis['score']
        
        # Insertar en la tabla notas
        response = supabase.table("notas").insert([{
            "usuario_id": user_id,
            "nota": nota_texto,
            "sentimiento": sentimiento,
            "emocion": emocion,
            "emocion_score": emocion_score,
            # Asegúrate de que tu columna 'tokens' en Supabase acepta Listas/JSON
            "tokens": tokens 
        }]).execute()
        
        # GENERATIVE AI: intentar crear un mensaje de acompañamiento usando Gemini
        accompaniment_text = None
        try:
            def generate_accompaniment(texto):
                api_key = "AIzaSyBx_X4hSpLg5yzXZujgrShUIv6P1OSFLME"
                if not api_key:
                    return None

                # Modelo por defecto (puedes cambiarlo con GEMINI_MODEL env var)
                model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
                # Endpoint generateContent (usa header X-goog-api-key según tu ejemplo)
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

                # Construir el prompt: instrucción + nota del usuario
                prompt_text = (
                    "Eres un asistente empático que ofrece acompañamiento emocional breve y respetuoso. "
                    "Después de leer la nota del usuario, responde con un mensaje de apoyo que refleje lo que el usuario escribió, "
                    "ofrece una observación o consejo breve y termina siempre con una frase motivadora corta. "
                    "No ofrezcas diagnóstico médico ni consejos terapéuticos detallados; si es necesario, sugiere buscar ayuda profesional. "
                    "Responde en español.\n\n"
                    f"Nota del usuario: {texto}\n\nRespuesta:"
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

                r = requests.post(url, json=payload, headers=headers, timeout=10)
                r.raise_for_status()
                data = r.json()

                # Extraer texto de la respuesta de generateContent de forma robusta
                text_out = None
                if isinstance(data, dict):
                    # candidatos habituales: 'candidates' -> list of { 'content'|'output'|'parts': [{ 'text': ... }] }
                    candidates = data.get('candidates') or data.get('outputs') or data.get('items')
                    if candidates and isinstance(candidates, list) and len(candidates) > 0:
                        first = candidates[0]
                        # varias formas posibles
                        if isinstance(first, dict):
                            # 1) parts
                            parts = first.get('parts') or first.get('content')
                            if parts and isinstance(parts, list):
                                # juntar textos de partes
                                collected = []
                                for p in parts:
                                    if isinstance(p, dict) and p.get('text'):
                                        collected.append(p.get('text'))
                                if collected:
                                    text_out = ' '.join(collected)
                            # 2) content directo
                            if not text_out:
                                text_out = first.get('content') or first.get('output') or first.get('text')
                    # fallback: buscar cualquier cadena en top-level
                    if not text_out:
                        # intentar recorrer y concatenar campos que parezcan texto
                        def pick_text(obj):
                            if isinstance(obj, str):
                                return obj
                            if isinstance(obj, dict):
                                for k in ('content', 'output', 'text'):
                                    if k in obj and isinstance(obj[k], str):
                                        return obj[k]
                                for v in obj.values():
                                    t = pick_text(v)
                                    if t:
                                        return t
                            if isinstance(obj, list):
                                for item in obj:
                                    t = pick_text(item)
                                    if t:
                                        return t
                            return None

                        text_out = pick_text(data)

                return text_out

            accompaniment_text = generate_accompaniment(nota_texto)
        except Exception as e:
            print(f"Error generando acompañamiento con Gemini: {e}")
            traceback.print_exc()

        # Devolver los datos recién insertados (para que el frontend actualice la lista)
        # Incluimos el acompañamiento en la respuesta para que el frontend lo muestre si lo desea
        return {"message": "Nota guardada con éxito", "data": response.data, "accompaniment": accompaniment_text}
    except Exception as e:
        print(f"Error al guardar nota: {e}")
        raise HTTPException(status_code=500, detail=str(e))
def crear_visualizaciones(df_analizado):
    """Crea los gráficos usando Matplotlib y WordCloud, y los devuelve como imágenes Base64."""
    images = {}
    
    # Colores personalizados
    colors = ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7']

    # 1. Gráfico de Sentimientos
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
    images['sentiments'] = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()

    # 2. Gráfico de Emociones
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
    images['emotions'] = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    
    # 3. Nube de Palabras
    todos_los_tokens_list = sum(df_analizado['tokens'], [])
    frecuencia_tokens = Counter(todos_los_tokens_list)
    wordcloud_data = " ".join(todos_los_tokens_list)
    
    wordcloud = WordCloud(width=800, height=400, background_color='white', colormap='viridis').generate(wordcloud_data)
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




# --- Puntos de conexión (Endpoints) de la API ---
@app.post("/analyze")
async def analyze_notes(notes: List[Note]):
    """
    Recibe una lista de notas, analiza el texto y devuelve gráficos como imágenes Base64.
    """
    if not notes:
        raise HTTPException(status_code=400, detail="No se proporcionaron notas para analizar.")
        
    df = pd.DataFrame([note.dict() for note in notes])
    df_analizado = analizar_diario_completo(df)
    
    if df_analizado.empty:
        return {"message": "Análisis completado sin datos", "data": {}}
        
    analysis_images = crear_visualizaciones(df_analizado)
    
    return analysis_images

@app.get("/analyze-asistencia/{user_id}")
async def analyze_asistencia_aprendizaje(user_id: str):
    """
    Obtiene todos los aprendizajes obtenidos de la tabla ASISTENCIA para un usuario,
    los analiza y devuelve gráficos Base64 igual que el reporte de diario.
    """
    # 1. Obtener aprendizajes de la tabla ASISTENCIA
    response = supabase.table("asistencia").select("id_asistencia, aprendizaje_obtenido, fecha_atencion").eq("id_usuario", user_id).order("fecha_atencion", desc=True).execute()
    data = response.data or []

    if not data:
        return {"message": "No hay registros de asistencia para este usuario", "analysis": {}, "notes": []}

    # 2. Convertir a DataFrame y renombrar columna para reutilizar la lógica
    df = pd.DataFrame(data).rename(columns={'aprendizaje_obtenido': 'note'})

    # 3. Analizar los aprendizajes
    df_analizado = analizar_diario_completo(df)

    # 4. Crear visualizaciones
    analysis_images = crear_visualizaciones(df_analizado)

    return {
        "message": "Análisis de aprendizajes completado con éxito",
        "analysis": analysis_images,
        "notes": data
    }

@app.post("/attendance-chatbot")
async def attendance_chatbot(payload: dict):
    context = payload.get("context", {})
    question = payload.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="No se proporcionó pregunta.")

    # Construye el prompt solo con emociones y sentimientos
    prompt = "Contexto del estudiante:\n"
    if context.get("sentimientos"):
        prompt += f"Sentimientos: {context['sentimientos']}\n"
    if context.get("emociones"):
        prompt += f"Emociones: {context['emociones']}\n"
    prompt += f"\nConsulta del psicólogo: {question}\nRespuesta:"

    # Gemini
    genai.configure(api_key="AIzaSyBJ0fo-zWzwu4licYxom3bYXLtB5qoal4k")
    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    answer = response.text.strip()
    return {"answer": answer}

# 🔑 NUEVO ENDPOINT: Listar estudiantes
@app.get("/psychologist/students")
async def get_students():
    """Obtiene la lista de todos los usuarios con rol 'estudiante'."""
    try:
        response = supabase.table("usuarios").select("id, nombre, apellido, codigo_alumno").eq("rol", "estudiante").execute()
        
        # Corrección: Asegurar indentación de 4 espacios
        if not response.data:
            return {"message": "No se encontraron estudiantes", "data": []}
            
        return {"message": "Estudiantes recuperados con éxito", "data": response.data}
    except Exception as e:
        print(f"Error al listar estudiantes: {e}")
        # Corrección: Asegurar indentación de 4 espacios
        raise HTTPException(status_code=500, detail=f"Error interno al buscar estudiantes: {e}")

# ---

@app.get("/notas/{user_id}")
async def get_notas_by_user(user_id: str):
    """Obtiene todas las notas para un usuario específico desde Supabase."""
    try:
        response = supabase.table("notas").select("*").eq("usuario_id", user_id).order("created_at", desc=True).execute()
        # Corrección: Asegurar indentación de 4 espacios
        if not response or not getattr(response, 'data', None):
            return {"message": "No se encontraron notas para este usuario", "data": []}

        return {"message": "Notas recuperadas con éxito", "data": response.data}
    except Exception as e:
        print(f"Error al recuperar notas: {e}")
        traceback.print_exc()
        # Proporcionar detalle reducido en la respuesta para no exponer secretos
        raise HTTPException(status_code=500, detail="Error interno al buscar notas. Revisa logs del servidor para más detalles.")

# ---

# 🔑 RUTA DE ANÁLISIS MEJORADA: Ahora recibe el user_id y usa la ruta GET /notas/{user_id}
@app.get("/analyze/{user_id}")
async def analyze_student_notes(user_id: str):
    """
    Obtiene todas las notas de un estudiante, las analiza y devuelve gráficos Base64.
    """
    # 1. Obtener notas
    notes_response = await get_notas_by_user(user_id)
    notes_data = notes_response.get("data", [])
    
    if not notes_data:
        # Corrección: Asegurar indentación de 4 espacios
        return {"message": "Análisis completado sin datos", "analysis": {}, "notes": []}
        
    # 2. Convertir a DataFrame
    df = pd.DataFrame(notes_data)
    # Renombrar columnas para que coincidan con la lógica de análisis_diario_completo (nota -> note)
    df = df.rename(columns={'nota': 'note'}) 
    
    # 3. Analizar las notas
    df_analizado = analizar_diario_completo(df)
    
    # 4. Crear visualizaciones
    analysis_images = crear_visualizaciones(df_analizado)
    
    return {"message": "Análisis completado con éxito", "analysis": analysis_images, "notes": notes_data}

# ---

# 🔑 NUEVO ENDPOINT: Exportar reporte CSV
@app.get("/export/{user_id}")
async def export_student_report(user_id: str):
    """
    Obtiene las notas de un estudiante, las analiza y devuelve un archivo CSV.
    """
    # 1. Obtener notas
    notes_response = await get_notas_by_user(user_id)
    notes_data = notes_response.get("data", [])
    
    if not notes_data:
        # Corrección: Asegurar indentación de 4 espacios
        raise HTTPException(status_code=404, detail="No hay notas para exportar.")
        
    # 2. Convertir a DataFrame para análisis y exportación
    df = pd.DataFrame(notes_data).rename(columns={'nota': 'note', 'usuario_id': 'user_id'})
    df_analizado = analizar_diario_completo(df)
    
    # 3. Preparar CSV
    output = io.StringIO()
    df_analizado.to_csv(output, index=False, sep=';', encoding='utf-8')
    
    # 4. Devolver como StreamingResponse
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=reporte_diario_{user_id}.csv"}
    )
# =========================================================
# 🎯 ENDPOINT: Obtener TODAS las Recomendaciones
# Corresponde a la ruta: GET http://127.0.0.1:8000/recomendaciones/todas
# =========================================================
@app.get("/recomendaciones/todas")
async def obtener_todas_las_recomendaciones():
    """
    Recupera todas las entradas de la tabla 'recomendaciones' para mostrarlas.
    """
    try:
        # 1. Realizar la consulta a la tabla 'recomendaciones'
        recs_response = supabase.table("recomendaciones").select("*").execute()
        
        # 2. Verificar si hay datos
        if not recs_response.data:
            return {"message": "No se encontraron recomendaciones", "data": []}
            
        # 3. Devolver los datos de manera estructurada
        return {
            "message": "Todas las recomendaciones recuperadas con éxito",
            "data": recs_response.data
        }

    except Exception as e:
        print(f"Error al obtener todas las recomendaciones: {e}")
        # En caso de error de conexión o base de datos
        raise HTTPException(status_code=500, detail=f"Error interno al buscar todas las recomendaciones: {e}")
@app.get("/recomendaciones/{user_id}")
async def obtener_recomendaciones(user_id: str):
    """
    Genera recomendaciones personalizadas considerando emociones recientes y gustos del usuario.
    """
    try:
        # 🧠 1️⃣ Últimas emociones del usuario (por sus notas)
        notas_response = supabase.table("notas")\
            .select("emocion, sentimiento")\
            .eq("usuario_id", user_id)\
            .order("created_at", desc=True)\
            .limit(5).execute()

        notas_data = notas_response.data or []

        # 🧡 2️⃣ Emociones frecuentes en los likes
        likes_response = supabase.table("likes_recomendaciones")\
            .select("recomendaciones:recomendacion_id(emocion_objetivo, sentimiento_objetivo)")\
            .eq("user_id", user_id).execute()

        likes_data = [r["recomendaciones"] for r in likes_response.data if r.get("recomendaciones")]

        # 🧮 Combinar ambas fuentes de emoción
        emociones = [n["emocion"] for n in notas_data] + [l["emocion_objetivo"] for l in likes_data]
        sentimientos = [n["sentimiento"] for n in notas_data] + [l["sentimiento_objetivo"] for l in likes_data]

        if not emociones:
            recs = supabase.table("recomendaciones").select("*").execute()
            return {"message": "Recomendaciones generales", "data": recs.data}

        emocion_principal = pd.Series(emociones).mode()[0]
        sentimiento_principal = pd.Series(sentimientos).mode()[0]

        # 🎯 3️⃣ Buscar coincidencias
        recs_response = supabase.table("recomendaciones").select("*").execute()
        df = pd.DataFrame(recs_response.data)
        mask = (df["emocion_objetivo"] == emocion_principal) | (df["sentimiento_objetivo"] == sentimiento_principal)
        recomendadas = df[mask]

        if recomendadas.empty:
            recomendadas = df.sample(min(3, len(df)))

        return {
            "message": "Recomendaciones personalizadas con éxito",
            "data": recomendadas.to_dict(orient="records"),
            "emocion_detectada": emocion_principal,
            "sentimiento_detectado": sentimiento_principal
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando recomendaciones: {e}")

# 1️⃣ Agregar like
@app.post("/likes/{user_id}/{recomendacion_id}")
async def agregar_like(user_id: str, recomendacion_id: str):
    try:
        supabase.table("likes_recomendaciones").insert({
            "user_id": user_id,
            "recomendacion_id": recomendacion_id
        }).execute()
        return {"message": "Like agregado"}
    except Exception as e:
        # Si ya existe, ignoramos el error de duplicado
        return {"message": f"No se pudo agregar el like: {e}"}


# 2️⃣ Quitar like
@app.delete("/likes/{user_id}/{recomendacion_id}")
async def eliminar_like(user_id: str, recomendacion_id: str):
    supabase.table("likes_recomendaciones")\
        .delete()\
        .eq("user_id", user_id)\
        .eq("recomendacion_id", recomendacion_id)\
        .execute()
    return {"message": "Like eliminado"}


# 3️⃣ Obtener likes del usuario
@app.get("/likes/{user_id}")
async def obtener_likes_usuario(user_id: str):
    res = supabase.table("likes_recomendaciones")\
        .select("recomendacion_id")\
        .eq("user_id", user_id).execute()
    return [r["recomendacion_id"] for r in res.data]


# =========================================================
# 🎯 NUEVO ENDPOINT: Obtener las Recomendaciones favoritas del usuario
# Corresponde a la ruta: GET http://127.0.0.1:8000/recomendaciones/favoritos/{user_id}
# =========================================================
@app.get("/recomendaciones/favoritos/{user_id}")
async def obtener_recomendaciones_favoritas(user_id: str):
    """
    Obtiene los detalles completos de las recomendaciones que un usuario ha marcado como favoritas.
    
    Utiliza una selección con JOIN (dot notation) para traer los datos de la tabla 'recomendaciones'.
    Supone que 'likes_recomendaciones' tiene una FK 'recomendacion_id' a 'recomendaciones'.
    """
    try:
        # Consulta a Supabase:
        # 1. Selecciona la columna 'recomendaciones' (el nombre de la tabla relacionada).
        # 2. El asterisco '*' indica que traiga todos los campos de la recomendación.
        # 3. Filtra por el 'user_id'.
        response = supabase.table("likes_recomendaciones")\
            .select("recomendaciones(*)")\
            .eq("user_id", user_id)\
            .execute()

        # Los datos vienen anidados en un objeto { "recomendaciones": {...} }
        if response.data:
            # Extraer solo el objeto de la recomendación
            favoritas = [item["recomendaciones"] for item in response.data if item.get("recomendaciones")]
            return {
                "message": "Favoritos recuperados con éxito",
                "data": favoritas
            }
        
        return {"message": "No se encontraron recomendaciones favoritas", "data": []}

    except Exception as e:
        print(f"Error al obtener recomendaciones favoritas: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al buscar favoritos: {e}")
    

    # main.py
