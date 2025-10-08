// src/pages/PsychologistDashboard.jsx

export default function PsychologistDashboard() {
  return (
    <div className="login-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      
      <div className="login-header-wrapper" style={{ marginBottom: '1rem' }}>
        <p className="login-welcome-text" style={{ fontSize: '1rem', fontWeight: 700 }}>
          📊 PANEL DEL PSICÓLOGO
        </p>
      </div>
      
      <h2 className="login-title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
        Resumen General del Portal
      </h2>
      
      <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: 'none', marginBottom: '1.5rem' }}>
        Utiliza el menú lateral izquierdo para acceder a los módulos de gestión y seguimiento de estudiantes.
      </p>
      
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
          Módulo Recomendado: Seguimiento Diario
        </h3>
        <p className="feature-description">
          Revisa el estado emocional reciente de tus estudiantes.
        </p>
      </div>
    </div>
  );
}