"""
Esquemas Pydantic para validación de datos.
Define todos los modelos de entrada y salida de la API.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Dict, Any, Optional
from datetime import datetime


# =========================================================
# ESQUEMAS DE USUARIOS
# =========================================================

class EstudianteCreate(BaseModel):
    """Esquema para crear un estudiante."""
    nombre: str = Field(..., min_length=1, description="Nombre del estudiante")
    apellido: str = Field(..., min_length=1, description="Apellido del estudiante")
    codigo_alumno: str = Field(..., description="Código de alumno")
    dni: str = Field(..., description="DNI del estudiante")
    edad: int = Field(..., gt=0, description="Edad del estudiante")
    genero: str = Field(..., description="Género del estudiante")
    celular: str = Field(..., description="Número de celular")
    facultad: str = Field(..., description="Facultad")
    escuela: str = Field(..., description="Escuela profesional")
    direccion: str = Field(..., description="Dirección")
    ciclo: str = Field(..., description="Ciclo académico")
    tipo_paciente: str = Field(..., description="Tipo de paciente")
    correo_institucional: EmailStr = Field(..., description="Correo institucional")
    universidad: str = Field(..., description="Universidad")
    psicologo_id: Optional[str] = Field(None, description="ID del psicólogo asignado")


class PsicologoCreate(BaseModel):
    """Esquema para crear un psicólogo."""
    nombre: str = Field(..., min_length=1, description="Nombre del psicólogo")
    apellido: str = Field(..., min_length=1, description="Apellido del psicólogo")
    dni: str = Field(..., description="DNI del psicólogo")
    edad: int = Field(..., gt=0, description="Edad del psicólogo")
    genero: str = Field(..., description="Género del psicólogo")
    celular: str = Field(..., description="Número de celular")
    especialidad: str = Field(..., description="Especialidad del psicólogo")
    correo_institucional: EmailStr = Field(..., description="Correo institucional")


# =========================================================
# ESQUEMAS DE AUTENTICACIÓN
# =========================================================

class LoginRequest(BaseModel):
    """Esquema para solicitud de inicio de sesión."""
    email: EmailStr = Field(..., description="Correo electrónico")
    password: str = Field(..., min_length=1, description="Contraseña")


class UserResponse(BaseModel):
    """Esquema de respuesta de usuario autenticado."""
    id: str
    email: str
    rol: str
    nombre: str
    access_token: str
    refresh_token: str


# =========================================================
# ESQUEMAS DE NOTAS
# =========================================================

class Note(BaseModel):
    """Esquema para crear una nota del diario."""
    note: str = Field(..., min_length=1, description="Contenido de la nota")
    user_id: str = Field(..., description="ID del usuario que crea la nota")


class NoteResponse(BaseModel):
    """Esquema de respuesta de una nota analizada."""
    id: str
    usuario_id: str
    nota: str
    sentimiento: str
    emocion: str
    emocion_score: float
    tokens: List[str]
    created_at: datetime


# =========================================================
# ESQUEMAS DE ANÁLISIS
# =========================================================

class AnalysisResponse(BaseModel):
    """Esquema de respuesta del análisis de notas."""
    message: str
    analysis: Dict[str, str]
    notes: List[Dict[str, Any]]


# =========================================================
# ESQUEMAS DE RECOMENDACIONES
# =========================================================

class RecommendationResponse(BaseModel):
    """Esquema de respuesta de recomendaciones."""
    message: str
    data: List[Dict[str, Any]]
    emocion_detectada: Optional[str] = None
    sentimiento_detectado: Optional[str] = None


# =========================================================
# ESQUEMAS DE CITAS
# =========================================================

class CitaCreate(BaseModel):
    """Esquema para crear una cita."""
    titulo: str = Field(..., min_length=1, description="Título de la cita")
    fecha_cita: datetime = Field(..., description="Fecha y hora de la cita")


class CitaUpdate(BaseModel):
    """Esquema para actualizar una cita."""
    titulo: Optional[str] = Field(None, min_length=1, description="Título de la cita")
    fecha_cita: Optional[datetime] = Field(None, description="Fecha y hora de la cita")


class CitaAsignarPsicologo(BaseModel):
    """Esquema para asignar un psicólogo a una cita."""
    id_psicologo: str = Field(..., description="ID del psicólogo a asignar")


class CitaResponse(BaseModel):
    """Esquema de respuesta de una cita."""
    id_cita: int
    titulo: str
    fecha_creacion: datetime
    fecha_cita: datetime
    id_usuario: str
    id_psicologo: Optional[str] = None
    nombre_usuario: Optional[str] = None
    apellido_usuario: Optional[str] = None
    correo_usuario: Optional[str] = None
    nombre_psicologo: Optional[str] = None
    apellido_psicologo: Optional[str] = None
    especialidad_psicologo: Optional[str] = None


# =========================================================
# ESQUEMAS DE ASISTENCIA
# =========================================================

class AsistenciaRequest(BaseModel):
    """Esquema para registrar asistencia."""
    id_usuario: str = Field(..., description="ID del usuario")
    fecha_atencion: str = Field(..., description="Fecha de atención")
    nro_sesion: int = Field(..., gt=0, description="Número de sesión")
    modalidad_atencion: str = Field(..., description="Modalidad de atención")
    motivo_atencion: str = Field(..., description="Motivo de atención")
    detalle_problema_actual: str = Field(..., description="Detalle del problema actual")
    acude_profesional_particular: bool = Field(..., description="¿Acude a profesional particular?")
    diagnostico_particular: Optional[str] = Field(None, description="Diagnóstico particular")
    tipo_tratamiento_actual: str = Field(..., description="Tipo de tratamiento actual")
    comodidad_unayoe: bool = Field(..., description="Comodidad con UNAYOE")
    aprendizaje_obtenido: str = Field(..., description="Aprendizaje obtenido")


# =========================================================
# ESQUEMAS GENÉRICOS
# =========================================================

class MessageResponse(BaseModel):
    """Esquema de respuesta genérica con mensaje."""
    message: str
    data: Optional[Any] = None


class HealthResponse(BaseModel):
    """Esquema de respuesta del health check."""
    status: str
    version: str
    timestamp: datetime
