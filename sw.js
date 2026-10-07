const CACHE_NAME = 'rboosh-v19-final';
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
  const req = e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);

  if(url.pathname.includes('version.json')){
    e.respondWith(
      caches.match('./version.json').then(cached=>{
        const fetched = fetch(req,{cache:'no-store'}).then(r=>{
          if(r.ok){ const cl=r.clone(); caches.open(CACHE_NAME).then(c=>c.put('./version.json',cl)); }
          return r;
        }).catch(()=>cached);
        return cached || fetched;
      })
    );
    return;
  }

  if(req.mode==='navigate' || req.destination==='document' || url.pathname.endsWith('/') || url.pathname.includes('index.html')){
    e.respondWith(
      caches.match('./index.html').then(cached=>{
        if(cached){
          fetch(req).then(r=>{
            if(r.ok){ caches.open(CACHE_NAME).then(c=>c.put('./index.html', r.clone())); }
          }).catch(()=>{});
          return cached;
        }
        return fetch(req).then(r=>{
          if(r.ok) caches.open(CACHE_NAME).then(c=>c.put('./index.html', r.clone()));
          return r;
        }).catch(()=>caches.match('./'));
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached=> cached || fetch(req).then(r=>{
      if(r.ok) caches.open(CACHE_NAME).then(c=>c.put(req, r.clone()));
      return r;
    }).catch(()=>cached))
  );
});

self.addEventListener('message', e=>{ if(e.data && e.data.action==='skipWaiting') self.skipWaiting(); });
