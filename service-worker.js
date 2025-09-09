const STATIC_CACHE = 'static-v1';
const CDN_CACHE = 'cdn-v1';
const STATIC_ASSETS = [
  '/',             // penting: agar bisa fallback ke index offline
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.webmanifest'
];

// Install: pre-cache file statis
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: bersihkan cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![STATIC_CACHE, CDN_CACHE].includes(k))
        .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Cache CDN (Font Awesome / cdnjs)
  if (url.hostname.includes('cdnjs.cloudflare.com')) {
    e.respondWith(
      caches.open(CDN_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const fetchPromise = fetch(req).then((resp) => {
          cache.put(req, resp.clone());
          return resp;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Navigasi (HTML): network-first dengan fallback ke cache
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(STATIC_CACHE);
        cache.put('/index.html', fresh.clone());
        return fresh;
      } catch {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match('/index.html')) || Response.error();
      }
    })());
    return;
  }

  // Asset statis lokal: cache-first
  if (STATIC_ASSETS.includes(url.pathname)) {
    e.respondWith(
      caches.match(req).then(cached => cached || fetch(req))
    );
    return;
  }

  // Default: try network, fallback cache
  e.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
