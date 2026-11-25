/* travel.js — usaha travel antarkota dengan mobil sendiri: tunggu penumpang di pool, pilih kota tujuan, berangkat,
   atur gigi (lima percepatan + satu khusus malam), tol dan kapal, istirahat, lalu penilaian penumpang.
   Jarak, tol, kapal, dan tarif dari data/rute.js. Frekuensi penumpang dan peluang kejadian adalah setelan. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, R = g.KK_RUTE;
  var CEPAT_JALAN = 8, CEPAT_TUNGGU = 1; /* waktu berjalan lebih cepat saat menyetir atau menunggu penumpang (setelan) */
  var MULT_MIN = 0.6, MULT_MAKS = 1.6, JEMPUT_MAKS = 3;
  var JAM_RAMAI = [0.2, 0.1, 0.1, 0.2, 0.8, 1.4, 1.6, 1.4, 1.1, 1, 1, 1.1, 1.2, 1.2, 1.3, 1.5, 1.7, 1.5, 1.1, 0.8, 0.5, 0.4, 0.3, 0.2];

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function waktu(S) { return S.hari * 1440 + S.menit; }
  function M() { return g.KK_MOTOR; }
  function siapkan(S) {
    if (!S.travel) S.travel = { aktif: false, di: null, status: 'tunggu', tujuan: null, mult: 1, gigi: 4, antri: [], jemput: 0, rating: 4.5, berikut: 0, trip: null, lompat: 0, laporan: null,
      hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0, km: 0 } };
    if (!S.travel.total.km) S.travel.total.km = 0;
    return S.travel;
  }
  function kursi(S) {
    if (!S.mobil || !g.KK_MOBIL || g.KK_MOBIL.pikap(S)) return 0;
    return Math.max(0, g.KK_MOBIL.kapasitasPenumpang(S) - 1); /* satu kursi untuk sopir */
  }
  function gigiObj(n, S) { return R.gigiInfo ? R.gigiInfo(S, 'mobil', Math.max(1, Math.min(5, n))) : R.gigi[Math.max(1, Math.min(5, n)) - 1]; }
  function hujan(S) { return !!(g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)); }
  function malam(S) { var m = S.menit % 1440; return m >= 1320 || m < 300; }
  function bolehKhusus(S) { return !hujan(S) && !!S.mobil; }

  /* ---------- uang ---------- */
  function dana(S) { return Math.max(0, S.bank.saldo) + Math.max(0, S.uang.dompet || 0); }
  function bayar(S, jml, ket) {
    jml = Math.round(jml); if (jml <= 0) return 0;
    var sisa = jml, dariBank = Math.min(Math.max(0, S.bank.saldo), sisa);
    if (dariBank > 0) { S.bank.saldo -= dariBank; M().catatBank(S, ket, -dariBank); sisa -= dariBank; }
    var d = Math.min(Math.max(0, S.uang.dompet || 0), sisa); S.uang.dompet -= d; sisa -= d;
    return jml - sisa;
  }

  /* ---------- rencana perjalanan ---------- */
  function rencana(S, tujuan) {
    var T = siapkan(S), j = R.jalur(T.di || S.kota, tujuan); if (!j) return null;
    var m = S.mobil, gi = gigiObj(T.gigi, S), std = R.tarifStandar(j), pnp = Math.max(1, T.antri.length);
    var kmhRata = j.tol > 0 ? (gi.lo + gi.hi) / 2 * 0.9 : (gi.lo + gi.hi) / 2 * 0.75; /* tol lebih lancar */
    var laut = 0, jamLaut = 0; j.ruas.forEach(function (r) { if (r.laut) { laut += r.kapalMobil + r.kapalOrang * pnp; jamLaut += r.jam + 1; } });
    var jamJalan = (j.km - j.ruas.reduce(function (a, r) { return a + (r.laut ? r.km : 0); }, 0)) / Math.max(10, kmhRata) + jamLaut;
    var liter = m ? (j.km - (j.laut ? 30 : 0)) / m.kml * gi.boros : 0;
    var bbm = m ? M().hargaBbm(S, m.bbm) : 0;
    return { jalur: j, km: j.km, tol: j.tol, laut: laut, tarifStd: std, tarif: Math.round(std * T.mult / 1000) * 1000, jam: jamJalan, liter: liter, biayaBbm: Math.round(liter * bbm), nama: R.nama(tujuan) };
  }

  /* ---------- penumpang datang ---------- */
  function laju(S, tujuan) {
    var T = S.travel, j = R.jalur(T.di, tujuan); if (!j) return 0;
    var jam = Math.floor(S.menit / 60) % 24, pop = (R.kota[T.di].ramai + R.kota[tujuan].ramai) / 2;
    var jarak = j.km < 150 ? 1.2 : j.km < 400 ? 1 : j.km < 900 ? 0.7 : 0.4;
    var nyaman = R.nyaman ? R.nyaman(S.mobil, 'mobil') : 1;
    var harga = Math.pow(nyaman / T.mult, 1.6), mutu = 0.6 + T.rating * 0.1;
    return 1.3 * JAM_RAMAI[jam] * pop * jarak * harga * mutu * (hujan(S) ? 0.85 : 1) * g.KK_DIRI.faktorPromo(S);
  }
  function jeda(S, tujuan) { var l = Math.max(0.05, laju(S, tujuan)); return Math.max(2, -Math.log(1 - Math.random()) * 60 / l); }
  function penumpangBaru(S) {
    var r = Math.random(), tipe = r < 0.25 ? 'cepat' : r < 0.5 ? 'santai' : 'biasa';
    return { nama: N.namaOrang[Math.floor(Math.random() * N.namaOrang.length)], tipe: tipe, naik: waktu(S) };
  }
  function bisaMulai(S) {
    if (!S.mobil) return 'Travel butuh mobil. Beli mobil keluarga atau MPV dulu di aplikasi Kendaraan.';
    if (kursi(S) < 2) return 'Mobil ini kurang cocok untuk travel (kursi penumpang kurang dari 2). Pakai hatchback, sedan, MPV, atau SUV.';
    if (S.ojek && S.ojek.online) return 'Berhenti narik ojol dulu.';
    if (!(S.usaha && S.usaha.berhentiSewa) && S.fase === 'buka') return 'Tutup kedai dulu sebelum jalan.';
    if (S.mobil.kredit && S.mobil.kredit.tunggakan > 0) return 'Mobil masih menunggak cicilan. Lunasi tunggakan dulu.';
    return null;
  }
  function mulai(S) {
    var e = bisaMulai(S); if (e) return e;
    var T = siapkan(S); T.aktif = true; T.di = T.di || S.kota; T.status = 'tunggu'; T.tujuan = null; T.antri = []; T.jemput = 0; T.trip = null;
    return true;
  }
  function selesaiParkir(S) {
    var T = siapkan(S);
    if (T.status === 'jalan' || T.status === 'kapal') return 'Mobil sedang di jalan.';
    if (T.di !== S.kota) return 'Kamu masih di ' + R.nama(T.di) + '. Pulang dulu ke ' + R.nama(S.kota) + ' untuk berhenti.';
    T.aktif = false; T.antri = []; T.tujuan = null; return true;
  }
  function pilihTujuan(S, id) {
    var T = siapkan(S); if (T.status !== 'tunggu') return 'Mobil sedang di jalan.';
    if (!R.kota[id] || id === T.di) return 'Tujuan tidak valid.';
    if (T.tujuan !== id) { T.tujuan = id; T.antri = []; T.jemput = 0; T.berikut = waktu(S) + jeda(S, id); }
    return true;
  }
  function ubahTarif(S, delta) {
    var T = siapkan(S); T.mult = Math.round(Math.max(MULT_MIN, Math.min(MULT_MAKS, T.mult + delta)) * 100) / 100; return true;
  }
  function jemput(S) {
    var T = siapkan(S);
    if (T.status !== 'tunggu' || !T.tujuan) return 'Pilih tujuan dulu.';
    if (T.antri.length >= kursi(S)) return 'Kursi sudah penuh.';
    if (T.jemput >= JEMPUT_MAKS) return 'Sudah menjemput ' + JEMPUT_MAKS + ' penumpang. Setelah itu langsung berangkat.';
    if (!g.KK_MOBIL.cukup(S, 4)) return 'Bensin tidak cukup untuk menjemput. Isi dulu.';
    var m = S.mobil; m.isi = Math.max(0, m.isi - 4 / m.kml / m.tangki); m.km += 4; T.jemput++;
    T.antri.push(penumpangBaru(S));
    return { ok: true, menit: 25, teks: 'Menjemput ' + T.antri[T.antri.length - 1].nama + ' di rumahnya. Kursi terisi ' + T.antri.length + '/' + kursi(S) + '.' };
  }

  /* ---------- berangkat ---------- */
  function berangkat(S) {
    var T = siapkan(S); if (T.status !== 'tunggu') return 'Mobil sedang di jalan.';
    if (!T.tujuan) return 'Pilih tujuan dulu.';
    var e = bisaMulai(S); if (e) return e;
    var rc = rencana(S, T.tujuan); if (!rc) return 'Rute tidak ditemukan.';
    var wajib = rc.tol + rc.laut;
    if (dana(S) < wajib) return 'Uang untuk tol dan kapal kurang. Butuh sekitar ' + rp(wajib) + '.';
    if (S.diri.stamina < 12) return 'Kamu terlalu capek dan ngantuk untuk menyetir jauh. Istirahat dulu.';
    var m = S.mobil;
    if (m.isi * m.tangki < 3) return 'Bensin hampir habis. Isi dulu di aplikasi Kendaraan.';
    var pnp = T.antri.length;
    T.trip = { dari: T.di, ke: T.tujuan, simpul: rc.jalur.simpul, ruas: rc.jalur.ruas, km: rc.km, idx: 0, kmRuas: 0, kmSelesai: 0, mulai: waktu(S), menitGerak: 0, menitHenti: 0, sisaKapal: 0,
      gigiMenit: [0, 0, 0, 0, 0, 0, 0], tarifKursi: rc.tarif, tol: 0, kapal: 0, penalti: 0, penaltiTipe: { cepat: 0, santai: 0, biasa: 0 }, kejadian: [], bensin0: m.isi * m.tangki, peringatan: false, tolAsal: rc.tol };
    T.status = 'jalan';
    var kabar = masukRuas(S);
    return { ok: true, kabar: kabar, teks: pnp ? 'Berangkat ke ' + rc.nama + ' bersama ' + pnp + ' penumpang.' : 'Berangkat ke ' + rc.nama + ' tanpa penumpang.' };
  }
  function masukRuas(S) {
    var T = S.travel, tr = T.trip, r = tr.ruas[tr.idx], kabar = [], pnp = T.antri.length;
    tr.kmRuas = 0;
    if (r.laut) {
      var b = r.kapalMobil + r.kapalOrang * pnp, p = bayar(S, b, 'Kapal ' + R.nama(tr.simpul[tr.idx]) + ' ke ' + R.nama(tr.simpul[tr.idx + 1]));
      tr.kapal += p; tr.sisaKapal = (r.jam + 1) * 60; T.status = 'kapal';
      kabar.push('Naik kapal penyeberangan ' + R.nama(tr.simpul[tr.idx]) + ' – ' + R.nama(tr.simpul[tr.idx + 1]) + '. Tiket mobil dan ' + pnp + ' penumpang ' + rp(p) + '.');
    } else {
      T.status = 'jalan';
      if (r.tol > 0) { var pt = bayar(S, r.tol, 'Tol ' + R.nama(tr.simpul[tr.idx]) + ' – ' + R.nama(tr.simpul[tr.idx + 1])); tr.tol += pt; kabar.push('Masuk tol, bayar ' + rp(pt) + '.'); }
    }
    return kabar;
  }

  /* ---------- kecepatan ---------- */
  function macet(S) {
    var T = S.travel, tr = T.trip; if (!tr) return 1;
    var r = tr.ruas[tr.idx], sisa = r.km - tr.kmRuas, dekat = Math.min(tr.kmRuas, sisa);
    var kotaDekat = tr.kmRuas < sisa ? tr.simpul[tr.idx] : tr.simpul[tr.idx + 1], ramai = R.kota[kotaDekat].ramai;
    if (dekat > 14 || ramai < 1.1) return 1;
    var jam = (S.menit % 1440) / 60, sibuk = (jam >= 6 && jam < 9.5) || (jam >= 16 && jam < 19.5);
    return sibuk ? 0.45 : 0.75;
  }
  function kecepatan(S) {
    var T = siapkan(S), n = Math.max(1, Math.min(5, T.gigi || 3)), ket = '', m = S.mobil;
    if (hujan(S) && n > 4) { n = 4; ket = 'Hujan deras: dibatasi level 4.'; }
    var gi = gigiObj(n, S), v = gi.lo + (gi.hi - gi.lo) * (0.55 + 0.3 * Math.sin(S.menit / 5));
    var vmax = R.vmaxKendaraan ? R.vmaxKendaraan(S, 'mobil') : (R.vmax[m ? m.bentuk : 'mpv'] || 170);
    if (v > vmax) v = vmax;
    var mc = macet(S); if (mc < 1) { v *= mc; if (!ket) ket = mc < 0.5 ? 'Macet parah masuk kota.' : 'Jalan padat masuk kota.'; }
    return { kmh: Math.max(6, v), gigi: n, ket: ket };
  }
  function setGigi(S, n) {
    var T = siapkan(S); n = +n; if (n < 1 || n > 5) return 'Level kecepatan 1–5.';
    if (hujan(S) && n > 4) return 'Hujan deras: paling cepat level 4.';
    T.gigi = n; return true;
  }

  /* ---------- selama jalan ---------- */
  function tambahKejadian(T, teks, denda, menit, penalti) {
    var tr = T.trip; tr.kejadian.push(teks); tr.penalti += penalti || 0; tr.menitHenti += menit || 0; T.lompat += menit || 0;
  }
  function langkahJalan(S, dMenit) {
    var T = S.travel, tr = T.trip, m = S.mobil, kabar = [];
    if (!m) { T.status = 'tunggu'; T.trip = null; return ['Mobil tidak ada, perjalanan dibatalkan.']; }
    var r = tr.ruas[tr.idx], v = kecepatan(S), gi = gigiObj(v.gigi, S), km = Math.min(v.kmh * dMenit / 60, r.km - tr.kmRuas);
    var liter = km / m.kml * gi.boros * (m.ngelitik ? 1.08 : 1);
    if (m.isi * m.tangki < liter + 0.2) {
      var derek = Math.min(750000, dana(S)); var bayarDerek = bayar(S, derek, 'Derek dan bensin darurat');
      m.isi = Math.min(1, m.isi + 8 / m.tangki); tambahKejadian(T, 'Bensin habis di jalan. Derek dan bensin darurat ' + rp(bayarDerek) + '.', bayarDerek, 90, 0.7);
      kabar.push('Bensin habis di jalan. Derek dan beli bensin darurat ' + rp(bayarDerek) + ', telat sekitar 1,5 jam.'); return kabar;
    }
    m.isi = Math.max(0, m.isi - liter / m.tangki); m.km += km; tr.kmRuas += km; tr.kmSelesai += km; tr.menitGerak += dMenit; tr.gigiMenit[v.gigi] += dMenit;
    if (!tr.peringatan && m.isi < 0.12) { tr.peringatan = true; kabar.push('Bensin tinggal sedikit. Tekan Berhenti untuk isi di SPBU.'); }
    if (m.isi > 0.3) tr.peringatan = false;
    var jamFrac = dMenit / 60, r2 = Math.random();
    if (v.gigi === 6 && r2 < 0.025 * jamFrac) {
      var denda = bayar(S, 500000, 'Tilang kecepatan'); tambahKejadian(T, 'Kena tilang karena ngebut. Denda ' + rp(denda) + '.', denda, 15, 0.6);
      kabar.push('Kena tilang ngebut, denda ' + rp(denda) + '.');
    } else if (v.gigi === 6 && r2 < 0.033 * jamFrac) {
      var rusak = bayar(S, 2000000, 'Perbaikan senggolan jalan'); tambahKejadian(T, 'Senggolan saat ngebut. Perbaikan ' + rp(rusak) + '.', rusak, 40, 2);
      kabar.push('Mobil menyenggol pembatas saat ngebut. Perbaikan ' + rp(rusak) + '.');
    } else if (r2 < (0.004 + (g.KK_MOBIL.telatServis(S) / 1000) * 0.01) * jamFrac) {
      var ban = 150000 + Math.floor(Math.random() * 3) * 100000, pb = bayar(S, ban, 'Tambal ban dan bengkel'); tambahKejadian(T, 'Ban bocor, tambal dan bengkel ' + rp(pb) + '.', pb, 45, 0.5);
      kabar.push('Ban bocor di jalan. Tambal dan bengkel ' + rp(pb) + ', telat 45 menit.');
    }
    var d = S.diri, w = waktu(S);
    if (w >= (T.peringatanLagi || 0) && (d.kenyang < 22 || d.minum < 22)) { T.peringatanLagi = w + 150; kabar.push((d.minum < d.kenyang ? 'Kamu mulai haus.' : 'Kamu mulai lapar.') + ' Berhenti di rumah makan.'); }
    /* henti otomatis sebelum badan ambruk (sebelum sistem ketiduran bekerja) */
    if (w >= (T.jedaAuto || 0)) {
      var auto = d.kenyang <= 6 || d.minum <= 6 ? 'makan' : d.stamina < 14 ? 'rehat' : null;
      if (auto) {
        var h = ISTI(S, auto); if (!(h && h.ok) && auto === 'makan') h = ISTI(S, 'menepi');
        if (h && h.ok) { T.lompat += h.menit; kabar.push('Kamu berhenti otomatis: ' + h.teks); }
        T.jedaAuto = w + ((h && h.ok) ? h.menit : 0) + 45;
        return kabar;
      }
    }
    if (tr.kmRuas >= r.km - 1e-6) {
      tr.idx++;
      if (tr.idx >= tr.ruas.length) return kabar.concat(selesaiTrip(S));
      kabar.push('Tiba di ' + R.nama(tr.simpul[tr.idx]) + '.'); kabar = kabar.concat(masukRuas(S));
    }
    return kabar;
  }
  function langkahKapal(S, dMenit) {
    var T = S.travel, tr = T.trip, kabar = [], d = S.diri;
    tr.sisaKapal -= dMenit; tr.menitGerak += dMenit;
    d.stamina = Math.min(100, d.stamina + dMenit * 0.18); /* tidur di kapal */
    if (tr.sisaKapal <= 0) {
      tr.kmSelesai += tr.ruas[tr.idx].km; tr.idx++; T.status = 'jalan';
      if (tr.idx >= tr.ruas.length) return selesaiTrip(S);
      kabar.push('Kapal sandar di ' + R.nama(tr.simpul[tr.idx]) + '.'); kabar = kabar.concat(masukRuas(S));
    }
    return kabar;
  }
  function jalan(S, dMenit) {
    var T = S.travel; if (!T || !T.aktif) return [];
    if (T.status === 'tunggu') {
      if (T.tujuan && T.antri.length < kursi(S) && waktu(S) >= T.berikut) { T.antri.push(penumpangBaru(S)); T.berikut = waktu(S) + jeda(S, T.tujuan); }
      return [];
    }
    if (!T.trip) { T.status = 'tunggu'; return []; }
    return T.status === 'kapal' ? langkahKapal(S, dMenit) : langkahJalan(S, dMenit);
  }

  /* ---------- istirahat ---------- */
  function ISTI(S, jenis) {
    var T = siapkan(S), x = R.istirahat[jenis], d = S.diri; if (!x) return 'Pilihan tidak ada.';
    var pnp = T.antri.length, tr = T.trip && T.status !== 'tunggu';
    if (T.status === 'kapal') return 'Kamu sedang di kapal. Tidur saja, badan otomatis pulih.';
    if (jenis === 'penginapan' && tr && pnp) {
      if (!T.konfirmasiInap) { T.konfirmasiInap = true; return 'Ada ' + pnp + ' penumpang di mobil. Menginap 7 jam membuat mereka kesal dan nilai turun. Tekan lagi untuk tetap menginap.'; }
    }
    T.konfirmasiInap = false;
    if (x.biaya > 0) { if (dana(S) < x.biaya) return 'Uang tidak cukup (' + rp(x.biaya) + ').'; bayar(S, x.biaya, jenis === 'makan' ? 'Makan di rumah makan' : x.nama); }
    if (x.kenyang) d.kenyang = Math.min(100, d.kenyang + x.kenyang); if (x.minum) d.minum = Math.min(100, d.minum + x.minum);
    d.stamina = Math.min(100, d.stamina + (x.stamina || 0) + (x.melek || 0));
    if (tr) {
      var t2 = T.trip; t2.menitHenti += x.menit;
      if (pnp) {
        if (jenis === 'penginapan') { t2.penalti += 1.5; t2.kejadian.push('Menginap 7 jam di tengah perjalanan.'); }
        else if (jenis === 'rehat') { t2.penaltiTipe.cepat += 1.5; t2.penaltiTipe.biasa += 0.4; }
        else if (jenis === 'makan') { t2.penalti -= 0.2; }
      }
    }
    return { ok: true, menit: x.menit, teks: x.nama + ' selesai (' + (x.menit >= 60 ? (x.menit / 60).toLocaleString('id-ID') + ' jam' : x.menit + ' menit') + (x.biaya ? ', ' + rp(x.biaya) : '') + ').' };
  }
  function istirahat(S, jenis) { return ISTI(S, jenis); }
  function isiBensin(S, liter) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var r = g.KK_MOBIL.isiBensin(S, m.bbm, liter); if (!r || !r.ok) return r;
    if (S.travel.trip) S.travel.trip.menitHenti += 10;
    return { ok: true, menit: 10, teks: 'Isi ' + r.liter.toLocaleString('id-ID') + ' liter, ' + rp(r.biaya) + '.' };
  }

  /* ---------- tiba dan penilaian ---------- */
  function selesaiTrip(S) {
    var T = S.travel, tr = T.trip, kabar = [], pnp = T.antri.length, total = 0, tip = 0, sumNilai = 0, rinci = [];
    var menitTotal = (waktu(S) - tr.mulai) + (T.lompat || 0); if (menitTotal < 1) menitTotal = tr.menitGerak + tr.menitHenti;
    var tolRuas = tr.tolAsal > 0, ideal = tr.km / (tolRuas ? 70 : 55) * 60, telat = menitTotal / Math.max(30, ideal);
    var gm = tr.gigiMenit, gerak = Math.max(1, tr.menitGerak), pangsa5 = (gm[5] + gm[6]) / gerak, pangsa6 = gm[6] / gerak, pangsa1 = (gm[1] + gm[2]) / gerak;
    T.antri.forEach(function (p) {
      var n = 5 - tr.penalti - (tr.penaltiTipe[p.tipe] || 0), bayarKursi = tr.tarifKursi, ket = '';
      if (p.tipe === 'cepat') {
        if (telat > 1.2) { n -= Math.min(3, (telat - 1.2) * 6); ket = 'minta cepat, merasa kelamaan'; }
        else { bayarKursi = Math.round(bayarKursi * 1.2 / 1000) * 1000; ket = 'minta cepat, puas (+20%)'; }
      } else if (p.tipe === 'santai') {
        if (pangsa6 > 0) { n -= 2; ket = 'minta santai, takut karena ngebut'; }
        else if (pangsa5 > 0.4) { n -= pangsa5 * 3; ket = 'minta santai, kurang nyaman dengan lajunya'; }
        else { ket = 'minta santai, nyaman'; if (n >= 4.5) { var tp = Math.round(bayarKursi * 0.05 / 1000) * 1000; tip += tp; } }
      } else {
        if (telat > 1.8) { n -= 1; ket = 'merasa kelamaan'; }
        if (pangsa6 > 0.1) n -= 1;
      }
      n = Math.max(1, Math.min(5, n)); sumNilai += n; total += bayarKursi; rinci.push({ nama: p.nama, tipe: p.tipe, nilai: Math.round(n * 10) / 10, bayar: bayarKursi, ket: ket });
    });
    var tujuan = tr.ke, dari = tr.dari, bensin = Math.max(0, tr.bensin0 - S.mobil.isi * S.mobil.tangki);
    var biayaPerjalanan = tr.tol + tr.kapal;
    if (pnp) {
      var bersihBayar = total + tip, bayarTunai = 0, bayarQris = 0;
      rinci.forEach(function (p) {
        if (Math.random() < 0.5 || !(g.KK_UANG && g.KK_UANG.terimaQris)) bayarTunai += p.bayar;
        else bayarQris += p.bayar;
      });
      bayarTunai += tip;
      if (bayarTunai > 0) S.uang.dompet = (S.uang.dompet || 0) + bayarTunai;
      if (bayarQris > 0 && g.KK_UANG && g.KK_UANG.terimaQris) g.KK_UANG.terimaQris(S, bayarQris);
      var avg = sumNilai / pnp; T.rating = Math.round((T.rating * (1 - 0.12 * Math.min(1, pnp / 3)) + avg * 0.12 * Math.min(1, pnp / 3)) * 100) / 100;
      T.hariIni.trip++; T.hariIni.bersih += bersihBayar - biayaPerjalanan; T.total.trip++; T.total.bersih += bersihBayar - biayaPerjalanan;
      S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + Math.max(0, bersihBayar - biayaPerjalanan);
      if (S.mobil) S.mobil.totalHasil = (S.mobil.totalHasil || 0) + Math.max(0, bersihBayar - biayaPerjalanan);
    }
    T.total.km += tr.km;
    S.hariIni.travel = (S.hariIni.travel || 0) + (pnp ? total + tip - biayaPerjalanan : -biayaPerjalanan);
    T.laporan = { dari: dari, ke: tujuan, km: tr.km, menit: Math.round(menitTotal), penumpang: rinci, pendapatan: total, tip: tip, tunai: bayarTunai || 0, qris: bayarQris || 0, tol: tr.tol, kapal: tr.kapal, bensinLiter: Math.round(bensin * 10) / 10,
      kejadian: tr.kejadian.slice(), rating: T.rating, hari: S.hari };
    kabar.push('Tiba di ' + R.nama(tujuan) + (pnp ? '. Pendapatan ' + rp(total + tip) + ' (Tunai ' + rp(bayarTunai || 0) + ', QRIS ' + rp(bayarQris || 0) + ' cair besok).' : '.'));
    T.di = tujuan; T.status = 'tunggu'; T.trip = null; T.antri = []; T.tujuan = null; T.jemput = 0; T.berikut = 0;
    return kabar;
  }

  /* ---------- untuk adegan dan HUD ---------- */
  function fase(S) {
    var T = S.travel; if (!T || !T.aktif) return null;
    var di = R.kota[T.di] || R.kota[S.kota];
    if (T.status === 'tunggu') return { mode: 'kota', kota: T.di, tema: di.tema, penumpang: T.antri.length, kursi: kursi(S), tujuan: T.tujuan };
    var tr = T.trip; if (!tr) return { mode: 'kota', kota: T.di, tema: di.tema, penumpang: 0, kursi: kursi(S) };
    var r = tr.ruas[tr.idx], a = tr.simpul[tr.idx], b = tr.simpul[tr.idx + 1], u = T.status === 'kapal' ? 1 - Math.max(0, tr.sisaKapal) / ((r.jam + 1) * 60) : Math.min(1, tr.kmRuas / r.km);
    var v = T.status === 'kapal' ? { kmh: 0, gigi: 0 } : kecepatan(S);
    return { mode: T.status === 'kapal' ? 'kapal' : 'jalan', dari: a, ke: b, u: u, temaA: R.kota[a].tema, temaB: R.kota[b].tema, penumpang: T.antri.length, kursi: kursi(S), kmh: v.kmh, gigi: v.gigi, tol: r.tol > 0,
      kemajuan: Math.min(1, tr.kmSelesai / tr.km), sisaKm: Math.max(0, tr.km - tr.kmSelesai) };
  }
  function cepatWaktu(S) {
    var T = S.travel; if (!T || !T.aktif) return 1;
    if (T.status === 'jalan' || T.status === 'kapal') return CEPAT_JALAN;
    return T.tujuan && T.antri.length < kursi(S) ? CEPAT_TUNGGU : 1;
  }
  function estimasi(S) { /* sisa jam perjalanan dengan kecepatan sekarang */
    var T = S.travel, tr = T && T.trip; if (!tr) return 0;
    var v = kecepatan(S).kmh, sisaKapal = T.status === 'kapal' ? Math.max(0, tr.sisaKapal) / 60 : 0, kmSisa = Math.max(0, tr.km - tr.kmSelesai);
    tr.ruas.slice(tr.idx).forEach(function (r) { if (r.laut) kmSisa -= r.km; });
    var jamLautDepan = 0; tr.ruas.slice(T.status === 'kapal' ? tr.idx + 1 : tr.idx).forEach(function (r) { if (r.laut) jamLautDepan += r.jam + 1; });
    return Math.max(0, kmSisa) / Math.max(6, v) + sisaKapal + jamLautDepan;
  }

  g.KK_TRAVEL = { siapkan: siapkan, kursi: kursi, bisaMulai: bisaMulai, mulai: mulai, selesaiParkir: selesaiParkir, pilihTujuan: pilihTujuan, ubahTarif: ubahTarif, jemput: jemput, berangkat: berangkat,
    setGigi: setGigi, kecepatan: kecepatan, jalan: jalan, istirahat: istirahat, isiBensin: isiBensin, fase: fase, cepatWaktu: cepatWaktu, estimasi: estimasi, rencana: rencana, laju: laju, bolehKhusus: bolehKhusus,
    dana: dana, CEPAT_JALAN: CEPAT_JALAN, MULT_MIN: MULT_MIN, MULT_MAKS: MULT_MAKS, JEMPUT_MAKS: JEMPUT_MAKS };
})(window);
