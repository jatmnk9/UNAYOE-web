import sys
import pandas as pd
import re
import io
import base64
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from transformers import pipeline
import nltk
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
from fastapi.responses import JSONResponse
from pydantic import BaseModel
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
# 🔑 NUEVA RUTA: GET para obtener las notas del estudiante (soluciona el 404)
@app.get("/notas/{user_id}")
async def get_notas_by_user(user_id: str):
    """Obtiene todas las notas para un usuario específico desde Supabase."""
    try:
        response = supabase.table("notas").select("*").eq("usuario_id", user_id).order("created_at", desc=True).execute()
        
        # Supabase devuelve datos en 'response.data'
        if not response.data:
             return {"message": "No se encontraron notas para este usuario", "data": []}
             
        # La tabla 'notas' en el frontend espera las propiedades 'id', 'nota', 'sentimiento', 'emocion', 'emocion_score', 'created_at'.
        return {"message": "Notas recuperadas con éxito", "data": response.data}

    except Exception as e:
        print(f"Error al recuperar notas: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al buscar notas: {e}")


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
        
        # Devolver los datos recién insertados (para que el frontend actualice la lista)
        return {"message": "Nota guardada con éxito", "data": response.data}
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
        if not response.data:
            return {"message": "No se encontraron notas para este usuario", "data": []}
            
        return {"message": "Notas recuperadas con éxito", "data": response.data}
    except Exception as e:
        print(f"Error al recuperar notas: {e}")
        # Corrección: Asegurar indentación de 4 espacios
        raise HTTPException(status_code=500, detail=f"Error interno al buscar notas: {e}")

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