import * as React from "react";
import { LoginForm } from "../components/LoginForm";

export const LoginPage: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Columna izquierda - Imagen de fondo con branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden min-h-screen">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/fondo.png")' }}
        />

        {/* Overlay con degradado sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-transparent" />

        {/* Contenido de branding - alineado arriba izquierda */}
        <div className="absolute inset-0 flex flex-col items-start justify-start p-12 z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg mb-6">
            <img
              src="/isotipo.png"
              alt="UNAYOE Isotipo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            UNAYOE
          </h1>
          <p className="text-lg text-white/90">
            Centro de Bienestar Estudiantil
          </p>
        </div>

        {/* Línea de acento inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-transparent" />
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Header para móviles */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-50 mb-4">
              <img
                src="/isotipo.png"
                alt="UNAYOE"
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UNAYOE</h1>
            <p className="text-sm text-gray-600">
              Portal de Bienestar Estudiantil
            </p>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">


            {/* Contenido del formulario */}
            <div className="p-8 sm:p-10">
              {/* Título para desktop */}
              <div className="hidden lg:block text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bienvenido
                </h2>
                <p className="text-sm text-gray-600">
                  Accede a tu cuenta institucional
                </p>
              </div>

              {/* Formulario */}
              <LoginForm />
            </div>

         
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-500 mt-6">
            © 2025 Centro de Bienestar Estudiantil UNAYOE. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </main>
  );
};
