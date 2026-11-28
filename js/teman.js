/* teman.js — daftar Teman (teman, sahabat, pacar, mantan) murni dari APK Meet di APK Chat (tanpa profil bawaan),
   Bar HB semua karakter, pacaran antar teman (khusus lawan jenis / non-LGBT), pasangan keluar rumah, dan perselingkuhan. */
(function (g) {
  'use strict';
  var PERAN = { teman: 'Teman', sahabat: 'Sahabat', pacar: 'Pacar', mantan: 'Mantan' };
  var NAMA_L = ['Dimas', 'Rizky', 'Fajar', 'Bayu', 'Andre', 'Hendra', 'Yoga', 'Reza', 'Arif', 'Bagas', 'Galih', 'Ilham', 'Kevin', 'Naufal', 'Raka', 'Taufik', 'Bima', 'Daffa', 'Farhan', 'Aldi', 'Gilang', 'Rian', 'Wahyu', 'Satria'];
  var NAMA_P = ['Sinta', 'Dewi', 'Maya', 'Rina', 'Putri', 'Nadia', 'Lestari', 'Wulan', 'Ayu', 'Citra', 'Intan', 'Dina', 'Fitri', 'Tiara', 'Nabila', 'Vina', 'Rani', 'Gita', 'Salsa', 'Bella', 'Yulia', 'Dinda', 'Aulia', 'Kirana', 'Syifa', 'Zahra'];
  var MARGA_POOL = ['Kusuma', 'Pratama', 'Wulandari', 'Ramadhan', 'Anggraini', 'Nugroho', 'Puspitasari', 'Setiawan', 'Maharani', 'Wijaya', 'Saputra', 'Permata', 'Mahendra', 'Handayani', 'Kurniawan', 'Azzahra', 'Santoso', 'Safitri', 'Gunawan', 'Larasati', 'Hakim', ' Amelia', 'Rahmawati', 'Alfarizi'];
  var KERJA_CEWEK = ['Perawat RS', 'Pegawai Bank', 'Barista Kafe', 'Mahasiswi S1', 'Desainer Grafis', 'Guru SD', 'Apoteker', 'Content Creator', 'Admin Kantor', 'Teller Bank', 'Make Up Artist', 'Owner Olshop', 'Customer Service', 'Staf HRD', 'Fotografer', 'Bidan Klinik', 'Akuntan', 'Dokter Muda'];
  var KERJA_COWOK = ['Mekanik Bengkel', 'Karyawan Swasta', 'Programmer', 'Barista Kafe', 'Fotografer', 'Mahasiswa Teknik', 'Sales Otomotif', 'Kurir Ekspedisi', 'Editor Video', 'Pengusaha Kuliner', 'Teknisi Jaringan', 'Arsitek Muda', 'Staf Logistik', 'Pegawai BUMN', 'Guru Olahraga', 'Desainer UI/UX'];
  var BIO_MEET = [
    'Baru pindah ke daerah sini, cari teman ngobrol & kulineran malam.',
    'Suka kopi susu sore habis pulang kerja, salam kenal ya!',
    'Anak rantau, senang nambah kenalan baru yang asik & positif.',
    'Hobi jalan sore keliling kota & berburu jajanan kaki lima.',
    'Kerja kadang padat, senang kalau ada teman cerita yang nyambung.',
    'Suka nonton film, dengerin musik akustik, & nongkrong santai.',
    'Pekerja keras tapi tetap nyempetin olahraga tiap akhir pekan.',
    'Santai, ramah, gak suka drama. Yuk kenalan di Meet!',
    'Suka traveling antarkota & foto pemandangan jalanan.',
    'Lagi cari teman diskusi bisnis, karir, atau sekadar ngopi bareng.'
  ];
  var KULIT_OPSI = ['putih', 'kuning', 'sawo', 'cokelat'];
  var RAMBUT_CWK = ['panjang', 'gelombang', 'bob', 'kuncir', 'poni', 'hijab'];
  var RAMBUT_LKI = ['rapi', 'koma', 'undercut', 'ikal'];
  var WARNA_RAMBUT_OPSI = ['hitam', 'cokelat_tua', 'cokelat'];
  var MATA_OPSI = ['cerah', 'lembut', 'tajam', 'sipit'];
  var MULUT_OPSI = ['senyum', 'kalem', 'mungil', 'lebar'];
  var HOTEL = 350000, MIN_HB = 70;

  /* P78 (Poin 11): Semua 50 karakter bawaan dihapus total — kontak mulai dari 0 dan hanya bertambah lewat APK Meet di APK Chat */
  var KARAKTER_BAWAAN = [];

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
    /* Migrasi P78: bersihkan semua karakter bawaan lama agar kontak murni berasal dari APK Meet (atau mantan pasangan sah) */
    if (!S._hapusTemanBawaanP78) {
      S.teman = S.teman.filter(function (x) {
        return x && (x.dariMeet === true || x.peran === 'mantan');
      });
      S._hapusTemanBawaanP78 = true;
    }
    S.seedTeman50 = true;
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
  /* tidak lagi mengisi karakter bawaan otomatis; kontak hanya bertambah dari APK Meet */
  function isiKarakterBawaan(S) {
    S.teman = S.teman || [];
    S.seedTeman50 = true;
  }

  /* ---------- P78 (Poin 11): APK Meet di dalam APK Chat ---------- */
  function buatNamaUnikMeet(S, gender, dipakaiMap) {
    var depan = gender === 'cowok' ? NAMA_L : NAMA_P;
    for (var coba = 0; coba < 40; coba++) {
      var nm = acak(depan) + ' ' + String(acak(MARGA_POOL)).replace(/^\s+/, '');
      if (g.KK_NAMA && g.KK_NAMA.acak && coba < 12) {
        var nmGen = g.KK_NAMA.acak(S, { gender: gender });
        if (nmGen) nm = nmGen;
      }
      var kLow = nm.toLowerCase();
      if (!dipakaiMap[kLow]) {
        dipakaiMap[kLow] = true;
        return nm.slice(0, 24);
      }
    }
    var cad = acak(depan) + ' ' + (10 + Math.floor(Math.random() * 89));
    dipakaiMap[cad.toLowerCase()] = true;
    return cad;
  }

  function daftarMeet(S, paksaAcak) {
    siap(S);
    S.meet = S.meet || { hari: -1, kandidat: [] };
    if (!paksaAcak && S.meet.hari === S.hari && S.meet.kandidat && S.meet.kandidat.length) {
      /* sinkronkan status sudah berteman jika ada perubahan */
      var adaUid = {}, adaNama = {};
      (S.teman || []).forEach(function (t) {
        if (t.meetUid) adaUid[t.meetUid] = true;
        if (t.nama) adaNama[t.nama.toLowerCase()] = true;
      });
      S.meet.kandidat.forEach(function (k) {
        if (adaUid[k.uid] || adaNama[String(k.nama || '').toLowerCase()]) k.ditambahkan = true;
      });
      return S.meet.kandidat;
    }
    var dipakai = {};
    (S.teman || []).forEach(function (t) { if (t && t.nama) dipakai[t.nama.toLowerCase()] = true; });
    (S.keluarga || []).forEach(function (kl) { if (kl && kl.nama) dipakai[kl.nama.toLowerCase()] = true; });
    var thnSkrg = g.KK_KAL ? g.KK_KAL.tgl(S.hari || 0).y : 2026;
    var list = [], seri = (S.meet.seri || 0) + 1;
    for (var i = 0; i < 18; i++) {
      var gd = i < 10 ? 'cewek' : 'cowok';
      var usia = 18 + Math.floor(Math.random() * 16);
      var bln = 1 + Math.floor(Math.random() * 12);
      var tgl = 1 + Math.floor(Math.random() * 28);
      var ttl = (thnSkrg - usia) + '-' + (bln < 10 ? '0' : '') + bln + '-' + (tgl < 10 ? '0' : '') + tgl;
      var nm = buatNamaUnikMeet(S, gd, dipakai);
      list.push({
        uid: 'meet_' + (S.hari || 0) + '_' + seri + '_' + i,
        nama: nm,
        gender: gd,
        usia: usia,
        tglLahir: ttl,
        kerja: gd === 'cowok' ? acak(KERJA_COWOK) : acak(KERJA_CEWEK),
        bio: acak(BIO_MEET),
        jarakKm: Math.round((0.4 + Math.random() * 11.6) * 10) / 10,
        online: Math.random() < 0.78,
        sapaan: false,
        ditambahkan: false,
        tampilan: {
          kulit: acak(KULIT_OPSI),
          rambut: gd === 'cowok' ? acak(RAMBUT_LKI) : acak(RAMBUT_CWK),
          warnaRambut: acak(WARNA_RAMBUT_OPSI),
          mata: acak(MATA_OPSI),
          mulut: acak(MULUT_OPSI)
        }
      });
    }
    S.meet = { hari: S.hari, seri: seri, kandidat: list };
    return list;
  }

  function segarkanMeet(S) {
    daftarMeet(S, true);
    return { ok: true, teks: '🔄 Radar APK Meet diperbarui! Menampilkan 18 profil orang baru di sekitarmu.' };
  }

  function sapaMeet(S, uid) {
    var list = daftarMeet(S, false);
    var k = list.filter(function (x) { return x.uid === uid; })[0];
    if (!k) return 'Profil tidak ditemukan di Meet.';
    if (k.ditambahkan) return k.nama + ' sudah masuk ke Daftar Temanmu.';
    if (k.sapaan) return 'Kamu sudah menyapa ' + k.nama + '. Klik ➕ Tambah Teman untuk menyimpan ke Daftar Kontak!';
    k.sapaan = true;
    return { ok: true, teks: '👋 ' + k.nama + ' membalas sapaanmu di Meet: "Hai ' + (S.namaPemain || 'kak') + '! Salam kenal juga ya 😊" — Klik ➕ Tambah Teman bila cocok!' };
  }

  function tambahDariMeet(S, uid) {
    var list = daftarMeet(S, false);
    var k = list.filter(function (x) { return x.uid === uid; })[0];
    if (!k) return 'Profil tidak ditemukan atau sudah berganti.';
    var daf = siap(S);
    if (k.ditambahkan || daf.some(function (t) { return t.meetUid === k.uid || t.nama.toLowerCase() === k.nama.toLowerCase(); })) {
      k.ditambahkan = true;
      return k.nama + ' sudah ada di Daftar Temanmu.';
    }
    var hubAwal = k.sapaan ? 52 : 42;
    var prAwal = k.sapaan ? 46 : 34;
    var x = {
      id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 9999),
      meetUid: k.uid,
      dariMeet: true,
      nama: k.nama,
      gender: k.gender,
      peran: 'teman',
      tglLahir: k.tglLahir || '2000-05-15',
      kerja: k.kerja || '',
      bio: k.bio || '',
      hubungan: hubAwal,
      perasaan: prAwal,
      hb: 25 + Math.floor(Math.random() * 25),
      pacarId: null,
      pacarNama: '',
      interaksiHari: -1,
      tampilan: k.tampilan || null
    };
    daf.push(x);
    k.ditambahkan = true;
    return { ok: true, teman: x, teks: '🤝 ' + k.nama + ' (' + k.usia + ' thn · ' + k.kerja + ') resmi ditambahkan ke Daftar Teman!' };
  }

  function tambah(S, nama, gender, peran, tglLahir, tampilan, opsi) {
    nama = String(nama || '').trim().slice(0, 24);
    if (!nama) return 'Isi nama dulu.';
    var gChar = gender === 'cowok' ? 'cowok' : 'cewek';
    var gPem = (S.profil && S.profil.gender) || 'cowok';
    if (!PERAN[peran] || peran === 'mantan') peran = 'teman';
    if (peran === 'pacar' && gChar === gPem) return 'Pacaran hanya bisa dengan lawan jenis.';
    var x = { id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 999), nama: nama, gender: gChar, peran: peran,
      dariMeet: !!(opsi && opsi.dariMeet), kerja: (opsi && opsi.kerja) || '',
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
    /* Bayi pasangan NPC hanya masuk kabar/sosmed, TIDAK otomatis memenuhi daftar kontak pemain (kontak hanya dari Meet) */
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
    daftarMeet: daftarMeet, segarkanMeet: segarkanMeet, sapaMeet: sapaMeet, tambahDariMeet: tambahDariMeet,
    tambah: tambah, ubahPeran: ubahPeran, ubahNama: ubahNama, ubahTtl: ubahTtl, hapus: hapus, interaksi: interaksi, tambahMantan: tambahMantan,
    isiKarakterBawaan: isiKarakterBawaan, lepasPacarNpc: lepasPacarNpc, validasiPasanganNpc: validasiPasanganNpc, gantiHari: gantiHari,
    undangKeRumah: undangKeRumah, pulangkanTamu: pulangkanTamu,
    cari: cari, siap: siap, tolakHb: tolakHb, resetTolak: resetTolak, izinKerja: izinKerja, kirimPulang: kirimPulang, konfrontasi: konfrontasi, jalan: jalan, cekPulang: cekPulang,
    sedangKeluar: sedangKeluar, alasanTeks: alasanTeks, syaratHb: syaratHb, hubunganKl: hubunganKl, rp: rp };
})(window);
