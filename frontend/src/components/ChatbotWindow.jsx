import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { X, Minimize2, Maximize2 } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

export default function ChatbotWindow({ onClose }) {
  const [mensaje, setMensaje] = useState("");
  const [conversacion, setConversacion] = useState([]);
  const [minimizado, setMinimizado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoChat = [...conversacion, { tipo: "usuario", texto: mensaje }];
    setConversacion(nuevoChat);
    setCargando(true);

    try {
      const res = await fetch("http://localhost:8000/chatbot", {
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
                placeholder="Escribe aquí..."
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