import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";

// 🔹 Páginas
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentPortal from "./pages/StudentPortal";
import PsychologistPortal from "./pages/PsychologistPortal";
import SeguimientoDiario from "./pages/SeguimientoDiario";
import StudentReport from "./pages/StudentReport";
import PsychologistDashboard from "./pages/PsychologistDashboard";
import MiDiarioDeBienestar from "./pages/MiDiarioDeBienestar";
import StudentDashboard from "./pages/StudentDashboard";
import Recomendaciones from "./pages/Recomendaciones";
import MisFavoritos from "./pages/MisFavoritos";
import FaceRegister from "./pages/FaceRegister";
import FaceVerify from "./pages/FaceVerify";
import StudentAttendance from "./pages/StudentAttendance";
import SeguimientoCitas from "./pages/SeguimientoCitas";
import StudentAttendanceReport from "./pages/StudentAttendanceReport";
import StudentGallery from "./pages/StudentGallery";
import PsychologistDrawingsView from "./pages/PsychologistDrawingsView";

// ✅ RUTA PRIVADA integrada
function PrivateRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  
  // 1. Si NO hay usuario, siempre redirige a /login (solución al flujo de Home)
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

  useEffect(() => {
    if (user) {
      console.log('[App] Usuario cargado:', {
        id: user.id,
        foto_perfil_url: user.foto_perfil_url,
        has_face_registered: user.has_face_registered
      });
    } else {
      console.log('[App] Sin usuario en contexto');
    }
  }, [user]);

  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<Home />} />
      
      {/* Flujo facial: si hay usuario redirige según foto_perfil_url */}
      <Route
        path="/login"
        element={
          user ? (
            !user.foto_perfil_url
              ? <Navigate to="/face-register" />
              : <Navigate to="/face-verify" />
          ) : (
            <Login />
          )
        }
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
      <Route
        path="/face-register"
        element={
          !user
            ? <Navigate to="/login" />
            : user.foto_perfil_url
              ? <Navigate to="/face-verify" />
              : <FaceRegister />
        }
      />
      <Route
        path="/face-verify"
        element={
          !user ? <Navigate to="/login" /> : <FaceVerify />
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
        <Route path="gallery" element={<StudentGallery />} />
        <Route path="asistencia" element={<StudentAttendance />} />
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
        <Route index element={<PsychologistDashboard />} />
        <Route path="seguimiento" element={<SeguimientoDiario />} />
        <Route path="seguimiento/:studentId" element={<StudentReport />} />
        <Route path="drawings" element={<PsychologistDrawingsView />} />
        <Route path="seguimiento-citas" element={<SeguimientoCitas />} />
        <Route path="seguimiento-citas/:studentId" element={<StudentAttendanceReport />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
}