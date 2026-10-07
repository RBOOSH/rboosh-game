self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('rboosh-v14').then(c => c.addAll(['./','./index.html?v=14','./manifest.json'])))
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!=='rboosh-v14').map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
});
