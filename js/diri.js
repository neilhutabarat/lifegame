/* diri.js — kebutuhan pemain (kenyang, minum, stamina, melek), kos dan isinya, token listrik kos, makan dan tidur.
   Angka bertanda "setelan" disetel lewat uji main; harga dari data nyata.js. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL;
  /* turun per jam saat bangun (setelan) */
  var TURUN = { kenyang: 5, minum: 7, melek: 4.5, stamina: 3 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function kota(S) { return N.kota.filter(function (k) { return k.id === S.kota; })[0]; }
  function batas(x) { return Math.max(0, Math.min(100, x)); }

  function siapkan(S) {
    if (!S.diri) S.diri = { kenyang: 80, minum: 80, stamina: 90, melek: 90, hb: 25, posisi: 'kedai', bangun: 360, ketiduran: 0, sakit: null, kebalSampai: -1, hamil: null };
    if (typeof S.diri.hb !== 'number' || isNaN(S.diri.hb)) S.diri.hb = 25;
    if (S.diri.sakit === undefined) S.diri.sakit = null;
    if (S.diri.kebalSampai == null) S.diri.kebalSampai = -1;
    if (S.diri.hamil === undefined) S.diri.hamil = null;
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1, vitaminHamilSampai: -1 };
    S.kesehatan.obat = S.kesehatan.obat || {};
    if (typeof S.kesehatan.kondom !== 'number') S.kesehatan.kondom = 0;
    if (S.kesehatan.kbSampai == null) S.kesehatan.kbSampai = -1;
    S.rumahTangga = S.rumahTangga || { aktifSampai: -1, paket: null };
    if (!S.rumah) S.rumah = { jenis: 'kos', sewa: kota(S).kos, kwh: 10, barang: {}, tempo: Math.min(28, KAL.tgl(S.hari).d), padam: false };
    if (typeof S.rumah.kwh !== 'number' || isNaN(S.rumah.kwh)) { S.rumah.kwh = 10; S.rumah.padam = false; }
    if (S.rumah.jarak == null) S.rumah.jarak = N.jarakKos;
    S.rumah.infoBarang = S.rumah.infoBarang || {};
    S.game = S.game || { konsol: {}, kaset: {}, pasar: null };
    S.game.konsol = S.game.konsol || {};
    S.game.kaset = S.game.kaset || {};
    S.hp = S.hp || { id: 'redmi12c', baterai: 95, cas: false, pulsa: 25000, kuota: 8, apk: { kasirpro: true } };
    if (typeof S.hp.baterai !== 'number') S.hp.baterai = 95;
    if (typeof S.hp.pulsa !== 'number') S.hp.pulsa = 25000;
    if (typeof S.hp.kuota !== 'number') S.hp.kuota = 8;
    S.hp.apk = S.hp.apk || { kasirpro: true };
    S.gadget = S.gadget || {};
    if (!S.gadget[S.hp.id]) {
      var gm0 = gadgetModel(S.hp.id) || gadgetModel('redmi12c');
      if (gm0) S.gadget[gm0.id] = { id: gm0.id, dibeli: S.hari, pakai: 0, hargaBeli: gm0.harga };
    }
    /* migrasi hp2 / hp3 lama ke daftarGadget asli */
    if (S.rumah.barang.hp2 && !S.gadget.galaxya54) {
      S.gadget.galaxya54 = { id: 'galaxya54', dibeli: S.hari, pakai: 0, hargaBeli: 5999000 };
      S.hp.id = 'galaxya54';
    }
    if (S.rumah.barang.hp3 && !S.gadget.iphone15pm) {
      S.gadget.iphone15pm = { id: 'iphone15pm', dibeli: S.hari, pakai: 0, hargaBeli: 24999000 };
      S.hp.id = 'iphone15pm';
    }
    S.keluarga = S.keluarga || [];
    S.sewaBarang = S.sewaBarang || {};
    Object.keys(S.rumah.barang).forEach(function (id) {
      if (!S.rumah.barang[id]) return;
      var b = barang(id);
      if (b && !S.rumah.infoBarang[id]) S.rumah.infoBarang[id] = { dibeli: S.hari, pakai: 0, hargaBeli: b.harga };
    });
    ['ps5', 'ps5disc'].forEach(function (kid) {
      if (S.rumah.barang[kid] && !S.game.konsol[kid]) {
        var km = konsolModel(kid);
        if (km) S.game.konsol[kid] = { id: kid, nama: km.nama, merek: km.merek, hargaBeli: km.harga, dibeli: S.hari, pakai: 0, bekas: false, kondisi: 'baru', ketKondisi: 'Baru bersegel resmi Sony Indonesia', tahun: km.tahun ? km.tahun[0] : 2023, kelengkapan: km.kelengkapan };
      }
    });
    if (!S.game.pasar || S.game.pasar.minggu !== Math.floor(S.hari / 7)) acakPasarGame(S);
    return S;
  }
  function gadgetModel(id) { return (N.daftarGadget || []).filter(function (x) { return x.id === id; })[0]; }
  function apkModel(id) { return (N.apkHp || []).filter(function (x) { return x.id === id; })[0]; }
  function hpAktif(S) { return gadgetModel(S.hp && S.hp.id) || gadgetModel('redmi12c'); }
  function adaWifi(S) {
    if (!S.diri) return false;
    if (S.diri.posisi === 'kos') return !!(S.rumah && S.rumah.wifi && !S.rumah.padam);
    return !!(g.KK_USAHA && g.KK_USAHA.punya(S, 'wifi') && g.KK_USAHA.listrikNyala(S));
  }
  function pakaiKuota(S, gb) {
    if (!S.hp) return true;
    if (S.hp.baterai <= 0) return 'Baterai HP habis (0%)! Cas HP dulu di aplikasi Gadget & Kuota.';
    if (adaWifi(S)) return true;
    if ((S.hp.kuota || 0) >= gb) {
      S.hp.kuota = Math.max(0, Math.round((S.hp.kuota - gb) * 100) / 100);
      return true;
    }
    /* fallback potong pulsa Rp2.000 per 0.1 GB jika kuota habis */
    var potongPulsa = Math.max(1000, Math.round(gb * 15000 / 500) * 500);
    if ((S.hp.pulsa || 0) >= potongPulsa) {
      S.hp.pulsa -= potongPulsa;
      return true;
    }
    return 'Kuota internet & pulsa habis! Isi kuota/pulsa atau pasang WiFi dulu.';
  }
  function punya(S, id) { if (id === 'tv') return !!(S.rumah.barang.tv || S.rumah.barang.tv55); return !!S.rumah.barang[id]; }
  function tempat(S) { return S.rumah.jenis === 'rumah' ? 'rumah' : 'kos'; }
  function adaAc(S) { return S.rumah.jenis !== 'rumah' || punya(S, 'ac'); }
  function barang(id) { return N.barangRumah.filter(function (b) { return b.id === id; })[0]; }
  function konsolModel(id) { return (N.konsolGame || []).filter(function (k) { return k.id === id; })[0]; }
  function gameModel(id) { return (N.gameKonsol || []).filter(function (x) { return x.id === id; })[0]; }
  function punyaKonsol(S, id) { return !!(S.game && S.game.konsol && S.game.konsol[id]); }
  function adaKonsol(S) { return !!(S.game && S.game.konsol && Object.keys(S.game.konsol).length > 0) || punya(S, 'ps5') || punya(S, 'ps5disc'); }
  function catatPakai(S, id) {
    if (S.rumah && S.rumah.barang[id] && S.rumah.infoBarang && S.rumah.infoBarang[id]) {
      S.rumah.infoBarang[id].pakai = (S.rumah.infoBarang[id].pakai || 0) + 1;
    }
  }

  /* ---------- waktu berjalan ---------- */
  function jalan(S, dMenit, kerja) {
    var d = S.diri, j = dMenit / 60, kabar = [];
    d.kenyang = batas(d.kenyang - TURUN.kenyang * j);
    d.minum = batas(d.minum - TURUN.minum * j);
    d.melek = batas(d.melek - TURUN.melek * j);
    /* HB bar (gairah/kedekatan pasangan) perlahan meningkat sepanjang hari */
    var lajuHb = 2.2 * (d.stamina > 45 && !d.sakit ? 1.15 : 0.65);
    d.hb = batas((d.hb || 0) + lajuHb * j);
    var turunStamina = TURUN.stamina * (kerja ? 1.5 : 1) + (d.kenyang < 5 ? 8 : 0) + (d.minum < 5 ? 10 : 0) + (d.sakit ? (d.sakit.berat ? 5 : 2.5) : 0);
    if (d.posisi === 'kos' && !kerja) turunStamina = -(punya(S, 'kursipijat') ? 18 : punya(S, 'sofa') ? 12 : punya(S, 'tv') || punya(S, 'karpet') ? 10 : 6);
    d.stamina = batas(d.stamina - turunStamina * j);
    /* peluang sakit akibat aktivitas berlebihan, telat makan, atau cuaca hujan */
    if (!d.sakit && S.hari > (d.kebalSampai || -1) && j > 0) {
      var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S);
      var diluarHujan = hujan && d.posisi !== 'kos' && !(S.mobil && !S.ojek.online);
      var pSakit = 0, idPenyakit = 'demam';
      if (d.stamina < 12 && d.melek < 15) { pSakit = 0.08; idPenyakit = 'tifus'; }
      else if (d.kenyang < 8) { pSakit = 0.06; idPenyakit = 'maag'; }
      else if (diluarHujan && S.ojek && S.ojek.online) { pSakit = 0.055; idPenyakit = Math.random() < 0.5 ? 'masukangin' : 'flu'; }
      else if (diluarHujan) { pSakit = 0.025; idPenyakit = 'masukangin'; }
      else if (d.stamina < 18 || d.melek < 12) { pSakit = 0.035; idPenyakit = 'demam'; }
      if (pSakit > 0 && Math.random() < pSakit * j) {
        var pk = (N.penyakit || []).filter(function (x) { return x.id === idPenyakit; })[0] || { id: 'demam', nama: 'Demam & meriang', berat: false, obat: 'Paracetamol' };
        d.sakit = { id: pk.id, nama: pk.nama, berat: !!pk.berat, sampai: S.hari + (pk.berat ? 5 : 3) };
        kabar.push('Kamu jatuh sakit (' + pk.nama + ') karena ' + (pk.sebab || 'kelelahan') + '. Beli obat di aplikasi Apotek K-24!');
      }
    }
    listrikKos(S, dMenit, false);
    /* baterai HP & charger sesuai mAh dan Watt asli */
    if (S.hp) {
      var hm = hpAktif(S), mah = (hm && hm.mah) || 5000, watt = (hm && hm.watt) || 10;
      var bisaCas = S.hp.cas && ((d.posisi === 'kos' && !S.rumah.padam) || (d.posisi === 'kedai' && (!g.KK_USAHA || g.KK_USAHA.listrikNyala(S))));
      if (bisaCas) {
        /* kecepatan cas proporsional dengan Watt charger terhadap kapasitas baterai mAh */
        var naikBat = (watt / (mah / 1000)) * (dMenit / 60) * 18;
        var batLama = S.hp.baterai;
        S.hp.baterai = Math.min(100, S.hp.baterai + naikBat);
        if (batLama < 100 && S.hp.baterai >= 100) { S.hp.cas = false; kabar.push('Baterai ' + hm.nama + ' penuh 100% (charger ' + watt + 'W).'); }
      } else {
        if (S.hp.cas && !bisaCas) S.hp.cas = false;
        var pakaiOjek = S.ojek && S.ojek.online;
        var turunBat = (5000 / mah) * (pakaiOjek ? 9.5 : 4.2) * j;
        var sblm = S.hp.baterai;
        S.hp.baterai = Math.max(0, S.hp.baterai - turunBat);
        if (sblm > 15 && S.hp.baterai <= 15) kabar.push('Baterai HP tinggal ' + Math.round(S.hp.baterai) + '%! Segera colok charger.');
        if (sblm > 0 && S.hp.baterai <= 0) {
          if (pakaiOjek && g.KK_OJEK) { g.KK_OJEK.offline(S, true); kabar.push('HP mati kehabisan baterai! Akun driver ojol otomatis offline.'); }
          else kabar.push('Baterai HP habis (0%). Colok charger di menu HP.');
        }
      }
      /* kuota terpakai perlahan saat online narik ojol tanpa WiFi */
      if (S.ojek && S.ojek.online && !adaWifi(S)) {
        pakaiKuota(S, 0.04 * j);
      }
    }
    /* anak / keluarga yang diminta bantu kerja ringan di kedai */
    if (S.fase === 'buka' && S.keluarga && S.keluarga.length) {
      var bantu = S.keluarga.filter(function (kl) { return kl.lokasi === 'kedai'; });
      if (bantu.length && S.dunia) {
        S.dunia.kotor = Math.max(0, S.dunia.kotor - dMenit * 0.25 * bantu.length);
      }
    }
    if (d.melek < 10 && Math.random() < 0.2 * j) { d.ketiduran = 30; kabar.push('Kamu ketiduran sebentar karena mengantuk berat.'); }
    if (d.stamina < 3) { d.ketiduran = 120; kabar.push('Kamu kelelahan dan harus istirahat 2 jam.'); d.stamina = 20; }
    return kabar;
  }
  /* pemakaian listrik kos (kW): kulkas 24 jam, AC saat di kos, TV/PS saat dipakai */
  function listrikKos(S, menit, tidur, alat) {
    var r = S.rumah; if (r.kwh <= 0) { r.padam = true; return; }
    var kw = (punya(S, 'kulkas') ? 0.05 : 0) + (punya(S, 'kulkas2') ? 0.07 : 0);
    if (S.diri.posisi === 'kos') kw += adaAc(S) ? (tidur ? 0.35 : 0.2) : 0.05; /* AC 1/2 PK; tanpa AC hanya lampu, perkiraan */
    if (alat) kw += alat;
    r.kwh = Math.max(0, r.kwh - kw * menit / 60);
    if (r.kwh === 0) r.padam = true;
  }
  function beliTokenKos(S, nominal) {
    var t = g.KK_USAHA.token(S, nominal);
    if (S.bank.saldo < t.bayar) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= t.bayar; S.bank.mutasi.unshift({ n: S.hari, ket: 'Token listrik PLN ' + tempat(S) + ' ' + nominal.toLocaleString('id-ID'), jml: -t.bayar });
    S.rumah.kwh += t.kwh; S.rumah.padam = false;
    return { ok: true, kwh: t.kwh, bayar: t.bayar };
  }

  /* ---------- makan dan minum ---------- */
  function bayarTunai(S, jml) {
    if (g.KK_UANG.bayarDompet && g.KK_UANG.bayarDompet(S, jml)) {
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true;
    }
    if (g.KK_UANG.laci(S) < jml) return false;
    g.KK_MOTOR.bayarLaci(S, jml); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true;
  }
  /* jenis: warung | ojol | masak | air | kopi. Hasil: { ok, menit (waktu yang dipakai), teks } atau teks alasan */
  function makan(S, jenis) {
    var d = S.diri, k = kota(S);
    if (jenis === 'warung') {
      return beli(S, 'nasi', 'warung');
    }
    if (jenis === 'ojol') {
      var biaya = Math.round(k.makan * N.makanOjol.tambahHarga / 500) * 500 + N.makanOjol.ongkir;
      if (g.KK_UANG.bayarQris(S, biaya)) { /* dari saldo QRIS */ }
      else if (S.bank.saldo >= biaya) S.bank.saldo -= biaya;
      else return 'Saldo tidak cukup untuk pesan makanan ' + rp(biaya) + '.';
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya;
      d.pesananMakan = (S.hari * 1440 + S.menit) + N.makanOjol.tunggu;
      return { ok: true, menit: 0, teks: 'Pesan makanan lewat GoFood ' + rp(biaya) + ' termasuk ongkir. Sampai sekitar ' + N.makanOjol.tunggu + ' menit lagi.' };
    }
    if (jenis === 'masak') {
      if (d.posisi !== 'kos' || !(punya(S, 'ricecooker') || punya(S, 'kompor'))) return 'Masak sendiri butuh rice cooker atau kompor.';
      if (!bayarTunai(S, 7000)) return 'Uang di dompet dan laci tidak cukup untuk beras dan lauk.';
      catatPakai(S, 'ricecooker'); catatPakai(S, 'kompor'); catatPakai(S, 'mejamakan');
      d.kenyang = batas(d.kenyang + 60 + (punya(S, 'mejamakan') ? 10 : 0) + (punya(S, 'kompor') ? 5 : 0));
      return { ok: true, menit: 40, teks: 'Masak nasi dan telur di ' + tempat(S) + ', sekitar Rp7.000.' };
    }
    if (jenis === 'air') {
      if (d.posisi === 'kos') { if (!punya(S, 'dispenser') && !bayarTunai(S, 4000)) return 'Uang di laci tidak cukup.'; catatPakai(S, 'dispenser'); catatPakai(S, 'kulkas'); catatPakai(S, 'kulkas2'); }
      else if (!g.KK_STOK.ada(S, 'galon', 300)) return 'Air galon kedai habis.';
      else g.KK_STOK.ambil(S, 'galon', 300);
      d.minum = batas(d.minum + (punya(S, 'kulkas') && d.posisi === 'kos' ? 50 : 40));
      return { ok: true, menit: 2, teks: d.posisi === 'kos' ? (punya(S, 'dispenser') ? 'Minum dari dispenser.' : 'Beli air mineral Rp4.000.') : 'Minum air dari galon kedai.' };
    }
    if (jenis === 'kopi') {
      if (d.posisi !== 'kedai') return 'Bikin minuman sendiri di kedai.';
      if (!g.KK_STOK.ada(S, 'kopi', 15)) return 'Stok kopi habis.';
      g.KK_STOK.ambil(S, 'kopi', 15); d.melek = batas(d.melek + 28); d.minum = batas(d.minum + 18);
      return { ok: true, menit: 5, teks: 'Ngopi dari stok kedai. Rasa kantuk berkurang.' };
    }
    if (jenis === 'kopisusu') {
      if (d.posisi !== 'kedai') return 'Bikin minuman sendiri di kedai.';
      if (!g.KK_STOK.ada(S, 'kopi', 15) || !g.KK_STOK.ada(S, 'uht', 100)) return 'Stok kopi atau susu UHT kurang.';
      g.KK_STOK.ambil(S, 'kopi', 15); g.KK_STOK.ambil(S, 'uht', 100);
      d.melek = batas(d.melek + 34); d.minum = batas(d.minum + 30); d.kenyang = batas(d.kenyang + 10);
      return { ok: true, menit: 5, teks: 'Minum kopi susu buatan kedai sendiri. Segar dan tidak ngantuk lagi!' };
    }
    return 'Tidak dikenal.';
  }
  /* beli makan atau minum: cara warung (datang sendiri, bayar tunai) atau gofood (diantar, bayar saldo QRIS atau rekening) */
  function hargaItem(S, x) { return x.harga || Math.round(kota(S).makan * x.kali / 500) * 500; }
  function hargaGofood(S, x) { return Math.round(hargaItem(S, x) * N.makanOjol.tambahHarga / 500) * 500 + N.makanOjol.ongkir; }
  function itemMakan(id) { return N.makanan.concat(N.minuman).filter(function (x) { return x.id === id; })[0]; }
  function beli(S, id, cara) {
    var d = S.diri, x = itemMakan(id); if (!x) return 'Tidak dikenal.';
    if (cara === 'gofood') {
      var biaya = hargaGofood(S, x);
      if (!g.KK_UANG.bayarQris(S, biaya)) { if (S.bank.saldo < biaya) return 'Saldo tidak cukup untuk pesan ' + rp(biaya) + '.'; S.bank.saldo -= biaya; S.bank.mutasi.unshift({ n: S.hari, ket: 'GoFood ' + x.nama, jml: -biaya }); }
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya;
      d.kiriman = d.kiriman || []; d.kiriman.push({ tiba: S.hari * 1440 + S.menit + N.makanOjol.tunggu, kenyang: x.kenyang, minum: x.minum, nama: x.nama });
      return { ok: true, menit: 0, teks: 'Pesan ' + x.nama + ' lewat GoFood ' + rp(biaya) + ' termasuk ongkir. Sampai sekitar ' + N.makanOjol.tunggu + ' menit lagi.' };
    }
    var h = hargaItem(S, x);
    if (!bayarTunai(S, h)) return 'Uang di dompet & laci tidak cukup.';
    d.kenyang = batas(d.kenyang + x.kenyang); d.minum = batas(d.minum + x.minum);
    if (x.melek) d.melek = batas(d.melek + x.melek);
    var diKedai = d.posisi === 'kedai', menit = diKedai ? 10 : 15;
    return { ok: true, menit: menit, teks: (diKedai ? 'Beli ' + x.nama + ' di warung sebelah kedai ' : 'Beli ' + x.nama + ' di warung dekat ' + tempat(S) + ' ') + rp(h) + (S.fase === 'buka' && diKedai ? '. Kedai ditinggal ' + menit + ' menit.' : '.') };
  }
  /* makanan GoFood sampai */
  function cekKiriman(S) {
    var d = S.diri, t = S.hari * 1440 + S.menit, teks = [];
    if (d.pesananMakan && t >= d.pesananMakan) { d.pesananMakan = 0; d.kenyang = batas(d.kenyang + 70); d.minum = batas(d.minum + 20); teks.push('Makanan pesanan sudah sampai dan dimakan.'); }
    if (d.kiriman && d.kiriman.length) d.kiriman = d.kiriman.filter(function (k) {
      if (t < k.tiba) return true;
      d.kenyang = batas(d.kenyang + k.kenyang); d.minum = batas(d.minum + k.minum); teks.push(k.nama + ' pesanan GoFood sudah sampai.'); return false;
    });
    return teks.length ? teks.join(' ') : null;
  }

  /* ---------- istirahat dan tidur ---------- */
  function konsolTerbaik(S) {
    var urut = ['ps5disc', 'ps5', 'ps4', 'ps3', 'ps2', 'ps1'];
    for (var i = 0; i < urut.length; i++) {
      if (punyaKonsol(S, urut[i])) return S.game.konsol[urut[i]];
    }
    return null;
  }
  function bisaMainGame(S, gm) {
    if (!gm) return false;
    if (punyaKonsol(S, gm.konsol)) return true;
    if (gm.konsol === 'ps1' && punyaKonsol(S, 'ps2')) return true;
    if (gm.konsol === 'ps4' && (punyaKonsol(S, 'ps5disc') || punyaKonsol(S, 'ps5'))) return true;
    if (gm.konsol === 'ps5' && (punyaKonsol(S, 'ps5') || punyaKonsol(S, 'ps5disc'))) return true;
    return false;
  }
  function gameTerbaik(S) {
    if (!S.game || !S.game.kaset) return null;
    var terbaik = null;
    Object.keys(S.game.kaset).forEach(function (id) {
      var gm = gameModel(id);
      if (gm && bisaMainGame(S, gm) && (!terbaik || gm.stamina > terbaik.stamina)) terbaik = gm;
    });
    return terbaik;
  }
  function istirahat(S, jenis) {
    var d = S.diri;
    if (d.posisi !== 'kos') return 'Pulang dulu.';
    if (jenis === 'ps' && !adaKonsol(S)) return 'Belum punya konsol PlayStation. Beli dulu di Toko Game.';
    if (jenis === 'tv' && !punya(S, 'tv')) return 'Belum punya TV.';
    if (S.rumah.padam && jenis !== 'tidurSiang') return 'Listrik ' + tempat(S) + ' padam. Beli token dulu.';
    var besar = punya(S, 'tv55') ? 4 : 0;
    var kAktif = jenis === 'ps' ? konsolTerbaik(S) : null;
    var km = kAktif ? konsolModel(kAktif.id) : null;
    var gAktif = jenis === 'ps' ? gameTerbaik(S) : null;
    var stamPs = (km ? (km.pulih || km.stamina || 16) : 16) + (gAktif ? gAktif.stamina : S.rumah.barang.kaset ? 6 : 0);
    var naik = jenis === 'ps' ? stamPs + besar : jenis === 'tv' ? 14 + besar : 20;
    if (jenis === 'ps') {
      if (kAktif) { kAktif.pakai = (kAktif.pakai || 0) + 1; catatPakai(S, kAktif.id); }
      if (gAktif && S.game.kaset[gAktif.id]) S.game.kaset[gAktif.id].pakai = (S.game.kaset[gAktif.id].pakai || 0) + 1;
      catatPakai(S, 'tv55'); catatPakai(S, 'tv');
    } else if (jenis === 'tv') {
      catatPakai(S, 'tv55'); catatPakai(S, 'tv'); catatPakai(S, 'sofa'); catatPakai(S, 'karpet');
    }
    d.stamina = batas(d.stamina + naik);
    if (jenis === 'tidurSiang') d.melek = batas(d.melek + 25);
    else d.melek = batas(d.melek - 3);
    var kwPs = km ? (km.watt || km.kw || 0.2) : 0.2;
    listrikKos(S, 60, jenis === 'tidurSiang', jenis === 'ps' ? kwPs + 0.06 : jenis === 'tv' ? 0.06 : 0);
    var teksPs = 'Main ' + (kAktif ? kAktif.nama : 'PS') + (gAktif ? ' (' + gAktif.nama + ')' : '') + ' satu jam. Pikiran segar lagi (+' + naik + ' stamina).';
    return { ok: true, menit: 60, teks: jenis === 'ps' ? teksPs : jenis === 'tv' ? 'Nonton TV satu jam.' : 'Tidur siang satu jam.' };
  }
  /* tidur malam: dari jam sekarang sampai jam bangun besok. Mengembalikan menit tidur */
  function tidur(S, menitSekarang, bangun) {
    var d = S.diri, lama = Math.max(60, (S.menit < 1440 ? 1440 - S.menit : -(S.menit - 1440)) + bangun), jam = lama / 60;
    var ac = !S.rumah.padam && adaAc(S);
    listrikKos(S, lama, true);
    catatPakai(S, 'springbed'); catatPakai(S, 'kipas'); catatPakai(S, 'ac');
    if (S.hp && !S.rumah.padam) { S.hp.baterai = 100; S.hp.cas = false; }
    var mutu = (ac && !S.rumah.padam ? 1 : punya(S, 'kipas') && !S.rumah.padam ? 0.85 : 0.7) * (punya(S, 'springbed') ? 1.1 : S.rumah.jenis === 'rumah' ? 0.9 : 1) * (punya(S, 'airpurifier') ? 1.05 : 1);
    d.melek = batas(d.melek + jam * 14 * mutu);
    d.stamina = batas(d.stamina + jam * 11 * mutu);
    d.kenyang = batas(d.kenyang - jam * 2); d.minum = batas(d.minum - jam * 3);
    return { jam: jam, ac: ac, mutu: mutu };
  }

  /* ---------- isi kos, toko game & jual barang ---------- */
  /* diskon tanggal kembar (1.1, 2.2, ..., 11.11, 12.12) untuk Shopee dan Tokopedia */
  function diskonToko(S, toko) {
    var tk = KAL.tanggalKembar ? KAL.tanggalKembar(S.hari) : null;
    if (!tk) return 0;
    var besar = tk === '11.11' || tk === '12.12';
    if (toko === 'shopee') return besar ? 0.25 : 0.18;
    return besar ? 0.20 : 0.12;
  }
  function hargaToko(S, b, toko) {
    var d = diskonToko(S, toko);
    if (!d) return b.harga;
    return Math.round(b.harga * (1 - d) / 5000) * 5000;
  }
  function bayarBelanja(S, harga, ket, caraBayar) {
    if (caraBayar === 'kk') {
      var err = g.KK_UANG.pakaiKk(S, harga, ket);
      return err === true ? true : err;
    }
    if (caraBayar === 'dompet') {
      if (!g.KK_UANG.bayarDompet || !g.KK_UANG.bayarDompet(S, harga)) return 'Uang di dompet pribadi tidak cukup.';
      return true;
    }
    if (S.bank.saldo < harga) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= harga; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -harga });
    return true;
  }
  function beliBarang(S, id, caraBayar, toko) {
    var b = barang(id); if (!b) return 'Barang tidak dikenal.';
    if (id === 'ps5' || id === 'ps5disc') return beliKonsol(S, id, caraBayar);
    if (punya(S, id) && !b.banyak) return 'Sudah punya ' + b.nama + '.';
    if (b.rumah && S.rumah.jenis !== 'rumah') return b.nama + ' tidak muat di kamar kos. Butuh rumah sendiri.';
    if (b.butuh && !punya(S, b.butuh)) return b.nama + ' butuh ' + barang(b.butuh).nama + ' dulu.';
    var namaToko = toko === 'shopee' ? 'Shopee' : 'Tokopedia';
    var h = hargaToko(S, b, toko || 'tokopedia');
    var by = bayarBelanja(S, h, namaToko + ': ' + b.nama + ' (' + b.merek + ')', caraBayar);
    if (by !== true) return by;
    S.rumah.barang[id] = b.banyak ? (S.rumah.barang[id] || 0) + 1 : true;
    S.rumah.infoBarang = S.rumah.infoBarang || {};
    S.rumah.infoBarang[id] = { dibeli: S.hari, pakai: 0, hargaBeli: h };
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + h;
    return true;
  }
  function infoUmurBarang(S, id) {
    var info = (S.rumah.infoBarang && S.rumah.infoBarang[id]) || { dibeli: S.hari, pakai: 0 };
    return { hari: Math.max(0, S.hari - (info.dibeli == null ? S.hari : info.dibeli)), pakai: info.pakai || 0 };
  }
  function nilaiJualBarang(S, id) {
    if (id === 'ps5' || id === 'ps5disc') return nilaiJualKonsol(S, id);
    var b = barang(id); if (!b || !punya(S, id)) return 0;
    var info = (S.rumah.infoBarang && S.rumah.infoBarang[id]) || { dibeli: S.hari, pakai: 0, hargaBeli: b.harga };
    var J = N.jualBarang || { awal: 0.75, awalBekas: 0.85, perTahun: 0.12, perPakai: 0.0015, min: 0.2 };
    var tahun = Math.max(0, S.hari - (info.dibeli == null ? S.hari : info.dibeli)) / 365;
    var f = J.awal - J.perTahun * tahun - J.perPakai * (info.pakai || 0);
    f = Math.max(J.min, Math.min(J.awal, f));
    return Math.round((info.hargaBeli || b.harga) * f / 5000) * 5000;
  }
  function jualBarang(S, id) {
    if (id === 'ps5' || id === 'ps5disc') return jualKonsol(S, id);
    var b = barang(id); if (!b || !punya(S, id)) return 'Belum punya barang ini.';
    if ((id === 'tv' || id === 'tv55') && !(id === 'tv' ? S.rumah.barang.tv55 : S.rumah.barang.tv) && adaKonsol(S)) {
      return 'Masih ada konsol PlayStation yang memakai TV ini. Jual konsolnya dulu atau punya TV pengganti.';
    }
    var dipakaiOleh = N.barangRumah.filter(function (x) { return x.butuh === id && x.id !== 'ps5' && x.id !== 'ps5disc' && S.rumah.barang[x.id]; })[0];
    if (dipakaiOleh && !(id === 'tv' && S.rumah.barang.tv55)) return 'Masih dibutuhkan oleh ' + dipakaiOleh.nama + '.';
    var h = nilaiJualBarang(S, id);
    if (b.banyak && S.rumah.barang[id] > 1) {
      S.rumah.barang[id]--;
    } else {
      delete S.rumah.barang[id];
      if (S.rumah.infoBarang) delete S.rumah.infoBarang[id];
    }
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual barang bekas: ' + b.nama, jml: h });
    return { ok: true, harga: h, nama: b.nama };
  }

  /* ---------- toko game (PS1-PS4 bekas original, PS5 baru, kaset original) ---------- */
  var KONDISI_BEKAS = [
    { id: 'mulus', label: 'Mulus (90%)', ket: 'Fisik mulus terawat, segel utuh, optik/mesin responsif', f: 0.88 },
    { id: 'normal', label: 'Normal (80%)', ket: 'Lecet halus pemakaian wajar, mesin & stik original normal', f: 0.5 },
    { id: 'lecet', label: 'Lecet Pemakaian (70%)', ket: 'Bodi baret pemakaian, fungsi mesin & pembacaan kaset normal', f: 0.15 }
  ];
  function acakPasarGame(S) {
    var bekasList = (N.konsolGame || []).filter(function (k) { return k.bekas; });
    var unit = [];
    bekasList.forEach(function (k, idx) {
      var kb = KONDISI_BEKAS[(S.hari + idx) % KONDISI_BEKAS.length];
      var tahun = k.tahun[0] + ((S.hari + idx * 3) % (k.tahun[1] - k.tahun[0] + 1));
      var harga = Math.round((k.min + (k.maks - k.min) * kb.f) / 25000) * 25000;
      unit.push({ id: k.id, nama: k.nama, merek: k.merek, tahun: tahun, kondisi: kb.label, ketKondisi: kb.ket, kelengkapan: k.kelengkapan, harga: harga });
      /* tambahkan varian kondisi kedua untuk tiap konsol supaya pembeli bisa pilih harga vs kondisi fisik */
      var kb2 = KONDISI_BEKAS[(S.hari + idx + 1) % KONDISI_BEKAS.length];
      var tahun2 = k.tahun[0] + ((S.hari + idx * 5 + 1) % (k.tahun[1] - k.tahun[0] + 1));
      var harga2 = Math.round((k.min + (k.maks - k.min) * kb2.f) / 25000) * 25000;
      unit.push({ id: k.id, nama: k.nama, merek: k.merek, tahun: tahun2, kondisi: kb2.label, ketKondisi: kb2.ket, kelengkapan: k.kelengkapan, harga: harga2 });
    });
    S.game = S.game || { konsol: {}, kaset: {} };
    S.game.pasar = { minggu: Math.floor(S.hari / 7), unit: unit };
  }
  function beliKonsol(S, kode, caraBayar) {
    if (!punya(S, 'tv')) return 'Butuh TV dulu di kamar untuk menyambungkan konsol PlayStation.';
    if (String(kode).indexOf('pasar:') === 0) {
      var idx = +kode.split(':')[1], u = S.game.pasar && S.game.pasar.unit[idx];
      if (!u) return 'Unit konsol bekas ini sudah terjual.';
      if (punyaKonsol(S, u.id)) return 'Sudah punya ' + u.nama + '. Jual dulu kalau mau ganti kondisi lain.';
      var by = bayarBelanja(S, u.harga, 'Toko Game: ' + u.nama + ' (' + u.kondisi + ')', caraBayar);
      if (by !== true) return by;
      S.game.konsol[u.id] = { id: u.id, nama: u.nama, merek: u.merek, hargaBeli: u.harga, dibeli: S.hari, pakai: 0, bekas: true, kondisi: u.kondisi, ketKondisi: u.ketKondisi, tahun: u.tahun, kelengkapan: u.kelengkapan };
      S.rumah.barang[u.id] = true;
      S.game.pasar.unit.splice(idx, 1);
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + u.harga;
      return true;
    }
    var km = konsolModel(kode); if (!km) return 'Konsol tidak dikenal.';
    if (punyaKonsol(S, km.id)) return 'Sudah punya ' + km.nama + '.';
    var byBaru = bayarBelanja(S, km.harga, 'Toko Game: ' + km.nama + ' (Baru)', caraBayar);
    if (byBaru !== true) return byBaru;
    S.game.konsol[km.id] = { id: km.id, nama: km.nama, merek: km.merek, hargaBeli: km.harga, dibeli: S.hari, pakai: 0, bekas: false, kondisi: 'Baru Resmi', ketKondisi: 'Baru bersegel garansi resmi Sony Indonesia', tahun: km.tahun ? km.tahun[0] : 2023, kelengkapan: km.kelengkapan || 'Unit baru + DualSense + kabel' };
    S.rumah.barang[km.id] = true;
    S.rumah.infoBarang[km.id] = { dibeli: S.hari, pakai: 0, hargaBeli: km.harga };
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + km.harga;
    return true;
  }
  function nilaiJualKonsol(S, id) {
    var k = S.game && S.game.konsol && S.game.konsol[id];
    if (!k) return 0;
    var J = N.jualBarang || { awal: 0.75, awalBekas: 0.85, perTahun: 0.12, perPakai: 0.0015, min: 0.2 };
    var tahun = Math.max(0, S.hari - (k.dibeli == null ? S.hari : k.dibeli)) / 365;
    var awal = k.bekas ? J.awalBekas : J.awal;
    var f = awal - J.perTahun * tahun - J.perPakai * (k.pakai || 0);
    f = Math.max(J.min, Math.min(awal, f));
    return Math.round(k.hargaBeli * f / 10000) * 10000;
  }
  function jualKonsol(S, id) {
    var k = S.game && S.game.konsol && S.game.konsol[id];
    if (!k) return 'Belum punya konsol ini.';
    var h = nilaiJualKonsol(S, id);
    delete S.game.konsol[id];
    delete S.rumah.barang[id];
    if (S.sewaBarang) delete S.sewaBarang['konsol:' + id];
    if (S.rumah.infoBarang) delete S.rumah.infoBarang[id];
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual konsol: ' + k.nama, jml: h });
    return { ok: true, harga: h, nama: k.nama };
  }
  function beliGame(S, gameId, caraBayar) {
    var gm = gameModel(gameId); if (!gm) return 'Game tidak dikenal.';
    if (S.game.kaset && S.game.kaset[gameId]) return 'Sudah punya ' + gm.nama + '.';
    if (!bisaMainGame(S, gm)) {
      var km = konsolModel(gm.konsol);
      return 'Butuh ' + (km ? km.nama : gm.konsol.toUpperCase()) + ' dulu untuk memainkan ' + gm.nama + '.';
    }
    var by = bayarBelanja(S, gm.harga, 'Toko Game: ' + gm.nama, caraBayar);
    if (by !== true) return by;
    S.game.kaset[gameId] = { id: gm.id, nama: gm.nama, konsol: gm.konsol, format: gm.format, hargaBeli: gm.harga, dibeli: S.hari, pakai: 0, bekas: !!gm.bekas, langka: !!gm.langka };
    S.rumah.barang.kaset = Object.keys(S.game.kaset).length;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + gm.harga;
    return true;
  }
  function nilaiJualGame(S, gameId) {
    var gk = S.game && S.game.kaset && S.game.kaset[gameId];
    if (!gk) return 0;
    var J = N.jualBarang || { awal: 0.75, awalBekas: 0.85, perTahun: 0.12, perPakai: 0.0015, min: 0.2 };
    var tahun = Math.max(0, S.hari - (gk.dibeli == null ? S.hari : gk.dibeli)) / 365;
    var awal = gk.langka ? 0.9 : gk.bekas ? J.awalBekas : J.awal;
    var f = awal - (gk.langka ? 0.04 : J.perTahun) * tahun - J.perPakai * (gk.pakai || 0);
    f = Math.max(gk.langka ? 0.65 : J.min, Math.min(awal, f));
    return Math.round(gk.hargaBeli * f / 5000) * 5000;
  }
  function jualGame(S, gameId) {
    var gk = S.game && S.game.kaset && S.game.kaset[gameId];
    if (!gk) return 'Belum punya game ini.';
    var h = nilaiJualGame(S, gameId);
    delete S.game.kaset[gameId];
    var sisa = Object.keys(S.game.kaset).length;
    if (sisa > 0) S.rumah.barang.kaset = sisa; else delete S.rumah.barang.kaset;
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual game: ' + gk.nama, jml: h });
    return { ok: true, harga: h, nama: gk.nama };
  }
  function kameraHp(S) {
    var hm = hpAktif(S), k = (hm && hm.kamera) || 1;
    if (S.hp && S.hp.apk) {
      if (S.hp.apk.capcut) k += 0.25;
      if (S.hp.apk.canva) k += 0.15;
    }
    if (punya(S, 'ringlight')) k += 0.15;
    if (punya(S, 'osmoaction')) k += 0.35;
    return k;
  }

  /* ---------- pulsa, kuota, WiFi, gadget asli (HP, tablet, laptop) & instal APK ---------- */
  function toggleCasHp(S) {
    if (!S.hp) return 'HP belum siap.';
    if (!S.hp.cas) {
      if (S.diri.posisi === 'kos' && S.rumah.padam) return 'Listrik ' + tempat(S) + ' sedang padam. Isi token PLN dulu.';
      if (S.diri.posisi === 'kedai' && g.KK_USAHA && !g.KK_USAHA.listrikNyala(S)) return 'Listrik kedai sedang padam.';
      if (S.hp.baterai >= 100) return 'Baterai HP sudah penuh 100%.';
    }
    S.hp.cas = !S.hp.cas;
    return true;
  }
  function beliPulsa(S, nominal, caraBayar) {
    var h = +nominal; if (!h || h <= 0) return 'Nominal pulsa tidak valid.';
    var by = bayarBelanja(S, h + 1500, 'Isi pulsa seluler ' + rp(h), caraBayar || 'bank');
    if (by !== true) return by;
    S.hp.pulsa = (S.hp.pulsa || 0) + h;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + h + 1500;
    return true;
  }
  function beliKuota(S, idKuota, caraBayar) {
    var pk = (N.paketData && N.paketData.kuota || []).filter(function (x) { return x.id === idKuota; })[0];
    if (!pk) return 'Paket kuota tidak dikenal.';
    if (caraBayar === 'pulsa') {
      if ((S.hp.pulsa || 0) < pk.harga) return 'Pulsa tidak cukup (' + rp(S.hp.pulsa || 0) + '). Isi pulsa dulu atau bayar dari rekening.';
      S.hp.pulsa -= pk.harga;
    } else {
      var by = bayarBelanja(S, pk.harga, 'Beli ' + pk.nama, caraBayar || 'bank');
      if (by !== true) return by;
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + pk.harga;
    }
    S.hp.kuota = Math.round(((S.hp.kuota || 0) + pk.gb) * 100) / 100;
    return true;
  }
  function toggleWifiRumah(S) {
    var wf = N.paketData && N.paketData.wifiRumah;
    if (!wf) return 'Layanan WiFi belum tersedia.';
    if (S.rumah.wifi) {
      S.rumah.wifi = false;
      return true;
    }
    var total = wf.pasang + wf.hargaBulan;
    if (S.bank.saldo < total) return 'Saldo rekening tidak cukup untuk biaya pasang + bulan pertama (' + rp(total) + ').';
    S.bank.saldo -= total;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Pasang ' + wf.nama, jml: -total });
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + total;
    S.rumah.wifi = true;
    return true;
  }
  function infoStorageHp(S) {
    var hm = hpAktif(S), sistem = Math.min(18, Math.round(hm.storage * 0.18));
    var pakaiApk = 0, ramPakai = 1.5;
    Object.keys((S.hp && S.hp.apk) || {}).forEach(function (id) {
      if (!S.hp.apk[id]) return;
      var a = apkModel(id);
      if (a) { pakaiApk += a.rom; if (a.ram > ramPakai) ramPakai = a.ram; }
    });
    return { totalRom: hm.storage, terpakaiRom: sistem + pakaiApk, sisaRom: Math.max(0, hm.storage - sistem - pakaiApk), totalRam: hm.ram, butuhRamMaks: ramPakai };
  }
  function beliGadget(S, id, caraBayar) {
    var gm = gadgetModel(id); if (!gm) return 'Gadget tidak dikenal.';
    if (S.gadget && S.gadget[id]) return 'Sudah punya ' + gm.nama + '.';
    var d = diskonToko(S, 'tokopedia');
    var h = d ? Math.round(gm.harga * (1 - d) / 5000) * 5000 : gm.harga;
    var by = bayarBelanja(S, h, 'Beli gadget: ' + gm.nama + ' (' + gm.merek + ')', caraBayar || 'bank');
    if (by !== true) return by;
    S.gadget = S.gadget || {};
    S.gadget[id] = { id: id, dibeli: S.hari, pakai: 0, hargaBeli: h };
    if (gm.jenis === 'hp') {
      S.hp.id = id;
      S.hp.baterai = 100;
    }
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + h;
    return true;
  }
  function pakaiHp(S, id) {
    var gm = gadgetModel(id);
    if (!gm || gm.jenis !== 'hp' || !S.gadget || !S.gadget[id]) return 'Belum punya HP ini.';
    S.hp.id = id;
    return true;
  }
  function nilaiJualGadget(S, id) {
    var gm = gadgetModel(id), info = S.gadget && S.gadget[id];
    if (!gm || !info) return 0;
    var J = N.jualBarang || { awal: 0.75, perTahun: 0.12, perPakai: 0.0015, min: 0.2 };
    var tahun = Math.max(0, S.hari - (info.dibeli == null ? S.hari : info.dibeli)) / 365;
    var f = Math.max(J.min, Math.min(J.awal, J.awal - J.perTahun * tahun - J.perPakai * (info.pakai || 0)));
    return Math.round((info.hargaBeli || gm.harga) * f / 10000) * 10000;
  }
  function jualGadget(S, id) {
    var gm = gadgetModel(id), info = S.gadget && S.gadget[id];
    if (!gm || !info) return 'Belum punya gadget ini.';
    if (gm.jenis === 'hp') {
      var hpLain = Object.keys(S.gadget).filter(function (k) { return k !== id && gadgetModel(k) && gadgetModel(k).jenis === 'hp'; });
      if (!hpLain.length) return 'Tidak bisa menjual satu-satunya HP milikmu. Beli HP pengganti dulu.';
      if (S.hp.id === id) S.hp.id = hpLain[0];
    }
    var h = nilaiJualGadget(S, id);
    delete S.gadget[id];
    if (S.sewaBarang) delete S.sewaBarang['gadget:' + id];
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual gadget bekas: ' + gm.nama, jml: h });
    return { ok: true, harga: h, nama: gm.nama };
  }
  function instalApk(S, apkId) {
    var a = apkModel(apkId); if (!a) return 'Aplikasi tidak dikenal.';
    if (S.hp.apk && S.hp.apk[apkId]) return a.nama + ' sudah terinstal di HP ini.';
    var hm = hpAktif(S), st = infoStorageHp(S);
    if (hm.ram < a.ram) return 'RAM ' + hm.nama + ' (' + hm.ram + ' GB) tidak kuat menjalankan ' + a.nama + ' (minimal RAM ' + a.ram + ' GB). Upgrade HP dulu!';
    if (st.sisaRom < a.rom) return 'Storage internal ' + hm.nama + ' tidak cukup (sisa ' + st.sisaRom + ' GB, butuh ' + a.rom + ' GB). Hapus APK lain atau ganti HP storage lebih besar.';
    var cekK = pakaiKuota(S, a.kuotaGb || 0.5);
    if (cekK !== true) return cekK;
    S.hp.apk[apkId] = true;
    return true;
  }
  function hapusApk(S, apkId) {
    if (!S.hp || !S.hp.apk || !S.hp.apk[apkId]) return 'Aplikasi belum terinstal.';
    delete S.hp.apk[apkId];
    return true;
  }
  function mainGameHp(S, apkId) {
    var a = apkModel(apkId);
    if (!a || a.jenis !== 'game') return 'Game tidak dikenal.';
    if (!S.hp.apk || !S.hp.apk[apkId]) return 'Instal ' + a.nama + ' dulu di HP.';
    if (S.hp.baterai < 12) return 'Baterai HP terlalu lemah (' + Math.round(S.hp.baterai) + '%). Cas HP dulu.';
    var cekK = pakaiKuota(S, 0.15);
    if (cekK !== true) return cekK;
    var hm = hpAktif(S);
    var kuras = Math.round((5000 / (hm.mah || 5000)) * 9);
    S.hp.baterai = Math.max(0, S.hp.baterai - kuras);
    S.diri.stamina = batas(S.diri.stamina + a.stamina);
    if (S.gadget && S.gadget[hm.id]) S.gadget[hm.id].pakai = (S.gadget[hm.id].pakai || 0) + 1;
    return { ok: true, menit: 30, teks: 'Main ' + a.nama + ' di ' + hm.nama + ' 30 menit (+' + a.stamina + ' stamina, baterai −' + kuras + '%).' };
  }

  /* ---------- keluarga: istri/suami, anak, HB, kehamilan, kuliah & kerja pasangan, sekolah anak, biaya rumah tangga & apotek ---------- */
  var noKeluarga = 0;
  function adalahPasangan(kl) { return kl && (kl.peran === 'istri' || kl.peran === 'suami' || kl.peran === 'pasangan'); }
  function pasanganAktif(S) { return (S.keluarga || []).filter(adalahPasangan)[0] || null; }
  function labelPeran(S, kl) {
    if (!kl) return 'Keluarga';
    if (kl.peran === 'istri') return 'Istri';
    if (kl.peran === 'suami') return 'Suami';
    if (kl.peran === 'pasangan') return kl.gender === 'cewek' ? 'Istri' : 'Suami';
    return 'Anak';
  }
  function tglIso(n) {
    var t = KAL.tgl(n);
    return t.y + '-' + (t.m < 10 ? '0' : '') + t.m + '-' + (t.d < 10 ? '0' : '') + t.d;
  }
  function tambahKeluarga(S, nama, gender, tglLahir, peran) {
    S.keluarga = S.keluarga || [];
    if (S.keluarga.length >= 8) return 'Jumlah anggota keluarga sudah maksimal (8 orang).';
    var nm = (nama || '').trim();
    if (!nm) return 'Masukkan nama anggota keluarga dulu.';
    var gnd = gender === 'cowok' ? 'cowok' : 'cewek';
    var p = peran;
    if (p === 'pasangan') p = gnd === 'cewek' ? 'istri' : 'suami';
    if (p !== 'istri' && p !== 'suami') p = 'anak';
    if ((p === 'istri' || p === 'suami') && pasanganAktif(S)) return 'Kamu sudah memiliki pasangan (' + pasanganAktif(S).nama + ').';
    var tl = tglLahir || (p === 'anak' ? '2019-06-15' : '1999-08-20');
    S.keluarga.push({
      id: 'kl' + (++noKeluarga) + '-' + S.hari,
      nama: nm.slice(0, 22),
      gender: p === 'istri' ? 'cewek' : p === 'suami' ? 'cowok' : gnd,
      tglLahir: tl,
      peran: p,
      lokasi: 'rumah',
      bahagia: 90,
      sakit: null,
      hamil: null,
      kuliah: null,
      lulus: [],
      gelar: '',
      kerja: null,
      sekolah: null,
      jajanHari: -1
    });
    return true;
  }
  function ubahStatusKeluarga(S, id, peranBaru) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    if (peranBaru === 'istri' || peranBaru === 'suami') {
      var lain = pasanganAktif(S);
      if (lain && lain.id !== kl.id) return 'Sudah ada pasangan (' + lain.nama + ').';
      kl.peran = peranBaru;
      kl.gender = peranBaru === 'istri' ? 'cewek' : 'cowok';
      return true;
    }
    kl.peran = 'anak';
    return true;
  }
  function aturLokasiKeluarga(S, id, lokasi) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    if (kl.sakit && lokasi === 'kedai') return kl.nama + ' sedang sakit (' + kl.sakit.nama + '). Obati dulu di Apotek agar bisa beraktivitas.';
    var usia = KAL.usia(S.hari, kl.tglLahir);
    if (lokasi === 'kedai' && usia < 7) return kl.nama + ' masih berusia ' + usia + ' tahun (terlalu kecil untuk bantu di kedai, minimal 7 tahun).';
    kl.lokasi = lokasi === 'kedai' ? 'kedai' : 'rumah';
    return true;
  }
  function beriBiayaKeluarga(S, id, jenis) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    var mapBiaya = {
      jajan: { rp: 20000, ket: 'Uang jajan ' + kl.nama, naik: 10, stam: 4 },
      pendidikan: { rp: 350000, ket: 'Uang buku / les ' + kl.nama, naik: 14, stam: 5 }
    };
    var b = mapBiaya[jenis]; if (!b) return 'Jenis biaya tidak dikenal.';
    if (!bayarTunai(S, b.rp)) {
      if (S.bank.saldo < b.rp) return 'Uang di dompet, laci, maupun rekening tidak cukup untuk ' + b.ket + ' (' + rp(b.rp) + ').';
      S.bank.saldo -= b.rp;
      S.bank.mutasi.unshift({ n: S.hari, ket: b.ket, jml: -b.rp });
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + b.rp;
    }
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + b.naik);
    if (jenis === 'jajan') kl.jajanHari = S.hari;
    S.diri.stamina = batas(S.diri.stamina + b.stam);
    return { ok: true, teks: 'Memberi ' + b.ket.toLowerCase() + ' ' + rp(b.rp) + '. ' + kl.nama + ' senang banget (+' + b.stam + ' stamina untukmu)!' };
  }
  /* biaya rumah tangga: menggantikan biaya makan keluarga; sudah mencakup makan suami, istri, & anak di rumah */
  function hargaRumahTangga(S, paketId) {
    var pk = (N.rumahTangga || []).filter(function (x) { return x.id === paketId; })[0];
    if (!pk) return 0;
    var jmlAnak = (S.keluarga || []).filter(function (kl) { return !adalahPasangan(kl); }).length;
    return pk.dasar + jmlAnak * pk.perAnak;
  }
  function beriRumahTangga(S, paketId) {
    var pk = (N.rumahTangga || []).filter(function (x) { return x.id === paketId; })[0];
    if (!pk) return 'Paket biaya rumah tangga tidak dikenal.';
    var h = hargaRumahTangga(S, paketId);
    if (!bayarTunai(S, h)) {
      if (S.bank.saldo < h) return 'Saldo dompet, laci, dan rekening tidak cukup untuk ' + pk.nama + ' (' + rp(h) + ').';
      S.bank.saldo -= h;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Biaya rumah tangga: ' + pk.nama, jml: -h });
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + h;
    }
    S.rumahTangga = S.rumahTangga || { aktifSampai: -1, paket: null };
    var mulai = Math.max(S.hari, (S.rumahTangga.aktifSampai || -1) + 1);
    S.rumahTangga.aktifSampai = mulai + pk.hari - 1;
    S.rumahTangga.paket = pk.id;
    (S.keluarga || []).forEach(function (kl) { kl.bahagia = Math.min(100, (kl.bahagia || 80) + 8); });
    return { ok: true, teks: 'Biaya rumah tangga (' + pk.nama + ') ' + rp(h) + ' dibayarkan. Makan sekeluarga di rumah gratis sampai ' + KAL.tgl(S.rumahTangga.aktifSampai).d + ' ' + N.namaBulan[KAL.tgl(S.rumahTangga.aktifSampai).m - 1] + '!' };
  }
  function makanDiRumah(S) {
    if (S.diri.posisi !== 'kos') return 'Pulang ke rumah/kos dulu untuk makan masakan rumah.';
    if (!S.rumahTangga || (S.rumahTangga.aktifSampai || -1) < S.hari) return 'Belum memberi uang biaya rumah tangga. Beri di aplikasi Keluarga dulu, atau masak/beli makan.';
    S.diri.kenyang = batas(S.diri.kenyang + 80);
    S.diri.minum = batas(S.diri.minum + 35);
    S.diri.stamina = batas(S.diri.stamina + 8);
    return { ok: true, menit: 20, teks: 'Makan masakan rumah bersama keluarga (Gratis dari biaya rumah tangga). Kenyang & segar!' };
  }
  /* pendidikan kuliah & pekerjaan luar rumah untuk pasangan (istri/suami atas kehendak karakter utama) */
  function daftarKuliahPasangan(S, id, jurusanId) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || !adalahPasangan(kl)) return 'Hanya pasangan (istri/suami) yang bisa kuliah dari menu ini.';
    var jr = (N.pendidikanPasangan || []).filter(function (x) { return x.id === jurusanId; })[0];
    if (!jr) return 'Jurusan kuliah tidak ditemukan.';
    kl.lulus = kl.lulus || [];
    if (kl.lulus.indexOf(jr.id) >= 0) return kl.nama + ' sudah lulus ' + jr.nama + '.';
    if (kl.kuliah) return kl.nama + ' sedang berkuliah di ' + kl.kuliah.nama + '.';
    if (S.bank.saldo < jr.ukt) return 'Saldo rekening tidak cukup untuk UKT semester 1 (' + rp(jr.ukt) + ').';
    S.bank.saldo -= jr.ukt;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'UKT Kuliah ' + kl.nama + ' (' + jr.nama + ')', jml: -jr.ukt });
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jr.ukt;
    kl.kuliah = { id: jr.id, nama: jr.nama, gelar: jr.gelar, semester: 1, totalSemester: jr.semester, ukt: jr.ukt, tagihBerikut: S.hari + 180 };
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + 15);
    return { ok: true, teks: kl.nama + ' resmi kuliah ' + jr.nama + '! UKT semester 1 ' + rp(jr.ukt) + ' lunas.' };
  }
  function aturKerjaPasangan(S, id, kerjaId) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || !adalahPasangan(kl)) return 'Anggota keluarga bukan pasangan.';
    if (!kerjaId || kerjaId === 'berhenti') {
      kl.kerja = null;
      return { ok: true, teks: kl.nama + ' berhenti bekerja di luar dan fokus di rumah.' };
    }
    var kj = (N.kerjaPasangan || []).filter(function (x) { return x.id === kerjaId; })[0];
    if (!kj) return 'Pekerjaan tidak ditemukan.';
    kl.lulus = kl.lulus || [];
    if (kj.butuh && kl.lulus.indexOf(kj.butuh) < 0) {
      var jrB = (N.pendidikanPasangan || []).filter(function (x) { return x.id === kj.butuh; })[0];
      return 'Profesi ' + kj.nama + ' membutuhkan lulusan ' + (jrB ? jrB.nama : kj.butuh) + ' terlebih dahulu.';
    }
    kl.kerja = { id: kj.id, nama: kj.nama, gaji: kj.gaji, mulai: S.hari };
    kl.lokasi = 'rumah';
    return { ok: true, teks: kl.nama + ' mulai bekerja sebagai ' + kj.nama + ' (gaji ' + rp(kj.gaji) + '/bulan, masuk rekening tiap ganti bulan).' };
  }
  /* pendidikan anak sesuai usia nyata: usia 4 PAUD/TK, usia 6 SD, usia 12 SMP, usia 15 SMA */
  function daftarSekolahAnak(S, id, sekolahId) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || adalahPasangan(kl)) return 'Pilih karakter anak untuk didaftarkan sekolah.';
    var sk = (N.sekolahAnak || []).filter(function (x) { return x.id === sekolahId; })[0];
    if (!sk) return 'Jenjang sekolah tidak ditemukan.';
    var usia = KAL.usia(S.hari, kl.tglLahir);
    if (usia < sk.minUsia) return kl.nama + ' masih berusia ' + usia + ' tahun. Syarat minimal masuk ' + sk.nama + ' adalah ' + sk.minUsia + ' tahun.';
    if (kl.sekolah && kl.sekolah.id === sk.id) return kl.nama + ' sudah bersekolah di ' + sk.nama + '.';
    if (sk.pangkal > 0) {
      if (S.bank.saldo < sk.pangkal) return 'Saldo rekening tidak cukup untuk uang pangkal / seragam ' + sk.nama + ' (' + rp(sk.pangkal) + ').';
      S.bank.saldo -= sk.pangkal;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Daftar sekolah ' + kl.nama + ' (' + sk.nama + ')', jml: -sk.pangkal });
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + sk.pangkal;
    }
    kl.sekolah = { id: sk.id, nama: sk.nama, spp: sk.spp, sejak: S.hari };
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + 12);
    return { ok: true, teks: kl.nama + ' resmi masuk ' + sk.nama + '!' + (sk.spp ? ' SPP bulanan ' + rp(sk.spp) + '.' : ' SPP gratis pemerintah.') };
  }
  /* apotek: beli obat, vitamin, kondom, pil KB, suntik KB, testpack, dokter */
  function itemApotek(id) { return (N.apotek || []).filter(function (x) { return x.id === id; })[0]; }
  function beliApotek(S, itemId, caraBayar, targetId) {
    var it = itemApotek(itemId); if (!it) return 'Produk apotek tidak ditemukan.';
    var by = bayarBelanja(S, it.harga, 'Apotek K-24: ' + it.nama, caraBayar || 'dompet');
    if (by !== true) return by;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + it.harga;
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1 };
    if (it.stokKb === 'kondom') {
      S.kesehatan.kondom = (S.kesehatan.kondom || 0) + (it.isi || 3);
      return { ok: true, teks: 'Beli ' + it.nama + ' (+' + (it.isi || 3) + ' pengaman). Total stok pengaman: ' + S.kesehatan.kondom + '.' };
    }
    if (it.kbHari) {
      S.kesehatan.kbSampai = Math.max(S.hari, S.kesehatan.kbSampai || -1) + it.kbHari;
      return { ok: true, teks: it.nama + ' aktif! Perlindungan kontrasepsi aman selama ' + it.kbHari + ' hari.' };
    }
    if (it.cekHamil) {
      var p = pasanganAktif(S);
      var hObj = (p && p.hamil) || S.diri.hamil;
      if (hObj) {
        hObj.terdeteksi = true;
        var mgg = Math.max(1, Math.floor((S.hari - hObj.mulai) / 7));
        return { ok: true, teks: 'Hasil Test Pack: POSITIF (2 garis merah)! Usia kehamilan sekitar ' + mgg + ' minggu. Selamat!' };
      }
      return { ok: true, teks: 'Hasil Test Pack: Negatif (1 garis). Belum ada tanda kehamilan.' };
    }
    if (it.vitaminHamil) {
      S.kesehatan.vitaminHamilSampai = S.hari + 30;
      return { ok: true, teks: 'Vitamin ibu hamil ' + it.nama + ' aktif 30 hari. Kesehatan ibu & janin terjaga!' };
    }
    if (it.sembuhSemua) {
      return pakaiObat(S, it.id, targetId || 'pemain', true);
    }
    if (it.kebalHari) {
      S.diri.kebalSampai = Math.max(S.hari, S.diri.kebalSampai || -1) + it.kebalHari;
      S.diri.stamina = batas(S.diri.stamina + (it.stamina || 20));
      return { ok: true, teks: 'Minum ' + it.nama + '! Stamina +' + (it.stamina || 20) + ' dan kebal sakit ' + it.kebalHari + ' hari.' };
    }
    /* simpan obat di kotak P3K atau langsung diminum bila ada yang sakit */
    S.kesehatan.obat[it.id] = (S.kesehatan.obat[it.id] || 0) + 1;
    return { ok: true, teks: it.nama + ' masuk ke kotak obat (stok: ' + S.kesehatan.obat[it.id] + '). Bisa diminum kapan saja saat sakit.' };
  }
  function pakaiObat(S, itemId, targetId, langsungDokter) {
    var it = itemApotek(itemId); if (!it) return 'Obat tidak ditemukan.';
    if (!langsungDokter && (!S.kesehatan || !S.kesehatan.obat[itemId])) return 'Stok ' + it.nama + ' kosong. Beli dulu di Apotek.';
    var namaTarget = 'Kamu', objSakit = null, sembuhkan = null;
    if (targetId === 'pemain') {
      objSakit = S.diri.sakit;
      sembuhkan = function () { S.diri.sakit = null; S.diri.stamina = batas(S.diri.stamina + 25); };
    } else if (String(targetId).indexOf('staf:') === 0) {
      var sid = String(targetId).slice(5);
      var ks = (S.staf || []).filter(function (x) { return x.id === sid; })[0];
      if (!ks) return 'Karyawan tidak ditemukan.';
      namaTarget = ks.nama;
      if (S.hari < ks.sakitSampai) objSakit = { id: 'demam', nama: 'Sakit / kecapekan', berat: false };
      sembuhkan = function () { ks.sakitSampai = 0; ks.tenaga = 95; ks.setia = Math.min(100, ks.setia + 8); };
    } else {
      var kl = (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
      if (!kl) return 'Anggota keluarga tidak ditemukan.';
      namaTarget = kl.nama;
      objSakit = kl.sakit;
      sembuhkan = function () { kl.sakit = null; kl.bahagia = Math.min(100, (kl.bahagia || 80) + 12); };
    }
    if (!objSakit) return namaTarget + ' saat ini sehat, tidak perlu minum obat.';
    if (!it.sembuhSemua && objSakit.berat) return objSakit.nama + ' tergolong sakit berat! Butuh Berobat ke Klinik / Dokter Umum.';
    if (!it.sembuhSemua && it.sembuh && it.sembuh.indexOf(objSakit.id) < 0) return it.nama + ' kurang cocok untuk ' + objSakit.nama + '. Cek keterangan obat yang sesuai.';
    if (!langsungDokter) S.kesehatan.obat[itemId]--;
    sembuhkan();
    return { ok: true, teks: namaTarget + ' sembuh dari ' + objSakit.nama + ' setelah memakai ' + it.nama + '!' };
  }
  /* HB (Hubungan Suami-Istri di rumah): turunkan HB bar ke 0, penuhkan stamina & melek, cek kontrasepsi & kehamilan, skip waktu */
  function lakukanHb(S, pakaiKondom) {
    if (S.diri.posisi !== 'kos') return 'Pulang ke rumah/kos dulu bersama pasangan.';
    var p = pasanganAktif(S);
    if (!p) return 'Kamu belum memiliki pasangan (Istri/Suami). Tambahkan dulu di aplikasi Keluarga.';
    if (p.lokasi === 'kedai') return p.nama + ' masih di kedai. Minta pulang ke rumah dulu di aplikasi Keluarga.';
    if (S.diri.sakit || p.sakit) return 'Salah satu sedang sakit. Obati dulu di Apotek agar sehat kembali.';
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1 };
    if (pakaiKondom) {
      if ((S.kesehatan.kondom || 0) <= 0) return 'Stok kondom habis! Beli dulu di aplikasi Apotek K-24.';
      S.kesehatan.kondom--;
    }
    var kbAktif = (S.kesehatan.kbSampai || -1) >= S.hari;
    var terlindungi = !!pakaiKondom || kbAktif;
    S.diri.hb = 0;
    S.diri.stamina = 100;
    S.diri.melek = 100;
    p.bahagia = 100;
    /* cek kehamilan jika tanpa pengaman & tanpa KB */
    var hamilBaru = false;
    var targetHamil = p.gender === 'cewek' ? p : ((S.profil && S.profil.gender === 'cewek') ? S.diri : null);
    if (!terlindungi && targetHamil && !targetHamil.hamil) {
      if (Math.random() < 0.35) {
        targetHamil.hamil = { mulai: S.hari, lahir: S.hari + 270, terdeteksi: false };
        hamilBaru = true;
      }
    }
    var jamSekarang = S.menit % 1440;
    var malamSkipSubuh = jamSekarang >= 1200; /* di atas jam 20.00 -> skip sampai jam 04.00 subuh */
    var durasiMenit = malamSkipSubuh ? 0 : (60 + Math.floor(Math.random() * 61)); /* siang 1-2 jam */
    var teks = 'Momen berkualitas bersama ' + p.nama + ' selesai. HB bar turun ke 0%, Stamina & Melek penuh 100%!' +
      (malamSkipSubuh ? ' Tidur nyenyak hingga pukul 04.00 subuh.' : ' (' + durasiMenit + ' menit).') +
      (terlindungi ? ' (Aman memakai ' + (pakaiKondom ? 'pengaman' : 'KB') + ').' : ' (Tanpa kontrasepsi).');
    return { ok: true, malam: malamSkipSubuh, menit: durasiMenit, bangun: 240, hamilBaru: hamilBaru, teks: teks };
  }
  function hapusKeluarga(S, id) {
    S.keluarga = (S.keluarga || []).filter(function (x) { return x.id !== id; });
    return true;
  }

  /* ---------- sewakan barang yang dimiliki (PS1-PS5, motor nganggur, mobil, tablet, laptop, kamera, sepeda) ---------- */
  var TARIF_SEWA_KONSOL = { ps1: 25000, ps2: 35000, ps3: 55000, ps4: 85000, ps5: 150000, ps5disc: 165000 };
  function daftarBisaDisewa(S) {
    var list = [], sw = S.sewaBarang || {};
    /* konsol PlayStation */
    Object.keys((S.game && S.game.konsol) || {}).forEach(function (id) {
      var k = S.game.konsol[id], kunci = 'konsol:' + id;
      list.push({ kunci: kunci, nama: k.nama, kat: 'Rental PS', tarif: TARIF_SEWA_KONSOL[id] || 50000, aktif: !!sw[kunci], ket: 'Disewa harian oleh anak kos/tetangga sekitar' });
    });
    /* motor di armada (selain yang sedang dipakai narik ojol) */
    var armada = S.armadaMotor || (S.motor ? [S.motor] : []);
    armada.forEach(function (m, idx) {
      var kunci = 'motor:' + idx;
      var tarif = Math.max(45000, Math.min(350000, Math.round((m.hargaBeli || 18000000) * 0.0032 / 5000) * 5000));
      list.push({ kunci: kunci, nama: m.nama + ' (Motor #' + (idx + 1) + ')', kat: 'Rental Motor', tarif: tarif, aktif: !!sw[kunci], ket: idx === (S.motorAktif || 0) ? 'Motor utama (tetap bisa disewakan ke kenalan)' : 'Motor cadangan armada' });
    });
    /* mobil */
    if (S.mobil) {
      var kunciM = 'mobil:0';
      var tarifM = Math.max(220000, Math.min(1500000, Math.round((S.mobil.hargaBeli || 200000000) * 0.0014 / 10000) * 10000));
      list.push({ kunci: kunciM, nama: S.mobil.nama, kat: 'Rental Mobil', tarif: tarifM, aktif: !!sw[kunciM], ket: 'Lepas kunci harian dalam kota' });
    }
    /* tablet & laptop di S.gadget */
    Object.keys(S.gadget || {}).forEach(function (id) {
      var gm = gadgetModel(id);
      if (!gm || !gm.sewaHarian) return;
      var kunci = 'gadget:' + id;
      list.push({ kunci: kunci, nama: gm.nama, kat: 'Sewa Gadget', tarif: gm.sewaHarian, aktif: !!sw[kunci], ket: 'Disewa mahasiswa / pekerja lepas harian' });
    });
    /* barang rumah/toko yang punya sewaHarian (Sepeda Polygon, DJI Osmo Action, Proyektor) */
    N.barangRumah.forEach(function (b) {
      if (!b.sewaHarian || !punya(S, b.id)) return;
      var kunci = 'barang:' + b.id;
      list.push({ kunci: kunci, nama: b.nama + ' (' + b.merek + ')', kat: 'Sewa Alat', tarif: b.sewaHarian, aktif: !!sw[kunci], ket: 'Disewakan harian lewat komunitas lokal' });
    });
    return list;
  }
  function toggleSewaBarang(S, kunci) {
    S.sewaBarang = S.sewaBarang || {};
    S.sewaBarang[kunci] = !S.sewaBarang[kunci];
    if (!S.sewaBarang[kunci]) delete S.sewaBarang[kunci];
    return true;
  }

  /* ---------- ganti hari: sewa kos, WiFi, pendapatan rental barang & stok pasar game bekas ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], r = S.rumah, t = KAL.tgl(nBaru);
    listrikKos(S, 0, false);
    if (!S.game || !S.game.pasar || S.game.pasar.minggu !== Math.floor(nBaru / 7)) acakPasarGame(S);
    if (r.jenis === 'kos' && t.d === r.tempo) {
      if (S.bank.saldo >= r.sewa) { S.bank.saldo -= r.sewa; S.bank.mutasi.unshift({ n: nBaru, ket: 'Sewa kos bulan ini', jml: -r.sewa }); kabar.push('Sewa kos ' + rp(r.sewa) + ' sudah dibayar.'); }
      else { r.tunggakan = (r.tunggakan || 0) + r.sewa; kabar.push('Saldo kurang untuk sewa kos. Ibu kos menagih.'); }
    }
    /* tagihan WiFi bulanan kos/rumah */
    if (r.wifi && t.d === r.tempo) {
      var wf = (N.paketData && N.paketData.wifiRumah) || { nama: 'WiFi Fiber', hargaBulan: 285000 };
      if (S.bank.saldo >= wf.hargaBulan) {
        S.bank.saldo -= wf.hargaBulan;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Tagihan ' + wf.nama, jml: -wf.hargaBulan });
        kabar.push('Tagihan bulanan ' + wf.nama + ' ' + rp(wf.hargaBulan) + ' lunas.');
      } else {
        r.wifi = false;
        kabar.push('Saldo kurang untuk bayar WiFi rumah/kos. Layanan WiFi diputus sementara.');
      }
    }
    /* pendapatan pasif dari menyewakan barang (PS, motor, mobil, laptop/tablet, kamera, dll.) */
    var disewa = daftarBisaDisewa(S).filter(function (x) { return x.aktif; });
    if (disewa.length) {
      var totalSewa = 0, namaSewa = [];
      disewa.forEach(function (x) {
        totalSewa += x.tarif;
        namaSewa.push(x.nama);
        var bag = x.kunci.split(':');
        if (bag[0] === 'konsol' && S.game.konsol[bag[1]]) S.game.konsol[bag[1]].pakai = (S.game.konsol[bag[1]].pakai || 0) + 2;
        else if (bag[0] === 'motor' && S.armadaMotor && S.armadaMotor[+bag[1]]) S.armadaMotor[+bag[1]].km = (S.armadaMotor[+bag[1]].km || 0) + 35;
        else if (bag[0] === 'mobil' && S.mobil) S.mobil.km = (S.mobil.km || 0) + 60;
        else if (bag[0] === 'gadget' && S.gadget && S.gadget[bag[1]]) S.gadget[bag[1]].pakai = (S.gadget[bag[1]].pakai || 0) + 1;
        else if (bag[0] === 'barang') catatPakai(S, bag[1]);
      });
      S.bank.saldo += totalSewa;
      S.bank.mutasi.unshift({ n: nBaru, ket: 'Pendapatan sewa/rental (' + disewa.length + ' unit)', jml: totalSewa });
      S.hariIni.rental = totalSewa;
      kabar.push('Pendapatan sewa barang kemarin (' + namaSewa.slice(0, 3).join(', ') + (namaSewa.length > 3 ? ', dll.' : '') + ') cair ' + rp(totalSewa) + ' ke rekening.');
    }
    if (r.kwh < 4) kabar.push('Token listrik ' + tempat(S) + ' tinggal ' + r.kwh.toFixed(1).replace('.', ',') + ' kWh.');
    /* kesehatan pemain & keluarga saat ganti hari */
    var tL = KAL.tgl(nLama), gantiBulan = t.m !== tL.m;
    if (S.diri.sakit && nBaru >= S.diri.sakit.sampai) {
      kabar.push('Kondisi badanmu pulih dari ' + S.diri.sakit.nama + '.');
      S.diri.sakit = null;
    }
    /* cek kehamilan (pada istri atau pemain cewek) */
    function cekKehamilan(pemilik, namaIbu) {
      if (!pemilik || !pemilik.hamil) return;
      var h = pemilik.hamil, usiaHari = nBaru - h.mulai;
      if (!h.terdeteksi && usiaHari >= 30) {
        h.terdeteksi = true;
        kabar.push('Kabar gembira! ' + namaIbu + ' telat datang bulan & positif hamil (usia 4 minggu). Jaga kesehatan dan beri vitamin ibu hamil!');
      }
      if (nBaru >= h.lahir) {
        pemilik.hamil = null;
        var gBayi = Math.random() < 0.5 ? 'cewek' : 'cowok';
        var nmBayi = gBayi === 'cewek' ? (N.namaCewek ? N.namaCewek[nBaru % N.namaCewek.length] : 'Ayu') : (N.namaCowok ? N.namaCowok[nBaru % N.namaCowok.length] : 'Rafa');
        S.keluarga.push({
          id: 'kl' + (++noKeluarga) + '-' + nBaru, nama: nmBayi, gender: gBayi, tglLahir: tglIso(nBaru), peran: 'anak',
          lokasi: 'rumah', bahagia: 100, sakit: null, hamil: null, kuliah: null, lulus: [], gelar: '', kerja: null, sekolah: null, jajanHari: -1
        });
        kabar.unshift('SELAMAT! Bayi ' + (gBayi === 'cewek' ? 'perempuan' : 'laki-laki') + ' bernama ' + nmBayi + ' telah lahir dengan selamat! Lihat di aplikasi Keluarga.');
      }
    }
    cekKehamilan(S.diri, S.namaPemain || 'Kamu');
    (S.keluarga || []).slice().forEach(function (kl) {
      if (kl.sakit && nBaru >= kl.sakit.sampai) {
        kabar.push(kl.nama + ' sudah sembuh dari ' + kl.sakit.nama + '.');
        kl.sakit = null;
      } else if (!kl.sakit && Math.random() < (S.dunia && S.dunia.cuaca ? 0.035 : 0.012)) {
        var pkK = (N.penyakit || [])[Math.floor(Math.random() * 3)] || { id: 'flu', nama: 'Flu & batuk', berat: false };
        kl.sakit = { id: pkK.id, nama: pkK.nama, berat: false, sampai: nBaru + 3 };
        kl.lokasi = 'rumah';
        kabar.push(kl.nama + ' sedang kurang sehat (' + pkK.nama + '). Belikan obat di Apotek K-24!');
      }
      cekKehamilan(kl, kl.nama);
      /* kuliah pasangan tiap semester (180 hari) */
      if (kl.kuliah && nBaru >= kl.kuliah.tagihBerikut) {
        if (kl.kuliah.semester >= kl.kuliah.totalSemester) {
          kl.lulus = kl.lulus || [];
          if (kl.lulus.indexOf(kl.kuliah.id) < 0) kl.lulus.push(kl.kuliah.id);
          kl.gelar = kl.kuliah.gelar;
          kabar.push('WISUDA! ' + kl.nama + ' resmi lulus ' + kl.kuliah.nama + ' (' + kl.gelar + ')! Kini bisa bekerja di profesi barunya.');
          kl.kuliah = null;
        } else if (S.bank.saldo >= kl.kuliah.ukt) {
          S.bank.saldo -= kl.kuliah.ukt;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'UKT Smt ' + (kl.kuliah.semester + 1) + ' ' + kl.nama, jml: -kl.kuliah.ukt });
          kl.kuliah.semester++;
          kl.kuliah.tagihBerikut = nBaru + 180;
          kabar.push(kl.nama + ' naik ke semester ' + kl.kuliah.semester + '/' + kl.kuliah.totalSemester + ' (' + kl.kuliah.nama + '), UKT ' + rp(kl.kuliah.ukt) + ' lunas.');
        } else {
          kl.kuliah.tagihBerikut = nBaru + 7;
          kabar.push('Saldo kurang untuk UKT kuliah ' + kl.nama + ' (' + rp(kl.kuliah.ukt) + '). Ditagih lagi minggu depan.');
        }
      }
      /* gaji bulanan pasangan yang bekerja di luar rumah */
      if (gantiBulan && kl.kerja && kl.kerja.gaji > 0) {
        S.bank.saldo += kl.kerja.gaji;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Gaji ' + kl.nama + ' (' + kl.kerja.nama + ')', jml: kl.kerja.gaji });
        kabar.push('Gaji bulanan ' + kl.nama + ' (' + kl.kerja.nama + ') sebesar ' + rp(kl.kerja.gaji) + ' masuk rekening.');
      }
      /* ulang tahun anak & SPP bulanan sekolah anak */
      if (!adalahPasangan(kl)) {
        var tl = (kl.tglLahir || '').split('-');
        if (tl.length === 3 && t.m === (+tl[1]) && t.d === (+tl[2])) {
          var usB = KAL.usia(nBaru, kl.tglLahir);
          var catatanUsia = usB === 4 ? ' Sudah bisa didaftarkan PAUD / TK!' : usB === 6 ? ' Sudah cukup umur masuk SD!' : usB === 12 ? ' Sudah waktunya masuk SMP!' : usB === 15 ? ' Sudah waktunya masuk SMA!' : '';
          kabar.push('Selamat ulang tahun ke-' + usB + ' untuk ' + kl.nama + '!' + catatanUsia);
        }
        if (gantiBulan && kl.sekolah && kl.sekolah.spp > 0) {
          if (S.bank.saldo >= kl.sekolah.spp) {
            S.bank.saldo -= kl.sekolah.spp;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'SPP ' + kl.sekolah.nama + ' ' + kl.nama, jml: -kl.sekolah.spp });
            kabar.push('SPP bulanan ' + kl.nama + ' (' + kl.sekolah.nama + ') ' + rp(kl.sekolah.spp) + ' dibayar.');
          } else {
            kabar.push('Saldo rekening kurang untuk SPP bulanan ' + kl.nama + ' (' + rp(kl.sekolah.spp) + ').');
          }
        }
      }
    });
    return kabar;
  }
  /* pemain sedang melayani: stamina rendah atau sakit membuat lambat dan kurang ramah */
  function ramah(S) { var d = S.diri; return d ? 4.4 - (d.stamina < 25 ? 1.2 : 0) - (d.kenyang < 15 || d.minum < 15 ? 0.5 : 0) - (d.sakit ? 0.6 : 0) : 4.4; }
  function lambat(S) { var d = S.diri; return d && (d.stamina < 20 || d.melek < 15 || d.sakit) ? 2 : 1; }

  g.KK_DIRI = { beli: beli, hargaItem: hargaItem, hargaGofood: hargaGofood, diskonToko: diskonToko, hargaToko: hargaToko, siapkan: siapkan, jalan: jalan, makan: makan, cekKiriman: cekKiriman, istirahat: istirahat, tidur: tidur,
    beliBarang: beliBarang, infoUmurBarang: infoUmurBarang, nilaiJualBarang: nilaiJualBarang, jualBarang: jualBarang,
    konsolModel: konsolModel, gameModel: gameModel, punyaKonsol: punyaKonsol, adaKonsol: adaKonsol, bisaMainGame: bisaMainGame,
    beliKonsol: beliKonsol, nilaiJualKonsol: nilaiJualKonsol, jualKonsol: jualKonsol, beliGame: beliGame, nilaiJualGame: nilaiJualGame, jualGame: jualGame,
    gadgetModel: gadgetModel, apkModel: apkModel, hpAktif: hpAktif, adaWifi: adaWifi, pakaiKuota: pakaiKuota, toggleCasHp: toggleCasHp,
    beliPulsa: beliPulsa, beliKuota: beliKuota, toggleWifiRumah: toggleWifiRumah, infoStorageHp: infoStorageHp,
    beliGadget: beliGadget, pakaiHp: pakaiHp, nilaiJualGadget: nilaiJualGadget, jualGadget: jualGadget, instalApk: instalApk, hapusApk: hapusApk, mainGameHp: mainGameHp,
    adalahPasangan: adalahPasangan, pasanganAktif: pasanganAktif, labelPeran: labelPeran, tambahKeluarga: tambahKeluarga, ubahStatusKeluarga: ubahStatusKeluarga,
    aturLokasiKeluarga: aturLokasiKeluarga, beriBiayaKeluarga: beriBiayaKeluarga, hapusKeluarga: hapusKeluarga,
    hargaRumahTangga: hargaRumahTangga, beriRumahTangga: beriRumahTangga, makanDiRumah: makanDiRumah,
    daftarKuliahPasangan: daftarKuliahPasangan, aturKerjaPasangan: aturKerjaPasangan, daftarSekolahAnak: daftarSekolahAnak,
    itemApotek: itemApotek, beliApotek: beliApotek, pakaiObat: pakaiObat, lakukanHb: lakukanHb,
    daftarBisaDisewa: daftarBisaDisewa, toggleSewaBarang: toggleSewaBarang,
    beliTokenKos: beliTokenKos, punya: punya, tempat: tempat, adaAc: adaAc, barang: barang, kameraHp: kameraHp, gantiHari: gantiHari, ramah: ramah, lambat: lambat, kota: kota };
})(window);
