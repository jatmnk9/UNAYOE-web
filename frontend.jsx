import React, { useState, useEffect } from 'react';

// Componente para gráficos de barras
const BarChartComponent = ({ data, title }) => {
  const dataArray = Object.keys(data).map(key => ({
    label: key,
    value: data[key],
  }));

  useEffect(() => {
    // Código para renderizar el gráfico con Chart.js
    const ctx = document.getElementById(title.replace(/\s+/g, '')).getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dataArray.map(d => d.label),
          datasets: [{
            label: title,
            data: dataArray.map(d => d.value),
            backgroundColor: ['#6366F1', '#EC4899', '#34D399', '#F97316', '#A855F7'],
            borderColor: ['#4F46E5', '#BE185D', '#047857', '#C2410C', '#6B21A8'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: title, font: { size: 16 } }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }
  }, [data, title, dataArray]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="relative h-64">
        <canvas id={title.replace(/\s+/g, '')}></canvas>
      </div>
    </div>
  );
};

// Componente para Nube de Palabras
const WordCloudComponent = ({ data }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-xl font-semibold mb-4 text-center">Nube de Palabras</h3>
    <div className="flex flex-wrap justify-center items-center gap-2 p-4">
      {data.map((word, index) => (
        <span
          key={index}
          className="font-inter font-semibold rounded-full px-4 py-2"
          style={{
            fontSize: `${word.value + 12}px`,
            backgroundColor: `rgba(99, 102, 241, ${word.value / 10})`,
            color: 'white',
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  </div>
);

// Componente principal de la aplicación
const App = () => {
  const [view, setView] = useState('student');
  const [currentDate, setCurrentDate] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem('diarioNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (currentNote && currentDate) {
      const newNote = { date: currentDate, note: currentNote };
      const newNotes = [...notes, newNote];
      setNotes(newNotes);
      localStorage.setItem('diarioNotes', JSON.stringify(newNotes));
      setCurrentNote('');
      setCurrentDate('');
    }
  };

  const handleGenerateReport = async () => {
    if (notes.length === 0) {
      alert("No hay notas para analizar.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notes.map(n => ({ date: n.date, note: n.note }))),
      });
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error("Error al obtener el análisis:", error);
      alert("Error al conectar con el servidor. Asegúrate de que el backend.py esté en ejecución.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-800">Mi Diario de Bienestar</h1>
          <div className="flex gap-2 bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setView('student')}
              className={`px-4 py-2 rounded-full font-medium ${view === 'student' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
            >
              Estudiante
            </button>
            <button
              onClick={() => setView('psychologist')}
              className={`px-4 py-2 rounded-full font-medium ${view === 'psychologist' ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}
            >
              Psicólogo
            </button>
          </div>
        </header>
        <hr className="border-gray-300 mb-8" />
        
        {view === 'student' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Escribe tu nota diaria</h2>
            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-gray-600 font-medium mb-1">Fecha</label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-1">¿Cómo te sientes hoy?</label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Escribe aquí tu nota..."
                  required
                ></textarea>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
            <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Notas Guardadas</h3>
            <div className="space-y-4">
              {notes.length === 0 ? (
                <p className="text-gray-500 italic">Aún no has guardado ninguna nota.</p>
              ) : (
                notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-500 font-semibold">{note.date}</p>
                    <p className="text-gray-700 mt-2">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {view === 'psychologist' && (
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Panel del Psicólogo</h2>
            <p className="text-gray-600 mb-6">
              Haz clic para generar un reporte de análisis de las notas del estudiante.
            </p>
            <button
              onClick={handleGenerateReport}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md mb-8 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </button>
            
            {report && (
              <div className="grid md:grid-cols-2 gap-8">
                <BarChartComponent data={report.sentiments} title="Distribución de Sentimientos" />
                <BarChartComponent data={report.emotions} title="Distribución de Emociones" />
                <div className="md:col-span-2">
                  <WordCloudComponent data={report.wordCloudData} />
                </div>
                <div className="md:col-span-2">
                  <BarChartComponent data={report.termFrequency} title="Top 10 Palabras más Frecuentes" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
