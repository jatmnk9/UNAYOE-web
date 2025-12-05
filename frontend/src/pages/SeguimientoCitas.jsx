import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

export default function SeguimientoCitas() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchStudents = async () => {
        try {
            // Filtrar estudiantes por el psicólogo vinculado
            const pid = user?.id ? `?psychologist_id=${encodeURIComponent(user.id)}` : '';
            const res = await fetch(`${API_BASE_URL}/psychologist/students${pid}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const result = await res.json();
            setStudents(result.data || []);
        } catch (error) {
            console.error("Error al cargar estudiantes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    // Cambia la ruta aquí:
    const handleViewReport = (studentId) => {
        navigate(`/psychologist/seguimiento-citas/${studentId}`);
    };

    return (
        <div className="portal-main-content">
            <div
                className="login-card"
                style={{
                    width: "100%",
                    maxWidth: "900px",
                    margin: "2rem auto",
                    padding: "2.5rem 2rem",
                    borderRadius: "1.2rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    background: "var(--color-soft-bg)",
                    backdropFilter: "blur(2px)",
                }}
            >
                <h2
                    className="login-title"
                    style={{
                        fontSize: "2.2rem",
                        color: "var(--color-primary)",
                        fontWeight: 700,
                        marginBottom: "1.5rem",
                        textAlign: "center",
                        borderBottom: "2px solid var(--color-soft-bg)",
                        paddingBottom: "0.7rem"
                    }}
                >
                    Seguimiento de Citas
                </h2>

                <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                    <button
                        onClick={() => navigate('/psychologist')}
                        style={{
                            padding: "0.6rem 1.2rem",
                            background: "var(--color-soft-bg)",
                            color: "var(--color-dark)",
                            borderRadius: "0.7rem",
                            border: "none",
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                            cursor: "pointer",
                            transition: "background 0.2s",
                        }}
                        onMouseOver={e => e.target.style.background = "var(--color-primary)"}
                        onMouseOut={e => e.target.style.background = "var(--color-soft-bg)"}
                    >
                        ← Volver al Portal
                    </button>
                </div>

                {loading ? (
                    <div style={{
                        background: "rgba(255,255,255,0.85)",
                        padding: "2rem 2.5rem",
                        borderRadius: "1.2rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        fontSize: "1.2rem",
                        textAlign: "center"
                    }}>
                        Cargando lista de estudiantes...
                    </div>
                ) : students.length === 0 ? (
                    <p style={{ color: "var(--color-text-gray)", textAlign: "center", fontSize: "1.1rem" }}>
                        No hay estudiantes asignados para citas.
                    </p>
                ) : (
                    <div style={{
                        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                        borderRadius: "0.7rem",
                        overflow: "hidden",
                        background: "#fff"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "var(--color-soft-bg)" }}>
                                <tr>
                                    <th style={{
                                        padding: "1rem",
                                        textAlign: "left",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "var(--color-dark)",
                                        letterSpacing: "0.04em"
                                    }}>
                                        Nombre Completo
                                    </th>
                                    <th style={{
                                        padding: "1rem",
                                        textAlign: "left",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "var(--color-dark)",
                                        letterSpacing: "0.04em"
                                    }}>
                                        Código
                                    </th>
                                    <th style={{ padding: "1rem" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} style={{ borderBottom: "1px solid #eee", transition: "background 0.2s" }}>
                                        <td style={{
                                            padding: "1rem",
                                            fontSize: "1rem",
                                            fontWeight: 500,
                                            color: "var(--color-dark)"
                                        }}>
                                            {student.nombre} {student.apellido}
                                        </td>
                                        <td style={{
                                            padding: "1rem",
                                            fontSize: "1rem",
                                            color: "var(--color-text-gray)"
                                        }}>
                                            {student.codigo_alumno}
                                        </td>
                                        <td style={{ padding: "1rem", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleViewReport(student.id)}
                                                style={{
                                                    padding: "0.6rem 1.2rem",
                                                    background: "var(--color-primary)",
                                                    color: "#fff",
                                                    borderRadius: "0.7rem",
                                                    border: "none",
                                                    fontWeight: 600,
                                                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                                    cursor: "pointer",
                                                    transition: "background 0.2s",
                                                }}
                                                onMouseOver={e => e.target.style.background = "var(--color-dark)"}
                                                onMouseOut={e => e.target.style.background = "var(--color-primary)"}
                                            >
                                                Ver Reporte
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
