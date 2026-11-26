/* motor.js — beli motor (tunai, kredit, bekas), bensin, perawatan, pajak tahunan, dan perjalanan.
   Rancangan bagian "Motor & bensin". Angka bertanda "perkiraan" atau "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, R = N.rawat, KR = N.kreditMotor;
  var KECEPATAN = { biasa: 25, pulangKantor: 18, hujan: 15 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function blnNo(n) { var t = KAL.tgl(n); return t.y * 12 + t.m; }
  function blnTagih(S, tempo) { var t = KAL.tgl(S.hari); return t.y * 12 + t.m + (t.d > tempo ? 1 : 0); }
  function wilayah(S) { var k = N.kota.filter(function (x) { return x.id === S.kota; })[0]; return (k && k.bbm) || 'sumatera'; }
  function catatBank(S, ket, jml, n) { S.bank.mutasi.unshift({ n: n == null ? S.hari : n, ket: ket, jml: jml }); if (S.bank.mutasi.length > 40) S.bank.mutasi.length = 40; }

  function sinkronAktif(S) {
    S.armadaMotor = S.armadaMotor || [];
    if (!S.armadaMotor.length) { S.motorAktif = 0; S.motor = null; return; }
    if (S.motorAktif == null || S.motorAktif < 0 || S.motorAktif >= S.armadaMotor.length) S.motorAktif = 0;
    S.motor = S.armadaMotor[S.motorAktif];
  }
  function siapkan(S) {
    if (!S.armadaMotor) {
      S.armadaMotor = S.motor ? [S.motor] : [];
      S.motorAktif = 0;
    }
    S.armadaMotor.forEach(function (mt) {
      if (mt.kmBan == null) mt.kmBan = mt.km || 0;
      if (mt.totalHasil == null) mt.totalHasil = 0;
    });
    sinkronAktif(S);
    S.bbmFaktor = S.bbmFaktor || { pertamax: 1, turbo: 1 };
    if (!S.pasarBekas) bekasBaru(S);
    return S;
  }
  function pilihAktif(S, idx) {
    if (!S.armadaMotor || !S.armadaMotor[idx]) return 'Motor tidak ditemukan.';
    if (S.ojek && S.ojek.online && S.ojek.mode !== 'mobil') return 'Berhenti narik ojol motor dulu sebelum ganti motor utama.';
    S.motorAktif = idx;
    S.armadaMotor.forEach(function (mt) {
      if (mt.kmBan == null) mt.kmBan = mt.km || 0;
      if (mt.totalHasil == null) mt.totalHasil = 0;
    });
    sinkronAktif(S);
    return true;
  }
  function jumlah(S) { return S.armadaMotor ? S.armadaMotor.length : (S.motor ? 1 : 0); }
  function hargaBbm(S, jenis) {
    if (jenis === 'listrik') return R.tarifListrik;
    if (jenis === 'solar') return N.solar;
    var h = N.bbm[wilayah(S)][jenis];
    return jenis === 'pertalite' ? h : Math.round(h * (S.bbmFaktor[jenis] || 1) / 50) * 50;
  }
  function punya(S) { return !!S.motor; }

  /* ---------- beli ---------- */
  function motorBaru(model) {
    return { id: model.id, nama: model.nama, harga: model.harga, kml: model.kml, bbm: model.bbm, tangki: model.tangki || 0, muat: model.muat,
      jarakPenuh: model.jarakPenuh || 0, kwh: model.kwh || 0, kuat: !!model.kuat, olisamping: !!model.olisamping,
      isi: model.bbm === 'listrik' ? 0 : 1, baterai: model.bbm === 'listrik' ? model.jarakPenuh : 0, km: 0, kmOli: 0, kmServis: 0, kmBan: 0, totalHasil: 0, kelas: model.kelas || 'harian', bekas: null, aks: {}, kredit: null };
  }
  function cekGarasi(S) {
    S.armadaMotor = S.armadaMotor || (S.motor ? [S.motor] : []);
    return null; /* bisa punya lebih dari 1 motor tanpa batas */
  }
  function bayarDealer(S, jml, ket, cara) {
    if (cara === 'kk') {
      var err = g.KK_UANG.pakaiKk(S, jml, 'Dealer Motor: ' + ket);
      return err === true ? true : err;
    }
    if (S.bank.saldo < jml) return 'Saldo rekening tidak cukup untuk ' + ket + ' ' + rp(jml) + '.';
    S.bank.saldo -= jml; catatBank(S, ket, -jml);
    return true;
  }
  function tambahArmada(S, m) {
    S.armadaMotor = S.armadaMotor || [];
    S.armadaMotor.push(m);
    S.motorAktif = S.armadaMotor.length - 1;
    S.armadaMotor.forEach(function (mt) {
      if (mt.kmBan == null) mt.kmBan = mt.km || 0;
      if (mt.totalHasil == null) mt.totalHasil = 0;
    });
    sinkronAktif(S);
  }
  function beliTunai(S, id, cara) {
    var e = cekGarasi(S); if (e) return e;
    var m = N.motor.filter(function (x) { return x.id === id; })[0]; if (!m) return 'Motor tidak dikenal.';
    var thn = KAL.tgl(S.hari).y;
    if ((m.tahun || 2023) > thn) return m.nama + ' baru rilis tahun ' + m.tahun + ' (tahun saat ini ' + thn + ').';
    var by = bayarDealer(S, m.harga, 'Beli ' + m.nama + ' tunai', cara);
    if (by !== true) return by;
    var unit = motorBaru(m); unit.pajakTempo = S.hari + 365; unit.dibeli = S.hari;
    tambahArmada(S, unit);
    return true;
  }
  /* nilai jual ke pedagang (perkiraan, data jualKendaraan) */
  function nilaiJual(S, k) {
    var J = N.jualKendaraan, tahun = (S.hari - (k.dibeli == null ? S.hari : k.dibeli)) / 365;
    var f = k.bekas ? 0.85 : J.awal; f -= J.perTahun * tahun + J.perKm * k.km;
    var bonusUpg = Math.round((k.totalUpgrade || 0) * 0.4);
    return Math.round((k.harga * Math.max(J.min, Math.min(k.bekas ? 0.9 : J.awal, f)) + bonusUpg) / 100000) * 100000;
  }
  function jual(S, idx) {
    var i = idx != null ? +idx : (S.motorAktif || 0);
    var m = (S.armadaMotor && S.armadaMotor[i]) || S.motor;
    if (!m) return 'Belum punya motor.';
    if (m.kredit) return 'Motor masih kredit. Lunasi dulu sebelum dijual.';
    if (S.ojek && S.ojek.online && i === (S.motorAktif || 0)) return 'Matikan aplikasi driver dulu.';
    var h = nilaiJual(S, m); S.bank.saldo += h; catatBank(S, 'Jual ' + m.nama, h);
    if (S.armadaMotor && S.armadaMotor.length) {
      S.armadaMotor.splice(i, 1); S.motorAktif = 0; sinkronAktif(S);
      if (S.sewaBarang) {
        var baruSw = {};
        Object.keys(S.sewaBarang).forEach(function (k) {
          if (k.indexOf('motor:') === 0) {
            var ki = +k.slice(6);
            if (ki < i) baruSw[k] = S.sewaBarang[k];
            else if (ki > i) baruSw['motor:' + (ki - 1)] = S.sewaBarang[k];
          } else baruSw[k] = S.sewaBarang[k];
        });
        S.sewaBarang = baruSw;
      }
    }
    else { S.motor = null; if (S.sewaBarang) delete S.sewaBarang['motor:0']; }
    return { ok: true, harga: h };
  }
  function bayarCicilan(S) {
    var m = S.motor; if (!m || !m.kredit) return 'Tidak ada cicilan motor.';
    var k = m.kredit;
    if (k.tunggakan > 0) {
      var bT = Math.round(k.tunggakan + (k.denda || 0));
      if (S.bank.saldo < bT) return 'Saldo rekening tidak cukup untuk bayar tunggakan + denda ' + rp(bT) + '.';
      S.bank.saldo -= bT; catatBank(S, 'Bayar tunggakan cicilan ' + m.nama, -bT);
      k.tunggakan = 0; k.denda = 0; k.bulanTelat = 0;
      if (k.sisa <= 0) m.kredit = null;
      return { ok: true, jml: bT, teks: 'Tunggakan cicilan motor ' + rp(bT) + ' berhasil dilunasi!' + (!m.kredit ? ' Kredit motor LUNAS!' : '') };
    }
    if (k.sisa <= 0) { m.kredit = null; return { ok: true, jml: 0, teks: 'Kredit motor sudah lunas.' }; }
    var bA = k.angsuran;
    if (S.bank.saldo < bA) return 'Saldo rekening tidak cukup untuk bayar angsuran ' + rp(bA) + '.';
    S.bank.saldo -= bA; catatBank(S, 'Bayar angsuran ' + KR.leasing + ' ' + m.nama, -bA);
    k.sisa--;
    var nb = blnTagih(S, k.tempo);
    k.terbayarSampai = Math.max(k.terbayarSampai || (nb - 1), nb - 1) + 1;
    if (k.sisa <= 0 && !k.tunggakan) { m.kredit = null; return { ok: true, jml: bA, teks: 'Angsuran terakhir ' + rp(bA) + ' dibayar! Kredit motor LUNAS.' }; }
    return { ok: true, jml: bA, teks: 'Angsuran motor ' + rp(bA) + ' dibayar (bulan ini lunas, tidak ditagih lagi). Sisa ' + k.sisa + ' bulan.' };
  }
  function lunasi(S) {
    var m = S.motor; if (!m || !m.kredit) return 'Tidak ada kredit motor.';
    var k = m.kredit, sisa = k.sisa * k.angsuran * 0.9 + k.tunggakan + k.denda; /* pelunasan dipercepat: diskon bunga, perkiraan */
    sisa = Math.round(sisa / 1000) * 1000;
    if (S.bank.saldo < sisa) return 'Pelunasan ' + rp(sisa) + '. Saldo rekening tidak cukup.';
    S.bank.saldo -= sisa; catatBank(S, 'Pelunasan kredit ' + m.nama, -sisa); m.kredit = null;
    return { ok: true, jml: sisa };
  }
  function hitungKredit(harga, dp, tenor) {
    var uangMuka = Math.round(harga * dp / 100000) * 100000, pokok = harga - uangMuka;
    var angsuran = Math.round((pokok * (1 + KR.bungaFlat * tenor) / tenor + harga * KR.asuransi) / 1000) * 1000;
    return { dp: uangMuka, angsuran: angsuran, total: uangMuka + angsuran * tenor };
  }
  function beliKredit(S, id, dp, tenor, cara) {
    var e = cekGarasi(S); if (e) return e;
    if (S.kreditBuruk) return KR.leasing + ' menolak: ada riwayat telat bayar cicilan.';
    var m = N.motor.filter(function (x) { return x.id === id; })[0]; if (!m) return 'Motor tidak dikenal.';
    var thn = KAL.tgl(S.hari).y;
    if ((m.tahun || 2023) > thn) return m.nama + ' baru rilis tahun ' + m.tahun + ' (tahun saat ini ' + thn + ').';
    var k = hitungKredit(m.harga, dp, tenor);
    var by = bayarDealer(S, k.dp, 'Uang muka kredit ' + m.nama, 'bank');
    if (by !== true) return by;
    var unit = motorBaru(m); unit.pajakTempo = S.hari + 365; unit.dibeli = S.hari;
    unit.kredit = { angsuran: k.angsuran, sisa: tenor, tenor: tenor, tempo: Math.min(28, KAL.tgl(S.hari).d), terbayarSampai: blnNo(S.hari), tunggakan: 0, bulanTelat: 0, denda: 0 };
    tambahArmada(S, unit);
    return true;
  }
  function bekasBaru(S) {
    var unit = [], thnKini = KAL.tgl(S.hari).y;
    for (var i = 0; i < 4; i++) {
      var b = N.motorBekas[i === 0 ? 0 : 1 + Math.floor(Math.random() * (N.motorBekas.length - 1))];
      if (i === 1 && Math.random() < 0.5) b = N.motorBekas[0];
      if (b.jarang && Math.random() > b.jarang) b = N.motorBekas[1];
      var thnMaks = Math.min(b.tahun[1], thnKini), thnMin = Math.min(b.tahun[0], thnMaks);
      var tahun = thnMin + Math.floor(Math.random() * (thnMaks - thnMin + 1));
      var kondisi = ['baik', 'sedang', 'kurang'][Math.floor(Math.random() * 3)];
      var mutu = { baik: 0.8, sedang: 0.45, kurang: 0.15 }[kondisi] + (Math.random() - 0.5) * 0.2;
      var harga = Math.round((b.min + (b.maks - b.min) * Math.max(0, Math.min(1, mutu))) / 100000) * 100000;
      unit.push({ id: b.id, tahun: tahun, kondisi: kondisi, km: 15000 + Math.floor(Math.random() * 60000), harga: harga });
    }
    S.pasarBekas = { minggu: Math.floor(S.hari / 7), unit: unit };
  }
  function beliBekas(S, i, cara) {
    var e = cekGarasi(S); if (e) return e;
    var u = S.pasarBekas.unit[i]; if (!u) return 'Unit sudah laku.';
    var b = N.motorBekas.filter(function (x) { return x.id === u.id; })[0];
    var by = bayarDealer(S, u.harga, 'Beli ' + b.nama + ' ' + u.tahun, cara);
    if (by !== true) return by;
    var m = motorBaru({ id: b.id, nama: b.nama.replace(' (bekas)', '') + ' ' + u.tahun, harga: u.harga, kml: b.kml, bbm: b.bbm, tangki: b.tangki, muat: b.muat, kuat: b.kuat, olisamping: b.olisamping });
    m.dibeli = S.hari; m.bekas = { kondisi: u.kondisi, tahun: u.tahun }; m.km = u.km; m.kmOli = u.km - Math.floor(Math.random() * 2500); m.kmServis = u.km - Math.floor(Math.random() * 5000); m.kmBan = u.km - Math.floor(Math.random() * 15000);
    m.pajakTempo = S.hari + 30 + Math.floor(Math.random() * 300);
    tambahArmada(S, m); S.pasarBekas.unit.splice(i, 1);
    return true;
  }

  /* ---------- bensin, perawatan, aksesoris ---------- */
  /* isi bensin per liter atau penuh; jenis bisa dipilih. Bensin di bawah anjuran pabrik (mis. Pertalite di motor
     yang dianjurkan Pertamax) membuat mesin ngelitik: sedikit lebih sering mogok sampai diisi bensin yang sesuai */
  var RON = { pertalite: 90, pertamax: 92, turbo: 98 };
  function bayarTunaiMotor(S, biaya, ket) {
    if (S.usaha && S.usaha.berhentiSewa) {
      if (g.KK_UANG.bayarDompet && g.KK_UANG.bayarDompet(S, biaya)) return true;
      if (S.bank.saldo >= biaya) { S.bank.saldo -= biaya; catatBank(S, ket || 'Biaya kendaraan motor', -biaya); return true; }
      return false;
    }
    if (g.KK_UANG.laci(S) >= biaya) { bayarLaci(S, biaya); return true; }
    if (g.KK_UANG.bayarDompet && g.KK_UANG.bayarDompet(S, biaya)) return true;
    return false;
  }
  function isiBensin(S, jenis, liter) {
    var m = S.motor; if (!m) return 'Belum punya motor.';
    if (m.bbm === 'listrik') return 'Motor listrik dicas otomatis tiap malam di tempat tinggal.';
    jenis = RON[jenis] ? jenis : m.bbm;
    var kosong = Math.round((m.tangki - m.isi) * 100) / 100; if (kosong < 0.2) return 'Tangki sudah penuh.';
    liter = liter === 'penuh' || !liter ? kosong : Math.min(+liter, kosong);
    var biaya = Math.round(liter * hargaBbm(S, jenis) / 100) * 100;
    if (!bayarTunaiMotor(S, biaya, 'Bensin motor ' + N.bbm.nama[jenis] + ' ' + liter.toLocaleString('id-ID') + ' L')) return 'Uang di dompet & rekening tidak cukup untuk bensin ' + rp(biaya) + '.';
    m.isi = Math.min(m.tangki, m.isi + liter); S.hariIni.bensin = (S.hariIni.bensin || 0) + biaya;
    m.ngelitik = RON[jenis] < RON[m.bbm];
    return { ok: true, liter: liter, biaya: biaya, jenis: jenis, ngelitik: m.ngelitik };
  }
  function bayarLaci(S, jml) {
    var dariBesar = Math.min(S.uang.besar, Math.floor(jml / 50000) * 50000), sisa = jml - dariBesar;
    if (sisa > S.uang.kecil) { dariBesar = Math.min(S.uang.besar, jml); sisa = jml - dariBesar; }
    S.uang.besar -= dariBesar; S.uang.kecil -= sisa;
  }
  function rawat(S, jenis) {
    var m = S.motor; if (!m) return 'Belum punya motor.';
    var biaya = jenis === 'oli' ? R.oli : R.servis;
    if (!bayarTunaiMotor(S, biaya, (jenis === 'oli' ? 'Ganti oli ' : 'Servis ') + m.nama)) return 'Dana tidak cukup untuk ' + jenis + ' (' + rp(biaya) + ').';
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + biaya;
    if (jenis === 'oli') m.kmOli = m.km; else { m.kmServis = m.km; m.kmOli = m.km; }
    return true;
  }
  function beliAks(S, id) {
    var m = S.motor; if (!m) return 'Belum punya motor.';
    var a = N.aksesoris.filter(function (x) { return x.id === id; })[0];
    if (m.aks[id]) return 'Sudah terpasang.';
    if (!bayarTunaiMotor(S, a.harga, 'Perlengkapan motor: ' + a.nama)) return 'Dana tidak cukup.';
    m.aks[id] = true; S.hariIni.belanja = (S.hariIni.belanja || 0) + a.harga;
    return true;
  }
  function bayarPajak(S) {
    var m = S.motor; if (!m) return 'Belum punya motor.';
    var t = tagihanPajak(S); if (!t) return 'Pajak belum jatuh tempo.';
    if (S.bank.saldo < t) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= t; catatBank(S, 'Pajak tahunan ' + m.nama + ' (PKB + SWDKLLJ)', -t);
    m.pajakTempo += 365; m.dendaPajak = 0; return true;
  }
  function tagihanPajak(S) {
    var m = S.motor; if (!m || S.hari < m.pajakTempo - 30) return 0;
    return Math.round(m.harga * R.pkb / 1000) * 1000 + R.swdkllj + (m.dendaPajak || 0);
  }
  function muatan(S) {
    var m = S.motor; if (!m) return 0;
    return Math.max(m.muat, m.aks.box ? 20 : 0, m.aks.tas ? 12 : 0);
  }
  function telatOli(S) { var m = S.motor; return m ? Math.max(0, m.km - m.kmOli - R.oliKm) : 0; }
  function telatServis(S) { var m = S.motor; return m ? Math.max(0, m.km - m.kmServis - R.servisKm) : 0; }
  function peluangMogok(S) {
    var m = S.motor; if (!m) return 0;
    var p = m.bekas ? { baik: 0.008, sedang: 0.02, kurang: 0.04 }[m.bekas.kondisi] : 0.0015;
    if (m.olisamping) p += 0.008;
    if (m.ngelitik) p += 0.012;
    p += (telatOli(S) + telatServis(S) + telatBan(S) * 0.4) / 2500 * 0.015;
    return Math.min(0.3, p);
  }
  function telatBan(S) { var m = S.motor; return m ? Math.max(0, m.km - (m.kmBan || 0) - (R.banKm || 40000)) : 0; }
  function hargaBan(m) {
    if (!m) return 420000;
    var ref = N.motor.filter(function (x) { return x.id === m.id; })[0];
    var kls = (ref && ref.kelas) || m.kelas || 'harian';
    return (R.banHarga && R.banHarga[kls]) || 420000;
  }
  function gantiBan(S) {
    var m = S.motor; if (!m) return 'Belum punya motor.';
    var h = hargaBan(m);
    if ((S.uang.dompet || 0) >= h) { S.uang.dompet -= h; }
    else if (S.bank.saldo >= h) { S.bank.saldo -= h; catatBank(S, 'Ganti ban ' + m.nama, -h); }
    else return 'Uang tidak cukup untuk ganti ban (' + rp(h) + ').';
    m.kmBan = m.km; S.hariIni.bengkel = (S.hariIni.bengkel || 0) + h;
    return { ok: true, biaya: h, teks: 'Ban ' + m.nama + ' diganti baru (' + rp(h) + ').' };
  }

  /* ---------- perjalanan (km pulang-pergi) ---------- */
  function kecepatan(S) {
    var menit = S.menit % 1440;
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) return S.dunia.cuaca.banjir ? 10 : KECEPATAN.hujan;
    if (menit >= 990 && menit <= 1110) return KECEPATAN.pulangKantor;
    return KECEPATAN.biasa;
  }
  function cukup(S, km) {
    var m = S.motor; if (!m) return false;
    return m.bbm === 'listrik' ? m.baterai >= km : m.isi >= km / m.kml * borosGigi(S);
  }
  /* gigi (percepatan) mempengaruhi kecepatan dan pemakaian bensin */
  function gigi(S) { return g.KK_RUTE ? g.KK_RUTE.gigiInfo(S, 'motor') : { id: 2, mid: 25, boros: 1, nama: '2', lo: 20, hi: 30 }; }
  function borosGigi(S) { return gigi(S).boros; }
  function kmhGigi(S, km) {
    var v = gigi(S).mid * kecepatan(S) / KECEPATAN.biasa * 0.78;
    /* batas realistis kecepatan rata-rata motor di jalan kota (<15 km: maks 55 km/j) & jarak jauh (>=15 km: maks 72 km/j) */
    var batas = (km || 0) >= 15 ? 72 : 55;
    return Math.max(8, Math.min(batas, v));
  }
  /* jalan: kurangi bensin, tambah km, hitung waktu dan kejadian */
  function jalan(S, km, stop) {
    var m = S.motor;
    if (!cukup(S, km)) return { ok: false, alasan: m.bbm === 'listrik' ? 'Baterai motor tidak cukup.' : 'Bensin tidak cukup. Isi bensin dulu di aplikasi Motor.' };
    var menit = Math.round(km / kmhGigi(S, km) * 60) + 3 * (stop || 1), kabar = [];
    if (m.bbm === 'listrik') m.baterai -= km; else m.isi = Math.max(0, m.isi - km / m.kml * borosGigi(S));
    if (m.olisamping) S.hariIni.bensin = (S.hariIni.bensin || 0) + Math.round(km / m.kml * 3000); /* oli samping 2-tak, perkiraan */
    m.km += km;
    if (Math.random() < peluangMogok(S)) {
      var bengkel = 50000 + Math.floor(Math.random() * 3) * 50000;
      menit += 60; S.hariIni.bengkel = (S.hariIni.bengkel || 0) + bengkel; bayarTunaiMotor(S, bengkel, 'Bengkel motor mogok ' + m.nama);
      kabar.push('Motor mogok di jalan. Ke bengkel ' + rp(bengkel) + ', telat sekitar 1 jam.');
    }
    return { ok: true, menit: menit, kabar: kabar };
  }

  /* ---------- ganti hari ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tB = KAL.tgl(nBaru);
    if (tB.d === 1) {
      ['pertamax', 'turbo'].forEach(function (j) { S.bbmFaktor[j] = Math.max(0.9, Math.min(1.15, S.bbmFaktor[j] * (1 + (Math.random() - 0.5) * 0.06))); });
      kabar.push('Harga Pertamax bulan ini ' + rp(hargaBbm(S, 'pertamax')) + ' per liter.');
    }
    if (Math.floor(nBaru / 7) !== S.pasarBekas.minggu) bekasBaru(S);
    S.armadaMotor = S.armadaMotor || (S.motor ? [S.motor] : []);
    var armadaM = S.armadaMotor;
    if (!armadaM.length) return kabar;
    var blnBaruM = blnNo(nBaru);
    for (var mi = armadaM.length - 1; mi >= 0; mi--) {
      var mt = armadaM[mi];
      if (mt.bbm === 'listrik' && mt.baterai < mt.jarakPenuh) {
        var kwh = (mt.jarakPenuh - mt.baterai) / mt.jarakPenuh * mt.kwh, biaya = Math.round(kwh * R.tarifListrik);
        mt.baterai = mt.jarakPenuh; S.hariIni.listrikMotor = (S.hariIni.listrikMotor || 0) + biaya;
      }
      var k = mt.kredit;
      if (k && (k.sisa > 0 || k.tunggakan > 0)) {
        if (k.sisa > 0 && tB.d === k.tempo && (k.terbayarSampai || 0) < blnBaruM) {
          k.terbayarSampai = blnBaruM;
          if (S.bank.saldo >= k.angsuran) { S.bank.saldo -= k.angsuran; k.sisa--; catatBank(S, 'Autodebit angsuran ' + KR.leasing + ' ' + mt.nama, -k.angsuran, nBaru); kabar.push('🏍️ Autodebit angsuran ' + mt.nama + ' ' + rp(k.angsuran) + ' berhasil. Sisa ' + k.sisa + ' bulan.'); }
          else { k.tunggakan += k.angsuran; k.sisa--; k.bulanTelat++; S.kreditBuruk = true; kabar.push('⚠️ Saldo kurang untuk autodebit angsuran ' + mt.nama + ' (' + rp(k.angsuran) + '). Denda harian berjalan.'); }
        }
        if (k.tunggakan > 0) {
          k.denda += Math.round(k.tunggakan * KR.dendaHarian);
          var bayar = Math.min(k.tunggakan + k.denda, S.bank.saldo);
          if (bayar >= k.tunggakan + k.denda) { S.bank.saldo -= bayar; catatBank(S, 'Autodebit tunggakan + denda ' + mt.nama, -bayar, nBaru); kabar.push('🏍️ Tunggakan ' + mt.nama + ' & denda ' + rp(bayar) + ' dibayar otomatis.'); k.tunggakan = 0; k.denda = 0; k.bulanTelat = 0; }
          else if (k.bulanTelat >= KR.tarikSetelahBulan) {
            kabar.push(KR.leasing + ' menarik ' + mt.nama + ' karena menunggak ' + k.bulanTelat + ' bulan.');
            armadaM.splice(mi, 1); sinkronAktif(S);
            continue;
          }
        }
        if (k.sisa <= 0 && k.tunggakan === 0) { mt.kredit = null; kabar.push('🎉 Kredit ' + mt.nama + ' lunas! BPKB diambil di ' + KR.leasing + '.'); }
      }
      if (nBaru === mt.pajakTempo - 14) kabar.push('Pajak tahunan ' + mt.nama + ' jatuh tempo 2 minggu lagi.');
      if (nBaru > mt.pajakTempo && (nBaru - mt.pajakTempo) % 30 === 1) { mt.dendaPajak = (mt.dendaPajak || 0) + Math.round(mt.harga * R.pkb * R.dendaPajak); kabar.push('Pajak ' + mt.nama + ' telat, denda bertambah.'); }
    }
    sinkronAktif(S);
    if (S.motor && telatOli(S) > 0 && tB.dow === 1) kabar.push('Oli motor sudah lewat waktunya. Motor lebih sering mogok.');
    return kabar;
  }

  g.KK_MOTOR = { siapkan: siapkan, pilihAktif: pilihAktif, jumlah: jumlah, hargaBbm: hargaBbm, punya: punya, beliTunai: beliTunai, beliKredit: beliKredit, hitungKredit: hitungKredit,
    beliBekas: beliBekas, isiBensin: isiBensin, rawat: rawat, beliAks: beliAks, bayarPajak: bayarPajak, tagihanPajak: tagihanPajak,
    muatan: muatan, telatOli: telatOli, telatServis: telatServis, telatBan: telatBan, hargaBan: hargaBan, gantiBan: gantiBan, peluangMogok: peluangMogok, cukup: cukup, jalan: jalan, kecepatan: kecepatan, gigi: gigi, kmhGigi: kmhGigi,
    gantiHari: gantiHari, bayarLaci: bayarLaci, RON: RON, nilaiJual: nilaiJual, jual: jual, bayarCicilan: bayarCicilan, lunasi: lunasi, catatBank: catatBank };
})(window);
