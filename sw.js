/* sw.js — supaya game tetap jalan tanpa internet. Naikkan VERSI setiap rilis. */
var VERSI = 'kk-24-8';
var BERKAS = ['./', 'index.html', 'css/game.css', 'js/data/nyata.js', 'js/data/menu.js', 'js/data/rute.js', 'js/kalender.js', 'js/simpan.js', 'js/uang.js', 'js/diri.js', 'js/teman.js', 'js/stok.js', 'js/motor.js', 'js/mobil.js', 'js/ojek.js', 'js/travel.js', 'js/properti.js', 'js/antar.js', 'js/karyawan.js', 'js/dunia.js', 'js/usaha.js', 'js/jualan.js', 'js/adegan.js', 'js/suara.js', 'js/main.js', 'manifest.webmanifest', 'img/ikon-192.png', 'img/ikon-512.png', 'img/char-neil-aura.jpg', 'img/char-neil-aura-full.png', 'img/char-ferry.jpg', 'img/char-ferry-full.png', 'img/char-cewek-1.jpg', 'img/char-cewek-1-full.png', 'img/char-cewek-2.jpg', 'img/char-cewek-2-full.png', 'img/char-cewek-3.jpg', 'img/char-cewek-3-full.png', 'img/char-cowok-1.jpg', 'img/char-cowok-1-full.png', 'img/char-cowok-2.jpg', 'img/char-cowok-2-full.png', 'img/char-remaja-cewek.jpg', 'img/char-remaja-cewek-full.png', 'img/char-remaja-cowok.jpg', 'img/char-remaja-cowok-full.png', 'img/char-anak-cewek.jpg', 'img/char-anak-cewek-full.png', 'img/char-anak-cowok.jpg', 'img/char-anak-cowok-full.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(BERKAS); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== VERSI; }).map(function (x) { return caches.delete(x); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok && new URL(e.request.url).origin === location.origin) { var salin = r.clone(); caches.open(VERSI).then(function (c) { c.put(e.request, salin); }); }
    return r;
  }).catch(function () { return caches.match(e.request); }));
});
