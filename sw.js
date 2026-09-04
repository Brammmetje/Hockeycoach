// Hockeycoach servicewerker: app werkt offline, nieuwe versie komt vanzelf mee zodra er bereik is.
const CACHE='hockeycoach-app';
const ROOT=self.registration.scope;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll([ROOT,'icon.png','icon-512.png','manifest.webmanifest']).catch(()=>c.add(ROOT).catch(()=>{}))))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(req.mode==='navigate'||url.origin===location.origin&&(url.pathname.endsWith('/')||url.pathname.endsWith('index.html'))){
    // eerst het netwerk (altijd de nieuwste versie), anders de bewaarde kopie
    e.respondWith(fetch(req.url,{cache:'no-cache'}).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(ROOT,r.clone()));return r}).catch(()=>caches.match(ROOT)));
    return;
  }
  if(url.origin===location.origin&&/icon(-512)?\.png$|manifest\.webmanifest$/.test(url.pathname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r})));return;
  }
  if(url.hostname.includes('fonts.googleapis.com')||url.hostname.includes('fonts.gstatic.com')){
    // lettertypes: bewaarde kopie direct, en op de achtergrond verversen
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(req);const net=fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r}).catch(()=>hit);return hit||net}));
  }
});
