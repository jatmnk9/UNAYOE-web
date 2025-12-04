import { LoadingSpinner } from '@/shared/components/ui/loading';
import { ToastProvider } from '@/shared/components/ui/toast';
import * as React from 'react';
import { Suspense } from 'react';


interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Proveedor global de contextos y configuraciones
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ToastProvider>
  );
};
