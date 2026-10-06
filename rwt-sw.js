const CACHE_NAME = 'rwt-ato-tracker-v1';
const PREFIX = 'rwt-ato-tracker-';
const BASE = '/RemoteWorkTracker/';
const assets = [BASE, BASE+'index.html', BASE+'rwt-manifest.webmanifest', BASE+'icons/rwt-icon-192.png', BASE+'icons/rwt-icon-512.png', BASE+'icons/rwt-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith(PREFIX) && k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin + BASE)) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match(BASE+'index.html') : undefined)))
  );
});
