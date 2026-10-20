const C='staff-v4 · 20-10-2026';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','fonts/nst-400.woff2','fonts/nst-700.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method!=='GET')return;
 if(u.origin===location.origin){e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true}).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));return;}
 if(/drive\.google\.com\/thumbnail|googleusercontent\.com/.test(u.href)){e.respondWith(caches.open(C+'-x').then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));}
});
