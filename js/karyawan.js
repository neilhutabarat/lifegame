/* karyawan.js — rekrut, tugas, sif, tenaga, kesetiaan, gaji UMK, lembur, THR, BPJS, pesangon.
   Rancangan bagian "Karyawan". Angka bertanda "setelan" atau "perkiraan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, M = g.KK_MENU;
  var TUGAS = {
    barista: 'Barista', kasir: 'Kasir', kurir: 'Kurir', belanja: 'Belanja & stok', bersih: 'Kebersihan', keamanan: 'Keamanan', sosmed: 'Admin media sosial', kepala: 'Kepala toko'
  };
  var AGAMA = [['Islam', 65, 'Idulfitri'], ['Kristen', 25, 'Hari Natal'], ['Buddha', 6, 'Hari Raya Waisak'], ['Hindu', 2, 'Hari Suci Nyepi'], ['Konghucu', 2, 'Tahun Baru Imlek']];
  var JAM_SIF = 7, JAM_PARUH = 4;
  var PATOKAN_UMKM = 1200000; /* gaji dasar wajar UMKM kecil: Rp1,2 jt ke atas bar betah sehat (>50%) */
  var BIAYA_LOWONGAN = 50000, BIAYA_KURSUS = 500000; /* perkiraan */
  var nomor = 0;

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function umk(S) { return N.kota.filter(function (k) { return k.id === S.kota; })[0].umk; }
  function upahJam(gaji) { return gaji / 173; }
  function kelasUsaha(S) { var o = S.omzetTahun || 0; return o > 15e9 ? 'menengah' : o > 2e9 ? 'kecil' : 'mikro'; }

  function siapkan(S) {
    S.staf = S.staf || []; S.pelamar = S.pelamar || []; S.lowongan = S.lowongan || null;
    if (S.targetBulanan == null) S.targetBulanan = 0;
    if (S.gelasBulanIni == null) S.gelasBulanIni = 0;
    S.staf.forEach(function (k) { pastikanJadwal(S, k); });
    return S;
  }
  function pastikanJadwal(S, k) {
    var b = (S && S.jamBuka) || 7, t = (S && S.jamTutup) || 22;
    if (typeof k.jamMasuk !== 'number' || typeof k.jamPulang !== 'number') {
      if (k.paruh) {
        if (k.sif === 'ramai') { k.jamMasuk = Math.max(b, t - 5); k.jamPulang = Math.min(24, k.jamMasuk + JAM_PARUH); }
        else { k.jamMasuk = b; k.jamPulang = Math.min(t, b + JAM_PARUH); }
      } else if (k.sif === 'sore') { k.jamMasuk = Math.max(b, t - JAM_SIF); k.jamPulang = t; }
      else if (k.sif === 'penuh') { k.jamMasuk = b; k.jamPulang = t; }
      else { k.jamMasuk = b; k.jamPulang = Math.min(t, b + JAM_SIF); }
    }
    if (k.paruh && !k.upahPerJam) k.upahPerJam = 10000;
    if (!k.hariKerja || k.hariKerja.length !== 7) {
      k.hariKerja = [true, true, true, true, true, true, true];
      if (!k.paruh && typeof k.libur === 'number' && k.libur >= 0 && k.libur < 7) k.hariKerja[k.libur] = false;
    }
    if (!k.tunjangan) k.tunjangan = { bpjs: false, thr: false, uangMakan: 0, insentif: 0 };
    if (k.punyaMotorPribadi == null) k.punyaMotorPribadi = true;
    if (k.bensinInsentif == null) k.bensinInsentif = 0;
    if (k.hariKerjaTotal == null) k.hariKerjaTotal = 0;
    if (!k.xp) k.xp = { racik: 0, cepat: 0, ramah: 0 };
    if (!k.gender) k.gender = (N.namaCewek && N.namaCewek.indexOf(k.nama) >= 0) ? 'cewek' : 'cowok';
    if (!k.tahunLahir) {
      var thnS = (S && S.hari) ? KAL.tgl(S.hari).y : 2023;
      k.tahunLahir = thnS - (20 + (k.nama ? k.nama.length % 10 : 3));
    }
  }
  function usiaKaryawan(S, k) {
    var thn = (S && S.hari) ? KAL.tgl(S.hari).y : 2023;
    var tl = k.tahunLahir || (thn - 22);
    return Math.max(17, thn - tl);
  }

  /* ---------- pelamar ---------- */
  function buatPelamar(S, paruh) {
    var a = AGAMA, r = Math.random() * 100, agama = a[0];
    for (var i = 0; i < a.length; i++) { r -= a[i][1]; if (r <= 0) { agama = a[i]; break; } }
    var bintang = function () { return 1 + Math.floor(Math.random() * 4); };
    var racik = bintang(), cepat = bintang();
    var gender = Math.random() < 0.5 ? 'cewek' : 'cowok';
    var daftarNama = gender === 'cewek' ? (N.namaCewek || N.namaOrang) : (N.namaCowok || N.namaOrang);
    var usia = 18 + Math.floor(Math.random() * 16);
    var tahunLahir = KAL.tgl(S.hari).y - usia;
    /* gaji wajar UMKM rendah: mulai Rp1,2 juta sampai Rp2,2 juta sesuai skill */
    var minta = paruh ? 0 : Math.round((PATOKAN_UMKM + (racik + cepat - 2) * 120000 + Math.random() * 200000) / 50000) * 50000;
    return { id: 'p' + (++nomor) + '-' + S.hari, nama: acak(daftarNama), gender: gender, tahunLahir: tahunLahir, agama: agama[0], hariRaya: agama[2], paruh: !!paruh,
      punyaMotorPribadi: Math.random() < 0.8,
      cepat: cepat, ramah: bintang(), racik: racik, jujur: 2 + Math.floor(Math.random() * 4), minta: minta, sampai: S.hari + 3 };
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
    var b = S.jamBuka || 7, t = S.jamTutup || 22;
    var jm = p.paruh ? Math.max(b, t - 5) : b;
    var jp = p.paruh ? Math.min(t, jm + JAM_PARUH) : Math.min(t, b + JAM_SIF);
    var k = { id: 'k' + (++nomor) + '-' + S.hari, nama: p.nama, gender: p.gender || 'cewek', tahunLahir: p.tahunLahir || (KAL.tgl(S.hari).y - 22), agama: p.agama, hariRaya: p.hariRaya, paruh: p.paruh,
      punyaMotorPribadi: p.punyaMotorPribadi !== false, bensinInsentif: 0, hariKerjaTotal: 0, xp: { racik: 0, cepat: 0, ramah: 0 },
      cepat: p.cepat, ramah: p.ramah, racik: p.racik, jujur: p.jujur, gaji: p.minta, upahPerJam: 10000, mulai: S.hari + 1,
      tugas: ['barista'], sif: p.paruh ? 'ramai' : 'pagi', jamMasuk: jm, jamPulang: jp, libur: 0,
      hariKerja: [false, true, true, true, true, true, true],
      tunjangan: { bpjs: false, thr: false, uangMakan: 0, insentif: 0 },
      tenaga: 100, setia: 75, capekHari: 0,
      sakitSampai: 0, lemburBulan: 0, gelas: 0, sibukSampai: 0 };
    S.staf.push(k); S.pelamar = S.pelamar.filter(function (x) { return x.id !== id; });
    return true;
  }
  function tolak(S, id) { S.pelamar = S.pelamar.filter(function (x) { return x.id !== id; }); return true; }

  /* ---------- jadwal ---------- */
  function jamKerja(S, k) {
    pastikanJadwal(S, k);
    return [k.jamMasuk * 60, k.jamPulang * 60];
  }
  function masuk(S, k) {
    pastikanJadwal(S, k);
    if (S.hari < k.mulai || S.hari < k.sakitSampai) return false;
    var dow = KAL.tgl(S.hari).dow;
    if (!k.hariKerja[dow]) return false;
    return true;
  }
  function hadir(S, k) {
    if (k.cabang || !masuk(S, k) || S.fase !== 'buka') return false;
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
          k.sibukSampai = tw + lamaRacik(k, 1) * (g.KK_USAHA ? g.KK_USAHA.kecepatan(S) : 1); k.gelas++; o.selesaiOleh = { k: k, pada: k.sibukSampai, biaya: hasil.biaya };
          return;
        }
        var p = alat.ambilPesanan(k);
        if (p) {
          var item = p.item, h2 = alat.buatGelas(item.menuObj, item.qty);
          if (!h2.ok) { alat.lepasPesanan(p); k.sibukSampai = tw + 10; kabar.push(k.nama + ': ' + h2.habis + ' kurang untuk pesanan ' + p.p.nama + '.'); return; }
          k.sibukSampai = tw + lamaRacik(k, item.qty) * (g.KK_USAHA ? g.KK_USAHA.kecepatan(S) : 1); k.gelas += item.qty;
          p.p.sedangOleh = { k: k, pada: k.sibukSampai, biaya: h2.biaya, item: item.x }; return;
        }
      }
      if (punyaTugas(k, 'kurir') && (alat.punyaMotor() || k.punyaMotorPribadi)) {
        var r = alat.antar(k);
        if (r && r.ok) {
          k.sibukSampai = tw + r.menit; k.tenaga = Math.max(0, k.tenaga - r.menit / 60 * 4);
          if (r.pakaiMotorPribadi && r.bensinRp) k.bensinInsentif = (k.bensinInsentif || 0) + r.bensinRp;
          kabar = kabar.concat(r.kabar.map(function (x) { return k.nama + ': ' + x; }));
          return;
        }
      }
      if (punyaTugas(k, 'kepala') && !k.autoBelanjaHari) {
        var kb = kepalaBelanjaOtomatis(S, k);
        if (kb) { k.autoBelanjaHari = true; kabar.push(kb); }
      }
      if (punyaTugas(k, 'belanja') && !k.belanjaSiang && alat.esTipis()) {
        var rb = alat.pesanEs(); k.belanjaSiang = true;
        if (rb === true) kabar.push(k.nama + ' memesan es batu ke grosir.');
      }
    });
    return kabar;
  }
  /* kepala toko otomatis belanja stok yang kritis sesuai uang tersedia di laci (menyisakan receh Rp100rb) */
  function kepalaBelanjaOtomatis(S, k) {
    if (!g.KK_STOK || !g.KK_UANG) return null;
    var tipis = g.KK_STOK.menipis(S);
    if (!tipis.length) return null;
    var prioritas = ['kopi', 'uht', 'aren', 'es', 'cupPlastik', 'cupKertas', 'gas', 'galon', 'skm', 'gula', 'kentang', 'tahu', 'mie', 'sosisTelur', 'wadahMakan'];
    tipis.sort(function (a, b) {
      var ia = prioritas.indexOf(a), ib = prioritas.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    var anggaran = Math.max(0, g.KK_UANG.laci(S) - 100000);
    if (anggaran < 25000) return null;
    var keranjang = {}, total = 10000, beliNama = [];
    for (var i = 0; i < tipis.length; i++) {
      var id = tipis[i], b = M.BARANG[id];
      if (!b || b.ada.indexOf('grosir') < 0) continue;
      var h = g.KK_STOK.harga(S, id, 'grosir');
      if (total + h <= anggaran) {
        keranjang[id] = 1; total += h; beliNama.push(b.nama.split(' (')[0]);
      }
    }
    if (!beliNama.length) return null;
    var res = g.KK_STOK.beli(S, 'grosir', keranjang, 'tunai');
    if (res && res.ok) return 'Kepala toko ' + k.nama + ' otomatis memesan stok kritis (' + beliNama.join(', ') + ') dari uang laci.';
    return null;
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
  /* bayar gaji karyawan HANYA dari rekening utama (TIDAK otomatis menarik Tabungan Khusus) */
  function bayarGajiBank(S, jml, ket, n) {
    var sld = S.bank.saldo || 0;
    if (sld < jml) return false;
    S.bank.saldo = sld - jml;
    S.bank.mutasi.unshift({ n: n == null ? S.hari : n, ket: ket, jml: -jml });
    return true;
  }
  function totalTunggakanGaji(S) {
    return (S.staf || []).reduce(function (t, k) { return t + (k.gajiTelat || 0); }, 0);
  }
  function maksHariTunggakan(S, nSekarang) {
    var n = nSekarang == null ? S.hari : nSekarang, maks = 0;
    (S.staf || []).forEach(function (k) {
      if ((k.gajiTelat || 0) > 0 && k.hariMulaiTelat != null) {
        maks = Math.max(maks, Math.max(1, n - k.hariMulaiTelat));
      }
    });
    return maks;
  }
  function bayarTunggakanGaji(S) {
    var tot = totalTunggakanGaji(S);
    if (tot <= 0) return 'Tidak ada tunggakan gaji karyawan.';
    if (!bayarGajiBank(S, tot, 'Pelunasan tunggakan gaji karyawan', S.hari)) {
      return 'Saldo Rekening Utama tidak cukup untuk melunasi tunggakan ' + rp(tot) + '. Tarik dana dari Tabungan Khusus dulu jika perlu.';
    }
    (S.staf || []).forEach(function (k) {
      if (k.gajiTelat > 0) {
        k.gajiTelat = 0;
        k.hariMulaiTelat = null;
        k.setia = Math.min(100, (k.setia || 50) + 18);
      }
    });
    return { ok: true, jml: tot };
  }
  /* jika menunggak gaji >= 90 hari: kena kasus & jual paksa aset paling mahal milik karakter, kembalian masuk rekening */
  function eksekusiKasusGaji90Hari(S, nBaru) {
    var tot = totalTunggakanGaji(S);
    if (tot <= 0) return [];
    var daftarAset = [];
    if (S.mobil && g.KK_MOTOR) {
      var nmMob = S.mobil.nama;
      var hjMob = g.KK_MOTOR.nilaiJual(S, S.mobil);
      daftarAset.push({ jenis: 'mobil', nama: nmMob, nilai: hjMob, jual: function () { S.mobil = null; } });
    }
    var armada = S.armadaMotor || (S.motor ? [S.motor] : []);
    armada.forEach(function (m, idx) {
      var hjMot = g.KK_MOTOR ? g.KK_MOTOR.nilaiJual(S, m) : Math.round((m.harga || 15000000) * 0.6);
      daftarAset.push({ jenis: 'motor', idx: idx, nama: m.nama, nilai: hjMot, jual: function () {
        if (S.ojek && S.ojek.online) g.KK_OJEK.offline(S, true);
        S.armadaMotor.splice(idx, 1);
        S.motorAktif = 0;
        S.motor = S.armadaMotor[0] || null;
      } });
    });
    if (S.game && S.game.konsol && g.KK_DIRI) {
      Object.keys(S.game.konsol).forEach(function (kid) {
        var ko = S.game.konsol[kid], hjKon = g.KK_DIRI.nilaiJualKonsol(S, kid) || Math.round((ko.hargaBeli || 1000000) * 0.6);
        daftarAset.push({ jenis: 'konsol', id: kid, nama: ko.nama, nilai: hjKon, jual: function () {
          delete S.game.konsol[kid];
          if (S.rumah && S.rumah.barang) delete S.rumah.barang[kid];
        } });
      });
    }
    if (S.gadget && g.KK_DIRI) {
      var hpKeys = Object.keys(S.gadget).filter(function (gid) { var gm = g.KK_DIRI.gadgetModel(gid); return gm && gm.jenis === 'hp'; });
      Object.keys(S.gadget).forEach(function (gid) {
        var gm = g.KK_DIRI.gadgetModel(gid);
        if (!gm) return;
        if (gm.jenis === 'hp' && hpKeys.length <= 1) return; /* sisakan 1 HP paling dasar bila memungkinkan */
        var hjGad = g.KK_DIRI.nilaiJualGadget(S, gid) || Math.round(gm.harga * 0.6);
        daftarAset.push({ jenis: 'gadget', id: gid, nama: gm.nama, nilai: hjGad, jual: function () {
          delete S.gadget[gid];
          if (S.hp && S.hp.id === gid) {
            var sisaHp = Object.keys(S.gadget).filter(function (k) { var x = g.KK_DIRI.gadgetModel(k); return x && x.jenis === 'hp'; });
            if (sisaHp.length) S.hp.id = sisaHp[0];
          }
        } });
      });
    }
    if (S.rumah && S.rumah.barang && g.KK_DIRI) {
      Object.keys(S.rumah.barang).forEach(function (bid) {
        if (!S.rumah.barang[bid] || bid === 'ps5' || bid === 'ps5disc' || bid === 'kaset') return;
        var br = g.KK_DIRI.barang(bid);
        if (!br) return;
        var hjBr = g.KK_DIRI.nilaiJualBarang(S, bid) || Math.round(br.harga * 0.5);
        daftarAset.push({ jenis: 'barang', id: bid, nama: br.nama, nilai: hjBr, jual: function () {
          delete S.rumah.barang[bid];
          if (S.rumah.infoBarang) delete S.rumah.infoBarang[bid];
        } });
      });
    }
    daftarAset.sort(function (a, b) { return b.nilai - a.nilai; });
    var kabar = [];
    if (daftarAset.length > 0) {
      /* jual aset paling mahal pertama (dan aset berikutnya jika belum menutupi tunggakan) */
      var terjualNama = [], totalJual = 0;
      for (var i = 0; i < daftarAset.length && totalJual < tot; i++) {
        var a = daftarAset[i];
        a.jual();
        terjualNama.push(a.nama + ' (' + rp(a.nilai) + ')');
        totalJual += a.nilai;
      }
      var kembalian = Math.max(0, totalJual - tot);
      var masihKurang = Math.max(0, tot - totalJual);
      if (kembalian > 0) {
        S.bank.saldo += kembalian;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Kembalian lelang paksa aset (Kasus Gaji 90 Hari)', jml: kembalian });
      }
      (S.staf || []).forEach(function (k) {
        k.gajiTelat = masihKurang > 0 ? Math.round(masihKurang / S.staf.length) : 0;
        k.hariMulaiTelat = masihKurang > 0 ? nBaru : null;
        k.setia = Math.max(55, k.setia);
      });
      kabar.push('KASUS TUNGGAKAN GAJI 90 HARI! Disnaker & karyawan menyita dan menjual paksa aset termahalmu: ' + terjualNama.join(', ') + ' senilai ' + rp(totalJual) + ' untuk melunasi tunggakan gaji ' + rp(tot) + '. Uang kembalian ' + rp(kembalian) + ' telah dikembalikan ke rekeningmu!');
    } else {
      /* jika sama sekali tidak punya aset, potong saldo bank/tabungan gaji yang ada */
      var bayarAda = Math.min(tot, (S.bank.tabunganGaji || 0) + (S.bank.saldo || 0));
      if (bayarAda > 0) bayarGajiBank(S, bayarAda, 'Sita rekening (Kasus Gaji 90 Hari)', nBaru);
      (S.staf || []).forEach(function (k) { k.gajiTelat = Math.max(0, (k.gajiTelat || 0) - Math.round(bayarAda / Math.max(1, S.staf.length))); k.hariMulaiTelat = nBaru; });
      kabar.push('KASUS TUNGGAKAN GAJI 90 HARI! Karyawan melaporkan tunggakan gaji ' + rp(tot) + ' ke Disnaker.');
    }
    return kabar;
  }
  function bpjsPersen(S) {
    var kls = kelasUsaha(S), kedai = 0.0024 + 0.003, pekerja = 0;
    if (kls !== 'mikro') { kedai += 0.037; pekerja += 0.02; }
    if (kls === 'menengah') { kedai += 0.02; pekerja += 0.01; }
    return { kedai: kedai + 0.04, pekerja: pekerja + 0.01 }; /* + BPJS Kesehatan 4% dan 1% */
  }
  /* biaya tenaga kerja hari ini (untuk laba harian): gaji tetap dibagi 30, lembur, BPJS opsional, uang makan, insentif */
  function biayaHarian(S) {
    var total = 0, bp = bpjsPersen(S);
    S.staf.forEach(function (k) {
      if (S.hari < k.mulai) return;
      pastikanJadwal(S, k);
      var jam = k.jamHariIni || 0, tj = k.tunjangan;
      if (jam > 0 && tj.uangMakan) total += tj.uangMakan;
      if (k.paruh) { total += jam * (k.upahPerJam || 10000); return; }
      var lembur = Math.max(0, jam - JAM_SIF), uj = upahJam(k.gaji);
      total += k.gaji / 30 + (tj.insentif || 0) / 30 + (tj.bpjs ? Math.min(k.gaji, 12e6) * bp.kedai / 30 : 0) + Math.min(1, lembur) * 1.5 * uj + Math.max(0, lembur - 1) * 2 * uj;
    });
    return Math.round(total);
  }
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru), bp = bpjsPersen(S);
    var adaKeamanan = S.staf.some(function (k) { return (k.jamHariIni || 0) > 0 && k.tugas.indexOf('keamanan') >= 0; });
    S.hariIni.gaji = 0;
    /* upah, lembur, uang makan, progres bintang, dan betah UMKM */
    S.staf.forEach(function (k) {
      pastikanJadwal(S, k);
      var jam = k.jamHariIni || 0, tj = k.tunjangan;
      k.jamHariIni = 0; k.belanjaSiang = false; k.autoBelanjaHari = false;
      if (jam > 0) {
        k.hariKerjaTotal = (k.hariKerjaTotal || 0) + 1;
        /* semakin lama kerja, bintang racik, cepat, ramah otomatis naik sampai penuh 5 bintang! */
        k.xp.racik = (k.xp.racik || 0) + 1;
        k.xp.cepat = (k.xp.cepat || 0) + 1;
        k.xp.ramah = (k.xp.ramah || 0) + 1;
        if (k.racik < 5 && k.xp.racik >= 20) { k.racik++; k.xp.racik = 0; kabar.push(k.nama + ' makin mahir! Bintang Racik naik jadi ' + k.racik + '★.'); }
        if (k.cepat < 5 && k.xp.cepat >= 25) { k.cepat++; k.xp.cepat = 0; kabar.push(k.nama + ' makin cekatan! Bintang Cepat naik jadi ' + k.cepat + '★.'); }
        if (k.ramah < 5 && k.xp.ramah >= 22) { k.ramah++; k.xp.ramah = 0; kabar.push(k.nama + ' makin ramah! Bintang Ramah naik jadi ' + k.ramah + '★.'); }
        /* uang makan harian (opsional) */
        if (tj.uangMakan > 0) {
          k.makanBulan = (k.makanBulan || 0) + tj.uangMakan;
        }
      }
      if (k.paruh) {
        if (jam > 0) { var up = Math.round(jam * (k.upahPerJam || 10000) / 1000) * 1000; k.upahHutang = (k.upahHutang || 0) + up; }
      } else if (jam > JAM_SIF) {
        var lembur = jam - JAM_SIF, uj = upahJam(k.gaji), bayar = Math.min(1, lembur) * 1.5 * uj + Math.max(0, lembur - 1) * 2 * uj;
        k.lemburBulan += bayar; k.setia -= lembur > 4 ? 2 : 0.5;
      }
      /* tenaga dan kesehatan */
      k.tenaga = Math.min(100, k.tenaga + (jam > 0 ? 58 : 100));
      if (k.tenaga < 25) k.capekHari++; else k.capekHari = 0;
      if (k.capekHari >= 3 && Math.random() < 0.5) { k.sakitSampai = nBaru + 1 + Math.floor(Math.random() * 2); k.capekHari = 0; kabar.push(k.nama + ' sakit karena kecapekan, izin sampai ' + KAL.tgl(k.sakitSampai).d + ' ' + N.namaBulan[KAL.tgl(k.sakitSampai).m - 1] + '.'); k.setia -= 4; }
      /* kesetiaan wajar UMKM: gaji >= Rp1,2 jt menjaga bar betah di atas 55%-95%; di bawah Rp1,2 jt baru turun */
      var gCek = k.paruh ? (k.upahPerJam || 10000) * 150 : k.gaji;
      var bonusTunj = (tj.bpjs ? 8 : 0) + (tj.thr ? 7 : 0) + (tj.uangMakan ? 6 : 0) + (tj.insentif ? 6 : 0);
      var targetSetia = gCek >= PATOKAN_UMKM
        ? Math.min(100, 62 + Math.min(25, (gCek - PATOKAN_UMKM) / 100000 * 1.8) + bonusTunj)
        : Math.max(18, 45 * (gCek / PATOKAN_UMKM) + bonusTunj * 0.5);
      k.setia += (targetSetia - k.setia) * 0.15;
      k.setia = Math.max(0, Math.min(100, k.setia));
      /* kejujuran (dicegah bila ada petugas keamanan) */
      if (!adaKeamanan && jam > 0 && k.jujur <= 2 && Math.random() < (3 - k.jujur) * 0.1) {
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
    /* gaji bulanan + tunjangan + bensin kurir + bonus Achieve target (2x gaji pokok!) saat ganti bulan */
    if (tB.m !== tL.m) {
      var hariBulan = tL.d;
      var achieve = S.targetBulanan > 0 && (S.gelasBulanIni || 0) >= S.targetBulanan;
      if (achieve) kabar.push('TARGET BULANAN TERCAPAI (' + S.gelasBulanIni + '/' + S.targetBulanan + ' gelas)! Karyawan mendapat bonus Achieve 1× gaji penuh (total 2× gaji pokok).');
      S.staf.forEach(function (k) {
        if (k.mulai > nLama) return;
        pastikanJadwal(S, k);
        var tj = k.tunjangan;
        if (k.paruh) {
          var ekstra = (k.makanBulan || 0) + (k.bensinInsentif || 0) + (tj.insentif || 0);
          if (ekstra > 0 && bayarBank(S, ekstra, 'Insentif/makan/bensin ' + k.nama, nBaru)) {
            k.makanBulan = 0; k.bensinInsentif = 0;
          }
          return;
        }
        var hariKerja = Math.min(hariBulan, nLama - k.mulai + 1), pokok = k.gaji * hariKerja / hariBulan;
        var bonusAchieve = achieve ? k.gaji : 0;
        var potong = tj.bpjs ? Math.min(k.gaji, 12e6) * bp.pekerja : 0;
        var iuranKedai = tj.bpjs ? Math.min(k.gaji, 12e6) * bp.kedai : 0;
        var tambahan = (tj.insentif || 0) + (k.makanBulan || 0) + (k.bensinInsentif || 0) + bonusAchieve;
        var bersih = Math.round(pokok + k.lemburBulan + tambahan - potong);
        var total = bersih + Math.round(potong + iuranKedai);
        var label = 'Gaji ' + k.nama + (achieve ? ' (2× Achieve)' : '') + (tj.bpjs ? ' + BPJS' : '') + ' ' + N.namaBulan[tL.m - 1];
        if (bayarGajiBank(S, total, label, nBaru)) {
          kabar.push(label + ': ' + rp(total) + ' sudah dibayar.' + (k.bensinInsentif ? ' (termasuk bensin ' + rp(k.bensinInsentif) + ')' : ''));
          k.lemburBulan = 0; k.makanBulan = 0; k.bensinInsentif = 0;
          if (achieve) k.setia = 100;
        } else {
          if (!k.gajiTelat) k.hariMulaiTelat = nBaru;
          k.gajiTelat = (k.gajiTelat || 0) + total;
          k.lemburBulan = 0; k.makanBulan = 0; k.bensinInsentif = 0;
          k.setia = Math.max(20, k.setia - 15);
          kabar.push('Dana Tabungan Gaji & Rekening kurang! Gaji ' + k.nama + ' (' + rp(total) + ') menunggak (batas maksimal 90 hari sebelum kena kasus sita aset).');
        }
      });
      S.gelasBulanIni = 0;
    }
    /* cek batas 90 hari tunggakan gaji -> eksekusi kasus jual paksa aset termahal (Tabungan Khusus tidak disentuh otomatis) */
    var totTunggak = totalTunggakanGaji(S);
    if (maksHariTunggakan(S, nBaru) >= 90) {
      kabar = kabar.concat(eksekusiKasusGaji90Hari(S, nBaru));
    } else if (totTunggak > 0) {
      var hrT = maksHariTunggakan(S, nBaru);
      if (hrT === 30 || hrT === 60 || hrT === 80 || hrT >= 85) {
        kabar.push('PERINGATAN TUNGGAKAN GAJI: Sudah ' + hrT + '/90 hari menunggak gaji karyawan sebesar ' + rp(totTunggak) + '. Segera lunasi sebelum hari ke-90 agar aset termahalmu tidak dilelang paksa!');
      }
    }
    /* THR opsional (dibayar H-7 hari raya agama karyawan jika tunjangan THR aktif) */
    S.staf.forEach(function (k) {
      pastikanJadwal(S, k);
      if (k.paruh || !k.tunjangan.thr) return;
      var hr = hariRayaBerikut(S, k.hariRaya, nBaru);
      if (hr == null || hr - 7 !== nBaru) return;
      var bulan = (nBaru - k.mulai) / 30; if (bulan < 1) return;
      var thr = Math.round(k.gaji * Math.min(1, bulan / 12) / 1000) * 1000;
      if (bayarGajiBank(S, thr, 'THR ' + k.nama + ' (' + k.hariRaya + ')', nBaru)) { kabar.push('THR ' + k.nama + ' ' + rp(thr) + ' dibayar menjelang ' + k.hariRaya + '.'); k.setia = Math.min(100, k.setia + 8); }
      else {
        if (!k.gajiTelat) k.hariMulaiTelat = nBaru;
        k.setia = Math.max(20, k.setia - 15);
        k.gajiTelat = (k.gajiTelat || 0) + Math.round(thr * 1.05);
        kabar.push('THR ' + k.nama + ' telat. Kena denda 5% dan masuk tunggakan gaji.');
      }
    });
    /* karyawan lawan jenis bisa saling berhubungan (berpacaran hingga menikah) */
    if (S.staf.length >= 2) {
      for (var ia = 0; ia < S.staf.length; ia++) {
        for (var ib = ia + 1; ib < S.staf.length; ib++) {
          var ka = S.staf[ia], kb = S.staf[ib];
          if (ka.gender !== kb.gender && !ka.pasanganStafId && !kb.pasanganStafId && Math.random() < 0.05) {
            ka.pasanganStafId = kb.id; ka.pasanganStafNama = kb.nama; ka.statusHubunganStaf = 'pacaran'; ka.hariPacaran = nBaru;
            kb.pasanganStafId = ka.id; kb.pasanganStafNama = ka.nama; kb.statusHubunganStaf = 'pacaran'; kb.hariPacaran = nBaru;
            ka.setia = Math.min(100, ka.setia + 10); kb.setia = Math.min(100, kb.setia + 10);
            kabar.push('Asmara di kedai: Karyawanmu ' + ka.nama + ' dan ' + kb.nama + ' mulai berpacaran karena sering kerja bareng!');
          } else if (ka.pasanganStafId === kb.id && ka.statusHubunganStaf === 'pacaran' && (nBaru - (ka.hariPacaran || nBaru)) >= 30 && Math.random() < 0.08) {
            ka.statusHubunganStaf = 'menikah'; kb.statusHubunganStaf = 'menikah';
            ka.setia = 100; kb.setia = 100;
            kabar.push('KABAR BAHAGIA: Pasangan karyawanmu ' + ka.nama + ' & ' + kb.nama + ' resmi MENIKAH! Keduanya makin setia bekerja di kedaimu.');
          }
        }
      }
    }
    /* resign (karyawan yang masih menunggak gaji tidak langsung pergi sebelum gajinya dibayar/kasus 90 hari) */
    S.staf = S.staf.filter(function (k) {
      if (k.setia > 15 || (k.gajiTelat || 0) > 0) return true;
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
  function aturTugas(S, id, t) {
    var k = cari(S, id); if (!k) return false;
    if (t === 'semua') {
      var semua = Object.keys(TUGAS);
      k.tugas = k.tugas.length === semua.length ? ['barista'] : semua;
      return true;
    }
    var i = k.tugas.indexOf(t);
    if (i >= 0) { if (k.tugas.length > 1) k.tugas.splice(i, 1); } else k.tugas.push(t);
    return true;
  }
  function aturSif(S, id, sif) {
    var k = cari(S, id); if (!k) return false;
    k.sif = sif;
    var b = S.jamBuka || 7, t = S.jamTutup || 22;
    if (sif === 'pagi') { k.jamMasuk = b; k.jamPulang = Math.min(t, b + (k.paruh ? JAM_PARUH : JAM_SIF)); }
    else if (sif === 'sore') { k.jamPulang = t; k.jamMasuk = Math.max(b, t - JAM_SIF); }
    else if (sif === 'ramai') { k.jamMasuk = Math.max(b, t - 5); k.jamPulang = Math.min(24, k.jamMasuk + JAM_PARUH); }
    else if (sif === 'penuh') { k.jamMasuk = b; k.jamPulang = t; }
    return true;
  }
  function aturJam(S, id, bagian, d) {
    var k = cari(S, id); if (!k) return false;
    pastikanJadwal(S, k);
    var b = S.jamBuka || 5, t = S.jamTutup || 24;
    if (bagian === 'masuk') k.jamMasuk = Math.max(b, Math.min(k.jamPulang - 1, k.jamMasuk + d));
    else k.jamPulang = Math.max(k.jamMasuk + 1, Math.min(t, k.jamPulang + d));
    return true;
  }
  function aturLibur(S, id, d) {
    var k = cari(S, id); if (!k) return false;
    pastikanJadwal(S, k);
    var dow = +d;
    var aktif = k.hariKerja.filter(Boolean).length;
    if (k.hariKerja[dow] && aktif <= 1) return false; /* minimal 1 hari kerja */
    k.hariKerja[dow] = !k.hariKerja[dow];
    return true;
  }
  function aturTunjangan(S, id, jenis, nilai) {
    var k = cari(S, id); if (!k) return false;
    pastikanJadwal(S, k);
    var tj = k.tunjangan;
    if (jenis === 'bpjs') { tj.bpjs = !tj.bpjs; k.setia = Math.min(100, Math.max(0, k.setia + (tj.bpjs ? 8 : -8))); }
    else if (jenis === 'thr') { tj.thr = !tj.thr; k.setia = Math.min(100, Math.max(0, k.setia + (tj.thr ? 7 : -7))); }
    else if (jenis === 'uangMakan') { tj.uangMakan = Math.max(0, Math.min(50000, +nilai)); k.setia = Math.min(100, k.setia + 3); }
    else if (jenis === 'insentif') { tj.insentif = Math.max(0, Math.min(2000000, +nilai)); k.setia = Math.min(100, k.setia + 3); }
    return true;
  }
  function aturTarget(S, jml) { S.targetBulanan = Math.max(0, +jml || 0); return true; }
  function aturGaji(S, id, d) {
    var k = cari(S, id); if (!k) return false;
    if (k.paruh) {
      pastikanJadwal(S, k);
      var baruJam = Math.max(5000, (k.upahPerJam || 10000) + d * 1000);
      k.setia = Math.max(0, Math.min(100, k.setia + (d > 0 ? 4 : -8)));
      k.upahPerJam = baruJam;
      return true;
    }
    var baru = d === 0 ? PATOKAN_UMKM : Math.max(500000, k.gaji + d * 100000);
    if (baru < umk(S) && kelasUsaha(S) === 'menengah') return 'Usaha menengah wajib menggaji minimal UMK ' + rp(umk(S)) + '.';
    k.setia = Math.max(0, Math.min(100, k.setia + (baru > k.gaji ? 6 : baru < k.gaji ? -10 : 0))); k.gaji = baru; return true;
  }
  function kursus(S, id, bidang) {
    var k = cari(S, id); if (!k) return 'Karyawan tidak ditemukan.';
    var b = bidang || (k.racik < 5 ? 'racik' : k.cepat < 5 ? 'cepat' : 'ramah');
    if (k[b] >= 5) return 'Keahlian ' + b + ' ' + k.nama + ' sudah penuh 5 bintang.';
    if (!bayarBank(S, BIAYA_KURSUS, 'Pelatihan ' + b + ' ' + k.nama, S.hari)) return 'Saldo rekening tidak cukup.';
    k[b]++; k.setia = Math.min(100, k.setia + 10); return true;
  }
  function pecat(S, id) {
    var k = cari(S, id), tahun = Math.max(0, Math.floor((S.hari - k.mulai) / 365)), pesangon = k.paruh ? 0 : k.gaji * Math.min(9, tahun + 1);
    var sisa = k.paruh ? 0 : Math.round(k.gaji * (KAL.tgl(S.hari).d / 30)) + k.lemburBulan;
    var total = Math.round(pesangon + sisa + (k.gajiTelat || 0));
    if (total && !bayarBank(S, total, 'Pesangon dan sisa gaji ' + k.nama, S.hari)) return 'Saldo rekening kurang untuk pesangon ' + rp(total) + '.';
    S.staf = S.staf.filter(function (x) { return x.id !== id; });
    return { ok: true, total: total };
  }

  g.KK_STAF = { TUGAS: TUGAS, PATOKAN_UMKM: PATOKAN_UMKM, BIAYA_LOWONGAN: BIAYA_LOWONGAN, BIAYA_KURSUS: BIAYA_KURSUS, siapkan: siapkan, usiaKaryawan: usiaKaryawan, pasangLowongan: pasangLowongan, terima: terima, tolak: tolak,
    jamKerja: jamKerja, masuk: masuk, hadir: hadir, ada: ada, punyaTugas: punyaTugas, kerja: kerja, gantiHari: gantiHari, biayaHarian: biayaHarian,
    aturTugas: aturTugas, aturSif: aturSif, aturJam: aturJam, aturLibur: aturLibur, aturTunjangan: aturTunjangan, aturTarget: aturTarget, aturGaji: aturGaji, kursus: kursus, pecat: pecat, cari: cari, umk: umk, kelasUsaha: kelasUsaha, bpjsPersen: bpjsPersen,
    totalTunggakanGaji: totalTunggakanGaji, maksHariTunggakan: maksHariTunggakan, bayarTunggakanGaji: bayarTunggakanGaji, eksekusiKasusGaji90Hari: eksekusiKasusGaji90Hari };
})(window);
