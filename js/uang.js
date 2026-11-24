/* uang.js — laci kas (pecahan kecil dan besar), saldo merchant QRIS, rekening bank, pajak, NIB, dan KUR.
   Aturan dari rancangan bagian "Pembayaran: tunai, QRIS, bank". Angka bertanda "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL;
  var MODAL_BANK = 5000000, MODAL_RECEH = 300000;   /* setelan: modal kerja awal */
  var BATAS_TUKAR_RECEH = 200000;                    /* setelan: tukar ke pecahan kecil di warung/minimarket per hari */

  function bankIni(S) { return N.bank.filter(function (b) { return b.id === S.bank.id; })[0] || N.bank[0]; }
  function qrisIni(S) { return N.qris.filter(function (q) { return q.id === S.qris; })[0] || N.qris[0]; }
  function qrisData(id) { return N.qris.filter(function (q) { return q.id === id; })[0]; }
  /* QRIS bisa dipasang sampai 3 sekaligus; tiap penyedia punya saldo dan aturan tarik sendiri */
  function migrasi(S) {
    if (!S.merchants) { S.merchants = {}; if (S.qris) S.merchants[S.qris] = S.merchant || { tersedia: 0, menunggu: [], tarikBulanIni: 0 }; }
    if (S.qris && !Object.keys(S.merchants).length) S.merchants[S.qris] = { tersedia: 0, menunggu: [], tarikBulanIni: 0 };
    delete S.merchant;
    if (S.bank) { S.bank.transferBulanIni = S.bank.transferBulanIni || 0; S.bank.tarikHariIni = S.bank.tarikHariIni || 0; }
    return S;
  }
  function qrisAktif(S) { return Object.keys(S.merchants).filter(function (id) { var m = S.merchants[id]; return !m.aktifPada || S.hari >= m.aktifPada; }); }
  function tersedia(S) { var t = 0; for (var id in S.merchants) t += S.merchants[id].tersedia; return t; }
  /* bayar dari salah satu saldo QRIS yang cukup (satu pembayaran tidak bisa digabung dari dua aplikasi) */
  function bayarQris(S, jml) {
    var ids = Object.keys(S.merchants).sort(function (a, b) { return S.merchants[b].tersedia - S.merchants[a].tersedia; });
    for (var i = 0; i < ids.length; i++) if (S.merchants[ids[i]].tersedia >= jml) { S.merchants[ids[i]].tersedia -= jml; return qrisData(ids[i]); }
    return null;
  }
  function pasangQris(S, id) {
    if (S.merchants[id]) return 'QRIS ' + qrisData(id).nama + ' sudah terpasang.';
    S.merchants[id] = { tersedia: 0, menunggu: [], tarikBulanIni: 0, aktifPada: S.hari + 1 };
    return true;
  }
  function biayaTransfer(S) { var b = bankIni(S); return b.gratisTransfer && S.bank.transferBulanIni < b.gratisTransfer ? 0 : N.biFast; }
  function catatTransfer(S) { S.bank.transferBulanIni = (S.bank.transferBulanIni || 0) + 1; }
  function hariKerja(n) { var d = KAL.tgl(n).dow; return d !== 0 && d !== 6 && !KAL.apakahLibur(n); }

  function catat(S, ket, jml, n) {
    S.bank.mutasi.unshift({ n: n == null ? S.hari : n, ket: ket, jml: jml });
    if (S.bank.mutasi.length > 40) S.bank.mutasi.length = 40;
  }

  /* isi awal; juga melengkapi simpanan tahap 2 */
  function siapkan(S, bankId) {
    var lamaLaci = S.uang && typeof S.uang.laci === 'number' ? S.uang.laci : 0;
    var lamaMerchant = S.uang && typeof S.uang.merchant === 'number' ? S.uang.merchant : 0;
    if (!S.uang || typeof S.uang.kecil !== 'number') S.uang = { kecil: MODAL_RECEH, besar: lamaLaci, tukarHariIni: 0 };
    if (!S.merchants) { S.merchants = {}; S.merchants[S.qris || 'gopay'] = S.merchant || { tersedia: lamaMerchant, menunggu: [], tarikBulanIni: 0 }; delete S.merchant; }
    if (!S.bank) { S.bank = { id: bankId, saldo: 0, mutasi: [], transferBulanIni: 0, tarikHariIni: 0 }; S.bank.saldo = MODAL_BANK; catat(S, 'Saldo awal (modal kerja)', MODAL_BANK); }
    S.pajak = S.pajak || { tagihan: [], omzetBulan: 0 };
    S.nib = S.nib || null;
    S.kur = S.kur || { status: 'tidak' };
    S.kreditBuruk = S.kreditBuruk || false;
    return S;
  }

  /* ---------- tunai dan kembalian ---------- */
  /* uang kecil = pecahan sampai Rp20.000; uang besar = Rp50.000 dan Rp100.000 */
  function pilihUang(harga) {
    var calon = [[harga, 40], [10000, 30], [20000, 18], [50000, 9], [100000, 3]].filter(function (x, i) { return i === 0 || x[0] > harga; });
    var total = calon.reduce(function (t, x) { return t + x[1]; }, 0), r = Math.random() * total;
    for (var i = 0; i < calon.length; i++) { r -= calon[i][1]; if (r <= 0) return calon[i][0]; }
    return harga;
  }
  /* hasil: { ok, uang, kembalian } — ok false berarti kembalian tidak cukup */
  function bayarTunai(S, harga) {
    var uang = pilihUang(harga), kembali = uang - harga, u = S.uang;
    var dariBesar = Math.min(Math.floor(kembali / 50000) * 50000, Math.floor(u.besar / 50000) * 50000), dariKecil = kembali - dariBesar;
    if (dariKecil > u.kecil) return { ok: false, uang: uang, kembalian: kembali };
    u.besar -= dariBesar; u.kecil -= dariKecil;
    if (uang >= 50000) u.besar += uang; else u.kecil += uang;
    return { ok: true, uang: uang, kembalian: kembali };
  }
  /* pembeli memindai salah satu stiker QRIS yang terpasang */
  function terimaQris(S, bersih) {
    var a = qrisAktif(S), id = a[Math.floor(Math.random() * a.length)] || Object.keys(S.merchants)[0];
    S.merchants[id].menunggu.push({ n: S.hari, jml: bersih });
  }
  function laci(S) { return S.uang.kecil + S.uang.besar; }
  function saldoMerchant(m) { return m.tersedia + m.menunggu.reduce(function (t, x) { return t + x.jml; }, 0); }
  function merchantTotal(S) { var t = 0; for (var id in S.merchants) t += saldoMerchant(S.merchants[id]); return t; }

  /* ---------- aksi pemain (jawab: teks hasil, atau Error dengan alasan) ---------- */
  function bolehKeAtm(S) { return S.fase !== 'buka'; }
  function setor(S, jml) {
    var b = bankIni(S), T = b.tunai, tempat = T ? T.tempat : 'ATM';
    if (!bolehKeAtm(S)) return 'Kedai sedang buka. Setor tunai di ' + tempat + ' saat kedai belum buka atau sudah tutup.';
    jml = Math.min(jml, S.uang.besar + S.uang.kecil);
    if (T) { jml = Math.min(jml, T.maks); if (jml < T.min) return 'Setor di ' + tempat + ' minimal ' + rp(T.min) + '.'; if (S.bank.saldo + jml < T.biaya) return 'Saldo tidak cukup untuk biaya ' + rp(T.biaya) + '.'; }
    if (jml <= 0) return 'Laci kosong.';
    var dariBesar = Math.min(jml, S.uang.besar); S.uang.besar -= dariBesar; S.uang.kecil -= jml - dariBesar;
    S.bank.saldo += jml; catat(S, 'Setor tunai ' + tempat, jml);
    if (T) { S.bank.saldo -= T.biaya; catat(S, 'Biaya setor tunai ' + tempat, -T.biaya); }
    return true;
  }
  function tarik(S, jml) {
    var b = bankIni(S), T = b.tunai, tempat = T ? T.tempat : 'ATM';
    if (!bolehKeAtm(S)) return 'Kedai sedang buka. Tarik tunai di ' + tempat + ' saat kedai belum buka atau sudah tutup.';
    if (T) {
      if (jml > T.maks) return 'Tarik di ' + tempat + ' paling banyak ' + rp(T.maks) + ' sekali.';
      if (S.bank.tarikHariIni + jml > T.tarikHarian) return 'Batas tarik tunai ' + rp(T.tarikHarian) + ' sehari sudah tercapai.';
    }
    var biaya = T ? T.biaya : 0;
    if (S.bank.saldo < jml + biaya) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= jml + biaya; S.uang.besar += jml; S.bank.tarikHariIni += jml; catat(S, 'Tarik tunai ' + tempat + (biaya ? ' (biaya ' + rp(biaya) + ')' : ''), -(jml + biaya));
    return true;
  }
  function tukarReceh(S, jml) {
    if (!bolehKeAtm(S)) return 'Kedai sedang buka. Tukar uang kecil saat kedai belum buka atau sudah tutup.';
    var sisa = BATAS_TUKAR_RECEH - S.uang.tukarHariIni;
    if (sisa <= 0) return 'Warung dan minimarket sekitar hanya bisa menukar ' + BATAS_TUKAR_RECEH.toLocaleString('id-ID') + ' sehari.';
    jml = Math.min(jml, sisa, Math.floor(S.uang.besar / 50000) * 50000);
    if (jml <= 0) return 'Tidak ada uang Rp50.000 atau Rp100.000 di laci untuk ditukar.';
    S.uang.besar -= jml; S.uang.kecil += jml; S.uang.tukarHariIni += jml;
    return true;
  }
  function tarikMerchant(S, id) {
    id = id || S.qris;
    var q = qrisData(id), m = S.merchants[id]; if (!m) return 'QRIS belum terpasang.';
    var jml = m.tersedia;
    if (jml <= 0) return 'Belum ada saldo yang bisa ditarik. Uang QRIS hari ini cair besok hari kerja.';
    var biaya = m.tarikBulanIni >= q.gratis ? q.biayaLebih : 0;
    if (jml <= biaya) return 'Saldo terlalu kecil untuk biaya transfer.';
    m.tersedia = 0; m.tarikBulanIni++;
    S.bank.saldo += jml - biaya; catat(S, 'Transfer dari ' + q.app + (biaya ? ' (biaya ' + biaya.toLocaleString('id-ID') + ')' : ''), jml - biaya);
    return true;
  }
  function bayarPajak(S, i) {
    var t = S.pajak.tagihan[i]; if (!t || t.dibayar) return 'Tagihan tidak ditemukan.';
    var total = t.jml + t.denda;
    if (S.bank.saldo < total) return 'Saldo rekening tidak cukup untuk membayar pajak.';
    S.bank.saldo -= total; t.dibayar = true; catat(S, 'Setor PPh final ' + t.bulan, -total);
    return true;
  }
  function daftarNib(S) {
    if (S.nib) return 'NIB sudah terbit.';
    S.nib = { nomor: String(9120000000000 + Math.floor(Math.random() * 999999999)), n: S.hari };
    return true;
  }

  /* ---------- KUR ---------- */
  function angsuran(plafon, tenor) { var r = N.kur.bunga / 12; return Math.round(plafon * r / (1 - Math.pow(1 + r, -tenor))); }
  /* setelan: bank menyetujui kalau angsuran tidak lebih dari separuh rata-rata laba kotor sebulan */
  function labaBulanan(S) {
    var r = S.riwayat.slice(-30); if (!r.length) return 0;
    return r.reduce(function (t, x) { return t + x.laba; }, 0) / r.length * 30;
  }
  function syaratKur(S) {
    return [
      { ok: S.hariKe >= N.kur.syaratHari, teks: 'Usaha berjalan 6 bulan (sekarang hari ke-' + S.hariKe + ')' },
      { ok: !!S.nib, teks: 'Punya NIB dari OSS' },
      { ok: !S.kreditBuruk, teks: 'Tidak ada riwayat telat bayar cicilan' },
      { ok: S.kur.status !== 'aktif' && S.kur.status !== 'menunggu', teks: 'Tidak sedang punya KUR berjalan' }
    ];
  }
  function ajukanKur(S, plafon, tenor) {
    if (!syaratKur(S).every(function (x) { return x.ok; })) return 'Syarat KUR belum terpenuhi.';
    var a = angsuran(plafon, tenor), batas = labaBulanan(S) / 2;
    if (a > batas) return 'Ditolak: angsuran ' + a.toLocaleString('id-ID') + ' sebulan terlalu besar dibanding laba kedai. Coba plafon lebih kecil atau tenor lebih panjang.';
    S.kur = { status: 'menunggu', plafon: plafon, tenor: tenor, angsuran: a, siapPada: S.hari + N.kur.hariProses };
    return true;
  }

  /* ---------- pergantian hari: pencairan, akhir bulan, cicilan ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru), b = bankIni(S);
    S.uang.tukarHariIni = 0; S.bank.tarikHariIni = 0;
    /* QRIS cair ke saldo tersedia pada hari kerja berikutnya */
    var adaMenunggu = false;
    Object.keys(S.merchants).forEach(function (id) {
      var m = S.merchants[id], q = qrisData(id);
      if (m.aktifPada && nBaru === m.aktifPada) kabar.push('QRIS ' + q.nama + ' sudah aktif. Stikernya dipasang di kedai.');
      if (!hariKerja(nBaru)) { if (m.menunggu.length) adaMenunggu = true; return; }
      var cair = 0;
      m.menunggu = m.menunggu.filter(function (x) { if (x.n < nBaru) { cair += x.jml; return false; } return true; });
      if (cair) { m.tersedia += cair; kabar.push('Uang QRIS ' + rp(cair) + ' sudah cair di ' + q.app + '. Tarik ke rekening lewat HP.'); }
    });
    if (adaMenunggu) kabar.push('Hari ini libur bank. Uang QRIS cair di hari kerja berikutnya.');
    /* akhir bulan */
    if (tB.m !== tL.m) {
      var adm = Math.min(S.bank.saldo, b.admin);
      if (adm > 0) { S.bank.saldo -= adm; catat(S, 'Biaya administrasi bulanan', -adm, nLama); kabar.push('Biaya admin ' + b.nama + ' ' + rp(adm) + ' dipotong dari rekening.'); }
      for (var mid in S.merchants) S.merchants[mid].tarikBulanIni = 0;
      S.bank.transferBulanIni = 0;
      /* pajak bulan lalu */
      var p = N.pajak, ob = S.pajak.omzetBulan, sebelum = S.omzetTahun - ob;
      var kena = Math.max(0, S.omzetTahun - Math.max(p.bebas, sebelum)), pjk = Math.round(kena * p.tarif);
      var namaBln = N.namaBulan[tL.m - 1];
      if (pjk > 0) { S.pajak.tagihan.push({ bulan: namaBln, jml: pjk, denda: 0, jatuhTempo: KAL.dn(tB.y, tB.m, p.jatuhTempo), dibayar: false }); kabar.push('PPh final ' + namaBln + ' ' + rp(pjk) + ', setor paling lambat tanggal ' + p.jatuhTempo + '.'); }
      S.pajak.omzetBulan = 0;
      S.pajak.tagihan.forEach(function (t) { if (!t.dibayar && nBaru > t.jatuhTempo) { t.denda += Math.round(t.jml * p.dendaPerBulan); } });
    }
    S.pajak.tagihan.forEach(function (t) { if (!t.dibayar && nBaru === t.jatuhTempo + 1) kabar.push('PPh final ' + t.bulan + ' lewat jatuh tempo. Denda berjalan tiap bulan.'); });
    /* KUR */
    var k = S.kur;
    if (k.status === 'menunggu' && nBaru >= k.siapPada) {
      k.status = 'aktif'; k.sisa = k.tenor; k.tempo = Math.min(28, tB.d); k.tunggakan = 0;
      S.bank.saldo += k.plafon; catat(S, 'Pencairan KUR', k.plafon, nBaru);
      kabar.push('KUR ' + rp(k.plafon) + ' disetujui dan cair ke rekening. Angsuran ' + rp(k.angsuran) + ' tiap tanggal ' + k.tempo + '.');
    } else if (k.status === 'aktif') {
      if (tB.d === k.tempo && k.sisa > 0) { k.tunggakan += k.angsuran; k.sisa--; }
      if (k.tunggakan > 0) {
        var bayar = Math.min(k.tunggakan, S.bank.saldo);
        if (bayar > 0) { S.bank.saldo -= bayar; k.tunggakan -= bayar; catat(S, 'Angsuran KUR', -bayar, nBaru); }
        if (k.tunggakan > 0 && tB.d === k.tempo) { S.kreditBuruk = true; kabar.push('Saldo kurang untuk angsuran KUR. Tunggakan ' + rp(k.tunggakan) + ' tercatat di riwayat kredit.'); }
        else if (bayar > 0) kabar.push('Angsuran KUR ' + rp(bayar) + ' dipotong dari rekening.');
      }
      if (k.sisa === 0 && k.tunggakan === 0) { k.status = 'lunas'; kabar.push('KUR lunas.'); }
    }
    return kabar;
  }
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }

  g.KK_UANG = { siapkan: siapkan, migrasi: migrasi, qrisData: qrisData, qrisAktif: qrisAktif, tersedia: tersedia, bayarQris: bayarQris, pasangQris: pasangQris,
    biayaTransfer: biayaTransfer, catatTransfer: catatTransfer, saldoMerchant: saldoMerchant, bayarTunai: bayarTunai, terimaQris: terimaQris, laci: laci, merchantTotal: merchantTotal,
    setor: setor, tarik: tarik, tukarReceh: tukarReceh, tarikMerchant: tarikMerchant, bayarPajak: bayarPajak, daftarNib: daftarNib,
    angsuran: angsuran, syaratKur: syaratKur, ajukanKur: ajukanKur, gantiHari: gantiHari, bankIni: bankIni, qrisIni: qrisIni,
    hariKerja: hariKerja, BATAS_TUKAR_RECEH: BATAS_TUKAR_RECEH };
})(window);
