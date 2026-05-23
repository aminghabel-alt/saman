// ══════════════════════════════════════════════
//  Routine Hub — Service Worker
//  Cache-first strategy for full offline support
// ══════════════════════════════════════════════

const CACHE_NAME = 'saman-v3';

const ASSETS = [
  './routine_builder.html',
  './routine_builder.css',
  './routine_builder.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── Install: cache all assets ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  // Force new SW to activate immediately (no waiting for old tabs to close)
  self.skipWaiting();
});

// ── Activate: delete old caches ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── Push Notification ──
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'سامان 🏋️';
  const options = {
    body: data.body || 'وقت روتین روزانه‌ته!',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    dir: 'rtl',
    lang: 'fa',
    vibrate: [200, 100, 200],
    data: { url: data.url || './routine_builder.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// ── Notification click — open app ──
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('routine_builder') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('./routine_builder.html');
    })
  );
});

// ── Daily alarm via setTimeout in SW (fallback for no push server) ──
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { hour, minute, message } = event.data;
    scheduleDaily(hour, minute, message);
  }
});

function scheduleDaily(hour, minute, message) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  const delay = next - now;

  setTimeout(() => {
    self.registration.showNotification('سامان 🏋️', {
      body: message || 'وقت روتین روزانه‌ته!',
      icon: './icons/icon-192.png',
      dir: 'rtl',
      lang: 'fa',
      vibrate: [200, 100, 200]
    });
    // Re-schedule for next day
    scheduleDaily(hour, minute, message);
  }, delay);
}

// ── Fetch: cache-first, fall back to network ──
self.addEventListener('fetch', event => {
  // Only handle GET requests over http/https
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      // Not in cache — fetch from network and cache it
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
        return response;
      });
    })
  );
});
