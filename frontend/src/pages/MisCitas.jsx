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
      const response = await fetch(`http://127.0.0.1:8000/citas/usuario/${user.id}`);
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
      const response = await fetch(`http://127.0.0.1:8000/citas/psicologos/disponibles`);
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
    <div className="portal-main-content">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-dark)', marginBottom: '0.5rem' }}>
              Mis Citas
            </h1>
            <p style={{ color: 'var(--color-text-gray)', fontSize: '1rem' }}>
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
        <Card style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, #EBF4FF 0%, #E0E7FF 100%)', border: '1px solid #DBEAFE' }}>
          <CardHeader>
            <CardTitle style={{ fontSize: '1.125rem', color: 'var(--color-dark)' }}>
              Información importante
            </CardTitle>
          </CardHeader>
          <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#374151' }}>
            <p>• Las citas son confirmadas por el psicólogo asignado</p>
            <p>• Recibirás una notificación cuando tu cita sea confirmada</p>
            <p>• Puedes cancelar una cita con al menos 24 horas de anticipación</p>
            <p>• El servicio es completamente confidencial y gratuito</p>
          </CardContent>
        </Card>

        {/* Lista de citas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-dark)' }}>
            Mis Citas ({citas.length})
          </h2>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-gray)', fontSize: '1rem' }}>Cargando citas...</p>
            </div>
          ) : citas.length === 0 ? (
            <Card>
              <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                <svg
                  style={{ margin: '0 auto 1rem auto', width: '4rem', height: '4rem', color: '#9CA3AF' }}
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
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#4B5563' }}>
                  No hay citas registradas
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-gray)' }}>
                  Solicita una cita para recibir apoyo psicológico
                </p>
              </CardContent>
            </Card>
          ) : (
            citas.map((cita) => (
              <Card key={cita.id_cita} style={{ transition: 'box-shadow 0.3s ease, transform 0.3s ease' }}>
                <CardHeader style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ borderRadius: '9999px', background: '#FEF3C7', padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: 500, color: '#92400E' }}>
                        Pendiente
                      </span>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-gray)' }}>
                        {formatearFecha(cita.fecha_cita)}
                      </span>
                    </div>
                    {cita.id_psicologo && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-gray)' }}>
                        Psicólogo: {cita.nombre_psicologo || 'Asignado'}
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <h4 style={{ marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>
                      Motivo de consulta:
                    </h4>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', color: 'var(--color-text-gray)' }}>
                      {cita.titulo}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #E5E7EB', paddingTop: '0.75rem' }}>
                    <Button
                      onClick={() => handleCancelar(cita.id_cita)}
                      variant="destructive"
                      size="sm"
                      style={{ background: '#DC2626', color: 'white' }}
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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.5)' }}>
          <div style={{ width: '100%', maxWidth: '28rem', borderRadius: '0.75rem', background: 'white', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-dark)' }}>
                Solicitar Nueva Cita
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ titulo: '', fecha_cita: '' });
                  setErrors({});
                }}
                style={{ color: '#9CA3AF', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
              >
                <svg
                  style={{ width: '1.5rem', height: '1.5rem' }}
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Motivo */}
              <div className="login-field">
                <label
                  htmlFor="titulo"
                  className="login-label"
                  style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-dark)' }}
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
                  className="login-input"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: errors.titulo ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-dark)',
                    background: 'var(--color-soft-bg)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  required
                />
                {errors.titulo && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.titulo}</p>
                )}
              </div>

              {/* Fecha y hora */}
              <div className="login-field">
                <label
                  htmlFor="fecha_cita"
                  className="login-label"
                  style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-dark)' }}
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
                  className="login-input"
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: errors.fecha_cita ? '1px solid #FCA5A5' : '1px solid #E5E7EB',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--color-dark)',
                    background: 'var(--color-soft-bg)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                  }}
                  required
                />
                {errors.fecha_cita && (
                  <p style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#DC2626' }}>{errors.fecha_cita}</p>
                )}
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ titulo: '', fecha_cita: '' });
                    setErrors({});
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: 'var(--radius-md)',
                    background: 'white',
                    color: '#374151',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.2s ease'
                  }}
                >
                  Cancelar
                </button>
                <Button
                  type="submit"
                  style={{ background: '#2563EB', color: 'white', padding: '0.6rem 1.25rem' }}
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
