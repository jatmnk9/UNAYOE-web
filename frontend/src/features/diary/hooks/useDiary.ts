import { useDiaryStore } from '../store/diaryStore';

/**
 * Hook personalizado para acceder al estado y acciones del diario
 * Simplifica el acceso al store del diario
 *
 * @example
 * const { notes, isLoading, createNote, fetchNotes } = useDiary();
 *
 * useEffect(() => {
 *   fetchNotes(user.id);
 * }, []);
 */
export const useDiary = () => {
  const {
    notes,
    currentNote,
    isLoading,
    error,
    accompanimentMessage,
    setCurrentNote,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    clearError,
    reset,
  } = useDiaryStore();

  return {
    notes,
    currentNote,
    isLoading,
    error,
    accompanimentMessage,
    setCurrentNote,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    clearError,
    reset,
  };
};
