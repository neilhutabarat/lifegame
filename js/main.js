/* main.js — alur game: pilih kota dan QRIS, jam berjalan, buka-tutup kedai, racik dan jualan, laporan malam, kalender, simpan otomatis. */
(function () {
  'use strict';
  var KAL = window.KK_KAL, N = window.KK_NYATA, SIMPAN = window.KK_SIMPAN, ADEGAN = window.KK_ADEGAN, JUAL = window.KK_JUAL, MN = window.KK_MENU;
  var MENIT_PER_DETIK = 1.875;          /* 1x: 15 jam kedai = 8 menit nyata */
  var TAHUN_DASAR = 2022;               /* tahun Masehi 2023 = tahun ke-1 */
  var HARI_PERTAMA = KAL.dn(2023, 1, 2); /* Senin pertama */

  var $ = function (id) { return document.getElementById(id); };
  var S = null, layar = 'awal', lembar = null, tPrev = 0, menitSimpan = 0, toastT = 0, kotaDipilih = null;
  var R = null; /* racik yang sedang terbuka: { o: pembeli } */
  var kal = { y: 0, m: 0, pilih: null };

  /* ---------- format ---------- */
  function rupiah(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function jam(menit) { var m = Math.floor(menit) % 1440; return dua(Math.floor(m / 60)) + '.' + dua(m % 60); }
  function namaTanggal(n, panjang) { var t = KAL.tgl(n); return (panjang ? N.namaHari[t.dow] + ', ' : '') + t.d + ' ' + N.namaBulan[t.m - 1]; }
  function tahunKe(n) { return KAL.tgl(n).y - TAHUN_DASAR; }
  function kotaIni() { return N.kota.filter(function (k) { return k.id === S.kota; })[0] || N.kota[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function toast(teks, lama) {
    var el = $('toast'); el.textContent = teks; el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, lama || 2200);
  }

  /* ---------- layar ---------- */
  function tampil(nama) {
    layar = nama;
    $('layar-awal').hidden = nama !== 'awal';
    $('layar-kota').hidden = nama !== 'kota';
    $('layar-qris').hidden = nama !== 'qris';
    $('hud').hidden = $('bawah').hidden = nama !== 'main';
    if (nama === 'awal') isiLayarAwal();
    if (nama === 'kota') isiKota();
    if (nama === 'qris') isiQris();
    if (nama === 'main') { perbaruiHUD(true); perbaruiAksi(); }
  }
  function isiLayarAwal() {
    var lama = SIMPAN.baca();
    var b = $('b-lanjut');
    if (lama && lama.v >= 1) {
      b.hidden = false; b.textContent = 'Lanjutkan';
      var k = N.kota.filter(function (x) { return x.id === lama.kota; })[0];
      $('info-simpan').textContent = 'Simpanan: hari ke-' + lama.hariKe + ', ' + (k ? k.nama : '') + ', ' + namaTanggal(lama.hari, true) + '.';
    } else { b.hidden = true; $('info-simpan').textContent = ''; }
  }
  function isiKota() {
    $('kota-daftar').innerHTML = N.kota.map(function (k) {
      return '<button type="button" class="kota" data-kota="' + k.id + '"><b>' + esc(k.nama) + '</b>' +
        '<span class="ciri">' + esc(k.provinsi) + '</span><span class="umk">UMK 2026 ' + rupiah(k.umk) + ' sebulan</span></button>';
    }).join('');
  }

  function isiQris() {
    $('qris-daftar').innerHTML = N.qris.map(function (q) {
      return '<button type="button" class="kota" data-qris="' + q.id + '"><b><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.nama) + '</b>' +
        '<span class="ciri">' + esc(q.transfer) + '</span></button>';
    }).join('');
  }
  /* lengkapi simpanan lama (tahap 1) dengan isi tahap 2 */
  function lengkapi(d) {
    d.v = 2;
    d.uang = d.uang || { laci: 0, merchant: 0 };
    d.hariIni = d.hariIni || JUAL.hariBaru();
    d.riwayat = d.riwayat || [];
    d.omzetTahun = d.omzetTahun || 0;
    d.tahunOmzet = d.tahunOmzet || KAL.tgl(d.hari).y;
    return d;
  }
  function mulaiBaru(kota, qris) {
    S = lengkapi({ v: 2, kota: kota, qris: qris, hari: HARI_PERTAMA, menit: 360, fase: 'pagi', jamBuka: 7, jamTutup: 22, kec: 1, hariKe: 1, dibuat: Date.now() });
    JUAL.kosongkan(); simpan(); tampil('main');
    toast('Hari pertama di ' + kotaIni().nama + '. Kedai buka pukul ' + jam(S.jamBuka * 60) + '.', 3000);
  }
  function lanjut(data) {
    S = lengkapi(data); JUAL.kosongkan();
    if (!S.qris) { kotaDipilih = null; tampil('qris'); return; }
    if (S.fase === 'buka' || S.fase === 'pagi') { /* pembeli yang sedang antre tidak ikut tersimpan */ }
    if (S.fase === 'malam') S.menit = S.jamTutup * 60;
    tampil('main');
    if (S.fase === 'malam') bukaLaporan();
  }
  function qrisIni() { return N.qris.filter(function (q) { return q.id === S.qris; })[0] || N.qris[0]; }
  function simpan() { if (S) { SIMPAN.tulis(S); menitSimpan = S.menit; } }

  /* ---------- HUD ---------- */
  var hudTerakhir = '';
  function perbaruiHUD(paksa) {
    var kunciHUD = S.hari + ':' + Math.floor(S.menit) + ':' + S.fase;
    if (!paksa && kunciHUD === hudTerakhir) return; hudTerakhir = kunciHUD;
    $('h-jam').textContent = jam(S.menit);
    $('h-hari').textContent = namaTanggal(S.hari, true);
    $('h-tahun').textContent = 'Tahun ke-' + tahunKe(S.hari) + ' · Hari ke-' + S.hariKe;
    var st = $('h-status');
    st.className = S.fase === 'buka' ? 'status-buka' : '';
    st.textContent = S.fase === 'pagi' ? 'Buka pukul ' + jam(S.jamBuka * 60) : S.fase === 'buka' ? 'Buka sampai ' + jam(S.jamTutup * 60) : 'Tutup';
    $('h-laci').textContent = rupiah(S.uang.laci);
    $('h-merchant').textContent = rupiah(S.uang.merchant);
    $('h-merchant-nama').textContent = qrisIni().nama;
    $('h-antre').textContent = JUAL.antre().length;
    if (paksa || Math.floor(S.menit) % 60 === 0) {
      var isi = KAL.hariIni(S.hari).filter(function (x) { return x.jenis !== 'suasana' || x.nama !== 'Car Free Day pagi' || S.menit < 600; });
      $('h-chip').innerHTML = isi.map(function (x) {
        var label = x.jenis === 'libur' ? 'Libur: ' + x.nama : x.jenis === 'cuti' ? 'Cuti bersama: ' + x.nama : x.nama;
        return '<span class="chip ' + x.jenis + '">' + esc(label) + '</span>';
      }).join('');
    }
  }
  function perbaruiAksi() {
    var b = $('b-aksi');
    if (S.fase === 'pagi') { b.hidden = false; b.textContent = 'Buka kedai sekarang'; }
    else if (S.fase === 'buka') {
      var d = JUAL.depan(); b.hidden = false; b.disabled = !d;
      b.textContent = d ? 'Racik ' + d.menu.pendek : 'Menunggu pembeli';
    }
    else { b.hidden = false; b.disabled = false; b.textContent = 'Lihat laporan malam'; }
    [].forEach.call(document.querySelectorAll('.kec button'), function (x) { x.setAttribute('aria-pressed', String(+x.dataset.kec === S.kec)); });
  }

  /* ---------- alur hari ---------- */
  function bukaKedai(otomatis) {
    if (S.fase !== 'pagi') return;
    S.fase = 'buka'; perbaruiAksi(); perbaruiHUD(true); simpan();
    toast(otomatis ? 'Pukul ' + jam(S.menit) + ', kedai buka.' : 'Kedai buka lebih awal.');
  }
  function tutupKedai() {
    tutupRacik(); JUAL.tutup();
    S.fase = 'malam'; S.menit = S.jamTutup * 60; perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Pukul ' + jam(S.menit) + ', kedai tutup.');
    setTimeout(function () { if (S && S.fase === 'malam' && layar === 'main' && !lembar) bukaLaporan(); }, 1100);
  }
  function besok() {
    var h = S.hariIni;
    S.riwayat.push({ hari: S.hari, dilayani: h.dilayani, pergi: h.pergi, omzet: h.omzetTunai + h.omzetQris, laba: labaKotor(h) });
    if (S.riwayat.length > 60) S.riwayat.shift();
    S.hari += 1; S.hariKe += 1; S.menit = 360; S.fase = 'pagi'; S.hariIni = JUAL.hariBaru(); JUAL.kosongkan();
    if (KAL.tgl(S.hari).y !== S.tahunOmzet) { S.tahunOmzet = KAL.tgl(S.hari).y; S.omzetTahun = 0; }
    tutupLembar(); simpan(); perbaruiHUD(true); perbaruiAksi();
    var lib = KAL.hariIni(S.hari).filter(function (x) { return x.jenis === 'libur' || x.jenis === 'cuti'; });
    toast(namaTanggal(S.hari, true) + (lib.length ? '. ' + (lib[0].jenis === 'libur' ? 'Libur ' : 'Cuti bersama ') + lib[0].nama + '.' : '.'), 2600);
  }

  /* ---------- lembar bawah ---------- */
  function bukaLembar(nama, html) {
    lembar = nama; $('lembar-isi').innerHTML = '<div class="pegangan"></div>' + html; $('lembar').hidden = false;
    $('lembar-isi').scrollTop = 0;
  }
  function tutupLembar() { lembar = null; $('lembar').hidden = true; }

  function kepala(judul, sub, kiri, kanan) {
    return '<div class="kepala-lembar">' + (kiri || '') + '<div style="flex:1;min-width:0"><h2>' + esc(judul) + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' +
      (kanan || '') + '<button type="button" class="tutup-x" data-tutup aria-label="Tutup">×</button></div>';
  }
  function itemDaftar(x) {
    var label = x.jenis === 'libur' ? 'Libur nasional' : x.jenis === 'cuti' ? 'Cuti bersama' : x.jenis === 'musim' ? 'Musim' : x.jenis === 'event' ? 'Event' : 'Suasana';
    return '<li class="' + x.jenis + '"><span>' + esc(x.nama) + '</span><span>' + label + '</span></li>';
  }
  function labaKotor(h) { return h.omzetTunai + h.omzetQris - h.mdr - h.hpp - h.terbuang; }
  function baris(a, b, kls) { return '<li' + (kls ? ' class="' + kls + '"' : '') + '><span>' + a + '</span><span>' + b + '</span></li>'; }
  function ringkasanJualan() {
    var h = S.hariIni, omzet = h.omzetTunai + h.omzetQris, q = qrisIni();
    var laris = MN.MENU.filter(function (m) { return h.menu[m.id]; }).sort(function (a, b) { return h.menu[b.id] - h.menu[a.id]; });
    return '<h3 class="subjudul">Penjualan</h3><ul class="daftar angka">' +
      baris('Pembeli dilayani', h.dilayani + ' orang') +
      baris('Pergi karena kelamaan', h.pergi + ' orang', h.pergi ? 'rugi' : '') +
      (h.penuh ? baris('Batal karena antrean penuh', h.penuh + ' orang', 'rugi') : '') +
      baris('Omzet tunai', rupiah(h.omzetTunai)) +
      baris('Omzet QRIS', rupiah(h.omzetQris)) +
      baris('Potongan MDR QRIS', '−' + rupiah(h.mdr)) +
      baris('HPP bahan terjual', '−' + rupiah(h.hpp)) +
      (h.terbuang ? baris('Bahan terbuang', '−' + rupiah(h.terbuang), 'rugi') : '') +
      baris('<b>Laba kotor</b>', '<b>' + rupiah(labaKotor(h)) + '</b>', 'total') + '</ul>' +
      (laris.length ? '<h3 class="subjudul">Menu terlaris</h3><ul class="daftar angka">' + laris.map(function (m) { return baris(esc(m.nama), h.menu[m.id] + ' gelas'); }).join('') + '</ul>' : '') +
      '<h3 class="subjudul">Uang sekarang</h3><ul class="daftar angka">' + baris('Laci kas (tunai)', rupiah(S.uang.laci)) + baris('Saldo merchant ' + esc(q.nama), rupiah(S.uang.merchant)) + '</ul>' +
      '<p class="catatan">Omzet ' + rupiah(omzet) + ' hari ini. Belanja bahan, sewa, listrik, dan gaji mulai dihitung di versi berikutnya.</p>';
  }
  function kapan(lagi) { return lagi === 0 ? 'hari ini' : lagi === 1 ? 'besok' : lagi + ' hari lagi'; }

  function bukaLaporan() {
    var bsk = S.hari + 1, isiHari = KAL.hariIni(S.hari), isiBesok = KAL.hariIni(bsk);
    var raya = KAL.berikutnya(bsk, 4);
    var isbat = '';
    var besokLebaran = (KAL.liburTahun(KAL.tgl(bsk).y)[bsk] || []).filter(function (x) { return x.jenis === 'libur' && (x.nama === 'Idulfitri' || x.nama === 'Iduladha'); })[0];
    var hariIniLebaran = (KAL.liburTahun(KAL.tgl(S.hari).y)[S.hari] || []).some(function (x) { return x.nama === 'Idulfitri' && x.jenis === 'libur'; });
    if (besokLebaran && !(besokLebaran.nama === 'Idulfitri' && hariIniLebaran)) isbat = '<div class="isbat">Sidang isbat malam ini: pemerintah menetapkan ' + besokLebaran.nama + ' jatuh besok, ' + namaTanggal(bsk, true) + '.</div>';
    bukaLembar('laporan',
      kepala('Laporan malam', 'Hari ke-' + S.hariKe + ' · ' + namaTanggal(S.hari, true)) +
      '<h3 class="subjudul">Hari ini</h3><ul class="daftar">' + isiHari.map(itemDaftar).join('') + '</ul>' +
      ringkasanJualan() +
      isbat +
      '<h3 class="subjudul">Besok, ' + esc(namaTanggal(bsk, true)) + '</h3><ul class="daftar">' + isiBesok.map(itemDaftar).join('') + '</ul>' +
      '<h3 class="subjudul">Hari raya terdekat</h3><ul class="daftar">' + raya.map(function (r) {
        return '<li class="libur"><span>' + esc(r.nama) + '</span><span>' + namaTanggal(r.n) + ', ' + kapan(r.lagi + 1) + '</span></li>';
      }).join('') + '</ul>' +
      '<div style="margin-top:18px"><button type="button" class="aksi" data-besok>Tidur, lanjut besok</button></div>');
  }

  function bukaKalender(y, m) {
    if (y == null) { var t0 = KAL.tgl(S.hari); y = t0.y; m = t0.m; kal.pilih = S.hari; }
    kal.y = y; kal.m = m;
    var awal = KAL.dn(y, m, 1), dowAwal = KAL.tgl(awal).dow, jml = KAL.tgl(KAL.dn(y, m + 1, 1) - 1).d;
    var peta = KAL.liburTahun(y), sel = '';
    N.hariSingkat.forEach(function (h, i) { sel += '<div class="nh' + (i === 0 ? ' min' : '') + '">' + h + '</div>'; });
    for (var i = 0; i < dowAwal; i++) sel += '<div class="tg kosong"></div>';
    for (var d = 1; d <= jml; d++) {
      var n = awal + d - 1, lib = peta[n] || [], kls = ['tg'];
      if (lib.some(function (x) { return x.jenis === 'libur'; })) kls.push('libur');
      else if (lib.some(function (x) { return x.jenis === 'cuti'; })) kls.push('cuti');
      else if (KAL.tgl(n).dow === 0) kls.push('min');
      if (n === S.hari) kls.push('ini');
      if (n === kal.pilih) kls.push('pilih');
      if (n < S.hari) kls.push('lewat');
      var isiN = KAL.hariIni(n);
      var ev = isiN.some(function (x) { return x.jenis === 'event' && !/^(Ramadan|Musim mudik|Agustusan)/.test(x.nama); });
      if (isiN.some(function (x) { return /^Ramadan/.test(x.nama); })) kls.push('rmd');
      sel += '<button type="button" class="' + kls.join(' ') + '" data-tg="' + n + '" aria-label="' + esc(namaTanggal(n, true)) + '">' + d + (ev ? '<span class="titik"></span>' : '') + '</button>';
    }
    var tAwal = KAL.tgl(HARI_PERTAMA), tKini = KAL.tgl(S.hari);
    var bisaMundur = y * 12 + m > tAwal.y * 12 + tAwal.m, bisaMaju = y * 12 + m < tKini.y * 12 + tKini.m + 24;
    var pilih = kal.pilih != null && KAL.tgl(kal.pilih).m === m && KAL.tgl(kal.pilih).y === y ? kal.pilih : null;
    var detail = pilih != null ? '<h3 class="subjudul">' + esc(namaTanggal(pilih, true)) + (pilih === S.hari ? ' (hari ini)' : '') + '</h3><ul class="daftar">' +
      KAL.hariIni(pilih).map(itemDaftar).join('') + '</ul>' : '';
    var raya = KAL.berikutnya(S.hari, 5);
    bukaLembar('kalender',
      kepala(N.namaBulan[m - 1], 'Tahun ke-' + (y - TAHUN_DASAR),
        '<button type="button" class="panah" data-bulan="-1" aria-label="Bulan sebelumnya"' + (bisaMundur ? '' : ' disabled') + '>‹</button>',
        '<button type="button" class="panah" data-bulan="1" aria-label="Bulan berikutnya"' + (bisaMaju ? '' : ' disabled') + '>›</button>') +
      '<div class="grid-kal">' + sel + '</div>' +
      '<div class="keterangan"><span><i style="background:rgba(217,68,58,.5)"></i>Libur nasional</span><span><i style="background:rgba(232,137,46,.6)"></i>Cuti bersama</span><span><i style="background:var(--kunyit);border-radius:50%"></i>Event</span><span><i style="background:var(--kontainer);height:4px"></i>Ramadan</span></div>' +
      detail +
      '<h3 class="subjudul">Hari raya terdekat</h3><ul class="daftar">' + raya.map(function (r) {
        return '<li class="libur"><span>' + esc(r.nama) + '</span><span>' + namaTanggal(r.n) + ', ' + kapan(r.lagi) + '</span></li>';
      }).join('') + '</ul>');
  }

  function bukaLaporanSementara() {
    if (S.fase === 'malam') return bukaLaporan();
    bukaLembar('sementara', kepala('Jualan hari ini', 'Sampai pukul ' + jam(S.menit)) + ringkasanJualan());
  }
  var konfirmasiUlang = false;
  function bukaAtur() {
    var k = kotaIni(), lamaHari = (S.jamTutup - S.jamBuka) * 60 / MENIT_PER_DETIK / 60;
    bukaLembar('atur',
      kepala('Atur usaha', k.nama + ' · ' + k.provinsi) +
      '<div class="atur-baris"><div><b>Jam buka</b><span>Kedai buka otomatis pada jam ini</span></div><div class="langkah"><button type="button" data-jam="buka:-1" aria-label="Kurangi jam buka">−</button><output>' + jam(S.jamBuka * 60) + '</output><button type="button" data-jam="buka:1" aria-label="Tambah jam buka">+</button></div></div>' +
      '<div class="atur-baris"><div><b>Jam tutup</b><span>Lalu laporan malam muncul</span></div><div class="langkah"><button type="button" data-jam="tutup:-1" aria-label="Kurangi jam tutup">−</button><output>' + jam(S.jamTutup * 60) + '</output><button type="button" data-jam="tutup:1" aria-label="Tambah jam tutup">+</button></div></div>' +
      '<div class="atur-baris"><div><b>UMK ' + esc(k.nama) + '</b><span>Patokan gaji karyawan, berlaku 2026</span></div><b>' + rupiah(k.umk) + '</b></div>' +
      '<div class="atur-baris"><div><b>QRIS</b><span>' + esc(qrisIni().transfer) + '</span></div><b>' + esc(qrisIni().nama) + '</b></div>' +
      '<h3 class="subjudul">Menu & harga</h3><ul class="daftar angka">' + MN.MENU.map(function (m) {
        return baris(esc(m.nama) + '<small>HPP ' + rupiah(m.hpp) + ' · laba ' + Math.round((1 - m.hpp / m.harga) * 100) + '%</small>', rupiah(m.harga));
      }).join('') + '</ul>' +
      '<p class="catatan">Pada kecepatan 1×, jam buka sampai tutup berjalan sekitar ' + Math.round(lamaHari) + ' menit nyata. Waktu berhenti saat lembar ini terbuka atau aplikasi ditinggal.</p>' +
      '<button type="button" class="bahaya" data-ulang>' + (konfirmasiUlang ? 'Tekan sekali lagi untuk menghapus simpanan' : 'Mulai ulang dari awal') + '</button>' +
      '<p class="catatan">Versi uji tahap 2: jualan inti.</p>');
  }
  function ubahJam(apa, d) {
    if (apa === 'buka') S.jamBuka = Math.max(5, Math.min(S.jamTutup - 4, S.jamBuka + d));
    else S.jamTutup = Math.max(S.jamBuka + 4, Math.min(24, S.jamTutup + d));
    simpan(); perbaruiHUD(true); bukaAtur();
  }

  /* ---------- racik ---------- */
  var WARNA_LAPIS = { es: 'linear-gradient(90deg,#cfe9f5 0 30%,#e8f6fb 30% 36%,#cfe9f5 36% 64%,#e8f6fb 64% 70%,#cfe9f5 70%)', kopi: '#4a2c1d', air: '#d9c3a3', uht: '#fbf7ef', skm: '#f1e3c0', gula: '#ffffff', aren: '#9a5a22', cokelat: '#6b3b25', teh: '#b8622a' };
  var TINGGI_LAPIS = { es: 14, kopi: 16, air: 20, uht: 20, skm: 9, gula: 5, aren: 9, cokelat: 16, teh: 20 };
  function resepPunya(menu, b) { return menu.resep.filter(function (r) { return r[0] === b; })[0]; }
  function bukaRacik() {
    var o = JUAL.depan(); if (!o || S.fase !== 'buka') return;
    if (R && R.o === o) return;
    if (R) R.o.keadaan = 'antre';
    R = { o: o }; o.keadaan = 'dilayani';
    $('app').classList.add('meracik'); $('racik').hidden = false; $('bawah').hidden = true;
    gambarRacik('');
  }
  function tutupRacik() {
    if (!R) return;
    if (R.o.keadaan === 'dilayani') R.o.keadaan = 'antre';
    R = null; $('app').classList.remove('meracik'); $('racik').hidden = true;
    if (layar === 'main') $('bawah').hidden = false;
    perbaruiAksi();
  }
  function biayaGelas(o) { return o.racik.reduce(function (t, b) { var r = resepPunya(o.menu, b); return t + MN.biaya(b, r ? r[1] : 1); }, 0); }
  function lengkap(o) { return o.menu.resep.every(function (r) { return o.racik.indexOf(r[0]) >= 0; }); }
  function gambarRacik(pesan, salah) {
    var o = R.o, m = o.menu;
    $('r-nama').textContent = m.nama;
    $('r-harga').textContent = rupiah(m.harga) + ' · bayar ' + (o.bayar === 'qris' ? 'QRIS' : 'tunai');
    $('r-resep').innerHTML = m.resep.map(function (r) {
      var b = MN.BAHAN[r[0]], ok = o.racik.indexOf(r[0]) >= 0;
      var jml = b.jenis === 'cup' || r[0] === 'es' || r[0] === 'air' ? '' : ' ' + r[1] + (b.perMl ? ' ml' : ' g');
      return '<span class="resep-item' + (ok ? ' ok' : '') + '">' + (ok ? '✓ ' : '') + esc(b.nama) + jml + '</span>';
    }).join('');
    var cup = o.racik[0], gelas = $('r-gelas');
    gelas.className = 'gelas' + (cup === 'cupKertas' ? ' kertas' : cup ? ' plastik' : ' kosong');
    $('r-isi').innerHTML = o.racik.slice(1).map(function (b) {
      return '<i style="height:' + (TINGGI_LAPIS[b] || 10) + 'px;background:' + (WARNA_LAPIS[b] || '#ccc') + '"></i>';
    }).join('');
    $('r-bahan').innerHTML = MN.URUT_BAHAN.map(function (id) {
      var b = MN.BAHAN[id], dipakai = o.racik.indexOf(id) >= 0;
      return '<button type="button" class="bahan' + (dipakai ? ' dipakai' : '') + '" data-bahan="' + id + '"><i style="background:' + b.warna + '"></i>' + esc(b.nama) + '</button>';
    }).join('');
    var p = $('r-pesan'); p.textContent = pesan || (o.racik.length ? (lengkap(o) ? 'Gelas jadi. Serahkan ke pembeli.' : 'Tambahkan bahan sesuai resep.') : 'Ambil cup dulu.');
    p.className = 'racik-pesan' + (salah ? ' salah' : lengkap(o) ? ' siap' : '');
    $('r-serah').disabled = !lengkap(o);
    $('r-buang').disabled = !o.racik.length;
  }
  function tapBahan(id) {
    if (!R) return;
    var o = R.o, b = MN.BAHAN[id], r = resepPunya(o.menu, id);
    if (!o.racik.length) {
      if (b.jenis !== 'cup') return gambarRacik('Ambil cup dulu.', true);
      if (!r) { S.hariIni.terbuang += MN.biaya(id, 1); return gambarRacik(b.nama + ' salah untuk menu ini, terbuang ' + rupiah(MN.biaya(id, 1)) + '.', true); }
      o.racik.push(id); ADEGAN.racikSaja(); return gambarRacik();
    }
    if (b.jenis === 'cup') return gambarRacik('Cup sudah ada.', true);
    if (o.racik.indexOf(id) >= 0) return gambarRacik(b.nama + ' sudah masuk.', true);
    if (!r) { var rugi = MN.biaya(id, b.porsi); S.hariIni.terbuang += rugi; return gambarRacik(b.nama + ' tidak ada di resep, terbuang ' + rupiah(rugi) + '.', true); }
    o.racik.push(id); ADEGAN.racikSaja(); gambarRacik();
  }
  function buangGelas() {
    if (!R || !R.o.racik.length) return;
    var rugi = biayaGelas(R.o); S.hariIni.terbuang += rugi; R.o.racik = [];
    gambarRacik('Gelas dibuang, rugi ' + rupiah(rugi) + '.', true);
  }
  function serahkan() {
    if (!R || !lengkap(R.o)) return;
    var o = R.o; JUAL.layani(S, o, biayaGelas(o));
    var lanjutO = JUAL.depan();
    if (lanjutO) { R = { o: lanjutO }; lanjutO.keadaan = 'dilayani'; gambarRacik(); }
    else tutupRacik();
    perbaruiHUD(true);
  }

  /* ---------- putaran waktu ---------- */
  function putar(t) {
    var dt = tPrev ? Math.min(250, t - tPrev) : 16; tPrev = t;
    var main = layar === 'main' && S;
    var dMenit = 0, depanLama = main ? JUAL.depan() : null;
    if (main && !lembar && !document.hidden && S.kec > 0 && S.fase !== 'malam') {
      dMenit = dt / 1000 * MENIT_PER_DETIK * S.kec;
      S.menit += dMenit;
      if (S.fase === 'buka') JUAL.langkah(S, dMenit);
      if (S.fase === 'pagi' && S.menit >= S.jamBuka * 60) bukaKedai(true);
      if (S.fase === 'buka' && S.menit >= S.jamTutup * 60) tutupKedai();
      if (S.menit - menitSimpan >= 30) simpan();
    }
    if (main) {
      JUAL.bersihkan();
      if (R && R.o.keadaan !== 'dilayani') { tutupRacik(); toast('Pembeli pergi, kelamaan menunggu.'); }
      if (JUAL.depan() !== depanLama) perbaruiAksi();
      perbaruiHUD();
    }
    var ruang = layar !== 'main' ? 0 : R ? $('racik').offsetHeight : $('bawah').offsetHeight;
    ADEGAN.gambar(main ? { menit: S.menit, buka: S.fase === 'buka', kecepatan: S.kec, jalan: !lembar && S.kec > 0 && S.fase !== 'malam', pembeli: JUAL.semua(), dMenit: dMenit, ruangBawah: ruang }
      : { menit: 1050, buka: true, kecepatan: 1, jalan: true, pembeli: [], dMenit: 0 }, t);
    requestAnimationFrame(putar);
  }

  /* ---------- sentuhan ---------- */
  var SAPA = ['Siap, bos!', 'Kopi hari ini wangi.', 'Mau racik apa kita?', 'Semangat jualan!', 'Es batu aman, bos.'];
  function pasangEvent() {
    $('b-baru').onclick = function () { tampil('kota'); };
    $('b-kembali').onclick = function () { tampil('awal'); };
    $('b-lanjut').onclick = function () { var d = SIMPAN.baca(); if (d) lanjut(d); };
    $('kota-daftar').onclick = function (e) { var b = e.target.closest('[data-kota]'); if (b) { kotaDipilih = b.dataset.kota; tampil('qris'); } };
    $('qris-daftar').onclick = function (e) {
      var b = e.target.closest('[data-qris]'); if (!b) return;
      if (kotaDipilih) mulaiBaru(kotaDipilih, b.dataset.qris);
      else if (S) { S.qris = b.dataset.qris; simpan(); lanjut(S); }
    };
    $('b-kembali-qris').onclick = function () { tampil(kotaDipilih ? 'kota' : 'awal'); };
    $('b-aksi').onclick = function () { if (S.fase === 'pagi') bukaKedai(false); else if (S.fase === 'buka') bukaRacik(); else if (S.fase === 'malam') bukaLaporan(); };
    $('r-bahan').onclick = function (e) { var b = e.target.closest('[data-bahan]'); if (b) tapBahan(b.dataset.bahan); };
    $('r-buang').onclick = buangGelas;
    $('r-serah').onclick = serahkan;
    $('r-tunda').onclick = tutupRacik;
    $('b-kal').onclick = function () { bukaKalender(); };
    $('h-uang').onclick = function () { if (S && S.fase !== 'pagi') bukaLaporanSementara(); };
    $('b-atur').onclick = function () { konfirmasiUlang = false; bukaAtur(); };
    document.querySelector('.kec').onclick = function (e) {
      var b = e.target.closest('[data-kec]'); if (!b) return;
      S.kec = +b.dataset.kec; perbaruiAksi(); simpan();
    };
    $('lembar').onclick = function (e) {
      if (e.target === $('lembar') || e.target.closest('[data-tutup]')) { tutupLembar(); return; }
      var b;
      if ((b = e.target.closest('[data-besok]'))) return besok();
      if ((b = e.target.closest('[data-bulan]'))) { var m = kal.m + (+b.dataset.bulan), y = kal.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } return bukaKalender(y, m); }
      if ((b = e.target.closest('[data-tg]'))) { kal.pilih = +b.dataset.tg; return bukaKalender(kal.y, kal.m); }
      if ((b = e.target.closest('[data-jam]'))) { var p = b.dataset.jam.split(':'); return ubahJam(p[0], +p[1]); }
      if ((b = e.target.closest('[data-ulang]'))) {
        if (!konfirmasiUlang) { konfirmasiUlang = true; return bukaAtur(); }
        SIMPAN.hapus(); S = null; konfirmasiUlang = false; JUAL.kosongkan(); tutupLembar(); tampil('awal');
      }
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lembar) tutupLembar(); });
    $('adegan').addEventListener('pointerdown', function (e) {
      if (layar !== 'main') return;
      var r = $('adegan').getBoundingClientRect(), kena = ADEGAN.ketuk(e.clientX - r.left, e.clientY - r.top);
      if (kena === 'pembeli' && S.fase === 'buka') bukaRacik();
      else if (kena === 'barista') toast(SAPA[Math.floor(Math.random() * SAPA.length)], 1400);
      else if (kena === 'kedai' && S.fase === 'pagi') toast('Kedai buka pukul ' + jam(S.jamBuka * 60) + ', atau tekan Buka kedai sekarang.', 2000);
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) simpan(); else tPrev = 0; });
    window.addEventListener('pagehide', simpan);
  }

  /* ---------- mulai ---------- */
  function mulai(data) {
    ADEGAN.init($('adegan'));
    pasangEvent();
    if (data && data.S) lanjut(data.S); else tampil('awal');
    requestAnimationFrame(putar);
    if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|claudeusercontent/.test(location.hostname)) {
      try { navigator.serviceWorker.register('sw.js').catch(function () {}); } catch (e) {}
    }
  }
  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return { S: layar === 'main' ? S : null }; });
  if (hot && hot.ready) hot.ready(mulai); else mulai(hot && hot.data ? hot.data : {});
})();
