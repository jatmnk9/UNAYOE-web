// src/pages/PsychologistPortal.jsx

import { useAuth } from "../context/AuthContext";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Home as HomeIcon, NotebookPen, LogOut, Palette, Calendar } from 'lucide-react';

export default function PsychologistPortal() {
    const { user, logout } = useAuth();
    const location = useLocation();

    const baseUrl = "/psychologist";

    const handleLogout = () => {
        logout();
    };

    const getNavLinkClass = (path) => {
        const currentPath = location.pathname;
        if (path === baseUrl) {
            return currentPath === baseUrl || currentPath === `${baseUrl}/`
                ? "sidebar-nav-button active"
                : "sidebar-nav-button";
        }
        return currentPath === path
            ? "sidebar-nav-button active"
            : "sidebar-nav-button";
    };

    return (
        <div className="portal-layout-container">
            {/* Barra Lateral / Navegación */}
            <aside className="portal-sidebar">
                {/* Logo UNAYOE */}
                <h1 className="sidebar-logo">
                    <img src="/isotipo.png" alt="UNAYOE Isotipo" className="sidebar-logo-image" />
                    <span>UNAYOE</span> <div className="sidebar-logo-light">Psicólogo</div>
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
                        <Link
                            to={baseUrl}
                            className={getNavLinkClass(baseUrl)}
                        >
                            <HomeIcon className="sidebar-nav-icon" />Dashboard
                        </Link>
                        <Link
                            to={`${baseUrl}/seguimiento`}
                            className={getNavLinkClass(`${baseUrl}/seguimiento`)}
                        >
                            <NotebookPen className="sidebar-nav-icon" />Seguimiento Diario
                        </Link>
                        <Link
                            to={`${baseUrl}/seguimiento-citas`}
                            className={getNavLinkClass(`${baseUrl}/seguimiento-citas`)}
                        >
                            <Calendar className="sidebar-nav-icon" />Gestión de Citas
                        </Link>
                        <Link
                            to={`${baseUrl}/drawings`}
                            className={getNavLinkClass(`${baseUrl}/drawings`)}
                        >
                            <Palette className="sidebar-nav-icon" />Dibujos de Estudiantes
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Contenido Principal */}
            <main className="portal-main-content">
                <Outlet />
            </main>
        </div>
    );
}