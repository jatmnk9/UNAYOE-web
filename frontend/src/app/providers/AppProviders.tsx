import * as React from 'react';
import { Suspense } from 'react';
import { Spinner } from '../../shared/components/ui/loading';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Proveedor global de contextos y configuraciones
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};
