import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { Heart, Sparkles, X } from "lucide-react"; // Importamos 'X' para el botón de cerrar
import "../styles/Recomendaciones.css";

// 🧠 Componente Modal
const RecomendacionModal = ({ personalizada, emocion, likes, toggleLike, onClose }) => {
  if (!personalizada) return null; // No renderizar si no hay recomendación

  const liked = likes.includes(personalizada.id);

  return (
    // El 'modal-overlay' asegura que el contenido detrás esté inactivo
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Previene que el clic cierre el modal */}
        
        <header className="modal-header">
          <h2>Tu recomendación personalizada 💭</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        {/* Información de Emoción/Sentimiento */}
        {emocion && (
          <div className="emocion-info">
            <p>Emoción detectada: <strong>{emocion.emocion}</strong></p>
            <p>Sentimiento detectado: <strong>{emocion.sentimiento}</strong></p>
          </div>
        )}

        {/* Contenido de la Recomendación */}
        <div className="recomendacion-box">
          <div className="recomendacion-header">
            <h3>{personalizada.titulo}</h3>
            <button
              onClick={() => toggleLike(personalizada.id)}
              className={`heart-btn ${liked ? "liked" : ""}`}
            >
              <Heart />
            </button>
          </div>
          
          {personalizada.miniatura && (
            <img src={personalizada.miniatura} alt={personalizada.titulo} className="rec-image" />
          )}
          
          <p className="rec-desc">{personalizada.descripcion}</p>
          
          <a href={personalizada.url} target="_blank" rel="noreferrer" className="rec-link">
            Leer más →
          </a>
        </div>
      </div>
    </div>
  );
};


// 💡 Componente principal
export default function Recomendaciones() {
  const { user } = useContext(AuthContext);
  const [todas, setTodas] = useState([]);
  const [personalizada, setPersonalizada] = useState(null);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emocion, setEmocion] = useState(null);
  // 🔑 NUEVO ESTADO: Controla si el modal debe mostrarse
  const [mostrarModal, setMostrarModal] = useState(false); 

  // 🧠 Obtener todas las recomendaciones
  useEffect(() => {
    const fetchTodas = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/recomendaciones/todas`);
        const data = await res.json();
        setTodas(data.data || []);
      } catch (error) {
        console.error("Error al obtener todas las recomendaciones:", error);
      }
    };
    fetchTodas();
  }, []);

  // 💚 Obtener likes del usuario
  useEffect(() => {
    const fetchLikes = async () => {
      if (!user?.id) return;
      const res = await fetch(`${API_BASE_URL}/likes/${user.id}`);
      const data = await res.json();
      setLikes(data);
    };
    fetchLikes();
  }, [user]);

  // ✨ Obtener recomendación personalizada
  const obtenerRecomendacionPersonalizada = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recomendaciones/${user.id}`);
      const data = await res.json();
      const recomendadas = data.data || [];
      
      // 1. Guardar la recomendación
      setPersonalizada(recomendadas[0] || null);
      
      // 2. Guardar la emoción
      setEmocion({
        emocion: data.emocion_detectada,
        sentimiento: data.sentimiento_detectado,
      });
      
      // 3. 🔑 Abrir el modal
      setMostrarModal(true); 
      
    } catch (error) {
      console.error("Error al obtener recomendación personalizada:", error);
    } finally {
      setLoading(false);
    }
  };

  // ❤️ Like / Unlike
  const toggleLike = async (recId) => {
    const isLiked = likes.includes(recId);
    const method = isLiked ? "DELETE" : "POST";
    await fetch(`${API_BASE_URL}/likes/${user.id}/${recId}`, { method });
    setLikes((prev) =>
      isLiked ? prev.filter((id) => id !== recId) : [...prev, recId]
    );
  };
  
  // ❌ Función para cerrar el modal
  const cerrarModal = () => {
    setMostrarModal(false);
  };

  return (
    <div className="recs-container">
      {/* 🔑 Renderizar el Modal si mostrarModal es true */}
      {mostrarModal && personalizada && (
        <RecomendacionModal 
          personalizada={personalizada} 
          emocion={emocion} 
          likes={likes} 
          toggleLike={toggleLike} 
          onClose={cerrarModal} 
        />
      )}
      
      {/* Encabezado */}
      <header className="recs-header">
        <h1 className="recs-title">💫 Recomendaciones PsicoTips</h1>
        <p className="recs-subtitle">
          Explora consejos de bienestar emocional y descubre el que mejor se adapta a ti.
        </p>
        <button
          className="recs-button"
          onClick={obtenerRecomendacionPersonalizada}
          disabled={loading}
        >
          <Sparkles className="sparkle-icon" />
          {loading ? "Cargando..." : "Ver mi recomendación personalizada"}
        </button>
      </header>

      {/* ❌ Eliminamos la sección personalizada que ya está en el modal */}
      {/* Seccion personalizada: (Eliminada) */}

      {/* Listado general */}
      <section className="recs-grid">
        {todas.map((rec) => {
          const liked = likes.includes(rec.id);
          return (
            <div key={rec.id} className="rec-card animate-fadeInUp">
              <div className="rec-header">
                <h3>{rec.titulo}</h3>
                <button
                  onClick={() => toggleLike(rec.id)}
                  className={`heart-btn ${liked ? "liked" : ""}`}
                >
                  <Heart />
                </button>
              </div>
              {rec.miniatura && (
                <img src={rec.miniatura} alt={rec.titulo} className="rec-image" />
              )}
              <p className="rec-desc">{rec.descripcion}</p>
              <a href={rec.url} target="_blank" rel="noreferrer" className="rec-link">
                Ver más →
              </a>
            </div>
          );
        })}
      </section>
    </div>
  );
}