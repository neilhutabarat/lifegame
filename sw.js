/* sw.js — supaya game tetap jalan tanpa internet. Naikkan VERSI setiap rilis. */
var VERSI = 'kk-7-0';
var BERKAS = ['./', 'index.html', 'css/game.css', 'js/data/nyata.js', 'js/data/menu.js', 'js/kalender.js', 'js/simpan.js', 'js/uang.js', 'js/stok.js', 'js/motor.js', 'js/antar.js', 'js/karyawan.js', 'js/dunia.js', 'js/jualan.js', 'js/adegan.js', 'js/main.js', 'manifest.webmanifest', 'img/ikon-192.png', 'img/ikon-512.png'];
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
