import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useLearningStore } from '../store';
import { supabase } from '../lib/supabase';
import { Course, Lesson } from '../types';
import LessonCard from '../components/LessonCard';
import StatsPanel from '../components/StatsPanel';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { stats } = useLearningStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;
    loadCourses();
  }, [user]);

  const loadCourses = async () => {
    try {
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .order('level_order', { ascending: true });

      if (coursesData) {
        setCourses(coursesData);

        for (const course of coursesData) {
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', course.id)
            .eq('is_published', true)
            .order('lesson_number', { ascending: true });

          if (lessonsData) {
            setLessons((prev) => ({
              ...prev,
              [course.id]: lessonsData,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-emerald-400 rounded-lg flex items-center justify-center font-bold">
              AtoC
            </div>
            <div>
              <h1 className="text-lg font-bold">IELTS from Zero</h1>
              <p className="text-xs text-slate-400">От A0 до C2</p>
            </div>
          </div>
          <div className="flex gap-6 items-center">
            {stats && (
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{stats.total_xp}</div>
                  <div className="text-xs text-slate-400">XP</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-400">{stats.current_streak}</div>
                  <div className="text-xs text-slate-400">дней</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-200 transition-colors"
            >
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <StatsPanel />

        {courses.map((course) => (
          <section key={course.id} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                course.is_free ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
              }`}>
                {course.code.toUpperCase()}
              </span>
              <h2 className="text-2xl font-bold">{course.name}</h2>
              <span className="ml-auto text-sm text-slate-400">
                {lessons[course.id]?.length || 0} уроков
              </span>
            </div>
            <p className="text-slate-400 mb-6">{course.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(lessons[course.id] || []).map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} course={course} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
