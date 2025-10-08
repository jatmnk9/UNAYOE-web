import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function MiDiarioDeBienestar() {
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

  const fetchNotes = async (userId) => {
    if (!userId) {
      setNotes([]);
      setNotesLoading(false);
      return;
    }
    try {
      setNotesLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/notas/${userId}`);
      const result = await res.json();
      setNotes(result.data || []);
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
    <div className="portal-main-content">
      <div
        className="login-card"
        style={{
          maxWidth: "700px",
          margin: "2rem auto",
          padding: "2.5rem 2rem",
          borderRadius: "1.2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          background: "var(--color-soft-bg)",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--color-primary)",
            marginBottom: "0.5rem",
            textAlign: "center",
            borderBottom: "2px solid var(--color-soft-bg)",
            paddingBottom: "0.7rem"
          }}
        >
          Mi Diario de Bienestar 🧘‍♀️
        </h1>
        <p style={{
          color: "var(--color-dark)",
          fontSize: "1.05rem",
          marginBottom: "1.5rem",
          textAlign: "center",
          fontWeight: 500
        }}>
          Escribe cómo te sientes hoy. Analizaremos tu nota para ayudarte a monitorear tu bienestar.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escribe tu nota aquí..."
          disabled={loading || notesLoading}
          style={{
            width: "100%",
            height: "90px",
            padding: "1rem",
            border: "1.5px solid var(--color-primary)",
            borderRadius: "0.7rem",
            marginBottom: "1rem",
            fontSize: "1rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            outline: "none",
            background: "#fff",
            resize: "vertical",
            transition: "border 0.2s, box-shadow 0.2s"
          }}
          onFocus={e => (e.target.style.borderColor = "var(--color-dark)")}
          onBlur={e => (e.target.style.borderColor = "var(--color-primary)")}
        />

        <button
          onClick={handleAddNote}
          disabled={loading || !note.trim()}
          style={{
            width: "100%",
            padding: "0.85rem 0",
            background: "var(--color-primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.05rem",
            borderRadius: "0.7rem",
            border: "none",
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s, box-shadow 0.2s",
            marginBottom: "1.5rem",
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={e => !loading && (e.target.style.background = "var(--color-dark)")}
          onMouseOut={e => !loading && (e.target.style.background = "var(--color-primary)")}
        >
          {loading ? "Analizando..." : "Guardar y Analizar"}
        </button>

        <div style={{ marginTop: "2rem" }}>
          <h2 style={{
            fontWeight: 600,
            fontSize: "1.3rem",
            color: "var(--color-dark)",
            borderBottom: "1px solid #eee",
            paddingBottom: "0.5rem",
            marginBottom: "1.2rem"
          }}>
            Historial de Notas
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "350px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {notesLoading && <p style={{ color: "var(--color-text-gray)" }}>Cargando notas...</p>}
            {notes.length === 0 && !notesLoading && (
              <p style={{ color: "var(--color-text-gray)" }}>Aún no tienes notas guardadas. ¡Comienza a escribir!</p>
            )}
            {notes.map((n) => {
              let sentimientoColor = "var(--color-primary)";
              if (n.sentimiento === "NEG") sentimientoColor = "#d72660";
              else if (n.sentimiento === "POS") sentimientoColor = "#2563eb";
              return (
                <div key={n.id} style={{
                  background: "#fff",
                  padding: "1rem",
                  borderRadius: "0.7rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  border: "1px solid #eee"
                }}>
                  <p style={{
                    fontWeight: 500,
                    color: "var(--color-dark)",
                    marginBottom: "0.5rem"
                  }}>
                    {n.nota}
                  </p>
                  <div style={{ fontSize: "0.95rem", display: "flex", gap: "1rem" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "0.3rem 0.8rem",
                      background: "var(--color-soft-bg)",
                      color: sentimientoColor,
                      borderRadius: "1rem",
                      fontWeight: 600
                    }}>
                      Sentimiento: {n.sentimiento}
                    </span>
                    <span style={{
                      display: "inline-block",
                      padding: "0.3rem 0.8rem",
                      background: "#e4f3ffff",
                      color: "#3526d7ff",
                      borderRadius: "1rem",
                      fontWeight: 600
                    }}>
                      Emoción: {n.emocion} ({(n.emocion_score * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p style={{
                    fontSize: "0.92rem",
                    color: "var(--color-text-gray)",
                    marginTop: "0.5rem"
                  }}>
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}