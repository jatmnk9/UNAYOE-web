import * as React from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';

interface AccompanimentMessageProps {
  message: string;
  onClose?: () => void;
}

/**
 * Mensaje de acompañamiento generado por IA
 */
export const AccompanimentMessage: React.FC<AccompanimentMessageProps> = ({
  message,
  onClose,
}) => {
  return (
    <Card className="border-l-4 border-[var(--color-primary)] bg-gradient-to-r from-[var(--color-primary)]/5 to-transparent">
      <CardContent className="flex items-start gap-4 pt-6">
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h4 className="mb-2 font-semibold text-[var(--color-dark)]">
            Mensaje de Acompañamiento
          </h4>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {message}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Cerrar mensaje"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </CardContent>
    </Card>
  );
};
