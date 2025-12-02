/**
 * Feature: Diario
 * Exportación centralizada de todos los módulos del diario
 */

// Services
export { diaryService } from './services/diaryService';

// Store
export { useDiaryStore } from './store/diaryStore';

// Hooks
export { useDiary } from './hooks/useDiary';

// Components
export { NoteForm, NoteCard, NoteList, AccompanimentMessage } from './components';

// Pages
export { DiaryPage } from './pages';
