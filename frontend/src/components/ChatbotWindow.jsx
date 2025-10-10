import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ChatbotWindow({ onClose }) {
  const [mensaje, setMensaje] = useState("");
  const [conversacion, setConversacion] = useState([]);
  const navigate = useNavigate();

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    const nuevoChat = [...conversacion, { tipo: "usuario", texto: mensaje }];
    setConversacion(nuevoChat);

    try {
      const res = await fetch("http://localhost:5678/webhook/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: mensaje }),
      });

      const data = await res.json();

      // Verifica si el bot sugiere una ruta
      const texto = data.respuesta || "No se obtuvo respuesta";
      const ruta = data.ruta || null; // n8n puede devolver algo como { respuesta: "...", ruta: "/student/diario" }

      setConversacion([
        ...nuevoChat,
        { tipo: "bot", texto, ruta },
      ]);
    } catch (err) {
      setConversacion([
        ...nuevoChat,
        { tipo: "bot", texto: "Error al conectar con el chatbot 😢" },
      ]);
    }

    setMensaje("");
  };

  // Cuando el usuario hace clic en “Ir a sección”
  const irASeccion = (ruta) => {
    navigate(ruta);
    onClose(); // opcional: cerrar el chat al navegar
  };

  return (
    <>
      {/* Fondo semitransparente */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[999]"
        onClick={onClose}
      ></div>

      {/* Ventana del chatbot */}
      <div
        className="fixed bottom-[90px] right-6 bg-white w-80 rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up"
        style={{ zIndex: 1000 }}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-2xl">
          <h3 className="font-semibold">Asistente UNAYOE 🤖</h3>
          <button onClick={onClose} className="hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Mensajes */}
        <div
          className="p-3 flex-1 overflow-y-auto flex flex-col-reverse"
          style={{ maxHeight: "300px" }}
        >
          {conversacion.slice().reverse().map((msg, i) => (
            <div key={i} className="mb-2">
              <div
                className={`p-2 rounded-lg ${
                  msg.tipo === "usuario"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                {msg.texto}
              </div>

              {/* Si el bot devuelve una ruta, muestra un botón */}
              {msg.ruta && (
                <button
                  onClick={() => irASeccion(msg.ruta)}
                  className="mt-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-sm"
                >
                  Ir a la sección
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Entrada de mensaje */}
        <div className="flex border-t border-gray-200 p-2">
          <input
            className="flex-1 border rounded-lg p-2 text-sm"
            placeholder="Escribe tu mensaje..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
          />
          <button
            onClick={enviarMensaje}
            className="ml-2 bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
      </div>
    </>
  );
}
