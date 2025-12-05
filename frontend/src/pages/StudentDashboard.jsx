// src/pages/StudentDashboard.jsx

import { useNavigate } from 'react-router-dom';

export default function StudentDashboard() {
  const navigate = useNavigate();
  return (
    <div className="portal-main-content">
      {/* Banner de Bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
        borderRadius: '1.5rem',
        padding: '3rem 2rem',
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elementos decorativos de fondo */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          zIndex: 1
        }}></div>

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'bounce 2s infinite'
          }}>
            🌱
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            ¡Bienvenido a tu Portal!
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0',
            fontWeight: '300'
          }}>
            Tu espacio seguro para el crecimiento personal y bienestar emocional
          </p>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '2px solid transparent',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--color-primary), var(--color-accent)) border-box',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onClick={() => navigate('/student/asistencia')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-5px)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--color-dark)',
            marginBottom: '0.5rem'
          }}>Mi Asistencia</h3>
          <p style={{
            color: 'var(--color-text-gray)',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            Registra tu asistencia y sigue tu participación
          </p>
          <span style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            Registrar →
          </span>
        </div>

        <div style={{
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '2px solid transparent',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--color-accent), #FFB6C1) border-box',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onClick={() => navigate('/student/recomendaciones')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-5px)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💝</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--color-dark)',
            marginBottom: '0.5rem'
          }}>Mis Recomendaciones</h3>
          <p style={{
            color: 'var(--color-text-gray)',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            Recursos personalizados basados en tu bienestar
          </p>
          <span style={{
            background: 'linear-gradient(135deg, var(--color-accent), #FFB6C1)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            Explorar →
          </span>
        </div>

        <div style={{
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          textAlign: 'center',
          border: '2px solid transparent',
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #4ECDC4, var(--color-primary)) border-box',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onClick={() => navigate('/student/gallery')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-5px)';
          e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'var(--color-dark)',
            marginBottom: '0.5rem'
          }}>Mi Galería</h3>
          <p style={{
            color: 'var(--color-text-gray)',
            fontSize: '0.9rem',
            marginBottom: '1rem'
          }}>
            Dibujos expresivos que cuentan tu historia emocional
          </p>
          <span style={{
            background: 'linear-gradient(135deg, #4ECDC4, var(--color-primary))',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            Ver Dibujos →
          </span>
        </div>
      </div>

      {/* Funcionalidades Principales */}
      <div style={{
        background: 'white',
        borderRadius: '1.2rem',
        padding: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: '700',
          color: 'var(--color-dark)',
          marginBottom: '1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🚀 Funcionalidades Disponibles
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Mi Diario de Bienestar */}
          <div style={{
            background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #C8E6C9',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/student/diario')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.5rem'
              }}>
                📝
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Mi Diario de Bienestar
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Registra tus emociones y pensamientos diarios
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(76, 175, 80, 0.1)',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#2E7D32'
            }}>
              <strong>Eje Central:</strong> El registro diario transforma la reflexión en datos útiles para ti y tu psicólogo.
            </div>
          </div>

          {/* Mis Citas */}
          <div style={{
            background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #BBDEFB',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/student/appointments')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2196F3, #42A5F5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.5rem'
              }}>
                📅
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Mis Citas
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Gestiona tus sesiones con el psicólogo
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(33, 150, 243, 0.1)',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#1565C0'
            }}>
              <strong>Próxima cita:</strong> Programa y confirma tus sesiones terapéuticas.
            </div>
          </div>

          {/* Mis Favoritos */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #FFCC80',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/student/favoritos')}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF9800, #FFB74D)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.5rem'
              }}>
                ⭐
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Mis Favoritos
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Recursos y consejos que más te ayudan
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 152, 0, 0.1)',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#E65100'
            }}>
              <strong>Recursos guardados:</strong> Accede rápidamente a tus herramientas favoritas.
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje Motivacional */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-soft-bg) 0%, rgba(163, 210, 202, 0.1) 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid var(--color-primary)',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
          border: '2px solid var(--color-primary)',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'var(--color-primary)'
        }}>
          💪 Recuerda
        </div>
        <p style={{
          fontSize: '1.3rem',
          fontWeight: '500',
          color: 'var(--color-dark)',
          marginBottom: '1rem',
          fontStyle: 'italic'
        }}>
          "Cada paso que das en tu viaje de autoconocimiento es una victoria.
          Tu bienestar es lo más importante."
        </p>
        <div style={{ fontSize: '2rem', opacity: 0.7 }}>🌟</div>
      </div>
    </div>
  );
}