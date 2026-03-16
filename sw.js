const CACHE = 'atoc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/payment_a0.html',
  '/IELTS_A0_Lesson1.html',
  '/IELTS_A0_Lesson2.html',
  '/IELTS_A0_Lesson3.html',
  '/IELTS_A0_Lesson4.html',
  '/IELTS_A0_Lesson5.html',
  '/IELTS_A0_Lesson6.html',
  '/IELTS_A0_Lesson7.html',
  '/IELTS_A0_Lesson8.html',
];

// Установка — кешируем всё
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация — удаляем старые кеши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — сначала кеш, потом сеть
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
