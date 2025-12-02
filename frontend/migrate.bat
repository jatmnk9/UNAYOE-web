@echo off
REM Script de migración del código refactorizado (Windows)
REM Este script realiza el backup del código antiguo y migra el código refactorizado

echo ======================================
echo    Migracion Frontend Refactorizado
echo ======================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "src-refactored" (
    echo ERROR: No se encuentra el directorio 'src-refactored'
    echo        Asegurate de estar en el directorio frontend
    pause
    exit /b 1
)

echo Pasos a realizar:
echo   1. Backup del codigo antiguo (src -^> src-old^)
echo   2. Migracion del codigo refactorizado (src-refactored -^> src^)
echo   3. Instalacion de dependencias
echo.
set /p confirm="Deseas continuar? (s/n): "

if /i not "%confirm%"=="s" (
    echo Migracion cancelada
    pause
    exit /b 0
)

echo.
echo Paso 1: Creando backup del codigo antiguo...

if exist "src-old" (
    echo    El directorio 'src-old' ya existe
    set /p overwrite="   Deseas sobrescribirlo? (s/n): "
    if /i "%overwrite%"=="s" (
        rmdir /s /q src-old
        echo    Backup antiguo eliminado
    ) else (
        echo    Migracion cancelada
        pause
        exit /b 0
    )
)

move src src-old
echo    Backup creado en 'src-old'

echo.
echo Paso 2: Migrando codigo refactorizado...
move src-refactored src
echo    Codigo refactorizado migrado a 'src'

echo.
echo Paso 3: Instalando dependencias...
call npm install
echo    Dependencias instaladas

echo.
echo ======================================
echo    Migracion completada con exito
echo ======================================
echo.
echo Proximos pasos:
echo   1. Ejecuta: npm run dev
echo   2. Prueba la aplicacion en http://localhost:5173
echo   3. Si todo funciona, puedes eliminar 'src-old'
echo.
echo Para revertir la migracion:
echo   1. rmdir /s /q src
echo   2. move src-old src
echo.
pause
