const CACHE='cosmic-hop-gf-v4';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==location.origin)return;
  // Network-first for the game page so updates appear; fall back to cache offline.
  const isPage=e.request.mode==='navigate'||/\.html?$/.test(url.pathname)||url.pathname==='/'||url.pathname.endsWith('/');
  if(isPage){
    e.respondWith(fetch(e.request).then(resp=>{
      if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return resp;
    }).catch(()=>caches.match(e.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(resp=>{
      if(resp&&resp.ok){const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
