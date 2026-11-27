/* teman.js — daftar Teman (teman, sahabat, pacar, mantan), 50 karakter bawaan (1990–2010),
   Bar HB semua karakter, pacaran antar teman (khusus lawan jenis / non-LGBT), pasangan keluar rumah, dan perselingkuhan. */
(function (g) {
  'use strict';
  var PERAN = { teman: 'Teman', sahabat: 'Sahabat', pacar: 'Pacar', mantan: 'Mantan' };
  var NAMA_L = ['Dimas', 'Rizky', 'Fajar', 'Bayu', 'Andre', 'Hendra', 'Yoga', 'Reza'];
  var NAMA_P = ['Sinta', 'Dewi', 'Maya', 'Rina', 'Putri', 'Nadia', 'Lestari', 'Wulan'];
  var HOTEL = 350000, MIN_HB = 70;

  /* 50 karakter bawaan (30 cewek & 20 cowok) kelahiran beragam 1990–2010 */
  var KARAKTER_BAWAAN = [
    /* 30 Karakter Cewek (1990–2010) */
    { id: 'npc_c01', nama: 'Nadia Kusuma', gender: 'cewek', tglLahir: '1990-04-12', peran: 'teman', kerja: 'Pegawai Bank', hub: 52, pr: 45, hb: 38 },
    { id: 'npc_c02', nama: 'Sinta Wulandari', gender: 'cewek', tglLahir: '1991-08-23', peran: 'sahabat', kerja: 'Perawat RS', hub: 66, pr: 55, hb: 42 },
    { id: 'npc_c03', nama: 'Dewi Anggraini', gender: 'cewek', tglLahir: '1992-02-17', peran: 'teman', kerja: 'Guru SD', hub: 48, pr: 40, hb: 30 },
    { id: 'npc_c04', nama: 'Maya Puspitasari', gender: 'cewek', tglLahir: '1992-11-05', peran: 'teman', kerja: 'Pengusaha Kuliner', hub: 55, pr: 48, hb: 45 },
    { id: 'npc_c05', nama: 'Rina Marlina', gender: 'cewek', tglLahir: '1993-06-29', peran: 'teman', kerja: 'Admin Kantor', hub: 50, pr: 42, hb: 35 },
    { id: 'npc_c06', nama: 'Putri Maharani', gender: 'cewek', tglLahir: '1994-01-14', peran: 'sahabat', kerja: 'Desainer Grafis', hub: 64, pr: 52, hb: 48 },
    { id: 'npc_c07', nama: 'Lestari Ningrum', gender: 'cewek', tglLahir: '1994-09-08', peran: 'teman', kerja: 'Apoteker', hub: 46, pr: 38, hb: 28 },
    { id: 'npc_c08', nama: 'Wulan Kartika', gender: 'cewek', tglLahir: '1995-03-21', peran: 'teman', kerja: 'Kasir Minimarket', hub: 54, pr: 46, hb: 40 },
    { id: 'npc_c09', nama: 'Ayu Pratiwi', gender: 'cewek', tglLahir: '1995-12-03', peran: 'teman', kerja: 'Marketing Properti', hub: 58, pr: 50, hb: 52 },
    { id: 'npc_c10', nama: 'Citra Permata', gender: 'cewek', tglLahir: '1996-05-19', peran: 'teman', kerja: 'Barista Kafe', hub: 60, pr: 54, hb: 44 },
    { id: 'npc_c11', nama: 'Intan Sari', gender: 'cewek', tglLahir: '1996-10-27', peran: 'teman', kerja: 'Bidan Klinik', hub: 45, pr: 35, hb: 32 },
    { id: 'npc_c12', nama: 'Dina Oktaviani', gender: 'cewek', tglLahir: '1997-07-11', peran: 'teman', kerja: 'Teller Bank', hub: 52, pr: 44, hb: 46 },
    { id: 'npc_c13', nama: 'Fitri Handayani', gender: 'cewek', tglLahir: '1998-02-04', peran: 'sahabat', kerja: 'Akuntan', hub: 65, pr: 58, hb: 38 },
    { id: 'npc_c14', nama: 'Tiara Ramadhani', gender: 'cewek', tglLahir: '1998-08-16', peran: 'teman', kerja: 'Owner Olshop', hub: 56, pr: 49, hb: 50 },
    { id: 'npc_c15', nama: 'Nabila Azzahra', gender: 'cewek', tglLahir: '1999-03-30', peran: 'teman', kerja: 'Content Creator', hub: 58, pr: 52, hb: 55 },
    { id: 'npc_c16', nama: 'Shinta Melati', gender: 'cewek', tglLahir: '1999-11-18', peran: 'teman', kerja: 'Resepsionis Hotel', hub: 50, pr: 43, hb: 41 },
    { id: 'npc_c17', nama: 'Vina Safitri', gender: 'cewek', tglLahir: '2000-04-25', peran: 'teman', kerja: 'Customer Service', hub: 49, pr: 41, hb: 36 },
    { id: 'npc_c18', nama: 'Rani Puspita', gender: 'cewek', tglLahir: '2000-09-12', peran: 'teman', kerja: 'Make Up Artist', hub: 53, pr: 47, hb: 49 },
    { id: 'npc_c19', nama: 'Gita Larasati', gender: 'cewek', tglLahir: '2001-01-28', peran: 'teman', kerja: 'Staf HRD', hub: 47, pr: 39, hb: 33 },
    { id: 'npc_c20', nama: 'Salsa Amelia', gender: 'cewek', tglLahir: '2001-06-15', peran: 'teman', kerja: 'Fotografer', hub: 55, pr: 48, hb: 44 },
    { id: 'npc_c21', nama: 'Bella Clarissa', gender: 'cewek', tglLahir: '2002-05-07', peran: 'teman', kerja: 'Model Katalog', hub: 51, pr: 46, hb: 54 },
    { id: 'npc_c22', nama: 'Yulia Rahmawati', gender: 'cewek', tglLahir: '2002-12-20', peran: 'teman', kerja: 'Mahasiswi S1', hub: 48, pr: 40, hb: 31 },
    { id: 'npc_c23', nama: 'Dinda Kirana', gender: 'cewek', tglLahir: '2003-03-09', peran: 'teman', kerja: 'Mahasiswi Ekonomi', hub: 54, pr: 45, hb: 43 },
    { id: 'npc_c24', nama: 'Aulia Putri', gender: 'cewek', tglLahir: '2003-10-02', peran: 'teman', kerja: 'Admin Marketplace', hub: 46, pr: 37, hb: 29 },
    { id: 'npc_c25', nama: 'Kirana Dewi', gender: 'cewek', tglLahir: '2004-07-19', peran: 'teman', kerja: 'Barista Part-Time', hub: 52, pr: 44, hb: 39 },
    { id: 'npc_c26', nama: 'Mela Febrianti', gender: 'cewek', tglLahir: '2005-02-14', peran: 'teman', kerja: 'Mahasiswi', hub: 45, pr: 36, hb: 34 },
    { id: 'npc_c27', nama: 'Syifa Nuraini', gender: 'cewek', tglLahir: '2006-08-26', peran: 'teman', kerja: 'Mahasiswi Baru', hub: 44, pr: 35, hb: 26 },
    { id: 'npc_c28', nama: 'Zahra Khairunnisa', gender: 'cewek', tglLahir: '2007-04-03', peran: 'teman', kerja: 'Mahasiswi Baru', hub: 42, pr: 33, hb: 22 },
    { id: 'npc_c29', nama: 'Keisha Amanda', gender: 'cewek', tglLahir: '2008-11-11', peran: 'teman', kerja: 'Pelajar SMA', hub: 40, pr: 30, hb: 15 },
    { id: 'npc_c30', nama: 'Nayla Salsabila', gender: 'cewek', tglLahir: '2010-05-22', peran: 'teman', kerja: 'Pelajar SMA', hub: 40, pr: 30, hb: 10 },
    /* 20 Karakter Cowok (1990–2010) */
    { id: 'npc_l01', nama: 'Dimas Pratama', gender: 'cowok', tglLahir: '1990-07-18', peran: 'sahabat', kerja: 'Mekanik Bengkel', hub: 68, pr: 50, hb: 44 },
    { id: 'npc_l02', nama: 'Rizky Ramadhan', gender: 'cowok', tglLahir: '1991-03-09', peran: 'teman', kerja: 'Driver Travel', hub: 60, pr: 45, hb: 48 },
    { id: 'npc_l03', nama: 'Fajar Nugroho', gender: 'cowok', tglLahir: '1992-09-25', peran: 'teman', kerja: 'Karyawan Swasta', hub: 52, pr: 38, hb: 36 },
    { id: 'npc_l04', nama: 'Bayu Setiawan', gender: 'cowok', tglLahir: '1993-01-11', peran: 'teman', kerja: 'Sales Mobil', hub: 55, pr: 42, hb: 50 },
    { id: 'npc_l05', nama: 'Andre Wijaya', gender: 'cowok', tglLahir: '1994-06-04', peran: 'sahabat', kerja: 'Pengusaha Bengkel', hub: 64, pr: 48, hb: 42 },
    { id: 'npc_l06', nama: 'Hendra Saputra', gender: 'cowok', tglLahir: '1995-10-20', peran: 'teman', kerja: 'Kurir Ekspedisi', hub: 50, pr: 36, hb: 39 },
    { id: 'npc_l07', nama: 'Yoga Mahendra', gender: 'cowok', tglLahir: '1996-02-15', peran: 'teman', kerja: 'Programmer', hub: 49, pr: 35, hb: 45 },
    { id: 'npc_l08', nama: 'Reza Pahlevi', gender: 'cowok', tglLahir: '1997-08-08', peran: 'teman', kerja: 'Barista', hub: 56, pr: 44, hb: 52 },
    { id: 'npc_l09', nama: 'Arif Hidayat', gender: 'cowok', tglLahir: '1998-04-27', peran: 'teman', kerja: 'Teknisi AC', hub: 51, pr: 39, hb: 37 },
    { id: 'npc_l10', nama: 'Bagas Kurniawan', gender: 'cowok', tglLahir: '1999-12-13', peran: 'teman', kerja: 'Fotografer', hub: 53, pr: 41, hb: 46 },
    { id: 'npc_l11', nama: 'Galih Santoso', gender: 'cowok', tglLahir: '2000-05-30', peran: 'teman', kerja: 'Ojol Senior', hub: 58, pr: 43, hb: 41 },
    { id: 'npc_l12', nama: 'Ilham Fauzi', gender: 'cowok', tglLahir: '2001-09-02', peran: 'teman', kerja: 'Editor Video', hub: 48, pr: 36, hb: 38 },
    { id: 'npc_l13', nama: 'Kevin Gunawan', gender: 'cowok', tglLahir: '2002-03-19', peran: 'teman', kerja: 'Mahasiswa IT', hub: 50, pr: 38, hb: 47 },
    { id: 'npc_l14', nama: 'Naufal Hakim', gender: 'cowok', tglLahir: '2003-11-06', peran: 'teman', kerja: 'Mahasiswa Teknik', hub: 47, pr: 35, hb: 35 },
    { id: 'npc_l15', nama: 'Raka Aditya', gender: 'cowok', tglLahir: '2004-06-23', peran: 'teman', kerja: 'Atlet Futsal', hub: 52, pr: 40, hb: 49 },
    { id: 'npc_l16', nama: 'Taufik Akbar', gender: 'cowok', tglLahir: '2005-01-17', peran: 'teman', kerja: 'Mahasiswa', hub: 46, pr: 34, hb: 33 },
    { id: 'npc_l17', nama: 'Bima Arya', gender: 'cowok', tglLahir: '2006-07-10', peran: 'teman', kerja: 'Mahasiswa Baru', hub: 45, pr: 33, hb: 28 },
    { id: 'npc_l18', nama: 'Daffa Alfarizi', gender: 'cowok', tglLahir: '2007-10-28', peran: 'teman', kerja: 'Mahasiswa Baru', hub: 43, pr: 31, hb: 24 },
    { id: 'npc_l19', nama: 'Farhan Maulana', gender: 'cowok', tglLahir: '2009-02-09', peran: 'teman', kerja: 'Pelajar SMA', hub: 41, pr: 30, hb: 15 },
    { id: 'npc_l20', nama: 'Rafi Alamsyah', gender: 'cowok', tglLahir: '2010-08-14', peran: 'teman', kerja: 'Pelajar SMA', hub: 40, pr: 28, hb: 10 }
  ];

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function batas(v) { return Math.max(0, Math.min(100, v)); }
  function usiaTeman(S, x) {
    try { return g.KK_KAL.usia(S.hari || 0, x.tglLahir || '1998-01-01'); } catch (e) { return 24; }
  }
  function normTeman(x) {
    if (!x) return;
    if (typeof x.hb !== 'number' || isNaN(x.hb)) x.hb = 30;
    if (typeof x.perasaan !== 'number' || isNaN(x.perasaan)) x.perasaan = x.hubungan || 40;
    if (x.gender !== 'cowok' && x.gender !== 'cewek') x.gender = 'cewek';
  }
  function siap(S) {
    if (!S.teman) S.teman = [];
    if (!S.seedTeman50) isiKarakterBawaan(S);
    S.teman.forEach(normTeman);
    validasiPasanganNpc(S);
    return S.teman;
  }
  function cari(S, id) { return (S.teman || []).filter(function (x) { return x.id === id; })[0]; }
  function pasanganList(S) { return (S.keluarga || []).filter(function (k) { return k.peran === 'istri' || k.peran === 'suami' || k.peran === 'pasangan'; }); }
  function anakList(S) { return (S.keluarga || []).filter(function (k) { return k.peran === 'anak'; }); }
  function nomorJam(S) { return S.hari * 24 + Math.floor(S.menit / 60); }

  /* lepas hubungan pacaran antar NPC pada karakter x */
  function lepasPacarNpc(S, x) {
    if (!x || !x.pacarId) return;
    var p = cari(S, x.pacarId);
    if (p && p.pacarId === x.id) { p.pacarId = null; p.pacarNama = ''; }
    x.pacarId = null; x.pacarNama = '';
  }
  /* validasi ketat: pacaran antar teman HANYA boleh lawan jenis (cowok × cewek, NO LGBT) */
  function validasiPasanganNpc(S) {
    var daf = S.teman || [];
    daf.forEach(function (a) {
      if (!a.pacarId) return;
      var b = cari(S, a.pacarId);
      if (!b || b.id === a.id || a.gender === b.gender || a.peran === 'pacar' || b.peran === 'pacar') {
        a.pacarId = null; a.pacarNama = '';
        if (b && b.pacarId === a.id) { b.pacarId = null; b.pacarNama = ''; }
      } else {
        a.pacarNama = b.nama;
        b.pacarId = a.id; b.pacarNama = a.nama;
      }
    });
  }
  /* isi 50 karakter bawaan (kelahiran 1990–2010) satu kali & pasangkan 6 pasangan heteroseksual awal */
  function isiKarakterBawaan(S) {
    S.teman = S.teman || [];
    var ada = {};
    S.teman.forEach(function (x) { ada[x.id] = true; });
    KARAKTER_BAWAAN.forEach(function (k) {
      if (ada[k.id]) return;
      S.teman.push({
        id: k.id, nama: k.nama, gender: k.gender, peran: k.peran || 'teman',
        tglLahir: k.tglLahir, kerja: k.kerja || '',
        hubungan: k.hub, perasaan: k.pr, hb: k.hb,
        pacarId: null, pacarNama: '', interaksiHari: -1
      });
    });
    /* 6 pasangan pacaran awal antar teman (strictly cowok × cewek) */
    var pasangAwal = [
      ['npc_l01', 'npc_c01'], ['npc_l03', 'npc_c03'], ['npc_l05', 'npc_c07'],
      ['npc_l07', 'npc_c11'], ['npc_l10', 'npc_c17'], ['npc_l13', 'npc_c22']
    ];
    pasangAwal.forEach(function (pr) {
      var a = cari(S, pr[0]), b = cari(S, pr[1]);
      if (a && b && a.gender !== b.gender && !a.pacarId && !b.pacarId && a.peran !== 'pacar' && b.peran !== 'pacar') {
        a.pacarId = b.id; a.pacarNama = b.nama;
        b.pacarId = a.id; b.pacarNama = a.nama;
      }
    });
    S.seedTeman50 = true;
  }

  function tambah(S, nama, gender, peran, tglLahir, tampilan) {
    nama = String(nama || '').trim().slice(0, 24);
    if (!nama) return 'Isi nama dulu.';
    var gChar = gender === 'cowok' ? 'cowok' : 'cewek';
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    if (!PERAN[peran] || peran === 'mantan') peran = 'teman';
    if (peran === 'pacar' && gChar === gPem) return 'Pacaran hanya bisa dengan lawan jenis.';
    var x = { id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 999), nama: nama, gender: gChar, peran: peran,
      tglLahir: tglLahir || '1998-01-01', hubungan: peran === 'pacar' ? 60 : peran === 'sahabat' ? 65 : 45,
      perasaan: peran === 'pacar' ? 65 : peran === 'sahabat' ? 45 : 25, hb: 30, pacarId: null, pacarNama: '', interaksiHari: -1,
      tampilan: tampilan || null };
    siap(S).push(x);
    return { ok: true, teks: nama + ' ditambahkan sebagai ' + PERAN[peran].toLowerCase() + '.' };
  }
  function ubahPeran(S, id, peran) {
    var x = cari(S, id); if (!x) return 'Tidak ditemukan.';
    if (!PERAN[peran]) return 'Peran tidak dikenal.';
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    if (peran === 'pacar' && x.gender === gPem) return 'Pacaran hanya bisa dengan lawan jenis.';
    if (peran === 'pacar' && x.pacarId) lepasPacarNpc(S, x);
    x.peran = peran;
    return { ok: true, teks: x.nama + ' sekarang ' + PERAN[peran].toLowerCase() + '.' };
  }
  function ubahNama(S, id, nama) {
    var x = cari(S, id); nama = String(nama || '').trim().slice(0, 24);
    if (!x) return 'Tidak ditemukan.'; if (!nama) return 'Nama tidak boleh kosong.';
    x.nama = nama;
    if (x.pacarId) { var p = cari(S, x.pacarId); if (p) p.pacarNama = nama; }
    return { ok: true, teks: 'Nama diubah menjadi ' + nama + '.' };
  }
  function ubahTtl(S, id, ttl) { var x = cari(S, id); if (!x) return 'Tidak ditemukan.'; if (!/^\d{4}-\d{2}-\d{2}$/.test(ttl || '')) return 'Tanggal lahir tidak valid.'; x.tglLahir = ttl; return { ok: true, teks: 'Tanggal lahir ' + x.nama + ' disimpan.' }; }
  function hapus(S, id) {
    var x = cari(S, id);
    if (x) lepasPacarNpc(S, x);
    S.teman = siap(S).filter(function (t) { return t.id !== id; });
    return true;
  }

  /* interaksi: hubungi (gratis, sekali sehari), traktir (Rp50.000), ribut */
  function interaksi(S, id, jenis, bayar) {
    var x = cari(S, id); if (!x) return 'Tidak ditemukan.';
    if (jenis === 'hubungi') {
      if (x.interaksiHari === S.hari) return 'Kamu sudah menghubungi ' + x.nama + ' hari ini.';
      x.interaksiHari = S.hari;
      var naik = x.hubungan < 30 && Math.random() < 0.4 ? 1 : 5; x.hubungan = Math.min(100, x.hubungan + naik);
      x.perasaan = Math.min(100, (x.perasaan == null ? 30 : x.perasaan) + 4);
      x.hb = batas((x.hb == null ? 30 : x.hb) + 3);
      return { ok: true, teks: 'Ngobrol dengan ' + x.nama + '. Hubungan ' + Math.round(x.hubungan) + '% · Perasaan ' + Math.round(x.perasaan) + '%.' };
    }
    if (jenis === 'traktir') {
      if (!bayar(50000, 'Traktir ' + x.nama)) return 'Uang tidak cukup untuk traktir (Rp50.000).';
      x.hubungan = Math.min(100, x.hubungan + 10);
      x.perasaan = Math.min(100, (x.perasaan == null ? 30 : x.perasaan) + 10);
      x.hb = batas((x.hb == null ? 30 : x.hb) + 6);
      return { ok: true, teks: 'Traktir ' + x.nama + ' Rp50.000. Hubungan ' + Math.round(x.hubungan) + '% · Perasaan ' + Math.round(x.perasaan) + '%.' };
    }
    if (jenis === 'ribut') { x.hubungan = Math.max(0, x.hubungan - 20); x.perasaan = Math.max(0, (x.perasaan == null ? 30 : x.perasaan) - 18); return { ok: true, teks: 'Kamu ribut dengan ' + x.nama + '. Hubungan ' + Math.round(x.hubungan) + '%.' }; }
    return 'Aksi tidak dikenal.';
  }
  function tambahMantan(S, kl, alasan) {
    var x = { id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 999), nama: kl.nama, gender: kl.gender || 'cewek', peran: 'mantan', tglLahir: kl.tglLahir || '1998-01-01',
      hubungan: Math.max(5, Math.min(70, Math.round((kl.bahagia || 60) - (/selingkuh/i.test(alasan || '') ? 45 : 25)))), perasaan: 25, hb: 35, pacarId: null, pacarNama: '', interaksiHari: -1 };
    siap(S).push(x); return x;
  }

  /* harian: dinamika kehidupan NPC (HB pasangan rutin turun, nikah, hamil, melahirkan bayi baru, sakit, & mortalitas realistis < angka kelahiran) */
  function postFeedNpc(S, teks, plat) {
    S.sosmedFeed = S.sosmedFeed || [];
    S.sosmedFeed.unshift({ hari: S.hari || 0, plat: plat || 'ig', penulis: 'Warga & Teman', teks: teks, suka: 15 + Math.floor(Math.random() * 140) });
    if (S.sosmedFeed.length > 35) S.sosmedFeed.length = 35;
  }
  function gantiHari(S, nLama, nBaru) {
    var daf = siap(S), kabar = [];
    if (!daf.length) return kabar;
    var sudahCek = {}, meninggalIds = [], lahirBaru = [];
    var tB = g.KK_KAL ? g.KK_KAL.tgl(nBaru) : { y: 2026, m: 1, d: 1 };
    var tglHariIni = tB.y + '-' + (tB.m < 10 ? '0' : '') + tB.m + '-' + (tB.d < 10 ? '0' : '') + tB.d;
    daf.forEach(function (x) {
      var u = usiaTeman(S, x);
      /* sakit & pemulihan NPC */
      if (x.sakitSampai && nBaru >= x.sakitSampai) x.sakitSampai = 0;
      else if (!x.sakitSampai && Math.random() < 0.004) x.sakitSampai = nBaru + 2 + Math.floor(Math.random() * 4);
      if (u >= 17) {
        var tambahHb = x.pacarId ? (4 + Math.floor(Math.random() * 6)) : (6 + Math.floor(Math.random() * 9));
        if (x.sakitSampai) tambahHb = Math.floor(tambahHb * 0.3);
        x.hb = batas((x.hb == null ? 30 : x.hb) + tambahHb);
      }
      /* proses persalinan NPC yang sedang hamil (270 hari) */
      if (x.hamil && nBaru >= x.hamil.lahirPada) {
        var genderBayi = Math.random() < 0.5 ? 'cowok' : 'cewek';
        var namaBayi = (genderBayi === 'cowok' ? acak(['Kenzo', 'Arka', 'Alvaro', 'Rayyan', 'Zidan', 'Rafka']) : acak(['Alesha', 'Aisyah', 'Kayla', 'Mikayla', 'Naira', 'Zara'])) + ' ' + (x.nama.split(' ')[1] || 'Pratama');
        lahirBaru.push({
          id: 'npc_b' + nBaru + '_' + Math.floor(Math.random() * 999),
          nama: namaBayi, gender: genderBayi, peran: 'teman',
          tglLahir: tglHariIni, kerja: 'Balita / Anak Teman',
          hubungan: 35, perasaan: 30, hb: 0, pacarId: null, pacarNama: '', interaksiHari: -1,
          orangTua: x.nama + (x.pacarNama ? ' & ' + x.pacarNama : '')
        });
        x.hamil = null;
        S.popDelta = (S.popDelta || 0) + 1;
        var teksLahir = '👶 Kabar bahagia! ' + x.nama + (x.pacarNama ? ' & ' + x.pacarNama : '') + ' baru saja melahirkan bayi ' + (genderBayi === 'cowok' ? 'laki-laki' : 'perempuan') + ' bernama ' + namaBayi + '!';
        kabar.push(teksLahir);
        postFeedNpc(S, teksLahir, 'fb');
      }
      /* update pasangan NPC yang sudah pacaran / menikah (khusus lawan jenis) */
      if (x.pacarId && !sudahCek[x.id]) {
        var p = cari(S, x.pacarId);
        if (p && p.gender !== x.gender) {
          sudahCek[x.id] = true; sudahCek[p.id] = true;
          var uP = usiaTeman(S, p);
          /* pasangan yang pacaran/menikah rutin HB bareng sehingga HB teman tidak menumpuk 100% terus */
          if ((x.hb || 0) >= 55 && (p.hb || 0) >= 55 && !x.sakitSampai && !p.sakitSampai && Math.random() < (x.menikah ? 0.78 : 0.65)) {
            x.hb = Math.max(8, (x.hb || 50) - (48 + Math.floor(Math.random() * 18)));
            p.hb = Math.max(8, (p.hb || 50) - (48 + Math.floor(Math.random() * 18)));
            /* peluang hamil bagi pasangan menikah (usia 20-40) */
            var ibu = x.gender === 'cewek' ? x : p;
            var uIbu = usiaTeman(S, ibu);
            if (x.menikah && !ibu.hamil && uIbu >= 20 && uIbu <= 40 && Math.random() < 0.035) {
              ibu.hamil = { mulai: nBaru, lahirPada: nBaru + 270 };
              var teksHamil = '🤰 Kabar gembira: ' + x.nama + ' & ' + p.nama + ' sedang menantikan buah hati!';
              kabar.push(teksHamil);
              postFeedNpc(S, teksHamil, 'ig');
            }
          }
          /* peluang menikah bagi pasangan pacaran dewasa (usia >= 22) */
          if (!x.menikah && u >= 22 && uP >= 22 && Math.random() < 0.014) {
            x.menikah = true; p.menikah = true;
            x.nikahHari = nBaru; p.nikahHari = nBaru;
            var teksNikah = '💍 Selamat! Temanmu ' + x.nama + ' & ' + p.nama + ' resmi menikah hari ini!';
            kabar.push(teksNikah);
            postFeedNpc(S, teksNikah, 'ig');
          } else if (!x.menikah && Math.random() < 0.022) {
            lepasPacarNpc(S, x);
            kabar.push('💔 Kabar teman: ' + x.nama + ' & ' + p.nama + ' baru saja putus.');
          }
        }
      }
      /* peluang kematian realistis sangat kecil (< angka kelahiran), hanya untuk NPC biasa (bukan pacar pemain) & usia/sakit */
      var peluangWafat = (x.peran === 'pacar' || daf.length <= 35) ? 0 : (u >= 58 ? 0.0007 : (x.sakitSampai ? 0.00045 : 0.00008));
      if (peluangWafat > 0 && Math.random() < peluangWafat) {
        meninggalIds.push(x.id);
        S.popDelta = (S.popDelta || 0) - 1;
        var teksDuka = '🕊️ Berita duka: Temanmu ' + x.nama + ' (' + u + ' thn) telah berpulang karena ' + (x.sakitSampai ? 'sakit' : 'faktor usia/kesehatan') + '.';
        kabar.push(teksDuka);
        postFeedNpc(S, teksDuka, 'fb');
      }
    });
    if (meninggalIds.length) {
      meninggalIds.forEach(function (mid) {
        var xm = cari(S, mid);
        if (xm) lepasPacarNpc(S, xm);
      });
      S.teman = S.teman.filter(function (t) { return meninggalIds.indexOf(t.id) < 0; });
      daf = S.teman;
    }
    if (lahirBaru.length) {
      lahirBaru.forEach(function (b) { if (S.teman.length < 95) S.teman.push(b); });
    }
    /* peluang terbentuk pasangan baru antar teman jomblo (strictly cowok × cewek, usia >= 17) */
    var jombloL = daf.filter(function (x) { return x.gender === 'cowok' && !x.pacarId && x.peran !== 'pacar' && usiaTeman(S, x) >= 17; });
    var jombloP = daf.filter(function (x) { return x.gender === 'cewek' && !x.pacarId && x.peran !== 'pacar' && usiaTeman(S, x) >= 17; });
    var jumlahPacaran = daf.filter(function (x) { return !!x.pacarId; }).length;
    if (jombloL.length && jombloP.length && jumlahPacaran < Math.floor(daf.length * 0.62) && Math.random() < 0.24) {
      var l = acak(jombloL), uL = usiaTeman(S, l);
      var cocokP = jombloP.filter(function (p) { return Math.abs(usiaTeman(S, p) - uL) <= 8; });
      var p = cocokP.length ? acak(cocokP) : acak(jombloP);
      if (l && p && l.gender === 'cowok' && p.gender === 'cewek') {
        l.pacarId = p.id; l.pacarNama = p.nama;
        p.pacarId = l.id; p.pacarNama = l.nama;
        kabar.push('💑 Kabar teman: ' + l.nama + ' & ' + p.nama + ' sekarang resmi pacaran!');
      }
    }
    return kabar;
  }

  /* ---------- pasangan keluar rumah dan selingkuh ---------- */
  function hubunganKl(kl) { return kl.bahagia == null ? 80 : kl.bahagia; }
  function sedangKeluar(kl, S) { return !!(kl && kl.keluar && nomorJam(S) < kl.keluar.sampai); }
  function tolakHb(S, id) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0]; if (!kl) return;
    kl.tolak = (kl.tolak || 0) + 1; kl.bahagia = Math.max(0, hubunganKl(kl) - 6);
    kl.perasaan = Math.max(0, (kl.perasaan == null ? 70 : kl.perasaan) - 8);
  }
  function resetTolak(S, id) { var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0]; if (kl) kl.tolak = 0; }
  function izinKerja(S, id, nilai) { var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0]; if (!kl) return 'Tidak ditemukan.'; kl.izinKerja = !!nilai; return { ok: true, teks: kl.nama + (nilai ? ' boleh bekerja di siang hari (hari kerja).' : ' tidak lagi bekerja.') }; }

  function kirimPulang(S, id) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl) return 'Tidak ditemukan.';
    if (!sedangKeluar(kl, S)) return kl.nama + ' sudah di rumah.';
    var bahagia = hubunganKl(kl);
    var mau = kl.keluar.alasan === 'kerja' ? false : (bahagia >= 55 ? true : Math.random() < bahagia / 100);
    if (kl.keluar.alasan === 'kerja') return kl.nama + ' sedang bekerja, pulang nanti sore.';
    if (!mau) { kl.bahagia = Math.max(0, bahagia - 5); return kl.nama + ' membangkang: "Nanti aja, aku belum mau pulang!"'; }
    var bareng = kl.keluar.anak || [];
    kl.keluar = null; anakList(S).forEach(function (a) { if (a.keluar && bareng.indexOf(a.id) >= 0) a.keluar = null; });
    return { ok: true, teks: kl.nama + ' pulang ke rumah.' };
  }
  function konfrontasi(S, id, pilihan, ceraiFn) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0];
    if (!kl || !kl.ketahuan) return 'Tidak ada yang perlu dibahas.';
    if (pilihan === 'cerai') { var r = ceraiFn(S, id, 'Pasangan selingkuh'); return r && r.ok ? { ok: true, teks: r.teks } : r; }
    kl.ketahuan = null; kl.tolak = 0; kl.bahagia = Math.min(70, Math.max(40, hubunganKl(kl)));
    return { ok: true, teks: 'Kamu memaafkan ' + kl.nama + '. Hubungan membaik pelan-pelan.' };
  }

  /* dipanggil tiap menit permainan; bertindak sekali per jam. Mengembalikan daftar kabar dan dapat mengisi S.popupSelingkuh */
  function jalan(S) {
    var jamNo = nomorJam(S); if (S.temanJam === jamNo) return [];
    S.temanJam = jamNo; var kabar = [];
    var h = Math.floor(S.menit / 60) % 24, dow = (KAL_dow(S) || 0), dirumah = S.diri && S.diri.posisi === 'kos';
    anakList(S).forEach(function (a) { if (a.keluar && jamNo >= a.keluar.sampai) a.keluar = null; });
    pasanganList(S).forEach(function (p) {
      if (p.keluar && jamNo >= p.keluar.sampai) { var ber = p.keluar.anak || []; anakList(S).forEach(function (a) { if (ber.indexOf(a.id) >= 0) a.keluar = null; }); p.keluar = null; }
      if (p.tamu && jamNo >= p.tamu.sampai) p.tamu = null;
      if (p.keluar || p.tamu || p.sakit || p.lokasi === 'kedai') return;
      var bahagia = hubunganKl(p), tolak = p.tolak || 0;
      /* bekerja kalau diizinkan */
      if (p.kerja && dow >= 1 && dow <= 5 && h === 8) { p.keluar = { alasan: 'kerja', sampai: jamNo + 8, anak: [] }; return; }
      /* selingkuh karena sering ditolak atau hubungan buruk (hanya dengan lawan jenis) */
      if ((tolak >= 3 || bahagia < 35) && h >= 10 && h <= 22) {
        var peluang = Math.min(0.3, 0.04 * Math.max(0, tolak - 2) + (bahagia < 35 ? 0.06 : 0));
        if (Math.random() < peluang) {
          var lawan = (p.gender === 'cewek') ? acak(NAMA_L) : acak(NAMA_P);
          var rumah = !dirumah && Math.random() < 0.5;
          var info = { dengan: lawan, tempat: rumah ? 'rumah' : 'hotel', hari: S.hari, jam: S.menit % 1440 };
          if (rumah) p.tamu = { sampai: jamNo + 2, dengan: lawan }; else p.keluar = { alasan: 'selingkuh', tempat: 'hotel', sampai: jamNo + 2, dengan: lawan, anak: [] };
          p.bahagia = Math.min(100, bahagia + 8); p.hb = 0;
          if (!dirumah) { p.ketahuan = info; S.popupSelingkuh = { id: p.id, nama: p.nama, dengan: lawan, tempat: info.tempat, jamNo: jamNo }; kabar.push('📱 Ada kiriman klip: ' + p.nama + ' terlihat bersama orang lain.'); }
          return;
        }
      }
      /* keluar biasa */
      if (bahagia < 40 && h >= 10 && h <= 21 && Math.random() < 0.12) { p.keluar = { alasan: 'jalan', sampai: jamNo + 2 + Math.floor(Math.random() * 2), anak: [] }; return; }
      if (bahagia >= 60 && ((h >= 13 && h <= 16) || (h >= 19 && h <= 21)) && Math.random() < 0.05) {
        var bawa = Math.random() < 0.5 ? anakList(S).filter(function (a) { return !a.sakit && a.lokasi !== 'kedai' && !a.keluar; }).map(function (a) { return a.id; }) : [];
        p.keluar = { alasan: 'nongkrong', sampai: jamNo + 2 + Math.floor(Math.random() * 2), anak: bawa };
        anakList(S).forEach(function (a) { if (bawa.indexOf(a.id) >= 0) a.keluar = { alasan: 'ikut', sampai: p.keluar.sampai }; });
      }
    });
    return kabar;
  }
  function KAL_dow(S) { try { return g.KK_KAL.tgl(S.hari).dow; } catch (e) { return 0; } }
  function alasanTeks(kl) {
    if (!kl.keluar) return '';
    var a = kl.keluar.alasan;
    return a === 'kerja' ? 'sedang bekerja' : a === 'nongkrong' ? 'sedang nongkrong dengan temannya' : a === 'jalan' ? 'sedang jalan-jalan' : 'belum pulang';
  }
  /* saat pemain tiba di rumah: pasangan yang ada tamu akan memergoki */
  function cekPulang(S) {
    var kabar = [];
    pasanganList(S).forEach(function (p) {
      if (p.tamu && nomorJam(S) < p.tamu.sampai) {
        p.ketahuan = { dengan: p.tamu.dengan, tempat: 'rumah', hari: S.hari, jam: S.menit % 1440 }; p.tamu = null;
        S.diri.rasaBersalah = S.diri.rasaBersalah || 0;
        kabar.push('😳 Kamu pulang dan memergoki ' + p.nama + ' bersama ' + p.ketahuan.dengan + ' di rumah.');
      } else if (sedangKeluar(p, S)) kabar.push(p.nama + ' ' + alasanTeks(p) + '.');
    });
    return kabar;
  }

  /* undang teman/sahabat/pacar/mantan ke rumah:
     - hubungan < 30% biasanya menolak, KECUALI bar HB teman sudah 100% (tetap mau walau hubungan 0%) */
  function undangKeRumah(S, id) {
    var x = cari(S, id); if (!x) return 'Kontak tidak ditemukan.';
    if (S.diri && S.diri.posisi !== 'kos') return 'Pulang dulu ke rumah/kos sebelum mengundang tamu.';
    if (S.tamuRumah && S.tamuRumah.id === x.id && S.tamuRumah.hari === S.hari) return x.nama + ' sudah sedang bertamu di rumahmu.';
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    var hbPenuh = (x.hb || 0) >= 100 && usiaTeman(S, x) >= 18 && x.gender !== gPem;
    if (!hbPenuh && (x.hubungan || 0) < 30) {
      return x.nama + ' menolak undanganmu ("Maaf, kita belum terlalu dekat..."). Butuh hubungan minimal 30% (atau Bar HB 100%).';
    }
    S.tamuRumah = {
      id: x.id, nama: x.nama, gender: x.gender, peran: x.peran,
      hari: S.hari, sampaiJam: (S.menit % 1440) + 180, tampilan: x.tampilan || null
    };
    x.hubungan = Math.min(100, (x.hubungan || 0) + 4);
    return { ok: true, teks: hbPenuh && (x.hubungan || 0) < 30
      ? '🔥 Bar HB ' + x.nama + ' sedang 100% — langsung menerima undangan dan datang ke rumahmu!'
      : '🏠 ' + x.nama + ' datang bertamu ke rumahmu! (Hubungan ' + Math.round(x.hubungan) + '%).' };
  }
  function pulangkanTamu(S) {
    if (!S.tamuRumah) return 'Tidak ada tamu di rumah.';
    var nm = S.tamuRumah.nama;
    S.tamuRumah = null;
    return { ok: true, teks: nm + ' pamit pulang ke rumahnya.' };
  }

  /* HB dengan teman/pacar/mantan: lawan jenis & usia >= 18; butuh hubungan > 70% KECUALI Bar HB 100% */
  function syaratHb(S, id) {
    var x = cari(S, id); if (!x) return 'Tidak ditemukan.';
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    if (x.gender === gPem) return 'HB hanya bisa dilakukan dengan lawan jenis.';
    if (usiaTeman(S, x) < 18) return x.nama + ' masih di bawah 18 tahun.';
    if ((x.hb || 0) < 100 && x.hubungan <= MIN_HB) return 'Hubungan dengan ' + x.nama + ' baru ' + Math.round(x.hubungan) + '%. Butuh di atas ' + MIN_HB + '% (atau Bar HB 100%).';
    return x;
  }

  g.KK_TEMAN = { PERAN: PERAN, HOTEL: HOTEL, MIN_HB: MIN_HB, KARAKTER_BAWAAN: KARAKTER_BAWAAN,
    tambah: tambah, ubahPeran: ubahPeran, ubahNama: ubahNama, ubahTtl: ubahTtl, hapus: hapus, interaksi: interaksi, tambahMantan: tambahMantan,
    isiKarakterBawaan: isiKarakterBawaan, lepasPacarNpc: lepasPacarNpc, validasiPasanganNpc: validasiPasanganNpc, gantiHari: gantiHari,
    undangKeRumah: undangKeRumah, pulangkanTamu: pulangkanTamu,
    cari: cari, siap: siap, tolakHb: tolakHb, resetTolak: resetTolak, izinKerja: izinKerja, kirimPulang: kirimPulang, konfrontasi: konfrontasi, jalan: jalan, cekPulang: cekPulang,
    sedangKeluar: sedangKeluar, alasanTeks: alasanTeks, syaratHb: syaratHb, hubunganKl: hubunganKl, rp: rp };
})(window);
