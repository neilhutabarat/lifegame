/* ojek.js — ngojek pakai motor sendiri: daftar aplikasi driver, online di pangkalan dekat kedai, terima order
   penumpang, barang, atau makanan. Hanya tap: ambil atau lewati. Tarif dan potongan aplikasi dari nyata.js;
   frekuensi order, tip, dan waktu tunggu adalah setelan. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, O = N.ojol;
  /* order per jam saat online (setelan) */
  var PERMINTAAN = [0.3, 0.3, 0.2, 0.2, 0.3, 0.8, 2.6, 3.2, 3, 1.6, 1.4, 2.2, 2.6, 2, 1.4, 1.6, 2.6, 3.2, 3, 2.4, 1.8, 1.4, 1, 0.6];
  var CEPAT_TRIP = 6; /* waktu berjalan 6x lebih cepat saat mengantar (setelan) */

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function kota(S) { return N.kota.filter(function (k) { return k.id === S.kota; })[0]; }
  function waktu(S) { return S.hari * 1440 + S.menit; }
  function platform(id) { return O.platform.filter(function (p) { return p.id === id; })[0]; }

  function siapkan(S) {
    if (!S.ojek) S.ojek = { daftar: {}, platform: null, online: false, dompet: 0, tawaran: null, trip: null, berikut: 0, tolak: 0, hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0 } };
    return S;
  }
  function aktif(S, pid) { var d = S.ojek.daftar[pid]; return !!d && d.status === 'aktif'; }
  function daftar(S, pid) {
    if (!g.KK_MOTOR.punya(S)) return 'Daftar driver butuh motor sendiri, SIM C, dan STNK. Beli motor dulu.';
    if (S.ojek.daftar[pid]) return 'Sudah mendaftar di ' + platform(pid).nama + '.';
    S.ojek.daftar[pid] = { status: 'proses', aktifPada: S.hari + O.verifikasiHari };
    return true;
  }

  /* tarif per zona: minimal untuk beberapa km pertama, lalu per km */
  function tarif(S, km) {
    var z = O.zona[kota(S).zona || 1];
    var t = km <= z.kmMinimal ? z.minimal : z.minimal + (km - z.kmMinimal) * z.perKm;
    return Math.round(t / 500) * 500;
  }
  function bisaOnline(S) {
    var m = S.motor;
    if (!m) return 'Belum punya motor.';
    if (!O.platform.some(function (p) { return aktif(S, p.id); })) return 'Akun driver belum aktif.';
    if (!g.KK_MOTOR.cukup(S, 6)) return m.bbm === 'listrik' ? 'Baterai motor hampir habis.' : 'Bensin motor hampir habis. Isi dulu.';
    if (S.diri && S.diri.stamina < 15) return 'Stamina terlalu rendah untuk narik. Istirahat dulu.';
    return null;
  }
  function online(S, pid) {
    var e = bisaOnline(S); if (e) return e;
    if (!aktif(S, pid)) pid = O.platform.filter(function (p) { return aktif(S, p.id); })[0].id;
    var o = S.ojek; o.online = true; o.platform = pid; o.tawaran = null; o.trip = null;
    o.berikut = waktu(S) + jeda(S);
    return true;
  }
  function offline(S) { var o = S.ojek; if (o.trip) return 'Selesaikan order dulu.'; o.online = false; o.tawaran = null; return true; }

  function laju(S) {
    var jam = Math.floor(S.menit / 60) % 24, r = PERMINTAAN[jam];
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) r *= 1.6;
    if (KAL.apakahLibur(S.hari) || KAL.tgl(S.hari).dow === 0) r *= 0.85;
    if ((kota(S).zona || 1) === 2) r *= 1.2;
    if (S.promoAktif) r *= 1.3 + Math.random() * 0.2; /* promo +30% sampai +50% */
    return r * Math.max(0.6, 1 - S.ojek.tolak * 0.05);
  }
  function jeda(S) { return Math.max(3, -Math.log(1 - Math.random()) * 60 / laju(S)); }

  function buatTawaran(S) {
    var jam = Math.floor(S.menit / 60) % 24, makan = (jam >= 11 && jam < 14) || (jam >= 18 && jam < 21);
    var r = Math.random(), jenis = r < (makan ? 0.45 : 0.15) ? 'makanan' : r < (makan ? 0.6 : 0.35) ? 'barang' : 'penumpang';
    var km = Math.round((1.5 + Math.pow(Math.random(), 1.6) * 10) * 10) / 10, jemput = Math.round((0.3 + Math.random() * 2) * 10) / 10;
    var t = tarif(S, km), p = platform(S.ojek.platform);
    return { jenis: jenis, layanan: p.layanan[jenis], km: km, jemput: jemput, tarif: t, bersih: Math.round(t * (1 - O.potongan)),
      tunai: jenis === 'penumpang' && Math.random() < O.tunai, nama: N.namaOrang[Math.floor(Math.random() * N.namaOrang.length)],
      tip: Math.random() < 0.12 ? (2 + Math.floor(Math.random() * 4)) * 1000 : 0 };
  }
  function ambil(S) {
    var o = S.ojek, x = o.tawaran; if (!x) return 'Order sudah tidak ada.';
    var km = x.jemput + x.km;
    if (!g.KK_MOTOR.cukup(S, km)) return 'Bensin tidak cukup untuk order ini.';
    var r = g.KK_MOTOR.jalan(S, km, 1);
    var tunggu = x.jenis === 'makanan' ? 8 + Math.floor(Math.random() * 10) : x.jenis === 'barang' ? 4 : 2;
    var menitJemput = Math.round(r.menit * x.jemput / km) + tunggu, total = r.menit + tunggu;
    o.trip = { x: x, total: total, jemput: menitJemput, jalan: 0, kabar: r.kabar };
    o.tawaran = null;
    return true;
  }
  function lewati(S) { var o = S.ojek; o.tawaran = null; o.tolak++; o.berikut = waktu(S) + jeda(S); return true; }
  function kedaluwarsa(S) { var o = S.ojek; o.tawaran = null; o.berikut = waktu(S) + jeda(S); }

  function selesai(S) {
    var o = S.ojek, tr = o.trip, x = tr.x, kabar = tr.kabar.slice(), dapat = x.bersih;
    o.dompet += x.bersih;
    if (x.tip) { o.dompet += x.tip; dapat += x.tip; kabar.push(x.nama + ' memberi tip ' + rp(x.tip) + '.'); }
    o.hariIni.trip++; o.hariIni.bersih += dapat; o.total.trip++; o.total.bersih += dapat;
    S.hariIni.ojek = (S.hariIni.ojek || 0) + dapat;
    kabar.unshift(x.layanan + ' selesai, ' + x.km.toLocaleString('id-ID') + ' km. Masuk saldo ojek +' + rp(dapat) + '.');
    o.trip = null; o.berikut = waktu(S) + jeda(S);
    return kabar;
  }

  /* dipanggil tiap langkah waktu saat online. Hasil: kabar (teks) */
  function jalan(S, dMenit) {
    var o = S.ojek; if (!o.online) return [];
    if (o.trip) {
      o.trip.jalan += dMenit;
      if (o.trip.jalan >= o.trip.total) return selesai(S);
      return [];
    }
    if (!o.tawaran && waktu(S) >= o.berikut) o.tawaran = buatTawaran(S);
    return [];
  }
  function fase(S) {
    var o = S.ojek; if (!o || !o.online) return null;
    if (o.trip) return { status: o.trip.jalan < o.trip.jemput ? 'jemput' : 'antar', jenis: o.trip.x.jenis, kemajuan: Math.min(1, o.trip.jalan / o.trip.total), x: o.trip.x };
    return { status: 'standby' };
  }
  /* tarik saldo ojek: 'bank' (ke rekening), 'ewallet' (ke saldo e-wallet/QRIS), atau 'dompet' (tarik ATM ke dompet pribadi) */
  function tarikSaldo(S, tujuan, qrisId) {
    var o = S.ojek; if (o.dompet <= 0) return 'Saldo ojek kosong.';
    var j = o.dompet;
    if (tujuan === 'ewallet') {
      var id = qrisId || Object.keys(S.merchants || {})[0];
      if (!id || !S.merchants[id]) return 'Belum ada e-wallet/QRIS terpasang.';
      o.dompet = 0; S.merchants[id].tersedia += j;
      return { ok: true, jml: j, ket: 'masuk e-wallet ' + g.KK_UANG.qrisData(id).nama };
    }
    if (tujuan === 'dompet') {
      o.dompet = 0; S.uang.dompet = (S.uang.dompet || 0) + j;
      return { ok: true, jml: j, ket: 'ditarik lewat ATM ke dompet pribadi' };
    }
    o.dompet = 0; S.bank.saldo += j; g.KK_MOTOR.catatBank(S, 'Tarik saldo ' + (platform(o.platform || 'gojek').app), j);
    return { ok: true, jml: j, ket: 'masuk rekening ' + g.KK_UANG.bankIni(S).nama };
  }
  function gantiHari(S, nLama, nBaru) {
    var o = S.ojek, kabar = [];
    O.platform.forEach(function (p) { var d = o.daftar[p.id]; if (d && d.status === 'proses' && nBaru >= d.aktifPada) { d.status = 'aktif'; kabar.push('Akun ' + p.app + ' sudah aktif. Bisa mulai narik.'); } });
    if (o.hariIni.trip) kabar.push('Kemarin narik ' + o.hariIni.trip + ' order, pendapatan bersih ' + rp(o.hariIni.bersih) + '.');
    o.hariIni = { trip: 0, bersih: 0 }; o.tolak = 0; o.online = false; o.tawaran = null; o.trip = null;
    return kabar;
  }

  g.KK_OJEK = { siapkan: siapkan, daftar: daftar, aktif: aktif, tarif: tarif, bisaOnline: bisaOnline, online: online, offline: offline, ambil: ambil, lewati: lewati,
    kedaluwarsa: kedaluwarsa, jalan: jalan, fase: fase, tarikSaldo: tarikSaldo, gantiHari: gantiHari, platform: platform, CEPAT_TRIP: CEPAT_TRIP };
})(window);
