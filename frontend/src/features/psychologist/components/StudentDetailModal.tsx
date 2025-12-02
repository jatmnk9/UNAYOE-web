import * as React from 'react';
import { Modal } from '../../../shared/components/ui/modal';
import { Badge } from '../../../shared/components/ui/badge';
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

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
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
 * Modal con detalles completos del estudiante
 */
export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
}) => {
  if (!student) return null;

  const alertConfig = getAlertConfig(student.nivel_alerta);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.nombre} ${student.apellido}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Alert Badge */}
        {alertConfig && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Nivel de alerta:
            </span>
            <Badge variant={alertConfig.variant}>
              {alertConfig.label}
            </Badge>
          </div>
        )}

        {/* Información básica */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--color-dark)]">
            Información Básica
          </h3>
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4">
            <div>
              <span className="text-sm font-medium text-gray-700">Código:</span>
              <p className="text-gray-900">{student.codigo_estudiante}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">Email:</span>
              <p className="text-gray-900">{student.email}</p>
            </div>
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--color-dark)]">
            Actividad Reciente
          </h3>
          <div className="grid gap-3 rounded-lg bg-gray-50 p-4">
            {student.fecha_ultima_nota ? (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Última nota en el diario:
                </span>
                <p className="text-gray-900">
                  {formatDate(student.fecha_ultima_nota)}
                </p>
                {student.ultima_nota && (
                  <p className="mt-1 text-sm text-gray-600">
                    {student.ultima_nota.length > 150
                      ? `${student.ultima_nota.slice(0, 150)}...`
                      : student.ultima_nota}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                El estudiante no ha registrado notas aún
              </p>
            )}

            {student.proxima_cita && (
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Próxima cita programada:
                </span>
                <p className="text-gray-900">{formatDate(student.proxima_cita)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--color-dark)]">
            Acciones Rápidas
          </h3>
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${student.email}`}
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              Enviar Email
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
