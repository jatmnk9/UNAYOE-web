import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FaceAuth from "../components/FaceAuth";

export default function FaceRegister() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.foto_perfil_url) {
      console.log('[FaceRegister] Ya existe foto_perfil_url, redirigiendo a verificación');
      navigate('/face-verify');
    }
  }, [user, navigate]);

  const handleRegisterSuccess = () => {
    console.log('[FaceRegister] Registro facial exitoso, solicitando verificación');
    navigate('/face-verify');
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Registro Facial Obligatorio</h1>
      <p>Para proteger tu cuenta, necesitamos registrar tu rostro por única vez.</p>
      {!user?.id && <p style={{color:'red'}}>No hay usuario en sesión. Inicia primero.</p>}
      
      {/* Usamos el componente en modo REGISTER */}
      <FaceAuth 
        userId={user?.id} 
        initialMode="register" 
        onLoginSuccess={handleRegisterSuccess} 
      />
    </div>
  );
}