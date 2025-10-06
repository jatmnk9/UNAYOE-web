// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  // ❌ ANTES: const { user, profile, loading } = useAuth(); 
  // ✅ AHORA: Usamos userRole directamente del contexto
  const { user, userRole, loading } = useAuth(); 

  // 1. Muestra "Cargando..." mientras el contexto se inicializa (Auth + Perfil)
  if (loading) {
    return <div className="p-4">Cargando datos de sesión y perfil...</div>; 
  }

  // 2. Si no hay usuario, redirige al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si se requiere un rol y el rol del usuario no coincide
  // ❌ ANTES: if (role && profile?.rol !== role) 
  // ✅ AHORA: Usamos userRole
  if (role && userRole !== role) { 
    console.warn(`Acceso denegado. Rol requerido: ${role}, Rol actual: ${userRole}`);
    // Redirige a la página principal (o una de acceso denegado)
    return <Navigate to="/" replace />; 
  }

  // Si pasa todas las verificaciones, muestra el contenido
  return children;
}