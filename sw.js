/* sw.js — supaya game tetap jalan tanpa internet. Naikkan VERSI setiap rilis. */
var VERSI = 'kk-24-74';
/* aset inti + gambar HD Rumah & Karakter (P72) di-cache saat install */
var BERKAS = ['./', 'index.html', 'css/game.css', 'js/data/nyata.js', 'js/data/kalbar.js', 'js/data/kalteng.js', 'js/data/menu.js', 'js/data/rute.js', 'js/kalender.js', 'js/simpan.js', 'js/uang.js', 'js/diri.js', 'js/teman.js', 'js/stok.js', 'js/motor.js', 'js/mobil.js', 'js/ojek.js', 'js/travel.js', 'js/properti.js', 'js/antar.js', 'js/karyawan.js', 'js/dunia.js', 'js/usaha.js', 'js/jualan.js', 'js/adegan.js', 'js/suara.js', 'js/kehidupan.js', 'js/ekosistem.js', 'js/dunia_nyata.js', 'js/main.js', 'manifest.webmanifest', 'img/ikon-192.png', 'img/ikon-512.png', 'img/rumah/kos_hemat.jpg', 'img/rumah/kos_ac.jpg', 'img/rumah/kontrakan.jpg', 'img/rumah/rumah_mewah.jpg', 'img/rumah/apartemen.jpg', 'img/char/cewek_kasual.png', 'img/char/cewek_hijab.png', 'img/char/cewek_driver.png', 'img/char/cowok_kasual.png', 'img/char/cowok_kemeja.png', 'img/char/anak_cewek.png', 'img/char/anak_cowok.png', 'img/char/remaja_cewek.png', 'img/char/remaja_cowok.png', 'img/char/face_cewek_kasual.jpg', 'img/char/face_cewek_hijab.jpg', 'img/char/face_cewek_driver.jpg', 'img/char/face_cowok_kasual.jpg', 'img/char/face_cowok_kemeja.jpg', 'img/char/face_anak_cewek.jpg', 'img/char/face_anak_cowok.jpg', 'img/char/face_remaja_cewek.jpg', 'img/char/face_remaja_cowok.jpg'];
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
