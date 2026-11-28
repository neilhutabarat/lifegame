/* js/karakter_editor.js — Katalog 30 gaya (Rambut, Mata, Alis, Hidung, Mulut), 4 bentuk tubuh, & palet warna kulit Asia–Hitam Legam */
(function (g) {
  'use strict';
  var KULIT = [
    { id: 'putih_asia', nama: 'Putih Asia', hex: '#fff2ea', mid: '#f8dfd0', bayang: '#e8c4b0' },
    { id: 'kuning_langsat', nama: 'Kuning Langsat', hex: '#f8dec8', mid: '#ecc7a8', bayang: '#d6a682' },
    { id: 'sawo_terang', nama: 'Sawo Terang', hex: '#e8c09c', mid: '#d8a880', bayang: '#be8a60' },
    { id: 'sawo_matang', nama: 'Sawo Matang', hex: '#cf9b72', mid: '#bc845a', bayang: '#9c6640' },
    { id: 'cokelat_eksotis', nama: 'Cokelat Eksotis', hex: '#a6704b', mid: '#905c3a', bayang: '#724426' },
    { id: 'cokelat_gelap', nama: 'Cokelat Gelap', hex: '#7a4b31', mid: '#663c24', bayang: '#4d2b18' },
    { id: 'hitam_legam', nama: 'Hitam Legam', hex: '#4a2c1d', mid: '#3a2115', bayang: '#26140c' }
  ];

  var WARNA_RAMBUT = [
    { id: 'hitam', nama: 'Hitam Pekat', hex: '#1b1824', hi: 'rgba(200,210,245,0.34)' },
    { id: 'cokelat_tua', nama: 'Cokelat Tua', hex: '#2e1f1a', hi: 'rgba(220,180,150,0.34)' },
    { id: 'chestnut', nama: 'Chestnut', hex: '#5a3426', hi: 'rgba(245,195,155,0.36)' },
    { id: 'karamel', nama: 'Karamel', hex: '#8c5838', hi: 'rgba(255,220,180,0.38)' },
    { id: 'pirang', nama: 'Pirang Madu', hex: '#d4a65a', hi: 'rgba(255,248,210,0.45)' },
    { id: 'merah_marun', nama: 'Merah Marun', hex: '#6e2230', hi: 'rgba(255,170,185,0.36)' },
    { id: 'abu_perak', nama: 'Abu Perak', hex: '#8c96a6', hi: 'rgba(245,250,255,0.45)' },
    { id: 'biru_malam', nama: 'Biru Malam', hex: '#1e2c4a', hi: 'rgba(160,200,255,0.38)' }
  ];

  var WARNA_MATA = [
    { id: 'espresso', nama: 'Espresso', top: '#23181a', mid: '#4c3230', bot: '#8c6258' },
    { id: 'hazel', nama: 'Hazel', top: '#3a2418', mid: '#6b4732', bot: '#a87a52' },
    { id: 'amber', nama: 'Amber', top: '#4a2c12', mid: '#945a1e', bot: '#d4943a' },
    { id: 'biru', nama: 'Biru Safir', top: '#142442', mid: '#28528a', bot: '#5c94d4' },
    { id: 'hijau', nama: 'Zamrud', top: '#143228', mid: '#266852', bot: '#54a886' },
    { id: 'ungu', nama: 'Violet', top: '#281842', mid: '#563486', bot: '#9268c8' },
    { id: 'abu', nama: 'Abu-abu', top: '#242a34', mid: '#505c6e', bot: '#8c9ab0' }
  ];

  var TUBUH = [
    { id: 'normal', nama: 'Normal', bahu: 1.0, dada: 1.0, pinggang: 1.0, pinggul: 1.0, paha: 1.0, lengan: 1.0, pipi: 1.0 },
    { id: 'gendut', nama: 'Gendut', bahu: 1.14, dada: 1.18, pinggang: 1.38, pinggul: 1.24, paha: 1.26, lengan: 1.24, pipi: 1.08 },
    { id: 'atletis', nama: 'Atletis', bahu: 1.10, dada: 1.02, pinggang: 0.94, pinggul: 0.98, paha: 1.06, lengan: 1.08, pipi: 0.96 },
    { id: 'sexy', nama: 'Sexy', bahu: 0.98, dada: 1.22, pinggang: 0.86, pinggul: 1.20, paha: 1.10, lengan: 0.96, pipi: 0.98 }
  ];

  /* 30 Model Rambut Cewek (1-10: Sebahu & Kuncir, 11-20: Pendek & Bob, 21-30: Panjang & Kepang) */
  var NAMA_RAMBUT = [
    'Sebahu Kuncir Kanan', 'Sebahu Poni Rata', 'Sebahu Belah Tengah', 'Sebahu Side-Swept', 'Sebahu Layer Tipis',
    'Sebahu Kuncir Kiri', 'Sebahu Half-Up', 'Sebahu Gelombang', 'Sebahu Poni Tipis', 'Sebahu Wolfcut',
    'Bob Pendek Rapi', 'Bob Asimetris', 'Pixie Manis', 'Bob Poni Melengkung', 'Bob Keriting Halus',
    'Tomboy Berlayer', 'Bob Kuncir Mini', 'French Bob', 'Bob Belah Samping', 'Short Fluffy',
    'Panjang Lurus', 'Panjang Kuncir Kuda', 'Twin-Tails Tinggi', 'Twin-Tails Rendah', 'Kepang Samping',
    'Kepang Dua', 'Panjang Bergelombang', 'Hime Cut Elegan', 'Messy Bun Atas', 'Panjang Poni Tirai'
  ];

  /* 30 Model Mata, Alis, Hidung, Mulut */
  var NAMA_MATA = [
    'Almond Natural', 'Almond Hangat', 'Besar Lembut', 'Sipit Elegan', 'Bulat Ceria',
    'Tajam Cool', 'Sayu Manis', 'Lirik Samping', 'Bulu Mata Lentik', 'Polos Jernih',
    'Cat-Eye Halus', 'Puppy-Eye Imut', 'Dewasa Tenang', 'Cerah Berbinar', 'Sendu Lembut',
    'Tegas Berwibawa', 'Manis Berkilau', 'Natural Tipis', 'Almond Panjang', 'Bulat Hangat',
    'Tajam Misterius', 'Sayu Romantis', 'Lentik Ganda', 'Ceria Lebar', 'Kalem Rapi',
    'Kawaii Proporsional', 'Anggun Klasik', 'Sporty Fokus', 'Lembut Berbayang', 'Ekspresif'
  ];
  var NAMA_ALIS = [
    'Lengkung Natural', 'Lurus Korea', 'Tebal Rapi', 'Tipis Anggun', 'Tinggi Tegas',
    'Turun Lembut', 'Melengkung Tinggi', 'Pendek Imut', 'Panjang Halus', 'Tajam Cool',
    'Busur Klasik', 'Natural Berisi', 'Tipis Lurus', 'Ekspresif Naik', 'Kalem Datar',
    'Sudut Lembut', 'Tegas Runcing', 'Halus Meruncing', 'Ceria Terangkat', 'Sendu Miring',
    'Bulu Halus', 'Rapi Simetris', 'Lengkung Dalam', 'Tebal Pendek', 'Tipis Panjang',
    'Modern Clean', 'Lembut Pendek', 'Tegas Panjang', 'Alami', 'Elegan'
  ];
  var NAMA_HIDUNG = [
    'Titik Halus', 'Mancung Tipis', 'Imut Kecil', 'Garis Lurus', 'Bayang Lembut',
    'Minimalis', 'Runcing Halus', 'Bulat Manis', 'Tegas Klasik', 'Sedang Natural',
    'Titik Ganda', 'Garis Pendek', 'Mancung Lembut', 'Halus Pudar', 'Kecil Rapi',
    'Miring Kanan', 'Miring Kiri', 'Lurus Panjang', 'Tipis Pendek', 'Anime Klasik',
    'Realistis Halus', 'Segitiga Mini', 'Bayang Samping', 'Tegas Pendek', 'Manis Bulat',
    'Elegan Tipis', 'Natural Asia', 'Mancung Sedang', 'Lembut Polos', 'Bersih'
  ];
  var NAMA_MULUT = [
    'Senyum Manis', 'Senyum Lebar', 'Senyum Tipis', 'Netral Kalem', 'Smirk Cool',
    'Bibir Penuh', 'Imut Kecil', 'Ceria Terbuka', 'Kucing (:3)', 'Lembut Merona',
    'Senyum Miring', 'Polos Datar', 'Bibir Glossy', 'Senyum Malu', 'Tegas Rapi',
    'Senyum Hangat', 'Bibir Tipis', 'Tertawa Kecil', 'Pout Imut', 'Anggun',
    'Natural Peach', 'Senyum Dalam', 'Bibir Bawah Tebal', 'Ceria Lebar', 'Kalem Tipis',
    'Manis Terkatup', 'Senyum Berbinar', 'Lembut Terbuka', 'Ekspresif', 'Klasik'
  ];

  var PRESET = [
    { nama: 'Imut Kuncir', tubuh: 'normal', kulit: 'putih_asia', warnaRambut: 'hitam', warnaMata: 'espresso', rambut: 0, mata: 0, alis: 0, hidung: 0, mulut: 0 },
    { nama: 'Elegan Dewasa', tubuh: 'sexy', kulit: 'kuning_langsat', warnaRambut: 'cokelat_tua', warnaMata: 'hazel', rambut: 26, mata: 12, alis: 3, hidung: 1, mulut: 5 },
    { nama: 'Sporty Atletis', tubuh: 'atletis', kulit: 'sawo_terang', warnaRambut: 'chestnut', warnaMata: 'amber', rambut: 21, mata: 5, alis: 4, hidung: 3, mulut: 4 },
    { nama: 'Chubby Manis', tubuh: 'gendut', kulit: 'sawo_matang', warnaRambut: 'karamel', warnaMata: 'espresso', rambut: 10, mata: 4, alis: 1, hidung: 2, mulut: 7 },
    { nama: 'Eksotis Anggun', tubuh: 'sexy', kulit: 'hitam_legam', warnaRambut: 'hitam', warnaMata: 'hazel', rambut: 24, mata: 18, alis: 2, hidung: 8, mulut: 19 }
  ];

  function cari(arr, id) {
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return arr[0];
  }
  function clamp30(v) { var n = parseInt(v, 10); return isNaN(n) ? 0 : Math.max(0, Math.min(29, n)); }
  function normalisasi(tp) {
    tp = tp || {};
    return {
      tubuh: cari(TUBUH, tp.tubuh).id,
      kulit: cari(KULIT, tp.kulit).id,
      warnaRambut: cari(WARNA_RAMBUT, tp.warnaRambut).id,
      warnaMata: cari(WARNA_MATA, tp.warnaMata).id,
      rambut: clamp30(tp.rambut),
      mata: clamp30(tp.mata),
      alis: clamp30(tp.alis),
      hidung: clamp30(tp.hidung),
      mulut: clamp30(tp.mulut),
      atasan: tp.atasan || 'none',
      bawahan: tp.bawahan || 'none'
    };
  }
  function acak() {
    function pk(a) { return a[Math.floor(Math.random() * a.length)].id; }
    return {
      tubuh: pk(TUBUH), kulit: pk(KULIT), warnaRambut: pk(WARNA_RAMBUT), warnaMata: pk(WARNA_MATA),
      rambut: Math.floor(Math.random() * 30), mata: Math.floor(Math.random() * 30),
      alis: Math.floor(Math.random() * 30), hidung: Math.floor(Math.random() * 30),
      mulut: Math.floor(Math.random() * 30), atasan: 'none', bawahan: 'none'
    };
  }

  g.KK_KARAKTER_ED = {
    KULIT: KULIT, WARNA_RAMBUT: WARNA_RAMBUT, WARNA_MATA: WARNA_MATA, TUBUH: TUBUH,
    NAMA_RAMBUT: NAMA_RAMBUT, NAMA_MATA: NAMA_MATA, NAMA_ALIS: NAMA_ALIS, NAMA_HIDUNG: NAMA_HIDUNG, NAMA_MULUT: NAMA_MULUT,
    PRESET: PRESET, cari: cari, normalisasi: normalisasi, acak: acak
  };
})(window);
