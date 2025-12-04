import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DrawingReplay from "../components/DrawingReplay";

export default function PsychologistDrawingsView() {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingDrawingId, setAnalyzingDrawingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [replayDrawing, setReplayDrawing] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState({});

  useEffect(() => {
    if (user?.id) {
      fetchDrawings();
    }
  }, [user]);

  const fetchDrawings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/drawings/psychologist/${user.id}`);
      const result = await res.json();
      if (res.ok) {
        setDrawings(result.data || []);
      }
    } catch (err) {
      console.error("Error cargando dibujos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (drawingId) => {
    try {
      setAnalyzingDrawingId(drawingId);
      setAnalysisResult(null);
      setSelectedDrawing(drawings.find(d => d.id === drawingId));

      const res = await fetch(`http://127.0.0.1:8000/drawings/analyze/${drawingId}`, {
        method: "POST"
      });

      const result = await res.json();
      if (res.ok) {
        setAnalysisResult(result.analysis);
      } else {
        alert(result.detail || "Error al analizar el dibujo");
      }
    } catch (err) {
      console.error("Error analizando dibujo:", err);
      alert("Error al conectar con el servidor");
    } finally {
      setAnalyzingDrawingId(null);
    }
  };

  // Agrupar dibujos por estudiante
  const drawingsByStudent = drawings.reduce((acc, drawing) => {
    const studentId = drawing.usuario_id;
    const student = drawing.usuarios || {};
    const studentName = `${student.nombre || ""} ${student.apellido || ""}`.trim() || "Estudiante";
    
    if (!acc[studentId]) {
      acc[studentId] = {
        student: {
          id: studentId,
          nombre: studentName,
          codigo: student.codigo_alumno || "N/A"
        },
        drawings: []
      };
    }
    acc[studentId].drawings.push(drawing);
    return acc;
  }, {});

  const toggleStudent = (studentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const handleReplay = (drawing) => {
    if (drawing.drawing_data && drawing.tipo_dibujo === "canvas") {
      setReplayDrawing(drawing);
    } else {
      alert("Este dibujo no tiene datos de reproducción disponibles. Solo los dibujos creados en línea pueden reproducirse.");
    }
  };

  return (
    <div className="portal-main-content" style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "var(--color-primary)" }}>
        🎨 Dibujos de Estudiantes
      </h1>

      {loading ? (
        <p>Cargando dibujos...</p>
      ) : drawings.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No hay dibujos disponibles.</p>
      ) : (
        <div>
          {/* Lista de estudiantes */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1f2937" }}>
              Lista de Estudiantes ({Object.keys(drawingsByStudent).length})
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem"
              }}
            >
              {Object.values(drawingsByStudent).map(({ student, drawings: studentDrawings }) => (
                <div
                  key={student.id}
                  style={{
                    background: "#fff",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: expandedStudents[student.id] ? "2px solid var(--color-primary)" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onClick={() => toggleStudent(student.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem", color: "#1f2937", fontWeight: 600 }}>
                        {student.nombre}
                      </h3>
                      <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                        Código: {student.codigo}
                      </p>
                      <p style={{ fontSize: "0.9rem", color: "var(--color-primary)", fontWeight: 600 }}>
                        {studentDrawings.length} {studentDrawings.length === 1 ? "dibujo" : "dibujos"}
                      </p>
                    </div>
                    <div style={{ fontSize: "1.5rem", color: "var(--color-primary)" }}>
                      {expandedStudents[student.id] ? "▼" : "▶"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dibujos de cada estudiante (expandidos) */}
          {Object.values(drawingsByStudent).map(({ student, drawings: studentDrawings }) => (
            expandedStudents[student.id] && (
              <div
                key={student.id}
                style={{
                  marginBottom: "3rem",
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h2 style={{ fontSize: "1.5rem", color: "#1f2937" }}>
                    Dibujos de {student.nombre} ({student.codigo})
                  </h2>
                  <button
                    onClick={() => toggleStudent(student.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      color: "#6b7280",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.9rem"
                    }}
                  >
                    Ocultar
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "1.5rem"
                  }}
                >
                  {studentDrawings.map((drawing) => (
                    <div
                      key={drawing.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        overflow: "hidden",
                        background: "#fff"
                      }}
                    >
                      <img
                        src={drawing.imagen_url}
                        alt={drawing.titulo || "Dibujo"}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "contain",
                          background: "#f9fafb"
                        }}
                      />
                      <div style={{ padding: "1rem" }}>
                        <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: 600 }}>
                          {drawing.titulo || "Sin título"}
                        </h3>
                        {drawing.descripcion && (
                          <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                            {drawing.descripcion}
                          </p>
                        )}
                        <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                          {new Date(drawing.created_at).toLocaleDateString("es-ES", {
                            dateStyle: "long"
                          })}
                        </p>
                        {drawing.tipo_dibujo === "canvas" && drawing.drawing_data && (
                          <p style={{ fontSize: "0.8rem", color: "#3b82f6", marginBottom: "0.5rem", fontWeight: 600 }}>
                            ✏️ Dibujo digital (reproducible)
                          </p>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                          <button
                            onClick={() => handleAnalyze(drawing.id)}
                            disabled={analyzingDrawingId === drawing.id}
                            style={{
                              width: "100%",
                              padding: "0.7rem",
                              borderRadius: "0.5rem",
                              border: "none",
                              background:
                                analyzingDrawingId === drawing.id
                                  ? "#9ca3af"
                                  : "var(--color-primary)",
                              color: "#fff",
                              cursor:
                                analyzingDrawingId === drawing.id ? "not-allowed" : "pointer",
                              fontWeight: 600,
                              fontSize: "0.9rem"
                            }}
                          >
                            {analyzingDrawingId === drawing.id
                              ? "Analizando..."
                              : "🔍 Analizar Imagen"}
                          </button>
                          {drawing.tipo_dibujo === "canvas" && drawing.drawing_data && (
                            <button
                              onClick={() => handleReplay(drawing)}
                              style={{
                                width: "100%",
                                padding: "0.7rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                background: "#10b981",
                                color: "#fff",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.9rem"
                              }}
                            >
                              ▶️ Ver Reproducción
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* Modal de análisis */}
      {analysisResult && selectedDrawing && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
            overflowY: "auto"
          }}
          onClick={() => {
            setAnalysisResult(null);
            setSelectedDrawing(null);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "1rem",
              padding: "2rem",
              maxWidth: "1200px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.8rem", color: "var(--color-primary)" }}>
                Análisis del Dibujo
              </h2>
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setSelectedDrawing(null);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ×
              </button>
            </div>

            {/* Imagen original */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Dibujo Original</h3>
              <img
                src={selectedDrawing.imagen_url}
                alt={selectedDrawing.titulo || "Dibujo"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "400px",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb"
                }}
              />
            </div>

            {/* Métricas */}
            {analysisResult.metrics && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                  Métricas Cuantitativas
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "1rem"
                  }}
                >
                  {Object.entries(analysisResult.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        padding: "1rem",
                        background: "#f9fafb",
                        borderRadius: "0.5rem",
                        border: "1px solid #e5e7eb"
                      }}
                    >
                      <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.3rem" }}>
                        {key.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#1f2937" }}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visualizaciones */}
            {analysisResult.visualizations && (
              <div style={{ marginBottom: "2rem" }}>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                  Procesamiento Paso a Paso
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem"
                  }}
                >
                  {Object.entries(analysisResult.visualizations).map(([step, imageBase64]) => (
                    <div key={step}>
                      <div
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#374151"
                        }}
                      >
                        {step.replace(/_/g, " ").toUpperCase()}
                      </div>
                      <img
                        src={`data:image/png;base64,${imageBase64}`}
                        alt={step}
                        style={{
                          width: "100%",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights de IA */}
            {analysisResult.ai_insights && (
              <div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                  Análisis y Sugerencias (IA)
                </h3>
                <div
                  style={{
                    padding: "1.5rem",
                    background: "#f0f9ff",
                    borderRadius: "0.5rem",
                    border: "1px solid #bae6fd",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.6",
                    color: "#1e40af"
                  }}
                >
                  {analysisResult.ai_insights}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de reproducción */}
      {replayDrawing && replayDrawing.drawing_data && (
        <DrawingReplay
          drawingData={replayDrawing.drawing_data}
          onClose={() => setReplayDrawing(null)}
          title={`Reproducción: ${replayDrawing.titulo || "Dibujo"}`}
        />
      )}
    </div>
  );
}

