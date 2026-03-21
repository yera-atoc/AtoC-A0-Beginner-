import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store';
import { Lesson, Course, UserProgress } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  course: Course;
}

export default function LessonCard({ lesson, course }: LessonCardProps) {
  const navigate = useNavigate();
  const { progress, hasAccessToCourse } = useLearningStore();
  const [lessonProgress, setLessonProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    const prog = progress.get(lesson.id);
    setLessonProgress(prog || null);
  }, [progress, lesson.id]);

  const hasAccess = course.is_free || hasAccessToCourse(course.id);
  const isDone = lessonProgress?.completed || false;
  const percentage = lessonProgress?.score ? Math.round((lessonProgress.score / lessonProgress.max_score) * 100) : 0;

  const handleClick = () => {
    if (!hasAccess && !isDone) return;
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <button
      onClick={handleClick}
      disabled={!hasAccess && !isDone}
      className={`relative overflow-hidden rounded-lg border transition-all ${
        isDone
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : hasAccess
            ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
            : 'bg-slate-900/30 border-slate-800 cursor-not-allowed opacity-50'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-slate-700/50 px-2 py-1 rounded">
              Урок {String(lesson.lesson_number).padStart(2, '0')}
            </span>
            {isDone && <span className="text-lg">✓</span>}
          </div>
          {!hasAccess && !isDone && <span className="text-lg">🔒</span>}
        </div>

        <h3 className="font-bold text-left mb-3 leading-tight">{lesson.title}</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {lesson.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {isDone && lessonProgress && (
          <div className="mb-3">
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  percentage >= 70 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-400 mt-1">{percentage}%</div>
          </div>
        )}

        <div className="text-xs text-slate-400 text-left">
          {isDone ? '✓ Пройден' : hasAccess ? 'Начать →' : 'Заверши предыдущий'}
        </div>
      </div>
    </button>
  );
}
