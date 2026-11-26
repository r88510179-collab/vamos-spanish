/* ¡Vamos! service worker — offline support.
   Strategy:
   - App document: NETWORK-FIRST (fresh Vercel deploys always win when online),
     falling back to the last cached copy when offline.
   - Same-origin static assets (icons, intro video): CACHE-FIRST after first fetch.
   - Cross-origin (Google Fonts, YouTube): untouched — browser handles them.
   Bump V when you want to force old caches to be discarded (do this whenever an icon/image/video
   is replaced under the SAME file name, or phones keep showing the old one). */
var V = 'vamos-v3';
/* ¡Vamos! Aventuras files. AV must match the ?v= used in index.html; bump both when an adventure file changes. */
var AV = '3';
var ADV_FILES = ['adventure.css', 'art.js', 'art-items.js', 'theme.js', 'games.js', 'world.js', 'settings.js'].map(function (f) { return '/adventure/' + f + '?v=' + AV; });
var ADV_ASSETS = ["/adventure/assets/cast/luna-celebrate.svg", "/adventure/assets/cast/luna-idle.svg", "/adventure/assets/cast/luna-point.svg", "/adventure/assets/cast/luna-speak.svg", "/adventure/assets/cast/luna-think.svg", "/adventure/assets/cast/luna-wave.svg", "/adventure/assets/cast/mara-celebrate.svg", "/adventure/assets/cast/mara-idle.svg", "/adventure/assets/cast/mara-point.svg", "/adventure/assets/cast/mara-speak.svg", "/adventure/assets/cast/mara-think.svg", "/adventure/assets/cast/mara-wave.svg", "/adventure/assets/cast/nube-celebrate.svg", "/adventure/assets/cast/nube-idle.svg", "/adventure/assets/cast/nube-point.svg", "/adventure/assets/cast/nube-speak.svg", "/adventure/assets/cast/nube-think.svg", "/adventure/assets/cast/nube-wave.svg", "/adventure/assets/cast/pipo-celebrate.svg", "/adventure/assets/cast/pipo-idle.svg", "/adventure/assets/cast/pipo-point.svg", "/adventure/assets/cast/pipo-speak.svg", "/adventure/assets/cast/pipo-think.svg", "/adventure/assets/cast/pipo-wave.svg", "/adventure/assets/cast/sol-celebrate.svg", "/adventure/assets/cast/sol-idle.svg", "/adventure/assets/cast/sol-point.svg", "/adventure/assets/cast/sol-speak.svg", "/adventure/assets/cast/sol-think.svg", "/adventure/assets/cast/sol-wave.svg", "/adventure/assets/cast/sticker-luna.svg", "/adventure/assets/cast/sticker-mara.svg", "/adventure/assets/cast/sticker-nube.svg", "/adventure/assets/cast/sticker-pipo.svg", "/adventure/assets/cast/sticker-sol.svg", "/adventure/assets/cast/sticker-tomas.svg", "/adventure/assets/cast/tomas-celebrate.svg", "/adventure/assets/cast/tomas-idle.svg", "/adventure/assets/cast/tomas-point.svg", "/adventure/assets/cast/tomas-speak.svg", "/adventure/assets/cast/tomas-think.svg", "/adventure/assets/cast/tomas-wave.svg", "/adventure/assets/brand/app-icon.svg", "/adventure/assets/brand/splash.svg", "/adventure/assets/obj/dog.svg", "/adventure/assets/bg/backyard.svg", "/adventure/assets/bg/garage.svg", "/adventure/assets/bg/garden.svg", "/adventure/assets/bg/kitchen.svg", "/adventure/assets/bg/neighborhood.svg", "/adventure/assets/bg/park.svg", "/adventure/assets/bg/playroom.svg", "/adventure/assets/bg/school.svg", "/adventure/assets/bg/soccer.svg", "/adventure/assets/icons/audio.svg", "/adventure/assets/icons/back.svg", "/adventure/assets/icons/garage.svg", "/adventure/assets/icons/garden.svg", "/adventure/assets/icons/home.svg", "/adventure/assets/icons/kitchen.svg", "/adventure/assets/icons/park.svg", "/adventure/assets/icons/play.svg", "/adventure/assets/icons/playroom.svg", "/adventure/assets/icons/school.svg", "/adventure/assets/icons/soccer.svg", "/adventure/assets/obj/apple.svg", "/adventure/assets/obj/balloon-blue.svg", "/adventure/assets/obj/balloon-green.svg", "/adventure/assets/obj/balloon-orange.svg", "/adventure/assets/obj/balloon-purple.svg", "/adventure/assets/obj/balloon-red.svg", "/adventure/assets/obj/balloon-yellow.svg", "/adventure/assets/obj/banana.svg", "/adventure/assets/obj/book.svg", "/adventure/assets/obj/car.svg", "/adventure/assets/obj/carrot.svg", "/adventure/assets/obj/cat.svg", "/adventure/assets/obj/circle-blue.svg", "/adventure/assets/obj/circle-green.svg", "/adventure/assets/obj/circle-orange.svg", "/adventure/assets/obj/circle-purple.svg", "/adventure/assets/obj/circle-red.svg", "/adventure/assets/obj/circle-yellow.svg", "/adventure/assets/obj/duck.svg", "/adventure/assets/obj/flower.svg", "/adventure/assets/obj/grapes.svg", "/adventure/assets/obj/heart.svg", "/adventure/assets/obj/orange.svg", "/adventure/assets/obj/paw.svg", "/adventure/assets/obj/rainbow.svg", "/adventure/assets/obj/soccer-ball.svg", "/adventure/assets/obj/square-blue.svg", "/adventure/assets/obj/square-green.svg", "/adventure/assets/obj/square-orange.svg", "/adventure/assets/obj/square-purple.svg", "/adventure/assets/obj/square-red.svg", "/adventure/assets/obj/square-yellow.svg", "/adventure/assets/obj/star.svg", "/adventure/assets/obj/strawberry.svg", "/adventure/assets/obj/sun.svg", "/adventure/assets/obj/triangle-blue.svg", "/adventure/assets/obj/triangle-green.svg", "/adventure/assets/obj/triangle-orange.svg", "/adventure/assets/obj/triangle-purple.svg", "/adventure/assets/obj/triangle-red.svg", "/adventure/assets/obj/triangle-yellow.svg", "/adventure/assets/obj/xylophone.svg", "/adventure/assets/rewards/apple.svg", "/adventure/assets/rewards/flower.svg", "/adventure/assets/rewards/heart.svg", "/adventure/assets/rewards/paw.svg", "/adventure/assets/rewards/rainbow.svg", "/adventure/assets/rewards/soccer-ball.svg", "/adventure/assets/rewards/star.svg", "/adventure/assets/rewards/sun.svg"];
/* A navigation waits this long for the network before it uses the saved copy (e.g. a hotspot with no signal). */
var NAV_TIMEOUT = 5000;

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(V).then(function (c) {
      // The app shell must cache; each adventure file is best-effort so one missing file never blocks install.
      return c.add('/').then(function () {
        return Promise.all(ADV_FILES.concat(ADV_ASSETS).map(function (u) { return c.add(u).catch(function () {}); }));
      });
    }).then(function () { return self.skipWaiting(); })
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

  /* Navigations (including ?tv=1): network-first, cache fallback.
     If the network has not answered after NAV_TIMEOUT, the saved copy is used. The network request
     keeps going and still refreshes the saved copy for next time. */
  if (r.mode === 'navigate') {
    var net = fetch(r).then(function (res) {
      if (res && res.ok) { // never let an error page replace the saved app
        var copy = res.clone();
        caches.open(V).then(function (c) { c.put('/', copy); });
      }
      return res;
    });
    var stalled = new Promise(function (resolve) {
      setTimeout(function () {
        caches.match('/').then(function (hit) { if (hit) resolve(hit); }); // nothing saved yet: keep waiting
      }, NAV_TIMEOUT);
    });
    e.respondWith(
      Promise.race([net, stalled]).catch(function () { return caches.match('/'); })
    );
    return;
  }

  /* Video/audio range requests (iPhone always uses these for <video>) go straight to the network:
     the Cache API cannot store partial (206) responses and iOS needs real 206s to play video. */
  if (r.headers.has('range')) return;

  /* Private character pack folder (git-ignored, only in private builds): always from the network,
     never stored by the service worker. Pack images imported in Parent Settings live in IndexedDB instead. */
  if (url.origin === location.origin && url.pathname.indexOf('/private-pack/') === 0) return;

  /* Same-origin assets: cache-first, populate on first fetch */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(r).then(function (hit) {
        return hit || fetch(r).then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(V).then(function (c) { c.put(r, copy); });
          }
          return res;
        });
      })
    );
  }
});
