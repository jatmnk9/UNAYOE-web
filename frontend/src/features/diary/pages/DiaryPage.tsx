import * as React from 'react';
import { useEffect, useState } from 'react';
import { useDiary } from '../hooks/useDiary';
import { useAuth } from '../../auth/hooks/useAuth';
import { NoteForm } from '../components/NoteForm';
import { NoteList } from '../components/NoteList';
import { AccompanimentMessage } from '../components/AccompanimentMessage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';
import { Modal } from '../../../shared/components/ui/modal';
import { useToast } from '../../../shared/components/ui/toast';
import { Note } from '../../../core/types';

export const DiaryPage: React.FC = () => {
  const { user } = useAuth();
  const {
    notes,
    isLoading,
    accompanimentMessage,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useDiary();

  const { success: showSuccess, error: showError } = useToast();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotes(user.id);
    }
  }, [user?.id]);

  const handleCreateNote = async (nota: string, sentimiento: string) => {
    if (!user?.id) return;

    const success = await createNote(user.id, nota, sentimiento);
    if (success) {
      showSuccess('Nota creada exitosamente');
    } else {
      showError('Error al crear la nota');
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = async (nota: string, sentimiento: string) => {
    if (!user?.id || !editingNote) return;

    const success = await updateNote(editingNote.id, user.id, nota, sentimiento);
    if (success) {
      showSuccess('Nota actualizada exitosamente');
      setIsEditModalOpen(false);
      setEditingNote(null);
    } else {
      showError('Error al actualizar la nota');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!user?.id) return;

    const confirmed = window.confirm('¿Estás seguro de eliminar esta nota?');
    if (!confirmed) return;

    setDeletingNoteId(noteId);
    const success = await deleteNote(noteId, user.id);

    if (success) {
      showSuccess('Nota eliminada exitosamente');
    } else {
      showError('Error al eliminar la nota');
    }
    setDeletingNoteId(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[var(--color-dark)]">Mi Diario</h1>
        <p className="text-gray-600">
          Registra tus pensamientos y emociones diarias
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Entrada</CardTitle>
          <CardDescription>
            Comparte cómo te sientes hoy. Tus notas son privadas y confidenciales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NoteForm onSubmit={handleCreateNote} isLoading={isLoading} />
        </CardContent>
      </Card>

      {accompanimentMessage && (
        <AccompanimentMessage message={accompanimentMessage} />
      )}

      <div>
        <h2 className="mb-4 text-xl font-semibold text-[var(--color-dark)]">
          Entradas Anteriores
        </h2>
        <NoteList
          notes={notes}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onDelete={handleDeleteNote}
          deletingNoteId={deletingNoteId}
        />
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingNote(null);
        }}
        title="Editar Nota"
        size="lg"
      >
        {editingNote && (
          <NoteForm
            onSubmit={handleUpdateNote}
            isLoading={isLoading}
            initialNote={editingNote.nota}
            initialSentiment={editingNote.sentimiento}
            submitLabel="Actualizar nota"
          />
        )}
      </Modal>
    </div>
  );
};
