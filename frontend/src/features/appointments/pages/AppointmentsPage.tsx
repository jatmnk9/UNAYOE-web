import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../../auth/hooks/useAuth';
import { AppointmentForm } from '../components/AppointmentForm';
import { AppointmentList } from '../components/AppointmentList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Modal } from '../../../shared/components/ui/modal';
import { useToast } from '../../../shared/components/ui/toast';

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    appointments,
    availablePsychologists,
    isLoading,
    fetchAppointments,
    fetchAvailablePsychologists,
    createAppointment,
    deleteAppointment,
  } = useAppointments();

  const { success: showSuccess, error: showError } = useToast();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
      fetchAvailablePsychologists();
    }
  }, [user?.id]);

  const handleCreateAppointment = async (appointmentData: any) => {
    if (!user?.id) return;

    const success = await createAppointment({
      ...appointmentData,
      estudiante_id: user.id,
    });

    if (success) {
      showSuccess('Cita solicitada exitosamente');
      setIsNewModalOpen(false);
    } else {
      showError('Error al solicitar la cita');
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    const confirmed = window.confirm('¿Estás seguro de cancelar esta cita?');
    if (!confirmed) return;

    setCancellingId(appointmentId);
    const success = await deleteAppointment(appointmentId);

    if (success) {
      showSuccess('Cita cancelada exitosamente');
    } else {
      showError('Error al cancelar la cita');
    }
    setCancellingId(null);
  };

  const filteredAppointments = React.useMemo(() => {
    if (filter === 'all') return appointments;
    return appointments.filter((app) => app.estado === filter);
  }, [appointments, filter]);

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'cancelada', label: 'Canceladas' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[var(--color-dark)]">Mis Citas</h1>
          <p className="text-gray-600">
            Gestiona tus citas con el servicio de psicología
          </p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          Nueva cita
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Información importante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>• Las citas son confirmadas por el psicólogo asignado</p>
          <p>• Recibirás una notificación cuando tu cita sea confirmada</p>
          <p>• Puedes cancelar una cita con al menos 24 horas de anticipación</p>
          <p>• El servicio es completamente confidencial y gratuito</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-dark)]">
            Mis Citas
          </h2>

          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <AppointmentList
          appointments={filteredAppointments}
          isLoading={isLoading}
          onCancel={handleCancelAppointment}
          cancellingId={cancellingId}
        />
      </div>

      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Solicitar Nueva Cita"
        size="lg"
      >
        <AppointmentForm
          onSubmit={handleCreateAppointment}
          isLoading={isLoading}
          psychologists={availablePsychologists}
        />
      </Modal>
    </div>
  );
};
