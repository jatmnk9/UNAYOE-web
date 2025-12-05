"""
Script para generar una clave de encriptación segura
Ejecuta: python generate_encryption_key.py
"""
from cryptography.fernet import Fernet
import base64

def generate_key():
    """Genera una clave de encriptación Fernet"""
    key = Fernet.generate_key()
    print("=" * 60)
    print("CLAVE DE ENCRIPTACIÓN GENERADA")
    print("=" * 60)
    print(f"\n{key.decode()}\n")
    print("=" * 60)
    print("INSTRUCCIONES:")
    print("1. Copia la clave de arriba")
    print("2. Agrega esta línea a tu archivo .env:")
    print(f"   ENCRYPTION_KEY={key.decode()}")
    print("3. NUNCA compartas esta clave ni la subas al repositorio")
    print("=" * 60)
    return key.decode()

if __name__ == "__main__":
    generate_key()

