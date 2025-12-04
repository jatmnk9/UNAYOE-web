import sys
import pandas as pd
import io
import base64
import os
import requests
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import BackgroundTasks
import traceback
from datetime import datetime
import numpy as np
import cv2
import sys
import os

# Obtiene la ruta absoluta de la carpeta donde está backend.py
current_dir = os.path.dirname(os.path.abspath(__file__))

# Agrega esa carpeta al "sys.path" para que Python pueda encontrar la carpeta 'app'
sys.path.append(current_dir)

# --- A partir de aquí van tus imports normales ---
from app.config.settings import settings


# Base de datos
from app.db.supabase_client import supabase

# Modelos Pydantic
from app.models.schemas import (
    Estudiante, Psicologo, AsistenciaRequest, Note, 
    LoginRequest, FaceRegisterRequest, FaceVerifyRequest
)

# Servicios
from app.services.text_analysis_service import TextAnalysisService
from app.services.alert_service import AlertService
from app.services.email_service import EmailService
from app.services.gemini_service import GeminiService
from app.services.face_recognition_service import FaceRecognitionService
from app.services.visualization_service import VisualizationService
from app.services.drawing_analysis_service import DrawingAnalysisService

# Recomendaciones
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# Los modelos Pydantic ahora están en app/models/schemas.py
# Importados arriba desde app.models.schemas

# Inicializa la aplicación FastAPI
app = FastAPI(title="API de Análisis de Bienestar")

# Configura CORS para permitir que el frontend se conecte
# Usando configuración desde settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=".*",  # ✅ Permite cualquier origen local
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Lógica de Procesamiento del Código Python ---
# Los servicios de análisis de texto ya manejan la inicialización de NLTK y modelos
# TextAnalysisService se inicializa automáticamente cuando se importa

    
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

# La función analizar_diario_completo ahora está en TextAnalysisService
# Usar: TextAnalysisService.analyze_diary_complete(diario_df)
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
        # Nueva lógica de flujo facial:
        # - has_face_registered: True si ya existe encoding (entonces se debe verificar rostro antes de acceder)
        # - Si False: el frontend redirige a /face-register para capturar por primera vez.
        # Mantiene requires_face_verification para compatibilidad (mismo valor que has_face_registered).
        # Nuevo criterio: se considera registro facial si existe foto_perfil_url
        face_registered = bool(user_profile.get("foto_perfil_url"))
        print(f"[LOGIN] user_id={user_id} foto_perfil_url={user_profile.get('foto_perfil_url')} face_registered={face_registered}")
        return JSONResponse({
            "message": "Inicio de sesión exitoso",
            "user": {
                "id": user_id,
                "email": credentials.email,
                "rol": user_profile["rol"],
                "nombre": user_profile.get("nombre", ""),
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token,
                "foto_perfil_url": user_profile.get("foto_perfil_url"),
                "has_face_registered": face_registered,
                "requires_face_verification": face_registered,
            }
        })

    except Exception as e:
        print(f"[LOGIN][ERROR] {e}")
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
        
        # Usar servicio de análisis de texto
        analysis = TextAnalysisService.analyze_single_note(nota_texto)
        
        # Insertar en la tabla notas
        response = supabase.table("notas").insert([{
            "usuario_id": user_id,
            "nota": nota_texto,
            "sentimiento": analysis['sentimiento'],
            "emocion": analysis['emocion'],
            "emocion_score": analysis['emocion_score'],
            "tokens": analysis['tokens']
        }]).execute()
        
        # GENERATIVE AI: usar servicio de Gemini
        accompaniment_text = None
        try:
            accompaniment_text = GeminiService.generate_accompaniment(nota_texto)
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
# La función crear_visualizaciones ahora está en VisualizationService
# Usar: VisualizationService.create_visualizations(df_analizado)




# --- Puntos de conexión (Endpoints) de la API ---
@app.post("/analyze")
async def analyze_notes(notes: List[Note]):
    """
    Recibe una lista de notas, analiza el texto y devuelve gráficos como imágenes Base64.
    """
    if not notes:
        raise HTTPException(status_code=400, detail="No se proporcionaron notas para analizar.")
        
    df = pd.DataFrame([note.dict() for note in notes])
    df_analizado = TextAnalysisService.analyze_diary_complete(df)
    
    if df_analizado.empty:
        return {"message": "Análisis completado sin datos", "data": {}}
        
    analysis_images = VisualizationService.create_visualizations(df_analizado)
    
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

    # 3. Analizar los aprendizajes usando servicio
    df_analizado = TextAnalysisService.analyze_diary_complete(df)

    # 4. Crear visualizaciones usando servicio
    analysis_images = VisualizationService.create_visualizations(df_analizado)

    return {
        "message": "Análisis de aprendizajes completado con éxito",
        "analysis": analysis_images,
        "notes": data
    }

@app.post("/attendance-insight")
async def generate_attendance_insight(payload: dict):
    texts = payload.get("texts", [])
    if not texts:
        raise HTTPException(status_code=400, detail="No se proporcionaron aprendizajes.")

    try:
        # Usar servicio de Gemini
        summary = GeminiService.generate_insight(texts)
        return {"summary": summary}
    except Exception as e:
        print(f"Error en Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando insight: {e}")

@app.post("/attendance-chatbot")
async def attendance_chatbot(payload: dict):
    context = payload.get("context", {})
    question = payload.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="No se proporcionó pregunta.")

    # Usar servicio de Gemini
    try:
        answer = GeminiService.generate_chatbot_response(context, question)
        return {"answer": answer}
    except Exception as e:
        print(f"Error en Gemini chatbot: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando respuesta: {e}")

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
    # Renombrar columnas para que coincidan con la lógica (nota -> note)
    df = df.rename(columns={'nota': 'note'}) 
    
    # 3. Analizar las notas usando servicio
    df_analizado = TextAnalysisService.analyze_diary_complete(df)
    
    # 4. Crear visualizaciones usando servicio
    analysis_images = VisualizationService.create_visualizations(df_analizado)
    
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
    df_analizado = TextAnalysisService.analyze_diary_complete(df)
    
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
    
@app.post("/chatbot")
async def chatbot_endpoint(payload: dict):
    """
    Recibe mensajes del frontend, los envía a n8n y devuelve la respuesta.
    """
    try:
        texto = payload.get("texto", "")
        user_id = payload.get("user_id")
        
        if not texto:
            raise HTTPException(status_code=400, detail="No se proporcionó texto")
        
        # 🔑 OBTENER CONTEXTO DEL USUARIO
        context = {}

        if user_id:
            try:
                # Obtener últimas notas del usuario
                notas_response = supabase.table("notas")\
                    .select("emocion, sentimiento, nota")\
                    .eq("usuario_id", user_id)\
                    .order("created_at", desc=True)\
                    .limit(5).execute()
                
                notas = notas_response.data or []
                
                if notas:
                    emociones = [n.get("emocion") for n in notas]
                    sentimientos = [n.get("sentimiento") for n in notas]
                    context["emociones"] = emociones
                    context["sentimientos"] = sentimientos
                    context["ultima_nota"] = notas[0].get("nota", "")
                
                # Obtener datos del usuario
                usuario_response = supabase.table("usuarios")\
                    .select("nombre, facultad, escuela")\
                    .eq("id", user_id)\
                    .single().execute()
                
                if usuario_response.data:
                    context["nombre"] = usuario_response.data.get("nombre")
                    context["facultad"] = usuario_response.data.get("facultad")
                    context["escuela"] = usuario_response.data.get("escuela")
                    
            except Exception as e:
                print(f"Error obteniendo contexto: {e}")

        # Llamar a n8n webhook
        response = requests.post(
            "http://localhost:5678/webhook/chatbot",
            json={
                "texto": texto,
                "user_id": user_id,
                "context": context
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()
        
        return data
    except Exception as e:
        print(f"Error en chatbot: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    # main.py

# =========================================================
# 🚨 NUEVO: Alerta inteligente por señales de tristeza
# - Agrega un endpoint para que el psicólogo vea alertas por estudiante.
# - Usa las emociones ya almacenadas en la tabla 'notas' (emocion, emocion_score).
# =========================================================

# Las funciones _is_sad_label y _compute_sadness_risk ahora están en AlertService
# Usar: AlertService.is_sad_label() y AlertService.compute_sadness_risk()


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
            risk = AlertService.compute_sadness_risk(notes)
            alert_message = AlertService.get_alert_message(risk)

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
# ✉️ Envío de Alerta por Palabras Severas
# =========================================================
# Las funciones de alertas y email ahora están en los servicios:
# - AlertService.contains_severe_keywords()
# - EmailService.send_alert_email()
# - EmailService.build_alert_email()

def trigger_alert_if_keywords(user_id: str, note_text: str) -> None:
    """Trigger alert if keywords are detected - using services"""
    try:
        if not AlertService.contains_severe_keywords(note_text):
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
            to_email = settings.ALERT_FALLBACK_EMAIL

        if not to_email:
            print('No hay correo de psicólogo ni ALERT_FALLBACK_EMAIL configurado. Se omite envío.')
            return

        # Usar servicios para construir y enviar email
        subject, body = EmailService.build_alert_email(student, note_text)
        EmailService.send_alert_email(to_email, subject, body)
        print(f"Alerta enviada a {to_email} por palabras severas.")
    except Exception as e:
        print(f"Error al procesar/enviar alerta: {e}")

# =========================================================
# 📸 Registro de rostro (Face ID)
# Requiere columnas añadidas en Supabase:
#   ALTER TABLE public.usuarios ADD COLUMN foto_perfil_url text;
#   ALTER TABLE public.usuarios ADD COLUMN face_encoding jsonb;
#   ALTER TABLE public.usuarios ADD COLUMN face_registered_at timestamptz;
# Si no puedes cambiar ahora la tabla, al menos 'face_encoding' y 'foto_perfil_url'.
# =========================================================

# Las funciones de reconocimiento facial ahora están en FaceRecognitionService
# Usar: FaceRecognitionService.decode_base64_image()
#       FaceRecognitionService.extract_face_encoding()
#       FaceRecognitionService.compare_face()

@app.post("/face/register")
async def face_register(payload: FaceRegisterRequest):
    """Registra la foto y encoding del rostro del usuario (post-onboarding)."""
    try:
        # Verificar existencia usuario
        u_res = supabase.table("usuarios").select("id").eq("id", payload.user_id).single().execute()
        if not u_res.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        img = FaceRecognitionService.decode_base64_image(payload.image_base64)
        encoding = FaceRecognitionService.extract_face_encoding(img)

        # Guardar imagen en Storage (si está configurado) - fallback local NO recomendado en producción
        foto_url = None
        try:
            # Supabase Storage bucket 'profile_photos' debe existir
            filename = f"faces/{payload.user_id}.jpg"  # carpeta lógica para organización
            img_bytes = FaceRecognitionService.encode_image_to_base64(img)
            # 🟢 ESTO ESTÁ BIEN (el cambio: pon comillas al true)
            upload_res = supabase.storage.from_("profile_photos").upload(
                filename,
                img_bytes,
                {"content-type": "image/jpeg", "upsert": "true"} 
            )
            if getattr(upload_res, 'error', None):
                raise HTTPException(status_code=500, detail=f"Fallo al subir imagen: {upload_res.error}")
            foto_url = supabase.storage.from_("profile_photos").get_public_url(filename)
            if not foto_url:
                raise HTTPException(status_code=500, detail="No se obtuvo URL pública de la foto")
        except HTTPException:
            raise
        except Exception as e:
            print(f"[FACE_REGISTER][STORAGE_ERROR] {e}")
            raise HTTPException(status_code=500, detail="Error al subir imagen a Storage")

        update_fields = {
            "face_encoding": encoding,
            "face_registered_at": datetime.utcnow().isoformat(),
        }
        if foto_url:
            update_fields["foto_perfil_url"] = foto_url

        supabase.table("usuarios").update(update_fields).eq("id", payload.user_id).execute()

        return {"message": "Rostro registrado con éxito", "foto_perfil_url": foto_url, "encoding_len": len(encoding)}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en registro de rostro: {e}")
        raise HTTPException(status_code=500, detail="Error interno al registrar el rostro")

@app.post("/face/verify")
async def face_verify(payload: FaceVerifyRequest):
    """Verifica si el frame enviado coincide con el rostro almacenado."""
    try:
        u_res = supabase.table("usuarios").select("face_encoding").eq("id", payload.user_id).single().execute()
        data = u_res.data
        if not data or not data.get("face_encoding"):
            raise HTTPException(status_code=404, detail="Usuario sin rostro registrado")
        stored_enc = data.get("face_encoding")
        img = FaceRecognitionService.decode_base64_image(payload.frame_base64)
        verified = FaceRecognitionService.compare_face(stored_enc, img)
        return {"verified": verified}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error en verificación de rostro: {e}")
        raise HTTPException(status_code=500, detail="Error interno en verificación de rostro")

# =========================================================
# 🎨 Endpoints para Dibujos (Gallery)
# =========================================================

@app.post("/drawings/upload")
async def upload_drawing(payload: dict):
    """
    Sube un dibujo del estudiante a Supabase Storage y guarda el registro en la tabla.
    Payload: {
        "user_id": "uuid",
        "titulo": "string (opcional)",
        "descripcion": "string (opcional)",
        "image_base64": "string",
        "drawing_data": {} (opcional, para canvas drawings),
        "tipo_dibujo": "uploaded" | "canvas"
    }
    """
    try:
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="user_id es requerido")
        
        # Verificar que el usuario existe
        u_res = supabase.table("usuarios").select("id").eq("id", user_id).single().execute()
        if not u_res.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        image_base64 = payload.get("image_base64")
        if not image_base64:
            raise HTTPException(status_code=400, detail="image_base64 es requerido")
        
        # Decodificar imagen
        img = DrawingAnalysisService.decode_base64_image(image_base64)
        if img is None:
            raise HTTPException(status_code=400, detail="No se pudo decodificar la imagen")
        
        # Convertir a bytes para subir
        import base64
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
        image_bytes = base64.b64decode(image_base64)
        
        # Generar nombre de archivo único
        import uuid
        drawing_id = str(uuid.uuid4())
        file_extension = "png" if payload.get("tipo_dibujo") == "canvas" else "jpg"
        filename = f"{user_id}/{drawing_id}.{file_extension}"
        
        # Subir a Supabase Storage
        upload_res = supabase.storage.from_("student_drawings").upload(
            filename,
            image_bytes,
            {"content-type": f"image/{file_extension}", "upsert": "false"}
        )
        
        if getattr(upload_res, 'error', None):
            raise HTTPException(status_code=500, detail=f"Error al subir imagen: {upload_res.error}")
        
        # Obtener URL pública
        imagen_url = supabase.storage.from_("student_drawings").get_public_url(filename)
        if not imagen_url:
            raise HTTPException(status_code=500, detail="No se obtuvo URL pública de la imagen")
        
        # Guardar registro en la tabla
        drawing_record = {
            "usuario_id": user_id,
            "titulo": payload.get("titulo", ""),
            "descripcion": payload.get("descripcion", ""),
            "imagen_url": imagen_url,
            "drawing_data": payload.get("drawing_data"),
            "tipo_dibujo": payload.get("tipo_dibujo", "uploaded")
        }
        
        insert_res = supabase.table("drawings").insert(drawing_record).execute()
        
        return {
            "message": "Dibujo subido con éxito",
            "data": insert_res.data[0] if insert_res.data else drawing_record
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al subir dibujo: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al subir dibujo: {e}")

@app.get("/drawings/student/{user_id}")
async def get_student_drawings(user_id: str):
    """Obtiene todos los dibujos de un estudiante."""
    try:
        response = supabase.table("drawings")\
            .select("*")\
            .eq("usuario_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        
        return {
            "message": "Dibujos recuperados con éxito",
            "data": response.data or []
        }
    except Exception as e:
        print(f"Error al recuperar dibujos: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al buscar dibujos: {e}")

@app.get("/drawings/psychologist/{psychologist_id}")
async def get_psychologist_students_drawings(psychologist_id: str):
    """
    Obtiene todos los dibujos de los estudiantes asignados a un psicólogo.
    Incluye información del estudiante.
    """
    try:
        # Primero obtener los estudiantes del psicólogo
        students_res = supabase.table("usuarios")\
            .select("id, nombre, apellido, codigo_alumno")\
            .eq("rol", "estudiante")\
            .eq("psicologo_id", psychologist_id)\
            .execute()
        
        student_ids = [s["id"] for s in (students_res.data or [])]
        
        if not student_ids:
            return {
                "message": "No se encontraron estudiantes asignados",
                "data": []
            }
        
        # Obtener dibujos de esos estudiantes
        drawings_res = supabase.table("drawings")\
            .select("*, usuarios:usuario_id(id, nombre, apellido, codigo_alumno)")\
            .in_("usuario_id", student_ids)\
            .order("created_at", desc=True)\
            .execute()
        
        return {
            "message": "Dibujos recuperados con éxito",
            "data": drawings_res.data or []
        }
    except Exception as e:
        print(f"Error al recuperar dibujos del psicólogo: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al buscar dibujos: {e}")

@app.post("/drawings/analyze/{drawing_id}")
async def analyze_drawing(drawing_id: str):
    """
    Analiza un dibujo existente y devuelve métricas, visualizaciones e insights de IA.
    Descarga la imagen desde Supabase Storage, la analiza y devuelve los resultados.
    """
    try:
        # Obtener el registro del dibujo
        drawing_res = supabase.table("drawings")\
            .select("id, imagen_url, usuario_id")\
            .eq("id", drawing_id)\
            .single()\
            .execute()
        
        if not drawing_res.data:
            raise HTTPException(status_code=404, detail="Dibujo no encontrado")
        
        drawing = drawing_res.data
        imagen_url = drawing.get("imagen_url")
        
        if not imagen_url:
            raise HTTPException(status_code=400, detail="El dibujo no tiene URL de imagen")
        
        # Descargar la imagen desde la URL
        import requests
        img_response = requests.get(imagen_url, timeout=10)
        img_response.raise_for_status()
        
        # Convertir a base64 para el servicio de análisis
        import base64
        image_base64 = base64.b64encode(img_response.content).decode('utf-8')
        
        # Analizar el dibujo
        analysis_result = DrawingAnalysisService.analyze_drawing(image_base64)
        
        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        return {
            "message": "Análisis completado con éxito",
            "drawing_id": drawing_id,
            "analysis": analysis_result
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error al analizar dibujo: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno al analizar dibujo: {e}")

