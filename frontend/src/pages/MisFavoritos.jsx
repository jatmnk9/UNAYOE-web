import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import { Heart, Loader } from "lucide-react";
// Importamos los estilos ya que usaremos las mismas clases de tarjeta
import "../styles/Recomendaciones.css"; 

export default function MisFavoritos() {
  const { user } = useContext(AuthContext);
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para manejar la lista de IDs de likes (necesario para la función toggleLike)
  const [likes, setLikes] = useState([]);

  // ❤️ Like / Unlike (Función duplicada de Recomendaciones.jsx, pero necesaria aquí)
  const toggleLike = async (recId) => {
    if (!user?.id) return;

    const isLiked = likes.includes(recId);
    const method = isLiked ? "DELETE" : "POST";
    
    await fetch(`${API_BASE_URL}/likes/${user.id}/${recId}`, { method });
    
    // 1. Actualiza la lista de IDs de likes
    setLikes((prev) =>
      isLiked ? prev.filter((id) => id !== recId) : [...prev, recId]
    );

    // 2. Si se quitó el like, elimina la tarjeta de la vista de Favoritos
    if (isLiked) {
      setFavoritos(prev => prev.filter(rec => rec.id !== recId));
    }
  };

  // 🧠 Obtener las recomendaciones favoritas
  useEffect(() => {
    const fetchFavoritos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        // Llama al nuevo endpoint del backend
        const res = await fetch(`${API_BASE_URL}/recomendaciones/favoritos/${user.id}`);
        const data = await res.json();
        
        const recs = data.data || [];
        setFavoritos(recs);
        
        // También inicializa el estado 'likes' para manejar el botón de corazón
        setLikes(recs.map(rec => rec.id)); 
        
      } catch (error) {
        console.error("Error al obtener recomendaciones favoritas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavoritos();
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin" size={36} />
        <p>Cargando tus favoritos...</p>
      </div>
    );
  }

  return (
    <div className="recs-container">
      <header className="recs-header">
        <h1 className="recs-title">💖 Mis PsicoTips Favoritos</h1>
        <p className="recs-subtitle">
          Aquí encontrarás todos los consejos de bienestar que has marcado como "Me Gusta".
        </p>
      </header>

      {favoritos.length === 0 ? (
        <div className="empty-state">
          <h2>No tienes favoritos guardados.</h2>
          <p>Ve a PsicoTips y marca como favorito los consejos que más te gusten.</p>
        </div>
      ) : (
        <section className="recs-grid">
          {favoritos.map((rec) => {
            // El estado 'likes' nos dice si la tarjeta aún está "likeada"
            const liked = likes.includes(rec.id);
            return (
              <div key={rec.id} className="rec-card animate-fadeInUp">
                <div className="rec-header">
                  <h3>{rec.titulo}</h3>
                  <button
                    onClick={() => toggleLike(rec.id)}
                    // Siempre debe ser 'liked' aquí, ya que la eliminaremos al desmarcar
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
      )}
    </div>
  );
}