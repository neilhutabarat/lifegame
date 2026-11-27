/* kehidupan.js — sistem realisme kehidupan Indonesia:
   SIM/STNK/ETLE, Ban Brand Nyata & Tambal Ban, Mall/Pakaian/Aksesoris Driver,
   Investasi Emas Antam/Saham IHSG/Deposito, Pendidikan/Karier Kantoran/Sampingan,
   Bisnis Tambahan (Warung Madura/Laundry/Barbershop/Cuci Steam),
   Komunitas Driver (Spot Gacor), Acara Sosial (Kondangan/Arisan/Kurban),
   Stres/Mood, & Pindah Domisili Bebas (Kota/Kabupaten/Kecamatan/Desa). */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, UANG = g.KK_UANG;
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function batas(x) { return Math.max(0, Math.min(100, x)); }

  /* ---------- 1. Ban Brand Asli Indonesia ---------- */
  var BAN_MOTOR = [
    { id: 'irc_nr73', nama: 'IRC NR73 Tube/Tubeless', merek: 'IRC', harga: 215000, awet: 28000, grip: 1.0, ket: 'Ban harian standar pabrikan, ekonomis' },
    { id: 'fdr_genzi', nama: 'FDR Genzi Pro Tubeless', merek: 'FDR', harga: 245000, awet: 32000, grip: 1.08, ket: 'Nyaman di aspal basah, populer di kalangan ojol' },
    { id: 'maxxis_victra', nama: 'Maxxis Victra S98 ST', merek: 'Maxxis', harga: 340000, awet: 40000, grip: 1.18, ket: 'Dual compound lengket di tikungan & hujan' },
    { id: 'michelin_ps2', nama: 'Michelin Pilot Street 2', merek: 'Michelin', harga: 520000, awet: 48000, grip: 1.25, ket: 'Premium anti-selip hujan deras, sangat awet' },
    { id: 'pirelli_diablo', nama: 'Pirelli Diablo Rosso Sport', merek: 'Pirelli', harga: 590000, awet: 45000, grip: 1.3, ket: 'Performa tinggi & stabil di kecepatan tinggi' }
  ];
  var BAN_MOBIL = [
    { id: 'gtradial_eco', nama: 'GT Radial Champiro Eco (4 Ban)', merek: 'GT Radial', harga: 2400000, awet: 65000, grip: 1.0, ket: 'Ban asli Indonesia irit BBM & terjangkau' },
    { id: 'achilles_plat', nama: 'Achilles Platinum (4 Ban)', merek: 'Achilles', harga: 2800000, awet: 70000, grip: 1.06, ket: 'Senyap & stabil untuk GoCar harian' },
    { id: 'dunlop_ena', nama: 'Dunlop Enasave EC300+ (4 Ban)', merek: 'Dunlop', harga: 3400000, awet: 80000, grip: 1.12, ket: 'Standar OEM MPV Indonesia, empuk & hemat BBM' },
    { id: 'bridgestone_t005', nama: 'Bridgestone Turanza T005A (4 Ban)', merek: 'Bridgestone', harga: 4600000, awet: 90000, grip: 1.22, ket: 'Kenyamanan kelas atas untuk Travel antarkota' },
    { id: 'michelin_p4', nama: 'Michelin Primacy 4 ST (4 Ban)', merek: 'Michelin', harga: 6200000, awet: 100000, grip: 1.3, ket: 'Paling senyap, pengereman basah terbaik, awet 100rb km' }
  ];

  /* ---------- 2. Mall: Koleksi Pakaian & Aksesoris Driver ---------- */
  var PAKAIAN = [
    { id: 'kaos_harian', nama: 'Kaos Katun Harian', harga: 65000, warna: '#2b6cb0', karisma: 0, ket: 'Santai & adem dipakai di rumah atau jalan' },
    { id: 'jaket_driver', nama: 'Jaket Driver Anti-Angin', harga: 145000, warna: '#00aa13', karisma: 4, ket: 'Tampilan rapi profesional saat narik ojol (+rating)' },
    { id: 'kemeja_flanel', nama: 'Kemeja Flanel Kasual', harga: 195000, warna: '#b83227', karisma: 8, ket: 'Keren buat nongkrong warkop, mall & kencan' },
    { id: 'batik_kantor', nama: 'Batik Lengan Panjang', harga: 240000, warna: '#7b4b2a', karisma: 12, ket: 'Wajib rapi untuk kondangan & kerja kantoran' },
    { id: 'hoodie_street', nama: 'Hoodie Streetwear', harga: 285000, warna: '#37474f', karisma: 10, ket: 'Hangat saat malam hari & cocok buat Sunmori' },
    { id: 'baju_lebaran', nama: 'Baju Koko / Gamis Lebaran', harga: 320000, warna: '#0d7a5f', karisma: 14, ket: 'Elegan untuk ibadah, sholat & silaturahmi Hari Raya' },
    { id: 'jas_eksekutif', nama: 'Setelan Jas Eksekutif', harga: 850000, warna: '#1e293b', karisma: 20, ket: 'Aura bos sukses · bonus diterima karier & relasi!' }
  ];
  var AKS_DRIVER = [
    { id: 'jashujan', nama: 'Jas Hujan Anti-Bocor', harga: 135000, ket: 'Cegah masuk angin & flu saat narik di tengah hujan!' },
    { id: 'holder_hp', nama: 'Holder HP Waterproof', harga: 75000, ket: 'Navigasi Maps lebih aman & cepat saat hujan/panas' },
    { id: 'helm_kyt', nama: 'Helm KYT / INK SNI', harga: 390000, ket: 'Aman dari razia helm & penumpang lebih percaya (+rating)' },
    { id: 'helm_arai', nama: 'Helm Arai Full-Face Original', harga: 6500000, ket: 'Perlindungan sultan & gaya maksimal saat Sunmori' },
    { id: 'box_deliv', nama: 'Box Delivery / Rak Bagasi', harga: 480000, ket: 'Bawa paket/makanan aman dari hujan (+tip order)' }
  ];

  /* ---------- 3. Investasi Nyata Indonesia (2026) ---------- */
  var INVEST_KATALOG = [
    { id: 'emas_antam', nama: 'Emas Antam LM (per 0,5 gr)', jenis: 'emas', satuan: '0,5g', hargaDasar: 860000, vol: 0.012, dividenThn: 0, ket: 'Logam Mulia Antam 99,99% · lindung nilai inflasi' },
    { id: 'bbca', nama: 'Saham BBCA (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 980000, vol: 0.018, dividenThn: 0.032, ket: 'PT Bank Central Asia Tbk · Blue-chip stabil' },
    { id: 'bbri', nama: 'Saham BBRI (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 450000, vol: 0.022, dividenThn: 0.068, ket: 'PT Bank Rakyat Indonesia Tbk · dividen jumbo' },
    { id: 'bmri', nama: 'Saham BMRI (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 610000, vol: 0.02, dividenThn: 0.055, ket: 'PT Bank Mandiri Tbk · kinerja kuat' },
    { id: 'tlkm', nama: 'Saham TLKM (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 285000, vol: 0.021, dividenThn: 0.058, ket: 'PT Telkom Indonesia Tbk · sektor telekomunikasi' },
    { id: 'asii', nama: 'Saham ASII (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 510000, vol: 0.023, dividenThn: 0.072, ket: 'PT Astra International Tbk · otomotif & alat berat' },
    { id: 'antm', nama: 'Saham ANTM (1 Lot = 100 lbr)', jenis: 'saham', satuan: 'lot', hargaDasar: 165000, vol: 0.032, dividenThn: 0.045, ket: 'PT Aneka Tambang Tbk · emas & nikel' },
    { id: 'rdpu', nama: 'Reksa Dana Pasar Uang', jenis: 'rd', satuan: 'unit', hargaDasar: 100000, vol: 0.002, dividenThn: 0.052, ket: 'Stabil naik pelan ~5,2%/tahun, bebas pajak & cair cepat' },
    { id: 'deposito', nama: 'Deposito Bank Berjangka', jenis: 'dep', satuan: 'slot', hargaDasar: 1000000, vol: 0, dividenThn: 0.045, ket: 'Bunga pasti 4,5%/tahun cair otomatis ke bank tiap bulan' }
  ];

  /* ---------- 4. Pendidikan Terakhir, Karier Tetap & Kerja Sampingan ---------- */
  var PENDIDIKAN = [
    { id: 'sma', nama: 'SMA / SMK', level: 1, biayaKuliah: 0 },
    { id: 'd3', nama: 'D3 Diploma', level: 2, biayaKuliah: 8500000 },
    { id: 's1', nama: 'S1 Sarjana', level: 3, biayaKuliah: 16000000 },
    { id: 's2', nama: 'S2 Magister', level: 4, biayaKuliah: 32000000 }
  ];
  var KARIER_TETAP = [
    { id: 'kurir_hub', nama: 'Kurir / Admin Gudang Ekspedisi', minLvl: 1, gaji: 3600000, jam: 8, ket: 'Syarat SMA/SMK · Senin–Jumat · Gaji tgl 1 + THR 1× gaji' },
    { id: 'staf_admin', nama: 'Staf Administrasi & Kasir Kantor', minLvl: 1, gaji: 4200000, jam: 8, ket: 'Syarat SMA/SMK · Senin–Jumat · Ruang ber-AC' },
    { id: 'staf_it', nama: 'Staf Finance / IT Support', minLvl: 2, gaji: 5800000, jam: 8, ket: 'Syarat D3 Diploma · Senin–Jumat · Tunjangan makan & THR' },
    { id: 'analis_spv', nama: 'Analis Bisnis / Supervisor', minLvl: 3, gaji: 9500000, jam: 8, ket: 'Syarat S1 Sarjana · Senin–Jumat · Karier mapan + THR' },
    { id: 'manager_pro', nama: 'Senior Manager / Konsultan', minLvl: 4, gaji: 18000000, jam: 8, ket: 'Syarat S2 Magister · Senin–Jumat · Gaji eksekutif + THR' }
  ];
  var KERJA_SAMPINGAN = [
    { id: 'spx_borong', nama: 'Kurir Paket Borongan (SPX/J&T)', menit: 180, upah: 115000, stamina: -24, stres: 10, butuhMotor: true, ket: 'Antar 35 paket area sekitar (3 jam) · cair tunai langsung' },
    { id: 'jasa_konten', nama: 'Jasa Foto & Video Konten UMKM', menit: 120, upah: 165000, stamina: -12, stres: 6, butuhMotor: false, ket: 'Pakai kamera HP-mu untuk foto produk lokal (bonus HP flagship!)' },
    { id: 'dropship_hp', nama: 'Jualan Online / Dropship dari HP', menit: 60, upah: 85000, stamina: -6, stres: 4, butuhMotor: false, ket: 'Kelola pesanan online 1 jam dari mana saja (butuh kuota/WiFi)' }
  ];

  /* ---------- 5. Bisnis Tambahan Nyata ---------- */
  var BISNIS_LIST = [
    { id: 'warung_madura', nama: 'Warung Madura 24 Jam', ikon: '🏪', modal: 12000000, labaHari: 380000, ket: 'Buka 24 jam jual sembako, bensin eceran, rokok & token PLN' },
    { id: 'laundry_kilo', nama: 'Laundry Kiloan Express', ikon: '🧺', modal: 18000000, labaHari: 520000, ket: 'Ramai anak kos & keluarga, mesin cuci & setrika uap' },
    { id: 'barbershop', nama: 'Barbershop Modern AC', ikon: '💈', modal: 28000000, labaHari: 780000, ket: 'Potong rambut pria modern, margin tinggi & pelanggan rutin' },
    { id: 'cuci_steam', nama: 'Usaha Cuci Steam Motor & Mobil', ikon: '🚿', modal: 35000000, labaHari: 950000, ket: 'Ramai tiap habis hujan & akhir pekan · hidrolik profesional' }
  ];

  function levelDidik(id) {
    var f = PENDIDIKAN.filter(function (x) { return x.id === id; })[0];
    return f ? f.level : 1;
  }
  function namaDidik(id) {
    var f = PENDIDIKAN.filter(function (x) { return x.id === id; })[0];
    return f ? f.nama : 'SMA / SMK';
  }

  function siapkan(S) {
    if (!S) return S;
    S.profil = S.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa' };
    if (!S.profil.pendidikan) S.profil.pendidikan = 'sma';
    if (S.diri && typeof S.diri.stres !== 'number') S.diri.stres = 12;
    S.surat = S.surat || { simC: (S.hari || 0) + 1825, simA: (S.hari || 0) + 1825, tilang: [] };
    S.surat.tilang = S.surat.tilang || [];
    S.pakaian = S.pakaian || { milik: { kaos_harian: true, jaket_driver: true }, pakai: 'jaket_driver', aks: {} };
    S.pakaian.milik = S.pakaian.milik || { kaos_harian: true };
    S.pakaian.aks = S.pakaian.aks || {};
    S.invest = S.invest || { harga: {}, milik: {}, updateHari: -1 };
    INVEST_KATALOG.forEach(function (a) {
      if (!S.invest.harga[a.id]) S.invest.harga[a.id] = a.hargaDasar;
    });
    S.karier = S.karier || { id: null, kerjaHariIni: -1, hadirBulan: 0, thrTahun: 0 };
    S.bisnisLain = S.bisnisLain || {};
    S.sosial = S.sosial || { arisanHari: -1, kondanganHari: -1, kurbanTahun: 0 };
    return S;
  }

  function ubahStres(S, delta) {
    siapkan(S);
    if (!S.diri) return 0;
    S.diri.stres = batas((S.diri.stres || 0) + delta);
    return S.diri.stres;
  }

  /* ---------- Surat, SIM, & Tilang ETLE ---------- */
  function perpanjangSim(S, jenis) {
    siapkan(S);
    var biaya = jenis === 'simA' ? 250000 : 185000;
    var by = UANG.bayarPilihan(S, biaya, 'Perpanjang ' + (jenis === 'simA' ? 'SIM A' : 'SIM C') + ' (5 tahun)', S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.surat[jenis] = Math.max(S.hari, S.surat[jenis] || S.hari) + 1825;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya;
    return { ok: true, teks: '🪪 ' + (jenis === 'simA' ? 'SIM A' : 'SIM C') + ' resmi diperpanjang 5 tahun (' + rp(biaya) + ')!' };
  }
  function bayarTilang(S, idx) {
    siapkan(S);
    var t = S.surat.tilang[idx];
    if (!t) return 'Data tilang tidak ditemukan.';
    var by = UANG.bayarPilihan(S, t.denda, 'Bayar Tilang BRIVA: ' + t.alasan, S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.surat.tilang.splice(idx, 1);
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + t.denda;
    ubahStres(S, -8);
    return { ok: true, teks: '✅ Tilang BRIVA (' + t.alasan + ') lunas ' + rp(t.denda) + '.' };
  }
  function cekRaziaJalan(S, mode) {
    siapkan(S);
    var isCar = mode === 'mobil';
    var simExp = isCar ? (S.hari > (S.surat.simA || 0)) : (S.hari > (S.surat.simC || 0));
    var pjkTelat = isCar ? (S.mobil && S.hari > (S.mobil.pajakTempo || S.hari + 1)) : (S.motor && S.hari > (S.motor.pajakTempo || S.hari + 1));
    var tanpaHelm = !isCar && !(S.pakaian.aks && (S.pakaian.aks.helm_kyt || S.pakaian.aks.helm_arai)) && Math.random() < 0.12;
    if ((simExp || pjkTelat || tanpaHelm) && Math.random() < 0.08) {
      var alasan = simExp ? (isCar ? 'SIM A mati' : 'SIM C mati') : pjkTelat ? 'Pajak STNK telat' : 'Helm tidak standar SNI (ETLE)';
      var denda = simExp ? 500000 : pjkTelat ? 350000 : 250000;
      S.surat.tilang.push({ hari: S.hari, alasan: alasan, denda: denda });
      ubahStres(S, 14);
      return '🚨 Kena Razia / Kamera ETLE (' + alasan + ')! Denda ' + rp(denda) + ' masuk ke menu 🪪 Surat & Polisi.';
    }
    return null;
  }

  /* ---------- Ban Brand Nyata, Tambal Ban & Cuci Steam ---------- */
  function gantiBanMerek(S, jenis, banId) {
    siapkan(S);
    var isCar = jenis === 'mobil', knd = isCar ? S.mobil : S.motor;
    if (!knd) return isCar ? 'Belum punya mobil.' : 'Belum punya motor.';
    var list = isCar ? BAN_MOBIL : BAN_MOTOR;
    var b = list.filter(function (x) { return x.id === banId; })[0];
    if (!b) return 'Merek ban tidak ditemukan.';
    var by = UANG.bayarPilihan(S, b.harga, 'Ganti ban ' + b.nama + ' (' + knd.nama + ')', S._metodeBayar || 'bank');
    if (by !== true) return by;
    knd.kmBan = knd.km;
    knd.merekBan = b.nama;
    knd.awetBan = b.awet;
    knd.banBocor = false;
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + b.harga;
    return { ok: true, teks: '🛞 ' + knd.nama + ' dipasangi ban baru ' + b.nama + ' (' + rp(b.harga) + ', awet ' + b.awet.toLocaleString('id-ID') + ' km)!' };
  }
  function tambalBan(S, jenis) {
    siapkan(S);
    var isCar = jenis === 'mobil', knd = isCar ? S.mobil : S.motor;
    if (!knd) return 'Kendaraan tidak ditemukan.';
    var biaya = isCar ? 45000 : 20000;
    var by = UANG.bayarPilihan(S, biaya, 'Tambal ban tubeless ' + knd.nama, S._metodeBayar || 'dompet');
    if (by !== true) return by;
    knd.banBocor = false;
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + biaya;
    return { ok: true, menit: 20, teks: '🔧 Ban ' + knd.nama + ' selesai ditambal (' + rp(biaya) + ', 20 mnt). Siap jalan lagi!' };
  }
  function cuciSteam(S, jenis) {
    siapkan(S);
    var isCar = jenis === 'mobil', knd = isCar ? S.mobil : S.motor;
    if (!knd) return isCar ? 'Belum punya mobil.' : 'Belum punya motor.';
    var biaya = isCar ? 45000 : 15000;
    var by = UANG.bayarPilihan(S, biaya, 'Cuci steam ' + knd.nama, S._metodeBayar || 'dompet');
    if (by !== true) return by;
    if (S.ojek) {
      S.ojek.cuciSampai = S.hari + 3;
      S.ojek.rating = Math.min(5, Math.round(((S.ojek.rating || 4.85) + 0.04) * 100) / 100);
    }
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + biaya;
    return { ok: true, menit: 25, teks: '🚿 ' + knd.nama + ' dicuci steam kinclong (' + rp(biaya) + ')! Rating penumpang lebih mantap selama 3 hari.' };
  }

  /* ---------- Mall: Pakaian & Aksesoris Driver ---------- */
  function beliPakaian(S, id) {
    siapkan(S);
    var p = PAKAIAN.filter(function (x) { return x.id === id; })[0];
    if (!p) return 'Pakaian tidak ditemukan.';
    if (S.pakaian.milik[id]) { S.pakaian.pakai = id; return { ok: true, teks: '👕 Sekarang memakai ' + p.nama + '.' }; }
    var by = UANG.bayarPilihan(S, p.harga, 'Mall: Beli ' + p.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.pakaian.milik[id] = true;
    S.pakaian.pakai = id;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + p.harga;
    ubahStres(S, -10);
    return { ok: true, teks: '🛍️ ' + p.nama + ' dibeli (' + rp(p.harga) + '), masuk Lemari Pakaian & langsung dipakai!' };
  }
  function pakaiBaju(S, id) {
    siapkan(S);
    if (!S.pakaian.milik[id]) return 'Belum punya pakaian ini. Beli dulu di Mall.';
    var p = PAKAIAN.filter(function (x) { return x.id === id; })[0];
    S.pakaian.pakai = id;
    return { ok: true, teks: '👕 Berganti memakai ' + (p ? p.nama : id) + '.' };
  }
  function warnaBajuAktif(S) {
    siapkan(S);
    var p = PAKAIAN.filter(function (x) { return x.id === (S.pakaian && S.pakaian.pakai); })[0];
    return p ? p.warna : '#00aa13';
  }
  function beliAksDriver(S, id) {
    siapkan(S);
    var a = AKS_DRIVER.filter(function (x) { return x.id === id; })[0];
    if (!a) return 'Aksesoris tidak ditemukan.';
    if (S.pakaian.aks[id]) return 'Sudah memiliki ' + a.nama + '.';
    var by = UANG.bayarPilihan(S, a.harga, 'Mall: Beli ' + a.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.pakaian.aks[id] = true;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + a.harga;
    return { ok: true, teks: '🛍️ ' + a.nama + ' dibeli (' + rp(a.harga) + ') & aktif dipakai!' };
  }

  /* ---------- Investasi Nyata 2026 ---------- */
  function hargaInvest(S, id) {
    siapkan(S);
    return S.invest.harga[id] || (INVEST_KATALOG.filter(function (x) { return x.id === id; })[0] || { hargaDasar: 100000 }).hargaDasar;
  }
  function beliInvest(S, id, qty) {
    siapkan(S);
    var a = INVEST_KATALOG.filter(function (x) { return x.id === id; })[0];
    qty = Math.max(1, Math.round(+qty || 1));
    if (!a) return 'Instrumen investasi tidak ditemukan.';
    var total = hargaInvest(S, id) * qty;
    var by = UANG.bayarPilihan(S, total, 'Investasi: Beli ' + qty + ' ' + a.satuan + ' ' + a.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    var cur = S.invest.milik[id] || { qty: 0, modal: 0 };
    cur.qty += qty; cur.modal += total;
    S.invest.milik[id] = cur;
    return { ok: true, teks: '📈 Beli ' + qty + ' ' + a.satuan + ' ' + a.nama + ' (' + rp(total) + ') berhasil!' };
  }
  function jualInvest(S, id, qty) {
    siapkan(S);
    var a = INVEST_KATALOG.filter(function (x) { return x.id === id; })[0];
    var cur = S.invest.milik[id];
    if (!a || !cur || cur.qty <= 0) return 'Belum memiliki aset ini.';
    qty = qty === 'semua' ? cur.qty : Math.min(cur.qty, Math.max(1, Math.round(+qty || 1)));
    var hasil = hargaInvest(S, id) * qty;
    var modalProp = Math.round(cur.modal * (qty / cur.qty));
    cur.qty -= qty; cur.modal = Math.max(0, cur.modal - modalProp);
    if (cur.qty <= 0) delete S.invest.milik[id];
    S.bank.saldo += hasil;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual investasi: ' + qty + ' ' + a.satuan + ' ' + a.nama, jml: hasil });
    var untung = hasil - modalProp;
    return { ok: true, teks: '💰 Jual ' + qty + ' ' + a.satuan + ' ' + a.nama + ' cair ' + rp(hasil) + ' (' + (untung >= 0 ? 'laba +' : 'rugi −') + rp(Math.abs(untung)) + ') ke bank.' };
  }
  function nilaiPortofolio(S) {
    siapkan(S);
    var tot = 0, mod = 0;
    Object.keys(S.invest.milik || {}).forEach(function (id) {
      var cur = S.invest.milik[id];
      if (!cur || cur.qty <= 0) return;
      tot += hargaInvest(S, id) * cur.qty;
      mod += cur.modal || 0;
    });
    return { nilai: tot, modal: mod, laba: tot - mod };
  }

  /* ---------- Karier Kantoran, Kuliah Malam & Kerja Sampingan ---------- */
  function kuliahUpgrade(S) {
    siapkan(S);
    var curLvl = levelDidik(S.profil.pendidikan);
    var next = PENDIDIKAN.filter(function (x) { return x.level === curLvl + 1; })[0];
    if (!next) return 'Pendidikanmu sudah tingkat tertinggi (S2 Magister)!';
    var by = UANG.bayarPilihan(S, next.biayaKuliah, 'Biaya Kuliah Malam / UT: ' + next.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.profil.pendidikan = next.id;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + next.biayaKuliah;
    return { ok: true, menit: 120, teks: '🎓 Selamat! Lulus kuliah malam & resmi menyandang pendidikan ' + next.nama + '! Karier gaji tinggi kini terbuka.' };
  }
  function lamarKerja(S, id) {
    siapkan(S);
    var kj = KARIER_TETAP.filter(function (x) { return x.id === id; })[0];
    if (!kj) return 'Lowongan tidak ditemukan.';
    if (levelDidik(S.profil.pendidikan) < kj.minLvl) {
      var sy = PENDIDIKAN.filter(function (x) { return x.level === kj.minLvl; })[0];
      return 'Butuh pendidikan minimal ' + (sy ? sy.nama : 'lebih tinggi') + ' untuk posisi ' + kj.nama + '. Ambil Kuliah Malam dulu!';
    }
    S.karier.id = kj.id;
    S.karier.hadirBulan = 0;
    return { ok: true, teks: '💼 Diterima bekerja sebagai ' + kj.nama + ' (gaji ' + rp(kj.gaji) + '/bln · Senin–Jumat)! Sore & Sabtu–Minggu tetap bebas ngojek.' };
  }
  function berhentiKerja(S) {
    siapkan(S);
    if (!S.karier.id) return 'Kamu sedang tidak terikat pekerjaan kantoran.';
    S.karier.id = null;
    return { ok: true, teks: 'Resign dari pekerjaan kantoran selesai. Kini bebas penuh waktu.' };
  }
  function masukKerjaHariIni(S) {
    siapkan(S);
    var kj = KARIER_TETAP.filter(function (x) { return x.id === S.karier.id; })[0];
    if (!kj) return 'Belum memiliki pekerjaan tetap. Lamar dulu di menu Karier.';
    var dow = KAL.tgl(S.hari).dow;
    if (dow === 0 || dow === 6) return 'Hari ini akhir pekan (Sabtu/Minggu) — kantor libur! Nikmati waktu luang atau narik ojol.';
    if (S.karier.kerjaHariIni === S.hari) return 'Kamu sudah selesai sif kerja kantor hari ini! Sore ini bisa santai atau narik ojol.';
    if (S.diri.stamina < 25) return 'Stamina terlalu rendah untuk kerja kantor. Tidur atau minum kopi dulu.';
    S.karier.kerjaHariIni = S.hari;
    S.karier.hadirBulan = (S.karier.hadirBulan || 0) + 1;
    S.diri.stamina = batas(S.diri.stamina - 30);
    S.diri.kenyang = batas(S.diri.kenyang - 22);
    S.diri.minum = batas(S.diri.minum - 24);
    ubahStres(S, 14);
    var uangMakan = 45000;
    S.uang.dompet = (S.uang.dompet || 0) + uangMakan;
    return { ok: true, menit: kj.jam * 60, teks: '🏢 Selesai kerja ' + kj.nama + ' (8 jam · hadir bulan ini: ' + S.karier.hadirBulan + ' hr) + uang makan ' + rp(uangMakan) + '!' };
  }
  function kerjaSampingan(S, id) {
    siapkan(S);
    var ks = KERJA_SAMPINGAN.filter(function (x) { return x.id === id; })[0];
    if (!ks) return 'Pekerjaan sampingan tidak ditemukan.';
    if (ks.butuhMotor && !(g.KK_MOTOR && g.KK_MOTOR.siapPakai(S))) return 'Butuh motor yang tidak sedang disewakan untuk kerja sampingan ini.';
    if (S.diri.stamina < 18) return 'Stamina terlalu rendah. Istirahat dulu.';
    var bonusKamera = id === 'jasa_konten' && g.KK_DIRI && g.KK_DIRI.kameraHp ? Math.round(ks.upah * Math.max(0, g.KK_DIRI.kameraHp(S) - 1) * 0.45 / 5000) * 5000 : 0;
    var upah = ks.upah + bonusKamera;
    S.uang.dompet = (S.uang.dompet || 0) + upah;
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + upah;
    S.diri.stamina = batas(S.diri.stamina + ks.stamina);
    ubahStres(S, ks.stres);
    return { ok: true, menit: ks.menit, teks: '⚡ Selesai ' + ks.nama + ' (' + ks.menit + ' mnt) · cair ' + rp(upah) + ' ke Dompet!' };
  }

  /* ---------- Bisnis Tambahan Nyata ---------- */
  function bukaBisnis(S, id) {
    siapkan(S);
    var b = BISNIS_LIST.filter(function (x) { return x.id === id; })[0];
    if (!b) return 'Jenis bisnis tidak dikenal.';
    if (S.bisnisLain[id]) return 'Kamu sudah memiliki usaha ' + b.nama + '.';
    var by = UANG.bayarPilihan(S, b.modal, 'Modal buka usaha: ' + b.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    S.bisnisLain[id] = { dibuka: S.hari, level: 1, totalLaba: 0 };
    return { ok: true, teks: b.ikon + ' Usaha ' + b.nama + ' resmi dibuka! Laba bersih ±' + rp(b.labaHari) + '/hari cair otomatis tiap pagi ke rekening.' };
  }

  /* ---------- Komunitas Driver & Acara Sosial ---------- */
  function infoSpotGacor(menit) {
    var jam = Math.floor((menit || 480) % 1440 / 60);
    if (jam >= 6 && jam < 10) return '🔥 Jam Berangkat Kerja (06–09): Perumahan, Terminal & Pelabuhan ramai GoRide/GoCar!';
    if (jam >= 11 && jam < 14) return '🍽️ Jam Makan Siang (11–14): Perkantoran & Kuliner ramai order GoFood!';
    if (jam >= 16 && jam < 20) return '🌆 Jam Pulang Kerja (16–20): Mall, Pusat Kota & Stasiun paling gacor!';
    if (jam >= 20) return '🌙 Malam Hari: Kuliner malam, kafe & bandara/pool travel paling ramai.';
    return '☕ Pagi/Siang Santai: Area pasar & pertokoan stabil order paket & penumpang.';
  }
  function acaraSosial(S, jenis) {
    siapkan(S);
    if (jenis === 'kondangan') {
      if (S.sosial.kondanganHari === S.hari) return 'Hari ini sudah menghadiri kondangan.';
      var amplop = 100000;
      var by = UANG.bayarPilihan(S, amplop, 'Amplop Kondangan teman/tetangga', S._metodeBayar || 'dompet');
      if (by !== true) return by;
      S.sosial.kondanganHari = S.hari;
      S.diri.kenyang = 100; S.diri.minum = 100;
      ubahStres(S, -18);
      (S.teman || []).slice(0, 3).forEach(function (t) { t.hubungan = Math.min(100, (t.hubungan || 40) + 6); });
      return { ok: true, menit: 90, teks: '💐 Hadir Kondangan (amplop ' + rp(amplop) + ')! Makan prasmanan kenyang 100%, stres turun & relasi teman naik!' };
    }
    if (jenis === 'arisan') {
      if (S.sosial.arisanHari === S.hari) return 'Sudah ikut kumpul Arisan Driver hari ini.';
      var iuran = 100000;
      var byA = UANG.bayarPilihan(S, iuran, 'Iuran Arisan Komunitas Driver', S._metodeBayar || 'dompet');
      if (byA !== true) return byA;
      S.sosial.arisanHari = S.hari;
      ubahStres(S, -14);
      var menang = Math.random() < 0.16;
      if (menang) {
        S.uang.dompet = (S.uang.dompet || 0) + 800000;
        return { ok: true, menit: 60, teks: '🎉 NARIK ARISAN! Kamu menang kocokan Arisan Driver +Rp800.000 tunai!' };
      }
      return { ok: true, menit: 60, teks: '🤝 Kumpul Arisan Komunitas Driver (' + rp(iuran) + '). Dapat banyak info spot gacor & stres berkurang!' };
    }
    if (jenis === 'kurban') {
      var thn = KAL.tgl(S.hari).y;
      if (S.sosial.kurbanTahun === thn) return 'Kamu sudah berkurban tahun ' + thn + ' ini. InsyaAllah berkah!';
      var biayaK = 2800000;
      var byK = UANG.bayarPilihan(S, biayaK, 'Patungan Kurban Iduladha ' + thn, S._metodeBayar || 'bank');
      if (byK !== true) return byK;
      S.sosial.kurbanTahun = thn;
      S.diri.rasaBersalah = 0; ubahStres(S, -35); S.diri.kesehatan = batas((S.diri.kesehatan || 80) + 10);
      return { ok: true, menit: 60, teks: '🐐 Alhamdulillah! Ibadah Kurban tahun ' + thn + ' (' + rp(biayaK) + ') tercatat. Hati tenang & penuh berkah!' };
    }
    return 'Acara tidak dikenal.';
  }

  /* ---------- Domisili Nomaden & Tier Wilayah (Kota / Kabupaten / Desa) ---------- */
  function tierWilayah(S) {
    var lok = (g.KK_OJEK && g.KK_OJEK.lokasiSekarang) ? g.KK_OJEK.lokasiSekarang(S) : null;
    if (!lok) return 'kota';
    if (lok.kabId === 'pontianak' || lok.kabId === 'singkawang') {
      if (lok.kecId === 'ptk_uta' || lok.kecId === 'skw_ut' || lok.kecId === 'skw_tim') return 'kabupaten';
      return 'kota';
    }
    /* ibu kota kabupaten (kecamatan pertama di daftar kab) = kabupaten, kecamatan pedalaman lainnya = desa */
    var kb = g.KK_WILAYAH && g.KK_WILAYAH.kalbar && g.KK_WILAYAH.kalbar[lok.kabId];
    if (kb && kb.kec && kb.kec.length) {
      if (kb.kec[0].id === lok.kecId) return 'kabupaten';
      return 'desa';
    }
    return 'kota';
  }
  function pindahDomisili(S, kabId, kecId) {
    siapkan(S);
    if (S.surat.tilang && S.surat.tilang.length > 0) return 'Lunasi dulu tilang ETLE di menu 🪪 Surat & Polisi sebelum pindah domisili.';
    var W = g.KK_WILAYAH;
    if (!W || !W.kalbar || !W.kalbar[kabId]) return 'Wilayah tujuan belum tersedia.';
    var kb = W.kalbar[kabId];
    var kc = kb.kec.filter(function (x) { return x.id === kecId; })[0] || kb.kec[0];
    var titik = W.titikDesa(kabId, kc, kc.desa[0]);
    S.kota = kabId === 'pontianak' ? 'pontianak' : S.kota; /* pertahankan referensi UMK Kalbar */
    S.rumah = S.rumah || {};
    S.rumah.wilayah = titik;
    if (S.ojek) { S.ojek.lokasi = titik; S.ojek.pos = { x: 0, y: 0 }; }
    return { ok: true, teks: '🚚 Berhasil pindah domisili ke ' + titik.desa + ', Kec. ' + titik.kecNama + ' (' + titik.kabNama + ') · Suasana lingkungan: ' + tierWilayah(S).toUpperCase() + '!' };
  }

  /* ---------- Pergantian Hari: Investasi, Gaji & THR Karier, Bisnis Tambahan ---------- */
  function gantiHari(S, nLama, nBaru) {
    siapkan(S);
    var kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru);
    /* 1. Fluktuasi harga harian Emas Antam & Saham IHSG */
    INVEST_KATALOG.forEach(function (a) {
      if (a.vol > 0) {
        var cur = S.invest.harga[a.id] || a.hargaDasar;
        var drift = a.jenis === 'rd' ? 0.00014 : a.jenis === 'emas' ? 0.00025 : 0.00015;
        var chg = drift + (Math.random() - 0.5) * 2 * a.vol;
        var baru = Math.round(Math.max(a.hargaDasar * 0.65, Math.min(a.hargaDasar * 2.2, cur * (1 + chg))) / 500) * 500;
        S.invest.harga[a.id] = baru;
      }
    });
    /* 2. Laba harian bisnis tambahan */
    var totBisnis = 0;
    Object.keys(S.bisnisLain || {}).forEach(function (bid) {
      var bm = BISNIS_LIST.filter(function (x) { return x.id === bid; })[0];
      if (!bm) return;
      var lb = Math.round(bm.labaHari * (0.85 + Math.random() * 0.35) / 5000) * 5000;
      S.bisnisLain[bid].totalLaba = (S.bisnisLain[bid].totalLaba || 0) + lb;
      totBisnis += lb;
    });
    if (totBisnis > 0) {
      S.bank.saldo += totBisnis;
      S.bank.mutasi.unshift({ n: nBaru, ket: 'Laba harian bisnis tambahan', jml: totBisnis });
      S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + totBisnis;
      kabar.push('🏪 Laba bisnis tambahan +' + rp(totBisnis) + ' masuk rekening.');
    }
    /* 3. Gaji bulanan karier tetap & bunga Deposito/Dividen tiap tgl 1 */
    if (tB.m !== tL.m) {
      if (S.karier && S.karier.id) {
        var kj = KARIER_TETAP.filter(function (x) { return x.id === S.karier.id; })[0];
        if (kj) {
          var rasio = Math.min(1, Math.max(0.25, (S.karier.hadirBulan || 1) / 20));
          var gaji = Math.round(kj.gaji * rasio / 10000) * 10000;
          S.bank.saldo += gaji;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Gaji bulanan: ' + kj.nama, jml: gaji });
          S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + gaji;
          S.karier.hadirBulan = 0;
          kabar.push('💼 Gaji ' + kj.nama + ' ' + rp(gaji) + ' masuk rekening!');
        }
      }
      /* Bunga deposito & dividen saham/RD bulanan */
      var totDiv = 0;
      Object.keys(S.invest.milik || {}).forEach(function (id) {
        var a = INVEST_KATALOG.filter(function (x) { return x.id === id; })[0];
        var cur = S.invest.milik[id];
        if (!a || !cur || cur.qty <= 0 || !a.dividenThn) return;
        totDiv += Math.round((hargaInvest(S, id) * cur.qty * a.dividenThn) / 12);
      });
      if (totDiv > 0) {
        S.bank.saldo += totDiv;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Bunga Deposito & Dividen Investasi', jml: totDiv });
        kabar.push('📈 Dividen & bunga investasi +' + rp(totDiv) + ' cair ke rekening!');
      }
    }
    /* 4. THR 1x gaji menjelang Lebaran (H-7) */
    if (S.karier && S.karier.id && g.KK_OJEK && g.KK_OJEK.statusMudik && g.KK_OJEK.statusMudik(nBaru) === 'mudik' && S.karier.thrTahun !== tB.y) {
      var kjThr = KARIER_TETAP.filter(function (x) { return x.id === S.karier.id; })[0];
      if (kjThr) {
        S.karier.thrTahun = tB.y;
        S.bank.saldo += kjThr.gaji;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'THR Lebaran ' + tB.y + ' (' + kjThr.nama + ')', jml: kjThr.gaji });
        kabar.push('🎁 THR Lebaran 1× gaji (' + rp(kjThr.gaji) + ') dari kantor cair ke rekening!');
      }
    }
    return kabar;
  }

  g.KK_HIDUP = {
    BAN_MOTOR: BAN_MOTOR, BAN_MOBIL: BAN_MOBIL, PAKAIAN: PAKAIAN, AKS_DRIVER: AKS_DRIVER,
    INVEST_KATALOG: INVEST_KATALOG, PENDIDIKAN: PENDIDIKAN, KARIER_TETAP: KARIER_TETAP,
    KERJA_SAMPINGAN: KERJA_SAMPINGAN, BISNIS_LIST: BISNIS_LIST,
    siapkan: siapkan, ubahStres: ubahStres, levelDidik: levelDidik, namaDidik: namaDidik,
    perpanjangSim: perpanjangSim, bayarTilang: bayarTilang, cekRaziaJalan: cekRaziaJalan,
    gantiBanMerek: gantiBanMerek, tambalBan: tambalBan, cuciSteam: cuciSteam,
    beliPakaian: beliPakaian, pakaiBaju: pakaiBaju, warnaBajuAktif: warnaBajuAktif, beliAksDriver: beliAksDriver,
    hargaInvest: hargaInvest, beliInvest: beliInvest, jualInvest: jualInvest, nilaiPortofolio: nilaiPortofolio,
    kuliahUpgrade: kuliahUpgrade, lamarKerja: lamarKerja, berhentiKerja: berhentiKerja, masukKerjaHariIni: masukKerjaHariIni, kerjaSampingan: kerjaSampingan,
    bukaBisnis: bukaBisnis, infoSpotGacor: infoSpotGacor, acaraSosial: acaraSosial,
    tierWilayah: tierWilayah, pindahDomisili: pindahDomisili, gantiHari: gantiHari
  };
})(window);
