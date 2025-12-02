import * as React from 'react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Input } from '../../../shared/components/ui/input';
import { Textarea } from '../../../shared/components/ui/textarea';

interface AppointmentFormProps {
  onSubmit: (appointmentData: any) => Promise<void>;
  isLoading?: boolean;
  psychologists?: any[];
  initialData?: any;
  submitLabel?: string;
}

/**
 * Formulario para crear o editar citas
 */
export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  isLoading = false,
  psychologists = [],
  initialData = {},
  submitLabel = 'Solicitar cita',
}) => {
  const [formData, setFormData] = useState({
    motivo: initialData.motivo || '',
    fecha_hora: initialData.fecha_hora || '',
    psicologo_id: initialData.psicologo_id || '',
  });

  const [errors, setErrors] = useState({
    motivo: '',
    fecha_hora: '',
    psicologo_id: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      motivo: '',
      fecha_hora: '',
      psicologo_id: '',
    };

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'El motivo es requerido';
    } else if (formData.motivo.length < 10) {
      newErrors.motivo = 'El motivo debe tener al menos 10 caracteres';
    }

    if (!formData.fecha_hora) {
      newErrors.fecha_hora = 'La fecha y hora son requeridas';
    } else {
      const selectedDate = new Date(formData.fecha_hora);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.fecha_hora = 'La fecha debe ser futura';
      }
    }

    if (!formData.psicologo_id && psychologists.length > 0) {
      newErrors.psicologo_id = 'Selecciona un psicólogo';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await onSubmit(formData);
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        id="motivo"
        name="motivo"
        label="Motivo de la consulta"
        placeholder="Describe brevemente el motivo de tu consulta..."
        value={formData.motivo}
        onChange={handleChange}
        error={errors.motivo}
        rows={4}
        required
      />

      <Input
        id="fecha_hora"
        name="fecha_hora"
        type="datetime-local"
        label="Fecha y hora deseada"
        value={formData.fecha_hora}
        onChange={handleChange}
        error={errors.fecha_hora}
        min={minDateTime}
        required
      />

      {psychologists.length > 0 && (
        <div className="w-full">
          <label
            htmlFor="psicologo_id"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Psicólogo (opcional)
          </label>
          <select
            id="psicologo_id"
            name="psicologo_id"
            value={formData.psicologo_id}
            onChange={handleChange}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          >
            <option value="">Asignar automáticamente</option>
            {psychologists.map((psychologist) => (
              <option key={psychologist.id} value={psychologist.id}>
                {psychologist.nombre}
              </option>
            ))}
          </select>
          {errors.psicologo_id && (
            <p className="mt-1 text-xs text-red-500">{errors.psicologo_id}</p>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
