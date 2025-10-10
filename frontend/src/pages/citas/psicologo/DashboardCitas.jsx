import { useState, useEffect } from 'react';
import citasService from '../../../services/citasService';
import { Calendar, Clock, Users, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';
import AsignarPsicologoModal from './AsignarPsicologoModal';

export default function DashboardCitas() {
  const [todasCitas, setTodasCitas] = useState([]);
  const [citasPendientes, setCitasPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('pendientes'); // 'pendientes' o 'todas'
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [todas, pendientes] = await Promise.all([
        citasService.obtenerTodasLasCitas(),
        citasService.obtenerCitasPendientes(),
      ]);

      setTodasCitas(todas.data || []);
      setCitasPendientes(pendientes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = (cita) => {
    setCitaSeleccionada(cita);
    setModalAbierto(true);
  };

  const handleAsignacionExitosa = () => {
    setModalAbierto(false);
    setCitaSeleccionada(null);
    cargarDatos();
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

  const citasAsignadas = todasCitas.filter((cita) => cita.id_psicologo !== null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Citas</h1>
        <p className="text-gray-600 mt-2">Gestión y asignación de citas del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Citas</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{todasCitas.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes de Asignación</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{citasPendientes.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Asignadas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{citasAsignadas.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVistaActual('pendientes')}
          className={`px-6 py-3 rounded-lg transition-colors font-medium ${
            vistaActual === 'pendientes'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pendientes ({citasPendientes.length})
        </button>
        <button
          onClick={() => setVistaActual('todas')}
          className={`px-6 py-3 rounded-lg transition-colors font-medium ${
            vistaActual === 'todas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas las Citas ({todasCitas.length})
        </button>
      </div>

      {/* Lista de Citas Pendientes */}
      {vistaActual === 'pendientes' && (
        <div>
          {citasPendientes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle size={64} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                ¡No hay citas pendientes!
              </h3>
              <p className="text-gray-600">Todas las citas han sido asignadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {citasPendientes.map((cita) => (
                <div
                  key={cita.id_cita}
                  className="bg-white border border-yellow-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Pendiente de Asignación
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-2">{cita.titulo}</h3>

                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <Calendar size={16} />
                        <span className="text-sm">{formatearFecha(cita.fecha_cita)}</span>
                      </div>

                      {/* Información del estudiante */}
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-800 mb-2">
                          <Users size={16} />
                          <span className="text-sm font-semibold">Estudiante</span>
                        </div>
                        <p className="text-sm text-blue-900 font-medium">
                          {cita.nombre_usuario} {cita.apellido_usuario}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">{cita.correo_usuario}</p>
                      </div>
                    </div>

                    {/* Botón de asignar */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAsignar(cita)}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        <UserPlus size={18} />
                        Asignar Psicólogo
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de Todas las Citas */}
      {vistaActual === 'todas' && (
        <div>
          {todasCitas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay citas registradas</h3>
              <p className="text-gray-600">Las citas creadas por estudiantes aparecerán aquí</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todasCitas.map((cita) => (
                <div
                  key={cita.id_cita}
                  className={`bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
                    cita.id_psicologo ? 'border-green-200' : 'border-yellow-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {cita.id_psicologo ? (
                          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Asignada
                          </span>
                        ) : (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">
                            Pendiente
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-2">{cita.titulo}</h3>

                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <Calendar size={16} />
                        <span className="text-sm">{formatearFecha(cita.fecha_cita)}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Estudiante */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-blue-800 mb-2">
                            <Users size={16} />
                            <span className="text-sm font-semibold">Estudiante</span>
                          </div>
                          <p className="text-sm text-blue-900 font-medium">
                            {cita.nombre_usuario} {cita.apellido_usuario}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">{cita.correo_usuario}</p>
                        </div>

                        {/* Psicólogo */}
                        {cita.id_psicologo ? (
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-800 mb-2">
                              <UserPlus size={16} />
                              <span className="text-sm font-semibold">Psicólogo Asignado</span>
                            </div>
                            <p className="text-sm text-green-900 font-medium">
                              {cita.nombre_psicologo} {cita.apellido_psicologo}
                            </p>
                            <p className="text-xs text-green-700 mt-1">{cita.especialidad_psicologo}</p>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 rounded-lg p-4 flex items-center justify-center">
                            <button
                              onClick={() => handleAsignar(cita)}
                              className="flex items-center gap-2 text-yellow-800 hover:text-yellow-900 font-medium"
                            >
                              <UserPlus size={18} />
                              Asignar Psicólogo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Asignación */}
      {modalAbierto && citaSeleccionada && (
        <AsignarPsicologoModal
          cita={citaSeleccionada}
          onClose={() => setModalAbierto(false)}
          onAsignacionExitosa={handleAsignacionExitosa}
        />
      )}
    </div>
  );
}
