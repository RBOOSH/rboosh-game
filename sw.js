self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open('rboosh-v7').then(c => c.addAll(['./','./index.html?v=7','./manifest.json'])))
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => { if(k!=='rboosh-v7') return caches.delete(k) }))));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
});
