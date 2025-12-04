# 🚀 Cómo Ejecutar el Backend - Guía Completa

## ⚠️ IMPORTANTE: Estado Actual

El `backend.py` aún tiene código viejo con variables hardcodeadas. **Necesitas:**

1. ✅ Configurar archivo `.env` con tus credenciales
2. ⏳ Actualizar `backend.py` para usar los servicios nuevos (o ejecutar como está temporalmente)

## 📝 Paso 1: Configurar Variables de Entorno

### Crear archivo `.env`

```bash
cd backend

# Windows (PowerShell)
Copy-Item ENV_EXAMPLE.txt .env

# Linux/Mac
cp ENV_EXAMPLE.txt .env
```

### Editar `.env` con tus credenciales reales:

```env
SUPABASE_URL=https://xygadfvudziwnddcicbb.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyBJ0fo-zWzwu4licYxom3bYXLtB5qoal4k
GMAIL_SENDER=unayoesupabase@gmail.com
GMAIL_SMTP_PASSWORD=mqerkifvvylbdoye
```

## 📦 Paso 2: Instalar Dependencias

```bash
pip install python-dotenv
```

## ▶️ Paso 3: Ejecutar el Backend

### Opción A: Con uvicorn (Recomendado)

```bash
# Desde la carpeta backend/
cd backend
uvicorn backend:app --reload --host 127.0.0.1 --port 8000

# O desde la raíz del proyecto
uvicorn backend.backend:app --reload --host 127.0.0.1 --port 8000
```

### Opción B: Con Python directamente

```bash
cd backend
python -m uvicorn backend:app --reload
```

### Opción C: Si tienes un script de inicio

```bash
python backend.py
```

## 🔍 Verificar que Funciona

1. Deberías ver mensajes de inicio en la consola
2. El servidor inicia en: `http://127.0.0.1:8000`
3. Documentación API: `http://127.0.0.1:8000/docs`
4. Prueba un endpoint: `http://127.0.0.1:8000/`

## ⚠️ Problemas Comunes

### Error: "ModuleNotFoundError: No module named 'app'"

**Solución**: Ejecuta desde la raíz del proyecto:

```bash
# Desde UNAYOE-web/
uvicorn backend.backend:app --reload
```

O agrega al PYTHONPATH:

```bash
# Windows PowerShell
$env:PYTHONPATH="$PWD"; python backend/backend.py

# Linux/Mac
export PYTHONPATH=$PWD
python backend/backend.py
```

### Error: "Missing required environment variables"

**Solución**: Verifica que:
- El archivo `.env` existe en `backend/.env`
- Tiene todas las variables completadas
- No hay espacios extra en los valores

### Error: Variables hardcodeadas todavía funcionan

**Esto es esperado**. El código viejo todavía tiene las credenciales hardcodeadas como fallback. Para usar solo `.env`, necesitas actualizar `backend.py` para usar los servicios nuevos.

## 🎯 Próximos Pasos

Una vez que funcione, puedes refactorizar gradualmente:

1. El código actual funciona con variables hardcodeadas (temporalmente)
2. Puedes actualizar `backend.py` para usar los servicios nuevos
3. Ver ejemplos en `EXAMPLES_MIGRATION.md`

## 📚 Archivos de Ayuda

- `COM_INSTALAR_Y_EJECUTAR.md` - Instrucciones detalladas
- `MIGRATION_GUIDE.md` - Cómo migrar el código
- `EXAMPLES_MIGRATION.md` - Ejemplos de código

