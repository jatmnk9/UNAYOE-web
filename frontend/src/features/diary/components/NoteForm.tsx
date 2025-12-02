import * as React from 'react';
import { useState } from 'react';
import { Button } from '../../../shared/components/ui/button';
import { Textarea } from '../../../shared/components/ui/textarea';
import { Badge } from '../../../shared/components/ui/badge';
import { SENTIMENTS } from '../../../core/config/constants';

interface NoteFormProps {
  onSubmit: (nota: string, sentimiento: string) => Promise<void>;
  isLoading?: boolean;
  initialNote?: string;
  initialSentiment?: string;
  submitLabel?: string;
}

const sentimentOptions = [
  { value: SENTIMENTS.POSITIVE, label: 'Positivo', emoji: '😊' },
  { value: SENTIMENTS.NEGATIVE, label: 'Negativo', emoji: '😔' },
  { value: SENTIMENTS.NEUTRAL, label: 'Neutral', emoji: '😐' },
];

/**
 * Formulario para crear o editar notas del diario
 */
export const NoteForm: React.FC<NoteFormProps> = ({
  onSubmit,
  isLoading = false,
  initialNote = '',
  initialSentiment = SENTIMENTS.NEUTRAL,
  submitLabel = 'Guardar nota',
}) => {
  const [nota, setNota] = useState(initialNote);
  const [sentimiento, setSentimiento] = useState(initialSentiment);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nota.trim()) {
      setError('La nota no puede estar vacía');
      return;
    }

    if (nota.length < 10) {
      setError('La nota debe tener al menos 10 caracteres');
      return;
    }

    await onSubmit(nota, sentimiento);
    setNota('');
    setSentimiento(SENTIMENTS.NEUTRAL);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        id="nota"
        name="nota"
        label="¿Cómo te sientes hoy?"
        placeholder="Escribe tus pensamientos, emociones o experiencias del día..."
        value={nota}
        onChange={(e) => {
          setNota(e.target.value);
          if (error) setError('');
        }}
        error={error}
        rows={6}
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          ¿Cómo calificarías este momento?
        </label>
        <div className="flex gap-3">
          {sentimentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSentimiento(option.value)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all ${
                sentimiento === option.value
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
