/* LUCY'S LODGE service worker — offline after first visit.
   Precache the app shell; runtime-cache everything else that loads
   successfully (fonts, MediaPipe model files) so the red room works
   in a park with no signal. Bump VERSION on any change. */
const VERSION = 'lodge-v5.0.0';
const FILES = ['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      if (hit) return hit;
      return fetch(e.request).then(resp => {
        if (resp && (resp.ok || resp.type === 'opaque')) {
          const copy = resp.clone();
          caches.open(VERSION).then(c => c.put(e.request, copy)).catch(()=>{});
        }
        return resp;
      });
    })
  );
});
