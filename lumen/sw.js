const C='lumen-v9';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('lumen-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.pathname.includes('/__m/')) return; // fotos del celular: las sirve la app
  if(r.mode==='navigate'){ e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./',cp));return res;}).catch(()=>caches.match('./'))); return; }
  if(u.origin===location.origin){ e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));} return res; }))); }
});
