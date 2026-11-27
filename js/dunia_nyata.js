/* dunia_nyata.js — P61: 25 Sistem Dunia Nyata Indonesia + Peta Navigasi Mini-Map Canvas 2D + Pergi Bebas.
   Dirancang super ringan (O(1) per ganti hari, nol lag, 100% vektor/Canvas 2D). */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL;
  function rp(n) { return 'Rp' + Math.round(n || 0).toLocaleString('id-ID'); }
  function batas(v, lo, hi) { return Math.max(lo == null ? 0 : lo, Math.min(hi == null ? 100 : hi, v)); }

  /* ---------- Data Konstanta 25 Sistem ---------- */
  var KRIPTO_LIST = [
    { id: 'btc', nama: 'Bitcoin (BTC)', hargaAwal: 1480000000, vol: 0.085, warna: '#f7931a', ket: 'Aset kripto utama dunia, volatilitas tinggi 24 jam' },
    { id: 'eth', nama: 'Ethereum (ETH)', hargaAwal: 54000000, vol: 0.10, warna: '#627eea', ket: 'Smart contract terbesar, cocok swing jangka menengah' },
    { id: 'sol', nama: 'Solana (SOL)', hargaAwal: 2950000, vol: 0.14, warna: '#14f195', ket: 'Altcoin agresif, potensi cuan/boncos cepat ±14%/hari' },
    { id: 'usdt', nama: 'Tether (USDT)', hargaAwal: 16200, vol: 0.012, warna: '#26a17b', ket: 'Stablecoin patokan Dolar AS, aman dari inflasi rupiah' }
  ];

  var FRANCHISE_LIST = [
    { id: 'esteh', nama: 'Franchise Gerai Es Krim & Teh Kekinian', modal: 280000000, labaBln: 14500000, ket: 'Ramai dekat sekolah/kampus, balik modal ~19 bulan' },
    { id: 'pertashop', nama: 'SPBU Mini Pertashop Resmi', modal: 450000000, labaBln: 23000000, ket: 'Jual Pertamax resmi di jalur kabupaten/desa, stabil tiap hari' },
    { id: 'minimarket', nama: 'Franchise Minimarket Modern (24 Jam)', modal: 850000000, labaBln: 46000000, ket: 'Arus kas ritel kencang & profesional, aset pasif kelas atas' }
  ];

  var LUAR_NEGERI_LIST = [
    { id: 'kuching', nama: '🇲🇾 Road Trip Kuching (PLBN Entikong/Aruk)', biaya: 2800000, hari: 2, stamina: 38, sehat: 12, sosmed: 420, perluPaspor: true, perluMobil: false, ket: 'Lintas batas darat Kalbar–Sarawak, kuliner laksa & Waterfront Kuching' },
    { id: 'sg', nama: '🇸🇬 Liburan Singapura (Merlion & Marina Bay)', biaya: 9500000, hari: 3, stamina: 45, sehat: 15, sosmed: 950, perluPaspor: true, ket: 'Tiket PP + hotel + jalan-jalan Orchard & Universal Studios' },
    { id: 'jepang', nama: '🇯🇵 Wisata Tokyo & Osaka (Jepang)', biaya: 26000000, hari: 5, stamina: 55, sehat: 20, sosmed: 2400, perluPaspor: true, ket: 'Shibuya, kuliner ramen otentik, & naik Shinkansen' },
    { id: 'umrah', nama: '🕋 Ibadah Umrah 9 Hari (Makkah & Madinah)', biaya: 32000000, hari: 9, stamina: 65, sehat: 30, sosmed: 1500, perluPaspor: true, rohani: true, ket: 'Paket resmi Kemenag bintang 4 — hati damai, dosa & rasa bersalah 0%' },
    { id: 'haji', nama: '🕌 Daftar Porsi Haji Reguler (Kemenag)', biaya: 25000000, hari: 0, stamina: 15, sehat: 10, sosmed: 300, perluPaspor: false, daftarHaji: true, ket: 'Setoran awal BPIH resmi mendapat nomor porsi antrean Haji' }
  ];

  var DAYA_PLN = [
    { va: 900, nama: '900 VA (R1 Subsidi)', biayaNaik: 0, maksAlat: 2, ket: 'Rawan MCB jeglek kalau AC + kulkas + rice cooker nyala bareng' },
    { va: 1300, nama: '1.300 VA (R1 Standar)', biayaNaik: 450000, maksAlat: 4, ket: 'Cukup untuk AC 1/2 PK, kulkas, TV, dan cas HP' },
    { va: 2200, nama: '2.200 VA (R1 Menengah)', biayaNaik: 980000, maksAlat: 7, ket: 'Bebas jeglek untuk kulkas 2 pintu, AC, PS5, & Auto Cas PB' },
    { va: 3500, nama: '3.500 VA (R2 Sultan)', biayaNaik: 1850000, maksAlat: 14, ket: 'Kuat untuk semua elektronik rumah + home charging kendaraan listrik' }
  ];

  var MEWAH_LIST = [
    { id: 'parfum_lokal', jenis: 'parfum', nama: 'Parfum HMNS Orgasm 100ml', harga: 385000, karisma: 6, naikThn: 0, ket: 'Wangi elegan lokal favorit anak muda, tahan 8 jam' },
    { id: 'parfum_dior', jenis: 'parfum', nama: 'Dior Sauvage EDP 100ml', harga: 2650000, karisma: 16, naikThn: 0, ket: 'Parfum desainer ikonik — tambah daya tarik saat kencan & negosiasi' },
    { id: 'jam_gshock', jenis: 'jam', nama: 'Casio G-Shock GA-2100 Casioak', harga: 1850000, karisma: 8, naikThn: 0.01, ket: 'Tangguh di jalanan hujan/panas, cocok untuk driver & lapangan' },
    { id: 'jam_seiko', jenis: 'jam', nama: 'Seiko Presage Cocktail Time', harga: 6800000, karisma: 15, naikThn: 0.04, ket: 'Automatic Jepang berkelas untuk acara formal & kencan' },
    { id: 'jam_omega', jenis: 'jam', nama: 'Omega Speedmaster Moonwatch', harga: 112000000, karisma: 28, naikThn: 0.08, ket: 'Jam tangan mewah Swiss, nilai koleksi naik ~8%/tahun' },
    { id: 'jam_rolex', jenis: 'jam', nama: 'Rolex Submariner Date Steel', harga: 215000000, karisma: 40, naikThn: 0.11, ket: 'Simbol puncak kesuksesan — nilai pasar sekunder naik ~11%/tahun' }
  ];

  var KULINER_MAP = {
    kalbar: [
      { id: 'kul_chaikue', nama: '🥟 Chai Kue Pontianak (10 pcs)', harga: 18000, kenyang: 48, minum: 8, kalori: 420, sehat: true, ket: 'Khas Pontianak & Singkawang, isi bengkoang/kucai + sambal pedas' },
      { id: 'kul_buburpedas', nama: '🍲 Bubur Pedas Sambas', harga: 20000, kenyang: 62, minum: 22, kalori: 390, sehat: true, ket: 'Bubur rempah daun kesum khas Melayu Kalbar, kaya sayur & teri' },
      { id: 'kul_pengkang', nama: '🍙 Pengkang & Sambal Kepah', harga: 22000, kenyang: 56, minum: 10, kalori: 480, sehat: false, ket: 'Ketan bakar isi ebi khas Mempawah/Pontianak, wangi daun pisang' },
      { id: 'kul_lidahbuaya', nama: '🧊 Es Lidah Buaya Pontianak', harga: 12000, kenyang: 14, minum: 55, kalori: 180, sehat: true, ket: 'Segar dingin pelepas dahaga khatulistiwa' },
      { id: 'kul_sotong', nama: '🦑 Sotong Pangkong Malam', harga: 35000, kenyang: 45, minum: 5, kalori: 340, sehat: true, ket: 'Cumi kering panggang geprek dengan kuah kacang & ebi pedas' }
    ],
    sumut: [
      { id: 'kul_sotomedan', nama: '🥣 Soto Medan Santan Rempah', harga: 28000, kenyang: 68, minum: 20, kalori: 580, sehat: false, ket: 'Kuah santan gurih + perkedel + daging empuk khas Medan' },
      { id: 'kul_miebalap', nama: '🍜 Mie Balap Seafood Medan', harga: 18000, kenyang: 60, minum: 8, kalori: 540, sehat: false, ket: 'Sarapan wajan api besar favorit warga Medan' },
      { id: 'kul_bika', nama: '🍰 Bika Ambon Zulaikha (Potong)', harga: 16000, kenyang: 34, minum: 5, kalori: 380, sehat: false, ket: 'Kenyal bersarang wangi pandan serai' },
      { id: 'kul_markisa', nama: '🍹 Es Sirup Markisa Brastagi', harga: 12000, kenyang: 10, minum: 58, kalori: 190, sehat: true, ket: 'Asam manis segar khas tanah Karo' }
    ],
    jakarta: [
      { id: 'kul_sotobetawi', nama: '🥣 Soto Betawi Daging Susu', harga: 38000, kenyang: 70, minum: 20, kalori: 640, sehat: false, ket: 'Kuah santan-susu gurih + emping melinjo & acar' },
      { id: 'kul_keraktelor', nama: '🍳 Kerak Telor Bebek Betawi', harga: 25000, kenyang: 52, minum: 5, kalori: 490, sehat: false, ket: 'Ketan sangrai telur bebek + serundeng gurih' },
      { id: 'kul_gadogado', nama: '🥗 Gado-Gado Siram Betawi', harga: 22000, kenyang: 58, minum: 14, kalori: 360, sehat: true, ket: 'Sayur rebus segar + bumbu kacang medok, ramah BMI' },
      { id: 'kul_birpletok', nama: '🥤 Es Bir Pletok Rempah', harga: 14000, kenyang: 10, minum: 52, kalori: 140, sehat: true, ket: 'Jahe, secang, & kapulaga non-alkohol penghangat badan' }
    ],
    jabar: [
      { id: 'kul_batagor', nama: '🥟 Batagor Kingsley Bandung', harga: 24000, kenyang: 55, minum: 6, kalori: 520, sehat: false, ket: 'Baso tahu goreng ikan tenggiri + bumbu kacang kental' },
      { id: 'kul_seblak', nama: '🌶️ Seblak Ceker Komplit Level 3', harga: 18000, kenyang: 58, minum: 18, kalori: 510, sehat: false, ket: 'Kerupuk basah kuah kencur pedas nagih' },
      { id: 'kul_karedok', nama: '🥗 Karedok Sunda Segar', harga: 17000, kenyang: 50, minum: 16, kalori: 310, sehat: true, ket: 'Lalapan mentah segar saus kacang kencur' },
      { id: 'kul_esgoyobod', nama: '🍧 Es Goyobod Bandung', harga: 13000, kenyang: 16, minum: 54, kalori: 220, sehat: true, ket: 'Alpukat, pacar cina, & kelapa muda dingin' }
    ],
    jatim: [
      { id: 'kul_rawon', nama: '🍲 Rawon Setan Surabaya', harga: 35000, kenyang: 72, minum: 22, kalori: 590, sehat: false, ket: 'Kuah hitam kluwek daging empal + telur asin & tauge' },
      { id: 'kul_rujak', nama: '🥗 Rujak Cingur Petis Suroboyo', harga: 26000, kenyang: 62, minum: 12, kalori: 470, sehat: true, ket: 'Sayur, lontong, cingur, & petis udang asli' },
      { id: 'kul_sotolamongan', nama: '🥣 Soto Ayam Lamongan Koya', harga: 22000, kenyang: 64, minum: 20, kalori: 430, sehat: true, ket: 'Kuah kuning gurih taburan bubuk koya melimpah' }
    ],
    sulsel: [
      { id: 'kul_coto', nama: '🥣 Coto Makassar + Buras', harga: 32000, kenyang: 74, minum: 20, kalori: 610, sehat: false, ket: 'Kuah kacang tanah rempah daging sapi khas Losari' },
      { id: 'kul_konro', nama: '🍖 Sop Konro Iga Bakar', harga: 55000, kenyang: 82, minum: 16, kalori: 720, sehat: false, ket: 'Iga sapi empuk bumbu kluwek & kacang gurih' },
      { id: 'kul_pisangijo', nama: '🍧 Es Pisang Ijo Makassar', harga: 16000, kenyang: 28, minum: 52, kalori: 310, sehat: true, ket: 'Pisang balut adonan pandan + bubur sumsum & sirup DHT' }
    ],
    sumbar: [
      { id: 'kul_rendang', nama: '🍛 Nasi Rendang Daging Asli Minang', harga: 30000, kenyang: 76, minum: 10, kalori: 650, sehat: false, ket: 'Masakan terlezat dunia + daun singkong & sambal ijo' },
      { id: 'kul_satepadang', nama: '🍢 Sate Padang Kuah Kental', harga: 25000, kenyang: 62, minum: 8, kalori: 510, sehat: false, ket: 'Lidah/daging sapi bakar siram kuah rempah kuning pedas' },
      { id: 'kul_tehtalua', nama: '☕ Teh Talua Kocok Pinang', harga: 15000, kenyang: 20, minum: 45, stamina: 16, kalori: 260, sehat: true, ket: 'Penambah tenaga legendaris Sumatra Barat' }
    ],
    umum: [
      { id: 'kul_pecel', nama: '🥗 Nasi Pecel Sayur & Tempe', harga: 16000, kenyang: 58, minum: 12, kalori: 360, sehat: true, ket: 'Menu sehat kaya serat & protein nabati, bagus untuk BMI ideal' },
      { id: 'kul_sotoayam', nama: '🥣 Soto Ayam Kampung Kuah Bening', harga: 18000, kenyang: 60, minum: 22, kalori: 380, sehat: true, ket: 'Hangat bergizi & ramah kantong di seluruh Nusantara' },
      { id: 'kul_nasgor', nama: '🍛 Nasi Goreng Kampung Telur Mata Sapi', harga: 20000, kenyang: 68, minum: 6, kalori: 590, sehat: false, ket: 'Favorit malam hari di pinggir jalan seluruh kota Indonesia' },
      { id: 'kul_jus', nama: '🥤 Jus Alpukat / Jeruk Segar', harga: 14000, kenyang: 18, minum: 56, kalori: 210, sehat: true, ket: 'Vitamin alami penyegar tubuh & imunitas' }
    ]
  };

  /* ---------- Inisialisasi State ---------- */
  function siapkan(S) {
    if (!S) return S;
    if (!S.real) S.real = {};
    var R = S.real;
    if (!R.kripto) {
      R.kripto = {};
      KRIPTO_LIST.forEach(function (c) { R.kripto[c.id] = { harga: c.hargaAwal, punya: 0, modal: 0, ubah: 0 }; });
    }
    if (!R.bbmLangka) R.bbmLangka = { aktif: false, sampai: -1, barcodeMyPertamina: false, stokJerigen: 0, hargaBeli: 10000 };
    if (!R.bencana) R.bencana = { kabutAsap: false, gempaHari: -1, padamBergilir: false, maskerN95: 0 };
    if (!R.utangTeman) R.utangTeman = [];
    if (!R.jht) R.jht = { saldo: 0, phkRiwayat: 0, kontrakBln: 0 };
    if (!R.skripsi) R.skripsi = { progres: 0, revisi: 0, selesai: false };
    if (!R.live) R.live = { hariTerakhir: -1, totalOmzet: 0, sesi: 0 };
    if (!R.franchise) R.franchise = {};
    if (R.prenup == null) R.prenup = false;
    if (!R.asuransi) R.asuransi = { aktif: false, premi: 450000, jatuhTempoBln: -1 };
    if (!R.paspor) R.paspor = { punya: false, hajiPorsi: null, umrahCount: 0, tripList: [] };
    if (!R.pln) R.pln = { daya: 1300, jeglekHari: -1 };
    if (!R.pdam) R.pdam = { mati: false, punyaToren: false, sampai: -1 };
    if (!R.dating) R.dating = { hariAcak: -1, kandidat: [], matchList: [] };
    if (!R.mewah) R.mewah = { milik: {}, pakaiJam: null, pakaiParfum: null };
    if (!R.bmi) R.bmi = { beratKg: (S.profil && S.profil.gender === 'cewek') ? 54 : 65, tinggiCm: (S.profil && S.profil.gender === 'cewek') ? 160 : 170, kaloriHari: 0 };
    if (!R.rt) R.rt = { jabatan: null, koperasiUtang: 0, jatuhTempo: -1 };
    if (!R.kavling) R.kavling = { pasarMinggu: -1, tawaran: [], milik: [] };
    if (!R.sejarah) R.sejarah = [{ hari: S.hari || 0, ikon: '🛵', teks: 'Memulai perjalanan hidup baru di dunia The Driver (2026).' }];
    if (!R.lomba17Tahun) R.lomba17Tahun = -1;
    /* detail kondisi kendaraan (suspensi, aki, kampas rem, lampu) */
    [S.motor, S.mobil].forEach(function (k) {
      if (!k) return;
      if (typeof k.suspensi !== 'number') k.suspensi = 100;
      if (typeof k.aki !== 'number') k.aki = 100;
      if (typeof k.rem !== 'number') k.rem = 100;
      if (typeof k.lampu !== 'number') k.lampu = 100;
    });
    return R;
  }

  /* ---------- 25. Museum / Biografi Hidup ---------- */
  function catatSejarah(S, ikon, teks) {
    var R = siapkan(S);
    if (!teks) return;
    R.sejarah.unshift({ hari: S.hari || 0, ikon: ikon || '📌', teks: teks });
    if (R.sejarah.length > 80) R.sejarah.length = 80;
  }

  /* ---------- 1. Peta Navigasi Mini-Map Canvas 2D + Pergi Bebas ---------- */
  var POI_LOKAL = [
    { id: 'poi_rumah', nama: '🏠 Rumah / Kos', kat: 'rumah', km: 0, dx: 0, dy: 0, warna: '#1f8a80', aksi: 'pulang' },
    { id: 'poi_warung', nama: '🍛 Sentra Kuliner & Warung', kat: 'makan', km: 1.2, dx: 0.42, dy: -0.25, warna: '#f2a516', aksi: 'makan' },
    { id: 'poi_spbu', nama: '⛽ SPBU Pertamina Terdekat', kat: 'spbu', km: 2.1, dx: -0.45, dy: -0.32, warna: '#d9443a', aksi: 'spbu' },
    { id: 'poi_masjid', nama: '🕌 Masjid / Tempat Ibadah', kat: 'ibadah', km: 0.9, dx: 0.25, dy: 0.34, warna: '#10b981', aksi: 'ibadah' },
    { id: 'poi_mall', nama: '🛍️ Mall & Pusat Belanja', kat: 'mall', km: 4.5, dx: 0.65, dy: -0.58, warna: '#8b5cf6', aksi: 'mall' },
    { id: 'poi_bengkel', nama: '🔧 Bengkel & Tambal Ban', kat: 'bengkel', km: 1.8, dx: -0.52, dy: 0.28, warna: '#64748b', aksi: 'bengkel' },
    { id: 'poi_rs', nama: '🏥 Rumah Sakit & Apotek', kat: 'rs', km: 3.4, dx: -0.22, dy: 0.62, warna: '#ef4444', aksi: 'rs' },
    { id: 'poi_taman', nama: '🌳 Taman Kota / Car Free Day', kat: 'taman', km: 2.6, dx: 0.55, dy: 0.42, warna: '#22c55e', aksi: 'taman' }
  ];

  function daftarTujuanPeta(S) {
    var list = POI_LOKAL.slice();
    var W = g.KK_WILAYAH;
    var sk = (g.KK_OJEK && g.KK_OJEK.lokasiSekarang) ? g.KK_OJEK.lokasiSekarang(S) : null;
    if (W && W.kalbar && sk && W.kalbar[sk.kabId]) {
      var kabId = sk.kabId, kb = W.kalbar[kabId];
      var kecList = [];
      kb.kec.forEach(function (kc) {
        if (kc.id === sk.kecId || kc.nama === sk.kecNama) return;
        if (!sk.pulau && kc.pulau) return; /* proteksi darat: tidak rute motor/mobil melintasi lautan ke pulau */
        var titik = W.titikDesa ? W.titikDesa(kabId, kc, kc.desa[0]) : { kabId: kabId, kabNama: kb.nama, kecId: kc.id, kecNama: kc.nama, medan: kc.medan || 'mulus', pulau: !!kc.pulau, desa: kc.desa[0], lat: kc.lat, lon: kc.lon };
        var km = W.jarakKm(sk, titik);
        var md = W.medanJalan ? W.medanJalan(sk, titik) : { ikon: '🛣️', nama: 'Aspal' };
        kecList.push({
          id: 'kec:' + kabId + ':' + kc.id,
          nama: '📍 Kec. ' + kc.nama + ' (' + kc.desa[0] + ') · ' + md.ikon,
          kat: 'wilayah',
          km: Math.max(1.5, km),
          titik: titik,
          medan: md,
          warna: '#0ea5e9',
          aksi: 'wilayah'
        });
      });
      kecList.sort(function (a, b) { return a.km - b.km; });
      list = list.concat(kecList);
    }
    return list;
  }

  /* Pergi Bebas tanpa ngojol: Jalan Kaki, Motor/Mobil Sendiri, atau Dijemput Teman — mendukung POI lokal + SELURUH 174 Kecamatan & 1.562 Desa Kalbar */
  function pergiBebas(S, targetId, cara, temanId, tundaPindah, jalurOpsi) {
    siapkan(S);
    if (S.ojek && S.ojek.trip) return 'Selesaikan order penumpang dulu sebelum pergi bebas!';
    var daf = daftarTujuanPeta(S);
    var tj = daf.filter(function (x) { return x.id === targetId; })[0];
    if (!tj && String(targetId || '').indexOf('desa:') === 0 && g.KK_WILAYAH && g.KK_WILAYAH.cariTitik) {
      var pd = String(targetId).split(':');
      var tDesa = g.KK_WILAYAH.cariTitik(pd[1], pd[2], pd.slice(3).join(':'));
      var sk0 = (g.KK_OJEK && g.KK_OJEK.lokasiSekarang) ? g.KK_OJEK.lokasiSekarang(S) : g.KK_WILAYAH.titikAwal(S.kota);
      if (tDesa) {
        var md0 = g.KK_WILAYAH.medanJalan ? g.KK_WILAYAH.medanJalan(sk0, tDesa) : { ikon: '🛣️', nama: 'Aspal', kec: 1, aus: 1 };
        var km0 = (jalurOpsi && jalurOpsi.km) ? jalurOpsi.km : Math.max(1.2, g.KK_WILAYAH.jarakKm(sk0, tDesa));
        tj = { id: targetId, nama: '📍 ' + tDesa.desa + ', Kec. ' + tDesa.kecNama + ' (' + tDesa.kabNama.replace(/^Kab\. |^Kota /, '') + ')', kat: 'wilayah', km: km0, titik: tDesa, medan: md0, aksi: 'wilayah' };
      }
    }
    if (!tj) return 'Tujuan tidak ditemukan di peta.';
    var km = (jalurOpsi && jalurOpsi.km) ? jalurOpsi.km : (tj.aksi === 'pulang' ? Math.max(0.5, (g.KK_OJEK && g.KK_OJEK.jarakRumah) ? g.KK_OJEK.jarakRumah(S) : 2) : (tj.km || 2));
    var biayaFeri = (jalurOpsi && jalurOpsi.biayaFeri) ? Math.round(jalurOpsi.biayaFeri) : 0;
    if (biayaFeri > 0) {
      var byF = g.KK_UANG.bayarPilihan(S, biayaFeri, 'Tiket Feri Penyeberangan (' + tj.nama + ')', S._metodeBayar || 'bank');
      if (byF !== true) return byF;
    }
    var menit = 10, ket = '', bbmTarget = null, bbmDipakai = 0;

    if (cara === 'jalan') {
      if (km > 12) return 'Jarak ' + km.toFixed(1) + ' km terlalu jauh untuk jalan kaki! Pakai kendaraan sendiri atau minta dijemput teman.';
      menit = Math.max(6, Math.round(km * 12));
      var kurStam = Math.min(25, Math.round(km * 2.8));
      if (S.diri.stamina < kurStam + 5) return 'Stamina terlalu rendah untuk jalan kaki ' + km.toFixed(1) + ' km.';
      S.diri.stamina = batas(S.diri.stamina - kurStam);
      S.diri.kesehatan = batas((S.diri.kesehatan || 100) + Math.min(4, km * 0.8));
      olahragaJalanKaki(S, km);
      ket = '🚶 Jalan kaki santai ' + km.toFixed(1) + ' km ke ' + tj.nama + ' (' + menit + ' mnt · sehat & bakar kalori!).';
    } else if (cara === 'teman') {
      var tm = (S.teman || []).filter(function (x) { return x.id === temanId; })[0];
      if (!tm) return 'Pilih teman/pacar dulu untuk menjemputmu!';
      if ((tm.hubungan || 0) < 45) return tm.nama + ' menolak jemput karena hubungan baru ' + Math.round(tm.hubungan || 0) + '% (butuh ≥45%).';
      menit = Math.max(8, Math.round(km * 2.4 + 6));
      tm.hubungan = Math.min(100, (tm.hubungan || 50) + 3);
      S.diri.stamina = batas(S.diri.stamina - 2);
      ket = '🤝 Dijemput ' + tm.nama + ' menuju ' + tj.nama + ' (' + km.toFixed(1) + ' km · ' + menit + ' mnt · gratis bensin & makin akrab!).';
    } else {
      /* kendaraan sendiri (motor atau mobil) */
      var pakaiMbl = (cara === 'mobil');
      var knd = pakaiMbl ? g.KK_MOBIL : g.KK_MOTOR;
      var kObj = pakaiMbl ? S.mobil : S.motor;
      if (pakaiMbl && !S.mobil) return 'Belum punya mobil. Pilih Motor, Jalan Kaki, atau Dijemput Teman.';
      if (!pakaiMbl && !S.motor) return 'Belum punya motor! Pilih Jalan Kaki atau Minta Dijemput Teman.';
      if (kObj && kObj.mogokAir) return (pakaiMbl ? 'Mobil' : 'Motor') + ' sedang mogok kena banjir! Kuras mesin dulu di Garasi.';
      if (knd && knd.disewakan && knd.disewakan(S)) return (pakaiMbl ? 'Mobil' : 'Motor') + ' sedang disewakan di Sewa Aset! Hentikan sewa dulu.';
      if (!knd || !knd.cukup(S, km)) return (pakaiMbl ? 'Bensin mobil' : 'Bensin motor') + ' tidak cukup untuk ' + km.toFixed(1) + ' km!';
      var evM = !pakaiMbl && S.motor && S.motor.bbm === 'listrik';
      var isi0 = pakaiMbl ? S.mobil.isi : (evM ? S.motor.baterai : S.motor.isi);
      var rJ = knd.jalan(S, km, 1);
      if (!rJ || !rJ.ok) return (rJ && rJ.alasan) || 'Kendaraan tidak siap jalan.';
      var isi1 = pakaiMbl ? S.mobil.isi : (evM ? S.motor.baterai : S.motor.isi);
      bbmDipakai = Math.max(0, isi0 - isi1);
      bbmTarget = pakaiMbl ? 'mobil' : (evM ? 'motorEv' : 'motor');
      if (tundaPindah && bbmDipakai > 0) {
        if (pakaiMbl) S.mobil.isi = isi0;
        else if (evM) S.motor.baterai = isi0;
        else S.motor.isi = isi0;
      }
      var fakKecMd = (tj.medan && tj.medan.kec) || 1;
      menit = Math.max(4, Math.round((rJ.menit || km * 2) / Math.max(0.45, fakKecMd)));
      catatAusPerjalanan(S, pakaiMbl ? 'mobil' : 'motor', km, tj.medan);
      ket = (pakaiMbl ? '🚗 Menyetir mobil' : '🏍️ Berkendara motor') + ' ke ' + tj.nama + ' (' + km.toFixed(1) + ' km · ' + menit + ' mnt).';
    }

    if (S.ojek && S.ojek.online) g.KK_OJEK.offline(S, true);
    if (!tundaPindah) {
      if (tj.aksi === 'pulang') {
        S.diri.posisi = 'kos';
        if (g.KK_OJEK) g.KK_OJEK.resetPos(S, 0, 0);
      } else {
        S.diri.posisi = 'kedai';
        if (tj.titik && S.ojek) S.ojek.lokasi = tj.titik;
      }
      if (tj.aksi === 'taman') {
        S.diri.stamina = batas(S.diri.stamina + 12);
        S.diri.kesehatan = batas((S.diri.kesehatan || 100) + 5);
        S.diri.rasaBersalah = Math.max(0, (S.diri.rasaBersalah || 0) - 6);
      } else if (tj.aksi === 'ibadah' && g.KK_DIRI && g.KK_DIRI.ibadah) {
        g.KK_DIRI.ibadah(S, 'Ibadah', 'Masjid / Tempat Ibadah Terdekat');
        ket += ' 🙏 Selesai beribadah, hati tenang & stamina pulih.';
      }
    }
    return { ok: true, menit: menit, km: km, aksi: tj.aksi, titik: tj.titik || null, bbmTarget: bbmTarget, bbmSisa: bbmDipakai, teks: ket };
  }

  function gambarPetaMini(canvas, S) {
    if (!canvas || !canvas.getContext || !S) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width = Math.max(300, canvas.clientWidth || 340);
    var h = canvas.height = 190;
    var R = siapkan(S);
    var sk = (g.KK_OJEK && g.KK_OJEK.lokasiSekarang) ? g.KK_OJEK.lokasiSekarang(S) : { desa: 'Pusat Kota', kecNama: 'Kota', lat: 0, lon: 109.3 };
    var rm = (g.KK_OJEK && g.KK_OJEK.lokasiRumah) ? g.KK_OJEK.lokasiRumah(S) : sk;

    /* latar peta gaya Google Maps / Waze modern */
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#e8f1ee'); bg.addColorStop(1, '#dce9e4');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);

    /* area sungai / taman kota vektor */
    ctx.fillStyle = '#bae0f5';
    ctx.beginPath(); ctx.moveTo(0, h * 0.72); ctx.quadraticCurveTo(w * 0.38, h * 0.58, w * 0.68, h * 0.78);
    ctx.quadraticCurveTo(w * 0.85, h * 0.88, w, h * 0.75); ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8e6c9';
    ctx.beginPath(); ctx.ellipse(w * 0.78, h * 0.25, 42, 22, -0.2, 0, Math.PI * 2); ctx.fill();

    /* jaringan jalan arteri & jalan lokal */
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.48); ctx.quadraticCurveTo(w * 0.45, h * 0.42, w, h * 0.52);
    ctx.moveTo(w * 0.48, 0); ctx.quadraticCurveTo(w * 0.52, h * 0.45, w * 0.44, h);
    ctx.moveTo(w * 0.14, h * 0.18); ctx.lineTo(w * 0.86, h * 0.82);
    ctx.stroke();
    ctx.strokeStyle = '#f8d57e'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(0, h * 0.48); ctx.quadraticCurveTo(w * 0.45, h * 0.42, w, h * 0.52); ctx.stroke();

    /* titik POI */
    var cx0 = w * 0.48, cy0 = h * 0.48;
    POI_LOKAL.forEach(function (p) {
      var px = cx0 + (p.dx || 0) * (w * 0.42);
      var py = cy0 + (p.dy || 0) * (h * 0.42);
      ctx.fillStyle = p.warna;
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 9.5px sans-serif';
      ctx.fillText(p.nama.split(' ')[0] + ' ' + (p.nama.split(' ')[1] || ''), px + 7, py + 3);
    });

    /* garis rute aktif jika sedang trip ojol atau di luar rumah */
    var diRumah = S.diri && S.diri.posisi === 'kos';
    var pxPemain = diRumah ? cx0 : (cx0 + 36);
    var pyPemain = diRumah ? cy0 : (cy0 - 18);
    if (S.ojek && S.ojek.trip && S.ojek.trip.x) {
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3.2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(pxPemain, pyPemain); ctx.quadraticCurveTo(w * 0.65, h * 0.25, w * 0.82, h * 0.34); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.34, 6, 0, Math.PI * 2); ctx.fill();
    }

    /* marker posisi pemain (pin biru berkilau) */
    ctx.fillStyle = 'rgba(37,99,235,.22)'; ctx.beginPath(); ctx.arc(pxPemain, pyPemain, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(pxPemain, pyPemain, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    /* badge status cuaca/banjir/BBM langka di sudut peta */
    ctx.fillStyle = 'rgba(15,23,42,.82)';
    ctx.fillRect(8, 8, Math.min(w - 16, 215), 24);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10.5px sans-serif';
    var lblP = '📍 ' + (sk.desa || 'Pusat') + (sk.kecNama && sk.kecNama !== sk.desa ? ', ' + sk.kecNama : '');
    ctx.fillText(lblP.slice(0, 32), 14, 24);
    if (R.bbmLangka.aktif || R.bencana.kabutAsap || (S.dunia && S.dunia.banjirCm >= 30)) {
      var warnT = R.bbmLangka.aktif ? '⛽ SPBU ANTRE' : R.bencana.kabutAsap ? '🌫️ KABUT ASAP' : '🌊 BANJIR ' + S.dunia.banjirCm + 'cm';
      ctx.fillStyle = '#dc2626'; ctx.fillRect(w - 108, 8, 100, 22);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText(warnT, w - 101, 22);
    }
  }

  /* ---------- 2. BBM Langka, Barcode MyPertamina & Jual Eceran Cuan ---------- */
  function daftarBarcodeMyPertamina(S) {
    var R = siapkan(S);
    if (R.bbmLangka.barcodeMyPertamina) return 'Barcode Subsidi MyPertamina sudah terdaftar aktif!';
    if (!S.motor && !S.mobil) return 'Punya motor atau mobil dulu untuk mendaftar QR Barcode MyPertamina.';
    R.bbmLangka.barcodeMyPertamina = true;
    catatSejarah(S, '📱', 'Mendaftar QR Barcode Subsidi Tepat MyPertamina.');
    return { ok: true, teks: '✅ QR Barcode MyPertamina aktif! Sekarang kamu bisa beli Pertalite/Solar subsidi di SPBU tanpa ditolak.' };
  }
  function beliBbmEceran(S, liter) {
    var R = siapkan(S);
    liter = Math.max(5, Math.min(40, +liter || 10));
    if (!R.bbmLangka.aktif) return 'Saat ini BBM di SPBU sedang normal (tidak langka). Tunggu momen kelangkaan BBM untuk antre jerigen!';
    if (R.bbmLangka.stokJerigen + liter > 60) return 'Maksimal stok jerigen di rumah 60 liter (demi keamanan).';
    var hargaL = 10500;
    var total = liter * hargaL;
    var by = g.KK_UANG.bayarPilihan(S, total, 'Antre SPBU BBM Jerigen ' + liter + 'L', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    R.bbmLangka.stokJerigen += liter;
    R.bbmLangka.hargaBeli = hargaL;
    S.diri.stamina = batas(S.diri.stamina - 8);
    return { ok: true, menit: 40, teks: '⛽ Berhasil antre SPBU dapat ' + liter + 'L BBM (' + rp(total) + ')! Stok jerigen: ' + R.bbmLangka.stokJerigen + 'L.' };
  }
  function jualBbmEceran(S) {
    var R = siapkan(S);
    if ((R.bbmLangka.stokJerigen || 0) <= 0) return 'Stok jerigen BBM kosong! Antre di SPBU saat BBM langka dulu.';
    var l = R.bbmLangka.stokJerigen;
    var hargaJual = R.bbmLangka.aktif ? 15500 : 12000; /* saat langka laku Rp15.500/L! */
    var hasil = l * hargaJual;
    var untung = l * (hargaJual - (R.bbmLangka.hargaBeli || 10500));
    R.bbmLangka.stokJerigen = 0;
    S.uang.dompet = (S.uang.dompet || 0) + hasil;
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + Math.max(0, untung);
    return { ok: true, menit: 25, teks: '💰 ' + l + 'L BBM eceran laku ' + rp(hasil) + ' (' + rp(hargaJual) + '/L · Cuan bersih ' + rp(untung) + ')!' };
  }

  /* ---------- 3 & 24. Jalan Berlubang, Suspensi Aus, Aki, Kampas Rem, Lampu ---------- */
  function catatAusPerjalanan(S, mode, km, medan) {
    siapkan(S);
    var k = mode === 'mobil' ? S.mobil : S.motor;
    if (!k || !km) return null;
    var mdObj = medan;
    if (!mdObj && g.KK_WILAYAH && g.KK_WILAYAH.medanJalan && S.ojek && S.ojek.lokasi) {
      mdObj = g.KK_WILAYAH.medanJalan(S.ojek.lokasi, S.ojek.lokasi);
    }
    var faktorLubang = (mdObj && mdObj.aus) ? mdObj.aus : 1.0;
    var adaShockModif = !!(k.modif && k.modif.shock);
    k.suspensi = Math.max(0, Math.round(((k.suspensi == null ? 100 : k.suspensi) - km * 0.22 * faktorLubang * (adaShockModif ? 0.45 : 1)) * 10) / 10);
    k.aki = Math.max(0, Math.round(((k.aki == null ? 100 : k.aki) - km * 0.12) * 10) / 10);
    k.rem = Math.max(0, Math.round(((k.rem == null ? 100 : k.rem) - km * 0.18 * Math.min(1.5, faktorLubang)) * 10) / 10);
    k.lampu = Math.max(0, Math.round(((k.lampu == null ? 100 : k.lampu) - km * 0.08) * 10) / 10);
    if (k.suspensi < 25 && Math.random() < 0.35) {
      S.diri.stamina = batas(S.diri.stamina - 4);
      return '🕳️ ' + ((mdObj && mdObj.nama) || 'Jalan berlubang') + '! Suspensi ' + (mode === 'mobil' ? 'mobil' : 'motor') + ' mulai aus (' + Math.round(k.suspensi) + '%), badan pegal — servis di Garasi!';
    }
    if (k.rem < 20 && Math.random() < 0.35) return '⚠️ Kampas rem menipis (' + Math.round(k.rem) + '%)! Segera ganti di Garasi agar aman.';
    if (k.aki < 18 && Math.random() < 0.35) return '🔋 Aki mulai tekor (' + Math.round(k.aki) + '%)! Starter berat, ganti/cas aki di Garasi.';
    return null;
  }
  function rawatDetailKnd(S, jenis, part) {
    siapkan(S);
    var k = jenis === 'mobil' ? S.mobil : S.motor;
    if (!k) return 'Kendaraan tidak ditemukan.';
    var daftar = {
      suspensi: { nama: 'Servis Shockbreaker & Kaki-kaki', harga: jenis === 'mobil' ? 950000 : 240000, field: 'suspensi' },
      aki: { nama: 'Ganti Aki Kering GS Astra', harga: jenis === 'mobil' ? 850000 : 225000, field: 'aki' },
      rem: { nama: 'Ganti Kampas Rem Depan-Belakang', harga: jenis === 'mobil' ? 620000 : 115000, field: 'rem' },
      lampu: { nama: 'Ganti Bohlam / LED Lampu Utama', harga: jenis === 'mobil' ? 380000 : 95000, field: 'lampu' }
    };
    var p = daftar[part];
    if (!p) return 'Komponen tidak dikenal.';
    var by = g.KK_UANG.bayarPilihan(S, p.harga, p.nama + ' (' + k.nama + ')', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    k[p.field] = 100;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + p.harga;
    return { ok: true, menit: 30, teks: '🔧 ' + p.nama + ' selesai (' + rp(p.harga) + ')! Kondisi kembali 100%.' };
  }

  /* ---------- 20. Bengkel Resmi (100% Asli) vs Bengkel Pinggir Jalan (22% Oli Palsu) ---------- */
  function gantiOliPilihan(S, jenis, resmi) {
    siapkan(S);
    var k = jenis === 'mobil' ? S.mobil : S.motor;
    if (!k) return 'Kendaraan belum dimiliki.';
    var harga = jenis === 'mobil' ? (resmi ? 580000 : 340000) : (resmi ? 95000 : 52000);
    var by = g.KK_UANG.bayarPilihan(S, harga, (resmi ? 'Bengkel Resmi: ' : 'Bengkel Pinggir Jalan: ') + 'Ganti Oli ' + k.nama, S._metodeBayar || 'dompet');
    if (by !== true) return by;
    k.kmOli = k.km || 0;
    k.oliKm = 0;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + harga;
    if (!resmi && Math.random() < 0.22) {
      k.kmServis = Math.max(0, (k.kmServis || 0) - (jenis === 'mobil' ? 4500 : 1800));
      k.kmOli = Math.max(0, (k.km || 0) - (jenis === 'mobil' ? 2500 : 900));
      k.servisKm = (k.servisKm || 0) + (jenis === 'mobil' ? 4500 : 1800);
      k.oliKm = jenis === 'mobil' ? 2500 : 900;
      return { ok: true, menit: 25, palsu: true, teks: '⚠️ APES! Ganti oli di bengkel pinggir jalan (' + rp(harga) + ') ternyata dapat OLI PALSU! Mesin agak kasar & cepat panas.' };
    }
    return { ok: true, menit: 25, palsu: false, teks: (resmi ? '✅ Ganti oli 100% ASLI di Bengkel Resmi (' : '🔧 Ganti oli di Bengkel Pinggir Jalan (') + rp(harga) + ')! Tarikan mesin kembali halus.' };
  }

  /* ---------- 4. Kuliner Khas Daerah Dinamis Sesuai Lokasi ---------- */
  function wilayahKuliner(S) {
    var kid = String((S && S.kota) || 'pontianak').toLowerCase();
    var prov = (g.KK_DIRI && g.KK_DIRI.kota) ? String(g.KK_DIRI.kota(S).provinsi || '').toLowerCase() : '';
    if (prov.indexOf('kalimantan barat') >= 0 || (g.KK_WILAYAH && g.KK_WILAYAH.kalbar && g.KK_WILAYAH.kalbar[kid])) return { kode: 'kalbar', label: 'Kalimantan Barat' };
    if (kid === 'medan' || prov.indexOf('sumatera utara') >= 0) return { kode: 'sumut', label: 'Medan & Sumut' };
    if (kid === 'jakarta' || prov.indexOf('jakarta') >= 0 || prov.indexOf('banten') >= 0) return { kode: 'jakarta', label: 'Betawi / Jakarta' };
    if (kid === 'bandung' || prov.indexOf('jawa barat') >= 0) return { kode: 'jabar', label: 'Sunda / Bandung' };
    if (kid === 'surabaya' || prov.indexOf('jawa timur') >= 0) return { kode: 'jatim', label: 'Surabaya & Jatim' };
    if (kid === 'makassar' || prov.indexOf('sulawesi selatan') >= 0) return { kode: 'sulsel', label: 'Makassar & Sulsel' };
    if (kid === 'padang' || prov.indexOf('sumatera barat') >= 0) return { kode: 'sumbar', label: 'Minang / Padang' };
    return { kode: 'umum', label: (g.KK_DIRI && g.KK_DIRI.kota ? g.KK_DIRI.kota(S).nama : 'Nusantara') };
  }
  function kulinerDaerah(S) {
    var w = wilayahKuliner(S);
    return { label: w.label, daftar: (KULINER_MAP[w.kode] || []).concat(KULINER_MAP.umum) };
  }
  function beliKulinerDaerah(S, id) {
    var kd = kulinerDaerah(S);
    var item = kd.daftar.filter(function (x) { return x.id === id; })[0];
    if (!item) return 'Menu kuliner tidak ditemukan.';
    var by = g.KK_UANG.bayarPilihan(S, item.harga, 'Kuliner ' + kd.label + ': ' + item.nama, S._metodeBayar || 'dompet');
    if (by !== true) return by;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + item.harga;
    S.diri.kenyang = batas((S.diri.kenyang || 0) + (item.kenyang || 0));
    S.diri.minum = batas((S.diri.minum || 0) + (item.minum || 0));
    if (item.stamina) S.diri.stamina = batas((S.diri.stamina || 0) + item.stamina);
    if (item.sehat) S.diri.kesehatan = batas((S.diri.kesehatan || 100) + 2);
    catatKalori(S, item.kalori || 420, !!item.sehat);
    return { ok: true, menit: 15, teks: item.nama + ' (' + rp(item.harga) + ') mantap! Kenyang +' + item.kenyang + '%.' };
  }

  /* ---------- 5. Bencana Alam Nusantara + Masker N95 ---------- */
  function beliMaskerN95(S) {
    var R = siapkan(S);
    var h = 25000;
    var by = g.KK_UANG.bayarPilihan(S, h, 'Beli Masker N95 Anti Kabut Asap (5 pcs)', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    R.bencana.maskerN95 = (R.bencana.maskerN95 || 0) + 5;
    return { ok: true, teks: '😷 Beli 5 pcs Masker N95 (' + rp(h) + '). Total stok: ' + R.bencana.maskerN95 + ' pcs (melindungi dari Kabut Asap Karhutla).' };
  }

  /* ---------- 6. Utang Teman ---------- */
  function pinjamkanTeman(S, idx) {
    var R = siapkan(S), u = R.utangTeman[+idx];
    if (!u || u.status !== 'minta') return 'Permintaan pinjaman tidak ditemukan.';
    var by = g.KK_UANG.bayarPilihan(S, u.nominal, 'Pinjamkan teman: ' + u.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    u.status = 'dipinjam';
    u.tempo = (S.hari || 0) + 10;
    var tm = (S.teman || []).filter(function (x) { return x.id === u.temanId; })[0];
    if (tm) tm.hubungan = Math.min(100, (tm.hubungan || 50) + 12);
    return { ok: true, teks: '💸 Kamu meminjamkan ' + rp(u.nominal) + ' ke ' + u.nama + '. Janji bayar 10 hari lagi!' };
  }
  function tolakPinjamanTeman(S, idx) {
    var R = siapkan(S), u = R.utangTeman[+idx];
    if (!u || u.status !== 'minta') return 'Permintaan tidak ditemukan.';
    R.utangTeman.splice(+idx, 1);
    return { ok: true, teks: 'Permintaan pinjaman ' + u.nama + ' ditolak dengan sopan.' };
  }
  function tagihUtangTeman(S, idx) {
    var R = siapkan(S), u = R.utangTeman[+idx];
    if (!u || u.status !== 'dipinjam') return 'Catatan utang tidak ditemukan.';
    if (Math.random() < (S.hari >= u.tempo ? 0.62 : 0.25)) {
      S.bank.saldo += u.nominal;
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Pelunasan utang dari ' + u.nama, jml: u.nominal });
      R.utangTeman.splice(+idx, 1);
      return { ok: true, teks: '✅ Alhamdulillah! ' + u.nama + ' melunasi utangnya ' + rp(u.nominal) + ' ke rekeningmu!' };
    }
    return { ok: true, teks: '😅 ' + u.nama + ' cuma baca WA (centang biru): "Sabar ya bro, minggu depan gajian langsung ku transfer!"' };
  }
  function ikhlaskanUtang(S, idx) {
    var R = siapkan(S), u = R.utangTeman[+idx];
    if (!u) return 'Data tidak ditemukan.';
    R.utangTeman.splice(+idx, 1);
    S.diri.rasaBersalah = Math.max(0, (S.diri.rasaBersalah || 0) - 10);
    return { ok: true, teks: '🙏 Kamu mengikhlaskan utang ' + u.nama + ' (' + rp(u.nominal) + '). Hati terasa lega!' };
  }

  /* ---------- 7. JHT BPJS Ketenagakerjaan ---------- */
  function klaimJht(S) {
    var R = siapkan(S);
    if ((R.jht.saldo || 0) < 100000) return 'Saldo JHT BPJS Ketenagakerjaan masih kosong (kerja kantoran dulu untuk iuran otomatis 5,7%/bulan).';
    if (S.karier && S.karier.id) return 'Klaim penuh JHT hanya bisa dilakukan saat sudah resign/habis kontrak/PHK.';
    var jml = Math.round(R.jht.saldo);
    R.jht.saldo = 0;
    S.bank.saldo += jml;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Klaim Saldo JHT BPJS Ketenagakerjaan', jml: jml });
    catatSejarah(S, '🏛️', 'Mencairkan saldo JHT BPJS Ketenagakerjaan sebesar ' + rp(jml) + '.');
    return { ok: true, teks: '🏛️ Klaim JHT BPJS Ketenagakerjaan cair ' + rp(jml) + ' langsung ke rekening!' };
  }

  /* ---------- 8. Skripsi & Revisi Dosen Killer ---------- */
  function kerjakanSkripsi(S) {
    var R = siapkan(S);
    if (!S.kuliahAktif) return 'Kamu tidak sedang menempuh kuliah S1/S2.';
    if (R.skripsi.kuliahMulai !== S.kuliahAktif.mulaiHari) {
      R.skripsi = { progres: 0, revisi: 0, selesai: false, kuliahMulai: S.kuliahAktif.mulaiHari };
    }
    if (R.skripsi.selesai) return 'Skripsi sudah ACC & Lulus Sidang! Tunggu hari wisuda tiba.';
    if (S.diri.stamina < 18) return 'Stamina kurang untuk ngetik skripsi & bimbingan dosen.';
    S.diri.stamina = batas(S.diri.stamina - 16);
    if (R.skripsi.progres < 100) {
      var naik = 25;
      R.skripsi.progres = Math.min(100, R.skripsi.progres + naik);
      if (Math.random() < 0.45 && R.skripsi.revisi < 4) {
        R.skripsi.revisi++;
        return { ok: true, menit: 90, teks: '📄 Bimbingan ke Dosen Killer: "BAB ' + R.skripsi.revisi + ' REVISI TOTAL! Referensi kurang!" (Progres ' + R.skripsi.progres + '% · Revisi ke-' + R.skripsi.revisi + ').' };
      }
      return { ok: true, menit: 90, teks: '🎓 Ngerjain Skripsi lancar (+25% → ' + R.skripsi.progres + '%).' };
    }
    R.skripsi.selesai = true;
    S.kuliahAktif.lulusPada = Math.min(S.kuliahAktif.lulusPada || (S.hari + 3), S.hari + 3);
    catatSejarah(S, '🎓', 'Lulus Sidang Skripsi dengan predikat Cumlaude!');
    return { ok: true, menit: 120, teks: '🎉 SELAMAT! Kamu LULUS SIDANG SKRIPSI! Ijazah & wisuda dipercepat (3 hari lagi).' };
  }

  /* ---------- 9. Live Streaming Jualan (TikTok Live / Shopee Live) ---------- */
  function liveStreaming(S, plat) {
    var R = siapkan(S);
    if (S.diri.stamina < 15) return 'Stamina terlalu rendah untuk siaran Live Streaming.';
    if (R.live.hariTerakhir === S.hari) return 'Hari ini sudah Live Streaming (maksimal 1 sesi/hari agar suara & stamina terjaga).';
    var ck = g.KK_DIRI && g.KK_DIRI.pakaiKuota ? g.KK_DIRI.pakaiKuota(S, 1.2) : true;
    if (ck !== true) return ck;
    var ef = g.KK_DIRI && g.KK_DIRI.efekHp ? g.KK_DIRI.efekHp(S) : { kontenBonus: 0 };
    var ring = g.KK_DIRI && g.KK_DIRI.punya && g.KK_DIRI.punya(S, 'ringlight') ? 1.4 : 1.0;
    var fol = ((S.dunia && S.dunia.sosmed && S.dunia.sosmed.tiktok) || 0) + ((S.dunia && S.dunia.sosmed && S.dunia.sosmed.ig) || 0);
    var penonton = Math.round((45 + Math.sqrt(fol + 10) * 8) * (1 + ef.kontenBonus) * ring);
    var komisi = Math.round((35000 + penonton * 420) * (0.75 + Math.random() * 0.65) / 1000) * 1000;
    R.live.hariTerakhir = S.hari;
    R.live.sesi++;
    R.live.totalOmzet += komisi;
    S.bank.saldo += komisi;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Komisi ' + (plat === 'shopee' ? 'Shopee Live' : 'TikTok Live') + ' Affiliate', jml: komisi });
    S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + komisi;
    S.diri.stamina = batas(S.diri.stamina - 14);
    if (S.dunia && S.dunia.sosmed) S.dunia.sosmed.tiktok = (S.dunia.sosmed.tiktok || 0) + Math.round(penonton * 0.15);
    return { ok: true, menit: 75, teks: '📹 Live di ' + (plat === 'shopee' ? 'Shopee Live' : 'TikTok Live') + ' (' + penonton + ' penonton) laris! Komisi cair ' + rp(komisi) + '.' };
  }

  /* ---------- 10. Franchise / Waralaba Nyata ---------- */
  function beliFranchise(S, id) {
    var R = siapkan(S);
    var f = FRANCHISE_LIST.filter(function (x) { return x.id === id; })[0];
    if (!f) return 'Franchise tidak dikenal.';
    var jml = (R.franchise[id] || 0);
    if (jml >= 3) return 'Maksimal 3 cabang per merek franchise.';
    var by = g.KK_UANG.bayarPilihan(S, f.modal, 'Investasi ' + f.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.franchise[id] = jml + 1;
    catatSejarah(S, '🏪', 'Membuka cabang ' + f.nama + ' (modal ' + rp(f.modal) + ').');
    return { ok: true, teks: '🏪 Selamat! Cabang ' + f.nama + ' resmi buka! Bagi hasil otomatis ~' + rp(f.labaBln) + '/bulan.' };
  }

  /* ---------- 11. Perjanjian Pra-Nikah (Prenup) ---------- */
  function buatPrenup(S) {
    var R = siapkan(S);
    if (R.prenup) return 'Akta Perjanjian Pra-Nikah (Pisah Harta) sudah sah terdaftar di Notaris!';
    var biaya = 4500000;
    var by = g.KK_UANG.bayarPilihan(S, biaya, 'Notaris & Pengacara: Akta Prenup Pisah Harta', S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.prenup = true;
    catatSejarah(S, '⚖️', 'Menandatangani Akta Perjanjian Pisah Harta (Prenup) di Notaris.');
    return { ok: true, teks: '⚖️ Akta Prenup sah! Seluruh aset & rekeningmu terlindungi penuh (0% pembagian gono-gini jika cerai).' };
  }

  /* ---------- 12. Asuransi Kesehatan Swasta VIP & Jiwa ---------- */
  function toggleAsuransiSwasta(S) {
    var R = siapkan(S);
    if (R.asuransi.aktif) {
      R.asuransi.aktif = false;
      return { ok: true, teks: 'Polis Asuransi Swasta VIP dinonaktifkan.' };
    }
    var by = g.KK_UANG.bayarPilihan(S, R.asuransi.premi, 'Premi Asuransi Kesehatan VIP & Jiwa', S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.asuransi.aktif = true;
    R.asuransi.jatuhTempoBln = KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m;
    return { ok: true, teks: '🛡️ Polis Asuransi Swasta VIP aktif (' + rp(R.asuransi.premi) + '/bln)! Rawat inap RS VIP Gratis 100% + Santunan Jiwa Rp250jt.' };
  }

  /* ---------- 13. Pasar Kripto 24 Jam ---------- */
  function beliKripto(S, id, rpBayar) {
    var R = siapkan(S), c = R.kripto[id];
    var m = KRIPTO_LIST.filter(function (x) { return x.id === id; })[0];
    if (!c || !m) return 'Aset kripto tidak dikenal.';
    rpBayar = Math.max(100000, Math.round(+rpBayar || 500000));
    var by = g.KK_UANG.bayarPilihan(S, rpBayar, 'Beli Kripto ' + m.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    var koin = rpBayar / c.harga;
    c.punya = (c.punya || 0) + koin;
    c.modal = (c.modal || 0) + rpBayar;
    return { ok: true, teks: '🪙 Beli ' + koin.toFixed(id === 'btc' ? 5 : 3) + ' ' + id.toUpperCase() + ' senilai ' + rp(rpBayar) + '!' };
  }
  function jualKripto(S, id) {
    var R = siapkan(S), c = R.kripto[id];
    if (!c || (c.punya || 0) <= 0) return 'Belum memiliki koin ' + id.toUpperCase() + '.';
    var nilai = Math.round(c.punya * c.harga);
    var untung = nilai - Math.round(c.modal || 0);
    c.punya = 0; c.modal = 0;
    S.bank.saldo += nilai;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual Kripto ' + id.toUpperCase(), jml: nilai });
    return { ok: true, teks: '💵 Jual seluruh ' + id.toUpperCase() + ' cair ' + rp(nilai) + ' (' + (untung >= 0 ? 'Cuan +' : 'Rugi ') + rp(untung) + ')!' };
  }

  /* ---------- 14. Paspor, Road Trip Kuching, Wisata LN, Umrah & Haji ---------- */
  function buatPaspor(S) {
    var R = siapkan(S);
    if (R.paspor.punya) return 'Kamu sudah memiliki E-Paspor RI aktif!';
    var by = g.KK_UANG.bayarPilihan(S, 650000, 'Imigrasi: Pembuatan E-Paspor RI (10 Tahun)', S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.paspor.punya = true;
    catatSejarah(S, '🛂', 'Resmi memiliki E-Paspor Republik Indonesia (berlaku 10 tahun).');
    return { ok: true, menit: 90, teks: '🛂 E-Paspor RI selesai dibuat (Rp650.000)! Sekarang bisa Road Trip ke Kuching Malaysia, wisata LN, & Umrah.' };
  }
  function tripLuarNegeri(S, id) {
    var R = siapkan(S);
    var t = LUAR_NEGERI_LIST.filter(function (x) { return x.id === id; })[0];
    if (!t) return 'Paket perjalanan tidak ditemukan.';
    if (t.perluPaspor && !R.paspor.punya) return 'Wajib buat E-Paspor RI (Rp650.000) dulu sebelum keluar negeri!';
    if (t.daftarHaji && R.paspor.hajiPorsi) return 'Kamu sudah terdaftar antrean Haji Reguler (No. Porsi: ' + R.paspor.hajiPorsi + ').';
    var by = g.KK_UANG.bayarPilihan(S, t.biaya, t.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    if (t.daftarHaji) {
      R.paspor.hajiPorsi = '1400' + (100000 + Math.floor(Math.random() * 899999));
      catatSejarah(S, '🕌', 'Mendaftar Porsi Haji Reguler Kemenag (No. Porsi ' + R.paspor.hajiPorsi + ').');
      return { ok: true, menit: 60, teks: '🕌 Alhamdulillah! Resmi mendapat Nomor Porsi Haji Reguler: ' + R.paspor.hajiPorsi + '.' };
    }
    S.diri.stamina = batas((S.diri.stamina || 50) + t.stamina);
    S.diri.kesehatan = batas((S.diri.kesehatan || 100) + t.sehat);
    if (t.rohani) { S.diri.rasaBersalah = 0; R.paspor.umrahCount = (R.paspor.umrahCount || 0) + 1; }
    if (S.dunia && S.dunia.sosmed) S.dunia.sosmed.ig = (S.dunia.sosmed.ig || 0) + t.sosmed;
    R.paspor.tripList.unshift({ hari: S.hari, nama: t.nama });
    catatSejarah(S, t.rohani ? '🕋' : '✈️', 'Berangkat ' + t.nama + '.');
    return { ok: true, menit: Math.min(240, (t.hari || 1) * 45), teks: t.nama + ' selesai dengan kenangan luar biasa! (+' + t.sosmed + ' followers IG).' };
  }

  /* ---------- 15. Event Budaya Nusantara ---------- */
  function infoEventBudaya(S) {
    var t = KAL.tgl(S.hari || 0);
    if (t.m === 8 && t.d === 17) return { id: '17agustus', nama: '🇮🇩 HUT RI 17 Agustus (Lomba Kampung)', bonusOjol: 1.35 };
    if (t.m === 2 && t.d >= 10 && t.d <= 22) {
      var diSkw = (S.kota === 'singkawang') || (S.ojek && S.ojek.lokasi && S.ojek.lokasi.kabId === 'singkawang');
      return { id: 'capgomeh', nama: diSkw ? '🏮 Festival Tatung Cap Go Meh Singkawang (+250% Order!)' : '🏮 Perayaan Cap Go Meh Nusantara', bonusOjol: diSkw ? 2.5 : 1.3 };
    }
    var rmd = KAL.apakahRamadan ? KAL.apakahRamadan(S.hari) : 0;
    if (rmd === 29 || rmd === 30) return { id: 'takbiran', nama: '🥁 Malam Takbiran Nusantara', bonusOjol: 1.8 };
    return null;
  }
  function faktorEventBudaya(S) {
    var ev = infoEventBudaya(S);
    return ev ? ev.bonusOjol : 1.0;
  }
  function lomba17Agustus(S) {
    var R = siapkan(S), t = KAL.tgl(S.hari || 0);
    if (R.lomba17Tahun === t.y) return 'Kamu sudah ikut Lomba 17-an tahun ini!';
    R.lomba17Tahun = t.y;
    var menang = Math.random() < 0.6;
    var hadiah = menang ? (250000 + Math.floor(Math.random() * 5) * 150000) : 50000;
    S.uang.dompet = (S.uang.dompet || 0) + hadiah;
    S.diri.stamina = batas(S.diri.stamina - 15);
    catatSejarah(S, '🇮🇩', menang ? 'Juara Panjat Pinang 17 Agustus (hadiah ' + rp(hadiah) + ')!' : 'Ikut meramaikan Lomba 17 Agustus RT.');
    return { ok: true, menit: 90, teks: menang ? '🏆 JUARA 1 Panjat Pinang & Balap Karung 17 Agustus! Dapat hadiah ' + rp(hadiah) + '!' : '🇮🇩 Seru ikut lomba 17-an kampung! Dapat doorprize ' + rp(hadiah) + '.' };
  }

  /* ---------- 16. Listrik 3-Daya PLN & MCB Jeglek ---------- */
  function infoDayaPln(S) {
    var R = siapkan(S);
    var cur = DAYA_PLN.filter(function (x) { return x.va === R.pln.daya; })[0] || DAYA_PLN[1];
    var alatAktif = 1 + (g.KK_DIRI && g.KK_DIRI.adaAc && g.KK_DIRI.adaAc(S) ? 2 : 0) +
      (S.rumah && S.rumah.barang && S.rumah.barang.kulkas2 ? 2 : (S.rumah && S.rumah.barang && S.rumah.barang.kulkas ? 1 : 0)) +
      (S.rumah && S.rumah.barang && (S.rumah.barang.tv55 || S.rumah.barang.ps5) ? 1 : 0);
    var rawan = alatAktif > cur.maksAlat;
    return { cur: cur, alatAktif: alatAktif, rawan: rawan };
  }
  function tambahDayaPln(S, va) {
    var R = siapkan(S);
    va = +va;
    var target = DAYA_PLN.filter(function (x) { return x.va === va; })[0];
    if (!target) return 'Daya PLN tidak valid.';
    if (va <= R.pln.daya) return 'Daya listrik rumahmu sudah ' + R.pln.daya + ' VA.';
    var by = g.KK_UANG.bayarPilihan(S, target.biayaNaik, 'PLN Mobile: Tambah Daya ke ' + target.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.pln.daya = va;
    return { ok: true, teks: '⚡ Tambah daya PLN ke ' + target.nama + ' selesai (' + rp(target.biayaNaik) + ')! Bebas MCB jeglek.' };
  }

  /* ---------- 17. PDAM Mati & Toren Air + Pompa Sumur Bor ---------- */
  function pasangTorenSumur(S) {
    var R = siapkan(S);
    if (R.pdam.punyaToren) return 'Toren Air + Pompa Sumur Bor sudah terpasang di rumahmu!';
    var h = 6500000;
    var by = g.KK_UANG.bayarPilihan(S, h, 'Pasang Toren Air 1000L + Pompa Sumur Bor', S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.pdam.punyaToren = true;
    R.pdam.mati = false;
    return { ok: true, teks: '💧 Toren Air + Sumur Bor terpasang (' + rp(h) + ')! Rumahmu kebal gangguan PDAM mati seumur hidup.' };
  }
  function beliAirTangki(S) {
    var R = siapkan(S);
    var by = g.KK_UANG.bayarPilihan(S, 120000, 'Beli Air Bersih Mobil Tangki Darurat', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    R.pdam.mati = false;
    return { ok: true, teks: '🚛 Mobil tangki air mengisi bak rumah (Rp120.000). Air lancar lagi!' };
  }

  /* ---------- 18. Aplikasi Dating Modern (Swipe Kanan/Kiri + First Date) ---------- */
  var BIO_DATING = [
    'Suka kopi susu & jalan sore naik motor 🛵',
    'Anak kantoran yang cari teman ngobrol serius ☕',
    'Hobi kulineran malam & nonton film horor 🎬',
    'Pengusaha muda, suka orang pekerja keras 💪',
    'Suka traveling & foto estetik 📸'
  ];
  var KERJA_DATING = ['Perawat RS', 'Admin Bank', 'Barista', 'Desainer Grafis', 'Guru SD', 'Mahasiswi', 'Apoteker', 'Marketing'];
  function daftarDating(S) {
    var R = siapkan(S);
    if (R.dating.hariAcak !== S.hari || !R.dating.kandidat.length) {
      R.dating.hariAcak = S.hari;
      var lawan = ((S.profil && S.profil.gender) === 'cewek') ? 'cowok' : 'cewek';
      var list = [], sudahNm = [];
      for (var i = 0; i < 5; i++) {
        var nm = (g.KK_NAMA && g.KK_NAMA.acak) ? g.KK_NAMA.acak(S, { gender: lawan, hindari: sudahNm }) : ((lawan === 'cewek' ? 'Nadia' : 'Raka') + ' ' + (i + 1));
        sudahNm.push(nm);
        list.push({
          id: 'dt_' + S.hari + '_' + i,
          nama: nm,
          gender: lawan,
          usia: 20 + ((S.hari + i * 3) % 10),
          kerja: KERJA_DATING[(S.hari + i) % KERJA_DATING.length],
          bio: BIO_DATING[(S.hari + i) % BIO_DATING.length],
          jarakKm: 1 + ((S.hari + i * 4) % 9),
          swiped: false
        });
      }
      R.dating.kandidat = list;
    }
    return R.dating.kandidat.filter(function (x) { return !x.swiped; });
  }
  function karismaTotal(S) {
    var R = siapkan(S), k = 0;
    var jm = MEWAH_LIST.filter(function (x) { return x.id === R.mewah.pakaiJam; })[0];
    var pf = MEWAH_LIST.filter(function (x) { return x.id === R.mewah.pakaiParfum; })[0];
    if (jm) k += jm.karisma;
    if (pf) k += pf.karisma;
    var ef = g.KK_DIRI && g.KK_DIRI.efekHp ? g.KK_DIRI.efekHp(S) : null;
    if (ef) k += Math.round((ef.prestiseBonus || 0) * 60);
    if (infoBmi(S).status === 'Ideal' || infoBmi(S).status === 'Atletis') k += 10;
    return k;
  }
  function swipeDating(S, id, suka) {
    var R = siapkan(S);
    var k = (R.dating.kandidat || []).filter(function (x) { return x.id === id; })[0];
    if (!k) return 'Profil sudah lewat.';
    k.swiped = true;
    if (!suka) return { ok: true, match: false, teks: '❌ Swipe kiri ' + k.nama + '.' };
    var peluang = Math.min(0.88, 0.32 + karismaTotal(S) * 0.008);
    if (Math.random() < peluang) {
      /* Match! Otomatis masuk ke daftar teman dengan hubungan awal 42% */
      var sudah = (S.teman || []).some(function (t) { return t.nama === k.nama; });
      if (!sudah && g.KK_TEMAN && g.KK_TEMAN.tambah) {
        var tLahir = (KAL.tgl(S.hari).y - k.usia) + '-05-14';
        g.KK_TEMAN.tambah(S, k.nama, k.gender, 'teman', tLahir);
        var baru = S.teman[S.teman.length - 1];
        if (baru) { baru.hubungan = 45; baru.perasaan = 48; baru.hb = 55; }
      }
      R.dating.matchList.unshift({ nama: k.nama, kerja: k.kerja, hari: S.hari });
      return { ok: true, match: true, teks: '💘 IT\'S A MATCH! ' + k.nama + ' (' + k.kerja + ') langsung masuk daftar Teman/Kontak! Ajak First Date sekarang!' };
    }
    return { ok: true, match: false, teks: '👍 Like terkirim ke ' + k.nama + ', tunggu balasan...' };
  }

  /* ---------- 19. Jam Tangan Mewah & Parfum ---------- */
  function beliMewah(S, id) {
    var R = siapkan(S);
    var it = MEWAH_LIST.filter(function (x) { return x.id === id; })[0];
    if (!it) return 'Produk tidak dikenal.';
    if (R.mewah.milik[id]) return 'Sudah punya ' + it.nama + '.';
    var by = g.KK_UANG.bayarPilihan(S, it.harga, 'Beli ' + it.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.mewah.milik[id] = { dibeli: S.hari, hargaBeli: it.harga, nilaiSkrg: it.harga };
    if (it.jenis === 'jam') R.mewah.pakaiJam = id; else R.mewah.pakaiParfum = id;
    if (it.harga >= 50000000) catatSejarah(S, '⌚', 'Membeli jam tangan mewah ' + it.nama + ' (' + rp(it.harga) + ').');
    return { ok: true, teks: (it.jenis === 'jam' ? '⌚ ' : '✨ ') + it.nama + ' dibeli & langsung dipakai (+' + it.karisma + ' Karisma)!' };
  }
  function pakaiMewah(S, id) {
    var R = siapkan(S), it = MEWAH_LIST.filter(function (x) { return x.id === id; })[0];
    if (!it || !R.mewah.milik[id]) return 'Belum memiliki item ini.';
    if (it.jenis === 'jam') R.mewah.pakaiJam = id; else R.mewah.pakaiParfum = id;
    return { ok: true, teks: '✨ Sekarang memakai ' + it.nama + ' (+' + it.karisma + ' Karisma).' };
  }
  function jualMewah(S, id) {
    var R = siapkan(S), it = MEWAH_LIST.filter(function (x) { return x.id === id; })[0], st = R.mewah.milik[id];
    if (!it || !st) return 'Tidak dimiliki.';
    var h = Math.round(st.nilaiSkrg || it.harga * 0.7);
    delete R.mewah.milik[id];
    if (R.mewah.pakaiJam === id) R.mewah.pakaiJam = null;
    if (R.mewah.pakaiParfum === id) R.mewah.pakaiParfum = null;
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual koleksi: ' + it.nama, jml: h });
    return { ok: true, teks: '💰 ' + it.nama + ' terjual ' + rp(h) + ' ke rekening!' };
  }

  /* ---------- 21. Gizi & Berat Badan Realistis (BMI) ---------- */
  function infoBmi(S) {
    var R = siapkan(S), b = R.bmi;
    var tM = (b.tinggiCm || 168) / 100;
    var bmi = Math.round((b.beratKg / (tM * tM)) * 10) / 10;
    var status = bmi < 18.5 ? 'Kurus' : bmi <= 24.9 ? (S.eko && S.eko.sehat && S.eko.sehat.gymCount >= 4 ? 'Atletis' : 'Ideal') : bmi <= 29.9 ? 'Gemuk' : 'Obesitas';
    return { berat: Math.round(b.beratKg * 10) / 10, tinggi: b.tinggiCm, bmi: bmi, status: status };
  }
  function catatKalori(S, kal, sehat) {
    var R = siapkan(S);
    R.bmi.kaloriHari = (R.bmi.kaloriHari || 0) + (kal || 350);
    if (!sehat && R.bmi.kaloriHari > 2400) R.bmi.beratKg = Math.min(125, R.bmi.beratKg + 0.12);
    else if (sehat && R.bmi.beratKg > 68) R.bmi.beratKg = Math.max(44, R.bmi.beratKg - 0.06);
  }
  function catatMakan(S, id) {
    var berlemak = /goreng|mie|martabak|sate|ayam|rendang|soto|bakso/i.test(String(id || ''));
    catatKalori(S, berlemak ? 580 : 340, !berlemak);
  }
  function olahragaJalanKaki(S, km) {
    var R = siapkan(S);
    R.bmi.beratKg = Math.max(45, Math.round((R.bmi.beratKg - (km || 1) * 0.04) * 100) / 100);
  }

  /* ---------- 22. Jabatan Sosial (Ketua RT / Pengurus Masjid) & Koperasi RT ---------- */
  function daftarKetuaRt(S, jabatan) {
    var R = siapkan(S);
    if (R.rt.jabatan) return 'Kamu sudah menjabat sebagai ' + R.rt.jabatan + '!';
    if ((S.eko && S.eko.reputasi || 50) < 60) return 'Butuh Reputasi Sosial minimal 60 agar dipercaya warga!';
    R.rt.jabatan = jabatan === 'masjid' ? 'Pengurus DKM Masjid' : 'Ketua RT 04';
    catatSejarah(S, '🏛️', 'Terpilih warga menjabat sebagai ' + R.rt.jabatan + ' (insentif Rp750rb/bln).');
    return { ok: true, teks: '🏅 Selamat! Warga memilihmu jadi ' + R.rt.jabatan + '! Insentif Rp750.000/bulan + Reputasi naik!' };
  }
  function pinjamKoperasiRt(S, nom) {
    var R = siapkan(S);
    nom = Math.max(500000, Math.min(5000000, +nom || 2000000));
    if (R.rt.koperasiUtang > 0) return 'Lunasi dulu pinjaman Koperasi RT sebelumnya (' + rp(R.rt.koperasiUtang) + ').';
    R.rt.koperasiUtang = Math.round(nom * 1.05); /* bunga ringan koperasi 5% flat */
    R.rt.jatuhTempo = (S.hari || 0) + 30;
    S.bank.saldo += nom;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Pinjaman Koperasi Simpan Pinjam RT (Bunga 5%)', jml: nom });
    return { ok: true, teks: '🤝 Pinjaman Koperasi RT cair ' + rp(nom) + ' (bunga ringan 5%, total bayar ' + rp(R.rt.koperasiUtang) + ' dlm 30 hari).' };
  }
  function bayarKoperasiRt(S) {
    var R = siapkan(S);
    if (R.rt.koperasiUtang <= 0) return 'Tidak ada pinjaman aktif di Koperasi RT.';
    var by = g.KK_UANG.bayarPilihan(S, R.rt.koperasiUtang, 'Pelunasan Koperasi Simpan Pinjam RT', S._metodeBayar || 'bank');
    if (by !== true) return by;
    var jml = R.rt.koperasiUtang;
    R.rt.koperasiUtang = 0; R.rt.jatuhTempo = -1;
    return { ok: true, teks: '✅ Pinjaman Koperasi RT (' + rp(jml) + ') LUNAS!' };
  }

  /* ---------- 23. Tanah Kavling Spekulasi Proyek ---------- */
  function daftarKavlingProyek(S) {
    var R = siapkan(S), mgg = Math.floor((S.hari || 0) / 14);
    if (R.kavling.pasarMinggu !== mgg || !R.kavling.tawaran.length) {
      R.kavling.pasarMinggu = mgg;
      R.kavling.tawaran = [
        { id: 'kav_tol_' + mgg, nama: 'Tanah Kavling Pinggir Rencana Exit Tol (200 m²)', harga: 75000000, lamaHari: 90, potensiMin: 2.1, potensiMax: 3.6, ket: 'Isu proyek tol provinsi masuk tahap pembebasan lahan' },
        { id: 'kav_kampus_' + mgg, nama: 'Kavling Dekat Lahan Kampus Negeri Baru (150 m²)', harga: 52000000, lamaHari: 75, potensiMin: 1.8, potensiMax: 3.1, ket: 'Cocok dijual ke pengembang kos mahasiswa nanti' },
        { id: 'kav_bandara_' + mgg, nama: 'Lahan Akses Jalan Lingkar Bandara (300 m²)', harga: 135000000, lamaHari: 120, potensiMin: 2.3, potensiMax: 4.0, ket: 'Spekulasi jangka menengah, potensi cuan hingga 400%!' }
      ];
    }
    return R.kavling.tawaran;
  }
  function beliKavlingProyek(S, idx) {
    var R = siapkan(S), list = daftarKavlingProyek(S), kv = list[+idx];
    if (!kv) return 'Kavling sudah terjual.';
    var by = g.KK_UANG.bayarPilihan(S, kv.harga, 'Beli ' + kv.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    R.kavling.milik.push({
      nama: kv.nama, hargaBeli: kv.harga, nilaiSkrg: kv.harga,
      beliHari: S.hari, matangHari: S.hari + kv.lamaHari,
      mult: kv.potensiMin + Math.random() * (kv.potensiMax - kv.potensiMin),
      matang: false
    });
    list.splice(+idx, 1);
    catatSejarah(S, '🗺️', 'Membeli ' + kv.nama + ' (' + rp(kv.harga) + ') untuk spekulasi proyek.');
    return { ok: true, teks: '🗺️ Sertifikat SHM ' + kv.nama + ' sah milikmu! Tunggu proyek jadi (~' + kv.lamaHari + ' hari) untuk cuan 200–400%!' };
  }
  function jualKavlingProyek(S, idx) {
    var R = siapkan(S), kv = R.kavling.milik[+idx];
    if (!kv) return 'Kavling tidak ditemukan.';
    var h = Math.round(kv.nilaiSkrg);
    var cuan = h - kv.hargaBeli;
    R.kavling.milik.splice(+idx, 1);
    S.bank.saldo += h;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual ' + kv.nama, jml: h });
    catatSejarah(S, '💎', 'Menjual ' + kv.nama + ' seharga ' + rp(h) + ' (cuan ' + rp(cuan) + ').');
    return { ok: true, teks: '💎 ' + kv.nama + ' terjual ' + rp(h) + ' (' + (cuan >= 0 ? 'CUAN +' : 'Rugi ') + rp(cuan) + ')!' };
  }

  /* ---------- O(1) Tick Harian untuk semua 25 sistem ---------- */
  function gantiHari(S, nLama, nBaru) {
    var R = siapkan(S), kabar = [];
    var tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru);
    var gantiBulan = tL.m !== tB.m;

    /* 1. Kripto 24 jam bergerak harian */
    KRIPTO_LIST.forEach(function (m) {
      var c = R.kripto[m.id];
      if (!c) return;
      var delta = (Math.random() * 2 - 0.96) * m.vol;
      c.ubah = Math.round(delta * 1000) / 10;
      c.harga = Math.max(Math.round(m.hargaAwal * 0.25), Math.round(c.harga * (1 + delta)));
    });

    /* 2. BBM Langka (jarang ~7% per hari, bertahan 2 hari) */
    if (R.bbmLangka.aktif && nBaru > R.bbmLangka.sampai) {
      R.bbmLangka.aktif = false;
      kabar.push('⛽ Pasokan BBM Pertamina kembali normal di seluruh SPBU.');
    } else if (!R.bbmLangka.aktif && Math.random() < 0.07) {
      R.bbmLangka.aktif = true;
      R.bbmLangka.sampai = nBaru + 1;
      kabar.push('⛽ BERITA: Terjadi antrean panjang & BBM Langka di SPBU! Kesempatan antre jerigen & jual eceran cuan!');
    }

    /* 3. Bencana Alam Nusantara (Kabut Asap kemarau / Gempa ringan) */
    var kemarau = (tB.m >= 7 && tB.m <= 10);
    if (R.bencana.kabutAsap) {
      if (Math.random() < 0.45) { R.bencana.kabutAsap = false; kabar.push('🌤️ Kabut asap karhutla mulai reda, udara kembali bersih.'); }
      else if ((R.bencana.maskerN95 || 0) > 0) { R.bencana.maskerN95--; }
      else if (S.diri) { S.diri.kesehatan = Math.max(15, (S.diri.kesehatan || 100) - 6); kabar.push('🌫️ Kabut asap tebal & kamu tidak pakai Masker N95! Kesehatan -6%.'); }
    } else if (kemarau && Math.random() < 0.08) {
      R.bencana.kabutAsap = true;
      kabar.push('🌫️ PERINGATAN: Kabut Asap Karhutla menyelimuti wilayah! Siapkan Masker N95.');
    }
    if (Math.random() < 0.012) {
      R.bencana.gempaHari = nBaru;
      kabar.push('🌋 BMKG: Gempa bumi ringan M4,8 terasa sebentar, tidak berpotensi tsunami.');
    }

    /* 4. PDAM mati sesekali di musim kemarau */
    if (R.pdam.mati && nBaru > R.pdam.sampai) R.pdam.mati = false;
    else if (!R.pdam.punyaToren && !R.pdam.mati && kemarau && Math.random() < 0.08) {
      R.pdam.mati = true; R.pdam.sampai = nBaru + 1;
      kabar.push('🚰 Air PDAM mati hari ini! Pesan air tangki atau pasang Toren + Sumur Bor di menu Listrik & Air.');
    }

    /* 5. Utang Teman sesekali WA pinjam uang */
    if (S.teman && S.teman.length && R.utangTeman.length < 3 && Math.random() < 0.08) {
      var tm = S.teman[Math.floor(Math.random() * S.teman.length)];
      if (tm && !R.utangTeman.some(function (u) { return u.temanId === tm.id; })) {
        var nom = [200000, 350000, 500000, 1000000, 1500000][Math.floor(Math.random() * 5)];
        R.utangTeman.push({ temanId: tm.id, nama: tm.nama, nominal: nom, status: 'minta', hari: nBaru, tempo: -1 });
        kabar.push('💬 WA dari ' + tm.nama + ': "Bro, lagi kepepet nih, boleh pinjam dulu ' + rp(nom) + '?" (Cek APK Dunia Nyata).');
      }
    }

    /* 6. Kavling proyek matang → nilai melonjak 200-400% */
    R.kavling.milik.forEach(function (kv) {
      if (!kv.matang && nBaru >= kv.matangHari) {
        kv.matang = true;
        kv.nilaiSkrg = Math.round(kv.hargaBeli * kv.mult / 100000) * 100000;
        kabar.push('🏗️ PROYEK JADI! Nilai ' + kv.nama + ' melonjak jadi ' + rp(kv.nilaiSkrg) + '!');
      } else if (!kv.matang) {
        kv.nilaiSkrg = Math.round(kv.nilaiSkrg * 1.004);
      }
    });

    /* 7. Reset kalori harian + evaluasi berat badan */
    if ((R.bmi.kaloriHari || 0) < 900) R.bmi.beratKg = Math.max(44, R.bmi.beratKg - 0.08);
    R.bmi.kaloriHari = 0;

    /* 8. Ganti Bulan: JHT BPJS, Franchise Profit, Insentif RT, Asuransi Swasta, Apresiasi Rolex */
    if (gantiBulan) {
      if (S.karier && S.karier.id && g.KK_HIDUP && g.KK_HIDUP.KARIER_TETAP) {
        var kjJht = g.KK_HIDUP.KARIER_TETAP.filter(function (x) { return x.id === S.karier.id; })[0];
        var gajiJht = kjJht ? kjJht.gaji : 0;
        if (gajiJht > 0) {
          var iuranJht = Math.round(gajiJht * 0.057);
          R.jht.saldo = (R.jht.saldo || 0) + iuranJht;
          R.jht.kontrakBln = (R.jht.kontrakBln || 0) + 1;
          /* Risiko kecil PHK efisiensi (2.5%/bln setelah 6 bln) lengkap pesangon */
          if (R.jht.kontrakBln >= 6 && Math.random() < 0.025) {
            var pesangon = Math.round(gajiJht * 2.5);
            S.bank.saldo += pesangon;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'Pesangon PHK Efisiensi Perusahaan', jml: pesangon });
            S.karier.id = null; R.jht.phkRiwayat++;
            kabar.push('📉 PHK Efisiensi perusahaan! Kamu menerima pesangon ' + rp(pesangon) + ' & bisa mencairkan JHT (' + rp(R.jht.saldo) + ').');
          }
        }
      }
      var totFran = 0;
      FRANCHISE_LIST.forEach(function (f) {
        var qty = R.franchise[f.id] || 0;
        if (qty > 0) totFran += qty * Math.round(f.labaBln * (0.85 + Math.random() * 0.3));
      });
      if (totFran > 0) {
        S.bank.saldo += totFran;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Bagi Hasil Bulanan Bisnis Franchise', jml: totFran });
        kabar.push('🏪 Profit bulanan Bisnis Franchise masuk rekening ' + rp(totFran) + '!');
      }
      if (R.rt.jabatan) {
        S.bank.saldo += 750000;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Insentif Bulanan ' + R.rt.jabatan, jml: 750000 });
        kabar.push('🏅 Insentif ' + R.rt.jabatan + ' Rp750.000 masuk rekening.');
      }
      if (R.asuransi.aktif) {
        if (S.bank.saldo >= R.asuransi.premi) {
          S.bank.saldo -= R.asuransi.premi;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Autodebet Premi Asuransi Swasta VIP', jml: -R.asuransi.premi });
        } else {
          R.asuransi.aktif = false;
          kabar.push('🛡️ Polis Asuransi Swasta VIP nonaktif karena saldo rekening kurang untuk autodebet.');
        }
      }
      /* Apresiasi bulanan jam tangan mewah */
      MEWAH_LIST.forEach(function (m) {
        if (m.naikThn > 0 && R.mewah.milik[m.id]) {
          R.mewah.milik[m.id].nilaiSkrg = Math.round((R.mewah.milik[m.id].nilaiSkrg || m.harga) * (1 + m.naikThn / 12));
        }
      });
    }

    /* Event Budaya hari ini */
    var ev = infoEventBudaya(S);
    if (ev) kabar.push('🎉 HARI INI: ' + ev.nama + '!');
    return kabar;
  }

  g.KK_REAL = {
    siapkan: siapkan, catatSejarah: catatSejarah, gantiHari: gantiHari,
    POI_LOKAL: POI_LOKAL, daftarTujuanPeta: daftarTujuanPeta, pergiBebas: pergiBebas, gambarPetaMini: gambarPetaMini,
    daftarBarcodeMyPertamina: daftarBarcodeMyPertamina, beliBbmEceran: beliBbmEceran, jualBbmEceran: jualBbmEceran,
    catatAusPerjalanan: catatAusPerjalanan, rawatDetailKnd: rawatDetailKnd, gantiOliPilihan: gantiOliPilihan,
    kulinerDaerah: kulinerDaerah, beliKulinerDaerah: beliKulinerDaerah,
    beliMaskerN95: beliMaskerN95,
    pinjamkanTeman: pinjamkanTeman, tolakPinjamanTeman: tolakPinjamanTeman, tagihUtangTeman: tagihUtangTeman, ikhlaskanUtang: ikhlaskanUtang,
    klaimJht: klaimJht, kerjakanSkripsi: kerjakanSkripsi, liveStreaming: liveStreaming,
    FRANCHISE_LIST: FRANCHISE_LIST, beliFranchise: beliFranchise,
    buatPrenup: buatPrenup, toggleAsuransiSwasta: toggleAsuransiSwasta,
    KRIPTO_LIST: KRIPTO_LIST, beliKripto: beliKripto, jualKripto: jualKripto,
    LUAR_NEGERI_LIST: LUAR_NEGERI_LIST, buatPaspor: buatPaspor, tripLuarNegeri: tripLuarNegeri,
    infoEventBudaya: infoEventBudaya, faktorEventBudaya: faktorEventBudaya, lomba17Agustus: lomba17Agustus,
    DAYA_PLN: DAYA_PLN, infoDayaPln: infoDayaPln, tambahDayaPln: tambahDayaPln,
    pasangTorenSumur: pasangTorenSumur, beliAirTangki: beliAirTangki,
    daftarDating: daftarDating, swipeDating: swipeDating, karismaTotal: karismaTotal,
    MEWAH_LIST: MEWAH_LIST, beliMewah: beliMewah, pakaiMewah: pakaiMewah, jualMewah: jualMewah,
    infoBmi: infoBmi, catatMakan: catatMakan, olahragaJalanKaki: olahragaJalanKaki,
    daftarKetuaRt: daftarKetuaRt, pinjamKoperasiRt: pinjamKoperasiRt, bayarKoperasiRt: bayarKoperasiRt,
    daftarKavlingProyek: daftarKavlingProyek, beliKavlingProyek: beliKavlingProyek, jualKavlingProyek: jualKavlingProyek
  };
})(window);
