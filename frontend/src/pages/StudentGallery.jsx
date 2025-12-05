import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/api";
import CanvasDraw from "react-canvas-draw";
import DrawingReplay from "../components/DrawingReplay";

export default function StudentGallery() {
  const { user } = useAuth();
  const [drawings, setDrawings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadMode, setUploadMode] = useState("file"); // "file" o "canvas"
  const [selectedFile, setSelectedFile] = useState(null);
  const [canvasData, setCanvasData] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hasDrawing, setHasDrawing] = useState(false);
  const [replayDrawing, setReplayDrawing] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cargar dibujos del estudiante
  useEffect(() => {
    if (user?.id) {
      fetchDrawings();
    }
  }, [user]);

  const fetchDrawings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/drawings/student/${user.id}`);
      const result = await res.json();
      if (res.ok) {
        setDrawings(result.data || []);
      }
    } catch (err) {
      console.error("Error cargando dibujos:", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecciona un archivo de imagen");
        return;
      }
      setSelectedFile(file);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const convertCanvasToBase64 = () => {
    if (!canvasRef.current) return null;
    // Usar fondo blanco para la imagen
    return canvasRef.current.getDataURL("image/png", false, "#FFFFFF");
  };

  const checkCanvasHasContent = () => {
    if (!canvasRef.current) return false;
    const saveData = canvasRef.current.getSaveData();
    if (!saveData) return false;
    try {
      const data = JSON.parse(saveData);
      return data && data.lines && data.lines.length > 0;
    } catch {
      return false;
    }
  };

  const handleCanvasChange = () => {
    // Verificar si hay contenido en el canvas
    const hasContent = checkCanvasHasContent();
    setHasDrawing(hasContent);
    // Debug: verificar que el canvas esté funcionando
    if (canvasRef.current && hasContent) {
      console.log("Canvas tiene contenido:", hasContent);
      const saveData = canvasRef.current.getSaveData();
      if (saveData) {
        try {
          const data = JSON.parse(saveData);
          console.log("Número de líneas dibujadas:", data.lines?.length || 0);
        } catch (e) {
          console.error("Error parseando saveData:", e);
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!user?.id) {
      alert("Debes iniciar sesión para subir dibujos");
      return;
    }

    setLoading(true);
    try {
      let imageBase64 = null;

      if (uploadMode === "file") {
        if (!selectedFile) {
          alert("Por favor, selecciona un archivo");
          setLoading(false);
          return;
        }
        imageBase64 = await convertFileToBase64(selectedFile);
      } else {
        // Canvas mode
        if (!hasDrawing) {
          alert("Por favor, dibuja algo antes de guardar");
          setLoading(false);
          return;
        }
        imageBase64 = convertCanvasToBase64();
        if (!imageBase64) {
          alert("Por favor, dibuja algo antes de guardar");
          setLoading(false);
          return;
        }
      }

      const payload = {
        user_id: user.id,
        titulo: titulo || `Dibujo ${new Date().toLocaleDateString()}`,
        descripcion: descripcion,
        image_base64: imageBase64,
        tipo_dibujo: uploadMode === "file" ? "uploaded" : "canvas",
        drawing_data: uploadMode === "canvas" && canvasRef.current 
          ? JSON.parse(canvasRef.current.getSaveData()) 
          : null
      };

      const res = await fetch(`${API_BASE_URL}/drawings/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (res.ok) {
        alert("¡Dibujo subido con éxito!");
        setSelectedFile(null);
        setCanvasData(null);
        setTitulo("");
        setDescripcion("");
        setShowCanvas(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (canvasRef.current) {
          canvasRef.current.clear();
        }
        setHasDrawing(false);
        fetchDrawings();
      } else {
        alert(result.detail || "Error al subir dibujo");
      }
    } catch (err) {
      console.error("Error subiendo dibujo:", err);
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setHasDrawing(false);
    }
  };

  const handleLoadCanvas = (data) => {
    if (canvasRef.current && data) {
      canvasRef.current.loadSaveData(data);
    }
  };

  const handleReplay = (drawing) => {
    if (drawing.drawing_data && drawing.tipo_dibujo === "canvas") {
      setReplayDrawing(drawing);
    } else {
      alert("Este dibujo no tiene datos de reproducción disponibles. Solo los dibujos creados en línea pueden reproducirse.");
    }
  };

  return (
    <div className="portal-main-content" style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", color: "var(--color-primary)" }}>
        🎨 Mi Galería de Dibujos
      </h1>

      {/* Selector de modo */}
      <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={() => {
            setUploadMode("file");
            setShowCanvas(false);
            setSelectedFile(null);
          }}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: uploadMode === "file" ? "var(--color-primary)" : "#e5e7eb",
            color: uploadMode === "file" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          📁 Subir desde PC
        </button>
        <button
          onClick={() => {
            setUploadMode("canvas");
            setShowCanvas(true);
            setSelectedFile(null);
            setHasDrawing(false);
            // Forzar re-render del canvas
            setTimeout(() => {
              if (canvasRef.current) {
                canvasRef.current.clear();
              }
            }, 100);
          }}
          style={{
            padding: "0.7rem 1.5rem",
            borderRadius: "0.5rem",
            border: "none",
            background: uploadMode === "canvas" ? "var(--color-primary)" : "#e5e7eb",
            color: uploadMode === "canvas" ? "#fff" : "#333",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          ✏️ Dibujar en Línea
        </button>
      </div>

      {/* Formulario de subida */}
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}
      >
        {uploadMode === "file" ? (
          <div>
            <label style={{ display: "block", marginBottom: "1rem", fontWeight: 600 }}>
              Seleccionar imagen:
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ marginBottom: "1rem" }}
            />
            {selectedFile && (
              <div style={{ marginBottom: "1rem" }}>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: "0.5rem" }}
                />
              </div>
            )}
          </div>
        ) : (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleClearCanvas}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                🗑️ Limpiar Pizarra
              </button>
              {hasDrawing && (
                <span style={{ color: "#10b981", fontWeight: 600, fontSize: "0.9rem" }}>
                  ✓ Tienes un dibujo listo para guardar
                </span>
              )}
            </div>
            <div
              style={{
                border: "3px solid #4a5568",
                borderRadius: "0.5rem",
                padding: "1rem",
                background: "#FFFFFF", // Fondo blanco
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                position: "relative",
                overflow: "hidden",
                maxWidth: "100%",
                margin: "0 auto"
              }}
            >
              {/* Marco de la pizarra */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: "8px solid #1a202c",
                  borderRadius: "0.5rem",
                  pointerEvents: "none",
                  zIndex: 1 // Debajo del canvas
                }}
              />
              
              {/* Contenedor del canvas - tamaño fijo y contenido */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  height: "600px",
                  margin: "0 auto",
                  position: "relative",
                  overflow: "hidden", // Sin scroll
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    width: "800px",
                    height: "600px",
                    position: "relative",
                    touchAction: "none",
                    userSelect: "none",
                    zIndex: 2,
                    background: "#FFFFFF" // Fondo blanco
                  }}
                >
                  {showCanvas && (
                    <div style={{ 
                      position: "relative", 
                      width: "800px", 
                      height: "600px",
                      zIndex: 10
                    }}>
                      <CanvasDraw
                        key="canvas-draw-board"
                        ref={canvasRef}
                        brushColor="#000000"
                        canvasWidth={800}
                        canvasHeight={600}
                        lazyRadius={0}
                        brushRadius={3}
                        hideGrid={false}
                        gridColor="rgba(0,0,0,0.15)"
                        canvasColor="#FFFFFF"
                        onChange={handleCanvasChange}
                        style={{
                          display: "block",
                          width: "800px",
                          height: "600px",
                          touchAction: "none",
                          pointerEvents: "auto",
                          cursor: "crosshair",
                          position: "absolute",
                          top: 0,
                          left: 0,
                          zIndex: 10,
                          backgroundColor: "#FFFFFF"
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!hasDrawing && (
              <p style={{ marginTop: "0.5rem", color: "#6b7280", fontSize: "0.9rem", fontStyle: "italic" }}>
                💡 Dibuja algo en el lienzo para poder guardarlo
              </p>
            )}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", position: "relative", zIndex: 100 }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Título (opcional):
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Mi familia, Mi casa, etc."
            style={{
              width: "100%",
              padding: "0.7rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              marginBottom: "1rem"
            }}
          />

          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
            Descripción (opcional):
          </label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Describe tu dibujo..."
            rows={3}
            style={{
              width: "100%",
              padding: "0.7rem",
              borderRadius: "0.5rem",
              border: "1px solid #e5e7eb",
              marginBottom: "1rem",
              resize: "vertical"
            }}
          />

          <div 
            style={{ 
              display: "flex", 
              gap: "1rem", 
              alignItems: "center",
              marginTop: "1.5rem",
              paddingTop: "1.5rem",
              borderTop: "2px solid #e5e7eb",
              position: "relative",
              zIndex: 100
            }}
          >
            <button
              onClick={handleUpload}
              disabled={
                loading || 
                (uploadMode === "file" && !selectedFile) ||
                (uploadMode === "canvas" && !hasDrawing)
              }
              style={{
                padding: "0.8rem 2.5rem",
                borderRadius: "0.5rem",
                border: "none",
                background: 
                  loading || 
                  (uploadMode === "file" && !selectedFile) ||
                  (uploadMode === "canvas" && !hasDrawing)
                    ? "#9ca3af" 
                    : "var(--color-primary)",
                color: "#fff",
                cursor: 
                  loading || 
                  (uploadMode === "file" && !selectedFile) ||
                  (uploadMode === "canvas" && !hasDrawing)
                    ? "not-allowed" 
                    : "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                boxShadow: 
                  loading || 
                  (uploadMode === "file" && !selectedFile) ||
                  (uploadMode === "canvas" && !hasDrawing)
                    ? "none"
                    : "0 4px 12px rgba(0,0,0,0.15)",
                transition: "all 0.2s",
                position: "relative",
                zIndex: 1000
              }}
            >
              {loading ? "⏳ Subiendo..." : "💾 Guardar Dibujo"}
            </button>
            {uploadMode === "canvas" && !hasDrawing && (
              <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                Dibuja algo primero para habilitar el botón
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Galería de dibujos */}
      <div>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Mis Dibujos</h2>
        {drawings.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Aún no has subido ningún dibujo.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.5rem"
            }}
          >
            {drawings.map((drawing) => (
              <div
                key={drawing.id}
                style={{
                  background: "#fff",
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <img
                  src={drawing.imagen_url}
                  alt={drawing.titulo || "Dibujo"}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "contain",
                    background: "#f9fafb",
                    borderRadius: "0.5rem",
                    marginBottom: "0.5rem"
                  }}
                />
                <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                  {drawing.titulo || "Sin título"}
                </h3>
                {drawing.descripcion && (
                  <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                    {drawing.descripcion}
                  </p>
                )}
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: "0.5rem" }}>
                  {new Date(drawing.created_at).toLocaleDateString("es-ES")}
                </p>
                {drawing.tipo_dibujo === "canvas" && drawing.drawing_data && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontSize: "0.8rem", color: "#3b82f6", marginBottom: "0.5rem", fontWeight: 600 }}>
                      ✏️ Dibujo digital (reproducible)
                    </p>
                    <button
                      onClick={() => handleReplay(drawing)}
                      style={{
                        width: "100%",
                        padding: "0.7rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        background: "#10b981",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.9rem"
                      }}
                    >
                      ▶️ Ver Reproducción
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de reproducción */}
      {replayDrawing && replayDrawing.drawing_data && (
        <DrawingReplay
          drawingData={replayDrawing.drawing_data}
          onClose={() => setReplayDrawing(null)}
          title={`Reproducción: ${replayDrawing.titulo || "Mi Dibujo"}`}
        />
      )}
    </div>
  );
}

