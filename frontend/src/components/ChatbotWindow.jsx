import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function ChatbotWindow({ onClose }) {
  const [mensaje, setMensaje] = useState("");
  const [conversacion, setConversacion] = useState([]);
  const [minimizado, setMinimizado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pasoFormulario, setPasoFormulario] = useState(null);
  const [datosFormulario, setDatosFormulario] = useState({
    psicologo: null,
    fecha: null,
    hora: null,
    razon: null
  });
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Cargar historial del localStorage al abrir
  useEffect(() => {
    if (user?.id) {
      const historialGuardado = localStorage.getItem(`chatbot_${user.id}`);
      if (historialGuardado) {
        setConversacion(JSON.parse(historialGuardado));
      }
    }
  }, [user?.id]);

  // Guardar historial en localStorage cada vez que cambia
  useEffect(() => {
    if (user?.id && conversacion.length > 0) {
      localStorage.setItem(`chatbot_${user.id}`, JSON.stringify(conversacion));
    }
  }, [conversacion, user?.id]);

  // Placeholder dinámico según paso
  const getPlaceholder = () => {
    switch (pasoFormulario) {
      case "pedir_psicologo":
        return "¿Con qué psicólogo? (o 'cualquiera')";
      case "pedir_fecha":
        return "Fecha (ej: 2025-12-10)";
      case "pedir_hora":
        return "Hora (ej: 14:30)";
      case "pedir_razon":
        return "Razón de la cita...";
      default:
        return "Escribe aquí...";
    }
  };

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoChat = [...conversacion, { tipo: "usuario", texto: mensaje }];
    setConversacion(nuevoChat);
    setCargando(true);

    try {
      // Si estamos en un paso de formulario, procesar diferente
      if (pasoFormulario) {
        // Guardar dato del paso actual
        const datosActualizados = { ...datosFormulario };
        
        switch (pasoFormulario) {
          case "pedir_psicologo":
            datosActualizados.psicologo = mensaje;
            break;
          case "pedir_fecha":
            datosActualizados.fecha = mensaje;
            break;
          case "pedir_hora":
            datosActualizados.hora = mensaje;
            break;
          case "pedir_razon":
            datosActualizados.razon = mensaje;
            break;
        }
        setDatosFormulario(datosActualizados);

        // Determinar siguiente paso
        let siguientePaso = null;
        let respuestaBot = "";

        if (pasoFormulario === "pedir_psicologo") {
          siguientePaso = "pedir_fecha";
          respuestaBot = `¡Bien! Con ${mensaje}. ¿Qué fecha prefieres para la cita? 📅`;
        } else if (pasoFormulario === "pedir_fecha") {
          siguientePaso = "pedir_hora";
          respuestaBot = `Perfecto, ${mensaje}. ¿A qué hora? 🕐`;
        } else if (pasoFormulario === "pedir_hora") {
          siguientePaso = "pedir_razon";
          respuestaBot = `Excelente, ${mensaje}. ¿Cuál es la razón de la cita?`;
        } else if (pasoFormulario === "pedir_razon") {
          // Formulario completo - enviar al backend
          datosActualizados.razon = mensaje;
          
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/citas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo: datosActualizados.razon,
              fecha_cita: datosActualizados.fecha,
              id_usuario: user?.id,
              hora_cita: datosActualizados.hora,
              psicologo_preferido: datosActualizados.psicologo
            })
          });

          if (res.ok) {
            respuestaBot = "✅ ¡Cita agendada exitosamente! Te enviaremos un recordatorio. 🎉";
            setPasoFormulario(null);
            setDatosFormulario({ psicologo: null, fecha: null, hora: null, razon: null });
          } else {
            respuestaBot = "❌ Error al agendar la cita. Intenta nuevamente.";
            setPasoFormulario(null);
          }
        }

        setConversacion((prev) => [
          ...prev,
          { tipo: "bot", texto: respuestaBot }
        ]);

        if (siguientePaso) {
          setPasoFormulario(siguientePaso);
        }
      } else {
        // Flujo normal - enviar a n8n
        const res = await fetch(`${import.meta.env.VITE_CHATBOT_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            texto: mensaje,
            user_id: user?.id
          }),
        });

        if (!res.ok) throw new Error("Error en la respuesta");

        const data = await res.json();
        
        setConversacion((prev) => [
          ...prev,
          { 
            tipo: "bot", 
            texto: data.respuesta || "No entendí tu pregunta", 
            ruta: data.ruta || null 
          },
        ]);

        // Si n8n responde con un paso de formulario, activarlo
        if (data.paso) {
          setPasoFormulario(data.paso);
        }
      }
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
      setConversacion((prev) => [
        ...prev,
        { tipo: "bot", texto: "Hubo un error. Intenta nuevamente." },
      ]);
    } finally {
      setCargando(false);
    }

    setMensaje("");
  };

  const irASeccion = (ruta) => {
    navigate(ruta);
    onClose();
  };

  return (
    <>
      {/* 🔑 SIN FONDO OSCURO - Solo el chatbot tiene el contenedor */}

      {/* 🔑 VENTANA DEL CHATBOT - FLOTANTE ESQUINA INFERIOR DERECHA */}
      <div
        className={`chatbot-window-container ${
          minimizado
            ? "bottom-6 w-80 h-16 rounded-full" 
            : "bottom-24 w-96 h-[28rem] animate-slide-up-reverse"
        }`}
      >
        {/* 🔑 ENCABEZADO CON COLOR */}
        <div className="chatbot-header">
          <h3 className="chatbot-header-title">Asistente UNAYOE 🤖</h3>
          <div className="chatbot-header-buttons">
            <button
              onClick={() => setMinimizado(!minimizado)}
              className="chatbot-icon-button"
              title={minimizado ? "Expandir" : "Minimizar"}
            >
              {minimizado ? (
                <Maximize2 size={18} />
              ) : (
                <Minimize2 size={18} />
              )}
            </button>
            <button
              onClick={onClose}
              className="chatbot-icon-button"
              title="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 🔑 CONTENIDO - Solo visible si NO está minimizado */}
        {!minimizado && (
          <>
            {/* ÁREA DE MENSAJES */}
            <div className="chatbot-messages-container">
              {conversacion.length === 0 ? (
                <div className="chatbot-empty-state">
                  <div className="text-2xl">👋</div>
                  <div className="font-medium">¡Hola!</div>
                  <div className="text-xs">¿Cómo puedo ayudarte?</div>
                </div>
              ) : (
                conversacion.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`chatbot-message ${msg.tipo === "usuario" ? "chatbot-message-user" : "chatbot-message-bot"}`}
                  >
                    <div className={`chatbot-bubble ${msg.tipo === "usuario" ? "chatbot-bubble-user" : "chatbot-bubble-bot"}`}>
                      {msg.texto}
                    </div>
                    {msg.ruta && (
                      <button
                        onClick={() => irASeccion(msg.ruta)}
                        className="chatbot-action-button"
                      >
                        Ir →
                      </button>
                    )}
                  </div>
                ))
              )}
              
              {/* INDICADOR DE CARGA */}
              {cargando && (
                <div className="chatbot-message chatbot-message-bot">
                  <div className="chatbot-loading">
                    <div className="chatbot-dot"></div>
                    <div className="chatbot-dot"></div>
                    <div className="chatbot-dot"></div>
                  </div>
                </div>
              )}
            </div>

            {/* INPUT DE MENSAJE */}
            <div className="chatbot-input-container">
              <input
                className="chatbot-input"
                placeholder={getPlaceholder()}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !cargando && enviarMensaje()}
                disabled={cargando}
              />
              <button
                onClick={enviarMensaje}
                disabled={cargando}
                className="chatbot-send-button"
              >
                {cargando ? "..." : "Enviar"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}