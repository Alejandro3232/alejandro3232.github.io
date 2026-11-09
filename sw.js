const CACHE = 'pprog-viewer-v14-share-v5-20261110-zoom';
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./apple-touch-icon.png", "./apple-touch-icon-precomposed.png", "./apple-touch-icon-180x180.png", "./icon-152.png", "./icon-167.png", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./favicon-32.png", "./favicon.ico"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('pprog-viewer-') && k !== CACHE).map(k => caches.delete(k)))), self.clients.claim()]));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !ASSETS.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(response => {
      if (response.ok) {
        const copy=response.clone();
        caches.open(CACHE).then(cache => cache.put('./',copy)).catch(()=>{});
      }
      return response;
    }).catch(async()=> (await caches.match('./')) || (await caches.match('./index.html'))));
  } else {
    event.respondWith(caches.match(req, {ignoreSearch: true}).then(cached => cached || fetch(req)));
  }
});