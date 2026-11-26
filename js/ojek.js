/* ojek.js — ngojek pakai motor sendiri: daftar aplikasi driver, online di pangkalan dekat kedai, terima order
   penumpang, barang, atau makanan. Hanya tap: ambil atau lewati. Tarif dan potongan aplikasi dari nyata.js;
   frekuensi order, tip, dan waktu tunggu adalah setelan. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, O = N.ojol;
  /* order per jam saat online (setelan) */
  var PERMINTAAN = [0.3, 0.3, 0.2, 0.2, 0.3, 0.8, 2.6, 3.2, 3, 1.6, 1.4, 2.2, 2.6, 2, 1.4, 1.6, 2.6, 3.2, 3, 2.4, 1.8, 1.4, 1, 0.6];
  var CEPAT_TRIP = 8; /* waktu 8x saat narik */

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function kota(S) {
    if (g.KK_DIRI && g.KK_DIRI.kota) return g.KK_DIRI.kota(S);
    return N.kota.filter(function (k) { return k.id === S.kota; })[0] || N.kota[0];
  }
  function waktu(S) { return S.hari * 1440 + S.menit; }
  function platform(id) { return O.platform.filter(function (p) { return p.id === id; })[0]; }

  function siapkan(S) {
    if (!S.ojek) S.ojek = { daftar: {}, platform: null, mode: 'motor', online: false, dompet: 0, tawaran: null, trip: null, berikut: 0, tolak: 0, mult: 1, jauhHariIni: 0, jatahJauh: 2, pos: { x: 0, y: 0 }, hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0 } };
    if (!S.ojek.mode) S.ojek.mode = 'motor';
    if (typeof S.ojek.mult !== 'number' || isNaN(S.ojek.mult)) S.ojek.mult = 1;
    if (S.ojek.jauhHariIni == null) S.ojek.jauhHariIni = 0;
    if (S.ojek.jatahJauh == null) S.ojek.jatahJauh = 1 + Math.floor(Math.random() * 4);
    if (S.ojek.jauhCarHariIni == null) S.ojek.jauhCarHariIni = 0;
    if (S.ojek.jatahJauhCar == null) S.ojek.jatahJauhCar = 1 + Math.floor(Math.random() * 5);
    if (!S.ojek.pos) S.ojek.pos = { x: 0, y: 0 };
    return S;
  }
  function jarakRumah(S) {
    var p = (S && S.ojek && S.ojek.pos) || { x: 0, y: 0 };
    return Math.round(Math.hypot(p.x || 0, p.y || 0) * 10) / 10;
  }
  function resetPos(S, x, y) {
    if (!S.ojek) return;
    S.ojek.pos = { x: x || 0, y: y || 0 };
  }
  function aktif(S, pid) { var d = S.ojek.daftar[pid]; return !!d && d.status === 'aktif'; }
  function daftar(S, pid) {
    if (!g.KK_MOTOR.punya(S)) return 'Daftar driver butuh motor sendiri, SIM C, dan STNK. Beli motor dulu.';
    if (S.ojek.daftar[pid]) return 'Sudah mendaftar di ' + platform(pid).nama + '.';
    S.ojek.daftar[pid] = { status: 'proses', aktifPada: S.hari + O.verifikasiHari };
    return true;
  }
  function putus(S, pid) {
    var p = platform(pid);
    if (!p || !S.ojek.daftar[pid]) return 'Belum terdaftar sebagai mitra ' + (p ? p.nama : pid) + '.';
    if (S.ojek.online && S.ojek.platform === pid) offline(S, true);
    delete S.ojek.daftar[pid];
    if (S.ojek.platform === pid) {
      var sisa = O.platform.filter(function (x) { return aktif(S, x.id); })[0];
      S.ojek.platform = sisa ? sisa.id : null;
    }
    return true;
  }

  /* tarif standar dunia nyata per zona, lalu dikali pengatur tarif pemain (S.ojek.mult) */
  function tarifStandar(S, km) {
    var z = O.zona[kota(S).zona || 1];
    var t = km <= z.kmMinimal ? z.minimal : z.minimal + (km - z.kmMinimal) * z.perKm;
    return Math.round(t / 500) * 500;
  }
  function tarif(S, km) {
    var mult = (S.ojek && S.ojek.mult) || 1;
    return Math.round(tarifStandar(S, km) * mult / 500) * 500;
  }
  function ubahTarif(S, delta) {
    siapkan(S);
    S.ojek.mult = Math.round(Math.max(0.7, Math.min(1.6, (S.ojek.mult || 1) + delta)) * 100) / 100;
    return true;
  }
  function bisaOnline(S, mode) {
    if (mode === 'mobil') {
      var c = S.mobil;
      if (!c) return 'Belum punya mobil untuk GoCar/GrabCar.';
      if (g.KK_MOBIL && g.KK_MOBIL.pikap(S)) return 'Mobil pikap tidak bisa untuk GoCar/GrabCar.';
      if (!g.KK_MOBIL.cukup(S, 6)) return c.bbm === 'listrik' ? 'Baterai mobil listrik hampir habis. Cas dulu.' : 'Bensin mobil hampir habis. Isi dulu.';
      if (S.diri && S.diri.stamina < 15) return 'Stamina terlalu rendah untuk narik. Istirahat dulu.';
      return null;
    }
    var m = S.motor;
    if (!m) return 'Belum punya motor.';
    if (!O.platform.some(function (p) { return aktif(S, p.id); })) return 'Akun driver belum aktif.';
    if (!g.KK_MOTOR.cukup(S, 6)) return m.bbm === 'listrik' ? 'Baterai motor hampir habis.' : 'Bensin motor hampir habis. Isi dulu.';
    if (S.diri && S.diri.stamina < 15) return 'Stamina terlalu rendah untuk narik. Istirahat dulu.';
    return null;
  }
  function online(S, pid, mode) {
    var md = mode === 'mobil' ? 'mobil' : 'motor';
    var e = bisaOnline(S, md); if (e) return e;
    if (md === 'mobil') { pid = pid === 'grab' ? 'grab' : 'gojek'; }
    else if (!aktif(S, pid)) { pid = O.platform.filter(function (p) { return aktif(S, p.id); })[0].id; }
    var o = S.ojek; o.online = true; o.mode = md; o.platform = pid; o.tawaran = null; o.trip = null;
    o.berikut = waktu(S) + jeda(S);
    return true;
  }
  function offline(S, paksa) {
    var o = S.ojek;
    if (o.trip && !paksa) return 'Selesaikan order dulu atau tekan Batalkan order.';
    if (o.trip) { o.trip = null; o.tolak++; }
    o.online = false; o.tawaran = null; return true;
  }
  function batalTrip(S) {
    var o = S.ojek;
    if (!o.trip) return 'Tidak ada order yang sedang berjalan.';
    o.trip = null; o.tolak++; o.berikut = waktu(S) + jeda(S);
    return true;
  }

  function laju(S) {
    var jam = Math.floor(S.menit / 60) % 24, r = PERMINTAAN[jam];
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) r *= 1.6;
    if (KAL.apakahLibur(S.hari) || KAL.tgl(S.hari).dow === 0) r *= 0.85;
    if ((kota(S).zona || 1) === 2) r *= 1.2;
    r *= g.KK_DIRI.faktorPromo(S); /* promo: +50–80% bila aktif, +100% selama Ramadan */
    var mult = (S.ojek && S.ojek.mult) || 1, isCar = S.ojek && S.ojek.mode === 'mobil';
    var nyaman = (g.KK_RUTE && g.KK_RUTE.nyaman) ? g.KK_RUTE.nyaman(isCar ? S.mobil : S.motor, isCar ? 'mobil' : 'motor') : 1;
    r *= Math.max(0.25, Math.min(1.6, Math.pow(nyaman / mult, 1.5)));
    return r * Math.max(0.6, 1 - S.ojek.tolak * 0.05);
  }
  function jeda(S) { return Math.max(3, -Math.log(1 - Math.random()) * 60 / laju(S)); }

  function buatTawaran(S) {
    var jam = Math.floor(S.menit / 60) % 24, makan = (jam >= 11 && jam < 14) || (jam >= 18 && jam < 21);
    var isCar = S.ojek && S.ojek.mode === 'mobil';
    var r = Math.random(), jenis = isCar ? 'penumpang' : (r < (makan ? 0.45 : 0.15) ? 'makanan' : r < (makan ? 0.6 : 0.35) ? 'barang' : 'penumpang');
    /* GoCar: dalam kota 2-25 km, dan 1-5 kali sehari muncul order jarak jauh hingga 300 km; Ojol motor: 1-10 km + 1-4x 11-30 km */
    var bisaJauh = false, km;
    if (isCar) {
      bisaJauh = (S.ojek.jauhCarHariIni || 0) < (S.ojek.jatahJauhCar || 3) && Math.random() < 0.36;
      if (bisaJauh) {
        S.ojek.jauhCarHariIni = (S.ojek.jauhCarHariIni || 0) + 1;
        km = Math.round((35 + Math.random() * 265) * 10) / 10; /* 35 s/d 300 km */
      } else {
        km = Math.round((2 + Math.pow(Math.random(), 1.25) * 23) * 10) / 10; /* 2 s/d 25 km */
      }
    } else {
      bisaJauh = (S.ojek.jauhHariIni || 0) < (S.ojek.jatahJauh || 2) && Math.random() < 0.28;
      if (bisaJauh) {
        S.ojek.jauhHariIni = (S.ojek.jauhHariIni || 0) + 1;
        km = Math.round((11 + Math.random() * 19) * 10) / 10; /* 11 s/d 30 km */
      } else {
        km = Math.round((1 + Math.pow(Math.random(), 1.35) * 9) * 10) / 10; /* 1 s/d 10 km */
      }
    }
    var jemput = Math.round((0.3 + Math.random() * 1.8) * 10) / 10;
    var arah = Math.random() * Math.PI * 2;
    var dx = Math.round(km * Math.cos(arah) * 100) / 100;
    var dy = Math.round(km * Math.sin(arah) * 100) / 100;
    var p = platform(S.ojek.platform || 'gojek');
    var pengaliMbl = (isCar && g.KK_RUTE && g.KK_RUTE.pengaliKelasMobil) ? g.KK_RUTE.pengaliKelasMobil(S.mobil) : 1;
    var kaliCar = isCar ? (((N.bisnisMobil && N.bisnisMobil.kaliTarifCar) || 2.3) * pengaliMbl) : 1;
    var pot = isCar ? ((N.bisnisMobil && N.bisnisMobil.potonganCar) || 0.1) : O.potongan;
    var t = Math.round(tarif(S, km) * kaliCar / 500) * 500;
    var sufLayanan = (isCar && S.mobil) ? (S.mobil.kelas === 'sultan' ? ' VIP Sultan' : S.mobil.kelas === 'mewah' ? ' Luxe' : S.mobil.harga >= 300e6 ? ' Comfort' : '') : '';
    var lay = isCar ? ((p.id === 'grab' ? 'GrabCar' : 'GoCar') + sufLayanan) : p.layanan[jenis];
    var tipJauh = isCar && bisaJauh ? (Math.random() < 0.45 ? (15 + Math.floor(Math.random() * 65)) * 1000 : 0)
      : (Math.random() < (bisaJauh ? 0.25 : 0.12) ? (2 + Math.floor(Math.random() * (bisaJauh ? 8 : 4))) * 1000 : 0);
    return { jenis: jenis, layanan: lay, mobil: isCar, km: km, jemput: jemput, dx: dx, dy: dy, jarakJauh: bisaJauh, tarif: t, bersih: Math.round(t * (1 - pot)),
      tunai: jenis === 'penumpang' && Math.random() < O.tunai, nama: N.namaOrang[Math.floor(Math.random() * N.namaOrang.length)],
      tip: tipJauh };
  }
  function ambil(S) {
    var o = S.ojek, x = o.tawaran; if (!x) return 'Order sudah tidak ada.';
    if (S.diri && S.diri.stamina < 10) return 'Kamu terlalu capek untuk menerima order. Istirahat sebentar dulu.';
    var km = x.jemput + x.km, isCar = o.mode === 'mobil';
    var kend = isCar ? g.KK_MOBIL : g.KK_MOTOR;
    if (!kend.cukup(S, km)) return isCar ? 'Bensin / baterai mobil tidak cukup untuk order ini.' : 'Bensin tidak cukup untuk order ini.';
    var r = kend.jalan(S, km, 1);
    if (!r || !r.ok) return (r && r.alasan) || 'Kendaraan tidak siap.';
    var tunggu = x.jenis === 'makanan' ? 8 + Math.floor(Math.random() * 10) : x.jenis === 'barang' ? 4 : 2;
    var menitJemput = Math.round(r.menit * x.jemput / km) + tunggu, total = r.menit + tunggu;
    o.trip = { x: x, total: total, jemput: menitJemput, jalan: 0, kabar: r.kabar };
    o.tawaran = null;
    return true;
  }
  function lewati(S) { var o = S.ojek; o.tawaran = null; o.tolak++; o.berikut = waktu(S) + jeda(S); return true; }
  function kedaluwarsa(S) { var o = S.ojek; o.tawaran = null; o.berikut = waktu(S) + jeda(S); }

  function selesai(S) {
    var o = S.ojek, tr = o.trip, x = tr.x, kabar = tr.kabar.slice(), dapat = x.bersih + (x.tip || 0);
    var caraTeks = '';
    if (x.tunai) {
      /* order bayar tunai: uang penumpang masuk langsung ke Dompet Pribadi, potongan aplikasi ditarik dari saldo dompet aplikasi (atau diselisihkan jika belum cukup) */
      var komisi = Math.max(0, (x.tarif || x.bersih) - x.bersih);
      S.uang = S.uang || { kecil: 0, besar: 0, dompet: 0 };
      if (o.dompet >= komisi) {
        o.dompet -= komisi;
        S.uang.dompet = (S.uang.dompet || 0) + (x.tarif || x.bersih) + (x.tip || 0);
      } else {
        S.uang.dompet = (S.uang.dompet || 0) + dapat;
      }
      caraTeks = ' (Tunai → Dompet)';
    } else {
      o.dompet += dapat;
      caraTeks = ' (Non-tunai → Saldo Driver)';
    }
    if (x.tip) kabar.push(x.nama + ' memberi tip ' + rp(x.tip) + '.');
    o.pos = o.pos || { x: 0, y: 0 };
    o.pos.x += (x.dx != null ? x.dx : x.km);
    o.pos.y += (x.dy != null ? x.dy : 0);
    o.hariIni.trip++; o.hariIni.bersih += dapat; o.total.trip++; o.total.bersih += dapat;
    if (o.mode === 'mobil') {
      if (S.mobil) S.mobil.totalHasil = (S.mobil.totalHasil || 0) + dapat;
      S.hariIni.mobil = (S.hariIni.mobil || 0) + dapat;
    } else {
      if (S.motor) S.motor.totalHasil = (S.motor.totalHasil || 0) + dapat;
      S.hariIni.ojek = (S.hariIni.ojek || 0) + dapat;
    }
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + dapat;
    kabar.unshift(x.layanan + ' selesai, ' + x.km.toLocaleString('id-ID') + ' km. Standby ' + jarakRumah(S).toLocaleString('id-ID') + ' km dari rumah. +' + rp(dapat) + caraTeks + '.');
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
    if (o.trip) return { status: o.trip.jalan < o.trip.jemput ? 'jemput' : 'antar', mode: o.mode || 'motor', jenis: o.trip.x.jenis, kemajuan: Math.min(1, o.trip.jalan / o.trip.total), x: o.trip.x };
    return { status: 'standby', mode: o.mode || 'motor' };
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
  function gantiHari(S, nLama, nBaru, lanjut) {
    var o = S.ojek, kabar = [], on = o.online, tw = o.tawaran, tr = o.trip, ps = o.pos;
    O.platform.forEach(function (p) { var d = o.daftar[p.id]; if (d && d.status === 'proses' && nBaru >= d.aktifPada) { d.status = 'aktif'; kabar.push('Akun ' + p.app + ' sudah aktif. Bisa mulai narik.'); } });
    if (o.hariIni.trip) kabar.push('Kemarin narik ' + o.hariIni.trip + ' order, pendapatan bersih ' + rp(o.hariIni.bersih) + '.');
    o.hariIni = { trip: 0, bersih: 0 }; o.tolak = 0; o.jauhHariIni = 0; o.jatahJauh = 1 + Math.floor(Math.random() * 4); o.jauhCarHariIni = 0; o.jatahJauhCar = 1 + Math.floor(Math.random() * 5); o.online = false; o.tawaran = null; o.trip = null; o.pos = { x: 0, y: 0 };
    if (lanjut) { o.online = on; o.tawaran = tw; o.trip = tr; o.pos = ps; }
    return kabar;
  }

  g.KK_OJEK = { siapkan: siapkan, daftar: daftar, putus: putus, aktif: aktif, tarif: tarif, tarifStandar: tarifStandar, ubahTarif: ubahTarif, bisaOnline: bisaOnline, online: online, offline: offline, batalTrip: batalTrip, buatTawaran: buatTawaran, ambil: ambil, lewati: lewati,
    kedaluwarsa: kedaluwarsa, jalan: jalan, fase: fase, tarikSaldo: tarikSaldo, gantiHari: gantiHari, platform: platform, jarakRumah: jarakRumah, resetPos: resetPos, CEPAT_TRIP: CEPAT_TRIP };
})(window);
