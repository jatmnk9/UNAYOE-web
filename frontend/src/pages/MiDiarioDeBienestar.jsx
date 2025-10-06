// src/components/MiDiarioDeBienestar.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function MiDiarioDeBienestar() {
  // 🔑 Usar el hook useAuth para obtener el estado y la función de logout
  const { user } = useAuth();

  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  // Función de carga de notas (Asumiendo que tu backend en 8000 está corriendo)
  const fetchNotes = async (userId) => {
    if (!userId) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    try {
      setNotesLoading(true);
      // Utilizamos fetchNotes solo para cargar notas
      const res = await fetch(`http://127.0.0.1:8000/notas/${userId}`);
      const result = await res.json();
      setNotes(result.data || []);
    } catch (err) {
      console.error("Error cargando notas:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  // 🔑 Lógica para cargar notas cuando el usuario del CONTEXTO cambie
  useEffect(() => {
    if (user?.id) {
      fetchNotes(user.id);
    }
    // NOTA: 'user' viene del AuthContext, que ya está siendo manejado por StudentPortal (o ProtectedRoute)
  }, [user]);

  const handleAddNote = async () => {
    if (!note.trim() || !user) {
      if (!user) alert("Debes iniciar sesión para guardar notas");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          user_id: user.id,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Error HTTP ${res.status}: ${errorBody.substring(0, 100)}`);
      }

      const result = await res.json();

      if (result.data && result.data.length > 0) {
        const newNote = result.data[0];
        setNotes((prev) => [newNote, ...prev]);
      } else {
        fetchNotes(user.id);
      }

      setNote("");
    } catch (err) {
      console.error("Error enviando o procesando la nota:", err);
      alert(`Error enviando la nota ❌. Detalle: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h3 className="text-xl font-semibold text-blue-700 mb-4">Mi Diario de Bienestar 🧘‍♀️</h3>
      <p className="text-gray-600 mb-4">
        Escribe cómo te sientes hoy. Analizaremos tu nota para ayudarte a monitorear tu bienestar.
      </p>
      
      {/* Formulario de notas */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="w-full h-32 p-3 border rounded mb-4 focus:ring-blue-500 focus:border-blue-500"
        disabled={loading || notesLoading}
      />

      <button
        onClick={handleAddNote}
        disabled={loading || !note.trim()}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition duration-150"
      >
        {loading ? "Analizando..." : "Guardar y Analizar"}
      </button>

      <div className="mt-6">
        <h4 className="font-bold text-lg border-b pb-2 mb-3">Historial de Notas</h4>
        <ul className="space-y-3">
          {notesLoading && <p className="text-gray-500">Cargando notas...</p>}
          {notes.length === 0 && !notesLoading && (
            <p className="text-gray-500">Aún no tienes notas guardadas. ¡Comienza a escribir!</p>
          )}
          {notes.map((n) => (
            <li key={n.id} className="p-4 bg-gray-50 border-l-4 border-blue-500 shadow-sm rounded">
              <p className="font-medium mb-1">{n.nota}</p>
              <div className="text-sm text-gray-700 flex justify-between">
                <p>
                  <span className="font-semibold">Sentimiento:</span> {n.sentimiento} 
                  {' | '} 
                  <span className="font-semibold">Emoción:</span> {n.emocion} ({(n.emocion_score * 100).toFixed(1)}%)
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(n.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}