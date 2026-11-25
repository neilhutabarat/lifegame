/* teman.js — daftar Teman (teman, sahabat, pacar, mantan), pasangan keluar rumah, dan perselingkuhan pasangan. */
(function (g) {
  'use strict';
  var PERAN = { teman: 'Teman', sahabat: 'Sahabat', pacar: 'Pacar', mantan: 'Mantan' };
  var NAMA_L = ['Dimas', 'Rizky', 'Fajar', 'Bayu', 'Andre', 'Hendra', 'Yoga', 'Reza'];
  var NAMA_P = ['Sinta', 'Dewi', 'Maya', 'Rina', 'Putri', 'Nadia', 'Lestari', 'Wulan'];
  var HOTEL = 350000, MIN_HB = 70;

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function siap(S) { if (!S.teman) S.teman = []; return S.teman; }
  function cari(S, id) { return siap(S).filter(function (x) { return x.id === id; })[0]; }
  function pasanganList(S) { return (S.keluarga || []).filter(function (k) { return k.peran === 'istri' || k.peran === 'suami' || k.peran === 'pasangan'; }); }
  function anakList(S) { return (S.keluarga || []).filter(function (k) { return k.peran === 'anak'; }); }
  function nomorJam(S) { return S.hari * 24 + Math.floor(S.menit / 60); }

  function tambah(S, nama, gender, peran, tglLahir) {
    nama = String(nama || '').trim().slice(0, 24);
    if (!nama) return 'Isi nama dulu.';
    if (!PERAN[peran] || peran === 'mantan') peran = 'teman';
    var x = { id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 999), nama: nama, gender: gender === 'cowok' ? 'cowok' : 'cewek', peran: peran,
      tglLahir: tglLahir || '1998-01-01', hubungan: peran === 'pacar' ? 60 : peran === 'sahabat' ? 65 : 45, interaksiHari: -1 };
    siap(S).push(x);
    return { ok: true, teks: nama + ' ditambahkan sebagai ' + PERAN[peran].toLowerCase() + '.' };
  }
  function ubahPeran(S, id, peran) { var x = cari(S, id); if (!x) return 'Tidak ditemukan.'; if (!PERAN[peran]) return 'Peran tidak dikenal.'; x.peran = peran; return { ok: true, teks: x.nama + ' sekarang ' + PERAN[peran].toLowerCase() + '.' }; }
  function ubahNama(S, id, nama) { var x = cari(S, id); nama = String(nama || '').trim().slice(0, 24); if (!x) return 'Tidak ditemukan.'; if (!nama) return 'Nama tidak boleh kosong.'; x.nama = nama; return { ok: true, teks: 'Nama diubah menjadi ' + nama + '.' }; }
  function ubahTtl(S, id, ttl) { var x = cari(S, id); if (!x) return 'Tidak ditemukan.'; if (!/^\d{4}-\d{2}-\d{2}$/.test(ttl || '')) return 'Tanggal lahir tidak valid.'; x.tglLahir = ttl; return { ok: true, teks: 'Tanggal lahir ' + x.nama + ' disimpan.' }; }
  function hapus(S, id) { S.teman = siap(S).filter(function (x) { return x.id !== id; }); return true; }

  /* interaksi: hubungi (gratis, sekali sehari), traktir (Rp50.000), ribut */
  function interaksi(S, id, jenis, bayar) {
    var x = cari(S, id); if (!x) return 'Tidak ditemukan.';
    if (jenis === 'hubungi') {
      if (x.interaksiHari === S.hari) return 'Kamu sudah menghubungi ' + x.nama + ' hari ini.';
      x.interaksiHari = S.hari;
      var naik = x.hubungan < 30 && Math.random() < 0.4 ? 1 : 5; x.hubungan = Math.min(100, x.hubungan + naik);
      return { ok: true, teks: 'Ngobrol dengan ' + x.nama + '. Hubungan ' + Math.round(x.hubungan) + '%.' };
    }
    if (jenis === 'traktir') {
      if (!bayar(50000, 'Traktir ' + x.nama)) return 'Uang tidak cukup untuk traktir (Rp50.000).';
      x.hubungan = Math.min(100, x.hubungan + 10);
      return { ok: true, teks: 'Traktir ' + x.nama + ' Rp50.000. Hubungan ' + Math.round(x.hubungan) + '%.' };
    }
    if (jenis === 'ribut') { x.hubungan = Math.max(0, x.hubungan - 20); return { ok: true, teks: 'Kamu ribut dengan ' + x.nama + '. Hubungan ' + Math.round(x.hubungan) + '%.' }; }
    return 'Aksi tidak dikenal.';
  }
  function tambahMantan(S, kl, alasan) {
    var x = { id: 'tm' + Date.now().toString(36) + Math.floor(Math.random() * 999), nama: kl.nama, gender: kl.gender || 'cewek', peran: 'mantan', tglLahir: kl.tglLahir || '1998-01-01',
      hubungan: Math.max(5, Math.min(70, Math.round((kl.bahagia || 60) - (/selingkuh/i.test(alasan || '') ? 45 : 25)))), interaksiHari: -1 };
    siap(S).push(x); return x;
  }

  /* ---------- pasangan keluar rumah dan selingkuh ---------- */
  function hubunganKl(kl) { return kl.bahagia == null ? 80 : kl.bahagia; }
  function sedangKeluar(kl, S) { return !!(kl && kl.keluar && nomorJam(S) < kl.keluar.sampai); }
  function tolakHb(S, id) {
    var kl = (S.keluarga || []).filter(function (x) { return x.id === id; })[0]; if (!kl) return;
    kl.tolak = (kl.tolak || 0) + 1; kl.bahagia = Math.max(0, hubunganKl(kl) - 6);
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
      /* selingkuh karena sering ditolak atau hubungan buruk */
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

  /* HB dengan teman/pacar/mantan: butuh hubungan di atas 70% dan biaya kamar hotel */
  function syaratHb(S, id) {
    var x = cari(S, id); if (!x) return 'Tidak ditemukan.';
    if (x.hubungan <= MIN_HB) return 'Hubungan dengan ' + x.nama + ' baru ' + Math.round(x.hubungan) + '%. Butuh di atas ' + MIN_HB + '%.';
    return x;
  }

  g.KK_TEMAN = { PERAN: PERAN, HOTEL: HOTEL, MIN_HB: MIN_HB, tambah: tambah, ubahPeran: ubahPeran, ubahNama: ubahNama, ubahTtl: ubahTtl, hapus: hapus, interaksi: interaksi, tambahMantan: tambahMantan,
    cari: cari, siap: siap, tolakHb: tolakHb, resetTolak: resetTolak, izinKerja: izinKerja, kirimPulang: kirimPulang, konfrontasi: konfrontasi, jalan: jalan, cekPulang: cekPulang,
    sedangKeluar: sedangKeluar, alasanTeks: alasanTeks, syaratHb: syaratHb, hubunganKl: hubunganKl, rp: rp };
})(window);
