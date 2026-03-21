/*
  # Seed courses and initial lessons for A0 level

  ## Data
  - A0 course with 8 lessons
  - Placeholder structure for A1-C2 (locked)
*/

-- Insert courses
INSERT INTO courses (code, name, description, level_order, total_lessons, is_free, ielts_min, ielts_max) VALUES
  ('a0', 'A0 — Beginner', 'Алфавит, базовые глаголы, числа, цвета. Первые шаги в английском.', 1, 8, true, 0.0, 2.0),
  ('a1', 'A1 — Elementary', 'Present Simple, описание людей, хобби, предпочтения.', 2, 12, false, 2.0, 2.5),
  ('a2', 'A2 — Pre-Intermediate', 'Past Simple, путешествия, опыт, планы.', 3, 15, false, 2.5, 3.0),
  ('b1', 'B1 — Intermediate', 'Present Perfect, мнения, дискуссии, описания.', 4, 18, false, 3.0, 4.0),
  ('b2', 'B2 — Upper-Intermediate', 'Future forms, гипотетические ситуации, сложные тексты.', 5, 20, false, 4.0, 5.0),
  ('c1', 'C1 — Advanced', 'Сложные грамматические структуры, нюансы, идиомы.', 6, 20, false, 5.0, 6.0),
  ('c2', 'C2 — Mastery', 'Полное владение, различия в оттенках, культурные контексты.', 7, 15, false, 6.0, 9.0)
ON CONFLICT (code) DO NOTHING;

-- Insert A0 lessons
INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 1, 'Алфавит и звуки', 'Знакомство с английским алфавитом, фонетика, произношение.', ARRAY['vocabulary', 'pronunciation'], 1, 15, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 2, 'Глагол TO BE', 'Спряжение и использование глагола to be в Present Simple.', ARRAY['grammar', 'verb'], 1, 20, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 3, 'Числа, возраст, цены', 'Числа от 0 до 100, как говорить о возрасте и цене.', ARRAY['vocabulary', 'numbers'], 1, 15, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 4, 'Цвета, дни, время', 'Названия цветов, дни недели, времена года, часы.', ARRAY['vocabulary'], 1, 15, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 5, 'Артикли A / AN / THE', 'Правила использования неопределённых и определённого артиклей.', ARRAY['grammar'], 2, 20, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 6, 'Глагол HAVE', 'Спряжение have/has, выражение владения и характеристик.', ARRAY['grammar', 'verb'], 1, 20, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 7, 'Первые диалоги', 'Приветствия, представления, простые вопросы и ответы.', ARRAY['conversation'], 2, 20, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

INSERT INTO lessons (course_id, lesson_number, title, description, tags, difficulty_level, estimated_minutes, is_published)
SELECT id, 8, 'Итоговый тест A0', 'Проверка всех навыков уровня A0. Требуется минимум 70% для прохождения.', ARRAY['test'], 2, 30, true
FROM courses WHERE code = 'a0'
ON CONFLICT DO NOTHING;

-- Insert starter achievements
INSERT INTO achievements (slug, name, description, icon, condition_type, condition_value, rarity) VALUES
  ('first_lesson', 'Первый шаг', 'Пройти первый урок', '🎬', 'lessons', 1, 'common'),
  ('first_five', 'Пятёрка', 'Пройти 5 уроков', '⭐', 'lessons', 5, 'common'),
  ('all_a0', 'Мастер A0', 'Завершить все уроки A0', '👑', 'course_complete', 8, 'epic'),
  ('first_100xp', '100 XP', 'Заработать 100 XP', '💎', 'xp', 100, 'common'),
  ('three_day_streak', 'На волне', 'Три дня подряд', '🔥', 'streak', 3, 'rare')
ON CONFLICT DO NOTHING;