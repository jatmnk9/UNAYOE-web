import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      console.log('[Auth] Iniciando login...');
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Error en el inicio de sesión");

      const data = await res.json();
      console.log('[Auth] Respuesta /login:', data);

      const userData = {
        id: data.user.id,
        email: data.user.email,
        rol: data.user.rol,
        nombre: data.user.nombre,
        access_token: data.user.access_token,
        refresh_token: data.user.refresh_token,
        foto_perfil_url: data.user.foto_perfil_url || null,
        has_face_registered: Boolean(data.user.foto_perfil_url),
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log('[Auth] Usuario almacenado. has_face_registered=', userData.has_face_registered);

      // Nuevo flujo facial:
      // Si NO tiene rostro registrado -> registrar
      if (!userData.has_face_registered) {
        console.log('[Auth] Sin foto -> redirigiendo a /face-register');
        navigate("/face-register");
        return;
      }
      // Si ya lo tiene -> verificar
      console.log('[Auth] Con foto -> redirigiendo a /face-verify');
      navigate("/face-verify");
      return;

      // Redirección por rol normal
      if (userData.rol === "estudiante") navigate("/student");
      else if (userData.rol === "psicologo") navigate("/psychologist");
      else navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Credenciales inválidas o error en el servidor");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
// El error se originaba aquí porque useContext no estaba importado arriba.
export const useAuth = () => useContext(AuthContext);