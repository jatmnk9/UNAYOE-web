import * as React from 'react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { Button } from '../ui/button';

interface HeaderProps {
  title?: string;
}

/**
 * Header principal de la aplicación
 */
export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-dark)]">
                {title || 'UNAYOE'}
              </h1>
              <p className="text-xs text-gray-500">
                Centro de Bienestar Estudiantil
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--color-dark)]">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500">
                  {user.rol === 'estudiante' ? 'Estudiante' : 'Psicólogo'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
