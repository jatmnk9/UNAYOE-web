import * as React from 'react';
import { SignupForm } from '../components/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Columna izquierda - Imagen de fondo con branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden min-h-screen">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/fondo.png")' }}
        />

        {/* Overlay con degradado */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/85 via-blue-600/80 to-blue-700/75" />

        {/* Contenido de branding */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white/95 backdrop-blur-sm shadow-2xl mb-8 p-4">
            <img
              src="/isotipo.png"
              alt="UNAYOE Isotipo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 text-shadow-lg">
            UNAYOE
          </h1>
          <p className="text-xl text-white/95 text-center mb-2">
            Centro de Bienestar Estudiantil
          </p>
          <p className="text-lg text-white/90 text-center font-light">
            Únete a nuestra comunidad
          </p>
        </div>

        {/* Línea de acento inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 min-h-screen">
        <div className="w-full max-w-lg">
          {/* Header para móviles */}
          <div className="md:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 mb-4">
              <img
                src="/isotipo.png"
                alt="UNAYOE"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">UNAYOE</h1>
            <p className="text-sm text-gray-600">Portal de Bienestar Estudiantil</p>
          </div>

          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Línea de acento superior */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500" />

            {/* Contenido del formulario */}
            <div className="p-8 sm:p-10">
              {/* Título para desktop */}
              <div className="hidden md:block text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
                <p className="text-sm text-gray-600">Completa el formulario para registrarte</p>
              </div>

              {/* Formulario */}
              <SignupForm />
            </div>

            {/* Línea de acento inferior */}
            <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
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
