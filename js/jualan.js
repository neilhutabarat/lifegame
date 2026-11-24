/* jualan.js — pembeli datang, antre, menunggu, dilayani atau pergi; pembayaran tunai dan QRIS. */
(function (g) {
  'use strict';
  var M = g.KK_MENU, N = g.KK_NYATA, KAL = g.KK_KAL;
  var MAKS_ANTRE = 6;
  var JUMLAH_BOBOT = 0; for (var j = 7; j < 22; j++) JUMLAH_BOBOT += M.KERAMAIAN[j];

  var daftar = [], nomor = 0, cacheMod = { kunci: '', nilai: 1, info: [] };

  function pilihBobot(peta) {
    var total = 0, k; for (k in peta) total += peta[k];
    var r = Math.random() * total; for (k in peta) { r -= peta[k]; if (r <= 0) return k; }
    return k;
  }
  function isiHari(S) { return KAL.hariIni(S.hari); }
  function ada(isi, nama) { return isi.some(function (x) { return x.nama.indexOf(nama) === 0; }); }

  /* pengali keramaian dari kalender dan event (rancangan bagian Kalender & event) */
  function pengali(S, jam) {
    var kunci = S.hari + ':' + jam;
    if (cacheMod.kunci === kunci) return cacheMod.nilai;
    var isi = isiHari(S), m = 1;
    var lebaran = isi.some(function (x) { return x.nama === 'Idulfitri' && x.jenis === 'libur'; });
    if (lebaran) m *= 0.3;
    else if (isi.some(function (x) { return x.jenis === 'libur'; })) m *= 1.1;
    else if (isi.some(function (x) { return x.jenis === 'cuti'; })) m *= 1.05;
    if (ada(isi, 'Musim mudik')) m *= 0.6;
    if (ada(isi, 'Ramadan')) m *= jam >= 6 && jam < 17 ? 0.3 : jam < 20 ? 1.8 : 1;
    if (ada(isi, 'Malam Minggu') && jam >= 18) m *= 1.3;
    if (ada(isi, 'Tanggal muda')) m *= 1.1;
    if (ada(isi, 'Tanggal tua')) m *= 0.85;
    if (ada(isi, 'Musim hujan')) m *= 0.9;
    cacheMod = { kunci: kunci, nilai: m };
    return m;
  }

  function menuAktifList(S) {
    return M.MENU.filter(function (m) { return !g.KK_USAHA || g.KK_USAHA.menuDijual(S, m.id); });
  }
  function pilihSuhu(menu, jam, isi) {
    if (menu.cemilan) return false;
    if (!menu.bisaSuhu && menu.sendiri) return !!menu.panas;
    var pPanas = 0.35;
    if (menu.id === 'hitam' || menu.id === 'espresso' || menu.id === 'arabica') pPanas = 0.62;
    else if (menu.id === 'cappuccino' || menu.id === 'mocha') pPanas = 0.45;
    else if (menu.id === 'aren' || menu.id === 'susu') pPanas = 0.25;
    if (jam < 10) pPanas += 0.22;
    if (ada(isi, 'Musim hujan')) pPanas += 0.15;
    if (ada(isi, 'Musim kemarau')) pPanas -= 0.18;
    if (ada(isi, 'Ramadan') && jam >= 17 && jam < 20) pPanas -= 0.22;
    return Math.random() < Math.max(0.08, Math.min(0.9, pPanas));
  }
  /* pilih menu: pembeli bisa menginginkan menu yang sedang tidak dijual -> ganti ke menu lain yang dijual, atau batal beli */
  function pilihMenu(S, jenis, jam) {
    var suka = {}, isi = isiHari(S), k;
    for (k in M.PEMBELI[jenis].suka) suka[k] = M.PEMBELI[jenis].suka[k];
    var id = pilihBobot(suka);
    var m = M.MENU.filter(function (x) { return x.id === id; })[0] || M.MENU[0];
    var aktif = menuAktifList(S);
    if (!aktif.length) return { menu: m, batal: true, alasan: 'Menu sedang kosong' };
    if (g.KK_USAHA && !g.KK_USAHA.menuDijual(S, m.id)) {
      /* 55% mau pindah ke menu lain yang sedang dijual, 45% tidak jadi beli */
      if (Math.random() < 0.55) {
        var sukaAktif = {};
        aktif.forEach(function (x) { sukaAktif[x.id] = suka[x.id] || 10; });
        var idBaru = pilihBobot(sukaAktif);
        var mBaru = aktif.filter(function (x) { return x.id === idBaru; })[0] || aktif[0];
        return { menu: mBaru, panas: pilihSuhu(mBaru, jam, isi), gantiDari: m.pendek };
      }
      return { menu: m, batal: true, alasan: 'Tidak jual ' + m.pendek };
    }
    return { menu: m, panas: pilihSuhu(m, jam, isi) };
  }

  var KULIT = ['#f1c39b', '#e0ac7e', '#c98e62', '#a8714a'];
  var RAMBUT = ['#2a1d1a', '#3b2a22', '#151515', '#5a3a28'];
  function buatPembeli(S, jam) {
    var malamMinggu = KAL.tgl(S.hari).dow === 6;
    var mix = M.campuran(jam, malamMinggu); if (g.KK_USAHA && S.usaha) mix = g.KK_USAHA.campuran(S, mix);
    var jenis = pilihBobot(mix);
    var D = S.dunia, blogger = false;
    if (D && D.bloggerMenunggu) { jenis = 'konten'; blogger = true; D.bloggerMenunggu = false; }
    var p = M.PEMBELI[jenis], dariKanan = Math.random() < 0.45, sabar = p.sabar * (0.8 + Math.random() * 0.4) * (S.bonusSabar || 1) * (g.KK_USAHA && S.usaha ? g.KK_USAHA.sabar(S) : 1);
    var pil = pilihMenu(S, jenis, jam);
    var o = { blogger: blogger, datang: S.menit, sabarAwal: sabar,
      id: ++nomor, jenis: jenis, menu: pil.menu, panas: !!pil.panas, bayar: Math.random() < p.qris ? 'qris' : 'tunai',
      tiba: S.menit, sabar: sabar, keadaan: pil.batal ? 'pulang' : 'antre', racik: [],
      x: dariKanan ? 390 : -30, arahPulang: Math.random() < 0.5 ? -1 : 1,
      rupa: { kulit: KULIT[Math.floor(Math.random() * 4)], rambut: RAMBUT[Math.floor(Math.random() * 4)], baju: Math.floor(Math.random() * 5), perempuan: Math.random() < 0.5 }
    };
    if (pil.batal) {
      o.x = 222;
      o.efek = { teks: pil.alasan, warna: '#8a5a2b' };
    } else if (pil.gantiDari) {
      o.gantiDari = pil.gantiDari;
    }
    return o;
  }

  function kursiKosong(S) {
    var maks = (S.usaha && S.usaha.tier >= 2) ? 3 : 2;
    var terpakai = {};
    daftar.forEach(function (o) { if (o.keadaan === 'duduk' && o.kursi != null) terpakai[o.kursi] = true; });
    for (var i = 0; i < maks; i++) if (!terpakai[i]) return i;
    return -1;
  }

  function antre() { return daftar.filter(function (o) { return o.keadaan === 'antre' || o.keadaan === 'dilayani'; }); }
  function aturSlot() { antre().forEach(function (o, i) { o.slot = i; }); }

  /* dipanggil tiap frame selama kedai buka; dMenit = menit game yang lewat */
  function langkah(S, dMenit) {
    if (dMenit <= 0) return;
    var jam = Math.floor(S.menit / 60) % 24;
    var lambda = M.PEMBELI_PER_HARI / JUMLAH_BOBOT * M.KERAMAIAN[jam] * pengali(S, jam) * (g.KK_DUNIA ? g.KK_DUNIA.faktor(S) : 1) * (g.KK_USAHA && S.usaha ? g.KK_USAHA.faktor(S) : 1) / 60;
    if (!S.tutupAntre && Math.random() < lambda * dMenit) {
      if (antre().length >= MAKS_ANTRE) S.hariIni.penuh++;
      else { daftar.push(buatPembeli(S, jam)); aturSlot(); }
    }
    daftar.forEach(function (o) {
      if (o.keadaan === 'dilayani') o.tiba += dMenit; /* sabar berhenti selama sedang diracik */
      if (o.keadaan === 'antre' && S.menit - o.tiba > o.sabar) {
        o.keadaan = 'pulang'; o.marah = true; S.hariIni.pergi++; if (g.KK_DUNIA) g.KK_DUNIA.catatPergi(S, o);
        o.efek = { teks: 'Kelamaan!', warna: '#d9443a' };
      }
      if (o.keadaan === 'duduk' && S.menit >= (o.dudukSampai || 0)) {
        o.keadaan = 'pulang'; o.kursi = null;
      }
    });
    aturSlot();
  }
  /* dipanggil adegan setelah pembeli keluar layar */
  function bersihkan() { daftar = daftar.filter(function (o) { return !o.hilang; }); }

  function depan() { var a = antre().filter(function (o) { return !o.oleh; }); return a.length ? a[0] : null; }

  function mdr(S, nilai) {
    var aturan = (S.omzetTahun || 0) > N.mdr.batasMikro ? N.mdr.kecil : N.mdr.mikro;
    return nilai <= aturan.gratisSampai ? 0 : Math.round(nilai * aturan.tarif);
  }

  /* gelas jadi dan diserahkan; biayaBahan = HPP bahan yang dipakai di gelas ini */
  function layani(S, o, biayaBahan, pelayan) {
    var h = o.menu.harga, hi = S.hariIni, U = g.KK_UANG, catatan = '';
    if (o.bayar === 'tunai') {
      var t = U.bayarTunai(S, h);
      if (!t.ok) {
        hi.tanpaKembalian++;
        /* kembalian kurang: sebagian pembeli pindah ke QRIS, sisanya batal */
        if (Math.random() < 0.6) { o.bayar = 'qris'; catatan = ' (pindah QRIS)'; }
        else {
          hi.terbuang += biayaBahan; o.keadaan = 'pulang'; o.marah = true; o.racik = [];
          o.efek = { teks: 'Tak ada kembalian', warna: '#d9443a' }; aturSlot(); return false;
        }
      } else { hi.omzetTunai += h; if (t.kembalian) catatan = ' bayar ' + (t.uang / 1000) + 'rb'; }
    }
    if (o.bayar === 'qris') { var biaya = mdr(S, h); U.terimaQris(S, h - biaya); hi.omzetQris += h; hi.mdr += biaya; }
    S.omzetTahun = (S.omzetTahun || 0) + h;
    S.pajak.omzetBulan += h;
    hi.hpp += biayaBahan; hi.dilayani++;
    hi.menu[o.menu.id] = (hi.menu[o.menu.id] || 0) + 1;
    var kDuduk = kursiKosong(S);
    var mauDuduk = kDuduk >= 0 && Math.random() < (o.jenis === 'mahasiswa' || o.jenis === 'konten' || o.jenis === 'keluarga' ? 0.65 : 0.4);
    if (mauDuduk) {
      o.keadaan = 'duduk'; o.kursi = kDuduk; o.dudukSampai = S.menit + 18 + Math.random() * 26;
    } else {
      o.keadaan = 'pulang';
    }
    o.bawaCup = true; o.marah = false;
    var bintang = g.KK_DUNIA ? g.KK_DUNIA.catatPembeli(S, o, pelayan || null) : 0;
    o.efek = { teks: '+' + h.toLocaleString('id-ID') + (o.bayar === 'qris' ? ' QRIS' : ' tunai') + (bintang ? ' ★' + bintang : ''), warna: o.bayar === 'qris' ? '#155e57' : '#2a1d00', cup: true };
    aturSlot();
    return catatan || true;
  }

  /* kedai tutup: yang masih antre atau duduk pulang tanpa dihitung pergi */
  function tutup() { daftar.forEach(function (o) { if (o.keadaan !== 'pulang') { o.keadaan = 'pulang'; o.kursi = null; } }); }
  function kosongkan() { daftar = []; }

  function hariBaru() {
    return { dilayani: 0, pergi: 0, penuh: 0, tanpaKembalian: 0, omzetTunai: 0, omzetQris: 0, mdr: 0, hpp: 0, terbuang: 0, menu: {} };
  }

  g.KK_JUAL = { langkah: langkah, depan: depan, layani: layani, tutup: tutup, kosongkan: kosongkan, bersihkan: bersihkan,
    hariBaru: hariBaru, antre: antre, semua: function () { return daftar; }, mdr: mdr };
})(window);
