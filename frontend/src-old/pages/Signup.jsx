import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 💡 1. Definir la estructura base para FastAPI (¡CRÍTICO!)
const initialStudentData = {
    nombre: "", apellido: "", codigo_alumno: "", dni: "", edad: 0, 
    genero: "", celular: "", facultad: "", escuela: "", direccion: "", 
    ciclo: "", tipo_paciente: "", universidad: "", psicologo_id: null, 
};

const initialPsychologistData = {
    nombre: "", apellido: "", dni: "", codigo_minsa: "", celular: "", 
    perfil_academico: "", genero: "", estado: "",
};


export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("estudiante");
  // Inicializamos formData con la estructura del rol por defecto
  const [formData, setFormData] = useState(initialStudentData); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
    const { user: authUser } = useAuth();

    // Debug: registrar montaje/desmontaje y cambios en el contexto de auth
    useEffect(() => {
        console.log("Signup mounted");
        return () => console.log("Signup unmounted");
    }, []);

    useEffect(() => {
        console.log("Auth user changed in Signup:", authUser);
    }, [authUser]);

  // 💡 2. Inicializar formData al montar (por si acaso)
  useEffect(() => {
    setFormData(initialStudentData);
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // 1. Manejar números (si aplica)
    let processedValue = type === 'number' ? parseInt(value) || 0 : value;
    
    // 🔑 CORRECCIÓN CRÍTICA: Si el campo es psicologo_id y está vacío, hazlo NULL
    if (name === 'psicologo_id' && processedValue === "") {
        processedValue = null;
    }

    setFormData({ ...formData, [name]: processedValue }); 
  };
  // 💡 3. Función para cambiar el rol y el estado de datos
  const handleRoleChange = (e) => {
    const newRol = e.target.value;
    setRol(newRol);
    if (newRol === "estudiante") {
        setFormData(initialStudentData);
    } else if (newRol === "psicologo") {
        setFormData(initialPsychologistData);
    } else {
        setFormData({});
    }
  };


 const handleSignup = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
    });

    if (authError) throw new Error(`Auth Error: ${authError.message}`);
    
    const user = authData.user;
    if (!user && authData.session === null) {
        alert("✅ ¡Registro exitoso! Por favor, revisa tu correo institucional para confirmar tu cuenta y luego inicia sesión.");
        navigate("/login");
        return; 
    }

    // 2. Llamar al Backend con la estructura de datos completa
    const profileData = {
        id: user.id, // ID del usuario autenticado
        correo_institucional: email,
        // rol ya está incluido en formData.rol si lo hubieras puesto, pero lo forzamos aquí por claridad
        ...formData, 
    };

    const endpoint = rol === "estudiante" ? 
                     "http://127.0.0.1:8000/usuarios/estudiantes" : 
                     "http://127.0.0.1:8000/usuarios/psicologos";

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
    });

    if (!res.ok) {
        let errorDetail = "Error desconocido en el backend.";
        try {
            const errorBody = await res.json();
            // 💡 Convertir el array de errores de Pydantic a un string legible
            if (Array.isArray(errorBody.detail)) {
                errorDetail = errorBody.detail.map(e => `[${e.loc.join('.')}] ${e.msg}`).join('; ');
            } else if (errorBody.detail) {
                errorDetail = errorBody.detail;
            }
        } catch (jsonError) {
            errorDetail = `El servidor respondió con el estado ${res.status} y no devolvió JSON.`;
        }
        throw new Error(errorDetail);
    }

    // 3. Finalización
    alert("Cuenta y perfil creados con éxito. ¡Bienvenido!");
    navigate("/login");

  } catch (err) {
      console.error("Error general en el registro:", err);
      alert(`Fallo al registrar. Detalle: ${err.message}`);
  } finally {
      setLoading(false);
  }
};
// Tu componente de Registro con la estructura de 3 columnas optimizada
return (
        // Usamos el mismo fondo que en Login: imagen de fondo + overlay translúcido
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
            {/* Fondo con imagen y overlay translúcido (igual que en Login) */}
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

            <form
                onSubmit={handleSignup}
                // Aplicamos la clase de tarjeta que permite el scroll vertical (signup-card)
                className="login-card signup-card"
                style={{
                    maxWidth: "650px",
                    width: "100%",
                    margin: "2rem auto",
                    padding: "3rem",
                    borderRadius: "1.2rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(2px)",
                    position: "relative",
                    zIndex: 2,
                }}
            >
        
        {/* Nuevo Encabezado con Logo y Bienvenida (ajustado para Registro) */}
        <div className="login-header-wrapper">
            {/* Asumiendo que tienes el logo en /logo.png */}
            <img 
                src="/logo.png" 
                alt="Logo de la Aplicación" 
                className="login-logo" 
            />
            <p className="login-welcome-text">
                Únete a nuestra comunidad
            </p>
        </div>
        
        <h2 className="login-title">Crea una Cuenta</h2>

        {/* Si tienes un mensaje de error, muéstralo aquí */}
        {/* {errorMsg && (<p className="login-error-msg">{errorMsg}</p>)} */}
        
        {/* 1. Email */}
        <div className="login-field">
            <label htmlFor="email" className="login-label">
                Correo institucional:
            </label>
            <input 
                id="email" 
                type="email" 
                placeholder="correo@institucion.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="login-input" 
                required 
                disabled={loading}
            />
        </div>
        
        {/* 2. Contraseña */}
        <div className="login-field">
            <label htmlFor="password" className="login-label">
                Contraseña:
            </label>
            <input 
                id="password" 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="login-input" 
                required 
                disabled={loading}
            />
        </div>

        {/* 3. Rol (Selector con Estilo Mejorado) */}
        <div className="login-field">
            <label htmlFor="rol" className="login-label">
                Tipo de cuenta:
            </label>
            <select 
                id="rol"
                value={rol} 
                onChange={handleRoleChange} 
                // Usamos la clase de input para el estilo uniforme
                className="login-input login-select" 
                disabled={loading}
            >
                <option value="estudiante">Estudiante</option>
                <option value="psicologo">Psicólogo</option>
            </select>
        </div>

        {/* Título para Campos Específicos */}
        <h3 className="signup-section-title">Datos Personales</h3>

        {/* 4. Campos Dinámicos - Estudiante (3 Columnas) */}
        {rol === "estudiante" && (
            <div className="signup-grid">
                <input name="nombre" placeholder="Nombre" onChange={handleChange} className="login-input" required/>
                <input name="apellido" placeholder="Apellido" onChange={handleChange} className="login-input" required/>
                <input name="codigo_alumno" placeholder="Código alumno" onChange={handleChange} className="login-input" required/>
                <input name="dni" placeholder="DNI" onChange={handleChange} className="login-input" required/>
                <input name="edad" type="number" placeholder="Edad" onChange={handleChange} className="login-input" required/>
                <input name="genero" placeholder="Género" onChange={handleChange} className="login-input" required/>
                <input name="celular" placeholder="Celular" onChange={handleChange} className="login-input" required/>
                <input name="facultad" placeholder="Facultad" onChange={handleChange} className="login-input" required/>
                <input name="escuela" placeholder="Escuela" onChange={handleChange} className="login-input" required/>
                <input name="ciclo" placeholder="Ciclo" onChange={handleChange} className="login-input" required/>
                <input name="tipo_paciente" placeholder="Tipo de paciente" onChange={handleChange} className="login-input" required/>
                <input name="psicologo_id" placeholder="ID Psicólogo (opcional)" onChange={handleChange} className="login-input"/>
                
                {/* CLAVE: Estos campos ocupan las 3 columnas para mejor lectura */}
                <input name="direccion" placeholder="Dirección" onChange={handleChange} className="login-input full-span" required/>
                <input name="universidad" placeholder="Universidad" onChange={handleChange} className="login-input full-span last-input" required/>
            </div>
        )}

        {/* 5. Campos Dinámicos - Psicólogo (3 Columnas) */}
        {rol === "psicologo" && (
            <div className="signup-grid">
                <input name="nombre" placeholder="Nombre" onChange={handleChange} className="login-input" required/>
                <input name="apellido" placeholder="Apellido" onChange={handleChange} className="login-input" required/>
                <input name="dni" placeholder="DNI" onChange={handleChange} className="login-input" required/>
                <input name="codigo_minsa" placeholder="Código MINSA" onChange={handleChange} className="login-input" required/>
                <input name="celular" placeholder="Celular" onChange={handleChange} className="login-input" required/>
                <input name="perfil_academico" placeholder="Perfil académico" onChange={handleChange} className="login-input" required/>
                <input name="genero" placeholder="Género" onChange={handleChange} className="login-input" required/>
                <input name="estado" placeholder="Estado" onChange={handleChange} className="login-input last-input"/>
            </div>
        )}

        {/* Botón */}
        <button
            type="submit"
            // Reutilizamos el estilo primario con clase login-button
            className={`nav-button primary login-button ${loading ? 'disabled' : ''}`}
            disabled={loading}
        >
            {loading ? "Registrando..." : "Crear cuenta"}
        </button>
        
        {/* Enlace de Login */}
        <p className="login-signup-text">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="login-signup-link">
                Inicia sesión
            </Link>
        </p>
        
      </form>
    </div>
);
}