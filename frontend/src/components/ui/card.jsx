// Tarjetas reutilizables (estructura modular)
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`p-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h2 className={`text-lg font-semibold text-gray-800 ${className}`}>
      {children}
    </h2>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`p-4 text-gray-700 ${className}`}>
      {children}
    </div>
  );
}
