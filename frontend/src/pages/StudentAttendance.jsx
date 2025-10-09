import { useState } from "react";

const steps = [
  "Datos del Alumno",
  "Datos de la Consulta",
  "Experiencia y Aprendizaje"
];

export default function StudentAttendance() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nombres: "",
    sexo: "",
    edad: "",
    celular: "",
    correo: "",
    codigo: "",
    base: "",
    escuela: "",
    semestre: "",
    ciclo: "",
    condicion: "",
    fecha: "",
    sesion: "",
    modalidad: "",
    motivo: [],
    detalle: "",
    acude: "",
    diagnostico: "",
    tratamiento: "",
    comodo: "",
    aprendizaje: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        motivo: checked
          ? [...prev.motivo, value]
          : prev.motivo.filter((m) => m !== value),
      }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("¡Registro enviado!");
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
    boxSizing: "border-box" // ← Esto evita que se desborde
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
          {/* Paso 1: Datos del Alumno */}
          {step === 0 && (
            <section>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--color-dark)", marginBottom: "1rem" }}>Datos del Alumno</h2>
              <input name="nombres" required placeholder="Apellidos y Nombres *" value={form.nombres} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Sexo *</label><br />
                <label><input type="radio" name="sexo" value="FEMENINO" required checked={form.sexo === "FEMENINO"} onChange={handleChange} style={radioStyle} />Femenino</label>{" "}
                <label><input type="radio" name="sexo" value="MASCULINO" checked={form.sexo === "MASCULINO"} onChange={handleChange} style={radioStyle} />Masculino</label>{" "}
                <label><input type="radio" name="sexo" value="OTRO" checked={form.sexo === "OTRO"} onChange={handleChange} style={radioStyle} />Otro</label>
              </div>
              <input name="edad" required placeholder="Edad *" value={form.edad} onChange={handleChange} style={inputStyle} />
              <input name="celular" required placeholder="Celular *" value={form.celular} onChange={handleChange} style={inputStyle} />
              <input name="correo" required placeholder="Correo institucional *" value={form.correo} onChange={handleChange} style={inputStyle} />
              <input name="codigo" required placeholder="Código de estudiante *" value={form.codigo} onChange={handleChange} style={inputStyle} />
              <input name="base" required placeholder="Base *" value={form.base} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Escuela profesional *</label><br />
                <label><input type="radio" name="escuela" value="SISTEMAS" checked={form.escuela === "SISTEMAS"} onChange={handleChange} style={radioStyle} />Sistemas</label>{" "}
                <label><input type="radio" name="escuela" value="SOFTWARE" checked={form.escuela === "SOFTWARE"} onChange={handleChange} style={radioStyle} />Software</label>{" "}
                <label><input type="radio" name="escuela" value="C. COMPUTACIÓN" checked={form.escuela === "C. COMPUTACIÓN"} onChange={handleChange} style={radioStyle} />C. Computación</label>
              </div>
              <input name="semestre" required placeholder="Semestre actual *" value={form.semestre} onChange={handleChange} style={inputStyle} />
              <input name="ciclo" required placeholder="Ciclo actual *" value={form.ciclo} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Condición de alumno *</label><br />
                <label><input type="radio" name="condicion" value="REGULAR" checked={form.condicion === "REGULAR"} onChange={handleChange} style={radioStyle} />Regular</label>{" "}
                <label><input type="radio" name="condicion" value="1ERA. REPITENCIA" checked={form.condicion === "1ERA. REPITENCIA"} onChange={handleChange} style={radioStyle} />1era. Repitencia</label>{" "}
                <label><input type="radio" name="condicion" value="2DA. REPITENCIA" checked={form.condicion === "2DA. REPITENCIA"} onChange={handleChange} style={radioStyle} />2da. Repitencia</label>{" "}
                <label><input type="radio" name="condicion" value="3ERA. REPITENCIA" checked={form.condicion === "3ERA. REPITENCIA"} onChange={handleChange} style={radioStyle} />3era. Repitencia</label>
              </div>
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

          {/* Paso 2: Datos de la Consulta */}
          {step === 1 && (
            <section>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--color-dark)", marginBottom: "1rem" }}>Datos de la Consulta</h2>
              <input type="date" name="fecha" required placeholder="Fecha de la atención *" value={form.fecha} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Nro de sesión *</label><br />
                {["1º","2º","3º","4º","5º","6º","7º","8º","9º","10º","11º A MÁS"].map(s => (
                  <label key={s} style={{ marginRight: "0.7rem" }}>
                    <input type="radio" name="sesion" value={s} checked={form.sesion === s} onChange={handleChange} style={radioStyle} />{s}
                  </label>
                ))}
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Modalidad de la atención psicológica *</label><br />
                <label><input type="radio" name="modalidad" value="PRESENCIAL" checked={form.modalidad === "PRESENCIAL"} onChange={handleChange} style={radioStyle} />Presencial</label>{" "}
                <label><input type="radio" name="modalidad" value="VIRTUAL" checked={form.modalidad === "VIRTUAL"} onChange={handleChange} style={radioStyle} />Virtual</label>{" "}
                <label><input type="radio" name="modalidad" value="TELECONSULTA" checked={form.modalidad === "TELECONSULTA"} onChange={handleChange} style={radioStyle} />Teleconsulta</label>
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Motivo de la atención *</label><br />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
                  {["FACTOR EMOCIONAL","FACTOR FAMILIAR","RENDIMIENTO ACADÉMICO","PROBLEMAS DE PAREJA","PROBLEMAS CON DOCENTES","PROBLEMAS CON COMPAÑEROS","PROBLEMAS DE COMPORTAMIENTO","PROBLEMAS DE ORIENTACIÓN VOCACIONAL","DUELO POR PÉRDIDA DE FAMILIAR","EVALUACIÓN BECA VIVIENDA","OBSERVADO DE LA EVALUACIÓN PSICOLÓGICA ANUAL","TUTORÍA PSICOLÓGICA - OBSERVADOS","ORIENTACIÓN ACADÉMICA"].map(m => (
                    <label key={m} style={{
                      background: form.motivo.includes(m) ? "var(--color-primary)" : "#f3f4f6",
                      color: form.motivo.includes(m) ? "#fff" : "var(--color-dark)",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "1rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "background 0.2s, color 0.2s"
                    }}>
                      <input type="checkbox" name="motivo" value={m} checked={form.motivo.includes(m)} onChange={handleChange} style={checkboxStyle} />{m}
                    </label>
                  ))}
                </div>
              </div>
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

          {/* Paso 3: Experiencia y Aprendizaje */}
          {step === 2 && (
            <section>
              <h2 style={{ fontWeight: 600, fontSize: "1.15rem", color: "var(--color-dark)", marginBottom: "1rem" }}>Experiencia y Aprendizaje</h2>
              <textarea name="detalle" required placeholder="Detalle el problema actual *" value={form.detalle} onChange={handleChange} style={{ ...inputStyle, minHeight: "70px" }} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>¿Acude donde un profesional de la salud mental de manera particular? *</label><br />
                <label><input type="radio" name="acude" value="SI" checked={form.acude === "SI"} onChange={handleChange} style={radioStyle} />Sí</label>{" "}
                <label><input type="radio" name="acude" value="NO" checked={form.acude === "NO"} onChange={handleChange} style={radioStyle} />No</label>
              </div>
              <input name="diagnostico" placeholder="Si su respuesta fue sí, ¿cuál fue su diagnóstico?" value={form.diagnostico} onChange={handleChange} style={inputStyle} />
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>Actualmente qué tipo de tratamiento está llevando</label><br />
                <label><input type="radio" name="tratamiento" value="PSICOLÓGICO" checked={form.tratamiento === "PSICOLÓGICO"} onChange={handleChange} style={radioStyle} />Psicológico</label>{" "}
                <label><input type="radio" name="tratamiento" value="PSIQUIÁTRICO" checked={form.tratamiento === "PSIQUIÁTRICO"} onChange={handleChange} style={radioStyle} />Psiquiátrico</label>{" "}
                <label><input type="radio" name="tratamiento" value="AMBOS" checked={form.tratamiento === "AMBOS"} onChange={handleChange} style={radioStyle} />Ambos</label>{" "}
                <label><input type="radio" name="tratamiento" value="NINGUNO" checked={form.tratamiento === "NINGUNO"} onChange={handleChange} style={radioStyle} />Ninguno</label>
              </div>
              <div style={{ marginBottom: "0.7rem" }}>
                <label style={{ fontWeight: 500 }}>¿Se sintió cómodo con la atención en UNAYOE? *</label><br />
                <label><input type="radio" name="comodo" value="SI" checked={form.comodo === "SI"} onChange={handleChange} style={radioStyle} />Sí</label>{" "}
                <label><input type="radio" name="comodo" value="NO" checked={form.comodo === "NO"} onChange={handleChange} style={radioStyle} />No</label>
              </div>
              <textarea name="aprendizaje" required placeholder="¿Qué aprendizaje te llevas de esta atención? *" value={form.aprendizaje} onChange={handleChange} style={{ ...inputStyle, minHeight: "70px" }} />
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