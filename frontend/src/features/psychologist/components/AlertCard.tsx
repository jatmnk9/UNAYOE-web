import * as React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { formatDate } from '../../../shared/utils/dateUtils';

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

interface AlertCardProps {
  alert: Alert;
  onMarkAsRead?: (alertId: number) => void;
  isMarkingAsRead?: boolean;
}

const getAlertConfig = (nivel: string) => {
  const configs = {
    alta: { variant: 'destructive' as const, label: 'Alta', color: 'text-red-600' },
    media: { variant: 'warning' as const, label: 'Media', color: 'text-yellow-600' },
    baja: { variant: 'secondary' as const, label: 'Baja', color: 'text-gray-600' },
  };
  return configs[nivel as keyof typeof configs] || configs.baja;
};

/**
 * Tarjeta de alerta individual
 */
export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onMarkAsRead,
  isMarkingAsRead = false,
}) => {
  const config = getAlertConfig(alert.nivel);

  return (
    <Card className={`${!alert.leida ? 'border-l-4 border-l-orange-500' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant={config.variant}>
                {config.label}
              </Badge>
              <span className="text-sm font-medium text-gray-700">
                {alert.tipo}
              </span>
              {!alert.leida && (
                <Badge variant="outline" className="text-xs">
                  Nueva
                </Badge>
              )}
            </div>

            <h3 className="mb-1 font-semibold text-[var(--color-dark)]">
              {alert.estudiante_nombre}
            </h3>

            <p className="mb-2 text-sm text-gray-700">{alert.mensaje}</p>

            <p className="text-xs text-gray-500">
              {formatDate(alert.fecha_creacion)}
            </p>
          </div>

          {!alert.leida && onMarkAsRead && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAsRead(alert.id)}
              disabled={isMarkingAsRead}
            >
              {isMarkingAsRead ? 'Marcando...' : 'Marcar como leída'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
