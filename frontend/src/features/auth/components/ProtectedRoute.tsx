import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../../../core/config/constants';
import { LoadingOverlay } from '../../../shared/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * Componente para proteger rutas que requieren autenticación
 * Redirige a login si el usuario no está autenticado
 * Opcionalmente valida roles específicos
 *
 * @example
 * <Route
 *   path="/student/*"
 *   element={
 *     <ProtectedRoute allowedRoles={['estudiante']}>
 *       <StudentPortal />
 *     </ProtectedRoute>
 *   }
 * />
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    checkAuth();
    setIsChecking(false);
  }, [checkAuth]);

  if (isChecking) {
    return <LoadingOverlay message="Verificando autenticación..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};
