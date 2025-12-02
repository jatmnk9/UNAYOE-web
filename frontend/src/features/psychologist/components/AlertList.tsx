import * as React from 'react';
import { AlertCard } from './AlertCard';
import { Skeleton } from '../../../shared/components/ui/loading';

interface Alert {
  id: number;
  estudiante_id: number;
  estudiante_nombre: string;
  tipo: string;
  nivel: string;
  mensaje: string;
  fecha_creacion: string;
  leida: boolean;
}

interface AlertListProps {
  alerts: Alert[];
  isLoading?: boolean;
  onMarkAsRead?: (alertId: number) => void;
  markingId?: number | null;
}

/**
 * Lista de alertas del sistema
 */
export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  isLoading = false,
  onMarkAsRead,
  markingId = null,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          No hay alertas
        </h3>
        <p className="text-sm text-gray-500">
          Las alertas del sistema aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onMarkAsRead={onMarkAsRead}
          isMarkingAsRead={markingId === alert.id}
        />
      ))}
    </div>
  );
};
