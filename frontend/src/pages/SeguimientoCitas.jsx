import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config/api';

export default function SeguimientoCitas() {
    const [citas, setCitas] = useState([]);
    const [psicologos, setPsicologos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [psicologoSeleccionado, setPsicologoSeleccionado] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user?.id) {
            cargarPsicologos();
        }
    }, [user?.id]);

    const cargarPsicologos = async () => {
        try {
            const response = await fetch(`${API_URL}/citas/psicologos/disponibles`);
            const data = await response.json();

            if (response.ok) {
                setPsicologos(data.data || []);
                cargarCitasPendientes(data.data || []);
            } else {
                cargarCitasPendientes([]);
            }
        } catch (error) {
            console.error('Error al cargar psicólogos:', error);
            cargarCitasPendientes([]);
        }
    };

    const cargarCitasPendientes = async (listaPsicologos) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/citas`);
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

    const handleAsignarPsicologo = (cita) => {
        setCitaSeleccionada(cita);
        setShowAssignModal(true);
        setPsicologoSeleccionado(cita.id_psicologo || '');
    };

    const confirmarAsignacion = async () => {
        if (!psicologoSeleccionado) {
            alert('Por favor selecciona un psicólogo');
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/citas/${citaSeleccionada.id_cita}/asignar-psicologo`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_psicologo: psicologoSeleccionado
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(citaSeleccionada.id_psicologo ? 'Psicólogo cambiado exitosamente' : 'Psicólogo asignado exitosamente');
                setShowAssignModal(false);
                setCitaSeleccionada(null);
                setPsicologoSeleccionado('');
                cargarCitasPendientes(psicologos);
            } else {
                alert(data.detail || 'Error al asignar psicólogo');
            }
        } catch (error) {
            console.error('Error al asignar psicólogo:', error);
            alert('Error al asignar psicólogo');
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

    return (
        <div className="portal-main-content" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <div
                style={{
                    width: "100%",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "2.5rem",
                }}
            >
                {/* Header con gradiente */}
                <div style={{
                    marginBottom: "2.5rem",
                    padding: "2rem",
                    borderRadius: "20px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
                    animation: "fadeInDown 0.6s ease-out"
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
                        <div>
                            <h2 style={{
                                fontSize: "2.5rem",
                                color: "white",
                                fontWeight: 800,
                                margin: 0,
                                marginBottom: "0.5rem",
                                textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                            }}>
                                📋 Gestión de Citas
                            </h2>
                            <p style={{ color: "rgba(255,255,255,0.95)", fontSize: "1.1rem", margin: 0, fontWeight: 500 }}>
                                Gestiona y asigna psicólogos a las citas de los estudiantes
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/psychologist')}
                            style={{
                                padding: "0.85rem 1.5rem",
                                background: "rgba(255, 255, 255, 0.25)",
                                backdropFilter: "blur(10px)",
                                color: "white",
                                borderRadius: "12px",
                                border: "2px solid rgba(255, 255, 255, 0.3)",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                            onMouseOver={e => {
                                e.target.style.background = "rgba(255, 255, 255, 0.35)";
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                            }}
                            onMouseOut={e => {
                                e.target.style.background = "rgba(255, 255, 255, 0.25)";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                        >
                            ← Volver al Portal
                        </button>
                    </div>
                </div>

                {/* Card de instrucciones mejorada */}
                <div style={{
                    marginBottom: "2rem",
                    padding: "2rem",
                    background: "white",
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    animation: "fadeIn 0.8s ease-out"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem"
                        }}>
                            💡
                        </div>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
                            Instrucciones
                        </h3>
                    </div>
                    <ul style={{
                        color: "#4a5568",
                        fontSize: "1rem",
                        lineHeight: "1.8",
                        margin: 0,
                        paddingLeft: "1.5rem",
                        listStyleType: "none"
                    }}>
                        <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>✓</span>
                            Revisa todas las citas del sistema
                        </li>
                        <li style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>✓</span>
                            Asigna o cambia el psicólogo de cada cita
                        </li>
                        <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "#667eea", fontWeight: "bold" }}>✓</span>
                            Las citas sin psicólogo asignado aparecen como "Pendiente"
                        </li>
                    </ul>
                </div>

                {/* Lista de citas con mejor diseño */}
                {loading ? (
                    <div style={{
                        background: "white",
                        padding: "4rem 2rem",
                        borderRadius: "16px",
                        textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{
                            width: "60px",
                            height: "60px",
                            border: "4px solid #667eea",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            margin: "0 auto 1.5rem",
                            animation: "spin 1s linear infinite"
                        }}></div>
                        <p style={{ fontWeight: 600, color: "#667eea", fontSize: "1.2rem" }}>
                            Cargando citas...
                        </p>
                    </div>
                ) : citas.length === 0 ? (
                    <div style={{
                        background: "white",
                        padding: "4rem 2rem",
                        borderRadius: "16px",
                        textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                    }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            margin: "0 auto 1.5rem",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.5rem"
                        }}>
                            ✅
                        </div>
                        <h3 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2d3748", marginBottom: "0.5rem" }}>
                            No hay citas registradas
                        </h3>
                        <p style={{ color: "#718096", fontSize: "1rem" }}>
                            Aún no hay citas en el sistema
                        </p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gap: "1.5rem"
                    }}>
                        {citas.map((cita, index) => (
                            <div
                                key={cita.id_cita}
                                style={{
                                    background: "white",
                                    borderRadius: "16px",
                                    padding: "2rem",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                    border: "1px solid #e2e8f0",
                                    transition: "all 0.3s ease",
                                    animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.2)";
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.borderColor = "#667eea";
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
                                    <div style={{ flex: 1, minWidth: "280px" }}>
                                        {/* Badge y fecha con mejor diseño */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                                            <span style={{
                                                borderRadius: "20px",
                                                background: cita.id_psicologo
                                                    ? "linear-gradient(135deg, #48bb78 0%, #2f855a 100%)"
                                                    : "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
                                                padding: "0.5rem 1.2rem",
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: "white",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                                boxShadow: cita.id_psicologo
                                                    ? "0 4px 12px rgba(72, 187, 120, 0.4)"
                                                    : "0 4px 12px rgba(255, 216, 155, 0.4)"
                                            }}>
                                                {cita.id_psicologo ? "✅ Asignado" : "⏳ Pendiente"}
                                            </span>
                                            <span style={{
                                                fontSize: "0.95rem",
                                                color: "#4a5568",
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem"
                                            }}>
                                                <span style={{ fontSize: "1.2rem" }}>📅</span>
                                                {formatearFecha(cita.fecha_cita)}
                                            </span>
                                        </div>

                                        {/* Info del estudiante mejorada */}
                                        <div style={{
                                            marginBottom: "1.5rem",
                                            padding: "1.25rem",
                                            background: "linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)",
                                            borderRadius: "12px",
                                            borderLeft: "4px solid #667eea"
                                        }}>
                                            <h4 style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 800,
                                                color: "#667eea",
                                                marginBottom: "0.75rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}>
                                                👤 Estudiante
                                            </h4>
                                            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2d3748", margin: 0, marginBottom: "0.4rem" }}>
                                                {cita.usuarios?.nombre} {cita.usuarios?.apellido}
                                            </p>
                                            {cita.usuarios?.correo_institucional && (
                                                <p style={{
                                                    fontSize: "0.9rem",
                                                    color: "#718096",
                                                    margin: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.4rem"
                                                }}>
                                                    <span>✉️</span> {cita.usuarios.correo_institucional}
                                                </p>
                                            )}
                                        </div>

                                        {/* Psicólogo asignado */}
                                        {cita.id_psicologo && (
                                            <div style={{
                                                marginBottom: "1.5rem",
                                                padding: "1.25rem",
                                                background: "linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)",
                                                borderRadius: "12px",
                                                borderLeft: "4px solid #48bb78"
                                            }}>
                                                <h4 style={{
                                                    fontSize: "0.85rem",
                                                    fontWeight: 800,
                                                    color: "#2f855a",
                                                    marginBottom: "0.75rem",
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.5px"
                                                }}>
                                                    👨‍⚕️ Psicólogo Asignado
                                                </h4>
                                                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#2d3748", margin: 0 }}>
                                                    {cita.nombre_psicologo || 'Asignado'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Motivo de consulta */}
                                        <div>
                                            <h4 style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 800,
                                                color: "#2d3748",
                                                marginBottom: "0.75rem",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}>
                                                📋 Motivo de consulta
                                            </h4>
                                            <div style={{
                                                padding: "1.25rem",
                                                background: "#fafbfc",
                                                borderRadius: "12px",
                                                border: "2px dashed #cbd5e0",
                                                transition: "all 0.3s ease"
                                            }}>
                                                <p style={{
                                                    whiteSpace: "pre-wrap",
                                                    fontSize: "1rem",
                                                    color: "#2d3748",
                                                    lineHeight: "1.7",
                                                    margin: 0,
                                                    fontWeight: 500
                                                }}>
                                                    {cita.titulo}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de asignación/edición mejorado */}
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <button
                                            onClick={() => handleAsignarPsicologo(cita)}
                                            style={{
                                                padding: "1rem 2rem",
                                                background: cita.id_psicologo
                                                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                color: "white",
                                                borderRadius: "14px",
                                                border: "none",
                                                fontWeight: 700,
                                                fontSize: "1rem",
                                                boxShadow: cita.id_psicologo
                                                    ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                                                    : "0 6px 20px rgba(102, 126, 234, 0.4)",
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                whiteSpace: "nowrap",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px"
                                            }}
                                            onMouseOver={e => {
                                                e.target.style.transform = "translateY(-4px)";
                                                e.target.style.boxShadow = cita.id_psicologo
                                                    ? "0 10px 30px rgba(245, 158, 11, 0.5)"
                                                    : "0 10px 30px rgba(102, 126, 234, 0.5)";
                                            }}
                                            onMouseOut={e => {
                                                e.target.style.transform = "translateY(0)";
                                                e.target.style.boxShadow = cita.id_psicologo
                                                    ? "0 6px 20px rgba(245, 158, 11, 0.4)"
                                                    : "0 6px 20px rgba(102, 126, 234, 0.4)";
                                            }}
                                        >
                                            {cita.id_psicologo ? "✏️ Cambiar Psicólogo" : "👨‍⚕️ Asignar Psicólogo"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal mejorado */}
            {showAssignModal && citaSeleccionada && (
                <div style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(8px)",
                    animation: "fadeIn 0.3s ease-out"
                }}>
                    <div style={{
                        width: "100%",
                        maxWidth: "36rem",
                        borderRadius: "20px",
                        background: "white",
                        padding: "2.5rem",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        animation: "scaleIn 0.3s ease-out"
                    }}>
                        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h2 style={{
                                fontSize: "1.8rem",
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                margin: 0
                            }}>
                                {citaSeleccionada.id_psicologo ? "Cambiar Psicólogo" : "Asignar Psicólogo"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setCitaSeleccionada(null);
                                    setPsicologoSeleccionado('');
                                }}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "12px",
                                    background: "#f7fafc",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = "#e2e8f0";
                                    e.target.style.transform = "rotate(90deg)";
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = "#f7fafc";
                                    e.target.style.transform = "rotate(0deg)";
                                }}
                            >
                                <svg style={{ width: "1.5rem", height: "1.5rem", color: "#718096" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Info de la cita en el modal */}
                        <div style={{
                            marginBottom: "2rem",
                            padding: "1.5rem",
                            background: "linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)",
                            borderRadius: "14px",
                            border: "2px solid #e2e8f0"
                        }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#667eea", textTransform: "uppercase", letterSpacing: "0.5px" }}>Estudiante</span>
                                <p style={{ fontSize: "1rem", color: "#2d3748", fontWeight: 600, margin: "0.25rem 0 0 0" }}>
                                    {citaSeleccionada.usuarios?.nombre} {citaSeleccionada.usuarios?.apellido}
                                </p>
                            </div>
                            <div style={{ marginBottom: "1rem" }}>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#667eea", textTransform: "uppercase", letterSpacing: "0.5px" }}>Fecha</span>
                                <p style={{ fontSize: "1rem", color: "#2d3748", fontWeight: 600, margin: "0.25rem 0 0 0" }}>
                                    {formatearFecha(citaSeleccionada.fecha_cita)}
                                </p>
                            </div>
                            <div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#667eea", textTransform: "uppercase", letterSpacing: "0.5px" }}>Motivo</span>
                                <p style={{ fontSize: "1rem", color: "#2d3748", fontWeight: 500, margin: "0.25rem 0 0 0", lineHeight: "1.6" }}>
                                    {citaSeleccionada.titulo}
                                </p>
                            </div>
                        </div>

                        {/* Selector de psicólogo */}
                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{
                                display: "block",
                                marginBottom: "0.75rem",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#2d3748",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px"
                            }}>
                                Seleccionar Psicólogo
                            </label>
                            <select
                                value={psicologoSeleccionado}
                                onChange={(e) => setPsicologoSeleccionado(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "1rem 1.25rem",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: "12px",
                                    fontSize: "1rem",
                                    color: "#2d3748",
                                    background: "white",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    fontWeight: 500
                                }}
                                onFocus={e => {
                                    e.target.style.borderColor = "#667eea";
                                    e.target.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor = "#e2e8f0";
                                    e.target.style.boxShadow = "none";
                                }}
                            >
                                <option value="">-- Seleccione un psicólogo --</option>
                                {psicologos.map((psicologo) => (
                                    <option key={psicologo.id} value={psicologo.id}>
                                        {psicologo.nombre} {psicologo.apellido}
                                        {psicologo.correo_institucional && ` - ${psicologo.correo_institucional}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botones del modal */}
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setCitaSeleccionada(null);
                                    setPsicologoSeleccionado('');
                                }}
                                style={{
                                    padding: "0.9rem 1.75rem",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: "12px",
                                    background: "white",
                                    color: "#4a5568",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseOver={e => {
                                    e.target.style.background = "#f7fafc";
                                    e.target.style.borderColor = "#cbd5e0";
                                }}
                                onMouseOut={e => {
                                    e.target.style.background = "white";
                                    e.target.style.borderColor = "#e2e8f0";
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarAsignacion}
                                style={{
                                    padding: "0.9rem 2rem",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    borderRadius: "12px",
                                    border: "none",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px"
                                }}
                                onMouseOver={e => {
                                    e.target.style.transform = "translateY(-2px)";
                                    e.target.style.boxShadow = "0 10px 30px rgba(102, 126, 234, 0.5)";
                                }}
                                onMouseOut={e => {
                                    e.target.style.transform = "translateY(0)";
                                    e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
                                }}
                            >
                                {citaSeleccionada.id_psicologo ? "Confirmar Cambio" : "Confirmar Asignación"}
                            </button>
                        </div>
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
