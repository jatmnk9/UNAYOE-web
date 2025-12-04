import { useState, useContext } from "react";
import { useAuth } from "../context/AuthContext"; // Igual que en MiDiarioDeBienestar

// =========================================================
// 🎙️ NUEVO: Lógica y Estado para el Dictado por Voz
// =========================================================
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const steps = [
  "Datos de la Consulta",
  "Experiencia y Aprendizaje"
];

export default function StudentAttendance() {
  const { user } = useAuth(); // user.id es el id_usuario

  const [step, setStep] = useState(0);
  const [isListening, setIsListening] = useState(false); // 🎙️ Estado de escucha
  const [form, setForm] = useState({
    fecha_atencion: "",
    nro_sesion: "",
    modalidad_atencion: "",
    motivo_atencion: [],
    detalle_problema_actual: "",
    acude_profesional_particular: "",
    diagnostico_particular: "",
    tipo_tratamiento_actual: "",
    comodidad_unayoe: "",
    aprendizaje_obtenido: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        motivo_atencion: checked
          ? [...prev.motivo_atencion, value]
          : prev.motivo_atencion.filter((m) => m !== value),
      }));
    } else if (type === "radio" && (name === "acude_profesional_particular" || name === "comodidad_unayoe")) {
      setForm((prev) => ({ ...prev, [name]: value === "SI" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    if (step > 0) setStep(step - 1);
  };

  // 🎙️ Función para manejar el dictado por voz
  const handleVoiceInput = () => {
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta el dictado por voz. Por favor, utiliza la escritura manual.");
      return;
    }

    if (isListening) {
        // Detener si ya está escuchando (por si acaso)
        // Se puede añadir un control de reconocimiento aquí si lo necesitas
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
      setForm((prev) => ({ 
        ...prev, 
        aprendizaje_obtenido: prev.aprendizaje_obtenido + (prev.aprendizaje_obtenido ? " " : "") + transcript
      }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert("Debes iniciar sesión para registrar asistencia.");
      return;
    }
    try {
      const payload = {
        id_usuario: user.id, // Usa el id del usuario autenticado
        fecha_atencion: form.fecha_atencion,
        nro_sesion: parseInt(form.nro_sesion),
        modalidad_atencion: form.modalidad_atencion,
        motivo_atencion: form.motivo_atencion.join(", "),
        detalle_problema_actual: form.detalle_problema_actual,
        acude_profesional_particular: form.acude_profesional_particular,
        diagnostico_particular: form.diagnostico_particular,
        tipo_tratamiento_actual: form.tipo_tratamiento_actual,
        comodidad_unayoe: form.comodidad_unayoe,
        aprendizaje_obtenido: form.aprendizaje_obtenido,
      };
      const res = await fetch("http://127.0.0.1:8000/asistencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok) {
        alert("¡Registro de asistencia enviado!");
        setStep(0);
        setForm({
          fecha_atencion: "",
          nro_sesion: "",
          modalidad_atencion: "",
          motivo_atencion: [],
          detalle_problema_actual: "",
          acude_profesional_particular: "",
          diagnostico_particular: "",
          tipo_tratamiento_actual: "",
          comodidad_unayoe: "",
          aprendizaje_obtenido: "",
        });
      } else {
        alert(result.detail || "Error al registrar asistencia");
      }
    } catch (err) {
      alert("Error al conectar con el servidor");
    }
  };

  // Estilos modernos para inputs, radios y checkboxes
  const inputStyle = {
    width: "100%",
    padding: "0.85rem 1rem",
    border: "1.5px solid var(--color-primary)",
    borderRadius: "0.7rem",
    marginBottom: "0.7rem",
    fontSize: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
    outline: "none",
    background: "#fff",
    transition: "border 0.2s, box-shadow 0.2s",
    boxSizing: "border-box"
  };

  const radioStyle = {
    accentColor: "var(--color-primary)",
    marginRight: "0.5rem"
  };

  const checkboxStyle = {
    accentColor: "var(--color-primary)",
    marginRight: "0.5rem"
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
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--color-primary)",
          marginBottom: "1.2rem",
          textAlign: "center",
          borderBottom: "2px solid var(--color-soft-bg)",
          paddingBottom: "0.7rem"
        }}>
          REGISTRO DE ATENCIONES EN UNAYOE
        </h1>

        {/* Barra de progreso */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "0.5rem"
        }}>
          {steps.map((s, i) => (
            <div key={s} style={{
              flex: 1,
              height: "8px",
              borderRadius: "4px",
              background: i <= step ? "var(--color-primary)" : "#e5e7eb",
              transition: "background 0.3s"
            }} />
          ))}
        </div>
        <form onSubmit={step === steps.length - 1 ? handleSubmit : handleNext} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Paso 1: Datos de la Consulta */}
          {step === 0 && (
            <section>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--color-dark)", marginBottom: "1rem" }}>Datos de la Consulta</h2>
              <input type="date" name="fecha_atencion" required placeholder="Fecha de la atención *" value={form.fecha_atencion} onChange={handleChange} style={inputStyle} />
              <input name="nro_sesion" required placeholder="Nro de sesión *" value={form.nro_sesion} onChange={handleChange} style={inputStyle} type="number" min={1} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Modalidad de la atención psicológica *</label><br />
                <label><input type="radio" name="modalidad_atencion" value="PRESENCIAL" checked={form.modalidad_atencion === "PRESENCIAL"} onChange={handleChange} style={radioStyle} />Presencial</label>{" "}
                <label><input type="radio" name="modalidad_atencion" value="VIRTUAL" checked={form.modalidad_atencion === "VIRTUAL"} onChange={handleChange} style={radioStyle} />Virtual</label>{" "}
                <label><input type="radio" name="modalidad_atencion" value="TELECONSULTA" checked={form.modalidad_atencion === "TELECONSULTA"} onChange={handleChange} style={radioStyle} />Teleconsulta</label>
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Motivo de la atención *</label><br />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
                  {[
                    "FACTOR EMOCIONAL",
                    "FACTOR FAMILIAR",
                    "RENDIMIENTO ACADÉMICO",
                    "PROBLEMAS DE PAREJA",
                    "PROBLEMAS CON DOCENTES",
                    "PROBLEMAS CON COMPAÑEROS",
                    "PROBLEMAS DE COMPORTAMIENTO",
                    "PROBLEMAS DE ORIENTACIÓN VOCACIONAL",
                    "DUELO POR PÉRDIDA DE FAMILIAR",
                    "EVALUACIÓN BECA VIVIENDA",
                    "OBSERVADO DE LA EVALUACIÓN PSICOLÓGICA ANUAL",
                    "TUTORÍA PSICOLÓGICA - OBSERVADOS",
                    "ORIENTACIÓN ACADÉMICA"
                  ].map(m => (
                    <label key={m} style={{
                      background: form.motivo_atencion.includes(m) ? "var(--color-primary)" : "#f3f4f6",
                      color: form.motivo_atencion.includes(m) ? "#fff" : "var(--color-dark)",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "1rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s"
                    }}>
                      <input type="checkbox" name="motivo_atencion" value={m} checked={form.motivo_atencion.includes(m)} onChange={handleChange} style={checkboxStyle} />{m}
                    </label>
                  ))}
                </div>
              </div>
              <input name="detalle_problema_actual" required placeholder="Detalle el problema actual *" value={form.detalle_problema_actual} onChange={handleChange} style={inputStyle} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" onClick={handleNext} style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  padding: "0.7rem 2rem",
                  borderRadius: "0.7rem",
                  border: "none",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                  cursor: "pointer",
                  transition: "background 0.2s, box-shadow 0.2s"
                }}>Siguiente</button>
              </div>
            </section>
          )}

          {/* Paso 2: Experiencia y Aprendizaje */}
          {step === 1 && (
            <section>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--color-dark)", marginBottom: "1rem" }}>Experiencia y Aprendizaje</h2>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>¿Acude donde un profesional de la salud mental de manera particular? *</label><br />
                <label><input type="radio" name="acude_profesional_particular" value="SI" checked={form.acude_profesional_particular === true} onChange={handleChange} style={radioStyle} />Sí</label>{" "}
                <label><input type="radio" name="acude_profesional_particular" value="NO" checked={form.acude_profesional_particular === false} onChange={handleChange} style={radioStyle} />No</label>
              </div>
              <input name="diagnostico_particular" placeholder="Si su respuesta fue sí, ¿cuál fue su diagnóstico?" value={form.diagnostico_particular} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Actualmente qué tipo de tratamiento está llevando</label><br />
                <label><input type="radio" name="tipo_tratamiento_actual" value="PSICOLÓGICO" checked={form.tipo_tratamiento_actual === "PSICOLÓGICO"} onChange={handleChange} style={radioStyle} />Psicológico</label>{" "}
                <label><input type="radio" name="tipo_tratamiento_actual" value="PSIQUIÁTRICO" checked={form.tipo_tratamiento_actual === "PSIQUIÁTRICO"} onChange={handleChange} style={radioStyle} />Psiquiátrico</label>{" "}
                <label><input type="radio" name="tipo_tratamiento_actual" value="AMBOS" checked={form.tipo_tratamiento_actual === "AMBOS"} onChange={handleChange} style={radioStyle} />Ambos</label>{" "}
                <label><input type="radio" name="tipo_tratamiento_actual" value="NINGUNO" checked={form.tipo_tratamiento_actual === "NINGUNO"} onChange={handleChange} style={radioStyle} />Ninguno</label>
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>¿Se sintió cómodo con la atención en UNAYOE? *</label><br />
                <label><input type="radio" name="comodidad_unayoe" value="SI" checked={form.comodidad_unayoe === true} onChange={handleChange} style={radioStyle} />Sí</label>{" "}
                <label><input type="radio" name="comodidad_unayoe" value="NO" checked={form.comodidad_unayoe === false} onChange={handleChange} style={radioStyle} />No</label>
              </div>
              
              {/* 🎙️ CONTENEDOR DE DICTADO POR VOZ */}
              <div style={{ position: 'relative', marginBottom: '0.7rem' }}>
                  <textarea 
                      name="aprendizaje_obtenido" 
                      required 
                      placeholder="¿Qué aprendizaje te llevas de esta atención? *" 
                      value={form.aprendizaje_obtenido} 
                      onChange={handleChange} 
                      style={{ ...inputStyle, minHeight: "70px", paddingRight: "3rem" }} // Deja espacio
                  />
                  <button 
                      type="button" 
                      onClick={handleVoiceInput} 
                      disabled={!SpeechRecognition || isListening}
                      title={!SpeechRecognition ? "Dictado no soportado" : (isListening ? "Escuchando..." : "Dictar por voz")}
                      style={{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          cursor: !SpeechRecognition || isListening ? 'default' : 'pointer',
                          padding: '0.3rem',
                          borderRadius: '50%',
                          color: isListening ? '#EC4899' : 'var(--color-primary)', 
                          opacity: !SpeechRecognition ? 0.5 : 1, // Opacidad si no está soportado
                          transition: 'color 0.2s, background 0.2s',
                          // Usamos un SVG simple para un icono más limpio
                          // Esto se puede reemplazar por un icono de librería si la tienes
                      }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm0 14c-2.76 0-5.32-2.02-5.32-5h-2.08c0 3.99 3.23 7.35 7.4 8v3H12a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2h-1.57v-3c4.17-.65 7.4-4 7.4-8h-2.08c0 2.98-2.56 5-5.32 5z"/>
                      </svg>
                  </button>
              </div>
              {/* FIN CONTENEDOR DE DICTADO POR VOZ */}
              
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <button type="button" onClick={handlePrev} style={{
                  background: "#e5e7eb",
                  color: "var(--color-dark)",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  padding: "0.7rem 2rem",
                  borderRadius: "0.7rem",
                  border: "none",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                  cursor: "pointer",
                  transition: "background 0.2s, box-shadow 0.2s"
                }}>Anterior</button>
                <button type="submit" style={{
                  background: "var(--color-primary)",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "1.05rem",
                  padding: "0.7rem 2rem",
                  borderRadius: "0.7rem",
                  border: "none",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                  cursor: "pointer",
                  transition: "background 0.2s, box-shadow 0.2s"
                }}>Enviar</button>
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  );
}