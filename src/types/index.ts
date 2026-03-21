export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  level_order: number;
  total_lessons: number;
  is_free: boolean;
  ielts_min: number;
  ielts_max: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  description: string;
  content?: Record<string, unknown>;
  tags: string[];
  difficulty_level: number;
  estimated_minutes: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  score: number;
  max_score: number;
  completion_date: string | null;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  course_id: string;
  access_type: 'free' | 'subscription' | 'lifetime';
  purchased_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_lesson_date: string | null;
  total_lessons_completed: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  condition_type: 'xp' | 'streak' | 'lessons' | 'course_complete' | 'accuracy';
  condition_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string;
  stripe_payment_id: string | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  created_at: string;
  completed_at: string | null;
}
