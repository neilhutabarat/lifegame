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
    return S;
  }
  function punya(S, id) { if (id === 'tv') return !!(S.rumah.barang.tv || S.rumah.barang.tv55); return !!S.rumah.barang[id]; }
  function tempat(S) { return S.rumah.jenis === 'rumah' ? 'rumah' : 'kos'; }
  function adaAc(S) { return S.rumah.jenis !== 'rumah' || punya(S, 'ac'); }
  function barang(id) { return N.barangRumah.filter(function (b) { return b.id === id; })[0]; }

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
      d.kenyang = batas(d.kenyang + 60 + (punya(S, 'mejamakan') ? 10 : 0) + (punya(S, 'kompor') ? 5 : 0));
      return { ok: true, menit: 40, teks: 'Masak nasi dan telur di ' + tempat(S) + ', sekitar Rp7.000.' };
    }
    if (jenis === 'air') {
      if (d.posisi === 'kos') { if (!punya(S, 'dispenser') && !bayarTunai(S, 4000)) return 'Uang di laci tidak cukup.'; }
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
  function istirahat(S, jenis) {
    var d = S.diri;
    if (d.posisi !== 'kos') return 'Pulang dulu.';
    if (jenis === 'ps' && !(punya(S, 'ps5') || punya(S, 'ps5disc'))) return 'Belum punya PS5.';
    if (jenis === 'tv' && !punya(S, 'tv')) return 'Belum punya TV.';
    if (S.rumah.padam && jenis !== 'tidurSiang') return 'Listrik ' + tempat(S) + ' padam. Beli token dulu.';
    var besar = punya(S, 'tv55') ? 4 : 0;
    var naik = jenis === 'ps' ? (S.rumah.barang.kaset ? 22 : 16) + besar : jenis === 'tv' ? 14 + besar : 20;
    d.stamina = batas(d.stamina + naik);
    if (jenis === 'tidurSiang') d.melek = batas(d.melek + 25);
    else d.melek = batas(d.melek - 3);
    listrikKos(S, 60, jenis === 'tidurSiang', jenis === 'ps' ? 0.26 : jenis === 'tv' ? 0.06 : 0);
    return { ok: true, menit: 60, teks: jenis === 'ps' ? 'Main PS satu jam. Pikiran segar lagi.' : jenis === 'tv' ? 'Nonton TV satu jam.' : 'Tidur siang satu jam.' };
  }
  /* tidur malam: dari jam sekarang sampai jam bangun besok. Mengembalikan menit tidur */
  function tidur(S, menitSekarang, bangun) {
    var d = S.diri, lama = Math.max(60, (S.menit < 1440 ? 1440 - S.menit : -(S.menit - 1440)) + bangun), jam = lama / 60;
    var ac = !S.rumah.padam && adaAc(S);
    listrikKos(S, lama, true);
    var mutu = (ac && !S.rumah.padam ? 1 : punya(S, 'kipas') && !S.rumah.padam ? 0.85 : 0.7) * (punya(S, 'springbed') ? 1.1 : S.rumah.jenis === 'rumah' ? 0.9 : 1);
    d.melek = batas(d.melek + jam * 14 * mutu);
    d.stamina = batas(d.stamina + jam * 11 * mutu);
    d.kenyang = batas(d.kenyang - jam * 2); d.minum = batas(d.minum - jam * 3);
    return { jam: jam, ac: ac, mutu: mutu };
  }

  /* ---------- isi kos ---------- */
  function beliBarang(S, id) {
    var b = barang(id);
    if (punya(S, id) && !b.banyak) return 'Sudah punya ' + b.nama + '.';
    if (b.rumah && S.rumah.jenis !== 'rumah') return b.nama + ' tidak muat di kamar kos. Butuh rumah sendiri.';
    if (b.butuh && !punya(S, b.butuh)) return b.nama + ' butuh ' + barang(b.butuh).nama + ' dulu.';
    if (S.bank.saldo < b.harga) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= b.harga; S.bank.mutasi.unshift({ n: S.hari, ket: 'Beli ' + b.nama + ' (' + b.merek + ')', jml: -b.harga });
    S.rumah.barang[id] = b.banyak ? (S.rumah.barang[id] || 0) + 1 : true;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + b.harga;
    return true;
  }
  function kameraHp(S) { return punya(S, 'hp3') ? 1.6 : punya(S, 'hp2') ? 1.3 : 1; }

  /* ---------- ganti hari: sewa kos ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], r = S.rumah, t = KAL.tgl(nBaru);
    listrikKos(S, 0, false);
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

  g.KK_DIRI = { beli: beli, hargaItem: hargaItem, hargaGofood: hargaGofood, siapkan: siapkan, jalan: jalan, makan: makan, cekKiriman: cekKiriman, istirahat: istirahat, tidur: tidur, beliBarang: beliBarang, beliTokenKos: beliTokenKos,
    punya: punya, tempat: tempat, adaAc: adaAc, barang: barang, kameraHp: kameraHp, gantiHari: gantiHari, ramah: ramah, lambat: lambat, kota: kota };
})(window);
