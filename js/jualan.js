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

  function pilihMenu(S, jenis, jam) {
    var suka = {}, isi = isiHari(S), k;
    for (k in M.PEMBELI[jenis].suka) suka[k] = M.PEMBELI[jenis].suka[k];
    var panas = { hitam: 1, sanger: 1 };
    for (k in suka) {
      if (panas[k] && jam < 11) suka[k] *= 1.5;
      if (panas[k] && ada(isi, 'Musim hujan')) suka[k] *= 1.2;
      if (!panas[k] && ada(isi, 'Musim kemarau')) suka[k] *= 1.2;
      if (!panas[k] && ada(isi, 'Ramadan') && jam >= 17 && jam < 20) suka[k] *= 1.3;
    }
    var id = pilihBobot(suka);
    return M.MENU.filter(function (m) { return m.id === id; })[0];
  }

  var KULIT = ['#f1c39b', '#e0ac7e', '#c98e62', '#a8714a'];
  var RAMBUT = ['#2a1d1a', '#3b2a22', '#151515', '#5a3a28'];
  function buatPembeli(S, jam) {
    var malamMinggu = KAL.tgl(S.hari).dow === 6;
    var jenis = pilihBobot(M.campuran(jam, malamMinggu));
    var p = M.PEMBELI[jenis], dariKanan = Math.random() < 0.45;
    return {
      id: ++nomor, jenis: jenis, menu: pilihMenu(S, jenis, jam), bayar: Math.random() < p.qris ? 'qris' : 'tunai',
      tiba: S.menit, sabar: p.sabar * (0.8 + Math.random() * 0.4), keadaan: 'antre', racik: [],
      x: dariKanan ? 390 : -30, arahPulang: Math.random() < 0.5 ? -1 : 1,
      rupa: { kulit: KULIT[Math.floor(Math.random() * 4)], rambut: RAMBUT[Math.floor(Math.random() * 4)], baju: Math.floor(Math.random() * 5), perempuan: Math.random() < 0.5 }
    };
  }

  function antre() { return daftar.filter(function (o) { return o.keadaan === 'antre' || o.keadaan === 'dilayani'; }); }
  function aturSlot() { antre().forEach(function (o, i) { o.slot = i; }); }

  /* dipanggil tiap frame selama kedai buka; dMenit = menit game yang lewat */
  function langkah(S, dMenit) {
    if (dMenit <= 0) return;
    var jam = Math.floor(S.menit / 60) % 24;
    var lambda = M.PEMBELI_PER_HARI / JUMLAH_BOBOT * M.KERAMAIAN[jam] * pengali(S, jam) / 60;
    if (Math.random() < lambda * dMenit) {
      if (antre().length >= MAKS_ANTRE) S.hariIni.penuh++;
      else { daftar.push(buatPembeli(S, jam)); aturSlot(); }
    }
    daftar.forEach(function (o) {
      if (o.keadaan === 'dilayani') o.tiba += dMenit; /* sabar berhenti selama sedang diracik */
      if (o.keadaan === 'antre' && S.menit - o.tiba > o.sabar) {
        o.keadaan = 'pulang'; o.marah = true; S.hariIni.pergi++;
        o.efek = { teks: 'Kelamaan!', warna: '#d9443a' };
      }
    });
    aturSlot();
  }
  /* dipanggil adegan setelah pembeli keluar layar */
  function bersihkan() { daftar = daftar.filter(function (o) { return !o.hilang; }); }

  function depan() { var a = antre(); return a.length ? a[0] : null; }

  function mdr(S, nilai) {
    var aturan = (S.omzetTahun || 0) > N.mdr.batasMikro ? N.mdr.kecil : N.mdr.mikro;
    return nilai <= aturan.gratisSampai ? 0 : Math.round(nilai * aturan.tarif);
  }

  /* gelas jadi dan diserahkan; biayaBahan = HPP bahan yang dipakai di gelas ini */
  function layani(S, o, biayaBahan) {
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
    o.keadaan = 'pulang'; o.bawaCup = true; o.marah = false;
    o.efek = { teks: '+' + h.toLocaleString('id-ID') + (o.bayar === 'qris' ? ' QRIS' : ' tunai'), warna: o.bayar === 'qris' ? '#155e57' : '#2a1d00', cup: true };
    aturSlot();
    return catatan || true;
  }

  /* kedai tutup: yang masih antre pulang tanpa dihitung pergi */
  function tutup() { daftar.forEach(function (o) { if (o.keadaan !== 'pulang') { o.keadaan = 'pulang'; } }); }
  function kosongkan() { daftar = []; }

  function hariBaru() {
    return { dilayani: 0, pergi: 0, penuh: 0, tanpaKembalian: 0, omzetTunai: 0, omzetQris: 0, mdr: 0, hpp: 0, terbuang: 0, menu: {} };
  }

  g.KK_JUAL = { langkah: langkah, depan: depan, layani: layani, tutup: tutup, kosongkan: kosongkan, bersihkan: bersihkan,
    hariBaru: hariBaru, antre: antre, semua: function () { return daftar; }, mdr: mdr };
})(window);
