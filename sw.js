/* Service Worker — Alazhar City Delivery
   غيّر VERSION كل ما تنشر تحديث كبير عشان الكاش القديم يتمسح. */
const VERSION = 'v17-2026-09-26-webp-mobile-account';
const SHELL = `shell-${VERSION}`;
const IMGS = `imgs-${VERSION}`;
const SHELL_FILES = ['./', './index.html', './track.html', './rider.html', './store.html', './portal.html', './manifest.json', './manifest-rider.json', './manifest-store.json', './manifest-admin.json', './icons/icon-192.png', './icons/icon-512.png', './images/rider-bike-logo.svg', './images/intro-courier.svg', './images/stores/supermarket.svg', './images/stores/koshary.svg', './images/stores/bakery.svg', './images/stores/pizza.svg', './images/stores/pharmacy.svg'];

// Firebase Cloud Messaging runs in the same worker as the customer's PWA.
try {
  importScripts('https://www.gstatic.com/firebasejs/12.9.0/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/12.9.0/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: 'AIzaSyB1byxcijqYpzdRhoZETKmMGiTPq_y1uS4',
    authDomain: 'alazhar-city-delivery.firebaseapp.com',
    projectId: 'alazhar-city-delivery',
    storageBucket: 'alazhar-city-delivery.firebasestorage.app',
    messagingSenderId: '604870856587',
    appId: '1:604870856587:web:f5af0a344ab4568e04e98e'
  });
  firebase.messaging().onBackgroundMessage(payload => {
    const data = payload?.data || {};
    self.registration.showNotification(data.title || 'الأزهر على عجلة', {
      body: data.body || 'فيه جديد من المتاجر القريبة.',
      icon: './icons/icon-192.png',
      badge: './icons/icon-192.png',
      dir: 'rtl',
      lang: 'ar',
      data: { url: data.url || './index.html' }
    });
  });
} catch (error) {
  console.warn('Firebase push messaging is unavailable in this service worker.', error?.message || error);
}

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => ![SHELL, IMGS].includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || './index.html', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    const existing = clients.find(client => new URL(client.url).origin === self.location.origin);
    if (existing) {
      await existing.focus();
      if (existing.navigate) await existing.navigate(target);
      return;
    }
    if (self.clients.openWindow) await self.clients.openWindow(target);
  }));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // الخطوط وأي دومين تاني: مانتدخلش
  if (url.origin !== location.origin) return;

  // الصور: من الكاش أولًا وتتحدث في الخلفية
  if (/\.(png|jpe?g|webp|svg|gif)$/i.test(url.pathname)) {
    e.respondWith(caches.open(IMGS).then(async cache => {
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  // الصفحة والـ config.js: الشبكة أولًا (عشان الأسعار الجديدة تظهر) ولو فصل النت من الكاش
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(SHELL).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => {
      if (r) return r;
      const p = url.pathname.toLowerCase();
      const fallback = p.endsWith('/rider.html') ? './rider.html' : p.endsWith('/store.html') ? './store.html' : p.endsWith('/portal.html') ? './portal.html' : './index.html';
      return caches.match(fallback);
    }))
  );
});
