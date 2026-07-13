/* ¡Vamos! service worker — offline support.
   Strategy:
   - App document: NETWORK-FIRST (fresh Vercel deploys always win when online),
     falling back to the last cached copy when offline.
   - Same-origin static assets (icons, intro video): CACHE-FIRST after first fetch.
   - Cross-origin (Google Fonts, YouTube): untouched — browser handles them.
   Bump V when you want to force old caches to be discarded. */
var V = 'vamos-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(V).then(function (c) { return c.add('/'); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var url = new URL(r.url);

  /* Navigations (including ?tv=1): network-first, cache fallback */
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(function (res) {
        var copy = res.clone();
        caches.open(V).then(function (c) { c.put('/', copy); });
        return res;
      }).catch(function () { return caches.match('/'); })
    );
    return;
  }

  /* Same-origin assets: cache-first, populate on first fetch */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(r).then(function (hit) {
        return hit || fetch(r).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(V).then(function (c) { c.put(r, copy); });
          }
          return res;
        });
      })
    );
  }
});
