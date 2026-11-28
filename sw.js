/* sw.js — supaya game tetap jalan tanpa internet. Naikkan VERSI setiap rilis. */
var VERSI = 'kk-24-100';
/* aset inti ringan — karakter Anime 2D 120 FPS & desain mobil asli PNG transparan */
var BERKAS = ['./', 'index.html', 'css/game.css', 'js/data/nyata.js', 'js/data/katalog_nyata.js', 'js/data/kalbar.js', 'js/data/kalteng.js', 'js/data/menu.js', 'js/data/rute.js', 'js/kalender.js', 'js/simpan.js', 'js/uang.js', 'js/diri.js', 'js/teman.js', 'js/stok.js', 'js/motor.js', 'js/mobil.js', 'js/ojek.js', 'js/travel.js', 'js/properti.js', 'js/antar.js', 'js/karyawan.js', 'js/dunia.js', 'js/usaha.js', 'js/jualan.js', 'js/karakter_editor.js', 'js/mobil_desain.js', 'js/adegan.js', 'js/suara.js', 'js/kehidupan.js', 'js/ekosistem.js', 'js/dunia_nyata.js', 'js/main.js', 'img/mobil/avanza.png', 'img/mobil/innova.png', 'img/mobil/brio.png', 'img/mobil/fortuner.png', 'img/mobil/alphard.png', 'img/mobil/granmax.png', 'img/mobil/civicrs.png', 'img/mobil/gr86.png', 'img/mobil/landcruiser.png', 'img/mobil/carry.png', 'img/mobil/l300.png', 'img/mobil/traga.png', 'manifest.webmanifest', 'img/ikon-192.png', 'img/ikon-512.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== VERSI; }).map(function (x) { return caches.delete(x); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(function (r) {
    if (r.ok && new URL(e.request.url).origin === location.origin) { var salin = r.clone(); caches.open(VERSI).then(function (c) { c.put(e.request, salin); }); }
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
