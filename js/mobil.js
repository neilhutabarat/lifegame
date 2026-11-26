/* mobil.js — beli mobil (tunai, kredit), bensin, servis, pajak, jual, dan perjalanan.
   Pikap untuk pesanan besar dan pindahan; mobil lain untuk pulang-pergi saat hujan dan gengsi. Angka dari nyata.js. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, R = N.rawatMobil, KR = N.kreditMobil;
  var KECEPATAN = { biasa: 28, pulangKantor: 15, hujan: 20, banjir: 8 };

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function blnNo(n) { var t = KAL.tgl(n); return t.y * 12 + t.m; }
  function blnTagih(S, tempo) { var t = KAL.tgl(S.hari); return t.y * 12 + t.m + (t.d > tempo ? 1 : 0); }
  function M() { return g.KK_MOTOR; }
  function model(id) { return N.mobil.filter(function (x) { return x.id === id; })[0]; }
  function sinkronAktif(S) {
    S.armadaMobil = S.armadaMobil || [];
    if (!S.armadaMobil.length) { S.mobilAktif = 0; S.mobil = null; return; }
    if (S.mobilAktif == null || S.mobilAktif < 0 || S.mobilAktif >= S.armadaMobil.length) S.mobilAktif = 0;
    S.mobil = S.armadaMobil[S.mobilAktif];
  }
  var UPGRADE_MAKS = 5;
  var UPGRADE_INFO = {
    mesin: { nama: 'Mesin & Performa', ket: '+12 km/j top speed & tarikan lebih halus tiap level', persenHarga: 0.025, naikHarga: 0.018, minHarga: 3500000 },
    tangki: { nama: 'Tangki BBM / Baterai EV', ket: '+15% kapasitas tangki/baterai tiap level', persenHarga: 0.018, naikHarga: 0.013, minHarga: 2500000 },
    efisiensi: { nama: 'Efisiensi / Tune-Up Eco', ket: '+12% lebih irit km/liter (atau km/kWh) tiap level', persenHarga: 0.020, naikHarga: 0.015, minHarga: 2800000 }
  };
  function normMobil(c) {
    if (!c || !c.id) return;
    var ref = model(c.id);
    if (!c.upg) c.upg = { mesin: 0, tangki: 0, efisiensi: 0 };
    if (ref && ref.bbm === 'listrik' && c.bbm !== 'listrik') {
      c.bbm = 'listrik'; c.ngelitik = false;
    }
    var baseKml = (ref && ref.kml) || c.baseKml || c.kml || 12;
    var baseTangki = (ref && ref.tangki) || c.baseTangki || c.tangki || 45;
    c.baseKml = baseKml;
    c.baseTangki = baseTangki;
    c.kml = Math.round(baseKml * (1 + (c.upg.efisiensi || 0) * 0.12) * 10) / 10;
    c.tangki = Math.round(baseTangki * (1 + (c.upg.tangki || 0) * 0.15) * 10) / 10;
    if (ref && ref.kursi) c.kursi = ref.kursi;
    if (typeof c.isi !== 'number' || isNaN(c.isi)) c.isi = 0.5;
    if (c.isi > 1) c.isi = Math.min(1, c.isi / (c.tangki || 45));
    if (c.kmBan == null) c.kmBan = c.km || 0;
    if (c.totalHasil == null) c.totalHasil = 0;
    if (c.totalUpgrade == null) c.totalUpgrade = 0;
  }
  function biayaUpgrade(c, jenis) {
    var info = UPGRADE_INFO[jenis];
    if (!c || !info) return 0;
    var lvl = (c.upg && c.upg[jenis]) || 0;
    var hDasar = c.harga || (model(c.id) && model(c.id).harga) || 200000000;
    return Math.max(info.minHarga, Math.round(hDasar * (info.persenHarga + lvl * info.naikHarga) / 100000) * 100000);
  }
  function upgrade(S, jenis) {
    var c = S.mobil;
    if (!c) return 'Belum punya mobil.';
    var info = UPGRADE_INFO[jenis];
    if (!info) return 'Jenis upgrade tidak dikenal.';
    normMobil(c);
    var lvl = c.upg[jenis] || 0;
    if (lvl >= UPGRADE_MAKS) return info.nama + ' sudah level maksimal (Lv ' + UPGRADE_MAKS + ').';
    var biaya = biayaUpgrade(c, jenis);
    if (S.bank.saldo >= biaya) { S.bank.saldo -= biaya; M().catatBank(S, 'Upgrade ' + info.nama + ' ' + c.nama + ' (Lv ' + (lvl + 1) + ')', -biaya); }
    else if ((S.uang && S.uang.dompet || 0) >= biaya) { S.uang.dompet -= biaya; }
    else return 'Dana tidak cukup untuk upgrade ' + info.nama + ' (' + rp(biaya) + ').';
    var literSebelum = c.isi * c.tangki;
    c.upg[jenis] = lvl + 1;
    c.totalUpgrade = (c.totalUpgrade || 0) + biaya;
    normMobil(c);
    if (jenis === 'tangki' && c.tangki > 0) c.isi = Math.max(0, Math.min(1, literSebelum / c.tangki));
    return { ok: true, biaya: biaya, level: c.upg[jenis], teks: 'Upgrade ' + info.nama + ' ' + c.nama + ' naik ke Lv ' + c.upg[jenis] + '/' + UPGRADE_MAKS + ' (' + rp(biaya) + ')!' };
  }
  function siapkan(S) {
    if (S.mobil === undefined) S.mobil = null;
    if (!S.armadaMobil) {
      S.armadaMobil = S.mobil ? [S.mobil] : [];
      S.mobilAktif = 0;
    }
    S.armadaMobil.forEach(normMobil);
    sinkronAktif(S);
    if (!S.bisnisMobil) S.bisnisMobil = { carAktif: false, hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0 } };
    if (!S.pasarMobilBekas || !S.pasarMobilBekas.unit || !S.pasarMobilBekas.unit.length) bekasBaru(S);
    return S;
  }
  function bekasBaru(S) {
    var pool = (N.mobilBekas || []).slice(), unit = [], thnKini = KAL.tgl(S.hari || 0).y, dipakai = {};
    if (!pool.length) { S.pasarMobilBekas = { minggu: Math.floor((S.hari || 0) / 7), unit: [] }; return; }
    for (var i = 0; i < Math.min(8, pool.length); i++) {
      var b = pool[Math.floor(Math.random() * pool.length)], coba = 0;
      while (dipakai[b.id] && coba++ < 10) b = pool[Math.floor(Math.random() * pool.length)];
      dipakai[b.id] = true;
      var thnMaks = Math.min(b.tahun[1], thnKini), thnMin = Math.min(b.tahun[0], thnMaks);
      var tahun = thnMin + Math.floor(Math.random() * (thnMaks - thnMin + 1));
      var kondisi = ['baik', 'sedang', 'kurang'][Math.floor(Math.random() * 3)];
      var mutu = { baik: 0.82, sedang: 0.5, kurang: 0.18 }[kondisi] + (Math.random() - 0.5) * 0.14;
      var harga = Math.round((b.min + (b.maks - b.min) * Math.max(0, Math.min(1, mutu))) / 500000) * 500000;
      unit.push({ id: b.id, tahun: tahun, kondisi: kondisi, km: 28000 + Math.floor(Math.random() * 110000), harga: harga });
    }
    unit.sort(function (a, b) { return a.harga - b.harga; });
    S.pasarMobilBekas = { minggu: Math.floor((S.hari || 0) / 7), unit: unit };
  }
  function beliBekas(S, i, cara) {
    var e = cekGarasi(S); if (e) return e;
    if (!S.pasarMobilBekas || !S.pasarMobilBekas.unit || !S.pasarMobilBekas.unit[i]) return 'Unit mobil bekas sudah terjual.';
    var u = S.pasarMobilBekas.unit[i];
    var b = (N.mobilBekas || []).filter(function (x) { return x.id === u.id; })[0];
    if (!b) return 'Model mobil bekas tidak dikenal.';
    var by = bayarDealer(S, u.harga, 'Beli bekas ' + b.nama.replace(' (bekas)', '') + ' ' + u.tahun, cara);
    if (by !== true) return by;
    var unit = mobilBaru({ id: b.id, nama: b.nama.replace(' (bekas)', '') + ' ' + u.tahun, harga: u.harga, kml: b.kml, bbm: b.bbm, tangki: b.tangki, kursi: b.kursi, muat: b.muat, bentuk: b.bentuk, kelas: b.kelas }, S);
    unit.bekas = { kondisi: u.kondisi, tahun: u.tahun };
    unit.km = u.km; unit.kmServis = u.km - Math.floor(Math.random() * 8000); unit.kmBan = u.km - Math.floor(Math.random() * 25000);
    unit.pajakTempo = S.hari + 30 + Math.floor(Math.random() * 300);
    tambahArmada(S, unit);
    S.pasarMobilBekas.unit.splice(i, 1);
    return true;
  }
  function pilihAktif(S, idx) {
    if (!S.armadaMobil || !S.armadaMobil[idx]) return 'Mobil tidak ditemukan.';
    if (S.ojek && S.ojek.online && S.ojek.mode === 'mobil') return 'Berhenti narik GoCar/GrabCar dulu sebelum ganti mobil utama.';
    if (S.travel && S.travel.aktif) return 'Selesaikan Travel dulu sebelum ganti mobil utama.';
    S.mobilAktif = idx;
    S.armadaMobil.forEach(normMobil);
    sinkronAktif(S);
    if (g.KK_TRAVEL && g.KK_TRAVEL.sinkronMobilSupir) g.KK_TRAVEL.sinkronMobilSupir(S);
    return true;
  }
  function jumlah(S) { return S.armadaMobil ? S.armadaMobil.length : (S.mobil ? 1 : 0); }
  function punya(S) { return !!S.mobil; }
  function disewakan(S, idx) {
    var i = idx != null ? +idx : ((S && S.mobilAktif) || 0);
    return !!(S && S.sewaBarang && S.sewaBarang['mobil:' + i]);
  }
  function siapPakai(S) { return !!S.mobil && !disewakan(S); }
  function pikap(S) { return !!S.mobil && S.mobil.bentuk === 'pikap'; }
  function kapasitasPenumpang(S, unit) {
    var m = unit || (S && S.mobil);
    if (!m) return 0;
    if (m.bentuk === 'pikap') return 0;
    var ref = model(m.id);
    if (m.kursi > 0) return m.kursi;
    if (ref && ref.kursi > 0) return ref.kursi;
    return (N.bisnisMobil && N.bisnisMobil.kapasitas[m.bentuk]) || 0;
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
    var pengaliKls = (g.KK_RUTE && g.KK_RUTE.pengaliKelasMobil) ? g.KK_RUTE.pengaliKelasMobil(m) : 1;
    var promo = S.promoAktif ? (1.5 + Math.random() * 0.3) : 1;
    var kotor = Math.round(tarifDasar * BM.kaliTarifCar * pengaliKls * promo / 1000) * 1000;
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
    return { id: m.id, nama: m.nama, harga: m.harga, kml: m.kml, baseKml: m.kml, bbm: m.bbm, tangki: m.tangki, baseTangki: m.tangki, kursi: m.kursi || 0, isi: 0.25, muat: m.muat, bentuk: m.bentuk, kelas: m.kelas,
      upg: { mesin: 0, tangki: 0, efisiensi: 0 }, totalUpgrade: 0,
      km: 0, kmServis: 0, kmBan: 0, totalHasil: 0, kredit: null, pajakTempo: S.hari + 365, dibeli: S.hari };
  }
  function cekGarasi(S) {
    S.armadaMobil = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    return null; /* bisa punya lebih dari 1 mobil tanpa batas */
  }
  function tambahArmada(S, unit) {
    S.armadaMobil = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    S.armadaMobil.push(unit);
    S.mobilAktif = S.armadaMobil.length - 1;
    sinkronAktif(S);
  }
  function bayarDealer(S, jml, ket, cara) {
    return g.KK_UANG.bayarPilihan(S, jml, 'Dealer Mobil: ' + ket, S._metodeBayar || cara || 'bank');
  }
  function beliTunai(S, id, cara) {
    var e = cekGarasi(S); if (e) return e;
    var m = model(id); if (!m) return 'Mobil tidak dikenal.';
    var thn = KAL.tgl(S.hari).y;
    if ((m.tahun || 2023) > thn) return m.nama + ' baru rilis tahun ' + m.tahun + ' (tahun saat ini ' + thn + ').';
    var by = bayarDealer(S, m.harga, 'Beli ' + m.nama + ' tunai', cara);
    if (by !== true) return by;
    tambahArmada(S, mobilBaru(m, S)); return true;
  }
  function hitungKredit(harga, dp, tenor) {
    var uangMuka = Math.round(harga * dp / 1e6) * 1e6, pokok = harga - uangMuka;
    var angsuran = Math.round((pokok * (1 + KR.bungaFlat * tenor) / tenor + harga * KR.asuransi) / 1000) * 1000;
    return { dp: uangMuka, angsuran: angsuran, total: uangMuka + angsuran * tenor };
  }
  function beliKredit(S, id, dp, tenor, cara) {
    var e = cekGarasi(S); if (e) return e;
    if (S.kreditBuruk) return KR.leasing + ' menolak: ada riwayat telat bayar cicilan.';
    var m = model(id); if (!m) return 'Mobil tidak dikenal.';
    var thn = KAL.tgl(S.hari).y;
    if ((m.tahun || 2023) > thn) return m.nama + ' baru rilis tahun ' + m.tahun + ' (tahun saat ini ' + thn + ').';
    var k = hitungKredit(m.harga, dp, tenor);
    var by = bayarDealer(S, k.dp, 'Uang muka kredit ' + m.nama, 'bank');
    if (by !== true) return by;
    var unit = mobilBaru(m, S);
    unit.kredit = { angsuran: k.angsuran, sisa: tenor, tenor: tenor, tempo: Math.min(28, KAL.tgl(S.hari).d), terbayarSampai: blnNo(S.hari), tunggakan: 0, bulanTelat: 0, denda: 0 };
    tambahArmada(S, unit);
    return true;
  }
  function jual(S, idx) {
    var i = idx != null ? +idx : (S.mobilAktif || 0);
    var m = (S.armadaMobil && S.armadaMobil[i]) || S.mobil;
    if (!m) return 'Belum punya mobil.';
    if (m.kredit) return 'Mobil masih kredit. Lunasi dulu sebelum dijual.';
    if (i === (S.mobilAktif || 0) && ((S.ojek && S.ojek.online && S.ojek.mode === 'mobil') || (S.travel && S.travel.aktif))) return 'Selesaikan GoCar/Travel dulu sebelum menjual mobil aktif.';
    var h = M().nilaiJual(S, m); S.bank.saldo += h; M().catatBank(S, 'Jual ' + m.nama, h);
    if (S.armadaMobil && S.armadaMobil.length) {
      S.armadaMobil.splice(i, 1); S.mobilAktif = 0; sinkronAktif(S);
      if (S.sewaBarang) {
        var baruSwM = {};
        Object.keys(S.sewaBarang).forEach(function (k) {
          if (k.indexOf('mobil:') === 0) {
            var ki = +k.slice(6);
            if (ki < i) baruSwM[k] = S.sewaBarang[k];
            else if (ki > i) baruSwM['mobil:' + (ki - 1)] = S.sewaBarang[k];
          } else baruSwM[k] = S.sewaBarang[k];
        });
        S.sewaBarang = baruSwM;
      }
      if (S.travel && S.travel.supir && S.travel.supir.length) {
        S.travel.supir.forEach(function (sp) {
          if (sp.mobilIdx === i) sp.mobilIdx = null;
          else if (sp.mobilIdx > i) sp.mobilIdx--;
        });
        if (g.KK_TRAVEL && g.KK_TRAVEL.sinkronMobilSupir) g.KK_TRAVEL.sinkronMobilSupir(S);
      }
    }
    else { S.mobil = null; if (S.sewaBarang) delete S.sewaBarang['mobil:0']; }
    return { ok: true, harga: h };
  }
  function bayarCicilan(S) {
    var m = S.mobil; if (!m || !m.kredit) return 'Tidak ada cicilan mobil.';
    var k = m.kredit;
    if (k.tunggakan > 0) {
      var bT = Math.round(k.tunggakan + (k.denda || 0));
      if (S.bank.saldo < bT) return 'Saldo rekening tidak cukup untuk bayar tunggakan + denda ' + rp(bT) + '.';
      S.bank.saldo -= bT; M().catatBank(S, 'Bayar tunggakan cicilan ' + m.nama, -bT);
      k.tunggakan = 0; k.denda = 0; k.bulanTelat = 0;
      if (k.sisa <= 0) m.kredit = null;
      return { ok: true, jml: bT, teks: 'Tunggakan cicilan mobil ' + rp(bT) + ' berhasil dilunasi!' + (!m.kredit ? ' Kredit mobil LUNAS!' : '') };
    }
    if (k.sisa <= 0) { m.kredit = null; return { ok: true, jml: 0, teks: 'Kredit mobil sudah lunas.' }; }
    var bA = k.angsuran;
    if (S.bank.saldo < bA) return 'Saldo rekening tidak cukup untuk bayar angsuran ' + rp(bA) + '.';
    S.bank.saldo -= bA; M().catatBank(S, 'Bayar angsuran ' + KR.leasing + ' ' + m.nama, -bA);
    k.sisa--;
    var nb = blnTagih(S, k.tempo);
    k.terbayarSampai = Math.max(k.terbayarSampai || (nb - 1), nb - 1) + 1;
    if (k.sisa <= 0 && !k.tunggakan) { m.kredit = null; return { ok: true, jml: bA, teks: 'Angsuran terakhir ' + rp(bA) + ' dibayar! Kredit mobil LUNAS, BPKB di tangan.' }; }
    return { ok: true, jml: bA, teks: 'Angsuran mobil ' + rp(bA) + ' dibayar (bulan ini lunas, tidak ditagih lagi). Sisa ' + k.sisa + ' bulan.' };
  }
  function lunasi(S) {
    var m = S.mobil; if (!m || !m.kredit) return 'Tidak ada kredit mobil.';
    var k = m.kredit, sisa = Math.round((k.sisa * k.angsuran * 0.9 + k.tunggakan + k.denda) / 1000) * 1000;
    if (S.bank.saldo < sisa) return 'Pelunasan ' + rp(sisa) + '. Saldo rekening tidak cukup.';
    S.bank.saldo -= sisa; M().catatBank(S, 'Pelunasan kredit ' + m.nama, -sisa); m.kredit = null;
    return { ok: true, jml: sisa };
  }

  /* bensin / cas listrik SPKLU, servis, ban, dan pajak dibayar melalui Kas Travel (auto top-up dari bank < 50 jt) */
  function danaRawat(S) {
    if (S._metodeBayar === 'dompet') return (S.uang && S.uang.dompet) || 0;
    if (S._metodeBayar === 'bank') return Math.max(0, (S.bank && S.bank.saldo) || 0);
    if (g.KK_TRAVEL && g.KK_TRAVEL.danaKas) return g.KK_TRAVEL.danaKas(S);
    return Math.max(0, (S.bank && S.bank.saldo) || 0);
  }
  function bayarRawat(S, jml, ket) {
    if (S._metodeBayar) {
      return g.KK_UANG.bayarPilihan(S, jml, ket, S._metodeBayar) === true ? jml : 0;
    }
    if (g.KK_TRAVEL && g.KK_TRAVEL.bayarKasTravel) return g.KK_TRAVEL.bayarKasTravel(S, jml, ket, S.hari, false);
    var p = Math.min(Math.max(0, S.bank.saldo), jml);
    if (p > 0) { S.bank.saldo -= p; M().catatBank(S, ket, -p); }
    return p;
  }
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
    if (danaRawat(S) < biaya) return 'Saldo Kas Travel & rekening tidak cukup untuk ' + (listrik ? 'cas listrik ' : 'bensin ') + rp(biaya) + '.';
    bayarRawat(S, biaya, (listrik ? ('Cas SPKLU ' + liter.toLocaleString('id-ID') + ' kWh') : ('Isi ' + N.bbm.nama[jenis] + ' ' + liter.toLocaleString('id-ID') + ' L')) + ' · ' + m.nama);
    m.isi = Math.min(1, m.isi + liter / m.tangki);
    S.hariIni.bensin = (S.hariIni.bensin || 0) + biaya;
    m.ngelitik = !listrik && jenis !== 'solar' && RON[jenis] < RON[m.bbm];
    return { ok: true, liter: liter, biaya: biaya, jenis: jenis };
  }
  function servis(S) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    if (danaRawat(S) < R.servis) return 'Saldo Kas Travel & rekening tidak cukup.';
    bayarRawat(S, R.servis, 'Servis berkala ' + m.nama); m.kmServis = m.km;
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + R.servis; return true;
  }
  function tagihanPajak(S) {
    var m = S.mobil; if (!m || S.hari < m.pajakTempo - 30) return 0;
    return Math.round(m.harga * R.pkb / 1000) * 1000 + R.swdkllj + (m.dendaPajak || 0);
  }
  function bayarPajak(S) {
    var m = S.mobil, t = tagihanPajak(S); if (!m) return 'Belum punya mobil.'; if (!t) return 'Pajak belum jatuh tempo.';
    if (danaRawat(S) < t) return 'Saldo Kas Travel & rekening tidak cukup.';
    bayarRawat(S, t, 'Pajak tahunan ' + m.nama + ' (PKB + SWDKLLJ)'); m.pajakTempo += 365; m.dendaPajak = 0; return true;
  }
  function telatServis(S) { var m = S.mobil; return m ? Math.max(0, m.km - m.kmServis - R.servisKm) : 0; }
  function telatBan(S) { var m = S.mobil; return m ? Math.max(0, m.km - (m.kmBan || 0) - (R.banKm || 90000)) : 0; }
  function hargaBan(m) {
    if (!m) return 4200000;
    return (R.banHarga && R.banHarga[m.kelas || 'keluarga']) || 4200000;
  }
  function gantiBan(S) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var h = hargaBan(m);
    if (danaRawat(S) < h) return 'Saldo Kas Travel & rekening tidak cukup untuk ganti 4 ban (' + rp(h) + ').';
    bayarRawat(S, h, 'Ganti 4 ban ' + m.nama);
    m.kmBan = m.km; S.hariIni.bengkel = (S.hariIni.bengkel || 0) + h;
    return { ok: true, biaya: h, teks: '4 ban ' + m.nama + ' diganti baru (' + rp(h) + ') dari Kas Travel.' };
  }

  /* perjalanan */
  function kecepatan(S) {
    var menit = S.menit % 1440;
    if (g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)) return S.dunia.cuaca.banjir ? (S.mobil && (S.mobil.bentuk === 'suv' || S.mobil.bentuk === 'pikap') ? 15 : KECEPATAN.banjir) : KECEPATAN.hujan;
    if (menit >= 990 && menit <= 1110) return KECEPATAN.pulangKantor;
    return KECEPATAN.biasa;
  }
  function gigi(S) { return g.KK_RUTE ? g.KK_RUTE.gigiInfo(S, 'mobil') : { id: 2, mid: 25, boros: 1, nama: '2', lo: 20, hi: 30 }; }
  function kmhGigi(S, km) {
    var gi = gigi(S);
    var v = gi.mid * kecepatan(S) / KECEPATAN.biasa * 0.78;
    var vmax = (g.KK_RUTE && g.KK_RUTE.vmaxKendaraan) ? g.KK_RUTE.vmaxKendaraan(S, 'mobil') : 170;
    var vvip5 = gi.id === 5 && S && S.vvip && S.vvip.aktif;
    /* mode normal (Lv 1–4): batas realistis (<35 km: maks 58, 35–50 km: maks 90, >=50 km: maks 130); mode VVIP Lv 5: melaju hingga top speed */
    var batas = vvip5
      ? ((km || 0) >= 50 ? vmax : (km || 0) >= 20 ? Math.min(vmax, 145) : Math.min(vmax, 95))
      : ((km || 0) >= 50 ? Math.min(vmax, 130) : (km || 0) >= 35 ? 90 : 58);
    if (vvip5) v = Math.max(v, batas * 0.92);
    return Math.max(8, Math.min(batas, v));
  }
  function cukup(S, km) {
    var m = S.mobil;
    if (!m || !(m.kml > 0) || !(m.tangki > 0)) return false;
    var isi = Math.max(0, Math.min(1, Number(m.isi) || 0));
    return isi * m.tangki >= (km / m.kml) * (gigi(S).boros || 1);
  }
  function jalan(S, km, stop) {
    var m = S.mobil;
    if (disewakan(S)) return { ok: false, alasan: 'Mobil ini sedang disewakan di Sewa Aset. Hentikan sewa atau ganti mobil utama dulu.' };
    if (!cukup(S, km)) return { ok: false, alasan: m && m.bbm === 'listrik' ? 'Daya baterai mobil listrik tidak cukup. Cas dulu di SPKLU.' : 'Bensin mobil tidak cukup. Isi dulu di aplikasi Kendaraan.' };
    var menit = Math.round(km / kmhGigi(S, km) * 60) + 5 * (stop || 1), kabar = [];
    m.isi = Math.max(0, m.isi - km / m.kml * gigi(S).boros / m.tangki); m.km += km;
    if (Math.random() < 0.0008 + (m.ngelitik ? 0.008 : 0) + (telatServis(S) + telatBan(S) * 0.4) / 2500 * 0.01) {
      var bengkel = 300000 + Math.floor(Math.random() * 4) * 100000; menit += 90;
      var dibayarB = (g.KK_TRAVEL && g.KK_TRAVEL.bayarKasTravel) ? g.KK_TRAVEL.bayarKasTravel(S, bengkel, 'Derek dan bengkel ' + m.nama, S.hari, true) : bayarRawat(S, bengkel, 'Derek dan bengkel ' + m.nama);
      S.hariIni.bengkel = (S.hariIni.bengkel || 0) + dibayarB; kabar.push('Mobil mogok di jalan. Derek dan bengkel ' + rp(dibayarB) + ', telat sekitar 1,5 jam.');
    }
    return { ok: true, menit: menit, kabar: kabar };
  }

  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tB = KAL.tgl(nBaru);
    if (S.bisnisMobil && S.bisnisMobil.hariIni && S.bisnisMobil.hariIni.trip) {
      kabar.push('Kemarin bisnis mobil/travel ' + S.bisnisMobil.hariIni.trip + ' trip, bersih ' + rp(S.bisnisMobil.hariIni.bersih) + '.');
      S.bisnisMobil.hariIni = { trip: 0, bersih: 0 };
    }
    if (S.pasarMobilBekas && Math.floor(nBaru / 7) !== S.pasarMobilBekas.minggu) bekasBaru(S);
    S.armadaMobil = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    var armada = S.armadaMobil;
    if (!armada.length) return kabar;
    var blnBaru = blnNo(nBaru);
    for (var i = armada.length - 1; i >= 0; i--) {
      var m = armada[i], k = m.kredit;
      if (k && (k.sisa > 0 || k.tunggakan > 0)) {
        if (k.sisa > 0 && tB.d === k.tempo && (k.terbayarSampai || 0) < blnBaru) {
          k.terbayarSampai = blnBaru;
          if (S.bank.saldo >= k.angsuran) { S.bank.saldo -= k.angsuran; k.sisa--; M().catatBank(S, 'Autodebit angsuran ' + KR.leasing + ' ' + m.nama, -k.angsuran, nBaru); kabar.push('🚗 Autodebit angsuran ' + m.nama + ' ' + rp(k.angsuran) + ' berhasil. Sisa ' + k.sisa + ' bulan.'); }
          else { k.tunggakan += k.angsuran; k.sisa--; k.bulanTelat++; S.kreditBuruk = true; kabar.push('⚠️ Saldo kurang untuk autodebit angsuran ' + m.nama + ' (' + rp(k.angsuran) + '). Denda harian berjalan.'); }
        }
        if (k.tunggakan > 0) {
          k.denda += Math.round(k.tunggakan * KR.dendaHarian);
          if (S.bank.saldo >= k.tunggakan + k.denda) { var b = k.tunggakan + k.denda; S.bank.saldo -= b; M().catatBank(S, 'Autodebit tunggakan + denda ' + m.nama, -b, nBaru); k.tunggakan = 0; k.denda = 0; k.bulanTelat = 0; kabar.push('🚗 Tunggakan ' + m.nama + ' & denda ' + rp(b) + ' dibayar otomatis.'); }
          else if (k.bulanTelat >= KR.tarikSetelahBulan) {
            kabar.push(KR.leasing + ' menarik ' + m.nama + ' karena menunggak ' + k.bulanTelat + ' bulan.');
            armada.splice(i, 1); sinkronAktif(S);
            continue;
          }
        }
        if (k.sisa <= 0 && k.tunggakan === 0) { m.kredit = null; kabar.push('🎉 Kredit ' + m.nama + ' lunas! BPKB diambil di ' + KR.leasing + '.'); }
      }
      if (nBaru === m.pajakTempo - 14) kabar.push('Pajak tahunan ' + m.nama + ' jatuh tempo 2 minggu lagi.');
      if (nBaru > m.pajakTempo && (nBaru - m.pajakTempo) % 30 === 1) { m.dendaPajak = (m.dendaPajak || 0) + Math.round(m.harga * R.pkb * R.dendaPajak); kabar.push('Pajak ' + m.nama + ' telat, denda bertambah.'); }
    }
    sinkronAktif(S);
    return kabar;
  }

  g.KK_MOBIL = { siapkan: siapkan, pilihAktif: pilihAktif, jumlah: jumlah, punya: punya, disewakan: disewakan, siapPakai: siapPakai, pikap: pikap, kapasitasPenumpang: kapasitasPenumpang, daftarCar: daftarCar, ambilOrderCar: ambilOrderCar, ruteTravel: ruteTravel, jalanTravel: jalanTravel, jalanAngkutan: jalanAngkutan, model: model, beliTunai: beliTunai, beliKredit: beliKredit, beliBekas: beliBekas, bekasBaru: bekasBaru, hitungKredit: hitungKredit, jual: jual, bayarCicilan: bayarCicilan, lunasi: lunasi,
    UPGRADE_MAKS: UPGRADE_MAKS, UPGRADE_INFO: UPGRADE_INFO, biayaUpgrade: biayaUpgrade, upgrade: upgrade,
    isiBensin: isiBensin, servis: servis, tagihanPajak: tagihanPajak, bayarPajak: bayarPajak, telatServis: telatServis, telatBan: telatBan, hargaBan: hargaBan, gantiBan: gantiBan, kecepatan: kecepatan, gigi: gigi, kmhGigi: kmhGigi, cukup: cukup, jalan: jalan, gantiHari: gantiHari };
})(window);
