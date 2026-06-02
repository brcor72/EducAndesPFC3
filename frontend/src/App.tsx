import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { OnboardingTutorial } from './components/tutorial/OnboardingTutorial';
import { Chatbot } from './components/chatbot/Chatbot';

// Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MetasPage from './pages/MetasPage';
import ForosPage from './pages/ForosPage';
import ForoCursoPage from './pages/ForoCursoPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCoursesPage from './pages/admin/AdminCoursesPage';
import NotFoundPage from './pages/NotFoundPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Cargando…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuthStore();
  if (!initialized) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role?.name !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const loadMe = useAuthStore((s) => s.loadMe);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <BrowserRouter>
      <OnboardingTutorial />
      <Chatbot />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/curso/:courseId" element={<CourseDetailPage />} />
        <Route path="/foros" element={<ForosPage />} />
        <Route path="/foros/:courseId" element={<ForoCursoPage />} />

        {/* Protected */}
        <Route path="/metas" element={<PrivateRoute><MetasPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
        <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/cursos" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
