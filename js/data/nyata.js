/* nyata.js — semua nama, merek, dan angka dunia nyata dikumpulkan di sini.
   Saat game dijual, nama-nama asli cukup diganti di berkas ini saja.
   Sumber angka: dokumen "Rancangan Game Kopi Kontainer", bagian Sumber. */
(function (g) {
  'use strict';
  g.KK_NYATA = {
    namaHari: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
    hariSingkat: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
    namaBulan: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],

    /* UMK 2026 (berlaku 1 Januari 2026) */
    kota: [
      { id: 'medan', nama: 'Medan', provinsi: 'Sumatera Utara', umk: 4335198, bbm: 'sumatera', kos: 550000, makan: 15000, ppj: 0.03, hargaKopi: 1, zona: 1 },
      { id: 'pekanbaru', nama: 'Pekanbaru', provinsi: 'Riau', umk: 3998179, bbm: 'sumatera' /* perkiraan: Riau tidak ada di daftar sumber */, kos: 600000, makan: 16000, ppj: 0.03, hargaKopi: 1, zona: 1 },
      { id: 'jambi', nama: 'Kota Jambi', provinsi: 'Jambi', umk: 3868963, bbm: 'sumatera', kos: 650000, makan: 15000, ppj: 0.03, hargaKopi: 0.95, zona: 1 },
      { id: 'jakarta', nama: 'Jakarta', provinsi: 'DKI Jakarta', umk: 5729876, bbm: 'jawa', kos: 910000, makan: 20000, ppj: 0.024, hargaKopi: 1.15, zona: 2 }
    ],

    /* penyedia QRIS merchant; aturan transfer ke bank per September 2026 */
    qris: [
      { id: 'gopay', nama: 'GoPay', app: 'GoBiz', warna: '#00aed6', gratis: 100, biayaLebih: 0, transfer: 'Transfer ke bank gratis sampai 100 kali sebulan' },
      { id: 'dana', nama: 'DANA', app: 'DANA Bisnis', warna: '#118eea', gratis: 10, biayaLebih: 2500, transfer: 'Transfer ke bank gratis 10 kali sebulan, setelah itu ada biaya' },
      { id: 'shopeepay', nama: 'ShopeePay', app: 'ShopeePay Merchant', warna: '#ee4d2d', gratis: Infinity, biayaLebih: 0, transfer: 'Transfer ke bank gratis tanpa batas bulanan' }
    ],
    /* biayaLebih DANA setelah kuota: perkiraan, sama dengan BI-FAST */

    /* tabungan kartu debit biasa (biru/klasik/perak), November 2026 */
    bank: [
      { id: 'bca', nama: 'BCA', app: 'BCA mobile', warna: '#0060af', admin: 17000, batasTransfer: 100e6 },
      { id: 'bri', nama: 'BRI', app: 'BRImo', warna: '#00529c', admin: 15500, batasTransfer: 50e6 },
      { id: 'bni', nama: 'BNI', app: 'wondr by BNI', warna: '#f15a23', admin: 16000, batasTransfer: 50e6 },
      { id: 'mandiri', nama: 'Mandiri', app: "Livin' by Mandiri", warna: '#003d79', admin: 17000, batasTransfer: 25e6 },
      /* SeaBank: bank digital, tanpa biaya admin, transfer antarbank gratis 100 kali sebulan (VIVA, 2024). Tanpa kartu ATM:
         setor dan tarik tunai di Indomaret, Rp5.000 per transaksi, Rp50.000–1.000.000 per transaksi, tarik maksimal Rp5 juta sehari (Fortune IDN) */
      { id: 'seabank', nama: 'SeaBank', app: 'SeaBank', warna: '#f37021', admin: 0, batasTransfer: 0, gratisTransfer: 100,
        tunai: { tempat: 'Indomaret', biaya: 5000, min: 50000, maks: 1000000, tarikHarian: 5000000 } }
    ],
    biFast: 2500,
    /* kos AC termurah per kota (Mamikos, November 2026); makan = nasi bungkus warung (perkiraan); ppj = pajak penerangan jalan (Jakarta 2,4%, kota lain perkiraan 3%) */
    /* token PLN prabayar: tarif 1.300 VA ke atas Rp1.444,70/kWh; biaya admin aplikasi perkiraan Rp2.400 (contoh: token 20 rb dibayar Rp22.400, dapat ±13 kWh) */
    pln: { tarif: 1444.70, admin: 2400, nominal: [20000, 50000, 100000, 200000, 500000, 1000000] },
    makanOjol: { tambahHarga: 1.25, ongkir: 10000, tunggu: 35 }, /* perkiraan */
    /* makan dan minum (perkiraan harga warung). kali = dikali harga nasi bungkus kota; harga = harga tetap */
    makanan: [
      { id: 'nasi', nama: 'Nasi bungkus', kali: 1, kenyang: 65, minum: 10 },
      { id: 'padang', nama: 'Nasi Padang (rendang & gulai)', kali: 1.6, kenyang: 85, minum: 10 },
      { id: 'bakso', nama: 'Bakso urat + mie', kali: 1.15, kenyang: 70, minum: 20 },
      { id: 'mietiau', nama: 'Mie tiau / kwetiau goreng', kali: 1.25, kenyang: 75, minum: 5 },
      { id: 'soto', nama: 'Soto ayam + nasi', kali: 1.15, kenyang: 72, minum: 22 },
      { id: 'nasgor', nama: 'Nasi goreng spesial', kali: 1.2, kenyang: 78, minum: 5 },
      { id: 'sate', nama: 'Sate ayam 10 tusuk + lontong', kali: 1.45, kenyang: 76, minum: 5 },
      { id: 'geprek', nama: 'Nasi ayam geprek', kali: 1.2, kenyang: 75, minum: 5 },
      { id: 'mie', nama: 'Mie ayam', kali: 0.9, kenyang: 55, minum: 10 },
      { id: 'roti', nama: 'Roti dan susu kotak', harga: 12000, kenyang: 30, minum: 20 },
      { id: 'gorengan', nama: 'Gorengan 5 biji', harga: 5000, kenyang: 20, minum: 0 }
    ],
    /* beli aset usaha sendiri: kontainer milik sendiri (sewa lahan tetap 45%), beli lahan (mahal, bebas sewa selamanya) */
    asetUsaha: { beliKontainer: 25000000, porsiSewaLahan: 0.45, beliLahanDasar: 250000000, sewaRukoBulan: 5000000, pindahRuko: 15000000 },
    minuman: [
      { id: 'air', nama: 'Air mineral 600 ml', harga: 4000, kenyang: 0, minum: 35, melek: 4 },
      { id: 'esteh', nama: 'Es teh manis', harga: 5000, kenyang: 5, minum: 40, melek: 8 },
      { id: 'kopibotol', nama: 'Kopi susu dingin (minimarket)', harga: 10000, kenyang: 5, minum: 30, melek: 28 },
      { id: 'energi', nama: 'Minuman berenergi dingin', harga: 8000, kenyang: 0, minum: 25, melek: 35 },
      { id: 'jus', nama: 'Jus buah', harga: 12000, kenyang: 10, minum: 45, melek: 12 }
    ],
    ojekKos: 12000, jarakKos: 3, /* perkiraan: kos ke kedai */
    /* barang untuk kos/rumah dengan kategori rapi untuk Tokopedia & Shopee */
    kategoriToko: [
      { id: 'semua', nama: 'Semua' },
      { id: 'elektronik', nama: 'Elektronik' },
      { id: 'dapur', nama: 'Dapur' },
      { id: 'perabot', nama: 'Perabot' },
      { id: 'gadget', nama: 'Gadget' },
      { id: 'hiburan', nama: 'Hiburan' }
    ],
    barangRumah: [
      { id: 'kipas', kat: 'elektronik', nama: 'Kipas angin berdiri', merek: 'Miyako', harga: 250000, watt: 0.04, ket: 'Tidur sedikit lebih nyenyak kalau AC mati' },
      { id: 'kulkas', kat: 'dapur', nama: 'Kulkas 1 pintu', merek: 'Sharp', harga: 1800000, watt: 0.05, ket: 'Simpan minuman dingin, minum lebih murah' },
      { id: 'ricecooker', kat: 'dapur', nama: 'Rice cooker', merek: 'Miyako', harga: 350000, watt: 0, ket: 'Masak sendiri, makan lebih murah' },
      { id: 'dispenser', kat: 'dapur', nama: 'Dispenser + galon', merek: 'Miyako', harga: 300000, watt: 0, ket: 'Minum di kos hampir gratis' },
      { id: 'karpet', kat: 'perabot', nama: 'Karpet dan bantal duduk', merek: 'Lokal', harga: 150000, watt: 0, ket: 'Kamar lebih nyaman' },
      { id: 'tv', kat: 'hiburan', nama: 'TV LED 32 inci', merek: 'Xiaomi', harga: 2000000, watt: 0.06, ket: 'Istirahat sambil nonton, stamina pulih lebih cepat' },
      { id: 'ps5', kat: 'hiburan', nama: 'PS5 Slim Digital', merek: 'Sony', harga: 9999000, watt: 0.2, butuh: 'tv', ket: 'Main game di kos. Butuh TV' },
      { id: 'ps5disc', kat: 'hiburan', nama: 'PS5 Slim Disc', merek: 'Sony', harga: 11399000, watt: 0.2, butuh: 'tv', ket: 'Bisa pakai kaset. Butuh TV' },
      { id: 'kaset', kat: 'hiburan', nama: 'Kaset game PS5', merek: 'Sony', harga: 1029000, watt: 0, butuh: 'ps5disc', banyak: true, ket: 'Game baru, main lebih seru' },
      { id: 'hp2', kat: 'gadget', nama: 'HP kelas menengah', merek: 'Samsung Galaxy A', harga: 4500000, watt: 0, ket: 'Kamera lebih bagus: posting media sosial lebih ramai' },
      { id: 'hp3', kat: 'gadget', nama: 'HP flagship', merek: 'iPhone', harga: 22000000, watt: 0, butuh: 'hp2', ket: 'Kamera terbaik: konten paling bagus' },
      /* hanya muat di rumah (perkiraan harga pasar) */
      { id: 'ac', kat: 'elektronik', nama: 'AC 1/2 PK + pasang', merek: 'Panasonic', harga: 3700000, watt: 0, rumah: true, ket: 'Rumah tidak ada AC bawaan. Tidur lebih nyenyak' },
      { id: 'springbed', kat: 'perabot', nama: 'Spring bed 160×200', merek: 'Lokal', harga: 3500000, watt: 0, rumah: true, ket: 'Tidur memulihkan stamina lebih banyak' },
      { id: 'sofa', kat: 'perabot', nama: 'Sofa 3 dudukan', merek: 'Informa', harga: 3000000, watt: 0, rumah: true, ket: 'Istirahat di rumah lebih cepat pulih' },
      { id: 'mejamakan', kat: 'perabot', nama: 'Meja makan 4 kursi', merek: 'Informa', harga: 2200000, watt: 0, rumah: true, ket: 'Makan di rumah lebih kenyang' },
      { id: 'kompor', kat: 'dapur', nama: 'Kompor gas + tabung 3 kg', merek: 'Rinnai', harga: 650000, watt: 0, rumah: true, ket: 'Masak sendiri di rumah' },
      { id: 'mesincuci', kat: 'elektronik', nama: 'Mesin cuci 2 tabung', merek: 'Sharp', harga: 1900000, watt: 0, rumah: true, ket: 'Cuci baju sendiri di rumah' },
      { id: 'kulkas2', kat: 'dapur', nama: 'Kulkas 2 pintu', merek: 'Samsung', harga: 4500000, watt: 0, rumah: true, ket: 'Stok minuman dingin lebih banyak' },
      { id: 'tv55', kat: 'hiburan', nama: 'TV 55 inci 4K', merek: 'Samsung', harga: 7000000, watt: 0, rumah: true, ket: 'Main PS dan nonton lebih puas' }
    ],

    /* menjual barang kos/rumah bekas (perkiraan): buka kotak turun ke 75%, lalu turun 12% setahun dan 0,15% tiap pemakaian */
    jualBarang: { awal: 0.75, awalBekas: 0.85, perTahun: 0.12, perPakai: 0.0015, min: 0.2 },

    /* toko game: PS1–PS4 bekas original (harga pasar e-commerce/komunitas retro Indonesia menurut kondisi fisik), PS5 baru resmi Sony Indonesia Oktober 2026 */
    konsolGame: [
      { id: 'ps1', nama: 'PlayStation 1 (PS One) Original', merek: 'Sony', bekas: true, min: 350000, maks: 600000, tahun: [1996, 2003], watt: 0.01, pulih: 12, ket: 'Konsol retro original Sony + stik ori, baca CD game original' },
      { id: 'ps2', nama: 'PlayStation 2 Slim Original', merek: 'Sony', bekas: true, min: 450000, maks: 750000, tahun: [2004, 2012], watt: 0.03, pulih: 14, ket: 'PS2 Slim SCPH-90006 original optik sehat + stik DualShock 2 ori mesin' },
      { id: 'ps3', nama: 'PlayStation 3 Slim OFW Original', merek: 'Sony', bekas: true, min: 1350000, maks: 2100000, tahun: [2010, 2015], watt: 0.09, pulih: 16, ket: 'PS3 Slim Official Firmware (OFW) original untuk kaset Blu-ray asli' },
      { id: 'ps4', nama: 'PlayStation 4 Slim 1TB OFW Original', merek: 'Sony', bekas: true, min: 2600000, maks: 3700000, tahun: [2017, 2022], watt: 0.15, pulih: 18, ket: 'PS4 Slim 1TB OFW original + DualShock 4 ori mesin' },
      { id: 'ps5', nama: 'PS5 Slim Digital Edition', merek: 'Sony', bekas: false, digital: true, harga: 9999000, watt: 0.2, pulih: 20, ket: 'Baru, garansi resmi Sony Indonesia. Main game digital PS Store' },
      { id: 'ps5disc', nama: 'PS5 Slim Disc Edition', merek: 'Sony', bekas: false, harga: 11399000, watt: 0.2, pulih: 20, ket: 'Baru, garansi resmi Sony Indonesia. Bisa kaset Blu-ray PS5 & PS4' }
    ],
    /* kaset / game original tiap konsol (45 judul ikonik PS1–PS5: PS1–PS4 original bekas terawat, PS5 original baru) */
    gameKonsol: [
      /* PS1 */
      { id: 'g_ps1_we4', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'Winning Eleven 4', harga: 120000, stamina: 4, ket: 'Sepak bola klasik PS1, CD original NTSC-J' },
      { id: 'g_ps1_ctr', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'Crash Team Racing (CTR)', harga: 175000, stamina: 5, ket: 'Balap kart legendaris, CD original Black Label' },
      { id: 'g_ps1_pepsiman', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'PepsiMan', harga: 320000, stamina: 5, ket: 'Aksi lari ikonik rental PS1, CD original Jepang' },
      { id: 'g_ps1_hmbtn', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'Harvest Moon: Back to Nature', harga: 260000, stamina: 6, ket: 'Simulasi kebun legendaris, CD original lengkap manual' },
      { id: 'g_ps1_re2', konsol: 'ps1', format: '2× CD-ROM Original', bekas: true, nama: 'Resident Evil 2 DualShock', harga: 280000, stamina: 5, ket: '2 keping CD original Leon & Claire' },
      { id: 'g_ps1_ff7', konsol: 'ps1', format: '3× CD-ROM Original', bekas: true, nama: 'Final Fantasy VII', harga: 450000, stamina: 6, ket: '3 keping CD original Squaresoft' },
      { id: 'g_ps1_mgs', konsol: 'ps1', format: '2× CD-ROM Original', bekas: true, nama: 'Metal Gear Solid', harga: 350000, stamina: 5, ket: 'Stealth legendaris Konami, 2 CD original' },
      { id: 'g_ps1_tekken3', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'Tekken 3', harga: 190000, stamina: 5, ket: 'Fighting klasik Namco, CD original' },
      { id: 'g_ps1_suikoden2', konsol: 'ps1', format: 'CD-ROM Original', bekas: true, nama: 'Suikoden II (Kolektor)', harga: 850000, stamina: 7, langka: true, ket: 'JRPG kolektor original langka, harga jual stabil' },
      /* PS2 */
      { id: 'g_ps2_gtasa', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'GTA: San Andreas', harga: 150000, stamina: 6, ket: 'DVD original lengkap peta Los Santos' },
      { id: 'g_ps2_we10', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Winning Eleven 10', harga: 95000, stamina: 4, ket: 'DVD original Konami' },
      { id: 'g_ps2_re4', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Resident Evil 4', harga: 160000, stamina: 5, ket: 'DVD original Capcom' },
      { id: 'g_ps2_gow2', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'God of War II', harga: 185000, stamina: 6, ket: 'DVD original 2-layer Sony Computer Entertainment' },
      { id: 'g_ps2_bully', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Bully (Canis Canem Edit)', harga: 175000, stamina: 5, ket: 'Petualangan sekolah Rockstar, DVD original' },
      { id: 'g_ps2_nfsmw', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Need for Speed: Most Wanted', harga: 165000, stamina: 5, ket: 'Balap liar BMW M3 GTR, DVD original EA' },
      { id: 'g_ps2_downhill', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Downhill Domination', harga: 195000, stamina: 5, ket: 'Balap sepeda gunung favorit rental PS2' },
      { id: 'g_ps2_gh3', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Guitar Hero III: Legends of Rock', harga: 140000, stamina: 5, ket: 'Musik rock klasik PS2, DVD original' },
      { id: 'g_ps2_kh2', konsol: 'ps2', format: 'DVD-ROM Original', bekas: true, nama: 'Kingdom Hearts II', harga: 180000, stamina: 6, ket: 'Action RPG Square Enix, DVD original' },
      /* PS3 */
      { id: 'g_ps3_gtav', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Grand Theft Auto V', harga: 140000, stamina: 6, ket: 'Blu-ray Disc original Rockstar Games' },
      { id: 'g_ps3_tlou', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'The Last of Us', harga: 165000, stamina: 6, ket: 'Blu-ray Disc original Naughty Dog' },
      { id: 'g_ps3_pes18', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'PES 2018', harga: 110000, stamina: 4, ket: 'Blu-ray Disc original Konami' },
      { id: 'g_ps3_rdr', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Red Dead Redemption', harga: 155000, stamina: 5, ket: 'Blu-ray Disc original lengkap peta' },
      { id: 'g_ps3_uncharted2', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Uncharted 2: Among Thieves', harga: 120000, stamina: 5, ket: 'Action adventure GOTY PS3' },
      { id: 'g_ps3_gow3', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'God of War III', harga: 145000, stamina: 6, ket: 'Blu-ray Disc original Santa Monica Studio' },
      { id: 'g_ps3_mgs4', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Metal Gear Solid 4', harga: 160000, stamina: 5, ket: 'Eksklusif PS3 Kojima Productions' },
      { id: 'g_ps3_gt6', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Gran Turismo 6', harga: 135000, stamina: 5, ket: 'Simulasi balap 1.200 mobil Polyphony' },
      { id: 'g_ps3_ds1', konsol: 'ps3', format: 'Blu-ray Original', bekas: true, nama: 'Dark Souls: Prepare to Die', harga: 210000, stamina: 6, ket: 'Action RPG menantang FromSoftware' },
      /* PS4 */
      { id: 'g_ps4_gowr', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'God of War Ragnarök', harga: 380000, stamina: 7, ket: 'Blu-ray Disc original Region 3 Asia' },
      { id: 'g_ps4_rdr2', konsol: 'ps4', format: '2× Blu-ray Original', bekas: true, nama: 'Red Dead Redemption 2', harga: 320000, stamina: 7, ket: '2 keping Blu-ray Disc original Data & Play' },
      { id: 'g_ps4_fc25', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'EA Sports FC 25', harga: 420000, stamina: 6, ket: 'Blu-ray Disc original EA Sports' },
      { id: 'g_ps4_got', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: "Ghost of Tsushima Director's Cut", harga: 350000, stamina: 7, ket: 'Blu-ray Disc original Sucker Punch' },
      { id: 'g_ps4_witcher3', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'The Witcher 3: Complete Edition', harga: 260000, stamina: 7, ket: 'RPG open-world + semua DLC' },
      { id: 'g_ps4_p5r', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'Persona 5 Royal', harga: 340000, stamina: 6, ket: 'JRPG populer Atlus, BD original' },
      { id: 'g_ps4_bloodborne', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'Bloodborne', harga: 230000, stamina: 6, ket: 'Eksklusif PS4 FromSoftware' },
      { id: 'g_ps4_uncharted4', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: "Uncharted 4: A Thief's End", harga: 185000, stamina: 6, ket: 'Blu-ray Disc original Naughty Dog' },
      { id: 'g_ps4_hzd', konsol: 'ps4', format: 'Blu-ray Original', bekas: true, nama: 'Horizon Zero Dawn Complete', harga: 195000, stamina: 6, ket: 'Open-world robot dinosaurus Guerrilla' },
      /* PS5 */
      { id: 'g_ps5_fc26', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'EA Sports FC 26', harga: 1029000, stamina: 7, ket: 'Game baru PS5 resmi bersegel' },
      { id: 'g_ps5_spider2', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: "Marvel's Spider-Man 2", harga: 1029000, stamina: 8, ket: 'Game eksklusif PS5 resmi Sony' },
      { id: 'g_ps5_wukong', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'Black Myth: Wukong', harga: 899000, stamina: 8, ket: 'Action RPG populer PS5' },
      { id: 'g_ps5_gt7', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'Gran Turismo 7', harga: 1029000, stamina: 7, ket: 'Simulasi balap resmi PlayStation Studios' },
      { id: 'g_ps5_ff7r', konsol: 'ps5', format: '2× PS5 BD Original', bekas: false, nama: 'Final Fantasy VII Rebirth', harga: 1029000, stamina: 8, ket: 'JRPG epik PS5 Square Enix' },
      { id: 'g_ps5_elden', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'Elden Ring: Shadow of the Erdtree', harga: 949000, stamina: 8, ket: 'GOTY Open-World RPG FromSoftware' },
      { id: 'g_ps5_astro', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'Astro Bot', harga: 879000, stamina: 7, ket: 'Platformer pemenang GOTY PS5' },
      { id: 'g_ps5_demons', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: "Demon's Souls Remake", harga: 899000, stamina: 7, ket: 'Remake grafis generasi baru PS5' },
      { id: 'g_ps5_cyberpunk', konsol: 'ps5', format: 'PS5 BD Original', bekas: false, nama: 'Cyberpunk 2077 Ultimate Edition', harga: 849000, stamina: 8, ket: 'Termasuk ekspansi Phantom Liberty' }
    ],

    /* kartu kredit bank: aturan Bank Indonesia (bunga maksimal 1,75% sebulan, bayar minimal 5% atau Rp50.000,
       denda keterlambatan 1% dari tagihan maksimal Rp100.000, penghasilan minimum Rp3 juta sebulan) */
    kartuKredit: {
      bungaBulan: 0.0175,
      minPersen: 0.05,
      minRp: 50000,
      dendaPersen: 0.01,
      dendaMaks: 100000,
      syaratGaji: 3000000,
      syaratHari: 30,
      kaliLimit: 2.5,
      limitMin: 6000000,
      limitMaks: 150000000,
      iuranTahunan: 300000,
      cetakTanggal: 1,
      jatuhTempo: 18
    },

    /* PPh final UMKM orang pribadi (PP 20/2026): 0,5% omzet, omzet sampai Rp500 juta setahun bebas, setor paling lambat tanggal 15 */
    pajak: { tarif: 0.005, bebas: 500e6, jatuhTempo: 15, dendaPerBulan: 0.01 /* perkiraan */ },

    /* KUR mikro: plafon sampai Rp100 juta, bunga sekitar 6% setahun untuk peminjam pertama (perkiraan) */
    kur: { bunga: 0.06, plafon: [10e6, 25e6, 50e6, 75e6, 100e6], tenor: [12, 24, 36], syaratHari: 180, hariProses: 3 },
    /* MDR QRIS Bank Indonesia mulai 1 Oktober 2026; usaha mikro = omzet setahun sampai Rp2 miliar */
    mdr: { batasMikro: 2e9, mikro: { gratisSampai: 500000, tarif: 0.003 }, kecil: { gratisSampai: 100000, tarif: 0.007 } },

    /* BBM Pertamina per 19 November 2026; Pertamax dan Turbo bisa berubah tiap tanggal 1 */
    bbm: {
      jawa: { pertalite: 10000, pertamax: 15950, turbo: 19600 },
      sumatera: { pertalite: 10000, pertamax: 16300, turbo: 20000 },
      nama: { pertalite: 'Pertalite', pertamax: 'Pertamax', turbo: 'Pertamax Turbo', listrik: 'Listrik', solar: 'Biosolar' }
    },

    /* motor baru: harga OTR November 2026. km/l dan tangki: perkiraan pemakaian kota. muat = cup di gantungan */
    motor: [
      { id: 'dazz', nama: 'TVS Dazz', harga: 15390000, kml: 50, bbm: 'pertalite', tangki: 5, muat: 4, kelebihan: 'Motor baru termurah' },
      { id: 'revo', nama: 'Honda Revo Fit', harga: 18085000, kml: 60, bbm: 'pertalite', tangki: 4, muat: 4, kelebihan: 'Bebek irit, mudah dipasang box' },
      { id: 'mio', nama: 'Yamaha Mio M3 125', harga: 18905000, kml: 50, bbm: 'pertalite', tangki: 4.2, muat: 4, kelebihan: 'Lincah di gang' },
      { id: 'beat', nama: 'Honda BeAT CBS', harga: 19380000, kml: 60, bbm: 'pertalite', tangki: 4.2, muat: 4, kelebihan: 'Paling irit, gampang dijual lagi' },
      { id: 'gear', nama: 'Yamaha Gear 125', harga: 19495000, kml: 50, bbm: 'pertalite', tangki: 4.2, muat: 6, kelebihan: 'Dek rata, muat banyak cup' },
      { id: 'supra', nama: 'Honda Supra X 125', harga: 21500000, kml: 55, bbm: 'pertalite', tangki: 4, muat: 4, kelebihan: 'Kuat untuk jalan rusak', kuat: true },
      { id: 'scoopy', nama: 'Honda Scoopy Prestige', harga: 23250000, kml: 59, bbm: 'pertalite', tangki: 4.2, muat: 6, kelebihan: 'Desain retro ikonik, irit dan nyaman' },
      { id: 'vario', nama: 'Honda Vario 125', harga: 24810000, kml: 50, bbm: 'pertalite', tangki: 5.5, muat: 6, kelebihan: 'Bagasi besar' },
      { id: 'mxking', nama: 'Yamaha MX King 150', harga: 27325000, kml: 48, bbm: 'pertamax', tangki: 4.2, muat: 4, kelebihan: 'Bebek sport 150 cc bertenaga' },
      { id: 'icon', nama: 'Honda ICON e:', harga: 28000000, kml: 0, bbm: 'listrik', jarakPenuh: 60, kwh: 1.5, muat: 4, kelebihan: 'Ongkos jalan paling murah, jarak tempuh terbatas' },
      { id: 'aerox', nama: 'Yamaha Aerox 155 Connected', harga: 28580000, kml: 43, bbm: 'pertamax', tangki: 5.5, muat: 4, kelebihan: 'Skutik sporty bertenaga, keren dipakai harian' },
      { id: 'vario160', nama: 'Honda Vario 160 ABS', harga: 30450000, kml: 46, bbm: 'pertamax', tangki: 5.5, muat: 6, kelebihan: 'Skutik 160 cc bertenaga, dek rata lega' },
      { id: 'nmax', nama: 'Yamaha NMAX 155', harga: 32175000, kml: 40, bbm: 'pertamax', tangki: 7.1, muat: 6, kelebihan: 'Nyaman jarak jauh, menaikkan gengsi' },
      { id: 'pcx160', nama: 'Honda PCX 160 CBS', harga: 33750000, kml: 45, bbm: 'pertamax', tangki: 8.1, muat: 6, kelebihan: 'Maxi skutik elegan, tangki besar & bagasi 30 L' },
      { id: 'vespa', nama: 'Vespa Primavera 150 i-get', harga: 54100000, kml: 40, bbm: 'pertamax', tangki: 7, muat: 4, kelebihan: 'Skutik retro premium Italia, gengsi tinggi' },
      /* motor sport: harga OTR Jakarta varian termurah (oto.com, November 2026; Yamaha dari Moladin Oktober 2026). km/l dan tangki perkiraan */
      { id: 'satriafu', kelas: 'sport', nama: 'Suzuki Satria F150 (FU)', harga: 29165000, kml: 40, bbm: 'pertamax', tangki: 4, muat: 2, kelebihan: 'Ayam jago DOHC 150 cc legendaris, lincah dan kencang' },
      { id: 'gsxr150', kelas: 'sport', nama: 'Suzuki GSX-R150', harga: 35800000, kml: 40, bbm: 'pertamax', tangki: 11, muat: 2, kelebihan: 'Sport 150 cc termurah' },
      { id: 'cbr150', kelas: 'sport', nama: 'Honda CBR150R', harga: 39730000, kml: 40, bbm: 'pertamax', tangki: 12, muat: 2, kelebihan: 'Sport fairing harian' },
      { id: 'r15', kelas: 'sport', nama: 'Yamaha R15', harga: 42200000, kml: 40, bbm: 'pertamax', tangki: 11, muat: 2, kelebihan: 'Sport 155 cc paling dicari' },
      { id: 'mt25', kelas: 'sport', nama: 'Yamaha MT-25', harga: 66450000, kml: 28, bbm: 'pertamax', tangki: 14, muat: 2, kelebihan: 'Naked 250 cc dua silinder' },
      { id: 'cbr250', kelas: 'sport', nama: 'Honda CBR250RR', harga: 66980000, kml: 28, bbm: 'pertamax', tangki: 14.5, muat: 2, kelebihan: 'Sport 250 cc, gengsi tinggi' },
      { id: 'ninja250', kelas: 'sport', nama: 'Kawasaki Ninja 250', harga: 69800000, kml: 28, bbm: 'pertamax', tangki: 14, muat: 2, kelebihan: 'Sport 250 cc legendaris' },
      { id: 'r25', kelas: 'sport', nama: 'Yamaha R25', harga: 76250000, kml: 28, bbm: 'pertamax', tangki: 14, muat: 2, kelebihan: 'Sport 250 cc' },
      { id: 'zx25r', kelas: 'sport', nama: 'Kawasaki Ninja ZX-25R', harga: 111100000, kml: 22, bbm: 'pertamax', tangki: 15, muat: 2, kelebihan: '250 cc empat silinder, suaranya khas' },
      /* moge: harga Maret 2026 (VIVA) */
      { id: 'zx4rr', kelas: 'moge', nama: 'Kawasaki Ninja ZX-4RR', harga: 248000000, kml: 20, bbm: 'turbo', tangki: 15, muat: 2, kelebihan: '400 cc empat silinder' },
      { id: 'zx6r', kelas: 'moge', nama: 'Kawasaki Ninja ZX-6R KRT', harga: 365500000, kml: 17, bbm: 'turbo', tangki: 17, muat: 2, kelebihan: 'Supersport 636 cc' },
      { id: 'zx10r', kelas: 'moge', nama: 'Kawasaki Ninja ZX-10R KRT', harga: 572200000, kml: 14, bbm: 'turbo', tangki: 17, muat: 2, kelebihan: 'Superbike 1.000 cc' },
      { id: 'cbr1000', kelas: 'moge', nama: 'Honda CBR1000RR-R Fireblade', harga: 828965000, kml: 14, bbm: 'turbo', tangki: 16.1, muat: 2, kelebihan: 'Superbike Honda' },
      { id: 'h2', kelas: 'moge', nama: 'Kawasaki Ninja H2', harga: 890500000, kml: 12, bbm: 'turbo', tangki: 17, muat: 2, kelebihan: 'Mesin supercharger, level sultan' }
    ],
    /* motor bekas: perkiraan pasar; tiap unit punya tahun, kilometer, dan kondisi */
    motorBekas: [
      { id: 'rxking', nama: 'Yamaha RX-King', min: 15e6, maks: 75e6, kml: 27, bbm: 'pertamax', tangki: 10, muat: 4, olisamping: true, kelebihan: 'Gengsi tinggi, harga naik terus, lebih sering mogok', tahun: [1995, 2008] },
      { id: 'beat-bekas', nama: 'Honda BeAT (bekas)', min: 7e6, maks: 12e6, kml: 55, bbm: 'pertalite', tangki: 4, muat: 4, kelebihan: 'Murah, gampang dijual lagi', tahun: [2015, 2022] },
      { id: 'supra-bekas', nama: 'Honda Supra X 125 (bekas)', min: 7e6, maks: 11e6, kml: 50, bbm: 'pertalite', tangki: 4, muat: 4, kelebihan: 'Kuat untuk jalan rusak', kuat: true, tahun: [2012, 2021] },
      /* Yamaha R6 berhenti diproduksi 2020 dan tidak dijual resmi lagi: hanya unit bekas. Harga baru 2021 Rp270 juta (oto.com); harga bekas perkiraan */
      { id: 'r6', nama: 'Yamaha YZF-R6 (bekas)', min: 180e6, maks: 300e6, kml: 16, bbm: 'turbo', tangki: 17, muat: 2, kelebihan: 'Sudah berhenti produksi; jarang ada yang jual', tahun: [2017, 2020], jarang: 0.25 },
      { id: 'cbr250-bekas', nama: 'Honda CBR250RR (bekas)', min: 42e6, maks: 58e6, kml: 28, bbm: 'pertamax', tangki: 14.5, muat: 2, kelebihan: 'Sport 250 cc lebih murah', tahun: [2018, 2024] }
    ],
    /* menjual kendaraan ke pedagang (perkiraan): tahun pertama turun 20%, lalu 8% setahun, dan berkurang menurut kilometer */
    jualKendaraan: { awal: 0.8, perTahun: 0.08, perKm: 0.000002, min: 0.3 },

    /* mobil baru: harga OTR Jabodetabek. Pikap: Moladin Mei 2026; Toyota: Auto2000 via Moladin September 2026.
       km/l, tangki, muatan cup: perkiraan. Mobil diesel memakai Biosolar subsidi */
    mobil: [
      { id: 'granmax', kelas: 'pikap', bentuk: 'pikap', nama: 'Daihatsu Gran Max Pick Up 1.3', harga: 167050000, kml: 11, bbm: 'pertalite', tangki: 43, muat: 400, kelebihan: 'Pikap sejuta umat, angkut pesanan besar dan pindahan' },
      { id: 'carry', kelas: 'pikap', bentuk: 'pikap', nama: 'Suzuki Carry Flat-Deck', harga: 170700000, kml: 11, bbm: 'pertalite', tangki: 46, muat: 400, kelebihan: 'Bak luas, perawatan murah' },
      { id: 'hilux', kelas: 'pikap', bentuk: 'pikap', nama: 'Toyota Hilux Rangga', harga: 194300000, kml: 11, bbm: 'pertalite', tangki: 55, muat: 450, kelebihan: 'Pikap Toyota terbaru' },
      { id: 'l300', kelas: 'pikap', bentuk: 'pikap', nama: 'Mitsubishi L300 Flat Deck', harga: 241600000, kml: 10, bbm: 'solar', tangki: 47, muat: 600, kelebihan: 'Diesel, muatan paling besar' },
      { id: 'calya', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Calya', harga: 173600000, kml: 14, bbm: 'pertalite', tangki: 36, muat: 80, kelebihan: 'Mobil keluarga termurah' },
      { id: 'agya', kelas: 'keluarga', bentuk: 'hatch', nama: 'Toyota Agya', harga: 174300000, kml: 16, bbm: 'pertalite', tangki: 33, muat: 50, kelebihan: 'Kecil dan irit' },
      { id: 'avanza', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Avanza', harga: 244200000, kml: 13, bbm: 'pertalite', tangki: 43, muat: 100, kelebihan: 'MPV paling laku' },
      { id: 'rush', kelas: 'keluarga', bentuk: 'suv', nama: 'Toyota Rush GR Sport', harga: 290100000, kml: 12, bbm: 'pertalite', tangki: 45, muat: 90, kelebihan: 'SUV tinggi, tahan banjir' },
      { id: 'veloz', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Veloz Hybrid', harga: 303000000, kml: 20, bbm: 'pertamax', tangki: 43, muat: 100, kelebihan: 'Hybrid, paling irit' },
      { id: 'zenix', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Kijang Innova Zenix', harga: 437700000, kml: 12, bbm: 'pertamax', tangki: 52, muat: 120, kelebihan: 'MPV besar, nyaman' },
      { id: 'fortuner', kelas: 'mewah', bentuk: 'suv', nama: 'Toyota Fortuner 4×2', harga: 584500000, kml: 11, bbm: 'solar', tangki: 80, muat: 110, kelebihan: 'SUV gagah' },
      { id: 'camry', kelas: 'mewah', bentuk: 'sedan', nama: 'Toyota Camry', harga: 856200000, kml: 14, bbm: 'pertamax', tangki: 50, muat: 60, kelebihan: 'Sedan eksekutif' },
      { id: 'gr86', kelas: 'mewah', bentuk: 'sport', nama: 'Toyota GR 86', harga: 922900000, kml: 11, bbm: 'turbo', tangki: 50, muat: 30, kelebihan: 'Mobil sport dua pintu' },
      { id: 'alphard', kelas: 'sultan', bentuk: 'van', nama: 'Toyota Alphard', harga: 1288000000, kml: 9, bbm: 'pertamax', tangki: 75, muat: 120, kelebihan: 'MPV mewah, level sultan' },
      { id: 'landcruiser', kelas: 'sultan', bentuk: 'suv', nama: 'Toyota Land Cruiser Hybrid', harga: 2716000000, kml: 9, bbm: 'pertamax', tangki: 80, muat: 120, kelebihan: 'SUV paling mahal di dealer Toyota' }
    ],
    /* kredit mobil (perkiraan): bunga flat sekitar 5% setahun + asuransi all risk sekitar 2% setahun */
    kreditMobil: { dp: [0.2, 0.25, 0.3], tenor: [12, 24, 36, 48, 60], bungaFlat: 0.0042, asuransi: 0.0017, dendaHarian: 0.005, tarikSetelahBulan: 3, leasing: 'Leasing mobil' },
    /* perawatan mobil (perkiraan); SWDKLLJ mobil pribadi Rp143.000 setahun */
    rawatMobil: { servisKm: 10000, servis: 1200000, pkb: 0.015, swdkllj: 143000, dendaPajak: 0.02 },
    solar: 6800, /* Biosolar subsidi */

    /* ojek online (sisi pengemudi). Potongan aplikasi 8% mulai 1 Juli 2026 (Perpres 27/2026).
       Zona I (Sumatera, Jawa selain Jabodetabek): tarif awal Rp8.000–10.000, lanjutan Rp2.500/km (Metro TV, Juli 2026).
       Zona II (Jabodetabek): Rp2.600–2.700/km, minimal Rp13.000–13.500 (KP 564/2022). Frekuensi order: setelan */
    /* bisnis mobil: GoCar/GrabCar dalam kota, Travel antarkota (tarif per penumpang), & Jasa Angkutan pikap */
    bisnisMobil: {
      potonganCar: 0.1,
      kaliTarifCar: 2.3,
      kapasitas: { hatch: 4, sedan: 4, sport: 2, mpv: 7, suv: 7, van: 7, pikap: 0 },
      ruteTravel: {
        medan: [
          { id: 'mdn-parapat', tujuan: 'Danau Toba / Parapat', km: 175, ongkos: 200000, jam: 4 },
          { id: 'mdn-pekanbaru', tujuan: 'Pekanbaru', km: 620, ongkos: 450000, jam: 10 },
          { id: 'mdn-jambi', tujuan: 'Kota Jambi', km: 920, ongkos: 600000, jam: 14 }
        ],
        pekanbaru: [
          { id: 'pku-bukittinggi', tujuan: 'Bukittinggi / Padang', km: 220, ongkos: 220000, jam: 5 },
          { id: 'pku-jambi', tujuan: 'Kota Jambi', km: 430, ongkos: 350000, jam: 8 },
          { id: 'pku-medan', tujuan: 'Medan', km: 620, ongkos: 450000, jam: 10 }
        ],
        jambi: [
          { id: 'jmb-palembang', tujuan: 'Palembang', km: 275, ongkos: 250000, jam: 6 },
          { id: 'jmb-pekanbaru', tujuan: 'Pekanbaru', km: 430, ongkos: 350000, jam: 8 },
          { id: 'jmb-medan', tujuan: 'Medan', km: 920, ongkos: 600000, jam: 14 }
        ],
        jakarta: [
          { id: 'jkt-bandung', tujuan: 'Bandung', km: 150, ongkos: 200000, jam: 3.5 },
          { id: 'jkt-semarang', tujuan: 'Semarang', km: 440, ongkos: 380000, jam: 7 },
          { id: 'jkt-lampung', tujuan: 'Bandar Lampung', km: 240, ongkos: 350000, jam: 6 }
        ]
      },
      angkutan: [
        { id: 'ang-kos', nama: 'Pindahan kamar kos / kontrakan', km: 14, bayar: 220000, jam: 1.5 },
        { id: 'ang-pasar', nama: 'Angkut sayur & buah ke pasar induk', km: 24, bayar: 300000, jam: 2 },
        { id: 'ang-material', nama: 'Antar bahan bangunan (semen & besi)', km: 18, bayar: 350000, jam: 2 },
        { id: 'ang-rumah', nama: 'Pindahan rumah satu keluarga', km: 32, bayar: 550000, jam: 3 },
        { id: 'ang-luarkota', nama: 'Ekspedisi barang ke kota tetangga', km: 120, bayar: 950000, jam: 4.5 }
      ]
    },
    ojol: {
      potongan: 0.08,
      zona: { 1: { minimal: 10000, kmMinimal: 4, perKm: 2500 }, 2: { minimal: 13250, kmMinimal: 4, perKm: 2650 } },
      platform: [
        { id: 'gojek', nama: 'Gojek', app: 'Gojek Driver', warna: '#00aa13', layanan: { penumpang: 'GoRide', barang: 'GoSend', makanan: 'GoFood' } },
        { id: 'grab', nama: 'Grab', app: 'Grab Driver', warna: '#00b14f', layanan: { penumpang: 'GrabBike', barang: 'GrabExpress', makanan: 'GrabFood' } }
      ],
      verifikasiHari: 3, tunai: 0.3
    },

    /* properti. Rumah subsidi FLPP: harga maksimal Rp166 juta (Jawa dan Sumatera) dan Rp185 juta (Jabodetabek), DP mulai 1%, bunga 5% tetap,
       tenor sampai 20 tahun, penghasilan lajang maksimal Rp12 juta (haibunda, Juli 2026). KPR komersial BTN: DP 10%, bunga tetap 4,17–4,99%
       lalu floating sekitar 11–13% (industry.co.id, Juli 2026). Harga rumah komersial dan tanah: perkiraan dari iklan Rumah123 */
    properti: {
      subsidi: { dp: 0.01, bunga: 0.05, tenor: [10, 15, 20], batasGaji: 12e6, biayaAkad: 3000000 },
      komersial: { dp: [0.1, 0.2, 0.3], bungaFix: 0.0499, tahunFix: 3, bungaFloating: 0.115, tenor: [10, 15, 20], provisi: 0.01, notaris: 0.015 },
      bphtb: 0.05, npoptkp: 60e6, npoptkpJakarta: 80e6, pphJual: 0.025, kenaikanTanah: 0.06,
      dbr: 0.4, syaratHari: 365, akadHari: 14, sitaSetelahBulan: 6, jasaPindahan: 350000,
      kota: {
        medan: { subsidi: 166e6, komersial: 550e6, mewah: 3000e6, tanahM2: 1200000, jarak: { subsidi: 14, komersial: 7, mewah: 5 } },
        pekanbaru: { subsidi: 166e6, komersial: 450e6, mewah: 2500e6, tanahM2: 900000, jarak: { subsidi: 13, komersial: 6, mewah: 4 } },
        jambi: { subsidi: 166e6, komersial: 400e6, mewah: 2200e6, tanahM2: 700000, jarak: { subsidi: 12, komersial: 6, mewah: 4 } },
        jakarta: { subsidi: 185e6, komersial: 1200e6, mewah: 8000e6, tanahM2: 10000000, jarak: { subsidi: 35, komersial: 12, mewah: 6 } }
      },
      tipe: {
        subsidi: { nama: 'Rumah subsidi tipe 36', luas: '36/72 m²', ket: 'Pinggir kota, jauh dari kedai. Hanya untuk rumah pertama' },
        komersial: { nama: 'Rumah tipe 45', luas: '45/120 m²', ket: 'Perumahan dalam kota' },
        mewah: { nama: 'Rumah mewah tipe 200', luas: '200/350 m²', ket: 'Kawasan elite, level sultan' }
      },
      kavling: [100, 150, 300]
    },
    /* kredit motor (perkiraan): bunga flat sekitar 1,8% sebulan + asuransi 0,2% dari harga sebulan */
    kreditMotor: { dp: [0.1, 0.15, 0.2], tenor: [11, 17, 23, 29, 35], bungaFlat: 0.018, asuransi: 0.002, dendaHarian: 0.005, tarikSetelahBulan: 3, leasing: 'Leasing motor' },
    /* perawatan (perkiraan) */
    rawat: { oliKm: 2000, oli: 50000, servisKm: 4000, servis: 100000, pkb: 0.012, swdkllj: 35000, dendaPajak: 0.02, tarifListrik: 1445 },
    aksesoris: [
      { id: 'tas', nama: 'Tas cup berinsulasi', harga: 85000, muat: 12, ket: 'Muat 12 cup, es tahan lebih lama' },
      { id: 'box', nama: 'Box belakang', harga: 275000, muat: 20, ket: 'Muat 20 cup, cup jarang tumpah' },
      { id: 'tatakan', nama: 'Tatakan cup', harga: 35000, ket: 'Mengurangi cup tumpah' }
    ],

    /* antar pakai kurir aplikasi (perkiraan tarif) dan platform pesan-antar (komisi sekitar 20%, perkiraan) */
    kurir: { nama: 'GoSend', dasar: 10000, dasarKm: 3, perKm: 2500 },
    ojek: { pasar: 20000 },
    platform: [
      { id: 'gofood', nama: 'GoFood', app: 'GoBiz', warna: '#00aa13', komisi: 0.2 },
      { id: 'grabfood', nama: 'GrabFood', app: 'GrabMerchant', warna: '#00b14f', komisi: 0.2 },
      { id: 'shopeefood', nama: 'ShopeeFood', app: 'ShopeeFood Merchant', warna: '#ee4d2d', komisi: 0.2 }
    ],
    namaOrang: ['Budi', 'Siti', 'Rina', 'Andi', 'Dewi', 'Fajar', 'Putri', 'Rizky', 'Nadia', 'Yoga', 'Intan', 'Bayu', 'Lestari', 'Hendra', 'Maya', 'Tono', 'Sari', 'Dimas', 'Wulan', 'Agus', 'Ucok', 'Butet', 'Rudi', 'Fitri'],
    kantor: ['Kantor notaris', 'Kantor kelurahan', 'Bengkel resmi', 'Kantor asuransi', 'Panitia arisan RT', 'Kantor cabang bank', 'Klinik pratama', 'Sekolah swasta']
  };
})(typeof window !== 'undefined' ? window : this);
