# 🚀 Guía de Despliegue en Vercel

## ✅ Configuración Actual

El proyecto está configurado para funcionar en Vercel con las siguientes características:

### 1. **Configuración de Build**
- ✅ `vercel.json` configurado en la raíz del proyecto
- ✅ Usa `--legacy-peer-deps` para instalar dependencias
- ✅ Framework detectado: Vite
- ✅ Output directory: `frontend/dist`

### 2. **Dependencias**
- ✅ `react-canvas-draw` instalado con `--legacy-peer-deps`
- ✅ Archivo `.npmrc` configurado en `frontend/` para usar `legacy-peer-deps` automáticamente

## ⚠️ IMPORTANTE: Variables de Entorno

**Necesitas configurar la URL de tu backend en Vercel:**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   ```
   VITE_API_URL=https://tu-backend-url.com
   ```
   (Reemplaza con la URL real de tu backend en producción)

## 📝 Pasos para Desplegar

### Opción 1: Desde el Dashboard de Vercel

1. **Conecta tu repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub/GitLab/Bitbucket

2. **Configura el proyecto:**
   - Framework Preset: **Vite** (debería detectarse automáticamente)
   - Root Directory: **frontend** (si Vercel no lo detecta automáticamente)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

3. **Agrega variables de entorno:**
   - `VITE_API_URL` = URL de tu backend en producción

4. **Deploy!**

### Opción 2: Desde la CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la raíz del proyecto
vercel

# Seguir las instrucciones
```

## 🔧 Configuración Actual del Proyecto

### Estructura de Directorios
```
UNAYOE-web/
├── vercel.json          # Configuración de Vercel
├── frontend/
│   ├── .npmrc          # Configuración npm (legacy-peer-deps)
│   ├── package.json
│   └── src/
└── backend/            # (No se despliega en Vercel)
```

### Archivos Importantes

- **`vercel.json`**: Configuración de build y rewrites
- **`frontend/.npmrc`**: Fuerza `legacy-peer-deps` en instalaciones
- **`frontend/package.json`**: Scripts de build configurados

## ⚠️ Problemas Conocidos y Soluciones

### 1. URLs Hardcodeadas
**Problema:** El código tiene URLs hardcodeadas a `http://127.0.0.1:8000`

**Solución Temporal:** 
- Configura `VITE_API_URL` en Vercel con la URL de tu backend
- El archivo `frontend/src/config/api.js` está listo para usar, pero necesitas actualizar el código para usarlo

**Solución Permanente (Recomendada):**
- Reemplazar todas las URLs hardcodeadas por `import.meta.env.VITE_API_URL`
- Usar el archivo `frontend/src/config/api.js` que ya creé

### 2. Backend Separado
**Importante:** Tu backend (FastAPI) debe estar desplegado en otro servicio (Railway, Render, etc.) y la URL debe configurarse en `VITE_API_URL`

## ✅ Checklist Pre-Deploy

- [ ] Backend desplegado y funcionando
- [ ] Variable `VITE_API_URL` configurada en Vercel
- [ ] Variables de Supabase configuradas (si usas .env)
- [ ] Build local funciona: `cd frontend && npm run build`
- [ ] No hay errores de compilación

## 🧪 Probar Build Localmente

```bash
cd frontend
npm install --legacy-peer-deps
npm run build
npm run preview  # Para probar el build
```

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Vite + Vercel](https://vercel.com/guides/deploying-vite-with-vercel)

