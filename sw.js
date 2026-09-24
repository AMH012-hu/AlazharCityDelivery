/* Service Worker — Alazhar City Delivery
   غيّر VERSION كل ما تنشر تحديث كبير عشان الكاش القديم يتمسح. */
const VERSION = 'v13-2026-09-24-multi-app-onboarding-catalog';
const SHELL = `shell-${VERSION}`;
const IMGS = `imgs-${VERSION}`;
const SHELL_FILES = ['./', './index.html', './track.html', './rider.html', './store.html', './portal.html', './manifest.json', './manifest-rider.json', './manifest-store.json', './manifest-admin.json', './icons/icon-192.png', './icons/icon-512.png'];

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
