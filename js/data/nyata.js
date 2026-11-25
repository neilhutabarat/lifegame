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
      { id: 'proyektor', toko: 'shopee', kat: 'hiburan', nama: 'Smart Proyektor Mini Full HD Android', merek: 'Wanbo / Xiaomi', harga: 1650000, watt: 0.04, sewaHarian: 65000, ket: 'Nonton layar lebar di dinding kamar & bisa disewakan' }
    ],

    /* pulsa seluler, paket kuota internet (GB), dan langganan WiFi kos/rumah */
    paketData: {
      pulsa: [20000, 50000, 100000, 200000],
      kuota: [
        { id: 'k5', gb: 5, harga: 25000, nama: 'Kuota 5 GB (Harian/Mingguan)' },
        { id: 'k15', gb: 15, harga: 55000, nama: 'Kuota 15 GB (Combo Sakti)' },
        { id: 'k35', gb: 35, harga: 100000, nama: 'Kuota 35 GB (Freedom Internet)' },
        { id: 'k75', gb: 75, harga: 165000, nama: 'Kuota 75 GB (Unlimited FUP)' }
      ],
      wifiRumah: { nama: 'WiFi IndiHome / Biznet Fiber 50 Mbps', pasang: 150000, hargaBulan: 285000 }
    },

    /* katalog gadget asli: HP (Apple, Samsung, Xiaomi, OPPO, Realme, Infinix), Tablet, & Laptop sesuai tahun rilis asli, baterai mAh, charger Watt, RAM/Storage, dan harga pasar */
    daftarGadget: [
      /* HP 2023 */
      { id: 'redmi12c', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Xiaomi Redmi 12C', ram: 4, storage: 64, mah: 5000, watt: 10, kamera: 1.0, harga: 1399000, ket: 'Helio G85 · Layar 6,71" · Kamera 50 MP · HP awal andalan' },
      { id: 'infinix30', jenis: 'hp', tahun: 2023, merek: 'Infinix', nama: 'Infinix Note 30', ram: 8, storage: 256, mah: 5000, watt: 45, kamera: 1.15, harga: 2199000, ket: 'Helio G99 · 120Hz · Fast Charge 45W · Speaker JBL' },
      { id: 'realmec55', jenis: 'hp', tahun: 2023, merek: 'Realme', nama: 'Realme C55 NFC', ram: 6, storage: 128, mah: 5000, watt: 33, kamera: 1.15, harga: 2299000, ket: 'Mini Capsule · Kamera 64 MP · SuperVOOC 33W' },
      { id: 'redminote12p', jenis: 'hp', tahun: 2023, merek: 'Xiaomi', nama: 'Redmi Note 12 Pro 5G', ram: 8, storage: 256, mah: 5000, watt: 67, kamera: 1.3, harga: 4399000, ket: 'Sony IMX766 OIS · P-OLED 120Hz · Turbo Charge 67W' },
      { id: 'opporeno10', jenis: 'hp', tahun: 2023, merek: 'OPPO', nama: 'OPPO Reno10 5G', ram: 8, storage: 256, mah: 5000, watt: 67, kamera: 1.35, harga: 5999000, ket: 'Telephoto Portrait 32 MP · 3D Curved AMOLED · SuperVOOC 67W' },
      { id: 'galaxya54', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy A54 5G', ram: 8, storage: 256, mah: 5000, watt: 25, kamera: 1.4, harga: 5999000, ket: 'Super AMOLED 120Hz · IP67 Tahan Air · Kamera OIS Nightography' },
      { id: 'iphone15', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'Apple iPhone 15', ram: 6, storage: 128, mah: 3349, watt: 20, kamera: 1.65, harga: 13999000, ket: 'A16 Bionic · Dynamic Island · Kamera Utama 48 MP · USB-C' },
      { id: 's23ultra', jenis: 'hp', tahun: 2023, merek: 'Samsung', nama: 'Samsung Galaxy S23 Ultra 5G', ram: 12, storage: 256, mah: 5000, watt: 45, kamera: 1.8, harga: 19999000, ket: 'Snapdragon 8 Gen 2 · Kamera 200 MP Space Zoom · S-Pen bawaan' },
      { id: 'iphone15pm', jenis: 'hp', tahun: 2023, merek: 'Apple', nama: 'iPhone 15 Pro Max', ram: 8, storage: 256, mah: 4422, watt: 27, kamera: 1.9, harga: 24999000, ket: 'Titanium · A17 Pro · 5× Tetraprism Zoom · ProRes Video' },
      /* HP 2024+ */
      { id: 'infinixgt20', jenis: 'hp', tahun: 2024, merek: 'Infinix', nama: 'Infinix GT 20 Pro 5G', ram: 12, storage: 256, mah: 5000, watt: 45, kamera: 1.35, harga: 4399000, ket: 'Dimensity 8200 Ultimate · Layar 144Hz AMOLED · Cyber Mecha' },
      { id: 'realme13p', jenis: 'hp', tahun: 2024, merek: 'Realme', nama: 'Realme 13 Pro+ 5G', ram: 12, storage: 512, mah: 5200, watt: 80, kamera: 1.55, harga: 6499000, ket: 'Dual Sony Periscope OIS · SuperVOOC 80W · Desain Monet' },
      { id: 'xiaomi14tp', jenis: 'hp', tahun: 2024, merek: 'Xiaomi', nama: 'Xiaomi 14T Pro Leica', ram: 12, storage: 512, mah: 5000, watt: 120, kamera: 1.75, harga: 8499000, ket: 'Lensa Leica Summilux · Dimensity 9300+ · HyperCharge 120W' },
      { id: 'oppofindx8', jenis: 'hp', tahun: 2024, merek: 'OPPO', nama: 'OPPO Find X8 Hasselblad', ram: 12, storage: 256, mah: 5630, watt: 80, kamera: 1.85, harga: 13999000, ket: 'Kamera Hasselblad · Baterai Silicon-Carbon 5630 mAh · SuperVOOC 80W' },
      { id: 's24ultra', jenis: 'hp', tahun: 2024, merek: 'Samsung', nama: 'Samsung Galaxy S24 Ultra 5G', ram: 12, storage: 512, mah: 5000, watt: 45, kamera: 1.95, harga: 21999000, ket: 'Rangka Titanium · Galaxy AI · Snapdragon 8 Gen 3 · 200 MP' },
      { id: 'iphone16pm', jenis: 'hp', tahun: 2024, merek: 'Apple', nama: 'iPhone 16 Pro Max', ram: 8, storage: 256, mah: 4685, watt: 30, kamera: 2.05, harga: 25999000, ket: 'A18 Pro · Camera Control · Layar 6,9" Super Retina XDR · 4K 120fps' },

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
    namaCewek: ['Siti', 'Rina', 'Dewi', 'Putri', 'Nadia', 'Intan', 'Lestari', 'Maya', 'Sari', 'Wulan', 'Butet', 'Fitri', 'Ayu', 'Citra', 'Nisa', 'Tiara', 'Amelia', 'Dinda'],
    namaCowok: ['Budi', 'Andi', 'Fajar', 'Rizky', 'Yoga', 'Bayu', 'Hendra', 'Tono', 'Dimas', 'Agus', 'Ucok', 'Rudi', 'Arif', 'Bagus', 'Reza', 'Wahyu', 'Ilham', 'Dedi'],
    kantor: ['Kantor notaris', 'Kantor kelurahan', 'Bengkel resmi', 'Kantor asuransi', 'Panitia arisan RT', 'Kantor cabang bank', 'Klinik pratama', 'Sekolah swasta']
  };
})(typeof window !== 'undefined' ? window : this);
