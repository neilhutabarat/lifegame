/* mobil.js — beli mobil (tunai, kredit), bensin, servis, pajak, jual, dan perjalanan.
   Pikap untuk pesanan besar dan pindahan; mobil lain untuk pulang-pergi saat hujan dan gengsi. Angka dari nyata.js. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, R = N.rawatMobil, KR = N.kreditMobil;
  var KECEPATAN = { biasa: 28, pulangKantor: 15, hujan: 20, banjir: 8 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function M() { return g.KK_MOTOR; }
  function model(id) { return N.mobil.filter(function (x) { return x.id === id; })[0]; }
  function siapkan(S) {
    if (S.mobil === undefined) S.mobil = null;
    if (S.mobil && S.mobil.id) {
      var ref = model(S.mobil.id);
      if (ref && ref.bbm === 'listrik' && S.mobil.bbm !== 'listrik') {
        S.mobil.bbm = 'listrik'; S.mobil.kml = ref.kml; S.mobil.tangki = ref.tangki; S.mobil.ngelitik = false;
      }
      if (ref) {
        if (!(S.mobil.kml > 0)) S.mobil.kml = ref.kml || 12;
        if (!(S.mobil.tangki > 0)) S.mobil.tangki = ref.tangki || 45;
      }
      if (typeof S.mobil.isi !== 'number' || isNaN(S.mobil.isi)) S.mobil.isi = 0.5;
      if (S.mobil.isi > 1) S.mobil.isi = Math.min(1, S.mobil.isi / (S.mobil.tangki || 45));
      if (S.mobil.kmBan == null) S.mobil.kmBan = S.mobil.km || 0;
      if (S.mobil.totalHasil == null) S.mobil.totalHasil = 0;
    }
    if (!S.bisnisMobil) S.bisnisMobil = { carAktif: false, hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0 } };
    return S;
  }
  function punya(S) { return !!S.mobil; }
  function pikap(S) { return !!S.mobil && S.mobil.bentuk === 'pikap'; }
  function kapasitasPenumpang(S) {
    if (!S.mobil || !N.bisnisMobil) return 0;
    return N.bisnisMobil.kapasitas[S.mobil.bentuk] || 0;
  }
  function daftarCar(S) {
    if (!S.mobil) return 'Belum punya mobil.';
    if (pikap(S)) return 'Mobil pikap tidak bisa untuk GoCar/GrabCar. Gunakan untuk Jasa Angkutan.';
    S.bisnisMobil.carAktif = true;
    return true;
  }
  /* narik GoCar / GrabCar satu trip dalam kota */
  function ambilOrderCar(S) {
    var m = S.mobil;
    if (!m) return 'Belum punya mobil.';
    if (pikap(S)) return 'Mobil pikap hanya untuk Jasa Angkutan barang.';
    if (!S.bisnisMobil.carAktif) return 'Aktifkan akun GoCar / GrabCar dulu.';
    var km = Math.round((4 + Math.random() * 14) * 10) / 10;
    if (!cukup(S, km)) return 'Bensin mobil tidak cukup untuk order ' + km + ' km. Isi bensin dulu.';
    var r = jalan(S, km, 1); if (!r.ok) return r.alasan;
    var BM = N.bisnisMobil, tarifDasar = g.KK_OJEK ? g.KK_OJEK.tarif(S, km) : km * 3000;
    var promo = S.promoAktif ? (1.5 + Math.random() * 0.3) : 1;
    var kotor = Math.round(tarifDasar * BM.kaliTarifCar * promo / 1000) * 1000;
    var bersih = Math.round(kotor * (1 - BM.potonganCar) / 500) * 500;
    S.ojek.dompet += bersih;
    S.bisnisMobil.hariIni.trip++; S.bisnisMobil.hariIni.bersih += bersih;
    S.bisnisMobil.total.trip++; S.bisnisMobil.total.bersih += bersih;
    m.totalHasil = (m.totalHasil || 0) + bersih;
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + bersih;
    S.hariIni.mobil = (S.hariIni.mobil || 0) + bersih;
    return { ok: true, menit: Math.max(25, r.menit), bersih: bersih, teks: 'Order GoCar/GrabCar selesai (' + km + ' km). Masuk saldo +' + rp(bersih) + '.' };
  }
  /* bisnis Travel antarkota: angkut penumpang ke kota sebelah/lain, ongkos per orang x jumlah penumpang, potong bensin */
  function ruteTravel(S) { return (N.bisnisMobil && N.bisnisMobil.ruteTravel[S.kota]) || []; }
  function jalanTravel(S, ruteId) {
    var m = S.mobil;
    if (!m) return 'Belum punya mobil.';
    var kap = kapasitasPenumpang(S);
    if (kap < 2) return 'Mobil ini tidak cocok untuk travel penumpang. Pakai MPV, SUV, hatchback, atau sedan.';
    var rt = ruteTravel(S).filter(function (x) { return x.id === ruteId; })[0];
    if (!rt) return 'Rute travel tidak ditemukan.';
    var literButuh = rt.km / m.kml;
    var biayaBbm = Math.round(literButuh * M().hargaBbm(S, m.bbm) / 1000) * 1000;
    if (S.bank.saldo < biayaBbm && (S.uang.dompet || 0) < biayaBbm) return 'Dana tidak cukup untuk isi bensin perjalanan ' + rt.km + ' km (' + rp(biayaBbm) + ').';
    if (S.bank.saldo >= biayaBbm) { S.bank.saldo -= biayaBbm; M().catatBank(S, 'Bensin travel ke ' + rt.tujuan, -biayaBbm); }
    else { S.uang.dompet -= biayaBbm; }
    var minP = Math.max(2, kap - 2), pnp = S.promoAktif ? kap : (minP + Math.floor(Math.random() * (kap - minP + 1)));
    var kotor = pnp * rt.ongkos, bersih = kotor - biayaBbm;
    S.bank.saldo += kotor; M().catatBank(S, 'Travel ' + rt.tujuan + ' (' + pnp + ' penumpang)', kotor);
    m.km += rt.km;
    S.bisnisMobil.hariIni.trip++; S.bisnisMobil.hariIni.bersih += bersih;
    S.bisnisMobil.total.trip++; S.bisnisMobil.total.bersih += bersih;
    m.totalHasil = (m.totalHasil || 0) + bersih;
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + bersih;
    S.hariIni.mobil = (S.hariIni.mobil || 0) + bersih;
    S.hariIni.bensin = (S.hariIni.bensin || 0) + biayaBbm;
    return { ok: true, menit: Math.round(rt.jam * 60), bersih: bersih, teks: 'Travel ke ' + rt.tujuan + ' selesai! ' + pnp + ' penumpang × ' + rp(rt.ongkos) + ' = ' + rp(kotor) + ', bensin ' + rp(biayaBbm) + ', bersih +' + rp(bersih) + '.' };
  }
  /* jasa angkutan barang khusus mobil pikap (L300 / Gran Max / Carry / Hilux) */
  function jalanAngkutan(S, angId) {
    var m = S.mobil;
    if (!m || !pikap(S)) return 'Jasa angkutan butuh mobil pikap (Gran Max, Carry, Hilux, atau L300).';
    var ang = (N.bisnisMobil && N.bisnisMobil.angkutan || []).filter(function (x) { return x.id === angId; })[0];
    if (!ang) return 'Order angkutan tidak ditemukan.';
    if (!cukup(S, ang.km)) return 'Bensin pikap tidak cukup untuk ' + ang.km + ' km. Isi dulu.';
    var r = jalan(S, ang.km, 1); if (!r.ok) return r.alasan;
    var promo = S.promoAktif ? (1.5 + Math.random() * 0.3) : 1;
    var bayar = Math.round(ang.bayar * promo / 5000) * 5000;
    S.bank.saldo += bayar; M().catatBank(S, 'Jasa angkutan: ' + ang.nama, bayar);
    S.bisnisMobil.hariIni.trip++; S.bisnisMobil.hariIni.bersih += bayar;
    S.bisnisMobil.total.trip++; S.bisnisMobil.total.bersih += bayar;
    m.totalHasil = (m.totalHasil || 0) + bayar;
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + bayar;
    S.hariIni.mobil = (S.hariIni.mobil || 0) + bayar;
    return { ok: true, menit: Math.round(ang.jam * 60), bersih: bayar, teks: 'Jasa angkutan "' + ang.nama + '" selesai (' + ang.km + ' km). Pendapatan +' + rp(bayar) + ' masuk rekening.' };
  }

  function mobilBaru(m, S) {
    return { id: m.id, nama: m.nama, harga: m.harga, kml: m.kml, bbm: m.bbm, tangki: m.tangki, isi: 0.25, muat: m.muat, bentuk: m.bentuk, kelas: m.kelas,
      km: 0, kmServis: 0, kmBan: 0, totalHasil: 0, kredit: null, pajakTempo: S.hari + 365, dibeli: S.hari };
  }
  function cekGarasi(S) { return S.mobil ? 'Sudah punya ' + S.mobil.nama + '. Jual dulu kalau mau ganti.' : null; }
  function bayarDealer(S, jml, ket, cara) {
    if (cara === 'kk') {
      var err = g.KK_UANG.pakaiKk(S, jml, 'Dealer Mobil: ' + ket);
      return err === true ? true : err;
    }
    if (S.bank.saldo < jml) return 'Saldo rekening tidak cukup untuk ' + ket + ' ' + rp(jml) + '.';
    S.bank.saldo -= jml; M().catatBank(S, ket, -jml);
    return true;
  }
  function beliTunai(S, id, cara) {
    var e = cekGarasi(S); if (e) return e;
    var m = model(id);
    var by = bayarDealer(S, m.harga, 'Beli ' + m.nama + ' tunai', cara);
    if (by !== true) return by;
    S.mobil = mobilBaru(m, S); return true;
  }
  function hitungKredit(harga, dp, tenor) {
    var uangMuka = Math.round(harga * dp / 1e6) * 1e6, pokok = harga - uangMuka;
    var angsuran = Math.round((pokok * (1 + KR.bungaFlat * tenor) / tenor + harga * KR.asuransi) / 1000) * 1000;
    return { dp: uangMuka, angsuran: angsuran, total: uangMuka + angsuran * tenor };
  }
  function beliKredit(S, id, dp, tenor, cara) {
    var e = cekGarasi(S); if (e) return e;
    if (S.kreditBuruk) return KR.leasing + ' menolak: ada riwayat telat bayar cicilan.';
    var m = model(id), k = hitungKredit(m.harga, dp, tenor);
    var by = bayarDealer(S, k.dp, 'Uang muka kredit ' + m.nama, cara);
    if (by !== true) return by;
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

  /* bensin / cas listrik SPKLU dan servis dibayar dari rekening */
  function isiBensin(S, jenis, liter) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var RON = M().RON, listrik = m.bbm === 'listrik';
    if (listrik) jenis = 'listrik';
    else if (m.bbm === 'solar') jenis = 'solar';
    else jenis = RON[jenis] ? jenis : m.bbm;
    var kosong = Math.round((m.tangki - m.isi * m.tangki) * 10) / 10;
    if (kosong < 1) return listrik ? 'Baterai mobil sudah penuh.' : 'Tangki sudah penuh.';
    liter = liter === 'penuh' || !liter ? kosong : Math.min(+liter, kosong);
    var biaya = Math.round(liter * M().hargaBbm(S, jenis) / 100) * 100;
    if (S.bank.saldo < biaya) return 'Saldo rekening tidak cukup untuk ' + (listrik ? 'cas listrik ' : 'bensin ') + rp(biaya) + '.';
    S.bank.saldo -= biaya;
    M().catatBank(S, listrik ? ('Cas SPKLU ' + liter.toLocaleString('id-ID') + ' kWh') : ('Isi ' + N.bbm.nama[jenis] + ' ' + liter.toLocaleString('id-ID') + ' L'), -biaya);
    m.isi = Math.min(1, m.isi + liter / m.tangki);
    S.hariIni.bensin = (S.hariIni.bensin || 0) + biaya;
    m.ngelitik = !listrik && jenis !== 'solar' && RON[jenis] < RON[m.bbm];
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
  function telatBan(S) { var m = S.mobil; return m ? Math.max(0, m.km - (m.kmBan || 0) - (R.banKm || 45000)) : 0; }
  function hargaBan(m) {
    if (!m) return 4200000;
    return (R.banHarga && R.banHarga[m.kelas || 'keluarga']) || 4200000;
  }
  function gantiBan(S) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var h = hargaBan(m);
    if (S.bank.saldo < h) return 'Saldo rekening tidak cukup untuk ganti 4 ban (' + rp(h) + ').';
    S.bank.saldo -= h; M().catatBank(S, 'Ganti 4 ban ' + m.nama, -h);
    m.kmBan = m.km; S.hariIni.bengkel = (S.hariIni.bengkel || 0) + h;
    return { ok: true, biaya: h, teks: '4 ban ' + m.nama + ' diganti baru (' + rp(h) + ').' };
  }

  /* perjalanan */
  function kecepatan(S) {
    var menit = S.menit % 1440;
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) return S.dunia.cuaca.banjir ? (S.mobil && (S.mobil.bentuk === 'suv' || S.mobil.bentuk === 'pikap') ? 15 : KECEPATAN.banjir) : KECEPATAN.hujan;
    if (menit >= 990 && menit <= 1110) return KECEPATAN.pulangKantor;
    return KECEPATAN.biasa;
  }
  function gigi(S) { return g.KK_RUTE ? g.KK_RUTE.gigiInfo(S, 'mobil') : { id: 2, mid: 25, boros: 1, nama: '2', lo: 20, hi: 30 }; }
  function kmhGigi(S) { return gigi(S).mid * kecepatan(S) / KECEPATAN.biasa; }
  function cukup(S, km) {
    var m = S.mobil;
    if (!m || !(m.kml > 0) || !(m.tangki > 0)) return false;
    var isi = Math.max(0, Math.min(1, Number(m.isi) || 0));
    return isi * m.tangki >= (km / m.kml) * (gigi(S).boros || 1);
  }
  function jalan(S, km, stop) {
    var m = S.mobil;
    if (!cukup(S, km)) return { ok: false, alasan: m && m.bbm === 'listrik' ? 'Daya baterai mobil listrik tidak cukup. Cas dulu di SPKLU.' : 'Bensin mobil tidak cukup. Isi dulu di aplikasi Kendaraan.' };
    var menit = Math.round(km / kmhGigi(S) * 60) + 5 * (stop || 1), kabar = [];
    m.isi = Math.max(0, m.isi - km / m.kml * gigi(S).boros / m.tangki); m.km += km;
    if (Math.random() < 0.002 + (m.ngelitik ? 0.01 : 0) + (telatServis(S) + telatBan(S) * 0.5) / 1000 * 0.01) {
      var bengkel = 300000 + Math.floor(Math.random() * 4) * 100000; menit += 90;
      if (S.bank.saldo >= bengkel) { S.bank.saldo -= bengkel; M().catatBank(S, 'Derek dan bengkel ' + m.nama, -bengkel); }
      S.hariIni.bengkel = (S.hariIni.bengkel || 0) + bengkel; kabar.push('Mobil mogok di jalan. Derek dan bengkel ' + rp(bengkel) + ', telat sekitar 1,5 jam.');
    }
    return { ok: true, menit: menit, kabar: kabar };
  }

  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tB = KAL.tgl(nBaru), m = S.mobil;
    if (S.bisnisMobil && S.bisnisMobil.hariIni && S.bisnisMobil.hariIni.trip) {
      kabar.push('Kemarin bisnis mobil/travel ' + S.bisnisMobil.hariIni.trip + ' trip, bersih ' + rp(S.bisnisMobil.hariIni.bersih) + '.');
      S.bisnisMobil.hariIni = { trip: 0, bersih: 0 };
    }
    if (!m) return kabar;
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

  g.KK_MOBIL = { siapkan: siapkan, punya: punya, pikap: pikap, kapasitasPenumpang: kapasitasPenumpang, daftarCar: daftarCar, ambilOrderCar: ambilOrderCar, ruteTravel: ruteTravel, jalanTravel: jalanTravel, jalanAngkutan: jalanAngkutan, model: model, beliTunai: beliTunai, beliKredit: beliKredit, hitungKredit: hitungKredit, jual: jual, lunasi: lunasi,
    isiBensin: isiBensin, servis: servis, tagihanPajak: tagihanPajak, bayarPajak: bayarPajak, telatServis: telatServis, telatBan: telatBan, hargaBan: hargaBan, gantiBan: gantiBan, kecepatan: kecepatan, gigi: gigi, kmhGigi: kmhGigi, cukup: cukup, jalan: jalan, gantiHari: gantiHari };
})(window);
