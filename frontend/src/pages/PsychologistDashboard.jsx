// src/pages/PsychologistDashboard.jsx

export default function PsychologistDashboard() {
  return (
    <div className="p-8 bg-white rounded-lg shadow-xl max-w-3xl">
      <h2 className="text-3xl font-bold text-indigo-800 mb-4">
        Resumen General del Portal 📊
      </h2>
      <p className="text-gray-600 text-lg mb-6">
        Utiliza el menú lateral izquierdo para acceder a los módulos de gestión y seguimiento de estudiantes.
      </p>
      
      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Módulo Recomendado:</h3>
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
            <p className="font-bold text-indigo-700">Seguimiento Diario</p>
            <p className="text-sm text-indigo-600">Revisa el estado emocional reciente de tus estudiantes.</p>
        </div>
      </div>
      
    </div>
  );
}