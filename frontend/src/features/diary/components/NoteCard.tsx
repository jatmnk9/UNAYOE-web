import * as React from 'react';
import { Note } from '../../../core/types';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { formatDateTime } from '../../../shared/utils';

interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: number) => void;
  isDeleting?: boolean;
}

const getSentimentConfig = (sentiment: string) => {
  const configs = {
    positivo: { variant: 'success' as const, emoji: '😊', label: 'Positivo' },
    negativo: { variant: 'destructive' as const, emoji: '😔', label: 'Negativo' },
    neutral: { variant: 'secondary' as const, emoji: '😐', label: 'Neutral' },
  };
  return configs[sentiment as keyof typeof configs] || configs.neutral;
};

/**
 * Tarjeta para mostrar una nota del diario
 */
export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const sentimentConfig = getSentimentConfig(note.sentimiento);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant={sentimentConfig.variant}>
            {sentimentConfig.emoji} {sentimentConfig.label}
          </Badge>
          {note.emocion && (
            <Badge variant="outline">
              {note.emocion} ({Math.round(note.emocion_score * 100)}%)
            </Badge>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatDateTime(note.created_at)}</span>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap text-sm text-gray-700">{note.nota}</p>

        {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 border-t pt-3">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(note)}
              >
                Editar
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(note.id)}
                isLoading={isDeleting}
              >
                Eliminar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
