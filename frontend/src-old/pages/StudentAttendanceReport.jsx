import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chatbot from "../components/Chatbot";

const initialAnalysis = {
    sentiments: null,
    emotions: null,
    wordcloud: null,
};

export default function StudentAttendanceReport() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para el insight IA
    const [insight, setInsight] = useState("");
    const [generating, setGenerating] = useState(false);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://127.0.0.1:8000/analyze-asistencia/${studentId}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.detail || "Error al obtener el reporte.");
            }

            setAnalysis(result.analysis || initialAnalysis);
            setNotes(result.notes || []);
        } catch (err) {
            setError(err.message || "No se pudo cargar el reporte. El estudiante puede no tener registros de asistencia.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [studentId]);

    // Función para generar el insight IA
    const handleGenerateInsight = async () => {
        setGenerating(true);
        setInsight("");
        try {
            const aprendizajes = notes.map(n => n.aprendizaje_obtenido).filter(Boolean);
            const res = await fetch("http://127.0.0.1:8000/attendance-insight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: aprendizajes })
            });
            const result = await res.json();
            setInsight(result.summary);
        } catch (err) {
            setInsight("No se pudo generar el insight.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="portal-main-content">
                <div
                    className="login-card"
                    style={{
                        maxWidth: "700px",
                        margin: "2rem auto",
                        padding: "2rem",
                        borderRadius: "1.2rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        background: "var(--color-soft-bg)",
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--color-primary)",
                        fontSize: "1.2rem"
                    }}
                >
                    Generando reporte de análisis...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="portal-main-content">
                <div
                    className="login-card"
                    style={{
                        maxWidth: "700px",
                        margin: "2rem auto",
                        padding: "2rem",
                        borderRadius: "1.2rem",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        background: "var(--color-soft-bg)",
                        textAlign: "center",
                        color: "red",
                        fontWeight: 600,
                        fontSize: "1.1rem"
                    }}
                >
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="portal-main-content">
            <div
                className="login-card"
                style={{
                    maxWidth: "900px",
                    margin: "2rem auto",
                    padding: "2.5rem 2rem",
                    borderRadius: "1.2rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    background: "var(--color-soft-bg)",
                }}
            >
                <h1 style={{
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                    borderBottom: "2px solid var(--color-soft-bg)",
                    paddingBottom: "0.7rem"
                }}>
                    Seguimiento de Aprendizaje en Citas
                </h1>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                    paddingBottom: "0.5rem",
                    color: "var(--color-dark)",
                    fontSize: "1.05rem",
                    fontWeight: 500
                }}>
                    <span>
                        Estudiante ID: {studentId.substring(0, 8)}...
                    </span>
                    <button
                        onClick={() => navigate('/psychologist/seguimiento-citas')}
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
                        Volver al Listado
                    </button>
                </div>

                {notes.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--color-text-gray)",
                        background: "#fff",
                        borderRadius: "0.7rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        fontSize: "1.1rem"
                    }}>
                        <p style={{ fontWeight: 600 }}>Este estudiante no tiene aprendizajes registrados en asistencia.</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: 600,
                            marginBottom: "1.2rem",
                            color: "var(--color-dark)"
                        }}>
                            Análisis Visual de Aprendizajes
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1.5rem",
                            marginBottom: "2rem"
                        }}>
                            {/* Gráfico de Sentimientos */}
                            {analysis.sentiments && (
                                <div style={{
                                    background: "#fff",
                                    padding: "1rem",
                                    borderRadius: "0.7rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                                }}>
                                    <h3 style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        marginBottom: "0.5rem",
                                        color: "var(--color-primary)"
                                    }}>
                                        Distribución de Sentimientos
                                    </h3>
                                    <img src={`data:image/png;base64,${analysis.sentiments}`} alt="Gráfico de Sentimientos" style={{ width: "100%", height: "auto" }} />
                                </div>
                            )}

                            {/* Gráfico de Emociones */}
                            {analysis.emotions && (
                                <div style={{
                                    background: "#fff",
                                    padding: "1rem",
                                    borderRadius: "0.7rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                                }}>
                                    <h3 style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        marginBottom: "0.5rem",
                                        color: "var(--color-primary)"
                                    }}>
                                        Distribución de Emociones
                                    </h3>
                                    <img src={`data:image/png;base64,${analysis.emotions}`} alt="Gráfico de Emociones" style={{ width: "100%", height: "auto" }} />
                                </div>
                            )}

                            {/* Nube de Palabras (Ocupa todo el ancho) */}
                            {analysis.wordcloud && (
                                <div style={{
                                    gridColumn: "1 / span 2",
                                    background: "#fff",
                                    padding: "1rem",
                                    borderRadius: "0.7rem",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)"
                                }}>
                                    <h3 style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 600,
                                        marginBottom: "0.5rem",
                                        color: "var(--color-primary)"
                                    }}>
                                        Nube de Palabras Clave
                                    </h3>
                                    <img src={`data:image/png;base64,${analysis.wordcloud}`} alt="Nube de Palabras" style={{ width: "100%", height: "auto" }} />
                                </div>
                            )}
                        </div>

                        {/* Botón para generar insight IA */}
                        <button
                            onClick={handleGenerateInsight}
                            disabled={generating || notes.length === 0}
                            style={{
                                background: "var(--color-primary)",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "1.05rem",
                                padding: "0.7rem 2rem",
                                borderRadius: "0.7rem",
                                border: "none",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                                cursor: generating ? "not-allowed" : "pointer",
                                marginBottom: "1.5rem"
                            }}
                        >
                            {generating ? "Generando..." : "Generar Insight IA"}
                        </button>
                        {insight && (
                            <div style={{
                                background: "#fff",
                                borderRadius: "0.7rem",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                padding: "1.2rem",
                                marginTop: "1rem",
                                color: "var(--color-dark)"
                            }}>
                                <h3 style={{ color: "var(--color-primary)", fontWeight: 700, marginBottom: "0.7rem" }}>Insight y Plan de Acción</h3>
                                <p>{insight}</p>
                            </div>
                        )}

                        <h2 style={{
                            fontSize: "1.5rem",
                            fontWeight: 600,
                            marginBottom: "1.2rem",
                            color: "var(--color-dark)"
                        }}>
                            Aprendizajes Individuales ({notes.length} en total)
                        </h2>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                            maxHeight: "350px",
                            overflowY: "auto",
                            paddingRight: "0.5rem"
                        }}>
                            {notes.map((n) => {
                                // Color para sentimiento (si lo tienes en el análisis)
                                let sentimientoColor = "var(--color-primary)";
                                if (n.sentimiento === "Sadness") sentimientoColor = "#d72660";
                                else if (n.sentimiento === "Joy") sentimientoColor = "#2563eb";
                                // Color para emoción
                                let emocionBg = "#e4f3ff";
                                let emocionColor = "#2563eb";
                                return (
                                    <div key={n.id_asistencia || n.id} style={{
                                        background: "#fff",
                                        padding: "1rem",
                                        borderRadius: "0.7rem",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                                        border: "1px solid #eee"
                                    }}>
                                        <p style={{
                                            fontSize: "0.95rem",
                                            color: "var(--color-text-gray)",
                                            marginBottom: "0.3rem"
                                        }}>
                                            {n.fecha_atencion ? new Date(n.fecha_atencion).toLocaleString() : ""}
                                        </p>
                                        <p style={{
                                            fontWeight: 500,
                                            color: "var(--color-dark)",
                                            marginBottom: "0.5rem"
                                        }}>
                                            {n.aprendizaje_obtenido}
                                        </p>
                                        {/* Si tienes sentimiento y emoción en el análisis, muéstralos aquí */}
                                        {n.sentimiento && (
                                            <span style={{
                                                display: "inline-block",
                                                padding: "0.3rem 0.8rem",
                                                background: "var(--color-soft-bg)",
                                                color: sentimientoColor,
                                                borderRadius: "1rem",
                                                fontWeight: 600,
                                                marginRight: "1rem"
                                            }}>
                                                Sentimiento: {n.sentimiento}
                                            </span>
                                        )}
                                        {n.emocion && (
                                            <span style={{
                                                display: "inline-block",
                                                padding: "0.3rem 0.8rem",
                                                background: emocionBg,
                                                color: emocionColor,
                                                borderRadius: "1rem",
                                                fontWeight: 600
                                            }}>
                                                Emoción: {n.emocion} {n.emocion_score ? `(${(n.emocion_score * 100).toFixed(1)}%)` : ""}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <Chatbot
                            context={{
                                sentimientos: analysis.sentiments,
                                emociones: analysis.emotions,
                                resumen: insight
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}