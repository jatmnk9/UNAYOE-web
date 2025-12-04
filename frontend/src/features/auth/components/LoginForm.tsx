import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../shared/components/ui/toast';
import { ROUTES } from '../../../core/config/constants';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  const validateForm = (): boolean => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Correo inválido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const success = await login(formData.email, formData.password);

    if (success) {
      showSuccess('Inicio de sesión exitoso');
      navigate(ROUTES.STUDENT.ROOT);
    } else {
      showError(error || 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Campo de correo */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-900">
          Correo Institucional
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ejemplo@institucion.edu.co"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className={`w-full px-4 py-3 text-sm rounded-lg border ${
            formErrors.email
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
          } focus:ring-1 outline-none transition-all duration-200 bg-gray-50/50 placeholder:text-gray-400`}
        />
        {formErrors.email && (
          <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
        )}
      </div>

      {/* Campo de contraseña */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-900">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Ingresa tu contraseña"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className={`w-full px-4 py-3 text-sm rounded-lg border ${
            formErrors.password
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/30'
          } focus:ring-1 outline-none transition-all duration-200 bg-gray-50/50 placeholder:text-gray-400`}
        />
        {formErrors.password && (
          <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>
        )}
      </div>

      {/* Recordarme / Olvidaste contraseña */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer transition-all"
            style={{ accentColor: '#3b82f6' }}
          />
          <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Recuérdame
          </span>
        </label>
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Botón de submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Iniciando sesión...
          </span>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>

      {/* Link a registro */}
      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a
          href={ROUTES.SIGNUP}
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Regístrate aquí
        </a>
      </p>
    </form>
  );
};
