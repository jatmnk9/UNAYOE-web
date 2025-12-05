# 🚀 Quick Start - Pruebas UNAYOE Backend

## ⚡ Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variables de Entorno

Crear archivo `.env` en `backend/`:

```env
SUPABASE_URL="https://test.supabase.co"
SUPABASE_KEY="test_key"
GEMINI_API_KEY="test_key"
```

### 3. Ejecutar Pruebas

```bash
# Opción 1: Usar script interactivo (Windows)
run_tests.bat

# Opción 2: Usar script interactivo (Linux/Mac)
./run_tests.sh

# Opción 3: Comandos directos
pytest -v
```

---

## 📝 Comandos Esenciales

### Ejecutar Todas las Pruebas
```bash
pytest -v
```

### Ejecutar Pruebas por Categoría

```bash
# Pruebas unitarias
pytest tests/unit -v

# Pruebas de integración
pytest tests/integration -v

# Pruebas de servicios NLP/IA
pytest -m nlp -v
```

### Generar Reporte de Cobertura

```bash
pytest --cov=app --cov-report=html

# Ver reporte (Windows)
start htmlcov/index.html

# Ver reporte (Linux/Mac)
open htmlcov/index.html
```

---

## 🎯 Pruebas por Módulo

### Módulo 1: Notes + Analysis (NLP/IA)

```bash
# Todas las pruebas del módulo
pytest tests/unit/test_nlp_service.py \
       tests/unit/test_analysis_service.py \
       tests/integration/test_notes_analysis_integration.py -v

# Solo servicio NLP
pytest tests/unit/test_nlp_service.py -v

# Solo análisis
pytest tests/unit/test_analysis_service.py -v

# Solo integración
pytest tests/integration/test_notes_analysis_integration.py -v
```

### Módulo 2: Recommendations

```bash
# Todas las pruebas del módulo
pytest tests/integration/test_recommendations_integration.py -v
```

---

## 🔍 Ejemplos de Pruebas Específicas

### Ejecutar una Prueba Individual

```bash
# Sintaxis: pytest ruta/archivo.py::Clase::test_nombre

# Ejemplo 1: Prueba de sentimiento positivo
pytest tests/unit/test_nlp_service.py::TestNLPService::test_analizar_sentimiento_positivo -v

# Ejemplo 2: Prueba de flujo completo
pytest tests/integration/test_notes_analysis_integration.py::TestNotesAnalysisIntegration::test_flujo_completo_guardar_y_analizar_nota -v
```

### Ejecutar Todas las Pruebas de una Clase

```bash
pytest tests/unit/test_nlp_service.py::TestNLPService -v
```

---

## 🏷️ Uso de Marcadores

### Marcadores Disponibles

- `unit` - Pruebas unitarias
- `integration` - Pruebas de integración
- `nlp` - Pruebas de servicios NLP/IA
- `slow` - Pruebas lentas
- `db` - Pruebas que requieren base de datos

### Ejemplos

```bash
# Solo pruebas unitarias
pytest -m unit -v

# Solo pruebas de integración
pytest -m integration -v

# Solo pruebas de NLP/IA
pytest -m nlp -v

# Excluir pruebas lentas
pytest -m "not slow" -v

# Combinaciones
pytest -m "unit and nlp" -v
pytest -m "integration and not slow" -v
```

---

## 📊 Opciones de Salida

### Salida Detallada

```bash
# Verbose (recomendado)
pytest -v

# Extra verbose
pytest -vv

# Mostrar output de prints
pytest -v -s

# Mostrar solo nombres de pruebas
pytest --collect-only
```

### Salida de Fallos

```bash
# Detalles cortos (por defecto)
pytest --tb=short

# Detalles largos
pytest --tb=long

# Solo una línea por fallo
pytest --tb=line

# Sin traceback
pytest --tb=no
```

---

## 🎨 Opciones de Cobertura

### Generar Reportes

```bash
# Reporte en terminal
pytest --cov=app --cov-report=term

# Reporte HTML
pytest --cov=app --cov-report=html

# Reporte XML (para CI/CD)
pytest --cov=app --cov-report=xml

# Múltiples reportes
pytest --cov=app --cov-report=html --cov-report=term-missing
```

### Ver Archivos sin Cobertura

```bash
pytest --cov=app --cov-report=term-missing
```

### Cobertura de Archivo Específico

```bash
pytest --cov=app/services/nlp_service --cov-report=term
```

---

## 🔧 Opciones Avanzadas

### Ejecutar en Paralelo (Más Rápido)

```bash
# Instalar pytest-xdist
pip install pytest-xdist

# Ejecutar con 4 workers
pytest -n 4

# Ejecutar con auto-detección de CPUs
pytest -n auto
```

### Detener en Primer Fallo

```bash
pytest -x
```

### Detener después de N fallos

```bash
pytest --maxfail=3
```

### Ejecutar Solo Pruebas que Fallaron Anteriormente

```bash
pytest --lf
```

### Ejecutar Primero las que Fallaron

```bash
pytest --ff
```

### Modo Silencioso

```bash
pytest -q
```

---

## 🐛 Debug de Pruebas

### Ver Variables y Estado

```bash
# Mostrar valores locales en fallos
pytest -v -l

# Modo debug con PDB
pytest --pdb

# PDB solo en fallos
pytest --pdb --maxfail=1
```

### Ver Warnings

```bash
# Mostrar todos los warnings
pytest -v -W all

# Mostrar summary de warnings
pytest -v --warnings=summary
```

---

## 📦 Ejemplos de Flujo Completo

### Flujo de Desarrollo Diario

```bash
# 1. Ejecutar pruebas rápidas
pytest -m "not slow" -v

# 2. Si todo pasa, ejecutar todas
pytest -v

# 3. Verificar cobertura
pytest --cov=app --cov-report=term-missing

# 4. Ver reporte HTML si es necesario
pytest --cov=app --cov-report=html
start htmlcov/index.html  # Windows
```

### Flujo antes de Commit

```bash
# 1. Ejecutar todas las pruebas
pytest -v

# 2. Generar cobertura
pytest --cov=app --cov-report=term-missing

# 3. Verificar que cobertura > 70%

# 4. Si todo pasa, hacer commit
git add .
git commit -m "feat: nueva funcionalidad con pruebas"
```

### Flujo de CI/CD (simulación local)

```bash
# 1. Pruebas unitarias
pytest tests/unit -v -m unit

# 2. Pruebas NLP/IA
pytest tests/unit -v -m nlp

# 3. Pruebas de integración
pytest tests/integration -v -m integration

# 4. Cobertura completa
pytest --cov=app --cov-report=xml --cov-report=term-missing
```

---

## 🎓 Tips y Trucos

### 1. Crear Alias en tu Shell

**Bash/Zsh (.bashrc o .zshrc):**
```bash
alias pt="pytest -v"
alias ptc="pytest --cov=app --cov-report=html"
alias ptu="pytest tests/unit -v"
alias pti="pytest tests/integration -v"
alias ptn="pytest -m nlp -v"
```

**PowerShell (perfil):**
```powershell
function pt { pytest -v }
function ptc { pytest --cov=app --cov-report=html }
function ptu { pytest tests/unit -v }
function pti { pytest tests/integration -v }
```

### 2. Usar Watch Mode

```bash
# Instalar pytest-watch
pip install pytest-watch

# Ejecutar en modo watch
ptw
```

### 3. Filtrar por Nombre

```bash
# Buscar pruebas que contengan "sentimiento"
pytest -k "sentimiento" -v

# Buscar pruebas que contengan "nlp" o "analysis"
pytest -k "nlp or analysis" -v

# Buscar pruebas que no contengan "slow"
pytest -k "not slow" -v
```

---

## 📚 Recursos

- **Documentación Completa:** [README_TESTS.md](README_TESTS.md)
- **Resumen Ejecutivo:** [TESTING_SUMMARY.md](TESTING_SUMMARY.md)
- **Configuración:** [pytest.ini](pytest.ini)
- **Fixtures:** [tests/conftest.py](tests/conftest.py)

---

## 🆘 Solución Rápida de Problemas

### Error: "ModuleNotFoundError: No module named 'app'"

```bash
# Solución: Asegúrate de estar en el directorio backend
cd backend
pytest -v
```

### Error: "No module named 'pytest'"

```bash
# Solución: Instalar dependencias
pip install -r requirements.txt
```

### Pruebas muy lentas

```bash
# Solución: Ejecutar en paralelo
pip install pytest-xdist
pytest -n auto
```

### Ver por qué falla una prueba

```bash
# Solución: Usar modo verbose con locals
pytest -vv -l
```

---

## ✅ Checklist de Primera Ejecución

- [ ] Instalar dependencias: `pip install -r requirements.txt`
- [ ] Crear archivo `.env` con variables de prueba
- [ ] Ejecutar todas las pruebas: `pytest -v`
- [ ] Verificar que todas pasen ✅
- [ ] Generar reporte de cobertura: `pytest --cov=app --cov-report=html`
- [ ] Verificar cobertura > 70%
- [ ] Ver reporte HTML: `start htmlcov/index.html`
- [ ] Leer documentación: [README_TESTS.md](README_TESTS.md)

---

**¡Listo para empezar! 🚀**

Si tienes dudas, consulta la [documentación completa](README_TESTS.md).
