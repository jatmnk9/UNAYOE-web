import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

const FaceAuth = ({ userId, onLoginSuccess, initialMode = "verify" }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cameraError, setCameraError] = useState(null); // Nuevo estado para errores
  const [mode, setMode] = useState(initialMode);

 // 🟢 PON ESTO EN SU LUGAR (Versión más compatible):
const videoConstraints = {
  facingMode: "user" // Solo pedimos la cámara frontal, sin forzar tamaño
};
  const capture = useCallback(() => {
    if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setMessage("");
  };

  // Manejador de errores de la cámara
  const handleCameraError = (error) => {
    console.error("Error de cámara:", error);
    setCameraError("No se pudo acceder a la cámara. Verifica que no esté siendo usada por otro programa y que hayas dado permisos.");
  };

  // ... (Tus funciones handleRegister y handleVerify se mantienen IGUAL que antes) ...
  const handleRegister = async () => {
    if (!imgSrc) return;
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/face/register', {
        user_id: userId,
        image_base64: imgSrc
      });
      setMessage("✅ " + response.data.message);
      // Esperar un momento y luego llamar al success
      setTimeout(() => {
          if(onLoginSuccess) onLoginSuccess();
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al registrar: " + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!imgSrc) return;
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/face/verify', {
        user_id: userId,
        frame_base64: imgSrc
      });

      if (response.data.verified) {
        setMessage("✅ Identidad Verificada.");
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setMessage("⛔ Acceso DENEGADO. Rostro no coincide.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error: " + (error.response?.data?.detail || error.message));
    }
    setLoading(false);
  };
  // ... (Fin de funciones handle) ...

  return (
    <div style={styles.container}>
      <h2>Seguridad Biométrica - {mode === 'register' ? 'Registro' : 'Verificación'}</h2>
      
      {cameraError ? (
        <div style={{color: 'red', padding: '20px', border: '1px solid red', borderRadius: '8px', margin: '20px'}}>
            <h3>⚠️ Error de Cámara</h3>
            <p>{cameraError}</p>
        </div>
      ) : (
        <div style={styles.camContainer}>
            {imgSrc ? (
            <img src={imgSrc} alt="captura" style={styles.image} />
            ) : (
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={400} // Forzar ancho visual
                height={300} // Forzar alto visual
                videoConstraints={videoConstraints}
                style={styles.webcam}
                onUserMediaError={handleCameraError} // <--- Esto detectará el error
                onUserMedia={() => console.log("Cámara iniciada correctamente")}
            />
            )}
        </div>
      )}

      <div style={styles.controls}>
        {!imgSrc && !cameraError ? (
          <button onClick={capture} style={styles.btnCapture}>📷 Capturar Foto</button>
        ) : imgSrc ? (
          <>
            <button onClick={retake} style={styles.btnRetake}>🔄 Repetir</button>
            
            {mode === 'register' ? (
              <button onClick={handleRegister} disabled={loading} style={styles.btnAction}>
                {loading ? 'Guardando...' : '💾 Guardar mi Rostro'}
              </button>
            ) : (
              <button onClick={handleVerify} disabled={loading} style={styles.btnAction}>
                {loading ? 'Verificando...' : '🔐 Validar Acceso'}
              </button>
            )}
          </>
        ) : null}
      </div>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

// Estilos actualizados para asegurar visibilidad
const styles = {
  container: { textAlign: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
  camContainer: { 
      margin: '20px auto', 
      width: '400px', 
      height: '300px', 
      border: '2px solid #005f73', // Color temático
      borderRadius: '10px',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#000',
      overflow: 'hidden' // Asegura que el video no se salga
  },
  webcam: { width: '100%', height: '100%', objectFit: 'cover' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  controls: { display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '10px' },
  btnCapture: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnRetake: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnAction: { padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  message: { marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }
};

export default FaceAuth;