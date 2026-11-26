# The Driver

Game HP simulasi usaha kedai kopi kontainer berlatar dunia nyata Indonesia masa kini. Layar tegak, semua aksi lewat tap.
Rancangan lengkap ada di dokumen "Rancangan Game Kopi Kontainer".

## Isi
- `index.html`, `css/game.css` — tampilan
- `js/kalender.js` — kalender tanpa angka tahun (tahun ke-1 = 2023) dan rumus hari raya
- `js/adegan.js` — adegan kedai di kanvas 2D
- `js/uang.js` — laci, merchant QRIS, bank, pajak, KUR
- `js/stok.js` — stok, belanja, harga bergerak, kiriman
- `js/motor.js` — motor, kredit, bensin, perawatan, jual
- `js/mobil.js` — mobil, kredit, bensin, servis, pajak, jual
- `js/ojek.js` — ngojek: daftar driver, order penumpang/barang/makanan, tarif zona
- `js/properti.js` — KPR subsidi dan komersial, pindah rumah, tanah
- `js/antar.js` — pesanan antar dan platform
- `js/karyawan.js` — karyawan, gaji, THR, BPJS
- `js/dunia.js` — rating, Maps, media sosial, pesaing, cuaca, kejadian
- `js/usaha.js` — lokasi, tempat, alat, listrik, cabang, menu sendiri
- `js/diri.js` — kebutuhan badan, kos atau rumah, isinya, tidur
- `js/jualan.js` — pembeli datang, antre, bayar
- `js/suara.js` — lagu tema orisinal (pagi, jam buka, malam) dan efek suara Web Audio API
- `js/data/menu.js` — bahan, resep, HPP, jenis pembeli
- `js/main.js` — alur game
- `js/data/rute.js` — peta antarkota (22 kota, jarak, tol, kapal Merak–Bakauheni), tarif standar
- `js/travel.js` — Travel: pool, penumpang, tujuan, tarif, percepatan 1–5 dan ⚡, istirahat, laporan
- `js/data/nyata.js` — semua nama, merek, dan angka dunia nyata (diganti di sini saat game dijual)
- `tools/bundel.py` — gabungkan jadi satu berkas HTML untuk tautan uji

## Tahap
1. Kerangka: jam, kalender, buka dan tutup kedai, laporan malam, simpan otomatis ✔
2. Jualan inti: menu, pembeli antre, racik dengan tap, bayar tunai dan QRIS, laporan malam ✔
3. Uang: laci (uang kecil dan besar), QRIS cair hari kerja berikutnya, bank, biaya admin, PPh final, NIB, KUR ✔
4. Belanja dan stok: pasar, grosir, online, sales; harga bergerak tiap Senin; es mencair, susu basi ✔
5. Motor dan antar: dealer, kredit, bekas, bensin, oli, servis, pajak; pesanan WhatsApp, GoFood/GrabFood/ShopeeFood, pesanan besar; antar sendiri atau kurir ✔
6. Karyawan: lowongan, pelamar, tugas, sif, libur, tenaga, betah, gaji UMK, lembur, THR, BPJS, pesangon ✔
7. Dunia luar: bintang tiap pembeli, Google Maps dan ulasan, Instagram/TikTok/WA Business, iklan dan endorse, pesaing, hujan dan banjir, kebersihan, kejadian acak ✔
8. Naik kelas: lokasi, booth sampai ruko, alat, sewa, token listrik PLN, cabang, racik menu sendiri ✔
9. Gambar AI, animasi, suara (menunggu gambar)
10. Uji dan setel: simulasi 400 hari tanpa galat, angka disetel ✔
A. Penyempurnaan: sajikan sekali tap, harga pasaran, layar tidak mati, token PLN asli, kebutuhan badan, kos dan isinya ✔
C1. Makan & minum di HP, QRIS sampai 3, SeaBank, pasar/swalayan kapan saja, bensin per liter, bar oli dan servis, Threads, dock Pesanan antar, layar HP terkunci lebar ✔
C2. Jadwal karyawan per jam & tugas keamanan, toko game PS1–PS5 (bekas original & baru), kartu kredit aturan BI, jual barang bekas, lagu tema 3 suasana & efek suara ✔
B. Ngojek (Gojek/Grab Driver), motor sampai moge, mobil pikap sampai sultan, KPR subsidi/komersial, pindah rumah, isi rumah, tanah ✔
O1. Mulai sebagai driver, kedai jadi usaha sampingan (opsional) ✔
O2. Peta antarkota nyata: jarak, tol, kapal penyeberangan, tarif standar yang bisa dinaik-turunkan ✔
O3–O5. Travel mobil: tunggu penumpang penuh, jemput di kota yang sama, percepatan 1–5 dan ⚡ (malam/sepi), bensin, tilang, ban bocor, penumpang minta cepat atau santai, menepi/rumah makan/rehat 2 jam/penginapan ✔
O6. Pemandangan tiap kota, jalan bergulir, kapal ✔
P1. Stamina dan melek digabung jadi satu bar, bar bensin di samping baterai HP, potret karakter dipotong ke wajah dan mengikuti gender, adegan jalan tanpa latar kedai, perjalanan pulang/berangkat beranimasi sesuai jarak ✔
P2. Bar bensin motor turun saat jalan, percepatan 6 tingkat untuk semua kendaraan (motor 10–20 … 80–120 km/j), popup isi bensin & charge HP di HUD, 24 tipe HP baru, tombol Semua di setor tunai, adegan HB berjalan cepat ✔
P3. Kedai dihapus total: judul jadi "The Driver", menu HP kedai (stok, belanja, mitra pesan-antar, karyawan, racik, usaha, maps, medsos, OSS, pajak, QRIS merchant) dan pengaturan kedai dibuang; simpanan lama otomatis jadi mode driver ✔
P4. Gambar AI dihapus (kembali ke karakter vektor), sisa kedai di kabar pagi/menu makan dibersihkan, Rental PS dibuang, 1 jam = 30 detik (8× saat narik/travel/HB), gigi pakai slider, kamar lebih simpel, uang jajan anak harian 10/20/50/100rb, edit nama & TTL karakter, Toko online satu menu dua tab ✔
P5. Menu Teman (teman, sahabat, pacar, mantan), HB butuh hubungan >70%, pasangan bisa keluar rumah/bekerja/nongkrong/membangkang, selingkuh jika ajakan sering ditolak dengan pop-up bulat, 6 varian adegan HB ✔
P6. HB bergoyang naik-turun, slider gigi tetap bisa digeser saat narik/travel tanpa kartu penutup, teman/sahabat/pacar bisa dinikahi (paket Rp3jt/25jt/100jt), masa aktif pulsa ala Telkomsel, promo Ramadan +100% & hiasan Ramadan, waktu narik bebas + tidur di jalan + ganti hari jam 00, tombol Me time, kopi/minuman energi dari bar stamina, hiburan HP (YouTube/TikTok/unduh) memakai kuota ✔
P7. Waktu mangkal 1x (8x hanya saat bawa penumpang/antar/jalan/tidur), HB & me time 4x, Me time adegan siluet, cicilan kartu kredit tenor 3/6/9/12/18/24, sisa kata 'laci' dihapus, chip Fokus Ojol/Tanggal muda/tua/Musim hujan dihapus ✔
P8. Hiburan HP mempercepat waktu (8x) sampai ada penumpang; baterai HP dikalibrasi (idle ±1,2%/jam, ojol standby ±4,5%, Maps+trip ±8% untuk 5000 mAh, YouTube ±7%/jam); BBM 15% (motor) / 20% (mobil) lebih boros dari angka pabrik (kondisi kota nyata) ✔
P9. Karakter manusia asli & foto AI: foto asli Neil Aura, karakter AI Ferry Ananda serta karakter lain sesuai nama, usia, dan gender; tampil full-body proporsional di rumah/kos dan potret karakter di adegan HB ✔
P10. Tahap A realistis: 4 interior rumah & kos nyata (kos, subsidi 36, tipe 45, mewah 200), pencahayaan waktu nyata (subuh/pagi/senja/malam, lampu ruangan & sorot lampu kendaraan), dan hujan realistis 3 lapis + kilau aspal basah + petir ✔
P11. Poles posisi & tinggi karakter di lantai rumah/kos (tidak menimpa kasur), rapikan cutout Neil Aura, siapkan lazy loader Tahap B/C (kota, tema travel, motor, mobil) & lazy cache sw.js ✔
P12. Bersihkan sisa teks kedai/laci/gelas di kanvas transit, Properti, pesan WA pasangan, laporan harian mode driver, dan aria-label kanvas ✔
P13. Durasi HB malam/siang dibatasi 1–3 jam (tidak lagi skip sampai 04.00) & tambah dana Rp50 juta ke rekening bank ✔
P14. Pemutihan riwayat kredit 1× & tambahan modal Rp200 juta; perbaikan 5 mobil listrik EV (BYD M6, BYD Seal, Wuling Air ev, BinguoEV, Hyundai IONIQ 5) memakai baterai kWh & cas SPKLU ✔
P15. Paket 1 Kendaraan: tarif bebas Ojek & Travel + kenyamanan kendaraan, level kecepatan 1–5 sesuai top speed asli motor/mobil, odometer + lama pakai + total penghasilan kendaraan, dan bar ban + ganti ban ✔
P16. Paket 2 Keluarga & Hotel: dompet/tabungan pasangan, nafkah wajib 40% + notice awal bulan (telat 1 bln harmonis −50%), pinjam & minta bantuan beli (>90%), anggota keluarga sekolah/jajan/kerja/di rumah, penginapan (Rp50rb+) & hotel (Rp350rb+), serta travel bayar tunai/QRIS merchant ✔
P17. Paket 3 Properti & Peta Indonesia: beli rumah di 31 kota/daerah seluruh Indonesia, tagihan air ledeng (PDAM) bulanan, daftar ruangan rumah kosongan, serta katalog & instalasi kasur/AC/TV/perabot per ruangan ✔
P18. Pilihan lokasi HB (rumah/sofa/kamar mandi/balkon/penginapan/hotel) untuk pasangan/ipar/teman/siapa pun, tampilan & sistem GoCar/GrabCar disamakan dengan Ngojek, dan HUD menampilkan pekerjaan utama (GoCar/Travel) saat tidak ngojek ✔
P19. Rute Travel diperluas jadi 45 kota seluruh Indonesia (Aceh s/d Jayapura beserta kapal laut) & beli/KPR rumah di kota, kecamatan, atau desa manapun dengan penyesuaian harga wilayah ✔
P20. Perbaikan menyeluruh bug GoCar bensin/baterai (tab pilih Motor/Mobil di popup isi bensin, tombol isi/cas di garasi, bar ⚡Mobil EV, guard isi/kml/tangki), tombol GoCar & Travel dari rumah, jarak properti 45 kota, dan label kWh travel EV ✔
P21. Hapus belanja rumah tangga & Pasar Pokok (diganti nafkah + hitung mundur hari), istri bayar kuliah/kebutuhan adik ipar & patungan 50/50, menu QRIS Merchant di HP, syarat KPR dipermudah, kepemilikan banyak rumah + sewa bulanan/tahunan, jalan-jalan keluarga pakai mobil, dan belikan/kredit hadiah (HP/Motor/Rumah) untuk keluarga & teman ✔
P22. Perbaiki bug utama GoCar (cek BBM loop utama memakai MOBIL.cukup bukan MOTOR.cukup, visual standby mobil, tidak kehujanan di dalam mobil, label HUD/toast GoCar/GrabCar) serta tambahkan Bar Perasaan, tombol Ciuman, dan Foreplay ke pasangan, keluarga dewasa, dan teman ✔
P23. Perbaiki tombol hiburan HP (Nonton YouTube, Scroll TikTok/Reels, Unduh file besar) di panel Travel saat menunggu penumpang agar berfungsi & mempercepat waktu 8× ✔
P24. Adegan visual Ciuman & Foreplay, order GoCar jarak jauh hingga 300 km (1–5×/hari), karyawan Supir Travel (gaji per jalan/minggu/bulan, gaji pokok, uang makan, insentif, BPJS, & persenan kepuasan), Rumah Sakit + BPJS Kesehatan Kelas 1/2/3 asli, serta peta lengkap 56 kota & kabupaten 5 provinsi Kalimantan dengan jalan, jarak, luas, dan kondisi jalan realistis ✔
P25. HB dengan adik ipar/teman/orang lain 100% aman di hotel/penginapan & saat pasangan kerja/di luar rumah, tombol Bayar Cicilan manual + autodebit otomatis (Mobil, Motor, KPR, Kartu Kredit tgl 18), notice pembayaran klik-langsung di HUD, serta audit & perbaikan bug menyeluruh (tunggakan sisa 0, kebocoran biaya hotel HB, tilang level 5 travel, mogok motor dompet/bank) ✔
P26. Bisa memiliki lebih dari 1 mobil dan lebih dari 1 motor tanpa batas (armada multi-kendaraan), pilih mobil/motor utama di Garasi, serta autodebit cicilan & notice HUD mencakup seluruh kendaraan yang dimiliki ✔
P27. Audit & perbaikan bug menyeluruh seluruh APK: perbaikan penghasilan driver GoCar/Travel/Rental di riwayat & syarat Kartu Kredit, klik kartu saldo HUD mode driver, bug pesan naik limit KK, perbaikan urutan cek kondom/pasien sebelum potong saldo (HB/RS/Nikah), rental multi-mobil & harga asli kendaraan + bersih indeks saat jual, supir travel otomatis pakai mobil cadangan armada, tracking BBM/EV mid-trip travel, tombol Kembali pilih QRIS, badge online GoCar vs Ojol, mutasi bank bensin/servis motor, dan pembersihan sisa teks kedai ✔
P28. Perbaiki bug Travel sangkut di kota lama saat pindah rumah ke kota lain (sinkron otomatis S.kota & S.travel.di saat pindah rumah maupun muat save lama, tombol Selesai & Pulang ke kota asal di panel Travel, dan fallback aman data kota untuk seluruh 95 kota/kabupaten Indonesia) ✔
P29. Koreksi menyeluruh fisika kecepatan, jarak, dan waktu tempuh Travel & GoCar agar realistis (seragamkan rumus rencana, kecepatan jalan, estimasi tiba, dan waktu ideal per ruas sesuai batas kecepatan asli tiap jenis jalan tol/mulus/bergelombang/rusak/tanah) ✔
P30. Perbaiki bug cicilan tetap ditagih & terpotong ganda setelah dibayar manual/autodebit (lacak terbayarSampai pada cicilan Mobil, Motor, KPR, Hadiah, Nafkah, BPJS, & KUR + status lunas bulan ini & hapus notice HUD), serta terapkan batas kecepatan realistis pada Ojol Motor & GoCar ✔
P31. Tambahkan modal Rp500.000.000 ke rekening (1×) dan pemutihan menyeluruh 1× (hapus SLIK kreditBuruk, nolkan semua tunggakan & denda Mobil, Motor, KPR, Kartu Kredit, KUR, Kos, dan BPJS agar bisa ajukan naik limit KK) ✔
P32. Pilihan mobil khusus untuk tiap Supir Travel agar tidak pernah memakai mobil utama pemain saat punya >=2 mobil penumpang (sinkron otomatis saat ganti mobil utama atau jual mobil, plus tampilkan nama mobil di laporan pagi & mutasi) ✔
P33. Fix bug KK+Leasing beli kendaraan + ganti rugi 500jt & limit KK Rp1M, 12 background realistis Tahap B (10 tema + Pontianak & Jakarta), rute Supir Travel bisa diarahkan, menu QRIS Karyawan terpisah per supir, Innova 7 penumpang (Reborn & Zenix) + info tangki BBM semua mobil, 6 HP baterai jumbo 2023 (s/d 23.800 mAh), Bar HB semua karakter + pacaran antar teman (non-LGBT) + 50 karakter baru kelahiran 1990-2010 ✔
P34. Audit & perbaikan bug gameplay: auto-tarik sisa QRIS Supir saat dipecat/resign, reset otomatis rute Supir saat pindah pulau + catat penghasilan ke riwayat, blokir sewa dobel mobil yg dipakai Supir, cicil pemakaian berjalan KK langsung tanpa tunggu tgl 1 + tombol lunasi cicilan KK, HUD notice QRIS Supir, pencarian cepat 50+ karakter di Teman, serta top speed & warna Innova Reborn ✔
P35. Fix nonton YouTube saat menunggu penumpang Travel, BBM otomatis isi khusus mode Travel (GoCar/Ojol tetap manual), pindahkan 6 bar status (Makan/Minum/Stamina/HB/HP/Bensin) ke dock bawah, fitur Upgrade Mobil (Mesin, Tangki, Efisiensi Lv 1-5), dan Power Bank HP kapasitas realistis 5.000-100.000 mAh ✔
P36. Tarif bertingkat sesuai kelas mobil untuk GoCar/GrabCar, Travel Sendiri, dan Supir Travel: Reguler x1,00, Comfort/Innova x1,25, Mobil Mewah (Luxe) x1,65, dan Mobil Sultan (VIP) x2,35 + bonus upgrade mesin ✔
P37. Tambahan modal 1x Rp5.000.000.000 (5 miliar) ke rekening bank ✔
P38. Nafkah nominal bebas dengan degradasi keharmonisan bertahap 1–6 bulan hingga 0%, menu baru Kas Travel (auto top-up dari bank saat saldo < Rp50 juta untuk bensin/tol/kapal/servis/gaji supir), auto-service/ganti ban/pajak mobil otomatis oleh karyawan Supir Travel dari Kas Travel, interval servis/oli/ban lebih irit (mobil 25.000/90.000 km, motor 6.000/15.000/40.000 km), serta kecepatan maksimal penuh (100% vmax) di Level 5 mode Travel (`sw.js` kk-24-37).
P39. Tahap C (Aset Mobil Realistis): 9 sprite mobil transparan fotorealistis (Innova Reborn, Avanza, Fortuner, Alphard, Land Cruiser, Brio, Civic RS, GR 86, Gran Max Pick Up) beserta pemetaan fallback per bentuk bodi di adegan.js sehingga seluruh 36 mobil dan lalu lintas jalan raya tampil realistis (`sw.js` kk-24-38).
P40. Nominal tarik/setor tunai & tabungan khusus lengkap (50rb–100jt + Semua), tombol Tutup Akun QRIS merchant dengan pencairan saldo otomatis, perapian tampilan aplikasi HP (tab ringkas Bank/Keluarga, grid nominal 5 kolom, panel lipat anti-scroll panjang), perbaikan total bug YouTube di Travel & pulsa per-frame, tambahan katalog 17 mobil (total 53, termasuk HiAce Premio 12 kursi), 14 motor (total 59), dan 15 HP/Tablet/Laptop (total 73), serta audit penuh rumus jarak/feri/bunga KK/BBM (`sw.js` kk-24-39).
P41. Batas Supir Travel dinaikkan menjadi 10 supir, Gembok Mode VVIP (berbayar Rp50jt) khusus untuk membuka Kecepatan Level 5 Top Speed sementara mode normal maksimal Level 4 realistis sesuai kondisi jalan, filter kronologi tahun rilis realistis (item HP/gadget, motor, mobil, game PS, dan hadiah 2024–2026 tidak muncul saat game masih tahun 2023 dan otomatis terbuka saat tahun berganti), hapus label hardcoded 2026 di UI, serta upgrade visual mobil dengan roda & velg alloy berputar presisi, suspensi bodi terpisah, bayangan kontak 2 lapis, dan lampu LED malam (`sw.js` kk-24-40).
P42. Modal awal game baru tepat Rp5.000.000 (Rp4.850.000 rekening bank + Rp150.000 dompet tunai, bebas suntikan bonus lama), Tutorial interaktif 5 langkah di awal game yang bisa di-skip & dibuka ulang dari Pengaturan, Mode Control Tower rahasia (tap layar luar/dalam game 30×) dengan manajemen multi-akun (aktifkan VVIP Lv 5, Mode Sandbox, Kebal Kebutuhan, Buka Semua Tahun 2023–2026), suntik/set dana, generator & redeem Kode Voucher resmi, serta penyempurnaan realisme detail (order ojol tunai langsung masuk dompet, cas motor listrik memotong kWh PLN rumah, top speed VVIP Lv 5 GoCar/Ojol, biaya oli 2-tak & derek akurat) (`sw.js` kk-24-41).
P43. Hapus seluruh aset gambar raster/AI (background, potret/badan karakter, kota/tema, & sprite mobil PNG) dan kembalikan seluruh adegan & avatar game ke 100% vektor Kanvas 2D & SVG murni yang ringan, konsisten, dan beroda berputar mulus (`sw.js` kk-24-42).
P44. Hapus sementara Mode Control Tower (hapus js/tower.js, trigger 30× tap, Sandbox, & voucher), pertahankan Kecepatan Level 5 dalam kondisi tergembok 🔒 (mode normal Lv 1–4 realistis), dan tambahkan layar Isi Data Karakter (nama, gender Cowok/Cewek, tanggal lahir/TTL, serta pratinjau avatar SVG & usia live) di awal permainan baru (`sw.js` kk-24-43).
P45. Kustomisasi karakter vektor tampan/cantik lengkap (warna kulit, gaya & warna rambut termasuk hijab/peci, jenis mata, mulut, 6 agama resmi & 27 suku/etnis Indonesia), seluruh 38 ibu kota provinsi Indonesia dengan filter pulau & rute terhubung penuh di Travel, 6 dompet digital QRIS (GoPay, DANA, ShopeePay, OVO, LinkAja, AstraPay) dan 10 bank populer (tambah BSI, CIMB Niaga, Bank Jago, PermataBank, Danamon) sesuai kebijakan asli, awal tahun 2026 sesuai dunia nyata, perapian HUD atas tanpa angka terpotong `...`, dock bawah presisi 5 bar (Makan & Minum digabung), penghapusan Perlengkapan antar di Garasi, perampingan menu APK HP (Properti bertab, Kas Travel & Garasi lipat), serta perbaikan global anti-scroll-loncat ke atas di seluruh menu pengaturan (`sw.js` kk-24-44).
P46. Pendaftaran driver ojol langsung aktif instan hari pertama (e-KYC tanpa tunggu 3 hari), konversi tampilan Makan & Minum, Apotek & RS, Dealer Motor, Dealer Mobil, Agen Bekas, Toko Online, Toko Game, & Tarif Travel ke grid kartu 2 kolom + tab segmented modern, gabungkan QRIS Karyawan ke menu QRIS, hapus menu Dompet dari HP, pisahkan Garasi / Dealer Motor / Dealer Mobil / Agen Motor & Mobil Bekas (17 motor bekas & 14 mobil bekas), fokuskan HP & Kuota khusus perangkat (jual-beli HP/Laptop/Power Bank dipindah ke Toko Online), rombak Properti (dropdown kota & kartu modern) & Travel (3 tab ringkas + kartu supir lipat), serta simetriskan penuh seluruh tombol aksi cepat & dock bawah Rumah/HP/Atur (`sw.js` kk-24-46).
