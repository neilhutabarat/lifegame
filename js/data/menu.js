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
    matcha: { porsi: 5, nama: 'Matcha', takaran: '5 g', harga: 300, perGram: true, warna: '#7fae4f', tambahan: true },
    /* bahan cemilan kedai */
    wadahMakan: { porsi: 1, nama: 'Box cemilan', takaran: '1 box', harga: 700, warna: '#e8d8be' },
    kentang: { porsi: 150, nama: 'Kentang beku', takaran: '150 g', harga: 35, perGram: true, warna: '#f2c14e' },
    tahu: { porsi: 2, nama: 'Tahu & balado', takaran: '2 potong', harga: 1800, warna: '#d9534f' },
    mie: { porsi: 1, nama: 'Mie goreng', takaran: '1 bungkus', harga: 3000, warna: '#e0a94c' },
    sosisTelur: { porsi: 1, nama: 'Sosis & telur', takaran: '1 porsi', harga: 5500, warna: '#c85a3a' }
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
    galon: { nama: 'Air galon isi ulang', merek: 'Depot isi ulang', kemasan: '19 L', isi: 19000, satuan: 'ml', harga: 7000, tetap: true, ada: ['grosir'] },
    kentang: { nama: 'Kentang goreng beku (shoestring)', merek: 'Fiesta / lokal', kemasan: '1 kg', isi: 1000, satuan: 'g', harga: 35000, ada: ['pasar', 'grosir', 'online'] },
    tahu: { nama: 'Tahu putih + bumbu balado', merek: 'Pasar lokal', kemasan: '10 potong', isi: 10, satuan: 'buah', harga: 18000, ada: ['pasar', 'grosir'] },
    mie: { nama: 'Mie instan goreng', merek: 'Indomie', kemasan: '1 dus (40 bks)', isi: 40, satuan: 'buah', harga: 120000, ada: ['pasar', 'grosir', 'online', 'sales'] },
    sosisTelur: { nama: 'Paket sosis & telur ayam', merek: 'Pasar / grosir', kemasan: '10 porsi', isi: 10, satuan: 'buah', harga: 55000, ada: ['pasar', 'grosir'] },
    wadahMakan: { nama: 'Box kertas cemilan + garpu', merek: 'Grosir kemasan', kemasan: '50 set', isi: 50, satuan: 'buah', harga: 35000, ada: ['grosir', 'online'] }
  };
  var URUT_BARANG = ['kopi', 'uht', 'skm', 'gula', 'aren', 'cokelat', 'teh', 'oat', 'sirup', 'matcha', 'es', 'cupPlastik', 'cupKertas', 'gas', 'galon', 'kentang', 'tahu', 'mie', 'sosisTelur', 'wadahMakan'];
  /* satu tap bahan = berapa satuan stok. Air panas memakai air galon dan gas (biaya operasional, bukan HPP). */
  var TAP_STOK = { es: 150, air: 0, cupPlastik: 1, cupKertas: 1 };
  var AIR_PANAS = { galon: 150, gas: 20 }; /* setelan: 1 tabung 3 kg cukup sekitar 150 gelas */

  var URUT_BAHAN = ['cupPlastik', 'cupKertas', 'es', 'air', 'kopi', 'espresso', 'teh', 'matcha', 'cokelat', 'uht', 'foam', 'oat', 'skm', 'gula', 'aren', 'sirup'];
  /* rasa tiap bahan: pahit, manis, gurih, segar, wangi (rancangan: racik menu sendiri) */
  var PROFIL = { kopi: [3, 0, 0, 0, 1], espresso: [3, 0, 0.5, 0, 2], teh: [1, 0, 0, 2, 1], matcha: [1.5, 0, 1, 1, 2], cokelat: [1, 1.5, 1.5, 0, 0.5],
    uht: [0, 0.5, 2, 0, 0], foam: [0, 0.3, 1.5, 0, 0.5], oat: [0, 0.5, 1.5, 0, 1], skm: [0, 2.5, 1, 0, 0], gula: [0, 2, 0, 0, 0], aren: [0, 2, 0.5, 0, 1.5], sirup: [0, 2, 0, 0.5, 2], es: [0, 0, 0, 2, 0], air: [0, 0, 0, 0, 0] };
  /* selera jenis pembeli terhadap profil rasa (setelan) */
  var SELERA = { mahasiswa: [0.2, 1, 0.6, 0.5, 0.4], kantor: [1, 0.3, 0.4, 0.2, 0.7], ojol: [0.8, 0.7, 0.3, 0.3, 0.2], keluarga: [0, 1, 0.8, 0.5, 0.3], konten: [0.3, 0.6, 0.5, 0.7, 0.8] };

  /* resep dasar (bisa disajikan panas atau dingin/es sesuai permintaan pemesan).
     aktifAwal: hanya 3 kopi dasar yang langsung dijual di awal; 5 kopi spesial bebas diaktifkan dari Racik Menu kapan saja. */
  var MENU = [
    { id: 'hitam', nama: 'Kopi hitam', pendek: 'Kopi Hitam', harga: 8000, aktifAwal: true, bisaSuhu: true, warna: '#3a2116',
      resep: [['cupKertas', 1], ['kopi', 12], ['air', 1], ['gula', 15]] },
    { id: 'susu', nama: 'Kopi susu', pendek: 'Kopi Susu', harga: 15000, aktifAwal: true, bisaSuhu: true, warna: '#c49a6c',
      resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['skm', 30], ['uht', 100]] },
    { id: 'aren', nama: 'Kopi gula aren', pendek: 'Kopsu Aren', harga: 18000, aktifAwal: true, bisaSuhu: true, warna: '#a8774e',
      resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['uht', 150], ['aren', 25]] },
    /* menu kopi spesial di racikan: bebas dijual atau tidak dijual kapan saja */
    { id: 'americano', nama: 'Americano', pendek: 'Americano', harga: 16000, aktifAwal: false, spesial: true, bisaSuhu: true, warna: '#2c1810',
      resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['air', 1]] },
    { id: 'arabica', nama: 'Kopi arabica', pendek: 'Arabica', harga: 18000, aktifAwal: false, spesial: true, bisaSuhu: true, warna: '#4e2c1a',
      resep: [['cupKertas', 1], ['kopi', 18], ['air', 1]] },
    { id: 'espresso', nama: 'Espresso', pendek: 'Espresso', harga: 14000, aktifAwal: false, spesial: true, bisaSuhu: true, warna: '#26140c',
      resep: [['cupKertas', 1], ['kopi', 18], ['air', 1]] },
    { id: 'mocha', nama: 'Mocha', pendek: 'Mocha', harga: 20000, aktifAwal: false, spesial: true, bisaSuhu: true, warna: '#6b3b25',
      resep: [['cupPlastik', 1], ['es', 1], ['kopi', 18], ['cokelat', 25], ['uht', 120]] },
    { id: 'cappuccino', nama: 'Cappuccino', pendek: 'Cappuccino', harga: 20000, aktifAwal: false, spesial: true, bisaSuhu: true, warna: '#b98b63',
      resep: [['cupKertas', 1], ['kopi', 18], ['uht', 150], ['gula', 10]] },
    /* 3 cemilan utama dijual barengan di kedai */
    { id: 'kentang', nama: 'Kentang goreng', pendek: 'Kentang Goreng', harga: 15000, aktifAwal: true, cemilan: true, bisaSuhu: false, warna: '#f2c14e',
      resep: [['wadahMakan', 1], ['kentang', 150]] },
    { id: 'tahu', nama: 'Tahu balado', pendek: 'Tahu Balado', harga: 12000, aktifAwal: true, cemilan: true, bisaSuhu: false, warna: '#d9534f',
      resep: [['wadahMakan', 1], ['tahu', 2]] },
    { id: 'miegoreng', nama: 'Mie goreng sosis telur', pendek: 'Mie Sosis Telur', harga: 18000, aktifAwal: true, cemilan: true, bisaSuhu: false, warna: '#d98a2b',
      resep: [['wadahMakan', 1], ['mie', 1], ['sosisTelur', 1]] },
    /* menu takjil khusus bulan Ramadan (otomatis dijual pukul 16.00 saat Ramadan) */
    { id: 'kolak', nama: 'Kolak pisang ubi', pendek: 'Kolak Takjil', harga: 10000, aktifAwal: true, cemilan: true, takjil: true, bisaSuhu: false, warna: '#c68642',
      resep: [['cupPlastik', 1], ['aren', 25], ['uht', 100]] },
    { id: 'esbuah', nama: 'Es buah segar takjil', pendek: 'Es Buah', harga: 12000, aktifAwal: true, cemilan: true, takjil: true, bisaSuhu: false, warna: '#e0675a',
      resep: [['cupPlastik', 1], ['es', 1], ['skm', 25], ['gula', 15]] },
    { id: 'gorengantakjil', nama: 'Paket gorengan takjil', pendek: 'Gorengan Takjil', harga: 10000, aktifAwal: true, cemilan: true, takjil: true, bisaSuhu: false, warna: '#e0a94c',
      resep: [['wadahMakan', 1], ['tahu', 2]] }
  ];
  /* sesuaikan resep berdasarkan suhu yang diminta pembeli (panas pakai cup kertas + air panas; dingin pakai cup plastik + es) */
  function resepSuhu(menu, panas) {
    if (!menu || !menu.resep) return [];
    if (menu.cemilan) return menu.resep.slice();
    var r = menu.resep.filter(function (x) { return x[0] !== 'cupPlastik' && x[0] !== 'cupKertas' && x[0] !== 'es'; });
    var hasil = [[panas ? 'cupKertas' : 'cupPlastik', 1]];
    if (!panas) hasil.push(['es', 1]);
    var adaAir = r.some(function (x) { return x[0] === 'air'; });
    var adaSusu = r.some(function (x) { return x[0] === 'uht' || x[0] === 'oat'; });
    r.forEach(function (x) { hasil.push(x); });
    if (panas && !adaAir && !adaSusu) hasil.push(['air', 1]);
    return hasil;
  }
  function biaya(idBahan, jumlah) { var b = BAHAN[idBahan]; return Math.round(b.harga * jumlah); }
  MENU.forEach(function (m) { m.hpp = m.resep.reduce(function (t, r) { return t + biaya(r[0], r[1]); }, 0); });

  /* jenis pembeli (rancangan bagian Pembeli). sabar = menit game sebelum pergi; qris = peluang bayar QRIS (setelan) */
  var PEMBELI = {
    mahasiswa: { nama: 'Mahasiswa', sabar: 50, qris: 0.6, suka: { aren: 28, susu: 20, hitam: 8, americano: 8, mocha: 10, cappuccino: 8, arabica: 4, espresso: 2, kentang: 16, tahu: 12, miegoreng: 18 } },
    kantor: { nama: 'Pekerja kantor', sabar: 25, qris: 0.8, suka: { aren: 24, susu: 16, hitam: 14, americano: 14, cappuccino: 10, arabica: 8, espresso: 6, mocha: 6, kentang: 10, tahu: 10, miegoreng: 8 } },
    ojol: { nama: 'Driver ojol', sabar: 35, qris: 0.3, suka: { hitam: 34, susu: 24, aren: 14, americano: 4, arabica: 2, espresso: 2, mocha: 1, cappuccino: 1, tahu: 14, miegoreng: 16, kentang: 6 } },
    keluarga: { nama: 'Keluarga', sabar: 45, qris: 0.5, suka: { susu: 26, aren: 24, mocha: 14, cappuccino: 10, hitam: 5, arabica: 3, americano: 2, espresso: 1, kentang: 20, tahu: 12, miegoreng: 16 } },
    konten: { nama: 'Pembuat konten', sabar: 40, qris: 0.7, suka: { aren: 30, mocha: 16, cappuccino: 14, arabica: 12, americano: 8, susu: 6, espresso: 4, hitam: 2, kentang: 18, tahu: 10, miegoreng: 12 } }
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

  g.KK_MENU = { PROFIL: PROFIL, SELERA: SELERA, BARANG: BARANG, URUT_BARANG: URUT_BARANG, TAP_STOK: TAP_STOK, AIR_PANAS: AIR_PANAS, BAHAN: BAHAN, URUT_BAHAN: URUT_BAHAN, MENU: MENU, resepSuhu: resepSuhu, PEMBELI: PEMBELI, campuran: campuran, KERAMAIAN: KERAMAIAN, PEMBELI_PER_HARI: PEMBELI_PER_HARI, biaya: biaya };
})(typeof window !== 'undefined' ? window : this);
