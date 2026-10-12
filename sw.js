// Service worker: guarda la app en el celular para que abra aunque no haya señal.
// Si cambias index.html o config.js, sube el número de versión para forzar la actualización.
const CACHE = 'ruteo-v1';
const ARCHIVOS = ['./', './index.html', './config.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Primero intenta la red (para recibir actualizaciones); si no hay señal en 4 s, usa la copia guardada.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return; // el servidor (Apps Script) no se toca
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const red = await Promise.race([
        fetch(req),
        new Promise((_, mal) => setTimeout(() => mal(new Error('timeout')), 4000))
      ]);
      if (red && red.ok) cache.put(req, red.clone());
      return red;
    } catch (err) {
      return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html'));
    }
  })());
});
