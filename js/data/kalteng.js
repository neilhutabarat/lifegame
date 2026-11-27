/* kalteng.js — Data wilayah presisi 100% Provinsi Kalimantan Tengah (14 Kabupaten/Kota · 136 Kecamatan · 1.571 Desa/Kelurahan resmi Kemendagri/BPS + GPS + medan jalan + koridor lintas Trans-Kalimantan Tengah + masjid khas).
   Didaftarkan secara modular ke window.KK_WILAYAH agar multi-provinsi tetap ringan 60 FPS tanpa lag. */
(function (g) {
  'use strict';

  /* 14 Kabupaten/Kota & SELURUH 136 Kecamatan + 1.571 Desa/Kelurahan Resmi Provinsi Kalimantan Tengah (Kemendagri/BPS) */
  var KALTENG = {
    /* 1. KOTA PALANGKA RAYA — 5 Kecamatan · 30 Kelurahan */
    palangkaraya: {
      nama: 'Kota Palangka Raya', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'plk_jraya', nama: 'Jekan Raya', lat: -2.2083, lon: 113.9167, medan: 'kota', desa: ['Palangka', 'Menteng', 'Bukit Tunggal', 'Petuk Katimpun'] },
        { id: 'plk_pahandut', nama: 'Pahandut', lat: -2.2136, lon: 113.9315, medan: 'kota', desa: ['Pahandut', 'Langkai', 'Panarung', 'Pahandut Seberang', 'Tanjung Pinang', 'Tumbang Rungan'] },
        { id: 'plk_sabangau', nama: 'Sabangau', lat: -2.3010, lon: 113.9180, medan: 'mulus', desa: ['Kereng Bangkirai', 'Kalampangan', 'Sabaru', 'Bereng Bengkel', 'Kameloh Baru', 'Danau Tundai'] },
        { id: 'plk_bbatu', nama: 'Bukit Batu', lat: -1.9850, lon: 113.7650, medan: 'mulus', desa: ['Tangkiling', 'Banturung', 'Habaring Hurung', 'Kanarakan', 'Marang', 'Sei Gohong', 'Tumbang Tahai'] },
        { id: 'plk_rakumpit', nama: 'Rakumpit', lat: -1.7820, lon: 113.6850, medan: 'bergelombang', desa: ['Petuk Barunai', 'Bukit Sua', 'Gaung Baru', 'Mungku Baru', 'Pager', 'Panjehang', 'Petuk Bukit'] }
      ]
    },
    /* 2. KAB. KOTAWARINGIN BARAT — 6 Kecamatan · 94 Desa/Kelurahan */
    kotawaringinbarat: {
      nama: 'Kab. Kotawaringin Barat', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kobar_arsel', nama: 'Arut Selatan', lat: -2.6832, lon: 111.6259, medan: 'kota', desa: ['Sidorejo', 'Madurejo', 'Raja', 'Baru', 'Mendawai', 'Mendawai Seberang', 'Raja Seberang', 'Pasir Panjang', 'Kumpai Batu Atas', 'Kumpai Batu Bawah', 'Natai Baru', 'Natai Raya', 'Medang Sari', 'Kenambui', 'Rangda', 'Runtu', 'Sulung', 'Tanjung Putri', 'Tanjung Terantang', 'Umpang'] },
        { id: 'kobar_kumai', nama: 'Kumai', lat: -2.7420, lon: 111.7250, medan: 'pesisir', desa: ['Kumai Hulu', 'Kumai Hilir', 'Candi', 'Batu Belaman', 'Bumi Harjo', 'Keraya', 'Kubu', 'Pangkalan Satu', 'Sabuai', 'Sebuai Timur', 'Sungai Bakau', 'Sungai Bedaun', 'Sungai Cabang', 'Sungai Kapitan', 'Sungai Sekonyer', 'Sungai Tendang', 'Teluk Bogam', 'Teluk Pulai'] },
        { id: 'kobar_plada', nama: 'Pangkalan Lada', lat: -2.5920, lon: 111.7920, medan: 'mulus', desa: ['Pandu Sanjaya', 'Pangkalan Tiga', 'Lada Mandala Jaya', 'Kadipi Atas', 'Makarti Jaya', 'Pangkalan Dewa', 'Pangkalan Durin', 'Purbasari', 'Sungai Agung', 'Sungai Melawen', 'Sungai Rangit Jaya'] },
        { id: 'kobar_pbanteng', nama: 'Pangkalan Banteng', lat: -2.5180, lon: 111.9150, medan: 'mulus', desa: ['Karang Mulya', 'Amin Jaya', 'Arga Mulya', 'Berambai Makmur', 'Karang Sari', 'Kebon Agung', 'Marga Mulya', 'Mulya Jadi', 'Natai Kerbau', 'Pangkalan Banteng', 'Sido Mulyo', 'Simpang Berambai', 'Sungai Bengkuang', 'Sungai Hijau', 'Sungai Kuning', 'Sungai Pakit', 'Sungai Pulau'] },
        { id: 'kobar_kolam', nama: 'Kotawaringin Lama', lat: -2.4950, lon: 111.4350, medan: 'mulus', desa: ['Kotawaringin Hulu', 'Kotawaringin Hilir', 'Babual Baboti', 'Dawak', 'Ipuh Bangun Jaya', 'Kinjil', 'Kondang', 'Lalang', 'Palih Baru', 'Riam Durian', 'Rungun', 'Sakabulin', 'Suka Makmur', 'Suka Mulya', 'Sukajaya', 'Sumber Mukti', 'Tempayung'] },
        { id: 'kobar_arut', nama: 'Arut Utara', lat: -2.1450, lon: 111.7550, medan: 'rusak', desa: ['Pangkut', 'Gandis', 'Kerabu', 'Nanga Mua', 'Panahan', 'Pandan', 'Penyombaan', 'Riam', 'Sambi', 'Sukarami', 'Sungai Dau'] }
      ]
    },
    /* 3. KAB. SUKAMARA — 5 Kecamatan · 32 Desa/Kelurahan */
    sukamara: {
      nama: 'Kab. Sukamara', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'skm_sukamara', nama: 'Sukamara', lat: -2.7125, lon: 111.2365, medan: 'mulus', desa: ['Mendawai', 'Padang', 'Kartamulya', 'Natai Sedawak', 'Pangkalan Muntai', 'Petarikan', 'Pudu', 'Sukaraja'] },
        { id: 'skm_briam', nama: 'Balai Riam', lat: -2.4150, lon: 111.1680, medan: 'bergelombang', desa: ['Balai Riam', 'Air Dua', 'Bangun Jaya', 'Bukit Sungkai', 'Jihing', 'Lupu Peruca', 'Pempaning', 'Sekuningan Baru'] },
        { id: 'skm_jelai', nama: 'Jelai', lat: -2.9850, lon: 111.0920, medan: 'pesisir', desa: ['Kuala Jelai', 'Pulau Nibung', 'Sungai Baru', 'Sungai Bundung', 'Sungai Raja'] },
        { id: 'skm_plunci', nama: 'Pantai Lunci', lat: -2.9420, lon: 111.3350, medan: 'pesisir', desa: ['Sungai Cabang Barat', 'Sungai Damar', 'Sungai Pasir', 'Sungai Tabuk'] },
        { id: 'skm_pkecubung', nama: 'Permata Kecubung', lat: -2.3520, lon: 111.2980, medan: 'bergelombang', desa: ['Ajang', 'Kenawan', 'Laman Baru', 'Natai Kondang', 'Nibung Terjun', 'Semantun', 'Sembi Kuan'] }
      ]
    },
    /* 4. KAB. LAMANDAU — 8 Kecamatan · 88 Desa/Kelurahan */
    lamandau: {
      nama: 'Kab. Lamandau', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'lmd_bulik', nama: 'Bulik', lat: -2.1680, lon: 111.4620, medan: 'mulus', desa: ['Nanga Bulik', 'Argo Mulyo', 'Baruta', 'Batu Kotam', 'Bukit Indah', 'Bumi Agung', 'Bunut', 'Guci', 'Kujan', 'Nanga Pamalontian', 'Perigi Raya', 'Sumber Mulya', 'Sungai Mentawa', 'Tamiang'] },
        { id: 'lmd_sjaya', nama: 'Sematu Jaya', lat: -2.2950, lon: 111.4480, medan: 'mulus', desa: ['Purwareja', 'Batu Hambawang', 'Bina Bhakti', 'Jangkar Prima', 'Mekar Mulya', 'Rimba Jaya', 'Tri Tunggal', 'Wonorejo'] },
        { id: 'lmd_mraya', nama: 'Menthobi Raya', lat: -2.1850, lon: 111.6150, medan: 'bergelombang', desa: ['Bukit Raya', 'Batu Ampar', 'Bukit Harum', 'Bukit Makmur', 'Lubuk Hiju', 'Melata', 'Modang Mas', 'Mukti Manunggal', 'Nanga Menthobi', 'Rian Jombang', 'Sumber Jaya'] },
        { id: 'lmd_btimur', nama: 'Bulik Timur', lat: -2.0120, lon: 111.5520, medan: 'perbukitan', desa: ['Merambang', 'Batu Tunggal', 'Bukit Jaya', 'Nanga Kemujan', 'Nanga Koring', 'Nanga Palikodan', 'Nuangan', 'Pedongatan', 'Sepondam', 'Suka Maju', 'Sungkup', 'Toka'] },
        { id: 'lmd_lamandau', nama: 'Lamandau', lat: -2.0350, lon: 111.2780, medan: 'bergelombang', desa: ['Tapin Bini', 'Bakonsu', 'Cuhai', 'Karang Taba', 'Kawa', 'Penopa', 'Samu Jaya', 'Sekoban', 'Suja', 'Sungai Tuat', 'Tanjung Beringin'] },
        { id: 'lmd_delang', nama: 'Delang', lat: -1.7850, lon: 111.1250, medan: 'perbukitan', desa: ['Kudangan', 'Hulu Jojabo', 'Kubung', 'Landau Kantu', 'Lopus', 'Nyalang', 'Penyobaan', 'Riam Panahan', 'Riam Tinggi', 'Sekombulan', 'Sepoyo'] },
        { id: 'lmd_bkawa', nama: 'Batang Kawa', lat: -1.6950, lon: 111.2580, medan: 'tanah', desa: ['Kinipan', 'Batu Tambun', 'Benakitan', 'Ginih', 'Jemuat', 'Karang Mas', 'Kina', 'Liku', 'Mengkalang'] },
        { id: 'lmd_braya', nama: 'Belantikan Raya', lat: -1.8620, lon: 111.4250, medan: 'rusak', desa: ['Bayat', 'Balibi', 'Benuatan', 'Bintang Mengalih', 'Kahingai', 'Karang Besi', 'Nanga Belantikan', 'Nanga Matu', 'Petarikan', 'Sumber Cahaya', 'Sungai Buluh', 'Tangga Batu'] }
      ]
    },
    /* 5. KAB. SERUYAN — 10 Kecamatan · 100 Desa/Kelurahan */
    seruyan: {
      nama: 'Kab. Seruyan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'sry_shilir', nama: 'Seruyan Hilir', lat: -3.3830, lon: 112.5410, medan: 'pesisir', desa: ['Kuala Pembuang I', 'Kuala Pembuang II', 'Baung', 'Jahitan', 'Muara Dua', 'Pematang Limau', 'Persil Raya', 'Sungai Perlu', 'Sungai Undang', 'Tanjung Rangas'] },
        { id: 'sry_shtimur', nama: 'Seruyan Hilir Timur', lat: -3.2780, lon: 112.6480, medan: 'pesisir', desa: ['Pematang Panjang', 'Bangun Harja', 'Halimung Jaya', 'Kartika Bhakti', 'Mekar Indah', 'Sungai Bakau'] },
        { id: 'sry_dsembuluh', nama: 'Danau Sembuluh', lat: -2.7650, lon: 112.3950, medan: 'bergelombang', desa: ['Sembuluh I', 'Sembuluh II', 'Banua Usang', 'Cempaka Baru', 'Palingkau', 'Paren', 'Telaga Pulang', 'Ulak Batu'] },
        { id: 'sry_sraya', nama: 'Seruyan Raya', lat: -2.6250, lon: 112.3620, medan: 'mulus', desa: ['Terawan', 'Bangkal', 'Lanpasa', 'Selunuk', 'Tabiku'] },
        { id: 'sry_hanau', nama: 'Hanau', lat: -2.4180, lon: 112.1650, medan: 'mulus', desa: ['Pembuang Hulu I', 'Pembuang Hulu II', 'Bahaur', 'Derangga', 'Parang Batang', 'Paring Raya', 'Tanjung Hanau'] },
        { id: 'sry_dseluluk', nama: 'Danau Seluluk', lat: -2.4650, lon: 112.0420, medan: 'mulus', desa: ['Asam Baru', 'Panimba Raya', 'Rungau Raya', 'Tanjung Hara', 'Tanjung Paring', 'Tanjung Rangas II'] },
        { id: 'sry_stengah', nama: 'Seruyan Tengah', lat: -1.9450, lon: 112.1650, medan: 'bergelombang', desa: ['Rantau Pulut', 'Ayawan', 'Batu Agung', 'Bukit Buluh', 'Bukit Panyuhu', 'Bukit Tahinting', 'Bumi Jaya', 'Durian Tunggal', 'Gantung Pangayuh', 'Panca Jaya', 'Pangke', 'Panyumpa', 'Ringin Agung', 'Suka Jaya', 'Suka Maju', 'Suka Makmur', 'Suka Mandang', 'Sukorejo', 'Tangga Batu', 'Teluk Bayur'] },
        { id: 'sry_bampar', nama: 'Batu Ampar', lat: -2.0950, lon: 112.0550, medan: 'rusak', desa: ['Sandul', 'Batu Menangis', 'Derawa', 'Durian Kait', 'Kalang', 'Sahabu', 'Sebabi', 'Suka Mulya', 'Wana Tirta'] },
        { id: 'sry_shulu', nama: 'Seruyan Hulu', lat: -1.4920, lon: 112.1980, medan: 'tanah', desa: ['Tumbang Manjul', 'Buntut Sapau', 'Marandang', 'Mojang Baru', 'Mojang Juoi', 'Rantau Panjang', 'Riam Batang', 'Sepundu Hantu', 'Tumbang Bahan', 'Tumbang Darap', 'Tumbang Kalang', 'Tumbang Kasai', 'Tumbang Kubang', 'Tumbang Laku', 'Tumbang Paku', 'Tumbang Sepan', 'Tumbang Setawai', 'Tumbang Suei', 'Tumbang Taberau', 'Tusuk Belawan'] },
        { id: 'sry_stambun', nama: 'Suling Tambun', lat: -1.3250, lon: 112.0850, medan: 'tanah', desa: ['Tumbang Langkai', 'Rangkang Mundu', 'Rantau Betung', 'Tanjung Tukal', 'Tumbang Gugup', 'Tumbang Hentas', 'Tumbang Magin', 'Tumbang Salau', 'Tumbang Setoli'] }
      ]
    },
    /* 6. KAB. KOTAWARINGIN TIMUR — 17 Kecamatan · 185 Desa/Kelurahan */
    kotawaringintimur: {
      nama: 'Kab. Kotawaringin Timur', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kotim_mbk', nama: 'Mentawa Baru Ketapang', lat: -2.5396, lon: 112.9502, medan: 'kota', desa: ['Mentawa Baru Hulu', 'Mentawa Baru Hilir', 'Ketapang', 'Pasir Putih', 'Sawahan', 'Bapanggang Raya', 'Bapeang', 'Bengkuang Makmur', 'Eka Bahurui', 'Pelangsian', 'Telaga Baru'] },
        { id: 'kotim_baamang', nama: 'Baamang', lat: -2.5020, lon: 112.9480, medan: 'kota', desa: ['Baamang Tengah', 'Baamang Barat', 'Baamang Hilir', 'Baamang Hulu', 'Tanah Mas', 'Tinduk'] },
        { id: 'kotim_seranau', nama: 'Seranau', lat: -2.5380, lon: 112.9850, medan: 'bergelombang', desa: ['Mentaya Seberang', 'Batuah', 'Ganepo', 'Seragam Jaya', 'Terantang', 'Terantang Hilir'] },
        { id: 'kotim_kbesi', nama: 'Kota Besi', lat: -2.3820, lon: 112.9380, medan: 'mulus', desa: ['Kota Besi Hulu', 'Kota Besi Hilir', 'Bajarum', 'Camba', 'Hanjalipan', 'Kandan', 'Palangan', 'Pamalian', 'Rasau Tumbuh', 'Simpur', 'Soren'] },
        { id: 'kotim_telawang', nama: 'Telawang', lat: -2.4780, lon: 112.5650, medan: 'mulus', desa: ['Sebabi', 'Biru Maju', 'Kenyala', 'Penyang', 'Sumber Makmur', 'Tanah Putih'] },
        { id: 'kotim_cempaga', nama: 'Cempaga', lat: -2.2480, lon: 112.9520, medan: 'mulus', desa: ['Cempaka Mulia Barat', 'Cempaka Mulia Timur', 'Jemaras', 'Luwuk Bunter', 'Luwuk Ranggan', 'Patai', 'Rubung Buyung', 'Sungai Paring'] },
        { id: 'kotim_chulu', nama: 'Cempaga Hulu', lat: -2.0750, lon: 112.9450, medan: 'mulus', desa: ['Pundu', 'Bukit Batu', 'Bukit Raya', 'Keruing', 'Pantai Harapan', 'Parit', 'Pelantaran', 'Selucing', 'Sudan', 'Sungai Ubar Mandiri', 'Tumbang Koling'] },
        { id: 'kotim_parenggean', nama: 'Parenggean', lat: -1.9650, lon: 112.7920, medan: 'bergelombang', desa: ['Parenggean', 'Bajarau', 'Bandar Agung', 'Barunang Miri', 'Beringin Tunggal Jaya', 'Bukit Harapan', 'Kabuau', 'Karang Sari', 'Karang Tunggal', 'Karya Bersama', 'Manjalin', 'Mekar Jaya', 'Sari Harapan', 'Sumber Makmur', 'Tehang'] },
        { id: 'kotim_thulu', nama: 'Tualan Hulu', lat: -1.8150, lon: 112.8280, medan: 'bergelombang', desa: ['Luwuk Sampun', 'Bukit Makmur', 'Cempaka Putih', 'Damar Makmur', 'Jatiwaringin', 'Mekar Sari', 'Merah', 'Sebungsu', 'Tanjung Jorong', 'Tumbang Mujam', 'Wonosari'] },
        { id: 'kotim_mhulu', nama: 'Mentaya Hulu', lat: -1.7850, lon: 112.5250, medan: 'rusak', desa: ['Kuala Kuayan', 'Baampah', 'Bawan', 'Kapuk', 'Kawan Batu', 'Pahirangan', 'Pantap', 'Pemantang', 'Penda Durian', 'Santilik', 'Sationg', 'Tangar', 'Tangka Robah', 'Tanjung Bantur', 'Tanjung Jariangau', 'Tumbang Sapiri'] },
        { id: 'kotim_bsantuai', nama: 'Bukit Santuai', lat: -1.4650, lon: 112.5650, medan: 'tanah', desa: ['Tumbang Penyahuan', 'Lunuk Bagantung', 'Tanah Haluan', 'Tewai Hara', 'Tumbang Batu', 'Tumbang Getas', 'Tumbang Kaminting', 'Tumbang Kania', 'Tumbang Payang', 'Tumbang Saluang', 'Tumbang Sapia', 'Tumbang Tawan', 'Tumbang Tilap', 'Tumbang Torung'] },
        { id: 'kotim_akalang', nama: 'Antang Kalang', lat: -1.5350, lon: 112.7820, medan: 'rusak', desa: ['Tumbang Kalang', 'Bhakti Karya', 'Buntut Nusa', 'Gunung Makmur', 'Kuluk Talawang', 'Mulya Agung', 'Sungai Hanya', 'Sungai Puring', 'Tumbang Gagu', 'Tumbang Hejan', 'Tumbang Manya', 'Tumbang Ngahan', 'Tumbang Ramei', 'Tumbang Sepayang', 'Waringin Agung'] },
        { id: 'kotim_tantang', nama: 'Telaga Antang', lat: -1.3620, lon: 112.7420, medan: 'tanah', desa: ['Tumbang Sangai', 'Agung Mulya', 'Batu Agung', 'Beringin Agung', 'Buana Mustika', 'Bukit Indah', 'Luwuk Kuwan', 'Rantau Katang', 'Rantau Sawang', 'Rantau Suang', 'Rantau Tampang', 'Tribuana', 'Tukang Langit', 'Tumbang Bajanei', 'Tumbang Boloi', 'Tumbang Harapan', 'Tumbang Mangkup', 'Tumbang Puan'] },
        { id: 'kotim_mhu', nama: 'Mentaya Hilir Utara', lat: -2.7080, lon: 112.9120, medan: 'mulus', desa: ['Bagandang Tengah', 'Bagandang', 'Bagandang Hilir', 'Bagandang Hilir Permai', 'Bagandang Hulu', 'Natai Baru', 'Pondok Damar'] },
        { id: 'kotim_mhs', nama: 'Mentaya Hilir Selatan', lat: -2.8520, lon: 112.9380, medan: 'pesisir', desa: ['Samuda Kota', 'Basirih Hilir', 'Basirih Hulu', 'Handil Sohor', 'Jaya Karet', 'Jaya Kelapa', 'Sabamban', 'Samuda Besar', 'Samuda Kecil', 'Sei Ijum Raya'] },
        { id: 'kotim_tsampit', nama: 'Teluk Sampit', lat: -3.1450, lon: 112.9780, medan: 'pesisir', desa: ['Ujung Pandaran', 'Basawang', 'Kuin Permai', 'Lampuyang', 'Parebok', 'Regei Lestari'] },
        { id: 'kotim_phanaut', nama: 'Pulau Hanaut', lat: -2.9350, lon: 113.0250, medan: 'pulau', pulau: true, desa: ['Bapinang Hulu', 'Babaung', 'Babirah', 'Bamadu', 'Bantian', 'Bapinang Hilir', 'Bapinang Hilir Laut', 'Hanaut', 'Hantipan', 'Makarti Jaya', 'Penyaguan', 'Rawa Sari', 'Satiruk', 'Serambut'] }
      ]
    },
    /* 7. KAB. KATINGAN — 13 Kecamatan · 161 Desa/Kelurahan */
    katingan: {
      nama: 'Kab. Katingan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'ktg_khilir', nama: 'Katingan Hilir', lat: -1.8942, lon: 113.3895, medan: 'mulus', desa: ['Kasongan Lama', 'Kasongan Baru', 'Banut Kalanaman', 'Hampalit', 'Talian Kereng', 'Telangkah', 'Tewang Kadamba', 'Tumbang Liting'] },
        { id: 'ktg_tsg', nama: 'Tewang Sangalang Garing', lat: -1.7850, lon: 113.3250, medan: 'bergelombang', desa: ['Pendahara', 'Bangkuang', 'Hampalam', 'Karya Unggang', 'Tarusan Danum', 'Tewang Beringin', 'Tewang Manyangen', 'Tewang Rangas', 'Tewang Rangkang', 'Tumbang Tarusan'] },
        { id: 'ktg_pmalan', nama: 'Pulau Malan', lat: -1.6350, lon: 113.2150, medan: 'bergelombang', desa: ['Buntut Bali', 'Dahian Tunggal', 'Garagu', 'Kuluk Bali', 'Manduing Lama', 'Manduing Taheta', 'Tewang Derayu', 'Tewang Karangan', 'Tewang Papari', 'Tumbang Banjang', 'Tumbang Lawang', 'Tumbang Tanjung', 'Tumbang Tungku', 'Tura'] },
        { id: 'ktg_ktengah', nama: 'Katingan Tengah', lat: -1.4350, lon: 113.1050, medan: 'bergelombang', desa: ['Samba Kahayan', 'Batu Badinding', 'Mirah Kalanaman', 'Napu Sahur', 'Petak Puti', 'Rantau Asem', 'Samba Bakumpai', 'Samba Danum', 'Samba Katung', 'Telok', 'Tewang Panjang', 'Tumbang Hangei', 'Tumbang Kalemei', 'Tumbang Lahang', 'Tumbang Marak', 'Tumbang Pariyei'] },
        { id: 'ktg_smantikei', nama: 'Sanaman Mantikei', lat: -1.2420, lon: 113.0950, medan: 'rusak', desa: ['Tumbang Kaman', 'Daya Manunggal', 'Dehes', 'Kamanto', 'Kuluk Habuhus', 'Rantau Bangkiang', 'Tumbang Atei', 'Tumbang Kamei', 'Tumbang Karanei', 'Tumbang Kawei', 'Tumbang Labehu', 'Tumbang Manggara', 'Tumbang Manggu', 'Tumbang Pangka'] },
        { id: 'ktg_pmalai', nama: 'Petak Malai', lat: -1.0780, lon: 112.9250, medan: 'tanah', desa: ['Tumbang Baraoi', 'Batu Badak', 'Batu Tukan', 'Nusa Katau', 'Tumbang Habangoi', 'Tumbang Jala', 'Tumbang Tanggoi'] },
        { id: 'ktg_marikit', nama: 'Marikit', lat: -1.0620, lon: 112.6650, medan: 'tanah', desa: ['Tumbang Hiran', 'Batu Panahan', 'Buntut Leleng', 'Kuluk Leleng', 'Rangan Burih', 'Rangan Surai', 'Rangan Tangko', 'Sabaung', 'Tumbang Beban', 'Tumbang Dakei', 'Tumbang Lambi', 'Tumbang Malawan', 'Tumbang Mandurei', 'Tumbang Pahanei', 'Tumbang Paku', 'Tumbang Tabulus', 'Tumbang Tuei', 'Tumbang Tundu'] },
        { id: 'ktg_khulu', nama: 'Katingan Hulu', lat: -0.9620, lon: 112.5020, medan: 'tanah', desa: ['Tumbang Sanamang I', 'Batu Bango', 'Dehes Asem', 'Kiham Batang', 'Kuluk Sepangi', 'Penda Tangaring Baru', 'Penda Tangaring Lama', 'Rangan Kawit', 'Rangan Ranjing', 'Rantau Bahai', 'Rantau Puka', 'Sungai Nanjan', 'Telok Tampang', 'Tumbang Hangei II', 'Tumbang Jiga', 'Tumbang Kabayang', 'Tumbang Kuai', 'Tumbang Labaning', 'Tumbang Mahup', 'Tumbang Manangei', 'Tumbang Mangketai', 'Tumbang Sabetung', 'Tumbang Selaman'] },
        { id: 'ktg_braya', nama: 'Bukit Raya', lat: -0.7850, lon: 112.4820, medan: 'tanah', desa: ['Tumbang Kajamei', 'Penda Nange', 'Rangan Bahekang', 'Rangan Rondan', 'Rantau Pandan', 'Tanjung Batik', 'Tumbang Dahuei', 'Tumbang Gaei', 'Tumbang Kaburai', 'Tumbang Karuei', 'Tumbang Kataei'] },
        { id: 'ktg_tpayawan', nama: 'Tasik Payawan', lat: -2.0950, lon: 113.3850, medan: 'bergelombang', desa: ['Petak Bahandang', 'Handiwung', 'Hiyang Bana', 'Luwuk Kanan', 'Luwuk Kiri', 'Talingke', 'Tewang Tampang', 'Tumbang Panggu'] },
        { id: 'ktg_kamipang', nama: 'Kamipang', lat: -2.3520, lon: 113.4380, medan: 'rusak', desa: ['Baun Bango', 'Asem Kumbang', 'Galinggang', 'Jahanjang', 'Karuing', 'Parupuk', 'Tampelas', 'Telaga', 'Tumbang Runen'] },
        { id: 'ktg_mendawai', nama: 'Mendawai', lat: -2.8650, lon: 113.2850, medan: 'rusak', desa: ['Mendawai', 'Kampung Melayu', 'Mekar Tani', 'Perigi', 'Tawang Kampung', 'Teluk Sebulu', 'Tumbang Bulan'] },
        { id: 'ktg_kkuala', nama: 'Katingan Kuala', lat: -3.2250, lon: 113.3350, medan: 'pesisir', desa: ['Pagatan Hilir', 'Pagatan Hulu', 'Bakung Raya', 'Bumi Subur', 'Jaya Makmur', 'Kampung Baru', 'Kampung Melayu', 'Kampung Tengah', 'Makmur Utama', 'Mangun Jaya', 'Sebangau Jaya', 'Selat Baning', 'Setia Mulia', 'Singam Raya', 'Subur Indah', 'Sungai Kaki'] }
      ]
    },
    /* 8. KAB. PULANG PISAU — 8 Kecamatan · 99 Desa/Kelurahan */
    pulangpisau: {
      nama: 'Kab. Pulang Pisau', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'pps_khilir', nama: 'Kahayan Hilir', lat: -2.7480, lon: 114.2280, medan: 'mulus', desa: ['Pulang Pisau', 'Bereng', 'Kalawa', 'Anjir Pulang Pisau', 'Buntoi', 'Gohong', 'Hanjak Maju', 'Mantaren I', 'Mantaren II', 'Mintin'] },
        { id: 'pps_jabiren', nama: 'Jabiren Raya', lat: -2.4780, lon: 114.1580, medan: 'mulus', desa: ['Jabiren', 'Garung', 'Henda', 'Pilang', 'Saka Kajang', 'Simpur', 'Tanjung Taruna', 'Tumbang Nusa'] },
        { id: 'pps_ktengah', nama: 'Kahayan Tengah', lat: -2.0120, lon: 113.9980, medan: 'bergelombang', desa: ['Bukit Rawi', 'Bahu Palawa', 'Balukon', 'Bereng Rambang', 'Bukit Bamba', 'Bukit Liti', 'Pamarunan', 'Parahangan', 'Penda Barania', 'Petuk Liti', 'Sigi', 'Tahawa', 'Tanjung Sanggalang', 'Tuwung'] },
        { id: 'pps_btingang', nama: 'Banama Tingang', lat: -1.7850, lon: 113.9720, medan: 'bergelombang', desa: ['Bawan', 'Goha', 'Hanua', 'Hurung', 'Kasali Baru', 'Lawang Uru', 'Manen Kaleka', 'Manen Paduran', 'Pahawan', 'Pandawei', 'Pangi', 'Ramang', 'Tambak', 'Tangkahen', 'Tumbang Tarusan'] },
        { id: 'pps_maliku', nama: 'Maliku', lat: -2.9320, lon: 114.1420, medan: 'bergelombang', desa: ['Maliku Baru', 'Badirih', 'Gandang', 'Gandang Barat', 'Garantung', 'Kanamit', 'Kanamit Barat', 'Kanamit Jaya', 'Maliku Mulya', 'Purwodadi', 'Sei Baru Tewu', 'Sidodadi', 'Tahai Baru', 'Tahai Jaya', 'Wono Agung'] },
        { id: 'pps_pbatu', nama: 'Pandih Batu', lat: -3.0580, lon: 114.1220, medan: 'bergelombang', desa: ['Pangkoh Hilir', 'Belanti Siam', 'Dandang', 'Gadabung', 'Kantan Atas', 'Kantan Dalam', 'Kantan Muara', 'Karya Bersama', 'Mulyasari', 'Pangkoh Hulu', 'Pangkoh Sari', 'Pantik', 'Sanggang', 'Talio', 'Talio Hulu', 'Talio Muara'] },
        { id: 'pps_kkuala', nama: 'Kahayan Kuala', lat: -3.2680, lon: 114.0850, medan: 'pesisir', desa: ['Bahaur Basantan', 'Bahaur Batu Raya', 'Bahaur Hilir', 'Bahaur Hulu', 'Bahaur Hulu Permai', 'Bahaur Tengah', 'Cemantan', 'Kiapak', 'Sei Barunai', 'Sei Pasanan', 'Sei Pudak', 'Sei Rungun', 'Tanjung Perawan'] },
        { id: 'pps_skuala', nama: 'Sebangau Kuala', lat: -3.0850, lon: 113.7920, medan: 'rusak', desa: ['Sebangau Permai', 'Mekar Jaya', 'Paduran Mulya', 'Paduran Sebangau', 'Sebangau Jaya', 'Sebangau Mulya', 'Sei Bakau', 'Sei Hambawang'] }
      ]
    },
    /* 9. KAB. KAPUAS — 17 Kecamatan · 231 Desa/Kelurahan */
    kapuas: {
      nama: 'Kab. Kapuas', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kps_selat', nama: 'Selat', lat: -3.0094, lon: 114.3878, medan: 'kota', desa: ['Selat Hilir', 'Selat Dalam', 'Selat Barat', 'Selat Hulu', 'Selat Tengah', 'Selat Utara', 'Murung Keramat', 'Panamas', 'Pulau Telo', 'Pulau Telo Baru'] },
        { id: 'kps_khilir', nama: 'Kapuas Hilir', lat: -2.9950, lon: 114.4150, medan: 'mulus', desa: ['Barimba', 'Dahirang', 'Hampatung', 'Mambulau', 'Sei Pasah', 'Bakungin', 'Saka Batur', 'Sei Asam'] },
        { id: 'kps_ktimur', nama: 'Kapuas Timur', lat: -3.0950, lon: 114.4620, medan: 'mulus', desa: ['Anjir Serapat Tengah', 'Anjir Mambulau Barat', 'Anjir Mambulau Tengah', 'Anjir Mambulau Timur', 'Anjir Serapat Barat', 'Anjir Serapat Baru', 'Anjir Serapat Timur'] },
        { id: 'kps_basarang', nama: 'Basarang', lat: -2.9420, lon: 114.3150, medan: 'mulus', desa: ['Basarang', 'Basarang Jaya', 'Basungkai', 'Batu Nindan', 'Batuah', 'Bungai Jaya', 'Lunuk Ramba', 'Maluen', 'Naning', 'Panarung', 'Pangkalan Rekan', 'Pangkalan Sari', 'Tambun Raya', 'Tarung Manuah'] },
        { id: 'kps_bataguh', nama: 'Bataguh', lat: -3.1280, lon: 114.3180, medan: 'bergelombang', desa: ['Pulau Kupang', 'Bamban Raya', 'Bangun Harjo', 'Budi Mufakat', 'Pulau Mambulau', 'Sei Jangkit', 'Sei Lunuk', 'Tamban Luar', 'Terusan Baguntan Raya', 'Terusan Karya', 'Terusan Makmur', 'Terusan Mulya', 'Terusan Raya', 'Terusan Raya Barat', 'Terusan Raya Hulu'] },
        { id: 'kps_ppetak', nama: 'Pulau Petak', lat: -2.9050, lon: 114.4250, medan: 'mulus', desa: ['Sei Tatas', 'Anjir Palambang', 'Banama', 'Bunga Mawar', 'Handiwung', 'Mawar Mekar', 'Narahan', 'Narahan Baru', 'Palangkai', 'Saka Lagun', 'Sei Tatas Hilir', 'Teluk Palinget'] },
        { id: 'kps_kbarat', nama: 'Kapuas Barat', lat: -2.8150, lon: 114.3820, medan: 'bergelombang', desa: ['Mandomai', 'Anjir Kalampan', 'Basuta Raya', 'Maju Bersama', 'Pantai', 'Penda Katapi', 'Saka Mangkahai', 'Saka Tamiang', 'Sei Dusun', 'Sei Kayu', 'Sei Pitung', 'Teluk Hiri'] },
        { id: 'kps_kmurung', nama: 'Kapuas Murung', lat: -2.7480, lon: 114.5150, medan: 'bergelombang', desa: ['Palingkau Lama', 'Palingkau Baru', 'Belawang', 'Bina Karya', 'Bina Mekar', 'Bina Sejahtera', 'Bumi Rahayu', 'Karya Bersama', 'Mampai', 'Manggala Permai', 'Muara Dadahup', 'Desa Palingkau Baru', 'Desa Palingkau Lama', 'Palingkau Asri', 'Palingkau Jaya', 'Palingkau Sejahtera', 'Rawa Subur', 'Saka Binjai', 'Suka Mukti', 'Suka Reja', 'Sumber Mulya', 'Tajepan', 'Talekung Punei'] },
        { id: 'kps_dadahup', nama: 'Dadahup', lat: -2.6250, lon: 114.5880, medan: 'bergelombang', desa: ['Dadahup', 'Bentuk Jaya', 'Bina Jaya', 'Dadahup Raya', 'Harapan Baru', 'Kahuripan Permai', 'Manuntung', 'Menteng Karya', 'Petak Batuah', 'Sumber Agung', 'Sumber Alaska', 'Tambak Bajai', 'Tanjung Harapan'] },
        { id: 'kps_tcatur', nama: 'Tamban Catur', lat: -3.2250, lon: 114.4420, medan: 'pesisir', desa: ['Tamban Baru Tengah', 'Bandar Mekar', 'Bandar Raya', 'Sido Mulyo', 'Sidorejo', 'Tamban Baru Mekar', 'Tamban Baru Timur', 'Tamban Jaya', 'Tamban Makmur', 'Warna Sari'] },
        { id: 'kps_kkuala', nama: 'Kapuas Kuala', lat: -3.3380, lon: 114.3750, medan: 'pesisir', desa: ['Lupak Dalam', 'Baranggau', 'Batanjung', 'Cemara Labat', 'Lupak Timur', 'Palampai', 'Pematang', 'Sei Bakut', 'Sei Teras', 'Simpang Bunga Tanjung', 'Tamban Baru Selatan', 'Tamban Lupak', 'Wargo Mulyo'] },
        { id: 'kps_mantangai', nama: 'Mantangai', lat: -2.4180, lon: 114.4250, medan: 'bergelombang', desa: ['Mantangai Hilir', 'Bukit Batu', 'Danau Rawah', 'Harapan Jaya', 'Humbang Raya', 'Kaladan Jaya', 'Kalumpang', 'Katimpun', 'Katunjung', 'Lahei Mangkutup', 'Lamunti', 'Lamunti Baru', 'Lamunti Permai', 'Lapetan', 'Mantangai Hulu', 'Mantangai Tengah', 'Manusup', 'Manusup Hilir', 'Manyahi', 'Muroi Raya', 'Pulau Kaladan', 'Rantau Jaya', 'Sari Makmur', 'Sei Ahas', 'Sei Gawing', 'Sei Gita', 'Sei Kapar', 'Sekata Bangun', 'Sekata Makmur', 'Sido Mulyo', 'Sri Widadi', 'Suka Maju', 'Sumber Makmur', 'Tabore', 'Tarantang', 'Tumbang Mangkutup', 'Tumbang Muroi', 'Warga Mulya'] },
        { id: 'kps_timpah', nama: 'Timpah', lat: -1.9150, lon: 114.3850, medan: 'bergelombang', desa: ['Timpah', 'Aruk', 'Batapah', 'Danau Pantau', 'Lawang Kajang', 'Lawang Kamah', 'Lungkuh Layang', 'Petak Puti', 'Tumbang Randang'] },
        { id: 'kps_ktengah', nama: 'Kapuas Tengah', lat: -1.5250, lon: 114.3650, medan: 'rusak', desa: ['Pujon', 'Bajuh', 'Barunang', 'Buhut Jaya', 'Hurung Pukung', 'Karukus', 'Kayu Bulan', 'Kota Baru', 'Manis', 'Marapit', 'Masaran', 'Penda Muntei', 'Tapen'] },
        { id: 'kps_ptalawang', nama: 'Pasak Talawang', lat: -1.2850, lon: 114.2950, medan: 'rusak', desa: ['Jangkang', 'Balai Banjang', 'Batu Sambung', 'Dandang', 'Hurung Kampin', 'Kaburan', 'Sei Ringin', 'Tumbang Diring', 'Tumbang Nusa', 'Tumbang Tukun'] },
        { id: 'kps_khulu', nama: 'Kapuas Hulu', lat: -1.0450, lon: 114.1850, medan: 'tanah', desa: ['Sei Hanyu', 'Barunang II', 'Bulau Ngandung', 'Dirung Koram', 'Hurung Tabengan', 'Hurung Tampang', 'Jakatan Pari', 'Katanjung', 'Mampai Jaya', 'Rahung Bungai', 'Supang', 'Tangirang', 'Tumbang Puroh', 'Tumbang Sirat'] },
        { id: 'kps_mtalawang', nama: 'Mandau Talawang', lat: -0.9650, lon: 114.0450, medan: 'tanah', desa: ['Sei Pinang', 'Jakatan Masaha', "Karetau Manta'a", 'Lawang Tamang', 'Masaha', 'Masupa Ria', 'Tanjung Rendan', 'Tumbang Bukoi', 'Tumbang Manyarung', 'Tumbang Tihis'] }
      ]
    },
    /* 10. KAB. GUNUNG MAS — 12 Kecamatan · 127 Desa/Kelurahan */
    gunungmas: {
      nama: 'Kab. Gunung Mas', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'gmas_kurun', nama: 'Kurun', lat: -1.1068, lon: 113.8615, medan: 'bergelombang', desa: ['Kuala Kurun', 'Tampang Tumbang Anjir', 'Hurung Bunut', 'Penda Pilang', 'Petak Bahandang', 'Pilang Munduk', 'Tanjung Riu', 'Teluk Nyatu', 'Tewang Pajangan', 'Tumbang Hakau', 'Tumbang Lampahung', 'Tumbang Manyangan', 'Tumbang Miwan', 'Tumbang Tambirah', 'Tumbang Tariak'] },
        { id: 'gmas_sepang', nama: 'Sepang', lat: -1.4680, lon: 113.8720, medan: 'bergelombang', desa: ['Sepang Simin', 'Pematang Limau', 'Rabauh', 'Sepang Kota', 'Tampelas', 'Tanjung Karitak', 'Tewai Baru'] },
        { id: 'gmas_mihing', nama: 'Mihing Raya', lat: -1.3250, lon: 113.8650, medan: 'bergelombang', desa: ['Kampuri', 'Dahian Tambuk', 'Rangan Tate', 'Tumbang Danau', 'Tumbang Empas', 'Tuyun'] },
        { id: 'gmas_tewah', nama: 'Tewah', lat: -0.9450, lon: 113.7920, medan: 'perbukitan', desa: ['Tewah', 'Batu Nyapau', 'Batu Nyiwuh', 'Karason Raya', 'Kasintu', 'Rangan Mihing', 'Sandung Tambun', 'Sare Rangan', 'Sei Riang', 'Sumur Mas', 'Taja Urap', 'Tanjung Untung', 'Teluk Lawah', 'Tumbang Habaon', 'Tumbang Pajangei', 'Upon Batu'] },
        { id: 'gmas_rungan', nama: 'Rungan', lat: -1.3850, lon: 113.6450, medan: 'rusak', desa: ['Jakatan Raya', 'Bereng Baru', 'Bereng Malaka', 'Karya Bhakti', 'Linau', 'Luwuk Kantor', 'Luwuk Langkuas', 'Parempei', 'Talangkah', 'Tumbang Baringei', 'Tumbang Bunut', 'Tumbang Jutuh', 'Tumbang Kajuei', 'Tumbang Malahoi'] },
        { id: 'gmas_rbarat', nama: 'Rungan Barat', lat: -1.4250, lon: 113.5050, medan: 'rusak', desa: ['Rabambang', 'Hujung Pata', 'Jalemu Masulan', 'Jalemu Raya', 'Mangkawuk', 'Tajah Antang Raya', 'Tumbang Bahanei', 'Tumbang Jalemu Kajuei', 'Tumbang Kuayan', 'Tumbang Langgah', 'Tusang Raya'] },
        { id: 'gmas_rhulu', nama: 'Rungan Hulu', lat: -1.1650, lon: 113.5850, medan: 'rusak', desa: ['Tumbang Rahuyan', 'Batu Puter', 'Hantapang', 'Jangkit', 'Sangal', 'Sei Antai', 'Tumbang Lapan', 'Tumbang Mujai', 'Tumbang Tuwe'] },
        { id: 'gmas_manuhing', nama: 'Manuhing', lat: -1.5350, lon: 113.4550, medan: 'rusak', desa: ['Tumbang Talaken', 'Bangun Sari', 'Belawan Mulya', 'Bereng Belawan', 'Bereng Jun', 'Fajar Harapan', 'Gohong', 'Takaras', 'Tangki Dahuyan', 'Taringen', 'Tumbang Jalemu', 'Tumbang Sepan'] },
        { id: 'gmas_mraya', nama: 'Manuhing Raya', lat: -1.3150, lon: 113.3850, medan: 'tanah', desa: ['Tehang', 'Luwuk Tukau', 'Putat Durei', 'Tumbang Mantuhe', 'Tumbang Oroi', 'Tumbang Samui'] },
        { id: 'gmas_khu', nama: 'Kahayan Hulu Utara', lat: -0.7850, lon: 113.7150, medan: 'perbukitan', desa: ['Tumbang Miri', 'Batu Tangkoi', 'Dandang', 'Penda Rangas', 'Teluk Kanduri', 'Tumbang Hamputung', 'Tumbang Korik', 'Tumbang Pasangon', 'Tumbang Ponyoi', 'Tumbang Sian', 'Tumbang Tajungan', 'Tumbang Takaoi'] },
        { id: 'gmas_dbatu', nama: 'Damang Batu', lat: -0.6650, lon: 113.5250, medan: 'tanah', desa: ['Tumbang Marikoi', 'Karetau Rambangun', 'Karetau Sarian', 'Lawang Kanji', 'Tumbang Anoi', 'Tumbang Mahuroi', 'Tumbang Maraya', 'Tumbang Posu'] },
        { id: 'gmas_mmanasa', nama: 'Miri Manasa', lat: -0.6150, lon: 113.7950, medan: 'tanah', desa: ['Tumbang Napoi', 'Buntoi', 'Harowu', 'Mangkuhung', 'Rangan Hiran', 'Tumbang Hatung', 'Tumbang Koroi', 'Tumbang Lapan', 'Tumbang Manyoi', 'Tumbang Masukih', 'Tumbang Siruk'] }
      ]
    },
    /* 11. KAB. BARITO SELATAN — 6 Kecamatan · 93 Desa/Kelurahan */
    baritoselatan: {
      nama: 'Kab. Barito Selatan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'barsel_dsel', nama: 'Dusun Selatan', lat: -1.7205, lon: 114.8435, medan: 'mulus', desa: ['Buntok Kota', 'Hilir Sper', 'Jelapat', 'Baru', 'Danau Ganting', 'Danau Masura', 'Danau Sadar', 'Dangka', 'Kalahien', 'Lembeng', 'Mabuan', 'Madara', 'Mangaris', 'Muara Ripung', 'Muara Talang', 'Murung Paken', 'Pamait', 'Pamangka', 'Pararapak', 'Penda Asam', 'Sababilah', 'Sanggu', 'Tanjung Jawa', 'Telang Andrau', 'Teluk Mampun', 'Teluk Telaga', 'Tetei Lanan'] },
        { id: 'barsel_dutara', nama: 'Dusun Utara', lat: -1.4280, lon: 114.8650, medan: 'bergelombang', desa: ['Pendang', 'Bantai Bambure', 'Bundar', 'Danau Bambure', 'Gunung Rantau', 'Hingan', 'Hulu Tampang', 'Majundre', 'Marawan Baru', 'Marawan Lama', 'Maruga', 'Panarukan', 'Rampa Mea', 'Reong', 'Sungai Telang', 'Tamparak', 'Tamparak Layung', 'Tarusan', 'Telekoi'] },
        { id: 'barsel_gba', nama: 'Gunung Bintang Awai', lat: -1.5850, lon: 115.1450, medan: 'bergelombang', desa: ['Tabak Kanilan', 'Baruang', 'Bintang Ara', 'Bipak Kali', 'Gagutur', 'Kayumban', 'Malungai Raya', 'Marga Jaya', 'Muara Singan', 'Muka Haji', 'Ngurit', 'Palo Rejo', 'Patas I', 'Patas II', 'Ruhing Raya', 'Sarimbuah', 'Sire', 'Sungai Paken', 'Ugang Sayu', 'Wayun', 'Wungkur Baru'] },
        { id: 'barsel_kkuala', nama: 'Karau Kuala', lat: -1.9650, lon: 114.8550, medan: 'bergelombang', desa: ['Bangkuang', 'Babai', 'Bintang Kurung', 'Janggi', 'Malitin', 'Muara Arai', 'Salat Baru', 'Talio', 'Tampijak', 'Teluk Betung', 'Teluk Sampudau'] },
        { id: 'barsel_dhilir', nama: 'Dusun Hilir', lat: -2.2350, lon: 114.8850, medan: 'rusak', desa: ['Mengkatip', 'Batampang', 'Batilap', 'Damparan', 'Kalanis', 'Lehai', 'Mahajandau', 'Mangkatir', 'Sungai Jaya', 'Teluk Timbau'] },
        { id: 'barsel_jenamas', nama: 'Jenamas', lat: -2.4150, lon: 114.9550, medan: 'rusak', desa: ['Rantau Kujang', 'Rangga Ilung', 'Rantau Bahuang', 'Tabatan', 'Tampulang'] }
      ]
    },
    /* 12. KAB. BARITO TIMUR — 10 Kecamatan · 103 Desa/Kelurahan */
    baritotimur: {
      nama: 'Kab. Barito Timur', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'bartim_dtimur', nama: 'Dusun Timur', lat: -2.1115, lon: 115.1665, medan: 'mulus', desa: ['Tamiang Layang', 'Didi', 'Dorong', 'Gumpa', 'Harara', 'Haringen', 'Jaar', 'Jaweten', 'Karang Langit', 'Magantis', 'Mangkarap', 'Maragut', 'Matabu', 'Matarah', 'Pulau Patai', 'Sarapat', 'Sumur'] },
        { id: 'bartim_blima', nama: 'Benua Lima', lat: -2.2120, lon: 115.2650, medan: 'mulus', desa: ['Taniran', 'Bagok', 'Bamban', 'Banyu Landas', 'Gudang Seng', 'Kandris', 'Tewah Pupuh'] },
        { id: 'bartim_dtengah', nama: 'Dusun Tengah', lat: -1.8680, lon: 115.1450, medan: 'mulus', desa: ['Ampah Kota', 'Ampah Dua', 'Muara Awang', 'Netampin', 'Putai', 'Rodok', 'Saing', 'Sumber Garunggung'] },
        { id: 'bartim_pkarau', nama: 'Pematang Karau', lat: -1.9750, lon: 114.9950, medan: 'bergelombang', desa: ['Bambulung', 'Bararawa', 'Ketab', 'Kupang Bersih', 'Lampeong', 'Lebo', 'Muara Palantau', 'Muruduyung', 'Nagaleah', 'Pinang Tunggal', 'Sumberejo', 'Tumpung Ulung', 'Tuyau'] },
        { id: 'bartim_paku', nama: 'Paku', lat: -1.9650, lon: 115.1380, medan: 'mulus', desa: ['Tampa', 'Bantai Napu', 'Gandrung', 'Kalamus', 'Kupang Baru', 'Luau Jawuk', 'Paku Beto', 'Pangkan', 'Patung', 'Runggu Raya', 'Simpang Bingkuang', 'Tarinsing'] },
        { id: 'bartim_rbatuah', nama: 'Raren Batuah', lat: -1.7920, lon: 115.2250, medan: 'bergelombang', desa: ['Unsum', 'Baruyan', 'Batuah', 'Lenggang', 'Malintut', 'Puri', 'Sibung', 'Tangkum', 'Turan Amis'] },
        { id: 'bartim_kjanang', nama: 'Karusen Janang', lat: -2.0250, lon: 115.1520, medan: 'mulus', desa: ['Dayu', 'Ipu Mea', 'Kandris', 'Lagan', 'Putut Tawuluh', 'Simpang Naneng', 'Wuran'] },
        { id: 'bartim_awang', nama: 'Awang', lat: -2.0450, lon: 115.2750, medan: 'bergelombang', desa: ['Hayaping', 'Ampari', 'Apar Batu', 'Bangkirayen', 'Biwan', 'Danau', 'Janah Jari', 'Janah Mansiwui', 'Pianggu', 'Tangkan', 'Wungkur Nanakan'] },
        { id: 'bartim_ptutui', nama: 'Patangkep Tutui', lat: -2.1450, lon: 115.3250, medan: 'perbukitan', desa: ['Bentot', 'Ampari Bora', 'Betang Nalong', 'Jango', 'Kambitin', 'Kotam', 'Lalap', 'Mawani', 'Pulau Padang', 'Ramania'] },
        { id: 'bartim_pepat', nama: 'Paju Epat', lat: -2.1950, lon: 115.0550, medan: 'bergelombang', desa: ['Telang', 'Balawa', 'Juru Banu', 'Kalinapu', 'Maipe', 'Murutuwu', 'Siong', 'Tampu Langit', 'Telang Baru'] }
      ]
    },
    /* 13. KAB. BARITO UTARA — 9 Kecamatan · 103 Desa/Kelurahan */
    baritoutara: {
      nama: 'Kab. Barito Utara', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'barut_ttengah', nama: 'Teweh Tengah', lat: -0.9554, lon: 114.8965, medan: 'kota', desa: ['Melayu', 'Lanjas', 'Beringin Raya', 'Datai Nirui', 'Lemo I', 'Lemo II', 'Pendreh', 'Rimba Sari', 'Sungai Rahayu I', 'Sungai Rahayu II'] },
        { id: 'barut_tbaru', nama: 'Teweh Baru', lat: -0.9680, lon: 114.9520, medan: 'mulus', desa: ['Jambu', 'Jingah', 'Gandring', 'Hajak', 'Liang Buah', 'Liang Naga', 'Malawaken', 'Panaen', 'Sabuh', 'Sikui'] },
        { id: 'barut_tselatan', nama: 'Teweh Selatan', lat: -1.1250, lon: 114.9450, medan: 'mulus', desa: ['Trahean', 'Bintang Ninggi I', 'Bintang Ninggi II', 'Bukit Sawit', 'Buntok Baru', 'Butong', 'Pandran Permai', 'Pandran Raya', 'Tawan Jaya', 'Trinsing'] },
        { id: 'barut_ttimur', nama: 'Teweh Timur', lat: -0.8850, lon: 115.3250, medan: 'rusak', desa: ['Benangin 1', 'Benangin 2', 'Benangin 3', 'Benangin 5', 'Jamut', 'Liju', 'Mampuak I', 'Mampuak II', 'Muara Wakat', 'Sampirang I', 'Sampirang II', 'Sungai Liju'] },
        { id: 'barut_montallat', nama: 'Montallat', lat: -1.2450, lon: 114.8920, medan: 'bergelombang', desa: ['Tumpung Laung II', 'Tumpung Laung I', 'Montallat I', 'Montallat II', 'Kamawen', 'Paring Lahung', 'Pepas', 'Rubei', 'Ruji', 'Sikan'] },
        { id: 'barut_gtimang', nama: 'Gunung Timang', lat: -1.2650, lon: 115.0850, medan: 'bergelombang', desa: ['Kandui', 'Baliti', 'Baturaya I', 'Baturaya II', 'Jaman', 'Ketapang', 'Majangkan', 'Malungai', 'Payang Ara', 'Pelari', 'Rarawa', 'Sangkurang', 'Siwau', 'Tapen Raya', 'Tongka', 'Walur'] },
        { id: 'barut_gpurei', nama: 'Gunung Purei', lat: -1.1650, lon: 115.4850, medan: 'perbukitan', desa: ['Lampeong II', 'Lampeong I', 'Baok', 'Berong', 'Lawarang', 'Linon Besi I', 'Linon Besi II', 'Muara Mea', 'Payang', 'Tambaba', 'Tanjung Harapan'] },
        { id: 'barut_lahei', nama: 'Lahei', lat: -0.7850, lon: 114.9850, medan: 'bergelombang', desa: ['Lahei II', 'Lahei I', 'Bengahon', 'Haragandang', 'Hurung Enep', 'Ipu', 'Juju Baru', 'Karendan', 'Muara Bakah', 'Muara Inu', 'Muara Pari', 'Mukut', 'Rahaden'] },
        { id: 'barut_lbarat', nama: 'Lahei Barat', lat: -0.8250, lon: 114.7950, medan: 'rusak', desa: ['Benao Hulu', 'Benao Hilir', 'Jangkang Baru', 'Jangkang Lama', 'Karamuan', 'Luwe Hilir', 'Luwe Hulu', 'Nihan Hilir', 'Nihan Hulu', 'Papar Pujung', 'Teluk Malewai'] }
      ]
    },
    /* 14. KAB. MURUNG RAYA — 10 Kecamatan · 125 Desa/Kelurahan */
    murungraya: {
      nama: 'Kab. Murung Raya', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'mura_murung', nama: 'Murung', lat: -0.6352, lon: 114.5685, medan: 'mulus', desa: ['Beriwit', 'Puruk Cahu', 'Bahitom', 'Batu Putih', 'Danau Usung', 'Dirung', 'Juking Pajang', 'Malasan', 'Mangkahui', 'Muara Bumban', 'Muara Jaan', 'Muara Sumpoi', 'Muara Untu', "Panu'ut", 'Penyang'] },
        { id: 'mura_tsiang', nama: 'Tanah Siang', lat: -0.4650, lon: 114.5150, medan: 'perbukitan', desa: ['Saripoi', 'Belawan', 'Cangkang', 'Dirung Bakung', 'Doan Arung', 'Kalang Kaluh', 'Karali', 'Kolam', 'Konut', 'Mahanyan', 'Mangkolisoi', 'Mantiat Pari', 'Muwun', 'Nono Kliwon', 'Olung Balo', 'Olung Baloi', 'Olung Dojou', 'Olung Nango', 'Olung Siron', 'Olung Ulu', 'Osom Tompok', 'Puruk Batu', 'Saruhung', 'Sungai Lunuk', 'Tabulang', 'Tinotalih', 'Tokung'] },
        { id: 'mura_tssel', nama: 'Tanah Siang Selatan', lat: -0.5620, lon: 114.4850, medan: 'perbukitan', desa: ['Dirung Lingkin', 'Datah Kotou', 'Olung Hanangan', 'Olung Muro', 'Oreng', 'Puruk Kambang', 'Tahujan Ontu'] },
        { id: 'mura_ltuhup', nama: 'Laung Tuhup', lat: -0.5580, lon: 114.7650, medan: 'bergelombang', desa: ['Muara Laung I', 'Batu Bua I', 'Muara Tuhup', 'Batu Bua II', 'Batu Tuhup', 'Beralang', 'Beras Balange', 'Biha', 'Dirung Derarung', 'Dirung Pinang', 'Dirung Pundu', 'Kalang Dohong', 'Lakutan', 'Muara Laung II', 'Muara Maruwei I', 'Muara Maruwei II', 'Muara Tupuh', 'Narui', 'Pelaci', 'Penda Siron', 'Tahujan Laung', 'Tawai Haui', 'Tumbang Bahan', 'Tumbang Bana', 'Tumbang Bondang', 'Tumbang Tonduk'] },
        { id: 'mura_btr', nama: 'Barito Tuhup Raya', lat: -0.4520, lon: 114.9550, medan: 'rusak', desa: ['Makunjung', 'Batu Tojah', 'Bumban Tuhup', 'Cinta Budiman', 'Dirung Sararung', 'Hingan Tokung', 'Kohong', 'Liang Nyaling', 'Tumbang Baloi', 'Tumbang Bauh', 'Tumbang Masalo'] },
        { id: 'mura_pintan', nama: 'Permata Intan', lat: -0.3450, lon: 114.3450, medan: 'rusak', desa: ['Tumbang Lahung', 'Muara Bakanon', 'Baratu', 'Juking Sopan', 'Muara Babuat', 'Pantai Laga', 'Purnama', 'Sungai Bakanon', 'Sungai Batang', 'Sungai Gula', 'Sungai Lobang', 'Tumbang Salio'] },
        { id: 'mura_sbabuat', nama: 'Sungai Babuat', lat: -0.2580, lon: 114.2550, medan: 'tanah', desa: ['Tumbang Bantian', 'Batu Mirau', 'Tambelum', 'Tumbang Apat', 'Tumbang Kolon', "Tumbang Sa'an"] },
        { id: 'mura_sbarito', nama: 'Sumber Barito', lat: -0.1850, lon: 114.3650, medan: 'tanah', desa: ['Tumbang Kunyi', 'Batu Makap', 'Kelapeh Baru', "La'as Baru", 'Olung Liko', 'Teluk Jolo', 'Tumbang Masao', 'Tumbang Molut', 'Tumbang Tuan'] },
        { id: 'mura_sriam', nama: 'Seribu Riam', lat: -0.0250, lon: 114.1250, medan: 'tanah', desa: ['Muara Joloi I', 'Muara Joloi II', 'Parahau', 'Takajung', 'Tumbang Jojang', 'Tumbang Naan', 'Tumbang Tohan'] },
        { id: 'mura_umurung', nama: 'Uut Murung', lat: 0.1450, lon: 114.5950, medan: 'tanah', desa: ['Tumbang Olong', 'Kalasin', 'Tumbang Olong II', 'Tumbang Topus', 'Tumbang Tujang'] }
      ]
    }
  };

  /* Koridor kecamatan asli sepanjang ruas Trans-Kalimantan Tengah & jalur lintas provinsi (Kalbar ↔ Kalteng ↔ Kalsel ↔ Kaltim) */
  var KORIDOR_KALTENG = {
    /* Perbatasan Kalbar ↔ Kalteng (full lintas desa/kecamatan kedua provinsi secara monotonik!) */
    'ketapang|sukamara': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_bkayong'], ['ketapang', 'ktp_mhs'], ['ketapang', 'ktp_kendawangan'], ['sukamara', 'skm_jelai'], ['sukamara', 'skm_sukamara']],
    'ketapang|lamandau': [['ketapang', 'ktp_dpawan'], ['ketapang', 'ktp_mpawan'], ['ketapang', 'ktp_smrayak'], ['ketapang', 'ktp_pemahan'], ['ketapang', 'ktp_ttiti'], ['ketapang', 'ktp_jelai'], ['lamandau', 'lmd_lamandau'], ['lamandau', 'lmd_bulik']],
    /* Intra Kalimantan Tengah (15 ruas utama) */
    'sukamara|kotawaringinbarat': [['sukamara', 'skm_sukamara'], ['kotawaringinbarat', 'kobar_kolam'], ['kotawaringinbarat', 'kobar_arsel']],
    'lamandau|kotawaringinbarat': [['lamandau', 'lmd_bulik'], ['lamandau', 'lmd_sjaya'], ['kotawaringinbarat', 'kobar_kolam'], ['kotawaringinbarat', 'kobar_arsel']],
    'kotawaringinbarat|seruyan': [['kotawaringinbarat', 'kobar_arsel'], ['kotawaringinbarat', 'kobar_plada'], ['kotawaringinbarat', 'kobar_pbanteng'], ['seruyan', 'sry_dseluluk'], ['seruyan', 'sry_hanau'], ['seruyan', 'sry_sraya'], ['seruyan', 'sry_dsembuluh'], ['seruyan', 'sry_shilir']],
    'kotawaringinbarat|kotawaringintimur': [['kotawaringinbarat', 'kobar_arsel'], ['kotawaringinbarat', 'kobar_plada'], ['kotawaringinbarat', 'kobar_pbanteng'], ['seruyan', 'sry_dseluluk'], ['seruyan', 'sry_hanau'], ['kotawaringintimur', 'kotim_telawang'], ['kotawaringintimur', 'kotim_kbesi'], ['kotawaringintimur', 'kotim_baamang'], ['kotawaringintimur', 'kotim_mbk']],
    'seruyan|kotawaringintimur': [['seruyan', 'sry_shilir'], ['seruyan', 'sry_shtimur'], ['kotawaringintimur', 'kotim_tsampit'], ['kotawaringintimur', 'kotim_mhs'], ['kotawaringintimur', 'kotim_mhu'], ['kotawaringintimur', 'kotim_mbk']],
    'kotawaringintimur|katingan': [['kotawaringintimur', 'kotim_mbk'], ['kotawaringintimur', 'kotim_baamang'], ['kotawaringintimur', 'kotim_kbesi'], ['kotawaringintimur', 'kotim_cempaga'], ['kotawaringintimur', 'kotim_chulu'], ['katingan', 'ktg_khilir']],
    'katingan|palangkaraya': [['katingan', 'ktg_khilir'], ['palangkaraya', 'plk_bbatu'], ['palangkaraya', 'plk_jraya']],
    'palangkaraya|gunungmas': [['palangkaraya', 'plk_jraya'], ['palangkaraya', 'plk_pahandut'], ['pulangpisau', 'pps_ktengah'], ['pulangpisau', 'pps_btingang'], ['gunungmas', 'gmas_sepang'], ['gunungmas', 'gmas_mihing'], ['gunungmas', 'gmas_kurun']],
    'palangkaraya|pulangpisau': [['palangkaraya', 'plk_pahandut'], ['palangkaraya', 'plk_sabangau'], ['pulangpisau', 'pps_jabiren'], ['pulangpisau', 'pps_khilir']],
    'pulangpisau|kapuas': [['pulangpisau', 'pps_khilir'], ['kapuas', 'kps_basarang'], ['kapuas', 'kps_selat']],
    'palangkaraya|baritoselatan': [['palangkaraya', 'plk_pahandut'], ['pulangpisau', 'pps_ktengah'], ['kapuas', 'kps_mantangai'], ['kapuas', 'kps_timpah'], ['baritoselatan', 'barsel_dsel']],
    'baritoselatan|baritotimur': [['baritoselatan', 'barsel_dsel'], ['baritotimur', 'bartim_pkarau'], ['baritotimur', 'bartim_dtengah'], ['baritotimur', 'bartim_paku'], ['baritotimur', 'bartim_kjanang'], ['baritotimur', 'bartim_dtimur']],
    'baritoselatan|baritoutara': [['baritoselatan', 'barsel_dsel'], ['baritoselatan', 'barsel_dutara'], ['baritoutara', 'barut_gtimang'], ['baritoutara', 'barut_montallat'], ['baritoutara', 'barut_tselatan'], ['baritoutara', 'barut_ttengah']],
    'baritoutara|murungraya': [['baritoutara', 'barut_ttengah'], ['baritoutara', 'barut_lahei'], ['baritoutara', 'barut_lbarat'], ['murungraya', 'mura_ltuhup'], ['murungraya', 'mura_murung']],
    'gunungmas|baritoutara': [['gunungmas', 'gmas_kurun'], ['kapuas', 'kps_mtalawang'], ['kapuas', 'kps_khulu'], ['baritoutara', 'barut_lbarat'], ['baritoutara', 'barut_ttengah']],
    /* Perbatasan Kalteng ↔ Kalsel & Kaltim */
    'kapuas|baritokuala': [['kapuas', 'kps_selat'], ['kapuas', 'kps_khilir'], ['kapuas', 'kps_ktimur']],
    'baritotimur|tabalong': [['baritotimur', 'bartim_dtimur'], ['baritotimur', 'bartim_blima']],
    'baritoutara|kubar': [['baritoutara', 'barut_ttengah'], ['baritoutara', 'barut_tbaru'], ['baritoutara', 'barut_ttimur'], ['baritoutara', 'barut_gpurei']]
  };

  /* Masjid & rumah ibadah ikonik di seluruh ibu kota Kabupaten/Kota Kalimantan Tengah */
  var MASJID_KALTENG = {
    plk_jraya: ['Masjid Raya Darussalam Palangka Raya', 'Masjid Kubah Kecubung Darurrahman'],
    plk_pahandut: ['Masjid Agung Kubah Hijau Pahandut', 'Masjid Nurul Islam Palangka Raya'],
    kobar_arsel: ['Masjid Agung Riyadlush Shalihin Pangkalan Bun', 'Masjid Jami Kyai Gede'],
    kobar_kolam: ['Masjid Kyai Gede Kotawaringin Lama'],
    skm_sukamara: ['Masjid Agung Ad-Durrun Nafis Sukamara'],
    lmd_bulik: ['Masjid Agung Baiturrahman Nanga Bulik'],
    sry_shilir: ['Masjid Agung Nurul Yaqin Kuala Pembuang'],
    kotim_mbk: ['Masjid Wahyu Al-Hadi Islamic Center Sampit', 'Masjid Raya Nur Mentaya'],
    ktg_khilir: ['Masjid Agung Al-Ghufron Kasongan'],
    pps_khilir: ['Masjid Agung Ar-Raudhah Pulang Pisau'],
    kps_selat: ['Masjid Agung Al-Mukarram Amanah Kuala Kapuas'],
    gmas_kurun: ['Masjid Agung Darun Najah Kuala Kurun'],
    barsel_dsel: ['Masjid Agung Baiturrahman Buntok'],
    bartim_dtimur: ['Masjid Agung Ar-Rahman Tamiang Layang'],
    barut_ttengah: ['Masjid Raya Shiratal Mustaqim Muara Teweh', 'Masjid Islamic Center Muara Teweh'],
    mura_murung: ['Masjid Agung Al-Istiqlal Puruk Cahu']
  };

  if (g.KK_WILAYAH && g.KK_WILAYAH.daftarProvinsi) {
    g.KK_WILAYAH.daftarProvinsi('kalteng', 'Kalimantan Tengah', KALTENG, KORIDOR_KALTENG, MASJID_KALTENG);
  } else {
    g._KK_PENDING_PROV = g._KK_PENDING_PROV || [];
    g._KK_PENDING_PROV.push(['kalteng', 'Kalimantan Tengah', KALTENG, KORIDOR_KALTENG, MASJID_KALTENG]);
  }
})(typeof window !== 'undefined' ? window : this);
