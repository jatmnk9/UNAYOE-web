import { create } from 'zustand';
import { Note } from '../../../core/types';
import { diaryService } from '../services/diaryService';

interface DiaryState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  accompanimentMessage: string | null;
}

interface DiaryActions {
  setNotes: (notes: Note[]) => void;
  setCurrentNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAccompaniment: (message: string | null) => void;
  fetchNotes: (userId: string) => Promise<void>;
  createNote: (userId: string, nota: string, sentimiento: string) => Promise<boolean>;
  updateNote: (noteId: number, userId: string, nota: string, sentimiento: string) => Promise<boolean>;
  deleteNote: (noteId: number, userId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

type DiaryStore = DiaryState & DiaryActions;

/**
 * Store global del diario usando Zustand
 * Gestiona el estado de las notas y operaciones CRUD
 */
export const useDiaryStore = create<DiaryStore>((set) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  accompanimentMessage: null,

  setNotes: (notes) => set({ notes }),

  setCurrentNote: (note) => set({ currentNote: note }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setAccompaniment: (message) => set({ accompanimentMessage: message }),

  clearError: () => set({ error: null }),

  reset: () => set({
    notes: [],
    currentNote: null,
    isLoading: false,
    error: null,
    accompanimentMessage: null,
  }),

  fetchNotes: async (userId) => {
    set({ isLoading: true, error: null });

    try {
      const notes = await diaryService.getNotes(userId);
      set({ notes, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar las notas',
        isLoading: false,
      });
    }
  },

  createNote: async (userId, nota, sentimiento) => {
    set({ isLoading: true, error: null, accompanimentMessage: null });

    try {
      const result = await diaryService.createNote({
        user_id: userId,
        nota,
        sentimiento,
      });

      set((state) => ({
        notes: [result, ...state.notes],
        accompanimentMessage: result.accompaniment || null,
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al crear la nota',
        isLoading: false,
      });
      return false;
    }
  },

  updateNote: async (noteId, userId, nota, sentimiento) => {
    set({ isLoading: true, error: null });

    try {
      const updatedNote = await diaryService.updateNote(noteId, userId, {
        nota,
        sentimiento,
      });

      set((state) => ({
        notes: state.notes.map((n) => (n.id === noteId ? updatedNote : n)),
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al actualizar la nota',
        isLoading: false,
      });
      return false;
    }
  },

  deleteNote: async (noteId, userId) => {
    set({ isLoading: true, error: null });

    try {
      await diaryService.deleteNote(noteId, userId);

      set((state) => ({
        notes: state.notes.filter((n) => n.id !== noteId),
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.message || 'Error al eliminar la nota',
        isLoading: false,
      });
      return false;
    }
  },
}));
