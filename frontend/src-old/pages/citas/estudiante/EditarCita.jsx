import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import citasService from '../../../services/citasService';
import { Calendar, FileText, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

export default function EditarCita() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingCita, setLoadingCita] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    fecha_cita: '',
  });

  useEffect(() => {
    cargarCita();
  }, [id]);

  const cargarCita = async () => {
    try {
      setLoadingCita(true);
      const data = await citasService.obtenerDetalleCita(id);
      
      // Convertir la fecha al formato datetime-local
      const fechaLocal = new Date(data.fecha_cita).toISOString().slice(0, 16);
      
      setFormData({
        titulo: data.titulo,
        fecha_cita: fechaLocal,
      });
    } catch (err) {
      setError('Error al cargar la cita: ' + err.message);
    } finally {
      setLoadingCita(false);
    }
  };

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

    if (!formData.titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!formData.fecha_cita) {
      setError('La fecha y hora son requeridas');
      return;
    }

    const fechaSeleccionada = new Date(formData.fecha_cita);
    const ahora = new Date();
    if (fechaSeleccionada <= ahora) {
      setError('La fecha debe ser futura');
      return;
    }

    try {
      setLoading(true);
      
      const fechaISO = new Date(formData.fecha_cita).toISOString().slice(0, 19);
      
      await citasService.actualizarCita(id, user.id, {
        titulo: formData.titulo,
        fecha_cita: fechaISO,
      });

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/student/citas');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loadingCita) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cita...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/citas')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Volver a Mis Citas
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Editar Cita</h1>
        <p className="text-gray-600 mt-2">Modifica los detalles de tu cita</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <CheckCircle size={20} />
          <span>¡Cita actualizada exitosamente! Redirigiendo...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
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
        </div>

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
        </div>

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
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
