// src/components/SeguimientoDiario.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SeguimientoDiario() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Función para obtener la lista de estudiantes desde el backend de FastAPI
    const fetchStudents = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/psychologist/students');
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
    }, []);

    const handleViewReport = (studentId) => {
        // Navegar a la ruta de reporte individual
        navigate(`/psychologist/seguimiento/${studentId}`);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-indigo-600">Cargando lista de estudiantes...</div>;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-xl">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-2">Seguimiento Diario de Pacientes</h2>
            
            <div className="mb-4">
                <button 
                    onClick={() => navigate('/psychologist')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                    ← Volver al Portal
                </button>
            </div>

            {students.length === 0 ? (
                <p className="text-gray-600">No hay estudiantes asignados para seguimiento.</p>
            ) : (
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Nombre Completo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    Código
                                </th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {student.nombre} {student.apellido}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {student.codigo_alumno}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewReport(student.id)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition"
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
    );
}