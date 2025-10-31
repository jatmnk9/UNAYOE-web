// StudentPortal.jsx
import { useAuth } from "../context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom"; 
import { Home as HomeIcon, NotebookPen,Heart,BookOpen,Clapperboard, LogOut } from 'lucide-react';
import ChatbotButton from "../components/ChatbotButton";

export default function StudentPortal() {
  // 💡 CORRECCIÓN 1: Usar 'logout' y quitar 'signOutUser' y 'loading: authLoading'
  const { user, logout } = useAuth(); 
  const location = useLocation();

  const handleLogout = () => {
    // 💡 CORRECCIÓN 2: Llamar directamente a la función 'logout' del contexto,
    // que es síncrona y no retorna un objeto de error en tu implementación.
    logout();
    // Si necesitas manejar errores o loading en el futuro, tendrás que
    // modificar tu AuthContext para que 'logout' sea asíncrono y devuelva un estado.
  };

  // 💡 CORRECCIÓN 3: Quitar el chequeo de authLoading, ya que no existe en el contexto.
  // La protección de carga inicial se asume por la PrivateRoute en App.jsx.
  
  const baseUrl = "/student";

  // La lógica de clases activas es funcional, pero la simplificaremos un poco para ser robustos.
  const getNavLinkClass = (path) => {
    const currentPath = location.pathname;
    
    // Para el Dashboard (ruta índice), debe coincidir exactamente para no estar activo en las subrutas.
    if (path === baseUrl) {
        return currentPath === baseUrl || currentPath === `${baseUrl}/`
            ? "sidebar-nav-button active"
            : "sidebar-nav-button";
    }

    // Para el Diario, usa startsWith para manejar rutas futuras anidadas si las hubiera,
    // o simplemente verifica la coincidencia exacta. En este caso, la coincidencia exacta es suficiente.
    return currentPath === path
        ? "sidebar-nav-button active"
        : "sidebar-nav-button";
  };

  return (
    <div className="portal-layout-container"> 
      
      {/* Barra Lateral / Navegación del Portal */}
      <aside className="portal-sidebar">
        
        {/* Logo UNAYOE en la barra lateral */}
        <h1 className="sidebar-logo">
          <img src="/isotipo.png" alt="UNAYOE Isotipo" className="sidebar-logo-image" /> 
          <span>UNAYOE</span> <div className="sidebar-logo-light">Bienestar</div>
        </h1>

        <div className="sidebar-user-header">
          <p className="sidebar-user-email">
            Conectado como: 
            <span>{user?.email || 'N/A'}</span>
          </p>
          <button
            onClick={handleLogout}
            className="sidebar-logout-button"
          >
            <LogOut className="sidebar-nav-icon inline-block align-middle" />
            Cerrar Sesión
          </button>
        </div>

        <div className="portal-sidebar-content-wrapper">
          <p className="sidebar-modules-title">Módulos</p>
          <nav className="sidebar-nav">
            
            {/* Enlace al Dashboard de inicio (ruta /student) */}
            <Link 
              to={baseUrl} 
              className={getNavLinkClass(baseUrl)}
            >
              <HomeIcon className="sidebar-nav-icon" />Dashboard
            </Link>
            
            {/* Enlace al Diario */}
            <Link 
              to={`${baseUrl}/diario`} 
              className={getNavLinkClass(`${baseUrl}/diario`)}
            >
              <BookOpen className="sidebar-nav-icon" />Mi Diario de Bienestar
            </Link>

            {/* Enlace al Diario */}
            <Link 
              to={`${baseUrl}/recomendaciones`} 
              className={getNavLinkClass(`${baseUrl}/recomendaciones`)}
            >
              <Clapperboard className="sidebar-nav-icon" />PsicoTips
            </Link>

{/* 💖 NUEVO ENLACE: Mis Favoritos */}
            <Link 
              to={`${baseUrl}/favoritos`} 
              className={getNavLinkClass(`${baseUrl}/favoritos`)}
            >
              <Heart className="sidebar-nav-icon" />Mis Favoritos
            </Link>

            <Link
                to={`${baseUrl}/asistencia`}
                className={getNavLinkClass(`${baseUrl}/seguimiento-citas`)}
            >
                <NotebookPen className="sidebar-nav-icon" />Seguimiento de Citas
            </Link>
            
          </nav>
        </div>
        
      </aside>

      {/* Contenido Principal */}
      <main className="portal-main-content">
        <Outlet />
        <ChatbotButton />
      </main>
        
    </div>
  );
}