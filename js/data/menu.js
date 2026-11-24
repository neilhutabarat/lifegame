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
    teh: { porsi: 3, nama: 'Teh', takaran: '3 g', harga: 33, perGram: true, warna: '#b8622a' }
  };
  var URUT_BAHAN = ['cupPlastik', 'cupKertas', 'es', 'air', 'kopi', 'teh', 'cokelat', 'uht', 'skm', 'gula', 'aren'];

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

  g.KK_MENU = { BAHAN: BAHAN, URUT_BAHAN: URUT_BAHAN, MENU: MENU, PEMBELI: PEMBELI, campuran: campuran, KERAMAIAN: KERAMAIAN, PEMBELI_PER_HARI: PEMBELI_PER_HARI, biaya: biaya };
})(typeof window !== 'undefined' ? window : this);
