import { useState, useEffect, useRef } from "react";
import CanvasDraw from "react-canvas-draw";

export default function DrawingReplay({ drawingData, onClose, title = "Reproducción del Dibujo" }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [lines, setLines] = useState([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1x, 2x, 4x
  const intervalRef = useRef(null);

  useEffect(() => {
    if (drawingData) {
      // Manejar caso donde drawingData puede ser string o objeto
      let parsedData = drawingData;
      if (typeof drawingData === 'string') {
        try {
          parsedData = JSON.parse(drawingData);
        } catch (e) {
          console.error("Error parseando drawingData:", e);
          return;
        }
      }
      
      if (parsedData && parsedData.lines) {
        setLines(parsedData.lines || []);
      }
    }
  }, [drawingData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startReplay = () => {
    if (!canvasRef.current || !drawingData) return;

    // Manejar caso donde drawingData puede ser string o objeto
    let parsedData = drawingData;
    if (typeof drawingData === 'string') {
      try {
        parsedData = JSON.parse(drawingData);
      } catch (e) {
        console.error("Error parseando drawingData:", e);
        return;
      }
    }

    if (!parsedData || !parsedData.lines) {
      console.error("drawingData no tiene líneas válidas");
      return;
    }

    // Limpiar el canvas primero
    canvasRef.current.clear();
    setCurrentLineIndex(0);
    setIsPlaying(true);

    // Cargar todas las líneas hasta el índice actual
    const loadLinesUpTo = (index) => {
      if (!canvasRef.current || !parsedData.lines) return;
      
      // Crear un objeto con las líneas hasta el índice
      const partialData = {
        ...parsedData,
        lines: parsedData.lines.slice(0, index + 1)
      };
      
      try {
        canvasRef.current.loadSaveData(JSON.stringify(partialData));
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    };

    // Reproducir línea por línea
    let index = 0;
    const totalLines = parsedData.lines.length;
    
    const playNextLine = () => {
      if (index < totalLines) {
        loadLinesUpTo(index);
        setCurrentLineIndex(index);
        index++;
      } else {
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    // Velocidad de reproducción (ms por línea)
    const speedMs = {
      1: 50,   // 1x: 50ms por línea
      2: 25,   // 2x: 25ms por línea
      4: 12    // 4x: 12ms por línea
    };

    intervalRef.current = setInterval(playNextLine, speedMs[playbackSpeed] || 50);
  };

  const stopReplay = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resetReplay = () => {
    stopReplay();
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setCurrentLineIndex(0);
  };

  const showFinal = () => {
    stopReplay();
    if (canvasRef.current && drawingData) {
      // Manejar caso donde drawingData puede ser string o objeto
      let parsedData = drawingData;
      if (typeof drawingData === 'string') {
        try {
          parsedData = JSON.parse(drawingData);
        } catch (e) {
          console.error("Error parseando drawingData:", e);
          return;
        }
      }
      
      try {
        canvasRef.current.loadSaveData(JSON.stringify(parsedData));
        setCurrentLineIndex(lines.length);
      } catch (e) {
        console.error("Error cargando datos finales:", e);
      }
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem"
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.8rem", color: "var(--color-primary)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280"
            }}
          >
            ×
          </button>
        </div>

        {/* Controles de reproducción */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {!isPlaying ? (
            <button
              onClick={startReplay}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#10b981",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              ▶️ Reproducir
            </button>
          ) : (
            <button
              onClick={stopReplay}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#ef4444",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.9rem"
              }}
            >
              ⏸️ Pausar
            </button>
          )}
          <button
            onClick={resetReplay}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#6b7280",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          >
            🔄 Reiniciar
          </button>
          <button
            onClick={showFinal}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#3b82f6",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem"
            }}
          >
            ⏩ Ver Final
          </button>
          <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: 600 }}>Velocidad:</label>
            <select
              value={playbackSpeed}
              onChange={(e) => {
                setPlaybackSpeed(Number(e.target.value));
                if (isPlaying) {
                  stopReplay();
                  setTimeout(startReplay, 100);
                }
              }}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: "0.9rem"
              }}
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Progreso: {currentLineIndex} / {lines.length} líneas
            </span>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              {lines.length > 0 ? Math.round((currentLineIndex / lines.length) * 100) : 0}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#e5e7eb",
              borderRadius: "4px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: `${lines.length > 0 ? (currentLineIndex / lines.length) * 100 : 0}%`,
                height: "100%",
                background: "var(--color-primary)",
                transition: "width 0.1s ease"
              }}
            />
          </div>
        </div>

        {/* Canvas para reproducir */}
        <div
          style={{
            border: "3px solid #4a5568",
            borderRadius: "0.5rem",
            padding: "1rem",
            background: "#FFFFFF",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              height: "600px",
              margin: "0 auto",
              position: "relative",
              background: "#FFFFFF"
            }}
          >
            <CanvasDraw
              ref={canvasRef}
              disabled={true}
              brushColor="#000000"
              canvasWidth={800}
              canvasHeight={600}
              lazyRadius={0}
              brushRadius={3}
              hideGrid={false}
              gridColor="rgba(0,0,0,0.15)"
              canvasColor="#FFFFFF"
              style={{
                display: "block",
                width: "800px",
                height: "600px",
                touchAction: "none",
                pointerEvents: "none",
                cursor: "default"
              }}
            />
          </div>
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#6b7280", textAlign: "center" }}>
          💡 Esta es la reproducción del proceso de dibujo. Usa los controles para ver cómo se creó el dibujo paso a paso.
        </p>
      </div>
    </div>
  );
}

