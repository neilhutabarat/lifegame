/* kalender.js — kalender game Kopi Kontainer.
   Tahun ke-1 = kalender 2023, tahun ke-2 = 2024, dst. Angka tahun tidak pernah ditampilkan.
   Hari raya yang ikut bulan dihitung dari fase bulan (Meeus, Astronomical Algorithms bab 49):
   - Hijriah: awal bulan = sehari setelah magrib pertama yang umur bulannya >= 10 jam (mendekati kriteria MABIMS).
   - Imlek: bulan baru (WITA/UTC+8) antara 21 Jan dan 20 Feb.
   - Nyepi: tanggal bulan mati Kesanga (UTC+8) antara 6 Mar dan 4 Apr.
   - Waisak: purnama pertama (WIB) mulai 10 Mei.
   - Paskah: rumus Gregorian (Meeus/Jones/Butcher).
   Tahun yang daftar resminya sudah ada (SKB 3 Menteri) memakai daftar resmi. */
(function (g) {
  'use strict';
  var HARI = 864e5, JAM = 36e5;

  /* ---------- tanggal sebagai nomor hari (hari sejak 1 Jan 1970) ---------- */
  function dn(y, m, d) { return Math.floor(Date.UTC(y, m - 1, d) / HARI); }
  function tgl(n) { var t = new Date(n * HARI); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), dow: t.getUTCDay() }; }
  function kunci(n) { var t = tgl(n); return t.y + '-' + (t.m < 10 ? '0' : '') + t.m + '-' + (t.d < 10 ? '0' : '') + t.d; }
  function hariLokal(ms, zonaJam) { return Math.floor((ms + zonaJam * JAM) / HARI); }

  /* ---------- fase bulan (Meeus bab 49) ---------- */
  var RAD = Math.PI / 180;
  function s(x) { return Math.sin(x * RAD); }
  /* k bulat = bulan baru, k + 0.5 = purnama. Hasil: waktu UTC dalam milidetik. */
  function faseBulan(k, purnama) {
    var T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    var jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
    var E = 1 - 0.002516 * T - 0.0000074 * T2;
    var M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
    var Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
    var F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
    var Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;
    var c = purnama
      ? -0.40614 * s(Mp) + 0.17302 * E * s(M) + 0.01614 * s(2 * Mp) + 0.01043 * s(2 * F) + 0.00734 * E * s(Mp - M) - 0.00515 * E * s(Mp + M) + 0.00209 * E * E * s(2 * M)
      : -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F) + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M);
    c += -0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M) - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) +
      0.00038 * E * s(M - 2 * F) - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om) - 0.00007 * s(Mp + 2 * M) + 0.00004 * s(2 * Mp - 2 * F) +
      0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F) + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F) -
      0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
    jde += c;
    return (jde - 2440587.5) * HARI - 69e3; /* TT ke UTC, selisih sekitar 69 detik */
  }
  function kAwal(y) { return Math.floor((y - 2000) * 12.3685); }

  /* ---------- kalender Hijriah ---------- */
  /* patokan: ijtimak 21 Mar 2023 = awal Ramadan 1444 H (bulan ke-9) */
  var K_RAMADAN_1444 = 287;
  function awalBulanHijriah(k) {
    var ijtimak = faseBulan(k, false);
    var hari = hariLokal(ijtimak, 7);
    var magrib = hari * HARI + 11 * JAM; /* sekitar 18.00 WIB */
    return hari + ((magrib - ijtimak) >= 10 * JAM ? 1 : 2);
  }
  function bulanHijriah(k) { var total = 1444 * 12 + 8 + (k - K_RAMADAN_1444); return { th: Math.floor(total / 12), bl: (total % 12) + 1 }; }
  /* tanggal Masehi (nomor hari) untuk tanggal Hijriah tertentu dalam tahun Masehi y */
  function hijriahDiTahun(y, bl, tg) {
    var hasil = [];
    for (var k = kAwal(y) - 2; k <= kAwal(y) + 14; k++) {
      if (bulanHijriah(k).bl !== bl) continue;
      var n = awalBulanHijriah(k) + tg - 1;
      if (tgl(n).y === y) hasil.push(n);
    }
    return hasil;
  }

  /* ---------- Paskah ---------- */
  function paskah(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g2 = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g2 + 15) % 30, i = Math.floor(c / 4), kk = c % 4,
      l = (32 + 2 * e + 2 * i - h - kk) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      bln = Math.floor((h + l - 7 * m + 114) / 31), hr = ((h + l - 7 * m + 114) % 31) + 1;
    return dn(y, bln, hr);
  }

  /* ---------- fase bulan dalam rentang tanggal ---------- */
  function faseDiRentang(y, purnama, zona, dari, sampai) {
    for (var k = kAwal(y) - 2; k <= kAwal(y) + 14; k++) {
      var n = hariLokal(faseBulan(purnama ? k + 0.5 : k, purnama), zona);
      if (n >= dari && n <= sampai) return n;
    }
    return null;
  }

  /* ---------- daftar resmi (SKB 3 Menteri) ---------- */
  var RESMI = {
    2023: {
      libur: [['01-01', 'Tahun Baru Masehi'], ['01-22', 'Tahun Baru Imlek'], ['02-18', 'Isra Mikraj'], ['03-22', 'Hari Suci Nyepi'],
        ['04-07', 'Wafat Isa Almasih'], ['04-22', 'Idulfitri'], ['04-23', 'Idulfitri'], ['05-01', 'Hari Buruh'], ['05-18', 'Kenaikan Isa Almasih'],
        ['06-01', 'Hari Lahir Pancasila'], ['06-04', 'Hari Raya Waisak'], ['06-29', 'Iduladha'], ['07-19', 'Tahun Baru Islam'],
        ['08-17', 'Hari Kemerdekaan RI'], ['09-28', 'Maulid Nabi Muhammad'], ['12-25', 'Hari Natal']],
      cuti: [['01-23', 'Tahun Baru Imlek'], ['03-23', 'Hari Suci Nyepi'], ['04-19', 'Idulfitri'], ['04-20', 'Idulfitri'], ['04-21', 'Idulfitri'],
        ['04-24', 'Idulfitri'], ['04-25', 'Idulfitri'], ['06-02', 'Hari Raya Waisak'], ['06-28', 'Iduladha'], ['06-30', 'Iduladha'], ['12-26', 'Hari Natal']]
    }
  };
  /* koreksi satu tanggal untuk tahun yang hasil rumusnya berbeda sehari dari keputusan pemerintah */
  var KOREKSI = { 2024: { 'Hari Suci Nyepi': '03-11' }, 2025: { 'Iduladha': '06-06' }, 2026: { 'Isra Mikraj': '01-16', 'Tahun Baru Islam': '06-16' } };

  function dariMMDD(y, mmdd) { var p = mmdd.split('-'); return dn(y, +p[0], +p[1]); }

  var cache = {};
  /* semua hari libur dan cuti bersama dalam tahun Masehi y: { nomorHari: [{nama, jenis}] } */
  function liburTahun(y) {
    if (cache[y]) return cache[y];
    var peta = {};
    function tambah(n, nama, jenis) { if (n == null) return; (peta[n] = peta[n] || []).push({ nama: nama, jenis: jenis }); }
    if (RESMI[y]) {
      RESMI[y].libur.forEach(function (x) { tambah(dariMMDD(y, x[0]), x[1], 'libur'); });
      RESMI[y].cuti.forEach(function (x) { tambah(dariMMDD(y, x[0]), x[1], 'cuti'); });
      return (cache[y] = peta);
    }
    var kor = KOREKSI[y] || {};
    function hitung(nama, n) { return kor[nama] ? dariMMDD(y, kor[nama]) : n; }
    var L = {};
    L.tahunBaru = dn(y, 1, 1);
    L.imlek = hitung('Tahun Baru Imlek', faseDiRentang(y, false, 8, dn(y, 1, 21), dn(y, 2, 20)));
    L.nyepi = hitung('Hari Suci Nyepi', faseDiRentang(y, false, 8, dn(y, 3, 6), dn(y, 4, 4)));
    L.waisak = hitung('Hari Raya Waisak', faseDiRentang(y, true, 7, dn(y, 5, 10), dn(y, 6, 30)));
    var p = paskah(y);
    var syawal = hijriahDiTahun(y, 10, 1);
    function hij(nama, bl, tg) { return kor[nama] ? [dariMMDD(y, kor[nama])] : hijriahDiTahun(y, bl, tg); }
    var adha = hij('Iduladha', 12, 10);

    tambah(L.tahunBaru, 'Tahun Baru Masehi', 'libur');
    tambah(L.imlek, 'Tahun Baru Imlek', 'libur');
    hij('Isra Mikraj', 7, 27).forEach(function (n) { tambah(n, 'Isra Mikraj', 'libur'); });
    tambah(L.nyepi, 'Hari Suci Nyepi', 'libur');
    tambah(p - 2, 'Wafat Isa Almasih', 'libur');
    if (y >= 2024) tambah(p, 'Hari Paskah', 'libur');
    syawal.forEach(function (n) { tambah(n, 'Idulfitri', 'libur'); tambah(n + 1, 'Idulfitri', 'libur'); });
    tambah(dn(y, 5, 1), 'Hari Buruh', 'libur');
    tambah(p + 39, 'Kenaikan Isa Almasih', 'libur');
    tambah(dn(y, 6, 1), 'Hari Lahir Pancasila', 'libur');
    tambah(L.waisak, 'Hari Raya Waisak', 'libur');
    adha.forEach(function (n) { tambah(n, 'Iduladha', 'libur'); });
    hij('Tahun Baru Islam', 1, 1).forEach(function (n) { tambah(n, 'Tahun Baru Islam', 'libur'); });
    tambah(dn(y, 8, 17), 'Hari Kemerdekaan RI', 'libur');
    hij('Maulid Nabi Muhammad', 3, 12).forEach(function (n) { tambah(n, 'Maulid Nabi Muhammad', 'libur'); });
    tambah(dn(y, 12, 25), 'Hari Natal', 'libur');
    if (y >= 2024 && (y - 2024) % 5 === 0) tambah(dn(y, 2, 14), 'Pemilu', 'libur');

    /* cuti bersama dengan pola SKB: hari kerja di sebelah hari raya */
    function kerja(n) { var d = tgl(n).dow; return d !== 0 && d !== 6 && !(peta[n] && peta[n].length); }
    function cutiSebelah(n, nama) {
      if (n == null) return;
      if (kerja(n + 1)) tambah(n + 1, nama, 'cuti'); else if (kerja(n - 1)) tambah(n - 1, nama, 'cuti');
    }
    cutiSebelah(L.imlek, 'Tahun Baru Imlek');
    cutiSebelah(L.nyepi, 'Hari Suci Nyepi');
    cutiSebelah(L.waisak, 'Hari Raya Waisak');
    cutiSebelah(dn(y, 12, 25), 'Hari Natal');
    cutiSebelah(p + 39, 'Kenaikan Isa Almasih');
    adha.forEach(function (n) { cutiSebelah(n, 'Iduladha'); });
    syawal.forEach(function (n) {
      var jatah = 3;
      if (kerja(n - 1)) { tambah(n - 1, 'Idulfitri', 'cuti'); jatah--; }
      for (var j = n + 2; jatah > 0 && j < n + 9; j++) if (kerja(j)) { tambah(j, 'Idulfitri', 'cuti'); jatah--; }
    });
    return (cache[y] = peta);
  }

  /* ---------- event dan suasana harian ---------- */
  function lebaranTahun(y) {
    var peta = liburTahun(y), hasil = [];
    for (var n in peta) if (peta[n].some(function (x) { return x.nama === 'Idulfitri' && x.jenis === 'libur'; })) hasil.push(+n);
    hasil.sort(function (a, b) { return a - b; });
    return hasil.length ? hasil[0] : null;
  }
  function ramadanTahun(y) {
    var l = lebaranTahun(y); if (l == null) return null;
    /* 1 Ramadan = awal bulan Hijriah sebelum 1 Syawal */
    for (var k = kAwal(y) - 2; k <= kAwal(y) + 14; k++) {
      if (bulanHijriah(k).bl === 9) { var a = awalBulanHijriah(k); if (a < l && l - a < 32) return { awal: a, akhir: l - 1 }; }
    }
    return null;
  }

  function apakahRamadan(n) {
    var t = tgl(n), r = ramadanTahun(t.y);
    if (r && n >= r.awal && n <= r.akhir) return n - r.awal + 1;
    return 0;
  }
  /* takbiran selama 2 malam: malam Lebaran (H-1 mulai 18.00 sampai pagi) dan malam esoknya (hari ke-1 Lebaran malam) */
  function apakahMalamTakbiran(n, menit) {
    var t = tgl(n), l = lebaranTahun(t.y);
    if (l == null) return false;
    var m = (menit == null ? 1100 : menit) % 1440;
    if (n === l - 1 && m >= 1080) return true;
    if (n === l && (m < 360 || m >= 1080)) return true;
    if (n === l + 1 && m < 300) return true;
    return false;
  }
  function tanggalKembar(n) {
    var t = tgl(n);
    return t.m === t.d ? (t.d + '.' + t.m) : null;
  }
  function usia(n, ttl) {
    if (!ttl) return 24;
    var p = String(ttl).split('-');
    if (p.length !== 3) return 24;
    var t = tgl(n), u = t.y - (+p[0]);
    if (t.m < (+p[1]) || (t.m === (+p[1]) && t.d < (+p[2]))) u--;
    return Math.max(0, u);
  }
  function musim(m) {
    if (m >= 11 || m <= 3) return 'Musim hujan';
    if (m >= 6 && m <= 9) return 'Musim kemarau';
    return 'Pancaroba';
  }

  /* semua yang terjadi pada satu hari: libur, cuti, event, suasana */
  function hariIni(n) {
    var t = tgl(n), y = t.y, out = [];
    var lib = liburTahun(y)[n] || [];
    lib.forEach(function (x) { out.push({ nama: x.nama, jenis: x.jenis }); });
    var r = ramadanTahun(y);
    if (r && n >= r.awal && n <= r.akhir) out.push({ nama: 'Ramadan hari ke-' + (n - r.awal + 1), jenis: 'event' });
    var leb = lebaranTahun(y);
    if (leb != null && n >= leb - 7 && n <= leb + 7 && !lib.some(function (x) { return x.nama === 'Idulfitri'; })) out.push({ nama: 'Musim mudik', jenis: 'event' });
    if (t.m === 8 && t.d < 17) out.push({ nama: 'Agustusan', jenis: 'event' });
    if (t.m === 12 && t.d === 31) out.push({ nama: 'Malam tahun baru', jenis: 'event' });
    if (t.m === 2 && t.d === 14) out.push({ nama: 'Valentine', jenis: 'event' });
    if (t.m === 10 && t.d === 1) out.push({ nama: 'Hari Kopi Sedunia', jenis: 'event' });
    if (t.m === t.d) out.push({ nama: 'Promo tanggal kembar ' + t.d + '.' + t.m, jenis: 'event' });
    if (t.dow === 6) out.push({ nama: 'Malam Minggu', jenis: 'suasana' });
    if (t.dow === 0) out.push({ nama: 'Car Free Day pagi', jenis: 'suasana' });
    if (t.d >= 25 || t.d <= 5) out.push({ nama: 'Tanggal muda', jenis: 'suasana' });
    else if (t.d >= 15 && t.d <= 24) out.push({ nama: 'Tanggal tua', jenis: 'suasana' });
    out.push({ nama: musim(t.m), jenis: 'musim' });
    return out;
  }

  function apakahLibur(n) {
    var t = tgl(n);
    return t.dow === 0 || (liburTahun(t.y)[n] || []).some(function (x) { return x.jenis === 'libur' || x.jenis === 'cuti'; });
  }

  /* hari raya berikutnya mulai hari n (untuk pengingat "x hari lagi") */
  function berikutnya(n, jumlah) {
    var hasil = [], sudah = {};
    for (var j = n; j < n + 400 && hasil.length < jumlah; j++) {
      var lib = liburTahun(tgl(j).y)[j] || [];
      lib.forEach(function (x) {
        if (x.jenis !== 'libur' || sudah[x.nama + tgl(j).y]) return;
        sudah[x.nama + tgl(j).y] = 1; hasil.push({ n: j, nama: x.nama, lagi: j - n });
      });
    }
    return hasil.slice(0, jumlah);
  }

  /* suasana Lebaran (0 = biasa, 1 = mendekati H-5..H-1 50%, 2 = Hari Lebaran 2 hari penuh!) */
  function statusLebaran(n) {
    var t = tgl(n), l = lebaranTahun(t.y);
    if (l == null) return 0;
    if (n === l || n === l + 1) return 2;
    if (n >= l - 5 && n <= l - 1) return 1;
    return 0;
  }
  function apakahNatal(n, menit) {
    var t = tgl(n), m = (menit == null ? 1200 : menit) % 1440;
    return (t.m === 12 && t.d === 24 && m >= 1020) || (t.m === 12 && t.d === 25);
  }
  function apakahMalamTahunBaru(n, menit) {
    var t = tgl(n), m = (menit == null ? 1320 : menit) % 1440;
    return (t.m === 12 && t.d === 31 && m >= 1080) || (t.m === 1 && t.d === 1 && m < 300);
  }
  /* Jadwal sholat astronomis nyata mengikuti deklinasi matahari, equation of time, dan koordinat (lat, lon) kriteria Kemenag RI (Subuh -20°, Isya -18°) */
  function jadwalSholat(n, lat, lon) {
    var t = tgl(n);
    var latDeg = (lat != null && !isNaN(lat)) ? lat : -0.0263;
    var lonDeg = (lon != null && !isNaN(lon)) ? lon : 109.3335;
    var tz = lonDeg >= 131 ? 9 : lonDeg >= 115.5 ? 8 : 7; /* WIB / WITA / WIT */
    var doy = Math.max(1, n - dn(t.y, 1, 1) + 1);
    var B = 2 * Math.PI * (doy - 81) / 365;
    var eot = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); /* menit */
    var decl = 23.45 * Math.sin(2 * Math.PI * (284 + doy) / 365) * RAD;
    var phi = latDeg * RAD;
    var noonMin = 720 + 4 * (tz * 15 - lonDeg) - eot;
    function sudutJam(altDeg) {
      var cosH = (Math.sin(altDeg * RAD) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
      cosH = Math.max(-0.99, Math.min(0.99, cosH));
      return (Math.acos(cosH) / RAD) * 4; /* menit */
    }
    var subuh = Math.round(noonMin - sudutJam(-20));
    var dzuhur = Math.round(noonMin + 2);
    var asharAlt = Math.atan(1 / (1 + Math.tan(Math.abs(phi - decl)))) / RAD;
    var ashar = Math.round(noonMin + sudutJam(asharAlt));
    var maghrib = Math.round(noonMin + sudutJam(-0.833) + 2);
    var isya = Math.round(noonMin + sudutJam(-18));
    return {
      subuh: subuh,
      dzuhur: dzuhur,
      ashar: ashar,
      maghrib: maghrib,
      isya: isya,
      tarawih: isya + 20,
      sahur: Math.max(165, subuh - 75)
    };
  }

  var api = { dn: dn, tgl: tgl, kunci: kunci, liburTahun: liburTahun, hariIni: hariIni, apakahLibur: apakahLibur,
    apakahRamadan: apakahRamadan, apakahMalamTakbiran: apakahMalamTakbiran, statusLebaran: statusLebaran, apakahNatal: apakahNatal, apakahMalamTahunBaru: apakahMalamTahunBaru, jadwalSholat: jadwalSholat, tanggalKembar: tanggalKembar, usia: usia,
    berikutnya: berikutnya, ramadanTahun: ramadanTahun, lebaranTahun: lebaranTahun, faseBulan: faseBulan, paskah: paskah };
  g.KK_KAL = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
