import * as React from 'react';
import { Appointment } from '../../../core/types';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { formatDateTime } from '../../../shared/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (appointmentId: number) => void;
  isCancelling?: boolean;
}

const getStatusConfig = (status: string) => {
  const configs = {
    pendiente: { variant: 'warning' as const, label: 'Pendiente' },
    confirmada: { variant: 'success' as const, label: 'Confirmada' },
    completada: { variant: 'secondary' as const, label: 'Completada' },
    cancelada: { variant: 'destructive' as const, label: 'Cancelada' },
  };
  return configs[status as keyof typeof configs] || configs.pendiente;
};

/**
 * Tarjeta para mostrar una cita
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  isCancelling = false,
}) => {
  const statusConfig = getStatusConfig(appointment.estado);
  const canCancel = appointment.estado === 'pendiente' || appointment.estado === 'confirmada';

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            <span className="text-sm font-medium text-gray-600">
              {formatDateTime(appointment.fecha_hora)}
            </span>
          </div>
          {appointment.psicologo_nombre && (
            <p className="text-sm text-gray-500">
              Psicólogo: {appointment.psicologo_nombre}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h4 className="mb-1 text-sm font-semibold text-gray-700">Motivo de consulta:</h4>
          <p className="whitespace-pre-wrap text-sm text-gray-600">{appointment.motivo}</p>
        </div>

        {appointment.observaciones && (
          <div className="rounded-lg bg-gray-50 p-3">
            <h4 className="mb-1 text-xs font-semibold text-gray-700">Observaciones:</h4>
            <p className="whitespace-pre-wrap text-xs text-gray-600">
              {appointment.observaciones}
            </p>
          </div>
        )}

        {canCancel && onCancel && (
          <div className="flex justify-end border-t pt-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(appointment.id)}
              isLoading={isCancelling}
            >
              Cancelar cita
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
