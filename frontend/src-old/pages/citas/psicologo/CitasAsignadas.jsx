import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import citasService from '../../../services/citasService';
import { Calendar, Clock, User, Mail, AlertCircle, FileText } from 'lucide-react';

export default function CitasAsignadas() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'proximas', 'pasadas'

  useEffect(() => {
    cargarCitas();
  }, [user]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citasService.obtenerCitasUsuario(user.id);
      setCitas(data.citas_asignadas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const formatearFechaCorta = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    });
  };

  const esCitaProxima = (fecha) => {
    return new Date(fecha) > new Date();
  };

  const citasFiltradas = citas.filter((cita) => {
    if (filtro === 'proximas') return esCitaProxima(cita.fecha_cita);
    if (filtro === 'pasadas') return !esCitaProxima(cita.fecha_cita);
    return true;
  });

  const citasProximas = citas.filter((cita) => esCitaProxima(cita.fecha_cita));
  const citasPasadas = citas.filter((cita) => !esCitaProxima(cita.fecha_cita));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando citas asignadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Mis Citas Asignadas</h1>
        <p className="text-gray-600 mt-2">Gestiona las citas de tus estudiantes</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Citas</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{citas.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximas Citas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{citasProximas.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Citas Pasadas</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{citasPasadas.length}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FileText className="text-gray-600" size={24} />
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

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFiltro('todas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filtro === 'todas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({citas.length})
        </button>
        <button
          onClick={() => setFiltro('proximas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filtro === 'proximas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Próximas ({citasProximas.length})
        </button>
        <button
          onClick={() => setFiltro('pasadas')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filtro === 'pasadas'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pasadas ({citasPasadas.length})
        </button>
      </div>

      {/* Lista de Citas */}
      {citasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {filtro === 'todas' && 'No tienes citas asignadas'}
            {filtro === 'proximas' && 'No tienes citas próximas'}
            {filtro === 'pasadas' && 'No tienes citas pasadas'}
          </h3>
          <p className="text-gray-600">
            {filtro === 'todas' && 'Las citas asignadas por el administrador aparecerán aquí'}
            {filtro === 'proximas' && 'Tus próximas sesiones aparecerán aquí'}
            {filtro === 'pasadas' && 'El historial de citas aparecerá aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {citasFiltradas.map((cita) => {
            const esProxima = esCitaProxima(cita.fecha_cita);
            return (
              <div
                key={cita.id_cita}
                className={`bg-white border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
                  esProxima ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Información de la cita */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {esProxima ? (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Próxima
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Pasada
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-2">{cita.titulo}</h3>

                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Calendar size={16} />
                      <span className="text-sm">{formatearFecha(cita.fecha_cita)}</span>
                    </div>

                    {/* Información del estudiante */}
                    <div className="bg-blue-50 rounded-lg p-4 mt-4">
                      <div className="flex items-center gap-2 text-blue-800 mb-2">
                        <User size={16} />
                        <span className="text-sm font-semibold">Estudiante</span>
                      </div>
                      <p className="text-sm text-blue-900 font-medium">
                        {cita.nombre_usuario} {cita.apellido_usuario}
                      </p>
                      <div className="flex items-center gap-2 text-blue-700 mt-1">
                        <Mail size={14} />
                        <span className="text-xs">{cita.correo_usuario}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fecha destacada (para vista de escritorio) */}
                  <div className="hidden md:block text-center bg-gray-50 rounded-lg p-4 min-w-[120px]">
                    <p className="text-3xl font-bold text-gray-800">
                      {new Date(cita.fecha_cita).getDate()}
                    </p>
                    <p className="text-sm text-gray-600 uppercase">
                      {formatearFechaCorta(cita.fecha_cita)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(cita.fecha_cita).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
