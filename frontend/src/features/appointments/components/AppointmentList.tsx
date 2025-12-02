import * as React from 'react';
import { Appointment } from '../../../core/types';
import { AppointmentCard } from './AppointmentCard';
import { Skeleton } from '../../../shared/components/ui/loading';

interface AppointmentListProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onCancel?: (appointmentId: number) => void;
  cancellingId?: number | null;
}

/**
 * Lista de citas con estados de carga
 */
export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isLoading = false,
  onCancel,
  cancellingId = null,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-700">No hay citas registradas</h3>
        <p className="text-sm text-gray-500">
          Solicita una cita para recibir apoyo psicológico
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={onCancel}
          isCancelling={cancellingId === appointment.id}
        />
      ))}
    </div>
  );
};
