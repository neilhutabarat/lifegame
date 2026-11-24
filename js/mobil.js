/* mobil.js — beli mobil (tunai, kredit), bensin, servis, pajak, jual, dan perjalanan.
   Pikap untuk pesanan besar dan pindahan; mobil lain untuk pulang-pergi saat hujan dan gengsi. Angka dari nyata.js. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, R = N.rawatMobil, KR = N.kreditMobil;
  var KECEPATAN = { biasa: 28, pulangKantor: 15, hujan: 20, banjir: 8 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function M() { return g.KK_MOTOR; }
  function model(id) { return N.mobil.filter(function (x) { return x.id === id; })[0]; }
  function siapkan(S) { if (S.mobil === undefined) S.mobil = null; return S; }
  function punya(S) { return !!S.mobil; }
  function pikap(S) { return !!S.mobil && S.mobil.bentuk === 'pikap'; }

  function mobilBaru(m, S) {
    return { id: m.id, nama: m.nama, harga: m.harga, kml: m.kml, bbm: m.bbm, tangki: m.tangki, isi: 0.25, muat: m.muat, bentuk: m.bentuk, kelas: m.kelas,
      km: 0, kmServis: 0, kredit: null, pajakTempo: S.hari + 365, dibeli: S.hari };
  }
  function cekGarasi(S) { return S.mobil ? 'Sudah punya ' + S.mobil.nama + '. Jual dulu kalau mau ganti.' : null; }
  function beliTunai(S, id) {
    var e = cekGarasi(S); if (e) return e;
    var m = model(id);
    if (S.bank.saldo < m.harga) return 'Saldo rekening tidak cukup untuk beli tunai ' + rp(m.harga) + '.';
    S.bank.saldo -= m.harga; M().catatBank(S, 'Beli ' + m.nama + ' tunai', -m.harga);
    S.mobil = mobilBaru(m, S); return true;
  }
  function hitungKredit(harga, dp, tenor) {
    var uangMuka = Math.round(harga * dp / 1e6) * 1e6, pokok = harga - uangMuka;
    var angsuran = Math.round((pokok * (1 + KR.bungaFlat * tenor) / tenor + harga * KR.asuransi) / 1000) * 1000;
    return { dp: uangMuka, angsuran: angsuran, total: uangMuka + angsuran * tenor };
  }
  function beliKredit(S, id, dp, tenor) {
    var e = cekGarasi(S); if (e) return e;
    if (S.kreditBuruk) return KR.leasing + ' menolak: ada riwayat telat bayar cicilan.';
    var m = model(id), k = hitungKredit(m.harga, dp, tenor);
    if (S.bank.saldo < k.dp) return 'Saldo rekening tidak cukup untuk uang muka ' + rp(k.dp) + '.';
    S.bank.saldo -= k.dp; M().catatBank(S, 'Uang muka kredit ' + m.nama, -k.dp);
    S.mobil = mobilBaru(m, S);
    S.mobil.kredit = { angsuran: k.angsuran, sisa: tenor, tenor: tenor, tempo: Math.min(28, KAL.tgl(S.hari).d), tunggakan: 0, bulanTelat: 0, denda: 0 };
    return true;
  }
  function jual(S) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    if (m.kredit) return 'Mobil masih kredit. Lunasi dulu sebelum dijual.';
    var h = M().nilaiJual(S, m); S.bank.saldo += h; M().catatBank(S, 'Jual ' + m.nama, h); S.mobil = null;
    return { ok: true, harga: h };
  }
  function lunasi(S) {
    var m = S.mobil; if (!m || !m.kredit) return 'Tidak ada kredit mobil.';
    var k = m.kredit, sisa = Math.round((k.sisa * k.angsuran * 0.9 + k.tunggakan + k.denda) / 1000) * 1000;
    if (S.bank.saldo < sisa) return 'Pelunasan ' + rp(sisa) + '. Saldo rekening tidak cukup.';
    S.bank.saldo -= sisa; M().catatBank(S, 'Pelunasan kredit ' + m.nama, -sisa); m.kredit = null;
    return { ok: true, jml: sisa };
  }

  /* bensin dan servis dibayar dari rekening (kartu debit di SPBU dan bengkel resmi) */
  function isiBensin(S, jenis, liter) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var RON = M().RON;
    if (m.bbm === 'solar') jenis = 'solar'; else jenis = RON[jenis] ? jenis : m.bbm;
    var kosong = Math.round((m.tangki - m.isi * m.tangki) * 10) / 10; if (kosong < 1) return 'Tangki sudah penuh.';
    liter = liter === 'penuh' || !liter ? kosong : Math.min(+liter, kosong);
    var biaya = Math.round(liter * M().hargaBbm(S, jenis) / 100) * 100;
    if (S.bank.saldo < biaya) return 'Saldo rekening tidak cukup untuk bensin ' + rp(biaya) + '.';
    S.bank.saldo -= biaya; M().catatBank(S, 'Isi ' + N.bbm.nama[jenis] + ' ' + liter.toLocaleString('id-ID') + ' L', -biaya);
    m.isi = Math.min(1, m.isi + liter / m.tangki); S.hariIni.bensin = (S.hariIni.bensin || 0) + biaya;
    m.ngelitik = jenis !== 'solar' && RON[jenis] < RON[m.bbm];
    return { ok: true, liter: liter, biaya: biaya, jenis: jenis };
  }
  function servis(S) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    if (S.bank.saldo < R.servis) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= R.servis; M().catatBank(S, 'Servis berkala ' + m.nama, -R.servis); m.kmServis = m.km;
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + R.servis; return true;
  }
  function tagihanPajak(S) {
    var m = S.mobil; if (!m || S.hari < m.pajakTempo - 30) return 0;
    return Math.round(m.harga * R.pkb / 1000) * 1000 + R.swdkllj + (m.dendaPajak || 0);
  }
  function bayarPajak(S) {
    var m = S.mobil, t = tagihanPajak(S); if (!m) return 'Belum punya mobil.'; if (!t) return 'Pajak belum jatuh tempo.';
    if (S.bank.saldo < t) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= t; M().catatBank(S, 'Pajak tahunan ' + m.nama + ' (PKB + SWDKLLJ)', -t); m.pajakTempo += 365; m.dendaPajak = 0; return true;
  }
  function telatServis(S) { var m = S.mobil; return m ? Math.max(0, m.km - m.kmServis - R.servisKm) : 0; }

  /* perjalanan */
  function kecepatan(S) {
    var menit = S.menit % 1440;
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) return S.dunia.cuaca.banjir ? (S.mobil && (S.mobil.bentuk === 'suv' || S.mobil.bentuk === 'pikap') ? 15 : KECEPATAN.banjir) : KECEPATAN.hujan;
    if (menit >= 990 && menit <= 1110) return KECEPATAN.pulangKantor;
    return KECEPATAN.biasa;
  }
  function cukup(S, km) { var m = S.mobil; return !!m && m.isi * m.tangki >= km / m.kml; }
  function jalan(S, km, stop) {
    var m = S.mobil;
    if (!cukup(S, km)) return { ok: false, alasan: 'Bensin mobil tidak cukup. Isi dulu di aplikasi Kendaraan.' };
    var menit = Math.round(km / kecepatan(S) * 60) + 5 * (stop || 1), kabar = [];
    m.isi = Math.max(0, m.isi - km / m.kml / m.tangki); m.km += km;
    if (Math.random() < 0.002 + (m.ngelitik ? 0.01 : 0) + telatServis(S) / 1000 * 0.01) {
      var bengkel = 300000 + Math.floor(Math.random() * 4) * 100000; menit += 90;
      if (S.bank.saldo >= bengkel) { S.bank.saldo -= bengkel; M().catatBank(S, 'Derek dan bengkel ' + m.nama, -bengkel); }
      S.hariIni.bengkel = (S.hariIni.bengkel || 0) + bengkel; kabar.push('Mobil mogok di jalan. Derek dan bengkel ' + rp(bengkel) + ', telat sekitar 1,5 jam.');
    }
    return { ok: true, menit: menit, kabar: kabar };
  }

  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tB = KAL.tgl(nBaru), m = S.mobil; if (!m) return kabar;
    var k = m.kredit;
    if (k && k.sisa > 0) {
      if (tB.d === k.tempo) {
        if (S.bank.saldo >= k.angsuran) { S.bank.saldo -= k.angsuran; k.sisa--; M().catatBank(S, 'Angsuran ' + KR.leasing + ' ' + m.nama, -k.angsuran, nBaru); kabar.push('Angsuran mobil ' + rp(k.angsuran) + ' dipotong. Sisa ' + k.sisa + ' bulan.'); }
        else { k.tunggakan += k.angsuran; k.sisa--; k.bulanTelat++; S.kreditBuruk = true; kabar.push('Saldo kurang untuk angsuran mobil. Denda harian berjalan.'); }
      }
      if (k.tunggakan > 0) {
        k.denda += Math.round(k.tunggakan * KR.dendaHarian);
        if (S.bank.saldo >= k.tunggakan + k.denda) { var b = k.tunggakan + k.denda; S.bank.saldo -= b; M().catatBank(S, 'Tunggakan + denda angsuran mobil', -b, nBaru); k.tunggakan = 0; k.denda = 0; k.bulanTelat = 0; kabar.push('Tunggakan mobil dan denda ' + rp(b) + ' sudah dibayar.'); }
        else if (k.bulanTelat >= KR.tarikSetelahBulan) { kabar.push(KR.leasing + ' menarik ' + m.nama + ' karena menunggak ' + k.bulanTelat + ' bulan.'); S.mobil = null; return kabar; }
      }
      if (k.sisa === 0 && k.tunggakan === 0) { m.kredit = null; kabar.push('Kredit mobil lunas. BPKB diambil di ' + KR.leasing + '.'); }
    }
    if (nBaru === m.pajakTempo - 14) kabar.push('Pajak tahunan ' + m.nama + ' jatuh tempo 2 minggu lagi.');
    if (nBaru > m.pajakTempo && (nBaru - m.pajakTempo) % 30 === 1) { m.dendaPajak = (m.dendaPajak || 0) + Math.round(m.harga * R.pkb * R.dendaPajak); kabar.push('Pajak mobil telat, denda bertambah.'); }
    return kabar;
  }

  g.KK_MOBIL = { siapkan: siapkan, punya: punya, pikap: pikap, model: model, beliTunai: beliTunai, beliKredit: beliKredit, hitungKredit: hitungKredit, jual: jual, lunasi: lunasi,
    isiBensin: isiBensin, servis: servis, tagihanPajak: tagihanPajak, bayarPajak: bayarPajak, telatServis: telatServis, kecepatan: kecepatan, cukup: cukup, jalan: jalan, gantiHari: gantiHari };
})(window);
