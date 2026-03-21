import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore, useLearningStore } from '../store';
import { Lesson, Course } from '../types';
import { recordLessonProgress } from '../services/progress';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addProgress } = useLearningStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!lessonId) return;
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .maybeSingle();

      if (lessonError) throw lessonError;
      if (!lessonData) throw new Error('Lesson not found');

      setLesson(lessonData);

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', lessonData.course_id)
        .maybeSingle();

      if (courseError) throw courseError;
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !lesson) return;

    try {
      const progress = await recordLessonProgress(user.id, lesson.id, score, 100);
      addProgress(progress);
      setSubmitted(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Failed to record progress:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Загрузка...</div>;
  }

  if (!lesson || !course) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Урок не найден</div>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{lesson.title}</h1>
            <p className="text-sm text-slate-400">{course.code.toUpperCase()} • Урок {lesson.lesson_number}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            ← Назад
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {!submitted ? (
          <div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
              <p className="text-slate-300 mb-6">{lesson.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-700/50 p-4 rounded">
                  <div className="text-sm text-slate-400">Сложность</div>
                  <div className="text-2xl font-bold">{'⭐'.repeat(lesson.difficulty_level)}</div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded">
                  <div className="text-sm text-slate-400">Время</div>
                  <div className="text-2xl font-bold">{lesson.estimated_minutes} мин</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {lesson.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium mb-3">Ваш результат (0-100)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full mb-3"
                />
                <div className="text-center">
                  <div className="text-4xl font-bold text-emerald-400">{score}%</div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg font-bold text-lg transition-all"
              >
                Завершить урок
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Поздравляем!</h2>
            <p className="text-slate-300 mb-6">Урок успешно завершен. Перенаправление на главную...</p>
          </div>
        )}
      </div>
    </main>
  );
}
