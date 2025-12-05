import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function MisCitas() {
    const { user } = useContext(AuthContext);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        fecha_cita: ''
    });
    const [errors, setErrors] = useState({});
    const [psicologos, setPsicologos] = useState([]);

    useEffect(() => {
        if (user?.id) {
            cargarPsicologos();
        }
    }, [user?.id]);

    const cargarPsicologos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/citas/psicologos/disponibles`);
            const data = await response.json();

            if (response.ok) {
                setPsicologos(data.data || []);
                cargarCitas(data.data || []);
            } else {
                cargarCitas([]);
            }
        } catch (error) {
            console.error('Error al cargar psicólogos:', error);
            cargarCitas([]);
        }
    };

    const cargarCitas = async (listaPsicologos) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/citas/usuario/${user.id}`);
            const data = await response.json();

            if (response.ok) {
                const citasConPsicologo = (data.data || []).map(cita => {
                    if (cita.id_psicologo && listaPsicologos.length > 0) {
                        const psicologo = listaPsicologos.find(p => p.id === cita.id_psicologo);
                        if (psicologo) {
                            cita.nombre_psicologo = `${psicologo.nombre} ${psicologo.apellido}`;
                        }
                    }
                    return cita;
                });
                setCitas(citasConPsicologo);
            } else {
                console.error('Error al cargar citas:', data);
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

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
            const response = await fetch(`${API_BASE_URL}/citas?id_usuario=${user.id}`, {
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
                cargarCitas(psicologos);
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
            const response = await fetch(`${API_BASE_URL}/citas/${citaId}?id_usuario=${user.id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Cita cancelada exitosamente');
                cargarCitas(psicologos);
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
        <div className="portal-main-content" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem' }}>
                {/* Header con gradiente */}
                <div style={{
                    marginBottom: '2.5rem',
                    padding: '2rem',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
                    animation: 'fadeInDown 0.6s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: 'white',
                                marginBottom: '0.5rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                margin: 0
                            }}>
                                📅 Mis Citas
                            </h1>
                            <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                                Gestiona tus citas con el servicio de psicología
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                padding: '0.9rem 1.75rem',
                                background: 'rgba(255, 255, 255, 0.95)',
                                color: '#667eea',
                                borderRadius: '14px',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 6px 20px rgba(255, 255, 255, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}
                            onMouseOver={e => {
                                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                                e.target.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.4)';
                            }}
                            onMouseOut={e => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.3)';
                            }}
                        >
                            ➕ Nueva Cita
                        </button>
                    </div>
                </div>

                {/* Card informativa mejorada */}
                <div style={{
                    marginBottom: '2rem',
                    padding: '2rem',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: 'none',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            ℹ️
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2d3748', margin: 0 }}>
                            Información importante
                        </h3>
                    </div>
                    <ul style={{
                        color: '#4a5568',
                        fontSize: '1rem',
                        lineHeight: '1.8',
                        margin: 0,
                        paddingLeft: '1.5rem',
                        listStyleType: 'none'
                    }}>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>✓</span>
                            Las citas son confirmadas por el psicólogo asignado
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>✓</span>
                            Recibirás una notificación cuando tu cita sea confirmada
                        </li>
                        <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>✓</span>
                            Puedes cancelar una cita con al menos 24 horas de anticipación
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>✓</span>
                            El servicio es completamente confidencial y gratuito
                        </li>
                    </ul>
                </div>

                {/* Lista de citas con título */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    animation: 'slideUp 0.5s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{
                            fontSize: '1.6rem',
                            fontWeight: 700,
                            color: '#2d3748',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '4px'
                            }}></span>
                            Mis Citas ({citas.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                border: '4px solid #667eea',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                margin: '0 auto 1.5rem',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{ color: '#667eea', fontSize: '1.2rem', fontWeight: 600 }}>Cargando citas...</p>
                        </div>
                    ) : citas.length === 0 ? (
                        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto 1.5rem',
                                background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '3rem'
                            }}>
                                📝
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem', fontWeight: 700, color: '#2d3748' }}>
                                No hay citas registradas
                            </h3>
                            <p style={{ fontSize: '1rem', color: '#718096', marginBottom: '1.5rem' }}>
                                Solicita una cita para recibir apoyo psicológico
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    padding: '0.85rem 1.75rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                                }}
                                onMouseOver={e => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
                                }}
                                onMouseOut={e => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                }}
                            >
                                Solicitar Primera Cita
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {citas.map((cita, index) => (
                                <div
                                    key={cita.id_cita}
                                    style={{
                                        padding: '1.75rem',
                                        background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                                        borderRadius: '14px',
                                        border: '2px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                                    }}
                                    onMouseOver={e => {
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.15)';
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.borderColor = '#667eea';
                                    }}
                                    onMouseOut={e => {
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    borderRadius: '20px',
                                                    background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
                                                    padding: '0.45rem 1.1rem',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    color: 'white',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    boxShadow: '0 4px 12px rgba(255, 216, 155, 0.4)'
                                                }}>
                                                    ⏳ Pendiente
                                                </span>
                                                <span style={{
                                                    fontSize: '0.95rem',
                                                    color: '#4a5568',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                                                    {formatearFecha(cita.fecha_cita)}
                                                </span>
                                            </div>

                                            {cita.id_psicologo && (
                                                <div style={{
                                                    padding: '0.85rem 1.25rem',
                                                    background: 'rgba(102, 126, 234, 0.1)',
                                                    borderRadius: '10px',
                                                    marginBottom: '1rem',
                                                    borderLeft: '4px solid #667eea'
                                                }}>
                                                    <p style={{
                                                        fontSize: '0.85rem',
                                                        color: '#667eea',
                                                        margin: 0,
                                                        fontWeight: 700,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        👨‍⚕️ Psicólogo: {cita.nombre_psicologo || 'Asignado'}
                                                    </p>
                                                </div>
                                            )}

                                            <div>
                                                <h4 style={{
                                                    marginBottom: '0.65rem',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 800,
                                                    color: '#2d3748',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    📋 Motivo de consulta:
                                                </h4>
                                                <div style={{
                                                    padding: '1.1rem',
                                                    background: 'white',
                                                    borderRadius: '10px',
                                                    border: '2px solid #e2e8f0'
                                                }}>
                                                    <p style={{
                                                        whiteSpace: 'pre-wrap',
                                                        fontSize: '0.95rem',
                                                        color: '#2d3748',
                                                        margin: 0,
                                                        lineHeight: '1.7',
                                                        fontWeight: 500
                                                    }}>
                                                        {cita.titulo}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleCancelar(cita.id_cita)}
                                                style={{
                                                    padding: '0.75rem 1.5rem',
                                                    background: 'linear-gradient(135deg, #f56565 0%, #c53030 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px',
                                                    border: 'none',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 12px rgba(245, 101, 101, 0.4)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.3px'
                                                }}
                                                onMouseOver={e => {
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 8px 20px rgba(245, 101, 101, 0.5)';
                                                }}
                                                onMouseOut={e => {
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(245, 101, 101, 0.4)';
                                                }}
                                            >
                                                ✖️ Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal mejorado */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '32rem',
                        borderRadius: '20px',
                        background: 'white',
                        padding: '2.5rem',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'scaleIn 0.3s ease-out'
                    }}>
                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{
                                fontSize: '1.8rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0
                            }}>
                                Solicitar Nueva Cita
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setFormData({ titulo: '', fecha_cita: '' });
                                    setErrors({});
                                }}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: '#f7fafc',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = '#e2e8f0';
                                    e.target.style.transform = 'rotate(90deg)';
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = '#f7fafc';
                                    e.target.style.transform = 'rotate(0deg)';
                                }}
                            >
                                <svg style={{ width: '1.5rem', height: '1.5rem', color: '#718096' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Motivo */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.65rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: '#2d3748',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Motivo de la consulta
                                </label>
                                <textarea
                                    name="titulo"
                                    rows={5}
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    placeholder="Describe brevemente el motivo de tu consulta..."
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        border: errors.titulo ? '2px solid #f56565' : '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        color: '#2d3748',
                                        background: '#fafbfc',
                                        transition: 'all 0.2s ease',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                    onFocus={e => {
                                        if (!errors.titulo) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = errors.titulo ? '#f56565' : '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                                {errors.titulo && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f56565', fontWeight: 600 }}>{errors.titulo}</p>
                                )}
                            </div>

                            {/* Fecha y hora */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.65rem',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    color: '#2d3748',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Fecha y hora deseada
                                </label>
                                <input
                                    type="datetime-local"
                                    name="fecha_cita"
                                    value={formData.fecha_cita}
                                    onChange={handleInputChange}
                                    min={obtenerFechaMinima()}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        border: errors.fecha_cita ? '2px solid #f56565' : '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        color: '#2d3748',
                                        background: '#fafbfc',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onFocus={e => {
                                        if (!errors.fecha_cita) {
                                            e.target.style.borderColor = '#667eea';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                        }
                                    }}
                                    onBlur={e => {
                                        e.target.style.borderColor = errors.fecha_cita ? '#f56565' : '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                />
                                {errors.fecha_cita && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f56565', fontWeight: 600 }}>{errors.fecha_cita}</p>
                                )}
                            </div>

                            {/* Botones */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ titulo: '', fecha_cita: '' });
                                        setErrors({});
                                    }}
                                    style={{
                                        padding: '0.9rem 1.75rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        background: 'white',
                                        color: '#4a5568',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={e => {
                                        e.target.style.background = '#f7fafc';
                                        e.target.style.borderColor = '#cbd5e0';
                                    }}
                                    onMouseOut={e => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '0.9rem 2rem',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontWeight: 700,
                                        fontSize: '0.95rem',
                                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                    onMouseOver={e => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.5)';
                                    }}
                                    onMouseOut={e => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                                    }}
                                >
                                    Solicitar cita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Animaciones CSS */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes fadeInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}