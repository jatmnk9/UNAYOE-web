import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import API_URL from '../config/api';

export default function MisCitas() {
  const { user } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    fecha_cita: ''
  });
  const [errors, setErrors] = useState({});

  // Cargar citas y psicólogos al montar
  useEffect(() => {
    if (user?.id) {
      cargarCitas();
      cargarPsicologos();
    }
  }, [user?.id]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/citas/usuario/${user.id}`);
      const data = await response.json();

      if (response.ok) {
        setCitas(data.data || []);
      } else {
        console.error('Error al cargar citas:', data);
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarPsicologos = async () => {
    try {
      const response = await fetch(`${API_URL}/citas/psicologos/disponibles`);
      const data = await response.json();

      if (response.ok) {
        setPsicologos(data.data || []);
      }
    } catch (error) {
      console.error('Error al cargar psicólogos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.titulo || formData.titulo.trim().length < 10) {
      newErrors.titulo = 'El título debe tener al menos 10 caracteres';
    }

    if (!formData.fecha_cita) {
      newErrors.fecha_cita = 'La fecha y hora son requeridas';
    } else {
      const selectedDate = new Date(formData.fecha_cita);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.fecha_cita = 'La fecha debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    try {
      const response = await fetch(`${API_URL}/citas?id_usuario=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          fecha_cita: new Date(formData.fecha_cita).toISOString()
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cita solicitada exitosamente');
        setShowModal(false);
        setFormData({ titulo: '', fecha_cita: '' });
        cargarCitas();
      } else {
        alert(data.detail || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error al crear cita:', error);
      alert('Error al crear la cita');
    }
  };

  const handleCancelar = async (citaId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;

    try {
      const response = await fetch(`${API_URL}/citas/${citaId}?id_usuario=${user.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        alert('Cita cancelada exitosamente');
        cargarCitas();
      } else {
        alert(data.detail || 'Error al cancelar la cita');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      alert('Error al cancelar la cita');
    }
  };

  const formatearFecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerFechaMinima = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Mis Citas</h1>
            <p className="text-gray-600">
              Gestiona tus citas con el servicio de psicología
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Nueva Cita
          </Button>
        </div>

        {/* Card informativa */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50">
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

        {/* Lista de citas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Mis Citas ({citas.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <svg
                  className="mx-auto mb-4 h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  No hay citas registradas
                </h3>
                <p className="text-sm text-gray-500">
                  Solicita una cita para recibir apoyo psicológico
                </p>
              </CardContent>
            </Card>
          ) : (
            citas.map((cita) => (
              <Card key={cita.id_cita} className="transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                        Pendiente
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatearFecha(cita.fecha_cita)}
                      </span>
                    </div>
                    {cita.id_psicologo && (
                      <p className="text-sm text-gray-500">
                        Psicólogo: {cita.nombre_psicologo || 'Asignado'}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <h4 className="mb-1 text-sm font-semibold text-gray-700">
                      Motivo de consulta:
                    </h4>
                    <p className="whitespace-pre-wrap text-sm text-gray-600">
                      {cita.titulo}
                    </p>
                  </div>

                  <div className="flex justify-end border-t pt-3">
                    <Button
                      onClick={() => handleCancelar(cita.id_cita)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Cancelar cita
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal para nueva cita */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Solicitar Nueva Cita
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ titulo: '', fecha_cita: '' });
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Motivo */}
              <div>
                <label
                  htmlFor="titulo"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Motivo de la consulta
                </label>
                <textarea
                  id="titulo"
                  name="titulo"
                  rows={4}
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.titulo
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.titulo && (
                  <p className="mt-1 text-xs text-red-500">{errors.titulo}</p>
                )}
              </div>

              {/* Fecha y hora */}
              <div>
                <label
                  htmlFor="fecha_cita"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Fecha y hora deseada
                </label>
                <input
                  type="datetime-local"
                  id="fecha_cita"
                  name="fecha_cita"
                  value={formData.fecha_cita}
                  onChange={handleInputChange}
                  min={obtenerFechaMinima()}
                  className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    errors.fecha_cita
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  required
                />
                {errors.fecha_cita && (
                  <p className="mt-1 text-xs text-red-500">{errors.fecha_cita}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ titulo: '', fecha_cita: '' });
                    setErrors({});
                  }}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Solicitar cita
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
