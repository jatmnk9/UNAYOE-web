# 📋 Guía: Cambiar URLs Hardcodeadas a Variables de Entorno

## ¿Qué se hizo?

He centralizado todas las URLs del backend en una sola variable de entorno que puedes cambiar fácilmente sin tocar el código.

---

## 📁 Archivo Principal: `frontend/src/config/api.js`

```javascript
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  return fetch(url, options);
};

export const getApiUrl = () => API_BASE_URL;

export default API_BASE_URL;
```

**¿Qué hace?**
- Lee la variable `VITE_BACKEND_URL` del archivo `.env`
- Si no existe, usa `http://localhost:8000` como default
- Proporciona la función `apiCall()` para hacer fetches simplificados

---

## 🔧 Variables de Entorno: `frontend/.env`

```env
VITE_BACKEND_URL=https://758b7f7f7739.ngrok-free.app
VITE_CHATBOT_URL=https://ghop.app.n8n.cloud/webhook/chatbot
```

**¿Qué significa?**
- `VITE_` es requerido por Vite para exponer variables al cliente
- Cambia `VITE_BACKEND_URL` cuando cambies de entorno (local, staging, producción)

---

## 💡 Cómo Usar en tu Código

### ❌ ANTES (Hardcodeado)
```jsx
const res = await fetch('http://127.0.0.1:8000/analyze/123');
```

### ✅ DESPUÉS (Con variable de entorno)
```jsx
import { API_BASE_URL } from '../config/api';

const res = await fetch(`${API_BASE_URL}/analyze/123`);
```

---

## 🔄 Cambiar la URL en Diferentes Ambientes

### 1️⃣ **Desarrollo Local**
```env
VITE_BACKEND_URL=http://localhost:8000
```

### 2️⃣ **Con Ngrok**
```env
VITE_BACKEND_URL=https://abc123.ngrok.io
```

### 3️⃣ **Producción Vercel + Railway**
```env
VITE_BACKEND_URL=https://tu-api-production.com
```

### 4️⃣ **Staging**
```env
VITE_BACKEND_URL=https://staging-api.tuapp.com
```

**¿Cómo hacerlo?**

1. Abre `frontend/.env`
2. Cambia `VITE_BACKEND_URL` a la nueva URL
3. Guarda el archivo
4. Recarga la página en el navegador (Ctrl+Shift+R para limpiar caché)
5. Listo! Todas las llamadas API usarán la nueva URL

---

## 📝 Archivos Actualizados

Los siguientes archivos ahora importan `API_BASE_URL`:

- `frontend/src/pages/StudentReport.jsx`
- `frontend/src/pages/StudentAttendance.jsx`
- `frontend/src/pages/StudentGallery.jsx`
- `frontend/src/pages/StudentAttendanceReport.jsx`
- `frontend/src/pages/Signup.jsx`
- `frontend/src/pages/SeguimientoDiario.jsx`
- `frontend/src/pages/SeguimientoCitas.jsx`
- `frontend/src/pages/Recomendaciones.jsx`
- `frontend/src/pages/PsychologistDrawingsView.jsx`
- `frontend/src/pages/MisFavoritos.jsx`

---

## 🚀 Proceso Rápido para Cambiar la URL

```bash
# 1. Edita el archivo .env
nano frontend/.env

# 2. Cambia esta línea:
# De: VITE_BACKEND_URL=https://vieja-url.com
# A:  VITE_BACKEND_URL=https://nueva-url.com

# 3. Guarda con Ctrl+X, Y, Enter

# 4. Si estás en desarrollo, reinicia Vite:
# Ctrl+C en la terminal de Vite
npm run dev

# 5. Si desplegaste en Vercel, actualiza desde el dashboard:
# Settings → Environment Variables → Actualiza VITE_BACKEND_URL
```

---

## 🎯 Ventajas de este Sistema

✅ **Una sola ubicación** para cambiar la URL  
✅ **Sin tocar código** - solo edita el `.env`  
✅ **Fácil de mantener** - todos los archivos usan el mismo `API_BASE_URL`  
✅ **Seguro** - las URLs no quedan hardcodeadas en el código  
✅ **Multiambiente** - una línea para cambiar entre dev, staging, prod  

---

## ⚠️ Importante

- **Nunca comitees** el archivo `.env` real al repositorio (usa `.env.example`)
- En **Vercel**, actualiza las variables de entorno en el dashboard del proyecto
- En **desarrollo local**, reinicia el servidor Vite después de cambiar `.env`

