/* diri.js — kebutuhan pemain (kenyang, minum, stamina, melek), kos dan isinya, token listrik kos, makan dan tidur.
   Angka bertanda "setelan" disetel lewat uji main; harga dari data nyata.js. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL;
  /* turun per jam saat bangun (setelan) */
  var TURUN = { kenyang: 5, minum: 7, stamina: 4.2 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function blnNo(n) { var t = KAL.tgl(n); return t.y * 12 + t.m; }
  function kota(S) {
    var k = N.kota.filter(function (x) { return x.id === S.kota; })[0];
    if (k) return k;
    var rk = g.KK_RUTE && g.KK_RUTE.kota && g.KK_RUTE.kota[S.kota];
    if (rk) return { id: S.kota, nama: rk.nama, provinsi: rk.prov || rk.pulau || 'Indonesia', umk: 3600000, bbm: rk.pulau === 'Jawa' ? 'jawa' : 'sumatera', kos: 650000, makan: 17000, ppj: 0.03, hargaKopi: 1, zona: rk.tema === 'metropolis' ? 2 : 1 };
    return N.kota[0];
  }
  function batas(x) { return Math.max(0, Math.min(100, x)); }

  function siapkan(S) {
    if (!S.diri) S.diri = { kenyang: 80, minum: 80, stamina: 90, hb: 25, kesehatan: 100, rasaBersalah: 0, hiv: false, posisi: 'kedai', bangun: 360, ketiduran: 0, sakit: null, kebalSampai: -1, hamil: null };
    if (typeof S.diri.melek === 'number') { S.diri.stamina = Math.round(((+S.diri.stamina || 0) + S.diri.melek) / 2); }
    delete S.diri.melek; /* stamina dan melek digabung jadi satu: stamina */
    if (typeof S.diri.hb !== 'number' || isNaN(S.diri.hb)) S.diri.hb = 25;
    if (typeof S.diri.kesehatan !== 'number' || isNaN(S.diri.kesehatan)) S.diri.kesehatan = 100;
    if (typeof S.diri.rasaBersalah !== 'number' || isNaN(S.diri.rasaBersalah)) S.diri.rasaBersalah = 0;
    if (S.diri.hiv === undefined) S.diri.hiv = false;
    if (S.diri.sakit === undefined) S.diri.sakit = null;
    if (S.diri.kebalSampai == null) S.diri.kebalSampai = -1;
    if (S.diri.hamil === undefined) S.diri.hamil = null;
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kondomGerigi: 0, kbSampai: -1, vitaminHamilSampai: -1, arvSampai: -1 };
    S.kesehatan.obat = S.kesehatan.obat || {};
    if (typeof S.kesehatan.kondom !== 'number') S.kesehatan.kondom = 0;
    if (typeof S.kesehatan.kondomGerigi !== 'number') S.kesehatan.kondomGerigi = 0;
    if (S.kesehatan.kbSampai == null) S.kesehatan.kbSampai = -1;
    if (S.kesehatan.arvSampai == null) S.kesehatan.arvSampai = -1;
    if (!S.kesehatan.bpjs) S.kesehatan.bpjs = { kelas: 0, aktif: false, tunggakan: 0 };
    S.rumahTangga = S.rumahTangga || { aktifSampai: -1, paket: null };
    if (!S.rumah) S.rumah = { jenis: 'kos', sewa: kota(S).kos, kwh: 10, barang: {}, tempo: Math.min(28, KAL.tgl(S.hari).d), padam: false };
    if (typeof S.rumah.kwh !== 'number' || isNaN(S.rumah.kwh)) { S.rumah.kwh = 10; S.rumah.padam = false; }
    if (S.rumah.jarak == null) S.rumah.jarak = N.jarakKos;
    S.rumah.infoBarang = S.rumah.infoBarang || {};
    S.game = S.game || { konsol: {}, kaset: {}, pasar: null };
    S.game.konsol = S.game.konsol || {};
    S.game.kaset = S.game.kaset || {};
    S.hp = S.hp || { id: 'redmi12c', nomor: '081256000088', masaAktif: (S.hari || 0) + 30, baterai: 95, cas: false, pulsa: 25000, kuota: 8, apk: { kasirpro: true } };
    if (!S.hp.nomor) S.hp.nomor = '081256000088';
    if (S.hp.masaAktif == null) S.hp.masaAktif = (S.hari || 0) + 30;
    if (typeof S.hp.baterai !== 'number') S.hp.baterai = 95;
    if (typeof S.hp.pulsa !== 'number') S.hp.pulsa = 25000;
    if (typeof S.hp.kuota !== 'number') S.hp.kuota = 8;
    S.hp.apk = S.hp.apk || { kasirpro: true };
    S.pesanKeluarga = S.pesanKeluarga || [];
    S.rentalPs = S.rentalPs || {
      aktif: false,
      lokasi: null,
      unit: [],
      kaset: {},
      tvStok: 0,
      kwh: 25,
      padam: false,
      penjaga: 0,
      jualMinum: false,
      stokMinum: 0,
      tarif: { ps1: 3000, ps2: 5000, ps3: 8000, ps4: 12000, ps5: 20000, ps5disc: 20000 },
      hariIni: { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 },
      total: { omzet: 0, laba: 0 }
    };
    if (!S.rentalPs.tarif) S.rentalPs.tarif = { ps1: 3000, ps2: 5000, ps3: 8000, ps4: 12000, ps5: 20000, ps5disc: 20000 };
    if (!S.rentalPs.kaset) S.rentalPs.kaset = {};
    if (!S.rentalPs.hariIni) S.rentalPs.hariIni = { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 };
    if (!S.rentalPs.total) S.rentalPs.total = { omzet: 0, laba: 0 };
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
    if (typeof S.penghasilanBulanIni !== 'number') S.penghasilanBulanIni = 0;
    if (typeof S.utangPasangan !== 'number') S.utangPasangan = 0;
    if (!S.cicilanHadiah) S.cicilanHadiah = [];
    S.keluarga.forEach(function (kl) {
      if (adalahPasangan(kl)) {
        if (typeof kl.hb !== 'number') kl.hb = 30;
        if (typeof kl.dompet !== 'number') kl.dompet = 500000;
        if (typeof kl.tabungan !== 'number') kl.tabungan = 2500000;
      } else {
        if (!kl.aktivitas) kl.aktivitas = 'rumah';
      }
      if (!kl.hadiah) kl.hadiah = [];
      if (typeof kl.perasaan !== 'number') kl.perasaan = adalahPasangan(kl) ? 75 : adalahIpar(kl) ? 50 : 75;
    });
    (S.teman || []).forEach(function (tm) {
      if (typeof tm.perasaan !== 'number') tm.perasaan = tm.peran === 'pacar' ? 65 : tm.peran === 'sahabat' ? 45 : tm.peran === 'mantan' ? 30 : 25;
    });
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
  function pbModel(id) { return (N.daftarPowerBank || []).filter(function (x) { return x.id === id; })[0]; }
  function pbAktifInfo(S) {
    if (!S || !S.hp || !S.hp.pbAktif) return null;
    var m = pbModel(S.hp.pbAktif), st = S.hp.pbMilik && S.hp.pbMilik[S.hp.pbAktif];
    if (!m || !st) return null;
    if (typeof st.sisaMah !== 'number' || isNaN(st.sisaMah)) st.sisaMah = m.mah;
    st.sisaMah = Math.max(0, Math.min(m.mah, st.sisaMah));
    return { model: m, state: st, persen: Math.round((st.sisaMah / m.mah) * 100) };
  }
  function apkModel(id) { return (N.apkHp || []).filter(function (x) { return x.id === id; })[0]; }
  function hpAktif(S) { return gadgetModel(S.hp && S.hp.id) || gadgetModel('redmi12c'); }
  function adaWifi(S) {
    if (!S.diri) return false;
    if (S.diri.posisi === 'kos') return !!(S.rumah && S.rumah.wifi && !S.rumah.padam);
    return !!(g.KK_USAHA && g.KK_USAHA.punya(S, 'wifi') && g.KK_USAHA.listrikNyala(S));
  }
  function pakaiKuota(S, gb) {
    if (!S.hp) return true;
    var pbInfoQ = pbAktifInfo(S);
    var pbOkQ = !!(S.hp.pbPasang && pbInfoQ && pbInfoQ.state.sisaMah > 0);
    if ((S.hp.baterai || 0) <= 0 && !pbOkQ) return 'Baterai HP habis (0%)! Cas HP atau sambungkan Power Bank di aplikasi Gadget & Kuota.';
    if (adaWifi(S)) return true;
    if (S.hp.masaAktif != null && S.hari > S.hp.masaAktif) {
      return 'Masa aktif kartu ' + (S.hp.nomor || '081256000088') + ' sudah habis (masa tenggang)! Isi pulsa dulu untuk memperpanjang masa aktif kartu.';
    }
    gb = Math.max(0, +gb || 0);
    if (gb <= 0) return true;
    S.hp.kuota = Math.max(0, +(S.hp.kuota || 0));
    if (S.hp.kuota >= gb) {
      S.hp.kuota = Math.max(0, S.hp.kuota - gb);
      return true;
    }
    /* habiskan sisa kuota dulu, lalu akumulasi kelebihan GB agar pulsa tidak terpotong Rp500 setiap frame */
    var kurangGb = gb - S.hp.kuota;
    S.hp.kuota = 0;
    S.hp.kuotaUtangGb = (S.hp.kuotaUtangGb || 0) + kurangGb;
    var blok = Math.floor(S.hp.kuotaUtangGb / 0.1); /* Rp1.500 per 100 MB (0,1 GB) */
    if (blok > 0) {
      var biayaPulsa = blok * 1500;
      if ((S.hp.pulsa || 0) >= biayaPulsa) {
        S.hp.pulsa -= biayaPulsa;
        S.hp.kuotaUtangGb = Math.max(0, S.hp.kuotaUtangGb - blok * 0.1);
        return true;
      }
      S.hp.kuotaUtangGb = 0;
      return 'Kuota internet & pulsa habis! Isi kuota/pulsa di aplikasi Gadget & Kuota atau pasang WiFi.';
    }
    if ((S.hp.pulsa || 0) >= 1500) return true;
    S.hp.kuotaUtangGb = 0;
    return 'Kuota internet & pulsa habis! Isi kuota/pulsa di aplikasi Gadget & Kuota atau pasang WiFi.';
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
    var sbKebal = !!(S.sandbox && S.sandbox.aktif && S.sandbox.kebal);
    d.kenyang = sbKebal ? Math.max(95, d.kenyang) : batas(d.kenyang - TURUN.kenyang * j);
    d.minum = sbKebal ? Math.max(95, d.minum) : batas(d.minum - TURUN.minum * j);
    /* HB bar (gairah/kedekatan pasangan) perlahan meningkat sepanjang hari */
    var lajuHb = 2.2 * (d.stamina > 45 && !d.sakit ? 1.15 : 0.65);
    d.hb = batas((d.hb || 0) + lajuHb * j);
    /* kesehatan pemain (dipengaruhi sakit, HIV tanpa ARV, atau istirahat/makan cukup) */
    if (typeof d.kesehatan !== 'number') d.kesehatan = 100;
    if (d.hiv && S.hari > (S.kesehatan && S.kesehatan.arvSampai || -1)) {
      d.kesehatan = Math.max(5, d.kesehatan - 1.8 * j);
    } else if (d.sakit) {
      d.kesehatan = Math.max(15, d.kesehatan - (d.sakit.berat ? 1.6 : 0.8) * j);
    } else if (d.kenyang > 35 && d.minum > 35 && d.stamina > 30) {
      d.kesehatan = Math.min(100, d.kesehatan + 0.6 * j);
    }
    /* pasangan juga memiliki bar HB yang meningkat & bisa mengajak HB saat karakter di rumah jam >= 20.00 */
    if (S.keluarga && S.keluarga.length) {
      S.keluarga.forEach(function (kl) {
        if (!adalahPasangan(kl)) return;
        kl.hb = batas((kl.hb == null ? 30 : kl.hb) + 2.5 * j);
        if (d.posisi === 'kos' && (S.menit % 1440) >= 1200 && kl.lokasi !== 'kedai' && !kl.sakit && !(kl.keluar && (S.hari * 24 + Math.floor(S.menit / 60)) < kl.keluar.sampai) && !d.sakit && kl.hb >= 65 && S.ajakanHbHari !== S.hari) {
          S.ajakanHbHari = S.hari;
          S.ajakanHbPasanganId = kl.id;
        }
      });
      /* istri/pasangan kadang kirim pesan WA atau telepon saat pemain di luar rumah untuk tanya kabar atau ingatkan kebutuhan dapur */
      var pUtama = pasanganAktif(S);
      if (pUtama && d.posisi !== 'kos' && (S.menit % 1440) >= 540 && (S.menit % 1440) <= 1140 && S.pesanPasanganHari !== S.hari && Math.random() < 0.25 * j) {
        S.pesanPasanganHari = S.hari;
        var butuhDapur = !S.rumahTangga || (S.rumahTangga.aktifSampai || -1) <= S.hari;
        var teksPesan = butuhDapur
          ? 'Sayang, uang belanja dapur bulan ini udah menipis nih. Jangan lupa berikan nafkah bulanan di menu Keluarga ya biar aku bisa belanja keperluan rumah tangga!'
          : ['Sayang, lagi sibuk narik ya? Jangan lupa makan & jaga kesehatan ya!', 'Sayang, semangat kerjanya hari ini! Nanti malam pulang ke rumah ya, aku kangen.', 'Halo sayang, gimana narik hari ini? Lancar kan?'][S.hari % 3];
        var viaTelp = Math.random() < 0.35;
        S.pesanKeluarga = S.pesanKeluarga || [];
        S.pesanKeluarga.unshift({ hari: S.hari, jam: S.menit % 1440, dari: pUtama.nama, jenis: viaTelp ? 'Telepon Masuk' : 'WhatsApp Masuk', teks: teksPesan });
        if (S.pesanKeluarga.length > 25) S.pesanKeluarga.length = 25;
        kabar.push((viaTelp ? '📞 Telepon dari ' : '💬 WhatsApp dari ') + pUtama.nama + ': "' + teksPesan + '"');
      }
    }
    var turunStamina = TURUN.stamina * (kerja ? 1.5 : 1) + (d.kenyang < 5 ? 8 : 0) + (d.minum < 5 ? 10 : 0) + (d.sakit ? (d.sakit.berat ? 5 : 2.5) : 0) + (d.kesehatan < 50 ? 2 : 0);
    if (d.posisi === 'kos' && !kerja) turunStamina = -(punya(S, 'kursipijat') ? 18 : punya(S, 'sofa') ? 12 : punya(S, 'tv') || punya(S, 'karpet') ? 10 : 6);
    d.stamina = sbKebal ? Math.max(95, d.stamina) : batas(d.stamina - turunStamina * j);
    if (sbKebal) { d.kesehatan = Math.max(98, d.kesehatan); d.sakit = null; if (S.hp) S.hp.baterai = Math.max(95, S.hp.baterai || 95); }
    /* peluang sakit akibat aktivitas berlebihan, telat makan, atau cuaca hujan */
    if (!sbKebal && !d.sakit && S.hari > (d.kebalSampai || -1) && j > 0) {
      var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S);
      var naikMobilOnline = S.ojek && S.ojek.online && S.ojek.mode === 'mobil';
      var diluarHujan = hujan && d.posisi !== 'kos' && !(S.mobil && (!S.ojek.online || naikMobilOnline));
      var pSakit = 0, idPenyakit = 'demam';
      if (d.stamina < 12) { pSakit = 0.08; idPenyakit = 'tifus'; }
      else if (d.kenyang < 8) { pSakit = 0.06; idPenyakit = 'maag'; }
      else if (diluarHujan && S.ojek && S.ojek.online) { pSakit = 0.055; idPenyakit = Math.random() < 0.5 ? 'masukangin' : 'flu'; }
      else if (diluarHujan) { pSakit = 0.025; idPenyakit = 'masukangin'; }
      else if (d.stamina < 18) { pSakit = 0.035; idPenyakit = 'demam'; }
      if (pSakit > 0 && Math.random() < pSakit * j) {
        var pk = (N.penyakit || []).filter(function (x) { return x.id === idPenyakit; })[0] || { id: 'demam', nama: 'Demam & meriang', berat: false, obat: 'Paracetamol' };
        d.sakit = { id: pk.id, nama: pk.nama, berat: !!pk.berat, sampai: S.hari + (pk.berat ? 5 : 3) };
        kabar.push('Kamu jatuh sakit (' + pk.nama + ') karena ' + (pk.sebab || 'kelelahan') + '. Beli obat di aplikasi Apotek K-24!');
      }
    }
    listrikKos(S, dMenit, false);
    /* baterai HP, Power Bank (efisiensi konversi nyata 80%), & charger sesuai mAh dan Watt asli */
    if (S.hp) {
      var hm = hpAktif(S), mah = (hm && hm.mah) || 5000, watt = (hm && hm.watt) || 10;
      var listrikTersedia = (d.posisi === 'kos' && !S.rumah.padam) || (d.posisi === 'kedai' && !(S.usaha && S.usaha.berhentiSewa) && (!g.KK_USAHA || g.KK_USAHA.listrikNyala(S)));
      var bisaCas = S.hp.cas && listrikTersedia;
      var pbInfo = pbAktifInfo(S);
      /* cas Power Bank di stopkontak rumah/kos (wattIn × 200 mAh/jam) */
      if (S.hp.pbCas) {
        if (!listrikTersedia || !pbInfo) {
          S.hp.pbCas = false;
        } else {
          var tambahPb = (pbInfo.model.wattIn || 18) * 200 * j;
          var sblmPb = pbInfo.state.sisaMah;
          pbInfo.state.sisaMah = Math.min(pbInfo.model.mah, pbInfo.state.sisaMah + tambahPb);
          if (sblmPb < pbInfo.model.mah && pbInfo.state.sisaMah >= pbInfo.model.mah) {
            S.hp.pbCas = false;
            kabar.push('🔋 Power Bank ' + pbInfo.model.nama + ' penuh 100% (' + pbInfo.model.mah.toLocaleString('id-ID') + ' mAh)!');
          }
        }
      }
      if (bisaCas) {
        /* kecepatan cas proporsional dengan Watt charger terhadap kapasitas baterai mAh */
        var naikBat = (watt / (mah / 1000)) * j * 18;
        var batLama = S.hp.baterai;
        S.hp.baterai = Math.min(100, S.hp.baterai + naikBat);
        if (batLama < 100 && S.hp.baterai >= 100) { S.hp.cas = false; kabar.push('Baterai ' + hm.nama + ' penuh 100% (charger ' + watt + 'W).'); }
      } else {
        if (S.hp.cas && !bisaCas) S.hp.cas = false;
        var pakaiOjek = S.ojek && S.ojek.online;
        var sedangTrip = pakaiOjek && S.ojek.trip;
        var pakaiTravel = S.travel && S.travel.aktif;
        /* konsumsi nyata HP dalam mAh/jam: Maps+GPS+layar 400 mAh/j, ojol/travel standby 225 mAh/j, harian 60 mAh/j */
        var lajuKuras = sedangTrip ? 8 : (pakaiOjek || pakaiTravel) ? 4.5 : 1.2;
        var butuhMah = lajuKuras * 50 * j; /* 1% HP 5000 mAh = 50 mAh */
        if (S.hp.pbPasang && pbInfo && pbInfo.state.sisaMah > 0) {
          /* Power Bank tersambung: suplai daya langsung ke HP + isi baterai HP menuju 100% (efisiensi konversi nyata 80%) */
          var wattEf = Math.min(pbInfo.model.wattOut || 18, Math.max(15, watt));
          var maksKirim = wattEf * 180 * j;
          var kurangHpMah = Math.max(0, (100 - S.hp.baterai) / 100 * mah);
          var kirimTotal = Math.min(maksKirim, butuhMah + kurangHpMah);
          var sedotPb = kirimTotal / 0.8; /* efisiensi konversi DC-DC 3.7V->5V ~80% */
          if (sedotPb > pbInfo.state.sisaMah) {
            kirimTotal = pbInfo.state.sisaMah * 0.8;
            pbInfo.state.sisaMah = 0;
            S.hp.pbPasang = false;
            kabar.push('🔋 Daya Power Bank ' + pbInfo.model.nama + ' habis (0 mAh)! Cas lagi di rumah/kos.');
          } else {
            pbInfo.state.sisaMah -= sedotPb;
          }
          var deltaMah = kirimTotal - butuhMah;
          S.hp.baterai = Math.max(0, Math.min(100, S.hp.baterai + (deltaMah / mah) * 100));
        } else {
          if (S.hp.pbPasang && (!pbInfo || pbInfo.state.sisaMah <= 0)) S.hp.pbPasang = false;
          var turunBat = (butuhMah / mah) * 100;
          var sblm = S.hp.baterai;
          S.hp.baterai = Math.max(0, S.hp.baterai - turunBat);
          if (sblm > 15 && S.hp.baterai <= 15) kabar.push('Baterai ' + hm.nama + ' tinggal ' + Math.round(S.hp.baterai) + '%! Segera colok charger atau sambungkan Power Bank.');
          if (sblm > 0 && S.hp.baterai <= 0) {
            if (pakaiOjek && g.KK_OJEK) { g.KK_OJEK.offline(S, true); kabar.push('HP mati kehabisan baterai karena GPS Maps ojol! Akun driver otomatis offline.'); }
            else kabar.push('Baterai HP habis (0%). Colok charger atau sambungkan Power Bank di menu HP.');
          }
        }
      }
      /* kuota terpakai sangat presisi saat online narik ojol (Google Maps / Apple Maps & order) tanpa WiFi */
      if (S.ojek && S.ojek.online && !adaWifi(S)) {
        var kuotaMapsJam = S.ojek.trip ? 0.048 : 0.028; /* 48 MB/jam saat navigasi trip, 28 MB/jam saat standby */
        var ck = pakaiKuota(S, kuotaMapsJam * j);
        if (ck !== true) {
          if (g.KK_OJEK) g.KK_OJEK.offline(S, true);
          kabar.push('Akun driver ojol otomatis offline: ' + ck);
        }
      }
    }
    /* simulasi usaha Rental PS berjalan tiap menit */
    var kbRental = jalanRentalPs(S, dMenit);
    if (kbRental && kbRental.length) kabar = kabar.concat(kbRental);
    /* anak / keluarga yang diminta bantu kerja ringan di kedai */
    if (S.fase === 'buka' && S.keluarga && S.keluarga.length) {
      var bantu = S.keluarga.filter(function (kl) { return kl.lokasi === 'kedai'; });
      if (bantu.length && S.dunia) {
        S.dunia.kotor = Math.max(0, S.dunia.kotor - dMenit * 0.25 * bantu.length);
      }
    }
    if (d.stamina < 10 && Math.random() < 0.2 * j) { d.ketiduran = 30; kabar.push('Kamu ketiduran sebentar karena mengantuk berat.'); }
    if (d.stamina < 3) { d.ketiduran = 120; kabar.push('Kamu kelelahan dan harus istirahat 2 jam.'); d.stamina = 20; }
    /* Auto Makan & Minum hemat biaya (jika diaktifkan pemain) */
    if (S.autoMakanMinum && j > 0) {
      if (d.minum < 30) {
        var rmAuto = (d.posisi === 'kos' && punya(S, 'dispenser')) ? makan(S, 'air')
          : ((S.uang && S.uang.dompet >= 4000) ? beli(S, 'air', 'warung') : null);
        if (rmAuto && rmAuto.ok) kabar.push('Auto Minum: ' + rmAuto.teks);
      }
      if (d.kenyang < 30) {
        var rkAuto = (d.posisi === 'kos' && S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari) ? makanDiRumah(S)
          : (d.posisi === 'kos' && (punya(S, 'ricecooker') || punya(S, 'kompor')) && S.uang && S.uang.dompet >= 7000) ? makan(S, 'masak')
          : ((S.uang && S.uang.dompet >= 5000) ? beli(S, 'gorengan', 'warung') : null);
        if (rkAuto && rkAuto.ok) kabar.push('Auto Makan: ' + rkAuto.teks);
      }
    }
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

  /* ---------- makan dan minum (pengeluaran pribadi di luar kedai HANYA memakai uang dompet pribadi, TIDAK menyentuh uang laci kedai) ---------- */
  function bayarTunai(S, jml) {
    if (g.KK_UANG.bayarDompet && g.KK_UANG.bayarDompet(S, jml)) {
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true;
    }
    return false;
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
      if (!bayarTunai(S, 7000)) return 'Uang tunai di dompet pribadi tidak cukup untuk beras dan lauk (Rp7.000).';
      catatPakai(S, 'ricecooker'); catatPakai(S, 'kompor'); catatPakai(S, 'mejamakan');
      d.kenyang = batas(d.kenyang + 60 + (punya(S, 'mejamakan') ? 10 : 0) + (punya(S, 'kompor') ? 5 : 0));
      return { ok: true, menit: 40, teks: 'Masak nasi dan telur di ' + tempat(S) + ', sekitar Rp7.000 (dari dompet pribadi).' };
    }
    if (jenis === 'air') {
      if (d.posisi === 'kos') { if (!punya(S, 'dispenser') && !bayarTunai(S, 4000)) return 'Uang tunai di dompet pribadi tidak cukup (Rp4.000).'; catatPakai(S, 'dispenser'); catatPakai(S, 'kulkas'); catatPakai(S, 'kulkas2'); }
      else if (!bayarTunai(S, 4000)) return 'Uang tunai di dompet pribadi tidak cukup (Rp4.000).';
      d.minum = batas(d.minum + (punya(S, 'kulkas') && d.posisi === 'kos' ? 50 : 40));
      return { ok: true, menit: 2, teks: d.posisi === 'kos' ? (punya(S, 'dispenser') ? 'Minum dari dispenser.' : 'Beli air mineral Rp4.000 (dari dompet).') : 'Beli air mineral Rp4.000 (dari dompet).' };
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
    if (!bayarTunai(S, h)) return 'Uang tunai di dompet pribadi tidak cukup (' + rp(h) + '). Tarik tunai ke dompet dulu atau pesan lewat GoFood.';
    d.kenyang = batas(d.kenyang + x.kenyang); d.minum = batas(d.minum + x.minum);
    if (x.melek) d.stamina = batas(d.stamina + x.melek);
    var diKedai = d.posisi === 'kedai', menit = diKedai ? 10 : 15;
    return { ok: true, menit: menit, teks: ('Beli ' + x.nama + ' di warung terdekat ') + rp(h) + '.' };
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
    d.stamina = batas(d.stamina + jam * 14 * mutu);
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
    var thnKini = KAL.tgl(S.hari).y, rilis = +(gm.tahun || 2023), bebasThn = !!(g.KK_TOWER && g.KK_TOWER.bukaSemuaTahun(S));
    if (!bebasThn && rilis > thnKini) return gm.nama + ' baru rilis tahun ' + rilis + ' (tahun saat ini ' + thnKini + ').';
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
      if (S.diri.posisi !== 'kos' && (S.usaha && S.usaha.berhentiSewa)) return 'Kamu sedang di jalan! Pulang ke rumah/kos untuk colok charger listrik, atau sambungkan Power Bank.';
      if (S.diri.posisi === 'kedai' && g.KK_USAHA && !g.KK_USAHA.listrikNyala(S)) return 'Listrik sedang padam.';
      if (S.hp.baterai >= 100) return 'Baterai HP sudah penuh 100%.';
      S.hp.pbPasang = false;
    }
    S.hp.cas = !S.hp.cas;
    return true;
  }
  function beliPulsa(S, nominal, caraBayar) {
    var h = +nominal; if (!h || h <= 0) return 'Nominal pulsa tidak valid.';
    var by = bayarBelanja(S, h + 1500, 'Isi pulsa seluler ' + (S.hp && S.hp.nomor || '081256000088') + ' ' + rp(h), caraBayar || 'bank');
    if (by !== true) return by;
    S.hp.pulsa = (S.hp.pulsa || 0) + h;
    /* masa aktif ala Telkomsel: 5rb=7 hari, 10rb=15, 20rb=30, 25rb=40, 50rb=60, 100rb=90, 200rb=120 */
    var tambahHari = h >= 200000 ? 120 : h >= 100000 ? 90 : h >= 50000 ? 60 : h >= 25000 ? 40 : h >= 20000 ? 30 : h >= 10000 ? 15 : h >= 5000 ? 7 : 3;
    S.hp.masaAktif = Math.max(S.hari, S.hp.masaAktif || S.hari) + tambahHari;
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
    S.hp.kuota = Math.round(((S.hp.kuota || 0) + pk.gb) * 1000) / 1000;
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
    var thnKini = KAL.tgl(S.hari).y, rilis = +(gm.tahunRilis || gm.tahun || 2023), bebasThn = !!(g.KK_TOWER && g.KK_TOWER.bukaSemuaTahun(S));
    if (!bebasThn && rilis > thnKini) return gm.nama + ' belum rilis (rilis ' + rilis + ', tahun game sekarang ' + thnKini + ').';
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
  function beliPowerBank(S, id, caraBayar) {
    var pb = pbModel(id); if (!pb) return 'Power Bank tidak dikenal.';
    S.hp = S.hp || {}; S.hp.pbMilik = S.hp.pbMilik || {};
    if (S.hp.pbMilik[id]) return 'Sudah punya ' + pb.nama + '.';
    var d = diskonToko(S, 'tokopedia');
    var h = d ? Math.round(pb.harga * (1 - d) / 5000) * 5000 : pb.harga;
    var by = bayarBelanja(S, h, 'Beli Power Bank: ' + pb.nama, caraBayar || 'bank');
    if (by !== true) return by;
    S.hp.pbMilik[id] = { sisaMah: pb.mah, dibeli: S.hari };
    S.hp.pbAktif = id;
    S.hp.pbPasang = true;
    S.hp.pbCas = false;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + h;
    return { ok: true, teks: pb.nama + ' dibeli (' + rp(h) + ') dan langsung disambungkan ke HP!' };
  }
  function pakaiPowerBank(S, id) {
    if (!S.hp || !S.hp.pbMilik || !S.hp.pbMilik[id]) return 'Belum punya Power Bank ini.';
    S.hp.pbAktif = id;
    S.hp.pbCas = false;
    var pb = pbModel(id);
    return { ok: true, teks: 'Power Bank aktif diganti ke ' + (pb ? pb.nama : id) + '.' };
  }
  function togglePowerBank(S) {
    var info = pbAktifInfo(S);
    if (!info) return 'Belum punya Power Bank. Beli dulu di Gadget & Kuota → Power Bank.';
    if (S.hp.pbPasang) {
      S.hp.pbPasang = false;
      return { ok: true, teks: 'Kabel Power Bank ' + info.model.nama + ' dicabut dari HP.' };
    }
    if (info.state.sisaMah <= 0) return 'Daya Power Bank ' + info.model.nama + ' habis (0 mAh). Cas dulu di rumah/kos.';
    S.hp.pbCas = false;
    S.hp.pbPasang = true;
    return { ok: true, teks: '🔋 Power Bank ' + info.model.nama + ' (' + Math.round(info.state.sisaMah).toLocaleString('id-ID') + ' mAh) tersambung ke HP!' };
  }
  function toggleCasPowerBank(S) {
    var info = pbAktifInfo(S);
    if (!info) return 'Belum punya Power Bank.';
    if (S.hp.pbCas) { S.hp.pbCas = false; return { ok: true, teks: 'Cas Power Bank dicabut.' }; }
    var d = S.diri;
    if (d.posisi === 'kos' && S.rumah.padam) return 'Token listrik rumah/kos habis! Beli token di PLN Mobile dulu.';
    if (d.posisi !== 'kos' && ((S.usaha && S.usaha.berhentiSewa) || !g.KK_USAHA || !g.KK_USAHA.listrikNyala(S))) return 'Pulang ke rumah/kos dulu untuk mengecas Power Bank di stopkontak.';
    if (info.state.sisaMah >= info.model.mah) return 'Daya Power Bank sudah penuh 100%.';
    S.hp.pbPasang = false;
    S.hp.pbCas = true;
    return { ok: true, teks: '⚡ Power Bank ' + info.model.nama + ' mulai dicas (' + info.model.wattIn + 'W).' };
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
    var kuras = Math.round((5000 / (hm.mah || 5000)) * 7);
    S.hp.baterai = Math.max(0, S.hp.baterai - kuras);
    S.diri.stamina = batas(S.diri.stamina + a.stamina);
    if (S.gadget && S.gadget[hm.id]) S.gadget[hm.id].pakai = (S.gadget[hm.id].pakai || 0) + 1;
    return { ok: true, menit: 30, teks: 'Main ' + a.nama + ' di ' + hm.nama + ' 30 menit (+' + a.stamina + ' stamina, baterai −' + kuras + '%).' };
  }

  /* ---------- keluarga: istri/suami (bisa poligami), adik/kakak ipar, anak, edit TTL, HB, selingkuh, cerai, risiko HIV, pesan/telepon, pasar pokok ---------- */
  var noKeluarga = 0;
  function adalahPasangan(kl) { return kl && (kl.peran === 'istri' || kl.peran === 'suami' || kl.peran === 'pasangan'); }
  function adalahIpar(kl) { return kl && (kl.peran === 'adik_ipar' || kl.peran === 'kakak_ipar'); }
  function daftarPasangan(S) { return (S.keluarga || []).filter(adalahPasangan); }
  function pasanganAktif(S) { return daftarPasangan(S)[0] || null; }
  function labelPeran(S, kl) {
    if (!kl) return 'Keluarga';
    if (kl.peran === 'istri') return 'Istri';
    if (kl.peran === 'suami') return 'Suami';
    if (kl.peran === 'pasangan') return kl.gender === 'cewek' ? 'Istri' : 'Suami';
    if (kl.peran === 'adik_ipar') return 'Adik Ipar';
    if (kl.peran === 'kakak_ipar') return 'Kakak Ipar';
    return 'Anak';
  }
  function tglIso(n) {
    var t = KAL.tgl(n);
    return t.y + '-' + (t.m < 10 ? '0' : '') + t.m + '-' + (t.d < 10 ? '0' : '') + t.d;
  }
  function tambahKeluarga(S, nama, gender, tglLahir, peran) {
    S.keluarga = S.keluarga || [];
    if (S.keluarga.length >= 12) return 'Jumlah anggota keluarga di rumah sudah maksimal (12 orang).';
    var nm = (nama || '').trim();
    if (!nm) return 'Masukkan nama anggota keluarga dulu.';
    var gnd = gender === 'cowok' ? 'cowok' : 'cewek';
    var p = peran;
    if (p === 'pasangan') p = gnd === 'cewek' ? 'istri' : 'suami';
    if (['istri', 'suami', 'anak', 'adik_ipar', 'kakak_ipar'].indexOf(p) < 0) p = 'anak';
    /* poligami: boleh punya lebih dari 1 istri (maks 4 istri); suami maks 1 */
    var jmlIstri = (S.keluarga || []).filter(function (x) { return x.peran === 'istri'; }).length;
    var jmlSuami = (S.keluarga || []).filter(function (x) { return x.peran === 'suami'; }).length;
    if (p === 'istri' && jmlIstri >= 4) return 'Jumlah istri sudah maksimal (4 istri).';
    if (p === 'suami' && jmlSuami >= 1) return 'Kamu sudah memiliki suami.';
    var tl = tglLahir || (p === 'anak' ? '2020-06-15' : p === 'adik_ipar' ? '2003-04-12' : '1999-08-20');
    S.keluarga.push({
      id: 'kl' + (++noKeluarga) + '-' + S.hari,
      nama: nm.slice(0, 22),
      gender: p === 'istri' ? 'cewek' : p === 'suami' ? 'cowok' : gnd,
      tglLahir: tl,
      peran: p,
      lokasi: 'rumah',
      bahagia: 90,
      hb: (p === 'istri' || p === 'suami') ? 35 : 20,
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
  function ubahTtlKeluarga(S, id, tglLahirBaru) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    var s = String(tglLahirBaru || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return 'Format tanggal lahir tidak valid (gunakan YYYY-MM-DD).';
    kl.tglLahir = s;
    return { ok: true, teks: 'Tanggal lahir ' + kl.nama + ' diperbarui menjadi ' + s + ' (Usia: ' + KAL.usia(S.hari, s) + ' tahun).' };
  }
  function ubahStatusKeluarga(S, id, peranBaru) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    if (peranBaru === 'istri') {
      var jmlI = (S.keluarga || []).filter(function (x) { return x.peran === 'istri' && x.id !== kl.id; }).length;
      if (jmlI >= 4) return 'Jumlah istri sudah maksimal (4 istri).';
      kl.peran = 'istri'; kl.gender = 'cewek'; if (typeof kl.hb !== 'number') kl.hb = 35;
      return true;
    }
    if (peranBaru === 'suami') {
      var lainS = (S.keluarga || []).filter(function (x) { return x.peran === 'suami' && x.id !== kl.id; })[0];
      if (lainS) return 'Sudah ada suami (' + lainS.nama + ').';
      kl.peran = 'suami'; kl.gender = 'cowok'; if (typeof kl.hb !== 'number') kl.hb = 35;
      return true;
    }
    if (peranBaru === 'adik_ipar' || peranBaru === 'kakak_ipar') {
      kl.peran = peranBaru;
      return true;
    }
    kl.peran = 'anak';
    return true;
  }
  function ceraiPasangan(S, id, alasan) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0] || pasanganAktif(S);
    if (!kl || !adalahPasangan(kl)) return 'Tidak ada pasangan untuk diceraikan.';
    var gonoGini = Math.min(S.bank.saldo, Math.max(0, Math.round(S.bank.saldo * 0.25 / 50000) * 50000));
    if (gonoGini > 0) {
      S.bank.saldo -= gonoGini;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Harta gono-gini / mut\'ah perceraian (' + kl.nama + ')', jml: -gonoGini });
    }
    S.keluarga = (S.keluarga || []).filter(function (x) { return x.id !== kl.id; });
    if (g.KK_TEMAN) g.KK_TEMAN.tambahMantan(S, kl, alasan);
    S.diri.stamina = Math.max(10, S.diri.stamina - 20);
    return { ok: true, nama: kl.nama, gonoGini: gonoGini, teks: 'Perceraian dengan ' + kl.nama + (alasan ? ' (' + alasan + ')' : '') + ' resmi tercatat. Pembagian harta gono-gini: ' + rp(gonoGini) + '.' };
  }
  /* kirim pesan WA atau telepon ke pasangan, ipar, atau anak (minimal usia 10 tahun) */
  function kirimPesanKeluarga(S, id, jenis) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    if (! S.hp || S.hp.baterai <= 0) return 'Baterai HP habis (0%)! Cas HP dulu.';
    if (S.hp.masaAktif != null && S.hari > S.hp.masaAktif) return 'Masa aktif kartu ' + (S.hp.nomor || '081256000088') + ' sudah habis! Isi pulsa dulu.';
    var usia = KAL.usia(S.hari, kl.tglLahir);
    if (kl.peran === 'anak' && usia < 10) return kl.nama + ' masih berusia ' + usia + ' tahun (belum cukup umur pegang HP sendiri, minimal usia 10 tahun).';
    if (jenis === 'telepon') {
      var biayaTelp = 1500;
      if ((S.hp.pulsa || 0) < biayaTelp) return 'Pulsa tidak cukup untuk menelepon (' + rp(biayaTelp) + '). Isi pulsa dulu di Gadget & Kuota.';
      S.hp.pulsa -= biayaTelp;
    } else {
      var ck = pakaiKuota(S, 0.002); /* 2 MB per chat WA */
      if (ck !== true) return ck;
    }
    var balasan;
    if (adalahPasangan(kl)) {
      balasan = jenis === 'telepon'
        ? '"Halo sayang! Senang banget ditelepon. Aku di rumah sehat-sehat, semangat cari rezekinya ya, hati-hati di jalan!"'
        : '"Sayang, makasih udah kabarin ya ❤️ Nanti pulang kerja kita makan bareng di rumah!"';
    } else if (adalahIpar(kl)) {
      balasan = '"Halo kak! Aman kok di rumah, nanti kalau butuh bantuan kabarin aja ya."';
    } else {
      balasan = jenis === 'telepon'
        ? '"Halo Ayah/Ibu! ' + kl.nama + ' baru selesai belajar nih. Nanti pulang bawain jajan ya!"'
        : '"Siap Ayah/Ibu! ' + kl.nama + ' baik-baik di rumah, semangat kerjanya ya!"';
    }
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + (jenis === 'telepon' ? 10 : 6));
    S.diri.stamina = batas(S.diri.stamina + (jenis === 'telepon' ? 4 : 2));
    S.pesanKeluarga = S.pesanKeluarga || [];
    S.pesanKeluarga.unshift({ hari: S.hari, jam: S.menit % 1440, dari: kl.nama + ' (' + labelPeran(S, kl) + ')', jenis: jenis === 'telepon' ? 'Telepon (081256000088)' : 'Chat WhatsApp', teks: balasan });
    if (S.pesanKeluarga.length > 25) S.pesanKeluarga.length = 25;
    return { ok: true, teks: (jenis === 'telepon' ? '📞 Menelepon ' : '💬 Kirim WA ke ') + kl.nama + ': ' + balasan };
  }
  /* Pasar Pokok di HP: belanja kebutuhan pokok rumah tangga (bisa karakter utama atau suruh pasangan yang belanja) */
  function belanjaPasarPokok(S, itemId, siapa, caraBayar) {
    var it = (N.pasarPokok || []).filter(function (x) { return x.id === itemId; })[0];
    if (!it) return 'Barang kebutuhan pokok tidak ditemukan.';
    var pasangan = pasanganAktif(S);
    if (siapa === 'pasangan') {
      if (!pasangan) return 'Kamu belum punya pasangan (Istri/Suami) untuk disuruh belanja ke pasar. Belanja sendiri atau tambahkan pasangan dulu.';
      if (pasangan.sakit) return pasangan.nama + ' sedang sakit (' + pasangan.sakit.nama + '), tidak bisa disuruh ke pasar.';
    }
    /* bayar HANYA dari dompet pribadi atau rekening bank (tidak pernah dari laci kedai) */
    if (caraBayar === 'dompet' || !caraBayar) {
      if (!bayarTunai(S, it.harga)) {
        if (S.bank.saldo < it.harga) return 'Uang di dompet pribadi maupun rekening bank tidak cukup untuk membeli ' + it.nama + ' (' + rp(it.harga) + ').';
        S.bank.saldo -= it.harga;
        S.bank.mutasi.unshift({ n: S.hari, ket: 'Pasar Pokok: ' + it.nama, jml: -it.harga });
        S.hariIni.pribadi = (S.hariIni.pribadi || 0) + it.harga;
      }
    } else {
      var by = bayarBelanja(S, it.harga, 'Pasar Pokok: ' + it.nama, caraBayar);
      if (by !== true) return by;
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + it.harga;
    }
    S.rumahTangga = S.rumahTangga || { aktifSampai: -1, paket: null };
    var mulai = Math.max(S.hari, (S.rumahTangga.aktifSampai || -1) + 1);
    S.rumahTangga.aktifSampai = mulai + (it.hariDapur || 3) - 1;
    S.rumahTangga.paket = it.id;
    (S.keluarga || []).forEach(function (kl) { kl.bahagia = Math.min(100, (kl.bahagia || 80) + (it.bonusBahagia || 6)); });
    var tglSampai = KAL.tgl(S.rumahTangga.aktifSampai);
    var infoSampai = tglSampai.d + ' ' + N.namaBulan[tglSampai.m - 1];
    if (siapa === 'pasangan') {
      return { ok: true, menit: 0, teks: pasangan.nama + ' berangkat ke pasar membeli ' + it.nama + ' (' + rp(it.harga) + '). Stok dapur rumah aman untuk makan gratis s/d ' + infoSampai + ' tanpa menyita waktumu!' };
    }
    return { ok: true, menit: 30, teks: 'Belanja ' + it.nama + ' di pasar (' + rp(it.harga) + ', 30 menit). Stok dapur rumah aman untuk makan gratis s/d ' + infoSampai + '!' };
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
      if (S.bank.saldo < b.rp) return 'Uang di dompet maupun rekening tidak cukup untuk ' + b.ket + ' (' + rp(b.rp) + ').';
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
      if (S.bank.saldo < h) return 'Saldo dompet dan rekening tidak cukup untuk ' + pk.nama + ' (' + rp(h) + ').';
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
    if (!S.rumahTangga || (S.rumahTangga.aktifSampai || -1) < S.hari) return 'Stok dapur kosong. Berikan nafkah bulanan di aplikasi Keluarga agar pasangan bisa belanja kebutuhan rumah tangga.';
    S.diri.kenyang = batas(S.diri.kenyang + 80);
    S.diri.minum = batas(S.diri.minum + 35);
    S.diri.stamina = batas(S.diri.stamina + 8);
    return { ok: true, menit: 20, teks: 'Makan masakan rumah bersama keluarga (Gratis dari nafkah dapur). Kenyang & segar!' };
  }
  /* pendidikan kuliah & pekerjaan luar rumah (pasangan atau anggota keluarga usia >= 18; bisa dibayar suami, istri, atau patungan 50/50) */
  function bayarPendidikan(S, biaya, ket, sumber) {
    var ps = pasanganAktif(S), danaPs = ps ? ((ps.dompet || 0) + (ps.tabungan || 0)) : 0;
    if (sumber === 'istri') {
      if (!ps) return 'Belum punya pasangan.';
      if (danaPs < biaya) return 'Uang ' + ps.nama + ' (' + rp(danaPs) + ') tidak cukup untuk ' + ket + ' (' + rp(biaya) + ').';
      potongDanaPasangan(ps, biaya);
      return { ok: true, ketSumber: 'uang ' + ps.nama };
    }
    if (sumber === 'patungan') {
      if (!ps) return 'Belum punya pasangan untuk patungan.';
      var sep = Math.round(biaya / 2), sisaS = biaya - sep;
      if (danaPs < sep) return 'Uang ' + ps.nama + ' (' + rp(danaPs) + ') kurang untuk patungan (' + rp(sep) + ').';
      if (S.bank.saldo < sisaS && (S.uang.dompet || 0) < sisaS) return 'Uangmu tidak cukup untuk patungan (' + rp(sisaS) + ').';
      potongDanaPasangan(ps, sep);
      if (S.bank.saldo >= sisaS) { S.bank.saldo -= sisaS; S.bank.mutasi.unshift({ n: S.hari, ket: 'Patungan ' + ket, jml: -sisaS }); }
      else S.uang.dompet -= sisaS;
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + sisaS;
      return { ok: true, ketSumber: 'patungan 50/50' };
    }
    if (S.bank.saldo >= biaya) { S.bank.saldo -= biaya; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -biaya }); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya; return { ok: true, ketSumber: 'rekeningmu' }; }
    if ((S.uang.dompet || 0) >= biaya) { S.uang.dompet -= biaya; S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya; return { ok: true, ketSumber: 'dompetmu' }; }
    return 'Saldo tidak cukup untuk ' + ket + ' (' + rp(biaya) + ').';
  }
  function daftarKuliahPasangan(S, id, jurusanId, sumber) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    var usia = KAL.usia(S.hari, kl.tglLahir);
    if (!adalahPasangan(kl) && usia < 17) return kl.nama + ' masih ' + usia + ' tahun (minimal 17 tahun untuk kuliah).';
    var jr = (N.pendidikanPasangan || []).filter(function (x) { return x.id === jurusanId; })[0];
    if (!jr) return 'Jurusan kuliah tidak ditemukan.';
    kl.lulus = kl.lulus || [];
    if (kl.lulus.indexOf(jr.id) >= 0) return kl.nama + ' sudah lulus ' + jr.nama + '.';
    if (kl.kuliah) return kl.nama + ' sedang berkuliah di ' + kl.kuliah.nama + '.';
    var by = bayarPendidikan(S, jr.ukt, 'UKT Kuliah ' + kl.nama + ' (' + jr.nama + ')', sumber || 'suami');
    if (!by || !by.ok) return by;
    kl.kuliah = { id: jr.id, nama: jr.nama, gelar: jr.gelar, semester: 1, totalSemester: jr.semester, ukt: jr.ukt, tagihBerikut: S.hari + 180 };
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + 15);
    return { ok: true, teks: kl.nama + ' resmi kuliah ' + jr.nama + '! UKT semester 1 ' + rp(jr.ukt) + ' lunas via ' + by.ketSumber + '.' };
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
  function daftarSekolahAnak(S, id, sekolahId, sumber) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || adalahPasangan(kl)) return 'Pilih karakter anak/adik untuk didaftarkan sekolah.';
    var sk = (N.sekolahAnak || []).filter(function (x) { return x.id === sekolahId; })[0];
    if (!sk) return 'Jenjang sekolah tidak ditemukan.';
    var usia = KAL.usia(S.hari, kl.tglLahir);
    if (usia < sk.minUsia) return kl.nama + ' masih berusia ' + usia + ' tahun. Syarat minimal masuk ' + sk.nama + ' adalah ' + sk.minUsia + ' tahun.';
    if (kl.sekolah && kl.sekolah.id === sk.id) return kl.nama + ' sudah bersekolah di ' + sk.nama + '.';
    var ketS = 'rekeningmu';
    if (sk.pangkal > 0) {
      var by = bayarPendidikan(S, sk.pangkal, 'Daftar sekolah ' + kl.nama + ' (' + sk.nama + ')', sumber || 'suami');
      if (!by || !by.ok) return by;
      ketS = by.ketSumber;
    }
    kl.sekolah = { id: sk.id, nama: sk.nama, spp: sk.spp, sejak: S.hari };
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + 12);
    return { ok: true, teks: kl.nama + ' resmi masuk ' + sk.nama + (sk.pangkal > 0 ? ' (via ' + ketS + ')' : '') + '!' + (sk.spp ? ' SPP bulanan ' + rp(sk.spp) + '.' : ' SPP gratis pemerintah.') };
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
      if (it.gerigi) S.kesehatan.kondomGerigi = (S.kesehatan.kondomGerigi || 0) + (it.isi || 3);
      return { ok: true, teks: 'Beli ' + it.nama + ' (+' + (it.isi || 3) + ' pengaman' + (it.gerigi ? ' bergerigi' : '') + '). Total stok kondom: ' + S.kesehatan.kondom + '.' };
    }
    if (it.arvHari) {
      S.kesehatan.arvSampai = Math.max(S.hari, S.kesehatan.arvSampai || -1) + it.arvHari;
      S.diri.kesehatan = Math.min(100, (S.diri.kesehatan || 70) + 20);
      return { ok: true, teks: 'Terapi ARV aktif 30 hari! Kondisi kesehatan & imun tubuh terjaga stabil.' };
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
  /* HB (Hubungan Suami-Istri / Poligami / Selingkuh dengan Adik Ipar atau Karyawan / Jajan Nakal PSK)
     - Peluang hamil tanpa kontrasepsi: 65% (0.65)
     - HB dengan pasangan sah: Stamina 100%, Kesehatan 100%, Bahagia 100%, HB bar 0%, Rasa bersalah 0
     - HB dengan PSK (jajan nakal): Bahagia 100%, muncul Rasa Bersalah, Kesehatan menurun;
       Risiko HIV: jika kesehatan < 50% -> 89% tanpa kondom, 30% dengan kondom; jika kesehatan >= 50% -> 1,3% (0.013) dengan kondom, 18% tanpa kondom
     - Selingkuh (dengan adik ipar / karyawan / PSK saat punya pasangan sah) berisiko ketahuan & memicu Perceraian! */
  function lakukanHb(S, pakaiKondom, targetKode, lokasiObj) {
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kondomGerigi: 0, kbSampai: -1 };
    var diHotel = !!(lokasiObj && !lokasiObj.diRumah);
    var jenisTarget = 'pasangan', p = null, stafTarget = null;
    if (targetKode === 'psk') {
      jenisTarget = 'psk';
    } else if (String(targetKode || '').indexOf('staf:') === 0) {
      var sid = String(targetKode).slice(5);
      stafTarget = (S.staf || []).filter(function (k) { return k.id === sid; })[0];
      if (!stafTarget) return 'Karyawan tidak ditemukan.';
      var gPemain = (S.profil && S.profil.gender) || 'cowok';
      if (stafTarget.gender === gPemain) return 'HB dengan karyawan hanya bisa dilakukan dengan lawan jenis.';
      jenisTarget = 'staf';
    } else if (String(targetKode || '').indexOf('ipar:') === 0) {
      var iid = String(targetKode).slice(5);
      p = (S.keluarga || []).filter(function (x) { return x.id === iid; })[0];
      if (!p) return 'Adik/kakak ipar tidak ditemukan.';
      if (p.gender === ((S.profil && S.profil.gender) || 'cowok')) return 'HB hanya bisa dilakukan dengan lawan jenis.';
      jenisTarget = 'ipar';
    } else if (String(targetKode || '').indexOf('teman:') === 0) {
      var tid = String(targetKode).slice(6);
      var tcek = g.KK_TEMAN.syaratHb(S, tid);
      if (typeof tcek === 'string') return tcek;
      stafTarget = tcek; jenisTarget = 'teman';
    } else if (targetKode) {
      p = (S.keluarga || []).filter(function (x) { return x.id === targetKode; })[0];
      if (p && adalahIpar(p)) jenisTarget = 'ipar';
    }
    if (jenisTarget === 'pasangan' && !p) p = pasanganAktif(S);

    if (jenisTarget === 'pasangan' || jenisTarget === 'ipar') {
      if (!diHotel && S.diri.posisi !== 'kos') return 'Pulang ke rumah/kos dulu, atau pilih lokasi Penginapan / Hotel.';
      if (!p) return 'Kamu belum memiliki pasangan (Istri/Suami). Tambahkan dulu di aplikasi Keluarga.';
      if (!diHotel && p.lokasi === 'kedai') return p.nama + ' sedang tidak di rumah. Minta pulang dulu di aplikasi Keluarga.';
      if (S.diri.sakit || p.sakit) return 'Salah satu sedang sakit. Obati dulu di Apotek & RS agar sehat kembali.';
      if (g.KK_TEMAN.sedangKeluar(p, S)) return p.nama + ' sedang tidak di rumah (' + g.KK_TEMAN.alasanTeks(p) + '). Suruh pulang dulu di aplikasi Keluarga.';
      if (jenisTarget === 'ipar' && g.KK_TEMAN.hubunganKl(p) <= g.KK_TEMAN.MIN_HB) return 'Hubungan dengan ' + p.nama + ' baru ' + Math.round(g.KK_TEMAN.hubunganKl(p)) + '%. Butuh di atas ' + g.KK_TEMAN.MIN_HB + '%.';
      if (jenisTarget === 'pasangan' && g.KK_TEMAN.hubunganKl(p) < 25) return p.nama + ' lagi marah besar dan menolak. Perbaiki hubungan dulu.';
    }

    var pakaiGerigi = false;
    if (pakaiKondom && (S.kesehatan.kondom || 0) <= 0) {
      return 'Stok kondom habis! Beli dulu di aplikasi Apotek & RS.';
    }

    var biayaPsk = 300000;
    if (jenisTarget === 'teman' && !lokasiObj) {
      var hotel = g.KK_TEMAN.HOTEL;
      if (!bayarTunai(S, hotel)) {
        if (S.bank.saldo < hotel) return 'Uang tidak cukup untuk kamar hotel (' + rp(hotel) + ').';
        S.bank.saldo -= hotel; S.bank.mutasi.unshift({ n: S.hari, ket: 'Kamar hotel', jml: -hotel });
        S.hariIni.pribadi = (S.hariIni.pribadi || 0) + hotel;
      }
    }
    if (jenisTarget === 'psk') {
      if (!bayarTunai(S, biayaPsk)) {
        if (S.bank.saldo < biayaPsk) return 'Uang di dompet maupun rekening tidak cukup untuk jajan nakal (' + rp(biayaPsk) + ').';
        S.bank.saldo -= biayaPsk;
        S.bank.mutasi.unshift({ n: S.hari, ket: 'Hiburan malam / jajan luar', jml: -biayaPsk });
        S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biayaPsk;
      }
    }

    if (pakaiKondom) {
      S.kesehatan.kondom--;
      if ((S.kesehatan.kondomGerigi || 0) > 0) {
        S.kesehatan.kondomGerigi--;
        pakaiGerigi = true;
      }
    }

    var jamSekarang = S.menit % 1440;
    var malamSkipSubuh = false; /* HB tidak lagi skip sampai subuh; durasi 1-3 jam */
    var durasiMenit = 60 + Math.floor(Math.random() * 121); /* 1-3 jam (60-180 menit) */

    /* KASUS 1: JAJAN NAKAL (PSK) -> bahagia full, rasa bersalah naik, kesehatan turun, risiko HIV presisi */
    if (jenisTarget === 'psk') {
      var kesSebelum = typeof S.diri.kesehatan === 'number' ? S.diri.kesehatan : 100;
      var peluangHiv = kesSebelum < 50
        ? (pakaiKondom ? 0.30 : 0.89)
        : (pakaiKondom ? 0.013 : 0.18);
      var kenaHivBaru = false;
      if (!S.diri.hiv && Math.random() < peluangHiv) {
        S.diri.hiv = true;
        kenaHivBaru = true;
      }
      S.diri.hb = 0;
      S.diri.stamina = 100;
      S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 45);
      S.diri.kesehatan = Math.max(10, Math.round(kesSebelum - (pakaiKondom ? 16 : 24)));
      var teksPsk = 'Jajan nakal selesai (' + rp(biayaPsk) + '). Bahagia penuh, namun muncul Rasa Bersalah (' + S.diri.rasaBersalah + '%) dan Kesehatan menurun ke ' + S.diri.kesehatan + '%!';
      if (kenaHivBaru) {
        teksPsk += ' ⚠️ PERINGATAN MEDIS: Kamu tertular HIV (risiko ' + (peluangHiv * 100).toFixed(1).replace('.0', '') + '% saat kesehatan ' + Math.round(kesSebelum) + '%)! Segera beli Terapi ARV di Apotek K-24.';
      }
      var psSah = pasanganAktif(S);
      if (psSah && !diHotel && Math.random() < 0.28) {
        var crPsk = ceraiPasangan(S, psSah.id, 'Ketahuan selingkuh / jajan nakal');
        if (crPsk && crPsk.ok) teksPsk += ' 💔 ' + psSah.nama + ' memergoki perselingkuhanmu dan langsung menggugat CERAI! (Gono-gini ' + rp(crPsk.gonoGini) + ').';
      }
      return { ok: true, malam: malamSkipSubuh, menit: durasiMenit, bangun: 240, kenaHiv: kenaHivBaru, teks: teksPsk };
    }

    /* KASUS 1B: TEMAN / SAHABAT / PACAR / MANTAN */
    if (jenisTarget === 'teman' && stafTarget) {
      var tm = stafTarget, sebelum = typeof S.diri.kesehatan === 'number' ? S.diri.kesehatan : 100;
      var adaFpT = tm.foreplayHari === S.hari;
      S.diri.hb = 0; S.diri.stamina = 100; tm.hb = 0; tm.hubungan = Math.min(100, tm.hubungan + (adaFpT ? 14 : 8));
      tm.perasaan = Math.min(100, (tm.perasaan == null ? 50 : tm.perasaan) + (adaFpT ? 30 : 18));
      tm.foreplayHari = -1;
      if (!pakaiKondom) S.diri.kesehatan = Math.max(10, Math.round(sebelum - 8));
      var nmLokT = (lokasiObj && lokasiObj.nama) || 'hotel';
      var teksT = 'Waktu berdua bersama ' + tm.nama + ' (' + g.KK_TEMAN.PERAN[tm.peran].toLowerCase() + ') di ' + nmLokT + ' selesai.' + (adaFpT ? ' Didahului foreplay hangat — suasana makin romantis!' : '') + ' Stamina penuh, hubungan ' + Math.round(tm.hubungan) + '%, perasaan ' + Math.round(tm.perasaan) + '%.' + (pakaiKondom ? ' (Aman memakai kondom).' : ' (Tanpa pengaman, kesehatan turun).');
      var psT = pasanganAktif(S);
      if (psT) {
        S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 30);
        if (!diHotel && Math.random() < 0.3) {
          var crT = ceraiPasangan(S, psT.id, 'Ketahuan selingkuh dengan ' + tm.nama);
          if (crT && crT.ok) teksT += ' 💔 ' + psT.nama + ' mengetahuinya dan resmi MENCERAIKANMU! (Gono-gini ' + rp(crT.gonoGini) + ').';
        }
      }
      return { ok: true, malam: false, menit: 90, bangun: 240, teks: teksT, tempat: diHotel ? 'hotel' : 'rumah', nama: tm.nama };
    }

    /* KASUS 2: SELINGKUH DENGAN KARYAWAN LAWAN JENIS */
    if (jenisTarget === 'staf' && stafTarget) {
      S.diri.hb = 0;
      S.diri.stamina = 100;
      stafTarget.setia = 100;
      var hamilStaf = false;
      if (!pakaiKondom && stafTarget.gender === 'cewek' && !stafTarget.hamil && Math.random() < 0.65) {
        stafTarget.hamil = { mulai: S.hari, lahir: S.hari + 270 };
        hamilStaf = true;
      }
      var teksStaf = 'Hubungan rahasia bersama karyawan ' + stafTarget.nama + ' selesai. Stamina penuh 100%, kesetiaan ' + stafTarget.nama + ' naik ke 100%!' +
        (hamilStaf ? ' ⚠️ Tanpa pengaman (peluang 65%): ' + stafTarget.nama + ' positif HAMIL anakmu!' : '');
      var psSah2 = pasanganAktif(S);
      if (psSah2) {
        S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 30);
        if (!diHotel && Math.random() < 0.35) {
          var crStaf = ceraiPasangan(S, psSah2.id, 'Ketahuan selingkuh dengan karyawan ' + stafTarget.nama);
          if (crStaf && crStaf.ok) teksStaf += ' 💔 ' + psSah2.nama + ' mengetahui perselingkuhanmu dengan ' + stafTarget.nama + ' dan resmi MENCERAIKANMU! (Gono-gini ' + rp(crStaf.gonoGini) + ').';
        }
      }
      return { ok: true, malam: false, menit: 60, bangun: 240, hamilBaru: hamilStaf, teks: teksStaf };
    }

    /* KASUS 3: PASANGAN SAH (ISTRI/SUAMI) ATAU SELINGKUH DENGAN ADIK/KAKAK IPAR */
    var kbAktif = jenisTarget === 'pasangan' && (S.kesehatan.kbSampai || -1) >= S.hari;
    var terlindungi = !!pakaiKondom || kbAktif;
    var adaFp = p.foreplayHari === S.hari;
    S.diri.hb = 0;
    S.diri.stamina = 100;
    p.bahagia = 100;
    p.hb = 0;
    p.perasaan = adaFp ? 100 : Math.min(100, (p.perasaan == null ? 75 : p.perasaan) + 18);
    p.foreplayHari = -1;
    if (jenisTarget === 'pasangan') { g.KK_TEMAN.resetTolak(S, p.id); p.ketahuan = null; }
    if (jenisTarget === 'pasangan') {
      /* HB dengan pasangan sah: kesehatan full, stamina full, bahagia full, rasa bersalah hilang */
      S.diri.kesehatan = 100;
      S.diri.rasaBersalah = 0;
    } else {
      S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 35);
    }
    /* peluang hamil tanpa kontrasepsi adalah 65% (0.65) */
    var hamilBaru = false;
    var targetHamil = p.gender === 'cewek' ? p : ((S.profil && S.profil.gender === 'cewek') ? S.diri : null);
    if (!terlindungi && targetHamil && !targetHamil.hamil) {
      if (Math.random() < 0.65) {
        targetHamil.hamil = { mulai: S.hari, lahir: S.hari + 270, terdeteksi: false };
        hamilBaru = true;
      }
    }
    var teks = 'Momen intim bersama ' + p.nama + ' (' + labelPeran(S, p) + ') selesai' + (adaFp ? ' (didahului foreplay hangat — kepuasan & romansa maksimal!)' : '') + (pakaiGerigi ? ' (memakai Kondom Bergerigi — kepuasan maksimal!)' : '') + '. HB bar 0%, Perasaan ' + Math.round(p.perasaan) + '%, Stamina' + (jenisTarget === 'pasangan' ? ', Kesehatan & Kebahagiaan' : ' & Bahagia') + ' penuh 100%!' +
      (malamSkipSubuh ? ' Tidur nyenyak hingga pukul 04.00 subuh.' : ' (' + durasiMenit + ' menit).') +
      (terlindungi ? ' (Aman memakai ' + (pakaiKondom ? 'kondom' : 'KB') + ').' : ' (Tanpa kontrasepsi — peluang hamil 65%).');
    if (jenisTarget === 'ipar') {
      var psSah3 = pasanganAktif(S);
      var dowHb = KAL.tgl(S.hari).dow, jamHb = Math.floor((S.menit % 1440) / 60);
      var pasSedangKerja = !!(psSah3 && psSah3.kerja && dowHb >= 1 && dowHb <= 5 && jamHb >= 8 && jamHb < 17);
      var pasDiLuar = !psSah3 || psSah3.lokasi === 'kedai' || pasSedangKerja || (g.KK_TEMAN && g.KK_TEMAN.sedangKeluar(psSah3, S));
      /* Aman (0% ketahuan) selama dilakukan di hotel/penginapan atau saat pasangan sedang kerja/di luar rumah */
      if (psSah3 && !diHotel && !pasDiLuar && Math.random() < 0.38) {
        var crIpar = ceraiPasangan(S, psSah3.id, 'Ketahuan selingkuh dengan ' + labelPeran(S, p) + ' (' + p.nama + ')');
        if (crIpar && crIpar.ok) teks += ' 💔 GAWAT! ' + psSah3.nama + ' memergoki kamu selingkuh dengan ' + p.nama + ' dan langsung menuntut CERAI! (Gono-gini ' + rp(crIpar.gonoGini) + ').';
      } else if (psSah3 && (diHotel || pasDiLuar)) {
        teks += ' (Aman, tidak diketahui ' + psSah3.nama + ').';
      }
    }
    return { ok: true, malam: malamSkipSubuh, menit: durasiMenit, bangun: 240, hamilBaru: hamilBaru, teks: teks };
  }
  /* ---------- stamina: kopi / minuman energi (harga warung) ---------- */
  var ENERGI = [
    { id: 'kopisachet', nama: 'Kopi sachet seduh', harga: 4000, stamina: 14, minum: 10 },
    { id: 'kopibotol', nama: 'Kopi susu botol', harga: 10000, stamina: 22, minum: 12 },
    { id: 'energi', nama: 'Minuman energi (Extra Joss)', harga: 7000, stamina: 30, minum: 6 },
    { id: 'energikaleng', nama: 'Energy drink kaleng', harga: 12000, stamina: 40, minum: 8 }
  ];
  function minumEnergi(S, id) {
    var x = ENERGI.filter(function (e) { return e.id === id; })[0]; if (!x) return 'Pilihan tidak dikenal.';
    var d = S.diri;
    if (!bayarTunai(S, x.harga)) {
      if (S.bank.saldo < x.harga) return 'Uang tidak cukup (' + rp(x.harga) + ').';
      S.bank.saldo -= x.harga; S.bank.mutasi.unshift({ n: S.hari, ket: x.nama, jml: -x.harga }); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + x.harga;
    }
    d.stamina = batas(d.stamina + x.stamina); d.minum = batas(d.minum + x.minum);
    if (d.energiHari !== S.hari) { d.energiHari = S.hari; d.energiJml = 0; }
    d.energiJml++;
    var teks = x.nama + ' ' + rp(x.harga) + '. Stamina +' + x.stamina + '.';
    if (d.energiJml > 3) { d.kesehatan = Math.max(5, (d.kesehatan == null ? 100 : d.kesehatan) - 3); teks += ' Terlalu banyak kafein, kesehatan turun.'; }
    return { ok: true, teks: teks };
  }
  /* meredakan bar HB sendiri: hanya mengurangi sebagian */
  function meTime(S) {
    var d = S.diri;
    if (d.posisi !== 'kos') return 'Pulang dulu ke ' + tempat(S) + '.';
    if ((d.hb || 0) < 15) return 'Bar HB masih rendah.';
    var kurang = 25 + Math.floor(Math.random() * 11);
    d.hb = Math.max(0, d.hb - kurang); d.stamina = batas(d.stamina - 3);
    return { ok: true, menit: 20, teks: 'Me time sebentar. Bar HB turun ' + kurang + '%.' };
  }
  /* hiburan HP saat menunggu: kuota terpakai per menit permainan (GB) */
  var HIBURAN = {
    youtube: { nama: 'Nonton YouTube', gbMenit: 0.012, bat: 0.12 },
    tiktok: { nama: 'Scroll TikTok / Reels', gbMenit: 0.008, bat: 0.11 },
    unduh: { nama: 'Unduh file besar', gbMenit: 0.06, bat: 0.08 }
  };
  function hiburanJalan(S, dMenit) {
    var h = S.hiburan && HIBURAN[S.hiburan]; if (!h || !S.hp) return null;
    var r = pakaiKuota(S, h.gbMenit * dMenit);
    if (r !== true) { S.hiburan = null; return r; }
    var mahHp = (hpAktif(S) && hpAktif(S).mah) || 5000;
    var butuhMah = h.bat * 50 * dMenit;
    var pbInfo = pbAktifInfo(S);
    if (S.hp.pbPasang && pbInfo && pbInfo.state.sisaMah > 0) {
      var sedot = butuhMah / 0.8;
      if (sedot <= pbInfo.state.sisaMah) { pbInfo.state.sisaMah -= sedot; return null; }
      butuhMah -= pbInfo.state.sisaMah * 0.8;
      pbInfo.state.sisaMah = 0; S.hp.pbPasang = false;
    }
    S.hp.baterai = Math.max(0, S.hp.baterai - (butuhMah / mahHp) * 100);
    return null;
  }
  /* menikahi teman: pindah ke daftar keluarga */
  var PAKET_NIKAH = [
    { id: 'kua', nama: 'Akad di KUA + syukuran kecil', biaya: 3000000 },
    { id: 'sedang', nama: 'Akad + resepsi gedung sedang', biaya: 25000000 },
    { id: 'besar', nama: 'Pesta pernikahan besar', biaya: 100000000 }
  ];
  function nikahiTeman(S, id, paketId) {
    var T = g.KK_TEMAN, x = T.cari(S, id), pk = PAKET_NIKAH.filter(function (q) { return q.id === paketId; })[0];
    if (!x || !pk) return 'Data tidak ditemukan.';
    if (x.hubungan <= 70) return 'Hubungan dengan ' + x.nama + ' baru ' + Math.round(x.hubungan) + '%. Butuh di atas 70% untuk menikah.';
    if (x.peran === 'mantan') return 'Mantan tidak bisa dinikahi langsung. Ubah dulu perannya jadi pacar.';
    var peran = x.gender === 'cewek' ? 'istri' : 'suami';
    var pg = (S.profil && S.profil.gender) || 'cowok';
    if (x.gender === pg) return 'Menikah hanya bisa dengan lawan jenis.';
    if (S.bank.saldo + ((S.uang && S.uang.dompet) || 0) < pk.biaya) return 'Uang tidak cukup untuk ' + pk.nama + ' (' + rp(pk.biaya) + ').';
    var r = tambahKeluarga(S, x.nama, x.gender, x.tglLahir, peran);
    if (typeof r === 'string') return r;
    var dompet = (S.uang && S.uang.dompet) || 0, dariDompet = Math.min(dompet, pk.biaya);
    if (dariDompet > 0 && g.KK_UANG.bayarDompet) g.KK_UANG.bayarDompet(S, dariDompet);
    var sisa = pk.biaya - dariDompet;
    if (sisa > 0) { S.bank.saldo -= sisa; S.bank.mutasi.unshift({ n: S.hari, ket: 'Biaya pernikahan (' + pk.nama + ')', jml: -sisa }); }
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + pk.biaya;
    var baru = S.keluarga[S.keluarga.length - 1]; baru.bahagia = Math.min(100, 70 + Math.round(x.hubungan / 5));
    T.hapus(S, id);
    S.diri.rasaBersalah = Math.max(0, (S.diri.rasaBersalah || 0) - 20);
    return { ok: true, teks: 'Kamu menikahi ' + x.nama + ' (' + pk.nama + ', ' + rp(pk.biaya) + '). Selamat!' };
  }
  function faktorPromo(S) {
    if (g.KK_KAL && g.KK_KAL.apakahRamadan && g.KK_KAL.apakahRamadan(S.hari) > 0) return 2; /* promo Ramadan +100% sebulan penuh */
    return S.promoAktif ? 1.5 + Math.random() * 0.3 : 1;
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
    /* motor di armada */
    var armada = S.armadaMotor || (S.motor ? [S.motor] : []);
    armada.forEach(function (m, idx) {
      var kunci = 'motor:' + idx;
      var tarif = Math.max(45000, Math.min(350000, Math.round((m.harga || m.hargaBeli || 18000000) * 0.0032 / 5000) * 5000));
      list.push({ kunci: kunci, nama: m.nama + (armada.length > 1 ? ' (Motor #' + (idx + 1) + ')' : ''), kat: 'Rental Motor', tarif: tarif, aktif: !!sw[kunci], ket: idx === (S.motorAktif || 0) ? 'Motor utama (tetap bisa disewakan ke kenalan)' : 'Motor cadangan armada' });
    });
    /* semua mobil di armada */
    var armadaC = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    var supirAktifMap = {};
    if (S.travel && S.travel.supir) {
      S.travel.supir.forEach(function (sp) {
        if (sp && sp.aktif && sp.mobilIdx != null) supirAktifMap[sp.mobilIdx] = sp.nama;
      });
    }
    armadaC.forEach(function (mb, idx) {
      var kunciM = 'mobil:' + idx;
      if (supirAktifMap[idx] && sw[kunciM]) delete sw[kunciM];
      var tarifM = Math.max(220000, Math.min(2500000, Math.round((mb.harga || mb.hargaBeli || 200000000) * 0.0014 / 10000) * 10000));
      var ketM = supirAktifMap[idx]
        ? ('Sedang dipakai Supir Travel ' + supirAktifMap[idx] + ' (tidak bisa disewakan bersamaan)')
        : (idx === (S.mobilAktif || 0) ? 'Mobil utama · lepas kunci harian dalam kota' : 'Mobil cadangan armada · lepas kunci harian');
      list.push({ kunci: kunciM, nama: mb.nama + (armadaC.length > 1 ? ' (Mobil #' + (idx + 1) + ')' : ''), kat: 'Rental Mobil', tarif: tarifM, aktif: !!sw[kunciM], terkunciSupir: supirAktifMap[idx] || '', ket: ketM });
    });
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
    if (!S.sewaBarang[kunci] && String(kunci || '').indexOf('mobil:') === 0 && S.travel && S.travel.supir) {
      var idxM = +String(kunci).slice(6);
      var spPakai = S.travel.supir.filter(function (sp) { return sp && sp.aktif && sp.mobilIdx === idxM; })[0];
      if (spPakai) return 'Mobil ini sedang dipakai Supir Travel ' + spPakai.nama + '. Alihkan mobil supir dulu di aplikasi Travel jika ingin disewakan.';
    }
    S.sewaBarang[kunci] = !S.sewaBarang[kunci];
    if (!S.sewaBarang[kunci]) delete S.sewaBarang[kunci];
    return true;
  }

  /* ---------- USAHA RENTAL PLAYSTATION DETAIL (Konsol, TV, Kaset Game, Penjaga, Jualan Minuman, Token PLN, Lokasi Ruko Terpisah / Ruko 2 Lantai) ---------- */
  function infoLokasiRental(id) {
    var list = (N.rentalPsConfig && N.rentalPsConfig.lokasi) || [];
    return list.filter(function (x) { return x.id === id; })[0] || list[0];
  }
  function bukaRentalPs(S, lokasiId) {
    var rpCfg = N.rentalPsConfig, lok = infoLokasiRental(lokasiId);
    if (!lok) return 'Lokasi rental tidak ditemukan.';
    if (S.rentalPs && S.rentalPs.aktif && S.rentalPs.lokasi === lokasiId) return 'Rental PS sudah aktif di lokasi ini.';
    if (lok.butuhRuko2Lantai && (!S.usaha || !S.usaha.ruko2Lantai)) {
      return 'Untuk menempatkan Rental PS di Lantai 2, sewa/upgrade ke Ruko 2 Lantai terlebih dahulu (bisa dari tombol di bawah atau aplikasi Usaha).';
    }
    var biaya = lok.biayaBuka + (lok.butuhRuko2Lantai ? 0 : lok.sewaBulan);
    if (S.bank.saldo < biaya) return 'Saldo rekening tidak cukup untuk membuka Rental PS di ' + lok.nama + ' (' + rp(biaya) + ').';
    S.bank.saldo -= biaya;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Buka Usaha Rental PS (' + lok.nama + ')', jml: -biaya });
    S.rentalPs.aktif = true;
    S.rentalPs.lokasi = lok.id;
    if (S.rentalPs.kwh < 25) S.rentalPs.kwh = 25;
    S.rentalPs.padam = false;
    return true;
  }
  function beliTvRentalPs(S) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS dulu.';
    var h = (N.rentalPsConfig && N.rentalPsConfig.hargaTvUnit) || 1950000;
    if (S.bank.saldo < h) return 'Saldo rekening tidak cukup untuk membeli TV LED 32" Rental (' + rp(h) + ').';
    S.bank.saldo -= h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Beli TV LED 32" untuk Rental PS', jml: -h });
    S.rentalPs.tvStok = (S.rentalPs.tvStok || 0) + 1;
    return true;
  }
  function tambahUnitRentalPs(S, cara, konsolId) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS terlebih dahulu.';
    if (S.rentalPs.unit.length >= 16) return 'Kapasitas ruko Rental PS sudah penuh (maksimal 16 bilik unit PS).';
    var km = konsolModel(konsolId);
    if (!km) return 'Tipe konsol tidak dikenal.';
    var hTv = (N.rentalPsConfig && N.rentalPsConfig.hargaTvUnit) || 1950000;
    if (cara === 'pindah') {
      if (!punyaKonsol(S, konsolId)) return 'Kamu belum punya ' + km.nama + ' di koleksi pribadimu.';
      if ((S.rentalPs.tvStok || 0) <= 0) {
        if (S.bank.saldo < hTv) return 'Butuh 1 unit TV LED untuk bilik rental (' + rp(hTv) + '). Saldo rekening tidak cukup.';
        S.bank.saldo -= hTv;
        S.bank.mutasi.unshift({ n: S.hari, ket: 'Beli TV LED 32" bilik Rental PS', jml: -hTv });
      } else {
        S.rentalPs.tvStok--;
      }
      delete S.game.konsol[konsolId];
      if (S.rumah && S.rumah.barang) delete S.rumah.barang[konsolId];
    } else {
      /* beli paket langsung Konsol + TV LED + 2 Stik untuk bilik rental */
      var hKonsol = km.harga || Math.round((km.min + km.maks) / 2);
      var pakaiTvStok = (S.rentalPs.tvStok || 0) > 0;
      var totalPaket = hKonsol + (pakaiTvStok ? 0 : hTv);
      if (S.bank.saldo < totalPaket) return 'Saldo rekening tidak cukup untuk membeli paket bilik ' + km.nama + (pakaiTvStok ? '' : ' + TV LED') + ' (' + rp(totalPaket) + ').';
      S.bank.saldo -= totalPaket;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Beli bilik Rental: ' + km.nama + (pakaiTvStok ? '' : ' + TV LED'), jml: -totalPaket });
      if (pakaiTvStok) S.rentalPs.tvStok--;
    }
    var noUnit = S.rentalPs.unit.length + 1;
    S.rentalPs.unit.push({
      id: 'rps' + S.hari + '-' + noUnit + '-' + Math.floor(Math.random() * 99),
      konsolId: km.id,
      nama: 'Bilik #' + noUnit + ' · ' + km.nama.replace(' Original', ''),
      watt: (km.watt || 0.12) + 0.05 /* konsol + TV LED */
    });
    return true;
  }
  function aturTarifRentalPs(S, konsolId, d) {
    if (!S.rentalPs) return false;
    var cur = S.rentalPs.tarif[konsolId] || 10000;
    S.rentalPs.tarif[konsolId] = Math.max(2000, Math.min(40000, cur + d * 1000));
    return true;
  }
  function beliKasetRentalPs(S, gameId) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS dulu.';
    var gm = gameModel(gameId); if (!gm) return 'Kaset game tidak ditemukan.';
    if (S.rentalPs.kaset[gameId]) return gm.nama + ' sudah tersedia di rak kaset Rental PS.';
    if (S.bank.saldo < gm.harga) return 'Saldo rekening tidak cukup untuk membeli kaset ' + gm.nama + ' (' + rp(gm.harga) + ').';
    S.bank.saldo -= gm.harga;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Kaset Rental PS: ' + gm.nama, jml: -gm.harga });
    S.rentalPs.kaset[gameId] = true;
    return true;
  }
  function aturPenjagaRentalPs(S, d) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS dulu.';
    var baru = Math.max(0, Math.min(4, (S.rentalPs.penjaga || 0) + d));
    S.rentalPs.penjaga = baru;
    return true;
  }
  function stokMinumRentalPs(S) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS dulu.';
    var modal = (N.rentalPsConfig && N.rentalPsConfig.modalStokMinum) || 250000;
    var isi = (N.rentalPsConfig && N.rentalPsConfig.isiStokMinum) || 60;
    if (S.bank.saldo < modal) return 'Saldo rekening tidak cukup untuk kulakan minuman dingin & mie instan rental (' + rp(modal) + ').';
    S.bank.saldo -= modal;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Stok kulkas minuman & mie Rental PS (60 porsi)', jml: -modal });
    S.rentalPs.jualMinum = true;
    S.rentalPs.stokMinum = (S.rentalPs.stokMinum || 0) + isi;
    return true;
  }
  function beliTokenRentalPs(S, nominal) {
    if (!S.rentalPs || !S.rentalPs.aktif) return 'Buka usaha Rental PS dulu.';
    var t = g.KK_USAHA.token(S, nominal);
    if (S.bank.saldo < t.bayar) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= t.bayar;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Token listrik PLN Rental PS ' + nominal.toLocaleString('id-ID'), jml: -t.bayar });
    S.rentalPs.kwh = Math.round(((S.rentalPs.kwh || 0) + t.kwh) * 10) / 10;
    S.rentalPs.padam = false;
    return { ok: true, kwh: t.kwh, bayar: t.bayar };
  }
  /* simulasi pelanggan & listrik Rental PS setiap menit (buka pukul 09.00 s/d 23.00) */
  function jalanRentalPs(S, dMenit) {
    var rpObj = S.rentalPs, kabar = [];
    if (!rpObj || !rpObj.aktif || dMenit <= 0 || !rpObj.unit.length) return kabar;
    var m = S.menit % 1440;
    if (m < 540 || m >= 1380) return kabar; /* beroperasi 09.00 - 23.00 */
    if (rpObj.kwh <= 0) { rpObj.padam = true; return kabar; }
    /* syarat jalan: ada penjaga rental ATAU pemain tidak sedang sibuk narik ojol */
    if ((rpObj.penjaga || 0) <= 0 && S.ojek && S.ojek.online) return kabar;
    var lok = infoLokasiRental(rpObj.lokasi);
    var fLokasi = (lok && lok.ramai) || 1.1;
    var jmlKaset = Object.keys(rpObj.kaset || {}).length + Object.keys((S.game && S.game.kaset) || {}).length;
    var bonusKaset = Math.min(1.45, 0.85 + jmlKaset * 0.04);
    var bonusPromo = faktorPromo(S);
    var fPenjaga = (rpObj.penjaga || 0) > 0 ? Math.min(1.25, 0.9 + rpObj.penjaga * 0.15) : 0.7;
    var okupansi = Math.min(0.95, 0.42 * fLokasi * bonusKaset * bonusPromo * fPenjaga);
    var j = dMenit / 60;
    var kwTotal = 0.08; /* lampu & kipas ruko rental */
    var sewaMenit = 0;
    rpObj.unit.forEach(function (u) {
      var tarifJam = rpObj.tarif[u.konsolId] || 10000;
      var wajar = (N.rentalPsConfig && N.rentalPsConfig.tarifDefault[u.konsolId]) || 10000;
      var fHarga = tarifJam > wajar * 1.4 ? 0.55 : tarifJam < wajar * 0.85 ? 1.15 : 1;
      var terpakai = Math.min(0.98, okupansi * fHarga);
      sewaMenit += tarifJam * terpakai * j;
      kwTotal += (u.watt || 0.15) * terpakai;
    });
    var kwhPakai = kwTotal * j;
    rpObj.kwh = Math.max(0, rpObj.kwh - kwhPakai);
    rpObj.hariIni.listrik = (rpObj.hariIni.listrik || 0) + Math.round(kwhPakai * N.pln.tarif);
    if (rpObj.kwh <= 0) {
      rpObj.padam = true;
      kabar.push('Token listrik PLN Rental PS habis! Semua TV & PS di rental mati. Segera isi token di aplikasi Rental PS.');
      return kabar;
    }
    var omzetSewa = Math.round(sewaMenit);
    rpObj.hariIni.omzetSewa = (rpObj.hariIni.omzetSewa || 0) + omzetSewa;
    if (Math.random() < rpObj.unit.length * okupansi * j * 0.6) {
      rpObj.hariIni.pengunjung = (rpObj.hariIni.pengunjung || 0) + 1;
      /* pembeli sewa PS juga beli minuman dingin / mie di rental jika stok tersedia */
      if (rpObj.jualMinum && (rpObj.stokMinum || 0) > 0 && Math.random() < 0.55) {
        rpObj.stokMinum--;
        var hjMinum = (N.rentalPsConfig && N.rentalPsConfig.hargaJualMinum) || 7000;
        rpObj.hariIni.omzetMinum = (rpObj.hariIni.omzetMinum || 0) + hjMinum;
      }
    }
    return kabar;
  }

  /* ---------- ganti hari: sewa kos, WiFi, pendapatan rental barang & stok pasar game bekas ---------- */
  /* uang jajan harian: pilihan 10rb/20rb/50rb/100rb, tetap aktif sampai dimatikan */
  function aturJajan(S, id, nilai) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    nilai = +nilai || 0;
    kl.jajanRp = (kl.jajanRp === nilai) ? 0 : nilai;
    if (kl.jajanRp) return { ok: true, teks: 'Uang jajan ' + kl.nama + ' ' + rp(kl.jajanRp) + ' per hari, dibayar tiap pagi.' };
    return { ok: true, teks: 'Uang jajan ' + kl.nama + ' dihentikan.' };
  }
  function ubahNamaKeluarga(S, id, nama) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    nama = String(nama || '').trim().slice(0, 24);
    if (!kl) return 'Karakter tidak ditemukan.';
    if (!nama) return 'Nama tidak boleh kosong.';
    kl.nama = nama; return { ok: true, teks: 'Nama diubah menjadi ' + nama + '.' };
  }
  function bayarJajanHarian(S, kabar) {
    (S.keluarga || []).forEach(function (kl) {
      if (!kl.jajanRp) return;
      var b = kl.jajanRp;
      if (bayarTunai(S, b)) { }
      else if (S.bank.saldo >= b) { S.bank.saldo -= b; S.bank.mutasi.unshift({ n: S.hari, ket: 'Uang jajan ' + kl.nama, jml: -b }); }
      else { kl.jajanRp = 0; kabar.push('Uang jajan ' + kl.nama + ' dihentikan karena uangmu tidak cukup.'); return; }
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + b;
      kl.bahagia = Math.min(100, (kl.bahagia || 80) + (b >= 50000 ? 6 : b >= 20000 ? 4 : 2));
    });
  }
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], r = S.rumah, t = KAL.tgl(nBaru);
    bayarJajanHarian(S, kabar);
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
        else if (bag[0] === 'mobil') { var mbS = (S.armadaMobil && S.armadaMobil[+bag[1]]) || S.mobil; if (mbS) mbS.km = (mbS.km || 0) + 60; }
        else if (bag[0] === 'gadget' && S.gadget && S.gadget[bag[1]]) S.gadget[bag[1]].pakai = (S.gadget[bag[1]].pakai || 0) + 1;
        else if (bag[0] === 'barang') catatPakai(S, bag[1]);
      });
      S.bank.saldo += totalSewa;
      S.bank.mutasi.unshift({ n: nBaru, ket: 'Pendapatan sewa/rental (' + disewa.length + ' unit)', jml: totalSewa });
      S.hariIni.rental = totalSewa;
      kabar.push('Pendapatan sewa barang kemarin (' + namaSewa.slice(0, 3).join(', ') + (namaSewa.length > 3 ? ', dll.' : '') + ') cair ' + rp(totalSewa) + ' ke rekening.');
    }
    /* pencairan pendapatan harian Usaha Rental PS + tagihan bulanan sewa ruko terpisah & gaji penjaga rental */
    if (S.rentalPs && S.rentalPs.aktif) {
      var hiRp = S.rentalPs.hariIni || { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 };
      var omzetRp = (hiRp.omzetSewa || 0) + (hiRp.omzetMinum || 0);
      if (omzetRp > 0) {
        S.bank.saldo += omzetRp;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Setoran Usaha Rental PS (' + (hiRp.pengunjung || 1) + ' pelanggan)', jml: omzetRp });
        S.rentalPs.total.omzet = (S.rentalPs.total.omzet || 0) + omzetRp;
        S.rentalPs.total.laba = (S.rentalPs.total.laba || 0) + omzetRp - (hiRp.listrik || 0);
        S.hariIni.rentalPs = omzetRp;
        kabar.push('Usaha Rental PS kemarin: ' + (hiRp.pengunjung || 1) + ' pelanggan, omzet sewa ' + rp(hiRp.omzetSewa || 0) + (hiRp.omzetMinum ? ' + minuman/mie ' + rp(hiRp.omzetMinum) : '') + ' = ' + rp(omzetRp) + ' masuk rekening.');
      }
      S.rentalPs.hariIni = { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 };
      if (S.rentalPs.kwh < 5) kabar.push('Token listrik PLN Usaha Rental PS tinggal ' + S.rentalPs.kwh.toFixed(1).replace('.', ',') + ' kWh.');
      var tL0 = KAL.tgl(nLama);
      if (t.m !== tL0.m) {
        var lokRp = infoLokasiRental(S.rentalPs.lokasi);
        var sewaRp = (lokRp && !lokRp.butuhRuko2Lantai) ? lokRp.sewaBulan : 0;
        var gajiPenjagaRp = (S.rentalPs.penjaga || 0) * ((N.rentalPsConfig && N.rentalPsConfig.gajiPenjaga) || 1350000);
        var tagihBulanRp = sewaRp + gajiPenjagaRp;
        if (tagihBulanRp > 0) {
          if (S.bank.saldo >= tagihBulanRp) {
            S.bank.saldo -= tagihBulanRp;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'Biaya bulanan Rental PS (sewa/penjaga)', jml: -tagihBulanRp });
            kabar.push('Biaya bulanan Rental PS (' + (sewaRp ? 'sewa ruko ' + rp(sewaRp) : 'Ruko 2 Lantai') + (gajiPenjagaRp ? ' + gaji penjaga ' + rp(gajiPenjagaRp) : '') + ') lunas.');
          } else {
            kabar.push('Saldo rekening kurang untuk biaya bulanan Rental PS (' + rp(tagihBulanRp) + ').');
          }
        }
      }
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
      /* kuliah pasangan / adik ipar / anak tiap semester (180 hari) */
      if (kl.kuliah && nBaru >= kl.kuliah.tagihBerikut) {
        if (kl.kuliah.semester >= kl.kuliah.totalSemester) {
          kl.lulus = kl.lulus || [];
          if (kl.lulus.indexOf(kl.kuliah.id) < 0) kl.lulus.push(kl.kuliah.id);
          kl.gelar = kl.kuliah.gelar;
          kabar.push('WISUDA! ' + kl.nama + ' resmi lulus ' + kl.kuliah.nama + ' (' + kl.gelar + ')! Kini bisa bekerja di profesi barunya.');
          kl.kuliah = null;
        } else {
          var psBayar = pasanganAktif(S);
          var danaIstri = psBayar ? ((psBayar.tabungan || 0) + (psBayar.dompet || 0)) : 0;
          var istriDuluan = adalahIpar(kl) && psBayar && danaIstri >= kl.kuliah.ukt;
          if (istriDuluan) {
            potongDanaPasangan(psBayar, kl.kuliah.ukt);
            kl.kuliah.semester++;
            kl.kuliah.tagihBerikut = nBaru + 180;
            kabar.push(psBayar.nama + ' memakai uangnya sendiri untuk membayar UKT kuliah adiknya (' + kl.nama + ', ' + rp(kl.kuliah.ukt) + ').');
          } else if (S.bank.saldo >= kl.kuliah.ukt) {
            S.bank.saldo -= kl.kuliah.ukt;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'UKT Smt ' + (kl.kuliah.semester + 1) + ' ' + kl.nama, jml: -kl.kuliah.ukt });
            kl.kuliah.semester++;
            kl.kuliah.tagihBerikut = nBaru + 180;
            kabar.push(kl.nama + ' naik ke semester ' + kl.kuliah.semester + '/' + kl.kuliah.totalSemester + ' (' + kl.kuliah.nama + '), UKT ' + rp(kl.kuliah.ukt) + ' lunas.');
          } else if (psBayar && danaIstri >= kl.kuliah.ukt) {
            potongDanaPasangan(psBayar, kl.kuliah.ukt);
            kl.kuliah.semester++;
            kl.kuliah.tagihBerikut = nBaru + 180;
            kabar.push(psBayar.nama + ' memakai uangnya sendiri untuk membayar UKT ' + kl.nama + ' (' + rp(kl.kuliah.ukt) + ').');
          } else {
            kl.kuliah.tagihBerikut = nBaru + 7;
            kabar.push('Saldo kurang untuk UKT kuliah ' + kl.nama + ' (' + rp(kl.kuliah.ukt) + '). Ditagih lagi minggu depan.');
          }
        }
      }
      /* gaji bulanan pasangan yang bekerja: masuk dompet & tabungan pasangan sendiri */
      if (gantiBulan && kl.kerja && kl.kerja.gaji > 0) {
        var gP = kl.kerja.gaji, keDom = Math.round(gP * 0.3), keTab = gP - keDom;
        kl.dompet = (kl.dompet || 0) + keDom;
        kl.tabungan = (kl.tabungan || 0) + keTab;
        kabar.push('Gaji bulanan ' + kl.nama + ' (' + kl.kerja.nama + ') ' + rp(gP) + ' masuk ke dompet & tabungan ' + kl.nama + '.');
      }
      /* anggota keluarga lain yang bekerja ikut membantu kebutuhan rumah tangga; yang di rumah bantu masak & jaga rumah */
      if (!adalahPasangan(kl)) {
        var usKl = KAL.usia(nBaru, kl.tglLahir);
        if (gantiBulan && kl.aktivitas === 'kerja' && usKl >= 17) {
          var bantuRt = Math.round((kota(S).umk || 4000000) * 0.35 / 10000) * 10000;
          S.bank.saldo += bantuRt;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Bantuan rumah tangga dari ' + kl.nama, jml: bantuRt });
          kabar.push(kl.nama + ' bekerja dan ikut membantu biaya rumah tangga sebesar ' + rp(bantuRt) + '.');
        } else if (kl.aktivitas === 'rumah' && usKl >= 12) {
          kl.bahagia = Math.min(100, (kl.bahagia || 80) + 1);
        }
        var tl = (kl.tglLahir || '').split('-');
        if (tl.length === 3 && t.m === (+tl[1]) && t.d === (+tl[2])) {
          var usB = KAL.usia(nBaru, kl.tglLahir);
          var catatanUsia = usB === 4 ? ' Sudah bisa didaftarkan PAUD / TK!' : usB === 6 ? ' Sudah cukup umur masuk SD!' : usB === 12 ? ' Sudah waktunya masuk SMP!' : usB === 15 ? ' Sudah waktunya masuk SMA!' : '';
          kabar.push('Selamat ulang tahun ke-' + usB + ' untuk ' + kl.nama + '!' + catatanUsia);
        }
        if (gantiBulan && kl.sekolah && kl.sekolah.spp > 0) {
          var psSpp = pasanganAktif(S), danaPsSpp = psSpp ? ((psSpp.tabungan || 0) + (psSpp.dompet || 0)) : 0;
          if (S.bank.saldo >= kl.sekolah.spp) {
            S.bank.saldo -= kl.sekolah.spp;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'SPP ' + kl.sekolah.nama + ' ' + kl.nama, jml: -kl.sekolah.spp });
            kabar.push('SPP bulanan ' + kl.nama + ' (' + kl.sekolah.nama + ') ' + rp(kl.sekolah.spp) + ' dibayar.');
          } else if (psSpp && danaPsSpp >= kl.sekolah.spp) {
            potongDanaPasangan(psSpp, kl.sekolah.spp);
            kabar.push(psSpp.nama + ' membayarkan SPP bulanan ' + kl.nama + ' (' + rp(kl.sekolah.spp) + ') dari uangnya sendiri.');
          } else {
            kabar.push('Saldo rekening kurang untuk SPP bulanan ' + kl.nama + ' (' + rp(kl.sekolah.spp) + ').');
          }
        }
      }
    });
    /* nafkah bulanan (nominal bebas): jika tidak memberi nafkah, keharmonisan turun bertahap 1..6 bulan hingga 0% */
    if (gantiBulan) {
      var blnBaruD = blnNo(nBaru);
      var blnLaluD = blnNo(nLama);
      var gPemain = (S.profil && S.profil.gender) || 'cewek';
      var pasList = daftarPasangan(S);
      if (pasList.length) {
        if (gPemain === 'cowok') {
          S.tagihanNafkah = null;
          if ((S.nafkahTerbayarSampai || 0) >= blnLaluD) {
            S.bulanTanpaNafkah = 0;
          } else {
            S.bulanTanpaNafkah = Math.min(6, (S.bulanTanpaNafkah || 0) + 1);
            var blnKosong = S.bulanTanpaNafkah;
            if (blnKosong >= 6) {
              pasList.forEach(function (ps) { ps.bahagia = 0; });
              kabar.push('⚠️ Sudah 6 bulan berturut-turut tidak memberi nafkah! Keharmonisan pasangan turun ke 0%. Segera beri nafkah di aplikasi Keluarga.');
            } else {
              var batasHrm = Math.round(((6 - blnKosong) / 6) * 100);
              pasList.forEach(function (ps) {
                var hLama = ps.bahagia == null ? 80 : ps.bahagia;
                ps.bahagia = Math.max(0, Math.min(batasHrm, Math.round(hLama - 17)));
              });
              kabar.push('⚠️ Bulan ke-' + blnKosong + '/6 tanpa nafkah: keharmonisan pasangan menurun! Beri nafkah berapa pun nominalnya di aplikasi Keluarga (di bulan ke-6 keharmonisan menjadi 0%).');
            }
          }
        } else {
          var nafkahMasuk = Math.round((kota(S).umk || 4000000) * 1.15 * 0.4 / 1000) * 1000;
          S.bank.saldo += nafkahMasuk;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Nafkah bulanan dari ' + pasList[0].nama, jml: nafkahMasuk });
          S.rumahTangga = { aktifSampai: Math.max((S.rumahTangga && S.rumahTangga.aktifSampai) || nBaru, nBaru) + 30, paket: 'cukup' };
          kabar.push('💝 ' + pasList[0].nama + ' mengirimkan nafkah bulanan ' + rp(nafkahMasuk) + ' ke rekeningmu.');
        }
      }
      /* cicilan hadiah (HP/Motor/Rumah untuk keluarga/teman) bulanan */
      if (S.cicilanHadiah && S.cicilanHadiah.length) {
        for (var ci = S.cicilanHadiah.length - 1; ci >= 0; ci--) {
          var ch = S.cicilanHadiah[ci];
          if ((ch.terbayarSampai || 0) >= blnBaruD) continue;
          ch.terbayarSampai = blnBaruD;
          if (S.bank.saldo >= ch.angsuran) {
            S.bank.saldo -= ch.angsuran;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'Cicilan ' + ch.nama + ' (' + ch.untuk + ')', jml: -ch.angsuran });
            ch.sisa--;
            if (ch.sisa <= 0) { kabar.push('Cicilan ' + ch.nama + ' untuk ' + ch.untuk + ' sudah LUNAS!'); S.cicilanHadiah.splice(ci, 1); }
          } else {
            S.kreditBuruk = true;
            kabar.push('Saldo kurang untuk cicilan ' + ch.nama + ' (' + rp(ch.angsuran) + ').');
          }
        }
      }
      /* istri otomatis pakai uangnya untuk belanja pokok rumah tangga & kebutuhan adik ipar yang belum bekerja/menikah */
      if (pasList.length) {
        var psU = pasList[0], danaU = (psU.tabungan || 0) + (psU.dompet || 0);
        if ((!S.rumahTangga || (S.rumahTangga.aktifSampai || -1) < nBaru) && danaU >= 450000) {
          potongDanaPasangan(psU, 450000);
          S.rumahTangga = { aktifSampai: nBaru + 30, paket: 'cukup' };
          kabar.push(psU.nama + ' membelanjakan kebutuhan pokok rumah tangga bulan ini dari uangnya sendiri (Rp450.000).');
        }
        (S.keluarga || []).forEach(function (ip) {
          if (adalahIpar(ip) && ip.aktivitas !== 'kerja') {
            var kbt = 350000;
            if (((psU.tabungan || 0) + (psU.dompet || 0)) >= kbt) {
              potongDanaPasangan(psU, kbt);
              ip.bahagia = Math.min(100, (ip.bahagia || 80) + 6);
              kabar.push(psU.nama + ' menggunakan uangnya untuk kebutuhan bulanan adiknya (' + ip.nama + ', ' + rp(kbt) + ').');
            }
          }
        });
      }
      /* iuran bulanan BPJS Kesehatan (Kelas 1/2/3 asli) */
      var bp = S.kesehatan && S.kesehatan.bpjs;
      if (bp && bp.kelas > 0 && BPJS_KELAS[bp.kelas] && (bp.terbayarSampai || 0) < blnBaruD) {
        bp.terbayarSampai = blnBaruD;
        var jmlP = 1 + (S.keluarga ? S.keluarga.length : 0);
        var iuranB = BPJS_KELAS[bp.kelas].iuran * jmlP;
        if (S.bank.saldo >= iuranB) {
          S.bank.saldo -= iuranB;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Iuran ' + BPJS_KELAS[bp.kelas].nama + ' (' + jmlP + ' org)', jml: -iuranB });
          bp.aktif = true;
        } else {
          bp.aktif = false;
          bp.tunggakan = (bp.tunggakan || 0) + iuranB;
          kabar.push('⚠️ Saldo kurang untuk iuran ' + BPJS_KELAS[bp.kelas].nama + ' (' + rp(iuranB) + '). Kartu BPJS nonaktif sementara hingga tunggakan dilunasi.');
        }
      }
      S.penghasilanBulanIni = 0;
    }
    /* kondisi kritis: otomatis dilarikan ke IGD Rumah Sakit */
    if ((S.diri.kesehatan != null && S.diri.kesehatan <= 15) || (S.diri.sakit && S.diri.sakit.berat && S.diri.kesehatan <= 30)) {
      var biayaIgd = hargaRs(S, 'opname');
      var bpDar = S.kesehatan && S.kesehatan.bpjs;
      if (S.bank.saldo >= biayaIgd) { S.bank.saldo -= biayaIgd; S.bank.mutasi.unshift({ n: nBaru, ket: 'Darurat Masuk RS' + (bpDar && bpDar.aktif ? ' (BPJS)' : ' (Umum)'), jml: -biayaIgd }); }
      else S.uang.dompet = Math.max(0, (S.uang.dompet || 0) - biayaIgd);
      S.diri.sakit = null; S.diri.kesehatan = 75; S.diri.stamina = 70;
      kabar.unshift('🚑 DARURAT! Kondisimu drop & kamu dilarikan ke Rumah Sakit! Biaya perawatan ' + rp(biayaIgd) + (bpDar && bpDar.aktif ? ' (ditanggung BPJS Kelas ' + bpDar.kelas + ')' : ' (tarif Umum — aktifkan BPJS agar jauh lebih murah!)') + '.');
    }
    return kabar;
  }
  function potongDanaPasangan(ps, jml) {
    if (!ps || jml <= 0) return;
    var drDom = Math.min(ps.dompet || 0, jml);
    ps.dompet = (ps.dompet || 0) - drDom;
    ps.tabungan = Math.max(0, (ps.tabungan || 0) - (jml - drDom));
  }
  function sisaHariNafkah(S) {
    var t = KAL.tgl(S.hari), b = t.m, y = t.y;
    var h = S.hari + 1;
    while (h < S.hari + 35 && KAL.tgl(h).d !== 1) h++;
    return Math.max(1, h - S.hari);
  }
  /* bayar kebutuhan / sekolah / kuliah anggota keluarga: sumber = 'suami' | 'istri' | 'patungan' */
  function bayarKebutuhanKeluarga(S, targetId, biaya, ket, sumber) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    if (!kl) return 'Anggota keluarga tidak ditemukan.';
    biaya = Math.round(+biaya || 0);
    if (biaya <= 0) return 'Nominal tidak valid.';
    var ps = pasanganAktif(S), danaPs = ps ? ((ps.tabungan || 0) + (ps.dompet || 0)) : 0;
    if (sumber === 'istri') {
      if (!ps) return 'Belum punya pasangan.';
      if (danaPs < biaya) return 'Uang ' + ps.nama + ' tidak cukup (' + rp(danaPs) + ').';
      potongDanaPasangan(ps, biaya);
      kl.bahagia = Math.min(100, (kl.bahagia || 80) + 12);
      return { ok: true, teks: ps.nama + ' membayarkan ' + ket + ' untuk ' + kl.nama + ' (' + rp(biaya) + ') dari uangnya sendiri.' };
    }
    if (sumber === 'patungan') {
      if (!ps) return 'Belum punya pasangan untuk patungan.';
      var separuh = Math.round(biaya / 2), sisaS = biaya - separuh;
      if (danaPs < separuh) return 'Uang ' + ps.nama + ' tidak cukup untuk patungan (' + rp(separuh) + ').';
      if (S.bank.saldo < sisaS && (S.uang.dompet || 0) < sisaS) return 'Uangmu tidak cukup untuk patungan (' + rp(sisaS) + ').';
      potongDanaPasangan(ps, separuh);
      if (S.bank.saldo >= sisaS) { S.bank.saldo -= sisaS; S.bank.mutasi.unshift({ n: S.hari, ket: 'Patungan ' + ket + ' ' + kl.nama, jml: -sisaS }); }
      else S.uang.dompet -= sisaS;
      kl.bahagia = Math.min(100, (kl.bahagia || 80) + 15);
      ps.bahagia = Math.min(100, (ps.bahagia || 80) + 6);
      return { ok: true, teks: 'Patungan 50/50 dengan ' + ps.nama + ' untuk ' + ket + ' ' + kl.nama + ' (' + rp(sisaS) + ' + ' + rp(separuh) + ') berhasil!' };
    }
    /* default: dibayar suami/pemain */
    if (S.bank.saldo >= biaya) { S.bank.saldo -= biaya; S.bank.mutasi.unshift({ n: S.hari, ket: ket + ' ' + kl.nama, jml: -biaya }); }
    else if ((S.uang.dompet || 0) >= biaya) { S.uang.dompet -= biaya; }
    else return 'Saldo tidak cukup untuk ' + ket + ' (' + rp(biaya) + ').';
    kl.bahagia = Math.min(100, (kl.bahagia || 80) + 15);
    return { ok: true, teks: 'Kamu membayarkan ' + ket + ' untuk ' + kl.nama + ' (' + rp(biaya) + ').' };
  }
  /* jalan-jalan bersama keluarga dengan mobil sendiri */
  var JALAN_KELUARGA = [
    { id: 'keliling', nama: 'Keliling Kota & Streetfood', biaya: 150000, km: 15, jam: 2, bahagia: 12, sehat: 2, bersalah: 0, hb: 5, ket: 'Santai keliling kota sambil jajan kuliner' },
    { id: 'mall', nama: 'Jalan-jalan ke Mall & Makan', biaya: 500000, km: 20, jam: 3, bahagia: 22, sehat: 5, bersalah: 8, hb: 12, ket: 'Belanja & makan enak bareng keluarga di mall' },
    { id: 'wisata', nama: 'Wisata Pantai / Taman Bermain', biaya: 1500000, km: 40, jam: 5, bahagia: 35, sehat: 12, bersalah: 15, hb: 18, ket: 'Liburan seru seharian, semua makin harmonis' },
    { id: 'resort', nama: 'Staycation Resort & Shopping Mewah', biaya: 4500000, km: 50, jam: 6, bahagia: 50, sehat: 20, bersalah: 30, hb: 28, ket: 'Liburan mewah, kebahagiaan keluarga maksimal!' }
  ];
  function jalanKeluarga(S, id) {
    if (!S.mobil) return 'Butuh mobil sendiri untuk jalan-jalan bersama keluarga.';
    if (g.KK_MOBIL && g.KK_MOBIL.pikap(S)) return 'Mobil pikap kurang nyaman untuk jalan-jalan keluarga. Pakai MPV/SUV/Hatchback/Sedan.';
    if (!S.keluarga || !S.keluarga.length) return 'Belum ada anggota keluarga untuk diajak jalan-jalan.';
    var x = JALAN_KELUARGA.filter(function (j) { return j.id === id; })[0];
    if (!x) return 'Tujuan tidak ditemukan.';
    if (!g.KK_MOBIL.cukup(S, x.km)) return S.mobil.bbm === 'listrik' ? 'Baterai mobil listrik tidak cukup untuk jalan-jalan ' + x.km + ' km.' : 'Bensin mobil tidak cukup untuk jalan-jalan ' + x.km + ' km.';
    if ((S.uang.dompet || 0) >= x.biaya) S.uang.dompet -= x.biaya;
    else if (S.bank.saldo >= x.biaya) { S.bank.saldo -= x.biaya; S.bank.mutasi.unshift({ n: S.hari, ket: 'Jalan-jalan keluarga: ' + x.nama, jml: -x.biaya }); }
    else return 'Uang tidak cukup untuk ' + x.nama + ' (' + rp(x.biaya) + ').';
    g.KK_MOBIL.jalan(S, x.km, 1);
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + x.biaya;
    S.diri.kenyang = Math.min(100, S.diri.kenyang + 45);
    S.diri.minum = Math.min(100, S.diri.minum + 45);
    S.diri.stamina = Math.min(100, S.diri.stamina + 15);
    S.diri.kesehatan = Math.min(100, (S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + x.sehat);
    if (x.bersalah) S.diri.rasaBersalah = Math.max(0, (S.diri.rasaBersalah || 0) - x.bersalah);
    S.keluarga.forEach(function (kl) {
      kl.bahagia = Math.min(100, (kl.bahagia || 80) + x.bahagia);
      if (adalahPasangan(kl)) kl.hb = Math.min(100, (kl.hb || 30) + x.hb);
    });
    return { ok: true, menit: x.jam * 60, teks: '🚗 Jalan-jalan ke ' + x.nama + ' (' + rp(x.biaya) + ', ' + x.km + ' km) selesai! Kebahagiaan keluarga +' + x.bahagia + '%!' };
  }
  /* belikan / kredit hadiah (HP, Motor, Rumah) untuk keluarga atau teman — mengikuti tahun rilis game */
  var KATALOG_HADIAH = [
    { id: 'hp_redmi12c', kat: 'HP', tahun: 2023, nama: 'Xiaomi Redmi 12C', harga: 1400000, dp: 0.1, tenor: 12, naik: 16 },
    { id: 'hp_a54', kat: 'HP', tahun: 2023, nama: 'Samsung Galaxy A54 5G', harga: 6000000, dp: 0.1, tenor: 12, naik: 24 },
    { id: 'hp_iphone15', kat: 'HP', tahun: 2023, nama: 'iPhone 15 Pro Max', harga: 24500000, dp: 0.1, tenor: 12, naik: 36 },
    { id: 'hp_redmi', kat: 'HP', tahun: 2024, nama: 'Xiaomi Redmi 14C', harga: 1800000, dp: 0.1, tenor: 12, naik: 17 },
    { id: 'hp_samsung', kat: 'HP', tahun: 2024, nama: 'Samsung Galaxy A55 5G', harga: 6000000, dp: 0.1, tenor: 12, naik: 25 },
    { id: 'hp_iphone', kat: 'HP', tahun: 2024, nama: 'iPhone 16 Pro Max', harga: 25500000, dp: 0.1, tenor: 12, naik: 38 },
    { id: 'mtr_beat', kat: 'Motor', tahun: 2023, nama: 'Honda BeAT CBS', harga: 19400000, dp: 0.1, tenor: 24, naik: 32 },
    { id: 'mtr_nmax', kat: 'Motor', tahun: 2023, nama: 'Yamaha NMAX 155', harga: 32200000, dp: 0.1, tenor: 24, naik: 40 },
    { id: 'mtr_vespa', kat: 'Motor', tahun: 2023, nama: 'Vespa Primavera 150', harga: 54100000, dp: 0.1, tenor: 24, naik: 48 },
    { id: 'rmh_subsidi', kat: 'Rumah', tahun: 2023, nama: 'Rumah Subsidi Tipe 36', harga: 166000000, dp: 0.05, tenor: 180, naik: 50 },
    { id: 'rmh_45', kat: 'Rumah', tahun: 2023, nama: 'Rumah Tipe 45', harga: 450000000, dp: 0.1, tenor: 180, naik: 60 },
    { id: 'rmh_mewah', kat: 'Rumah', tahun: 2023, nama: 'Rumah Mewah Tipe 200', harga: 2500000000, dp: 0.1, tenor: 180, naik: 80 }
  ];
  function belikanHadiah(S, targetJenis, targetId, itemId, kredit) {
    var it = KATALOG_HADIAH.filter(function (x) { return x.id === itemId; })[0];
    if (!it) return 'Barang tidak ditemukan.';
    var thnH = KAL.tgl(S.hari).y, bebasThn = !!(g.KK_TOWER && g.KK_TOWER.bukaSemuaTahun(S));
    if (!bebasThn && (it.tahun || 2023) > thnH) return it.nama + ' baru rilis tahun ' + it.tahun + ' (tahun saat ini ' + thnH + ').';
    var target = targetJenis === 'teman'
      ? (S.teman || []).filter(function (x) { return x.id === targetId; })[0]
      : (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    if (!target) return 'Penerima tidak ditemukan.';
    if (kredit) {
      if (S.kreditBuruk) return 'Pengajuan kredit ditolak: ada riwayat telat bayar cicilan.';
      var dpRp = Math.round(it.harga * it.dp / 10000) * 10000;
      var pokok = it.harga - dpRp;
      var angs = Math.round((pokok * (1 + 0.008 * it.tenor) / it.tenor) / 1000) * 1000;
      if (S.bank.saldo < dpRp) return 'Saldo rekening tidak cukup untuk DP ' + rp(dpRp) + '.';
      S.bank.saldo -= dpRp;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'DP Kredit ' + it.nama + ' untuk ' + target.nama, jml: -dpRp });
      S.cicilanHadiah = S.cicilanHadiah || [];
      S.cicilanHadiah.push({ nama: it.nama, untuk: target.nama, angsuran: angs, sisa: it.tenor, terbayarSampai: blnNo(S.hari) });
      target.hadiah = target.hadiah || [];
      target.hadiah.push(it.nama + ' (Kredit)');
      if (targetJenis === 'teman') target.hubungan = Math.min(100, (target.hubungan || 50) + it.naik);
      else target.bahagia = Math.min(100, (target.bahagia || 80) + it.naik);
      return { ok: true, teks: '🎁 Kredit ' + it.nama + ' untuk ' + target.nama + ' disetujui! DP ' + rp(dpRp) + ', angsuran ' + rp(angs) + '/bln (' + it.tenor + ' bln).' };
    }
    if (S.bank.saldo >= it.harga) { S.bank.saldo -= it.harga; S.bank.mutasi.unshift({ n: S.hari, ket: 'Belikan ' + it.nama + ' untuk ' + target.nama, jml: -it.harga }); }
    else if ((S.uang.dompet || 0) >= it.harga) S.uang.dompet -= it.harga;
    else return 'Saldo tidak cukup untuk membelikan ' + it.nama + ' (' + rp(it.harga) + ').';
    target.hadiah = target.hadiah || [];
    target.hadiah.push(it.nama);
    if (targetJenis === 'teman') target.hubungan = Math.min(100, (target.hubungan || 50) + it.naik);
    else target.bahagia = Math.min(100, (target.bahagia || 80) + it.naik);
    return { ok: true, teks: '🎁 Kamu membelikan ' + it.nama + ' (' + rp(it.harga) + ') untuk ' + target.nama + '! Dia sangat senang!' };
  }
  function bayarCicilanHadiah(S, idx) {
    if (!S.cicilanHadiah || !S.cicilanHadiah[idx]) return 'Cicilan hadiah tidak ditemukan.';
    var ch = S.cicilanHadiah[idx];
    if (S.bank.saldo < ch.angsuran) return 'Saldo rekening tidak cukup untuk bayar cicilan ' + ch.nama + ' (' + rp(ch.angsuran) + ').';
    S.bank.saldo -= ch.angsuran;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Bayar cicilan ' + ch.nama + ' (' + ch.untuk + ')', jml: -ch.angsuran });
    ch.sisa--;
    var blnNext = blnNo(S.hari) + 1;
    ch.terbayarSampai = Math.max(ch.terbayarSampai || (blnNext - 1), blnNext - 1) + 1;
    if (ch.sisa <= 0) {
      S.cicilanHadiah.splice(idx, 1);
      return { ok: true, teks: '🎉 Cicilan ' + ch.nama + ' untuk ' + ch.untuk + ' sudah LUNAS!' };
    }
    return { ok: true, teks: 'Cicilan ' + ch.nama + ' (' + rp(ch.angsuran) + ') dibayar (bulan ini lunas, tidak ditagih lagi). Sisa ' + ch.sisa + ' bln.' };
  }
  /* ---------- keuangan pasangan, nafkah bebas nominal, pinjam/bantuan beli, aktivitas keluarga, penginapan/hotel ---------- */
  function bayarNafkah(S, nominal) {
    var pasList = daftarPasangan(S), pas = pasList[0] || pasanganAktif(S);
    if (!pas) return 'Belum punya pasangan.';
    var jml = Math.round(+(nominal != null ? nominal : 500000) || 0);
    if (jml < 50000) return 'Nominal nafkah minimal Rp50.000.';
    if (S.bank.saldo >= jml) {
      S.bank.saldo -= jml;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Nafkah untuk ' + pas.nama, jml: -jml });
    } else if ((S.uang.dompet || 0) >= jml) {
      S.uang.dompet -= jml;
    } else return 'Uang tidak cukup untuk nafkah (' + rp(jml) + ').';
    pas.dompet = (pas.dompet || 0) + Math.round(jml * 0.35);
    pas.tabungan = (pas.tabungan || 0) + (jml - Math.round(jml * 0.35));
    var bonusHrm = jml >= 5000000 ? 24 : jml >= 2000000 ? 18 : jml >= 500000 ? 14 : 10;
    var bonusPrs = jml >= 2000000 ? 8 : 5;
    (pasList.length ? pasList : [pas]).forEach(function (ps) {
      ps.bahagia = Math.min(100, (ps.bahagia == null ? 80 : ps.bahagia) + bonusHrm);
      ps.perasaan = Math.min(100, (ps.perasaan == null ? 75 : ps.perasaan) + bonusPrs);
    });
    var blnIni = blnNo(S.hari);
    S.nafkahTerbayarSampai = Math.max(S.nafkahTerbayarSampai || 0, blnIni);
    S.bulanTanpaNafkah = 0;
    S.nafkahTerakhirHari = S.hari;
    S.tagihanNafkah = null;
    /* uang istri dipakai untuk seluruh kebutuhan rumah tangga sebulan */
    S.rumahTangga = { aktifSampai: Math.max((S.rumahTangga && S.rumahTangga.aktifSampai) || S.hari, S.hari) + 30, paket: 'cukup' };
    return { ok: true, teks: '💝 Nafkah ' + rp(jml) + ' diberikan ke ' + pas.nama + '! Keharmonisan +' + bonusHrm + '% & kebutuhan rumah tangga 30 hari terjamin.' };
  }
  function pinjamPasangan(S, id, jml) {
    var ps = (S.keluarga || []).filter(function (x) { return x.id === id; })[0] || pasanganAktif(S);
    if (!ps) return 'Pasangan tidak ditemukan.';
    jml = Math.round(+jml || 0); if (jml <= 0) return 'Masukkan nominal pinjaman.';
    var danaPs = (ps.tabungan || 0) + (ps.dompet || 0);
    if (danaPs < jml) return 'Tabungan & dompet ' + ps.nama + ' hanya ' + rp(danaPs) + '.';
    var hrm = ps.bahagia == null ? 80 : ps.bahagia;
    var peluang = hrm > 90 ? 0.96 : hrm >= 70 ? 0.72 : 0.3;
    if (Math.random() > peluang) return ps.nama + ' belum bersedia meminjamkan uang sekarang (hubungan ' + Math.round(hrm) + '%).';
    var drTab = Math.min(ps.tabungan || 0, jml);
    ps.tabungan = (ps.tabungan || 0) - drTab;
    ps.dompet = Math.max(0, (ps.dompet || 0) - (jml - drTab));
    S.bank.saldo += jml;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Pinjam uang dari ' + ps.nama, jml: jml });
    S.utangPasangan = (S.utangPasangan || 0) + jml;
    return { ok: true, teks: ps.nama + ' meminjamkan ' + rp(jml) + ' ke rekeningmu. Total utang ke pasangan: ' + rp(S.utangPasangan) + '.' };
  }
  function bayarUtangPasangan(S, jml) {
    var ps = pasanganAktif(S); if (!ps) return 'Pasangan tidak ditemukan.';
    var ut = S.utangPasangan || 0; if (ut <= 0) return 'Tidak ada utang ke pasangan.';
    jml = Math.min(ut, Math.round(+jml || ut));
    if (S.bank.saldo >= jml) { S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: S.hari, ket: 'Bayar utang ke ' + ps.nama, jml: -jml }); }
    else if ((S.uang.dompet || 0) >= jml) { S.uang.dompet -= jml; }
    else return 'Uang tidak cukup untuk bayar utang (' + rp(jml) + ').';
    ps.tabungan = (ps.tabungan || 0) + jml;
    S.utangPasangan = Math.max(0, ut - jml);
    ps.bahagia = Math.min(100, (ps.bahagia || 80) + 5);
    return { ok: true, teks: 'Utang ke ' + ps.nama + ' dibayar ' + rp(jml) + '. Sisa utang: ' + rp(S.utangPasangan) + '.' };
  }
  function mintaBantuanPasangan(S, jml) {
    var ps = pasanganAktif(S); if (!ps) return 'Belum punya pasangan.';
    var danaPs = (ps.tabungan || 0) + (ps.dompet || 0);
    if (danaPs < 100000) return 'Tabungan & dompet ' + ps.nama + ' belum cukup (' + rp(danaPs) + ').';
    jml = jml === 'semua' ? danaPs : Math.min(danaPs, Math.round(+jml || 0));
    if (jml <= 0) return 'Nominal tidak valid.';
    var hrm = ps.bahagia == null ? 80 : ps.bahagia;
    var peluang = hrm > 90 ? 0.95 : hrm >= 75 ? 0.65 : 0.22;
    if (Math.random() > peluang) {
      return ps.nama + ' menolak bantu beli saat ini ("Hubungan kita lagi kurang harmonis, ' + Math.round(hrm) + '%"). Jaga keharmonisan >90% agar mudah setuju!';
    }
    var drTab = Math.min(ps.tabungan || 0, jml);
    ps.tabungan = (ps.tabungan || 0) - drTab;
    ps.dompet = Math.max(0, (ps.dompet || 0) - (jml - drTab));
    S.bank.saldo += jml;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Bantuan belanja dari ' + ps.nama, jml: jml });
    return { ok: true, teks: '❤️ ' + ps.nama + ' setuju membantu! ' + rp(jml) + ' ditransfer ke rekeningmu untuk kebutuhan belanjamu.' };
  }
  function aturAktivitasKeluarga(S, id, mode) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || adalahPasangan(kl)) return 'Anggota keluarga tidak ditemukan.';
    var us = KAL.usia(S.hari, kl.tglLahir);
    if (mode === 'kerja' && us < 17) return kl.nama + ' masih ' + us + ' tahun (minimal 17 tahun untuk bekerja).';
    kl.aktivitas = mode === 'kerja' ? 'kerja' : 'rumah';
    return { ok: true, teks: kl.nama + (kl.aktivitas === 'kerja' ? ' sekarang bekerja dan ikut membantu kebutuhan rumah tangga tiap bulan.' : ' sekarang di rumah (membantu memasak & mengurus rumah).') };
  }
  var PENGINAPAN_LUAR = [
    { id: 'melati', nama: 'Penginapan Melati', harga: 50000, jam: 6, stamina: 75, sehat: 2, bersalah: 0, kebal: 0, ket: 'Hemat, aman dari angin malam' },
    { id: 'wisma', nama: 'Wisma / Losmen AC', harga: 120000, jam: 7, stamina: 90, sehat: 6, bersalah: 5, kebal: 0, ket: 'Kamar AC nyaman, tidur lebih nyenyak' },
    { id: 'hotel3', nama: 'Hotel Bintang 3', harga: 350000, jam: 8, stamina: 100, sehat: 14, bersalah: 15, kebal: 1, ket: 'Kasur empuk + sarapan, tubuh segar & kebal sakit 1 hr' },
    { id: 'hotel4', nama: 'Hotel Bintang 4', harga: 750000, jam: 8, stamina: 100, sehat: 22, bersalah: 25, kebal: 2, ket: 'Fasilitas lengkap, pulihkan kesehatan & kebal sakit 2 hr' },
    { id: 'hotel5', nama: 'Hotel Bintang 5 Mewah', harga: 1800000, jam: 8, stamina: 100, sehat: 40, bersalah: 40, kebal: 3, ket: 'Kamar mewah + spa, stamina & kesehatan prima, kebal sakit 3 hr' }
  ];
  function menginapLuar(S, id) {
    var x = PENGINAPAN_LUAR.filter(function (p) { return p.id === id; })[0];
    if (!x) return 'Pilihan penginapan tidak ditemukan.';
    if ((S.uang.dompet || 0) >= x.harga) { S.uang.dompet -= x.harga; }
    else if (S.bank.saldo >= x.harga) { S.bank.saldo -= x.harga; S.bank.mutasi.unshift({ n: S.hari, ket: 'Menginap di ' + x.nama, jml: -x.harga }); }
    else return 'Uang tidak cukup untuk ' + x.nama + ' (' + rp(x.harga) + ').';
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + x.harga;
    S.diri.stamina = Math.min(100, Math.max(S.diri.stamina, x.stamina));
    S.diri.kesehatan = Math.min(100, (S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + x.sehat);
    if (x.bersalah) S.diri.rasaBersalah = Math.max(0, (S.diri.rasaBersalah || 0) - x.bersalah);
    if (x.kebal) S.diri.kebalSampai = Math.max(S.diri.kebalSampai || -1, S.hari + x.kebal);
    if (x.harga >= 350000) { S.diri.kenyang = Math.min(100, S.diri.kenyang + 35); S.diri.minum = Math.min(100, S.diri.minum + 35); }
    return { ok: true, menit: x.jam * 60, teks: 'Menginap di ' + x.nama + ' (' + rp(x.harga) + ', ' + x.jam + ' jam). Stamina ' + Math.round(S.diri.stamina) + '%, kesehatan ' + Math.round(S.diri.kesehatan) + '%!' };
  }
  /* ---------- BPJS Kesehatan (Kelas 1, 2, 3 asli) & Masuk Rumah Sakit ---------- */
  var BPJS_KELAS = {
    0: { kelas: 0, nama: 'Umum (Tanpa BPJS)', iuran: 0, diskon: 0, ket: 'Bayar 100% tarif rumah sakit umum' },
    3: { kelas: 3, nama: 'BPJS Kelas 3', iuran: 35000, diskon: 0.88, ket: 'Iuran Rp35.000/org/bln (bersubsidi) · diskon RS 88%' },
    2: { kelas: 2, nama: 'BPJS Kelas 2', iuran: 100000, diskon: 0.92, ket: 'Iuran Rp100.000/org/bln · kamar Kelas 2, diskon RS 92%' },
    1: { kelas: 1, nama: 'BPJS Kelas 1', iuran: 150000, diskon: 0.95, ket: 'Iuran Rp150.000/org/bln · kamar Kelas 1 AC, diskon RS 95%' }
  };
  var LAYANAN_RS = [
    { id: 'igd', nama: 'IGD & Rawat Jalan Spesialis', umum: 450000, jam: 2, sehat: 35, stamina: 20, kebal: 1, sembuh: true, ket: 'Penanganan cepat IGD & obat dokter spesialis' },
    { id: 'opname', nama: 'Rawat Inap / Opname (1 Hari)', umum: 1850000, jam: 12, sehat: 100, stamina: 95, kebal: 3, sembuh: true, ket: 'Rawat inap, infus & pemulihan penuh dari sakit berat' },
    { id: 'vip', nama: 'Perawatan Intensif / Operasi RS', umum: 6500000, jam: 24, sehat: 100, stamina: 100, kebal: 7, sembuh: true, ket: 'Tindakan medis menyeluruh, pulih 100% & kebal 7 hari' }
  ];
  function hargaRs(S, layananId) {
    var l = LAYANAN_RS.filter(function (x) { return x.id === layananId; })[0];
    if (!l) return 0;
    var bp = (S.kesehatan && S.kesehatan.bpjs) || { kelas: 0, aktif: false };
    var k = bp.aktif && BPJS_KELAS[bp.kelas] ? BPJS_KELAS[bp.kelas] : BPJS_KELAS[0];
    return Math.round(l.umum * (1 - k.diskon) / 5000) * 5000;
  }
  function daftarBpjs(S, kelas) {
    kelas = +kelas || 0;
    S.kesehatan = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1 };
    S.kesehatan.bpjs = S.kesehatan.bpjs || { kelas: 0, aktif: false, tunggakan: 0 };
    if (kelas === 0) {
      S.kesehatan.bpjs = { kelas: 0, aktif: false, tunggakan: 0 };
      return { ok: true, teks: 'Kepesertaan BPJS Kesehatan dinonaktifkan (kembali ke pasien Umum).' };
    }
    var k = BPJS_KELAS[kelas]; if (!k) return 'Kelas BPJS tidak valid.';
    var jmlOrg = 1 + (S.keluarga ? S.keluarga.length : 0);
    var totalIuran = k.iuran * jmlOrg;
    if (S.bank.saldo >= totalIuran) { S.bank.saldo -= totalIuran; S.bank.mutasi.unshift({ n: S.hari, ket: 'Iuran ' + k.nama + ' (' + jmlOrg + ' org)', jml: -totalIuran }); }
    else if ((S.uang.dompet || 0) >= totalIuran) S.uang.dompet -= totalIuran;
    else return 'Saldo tidak cukup untuk iuran bulan pertama ' + k.nama + ' (' + rp(totalIuran) + ' untuk ' + jmlOrg + ' org).';
    S.kesehatan.bpjs = { kelas: kelas, aktif: true, tunggakan: 0, terbayarSampai: blnNo(S.hari) };
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + totalIuran;
    return { ok: true, teks: '🏥 ' + k.nama + ' aktif untuk ' + jmlOrg + ' orang! Iuran ' + rp(totalIuran) + '/bln. Biaya Rumah Sakit kini jauh lebih murah!' };
  }
  function bayarTunggakanBpjs(S) {
    var bp = S.kesehatan && S.kesehatan.bpjs;
    if (!bp || !(bp.tunggakan > 0)) return 'Tidak ada tunggakan BPJS Kesehatan.';
    var tg = bp.tunggakan;
    if (S.bank.saldo >= tg) { S.bank.saldo -= tg; S.bank.mutasi.unshift({ n: S.hari, ket: 'Lunasi tunggakan BPJS Kesehatan', jml: -tg }); }
    else if ((S.uang.dompet || 0) >= tg) S.uang.dompet -= tg;
    else return 'Saldo tidak cukup untuk melunasi tunggakan BPJS (' + rp(tg) + ').';
    bp.tunggakan = 0; bp.aktif = true;
    return { ok: true, teks: 'Tunggakan BPJS Kesehatan ' + rp(tg) + ' lunas! Kartu BPJS Kelas ' + bp.kelas + ' kembali AKTIF.' };
  }
  function masukRumahSakit(S, layananId, targetId) {
    var l = LAYANAN_RS.filter(function (x) { return x.id === layananId; })[0];
    if (!l) return 'Layanan rumah sakit tidak ditemukan.';
    var kl = null;
    if (targetId && targetId !== 'pemain') {
      kl = (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
      if (!kl) return 'Pasien tidak ditemukan.';
    }
    var bp = (S.kesehatan && S.kesehatan.bpjs) || { kelas: 0, aktif: false };
    var biaya = hargaRs(S, layananId);
    if (biaya > 0) {
      if (S.bank.saldo >= biaya) { S.bank.saldo -= biaya; S.bank.mutasi.unshift({ n: S.hari, ket: 'RS: ' + l.nama + (bp.aktif ? ' (BPJS Kls ' + bp.kelas + ')' : ' (Umum)'), jml: -biaya }); }
      else if ((S.uang.dompet || 0) >= biaya) S.uang.dompet -= biaya;
      else return 'Uang tidak cukup untuk ' + l.nama + ' (' + rp(biaya) + ').' + (!bp.aktif ? ' Aktifkan BPJS Kesehatan agar jauh lebih murah!' : '');
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya;
    }
    var namaP = S.namaPemain || 'Kamu';
    if (!kl) {
      S.diri.sakit = null;
      S.diri.kesehatan = l.sehat >= 100 ? 100 : Math.min(100, (S.diri.kesehatan || 60) + l.sehat);
      S.diri.stamina = Math.min(100, Math.max(S.diri.stamina, l.stamina));
      S.diri.kebalSampai = Math.max(S.diri.kebalSampai || -1, S.hari + l.kebal);
    } else {
      namaP = kl.nama;
      kl.sakit = null;
      kl.bahagia = Math.min(100, (kl.bahagia || 80) + 18);
    }
    var hemat = l.umum - biaya;
    return { ok: true, menit: l.jam * 60, teks: '🏥 ' + namaP + ' selesai menjalani ' + l.nama + ' (' + rp(biaya) + (hemat > 0 ? ', hemat ' + rp(hemat) + ' pakai BPJS Kls ' + bp.kelas : ' · Tarif Umum') + '). Sehat & bugar kembali!' };
  }
  /* bar perasaan, ciuman, dan foreplay untuk pasangan, keluarga dewasa (ipar), dan teman */
  function labelPerasaan(v) {
    var n = Math.round(v == null ? 50 : v);
    return n >= 85 ? 'Penuh Cinta' : n >= 60 ? 'Sayang & Terbuka' : n >= 35 ? 'Mulai Nyaman' : 'Dingin';
  }
  function momenMesra(S, aksi, targetJenis, targetId) {
    if (S.diri.sakit) return 'Kamu sedang sakit. Obati dulu di Apotek K-24.';
    var isTeman = targetJenis === 'teman';
    var target = isTeman
      ? (S.teman || []).filter(function (x) { return x.id === targetId; })[0]
      : (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    if (!target) return 'Karakter tidak ditemukan.';
    var usia = KAL.usia(S.hari, target.tglLahir);
    var isPas = !isTeman && adalahPasangan(target);
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    if (!isPas && target.gender === gPem) return 'Aksi mesra hanya bisa dilakukan dengan lawan jenis.';
    if (!isPas && usia < 18) return 'Aksi ini hanya untuk karakter dewasa (18 tahun ke atas).';
    if (!isTeman && !isPas && target.peran === 'anak') return 'Aksi mesra tidak bisa dilakukan ke anak.';
    if (!isTeman) {
      if (target.sakit) return target.nama + ' sedang sakit. Obati dulu di Apotek K-24.';
      if (g.KK_TEMAN && g.KK_TEMAN.sedangKeluar(target, S)) return target.nama + ' sedang tidak di rumah (' + g.KK_TEMAN.alasanTeks(target) + ').';
    }
    var pr = typeof target.perasaan === 'number' ? target.perasaan : (isPas ? 75 : isTeman ? (target.hubungan || 45) : 50);
    var hub = isTeman ? (target.hubungan || 45) : (target.bahagia == null ? 80 : target.bahagia);
    var punyaPas = !!pasanganAktif(S);

    if (aksi === 'ciuman') {
      if (isPas && pr < 20 && hub < 25) return target.nama + ' masih kesal (perasaan ' + Math.round(pr) + '%). Perbaiki hubungan atau ajak jalan-jalan dulu.';
      if (!isPas && isTeman && pr < 35 && hub < 50) {
        target.hubungan = Math.max(0, hub - 3);
        return target.nama + ' menghindar malu: "Eh, kita belum sedekat itu..." (butuh hubungan ≥50% atau perasaan ≥35%).';
      }
      if (!isPas && !isTeman && pr < 40 && hub < 55) {
        return target.nama + ' masih canggung (butuh perasaan ≥40% atau bahagia ≥55%).';
      }
      target.perasaan = Math.min(100, pr + (isPas ? 15 : 16));
      target.hb = Math.min(100, (target.hb == null ? 30 : target.hb) + 15);
      if (isTeman) target.hubungan = Math.min(100, hub + 8);
      else target.bahagia = Math.min(100, hub + (isPas ? 10 : 8));
      S.diri.hb = Math.min(100, (S.diri.hb || 0) + 12);
      S.diri.stamina = Math.min(100, (S.diri.stamina || 50) + 5);
      if (!isPas && punyaPas) S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 6);
      return { ok: true, menit: 12, teks: '💋 Ciuman hangat bersama ' + target.nama + '! Bar Perasaan naik ke ' + Math.round(target.perasaan) + '% (' + labelPerasaan(target.perasaan) + '), Bar HB ' + Math.round(target.hb) + '%.' };
    }

    if (aksi === 'foreplay') {
      if (isPas && pr < 40) return 'Perasaan ' + target.nama + ' baru ' + Math.round(pr) + '%. Mulai dengan 💋 Ciuman dulu sampai perasaan minimal 40%!';
      if (!isPas && pr < 55 && hub < 60) return 'Perasaan ' + target.nama + ' baru ' + Math.round(pr) + '%. Mulai dengan 💋 Ciuman atau lebih akrab dulu (perasaan ≥55% atau hubungan ≥60%).';
      target.perasaan = Math.min(100, pr + 22);
      target.hb = Math.min(100, (target.hb == null ? 30 : target.hb) + 28);
      if (isTeman) target.hubungan = Math.min(100, hub + 12);
      else target.bahagia = Math.min(100, hub + 14);
      target.foreplayHari = S.hari;
      S.diri.hb = Math.min(100, (S.diri.hb || 0) + 25);
      if (!isPas && punyaPas) S.diri.rasaBersalah = Math.min(100, (S.diri.rasaBersalah || 0) + 12);
      return { ok: true, menit: 25, teks: '🔥 Foreplay romantis bersama ' + target.nama + '! Bar Perasaan ' + Math.round(target.perasaan) + '%, Bar HB ' + Math.round(target.hb) + '% · Siap lanjut HB dengan kepuasan maksimal!' };
    }
    return 'Aksi tidak dikenal.';
  }
  /* pemain sedang melayani: stamina rendah atau sakit membuat lambat dan kurang ramah */
  function ramah(S) { var d = S.diri; return d ? 4.4 - (d.stamina < 25 ? 1.2 : 0) - (d.kenyang < 15 || d.minum < 15 ? 0.5 : 0) - (d.sakit ? 0.6 : 0) : 4.4; }
  function lambat(S) { var d = S.diri; return d && (d.stamina < 20 || d.sakit) ? 2 : 1; }

  g.KK_DIRI = { beli: beli, hargaItem: hargaItem, hargaGofood: hargaGofood, diskonToko: diskonToko, hargaToko: hargaToko, siapkan: siapkan, jalan: jalan, makan: makan, cekKiriman: cekKiriman, istirahat: istirahat, tidur: tidur,
    beliBarang: beliBarang, infoUmurBarang: infoUmurBarang, nilaiJualBarang: nilaiJualBarang, jualBarang: jualBarang,
    konsolModel: konsolModel, gameModel: gameModel, punyaKonsol: punyaKonsol, adaKonsol: adaKonsol, bisaMainGame: bisaMainGame,
    beliKonsol: beliKonsol, nilaiJualKonsol: nilaiJualKonsol, jualKonsol: jualKonsol, beliGame: beliGame, nilaiJualGame: nilaiJualGame, jualGame: jualGame,
    gadgetModel: gadgetModel, pbModel: pbModel, pbAktifInfo: pbAktifInfo, beliPowerBank: beliPowerBank, pakaiPowerBank: pakaiPowerBank, togglePowerBank: togglePowerBank, toggleCasPowerBank: toggleCasPowerBank, apkModel: apkModel, hpAktif: hpAktif, adaWifi: adaWifi, pakaiKuota: pakaiKuota, toggleCasHp: toggleCasHp,
    beliPulsa: beliPulsa, beliKuota: beliKuota, toggleWifiRumah: toggleWifiRumah, infoStorageHp: infoStorageHp,
    beliGadget: beliGadget, pakaiHp: pakaiHp, nilaiJualGadget: nilaiJualGadget, jualGadget: jualGadget, instalApk: instalApk, hapusApk: hapusApk, mainGameHp: mainGameHp,
    adalahPasangan: adalahPasangan, adalahIpar: adalahIpar, daftarPasangan: daftarPasangan, pasanganAktif: pasanganAktif, labelPeran: labelPeran,
    bayarNafkah: bayarNafkah, sisaHariNafkah: sisaHariNafkah, bayarCicilanHadiah: bayarCicilanHadiah, bayarKebutuhanKeluarga: bayarKebutuhanKeluarga, JALAN_KELUARGA: JALAN_KELUARGA, jalanKeluarga: jalanKeluarga, KATALOG_HADIAH: KATALOG_HADIAH, belikanHadiah: belikanHadiah, pinjamPasangan: pinjamPasangan, bayarUtangPasangan: bayarUtangPasangan, mintaBantuanPasangan: mintaBantuanPasangan, aturAktivitasKeluarga: aturAktivitasKeluarga, PENGINAPAN_LUAR: PENGINAPAN_LUAR, menginapLuar: menginapLuar,
    tambahKeluarga: tambahKeluarga, ubahTtlKeluarga: ubahTtlKeluarga, aturJajan: aturJajan, ENERGI: ENERGI, minumEnergi: minumEnergi, meTime: meTime, HIBURAN: HIBURAN, hiburanJalan: hiburanJalan, PAKET_NIKAH: PAKET_NIKAH, nikahiTeman: nikahiTeman, faktorPromo: faktorPromo, ubahNamaKeluarga: ubahNamaKeluarga, ubahStatusKeluarga: ubahStatusKeluarga, ceraiPasangan: ceraiPasangan,
    kirimPesanKeluarga: kirimPesanKeluarga, belanjaPasarPokok: belanjaPasarPokok,
    aturLokasiKeluarga: aturLokasiKeluarga, beriBiayaKeluarga: beriBiayaKeluarga, hapusKeluarga: hapusKeluarga,
    hargaRumahTangga: hargaRumahTangga, beriRumahTangga: beriRumahTangga, makanDiRumah: makanDiRumah,
    daftarKuliahPasangan: daftarKuliahPasangan, aturKerjaPasangan: aturKerjaPasangan, daftarSekolahAnak: daftarSekolahAnak,
    itemApotek: itemApotek, beliApotek: beliApotek, pakaiObat: pakaiObat, lakukanHb: lakukanHb, momenMesra: momenMesra, labelPerasaan: labelPerasaan,
    BPJS_KELAS: BPJS_KELAS, LAYANAN_RS: LAYANAN_RS, hargaRs: hargaRs, daftarBpjs: daftarBpjs, bayarTunggakanBpjs: bayarTunggakanBpjs, masukRumahSakit: masukRumahSakit,
    daftarBisaDisewa: daftarBisaDisewa, toggleSewaBarang: toggleSewaBarang,
    infoLokasiRental: infoLokasiRental, bukaRentalPs: bukaRentalPs, beliTvRentalPs: beliTvRentalPs, tambahUnitRentalPs: tambahUnitRentalPs,
    aturTarifRentalPs: aturTarifRentalPs, beliKasetRentalPs: beliKasetRentalPs, aturPenjagaRentalPs: aturPenjagaRentalPs,
    stokMinumRentalPs: stokMinumRentalPs, beliTokenRentalPs: beliTokenRentalPs, jalanRentalPs: jalanRentalPs,
    beliTokenKos: beliTokenKos, punya: punya, tempat: tempat, adaAc: adaAc, barang: barang, kameraHp: kameraHp, gantiHari: gantiHari, ramah: ramah, lambat: lambat, kota: kota };
})(window);
