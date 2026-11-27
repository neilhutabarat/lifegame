/* kalbar.js — Data wilayah presisi 100% Provinsi Kalimantan Barat (14 Kabupaten/Kota · 174 Kecamatan resmi Kemendagri/BPS · Desa/Kelurahan asli + GPS + medan jalan + rumus jarak jalan raya nyata).
   Dirancang modular pada window.KK_WILAYAH agar provinsi lain bisa ditambahkan bertahap ke depannya. */
(function (g) {
  'use strict';

  /* Profil medan jalan Kalimantan Barat: memengaruhi aus suspensi/ban, kecepatan, & konsumsi BBM secara realistis */
  var MEDAN_INFO = {
    kota: { kode: 'kota', nama: 'Jalan Kota (Aspal Mulus)', ikon: '🏙️', aus: 0.75, kec: 1.0, bbm: 1.0 },
    mulus: { kode: 'mulus', nama: 'Jalan Nasional / Aspal Mulus', ikon: '🛣️', aus: 0.9, kec: 1.0, bbm: 1.0 },
    pesisir: { kode: 'pesisir', nama: 'Jalan Pesisir / Aspal Pantai', ikon: '🌊', aus: 1.05, kec: 0.95, bbm: 1.02 },
    bergelombang: { kode: 'bergelombang', nama: 'Aspal Bergelombang / Tambalan', ikon: '〰️', aus: 1.45, kec: 0.84, bbm: 1.08 },
    perbukitan: { kode: 'perbukitan', nama: 'Jalan Perbukitan Berkelok', ikon: '⛰️', aus: 1.55, kec: 0.78, bbm: 1.15 },
    rusak: { kode: 'rusak', nama: 'Jalan Rusak / Berlubang Pedalaman', ikon: '⚠️', aus: 2.15, kec: 0.65, bbm: 1.22 },
    tanah: { kode: 'tanah', nama: 'Jalan Tanah / Laterit Pedalaman', ikon: '🪵', aus: 2.75, kec: 0.52, bbm: 1.32 },
    pulau: { kode: 'pulau', nama: 'Kepulauan / Penyeberangan Kapal', ikon: '⛵', aus: 1.1, kec: 0.6, bbm: 1.0 }
  };
  var MEDAN_BERAT = { kota: 0, mulus: 1, pesisir: 2, bergelombang: 3, perbukitan: 4, rusak: 5, tanah: 6, pulau: 7 };

  /* 14 Kabupaten/Kota & SELURUH 174 Kecamatan Resmi Provinsi Kalimantan Barat (BPS/Kemendagri) */
  var KALBAR = {
    /* 1. KOTA PONTIANAK — 6 Kecamatan */
    pontianak: {
      nama: 'Kota Pontianak', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ptk_kota', nama: 'Pontianak Kota', lat: -0.0263, lon: 109.3335, medan: 'kota', desa: ['Darat Sekip', 'Mariana', 'Sungai Bangkong', 'Sungai Jawi', 'Tengah'] },
        { id: 'ptk_sel', nama: 'Pontianak Selatan', lat: -0.0448, lon: 109.3324, medan: 'kota', desa: ['Akcaya', 'Benua Melayu Darat', 'Benua Melayu Laut', 'Kota Baru', 'Parit Tokaya'] },
        { id: 'ptk_tgr', nama: 'Pontianak Tenggara', lat: -0.0628, lon: 109.3548, medan: 'kota', desa: ['Bangka Belitung Darat', 'Bangka Belitung Laut', 'Bansir Darat', 'Bansir Laut'] },
        { id: 'ptk_tim', nama: 'Pontianak Timur', lat: -0.0315, lon: 109.3660, medan: 'kota', desa: ['Banjar Serasan', 'Dalam Bugis', 'Parit Mayor', 'Saigon', 'Tambelan Sampit', 'Tanjung Hilir', 'Tanjung Hulu'] },
        { id: 'ptk_bar', nama: 'Pontianak Barat', lat: -0.0155, lon: 109.3075, medan: 'kota', desa: ['Pal Lima', 'Sungai Beliung', 'Sungai Jawi Dalam', 'Sungai Jawi Luar'] },
        { id: 'ptk_utr', nama: 'Pontianak Utara', lat: 0.0085, lon: 109.3380, medan: 'mulus', desa: ['Batu Layang', 'Siantan Hilir', 'Siantan Hulu', 'Siantan Tengah'] }
      ]
    },
    /* 2. KAB. KUBU RAYA — 9 Kecamatan */
    kuburaya: {
      nama: 'Kab. Kubu Raya', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kr_sraya', nama: 'Sungai Raya', lat: -0.1180, lon: 109.4030, medan: 'kota', desa: ['Sungai Raya', 'Sungai Raya Dalam', 'Parit Baru', 'Arang Limbung', 'Kapur', 'Kuala Dua', 'Limbung', 'Mekar Baru', 'Teluk Kapuas', 'Madu Sari', 'Sungai Asam', 'Sungai Bulan'] },
        { id: 'kr_skakap', nama: 'Sungai Kakap', lat: -0.0650, lon: 109.2450, medan: 'mulus', desa: ['Sungai Kakap', 'Pal IX', 'Sungai Rengas', 'Sungai Itik', 'Jeruju Besar', 'Kalimas', 'Punggur Kecil', 'Punggur Besar', 'Tanjung Saleh', 'Sepuk Laut'] },
        { id: 'kr_ambawang', nama: 'Sungai Ambawang', lat: -0.0480, lon: 109.4950, medan: 'mulus', desa: ['Sungai Ambawang Kuala', 'Korek', 'Jawa Tengah', 'Lingga', 'Pancaroba', 'Mega Timur', 'Simpang Kanan', 'Sungai Malaya', 'Pasak Piang'] },
        { id: 'kr_kmandor', nama: 'Kuala Mandor B', lat: 0.0320, lon: 109.5450, medan: 'bergelombang', desa: ['Kuala Mandor A', 'Kuala Mandor B', 'Kubu Padi', 'Retok', 'Sungai Enau'] },
        { id: 'kr_rasau', nama: 'Rasau Jaya', lat: -0.2380, lon: 109.3810, medan: 'mulus', desa: ['Rasau Jaya Umum', 'Rasau Jaya Satu', 'Rasau Jaya Dua', 'Rasau Jaya Tiga', 'Bintang Mas', 'Pematang Tujuh'] },
        { id: 'kr_kubu', nama: 'Kubu', lat: -0.4680, lon: 109.3650, medan: 'rusak', desa: ['Kubu', 'Kampung Baru', 'Olak-Olak Kubu', 'Air Putih', 'Jangkang Satu', 'Teluk Nangka', 'Pinang Luar'] },
        { id: 'kr_pakedai', nama: 'Teluk Pakedai', lat: -0.3150, lon: 109.2350, medan: 'rusak', desa: ['Teluk Pakedai Hulu', 'Teluk Pakedai Satu', 'Teluk Pakedai Dua', 'Selat Remis', 'Pasir Putih', 'Sungai Deras'] },
        { id: 'kr_bampar', nama: 'Batu Ampar', lat: -0.7500, lon: 109.4850, medan: 'pulau', pulau: true, desa: ['Padang Tikar Satu', 'Padang Tikar Dua', 'Batu Ampar', 'Sungai Jawi', 'Tasik Malaya', 'Nipah Panjang', 'Teluk Nibung'] },
        { id: 'kr_terentang', nama: 'Terentang', lat: -0.4120, lon: 109.6150, medan: 'tanah', desa: ['Terentang Hilir', 'Terentang Hulu', 'Permata', 'Radak Baru', 'Sungai Radak Satu', 'Betuah'] }
      ]
    },
    /* 3. KAB. KETAPANG — 20 Kecamatan */
    ketapang: {
      nama: 'Kab. Ketapang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ktp_dpawan', nama: 'Delta Pawan', lat: -1.8350, lon: 109.9740, medan: 'kota', desa: ['Sampit', 'Tengah', 'Kantor', 'Mulia Baru', 'Sukaharja', 'Payak Kumang', 'Kali Nilam', 'Suka Bangun', 'Suka Bangun Dalam'] },
        { id: 'ktp_bkayong', nama: 'Benua Kayong', lat: -1.8620, lon: 109.9850, medan: 'kota', desa: ['Kauman', 'Mulia Kerta', 'Tuan-Tuan', 'Banjar', 'Negeri Baru', 'Padang', 'Kinjil Pesisir', 'Sungai Kinjil', 'Baru', 'Mekar Sari', 'Suka Baru'] },
        { id: 'ktp_mpawan', nama: 'Muara Pawan', lat: -1.7680, lon: 109.9550, medan: 'mulus', desa: ['Sungai Awan Kiri', 'Sungai Awan Kanan', 'Tempurukan', 'Ulak Medang', 'Mayak', 'Tanjung Pura', 'Tanjung Pasar', 'Suka Maju'] },
        { id: 'ktp_mhu', nama: 'Matan Hilir Utara', lat: -1.6080, lon: 110.0350, medan: 'mulus', desa: ['Kuala Tolak', 'Kuala Satong', 'Laman Satong', 'Sungai Putri', 'Tanjung Baik Budi'] },
        { id: 'ktp_mhs', nama: 'Matan Hilir Selatan', lat: -2.0650, lon: 110.1250, medan: 'bergelombang', desa: ['Pesaguan Kanan', 'Pesaguan Kiri', 'Sungai Bakau', 'Sungai Besar', 'Sungai Jawi', 'Sungai Nanjung', 'Sungai Pelang', 'Pematang Gadung', 'Harapan Baru'] },
        { id: 'ktp_kendawangan', nama: 'Kendawangan', lat: -2.5260, lon: 110.2140, medan: 'bergelombang', desa: ['Kendawangan Kiri', 'Kendawangan Kanan', 'Mekar Utama', 'Pangkalan Batu', 'Air Hitam Besar', 'Bangkal Serai', 'Banjar Sari', 'Selimatan Jaya'] },
        { id: 'ktp_sandai', nama: 'Sandai', lat: -1.2250, lon: 110.5250, medan: 'bergelombang', desa: ['Sandai', 'Sandai Kiri', 'Muara Jekak', 'Penjawaan', 'Randau', 'Petai Patah', 'Istana', 'Demit'] },
        { id: 'ktp_ntayap', nama: 'Nanga Tayap', lat: -1.5250, lon: 110.5850, medan: 'bergelombang', desa: ['Nanga Tayap', 'Sungai Kelik', 'Pangkalan Teluk', 'Lembah Hijau Satu', 'Lembah Hijau Dua', 'Simpang Tiga Sembelangaan', 'Kayong Hulu'] },
        { id: 'ktp_ttiti', nama: 'Tumbang Titi', lat: -1.8250, lon: 110.6350, medan: 'bergelombang', desa: ['Tumbang Titi', 'Batu Tajam', 'Beringin Rayo', 'Kalimas Baru', 'Pengatapan Raya', 'Segar Wangi'] },
        { id: 'ktp_marau', nama: 'Marau', lat: -2.1250, lon: 110.7150, medan: 'rusak', desa: ['Suka Karya', 'Bantan Sari', 'Batu Payung Dua', 'Karya Baru', 'Randai', 'Riam Batu Gading'] },
        { id: 'ktp_mmata', nama: 'Manis Mata', lat: -2.4650, lon: 111.0150, medan: 'rusak', desa: ['Manis Mata', 'Air Dekakah', 'Asam Besar', 'Batu Sedau', 'Bukit Gajah', 'Silat'] },
        { id: 'ktp_slaur', nama: 'Sungai Laur', lat: -0.9650, lon: 110.4250, medan: 'bergelombang', desa: ['Riam Bunut', 'Bengaras', 'Harapan Baru', 'Kepari', 'Lanjut Mekar Sari', 'Sempurna'] },
        { id: 'ktp_shulu', nama: 'Simpang Hulu', lat: -0.6150, lon: 110.3350, medan: 'bergelombang', desa: ['Balai Pinang', 'Balai Pinang Hulu', 'Botuh Bosi', 'Kenanga', 'Kualan Hilir', 'Kualan Hulu', 'Kualan Tengah', 'Labai Hilir', 'Semandang Hulu', 'Semandang Kiri'] },
        { id: 'ktp_sdua', nama: 'Simpang Dua', lat: -0.8350, lon: 110.3650, medan: 'rusak', desa: ['Semandang Kanan', 'Batu Daya', 'Gema', 'Kamora', 'Kampar Sebomban', 'Mekar Raya'] },
        { id: 'ktp_hsungai', nama: 'Hulu Sungai', lat: -1.0850, lon: 110.8950, medan: 'tanah', desa: ['Menyumbung', 'Beginci Darat', 'Benua Krio', 'Cinta Manis', 'Krio Hulu', 'Sunge Bengaras'] },
        { id: 'ktp_jelai', nama: 'Jelai Hulu', lat: -2.0150, lon: 110.8950, medan: 'rusak', desa: ['Periangan', 'Air Dua', 'Asam Jelai', 'Biku Sarana', 'Karang Dangin', 'Kusik Batu Lapu'] },
        { id: 'ktp_aupas', nama: 'Air Upas', lat: -2.3150, lon: 110.8450, medan: 'rusak', desa: ['Air Upas', 'Air Durian Jaya', 'Banda Sari', 'Gahang', 'Harapan Baru', 'Mekar Jaya'] },
        { id: 'ktp_singkup', nama: 'Singkup', lat: -2.2950, lon: 110.6350, medan: 'rusak', desa: ['Sukaraja', 'Muntai', 'Pantai Ketikal', 'Suka Mulya', 'Sukasari', 'Tanah Hitam'] },
        { id: 'ktp_pemahan', nama: 'Pemahan', lat: -1.7650, lon: 110.4650, medan: 'bergelombang', desa: ['Pebihingan', 'Lalang Panjang', 'Muara Gerunggang', 'Semayok Baru', 'Usaha Baru'] },
        { id: 'ktp_smrayak', nama: 'Sungai Melayu Rayak', lat: -1.7850, lon: 110.2850, medan: 'bergelombang', desa: ['Sungai Melayu', 'Sungai Melayu Baru', 'Beringin Jaya', 'Jairan Jaya', 'Karya Mukti', 'Kepuluk', 'Piansak'] }
      ]
    },
    /* 4. KAB. KAYONG UTARA — 6 Kecamatan */
    kayongutara: {
      nama: 'Kab. Kayong Utara', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ku_sukadana', nama: 'Sukadana', lat: -1.2420, lon: 109.9510, medan: 'mulus', desa: ['Sutera', 'Pangkalan Buton', 'Pampang Harapan', 'Benawai Agung', 'Harapan Mulia', 'Riam Berasap Jaya', 'Sedahan Jaya', 'Sejahtera'] },
        { id: 'ku_shilir', nama: 'Simpang Hilir', lat: -1.1150, lon: 109.9850, medan: 'bergelombang', desa: ['Teluk Melano', 'Nipah Kuning', 'Pemangkat', 'Padu Banjar', 'Rantau Panjang', 'Batu Barat', 'Batu Mas', 'Pulau Kumbang'] },
        { id: 'ku_tbatang', nama: 'Teluk Batang', lat: -1.0320, lon: 109.8450, medan: 'bergelombang', desa: ['Teluk Batang', 'Teluk Batang Selatan', 'Teluk Batang Utara', 'Alur Bandung', 'Banyu Abang', 'Mas Bangun', 'Sungai Paduan'] },
        { id: 'ku_seponti', nama: 'Seponti', lat: -0.9450, lon: 109.8850, medan: 'bergelombang', desa: ['Seponti Jaya', 'Durian Sebatang', 'Podo Rukun', 'Sungai Sepeti', 'Telaga Arum', 'Wonorejo'] },
        { id: 'ku_pmaya', nama: 'Pulau Maya', lat: -1.1450, lon: 109.5950, medan: 'pulau', pulau: true, desa: ['Tanjung Satai', 'Dusun Besar', 'Dusun Kecil', 'Kemboja', 'Satai Lestari'] },
        { id: 'ku_karimata', nama: 'Kepulauan Karimata', lat: -1.6150, lon: 108.9250, medan: 'pulau', pulau: true, desa: ['Pelapis', 'Betok Jaya', 'Padang'] }
      ]
    },
    /* 5. KAB. MEMPAWAH — 9 Kecamatan */
    mempawah: {
      nama: 'Kab. Mempawah', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mpw_hilir', nama: 'Mempawah Hilir', lat: 0.3620, lon: 108.9580, medan: 'kota', desa: ['Tengah', 'Terusan', 'Tanjung', 'Kuala Secapah', 'Malikian', 'Pasir', 'Penibung', 'Sengkubang'] },
        { id: 'mpw_timur', nama: 'Mempawah Timur', lat: 0.3520, lon: 109.0050, medan: 'mulus', desa: ['Pulau Pedalaman', 'Pasir Palembang', 'Pasir Panjang', 'Antibai', 'Parit Banjar', 'Sejegi', 'Sungai Bakau Kecil'] },
        { id: 'mpw_pinyuh', nama: 'Sungai Pinyuh', lat: 0.2780, lon: 109.0860, medan: 'mulus', desa: ['Sungai Pinyuh', 'Galang', 'Nusapati', 'Peniraman', 'Sungai Bakau Besar Darat', 'Sungai Bakau Besar Laut', 'Sungai Batang', 'Sungai Purun Kecil', 'Sungai Rasau'] },
        { id: 'mpw_jongkat', nama: 'Jongkat', lat: 0.0880, lon: 109.2550, medan: 'mulus', desa: ['Jungkat', 'Peniti Luar', 'Sungai Nipah', 'Wajok Hilir', 'Wajok Hulu'] },
        { id: 'mpw_segedong', nama: 'Segedong', lat: 0.1750, lon: 109.1650, medan: 'mulus', desa: ['Parit Bugis', 'Peniti Besar', 'Peniti Dalam Satu', 'Peniti Dalam Dua', 'Sungai Burung', 'Sungai Purun Besar'] },
        { id: 'mpw_skunyit', nama: 'Sungai Kunyit', lat: 0.4450, lon: 108.9250, medan: 'pesisir', desa: ['Sungai Kunyit Laut', 'Sungai Kunyit Hulu', 'Sungai Kunyit Dalam', 'Bukit Batu', 'Mendalok', 'Semparong Parit Raden', 'Sungai Duri Satu', 'Sungai Limau'] },
        { id: 'mpw_anjongan', nama: 'Anjongan', lat: 0.3550, lon: 109.1450, medan: 'mulus', desa: ['Anjungan Melancar', 'Anjungan Dalam', 'Dema', 'Kepayang', 'Pak Bulu'] },
        { id: 'mpw_toho', nama: 'Toho', lat: 0.4150, lon: 109.2350, medan: 'bergelombang', desa: ['Pak Laheng', 'Pak Utan', 'Benuang', 'Kecurit', 'Sambora', 'Sepang', 'Terap', 'Toho Ilir'] },
        { id: 'mpw_sadaniang', nama: 'Sadaniang', lat: 0.5150, lon: 109.2550, medan: 'perbukitan', desa: ['Amawang', 'Ansiap', 'Bumbun', 'Pentek', 'Sekabuk', 'Suak Barangan'] }
      ]
    },
    /* 6. KOTA SINGKAWANG — 5 Kecamatan */
    singkawang: {
      nama: 'Kota Singkawang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skw_bar', nama: 'Singkawang Barat', lat: 0.9065, lon: 108.9830, medan: 'kota', desa: ['Pasiran', 'Melayu', 'Kuala', 'Tengah'] },
        { id: 'skw_tgh', nama: 'Singkawang Tengah', lat: 0.9010, lon: 109.0050, medan: 'kota', desa: ['Roban', 'Condong', 'Sekip Lama', 'Jawa', 'Bukit Batu', 'Sungai Wie'] },
        { id: 'skw_sel', nama: 'Singkawang Selatan', lat: 0.8420, lon: 108.9650, medan: 'pesisir', desa: ['Sedau', 'Sijangkung', 'Pangmilang', 'Sagatani'] },
        { id: 'skw_tim', nama: 'Singkawang Timur', lat: 0.9040, lon: 109.0680, medan: 'perbukitan', desa: ['Nyarumkop', 'Mayasopa', 'Pajintan', 'Bagak Sahwa', 'Sanggau Kulor'] },
        { id: 'skw_utr', nama: 'Singkawang Utara', lat: 0.9580, lon: 108.9980, medan: 'mulus', desa: ['Sungai Garam Hilir', 'Naram', 'Sungai Bulan', 'Sungai Rasau', 'Setapuk Besar', 'Setapuk Kecil', 'Semelagi Kecil'] }
      ]
    },
    /* 7. KAB. SAMBAS — 19 Kecamatan (Lengkap 100% BPS) */
    sambas: {
      nama: 'Kab. Sambas', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sbs_sambas', nama: 'Sambas', lat: 1.3620, lon: 109.3050, medan: 'kota', desa: ['Dalam Kaum', 'Durian', 'Jagur', 'Lubuk Dagang', 'Lumbang', 'Pasar Melayu', 'Pendawan', 'Saing Rambi', 'Tanjung Bugis', 'Tumuk Manggis'] },
        { id: 'sbs_pemangkat', nama: 'Pemangkat', lat: 1.1760, lon: 108.9750, medan: 'mulus', desa: ['Pemangkat Kota', 'Harapan', 'Gugah Sejahtera', 'Jelutung', 'Lonam', 'Penjajap', 'Perapakan', 'Sebatuan'] },
        { id: 'sbs_tebas', nama: 'Tebas', lat: 1.2420, lon: 109.1620, medan: 'mulus', desa: ['Tebas Sungai', 'Tebas Kuala', 'Batu Makjage', 'Bekut', 'Bukit Segoler', 'Dungun Perapakan', 'Makrampai', 'Mensere', 'Pangkalan Kongsi', 'Sejiram'] },
        { id: 'sbs_tkeramat', nama: 'Teluk Keramat', lat: 1.4650, lon: 109.1950, medan: 'bergelombang', desa: ['Sekura', 'Berlimang', 'Kuala Pangkalan Keramat', 'Lela', 'Mekar Sekuntum', 'Pedada', 'Pipit Teja', 'Sengawang', 'Sungai Baru'] },
        { id: 'sbs_selakau', nama: 'Selakau', lat: 1.0720, lon: 108.9780, medan: 'mulus', desa: ['Sungai Nyirih', 'Sungai Rusa', 'Bentunai', 'Kuala', 'Pangkalan Bemban', 'Parit Baru', 'Parit Kongsi', 'Semelagi Besar', 'Twi Mentibar'] },
        { id: 'sbs_jawai', nama: 'Jawai', lat: 1.3650, lon: 109.0450, medan: 'bergelombang', desa: ['Sentebang', 'Bakau', 'Dungun Laut', 'Lambau', 'Mutus Darussalam', 'Parit Setia', 'Pelimpaan', 'Sarang Burung Danau', 'Sungai Nilam'] },
        { id: 'sbs_paloh', nama: 'Paloh', lat: 1.7250, lon: 109.2850, medan: 'rusak', desa: ['Nibung', 'Kalimantan', 'Malek', 'Matang Danau', 'Mentibar', 'Sebubus', 'Tanah Hitam', 'Temajuk'] },
        { id: 'sbs_sajingan', nama: 'Sajingan Besar', lat: 1.5950, lon: 109.6150, medan: 'perbukitan', desa: ['Sebunga', 'Kaliau', 'Santaban', 'Senatab', 'Sungai Bening'] },
        { id: 'sbs_subah', nama: 'Subah', lat: 1.2750, lon: 109.4350, medan: 'bergelombang', desa: ['Balai Gemuruh', 'Bukit Mulya', 'Madak', 'Mensade', 'Mukti Raharja', 'Sempurna', 'Sungai Deden', 'Sungai Sapak'] },
        { id: 'sbs_galing', nama: 'Galing', lat: 1.5450, lon: 109.3650, medan: 'bergelombang', desa: ['Galing', 'Ratu Sepudak', 'Sagu', 'Sijang', 'Sungai Palah', 'Teluk Pandan', 'Tempapan Hulu', 'Tempapan Kuala'] },
        { id: 'sbs_sajad', nama: 'Sajad', lat: 1.3850, lon: 109.3880, medan: 'mulus', desa: ['Tengguli', 'Beringin', 'Jirak', 'Mekar Jaya'] },
        { id: 'sbs_sejangkung', nama: 'Sejangkung', lat: 1.4480, lon: 109.4350, medan: 'bergelombang', desa: ['Parit Raja', 'Penakalan', 'Perigi Landu', 'Perigi Limus', 'Piantus', 'Sekuduk', 'Semanga', 'Sendoyan', 'Senujuh', 'Sepantai', 'Setalik', 'Sulung'] },
        { id: 'sbs_semparuk', nama: 'Semparuk', lat: 1.2020, lon: 109.0480, medan: 'mulus', desa: ['Semparuk', 'Seburing', 'Sepadu', 'Sepinggan', 'Singaraya'] },
        { id: 'sbs_jawaisel', nama: 'Jawai Selatan', lat: 1.2750, lon: 109.0250, medan: 'pesisir', desa: ['Matang Terap', 'Jawai Laut', 'Jelu Air', 'Sabaran', 'Sarilaba A', 'Sarilaba B', 'Semperiuk A', 'Semperiuk B', 'Suah Api'] },
        { id: 'sbs_tekarang', nama: 'Tekarang', lat: 1.3180, lon: 109.1680, medan: 'mulus', desa: ['Tekarang', 'Cepala', 'Matang Segarau', 'Merubung', 'Rambayan', 'Sari Makmur', 'Sempadian'] },
        { id: 'sbs_tangaran', nama: 'Tangaran', lat: 1.5350, lon: 109.1550, medan: 'bergelombang', desa: ['Simpang Empat', 'Arung Medang', 'Arung Parak', 'Merabuan', 'Merpati', 'Pancur', 'Semata', 'Tangaran'] },
        { id: 'sbs_selakautim', nama: 'Selakau Timur', lat: 1.0780, lon: 109.0550, medan: 'bergelombang', desa: ['Selakau Tua', 'Buduk Sempadang', 'Gelik', 'Seranggam'] },
        { id: 'sbs_salatiga', nama: 'Salatiga', lat: 1.1320, lon: 109.0180, medan: 'mulus', desa: ['Salatiga', 'Parit Baru', 'Serumpun', 'Serunai', 'Sungai Toman'] },
        { id: 'sbs_sebawi', nama: 'Sebawi', lat: 1.3020, lon: 109.2580, medan: 'mulus', desa: ['Sebawi', 'Rantau Panjang', 'Sebangun', 'Sempalai Sebedang', 'Sepuk Tanjung', 'Tebing Batu', 'Tempatan'] }
      ]
    },
    /* 8. KAB. BENGKAYANG — 17 Kecamatan (Lengkap 100% BPS) */
    bengkayang: {
      nama: 'Kab. Bengkayang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'bky_kota', nama: 'Bengkayang', lat: 0.8220, lon: 109.4880, medan: 'kota', desa: ['Bumi Emas', 'Sebalo', 'Bakti Mulya', 'Bani Amas', 'Setia Budi', 'Tirta Kencana'] },
        { id: 'bky_sraya', nama: 'Sungai Raya', lat: 0.7150, lon: 108.9050, medan: 'pesisir', desa: ['Sungai Duri', 'Sungai Jaga A', 'Sungai Jaga B', 'Sungai Pangkalan Satu', 'Sungai Pangkalan Dua'] },
        { id: 'bky_srkep', nama: 'Sungai Raya Kepulauan', lat: 0.7680, lon: 108.8850, medan: 'pesisir', desa: ['Karimunting', 'Sungai Raya', 'Rukma Jaya', 'Sungai Keran'] },
        { id: 'bky_monterado', nama: 'Monterado', lat: 0.7420, lon: 109.1250, medan: 'bergelombang', desa: ['Monterado', 'Beringin Baru', 'Gerantung', 'Goha', 'Jahandung', 'Mekar Baru', 'Nek Ginap', 'Rantau', 'Serindu'] },
        { id: 'bky_samalantan', nama: 'Samalantan', lat: 0.7980, lon: 109.2180, medan: 'bergelombang', desa: ['Samalantan', 'Babane', 'Bukit Serayan', 'Marunsu', 'Pasti Jaya', 'Saba\'u', 'Tumiang'] },
        { id: 'bky_ledo', nama: 'Ledo', lat: 1.0150, lon: 109.6150, medan: 'perbukitan', desa: ['Lesabela', 'Dayung', 'Jesape', 'Lomba Karya', 'Rodaya', 'Seles', 'Semangat', 'Serangkat', 'Suka Damai', 'Tawang'] },
        { id: 'bky_sledo', nama: 'Sanggau Ledo', lat: 1.1550, lon: 109.7150, medan: 'perbukitan', desa: ['Lembang', 'Bange', 'Danti', 'Gua', 'Sango'] },
        { id: 'bky_jbabang', nama: 'Jagoi Babang', lat: 1.3180, lon: 109.9150, medan: 'perbukitan', desa: ['Jagoi', 'Gersik', 'Kumba', 'Sekida', 'Semunying Jaya', 'Sinar Baru'] },
        { id: 'bky_capkala', nama: 'Capkala', lat: 0.6750, lon: 108.9950, medan: 'mulus', desa: ['Capkala', 'Aris', 'Mandor', 'Pawangi', 'Sebandut', 'Setanduk'] },
        { id: 'bky_lbawang', nama: 'Lembah Bawang', lat: 0.9050, lon: 109.2950, medan: 'perbukitan', desa: ['Lembah Bawang', 'Godang Damar', 'Janyat', 'Kinande', 'Papan Tembawang', 'Papan Uduk', 'Saka Taru', 'Tempapan'] },
        { id: 'bky_lumar', nama: 'Lumar', lat: 0.9280, lon: 109.4950, medan: 'perbukitan', desa: ['Tiga Berkat', 'Belimbing', 'Lamolda', 'Magmagan Karya', 'Seren Selimbau'] },
        { id: 'bky_seluas', nama: 'Seluas', lat: 1.2450, lon: 109.8450, medan: 'perbukitan', desa: ['Seluas', 'Bengkawan', 'Kalon', 'Mayak', 'Sahan', 'Sentangau Jaya'] },
        { id: 'bky_siding', nama: 'Siding', lat: 1.2850, lon: 110.0850, medan: 'tanah', desa: ['Siding', 'Hli Buie', 'Sungkung I', 'Sungkung II', 'Sungkung III', 'Tamong', 'Tangguh', 'Tawang'] },
        { id: 'bky_sbetung', nama: 'Sungai Betung', lat: 0.8580, lon: 109.4350, medan: 'mulus', desa: ['Cipta Karya', 'Karya Bhakti', 'Suka Bangun', 'Suka Maju'] },
        { id: 'bky_ssemarang', nama: 'Suti Semarang', lat: 0.9650, lon: 109.8550, medan: 'tanah', desa: ['Suti Semarang', 'Cempaka Putih', 'Kelayu', 'Kiung', 'Muhi Bersatu', 'Nangka', 'Suka Maju', 'Tapen'] },
        { id: 'bky_teriak', nama: 'Teriak', lat: 0.7750, lon: 109.5250, medan: 'bergelombang', desa: ['Teriak', 'Ampar Benteng', 'Bana', 'Bangun Sari', 'Benteng', 'Dharma Bhakti', 'Lulang', 'Malo Jelayan', 'Sebente', 'Sekaruh', 'Setia Jaya', 'Sumber Karya', 'Tanjung'] },
        { id: 'bky_tbelas', nama: 'Tujuh Belas', lat: 1.0780, lon: 109.5150, medan: 'perbukitan', desa: ['Kamuh', 'Bengkilu', 'Pisak', 'Sinar Tebudak'] }
      ]
    },
    /* 9. KAB. LANDAK — 13 Kecamatan (Lengkap 100% BPS) */
    landak: {
      nama: 'Kab. Landak', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ldk_ngabang', nama: 'Ngabang', lat: 0.3780, lon: 109.9520, medan: 'kota', desa: ['Hilir Kantor', 'Hilir Tengah', 'Raja', 'Amboyo Inti', 'Amboyo Selatan', 'Munggu', 'Muun', 'Pak Kasih', 'Tebedak', 'Tubo'] },
        { id: 'ldk_mandor', nama: 'Mandor', lat: 0.3150, lon: 109.3380, medan: 'mulus', desa: ['Mandor', 'Bebatung', 'Kayu Ara', 'Kayu Tanam', 'Keramas', 'Kerohok', 'Manggang', 'Ngarak', 'Pongok', 'Salatiga', 'Sebadu', 'Simpang Kasturi'] },
        { id: 'ldk_stemila', nama: 'Sengah Temila', lat: 0.3350, lon: 109.6450, medan: 'mulus', desa: ['Pahauman', 'Sidas', 'Aur Sampuk', 'Banying', 'Gombang', 'Keranji Mancal', 'Paloan', 'Saham', 'Senakin', 'Sebatih'] },
        { id: 'ldk_menjalin', nama: 'Menjalin', lat: 0.4550, lon: 109.3550, medan: 'bergelombang', desa: ['Menjalin', 'Bengkawe', 'Lamoanak', 'Nangka', 'Raba', 'Re\'es', 'Sepahat', 'Tempoak'] },
        { id: 'ldk_mhulu', nama: 'Mempawah Hulu', lat: 0.5680, lon: 109.4250, medan: 'bergelombang', desa: ['Karangan', 'Babatn', 'Bilayuk', 'Caokng', 'Garuk', 'Mentonyek', 'Pahokng', 'Sala\'as', 'Sampuro', 'Tiang Tanjung'] },
        { id: 'ldk_menyuke', nama: 'Menyuke', lat: 0.5850, lon: 109.7650, medan: 'bergelombang', desa: ['Darit', 'Angkaras', 'Anik Dingir', 'Ansang', 'Bagak', 'Berinang Mayun', 'Lintah Betung', 'Mamek', 'Songga', 'Tolok'] },
        { id: 'ldk_abesar', nama: 'Air Besar', lat: 0.6550, lon: 110.1250, medan: 'rusak', desa: ['Serimbu', 'Bentiang', 'Dange Aji', 'Engkangin', 'Jambu Tembawang', 'Merayuh', 'Nyari', 'Pare', 'Sekendal', 'Sempatung Lawek'] },
        { id: 'ldk_bhulu', nama: 'Banyuke Hulu', lat: 0.6350, lon: 109.6550, medan: 'bergelombang', desa: ['Untang', 'Gamang', 'Kampet', 'Padang Pio', 'Ringo Lojok', 'Semade', 'Tembawang Bale'] },
        { id: 'ldk_jelimpo', nama: 'Jelimpo', lat: 0.3650, lon: 110.0850, medan: 'bergelombang', desa: ['Jelimpo', 'Angan Tembawang', 'Balai Peluntan', 'Dara Itam I', 'Kayu Ara', 'Kersik Belantian', 'Mandor Kiru', 'Nyiin', 'Papung', 'Pawis Hilir', 'Sekais', 'Temahar', 'Tubang Raeng'] },
        { id: 'ldk_kbehe', nama: 'Kuala Behe', lat: 0.4950, lon: 109.8950, medan: 'rusak', desa: ['Kuala Behe', 'Angkanyar', 'Bengawan Ampar', 'Kedama', 'Nyayum', 'Paku Raya', 'Permiit', 'Sehe Lusur', 'Sejowet', 'Semedang', 'Tanjung Balai'] },
        { id: 'ldk_meranti', nama: 'Meranti', lat: 0.6950, lon: 109.8650, medan: 'rusak', desa: ['Meranti', 'Ampadi', 'Kelampai Setolo', 'Moro Betung', 'Selange', 'Tahu'] },
        { id: 'ldk_sebangki', nama: 'Sebangki', lat: 0.1450, lon: 109.7650, medan: 'rusak', desa: ['Agak', 'Kumpang Tengah', 'Rantau Panjang', 'Sebangki', 'Sungai Segak'] },
        { id: 'ldk_sompak', nama: 'Sompak', lat: 0.4950, lon: 109.5150, medan: 'bergelombang', desa: ['Sompak', 'Amawakng', 'Galar', 'Lingkonong', 'Pakumbang', 'Pauh', 'Tapakng'] }
      ]
    },
    /* 10. KAB. SANGGAU — 15 Kecamatan (Lengkap 100% BPS) */
    sanggau: {
      nama: 'Kab. Sanggau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sgu_kapuas', nama: 'Kapuas', lat: 0.1280, lon: 110.5880, medan: 'kota', desa: ['Beringin', 'Bunut', 'Ilir Kota', 'Tanjung Kapuas', 'Tanjung Sekayam', 'Sungai Sengkuang', 'Kambong', 'Lape', 'Mengkiang', 'Penyeladi'] },
        { id: 'sgu_thilir', nama: 'Tayan Hilir', lat: -0.0280, lon: 110.1120, medan: 'mulus', desa: ['Pedalaman', 'Kawat', 'Pulau Tayan Utara', 'Balai Ingin', 'Beginjan', 'Cempedak', 'Emberas', 'Lalang', 'Melugai', 'Sebemban', 'Subah', 'Tanjung Bunut'] },
        { id: 'sgu_thulu', nama: 'Tayan Hulu', lat: 0.3050, lon: 110.2280, medan: 'mulus', desa: ['Sosok', 'Berakak', 'Binjai', 'Engkasan', 'Janang Ran', 'Mandong', 'Menyabo', 'Pandan Sembuat', 'Peruan Dalam', 'Riyai'] },
        { id: 'sgu_balai', nama: 'Balai', lat: 0.1350, lon: 110.1050, medan: 'mulus', desa: ['Hilir', 'Batang Tarang', 'Bulu Bala', 'Cempedak', 'Empirang Ujung', 'Kebadu', 'Mak Kawing', 'Padu', 'Senyabang', 'Temiang Mali'] },
        { id: 'sgu_parindu', nama: 'Parindu', lat: 0.2580, lon: 110.4250, medan: 'mulus', desa: ['Pusat Damai', 'Dosan', 'Embala', 'Gunam', 'Hibun', 'Maju Karya', 'Maringin Jaya', 'Palem Jaya', 'Rahayu', 'Sebara', 'Suka Gerundi'] },
        { id: 'sgu_kembayan', nama: 'Kembayan', lat: 0.5620, lon: 110.4050, medan: 'mulus', desa: ['Tanjung Merpati', 'Kelompu', 'Kuala Dua', 'Mobui', 'Sebongkuh', 'Sebuduh', 'Sejuah', 'Semayang', 'Tanjung Bunga', 'Tanap'] },
        { id: 'sgu_sekayam', nama: 'Sekayam', lat: 0.8050, lon: 110.4550, medan: 'bergelombang', desa: ['Balai Karangan', 'Bungkang', 'Engkahan', 'Kenaman', 'Lubuk Sabuk', 'Malenggang', 'Pengadang', 'Raut Muara', 'Sangai', 'Sotok'] },
        { id: 'sgu_entikong', nama: 'Entikong', lat: 0.9620, lon: 110.3520, medan: 'mulus', desa: ['Entikong', 'Nekan', 'Pala Pasang', 'Semanget', 'Suruh Tembawang'] },
        { id: 'sgu_meliau', nama: 'Meliau', lat: -0.1250, lon: 110.2950, medan: 'rusak', desa: ['Meliau Hilir', 'Meliau Hulu', 'Balai Tinggi', 'Baru Lombak', 'Cupang', 'Enggadai', 'Harapan Makmur', 'Kuala Buayan', 'Sungai Kembayau'] },
        { id: 'sgu_toba', nama: 'Toba', lat: -0.2680, lon: 110.1150, medan: 'bergelombang', desa: ['Teraju', 'Bagai', 'Balai Belungai', 'Belungai Dalam', 'Kampung Baru', 'Lumut', 'Sansat'] },
        { id: 'sgu_beduai', nama: 'Beduai', lat: 0.6750, lon: 110.3750, medan: 'mulus', desa: ['Kasro Mego', 'Bereng Berkawat', 'Mawang Muda', 'Sungai Ilai', 'Thang Raya'] },
        { id: 'sgu_bonti', nama: 'Bonti', lat: 0.3780, lon: 110.5050, medan: 'bergelombang', desa: ['Bonti', 'Bahta', 'Bantai', 'Empodis', 'Kampuh', 'Majel', 'Sami', 'Tunggul Boyok', 'Upe'] },
        { id: 'sgu_jangkang', nama: 'Jangkang', lat: 0.3450, lon: 110.7150, medan: 'rusak', desa: ['Balai Sebut', 'Empiyang', 'Jangkang Benua', 'Ketori', 'Pisang', 'Sape', 'Selampung', 'Semirau', 'Semombat', 'Tanggung', 'Terati'] },
        { id: 'sgu_mukok', nama: 'Mukok', lat: 0.0850, lon: 110.7650, medan: 'bergelombang', desa: ['Kedukul', 'Engkode', 'Inggis', 'Layak Omang', 'Semanggis Raya', 'Semuntai', 'Serambai Jaya', 'Sungai Mawang', 'Tri Mulya'] },
        { id: 'sgu_noyan', nama: 'Noyan', lat: 0.6950, lon: 110.6650, medan: 'tanah', desa: ['Noyan', 'Empoto', 'Idas', 'Semongan', 'Sungai Dangin'] }
      ]
    },
    /* 11. KAB. SEKADAU — 7 Kecamatan */
    sekadau: {
      nama: 'Kab. Sekadau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skd_hilir', nama: 'Sekadau Hilir', lat: 0.0120, lon: 110.9050, medan: 'kota', desa: ['Sungai Ringin', 'Mungguk', 'Bokak Sebumbun', 'Engkersik', 'Ensalang', 'Gonis Tekam', 'Landau Kodah', 'Merapi', 'Peniti', 'Seberang Kapuas', 'Semabi', 'Seraras', 'Tanjung'] },
        { id: 'skd_hulu', nama: 'Sekadau Hulu', lat: -0.1450, lon: 110.9350, medan: 'bergelombang', desa: ['Rawak Hilir', 'Rawak Hulu', 'Boti', 'Cupang Gading', 'Mondi', 'Nanga Menterap', 'Perongkan', 'Sekonau', 'Setawar', 'Sungai Sambang', 'Tapang Perodah', 'Tinting Boyok'] },
        { id: 'skd_ntaman', nama: 'Nanga Taman', lat: -0.3450, lon: 110.9550, medan: 'bergelombang', desa: ['Nanga Taman', 'Nanga Engkulun', 'Nanga Kiungkang', 'Nanga Koman', 'Nanga Mongko', 'Pantok', 'Rirang Jati', 'Senangak', 'Sungai Lawak', 'Tapang Tingang'] },
        { id: 'skd_nmahap', nama: 'Nanga Mahap', lat: -0.5250, lon: 110.9250, medan: 'rusak', desa: ['Nanga Mahap', 'Batu Pahat', 'Cenayan', 'Karang Betung', 'Landau Apin', 'Lembah Beringin', 'Nanga Suri', 'Sebabas', 'Tembaga', 'Tembesuk'] },
        { id: 'skd_bhilir', nama: 'Belitang Hilir', lat: 0.1450, lon: 111.0850, medan: 'bergelombang', desa: ['Sungai Ayak Dua', 'Sungai Ayak Satu', 'Empajak', 'Entabuk', 'Kumpang Bis', 'Menawai Tekam', 'Merbang', 'Semadu', 'Tapang Pulau'] },
        { id: 'skd_belitang', nama: 'Belitang', lat: 0.3050, lon: 111.1250, medan: 'rusak', desa: ['Belitang Dua', 'Belitang Satu', 'Maboh Permai', 'Menua Prama', 'Nanga Ansar', 'Padak', 'Setuntung'] },
        { id: 'skd_bhulu', nama: 'Belitang Hulu', lat: 0.4550, lon: 111.1450, medan: 'tanah', desa: ['Balai Sepuak', 'Batuk Mulau', 'Bukit Rambat', 'Ijuk', 'Kumpang Ilong', 'Mengaret', 'Pakit Mulau', 'Sebetung', 'Seburuk Satu', 'Tabuk Hulu'] }
      ]
    },
    /* 12. KAB. SINTANG — 14 Kecamatan (Lengkap 100% BPS) */
    sintang: {
      nama: 'Kab. Sintang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'stg_kota', nama: 'Sintang', lat: 0.0680, lon: 111.4980, medan: 'kota', desa: ['Tanjung Puri', 'Kapuas Kanan Hulu', 'Kapuas Kanan Hilir', 'Kapuas Kiri Hulu', 'Kapuas Kiri Hilir', 'Alai', 'Baning Kota', 'Ladang', 'Mekar Jaya', 'Mengkurai', 'Sengkuang', 'Ulak Jaya'] },
        { id: 'stg_stebelian', nama: 'Sungai Tebelian', lat: 0.0150, lon: 111.4250, medan: 'mulus', desa: ['Sungai Ukoi', 'Balai Agung', 'Baya Betung', 'Bonet Engkabang', 'Gurung Kempadik', 'Kajang Baru', 'Lebak Ubah', 'Manter', 'Merarai Satu', 'Merarai Dua', 'Nobal', 'Rarai'] },
        { id: 'stg_kelam', nama: 'Kelam Permai', lat: 0.0780, lon: 111.6550, medan: 'mulus', desa: ['Kebong', 'Baning Panjang', 'Bengkuang', 'Ensaid Panjang', 'Gemba Raya', 'Karya Jaya Bhakti', 'Kelam Sejahtera', 'Landau Kodam', 'Merpak', 'Nanga Lebang', 'Pelimping', 'Sepan Lebang'] },
        { id: 'stg_dedai', nama: 'Dedai', lat: -0.0680, lon: 111.6950, medan: 'bergelombang', desa: ['Nanga Dedai', 'Apin Baru', 'Baras', 'Batu Landung', 'Empaci', 'Gandis', 'Jangkang', 'Kumpang', 'Lundung', 'Menaong Baru', 'Pengkadan Baru', 'Tanjung'] },
        { id: 'stg_sepauk', nama: 'Sepauk', lat: 0.0320, lon: 111.1850, medan: 'bergelombang', desa: ['Tanjung Ria', 'Bangun', 'Bedayan', 'Bernayau', 'Buluh Kuning', 'Ensabang', 'Gernis Jaya', 'Kenyauk', 'Lengkenat', 'Manis Raya', 'Nanga Pari', 'Nanga Sepauk', 'Sekubang', 'Sirang Setambang'] },
        { id: 'stg_tempunak', nama: 'Tempunak', lat: -0.0180, lon: 111.3150, medan: 'bergelombang', desa: ['Nanga Tempunak', 'Balai Harapan', 'Benua Baru', 'Benua Kencana', 'Gurung Mali', 'Jaya Mentari', 'Kenyabur Baru', 'Kuala Tiga', 'Mensiap Baru', 'Pagal Baru', 'Paribang Baru', 'Repak Sari'] },
        { id: 'stg_binjai', nama: 'Binjai Hulu', lat: 0.1650, lon: 111.4650, medan: 'bergelombang', desa: ['Binjai Hulu', 'Binjai Hilir', 'Ampar Bedang', 'Dak Jaya', 'Empaka Kabiau Raya', 'Mensiku', 'Simba Raya', 'Sungai Risap', 'Telaga Satu', 'Telaga Dua'] },
        { id: 'stg_ambalau', nama: 'Ambalau', lat: -0.5850, lon: 112.9150, medan: 'tanah', desa: ['Nanga Kemangai', 'Nanga Ambalau', 'Bukai Tukun', 'Bukit Tinggi', 'Buntut Pimpin', 'Buntut Purun', 'Deme', 'Jengkarang', 'Mensuang', 'Nanga Sakai', 'Patih Jepara', 'Riam Sabon', 'Sungai Tambun'] },
        { id: 'stg_kayanhilir', nama: 'Kayan Hilir', lat: -0.1550, lon: 111.8450, medan: 'rusak', desa: ['Nanga Mau', 'Batu Netak', 'Bukit Segaloh', 'Jambu', 'Jaya Sakti', 'Karya Baru', 'Kempas Raya', 'Landau Beringin', 'Linggam Permai', 'Mekar Mandiri', 'Mengkirai', 'Nanga Lidau', 'Pelaik', 'Sungai Buaya', 'Tanjung Keliling'] },
        { id: 'stg_kayanhulu', nama: 'Kayan Hulu', lat: -0.2850, lon: 112.1650, medan: 'tanah', desa: ['Nanga Tebidah', 'Buluh Merindu', 'Empakan', 'Entogong', 'Kerapuk Jaya', 'Landau Bara', 'Mapan Jaya', 'Merah Arai', 'Nanga Abai', 'Nanga Masau', 'Nanga Oran', 'Nanga Payak', 'Riam Panjang', 'Tanah Merah', 'Tanjung Bunga'] },
        { id: 'stg_kethilir', nama: 'Ketungau Hilir', lat: 0.2550, lon: 111.5550, medan: 'rusak', desa: ['Nanga Ketungau', 'Setungkup', 'Air Nyuruk', 'Batu Ampar', 'Batu Nyadi', 'Betung Permai', 'Bukit Sidin Permai', 'Jentawang Hilir', 'Lepung Pantak', 'Maung', 'Nanga Sejirak', 'Ratu Damai', 'Semuntai', 'Senibung', 'Sungai Deras'] },
        { id: 'stg_kettengah', nama: 'Ketungau Tengah', lat: 0.4950, lon: 111.4650, medan: 'rusak', desa: ['Nanga Kelapan', 'Argo Mulyo', 'Bagelang Jaya', 'Bakti Senabung', 'Kerta Sari', 'Landau Buaya', 'Margahayu', 'Mungguk Lawang', 'Padung Kumang', 'Panding Jaya', 'Panggi Agung', 'Senangan Jaya', 'Sumber Sari', 'Sungai Areh', 'Swadaya', 'Tanjung Sari', 'Wana Bhakti', 'Wirayuda'] },
        { id: 'stg_kethulu', nama: 'Ketungau Hulu', lat: 0.8150, lon: 111.4250, medan: 'tanah', desa: ['Senaning', 'Jasa', 'Bekuan Luyang', 'Embaleh', 'Empura', 'Engkeruh', 'Idai', 'Nanga Bayan', 'Nanga Bugau', 'Nanga Sebawang', 'Neraci Jaya', 'Rasau', 'Riam Sejawak', 'Sebadak', 'Sebuluh', 'Sejawak', 'Sepiluk', 'Sungai Kelik', 'Sungai Mawang'] },
        { id: 'stg_serawai', nama: 'Serawai', lat: -0.4650, lon: 112.4850, medan: 'tanah', desa: ['Nanga Serawai', 'Baras Nabun', 'Batu Ketebung', 'Bedaha', 'Begori', 'Buntut Ponte', 'Karya Jaya', 'Mekar Sari', 'Mentajoi', 'Merako Jaya', 'Muara Kota', 'Nanga Bihe', 'Nanga Jelundung', 'Nanga Mentatai', 'Nanga Riyoi', 'Nanga Segulang', 'Rantau Malam', 'Tanjung Baru', 'Tunas Harapan'] }
      ]
    },
    /* 13. KAB. MELAWI — 11 Kecamatan (Lengkap 100% BPS) */
    melawi: {
      nama: 'Kab. Melawi', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mlw_npinoh', nama: 'Nanga Pinoh', lat: -0.3350, lon: 111.7450, medan: 'kota', desa: ['Paal', 'Sidomulyo', 'Tanjung Niaga', 'Tanjung Tengang', 'Baru', 'Kelakik', 'Kenual', 'Labai Mandiri', 'Nanga Kayan', 'Nanga Kebebu', 'Nusa Pandau', 'Poring', 'Semadin Lengkong', 'Tembawang Panjang'] },
        { id: 'mlw_belimbing', nama: 'Belimbing', lat: -0.3550, lon: 111.5850, medan: 'mulus', desa: ['Pemuar', 'Batu Ampar', 'Batu Buil', 'Batu Nanta', 'Balai Lagas', 'Guhung', 'Labang', 'Laman Bukit', 'Langan', 'Nanga Entebah', 'Nanga Menunuk', 'Nanga Pau', 'Upit'] },
        { id: 'mlw_ehilir', nama: 'Ella Hilir', lat: -0.4050, lon: 112.0150, medan: 'bergelombang', desa: ['Nanga Ella Hilir', 'Bemban Permai', 'Domet Permai', 'Jabai', 'Kahiya', 'Kerangan Kora', 'Lengkong Nyadom', 'Nanga Kalan', 'Nanga Kempangai', 'Nanga Nyuruh', 'Nusa Kenyikap', 'Pelempai Jaya', 'Perembang Nyuruh'] },
        { id: 'mlw_sayan', nama: 'Sayan', lat: -0.6250, lon: 111.8250, medan: 'bergelombang', desa: ['Nanga Sayan', 'Berobai Permai', 'Bora', 'Karangan Purun', 'Landau Sandak', 'Lingkar Indah', 'Madya Raya', 'Mekar Pelita', 'Meta Bersatu', 'Nanga Kasai', 'Nanga Kompi', 'Nanga Mancur', 'Nanga Raku', 'Sayan Jaya'] },
        { id: 'mlw_tpinoh', nama: 'Tanah Pinoh', lat: -0.6850, lon: 111.4650, medan: 'rusak', desa: ['Suka Maju', 'Bata Luar', 'Batu Begigi', 'Bina Jaya', 'Bina Karya', 'Harapan Jaya', 'Keranjik', 'Loka Jaya', 'Madong Jaya', 'Maris Permai', 'Pelita Kenaya', 'Tanjung Gunung'] },
        { id: 'mlw_bhulu', nama: 'Belimbing Hulu', lat: -0.5150, lon: 111.4950, medan: 'rusak', desa: ['Tiong Keranji', 'Beloyang', 'Junjung Permai', 'Kayu Bunga', 'Nanga Keberak', 'Nanga Raya', 'Nanga Tikan', 'Piawas'] },
        { id: 'mlw_menukung', nama: 'Menukung', lat: -0.5750, lon: 112.1850, medan: 'rusak', desa: ['Menukung Kota', 'Batas Nangka', 'Batu Badak', 'Batu Onap', 'Belaban Ella', 'Laman Mumbung', 'Landau Leban', 'Nanga Ella Hulu', 'Nanga Keruap', 'Nanga Siyai', 'Nusa Poring', 'Oyah', 'Pelaik Keruap', 'Sungai Sampuk', 'Tanjung Beringin'] },
        { id: 'mlw_psel', nama: 'Pinoh Selatan', lat: -0.4850, lon: 111.7550, medan: 'bergelombang', desa: ['Manggala', 'Bayur Raya', 'Bina Jaya', 'Landau Garong', 'Landau Tabun', 'Mandau Baru', 'Nanga Kelawai', 'Nanga Pintas', 'Nyanggai', 'Pelinggang', 'Sungai Bakah', 'Senempak'] },
        { id: 'mlw_putr', nama: 'Pinoh Utara', lat: -0.2350, lon: 111.6850, medan: 'bergelombang', desa: ['Tekelak', 'Engkurai', 'Kayan Semapau', 'Kompas Raya', 'Manding', 'Melamut Bersatu', 'Melawi Kiri Hilir', 'Merah Arai', 'Merpak', 'Nanga Belimbing', 'Nanga Man', 'Natai Panjang', 'Sungai Pinang', 'Sungai Raya', 'Senibung', 'Suka Damai', 'Tanjung Arak', 'Tanjung Paoh', 'Tengkajau'] },
        { id: 'mlw_sokan', nama: 'Sokan', lat: -0.8250, lon: 111.6250, medan: 'tanah', desa: ['Nanga Sokan', 'Gelata', 'Keluing Taja', 'Landau Kabu', 'Melana', 'Muara Tanjung', 'Nanga Betangai', 'Nanga Libas', 'Nanga Ora', 'Nanga Potai', 'Nanga Tangkit', 'Penyengkuang', 'Sepakat', 'Sijau', 'Tanjung Mahung', 'Tanjung Sokan', 'Telaga Raya', 'Teluk Pongkal'] },
        { id: 'mlw_tpbarat', nama: 'Tanah Pinoh Barat', lat: -0.7150, lon: 111.2850, medan: 'rusak', desa: ['Ulak Muid', 'Bukit Raya', 'Durian Jaya', 'Ganjang', 'Harapan Jaya', 'Keluas Hulu', 'Laja', 'Lintah Taum', 'Pelita Jaya', 'Togan Baru'] }
      ]
    },
    /* 14. KAB. KAPUAS HULU — 23 Kecamatan (Lengkap 100% BPS) */
    kapuashulu: {
      nama: 'Kab. Kapuas Hulu', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kh_pututr', nama: 'Putussibau Utara', lat: 0.8720, lon: 112.9280, medan: 'kota', desa: ['Putussibau Kota', 'Hilir Kantor', 'Ariung Mendalam', 'Datah Diaan', 'Jangkang', 'Lauk', 'Nanga Awin', 'Nanga Nyabau', 'Nanga Sambus', 'Padua Mendalam', 'Pala Pulau', 'Seluan', 'Sibau Hilir', 'Sibau Hulu', 'Tanjung Karang'] },
        { id: 'kh_putsel', nama: 'Putussibau Selatan', lat: 0.8480, lon: 112.9350, medan: 'mulus', desa: ['Kedamin Hilir', 'Kedamin Hulu', 'Beringin Jaya', 'Bungan Jaya', 'Cempaka Baru', 'Ingko\' Tambe', 'Jaras', 'Kereho', 'Melapi', 'Sayut', 'Suka Maju', 'Sungai Uluk', 'Tanjung Jati', 'Tanjung Lokang', 'Urang Unsa'] },
        { id: 'kh_kalis', nama: 'Kalis', lat: 0.7250, lon: 112.7950, medan: 'bergelombang', desa: ['Nanga Kalis', 'Bahenap', 'Kalis Raya', 'Kensuray', 'Nanga Danau', 'Nanga Lebangan', 'Nanga Raun', 'Nanga Sebintang', 'Nanga Tubuk', 'Peniaman', 'Rantau Bumbun', 'Rantau Kalis', 'Ribang Kadeng', 'Segiam', 'Sempang', 'Tapang Da\'an'] },
        { id: 'kh_silhilir', nama: 'Silat Hilir', lat: 0.3050, lon: 111.8650, medan: 'bergelombang', desa: ['Perigi', 'Baru', 'Bongkong', 'Bukit Penai', 'Miau Merah', 'Nanga Nuar', 'Pangeran', 'Penai', 'Rumbih', 'Seberu', 'Sena', 'Sentabai', 'Setunggul'] },
        { id: 'kh_semitau', nama: 'Semitau', lat: 0.5450, lon: 111.9750, medan: 'bergelombang', desa: ['Semitau Hulu', 'Semitau Hilir', 'Entipan', 'Kenepai Komplek', 'Kenerak', 'Marsedan Raya', 'Nanga Kenepai', 'Nanga Lemedak', 'Nanga Seberuang', 'Padung Kumang', 'Sekedau', 'Tua\' Abang'] },
        { id: 'kh_badau', nama: 'Badau', lat: 1.0320, lon: 111.8780, medan: 'mulus', desa: ['Badau', 'Janting', 'Kekurak', 'Pulau Majang', 'Sebindang', 'Semuntik', 'Seriang', 'Tajum', 'Tinting Seligi'] },
        { id: 'kh_bunhulu', nama: 'Bunut Hulu', lat: 0.5050, lon: 112.5650, medan: 'bergelombang', desa: ['Nanga Suruk', 'Bakong Permai', 'Batu Tiga', 'Beringin', 'Nanga Dua', 'Nanga Kelibang', 'Nanga Payang', 'Nanga Semangut', 'Pantas Bersatu', 'Riam Piyang', 'Segitak', 'Selaup', 'Semangut Utara', 'Temuyuk'] },
        { id: 'kh_blupar', nama: 'Batang Lupar', lat: 0.9950, lon: 112.1550, medan: 'bergelombang', desa: ['Lanjak Deras', 'Labian', 'Labian Ira\'ang', 'Melemba', 'Mensiau', 'Sepandan', 'Setulang', 'Sungai Abau', 'Sungai Ajung', 'Sungai Senunuk'] },
        { id: 'kh_bika', nama: 'Bika', lat: 0.7850, lon: 112.7950, medan: 'bergelombang', desa: ['Bika', 'Bika Hulu', 'Jelemuk', 'Jongkong Manday', 'Melapi Manday', 'Nanga Manday', 'Penyeluang', 'Teluk Sindur'] },
        { id: 'kh_btanjung', nama: 'Boyan Tanjung', lat: 0.5250, lon: 112.4350, medan: 'bergelombang', desa: ['Boyan Tanjung', 'Delintas Karya', 'Karya Maju', 'Landau Mentail', 'Mujan', 'Nanga Betung', 'Nanga Boyan', 'Nanga Danau', 'Nanga Jemah', 'Nanga Ret', 'Nanga Sangan', 'Pemawan', 'Riam Mengelai', 'Sri Wangi', 'Teluk Geruguk', 'Tubang Jaya'] },
        { id: 'kh_bunhilir', nama: 'Bunut Hilir', lat: 0.7050, lon: 112.4850, medan: 'rusak', desa: ['Bunut Hilir', 'Bunut Hulu', 'Bunut Tengah', 'Empangau', 'Empangau Hilir', 'Entibab', 'Kapuas Raya', 'Nanga Tuan', 'Teluk Aur', 'Tembang', 'Ujung Pandang'] },
        { id: 'kh_ehilir', nama: 'Embaloh Hilir', lat: 0.7950, lon: 112.5850, medan: 'rusak', desa: ['Nanga Embaloh', 'Belatung', 'Keliling Semulung', 'Kirin Nangka', 'Lawik', 'Nanga Lauk', 'Nanga Palin', 'Pala Pintas', 'Ujung Bayur'] },
        { id: 'kh_ehulu', nama: 'Embaloh Hulu', lat: 1.0750, lon: 112.4650, medan: 'perbukitan', desa: ['Banua Martinus', 'Banua Ujung', 'Batu Lintang', 'Langan Baru', 'Menua Sadap', 'Pulau Manak', 'Rantau Prapat', 'Saujung Giling Manik', 'Tamao', 'Ulak Pauk'] },
        { id: 'kh_empanang', nama: 'Empanang', lat: 0.9650, lon: 111.7350, medan: 'bergelombang', desa: ['Nanga Kantuk', 'Bajau Andai', 'Keling Panggau', 'Kumang Jaya', 'Laja Sandang', 'Tintin Peninjau'] },
        { id: 'kh_hgurung', nama: 'Hulu Gurung', lat: 0.3950, lon: 112.1650, medan: 'bergelombang', desa: ['Nanga Tepuai', 'Beringin', 'Bugang', 'Karya Mandiri', 'Kelakar', 'Landau Kumpang', 'Lubuk Antuk', 'Mentawit', 'Mubung', 'Nanga Yen', 'Parang', 'Sejahtera Mandiri', 'Simpang Senara', 'Tani Makmur', 'Tunas Muda'] },
        { id: 'kh_jongkong', nama: 'Jongkong', lat: 0.6550, lon: 112.3150, medan: 'rusak', desa: ['Jongkong Pasar', 'Bontai', 'Jongkong Kanan', 'Jongkong Kiri Hilir', 'Jongkong Kiri Hulu', 'Jongkong Kiri Tengah', 'Jongkong Tanjung', 'Kandung Suli', 'Karya Baru', 'Nanga Serian'] },
        { id: 'kh_mentebah', nama: 'Mentebah', lat: 0.6150, lon: 112.6950, medan: 'bergelombang', desa: ['Nanga Mentebah', 'Kepala Gurung', 'Menaren', 'Suka Maju', 'Tangai Jaya', 'Tanjung', 'Tanjung Intan', 'Tekalong'] },
        { id: 'kh_pengkadan', nama: 'Pengkadan', lat: 0.4450, lon: 112.3150, medan: 'bergelombang', desa: ['Pengkadan Hilir', 'Buak Limbang', 'Hulu Pengkadan', 'Kerangan Panjang', 'Marta Dana', 'Mawan', 'Permata', 'Pinang Laka', 'Riam Panjang', 'Sasan', 'Sira Jaya'] },
        { id: 'kh_pkencana', nama: 'Puring Kencana', lat: 1.0650, lon: 111.6150, medan: 'tanah', desa: ['Sungai Antu', 'Kantuk Asam', 'Kantuk Bunut', 'Langau', 'Merakai Panjang', 'Sungai Mawang'] },
        { id: 'kh_seberuang', nama: 'Seberuang', lat: 0.4150, lon: 111.9850, medan: 'bergelombang', desa: ['Sejiram', 'Bati', 'Bekuan', 'Belikai', 'Beluis Harum', 'Emperiang', 'Gurung', 'Jerenjang', 'Nanga Lot', 'Nanga Pala', 'Pala Kota', 'Ranyai', 'Seneban', 'Tajau Mada', 'Tanjung Keliling'] },
        { id: 'kh_selimbau', nama: 'Selimbau', lat: 0.6050, lon: 112.1450, medan: 'rusak', desa: ['Dalam', 'Benuis', 'Engkerengas', 'Gerayau', 'Gudang Hilir', 'Gudang Hulu', 'Mawan', 'Nanga Leboyan', 'Nibung', 'Piasak Hilir', 'Piasak Hulu', 'Pega', 'Sekubah', 'Sekulat', 'Semalah', 'Tempurau', 'Titian Kuala'] },
        { id: 'kh_silhulu', nama: 'Silat Hulu', lat: 0.1650, lon: 112.0650, medan: 'tanah', desa: ['Nanga Dangkan', 'Belimbing', 'Dangkan Kota', 'Entebi', 'Landau Badai', 'Landau Rantau', 'Lebak Najah', 'Nanga Luan', 'Nanga Lungu', 'Nanga Ngeri', 'Perjuk', 'Riam Tapang', 'Selangkai', 'Selimu'] },
        { id: 'kh_suhaid', nama: 'Suhaid', lat: 0.5650, lon: 112.0650, medan: 'rusak', desa: ['Nanga Suhaid', 'Jongkong Hulu', 'Kerengas', 'Laut Tawang', 'Lubuk Pengail', 'Madang Permai', 'Mantan', 'Menapar', 'Mensusai', 'Tanjung', 'Tanjung Harapan'] }
      ]
    }
  };

  /* Fallback nama kecamatan asli untuk ibu kota provinsi lain di luar Kalbar (sampai detail per provinsi ditambahkan) */
  var KEC_UMUM = {
    jakarta: ['Menteng', 'Tanah Abang', 'Kebayoran Baru', 'Tebet', 'Kelapa Gading', 'Grogol Petamburan'],
    bandung: ['Coblong', 'Sumur Bandung', 'Cicendo', 'Buahbatu', 'Antapani', 'Sukajadi'],
    semarang: ['Semarang Tengah', 'Tembalang', 'Banyumanik', 'Pedurungan', 'Gajahmungkur'],
    yogyakarta: ['Gondokusuman', 'Umbulharjo', 'Jetis', 'Danurejan', 'Kotagede'],
    surabaya: ['Genteng', 'Gubeng', 'Wonokromo', 'Rungkut', 'Tegalsari', 'Sukolilo'],
    medan: ['Medan Baru', 'Medan Petisah', 'Medan Kota', 'Medan Johor', 'Medan Helvetia'],
    palembang: ['Ilir Timur I', 'Ilir Barat I', 'Seberang Ulu I', 'Sukarami', 'Jakabaring'],
    makassar: ['Ujung Pandang', 'Panakkukang', 'Rappocini', 'Tamalanrea', 'Mariso'],
    denpasar: ['Denpasar Selatan', 'Denpasar Barat', 'Denpasar Timur', 'Denpasar Utara'],
    banjarbaru: ['Banjarbaru Utara', 'Banjarbaru Selatan', 'Landasan Ulin', 'Cempaka'],
    samarinda: ['Samarinda Kota', 'Samarinda Ulu', 'Sungai Kunjang', 'Samarinda Ilir'],
    palangkaraya: ['Jekan Raya', 'Pahandut', 'Sabangau', 'Bukit Batu'],
    tanjungselor: ['Tanjung Selor', 'Tanjung Palas', 'Tanjung Palas Tengah'],
    pekanbaru: ['Sukajadi', 'Tampan', 'Marpoyan Damai', 'Sail', 'Bukit Raya'],
    padang: ['Padang Barat', 'Padang Utara', 'Padang Timur', 'Koto Tangah'],
    bandaaceh: ['Baiturrahman', 'Kuta Alam', 'Syiah Kuala', 'Ulee Kareng'],
    bandarlampung: ['Tanjung Karang Pusat', 'Kedaton', 'Sukarame', 'Teluk Betung Selatan'],
    serang: ['Serang', 'Cipocok Jaya', 'Taktakan', 'Curug'],
    jambi: ['Telanaipura', 'Kota Baru', 'Jambi Selatan', 'Pasar Jambi'],
    bengkulu: ['Ratu Agung', 'Gading Cempaka', 'Teluk Segara', 'Selebar'],
    pangkalpinang: ['Bukit Intan', 'Gerunggang', 'Pangkal Balam', 'Rangkui'],
    tanjungpinang: ['Tanjungpinang Kota', 'Tanjungpinang Timur', 'Bukit Bestari'],
    mataram: ['Selaparang', 'Ampenan', 'Cakranegara', 'Mataram'],
    kupang: ['Kelapa Lima', 'Oebobo', 'Kota Raja', 'Maulafa'],
    manado: ['Wenang', 'Sario', 'Malalayang', 'Tikala'],
    gorontalo: ['Kota Selatan', 'Kota Tengah', 'Dungingi', 'Sipatana'],
    palu: ['Palu Timur', 'Palu Selatan', 'Palu Barat', 'Mantikulore'],
    mamuju: ['Mamuju', 'Simboro', 'Kalukku'],
    kendari: ['Mandonga', 'Baruga', 'Kadia', 'Poasia'],
    ambon: ['Sirimau', 'Nusaniwe', 'Baguala', 'Teluk Ambon'],
    sofifi: ['Oba Utara', 'Oba Tengah', 'Oba'],
    jayapura: ['Jayapura Utara', 'Jayapura Selatan', 'Abepura', 'Heram'],
    manokwari: ['Manokwari Barat', 'Manokwari Timur', 'Manokwari Selatan'],
    sorong: ['Sorong Kota', 'Sorong Manoi', 'Sorong Timur'],
    nabire: ['Nabire', 'Wanggar', 'Teluk Kimi'],
    wamena: ['Wamena', 'Hubikosi', 'Asolokobal'],
    merauke: ['Merauke', 'Semangga', 'Tanah Miring']
  };

  /* Jarak Haversine garis lurus (km) */
  function haversineKm(a, b) {
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    var s1 = Math.sin(dLat / 2), s2 = Math.sin(dLon / 2);
    var h = s1 * s1 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * s2 * s2;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  }

  /* Simpul koridor darat nyata Kalbar untuk menghindari garis lurus menyeberangi rawa & muara Sungai Kapuas selatan serta TN Gunung Palung */
  var SIMPUL_TAYAN = { lat: -0.0280, lon: 110.1120 };
  var SIMPUL_SHULU = { lat: -0.6150, lon: 110.3350 };
  var SIMPUL_SANDAI = { lat: -1.2250, lon: 110.5250 };
  var SIMPUL_SINTANG = { lat: 0.0680, lon: 111.4980 };
  var ZONA_SELATAN = { ketapang: true, kayongutara: true };
  var ZONA_BARAT_UTARA = { pontianak: true, kuburaya: true, mempawah: true, singkawang: true, sambas: true, bengkayang: true, landak: true };

  /* Jarak jalan raya nyata presisi di Kalimantan Barat (memperhitungkan Jembatan Tayan–Balai Berkuak–Sandai–Nanga Tayap untuk lintas selatan, serta kelokan jalan perbukitan/pedalaman) */
  function jarakKm(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return 0;
    var ka = a.kabId || '', kb = b.kabId || '';
    var lurus = haversineKm(a, b);
    if (lurus < 0.05) return 0;
    /* Lintas darat Zona Barat/Utara ↔ Zona Selatan (Ketapang/Kayong Utara) wajib lewat Jembatan Tayan → Simpang Hulu → Sandai (bukan lurus menembus rawa Kapuas & TN Gunung Palung!) */
    var lintasSelatan = (ZONA_BARAT_UTARA[ka] && ZONA_SELATAN[kb]) || (ZONA_SELATAN[ka] && ZONA_BARAT_UTARA[kb]);
    if (lintasSelatan && !a.pulau && !b.pulau) {
      var drUtara = ZONA_BARAT_UTARA[ka] ? a : b;
      var keSel = ZONA_SELATAN[ka] ? a : b;
      var seg1 = haversineKm(drUtara, SIMPUL_TAYAN) * 1.24;
      var seg2 = haversineKm(SIMPUL_TAYAN, SIMPUL_SHULU) * 1.28;
      if (keSel.kabId === 'ketapang' && keSel.lat < -1.1) {
        var seg3a = haversineKm(SIMPUL_SHULU, SIMPUL_SANDAI) * 1.28;
        var seg3b = haversineKm(SIMPUL_SANDAI, keSel) * 1.38;
        return Math.round((seg1 + seg2 + seg3a + seg3b) * 10) / 10;
      }
      var seg3 = haversineKm(SIMPUL_SHULU, keSel) * 1.36;
      return Math.round((seg1 + seg2 + seg3) * 10) / 10;
    }
    /* Lintas Poros Tengah jauh menuju Kapuas Hulu / Sintang / Melawi dari Pontianak/Kubu Raya mengikuti lekuk Sungai Kapuas (Tayan–Sanggau–Sekadau–Sintang) */
    var lintasTimur = (ZONA_BARAT_UTARA[ka] && (kb === 'kapuashulu' || kb === 'sintang' || kb === 'melawi')) ||
      (ZONA_BARAT_UTARA[kb] && (ka === 'kapuashulu' || ka === 'sintang' || ka === 'melawi'));
    if (lintasTimur && lurus > 180) {
      var drBarat = ZONA_BARAT_UTARA[ka] ? a : b;
      var keTimur = ZONA_BARAT_UTARA[ka] ? b : a;
      var sT = (haversineKm(drBarat, SIMPUL_TAYAN) + haversineKm(SIMPUL_TAYAN, SIMPUL_SINTANG) + haversineKm(SIMPUL_SINTANG, keTimur)) * 1.48;
      return Math.round(Math.max(lurus * 1.45, sT) * 10) / 10;
    }
    /* Lintas antarkabupaten jauh (>90 km garis lurus): gunakan rasio kelokan jalan raya asli dari jaringan KK_RUTE agar jarak Kalteng/lintas-provinsi tidak memotong lurus rawa/pegunungan */
    if (ka && kb && ka !== kb && lurus > 90 && !a.pulau && !b.pulau && g.KK_RUTE && g.KK_RUTE.jalur) {
      var jRt = g.KK_RUTE.jalur(ka, kb);
      if (jRt && jRt.km > 0 && !jRt.laut) {
        var ibuA = titikAwal(ka), ibuB = titikAwal(kb);
        var lurIbu = (ibuA && ibuB && ibuA.lat != null && ibuB.lat != null) ? haversineKm(ibuA, ibuB) : 0;
        if (lurIbu > 25) {
          var rasioR = Math.max(1.28, Math.min(1.95, jRt.km / lurIbu));
          return Math.round(lurus * rasioR * 10) / 10;
        }
      }
    }
    /* Faktor kelokan realistis sesuai medan (kota/mulus 1.26, pesisir/bergelombang 1.30, perbukitan/rusak/tanah 1.38) */
    var md = medanJalan(a, b);
    var faktor = (md.kode === 'kota' || md.kode === 'mulus') ? 1.26 : (md.kode === 'rusak' || md.kode === 'tanah' || md.kode === 'perbukitan') ? 1.38 : 1.30;
    return Math.round(lurus * faktor * 10) / 10;
  }

  /* Info medan jalan antara 2 titik (mengambil kondisi jalan terberat di jalur) */
  function medanJalan(a, b) {
    var ma = (a && a.medan) || 'mulus';
    var mb = (b && b.medan) || ma;
    if ((a && a.pulau) || (b && b.pulau)) return MEDAN_INFO.pulau;
    var pilih = (MEDAN_BERAT[mb] || 1) >= (MEDAN_BERAT[ma] || 1) ? mb : ma;
    return MEDAN_INFO[pilih] || MEDAN_INFO.mulus;
  }

  /* Registri multi-provinsi modular (Kalbar + Kalteng + siap ekspansi seluruh 38 provinsi tanpa lag) */
  var SEMUA_KAB = {};
  var PROVINSI = {};
  var PROV_BY_KAB = {};
  var PROV_BBOX = {};
  var CACHE_PROV = {};

  /* Koordinat presisi tiap desa di dalam kecamatan (offset deterministik ±0,008° ≈ 0,5–1,4 km agar jarak antar desa presisi) */
  function titikDesa(kabId, kecObj, namaDesa) {
    var kb = SEMUA_KAB[kabId] || KALBAR[kabId];
    var idx = (kecObj.desa || []).indexOf(namaDesa);
    if (idx < 0) idx = 0;
    var sudut = (idx * 2.39996) % (Math.PI * 2);
    var radOff = idx === 0 ? 0 : (0.004 + (idx % 4) * 0.0028);
    return {
      kabId: kabId,
      kabNama: (kb && kb.nama) || kabId,
      prov: (kb && kb.prov) || 'Kalimantan Barat',
      kecId: kecObj.id,
      kecNama: kecObj.nama,
      medan: kecObj.medan || 'mulus',
      pulau: !!kecObj.pulau,
      desa: namaDesa || (kecObj.desa && kecObj.desa[0]) || kecObj.nama,
      lat: Math.round((kecObj.lat + Math.cos(sudut) * radOff) * 10000) / 10000,
      lon: Math.round((kecObj.lon + Math.sin(sudut) * radOff) * 10000) / 10000
    };
  }

  function bangunTitikProv(provId) {
    var p = PROVINSI[provId];
    if (!p) return [];
    var out = [];
    Object.keys(p.data).forEach(function (kabId) {
      var kb = p.data[kabId];
      kb.kec.forEach(function (kc) {
        (kc.desa || [kc.nama]).forEach(function (ds) {
          out.push(titikDesa(kabId, kc, ds));
        });
      });
    });
    return out;
  }
  function daftarTitikProv(provId) {
    var id = provId || 'kalbar';
    if (!CACHE_PROV[id]) CACHE_PROV[id] = bangunTitikProv(id);
    return CACHE_PROV[id];
  }
  function daftarTitikSemua() {
    var out = [];
    Object.keys(PROVINSI).forEach(function (pid) {
      var arr = daftarTitikProv(pid);
      for (var i = 0; i < arr.length; i++) out.push(arr[i]);
    });
    return out;
  }
  function daftarTitikKalbar() { return daftarTitikProv('kalbar'); }

  function apakahKalbar(kotaId) {
    return !!KALBAR[kotaId];
  }
  function kab(kotaId) {
    return SEMUA_KAB[kotaId] || null;
  }
  function provDariKab(kotaId) {
    return PROV_BY_KAB[kotaId] || null;
  }

  /* Titik awal rumah / pangkalan berdasarkan kota (mendukung seluruh provinsi terpetakan & seluruh 105 kota/kabupaten Indonesia) */
  function namaKotaRute(kotaId) {
    if (SEMUA_KAB[kotaId]) return SEMUA_KAB[kotaId].nama;
    if (g.KK_RUTE && g.KK_RUTE.kota && g.KK_RUTE.kota[kotaId]) return g.KK_RUTE.kota[kotaId].nama;
    return kotaId || 'Kota';
  }
  function titikKotaUmum(kotaId) {
    var id = kotaId || 'jakarta';
    var nm = namaKotaRute(id);
    var daf = KEC_UMUM[id];
    var ds = daf && daf[0] ? daf[0] : nm;
    var rk = g.KK_RUTE && g.KK_RUTE.kota && g.KK_RUTE.kota[id];
    var prov = (rk && rk.prov) || (rk && rk.pulau) || 'Indonesia';
    return { kabId: id, kabNama: nm, prov: prov, kecId: id + '_0', kecNama: nm, medan: 'mulus', pulau: false, desa: ds, lat: null, lon: null };
  }
  function titikAwal(kotaId, kecId) {
    var kb = SEMUA_KAB[kotaId];
    if (kb) {
      var kc = (kecId && kb.kec.filter(function (x) { return x.id === kecId; })[0]) || kb.kec[0];
      return titikDesa(kotaId, kc, kc.desa[0]);
    }
    return titikKotaUmum(kotaId);
  }

  /* Pilih tujuan order ojol nyata sesuai rentang km dari titik sekarang — bebas acak ke segala arah daratan (antardesa, antarkecamatan, antarkabupaten hingga lintas perbatasan provinsi Kalbar ↔ Kalteng) dan TIDAK pernah mengarahkan motor/mobil menyeberang laut ke pulau */
  function pilihTujuan(asal, minKm, maxKm, riwayatDesa) {
    if (!asal || asal.lat == null) {
      var listK = KEC_UMUM[asal && asal.kabId] || ['Pusat Kota', 'Kecamatan Timur', 'Kecamatan Barat', 'Kecamatan Selatan', 'Kecamatan Utara'];
      var pilihK = listK[Math.floor(Math.random() * listK.length)];
      var kmAcak = Math.round((minKm + Math.random() * Math.max(0.5, maxKm - minKm)) * 10) / 10;
      return { titik: { kabId: (asal && asal.kabId) || 'kota', kabNama: (asal && asal.kabNama) || 'Kota', prov: 'Indonesia', kecId: pilihK, kecNama: pilihK, medan: 'kota', pulau: false, desa: pilihK, lat: null, lon: null }, km: kmAcak, medan: MEDAN_INFO.kota };
    }
    /* Pilih hanya provinsi yang bounding-box GPS-nya bersinggungan dengan radius pencarian (skalabel 38 provinsi & dukung lintas perbatasan alami!) */
    var padDeg = Math.max(maxKm, 85) / 80 + 0.35;
    var semua = [];
    Object.keys(PROVINSI).forEach(function (pid) {
      var bb = PROV_BBOX[pid];
      if (bb && (asal.lat + padDeg < bb.minLat || asal.lat - padDeg > bb.maxLat || asal.lon + padDeg < bb.minLon || asal.lon - padDeg > bb.maxLon)) return;
      var arr = daftarTitikProv(pid);
      for (var ii = 0; ii < arr.length; ii++) semua.push(arr[ii]);
    });
    if (!semua.length) semua = daftarTitikProv(PROV_BY_KAB[asal.kabId] || 'kalbar');
    var hindari = Array.isArray(riwayatDesa) ? riwayatDesa : [];
    var asalPulau = !!asal.pulau;
    function cariDalam(lo, hi, skipRiwayat) {
      var res = [], maxDeg = hi / 80 + 0.15;
      for (var i = 0; i < semua.length; i++) {
        var t = semua[i];
        if (Math.abs(t.lat - asal.lat) > maxDeg || Math.abs(t.lon - asal.lon) > maxDeg) continue;
        if (t.desa === asal.desa && t.kecId === asal.kecId) continue;
        if (!asalPulau && t.pulau) continue;
        if (asalPulau && t.kecId !== asal.kecId) continue;
        if (skipRiwayat && (hindari.indexOf(t.desa) >= 0 || hindari.indexOf(t.kecId + ':' + t.desa) >= 0)) continue;
        var d = jarakKm(asal, t);
        if (d >= lo && d <= hi) res.push({ titik: t, km: Math.max(0.8, d), medan: medanJalan(asal, t) });
      }
      return res;
    }
    var cocok = cariDalam(minKm, maxKm, true);
    function hitungKec(arr) {
      var u = {};
      for (var i = 0; i < arr.length; i++) u[arr[i].titik.kecId] = true;
      return Object.keys(u).length;
    }
    if (!asalPulau && (cocok.length < 8 || hitungKec(cocok) < 2)) {
      var maksLuas = Math.max(maxKm, maxKm <= 15 ? 42 : Math.min(180, maxKm * 1.45));
      var perluas = cariDalam(Math.max(1, minKm * 0.7), maksLuas, true);
      if (hitungKec(perluas) < 2) perluas = cariDalam(Math.max(1, minKm * 0.7), Math.max(85, maksLuas * 1.6), true);
      if (perluas.length) cocok = perluas;
    }
    if (!cocok.length) cocok = cariDalam(Math.max(0.5, minKm * 0.4), Math.max(48, maxKm * 1.6), false);
    if (cocok.length) {
      var bedaKec = cocok.filter(function (x) { return x.titik.kecId !== asal.kecId; });
      if (bedaKec.length && Math.random() < 0.65) return bedaKec[Math.floor(Math.random() * bedaKec.length)];
      return cocok[Math.floor(Math.random() * cocok.length)];
    }
    var terdekat = null, minD = 99999;
    for (var k = 0; k < semua.length; k++) {
      var t3 = semua[k];
      if (t3.desa === asal.desa && t3.kecId === asal.kecId) continue;
      if (!asalPulau && t3.pulau) continue;
      if (asalPulau && t3.kecId !== asal.kecId) continue;
      var d3 = jarakKm(asal, t3);
      if (d3 < minD) { minD = d3; terdekat = t3; }
    }
    if (!terdekat) terdekat = semua[0];
    return { titik: terdekat, km: Math.max(1, minD), medan: medanJalan(asal, terdekat) };
  }

  function daftarKecamatan(kotaId) {
    if (SEMUA_KAB[kotaId]) return SEMUA_KAB[kotaId].kec;
    return (KEC_UMUM[kotaId] || ['Pusat Kota']).map(function (nm, i) { return { id: kotaId + '_' + i, nama: nm, medan: 'kota', pulau: false, desa: [nm], lat: null, lon: null }; });
  }

  /* Cari titik desa/kecamatan spesifik dari seluruh provinsi terpetakan (Kalbar, Kalteng, dll) */
  function cariTitik(kabId, kecId, namaDesa) {
    var kb = SEMUA_KAB[kabId];
    if (!kb) return titikAwal(kabId, kecId);
    var kc = (kecId && kb.kec.filter(function (x) { return x.id === kecId; })[0]) || kb.kec[0];
    var ds = (namaDesa && kc.desa.indexOf(namaDesa) >= 0) ? namaDesa : kc.desa[0];
    return titikDesa(kabId, kc, ds);
  }
  function desaAcak(kabId, kecId) {
    var kb = SEMUA_KAB[kabId];
    if (!kb) return titikAwal(kabId, kecId);
    var kc = (kecId && kb.kec.filter(function (x) { return x.id === kecId; })[0]) || kb.kec[Math.floor(Math.random() * kb.kec.length)];
    var ds = kc.desa[Math.floor(Math.random() * kc.desa.length)];
    return titikDesa(kabId, kc, ds);
  }

  /* Koridor kecamatan asli sepanjang ruas jalan antarkabupaten Kalbar agar Travel melintasi seluruh kecamatan & desa nyata */
  var KORIDOR_KALBAR = {
    'pontianak|kuburaya': [['pontianak', 'ptk_sel'], ['pontianak', 'ptk_tgr'], ['kuburaya', 'kr_sraya']],
    'pontianak|mempawah': [['pontianak', 'ptk_utr'], ['mempawah', 'mpw_jongkat'], ['mempawah', 'mpw_segedong'], ['mempawah', 'mpw_pinyuh'], ['mempawah', 'mpw_timur'], ['mempawah', 'mpw_hilir']],
    'mempawah|singkawang': [['mempawah', 'mpw_hilir'], ['mempawah', 'mpw_skunyit'], ['bengkayang', 'bky_sraya'], ['bengkayang', 'bky_srkep'], ['singkawang', 'skw_sel'], ['singkawang', 'skw_bar']],
    'singkawang|sambas': [['singkawang', 'skw_utr'], ['sambas', 'sbs_selakau'], ['sambas', 'sbs_salatiga'], ['sambas', 'sbs_pemangkat'], ['sambas', 'sbs_semparuk'], ['sambas', 'sbs_tebas'], ['sambas', 'sbs_sebawi'], ['sambas', 'sbs_sambas']],
    'singkawang|bengkayang': [['singkawang', 'skw_tim'], ['bengkayang', 'bky_monterado'], ['bengkayang', 'bky_samalantan'], ['bengkayang', 'bky_sbetung'], ['bengkayang', 'bky_kota']],
    'sambas|bengkayang': [['sambas', 'sbs_sambas'], ['sambas', 'sbs_sajad'], ['sambas', 'sbs_subah'], ['bengkayang', 'bky_tbelas'], ['bengkayang', 'bky_ledo'], ['bengkayang', 'bky_lumar'], ['bengkayang', 'bky_kota']],
    'mempawah|bengkayang': [['mempawah', 'mpw_hilir'], ['mempawah', 'mpw_pinyuh'], ['mempawah', 'mpw_anjongan'], ['mempawah', 'mpw_toho'], ['landak', 'ldk_menjalin'], ['landak', 'ldk_mhulu'], ['bengkayang', 'bky_teriak'], ['bengkayang', 'bky_kota']],
    'kuburaya|landak': [['kuburaya', 'kr_sraya'], ['kuburaya', 'kr_ambawang'], ['kuburaya', 'kr_kmandor'], ['landak', 'ldk_mandor'], ['landak', 'ldk_stemila'], ['landak', 'ldk_ngabang']],
    'bengkayang|landak': [['bengkayang', 'bky_kota'], ['bengkayang', 'bky_teriak'], ['landak', 'ldk_sompak'], ['landak', 'ldk_bhulu'], ['landak', 'ldk_menyuke'], ['landak', 'ldk_kbehe'], ['landak', 'ldk_ngabang']],
    'landak|sanggau': [['landak', 'ldk_ngabang'], ['landak', 'ldk_jelimpo'], ['sanggau', 'sgu_thulu'], ['sanggau', 'sgu_parindu'], ['sanggau', 'sgu_bonti'], ['sanggau', 'sgu_kapuas']],
    'kuburaya|sanggau': [['kuburaya', 'kr_sraya'], ['kuburaya', 'kr_ambawang'], ['sanggau', 'sgu_thilir'], ['sanggau', 'sgu_balai'], ['sanggau', 'sgu_thulu'], ['sanggau', 'sgu_parindu'], ['sanggau', 'sgu_kapuas']],
    'sanggau|sekadau': [['sanggau', 'sgu_kapuas'], ['sanggau', 'sgu_mukok'], ['sekadau', 'skd_hilir']],
    'sekadau|sintang': [['sekadau', 'skd_hilir'], ['sintang', 'stg_sepauk'], ['sintang', 'stg_tempunak'], ['sintang', 'stg_stebelian'], ['sintang', 'stg_kota']],
    'sintang|melawi': [['sintang', 'stg_kota'], ['sintang', 'stg_stebelian'], ['melawi', 'mlw_putr'], ['melawi', 'mlw_npinoh']],
    'sintang|kapuashulu': [['sintang', 'stg_kota'], ['sintang', 'stg_kelam'], ['sintang', 'stg_dedai'], ['kapuashulu', 'kh_silhilir'], ['kapuashulu', 'kh_seberuang'], ['kapuashulu', 'kh_semitau'], ['kapuashulu', 'kh_hgurung'], ['kapuashulu', 'kh_pengkadan'], ['kapuashulu', 'kh_btanjung'], ['kapuashulu', 'kh_bunhulu'], ['kapuashulu', 'kh_mentebah'], ['kapuashulu', 'kh_kalis'], ['kapuashulu', 'kh_putsel'], ['kapuashulu', 'kh_pututr']],
    'kuburaya|ketapang': [['kuburaya', 'kr_sraya'], ['kuburaya', 'kr_ambawang'], ['sanggau', 'sgu_thilir'], ['sanggau', 'sgu_toba'], ['ketapang', 'ktp_shulu'], ['ketapang', 'ktp_sdua'], ['ketapang', 'ktp_slaur'], ['ketapang', 'ktp_sandai'], ['ketapang', 'ktp_ntayap'], ['ketapang', 'ktp_pemahan'], ['ketapang', 'ktp_smrayak'], ['ketapang', 'ktp_mpawan'], ['ketapang', 'ktp_dpawan']],
    'sanggau|ketapang': [['sanggau', 'sgu_kapuas'], ['sanggau', 'sgu_parindu'], ['sanggau', 'sgu_thilir'], ['sanggau', 'sgu_toba'], ['ketapang', 'ktp_shulu'], ['ketapang', 'ktp_slaur'], ['ketapang', 'ktp_sandai'], ['ketapang', 'ktp_ntayap'], ['ketapang', 'ktp_smrayak'], ['ketapang', 'ktp_dpawan']],
    'kuburaya|kayongutara': [['kuburaya', 'kr_sraya'], ['kuburaya', 'kr_rasau'], ['kuburaya', 'kr_bampar'], ['kayongutara', 'ku_tbatang'], ['kayongutara', 'ku_seponti'], ['kayongutara', 'ku_shilir'], ['kayongutara', 'ku_sukadana']],
    'ketapang|kayongutara': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_mpawan'], ['ketapang', 'ktp_mhu'], ['kayongutara', 'ku_shilir'], ['kayongutara', 'ku_sukadana']],
    'ketapang|melawi': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_smrayak'], ['ketapang', 'ktp_ntayap'], ['ketapang', 'ktp_sandai'], ['ketapang', 'ktp_hsungai'], ['melawi', 'mlw_tpbarat'], ['melawi', 'mlw_tpinoh'], ['melawi', 'mlw_bhulu'], ['melawi', 'mlw_belimbing'], ['melawi', 'mlw_npinoh']],
    'ketapang|sukamara': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_bkayong'], ['ketapang', 'ktp_mhs'], ['ketapang', 'ktp_kendawangan']],
    'ketapang|lamandau': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_mpawan'], ['ketapang', 'ktp_smrayak'], ['ketapang', 'ktp_pemahan'], ['ketapang', 'ktp_ttiti'], ['ketapang', 'ktp_jelai']]
  };

  function titikKoridorRuas(kabA, kabB, u) {
    u = Math.max(0, Math.min(1, Number(u) || 0));
    var aMap = !!SEMUA_KAB[kabA], bMap = !!SEMUA_KAB[kabB];
    /* Ruas di luar provinsi terpetakan detail (Kalsel, Kaltim, Kaltara, Jawa, Sumatra, dll): kembalikan kota/kabupaten aktual di ruas agar HUD tidak macet */
    if (!aMap && !bMap) {
      return titikKotaUmum(u < 0.5 ? kabA : kabB);
    }
    var list = KORIDOR_KALBAR[kabA + '|' + kabB];
    if (!list && KORIDOR_KALBAR[kabB + '|' + kabA]) list = KORIDOR_KALBAR[kabB + '|' + kabA].slice().reverse();
    /* Ruas perbatasan Provinsi Terpetakan ↔ Luar Wilayah Terpetakan: lalui kecamatan/desa detail sampai perbatasan lalu masuk ke kabupaten tujuan */
    if (aMap && !bMap) {
      if (u >= 0.78) return titikKotaUmum(kabB);
      u = u / 0.78;
    } else if (!aMap && bMap) {
      if (u < 0.22) return titikKotaUmum(kabA);
      u = (u - 0.22) / 0.78;
    }
    if (!list || !list.length) {
      var kTarget = u < 0.5 ? kabA : kabB;
      return titikAwal(kTarget);
    }
    var pos = u * (list.length - 1);
    var idx = Math.max(0, Math.min(list.length - 1, Math.floor(pos)));
    var subU = pos - idx;
    var pair = list[idx];
    var kb = SEMUA_KAB[pair[0]];
    if (!kb) return titikAwal(kabA);
    var kc = kb.kec.filter(function (x) { return x.id === pair[1]; })[0] || kb.kec[0];
    var dIdx = Math.max(0, Math.min(kc.desa.length - 1, Math.floor(subU * Math.min(4, kc.desa.length))));
    return titikDesa(pair[0], kc, kc.desa[dIdx]);
  }

  /* Tempat ibadah terdekat yang berbeda-beda sesuai kecamatan/desa tempat karakter berada */
  var MASJID_KHAS = {
    ptk_kota: ['Masjid Raya Mujahidin Pontianak', 'Masjid Al-Falah Darat Sekip'],
    ptk_tim: ['Masjid Jami Sultan Syarif Abdurrahman', 'Masjid Al-Mujahidin Saigon'],
    ptk_sel: ['Masjid Al-Ikhlas Akcaya', 'Masjid Nurul Iman Kota Baru'],
    ptk_tgr: ['Masjid Al-Muhtadin Untan', 'Masjid Darussalam Bansir'],
    ptk_bar: ['Masjid Darul Falah Sungai Jawi', 'Masjid Al-Huda Pal Lima'],
    ptk_utr: ['Masjid Al-Barkah Siantan', 'Masjid Al-Falah Batu Layang'],
    kr_sraya: ['Masjid Agung Al-Falah Sungai Raya', 'Masjid Al-Muhajirin Arang Limbung'],
    kr_skakap: ['Masjid Besar Al-Ikhlas Sungai Kakap', 'Masjid Nurul Huda Pal IX'],
    ktp_dpawan: ['Masjid Agung Al-Ikhlas Ketapang', 'Masjid Al-Fallah Sampit', 'Masjid Babussalam Kali Nilam'],
    ktp_bkayong: ['Masjid Jami Keraton Matan', 'Masjid Al-Mutaqin Mulia Kerta'],
    ktp_mpawan: ['Masjid Nurul Yaqin Sungai Awan', 'Masjid Al-Muttaqin Tempurukan'],
    skw_bar: ['Masjid Raya Singkawang', 'Masjid Baitul Makmur Pasiran'],
    mpw_hilir: ['Masjid Agung Al-Falah Mempawah', 'Masjid Jami Keraton Amantubillah'],
    sbs_sambas: ['Masjid Jami Sultan Muhammad Syafiuddin II', 'Masjid Agung Babul Jannah'],
    sgu_kapuas: ['Masjid Agung Al-Mu\'awwanah Sanggau'],
    skd_hilir: ['Masjid Agung Al-Falah Sekadau'],
    stg_kota: ['Masjid Agung Al-Amin Sintang'],
    mlw_npinoh: ['Masjid Agung Ibnu Taymiyah Nanga Pinoh'],
    kh_pututr: ['Masjid Agung Darunnajah Putussibau'],
    ku_sukadana: ['Masjid Agung Oesman Al-Khair Sukadana'],
    ldk_ngabang: ['Masjid Jami Keraton Ismahayana Landak'],
    bky_kota: ['Masjid Agung Syuhada Bengkayang']
  };
  var NAMA_MASJID_LOKAL = ['Masjid Nurul Iman', 'Masjid Al-Hidayah', 'Masjid Baiturrahman', 'Masjid Al-Ikhlas', 'Masjid Al-Muttaqin', 'Masjid Darussalam'];
  function tempatIbadahTerdekat(lokasi, agama) {
    var kec = (lokasi && lokasi.kecNama) || 'Kota';
    var desa = (lokasi && lokasi.desa) || kec;
    var kecId = (lokasi && lokasi.kecId) || '';
    var h = 0, s = String(kecId + desa);
    for (var i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) >>> 0;
    if (!agama || agama === 'Islam') {
      var listM = MASJID_KHAS[kecId];
      if (listM && listM.length) return listM[h % listM.length];
      return NAMA_MASJID_LOKAL[h % NAMA_MASJID_LOKAL.length] + ' ' + desa;
    }
    if (agama === 'Kristen Protestan') return ['Gereja GPIB', 'Gereja HKBP', 'Gereja GKI', 'Gereja GPdI'][h % 4] + ' ' + kec;
    if (agama === 'Katolik') return ['Gereja Katolik Paroki St. Yosef', 'Gereja Katolik St. Maria', 'Gereja Katolik St. Petrus'][h % 3] + ' ' + kec;
    if (agama === 'Hindu') return 'Pura Agung Giripati ' + kec;
    if (agama === 'Buddha') return ['Vihara Bodhisattva', 'Vihara Dhammasoka', 'Vihara Tri Ratna'][h % 3] + ' ' + kec;
    if (agama === 'Konghucu') return ['Klenteng Tri Dharma', 'Lithang Khong Kauw Hwee'][h % 2] + ' ' + kec;
    return 'Rumah Ibadah ' + kec;
  }

  /* Populasi nyata 2026 (BPS) untuk 14 Kab/Kota Kalbar, seluruh Kalimantan, & ibu kota provinsi Indonesia */
  var PENDUDUK_WILAYAH = {
    pontianak: 685000, kuburaya: 635000, ketapang: 595000, kayongutara: 132000,
    mempawah: 315000, singkawang: 245000, sambas: 648000, bengkayang: 298000,
    landak: 412000, sanggau: 496000, sekadau: 222000, sintang: 438000,
    melawi: 236000, kapuashulu: 266000,
    /* Kalimantan Tengah */
    palangkaraya: 312000, kotawaringinbarat: 282000, sukamara: 68000, lamandau: 108000,
    seruyan: 170000, kotawaringintimur: 446000, katingan: 174000, pulangpisau: 141000,
    kapuas: 424000, gunungmas: 142000, baritoselatan: 137000, baritotimur: 119000,
    baritoutara: 162000, murungraya: 118000,
    /* Kalimantan Selatan */
    banjarmasin: 682000, banjarbaru: 285000, banjar: 584000, baritokuala: 326000,
    tanahlaut: 368000, tapin: 198000, hss: 238000, hst: 268000,
    hsu: 236000, balangan: 138000, tabalong: 264000, tanahbumbu: 348000, kotabaru: 336000,
    /* Kalimantan Timur & Utara */
    balikpapan: 742000, samarinda: 870000, bontang: 192000, ikn: 185000,
    ppu: 198000, paser: 298000, kukar: 792000, kubar: 182000,
    mahakamulu: 38000, kutim: 452000, berau: 276000,
    tanjungselor: 168000, tarakan: 254000, tanatidung: 29000, malinau: 88000, nunukan: 218000,
    /* Provinsi lain */
    jakarta: 10720000, surabaya: 3010000, bandung: 2540000, medan: 2510000,
    semarang: 1710000, palembang: 1780000, makassar: 1480000, pekanbaru: 1140000,
    bandarlampung: 1230000, lampung: 1230000, padang: 945000, denpasar: 745000,
    serang: 740000, jambi: 645000, yogyakarta: 418000, mataram: 465000,
    kupang: 472000, manado: 468000, palu: 392000, bengkulu: 398000,
    kendari: 368000, ambon: 358000, jayapura: 418000, sorong: 298000,
    bandaaceh: 268000, pangkalpinang: 236000, tanjungpinang: 238000, gorontalo: 206000,
    manokwari: 205000, mamuju: 286000, merauke: 242000, nabire: 178000,
    wamena: 122000, sofifi: 42000
  };
  function pendudukWilayah(S) {
    var fTrvP = (S && S.travel && S.travel.aktif && g.KK_TRAVEL && g.KK_TRAVEL.fase) ? g.KK_TRAVEL.fase(S) : null;
    var kabId = (fTrvP && fTrvP.lokSekarang && fTrvP.lokSekarang.kabId) || (S && S.travel && S.travel.aktif && S.travel.di) || (S && S.ojek && S.ojek.lokasi && S.ojek.lokasi.kabId) || (S && S.rumah && S.rumah.wilayah && S.rumah.wilayah.kabId) || (S && S.kota) || 'pontianak';
    var dasar = PENDUDUK_WILAYAH[kabId] || 280000;
    var thnJalan = Math.max(0, (((S && S.hariKe) || 1) - 1) / 365);
    var delta = (S && S.popDelta) || 0;
    return Math.max(10000, Math.round(dasar * (1 + thnJalan * 0.011) + delta));
  }
  function formatPenduduk(n) {
    n = Math.round(+n || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + 'jt';
    if (n >= 1000) return Math.round(n / 1000) + 'rb';
    return String(n);
  }
  function faktorPenduduk(S) {
    var p = pendudukWilayah(S);
    var f = 0.72 + Math.log10(Math.max(50000, p) / 50000) * 0.285;
    return Math.max(0.8, Math.min(1.42, Math.round(f * 100) / 100));
  }

  function daftarProvinsi(id, nama, dataObj, koridorObj, masjidObj) {
    if (!id || !dataObj) return;
    var jmlKab = 0, jmlKec = 0, jmlDesa = 0;
    var minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    Object.keys(dataObj).forEach(function (kId) {
      var kb = dataObj[kId];
      if (!kb.prov) kb.prov = nama;
      SEMUA_KAB[kId] = kb;
      PROV_BY_KAB[kId] = id;
      jmlKab++;
      jmlKec += kb.kec.length;
      kb.kec.forEach(function (kc) {
        jmlDesa += (kc.desa || []).length;
        if (typeof kc.lat === 'number' && typeof kc.lon === 'number') {
          if (kc.lat < minLat) minLat = kc.lat;
          if (kc.lat > maxLat) maxLat = kc.lat;
          if (kc.lon < minLon) minLon = kc.lon;
          if (kc.lon > maxLon) maxLon = kc.lon;
        }
      });
    });
    PROVINSI[id] = { id: id, nama: nama, data: dataObj, jmlKab: jmlKab, jmlKec: jmlKec, jmlDesa: jmlDesa };
    if (minLat <= maxLat) PROV_BBOX[id] = { minLat: minLat, maxLat: maxLat, minLon: minLon, maxLon: maxLon };
    delete CACHE_PROV[id];
    if (koridorObj) {
      Object.keys(koridorObj).forEach(function (rk) { KORIDOR_KALBAR[rk] = koridorObj[rk]; });
    }
    if (masjidObj) {
      Object.keys(masjidObj).forEach(function (mk) { MASJID_KHAS[mk] = masjidObj[mk]; });
    }
    if (g.KK_WILAYAH) g.KK_WILAYAH[id] = dataObj;
  }
  function daftarProvinsiList() {
    return Object.keys(PROVINSI).map(function (id) {
      var p = PROVINSI[id];
      return { id: p.id, nama: p.nama, jmlKab: p.jmlKab, jmlKec: p.jmlKec, jmlDesa: p.jmlDesa };
    });
  }
  function daftarKab(provId) {
    var src = (provId && PROVINSI[provId]) ? PROVINSI[provId].data : SEMUA_KAB;
    return Object.keys(src).map(function (id) {
      return { id: id, nama: src[id].nama, prov: src[id].prov || '', provId: PROV_BY_KAB[id] || provId || '', jmlKec: src[id].kec.length, penduduk: PENDUDUK_WILAYAH[id] || 200000 };
    });
  }

  g.KK_WILAYAH = {
    kalbar: KALBAR,
    semuaKab: SEMUA_KAB,
    provinsi: PROVINSI,
    MEDAN_INFO: MEDAN_INFO,
    PENDUDUK_WILAYAH: PENDUDUK_WILAYAH,
    pendudukWilayah: pendudukWilayah,
    formatPenduduk: formatPenduduk,
    faktorPenduduk: faktorPenduduk,
    apakahKalbar: apakahKalbar,
    kab: kab,
    provDariKab: provDariKab,
    daftarProvinsi: daftarProvinsi,
    daftarProvinsiList: daftarProvinsiList,
    daftarKab: daftarKab,
    jarakKm: jarakKm,
    medanJalan: medanJalan,
    titikAwal: titikAwal,
    titikDesa: titikDesa,
    cariTitik: cariTitik,
    desaAcak: desaAcak,
    titikKoridorRuas: titikKoridorRuas,
    pilihTujuan: pilihTujuan,
    daftarKecamatan: daftarKecamatan,
    tempatIbadahTerdekat: tempatIbadahTerdekat,
    daftarKabKalbar: function () { return daftarKab('kalbar'); }
  };

  /* Daftarkan Provinsi Kalimantan Barat sebagai modul inti pertama + proses modul provinsi lain bila sudah mengantri */
  daftarProvinsi('kalbar', 'Kalimantan Barat', KALBAR);
  if (Array.isArray(g._KK_PENDING_PROV)) {
    g._KK_PENDING_PROV.forEach(function (args) { daftarProvinsi.apply(null, args); });
    delete g._KK_PENDING_PROV;
  }
})(window);
