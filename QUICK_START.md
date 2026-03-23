# Быстрый старт

## Локальная разработка

```bash
npm install
npm run dev
```

Откроется http://localhost:5173

## Что тестировать

### 1. Регистрация
- Перейти на страницу (должна быть форма входа)
- Нажать "Зарегистрироваться"
- Заполнить email/password
- Система автоматически создаст:
  - Профиль пользователя
  - Статистику (0 XP, 0 streak)
  - Доступ к A0 (бесплатный курс)

### 2. Главная панель (Dashboard)
- Должны видеться все 7 уровней (A0, A1, A2, B1, B2, C1, C2)
- A0 должен быть открыт (можно кликать на уроки)
- A1-C2 должны быть закрыты (видно замочки 🔒)
- В header: XP и текущий streak

### 3. Выполнение урока (A0)
- Клик на карточку урока
- Страница с названием, описанием, сложностью
- Slider для установки результата (0-100%)
- Кнопка "Завершить урок"
- После завершения — редирект на главную

### 4. Отслеживание прогресса
- После завершения урока:
  - Карточка должна показать ✓ и процент
  - Должно добавиться XP
  - Counter "Пройдено: X/8" обновится
  - Progress bar обновится

## Что происходит "под капотом"

```
Регистрация → Supabase Auth
            → Trigger создаёт user_stats
            → Trigger дарует доступ к A0

Выполнение урока → Form обновляет user_progress
                → System добавляет XP в user_stats
                → Обновляется current_streak

Покупка A1 → Edge Function обрабатывает платёж
          → Система дарует access к course
          → Уроки A1 разблокируются
```

## Если что-то сломалось

### "Белая страница"
- Откройте DevTools (F12)
- Посмотрите на ошибки в Console
- Вероятные причины:
  - VITE_SUPABASE_URL не задан
  - VITE_SUPABASE_ANON_KEY не задан
  - Сеть недоступна

### Не работает регистрация
- Проверьте .env файл (переменные правильные?)
- Проверьте что Supabase project существует
- Посмотрите в DevTools → Network

### Не загружаются уроки
- Проверьте в Supabase console:
  - Есть ли таблица `lessons`?
  - Есть ли уроки в таблице?
  - RLS policies не блокируют чтение?

## Prod deployment

```bash
# Vercel (фронтенд)
vercel --prod

# Railway (если нужен бэк)
railway up

# или Docker
docker build -t ielts .
docker run -p 3000:3000 ielts
```

## Переменные окружения (.env)

Должны быть в `.env` файле:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

На Vercel/Railway добавьте в Environment Variables той же платформы.

## Структура

```
/src
  /pages          - страницы (Auth, Dashboard, Lesson)
  /components     - компоненты (LessonCard, Stats)
  /services       - бизнес логика (платежи, прогресс)
  /store          - Zustand state (auth, learning)
  /types          - TypeScript интерфейсы
  /lib            - утилиты (Supabase client)

/supabase
  /functions      - Edge Functions
  /migrations     - SQL миграции (DDL + RLS)
```

## Следующие шаги для production

1. ✅ Auth работает
2. ✅ Database готова
3. ✅ Frontend готов
4. ⏳ Нужно: Добавить контент (видео, аудио, текст в lessons.content)
5. ⏳ Нужно: Интегрировать Stripe для платежей
6. ⏳ Нужно: Admin панель для управления контентом

## Support

Все вопросы → посмотрите IMPLEMENTATION_NOTES.md
