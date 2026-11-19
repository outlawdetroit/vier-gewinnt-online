// Version bei jeder Änderung hochzählen -> alte Caches werden gelöscht
const CACHE="vier-gewinnt-v5";
const FILES=["./","./index.html","./manifest.webmanifest","./icon.svg","./icon-180.png"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

// Network-first: immer die neueste Version laden, Cache nur als Offline-Fallback
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET") return;
  const url=new URL(req.url);
  if(url.origin!==location.origin) return; // PeerJS (unpkg) etc. nicht anfassen
  e.respondWith(
    fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>c.put(req,copy));
      return res;
    }).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html")))
  );
});
