import { supabase } from '../lib/supabase';
import { UserProgress } from '../types';

export async function recordLessonProgress(
  userId: string,
  lessonId: string,
  score: number,
  maxScore: number = 100
) {
  const percentage = Math.round((score / maxScore) * 100);
  const xpEarned = Math.min(percentage, 100);

  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      score,
      max_score: maxScore,
      completion_date: new Date().toISOString(),
      xp_earned: xpEarned,
    })
    .select();

  if (error) throw error;

  await updateUserStats(userId, xpEarned);

  return data?.[0];
}

export async function updateUserStats(userId: string, xpGained: number = 0) {
  const { data: existing } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from('user_stats').insert({
      user_id: userId,
      total_xp: xpGained,
      total_lessons_completed: 1,
      last_lesson_date: new Date().toISOString(),
    });
  } else {
    const today = new Date().toDateString();
    const lastDate = existing.last_lesson_date
      ? new Date(existing.last_lesson_date).toDateString()
      : null;

    let newStreak = existing.current_streak || 0;
    if (lastDate !== today) {
      newStreak = lastDate === new Date(Date.now() - 86400000).toDateString() ? newStreak + 1 : 1;
    }

    const longestStreak = Math.max(newStreak, existing.longest_streak || 0);

    await supabase
      .from('user_stats')
      .update({
        total_xp: existing.total_xp + xpGained,
        current_streak: newStreak,
        longest_streak: longestStreak,
        total_lessons_completed: existing.total_lessons_completed + 1,
        last_lesson_date: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }
}

export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<UserProgress | null> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
