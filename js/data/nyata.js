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
      /* Katalog Tokopedia (Elektronik rumah tangga, Perabot besar, Hiburan TV & PS, Peralatan rumah) */
      { id: 'kipas', toko: 'tokopedia', kat: 'elektronik', nama: 'Kipas angin berdiri 16 inci', merek: 'Miyako', harga: 250000, watt: 0.04, ket: 'Tidur sedikit lebih nyenyak kalau AC mati' },
      { id: 'kulkas', toko: 'tokopedia', kat: 'dapur', nama: 'Kulkas 1 pintu Shine Series', merek: 'Sharp', harga: 1800000, watt: 0.05, ket: 'Simpan minuman dingin, minum lebih murah' },
      { id: 'dispenser', toko: 'tokopedia', kat: 'dapur', nama: 'Dispenser galon bawah + galon', merek: 'Miyako', harga: 300000, watt: 0, ket: 'Minum di kos hampir gratis' },
      { id: 'tv', toko: 'tokopedia', kat: 'hiburan', nama: 'Google TV LED 32 inci HD', merek: 'Xiaomi', harga: 2000000, watt: 0.06, ket: 'Istirahat sambil nonton, stamina pulih lebih cepat' },
      { id: 'ps5', toko: 'tokopedia', kat: 'hiburan', nama: 'PS5 Slim Digital Edition', merek: 'Sony', harga: 9999000, watt: 0.2, butuh: 'tv', ket: 'Main game di kos. Butuh TV' },
      { id: 'ps5disc', toko: 'tokopedia', kat: 'hiburan', nama: 'PS5 Slim Disc Edition', merek: 'Sony', harga: 11399000, watt: 0.2, butuh: 'tv', ket: 'Bisa pakai kaset Blu-ray. Butuh TV' },
      { id: 'kaset', toko: 'tokopedia', kat: 'hiburan', nama: 'Kaset game PS5 Original', merek: 'Sony', harga: 1029000, watt: 0, butuh: 'ps5disc', banyak: true, ket: 'Game baru, main lebih seru' },
      { id: 'airpurifier', toko: 'tokopedia', kat: 'elektronik', nama: 'Air Purifier Plasmacluster', merek: 'Sharp', harga: 1650000, watt: 0.03, ket: 'Udara kamar bersih & segar, tidur makin sehat' },
      { id: 'microwave', toko: 'tokopedia', kat: 'dapur', nama: 'Microwave Oven Low Watt 20L', merek: 'Panasonic', harga: 1450000, watt: 0.02, ket: 'Hangatkan makanan cepat di kamar' },
      { id: 'polygon', toko: 'tokopedia', kat: 'hiburan', nama: 'Sepeda Lipat Urbano 3', merek: 'Polygon', harga: 4800000, watt: 0, sewaHarian: 55000, ket: 'Olahraga pagi & bisa disewakan harian' },
      /* khusus rumah di Tokopedia */
      { id: 'ac', toko: 'tokopedia', kat: 'elektronik', nama: 'AC 1/2 PK Low Watt + pasang', merek: 'Panasonic', harga: 3700000, watt: 0, rumah: true, ket: 'Rumah tidak ada AC bawaan. Tidur lebih nyenyak' },
      { id: 'springbed', toko: 'tokopedia', kat: 'perabot', nama: 'Spring bed Pocket 160×200', merek: 'King Koil / Lokal', harga: 3500000, watt: 0, rumah: true, ket: 'Tidur memulihkan stamina lebih banyak' },
      { id: 'sofa', toko: 'tokopedia', kat: 'perabot', nama: 'Sofa L-Shape 3 dudukan', merek: 'Informa', harga: 3000000, watt: 0, rumah: true, ket: 'Istirahat di rumah lebih cepat pulih' },
      { id: 'mejamakan', toko: 'tokopedia', kat: 'perabot', nama: 'Set meja makan kayu 4 kursi', merek: 'Informa', harga: 2200000, watt: 0, rumah: true, ket: 'Makan di rumah lebih kenyang' },
      { id: 'mesincuci', toko: 'tokopedia', kat: 'elektronik', nama: 'Mesin cuci 2 tabung 8 kg', merek: 'Sharp', harga: 1900000, watt: 0, rumah: true, ket: 'Cuci baju sendiri di rumah' },
      { id: 'kulkas2', toko: 'tokopedia', kat: 'dapur', nama: 'Kulkas 2 pintu Twin Cooling', merek: 'Samsung', harga: 4500000, watt: 0, rumah: true, ket: 'Stok minuman dingin lebih banyak' },
      { id: 'tv55', toko: 'tokopedia', kat: 'hiburan', nama: 'Smart TV 55 inci Crystal 4K', merek: 'Samsung', harga: 7000000, watt: 0, rumah: true, ket: 'Main PS dan nonton lebih puas' },
      { id: 'waterheater', toko: 'tokopedia', kat: 'elektronik', nama: 'Water Heater Listrik 15L', merek: 'Ariston', harga: 2100000, watt: 0.04, rumah: true, ket: 'Mandi air hangat di rumah, badan segar' },
      { id: 'hometheater', toko: 'tokopedia', kat: 'hiburan', nama: 'Home Theater Soundbar 5.1ch', merek: 'Sony', harga: 4200000, watt: 0.05, rumah: true, butuh: 'tv', ket: 'Suara bioskop di ruang keluarga' },
      { id: 'kursipijat', toko: 'tokopedia', kat: 'perabot', nama: 'Kursi Pijat Elektrik Smart', merek: 'Ogawa', harga: 14500000, watt: 0.06, rumah: true, ket: 'Pijat seluruh badan di rumah, stamina cepat pulih' },
      { id: 'lemari3pintu', toko: 'tokopedia', kat: 'perabot', nama: 'Lemari Pakaian 3 Pintu Cermin', merek: 'Olympic', harga: 1850000, watt: 0, ket: 'Lemari baju rapi & luas untuk kos/rumah' },
      { id: 'mejakerja', toko: 'tokopedia', kat: 'perabot', nama: 'Meja Kerja & Belajar Kayu Solid', merek: 'Informa', harga: 1150000, watt: 0, ket: 'Meja kerja ergonomis untuk laptop & pembukuan' },
      { id: 'rakbuku', toko: 'tokopedia', kat: 'perabot', nama: 'Rak Buku & Pajangan 5 Susun', merek: 'IKEA / Informa', harga: 799000, watt: 0, ket: 'Susun koleksi kaset PS & buku bisnis rapi' },
      { id: 'sofabed', toko: 'tokopedia', kat: 'perabot', nama: 'Sofa Bed Lipat Multifungsi', merek: 'Informa', harga: 2350000, watt: 0, ket: 'Bisa jadi sofa santai sekaligus kasur tamu' },
      { id: 'cctvwifi', toko: 'tokopedia', kat: 'elektronik', nama: 'Smart Camera CCTV WiFi 360° 2K', merek: 'Xiaomi', harga: 549000, watt: 0.01, ket: 'Pantau keamanan kamar/rumah dari layar HP' },
      { id: 'smartlock', toko: 'tokopedia', kat: 'elektronik', nama: 'Smart Door Lock Fingerprint & PIN', merek: 'Bardi / Dekkson', harga: 2250000, watt: 0, rumah: true, ket: 'Kunci pintu rumah pintar sidik jari & kartu' },
      { id: 'dehumidifier', toko: 'tokopedia', kat: 'elektronik', nama: 'Dehumidifier Penyerap Lembap 12L', merek: 'Krisbow', harga: 1950000, watt: 0.04, ket: 'Cegah kamar lembap & jamur saat musim hujan' },
      { id: 'ovenlistrik', toko: 'tokopedia', kat: 'dapur', nama: 'Oven Listrik Low Watt 25 Liter', merek: 'Kirin / Mito', harga: 980000, watt: 0.03, ket: 'Panggang roti & kue hangat di rumah' },
      { id: 'treadmill', toko: 'tokopedia', kat: 'hiburan', nama: 'Treadmill Elektrik Lipat Smart', merek: 'Kingsmith', harga: 5400000, watt: 0.05, rumah: true, ket: 'Olahraga lari di dalam rumah, kebugaran terjaga' },
      { id: 'gensetmini', toko: 'tokopedia', kat: 'elektronik', nama: 'Power Station Portable 1000W', merek: 'EcoFlow', harga: 7800000, watt: 0, sewaHarian: 120000, ket: 'Cadangan daya darurat & bisa disewakan harian' },

      /* Katalog Shopee (Dapur modern, Perabot kos estetik, Kreator Konten, Audio & Gaya hidup) */
      { id: 'ricecooker', toko: 'shopee', kat: 'dapur', nama: 'Rice cooker digital HD4515', merek: 'Philips', harga: 350000, watt: 0, ket: 'Masak sendiri di kos/rumah, makan lebih murah' },
      { id: 'karpet', toko: 'shopee', kat: 'perabot', nama: 'Karpet bulu lembut & beanbag', merek: 'Informa / Lokal', harga: 150000, watt: 0, ket: 'Kamar lebih nyaman buat rebahan' },
      { id: 'kompor', toko: 'shopee', kat: 'dapur', nama: 'Kompor gas 2 tungku + tabung 3 kg', merek: 'Rinnai', harga: 650000, watt: 0, rumah: true, ket: 'Masak lengkap sendiri di rumah' },
      { id: 'airfryer', toko: 'shopee', kat: 'dapur', nama: 'Digital Air Fryer Low Watt 4.1L', merek: 'Philips', harga: 1150000, watt: 0.02, ket: 'Goreng tanpa minyak, praktis di kamar' },
      { id: 'blender', toko: 'shopee', kat: 'dapur', nama: 'Blender & Juicer 3-in-1', merek: 'Miyako', harga: 320000, watt: 0, ket: 'Bikin jus segar di kos/rumah' },
      { id: 'mesinkopirumah', toko: 'shopee', kat: 'dapur', nama: 'Mesin Kopi Kapsul Dolce Gusto', merek: 'Nescafé / Krups', harga: 1350000, watt: 0.02, ket: 'Seduh kopi kapsul pagi hari di kamar' },
      { id: 'robotvacuum', toko: 'shopee', kat: 'elektronik', nama: 'Robot Vacuum Mop 2 Lite', merek: 'Xiaomi', harga: 2850000, watt: 0.03, ket: 'Sapu & pel lantai kamar otomatis' },
      { id: 'ringlight', toko: 'shopee', kat: 'gadget', nama: 'Ring Light LED 18" + Tripod Pro', merek: 'Brica / Takara', harga: 350000, watt: 0.01, bonusKamera: 0.15, ket: 'Konten TikTok & IG kedai tampak terang (+15% jangkauan)' },
      { id: 'speakerjbl', toko: 'shopee', kat: 'hiburan', nama: 'Speaker Bluetooth Flip 6 Waterproof', merek: 'JBL', harga: 1850000, watt: 0, ket: 'Dengar musik bass mantap saat istirahat' },
      { id: 'kursigaming', toko: 'shopee', kat: 'perabot', nama: 'Kursi Gaming Ergonomis Reclining', merek: 'Fantech / Rexus', harga: 2400000, watt: 0, ket: 'Main game & santai makin nyaman tanpa pegal' },
      { id: 'smartwatch', toko: 'shopee', kat: 'gadget', nama: 'Watch Fit 3 AMOLED NFC', merek: 'Huawei', harga: 1799000, watt: 0, ket: 'Pantau kebugaran & notifikasi order lebih sigap' },
      { id: 'osmoaction', toko: 'shopee', kat: 'gadget', nama: 'Kamera Vlog Osmo Action 4 4K', merek: 'DJI', harga: 5399000, watt: 0, bonusKamera: 0.35, sewaHarian: 95000, ket: 'Kamera vlog 4K stabil (+35% sosmed) & bisa disewakan' },
      { id: 'proyektor', toko: 'shopee', kat: 'hiburan', nama: 'Smart Proyektor Mini Full HD Android', merek: 'Wanbo / Xiaomi', harga: 1650000, watt: 0.04, sewaHarian: 65000, ket: 'Nonton layar lebar di dinding kamar & bisa disewakan' },
      { id: 'slowjuicer', toko: 'shopee', kat: 'dapur', nama: 'Slow Juicer Cold Press 150W', merek: 'Hurom / Ecohome', harga: 1550000, watt: 0.02, ket: 'Peras jus buah murni bernutrisi tinggi' },
      { id: 'ketelkopi', toko: 'shopee', kat: 'dapur', nama: 'Teko Listrik Leher Angsa Gooseneck', merek: 'Brewista / Oxone', harga: 480000, watt: 0.02, ket: 'Seduh manual brew V60 presisi di rumah' },
      { id: 'panciset', toko: 'shopee', kat: 'dapur', nama: 'Set Panci & Wajan Granit Anti Lengket', merek: 'Stein Cookware', harga: 1290000, watt: 0, ket: 'Masak di dapur makin cepat & sehat' },
      { id: 'mejarias', toko: 'shopee', kat: 'perabot', nama: 'Meja Rias Minimalis Lampu LED', merek: 'Informa / Pira', harga: 1450000, watt: 0.01, ket: 'Meja rias estetik, pasangan makin bahagia' },
      { id: 'cerminled', toko: 'shopee', kat: 'perabot', nama: 'Cermin Standing Full Body LED Touch', merek: 'Dekoruma', harga: 690000, watt: 0.01, ket: 'Cermin kamar estetik untuk foto OOTD' },
      { id: 'vakumkasur', toko: 'shopee', kat: 'elektronik', nama: 'Vacuum Cleaner UV Anti Tungau Kasur', merek: 'Kurumi / Deerma', harga: 780000, watt: 0.02, ket: 'Kasur bersih bebas debu & tungau' },
      { id: 'micwireless', toko: 'shopee', kat: 'gadget', nama: 'Microphone Wireless Clip-On Dual', merek: 'Saramonic / Boya', harga: 1250000, watt: 0, bonusKamera: 0.12, ket: 'Suara video promosi kedai jernih (+12% sosmed)' },
      { id: 'lampugantung', toko: 'shopee', kat: 'perabot', nama: 'Lampu Gantung Hias Minimalis Warm', merek: 'Krisbow / Philips', harga: 520000, watt: 0.01, rumah: true, ket: 'Ruang tamu rumah tampak hangat & mewah' }
    ],

    /* pulsa seluler, paket kuota internet (GB), dan langganan WiFi kos/rumah */
    paketData: {
      pulsa: [5000, 10000, 20000, 25000, 50000, 100000],
      kuota: [
        { id: 'k5', gb: 5, harga: 25000, nama: 'Kuota 5 GB (Harian/Mingguan)' },
        { id: 'k15', gb: 15, harga: 55000, nama: 'Kuota 15 GB (Combo Sakti)' },
        { id: 'k35', gb: 35, harga: 100000, nama: 'Kuota 35 GB (Freedom Internet)' },
        { id: 'k75', gb: 75, harga: 165000, nama: 'Kuota 75 GB (Unlimited FUP)' }
      ],
      wifiRumah: { nama: 'WiFi IndiHome / Biznet Fiber 50 Mbps', pasang: 150000, hargaBulan: 285000 }
    },

    /* katalog gadget asli: HP (Apple, Samsung, Xiaomi, OPPO, Realme, Infinix, Vivo, OnePlus), Tablet, & Laptop sesuai tahun rilis asli, baterai mAh, charger Watt (5W, 10W, 15W, 25W, 33W, 45W, 66W, 80W, 90W, 100W, 120W, 240W), RAM/Storage, dan harga pasar */
    daftarGadget: [
      /* HP 2023–2024 mencakup semua daya charger asli: 5W, 10W, 15W, 25W, 33W, 45W, 66W, 80W, 90W, 100W, 120W, 240W */
      { id: 'iphone11', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 11 64GB (Charger 5W)', ram: 4, storage: 64, mah: 3110, watt: 5, kamera: 1.35, harga: 6249000, ket: 'A13 Bionic · Liquid Retina 6,1" · Adaptor bawaan 5W original' },
      { id: 'redmi12c', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Xiaomi Redmi 12C (Charger 10W)', ram: 4, storage: 64, mah: 5000, watt: 10, kamera: 1.0, harga: 1399000, ket: 'Helio G85 · Layar 6,71" · Kamera 50 MP · Charger 10W bawaan' },
      { id: 'galaxya05', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy A05 (Charger 15W)', ram: 4, storage: 128, mah: 5000, watt: 15, kamera: 1.08, harga: 1599000, ket: 'Helio G85 · Kamera 50 MP · Adaptive Fast Charging 15W' },
      { id: 'infinix30', jenis: 'hp', tahun: 2023, merek: 'Infinix', nama: 'Infinix Note 30 (Charger 45W)', ram: 8, storage: 256, mah: 5000, watt: 45, kamera: 1.15, harga: 2199000, ket: 'Helio G99 · 120Hz · All-Round FastCharge 45W · Speaker JBL' },
      { id: 'realmec55', jenis: 'hp', tahun: 2023, merek: 'Realme', nama: 'Realme C55 NFC (Charger 33W)', ram: 6, storage: 128, mah: 5000, watt: 33, kamera: 1.15, harga: 2299000, ket: 'Mini Capsule · Kamera 64 MP · SuperVOOC 33W' },
      { id: 'redminote12p', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Redmi Note 12 Pro 5G (Charger 67W)', ram: 8, storage: 256, mah: 5000, watt: 67, kamera: 1.3, harga: 4399000, ket: 'Sony IMX766 OIS · P-OLED 120Hz · Turbo Charge 67W' },
      { id: 'vivov27', jenis: 'hp', tahun: 2023, merek: 'Vivo', nama: 'Vivo V27 5G Aura Light (Charger 66W)', ram: 8, storage: 256, mah: 4600, watt: 66, kamera: 1.38, harga: 5499000, ket: 'Dimensity 7200 · Aura Light Portrait · FlashCharge 66W' },
      { id: 'opporeno10', jenis: 'hp', tahun: 2023, merek: 'OPPO', nama: 'OPPO Reno10 5G (Charger 67W)', ram: 8, storage: 256, mah: 5000, watt: 67, kamera: 1.35, harga: 5999000, ket: 'Telephoto Portrait 32 MP · 3D Curved AMOLED · SuperVOOC 67W' },
      { id: 'galaxya54', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy A54 5G (Charger 25W)', ram: 8, storage: 256, mah: 5000, watt: 25, kamera: 1.4, harga: 5999000, ket: 'Super AMOLED 120Hz · IP67 · Super Fast Charging 25W' },
      { id: 'realmegt3', jenis: 'hp', tahun: 2023, merek: 'Realme', nama: 'Realme GT3 1TB (Charger 240W)', ram: 16, storage: 1024, mah: 4600, watt: 240, kamera: 1.55, harga: 9499000, ket: 'Snapdragon 8+ Gen 1 · Pulse Interface · SuperVOOC 240W (penuh 9,5 menit!)' },
      { id: 'iphone15', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 15 (Charger 20W)', ram: 6, storage: 128, mah: 3349, watt: 20, kamera: 1.65, harga: 13999000, ket: 'A16 Bionic · Dynamic Island · Kamera Utama 48 MP · USB-C 20W' },
      { id: 's23ultra', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy S23 Ultra 5G (Charger 45W)', ram: 12, storage: 256, mah: 5000, watt: 45, kamera: 1.8, harga: 19999000, ket: 'Snapdragon 8 Gen 2 · Kamera 200 MP Space Zoom · Fast Charging 45W' },
      { id: 'iphone15pm', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'iPhone 15 Pro Max (Charger 27W)', ram: 8, storage: 256, mah: 4422, watt: 27, kamera: 1.9, harga: 24999000, ket: 'Titanium · A17 Pro · 5× Tetraprism Zoom · USB-C PD 27W' },
      { id: 'iphone12', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 12 64GB (Charger 20W)', ram: 4, storage: 64, mah: 2815, watt: 20, kamera: 1.45, harga: 8999000, ket: 'A14 Bionic · Super Retina XDR 6,1" · Kamera ganda 12 MP' },
      { id: 'iphone13', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 13 128GB (Charger 20W)', ram: 4, storage: 128, mah: 3240, watt: 20, kamera: 1.55, harga: 11999000, ket: 'A15 Bionic · Mode Sinema · Baterai lebih awet' },
      { id: 'iphone14', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 14 128GB (Charger 20W)', ram: 6, storage: 128, mah: 3279, watt: 20, kamera: 1.6, harga: 12999000, ket: 'A15 Bionic GPU 5-core · Deteksi Tabrakan · Kamera 12 MP' },
      { id: 'galaxya14', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy A14 4G (Charger 15W)', ram: 4, storage: 64, mah: 5000, watt: 15, kamera: 1.0, harga: 2199000, ket: 'Helio G80 · Layar 90Hz 6,6" · Baterai 5000 mAh' },
      { id: 'galaxya34', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy A34 5G (Charger 25W)', ram: 8, storage: 128, mah: 5000, watt: 25, kamera: 1.3, harga: 4999000, ket: 'Dimensity 1080 · Super AMOLED 120Hz · IP67' },
      { id: 'galaxys23', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy S23 5G (Charger 25W)', ram: 8, storage: 256, mah: 3900, watt: 25, kamera: 1.7, harga: 12999000, ket: 'Snapdragon 8 Gen 2 · Kamera 50 MP · Layar 120Hz' },
      { id: 'galaxyzflip5', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy Z Flip5 5G (Charger 25W)', ram: 8, storage: 256, mah: 3700, watt: 25, kamera: 1.6, harga: 17999000, ket: 'Layar lipat · Flex Window 3,4" · Snapdragon 8 Gen 2' },
      { id: 'redmi12', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Xiaomi Redmi 12 (Charger 18W)', ram: 4, storage: 128, mah: 5000, watt: 18, kamera: 1.05, harga: 1949000, ket: 'Helio G88 · Kamera 50 MP · Layar 90Hz' },
      { id: 'pocox5pro', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Xiaomi POCO X5 Pro 5G (Charger 67W)', ram: 6, storage: 128, mah: 5000, watt: 67, kamera: 1.3, harga: 3999000, ket: 'Snapdragon 778G · AMOLED 120Hz · Kamera 108 MP' },
      { id: 'oppoa58', jenis: 'hp', tahun: 2023, merek: 'OPPO', nama: 'OPPO A58 (Charger 33W)', ram: 6, storage: 128, mah: 5000, watt: 33, kamera: 1.1, harga: 2499000, ket: 'Helio G85 · Layar 90Hz · SUPERVOOC 33W' },
      { id: 'oppoa78', jenis: 'hp', tahun: 2023, merek: 'OPPO', nama: 'OPPO A78 (Charger 33W)', ram: 8, storage: 128, mah: 5000, watt: 33, kamera: 1.15, harga: 3499000, ket: 'Snapdragon 680 · AMOLED 90Hz · Kamera 50 MP' },
      { id: 'realmec53', jenis: 'hp', tahun: 2023, merek: 'Realme', nama: 'Realme C53 (Charger 33W)', ram: 6, storage: 128, mah: 5000, watt: 33, kamera: 1.1, harga: 1899000, ket: 'Unisoc T612 · Kamera 108 MP · Desain tipis' },
      { id: 'realme11pro', jenis: 'hp', tahun: 2023, merek: 'Realme', nama: 'Realme 11 Pro+ 5G (Charger 100W)', ram: 12, storage: 512, mah: 5000, watt: 100, kamera: 1.6, harga: 6499000, ket: 'Dimensity 7050 · Kamera 200 MP · SUPERVOOC 100W' },
      { id: 'infinixhot30', jenis: 'hp', tahun: 2023, merek: 'Infinix', nama: 'Infinix Hot 30 (Charger 18W)', ram: 8, storage: 128, mah: 5000, watt: 18, kamera: 1.0, harga: 1749000, ket: 'Helio G88 · Layar 90Hz 6,78" · Baterai 5000 mAh' },
      { id: 'infinixsmart8', jenis: 'hp', tahun: 2023, merek: 'Infinix', nama: 'Infinix Smart 8 (Charger 10W)', ram: 4, storage: 64, mah: 5000, watt: 10, kamera: 0.95, harga: 1299000, ket: 'Helio G36 · Kamera 13 MP · Dynamic Bar' },
      { id: 'infinixzero30', jenis: 'hp', tahun: 2023, merek: 'Infinix', nama: 'Infinix Zero 30 5G (Charger 68W)', ram: 12, storage: 256, mah: 5000, watt: 68, kamera: 1.45, harga: 4299000, ket: 'Dimensity 8020 · Kamera depan 50 MP 4K · Layar 144Hz' },
      { id: 'vivoy17s', jenis: 'hp', tahun: 2023, merek: 'Vivo', nama: 'Vivo Y17s (Charger 15W)', ram: 4, storage: 64, mah: 5000, watt: 15, kamera: 1.0, harga: 1799000, ket: 'Helio G85 · Kamera 50 MP · Baterai 5000 mAh' },
      { id: 'vivoy27', jenis: 'hp', tahun: 2023, merek: 'Vivo', nama: 'Vivo Y27 (Charger 44W)', ram: 8, storage: 128, mah: 5000, watt: 44, kamera: 1.15, harga: 2999000, ket: 'Helio G85 · Kamera 50 MP · FlashCharge 44W' },
      { id: 'vivov29', jenis: 'hp', tahun: 2023, merek: 'Vivo', nama: 'Vivo V29 5G (Charger 80W)', ram: 12, storage: 256, mah: 4600, watt: 80, kamera: 1.55, harga: 5999000, ket: 'Snapdragon 778G · Aura Light · Kamera Sony 50 MP OIS' },
      /* HP 2024+ */
      { id: 'infinixgt20', jenis: 'hp', tahun: 2024, merek: 'Infinix', nama: 'Infinix GT 20 Pro 5G (Charger 45W)', ram: 12, storage: 256, mah: 5000, watt: 45, kamera: 1.35, harga: 4399000, ket: 'Dimensity 8200 Ultimate · Layar 144Hz AMOLED · FastCharge 45W' },
      { id: 'realme13p', jenis: 'hp', tahun: 2024, merek: 'Realme', nama: 'Realme 13 Pro+ 5G (Charger 80W)', ram: 12, storage: 512, mah: 5200, watt: 80, kamera: 1.55, harga: 6499000, ket: 'Dual Sony Periscope OIS · SuperVOOC 80W · Desain Monet' },
      { id: 'realmegt6', jenis: 'hp', tahun: 2024, merek: 'Realme', nama: 'Realme GT 6 5G (Charger 100W)', ram: 12, storage: 256, mah: 5500, watt: 100, kamera: 1.65, harga: 7999000, ket: 'Snapdragon 8s Gen 3 · Layar 6000 nits · SuperVOOC 100W' },
      { id: 'xiaomi14tp', jenis: 'hp', tahun: 2024, merek: 'Xiaomi', nama: 'Xiaomi 14T Pro Leica (Charger 120W)', ram: 12, storage: 512, mah: 5000, watt: 120, kamera: 1.75, harga: 8499000, ket: 'Lensa Leica Summilux · Dimensity 9300+ · HyperCharge 120W' },
      { id: 'xiaomi14', jenis: 'hp', tahun: 2024, merek: 'Xiaomi', nama: 'Xiaomi 14 Compact Leica (Charger 90W)', ram: 12, storage: 256, mah: 4610, watt: 90, kamera: 1.82, harga: 11999000, ket: 'Snapdragon 8 Gen 3 · Leica Optics · HyperCharge 90W' },
      { id: 'oppofindx8', jenis: 'hp', tahun: 2024, merek: 'OPPO', nama: 'OPPO Find X8 Hasselblad (Charger 80W)', ram: 12, storage: 256, mah: 5630, watt: 80, kamera: 1.85, harga: 13999000, ket: 'Kamera Hasselblad · Baterai Silicon-Carbon 5630 mAh · SuperVOOC 80W' },
      { id: 's24ultra', jenis: 'hp', tahun: 2024, merek: 'Samsung', nama: 'Samsung Galaxy S24 Ultra 5G (Charger 45W)', ram: 12, storage: 512, mah: 5000, watt: 45, kamera: 1.95, harga: 21999000, ket: 'Rangka Titanium · Galaxy AI · Snapdragon 8 Gen 3 · 45W' },
      { id: 'iphone16pm', jenis: 'hp', tahun: 2024, merek: 'Apple', nama: 'iPhone 16 Pro Max (Charger 30W)', ram: 8, storage: 256, mah: 4685, watt: 30, kamera: 2.05, harga: 25999000, ket: 'A18 Pro · Camera Control · Layar 6,9" Super Retina XDR · 30W' },
      { id: 'redminote13pp', jenis: 'hp', tahun: 2024, merek: 'Xiaomi', nama: 'Redmi Note 13 Pro+ 5G (Charger 120W)', ram: 8, storage: 256, mah: 5000, watt: 120, kamera: 1.5, harga: 5999000, ket: 'Dimensity 7200 Ultra · Kamera 200 MP · HyperCharge 120W' },
      { id: 'iphone16', jenis: 'hp', tahun: 2024, merek: 'Apple', nama: 'Apple iPhone 16 128GB (Charger 25W)', ram: 8, storage: 128, mah: 3561, watt: 25, kamera: 1.7, harga: 15999000, ket: 'A18 · Camera Control · Apple Intelligence' },
      { id: 'galaxys24', jenis: 'hp', tahun: 2024, merek: 'Samsung', nama: 'Samsung Galaxy S24 5G (Charger 25W)', ram: 8, storage: 256, mah: 4000, watt: 25, kamera: 1.75, harga: 12999000, ket: 'Exynos 2400 · Galaxy AI · Layar 120Hz' },
      { id: 'oppoa3', jenis: 'hp', tahun: 2024, merek: 'OPPO', nama: 'OPPO A3 (Charger 45W)', ram: 8, storage: 256, mah: 5100, watt: 45, kamera: 1.15, harga: 2999000, ket: 'Snapdragon 6s Gen 1 · Layar 90Hz · SUPERVOOC 45W' },
      { id: 'vivov40', jenis: 'hp', tahun: 2024, merek: 'Vivo', nama: 'Vivo V40 5G (Charger 80W)', ram: 12, storage: 256, mah: 5500, watt: 80, kamera: 1.7, harga: 7499000, ket: 'Snapdragon 7 Gen 3 · Kamera ZEISS 50 MP · FlashCharge 80W' },

      /* Tablet */
      { id: 'mipad6', jenis: 'tablet', tahun: 2023, merek: 'Xiaomi', nama: 'Xiaomi Pad 6 11" 144Hz', ram: 8, storage: 256, mah: 8840, watt: 33, kamera: 1.2, harga: 4999000, sewaHarian: 55000, ket: 'Snapdragon 870 · Layar 2.8K 144Hz · Quad Speaker Dolby Atmos' },
      { id: 'tabs9fe', jenis: 'tablet', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy Tab S9 FE', ram: 6, storage: 128, mah: 8000, watt: 45, kamera: 1.25, harga: 6499000, sewaHarian: 70000, ket: 'Termasuk S-Pen IP68 · Layar 10,9" 90Hz · Cocok desain & kasir' },
      { id: 'ipadairm2', jenis: 'tablet', tahun: 2024, merek: 'Apple', nama: 'Apple iPad Air M2 11"', ram: 8, storage: 128, mah: 7606, watt: 20, kamera: 1.45, harga: 11999000, sewaHarian: 115000, ket: 'Chip Apple M2 · Liquid Retina · Edit konten & bisnis super lancar' },

      /* Laptop */
      { id: 'vivobook14', jenis: 'laptop', tahun: 2023, merek: 'ASUS', nama: 'ASUS Vivobook Go 14 Ryzen 3', ram: 8, storage: 256, mah: 11000, watt: 45, kamera: 1.0, harga: 6299000, sewaHarian: 65000, ket: 'AMD Ryzen 3 7320U · RAM 8 GB LPDDR5 · SSD 256 GB · Ringan 1,38 kg' },
      { id: 'ideapad3', jenis: 'laptop', tahun: 2023, merek: 'Lenovo', nama: 'Lenovo IdeaPad Slim 3 Core i5', ram: 8, storage: 512, mah: 12500, watt: 65, kamera: 1.0, harga: 8499000, sewaHarian: 85000, ket: 'Intel Core i5-12450H · SSD 512 GB · Rapid Charge 65W' },
      { id: 'macbookm2', jenis: 'laptop', tahun: 2023, merek: 'Apple', nama: 'MacBook Air M2 13,6"', ram: 8, storage: 256, mah: 14000, watt: 30, kamera: 1.3, harga: 16999000, sewaHarian: 150000, ket: 'Chip Apple M2 · Liquid Retina · Baterai tahan 18 jam · MagSafe 3' },
      { id: 'rogzephyrus', jenis: 'laptop', tahun: 2024, merek: 'ASUS ROG', nama: 'ROG Zephyrus G14 OLED RTX 4060', ram: 16, storage: 1024, mah: 19000, watt: 180, kamera: 1.2, harga: 28999000, sewaHarian: 240000, ket: 'Ryzen 9 8945HS · GeForce RTX 4060 · ROG Nebula OLED 120Hz · 1 TB SSD' }
    ],

    /* aplikasi & game HP yang bisa diinstal (memakai RAM & Storage internal HP) */
    apkHp: [
      { id: 'kasirpro', jenis: 'bisnis', nama: 'BukuWarung & Kasir Pintar Pro', rom: 2, ram: 3, kuotaGb: 0.2, ket: 'Catat arus kas otomatis & mengurangi risiko selisih kas laci' },
      { id: 'canva', jenis: 'kreator', nama: 'Canva Desain & Poster Menu', rom: 3, ram: 4, kuotaGb: 0.4, bonusKamera: 0.15, ket: 'Desain poster promo kedai (+15% jangkauan posting IG & Threads)' },
      { id: 'capcut', jenis: 'kreator', nama: 'CapCut Pro Video Editor 4K', rom: 5, ram: 6, kuotaGb: 0.6, bonusKamera: 0.25, ket: 'Edit video racik kopi sinematik (+25% jangkauan TikTok & IG)' },
      { id: 'mlbb', jenis: 'game', nama: 'Mobile Legends: Bang Bang', rom: 9, ram: 4, kuotaGb: 1.2, stamina: 10, ket: 'Push rank 30 menit di HP (+10 stamina saat istirahat)' },
      { id: 'pubgm', jenis: 'game', nama: 'PUBG Mobile HD Resource', rom: 15, ram: 6, kuotaGb: 1.8, stamina: 13, ket: 'Main battle royale 30 menit (+13 stamina saat istirahat)' },
      { id: 'genshin', jenis: 'game', nama: 'Genshin Impact Full Map', rom: 34, ram: 8, kuotaGb: 3.5, stamina: 17, ket: 'Jelajah open-world grafis rata kanan (+17 stamina saat istirahat)' }
    ],

    /* menjual barang kos/rumah bekas (perkiraan): buka kotak turun ke 75%, lalu turun 12% setahun dan 0,15% tiap pemakaian */
    jualBarang: { awal: 0.75, awalBekas: 0.85, perTahun: 0.12, perPakai: 0.0015, min: 0.2 },

    /* toko game: PS1–PS4 bekas original (harga pasar e-commerce/komunitas retro Indonesia menurut kondisi fisik), PS5 baru resmi Sony Indonesia Oktober 2026 */
    konsolGame: [
      { id: 'ps1', nama: 'PlayStation 1 (PS One) Original', merek: 'Sony', bekas: true, min: 350000, maks: 600000, tahun: [1996, 2003], watt: 0.01, pulih: 12, ket: 'Konsol retro original Sony + stik ori, baca CD game original' },
      { id: 'ps2', nama: 'PlayStation 2 Slim Original', merek: 'Sony', bekas: true, min: 450000, maks: 750000, tahun: [2004, 2012], watt: 0.03, pulih: 14, ket: 'PS2 Slim SCPH-90006 original optik sehat + stik DualShock 2 ori mesin' },
      { id: 'ps3', nama: 'PlayStation 3 Slim OFW Original', merek: 'Sony', bekas: true, min: 1350000, maks: 2100000, tahun: [2010, 2015], watt: 0.09, pulih: 16, ket: 'PS3 Slim Official Firmware (OFW) original untuk kaset Blu-ray asli' },
      { id: 'ps4', nama: 'PlayStation 4 Slim 1TB OFW Original', merek: 'Sony', bekas: true, min: 2600000, maks: 3700000, tahun: [2017, 2022], watt: 0.15, pulih: 18, ket: 'PS4 Slim 1TB OFW original + DualShock 4 ori mesin' },
      { id: 'ps5', nama: 'PS5 Slim Digital Edition', merek: 'Sony', bekas: false, digital: true, tahun: [2023, 2026], harga: 9999000, watt: 0.2, pulih: 20, kelengkapan: 'Unit baru segel resmi + 1× DualSense Ori + kabel HDMI/USB', ket: 'Baru, garansi resmi Sony Indonesia. Main game digital PS Store' },
      { id: 'ps5disc', nama: 'PS5 Slim Disc Edition', merek: 'Sony', bekas: false, tahun: [2023, 2026], harga: 11399000, watt: 0.2, pulih: 20, kelengkapan: 'Unit baru segel resmi + 1× DualSense Ori + kabel HDMI/USB', ket: 'Baru, garansi resmi Sony Indonesia. Bisa kaset Blu-ray PS5 & PS4' }
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
      { id: 'nex2', nama: 'Suzuki Nex II Standard', harga: 19940000, kml: 54, bbm: 'pertalite', tangki: 3.6, muat: 4, kelebihan: 'Skutik ringkas Suzuki, mesin SEP tangguh' },
      { id: 'address', nama: 'Suzuki Address FI', harga: 20600000, kml: 53, bbm: 'pertalite', tangki: 5.2, muat: 6, kelebihan: 'Bagasi 20,6 liter ekstra lega buat belanja' },
      { id: 'genio', nama: 'Honda Genio CBS-ISS', harga: 20150000, kml: 59, bbm: 'pertalite', tangki: 4.2, muat: 4, kelebihan: 'Rangka eSAF ringan, sangat irit di kemacetan' },
      { id: 'fazzio', nama: 'Yamaha Fazzio Hybrid Neo', harga: 23250000, kml: 55, bbm: 'pertalite', tangki: 5.1, muat: 6, kelebihan: 'Blue Core Hybrid, gantungan ganda muat banyak' },
      { id: 'lexi155', nama: 'Yamaha Lexi LX 155', harga: 25900000, kml: 46, bbm: 'pertamax', tangki: 4.2, muat: 6, kelebihan: 'Maxi skutik dek rata 155 cc, muat galon & cup' },
      { id: 'filano', nama: 'Yamaha Grand Filano Hybrid', harga: 27450000, kml: 54, bbm: 'pertamax', tangki: 4.4, muat: 6, kelebihan: 'Skutik classy, isi bensin dari depan tanpa buka jok' },
      { id: 'stylo160', nama: 'Honda Stylo 160 CBS', harga: 28400000, kml: 45, bbm: 'pertamax', tangki: 5, muat: 6, kelebihan: 'Retro modern 160 cc bertenaga & bergaya' },
      { id: 'adv160', nama: 'Honda ADV 160 CBS', harga: 36700000, kml: 45, bbm: 'pertamax', tangki: 8.1, muat: 6, kelebihan: 'Skutik penjelajah tangguh di segala medan jalan', kuat: true },
      { id: 'vespa', nama: 'Vespa Primavera 150 i-get', harga: 54100000, kml: 40, bbm: 'pertamax', tangki: 7, muat: 4, kelebihan: 'Skutik retro premium Italia, gengsi tinggi' },
      { id: 'vespasprint', nama: 'Vespa Sprint 150 i-get ABS', harga: 57100000, kml: 40, bbm: 'pertamax', tangki: 7, muat: 4, kelebihan: 'Lampu heksagonal sporty, favorit anak muda kota' },
      { id: 'xmax250', nama: 'Yamaha XMAX 250 Connected', harga: 67900000, kml: 34, bbm: 'pertamax', tangki: 13, muat: 8, kelebihan: 'Big skutik 250 cc bagasi super luas, nyaman turing' },
      { id: 'forza250', nama: 'Honda Forza 250', harga: 90500000, kml: 33, bbm: 'pertamax', tangki: 11.7, muat: 8, kelebihan: 'Skutik flagship 250 cc elektrik windshield mewah' },
      /* motor sport & trail: harga OTR Jakarta varian termurah */
      { id: 'satriafu', kelas: 'sport', nama: 'Suzuki Satria F150 (FU)', harga: 29165000, kml: 40, bbm: 'pertamax', tangki: 4, muat: 2, kelebihan: 'Ayam jago DOHC 150 cc legendaris, lincah dan kencang' },
      { id: 'cb150r', kelas: 'sport', nama: 'Honda CB150R Streetfire', harga: 31780000, kml: 41, bbm: 'pertamax', tangki: 12, muat: 2, kelebihan: 'Naked sport 150 cc lincah dengan suspensi USD' },
      { id: 'klx150', kelas: 'sport', nama: 'Kawasaki KLX 150 S', harga: 33800000, kml: 38, bbm: 'pertalite', tangki: 6.9, muat: 2, kelebihan: 'Motor trail tangguh libas jalan berlubang & banjir', kuat: true },
      { id: 'w175', kelas: 'sport', nama: 'Kawasaki W175 SE Retro', harga: 35900000, kml: 37, bbm: 'pertalite', tangki: 13.5, muat: 2, kelebihan: 'Motor klasik retro British style ikonik' },
      { id: 'crf150l', kelas: 'sport', nama: 'Honda CRF150L', harga: 37200000, kml: 39, bbm: 'pertalite', tangki: 7.2, muat: 2, kelebihan: 'Motor on/off-road injeksi tangguh segala cuaca', kuat: true },
      { id: 'wr155r', kelas: 'sport', nama: 'Yamaha WR 155 R VVA', harga: 39350000, kml: 38, bbm: 'pertamax', tangki: 8.1, muat: 2, kelebihan: 'Trail 155 cc VVA paling bertenaga di kelasnya', kuat: true },
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
      { id: 'sigra', kelas: 'keluarga', bentuk: 'mpv', nama: 'Daihatsu Sigra 1.2 R', harga: 164000000, kml: 15, bbm: 'pertalite', tangki: 36, muat: 80, kelebihan: 'LCGC 7 penumpang paling terjangkau & irit' },
      { id: 'ayla', kelas: 'keluarga', bentuk: 'hatch', nama: 'Daihatsu All New Ayla 1.2', harga: 162000000, kml: 16, bbm: 'pertalite', tangki: 36, muat: 50, kelebihan: 'City car lincah parkir mudah di jalan sempit' },
      { id: 'agya', kelas: 'keluarga', bentuk: 'hatch', nama: 'Toyota Agya', harga: 174300000, kml: 16, bbm: 'pertalite', tangki: 33, muat: 50, kelebihan: 'Kecil dan irit' },
      { id: 'brio', kelas: 'keluarga', bentuk: 'hatch', nama: 'Honda Brio Satya E CVT', harga: 198300000, kml: 16, bbm: 'pertalite', tangki: 35, muat: 55, kelebihan: 'Hatchback terlaris Indonesia, mesin i-VTEC responsif' },
      { id: 'airev', kelas: 'keluarga', bentuk: 'hatch', nama: 'Wuling Air ev Standard Range', harga: 224000000, kml: 11.5, bbm: 'listrik', tangki: 17.3, muat: 40, kelebihan: 'Mobil listrik mungil bebas ganjil-genap (~200 km/cas)' },
      { id: 'xenia', kelas: 'keluarga', bentuk: 'mpv', nama: 'Daihatsu All New Xenia 1.3', harga: 228000000, kml: 13, bbm: 'pertalite', tangki: 43, muat: 100, kelebihan: 'MPV keluarga tangguh, kabin fleksibel' },
      { id: 'avanza', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Avanza', harga: 244200000, kml: 13, bbm: 'pertalite', tangki: 43, muat: 100, kelebihan: 'MPV paling laku' },
      { id: 'ertiga', kelas: 'keluarga', bentuk: 'mpv', nama: 'Suzuki All New Ertiga Hybrid', harga: 277000000, kml: 16, bbm: 'pertamax', tangki: 45, muat: 100, kelebihan: 'Smart Hybrid Suzuki, suspensi empuk & irit' },
      { id: 'terios', kelas: 'keluarga', bentuk: 'suv', nama: 'Daihatsu Terios R ADS', harga: 282500000, kml: 12, bbm: 'pertalite', tangki: 45, muat: 90, kelebihan: 'SUV 7 penumpang ground clearance tinggi' },
      { id: 'rush', kelas: 'keluarga', bentuk: 'suv', nama: 'Toyota Rush GR Sport', harga: 290100000, kml: 12, bbm: 'pertalite', tangki: 45, muat: 90, kelebihan: 'SUV tinggi, tahan banjir' },
      { id: 'xl7', kelas: 'keluarga', bentuk: 'suv', nama: 'Suzuki XL7 Hybrid Alpha', harga: 299000000, kml: 15, bbm: 'pertamax', tangki: 45, muat: 95, kelebihan: 'SUV keluarga maskulin dengan teknologi Smart Hybrid' },
      { id: 'veloz', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Veloz Hybrid', harga: 303000000, kml: 20, bbm: 'pertamax', tangki: 43, muat: 100, kelebihan: 'Hybrid, paling irit' },
      { id: 'xpander', kelas: 'keluarga', bentuk: 'mpv', nama: 'Mitsubishi Xpander Ultimate', harga: 324500000, kml: 13, bbm: 'pertamax', tangki: 45, muat: 105, kelebihan: 'Kabin senyap & suspensi senyaman sedan' },
      { id: 'stargazer', kelas: 'keluarga', bentuk: 'mpv', nama: 'Hyundai Stargazer Prime Captain Seat', harga: 320900000, kml: 13, bbm: 'pertamax', tangki: 40, muat: 100, kelebihan: 'Desain futuristik dengan fitur keselamatan SmartSense' },
      { id: 'binguoev', kelas: 'keluarga', bentuk: 'hatch', nama: 'Wuling BinguoEV Long Range', harga: 348000000, kml: 10.4, bbm: 'listrik', tangki: 31.9, muat: 65, kelebihan: 'Hatchback listrik retro-modern (~333 km/cas)' },
      { id: 'bydm6', kelas: 'keluarga', bentuk: 'mpv', nama: 'BYD M6 Superior 7-Seater', harga: 383000000, kml: 7.4, bbm: 'listrik', tangki: 71.8, muat: 110, kelebihan: 'MPV listrik 7 penumpang senyap & hemat (~530 km/cas)' },
      { id: 'creta', kelas: 'keluarga', bentuk: 'suv', nama: 'Hyundai Creta Prime IVT', harga: 416000000, kml: 13, bbm: 'pertamax', tangki: 40, muat: 85, kelebihan: 'Panoramic sunroof & Bose sound system' },
      { id: 'hrv', kelas: 'keluarga', bentuk: 'suv', nama: 'Honda HR-V SE CVT Sensing', harga: 424000000, kml: 13, bbm: 'pertamax', tangki: 40, muat: 85, kelebihan: 'SUV kompak paling stylish dengan Honda Sensing' },
      { id: 'zenix', kelas: 'keluarga', bentuk: 'mpv', nama: 'Toyota Kijang Innova Zenix', harga: 437700000, kml: 12, bbm: 'pertamax', tangki: 52, muat: 120, kelebihan: 'MPV besar, nyaman' },
      { id: 'jimny', kelas: 'mewah', bentuk: 'suv', nama: 'Suzuki Jimny 5-Door 4×4', harga: 495000000, kml: 11, bbm: 'pertamax', tangki: 40, muat: 70, kelebihan: 'SUV 4×4 ikonik kolektor, tahan segala medan' },
      { id: 'fortuner', kelas: 'mewah', bentuk: 'suv', nama: 'Toyota Fortuner 4×2', harga: 584500000, kml: 11, bbm: 'solar', tangki: 80, muat: 110, kelebihan: 'SUV gagah' },
      { id: 'pajerosport', kelas: 'mewah', bentuk: 'suv', nama: 'Mitsubishi Pajero Sport Dakar 4×2', harga: 650000000, kml: 11, bbm: 'solar', tangki: 68, muat: 110, kelebihan: 'SUV ladder-frame bertenaga MIVEC Turbo Diesel' },
      { id: 'civicrs', kelas: 'mewah', bentuk: 'sedan', nama: 'Honda Civic RS Turbo', harga: 616800000, kml: 13, bbm: 'pertamax', tangki: 47, muat: 60, kelebihan: 'Sedan sporty VTEC Turbo bergengsi tinggi' },
      { id: 'bydseal', kelas: 'mewah', bentuk: 'sedan', nama: 'BYD Seal Performance AWD', harga: 719000000, kml: 7.0, bbm: 'listrik', tangki: 82.5, muat: 60, kelebihan: 'Sedan sport listrik 0-100 km/jam 3,8 detik (~580 km/cas)' },
      { id: 'crv', kelas: 'mewah', bentuk: 'suv', nama: 'Honda CR-V RS e:HEV Hybrid', harga: 814000000, kml: 18, bbm: 'pertamax', tangki: 57, muat: 105, kelebihan: 'SUV flagship Honda Hybrid mewah & irit' },
      { id: 'ioniq5', kelas: 'mewah', bentuk: 'suv', nama: 'Hyundai IONIQ 5 Signature Long Range', harga: 870000000, kml: 6.2, bbm: 'listrik', tangki: 72.6, muat: 95, kelebihan: 'SUV listrik Parametric Pixel & V2L (~451 km/cas)' },
      { id: 'camry', kelas: 'mewah', bentuk: 'sedan', nama: 'Toyota Camry', harga: 856200000, kml: 14, bbm: 'pertamax', tangki: 50, muat: 60, kelebihan: 'Sedan eksekutif' },
      { id: 'gr86', kelas: 'mewah', bentuk: 'sport', nama: 'Toyota GR 86', harga: 922900000, kml: 11, bbm: 'turbo', tangki: 50, muat: 30, kelebihan: 'Mobil sport dua pintu' },
      { id: 'alphard', kelas: 'sultan', bentuk: 'van', nama: 'Toyota Alphard', harga: 1288000000, kml: 9, bbm: 'pertamax', tangki: 75, muat: 120, kelebihan: 'MPV mewah, level sultan' },
      { id: 'landcruiser', kelas: 'sultan', bentuk: 'suv', nama: 'Toyota Land Cruiser Hybrid', harga: 2716000000, kml: 9, bbm: 'pertamax', tangki: 80, muat: 120, kelebihan: 'SUV paling mahal di dealer Toyota' }
    ],
    /* kredit mobil (perkiraan): bunga flat sekitar 5% setahun + asuransi all risk sekitar 2% setahun */
    kreditMobil: { dp: [0.2, 0.25, 0.3], tenor: [12, 24, 36, 48, 60], bungaFlat: 0.0042, asuransi: 0.0017, dendaHarian: 0.005, tarikSetelahBulan: 3, leasing: 'Leasing mobil' },
    /* perawatan mobil (perkiraan); SWDKLLJ mobil pribadi Rp143.000 setahun; ban 4 roda ±45.000 km */
    rawatMobil: { servisKm: 10000, servis: 1200000, banKm: 45000, banHarga: { pikap: 2800000, keluarga: 4200000, mewah: 7800000, sultan: 12500000 }, pkb: 0.015, swdkllj: 143000, dendaPajak: 0.02 },
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
        subsidi: { nama: 'Rumah subsidi tipe 36', luas: '36/72 m²', ket: 'Pinggir kota. Hanya untuk rumah pertama' },
        komersial: { nama: 'Rumah tipe 45', luas: '45/120 m²', ket: 'Perumahan dalam kota' },
        mewah: { nama: 'Rumah mewah tipe 200', luas: '200/350 m²', ket: 'Kawasan elite, level sultan' }
      },
      kavling: [100, 150, 300]
    },
    /* kredit motor (perkiraan): bunga flat sekitar 1,8% sebulan + asuransi 0,2% dari harga sebulan */
    kreditMotor: { dp: [0.1, 0.15, 0.2], tenor: [11, 17, 23, 29, 35], bungaFlat: 0.018, asuransi: 0.002, dendaHarian: 0.005, tarikSetelahBulan: 3, leasing: 'Leasing motor' },
    /* perawatan (perkiraan); ban sepasang depan-belakang ±18.000 km */
    rawat: { oliKm: 2000, oli: 50000, servisKm: 4000, servis: 100000, banKm: 18000, banHarga: { harian: 420000, sport: 1400000, moge: 4500000 }, pkb: 0.012, swdkllj: 35000, dendaPajak: 0.02, tarifListrik: 1445 },
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
    /* apotek dunia nyata (Kimia Farma / K-24): obat-obatan, vitamin, dan kontrasepsi (harga pasar Indonesia) */
    apotek: [
      { id: 'paracetamol', kat: 'obat', nama: 'Sanmol / Paracetamol 500 mg', kemasan: '1 strip (10 tab)', harga: 10000, sembuh: ['demam', 'pusing'], ket: 'Meredakan demam, sakit kepala, dan pegal' },
      { id: 'tolakangin', kat: 'obat', nama: 'Tolak Angin Cair Sidomuncul', kemasan: '1 kotak (5 sachet)', harga: 22000, sembuh: ['masukangin', 'demam'], ket: 'Sembuhkan masuk angin akibat kehujanan atau begadang' },
      { id: 'bodrex', kat: 'obat', nama: 'Bodrex Flu & Batuk PE', kemasan: '1 strip (4 kaplet)', harga: 12000, sembuh: ['flu', 'masukangin'], ket: 'Meredakan flu, pilek, dan batuk akibat cuaca' },
      { id: 'promag', kat: 'obat', nama: 'Promag / Mylanta Tablet', kemasan: '1 strip (10 tab)', harga: 10000, sembuh: ['maag'], ket: 'Mengatasi sakit maag / asam lambung karena telat makan' },
      { id: 'enervon', kat: 'vitamin', nama: 'Enervon-C / Imboost Force', kemasan: '1 strip (10 tab)', harga: 45000, kebalHari: 3, stamina: 25, ket: 'Vitamin daya tahan tubuh (+25 stamina & kebal sakit 3 hari)' },
      { id: 'dokter', kat: 'obat', nama: 'Berobat ke Klinik / Dokter Umum + Resep', kemasan: '1× konsultasi & obat', harga: 150000, sembuhSemua: true, ket: 'Menyembuhkan semua jenis sakit termasuk sakit berat / kecapekan parah' },
      { id: 'kondom_sutra', kat: 'kb', nama: 'Kondom Sutra Classic', kemasan: '1 kotak (isi 3)', harga: 14000, stokKb: 'kondom', isi: 3, ket: 'Pengaman sekali pakai (isi 3) untuk mencegah kehamilan saat HB' },
      { id: 'kondom_gerigi', kat: 'kb', nama: 'Kondom Fiesta Max Dotted Bergerigi', kemasan: '1 kotak (isi 3)', harga: 26000, stokKb: 'kondom', isi: 3, gerigi: true, ket: 'Kondom bergerigi (isi 3) dengan tekstur bintik & ulir untuk kepuasan ekstra pasangan' },
      { id: 'kondom_durex', kat: 'kb', nama: 'Kondom Durex Extra Safe', kemasan: '1 kotak (isi 3)', harga: 35000, stokKb: 'kondom', isi: 3, ket: 'Pengaman premium (isi 3) ekstra nyaman & aman saat HB' },
      { id: 'pil_kb', kat: 'kb', nama: 'Pil KB Andalan', kemasan: '1 strip (28 hari)', harga: 18000, kbHari: 28, ket: 'Kontrasepsi harian efektif 28 hari mencegah kehamilan' },
      { id: 'suntik_kb', kat: 'kb', nama: 'Suntik KB 3 Bulan (Bidan / Klinik)', kemasan: '1× suntik (90 hari)', harga: 45000, kbHari: 90, ket: 'Perlindungan kontrasepsi jangka panjang selama 90 hari' },
      { id: 'testpack', kat: 'kb', nama: 'Test Pack Kehamilan Sensitif', kemasan: '1 strip', harga: 25000, cekHamil: true, ket: 'Cek kehamilan secara akurat di rumah' },
      { id: 'folamil', kat: 'vitamin', nama: 'Folamil Genio (Vitamin Ibu Hamil)', kemasan: '1 botol (30 kapsul)', harga: 145000, vitaminHamil: true, ket: 'Nutrisi asam folat & DHA untuk kesehatan ibu hamil dan janin' },
      { id: 'arv_hiv', kat: 'obat', nama: 'Terapi ARV (Antiretroviral) Bulanan', kemasan: '1 botol (30 hari)', harga: 250000, arvHari: 30, ket: 'Obat terapi rutin 30 hari untuk menjaga kesehatan & daya tahan tubuh bila terinfeksi HIV' }
    ],
    /* Pasar tradisional / sembako kebutuhan pokok rumah tangga (bisa belanja sendiri atau suruh pasangan) */
    pasarPokok: [
      { id: 'beras10kg', nama: 'Beras Pandan Wangi / Ramos 10 kg', harga: 148000, hariDapur: 7, ket: 'Stok beras utama keluarga untuk seminggu penuh' },
      { id: 'telur1papan', nama: 'Telur Ayam Negeri 1 Papan (30 butir)', harga: 58000, hariDapur: 3, ket: 'Lauk protein praktis untuk sarapan & makan rumah' },
      { id: 'ayam2ekor', nama: 'Ayam Potong Segar 2 Ekor + Bumbu', harga: 78000, hariDapur: 4, ket: 'Stok ayam ungkep & gulai di kulkas rumah' },
      { id: 'dagingsapi', nama: 'Daging Sapi Lokal Segar 1 kg', harga: 138000, hariDapur: 6, ket: 'Masak rendang & sop daging spesial untuk keluarga' },
      { id: 'minyakgula', nama: 'Minyak Goreng 2L + Gula + Garam + Kecap', harga: 64000, hariDapur: 4, ket: 'Kebutuhan pokok dapur sehari-hari' },
      { id: 'sayurbumbu', nama: 'Paket Sayur Mayur, Cabai, Bawang & Tempe', harga: 45000, hariDapur: 2, ket: 'Sayuran segar pasar pagi untuk masakan rumah' },
      { id: 'susuanak', nama: 'Susu Formula / UHT Keluarga & Buah Segar', harga: 95000, hariDapur: 5, bonusBahagia: 10, ket: 'Gizi tambahan agar anak & pasangan makin sehat dan bahagia' },
      { id: 'paketlengkap', nama: 'Borong Sembako Lengkap 1 Bulan', harga: 1350000, hariDapur: 30, bonusBahagia: 18, ket: 'Belanja bulanan komplit beras, daging, ayam, telur, minyak & sayur 30 hari' }
    ],
    /* Usaha Rental PlayStation (bisa di Lantai 2 Ruko 2 Lantai bersama kedai, atau sewa ruko terpisah) */
    rentalPsConfig: {
      lokasi: [
        { id: 'lantai2', nama: 'Lantai 2 (Ruko 2 Lantai bersama Kedai Kopi)', sewaBulan: 2500000, biayaBuka: 18000000, ramai: 1.25, butuhRuko2Lantai: true, ket: 'Hemat sewa! Lantai 1 untuk Kedai Kopi & Cemilan, Lantai 2 untuk Rental PS' },
        { id: 'kampus_pisah', nama: 'Ruko Rental Terpisah Dekat Kampus', sewaBulan: 4200000, biayaBuka: 14000000, ramai: 1.4, butuhRuko2Lantai: false, ket: 'Lokasi beda dengan kedai, anak kuliahan ramai main PES/FC & GTA' },
        { id: 'perumahan_pisah', nama: 'Ruko Rental Terpisah di Perumahan', sewaBulan: 2900000, biayaBuka: 10000000, ramai: 1.1, butuhRuko2Lantai: false, ket: 'Lokasi beda dengan kedai, ramai anak sekolah & warga sekitar' }
      ],
      tarifDefault: { ps1: 3000, ps2: 5000, ps3: 8000, ps4: 12000, ps5: 20000, ps5disc: 20000 },
      hargaTvUnit: 1950000,
      gajiPenjaga: 1350000,
      modalStokMinum: 250000,
      isiStokMinum: 60,
      hargaJualMinum: 7000
    },
    penyakit: [
      { id: 'masukangin', nama: 'Masuk angin', berat: false, obat: 'Tolak Angin / Bodrex', sebab: 'kehujanan atau angin malam' },
      { id: 'flu', nama: 'Flu & batuk', berat: false, obat: 'Bodrex Flu & Batuk', sebab: 'perubahan cuaca hujan' },
      { id: 'demam', nama: 'Demam & meriang', berat: false, obat: 'Paracetamol / Sanmol', sebab: 'kelelahan dan kurang istirahat' },
      { id: 'maag', nama: 'Asam lambung / Maag', berat: false, obat: 'Promag / Mylanta', sebab: 'sering telat makan' },
      { id: 'tifus', nama: 'Kelelahan berat (Gejala Tifus)', berat: true, obat: 'Berobat ke Klinik / Dokter', sebab: 'beraktivitas berlebihan tanpa istirahat' }
    ],
    /* biaya rumah tangga nyata (sudah mencakup makan suami, istri, dan anak di rumah) */
    rumahTangga: [
      { id: 'harian', nama: 'Belanja Harian (1 hari)', hari: 1, dasar: 55000, perAnak: 15000, ket: 'Uang belanja dapur harian untuk makan sekeluarga di rumah' },
      { id: 'mingguan', nama: 'Belanja Mingguan (7 hari)', hari: 7, dasar: 360000, perAnak: 95000, ket: 'Lebih hemat untuk kebutuhan makan di rumah selama seminggu' },
      { id: 'bulanan', nama: 'Belanja Bulanan (30 hari)', hari: 30, dasar: 1450000, perAnak: 380000, ket: 'Stok beras, lauk, & dapur penuh 1 bulan untuk makan gratis di rumah' }
    ],
    /* pendidikan kuliah pasangan (harga UKT/semester asli di Indonesia) */
    pendidikanPasangan: [
      { id: 'd3_bidan', nama: 'D3 Kebidanan / Keperawatan', semester: 6, ukt: 3500000, gelar: 'A.Md.Keb / A.Md.Kep', ket: '6 semester (3 thn) · Membuka profesi Perawat / Bidan' },
      { id: 's1_ekonomi', nama: 'S1 Akuntansi / Manajemen', semester: 8, ukt: 4200000, gelar: 'S.E.', ket: '8 semester (4 thn) · Membuka profesi Akuntan / Staf Bank' },
      { id: 's1_ti', nama: 'S1 Teknik Informatika', semester: 8, ukt: 5000000, gelar: 'S.Kom.', ket: '8 semester (4 thn) · Membuka profesi Programmer / IT' },
      { id: 's1_dokter', nama: 'S1 Kedokteran + Profesi Dokter', semester: 10, ukt: 12500000, gelar: 'dr.', ket: '10 semester (5 thn) · Membuka profesi Dokter Umum (gaji tinggi)' }
    ],
    /* pekerjaan pasangan di luar rumah atas izin karakter utama (gaji bulanan nyata Indonesia) */
    kerjaPasangan: [
      { id: 'admin_toko', nama: 'Admin Online Shop / CS', gaji: 2800000, butuh: null, ket: 'Kerja ringan harian, tanpa syarat gelar kuliah' },
      { id: 'guru_les', nama: 'Guru Les / Bimbel', gaji: 2600000, butuh: null, ket: 'Mengajar bimbel sore, waktu fleksibel' },
      { id: 'kasir_mini', nama: 'Karyawan Minimarket / Retail', gaji: 3300000, butuh: null, ket: 'Gaji tetap bulanan setara retail modern' },
      { id: 'staf_kantor', nama: 'Staf Administrasi Kantor', gaji: 4200000, butuh: null, ket: 'Kerja kantoran Senin–Jumat' },
      { id: 'perawat', nama: 'Perawat / Bidan Klinik & RS', gaji: 5200000, butuh: 'd3_bidan', ket: 'Butuh lulus D3 Kebidanan / Keperawatan' },
      { id: 'akuntan', nama: 'Akuntan / Staf Perbankan', gaji: 7200000, butuh: 's1_ekonomi', ket: 'Butuh lulus S1 Akuntansi / Manajemen' },
      { id: 'programmer', nama: 'Software Engineer / IT', gaji: 11500000, butuh: 's1_ti', ket: 'Butuh lulus S1 Teknik Informatika' },
      { id: 'dokter', nama: 'Dokter Umum (Klinik & RS)', gaji: 18000000, butuh: 's1_dokter', ket: 'Butuh lulus S1 Kedokteran + Profesi Dokter' }
    ],
    /* pendidikan anak sesuai usia nyata di Indonesia (4 thn PAUD/TK, 6 thn SD, 12 thn SMP, 15 thn SMA, 18 thn Kuliah) */
    sekolahAnak: [
      { id: 'paud', nama: 'PAUD / TK', minUsia: 4, maksUsia: 5, pangkal: 1200000, spp: 250000, ket: 'Usia 4–5 tahun · Bermain sambil belajar membaca & berhitung' },
      { id: 'sd_negeri', nama: 'SD Negeri', minUsia: 6, maksUsia: 11, pangkal: 450000, spp: 0, ket: 'Usia 6–11 tahun · SPP gratis pemerintah (biaya seragam & buku Rp450rb)' },
      { id: 'sd_swasta', nama: 'SD Swasta / Terpadu', minUsia: 6, maksUsia: 11, pangkal: 4500000, spp: 650000, ket: 'Usia 6–11 tahun · Fasilitas lengkap & ekstrakurikuler' },
      { id: 'smp_negeri', nama: 'SMP Negeri', minUsia: 12, maksUsia: 14, pangkal: 600000, spp: 0, ket: 'Usia 12–14 tahun · SPP gratis pemerintah (seragam & perlengkapan)' },
      { id: 'smp_swasta', nama: 'SMP Swasta', minUsia: 12, maksUsia: 14, pangkal: 6500000, spp: 850000, ket: 'Usia 12–14 tahun · Program bilingual & pembinaan prestasi' },
      { id: 'sma_negeri', nama: 'SMA / SMK Negeri', minUsia: 15, maksUsia: 17, pangkal: 750000, spp: 0, ket: 'Usia 15–17 tahun · SPP gratis / terjangkau (seragam & buku)' },
      { id: 'sma_swasta', nama: 'SMA Swasta Unggulan', minUsia: 15, maksUsia: 17, pangkal: 8000000, spp: 1100000, ket: 'Usia 15–17 tahun · Persiapan perguruan tinggi' },
      { id: 'kuliah_anak', nama: 'Kuliah S1 Universitas', minUsia: 18, maksUsia: 24, pangkal: 4500000, spp: 750000, ket: 'Usia 18+ tahun · UKT kuliah perguruan tinggi' }
    ],

    namaOrang: ['Budi', 'Siti', 'Rina', 'Andi', 'Dewi', 'Fajar', 'Putri', 'Rizky', 'Nadia', 'Yoga', 'Intan', 'Bayu', 'Lestari', 'Hendra', 'Maya', 'Tono', 'Sari', 'Dimas', 'Wulan', 'Agus', 'Ucok', 'Butet', 'Rudi', 'Fitri'],
    namaCewek: ['Siti', 'Rina', 'Dewi', 'Putri', 'Nadia', 'Intan', 'Lestari', 'Maya', 'Sari', 'Wulan', 'Butet', 'Fitri', 'Ayu', 'Citra', 'Nisa', 'Tiara', 'Amelia', 'Dinda'],
    namaCowok: ['Budi', 'Andi', 'Fajar', 'Rizky', 'Yoga', 'Bayu', 'Hendra', 'Tono', 'Dimas', 'Agus', 'Ucok', 'Rudi', 'Arif', 'Bagus', 'Reza', 'Wahyu', 'Ilham', 'Dedi'],
    kantor: ['Kantor notaris', 'Kantor kelurahan', 'Bengkel resmi', 'Kantor asuransi', 'Panitia arisan RT', 'Kantor cabang bank', 'Klinik pratama', 'Sekolah swasta']
  };
})(typeof window !== 'undefined' ? window : this);
