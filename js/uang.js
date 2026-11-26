/* uang.js — laci kas (pecahan kecil dan besar), saldo merchant QRIS, rekening bank, pajak, NIB, dan KUR.
   Aturan dari rancangan bagian "Pembayaran: tunai, QRIS, bank". Angka bertanda "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL;
  var MODAL_BANK = 4850000, MODAL_DOMPET = 150000, MODAL_RECEH = 0; /* modal awal total tepat Rp5.000.000 (Rp4.850.000 bank + Rp150.000 dompet tunai) */
  var BATAS_TUKAR_RECEH = 200000;                    /* setelan: tukar ke pecahan kecil di warung/minimarket per hari */

  function bankIni(S) { return N.bank.filter(function (b) { return b.id === S.bank.id; })[0] || N.bank[0]; }
  function qrisIni(S) { return N.qris.filter(function (q) { return q.id === S.qris; })[0] || N.qris[0]; }
  function qrisData(id) { return N.qris.filter(function (q) { return q.id === id; })[0]; }
  /* QRIS bisa dipasang sampai 3 sekaligus; tiap penyedia punya saldo dan aturan tarik sendiri */
  function migrasi(S) {
    if (!S.merchants) { S.merchants = {}; if (S.qris) S.merchants[S.qris] = S.merchant || { tersedia: 0, menunggu: [], tarikBulanIni: 0 }; }
    if (S.qris && !Object.keys(S.merchants).length) S.merchants[S.qris] = { tersedia: 0, menunggu: [], tarikBulanIni: 0 };
    delete S.merchant;
    if (S.bank) { S.bank.transferBulanIni = S.bank.transferBulanIni || 0; S.bank.tarikHariIni = S.bank.tarikHariIni || 0; S.bank.tabunganGaji = S.bank.tabunganGaji || 0; }
    siapkanKk(S);
    return S;
  }
  function siapkanKk(S) {
    if (!S.kk) S.kk = { status: 'tidak', limit: 0, pakai: 0, tagihan: 0, minBayar: 0, dibayarBulanIni: 0, denda: 0, sejak: 0, iuranTempo: 0, mutasi: [] };
    S.kk.mutasi = S.kk.mutasi || [];
  }
  function qrisAktif(S) { if (!S.merchants) return []; return Object.keys(S.merchants).filter(function (id) { var m = S.merchants[id]; return !m.aktifPada || S.hari >= m.aktifPada; }); }
  function tersedia(S) { if (!S.merchants) return 0; var t = 0; for (var id in S.merchants) t += (S.merchants[id].tersedia || 0); return t; }
  /* bayar dari salah satu saldo QRIS yang cukup (satu pembayaran tidak bisa digabung dari dua aplikasi) */
  function bayarQris(S, jml) {
    var ids = Object.keys(S.merchants).sort(function (a, b) { return S.merchants[b].tersedia - S.merchants[a].tersedia; });
    for (var i = 0; i < ids.length; i++) if (S.merchants[ids[i]].tersedia >= jml) { S.merchants[ids[i]].tersedia -= jml; return qrisData(ids[i]); }
    return null;
  }
  function pasangQris(S, id) {
    if (S.merchants[id]) return 'QRIS ' + qrisData(id).nama + ' sudah terpasang.';
    S.merchants[id] = { tersedia: 0, menunggu: [], tarikBulanIni: 0, aktifPada: S.hari + 1 };
    if (!S.qris || !S.merchants[S.qris]) S.qris = id;
    return true;
  }
  function tutupQris(S, id) {
    if (!S.merchants || !S.merchants[id]) return 'Akun QRIS tersebut tidak terdaftar.';
    var q = qrisData(id), m = S.merchants[id];
    var sisaTersedia = Math.max(0, Math.round(m.tersedia || 0));
    var sisaTunggu = Math.max(0, Math.round((m.menunggu || []).reduce(function (t, x) { return t + (x.jml || 0); }, 0)));
    var totalSisa = sisaTersedia + sisaTunggu;
    if (totalSisa > 0) {
      S.bank.saldo += totalSisa;
      catat(S, 'Penutupan akun ' + (q ? q.app : id) + ' (sisa saldo cair)', totalSisa);
    }
    delete S.merchants[id];
    var sisaIds = Object.keys(S.merchants);
    if (S.qris === id) S.qris = sisaIds[0] || null;
    return { ok: true, nama: q ? q.app : id, sisa: totalSisa, teks: 'Akun ' + (q ? q.app : id) + ' berhasil ditutup.' + (totalSisa > 0 ? ' Sisa saldo ' + rp(totalSisa) + ' otomatis ditransfer ke rekening bank.' : '') };
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
    if (!S.uang || typeof S.uang.kecil !== 'number') S.uang = { kecil: MODAL_RECEH, besar: lamaLaci, dompet: MODAL_DOMPET, tukarHariIni: 0 };
    if (typeof S.uang.dompet !== 'number') S.uang.dompet = MODAL_DOMPET;
    if (!S.merchants) { S.merchants = {}; S.merchants[S.qris || 'gopay'] = S.merchant || { tersedia: lamaMerchant, menunggu: [], tarikBulanIni: 0 }; delete S.merchant; }
    if (!S.bank) { S.bank = { id: bankId, saldo: 0, tabunganGaji: 0, mutasi: [], transferBulanIni: 0, tarikHariIni: 0 }; S.bank.saldo = MODAL_BANK; catat(S, 'Modal awal (total Rp5.000.000 dgn dompet)', MODAL_BANK); }
    if (typeof S.bank.tabunganGaji !== 'number') S.bank.tabunganGaji = 0;
    S.pajak = S.pajak || { tagihan: [], omzetBulan: 0 };
    S.nib = S.nib || null;
    S.kur = S.kur || { status: 'tidak' };
    S.kreditBuruk = S.kreditBuruk || false;
    siapkanKk(S);
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
  /* penumpang / pembeli memindai salah satu stiker QRIS yang terpasang; jika semua akun QRIS ditutup, otomatis masuk bank */
  function terimaQris(S, bersih) {
    if (!S.merchants) S.merchants = {};
    var a = qrisAktif(S);
    if (!a.length) {
      var keys = Object.keys(S.merchants);
      if (!keys.length) {
        S.bank.saldo += bersih;
        catat(S, 'Pembayaran transfer langsung (QRIS nonaktif)', bersih);
        return;
      }
      a = keys;
    }
    var id = a[Math.floor(Math.random() * a.length)];
    S.merchants[id].menunggu.push({ n: S.hari, jml: bersih });
  }
  function laci(S) { return S.uang.kecil + S.uang.besar; }
  function dompet(S) { return (S.uang && S.uang.dompet) || 0; }
  function bayarDompet(S, jml) {
    if (!S.uang || (S.uang.dompet || 0) < jml) return false;
    S.uang.dompet -= jml;
    return true;
  }
  /* Pembayaran sesuai pilihan konfirmasi pemain: 'dompet' (Cash) | 'bank' (Transfer Bank) | 'kk' (Kartu Kredit). Tidak pernah memotong bank diam-diam jika Cash dipilih. */
  function bayarPilihan(S, jml, ket, metode) {
    var m = metode || (S && S._metodeBayar) || 'bank';
    jml = Math.max(0, Math.round(+jml || 0));
    if (jml <= 0) return true;
    if (m === 'kk') return pakaiKk(S, jml, ket || 'Transaksi');
    if (m === 'dompet' || m === 'cash') {
      if (!bayarDompet(S, jml)) return 'Uang tunai (Cash) di dompet tidak cukup (' + rp(dompet(S)) + ', butuh ' + rp(jml) + '). Tarik tunai dulu atau pilih bayar lewat Bank.';
      return true;
    }
    if (!S.bank || S.bank.saldo < jml) return 'Saldo rekening ' + bankIni(S).nama + ' tidak cukup (' + rp((S.bank && S.bank.saldo) || 0) + ', butuh ' + rp(jml) + ').';
    S.bank.saldo -= jml;
    catat(S, ket || 'Pembayaran', -jml);
    return true;
  }
  function pindahKeDompet(S, jml) {
    jml = Math.min(jml, laci(S));
    if (jml <= 0) return 'Laci kas kosong.';
    var dariBesar = Math.min(jml, S.uang.besar);
    S.uang.besar -= dariBesar;
    S.uang.kecil -= (jml - dariBesar);
    S.uang.dompet = (S.uang.dompet || 0) + jml;
    return true;
  }
  function pindahKeLaci(S, jml) {
    jml = Math.min(jml, dompet(S));
    if (jml <= 0) return 'Dompet kosong.';
    S.uang.dompet -= jml;
    if (jml >= 50000) S.uang.besar += jml; else S.uang.kecil += jml;
    return true;
  }
  /* Tabungan Khusus: tidak akan tertarik otomatis oleh sistem/gaji/pembelian kecuali diambil sendiri */
  function isiTabunganGaji(S, jml) {
    var nom = (jml === 'semua' || jml === Infinity) ? S.bank.saldo : Math.min(+jml || 0, S.bank.saldo);
    nom = Math.floor(nom);
    if (nom <= 0) return 'Saldo rekening utama tidak cukup untuk dipindahkan ke Tabungan Khusus.';
    S.bank.saldo -= nom;
    S.bank.tabunganGaji = (S.bank.tabunganGaji || 0) + nom;
    catat(S, 'Sisihkan ke Tabungan Khusus', -nom);
    return true;
  }
  function tarikTabunganGaji(S, jml) {
    var tab = S.bank.tabunganGaji || 0;
    var nom = (jml === 'semua' || jml === Infinity) ? tab : Math.min(+jml || 0, tab);
    nom = Math.floor(nom);
    if (nom <= 0) return 'Saldo Tabungan Khusus kosong.';
    S.bank.tabunganGaji -= nom;
    S.bank.saldo += nom;
    catat(S, 'Tarik dari Tabungan Khusus', nom);
    return true;
  }
  function saldoMerchant(m) { return m.tersedia + m.menunggu.reduce(function (t, x) { return t + x.jml; }, 0); }
  function merchantTotal(S) { var t = 0; for (var id in S.merchants) t += saldoMerchant(S.merchants[id]); return t; }

  /* ---------- aksi pemain (jawab: teks hasil, atau Error dengan alasan) ---------- */
  function bolehKeAtm(S) {
    if (S.fase !== 'buka' || S.tutupSementara) return true;
    return !!(g.KK_STAF && S.staf && S.staf.some(function (k) { return !k.cabang && g.KK_STAF.hadir(S, k); }));
  }
  function setor(S, jml, sumber) {
    var b = bankIni(S), T = b.tunai, tempat = T ? T.tempat : 'ATM / Teller';
    if (!bolehKeAtm(S)) return 'Kedai sedang buka tanpa karyawan. Tutup sementara dulu atau rekrut karyawan agar bisa ke ' + tempat + '.';
    var dariDompet = sumber === 'dompet' || (S.usaha && S.usaha.berhentiSewa);
    var stok = dariDompet ? dompet(S) : (S.uang.besar + S.uang.kecil);
    jml = (jml === 'semua' || jml === Infinity) ? stok : Math.min(+jml || 0, stok);
    jml = Math.floor(jml);
    if (jml <= 0) return dariDompet ? 'Dompet kosong.' : 'Laci kosong.';
    var kenaIndomaret = !!(T && jml <= T.maks);
    if (kenaIndomaret && jml < T.min) return 'Setor di ' + tempat + ' minimal ' + rp(T.min) + '.';
    var biaya = kenaIndomaret ? T.biaya : 0;
    if (S.bank.saldo + jml < biaya) return 'Saldo tidak cukup untuk biaya ' + rp(biaya) + '.';
    if (dariDompet) { S.uang.dompet -= jml; }
    else { var dariBesar = Math.min(jml, S.uang.besar); S.uang.besar -= dariBesar; S.uang.kecil -= jml - dariBesar; }
    S.bank.saldo += jml; catat(S, 'Setor tunai ' + (kenaIndomaret ? tempat : 'Teller') + (dariDompet ? ' (dari dompet)' : ''), jml);
    if (biaya > 0) { S.bank.saldo -= biaya; catat(S, 'Biaya setor tunai ' + tempat, -biaya); }
    return true;
  }
  function tarik(S, jml, tujuan) {
    var b = bankIni(S), T = b.tunai, tempat = T ? T.tempat : 'ATM / Teller';
    if (!bolehKeAtm(S)) return 'Kedai sedang buka tanpa karyawan. Tutup sementara dulu atau rekrut karyawan agar bisa ke ' + tempat + '.';
    jml = Math.floor(+jml || 0);
    if (jml <= 0) return 'Nominal tarik tidak valid.';
    var kenaIndomaret = !!(T && jml <= T.maks);
    var biaya = kenaIndomaret ? T.biaya : 0;
    if (S.bank.saldo < jml + biaya) return 'Saldo rekening tidak cukup (' + rp(S.bank.saldo) + ').';
    S.bank.saldo -= jml + biaya;
    if (tujuan === 'dompet') S.uang.dompet = (S.uang.dompet || 0) + jml;
    else S.uang.besar += jml;
    S.bank.tarikHariIni += jml;
    catat(S, 'Tarik tunai ' + (kenaIndomaret ? tempat : 'Teller') + (tujuan === 'dompet' ? ' (ke dompet)' : '') + (biaya ? ' (biaya ' + rp(biaya) + ')' : ''), -(jml + biaya));
    return true;
  }
  function tukarReceh(S, jml) {
    if (!bolehKeAtm(S)) return 'Kedai sedang buka tanpa karyawan. Tutup sementara dulu atau rekrut karyawan untuk tukar uang kecil.';
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
    if (S.usaha && S.usaha.berhentiSewa && g.KK_PROPERTI && g.KK_PROPERTI.penghasilan) return g.KK_PROPERTI.penghasilan(S);
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
    if (a > batas) return 'Ditolak: angsuran ' + a.toLocaleString('id-ID') + ' sebulan terlalu besar dibanding penghasilan bulanan. Coba plafon lebih kecil atau tenor lebih panjang.';
    S.kur = { status: 'menunggu', plafon: plafon, tenor: tenor, angsuran: a, siapPada: S.hari + N.kur.hariProses };
    return true;
  }

  /* ---------- Kartu Kredit (aturan Bank Indonesia) ---------- */
  function penghasilanKk(S) {
    if (g.KK_PROPERTI && g.KK_PROPERTI.penghasilan) return g.KK_PROPERTI.penghasilan(S);
    return Math.max(0, Math.round(labaBulanan(S)));
  }
  function hitungLimitKk(S) {
    var KK = N.kartuKredit, gj = penghasilanKk(S);
    if (gj < KK.syaratGaji) return KK.limitMin;
    return Math.min(KK.limitMaks, Math.max(KK.limitMin, Math.round(gj * KK.kaliLimit / 1000000) * 1000000));
  }
  function syaratKk(S) {
    var KK = N.kartuKredit, gj = penghasilanKk(S);
    return [
      { ok: S.hariKe >= KK.syaratHari, teks: 'Usaha berjalan minimal 1 bulan (sekarang hari ke-' + S.hariKe + ')' },
      { ok: gj >= KK.syaratGaji, teks: 'Penghasilan minimal ' + rp(KK.syaratGaji) + ' sebulan (sekarang ' + rp(gj) + ')' },
      { ok: !S.kreditBuruk, teks: 'Riwayat kredit lancar (SLIK OJK bersih)' },
      { ok: !S.kk || S.kk.status === 'tidak', teks: 'Belum punya kartu kredit di ' + bankIni(S).nama }
    ];
  }
  function ajukanKk(S) {
    siapkanKk(S);
    if (!syaratKk(S).every(function (x) { return x.ok; })) return 'Syarat pengajuan kartu kredit belum terpenuhi.';
    var lim = hitungLimitKk(S);
    S.kk = { status: 'aktif', limit: lim, pakai: 0, tagihan: 0, minBayar: 0, dibayarBulanIni: 0, denda: 0, sejak: S.hari, iuranTempo: S.hari + 365, mutasi: [] };
    return true;
  }
  function naikLimitKk(S) {
    siapkanKk(S);
    if (S.kk.status !== 'aktif') return 'Kartu kredit tidak aktif.';
    if (S.kreditBuruk || S.kk.denda > 0) return 'Tidak bisa naik limit saat ada tunggakan atau riwayat telat bayar.';
    var baru = hitungLimitKk(S);
    if (baru <= S.kk.limit) return 'Penghasilan saat ini belum cukup untuk menaikkan limit di atas ' + rp(S.kk.limit) + '.';
    S.kk.limit = baru;
    return true;
  }
  function sisaLimitKk(S) {
    siapkanKk(S);
    if (S.kk.status !== 'aktif') return 0;
    var cc = S.kk.cicilan ? Math.round(S.kk.cicilan.pokok * S.kk.cicilan.sisa / S.kk.cicilan.n) : 0;
    return Math.max(0, S.kk.limit - S.kk.pakai - S.kk.tagihan - S.kk.denda - cc);
  }
  function catatKk(S, ket, jml, n) {
    siapkanKk(S);
    S.kk.mutasi.unshift({ n: n == null ? S.hari : n, ket: ket, jml: jml });
    if (S.kk.mutasi.length > 30) S.kk.mutasi.length = 30;
  }
  function pakaiKk(S, jml, ket) {
    siapkanKk(S);
    if (S.kk.status === 'tidak') return 'Belum punya kartu kredit. Ajukan dulu di aplikasi ' + bankIni(S).app + '.';
    if (S.kk.status === 'blokir') return 'Kartu kredit sedang diblokir karena telat bayar tagihan. Lunasi tagihan di aplikasi ' + bankIni(S).app + '.';
    var sisa = sisaLimitKk(S);
    if (jml > sisa) return 'Limit kartu kredit tidak cukup (butuh ' + rp(jml) + ', sisa limit ' + rp(sisa) + ').';
    S.kk.pakai += jml;
    catatKk(S, ket, -jml);
    return true;
  }
  /* ubah tagihan tercetak jadi cicilan tenor 3/6/9/12/18/24 bulan, bunga 1,75% sebulan (anuitas) */
  var TENOR_KK = [3, 6, 9, 12, 18, 24];
  function cicilanKk(tagihan, tenor) {
    var r = N.kartuKredit.bungaBulan;
    return Math.ceil(tagihan * r / (1 - Math.pow(1 + r, -tenor)));
  }
  function cicilKk(S, tenor) {
    siapkanKk(S);
    var k = S.kk; tenor = Number(tenor);
    if (TENOR_KK.indexOf(tenor) < 0) return 'Tenor tidak tersedia.';
    if (k.cicilan) return 'Masih ada cicilan kartu kredit yang berjalan. Lunasi dulu jika ingin membuat cicilan baru.';
    if (k.denda > 0) return 'Lunasi denda dulu sebelum mencicil.';
    var dasar = Math.round((k.tagihan || 0) + (k.pakai || 0));
    if (dasar < 500000) return 'Total pemakaian & tagihan minimal Rp500.000 untuk dicicil.';
    var per = cicilanKk(dasar, tenor);
    k.cicilan = { n: tenor, sisa: tenor, per: per, pokok: dasar };
    catatKk(S, 'Tagihan ' + rp(dasar) + ' dicicil ' + tenor + ' bln', 0);
    k.tagihan = 0; k.pakai = 0; k.minBayar = 0; k.dibayarBulanIni = 0;
    if (k.status === 'blokir') k.status = 'aktif';
    return { ok: true, per: per, tenor: tenor, pokok: dasar };
  }
  function lunasiCicilanKk(S) {
    siapkanKk(S);
    var k = S.kk;
    if (!k.cicilan || k.cicilan.sisa <= 0) return 'Tidak ada cicilan kartu kredit berjalan.';
    var sisaPokok = Math.round(k.cicilan.pokok * k.cicilan.sisa / k.cicilan.n);
    if (S.bank.saldo < sisaPokok) return 'Saldo rekening tidak cukup untuk pelunasan cicilan KK ' + rp(sisaPokok) + '.';
    S.bank.saldo -= sisaPokok;
    catat(S, 'Pelunasan cicilan kartu kredit ' + bankIni(S).nama, -sisaPokok);
    catatKk(S, 'Pelunasan penuh cicilan KK', sisaPokok);
    k.cicilan = null;
    return { ok: true, jml: sisaPokok };
  }
  function bayarKk(S, jenis) {
    siapkanKk(S);
    var k = S.kk, KK = N.kartuKredit;
    var totalTagihan = k.tagihan + k.denda;
    var jml = 0;
    if (jenis === 'semua') jml = totalTagihan + k.pakai;
    else if (jenis === 'minimal') {
      if (totalTagihan <= 0) return 'Belum ada tagihan cetak yang perlu dibayar.';
      var kurangMin = Math.max(0, k.minBayar - k.dibayarBulanIni);
      jml = Math.min(totalTagihan, Math.max(kurangMin || KK.minRp, Math.min(totalTagihan, KK.minRp)));
    } else {
      if (totalTagihan <= 0) return 'Tagihan bulan ini sudah lunas.';
      jml = totalTagihan;
    }
    if (jml <= 0) return 'Tidak ada tagihan kartu kredit.';
    if (S.bank.saldo < jml) return 'Saldo rekening tidak cukup untuk membayar ' + rp(jml) + '.';
    S.bank.saldo -= jml;
    catat(S, 'Bayar kartu kredit ' + bankIni(S).nama, -jml);
    catatKk(S, 'Pembayaran tagihan', jml);
    var sisaBayar = jml;
    var potongDenda = Math.min(k.denda, sisaBayar); k.denda -= potongDenda; sisaBayar -= potongDenda;
    var potongTagihan = Math.min(k.tagihan, sisaBayar); k.tagihan -= potongTagihan; sisaBayar -= potongTagihan;
    k.dibayarBulanIni += potongDenda + potongTagihan;
    if (sisaBayar > 0) k.pakai = Math.max(0, k.pakai - sisaBayar);
    if (k.status === 'blokir' && (k.tagihan === 0 || k.dibayarBulanIni >= k.minBayar)) k.status = 'aktif';
    return { ok: true, jml: jml };
  }

  /* ---------- pergantian hari: pencairan, akhir bulan, cicilan ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru), b = bankIni(S);
    S.uang.tukarHariIni = 0; S.bank.tarikHariIni = 0;
    /* QRIS cair ke saldo tersedia pada hari kerja berikutnya */
    var adaMenunggu = false;
    Object.keys(S.merchants).forEach(function (id) {
      var m = S.merchants[id], q = qrisData(id);
      if (m.aktifPada && nBaru === m.aktifPada) kabar.push('QRIS ' + q.nama + ' sudah aktif.');
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
      var blnBaruK = tB.y * 12 + tB.m;
      if (tB.d === k.tempo && k.sisa > 0 && (k.terbayarSampai || 0) < blnBaruK) { k.terbayarSampai = blnBaruK; k.tunggakan += k.angsuran; k.sisa--; }
      if (k.tunggakan > 0) {
        var bayar = Math.min(k.tunggakan, S.bank.saldo);
        if (bayar > 0) { S.bank.saldo -= bayar; k.tunggakan -= bayar; catat(S, 'Angsuran KUR', -bayar, nBaru); }
        if (k.tunggakan > 0 && tB.d === k.tempo) { S.kreditBuruk = true; kabar.push('Saldo kurang untuk angsuran KUR. Tunggakan ' + rp(k.tunggakan) + ' tercatat di riwayat kredit.'); }
        else if (bayar > 0) kabar.push('Angsuran KUR ' + rp(bayar) + ' dipotong dari rekening.');
      }
      if (k.sisa === 0 && k.tunggakan === 0) { k.status = 'lunas'; kabar.push('KUR lunas.'); }
    }
    /* Kartu Kredit: cetak tagihan tiap ganti bulan, jatuh tempo tanggal 18 (aturan BI) */
    siapkanKk(S);
    var kk = S.kk, KK = N.kartuKredit;
    if (kk.status !== 'tidak') {
      if (tB.m !== tL.m) {
        var bunga = 0;
        /* jika tagihan bulan lalu belum lunas penuh, kena bunga BI maks 1,75% sebulan (hanya atas sisa tagihan tercetak, bukan pemakaian baru) */
        if (kk.tagihan > 0) {
          bunga = Math.round(kk.tagihan * KK.bungaBulan);
          kk.tagihan += bunga;
          catatKk(S, 'Bunga kartu kredit 1,75%', -bunga, nBaru);
        }
        if (kk.cicilan) {
          kk.tagihan += kk.cicilan.per; kk.cicilan.sisa--;
          catatKk(S, 'Cicilan kartu kredit (sisa ' + kk.cicilan.sisa + ' bln)', -kk.cicilan.per, nBaru);
          if (kk.cicilan.sisa <= 0) kk.cicilan = null;
        }
        kk.tagihan += kk.pakai;
        kk.pakai = 0;
        kk.dibayarBulanIni = 0;
        kk.minBayar = kk.tagihan > 0 ? Math.min(kk.tagihan, Math.max(KK.minRp, Math.round(kk.tagihan * KK.minPersen))) : 0;
        if (kk.tagihan > 0) kabar.push('Tagihan kartu kredit ' + b.nama + ' tercetak ' + rp(kk.tagihan) + (bunga ? ' (termasuk bunga 1,75% ' + rp(bunga) + ')' : '') + '. Bayar minimal ' + rp(kk.minBayar) + ' paling lambat tanggal ' + KK.jatuhTempo + '.');
      }
      /* Autodebit otomatis tagihan kartu kredit pada tanggal jatuh tempo (tgl 18) agar tidak kena denda */
      if (tB.d === KK.jatuhTempo && (kk.tagihan + kk.denda) > 0) {
        var totKk = kk.tagihan + kk.denda;
        if (S.bank.saldo >= totKk) {
          var rAutoPenuh = bayarKk(S, 'penuh');
          if (rAutoPenuh && rAutoPenuh.ok) kabar.push('💳 Autodebit Kartu Kredit ' + b.nama + ' penuh ' + rp(rAutoPenuh.jml) + ' berhasil (bebas bunga & denda).');
        } else if (kk.dibayarBulanIni < kk.minBayar) {
          var rAutoMin = bayarKk(S, 'minimal');
          if (rAutoMin && rAutoMin.ok) kabar.push('💳 Autodebit minimum Kartu Kredit ' + b.nama + ' ' + rp(rAutoMin.jml) + ' berhasil (saldo belum cukup untuk bayar penuh).');
        }
      }
      if (tB.d === KK.jatuhTempo + 1 && kk.tagihan > 0 && kk.dibayarBulanIni < kk.minBayar) {
        var dnd = Math.min(KK.dendaMaks, Math.max(10000, Math.round(kk.tagihan * KK.dendaPersen)));
        kk.denda += dnd;
        kk.status = 'blokir';
        S.kreditBuruk = true;
        catatKk(S, 'Denda keterlambatan BI', -dnd, nBaru);
        kabar.push('Kartu kredit lewat jatuh tempo tanggal ' + KK.jatuhTempo + '. Kena denda BI ' + rp(dnd) + ' dan kartu diblokir sampai dibayar.');
      }
      if (kk.iuranTempo && nBaru >= kk.iuranTempo) {
        kk.pakai += KK.iuranTahunan;
        kk.iuranTempo = nBaru + 365;
        catatKk(S, 'Iuran tahunan kartu kredit', -KK.iuranTahunan, nBaru);
        kabar.push('Iuran tahunan kartu kredit ' + rp(KK.iuranTahunan) + ' masuk ke pemakaian bulan ini.');
      }
    }
    return kabar;
  }
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }

  g.KK_UANG = { siapkan: siapkan, migrasi: migrasi, qrisData: qrisData, qrisAktif: qrisAktif, tersedia: tersedia, bayarQris: bayarQris, pasangQris: pasangQris, tutupQris: tutupQris,
    biayaTransfer: biayaTransfer, catatTransfer: catatTransfer, saldoMerchant: saldoMerchant, bayarTunai: bayarTunai, terimaQris: terimaQris, laci: laci, dompet: dompet, bayarDompet: bayarDompet, bayarPilihan: bayarPilihan, pindahKeDompet: pindahKeDompet, pindahKeLaci: pindahKeLaci, isiTabunganGaji: isiTabunganGaji, tarikTabunganGaji: tarikTabunganGaji, merchantTotal: merchantTotal,
    bolehKeAtm: bolehKeAtm, setor: setor, tarik: tarik, tukarReceh: tukarReceh, tarikMerchant: tarikMerchant, bayarPajak: bayarPajak, daftarNib: daftarNib,
    angsuran: angsuran, syaratKur: syaratKur, ajukanKur: ajukanKur,
    penghasilanKk: penghasilanKk, cicilKk: cicilKk, lunasiCicilanKk: lunasiCicilanKk, cicilanKk: cicilanKk, TENOR_KK: TENOR_KK, hitungLimitKk: hitungLimitKk, syaratKk: syaratKk, ajukanKk: ajukanKk, naikLimitKk: naikLimitKk, sisaLimitKk: sisaLimitKk, pakaiKk: pakaiKk, bayarKk: bayarKk,
    gantiHari: gantiHari, bankIni: bankIni, qrisIni: qrisIni,
    hariKerja: hariKerja, BATAS_TUKAR_RECEH: BATAS_TUKAR_RECEH };
})(window);
