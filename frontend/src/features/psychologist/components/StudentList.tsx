import * as React from 'react';
import { StudentCard } from './StudentCard';
import { Skeleton } from '../../../shared/components/ui/loading';
import { Input } from '../../../shared/components/ui/input';

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

interface StudentListProps {
  students: Student[];
  isLoading?: boolean;
  onViewDetails: (student: Student) => void;
}

/**
 * Lista de estudiantes asignados con búsqueda
 */
export const StudentList: React.FC<StudentListProps> = ({
  students,
  isLoading = false,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredStudents = React.useMemo(() => {
    if (!searchTerm) return students;

    const term = searchTerm.toLowerCase();
    return students.filter(
      (student) =>
        student.nombre.toLowerCase().includes(term) ||
        student.apellido.toLowerCase().includes(term) ||
        student.codigo_estudiante.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar por nombre, código o email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {filteredStudents.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            {searchTerm
              ? 'No se encontraron estudiantes'
              : 'No tienes estudiantes asignados'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'Los estudiantes asignados aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
