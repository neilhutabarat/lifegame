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
    if (typeof S.ojek.rating !== 'number' || isNaN(S.ojek.rating)) S.ojek.rating = 4.85;
    if (typeof S.ojek.ratingCount !== 'number') S.ojek.ratingCount = 0;
    if (!S.ojek.ulasan) S.ojek.ulasan = [];
    return S;
  }
  /* Status arus mudik / arus balik Lebaran: 'mudik' (H-7..H-1), 'balik' (H+2..H+7), atau '' */
  function statusMudik(n) {
    if (!KAL || !KAL.liburTahun) return '';
    var y = KAL.tgl(n).y, peta = KAL.liburTahun(y), leb = null, ks = Object.keys(peta);
    for (var i = 0; i < ks.length; i++) {
      if (peta[ks[i]].some(function (x) { return x.nama === 'Idulfitri' && x.jenis === 'libur'; })) {
        var dnL = +ks[i];
        if (leb === null || dnL < leb) leb = dnL;
      }
    }
    if (leb === null) return '';
    if (n >= leb - 7 && n <= leb - 1) return 'mudik';
    if (n >= leb + 2 && n <= leb + 7) return 'balik';
    return '';
  }
  function lokasiRumah(S) {
    if (!S) return null;
    var W = g.KK_WILAYAH;
    if (S.rumah && S.rumah.wilayah && S.rumah.wilayah.kabId) {
      var punyaWil = !W || (W.kab ? !!W.kab(S.rumah.wilayah.kabId) : (W.kalbar && !!W.kalbar[S.rumah.wilayah.kabId]));
      if (punyaWil || S.rumah.wilayah.kabId === S.kota) return S.rumah.wilayah;
    }
    var t0 = W ? W.titikAwal(S.kota) : { kabId: S.kota || 'pontianak', kabNama: kota(S).nama, kecId: 'pusat', kecNama: kota(S).nama, desa: kota(S).nama, lat: null, lon: null };
    if (S.rumah) S.rumah.wilayah = t0;
    return t0;
  }
  function lokasiSekarang(S) {
    if (!S) return null;
    var rm = lokasiRumah(S);
    if (S.diri && S.diri.posisi === 'kos') return rm;
    if (S.ojek && S.ojek.lokasi && S.ojek.lokasi.kecNama) return S.ojek.lokasi;
    if (S.ojek) S.ojek.lokasi = rm;
    return rm;
  }
  function jarakRumah(S) {
    if (S && S.diri && S.diri.posisi === 'kos') return 0;
    var rm = lokasiRumah(S), sk = lokasiSekarang(S);
    if (g.KK_WILAYAH && rm && sk && rm.lat != null && sk.lat != null) {
      return g.KK_WILAYAH.jarakKm(rm, sk);
    }
    var p = (S && S.ojek && S.ojek.pos) || { x: 0, y: 0 };
    return Math.round(Math.hypot(p.x || 0, p.y || 0) * 10) / 10;
  }
  function resetPos(S, x, y) {
    if (!S.ojek) return;
    S.ojek.pos = { x: x || 0, y: y || 0 };
    if (!x && !y) S.ojek.lokasi = lokasiRumah(S);
  }
  function aktif(S, pid) { var d = S.ojek.daftar[pid]; return !!d && d.status === 'aktif'; }
  function daftar(S, pid) {
    if (!g.KK_MOTOR.punya(S)) return 'Daftar driver butuh motor sendiri, SIM C, dan STNK. Beli motor dulu di Dealer Motor atau Agen Bekas.';
    if (S.ojek.daftar[pid] && S.ojek.daftar[pid].status === 'aktif') return 'Sudah aktif sebagai mitra ' + platform(pid).nama + '.';
    /* verifikasi e-KYC digital langsung aktif hari itu juga agar pemain bisa langsung bekerja */
    S.ojek.daftar[pid] = { status: 'aktif', aktifPada: S.hari };
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
    if (S.eko && S.hari <= (S.eko.suspendOjolSampai || -1)) return 'Akun driver sedang kena suspend sementara karena viral negatif! Buat klarifikasi di APK Sosmed atau tunggu besok.';
    if (mode === 'mobil') {
      var c = S.mobil;
      if (!c) return 'Belum punya mobil untuk GoCar/GrabCar.';
      if (c.mogokAir) return 'Mobil sedang mogok kena banjir (Water Hammer)! Kuras mesin dulu di Garasi.';
      if (g.KK_MOBIL && g.KK_MOBIL.disewakan && g.KK_MOBIL.disewakan(S)) return 'Mobil utama sedang disewakan di Sewa Aset. Hentikan sewa dulu atau ganti mobil utama di Garasi.';
      if (g.KK_MOBIL && g.KK_MOBIL.pikap(S)) return 'Mobil pikap tidak bisa untuk GoCar/GrabCar.';
      if (!g.KK_MOBIL.cukup(S, 6)) return c.bbm === 'listrik' ? 'Baterai mobil listrik hampir habis. Cas dulu.' : 'Bensin mobil hampir habis. Isi dulu.';
      if (S.diri && S.diri.stamina < 15) return 'Stamina terlalu rendah untuk narik. Istirahat dulu.';
      return null;
    }
    var m = S.motor;
    if (!m) return 'Belum punya motor.';
    if (m.mogokAir) return 'Motor sedang mogok kemasukan air banjir (Water Hammer)! Kuras mesin dulu di Garasi.';
    if (g.KK_MOTOR && g.KK_MOTOR.disewakan && g.KK_MOTOR.disewakan(S)) return 'Motor utama sedang disewakan di Sewa Aset. Hentikan sewa dulu atau ganti motor utama di Garasi.';
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
    if (g.KK_WILAYAH && g.KK_WILAYAH.faktorPenduduk) r *= g.KK_WILAYAH.faktorPenduduk(S); /* populasi kota/kabupaten memengaruhi volume order */
    if (g.KK_EKO && g.KK_EKO.infoSinyal) r *= g.KK_EKO.infoSinyal(S).faktorOjol; /* kekuatan sinyal provider SIM di kota vs desa */
    if (g.KK_REAL && g.KK_REAL.faktorEventBudaya) r *= g.KK_REAL.faktorEventBudaya(S); /* event budaya: Cap Go Meh Singkawang +250% dll */
    r *= g.KK_DIRI.faktorPromo(S); /* promo: +50–80% bila aktif, +100% selama Ramadan */
    var mudik = statusMudik(S.hari);
    if (mudik === 'mudik') r *= 2.1;
    else if (mudik === 'balik') r *= 1.85;
    if ((S.ojek.rating || 4.85) >= 4.75) r *= 1.18; /* rating tinggi buka order prioritas */
    var efHp = (g.KK_DIRI && g.KK_DIRI.efekHp) ? g.KK_DIRI.efekHp(S) : null;
    if (efHp && efHp.gpsBonus > 0) r *= (1 + efHp.gpsBonus); /* sinyal & GPS flagship bikin order masuk lebih gacor */
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
    var bisaJauh = false, minKm, maxKm;
    if (isCar) {
      bisaJauh = (S.ojek.jauhCarHariIni || 0) < (S.ojek.jatahJauhCar || 3) && Math.random() < 0.36;
      if (bisaJauh) { S.ojek.jauhCarHariIni = (S.ojek.jauhCarHariIni || 0) + 1; minKm = 35; maxKm = 280; }
      else { minKm = 2; maxKm = 25; }
    } else {
      bisaJauh = (S.ojek.jauhHariIni || 0) < (S.ojek.jatahJauh || 2) && Math.random() < 0.28;
      if (bisaJauh) { S.ojek.jauhHariIni = (S.ojek.jauhHariIni || 0) + 1; minKm = 11; maxKm = 35; }
      else { minKm = 1; maxKm = 10; }
    }
    var asalT = lokasiSekarang(S);
    S.ojek.riwayatDesa = S.ojek.riwayatDesa || [];
    var tj = (g.KK_WILAYAH && g.KK_WILAYAH.pilihTujuan) ? g.KK_WILAYAH.pilihTujuan(asalT, minKm, maxKm, S.ojek.riwayatDesa) : null;
    var km = tj ? tj.km : Math.round((minKm + Math.random() * (maxKm - minKm)) * 10) / 10;
    var tujuanTitik = tj ? tj.titik : null;
    var medan = (tj && tj.medan) || (g.KK_WILAYAH && g.KK_WILAYAH.medanJalan ? g.KK_WILAYAH.medanJalan(asalT, tujuanTitik) : null);
    var tujuanLabel = tujuanTitik ? (tujuanTitik.desa + (tujuanTitik.kecNama && tujuanTitik.kecNama !== tujuanTitik.desa ? ', ' + tujuanTitik.kecNama : '')) : '';
    var jemput = Math.round((0.3 + Math.random() * 1.6) * 10) / 10;
    var arah = Math.random() * Math.PI * 2;
    var dx = Math.round(km * Math.cos(arah) * 100) / 100;
    var dy = Math.round(km * Math.sin(arah) * 100) / 100;
    var p = platform(S.ojek.platform || 'gojek');
    var pengaliMbl = (isCar && g.KK_RUTE && g.KK_RUTE.pengaliKelasMobil) ? g.KK_RUTE.pengaliKelasMobil(S.mobil) : 1;
    var kaliCar = isCar ? (((N.bisnisMobil && N.bisnisMobil.kaliTarifCar) || 2.3) * pengaliMbl) : 1;
    var pot = isCar ? ((N.bisnisMobil && N.bisnisMobil.potonganCar) || 0.1) : O.potongan;
    var tuslah = statusMudik(S.hari) ? 1.3 : 1; /* tuslah Lebaran / Mudik +30% */
    var efHpT = (g.KK_DIRI && g.KK_DIRI.efekHp) ? g.KK_DIRI.efekHp(S) : null;
    var gpsB = efHpT ? (efHpT.gpsBonus || 0) : 0;
    var prioritas = (S.ojek.rating || 4.85) >= 4.75 && Math.random() < (0.35 + gpsB * 0.45);
    var t = Math.round(tarif(S, km) * kaliCar * tuslah * (prioritas ? 1.15 : 1) / 500) * 500;
    var sufLayanan = (isCar && S.mobil) ? (S.mobil.kelas === 'sultan' ? ' VIP Sultan' : S.mobil.kelas === 'mewah' ? ' Luxe' : S.mobil.harga >= 300e6 ? ' Comfort' : '') : (prioritas ? ' Prioritas' : '');
    var lay = isCar ? ((p.id === 'grab' ? 'GrabCar' : 'GoCar') + sufLayanan) : (p.layanan[jenis] + sufLayanan);
    var tipJauh = isCar && bisaJauh ? (Math.random() < (0.45 + gpsB * 0.35) ? (15 + Math.floor(Math.random() * 65)) * 1000 : 0)
      : (Math.random() < ((prioritas ? 0.38 : bisaJauh ? 0.25 : 0.12) + gpsB * 0.25) ? (2 + Math.floor(Math.random() * (bisaJauh || prioritas ? 10 : 4))) * 1000 : 0);
    return { jenis: jenis, layanan: lay, mobil: isCar, km: km, jemput: jemput, dx: dx, dy: dy, tujuanTitik: tujuanTitik, tujuanLabel: tujuanLabel, medan: medan, jarakJauh: bisaJauh, tarif: t, bersih: Math.round(t * (1 - pot)),
      tunai: jenis === 'penumpang' && Math.random() < O.tunai, nama: (g.KK_NAMA && g.KK_NAMA.acak) ? g.KK_NAMA.acak(S) : N.namaOrang[Math.floor(Math.random() * N.namaOrang.length)],
      tip: tipJauh };
  }
  function ambil(S) {
    var o = S.ojek, x = o.tawaran; if (!x) return 'Order sudah tidak ada.';
    if (S.diri && S.diri.stamina < 10) return 'Kamu terlalu capek untuk menerima order. Istirahat sebentar dulu.';
    var km = x.jemput + x.km, isCar = o.mode === 'mobil';
    var kend = isCar ? g.KK_MOBIL : g.KK_MOTOR;
    if (!kend.cukup(S, km)) return isCar ? 'Bensin / baterai mobil tidak cukup untuk order ini.' : 'Bensin tidak cukup untuk order ini.';
    /* ukur pemakaian BBM trip lalu kembalikan dulu agar berkurang bertahap selama perjalanan (tidak langsung loncat 100→94) */
    var bbmTarget = null, bbmSebelum = 0, bbmDipakai = 0;
    if (isCar && S.mobil) { bbmTarget = 'mobil'; bbmSebelum = S.mobil.isi; }
    else if (!isCar && S.motor) {
      if (S.motor.bbm === 'listrik') { bbmTarget = 'motorEv'; bbmSebelum = S.motor.baterai; }
      else { bbmTarget = 'motor'; bbmSebelum = S.motor.isi; }
    }
    var r = kend.jalan(S, km, 1);
    if (!r || !r.ok) return (r && r.alasan) || 'Kendaraan tidak siap.';
    if (bbmTarget === 'mobil' && S.mobil) { bbmDipakai = Math.max(0, bbmSebelum - S.mobil.isi); S.mobil.isi = bbmSebelum; }
    else if (bbmTarget === 'motorEv' && S.motor) { bbmDipakai = Math.max(0, bbmSebelum - S.motor.baterai); S.motor.baterai = bbmSebelum; }
    else if (bbmTarget === 'motor' && S.motor) { bbmDipakai = Math.max(0, bbmSebelum - S.motor.isi); S.motor.isi = bbmSebelum; }
    if (S.hp && S.hp.cas) S.hp.cas = false; /* berhenti cas stopkontak toko saat berangkat antar penumpang */
    var tunggu = x.jenis === 'makanan' ? 8 + Math.floor(Math.random() * 10) : x.jenis === 'barang' ? 4 : 2;
    var fakMedan = (x.medan && x.medan.kec) ? Math.max(0.5, x.medan.kec) : 1;
    var mntJalan = Math.max(3, Math.round(r.menit / fakMedan));
    var menitJemput = Math.round(mntJalan * x.jemput / km) + tunggu, total = mntJalan + tunggu;
    o.trip = { x: x, total: total, jemput: menitJemput, jalan: 0, kabar: r.kabar, bbmTarget: bbmTarget, bbmSisa: bbmDipakai };
    o.tawaran = null;
    return true;
  }
  function lewati(S) { var o = S.ojek; o.tawaran = null; o.tolak++; o.berikut = waktu(S) + jeda(S); return true; }
  function kedaluwarsa(S) { var o = S.ojek; o.tawaran = null; o.berikut = waktu(S) + jeda(S); }

  function selesai(S) {
    var o = S.ojek, tr = o.trip, x = tr.x, kabar = tr.kabar.slice(), dapat = x.bersih + (x.tip || 0);
    if (tr.bbmSisa > 0 && tr.bbmTarget) {
      if (tr.bbmTarget === 'mobil' && S.mobil) S.mobil.isi = Math.max(0, S.mobil.isi - tr.bbmSisa);
      else if (tr.bbmTarget === 'motorEv' && S.motor) S.motor.baterai = Math.max(0, S.motor.baterai - tr.bbmSisa);
      else if (tr.bbmTarget === 'motor' && S.motor) S.motor.isi = Math.max(0, S.motor.isi - tr.bbmSisa);
      tr.bbmSisa = 0;
    }
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
    if (x.tujuanTitik) {
      o.lokasi = x.tujuanTitik;
      o.riwayatDesa = o.riwayatDesa || [];
      if (x.tujuanTitik.desa) {
        o.riwayatDesa.push(x.tujuanTitik.desa);
        if (o.riwayatDesa.length > 5) o.riwayatDesa.shift();
      }
    }
    o.hariIni.trip++; o.hariIni.bersih += dapat; o.total.trip++; o.total.bersih += dapat;
    if (o.mode === 'mobil') {
      if (S.mobil) S.mobil.totalHasil = (S.mobil.totalHasil || 0) + dapat;
      S.hariIni.mobil = (S.hariIni.mobil || 0) + dapat;
    } else {
      if (S.motor) S.motor.totalHasil = (S.motor.totalHasil || 0) + dapat;
      S.hariIni.ojek = (S.hariIni.ojek || 0) + dapat;
    }
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + dapat;
    /* evaluasi rating & komentar penumpang nyata berdasarkan kondisi kendaraan, stamina, & kebersihan */
    var skor = 4.85;
    var isCarS = o.mode === 'mobil';
    var knd = isCarS ? S.mobil : S.motor;
    if (knd) {
      if ((knd.servisKm || 0) > (isCarS ? 10000 : 4000)) skor -= 0.55;
      if (!isCarS && (knd.oliKm || 0) > 2500) skor -= 0.4;
      if ((knd.banKm || 0) > (isCarS ? 40000 : 15000)) skor -= 0.35;
    }
    if (S.diri && S.diri.stamina < 25) skor -= 0.35;
    if (S.ojek.cuciSampai && S.hari <= S.ojek.cuciSampai) skor += 0.2;
    var bintangTrip = Math.max(2, Math.min(5, Math.round(skor + (Math.random() - 0.35) * 0.7)));
    var nRat = Math.min(50, (o.ratingCount || 0));
    o.rating = Math.round((((o.rating || 4.85) * (nRat + 10) + bintangTrip) / (nRat + 11)) * 100) / 100;
    o.ratingCount = (o.ratingCount || 0) + 1;
    var komPos = ['Driver ramah, kendaraan bersih & nyaman!', 'Mantap, cepat sampai & sopan.', 'Kendaraan wangi terawat, jempol 5!', 'Pelayanan bintang 5, recommended!'];
    var komNeg = ['Kendaraan agak bergetar, perlu servis.', 'Driver terlihat capek, hati-hati di jalan.', 'Lumayan, tapi mesin agak kasar.'];
    var kom = bintangTrip >= 5 ? komPos[o.ratingCount % komPos.length] : (bintangTrip >= 4 ? 'Perjalanan aman dan lancar.' : komNeg[o.ratingCount % komNeg.length]);
    o.ulasan = o.ulasan || [];
    o.ulasan.unshift({ nama: x.nama, bintang: bintangTrip, teks: kom, hari: S.hari });
    if (o.ulasan.length > 15) o.ulasan.length = 15;

    var diLok = (o.lokasi && o.lokasi.kecNama) ? (' di ' + o.lokasi.desa + ', ' + o.lokasi.kecNama) : '';
    kabar.unshift(x.layanan + ' selesai (' + x.km.toLocaleString('id-ID') + ' km)' + diLok + ' · ★' + bintangTrip + ' · +' + rp(dapat) + caraTeks + '.');
    if (g.KK_EKO && g.KK_EKO.cekBanjirMogok) {
      var kbAir = g.KK_EKO.cekBanjirMogok(S, o.mode);
      if (kbAir) { kabar.push(kbAir); o.online = false; }
    }
    if (g.KK_REAL && g.KK_REAL.catatAusPerjalanan) {
      var kbAus = g.KK_REAL.catatAusPerjalanan(S, o.mode, x.km, x.medan);
      if (kbAus) kabar.push(kbAus);
    }
    o.trip = null; o.berikut = waktu(S) + jeda(S);
    return kabar;
  }

  /* dipanggil tiap langkah waktu saat online. Hasil: kabar (teks) */
  function jalan(S, dMenit) {
    var o = S.ojek; if (!o.online) return [];
    if (o.trip) {
      var tr = o.trip;
      if (tr.bbmSisa > 0 && tr.bbmTarget && tr.total > 0) {
        var sisaMnt = Math.max(0.1, tr.total - tr.jalan);
        var kur = Math.min(tr.bbmSisa, (tr.bbmSisa / sisaMnt) * dMenit);
        tr.bbmSisa = Math.max(0, tr.bbmSisa - kur);
        if (tr.bbmTarget === 'mobil' && S.mobil) S.mobil.isi = Math.max(0, S.mobil.isi - kur);
        else if (tr.bbmTarget === 'motorEv' && S.motor) S.motor.baterai = Math.max(0, S.motor.baterai - kur);
        else if (tr.bbmTarget === 'motor' && S.motor) S.motor.isi = Math.max(0, S.motor.isi - kur);
      }
      tr.jalan += dMenit;
      if (tr.jalan >= tr.total) return selesai(S);
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
    kedaluwarsa: kedaluwarsa, jalan: jalan, fase: fase, tarikSaldo: tarikSaldo, gantiHari: gantiHari, platform: platform, lokasiRumah: lokasiRumah, lokasiSekarang: lokasiSekarang, jarakRumah: jarakRumah, resetPos: resetPos, statusMudik: statusMudik, CEPAT_TRIP: CEPAT_TRIP };
})(window);
