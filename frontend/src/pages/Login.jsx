import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div
      className="login-bg"
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Fondo con imagen y overlay blanco translúcido */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/fondo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.7)",
          zIndex: 1,
        }}
      />
      <div
        className="login-card"
        style={{
          maxWidth: "400px",
          width: "100%",
          margin: "2rem auto",
          padding: "2.5rem 2rem",
          borderRadius: "1.2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(2px)",
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="login-header-wrapper"
          style={{ marginBottom: "1.5rem", textAlign: "center" }}
        >
          <img
            src="/isotipo.png"
            alt="UNAYOE Isotipo"
            style={{
              width: 56,
              height: 56,
              marginBottom: "0.5rem",
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          />
          <h1
            className="login-title"
            style={{
              fontSize: "2rem",
              color: "var(--color-primary)",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            UNAYOE
          </h1>
          <div
            className="sidebar-logo-light"
            style={{
              fontSize: "1.1rem",
              color: "var(--color-dark)",
              letterSpacing: "0.01em",
            }}
          >
            Portal de Bienestar
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <input
            type="email"
            placeholder="Correo institucional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="login-input"
            style={{
              fontSize: "1rem",
              marginBottom: "1rem",
              border: "1.5px solid var(--color-primary)",
              borderRadius: "0.7rem",
              padding: "0.85rem 1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              outline: "none",
              transition: "border 0.2s, box-shadow 0.2s",
              background: "#fff",
              width: "100%",
              boxSizing: "border-box",
            }}
            onFocus={e =>
              (e.target.style.borderColor = "var(--color-dark)")
            }
            onBlur={e =>
              (e.target.style.borderColor = "var(--color-primary)")
            }
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
            style={{
              fontSize: "1rem",
              marginBottom: "1.5rem",
              border: "1.5px solid var(--color-primary)",
              borderRadius: "0.7rem",
              padding: "0.85rem 1rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              outline: "none",
              transition: "border 0.2s, box-shadow 0.2s",
              background: "#fff",
              width: "100%",
              boxSizing: "border-box",
            }}
            onFocus={e =>
              (e.target.style.borderColor = "var(--color-dark)")
            }
            onBlur={e =>
              (e.target.style.borderColor = "var(--color-primary)")
            }
          />
          <button
            type="submit"
            className="login-btn"
            style={{
              background: "var(--color-primary)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "1.05rem",
              letterSpacing: "0.02em",
              width: "100%",
              padding: "0.85rem 0",
              borderRadius: "0.7rem",
              border: "none",
              boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              cursor: "pointer",
              transition: "background 0.2s, box-shadow 0.2s",
              marginBottom: "1rem",
            }}
            onMouseOver={e =>
              (e.target.style.background = "var(--color-dark)")
            }
            onMouseOut={e =>
              (e.target.style.background = "var(--color-primary)")
            }
          >
            Entrar
          </button>
        </form>
        <div style={{ textAlign: "center", fontSize: "0.98rem" }}>
          ¿Aún no tienes una cuenta?{" "}
          <Link
            to="/signup"
            style={{
              color: "var(--color-primary)",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}