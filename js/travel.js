/* travel.js — usaha travel antarkota dengan mobil sendiri: tunggu penumpang di pool, pilih kota tujuan, berangkat,
   atur gigi (lima percepatan + satu khusus malam), tol dan kapal, istirahat, lalu penilaian penumpang.
   Jarak, tol, kapal, dan tarif dari data/rute.js. Frekuensi penumpang dan peluang kejadian adalah setelan. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, R = g.KK_RUTE;
  var CEPAT_JALAN = 8, CEPAT_TUNGGU = 1; /* waktu berjalan lebih cepat saat menyetir atau menunggu penumpang (setelan) */
  var MULT_MIN = 0.6, MULT_MAKS = 1.6, JEMPUT_MAKS = 3;
  var JAM_RAMAI = [0.2, 0.1, 0.1, 0.2, 0.8, 1.4, 1.6, 1.4, 1.1, 1, 1, 1.1, 1.2, 1.2, 1.3, 1.5, 1.7, 1.5, 1.1, 0.8, 0.5, 0.4, 0.3, 0.2];

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function waktu(S) { return S.hari * 1440 + S.menit; }
  function M() { return g.KK_MOTOR; }
  function siapkan(S) {
    if (!S.travel) S.travel = { aktif: false, di: null, status: 'tunggu', tujuan: null, mult: 1, gigi: 4, antri: [], jemput: 0, rating: 4.5, berikut: 0, trip: null, lompat: 0, laporan: null,
      hariIni: { trip: 0, bersih: 0 }, total: { trip: 0, bersih: 0, km: 0 } };
    if (!S.travel.total.km) S.travel.total.km = 0;
    if (!S.travel.supir) S.travel.supir = [];
    S.travel.supir.forEach(function (sp) {
      if (typeof sp.qrisSaldo !== 'number' || isNaN(sp.qrisSaldo)) sp.qrisSaldo = 0;
      if (!Array.isArray(sp.qrisRiwayat)) sp.qrisRiwayat = [];
      if (!sp.qrisKode) sp.qrisKode = 'QRIS-TRV-' + String(sp.id || '01').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    });
    if (!S.travel.pelamar || !S.travel.pelamar.length) S.travel.pelamar = buatPelamarSupir(S);
    /* jika tidak sedang aktif travel, selalu sinkronkan kota asal pool dengan kota tempat tinggal sekarang */
    if (!S.travel.aktif || (!S.travel.trip && !R.kota[S.travel.di])) S.travel.di = S.kota;
    sinkronMobilSupir(S);
    return S.travel;
  }
  function daftarMobilPenumpang(S) {
    var armada = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    var out = [];
    armada.forEach(function (c, idx) { if (c && c.bentuk !== 'pikap') out.push({ idx: idx, mobil: c, utama: idx === (S.mobilAktif || 0) }); });
    return out;
  }
  function cariMobilBebasSupir(S, excludeSupirId) {
    var list = daftarMobilPenumpang(S), aktIdx = S.mobilAktif || 0;
    var dipakaiLain = {};
    ((S.travel && S.travel.supir) || []).forEach(function (x) {
      if (x.id !== excludeSupirId && x.mobilIdx != null) dipakaiLain[x.mobilIdx] = true;
    });
    var cadanganBebas = list.filter(function (x) { return x.idx !== aktIdx && !dipakaiLain[x.idx]; });
    if (cadanganBebas.length) return cadanganBebas[0].idx;
    var cadanganAda = list.filter(function (x) { return x.idx !== aktIdx; });
    if (cadanganAda.length) return cadanganAda[0].idx;
    return list.length === 1 ? list[0].idx : -1;
  }
  function sinkronMobilSupir(S) {
    if (!S || !S.travel || !S.travel.supir || !S.travel.supir.length) return;
    var list = daftarMobilPenumpang(S), aktIdx = S.mobilAktif || 0;
    var adaCadangan = list.some(function (x) { return x.idx !== aktIdx; });
    S.travel.supir.forEach(function (sp) {
      var valid = sp.mobilIdx != null && list.some(function (x) { return x.idx === sp.mobilIdx; });
      if (!valid || (adaCadangan && sp.mobilIdx === aktIdx)) {
        var baru = cariMobilBebasSupir(S, sp.id);
        sp.mobilIdx = baru >= 0 ? baru : null;
      }
    });
  }
  function mobilUntukSupir(S, sp) {
    var armada = S.armadaMobil || (S.mobil ? [S.mobil] : []), list = daftarMobilPenumpang(S), aktIdx = S.mobilAktif || 0;
    var adaCadangan = list.some(function (x) { return x.idx !== aktIdx; });
    if (sp && sp.mobilIdx != null && armada[sp.mobilIdx] && armada[sp.mobilIdx].bentuk !== 'pikap') {
      if (!adaCadangan || sp.mobilIdx !== aktIdx) return { idx: sp.mobilIdx, mobil: armada[sp.mobilIdx], berbagi: sp.mobilIdx === aktIdx };
    }
    var idx = cariMobilBebasSupir(S, sp ? sp.id : null);
    if (idx >= 0 && armada[idx]) {
      if (sp) sp.mobilIdx = idx;
      return { idx: idx, mobil: armada[idx], berbagi: idx === aktIdx };
    }
    return null;
  }
  function buatPelamarSupir(S) {
    var namaCalon = ['Rudi Hartono', 'Slamet Riyadi', 'Hendra Wijaya', 'Agus Supriyanto', 'Bambang Kusuma', 'Dedi Setiawan', 'Wahyu Pratama', 'Joko Susilo'];
    var hasil = [];
    for (var i = 0; i < 4; i++) {
      var nm = namaCalon[((S.hari || 0) + i * 2) % namaCalon.length];
      hasil.push({
        id: 'sp-' + ((S.hari || 0) + 1) + '-' + i + '-' + Math.floor(Math.random() * 999),
        nama: nm,
        sim: i % 2 === 0 ? 'SIM A Umum' : 'SIM B1 Umum',
        pengalaman: 2 + ((i * 3 + (S.hari || 0)) % 8),
        rating: Math.round((4.3 + (i % 4) * 0.15) * 10) / 10
      });
    }
    return hasil;
  }
  function umkKota(S) {
    var k = N.kota.filter(function (x) { return x.id === S.kota; })[0];
    return (k && k.umk) || 4000000;
  }
  /* hitung persenan kepuasan supir travel (0-100%) berdasarkan gaji pokok, uang makan, insentif, periode, & BPJS */
  function kepuasanSupir(S, sp) {
    var gp = Math.max(0, +sp.gajiPokok || 0);
    var um = Math.max(0, +sp.uangMakan || 0);
    var ins = Math.max(0, +sp.insentif || 0);
    var per = sp.periode || 'bulan';
    var eqBulan = per === 'jalan' ? (gp + um + ins) * 24 : per === 'minggu' ? (gp + um * 6 + ins * 6) * 4.2 : (gp + um * 24 + ins * 24);
    var wajar = Math.max(3600000, umkKota(S) * 1.15);
    var rasio = eqBulan / wajar;
    var skor = rasio >= 1.35 ? 92 : rasio >= 1.0 ? (72 + (rasio - 1.0) / 0.35 * 20) : rasio >= 0.65 ? (42 + (rasio - 0.65) / 0.35 * 30) : (10 + rasio / 0.65 * 32);
    if (sp.bpjs) skor += 14;
    return Math.max(5, Math.min(100, Math.round(skor)));
  }
  function labelPuasSupir(p) {
    return p >= 85 ? 'Sangat Puas (Loyal & Rajin)' : p >= 65 ? 'Puas (Kerja Stabil)' : p >= 40 ? 'Kurang Puas (Sering Lambat)' : 'Tidak Puas (Rawan Resign!)';
  }
  function rekrutSupir(S, pelamarId, cfg) {
    var T = siapkan(S);
    var listM = daftarMobilPenumpang(S), aktIdx = S.mobilAktif || 0;
    if (!listM.length) return 'Butuh mobil penumpang (MPV/SUV/Sedan/Hatchback) untuk mempekerjakan supir travel.';
    if (T.supir.length >= 3) return 'Maksimal 3 supir travel yang bisa dipekerjakan.';
    var idx = -1;
    for (var i = 0; i < T.pelamar.length; i++) if (T.pelamar[i].id === pelamarId) { idx = i; break; }
    if (idx < 0) return 'Pelamar tidak ditemukan.';
    var adaCadangan = listM.some(function (x) { return x.idx !== aktIdx; });
    var mIdx = (cfg && cfg.mobilIdx != null && cfg.mobilIdx !== '' && listM.some(function (x) { return x.idx === +cfg.mobilIdx; })) ? +cfg.mobilIdx : cariMobilBebasSupir(S, null);
    if (adaCadangan && mIdx === aktIdx) mIdx = cariMobilBebasSupir(S, null);
    var p = T.pelamar[idx];
    var per = (cfg && cfg.periode) || 'bulan';
    var sp = {
      id: p.id, nama: p.nama, sim: p.sim, pengalaman: p.pengalaman, rating: p.rating,
      periode: per,
      gajiPokok: Math.max(0, Math.round(+(cfg && cfg.gajiPokok != null ? cfg.gajiPokok : (per === 'jalan' ? 150000 : per === 'minggu' ? 900000 : 3500000)))),
      uangMakan: Math.max(0, Math.round(+(cfg && cfg.uangMakan != null ? cfg.uangMakan : 40000))),
      insentif: Math.max(0, Math.round(+(cfg && cfg.insentif != null ? cfg.insentif : 25000))),
      bpjs: !!(cfg && cfg.bpjs),
      mobilIdx: mIdx >= 0 ? mIdx : null,
      ruteId: (cfg && cfg.ruteId) || 'otomatis',
      qrisSaldo: 0, qrisRiwayat: [], qrisKode: 'QRIS-TRV-' + String(p.id).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase(),
      aktif: true, totalTrip: 0, totalBersih: 0, hariMasuk: S.hari, terakhirGaji: S.hari
    };
    T.supir.push(sp);
    T.pelamar.splice(idx, 1);
    if (!T.pelamar.length) T.pelamar = buatPelamarSupir(S);
    var puas = kepuasanSupir(S, sp), mSp = mobilUntukSupir(S, sp);
    return { ok: true, teks: sp.nama + ' (' + sp.sim + ') resmi bekerja' + (mSp ? ' memakai ' + mSp.mobil.nama : '') + '! Kepuasan gaji: ' + puas + '% (' + labelPuasSupir(puas) + ').' };
  }
  function aturSupir(S, id, cfg) {
    var T = siapkan(S);
    var sp = T.supir.filter(function (x) { return x.id === id; })[0];
    if (!sp) return 'Supir tidak ditemukan.';
    if (cfg.mobilIdx != null) {
      var mi = +cfg.mobilIdx, listM = daftarMobilPenumpang(S), aktIdx = S.mobilAktif || 0;
      var adaCadangan = listM.some(function (x) { return x.idx !== aktIdx; });
      if (!listM.some(function (x) { return x.idx === mi; })) return 'Mobil penumpang tidak ditemukan.';
      if (adaCadangan && mi === aktIdx) return 'Mobil ini sedang jadi mobil utamamu! Pilih mobil lain untuk supir, atau ganti mobil utamamu dulu di Garasi.';
      sp.mobilIdx = mi;
    }
    if (cfg.periode) sp.periode = cfg.periode;
    if (cfg.gajiPokok != null && !isNaN(+cfg.gajiPokok)) sp.gajiPokok = Math.max(0, Math.round(+cfg.gajiPokok));
    if (cfg.uangMakan != null && !isNaN(+cfg.uangMakan)) sp.uangMakan = Math.max(0, Math.round(+cfg.uangMakan));
    if (cfg.insentif != null && !isNaN(+cfg.insentif)) sp.insentif = Math.max(0, Math.round(+cfg.insentif));
    if (cfg.bpjs != null) sp.bpjs = !!cfg.bpjs;
    if (cfg.ruteId != null) sp.ruteId = cfg.ruteId;
    if (cfg.aktif != null) sp.aktif = !!cfg.aktif;
    var puas = kepuasanSupir(S, sp), mSp2 = mobilUntukSupir(S, sp);
    var ruteInfo = cfg.ruteId != null ? (cfg.ruteId === 'otomatis' ? ' · rute: Otomatis' : ' · rute: ' + R.nama(cfg.ruteId)) : '';
    return { ok: true, teks: 'Pengaturan ' + sp.nama + (cfg.mobilIdx != null && mSp2 ? ' (mobil: ' + mSp2.mobil.nama + ')' : '') + ruteInfo + ' disimpan. Kepuasan: ' + puas + '% (' + labelPuasSupir(puas) + ').' };
  }
  function totalQrisSupir(S) {
    var T = S && S.travel;
    if (!T || !T.supir || !T.supir.length) return 0;
    return T.supir.reduce(function (a, sp) { return a + Math.max(0, sp.qrisSaldo || 0); }, 0);
  }
  function tarikQrisSupir(S, id) {
    var T = siapkan(S);
    if (!T.supir || !T.supir.length) return 'Belum ada karyawan Supir Travel.';
    if (id === 'semua') {
      var tot = 0, jmlSp = 0;
      T.supir.forEach(function (sp) {
        var sld = Math.max(0, Math.round(sp.qrisSaldo || 0));
        if (sld > 0) {
          sp.qrisSaldo = 0;
          sp.qrisRiwayat = sp.qrisRiwayat || [];
          sp.qrisRiwayat.unshift({ n: S.hari, ket: 'Ditarik ke Rekening Bank', jml: -sld });
          if (sp.qrisRiwayat.length > 25) sp.qrisRiwayat.length = 25;
          tot += sld; jmlSp++;
        }
      });
      if (tot <= 0) return 'Semua saldo QRIS Karyawan sedang Rp0.';
      S.bank.saldo += tot;
      M().catatBank(S, 'Tarik QRIS Karyawan Travel (' + jmlSp + ' supir)', tot);
      return { ok: true, jml: tot, teks: 'Berhasil tarik ' + rp(tot) + ' dari QRIS ' + jmlSp + ' karyawan travel ke rekening bank!' };
    }
    var sp = T.supir.filter(function (x) { return x.id === id; })[0];
    if (!sp) return 'Supir travel tidak ditemukan.';
    var sld = Math.max(0, Math.round(sp.qrisSaldo || 0));
    if (sld <= 0) return 'Saldo QRIS ' + sp.nama + ' masih Rp0.';
    sp.qrisSaldo = 0;
    sp.qrisRiwayat = sp.qrisRiwayat || [];
    sp.qrisRiwayat.unshift({ n: S.hari, ket: 'Ditarik ke Rekening Bank', jml: -sld });
    if (sp.qrisRiwayat.length > 25) sp.qrisRiwayat.length = 25;
    S.bank.saldo += sld;
    M().catatBank(S, 'Tarik QRIS Karyawan · ' + sp.nama, sld);
    return { ok: true, jml: sld, teks: 'Berhasil tarik ' + rp(sld) + ' dari QRIS ' + sp.nama + ' ke rekening bank!' };
  }
  function ruteUntukSupir(S) {
    var asal = S.kota, kAsal = R.kota[asal], out = [];
    Object.keys(R.kota).forEach(function (id) {
      if (id === asal) return;
      var j = R.jalur(asal, id);
      if (!j) return;
      var k = R.kota[id];
      out.push({ id: id, nama: k.nama, prov: k.prov || k.pulau, pulau: k.pulau, samaPulau: !!(kAsal && k.pulau === kAsal.pulau), km: j.km, tarif: R.tarifStandar(j) });
    });
    out.sort(function (a, b) {
      if (a.samaPulau !== b.samaPulau) return a.samaPulau ? -1 : 1;
      return a.km - b.km;
    });
    return out;
  }
  function pecatSupir(S, id) {
    var T = siapkan(S);
    var sp = T.supir.filter(function (x) { return x.id === id; })[0];
    if (!sp) return 'Supir tidak ditemukan.';
    var sisaQ = Math.max(0, Math.round(sp.qrisSaldo || 0));
    if (sisaQ > 0) {
      S.bank.saldo += sisaQ;
      M().catatBank(S, 'Sisa QRIS Karyawan · ' + sp.nama, sisaQ);
    }
    T.supir = T.supir.filter(function (x) { return x.id !== id; });
    return { ok: true, teks: sp.nama + ' diberhentikan dari tugas Supir Travel.' + (sisaQ > 0 ? ' Sisa QRIS ' + rp(sisaQ) + ' otomatis ditarik ke rekening bank.' : '') };
  }
  function gantiHari(S, nLama, nBaru) {
    var T = siapkan(S), kabar = [];
    if (!T.supir || !T.supir.length) return kabar;
    var tB = g.KK_KAL.tgl(nBaru), gantiBulan = tB.d === 1;
    sinkronMobilSupir(S);
    var pemainPakaiMobil = !!(T.aktif || (S.ojek && S.ojek.online && S.ojek.mode === 'mobil'));
    for (var i = T.supir.length - 1; i >= 0; i--) {
      var sp = T.supir[i], puas = kepuasanSupir(S, sp);
      if (puas < 30 && Math.random() < 0.25) {
        var sisaQResign = Math.max(0, Math.round(sp.qrisSaldo || 0));
        if (sisaQResign > 0) {
          S.bank.saldo += sisaQResign;
          M().catatBank(S, 'Sisa QRIS Karyawan (Resign) · ' + sp.nama, sisaQResign, nBaru);
        }
        kabar.push('⚠️ Supir travel ' + sp.nama + ' mengundurkan diri (resign) karena gaji terlalu kecil (kepuasan ' + puas + '%).' + (sisaQResign > 0 ? ' Sisa QRIS ' + rp(sisaQResign) + ' otomatis ditarik ke rekening.' : ''));
        T.supir.splice(i, 1);
        continue;
      }
      var resM = mobilUntukSupir(S, sp);
      var m = resM && (!resM.berbagi || !pemainPakaiMobil) ? resM.mobil : null;
      if (sp.aktif && m) {
        /* pilih rute pilihan supir atau otomatis di pulau yang sama; reset otomatis jika kota pindah pulau & rute lama tak terjangkau */
        var asal = S.kota, tujuanId = sp.ruteId && sp.ruteId !== 'otomatis' && R.kota[sp.ruteId] ? sp.ruteId : null;
        if (tujuanId && (tujuanId === asal || !R.jalur(asal, tujuanId))) {
          sp.ruteId = 'otomatis';
          tujuanId = null;
        }
        if (!tujuanId) {
          var cand = Object.keys(R.kota).filter(function (id) { return id !== asal && R.kota[id].pulau === (R.kota[asal] && R.kota[asal].pulau) && !!R.jalur(asal, id); });
          if (!cand.length) cand = Object.keys(R.kota).filter(function (id) { return id !== asal && !!R.jalur(asal, id); });
          tujuanId = cand[Math.floor(Math.random() * cand.length)];
        }
        var j = tujuanId ? R.jalur(asal, tujuanId) : null;
        if (j) {
          var tripHari = puas >= 75 ? (Math.random() < 0.5 ? 2 : 1) : (puas >= 45 ? 1 : (Math.random() < 0.55 ? 1 : 0));
          if (tripHari > 0) {
            var krs = kursi(S, m) || Math.max(2, (m.bentuk === 'mpv' ? 6 : m.bentuk === 'suv' ? 5 : 4));
            var pnp = Math.max(1, Math.round(krs * (0.55 + Math.random() * 0.45)));
            var tf = Math.round(R.tarifStandar(j) * (T.mult || 1) / 1000) * 1000;
            var kotor = pnp * tf * tripHari;
            var bbmRp = Math.round((j.km / (m.kml || 12)) * M().hargaBbm(S, m.bbm) * tripHari);
            var tolRp = (j.tol || 0) * tripHari;
            var upahJalan = (sp.periode === 'jalan' ? sp.gajiPokok * tripHari : 0) + (sp.uangMakan || 0) + (sp.insentif || 0) * tripHari;
            var bersih = kotor - bbmRp - tolRp - upahJalan;
            sp.qrisRiwayat = sp.qrisRiwayat || [];
            if (bersih >= 0) {
              sp.qrisSaldo = (sp.qrisSaldo || 0) + bersih;
              sp.qrisRiwayat.unshift({ n: nBaru, ket: tripHari + '× ' + R.nama(tujuanId) + ' (' + pnp + ' pnp · ' + m.nama + ')', jml: bersih });
            } else {
              var tutupQris = Math.min(sp.qrisSaldo || 0, -bersih);
              sp.qrisSaldo = (sp.qrisSaldo || 0) - tutupQris;
              var sisaRugi = (-bersih) - tutupQris;
              if (sisaRugi > 0) { S.bank.saldo -= sisaRugi; M().catatBank(S, 'Defisit operasional Supir ' + sp.nama + ' [' + m.nama + ']', -sisaRugi, nBaru); }
              sp.qrisRiwayat.unshift({ n: nBaru, ket: 'Defisit ' + tripHari + '× ' + R.nama(tujuanId) + ' (' + m.nama + ')', jml: bersih });
            }
            if (sp.qrisRiwayat.length > 25) sp.qrisRiwayat.length = 25;
            m.km = (m.km || 0) + Math.round(j.km * tripHari);
            m.totalHasil = (m.totalHasil || 0) + Math.max(0, bersih);
            S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + Math.max(0, bersih);
            if (S.hariIni) S.hariIni.travel = (S.hariIni.travel || 0) + Math.max(0, bersih);
            T.total.trip += tripHari; T.total.bersih += bersih; T.total.km += Math.round(j.km * tripHari);
            sp.totalTrip = (sp.totalTrip || 0) + tripHari; sp.totalBersih = (sp.totalBersih || 0) + bersih;
            kabar.push('🚐 Supir ' + sp.nama + ' (pakai ' + m.nama + ') narik ke ' + R.nama(tujuanId) + ' (' + tripHari + ' trip, ' + pnp + ' pnp): bersih ' + rp(bersih) + ' masuk ke QRIS Karyawan.');
          } else {
            kabar.push('Supir ' + sp.nama + ' bolos hari ini karena kurang puas dengan gaji (' + puas + '%).');
          }
        }
      }
      /* gaji mingguan */
      if (sp.periode === 'minggu' && (nBaru - (sp.terakhirGaji || sp.hariMasuk || 0)) >= 7) {
        sp.terakhirGaji = nBaru;
        if (S.bank.saldo >= sp.gajiPokok) {
          S.bank.saldo -= sp.gajiPokok; M().catatBank(S, 'Gaji mingguan supir ' + sp.nama, -sp.gajiPokok, nBaru);
          kabar.push('Gaji mingguan supir travel ' + sp.nama + ' (' + rp(sp.gajiPokok) + ') dibayar.');
        } else {
          kabar.push('⚠️ Saldo kurang untuk gaji mingguan supir ' + sp.nama + ' (' + rp(sp.gajiPokok) + ')!');
        }
      }
      /* gaji bulanan + BPJS supir */
      if (gantiBulan) {
        if (sp.periode === 'bulan' && sp.gajiPokok > 0) {
          if (S.bank.saldo >= sp.gajiPokok) {
            S.bank.saldo -= sp.gajiPokok; M().catatBank(S, 'Gaji bulanan supir ' + sp.nama, -sp.gajiPokok, nBaru);
            kabar.push('Gaji bulanan supir travel ' + sp.nama + ' (' + rp(sp.gajiPokok) + ') dibayar.');
          } else {
            kabar.push('⚠️ Saldo kurang untuk gaji bulanan supir ' + sp.nama + ' (' + rp(sp.gajiPokok) + ')!');
          }
        }
        if (sp.bpjs) {
          var bjs = 250000;
          if (S.bank.saldo >= bjs) {
            S.bank.saldo -= bjs; M().catatBank(S, 'BPJS Supir Travel ' + sp.nama, -bjs, nBaru);
          }
        }
      }
    }
    return kabar;
  }
  function kursi(S, unit) {
    var m = unit || (S && S.mobil);
    if (!m || !g.KK_MOBIL || m.bentuk === 'pikap') return 0;
    return Math.max(0, g.KK_MOBIL.kapasitasPenumpang(S, m) - 1); /* satu kursi untuk sopir */
  }
  function gigiObj(n, S) { return R.gigiInfo ? R.gigiInfo(S, 'mobil', Math.max(1, Math.min(5, n))) : R.gigi[Math.max(1, Math.min(5, n)) - 1]; }
  function hujan(S) { return !!(g.KK_DUNIA && g.KK_DUNIA.hujanSekarang(S)); }
  function malam(S) { var m = S.menit % 1440; return m >= 1320 || m < 300; }
  function bolehKhusus(S) { return !hujan(S) && !!S.mobil; }

  /* ---------- uang ---------- */
  function dana(S) { return Math.max(0, S.bank.saldo) + Math.max(0, S.uang.dompet || 0); }
  function bayar(S, jml, ket) {
    jml = Math.round(jml); if (jml <= 0) return 0;
    var sisa = jml, dariBank = Math.min(Math.max(0, S.bank.saldo), sisa);
    if (dariBank > 0) { S.bank.saldo -= dariBank; M().catatBank(S, ket, -dariBank); sisa -= dariBank; }
    var d = Math.min(Math.max(0, S.uang.dompet || 0), sisa); S.uang.dompet -= d; sisa -= d;
    return jml - sisa;
  }

  /* ---------- perhitungan kecepatan realistis per ruas (dipakai seragam oleh rencana, jalan, estimasi, dan ideal) ---------- */
  function kecepatanRuas(S, r, levelGigi, pakaiVariasi, kenaHujan) {
    var n = Math.max(1, Math.min(5, levelGigi || 3)), ket = '', m = S.mobil;
    var isHujan = kenaHujan != null ? !!kenaHujan : hujan(S);
    if (isHujan && n > 4) { n = 4; ket = 'Hujan deras: dibatasi level 4.'; }
    var gi = gigiObj(n, S);
    var v = pakaiVariasi
      ? gi.lo + (gi.hi - gi.lo) * (0.5 + 0.16 * Math.sin(S.menit / 5))
      : (gi.lo + gi.hi) / 2;
    var vmax = R.vmaxKendaraan ? R.vmaxKendaraan(S, 'mobil') : (R.vmax[m ? m.bentuk : 'mpv'] || 170);
    if (v > vmax) v = vmax;
    var kdJ = R.infoKondisi ? R.infoKondisi(r) : { faktorV: 0.76, vMaxJalan: 92, nama: 'Aspal Mulus' };
    var fK = kdJ.faktorV * (r && r.kondisi === 'tanah' && isHujan ? 0.72 : isHujan ? 0.88 : 1);
    v *= fK;
    var batasJalan = (kdJ.vMaxJalan || 92) * (r && r.kondisi === 'tanah' && isHujan ? 0.72 : isHujan ? 0.88 : 1);
    if (v > batasJalan) v = batasJalan;
    if (r && (r.kondisi === 'tanah' || r.kondisi === 'rusak' || r.kondisi === 'bergelombang')) {
      ket = kdJ.nama + (r.kondisi === 'tanah' && isHujan ? ' (becek lumpur!)' : '');
    }
    return { kmh: Math.max(6, v), gigi: n, ket: ket, batasJalan: batasJalan };
  }

  /* ---------- rencana perjalanan ---------- */
  function rencana(S, tujuan) {
    var T = siapkan(S), j = R.jalur(T.di || S.kota, tujuan); if (!j) return null;
    var m = S.mobil, gi = gigiObj(T.gigi, S), std = R.tarifStandar(j), pnp = Math.max(1, T.antri.length);
    var laut = 0, jamLaut = 0, kondisiTerburuk = 'mulus', bobotKond = { tol: 0, mulus: 1, bergelombang: 2, rusak: 3, tanah: 4 };
    var jamDarat = 0, liter = 0;
    j.ruas.forEach(function (r, idxR) {
      if (r.laut) { laut += r.kapalMobil + r.kapalOrang * pnp; jamLaut += r.jam + 1; return; }
      var kd = R.infoKondisi ? R.infoKondisi(r) : { faktorV: 0.76, vMaxJalan: 92, boros: 1 };
      var kId = r.kondisi || (r.tol > 0 ? 'tol' : 'mulus');
      if ((bobotKond[kId] || 1) > (bobotKond[kondisiTerburuk] || 1)) kondisiTerburuk = kId;
      var vr = kecepatanRuas(S, r, T.gigi, false, false);
      /* perhitungkan perlambatan keluar/masuk kota ramai (~14 km di ujung ruas jika kota ramai) */
      var kA = R.kota[j.simpul[idxR]], kB = R.kota[j.simpul[idxR + 1]];
      var kmPadat = Math.min(r.km, ((kA && kA.ramai >= 1.1) ? Math.min(14, r.km / 2) : 0) + ((kB && kB.ramai >= 1.1) ? Math.min(14, r.km / 2) : 0));
      var kmLancar = Math.max(0, r.km - kmPadat);
      jamDarat += kmLancar / vr.kmh + kmPadat / Math.max(6, vr.kmh * 0.72);
      if (m) liter += (r.km / m.kml) * gi.boros * kd.boros;
    });
    var jamJalan = jamDarat + jamLaut;
    var bbm = m ? M().hargaBbm(S, m.bbm) : 0;
    var namaJalanUtama = j.ruas[0] && j.ruas[0].jalan ? j.ruas[0].jalan : '';
    return { jalur: j, km: j.km, tol: j.tol, laut: laut, tarifStd: std, tarif: Math.round(std * T.mult / 1000) * 1000, jam: jamJalan, liter: liter, biayaBbm: Math.round(liter * bbm), nama: R.nama(tujuan), kondisi: kondisiTerburuk, namaJalan: namaJalanUtama };
  }

  /* ---------- penumpang datang ---------- */
  function laju(S, tujuan) {
    var T = S.travel, j = R.jalur(T.di, tujuan); if (!j) return 0;
    var jam = Math.floor(S.menit / 60) % 24, pop = (R.kota[T.di].ramai + R.kota[tujuan].ramai) / 2;
    var jarak = j.km < 150 ? 1.2 : j.km < 400 ? 1 : j.km < 900 ? 0.7 : 0.4;
    var nyaman = R.nyaman ? R.nyaman(S.mobil, 'mobil') : 1;
    var harga = Math.pow(nyaman / T.mult, 1.6), mutu = 0.6 + T.rating * 0.1;
    return 1.3 * JAM_RAMAI[jam] * pop * jarak * harga * mutu * (hujan(S) ? 0.85 : 1) * g.KK_DIRI.faktorPromo(S);
  }
  function jeda(S, tujuan) { var l = Math.max(0.05, laju(S, tujuan)); return Math.max(2, -Math.log(1 - Math.random()) * 60 / l); }
  function penumpangBaru(S) {
    var r = Math.random(), tipe = r < 0.25 ? 'cepat' : r < 0.5 ? 'santai' : 'biasa';
    return { nama: N.namaOrang[Math.floor(Math.random() * N.namaOrang.length)], tipe: tipe, naik: waktu(S) };
  }
  function bisaMulai(S) {
    if (!S.mobil) return 'Travel butuh mobil. Beli mobil keluarga atau MPV dulu di aplikasi Kendaraan.';
    if (kursi(S) < 2) return 'Mobil ini kurang cocok untuk travel (kursi penumpang kurang dari 2). Pakai hatchback, sedan, MPV, atau SUV.';
    if (S.ojek && S.ojek.online) return 'Berhenti narik ojol dulu.';
    if (!(S.usaha && S.usaha.berhentiSewa) && S.fase === 'buka') return 'Tutup kedai dulu sebelum jalan.';
    if (S.mobil.kredit && S.mobil.kredit.tunggakan > 0) return 'Mobil masih menunggak cicilan. Lunasi tunggakan dulu.';
    return null;
  }
  function mulai(S) {
    var e = bisaMulai(S); if (e) return e;
    var T = siapkan(S); T.aktif = true; T.di = S.kota; T.status = 'tunggu'; T.tujuan = null; T.antri = []; T.jemput = 0; T.trip = null;
    return true;
  }
  function selesaiParkir(S, paksa) {
    var T = siapkan(S);
    if (T.status === 'jalan' || T.status === 'kapal') return 'Mobil sedang di jalan.';
    var punyaRumahDiSini = !!(S.properti && S.properti.daftarRumah && S.properti.daftarRumah.some(function (r) { return r.status === 'siap' && r.kota === T.di; }));
    if (!paksa && T.di !== S.kota && !punyaRumahDiSini) return 'Kamu masih di ' + R.nama(T.di) + '. Pulang dulu ke ' + R.nama(S.kota) + ' atau tekan Pulang ke Kota Asal.';
    T.aktif = false; T.di = S.kota; T.antri = []; T.tujuan = null; return true;
  }
  function pilihTujuan(S, id) {
    var T = siapkan(S); if (T.status !== 'tunggu') return 'Mobil sedang di jalan.';
    if (!R.kota[id] || id === T.di) return 'Tujuan tidak valid.';
    if (T.tujuan !== id) { T.tujuan = id; T.antri = []; T.jemput = 0; T.berikut = waktu(S) + jeda(S, id); }
    return true;
  }
  function ubahTarif(S, delta) {
    var T = siapkan(S); T.mult = Math.round(Math.max(MULT_MIN, Math.min(MULT_MAKS, T.mult + delta)) * 100) / 100; return true;
  }
  function jemput(S) {
    var T = siapkan(S);
    if (T.status !== 'tunggu' || !T.tujuan) return 'Pilih tujuan dulu.';
    if (T.antri.length >= kursi(S)) return 'Kursi sudah penuh.';
    if (T.jemput >= JEMPUT_MAKS) return 'Sudah menjemput ' + JEMPUT_MAKS + ' penumpang. Setelah itu langsung berangkat.';
    if (!g.KK_MOBIL.cukup(S, 4)) return 'Bensin tidak cukup untuk menjemput. Isi dulu.';
    var m = S.mobil; m.isi = Math.max(0, m.isi - 4 / m.kml / m.tangki); m.km += 4; T.jemput++;
    T.antri.push(penumpangBaru(S));
    return { ok: true, menit: 25, teks: 'Menjemput ' + T.antri[T.antri.length - 1].nama + ' di rumahnya. Kursi terisi ' + T.antri.length + '/' + kursi(S) + '.' };
  }

  /* ---------- berangkat ---------- */
  function berangkat(S) {
    var T = siapkan(S); if (T.status !== 'tunggu') return 'Mobil sedang di jalan.';
    if (!T.tujuan) return 'Pilih tujuan dulu.';
    var e = bisaMulai(S); if (e) return e;
    var rc = rencana(S, T.tujuan); if (!rc) return 'Rute tidak ditemukan.';
    var wajib = rc.tol + rc.laut;
    if (dana(S) < wajib) return 'Uang untuk tol dan kapal kurang. Butuh sekitar ' + rp(wajib) + '.';
    if (S.diri.stamina < 12) return 'Kamu terlalu capek dan ngantuk untuk menyetir jauh. Istirahat dulu.';
    var m = S.mobil;
    if (m.isi * m.tangki < 3) return m.bbm === 'listrik' ? 'Baterai mobil listrik hampir habis. Cas dulu di aplikasi Kendaraan.' : 'Bensin hampir habis. Isi dulu di aplikasi Kendaraan.';
    var pnp = T.antri.length;
    T.trip = { dari: T.di, ke: T.tujuan, simpul: rc.jalur.simpul, ruas: rc.jalur.ruas, km: rc.km, idx: 0, kmRuas: 0, kmSelesai: 0, mulai: waktu(S), menitGerak: 0, menitHenti: 0, sisaKapal: 0,
      gigiMenit: [0, 0, 0, 0, 0, 0, 0], tarifKursi: rc.tarif, tol: 0, kapal: 0, penalti: 0, penaltiTipe: { cepat: 0, santai: 0, biasa: 0 }, kejadian: [], bensin0: m.isi * m.tangki, bensinTerpakai: 0, peringatan: false, tolAsal: rc.tol };
    T.status = 'jalan';
    var kabar = masukRuas(S);
    return { ok: true, kabar: kabar, teks: pnp ? 'Berangkat ke ' + rc.nama + ' bersama ' + pnp + ' penumpang.' : 'Berangkat ke ' + rc.nama + ' tanpa penumpang.' };
  }
  function masukRuas(S) {
    var T = S.travel, tr = T.trip, r = tr.ruas[tr.idx], kabar = [], pnp = T.antri.length;
    tr.kmRuas = 0;
    if (r.laut) {
      var b = r.kapalMobil + r.kapalOrang * pnp, p = bayar(S, b, 'Kapal ' + R.nama(tr.simpul[tr.idx]) + ' ke ' + R.nama(tr.simpul[tr.idx + 1]));
      tr.kapal += p; tr.sisaKapal = (r.jam + 1) * 60; T.status = 'kapal';
      kabar.push('Naik kapal penyeberangan ' + R.nama(tr.simpul[tr.idx]) + ' – ' + R.nama(tr.simpul[tr.idx + 1]) + '. Tiket mobil dan ' + pnp + ' penumpang ' + rp(p) + '.');
    } else {
      T.status = 'jalan';
      if (r.tol > 0) { var pt = bayar(S, r.tol, 'Tol ' + R.nama(tr.simpul[tr.idx]) + ' – ' + R.nama(tr.simpul[tr.idx + 1])); tr.tol += pt; kabar.push('Masuk tol, bayar ' + rp(pt) + '.'); }
    }
    return kabar;
  }

  /* ---------- kecepatan ---------- */
  function macet(S) {
    var T = S.travel, tr = T.trip; if (!tr) return 1;
    var r = tr.ruas[tr.idx], sisa = r.km - tr.kmRuas, dekat = Math.min(tr.kmRuas, sisa);
    var kotaDekat = tr.kmRuas < sisa ? tr.simpul[tr.idx] : tr.simpul[tr.idx + 1], ramai = R.kota[kotaDekat].ramai;
    if (dekat > 14 || ramai < 1.1) return 1;
    var jam = (S.menit % 1440) / 60, sibuk = (jam >= 6 && jam < 9.5) || (jam >= 16 && jam < 19.5);
    return sibuk ? 0.45 : 0.75;
  }
  function kecepatan(S) {
    var T = siapkan(S), rJalan = T.trip ? T.trip.ruas[T.trip.idx] : null;
    var res = kecepatanRuas(S, rJalan, T.gigi || 3, true);
    var v = res.kmh, ket = res.ket;
    var mc = macet(S);
    if (mc < 1) { v *= mc; if (!ket) ket = mc < 0.5 ? 'Macet parah masuk kota.' : 'Jalan padat masuk kota.'; }
    return { kmh: Math.max(6, v), gigi: res.gigi, ket: ket, batasJalan: res.batasJalan };
  }
  function setGigi(S, n) {
    var T = siapkan(S); n = +n; if (n < 1 || n > 5) return 'Level kecepatan 1–5.';
    if (hujan(S) && n > 4) return 'Hujan deras: paling cepat level 4.';
    T.gigi = n; return true;
  }

  /* ---------- selama jalan ---------- */
  function tambahKejadian(T, teks, denda, menit, penalti) {
    var tr = T.trip; tr.kejadian.push(teks); tr.penalti += penalti || 0; tr.menitHenti += menit || 0; T.lompat += menit || 0;
  }
  function langkahJalan(S, dMenit) {
    var T = S.travel, tr = T.trip, m = S.mobil, kabar = [];
    if (!m) { T.status = 'tunggu'; T.trip = null; return ['Mobil tidak ada, perjalanan dibatalkan.']; }
    var r = tr.ruas[tr.idx], kdR = R.infoKondisi ? R.infoKondisi(r) : { boros: 1, risikoBan: 1 }, v = kecepatan(S), gi = gigiObj(v.gigi, S), km = Math.min(v.kmh * dMenit / 60, r.km - tr.kmRuas);
    var liter = km / m.kml * gi.boros * (kdR.boros || 1) * (m.ngelitik ? 1.08 : 1);
    var evM = m.bbm === 'listrik';
    if (m.isi * m.tangki < liter + 0.2) {
      var derek = Math.min(750000, dana(S)); var bayarDerek = bayar(S, derek, evM ? 'Derek dan cas darurat' : 'Derek dan bensin darurat');
      m.isi = Math.min(1, m.isi + 8 / m.tangki); tambahKejadian(T, (evM ? 'Baterai habis di jalan. Derek dan cas darurat ' : 'Bensin habis di jalan. Derek dan bensin darurat ') + rp(bayarDerek) + '.', bayarDerek, 90, 0.7);
      kabar.push((evM ? 'Baterai mobil listrik habis di jalan. Derek dan cas darurat ' : 'Bensin habis di jalan. Derek dan beli bensin darurat ') + rp(bayarDerek) + ', telat sekitar 1,5 jam.'); return kabar;
    }
    m.isi = Math.max(0, m.isi - liter / m.tangki); tr.bensinTerpakai = (tr.bensinTerpakai || 0) + liter; m.km += km; tr.kmRuas += km; tr.kmSelesai += km; tr.menitGerak += dMenit; tr.gigiMenit[v.gigi] += dMenit;
    if (!tr.peringatan && m.isi < 0.12) { tr.peringatan = true; kabar.push(evM ? 'Daya baterai tinggal sedikit. Tekan Berhenti untuk cas di SPKLU.' : 'Bensin tinggal sedikit. Tekan Berhenti untuk isi di SPBU.'); }
    if (m.isi > 0.3) tr.peringatan = false;
    var jamFrac = dMenit / 60, r2 = Math.random();
    var ngebutBatas = v.gigi === 5 && (v.kmh > 115 || (r.tol <= 0 && v.kmh >= (v.batasJalan || 90) * 0.92));
    if (ngebutBatas && r2 < 0.02 * jamFrac) {
      var denda = bayar(S, 500000, 'Tilang kecepatan'); tambahKejadian(T, 'Kena tilang karena ngebut. Denda ' + rp(denda) + '.', denda, 15, 0.6);
      kabar.push('Kena tilang ngebut, denda ' + rp(denda) + '.');
    } else if (ngebutBatas && r2 < 0.028 * jamFrac) {
      var rusak = bayar(S, 2000000, 'Perbaikan senggolan jalan'); tambahKejadian(T, 'Senggolan saat ngebut. Perbaikan ' + rp(rusak) + '.', rusak, 40, 2);
      kabar.push('Mobil menyenggol pembatas saat ngebut. Perbaikan ' + rp(rusak) + '.');
    } else if (r2 < (0.004 * (kdR.risikoBan || 1) + (g.KK_MOBIL.telatServis(S) / 1000) * 0.01) * jamFrac) {
      var ban = 150000 + Math.floor(Math.random() * 3) * 100000, pb = bayar(S, ban, 'Tambal ban dan bengkel'); tambahKejadian(T, 'Ban bocor, tambal dan bengkel ' + rp(pb) + '.', pb, 45, 0.5);
      kabar.push('Ban bocor di jalan. Tambal dan bengkel ' + rp(pb) + ', telat 45 menit.');
    }
    var d = S.diri, w = waktu(S);
    if (w >= (T.peringatanLagi || 0) && (d.kenyang < 22 || d.minum < 22)) { T.peringatanLagi = w + 150; kabar.push((d.minum < d.kenyang ? 'Kamu mulai haus.' : 'Kamu mulai lapar.') + ' Berhenti di rumah makan.'); }
    /* henti otomatis sebelum badan ambruk (sebelum sistem ketiduran bekerja) */
    if (w >= (T.jedaAuto || 0)) {
      var auto = d.kenyang <= 6 || d.minum <= 6 ? 'makan' : d.stamina < 14 ? 'rehat' : null;
      if (auto) {
        var h = ISTI(S, auto); if (!(h && h.ok) && auto === 'makan') h = ISTI(S, 'menepi');
        if (h && h.ok) { T.lompat += h.menit; kabar.push('Kamu berhenti otomatis: ' + h.teks); }
        T.jedaAuto = w + ((h && h.ok) ? h.menit : 0) + 45;
        return kabar;
      }
    }
    if (tr.kmRuas >= r.km - 1e-6) {
      tr.idx++;
      if (tr.idx >= tr.ruas.length) return kabar.concat(selesaiTrip(S));
      kabar.push('Tiba di ' + R.nama(tr.simpul[tr.idx]) + '.'); kabar = kabar.concat(masukRuas(S));
    }
    return kabar;
  }
  function langkahKapal(S, dMenit) {
    var T = S.travel, tr = T.trip, kabar = [], d = S.diri;
    tr.sisaKapal -= dMenit; tr.menitGerak += dMenit;
    d.stamina = Math.min(100, d.stamina + dMenit * 0.18); /* tidur di kapal */
    if (tr.sisaKapal <= 0) {
      tr.kmSelesai += tr.ruas[tr.idx].km; tr.idx++; T.status = 'jalan';
      if (tr.idx >= tr.ruas.length) return selesaiTrip(S);
      kabar.push('Kapal sandar di ' + R.nama(tr.simpul[tr.idx]) + '.'); kabar = kabar.concat(masukRuas(S));
    }
    return kabar;
  }
  function jalan(S, dMenit) {
    var T = S.travel; if (!T || !T.aktif) return [];
    if (T.status === 'tunggu') {
      if (T.tujuan && T.antri.length < kursi(S) && waktu(S) >= T.berikut) { T.antri.push(penumpangBaru(S)); T.berikut = waktu(S) + jeda(S, T.tujuan); }
      return [];
    }
    if (!T.trip) { T.status = 'tunggu'; return []; }
    return T.status === 'kapal' ? langkahKapal(S, dMenit) : langkahJalan(S, dMenit);
  }

  /* ---------- istirahat ---------- */
  function ISTI(S, jenis) {
    var T = siapkan(S), x = R.istirahat[jenis], d = S.diri; if (!x) return 'Pilihan tidak ada.';
    var pnp = T.antri.length, tr = T.trip && T.status !== 'tunggu';
    if (T.status === 'kapal') return 'Kamu sedang di kapal. Tidur saja, badan otomatis pulih.';
    if (jenis === 'penginapan' && tr && pnp) {
      if (!T.konfirmasiInap) { T.konfirmasiInap = true; return 'Ada ' + pnp + ' penumpang di mobil. Menginap 7 jam membuat mereka kesal dan nilai turun. Tekan lagi untuk tetap menginap.'; }
    }
    T.konfirmasiInap = false;
    if (x.biaya > 0) { if (dana(S) < x.biaya) return 'Uang tidak cukup (' + rp(x.biaya) + ').'; bayar(S, x.biaya, jenis === 'makan' ? 'Makan di rumah makan' : x.nama); }
    if (x.kenyang) d.kenyang = Math.min(100, d.kenyang + x.kenyang); if (x.minum) d.minum = Math.min(100, d.minum + x.minum);
    d.stamina = Math.min(100, d.stamina + (x.stamina || 0) + (x.melek || 0));
    if (tr) {
      var t2 = T.trip; t2.menitHenti += x.menit;
      if (pnp) {
        if (jenis === 'penginapan') { t2.penalti += 1.5; t2.kejadian.push('Menginap 7 jam di tengah perjalanan.'); }
        else if (jenis === 'rehat') { t2.penaltiTipe.cepat += 1.5; t2.penaltiTipe.biasa += 0.4; }
        else if (jenis === 'makan') { t2.penalti -= 0.2; }
      }
    }
    return { ok: true, menit: x.menit, teks: x.nama + ' selesai (' + (x.menit >= 60 ? (x.menit / 60).toLocaleString('id-ID') + ' jam' : x.menit + ' menit') + (x.biaya ? ', ' + rp(x.biaya) : '') + ').' };
  }
  function istirahat(S, jenis) { return ISTI(S, jenis); }
  function isiBensin(S, liter) {
    var m = S.mobil; if (!m) return 'Belum punya mobil.';
    var r = g.KK_MOBIL.isiBensin(S, m.bbm, liter); if (!r || !r.ok) return r;
    if (S.travel.trip) S.travel.trip.menitHenti += 10;
    return { ok: true, menit: 10, teks: (m.bbm === 'listrik' ? 'Cas ' : 'Isi ') + r.liter.toLocaleString('id-ID') + (m.bbm === 'listrik' ? ' kWh, ' : ' liter, ') + rp(r.biaya) + '.' };
  }

  /* ---------- tiba dan penilaian ---------- */
  function selesaiTrip(S) {
    var T = S.travel, tr = T.trip, kabar = [], pnp = T.antri.length, total = 0, tip = 0, sumNilai = 0, rinci = [];
    var menitTotal = (waktu(S) - tr.mulai) + (T.lompat || 0); if (menitTotal < 1) menitTotal = tr.menitGerak + tr.menitHenti;
    /* waktu tempuh ideal sesuai kondisi jalan & kapal sebenarnya (patokan Level 4) */
    var jamIdeal = 0;
    tr.ruas.forEach(function (rr) {
      if (rr.laut) jamIdeal += rr.jam + 1;
      else jamIdeal += rr.km / kecepatanRuas(S, rr, 4, false, false).kmh;
    });
    var ideal = Math.max(30, jamIdeal * 60), telat = menitTotal / ideal;
    var gm = tr.gigiMenit, gerak = Math.max(1, tr.menitGerak), pangsa5 = (gm[5] + gm[6]) / gerak, pangsa6 = gm[6] / gerak, pangsa1 = (gm[1] + gm[2]) / gerak;
    T.antri.forEach(function (p) {
      var n = 5 - tr.penalti - (tr.penaltiTipe[p.tipe] || 0), bayarKursi = tr.tarifKursi, ket = '';
      if (p.tipe === 'cepat') {
        if (telat > 1.2) { n -= Math.min(3, (telat - 1.2) * 6); ket = 'minta cepat, merasa kelamaan'; }
        else { bayarKursi = Math.round(bayarKursi * 1.2 / 1000) * 1000; ket = 'minta cepat, puas (+20%)'; }
      } else if (p.tipe === 'santai') {
        if (pangsa5 > 0.45) { n -= Math.min(2, pangsa5 * 3); ket = 'minta santai, kurang nyaman karena ngebut'; }
        else { ket = 'minta santai, nyaman'; if (n >= 4.5) { var tp = Math.round(bayarKursi * 0.05 / 1000) * 1000; tip += tp; } }
      } else {
        if (telat > 1.8) { n -= 1; ket = 'merasa kelamaan'; }
        if (pangsa5 > 0.6) n -= 0.8;
      }
      n = Math.max(1, Math.min(5, n)); sumNilai += n; total += bayarKursi; rinci.push({ nama: p.nama, tipe: p.tipe, nilai: Math.round(n * 10) / 10, bayar: bayarKursi, ket: ket });
    });
    var tujuan = tr.ke, dari = tr.dari, bensin = tr.bensinTerpakai > 0 ? tr.bensinTerpakai : Math.max(0, tr.bensin0 - S.mobil.isi * S.mobil.tangki);
    var biayaPerjalanan = tr.tol + tr.kapal;
    if (pnp) {
      var bersihBayar = total + tip, bayarTunai = 0, bayarQris = 0;
      rinci.forEach(function (p) {
        if (Math.random() < 0.5 || !(g.KK_UANG && g.KK_UANG.terimaQris)) bayarTunai += p.bayar;
        else bayarQris += p.bayar;
      });
      bayarTunai += tip;
      if (bayarTunai > 0) S.uang.dompet = (S.uang.dompet || 0) + bayarTunai;
      if (bayarQris > 0 && g.KK_UANG && g.KK_UANG.terimaQris) g.KK_UANG.terimaQris(S, bayarQris);
      var avg = sumNilai / pnp; T.rating = Math.round((T.rating * (1 - 0.12 * Math.min(1, pnp / 3)) + avg * 0.12 * Math.min(1, pnp / 3)) * 100) / 100;
      T.hariIni.trip++; T.hariIni.bersih += bersihBayar - biayaPerjalanan; T.total.trip++; T.total.bersih += bersihBayar - biayaPerjalanan;
      S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + Math.max(0, bersihBayar - biayaPerjalanan);
      if (S.mobil) S.mobil.totalHasil = (S.mobil.totalHasil || 0) + Math.max(0, bersihBayar - biayaPerjalanan);
    }
    T.total.km += tr.km;
    S.hariIni.travel = (S.hariIni.travel || 0) + (pnp ? total + tip - biayaPerjalanan : -biayaPerjalanan);
    T.laporan = { dari: dari, ke: tujuan, km: tr.km, menit: Math.round(menitTotal), penumpang: rinci, pendapatan: total, tip: tip, tunai: bayarTunai || 0, qris: bayarQris || 0, tol: tr.tol, kapal: tr.kapal, bensinLiter: Math.round(bensin * 10) / 10, ev: !!(S.mobil && S.mobil.bbm === 'listrik'),
      kejadian: tr.kejadian.slice(), rating: T.rating, hari: S.hari };
    kabar.push('Tiba di ' + R.nama(tujuan) + (pnp ? '. Pendapatan ' + rp(total + tip) + ' (Tunai ' + rp(bayarTunai || 0) + ', QRIS ' + rp(bayarQris || 0) + ' cair besok).' : '.'));
    T.di = tujuan; T.status = 'tunggu'; T.trip = null; T.antri = []; T.tujuan = null; T.jemput = 0; T.berikut = 0;
    return kabar;
  }

  /* ---------- untuk adegan dan HUD ---------- */
  function fase(S) {
    var T = S.travel; if (!T || !T.aktif) return null;
    var di = R.kota[T.di] || R.kota[S.kota];
    if (T.status === 'tunggu') return { mode: 'kota', kota: T.di, tema: di.tema, penumpang: T.antri.length, kursi: kursi(S), tujuan: T.tujuan };
    var tr = T.trip; if (!tr) return { mode: 'kota', kota: T.di, tema: di.tema, penumpang: 0, kursi: kursi(S) };
    var r = tr.ruas[tr.idx], a = tr.simpul[tr.idx], b = tr.simpul[tr.idx + 1], u = T.status === 'kapal' ? 1 - Math.max(0, tr.sisaKapal) / ((r.jam + 1) * 60) : Math.min(1, tr.kmRuas / r.km);
    var v = T.status === 'kapal' ? { kmh: 0, gigi: 0 } : kecepatan(S);
    var kdF = R.infoKondisi ? R.infoKondisi(r) : { nama: 'Aspal Mulus' };
    return { mode: T.status === 'kapal' ? 'kapal' : 'jalan', dari: a, ke: b, u: u, temaA: R.kota[a].tema, temaB: R.kota[b].tema, penumpang: T.antri.length, kursi: kursi(S), kmh: v.kmh, gigi: v.gigi, tol: r.tol > 0, kondisi: r.kondisi || (r.tol > 0 ? 'tol' : 'mulus'), namaKondisi: kdF.nama, namaJalan: r.jalan || '',
      kemajuan: Math.min(1, tr.kmSelesai / tr.km), sisaKm: Math.max(0, tr.km - tr.kmSelesai) };
  }
  function cepatWaktu(S) {
    var T = S.travel; if (!T || !T.aktif) return 1;
    if (T.status === 'jalan' || T.status === 'kapal') return CEPAT_JALAN;
    return T.tujuan && T.antri.length < kursi(S) ? CEPAT_TUNGGU : 1;
  }
  function estimasi(S) { /* sisa jam perjalanan realistis sesuai sisa tiap ruas & kondisi jalan */
    var T = S.travel, tr = T && T.trip; if (!tr) return 0;
    var totalJam = 0;
    for (var i = tr.idx; i < tr.ruas.length; i++) {
      var rr = tr.ruas[i];
      if (rr.laut) {
        totalJam += (i === tr.idx && T.status === 'kapal') ? Math.max(0, tr.sisaKapal) / 60 : (rr.jam + 1);
      } else {
        var sisaRuas = i === tr.idx ? Math.max(0, rr.km - tr.kmRuas) : rr.km;
        var vR = kecepatanRuas(S, rr, T.gigi || 3, false).kmh;
        totalJam += sisaRuas / Math.max(6, vR);
      }
    }
    return totalJam;
  }

  g.KK_TRAVEL = { siapkan: siapkan, kursi: kursi, bisaMulai: bisaMulai, mulai: mulai, selesaiParkir: selesaiParkir, pilihTujuan: pilihTujuan, ubahTarif: ubahTarif, jemput: jemput, berangkat: berangkat,
    setGigi: setGigi, kecepatan: kecepatan, jalan: jalan, istirahat: istirahat, isiBensin: isiBensin, fase: fase, cepatWaktu: cepatWaktu, estimasi: estimasi, rencana: rencana, laju: laju, bolehKhusus: bolehKhusus,
    kepuasanSupir: kepuasanSupir, labelPuasSupir: labelPuasSupir, daftarMobilPenumpang: daftarMobilPenumpang, sinkronMobilSupir: sinkronMobilSupir, mobilUntukSupir: mobilUntukSupir, rekrutSupir: rekrutSupir, aturSupir: aturSupir, pecatSupir: pecatSupir, totalQrisSupir: totalQrisSupir, tarikQrisSupir: tarikQrisSupir, ruteUntukSupir: ruteUntukSupir, gantiHari: gantiHari,
    dana: dana, CEPAT_JALAN: CEPAT_JALAN, MULT_MIN: MULT_MIN, MULT_MAKS: MULT_MAKS, JEMPUT_MAKS: JEMPUT_MAKS };
})(window);
