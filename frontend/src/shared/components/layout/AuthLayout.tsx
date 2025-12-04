import * as React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Layout para páginas de autenticación (Login, Register)
 * Este layout actúa como un wrapper simple que permite a las páginas
 * de autenticación manejar su propio diseño y estructura
 */
export const AuthLayout: React.FC = () => {
  return <Outlet />;
};
