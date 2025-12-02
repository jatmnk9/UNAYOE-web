import * as React from 'react';
import { Note } from '../../../core/types';
import { NoteCard } from './NoteCard';
import { LoadingSpinner, Skeleton } from '../../../shared/components/ui/loading';

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: number) => void;
  deletingNoteId?: number | null;
}

/**
 * Lista de notas del diario con estados de carga
 */
export const NoteList: React.FC<NoteListProps> = ({
  notes,
  isLoading = false,
  onEdit,
  onDelete,
  deletingNoteId = null,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <svg
          className="mb-4 h-16 w-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mb-2 text-lg font-semibold text-gray-700">
          No hay notas registradas
        </h3>
        <p className="text-sm text-gray-500">
          Comienza a escribir sobre tus pensamientos y emociones
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingNoteId === note.id}
        />
      ))}
    </div>
  );
};
