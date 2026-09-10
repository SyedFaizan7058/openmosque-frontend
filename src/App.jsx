import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Pages
import Home from './pages/Home';
import Directory from './pages/Directory';
import MosqueDetail from './pages/MosqueDetail';
import AddMosque from './pages/AddMosque';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './components/account/Favorites';
import ProfilePage from './pages/ProfilePage';
import About from './pages/About';
import Contact from './pages/Contact';
import Events from './pages/Events';
import Announcements from './pages/Announcements';
import Jumah from './pages/Jumah';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './components/admin/Dashboard';
import NotFound from './pages/NotFound';

import './App.css';

function ProtectedRoute({ children, allowedRoles, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const validRoles = allowedRoles || (role ? (role === 'SUPER_ADMIN' ? ['SUPER_ADMIN'] : [role, 'SUPER_ADMIN']) : null);
  if (validRoles && !validRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Core Discovery */}
        <Route path="/" element={<Home />} />
        <Route path="/mosques" element={<Directory />} />
        <Route path="/mosques/:id" element={<MosqueDetail />} />
        <Route path="/mosques/add" element={<AddMosque />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Account */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Informational & Community Pages (Zero broken links) */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/jumah" element={<Jumah />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Administration & Moderation */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['MODERATOR', 'SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />
        <Route path="/moderator" element={<ProtectedRoute allowedRoles={['MODERATOR', 'SUPER_ADMIN']}><Dashboard /></ProtectedRoute>} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <LocationProvider>
                <AppRoutes />
              </LocationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
