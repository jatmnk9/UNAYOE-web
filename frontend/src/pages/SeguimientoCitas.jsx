import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SeguimientoCitas() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchStudents = async () => {
        try {
            // Filtrar estudiantes por el psicólogo vinculado
            const pid = user?.id ? `?psychologist_id=${encodeURIComponent(user.id)}` : '';
            const res = await fetch(`http://127.0.0.1:8000/psychologist/students${pid}`);
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
                style={{
                    width: "100%",
                    maxWidth: "1000px",
                    margin: "0 auto",
                    padding: "2rem",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "var(--shadow-lg)",
                    background: "var(--color-white)",
                }}
            >
                <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                    <h2
                        style={{
                            fontSize: "2rem",
                            color: "var(--color-dark)",
                            fontWeight: 700,
                            margin: 0
                        }}
                    >
                        Seguimiento de Citas
                    </h2>
                    <button
                        onClick={() => navigate('/psychologist')}
                        style={{
                            padding: "0.6rem 1.2rem",
                            background: "var(--color-primary)",
                            color: "var(--color-dark)",
                            borderRadius: "var(--radius-md)",
                            border: "none",
                            fontWeight: 600,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                        onMouseOver={e => {
                            e.target.style.background = "var(--color-accent)";
                            e.target.style.transform = "translateY(-2px)";
                        }}
                        onMouseOut={e => {
                            e.target.style.background = "var(--color-primary)";
                            e.target.style.transform = "translateY(0)";
                        }}
                    >
                        ← Volver al Portal
                    </button>
                </div>

                {loading ? (
                    <div style={{
                        background: "var(--color-soft-bg)",
                        padding: "3rem 2rem",
                        borderRadius: "var(--radius-md)",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        fontSize: "1.125rem",
                        textAlign: "center"
                    }}>
                        Cargando lista de estudiantes...
                    </div>
                ) : students.length === 0 ? (
                    <div style={{
                        background: "var(--color-soft-bg)",
                        padding: "3rem 2rem",
                        borderRadius: "var(--radius-md)",
                        textAlign: "center"
                    }}>
                        <p style={{ color: "var(--color-text-gray)", fontSize: "1rem", margin: 0 }}>
                            No hay estudiantes asignados para citas.
                        </p>
                    </div>
                ) : (
                    <div style={{
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: "1px solid #E5E7EB"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead style={{ background: "var(--color-soft-bg)" }}>
                                <tr>
                                    <th style={{
                                        padding: "1rem 1.5rem",
                                        textAlign: "left",
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        color: "var(--color-dark)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>
                                        Nombre Completo
                                    </th>
                                    <th style={{
                                        padding: "1rem 1.5rem",
                                        textAlign: "left",
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        color: "var(--color-dark)",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em"
                                    }}>
                                        Código
                                    </th>
                                    <th style={{ padding: "1rem 1.5rem", textAlign: "right" }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr
                                        key={student.id}
                                        style={{
                                            borderBottom: "1px solid #E5E7EB",
                                            transition: "background 0.2s ease"
                                        }}
                                        onMouseOver={e => e.currentTarget.style.background = "#F9FAFB"}
                                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                                    >
                                        <td style={{
                                            padding: "1.25rem 1.5rem",
                                            fontSize: "0.95rem",
                                            fontWeight: 500,
                                            color: "var(--color-dark)"
                                        }}>
                                            {student.nombre} {student.apellido}
                                        </td>
                                        <td style={{
                                            padding: "1.25rem 1.5rem",
                                            fontSize: "0.95rem",
                                            color: "var(--color-text-gray)"
                                        }}>
                                            {student.codigo_alumno}
                                        </td>
                                        <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleViewReport(student.id)}
                                                style={{
                                                    padding: "0.6rem 1.25rem",
                                                    background: "var(--color-primary)",
                                                    color: "var(--color-dark)",
                                                    borderRadius: "var(--radius-md)",
                                                    border: "none",
                                                    fontWeight: 600,
                                                    fontSize: "0.875rem",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                }}
                                                onMouseOver={e => {
                                                    e.target.style.background = "var(--color-accent)";
                                                    e.target.style.transform = "translateY(-2px)";
                                                    e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)";
                                                }}
                                                onMouseOut={e => {
                                                    e.target.style.background = "var(--color-primary)";
                                                    e.target.style.transform = "translateY(0)";
                                                    e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                                                }}
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