import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";

// 🎙️ Configuración de reconocimiento de voz
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function MiDiarioDeBienestar() {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 3;
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [accompanimentText, setAccompanimentText] = useState(null);
  const [showAccompaniment, setShowAccompaniment] = useState(false);
  const [isListening, setIsListening] = useState(false); // 🎙️ Estado de escucha
  

  // --- Lógica de Backend (REAL) ---
  const fetchNotes = async (userId) => {
    if (!userId) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    try {
      setNotesLoading(true);
      // Asegúrate de que esta URL sea accesible desde tu entorno de desarrollo
      const res = await fetch(`${API_BASE_URL}/notas/${userId}`);
      if (!res.ok) throw new Error(`Error al obtener notas: ${res.status}`);
  const result = await res.json();
  // Reiniciar la página a la primera cuando se cargan notas
  setNotes(result.data || []);
  setCurrentPage(0);
    } catch (err) {
      console.error("Error cargando notas:", err);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotes(user.id);
    }
  }, [user]);

  // 🎙️ Función para manejar el dictado por voz
  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el dictado por voz. Por favor, utiliza la escritura manual.");
      return;
    }

    if (isListening) {
      // Detener si ya está escuchando (por si acaso)
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES'; // Configurar el idioma a español
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Añadir el texto dictado al campo existente, con un espacio si ya hay contenido
      setNote((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert("Acceso al micrófono denegado. Por favor, permite el acceso en la configuración de tu navegador.");
      } else if (event.error !== 'no-speech') {
        // No alertar si solo fue que no se detectó habla (se maneja mejor con onend)
        alert(`Error de dictado: ${event.error}.`);
      }
    };

    recognition.start();
  };

  const handleAddNote = async () => {
    if (!note.trim() || !user) {
      // Se elimina el alert para una mejor experiencia de usuario. El botón ya está deshabilitado.
      return;
    }
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note,
          // Se envía el título generado por la IA (o uno por defecto)
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
        // Si la respuesta no devuelve la nota, la volvemos a cargar
        fetchNotes(user.id);
      }

      setNote("");

      // Mostrar acompañamiento si viene desde el backend
      if (result.accompaniment) {
        setAccompanimentText(result.accompaniment);
        setShowAccompaniment(true);
      }
    } catch (err) {
      console.error("Error enviando o procesando la nota:", err);
      // Considera mostrar un mensaje de error no invasivo aquí
    } finally {
      setLoading(false);
    }
  };
  
  // --- Simulación de IA Generativa para Títulos (se mantiene como simulación) ---
  // MiDiarioDeBienestar.jsx

// ... (tus imports y estados iniciales)

  // --- Lógica de Backend (REAL) ---
  // ... (tus otras funciones como fetchNotes y handleAddNote)


// ... (el resto de tu componente, incluido el return)

  const getSentimentColor = (sentiment) => {
    if (sentiment === "NEG") return "#d72660";
    if (sentiment === "POS") return "#2563eb";
    return "#6b7280";
  };

  // Convierte la respuesta del backend (que puede ser string u objeto) a texto seguro para renderizar
  const formatAccompaniment = (accomp) => {
    if (!accomp && accomp !== 0) return '';
    if (typeof accomp === 'string') return accomp;
    // Si es un array, intentar unir elementos (si son strings u objetos con 'text'/'content')
    if (Array.isArray(accomp)) {
      return accomp.map((it) => formatAccompaniment(it)).filter(Boolean).join('\n\n');
    }
    // Si es objeto, intentar extraer campos comunes
    if (typeof accomp === 'object') {
      // 1) parts (generateContent): { parts: [{ text: '...' }, ...] }
      if (accomp.parts && Array.isArray(accomp.parts)) {
        return accomp.parts.map(p => (typeof p === 'string' ? p : p.text || JSON.stringify(p))).join('\n');
      }
      // 2) candidates / outputs
      if (accomp.candidates && Array.isArray(accomp.candidates) && accomp.candidates.length > 0) {
        const first = accomp.candidates[0];
        if (first.parts) return formatAccompaniment(first.parts);
        return first.content || first.output || first.text || JSON.stringify(first);
      }
      if (accomp.outputs && Array.isArray(accomp.outputs) && accomp.outputs.length > 0) {
        const first = accomp.outputs[0];
        if (first.parts) return formatAccompaniment(first.parts);
        return first.content || first.output || first.text || JSON.stringify(first);
      }

      // 3) buscar claves comunes
      for (const k of ['content', 'output', 'text']) {
        if (k in accomp && typeof accomp[k] === 'string') return accomp[k];
      }

      // 4) fallback: stringify (con límite)
      try {
        const s = JSON.stringify(accomp, null, 2);
        return s.length > 1000 ? s.slice(0, 1000) + '...' : s;
      } catch (e) {
        return String(accomp);
      }
    }

    return String(accomp);
  };
  
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Karla:wght@400;500;700&display=swap');
        
        .book-background {
          padding: 3rem 1rem;
          background: #e0dcd1; /* Color de fondo para simular una mesa */
        }

        .book-container {
          max-width: 1200px;
          min-height: 80vh;
          margin: auto;
          display: flex;
          background: #fdfaf5;
          border-radius: 6px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2), 
                      inset 0 0 10px rgba(0,0,0,0.1);
          position: relative;
        }

        .book-container::before { /* Simulación del lomo del libro */
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          top: 10px;
          bottom: 10px;
          background-image: linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.05) 30%, rgba(255,255,255,0.05) 70%, rgba(255,255,255,0.15));
          box-shadow: inset 2px 0 5px rgba(0,0,0,0.1), inset -2px 0 5px rgba(0,0,0,0.1);
        }

        .page {
          width: 50%;
          padding: 2.5rem 3rem;
          font-family: 'Karla', sans-serif;
          color: #333;
          display: flex;
          flex-direction: column;
        }
        
        .left-page {
          border-right: 1px dashed #c9c4b8;
        }

        .right-page {
          border-left: 1px dashed #c9c4b8;
        }

        .diary-header h1 {
          font-family: 'Merriweather', serif;
          font-size: 2.2rem;
          color: #2c3e50;
        }

        .diary-header p {
          font-family: 'Merriweather', serif; font-style: italic;
          color: #555; font-size: 1rem; margin-bottom: 1.5rem;
        }
        
        .diary-textarea-container {
          position: relative;
          width: 100%;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .diary-textarea {
          width: 100%; flex-grow: 1; min-height: 200px;
          border: 1.5px solid #d1c7b8; background-color: transparent;
          /* Estilo de líneas de cuaderno */
          background-image: linear-gradient(#e0dcd1 1px, transparent 1px);
          background-size: 100% 1.8em;
          line-height: 1.8em;
          padding: 0.5rem 3rem 0.5rem 1rem; /* Espacio para el botón de micrófono */
        }
        
        .diary-textarea:focus { outline: none; border-color: #a08c72; }

        .voice-input-button {
          position: absolute;
          right: 10px;
          top: 10px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.3rem;
          border-radius: 50%;
          color: var(--color-primary, #34495e);
          opacity: 1;
          transition: color 0.2s, background 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-input-button:hover:not(:disabled) {
          background: rgba(52, 73, 94, 0.1);
          transform: scale(1.1);
        }

        .voice-input-button:disabled {
          cursor: default;
          opacity: 0.5;
        }

        .voice-input-button.listening {
          color: #EC4899;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        

        .actions-toolbar { display: flex; gap: 1rem; margin-top: 1rem; }
        
        .ai-button, .diary-button {
          padding: 0.7rem 1.2rem; border-radius: 8px; border: none;
          font-weight: 700; font-size: 0.9rem; cursor: pointer;
          transition: all 0.3s;
        }
        
        .ai-button { background-color: #e8eaf6; color: #3f51b5; }
        .ai-button:hover:not(:disabled) { background-color: #c5cae9; }
        
        .diary-button { background-color: #34495e; color: white; flex-grow: 1; }
        .diary-button:hover:not(:disabled) { background-color: #2c3e50; }
        .diary-button:disabled { background-color: #95a5a6; cursor: not-allowed; }

        .notes-section h2 {
          font-family: 'Merriweather', serif; font-size: 1.8rem;
          color: #2c3e50; margin-bottom: 1.5rem;
        }
        
        .notes-list { flex-grow: 1; overflow-y: auto; padding-right: 1rem; }
        
        .note-card {
          background: rgba(255,255,255,0.5); padding: 1.2rem; border-radius: 4px;
          border: 1px solid #e8e2d7; margin-bottom: 1.2rem;
        }
        .note-card h3 { font-family: 'Merriweather', serif; margin: 0 0 0.5rem 0; color: #34495e; }
        .note-card p:first-of-type { margin: 0; line-height: 1.6; }
        .note-tags { margin-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.7rem; }
        .note-tag { padding: 0.3rem 0.8rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 500;}
        .note-date { margin-top: 1rem; font-size: 0.8rem; color: #777; text-align: right; }
      `}</style>
      
      <div className="book-background">
        <div className="book-container">
          {/* --- PÁGINA IZQUIERDA: ESCRITURA --- */}
          <div className="page left-page">
            <div className="diary-header">
              <h1>Mi Diario de Bienestar 🧘‍♀️</h1>
              <p>Un espacio para ti. Escribe cómo te sientes, reflexiona y observa tu camino.</p>
            </div>
            
            {/* 🎙️ CONTENEDOR DE DICTADO POR VOZ */}
            <div className="diary-textarea-container">
              <textarea
                className="diary-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Querido diario..."
                disabled={loading || notesLoading}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={!SpeechRecognition || isListening || loading || notesLoading}
                title={!SpeechRecognition ? "Dictado no soportado" : (isListening ? "Escuchando..." : "Dictar por voz")}
                className={`voice-input-button ${isListening ? 'listening' : ''}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm0 14c-2.76 0-5.32-2.02-5.32-5h-2.08c0 3.99 3.23 7.35 7.4 8v3H12a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2h-1.57v-3c4.17-.65 7.4-4 7.4-8h-2.08c0 2.98-2.56 5-5.32 5z"/>
                </svg>
              </button>
            </div>
            {/* FIN CONTENEDOR DE DICTADO POR VOZ */}
            <div className="actions-toolbar">
               
              <button
                className="diary-button"
                onClick={handleAddNote}
                disabled={loading || !note.trim()}
              >
                {loading ? "Guardando..." : "Guardar Página"}
              </button>
            </div>
          </div>

          {/* --- PÁGINA DERECHA: HISTORIAL --- */}
          <div className="page right-page">
            <div className="notes-section">
              <h2>Notas</h2>
              <div className="notes-list">
                {notesLoading && <p>Buscando en el pasado...</p>}
                {notes.length === 0 && !notesLoading && <p>Tu diario espera la primera historia.</p>}
                {(() => {
                  // Calcular notas visibles según la página actual
                  const start = currentPage * ITEMS_PER_PAGE;
                  const visibleNotes = notes.slice(start, start + ITEMS_PER_PAGE);
                  return visibleNotes.map((n) => (
                  <div key={n.id} className="note-card">
                    <p>{n.nota}</p>
                    <div className="note-tags">
                      <span className="note-tag" style={{ color: getSentimentColor(n.sentimiento), background: 'rgba(107, 114, 128, 0.1)' }}>
                        Sentimiento: {n.sentimiento}
                      </span>
                       <span className="note-tag" style={{color: '#3526d7', background: 'rgba(53, 38, 215, 0.1)'}}>
                         Emoción: {n.emocion} ({(n.emocion_score * 100).toFixed(0)}%)
                      </span>
                    </div>
                    <p className="note-date">
                      {new Date(n.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </div>
                  ));
                })()}
              </div>
              {/* Controles de paginación */}
              {notes.length > ITEMS_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    aria-label="Anterior"
                    style={{ padding: '0.4rem 0.7rem', borderRadius: 6, border: 'none', background: '#f0f0f0', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    ← Anterior
                  </button>

                  <div style={{ fontSize: 14, color: '#555' }}>{`${currentPage + 1} / ${Math.ceil(notes.length / ITEMS_PER_PAGE)}`}</div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(notes.length / ITEMS_PER_PAGE) - 1, p + 1))}
                    disabled={currentPage >= Math.ceil(notes.length / ITEMS_PER_PAGE) - 1}
                    aria-label="Siguiente"
                    style={{ padding: '0.4rem 0.7rem', borderRadius: 6, border: 'none', background: '#34495e', color: 'white', cursor: currentPage >= Math.ceil(notes.length / ITEMS_PER_PAGE) - 1 ? 'not-allowed' : 'pointer' }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
            </div>

            {/* Modal de acompañamiento AI */}
            {showAccompaniment && accompanimentText && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Acompañamiento"
                style={{
                  position: 'fixed',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  zIndex: 60
                }}
                onClick={() => setShowAccompaniment(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 'min(720px, 92%)',
                    background: 'white',
                    borderRadius: 10,
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    position: 'relative'
                  }}
                >
                  <button
                    aria-label="Cerrar acompañamiento"
                    onClick={() => setShowAccompaniment(false)}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 8,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 20,
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                  <h3 style={{ marginTop: 0, fontFamily: 'Merriweather, serif' }}>Un mensaje para ti</h3>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{formatAccompaniment(accompanimentText)}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => setShowAccompaniment(false)}
                      style={{ padding: '0.5rem 0.9rem', borderRadius: 8, border: 'none', background: '#34495e', color: 'white' }}
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}
    </>
  );
}

