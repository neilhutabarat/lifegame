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
        { id: 'plk_pahandut', nama: 'Pahandut', lat: -2.2136, lon: 113.9315, medan: 'kota', desa: ['Pahandut', 'Panarung', 'Langkai', 'Tumbang Rungan', 'Pahandut Seberang', 'Tanjung Pinang'] },
        { id: 'plk_sabangau', nama: 'Sabangau', lat: -2.3010, lon: 113.9180, medan: 'mulus', desa: ['Kereng Bangkirai', 'Bereng Bengkel', 'Kalampangan', 'Kameloh Baru', 'Danau Tundai', 'Sabaru'] },
        { id: 'plk_bbatu', nama: 'Bukit Batu', lat: -1.9850, lon: 113.7650, medan: 'mulus', desa: ['Tangkiling', 'Marang', 'Tumbang Tahai', 'Banturung', 'Sei Gohong', 'Kanarakan', 'Habaring Hurung'] },
        { id: 'plk_rakumpit', nama: 'Rakumpit', lat: -1.7820, lon: 113.6850, medan: 'bergelombang', desa: ['Petuk Barunai', 'Petuk Bukit', 'Panjehang', 'Mungku Baru', 'Pager', 'Gaung Baru', 'Bukit Sua'] }
      ]
    },
    /* 2. KAB. KOTAWARINGIN BARAT — 6 Kecamatan · 94 Desa/Kelurahan */
    kotawaringinbarat: {
      nama: 'Kab. Kotawaringin Barat', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kobar_arsel', nama: 'Arut Selatan', lat: -2.6832, lon: 111.6259, medan: 'kota', desa: ['Sidorejo', 'Mendawai Seberang', 'Mendawai', 'Madurejo', 'Raja', 'Raja Seberang', 'Baru', 'Tanjung Putri', 'Pasir Panjang', 'Rangda', 'Kenambui', 'Runtu', 'Umpang', 'Kumpai Batu Bawah', 'Kumpai Batu Atas', 'Natai Raya', 'Medang Sari', 'Natai Baru', 'Tanjung Terantang', 'Sulung'] },
        { id: 'kobar_kumai', nama: 'Kumai', lat: -2.7420, lon: 111.7250, medan: 'pesisir', desa: ['Kumai Hulu', 'Candi', 'Kumai Hilir', 'Sungai Cabang', 'Teluk Pulai', 'Sabuai', 'Keraya', 'Teluk Bogam', 'Sungai Bakau', 'Kubu', 'Sungai Kapitan', 'Batu Belaman', 'Sungai Tendang', 'Sungai Sekonyer', 'Sungai Bedaun', 'Bumi Harjo', 'Pangkalan Satu', 'Sabuai Timur'] },
        { id: 'kobar_plada', nama: 'Pangkalan Lada', lat: -2.5920, lon: 111.7920, medan: 'mulus', desa: ['Pandu Sanjaya', 'Pangkalan Tiga', 'Lada Mandala Jaya', 'Makarti Jaya', 'Sumber Agung', 'Purbasari', 'Sungai Rangit Jaya', 'Pangkalan Dewa', 'Kadipi Atas', 'Sungai Melawen', 'Pangkalan Durin'] },
        { id: 'kobar_pbanteng', nama: 'Pangkalan Banteng', lat: -2.5180, lon: 111.9150, medan: 'mulus', desa: ['Karang Mulya', 'Pangkalan Banteng', 'Mulya Jadi', 'Kebun Agung', 'Sido Mulyo', 'Marga Mulya', 'Amin Jaya', 'Arga Mulya', 'Natai Kerbau', 'Simpang Berambai', 'Sungai Hijau', 'Sungai Pakit', 'Berambai Makmur', 'Karang Sari', 'Sungai Pulau', 'Sungai Bengkuang', 'Sungai Kuning'] },
        { id: 'kobar_kolam', nama: 'Kotawaringin Lama', lat: -2.4950, lon: 111.4350, medan: 'mulus', desa: ['Kotawaringin Hulu', 'Kotawaringin Hilir', 'Babual Baboti', 'Tempayung', 'Sakabulin', 'Kinjil', 'Dawak', 'Riam Durian', 'Lalang', 'Rungun', 'Kondang', 'Suka Jaya', 'Suka Makmur', 'Sumber Mukti', 'Palih Baru', 'Ipuh Bangun Jaya', 'Sagu Suka Mulya'] },
        { id: 'kobar_arut', nama: 'Arut Utara', lat: -2.1450, lon: 111.7550, medan: 'rusak', desa: ['Pangkut', 'Nanga Mua', 'Sukarami', 'Gandis', 'Kerabu', 'Sambi', 'Penyombaan', 'Pandau', 'Riam', 'Panahan', 'Sungai Dau'] }
      ]
    },
    /* 3. KAB. SUKAMARA — 5 Kecamatan · 32 Desa/Kelurahan */
    sukamara: {
      nama: 'Kab. Sukamara', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'skm_sukamara', nama: 'Sukamara', lat: -2.7125, lon: 111.2365, medan: 'mulus', desa: ['Mendawai', 'Padang', 'Natai Sedawak', 'Pudu', 'Kartamulia', 'Sukaraja', 'Pangkalan Muntai', 'Petarikan'] },
        { id: 'skm_briam', nama: 'Balai Riam', lat: -2.4150, lon: 111.1680, medan: 'bergelombang', desa: ['Balai Riam', 'Jihing', 'Air Dua', 'Lupu Peruca', 'Pempaning', 'Sekuningan Baru', 'Bangun Jaya', 'Bukit Sungkai'] },
        { id: 'skm_jelai', nama: 'Jelai', lat: -2.9850, lon: 111.0920, medan: 'pesisir', desa: ['Kuala Jelai', 'Pulau Nibung', 'Sungai Baru', 'Sungai Bundung', 'Sungai Raja'] },
        { id: 'skm_plunci', nama: 'Pantai Lunci', lat: -2.9420, lon: 111.3350, medan: 'pesisir', desa: ['Sungai Cabang Barat', 'Sungai Damar', 'Sungai Tabuk', 'Sungai Pasir'] },
        { id: 'skm_pkecubung', nama: 'Permata Kecubung', lat: -2.3520, lon: 111.2980, medan: 'bergelombang', desa: ['Ajang', 'Kenawan', 'Laman Baru', 'Semantun', 'Nibung Terjun', 'Natai Kondang', 'Sembikuan'] }
      ]
    },
    /* 4. KAB. LAMANDAU — 8 Kecamatan · 88 Desa/Kelurahan */
    lamandau: {
      nama: 'Kab. Lamandau', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'lmd_bulik', nama: 'Bulik', lat: -2.1680, lon: 111.4620, medan: 'mulus', desa: ['Nanga Bulik', 'Sungai Mentawa', 'Guci', 'Batu Kotam', 'Kujan', 'Bunut', 'Beruta', 'Tamiang', 'Bumi Agung', 'Sumber Mulya', 'Bukit Indah', 'Arga Mulya', 'Perigi Raya', 'Nanga Pamalontian'] },
        { id: 'lmd_sjaya', nama: 'Sematu Jaya', lat: -2.2950, lon: 111.4480, medan: 'mulus', desa: ['Purwareja', 'Bina Bhakti', 'Wonorejo', 'Mekar Mulya', 'Jangkar Prima', 'Tri Tunggal', 'Batu Hambawang', 'Rimba Jaya'] },
        { id: 'lmd_mraya', nama: 'Menthobi Raya', lat: -2.1850, lon: 111.6150, medan: 'bergelombang', desa: ['Bukit Raya', 'Melata', 'Nanuah', 'Batu Ampar', 'Lubuk Hiju', 'Topalan', 'Bukit Makmur', 'Modang Mas', 'Mukti Manunggal', 'Sumber Jaya', 'Bukit Harum'] },
        { id: 'lmd_btimur', nama: 'Bulik Timur', lat: -2.0120, lon: 111.5520, medan: 'perbukitan', desa: ['Merambang', 'Nanga Palikodan', 'Sungkup', 'Nuangan', 'Nanga Koring', 'Toka', 'Sepondam', 'Pedongatan', 'Batu Tunggal', 'Nanga Kemujan', 'Bukit Jaya', 'Suka Maju'] },
        { id: 'lmd_lamandau', nama: 'Lamandau', lat: -2.0350, lon: 111.2780, medan: 'bergelombang', desa: ['Tapin Bini', 'Sungai Tuat', 'Tanjung Beringin', 'Cuhai', 'Kawa', 'Karang Taba', 'Penopa', 'Suja', 'Sekoban', 'Bakonsu', 'Samu Jaya'] },
        { id: 'lmd_delang', nama: 'Delang', lat: -1.7850, lon: 111.1250, medan: 'perbukitan', desa: ['Kudangan', 'Riam Panahan', 'Sepoyu', 'Nyalang', 'Riam Tinggi', 'Landau Kantu', 'Lopus', 'Kubung', 'Sekombulan', 'Penyombaan', 'Hulu Jojabo'] },
        { id: 'lmd_bkawa', nama: 'Batang Kawa', lat: -1.6950, lon: 111.2580, medan: 'tanah', desa: ['Kinipan', 'Batu Tambun', 'Ginih', 'Benakitan', 'Liku', 'Mengkalang', 'Karang Mas', 'Kina', 'Jamuat'] },
        { id: 'lmd_braya', nama: 'Belantikan Raya', lat: -1.8620, lon: 111.4250, medan: 'rusak', desa: ['Bayat', 'Nanga Belantikan', 'Sungai Buluh', 'Tangga Batu', 'Belibi', 'Karang Besi', 'Benuatan', 'Kahingai', 'Nanga Matu', 'Bintang Mangalih', 'Petarikan', 'Sumber Cahaya'] }
      ]
    },
    /* 5. KAB. SERUYAN — 10 Kecamatan · 100 Desa/Kelurahan */
    seruyan: {
      nama: 'Kab. Seruyan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'sry_shilir', nama: 'Seruyan Hilir', lat: -3.3830, lon: 112.5410, medan: 'pesisir', desa: ['Kuala Pembuang I', 'Kuala Pembuang II', 'Pematang Limau', 'Sungai Perlu', 'Tanjung Rangas', 'Muara Dua', 'Jahitan', 'Baung', 'Persil Raya', 'Sungai Undang'] },
        { id: 'sry_shtimur', nama: 'Seruyan Hilir Timur', lat: -3.2780, lon: 112.6480, medan: 'pesisir', desa: ['Pematang Panjang', 'Mekar Indah', 'Halimaung Jaya', 'Bangun Harja', 'Kartika Bhakti', 'Sungai Bakau'] },
        { id: 'sry_dsembuluh', nama: 'Danau Sembuluh', lat: -2.7650, lon: 112.3950, medan: 'bergelombang', desa: ['Sembuluh I', 'Telaga Pulang', 'Cempaka Baru', 'Palingkau', 'Ulak Batu', 'Paren', 'Banua Usang', 'Sembuluh II'] },
        { id: 'sry_sraya', nama: 'Seruyan Raya', lat: -2.6250, lon: 112.3620, medan: 'mulus', desa: ['Terawan', 'Selunuk', 'Lanpasa', 'Bangkal', 'Tabiku'] },
        { id: 'sry_hanau', nama: 'Hanau', lat: -2.4180, lon: 112.1650, medan: 'mulus', desa: ['Pembuang Hulu I', 'Tanjung Hanau', 'Parang Batang', 'Bahaur', 'Pembuang Hulu II', 'Derangga', 'Paring Raya'] },
        { id: 'sry_dseluluk', nama: 'Danau Seluluk', lat: -2.4650, lon: 112.0420, medan: 'mulus', desa: ['Asam Baru', 'Tanjung Hara', 'Tanjung Paring', 'Tanjung Rangas II', 'Panimba Raya', 'Rungau Raya'] },
        { id: 'sry_stengah', nama: 'Seruyan Tengah', lat: -1.9450, lon: 112.1650, medan: 'bergelombang', desa: ['Rantau Pulut', 'Gantung Pangayuh', 'Teluk Bayur', 'Suka Mandang', 'Ayawan', 'Mugi Panyuhu', 'Bukit Buluh', 'Tumbang Bai', 'Durian Tunggal', 'Pangke', 'Panyumpa', 'Sukorejo', 'Bumi Jaya', 'Suka Jaya', 'Panca Jaya', 'Tangga Batu', 'Ringin Agung', 'Batu Agung', 'Suka Makmur', 'Suka Maju'] },
        { id: 'sry_bampar', nama: 'Batu Ampar', lat: -2.0950, lon: 112.0550, medan: 'rusak', desa: ['Sandul', 'Sebabi', 'Kalang', 'Derawa', 'Wana Tirta', 'Suka Mulya', 'Durian Kait', 'Sahabu', 'Batu Menangis'] },
        { id: 'sry_shulu', nama: 'Seruyan Hulu', lat: -1.4920, lon: 112.1980, medan: 'tanah', desa: ['Tumbang Manjul', 'Tumbang Bahan', 'Tumbang Kalang', 'Tusuk Belawan', 'Marandang', 'Tumbang Suei', 'Mojang Baru', 'Rantau Panjang', 'Mongoh Juoi', 'Sepundu Hantu', 'Tumbang Kubang', 'Tumbang Laku', 'Tanjung Paku', 'Buntut Sapau', 'Tumbang Taberau', 'Riam Batang', 'Tumbang Sepan', 'Tumbang Setawai', 'Tumbang Kasai', 'Tumbang Darap'] },
        { id: 'sry_stambun', nama: 'Suling Tambun', lat: -1.3250, lon: 112.0850, medan: 'tanah', desa: ['Tumbang Langkai', 'Tumbang Magin', 'Tumbang Setoli', 'Tumbang Hentas', 'Tumbang Salau', 'Tumbang Gugup', 'Rangkang Munduk', 'Tanjung Tukal', 'Rantau Betung'] }
      ]
    },
    /* 6. KAB. KOTAWARINGIN TIMUR — 17 Kecamatan · 185 Desa/Kelurahan */
    kotawaringintimur: {
      nama: 'Kab. Kotawaringin Timur', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kotim_mbk', nama: 'Mentawa Baru Ketapang', lat: -2.5396, lon: 112.9502, medan: 'kota', desa: ['Mentawa Baru Hulu', 'Mentawa Baru Hilir', 'Ketapang', 'Sawahan', 'Pasir Putih', 'Pelangsian', 'Bapeang', 'Eka Bahurui', 'Telaga baru', 'Bangkuang Makmur', 'Bapanggang Raya'] },
        { id: 'kotim_baamang', nama: 'Baamang', lat: -2.5020, lon: 112.9480, medan: 'kota', desa: ['Baamang Tengah', 'Baamang Hilir', 'Baamang Hulu', 'Tanah Mas', 'Baamang Barat', 'Tinduk'] },
        { id: 'kotim_seranau', nama: 'Seranau', lat: -2.5380, lon: 112.9850, medan: 'bergelombang', desa: ['Mentaya Seberang', 'Terantang', 'Batuah', 'Terantang Hilir', 'Ganepo', 'Seragam Jaya'] },
        { id: 'kotim_kbesi', nama: 'Kota Besi', lat: -2.3820, lon: 112.9380, medan: 'mulus', desa: ['Kota Besi Hulu', 'Kota Besi Hilir', 'Palangan', 'Hanjalipan', 'Simpur', 'Pamalian', 'Camba', 'Kandan', 'Bajarum', 'Rasau Tumbuh', 'Soren'] },
        { id: 'kotim_telawang', nama: 'Telawang', lat: -2.4780, lon: 112.5650, medan: 'mulus', desa: ['Sebabi', 'Tanah Putih', 'Sumber Makmur', 'Kenyala', 'Penyang', 'Biru Maju'] },
        { id: 'kotim_cempaga', nama: 'Cempaga', lat: -2.2480, lon: 112.9520, medan: 'mulus', desa: ['Cempaka Mulia Barat', 'Rubung Buyung', 'Patai', 'Luwuk Ranggan', 'Jemaras', 'Cempaka Mulia Timur', 'Luwuk Bunter', 'Sungai Paring'] },
        { id: 'kotim_chulu', nama: 'Cempaga Hulu', lat: -2.0750, lon: 112.9450, medan: 'mulus', desa: ['Pundu', 'Keruing', 'Parit', 'Pantai Harapan', 'Pelantaran', 'Tumbang Koling', 'Sudan', 'Bukit Batu', 'Bukit Raya', 'Selucing', 'Sungai Ubar Mandiri'] },
        { id: 'kotim_parenggean', nama: 'Parenggean', lat: -1.9650, lon: 112.7920, medan: 'bergelombang', desa: ['Parenggean', 'Tehang', 'Kabuau', 'Barunang Miri', 'Sumber Makmur', 'Mekar Jaya', 'Karang Tunggal', 'Bandar Agung', 'Beringin Tunggal Jaya', 'Sari Harapan', 'Karang Sari', 'Bajarau', 'Bukit Harapan', 'Manjalin', 'Karya Bersama'] },
        { id: 'kotim_thulu', nama: 'Tualan Hulu', lat: -1.8150, lon: 112.8280, medan: 'bergelombang', desa: ['Luwuk Sampun', 'Tumbang Mujam', 'Merah', 'Tanjung Jorong', 'Sebungsu', 'Bukit Makmur', 'Wonosari', 'Mekar Sari', 'Damar Makmur', 'Cempaka Putih', 'Jati Waringin'] },
        { id: 'kotim_mhulu', nama: 'Mentaya Hulu', lat: -1.7850, lon: 112.5250, medan: 'rusak', desa: ['Kuala Kuayan', 'Tangar', 'Baampah', 'Kawan Batu', 'Tanjung Bantur', 'Penda Durian', 'Pahirangan', 'Satiung', 'Santilik', 'Tangka Robah', 'Pemantang', 'Tumbang Sapiri', 'Bawan', 'Tanjung Jariangau', 'Kapuk', 'Pantap'] },
        { id: 'kotim_bsantuai', nama: 'Bukit Santuai', lat: -1.4650, lon: 112.5650, medan: 'tanah', desa: ['Tumbang Tilap', 'Tumbang Kaminting', 'Tanah Haluan', 'Tumbang Panyahuan', 'Tumbang Sapia', 'Tumbang Getas', 'Tewai Hara', 'Tumbang Payang', 'Tumbang Kania', 'Tumbang Tawan', 'Lunuk Bagantung', 'Tumbang Torung', 'Tumbang Batu', 'Tumbang Saluang'] },
        { id: 'kotim_akalang', nama: 'Antang Kalang', lat: -1.5350, lon: 112.7820, medan: 'rusak', desa: ['Tumbang Kalang', 'Kuluk Telawang', 'Sungai Puring', 'Tumbang Ngahan', 'Tumbang Ramei', 'Tumbang Hejan', 'Sungai Hanya', 'Tumbang Sepayang', 'Buntut Nusa', 'Tumbang Gagu', 'Tumbang Manya', 'Gunung Makmur', 'Mulya Agung', 'Bhakti Karya', 'Waringin Agung'] },
        { id: 'kotim_tantang', nama: 'Telaga Antang', lat: -1.3620, lon: 112.7420, medan: 'tanah', desa: ['Tumbang Sangai', 'Tumbang Boloi', 'Luwuk Kowan', 'Rantau Tampang', 'Tumbang Mangkup', 'Rantau Katang', 'Tukang Langit', 'Beringin Agung', 'Agung Mulya', 'Batu Agung', 'Bukit Indah', 'Tumbang Puan', 'Rantau Suang', 'Rantau Sawang', 'Tanjung Harapan', 'Buana Mustika', 'Tri Buana', 'Tumbang Bajanei'] },
        { id: 'kotim_mhu', nama: 'Mentaya Hilir Utara', lat: -2.7080, lon: 112.9120, medan: 'mulus', desa: ['Pondok Damar', 'Bagendang Hilir', 'Bagendang Tengah', 'Natai Baru', 'Bagendang Hulu', 'Sumber Makmur', 'Bagendang Permai'] },
        { id: 'kotim_mhs', nama: 'Mentaya Hilir Selatan', lat: -2.8520, lon: 112.9380, medan: 'pesisir', desa: ['Samuda Kota', 'Basirih Hilir', 'Sebamban', 'Samuda Besar', 'Samuda Kecil', 'Jaya Kelapa', 'Basirih Hulu', 'Jaya Karet', 'Handil Sohor', 'Sei Ijum Raya'] },
        { id: 'kotim_tsampit', nama: 'Teluk Sampit', lat: -3.1450, lon: 112.9780, medan: 'pesisir', desa: ['Ujung Pandaran', 'Parebok', 'Basawang', 'Lampuyang', 'Regei Lestari', 'Kuin Permai'] },
        { id: 'kotim_phanaut', nama: 'Pulau Hanaut', lat: -2.9350, lon: 113.0250, medan: 'pulau', pulau: true, desa: ['Bapinang Hulu', 'Bapinang Hilir', 'Bapinang Hilir Laut', 'Satiruk', 'Makarti Jaya', 'Rawa Sari', 'Hanaut', 'Babirah', 'Serambut', 'Babaung', 'Bamadu', 'Penyaguan', 'Hantipan', 'Bantian'] }
      ]
    },
    /* 7. KAB. KATINGAN — 13 Kecamatan · 161 Desa/Kelurahan */
    katingan: {
      nama: 'Kab. Katingan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'ktg_khilir', nama: 'Katingan Hilir', lat: -1.8942, lon: 113.3895, medan: 'mulus', desa: ['Kasongan Lama', 'Kasongan Baru', 'Tewang Kadamba', 'Tumbang Liting', 'Talian Kereng', 'Banut Kalanaman', 'Talangkah', 'Hampalit'] },
        { id: 'ktg_tsg', nama: 'Tewang Sangalang Garing', lat: -1.7850, lon: 113.3250, medan: 'bergelombang', desa: ['Pendahara', 'Tewang Baringin', 'Hapalam', 'Tewang Rangas', 'Bangkuang', 'Tarusan Danum', 'Tumbang Tarusan', 'Tewang Rangkang', 'Tewang Manyangen', 'Karya Unggang'] },
        { id: 'ktg_pmalan', nama: 'Pulau Malan', lat: -1.6350, lon: 113.2150, medan: 'bergelombang', desa: ['Buntut Bali', 'Tewang Papari', 'Tewang Darayu', 'Kuluk Bali', 'Manduing Taheta', 'Manduing Lama', 'Tumbang Banjang', 'Tumbang Lawang', 'Dahian Tunggal', 'Tewang Karangan', 'Tumbang Tungku', 'Geragu', 'Tumbang Tanjung', 'Tura'] },
        { id: 'ktg_ktengah', nama: 'Katingan Tengah', lat: -1.4350, lon: 113.1050, medan: 'bergelombang', desa: ['Samba Kahayan', 'Tumbang Lahang', 'Tewang Panjang', 'Petak Puti', 'Telok', 'Samba Danum', 'Samba Bakumpai', 'Samba Katung', 'Napu Sahur', 'Batu Badinding', 'Rantau Asem', 'Mirah Kalanaman', 'Tumbang Kalemei', 'Tumbang Marak', 'Tumbang Hangei', 'Tumbang Pariyei'] },
        { id: 'ktg_smantikei', nama: 'Sanaman Mantikei', lat: -1.2420, lon: 113.0950, medan: 'rusak', desa: ['Tumbang Kaman', 'Dehes', 'Tumbang Labehu', 'Tumbang Manggo', 'Kamanto', 'Kuluk Habuhus', 'Tumbang Kanei', 'Tumbang Taranei', 'Tumbang Kawei', 'Tumbang Mangara', 'Tumbang Pangka', 'Tumbang Atei', 'Daya Manunggal', 'Rantau Bangkiang'] },
        { id: 'ktg_pmalai', nama: 'Petak Malai', lat: -1.0780, lon: 112.9250, medan: 'tanah', desa: ['Tumbang Baraoi', 'Tumbang Jala', 'Batu Badak', 'Batu Tukan', 'Tumbang Tangoi', 'Nusa Kutau', 'Tumbang Habangoi'] },
        { id: 'ktg_marikit', nama: 'Marikit', lat: -1.0620, lon: 112.6650, medan: 'tanah', desa: ['Tumbang Hiran', 'Tumbang Mandurei', 'Tumbang Paku', 'Buntut Leleng', 'Kuluk Leleng', 'Sabaung', 'Tumbang Malawan', 'Tumbang Taei', 'Rangan Surai', 'Tumbang Pahanei', 'Tumbang Dakei', 'Rangan Burih', 'Tumbang Bemban', 'Tumbang Lambi', 'Rangan Tangko', 'Tumbang Tundu', 'Batu Panahan', 'Tumbang Tabulus'] },
        { id: 'ktg_khulu', nama: 'Katingan Hulu', lat: -0.9620, lon: 112.5020, medan: 'tanah', desa: ['Tumbang Sanamang', 'Kiham Batang', 'Tumbang Kabayan', 'Rangan Kawit', 'Dehes Asem', 'Kuluk Sapangi', 'Tumbang Kuai', 'Tumbang Salaman', 'Rantau Puka', 'Rantau Bahai', 'Rangan Ranjing', 'Tumbang Labaning', 'Batu Bango', 'Tumbang Hangei II', 'Sei Nanjan', 'Tumbang Jiga', 'Tumbang Mangketai', 'Tumbang Mahop', 'Tumbang Sabetung', 'Penda Tanggaring Lama', 'Penda Tanggaring Baru', 'Teluk Tampang', 'Tumbang Manangei'] },
        { id: 'ktg_braya', nama: 'Bukit Raya', lat: -0.7850, lon: 112.4820, medan: 'tanah', desa: ['Tumbang Kajamei', 'Tumbang Gaei', 'Tumbang Kataei', 'Tumbang Karuei', 'Tumbang Dahuei', 'Rantau Pandan', 'Rangan Rondan', 'Rangan Bahekang', 'Tumbang Kaburai', 'Tanjung Batik', 'Penda Nange'] },
        { id: 'ktg_tpayawan', nama: 'Tasik Payawan', lat: -2.0950, lon: 113.3850, medan: 'bergelombang', desa: ['Petak Bahandang', 'Talingke', 'Hiyang Bana', 'Handiwung', 'Tumbang Panggo', 'Tewang Tampang', 'Luwuk Kanan', 'Luwuk Kiri'] },
        { id: 'ktg_kamipang', nama: 'Kamipang', lat: -2.3520, lon: 113.4380, medan: 'rusak', desa: ['Baun Bango', 'Galinggang', 'Tampelas', 'Telaga', 'Parupuk', 'Karuing', 'Jahanjang', 'Tumbang Runen', 'Asem Kumbang'] },
        { id: 'ktg_mendawai', nama: 'Mendawai', lat: -2.8650, lon: 113.2850, medan: 'rusak', desa: ['Mendawai', 'Teluk Sebulu', 'Kampung Melayu', 'Tewang Kampung', 'Perigi', 'Mekar Tani', 'Tumbang Bulan'] },
        { id: 'ktg_kkuala', nama: 'Katingan Kuala', lat: -3.2250, lon: 113.3350, medan: 'pesisir', desa: ['Pagatan Hilir', 'Pagatan Hulu', 'Kampung Keramat', 'Kampung Tengah', 'Jaya Makmur', 'Subur Indah', 'Kampung Baru', 'Bangun Jaya', 'Setia Mulia', 'Singam Raya', 'Sebangau Jaya', 'Sungai Kaki', 'Selat Baning', 'Makmur Utama', 'Bumi Subur', 'Bakung Raya'] }
      ]
    },
    /* 8. KAB. PULANG PISAU — 8 Kecamatan · 99 Desa/Kelurahan */
    pulangpisau: {
      nama: 'Kab. Pulang Pisau', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'pps_khilir', nama: 'Kahayan Hilir', lat: -2.7480, lon: 114.2280, medan: 'mulus', desa: ['Pulang Pisau', 'Kalawa', 'Bereng', 'Buntoi', 'Mintin', 'Mantaren I', 'Anjir Pulang Pisau', 'Gohong', 'Mantaren II', 'Hanjak Maju'] },
        { id: 'pps_jabiren', nama: 'Jabiren Raya', lat: -2.4780, lon: 114.1580, medan: 'mulus', desa: ['Jabiren', 'Garung', 'Henda', 'Simpur', 'Sakakajang', 'Pilang', 'Tumbang Nusa', 'Tanjung Taruna'] },
        { id: 'pps_ktengah', nama: 'Kahayan Tengah', lat: -2.0120, lon: 113.9980, medan: 'bergelombang', desa: ['Bukit Rawi', 'Tanjung Sangalang', 'Penda Barania', 'Tuwung', 'Sigi', 'Petuk Liti', 'Bukit Liti', 'Bahu Palawa', 'Pamarunan', 'Balukon', 'Bukit Bamba', 'Tahawa', 'Parahangan', 'Bereng Rambang'] },
        { id: 'pps_btingang', nama: 'Banama Tingang', lat: -1.7850, lon: 113.9720, medan: 'bergelombang', desa: ['Bawan', 'Manen Paduran', 'Manen Kaleka', 'Lawang Uru', 'Hurung', 'Hanua', 'Ramang', 'Tambak', 'Pahawan', 'Goha', 'Tumbang Tarusan', 'Pandawei', 'Pangi', 'Tangkahen', 'Kasali Baru'] },
        { id: 'pps_maliku', nama: 'Maliku', lat: -2.9320, lon: 114.1420, medan: 'bergelombang', desa: ['Maliku Baru', 'Tahai Jaya', 'Purwodadi', 'Wono Agung', 'Kanamit Barat', 'Sei Baru Tewu', 'Kanamit', 'Garantung', 'Gandang', 'Badirih', 'Tahai Baru', 'Sidodadi', 'Kanamit Jaya', 'Gandang Barat', 'Maliku Mulia'] },
        { id: 'pps_pbatu', nama: 'Pandih Batu', lat: -3.0580, lon: 114.1220, medan: 'bergelombang', desa: ['Pangkoh Hilir', 'Dandang', 'Talio', 'Pangkoh Hulu', 'Kantan Muara', 'Talio Muara', 'Talio Hulu', 'Pangkoh Sari', 'Sanggang', 'Pantik', 'Belanti Siam', 'Gadabung', 'Mulyasari', 'Kantan Dalam', 'Kantan Atas', 'Karya Bersama'] },
        { id: 'pps_kkuala', nama: 'Kahayan Kuala', lat: -3.2680, lon: 114.0850, medan: 'pesisir', desa: ['Bahaur Basantan', 'Cemantan', 'Papuyu II Sei. Barunai', 'Kiapak', 'Papuyu I Sei Pasaman', 'Sei. Rungun', 'Bahaur Hilir', 'Bahaur Tengah', 'Bahaur Hulu', 'Papuyu III Sei. Pudak', 'Tanjung Perawan', 'Bahaur Hulu Permai', 'Bahaur Batu Raya'] },
        { id: 'pps_skuala', nama: 'Sebangau Kuala', lat: -3.0850, lon: 113.7920, medan: 'rusak', desa: ['Sebangau Permai', 'Paduran Sebangau', 'Paduran Mulya', 'Sebangau Mulya', 'Mekar Jaya', 'Sebangau Jaya', 'Sei Hambawang', 'Sei Bakau'] }
      ]
    },
    /* 9. KAB. KAPUAS — 17 Kecamatan · 231 Desa/Kelurahan */
    kapuas: {
      nama: 'Kab. Kapuas', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'kps_selat', nama: 'Selat', lat: -3.0094, lon: 114.3878, medan: 'kota', desa: ['Selat Hilir', 'Murung Keramat', 'Selat Tengah', 'Selat Hulu', 'Selat Dalam', 'Selat Utara', 'Selat Barat', 'Panamas', 'Pulau Telo', 'Pulau Telo Baru'] },
        { id: 'kps_khilir', nama: 'Kapuas Hilir', lat: -2.9950, lon: 114.4150, medan: 'mulus', desa: ['Barimba', 'Mambulau', 'Hampatung', 'Dahirang', 'Sei Pasah', 'Bakungin', 'Sei Asam', 'Saka Batur'] },
        { id: 'kps_ktimur', nama: 'Kapuas Timur', lat: -3.0950, lon: 114.4620, medan: 'mulus', desa: ['Anjir Serapat Tengah', 'Anjir Serapat Timur', 'Anjir Serapat Barat', 'Anjir Mambulau Timur', 'Anjir Mambulau Tengah', 'Anjir Mambulau Barat', 'Anjir Serapat Baru'] },
        { id: 'kps_basarang', nama: 'Basarang', lat: -2.9420, lon: 114.3150, medan: 'mulus', desa: ['Basarang', 'Pangkalan Rekan', 'Batuah', 'Basungkai', 'Maluen', 'Pangkalan Sari', 'Lunuk Ramba', 'Batu Nindan', 'Basarang Jaya', 'Bungai Jaya', 'Panarung', 'Tarung Manuah', 'Tambun Raya', 'Naning'] },
        { id: 'kps_bataguh', nama: 'Bataguh', lat: -3.1280, lon: 114.3180, medan: 'bergelombang', desa: ['Pulau Kupang', 'Pulau Mambulau', 'Sei Lunuk', 'Sei Jangkit', 'Tamban Luar', 'Terusan Raya', 'Terusan Karya', 'Terusan Makmur', 'Terusan Mulya', 'Bamban Raya', 'Bangun Harjo', 'Terusan Baguntan Raya', 'Terusan Raya Barat', 'Terusan Raya Hulu', 'Budi Mufakat'] },
        { id: 'kps_ppetak', nama: 'Pulau Petak', lat: -2.9050, lon: 114.4250, medan: 'mulus', desa: ['Sei Tatas', 'Saka Lagon', 'Bunga Mawar', 'Narahan', 'Handiwung', 'Anjir Palambang', 'Palangkai', 'Teluk Palinget', 'Sei Tatas Hilir', 'Mawar Mekar', 'Banama', 'Narahan Baru'] },
        { id: 'kps_kbarat', nama: 'Kapuas Barat', lat: -2.8150, lon: 114.3820, medan: 'bergelombang', desa: ['Mandomai', 'Sei Kayu', 'Saka Mangkahai', 'Anjir Kalampan', 'Pantai', 'Saka Tamiang', 'Penda Katapi', 'Teluk Hiri', 'Sei Dusun', 'Sei Pitung', 'Maju Bersama', 'Basuta Raya'] },
        { id: 'kps_kmurung', nama: 'Kapuas Murung', lat: -2.7480, lon: 114.5150, medan: 'bergelombang', desa: ['Palingkau Lama', 'Palingkau Baru', 'Tajepan', 'Mampai', 'Muara Dadahup', 'Belawang', 'Palangkau Lama', 'Palangkau Baru', 'Talekung Punei', 'Karya Bersama', 'Palingkau Jaya', 'Palingkau Asri', 'Palingkau Sejahtera', 'Saka Binjai', 'Bina Sejahtera', 'Suka Reja', 'Suka Mukti', 'Bina Karya', 'Bina Mekar', 'Rawa Subur', 'Sumber Mulya', 'Bumi Rahayu', 'Manggala Permai'] },
        { id: 'kps_dadahup', nama: 'Dadahup', lat: -2.6250, lon: 114.5880, medan: 'bergelombang', desa: ['Dadahup', 'Tambak Bajai', 'Bina Jaya', 'Harapan Baru', 'Bentuk Jaya', 'Sumber Agung', 'Petak Batuah', 'Manuntung', 'Sumber Alaska', 'Menteng Karya', 'Tanjung Harapan', 'Kahuripan Permai', 'Dadahup Raya'] },
        { id: 'kps_tcatur', nama: 'Tamban Catur', lat: -3.2250, lon: 114.4420, medan: 'pesisir', desa: ['Tamban Baru Tengah', 'Tamban Baru Timur', 'Tamban Baru Mekar', 'Bandaraya', 'Sidorejo', 'Warna Sari', 'Bandar Mekar', 'Tamban Makmur', 'Sidomulyo', 'Tamban Jaya'] },
        { id: 'kps_kkuala', nama: 'Kapuas Kuala', lat: -3.3380, lon: 114.3750, medan: 'pesisir', desa: ['Lupak Dalam', 'Batanjung', 'Cemara Labat', 'Palampai', 'Sei Teras', 'Tamban Baru Selatan', 'Tamban Lupak', 'Lupak Timur', 'Wargo Mulyo', 'Sei Bakut', 'Pematang', 'Simpang Bunga Tanjung', 'Baranggau'] },
        { id: 'kps_mantangai', nama: 'Mantangai', lat: -2.4180, lon: 114.4250, medan: 'bergelombang', desa: ['Mantangai Hilir', 'Manusup', 'Sei Kapar', 'Tarantang', 'Lamunti', 'Pulau Kaladan', 'Mantangai Tengah', 'Mantangai Hulu', 'Kalumpang', 'Sei Ahas', 'Katunjung', 'Lahei Mangkutup', 'Tumbang Muroi', 'Danau Rawah', 'Muroi Raya', 'Katimpun', 'Manusup Hilir', 'Sei Gita', 'Bukit Batu', 'Sei Gawing', 'Humbang Raya', 'Tabore', 'Tumbang Mangkutup', 'Lapetan', 'Lamunti Permai', 'Manyahi', 'Sekata Makmur', 'Kaladan Jaya', 'Rantau Jaya', 'Warga Mulya', 'Lamunti Baru', 'Sriwidadi', 'Sumber Makmur', 'Sidomulyo', 'Harapan Jaya', 'Sekata Bangun', 'Sari Makmur', 'Suka Maju'] },
        { id: 'kps_timpah', nama: 'Timpah', lat: -1.9150, lon: 114.3850, medan: 'bergelombang', desa: ['Timpah', 'Petak Puti', 'Aruk', 'Lawang Kajang', 'Lungkuh Layang', 'Lawang Kamah', 'Tumbang Randang', 'Batapah', 'Danau Pantau'] },
        { id: 'kps_ktengah', nama: 'Kapuas Tengah', lat: -1.5250, lon: 114.3650, medan: 'rusak', desa: ['Pujon', 'Masaran', 'Kayu Bulan', 'Kota Baru', 'Penda Muntei', 'Tapen', 'Marapit', 'Manis', 'Karukus', 'Bajuh', 'Barunang', 'Buhut Jaya', 'Hurung Pukung'] },
        { id: 'kps_ptalawang', nama: 'Pasak Talawang', lat: -1.2850, lon: 114.2950, medan: 'rusak', desa: ['Jangkang', 'Tumbang Tukun', 'Sei Ringin', 'Kaburan', 'Balai Banjang', 'Tumbang Diring', 'Dandang', 'Hurung Kampin', 'Batu Sambung', 'Tumbang Nusa'] },
        { id: 'kps_khulu', nama: 'Kapuas Hulu', lat: -1.0450, lon: 114.1850, medan: 'tanah', desa: ['Sei Hanyo', 'Hurung Tabengan', 'Rahung Bungai', 'Bulau Ngandung', 'Tumbang Puroh', 'Tangirang', 'Barunang II', 'Hurung Tampang', 'Supang', 'Katanjung', 'Jakatan Pari', 'Tumbang Sirat', 'Dirung Koram', 'Mampai Jaya'] },
        { id: 'kps_mtalawang', nama: 'Mandau Talawang', lat: -0.9650, lon: 114.0450, medan: 'tanah', desa: ['Sei Pinang', 'Masaha', 'Lawang Tamang', "Karetau Manta'a", 'Tumbang Bukoi', 'Tumbang Tihis', 'Tumbang Manyarung', 'Tanjung Rendan', 'Jakatan Masaha', 'Masupa Ria'] }
      ]
    },
    /* 10. KAB. GUNUNG MAS — 12 Kecamatan · 127 Desa/Kelurahan */
    gunungmas: {
      nama: 'Kab. Gunung Mas', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'gmas_kurun', nama: 'Kurun', lat: -1.1068, lon: 113.8615, medan: 'bergelombang', desa: ['Tampang Tumbang Anjir', 'Kurun', 'Petak Bahandang', 'Tanjung Riu', 'Teluk Nyatu', 'Tumbang Lampahung', 'Tewang Pajangan', 'Tumbang Tariak', 'Tumbang Miwan', 'Hurung Bunut', 'Tumbang Hakau', 'Pilang Munduk', 'Tumbang Manyangan', 'Penda Pilang', 'Tumbang Tambirah'] },
        { id: 'gmas_sepang', nama: 'Sepang', lat: -1.4680, lon: 113.8720, medan: 'bergelombang', desa: ['Sepang Simin', 'Sepang Kota', 'Tewai Baru', 'Tanjung Karitak', 'Pamatang Limau', 'Tampelas', 'Rabauh'] },
        { id: 'gmas_mihing', nama: 'Mihing Raya', lat: -1.3250, lon: 113.8650, medan: 'bergelombang', desa: ['Kampuri', 'Tuyun', 'Tumbang Empas', 'Rangan Tate', 'Dahian Tambuk', 'Tumbang Danau'] },
        { id: 'gmas_tewah', nama: 'Tewah', lat: -0.9450, lon: 113.7920, medan: 'perbukitan', desa: ['Tewah', 'Sare Rangan', 'Tumbang Pajangei', 'Kasintu', 'Batu Nyiwuh', 'Tumbang Habaon', 'Sei Riang', 'Sandung Tambun', 'Tanjung Untung', 'Upon Batu', 'Sumur Mas', 'Batu Nyapau', 'Taja Urap', 'Teluk Lawah', 'Karason Raya', 'Rangan Mihing'] },
        { id: 'gmas_rungan', nama: 'Rungan', lat: -1.3850, lon: 113.6450, medan: 'rusak', desa: ['Jakatan Raya', 'Tumbang Jutuh', 'Tumbang Baringei', 'Tumbang Malahoi', 'Tumbang Bunut', 'Tumbang Kajuei', 'Luwuk Kantor', 'Luwuk Langkuas', 'Talangkah', 'Parempei', 'Linau', 'Bereng Baru', 'Bereng Malaka', 'Karya Bhakti'] },
        { id: 'gmas_rbarat', nama: 'Rungan Barat', lat: -1.4250, lon: 113.5050, medan: 'rusak', desa: ['Rabambang', 'Hujung Pata', 'Tumbang Jalemu Kajuei', 'Jalemu Raya', 'Jalemu Masulan', 'Mangkawuk', 'Tajah Antang Raya', 'Tumbang Kuayan', 'Tumbang Langgah', 'Tusang Raya', 'Tumbang Bahanei'] },
        { id: 'gmas_rhulu', nama: 'Rungan Hulu', lat: -1.1650, lon: 113.5850, medan: 'rusak', desa: ['Tumbang Rahuyan', 'Jangkit', 'Tumbang Lapan', 'Batu Puter', 'Sei Antai', 'Hantapang', 'Sangal', 'Tumbang Tuwe Hantapang', 'Tumbang Mujai'] },
        { id: 'gmas_manuhing', nama: 'Manuhing', lat: -1.5350, lon: 113.4550, medan: 'rusak', desa: ['Tumbang Talaken', 'Tumbang Sepan', 'Tangki Dahuyan', 'Bereng Balawan', 'Bereng Jun', 'Takaras', 'Belawan Mulia', 'Taringen', 'Bangun Sari', 'Fajar Harapan', 'Gohong', 'Tumbang Jalemu'] },
        { id: 'gmas_mraya', nama: 'Manuhing Raya', lat: -1.3150, lon: 113.3850, medan: 'tanah', desa: ['Tehang', 'Tumbang Samui', 'Tumbang Oroi', 'Luwuk Tukau', 'Putat Durei', 'Tumbang Mantuhe'] },
        { id: 'gmas_khu', nama: 'Kahayan Hulu Utara', lat: -0.7850, lon: 113.7150, medan: 'perbukitan', desa: ['Tumbang Miri', 'Batu Tangkoi', 'Penda Rangas', 'Tumbang Sian', 'Tumbang Pasangon', 'Tumbang Korik', 'Tumbang Ponyoi', 'Dandang', 'Tumbang Hamputung', 'Tumbang Tajungan', 'Tumbang Takaoi', 'Teluk Kanduri'] },
        { id: 'gmas_dbatu', nama: 'Damang Batu', lat: -0.6650, lon: 113.5250, medan: 'tanah', desa: ['Tumbang Marikoi', 'Lawang Kanji', 'Tumbang Mahuroi', 'Karetau Rambangun', 'Karetau Sarian', 'Tumbang Posu', 'Tumbang Maraya', 'Tumbang Anoi'] },
        { id: 'gmas_mmanasa', nama: 'Miri Manasa', lat: -0.6150, lon: 113.7950, medan: 'tanah', desa: ['Tumbang Napoi', 'Tumbang Siruk', 'Mangkuhung', 'Tumbang Masukih', 'Rangan Hiran', 'Harowu', 'Tumbang Manyoi', 'Tumbang Lapan', 'Buntoi', 'Tumbang Koroi', 'Tumbang Hatung'] }
      ]
    },
    /* 11. KAB. BARITO SELATAN — 6 Kecamatan · 93 Desa/Kelurahan */
    baritoselatan: {
      nama: 'Kab. Barito Selatan', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'barsel_dsel', nama: 'Dusun Selatan', lat: -1.7205, lon: 114.8435, medan: 'mulus', desa: ['Buntok Kota', 'Jelapat', 'Hilir Seper', 'Danau Ganting', 'Muara Talang', 'Teluk Telaga', 'Baru', 'Danau Sadar', 'Pamait', 'Sababilah', 'Mangaris', 'Tetei Lanan', 'Pamangka', 'Sanggu', 'Lembeng', 'Muara Ripung', 'Madara', 'Murung Paken', 'Mabuan', 'Kalahien', 'Penda Asam', 'Pararapak', 'Teluk Mampun', 'Tanjung Jawa', 'Telang Andrau', 'Dangka', 'Danau Masura'] },
        { id: 'barsel_dutara', nama: 'Dusun Utara', lat: -1.4280, lon: 114.8650, medan: 'bergelombang', desa: ['Pendang', 'Sungai Telang', 'Majundre', 'Bundar', 'Talekoi', 'Marawan Lama', 'Marawan Baru', 'Reong', 'Tarusan', 'Panarukan', 'Maruga', 'Hingan', 'Danau Bambure', 'Tamparak', 'Hulu Tampang', 'Bantai Bambure', 'Rampa Mea', 'Gunung Rantau', 'Tamparak Layung'] },
        { id: 'barsel_gba', nama: 'Gunung Bintang Awai', lat: -1.5850, lon: 115.1450, medan: 'bergelombang', desa: ['Tabak Kanilan', 'Baruang', 'Kayumban', 'Sarimbuah', 'Gagutur', 'Muka Haji', 'Sire', 'Muara Singan', 'Patas I', 'Patas II', 'Bintang Ara', 'Ugang Sayu', 'Ngurit', 'Wungkur Baru', 'Bipak Kali', 'Malungai Raya', 'Sei Paken', 'Palu Rejo', 'Wayun', 'Marga Jaya', 'Ruhing Raya'] },
        { id: 'barsel_kkuala', nama: 'Karau Kuala', lat: -1.9650, lon: 114.8550, medan: 'bergelombang', desa: ['Bangkuang', 'Salat Baru', 'Teluk Betung', 'Babai', 'Janggi', 'Malitin', 'Muara Arai', 'Talio', 'Tampijak', 'Bintang Kurung', 'Teluk Sampudau'] },
        { id: 'barsel_dhilir', nama: 'Dusun Hilir', lat: -2.2350, lon: 114.8850, medan: 'rusak', desa: ['Mengkatip', 'Sungai Jaya', 'Mahajandau', 'Kalanis', 'Lehai', 'Damparan', 'Teluk Timbau', 'Batilap', 'Batampang', 'Mangkatir'] },
        { id: 'barsel_jenamas', nama: 'Jenamas', lat: -2.4150, lon: 114.9550, medan: 'rusak', desa: ['Rantau Kujang', 'Tampulang', 'Rantau Bahuang', 'Rangga Ilung', 'Tabatan'] }
      ]
    },
    /* 12. KAB. BARITO TIMUR — 10 Kecamatan · 103 Desa/Kelurahan */
    baritotimur: {
      nama: 'Kab. Barito Timur', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'bartim_dtimur', nama: 'Dusun Timur', lat: -2.1115, lon: 115.1665, medan: 'mulus', desa: ['Tamiang Layang', 'Pulau Patai', 'Sarapat', 'Magantis', 'Jaar', 'Matabu', 'Dorong', 'Didi', 'Karang Langit', 'Haringen', 'Jaweten', 'Matarah', 'Maragut', 'Mangkarap', 'Gumpa', 'Sumur', 'Harara'] },
        { id: 'bartim_blima', nama: 'Benua Lima', lat: -2.2120, lon: 115.2650, medan: 'mulus', desa: ['Pasar Panas/Taniran', 'Kandris', 'Banyu Landas', 'Bagok', 'Bamban', 'Tewah Pupuh', 'Gudang Seng'] },
        { id: 'bartim_dtengah', nama: 'Dusun Tengah', lat: -1.8680, lon: 115.1450, medan: 'mulus', desa: ['Ampah Kota', 'Saing', 'Rodok', 'Ampah II', 'Putai', 'Netampin', 'Sumber Garunggung', 'Muara Awang'] },
        { id: 'bartim_pkarau', nama: 'Pematang Karau', lat: -1.9750, lon: 114.9950, medan: 'bergelombang', desa: ['Bambulung', 'Muara Palantau', 'Ketab', 'Kupang Bersih', 'Tuyau', 'Pinang Tunggal', 'Nagaleah', 'Lampeong', 'Bararawa', 'Lebo', 'Muru Duyung', 'Tumpung Ulung', 'Sumber Rejo'] },
        { id: 'bartim_paku', nama: 'Paku', lat: -1.9650, lon: 115.1380, medan: 'mulus', desa: ['Tampa', 'Kalamus', 'Simpang Bingkuang', 'Patung', 'Runggu Raya', 'Bantai Napu', 'Tarinsing', 'Paku Beto', 'Gandrung', 'Pangkan', 'Kupang Baru', 'Luau Jawuk'] },
        { id: 'bartim_rbatuah', nama: 'Raren Batuah', lat: -1.7920, lon: 115.2250, medan: 'bergelombang', desa: ['Unsum', 'Puri', 'Lenggang', 'Batuah', 'Baruyan', 'Turan Amis', 'Malintut', 'Tangkum', 'Sibung'] },
        { id: 'bartim_kjanang', nama: 'Karusen Janang', lat: -2.0250, lon: 115.1520, medan: 'mulus', desa: ['Dayu', 'Wuran', 'Ipu Mea', 'Lagan', 'Putut Tawuluh', 'Simpang Naneng', 'Kandris'] },
        { id: 'bartim_awang', nama: 'Awang', lat: -2.0450, lon: 115.2750, medan: 'bergelombang', desa: ['Hayaping', 'Janah Jari', 'Bangkirayen', 'Tangkan', 'Wungkur Nanakan', 'Ampari', 'Apar Batu', 'Biwan', 'Janah Mansiwui', 'Danau', 'Pianggu'] },
        { id: 'bartim_ptutui', nama: 'Patangkep Tutui', lat: -2.1450, lon: 115.3250, medan: 'perbukitan', desa: ['Bentot', 'Pulau Padang', 'Kambitin', 'Ramania', 'Ampari Bura', 'Kotam', 'Betang Nalong', 'Mawani', 'Jango', 'Lalap'] },
        { id: 'bartim_pepat', nama: 'Paju Epat', lat: -2.1950, lon: 115.0550, medan: 'bergelombang', desa: ['Telang', 'Juru Banu', 'Telang Baru', 'Tampu Langit', 'Maipe', 'Murutuwu', 'Balawa', 'Kali Napu', 'Siong'] }
      ]
    },
    /* 13. KAB. BARITO UTARA — 9 Kecamatan · 103 Desa/Kelurahan */
    baritoutara: {
      nama: 'Kab. Barito Utara', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'barut_ttengah', nama: 'Teweh Tengah', lat: -0.9554, lon: 114.8965, medan: 'kota', desa: ['Melayu', 'Lanjas', 'Lemo I', 'Lemo II', 'Pendreh', 'Rimba Sari', 'Sei Rahayu I', 'Sei Rahayu II', 'Beringin Raya', 'Datai Nirui'] },
        { id: 'barut_tbaru', nama: 'Teweh Baru', lat: -0.9680, lon: 114.9520, medan: 'mulus', desa: ['Jambu', 'Jingah', 'Liang Naga', 'Sabuh', 'Hajak', 'Malawaken', 'Sikui', 'Panaen', 'Liang Buah', 'Gandring'] },
        { id: 'barut_tselatan', nama: 'Teweh Selatan', lat: -1.1250, lon: 114.9450, medan: 'mulus', desa: ['Trahean', 'Trinsing', 'Bintang Ninggi I', 'Bintang Ninggi II', 'Butong', 'Buntok Baru', 'Bukit Sawit', 'Tawan Jaya', 'Pandran Raya', 'Pandran Permai'] },
        { id: 'barut_ttimur', nama: 'Teweh Timur', lat: -0.8850, lon: 115.3250, medan: 'rusak', desa: ['Sampirang I', 'Sampirang II', 'Liju', 'Benangin III', 'Benangin II', 'Benangin V', 'Benangin I', 'Muara Wakat', 'Mampuak I', 'Jamut', 'Sei Liju', 'Mampuak II'] },
        { id: 'barut_montallat', nama: 'Montallat', lat: -1.2450, lon: 114.8920, medan: 'bergelombang', desa: ['Tumpung Laung II', 'Montallat I', 'Montallat II', 'Tumpung Laung I', 'Sikan', 'Rubei', 'Pepas', 'Ruji', 'Paring Lahung', 'Kamawen'] },
        { id: 'barut_gtimang', nama: 'Gunung Timang', lat: -1.2650, lon: 115.0850, medan: 'bergelombang', desa: ['Kandui', 'Malungai', 'Rarawa', 'Ketapang', 'Walur', 'Baliti', 'Majangkan', 'Payang Ara', 'Jaman', 'Pelari', 'Sangkorang', 'Siwau', 'Tongka', 'Batu Raya I', 'Batu Raya II', 'Tapen Raya'] },
        { id: 'barut_gpurei', nama: 'Gunung Purei', lat: -1.1650, lon: 115.4850, medan: 'perbukitan', desa: ['Lampeong II', 'Tanjung Harapan', 'Linon Besi I', 'Linon Besi II', 'Muara Mea', 'Lawarang', 'Lampeong I', 'Payang', 'Berong', 'Baok', 'Tambaba'] },
        { id: 'barut_lahei', nama: 'Lahei', lat: -0.7850, lon: 114.9850, medan: 'bergelombang', desa: ['Lahei II', 'Lahei I', 'Ipu', 'Mukut', 'Muara Bakah', 'Juju Baru', 'Muara Inu', 'Bengahon', 'Rahaden', 'Muara Pari', 'Haragandang', 'Karendan', 'Hurung Enep'] },
        { id: 'barut_lbarat', nama: 'Lahei Barat', lat: -0.8250, lon: 114.7950, medan: 'rusak', desa: ['Benao Hulu', 'Nihan Hilir', 'Nihan Hulu', 'Luwe Hilir', 'Luwe Hulu', 'Jangkang Baru', 'Jangkang Lama', 'Papar Pujung', 'Teluk Malewai', 'Benao Hilir', 'Karamuan'] }
      ]
    },
    /* 14. KAB. MURUNG RAYA — 10 Kecamatan · 125 Desa/Kelurahan */
    murungraya: {
      nama: 'Kab. Murung Raya', prov: 'Kalimantan Tengah',
      kec: [
        { id: 'mura_murung', nama: 'Murung', lat: -0.6352, lon: 114.5685, medan: 'mulus', desa: ['Beriwit', 'Puruk Cahu', 'Dirung', 'Malasan', 'Batu Putih', 'Mangkahui', "Panu'ut", 'Muara Untu', "Muara Ja'an", 'Bahitom', 'Danau Usung', 'Juking Pajang', 'Muara Sumpoi', 'Muara Bumban', 'Penyang'] },
        { id: 'mura_tsiang', nama: 'Tanah Siang', lat: -0.4650, lon: 114.5150, medan: 'perbukitan', desa: ['Saripoi', 'Sungai Lunuk', 'Konut', 'Belawan', 'Mangkolisoi', 'Kalang Kaluh', 'Mantiat Pari', 'Olung Ulu', 'Puruk Batu', 'Olung Siron', 'Tino Talih', 'Olung Nango', 'Mahanyan', 'Dirung Bakung', 'Tabulang', 'Cangkang', 'Olung Dojou', 'Doan Arung', 'Muwun', 'Nono Kliwon', 'Kolam', 'Saruhung', 'Olung Soloi', 'Tokung', 'Olung Balo', 'Karali', 'Osom Tompok'] },
        { id: 'mura_tssel', nama: 'Tanah Siang Selatan', lat: -0.5620, lon: 114.4850, medan: 'perbukitan', desa: ['Dirung Lingkin', 'Oreng', 'Olung Muro', 'Olung Hanangan', 'Datah Kotou', 'Tahujan Ontu', 'Puruk Kambang'] },
        { id: 'mura_ltuhup', nama: 'Laung Tuhup', lat: -0.5580, lon: 114.7650, medan: 'bergelombang', desa: ['Muara Laung I', 'Muara Tuhup', 'Batu Bua I', 'Batu Tuhup', 'Tumbang Bahan', 'Muara Laung II', 'Beras Balange', 'Pelaci', 'Biha', 'Dirung Pundu', 'Dirung Pinang', 'Muara Tupuh', 'Narui', 'Tumbang Bana', 'Lakutan', 'Tawai Haui', 'Penda Siron', 'Muara Maruwei I', 'Muara Maruwei II', 'Beralang', 'Kalang Dohong', 'Batu Bua II', 'Tahujan Laung', 'Tumbang Bondang', 'Tumbang Tonduk', 'Batu Karang'] },
        { id: 'mura_btr', nama: 'Barito Tuhup Raya', lat: -0.4520, lon: 114.9550, medan: 'rusak', desa: ['Makunjung', 'Bumban Tuhup', 'Dirung Sararong', 'Kohong', 'Hingan Tokung', 'Liang Nyaling', 'Tumbang Bauh', 'Tumbang Masalo', 'Batu Tojah', 'Tumbang Baloi', 'Cinta Budiman'] },
        { id: 'mura_pintan', nama: 'Permata Intan', lat: -0.3450, lon: 114.3450, medan: 'rusak', desa: ['Tumbang Lahung', 'Muara Bakanon', 'Sungai Gula', 'Sungai Batang', 'Tumbang Salio', 'Purnama', 'Sungai Lobang', 'Pantai Laga', 'Baratu', 'Juking Sopan', 'Muara Babuat', 'Sungai Bakanon'] },
        { id: 'mura_sbabuat', nama: 'Sungai Babuat', lat: -0.2580, lon: 114.2550, medan: 'tanah', desa: ['Tumbang Bantian', 'Batu Mirau', 'Tambelum', 'Tumbang Saan', 'Tumbang Kolon', 'Tumbang Apat'] },
        { id: 'mura_sbarito', nama: 'Sumber Barito', lat: -0.1850, lon: 114.3650, medan: 'tanah', desa: ['Tumbang Kunyi', 'Kalapeh Baru', 'Tumbang Masao', 'Batu Makap', 'Olong Liko', 'Teluk Jolo', 'Laas Baru', 'Tumbang Molut', 'Tumbang Tuan'] },
        { id: 'mura_sriam', nama: 'Seribu Riam', lat: -0.0250, lon: 114.1250, medan: 'tanah', desa: ['Muara Joloi I', 'Tumbang Tohan', 'Tumbang Naan', 'Muara Joloi II', 'Parahau', 'Tumbang Jojang', 'Takajung'] },
        { id: 'mura_umurung', nama: 'Uut Murung', lat: 0.1450, lon: 114.5950, medan: 'tanah', desa: ['Tumbang Olong I', 'Tumbang Tujang', 'Kalasin', 'Tumbang Topus', 'Tumbang Olong II'] }
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
