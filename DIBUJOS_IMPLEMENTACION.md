# 🎨 Implementación del Sistema de Dibujos

## ✅ Lo que se ha implementado

### Backend

1. **Servicio de Análisis** (`backend/app/services/drawing_analysis_service.py`)
   - Decodificación de imágenes base64
   - Cuantificación de dibujos (métricas)
   - Visualización de pasos de procesamiento
   - Generación de insights con Gemini AI

2. **Endpoints API** (`backend/backend.py`)
   - `POST /drawings/upload` - Subir dibujos
   - `GET /drawings/student/{user_id}` - Obtener dibujos de un estudiante
   - `GET /drawings/psychologist/{psychologist_id}` - Obtener dibujos de estudiantes del psicólogo
   - `POST /drawings/analyze/{drawing_id}` - Analizar un dibujo

### Frontend

1. **Componente StudentGallery** (`frontend/src/pages/StudentGallery.jsx`)
   - Subida de imágenes desde PC
   - Dibujo en línea con React Canvas Draw
   - Visualización de galería personal
   - Guardado de datos del canvas para replay

2. **Componente PsychologistDrawingsView** (`frontend/src/pages/PsychologistDrawingsView.jsx`)
   - Lista de estudiantes con sus dibujos
   - Botón "Analizar Imagen" para cada dibujo
   - Modal con resultados completos del análisis:
     - Métricas cuantitativas
     - Visualizaciones paso a paso
     - Insights de IA

3. **Rutas agregadas**
   - `/student/gallery` - Galería del estudiante
   - `/psychologist/drawings` - Vista de dibujos para psicólogo

## 📋 Configuración de Supabase

### 1. Crear la Tabla `drawings`

Ejecuta este SQL en el editor SQL de Supabase:

```sql
CREATE TABLE public.drawings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT,
    descripcion TEXT,
    imagen_url TEXT NOT NULL,
    drawing_data JSONB,
    tipo_dibujo TEXT DEFAULT 'uploaded',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drawings_usuario_id ON public.drawings(usuario_id);
CREATE INDEX idx_drawings_created_at ON public.drawings(created_at DESC);

ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Estudiantes pueden ver sus propios dibujos"
    ON public.drawings FOR SELECT
    USING (auth.uid() = usuario_id);

CREATE POLICY "Estudiantes pueden insertar sus propios dibujos"
    ON public.drawings FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Psicólogos pueden ver dibujos de sus estudiantes"
    ON public.drawings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE usuarios.id = drawings.usuario_id
            AND usuarios.psicologo_id = auth.uid()
        )
    );
```

### 2. Crear el Bucket `student_drawings`

1. Ve a **Storage** en el panel de Supabase
2. Crea un nuevo bucket llamado: `student_drawings`
3. Configura las políticas (en el editor SQL):

```sql
-- Política: Los estudiantes pueden subir sus propios dibujos
CREATE POLICY "Estudiantes pueden subir dibujos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'student_drawings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los estudiantes pueden ver sus propios dibujos
CREATE POLICY "Estudiantes pueden ver sus dibujos"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'student_drawings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los psicólogos pueden ver dibujos de sus estudiantes
CREATE POLICY "Psicólogos pueden ver dibujos de estudiantes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'student_drawings'
    AND EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE usuarios.id::text = (storage.foldername(name))[1]
        AND usuarios.psicologo_id = auth.uid()
    )
);

-- Política: Los estudiantes pueden actualizar sus propios dibujos
CREATE POLICY "Estudiantes pueden actualizar sus dibujos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'student_drawings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los estudiantes pueden eliminar sus propios dibujos
CREATE POLICY "Estudiantes pueden eliminar sus dibujos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'student_drawings' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
```

## 🚀 Características Implementadas

### Para Estudiantes

- ✅ Subir imágenes desde PC
- ✅ Dibujar en línea con React Canvas Draw
- ✅ Configuración sin suavizado (`lazyRadius=0`) para capturar temblor real
- ✅ Guardado de datos del canvas para replay futuro
- ✅ Título y descripción opcionales
- ✅ Visualización de galería personal

### Para Psicólogos

- ✅ Ver lista de estudiantes asignados
- ✅ Ver todos los dibujos de cada estudiante
- ✅ Analizar dibujos con un clic
- ✅ Ver métricas cuantitativas:
  - Densidad de trazo
  - Complejidad de bordes
  - Longitud del esqueleto
  - Número de esquinas
  - Contraste general
  - Uso del espacio
- ✅ Ver visualizaciones paso a paso:
  - Imagen original
  - Binarización
  - Bordes Canny
  - Esquinas Harris
  - Esqueleto
  - Bounding Box
- ✅ Recibir insights y sugerencias de IA (Gemini)

## 📝 Notas Importantes

1. **React Canvas Draw**: Se instaló con `--legacy-peer-deps` debido a incompatibilidad con React 19. Funciona correctamente.

2. **Estructura de archivos**: Los dibujos se almacenan como `{user_id}/{drawing_id}.png` o `.jpg` en Supabase Storage.

3. **Tipo de dibujo**: 
   - `uploaded`: Imagen subida desde PC
   - `canvas`: Dibujo creado con React Canvas Draw

4. **drawing_data**: Para dibujos tipo `canvas`, se almacena el JSON de `getSaveData()` para poder reproducir el proceso de dibujo en el futuro.

5. **Análisis**: El análisis se realiza descargando la imagen desde Supabase Storage, procesándola y devolviendo los resultados al frontend.

## 🔧 Dependencias

### Backend
- Ya incluidas en el proyecto (cv2, numpy, skimage, google.generativeai)

### Frontend
- `react-canvas-draw` (instalado con --legacy-peer-deps)

## 🎯 Próximos Pasos (Opcionales)

1. Implementar replay del proceso de dibujo usando `drawing_data`
2. Agregar filtros y búsqueda en la galería
3. Permitir edición de títulos y descripciones
4. Agregar exportación de análisis en PDF
5. Implementar comparación entre dibujos del mismo estudiante

