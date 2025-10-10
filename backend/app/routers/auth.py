"""
Router de autenticación.
Gestiona las rutas relacionadas con login y autenticación.
"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse



from app.models.schemas import LoginRequest
from app.services.auth_service import auth_service

router = APIRouter(
    prefix="",
    tags=["Autenticación"]
)


@router.post("/login")
async def login_user(credentials: LoginRequest):
    """
    Inicia sesión de un usuario.

    Args:
        credentials: Credenciales de inicio de sesión.

    Returns:
        JSONResponse con los datos del usuario y tokens.
    """
    user_data = await auth_service.login(
        credentials.email,
        credentials.password
    )

    return JSONResponse({
        "message": "Inicio de sesión exitoso",
        "user": user_data
    })
