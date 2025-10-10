import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import citasService from '../../../services/citasService';
import { Calendar, Clock, User, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

export default function MisCitas() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCitas();
  }, [user]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citasService.obtenerCitasUsuario(user.id);
      setCitas(data.citas_creadas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (idCita) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    try {
      await citasService.eliminarCita(idCita, user.id);
      alert('Cita cancelada exitosamente');
      cargarCitas();
    } catch (err) {
      alert('Error al cancelar la cita: ' + err.message);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Mis Citas</h1>
          <p className="text-gray-600 mt-2">Gestiona tus citas de bienestar emocional</p>
        </div>
        <Link
          to="/student/citas/crear"
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nueva Cita
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Citas List */}
      {citas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tienes citas programadas</h3>
          <p className="text-gray-600 mb-6">Crea tu primera cita para recibir apoyo emocional</p>
          <Link
            to="/student/citas/crear"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Crear Primera Cita
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {citas.map((cita) => (
            <div
              key={cita.id_cita}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Estado de la cita */}
              <div className="mb-4">
                {cita.id_psicologo ? (
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Confirmada
                  </span>
                ) : (
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Pendiente de asignación
                  </span>
                )}
              </div>

              {/* Título */}
              <h3 className="text-lg font-bold text-gray-800 mb-3">{cita.titulo}</h3>

              {/* Fecha */}
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Calendar size={16} />
                <span className="text-sm">{formatearFecha(cita.fecha_cita)}</span>
              </div>

              {/* Psicólogo asignado */}
              {cita.id_psicologo ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 mb-1">
                    <User size={16} />
                    <span className="text-sm font-semibold">Psicólogo Asignado</span>
                  </div>
                  <p className="text-sm text-blue-900 font-medium">
                    {cita.nombre_psicologo} {cita.apellido_psicologo}
                  </p>
                  {cita.especialidad_psicologo && (
                    <p className="text-xs text-blue-700 mt-1">{cita.especialidad_psicologo}</p>
                  )}
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Tu cita está en proceso de asignación. Pronto se te asignará un psicólogo.
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/student/citas/editar/${cita.id_cita}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  <Edit size={16} />
                  Editar
                </Link>
                <button
                  onClick={() => handleEliminar(cita.id_cita)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm"
                >
                  <Trash2 size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
