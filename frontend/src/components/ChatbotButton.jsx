import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatbotWindow from "./ChatbotWindow";

export default function ChatbotButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Botón flotante - esquina inferior DERECHA */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="chatbot-button"
          title="Abrir asistente UNAYOE"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Ventana del chatbot */}
      {isChatOpen && (
        <ChatbotWindow onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}