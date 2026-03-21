import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAuthStore, useLearningStore } from './store';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LessonPage from './pages/LessonPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Загрузка...</div>;
  if (!user) return <Navigate to="/auth" />;

  return <>{children}</>;
}

export default function App() {
  const { setUser, setLoading, user } = useAuthStore();
  const { setStats, addSubscription, addProgress } = useLearningStore();

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        await loadUserData(session.user.id);
      }

      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        await loadUserData(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [setUser, setLoading]);

  const loadUserData = async (userId: string) => {
    try {
      const [statsRes, subsRes, progRes] = await Promise.all([
        supabase.from('user_stats').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_subscriptions').select('*').eq('user_id', userId),
        supabase.from('user_progress').select('*').eq('user_id', userId),
      ]);

      if (statsRes.data) setStats(statsRes.data);

      subsRes.data?.forEach((sub) => addSubscription(sub));
      progRes.data?.forEach((prog) => addProgress(prog));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}
