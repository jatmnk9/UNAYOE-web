"""
Router de autenticación.
Maneja endpoints de login y autenticación de usuarios.
"""
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from app.models.schemas import LoginRequest, UserResponse
from app.services.auth_service import get_auth_service, AuthService

router = APIRouter(tags=["Autenticación"])


@router.post("/login", response_model=UserResponse)
async def login_user(
    credentials: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Inicia sesión de un usuario.

    Args:
        credentials: Email y contraseña del usuario

    Returns:
        UserResponse: Datos del usuario autenticado con tokens
    """
    user_response = auth_service.login(credentials)

    return JSONResponse({
        "message": "Inicio de sesión exitoso",
        "user": user_response.model_dump()
    })
