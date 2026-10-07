const CACHE_NAME = 'rboosh-v15-offline';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('حفظ OFFLINE...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.filter(k => k!== CACHE_NAME).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method!== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(!res || res.status!== 200) return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => {
        if(e.request.destination === 'document'){
          return caches.match('./index.html');
        }
      });
    })
  );
});

self.addEventListener('message', e => {
  if(e.data && e.data.action === 'skipWaiting') self.skipWaiting();
});
