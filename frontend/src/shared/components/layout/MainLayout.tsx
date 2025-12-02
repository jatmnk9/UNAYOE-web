import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MainLayoutProps {
  navItems: NavItem[];
  title?: string;
}

/**
 * Layout principal con header y sidebar
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ navItems, title }) => {
  return (
    <div className="flex h-screen flex-col">
      <Header title={title} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar navItems={navItems} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
