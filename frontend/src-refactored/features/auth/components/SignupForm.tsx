import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
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
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <Input
        id="nombre"
        name="nombre"
        type="text"
        label="Nombre completo"
        placeholder="Juan Pérez"
        value={formData.nombre}
        onChange={handleChange}
        error={formErrors.nombre}
        required
        autoComplete="name"
      />

      <Input
        id="email"
        name="email"
        type="email"
        label="Correo electrónico"
        placeholder="tu@correo.com"
        value={formData.email}
        onChange={handleChange}
        error={formErrors.email}
        required
        autoComplete="email"
      />

      <div className="w-full">
        <label htmlFor="rol" className="mb-2 block text-sm font-medium text-gray-700">
          Tipo de usuario
        </label>
        <select
          id="rol"
          name="rol"
          value={formData.rol}
          onChange={handleChange}
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          required
        >
          <option value={USER_ROLES.STUDENT}>Estudiante</option>
          <option value={USER_ROLES.PSYCHOLOGIST}>Psicólogo</option>
        </select>
      </div>

      <Input
        id="password"
        name="password"
        type="password"
        label="Contraseña"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={formErrors.password}
        required
        autoComplete="new-password"
      />

      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={formErrors.confirmPassword}
        required
        autoComplete="new-password"
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a
          href={ROUTES.LOGIN}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Inicia sesión
        </a>
      </p>
    </form>
  );
};
