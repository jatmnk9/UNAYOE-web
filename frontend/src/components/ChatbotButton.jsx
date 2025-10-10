import { useState } from "react";
import { MessageCircle } from "lucide-react"; // ícono bonito del chat
import ChatbotWindow from "./ChatbotWindow"; // ventana del chat que puedes crear después

export default function ChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all z-[9999]"
        style={{ zIndex: 1000 }}
      >
        <MessageCircle size={28} />
      </button>

      {/* Ventana del chatbot */}
      {open && <ChatbotWindow onClose={() => setOpen(false)} />}
    </>
  );
}
