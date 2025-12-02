import { BookOpen, User, Briefcase, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
// No necesitamos useAuth ni useAuth en este componente

// ===========================================
// COMPONENTE: FeatureCard (Sin Cambios)
// ===========================================
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => {
  return (
    <div 
      className="feature-card"
      style={{ 
        animationDelay: `${delay}ms`, 
        boxShadow: `0 10px 30px -5px ${
          color === "var(--color-primary)" 
            ? "rgba(163, 210, 202, 0.4)" 
            : "rgba(247, 176, 158, 0.4)"
        }`
      }}
    >
      <div className="feature-icon-wrapper" style={{ backgroundColor: color }}>
        <Icon className="feature-icon" />
      </div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </div>
  );
};

// ===========================================
// COMPONENTE: NavButton (Simplificado - solo navega)
// ===========================================
const NavButton = ({ to, children, primary = true }) => {
  const navigate = useNavigate();
  const className = primary ? "nav-button primary" : "nav-button accent";

  const handleClick = (e) => {
    e.preventDefault();
    // Navegamos a la ruta específica. La PrivateRoute la protegerá.
    navigate(to);
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
};

// ===========================================
// COMPONENTE PRINCIPAL: Home (CORREGIDO: Rutas Específicas)
// ===========================================
export default function Home() {
  const IMAGE_PLACEHOLDER = "/home.png";

  return (
    <div className="app-container">
      {/* Fondo */}
      <div className="app-background"></div>

      {/* HEADER */}
      <header className="header">
        <h1 className="logo">
          <img src="/isotipo.png" alt="UNAYOE Isotipo" className="logo-image-home" />
          UNAYOE <span className="logo-light"> Bienestar</span>
        </h1>
        <nav className="nav-desktop">
          {/* Rutas correctas, la PrivateRoute forzará el login si es necesario */}
          <NavButton to="/student" primary={true}>
            <User className="nav-icon" /> Portal Estudiante
          </NavButton>
          <NavButton to="/psychologist" primary={false}>
            <Briefcase className="nav-icon" /> Portal Psicólogo
          </NavButton>
        </nav>
      </header>

      {/* MAIN */}
      <main className="main-content">
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-text animate-slideInLeft">
              <span className="hero-tag">ENCUENTRA EL EQUILIBRIO</span>
              <h2 className="hero-title">
                Empieza tu <span className="hero-accent">Viaje de Crecimiento</span> Personal.
              </h2>
              <p className="hero-subtitle">
                UNAYOE te ofrece un espacio seguro para la reflexión diaria y la conexión profesional con tu psicólogo.
              </p>

              <div className="nav-mobile">
                {/* Rutas correctas para móvil */}
                <NavButton to="/student" primary={true}>
                  <User className="nav-icon" /> Soy Estudiante
                </NavButton>
                <NavButton to="/psychologist" primary={false}>
                  <Briefcase className="nav-icon" /> Soy Psicólogo
                </NavButton>
              </div>
            </div>

            <div className="hero-image-wrapper animate-slideInRight">
              <img
                src={IMAGE_PLACEHOLDER}
                alt="Ilustración abstracta de calma y bienestar"
                className="hero-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400/A3D2CA/076F78?text=UNAYOE+Bienestar";
                }}
              />
            </div>
          </div>
        </section>

        {/* FEATURES (Sin Cambios) */}
        <section className="features-section">
          <h3 className="features-heading">Beneficios Clave</h3>
          <div className="features-grid">
            <FeatureCard 
              icon={BookOpen} 
              title="Diario Privado" 
              description="Un lugar seguro para documentar tus emociones y avances diarios."
              color="var(--color-primary)"
              delay={0}
            />
            <FeatureCard 
              icon={User} 
              title="Reportes Inteligentes" 
              description="Convierte tus notas en análisis claros para mejorar tu bienestar."
              color="var(--color-accent)"
              delay={150}
            />
            <FeatureCard 
              icon={Heart} 
              title="Evolución Continua" 
              description="Observa tu progreso y fomenta una mayor autoconciencia."
              color="var(--color-primary)"
              delay={300}
            />
          </div>
        </section>
      </main>

      {/* FOOTER (Sin Cambios) */}
      <footer className="footer">
        <div className="footer-content">
          &copy; 2025 UNAYOE UNMSM. Desarrollado con el Corazón.
        </div>
      </footer>
    </div>
  );
}