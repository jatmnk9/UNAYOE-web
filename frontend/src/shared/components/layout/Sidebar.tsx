import * as React from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  navItems: NavItem[];
}

/**
 * Sidebar de navegación
 */
export const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  return (
    <aside className="w-64 border-r bg-gray-50">
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <span className="h-5 w-5">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
