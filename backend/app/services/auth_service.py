"""
Servicio de autenticación.
Gestiona el inicio de sesión y verificación de usuarios.
"""
from typing import Dict, Any
from fastapi import HTTPException

from app.db.supabase import get_supabase_client


class AuthService:
    """Servicio de autenticación."""

    def __init__(self):
        """Inicializa el servicio de autenticación."""
        self.supabase = get_supabase_client()

    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Autentica un usuario.

        Args:
            email: Correo electrónico del usuario.
            password: Contraseña del usuario.

        Returns:
            Diccionario con los datos del usuario autenticado.

        Raises:
            HTTPException: Si las credenciales son inválidas.
        """
        try:
            # Autenticar con Supabase
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=401,
                    detail="Credenciales inválidas"
                )

            user_id = auth_response.user.id

            # Obtener perfil del usuario
            profile_response = self.supabase.table("usuarios")\
                .select("*")\
                .eq("id", user_id)\
                .single()\
                .execute()

            if not profile_response.data:
                raise HTTPException(
                    status_code=404,
                    detail="Usuario no encontrado en tabla 'usuarios'"
                )

            user_profile = profile_response.data

            return {
                "id": user_id,
                "email": email,
                "rol": user_profile["rol"],
                "nombre": user_profile.get("nombre", ""),
                "access_token": auth_response.session.access_token,
                "refresh_token": auth_response.session.refresh_token
            }

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# Instancia única del servicio
auth_service = AuthService()
