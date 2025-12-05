// src/pages/PsychologistDashboard.jsx

import { useNavigate } from 'react-router-dom';

export default function PsychologistDashboard() {
  const navigate = useNavigate();
  return (
    <div className="portal-main-content">
      {/* Banner de Bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
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
            🧠
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Panel Profesional
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '0',
            fontWeight: '300'
          }}>
            Herramientas avanzadas para el seguimiento y apoyo de tus estudiantes
          </p>
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
          background: 'linear-gradient(135deg, #667EEA, #764BA2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🛠️ Herramientas Profesionales
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Seguimiento Diario */}
          <div style={{
            background: 'linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #C8E6C9',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/psychologist/seguimiento')}
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
                📈
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Seguimiento Diario
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Monitorea el estado emocional de tus estudiantes
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
              <strong>Módulo Principal:</strong> Revisa registros diarios con análisis automático de sentimientos y temas recurrentes.
            </div>
          </div>

          {/* Gestión de Citas */}
          <div style={{
            background: 'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #BBDEFB',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/psychologist/appointments-management')}
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
                  Gestión de Citas
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Organiza y administra todas las sesiones
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
              <strong>Herramienta Esencial:</strong> Programa citas, registra asistencias y genera reportes detallados de progreso.
            </div>
          </div>

          {/* Análisis de Dibujos */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #FFCC80',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/psychologist/drawings')}
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
                🎨
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Análisis de Dibujos
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Interpreta expresiones artísticas terapéuticas
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
              <strong>Análisis IA:</strong> Utiliza IA para detectar emociones y temas en dibujos expresivos de tus estudiantes.
            </div>
          </div>

          {/* Portal del Psicólogo */}
          <div style={{
            background: 'linear-gradient(135deg, #F3E5F5 0%, #E8F5E8 100%)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid #CE93D8',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
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
                background: 'linear-gradient(135deg, #9C27B0, #BA68C8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '1.5rem'
              }}>
                🧑‍⚕️
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  color: 'var(--color-dark)',
                  marginBottom: '0.3rem'
                }}>
                  Portal del Psicólogo
                </h3>
                <p style={{
                  color: 'var(--color-text-gray)',
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Recursos profesionales y herramientas avanzadas
                </p>
              </div>
            </div>
            <div style={{
              background: 'rgba(156, 39, 176, 0.1)',
              padding: '0.8rem',
              borderRadius: '0.5rem',
              fontSize: '0.85rem',
              color: '#6A1B9A'
            }}>
              <strong>Herramientas Avanzadas:</strong> Accede a recomendaciones personalizadas basadas en topic modeling y análisis de sentimientos.
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje Profesional */}
      <div style={{
        background: 'linear-gradient(135deg, #F8F9FA 0%, rgba(102, 126, 234, 0.05) 100%)',
        borderRadius: '1rem',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid #667EEA',
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
          border: '2px solid #667EEA',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: '#667EEA'
        }}>
          🎯 Misión Profesional
        </div>
        <p style={{
          fontSize: '1.3rem',
          fontWeight: '500',
          color: 'var(--color-dark)',
          marginBottom: '1rem',
          fontStyle: 'italic'
        }}>
          "Tu expertise combinado con tecnología avanzada crea un impacto real
          en la vida de tus estudiantes."
        </p>
        <div style={{ fontSize: '2rem', opacity: 0.7 }}>🌟</div>
      </div>
    </div>
  );
}