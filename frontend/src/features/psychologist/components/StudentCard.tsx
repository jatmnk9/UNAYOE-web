import * as React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { formatDate } from '../../../shared/utils/dateUtils';

interface Student {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  codigo_estudiante: string;
  nivel_alerta?: string;
  ultima_nota?: string;
  fecha_ultima_nota?: string;
  proxima_cita?: string;
}

interface StudentCardProps {
  student: Student;
  onViewDetails: (student: Student) => void;
}

const getAlertConfig = (nivel?: string) => {
  const configs = {
    alta: { variant: 'destructive' as const, label: 'Alta' },
    media: { variant: 'warning' as const, label: 'Media' },
    baja: { variant: 'secondary' as const, label: 'Baja' },
  };
  return nivel ? configs[nivel as keyof typeof configs] : null;
};

/**
 * Tarjeta individual de estudiante para el dashboard del psicólogo
 */
export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onViewDetails,
}) => {
  const alertConfig = getAlertConfig(student.nivel_alerta);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold text-[var(--color-dark)]">
                {student.nombre} {student.apellido}
              </h3>
              {alertConfig && (
                <Badge variant={alertConfig.variant}>
                  Alerta {alertConfig.label}
                </Badge>
              )}
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Código:</span>{' '}
                {student.codigo_estudiante}
              </p>
              <p>
                <span className="font-medium">Email:</span> {student.email}
              </p>
              {student.fecha_ultima_nota && (
                <p>
                  <span className="font-medium">Última nota:</span>{' '}
                  {formatDate(student.fecha_ultima_nota)}
                </p>
              )}
              {student.proxima_cita && (
                <p>
                  <span className="font-medium">Próxima cita:</span>{' '}
                  {formatDate(student.proxima_cita)}
                </p>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(student)}
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
