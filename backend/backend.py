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
from fastapi import BackgroundTasks
import unicodedata
from email.message import EmailMessage
import smtplib
import ssl
from datetime import datetime
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except Exception:
    service_account = None
    build = None

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
async def guardar_nota(note_data: Note, background_tasks: BackgroundTasks):
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

        # Lanzar alerta por palabras severas en background (no bloquea la respuesta)
        try:
            background_tasks.add_task(trigger_alert_if_keywords, user_id, nota_texto)
        except Exception as e:
            print(f"No se pudo agendar tarea de alerta: {e}")

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
async def get_students(psychologist_id: str | None = None):
    """Obtiene la lista de todos los usuarios con rol 'estudiante'."""
    try:
        query = supabase.table("usuarios").select("id, nombre, apellido, codigo_alumno")\
            .eq("rol", "estudiante")

        if psychologist_id:
            query = query.eq("psicologo_id", psychologist_id)

        response = query.execute()
        
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

# =========================================================
# 🚨 NUEVO: Alerta inteligente por señales de tristeza
# - Agrega un endpoint para que el psicólogo vea alertas por estudiante.
# - Usa las emociones ya almacenadas en la tabla 'notas' (emocion, emocion_score).
# =========================================================

def _is_sad_label(label: str) -> bool:
    if not label:
        return False
    label_norm = str(label).strip().lower()
    sadness_labels = {"tristeza", "sadness", "depresion", "depressed", "depressive"}
    return label_norm in sadness_labels


def _compute_sadness_risk(notes: list[dict]) -> dict:
    """
    Calcula métricas de tristeza a partir de notas recientes.
    Retorna dict con: count, sad_count, ratio, max_sad_score, latest_sad_score, risk_level, alert(bool).
    """
    if not notes:
        return {
            "count": 0,
            "sad_count": 0,
            "ratio": 0.0,
            "max_sad_score": 0.0,
            "latest_sad_score": 0.0,
            "risk_level": "none",
            "alert": False,
        }

    count = len(notes)
    sad_scores = []
    latest = notes[0]  # asumiendo orden desc por created_at
    latest_sad_score = latest.get("emocion_score", 0.0) if _is_sad_label(latest.get("emocion")) else 0.0

    for n in notes:
        if _is_sad_label(n.get("emocion")):
            sad_scores.append(float(n.get("emocion_score", 0.0)))

    sad_count = len(sad_scores)
    ratio = sad_count / count if count else 0.0
    max_sad_score = max(sad_scores) if sad_scores else 0.0

    # Heurística de riesgo:
    # - ALTO: última nota con tristeza >= 0.9 O (ratio >= 0.6 y >= 2 notas tristes)
    # - MEDIO: ratio >= 0.4 o max_sad_score >= 0.75
    # - BAJO/NONE: resto
    if latest_sad_score >= 0.9 or (ratio >= 0.6 and sad_count >= 2):
        risk_level = "high"
    elif ratio >= 0.4 or max_sad_score >= 0.75:
        risk_level = "medium"
    elif ratio > 0:
        risk_level = "low"
    else:
        risk_level = "none"

    return {
        "count": count,
        "sad_count": sad_count,
        "ratio": round(ratio, 3),
        "max_sad_score": round(max_sad_score, 3),
        "latest_sad_score": round(latest_sad_score, 3),
        "risk_level": risk_level,
        "alert": risk_level == "high",
    }


@app.get("/psychologist/students-alerts")
async def get_students_with_alerts(limit_notes: int = 5, psychologist_id: str | None = None):
    """
    Lista estudiantes y adjunta un resumen de riesgo por tristeza con base en sus últimas notas.
    limit_notes: cuántas notas recientes considerar por estudiante.
    """
    try:
        # 1) Listar estudiantes
        q = supabase.table("usuarios").select("id, nombre, apellido, codigo_alumno").eq("rol", "estudiante")
        if psychologist_id:
            q = q.eq("psicologo_id", psychologist_id)
        users_res = q.execute()
        students = users_res.data or []

        if not students:
            return {"message": "No se encontraron estudiantes", "data": []}

        result = []
        # 2) Por simplicidad, consultar por estudiante (dataset pequeño). Optimizable con IN si es grande.
        for s in students:
            uid = s.get("id")
            notas_res = supabase.table("notas").select("emocion, emocion_score, created_at").eq("usuario_id", uid).order("created_at", desc=True).limit(limit_notes).execute()
            notes = notas_res.data or []
            risk = _compute_sadness_risk(notes)
            if risk["alert"]:
                alert_message = "ALERTA: alumno con posibles tendencias depresivas"
            elif risk["risk_level"] == "medium":
                alert_message = "Atención: señales moderadas de tristeza"
            elif risk["risk_level"] == "low":
                alert_message = "Leves señales de tristeza"
            else:
                alert_message = "Sin señales de tristeza"

            result.append({
                "id": uid,
                "nombre": s.get("nombre"),
                "apellido": s.get("apellido"),
                "codigo_alumno": s.get("codigo_alumno"),
                "risk": risk,
                "alert_message": alert_message,
            })

        return {"message": "Alertas generadas", "data": result}

    except Exception as e:
        print(f"Error al generar alertas: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Error interno al generar alertas")

# =========================================================
# ✉️ Envío de Alerta por Palabras Severas (Gmail API / SMTP)
# =========================================================

SEVERE_KEYWORDS = {
    # palabras simples
    "morir", "muerte", "muerto", "suicidio", "suicidarme", "suicidar",
    "lastimarme", "lastimar", "herirme", "herir", "quitarme la vida",
    "autolesion", "auto lesion", "autolesionarme", "cortarme",
}

SEVERE_PHRASES = {
    "no tengo ganas de vivir",
    "no quiero vivir",
    "me quiero morir",
}

def _normalize(text: str) -> str:
    if not text:
        return ""
    text = text.strip().lower()
    # quitar tildes
    text = unicodedata.normalize('NFD', text)
    text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
    return text

def contains_severe_keywords(text: str) -> bool:
    t = _normalize(text)
    # frases primero (por ejemplo "no tengo ganas de vivir")
    for ph in SEVERE_PHRASES:
        if _normalize(ph) in t:
            return True
    # palabras sueltas
    for kw in SEVERE_KEYWORDS:
        if f" { _normalize(kw) }" in f" {t} ":
            return True
    return False

def send_email_via_gmail_api(sender: str, to_email: str, subject: str, body: str) -> None:
    if not service_account or not build:
        raise RuntimeError("googleapiclient/google-auth no disponibles")

    sa_json = os.environ.get("GMAIL_SERVICE_ACCOUNT_JSON")
    delegated_user = os.environ.get("GMAIL_DELEGATED_USER") or sender
    if not sa_json:
        raise RuntimeError("Falta GMAIL_SERVICE_ACCOUNT_JSON en variables de entorno")

    # Soporta contenido JSON o ruta a archivo
    try:
        if sa_json.strip().startswith('{'):
            sa_info = json.loads(sa_json)
            creds = service_account.Credentials.from_service_account_info(sa_info, scopes=["https://www.googleapis.com/auth/gmail.send"])
        else:
            creds = service_account.Credentials.from_service_account_file(sa_json, scopes=["https://www.googleapis.com/auth/gmail.send"])
    except Exception as e:
        raise RuntimeError(f"Error cargando credenciales del service account: {e}")

    delegated = creds.with_subject(delegated_user)
    service = build('gmail', 'v1', credentials=delegated, cache_discovery=False)

    msg = EmailMessage()
    msg['From'] = sender
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body)

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    service.users().messages().send(userId='me', body={'raw': raw}).execute()

def send_email_via_smtp(sender: str, password: str, to_email: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg['From'] = sender
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.set_content(body)

    context = ssl.create_default_context()
    # Intento 1: SSL en 465
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
            server.login(sender, password)
            server.send_message(msg)
            return
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP SSL 465 auth error: {e}")
        # Intento 2: STARTTLS en 587
        try:
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(sender, password)
                server.send_message(msg)
                return
        except Exception as e2:
            raise e2
    except Exception as e:
        # Si falla por otra razón, re lanza para manejo superior
        raise e

def send_alert_email(to_email: str, subject: str, body: str) -> None:
    """
    Enviar SIEMPRE por SMTP con usuario y contraseña (Gmail). No usa Gmail API.
    Requiere variables de entorno:
      - GMAIL_SENDER
      - GMAIL_SMTP_PASSWORD (o GMAIL_APP_PASSWORD)
    """
    sender = "unayoesupabase@gmail.com"
    if not sender:
        raise RuntimeError('Falta GMAIL_SENDER en variables de entorno')

    smtp_pass = "mqerkifvvylbdoye"
    if not smtp_pass:
        raise RuntimeError('Falta GMAIL_SMTP_PASSWORD o GMAIL_APP_PASSWORD en variables de entorno para SMTP')
    send_email_via_smtp(sender, smtp_pass, to_email, subject, body)

def build_alert_email(student: dict, note_text: str) -> tuple[str, str]:
    now = datetime.utcnow().isoformat() + 'Z'
    student_name = f"{student.get('nombre','')} {student.get('apellido','')}".strip()
    subject = f"ALERTA URGENTE: Posibles ideaciones suicidas - Estudiante {student_name or student.get('id','')}"
    body = (
        "Este es un aviso automatizado del sistema UNAYOE.\n\n"
        f"Fecha (UTC): {now}\n"
        f"Estudiante: {student_name} (ID: {student.get('id')})\n\n"
        "Se detectaron palabras o frases sensibles que podrían indicar riesgo de daño a sí mismo.\n"
        "Nota reciente del estudiante:\n"
        f"""-----------------------------\n{note_text}\n-----------------------------\n\n"""
        "Acciones sugeridas (no exhaustivas):\n"
        "- Intentar contactar al estudiante de inmediato.\n"
        "- Seguir el protocolo de intervención en crisis de la institución.\n"
        "- Documentar acciones realizadas.\n\n"
        "Este mensaje se genera automáticamente; por favor, confirme con una evaluación clínica."
    )
    return subject, body

def trigger_alert_if_keywords(user_id: str, note_text: str) -> None:
    try:
        if not contains_severe_keywords(note_text):
            return

        # 1) Buscar estudiante para obtener psicologo_id
        u_res = supabase.table('usuarios').select('id, nombre, apellido, psicologo_id').eq('id', user_id).single().execute()
        student = u_res.data or {}
        psicologo_id = (student or {}).get('psicologo_id')

        # 2) Obtener correo del psicólogo
        to_email = None
        if psicologo_id:
            p_res = supabase.table('usuarios').select('correo_institucional, nombre, apellido').eq('id', psicologo_id).single().execute()
            if p_res and getattr(p_res, 'data', None):
                to_email = p_res.data.get('correo_institucional')

        # Fallback a correo de alerta general
        if not to_email:
            to_email = os.environ.get('ALERT_FALLBACK_EMAIL')

        if not to_email:
            print('No hay correo de psicólogo ni ALERT_FALLBACK_EMAIL configurado. Se omite envío.')
            return

        subject, body = build_alert_email(student, note_text)
        send_alert_email(to_email, subject, body)
        print(f"Alerta enviada a {to_email} por palabras severas.")
    except Exception as e:
        print(f"Error al procesar/enviar alerta: {e}")
