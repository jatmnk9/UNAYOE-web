// src/components/StudentReport.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Modelo para los datos de análisis
const initialAnalysis = {
    sentiments: null,
    emotions: null,
    wordcloud: null,
};

export default function StudentReport() {
    const { studentId } = useParams(); // Obtener el ID del estudiante de la URL
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState(initialAnalysis);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            // Llama al nuevo endpoint que obtiene, analiza y genera gráficos
            const res = await fetch(`http://127.0.0.1:8000/analyze/${studentId}`);
            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.detail || "Error al obtener el reporte.");
            }

            setAnalysis(result.analysis || initialAnalysis);
            setNotes(result.notes || []);

        } catch (err) {
            console.error("Error en la carga del reporte:", err);
            setError(err.message || "No se pudo cargar el reporte. El estudiante puede no tener notas.");
        } finally {
            setLoading(false);
        }
    };
    
    // Función para exportar los datos como CSV
    const handleExportCSV = () => {
        // Redirigir a la URL del backend para forzar la descarga
        window.open(`http://127.0.0.1:8000/export/${studentId}`, '_blank');
    };

    useEffect(() => {
        fetchAnalysis();
    }, [studentId]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Generando reporte de análisis...</div>;
    }
    
    if (error) {
        return <div className="min-h-screen p-6 text-center text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="w-full max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8 pb-4 border-b">
                    <h1 className="text-3xl font-bold text-indigo-700">
                        Seguimiento Diario (Estudiante ID: {studentId.substring(0, 8)}...)
                    </h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleExportCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                        >
                            Exportar Reporte (CSV)
                        </button>
                        <button 
                            onClick={() => navigate('/psychologist')}
                            className="px-4 py-2 bg-gray-400 text-white rounded-lg shadow hover:bg-gray-500 transition"
                        >
                            Volver al Listado
                        </button>
                    </div>
                </header>
                
                {notes.length === 0 ? (
                    <div className="text-center py-10 text-gray-600 border rounded-lg bg-white">
                        <p className="text-xl font-semibold">Este estudiante no tiene notas de diario para analizar.</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">Análisis Visual de Notas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Gráfico de Sentimientos */}
                            {analysis.sentiments && (
                                <div className="bg-white p-4 shadow rounded-lg">
                                    <h3 className="text-xl font-medium mb-2">Distribución de Sentimientos</h3>
                                    <img src={`data:image/png;base64,${analysis.sentiments}`} alt="Gráfico de Sentimientos" className="w-full h-auto"/>
                                </div>
                            )}
                            
                            {/* Gráfico de Emociones */}
                            {analysis.emotions && (
                                <div className="bg-white p-4 shadow rounded-lg">
                                    <h3 className="text-xl font-medium mb-2">Distribución de Emociones</h3>
                                    <img src={`data:image/png;base64,${analysis.emotions}`} alt="Gráfico de Emociones" className="w-full h-auto"/>
                                </div>
                            )}
                            
                            {/* Nube de Palabras (Ocupa todo el ancho) */}
                            {analysis.wordcloud && (
                                <div className="col-span-1 md:col-span-2 bg-white p-4 shadow rounded-lg">
                                    <h3 className="text-xl font-medium mb-2">Nube de Palabras Clave</h3>
                                    <img src={`data:image/png;base64,${analysis.wordcloud}`} alt="Nube de Palabras" className="w-full h-auto"/>
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-semibold mb-4">Notas Individuales ({notes.length} en total)</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {notes.map((n) => (
                                <div key={n.id} className="p-4 bg-white shadow rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-400 mb-1">
                                        {new Date(n.created_at).toLocaleString()}
                                    </p>
                                    <p className="font-medium text-gray-800 mb-2">{n.nota}</p>
                                    <div className="text-sm space-x-4">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            Sentimiento: {n.sentimiento}
                                        </span>
                                        <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full">
                                            Emoción: {n.emocion} ({(n.emocion_score * 100).toFixed(1)}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}