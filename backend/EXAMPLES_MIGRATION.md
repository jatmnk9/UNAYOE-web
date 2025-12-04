# Ejemplos de Migración - Código Antes y Después

## Ejemplo 1: Guardar Nota con Análisis

### ❌ ANTES (backend.py):
```python
@app.post("/notas")
async def guardar_nota(note_data: Note, background_tasks: BackgroundTasks):
    user_id = note_data.user_id
    nota_texto = note_data.note
    
    texto_procesado, tokens = preprocesar_texto(nota_texto)
    sentimiento = sentiment_classifier(nota_texto)[0]['label']
    emocion_analisis = emotion_classifier(nota_texto)[0]
    emocion = emocion_analisis['label']
    emocion_score = emocion_analisis['score']
    
    response = supabase.table("notas").insert([{
        "usuario_id": user_id,
        "nota": nota_texto,
        "sentimiento": sentimiento,
        "emocion": emocion,
        "emocion_score": emocion_score,
        "tokens": tokens
    }]).execute()
    
    # Gemini hardcoded
    api_key = "AIzaSyBx_X4hSpLg5yzXZujgrShUIv6P1OSFLME"
    # ... código de Gemini ...
    
    # Alerta hardcoded
    background_tasks.add_task(trigger_alert_if_keywords, user_id, nota_texto)
    
    return {"message": "Nota guardada con éxito", "data": response.data}
```

### ✅ DESPUÉS (con servicios):
```python
from app.db.supabase_client import supabase
from app.models.schemas import Note
from app.services.text_analysis_service import TextAnalysisService
from app.services.gemini_service import GeminiService
from app.services.alert_service import AlertService
from app.services.email_service import EmailService
from fastapi import BackgroundTasks

@app.post("/notas")
async def guardar_nota(note_data: Note, background_tasks: BackgroundTasks):
    user_id = note_data.user_id
    nota_texto = note_data.note
    
    # Usar servicio de análisis
    analysis = TextAnalysisService.analyze_single_note(nota_texto)
    
    response = supabase.table("notas").insert([{
        "usuario_id": user_id,
        "nota": nota_texto,
        "sentimiento": analysis['sentimiento'],
        "emocion": analysis['emocion'],
        "emocion_score": analysis['emocion_score'],
        "tokens": analysis['tokens']
    }]).execute()
    
    # Usar servicio de Gemini
    accompaniment_text = GeminiService.generate_accompaniment(nota_texto)
    
    # Usar servicio de alertas
    if AlertService.contains_severe_keywords(nota_texto):
        background_tasks.add_task(trigger_alert_task, user_id, nota_texto)
    
    return {
        "message": "Nota guardada con éxito",
        "data": response.data,
        "accompaniment": accompaniment_text
    }

def trigger_alert_task(user_id: str, note_text: str):
    """Background task para enviar alerta"""
    # Implementar usando AlertService y EmailService
    pass
```

## Ejemplo 2: Análisis de Diario

### ❌ ANTES:
```python
@app.get("/analyze/{user_id}")
async def analyze_student_notes(user_id: str):
    notes_response = await get_notas_by_user(user_id)
    notes_data = notes_response.get("data", [])
    
    df = pd.DataFrame(notes_data).rename(columns={'nota': 'note'})
    df_analizado = analizar_diario_completo(df)
    analysis_images = crear_visualizaciones(df_analizado)
    
    return {"message": "Análisis completado", "analysis": analysis_images, "notes": notes_data}
```

### ✅ DESPUÉS:
```python
from app.services.text_analysis_service import TextAnalysisService
from app.services.visualization_service import VisualizationService
import pandas as pd

@app.get("/analyze/{user_id}")
async def analyze_student_notes(user_id: str):
    notes_response = await get_notas_by_user(user_id)
    notes_data = notes_response.get("data", [])
    
    if not notes_data:
        return {"message": "Análisis completado sin datos", "analysis": {}, "notes": []}
    
    df = pd.DataFrame(notes_data).rename(columns={'nota': 'note'})
    
    # Usar servicio de análisis
    df_analizado = TextAnalysisService.analyze_diary_complete(df)
    
    # Usar servicio de visualización
    analysis_images = VisualizationService.create_visualizations(df_analizado)
    
    return {
        "message": "Análisis completado con éxito",
        "analysis": analysis_images,
        "notes": notes_data
    }
```

## Ejemplo 3: Login

### ❌ ANTES:
```python
@app.post("/login")
async def login_user(credentials: LoginRequest):
    auth_response = supabase.auth.sign_in_with_password({
        "email": credentials.email,
        "password": credentials.password
    })
    # ... resto del código ...
```

### ✅ DESPUÉS:
```python
from app.db.supabase_client import supabase
from app.models.schemas import LoginRequest
from fastapi.responses import JSONResponse

@app.post("/login")
async def login_user(credentials: LoginRequest):
    # Supabase ya está importado desde el cliente centralizado
    auth_response = supabase.auth.sign_in_with_password({
        "email": credentials.email,
        "password": credentials.password
    })
    # ... resto del código igual, pero más organizado ...
```

## Ejemplo 4: Envío de Alertas

### ❌ ANTES:
```python
def send_alert_email(to_email: str, subject: str, body: str):
    sender = "unayoesupabase@gmail.com"
    smtp_pass = "mqerkifvvylbdoye"
    send_email_via_smtp(sender, smtp_pass, to_email, subject, body)

def trigger_alert_if_keywords(user_id: str, note_text: str):
    if not contains_severe_keywords(note_text):
        return
    # ... código de envío ...
    send_alert_email(to_email, subject, body)
```

### ✅ DESPUÉS:
```python
from app.services.alert_service import AlertService
from app.services.email_service import EmailService
from app.db.supabase_client import supabase
from app.config.settings import settings

def trigger_alert_if_keywords(user_id: str, note_text: str):
    if not AlertService.contains_severe_keywords(note_text):
        return
    
    # Obtener estudiante y psicólogo
    u_res = supabase.table('usuarios').select('*').eq('id', user_id).single().execute()
    student = u_res.data
    psicologo_id = student.get('psicologo_id')
    
    # Obtener correo del psicólogo
    to_email = None
    if psicologo_id:
        p_res = supabase.table('usuarios').select('correo_institucional').eq('id', psicologo_id).single().execute()
        to_email = p_res.data.get('correo_institucional') if p_res.data else None
    
    if not to_email:
        to_email = settings.ALERT_FALLBACK_EMAIL
    
    if not to_email:
        print('No email configured for alert')
        return
    
    # Construir y enviar email
    subject, body = EmailService.build_alert_email(student, note_text)
    EmailService.send_alert_email(to_email, subject, body)
```

## Ventajas de la Nueva Arquitectura

1. **Sin Credenciales Hardcodeadas**: Todo viene de variables de entorno
2. **Código Reutilizable**: Servicios pueden usarse en múltiples endpoints
3. **Más Testeable**: Cada servicio puede probarse independientemente
4. **Mejor Organización**: Código separado por responsabilidades
5. **Más Mantenible**: Cambios en un servicio no afectan otros

