/*
  # Create user statistics and gamification tables

  ## Tables
  1. user_stats - XP, streaks, achievements
  2. achievements - Achievement definitions
  3. user_achievements - Track which achievements user has earned

  ## Security
  - RLS enabled
  - Users can only read/update their own stats
*/

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp int DEFAULT 0,
  current_streak int DEFAULT 0,
  longest_streak int DEFAULT 0,
  last_lesson_date timestamptz,
  total_lessons_completed int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  condition_type text CHECK (condition_type IN ('xp', 'streak', 'lessons', 'course_complete', 'accuracy')) DEFAULT 'xp',
  condition_value int,
  rarity text CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  created_at timestamptz DEFAULT now()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- User stats policies
CREATE POLICY "Users can read own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Achievements are readable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User achievements policies
CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_stats_user ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);