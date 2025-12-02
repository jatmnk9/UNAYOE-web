"""
Servicio de alertas y envío de correos electrónicos.
"""
import os
import ssl
import json
import base64
import smtplib
import unicodedata
from email.message import EmailMessage
from datetime import datetime
from typing import Dict, List, Set, Tuple
from fastapi import HTTPException
from app.db.supabase import get_supabase_client
from app.config.settings import get_settings

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except Exception:
    service_account = None
    build = None


# Palabras clave severas para detectar riesgo
SEVERE_KEYWORDS: Set[str] = {
    "morir", "muerte", "muerto", "suicidio", "suicidarme", "suicidar",
    "lastimarme", "lastimar", "herirme", "herir", "quitarme la vida",
    "autolesion", "auto lesion", "autolesionarme", "cortarme",
}

SEVERE_PHRASES: Set[str] = {
    "no tengo ganas de vivir",
    "no quiero vivir",
    "me quiero morir",
}


class AlertService:
    """Servicio de alertas y envío de emails."""

    def __init__(self):
        self.supabase = get_supabase_client()
        self.settings = get_settings()

    @staticmethod
    def normalize_text(text: str) -> str:
        """Normaliza texto eliminando tildes y convirtiendo a minúsculas."""
        if not text:
            return ""
        text = text.strip().lower()
        text = unicodedata.normalize('NFD', text)
        text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
        return text

    def contains_severe_keywords(self, text: str) -> bool:
        """Verifica si el texto contiene palabras o frases severas."""
        normalized_text = self.normalize_text(text)

        for phrase in SEVERE_PHRASES:
            if self.normalize_text(phrase) in normalized_text:
                return True

        for keyword in SEVERE_KEYWORDS:
            if f" {self.normalize_text(keyword)} " in f" {normalized_text} ":
                return True

        return False

    def send_email_via_smtp(
        self,
        sender: str,
        password: str,
        to_email: str,
        subject: str,
        body: str
    ) -> None:
        """Envía email usando SMTP de Gmail."""
        msg = EmailMessage()
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.set_content(body)

        context = ssl.create_default_context()

        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
                server.login(sender, password)
                server.send_message(msg)
                return
        except smtplib.SMTPAuthenticationError:
            try:
                with smtplib.SMTP('smtp.gmail.com', 587) as server:
                    server.ehlo()
                    server.starttls(context=context)
                    server.ehlo()
                    server.login(sender, password)
                    server.send_message(msg)
            except Exception as e:
                raise e

    def send_alert_email(
        self,
        to_email: str,
        subject: str,
        body: str
    ) -> None:
        """Envía email de alerta usando configuración del sistema."""
        sender = self.settings.gmail_sender or "unayoesupabase@gmail.com"
        smtp_pass = self.settings.gmail_smtp_password or "mqerkifvvylbdoye"

        if not sender or not smtp_pass:
            raise RuntimeError(
                'Faltan credenciales de Gmail en configuración'
            )

        self.send_email_via_smtp(sender, smtp_pass, to_email, subject, body)

    def build_alert_email(
        self,
        student: Dict,
        note_text: str
    ) -> Tuple[str, str]:
        """Construye el asunto y cuerpo del email de alerta."""
        now = datetime.utcnow().isoformat() + 'Z'
        student_name = f"{student.get('nombre', '')} {student.get('apellido', '')}".strip()

        subject = (
            f"ALERTA URGENTE: Posibles ideaciones suicidas - "
            f"Estudiante {student_name or student.get('id', '')}"
        )

        body = (
            "Este es un aviso automatizado del sistema UNAYOE.\n\n"
            f"Fecha (UTC): {now}\n"
            f"Estudiante: {student_name} (ID: {student.get('id')})\n\n"
            "Se detectaron palabras o frases sensibles que podrían indicar riesgo de daño a sí mismo.\n"
            "Nota reciente del estudiante:\n"
            f"-----------------------------\n{note_text}\n-----------------------------\n\n"
            "Acciones sugeridas (no exhaustivas):\n"
            "- Intentar contactar al estudiante de inmediato.\n"
            "- Seguir el protocolo de intervención en crisis de la institución.\n"
            "- Documentar acciones realizadas.\n\n"
            "Este mensaje se genera automáticamente; "
            "por favor, confirme con una evaluación clínica."
        )

        return subject, body

    def trigger_alert_if_keywords(
        self,
        user_id: str,
        note_text: str
    ) -> None:
        """Dispara alerta si se detectan palabras clave severas."""
        try:
            if not self.contains_severe_keywords(note_text):
                return

            u_res = self.supabase.table('usuarios')\
                .select('id, nombre, apellido, psicologo_id')\
                .eq('id', user_id)\
                .single()\
                .execute()

            student = u_res.data or {}
            psicologo_id = student.get('psicologo_id')

            to_email = None
            if psicologo_id:
                p_res = self.supabase.table('usuarios')\
                    .select('correo_institucional, nombre, apellido')\
                    .eq('id', psicologo_id)\
                    .single()\
                    .execute()

                if p_res and getattr(p_res, 'data', None):
                    to_email = p_res.data.get('correo_institucional')

            if not to_email:
                to_email = self.settings.alert_fallback_email

            if not to_email:
                print('No hay correo configurado para enviar alerta.')
                return

            subject, body = self.build_alert_email(student, note_text)
            self.send_alert_email(to_email, subject, body)
            print(f"✅ Alerta enviada a {to_email} por palabras severas.")

        except Exception as e:
            print(f"⚠️ Error al procesar/enviar alerta: {e}")

    @staticmethod
    def is_sad_label(label: str) -> bool:
        """Verifica si una etiqueta corresponde a tristeza."""
        if not label:
            return False
        label_norm = str(label).strip().lower()
        sadness_labels = {
            "tristeza", "sadness", "depresion",
            "depressed", "depressive"
        }
        return label_norm in sadness_labels

    def compute_sadness_risk(self, notes: List[Dict]) -> Dict:
        """Calcula métricas de riesgo de tristeza."""
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
        latest = notes[0]
        latest_sad_score = (
            latest.get("emocion_score", 0.0)
            if self.is_sad_label(latest.get("emocion"))
            else 0.0
        )

        for n in notes:
            if self.is_sad_label(n.get("emocion")):
                sad_scores.append(float(n.get("emocion_score", 0.0)))

        sad_count = len(sad_scores)
        ratio = sad_count / count if count else 0.0
        max_sad_score = max(sad_scores) if sad_scores else 0.0

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

    def get_students_with_alerts(
        self,
        limit_notes: int = 5,
        psychologist_id: str = None
    ) -> Dict:
        """Genera alertas de estudiantes basadas en sus notas recientes."""
        try:
            q = self.supabase.table("usuarios")\
                .select("id, nombre, apellido, codigo_alumno")\
                .eq("rol", "estudiante")

            if psychologist_id:
                q = q.eq("psicologo_id", psychologist_id)

            users_res = q.execute()
            students = users_res.data or []

            if not students:
                return {"message": "No se encontraron estudiantes", "data": []}

            result = []
            for s in students:
                uid = s.get("id")
                notas_res = self.supabase.table("notas")\
                    .select("emocion, emocion_score, created_at")\
                    .eq("usuario_id", uid)\
                    .order("created_at", desc=True)\
                    .limit(limit_notes)\
                    .execute()

                notes = notas_res.data or []
                risk = self.compute_sadness_risk(notes)

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
            raise HTTPException(
                status_code=500,
                detail=f"Error al generar alertas: {str(e)}"
            )


def get_alert_service() -> AlertService:
    """Factory function para obtener instancia de AlertService."""
    return AlertService()
