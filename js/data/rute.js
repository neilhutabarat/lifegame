/* rute.js — peta antarkota untuk Travel: kota, ruas jalan (km, tol, kapal), jalur terpendek, tarif standar.
   Sumber nyata: tarif kapal Merak–Bakauheni golongan IV Rp481.800 dan penumpang Rp22.700 (Metro TV, 2026),
   tol Jakarta–Semarang Rp473.500 golongan I (Bisnis.com, Maret 2026), travel Jakarta–Bandung Rp80.000–100.000 (Jawa Pos, Des 2025).
   Angka lain (jarak, tol ruas lain, popularitas) adalah perkiraan dan bisa disetel di sini. */
(function (g) {
  'use strict';
  /* tema = gaya pemandangan; ramai = seberapa ramai penumpang (1 = sedang) */
  var KOTA = {
    medan: { nama: 'Medan', pulau: 'Sumatra', tema: 'metropolis', ramai: 1.5, ket: 'Kota terbesar Sumatra' },
    binjai: { nama: 'Binjai', pulau: 'Sumatra', tema: 'kota', ramai: 0.9, ket: 'Kota rambutan' },
    berastagi: { nama: 'Berastagi', pulau: 'Sumatra', tema: 'gunung', ramai: 1.0, ket: 'Gunung Sibayak dan kebun jeruk' },
    tebingtinggi: { nama: 'Tebing Tinggi', pulau: 'Sumatra', tema: 'sawit', ramai: 0.7, ket: 'Kota persimpangan, kebun sawit' },
    siantar: { nama: 'Pematangsiantar', pulau: 'Sumatra', tema: 'kota', ramai: 0.9, ket: 'Kota roti ketawa' },
    parapat: { nama: 'Parapat', pulau: 'Sumatra', tema: 'danau', ramai: 1.1, ket: 'Pintu Danau Toba' },
    kisaran: { nama: 'Kisaran', pulau: 'Sumatra', tema: 'sawit', ramai: 0.6, ket: 'Kebun karet dan sawit' },
    rantauprapat: { nama: 'Rantauprapat', pulau: 'Sumatra', tema: 'sawit', ramai: 0.6, ket: 'Lintas timur Sumatra' },
    pekanbaru: { nama: 'Pekanbaru', pulau: 'Sumatra', tema: 'kotaBesar', ramai: 1.2, ket: 'Kota bertuah, Riau' },
    bukittinggi: { nama: 'Bukittinggi', pulau: 'Sumatra', tema: 'gunung', ramai: 1.1, ket: 'Jam Gadang' },
    padang: { nama: 'Padang', pulau: 'Sumatra', tema: 'pantai', ramai: 1.1, ket: 'Pantai Padang' },
    jambi: { nama: 'Kota Jambi', pulau: 'Sumatra', tema: 'sungai', ramai: 1.0, ket: 'Sungai Batanghari' },
    palembang: { nama: 'Palembang', pulau: 'Sumatra', tema: 'sungai', ramai: 1.3, ket: 'Jembatan Ampera' },
    lampung: { nama: 'Bandar Lampung', pulau: 'Sumatra', tema: 'pantai', ramai: 1.1, ket: 'Menara Siger' },
    bakauheni: { nama: 'Bakauheni', pulau: 'Sumatra', tema: 'pelabuhan', ramai: 0.5, ket: 'Pelabuhan ujung Sumatra' },
    merak: { nama: 'Merak', pulau: 'Jawa', tema: 'pelabuhan', ramai: 0.5, ket: 'Pelabuhan ujung Jawa' },
    jakarta: { nama: 'Jakarta', pulau: 'Jawa', tema: 'metropolis', ramai: 1.6, ket: 'Ibu kota, Monas' },
    bandung: { nama: 'Bandung', pulau: 'Jawa', tema: 'gunung', ramai: 1.5, ket: 'Kota kembang, kebun teh' },
    cirebon: { nama: 'Cirebon', pulau: 'Jawa', tema: 'pantai', ramai: 0.9, ket: 'Kota udang, jalur pantura' },
    semarang: { nama: 'Semarang', pulau: 'Jawa', tema: 'kotaBesar', ramai: 1.2, ket: 'Lawang Sewu' },
    yogyakarta: { nama: 'Yogyakarta', pulau: 'Jawa', tema: 'budaya', ramai: 1.4, ket: 'Tugu dan Malioboro' },
    surabaya: { nama: 'Surabaya', pulau: 'Jawa', tema: 'metropolis', ramai: 1.4, ket: 'Kota Pahlawan' },
    bandaaceh: { nama: 'Banda Aceh', pulau: 'Sumatra', tema: 'budaya', ramai: 1.0, ket: 'Masjid Raya Baiturrahman' },
    bengkulu: { nama: 'Bengkulu', pulau: 'Sumatra', tema: 'pantai', ramai: 0.85, ket: 'Pantai Panjang, Bumi Rafflesia' },
    solo: { nama: 'Solo (Surakarta)', pulau: 'Jawa', tema: 'budaya', ramai: 1.15, ket: 'Keraton Surakarta' },
    malang: { nama: 'Malang', pulau: 'Jawa', tema: 'gunung', ramai: 1.25, ket: 'Kota Apel dan Gunung Bromo' },
    banyuwangi: { nama: 'Banyuwangi', pulau: 'Jawa', tema: 'pelabuhan', ramai: 0.9, ket: 'Pelabuhan Ketapang ke Bali' },
    denpasar: { nama: 'Denpasar (Bali)', pulau: 'Bali', tema: 'pantai', ramai: 1.55, ket: 'Pulau Dewata, Kuta dan Sanur' },
    mataram: { nama: 'Mataram (Lombok)', pulau: 'NTB', tema: 'pantai', ramai: 1.05, ket: 'Pulau Lombok, Mandalika' },
    kupang: { nama: 'Kupang (NTT)', pulau: 'NTT', tema: 'pantai', ramai: 0.85, ket: 'Gerbang Nusa Tenggara Timur' },
    /* === KALIMANTAN BARAT (14 Kota & Kabupaten: 2 Kota, 12 Kabupaten) === */
    pontianak: { nama: 'Kota Pontianak', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 118, tema: 'sungai', ramai: 1.35, ket: 'Ibu kota Kalbar, Tugu Khatulistiwa, Sungai Kapuas' },
    singkawang: { nama: 'Kota Singkawang', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 550, tema: 'pantai', ramai: 1.1, ket: 'Kota Seribu Kelenteng & wisata pantai Pasir Panjang' },
    kuburaya: { nama: 'Kab. Kubu Raya (Sungai Raya)', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 8549, tema: 'sungai', ramai: 1.05, ket: 'Bandara Supadio, penyangga Pontianak' },
    mempawah: { nama: 'Kab. Mempawah', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 1935, tema: 'pantai', ramai: 0.9, ket: 'Pelabuhan Kijing, jalur pesisir Pontianak–Singkawang' },
    sambas: { nama: 'Kab. Sambas', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 5938, tema: 'pantai', ramai: 0.85, ket: 'PLBN Aruk perbatasan Sarawak & Keraton Alwatzikhoebillah' },
    bengkayang: { nama: 'Kab. Bengkayang', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 5489, tema: 'gunung', ramai: 0.75, ket: 'PLBN Jagoi Babang & perbukitan hijau perbatasan' },
    landak: { nama: 'Kab. Landak (Ngabang)', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 8431, tema: 'sawit', ramai: 0.85, ket: 'Kota Ngabang, jalur utama Trans-Kalimantan Kalbar' },
    sanggau: { nama: 'Kab. Sanggau', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 12452, tema: 'sungai', ramai: 0.95, ket: 'Jembatan Tayan, PLBN Entikong, tepi Sungai Kapuas' },
    sekadau: { nama: 'Kab. Sekadau', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 5979, tema: 'sawit', ramai: 0.78, ket: 'Lintas tengah Kalbar, perkebunan karet & sawit' },
    sintang: { nama: 'Kab. Sintang', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 22026, tema: 'gunung', ramai: 0.95, ket: 'Bukit Kelam, pertemuan Sungai Kapuas & Melawi' },
    melawi: { nama: 'Kab. Melawi (Nanga Pinoh)', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 10122, tema: 'sungai', ramai: 0.75, ket: 'Kota Nanga Pinoh, gerbang pedalaman perbukitan Schwaner' },
    kapuashulu: { nama: 'Kab. Kapuas Hulu (Putussibau)', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 31318, tema: 'danau', ramai: 0.7, ket: 'Danau Sentarum, Taman Nasional Betung Kerihun & PLBN Badau' },
    ketapang: { nama: 'Kab. Ketapang', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 30019, tema: 'pantai', ramai: 0.95, ket: 'Kabupaten terluas di pesisir selatan Kalbar, jalur ke Kalteng' },
    kayongutara: { nama: 'Kab. Kayong Utara (Sukadana)', pulau: 'Kalimantan', prov: 'Kalimantan Barat', luas: 4110, tema: 'pantai', ramai: 0.65, ket: 'Pantai Pulau Datok & Taman Nasional Gunung Palung' },

    /* === KALIMANTAN TENGAH (14 Kota & Kabupaten: 1 Kota, 13 Kabupaten) === */
    palangkaraya: { nama: 'Kota Palangka Raya', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 2853, tema: 'sungai', ramai: 1.25, ket: 'Ibu kota Kalteng, Jembatan Kahayan & taman gambut' },
    kotawaringinbarat: { nama: 'Kab. Kotawaringin Barat (Pangkalan Bun)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 9480, tema: 'pantai', ramai: 1.05, ket: 'Pangkalan Bun, Pelabuhan Kumai & TN Tanjung Puting' },
    sukamara: { nama: 'Kab. Sukamara', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 3311, tema: 'pantai', ramai: 0.65, ket: 'Ujung barat daya Kalteng berbatasan dengan Ketapang' },
    lamandau: { nama: 'Kab. Lamandau (Nanga Bulik)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 7632, tema: 'sawit', ramai: 0.75, ket: 'Nanga Bulik, gerbang lintas Trans-Kalimantan Kalbar–Kalteng' },
    seruyan: { nama: 'Kab. Seruyan (Kuala Pembuang)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 15215, tema: 'pantai', ramai: 0.72, ket: 'Kuala Pembuang, pesisir Laut Jawa & perkebunan sawit' },
    kotawaringintimur: { nama: 'Kab. Kotawaringin Timur (Sampit)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 15544, tema: 'sungai', ramai: 1.15, ket: 'Kota Sampit, Sungai Mentaya & pusat perdagangan Kalteng' },
    katingan: { nama: 'Kab. Katingan (Kasongan)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 20382, tema: 'sungai', ramai: 0.82, ket: 'Kasongan & Taman Nasional Sebangau' },
    pulangpisau: { nama: 'Kab. Pulang Pisau', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 9651, tema: 'sungai', ramai: 0.85, ket: 'Jembatan Tumbang Nusa, jalur utama Palangka Raya–Banjarmasin' },
    kapuas: { nama: 'Kab. Kapuas (Kuala Kapuas)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 17070, tema: 'sungai', ramai: 0.95, ket: 'Kota Air Kuala Kapuas, perbatasan Kalteng–Kalsel' },
    gunungmas: { nama: 'Kab. Gunung Mas (Kuala Kurun)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 9306, tema: 'gunung', ramai: 0.72, ket: 'Kuala Kurun, perbukitan hulu Sungai Kahayan' },
    baritoselatan: { nama: 'Kab. Barito Selatan (Buntok)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 6267, tema: 'sungai', ramai: 0.85, ket: 'Kota Buntok di tepi Sungai Barito' },
    baritotimur: { nama: 'Kab. Barito Timur (Tamiang Layang)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 3213, tema: 'sawit', ramai: 0.8, ket: 'Tamiang Layang, penghubung langsung ke Tabalong Kalsel' },
    baritoutara: { nama: 'Kab. Barito Utara (Muara Teweh)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 9985, tema: 'sungai', ramai: 0.88, ket: 'Muara Teweh, pusat perdagangan & tambang hulu Barito' },
    murungraya: { nama: 'Kab. Murung Raya (Puruk Cahu)', pulau: 'Kalimantan', prov: 'Kalimantan Tengah', luas: 23575, tema: 'gunung', ramai: 0.68, ket: 'Puruk Cahu, jantung perbukitan utara Kalteng' },

    /* === KALIMANTAN SELATAN (13 Kota & Kabupaten: 2 Kota, 11 Kabupaten) === */
    banjarmasin: { nama: 'Kota Banjarmasin', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 98, tema: 'sungai', ramai: 1.35, ket: 'Kota Seribu Sungai, Pasar Terapung & Pelabuhan Trisakti' },
    banjarbaru: { nama: 'Kota Banjarbaru', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 305, tema: 'kotaBesar', ramai: 1.25, ket: 'Ibu kota Provinsi Kalsel & Bandara Syamsudin Noor' },
    banjar: { nama: 'Kab. Banjar (Martapura)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 4588, tema: 'budaya', ramai: 1.15, ket: 'Kota Intan Martapura & wisata religi Sekumpul' },
    baritokuala: { nama: 'Kab. Barito Kuala (Marabahan)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 2426, tema: 'sungai', ramai: 0.85, ket: 'Jembatan Barito & Jembatan Sei Alalak, lumbung padi Kalsel' },
    tanahlaut: { nama: 'Kab. Tanah Laut (Pelaihari)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 3841, tema: 'pantai', ramai: 0.95, ket: 'Pelaihari, Pantai Takisung & jalur selatan ke Batulicin' },
    tapin: { nama: 'Kab. Tapin (Rantau)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 2156, tema: 'sawit', ramai: 0.88, ket: 'Kota Rantau di Jalan Nasional Ahmad Yani lintas Banua Anam' },
    hss: { nama: 'Kab. Hulu Sungai Selatan (Kandangan)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 1697, tema: 'gunung', ramai: 0.92, ket: 'Kandangan, kuliner Ketupat Kandangan & Loksado Pegunungan Meratus' },
    hst: { nama: 'Kab. Hulu Sungai Tengah (Barabai)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 1573, tema: 'gunung', ramai: 0.9, ket: 'Kota Barabai, kaki Pegunungan Meratus' },
    hsu: { nama: 'Kab. Hulu Sungai Utara (Amuntai)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 907, tema: 'sungai', ramai: 0.88, ket: 'Kota Amuntai, rawa lebak & sentra kerajinan purun' },
    balangan: { nama: 'Kab. Balangan (Paringin)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 1829, tema: 'sawit', ramai: 0.82, ket: 'Kota Paringin, jalur strategis menuju Tabalong & Kaltim' },
    tabalong: { nama: 'Kab. Tabalong (Tanjung)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 3473, tema: 'sawit', ramai: 1.0, ket: 'Kota Tanjung, gerbang perbatasan Kalsel–Kaltim & Kalsel–Kalteng' },
    tanahbumbu: { nama: 'Kab. Tanah Bumbu (Batulicin)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 4885, tema: 'pelabuhan', ramai: 1.08, ket: 'Batulicin, pelabuhan feri ke Kotabaru & jalur pesisir ke Paser' },
    kotabaru: { nama: 'Kab. Kotabaru (Pulau Laut)', pulau: 'Kalimantan', prov: 'Kalimantan Selatan', luas: 9423, tema: 'pantai', ramai: 0.92, ket: 'Pulau Laut Kotabaru, diseberangi via Feri Batulicin–Tanjung Serdang' },

    /* === KALIMANTAN TIMUR (10 Kota/Kabupaten + IKN: 3 Kota, 7 Kabupaten + IKN) === */
    balikpapan: { nama: 'Kota Balikpapan', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 511, tema: 'metropolis', ramai: 1.45, ket: 'Kota Minyak, Bandara SAMS Sepinggan & gerbang utama IKN' },
    samarinda: { nama: 'Kota Samarinda', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 717, tema: 'sungai', ramai: 1.35, ket: 'Ibu kota Kaltim, Sungai Mahakam & Tol Balsam' },
    bontang: { nama: 'Kota Bontang', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 161, tema: 'pantai', ramai: 1.05, ket: 'Kota Industri LNG & Pupuk di pesisir timur Kaltim' },
    ikn: { nama: 'Nusantara (IKN · Sepaku)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 2561, tema: 'kotaBesar', ramai: 1.35, ket: 'Ibu Kota Nusantara, Kawasan Inti Pusat Pemerintahan (KIPP)' },
    ppu: { nama: 'Kab. Penajam Paser Utara', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 3212, tema: 'pelabuhan', ramai: 1.05, ket: 'Penajam, Jembatan Pulau Balang & Feri Kariangau–Penajam' },
    paser: { nama: 'Kab. Paser (Tanah Grogot)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 10708, tema: 'sawit', ramai: 0.92, ket: 'Tanah Grogot, jalur Gunung Rambutan lintas Kaltim–Kalsel' },
    kukar: { nama: 'Kab. Kutai Kartanegara (Tenggarong)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 26926, tema: 'sungai', ramai: 1.15, ket: 'Tenggarong, Jembatan Kutai Kartanegara & eks Kesultanan Kutai' },
    kubar: { nama: 'Kab. Kutai Barat (Sendawar)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 13611, tema: 'sungai', ramai: 0.85, ket: 'Sendawar / Barong Tongkok, jalur Trans-Kalimantan pedalaman' },
    mahakamulu: { nama: 'Kab. Mahakam Ulu (Ujoh Bilang)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 18428, tema: 'gunung', ramai: 0.58, ket: 'Ujoh Bilang, kabupaten termuda di hulu Sungai Mahakam (jalur pedalaman tanah)' },
    kutim: { nama: 'Kab. Kutai Timur (Sangatta)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 31588, tema: 'sawit', ramai: 1.05, ket: 'Sangatta, Taman Nasional Kutai & pusat pertambangan' },
    berau: { nama: 'Kab. Berau (Tanjung Redeb)', pulau: 'Kalimantan', prov: 'Kalimantan Timur', luas: 21951, tema: 'pantai', ramai: 1.0, ket: 'Tanjung Redeb, gerbang wisata Kepulauan Derawan & Maratua' },

    /* === KALIMANTAN UTARA (5 Kota & Kabupaten: 1 Kota, 4 Kabupaten) === */
    tanjungselor: { nama: 'Kab. Bulungan (Tanjung Selor)', pulau: 'Kalimantan', prov: 'Kalimantan Utara', luas: 13882, tema: 'sungai', ramai: 1.0, ket: 'Ibu kota Provinsi Kaltara di tepi Sungai Kayan' },
    tarakan: { nama: 'Kota Tarakan', pulau: 'Kalimantan', prov: 'Kalimantan Utara', luas: 251, tema: 'pelabuhan', ramai: 1.18, ket: 'Pulau Tarakan, pusat ekonomi & bandara internasional Kaltara' },
    tanatidung: { nama: 'Kab. Tana Tidung (Tideng Pale)', pulau: 'Kalimantan', prov: 'Kalimantan Utara', luas: 3507, tema: 'sungai', ramai: 0.72, ket: 'Tideng Pale, poros Trans-Kalimantan Utara menuju Malinau' },
    malinau: { nama: 'Kab. Malinau', pulau: 'Kalimantan', prov: 'Kalimantan Utara', luas: 38915, tema: 'gunung', ramai: 0.82, ket: 'Kabupaten terluas di Kaltara & Taman Nasional Kayan Mentarang' },
    nunukan: { nama: 'Kab. Nunukan', pulau: 'Kalimantan', prov: 'Kalimantan Utara', luas: 13556, tema: 'pelabuhan', ramai: 0.85, ket: 'Pulau Nunukan & Sebatik, gerbang perbatasan Sabah Malaysia' },
    makassar: { nama: 'Makassar', pulau: 'Sulawesi', tema: 'metropolis', ramai: 1.35, ket: 'Pantai Losari, Kota Daeng' },
    parepare: { nama: 'Parepare', pulau: 'Sulawesi', tema: 'pelabuhan', ramai: 0.8, ket: 'Pelabuhan lintas Sulawesi–Kalimantan' },
    mamuju: { nama: 'Mamuju', pulau: 'Sulawesi', prov: 'Sulawesi Barat', tema: 'pantai', ramai: 0.82, ket: 'Ibu kota Sulbar, Pantai Manakarra' },
    palu: { nama: 'Palu', pulau: 'Sulawesi', tema: 'pantai', ramai: 0.85, ket: 'Teluk Palu' },
    gorontalo: { nama: 'Gorontalo', pulau: 'Sulawesi', prov: 'Gorontalo', tema: 'pantai', ramai: 0.85, ket: 'Serambi Madinah, Benteng Otanaha' },
    manado: { nama: 'Manado', pulau: 'Sulawesi', tema: 'pantai', ramai: 1.1, ket: 'Bunaken, Sulawesi Utara' },
    kendari: { nama: 'Kendari', pulau: 'Sulawesi', tema: 'pantai', ramai: 0.9, ket: 'Teluk Kendari' },
    tanjungpinang: { nama: 'Tanjung Pinang', pulau: 'Sumatra', prov: 'Kepulauan Riau', tema: 'pelabuhan', ramai: 0.95, ket: 'Ibu kota Kepri, Pulau Bintan & Penyengat' },
    pangkalpinang: { nama: 'Pangkalpinang', pulau: 'Sumatra', prov: 'Kep. Bangka Belitung', tema: 'pantai', ramai: 0.92, ket: 'Ibu kota Babel, Negeri Serumpun Sebalai' },
    serang: { nama: 'Serang', pulau: 'Jawa', prov: 'Banten', tema: 'budaya', ramai: 1.05, ket: 'Ibu kota Banten, Masjid Agung Banten Lama' },
    ambon: { nama: 'Ambon', pulau: 'Maluku', tema: 'pantai', ramai: 0.85, ket: 'Ambon Manise, Kepulauan Maluku' },
    sofifi: { nama: 'Sofifi', pulau: 'Maluku', prov: 'Maluku Utara', tema: 'pelabuhan', ramai: 0.8, ket: 'Ibu kota Maluku Utara di Pulau Halmahera' },
    sorong: { nama: 'Sorong', pulau: 'Papua', prov: 'Papua Barat Daya', tema: 'pelabuhan', ramai: 0.88, ket: 'Ibu kota Papua Barat Daya, gerbang Raja Ampat' },
    manokwari: { nama: 'Manokwari', pulau: 'Papua', prov: 'Papua Barat', tema: 'pantai', ramai: 0.85, ket: 'Ibu kota Papua Barat, Teluk Doreri' },
    nabire: { nama: 'Nabire', pulau: 'Papua', prov: 'Papua Tengah', tema: 'pantai', ramai: 0.84, ket: 'Ibu kota Papua Tengah, Teluk Cenderawasih' },
    wamena: { nama: 'Wamena', pulau: 'Papua', prov: 'Papua Pegunungan', tema: 'gunung', ramai: 0.78, ket: 'Ibu kota Papua Pegunungan, Lembah Baliem' },
    merauke: { nama: 'Merauke', pulau: 'Papua', prov: 'Papua Selatan', tema: 'pantai', ramai: 0.85, ket: 'Ibu kota Papua Selatan, titik paling timur Indonesia' },
    jayapura: { nama: 'Jayapura', pulau: 'Papua', prov: 'Papua', tema: 'pantai', ramai: 1.0, ket: 'Jembatan Youtefa, ibu kota Papua' }
  };
  /* ruas: a-b dua arah. km jalan, tol golongan I (Rp), laut = penyeberangan kapal */
  var RUAS = [
    { a: 'medan', b: 'binjai', km: 22, tol: 0 },
    { a: 'medan', b: 'berastagi', km: 66, tol: 0 },
    { a: 'medan', b: 'tebingtinggi', km: 78, tol: 60000 },
    { a: 'tebingtinggi', b: 'siantar', km: 50, tol: 0 },
    { a: 'siantar', b: 'parapat', km: 47, tol: 0 },
    { a: 'tebingtinggi', b: 'kisaran', km: 70, tol: 0 },
    { a: 'kisaran', b: 'rantauprapat', km: 135, tol: 0 },
    { a: 'rantauprapat', b: 'pekanbaru', km: 380, tol: 0 },
    { a: 'pekanbaru', b: 'bukittinggi', km: 220, tol: 0 },
    { a: 'bukittinggi', b: 'padang', km: 95, tol: 0 },
    { a: 'pekanbaru', b: 'jambi', km: 450, tol: 0 },
    { a: 'jambi', b: 'palembang', km: 275, tol: 0 },
    { a: 'palembang', b: 'lampung', km: 340, tol: 330000 },
    { a: 'lampung', b: 'bakauheni', km: 90, tol: 90000 },
    { a: 'bakauheni', b: 'merak', km: 30, tol: 0, laut: true, jam: 2.0, kapalMobil: 481800, kapalOrang: 22700 },
    { a: 'merak', b: 'jakarta', km: 105, tol: 70000 },
    { a: 'jakarta', b: 'bandung', km: 150, tol: 55000 },
    { a: 'jakarta', b: 'cirebon', km: 230, tol: 150000 },
    { a: 'bandung', b: 'cirebon', km: 130, tol: 70000 },
    { a: 'cirebon', b: 'semarang', km: 225, tol: 323500 },
    { a: 'semarang', b: 'yogyakarta', km: 120, tol: 70000 },
    { a: 'semarang', b: 'surabaya', km: 350, tol: 280000 },
    { a: 'yogyakarta', b: 'surabaya', km: 320, tol: 250000 },
    { a: 'medan', b: 'bandaaceh', km: 590, tol: 80000 },
    { a: 'palembang', b: 'bengkulu', km: 430, tol: 0 },
    { a: 'yogyakarta', b: 'solo', km: 65, tol: 40000 },
    { a: 'solo', b: 'surabaya', km: 260, tol: 210000 },
    { a: 'surabaya', b: 'malang', km: 95, tol: 55000 },
    { a: 'malang', b: 'banyuwangi', km: 260, tol: 40000 },
    { a: 'surabaya', b: 'banyuwangi', km: 290, tol: 110000 },
    { a: 'banyuwangi', b: 'denpasar', km: 140, tol: 0, laut: true, jam: 2.5, kapalMobil: 215000, kapalOrang: 12000 },
    { a: 'denpasar', b: 'mataram', km: 110, tol: 0, laut: true, jam: 4.5, kapalMobil: 450000, kapalOrang: 65000 },
    { a: 'mataram', b: 'kupang', km: 720, tol: 0, laut: true, jam: 14, kapalMobil: 950000, kapalOrang: 180000 },
    { a: 'surabaya', b: 'banjarmasin', km: 480, tol: 0, laut: true, jam: 15, kapalMobil: 1200000, kapalOrang: 250000, jalan: 'Feri Laut Jawa (Tanjung Perak–Trisakti)', kondisi: 'mulus' },
    { a: 'surabaya', b: 'pontianak', km: 790, tol: 0, laut: true, jam: 28, kapalMobil: 1650000, kapalOrang: 340000, jalan: 'Kapal Ro-Ro Surabaya–Dwikora Pontianak', kondisi: 'mulus' },
    { a: 'surabaya', b: 'kotawaringinbarat', km: 440, tol: 0, laut: true, jam: 16, kapalMobil: 1150000, kapalOrang: 240000, jalan: 'Kapal Ro-Ro Surabaya–Kumai', kondisi: 'mulus' },
    { a: 'surabaya', b: 'kotawaringintimur', km: 470, tol: 0, laut: true, jam: 17, kapalMobil: 1200000, kapalOrang: 250000, jalan: 'Kapal Ro-Ro Surabaya–Sampit', kondisi: 'mulus' },
    { a: 'balikpapan', b: 'parepare', km: 350, tol: 0, laut: true, jam: 12, kapalMobil: 1100000, kapalOrang: 220000, jalan: 'Feri Selat Makassar (Balikpapan–Parepare)', kondisi: 'mulus' },

    /* === JARINGAN JALAN ASLI KALIMANTAN BARAT (Trans-Kalimantan, Pesisir & Feri ASDP) === */
    { a: 'pontianak', b: 'kuburaya', km: 14, tol: 0, jalan: 'Jl. Ahmad Yani II (Pontianak–Sungai Raya)', kondisi: 'mulus' },
    { a: 'pontianak', b: 'mempawah', km: 68, tol: 0, jalan: 'Jl. Raya Pontianak–Mempawah (Pesisir)', kondisi: 'mulus' },
    { a: 'mempawah', b: 'singkawang', km: 77, tol: 0, jalan: 'Jl. Raya Mempawah–Singkawang', kondisi: 'mulus' },
    { a: 'singkawang', b: 'sambas', km: 76, tol: 0, jalan: 'Jl. Nasional Singkawang–Pemangkat–Sambas', kondisi: 'mulus' },
    { a: 'singkawang', b: 'bengkayang', km: 68, tol: 0, jalan: 'Jl. Raya Singkawang–Bengkayang (Perbukitan)', kondisi: 'bergelombang' },
    { a: 'sambas', b: 'bengkayang', km: 96, tol: 0, jalan: 'Jl. Subah–Sanggau Ledo–Bengkayang (Perbukitan)', kondisi: 'bergelombang' },
    { a: 'mempawah', b: 'bengkayang', km: 112, tol: 0, jalan: 'Jl. Anjongan–Karangan–Bengkayang', kondisi: 'bergelombang' },
    { a: 'kuburaya', b: 'landak', km: 155, tol: 0, jalan: 'Trans-Kalimantan Poros Utara (Ambawang–Ngabang)', kondisi: 'mulus' },
    { a: 'bengkayang', b: 'landak', km: 88, tol: 0, jalan: 'Jl. Bengkayang–Darit–Ngabang', kondisi: 'bergelombang' },
    { a: 'landak', b: 'sanggau', km: 95, tol: 0, jalan: 'Trans-Kalimantan (Ngabang–Sosok–Sanggau)', kondisi: 'mulus' },
    { a: 'kuburaya', b: 'sanggau', km: 238, tol: 0, jalan: 'Trans-Kalimantan via Tayan Hilir–Sosok–Sanggau', kondisi: 'mulus' },
    { a: 'sanggau', b: 'sekadau', km: 48, tol: 0, jalan: 'Trans-Kalimantan (Sanggau–Sekadau)', kondisi: 'mulus' },
    { a: 'sekadau', b: 'sintang', km: 82, tol: 0, jalan: 'Trans-Kalimantan (Sekadau–Sintang)', kondisi: 'bergelombang' },
    { a: 'sintang', b: 'melawi', km: 46, tol: 0, jalan: 'Jl. Nasional Sintang–Nanga Pinoh', kondisi: 'mulus' },
    { a: 'sintang', b: 'kapuashulu', km: 274, tol: 0, jalan: 'Jl. Lintas Selatan Kalbar (Sintang–Silat–Putussibau)', kondisi: 'bergelombang' },
    { a: 'kuburaya', b: 'ketapang', km: 422, tol: 0, jalan: 'Trans-Kalimantan via Jembatan Tayan–Balai Berkuak–Sandai–Ketapang', kondisi: 'bergelombang' },
    { a: 'sanggau', b: 'ketapang', km: 348, tol: 0, jalan: 'Trans-Kalimantan via Tayan–Balai Berkuak–Sandai–Ketapang', kondisi: 'bergelombang' },
    { a: 'kuburaya', b: 'kayongutara', km: 155, tol: 0, laut: true, jam: 10.5, kapalMobil: 285000, kapalOrang: 65000, jalan: 'Feri ASDP Rasau Jaya–Teluk Batang–Sukadana', kondisi: 'mulus' },
    { a: 'ketapang', b: 'kayongutara', km: 84, tol: 0, jalan: 'Jl. Provinsi Ketapang–Siduk–Sukadana', kondisi: 'bergelombang' },
    { a: 'ketapang', b: 'melawi', km: 245, tol: 0, jalan: 'Jalur Pedalaman Sandai–Nanga Tayap–Nanga Pinoh', kondisi: 'rusak' },

    /* === PENGHUBUNG KALBAR ↔ KALTENG === */
    { a: 'ketapang', b: 'sukamara', km: 145, tol: 0, jalan: 'Jalur Pesisir Selatan (Kendawangan–Jelai–Sukamara)', kondisi: 'rusak' },
    { a: 'ketapang', b: 'lamandau', km: 245, tol: 0, jalan: 'Trans-Kalimantan Poros Selatan (Tumbang Titi–Kudangan–Nanga Bulik)', kondisi: 'bergelombang' },

    /* === JARINGAN JALAN ASLI KALIMANTAN TENGAH === */
    { a: 'sukamara', b: 'kotawaringinbarat', km: 92, tol: 0, jalan: 'Jl. Nasional Sukamara–Pangkalan Bun', kondisi: 'mulus' },
    { a: 'lamandau', b: 'kotawaringinbarat', km: 98, tol: 0, jalan: 'Trans-Kalimantan (Nanga Bulik–Pangkalan Bun)', kondisi: 'mulus' },
    { a: 'kotawaringinbarat', b: 'seruyan', km: 168, tol: 0, jalan: 'Jl. Lintas Pangkalan Bun–Kuala Pembuang', kondisi: 'bergelombang' },
    { a: 'kotawaringinbarat', b: 'kotawaringintimur', km: 225, tol: 0, jalan: 'Trans-Kalimantan Poros Selatan (Pangkalan Bun–Sampit)', kondisi: 'mulus' },
    { a: 'seruyan', b: 'kotawaringintimur', km: 118, tol: 0, jalan: 'Jl. Provinsi Kuala Pembuang–Sampit', kondisi: 'bergelombang' },
    { a: 'kotawaringintimur', b: 'katingan', km: 142, tol: 0, jalan: 'Trans-Kalimantan (Sampit–Kasongan)', kondisi: 'mulus' },
    { a: 'katingan', b: 'palangkaraya', km: 84, tol: 0, jalan: 'Jl. Tjilik Riwut (Kasongan–Palangka Raya)', kondisi: 'mulus' },
    { a: 'palangkaraya', b: 'gunungmas', km: 175, tol: 0, jalan: 'Jl. Provinsi Palangka Raya–Bukit Rawi–Sepang–Kuala Kurun', kondisi: 'bergelombang' },
    { a: 'palangkaraya', b: 'pulangpisau', km: 95, tol: 0, jalan: 'Trans-Kalimantan (Jembatan Tumbang Nusa–Pulang Pisau)', kondisi: 'mulus' },
    { a: 'pulangpisau', b: 'kapuas', km: 45, tol: 0, jalan: 'Trans-Kalimantan (Pulang Pisau–Kuala Kapuas)', kondisi: 'mulus' },
    { a: 'palangkaraya', b: 'baritoselatan', km: 198, tol: 0, jalan: 'Trans-Kalimantan Poros Tengah (Palangka Raya–Timpeh–Buntok)', kondisi: 'bergelombang' },
    { a: 'baritoselatan', b: 'baritotimur', km: 72, tol: 0, jalan: 'Jl. Nasional Buntok–Ampah–Tamiang Layang', kondisi: 'mulus' },
    { a: 'baritoselatan', b: 'baritoutara', km: 118, tol: 0, jalan: 'Jl. Nasional Buntok–Pendang–Muara Teweh', kondisi: 'bergelombang' },
    { a: 'baritoutara', b: 'murungraya', km: 96, tol: 0, jalan: 'Jl. Negara Muara Teweh–Puruk Cahu', kondisi: 'bergelombang' },
    { a: 'gunungmas', b: 'baritoutara', km: 165, tol: 0, jalan: 'Jalur Pedalaman Kuala Kurun–Muara Teweh', kondisi: 'tanah' },

    /* === PENGHUBUNG KALTENG ↔ KALSEL === */
    { a: 'kapuas', b: 'baritokuala', km: 32, tol: 0, jalan: 'Trans-Kalimantan (Anjir Pasar–Jembatan Barito)', kondisi: 'mulus' },
    { a: 'baritotimur', b: 'tabalong', km: 54, tol: 0, jalan: 'Jl. Lintas Pasar Panas–Kelua–Tanjung', kondisi: 'mulus' },

    /* === JARINGAN JALAN ASLI KALIMANTAN SELATAN === */
    { a: 'baritokuala', b: 'banjarmasin', km: 28, tol: 0, jalan: 'Jl. Brigjen Hasan Basri (Marabahan–Jembatan Alalak–Banjarmasin)', kondisi: 'mulus' },
    { a: 'banjarmasin', b: 'banjarbaru', km: 34, tol: 0, jalan: 'Jl. Ahmad Yani / Jl. Gubernur Syarkawi', kondisi: 'mulus' },
    { a: 'banjarbaru', b: 'banjar', km: 10, tol: 0, jalan: 'Jl. Ahmad Yani (Banjarbaru–Martapura)', kondisi: 'mulus' },
    { a: 'banjarbaru', b: 'tanahlaut', km: 48, tol: 0, jalan: 'Jl. Nasional Banjarbaru–Bati-Bati–Pelaihari', kondisi: 'mulus' },
    { a: 'banjar', b: 'tapin', km: 76, tol: 0, jalan: 'Jl. Nasional Ahmad Yani (Martapura–Rantau)', kondisi: 'mulus' },
    { a: 'tapin', b: 'hss', km: 25, tol: 0, jalan: 'Jl. Nasional Rantau–Kandangan', kondisi: 'mulus' },
    { a: 'hss', b: 'hst', km: 30, tol: 0, jalan: 'Jl. Nasional Kandangan–Barabai', kondisi: 'mulus' },
    { a: 'hst', b: 'hsu', km: 32, tol: 0, jalan: 'Jl. Nasional Barabai–Amuntai', kondisi: 'mulus' },
    { a: 'hst', b: 'balangan', km: 38, tol: 0, jalan: 'Jl. Nasional Barabai–Paringin', kondisi: 'mulus' },
    { a: 'hsu', b: 'tabalong', km: 44, tol: 0, jalan: 'Jl. Nasional Amuntai–Kelua–Tanjung', kondisi: 'mulus' },
    { a: 'balangan', b: 'tabalong', km: 34, tol: 0, jalan: 'Jl. Nasional Paringin–Tanjung', kondisi: 'mulus' },
    { a: 'tanahlaut', b: 'tanahbumbu', km: 192, tol: 0, jalan: 'Jl. Lintas Selatan Kalsel (Pelaihari–Satui–Batulicin)', kondisi: 'bergelombang' },
    { a: 'banjarbaru', b: 'tanahbumbu', km: 174, tol: 0, jalan: 'Jalan Lintas Baru Banjarbaru–Batulicin (Tembus Meratus)', kondisi: 'mulus' },
    { a: 'tanahbumbu', b: 'kotabaru', km: 22, tol: 0, laut: true, jam: 1.0, kapalMobil: 185000, kapalOrang: 15000, jalan: 'Feri ASDP Batulicin–Tanjung Serdang (Pulau Laut)', kondisi: 'mulus' },

    /* === PENGHUBUNG KALSEL ↔ KALTIM & KALTENG ↔ KALTIM === */
    { a: 'tabalong', b: 'paser', km: 138, tol: 0, jalan: 'Trans-Kalimantan Poros Selatan (Tanjung–Gunung Rambutan–Tanah Grogot)', kondisi: 'bergelombang' },
    { a: 'tanahbumbu', b: 'paser', km: 215, tol: 0, jalan: 'Jalur Pesisir Timur (Batulicin–Cantung–Kuaro–Tanah Grogot)', kondisi: 'bergelombang' },
    { a: 'baritoutara', b: 'kubar', km: 195, tol: 0, jalan: 'Jalur Lintas Benangin–Sendawar (Kalteng–Kaltim)', kondisi: 'rusak' },

    /* === JARINGAN JALAN ASLI KALIMANTAN TIMUR & IKN === */
    { a: 'paser', b: 'ppu', km: 122, tol: 0, jalan: 'Trans-Kalimantan (Tanah Grogot–Kuaro–Penajam)', kondisi: 'bergelombang' },
    { a: 'ppu', b: 'ikn', km: 56, tol: 0, jalan: 'Jl. Negara Penajam–Petung–Sepaku (IKN)', kondisi: 'mulus' },
    { a: 'ppu', b: 'balikpapan', km: 24, tol: 0, laut: true, jam: 1.2, kapalMobil: 195000, kapalOrang: 18000, jalan: 'Feri Kariangau–Penajam (Teluk Balikpapan)', kondisi: 'mulus' },
    { a: 'balikpapan', b: 'ikn', km: 72, tol: 35000, jalan: 'Tol IKN & Jembatan Pulau Balang (Balikpapan–Sepaku)', kondisi: 'tol' },
    { a: 'balikpapan', b: 'samarinda', km: 99, tol: 125000, jalan: 'Tol Balikpapan–Samarinda (Balsam)', kondisi: 'tol' },
    { a: 'ikn', b: 'kukar', km: 98, tol: 0, jalan: 'Jl. Sepaku–Loa Janan–Tenggarong', kondisi: 'mulus' },
    { a: 'samarinda', b: 'kukar', km: 34, tol: 0, jalan: 'Jl. Nasional Samarinda–Tenggarong Seberang', kondisi: 'mulus' },
    { a: 'kukar', b: 'kubar', km: 285, tol: 0, jalan: 'Trans-Kalimantan (Tenggarong–Kota Bangun–Sendawar)', kondisi: 'rusak' },
    { a: 'kubar', b: 'mahakamulu', km: 145, tol: 0, jalan: 'Jalur Pedalaman Tering–Long Bagun–Ujoh Bilang', kondisi: 'tanah' },
    { a: 'samarinda', b: 'bontang', km: 118, tol: 0, jalan: 'Jl. Poros Samarinda–Bontang', kondisi: 'mulus' },
    { a: 'bontang', b: 'kutim', km: 62, tol: 0, jalan: 'Jl. Poros Bontang–Sangatta', kondisi: 'mulus' },
    { a: 'kutim', b: 'berau', km: 358, tol: 0, jalan: 'Trans-Kalimantan Poros Timur (Sangatta–Muara Wahau–Tanjung Redeb)', kondisi: 'bergelombang' },

    /* === PENGHUBUNG KALTIM ↔ KALTARA & JARINGAN JALAN KALIMANTAN UTARA === */
    { a: 'berau', b: 'tanjungselor', km: 132, tol: 0, jalan: 'Trans-Kalimantan Poros Utara (Tanjung Redeb–Tanjung Selor)', kondisi: 'mulus' },
    { a: 'tanjungselor', b: 'tarakan', km: 48, tol: 0, laut: true, jam: 1.5, kapalMobil: 260000, kapalOrang: 95000, jalan: 'Feri / Speedboat Kayan (Tanjung Selor–Tarakan)', kondisi: 'mulus' },
    { a: 'tanjungselor', b: 'tanatidung', km: 124, tol: 0, jalan: 'Trans-Kalimantan Utara (Tanjung Selor–Sekatak–Tideng Pale)', kondisi: 'bergelombang' },
    { a: 'tanatidung', b: 'malinau', km: 112, tol: 0, jalan: 'Jl. Nasional Tideng Pale–Malinau', kondisi: 'bergelombang' },
    { a: 'tanatidung', b: 'nunukan', km: 148, tol: 0, laut: true, jam: 4.5, kapalMobil: 290000, kapalOrang: 85000, jalan: 'Jl. Sei Ular–Feri Penyeberangan ke Pulau Nunukan', kondisi: 'bergelombang' },
    { a: 'tarakan', b: 'nunukan', km: 125, tol: 0, laut: true, jam: 3.5, kapalMobil: 390000, kapalOrang: 150000, jalan: 'Feri Penyeberangan Tarakan–Tunon Taka Nunukan', kondisi: 'mulus' },
    { a: 'surabaya', b: 'makassar', km: 780, tol: 0, laut: true, jam: 20, kapalMobil: 1650000, kapalOrang: 320000 },
    { a: 'makassar', b: 'parepare', km: 155, tol: 0 },
    { a: 'makassar', b: 'kendari', km: 620, tol: 0 },
    { a: 'parepare', b: 'mamuju', km: 285, tol: 0, jalan: 'Trans-Sulawesi Barat (Parepare–Majene–Mamuju)', kondisi: 'bergelombang' },
    { a: 'mamuju', b: 'palu', km: 340, tol: 0, jalan: 'Trans-Sulawesi Barat (Mamuju–Pasangkayu–Palu)', kondisi: 'bergelombang' },
    { a: 'parepare', b: 'palu', km: 590, tol: 0 },
    { a: 'palu', b: 'gorontalo', km: 530, tol: 0, jalan: 'Trans-Sulawesi Tengah–Gorontalo', kondisi: 'mulus' },
    { a: 'gorontalo', b: 'manado', km: 425, tol: 0, jalan: 'Trans-Sulawesi Utara (Gorontalo–Kotamobagu–Manado)', kondisi: 'mulus' },
    { a: 'merak', b: 'serang', km: 42, tol: 25000, jalan: 'Tol Tangerang–Merak (Merak–Serang)', kondisi: 'tol' },
    { a: 'serang', b: 'jakarta', km: 85, tol: 55000, jalan: 'Tol Tangerang–Merak (Serang–Jakarta)', kondisi: 'tol' },
    { a: 'pekanbaru', b: 'tanjungpinang', km: 280, tol: 0, laut: true, jam: 8, kapalMobil: 950000, kapalOrang: 195000, jalan: 'Feri Ro-Ro Buton/Dumai–Tanjung Pinang', kondisi: 'mulus' },
    { a: 'palembang', b: 'tanjungpinang', km: 490, tol: 0, laut: true, jam: 14, kapalMobil: 1250000, kapalOrang: 260000, jalan: 'Feri Laut Palembang–Tanjung Pinang', kondisi: 'mulus' },
    { a: 'palembang', b: 'pangkalpinang', km: 215, tol: 0, laut: true, jam: 6, kapalMobil: 680000, kapalOrang: 145000, jalan: 'Feri ASDP Tanjung Api-Api–Muntok–Pangkalpinang', kondisi: 'mulus' },
    { a: 'manado', b: 'sofifi', km: 320, tol: 0, laut: true, jam: 10, kapalMobil: 1100000, kapalOrang: 220000, jalan: 'Feri Laut Maluku (Bitung–Ternate/Sofifi)', kondisi: 'mulus' },
    { a: 'ambon', b: 'sofifi', km: 510, tol: 0, laut: true, jam: 15, kapalMobil: 1350000, kapalOrang: 270000, jalan: 'Kapal Ro-Ro Ambon–Sofifi', kondisi: 'mulus' },
    { a: 'makassar', b: 'ambon', km: 950, tol: 0, laut: true, jam: 24, kapalMobil: 1900000, kapalOrang: 380000 },
    { a: 'ambon', b: 'sorong', km: 540, tol: 0, laut: true, jam: 16, kapalMobil: 1450000, kapalOrang: 280000 },
    { a: 'sorong', b: 'manokwari', km: 340, tol: 0, jalan: 'Trans-Papua Barat (Sorong–Bintuni–Manokwari)', kondisi: 'bergelombang' },
    { a: 'manokwari', b: 'nabire', km: 370, tol: 0, jalan: 'Trans-Papua (Manokwari–Wasior–Nabire)', kondisi: 'rusak' },
    { a: 'nabire', b: 'jayapura', km: 540, tol: 0, laut: true, jam: 16, kapalMobil: 1450000, kapalOrang: 290000, jalan: 'Kapal Ro-Ro Nabire–Jayapura', kondisi: 'mulus' },
    { a: 'nabire', b: 'wamena', km: 380, tol: 0, jalan: 'Trans-Papua Pegunungan (Nabire–Enarotali–Wamena)', kondisi: 'tanah' },
    { a: 'jayapura', b: 'wamena', km: 575, tol: 0, jalan: 'Trans-Papua (Jayapura–Yalimo–Wamena)', kondisi: 'rusak' },
    { a: 'jayapura', b: 'merauke', km: 760, tol: 0, laut: true, jam: 20, kapalMobil: 1750000, kapalOrang: 350000, jalan: 'Kapal Pelni/Ro-Ro Jayapura–Merauke', kondisi: 'mulus' },
    { a: 'nabire', b: 'merauke', km: 820, tol: 0, laut: true, jam: 22, kapalMobil: 1850000, kapalOrang: 370000, jalan: 'Kapal Ro-Ro Nabire–Timika–Merauke', kondisi: 'mulus' },
    { a: 'sorong', b: 'jayapura', km: 980, tol: 0, laut: true, jam: 24, kapalMobil: 2100000, kapalOrang: 420000 }
  ];
  /* 5 level kecepatan mobil: 1 (0-25), 2 (25-50), 3 (50-75), 4 (75-100), 5 (100 - top speed asli mobil) */
  var GIGI = [
    { id: 1, nama: '1', lo: 0, hi: 25, boros: 0.8 },
    { id: 2, nama: '2', lo: 25, hi: 50, boros: 0.85 },
    { id: 3, nama: '3', lo: 50, hi: 75, boros: 0.92 },
    { id: 4, nama: '4', lo: 75, hi: 100, boros: 1.0 },
    { id: 5, nama: '5', lo: 100, hi: 170, boros: 1.45, ngebut: true }
  ];
  /* 5 level kecepatan motor: 1 (0-15), 2 (15-30), 3 (30-45), 4 (45-60), 5 (60 - top speed asli motor) */
  var GIGI_MOTOR = [
    { id: 1, nama: '1', lo: 0, hi: 15, boros: 0.8 },
    { id: 2, nama: '2', lo: 15, hi: 30, boros: 0.85 },
    { id: 3, nama: '3', lo: 30, hi: 45, boros: 0.92 },
    { id: 4, nama: '4', lo: 45, hi: 60, boros: 1.0 },
    { id: 5, nama: '5', lo: 60, hi: 110, boros: 1.4, ngebut: true }
  ];
  var VMAX = { hatch: 160, mpv: 170, suv: 180, van: 185, sedan: 205, sport: 226, pikap: 135 };
  var VMAX_MOBIL = {
    granmax: 130, carry: 130, hilux: 145, l300: 130, traga: 135, triton: 145,
    calya: 160, sigra: 160, ayla: 155, agya: 160, brio: 165, airev: 100, binguoev: 130, cloudev: 150,
    xenia: 170, avanza: 170, ertiga: 170, terios: 170, rush: 170, xl7: 170, veloz: 175, xpander: 175, stargazer: 175,
    raize: 175, brv: 180, yariscross: 180, atto3: 160, hiace: 160,
    bydm6: 180, creta: 180, hrv: 180, innova: 175, zenix: 180, jimny: 145, hiluxdc: 175,
    fortuner: 185, pajerosport: 190, civicrs: 200, bydseal: 180, crv: 190, ioniq5: 185, camry: 210, gr86: 226,
    staria: 185, palisade: 195, model3: 261, bmw330i: 250,
    alphard: 180, vellfire: 185, lexuslm: 190, landcruiser: 210, porsche911: 308, mercg63: 240
  };
  var VMAX_MOTOR = {
    dazz: 90, revo: 95, mio: 95, beat: 95, 'beat-bekas': 92, gear: 100, supra: 105, 'supra-bekas': 102,
    scoopy: 95, vario: 108, mxking: 132, icon: 55, em1e: 50, alvacervo: 103, aerox: 122, aeroxalpha: 128, vario160: 122, nmax: 120, nmaxturbo: 126, pcx160: 120, pcxroadsync: 122,
    nex2: 95, address: 95, genio: 95, fazzio: 95, lexi155: 118, filano: 98, stylo160: 120, adv160: 120,
    vespa: 108, vespasprint: 110, vespagts: 135, vespa946: 112, xmax250: 145, forza250: 145,
    satriafu: 142, cb150r: 138, klx150: 115, w175: 118, crf150l: 115, wr155r: 128, gsxr150: 148,
    cbr150: 142, r15: 145, r15m: 148, mt25: 168, cbr250: 179, cbr250sp: 182, 'cbr250-bekas': 176, ninja250: 175, r25: 175, zx25r: 187, zx25rr: 192,
    rxking: 140, r6: 260, zx4rr: 220, zx6r: 265, zx10r: 299, harleysport: 220, r1m: 299, cbr1000: 299, h2: 300, s1000rr: 303, panigalev4: 308
  };
  function vmaxKendaraan(S, jenis) {
    if (jenis === 'mobil') {
      var c = S && S.mobil;
      var dasar = (c && VMAX_MOBIL[c.id]) || VMAX[(c && c.bentuk) || 'mpv'] || 170;
      var bonusMesin = (c && c.upg && c.upg.mesin) ? c.upg.mesin * 12 : 0;
      return dasar + bonusMesin;
    }
    var m = S && S.motor;
    return (m && VMAX_MOTOR[m.id]) || 100;
  }
  /* skor kenyamanan kendaraan (1.0 = standar, >1 = penumpang tetap mau walau tarif lebih tinggi) */
  function nyaman(k, jenis) {
    if (!k) return 1;
    if (jenis === 'mobil') {
      var bUpg = (k.upg && k.upg.mesin) ? k.upg.mesin * 0.05 : 0;
      if (k.bentuk === 'pikap') return 0.7 + bUpg;
      if (k.kelas === 'sultan') return 1.7 + bUpg;
      if (k.kelas === 'mewah') return 1.45 + bUpg;
      if (k.harga >= 300e6) return 1.3 + bUpg;
      if (k.harga >= 220e6) return 1.18 + bUpg;
      return 1.02 + bUpg;
    }
    if (k.id === 'forza250' || k.id === 'xmax250') return 1.45;
    if (k.id === 'nmax' || k.id === 'pcx160' || k.id === 'adv160' || k.id === 'vespa' || k.id === 'vespasprint') return 1.32;
    if (k.id === 'vario160' || k.id === 'stylo160' || k.id === 'lexi155' || k.id === 'filano' || k.id === 'aerox' || k.id === 'scoopy') return 1.16;
    if (k.harga >= 60e6) return 1.22;
    return 1.0;
  }
  var ISTIRAHAT = {
    menepi: { nama: 'Menepi tidur sebentar', menit: 20, biaya: 0, stamina: 22 },
    makan: { nama: 'Rumah makan', menit: 45, biaya: 40000, kenyang: 70, minum: 60, stamina: 12 },
    rehat: { nama: 'Rehat 2 jam', menit: 120, biaya: 0, stamina: 55 },
    penginapan: { nama: 'Penginapan (tidur 7 jam)', menit: 420, biaya: 250000, stamina: 100 }
  };
  var DASAR = { perKm: 520, tetap: 25000, minimal: 50000, tambahLaut: 40000 };

  /* level kecepatan 1-4 normal (realistis); level 5 khusus Mode VVIP terbuka & tidak hujan */
  function gigiEfektif(S, jenis) {
    var gi = Math.max(1, Math.min(5, Math.round((S && S.gigiJalan) || 2)));
    var vvip = !!(S && S.vvip && S.vvip.aktif);
    var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S);
    if ((!vvip || hujan) && gi > 4) gi = 4;
    return gi;
  }
  function gigiInfo(S, jenis, id) {
    var gi = Math.max(1, Math.min(5, id || gigiEfektif(S, jenis))), t = (jenis === 'mobil' ? GIGI : GIGI_MOTOR)[gi - 1];
    var vmax = vmaxKendaraan(S, jenis);
    var lo = Math.min(t.lo, Math.max(0, vmax - 5));
    var hi = gi === 5 ? Math.max(lo + 5, vmax) : Math.min(t.hi, vmax);
    return { id: gi, nama: t.nama, lo: lo, hi: hi, mid: Math.max(8, (lo + hi) / 2), boros: t.boros * (jenis === 'mobil' ? 1.2 : 1.15), ngebut: !!t.ngebut, vmax: vmax };
  }
  function bolehKhususJalan(S) { var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S); return !!(S && S.vvip && S.vvip.aktif) && !hujan; }
  function nama(id) { return KOTA[id] ? KOTA[id].nama : id; }
  function ruasAntara(a, b) { for (var i = 0; i < RUAS.length; i++) { var r = RUAS[i]; if ((r.a === a && r.b === b) || (r.a === b && r.b === a)) return r; } return null; }
  function tetangga(id) {
    var h = [];
    RUAS.forEach(function (r) { if (r.a === id) h.push({ ke: r.b, r: r }); else if (r.b === id) h.push({ ke: r.a, r: r }); });
    return h;
  }
  /* jalur terpendek dengan Dijkstra fleksibel (bisa hindari laut, paksa prioritaskan laut, atau blokir ruas tertentu untuk jalur alternatif) */
  function jalurOpsi(a, b, opsi) {
    if (a === b || !KOTA[a] || !KOTA[b]) return null;
    opsi = opsi || {};
    var dist = {}, dari = {}, sel = {}, ids = Object.keys(KOTA);
    var blokir = opsi.blokir || {};
    ids.forEach(function (k) { dist[k] = Infinity; }); dist[a] = 0;
    for (var n = 0; n < ids.length; n++) {
      var u = null; ids.forEach(function (k) { if (!sel[k] && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null || dist[u] === Infinity) break; sel[u] = true; if (u === b) break;
      tetangga(u).forEach(function (t) {
        if (opsi.hindariLaut && t.r.laut) return;
        var k1 = u + '|' + t.ke, k2 = t.ke + '|' + u;
        if (blokir[k1] || blokir[k2]) return;
        var penLaut = opsi.preferLaut ? 0 : (t.r.laut ? 220 : 0);
        var bobot = t.r.km + penLaut;
        var d = dist[u] + bobot;
        if (d < dist[t.ke]) { dist[t.ke] = d; dari[t.ke] = u; }
      });
    }
    if (dist[b] === Infinity) return null;
    var simpul = [b]; while (simpul[0] !== a) simpul.unshift(dari[simpul[0]]);
    var ruas = [], km = 0, tol = 0, laut = false, kapalMobil = 0, kapalOrang = 0;
    for (var i = 0; i < simpul.length - 1; i++) {
      var r = ruasAntara(simpul[i], simpul[i + 1]);
      if (!r) return null;
      ruas.push(r); km += r.km; tol += r.tol || 0;
      if (r.laut) { laut = true; kapalMobil += r.kapalMobil || 0; kapalOrang += r.kapalOrang || 0; }
    }
    return { simpul: simpul, ruas: ruas, km: km, tol: tol, laut: laut, kapalMobil: kapalMobil, kapalOrang: kapalOrang };
  }
  function jalur(a, b) { return jalurOpsi(a, b, null); }

  /* Cari hingga 3 jalur alternatif berbeda antara a dan b (contoh: Jalur Feri vs Jalur Darat Memutar lebih hemat biaya kapal, atau jalur Trans-Kalimantan Utara vs Tengah) */
  function semuaJalur(a, b, maks) {
    maks = maks || 3;
    var utama = jalurOpsi(a, b, null);
    if (!utama) return [];
    var hasil = [], kunciAda = {};
    function tambah(j, tag) {
      if (!j || !j.simpul || j.simpul.length < 2) return;
      var k = j.simpul.join('>');
      if (kunciAda[k]) return;
      /* saring jalur memutar yang terlalu ekstrem (> 3,5x jalur utama, kecuali menghindari feri laut) */
      if (tag !== 'darat' && j.km > utama.km * 2.35 + 140) return;
      if (tag === 'darat' && j.km > utama.km * 3.8 + 150) return;
      kunciAda[k] = true;
      var via = j.simpul.slice(1, -1).map(function (id) { return nama(id).replace(/^Kab\. |^Kota /, '').split(' (')[0]; });
      j.viaTeks = via.length ? ('via ' + via.join(' → ')) : ((j.ruas[0] && j.ruas[0].jalan) || 'Jalur Langsung');
      j.tag = tag || (j.laut ? 'feri' : 'darat');
      j.label = j.laut ? ('⛴️ Jalur Feri ' + (via.length ? 'via ' + via.join('–') : 'Langsung'))
        : (tag === 'darat' && utama.laut ? ('🛣️ Jalur Darat Memutar (Hemat Feri)') : (hasil.length === 0 ? '🛣️ Jalur Darat Utama' : ('🛣️ Jalur Alternatif ' + j.viaTeks)));
      hasil.push(j);
    }
    tambah(utama, utama.laut ? 'feri' : 'utama');
    /* 1. Jika jalur utama lewat Feri Laut, cari jalur 100% Darat (meski memutar lebih jauh tapi bebas biaya tiket feri!) */
    if (utama.laut) {
      var jDarat = jalurOpsi(a, b, { hindariLaut: true });
      if (jDarat) tambah(jDarat, 'darat');
    } else {
      /* 2. Jika jalur utama 100% Darat, cek apakah ada jalur via Feri yang lebih dekat jarak km (mis. Pontianak → Ketapang via Feri Rasau Jaya–Teluk Batang!) */
      var jFeri = jalurOpsi(a, b, { preferLaut: true });
      if (jFeri && jFeri.laut) tambah(jFeri, 'feri');
    }
    /* 3. Cari jalur darat alternatif dengan memblokir masing-masing ruas jalur utama */
    for (var i = 0; i < utama.simpul.length - 1 && hasil.length < maks; i++) {
      var blk = {};
      blk[utama.simpul[i] + '|' + utama.simpul[i + 1]] = true;
      var alt = jalurOpsi(a, b, { blokir: blk, hindariLaut: !utama.laut });
      if (alt) tambah(alt, alt.laut ? 'feri' : 'alt');
    }
    return hasil.slice(0, maks);
  }
  function bulat5k(n) { return Math.round(n / 5000) * 5000; }
  /* tarif standar per kursi. Jakarta–Bandung ±Rp105.000, Jakarta–Semarang ±Rp265.000 */
  /* pengali tarif berdasarkan kelas mobil (Reguler ×1,00 · Comfort/Innova ×1,25 · Mewah/Luxe ×1,65 · Sultan/VIP ×2,35) + bonus upgrade mesin */
  function pengaliKelasMobil(k) {
    if (!k) return 1;
    var dasar = k.kelas === 'sultan' ? 2.35 : k.kelas === 'mewah' ? 1.65 : (k.harga >= 300e6 ? 1.25 : 1);
    var bonusUpg = (k.upg && k.upg.mesin) ? k.upg.mesin * 0.03 : 0;
    return Math.round((dasar + bonusUpg) * 100) / 100;
  }
  function labelKelasLayanan(k) {
    if (!k) return 'Reguler';
    if (k.kelas === 'sultan') return 'VIP Sultan';
    if (k.kelas === 'mewah') return 'Luxe Mewah';
    if (k.harga >= 300e6) return 'Comfort Executive';
    return 'Reguler';
  }
  function tarifStandar(j, mobil) {
    var t = Math.max(DASAR.minimal, j.km * DASAR.perKm + DASAR.tetap) + (j.laut ? DASAR.tambahLaut : 0);
    var base = bulat5k(t);
    if (!mobil) return base;
    return Math.round(base * pengaliKelasMobil(mobil) / 1000) * 1000;
  }
  /* kondisi jalan asli: memengaruhi kecepatan efektif, batas aman realistis jalan (vMaxJalan km/j), konsumsi BBM, dan risiko ban bocor */
  var KONDISI_JALAN = {
    tol: { nama: 'Jalan Tol Mulus', faktorV: 1.0, vMaxJalan: 160, boros: 0.96, risikoBan: 0.6 },
    mulus: { nama: 'Aspal Mulus', faktorV: 0.76, vMaxJalan: 92, boros: 1.0, risikoBan: 1.0 },
    bergelombang: { nama: 'Aspal Bergelombang / Tambalan', faktorV: 0.62, vMaxJalan: 72, boros: 1.08, risikoBan: 1.65 },
    rusak: { nama: 'Jalan Rusak / Berlubang Berat', faktorV: 0.45, vMaxJalan: 50, boros: 1.18, risikoBan: 2.8 },
    tanah: { nama: 'Jalan Tanah / Berlumpur Pedalaman', faktorV: 0.32, vMaxJalan: 35, boros: 1.28, risikoBan: 3.6 }
  };
  function infoKondisi(r) {
    var k = (r && r.kondisi) || (r && r.tol > 0 ? 'tol' : 'mulus');
    return KONDISI_JALAN[k] || KONDISI_JALAN.mulus;
  }
  g.KK_RUTE = { kota: KOTA, ruas: RUAS, kondisiJalan: KONDISI_JALAN, infoKondisi: infoKondisi, gigi: GIGI, gigiMotor: GIGI_MOTOR, gigiEfektif: gigiEfektif, gigiInfo: gigiInfo, bolehKhususJalan: bolehKhususJalan, vmax: VMAX, vmaxKendaraan: vmaxKendaraan, nyaman: nyaman, pengaliKelasMobil: pengaliKelasMobil, labelKelasLayanan: labelKelasLayanan, istirahat: ISTIRAHAT, dasar: DASAR, nama: nama, tetangga: tetangga, ruasAntara: ruasAntara, jalur: jalur, jalurOpsi: jalurOpsi, semuaJalur: semuaJalur, tarifStandar: tarifStandar };
})(window);
