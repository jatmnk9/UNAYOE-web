import * as React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout para páginas de autenticación (Login, Register)
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg">
            <svg
              className="h-10 w-10"
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
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-dark)]">
            UNAYOE
          </h1>
          <p className="text-gray-600">Centro de Bienestar Estudiantil</p>
        </div>

        {/* Contenido de la página (Login/Register) */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>© 2024 UNAYOE. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};
