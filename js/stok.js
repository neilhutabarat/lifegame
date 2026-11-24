/* stok.js — stok bahan, belanja ke empat tempat, harga yang bergerak, kiriman, dan stok rusak.
   Rancangan bagian "Bahan & harga pemasok". Angka bertanda "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var M = g.KK_MENU, N = g.KK_NYATA, KAL = g.KK_KAL;
  /* setelan tempat belanja */
  var TEMPAT = {
    pasar: { nama: 'Pasar', kali: 0.95, bayar: ['tunai'], ongkos: 20000, ongkosNama: 'Ojek pulang-pergi', makanWaktu: 60,
      kaliSore: 1.03, namaSore: 'Swalayan',
      ket: 'Paling murah, bayar tunai. Harus dijemput: naik ojek pulang-pergi sekitar 1 jam, atau pakai kendaraan sendiri. Pasar buka sampai pukul 12.00; setelah itu belanja ke swalayan, sekitar 8% lebih mahal.' },
    grosir: { nama: 'Grosir', kali: 1.05, bayar: ['tunai', 'qris', 'transfer'], ongkos: 10000, ongkosNama: 'Ongkir antar', antarMenit: 120,
      ket: 'Toko grosir, pangkalan gas, dan depot air sekitar. Sedikit lebih mahal, diantar sekitar 2 jam.' },
    online: { nama: 'Online', kali: 0.9, bayar: ['qris', 'transfer', 'kk'], ongkos: 15000, ongkosNama: 'Ongkir', antarHari: [2, 3],
      ket: 'Shopee dan Tokopedia. Harga promo, sampai 2–3 hari. Bisa bayar pakai QRIS, transfer, atau kartu kredit.' },
    sales: { nama: 'Sales', kali: 1, bayar: ['tempo'], ongkos: 0, minimal: 300000, tempoHari: 14, denda: 0.05,
      ket: 'Sales distributor mampir Senin dan Kamis pukul 10.00–12.00. Bayar belakangan 14 hari, minimal pesanan Rp300.000.' }
  };
  var MELELEH_PER_JAM = 0.02;    /* setelan tahap 10: es di cool box */
  var UHT_TAHAN_HARI = 3;        /* susu UHT setelah dibuka, di kulkas */
  var STOK_AWAL = { kopi: 1000, uht: 6000, skm: 1960, gula: 2000, aren: 1000, cokelat: 1000, teh: 1000, es: 10000, cupPlastik: 100, cupKertas: 50, gas: 3000, galon: 19000, kentang: 1500, tahu: 20, mie: 20, sosisTelur: 15, wadahMakan: 50 }; /* setelan */

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function bulat500(n) { return Math.round(n / 500) * 500; }

  function siapkan(S) {
    if (S.stok) {
      M.URUT_BARANG.forEach(function (id) {
        if (!S.stok[id]) {
          var b = M.BARANG[id], jml = STOK_AWAL[id] || 0;
          S.stok[id] = { jml: jml, nilai: jml * b.harga / b.isi };
          S.faktor[id] = 1;
        }
      });
      return S;
    }
    S.stok = {}; S.faktor = {};
    M.URUT_BARANG.forEach(function (id) {
      var b = M.BARANG[id], jml = STOK_AWAL[id] || 0;
      S.stok[id] = { jml: jml, nilai: jml * b.harga / b.isi };
      S.faktor[id] = 1;
    });
    S.uhtBuka = { sisa: 0, hari: S.hari };
    S.kiriman = []; S.tagihanSales = []; S.belanjaTerakhir = {}; S.beritaKopi = 0;
    return S;
  }

  /* ---------- harga ---------- */
  function jelangLebaran(S) {
    var l = KAL.lebaranTahun(KAL.tgl(S.hari).y);
    return l != null && S.hari >= l - 14 && S.hari <= l + 3;
  }
  function sore(S) { var m = S.menit % 1440; return m >= 720 || m < 300; }
  function namaTempat(S, tempat) { return tempat === 'pasar' && sore(S) ? TEMPAT.pasar.namaSore : TEMPAT[tempat].nama; }
  function harga(S, id, tempat) {
    var b = M.BARANG[id], f = b.tetap ? 1 : S.faktor[id];
    if (jelangLebaran(S) && (id === 'gula' || id === 'uht' || id === 'skm' || id === 'aren')) f *= 1.08;
    return bulat500(b.harga * f * (b.tetap ? 1 : tempat === 'pasar' && sore(S) ? TEMPAT.pasar.kaliSore : TEMPAT[tempat].kali));
  }
  /* harga minggu ini dibanding harga awal, untuk ditampilkan */
  function perubahan(S, id) { return Math.round((S.faktor[id] - 1) * 100); }

  /* ---------- stok ---------- */
  function ada(S, id, jml) { return S.stok[id].jml >= jml; }
  function ambil(S, id, jml) {
    var s = S.stok[id]; if (s.jml <= 0) return 0;
    var biaya = s.nilai / s.jml * jml; s.jml -= jml; s.nilai -= biaya;
    if (s.jml < 0.0001) { s.jml = 0; s.nilai = 0; }
    return biaya;
  }
  function tambah(S, id, jml, nilai) { S.stok[id].jml += jml; S.stok[id].nilai += nilai; }

  /* satu tap bahan saat racik. Hasil: { ok, biaya, operasional, habis: nama barang } */
  function pakaiBahan(S, bahan, jml) {
    if (bahan === 'air') {
      if (!ada(S, 'galon', M.AIR_PANAS.galon)) return { ok: false, habis: 'Air galon' };
      if (!ada(S, 'gas', M.AIR_PANAS.gas)) return { ok: false, habis: 'Gas LPG' };
      return { ok: true, biaya: 0, operasional: ambil(S, 'galon', M.AIR_PANAS.galon) + ambil(S, 'gas', M.AIR_PANAS.gas) };
    }
    var butuh = M.TAP_STOK[bahan] != null ? M.TAP_STOK[bahan] * jml : jml;
    var asal = bahan; bahan = M.BAHAN[bahan].stok || bahan;
    if (!ada(S, bahan, butuh)) return { ok: false, habis: M.BAHAN[asal].nama };
    if (bahan === 'uht') {
      /* buka kotak baru kalau susu yang terbuka kurang */
      if (S.uhtBuka.sisa < butuh) { S.uhtBuka.sisa = Math.min(S.stok.uht.jml, S.uhtBuka.sisa + 1000); S.uhtBuka.hari = S.hari; }
      S.uhtBuka.sisa = Math.max(0, S.uhtBuka.sisa - butuh);
    }
    return { ok: true, biaya: ambil(S, bahan, butuh), operasional: 0 };
  }
  /* bahan resep untuk n gelas: { idStok: jumlah }. panas (opsional) menyesuaikan cup & es/air */
  function daftarResep(menu, panas) {
    return (panas != null && M.resepSuhu) ? M.resepSuhu(menu, panas) : menu.resep;
  }
  function butuhResep(menu, n, panas) {
    var b = {};
    daftarResep(menu, panas).forEach(function (r) {
      if (r[0] === 'air') { b.galon = (b.galon || 0) + M.AIR_PANAS.galon * n; b.gas = (b.gas || 0) + M.AIR_PANAS.gas * n; return; }
      var id = M.BAHAN[r[0]].stok || r[0];
      b[id] = (b[id] || 0) + (M.TAP_STOK[r[0]] != null ? M.TAP_STOK[r[0]] * r[1] : r[1]) * n;
    });
    return b;
  }
  /* nama barang yang kurang, atau null kalau cukup */
  function kurangResep(S, menu, n, panas) { var b = butuhResep(menu, n, panas); for (var id in b) if (!ada(S, id, b[id])) return M.BARANG[id].nama; return null; }
  function pakaiResep(S, menu, n, panas) {
    var hasil = { biaya: 0, operasional: 0 }, rsp = daftarResep(menu, panas);
    for (var i = 0; i < n; i++) rsp.forEach(function (r) { var x = pakaiBahan(S, r[0], r[1]); hasil.biaya += x.biaya || 0; hasil.operasional += x.operasional || 0; });
    return hasil;
  }
  function sisaTeks(S, id) {
    var s = S.stok[id].jml, b = M.BARANG[id];
    if (b.satuan === 'buah') return Math.floor(s) + ' buah';
    if (s >= 1000) return (s / 1000).toFixed(s >= 10000 ? 0 : 1).replace('.', ',') + (b.satuan === 'g' ? ' kg' : ' L');
    return Math.floor(s) + ' ' + b.satuan;
  }
  /* bahan racik -> barang stok */
  function barangDari(bahan) { return bahan === 'air' ? 'galon' : (M.BAHAN[bahan] && M.BAHAN[bahan].stok) || bahan; }
  /* cukup untuk berapa gelas lagi (perkiraan kasar dari takaran resep terbesar) */
  function menipis(S) {
    var hasil = [];
    var batas = { kopi: 150, uht: 1500, skm: 250, gula: 200, aren: 150, cokelat: 150, teh: 30, es: 2000, cupPlastik: 10, cupKertas: 6, gas: 300, galon: 1500, kentang: 300, tahu: 4, mie: 4, sosisTelur: 3, wadahMakan: 8 };
    M.URUT_BARANG.forEach(function (id) { if (S.stok[id].jml < batas[id]) hasil.push(id); });
    return hasil;
  }

  /* ---------- belanja ---------- */
  /* keranjang: { id: jumlah kemasan }. bayar: tunai | qris | transfer | tempo */
  function hitung(S, tempat, keranjang, siapa) {
    var t = TEMPAT[tempat], sub = 0, isi = 0;
    for (var id in keranjang) if (keranjang[id] > 0) { sub += harga(S, id, tempat) * keranjang[id]; isi++; }
    var ongkos = isi ? t.ongkos : 0;
    if (tempat === 'pasar' && siapa !== 'karyawan' && ((g.KK_MOTOR && g.KK_MOTOR.punya(S)) || (g.KK_MOBIL && g.KK_MOBIL.punya(S)))) ongkos = 0; /* pakai motor sendiri: bayar bensin, bukan ojek */
    return { sub: sub, ongkos: ongkos, total: sub + ongkos };
  }
  function salesMampir(S) {
    var d = KAL.tgl(S.hari).dow;
    return (d === 1 || d === 4) && S.menit >= 600 && S.menit < 720 && !KAL.apakahLibur(S.hari);
  }
  /* siapa: 'sendiri' atau 'karyawan' (khusus pasar). Saat kedai buka, pergi sendiri berarti kedai tutup sebentar */
  function beli(S, tempat, keranjang, bayar, siapa) {
    var t = TEMPAT[tempat], h = hitung(S, tempat, keranjang, siapa), U = g.KK_UANG;
    if (!h.sub) return 'Keranjang masih kosong.';
    if (t.bayar.indexOf(bayar) < 0) return 'Cara bayar ini tidak bisa di ' + t.nama + '.';
    var perjalanan = null;
    if (tempat === 'pasar' && siapa === 'karyawan') perjalanan = 'karyawan';
    else if (tempat === 'pasar') {
      if (S.ojek && S.ojek.online) return 'Sedang narik ojol. Berhenti narik dulu.';
      if (g.KK_MOTOR && g.KK_MOTOR.punya(S)) { if (!g.KK_MOTOR.cukup(S, 6)) return 'Bensin motor tidak cukup ke pasar. Isi bensin dulu.'; perjalanan = g.KK_MOTOR; }
      else if (g.KK_MOBIL && g.KK_MOBIL.punya(S)) { if (!g.KK_MOBIL.cukup(S, 6)) return 'Bensin mobil tidak cukup ke pasar. Isi bensin dulu.'; perjalanan = g.KK_MOBIL; }
    }
    if (tempat === 'sales') {
      if (!salesMampir(S)) return 'Sales tidak sedang di kedai. Sales mampir Senin dan Kamis pukul 10.00–12.00.';
      if (S.tagihanSales.some(function (x) { return !x.dibayar && S.hari > x.jatuhTempo; })) return 'Sales menolak pesanan baru sampai tagihan lama dibayar.';
      if (h.sub < t.minimal) return 'Minimal pesanan ke sales ' + rp(t.minimal) + '.';
    }
    /* bayar */
    if (bayar === 'tunai') {
      if (U.laci(S) < h.total) return 'Uang di laci tidak cukup.';
      var dariBesar = Math.min(S.uang.besar, Math.floor(h.total / 50000) * 50000), sisa = h.total - dariBesar;
      if (sisa > S.uang.kecil) { dariBesar = Math.min(S.uang.besar, h.total); sisa = h.total - dariBesar; }
      S.uang.besar -= dariBesar; S.uang.kecil -= sisa;
    } else if (bayar === 'qris') {
      if (!U.bayarQris(S, h.total)) return 'Tidak ada saldo QRIS yang cukup untuk ' + rp(h.total) + '. Satu pembayaran tidak bisa digabung dari dua aplikasi.';
    } else if (bayar === 'transfer') {
      var bf = U.biayaTransfer(S), total = h.total + bf;
      if (S.bank.saldo < total) return 'Saldo rekening tidak cukup.';
      S.bank.saldo -= total; U.catatTransfer(S);
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Belanja ' + namaTempat(S, tempat) + (bf ? ' (termasuk BI-FAST)' : ' (transfer gratis)'), jml: -total });
    } else if (bayar === 'kk') {
      var errKk = U.pakaiKk(S, h.total, 'Tokopedia/Shopee: Belanja bahan kedai');
      if (errKk !== true) return errKk;
    } else if (bayar === 'tempo') {
      S.tagihanSales.push({ jml: h.total, jatuhTempo: S.hari + t.tempoHari, dibayar: false, denda: 0 });
    }
    S.hariIni.belanja = (S.hariIni.belanja || 0) + (bayar === 'tempo' ? 0 : h.total);
    /* barang datang */
    var barang = [];
    for (var id in keranjang) if (keranjang[id] > 0) barang.push({ id: id, n: keranjang[id], harga: harga(S, id, tempat) });
    S.belanjaTerakhir[tempat] = JSON.parse(JSON.stringify(keranjang));
    /* ongkos kirim atau ojek dibagi rata ke nilai stok */
    var bagiOngkos = h.ongkos / barang.length;
    if (tempat === 'pasar' || tempat === 'sales') {
      masukStok(S, barang, bagiOngkos);
      var lama = t.makanWaktu || 0;
      if (perjalanan === 'karyawan') return { ok: true, waktu: lama, karyawan: true };
      if (perjalanan) { var r = perjalanan.jalan(S, 6, 1); lama = 30 + r.menit; }
      return { ok: true, waktu: lama };
    }
    var tiba = tempat === 'grosir' ? { hari: S.hari, menit: S.menit + t.antarMenit } :
      { hari: S.hari + t.antarHari[0] + Math.floor(Math.random() * (t.antarHari[1] - t.antarHari[0] + 1)), menit: 600 + Math.floor(Math.random() * 300) };
    if (tiba.menit >= 1440) { tiba.hari++; tiba.menit -= 1440; }
    S.kiriman.push({ dari: t.nama, barang: barang, ongkos: bagiOngkos, tiba: tiba });
    return { ok: true, tiba: tiba };
  }
  function masukStok(S, barang, bagiOngkos) {
    barang.forEach(function (x) { var b = M.BARANG[x.id]; tambah(S, x.id, b.isi * x.n, x.harga * x.n + (bagiOngkos || 0)); });
  }
  function bayarSales(S, i) {
    var t = S.tagihanSales[i]; if (!t || t.dibayar) return 'Tagihan tidak ditemukan.';
    var bf = g.KK_UANG.biayaTransfer(S), total = t.jml + t.denda + bf;
    if (S.bank.saldo < total) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= total; t.dibayar = true; g.KK_UANG.catatTransfer(S);
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Bayar tagihan sales' + (bf ? ' (termasuk BI-FAST)' : ''), jml: -total });
    return true;
  }

  /* ---------- waktu berjalan: es meleleh, kiriman datang ---------- */
  function jalan(S, dMenit) {
    var kabar = [];
    if (dMenit > 0 && S.stok.es.jml > 0) {
      var leleh = S.stok.es.jml * (g.KK_USAHA && S.usaha && g.KK_USAHA.esTahan(S) ? 0.003 : MELELEH_PER_JAM) * dMenit / 60, biaya = ambil(S, 'es', leleh);
      S.hariIni.rusak = (S.hariIni.rusak || 0) + biaya;
    }
    S.kiriman = S.kiriman.filter(function (k) {
      if (S.hari > k.tiba.hari || (S.hari === k.tiba.hari && S.menit >= k.tiba.menit)) {
        masukStok(S, k.barang, k.ongkos); kabar.push('Kiriman ' + k.dari + ' sampai di kedai.'); return false;
      }
      return true;
    });
    return kabar;
  }

  /* ---------- ganti hari ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tB = KAL.tgl(nBaru);
    /* es di cool box habis mencair semalam */
    if (S.stok.es.jml > 1 && !(g.KK_USAHA && S.usaha && g.KK_USAHA.esTahan(S))) { var e = S.stok.es.jml * 0.7; S.hariIni.rusak = (S.hariIni.rusak || 0) + ambil(S, 'es', e); kabar.push('Es ' + (e / 1000).toFixed(1).replace('.', ',') + ' kg mencair semalam di cool box (sekitar 70%).'); } /* setelan tahap 10 */
    /* susu UHT yang sudah dibuka lewat 3 hari */
    if (S.uhtBuka.sisa > 0 && nBaru - S.uhtBuka.hari >= UHT_TAHAN_HARI) {
      var basi = Math.min(S.uhtBuka.sisa, S.stok.uht.jml); S.hariIni.rusak = (S.hariIni.rusak || 0) + ambil(S, 'uht', basi);
      S.uhtBuka.sisa = 0; kabar.push('Susu UHT yang sudah dibuka ' + UHT_TAHAN_HARI + ' hari basi, ' + Math.round(basi) + ' ml dibuang.');
    }
    /* harga bergerak tiap Senin */
    if (tB.dow === 1) {
      M.URUT_BARANG.forEach(function (id) {
        if (M.BARANG[id].tetap) return;
        var f = S.faktor[id]; f *= 1 + (Math.random() - 0.5) * 0.05; f += (1 - f) * 0.1;
        S.faktor[id] = Math.max(0.85, Math.min(1.3, f));
      });
      if (S.beritaKopi > 0) S.beritaKopi--;
      else if (Math.random() < 0.04) { S.faktor.kopi = Math.min(1.3, S.faktor.kopi * 1.12); S.beritaKopi = 4; kabar.push('Berita: harga kopi dunia naik. Biji kopi di pemasok ikut naik beberapa minggu.'); }
      kabar.push('Harga bahan minggu ini sudah berubah. Cek di aplikasi Belanja.');
    }
    var l = KAL.lebaranTahun(tB.y);
    if (l != null && nBaru === l - 14) kabar.push('Dua minggu menjelang Lebaran: harga gula dan susu naik sekitar 8%.');
    /* tagihan sales */
    S.tagihanSales.forEach(function (t) {
      if (t.dibayar) return;
      if (nBaru === t.jatuhTempo) kabar.push('Tagihan sales ' + rp(t.jml) + ' jatuh tempo hari ini.');
      if (nBaru === t.jatuhTempo + 1 && !t.denda) { t.denda = Math.round(t.jml * TEMPAT.sales.denda); kabar.push('Tagihan sales telat, kena denda ' + rp(t.denda) + '.'); }
    });
    var d = tB.dow;
    if ((d === 1 || d === 4) && !KAL.apakahLibur(nBaru)) kabar.push('Sales distributor mampir hari ini pukul 10.00–12.00.');
    return kabar;
  }

  g.KK_STOK = { TEMPAT: TEMPAT, sore: sore, namaTempat: namaTempat, siapkan: siapkan, harga: harga, perubahan: perubahan, pakaiBahan: pakaiBahan, ambil: ambil, ada: ada,
    sisaTeks: sisaTeks, barangDari: barangDari, kurangResep: kurangResep, pakaiResep: pakaiResep, menipis: menipis, hitung: hitung, beli: beli, bayarSales: bayarSales, salesMampir: salesMampir,
    jalan: jalan, gantiHari: gantiHari, UHT_TAHAN_HARI: UHT_TAHAN_HARI };
})(window);
