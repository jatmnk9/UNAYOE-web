// src/pages/PsychologistPortal.jsx (Ahora es el Layout Principal)

import { useAuth } from "../context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom"; 

export default function PsychologistPortal() {
    // 💡 CORRECCIÓN 1: Usar 'logout' y quitar 'signOutUser' y 'authLoading'
    const { user, logout } = useAuth();
    const location = useLocation();

    // Función para cerrar la sesión (ahora usa la función 'logout' del contexto)
    const handleLogout = () => {
        // En el AuthContext que proporcionaste, 'logout' no es asíncrono y solo limpia el estado.
        // Si más adelante lo haces asíncrono para llamar a una API, puedes añadir 'await'.
        logout(); 
        // No necesitamos un chequeo de error si el 'logout' es simplemente local.
    };
    
    // 💡 Nota: Quitamos el bloque 'if (authLoading)' ya que no está en tu AuthContext.
    // La redirección por falta de 'user' se maneja en el componente PrivateRoute en App.jsx.
    
    // URL base para los enlaces del portal
    const baseUrl = "/psychologist";

    // 💡 CORRECCIÓN 2: Función para el enlace activo/inactivo 
    // Ahora usa startsWith para manejar rutas anidadas con parámetros
    const getNavLinkClass = (path) => {
        const currentPath = location.pathname;
        
        // Compara la ruta exacta para el Dashboard
        if (path === baseUrl) {
            return currentPath === baseUrl || currentPath === `${baseUrl}/`
                ? "bg-indigo-600 text-white font-bold p-2 rounded block transition duration-150"
                : "text-gray-700 hover:bg-gray-200 p-2 rounded block transition duration-150";
        }

        // Usa startsWith para los módulos que tienen subrutas (como /seguimiento/123)
        return currentPath.startsWith(path)
            ? "bg-indigo-600 text-white font-bold p-2 rounded block transition duration-150"
            : "text-gray-700 hover:bg-gray-200 p-2 rounded block transition duration-150";
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            
            {/* Barra Lateral / Navegación del Portal */}
            <aside className="w-64 bg-white shadow-xl flex flex-col p-6">
                <h1 className="text-3xl font-extrabold text-indigo-800 mb-8 border-b pb-4">
                    👋 Portal Psicólogo
                </h1>
                
                <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-500 mb-4">Módulos</p>
                    <nav className="space-y-2">
                        
                        {/* Enlace al Dashboard de inicio (Ruta: /psychologist) */}
                        <Link 
                            to={baseUrl} 
                            className={getNavLinkClass(baseUrl)}
                        >
                            🏠 Dashboard
                        </Link>
                        
                        {/* Enlace al Módulo de Seguimiento (Ruta: /psychologist/seguimiento) */}
                        <Link 
                            to={`${baseUrl}/seguimiento`} 
                            className={getNavLinkClass(`${baseUrl}/seguimiento`)}
                        >
                            📝 Seguimiento Diario
                        </Link>
                        
                    </nav>
                </div>

                {/* Info y Botón de Cerrar Sesión */}
                <div className="mt-auto pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2 truncate">
                        Conectado como: **{user?.email || 'N/A'}**
                    </p>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-150 shadow-md"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Contenido Principal (donde se renderizarán los módulos) */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
            
        </div>
    );
}