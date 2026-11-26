/* tower.js — Control Tower (Admin Console rahasia: tap layar luar/dalam game 30x).
   Mengelola profil multi-akun, aktifkan Mode VVIP (Kecepatan Lv 5), Mode Sandbox,
   suntik/set dana dalam game, generator & redeem kode voucher, serta kontrol dunia. */
(function (g) {
  'use strict';
  var KEY = 'kopiKontainer.tower.v1';
  var SALT = 'THEDRIVER-CT-2023';
  var PAKET_UANG = {
    '1JT': 1000000,
    '5JT': 5000000,
    '10JT': 10000000,
    '50JT': 50000000,
    '100JT': 100000000,
    '500JT': 500000000,
    '1M': 1000000000,
    '5M': 5000000000
  };

  function rp(n) { return 'Rp' + Math.round(n || 0).toLocaleString('id-ID'); }
  function waktuSingkat() {
    try {
      var d = new Date();
      var p = function (x) { return (x < 10 ? '0' : '') + x; };
      return p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return '00:00'; }
  }
  function acakKode(len) {
    var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < (len || 4); i++) out += ch.charAt(Math.floor(Math.random() * ch.length));
    return out;
  }
  function hitungCek(str) {
    var s = String(str || '').toUpperCase() + '|' + SALT, h = 2166136261;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)) >>> 0;
    }
    var ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var k = 0; k < 4; k++) { out += ch.charAt(h % ch.length); h = Math.floor(h / ch.length); }
    return out;
  }

  var memDb = null;
  function muat() {
    if (memDb) return memDb;
    var def = { akun: [], log: [] };
    try {
      var raw = g.localStorage && g.localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.akun)) def = parsed;
      }
    } catch (e) {}
    def.akun = def.akun || [];
    def.log = def.log || [];
    memDb = def;
    return memDb;
  }
  function simpanDb() {
    try { if (g.localStorage && memDb) g.localStorage.setItem(KEY, JSON.stringify(memDb)); } catch (e) {}
  }
  function catatLog(teks) {
    var db = muat();
    db.log.unshift({ t: waktuSingkat(), teks: teks });
    if (db.log.length > 25) db.log.length = 25;
    simpanDb();
  }
  function pastikanState(S) {
    if (!S) return null;
    if (!S.akunId) S.akunId = 'DRV-' + acakKode(6);
    S.vvip = S.vvip || { aktif: false };
    S.sandbox = S.sandbox || { aktif: false, kebal: false, bukaTahun: false };
    S.voucherTerpakai = S.voucherTerpakai || {};
    return S;
  }
  function cariAkun(id) {
    var db = muat();
    for (var i = 0; i < db.akun.length; i++) if (db.akun[i].id === id) return db.akun[i];
    return null;
  }
  function sinkron(S) {
    if (!S) return muat();
    pastikanState(S);
    var db = muat();
    var rec = cariAkun(S.akunId);
    if (!rec) {
      rec = {
        id: S.akunId,
        nama: S.namaPemain || 'Driver',
        kota: S.kota || 'medan',
        vvip: !!(S.vvip && S.vvip.aktif),
        sandbox: !!(S.sandbox && S.sandbox.aktif),
        kebal: !!(S.sandbox && S.sandbox.kebal),
        bukaTahun: !!(S.sandbox && S.sandbox.bukaTahun),
        pendingUang: 0,
        aktif: true
      };
      db.akun.unshift(rec);
    } else {
      rec.nama = S.namaPemain || rec.nama;
      rec.kota = S.kota || rec.kota;
      if (rec.pendingUang && rec.pendingUang > 0 && S.bank) {
        S.bank.saldo += rec.pendingUang;
        if (g.KK_UANG && g.KK_UANG.catatTransfer) {}
        if (S.bank.mutasi) S.bank.mutasi.unshift({ n: S.hari || 0, ket: 'Kiriman Control Tower', jml: rec.pendingUang });
        rec.pendingUang = 0;
      }
      rec.vvip = !!(S.vvip && S.vvip.aktif);
      rec.sandbox = !!(S.sandbox && S.sandbox.aktif);
      rec.kebal = !!(S.sandbox && S.sandbox.kebal);
      rec.bukaTahun = !!(S.sandbox && S.sandbox.bukaTahun);
    }
    simpanDb();
    return db;
  }
  function daftarAkun(S) {
    if (S) sinkron(S);
    var db = muat();
    return db.akun.slice();
  }
  function tambahAkun(nama, customId) {
    var nm = String(nama || '').trim().slice(0, 24);
    if (!nm) return 'Masukkan nama akun dulu (mis. Akun Si A).';
    var db = muat();
    var id = String(customId || '').trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 14) || ('DRV-' + acakKode(6));
    if (cariAkun(id)) return 'ID akun ' + id + ' sudah terdaftar.';
    var rec = { id: id, nama: nm, kota: 'medan', vvip: false, sandbox: false, kebal: false, bukaTahun: false, pendingUang: 0 };
    db.akun.push(rec);
    catatLog('Tambah akun ' + nm + ' (' + id + ')');
    simpanDb();
    return { ok: true, akun: rec, teks: 'Akun ' + nm + ' (' + id + ') ditambahkan ke Control Tower.' };
  }
  function hapusAkun(id, S) {
    if (S && S.akunId === id) return 'Tidak bisa menghapus akun yang sedang aktif dimainkan.';
    var db = muat(), idx = -1;
    for (var i = 0; i < db.akun.length; i++) if (db.akun[i].id === id) { idx = i; break; }
    if (idx < 0) return 'Akun tidak ditemukan.';
    var nm = db.akun[idx].nama;
    db.akun.splice(idx, 1);
    catatLog('Hapus akun ' + nm + ' (' + id + ')');
    simpanDb();
    return { ok: true, teks: 'Akun ' + nm + ' dihapus dari daftar Control Tower.' };
  }
  function setFiturAkun(id, fitur, nilai, S) {
    if (S) pastikanState(S);
    var rec = cariAkun(id);
    if (!rec) return 'Akun tidak ditemukan.';
    var on = !!nilai;
    if (fitur === 'vvip') {
      rec.vvip = on;
      if (S && S.akunId === id) {
        S.vvip.aktif = on;
        if (on) { S.vvip.pernahBeli = true; S.vvip.dibukaHari = S.hari || 0; }
        else {
          if (S.travel && S.travel.gigi > 4) S.travel.gigi = 4;
          if (S.gigiJalan > 4) S.gigiJalan = 4;
        }
      }
      catatLog(rec.nama + ' (' + id + '): Mode VVIP Lv 5 ' + (on ? 'AKTIF' : 'NONAKTIF'));
      simpanDb();
      return { ok: true, teks: (on ? '🔓 Mode VVIP (Kecepatan Lv 5) diaktifkan' : '🔒 Mode VVIP dimatikan') + ' untuk ' + rec.nama + '.' };
    }
    if (fitur === 'sandbox') {
      rec.sandbox = on;
      rec.kebal = on;
      rec.bukaTahun = on;
      if (S && S.akunId === id) {
        S.sandbox.aktif = on;
        S.sandbox.kebal = on;
        S.sandbox.bukaTahun = on;
      }
      catatLog(rec.nama + ' (' + id + '): Mode Sandbox ' + (on ? 'AKTIF' : 'NONAKTIF'));
      simpanDb();
      return { ok: true, teks: (on ? '🧪 Mode Sandbox AKTIF' : 'Mode Sandbox dimatikan') + ' untuk ' + rec.nama + '.' };
    }
    if (fitur === 'kebal' || fitur === 'bukaTahun') {
      rec[fitur] = on;
      if (on) rec.sandbox = true;
      if (S && S.akunId === id) {
        S.sandbox[fitur] = on;
        if (on) S.sandbox.aktif = true;
      }
      catatLog(rec.nama + ' (' + id + '): ' + fitur + ' ' + (on ? 'ON' : 'OFF'));
      simpanDb();
      return { ok: true, teks: 'Pengaturan ' + (fitur === 'kebal' ? 'Kebal Kebutuhan' : 'Buka Semua Tahun 2023–2026') + ' ' + (on ? 'AKTIF' : 'MATI') + ' untuk ' + rec.nama + '.' };
    }
    return 'Fitur tidak dikenal.';
  }
  function suntikDanaAkun(id, jml, target, S, modeSet) {
    jml = Math.round(+jml || 0);
    if (!modeSet && jml <= 0) return 'Nominal dana harus lebih dari Rp0.';
    if (modeSet && jml < 0) return 'Nominal saldo tidak boleh negatif.';
    var rec = cariAkun(id);
    if (!rec) return 'Akun tidak ditemukan.';
    var tgt = target === 'dompet' ? 'dompet' : target === 'kastravel' ? 'kastravel' : 'bank';
    if (S && S.akunId === id) {
      if (tgt === 'dompet') {
        S.uang = S.uang || { kecil: 0, besar: 0, dompet: 0 };
        S.uang.dompet = modeSet ? jml : (S.uang.dompet || 0) + jml;
      } else if (tgt === 'kastravel') {
        if (g.KK_TRAVEL && g.KK_TRAVEL.siapkan) g.KK_TRAVEL.siapkan(S);
        S.travel.kas = modeSet ? jml : (S.travel.kas || 0) + jml;
        S.travel.kasMutasi = S.travel.kasMutasi || [];
        S.travel.kasMutasi.unshift({ n: S.hari || 0, ket: modeSet ? 'Control Tower: Set Kas Travel' : 'Control Tower: Top-up Kas Travel', jml: jml });
      } else {
        S.bank = S.bank || { id: 'bca', saldo: 0, mutasi: [] };
        S.bank.saldo = modeSet ? jml : (S.bank.saldo || 0) + jml;
        S.bank.mutasi = S.bank.mutasi || [];
        S.bank.mutasi.unshift({ n: S.hari || 0, ket: modeSet ? 'Control Tower: Set Saldo' : 'Control Tower: Top-up Dana', jml: jml });
        if (S.bank.mutasi.length > 40) S.bank.mutasi.length = 40;
      }
      catatLog(rec.nama + ': ' + (modeSet ? 'Set ' : 'Top-up +') + rp(jml) + ' (' + tgt + ')');
      simpanDb();
      return { ok: true, teks: (modeSet ? 'Saldo ' + tgt + ' diatur ke ' : 'Berhasil kirim ') + rp(jml) + ' ke ' + rec.nama + ' (' + tgt + ').' };
    }
    rec.pendingUang = modeSet ? jml : (rec.pendingUang || 0) + jml;
    catatLog(rec.nama + ' (antre): +' + rp(jml));
    simpanDb();
    return { ok: true, teks: 'Dana ' + rp(jml) + ' dicatat untuk akun ' + rec.nama + ' (otomatis cair saat akun aktif, atau gunakan Kode Voucher untuk perangkat lain).' };
  }
  function putihkanSlik(S) {
    if (!S) return 'Belum ada simpanan game aktif.';
    var KAL = g.KK_KAL, tPm = KAL ? KAL.tgl(S.hari || 0) : { y: 2023, m: 1 };
    var blnPm = tPm.y * 12 + tPm.m;
    S.kreditBuruk = false;
    (S.armadaMobil || []).forEach(function (mb) { if (mb && mb.kredit) { mb.kredit.tunggakan = 0; mb.kredit.denda = 0; mb.kredit.bulanTelat = 0; mb.kredit.terbayarSampai = Math.max(mb.kredit.terbayarSampai || 0, blnPm); } });
    (S.armadaMotor || []).forEach(function (mt) { if (mt && mt.kredit) { mt.kredit.tunggakan = 0; mt.kredit.denda = 0; mt.kredit.bulanTelat = 0; mt.kredit.terbayarSampai = Math.max(mt.kredit.terbayarSampai || 0, blnPm); } });
    ((S.properti && S.properti.daftarRumah) || []).forEach(function (rm) { if (rm && rm.kpr) { rm.kpr.tunggakan = 0; rm.kpr.bulanTelat = 0; rm.kpr.terbayarSampai = Math.max(rm.kpr.terbayarSampai || 0, blnPm); } });
    if (S.kk) { S.kk.denda = 0; if (S.kk.status === 'blokir') S.kk.status = 'aktif'; }
    if (S.kur) S.kur.tunggakan = 0;
    if (S.rumah) S.rumah.tunggakan = 0;
    if (S.kesehatan && S.kesehatan.bpjs) { S.kesehatan.bpjs.tunggakan = 0; if (S.kesehatan.bpjs.kelas > 0) S.kesehatan.bpjs.aktif = true; }
    catatLog('Pemutihan SLIK & hapus seluruh tunggakan (' + (S.namaPemain || 'Driver') + ')');
    return { ok: true, teks: '✅ SLIK dibersihkan & seluruh tunggakan/denda dinolkan.' };
  }
  function pulihkanSemua(S) {
    if (!S) return 'Belum ada simpanan game aktif.';
    if (S.diri) { S.diri.kenyang = 100; S.diri.minum = 100; S.diri.stamina = 100; S.diri.kesehatan = 100; S.diri.sakit = null; }
    if (S.hp) { S.hp.baterai = 100; S.hp.kuota = Math.max(20, S.hp.kuota || 0); S.hp.masaAktif = Math.max((S.hari || 0) + 90, S.hp.masaAktif || 0); }
    if (S.mobil) { S.mobil.isi = 1; S.mobil.ngelitik = false; }
    if (S.motor) { if (S.motor.bbm === 'listrik') S.motor.baterai = S.motor.jarakPenuh || 60; else S.motor.isi = S.motor.tangki || 5; S.motor.ngelitik = false; }
    catatLog('Pulihkan 100% semua bar & BBM (' + (S.namaPemain || 'Driver') + ')');
    return { ok: true, teks: '✨ Semua bar (Makan, Minum, Stamina, Kesehatan, HP, BBM) penuh 100%!' };
  }

  /* ---------- Generator & Redeem Kode Aktivasi Resmi (untuk kirim ke Akun Pengguna lain) ---------- */
  function buatKode(jenis, nominalKode, untukNama) {
    var seed = acakKode(4);
    var body = '';
    if (jenis === 'vvip') body = 'TD-VVIP-' + seed;
    else if (jenis === 'sandbox') body = 'TD-SBOX-' + seed;
    else if (jenis === 'uang') {
      var nk = String(nominalKode || '50JT').toUpperCase();
      if (!PAKET_UANG[nk]) nk = '50JT';
      body = 'TD-UANG-' + nk + '-' + seed;
    } else return null;
    var kode = body + '-' + hitungCek(body);
    catatLog('Buat kode ' + kode + (untukNama ? ' untuk ' + untukNama : ''));
    return kode;
  }
  function redeemKode(S, raw) {
    if (!S) return 'Masuk ke game dulu sebelum menukar kode aktivasi.';
    pastikanState(S);
    var kode = String(raw || '').trim().toUpperCase().replace(/\s+/g, '');
    if (!kode) return 'Masukkan kode aktivasi / voucher dulu.';
    if (S.voucherTerpakai[kode]) return 'Kode ' + kode + ' sudah pernah dipakai di akun ini.';
    var parts = kode.split('-');
    if (parts.length < 4 || parts[0] !== 'TD') return 'Format kode tidak valid.';
    var chk = parts[parts.length - 1];
    var body = parts.slice(0, -1).join('-');
    if (hitungCek(body) !== chk) return 'Kode aktivasi tidak valid atau salah ketik.';
    var tipe = parts[1];
    if (tipe === 'VVIP' && parts.length === 4) {
      S.vvip.aktif = true; S.vvip.pernahBeli = true; S.vvip.dibukaHari = S.hari || 0;
      S.voucherTerpakai[kode] = S.hari || 0;
      sinkron(S);
      return { ok: true, teks: '🔓 Voucher diterima! Mode VVIP (Kecepatan Level 5 Top Speed) kini AKTIF!' };
    }
    if (tipe === 'SBOX' && parts.length === 4) {
      S.sandbox.aktif = true; S.sandbox.kebal = true; S.sandbox.bukaTahun = true;
      S.voucherTerpakai[kode] = S.hari || 0;
      sinkron(S);
      return { ok: true, teks: '🧪 Voucher diterima! Mode Sandbox (Buka Katalog 2023–2026 & Kebal Kebutuhan) AKTIF!' };
    }
    if (tipe === 'UANG' && parts.length === 5 && PAKET_UANG[parts[2]]) {
      var nom = PAKET_UANG[parts[2]];
      S.bank.saldo += nom;
      if (S.bank.mutasi) { S.bank.mutasi.unshift({ n: S.hari || 0, ket: 'Redeem Voucher ' + parts[2], jml: nom }); if (S.bank.mutasi.length > 40) S.bank.mutasi.length = 40; }
      S.voucherTerpakai[kode] = S.hari || 0;
      sinkron(S);
      return { ok: true, teks: '💰 Voucher diterima! Dana ' + rp(nom) + ' langsung masuk ke rekening bankmu!' };
    }
    return 'Jenis voucher tidak dikenal.';
  }
  function sandboxAktif(S) { return !!(S && S.sandbox && S.sandbox.aktif); }
  function bukaSemuaTahun(S) { return !!(S && S.sandbox && S.sandbox.aktif && S.sandbox.bukaTahun); }
  function logTerbaru() { return muat().log.slice(0, 20); }

  g.KK_TOWER = {
    PAKET_UANG: PAKET_UANG,
    pastikanState: pastikanState,
    sinkron: sinkron,
    daftarAkun: daftarAkun,
    tambahAkun: tambahAkun,
    hapusAkun: hapusAkun,
    setFiturAkun: setFiturAkun,
    suntikDanaAkun: suntikDanaAkun,
    putihkanSlik: putihkanSlik,
    pulihkanSemua: pulihkanSemua,
    buatKode: buatKode,
    redeemKode: redeemKode,
    sandboxAktif: sandboxAktif,
    bukaSemuaTahun: bukaSemuaTahun,
    logTerbaru: logTerbaru
  };
})(window);
