"""
Servicio de encriptación para datos sensibles
Usa Fernet (symmetric encryption) de la biblioteca cryptography
"""
import os
import base64
import json
from typing import Any, Optional, Dict, List
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


class EncryptionService:
    """Servicio para encriptar y desencriptar datos sensibles"""
    
    _instance = None
    _fernet: Optional[Fernet] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EncryptionService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._fernet is None:
            self._initialize_fernet()
    
    def _initialize_fernet(self):
        """Inicializa Fernet con la clave de encriptación"""
        encryption_key = os.getenv("ENCRYPTION_KEY")
        
        if not encryption_key:
            raise ValueError(
                "ENCRYPTION_KEY no está configurada. "
                "Por favor, configura esta variable de entorno."
            )
        
        # Si la clave es una cadena, convertirla a bytes
        if isinstance(encryption_key, str):
            # Si es una clave base64, decodificarla
            try:
                key_bytes = base64.urlsafe_b64decode(encryption_key)
                if len(key_bytes) != 32:
                    # Si no es válida, generar una nueva clave desde la cadena
                    key_bytes = self._derive_key_from_string(encryption_key)
            except:
                # Si falla, derivar clave desde la cadena
                key_bytes = self._derive_key_from_string(encryption_key)
        else:
            key_bytes = encryption_key
        
        # Asegurar que la clave tenga 32 bytes
        if len(key_bytes) != 32:
            key_bytes = self._derive_key_from_string(encryption_key)
        
        # Codificar a base64 para Fernet
        fernet_key = base64.urlsafe_b64encode(key_bytes)
        self._fernet = Fernet(fernet_key)
    
    def _derive_key_from_string(self, password: str, salt: Optional[bytes] = None) -> bytes:
        """Deriva una clave de 32 bytes desde una cadena de texto"""
        if salt is None:
            # Salt fijo para consistencia (en producción, considerar usar un salt único por usuario)
            salt = b'unayoe_encryption_salt_2024'
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return kdf.derive(password.encode())
    
    def encrypt(self, data: Any) -> Optional[str]:
        """
        Encripta un dato (string, dict, list, etc.)
        Retorna el dato encriptado como string base64
        """
        if data is None:
            return None
        
        try:
            # Convertir a string JSON si es dict o list
            if isinstance(data, (dict, list)):
                data_str = json.dumps(data, ensure_ascii=False)
            else:
                data_str = str(data)
            
            # Encriptar
            encrypted_bytes = self._fernet.encrypt(data_str.encode('utf-8'))
            # Retornar como string base64
            return base64.urlsafe_b64encode(encrypted_bytes).decode('utf-8')
        except Exception as e:
            print(f"[ENCRYPTION_ERROR] Error al encriptar: {e}")
            raise ValueError(f"Error al encriptar dato: {e}")
    
    def decrypt(self, encrypted_data: Optional[str]) -> Optional[Any]:
        """
        Desencripta un dato encriptado
        Retorna el dato original (string, dict, list, etc.)
        """
        if encrypted_data is None or encrypted_data == "":
            return None
        
        # Si el dato es una lista o dict directamente (no encriptado), retornarlo
        if isinstance(encrypted_data, (list, dict)):
            return encrypted_data
        
        # Si no es string, retornar tal cual
        if not isinstance(encrypted_data, str):
            return encrypted_data
        
        try:
            # Decodificar desde base64
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
            # Desencriptar
            decrypted_bytes = self._fernet.decrypt(encrypted_bytes)
            decrypted_str = decrypted_bytes.decode('utf-8')
            
            # Intentar parsear como JSON si es posible
            try:
                return json.loads(decrypted_str)
            except json.JSONDecodeError:
                # Si no es JSON, retornar como string
                return decrypted_str
        except (ValueError, TypeError) as e:
            # No es base64 válido, probablemente no está encriptado
            print(f"[DECRYPTION_WARNING] Dato no parece estar encriptado (no es base64 válido)")
            # Intentar parsear como JSON si es posible
            try:
                return json.loads(encrypted_data)
            except:
                return encrypted_data
        except Exception as e:
            print(f"[DECRYPTION_ERROR] Error al desencriptar: {e}")
            # Si falla la desencriptación, podría ser que el dato no esté encriptado
            # (para compatibilidad con datos antiguos)
            # Intentar parsear como JSON si es posible
            try:
                return json.loads(encrypted_data)
            except:
                return encrypted_data
    
    def encrypt_dict_fields(self, data: Dict[str, Any], fields_to_encrypt: List[str]) -> Dict[str, Any]:
        """
        Encripta campos específicos de un diccionario
        """
        encrypted_data = data.copy()
        for field in fields_to_encrypt:
            if field in encrypted_data and encrypted_data[field] is not None:
                encrypted_data[field] = self.encrypt(encrypted_data[field])
        return encrypted_data
    
    def decrypt_dict_fields(self, data: Dict[str, Any], fields_to_decrypt: List[str]) -> Dict[str, Any]:
        """
        Desencripta campos específicos de un diccionario
        """
        decrypted_data = data.copy()
        for field in fields_to_decrypt:
            if field in decrypted_data and decrypted_data[field] is not None:
                decrypted_data[field] = self.decrypt(decrypted_data[field])
        return decrypted_data


# Instancia global del servicio
encryption_service = EncryptionService()

