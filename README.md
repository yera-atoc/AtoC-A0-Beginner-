# IELTS from Zero

Платформа для изучения английского языка от A0 до C2.

## Архитектура

### Backend
- **Supabase** — БД, Auth, Edge Functions
- **PostgreSQL** — хранилище данных
- **RLS** — защита данных на уровне БД

### Frontend
- **React 18** + TypeScript
- **Vite** — сборка и dev server
- **React Router** — навигация
- **Zustand** — state management
- **Tailwind CSS** — стили

## Структура БД

### Таблицы
1. **courses** — уровни (A0-C2)
2. **lessons** — уроки с контентом
3. **user_progress** — результаты пользователей
4. **user_subscriptions** — доступ к курсам
5. **user_stats** — XP, streaks, достижения
6. **achievements** — награды
7. **payments** — история платежей

### Безопасность
- Все таблицы имеют RLS policies
- Пользователи видят только свои данные
- A0 курс бесплатный для всех
- Остальные курсы через платежи

## Установка

```bash
npm install
npm run dev      # development
npm run build    # production
```

## Функциональность

### Пользователь
- ✓ Регистрация/вход
- ✓ Выполнение уроков с оценками
- ✓ Отслеживание прогресса (XP, streak, stats)
- ✓ Иерархия доступа к урокам
- ✓ Система достижений

### Монетизация
- ✓ Система подписок в БД
- ✓ Edge Function для обработки платежей
- ✓ История платежей
- ✓ Автоматический доступ после оплаты

### Контент
- ✓ 8 уроков A0 (готовы)
- ⚠️ A1-C2 структура готова, контент нужно добавить

## Environment Variables

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_SUPABASE_ANON_KEY=...
```

## Следующие шаги

1. **Добавить содержимое уроков**
   - Видео, аудио, тексты
   - Задания и тесты
   - Интерактивные элементы

2. **Интегрировать Stripe**
   - Webhook для платежей
   - Automatization доступа

3. **Усилить gamification**
   - Лидерборды
   - Система рангов
   - Социальные функции

4. **Mobile app**
   - React Native версия
   - Оффлайн режим

## Компоненты

### Pages
- `Auth.tsx` — вход/регистрация
- `Dashboard.tsx` — главная с курсами
- `LessonPage.tsx` — страница урока

### Components
- `LessonCard.tsx` — карточка урока
- `StatsPanel.tsx` — статистика пользователя

### Services
- `payment.ts` — обработка платежей
- `progress.ts` — отслеживание прогресса
- `supabase.ts` — клиент БД
