const CACHE_NAME = 'supercheck-cache-v5'; // 👈 SUBIMOS VERSION

const FILES_TO_CACHE = [
  './',
  './index.html',
  './SuperCheck.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// INSTALACIÓN
self.addEventListener('install', event => {
  console.log('✅ SW v4 instalado - NUEVO EFECTO NIEVE');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting(); // Fuerza actualización inmediata
});

// ACTIVACIÓN
self.addEventListener('activate', event => {
  console.log('✅ SW v4 activado');

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🗑️ Borrando caché viejo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// FETCH - Priorizar red para HTML (evita bugs visuales)
self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;

  // ✅ PARA HTML: SIEMPRE BUSCAR EN RED PRIMERO
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ✅ PARA OTROS ARCHIVOS: CACHE FIRST
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );

});
