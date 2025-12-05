@echo off
REM Script para ejecutar pruebas del backend UNAYOE (Windows)

echo ================================
echo UNAYOE Backend - Sistema de Pruebas
echo ================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist pytest.ini (
    echo ERROR: No se encuentra pytest.ini
    echo Por favor ejecuta este script desde el directorio backend/
    pause
    exit /b 1
)

:menu
cls
echo ================================
echo UNAYOE Backend - Sistema de Pruebas
echo ================================
echo.
echo Selecciona el tipo de pruebas a ejecutar:
echo.
echo 1. Todas las pruebas
echo 2. Pruebas unitarias
echo 3. Pruebas de integracion
echo 4. Pruebas de servicios NLP/IA
echo 5. Pruebas con cobertura
echo 6. Pruebas rapidas (excluir lentas)
echo 7. Solo modulo Notes + Analysis
echo 8. Solo modulo Recommendations
echo 9. Ver reporte de cobertura HTML
echo 0. Salir
echo.

set /p option="Opcion: "

if "%option%"=="1" goto all_tests
if "%option%"=="2" goto unit_tests
if "%option%"=="3" goto integration_tests
if "%option%"=="4" goto nlp_tests
if "%option%"=="5" goto coverage_tests
if "%option%"=="6" goto fast_tests
if "%option%"=="7" goto notes_tests
if "%option%"=="8" goto recommendations_tests
if "%option%"=="9" goto view_coverage
if "%option%"=="0" goto exit
goto invalid_option

:all_tests
echo.
echo Ejecutando todas las pruebas...
pytest -v
goto continue

:unit_tests
echo.
echo Ejecutando pruebas unitarias...
pytest tests/unit -v -m unit
goto continue

:integration_tests
echo.
echo Ejecutando pruebas de integracion...
pytest tests/integration -v -m integration
goto continue

:nlp_tests
echo.
echo Ejecutando pruebas de servicios NLP/IA...
pytest tests/unit -v -m nlp
goto continue

:coverage_tests
echo.
echo Ejecutando pruebas con cobertura...
pytest --cov=app --cov-report=html --cov-report=term-missing
echo.
echo Reporte de cobertura generado en: htmlcov/index.html
goto continue

:fast_tests
echo.
echo Ejecutando pruebas rapidas (excluyendo lentas)...
pytest -v -m "not slow"
goto continue

:notes_tests
echo.
echo Ejecutando pruebas de Notes + Analysis...
pytest tests/unit/test_nlp_service.py tests/unit/test_analysis_service.py tests/integration/test_notes_analysis_integration.py -v
goto continue

:recommendations_tests
echo.
echo Ejecutando pruebas de Recommendations...
pytest tests/integration/test_recommendations_integration.py -v
goto continue

:view_coverage
echo.
echo Abriendo reporte de cobertura...
if exist htmlcov\index.html (
    start htmlcov\index.html
) else (
    echo ERROR: No existe el reporte. Ejecuta primero la opcion 5.
)
goto continue

:invalid_option
echo.
echo Opcion invalida. Intenta de nuevo.
goto continue

:continue
echo.
pause
goto menu

:exit
echo.
echo Hasta luego!
exit /b 0
