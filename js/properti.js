/* properti.js — beli rumah (KPR subsidi FLPP, KPR komersial, atau tunai), pindah dari kos ke rumah, beli dan jual tanah.
   Angka dari nyata.js bagian properti. Pindahan memakai jasa pindahan, gratis kalau punya pikap. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, P = N.properti;

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function M() { return g.KK_MOTOR; }
  /* daftar kota & daerah seluruh Indonesia untuk beli properti (gabungan peta rute + kota utama Nusantara) */
  var KOTA_EXTRA = {
    denpasar: { nama: 'Denpasar (Bali)', pulau: 'Bali', skala: 1.35 },
    makassar: { nama: 'Makassar', pulau: 'Sulawesi', skala: 1.05 },
    balikpapan: { nama: 'Balikpapan', pulau: 'Kalimantan', skala: 1.15 },
    manado: { nama: 'Manado', pulau: 'Sulawesi', skala: 0.95 },
    banjarmasin: { nama: 'Banjarmasin', pulau: 'Kalimantan', skala: 0.95 },
    pontianak: { nama: 'Pontianak', pulau: 'Kalimantan', skala: 0.95 },
    malang: { nama: 'Malang', pulau: 'Jawa', skala: 1.05 },
    solo: { nama: 'Solo (Surakarta)', pulau: 'Jawa', skala: 0.95 },
    jayapura: { nama: 'Jayapura (Papua)', pulau: 'Papua', skala: 1.15 }
  };
  function daftarKota() {
    var out = [], seen = {};
    if (g.KK_RUTE && g.KK_RUTE.kota) {
      Object.keys(g.KK_RUTE.kota).forEach(function (id) {
        var k = g.KK_RUTE.kota[id]; seen[id] = 1;
        out.push({ id: id, nama: k.nama, pulau: k.pulau || 'Indonesia' });
      });
    }
    Object.keys(KOTA_EXTRA).forEach(function (id) {
      if (!seen[id]) out.push({ id: id, nama: KOTA_EXTRA[id].nama, pulau: KOTA_EXTRA[id].pulau });
    });
    return out;
  }
  function namaKota(id) {
    if (g.KK_RUTE && g.KK_RUTE.kota && g.KK_RUTE.kota[id]) return g.KK_RUTE.kota[id].nama;
    if (KOTA_EXTRA[id]) return KOTA_EXTRA[id].nama;
    var k = N.kota.filter(function (x) { return x.id === id; })[0];
    return k ? k.nama : id;
  }
  function dataKota(S, kotaId) {
    var id = kotaId || S.kota;
    if (P.kota[id]) return P.kota[id];
    var rk = g.KK_RUTE && g.KK_RUTE.kota && g.KK_RUTE.kota[id];
    var sk = KOTA_EXTRA[id] ? KOTA_EXTRA[id].skala : (rk ? (rk.tema === 'metropolis' ? 1.45 : rk.tema === 'kotaBesar' ? 1.15 : 0.95) : 1.0);
    return {
      subsidi: id === 'jakarta' ? 185e6 : 166e6,
      komersial: Math.round(450e6 * sk / 10e6) * 10e6,
      mewah: Math.round(2400e6 * sk / 50e6) * 50e6,
      tanahM2: Math.round(1000000 * sk / 100000) * 100000,
      jarak: { subsidi: 13, komersial: 6, mewah: 4 }
    };
  }
  function buatRuangan(tipe) {
    var namaList = tipe === 'mewah'
      ? ['Ruang Keluarga', 'Kamar Utama', 'Kamar 2', 'Kamar 3', 'Kamar Ipar', 'Dapur', 'Garasi']
      : tipe === 'komersial'
        ? ['Ruang Tamu', 'Kamar Utama', 'Kamar 2', 'Kamar Ipar', 'Dapur']
        : ['Ruang Tamu', 'Kamar Utama', 'Kamar 2', 'Dapur'];
    return namaList.map(function (nm) { return { nama: nm, isi: [] }; });
  }
  var PERABOT_RUANG = [
    { id: 'kasur_single', nama: 'Kasur Busa Single 90×200', harga: 950000, kat: 'Kasur', sync: null },
    { id: 'kasur_queen', nama: 'Springbed Queen 160×200', harga: 3500000, kat: 'Kasur', sync: 'springbed' },
    { id: 'kasur_king', nama: 'Springbed King 180×200', harga: 5500000, kat: 'Kasur', sync: 'springbed' },
    { id: 'kasur_superking', nama: 'King Koil Super King 200×200', harga: 12000000, kat: 'Kasur', sync: 'springbed' },
    { id: 'ac_half', nama: 'AC 1/2 PK Low Watt + Instalasi', harga: 3700000, kat: 'Elektronik', sync: 'ac' },
    { id: 'ac_1pk', nama: 'AC 1 PK Inverter + Instalasi', harga: 5200000, kat: 'Elektronik', sync: 'ac' },
    { id: 'tv_43', nama: 'Smart TV 43" 4K + Pasang', harga: 4200000, kat: 'Elektronik', sync: 'tv' },
    { id: 'lemari_3p', nama: 'Lemari Pakaian 3 Pintu', harga: 1850000, kat: 'Perabot', sync: 'lemari3pintu' },
    { id: 'sofa_l', nama: 'Sofa L-Shape Ruang Tamu', harga: 3200000, kat: 'Perabot', sync: 'sofa' },
    { id: 'kulkas_2p', nama: 'Kulkas 2 Pintu + Instalasi', harga: 4500000, kat: 'Dapur', sync: 'kulkas2' },
    { id: 'kompor_set', nama: 'Kompor Tanam + Kitchen Set', harga: 4800000, kat: 'Dapur', sync: 'kompor' },
    { id: 'mesincuci_fl', nama: 'Mesin Cuci Front Loading', harga: 3800000, kat: 'Elektronik', sync: 'mesincuci' }
  ];
  function sinkronRumahUtama(S) {
    var list = (S.properti && S.properti.daftarRumah) || [];
    var huni = list.filter(function (x) { return x.dihuni; })[0];
    S.properti.rumah = huni || list[0] || null;
  }
  function daftarRumah(S) {
    siapkan(S);
    return S.properti.daftarRumah;
  }
  function siapkan(S) {
    if (!S.properti) S.properti = { rumah: null, daftarRumah: [], tanah: [], pernahRumah: false, mulai: S.hari };
    if (!S.properti.daftarRumah) S.properti.daftarRumah = S.properti.rumah ? [S.properti.rumah] : [];
    S.properti.daftarRumah.forEach(function (r, idx) {
      if (!r.id) r.id = 'rmh-' + (r.dibeli || 0) + '-' + idx;
      if (!r.kota) r.kota = S.kota;
      if (!r.ruangan || !r.ruangan.length) r.ruangan = buatRuangan(r.tipe || 'subsidi');
      if (typeof r.tagihanAir !== 'number') r.tagihanAir = 0;
    });
    sinkronRumahUtama(S);
    return S;
  }
  var WILAYAH = {
    kota: { nama: 'Pusat Kota', faktor: 1.0, jarakTambah: 0, ket: 'Akses dekat pusat kota, harga standar kota' },
    kecamatan: { nama: 'Kecamatan', faktor: 0.8, jarakTambah: 6, ket: 'Area kecamatan / pinggiran, harga ~20% lebih hemat' },
    desa: { nama: 'Desa', faktor: 0.6, jarakTambah: 14, ket: 'Suasana pedesaan tenang, harga ~40% lebih hemat' }
  };
  function harga(S, tipe, kotaId, wil) {
    var f = (WILAYAH[wil] && WILAYAH[wil].faktor) || 1;
    var base = dataKota(S, kotaId)[tipe];
    if (tipe === 'subsidi' && wil === 'kota') return base;
    return Math.round(base * f / 1e6) * 1e6;
  }
  function anuitas(pokok, bungaTahun, bulan) { var r = bungaTahun / 12; return r ? pokok * r / (1 - Math.pow(1 + r, -bulan)) : pokok / bulan; }
  function npoptkp(S, kotaId) { return (kotaId || S.kota) === 'jakarta' ? P.npoptkpJakarta : P.npoptkp; }
  function bphtb(S, h, kotaId) { return Math.max(0, Math.round((h - npoptkp(S, kotaId)) * P.bphtb)); }
  function hitungTagihanAir(S, tipe) {
    var dasar = tipe === 'mewah' ? 240000 : tipe === 'komersial' ? 115000 : 65000;
    var jmlOrang = 1 + (S.keluarga ? S.keluarga.length : 0);
    return dasar + jmlOrang * 20000;
  }
  function bayarAir(S, idx) {
    var list = daftarRumah(S);
    var r = idx != null ? list[idx] : S.properti.rumah;
    if (!r) return 'Belum punya rumah.';
    var tg = r.tagihanAir || 0;
    if (tg <= 0) return 'Tagihan air ledeng (PDAM) bulan ini sudah lunas.';
    if (S.bank.saldo >= tg) { S.bank.saldo -= tg; M().catatBank(S, 'Tagihan air ledeng PDAM (' + (r.lokasiTeks || namaKota(r.kota)) + ')', -tg); }
    else if ((S.uang.dompet || 0) >= tg) { S.uang.dompet -= tg; }
    else return 'Saldo tidak cukup untuk bayar PDAM (' + rp(tg) + ').';
    r.tagihanAir = 0; S.hariIni.pribadi = (S.hariIni.pribadi || 0) + tg;
    return { ok: true, teks: 'Tagihan air ledeng (PDAM) ' + rp(tg) + ' lunas.' };
  }
  function instalPerabot(S, ruangIdx, itemId, rumahIdx) {
    var list = daftarRumah(S);
    var r = rumahIdx != null ? list[rumahIdx] : S.properti.rumah;
    if (!r) return 'Beli rumah dulu untuk instalasi perabot ruangan.';
    var rg = r.ruangan[ruangIdx]; if (!rg) return 'Ruangan tidak ditemukan.';
    var it = PERABOT_RUANG.filter(function (x) { return x.id === itemId; })[0]; if (!it) return 'Perabot tidak ditemukan.';
    if (S.bank.saldo >= it.harga) { S.bank.saldo -= it.harga; M().catatBank(S, 'Instal ' + it.nama + ' di ' + rg.nama, -it.harga); }
    else if ((S.uang.dompet || 0) >= it.harga) { S.uang.dompet -= it.harga; }
    else return 'Saldo tidak cukup untuk beli & instal ' + it.nama + ' (' + rp(it.harga) + ').';
    rg.isi.push({ id: it.id, nama: it.nama, hari: S.hari });
    if (it.sync && r.dihuni && S.rumah && S.rumah.barang) S.rumah.barang[it.sync] = true;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + it.harga;
    return { ok: true, teks: it.nama + ' berhasil dibeli dan diinstal di ' + rg.nama + '!' };
  }
  function tarifSewa(r, mode) {
    var h = (r && r.harga) || 166e6;
    if (mode === 'tahun') return Math.round(h * 0.06 / 100000) * 100000;
    return Math.round(h * 0.0055 / 50000) * 50000;
  }
  function sewakanRumah(S, idx, mode) {
    var list = daftarRumah(S), r = list[idx];
    if (!r) return 'Rumah tidak ditemukan.';
    if (r.status !== 'siap') return 'Kunci rumah belum diterima.';
    if (r.dihuni) return 'Rumah ini sedang kamu tempati. Pindah ke rumah lain atau kos dulu kalau mau disewakan.';
    var md = mode === 'tahun' ? 'tahun' : 'bulan', tf = tarifSewa(r, md);
    if (md === 'tahun') {
      r.sewa = { mode: 'tahun', tarif: tf, jatuhTempo: S.hari + 365 };
      S.bank.saldo += tf; M().catatBank(S, 'Kontrak tahunan ' + r.nama + ' (' + (r.lokasiTeks || namaKota(r.kota)) + ')', tf);
      S.hariIni.rental = (S.hariIni.rental || 0) + tf;
      S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + tf;
      return { ok: true, teks: r.nama + ' dikontrakkan 1 tahun! Uang sewa ' + rp(tf) + ' langsung masuk rekening.' };
    }
    r.sewa = { mode: 'bulan', tarif: tf, jatuhTempo: S.hari + 30 };
    return { ok: true, teks: r.nama + ' mulai disewakan per bulan (' + rp(tf) + '/bulan, masuk rekening tiap tanggal 1).' };
  }
  function hentiSewaRumah(S, idx) {
    var list = daftarRumah(S), r = list[idx];
    if (!r || !r.sewa) return 'Rumah tidak sedang disewakan.';
    r.sewa = null;
    return { ok: true, teks: 'Kontrak sewa ' + r.nama + ' dihentikan.' };
  }

  /* penghasilan sebulan: rata-rata laba kedai + ngojek 30 hari terakhir */
  function penghasilan(S) {
    var r = (S.riwayat || []).slice(-30); if (!r.length) return 0;
    return Math.round(r.reduce(function (t, x) { return t + (x.laba || 0) + (x.ojek || 0); }, 0) / r.length * 30);
  }
  function hitung(S, tipe, dp, tenorTahun, tunai, kotaId, wil) {
    var h = harga(S, tipe, kotaId, wil), K = P.komersial;
    if (tunai) { var b = bphtb(S, h, kotaId), n = Math.round(h * 0.01); return { harga: h, tunai: true, bphtb: b, notaris: n, bayarAwal: h + b + n, angsuran: 0 }; }
    if (tipe === 'subsidi') {
      var dpS = Math.round(h * P.subsidi.dp), pokokS = h - dpS, angS = Math.round(anuitas(pokokS, P.subsidi.bunga, tenorTahun * 12) / 100) * 100;
      return { harga: h, dp: dpS, pokok: pokokS, bunga: P.subsidi.bunga, biaya: P.subsidi.biayaAkad, bphtb: 0, bayarAwal: dpS + P.subsidi.biayaAkad, angsuran: angS, tenor: tenorTahun * 12 };
    }
    var uangMuka = Math.round(h * dp / 1e6) * 1e6, pokok = h - uangMuka, bb = bphtb(S, h, kotaId);
    var biaya = Math.round(pokok * K.provisi + h * K.notaris);
    var ang = Math.round(anuitas(pokok, K.bungaFix, tenorTahun * 12) / 100) * 100;
    var angFloat = Math.round(anuitas(pokok * 0.93, K.bungaFloating, tenorTahun * 12 - K.tahunFix * 12) / 100) * 100; /* perkiraan sisa pokok setelah masa tetap */
    return { harga: h, dp: uangMuka, pokok: pokok, bunga: K.bungaFix, biaya: biaya, bphtb: bb, bayarAwal: uangMuka + biaya + bb, angsuran: ang, angsuranFloating: angFloat, tenor: tenorTahun * 12 };
  }
  function syarat(S, tipe, x) {
    var daftar = [];
    if (x.tunai) { daftar.push({ teks: 'Saldo rekening ' + rp(x.bayarAwal), ok: S.bank.saldo >= x.bayarAwal }); return daftar; }
    daftar.push({ teks: 'Tidak ada riwayat telat bayar cicilan (SLIK OJK)', ok: !S.kreditBuruk });
    daftar.push({ teks: 'Saldo rekening untuk uang muka dan biaya ' + rp(x.bayarAwal), ok: S.bank.saldo >= x.bayarAwal });
    return daftar;
  }
  function ajukan(S, tipe, dp, tenorTahun, tunai, kotaId, wil, namaWil) {
    siapkan(S);
    if (tipe === 'subsidi' && tunai) return 'Rumah subsidi hanya lewat KPR FLPP.';
    var kId = kotaId || S.kota, wId = WILAYAH[wil] ? wil : 'kota';
    var nmW = String(namaWil || '').trim().slice(0, 32);
    var lblLok = (nmW ? nmW + ', ' : (wId !== 'kota' ? WILAYAH[wId].nama + ' ' : '')) + namaKota(kId);
    var x = hitung(S, tipe, dp, tenorTahun, tunai, kId, wId), s = syarat(S, tipe, x), gagal = s.filter(function (y) { return !y.ok; });
    if (gagal.length) return (tunai ? '' : 'Bank menolak: ') + gagal[0].teks + '.';
    var T = P.tipe[tipe];
    S.bank.saldo -= x.bayarAwal;
    M().catatBank(S, (tunai ? 'Beli tunai ' : 'Uang muka + biaya KPR ') + T.nama + ' (' + lblLok + ')', -x.bayarAwal);
    var baru = { id: 'rmh-' + S.hari + '-' + Math.floor(Math.random() * 999), tipe: tipe, kota: kId, wilayah: wId, alamatWilayah: nmW, lokasiTeks: lblLok, nama: T.nama, harga: x.harga, status: 'akad', kunciPada: S.hari + P.akadHari, dihuni: false, dibeli: S.hari,
      ruangan: buatRuangan(tipe), tagihanAir: 0, sewa: null,
      kpr: tunai ? null : { angsuran: x.angsuran, pokok: x.pokok, bunga: x.bunga, fixSampai: tipe === 'subsidi' ? Infinity : S.hari + P.komersial.tahunFix * 365, sisa: x.tenor, tempo: Math.min(28, KAL.tgl(S.hari).d), tunggakan: 0, bulanTelat: 0 } };
    S.properti.daftarRumah.push(baru);
    sinkronRumahUtama(S);
    S.properti.pernahRumah = true;
    return { ok: true, kunci: baru.kunciPada };
  }

  /* pindah: ke rumah pilihan atau balik ke kos. Hasil { ok, menit, biaya, teks } */
  function pindah(S, ke, paksa, rumahIdx) {
    var list = daftarRumah(S), r = rumahIdx != null ? list[rumahIdx] : S.properti.rumah, kos = g.KK_DIRI.kota(S);
    if (ke === 'rumah') {
      if (!r || r.status !== 'siap') return 'Kunci rumah belum diterima.';
      if (r.dihuni) return 'Sudah tinggal di rumah ini.';
      if (r.sewa) return 'Rumah ini sedang disewakan. Hentikan sewa dulu sebelum ditempati.';
    } else if (S.rumah.jenis === 'kos') return 'Sudah tinggal di kos.';
    var pikap = g.KK_MOBIL && g.KK_MOBIL.pikap(S), biaya = pikap || paksa ? 0 : P.jasaPindahan;
    if (biaya && S.bank.saldo < biaya) return 'Saldo rekening tidak cukup untuk jasa pindahan ' + rp(biaya) + '.';
    if (biaya) { S.bank.saldo -= biaya; M().catatBank(S, 'Jasa pindahan (pikap + 2 orang)', -biaya); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya; }
    var barang = S.rumah.barang, infoBarang = S.rumah.infoBarang || {};
    list.forEach(function (x) { x.dihuni = false; });
    if (ke === 'rumah') {
      r.dihuni = true;
      sinkronRumahUtama(S);
      var jrkWil = (WILAYAH[r.wilayah] && WILAYAH[r.wilayah].jarakTambah) || 0;
      S.rumah = { jenis: 'rumah', tipe: r.tipe, sewa: 0, kwh: 0, barang: barang, infoBarang: infoBarang, wifi: false, tempo: S.rumah.tempo, padam: true, jarak: dataKota(S, r.kota).jarak[r.tipe] + jrkWil };
    } else {
      sinkronRumahUtama(S);
      S.rumah = { jenis: 'kos', sewa: kos.kos, kwh: 10, barang: barang, infoBarang: infoBarang, wifi: false, tempo: Math.min(28, KAL.tgl(S.hari).d), padam: false, jarak: N.jarakKos };
      Object.keys(barang).forEach(function (id) { var b = g.KK_DIRI.barang(id); if (b && b.rumah) { delete barang[id]; delete infoBarang[id]; } });
      if (S.bank.saldo >= kos.kos) { S.bank.saldo -= kos.kos; M().catatBank(S, 'Sewa kos bulan pertama', -kos.kos); }
    }
    return { ok: true, menit: 180, biaya: biaya, pikap: pikap,
      teks: ke === 'rumah' ? 'Pindah ke ' + r.nama + ' (' + (r.lokasiTeks || namaKota(r.kota)) + ')' + (pikap ? ' pakai pikap sendiri.' : ', jasa pindahan ' + rp(biaya) + '.') + ' Meteran listrik rumah masih kosong: beli token di PLN Mobile.'
        : 'Pindah ke kos. Barang besar yang tidak muat dijual murah ke tetangga.' };
  }

  function bayarCicilanKpr(S, idx) {
    var list = daftarRumah(S), r = list[idx != null ? idx : 0];
    if (!r || !r.kpr) return 'Rumah ini tidak memiliki cicilan KPR.';
    var k = r.kpr, nmLok = r.nama + ' (' + (r.lokasiTeks || namaKota(r.kota)) + ')';
    if (k.tunggakan > 0) {
      var bT = Math.round(k.tunggakan);
      if (S.bank.saldo < bT) return 'Saldo rekening tidak cukup untuk bayar tunggakan KPR ' + rp(bT) + '.';
      S.bank.saldo -= bT; M().catatBank(S, 'Bayar tunggakan KPR ' + nmLok, -bT);
      k.tunggakan = 0; k.bulanTelat = 0;
      if (k.sisa <= 0) r.kpr = null;
      return { ok: true, jml: bT, teks: 'Tunggakan KPR ' + nmLok + ' (' + rp(bT) + ') lunas!' };
    }
    if (k.sisa <= 0) { r.kpr = null; return { ok: true, jml: 0, teks: 'KPR rumah sudah lunas.' }; }
    var bA = k.angsuran;
    if (S.bank.saldo < bA) return 'Saldo rekening tidak cukup untuk bayar angsuran KPR ' + rp(bA) + '.';
    S.bank.saldo -= bA; M().catatBank(S, 'Bayar angsuran KPR ' + nmLok, -bA);
    k.pokok = Math.max(0, k.pokok - (bA - k.pokok * k.bunga / 12)); k.sisa--;
    if (k.sisa <= 0 && !k.tunggakan) { r.kpr = null; return { ok: true, jml: bA, teks: 'Angsuran terakhir ' + rp(bA) + ' dibayar! KPR ' + nmLok + ' LUNAS!' }; }
    return { ok: true, jml: bA, teks: 'Angsuran KPR ' + nmLok + ' (' + rp(bA) + ') dibayar. Sisa ' + k.sisa + ' bulan.' };
  }
  function nilaiRumah(S, rObj) { var r = rObj || S.properti.rumah; return r ? Math.round(r.harga * Math.pow(1.04, (S.hari - r.dibeli) / 365) / 1e6) * 1e6 : 0; }
  function sisaPokok(S, rObj) { var r = rObj || S.properti.rumah; return r && r.kpr ? Math.round(r.kpr.pokok + r.kpr.tunggakan) : 0; }
  function jualRumah(S, idx) {
    var list = daftarRumah(S), i = idx != null ? idx : 0, r = list[i];
    if (!r) return 'Belum punya rumah.';
    if (r.status !== 'siap') return 'Rumah belum serah terima.';
    var nilai = nilaiRumah(S, r), pph = Math.round(nilai * P.pphJual), utang = sisaPokok(S, r), bersih = nilai - pph - utang;
    var pindahan = null;
    if (r.dihuni) { pindahan = pindah(S, 'kos', true); if (!pindahan.ok) return pindahan; }
    S.bank.saldo += bersih; M().catatBank(S, 'Jual ' + r.nama + ' (' + (r.lokasiTeks || namaKota(r.kota)) + ')', bersih);
    list.splice(i, 1);
    sinkronRumahUtama(S);
    return { ok: true, bersih: bersih, pindah: pindahan };
  }

  /* tanah */
  function indeks(S, hari) { return Math.pow(1 + P.kenaikanTanah, hari / 365); }
  function hargaTanah(S, luas) { return Math.round(dataKota(S).tanahM2 * luas * indeks(S, S.hari - S.properti.mulai) / 1e5) * 1e5; }
  function beliTanah(S, luas) {
    var h = hargaTanah(S, luas), b = bphtb(S, h), n = Math.round(h * 0.01), total = h + b + n;
    if (S.bank.saldo < total) return 'Butuh ' + rp(total) + ' (harga + BPHTB + notaris). Saldo rekening tidak cukup.';
    S.bank.saldo -= total; M().catatBank(S, 'Beli tanah ' + luas + ' m² (AJB, BPHTB, notaris)', -total);
    S.properti.tanah.push({ luas: luas, hargaBeli: h, hari: S.hari });
    return { ok: true, total: total };
  }
  function nilaiTanah(S, t) { return Math.round(t.hargaBeli * indeks(S, S.hari - t.hari) / 1e5) * 1e5; }
  function jualTanah(S, i) {
    var t = S.properti.tanah[i]; if (!t) return 'Tanah tidak ada.';
    var nilai = nilaiTanah(S, t), pph = Math.round(nilai * P.pphJual), bersih = nilai - pph;
    S.bank.saldo += bersih; M().catatBank(S, 'Jual tanah ' + t.luas + ' m² (setelah PPh)', bersih);
    S.properti.tanah.splice(i, 1);
    return { ok: true, bersih: bersih };
  }

  function gantiHari(S, nLama, nBaru) {
    var kabar = [], list = daftarRumah(S), tB = KAL.tgl(nBaru);
    if (!list.length) return kabar;
    for (var i = list.length - 1; i >= 0; i--) {
      var r = list[i], nmLok = r.nama + ' (' + (r.lokasiTeks || namaKota(r.kota)) + ')';
      if (r.status === 'akad' && nBaru >= r.kunciPada) { r.status = 'siap'; kabar.push('Kunci ' + nmLok + ' sudah diterima. Bisa ditempati atau disewakan di Properti.'); }
      /* pendapatan sewa rumah bulanan / perpanjangan tahunan */
      if (r.sewa && r.status === 'siap') {
        if (r.sewa.mode === 'bulan' && tB.d === 1) {
          S.bank.saldo += r.sewa.tarif; M().catatBank(S, 'Sewa bulanan ' + nmLok, r.sewa.tarif, nBaru);
          S.hariIni.rental = (S.hariIni.rental || 0) + r.sewa.tarif;
          S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + r.sewa.tarif;
          kabar.push('Uang sewa bulanan ' + nmLok + ' sebesar ' + rp(r.sewa.tarif) + ' masuk rekening.');
        } else if (r.sewa.mode === 'tahun' && nBaru >= (r.sewa.jatuhTempo || 0)) {
          r.sewa.jatuhTempo = nBaru + 365;
          S.bank.saldo += r.sewa.tarif; M().catatBank(S, 'Perpanjangan kontrak tahunan ' + nmLok, r.sewa.tarif, nBaru);
          S.hariIni.rental = (S.hariIni.rental || 0) + r.sewa.tarif;
          S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + r.sewa.tarif;
          kabar.push('Kontrak tahunan ' + nmLok + ' diperpanjang! ' + rp(r.sewa.tarif) + ' masuk rekening.');
        }
      }
      /* tagihan air ledeng (PDAM) bulanan untuk rumah yang dihuni (tidak disewakan) */
      if (tB.d === 1 && r.status === 'siap' && !r.sewa) {
        var air = hitungTagihanAir(S, r.tipe);
        if (S.bank.saldo >= air && !(r.tagihanAir > 0)) {
          S.bank.saldo -= air; M().catatBank(S, 'Tagihan air ledeng PDAM (' + (r.lokasiTeks || namaKota(r.kota)) + ')', -air, nBaru);
          kabar.push('Tagihan air ledeng (PDAM) ' + nmLok + ' ' + rp(air) + ' dibayar otomatis.');
        } else {
          r.tagihanAir = (r.tagihanAir || 0) + air;
          kabar.push('💧 Tagihan air ledeng (PDAM) ' + nmLok + ' ' + rp(r.tagihanAir) + ' belum dibayar!');
        }
      }
      var k = r.kpr;
      if (k && (k.sisa > 0 || k.tunggakan > 0)) {
        if (k.sisa > 0 && tB.d === k.tempo) {
          if (r.tipe !== 'subsidi' && nBaru >= k.fixSampai && k.bunga !== P.komersial.bungaFloating) {
            k.bunga = P.komersial.bungaFloating; k.angsuran = Math.round(anuitas(k.pokok, k.bunga, k.sisa) / 100) * 100;
            kabar.push('Masa bunga tetap KPR ' + nmLok + ' habis. Bunga floating ' + (k.bunga * 100).toFixed(1).replace('.', ',') + '%, angsuran jadi ' + rp(k.angsuran) + '.');
          }
          if (S.bank.saldo >= k.angsuran) {
            S.bank.saldo -= k.angsuran; M().catatBank(S, 'Autodebit KPR ' + nmLok, -k.angsuran, nBaru);
            k.pokok = Math.max(0, k.pokok - (k.angsuran - k.pokok * k.bunga / 12)); k.sisa--;
            kabar.push('🏠 Autodebit KPR ' + nmLok + ' ' + rp(k.angsuran) + ' berhasil. Sisa ' + k.sisa + ' bulan.');
          } else {
            k.tunggakan += k.angsuran; k.sisa--; k.bulanTelat++; S.kreditBuruk = true;
            kabar.push('⚠️ Saldo kurang untuk autodebit KPR ' + nmLok + '. Menunggak ' + k.bulanTelat + ' bulan.');
            if (k.bulanTelat >= P.sitaSetelahBulan) {
              if (r.dihuni) pindah(S, 'kos', true);
              list.splice(i, 1); sinkronRumahUtama(S);
              kabar.push('Bank menyita ' + nmLok + ' karena menunggak ' + k.bulanTelat + ' bulan.');
              continue;
            }
          }
        }
        if (k.tunggakan > 0 && S.bank.saldo >= k.tunggakan) {
          var btKpr = k.tunggakan; S.bank.saldo -= btKpr; M().catatBank(S, 'Autodebit tunggakan KPR ' + nmLok, -btKpr, nBaru);
          k.tunggakan = 0; k.bulanTelat = 0;
          kabar.push('🏠 Tunggakan KPR ' + nmLok + ' (' + rp(btKpr) + ') dibayar otomatis.');
        }
        if (k.sisa <= 0 && !k.tunggakan) { r.kpr = null; kabar.push('🎉 KPR ' + nmLok + ' lunas! Sertifikat rumah diambil di bank.'); }
      }
    }
    return kabar;
  }

  g.KK_PROPERTI = { siapkan: siapkan, daftarRumah: daftarRumah, daftarKota: daftarKota, namaKota: namaKota, dataKota: dataKota, WILAYAH: WILAYAH, harga: harga, hitung: hitung, syarat: syarat, ajukan: ajukan, pindah: pindah, penghasilan: penghasilan, nilaiRumah: nilaiRumah,
    sisaPokok: sisaPokok, jualRumah: jualRumah, hargaTanah: hargaTanah, beliTanah: beliTanah, nilaiTanah: nilaiTanah, jualTanah: jualTanah, bphtb: bphtb, gantiHari: gantiHari,
    PERABOT_RUANG: PERABOT_RUANG, hitungTagihanAir: hitungTagihanAir, bayarAir: bayarAir, bayarCicilanKpr: bayarCicilanKpr, instalPerabot: instalPerabot, tarifSewa: tarifSewa, sewakanRumah: sewakanRumah, hentiSewaRumah: hentiSewaRumah };
})(window);
