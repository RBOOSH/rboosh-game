const CACHE_NAME = 'rboosh-v16';
const FILES = ['./','./index.html','./manifest.json','./version.json'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(FILES))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.method!=='GET') return;
  // version.json لا تحفظه - جيبو دايما جديد
  if(e.request.url.includes('version.json')){
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=>caches.match('./version.json')));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{ if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(ca=>ca.put(e.request,cl)); } return r; }).catch(()=>e.request.destination==='document'?caches.match('./index.html'):null)));
});
self.addEventListener('message', e=>{ if(e.data.action==='skipWaiting') self.skipWaiting(); });
