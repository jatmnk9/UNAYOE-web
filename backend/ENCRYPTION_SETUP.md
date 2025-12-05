# 🔐 Configuración de Encriptación

## 📋 Resumen

Se ha implementado encriptación para datos sensibles en las siguientes tablas:

### Tabla `usuarios`
- ✅ `foto_perfil_url`
- ✅ `face_encoding`
- ✅ `nombre`
- ✅ `apellido`
- ✅ `dni`
- ✅ `edad`
- ✅ `direccion`

### Tabla `notas`
- ✅ `nota`
- ✅ `tokens`

### Tabla `drawings`
- ✅ `titulo`
- ✅ `descripcion`
- ✅ `imagen_url`

## 🚀 Configuración Inicial

### 1. Generar Clave de Encriptación

Ejecuta el script para generar una clave segura:

```bash
cd backend
python generate_encryption_key.py
```

Esto generará una clave como:
```
gAAAAABh... (clave base64)
```

### 2. Configurar Variable de Entorno

Agrega la clave a tu archivo `.env`:

```env
ENCRYPTION_KEY=gAAAAABh... (la clave generada)
```

### 3. Instalar Dependencias

Asegúrate de tener `cryptography` instalado:

```bash
pip install cryptography
```

## 🔧 Funcionamiento

### Encriptación Automática

- **Al insertar/actualizar**: Los campos sensibles se encriptan automáticamente antes de guardarse en la base de datos
- **Al leer**: Los campos sensibles se desencriptan automáticamente antes de enviarse al frontend

### Servicio de Encriptación

El servicio `EncryptionService` usa:
- **Fernet** (symmetric encryption) de la biblioteca `cryptography`
- **PBKDF2** para derivar claves desde contraseñas (si se proporciona una cadena en lugar de una clave base64)

## ⚠️ Importante

1. **Backup de la clave**: Guarda la clave de encriptación en un lugar seguro. Si la pierdes, no podrás desencriptar los datos.

2. **Datos existentes**: Los datos que ya existen en la base de datos NO estarán encriptados hasta que se actualicen. Considera crear un script de migración si es necesario.

3. **Seguridad**: 
   - Nunca subas el archivo `.env` al repositorio
   - Usa diferentes claves para desarrollo y producción
   - Rota las claves periódicamente en producción

## 📝 Endpoints Afectados

### Usuarios
- `POST /usuarios/estudiantes` - Encripta al crear
- `POST /usuarios/psicologos` - Encripta al crear
- `POST /login` - Desencripta al leer
- `POST /face/register` - Encripta al actualizar
- `POST /face/verify` - Desencripta al leer
- `GET /psychologist/students` - Desencripta al leer
- `GET /psychologist/students-alerts` - Desencripta al leer

### Notas
- `POST /notas` - Encripta al crear
- `GET /notas/{user_id}` - Desencripta al leer

### Dibujos
- `POST /drawings/upload` - Encripta al crear
- `GET /drawings/student/{user_id}` - Desencripta al leer
- `GET /drawings/psychologist/{psychologist_id}` - Desencripta al leer

## 🧪 Pruebas

Para verificar que la encriptación funciona:

1. Crea un usuario nuevo y verifica que los campos sensibles estén encriptados en la base de datos
2. Lee el usuario y verifica que los campos se desencripten correctamente
3. Verifica que el frontend reciba los datos desencriptados

## 🔄 Migración de Datos Existentes

Si tienes datos existentes sin encriptar, necesitarás:

1. Crear un script que lea todos los registros
2. Encriptar los campos sensibles
3. Actualizar los registros en la base de datos

**Nota**: Este proceso debe hacerse con cuidado y con backups previos.

