import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import Chatbot from "../components/Chatbot";

const initialAnalysis = {
    sentiments: null,
    emotions: null,
    wordcloud: null,
    topics: null,
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
            const res = await fetch(`${API_BASE_URL}/analyze-asistencia/${studentId}`);
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

    // Función para detectar temas consistentes en las últimas sesiones
    const detectConsistentThemes = () => {
        if (!notes.length || !analysis.topics) return [];

        // Obtener las últimas 3 sesiones
        const recentNotes = notes.slice(-3);
        const themeCounts = {};

        // Contar frecuencia de temas en las últimas sesiones
        recentNotes.forEach(note => {
            if (note.topics && Array.isArray(note.topics)) {
                note.topics.forEach(topic => {
                    themeCounts[topic] = (themeCounts[topic] || 0) + 1;
                });
            }
        });

        // Retornar temas que aparecen en al menos 2 de las últimas 3 sesiones
        return Object.entries(themeCounts)
            .filter(([theme, count]) => count >= 2)
            .map(([theme, count]) => ({ theme, count }));
    };

    // Función para generar recomendaciones basadas en temas
    const generateRecommendations = (consistentThemes) => {
        const recommendations = [];

        consistentThemes.forEach(({ theme, count }) => {
            switch (theme.toLowerCase()) {
                case 'ansiedad social':
                    recommendations.push({
                        theme: 'Ansiedad Social',
                        recommendation: 'Recomendar técnicas de exposición gradual y role-playing para mejorar habilidades sociales. Considerar terapia cognitivo-conductual específica para ansiedad social.',
                        resources: ['Libro: "La superación de la timidez" de Bernardo Stamateas', 'Aplicación: "Social Anxiety Coach"', 'Ejercicios de mindfulness para situaciones sociales']
                    });
                    break;
                case 'depresión':
                    recommendations.push({
                        theme: 'Depresión',
                        recommendation: 'Implementar terapia cognitivo-conductual y actividades de activación conductual. Monitorear síntomas de manera regular.',
                        resources: ['Programa de actividad física semanal', 'Diario de gratitud diario', 'Técnicas de relajación y mindfulness']
                    });
                    break;
                case 'estrés académico':
                    recommendations.push({
                        theme: 'Estrés Académico',
                        recommendation: 'Enseñar técnicas de manejo del tiempo y estrategias de estudio efectivas. Incorporar pausas de mindfulness durante el estudio.',
                        resources: ['Técnica Pomodoro para estudio', 'Ejercicios de respiración 4-7-8', 'Planificación semanal de tareas académicas']
                    });
                    break;
                case 'problemas de relación':
                    recommendations.push({
                        theme: 'Problemas de Relación',
                        recommendation: 'Trabajar en habilidades de comunicación asertiva y resolución de conflictos. Explorar patrones relacionales.',
                        resources: ['Libro: "Hábitos atómicos" para comunicación', 'Role-playing de situaciones difíciles', 'Ejercicios de empatía y escucha activa']
                    });
                    break;
                case 'baja autoestima':
                    recommendations.push({
                        theme: 'Baja Autoestima',
                        recommendation: 'Fortalecer el autoconcepto mediante identificación de fortalezas y logros. Practicar autocompasión.',
                        resources: ['Diario de fortalezas personales', 'Ejercicios de autocompasión', 'Visualización positiva diaria']
                    });
                    break;
                case 'trastornos alimenticios':
                    recommendations.push({
                        theme: 'Trastornos Alimenticios',
                        recommendation: 'Trabajar en la relación con la comida y el cuerpo. Establecer patrones alimentarios saludables y mejorar la imagen corporal.',
                        resources: ['Consulta nutricionista especializada', 'Terapia cognitivo-conductual para TCA', 'Grupos de apoyo para recuperación']
                    });
                    break;
                case 'problemas de sueño':
                    recommendations.push({
                        theme: 'Problemas de Sueño',
                        recommendation: 'Implementar higiene del sueño y técnicas de relajación. Identificar factores que afectan el descanso.',
                        resources: ['Rutina de sueño consistente', 'Técnicas de relajación antes de dormir', 'Diario del sueño para identificar patrones']
                    });
                    break;
                case 'estrés laboral':
                    recommendations.push({
                        theme: 'Estrés Laboral',
                        recommendation: 'Desarrollar estrategias de manejo del estrés laboral y establecer límites saludables en el trabajo.',
                        resources: ['Técnicas de time management', 'Ejercicios de mindfulness diarios', 'Establecimiento de límites personales']
                    });
                    break;
                case 'ansiedad general':
                    recommendations.push({
                        theme: 'Ansiedad General',
                        recommendation: 'Practicar técnicas de manejo de ansiedad y identificar triggers. Aprender a diferenciar entre preocupación útil e inútil.',
                        resources: ['Técnicas de respiración profunda', 'Terapia cognitivo-conductual', 'Mindfulness y meditación guiada']
                    });
                    break;
                case 'ataques de pánico':
                    recommendations.push({
                        theme: 'Ataques de Pánico',
                        recommendation: 'Aprender a reconocer los síntomas tempranos y técnicas de interrupción de ataques de pánico.',
                        resources: ['Técnicas de grounding (5-4-3-2-1)', 'Reestructuración cognitiva', 'Programa gradual de exposición']
                    });
                    break;
                case 'toc (trastorno obsesivo)':
                    recommendations.push({
                        theme: 'TOC (Trastorno Obsesivo Compulsivo)',
                        recommendation: 'Trabajar en la reducción gradual de rituales compulsivos y manejo de pensamientos intrusivos.',
                        resources: ['Terapia de exposición con prevención de respuesta', 'Técnicas de aceptación y compromiso', 'Diario de pensamientos obsesivos']
                    });
                    break;
                case 'trauma/abuso':
                    recommendations.push({
                        theme: 'Trauma/Abuso',
                        recommendation: 'Trabajar en el procesamiento del trauma con técnicas especializadas. Reconstruir la sensación de seguridad.',
                        resources: ['EMDR (Desensibilización y Reprocesamiento por Movimientos Oculares)', 'Terapia somática', 'Grupos de apoyo para sobrevivientes']
                    });
                    break;
                case 'adicciones':
                    recommendations.push({
                        theme: 'Adicciones',
                        recommendation: 'Desarrollar plan de recuperación y estrategias para manejar cravings. Identificar triggers y patrones.',
                        resources: ['Programa de 12 pasos', 'Grupos de apoyo especializados', 'Terapia motivacional']
                    });
                    break;
                case 'duelo/pérdida':
                    recommendations.push({
                        theme: 'Duelo/Pérdida',
                        recommendation: 'Acompañar el proceso de duelo permitiendo todas las emociones. Reconstruir la vida post-pérdida.',
                        resources: ['Grupos de duelo especializados', 'Terapia de duelo complicada', 'Rituales de despedida significativos']
                    });
                    break;
                case 'problemas familiares':
                    recommendations.push({
                        theme: 'Problemas Familiares',
                        recommendation: 'Explorar dinámicas familiares y trabajar en comunicación saludable. Establecer límites apropiados.',
                        resources: ['Terapia familiar conjunta', 'Técnicas de comunicación no violenta', 'Análisis de roles familiares']
                    });
                    break;
                case 'conflictos interpersonales':
                    recommendations.push({
                        theme: 'Conflictos Interpersonales',
                        recommendation: 'Desarrollar habilidades de resolución de conflictos y comunicación asertiva.',
                        resources: ['Role-playing de situaciones difíciles', 'Técnicas de negociación win-win', 'Entrenamiento en asertividad']
                    });
                    break;
                case 'problemas de identidad':
                    recommendations.push({
                        theme: 'Problemas de Identidad',
                        recommendation: 'Explorar la identidad personal y valores. Trabajar en la aceptación y auto-descubrimiento.',
                        resources: ['Diario de valores personales', 'Exploración de intereses y pasiones', 'Terapia existencial']
                    });
                    break;
                case 'aislamiento social':
                    recommendations.push({
                        theme: 'Aislamiento Social',
                        recommendation: 'Gradualmente reconstruir conexiones sociales. Identificar barreras y desarrollar habilidades sociales.',
                        resources: ['Grupos de interés compartido', 'Clases de habilidades sociales', 'Voluntariado comunitario']
                    });
                    break;
                case 'estrés financiero':
                    recommendations.push({
                        theme: 'Estrés Financiero',
                        recommendation: 'Desarrollar habilidades de manejo financiero y estrategias para reducir la preocupación económica.',
                        resources: ['Educación financiera básica', 'Presupuesto mensual estructurado', 'Asesoría financiera profesional']
                    });
                    break;
                case 'problemas de salud':
                    recommendations.push({
                        theme: 'Problemas de Salud',
                        recommendation: 'Trabajar en el manejo emocional de la enfermedad. Desarrollar coping skills para síntomas.',
                        resources: ['Grupos de apoyo para pacientes', 'Mindfulness para manejo del dolor', 'Comunicación efectiva con profesionales médicos']
                    });
                    break;
                case 'burnout académico':
                    recommendations.push({
                        theme: 'Burnout Académico',
                        recommendation: 'Recuperar el equilibrio entre estudio y descanso. Reevaluar prioridades académicas.',
                        resources: ['Técnica Pomodoro modificada', 'Establecimiento de límites académicos', 'Actividades de recuperación del burnout']
                    });
                    break;
                case 'miedo al fracaso':
                    recommendations.push({
                        theme: 'Miedo al Fracaso',
                        recommendation: 'Reestructurar creencias sobre el fracaso. Practicar aceptación de imperfección.',
                        resources: ['Reestructuración cognitiva', 'Establecimiento de metas realistas', 'Celebración de esfuerzos, no solo resultados']
                    });
                    break;
                case 'problemas de concentración':
                    recommendations.push({
                        theme: 'Problemas de Concentración',
                        recommendation: 'Identificar distractores y desarrollar estrategias de atención sostenida.',
                        resources: ['Técnicas de atención plena', 'Gestión del entorno de estudio', 'Ejercicios de concentración graduados']
                    });
                    break;
                case 'ansiedad por el futuro':
                    recommendations.push({
                        theme: 'Ansiedad por el Futuro',
                        recommendation: 'Trabajar en tolerancia a la incertidumbre. Desarrollar visión positiva del futuro.',
                        resources: ['Visualización positiva del futuro', 'Mindfulness para incertidumbre', 'Planificación flexible y adaptable']
                    });
                    break;
                case 'problemas de autoimagen':
                    recommendations.push({
                        theme: 'Problemas de Autoimagen',
                        recommendation: 'Trabajar en aceptación corporal y reducción de comparación social.',
                        resources: ['Ejercicios de autocompasión corporal', 'Limitar exposición a redes sociales', 'Terapia de aceptación corporal']
                    });
                    break;
                case 'estrés por cambios':
                    recommendations.push({
                        theme: 'Estrés por Cambios',
                        recommendation: 'Desarrollar resiliencia al cambio y habilidades de adaptación.',
                        resources: ['Rutinas de anclaje durante transiciones', 'Mindfulness para cambios', 'Construcción de red de apoyo']
                    });
                    break;
                case 'soledad emocional':
                    recommendations.push({
                        theme: 'Soledad Emocional',
                        recommendation: 'Desarrollar capacidad para conexión emocional profunda. Identificar barreras a la intimidad.',
                        resources: ['Terapia de apego', 'Práctica de vulnerabilidad', 'Construcción de relaciones significativas']
                    });
                    break;
                default:
                    recommendations.push({
                        theme: theme,
                        recommendation: `Tema recurrente identificado: ${theme}. Se recomienda explorar más profundamente este tema en las próximas sesiones.`,
                        resources: ['Continuar monitoreando la evolución del tema', 'Documentar situaciones específicas relacionadas']
                    });
            }
        });

        return recommendations;
    };

    // Función para generar el insight IA
    const handleGenerateInsight = async () => {
        setGenerating(true);
        setInsight("");
        try {
            const aprendizajes = notes.map(n => n.aprendizaje_obtenido).filter(Boolean);
            const res = await fetch(`${API_BASE_URL}/attendance-insight`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texts: aprendizajes })
            });
            const result = await res.json();

            // Detectar temas consistentes
            const consistentThemes = detectConsistentThemes();
            const recommendations = generateRecommendations(consistentThemes);

            // Construir insight mejorado
            let enhancedInsight = result.summary;

            if (recommendations.length > 0) {
                enhancedInsight += "\n\n🎯 TEMAS CONSISTENTES IDENTIFICADOS:\n";
                recommendations.forEach((rec, index) => {
                    enhancedInsight += `\n${index + 1}. ${rec.theme} (aparece en ${rec.count}/3 últimas sesiones)\n`;
                    enhancedInsight += `   Recomendación: ${rec.recommendation}\n`;
                    enhancedInsight += `   Recursos sugeridos:\n`;
                    rec.resources.forEach(resource => {
                        enhancedInsight += `   • ${resource}\n`;
                    });
                    enhancedInsight += "\n";
                });
            }

            setInsight(enhancedInsight);
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

                            {/* Análisis de Temas */}
                            {analysis.topics && (
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
                                        Análisis de Temas Principales
                                    </h3>
                                    <div style={{ marginBottom: "1rem" }}>
                                        {analysis.topics.map((topic, index) => (
                                            <div key={index} style={{
                                                marginBottom: "0.5rem",
                                                padding: "0.5rem",
                                                background: "#f8f9fa",
                                                borderRadius: "0.5rem",
                                                border: "1px solid #e9ecef"
                                            }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    color: "var(--color-primary)",
                                                    marginBottom: "0.3rem"
                                                }}>
                                                    Tema {index + 1}: {topic.name}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.9rem",
                                                    color: "var(--color-text-gray)",
                                                    marginBottom: "0.3rem"
                                                }}>
                                                    Palabras clave: {topic.keywords.join(", ")}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.85rem",
                                                    color: "#6c757d"
                                                }}>
                                                    Frecuencia: {topic.frequency}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                                // Color para sentimiento
                                let sentimientoColor = "var(--color-primary)";
                                if (n.sentimiento === "NEG") sentimientoColor = "#d72660";
                                else if (n.sentimiento === "POS") sentimientoColor = "#2563eb";
                                else if (n.sentimiento === "NEU") sentimientoColor = "#f59e0b";
                                // Color para emoción
                                let emocionBg = "#e4f3ff";
                                let emocionColor = "#2563eb";
                                if (n.emocion === "sadness") {
                                    emocionBg = "#fee2e2";
                                    emocionColor = "#dc2626";
                                } else if (n.emocion === "joy") {
                                    emocionBg = "#fef3c7";
                                    emocionColor = "#d97706";
                                } else if (n.emocion === "anger") {
                                    emocionBg = "#fee2e2";
                                    emocionColor = "#b91c1c";
                                } else if (n.emocion === "fear") {
                                    emocionBg = "#e0e7ff";
                                    emocionColor = "#3730a3";
                                } else if (n.emocion === "surprise") {
                                    emocionBg = "#ecfdf5";
                                    emocionColor = "#047857";
                                }
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
                                        {n.topics && n.topics.length > 0 && (
                                            <div style={{
                                                marginTop: "0.5rem",
                                                display: "flex",
                                                flexWrap: "wrap",
                                                gap: "0.3rem"
                                            }}>
                                                {n.topics.map((topic, index) => (
                                                    <span key={index} style={{
                                                        display: "inline-block",
                                                        padding: "0.2rem 0.6rem",
                                                        background: "#e3f2fd",
                                                        color: "#1976d2",
                                                        borderRadius: "1rem",
                                                        fontSize: "0.85rem",
                                                        fontWeight: 600
                                                    }}>
                                                        Tema: {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <Chatbot
                            context={{
                                sentimientos: analysis.sentiments,
                                emociones: analysis.emotions,
                                temas: analysis.topics,
                                resumen: insight
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}