import { useState } from "react";

export default function Chatbot({ context }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "system", content: "Hola, soy el asistente psicológico. Puedes consultarme sobre el análisis o pedir recomendaciones más detalladas." }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setMessages([...messages, { role: "user", content: input }]);
        try {
            const res = await fetch("http://127.0.0.1:8000/attendance-chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    context,
                    question: input
                })
            });
            const result = await res.json();
            setMessages(msgs => [...msgs, { role: "assistant", content: result.answer }]);
        } catch {
            setMessages(msgs => [...msgs, { role: "assistant", content: "No se pudo obtener respuesta." }]);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    return (
        <>
            <button
                style={{
                    position: "fixed",
                    bottom: "2rem",
                    right: "2rem",
                    zIndex: 1000,
                    background: "var(--color-primary)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    fontSize: "2rem",
                    border: "none",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                    cursor: "pointer"
                }}
                onClick={() => setOpen(o => !o)}
                aria-label="Abrir chatbot"
            >
                💬
            </button>
            {open && (
                <div style={{
                    position: "fixed",
                    bottom: "4.5rem",
                    right: "2rem",
                    width: "350px",
                    maxHeight: "500px",
                    background: "#fff",
                    borderRadius: "1rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    zIndex: 1001,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}>
                    <div style={{ padding: "1rem", borderBottom: "1px solid #eee", fontWeight: 600, color: "var(--color-primary)" }}>
                        Chatbot de Consulta Psicológica
                    </div>
                    <div style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "1rem",
                        fontSize: "0.95rem",
                        background: "#f9fafb"
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                marginBottom: "0.7rem",
                                textAlign: msg.role === "user" ? "right" : "left"
                            }}>
                                <span style={{
                                    background: msg.role === "user" ? "var(--color-primary)" : "#e5e7eb",
                                    color: msg.role === "user" ? "#fff" : "#222",
                                    borderRadius: "1rem",
                                    padding: "0.5rem 1rem",
                                    display: "inline-block",
                                    maxWidth: "80%"
                                }}>
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div style={{ padding: "1rem", borderTop: "1px solid #eee", background: "#fff" }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            style={{
                                width: "75%",
                                padding: "0.5rem",
                                borderRadius: "0.7rem",
                                border: "1px solid #ddd",
                                marginRight: "0.5rem"
                            }}
                            disabled={loading}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            style={{
                                background: "var(--color-primary)",
                                color: "#fff",
                                borderRadius: "0.7rem",
                                border: "none",
                                padding: "0.5rem 1.2rem",
                                fontWeight: 600,
                                cursor: loading ? "not-allowed" : "pointer"
                            }}
                        >
                            {loading ? "..." : "Enviar"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}