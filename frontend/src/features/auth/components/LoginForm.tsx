import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
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
    <form onSubmit={handleSubmit} className="w-full space-y-6">
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
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300" />
          <span className="text-sm text-gray-600">Recordarme</span>
        </label>
        <a href="#" className="text-sm text-[var(--color-primary)] hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tienes cuenta?{' '}
        <a
          href={ROUTES.SIGNUP}
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Regístrate aquí
        </a>
      </p>
    </form>
  );
};
