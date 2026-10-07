self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('rboosh-v13').then(c => c.addAll(['./','./index.html?v=13','./manifest.json'])))
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
});
