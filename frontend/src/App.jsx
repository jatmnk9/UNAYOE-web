import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// 🔹 Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentPortal from "./pages/StudentPortal";
import PsychologistPortal from "./pages/PsychologistPortal";
import SeguimientoDiario from "./pages/SeguimientoDiario";
import StudentReport from "./pages/StudentReport";
import MiDiarioDeBienestar from "./pages/MiDiarioDeBienestar";
import StudentDashboard from "./pages/StudentDashboard";
import Recomendaciones from "./pages/Recomendaciones";
import MisFavoritos from "./pages/MisFavoritos";

import StudentAttendance from "./pages/StudentAttendance";
import SeguimientoCitas from "./pages/SeguimientoCitas";

// Páginas de Citas - Estudiante
import MisCitas from "./pages/citas/estudiante/MisCitas";
import CrearCita from "./pages/citas/estudiante/CrearCita";
import EditarCita from "./pages/citas/estudiante/EditarCita";

// Páginas de Citas - Psicólogo
import CitasAsignadas from "./pages/citas/psicologo/CitasAsignadas";
import DashboardCitas from "./pages/citas/psicologo/DashboardCitas";
import PsychologistDashboard from "./pages/PsychologistDashboard";

// RUTA PRIVADA integrada
function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" />;
  
  // 2. Si el usuario está logueado pero intenta acceder a un rol incorrecto
  if (role && user.rol !== role) {
    // Redirigir al usuario a su propio portal (o a Home)
    if (user.rol === "estudiante") return <Navigate to="/student" />;
    if (user.rol === "psicologo") return <Navigate to="/psychologist" />;
    return <Navigate to="/" />; // Fallback a Home
  }
  return children;
}

export default function App() {
  const { user } = useContext(AuthContext); 

  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<Home />} />
      
      {/* CORRECCIÓN: Evita que usuarios logueados vean la página de Login */}
      <Route 
        path="/login" 
        element={user ? (
          user.rol === "estudiante" ? <Navigate to="/student" /> :
          user.rol === "psicologo" ? <Navigate to="/psychologist" /> :
          <Navigate to="/" />
        ) : (
          <Login />
        )} 
      />
      <Route
        path="/signup"
        element={
          user ? (
            user.rol === "estudiante" ? <Navigate to="/student" /> :
            user.rol === "psicologo" ? <Navigate to="/psychologist" /> :
            <Navigate to="/" />
          ) : (
            <Signup />
          )
        }
      />

      {/* =======================================
          PORTAL DEL ESTUDIANTE (Rutas anidadas)
          ======================================= */}
      <Route
        path="/student"
        element={
          <PrivateRoute role="estudiante">
            <StudentPortal /> {/* Layout principal del estudiante */}
          </PrivateRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="diario" element={<MiDiarioDeBienestar />} />
        <Route path="recomendaciones" element={<Recomendaciones />} />
        <Route path="favoritos" element={<MisFavoritos />} />
        <Route path="asistencia" element={<StudentAttendance />} />
        <Route path="seguimiento-citas" element={<SeguimientoCitas />} />
        
        {/* Rutas de Citas - Estudiante */}
        <Route path="citas" element={<MisCitas />} />
        <Route path="citas/crear" element={<CrearCita />} />
        <Route path="citas/editar/:id" element={<EditarCita />} />
      </Route>

      {/* =======================================
          PORTAL DEL PSICÓLOGO (Rutas anidadas)
          ======================================= */}
      <Route
        path="/psychologist"
        element={
          <PrivateRoute role="psicologo">
            <PsychologistPortal /> {/* Layout principal del psicólogo */}
          </PrivateRoute>
        }
      >
        <Route index element={<PsychologistDashboard/>} />
        <Route path="seguimiento" element={<SeguimientoDiario />} />
        <Route path="seguimiento/:studentId" element={<StudentReport />} />
        <Route path="seguimiento-citas" element={<SeguimientoCitas />} />
        
        {/* Rutas de Citas - Psicólogo */}
        <Route path="citas" element={<CitasAsignadas />} />
        <Route path="citas/dashboard" element={<DashboardCitas />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
}