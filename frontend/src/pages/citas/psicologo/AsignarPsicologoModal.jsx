import { useState, useEffect } from 'react';
import citasService from '../../../services/citasService';
import { X, UserPlus, AlertCircle, CheckCircle, User } from 'lucide-react';

export default function AsignarPsicologoModal({ cita, onClose, onAsignacionExitosa }) {
  const [psicologos, setPsicologos] = useState([]);
  const [psicologoSeleccionado, setPsicologoSeleccionado] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingAsignacion, setLoadingAsignacion] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    cargarPsicologos();
  }, []);

  const cargarPsicologos = async () => {
    try {
      setLoading(true);
      const data = await citasService.obtenerPsicologosDisponibles();
      setPsicologos(data.data || []);
    } catch (err) {
      setError('Error al cargar psicólogos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAsignar = async () => {
    if (!psicologoSeleccionado) {
      setError('Debes seleccionar un psicólogo');
      return;
    }

    try {
      setLoadingAsignacion(true);
      setError(null);
      
      await citasService.asignarPsicologo(cita.id_cita, psicologoSeleccionado);
      
      setSuccess(true);
      
      setTimeout(() => {
        onAsignacionExitosa();
      }, 1500);
    } catch (err) {
      setError('Error al asignar psicólogo: ' + err.message);
    } finally {
      setLoadingAsignacion(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Asignar Psicólogo</h2>
            <p className="text-sm text-gray-600 mt-1">Selecciona un psicólogo para esta cita</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loadingAsignacion}
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Información de la cita */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Detalles de la Cita</h3>
            <p className="text-blue-900 font-medium mb-1">{cita.titulo}</p>
            <p className="text-sm text-blue-700">
              Estudiante: {cita.nombre_usuario} {cita.apellido_usuario}
            </p>
            <p className="text-sm text-blue-700">{cita.correo_usuario}</p>
            <p className="text-sm text-blue-700 mt-2">
              Fecha: {new Date(cita.fecha_cita).toLocaleString('es-ES')}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              <span>¡Psicólogo asignado exitosamente!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando psicólogos...</p>
            </div>
          ) : (
            <>
              {/* Selector de psicólogos */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Seleccionar Psicólogo
                </label>
                
                {psicologos.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <User size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">No hay psicólogos disponibles</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {psicologos.map((psicologo) => (
                      <div
                        key={psicologo.id}
                        onClick={() => setPsicologoSeleccionado(psicologo.id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          psicologoSeleccionado === psicologo.id
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                              psicologoSeleccionado === psicologo.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {psicologoSeleccionado === psicologo.id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {psicologo.nombre} {psicologo.apellido}
                            </p>
                            {psicologo.especialidad && (
                              <p className="text-sm text-gray-600 mt-1">
                                {psicologo.especialidad}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {psicologo.correo_institucional}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loadingAsignacion}
          >
            Cancelar
          </button>
          <button
            onClick={handleAsignar}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loadingAsignacion || loading || psicologos.length === 0 || !psicologoSeleccionado}
          >
            <UserPlus size={18} />
            {loadingAsignacion ? 'Asignando...' : 'Asignar Psicólogo'}
          </button>
        </div>
      </div>
    </div>
  );
}
