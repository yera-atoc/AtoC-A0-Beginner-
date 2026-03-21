import { useLearningStore } from '../store';

export default function StatsPanel() {
  const { stats } = useLearningStore();

  if (!stats) return null;

  const stats_items = [
    { label: 'Всего XP', value: stats.total_xp, color: 'emerald', icon: '💎' },
    { label: 'Текущая серия', value: stats.current_streak, color: 'amber', icon: '🔥' },
    { label: 'Лучшая серия', value: stats.longest_streak, color: 'rose', icon: '🏆' },
    { label: 'Уроков пройдено', value: stats.total_lessons_completed, color: 'blue', icon: '✓' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {stats_items.map((item) => (
        <div key={item.label} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="text-2xl mb-2">{item.icon}</div>
          <div className={`text-2xl font-bold text-${item.color}-400`}>{item.value}</div>
          <div className="text-xs text-slate-400 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
