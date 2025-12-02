"""
Servicio de autenticación.
Maneja login y validación de usuarios.
"""
from fastapi import HTTPException
from app.db.supabase import get_supabase_client
from app.models.schemas import LoginRequest, UserResponse


class AuthService:
    """Servicio de autenticación de usuarios."""

    def __init__(self):
        self.supabase = get_supabase_client()

    def login(self, credentials: LoginRequest) -> UserResponse:
        """
        Autentica un usuario y retorna su perfil con tokens.

        Args:
            credentials: Credenciales de login (email, password)

        Returns:
            UserResponse: Datos del usuario autenticado

        Raises:
            HTTPException: Si las credenciales son inválidas o el usuario no existe
        """
        try:
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })

            if not auth_response.user:
                raise HTTPException(
                    status_code=401,
                    detail="Credenciales inválidas"
                )

            user_id = auth_response.user.id

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

            return UserResponse(
                id=user_id,
                email=credentials.email,
                rol=user_profile["rol"],
                nombre=user_profile.get("nombre", ""),
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error durante la autenticación: {str(e)}"
            )


def get_auth_service() -> AuthService:
    """
    Factory function para obtener instancia de AuthService.

    Returns:
        AuthService: Instancia del servicio de autenticación
    """
    return AuthService()
