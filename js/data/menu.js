/* menu.js — bahan, menu awal, dan pembeli (rancangan bagian "Menu awal, resep & HPP" dan "Pembeli").
   Harga bahan = harga tengah November 2026 dari tabel bahan. Angka bertanda "setelan" disetel ulang di tahap 10. */
(function (g) {
  'use strict';
  /* takaran = satu kali tap; harga = rupiah per takaran */
  var BAHAN = {
    cupPlastik: { porsi: 1, nama: 'Cup plastik', takaran: '16 oz + tutup', harga: 900, warna: '#dfeef3', jenis: 'cup' },
    cupKertas: { porsi: 1, nama: 'Cup kertas', takaran: '8 oz + tutup', harga: 1000, warna: '#f3e6d0', jenis: 'cup' },
    es: { porsi: 1, nama: 'Es batu', takaran: '150 g', harga: 225, warna: '#cfe9f5' },
    kopi: { porsi: 15, nama: 'Kopi', takaran: 'sesuai resep', harga: 165, perGram: true, warna: '#4a2c1d' },
    air: { porsi: 1, nama: 'Air panas', takaran: '150 ml', harga: 0, warna: '#e9d9c3' },
    uht: { porsi: 120, nama: 'Susu UHT', takaran: 'sesuai resep', harga: 21, perMl: true, warna: '#fbf7ef' },
    skm: { porsi: 25, nama: 'Kental manis', takaran: 'sesuai resep', harga: 26, perGram: true, warna: '#f1e3c0' },
    gula: { porsi: 15, nama: 'Gula pasir', takaran: 'sesuai resep', harga: 20, perGram: true, warna: '#ffffff' },
    aren: { porsi: 25, nama: 'Gula aren', takaran: '25 ml', harga: 50, perMl: true, warna: '#9a5a22' },
    cokelat: { porsi: 25, nama: 'Cokelat', takaran: '25 g', harga: 105, perGram: true, warna: '#6b3b25' },
    teh: { porsi: 3, nama: 'Teh', takaran: '3 g', harga: 33, perGram: true, warna: '#b8622a' },
    /* bahan tambahan untuk racik menu sendiri (tahap 8) */
    espresso: { porsi: 18, nama: 'Espresso', takaran: '18 g kopi', harga: 165, perGram: true, warna: '#2e1a10', stok: 'kopi', butuhAlat: 'espresso' },
    foam: { porsi: 60, nama: 'Foam susu', takaran: '60 ml susu', harga: 21, perMl: true, warna: '#fffdf6', stok: 'uht', butuhAlat: 'espresso' },
    oat: { porsi: 150, nama: 'Susu oat', takaran: '150 ml', harga: 37.5, perMl: true, warna: '#efe2c4', tambahan: true },
    sirup: { porsi: 20, nama: 'Sirup rasa', takaran: '20 ml', harga: 113, perMl: true, warna: '#d9667a', tambahan: true },
    matcha: { porsi: 5, nama: 'Matcha', takaran: '5 g', harga: 300, perGram: true, warna: '#7fae4f', tambahan: true }
  };
  /* barang yang dibeli (rancangan bagian "Bahan & harga pemasok"); isi dalam satuan stok: g, ml, atau buah.
     harga = harga tengah November 2026 untuk satu kemasan. ada = tempat belanja yang menjual. */
  var BARANG = {
    kopi: { nama: 'Biji kopi robusta sangrai', merek: 'Sidikalang', kemasan: '1 kg', isi: 1000, satuan: 'g', harga: 165000, ada: ['pasar', 'grosir', 'online', 'sales'] },
    uht: { nama: 'Susu UHT full cream', merek: 'Ultra Milk', kemasan: '1 L', isi: 1000, satuan: 'ml', harga: 21000, ada: ['grosir', 'online', 'sales'] },
    skm: { nama: 'Susu kental manis', merek: 'Frisian Flag', kemasan: '490 g', isi: 490, satuan: 'g', harga: 13000, ada: ['pasar', 'grosir', 'online', 'sales'] },
    gula: { nama: 'Gula pasir', merek: 'Gulaku', kemasan: '1 kg', isi: 1000, satuan: 'g', harga: 20000, ada: ['pasar', 'grosir', 'online'] },
    aren: { nama: 'Gula aren cair', merek: 'Merek lokal', kemasan: '1 L', isi: 1000, satuan: 'ml', harga: 50000, ada: ['pasar', 'grosir', 'online'] },
    cokelat: { nama: 'Cokelat bubuk', merek: 'Van Houten', kemasan: '1 kg', isi: 1000, satuan: 'g', harga: 105000, ada: ['grosir', 'online', 'sales'] },
    teh: { nama: 'Teh tubruk', merek: 'Merek lokal', kemasan: '1 kg', isi: 1000, satuan: 'g', harga: 33000, ada: ['pasar', 'grosir', 'online'] }, /* perkiraan */
    es: { nama: 'Es batu kristal', merek: 'Pabrik es lokal', kemasan: '10 kg', isi: 10000, satuan: 'g', harga: 15000, ada: ['pasar', 'grosir'] },
    cupPlastik: { nama: 'Cup plastik 16 oz + tutup + sedotan', merek: 'Grosir kemasan', kemasan: '50 set', isi: 50, satuan: 'buah', harga: 45000, ada: ['grosir', 'online', 'sales'] },
    cupKertas: { nama: 'Cup kertas 8 oz + tutup', merek: 'Grosir kemasan', kemasan: '50 set', isi: 50, satuan: 'buah', harga: 50000, ada: ['grosir', 'online', 'sales'] },
    gas: { nama: 'LPG 3 kg (tukar tabung)', merek: 'Pertamina', kemasan: '1 tabung', isi: 3000, satuan: 'g', harga: 22000, tetap: true, ada: ['grosir'] },
    oat: { nama: 'Susu oat', merek: 'Oatside', kemasan: '1 L', isi: 1000, satuan: 'ml', harga: 37500, ada: ['grosir', 'online'] },
    sirup: { nama: 'Sirup rasa (vanila, karamel, hazelnut)', merek: 'Denali', kemasan: '750 ml', isi: 750, satuan: 'ml', harga: 85000, ada: ['grosir', 'online'] }, /* perkiraan */
    matcha: { nama: 'Matcha bubuk', merek: 'Merek lokal', kemasan: '500 g', isi: 500, satuan: 'g', harga: 150000, ada: ['online'] }, /* perkiraan, tidak ada di tabel rancangan */
    galon: { nama: 'Air galon isi ulang', merek: 'Depot isi ulang', kemasan: '19 L', isi: 19000, satuan: 'ml', harga: 7000, tetap: true, ada: ['grosir'] }
  };
  var URUT_BARANG = ['kopi', 'uht', 'skm', 'gula', 'aren', 'cokelat', 'teh', 'oat', 'sirup', 'matcha', 'es', 'cupPlastik', 'cupKertas', 'gas', 'galon'];
  /* satu tap bahan = berapa satuan stok. Air panas memakai air galon dan gas (biaya operasional, bukan HPP). */
  var TAP_STOK = { es: 150, air: 0, cupPlastik: 1, cupKertas: 1 };
  var AIR_PANAS = { galon: 150, gas: 20 }; /* setelan: 1 tabung 3 kg cukup sekitar 150 gelas */

  var URUT_BAHAN = ['cupPlastik', 'cupKertas', 'es', 'air', 'kopi', 'espresso', 'teh', 'matcha', 'cokelat', 'uht', 'foam', 'oat', 'skm', 'gula', 'aren', 'sirup'];
  /* rasa tiap bahan: pahit, manis, gurih, segar, wangi (rancangan: racik menu sendiri) */
  var PROFIL = { kopi: [3, 0, 0, 0, 1], espresso: [3, 0, 0.5, 0, 2], teh: [1, 0, 0, 2, 1], matcha: [1.5, 0, 1, 1, 2], cokelat: [1, 1.5, 1.5, 0, 0.5],
    uht: [0, 0.5, 2, 0, 0], foam: [0, 0.3, 1.5, 0, 0.5], oat: [0, 0.5, 1.5, 0, 1], skm: [0, 2.5, 1, 0, 0], gula: [0, 2, 0, 0, 0], aren: [0, 2, 0.5, 0, 1.5], sirup: [0, 2, 0, 0.5, 2], es: [0, 0, 0, 2, 0], air: [0, 0, 0, 0, 0] };
  /* selera jenis pembeli terhadap profil rasa (setelan) */
  var SELERA = { mahasiswa: [0.2, 1, 0.6, 0.5, 0.4], kantor: [1, 0.3, 0.4, 0.2, 0.7], ojol: [0.8, 0.7, 0.3, 0.3, 0.2], keluarga: [0, 1, 0.8, 0.5, 0.3], konten: [0.3, 0.6, 0.5, 0.7, 0.8] };

  /* resep: [bahan, jumlah takaran dalam gram/ml/buah]; cup selalu pertama */
  var MENU = [
    { id: 'aren', nama: 'Es kopi susu gula aren', pendek: 'Kopsu Aren', harga: 18000, resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['uht', 150], ['aren', 25]] },
    { id: 'klasik', nama: 'Es kopi susu klasik', pendek: 'Kopsu Klasik', harga: 15000, resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['skm', 30], ['uht', 100]] },
    { id: 'hitam', nama: 'Kopi hitam panas', pendek: 'Kopi Hitam', harga: 8000, resep: [['cupKertas', 1], ['kopi', 12], ['air', 1], ['gula', 15]] },
    { id: 'sanger', nama: 'Kopi sanger panas', pendek: 'Sanger', harga: 10000, resep: [['cupKertas', 1], ['kopi', 15], ['air', 1], ['skm', 25]] },
    { id: 'cokelat', nama: 'Es cokelat', pendek: 'Es Cokelat', harga: 15000, resep: [['cupPlastik', 1], ['es', 1], ['cokelat', 25], ['uht', 150], ['gula', 15]] },
    { id: 'teh', nama: 'Es teh manis', pendek: 'Es Teh', harga: 5000, resep: [['cupPlastik', 1], ['es', 1], ['teh', 3], ['gula', 20]] }
  ];
  function biaya(idBahan, jumlah) { var b = BAHAN[idBahan]; return Math.round(b.harga * jumlah); }
  MENU.forEach(function (m) { m.hpp = m.resep.reduce(function (t, r) { return t + biaya(r[0], r[1]); }, 0); });

  /* jenis pembeli (rancangan bagian Pembeli). sabar = menit game sebelum pergi; qris = peluang bayar QRIS (setelan) */
  var PEMBELI = {
    mahasiswa: { nama: 'Mahasiswa', sabar: 50, qris: 0.6, suka: { aren: 30, klasik: 25, cokelat: 20, teh: 15, hitam: 5, sanger: 5 } },
    kantor: { nama: 'Pekerja kantor', sabar: 25, qris: 0.8, suka: { aren: 30, klasik: 20, hitam: 20, sanger: 15, cokelat: 5, teh: 10 } },
    ojol: { nama: 'Driver ojol', sabar: 35, qris: 0.3, suka: { hitam: 30, teh: 30, sanger: 20, klasik: 15, aren: 5 } },
    keluarga: { nama: 'Keluarga', sabar: 45, qris: 0.5, suka: { cokelat: 35, teh: 30, aren: 20, klasik: 15 } },
    konten: { nama: 'Pembuat konten', sabar: 40, qris: 0.7, suka: { aren: 50, cokelat: 30, klasik: 20 } }
  };
  /* campuran jenis pembeli per jam (setelan) */
  function campuran(jam, malamMinggu) {
    if (jam < 10) return { kantor: 45, ojol: 30, mahasiswa: 15, konten: 10 };
    if (jam < 15) return { kantor: 40, ojol: 25, mahasiswa: 25, konten: 10 };
    if (jam < 19) return { mahasiswa: 40, ojol: 20, kantor: 20, konten: 15, keluarga: 5 };
    return malamMinggu ? { mahasiswa: 35, keluarga: 30, konten: 20, ojol: 15 } : { mahasiswa: 45, keluarga: 15, konten: 15, ojol: 20, kantor: 5 };
  }
  /* keramaian per jam, 1 = paling ramai (setelan) */
  var KERAMAIAN = [0.15, 0.1, 0.1, 0.1, 0.1, 0.15, 0.2, 0.8, 1, 0.7, 0.5, 0.6, 0.9, 0.8, 0.5, 0.6, 0.9, 1, 0.8, 1, 1, 0.8, 0.5, 0.3];
  var PEMBELI_PER_HARI = 40; /* kedai tahap 1 di pinggir jalan, buka 07.00–22.00 (setelan) */

  g.KK_MENU = { PROFIL: PROFIL, SELERA: SELERA, BARANG: BARANG, URUT_BARANG: URUT_BARANG, TAP_STOK: TAP_STOK, AIR_PANAS: AIR_PANAS, BAHAN: BAHAN, URUT_BAHAN: URUT_BAHAN, MENU: MENU, PEMBELI: PEMBELI, campuran: campuran, KERAMAIAN: KERAMAIAN, PEMBELI_PER_HARI: PEMBELI_PER_HARI, biaya: biaya };
})(typeof window !== 'undefined' ? window : this);
