import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../../../shared/components/ui/toast';
import { ROUTES, USER_ROLES } from '../../../core/config/constants';

export const SignupForm: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError } = useAuth();
  const { success: showSuccess, error: showError } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: USER_ROLES.STUDENT as 'estudiante' | 'psicologo',
  });

  const [formErrors, setFormErrors] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = (): boolean => {
    const errors = {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.nombre) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

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

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFormErrors(errors);
    return Object.values(errors).every((error) => !error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    const success = await signup(
      formData.nombre,
      formData.email,
      formData.password,
      formData.rol
    );

    if (success) {
      showSuccess('Registro exitoso. ¡Bienvenido!');
      navigate(
        formData.rol === USER_ROLES.STUDENT ? ROUTES.STUDENT.ROOT : ROUTES.PSYCHOLOGIST.ROOT
      );
    } else {
      showError(error || 'Error al registrarse');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Grid de 2 columnas para campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nombre completo */}
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-900">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Juan Pérez"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoComplete="name"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.nombre
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 outline-none transition-all duration-200 bg-gray-50/50`}
          />
          {formErrors.nombre && (
            <p className="text-sm text-red-600 mt-1">{formErrors.nombre}</p>
          )}
        </div>

        {/* Correo electrónico */}
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-900">
            Correo Institucional
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="correo@institucion.com"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.email
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 outline-none transition-all duration-200 bg-gray-50/50`}
          />
          {formErrors.email && (
            <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Tipo de usuario */}
        <div className="sm:col-span-2 space-y-2">
          <label htmlFor="rol" className="block text-sm font-medium text-gray-900">
            Tipo de Cuenta
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200 bg-gray-50/50"
          >
            <option value={USER_ROLES.STUDENT}>Estudiante</option>
            <option value={USER_ROLES.PSYCHOLOGIST}>Psicólogo</option>
          </select>
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-900">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.password
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 outline-none transition-all duration-200 bg-gray-50/50`}
          />
          {formErrors.password && (
            <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
            Confirmar Contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            className={`w-full px-4 py-3 rounded-lg border ${
              formErrors.confirmPassword
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
            } focus:ring-4 outline-none transition-all duration-200 bg-gray-50/50`}
          />
          {formErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{formErrors.confirmPassword}</p>
          )}
        </div>
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
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creando cuenta...
          </span>
        ) : (
          'Crear Cuenta'
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

      {/* Link a login */}
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a
          href={ROUTES.LOGIN}
          className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
};
