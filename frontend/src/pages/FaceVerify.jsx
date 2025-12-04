import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FaceAuth from "../components/FaceAuth";

export default function FaceVerify() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleVerifySuccess = () => {
    // 🚀 Aquí redirigimos según el rol del usuario
    if (user.rol === "estudiante") {
      navigate("/student");
    } else if (user.rol === "psicologo") {
      navigate("/psychologist");
    } else {
      navigate("/");
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Verificación de Identidad</h1>
      <p>Por favor, valida tu rostro para acceder al sistema.</p>

      {/* Usamos el componente en modo VERIFY */}
      <FaceAuth 
        userId={user?.id} 
        initialMode="verify" 
        onLoginSuccess={handleVerifySuccess} 
      />
    </div>
  );
}