"""
Pydantic models for API request and response schemas
"""
from pydantic import BaseModel
from typing import Optional


class Estudiante(BaseModel):
    """Student model"""
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
    psicologo_id: Optional[str] = None
    id: str


class Psicologo(BaseModel):
    """Psychologist model"""
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
    """Attendance registration request"""
    id_usuario: str
    fecha_atencion: str
    nro_sesion: int
    modalidad_atencion: str
    motivo_atencion: str
    detalle_problema_actual: str
    acude_profesional_particular: bool
    diagnostico_particular: Optional[str] = None
    tipo_tratamiento_actual: str
    comodidad_unayoe: bool
    aprendizaje_obtenido: str


class Note(BaseModel):
    """Note model for diary entries"""
    note: str
    user_id: str


class LoginRequest(BaseModel):
    """Login credentials"""
    email: str
    password: str


class FaceRegisterRequest(BaseModel):
    """Face registration request"""
    user_id: str
    image_base64: str


class FaceVerifyRequest(BaseModel):
    """Face verification request"""
    user_id: str
    frame_base64: str


# =========================================================
# ESQUEMAS DE CITAS
# =========================================================

class CitaCreate(BaseModel):
    """Schema for creating an appointment"""
    titulo: str
    fecha_cita: str  # ISO datetime string


class CitaUpdate(BaseModel):
    """Schema for updating an appointment"""
    titulo: Optional[str] = None
    fecha_cita: Optional[str] = None


class CitaAsignarPsicologo(BaseModel):
    """Schema for assigning a psychologist to an appointment"""
    id_psicologo: str


class CitaResponse(BaseModel):
    """Schema for appointment response"""
    id_cita: int
    titulo: str
    fecha_creacion: str
    fecha_cita: str
    id_usuario: str
    id_psicologo: Optional[str] = None
    nombre_usuario: Optional[str] = None
    apellido_usuario: Optional[str] = None
    correo_usuario: Optional[str] = None
    nombre_psicologo: Optional[str] = None
    apellido_psicologo: Optional[str] = None

