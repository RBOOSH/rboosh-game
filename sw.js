const CACHE_NAME = 'rboosh-v19-2-fix';
const CORE = ['./','./index.html','./manifest.json','./version.json'];

self.addEventListener('install', e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE)));
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE_NAME).map(x=>caches.delete(x)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.pathname.includes('version.json')){
    e.respondWith(
      caches.match('./version.json').then(cached=>{
        const fetched=fetch(e.request,{cache:'no-store'}).then(r=>{
          if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./version.json',cl)); }
          return r;
        }).catch(()=>cached);
        return cached||fetched;
      })
    );
    return;
  }
  if(e.request.mode==='navigate' || url.pathname.endsWith('/') || url.pathname.includes('index.html')){
    e.respondWith(
      caches.match('./index.html').then(cached=>{
        if(cached){
          fetch(e.request).then(r=>{
            if(r.ok) caches.open(CACHE_NAME).then(c=>c.put('./index.html', r.clone()));
          }).catch(()=>{});
          return cached;
        }
        return fetch(e.request).then(r=>{
          if(r.ok) caches.open(CACHE_NAME).then(c=>c.put('./index.html', r.clone()));
          return r;
        }).catch(()=>caches.match('./'));
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=> cached || fetch(e.request).then(r=>{
      if(r.ok) caches.open(CACHE_NAME).then(c=>c.put(e.request, r.clone()));
      return r;
    }).catch(()=>cached))
  );
});
self.addEventListener('message', e=>{ if(e.data && e.data.action==='skipWaiting') self.skipWaiting(); });
