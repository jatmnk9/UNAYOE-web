import * as React from 'react';
import { AppRouter } from './router';
import { AppProviders } from './providers/AppProviders';
import './styles/globals.css';

/**
 * Componente raíz de la aplicación refactorizada
 */
export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
