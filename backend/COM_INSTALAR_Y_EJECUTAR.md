# 🚀 Cómo Instalar y Ejecutar el Backend Refactorizado

## 📋 Pasos Rápidos

### 1. Instalar Dependencias

```bash
cd backend
pip install python-dotenv
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `backend/`:

```bash
# En Windows (PowerShell)
Copy-Item ENV_EXAMPLE.txt .env

# En Linux/Mac
cp ENV_EXAMPLE.txt .env
```

Luego edita `.env` y completa con tus credenciales reales:

```env
SUPABASE_URL=https://xygadfvudziwnddcicbb.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key_aqui
GEMINI_API_KEY=tu_gemini_api_key_aqui
GMAIL_SENDER=unayoesupabase@gmail.com
GMAIL_SMTP_PASSWORD=tu_password_aqui
```

### 3. Ejecutar el Backend

```bash
# Opción 1: Con uvicorn directamente
uvicorn backend:app --reload --host 127.0.0.1 --port 8000

# Opción 2: Si está en la carpeta backend
cd backend
uvicorn backend:app --reload --host 127.0.0.1 --port 8000
```

O si tienes un script de inicio:

```bash
python backend.py
```

## ⚠️ Problemas Comunes

### Error: "ModuleNotFoundError: No module named 'app'"

**Solución**: Ejecuta desde la raíz del proyecto:

```bash
# Desde UNAYOE-web/
cd backend
uvicorn backend:app --reload
```

O agrega el path al PYTHONPATH:

```bash
# Windows
$env:PYTHONPATH="$PWD"
python backend.py

# Linux/Mac
export PYTHONPATH=$PWD
python backend.py
```

### Error: "Missing required environment variables"

**Solución**: Asegúrate de que el archivo `.env` existe y tiene todas las variables completadas.

### Error: "python-dotenv not found"

**Solución**: 
```bash
pip install python-dotenv
```

## 🔍 Verificar que Funciona

1. El servidor debe iniciar en `http://127.0.0.1:8000`
2. Puedes ver la documentación en `http://127.0.0.1:8000/docs`
3. Prueba un endpoint simple como `/login`

## 📝 Notas Importantes

- El archivo `.env` NO debe committearse (debe estar en `.gitignore`)
- Las credenciales ahora vienen de `.env`, no están hardcodeadas
- Si tienes problemas, revisa los logs del servidor

