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
    if (!S.diri) S.diri = { kenyang: 80, minum: 80, stamina: 90, melek: 90, posisi: 'kedai', bangun: 360, ketiduran: 0 };
    if (!S.rumah) S.rumah = { jenis: 'kos', sewa: kota(S).kos, kwh: 10, barang: {}, tempo: Math.min(28, KAL.tgl(S.hari).d), padam: false };
    if (S.rumah.jarak == null) S.rumah.jarak = N.jarakKos;
    S.rumah.infoBarang = S.rumah.infoBarang || {};
    S.game = S.game || { konsol: {}, kaset: {}, pasar: null };
    S.game.konsol = S.game.konsol || {};
    S.game.kaset = S.game.kaset || {};
    Object.keys(S.rumah.barang).forEach(function (id) {
      if (!S.rumah.barang[id]) return;
      var b = barang(id);
      if (b && !S.rumah.infoBarang[id]) S.rumah.infoBarang[id] = { dibeli: S.hari, pakai: 0, hargaBeli: b.harga };
    });
    ['ps5', 'ps5disc'].forEach(function (kid) {
      if (S.rumah.barang[kid] && !S.game.konsol[kid]) {
        var km = konsolModel(kid);
        if (km) S.game.konsol[kid] = { id: kid, nama: km.nama, merek: km.merek, hargaBeli: km.harga, dibeli: S.hari, pakai: 0, bekas: false, kondisi: 'baru', ketKondisi: 'Baru bersegel resmi Sony Indonesia', tahun: km.tahun[0], kelengkapan: km.kelengkapan };
      }
    });
    if (!S.game.pasar || S.game.pasar.minggu !== Math.floor(S.hari / 7)) acakPasarGame(S);
    return S;
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
    var turunStamina = TURUN.stamina * (kerja ? 1.5 : 1) + (d.kenyang < 5 ? 8 : 0) + (d.minum < 5 ? 10 : 0);
    if (d.posisi === 'kos' && !kerja) turunStamina = -(punya(S, 'sofa') ? 12 : punya(S, 'tv') || punya(S, 'karpet') ? 10 : 6);
    d.stamina = batas(d.stamina - turunStamina * j);
    listrikKos(S, dMenit, false);
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
      if (!bayarTunai(S, 7000)) return 'Uang di laci tidak cukup untuk beras dan lauk.';
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
      if (d.posisi !== 'kedai') return 'Bikin kopi di kedai.';
      if (!g.KK_STOK.ada(S, 'kopi', 15)) return 'Stok kopi habis.';
      g.KK_STOK.ambil(S, 'kopi', 15); d.melek = batas(d.melek + 25); d.minum = batas(d.minum + 10);
      return { ok: true, menit: 5, teks: 'Ngopi dulu. Rasa kantuk berkurang.' };
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
    if (!bayarTunai(S, h)) return 'Uang di laci tidak cukup.';
    d.kenyang = batas(d.kenyang + x.kenyang); d.minum = batas(d.minum + x.minum);
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
    var stamPs = (km ? km.stamina : 16) + (gAktif ? gAktif.stamina : S.rumah.barang.kaset ? 6 : 0);
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
    var kwPs = km ? km.kw : 0.2;
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
    var mutu = (ac && !S.rumah.padam ? 1 : punya(S, 'kipas') && !S.rumah.padam ? 0.85 : 0.7) * (punya(S, 'springbed') ? 1.1 : S.rumah.jenis === 'rumah' ? 0.9 : 1);
    d.melek = batas(d.melek + jam * 14 * mutu);
    d.stamina = batas(d.stamina + jam * 11 * mutu);
    d.kenyang = batas(d.kenyang - jam * 2); d.minum = batas(d.minum - jam * 3);
    return { jam: jam, ac: ac, mutu: mutu };
  }

  /* ---------- isi kos, toko game & jual barang ---------- */
  function bayarBelanja(S, harga, ket, caraBayar) {
    if (caraBayar === 'kk') {
      var err = g.KK_UANG.pakaiKk(S, harga, ket);
      return err === true ? true : err;
    }
    if (S.bank.saldo < harga) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= harga; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -harga });
    return true;
  }
  function beliBarang(S, id, caraBayar) {
    var b = barang(id); if (!b) return 'Barang tidak dikenal.';
    if (id === 'ps5' || id === 'ps5disc') return beliKonsol(S, id, caraBayar);
    if (punya(S, id) && !b.banyak) return 'Sudah punya ' + b.nama + '.';
    if (b.rumah && S.rumah.jenis !== 'rumah') return b.nama + ' tidak muat di kamar kos. Butuh rumah sendiri.';
    if (b.butuh && !punya(S, b.butuh)) return b.nama + ' butuh ' + barang(b.butuh).nama + ' dulu.';
    var by = bayarBelanja(S, b.harga, 'Tokopedia: ' + b.nama + ' (' + b.merek + ')', caraBayar);
    if (by !== true) return by;
    S.rumah.barang[id] = b.banyak ? (S.rumah.barang[id] || 0) + 1 : true;
    S.rumah.infoBarang = S.rumah.infoBarang || {};
    S.rumah.infoBarang[id] = { dibeli: S.hari, pakai: 0, hargaBeli: b.harga };
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + b.harga;
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
    S.game.konsol[km.id] = { id: km.id, nama: km.nama, merek: km.merek, hargaBeli: km.harga, dibeli: S.hari, pakai: 0, bekas: false, kondisi: 'Baru Resmi', ketKondisi: 'Baru bersegel garansi resmi Sony Indonesia', tahun: km.tahun[0], kelengkapan: km.kelengkapan };
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
  function kameraHp(S) { return punya(S, 'hp3') ? 1.6 : punya(S, 'hp2') ? 1.3 : 1; }

  /* ---------- ganti hari: sewa kos & stok pasar game bekas ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], r = S.rumah, t = KAL.tgl(nBaru);
    listrikKos(S, 0, false);
    if (!S.game || !S.game.pasar || S.game.pasar.minggu !== Math.floor(nBaru / 7)) acakPasarGame(S);
    if (r.jenis === 'kos' && t.d === r.tempo) {
      if (S.bank.saldo >= r.sewa) { S.bank.saldo -= r.sewa; S.bank.mutasi.unshift({ n: nBaru, ket: 'Sewa kos bulan ini', jml: -r.sewa }); kabar.push('Sewa kos ' + rp(r.sewa) + ' sudah dibayar.'); }
      else { r.tunggakan = (r.tunggakan || 0) + r.sewa; kabar.push('Saldo kurang untuk sewa kos. Ibu kos menagih.'); }
    }
    if (r.kwh < 4) kabar.push('Token listrik ' + tempat(S) + ' tinggal ' + r.kwh.toFixed(1).replace('.', ',') + ' kWh.');
    return kabar;
  }
  /* pemain sedang melayani: stamina rendah membuat lambat dan kurang ramah */
  function ramah(S) { var d = S.diri; return d ? 4.4 - (d.stamina < 25 ? 1.2 : 0) - (d.kenyang < 15 || d.minum < 15 ? 0.5 : 0) : 4.4; }
  function lambat(S) { var d = S.diri; return d && (d.stamina < 20 || d.melek < 15) ? 2 : 1; }

  g.KK_DIRI = { beli: beli, hargaItem: hargaItem, hargaGofood: hargaGofood, siapkan: siapkan, jalan: jalan, makan: makan, cekKiriman: cekKiriman, istirahat: istirahat, tidur: tidur,
    beliBarang: beliBarang, infoUmurBarang: infoUmurBarang, nilaiJualBarang: nilaiJualBarang, jualBarang: jualBarang,
    konsolModel: konsolModel, gameModel: gameModel, punyaKonsol: punyaKonsol, adaKonsol: adaKonsol, bisaMainGame: bisaMainGame,
    beliKonsol: beliKonsol, nilaiJualKonsol: nilaiJualKonsol, jualKonsol: jualKonsol, beliGame: beliGame, nilaiJualGame: nilaiJualGame, jualGame: jualGame,
    beliTokenKos: beliTokenKos, punya: punya, tempat: tempat, adaAc: adaAc, barang: barang, kameraHp: kameraHp, gantiHari: gantiHari, ramah: ramah, lambat: lambat, kota: kota };
})(window);
