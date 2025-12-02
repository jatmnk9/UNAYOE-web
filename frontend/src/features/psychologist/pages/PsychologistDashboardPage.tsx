import * as React from 'react';
import { useEffect, useState } from 'react';
import { usePsychologist } from '../hooks/usePsychologist';
import { useAuth } from '../../auth/hooks/useAuth';
import { StudentList } from '../components/StudentList';
import { AlertList } from '../components/AlertList';
import { StudentDetailModal } from '../components/StudentDetailModal';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { useToast } from '../../../shared/components/ui/toast';

export const PsychologistDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    students,
    alerts,
    selectedStudent,
    isLoading,
    fetchStudents,
    fetchAlerts,
    markAlertAsRead,
    setSelectedStudent,
  } = usePsychologist();

  const { success: showSuccess, error: showError } = useToast();

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [markingAlertId, setMarkingAlertId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'alerts'>('students');

  useEffect(() => {
    if (user?.id) {
      fetchStudents(user.id);
      fetchAlerts(user.id);
    }
  }, [user?.id]);

  const handleViewDetails = (student: any) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleMarkAsRead = async (alertId: number) => {
    setMarkingAlertId(alertId);
    const success = await markAlertAsRead(alertId);

    if (success) {
      showSuccess('Alerta marcada como leída');
    } else {
      showError('Error al marcar la alerta');
    }
    setMarkingAlertId(null);
  };

  const unreadAlertsCount = alerts.filter((alert) => !alert.leida).length;
  const highAlertStudents = students.filter(
    (student) => student.nivel_alerta === 'alta'
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-dark)]">
          Dashboard del Psicólogo
        </h1>
        <p className="text-gray-600">
          Gestiona tus estudiantes asignados y monitorea alertas del sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estudiantes Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--color-dark)]">
              {students.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Alertas Sin Leer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {unreadAlertsCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Alertas de Nivel Alto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {highAlertStudents}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('students')}
          className="rounded-b-none"
        >
          Estudiantes ({students.length})
        </Button>
        <Button
          variant={activeTab === 'alerts' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('alerts')}
          className="rounded-b-none"
        >
          Alertas ({unreadAlertsCount > 0 ? unreadAlertsCount : alerts.length})
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'students' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--color-dark)]">
                Mis Estudiantes
              </h2>
            </div>

            <StudentList
              students={students}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[var(--color-dark)]">
                Alertas del Sistema
              </h2>
            </div>

            <AlertList
              alerts={alerts}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
              markingId={markingAlertId}
            />
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={selectedStudent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
};
