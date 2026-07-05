import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import InvoiceForm from './components/InvoiceForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import { getProfile, UserProfile } from './lib/db';
import Onboarding from './components/Onboarding';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  const { currentUser, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadProfile();
    } else {
      setProfile(null);
      setLoadingProfile(false);
    }
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
    } catch (e) {
      console.error(e);
    }
    setLoadingProfile(false);
  };

  if (authLoading || (currentUser && loadingProfile)) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  // Once authenticated, if no profile exists, show the Farm Profile setup screen
  if (currentUser && !profile) {
    return (
      <div className="min-h-screen p-4 md:p-8 bg-gray-50 flex justify-center items-center">
        <Onboarding onComplete={async (p) => {
          try {
            await import('./lib/db').then(m => m.saveProfile(p));
            setProfile(p);
          } catch (e: any) {
            import('react-hot-toast').then(toast => toast.default.error(e.message || "Failed to save profile. Check permissions."));
          }
        }} />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      {currentUser ? (
        <Layout onLogout={logout}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/invoice" element={<ProtectedRoute><InvoiceForm profile={profile!} /></ProtectedRoute>} />
            <Route path="/invoice/:id" element={<ProtectedRoute><InvoiceForm profile={profile!} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<div className="min-h-screen p-4 md:p-8 bg-gray-50 flex justify-center items-center"><LoginSignup /></div>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
