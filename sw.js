self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('rboosh-v11').then(c => c.addAll(['./','./index.html?v=11','./manifest.json'])))
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
});
