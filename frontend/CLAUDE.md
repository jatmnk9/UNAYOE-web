# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UNAYOE is a student wellbeing analysis platform with two main components:
- **Frontend**: React + Vite application with Tailwind CSS v4
- **Backend**: FastAPI with NLP/ML capabilities for emotional analysis

The system has two user roles:
- **Estudiante** (Student): Can track daily wellbeing, view recommendations, manage favorites, and monitor attendance/appointments
- **Psicólogo** (Psychologist): Can view student reports, analyze daily tracking data, and manage appointments

## Commands

### Frontend Development
```bash
npm run dev       # Start development server (http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Backend Development
Located in `../backend/`:
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server (port 8000)
python main.py
# or
uvicorn main:app --reload
```

Backend API documentation available at `http://127.0.0.1:8000/docs` when running.

## Architecture

### Frontend Structure

**Authentication & Routing**:
- Authentication is managed via `AuthContext` (src/context/AuthContext.jsx)
- User data persists in `localStorage` with fields: `id`, `email`, `rol`, `nombre`, `access_token`, `refresh_token`
- `PrivateRoute` component in App.jsx handles role-based access control
- Backend API endpoint: `http://127.0.0.1:8000/login`

**Portal Layouts**:
- Both student and psychologist portals use nested routing with `<Outlet />` from react-router-dom
- Portal components (StudentPortal.jsx, PsychologistPortal.jsx) serve as layout wrappers with sidebar navigation
- Each portal has its own base path:
  - Student: `/student/*`
  - Psychologist: `/psychologist/*`

**Student Portal Routes** (`/student/*`):
- `/` - StudentDashboard (index route)
- `/diario` - MiDiarioDeBienestar (daily wellbeing journal)
- `/recomendaciones` - Recomendaciones
- `/favoritos` - MisFavoritos
- `/asistencia` - StudentAttendance
- `/seguimiento-citas` - SeguimientoCitas

**Psychologist Portal Routes** (`/psychologist/*`):
- `/` - PsychologistDashboard (index route)
- `/seguimiento` - SeguimientoDiario (daily tracking overview)
- `/seguimiento/:studentId` - StudentReport (individual student report)
- `/seguimiento-citas` - SeguimientoCitas

### Styling System

**Tailwind CSS v4** is configured with:
- `@tailwindcss/vite` plugin in vite.config.js
- Global styles imported in main.jsx via `global.css`
- Custom CSS variables defined in `:root` for the UNAYOE color palette:
  - `--color-primary: #A3D2CA` (Verde Calma)
  - `--color-accent: #F7B09E` (Coral Optimista)
  - `--color-dark: #333333` (Gris Carbón)
  - `--color-soft-bg: #F0F5F5` (Fondo Suave)

**Custom CSS classes** for common UI patterns are defined in global.css:
- `.portal-layout-container`, `.portal-sidebar`, `.portal-main-content` for portal layouts
- `.sidebar-nav-button`, `.sidebar-nav-button.active` for navigation
- `.login-card`, `.signup-card` for authentication forms
- `.hero-section`, `.features-section` for landing page

### Backend Architecture

**FastAPI Structure** (`../backend/`):
- Main application factory in `main.py` with router registration
- Routers organized by domain: `auth`, `users`, `notes`, `analysis`, `recommendations`
- Services layer: `auth_service`, `users_service`, `notes_service`, `analysis_service`, `recommendations_service`, `nlp_service`
- Supabase integration via `app/db/supabase.py`
- Settings/config in `app/config/settings.py` with Pydantic

**NLP/ML Models**:
- Sentiment: `pysentimiento/robertuito-sentiment-analysis`
- Emotion: `pysentimiento/robertuito-emotion-analysis`
- Fallback: `dccuchile/bert-base-spanish-wwm-cased`

**API Endpoints**:
- `/login` - Authentication
- `/usuarios` - User management
- `/notas` - Student notes/journal entries
- `/analyze`, `/export` - Analysis endpoints
- `/recomendaciones` - Recommendations
- `/likes` - User likes/favorites

## Key Dependencies

### Frontend
- **React 19** with React Router v7
- **Tailwind CSS v4** with Vite plugin
- **lucide-react** for icons
- **recharts** for data visualization
- **axios** for HTTP requests

### Backend
- **FastAPI 0.115.0** with Uvicorn
- **Supabase 2.9.0** for database
- **Transformers 4.46.0** + PyTorch for NLP
- **NLTK**, **scikit-learn** for text analysis
- **pandas**, **numpy** for data processing

## Important Notes

- The frontend expects the backend to run on `http://127.0.0.1:8000`
- User roles are strictly enforced: `"estudiante"` or `"psicologo"`
- CORS is configured to allow `http://localhost:5173` and `http://127.0.0.1:5173`
- Navigation active states use location.pathname matching with specific logic for index routes
- The logo image is `/isotipo.png` (public directory)
