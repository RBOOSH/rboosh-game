const CACHE_NAME = 'rboosh-v18-nopull';
const CORE_FILES = ['./','./index.html','./manifest.json','./version.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  const url = new URL(e.request.url);
  if(url.pathname.includes('version.json')){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{ if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./version.json',cl)); } return r; }).catch(()=>caches.match('./version.json')));
    return;
  }
  if(e.request.mode==='navigate' || e.request.destination==='document' || url.pathname.endsWith('index.html') || url.pathname.endsWith('/') || url.search.includes('v=')){
    e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./index.html',cl)); } return r; }).catch(()=>caches.match('./index.html').then(x=>x||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=> cached || fetch(e.request).then(r=>{ if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request,cl)); } return r; }).catch(()=>cached)));
});

self.addEventListener('message', e=>{ if(e.data.action==='skipWaiting') self.skipWaiting(); });
