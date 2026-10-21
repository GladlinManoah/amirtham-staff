const C='staff-v4.3 · 21-10-2026';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','fonts/nst-400.woff2','fonts/nst-700.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='staff-map'&&k!=='staff-kv').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
/* v4.3 — Google Maps திறந்திருக்கும்போது notification-லேயே ✓ கொடுத்தேன் */
const KVN='staff-kv';
const kvU=()=>self.registration.scope+'__batch';
const kvGet=()=>caches.open(KVN).then(c=>c.match(kvU())).then(r=>r?r.json():null).catch(()=>null);
const kvPut=o=>caches.open(KVN).then(c=>o?c.put(kvU(),new Response(JSON.stringify(o),{headers:{'Content-Type':'application/json'}})):c.delete(kvU()));
function nShow(b){const en=b.lang==='en';
 if(b.i>=b.list.length)return self.registration.showNotification(en?'Full route done':'முழு வழி முடிந்தது',{body:en?'Open the app and tap "Full route" for the next houses.':'App-ஐத் திறந்து அடுத்த வீடுகளுக்கு "முழு வழி" தட்டுங்கள்.',tag:'amr-stop',renotify:true,icon:'icon-192.png',badge:'icon-192.png'});
 const s=b.list[b.i];
 return self.registration.showNotification((s.rt!==''&&s.rt!=null?s.rt+' - ':'')+(en&&s.en?s.en:s.n)+'  ('+(b.i+1)+'/'+b.list.length+')',{body:(s.pk||'')+'\n'+(en?'Tap ✓ after delivering':'கொடுத்ததும் ✓ தட்டுங்கள்'),tag:'amr-stop',renotify:true,requireInteraction:true,icon:'icon-192.png',badge:'icon-192.png',
  actions:[{action:'done',title:en?'✓ Delivered':'✓ கொடுத்தேன்'},{action:'next',title:en?'Skip ›':'தவிர் ›'}],data:{i:b.i}});}
function send(){return kvGet().then(b=>{if(!b||!b.pend||!b.pend.length)return;let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
 return fetch(b.api,{method:'POST',body:JSON.stringify({key:b.key,fn:'sync',args:[{now:Date.now(),tz:tz,lang:b.lang,items:b.pend}]})}).then(r=>r.json()).then(j=>{
  if(!j||!j.ok||!j.r||!j.r.res)return;const gone={};j.r.res.forEach(x=>{if(x.ok||!x.retry)gone[x.cid]=1;});
  return kvGet().then(c=>{if(!c)return;c.pend=(c.pend||[]).filter(x=>!gone[x.cid]);return kvPut(c);});}).catch(()=>{});});}
function openApp(){return self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus();}return self.clients.openWindow('./');});}
self.addEventListener('notificationclick',e=>{const a=e.action;e.notification.close();
 e.waitUntil(kvGet().then(b=>{
  if(!a||!b||b.done||!b.list[b.i])return openApp();
  const s=b.list[b.i];
  if(a==='done')b.pend.push({cid:Date.now().toString(36)+Math.random().toString(36).slice(2,8),fn:'stop',at:Date.now(),p:{shift:b.shift,id:s.id,n:s.n,rt:s.rt,a:'done'}});
  b.i++;if(b.i>=b.list.length)b.done=true;
  return kvPut(b).then(()=>nShow(b)).then(()=>send());
 }));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method!=='GET')return;
 if(u.origin===location.origin){e.respondWith(caches.open(C).then(c=>c.match(e.request,{ignoreSearch:true}).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));return;}
 if(/arcgisonline\.com|tile\.openstreetmap\.org|unpkg\.com\/leaflet/.test(u.href)){e.respondWith(caches.open('staff-map').then(c=>c.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r;}))));return;}
 if(/drive\.google\.com\/thumbnail|googleusercontent\.com/.test(u.href)){e.respondWith(caches.open(C+'-x').then(c=>c.match(e.request).then(hit=>{const net=fetch(e.request).then(r=>{if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r;}).catch(()=>hit);return hit||net;})));}
});
