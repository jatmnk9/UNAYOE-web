// src/pages/StudentDashboard.jsx

export default function StudentDashboard() {
  return (
    // 🔑 Usamos la clase de tarjeta que ya tienes definida en tu CSS
    <div className="login-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      
      {/* Usamos el contenedor de encabezado que ya tienes definido */}
      <div className="login-header-wrapper" style={{ marginBottom: '1rem' }}>
        <p className="login-welcome-text" style={{ fontSize: '1rem', fontWeight: 700 }}>
          👋 BIENVENIDO AL PORTAL
        </p>
      </div>
      
      {/* Usamos el estilo del título principal */}
      <h2 className="login-title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
        Tu Viaje de Bienestar
      </h2>
      
      <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: 'none', marginBottom: '1.5rem' }}>
        Este es tu espacio seguro y personal. Aquí puedes registrar tus emociones y seguir tu crecimiento.
      </p>
      
      <p className="text-gray-600" style={{ fontSize: '0.95rem', textAlign: 'center', color: 'var(--color-text-gray)' }}>
        Para comenzar, selecciona Mi Diario de Bienestar en el menú lateral.
      </p>
      
      {/* Puedes añadir una animación de tarjeta si quieres, similar a las features */}
      <div 
        className="feature-card" 
        style={{ 
          marginTop: '2rem', 
          backgroundColor: 'var(--color-soft-bg)',
          boxShadow: 'none',
          cursor: 'default'
        }}
      >
        <h3 className="feature-title" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-dark)' }}>
            Eje Central: Autoconocimiento
        </h3>
        <p className="feature-description">
            El registro diario es la herramienta clave que transforma la reflexión en datos útiles para ti y tu psicólogo.
        </p>
      </div>
    </div>
  );
}