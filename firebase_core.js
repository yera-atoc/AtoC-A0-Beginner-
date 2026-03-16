// ── FIREBASE CORE MODULE ──
// Вставь свой firebaseConfig сюда
const firebaseConfig = {
  apiKey: "AIzaSyBXQMRDe_Is1U0UsjqGKK_eUi03qP5Gg1w",
  authDomain: "atoc-ielts.firebaseapp.com",
  projectId: "atoc-ielts",
  storageBucket: "atoc-ielts.firebasestorage.app",
  messagingSenderId: "944133127448",
  appId: "1:944133127448:web:b5321f1d710507e10c726d",
  measurementId: "G-PRPR69KD8J"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ── AUTH ──
const AUTH = {
  // Вход через Google
  async loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider);
  },

  // Вход через email
  async loginEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  },

  // Регистрация
  async register(email, password, name) {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    // Создаём профиль в Firestore
    await db.collection('users').doc(cred.user.uid).set({
      name, email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      level: 'A0', xp: 0, streak: 0, lastActive: null,
      access: { a0: false }, // доступ к уровням
    });
    return cred;
  },

  // Выход
  logout() { return auth.signOut(); },

  // Текущий пользователь
  get current() { return auth.currentUser; },

  // Слушать изменения авторизации
  onStateChange(cb) { return auth.onAuthStateChanged(cb); }
};

// ── PROGRESS ──
const PROGRESS = {
  // Сохранить результат урока
  async saveLesson(lessonKey, data) {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = db.collection('users').doc(uid);
    await ref.update({
      [`progress.${lessonKey}`]: {
        ...data,
        completedAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      xp: firebase.firestore.FieldValue.increment(data.xpEarned || 0),
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // Загрузить весь прогресс
  async load() {
    const uid = auth.currentUser?.uid;
    if (!uid) return null;
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  },

  // Обновить streak
  async updateStreak() {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const ref = db.collection('users').doc(uid);
    const doc = await ref.get();
    const data = doc.data();
    const today = new Date().toDateString();
    const last = data.lastActive?.toDate?.()?.toDateString?.();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = last === yesterday ? (data.streak || 0) + 1 :
                      last === today ? data.streak :
                      1;
    await ref.update({ streak: newStreak, lastActive: firebase.firestore.FieldValue.serverTimestamp() });
    return newStreak;
  }
};

// ── ACCESS CONTROL ──
const ACCESS = {
  // Проверить доступ к уровню
  async check(level = 'a0') {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    const doc = await db.collection('users').doc(uid).get();
    return doc.data()?.access?.[level] === true;
  },

  // Выдать доступ (только из admin панели или через Cloud Function)
  async grant(uid, level = 'a0') {
    return db.collection('users').doc(uid).update({
      [`access.${level}`]: true,
      accessGrantedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
};

// ── ADAPTIVE QUESTIONS ──
const ADAPTIVE = {
  // Получить слабые темы студента
  async getWeakTopics() {
    const data = await PROGRESS.load();
    if (!data?.progress) return [];
    
    const topicStats = {};
    Object.values(data.progress).forEach(lesson => {
      if (!lesson.topicStats) return;
      Object.entries(lesson.topicStats).forEach(([topic, stats]) => {
        if (!topicStats[topic]) topicStats[topic] = { ok: 0, total: 0 };
        topicStats[topic].ok += stats.ok;
        topicStats[topic].total += stats.total;
      });
    });
    
    return Object.entries(topicStats)
      .filter(([, s]) => s.total >= 3)
      .map(([topic, s]) => ({ topic, pct: Math.round(s.ok / s.total * 100) }))
      .sort((a, b) => a.pct - b.pct) // слабейшие первые
      .slice(0, 3)
      .map(t => t.topic);
  },

  // Приоритизировать вопросы по слабым темам
  prioritize(questions, weakTopics) {
    if (!weakTopics?.length) return questions;
    const weak = questions.filter(q => weakTopics.includes(q.tag));
    const rest = questions.filter(q => !weakTopics.includes(q.tag));
    return [...weak, ...rest];
  }
};

// ── XP REWARDS ──
const REWARDS = {
  LEVELS: [
    { min: 0,    n: 1, title: 'Новичок',           badge: '🌱', unlock: null },
    { min: 50,   n: 2, title: 'Бронзовый ученик',  badge: '🥉', unlock: 'Бонусные карточки' },
    { min: 150,  n: 3, title: 'Серебряный ум',     badge: '🥈', unlock: 'Режим повторения' },
    { min: 300,  n: 4, title: 'Золотой студент',   badge: '🥇', unlock: 'Ранний доступ к A1' },
    { min: 500,  n: 5, title: 'Мастер слов',       badge: '💎', unlock: 'Скидка 20% на A1' },
    { min: 800,  n: 6, title: 'Легенда AtoC',      badge: '👑', unlock: 'Персональный урок' },
  ],

  getLevel(xp) {
    let l = this.LEVELS[0];
    for (const lv of this.LEVELS) if (xp >= lv.min) l = lv;
    return l;
  },

  getNext(xp) {
    return this.LEVELS.find(lv => lv.min > xp) || null;
  }
};

// ── ADMIN / ANALYTICS ──
const ADMIN = {
  // Получить всех студентов (только для учителя)
  async getStudents() {
    const snap = await db.collection('users').orderBy('lastActive', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Статистика по уроку
  async getLessonStats(lessonKey) {
    const snap = await db.collection('users').get();
    const results = snap.docs
      .map(doc => doc.data().progress?.[lessonKey])
      .filter(Boolean);
    
    if (!results.length) return null;
    const avg = Math.round(results.reduce((s, r) => s + r.pct, 0) / results.length);
    return { count: results.length, avgScore: avg };
  },

  // Выдать доступ по email
  async grantByEmail(email, level = 'a0') {
    const snap = await db.collection('users').where('email', '==', email).get();
    if (snap.empty) throw new Error('Пользователь не найден');
    const uid = snap.docs[0].id;
    return ACCESS.grant(uid, level);
  }
};

// Экспорт
window.ATOC = { AUTH, PROGRESS, ACCESS, ADAPTIVE, REWARDS, ADMIN, db, auth };
