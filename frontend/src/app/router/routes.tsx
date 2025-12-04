import * as React from 'react';
import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../shared/components/routing';
import { StudentLayout } from '../../shared/components/layout';
import { PsychologistLayout } from '../../shared/components/layout';
import { AuthLayout } from '../../shared/components/layout';

// Lazy loading de páginas
const LoginPage = lazy(() =>
  import('../../features/auth/pages').then((module) => ({
    default: module.LoginPage,
  }))
);

const SignupPage = lazy(() =>
  import('../../features/auth/pages').then((module) => ({
    default: module.SignupPage,
  }))
);

const DiaryPage = lazy(() =>
  import('../../features/diary/pages').then((module) => ({
    default: module.DiaryPage,
  }))
);

const RecommendationsPage = lazy(() =>
  import('../../features/recommendations/pages').then((module) => ({
    default: module.RecommendationsPage,
  }))
);

const AppointmentsPage = lazy(() =>
  import('../../features/appointments/pages').then((module) => ({
    default: module.AppointmentsPage,
  }))
);

const PsychologistDashboardPage = lazy(() =>
  import('../../features/psychologist/pages').then((module) => ({
    default: module.PsychologistDashboardPage,
  }))
);

// Componente para página no autorizada
const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-600">
          Acceso Denegado
        </h1>
        <p className="mb-4 text-gray-600">
          No tienes permisos para acceder a esta página.
        </p>
        <a
          href="/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

// Componente para página 404
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-700">
          404 - Página no encontrada
        </h1>
        <p className="mb-4 text-gray-600">
          La página que buscas no existe.
        </p>
        <a
          href="/login"
          className="text-[var(--color-primary)] hover:underline"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
};

/**
 * Configuración de rutas de la aplicación
 */
export const routes: RouteObject[] = [
  // Rutas públicas (Auth)
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <SignupPage />,
      },
    ],
  },

  // Rutas de estudiante
  {
    element: (
      <ProtectedRoute requiredRole="estudiante">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DiaryPage />,
      },
      {
        path: '/diary',
        element: <DiaryPage />,
      },
      {
        path: '/appointments',
        element: <AppointmentsPage />,
      },
      {
        path: '/recommendations',
        element: <RecommendationsPage />,
      },
    ],
  },

  // Rutas de psicólogo
  {
    element: (
      <ProtectedRoute requiredRole="psicologo">
        <PsychologistLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/psychologist/dashboard',
        element: <PsychologistDashboardPage />,
      },
      {
        path: '/psychologist/appointments',
        element: <div>Appointments Management (TODO)</div>,
      },
      {
        path: '/psychologist/reports',
        element: <div>Reports (TODO)</div>,
      },
    ],
  },

  // Ruta raíz - redirige a login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },

  // Ruta no autorizada
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },

  // Ruta 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
