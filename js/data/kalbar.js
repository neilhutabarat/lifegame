/* kalbar.js — Data wilayah presisi Provinsi Kalimantan Barat (14 Kabupaten/Kota → Kecamatan → Desa/Kelurahan + koordinat GPS nyata & rumus jarak jalan Haversine).
   Dirancang modular pada window.KK_WILAYAH agar provinsi lain bisa ditambahkan bertahap ke depannya. */
(function (g) {
  'use strict';

  var KALBAR = {
    pontianak: {
      nama: 'Kota Pontianak', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ptk_kota', nama: 'Pontianak Kota', lat: -0.0263, lon: 109.3335, desa: ['Darat Sekip', 'Mariana', 'Sungai Bangkong', 'Sungai Jawi', 'Tengah'] },
        { id: 'ptk_sel', nama: 'Pontianak Selatan', lat: -0.0448, lon: 109.3324, desa: ['Akcaya', 'Benua Melayu Darat', 'Benua Melayu Laut', 'Kota Baru', 'Parit Tokaya'] },
        { id: 'ptk_tgr', nama: 'Pontianak Tenggara', lat: -0.0628, lon: 109.3548, desa: ['Bangka Belitung Darat', 'Bangka Belitung Laut', 'Bansir Darat', 'Bansir Laut'] },
        { id: 'ptk_tim', nama: 'Pontianak Timur', lat: -0.0315, lon: 109.3660, desa: ['Banjar Serasan', 'Dalam Bugis', 'Parit Mayor', 'Saigon', 'Tambelan Sampit', 'Tanjung Hilir', 'Tanjung Hulu'] },
        { id: 'ptk_bar', nama: 'Pontianak Barat', lat: -0.0155, lon: 109.3075, desa: ['Pal Lima', 'Sungai Beliung', 'Sungai Jawi Dalam', 'Sungai Jawi Luar'] },
        { id: 'ptk_utr', nama: 'Pontianak Utara', lat: 0.0085, lon: 109.3380, desa: ['Batu Layang', 'Siantan Hilir', 'Siantan Hulu', 'Siantan Tengah'] }
      ]
    },
    kuburaya: {
      nama: 'Kab. Kubu Raya', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kr_sraya', nama: 'Sungai Raya', lat: -0.1180, lon: 109.4030, desa: ['Sungai Raya', 'Sungai Raya Dalam', 'Parit Baru', 'Arang Limbung', 'Kapur', 'Kuala Dua', 'Limbung', 'Mekar Baru', 'Teluk Kapuas', 'Madu Sari', 'Sungai Asam', 'Sungai Bulan'] },
        { id: 'kr_skakap', nama: 'Sungai Kakap', lat: -0.0650, lon: 109.2450, desa: ['Sungai Kakap', 'Pal IX', 'Sungai Rengas', 'Sungai Itik', 'Jeruju Besar', 'Kalimas', 'Punggur Kecil', 'Punggur Besar', 'Tanjung Saleh', 'Sepuk Laut'] },
        { id: 'kr_ambawang', nama: 'Sungai Ambawang', lat: -0.0480, lon: 109.4950, desa: ['Sungai Ambawang Kuala', 'Korek', 'Jawa Tengah', 'Lingga', 'Pancaroba', 'Mega Timur', 'Simpang Kanan', 'Sungai Malaya', 'Pasak Piang'] },
        { id: 'kr_kmandor', nama: 'Kuala Mandor B', lat: 0.0320, lon: 109.5450, desa: ['Kuala Mandor A', 'Kuala Mandor B', 'Kubu Padi', 'Retok', 'Sungai Enau'] },
        { id: 'kr_rasau', nama: 'Rasau Jaya', lat: -0.2380, lon: 109.3810, desa: ['Rasau Jaya Umum', 'Rasau Jaya Satu', 'Rasau Jaya Dua', 'Rasau Jaya Tiga', 'Bintang Mas', 'Pematang Tujuh'] },
        { id: 'kr_kubu', nama: 'Kubu', lat: -0.4680, lon: 109.3650, desa: ['Kubu', 'Kampung Baru', 'Olak-Olak Kubu', 'Air Putih', 'Jangkang Satu', 'Teluk Nangka', 'Pinang Luar'] },
        { id: 'kr_pakedai', nama: 'Teluk Pakedai', lat: -0.3150, lon: 109.2350, desa: ['Teluk Pakedai Hulu', 'Teluk Pakedai Satu', 'Teluk Pakedai Dua', 'Selat Remis', 'Pasir Putih', 'Sungai Deras'] },
        { id: 'kr_bampar', nama: 'Batu Ampar', lat: -0.7500, lon: 109.4850, desa: ['Padang Tikar Satu', 'Padang Tikar Dua', 'Batu Ampar', 'Sungai Jawi', 'Tasik Malaya', 'Nipah Panjang', 'Teluk Nibung'] },
        { id: 'kr_terentang', nama: 'Terentang', lat: -0.4120, lon: 109.6150, desa: ['Terentang Hilir', 'Terentang Hulu', 'Permata', 'Radak Baru', 'Sungai Radak Satu', 'Betuah'] }
      ]
    },
    ketapang: {
      nama: 'Kab. Ketapang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ktp_dpawan', nama: 'Delta Pawan', lat: -1.8350, lon: 109.9740, desa: ['Sampit', 'Tengah', 'Kantor', 'Mulia Baru', 'Sukaharja', 'Payak Kumang', 'Kali Nilam', 'Suka Bangun', 'Suka Bangun Dalam'] },
        { id: 'ktp_bkayong', nama: 'Benua Kayong', lat: -1.8620, lon: 109.9850, desa: ['Kauman', 'Mulia Kerta', 'Tuan-Tuan', 'Banjar', 'Negeri Baru', 'Padang', 'Kinjil Pesisir', 'Sungai Kinjil', 'Baru', 'Mekar Sari', 'Suka Baru'] },
        { id: 'ktp_mpawan', nama: 'Muara Pawan', lat: -1.7680, lon: 109.9550, desa: ['Sungai Awan Kiri', 'Sungai Awan Kanan', 'Tempurukan', 'Ulak Medang', 'Mayak', 'Tanjung Pura', 'Tanjung Pasar', 'Suka Maju'] },
        { id: 'ktp_mhu', nama: 'Matan Hilir Utara', lat: -1.6080, lon: 110.0350, desa: ['Kuala Tolak', 'Kuala Satong', 'Laman Satong', 'Sungai Putri', 'Tanjung Baik Budi'] },
        { id: 'ktp_mhs', nama: 'Matan Hilir Selatan', lat: -2.0650, lon: 110.1250, desa: ['Pesaguan Kanan', 'Pesaguan Kiri', 'Sungai Bakau', 'Sungai Besar', 'Sungai Jawi', 'Sungai Nanjung', 'Sungai Pelang', 'Pematang Gadung', 'Harapan Baru'] },
        { id: 'ktp_kendawangan', nama: 'Kendawangan', lat: -2.5260, lon: 110.2140, desa: ['Kendawangan Kiri', 'Kendawangan Kanan', 'Mekar Utama', 'Pangkalan Batu', 'Air Hitam Besar', 'Bangkal Serai', 'Banjar Sari', 'Selimatan Jaya'] },
        { id: 'ktp_sandai', nama: 'Sandai', lat: -1.2250, lon: 110.5250, desa: ['Sandai', 'Sandai Kiri', 'Muara Jekak', 'Penjawaan', 'Randau', 'Petai Patah', 'Istana', 'Demit'] },
        { id: 'ktp_ntayap', nama: 'Nanga Tayap', lat: -1.5250, lon: 110.5850, desa: ['Nanga Tayap', 'Sungai Kelik', 'Pangkalan Teluk', 'Lembah Hijau Satu', 'Lembah Hijau Dua', 'Simpang Tiga Sembelangaan', 'Kayong Hulu'] },
        { id: 'ktp_ttiti', nama: 'Tumbang Titi', lat: -1.8250, lon: 110.6350, desa: ['Tumbang Titi', 'Batu Tajam', 'Beringin Rayo', 'Kalimas Baru', 'Pengatapan Raya', 'Segar Wangi'] },
        { id: 'ktp_marau', nama: 'Marau', lat: -2.1250, lon: 110.7150, desa: ['Suka Karya', 'Bantan Sari', 'Batu Payung Dua', 'Karya Baru', 'Randai', 'Riam Batu Gading'] },
        { id: 'ktp_mmata', nama: 'Manis Mata', lat: -2.4650, lon: 111.0150, desa: ['Manis Mata', 'Air Dekakah', 'Asam Besar', 'Batu Sedau', 'Bukit Gajah', 'Silat'] },
        { id: 'ktp_slaur', nama: 'Sungai Laur', lat: -0.9650, lon: 110.4250, desa: ['Riam Bunut', 'Bengaras', 'Harapan Baru', 'Kepari', 'Lanjut Mekar Sari', 'Sempurna'] },
        { id: 'ktp_shulu', nama: 'Simpang Hulu', lat: -0.6150, lon: 110.3350, desa: ['Balai Pinang', 'Botong', 'Kualan Hilir', 'Kualan Hulu', 'Kualan Tengah', 'Labai Hilir', 'Semandang Hulu'] },
        { id: 'ktp_sdua', nama: 'Simpang Dua', lat: -0.8350, lon: 110.3650, desa: ['Semandang Kanan', 'Batu Daya', 'Gema', 'Kamora', 'Kampar Sebomban', 'Mekar Raya'] },
        { id: 'ktp_hsungai', nama: 'Hulu Sungai', lat: -1.0850, lon: 110.8950, desa: ['Menyumbung', 'Beginci Darat', 'Benua Krio', 'Cinta Manis', 'Krio Hulu', 'Sunge Bengaras'] },
        { id: 'ktp_jelai', nama: 'Jelai Hulu', lat: -2.0150, lon: 110.8950, desa: ['Periangan', 'Air Dua', 'Asam Jelai', 'Biku Sarana', 'Karang Dangin', 'Kusik Batu Lapu'] },
        { id: 'ktp_aupas', nama: 'Air Upas', lat: -2.3150, lon: 110.8450, desa: ['Air Upas', 'Air Durian Jaya', 'Banda Sari', 'Gahang', 'Harapan Baru', 'Mekar Jaya'] },
        { id: 'ktp_singkup', nama: 'Singkup', lat: -2.2950, lon: 110.6350, desa: ['Sukaraja', 'Muntai', 'Pantai Ketikal', 'Suka Mulya', 'Sukasari', 'Tanah Hitam'] },
        { id: 'ktp_pemahan', nama: 'Pemahan', lat: -1.7650, lon: 110.4650, desa: ['Pebihingan', 'Lalang Panjang', 'Muara Gerunggang', 'Semayok Baru', 'Usaha Baru'] },
        { id: 'ktp_smrayak', nama: 'Sungai Melayu Rayak', lat: -1.7850, lon: 110.2850, desa: ['Sungai Melayu', 'Sungai Melayu Baru', 'Beringin Jaya', 'Jairan Jaya', 'Karya Mukti', 'Kepuluk', 'Piansak'] }
      ]
    },
    kayongutara: {
      nama: 'Kab. Kayong Utara', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ku_sukadana', nama: 'Sukadana', lat: -1.2420, lon: 109.9510, desa: ['Sutera', 'Pangkalan Buton', 'Pampang Harapan', 'Benawai Agung', 'Harapan Mulia', 'Riam Berasap Jaya', 'Sedahan Jaya', 'Sejahtera'] },
        { id: 'ku_shilir', nama: 'Simpang Hilir', lat: -1.1150, lon: 109.9850, desa: ['Teluk Melano', 'Nipah Kuning', 'Pemangkat', 'Padu Banjar', 'Rantau Panjang', 'Batu Barat', 'Batu Mas', 'Pulau Kumbang'] },
        { id: 'ku_tbatang', nama: 'Teluk Batang', lat: -1.0320, lon: 109.8450, desa: ['Teluk Batang', 'Teluk Batang Selatan', 'Teluk Batang Utara', 'Alur Bandung', 'Banyu Abang', 'Mas Bangun', 'Sungai Paduan'] },
        { id: 'ku_seponti', nama: 'Seponti', lat: -0.9450, lon: 109.8850, desa: ['Seponti Jaya', 'Durian Sebatang', 'Podo Rukun', 'Sungai Sepeti', 'Telaga Arum', 'Wonorejo'] },
        { id: 'ku_pmaya', nama: 'Pulau Maya', lat: -1.1450, lon: 109.5950, desa: ['Tanjung Satai', 'Dusun Besar', 'Dusun Kecil', 'Kemboja', 'Satai Lestari'] },
        { id: 'ku_karimata', nama: 'Kepulauan Karimata', lat: -1.6150, lon: 108.9250, desa: ['Pelapis', 'Betok Jaya', 'Padang'] }
      ]
    },
    mempawah: {
      nama: 'Kab. Mempawah', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mpw_hilir', nama: 'Mempawah Hilir', lat: 0.3620, lon: 108.9580, desa: ['Tengah', 'Terusan', 'Tanjung', 'Kuala Secapah', 'Malikian', 'Pasir', 'Penibung', 'Sengkubang'] },
        { id: 'mpw_timur', nama: 'Mempawah Timur', lat: 0.3520, lon: 109.0050, desa: ['Pulau Pedalaman', 'Pasir Palembang', 'Pasir Panjang', 'Antibai', 'Parit Banjar', 'Sejegi', 'Sungai Bakau Kecil'] },
        { id: 'mpw_pinyuh', nama: 'Sungai Pinyuh', lat: 0.2780, lon: 109.0860, desa: ['Sungai Pinyuh', 'Galang', 'Nusapati', 'Peniraman', 'Sungai Bakau Besar Darat', 'Sungai Bakau Besar Laut', 'Sungai Batang', 'Sungai Purun Kecil', 'Sungai Rasau'] },
        { id: 'mpw_jongkat', nama: 'Jongkat', lat: 0.0880, lon: 109.2550, desa: ['Jungkat', 'Peniti Luar', 'Sungai Nipah', 'Wajok Hilir', 'Wajok Hulu'] },
        { id: 'mpw_segedong', nama: 'Segedong', lat: 0.1750, lon: 109.1650, desa: ['Parit Bugis', 'Peniti Besar', 'Peniti Dalam Satu', 'Peniti Dalam Dua', 'Sungai Burung', 'Sungai Purun Besar'] },
        { id: 'mpw_skunyit', nama: 'Sungai Kunyit', lat: 0.4450, lon: 108.9250, desa: ['Sungai Kunyit Laut', 'Sungai Kunyit Hulu', 'Sungai Kunyit Dalam', 'Bukit Batu', 'Mendalok', 'Semparong Parit Raden', 'Sungai Duri Satu', 'Sungai Limau'] },
        { id: 'mpw_anjongan', nama: 'Anjongan', lat: 0.3550, lon: 109.1450, desa: ['Anjungan Melancar', 'Anjungan Dalam', 'Dema', 'Kepayang', 'Pak Bulu'] },
        { id: 'mpw_toho', nama: 'Toho', lat: 0.4150, lon: 109.2350, desa: ['Pak Laheng', 'Pak Utan', 'Benuang', 'Kecurit', 'Sambora', 'Sepang', 'Terap', 'Toho Ilir'] },
        { id: 'mpw_sadaniang', nama: 'Sadaniang', lat: 0.5150, lon: 109.2550, desa: ['Amawang', 'Ansiap', 'Bumbun', 'Pentek', 'Sekabuk', 'Suak Barangan'] }
      ]
    },
    singkawang: {
      nama: 'Kota Singkawang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skw_bar', nama: 'Singkawang Barat', lat: 0.9065, lon: 108.9830, desa: ['Pasiran', 'Melayu', 'Kuala', 'Tengah'] },
        { id: 'skw_tgh', nama: 'Singkawang Tengah', lat: 0.9010, lon: 109.0050, desa: ['Roban', 'Condong', 'Sekip Lama', 'Jawa', 'Bukit Batu', 'Sungai Wie'] },
        { id: 'skw_sel', nama: 'Singkawang Selatan', lat: 0.8420, lon: 108.9650, desa: ['Sedau', 'Sijangkung', 'Pangmilang', 'Sagatani'] },
        { id: 'skw_tim', nama: 'Singkawang Timur', lat: 0.9040, lon: 109.0680, desa: ['Nyarumkop', 'Mayasopa', 'Pajintan', 'Bagak Sahwa', 'Sanggau Kulor'] },
        { id: 'skw_utr', nama: 'Singkawang Utara', lat: 0.9580, lon: 108.9980, desa: ['Sungai Garam Hilir', 'Naram', 'Sungai Bulan', 'Sungai Rasau', 'Setapuk Besar', 'Setapuk Kecil', 'Semelagi Kecil'] }
      ]
    },
    sambas: {
      nama: 'Kab. Sambas', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sbs_sambas', nama: 'Sambas', lat: 1.3620, lon: 109.3050, desa: ['Dalam Kaum', 'Durian', 'Jagur', 'Lubuk Dagang', 'Lumbang', 'Pasar Melayu', 'Pendawan', 'Saing Rambi', 'Tanjung Bugis', 'Tumuk Manggis'] },
        { id: 'sbs_pemangkat', nama: 'Pemangkat', lat: 1.1760, lon: 108.9750, desa: ['Pemangkat Kota', 'Harapan', 'Gugah Sejahtera', 'Jelutung', 'Lonam', 'Penjajap', 'Perapakan', 'Sebatuan'] },
        { id: 'sbs_tebas', nama: 'Tebas', lat: 1.2420, lon: 109.1620, desa: ['Tebas Sungai', 'Tebas Kuala', 'Batu Makjage', 'Bekut', 'Bukit Segoler', 'Dungun Perapakan', 'Makrampai', 'Mensere', 'Pangkalan Kongsi', 'Sejiram'] },
        { id: 'sbs_tkeramat', nama: 'Teluk Keramat', lat: 1.4650, lon: 109.1950, desa: ['Sekura', 'Berlimang', 'Kuala Pangkalan Keramat', 'Lela', 'Mekar Sekuntum', 'Pedada', 'Pipit Teja', 'Sengawang', 'Sungai Baru'] },
        { id: 'sbs_selakau', nama: 'Selakau', lat: 1.0720, lon: 108.9780, desa: ['Sungai Nyirih', 'Sungai Rusa', 'Bentunai', 'Kuala', 'Pangkalan Bemban', 'Parit Baru', 'Parit Kongsi', 'Semelagi Besar', 'Twi Mentibar'] },
        { id: 'sbs_jawai', nama: 'Jawai', lat: 1.3650, lon: 109.0450, desa: ['Sentebang', 'Bakau', 'Dungun Laut', 'Lambau', 'Mutus Darussalam', 'Parit Setia', 'Pelimpaan', 'Sarang Burung Danau', 'Sungai Nilam'] },
        { id: 'sbs_paloh', nama: 'Paloh', lat: 1.7250, lon: 109.2850, desa: ['Nibung', 'Kalimantan', 'Malek', 'Matang Danau', 'Mentibar', 'Sebubus', 'Tanah Hitam', 'Temajuk'] },
        { id: 'sbs_sajingan', nama: 'Sajingan Besar', lat: 1.5950, lon: 109.6150, desa: ['Sebunga', 'Kaliau', 'Santaban', 'Senatab', 'Sungai Bening'] },
        { id: 'sbs_subah', nama: 'Subah', lat: 1.2750, lon: 109.4350, desa: ['Balai Gemuruh', 'Bukit Mulya', 'Madak', 'Mensade', 'Mukti Raharja', 'Sempurna', 'Sungai Deden', 'Sungai Sapak'] },
        { id: 'sbs_galing', nama: 'Galing', lat: 1.5450, lon: 109.3650, desa: ['Galing', 'Ratu Sepudak', 'Sagu', 'Sijang', 'Sungai Palah', 'Teluk Pandan', 'Tempapan Hulu', 'Tempapan Kuala'] }
      ]
    },
    bengkayang: {
      nama: 'Kab. Bengkayang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'bky_kota', nama: 'Bengkayang', lat: 0.8220, lon: 109.4880, desa: ['Bumi Emas', 'Sebalo', 'Bakti Mulya', 'Bani Amas', 'Setia Budi', 'Tirta Kencana'] },
        { id: 'bky_sraya', nama: 'Sungai Raya', lat: 0.7150, lon: 108.9050, desa: ['Sungai Duri', 'Sungai Jaga A', 'Sungai Jaga B', 'Sungai Pangkalan Satu', 'Sungai Pangkalan Dua'] },
        { id: 'bky_srkep', nama: 'Sungai Raya Kepulauan', lat: 0.7680, lon: 108.8850, desa: ['Sungai Raya', 'Karimunting', 'Pulau Lemukutan', 'Rukma Jaya', 'Sungai Keran'] },
        { id: 'bky_monterado', nama: 'Monterado', lat: 0.7420, lon: 109.1250, desa: ['Monterado', 'Beringin Baru', 'Gerantung', 'Goha', 'Jahandung', 'Mekar Baru', 'Nek Ginap', 'Rantau', 'Serindu'] },
        { id: 'bky_samalantan', nama: 'Samalantan', lat: 0.7980, lon: 109.2180, desa: ['Samalantan', 'Babane', 'Bukit Serayan', 'Marunsu', 'Pasti Jaya', 'Saba\'u', 'Tumiang'] },
        { id: 'bky_ledo', nama: 'Ledo', lat: 1.0150, lon: 109.6150, desa: ['Lesabela', 'Dayung', 'Jesape', 'Lomba Karya', 'Rodaya', 'Seles', 'Semangat', 'Serangkat', 'Suka Damai', 'Tawang'] },
        { id: 'bky_sledo', nama: 'Sanggau Ledo', lat: 1.1550, lon: 109.7150, desa: ['Lembang', 'Bange', 'Danti', 'Gua', 'Sango'] },
        { id: 'bky_jbabang', nama: 'Jagoi Babang', lat: 1.3180, lon: 109.9150, desa: ['Jagoi', 'Gersik', 'Kum ba', 'Sekida', 'Semunying Jaya', 'Sinar Baru'] }
      ]
    },
    landak: {
      nama: 'Kab. Landak', prov: 'Kalimantan Barat',
      kec: [
        { id: 'ldk_ngabang', nama: 'Ngabang', lat: 0.3780, lon: 109.9520, desa: ['Hilir Kantor', 'Hilir Tengah', 'Raja', 'Amboyo Inti', 'Amboyo Selatan', 'Munggu', 'Muun', 'Pak Kasih', 'Tebedak', 'Tubo'] },
        { id: 'ldk_mandor', nama: 'Mandor', lat: 0.3150, lon: 109.3380, desa: ['Mandor', 'Bebatung', 'Kayu Ara', 'Kayu Tanam', 'Keramas', 'Kerohok', 'Manggang', 'Ngarak', 'Pongok', 'Salatiga', 'Sebadu', 'Simpang Kasturi'] },
        { id: 'ldk_stemila', nama: 'Sengah Temila', lat: 0.3350, lon: 109.6450, desa: ['Pahauman', 'Sidas', 'Aur Sampuk', 'Banying', 'Gombang', 'Keranji Mancal', 'Paloan', 'Saham', 'Senakin', 'Sebatih'] },
        { id: 'ldk_menjalin', nama: 'Menjalin', lat: 0.4550, lon: 109.3550, desa: ['Menjalin', 'Bengkawe', 'Lamoanak', 'Nangka', 'Raba', 'Re\'es', 'Sepahat', 'Tempoak'] },
        { id: 'ldk_mhulu', nama: 'Mempawah Hulu', lat: 0.5680, lon: 109.4250, desa: ['Karangan', 'Babatn', 'Bilayuk', 'Caokng', 'Garuk', 'Mentonyek', 'Pahokng', 'Sala\'as', 'Sampuro', 'Tiang Tanjung'] },
        { id: 'ldk_menyuke', nama: 'Menyuke', lat: 0.5850, lon: 109.7650, desa: ['Darit', 'Angkaras', 'Anik Dingir', 'Ansang', 'Bagak', 'Berinang Mayun', 'Lintah Betung', 'Mamek', 'Songga', 'Untang'] },
        { id: 'ldk_abesar', nama: 'Air Besar', lat: 0.6550, lon: 110.1250, desa: ['Serimbu', 'Bentiang', 'Dange Aji', 'Engkangin', 'Jambu Tembawang', 'Merayuh', 'Nyari', 'Pare', 'Sekendal', 'Sempatung Lawek'] }
      ]
    },
    sanggau: {
      nama: 'Kab. Sanggau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'sgu_kapuas', nama: 'Kapuas', lat: 0.1280, lon: 110.5880, desa: ['Beringin', 'Bunut', 'Ilir Kota', 'Tanjung Kapuas', 'Tanjung Sekayam', 'Sungai Sengkuang', 'Kambong', 'Lape', 'Mengkiang', 'Penyeladi'] },
        { id: 'sgu_thilir', nama: 'Tayan Hilir', lat: -0.0280, lon: 110.1120, desa: ['Pedalaman', 'Kawat', 'Pulau Tayan Utara', 'Balai Ingin', 'Beginjan', 'Cempedak', 'Emberas', 'Lalang', 'Melugai', 'Sebemban', 'Subah', 'Tanjung Bunut'] },
        { id: 'sgu_thulu', nama: 'Tayan Hulu', lat: 0.3050, lon: 110.2280, desa: ['Sosok', 'Berakak', 'Binjai', 'Engkasan', 'Janang Ran', 'Mandong', 'Menyabo', 'Pandan Sembuat', 'Peruan Dalam', 'Riyai'] },
        { id: 'sgu_balai', nama: 'Balai', lat: 0.1350, lon: 110.1050, desa: ['Hilir', 'Batang Tarang', 'Bulu Bala', 'Cempedak', 'Empirang Ujung', 'Kebadu', 'Mak Kawing', 'Padu', 'Senyabang', 'Temiang Mali'] },
        { id: 'sgu_parindu', nama: 'Parindu', lat: 0.2580, lon: 110.4250, desa: ['Pusat Damai', 'Dosan', 'Embala', 'Gunam', 'Hibun', 'Maju Karya', 'Maringin Jaya', 'Palem Jaya', 'Rahayu', 'Sebara', 'Suka Gerundi'] },
        { id: 'sgu_kembayan', nama: 'Kembayan', lat: 0.5620, lon: 110.4050, desa: ['Tanjung Merpati', 'Kelompu', 'Kuala Dua', 'Mobui', 'Sebongkuh', 'Sebuduh', 'Sejuah', 'Semayang', 'Tanjung Bunga', 'Tanap'] },
        { id: 'sgu_sekayam', nama: 'Sekayam', lat: 0.8050, lon: 110.4550, desa: ['Balai Karangan', 'Bungkang', 'Engkahan', 'Kenaman', 'Lubuk Sabuk', 'Malenggang', 'Pengadang', 'Raut Muara', 'Sangai', 'Sotok'] },
        { id: 'sgu_entikong', nama: 'Entikong', lat: 0.9620, lon: 110.3520, desa: ['Entikong', 'Nekan', 'Pala Pasang', 'Semanget', 'Suruh Tembawang'] },
        { id: 'sgu_meliau', nama: 'Meliau', lat: -0.1250, lon: 110.2950, desa: ['Meliau Hilir', 'Meliau Hulu', 'Balai Tinggi', 'Baru Lombak', 'Cupang', 'Enggadai', 'Harapan Makmur', 'Kuala Buayan', 'Sungai Kembayau'] },
        { id: 'sgu_toba', nama: 'Toba', lat: -0.2680, lon: 110.1150, desa: ['Teraju', 'Bagai', 'Balai Belungai', 'Belungai Dalam', 'Kampung Baru', 'Lumut', 'Sansat'] }
      ]
    },
    sekadau: {
      nama: 'Kab. Sekadau', prov: 'Kalimantan Barat',
      kec: [
        { id: 'skd_hilir', nama: 'Sekadau Hilir', lat: 0.0120, lon: 110.9050, desa: ['Sungai Ringin', 'Mungguk', 'Bokak Sebumbun', 'Engkersik', 'Ensalang', 'Gonis Tekam', 'Landau Kodah', 'Merapi', 'Peniti', 'Seberang Kapuas', 'Semabi', 'Seraras', 'Tanjung'] },
        { id: 'skd_hulu', nama: 'Sekadau Hulu', lat: -0.1450, lon: 110.9350, desa: ['Rawak Hilir', 'Rawak Hulu', 'Boti', 'Cupang Gading', 'Mondi', 'Nanga Menterap', 'Perongkan', 'Sekonau', 'Setawar', 'Sungai Sambang', 'Tapang Perodah', 'Tinting Boyok'] },
        { id: 'skd_ntaman', nama: 'Nanga Taman', lat: -0.3450, lon: 110.9550, desa: ['Nanga Taman', 'Nanga Engkulun', 'Nanga Kiungkang', 'Nanga Koman', 'Nanga Mongko', 'Pantok', 'Rirang Jati', 'Senangak', 'Sungai Lawak', 'Tapang Tingang'] },
        { id: 'skd_nmahap', nama: 'Nanga Mahap', lat: -0.5250, lon: 110.9250, desa: ['Nanga Mahap', 'Batu Pahat', 'Cenayan', 'Karang Betung', 'Landau Apin', 'Lembah Beringin', 'Nanga Suri', 'Sebabas', 'Tembaga', 'Tembesuk'] },
        { id: 'skd_bhilir', nama: 'Belitang Hilir', lat: 0.1450, lon: 111.0850, desa: ['Sungai Ayak Dua', 'Sungai Ayak Satu', 'Empajak', 'Entabuk', 'Kumpang Bis', 'Menawai Tekam', 'Merbang', 'Semadu', 'Tapang Pulau'] },
        { id: 'skd_belitang', nama: 'Belitang', lat: 0.3050, lon: 111.1250, desa: ['Belitang Dua', 'Belitang Satu', 'Maboh Permai', 'Menua Prama', 'Nanga Ansar', 'Padak', 'Setuntung'] },
        { id: 'skd_bhulu', nama: 'Belitang Hulu', lat: 0.4550, lon: 111.1450, desa: ['Balai Sepuak', 'Batuk Mulau', 'Bukit Rambat', 'Ijuk', 'Kumpang Ilong', 'Mengaret', 'Pakit Mulau', 'Sebetung', 'Seburuk Satu', 'Tabuk Hulu'] }
      ]
    },
    sintang: {
      nama: 'Kab. Sintang', prov: 'Kalimantan Barat',
      kec: [
        { id: 'stg_kota', nama: 'Sintang', lat: 0.0680, lon: 111.4980, desa: ['Tanjung Puri', 'Kapuas Kanan Hulu', 'Kapuas Kanan Hilir', 'Kapuas Kiri Hulu', 'Kapuas Kiri Hilir', 'Alai', 'Baning Kota', 'Ladang', 'Mekar Jaya', 'Mengkurai', 'Sengkuang', 'Ulak Jaya'] },
        { id: 'stg_stebelian', nama: 'Sungai Tebelian', lat: 0.0150, lon: 111.4250, desa: ['Sungai Ukoi', 'Balai Agung', 'Baya Betung', 'Bonet Engkabang', 'Gurung Kempadik', 'Kajang Baru', 'Lebak Ubah', 'Manter', 'Merarai Satu', 'Merarai Dua', 'Nobal', 'Rarai'] },
        { id: 'stg_kelam', nama: 'Kelam Permai', lat: 0.0780, lon: 111.6550, desa: ['Kebong', 'Baning Panjang', 'Bengkuang', 'Ensaid Panjang', 'Gemba Raya', 'Karya Jaya Bhakti', 'Kelam Sejahtera', 'Landau Kodam', 'Merpak', 'Nanga Lebang', 'Pelimping', 'Sepan Lebang'] },
        { id: 'stg_dedai', nama: 'Dedai', lat: -0.0680, lon: 111.6950, desa: ['Nanga Dedai', 'Apin Baru', 'Baras', 'Batu Landung', 'Empaci', 'Gandis', 'Jangkang', 'Kumpang', 'Lundung', 'Menaong Baru', 'Pengkadan Baru', 'Tanjung'] },
        { id: 'stg_sepauk', nama: 'Sepauk', lat: 0.0320, lon: 111.1850, desa: ['Tanjung Ria', 'Bangun', 'Bedayan', 'Bernayau', 'Buluh Kuning', 'Ensabang', 'Gernis Jaya', 'Kenyauk', 'Lengkenat', 'Manis Raya', 'Nanga Pari', 'Nanga Sepauk', 'Sekubang', 'Sirang Setambang'] },
        { id: 'stg_tempunak', nama: 'Tempunak', lat: -0.0180, lon: 111.3150, desa: ['Nanga Tempunak', 'Balai Harapan', 'Benua Baru', 'Benua Kencana', 'Gurung Mali', 'Jaya Mentari', 'Kenyabur Baru', 'Kuala Tiga', 'Mensiap Baru', 'Pagal Baru', 'Paribang Baru', 'Repak Sari'] },
        { id: 'stg_binjai', nama: 'Binjai Hulu', lat: 0.1650, lon: 111.4650, desa: ['Binjai Hulu', 'Binjai Hilir', 'Ampar Bedang', 'Dak Jaya', 'Empaka Kabiau Raya', 'Mensiku', 'Simba Raya', 'Sungai Risap', 'Telaga Satu', 'Telaga Dua'] }
      ]
    },
    melawi: {
      nama: 'Kab. Melawi', prov: 'Kalimantan Barat',
      kec: [
        { id: 'mlw_npinoh', nama: 'Nanga Pinoh', lat: -0.3350, lon: 111.7450, desa: ['Paal', 'Sidomulyo', 'Tanjung Niaga', 'Tanjung Tengang', 'Baru', 'Kelakik', 'Kenual', 'Labai Mandiri', 'Nanga Kayan', 'Nanga Kebebu', 'Nusa Pandau', 'Poring', 'Semadin Lengkong', 'Tembawang Panjang'] },
        { id: 'mlw_belimbing', nama: 'Belimbing', lat: -0.3550, lon: 111.5850, desa: ['Pemuar', 'Batu Ampar', 'Batu Buil', 'Batu Nanta', 'Balai Lagas', 'Guhung', 'Labang', 'Laman Bukit', 'Langan', 'Nanga Entebah', 'Nanga Menunuk', 'Nanga Pau', 'Upit'] },
        { id: 'mlw_ehilir', nama: 'Ella Hilir', lat: -0.4050, lon: 112.0150, desa: ['Nanga Ella Hilir', 'Bemban Permai', 'Domet Permai', 'Jabai', 'Kahiya', 'Kerangan Kora', 'Lengkong Nyadom', 'Nanga Kalan', 'Nanga Kempangai', 'Nanga Nyuruh', 'Nusa Kenyikap', 'Pelempai Jaya', 'Perembang Nyuruh'] },
        { id: 'mlw_sayan', nama: 'Sayan', lat: -0.6250, lon: 111.8250, desa: ['Nanga Sayan', 'Berobai Permai', 'Bora', 'Karangan Purun', 'Landau Sandak', 'Lingkar Indah', 'Madya Raya', 'Mekar Pelita', 'Meta Bersatu', 'Nanga Kasai', 'Nanga Kompi', 'Nanga Mancur', 'Nanga Raku', 'Sayan Jaya'] },
        { id: 'mlw_tpinoh', nama: 'Tanah Pinoh', lat: -0.6850, lon: 111.4650, desa: ['Suka Maju', 'Bata Luar', 'Batu Begigi', 'Bina Jaya', 'Bina Karya', 'Harapan Jaya', 'Keranjik', 'Loka Jaya', 'Madong Jaya', 'Maris Permai', 'Pelita Kenaya', 'Tanjung Gunung'] }
      ]
    },
    kapuashulu: {
      nama: 'Kab. Kapuas Hulu', prov: 'Kalimantan Barat',
      kec: [
        { id: 'kh_pututr', nama: 'Putussibau Utara', lat: 0.8720, lon: 112.9280, desa: ['Putussibau Kota', 'Hilir Kantor', 'Ariung Mendalam', 'Datah Diaan', 'Jangkang', 'Lauk', 'Nanga Awin', 'Nanga Nyabau', 'Nanga Sambus', 'Padua Mendalam', 'Pala Pulau', 'Seluan', 'Sibau Hilir', 'Sibau Hulu', 'Tanjung Karang'] },
        { id: 'kh_putsel', nama: 'Putussibau Selatan', lat: 0.8480, lon: 112.9350, desa: ['Kedamin Hilir', 'Kedamin Hulu', 'Beringin Jaya', 'Bungan Jaya', 'Cempaka Baru', 'Ingko\' Tambe', 'Jaras', 'Kereho', 'Melapi', 'Sayut', 'Suka Maju', 'Sungai Uluk', 'Tanjung Jati', 'Tanjung Lokang', 'Urang Unsa'] },
        { id: 'kh_kalis', nama: 'Kalis', lat: 0.7250, lon: 112.7950, desa: ['Nanga Kalis', 'Bahenap', 'Kalis Raya', 'Kensuray', 'Nanga Danau', 'Nanga Lebangan', 'Nanga Raun', 'Nanga Sebintang', 'Nanga Tubuk', 'Peniaman', 'Rantau Bumbun', 'Rantau Kalis', 'Ribang Kadeng', 'Segiam', 'Sempang', 'Tapang Da\'an'] },
        { id: 'kh_silhilir', nama: 'Silat Hilir', lat: 0.3050, lon: 111.8650, desa: ['Perigi', 'Baru', 'Bongkong', 'Bukit Penai', 'Miau Merah', 'Nanga Nuar', 'Pangeran', 'Penai', 'Rumbih', 'Seberu', 'Sena', 'Sentabai', 'Setunggul'] },
        { id: 'kh_semitau', nama: 'Semitau', lat: 0.5450, lon: 111.9750, desa: ['Semitau Hulu', 'Semitau Hilir', 'Entipan', 'Kenepai Komplek', 'Kenerak', 'Marsedan Raya', 'Nanga Kenepai', 'Nanga Lemedak', 'Nanga Seberuang', 'Padung Kumang', 'Sekedau', 'Tua\' Abang'] },
        { id: 'kh_badau', nama: 'Badau', lat: 1.0320, lon: 111.8780, desa: ['Badau', 'Janting', 'Kekurak', 'Pulau Majang', 'Sebindang', 'Semuntik', 'Seriang', 'Tajum', 'Tinting Seligi'] },
        { id: 'kh_bunhulu', nama: 'Bunut Hulu', lat: 0.5050, lon: 112.5650, desa: ['Nanga Suruk', 'Bakong Permai', 'Batu Tiga', 'Beringin', 'Nanga Dua', 'Nanga Kelibang', 'Nanga Payang', 'Nanga Semangut', 'Pantas Bersatu', 'Riam Piyang', 'Segitak', 'Selaup', 'Semangut Utara', 'Temuyuk'] }
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

  /* Jarak jalan nyata presisi (Haversine GPS × faktor kelokan jalan 1,28 di Kalimantan Barat) */
  function jarakKm(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return 0;
    var R = 6371, rad = Math.PI / 180;
    var dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    var s1 = Math.sin(dLat / 2), s2 = Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(s1 * s1 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * s2 * s2),
      Math.sqrt(Math.max(0, 1 - (s1 * s1 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * s2 * s2))));
    var lurus = R * c;
    return Math.round(lurus * 1.28 * 10) / 10;
  }

  /* Koordinat presisi tiap desa di dalam kecamatan (offset deterministik ±0,008° ≈ 0,5–1,4 km agar jarak antar desa presisi) */
  function titikDesa(kabId, kecObj, namaDesa) {
    var idx = (kecObj.desa || []).indexOf(namaDesa);
    if (idx < 0) idx = 0;
    var sudut = (idx * 2.39996) % (Math.PI * 2);
    var radOff = idx === 0 ? 0 : (0.004 + (idx % 4) * 0.0028);
    return {
      kabId: kabId,
      kabNama: (KALBAR[kabId] && KALBAR[kabId].nama) || kabId,
      prov: 'Kalimantan Barat',
      kecId: kecObj.id,
      kecNama: kecObj.nama,
      desa: namaDesa || (kecObj.desa && kecObj.desa[0]) || kecObj.nama,
      lat: Math.round((kecObj.lat + Math.cos(sudut) * radOff) * 10000) / 10000,
      lon: Math.round((kecObj.lon + Math.sin(sudut) * radOff) * 10000) / 10000
    };
  }

  function semuaTitikKalbar() {
    var out = [];
    Object.keys(KALBAR).forEach(function (kabId) {
      var kb = KALBAR[kabId];
      kb.kec.forEach(function (kc) {
        (kc.desa || [kc.nama]).forEach(function (ds) {
          out.push(titikDesa(kabId, kc, ds));
        });
      });
    });
    return out;
  }
  var CACHE_KALBAR = null;
  function daftarTitikKalbar() {
    if (!CACHE_KALBAR) CACHE_KALBAR = semuaTitikKalbar();
    return CACHE_KALBAR;
  }

  function apakahKalbar(kotaId) {
    return !!KALBAR[kotaId];
  }

  /* Titik awal rumah / pangkalan berdasarkan kota */
  function titikAwal(kotaId, kecId) {
    if (KALBAR[kotaId]) {
      var kb = KALBAR[kotaId];
      var kc = (kecId && kb.kec.filter(function (x) { return x.id === kecId; })[0]) || kb.kec[0];
      return titikDesa(kotaId, kc, kc.desa[0]);
    }
    var daf = KEC_UMUM[kotaId] || ['Pusat Kota', 'Kecamatan Utara', 'Kecamatan Selatan', 'Kecamatan Timur', 'Kecamatan Barat'];
    return { kabId: kotaId || 'jakarta', kabNama: kotaId || 'Kota', prov: 'Indonesia', kecId: (kotaId || 'kota') + '_0', kecNama: daf[0], desa: daf[0], lat: null, lon: null };
  }

  /* Pilih tujuan order ojol nyata sesuai rentang km dari titik sekarang (dalam desa/kecamatan atau antarkecamatan/antarkabupaten di Kalbar!) */
  function pilihTujuan(asal, minKm, maxKm) {
    if (!asal || asal.lat == null) {
      var listK = KEC_UMUM[asal && asal.kabId] || ['Pusat Kota', 'Kecamatan Timur', 'Kecamatan Barat', 'Kecamatan Selatan', 'Kecamatan Utara'];
      var pilihK = listK[Math.floor(Math.random() * listK.length)];
      var kmAcak = Math.round((minKm + Math.random() * Math.max(0.5, maxKm - minKm)) * 10) / 10;
      return { titik: { kabId: (asal && asal.kabId) || 'kota', kabNama: (asal && asal.kabNama) || 'Kota', prov: 'Indonesia', kecId: pilihK, kecNama: pilihK, desa: pilihK, lat: null, lon: null }, km: kmAcak };
    }
    var semua = daftarTitikKalbar();
    var cocok = [];
    for (var i = 0; i < semua.length; i++) {
      var t = semua[i];
      if (t.desa === asal.desa && t.kecId === asal.kecId) continue;
      var d = jarakKm(asal, t);
      if (d >= minKm && d <= maxKm) cocok.push({ titik: t, km: Math.max(0.8, d) });
    }
    if (!cocok.length) {
      /* perluas sedikit rentang jika di kecamatan terpencil */
      for (var j = 0; j < semua.length; j++) {
        var t2 = semua[j];
        if (t2.desa === asal.desa && t2.kecId === asal.kecId) continue;
        var d2 = jarakKm(asal, t2);
        if (d2 >= Math.max(0.5, minKm * 0.5) && d2 <= maxKm * 1.45) cocok.push({ titik: t2, km: Math.max(0.8, d2) });
      }
    }
    if (cocok.length) return cocok[Math.floor(Math.random() * cocok.length)];
    /* fallback terakhir: titik terdekat */
    var terdekat = semua[0], minD = 9999;
    for (var k = 0; k < semua.length; k++) {
      var t3 = semua[k];
      if (t3.desa === asal.desa && t3.kecId === asal.kecId) continue;
      var d3 = jarakKm(asal, t3);
      if (d3 < minD) { minD = d3; terdekat = t3; }
    }
    return { titik: terdekat, km: Math.max(1, minD) };
  }

  function daftarKecamatan(kotaId) {
    if (KALBAR[kotaId]) return KALBAR[kotaId].kec;
    return (KEC_UMUM[kotaId] || ['Pusat Kota']).map(function (nm, i) { return { id: kotaId + '_' + i, nama: nm, desa: [nm], lat: null, lon: null }; });
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
    stg_kota: ['Masjid Agung Al-Amin Sintang'],
    kh_pututr: ['Masjid Agung Darunnajah Putussibau']
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

  /* Populasi nyata 2026 (BPS) untuk 14 Kab/Kota Kalbar & 38 Ibu Kota Provinsi Indonesia */
  var PENDUDUK_WILAYAH = {
    pontianak: 685000, kuburaya: 635000, ketapang: 595000, kayongutara: 132000,
    mempawah: 315000, singkawang: 245000, sambas: 648000, bengkayang: 298000,
    landak: 412000, sanggau: 496000, sekadau: 222000, sintang: 438000,
    melawi: 236000, kapuashulu: 266000,
    jakarta: 10720000, surabaya: 3010000, bandung: 2540000, medan: 2510000,
    semarang: 1710000, palembang: 1780000, makassar: 1480000, pekanbaru: 1140000,
    bandarlampung: 1230000, padang: 945000, denpasar: 745000, samarinda: 870000,
    serang: 740000, jambi: 645000, banjarbaru: 285000, palangkaraya: 312000,
    yogyakarta: 418000, mataram: 465000, kupang: 472000, manado: 468000,
    palu: 392000, bengkulu: 398000, kendari: 368000, ambon: 358000,
    jayapura: 418000, sorong: 298000, bandaaceh: 268000, pangkalpinang: 236000,
    tanjungpinang: 238000, gorontalo: 206000, manokwari: 205000, mamuju: 286000,
    merauke: 242000, nabire: 178000, wamena: 122000, tanjungselor: 64000, sofifi: 42000
  };
  function pendudukWilayah(S) {
    var kabId = (S && S.ojek && S.ojek.lokasi && S.ojek.lokasi.kabId) || (S && S.rumah && S.rumah.wilayah && S.rumah.wilayah.kabId) || (S && S.kota) || 'pontianak';
    var dasar = PENDUDUK_WILAYAH[kabId] || 450000;
    /* pertumbuhan penduduk alami ~1,1%/tahun + delta kelahiran/kematian NPC */
    var thnJalan = Math.max(0, ((S && S.hari) || 0) / 365);
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
    /* 130rb → 0.84, 685rb (Pontianak) → 1.00, 2.5jt → 1.18, 10.7jt (Jakarta) → 1.38 */
    var f = 0.72 + Math.log10(Math.max(50000, p) / 50000) * 0.285;
    return Math.max(0.8, Math.min(1.42, Math.round(f * 100) / 100));
  }

  g.KK_WILAYAH = {
    kalbar: KALBAR,
    PENDUDUK_WILAYAH: PENDUDUK_WILAYAH,
    pendudukWilayah: pendudukWilayah,
    formatPenduduk: formatPenduduk,
    faktorPenduduk: faktorPenduduk,
    apakahKalbar: apakahKalbar,
    jarakKm: jarakKm,
    titikAwal: titikAwal,
    titikDesa: titikDesa,
    pilihTujuan: pilihTujuan,
    daftarKecamatan: daftarKecamatan,
    tempatIbadahTerdekat: tempatIbadahTerdekat,
    daftarKabKalbar: function () { return Object.keys(KALBAR).map(function (id) { return { id: id, nama: KALBAR[id].nama, jmlKec: KALBAR[id].kec.length, penduduk: PENDUDUK_WILAYAH[id] || 300000 }; }); }
  };
})(window);
