import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import citasService from '../../../services/citasService';
import { Calendar, FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function CrearCita() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    fecha_cita: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!formData.fecha_cita) {
      setError('La fecha y hora son requeridas');
      return;
    }

    // Validar que la fecha sea futura
    const fechaSeleccionada = new Date(formData.fecha_cita);
    const ahora = new Date();
    if (fechaSeleccionada <= ahora) {
      setError('La fecha debe ser futura');
      return;
    }

    try {
      setLoading(true);
      
      // Convertir la fecha al formato ISO 8601 requerido por el backend
      const fechaISO = new Date(formData.fecha_cita).toISOString().slice(0, 19);
      
      await citasService.crearCita(user.id, {
        titulo: formData.titulo,
        fecha_cita: fechaISO,
      });

      setSuccess(true);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/student/citas');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener fecha mínima (hoy + 1 hora)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/citas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Volver a Mis Citas
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Crear Nueva Cita</h1>
        <p className="text-gray-600 mt-2">Solicita una cita de apoyo emocional</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>¡Cita creada exitosamente! Redirigiendo...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Título */}
        <div className="mb-6">
          <label htmlFor="titulo" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText size={18} />
            Motivo de la Cita
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Ej: Necesito ayuda con ansiedad ante exámenes"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Describe brevemente el motivo de tu consulta
          </p>
        </div>

        {/* Fecha y Hora */}
        <div className="mb-6">
          <label htmlFor="fecha_cita" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={18} />
            Fecha y Hora Preferida
          </label>
          <input
            type="datetime-local"
            id="fecha_cita"
            name="fecha_cita"
            value={formData.fecha_cita}
            onChange={handleChange}
            min={getMinDateTime()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Selecciona una fecha y hora futura para tu cita
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">📌 Información importante</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Tu cita será revisada por un administrador</li>
            <li>• Se te asignará un psicólogo según tu necesidad</li>
            <li>• Recibirás una confirmación una vez asignado</li>
            <li>• Puedes editar o cancelar tu cita en cualquier momento</li>
          </ul>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/student/citas')}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Cita'}
          </button>
        </div>
      </form>
    </div>
  );
}
