# 🚀 Plan de Refactorización Frontend - UNAYOE Web

> **Documento de Planificación Técnica**
> **Fecha:** 2025-12-02
> **Objetivo:** Refactorizar el frontend aplicando principios SOLID, arquitectura limpia y mejores prácticas

---

## 📋 Análisis del Estado Actual

### Problemas Identificados

1. **❌ Arquitectura**
   - Llamadas API distribuidas en componentes
   - No hay separación clara de responsabilidades
   - Mezcla de lógica de negocio con presentación
   - Componentes muy acoplados

2. **❌ Gestión de Estado**
   - Solo Context API para auth (limitado)
   - No hay caching de datos
   - Re-renders innecesarios
   - Estado local duplicado

3. **❌ Código**
   - URLs hardcoded
   - Estilos inline mezclados con CSS
   - Sin validación robusta de formularios
   - Sin manejo centralizado de errores
   - Archivos .jsx y .ts mezclados

4. **❌ UX/UI**
   - Componentes UI básicos
   - Feedback limitado al usuario
   - No hay estados de carga consistentes
   - Falta diseño system cohesivo

5. **❌ Mantenibilidad**
   - Sin tests
   - Documentación limitada
   - Código duplicado
   - Dificultad para escalar

---

## 🎯 Objetivos de la Refactorización

### Principios a Aplicar

1. **SOLID Principles**
   - **S**: Single Responsibility - Un componente, una responsabilidad
   - **O**: Open/Closed - Extensible sin modificar
   - **L**: Liskov Substitution - Componentes intercambiables
   - **I**: Interface Segregation - Interfaces específicas
   - **D**: Dependency Inversion - Depender de abstracciones

2. **Clean Architecture**
   - Separación en capas (presentación, negocio, datos)
   - Independencia de frameworks
   - Fácil de testear

3. **DRY (Don't Repeat Yourself)**
   - Componentes reutilizables
   - Hooks personalizados
   - Utilidades compartidas

4. **KISS (Keep It Simple, Stupid)**
   - Código simple y legible
   - Evitar sobre-ingeniería
   - Abstracciones necesarias

---

## 🏗️ Nueva Arquitectura Propuesta

### Estructura de Carpetas (Feature-Based)

```
frontend/src/
├── core/                           # Núcleo de la aplicación
│   ├── api/                       # Cliente API configurado
│   │   ├── client.ts              # Axios/Fetch configurado
│   │   ├── interceptors.ts        # Interceptores de request/response
│   │   └── types.ts               # Tipos de respuesta API
│   ├── config/                    # Configuración
│   │   ├── index.ts               # Config centralizada
│   │   └── constants.ts           # Constantes globales
│   ├── router/                    # Configuración de rutas
│   │   ├── index.tsx              # Router principal
│   │   ├── routes.tsx             # Definición de rutas
│   │   └── guards.tsx             # Guards de autenticación
│   └── types/                     # Tipos globales TypeScript
│       ├── user.ts
│       ├── api.ts
│       └── index.ts
│
├── features/                       # Features modulares
│   ├── auth/                      # Autenticación
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   └── index.ts
│   │   ├── store/                 # Estado (Zustand/Context)
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       └── validation.ts
│   │
│   ├── diary/                     # Diario de Bienestar
│   │   ├── components/
│   │   │   ├── DiaryEntry.tsx
│   │   │   ├── DiaryList.tsx
│   │   │   ├── EmotionBadge.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDiary.ts
│   │   │   ├── useNotes.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── diaryService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── pages/
│   │       └── DiaryPage.tsx
│   │
│   ├── recommendations/           # PsicoTips
│   │   ├── components/
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── RecommendationModal.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useRecommendations.ts
│   │   │   ├── useFavorites.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── recommendationsService.ts
│   │   └── pages/
│   │       └── RecommendationsPage.tsx
│   │
│   ├── appointments/              # Gestión de Citas
│   │   ├── components/
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── AppointmentForm.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAppointments.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   └── appointmentsService.ts
│   │   └── pages/
│   │       ├── AppointmentsList.tsx
│   │       ├── CreateAppointment.tsx
│   │       └── EditAppointment.tsx
│   │
│   ├── psychologist/              # Módulo Psicólogo
│   │   ├── components/
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StudentReport.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useStudents.ts
│   │   ├── services/
│   │   │   └── psychologistService.ts
│   │   └── pages/
│   │       ├── StudentsList.tsx
│   │       └── StudentDetail.tsx
│   │
│   └── dashboard/                 # Dashboards
│       ├── student/
│       │   └── StudentDashboard.tsx
│       └── psychologist/
│           └── PsychologistDashboard.tsx
│
├── shared/                         # Código compartido
│   ├── components/                # Componentes UI reutilizables
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── index.ts
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   └── feedback/
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorMessage.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                     # Hooks compartidos
│   │   ├── useApi.ts             # Hook genérico para API
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   ├── usePagination.ts
│   │   └── index.ts
│   │
│   ├── utils/                     # Utilidades
│   │   ├── format.ts             # Formateo de fechas, números
│   │   ├── validation.ts         # Validaciones comunes
│   │   ├── storage.ts            # localStorage/sessionStorage
│   │   ├── errors.ts             # Manejo de errores
│   │   └── index.ts
│   │
│   ├── constants/                 # Constantes compartidas
│   │   ├── routes.ts
│   │   ├── messages.ts
│   │   └── index.ts
│   │
│   └── types/                     # Tipos compartidos
│       ├── common.ts
│       └── index.ts
│
├── layouts/                        # Layouts de aplicación
│   ├── MainLayout.tsx            # Layout principal
│   ├── AuthLayout.tsx            # Layout para auth
│   ├── StudentLayout.tsx         # Layout estudiante
│   ├── PsychologistLayout.tsx    # Layout psicólogo
│   └── index.ts
│
├── pages/                          # Páginas públicas
│   ├── Home.tsx
│   ├── NotFound.tsx
│   └── index.ts
│
├── styles/                         # Estilos globales
│   ├── globals.css
│   ├── theme.css                 # Variables CSS
│   └── animations.css
│
├── App.tsx                         # Componente raíz
└── main.tsx                        # Punto de entrada
```

---

## 🔧 Stack Tecnológico Actualizado

### Core
- **React 19.1.1** - Framework UI
- **TypeScript 5.9+** - Tipado estático
- **Vite 7.1.7** - Build tool

### Estado
- **Zustand 4.x** - Estado global ligero (reemplaza Context API complejo)
- **React Query (TanStack Query)** - Server state, caching, revalidación

### UI/UX
- **Tailwind CSS 4.x** - Estilos utility-first
- **shadcn/ui** - Componentes base accesibles
- **Radix UI** - Componentes primitivos
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos

### Formularios
- **React Hook Form** - Gestión de formularios
- **Zod** - Validación de esquemas

### HTTP
- **Axios** - Cliente HTTP con interceptores

### Utilidades
- **date-fns** - Manipulación de fechas
- **clsx** / **tailwind-merge** - Utilidades de clases CSS

---

## 📝 Plan de Implementación

### Fase 1: Fundamentos (Semana 1)

#### 1.1 Configuración Base
- [x] Crear estructura de carpetas
- [ ] Configurar variables de entorno
- [ ] Setup TypeScript estricto
- [ ] Configurar path aliases (@/ para src/)

#### 1.2 Core API
- [ ] Cliente HTTP centralizado (Axios)
- [ ] Interceptores para auth tokens
- [ ] Manejo centralizado de errores
- [ ] Tipos base de API responses

#### 1.3 Servicios API
- [ ] authService - Autenticación
- [ ] diaryService - Diario
- [ ] recommendationsService - Recomendaciones
- [ ] appointmentsService - Citas
- [ ] psychologistService - Psicólogo

### Fase 2: Componentes Base (Semana 1-2)

#### 2.1 shadcn/ui Components
- [ ] Button con variantes
- [ ] Card (Card, CardHeader, CardContent, CardFooter)
- [ ] Input / Textarea
- [ ] Modal/Dialog
- [ ] Toast/Notifications
- [ ] Loading states (Skeleton, Spinner)
- [ ] Badge
- [ ] Alert

#### 2.2 Layout Components
- [ ] MainLayout con Sidebar responsive
- [ ] Header con navegación
- [ ] Sidebar con navegación activa
- [ ] Footer
- [ ] ProtectedRoute component

#### 2.3 Feedback Components
- [ ] LoadingSpinner
- [ ] EmptyState
- [ ] ErrorBoundary
- [ ] ErrorMessage

### Fase 3: Features (Semana 2-3)

#### 3.1 Auth Feature
- [ ] AuthStore (Zustand)
- [ ] useAuth hook
- [ ] LoginForm component
- [ ] SignupForm component
- [ ] authService

#### 3.2 Diary Feature
- [ ] useDiary hook con React Query
- [ ] DiaryEntry component
- [ ] DiaryList component
- [ ] EmotionBadge component
- [ ] DiaryPage

#### 3.3 Recommendations Feature
- [ ] useRecommendations hook
- [ ] useFavorites hook
- [ ] RecommendationCard
- [ ] RecommendationModal
- [ ] FavoriteButton

#### 3.4 Appointments Feature
- [ ] useAppointments hook
- [ ] AppointmentCard
- [ ] AppointmentForm con validación
- [ ] StatusBadge
- [ ] CRUD pages

#### 3.5 Psychologist Feature
- [ ] useStudents hook
- [ ] StudentCard
- [ ] StudentReport con Charts
- [ ] StudentsList
- [ ] StudentDetail

### Fase 4: Hooks Compartidos (Semana 3)

- [ ] useApi - Hook genérico para API calls
- [ ] useDebounce
- [ ] useLocalStorage
- [ ] useMediaQuery
- [ ] usePagination
- [ ] useToast

### Fase 5: Optimización y Testing (Semana 4)

#### 5.1 Performance
- [ ] Lazy loading de páginas
- [ ] Code splitting
- [ ] React.memo en componentes pesados
- [ ] useMemo / useCallback donde sea necesario
- [ ] Optimistic updates

#### 5.2 UX Improvements
- [ ] Loading states en todas las acciones
- [ ] Error messages consistentes
- [ ] Success feedback
- [ ] Animaciones de transición
- [ ] Responsive design refinado

#### 5.3 Testing (Opcional pero recomendado)
- [ ] Setup Vitest
- [ ] Tests unitarios de hooks
- [ ] Tests de componentes con React Testing Library
- [ ] Tests de integración

---

## 🎨 Principios de Diseño

### Composición sobre Herencia
```typescript
// ✅ BIEN: Composición
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <DiaryEntry entry={entry} />
  </CardContent>
</Card>

// ❌ MAL: Herencia forzada
class DiaryCard extends Card { ... }
```

### Separación de Responsabilidades
```typescript
// ✅ BIEN: Cada archivo una responsabilidad
// components/DiaryEntry.tsx - Solo presentación
// hooks/useDiary.ts - Solo lógica de datos
// services/diaryService.ts - Solo llamadas API

// ❌ MAL: Todo mezclado en un componente
```

### Dependency Injection
```typescript
// ✅ BIEN: Inyección de dependencias
const DiaryPage = ({ diaryService = defaultDiaryService }) => {
  const { data } = useQuery(['notes'], diaryService.getNotes);
};

// ❌ MAL: Dependencia hardcoded
const DiaryPage = () => {
  const data = await fetch('http://...'); // Hardcoded
};
```

### Hooks Personalizados para Lógica Reutilizable
```typescript
// ✅ BIEN: Hook reutilizable
const useDiary = (userId: string) => {
  return useQuery(['notes', userId], () => diaryService.getNotes(userId), {
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// ❌ MAL: Lógica duplicada en componentes
```

---

## 📚 Patrones a Implementar

### 1. Container/Presentational Pattern
```typescript
// Container: Lógica de datos
const DiaryContainer = () => {
  const { data, isLoading, error } = useDiary(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <DiaryList notes={data} />;
};

// Presentational: Solo UI
const DiaryList = ({ notes }) => (
  <div>
    {notes.map(note => <DiaryEntry key={note.id} note={note} />)}
  </div>
);
```

### 2. Compound Components
```typescript
const Card = ({ children }) => <div className="card">{children}</div>;
Card.Header = ({ children }) => <div className="card-header">{children}</div>;
Card.Content = ({ children }) => <div className="card-content">{children}</div>;
```

### 3. Render Props (cuando sea necesario)
```typescript
const DataFetcher = ({ url, render }) => {
  const { data, loading } = useFetch(url);
  return render({ data, loading });
};

<DataFetcher url="/notes" render={({ data, loading }) => (
  loading ? <Spinner /> : <List items={data} />
)} />
```

### 4. Error Boundary Pattern
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <DiaryPage />
</ErrorBoundary>
```

---

## 🔒 Validación de Formularios

### Esquema Zod + React Hook Form
```typescript
// schemas/diary.ts
import { z } from 'zod';

export const diaryEntrySchema = z.object({
  note: z.string()
    .min(10, 'La nota debe tener al menos 10 caracteres')
    .max(5000, 'La nota es demasiado larga'),
  mood: z.enum(['happy', 'sad', 'neutral']).optional(),
});

export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;

// components/DiaryForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const DiaryForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<DiaryEntryInput>({
    resolver: zodResolver(diaryEntrySchema),
  });

  const onSubmit = (data: DiaryEntryInput) => {
    // data está validado y tipado
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea {...register('note')} />
      {errors.note && <span>{errors.note.message}</span>}
    </form>
  );
};
```

---

## 🚨 Manejo de Errores

### Error Boundary + Toast Notifications
```typescript
// shared/components/ui/error-boundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
    toast.error('Algo salió mal. Estamos trabajando en ello.');
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// utils/errors.ts
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        // redirect to login
        break;
      case 403:
        toast.error('No tienes permisos para realizar esta acción.');
        break;
      case 404:
        toast.error('Recurso no encontrado.');
        break;
      default:
        toast.error('Error al procesar tu solicitud.');
    }
  }
};
```

---

## 📊 Gestión de Estado

### Zustand para Auth (Global State)
```typescript
// features/auth/store/authStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

### React Query para Server State
```typescript
// hooks/useDiary.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useDiary = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: notes, isLoading, error } = useQuery({
    queryKey: ['notes', userId],
    queryFn: () => diaryService.getNotes(userId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createNote = useMutation({
    mutationFn: (note: NoteInput) => diaryService.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', userId]);
      toast.success('Nota guardada correctamente');
    },
    onError: (error) => {
      handleApiError(error);
    },
  });

  return { notes, isLoading, error, createNote };
};
```

---

## 🎯 Checklist de Refactorización

### Core
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Config centralizada
- [ ] ✅ Cliente API con interceptores
- [ ] ✅ Tipos TypeScript base
- [ ] ✅ Router configurado

### Services
- [ ] ✅ authService
- [ ] ✅ diaryService
- [ ] ✅ recommendationsService
- [ ] ✅ appointmentsService
- [ ] ✅ psychologistService

### Components UI Base
- [ ] ✅ Button
- [ ] ✅ Card
- [ ] ✅ Input
- [ ] ✅ Modal
- [ ] ✅ Toast
- [ ] ✅ Loading
- [ ] ✅ ErrorBoundary

### Hooks
- [ ] ✅ useAuth
- [ ] ✅ useDiary
- [ ] ✅ useRecommendations
- [ ] ✅ useAppointments
- [ ] ✅ useApi
- [ ] ✅ useDebounce
- [ ] ✅ useLocalStorage

### Features
- [ ] ✅ Auth completo
- [ ] ✅ Diary refactorizado
- [ ] ✅ Recommendations refactorizado
- [ ] ✅ Appointments refactorizado
- [ ] ✅ Psychologist refactorizado

### UX/UI
- [ ] ✅ Loading states consistentes
- [ ] ✅ Error handling robusto
- [ ] ✅ Success feedback
- [ ] ✅ Responsive design
- [ ] ✅ Animaciones suaves

### Performance
- [ ] ✅ Lazy loading
- [ ] ✅ Code splitting
- [ ] ✅ Memoization
- [ ] ✅ Optimistic updates

---

## 📖 Documentación

### Componente Documentado
```typescript
/**
 * DiaryEntry Component
 *
 * Muestra una entrada del diario con análisis de sentimientos y emociones.
 *
 * @example
 * ```tsx
 * <DiaryEntry
 *   note={note}
 *   onEdit={() => handleEdit(note.id)}
 *   onDelete={() => handleDelete(note.id)}
 * />
 * ```
 */
interface DiaryEntryProps {
  /** Objeto de nota del diario */
  note: Note;
  /** Callback cuando se edita la nota */
  onEdit?: () => void;
  /** Callback cuando se elimina la nota */
  onDelete?: () => void;
  /** Clase CSS adicional */
  className?: string;
}

export const DiaryEntry: React.FC<DiaryEntryProps> = ({ ... }) => {
  // ...
};
```

---

## 🎓 Beneficios Esperados

1. **Mantenibilidad** ⬆️ 300%
   - Código modular y organizado
   - Fácil de encontrar y modificar
   - Separación clara de responsabilidades

2. **Escalabilidad** ⬆️ 400%
   - Fácil agregar nuevas features
   - Componentes reutilizables
   - Arquitectura desacoplada

3. **Performance** ⬆️ 200%
   - Caching inteligente
   - Lazy loading
   - Optimistic updates

4. **Developer Experience** ⬆️ 500%
   - TypeScript con autocompletado
   - Hooks reutilizables
   - Documentación inline

5. **User Experience** ⬆️ 300%
   - Loading states claros
   - Error handling robusto
   - Feedback inmediato

---

**Siguiente Paso:** Comenzar implementación Fase 1 - Fundamentos

---

**FIN DEL PLAN DE REFACTORIZACIÓN**
