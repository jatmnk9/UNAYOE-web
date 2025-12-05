#!/bin/bash
# Script para ejecutar pruebas del backend UNAYOE

echo "🧪 UNAYOE Backend - Sistema de Pruebas"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar menú
show_menu() {
    echo -e "${BLUE}Selecciona el tipo de pruebas a ejecutar:${NC}"
    echo "1. Todas las pruebas"
    echo "2. Pruebas unitarias"
    echo "3. Pruebas de integración"
    echo "4. Pruebas de servicios NLP/IA"
    echo "5. Pruebas con cobertura"
    echo "6. Pruebas rápidas (excluir lentas)"
    echo "7. Solo módulo Notes + Analysis"
    echo "8. Solo módulo Recommendations"
    echo "9. Ver reporte de cobertura HTML"
    echo "0. Salir"
    echo ""
}

# Verificar que estamos en el directorio correcto
if [ ! -f "pytest.ini" ]; then
    echo -e "${YELLOW}⚠️  Error: No se encuentra pytest.ini${NC}"
    echo "Por favor ejecuta este script desde el directorio backend/"
    exit 1
fi

# Bucle principal
while true; do
    show_menu
    read -p "Opción: " option
    echo ""

    case $option in
        1)
            echo -e "${GREEN}Ejecutando todas las pruebas...${NC}"
            pytest -v
            ;;
        2)
            echo -e "${GREEN}Ejecutando pruebas unitarias...${NC}"
            pytest tests/unit -v -m unit
            ;;
        3)
            echo -e "${GREEN}Ejecutando pruebas de integración...${NC}"
            pytest tests/integration -v -m integration
            ;;
        4)
            echo -e "${GREEN}Ejecutando pruebas de servicios NLP/IA...${NC}"
            pytest tests/unit -v -m nlp
            ;;
        5)
            echo -e "${GREEN}Ejecutando pruebas con cobertura...${NC}"
            pytest --cov=app --cov-report=html --cov-report=term-missing
            echo ""
            echo -e "${BLUE}Reporte de cobertura generado en: htmlcov/index.html${NC}"
            ;;
        6)
            echo -e "${GREEN}Ejecutando pruebas rápidas (excluyendo lentas)...${NC}"
            pytest -v -m "not slow"
            ;;
        7)
            echo -e "${GREEN}Ejecutando pruebas de Notes + Analysis...${NC}"
            pytest tests/unit/test_nlp_service.py tests/unit/test_analysis_service.py tests/integration/test_notes_analysis_integration.py -v
            ;;
        8)
            echo -e "${GREEN}Ejecutando pruebas de Recommendations...${NC}"
            pytest tests/integration/test_recommendations_integration.py -v
            ;;
        9)
            echo -e "${GREEN}Abriendo reporte de cobertura...${NC}"
            if [ -f "htmlcov/index.html" ]; then
                # En Windows
                if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
                    start htmlcov/index.html
                # En Mac
                elif [[ "$OSTYPE" == "darwin"* ]]; then
                    open htmlcov/index.html
                # En Linux
                else
                    xdg-open htmlcov/index.html
                fi
            else
                echo -e "${YELLOW}⚠️  No existe el reporte. Ejecuta primero la opción 5.${NC}"
            fi
            ;;
        0)
            echo -e "${GREEN}¡Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${YELLOW}⚠️  Opción inválida. Intenta de nuevo.${NC}"
            ;;
    esac

    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done
