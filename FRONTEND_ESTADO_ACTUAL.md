# 📋 ESTADO ACTUAL DEL FRONTEND - UNAYOE Web

> **Documento de Arquitectura y Estado Actual**
> **Fecha:** 2025-12-02
> **Propósito:** Documentación completa del estado actual del frontend para facilitar la refactorización y acoplamiento con nueva versión
> **Versión del Proyecto:** 0.0.0

---

## 📑 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Sistema de Routing](#sistema-de-routing)
6. [Gestión de Estado](#gestión-de-estado)
7. [Componentes](#componentes)
8. [Páginas](#páginas)
9. [Servicios](#servicios)
10. [Estilos y Diseño](#estilos-y-diseño)
11. [Configuraciones](#configuraciones)
12. [Dependencias Externas](#dependencias-externas)
13. [Patrones de Desarrollo](#patrones-de-desarrollo)
14. [Puntos de Integración con Backend](#puntos-de-integración-con-backend)
15. [Oportunidades de Refactorización](#oportunidades-de-refactorización)

---

## 1. Resumen Ejecutivo

### 🎯 Descripción del Proyecto
**UNAYOE Web** es una plataforma de bienestar emocional para estudiantes universitarios que permite:
- Registro diario de emociones mediante un diario personal
- Análisis de sentimientos y emociones con IA
- Recomendaciones personalizadas (PsicoTips)
- Gestión de citas con psicólogos
- Portal diferenciado para estudiantes y psicólogos

### 🏗️ Arquitectura Principal
- **Framework:** React 19.1.1
- **Bundler:** Vite 7.1.7
- **Routing:** React Router DOM v7.9.3
- **Estilos:** Tailwind CSS v4.1.14 + CSS global personalizado
- **Estado:** Context API (AuthContext)
- **UI Components:** Componentes personalizados + Radix UI + shadcn/ui
- **Visualización de Datos:** Recharts v3.2.1

### 👥 Roles de Usuario
1. **Estudiante:** Acceso a diario, recomendaciones, citas, favoritos
2. **Psicólogo:** Acceso a seguimiento de estudiantes, gestión de citas, reportes

---

## 2. Arquitectura General

### 📐 Diagrama de Arquitectura

```
frontend/
├── index.html (Punto de entrada HTML)
├── src/
│   ├── main.jsx (Punto de entrada React)
│   ├── App.jsx (Definición de rutas y lógica de navegación)
│   ├── context/ (Gestión de estado global)
│   ├── pages/ (Vistas principales)
│   ├── components/ (Componentes reutilizables)
│   ├── services/ (Servicios de API)
│   ├── config/ (Configuraciones)
│   ├── lib/ (Utilidades)
│   └── styles/ (Estilos específicos)
├── global.css (Estilos globales)
└── public/ (Recursos estáticos)
```

### 🔄 Flujo de Datos

```
Usuario → Componente/Página → Service (API) → Backend (FastAPI)
                ↓
          AuthContext (Estado Global)
                ↓
          localStorage (Persistencia)
```

---

## 3. Estructura de Carpetas

### 📂 Estructura Detallada

```
frontend/
│
├── public/                          # Recursos estáticos
│   ├── fondo.png                   # Imagen de fondo del login
│   ├── home.png                    # Imagen del landing page
│   ├── isotipo.png                 # Logo de UNAYOE
│   ├── logo.png                    # Logo completo
│   └── vite.svg                    # Favicon de Vite
│
├── src/
│   │
│   ├── ai/                         # Módulos de IA (Genkit - No utilizados actualmente)
│   │   ├── dev.ts
│   │   ├── genkit.ts
│   │   └── flows/
│   │       ├── analyze-feedback-flow.ts
│   │       ├── chat-flow.ts
│   │       └── summarize-multiple-texts.ts
│   │
│   ├── components/                 # Componentes reutilizables
│   │   ├── Charts.jsx             # Gráficos de estadísticas (Recharts)
│   │   ├── NavBar.jsx             # (Archivo vacío - no utilizado)
│   │   ├── ProtectedRoute.jsx     # (No utilizado - lógica en App.jsx)
│   │   ├── TestTypeScript.tsx     # (Componente de prueba)
│   │   └── ui/                    # Componentes UI base
│   │       ├── button.jsx         # Botón reutilizable
│   │       └── card.jsx           # Cards reutilizables
│   │
│   ├── config/                    # Configuraciones
│   │   └── config.js              # (Archivo vacío)
│   │
│   ├── context/                   # Gestión de estado global
│   │   └── AuthContext.jsx        # Contexto de autenticación
│   │
│   ├── lib/                       # Utilidades y helpers
│   │   ├── mock-calendar-events.ts
│   │   ├── utils.js               # Utilidades generales
│   │   └── utils.ts               # Utilidades TypeScript
│   │
│   ├── pages/                     # Páginas principales
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Página de login
│   │   ├── Signup.jsx             # Página de registro
│   │   │
│   │   ├── StudentPortal.jsx      # Layout del portal estudiante
│   │   ├── StudentDashboard.jsx   # Dashboard del estudiante
│   │   ├── MiDiarioDeBienestar.jsx # Diario de emociones
│   │   ├── Recomendaciones.jsx    # PsicoTips
│   │   ├── MisFavoritos.jsx       # Recomendaciones favoritas
│   │   ├── StudentAttendance.jsx  # Asistencia del estudiante
│   │   │
│   │   ├── PsychologistPortal.jsx      # Layout del portal psicólogo
│   │   ├── PsychologistDashboard.jsx   # Dashboard del psicólogo
│   │   ├── SeguimientoDiario.jsx       # Lista de estudiantes
│   │   ├── StudentReport.jsx           # Reporte de estudiante
│   │   ├── SeguimientoCitas.jsx        # Seguimiento de citas
│   │   ├── StudentAttendanceReport.jsx # Reporte de asistencia
│   │   │
│   │   └── citas/                 # Módulo de gestión de citas
│   │       ├── estudiante/
│   │       │   ├── MisCitas.jsx        # Lista de citas del estudiante
│   │       │   ├── CrearCita.jsx       # Formulario crear cita
│   │       │   └── EditarCita.jsx      # Formulario editar cita
│   │       └── psicologo/
│   │           ├── CitasAsignadas.jsx      # Citas del psicólogo
│   │           ├── DashboardCitas.jsx      # Dashboard de citas
│   │           └── AsignarPsicologoModal.jsx # Modal asignar psicólogo
│   │
│   ├── services/                  # Servicios de API
│   │   └── citasService.js        # Servicio de gestión de citas
│   │
│   ├── styles/                    # Estilos específicos
│   │   └── Recomendaciones.css    # Estilos de PsicoTips
│   │
│   ├── App.jsx                    # Definición de rutas
│   ├── main.jsx                   # Punto de entrada de React
│   └── supabaseClient.js          # Cliente de Supabase
│
├── global.css                     # Estilos globales
├── index.html                     # HTML base
├── package.json                   # Dependencias del proyecto
├── vite.config.js                # Configuración de Vite
├── tailwind.config.js            # Configuración de Tailwind (si existe)
├── tsconfig.json                 # Configuración de TypeScript
├── tsconfig.node.json            # Configuración TS para Node
└── eslint.config.js              # Configuración de ESLint
```

---

## 4. Stack Tecnológico

### 📦 Dependencias Principales

#### **Core**
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.3"
}
```

#### **UI y Estilos**
```json
{
  "@tailwindcss/cli": "^4.1.14",
  "@tailwindcss/vite": "^4.1.14",
  "tailwindcss": "^4.1.14",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.3.1",
  "lucide-react": "^0.544.0",
  "framer-motion": "^12.23.24"
}
```

#### **Componentes UI (Radix UI)**
```json
{
  "@radix-ui/react-dialog": "^1.1.15",
  "@radix-ui/react-label": "^2.1.7",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-slot": "^1.2.3"
}
```

#### **Formularios y Validación**
```json
{
  "react-hook-form": "^7.64.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.12"
}
```

#### **Visualización de Datos**
```json
{
  "recharts": "^3.2.1"
}
```

#### **Backend y Servicios**
```json
{
  "@supabase/supabase-js": "^2.75.0",
  "axios": "^1.12.2",
  "date-fns": "^4.1.0"
}
```

#### **Build y Development**
```json
{
  "vite": "^7.1.7",
  "@vitejs/plugin-react": "^5.0.4",
  "typescript": "^5.9.3",
  "eslint": "^9.36.0",
  "webpack": "^5.102.0",
  "webpack-cli": "^6.0.1"
}
```

---

## 5. Sistema de Routing

### 🛤️ Configuración de Rutas

**Archivo:** `src/App.jsx`

#### **Estructura de Routing**

```jsx
<BrowserRouter>
  <AuthProvider>
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Portal Estudiante (Rutas Anidadas) */}
      <Route path="/student" element={<PrivateRoute role="estudiante"><StudentPortal /></PrivateRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="diario" element={<MiDiarioDeBienestar />} />
        <Route path="recomendaciones" element={<Recomendaciones />} />
        <Route path="favoritos" element={<MisFavoritos />} />
        <Route path="asistencia" element={<StudentAttendance />} />
        <Route path="seguimiento-citas" element={<SeguimientoCitas />} />
        <Route path="citas" element={<MisCitas />} />
        <Route path="citas/crear" element={<CrearCita />} />
        <Route path="citas/editar/:id" element={<EditarCita />} />
      </Route>

      {/* Portal Psicólogo (Rutas Anidadas) */}
      <Route path="/psychologist" element={<PrivateRoute role="psicologo"><PsychologistPortal /></PrivateRoute>}>
        <Route index element={<PsychologistDashboard />} />
        <Route path="seguimiento" element={<SeguimientoDiario />} />
        <Route path="seguimiento/:studentId" element={<StudentReport />} />
        <Route path="seguimiento-citas" element={<SeguimientoCitas />} />
        <Route path="citas" element={<CitasAsignadas />} />
        <Route path="citas/dashboard" element={<DashboardCitas />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

#### **Componente de Protección de Rutas**

```jsx
function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  if (role && user.rol !== role) {
    if (user.rol === "estudiante") return <Navigate to="/student" />;
    if (user.rol === "psicologo") return <Navigate to="/psychologist" />;
    return <Navigate to="/" />;
  }

  return children;
}
```

#### **Redirecciones Automáticas**
- Usuario logueado intenta acceder a `/login` → Redirige a su portal según rol
- Usuario no logueado intenta acceder a ruta privada → Redirige a `/login`
- Usuario con rol incorrecto → Redirige a su portal correspondiente

---

## 6. Gestión de Estado

### 🔐 AuthContext (Contexto de Autenticación)

**Archivo:** `src/context/AuthContext.jsx`

#### **Estructura del Estado**

```javascript
{
  user: {
    id: "uuid",
    email: "usuario@ejemplo.com",
    rol: "estudiante" | "psicologo",
    nombre: "Nombre del Usuario",
    access_token: "token_jwt",
    refresh_token: "refresh_token_jwt"
  } | null
}
```

#### **Funciones Disponibles**

```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Inicializar usuario desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    // Redirige según rol
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### **Persistencia**
- **localStorage:** Se guarda el objeto `user` completo
- **Clave:** `"user"`
- **Restauración:** Al cargar la aplicación, se lee de localStorage

---

## 7. Componentes

### 🧩 Componentes Reutilizables

#### **7.1 Components/ui/button.jsx**

```jsx
export function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white
                  font-medium rounded-xl shadow-md transition-all ${className}`}
    >
      {children}
    </button>
  );
}
```

**Uso:**
- Botones genéricos en formularios
- Acciones principales en cards

---

#### **7.2 Components/ui/card.jsx**

```jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) { ... }
export function CardTitle({ children, className = "" }) { ... }
export function CardContent({ children, className = "" }) { ... }
```

**Uso:**
- Tarjetas de información en dashboards
- Containers de contenido

---

#### **7.3 Components/Charts.jsx**

```jsx
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Charts({ data }) {
  const sentiments = Object.entries(data.sentiments || {}).map(([name, value]) => ({ name, value }));
  const emotions = Object.entries(data.emotions || {}).map(([name, value]) => ({ name, value }));
  const terms = data.termFrequency || [];

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      {/* Gráfico de Sentimientos */}
      <PieChart>...</PieChart>

      {/* Gráfico de Emociones */}
      <PieChart>...</PieChart>

      {/* Gráfico de Términos Frecuentes */}
      <BarChart>...</BarChart>
    </div>
  );
}
```

**Uso:**
- Visualización de análisis de sentimientos en `StudentReport.jsx`
- Estadísticas del psicólogo

---

#### **7.4 Componentes No Utilizados**

| Archivo | Estado | Notas |
|---------|--------|-------|
| `NavBar.jsx` | ❌ Vacío | No se utiliza navegación global |
| `ProtectedRoute.jsx` | ❌ No usado | La lógica está directamente en App.jsx |
| `TestTypeScript.tsx` | ⚠️ Prueba | Componente de testing |

---

## 8. Páginas

### 📄 Páginas Principales

#### **8.1 Home.jsx** (Landing Page)

**Ruta:** `/`

**Funcionalidad:**
- Página de bienvenida pública
- Descripción del sistema UNAYOE
- Botones de acceso a portales (Estudiante/Psicólogo)
- Cards de características (Diario Privado, Reportes Inteligentes, Evolución Continua)

**Estructura:**
```jsx
<div className="app-container">
  <div className="app-background"></div>

  {/* Header */}
  <header className="header">
    <h1 className="logo">UNAYOE Bienestar</h1>
    <nav className="nav-desktop">
      <NavButton to="/student">Portal Estudiante</NavButton>
      <NavButton to="/psychologist">Portal Psicólogo</NavButton>
    </nav>
  </header>

  {/* Hero Section */}
  <main className="main-content">
    <section className="hero-section">
      <div className="hero-text">
        <h2 className="hero-title">Empieza tu Viaje de Crecimiento Personal</h2>
        <p className="hero-subtitle">...</p>
      </div>
      <div className="hero-image-wrapper">
        <img src="/home.png" alt="..." />
      </div>
    </section>

    {/* Features */}
    <section className="features-section">
      <FeatureCard icon={BookOpen} title="Diario Privado" ... />
      <FeatureCard icon={User} title="Reportes Inteligentes" ... />
      <FeatureCard icon={Heart} title="Evolución Continua" ... />
    </section>
  </main>

  {/* Footer */}
  <footer className="footer">...</footer>
</div>
```

---

#### **8.2 Login.jsx**

**Ruta:** `/login`

**Funcionalidad:**
- Formulario de autenticación
- Validación de credenciales
- Redirección automática según rol
- Link a página de registro

**Estructura:**
```jsx
<div className="login-bg">
  <div className="login-card">
    <div className="login-header-wrapper">
      <img src="/isotipo.png" alt="UNAYOE Isotipo" />
      <h1 className="login-title">UNAYOE</h1>
      <div className="sidebar-logo-light">Portal de Bienestar</div>
    </div>

    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="Correo institucional" ... />
      <input type="password" placeholder="Contraseña" ... />
      <button type="submit">Entrar</button>
    </form>

    <div>¿Aún no tienes una cuenta? <Link to="/signup">Regístrate</Link></div>
  </div>
</div>
```

**Estados:**
```javascript
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

**Lógica:**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  await login(email, password); // Llama a AuthContext
};
```

---

#### **8.3 StudentPortal.jsx** (Layout Estudiante)

**Ruta:** `/student` (+ rutas anidadas)

**Funcionalidad:**
- Layout con sidebar de navegación
- Renderiza rutas anidadas con `<Outlet />`
- Navegación entre módulos del estudiante

**Estructura:**
```jsx
<div className="portal-layout-container">
  {/* Sidebar */}
  <aside className="portal-sidebar">
    <h1 className="sidebar-logo">
      <img src="/isotipo.png" />
      <span>UNAYOE</span>
      <div className="sidebar-logo-light">Bienestar</div>
    </h1>

    <div className="sidebar-user-header">
      <p className="sidebar-user-email">Conectado como: {user?.email}</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>

    <nav className="sidebar-nav">
      <Link to="/student">Dashboard</Link>
      <Link to="/student/diario">Mi Diario de Bienestar</Link>
      <Link to="/student/recomendaciones">PsicoTips</Link>
      <Link to="/student/favoritos">Mis favoritos</Link>
      <Link to="/student/citas">Mis Citas</Link>
    </nav>
  </aside>

  {/* Contenido Principal */}
  <main className="portal-main-content">
    <Outlet /> {/* Renderiza las rutas anidadas */}
  </main>
</div>
```

**Navegación Activa:**
```javascript
const getNavLinkClass = (path) => {
  const currentPath = location.pathname;
  if (path === baseUrl) {
    return currentPath === baseUrl ? "sidebar-nav-button active" : "sidebar-nav-button";
  }
  return currentPath === path ? "sidebar-nav-button active" : "sidebar-nav-button";
};
```

---

#### **8.4 MiDiarioDeBienestar.jsx**

**Ruta:** `/student/diario`

**Funcionalidad:**
- Formulario para escribir notas diarias
- Análisis de sentimiento y emoción con IA (backend)
- Historial de notas con resultados del análisis
- Visualización de emociones detectadas

**Estructura:**
```jsx
<div className="portal-main-content">
  <div className="login-card">
    <h1>Mi Diario de Bienestar 🧘‍♀️</h1>
    <p>Escribe cómo te sientes hoy...</p>

    {/* Formulario */}
    <textarea value={note} onChange={(e) => setNote(e.target.value)} ... />
    <button onClick={handleAddNote}>Guardar y Analizar</button>

    {/* Historial */}
    <div>
      <h2>Historial de Notas</h2>
      {notes.map((n) => (
        <div key={n.id}>
          <p>{n.nota}</p>
          <span>Sentimiento: {n.sentimiento}</span>
          <span>Emoción: {n.emocion} ({n.emocion_score * 100}%)</span>
          <p>{new Date(n.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  </div>
</div>
```

**Estados:**
```javascript
const [note, setNote] = useState("");
const [notes, setNotes] = useState([]);
const [loading, setLoading] = useState(false);
const [notesLoading, setNotesLoading] = useState(false);
```

**API Calls:**
```javascript
// Obtener notas del usuario
const fetchNotes = async (userId) => {
  const res = await fetch(`http://127.0.0.1:8000/notas/${userId}`);
  const result = await res.json();
  setNotes(result.data || []);
};

// Crear nueva nota
const handleAddNote = async () => {
  const res = await fetch("http://127.0.0.1:8000/notas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note, user_id: user.id }),
  });
  // ...
};
```

---

#### **8.5 Recomendaciones.jsx** (PsicoTips)

**Ruta:** `/student/recomendaciones`

**Funcionalidad:**
- Muestra todas las recomendaciones disponibles
- Recomendación personalizada basada en última emoción
- Sistema de likes/favoritos
- Modal para recomendación personalizada

**Componentes:**
```jsx
// Modal de Recomendación Personalizada
const RecomendacionModal = ({ personalizada, emocion, likes, toggleLike, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content">
        <header className="modal-header">
          <h2>Tu recomendación personalizada 💭</h2>
          <button className="close-btn" onClick={onClose}><X /></button>
        </header>

        <div className="emocion-info">
          <p>Emoción detectada: {emocion.emocion}</p>
          <p>Sentimiento detectado: {emocion.sentimiento}</p>
        </div>

        <div className="recomendacion-box">
          <h3>{personalizada.titulo}</h3>
          <img src={personalizada.miniatura} />
          <p>{personalizada.descripcion}</p>
          <a href={personalizada.url} target="_blank">Leer más →</a>
        </div>
      </div>
    </div>
  );
};
```

**Estados:**
```javascript
const [todas, setTodas] = useState([]);
const [personalizada, setPersonalizada] = useState(null);
const [likes, setLikes] = useState([]);
const [loading, setLoading] = useState(false);
const [emocion, setEmocion] = useState(null);
const [mostrarModal, setMostrarModal] = useState(false);
```

**API Calls:**
```javascript
// Obtener todas las recomendaciones
fetch("http://127.0.0.1:8000/recomendaciones/todas");

// Obtener likes del usuario
fetch(`http://127.0.0.1:8000/likes/${user.id}`);

// Obtener recomendación personalizada
fetch(`http://127.0.0.1:8000/recomendaciones/${user.id}`);

// Toggle like
fetch(`http://127.0.0.1:8000/likes/${user.id}/${recId}`, { method: "POST" | "DELETE" });
```

---

#### **8.6 MisCitas.jsx** (Gestión de Citas - Estudiante)

**Ruta:** `/student/citas`

**Funcionalidad:**
- Lista de citas del estudiante
- Estado de citas (Pendiente/Confirmada)
- Información del psicólogo asignado
- Acciones: Editar, Cancelar
- Botón para crear nueva cita

**Estructura:**
```jsx
<div className="container mx-auto px-4 py-8 max-w-6xl">
  {/* Header */}
  <div className="flex justify-between items-center mb-8">
    <h1>Mis Citas</h1>
    <Link to="/student/citas/crear">Nueva Cita</Link>
  </div>

  {/* Grid de Citas */}
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {citas.map((cita) => (
      <div key={cita.id_cita} className="bg-white border rounded-lg p-6">
        {/* Estado */}
        {cita.id_psicologo ? (
          <span className="bg-green-100 text-green-800">Confirmada</span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800">Pendiente de asignación</span>
        )}

        {/* Información */}
        <h3>{cita.titulo}</h3>
        <div><Calendar /> {formatearFecha(cita.fecha_cita)}</div>

        {/* Psicólogo */}
        {cita.id_psicologo && (
          <div className="bg-blue-50">
            <User /> Psicólogo Asignado
            <p>{cita.nombre_psicologo} {cita.apellido_psicologo}</p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2">
          <Link to={`/student/citas/editar/${cita.id_cita}`}>Editar</Link>
          <button onClick={() => handleEliminar(cita.id_cita)}>Cancelar</button>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Estados:**
```javascript
const [citas, setCitas] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
```

**API Calls:**
```javascript
// Obtener citas del usuario
const cargarCitas = async () => {
  const data = await citasService.obtenerCitasUsuario(user.id);
  setCitas(data.citas_creadas || []);
};

// Eliminar cita
const handleEliminar = async (idCita) => {
  await citasService.eliminarCita(idCita, user.id);
  cargarCitas();
};
```

---

#### **8.7 PsychologistPortal.jsx** (Layout Psicólogo)

**Ruta:** `/psychologist` (+ rutas anidadas)

**Funcionalidad:**
- Layout con sidebar de navegación para psicólogos
- Renderiza rutas anidadas con `<Outlet />`

**Módulos:**
- Dashboard
- Seguimiento Diario
- Seguimiento de Citas
- Citas Asignadas
- Dashboard de Citas

**Estructura:**
```jsx
<div className="portal-layout-container">
  <aside className="portal-sidebar">
    <h1 className="sidebar-logo">UNAYOE <div>Psicólogo</div></h1>

    <div className="sidebar-user-header">
      <p>Conectado como: {user?.email}</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>

    <nav className="sidebar-nav">
      <Link to="/psychologist">Dashboard</Link>
      <Link to="/psychologist/seguimiento">Seguimiento Diario</Link>
      <Link to="/psychologist/seguimiento-citas">Seguimiento de Citas</Link>
      <Link to="/psychologist/citas">Citas Asignadas</Link>
      <Link to="/psychologist/citas/dashboard">Dashboard de Citas</Link>
    </nav>
  </aside>

  <main className="portal-main-content">
    <Outlet />
  </main>
</div>
```

---

#### **8.8 SeguimientoDiario.jsx**

**Ruta:** `/psychologist/seguimiento`

**Funcionalidad:**
- Lista de estudiantes asignados al psicólogo
- Botón para ver reporte individual de cada estudiante

**Estructura:**
```jsx
<div className="portal-main-content">
  <div className="login-card">
    <h2>Seguimiento Diario de Pacientes</h2>

    <button onClick={() => navigate('/psychologist')}>← Volver al Portal</button>

    <table>
      <thead>
        <tr>
          <th>Nombre Completo</th>
          <th>Código</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.nombre} {student.apellido}</td>
            <td>{student.codigo_alumno}</td>
            <td>
              <button onClick={() => handleViewReport(student.id)}>
                Ver Reporte
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Estados:**
```javascript
const [students, setStudents] = useState([]);
const [loading, setLoading] = useState(true);
```

**API Calls:**
```javascript
const fetchStudents = async () => {
  const res = await fetch('http://127.0.0.1:8000/psychologist/students');
  const result = await res.json();
  setStudents(result.data || []);
};
```

---

## 9. Servicios

### 🔌 API Services

#### **9.1 citasService.js**

**Archivo:** `src/services/citasService.js`

**Base URL:** `http://localhost:8000/citas`

**Funciones Disponibles:**

```javascript
const citasService = {
  // 1. Crear Nueva Cita
  crearCita: async (idUsuario, citaData) => {
    // POST /citas?id_usuario={uuid}
    // Body: { titulo, fecha_cita }
  },

  // 2. Obtener Citas Pendientes (sin psicólogo asignado)
  obtenerCitasPendientes: async () => {
    // GET /citas/pendientes
  },

  // 3. Obtener Todas las Citas
  obtenerTodasLasCitas: async () => {
    // GET /citas/todas
  },

  // 4. Obtener Citas de un Usuario
  obtenerCitasUsuario: async (idUsuario) => {
    // GET /citas/usuario/{id_usuario}
  },

  // 5. Obtener Detalle de una Cita
  obtenerDetalleCita: async (idCita) => {
    // GET /citas/{id_cita}
  },

  // 6. Asignar Psicólogo a una Cita
  asignarPsicologo: async (idCita, idPsicologo) => {
    // PUT /citas/{id_cita}/asignar-psicologo
    // Body: { id_psicologo }
  },

  // 7. Actualizar una Cita
  actualizarCita: async (idCita, idUsuario, citaData) => {
    // PUT /citas/{id_cita}?id_usuario={uuid}
    // Body: { titulo?, fecha_cita? }
  },

  // 8. Eliminar una Cita
  eliminarCita: async (idCita, idUsuario) => {
    // DELETE /citas/{id_cita}?id_usuario={uuid}
  },

  // 9. Obtener Psicólogos Disponibles
  obtenerPsicologosDisponibles: async () => {
    // GET /citas/psicologos/disponibles
  },
};
```

**Manejo de Errores:**
```javascript
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
    throw new Error(error.detail || `Error ${response.status}`);
  }
  return response.json();
};
```

---

#### **9.2 Otros Servicios**

**API Calls Directas (sin servicio centralizado):**

| Endpoint | Método | Descripción | Usado en |
|----------|--------|-------------|----------|
| `/login` | POST | Autenticación | AuthContext |
| `/notas` | POST | Crear nota | MiDiarioDeBienestar |
| `/notas/{userId}` | GET | Obtener notas | MiDiarioDeBienestar |
| `/recomendaciones/todas` | GET | Obtener recomendaciones | Recomendaciones |
| `/recomendaciones/{userId}` | GET | Recomendación personalizada | Recomendaciones |
| `/likes/{userId}` | GET | Obtener likes | Recomendaciones |
| `/likes/{userId}/{recId}` | POST/DELETE | Toggle like | Recomendaciones |
| `/psychologist/students` | GET | Lista de estudiantes | SeguimientoDiario |

---

## 10. Estilos y Diseño

### 🎨 Sistema de Estilos

#### **10.1 Global CSS**

**Archivo:** `global.css`

**Paleta de Colores:**
```css
:root {
  /* Paleta de Colores UNAYOE */
  --color-primary: #A3D2CA;    /* Verde Calma */
  --color-accent: #F7B09E;     /* Coral Optimista */
  --color-dark: #333333;       /* Gris Carbón */
  --color-soft-bg: #F0F5F5;    /* Fondo Suave */
  --color-white: #FFFFFF;
  --color-text-gray: #6b7280;

  /* Sombras */
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  /* Radios */
  --radius-xl: 1.5rem;
  --radius-md: 0.75rem;
}
```

**Tipografía:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');

body, html {
  font-family: 'Inter', sans-serif !important;
}
```

**Componentes Principales:**

| Clase | Descripción |
|-------|-------------|
| `.app-container` | Contenedor principal de la aplicación |
| `.app-background` | Fondo degradado fijo |
| `.header` | Barra de navegación superior |
| `.logo` | Logo de UNAYOE |
| `.nav-button` | Botones de navegación |
| `.hero-section` | Sección hero del landing page |
| `.feature-card` | Cards de características |
| `.login-card` | Tarjeta de login/formulario |
| `.portal-layout-container` | Container del layout portal |
| `.portal-sidebar` | Barra lateral del portal |
| `.sidebar-nav-button` | Botones de navegación del sidebar |
| `.portal-main-content` | Contenido principal del portal |

---

#### **10.2 Tailwind CSS**

**Configuración:** Tailwind CSS v4.1.14 con plugin de Vite

**Variables de Tailwind (shadcn/ui):**
```css
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --accent: oklch(0.97 0 0);
  /* ... más variables de shadcn/ui */
}
```

**Utilidades Personalizadas:**
- Grid responsivo para features
- Animaciones de entrada (fadeIn, slideInLeft, slideInRight)
- Hover effects en cards y botones

---

#### **10.3 Estilos Específicos**

**Recomendaciones.css:**
```css
/* Archivo: src/styles/Recomendaciones.css */

.recs-container { ... }
.recs-header { ... }
.recs-grid { ... }
.rec-card { ... }
.modal-overlay { ... }
.modal-content { ... }
.heart-btn { ... }
```

---

#### **10.4 Responsive Design**

**Breakpoints:**
```css
/* Móvil: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */

@media (max-width: 768px) {
  .portal-sidebar {
    position: fixed;
    width: 100%;
    height: auto;
  }
}

@media (min-width: 640px) {
  .nav-desktop { display: flex; }
  .nav-mobile { display: none; }
  .hero-grid { flex-direction: row; }
}
```

---

## 11. Configuraciones

### ⚙️ Archivos de Configuración

#### **11.1 vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Características:**
- Plugin de React
- Plugin de Tailwind CSS
- Alias `@` apunta a `./src`

---

#### **11.2 package.json - Scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

#### **11.3 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

#### **11.4 eslint.config.js**

```javascript
// Configuración de ESLint con react-hooks y react-refresh
```

---

## 12. Dependencias Externas

### 📚 Integraciones

#### **12.1 Supabase**

**Archivo:** `src/supabaseClient.js`

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xygadfvudziwnddcicbb.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Uso Actual:**
- ⚠️ Cliente configurado pero **no utilizado actualmente**
- Posible uso futuro para autenticación o base de datos

---

#### **12.2 Backend API**

**Base URL:** `http://127.0.0.1:8000` (FastAPI)

**Endpoints Principales:**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/login` | POST | Autenticación de usuario |
| `/notas` | POST | Crear nota de diario |
| `/notas/{userId}` | GET | Obtener notas del usuario |
| `/recomendaciones/todas` | GET | Obtener todas las recomendaciones |
| `/recomendaciones/{userId}` | GET | Recomendación personalizada |
| `/likes/{userId}` | GET | Obtener favoritos del usuario |
| `/likes/{userId}/{recId}` | POST/DELETE | Toggle favorito |
| `/psychologist/students` | GET | Estudiantes del psicólogo |
| `/citas/*` | CRUD | Gestión de citas |

---

## 13. Patrones de Desarrollo

### 🏗️ Convenciones y Patrones

#### **13.1 Estructura de Componentes**

**Patrón Funcional con Hooks:**
```jsx
export default function ComponentName() {
  // 1. Hooks de React
  const [state, setState] = useState(initialValue);
  const navigate = useNavigate();

  // 2. Custom Hooks
  const { user } = useAuth();

  // 3. Funciones auxiliares
  const handleAction = async () => { ... };

  // 4. useEffect
  useEffect(() => { ... }, [dependencies]);

  // 5. Return JSX
  return ( ... );
}
```

---

#### **13.2 Gestión de Estados**

**Estados Locales:**
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState([]);
```

**Estado Global:**
```javascript
const { user, login, logout } = useAuth();
```

---

#### **13.3 Llamadas a API**

**Patrón de Fetch:**
```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const res = await fetch('http://127.0.0.1:8000/endpoint');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const result = await res.json();
    setData(result.data || []);
  } catch (error) {
    console.error("Error:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

#### **13.4 Navegación**

**Navegación Programática:**
```javascript
const navigate = useNavigate();

// Navegar a ruta
navigate('/student/citas');

// Navegar con parámetros
navigate(`/psychologist/seguimiento/${studentId}`);

// Navegar hacia atrás
navigate(-1);
```

**Navegación Declarativa:**
```jsx
<Link to="/student/diario">Mi Diario</Link>
```

---

#### **13.5 Condicional de Renderizado**

```jsx
{loading && <p>Cargando...</p>}

{error && <div className="error">{error}</div>}

{data.length === 0 ? (
  <p>No hay datos disponibles</p>
) : (
  <div>{data.map(item => ...)}</div>
)}
```

---

## 14. Puntos de Integración con Backend

### 🔗 Endpoints Utilizados

#### **Autenticación**

| Endpoint | Método | Body | Response |
|----------|--------|------|----------|
| `/login` | POST | `{ email, password }` | `{ user: { id, email, rol, nombre, access_token, refresh_token } }` |

---

#### **Diario de Bienestar**

| Endpoint | Método | Body | Response |
|----------|--------|------|----------|
| `/notas` | POST | `{ note, user_id }` | `{ data: [{ id, nota, sentimiento, emocion, emocion_score, created_at }] }` |
| `/notas/{userId}` | GET | - | `{ data: [...notas] }` |

---

#### **Recomendaciones**

| Endpoint | Método | Body | Response |
|----------|--------|------|----------|
| `/recomendaciones/todas` | GET | - | `{ data: [{ id, titulo, descripcion, miniatura, url }] }` |
| `/recomendaciones/{userId}` | GET | - | `{ data: [...], emocion_detectada, sentimiento_detectado }` |
| `/likes/{userId}` | GET | - | `[recId1, recId2, ...]` |
| `/likes/{userId}/{recId}` | POST | - | - |
| `/likes/{userId}/{recId}` | DELETE | - | - |

---

#### **Citas**

| Endpoint | Método | Params | Body | Response |
|----------|--------|--------|------|----------|
| `/citas` | POST | `?id_usuario={uuid}` | `{ titulo, fecha_cita }` | `{ ...cita }` |
| `/citas/pendientes` | GET | - | - | `[...citas]` |
| `/citas/todas` | GET | - | - | `[...citas]` |
| `/citas/usuario/{id}` | GET | - | - | `{ citas_creadas: [...], citas_asignadas: [...] }` |
| `/citas/{id}` | GET | - | - | `{ ...cita }` |
| `/citas/{id}/asignar-psicologo` | PUT | - | `{ id_psicologo }` | `{ ...cita }` |
| `/citas/{id}` | PUT | `?id_usuario={uuid}` | `{ titulo?, fecha_cita? }` | `{ ...cita }` |
| `/citas/{id}` | DELETE | `?id_usuario={uuid}` | - | - |
| `/citas/psicologos/disponibles` | GET | - | - | `[...psicologos]` |

---

#### **Psicólogo**

| Endpoint | Método | Body | Response |
|----------|--------|------|----------|
| `/psychologist/students` | GET | - | `{ data: [{ id, nombre, apellido, codigo_alumno }] }` |

---

## 15. Oportunidades de Refactorización

### 🔧 Áreas de Mejora

#### **15.1 Servicios API**

**Problema:** Llamadas fetch distribuidas en componentes

**Solución:**
- Centralizar todas las llamadas API en servicios dedicados (similar a `citasService.js`)
- Crear servicios para: `authService`, `notasService`, `recomendacionesService`, `psychologistService`

**Beneficios:**
- Código más mantenible
- Reutilización de lógica
- Manejo centralizado de errores
- Testing más fácil

---

#### **15.2 Gestión de Estado**

**Problema:** Solo se usa Context API para autenticación

**Solución:**
- Considerar Redux Toolkit, Zustand o Jotai para estado más complejo
- Separar estado de UI del estado de datos
- Implementar caching de datos

**Alternativas:**
```javascript
// Opción 1: Zustand (Simple)
import create from 'zustand'

const useStore = create((set) => ({
  notes: [],
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
}))

// Opción 2: React Query (Para datos de servidor)
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['notes', userId],
  queryFn: () => fetchNotes(userId),
})
```

---

#### **15.3 TypeScript**

**Problema:** Archivos mezclados `.jsx` y `.ts`

**Solución:**
- Migrar progresivamente a TypeScript
- Definir interfaces para datos de API
- Tipado fuerte de props y estados

**Ejemplo:**
```typescript
interface User {
  id: string;
  email: string;
  rol: 'estudiante' | 'psicologo';
  nombre: string;
  access_token: string;
  refresh_token: string;
}

interface Note {
  id: number;
  nota: string;
  sentimiento: 'POS' | 'NEG' | 'NEU';
  emocion: string;
  emocion_score: number;
  created_at: string;
}
```

---

#### **15.4 Componentes UI**

**Problema:** Componentes UI básicos + estilos inline

**Solución:**
- Completar implementación de shadcn/ui
- Eliminar estilos inline, usar clases CSS/Tailwind
- Crear design system consistente

**Componentes a desarrollar:**
- Modal reutilizable
- Formularios con validación
- Tablas con ordenamiento
- Loading states
- Toast notifications

---

#### **15.5 Validación de Formularios**

**Problema:** Validación mínima

**Solución:**
- Implementar `react-hook-form` + `zod` (ya instalados pero no usados)

**Ejemplo:**
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

---

#### **15.6 Manejo de Errores**

**Problema:** Manejo básico con `alert()` y `console.error()`

**Solución:**
- Boundary de errores de React
- Sistema de notificaciones/toasts
- Logging estructurado

**Ejemplo:**
```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Algo salió mal.</h1>;
    }
    return this.props.children;
  }
}
```

---

#### **15.7 Variables de Entorno**

**Problema:** URLs hardcoded en código

**Solución:**
```javascript
// .env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

// config.js
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
};
```

---

#### **15.8 Testing**

**Problema:** No hay tests

**Solución:**
- Unit tests con Vitest
- Integration tests con React Testing Library
- E2E tests con Playwright o Cypress

**Ejemplo:**
```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Login from './Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('Correo institucional')).toBeInTheDocument();
  });
});
```

---

#### **15.9 Optimización de Performance**

**Solución:**
- Code splitting con `React.lazy()` y `Suspense`
- Memoization con `React.memo()`, `useMemo()`, `useCallback()`
- Paginación/Infinite scroll para listas largas
- Optimistic updates

**Ejemplo:**
```jsx
const StudentReport = React.lazy(() => import('./pages/StudentReport'));

<Suspense fallback={<Loading />}>
  <StudentReport />
</Suspense>
```

---

#### **15.10 Accesibilidad**

**Solución:**
- ARIA labels
- Navegación por teclado
- Contraste de colores adecuado
- Formularios accesibles

---

#### **15.11 Estructura de Archivos**

**Propuesta de Reorganización:**

```
src/
├── features/                    # Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── diary/
│   ├── recommendations/
│   └── appointments/
├── shared/                      # Código compartido
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── layouts/                     # Layouts
│   ├── StudentLayout.tsx
│   └── PsychologistLayout.tsx
└── core/                        # Configuración core
    ├── router/
    ├── api/
    └── config/
```

---

## 16. Conclusiones y Recomendaciones

### ✅ Fortalezas Actuales

1. **Arquitectura Clara:** Separación entre estudiantes y psicólogos bien definida
2. **Routing Robusto:** Sistema de rutas anidadas con protección de roles
3. **UI Moderna:** Uso de Tailwind CSS y componentes modernos
4. **Integración Backend:** Comunicación funcional con FastAPI
5. **Diseño Responsivo:** Adaptación a diferentes tamaños de pantalla

---

### ⚠️ Puntos Críticos para Refactorización

1. **Centralizar Servicios API:** Crear capa de servicios consistente
2. **Migrar a TypeScript:** Para mejor mantenibilidad y menos bugs
3. **Implementar Gestión de Estado Avanzada:** Redux/Zustand para estado complejo
4. **Variables de Entorno:** Configuración centralizada y segura
5. **Testing:** Implementar suite de tests
6. **Manejo de Errores:** Sistema robusto de error boundaries y notificaciones

---

### 🚀 Roadmap de Refactorización Sugerido

#### **Fase 1: Fundamentos (2-3 semanas)**
- [ ] Configurar variables de entorno
- [ ] Crear servicios API centralizados
- [ ] Implementar error boundaries
- [ ] Setup de testing

#### **Fase 2: Mejoras de Estado (2 semanas)**
- [ ] Implementar React Query o Zustand
- [ ] Optimizar re-renders con memoization
- [ ] Implementar caching de datos

#### **Fase 3: TypeScript (3-4 semanas)**
- [ ] Migrar componentes críticos a TypeScript
- [ ] Definir interfaces de datos
- [ ] Tipado de servicios y hooks

#### **Fase 4: UI/UX (2 semanas)**
- [ ] Completar componentes shadcn/ui
- [ ] Sistema de notificaciones
- [ ] Mejoras de accesibilidad
- [ ] Animaciones y transiciones

#### **Fase 5: Testing y Documentación (2 semanas)**
- [ ] Tests unitarios de componentes
- [ ] Tests de integración
- [ ] Documentación de componentes
- [ ] Guía de contribución

---

### 📊 Métricas Actuales

| Métrica | Valor |
|---------|-------|
| **Componentes** | 15+ |
| **Páginas** | 20+ |
| **Rutas** | 15+ |
| **Servicios API** | 1 centralizado (citas), resto distribuido |
| **Líneas de CSS** | ~1000+ |
| **Dependencias** | 35+ |
| **TypeScript Coverage** | ~5% |
| **Test Coverage** | 0% |

---

### 📝 Notas Finales

Este documento captura el estado actual del frontend de UNAYOE Web al 2 de diciembre de 2025. Sirve como punto de partida para:

1. **Nuevos Desarrolladores:** Entender rápidamente la arquitectura
2. **Refactorización:** Identificar áreas de mejora
3. **Integración:** Facilitar el acoplamiento con nuevas versiones
4. **Documentación:** Mantener registro del estado del proyecto

**Última Actualización:** 2025-12-02
**Mantenedor:** Equipo UNAYOE
**Versión del Documento:** 1.0.0

---

## Apéndices

### A. Glosario

- **UNAYOE:** Unidad de Apoyo y Orientación Emocional
- **PsicoTips:** Recomendaciones de bienestar emocional
- **Diario de Bienestar:** Registro de emociones diarias con análisis de IA
- **shadcn/ui:** Biblioteca de componentes UI basada en Radix UI y Tailwind

### B. Referencias

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)

### C. Contacto

Para preguntas sobre este documento o el proyecto:
- **Repositorio:** [UNAYOE-web](https://github.com/...)
- **Issues:** [GitHub Issues](https://github.com/.../issues)

---

**FIN DEL DOCUMENTO**
