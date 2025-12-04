"""
Email service for sending alerts and notifications
Supports both SMTP and Gmail API
"""
import os
import json
import base64
import smtplib
import ssl
from datetime import datetime
from email.message import EmailMessage
from typing import Optional, Tuple
from app.config.settings import settings

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    GMAIL_API_AVAILABLE = True
except ImportError:
    service_account = None
    build = None
    GMAIL_API_AVAILABLE = False


class EmailService:
    """Service for sending emails via SMTP or Gmail API"""
    
    @staticmethod
    def send_via_smtp(
        sender: str, 
        password: str, 
        to_email: str, 
        subject: str, 
        body: str
    ) -> None:
        """
        Send email via SMTP
        
        Args:
            sender: Sender email address
            password: SMTP password
            to_email: Recipient email address
            subject: Email subject
            body: Email body
        """
        msg = EmailMessage()
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.set_content(body)
        
        context = ssl.create_default_context()
        
        # Try SSL on port 465 first
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context) as server:
                server.login(sender, password)
                server.send_message(msg)
                return
        except smtplib.SMTPAuthenticationError:
            # Try STARTTLS on port 587
            with smtplib.SMTP('smtp.gmail.com', 587) as server:
                server.ehlo()
                server.starttls(context=context)
                server.ehlo()
                server.login(sender, password)
                server.send_message(msg)
    
    @staticmethod
    def send_via_gmail_api(
        sender: str, 
        to_email: str, 
        subject: str, 
        body: str
    ) -> None:
        """
        Send email via Gmail API (requires service account)
        
        Args:
            sender: Sender email address
            to_email: Recipient email address
            subject: Email subject
            body: Email body
            
        Raises:
            RuntimeError: If Gmail API is not available or misconfigured
        """
        if not GMAIL_API_AVAILABLE:
            raise RuntimeError("googleapiclient/google-auth not available")
        
        sa_json = settings.GMAIL_SERVICE_ACCOUNT_JSON
        delegated_user = settings.GMAIL_DELEGATED_USER or sender
        
        if not sa_json:
            raise RuntimeError(
                "GMAIL_SERVICE_ACCOUNT_JSON not set in environment variables"
            )
        
        try:
            # Support JSON string or file path
            if sa_json.strip().startswith('{'):
                sa_info = json.loads(sa_json)
                creds = service_account.Credentials.from_service_account_info(
                    sa_info,
                    scopes=["https://www.googleapis.com/auth/gmail.send"]
                )
            else:
                creds = service_account.Credentials.from_service_account_file(
                    sa_json,
                    scopes=["https://www.googleapis.com/auth/gmail.send"]
                )
        except Exception as e:
            raise RuntimeError(f"Error loading service account credentials: {e}")
        
        delegated = creds.with_subject(delegated_user)
        service = build('gmail', 'v1', credentials=delegated, cache_discovery=False)
        
        msg = EmailMessage()
        msg['From'] = sender
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.set_content(body)
        
        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        service.users().messages().send(userId='me', body={'raw': raw}).execute()
    
    @staticmethod
    def send_alert_email(to_email: str, subject: str, body: str) -> None:
        """
        Send alert email using configured method (SMTP by default)
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body
        """
        sender = settings.GMAIL_SENDER
        password = settings.GMAIL_SMTP_PASSWORD
        
        if not sender or not password:
            raise RuntimeError(
                "GMAIL_SENDER and GMAIL_SMTP_PASSWORD must be set in .env file"
            )
        
        EmailService.send_via_smtp(sender, password, to_email, subject, body)
    
    @staticmethod
    def build_alert_email(student: dict, note_text: str) -> Tuple[str, str]:
        """
        Build alert email subject and body for student risk
        
        Args:
            student: Student dictionary with nombre, apellido, id
            note_text: Note text that triggered the alert
            
        Returns:
            Tuple of (subject, body)
        """
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
            "Se detectaron palabras o frases sensibles que podrían indicar "
            "riesgo de daño a sí mismo.\n"
            "Nota reciente del estudiante:\n"
            f"-----------------------------\n{note_text}\n-----------------------------\n\n"
            "Acciones sugeridas (no exhaustivas):\n"
            "- Intentar contactar al estudiante de inmediato.\n"
            "- Seguir el protocolo de intervención en crisis de la institución.\n"
            "- Documentar acciones realizadas.\n\n"
            "Este mensaje se genera automáticamente; por favor, confirme "
            "con una evaluación clínica."
        )
        
        return subject, body

