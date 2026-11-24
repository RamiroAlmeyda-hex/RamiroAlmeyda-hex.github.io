const C='rinde-v21';
const F=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=='rinde-share').map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;
  // Compartir → Rinde: guarda el comprobante y abre la app para anotarlo.
  if(r.method==='POST' && new URL(r.url).pathname.endsWith('/compartir')){
    e.respondWith((async()=>{
      try{
        const fd=await r.formData(), f=fd.get('comprobante');
        const t=['title','text','url'].map(k=>fd.get(k)).filter(v=>typeof v==='string'&&v).join('\n');
        const c=await caches.open('rinde-share');
        if(f && typeof f!=='string' && f.size) await c.put('/__compartido', new Response(f,{headers:{'content-type':f.type||'application/octet-stream','x-name':encodeURIComponent(f.name||'comprobante')}}));
        if(t) await c.put('/__compartido-texto', new Response(t));
      }catch(err){}
      return Response.redirect(new URL('./?compartido=1', self.registration.scope).href, 303);
    })());
    return;
  }
  if(r.method!=='GET')return;
  // La app (HTML) siempre se busca primero en internet: así cada cambio llega al toque.
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('index.html',cp)).catch(()=>{});return res;})
      .catch(()=>caches.match('index.html')));
    return;
  }
  // Íconos y demás: rápido desde el celular, y se actualizan en segundo plano.
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp)).catch(()=>{});return res;}).catch(()=>hit);
    return hit||net;
  }));
});
