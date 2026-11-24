/* karyawan.js — rekrut, tugas, sif, tenaga, kesetiaan, gaji UMK, lembur, THR, BPJS, pesangon.
   Rancangan bagian "Karyawan". Angka bertanda "setelan" atau "perkiraan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, M = g.KK_MENU;
  var TUGAS = {
    barista: 'Barista', kasir: 'Kasir', kurir: 'Kurir', belanja: 'Belanja & stok', bersih: 'Kebersihan', sosmed: 'Admin media sosial', kepala: 'Kepala toko'
  };
  var AGAMA = [['Islam', 65, 'Idulfitri'], ['Kristen', 25, 'Hari Natal'], ['Buddha', 6, 'Hari Raya Waisak'], ['Hindu', 2, 'Hari Suci Nyepi'], ['Konghucu', 2, 'Tahun Baru Imlek']];
  var JAM_SIF = 7, JAM_PARUH = 4;
  var BIAYA_LOWONGAN = 50000, BIAYA_KURSUS = 500000; /* perkiraan */
  var nomor = 0;

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function umk(S) { return N.kota.filter(function (k) { return k.id === S.kota; })[0].umk; }
  function upahJam(gaji) { return gaji / 173; }
  function kelasUsaha(S) { var o = S.omzetTahun || 0; return o > 15e9 ? 'menengah' : o > 2e9 ? 'kecil' : 'mikro'; }

  function siapkan(S) {
    S.staf = S.staf || []; S.pelamar = S.pelamar || []; S.lowongan = S.lowongan || null;
    return S;
  }

  /* ---------- pelamar ---------- */
  function buatPelamar(S, paruh) {
    var a = AGAMA, r = Math.random() * 100, agama = a[0];
    for (var i = 0; i < a.length; i++) { r -= a[i][1]; if (r <= 0) { agama = a[i]; break; } }
    var bintang = function () { return 1 + Math.floor(Math.random() * 5); };
    var racik = bintang(), cepat = bintang();
    var minta = paruh ? 0 : Math.round(umk(S) * (0.7 + (racik + cepat) / 10 * 0.45 + Math.random() * 0.1) / 50000) * 50000;
    return { id: 'p' + (++nomor) + '-' + S.hari, nama: acak(N.namaOrang), agama: agama[0], hariRaya: agama[2], paruh: !!paruh,
      cepat: cepat, ramah: bintang(), racik: racik, jujur: bintang(), minta: minta, sampai: S.hari + 3 };
  }
  function pasangLowongan(S, lewat) {
    if (S.lowongan && S.lowongan.sampai > S.hari) return 'Lowongan masih terpasang.';
    if (lewat === 'sosmed') {
      if (S.bank.saldo < BIAYA_LOWONGAN) return 'Saldo rekening tidak cukup untuk iklan lowongan.';
      S.bank.saldo -= BIAYA_LOWONGAN; S.bank.mutasi.unshift({ n: S.hari, ket: 'Iklan lowongan di media sosial', jml: -BIAYA_LOWONGAN });
    }
    S.lowongan = { lewat: lewat, sampai: S.hari + 3 };
    return true;
  }
  function terima(S, id) {
    var p = S.pelamar.filter(function (x) { return x.id === id; })[0]; if (!p) return 'Pelamar sudah pergi.';
    var k = { id: 'k' + (++nomor) + '-' + S.hari, nama: p.nama, agama: p.agama, hariRaya: p.hariRaya, paruh: p.paruh,
      cepat: p.cepat, ramah: p.ramah, racik: p.racik, jujur: p.jujur, gaji: p.minta, mulai: S.hari + 1,
      tugas: p.paruh ? ['barista'] : ['barista'], sif: p.paruh ? 'ramai' : 'pagi', libur: 0, tenaga: 100, setia: 70, capekHari: 0,
      sakitSampai: 0, lemburBulan: 0, gelas: 0, sibukSampai: 0 };
    S.staf.push(k); S.pelamar = S.pelamar.filter(function (x) { return x.id !== id; });
    return true;
  }
  function tolak(S, id) { S.pelamar = S.pelamar.filter(function (x) { return x.id !== id; }); return true; }

  /* ---------- jadwal ---------- */
  function jamKerja(S, k) {
    var b = S.jamBuka * 60, t = S.jamTutup * 60;
    if (k.paruh) return k.sif === 'ramai' ? [Math.max(b, t - 300), Math.max(b, t - 300) + JAM_PARUH * 60] : [b, b + JAM_PARUH * 60];
    if (k.sif === 'pagi') return [b, Math.min(t, b + JAM_SIF * 60)];
    if (k.sif === 'sore') return [Math.max(b, t - JAM_SIF * 60), t];
    return [b, t];
  }
  function masuk(S, k) {
    if (S.hari < k.mulai || S.hari < k.sakitSampai) return false;
    if (!k.paruh && KAL.tgl(S.hari).dow === k.libur) return false;
    return true;
  }
  function hadir(S, k) {
    if (!masuk(S, k) || S.fase !== 'buka') return false;
    var j = jamKerja(S, k); return S.menit >= j[0] && S.menit < j[1];
  }
  function punyaTugas(k, t) { return k.tugas.indexOf(t) >= 0 || (t !== 'kepala' && k.tugas.indexOf('kepala') >= 0 && false); }
  function siapKerja(S, k, t) { return hadir(S, k) && punyaTugas(k, t) && S.hari * 1440 + S.menit >= k.sibukSampai; }
  function ada(S, t) { return S.staf.some(function (k) { return hadir(S, k) && punyaTugas(k, t); }); }

  /* lama membuat satu gelas (menit game) */
  function lamaRacik(k, gelas) {
    var dasar = 4 - k.cepat * 0.5, capek = k.tenaga < 30 ? 1.6 : 1, rangkap = k.tugas.length > 1 ? 1.3 : 1;
    return (dasar + 0.8 * (gelas - 1)) * capek * rangkap;
  }
  function peluangSalah(k) { return (6 - k.racik) * 0.03 + (k.tenaga < 30 ? 0.15 : 0); }

  /* ---------- kerja tiap menit ---------- */
  function kerja(S, dMenit, alat) {
    var kabar = [], tw = S.hari * 1440 + S.menit;
    if (S.fase !== 'buka' || dMenit <= 0) return kabar;
    S.staf.forEach(function (k) {
      if (!hadir(S, k)) return;
      k.tenaga = Math.max(0, k.tenaga - 6 * dMenit / 60);
      k.jamHariIni = (k.jamHariIni || 0) + dMenit / 60;
      if (tw < k.sibukSampai) return;
      /* barista: layani pembeli antre, lalu pesanan antar */
      if (punyaTugas(k, 'barista')) {
        var o = alat.ambilPembeli(k);
        if (o) {
          if (Math.random() < peluangSalah(k)) { var w = alat.buang(o.menu); kabar.push(k.nama + ' salah racik ' + o.menu.pendek + ', bahan terbuang ' + rp(w) + '.'); }
          var hasil = alat.buatGelas(o.menu, 1);
          if (!hasil.ok) { alat.lepasPembeli(o); k.sibukSampai = tw + 10; kabar.push(k.nama + ': ' + hasil.habis + ' habis, tidak bisa membuat ' + o.menu.pendek + '.'); return; }
          k.sibukSampai = tw + lamaRacik(k, 1); k.gelas++; o.selesaiOleh = { k: k, pada: k.sibukSampai, biaya: hasil.biaya };
          return;
        }
        var p = alat.ambilPesanan(k);
        if (p) {
          var item = p.item, h2 = alat.buatGelas(item.menuObj, item.qty);
          if (!h2.ok) { alat.lepasPesanan(p); k.sibukSampai = tw + 10; kabar.push(k.nama + ': ' + h2.habis + ' kurang untuk pesanan ' + p.p.nama + '.'); return; }
          k.sibukSampai = tw + lamaRacik(k, item.qty); k.gelas += item.qty;
          p.p.sedangOleh = { k: k, pada: k.sibukSampai, biaya: h2.biaya, item: item.x }; return;
        }
      }
      if (punyaTugas(k, 'kurir') && alat.punyaMotor()) {
        var r = alat.antar(k);
        if (r && r.ok) { k.sibukSampai = tw + r.menit; k.tenaga = Math.max(0, k.tenaga - r.menit / 60 * 4); kabar = kabar.concat(r.kabar.map(function (x) { return k.nama + ': ' + x; })); return; }
      }
      if (punyaTugas(k, 'belanja') && !k.belanjaSiang && alat.esTipis()) {
        var rb = alat.pesanEs(); k.belanjaSiang = true;
        if (rb === true) kabar.push(k.nama + ' memesan es batu ke grosir.');
      }
    });
    return kabar;
  }

  /* ---------- pergantian hari ---------- */
  function hariRayaBerikut(S, nama, mulai) {
    for (var y = KAL.tgl(mulai).y; y <= KAL.tgl(mulai).y + 1; y++) {
      var peta = KAL.liburTahun(y), kandidat = Object.keys(peta).map(Number).sort(function (a, b) { return a - b; });
      for (var i = 0; i < kandidat.length; i++) if (kandidat[i] >= mulai && peta[kandidat[i]].some(function (x) { return x.nama === nama && x.jenis === 'libur'; })) return kandidat[i];
    }
    return null;
  }
  function bayarBank(S, jml, ket, n) {
    if (S.bank.saldo < jml) return false;
    S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: n, ket: ket, jml: -jml }); return true;
  }
  function bpjsPersen(S) {
    var kls = kelasUsaha(S), kedai = 0.0024 + 0.003, pekerja = 0;
    if (kls !== 'mikro') { kedai += 0.037; pekerja += 0.02; }
    if (kls === 'menengah') { kedai += 0.02; pekerja += 0.01; }
    return { kedai: kedai + 0.04, pekerja: pekerja + 0.01 }; /* + BPJS Kesehatan 4% dan 1% */
  }
  /* biaya tenaga kerja hari ini (untuk laba harian): gaji tetap dibagi 30, lembur, BPJS kedai, upah paruh waktu */
  function biayaHarian(S) {
    var total = 0, bp = bpjsPersen(S);
    S.staf.forEach(function (k) {
      if (S.hari < k.mulai) return;
      var jam = k.jamHariIni || 0;
      if (k.paruh) { total += jam * upahJam(umk(S)); return; }
      var lembur = Math.max(0, jam - JAM_SIF), uj = upahJam(k.gaji);
      total += k.gaji / 30 + Math.min(k.gaji, 12e6) * bp.kedai / 30 + Math.min(1, lembur) * 1.5 * uj + Math.max(0, lembur - 1) * 2 * uj;
    });
    return Math.round(total);
  }
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru), bp = bpjsPersen(S);
    S.hariIni.gaji = 0;
    /* upah dan lembur hari kemarin */
    S.staf.forEach(function (k) {
      var jam = k.jamHariIni || 0; k.jamHariIni = 0; k.belanjaSiang = false;
      if (k.paruh) {
        if (jam > 0) { var up = Math.round(jam * upahJam(umk(S)) / 1000) * 1000; k.upahHutang = (k.upahHutang || 0) + up; }
      } else if (jam > JAM_SIF) {
        var lembur = jam - JAM_SIF, uj = upahJam(k.gaji), bayar = Math.min(1, lembur) * 1.5 * uj + Math.max(0, lembur - 1) * 2 * uj;
        k.lemburBulan += bayar; k.setia -= lembur > 4 ? 3 : 1;
      }
      /* tenaga dan kesehatan */
      k.tenaga = Math.min(100, k.tenaga + (jam > 0 ? 55 : 100));
      if (k.tenaga < 25) k.capekHari++; else k.capekHari = 0;
      if (k.capekHari >= 3 && Math.random() < 0.5) { k.sakitSampai = nBaru + 1 + Math.floor(Math.random() * 2); k.capekHari = 0; kabar.push(k.nama + ' sakit karena kecapekan, izin sampai ' + KAL.tgl(k.sakitSampai).d + ' ' + N.namaBulan[KAL.tgl(k.sakitSampai).m - 1] + '.'); k.setia -= 5; }
      /* kesetiaan dari gaji */
      var rasio = k.paruh ? 1 : k.gaji / umk(S);
      k.setia += rasio >= 1 ? 0.5 : rasio >= 0.85 ? 0 : -1;
      k.setia = Math.max(0, Math.min(100, k.setia));
      /* kejujuran */
      if (jam > 0 && k.jujur <= 2 && Math.random() < (3 - k.jujur) * 0.12) {
        var ambil = Math.min(S.uang.kecil, (1 + Math.floor(Math.random() * 5)) * 10000);
        if (ambil > 0) { S.uang.kecil -= ambil; S.selisihKas = (S.selisihKas || 0) + ambil; }
      }
    });
    /* upah paruh waktu dibayar tunai tiap hari dari laci */
    S.staf.forEach(function (k) {
      if (k.paruh && k.upahHutang) {
        var bayar = Math.min(k.upahHutang, S.uang.kecil + S.uang.besar);
        var dariBesar = Math.min(S.uang.besar, bayar); S.uang.besar -= dariBesar; S.uang.kecil -= bayar - dariBesar;
        S.hariIni.upahParuh = (S.hariIni.upahParuh || 0) + bayar; k.upahHutang -= bayar;
        if (k.upahHutang > 0) { k.setia -= 10; kabar.push('Uang laci kurang untuk upah ' + k.nama + '.'); }
      }
    });
    if (S.selisihKas) { kabar.push('Laci kas kurang ' + rp(S.selisihKas) + ' dari catatan. Tidak ada yang mengaku.'); S.selisihKasKemarin = S.selisihKas; S.selisihKas = 0; }
    /* gaji bulanan, dibayar saat ganti bulan */
    if (tB.m !== tL.m) {
      var hariBulan = tL.d;
      S.staf.forEach(function (k) {
        if (k.paruh || k.mulai > nLama) return;
        var hariKerja = Math.min(hariBulan, nLama - k.mulai + 1), pokok = k.gaji * hariKerja / hariBulan;
        var potong = Math.min(k.gaji, 12e6) * bp.pekerja, iuranKedai = Math.min(k.gaji, 12e6) * bp.kedai;
        var bersih = Math.round(pokok + k.lemburBulan - potong), total = bersih + Math.round(potong + iuranKedai);
        if (bayarBank(S, total, 'Gaji ' + k.nama + ' + BPJS ' + N.namaBulan[tL.m - 1], nBaru)) { kabar.push('Gaji ' + k.nama + ' ' + rp(bersih) + ' dan iuran BPJS sudah dibayar.'); k.lemburBulan = 0; k.gajiTelat = 0; }
        else { k.gajiTelat = (k.gajiTelat || 0) + total; k.setia -= 30; kabar.push('Saldo rekening kurang, gaji ' + k.nama + ' telat dibayar.'); }
      });
    } else S.staf.forEach(function (k) {
      if (k.gajiTelat && bayarBank(S, k.gajiTelat, 'Gaji telat ' + k.nama, nBaru)) { kabar.push('Gaji ' + k.nama + ' yang telat sudah dibayar.'); k.gajiTelat = 0; k.lemburBulan = 0; }
    });
    /* THR paling lambat H-7 hari raya agama karyawan */
    S.staf.forEach(function (k) {
      if (k.paruh) return;
      var hr = hariRayaBerikut(S, k.hariRaya, nBaru);
      if (hr == null || hr - 7 !== nBaru) return;
      var bulan = (nBaru - k.mulai) / 30; if (bulan < 1) return;
      var thr = Math.round(k.gaji * Math.min(1, bulan / 12) / 1000) * 1000;
      if (bayarBank(S, thr, 'THR ' + k.nama + ' (' + k.hariRaya + ')', nBaru)) { kabar.push('THR ' + k.nama + ' ' + rp(thr) + ' dibayar menjelang ' + k.hariRaya + '.'); k.setia = Math.min(100, k.setia + 5); }
      else { k.setia -= 30; k.gajiTelat = (k.gajiTelat || 0) + Math.round(thr * 1.05); kabar.push('THR ' + k.nama + ' telat. Kena denda 5% dan ' + k.nama + ' kecewa.'); }
    });
    /* resign */
    S.staf = S.staf.filter(function (k) {
      if (k.setia > 15) return true;
      kabar.push(k.nama + ' mengundurkan diri. ' + (k.gaji < umk(S) && !k.paruh ? 'Gajinya di bawah UMK dan ' : '') + 'merasa tidak betah.');
      return false;
    });
    /* pelamar dari lowongan */
    S.pelamar = S.pelamar.filter(function (p) { return p.sampai > nBaru; });
    if (S.lowongan && S.lowongan.sampai >= nBaru) {
      var n = S.lowongan.lewat === 'sosmed' ? 1 + Math.floor(Math.random() * 3) : Math.random() < 0.6 ? 1 : 0;
      for (var i = 0; i < n; i++) S.pelamar.push(buatPelamar(S, Math.random() < 0.3));
      if (n) kabar.push(n + ' pelamar kerja datang. Lihat di aplikasi Karyawan.');
      if (S.lowongan.sampai === nBaru) S.lowongan = null;
    }
    return kabar;
  }

  /* ---------- aksi ---------- */
  function cari(S, id) { return S.staf.filter(function (k) { return k.id === id; })[0]; }
  function aturTugas(S, id, t) { var k = cari(S, id); var i = k.tugas.indexOf(t); if (i >= 0) { if (k.tugas.length > 1) k.tugas.splice(i, 1); } else k.tugas.push(t); return true; }
  function aturSif(S, id, sif) { cari(S, id).sif = sif; return true; }
  function aturLibur(S, id, d) { cari(S, id).libur = +d; return true; }
  function aturGaji(S, id, d) {
    var k = cari(S, id), baru = Math.max(500000, k.gaji + d * 100000);
    if (baru < umk(S) && kelasUsaha(S) === 'menengah') return 'Usaha menengah wajib menggaji minimal UMK ' + rp(umk(S)) + '.';
    k.setia = Math.max(0, Math.min(100, k.setia + (d > 0 ? 6 : -12))); k.gaji = baru; return true;
  }
  function kursus(S, id) {
    var k = cari(S, id); if (k.racik >= 5) return 'Keahlian racik ' + k.nama + ' sudah paling tinggi.';
    if (!bayarBank(S, BIAYA_KURSUS, 'Kursus barista ' + k.nama, S.hari)) return 'Saldo rekening tidak cukup.';
    k.racik++; k.setia = Math.min(100, k.setia + 10); k.sakitSampai = Math.max(k.sakitSampai, S.hari + 1); return true;
  }
  function pecat(S, id) {
    var k = cari(S, id), tahun = Math.floor((S.hari - k.mulai) / 365), pesangon = k.paruh ? 0 : k.gaji * Math.min(9, tahun + 1);
    var sisa = k.paruh ? 0 : Math.round(k.gaji * (KAL.tgl(S.hari).d / 30)) + k.lemburBulan;
    var total = Math.round(pesangon + sisa + (k.gajiTelat || 0));
    if (total && !bayarBank(S, total, 'Pesangon dan sisa gaji ' + k.nama, S.hari)) return 'Saldo rekening kurang untuk pesangon ' + rp(total) + '.';
    S.staf = S.staf.filter(function (x) { return x.id !== id; });
    return { ok: true, total: total };
  }

  g.KK_STAF = { TUGAS: TUGAS, BIAYA_LOWONGAN: BIAYA_LOWONGAN, BIAYA_KURSUS: BIAYA_KURSUS, siapkan: siapkan, pasangLowongan: pasangLowongan, terima: terima, tolak: tolak,
    jamKerja: jamKerja, masuk: masuk, hadir: hadir, ada: ada, punyaTugas: punyaTugas, kerja: kerja, gantiHari: gantiHari, biayaHarian: biayaHarian,
    aturTugas: aturTugas, aturSif: aturSif, aturLibur: aturLibur, aturGaji: aturGaji, kursus: kursus, pecat: pecat, cari: cari, umk: umk, kelasUsaha: kelasUsaha, bpjsPersen: bpjsPersen };
})(window);
