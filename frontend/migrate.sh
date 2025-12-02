#!/bin/bash

# Script de migración del código refactorizado
# Este script realiza el backup del código antiguo y migra el código refactorizado

echo "======================================"
echo "   Migración Frontend Refactorizado"
echo "======================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -d "src-refactored" ]; then
    echo "❌ Error: No se encuentra el directorio 'src-refactored'"
    echo "   Asegúrate de estar en el directorio frontend"
    exit 1
fi

echo "📋 Pasos a realizar:"
echo "  1. Backup del código antiguo (src → src-old)"
echo "  2. Migración del código refactorizado (src-refactored → src)"
echo "  3. Instalación de dependencias"
echo ""
read -p "¿Deseas continuar? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Migración cancelada"
    exit 0
fi

echo ""
echo "🔄 Paso 1: Creando backup del código antiguo..."

if [ -d "src-old" ]; then
    echo "   ⚠️  El directorio 'src-old' ya existe"
    read -p "   ¿Deseas sobrescribirlo? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -rf src-old
        echo "   ✓ Backup antiguo eliminado"
    else
        echo "   ❌ Migración cancelada"
        exit 0
    fi
fi

mv src src-old
echo "   ✓ Backup creado en 'src-old'"

echo ""
echo "🔄 Paso 2: Migrando código refactorizado..."
mv src-refactored src
echo "   ✓ Código refactorizado migrado a 'src'"

echo ""
echo "🔄 Paso 3: Instalando dependencias..."
npm install
echo "   ✓ Dependencias instaladas"

echo ""
echo "======================================"
echo "   ✅ Migración completada con éxito"
echo "======================================"
echo ""
echo "Próximos pasos:"
echo "  1. Ejecuta: npm run dev"
echo "  2. Prueba la aplicación en http://localhost:5173"
echo "  3. Si todo funciona, puedes eliminar 'src-old'"
echo ""
echo "Para revertir la migración:"
echo "  1. rm -rf src"
echo "  2. mv src-old src"
echo ""
