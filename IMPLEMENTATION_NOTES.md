# Что было сделано

## 1. Миграция архитектуры
- ❌ **Удалено**: Firebase (несколько разных проектов, confusing)
- ✅ **Заменено на**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)

## 2. Проблемы, которые были в старом коде
- Firebase credentials в репо (разные в разных файлах)
- Жесткий localStorage без облака
- Нет системы платежей
- A0 и A1 отмечены как FREE, но нет реальной монетизации
- HTML файлы без структуры (не scalable)
- Нет типов (чистый JS)

## 3. Новая архитектура
```
Backend: Supabase (PostgreSQL + Edge Functions)
         ↓
Frontend: React + Vite + TypeScript
         ↓
Deployment: Vercel/Railway
```

## 4. Готово
- ✓ Auth система (email/password через Supabase)
- ✓ База данных со структурой A0-C2
- ✓ RLS policies для защиты данных
- ✓ Система подписок и платежей
- ✓ Отслеживание прогресса (XP, streaks)
- ✓ Edge Function для обработки платежей
- ✓ React приложение на Vite
- ✓ Tailwind CSS для дизайна

## 5. Как это работает

### Пользователь регистрируется
1. Заполняет email/password
2. Supabase создаёт auth.users запись
3. Trigger создаёт user_stats + доступ к A0 (бесплатный)
4. Пользователь видит 8 уроков A0

### Пользователь выполняет урок
1. Кликает на карточку урока
2. Видит контент урока
3. Вводит результат (0-100%)
4. System записывает progress + +XP
5. Обновляется статистика (streak, achievements)

### Пользователь хочет A1-C2
1. Видит "заблокировано" на уроках
2. Кликает "купить доступ"
3. Платёж через Edge Function → Stripe
4. System дарует доступ автоматически
5. Уроки становятся разблокированы

## 6. Что нужно добавить

### Срочное (для MVP)
- [ ] Реальный контент в lessons.content (видео, текст, audio)
- [ ] Тестовые задания (quiz, gap-fill, listening)
- [ ] Интеграция Stripe (webhook + checkout)
- [ ] Admin панель для управления контентом

### Средне-срочное
- [ ] Лидерборды
- [ ] Система рангов (Bronze, Silver, Gold)
- [ ] Социальные функции (поделиться результатом)
- [ ] Напоминания по email/push

### Долго-срочное
- [ ] Mobile приложение (React Native)
- [ ] Оффлайн синхронизация
- [ ] Live классы с учителями
- [ ] AI-powered прокторинг

## 7. Файлы для удаления в старом коде
- ❌ firebase_core.js
- ❌ firebase-config.js
- ❌ firestore.rules
- ❌ auth.html, admin.html, lesson-view.html
- ❌ IELTS_A0_Lesson*.html
- ❌ payment_a0.html
- ❌ deepseek_*.html/.js

## 8. Cost структура

### Supabase (generous free tier)
- Auth: unlimited users
- Database: 500MB (free tier)
- Edge Functions: 1M requests/month
- Storage: 1GB (если добавим видео)

### Stripe
- 2.9% + $0.30 за транзакцию
- Возможны скидки при объёме

### Hosting (примерно)
- Vercel: Free (React frontend)
- или Railway: $5-20/месяц (может быть нужен backend)

## 9. Как запустить в продакшене

```bash
# 1. Deploy на Vercel
npm install -g vercel
vercel --prod

# 2. Или Docker
docker build -t ielts .
docker run -p 3000:3000 ielts

# 3. Edge Functions уже развёрнуты в Supabase
```

## 10. API Endpoints

### Edge Function (уже развёрнут)
- `POST /functions/v1/process-payment`
  - Body: `{ userId, courseId, amount }`
  - Returns: `{ success, paymentId }`

### Supabase REST API (автоматический)
- `GET /rest/v1/courses`
- `GET /rest/v1/lessons?course_id=eq.xxx`
- `POST /rest/v1/user_progress` (RLS protected)
- etc.

## Итого
✅ Архитектура готова
✅ Frontend готов
✅ Backend готов
⚠️ Контент нужно добавить
⚠️ Stripe нужно настроить
