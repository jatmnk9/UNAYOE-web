# 📋 Configuración de Supabase para Dibujos

## 🗄️ Tabla: `drawings`

Crea una nueva tabla en Supabase con el siguiente SQL:

```sql
CREATE TABLE public.drawings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo TEXT,
    descripcion TEXT,
    imagen_url TEXT NOT NULL, -- URL de la imagen en Supabase Storage
    drawing_data JSONB, -- Datos del canvas draw (para replay)
    tipo_dibujo TEXT DEFAULT 'uploaded', -- 'uploaded' o 'canvas'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX idx_drawings_usuario_id ON public.drawings(usuario_id);
CREATE INDEX idx_drawings_created_at ON public.drawings(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.drawings ENABLE ROW LEVEL SECURITY;

-- Política: Los estudiantes solo pueden ver sus propios dibujos
CREATE POLICY "Estudiantes pueden ver sus propios dibujos"
    ON public.drawings FOR SELECT
    USING (auth.uid() = usuario_id);

-- Política: Los estudiantes pueden insertar sus propios dibujos
CREATE POLICY "Estudiantes pueden insertar sus propios dibujos"
    ON public.drawings FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

-- Política: Los psicólogos pueden ver dibujos de sus estudiantes
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

## 🪣 Bucket: `student_drawings`

Crea un nuevo bucket en Supabase Storage:

1. Ve a **Storage** en el panel de Supabase
2. Crea un nuevo bucket llamado: `student_drawings`
3. Configura las políticas:

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

## 📝 Notas Importantes

- **Estructura de archivos**: Los dibujos se almacenan como `{user_id}/{drawing_id}.png` o `.jpg`
- **Tipo de dibujo**: 
  - `uploaded`: Imagen subida desde el PC
  - `canvas`: Dibujo creado con React Canvas Draw
- **drawing_data**: Para dibujos tipo `canvas`, almacena el JSON de `getSaveData()` para poder reproducir el proceso de dibujo

