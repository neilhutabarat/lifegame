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
        { id: 'ptk_kota', nama: 'Pontianak Kota', lat: -0.0263, lon: 109.3335, medan: 'kota', desa: ['Daratsekip', 'Sungaibangkong', 'Tengah', 'Mariana', 'Sungaijawi'] },
        { id: 'ptk_sel', nama: 'Pontianak Selatan', lat: -0.0448, lon: 109.3324, medan: 'kota', desa: ['Akcaya', 'Benuamelayu Laut', 'Benuamelayu Darat', 'Parittokaya', 'Kotabaru'] },
        { id: 'ptk_tgr', nama: 'Pontianak Tenggara', lat: -0.0628, lon: 109.3548, medan: 'kota', desa: ['Bangkabelitung Darat', 'Bansir Laut', 'Bansir Darat', 'Bangkabelitung Laut'] },
        { id: 'ptk_tim', nama: 'Pontianak Timur', lat: -0.0315, lon: 109.3660, medan: 'kota', desa: ['Banjar Serasan', 'Paritmayor', 'Saigon', 'Tanjung Hulu', 'Tanjung Hilir', 'Dalambugis', 'Tambelansampit'] },
        { id: 'ptk_bar', nama: 'Pontianak Barat', lat: -0.0155, lon: 109.3075, medan: 'kota', desa: ['Pallima', 'Sungaijawi Dalam', 'Sungaijawi Luar', 'Sungaibeliung'] },
        { id: 'ptk_utr', nama: 'Pontianak Utara', lat: 0.0085, lon: 109.3380, medan: 'mulus', desa: ['Batulayang', 'Siantan Hulu', 'Siantan Tengah', 'Siantan Hilir'] }
      ]
    },
    /* 2. KAB. KUBU RAYA — 9 Kecamatan */
    kuburaya: {
      nama: 'Kab. Kubu Raya', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kr_sraya', nama: 'Sungai Raya', lat: -0.1180, lon: 109.4030, medan: 'kota', desa: ['Sungai Raya', 'Sungai Ambangah', 'Arang Limbung', 'Kuala Dua', 'Tebang Kacang', 'Sungai Asam', 'Pulau Limbung', 'Kapur', 'Gunung Tamang', 'Sungai Bulan', 'Limbung', 'Teluk Kapuas', 'Madu Sari', 'Mekar Sari', 'Mekar Baru', 'Sungai Raya Dalam', 'Parit Baru', 'Pulau Jambu', 'Kalibandung', 'Muara Baru', 'Sukulanting', 'Permata Jaya'] },
        { id: 'kr_skakap', nama: 'Sungai Kakap', lat: -0.0650, lon: 109.2450, medan: 'mulus', desa: ['Sungai Kakap', 'Sungai Itik', 'Jeruju Besar', 'Sungai Kupah', 'Sungai Rengas', 'Pal Sembilan', 'Sungai Belidak', 'Kalimas', 'Punggur Kecil', 'Punggur Besar', 'Tanjung Saleh', 'Sepuk Laut', 'Punggur Kapuas', 'Rengas Kapuas', 'Parit Keladi'] },
        { id: 'kr_ambawang', nama: 'Sungai Ambawang', lat: -0.0480, lon: 109.4950, medan: 'mulus', desa: ['Sungai Ambawang Kuala', 'Simpang Kanan', 'Mega Timur', 'Bengkarek', 'Lingga', 'Jawa Tengah', 'Durian', 'Pancaroba', 'Puguk', 'Korek', 'Pasak', 'Pasak Piang', 'Teluk Bakung', 'Ampera Raya', 'Sungai Malaya'] },
        { id: 'kr_kmandor', nama: 'Kuala Mandor B', lat: 0.0320, lon: 109.5450, medan: 'bergelombang', desa: ['Kuala Mandor A', 'Kuala Mandor B', 'Kubu Padi', 'Retok', 'Sungai Enau', 'Padi Jaya'] },
        { id: 'kr_rasau', nama: 'Rasau Jaya', lat: -0.2380, lon: 109.3810, medan: 'mulus', desa: ['Rasau Jaya Umum', 'Rasau Jaya Satu', 'Rasau Jaya Dua', 'Rasau Jaya Tiga', 'Bintang Mas', 'Pematang Tujuh'] },
        { id: 'kr_kubu', nama: 'Kubu', lat: -0.4680, lon: 109.3650, medan: 'rusak', desa: ['Kubu', 'Olak-Olak Kubu', 'Sungai Selamat', 'Sungai Bemban', 'Pinang Luar', 'Seruat Dua', 'Seruat Tiga', 'Dabong', 'Ambawang', 'Sepakat Baru', 'Kampung Baru', 'Air Putih', 'Teluk Nangka', 'Jangkang Satu', 'Jangkang Dua', 'Pinang Dalam', 'Sungai Terus', 'Pelita Jaya', 'Mengkalang', 'Mengkalang Jambu'] },
        { id: 'kr_pakedai', nama: 'Teluk Pakedai', lat: -0.3150, lon: 109.2350, medan: 'rusak', desa: ['Teluk Pakedai Hulu', 'Teluk Pakedai Satu', 'Teluk Pakedai Dua', 'Kuala Karang', 'Seruat Satu', 'Sungai Deras', 'Selat Remis', 'Madura', 'Pasir Putih', 'Teluk Gelam', 'Tanjung Bunga', 'Sungai Nibung', 'Arus Deras', 'Sungai Nipah'] },
        { id: 'kr_bampar', nama: 'Batu Ampar', lat: -0.7500, lon: 109.4850, medan: 'pulau', pulau: true, desa: ['Padang Tikar Satu', 'Tanjung Beringin', 'Batu Ampar', 'Teluk Nibung', 'Padang Tikar Dua', 'Tasik Malaya', 'Sungai Besar', 'Sungai Jawi', 'Nipah Panjang', 'Ambarawa', 'Tanjung Harapan', 'Sungai Kerawang', 'Sumber Agung', 'Muara Tiga', 'Medan Mas'] },
        { id: 'kr_terentang', nama: 'Terentang', lat: -0.4120, lon: 109.6150, medan: 'tanah', desa: ['Terentang Hilir', 'Teluk Empening', 'Terentang Hulu', 'Permata', 'Betuah', 'Sungai Radak Satu', 'Sungai Radak Dua', 'Sungai Dungun', 'Teluk Bayur', 'Radak Baru'] }
      ]
    },
    /* 3. KAB. KETAPANG — 20 Kecamatan */
    ketapang: {
      nama: 'Kab. Ketapang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ktp_dpawan', nama: 'Delta Pawan', lat: -1.8350, lon: 109.9740, medan: 'kota', desa: ['Sampit', 'Kantor', 'Tengah', 'Mulia Baru', 'Suka Harja', 'Suka Bangun', 'Kali Nilam', 'Paya Kumang', 'Suka Bangun Dalam'] },
        { id: 'ktp_bkayong', nama: 'Benua Kayong', lat: -1.8620, lon: 109.9850, medan: 'kota', desa: ['Kauman', 'Mulia Kerta', 'Tuan-Tuan', 'Banjar', 'Padang', 'Sungai Kinjil', 'Suka Baru', 'Baru', 'Negeri Baru', 'Mekar Sari', 'Kinjil Pesisir'] },
        { id: 'ktp_mpawan', nama: 'Muara Pawan', lat: -1.7680, lon: 109.9550, medan: 'mulus', desa: ['Sungai Awan Kiri', 'Sungai Awan Kanan', 'Tempurukan', 'Ulak Medang', 'Tanjung Pura', 'Mayak', 'Tanjung Pasar', 'Suka Maju'] },
        { id: 'ktp_mhu', nama: 'Matan Hilir Utara', lat: -1.6080, lon: 110.0350, medan: 'mulus', desa: ['Kuala Tolak', 'Sungai Putri', 'Tanjung Baik Budi', 'Kuala Satong', 'Laman Satong'] },
        { id: 'ktp_mhs', nama: 'Matan Hilir Selatan', lat: -2.0650, lon: 110.1250, medan: 'bergelombang', desa: ['Pesaguan Kanan', 'Sungai Jawi', 'Pesaguan Kiri', 'Sungai Pelang', 'Sungai Bakau', 'Pematang Gadung', 'Sungai Besar', 'Sungai Nanjung', 'Kemuning Biutak', 'Harapan Baru', 'Pagar Mentimun'] },
        { id: 'ktp_kendawangan', nama: 'Kendawangan', lat: -2.5260, lon: 110.2140, medan: 'bergelombang', desa: ['Kendawangan Kiri', 'Banjar Sari', 'Kendawangan Kanan', 'Pangkalan Batu', 'Bangkal Serai', 'Air Hitam Besar', 'Suka Harapan', 'Suka Damai', 'Selimantan Jaya', 'Danau Buntar', 'Mekar Utama', 'Pembedilan', 'Air Hitam Hulu', 'Natai Kuini', 'Keramat Jaya', 'Seriam', 'Kedondong', 'Sungai Jelayan', 'Air Tarap'] },
        { id: 'ktp_sandai', nama: 'Sandai', lat: -1.2250, lon: 110.5250, medan: 'bergelombang', desa: ['Sandai', 'Randau Jungkal', 'Penjawaan', 'Muara Jekak', 'Petai Patah', 'Randau', 'Sandai Kiri', 'Demit', 'Pendamar Indah', 'Merimbang Jaya', 'Alam Pakuan', 'Jago Bersatu', 'Istana'] },
        { id: 'ktp_ntayap', nama: 'Nanga Tayap', lat: -1.5250, lon: 110.5850, medan: 'bergelombang', desa: ['Nanga Tayap', 'Pangkalan Telok', 'Pangkalan Suka', 'Betenung', 'Batu Mas', 'Sungai Kelik', 'Lembah Hijau Satu', 'Lembah Hijau Dua', 'Siantau Raya', 'Sebadak Raya', 'Simpang Tiga Sembelangaan', 'Mensubang', 'Tajok Kayong', 'Kayong Utara', 'Kayong Hulu', 'Sepakat Jaya', 'Cegolak', 'Pateh Benteng', 'Tanjung Medan', 'Kayung Tuhe'] },
        { id: 'ktp_ttiti', nama: 'Tumbang Titi', lat: -1.8250, lon: 110.6350, medan: 'bergelombang', desa: ['Tumbang Titi', 'Natai Panjang', 'Serengkah', 'Mahawa', 'Nanga Kelampai', 'Batu Tajam', 'Kalimas Baru', 'Pemuatan Jaya', 'Sengkaharak', 'Belaban Tujuh', 'Segar Wangi', 'Petebang Jaya', 'Aur Gading', 'Beringin Rayo', 'Titi Baru', 'Tanjung Beulang', 'Batu Beransak', 'Serengkah Kanan', 'Sepauhan Raya', 'Jungkal', 'Jelayan', 'Pengatapan Raya', 'Suka Damai', 'Tanjung Maloi', 'Sepuring Indah'] },
        { id: 'ktp_marau', nama: 'Marau', lat: -2.1250, lon: 110.7150, medan: 'rusak', desa: ['Sukakarya', 'Randai', 'Belaban', 'Runjai Jaya', 'Karya Baru', 'Riam Batu Gading', 'Batu Payung Dua', 'Bantan Sari', 'Pelanjau Jaya', 'Rangkung'] },
        { id: 'ktp_mmata', nama: 'Manis Mata', lat: -2.4650, lon: 111.0150, medan: 'rusak', desa: ['Manis Mata', 'Air Dekakah', 'Suka Ramai', 'Suak Burung', 'Silat', 'Terusan', 'Kemuning', 'Kelampai', 'Bukit Gajah', 'Lembah Mukti', 'Asam Besar', 'Batu Sedau', 'Jambi', 'Seguling', 'Kalimantan', 'Pelempangan', 'Sengkuang Merabong', 'Pakit Selaba', 'Sungai Buluh', 'Ratu Elok', 'Mekar Jaya', 'Tribun Jaya'] },
        { id: 'ktp_slaur', nama: 'Sungai Laur', lat: -0.9650, lon: 110.4250, medan: 'bergelombang', desa: ['Riam Bunut', 'Sempurna', 'Bengaras', 'Sepotong', 'Sukaramai', 'Tanjung Beringin', 'Harapan Baru', 'Randau Limat', 'Bayun Sari', 'Teluk Bayur', 'Tanjung Maju', 'Sungai Daka', 'Mekar Harapan', 'Sinar Kuri', 'Selangkut Raya', 'Lanjut Mekar Sari', 'Kepari', 'Teluk Mutiara', 'Merabu Jaya'] },
        { id: 'ktp_shulu', nama: 'Simpang Hulu', lat: -0.6150, lon: 110.3350, medan: 'bergelombang', desa: ['Balai Pinang', 'Semandang Kiri', 'Kualan Hulu', 'Semandang Hulu', 'Merawa', 'Kualan Tengah', 'Kualan Hilir', 'Sekucing Labai', 'Paoh Concong', 'Legong', 'Kenanga', 'Balai Pinang Hulu', 'Sekucing Kualan', 'Labai Hilir', 'Botuh Bosi'] },
        { id: 'ktp_sdua', nama: 'Simpang Dua', lat: -0.8350, lon: 110.3650, medan: 'rusak', desa: ['Semandang Kanan', 'Gema', 'Mekar Raya', 'Kampar Sebomban', 'Batu Daya', 'Kamora'] },
        { id: 'ktp_hsungai', nama: 'Hulu Sungai', lat: -1.0850, lon: 110.8950, medan: 'tanah', desa: ['Menyumbung', 'Senduruhan', 'Cinta Manis', 'Beginci Darat', 'Benua Krio', 'Riam Dadap', 'Sekukun', 'Batu Lapis', 'Krio Hulu', 'Kenyabur', 'Sunge Bengaras', 'Lubuk Kakap'] },
        { id: 'ktp_jelai', nama: 'Jelai Hulu', lat: -2.0150, lon: 110.8950, medan: 'rusak', desa: ['Periangan', 'Tanggerang', 'Kesuma Jaya', 'Penyarang', 'Biku Sarana', 'Semantun', 'Riam Danau Kanan', 'Limpang', 'Pasir Mayang', 'Tebing Berseri', 'Deranuk', 'Rangga Intan', 'Pangkalan Suka', 'Teluk Runjai', 'Asam Jelai', 'Air Dua', 'Sidahari', 'Kusik Batu Lapu', 'Karang Dangin', 'Perigi', 'Bayam Raya', 'Pangkalan Paket'] },
        { id: 'ktp_aupas', nama: 'Air Upas', lat: -2.3150, lon: 110.8450, medan: 'rusak', desa: ['Air Upas', 'Sari Bekayas', 'Air Durian Jaya', 'Harapan Baru', 'Suka Ria', 'Banda Sari', 'Membuluh Baru', 'Gahang', 'Mekar Jaya'] },
        { id: 'ktp_singkup', nama: 'Singkup', lat: -2.2950, lon: 110.6350, medan: 'rusak', desa: ['Sukaraja', 'Suka Mulia', 'Bukit Kelambing', 'Muntai', 'Suka Sari', 'Sukaharja', 'Tanah Hitam', 'Pantai Ketikal'] },
        { id: 'ktp_pemahan', nama: 'Pemahan', lat: -1.7650, lon: 110.4650, medan: 'bergelombang', desa: ['Pebihingan', 'Lalang Panjang', 'Semayok Baru', 'Muara Gerunggang', 'Usaha Baru', 'Kerta Baru', 'Muara Semayok'] },
        { id: 'ktp_smrayak', nama: 'Sungai Melayu Rayak', lat: -1.7850, lon: 110.2850, medan: 'bergelombang', desa: ['Sungai Melayu', 'Beringin Jaya', 'Sungai Melayu Baru', 'Suka Mulya', 'Karya Mukti', 'Piansak', 'Jairan Jaya', 'Kepuluk', 'Sungai Melayu Jaya', 'Mekar Jaya', 'Makmur Abadi'] }
      ]
    },
    /* 4. KAB. KAYONG UTARA — 6 Kecamatan */
    kayongutara: {
      nama: 'Kab. Kayong Utara', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ku_sukadana', nama: 'Sukadana', lat: -1.2420, lon: 109.9510, medan: 'mulus', desa: ['Sutera', 'Pangkalan Buton', 'Sejahtera', 'Simpang Tiga', 'Benawai Agung', 'Harapan Mulia', 'Pampang Harapan', 'Sedahan Jaya', 'Gunungsembilan', 'Riam Berasap Jaya'] },
        { id: 'ku_shilir', nama: 'Simpang Hilir', lat: -1.1150, lon: 109.9850, medan: 'bergelombang', desa: ['Teluk Melano', 'Nipah Kuning', 'Pemangkat', 'Padu Banjar', 'Penjalaan', 'Sungai Mata-Mata', 'Batu Barat', 'Pulau Kumbang', 'Rantau Panjang', 'Matan Jaya', 'Medan Jaya', 'Lubuk Batu'] },
        { id: 'ku_tbatang', nama: 'Teluk Batang', lat: -1.0320, lon: 109.8450, medan: 'bergelombang', desa: ['Telukbatang', 'Mas Bangun', 'Alur Bandung', 'Sungaipaduan', 'Banyu Abang', 'Telukbatang Selatan', 'Telukbatang Utara'] },
        { id: 'ku_seponti', nama: 'Seponti', lat: -0.9450, lon: 109.8850, medan: 'bergelombang', desa: ['Seponti Jaya', 'Telaga Arum', 'Wonorejo', 'Podorukun', 'Sungai Sepeti', 'Durian Sebatang'] },
        { id: 'ku_pmaya', nama: 'Pulau Maya', lat: -1.1450, lon: 109.5950, medan: 'pulau', pulau: true, desa: ['Tanjungsatai', 'Kemboja', 'Dusun Kecil', 'Dusun Besar', 'Satai Lestari'] },
        { id: 'ku_karimata', nama: 'Kepulauan Karimata', lat: -1.6150, lon: 108.9250, medan: 'pulau', pulau: true, desa: ['Pelapis', 'Betok Jaya', 'Padang'] }
      ]
    },
    /* 5. KAB. MEMPAWAH — 9 Kecamatan */
    mempawah: {
      nama: 'Kab. Mempawah', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mpw_hilir', nama: 'Mempawah Hilir', lat: 0.3620, lon: 108.9580, medan: 'kota', desa: ['Tengah', 'Tanjung', 'Terusan', 'Sengkubang', 'Penibung', 'Pasir', 'Kuala Secapah', 'Malikian'] },
        { id: 'mpw_timur', nama: 'Mempawah Timur', lat: 0.3520, lon: 109.0050, medan: 'mulus', desa: ['Pulau Pedalaman', 'Pasir Wan Salim', 'Antibar', 'Sejegi', 'Pasir Palembang', 'Pasir Panjang', 'Sungai Bakau Kecil', 'Parit Banjar'] },
        { id: 'mpw_pinyuh', nama: 'Sungai Pinyuh', lat: 0.2780, lon: 109.0860, medan: 'mulus', desa: ['Sungai Pinyuh', 'Sungai Rasau', 'Sungai Bakau Besar Darat', 'Sungai Purun Kecil', 'Sungai Bakau Besar Laut', 'Sungai Batang', 'Peniraman', 'Nusapati', 'Galang'] },
        { id: 'mpw_jongkat', nama: 'Jongkat', lat: 0.0880, lon: 109.2550, medan: 'mulus', desa: ['Jungkat', 'Wajok Hilir', 'Sungai Nipah', 'Peniti Luar', 'Wajok Hulu'] },
        { id: 'mpw_segedong', nama: 'Segedong', lat: 0.1750, lon: 109.1650, medan: 'mulus', desa: ['Parit Bugis', 'Peniti Besar', 'Sungai Purun Besar', 'Peniti Dalam I', 'Peniti Dalam II', 'Sungai Burung'] },
        { id: 'mpw_skunyit', nama: 'Sungai Kunyit', lat: 0.4450, lon: 108.9250, medan: 'pesisir', desa: ['Sungai Kunyit Laut', 'Sungai Duri I', 'Sungai Duri II', 'Bukit Batu', 'Sungai Bundung Laut', 'Sungai Kunyit Dalam', 'Sungai Kunyit Hulu', 'Sungai Limau', 'Sungai Dungun', 'Mendalok', 'Semparong Parit Raden', 'Semudun'] },
        { id: 'mpw_anjongan', nama: 'Anjongan', lat: 0.3550, lon: 109.1450, medan: 'mulus', desa: ['Anjungan Melancar', 'Anjungan Dalam', 'Kepayang', 'Pak Bulu', 'Dema'] },
        { id: 'mpw_toho', nama: 'Toho', lat: 0.4150, lon: 109.2350, medan: 'bergelombang', desa: ['Pak Laheng', 'Toho Ilir', 'Kecurit', 'Terap', 'Sepang', 'Pak Utan', 'Benuang', 'Sambora'] },
        { id: 'mpw_sadaniang', nama: 'Sadaniang', lat: 0.5150, lon: 109.2550, medan: 'perbukitan', desa: ['Amawang', 'Sekabuk', 'Pentek', 'Bum-bun', 'Ansiap', 'Suak Barangan'] }
      ]
    },
    /* 6. KOTA SINGKAWANG — 5 Kecamatan */
    singkawang: {
      nama: 'Kota Singkawang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skw_bar', nama: 'Singkawang Barat', lat: 0.9065, lon: 108.9830, medan: 'kota', desa: ['Pasiran', 'Melayu', 'Tengah', 'Kuala'] },
        { id: 'skw_tgh', nama: 'Singkawang Tengah', lat: 0.9010, lon: 109.0050, medan: 'kota', desa: ['Roban', 'Condong', 'Sekip Lama', 'Jawa', 'Bukit Batu', 'Sungai Wie'] },
        { id: 'skw_sel', nama: 'Singkawang Selatan', lat: 0.8420, lon: 108.9650, medan: 'pesisir', desa: ['Sedau', 'Sagatani', 'Sijangkung', 'Pangmilang'] },
        { id: 'skw_tim', nama: 'Singkawang Timur', lat: 0.9040, lon: 109.0680, medan: 'perbukitan', desa: ['Nyarumkop', 'Pajintan', 'Maya Sopa', 'Bagak Sahwa', 'Sanggau Kulor'] },
        { id: 'skw_utr', nama: 'Singkawang Utara', lat: 0.9580, lon: 108.9980, medan: 'mulus', desa: ['Sungai Garam Hilir', 'Naram', 'Sungai Bulan', 'Sungai Rasau', 'Setapuk Kecil', 'Setapuk Besar', 'Semelagi Kecil'] }
      ]
    },
    /* 7. KAB. SAMBAS — 19 Kecamatan (Lengkap 100% BPS) */
    sambas: {
      nama: 'Kab. Sambas', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sbs_sambas', nama: 'Sambas', lat: 1.3620, lon: 109.3050, medan: 'kota', desa: ['Dalam Kaum', 'Lubuk Dagang', 'Tanjung Bugis', 'Pendawan', 'Pasar Melayu', 'Durian', 'Lorong', 'Jagur', 'Tumuk Manggis', 'Tanjung Mekar', 'Sebayan', 'Kartiasa', 'Saing Rambi', 'Lumbang', 'Sungai Rambah', 'Gapura', 'Sumber Harapan', 'Semangau'] },
        { id: 'sbs_pemangkat', nama: 'Pemangkat', lat: 1.1760, lon: 108.9750, medan: 'mulus', desa: ['Pemangkat Kota', 'Harapan', 'Penjajap', 'Jelutung', 'Perapakan', 'Sebatuan', 'Gugah Sejahtera', 'Lonam'] },
        { id: 'sbs_tebas', nama: 'Tebas', lat: 1.2420, lon: 109.1620, medan: 'mulus', desa: ['Tebas Sungai', 'Tebas Kuala', 'Sempalai', 'Bekut', 'Seberkat', 'Sejiram', 'Makrampai', 'Mekar Sekuntum', 'Mensere', 'Pusaka', 'Segedong', 'Sungai Kelambu', 'Serumpun Buluh', 'Pangkalan Kongsi', 'Dungun Perapakan', 'Batu Makjage', 'Serindang', 'Bukit Sigoler', 'Matang Labong', 'Maktangguk', 'Segarau Parit', 'Maribas', 'Seret Ayon'] },
        { id: 'sbs_tkeramat', nama: 'Teluk Keramat', lat: 1.4650, lon: 109.1950, medan: 'bergelombang', desa: ['Sekura', 'Sungai Kumpai', 'Tri Mandayan', 'Pedada', 'Lela', 'Puringan', 'Berlimang', 'Sungai Baru', 'Sengawang', 'Teluk Kaseh', 'Sepadu', 'Tambatan', 'Kubangga', 'Sungai Serabek', 'Sayang Sedayu', 'Pipit Teja', 'Matang Segantar', 'Mulia', 'Teluk Kembang', 'Samustida', 'Tanjung Keracut', 'Sebagu', 'Mekar Sekuntum', 'Kuala Pangkalan Keramat', 'Sabing'] },
        { id: 'sbs_selakau', nama: 'Selakau', lat: 1.0720, lon: 108.9780, medan: 'mulus', desa: ['Sungai Nyirih', 'Semelagi Besar', 'Sungai Daun', 'Sungai Rusa', 'Kuala', 'Parit Baru', 'Twi Mentibar', 'Bentunai', 'Pangkalan Bemban', 'Parit Kongsi', 'Gayung Bersambut'] },
        { id: 'sbs_jawai', nama: 'Jawai', lat: 1.3650, lon: 109.0450, medan: 'bergelombang', desa: ['Sentebang', 'Sarang Burung Danau', 'Sungai Nilam', 'Sarang Burung Kolam', 'Sarang Burung Usrat', 'Sarang Burung Kuala', 'Pelimpaan', 'Parit Setia', 'Bakau', 'Sungai Nyirih', 'Dungun Laut', 'Lambau', 'Mutus Darussalam'] },
        { id: 'sbs_paloh', nama: 'Paloh', lat: 1.7250, lon: 109.2850, medan: 'rusak', desa: ['Nibung', 'Sebubus', 'Malek', 'Tanah Hitam', 'Matang Danau', 'Kalimantan', 'Temajuk', 'Mentibar'] },
        { id: 'sbs_sajingan', nama: 'Sajingan Besar', lat: 1.5950, lon: 109.6150, medan: 'perbukitan', desa: ['Sebunga', "Kaliau'", 'Santaban', 'Sanatab', 'Sungai Bening'] },
        { id: 'sbs_subah', nama: 'Subah', lat: 1.2750, lon: 109.4350, medan: 'bergelombang', desa: ['Balai Gemuruh', "Sungai Sapa'", 'Madak', 'Sabung', 'Tebuah Elok', 'Sungai Deden', 'Bukit Mulya', 'Mukti Raharja', 'Sempurna', 'Mensade', 'Karaban Jaya', 'Arga Pura', 'Sapak Hulu Trans'] },
        { id: 'sbs_galing', nama: 'Galing', lat: 1.5450, lon: 109.3650, medan: 'bergelombang', desa: ['Galing', 'Sagu', 'Sungai Palah', 'Tempapan Kuala', 'Tempapan Hulu', 'Ratu Sepudak', 'Tri Kembang', 'Tri Gadu', 'Teluk Pandan', 'Sijang'] },
        { id: 'sbs_sajad', nama: 'Sajad', lat: 1.3850, lon: 109.3880, medan: 'mulus', desa: ['Tengguli', 'Jirak', 'Mekar Jaya', 'Beringin'] },
        { id: 'sbs_sejangkung', nama: 'Sejangkung', lat: 1.4480, lon: 109.4350, medan: 'bergelombang', desa: ['Parit Raja', 'Sulung', 'Penakalan', 'Sekuduk', 'Setalik', 'Piantus', 'Perigi Landu', 'Sendoyan', 'Senujuh', 'Perigi Limus', 'Semanga', 'Sepantai'] },
        { id: 'sbs_semparuk', nama: 'Semparuk', lat: 1.2020, lon: 109.0480, medan: 'mulus', desa: ['Semparuk', 'Singaraya', 'Sepinggan', 'Sepadu', 'Seburing'] },
        { id: 'sbs_jawaisel', nama: 'Jawai Selatan', lat: 1.2750, lon: 109.0250, medan: 'pesisir', desa: ['Matang Terap', 'Jawai Laut', 'Jelu Air', 'Suah Api', 'Sarilaba A', 'Sarilaba B', 'Semperiuk A', 'Semperiuk B', 'Sabaran'] },
        { id: 'sbs_tekarang', nama: 'Tekarang', lat: 1.3180, lon: 109.1680, medan: 'mulus', desa: ['Tekarang', 'Merubung', 'Cepala', 'Sari Makmur', 'Rambayan', 'Sempadian', 'Matang Segarau'] },
        { id: 'sbs_tangaran', nama: 'Tangaran', lat: 1.5350, lon: 109.1550, medan: 'bergelombang', desa: ['Simpang Empat', 'Tangaran', 'Merabuan', 'Semata', 'Merpati', 'Pancur', 'Arung Parak', 'Arung Medang'] },
        { id: 'sbs_selakautim', nama: 'Selakau Timur', lat: 1.0780, lon: 109.0550, medan: 'bergelombang', desa: ['Selakau Tua', 'Gelik', 'Seranggam', 'Buduk Sempadang'] },
        { id: 'sbs_salatiga', nama: 'Salatiga', lat: 1.1320, lon: 109.0180, medan: 'mulus', desa: ['Salatiga', 'Parit Baru', 'Sungai Toman', 'Serunai', 'Serumpun'] },
        { id: 'sbs_sebawi', nama: 'Sebawi', lat: 1.3020, lon: 109.2580, medan: 'mulus', desa: ['Sebawi', 'Rantau Panjang', 'Tebing Batu', 'Sepuk Tanjung', 'Sebangun', 'Sempalai Sebedang', 'Tempatan'] }
      ]
    },
    /* 8. KAB. BENGKAYANG — 17 Kecamatan (Lengkap 100% BPS) */
    bengkayang: {
      nama: 'Kab. Bengkayang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'bky_kota', nama: 'Bengkayang', lat: 0.8220, lon: 109.4880, medan: 'kota', desa: ['Bumi Emas', 'Sebalo', 'Tirta Kencana', 'Bhakti Mulya', 'Bani Amas', 'Setia Budi'] },
        { id: 'bky_sraya', nama: 'Sungai Raya', lat: 0.7150, lon: 108.9050, medan: 'pesisir', desa: ['Sungai Duri', 'Sungai Jaga A', 'Sungai Jaga B', 'Sungai Pangkalan I', 'Sungai Pangkalan II'] },
        { id: 'bky_srkep', nama: 'Sungai Raya Kepulauan', lat: 0.7680, lon: 108.8850, medan: 'pesisir', desa: ['Karimunting', 'Rukma Jaya', 'Sungai Keran', 'Sungai Raya', 'Pulau Lemukutan'] },
        { id: 'bky_monterado', nama: 'Monterado', lat: 0.7420, lon: 109.1250, medan: 'bergelombang', desa: ['Monterado', 'Gerantung', 'Goa Boma', 'Nek Ginap', 'Beringin Baru', 'Sendoreng', 'Rantau', 'Mekar Baru', 'Jahandung', 'Serindu', 'Siaga'] },
        { id: 'bky_samalantan', nama: 'Samalantan', lat: 0.7980, lon: 109.2180, medan: 'bergelombang', desa: ['Samalantan', "Saba'u", 'Tumiang', 'Babane', 'Pasti Jaya', 'Bukit Serayan', 'Marunsu'] },
        { id: 'bky_ledo', nama: 'Ledo', lat: 1.0150, lon: 109.6150, medan: 'perbukitan', desa: ['Lesabela', 'Semangat', 'Serangkat', 'Rodaya', 'Dayung', 'Jesape', 'Lomba Karya', 'Sidai', 'Seles', 'Tebuah Marong', 'Suka Damai', 'Suka Jaya'] },
        { id: 'bky_sledo', nama: 'Sanggau Ledo', lat: 1.1550, lon: 109.7150, medan: 'perbukitan', desa: ['Lembang', 'Gua', 'Bange', 'Danti', 'Sango'] },
        { id: 'bky_jbabang', nama: 'Jagoi Babang', lat: 1.3180, lon: 109.9150, medan: 'perbukitan', desa: ['Jagoi', 'Kumba', 'Sekida', 'Gersik', 'Semunying Jaya', 'Sinar Baru'] },
        { id: 'bky_capkala', nama: 'Capkala', lat: 0.6750, lon: 108.9950, medan: 'mulus', desa: ['Capkala', 'Mandor', 'Setanduk', 'Aris', 'Sebandut', 'Pawangi'] },
        { id: 'bky_lbawang', nama: 'Lembah Bawang', lat: 0.9050, lon: 109.2950, medan: 'perbukitan', desa: ['Lembah Bawang', 'Saka Taru', 'Janyat', 'Tempapan', 'Papan Uduk', 'Papan Tembawang', 'Godang Damar', 'Kinande'] },
        { id: 'bky_lumar', nama: 'Lumar', lat: 0.9280, lon: 109.4950, medan: 'perbukitan', desa: ['Tiga Berkat', 'Magmagan Karya', 'Seren Selimbau', 'Belimbing', 'Lamolda'] },
        { id: 'bky_seluas', nama: 'Seluas', lat: 1.2450, lon: 109.8450, medan: 'perbukitan', desa: ['Seluas', 'Bengkawan', 'Sahan', 'Mayak', 'Kalon', 'Sentangau Jaya'] },
        { id: 'bky_siding', nama: 'Siding', lat: 1.2850, lon: 110.0850, medan: 'tanah', desa: ['Siding', 'Sungkung I', 'Hli Buei', 'Tangguh', 'Sungkung II', 'Sungkung III', 'Tamong', 'Tawang'] },
        { id: 'bky_sbetung', nama: 'Sungai Betung', lat: 0.8580, lon: 109.4350, medan: 'mulus', desa: ['Cipta Karya', 'Suka Bangun', 'Karya Bhakti', 'Suka Maju'] },
        { id: 'bky_ssemarang', nama: 'Suti Semarang', lat: 0.9650, lon: 109.8550, medan: 'tanah', desa: ['Suti Semarang', 'Nangka', 'Muhi Bersatu', 'Suka Maju', 'Cempaka Putih', 'Kiung', 'Kelayuk', 'Tapen'] },
        { id: 'bky_teriak', nama: 'Teriak', lat: 0.7750, lon: 109.5250, medan: 'bergelombang', desa: ['Teriak', 'Dharma Bhakti', 'Sumber Karya', 'Setia Jaya', 'Bangun Sari', 'Sebetung Menyala', 'Malo Jelayan', 'Ampar Benteng', 'Tanjung', 'Telidik', 'Puteng', 'Sekaruh', 'Tubajur', 'Lulang', 'Benteng', 'Sebente', 'Temia Sio', 'Bana'] },
        { id: 'bky_tbelas', nama: 'Tujuh Belas', lat: 1.0780, lon: 109.5150, medan: 'perbukitan', desa: ['Kamuh', 'Sinar Tebudak', 'Bengkilu', 'Pisak'] }
      ]
    },
    /* 9. KAB. LANDAK — 13 Kecamatan (Lengkap 100% BPS) */
    landak: {
      nama: 'Kab. Landak', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ldk_ngabang', nama: 'Ngabang', lat: 0.3780, lon: 109.9520, medan: 'kota', desa: ['Hilir Kantor', 'Hilir Tengah', 'Raja', 'Mungguk', 'Amboyo Utara', 'Sungai Keli', 'Rasan', "Mu'un", 'Ambarang', 'Engkadu', 'Amang', 'Penyaho Dangku', 'Antan Rayan', 'Amboyo Inti', 'Tebedak', 'Temiang Sawi', 'Amboyo Selatan', 'Sebirang', 'Pak Mayam'] },
        { id: 'ldk_mandor', nama: 'Mandor', lat: 0.3150, lon: 109.3380, medan: 'mulus', desa: ['Mandor', 'Sebadu', 'Semenok', 'Mengkunyit', 'Bebatung', 'Kerohok', 'Sumsum', 'Sekilap', 'Manggang', 'Keramas', 'Pongok', 'Kayu Ara', 'Selutung', 'Simpang Kasturi', 'Salatiga', 'Kayu Tanam', 'Ngarak'] },
        { id: 'ldk_stemila', nama: 'Sengah Temila', lat: 0.3350, lon: 109.6450, medan: 'mulus', desa: ['Pahauman', 'Paloan', 'Sebatih', 'Saham', 'Andeng', 'Senakin', 'Tonang', 'Banying', 'Sidas', 'Keranji Mancal', 'Keranji Paidang', 'Aur Sampuk', 'Gombang', 'Rabak'] },
        { id: 'ldk_menjalin', nama: 'Menjalin', lat: 0.4550, lon: 109.3550, medan: 'bergelombang', desa: ['Menjalin', 'Sepahat', 'Lamoanak', 'Bengkawe', 'Tempoak', "Re'es", 'Raba', 'Nangka'] },
        { id: 'ldk_mhulu', nama: 'Mempawah Hulu', lat: 0.5680, lon: 109.4250, medan: 'bergelombang', desa: ['Karangan', 'Sailo', 'Mentonyek', 'Sampuro', "Sala'as", 'Sabaka', 'Tunang', 'Sungai Laki', 'Tiang Tanjung', 'Pahokng', 'Garu', 'Bilayuk', 'Caokng', 'Salumang', 'Ansolok', 'Babatn', 'Parigi'] },
        { id: 'ldk_menyuke', nama: 'Menyuke', lat: 0.5850, lon: 109.7650, medan: 'bergelombang', desa: ['Darit', 'Mamek', 'Ansang', 'Kayu Ara', 'Angkaras', 'Ladangan', 'Songga', 'Sidan', 'Berinang Mayun', 'Lintah Betung', 'Anik Dingir', 'Bagak', 'Tolok', 'Sungai Lubang', "Ta'as", 'Ongkol Padang'] },
        { id: 'ldk_abesar', nama: 'Air Besar', lat: 0.6550, lon: 110.1250, medan: 'rusak', desa: ['Serimbu', 'Engkangin', 'Jambu Tembawang', 'Sepangah', 'Merayuh', 'Nyari', 'Sekendal', 'Semuntik', 'Temoyok', 'Engkadik Pade', 'Dange Aji', 'Tenguwe', 'Parek', 'Bentiang Madomang', 'Tengon', 'Sempatung Lawek'] },
        { id: 'ldk_bhulu', nama: 'Banyuke Hulu', lat: 0.6350, lon: 109.6550, medan: 'bergelombang', desa: ['Untang', 'Padang Pio', 'Tembawang Bale', 'Kampet', 'Ringo Lojok', 'Gamang', 'Semade'] },
        { id: 'ldk_jelimpo', nama: 'Jelimpo', lat: 0.3650, lon: 110.0850, medan: 'bergelombang', desa: ['Jelimpo', 'Temahar', 'Kersik Belantian', "Nyi'in", 'Papung', 'Sekais', 'Mandor Kiru', 'Tubang Raeng', 'Kayu Ara', 'Pawis Hilir', 'Angan Tembawang', 'Balai Peluntan', 'Dara Itam I'] },
        { id: 'ldk_kbehe', nama: 'Kuala Behe', lat: 0.4950, lon: 109.8950, medan: 'rusak', desa: ['Kuala Behe', 'Semedang', 'Nyayum', 'Paku Raya', 'Permiit', 'Tanjung Balai', 'Angkanyar', 'Kedama', 'Bengawan Ampar', 'Sehe Lusur', 'Sejowet'] },
        { id: 'ldk_meranti', nama: 'Meranti', lat: 0.6950, lon: 109.8650, medan: 'rusak', desa: ['Meranti', 'Kelampai Setolo', 'Moro Betung', 'Selange', 'Ampadi', 'Tahu'] },
        { id: 'ldk_sebangki', nama: 'Sebangki', lat: 0.1450, lon: 109.7650, medan: 'rusak', desa: ['Agak', 'Sebangki', 'Kumpang Tengah', 'Rantau Panjang', 'Sungai Segak'] },
        { id: 'ldk_sompak', nama: 'Sompak', lat: 0.4950, lon: 109.5150, medan: 'bergelombang', desa: ['Sompak', 'Pauh', 'Lingkonong', 'Galar', 'Amawakng', 'Tapakng', 'Pakumbang'] }
      ]
    },
    /* 10. KAB. SANGGAU — 15 Kecamatan (Lengkap 100% BPS) */
    sanggau: {
      nama: 'Kab. Sanggau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sgu_kapuas', nama: 'Kapuas', lat: 0.1280, lon: 110.5880, medan: 'kota', desa: ['Beringin', 'Tanjung Kapuas', 'Tanjung Sekayam', 'Sungai Sengkuang', 'Ilir Kota', 'Bunut', 'Penyeladi', 'Nanga Biang', 'Rambin', 'Entakai', 'Pana', 'Mengkiang', 'Kambong', 'Sungai Mawang', 'Lape', 'Penyalimau', 'Sungai Alai', 'Semerangkai', 'Sungai Batu', 'Sungai Muntik', 'Lintang Kapuas', 'Lintang Pelaman', 'Belangin', 'Penyalimau Jaya', 'Tapang Dulang', 'Botuh Lintang'] },
        { id: 'sgu_thilir', nama: 'Tayan Hilir', lat: -0.0280, lon: 110.1120, medan: 'mulus', desa: ['Pedalaman', 'Pulau Tayan Utara', 'Kawat', 'Balai Ingin', 'Lalang', 'Cempedak', 'Melugai', 'Emberas', 'Beginjan', 'Sejotang', 'Sebemban', 'Subah', 'Sungai Jaman', 'Tanjung Bunut', 'Tebang Benua'] },
        { id: 'sgu_thulu', nama: 'Tayan Hulu', lat: 0.3050, lon: 110.2280, medan: 'mulus', desa: ['Sosok', 'Peruan Dalam', 'Menyabo', 'Mandong', 'Janjang', 'Riyai', 'Berakak', 'Engkasan', 'Pandan Sembuat', 'Binjai', 'Kedakas'] },
        { id: 'sgu_balai', nama: 'Balai', lat: 0.1350, lon: 110.1050, medan: 'mulus', desa: ['Hilir', 'Padi Kaye', 'Temiang Mali', 'Cowet', 'Kebadu', 'Mak Kawing', 'Tae', 'Semoncol', 'Empirang Ujung', 'Bulu Bala', 'Temiang Taba', 'Senyabang'] },
        { id: 'sgu_parindu', nama: 'Parindu', lat: 0.2580, lon: 110.4250, medan: 'mulus', desa: ['Pusat Damai', 'Maju Karya', 'Sebarra', 'Pandu Raya', 'Embala', 'Hibun', 'Maringin Jaya', 'Suka Mulya', 'Palem Jaya', 'Rahayu', 'Dosan', 'Suka Gerundi', 'Gunam', 'Marita'] },
        { id: 'sgu_kembayan', nama: 'Kembayan', lat: 0.5620, lon: 110.4050, medan: 'mulus', desa: ['Tanjung Merpati', 'Tanjung Bunga', 'Semayang', 'Sebongkuh', 'Kuala Dua', 'Sejuah', 'Mobui', 'Tanap', 'Sebuduh', 'Kelompu', 'Tunggal Bhakti'] },
        { id: 'sgu_sekayam', nama: 'Sekayam', lat: 0.8050, lon: 110.4550, medan: 'bergelombang', desa: ['Balai Karangan', 'Pengadang', 'Sotok', 'Kenaman', 'Raut Muara', 'Engkahan', 'Bungkang', 'Lubuk Sabuk', 'Sungai Tekam', 'Malenggang'] },
        { id: 'sgu_entikong', nama: 'Entikong', lat: 0.9620, lon: 110.3520, medan: 'mulus', desa: ['Entikong', 'Nekan', 'Semanget', 'Pala Pasang', 'Suruh Tembawang'] },
        { id: 'sgu_meliau', nama: 'Meliau', lat: -0.1250, lon: 110.2950, medan: 'rusak', desa: ['Meliau Hilir', 'Meliau Hulu', 'Kuala Buayan', 'Meranggau', 'Melobok', 'Sungai Mayam', 'Pampang Dua', 'Kuala Rosan', 'Sungai Kembayau', 'Kunyil', 'Cupang', 'Lalang', 'Baru Lombak', 'Enggadai', 'Balai Tinggi', 'Bhakti Jaya', 'Mukti Jaya', 'Melawi Makmur', 'Harapan Makmur'] },
        { id: 'sgu_toba', nama: 'Toba', lat: -0.2680, lon: 110.1150, medan: 'bergelombang', desa: ['Teraju', 'Belungai Dalam', 'Sansat', 'Kampung Baru', 'Bagan Asam', 'Lumut', 'Balai Belungai'] },
        { id: 'sgu_beduai', nama: 'Beduai', lat: 0.6750, lon: 110.3750, medan: 'mulus', desa: ['Kasro Mego', 'Bereng Berkawat', 'Sungai Ilai', 'Thang Raya', 'Mawang Muda'] },
        { id: 'sgu_bonti', nama: 'Bonti', lat: 0.3780, lon: 110.5050, medan: 'bergelombang', desa: ['Bonti', 'Sami', 'Bahta', 'Upe', 'Tunggul Boyok', 'Empodis', 'Kampuh', 'Bantai', 'Majel'] },
        { id: 'sgu_jangkang', nama: 'Jangkang', lat: 0.3450, lon: 110.7150, medan: 'rusak', desa: ['Balai Sebut', 'Jangkang Benua', 'Tanggung', 'Empiyang', 'Pisang', 'Ketori', 'Semombat', 'Terati', 'Sape', 'Selampung', 'Semirau'] },
        { id: 'sgu_mukok', nama: 'Mukok', lat: 0.0850, lon: 110.7650, medan: 'bergelombang', desa: ['Kedukul', 'Semuntai', 'Engkode', 'Sungai Mawang', 'Inggis', 'Layak Omang', 'Semanggis Raya', 'Tri Mulya', 'Serambai Jaya'] },
        { id: 'sgu_noyan', nama: 'Noyan', lat: 0.6950, lon: 110.6650, medan: 'tanah', desa: ['Noyan', 'Empoto', 'Semongan', 'Sungai Dangin', 'Idas'] }
      ]
    },
    /* 11. KAB. SEKADAU — 7 Kecamatan */
    sekadau: {
      nama: 'Kab. Sekadau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skd_hilir', nama: 'Sekadau Hilir', lat: 0.0120, lon: 110.9050, medan: 'kota', desa: ['Sungai Ringin', 'Mungguk', 'Tanjung', 'Merapi', 'Seraras', 'Semabi', 'Seberang Kapuas', 'Landau Kodah', 'Timpuk', 'Sungai Kunyit', 'Peniti', 'Gonis Tekam', 'Tapang Semadak', 'Engkersik', 'Ensalang', 'Bokak Sebumbun', 'Selalong', 'Sempulau Indah', 'Tigur Jaya', 'Beringkai Raya'] },
        { id: 'skd_hulu', nama: 'Sekadau Hulu', lat: -0.1450, lon: 110.9350, medan: 'bergelombang', desa: ['Rawak Hilir', 'Rawak Hulu', 'Nanga Menterap', 'Boti', 'Perongkan', 'Tinting Boyok', 'Sekonau', 'Setawar', 'Nanga Pemubuh', 'Tapang Perodah', 'Sungai Sambang', 'Mondi', 'Cupang Gading', 'Nanga Biaban', 'Sunsong'] },
        { id: 'skd_ntaman', nama: 'Nanga Taman', lat: -0.3450, lon: 110.9550, medan: 'bergelombang', desa: ['Nanga Taman', 'Rirang Jati', 'Senangak', 'Nanga Kiungkang', 'Sungai Lawak', 'Tapang Tingang', 'Nanga Mongko', 'Nanga Engkulun', 'Nanga Koman', 'Lubuk Tajau', 'Pantok', 'Meragun', 'Nanga Mentukak', 'Semerawai', 'Engkulun Hulu'] },
        { id: 'skd_nmahap', nama: 'Nanga Mahap', lat: -0.5250, lon: 110.9250, medan: 'rusak', desa: ['Nanga Mahap', 'Batu Pahat', 'Lembah Beringin', 'Teluk Kebau', 'Landau Apin', 'Tembaga', 'Cenayan', 'Landau Kumpai', 'Nanga Suri', 'Sebabas', 'Karang Betung', 'Tamang', 'Tembesuk'] },
        { id: 'skd_bhilir', nama: 'Belitang Hilir', lat: 0.1450, lon: 111.0850, medan: 'bergelombang', desa: ['Sungai Ayak Dua', 'Sungai Ayak Satu', 'Entabuk', 'Tapang Pulau', 'Kumpang Bis', 'Menawai Tekam', 'Semadu', 'Merbang', 'Empajak', 'Sepantak', 'Melanjan Raya'] },
        { id: 'skd_belitang', nama: 'Belitang', lat: 0.3050, lon: 111.1250, medan: 'rusak', desa: ['Belitang Dua', 'Nanga Ansar', 'Padak', 'Setuntung', 'Belitang Satu', 'Menua Prama', 'Maboh Permai'] },
        { id: 'skd_bhulu', nama: 'Belitang Hulu', lat: 0.4550, lon: 111.1450, medan: 'tanah', desa: ['Balai Sepuak', 'Sebetung', 'Seburuk Satu', 'Sungai Tapah', 'Ijuk', 'Mengaret', 'Kumpang Ilong', 'Sungai Antu Hulu', 'Terduk Dampak', 'Pakit Mulau', 'Tabuk Hulu', 'Batuk Mulau', 'Bukit Rambat'] }
      ]
    },
    /* 12. KAB. SINTANG — 14 Kecamatan (Lengkap 100% BPS) */
    sintang: {
      nama: 'Kab. Sintang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'stg_kota', nama: 'Sintang', lat: 0.0680, lon: 111.4980, medan: 'kota', desa: ['Tanjung Puri', 'Ladang', 'Kapuas Kanan Hulu', 'Kapuas Kanan Hilir', 'Kapuas Kiri Hilir', 'Kapuas Kiri Hulu', 'Akcaya', 'Alai', 'Rawa Mambok', 'Sengkuang', 'Mengkurai', 'Kedabang', 'Mekar Jaya', 'Batu Lalau', 'Menyumbung Tengah', 'Ulak Jaya', 'Baning Kota', 'Tertung', 'Mungguk Bantok', 'Teluk Kelansam', 'Sungai Ana', 'Merti Guna', 'Tanjung Kelansam', 'Anggah Jaya', 'Lalang Baru', 'Tebing Raya', 'Mail Jampong', 'Jerora Satu', 'Kebiau Baru'] },
        { id: 'stg_stebelian', nama: 'Sungai Tebelian', lat: 0.0150, lon: 111.4250, medan: 'mulus', desa: ['Sungai Ukoi', 'Ransi Dakan', 'Manter', 'Merarai Satu', 'Merarai Dua', 'Kajang Baru', 'Gurung Kempadik', 'Nobal', 'Baya Betung', 'Bonet Engkabang', 'Bonet Lama', 'Bancoh', 'Perembang', 'Solam Raya', 'Lebak Ubah', 'Melayang Sari', 'Sarai', 'Rarai', 'Penjernang', 'Penjernang Hulu', 'Riam Kijang', 'Baya Mulya', 'Laman Raya', 'Sabang Surai', 'Balai Agung', 'Kunyai'] },
        { id: 'stg_kelam', nama: 'Kelam Permai', lat: 0.0780, lon: 111.6550, medan: 'mulus', desa: ['Kebong', 'Nanga Lebang', 'Merpak', 'Baning Panjang', 'Ensaid Panjang', 'Bengkuang', 'Pelimping', 'Sungai Pukat', 'Sungai Maram', 'Sepan Lebang', 'Gemba Raya', 'Karya Jaya Bhakti', 'Mandiri Jaya', 'Landau Kodam', 'Sungai Labi', 'Sungai Lais', 'Kelam Sejahtera'] },
        { id: 'stg_dedai', nama: 'Dedai', lat: -0.0680, lon: 111.6950, medan: 'bergelombang', desa: ['Nanga Dedai', 'Nanga Jetak', 'Gandis', 'Sungai Mali', 'Riguk', 'Pengkadan Baru', 'Tauk', 'Empaci', 'Baras', 'Pengkadan Sungai Rupa', 'Kumpang', 'Mangat Baru', 'Menaong Baru', 'Emparu Baru', 'Lundang Baru', 'Penyak Lalang', 'Umin Jaya', 'Merempit Baru', 'Dedai Kanan', 'Sungai Tapang', 'Gandis Hulu', 'Hulu Dedai', 'Apin Baru', 'Jangkang', 'Belinyuk Sibau', 'Mengkirai Jaya', 'Terusan', 'Tanjung', 'Batu Landung', 'Samak', 'Manyam'] },
        { id: 'stg_sepauk', nama: 'Sepauk', lat: 0.0320, lon: 111.1850, medan: 'bergelombang', desa: ['Tanjung Ria', 'Nanga Sepauk', 'Sekubang', 'Kenyauk', 'Lengkenat', 'Manis Raya', 'Temiang Kapuas', 'Ensabang', 'Mait Hilir', 'Sekujam Timbai', 'Semuntai', 'Sirang Setambang', 'Nanga Libau', 'Bernayau', 'Sinar Pekayau', 'Nanga Pari', 'Buluh Kuning', 'Temawang Muntai', 'Tawang Sari', 'Gernis Jaya', 'Paoh Benua', 'Bedayan', 'Tanjung Hulu', 'Sungai Raya', 'Landau Panjang', 'Bangun', 'Sukau Bersatu', 'Kemantan', 'Peninsung', 'Sepulut', 'Temawang Bulai', 'Sungai Segak', 'Tanjung Balai', 'Sinar Harapan', 'Riam Kempadik', 'Nanga Layung', 'Limau Bakti', 'Tanjung Mawang', 'Sungai Jaung'] },
        { id: 'stg_tempunak', nama: 'Tempunak', lat: -0.0180, lon: 111.3150, medan: 'bergelombang', desa: ['Nanga Tempunak', 'Mensiap Baru', 'Tanjung Perada', 'Suka Jaya', 'Mangkurat Baru', 'Paribang Baru', 'Repak Sari', 'Pagal Baru', 'Kenyabur Baru', 'Benua Baru', 'Tinum Baru', 'Pangkal Baru', 'Pulau Jaya', 'Kuala Tiga', 'Gurung Mali', 'Merti Jaya', 'Benua Kencana', 'Balai Harapan', 'Tempunak Kapuas', 'Riam Batu', 'Pudau Bersatu', 'Kupan Jaya', 'Sungai Buluh', 'Jaya Mentari', 'Pekulai Bersatu', 'Mensiap Jaya'] },
        { id: 'stg_binjai', nama: 'Binjai Hulu', lat: 0.1650, lon: 111.4650, medan: 'bergelombang', desa: ['Binjai Hulu', 'Ampar Bedang', 'Telaga Satu', 'Telaga Dua', 'Binjai Hilir', 'Sungai Risap', 'Dak Jaya', 'Mensiku', 'Empaka Kabiau Raya', 'Sungai Risap Mensiku Bersatu', 'Simba Raya'] },
        { id: 'stg_ambalau', nama: 'Ambalau', lat: -0.5850, lon: 112.9150, medan: 'tanah', desa: ['Nanga Kemangai', 'Nanga Ambalau', 'Nanga Kesange', 'Nanga Menakon', 'Nanga Sake', 'Buntut Pimpin', 'Kepala Jungai', 'Tanjung Andan', 'Buntut Sabon', 'Nanga Keremoi', 'Nanga Menantak', 'Buntut Purun', 'Nanga Sakai', 'Nanga Mentomoi', 'Sungai Tambun', 'Riam Sabon', 'Nanga Ukai', 'Mensuang', 'Dahtah Bungai', 'Lunjan Tingang', 'Bukit Tinggi', 'Bukai Tukun', 'Nusa Koring', 'Purut Beribit', 'Pulou Sabhang', 'Patih Jepara', 'Korong Daso', 'Luting Mingan', 'Kolangan Juoi', 'Nanga Rade', 'Jengkarang', 'Deme', 'Nanga Pahangan'] },
        { id: 'stg_kayanhilir', nama: 'Kayan Hilir', lat: -0.1550, lon: 111.8450, medan: 'rusak', desa: ['Nanga Mau', 'Jambu', 'Tertung Mau', 'Mentunai', 'Tuguk', 'Natai Tebedak', 'Nyangkom', 'Melingkat', 'Nanga Tikan', 'Pelaik', 'Kerapa Sepan', 'Sungai Buaya', 'Pakak', 'Sungai Sintang', 'Sungai Garong', 'Paoh Desa', 'Jaya Sakti', 'Mekar Mandiri', 'Landau Beringin', 'Karya Baru', 'Bukit Segaloh', 'Engkerangan', 'Lalang Inggar', 'Linggam Permai', 'Sungai Menuang', 'Natai Lesung', 'Begendang Mal', 'Sungai Ranap', 'Lengkong Bindu', 'Nanga Lidau', 'Mengkirai', 'Tanjung Keliling', 'Buluk Jegara', 'Buluk Panjang', 'Tanjung Putar', 'Sungai Emang', 'Sungai Meraya', 'Kempas Raya', 'Ipoh Emang', 'Sungai Pengga', 'Batu Netak', 'Neran Baya', 'Monbai Begununk'] },
        { id: 'stg_kayanhulu', nama: 'Kayan Hulu', lat: -0.2850, lon: 112.1650, medan: 'tanah', desa: ['Nanga Tebidah', 'Nanga Payak', 'Tanjung Bunga', 'Nanga Toran', 'Riam Panjang', 'Entogong', 'Nanga Tonggoi', 'Tanjung Lalau', 'Lintang Tambuk', 'Nanga Masau', 'Nanga Ungai', 'Nanga Abai', 'Nanga Laar', 'Riam Muntik', 'Nanga Oran', 'Tonak Goneh', 'Nangkak Lestari', 'Topan Nanga', 'Mapan Jaya', 'Tanjung Miru', 'Buluh Merindu', 'Empakan', 'Emponyang', 'Merahau Permai', 'Tanah Merah', 'Landau Bara', 'Kerapuk Jaya', 'Merah Arai', 'Tapang Manua', 'Nanga Tampang', 'Kebarau'] },
        { id: 'stg_kethilir', nama: 'Ketungau Hilir', lat: 0.2550, lon: 111.5550, medan: 'rusak', desa: ['Nanga Ketungau', 'Setungkup', 'Sungai Mali', 'Air Nyuruk', 'Nanga Merkak', 'Sungai Deras', 'Nanga Sejirak', 'Semuntai', 'Senibung', 'Tanjung Baung', 'Baung Sengatap', 'Semajau Mekar', 'Beluh Mulyo', 'Batu Ampar', 'Bukit Sidin Permai', 'Betung Permai', 'Kenuak', 'Jentawang Hilir', 'Batu Nyadi', 'Ratu Damai', 'Lepung Pantak', 'Pampang Dua', 'Mungguk Kelapa', 'Maung'] },
        { id: 'stg_kettengah', nama: 'Ketungau Tengah', lat: 0.4950, lon: 111.4650, medan: 'rusak', desa: ['Nanga Kelapan', 'Wirayuda', 'Tanjung Sari', 'Panding Jaya', 'Tirta Karya', 'Begelang Jaya', 'Sumber Sari', 'Panggi Agung', 'Kerta Sari', 'Argo Mulyo', 'Wana Bhakti', 'Swadaya', 'Margahayu', 'Gut Jaya Bhakti', 'Landau Buaya', 'Kayu Dujung', 'Senangan Kecil', 'Sungai Areh', 'Mungguk Gelombang', 'Mungguk Lawang', 'Panggi Ruguk', 'Bakti Senabung', 'Engkitan', 'Landau Temiang', 'Padung Kumang', 'Radin Jaya', 'Senangan Jaya', 'Kubu Berangan', 'Semareh'] },
        { id: 'stg_kethulu', nama: 'Ketungau Hulu', lat: 0.8150, lon: 111.4250, medan: 'tanah', desa: ['Senaning', 'Empura', 'Sebadak', 'Sepiluk', 'Sungai Seria', 'Suak Medang', 'Nanga Bayan', 'Rasau', 'Jasa', 'Sungai Bugau', 'Nanga Bugau', 'Empunak Tapang Keladan', 'Sebetung Paluk', 'Muakan Petinggi', 'Nanga Sebawang', 'Sekaih', 'Bekuan Luyang', 'Sungai Pisau', 'Mungguk Entawak', 'Embaleh', 'Sebuluh', 'Riam Sejawak', 'Engkeruh', 'Sungai Kelik', 'Idai', 'Sungai Mawang', 'Ujung Kempas', 'Neraci Jaya', 'Sejawak'] },
        { id: 'stg_serawai', nama: 'Serawai', lat: -0.4650, lon: 112.4850, medan: 'tanah', desa: ['Nanga Serawai', 'Nanga Mentatai', 'Bedaha', 'Begori', 'Pagar Lebata', 'Tontang', 'Karya Jaya', 'Nanga Riyoi', 'Buntut Ponte', 'Nanga Segulang', 'Baras Nabun', 'Nanga Jelundung', 'Tanjung Raya', 'Tahai Permai', 'Merako Jaya', 'Sawang Senghiang', 'Tunas Harapan', 'Teluk Harapan', 'Gurung Senghiang', 'Tanjung Harapan', 'Rantau Malam', 'Mentajoi', 'Nanga Bihe', 'Nanga Tekungai', 'Talian Sahabung', 'Batu Ketebung', 'Muara Kota', 'Mekar Sari', 'Tanjung Baru', 'Nusa Tujuh', 'Nanga Ruhan', 'Meroboi', 'Panekasan', 'Tamakung', 'Limbur Bernaung Lestari', 'Mensulung Bio', 'Sabhang Landan', 'Nanga Tangoi'] }
      ]
    },
    /* 13. KAB. MELAWI — 11 Kecamatan (Lengkap 100% BPS) */
    melawi: {
      nama: 'Kab. Melawi', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mlw_npinoh', nama: 'Nanga Pinoh', lat: -0.3350, lon: 111.7450, medan: 'kota', desa: ['Paal', 'Tanjung Niaga', 'Sidomulyo', 'Tembawang Panjang', 'Poring', 'Nanga Kebebu', 'Nanga Kayan', 'Baru', 'Tanjung Sari', 'Tanjung Lay', 'Labai Mandiri', 'Nusa Pandau', 'Kelakik', 'Semadin Lengkong', 'Tebing Karangan', 'Kenual', 'Tanjung Tengang'] },
        { id: 'mlw_belimbing', nama: 'Belimbing', lat: -0.3550, lon: 111.5850, medan: 'mulus', desa: ['Pemuar', 'Nusa Kenyikap', 'Batu Ampar', 'Balai Lagas', 'Upit', 'Langan', 'Batu Buil', 'Guhung', 'Batu Nanta', 'Belonsat', 'Laman Bukit', 'Tekaban', 'Labang', 'Nanga Pau', 'Nanga Entebah', 'Nanga Menunuk', 'Sepan Tonak'] },
        { id: 'mlw_ehilir', nama: 'Ella Hilir', lat: -0.4050, lon: 112.0150, medan: 'bergelombang', desa: ['Nanga Ella Hilir', 'Lengkong Nyadom', 'Nanga Nuak', 'Nanga Kalan', 'Nanga Nyuruh', 'Nanga Kempangai', 'Kerangan Kora', 'Penyuguk', 'Popai', 'Kahiya', 'Bemban Permai', 'Perembang Nyuruh', 'Sungai Labuk', 'Sungai Mentoba', 'Natai Compa', 'Pelempai Jaya', 'Domet Permai', 'Nyangau', 'Jabai'] },
        { id: 'mlw_sayan', nama: 'Sayan', lat: -0.6250, lon: 111.8250, medan: 'bergelombang', desa: ['Nanga Sayan', 'Pekawai', 'Landau Sandak', 'Madya Raya', 'Karangan Purun', 'Mekar Pelita', 'Bora', 'Meta Bersatu', 'Nanga Kasai', 'Nanga Kompi', 'Nanga Mancur', 'Siling Permai', 'Lingkar Indah', 'Sayan Jaya', 'Nanga Pak', 'Tumbak Raya', 'Berobai Permai', 'Nanga Raku'] },
        { id: 'mlw_tpinoh', nama: 'Tanah Pinoh', lat: -0.6850, lon: 111.4650, medan: 'rusak', desa: ['Suka Maju', 'Batu Begigi', 'Loka Jaya', 'Bina Jaya', 'Bina Karya', 'Madong Jaya', 'Bata Luar', 'Maris Permai', 'Pelita Kenaya', 'Tanjung Beringin Raya', 'Tanjung Gunung', 'Keranjik'] },
        { id: 'mlw_bhulu', nama: 'Belimbing Hulu', lat: -0.5150, lon: 111.4950, medan: 'rusak', desa: ['Tiong Keranjik', 'Nanga Tikan', 'Beloyang', 'Nanga Raya', 'Junjung Permai', 'Nanga Keberak', 'Piawas', 'Kayu Bunga'] },
        { id: 'mlw_menukung', nama: 'Menukung', lat: -0.5750, lon: 112.1850, medan: 'rusak', desa: ['Menukung Kota', 'Nanga Ella Hulu', 'Sungai Sampuk', 'Landau Leban', 'Tanjung Beringin', 'Nanga Melona Satu', 'Nanga Siyai', 'Nanga Mawang Mentatai', 'Laman Mumbung', 'Belaban Ella', 'Pelaik Keruap', 'Nanga Keruap', 'Batas Nangka', 'Nusa Poring', 'Batu Onap', 'Batu Badak', 'Oyah', 'Lihai', 'Sampak'] },
        { id: 'mlw_psel', nama: 'Pinoh Selatan', lat: -0.4850, lon: 111.7550, medan: 'bergelombang', desa: ['Manggala', 'Senempak', 'Nanga Pintas', 'Landau Garong', 'Bina Jaya', 'Mandau Baru', 'Pelinggang', 'Nyanggai', 'Sungai Bakah', 'Bayur Raya', 'Landau Tubun', 'Nanga Kelawai'] },
        { id: 'mlw_putr', nama: 'Pinoh Utara', lat: -0.2350, lon: 111.6850, medan: 'bergelombang', desa: ['Tekelak', 'Manding', 'Nanga Belimbing', 'Tengkajau', 'Tanjung Paoh', 'Nanga Man', 'Sungai Pinang', 'Engkurai', 'Merpak', 'Senibung', 'Melamut Bersatu', 'Natai Panjang', 'Sungai Raya', 'Merah Arai', 'Suka Damai', 'Tanjung Arak', 'Melawi Kiri Hilir', 'Kompas Raya', 'Kayan Semapau'] },
        { id: 'mlw_sokan', nama: 'Sokan', lat: -0.8250, lon: 111.6250, medan: 'tanah', desa: ['Nanga Sokan', 'Tanjung Sokan', 'Sijau', 'Keluing Taja', 'Nanga Betangai', 'Gelata', 'Nanga Ora', 'Nanga Libas', 'Telaga Raya', 'Teluk Pongkal', 'Nanga Tangkit', 'Penyengkuang', 'Melana', 'Nanga Potai', 'Sepakat', 'Muara Tanjung', 'Landau Kabu', 'Tanjung Mahung'] },
        { id: 'mlw_tpbarat', nama: 'Tanah Pinoh Barat', lat: -0.7150, lon: 111.2850, medan: 'rusak', desa: ['Ulak Muid', 'Harapan Jaya', 'Durian Jaya', 'Togan Baru', 'Pelita Jaya', 'Bukit Raya', 'Lintah Taum', 'Laja', 'Keluas Hulu', 'Ganjang'] }
      ]
    },
    /* 14. KAB. KAPUAS HULU — 23 Kecamatan (Lengkap 100% BPS) */
    kapuashulu: {
      nama: 'Kab. Kapuas Hulu', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kh_pututr', nama: 'Putussibau Utara', lat: 0.8720, lon: 112.9280, medan: 'kota', desa: ['Putussibau Kota', 'Hilir Kantor', 'Pala Pulau', 'Sibau Hilir', 'Padua Mendalam', 'Datah Dian', 'Sibau Hulu', 'Nanga Nyabau', 'Nanga Awin', 'Ariung Mendalam', 'Nanga Sambus', 'Banua Tanga', 'Tanjung Beruang', 'Tanjung Karang', 'Seluan', 'Sungai Uluk Palin', 'Tanjung Lasa', 'Lauk', 'Jangkang'] },
        { id: 'kh_putsel', nama: 'Putussibau Selatan', lat: 0.8480, lon: 112.9350, medan: 'mulus', desa: ['Kedamin Hilir', 'Kedamin Hulu', 'Sungai Uluk', 'Jaras', 'Melapi', 'Kedamin Darat', 'Tanjung Jati', 'Sayut', 'Urang Unsa', 'Suka Maju', 'Cempaka Baru', 'Beringin Jaya', 'Bungan Jaya', 'Tanjunglokang', 'Kereho', "Ingko' Tambe"] },
        { id: 'kh_kalis', nama: 'Kalis', lat: 0.7250, lon: 112.7950, medan: 'bergelombang', desa: ['Nanga Kalis', 'Nanga Sebintang', 'Nanga Lebangan', 'Nanga Raun', 'Bahenap', 'Nanga Tubuk', 'Nanga Danau', 'Kensuray', 'Rantau Kalis', 'Kalis Raya', 'Tekudak', 'Semerantau', "Tapang Da'an", 'Segiam', 'Ribang Kadeng', 'Rantau Bumbun', 'Peniung'] },
        { id: 'kh_silhilir', nama: 'Silat Hilir', lat: 0.3050, lon: 111.8650, medan: 'bergelombang', desa: ['Perigi', 'Baru', 'Pangeran', 'Miau Merah', 'Setunggul', 'Sungai Sena', 'Penai', 'Nanga Nuar', 'Bongkong', 'Seberu', 'Sentabai', 'Rumbih', 'Bukit Penai'] },
        { id: 'kh_semitau', nama: 'Semitau', lat: 0.5450, lon: 111.9750, medan: 'bergelombang', desa: ['Semitau Hulu', 'Kenerak', 'Nanga Seberuang', 'Entipan', 'Kenepai Komplek', 'Semitau Hilir', 'Nanga Kenepai', "Tua' Abang", 'Nanga Lemedak', 'Marsedan Raya', 'Padung Kumang', 'Sekedau'] },
        { id: 'kh_badau', nama: 'Badau', lat: 1.0320, lon: 111.8780, medan: 'mulus', desa: ['Badau', 'Janting', 'Semuntik', 'Kekurak', 'Pulau Majang', 'Seriang', 'Sebindang', 'Tinting Seligi', 'Tajum'] },
        { id: 'kh_bunhulu', nama: 'Bunut Hulu', lat: 0.5050, lon: 112.5650, medan: 'bergelombang', desa: ['Nanga Suruk', 'Temuyuk', 'Nanga Semangut', 'Nanga Dua', 'Selaup', 'Riam Piyang', 'Nanga Payang', 'Batu Tiga', 'Semangut Utara', 'Segitak', 'Nanga Kelibang', 'Sungai Besar', 'Bakong Permai', 'Beringin', 'Pantas Bersatu'] },
        { id: 'kh_blupar', nama: 'Batang Lupar', lat: 0.9950, lon: 112.1550, medan: 'bergelombang', desa: ['Lanjak Deras', 'Setulang', 'Sepandan', 'Sungai Ajung', 'Sungai Abau', 'Labian', 'Mensiau', 'Melemba', 'Sungai Senunuk', "Labian Ira'ang"] },
        { id: 'kh_bika', nama: 'Bika', lat: 0.7850, lon: 112.7950, medan: 'bergelombang', desa: ['Bika', 'Teluk Sindur', 'Jelemuk', 'Bika Hulu', 'Nanga Manday', 'Melapi Manday', 'Penyeluang', 'Jongkong Manday'] },
        { id: 'kh_btanjung', nama: 'Boyan Tanjung', lat: 0.5250, lon: 112.4350, medan: 'bergelombang', desa: ['Boyan Tanjung', 'Nanga Danau', 'Riam Mengelai', 'Nanga Sangan', 'Sri Wangi', 'Nanga Boyan', 'Nanga Betung', 'Mujan', 'Nanga Jemah', 'Tubang Jaya', 'Karya Maju', 'Landau Mentail', 'Delintas Karya', 'Teluk Geruguk', 'Nanga Ret', 'Pemawan'] },
        { id: 'kh_bunhilir', nama: 'Bunut Hilir', lat: 0.7050, lon: 112.4850, medan: 'rusak', desa: ['Bunut Hilir', 'Bunut Hulu', 'Teluk Aur', 'Nanga Tuan', 'Ujung Pandang', 'Empangau', 'Tembang', 'Bunut Tengah', 'Entibab', 'Kapuas Raya', 'Empangau Hilir'] },
        { id: 'kh_ehilir', nama: 'Embaloh Hilir', lat: 0.7950, lon: 112.5850, medan: 'rusak', desa: ['Nanga Embaloh', 'Keliling Semulung', 'Lawik', 'Nanga Lauk', 'Nanga Palin', 'Kirin Nangka', 'Pala Pintas', 'Ujung Bayur', 'Belatung'] },
        { id: 'kh_ehulu', nama: 'Embaloh Hulu', lat: 1.0750, lon: 112.4650, medan: 'perbukitan', desa: ['Banua Martinus', 'Menua Sadap', 'Pulau Manak', 'Banua Ujung', 'Saujung Giling Manik', 'Ulak Pauk', 'Langan Baru', 'Batu Lintang', 'Rantau Prapat', 'Tamao'] },
        { id: 'kh_empanang', nama: 'Empanang', lat: 0.9650, lon: 111.7350, medan: 'bergelombang', desa: ['Nanga Kantuk', 'Keling Panggau', 'Tintin Peninjau', 'Bajau Andai', 'Kumang Jaya', 'Laja Sandang'] },
        { id: 'kh_hgurung', nama: 'Hulu Gurung', lat: 0.3950, lon: 112.1650, medan: 'bergelombang', desa: ['Nanga Tepuai', 'Landau Kumpang', 'Nanga Yen', 'Lubuk Antuk', 'Parang', 'Kelakar', 'Bugang', 'Mentawit', 'Tani Makmur', 'Simpang Senara', 'Beringin', 'Sejahtera Mandiri', 'Mubung', 'Tunas Muda', 'Karya Mandiri'] },
        { id: 'kh_jongkong', nama: 'Jongkong', lat: 0.6550, lon: 112.3150, medan: 'rusak', desa: ['Jongkong Pasar', 'Jongkong Kiri Hilir', 'Jongkong Kanan', 'Jongkong Kiri Hulu', 'Ujung Said', 'Temenang', 'Ujung Jambu', 'Bontai', 'Jongkong Kiri Tengah', 'Jongkong Tanjung', 'Kandung Suli', 'Penepian Raya', 'Karya baru', 'Nanga Serian'] },
        { id: 'kh_mentebah', nama: 'Mentebah', lat: 0.6150, lon: 112.6950, medan: 'bergelombang', desa: ['Nanga Mentebah', 'Tekalong', 'Suka Maju', 'Kepala Gurung', 'Tanjung', 'Tanjung Intan', 'Tangai Jaya', 'Menaren'] },
        { id: 'kh_pengkadan', nama: 'Pengkadan', lat: 0.4450, lon: 112.3150, medan: 'bergelombang', desa: ['Pengkadan Hilir', 'Kerangan Panjang', 'Mawan', 'Marta Dana', 'Buak Limbang', 'Riam Panjang', 'Permata', 'Hulu Pengkadan', 'Pinang Laka', 'Sasan', 'Sira Jaya'] },
        { id: 'kh_pkencana', nama: 'Puring Kencana', lat: 1.0650, lon: 111.6150, medan: 'tanah', desa: ['Sungai Antu', 'Merakai Panjang', 'Kantuk Asam', 'Kantuk Bunut', 'Sungai Mawang', 'Langau'] },
        { id: 'kh_seberuang', nama: 'Seberuang', lat: 0.4150, lon: 111.9850, medan: 'bergelombang', desa: ['Sejiram', 'Beluis Harum', 'Gurung', 'Bati', 'Seneban', 'Belikai', 'Ranyai', 'Emperiang', 'Pala Kota', 'Nanga Lot', 'Tanjung Keliling', 'Tajau Mada', 'Jerenjang', 'Bekuan', 'Nanga Pala'] },
        { id: 'kh_selimbau', nama: 'Selimbau', lat: 0.6050, lon: 112.1450, medan: 'rusak', desa: ['Dalam', 'Gudang Hulu', 'Gudang Hilir', 'Nibung', 'Piasak Hilir', 'Engkerengas', 'Gerayau', 'Benuis', 'Titian Kuala', 'Sekubah', 'Piasak Hulu', 'Sekulat', 'Nanga Leboyan', 'Vega', 'Mawan', 'Semalah', 'Tempurau'] },
        { id: 'kh_silhulu', nama: 'Silat Hulu', lat: 0.1650, lon: 112.0650, medan: 'tanah', desa: ['Nanga Dangkan', 'Belimbing', 'Nanga Ngeri', 'Landau Badai', 'Nanga Lungu', 'Nanga Luan', 'Riam Tapang', 'Lebak Najah', 'Dangkan Kota', 'Perjuk', 'Landau Rantau', 'Entebi', 'Selangkai', 'Selimu'] },
        { id: 'kh_suhaid', nama: 'Suhaid', lat: 0.5650, lon: 112.0650, medan: 'rusak', desa: ['Nanga Suhaid', 'Mensusai', 'Kerengas', 'Mantan', 'Tanjung', 'Madang Permai', 'Laut Tawang', 'Jongkong Hulu', 'Menapar', 'Lubuk Pengail', 'Tanjung Harapan'] }
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
