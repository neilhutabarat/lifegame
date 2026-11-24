/* main.js — alur game: pilih kota dan QRIS, jam berjalan, buka-tutup kedai, racik dan jualan, laporan malam, kalender, simpan otomatis. */
(function () {
  'use strict';
  var KAL = window.KK_KAL, N = window.KK_NYATA, SIMPAN = window.KK_SIMPAN, ADEGAN = window.KK_ADEGAN, JUAL = window.KK_JUAL, MN = window.KK_MENU, UANG = window.KK_UANG, DIRI = window.KK_DIRI, STOK = window.KK_STOK, MOTOR = window.KK_MOTOR, ANTAR = window.KK_ANTAR, STAF = window.KK_STAF, DUNIA = window.KK_DUNIA, USAHA = window.KK_USAHA;
  var MENIT_PER_DETIK = 1.875;          /* 1x: 15 jam kedai = 8 menit nyata */
  var TAHUN_DASAR = 2022;               /* tahun Masehi 2023 = tahun ke-1 */
  var HARI_PERTAMA = KAL.dn(2023, 1, 2); /* Senin pertama */

  var $ = function (id) { return document.getElementById(id); };
  var S = null, layar = 'awal', lembar = null, tPrev = 0, menitSimpan = 0, toastT = 0, kotaDipilih = null, qrisDipilih = null, lokasiDipilih = null;
  var R = null; /* racik yang sedang terbuka: { o: pembeli } */
  var kal = { y: 0, m: 0, pilih: null };

  /* ---------- format ---------- */
  function rupiah(n) { n = Math.round(n); return (n < 0 ? '−Rp' : 'Rp') + Math.abs(n).toLocaleString('id-ID'); }
  function rupiahPendek(n) { return Math.abs(n) >= 10e6 ? (n < 0 ? '−' : '') + 'Rp' + (Math.abs(n) / 1e6).toFixed(1).replace('.', ',') + ' jt' : rupiah(n); }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function jam(menit) { var m = Math.floor(menit) % 1440; return dua(Math.floor(m / 60)) + '.' + dua(m % 60); }
  function namaTanggal(n, panjang) { var t = KAL.tgl(n); return (panjang ? N.namaHari[t.dow] + ', ' : '') + t.d + ' ' + N.namaBulan[t.m - 1]; }
  function tahunKe(n) { return KAL.tgl(n).y - TAHUN_DASAR; }
  function kotaIni() { return N.kota.filter(function (k) { return k.id === S.kota; })[0] || N.kota[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function toast(teks, lama) {
    var el = $('toast'); el.textContent = teks; el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastT); toastT = setTimeout(function () { el.hidden = true; }, lama || 2200);
  }

  /* ---------- layar ---------- */
  function tampil(nama) {
    layar = nama;
    $('layar-awal').hidden = nama !== 'awal';
    $('layar-kota').hidden = nama !== 'kota';
    $('layar-qris').hidden = nama !== 'qris';
    $('layar-bank').hidden = nama !== 'bank';
    $('layar-lokasi').hidden = nama !== 'lokasi';
    $('hud').hidden = $('bawah').hidden = nama !== 'main';
    if (nama === 'awal') isiLayarAwal();
    if (nama === 'kota') isiKota();
    if (nama === 'qris') isiQris();
    if (nama === 'bank') isiBank();
    if (nama === 'lokasi') $('lokasi-daftar').innerHTML = Object.keys(USAHA.LOKASI).map(function (id) {
      var L = USAHA.LOKASI[id];
      return '<button type="button" class="kota" data-lokasi="' + id + '"><b>' + esc(L.nama) + '</b><span class="ciri">' + esc(L.ket) + '</span></button>';
    }).join('');
    if (nama === 'main') { perbaruiHUD(true); perbaruiAksi(); perbaruiPesanan(); }
  }
  function isiLayarAwal() {
    var lama = SIMPAN.baca();
    var b = $('b-lanjut');
    if (lama && lama.v >= 1) {
      b.hidden = false; b.textContent = 'Lanjutkan';
      var k = N.kota.filter(function (x) { return x.id === lama.kota; })[0];
      $('info-simpan').textContent = 'Simpanan: hari ke-' + lama.hariKe + ', ' + (k ? k.nama : '') + ', ' + namaTanggal(lama.hari, true) + '.';
    } else { b.hidden = true; $('info-simpan').textContent = ''; }
  }
  function isiKota() {
    $('kota-daftar').innerHTML = N.kota.map(function (k) {
      return '<button type="button" class="kota" data-kota="' + k.id + '"><b>' + esc(k.nama) + '</b>' +
        '<span class="ciri">' + esc(k.provinsi) + '</span><span class="umk">UMK 2026 ' + rupiah(k.umk) + ' sebulan</span></button>';
    }).join('');
  }

  function isiQris() {
    $('qris-daftar').innerHTML = N.qris.map(function (q) {
      return '<button type="button" class="kota" data-qris="' + q.id + '"><b><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.nama) + '</b>' +
        '<span class="ciri">' + esc(q.transfer) + '</span></button>';
    }).join('');
  }
  function isiBank() {
    $('bank-daftar').innerHTML = N.bank.map(function (b) {
      return '<button type="button" class="kota" data-bank="' + b.id + '"><b><i class="tanda-qris" style="background:' + b.warna + '"></i>' + esc(b.nama) + '</b>' +
        '<span class="ciri">Admin ' + rupiah(b.admin) + ' sebulan · transfer ATM sampai ' + rupiah(b.batasTransfer) + ' sehari</span></button>';
    }).join('');
  }
  /* lengkapi simpanan lama (tahap 1 dan 2) */
  function lengkapi(d) {
    d.v = 3;
    d.uang = d.uang || { laci: 0, merchant: 0 };
    d.hariIni = d.hariIni || JUAL.hariBaru();
    d.hariIni.tanpaKembalian = d.hariIni.tanpaKembalian || 0;
    STOK.siapkan(d); MOTOR.siapkan(d); ANTAR.siapkan(d); STAF.siapkan(d); DUNIA.siapkan(d); USAHA.siapkan(d); DUNIA.terapkanHarga(d); DIRI.siapkan(d);
    d.riwayat = d.riwayat || [];
    d.omzetTahun = d.omzetTahun || 0;
    d.tahunOmzet = d.tahunOmzet || KAL.tgl(d.hari).y;
    return d;
  }
  function mulaiBaru(kota, qris, bank) {
    S = lengkapi({ v: 3, kota: kota, qris: qris, hari: HARI_PERTAMA, menit: 360, fase: 'pagi', jamBuka: 7, jamTutup: 22, kec: 1, hariKe: 1, dibuat: Date.now() });
    UANG.siapkan(S, bank);
    S.usaha.lokasi = lokasiDipilih || 'jalan';
    if (S.usaha.lokasi === 'spbu') S.dunia.pesaing.push({ nama: 'Point Coffee', jenis: 'waralaba', rating: 4.5, harga: 18000, jarak: 0.1, promoSampai: -1 });
    JUAL.kosongkan(); simpan(); tampil('main');
    S.diri.posisi = 'kos'; simpan(); tampil('main');
    toast('Hari pertama di ' + kotaIni().nama + '. Kamu bangun di kos. Berangkat ke kedai sebelum pukul ' + jam(S.jamBuka * 60) + '.', 3600);
  }
  function lanjut(data) {
    S = lengkapi(data); JUAL.kosongkan();
    if (!S.qris) { kotaDipilih = null; tampil('qris'); return; }
    if (!S.bank) { kotaDipilih = null; tampil('bank'); return; }
    if (S.fase === 'buka' || S.fase === 'pagi') { /* pembeli yang sedang antre tidak ikut tersimpan */ }
    if (S.fase === 'malam') S.menit = S.jamTutup * 60;
    tampil('main');
    if (S.fase === 'malam' && S.diri.posisi === 'kedai' && !S.laporanDilihat) bukaLaporan();
  }
  function qrisIni() { return N.qris.filter(function (q) { return q.id === S.qris; })[0] || N.qris[0]; }
  function simpan() { if (S) { SIMPAN.tulis(S); menitSimpan = S.menit; } }

  /* ---------- HUD ---------- */
  var hudTerakhir = '';
  function perbaruiHUD(paksa) {
    var kunciHUD = S.hari + ':' + Math.floor(S.menit) + ':' + S.fase;
    if (!paksa && kunciHUD === hudTerakhir) return; hudTerakhir = kunciHUD;
    $('h-jam').textContent = jam(S.menit);
    $('h-hari').textContent = namaTanggal(S.hari, true);
    $('h-tahun').textContent = 'Tahun ke-' + tahunKe(S.hari) + ' · Hari ke-' + S.hariKe;
    var st = $('h-status');
    st.className = S.fase === 'buka' ? 'status-buka' : '';
    st.textContent = S.fase === 'pagi' ? 'Buka pukul ' + jam(S.jamBuka * 60) : S.fase === 'buka' ? 'Buka sampai ' + jam(S.jamTutup * 60) : 'Tutup';
    var d = S.diri; $('h-diri').innerHTML = bar('Makan', d.kenyang) + bar('Minum', d.minum) + bar('Stamina', d.stamina) + bar('Melek', d.melek);
    $('h-laci').textContent = rupiahPendek(UANG.laci(S));
    $('h-merchant').textContent = rupiahPendek(UANG.merchantTotal(S));
    $('h-bank').textContent = rupiahPendek(S.bank.saldo);
    $('h-bank-nama').textContent = UANG.bankIni(S).nama;
    $('h-merchant-nama').textContent = qrisIni().nama;
    $('h-antre').textContent = JUAL.antre().length;
    if (paksa || Math.floor(S.menit) % 30 === 0) {
      var isi = KAL.hariIni(S.hari).filter(function (x) { return x.jenis !== 'suasana' || x.nama !== 'Car Free Day pagi' || S.menit < 600; });
      var tipis = S.fase !== 'malam' ? STOK.menipis(S) : [];
      var chipDunia = (S.diri.posisi === 'kos' && S.fase === 'buka' ? '<span class="chip libur">Kedai buka tanpa kamu</span>' : '') +
        (S.diri.posisi === 'kos' && S.fase === 'pagi' && S.menit >= S.jamBuka * 60 ? '<span class="chip libur">Kedai belum dibuka, kamu masih di kos</span>' : '') +
        (DUNIA.hujanSekarang(S) ? '<span class="chip event">' + (S.dunia.cuaca.banjir ? 'Hujan deras, banjir' : 'Hujan') + '</span>' : '') +
        (S.dunia.kotor >= 40 && S.fase !== 'malam' ? '<span class="chip libur">Kedai kotor, tap kontainer untuk bersih-bersih</span>' : '') +
        (S.dunia.maps.status === 'aktif' && S.dunia.ulasan.length ? '<span class="chip">★ ' + DUNIA.rataMaps(S).toFixed(1).replace('.', ',') + ' Maps</span>' : '');
      $('h-chip').innerHTML = chipDunia + (tipis.length ? '<span class="chip libur">Stok menipis: ' + esc(tipis.map(function (id) { return MN.BARANG[id].nama.split(' (')[0].replace('Biji kopi robusta sangrai', 'Kopi').replace('Cup plastik 16 oz + tutup + sedotan', 'Cup plastik').replace('Cup kertas 8 oz + tutup', 'Cup kertas'); }).join(', ')) + '</span>' : '') +
        isi.map(function (x) {
        var label = x.jenis === 'libur' ? 'Libur: ' + x.nama : x.jenis === 'cuti' ? 'Cuti bersama: ' + x.nama : x.nama;
        return '<span class="chip ' + x.jenis + '">' + esc(label) + '</span>';
      }).join('');
    }
  }
  function perbaruiAksi() {
    var b = $('b-aksi'), diKos = S.diri.posisi === 'kos';
    $('kos-aksi').hidden = !diKos;
    if (diKos) { b.hidden = false; b.disabled = false; b.textContent = S.fase === 'malam' ? 'Tidur, bangun pukul ' + jam(S.diri.bangun) : 'Berangkat ke kedai'; isiKosAksi(); }
    else if (S.fase === 'pagi') { b.hidden = false; b.disabled = false; b.textContent = 'Buka kedai sekarang'; }
    else if (S.fase === 'buka') {
      var d = JUAL.depan(); b.hidden = false; b.disabled = !d;
      b.textContent = d ? 'Sajikan ' + d.menu.pendek : 'Menunggu pembeli';
    }
    else { b.hidden = false; b.disabled = false; b.textContent = S.laporanDilihat ? 'Pulang ke kos' : 'Lihat laporan malam'; }
    [].forEach.call(document.querySelectorAll('.kec button'), function (x) { x.setAttribute('aria-pressed', String(+x.dataset.kec === S.kec)); });
  }

  /* ---------- alur hari ---------- */
  function bukaKedai(otomatis) {
    if (S.fase !== 'pagi') return;
    S.fase = 'buka'; perbaruiAksi(); perbaruiHUD(true); simpan();
    toast(otomatis ? 'Pukul ' + jam(S.menit) + ', kedai buka.' : 'Kedai buka lebih awal.');
  }
  function tutupKedai() {
    tutupRacik(); JUAL.tutup();
    S.fase = 'malam'; S.menit = S.jamTutup * 60; perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Pukul ' + jam(S.menit) + ', kedai tutup.');
    setTimeout(function () { if (S && S.fase === 'malam' && layar === 'main' && !lembar) bukaLaporan(); }, 1100);
  }
  function besok(bangun) {
    var h = S.hariIni; h.tenagaKerja = STAF.biayaHarian(S); h.sewaHarian = sewaHarian(); h.rating = S.dunia.ratingHari.n ? S.dunia.ratingHari.total / S.dunia.ratingHari.n : 0;
    S.riwayat.push({ hari: S.hari, dilayani: h.dilayani, pergi: h.pergi, omzet: omzetTotal(h), laba: labaKotor(h) });
    if (S.riwayat.length > 60) S.riwayat.shift();
    S.fase = 'pagi';
    var nLama = S.hari, kabar = UANG.gantiHari(S, S.hari, S.hari + 1);
    S.hari += 1; S.hariKe += 1; S.menit = bangun || 360; S.hariIni = JUAL.hariBaru(); JUAL.kosongkan(); S.laporanDilihat = false;
    kabar = STOK.gantiHari(S, nLama, S.hari).concat(kabar, MOTOR.gantiHari(S, nLama, S.hari), ANTAR.gantiHari(S, nLama, S.hari), STAF.gantiHari(S, nLama, S.hari), DUNIA.gantiHari(S, nLama, S.hari), USAHA.gantiHari(S, nLama, S.hari), DIRI.gantiHari(S, nLama, S.hari));
    S.motorSibukSampai = 0;
    S.staf.forEach(function (k) {
      k.sibukSampai = 0;
      if (STAF.punyaTugas(k, 'belanja') && STAF.masuk(S, k) && S.belanjaTerakhir.pasar) {
        var rb = STOK.beli(S, 'pasar', JSON.parse(JSON.stringify(S.belanjaTerakhir.pasar)), 'tunai');
        kabar.push(rb && rb.ok ? k.nama + ' sudah belanja ke pasar seperti belanja terakhir.' : k.nama + ' tidak jadi belanja ke pasar: ' + rb);
      }
    });
    if (KAL.tgl(S.hari).y !== S.tahunOmzet) { S.tahunOmzet = KAL.tgl(S.hari).y; S.omzetTahun = 0; }
    tutupLembar(); simpan(); perbaruiHUD(true); perbaruiAksi(); perbaruiPesanan();
    var lib = KAL.hariIni(S.hari).filter(function (x) { return x.jenis === 'libur' || x.jenis === 'cuti'; });
    toast(namaTanggal(S.hari, true) + (lib.length ? '. ' + (lib[0].jenis === 'libur' ? 'Libur ' : 'Cuti bersama ') + lib[0].nama + '.' : '.'), 2600);
    if (kabar.length) bukaLembar('kabar', kepala('Kabar pagi', namaTanggal(S.hari, true)) +
      '<ul class="daftar kabar">' + kabar.map(function (k) { return '<li><span>' + esc(k) + '</span></li>'; }).join('') + '</ul>' +
      '<div style="margin-top:16px"><button type="button" class="aksi" data-tutup>Mulai hari</button></div>');
  }

  /* ---------- lembar bawah ---------- */
  function bukaLembar(nama, html) {
    lembar = nama; $('lembar-isi').innerHTML = '<div class="pegangan"></div>' + html; $('lembar').hidden = false;
    $('lembar-isi').scrollTop = 0;
  }
  function tutupLembar() { lembar = null; $('lembar').hidden = true; }

  function kepala(judul, sub, kiri, kanan) {
    return '<div class="kepala-lembar">' + (kiri || '') + '<div style="flex:1;min-width:0"><h2>' + esc(judul) + '</h2>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' +
      (kanan || '') + '<button type="button" class="tutup-x" data-tutup aria-label="Tutup">×</button></div>';
  }
  function itemDaftar(x) {
    var label = x.jenis === 'libur' ? 'Libur nasional' : x.jenis === 'cuti' ? 'Cuti bersama' : x.jenis === 'musim' ? 'Musim' : x.jenis === 'event' ? 'Event' : 'Suasana';
    return '<li class="' + x.jenis + '"><span>' + esc(x.nama) + '</span><span>' + label + '</span></li>';
  }
  function sewaHarian() {
    var t = USAHA.tempat(S);
    return Math.round(USAHA.sewaBulan(S) / 30 + (t.listrikBulan || 0) / 30 + (USAHA.punya(S, 'wifi') ? USAHA.ALAT.wifi.harga / 30 : 0) + USAHA.sewaTahun(S) / 365);
  }
  function omzetTotal(h) { return h.omzetTunai + h.omzetQris + (h.omzetTransfer || 0) + (h.omzetOjol || 0); }
  function labaKotor(h) {
    return omzetTotal(h) + (h.ongkir || 0) - h.mdr - (h.komisi || 0) - h.hpp - h.terbuang - (h.rusak || 0) - (h.operasional || 0) -
      (h.kurir || 0) - (h.bensin || 0) - (h.bengkel || 0) - (h.listrikMotor || 0) - (h.refund || 0) - (h.tenagaKerja || 0) - (h.pemasaran || 0) - (h.uangPalsu || 0) - (h.listrik || 0) - (h.sewaHarian || 0);
  }
  function baris(a, b, kls) { return '<li' + (kls ? ' class="' + kls + '"' : '') + '><span>' + a + '</span><span>' + b + '</span></li>'; }
  function ringkasanJualan() {
    var h = S.hariIni, omzet = omzetTotal(h), q = qrisIni();
    var laris = MN.MENU.filter(function (m) { return h.menu[m.id]; }).sort(function (a, b) { return h.menu[b.id] - h.menu[a.id]; });
    return '<h3 class="subjudul">Penjualan</h3><ul class="daftar angka">' +
      baris('Gelas terjual', h.dilayani + ' gelas') +
      (h.antar ? baris('Pesanan antar selesai', h.antar + ' pesanan') : '') +
      baris('Pergi karena kelamaan', h.pergi + ' orang', h.pergi ? 'rugi' : '') +
      (h.penuh ? baris('Batal karena antrean penuh', h.penuh + ' orang', 'rugi') : '') +
      (h.tanpaKembalian ? baris('Kembalian tidak cukup', h.tanpaKembalian + ' kali', 'rugi') : '') +
      baris('Omzet tunai', rupiah(h.omzetTunai)) +
      baris('Omzet QRIS', rupiah(h.omzetQris)) +
      (h.omzetTransfer ? baris('Omzet transfer (pesanan)', rupiah(h.omzetTransfer)) : '') +
      (h.omzetOjol ? baris('Omzet GoFood/GrabFood/ShopeeFood', rupiah(h.omzetOjol)) : '') +
      (h.ongkir ? baris('Ongkir dari pembeli', rupiah(h.ongkir)) : '') +
      (h.komisi ? baris('Komisi aplikasi pesan-antar', '−' + rupiah(h.komisi)) : '') +
      baris('Potongan MDR QRIS', '−' + rupiah(h.mdr)) +
      baris('HPP bahan terjual', '−' + rupiah(h.hpp)) +
      (h.terbuang ? baris('Bahan terbuang saat racik', '−' + rupiah(h.terbuang), 'rugi') : '') +
      (h.rusak ? baris('Stok rusak (es mencair, susu basi)', '−' + rupiah(h.rusak), 'rugi') : '') +
      (h.operasional ? baris('Gas dan air untuk air panas', '−' + rupiah(h.operasional)) : '') +
      (h.kurir ? baris('Ongkos kurir ' + esc(N.kurir.nama), '−' + rupiah(h.kurir)) : '') +
      (h.bensin ? baris('Bensin', '−' + rupiah(h.bensin)) : '') +
      (h.listrikMotor ? baris('Cas motor listrik', '−' + rupiah(h.listrikMotor)) : '') +
      (h.bengkel ? baris('Bengkel dan perawatan motor', '−' + rupiah(h.bengkel)) : '') +
      (h.refund ? baris('Uang kembali (cup tumpah)', '−' + rupiah(h.refund), 'rugi') : '') +
      baris('Sewa tempat' + (USAHA.tempat(S).listrikBulan ? ', listrik numpang' : '') + (USAHA.punya(S, 'wifi') ? ', wifi' : '') + ' (bagian hari ini)', '−' + rupiah(h.sewaHarian = sewaHarian())) +
      (h.listrik ? baris('Listrik PLN (token terpakai)', '−' + rupiah(h.listrik)) : '') +
      (h.pemasaran ? baris('Pemasaran (iklan, endorse, ulasan)', '−' + rupiah(h.pemasaran)) : '') +
      (h.uangPalsu ? baris('Uang palsu', '−' + rupiah(h.uangPalsu), 'rugi') : '') +
      (S.staf.length ? baris('Tenaga kerja (gaji, lembur, BPJS hari ini)', '−' + rupiah(h.tenagaKerja = STAF.biayaHarian(S))) : '') +
      baris('<b>Laba kotor</b>', '<b>' + rupiah(labaKotor(h)) + '</b>', 'total') + '</ul>' +
      '<h3 class="subjudul">Nilai dari pembeli</h3><ul class="daftar angka">' +
      baris('Rata-rata bintang hari ini', S.dunia.ratingHari.n ? '★ ' + (S.dunia.ratingHari.total / S.dunia.ratingHari.n).toFixed(1).replace('.', ',') + ' dari ' + S.dunia.ratingHari.n + ' pembeli' : '-') +
      baris('Google Maps', S.dunia.maps.status === 'aktif' ? '★ ' + DUNIA.rataMaps(S).toFixed(1).replace('.', ',') + ' · ' + S.dunia.ulasan.length + ' ulasan' : 'belum terdaftar') +
      baris('Kebersihan', S.dunia.kotor < 25 ? 'bersih' : S.dunia.kotor < 55 ? 'mulai kotor' : 'kotor', S.dunia.kotor >= 55 ? 'rugi' : '') +
      baris('Pengikut Instagram / TikTok', S.dunia.sosmed.ig.toLocaleString('id-ID') + ' / ' + S.dunia.sosmed.tiktok.toLocaleString('id-ID')) + '</ul>' +
      (laris.length ? '<h3 class="subjudul">Menu terlaris</h3><ul class="daftar angka">' + laris.map(function (m) { return baris(esc(m.nama), h.menu[m.id] + ' gelas'); }).join('') + '</ul>' : '') +
      '<h3 class="subjudul">Uang sekarang</h3><ul class="daftar angka">' +
      baris('Laci: uang kecil', rupiah(S.uang.kecil)) + baris('Laci: Rp50.000 dan Rp100.000', rupiah(S.uang.besar)) +
      baris(esc(q.app) + ': bisa ditarik', rupiah(S.merchant.tersedia)) +
      baris(esc(q.app) + ': cair hari kerja berikutnya', rupiah(UANG.merchantTotal(S) - S.merchant.tersedia)) +
      baris('Rekening ' + esc(UANG.bankIni(S).nama), rupiah(S.bank.saldo)) + '</ul>' +
      (h.pribadi ? '<p class="catatan">Uang pribadi terpakai hari ini ' + rupiah(h.pribadi) + ' (makan, minum, barang kos). Tidak dihitung di laba usaha.</p>' : '') +
      (h.belanja ? '<p class="catatan">Belanja bahan hari ini ' + rupiah(h.belanja) + ' (uang keluar, sudah masuk stok).</p>' : '') +
      (STOK.menipis(S).length ? '<div class="isbat peringatan">Stok menipis: ' + STOK.menipis(S).map(function (id) { return esc(MN.BARANG[id].nama) + ' (' + STOK.sisaTeks(S, id) + ')'; }).join(', ') + '. Belanja lewat HP.</div>' : '') +
      '<p class="catatan">Omzet ' + rupiah(omzet) + ' hari ini.</p>';
  }
  function kapan(lagi) { return lagi === 0 ? 'hari ini' : lagi === 1 ? 'besok' : lagi + ' hari lagi'; }

  function bukaLaporan() {
    var bsk = S.hari + 1, isiHari = KAL.hariIni(S.hari), isiBesok = KAL.hariIni(bsk);
    var raya = KAL.berikutnya(bsk, 4);
    var isbat = '';
    var besokLebaran = (KAL.liburTahun(KAL.tgl(bsk).y)[bsk] || []).filter(function (x) { return x.jenis === 'libur' && (x.nama === 'Idulfitri' || x.nama === 'Iduladha'); })[0];
    var hariIniLebaran = (KAL.liburTahun(KAL.tgl(S.hari).y)[S.hari] || []).some(function (x) { return x.nama === 'Idulfitri' && x.jenis === 'libur'; });
    if (besokLebaran && !(besokLebaran.nama === 'Idulfitri' && hariIniLebaran)) isbat = '<div class="isbat">Sidang isbat malam ini: pemerintah menetapkan ' + besokLebaran.nama + ' jatuh besok, ' + namaTanggal(bsk, true) + '.</div>';
    bukaLembar('laporan',
      kepala('Laporan malam', 'Hari ke-' + S.hariKe + ' · ' + namaTanggal(S.hari, true)) +
      '<h3 class="subjudul">Hari ini</h3><ul class="daftar">' + isiHari.map(itemDaftar).join('') + '</ul>' +
      ringkasanJualan() +
      isbat +
      '<h3 class="subjudul">Besok, ' + esc(namaTanggal(bsk, true)) + '</h3><ul class="daftar">' + isiBesok.map(itemDaftar).join('') + '</ul>' +
      '<h3 class="subjudul">Hari raya terdekat</h3><ul class="daftar">' + raya.map(function (r) {
        return '<li class="libur"><span>' + esc(r.nama) + '</span><span>' + namaTanggal(r.n) + ', ' + kapan(r.lagi + 1) + '</span></li>';
      }).join('') + '</ul>' +
      '<div style="margin-top:18px"><button type="button" class="aksi" data-pulang>Pulang ke kos</button></div>');
    S.laporanDilihat = true; perbaruiAksi();
  }

  function bukaKalender(y, m) {
    if (y == null) { var t0 = KAL.tgl(S.hari); y = t0.y; m = t0.m; kal.pilih = S.hari; }
    kal.y = y; kal.m = m;
    var awal = KAL.dn(y, m, 1), dowAwal = KAL.tgl(awal).dow, jml = KAL.tgl(KAL.dn(y, m + 1, 1) - 1).d;
    var peta = KAL.liburTahun(y), sel = '';
    N.hariSingkat.forEach(function (h, i) { sel += '<div class="nh' + (i === 0 ? ' min' : '') + '">' + h + '</div>'; });
    for (var i = 0; i < dowAwal; i++) sel += '<div class="tg kosong"></div>';
    for (var d = 1; d <= jml; d++) {
      var n = awal + d - 1, lib = peta[n] || [], kls = ['tg'];
      if (lib.some(function (x) { return x.jenis === 'libur'; })) kls.push('libur');
      else if (lib.some(function (x) { return x.jenis === 'cuti'; })) kls.push('cuti');
      else if (KAL.tgl(n).dow === 0) kls.push('min');
      if (n === S.hari) kls.push('ini');
      if (n === kal.pilih) kls.push('pilih');
      if (n < S.hari) kls.push('lewat');
      var isiN = KAL.hariIni(n);
      var ev = isiN.some(function (x) { return x.jenis === 'event' && !/^(Ramadan|Musim mudik|Agustusan)/.test(x.nama); });
      if (isiN.some(function (x) { return /^Ramadan/.test(x.nama); })) kls.push('rmd');
      sel += '<button type="button" class="' + kls.join(' ') + '" data-tg="' + n + '" aria-label="' + esc(namaTanggal(n, true)) + '">' + d + (ev ? '<span class="titik"></span>' : '') + '</button>';
    }
    var tAwal = KAL.tgl(HARI_PERTAMA), tKini = KAL.tgl(S.hari);
    var bisaMundur = y * 12 + m > tAwal.y * 12 + tAwal.m, bisaMaju = y * 12 + m < tKini.y * 12 + tKini.m + 24;
    var pilih = kal.pilih != null && KAL.tgl(kal.pilih).m === m && KAL.tgl(kal.pilih).y === y ? kal.pilih : null;
    var detail = pilih != null ? '<h3 class="subjudul">' + esc(namaTanggal(pilih, true)) + (pilih === S.hari ? ' (hari ini)' : '') + '</h3><ul class="daftar">' +
      KAL.hariIni(pilih).map(itemDaftar).join('') + '</ul>' : '';
    var raya = KAL.berikutnya(S.hari, 5);
    bukaLembar('kalender',
      kepala(N.namaBulan[m - 1], 'Tahun ke-' + (y - TAHUN_DASAR),
        '<button type="button" class="panah" data-bulan="-1" aria-label="Bulan sebelumnya"' + (bisaMundur ? '' : ' disabled') + '>‹</button>',
        '<button type="button" class="panah" data-bulan="1" aria-label="Bulan berikutnya"' + (bisaMaju ? '' : ' disabled') + '>›</button>') +
      '<div class="grid-kal">' + sel + '</div>' +
      '<div class="keterangan"><span><i style="background:rgba(217,68,58,.5)"></i>Libur nasional</span><span><i style="background:rgba(232,137,46,.6)"></i>Cuti bersama</span><span><i style="background:var(--kunyit);border-radius:50%"></i>Event</span><span><i style="background:var(--kontainer);height:4px"></i>Ramadan</span></div>' +
      detail +
      '<h3 class="subjudul">Hari raya terdekat</h3><ul class="daftar">' + raya.map(function (r) {
        return '<li class="libur"><span>' + esc(r.nama) + '</span><span>' + namaTanggal(r.n) + ', ' + kapan(r.lagi) + '</span></li>';
      }).join('') + '</ul>');
  }

  function bukaLaporanSementara() {
    if (S.fase === 'malam') return bukaLaporan();
    bukaLembar('sementara', kepala('Jualan hari ini', 'Sampai pukul ' + jam(S.menit)) + ringkasanJualan());
  }
  var konfirmasiUlang = false;
  function bukaAtur() {
    var k = kotaIni(), lamaHari = (S.jamTutup - S.jamBuka) * 60 / MENIT_PER_DETIK / 60;
    bukaLembar('atur',
      kepala('Atur usaha', k.nama + ' · ' + k.provinsi) +
      '<div class="atur-baris"><div><b>Jam buka</b><span>Kedai buka otomatis pada jam ini</span></div><div class="langkah"><button type="button" data-jam="buka:-1" aria-label="Kurangi jam buka">−</button><output>' + jam(S.jamBuka * 60) + '</output><button type="button" data-jam="buka:1" aria-label="Tambah jam buka">+</button></div></div>' +
      '<div class="atur-baris"><div><b>Jam tutup</b><span>Lalu laporan malam muncul</span></div><div class="langkah"><button type="button" data-jam="tutup:-1" aria-label="Kurangi jam tutup">−</button><output>' + jam(S.jamTutup * 60) + '</output><button type="button" data-jam="tutup:1" aria-label="Tambah jam tutup">+</button></div></div>' +
      '<div class="atur-baris"><div><b>UMK ' + esc(k.nama) + '</b><span>Patokan gaji karyawan, berlaku 2026</span></div><b>' + rupiah(k.umk) + '</b></div>' +
      '<div class="atur-baris"><div><b>QRIS</b><span>' + esc(qrisIni().transfer) + '</span></div><b>' + esc(qrisIni().nama) + '</b></div>' +
      '<h3 class="subjudul">Ongkir antar</h3>' +
      langkahAtur('Tarif per km', 'ongkir:tarifKm', rupiah(S.aturAntar.tarifKm)) +
      langkahAtur('Ongkir minimum', 'ongkir:minimum', rupiah(S.aturAntar.minimum)) +
      langkahAtur('Gratis ongkir mulai', 'ongkir:gratisGelas', S.aturAntar.gratisGelas + ' gelas') +
      langkahAtur('Jarak antar maksimal', 'ongkir:maksKm', S.aturAntar.maksKm + ' km') +
      '<h3 class="subjudul">Menu & harga</h3>' + MN.MENU.map(function (m) {
        var ps = DUNIA.pasaran(S, m), posisi = m.harga > ps.maks ? ' (kemahalan)' : m.harga < ps.min ? ' (murah)' : '';
        return '<div class="atur-baris"><div><b>' + esc(m.nama) + '</b><span>Pasaran ' + rupiah(ps.min) + '–' + rupiah(ps.maks) + esc(posisi) + ' · HPP ' + rupiah(m.hpp) + ' · laba ' + Math.round((1 - m.hpp / m.harga) * 100) + '%</span></div>' +
          '<div class="langkah"><button type="button" data-jam="harga:' + m.id + ':-1" aria-label="Turunkan harga">−</button><output>' + rupiah(m.harga) + '</output><button type="button" data-jam="harga:' + m.id + ':1" aria-label="Naikkan harga">+</button></div></div>';
      }).join('') + '<p class="catatan">Pembeli membandingkan harga dengan harga wajar di sekitar. Terlalu mahal menurunkan bintang, terutama dari mahasiswa dan driver ojol.</p>' +
      '<p class="catatan">Pada kecepatan 1×, jam buka sampai tutup berjalan sekitar ' + Math.round(lamaHari) + ' menit nyata. Waktu berhenti saat lembar ini terbuka atau aplikasi ditinggal.</p>' +
      '<button type="button" class="bahaya" data-ulang>' + (konfirmasiUlang ? 'Tekan sekali lagi untuk menghapus simpanan' : 'Mulai ulang dari awal') + '</button>' +
      '<p class="catatan">Versi uji: penyempurnaan A (sajikan sekali tap, kebutuhan badan, kos).</p>');
  }
  function langkahAtur(judul, kunci, nilai) {
    return '<div class="atur-baris"><div><b>' + esc(judul) + '</b></div><div class="langkah"><button type="button" data-jam="' + kunci + ':-1" aria-label="Kurangi">−</button><output>' + esc(nilai) + '</output><button type="button" data-jam="' + kunci + ':1" aria-label="Tambah">+</button></div></div>';
  }
  var LANGKAH_ONGKIR = { tarifKm: [500, 0, 5000], minimum: [1000, 0, 15000], gratisGelas: [1, 1, 20], maksKm: [1, 2, 8] };
  function ubahJam(apa, d) {
    if (apa.indexOf('ongkir.') === 0) {
      var k = apa.slice(7), L = LANGKAH_ONGKIR[k]; S.aturAntar[k] = Math.max(L[1], Math.min(L[2], S.aturAntar[k] + d * L[0]));
      simpan(); var g0 = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = g0; return;
    }
    if (apa === 'buka') S.jamBuka = Math.max(5, Math.min(S.jamTutup - 4, S.jamBuka + d));
    else S.jamTutup = Math.max(S.jamBuka + 4, Math.min(24, S.jamTutup + d));
    simpan(); perbaruiHUD(true); bukaAtur();
  }

  /* ---------- HP dalam game ---------- */
  var app = { nama: null, pesan: '', salah: false, kurPlafon: 10e6, kurTenor: 24, tab: 'pasar', keranjang: { pasar: {}, grosir: {}, online: {}, sales: {} } };
  function hasilAksi(r, berhasil) { app.pesan = r === true ? berhasil : r; app.salah = r !== true; if (r === true) { simpan(); perbaruiHUD(true); } }
  function pesanApp() { return app.pesan ? '<p class="racik-pesan ' + (app.salah ? 'salah' : 'siap') + '">' + esc(app.pesan) + '</p>' : ''; }
  function tombolUang(aksi, jumlah) { return jumlah.map(function (j) { return '<button type="button" class="chip-tombol" data-aksi="' + aksi + ':' + j + '">' + (j === 'semua' ? 'Semua' : rupiah(j)) + '</button>'; }).join(''); }
  function kepalaApp(judul, sub) {
    return kepala(judul, sub, '<button type="button" class="panah" data-app="beranda" aria-label="Kembali ke beranda HP">‹</button>');
  }
  var APPS = [
    { id: 'bank', nama: function () { return UANG.bankIni(S).app; }, warna: function () { return UANG.bankIni(S).warna; }, huruf: function () { return UANG.bankIni(S).nama.charAt(0); } },
    { id: 'merchant', nama: function () { return UANG.qrisIni(S).app; }, warna: function () { return UANG.qrisIni(S).warna; }, huruf: function () { return UANG.qrisIni(S).nama.charAt(0); } },
    { id: 'laci', nama: function () { return 'Laci kas'; }, warna: function () { return '#b97a46'; }, huruf: function () { return 'Rp'; } },
    { id: 'belanja', nama: function () { return 'Belanja'; }, warna: function () { return '#1f8a80'; }, huruf: function () { return 'B'; } },
    { id: 'stok', nama: function () { return 'Stok'; }, warna: function () { return '#5b6b73'; }, huruf: function () { return STOK.menipis(S).length ? '!' : 'S'; } },
    { id: 'wa', nama: function () { return 'WhatsApp'; }, warna: function () { return '#25d366'; }, huruf: function () { var n = ANTAR.aktif(S).filter(function (p) { return p.status === 'baru'; }).length; return n ? String(n) : 'WA'; } },
    { id: 'ojol', nama: function () { return 'Mitra pesan-antar'; }, warna: function () { return '#00aa13'; }, huruf: function () { return 'Food'; } },
    { id: 'karyawan', nama: function () { return 'Karyawan'; }, warna: function () { return '#7a4fa0'; }, huruf: function () { return S.pelamar.length ? String(S.pelamar.length) : 'K'; } },
    { id: 'maps', nama: function () { return 'Google Maps'; }, warna: function () { return '#4285f4'; }, huruf: function () { return 'G'; } },
    { id: 'sosmed', nama: function () { return 'Media sosial'; }, warna: function () { return '#c13584'; }, huruf: function () { return 'IG'; } },
    { id: 'usaha', nama: function () { return 'Usaha'; }, warna: function () { return '#155e57'; }, huruf: function () { return 'U'; } },
    { id: 'menuku', nama: function () { return 'Racik menu'; }, warna: function () { return '#9a5a22'; }, huruf: function () { return 'R'; } },
    { id: 'pln', nama: function () { return 'PLN Mobile'; }, warna: function () { return '#00a2e9'; }, huruf: function () { return S.usaha.padam || S.rumah.padam ? '!' : 'PLN'; } },
    { id: 'toko', nama: function () { return 'Tokopedia'; }, warna: function () { return '#42b549'; }, huruf: function () { return 'T'; } },
    { id: 'motor', nama: function () { return 'Motor'; }, warna: function () { return '#d9443a'; }, huruf: function () { return 'M'; } },
    { id: 'pajak', nama: function () { return 'M-Pajak'; }, warna: function () { return '#f2a516'; }, huruf: function () { return '%'; } },
    { id: 'oss', nama: function () { return 'OSS'; }, warna: function () { return '#2f8f5b'; }, huruf: function () { return 'NIB'; } },
    { id: 'kalender', nama: function () { return 'Kalender'; }, warna: function () { return '#d9443a'; }, huruf: function () { return KAL.tgl(S.hari).d; } }
  ];
  function bukaHP(nama) {
    app.nama = nama || 'beranda';
    if (app.nama === 'kalender') return bukaKalender();
    var html;
    if (app.nama === 'beranda') {
      html = kepala('HP', jam(S.menit) + ' · ' + namaTanggal(S.hari, true)) + '<div class="hp-grid">' + APPS.map(function (a) {
        return '<button type="button" class="hp-app" data-app="' + a.id + '"><i style="background:' + a.warna() + '">' + esc(a.huruf()) + '</i>' + esc(a.nama()) + '</button>';
      }).join('') + '</div><p class="catatan">Setor, tarik, dan tukar uang hanya bisa saat kedai belum buka atau sudah tutup, karena harus pergi ke ATM atau warung.</p>';
    } else if (app.nama === 'bank') html = layarBank();
    else if (app.nama === 'kur') html = layarKur();
    else if (app.nama === 'merchant') html = layarMerchant();
    else if (app.nama === 'laci') html = layarLaci();
    else if (app.nama === 'pajak') html = layarPajak();
    else if (app.nama === 'oss') html = layarOss();
    else if (app.nama === 'belanja') html = layarBelanja();
    else if (app.nama === 'stok') html = layarStok();
    else if (app.nama === 'motor') html = layarMotor();
    else if (app.nama === 'kredit') html = layarKredit();
    else if (app.nama === 'ojol') html = layarOjol();
    else if (app.nama === 'karyawan') html = layarKaryawan();
    else if (app.nama === 'maps') html = layarMaps();
    else if (app.nama === 'usaha') html = layarUsaha();
    else if (app.nama === 'menuku') html = layarMenuku();
    else if (app.nama === 'pln') html = layarPln();
    else if (app.nama === 'toko') html = layarToko();
    else if (app.nama === 'sosmed') html = layarSosmed();
    else if (app.nama === 'staf') html = layarStaf();
    bukaLembar('hp', html);
  }
  function layarBank() {
    var b = UANG.bankIni(S), k = S.kur;
    var kur = k.status === 'menunggu' ? 'Pengajuan ' + rupiah(k.plafon) + ' sedang diproses' : k.status === 'aktif' ? 'Angsuran ' + rupiah(k.angsuran) + ' tiap tanggal ' + k.tempo + ', sisa ' + k.sisa + ' bulan' + (k.tunggakan ? ', tunggakan ' + rupiah(k.tunggakan) : '') : k.status === 'lunas' ? 'Lunas' : 'Belum punya';
    return kepalaApp(b.app, 'Rekening usaha ' + b.nama) +
      '<div class="saldo-besar"><small>Saldo</small><b>' + rupiah(S.bank.saldo) + '</b></div>' + pesanApp() +
      '<h3 class="subjudul">Setor tunai dari laci</h3><div class="chip-baris">' + tombolUang('setor', [100000, 500000, 'semua']) + '</div>' +
      '<h3 class="subjudul">Tarik tunai ke laci</h3><div class="chip-baris">' + tombolUang('tarik', [100000, 500000, 1000000]) + '</div>' +
      '<ul class="daftar angka" style="margin-top:14px">' + baris('Biaya admin', rupiah(b.admin) + ' sebulan') + baris('Transfer ke bank lain (BI-FAST)', rupiah(N.biFast)) +
      baris('Batas transfer ATM', rupiah(b.batasTransfer) + ' sehari') + '</ul>' +
      '<button type="button" class="baris-tombol" data-app="kur"><span><b>KUR mikro</b><small>' + esc(kur) + '</small></span><span>›</span></button>' +
      '<h3 class="subjudul">Mutasi</h3><ul class="daftar angka">' + (S.bank.mutasi.length ? S.bank.mutasi.slice(0, 15).map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada transaksi</span></li>') + '</ul>';
  }
  function layarKur() {
    var k = S.kur, syarat = UANG.syaratKur(S), a = UANG.angsuran(app.kurPlafon, app.kurTenor);
    var isi = '<ul class="daftar syarat">' + syarat.map(function (x) { return '<li class="' + (x.ok ? 'ok' : 'belum') + '"><span>' + (x.ok ? '✓ ' : '✗ ') + esc(x.teks) + '</span></li>'; }).join('') + '</ul>';
    if (k.status === 'aktif' || k.status === 'menunggu') isi += '<ul class="daftar angka" style="margin-top:10px">' + baris('Plafon', rupiah(k.plafon)) + baris('Tenor', k.tenor + ' bulan') + baris('Angsuran', rupiah(k.angsuran) + ' sebulan') +
      (k.status === 'menunggu' ? baris('Cair', namaTanggal(k.siapPada)) : baris('Sisa', k.sisa + ' bulan')) + '</ul>';
    else isi += '<h3 class="subjudul">Plafon</h3><div class="chip-baris">' + N.kur.plafon.map(function (p) { return '<button type="button" class="chip-tombol' + (p === app.kurPlafon ? ' pilih' : '') + '" data-aksi="kurPlafon:' + p + '">' + (p / 1e6) + ' juta</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Tenor</h3><div class="chip-baris">' + N.kur.tenor.map(function (t) { return '<button type="button" class="chip-tombol' + (t === app.kurTenor ? ' pilih' : '') + '" data-aksi="kurTenor:' + t + '">' + t + ' bulan</button>'; }).join('') + '</div>' +
      '<ul class="daftar angka" style="margin-top:10px">' + baris('Bunga', (N.kur.bunga * 100) + '% setahun') + baris('Angsuran', '<b>' + rupiah(a) + ' sebulan</b>', 'total') + '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="ajukanKur:1">Ajukan KUR</button></div>';
    return kepala('KUR mikro', UANG.bankIni(S).nama + ' · proses ' + N.kur.hariProses + ' hari', '<button type="button" class="panah" data-app="bank" aria-label="Kembali ke bank">‹</button>') + pesanApp() + isi +
      '<p class="catatan">Bank menyetujui kalau angsuran tidak lebih dari separuh rata-rata laba kotor kedai sebulan. Telat bayar tercatat di riwayat kredit.</p>';
  }
  function layarMerchant() {
    var q = UANG.qrisIni(S), sisaGratis = q.gratis === Infinity ? 'tanpa batas' : Math.max(0, q.gratis - S.merchant.tarikBulanIni) + ' kali lagi bulan ini';
    var kelas = (S.omzetTahun || 0) > N.mdr.batasMikro ? 'kecil' : 'mikro', m = N.mdr[kelas];
    return kepalaApp(q.app, 'Merchant QRIS ' + q.nama) +
      '<div class="saldo-besar"><small>Bisa ditarik</small><b>' + rupiah(S.merchant.tersedia) + '</b></div>' + pesanApp() +
      '<ul class="daftar angka">' + baris('Cair hari kerja berikutnya', rupiah(UANG.merchantTotal(S) - S.merchant.tersedia)) + baris('Transfer gratis ke bank', sisaGratis) +
      baris('Kelas usaha', 'Usaha ' + kelas) + baris('MDR QRIS', '0% sampai ' + rupiah(m.gratisSampai) + ', di atasnya ' + (m.tarif * 100).toFixed(1).replace('.', ',') + '%') + '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="tarikMerchant:1">Tarik semua ke ' + esc(UANG.bankIni(S).nama) + '</button></div>' +
      '<p class="catatan">' + esc(q.transfer) + '. Uang QRIS masuk keesokan hari kerja; Sabtu, Minggu, dan hari libur tidak dihitung.</p>';
  }
  function layarLaci() {
    return kepalaApp('Laci kas', 'Uang tunai di kedai') +
      '<div class="saldo-besar"><small>Total</small><b>' + rupiah(UANG.laci(S)) + '</b></div>' + pesanApp() +
      '<ul class="daftar angka">' + baris('Uang kecil (sampai Rp20.000)', rupiah(S.uang.kecil)) + baris('Rp50.000 dan Rp100.000', rupiah(S.uang.besar)) + '</ul>' +
      (S.dunia.cekUang ? '' : '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="cekUang:1">Beli alat cek uang palsu ' + rupiah(DUNIA.BIAYA.cekUang) + '</button></div>') +
      '<h3 class="subjudul">Tukar ke uang kecil</h3><div class="chip-baris">' + tombolUang('tukar', [50000, 100000, 200000]) + '</div>' +
      '<p class="catatan">Pembeli sering bayar pakai Rp50.000 atau Rp100.000. Kalau uang kecil habis, pembeli tidak bisa diberi kembalian: sebagian pindah ke QRIS, sisanya batal. Warung dan minimarket sekitar bisa menukar sampai ' + rupiah(UANG.BATAS_TUKAR_RECEH) + ' sehari.</p>';
  }
  function layarPajak() {
    var p = N.pajak, ot = S.omzetTahun || 0, persen = Math.min(100, ot / p.bebas * 100);
    var tagihan = S.pajak.tagihan.map(function (t, i) { return { t: t, i: i }; }).filter(function (x) { return !x.t.dibayar; });
    return kepalaApp('M-Pajak', 'PPh final UMKM 0,5% omzet') + pesanApp() +
      '<ul class="daftar angka">' + baris('Omzet tahun ini', rupiah(ot)) + baris('Omzet bulan ini', rupiah(S.pajak.omzetBulan)) + '</ul>' +
      '<div class="meteran"><i style="width:' + persen.toFixed(1) + '%"></i></div><p class="catatan" style="margin-top:6px">Omzet sampai ' + rupiah(p.bebas) + ' setahun bebas pajak. Lewat dari itu, kena ' + (p.tarif * 100).toFixed(1).replace('.', ',') + '% dan disetor paling lambat tanggal ' + p.jatuhTempo + ' bulan berikutnya.</p>' +
      '<h3 class="subjudul">Tagihan</h3><ul class="daftar angka">' + (tagihan.length ? tagihan.map(function (x) {
        return '<li><span>PPh ' + esc(x.t.bulan) + '<small>Jatuh tempo ' + namaTanggal(x.t.jatuhTempo) + (x.t.denda ? ' · denda ' + rupiah(x.t.denda) : '') + '</small></span><span><button type="button" class="chip-tombol" data-aksi="bayarPajak:' + x.i + '">Bayar ' + rupiah(x.t.jml + x.t.denda) + '</button></span></li>';
      }).join('') : '<li><span>Tidak ada tagihan</span></li>') + '</ul>';
  }
  function layarOss() {
    return kepalaApp('OSS', 'Perizinan berusaha') + pesanApp() + (S.nib
      ? '<div class="saldo-besar"><small>NIB terbit ' + namaTanggal(S.nib.n) + '</small><b>' + esc(S.nib.nomor) + '</b></div><p class="catatan">NIB dipakai untuk mengajukan KUR dan nanti untuk naik ke ruko.</p>'
      : '<p class="catatan">Nomor Induk Berusaha didaftarkan gratis lewat OSS. Tanpa NIB, kedai tidak bisa mengajukan KUR.</p><div style="margin-top:12px"><button type="button" class="aksi" data-aksi="nib:1">Daftar NIB gratis</button></div>');
  }
  /* ---------- aplikasi Motor dan Mitra pesan-antar ---------- */
  function persenBar(v) { return '<div class="meteran"><i style="width:' + Math.max(0, Math.min(100, v)).toFixed(0) + '%"></i></div>'; }
  function layarMotor() {
    var tab = app.motorTab || (S.motor ? 'garasi' : 'dealer'), m = S.motor, html = kepalaApp('Motor', S.motor ? S.motor.nama : 'Belum punya motor') +
      '<div class="chip-baris">' + [['garasi', 'Garasi'], ['dealer', 'Dealer'], ['bekas', 'Bekas']].map(function (t) { return '<button type="button" class="chip-tombol' + (t[0] === tab ? ' pilih' : '') + '" data-aksi="motorTab:' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' + pesanApp();
    if (tab === 'garasi') {
      if (!m) return html + '<p class="catatan">Tanpa motor, belanja ke pasar naik ojek ' + rupiah(N.ojek.pasar) + ' pulang-pergi, dan pesanan antar harus pakai kurir ' + esc(N.kurir.nama) + '. Pesanan tunai tidak bisa diantar.</p>';
      var listrik = m.bbm === 'listrik', hb = MOTOR.hargaBbm(S, m.bbm), oli = N.rawat.oliKm - (m.km - m.kmOli), sv = N.rawat.servisKm - (m.km - m.kmServis), pjk = MOTOR.tagihanPajak(S);
      html += '<div class="saldo-besar"><small>' + (listrik ? 'Baterai' : 'Bensin ' + N.bbm.nama[m.bbm]) + '</small><b>' + (listrik ? Math.round(m.baterai) + ' km' : m.isi.toFixed(1).replace('.', ',') + ' / ' + String(m.tangki).replace('.', ',') + ' L') + '</b>' + persenBar(listrik ? m.baterai / m.jarakPenuh * 100 : m.isi / m.tangki * 100) + '</div>' +
        '<ul class="daftar angka">' + baris('Kilometer', Math.round(m.km).toLocaleString('id-ID') + ' km') + (listrik ? '' : baris('Konsumsi', m.kml + ' km/liter')) +
        baris('Ganti oli', oli >= 0 ? 'dalam ' + Math.round(oli).toLocaleString('id-ID') + ' km' : 'lewat ' + Math.round(-oli).toLocaleString('id-ID') + ' km', oli < 0 ? 'rugi' : '') +
        baris('Servis berkala', sv >= 0 ? 'dalam ' + Math.round(sv).toLocaleString('id-ID') + ' km' : 'lewat ' + Math.round(-sv).toLocaleString('id-ID') + ' km', sv < 0 ? 'rugi' : '') +
        baris('Peluang mogok per perjalanan', (MOTOR.peluangMogok(S) * 100).toFixed(1).replace('.', ',') + '%') +
        baris('Muatan', MOTOR.muatan(S) + ' cup') +
        (m.bekas ? baris('Kondisi', 'Bekas ' + m.bekas.tahun + ', ' + m.bekas.kondisi) : '') +
        (m.kredit ? baris('Angsuran', rupiah(m.kredit.angsuran) + ' tiap tanggal ' + m.kredit.tempo + ', sisa ' + m.kredit.sisa + ' bulan' + (m.kredit.tunggakan ? ', nunggak ' + rupiah(m.kredit.tunggakan) : ''), m.kredit.tunggakan ? 'rugi' : '') : '') +
        baris('Pajak tahunan', pjk ? 'jatuh tempo ' + namaTanggal(m.pajakTempo) : (m.pajakTempo - S.hari) + ' hari lagi') + '</ul>' +
        '<div class="chip-baris">' + (listrik ? '' : '<button type="button" class="chip-tombol" data-aksi="bensin:1">Isi penuh (' + rupiah(hb) + '/L)</button>') +
        '<button type="button" class="chip-tombol" data-aksi="oli:1">Ganti oli ' + rupiah(N.rawat.oli) + '</button><button type="button" class="chip-tombol" data-aksi="servis:1">Servis ' + rupiah(N.rawat.servis) + '</button>' +
        (pjk ? '<button type="button" class="chip-tombol" data-aksi="pajakMotor:1">Bayar pajak ' + rupiah(pjk) + '</button>' : '') + '</div>' +
        '<h3 class="subjudul">Perlengkapan antar</h3><ul class="daftar angka">' + N.aksesoris.map(function (a) {
          return '<li><span>' + esc(a.nama) + '<small>' + esc(a.ket) + '</small></span><span>' + (m.aks[a.id] ? 'terpasang' : '<button type="button" class="chip-tombol" data-aksi="aks:' + a.id + '">' + rupiah(a.harga) + '</button>') + '</span></li>';
        }).join('') + '</ul><p class="catatan">Bensin, oli, servis, dan perlengkapan dibayar tunai dari laci.</p>';
      return html;
    }
    if (tab === 'dealer') return html + '<ul class="daftar belanja">' + N.motor.map(function (x) {
      return '<li><span><b>' + esc(x.nama) + '</b><small>' + (x.bbm === 'listrik' ? 'Listrik, sekitar ' + x.jarakPenuh + ' km sekali cas' : '±' + x.kml + ' km/l · ' + N.bbm.nama[x.bbm]) + ' · ' + esc(x.kelebihan) + '</small><small class="harga">' + rupiah(x.harga) + '</small></span>' +
        '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="tunai:' + x.id + '">Tunai</button><button type="button" class="chip-tombol pilih" data-aksi="kreditPilih:' + x.id + '">Kredit</button></span></li>';
    }).join('') + '</ul><p class="catatan">Harga OTR November 2026. Beli tunai dari rekening bank.</p>';
    return html + '<ul class="daftar belanja">' + S.pasarBekas.unit.map(function (u, i) {
      var b = N.motorBekas.filter(function (x) { return x.id === u.id; })[0];
      return '<li><span><b>' + esc(b.nama.replace(' (bekas)', '')) + ' ' + u.tahun + '</b><small>' + u.km.toLocaleString('id-ID') + ' km · kondisi ' + u.kondisi + ' · ' + esc(b.kelebihan) + '</small><small class="harga">' + rupiah(u.harga) + '</small></span>' +
        '<span><button type="button" class="chip-tombol pilih" data-aksi="bekas:' + i + '">Beli</button></span></li>';
    }).join('') + '</ul><p class="catatan">Iklan motor bekas berganti tiap minggu. Kondisi kurang berarti lebih sering mogok.</p>';
  }
  function layarKredit() {
    var x = N.motor.filter(function (m) { return m.id === app.kreditMotor; })[0], dp = app.kreditDp || 0.1, tenor = app.kreditTenor || 35, k = MOTOR.hitungKredit(x.harga, dp, tenor);
    return kepala('Kredit ' + x.nama, N.kreditMotor.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="motor" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3><div class="chip-baris">' + N.kreditMotor.dp.map(function (d) { return '<button type="button" class="chip-tombol' + (d === dp ? ' pilih' : '') + '" data-aksi="kreditDp:' + d + '">' + Math.round(d * 100) + '%</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Tenor</h3><div class="chip-baris">' + N.kreditMotor.tenor.map(function (t) { return '<button type="button" class="chip-tombol' + (t === tenor ? ' pilih' : '') + '" data-aksi="kreditTenor:' + t + '">' + t + ' bulan</button>'; }).join('') + '</div>' +
      '<ul class="daftar angka" style="margin-top:10px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + ' sebulan</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="kredit:1">Ajukan kredit</button></div>' +
      '<p class="catatan">Perkiraan: bunga flat sekitar 1,8% sebulan plus asuransi. Angsuran dipotong dari rekening tiap bulan; telat kena denda harian dan tercatat di riwayat kredit. Menunggak 3 bulan, motor ditarik.</p>';
  }
  function layarOjol() {
    var cair = S.payout.reduce(function (t, x) { return t + x.jml; }, 0);
    return kepalaApp('Mitra pesan-antar', 'GoFood, GrabFood, ShopeeFood') + pesanApp() +
      '<ul class="daftar pesanan">' + N.platform.map(function (pl) {
        var st = S.platform[pl.id], ket = st.status === 'aktif' ? 'Aktif. Pesanan masuk saat kedai buka.' : st.status === 'proses' ? 'Sedang diverifikasi, aktif ' + namaTanggal(st.aktifPada) + '.' : 'Belum terdaftar.';
        return '<li class="kartu-pesanan"><div><b><i class="tanda-qris" style="background:' + pl.warna + '"></i>' + esc(pl.nama) + '</b><small>' + esc(pl.app) + ' · komisi ' + Math.round(pl.komisi * 100) + '%</small><small class="status">' + esc(ket) + '</small></div>' +
          '<div class="chip-baris">' + (st.status === 'tidak' ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarOjol:' + pl.id + '">Daftar</button>' :
            [10, 20, 30].map(function (mk) { return '<button type="button" class="chip-tombol' + (mk === st.markup ? ' pilih' : '') + '" data-aksi="markup:' + pl.id + '-' + mk + '">Harga +' + mk + '%</button>'; }).join('')) + '</div></li>';
      }).join('') + '</ul>' +
      '<p class="catatan">Harga di aplikasi biasanya dinaikkan untuk menutup komisi. Contoh Kopsu Aren ' + rupiah(18000) + ' dengan +20% jadi ' + rupiah(21500) + ' di aplikasi. Pendapatan cair ke rekening hari kerja berikutnya' + (cair ? '; sedang menunggu cair ' + rupiah(cair) : '') + '.</p>';
  }

  /* ---------- aplikasi Usaha, Racik menu, PLN Mobile ---------- */
  function layarUsaha() {
    var u = S.usaha, t = USAHA.tempat(S), L = USAHA.LOKASI[u.lokasi], next = USAHA.TEMPAT[u.tier + 1];
    var html = kepalaApp('Usaha', t.nama + ' · ' + L.nama) + pesanApp() +
      '<ul class="daftar angka">' + baris('Tempat', esc(t.nama)) + baris('Kursi', t.kursi + ' kursi' + (u.tier === 4 ? ' ber-AC' : '')) +
      baris('Sewa', t.sewaTahun ? rupiah(USAHA.sewaTahun(S)) + ' setahun' : rupiah(USAHA.sewaBulan(S)) + ' sebulan') +
      baris('Listrik', t.listrik === 'numpang' ? 'numpang, ' + rupiah(t.listrikBulan) + ' sebulan' : 'PLN prabayar, sisa ' + u.kwh.toFixed(1).replace('.', ',') + ' kWh', u.padam ? 'rugi' : '') +
      (u.tunggakanSewa ? baris('Tunggakan sewa', rupiah(u.tunggakanSewa), 'rugi') : '') + '</ul>' +
      '<p class="catatan">' + esc(L.ket) + '</p>';
    if (u.bangun) html += '<div class="isbat">Pembangunan ' + esc(USAHA.TEMPAT[u.bangun.tier].nama) + ' selesai ' + namaTanggal(u.bangun.selesai) + '. Kedai tetap jualan selama dibangun.</div>';
    else if (next) {
      var biaya = next.biaya + (next.sewaTahun ? Math.round(next.sewaTahun * (USAHA.sewaTahun(S) ? 1 : 1)) : 0);
      html += '<h3 class="subjudul">Naik kelas</h3><div class="kartu-pesanan" style="padding:12px 14px;border-radius:14px;background:rgba(242,165,22,.14)"><b>' + esc(next.nama) + '</b>' +
        '<small>' + next.kursi + ' kursi · pembeli sekitar ' + Math.round(next.ramai / t.ramai * 100 - 100) + '% lebih banyak · selesai ' + next.hari + ' hari</small>' +
        '<small>' + (next.sewaTahun ? 'Renovasi ' + rupiah(next.biaya) + ' + sewa setahun di muka' : 'Biaya ' + rupiah(next.biaya) + ' · sewa lahan ' + rupiah(USAHA.sewaBulan(S, u.tier + 1)) + ' sebulan') + (next.butuhNib ? ' · butuh NIB' : '') + '</small>' +
        '<div style="margin-top:8px"><button type="button" class="aksi kecil" data-aksi="naik:1">Bangun sekarang</button></div></div>';
    }
    html += '<h3 class="subjudul">Alat</h3><ul class="daftar angka">' + Object.keys(USAHA.ALAT).map(function (id) {
      var a = USAHA.ALAT[id], sudah = USAHA.punya(S, id), bisa = u.tier >= a.tier;
      return '<li><span>' + esc(a.nama) + '<small>' + esc(a.ket) + (bisa ? '' : ' · mulai ' + esc(USAHA.TEMPAT[a.tier].nama.toLowerCase())) + '</small></span><span>' +
        (sudah ? 'terpasang' : '<button type="button" class="chip-tombol"' + (bisa ? '' : ' disabled') + ' data-aksi="alat:' + id + '">' + rupiah(a.harga) + '</button>') + '</span></li>';
    }).join('') + '</ul>';
    html += '<h3 class="subjudul">Cabang</h3>' + (u.cabang.length ? '<ul class="daftar angka">' + u.cabang.map(function (c) {
      var r = c.riwayat[c.riwayat.length - 1], staf = S.staf.filter(function (k) { return k.cabang === c.id; });
      return baris(esc(USAHA.LOKASI[c.lokasi].nama) + '<small>' + (S.hari < c.buka ? 'buka ' + namaTanggal(c.buka) : staf.length + ' karyawan' + (r ? ' · kemarin ' + r.gelas + ' gelas' : '')) + '</small>', r ? rupiah(r.laba) : '-', r && r.laba < 0 ? 'rugi' : '');
    }).join('') + '</ul>' : '') +
      '<div class="chip-baris">' + Object.keys(USAHA.LOKASI).map(function (id) { return '<button type="button" class="chip-tombol" data-aksi="cabang:' + id + '">Cabang ' + esc(USAHA.LOKASI[id].nama.toLowerCase()) + '</button>'; }).join('') + '</div>' +
      '<p class="catatan">Booth cabang ' + rupiah(12000000) + '. Butuh NIB dan kedai utama minimal kontainer 20 kaki. Tempatkan kepala toko dan barista di cabang lewat aplikasi Karyawan; hasil cabang disetor ke rekening tiap pagi.</p>';
    return html;
  }
  var racikan = { panas: false, dasar: 'kopi', susu: 'uht', manis: 'aren', harga: 0 };
  function layarMenuku() {
    if (S.hariKe < 7) return kepalaApp('Racik menu', 'Buat menu sendiri') + '<p class="catatan">Racik menu sendiri terbuka mulai hari ke-7, setelah kenal selera pembeli.</p>';
    var resep = USAHA.susunResep(racikan), hpp = USAHA.hppResep(resep), harga = racikan.harga || Math.ceil(hpp * 2.2 / 500) * 500;
    racikan.harga = harga;
    var bintang = USAHA.perkiraanBintang(resep);
    var pil = function (judul, kunci, opsi) {
      return '<h3 class="subjudul">' + judul + '</h3><div class="chip-baris">' + opsi.map(function (o) {
        var bisa = !o[2] || USAHA.bisaEspresso(S);
        return '<button type="button" class="chip-tombol' + (racikan[kunci] === o[0] ? ' pilih' : '') + '"' + (bisa ? '' : ' disabled') + ' data-aksi="racikan:' + kunci + '-' + (o[0] || '') + '">' + o[1] + '</button>';
      }).join('') + '</div>';
    };
    return kepalaApp('Racik menu', S.menuSendiri.length + ' dari 6 menu sendiri') + pesanApp() +
      pil('Panas atau es', 'panas', [[true, 'Panas'], [false, 'Es']]) +
      pil('Dasar', 'dasar', [['kopi', 'Kopi tubruk'], ['espresso', 'Espresso', true], ['teh', 'Teh'], ['matcha', 'Matcha'], ['cokelat', 'Cokelat']]) +
      pil('Susu', 'susu', [['', 'Tanpa susu'], ['uht', 'Susu UHT'], ['oat', 'Susu oat'], ['skm', 'Kental manis'], ['foam', 'Foam', true]]) +
      pil('Pemanis', 'manis', [['', 'Tanpa gula'], ['gula', 'Gula pasir'], ['aren', 'Gula aren'], ['sirup', 'Sirup rasa']]) +
      '<div class="saldo-besar" style="margin-top:14px"><small>Nama menu</small><b style="font-size:24px">' + esc(USAHA.namaUsul(racikan)) + '</b></div>' +
      '<ul class="daftar angka">' + baris('HPP', rupiah(hpp)) + '</ul>' +
      '<div class="atur-baris"><div><b>Harga jual</b><span>laba ' + Math.round((1 - hpp / harga) * 100) + '%</span></div><div class="langkah"><button type="button" data-aksi="racikanHarga:-1" aria-label="Turunkan">−</button><output>' + rupiah(harga) + '</output><button type="button" data-aksi="racikanHarga:1" aria-label="Naikkan">+</button></div></div>' +
      '<h3 class="subjudul">Dicoba lima pelanggan langganan</h3><ul class="daftar angka">' + Object.keys(bintang).map(function (j) {
        return baris(esc(MN.PEMBELI[j].nama), '★ ' + bintang[j].toFixed(1).replace('.', ','), bintang[j] < 3 ? 'rugi' : '');
      }).join('') + '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="simpanMenu:1">Masukkan ke menu</button></div>' +
      (S.menuSendiri.length ? '<h3 class="subjudul">Menu racikan sendiri</h3><ul class="daftar angka">' + S.menuSendiri.map(function (m) {
        return '<li><span>' + esc(m.nama) + '<small>HPP ' + rupiah(USAHA.hppResep(m.resep)) + ' · harga ' + rupiah((S.hargaMenu && S.hargaMenu[m.id]) || m.harga) + '</small></span><span><button type="button" class="chip-tombol" data-aksi="hapusMenu:' + m.id + '">Hapus</button></span></li>';
      }).join('') + '</ul>' : '') +
      '<p class="catatan">Bahan baru (susu oat, sirup, matcha) dibeli di aplikasi Belanja. Espresso dan foam butuh mesin espresso dan listrik.</p>';
  }
  function layarPln() {
    var u = S.usaha, t = USAHA.tempat(S), meter = app.meter || 'kos';
    var html = kepalaApp('PLN Mobile', 'Token listrik prabayar') + pesanApp() +
      '<div class="chip-baris"><button type="button" class="chip-tombol' + (meter === 'kos' ? ' pilih' : '') + '" data-aksi="meter:kos">Meteran kos</button><button type="button" class="chip-tombol' + (meter === 'kedai' ? ' pilih' : '') + '" data-aksi="meter:kedai">Meteran kedai</button></div>';
    if (meter === 'kedai' && t.listrik !== 'token') return html + '<p class="catatan">Kedai masih numpang listrik ke pemilik lahan, dibayar ' + rupiah(t.listrikBulan) + ' sebulan bersama sewa. Meteran prabayar sendiri dipasang saat naik ke kontainer 20 kaki.</p>';
    var kwh = meter === 'kos' ? S.rumah.kwh : u.kwh, padam = meter === 'kos' ? S.rumah.padam : u.padam;
    return html + '<div class="saldo-besar" style="margin-top:10px"><small>Sisa token ' + meter + '</small><b>' + kwh.toFixed(1).replace('.', ',') + ' kWh</b></div>' +
      (padam ? '<p class="racik-pesan salah">Listrik ' + meter + ' padam karena token habis.</p>' : '') +
      '<ul class="daftar angka">' + N.pln.nominal.map(function (n) {
        var tk = USAHA.token(S, n);
        return '<li><span>Token ' + rupiah(n) + '<small>dapat ' + tk.kwh.toFixed(1).replace('.', ',') + ' kWh</small></span><span><button type="button" class="chip-tombol" data-aksi="token:' + n + '">Bayar ' + rupiah(tk.bayar) + '</button></span></li>';
      }).join('') + '</ul>' +
      '<p class="catatan">Tarif ' + rupiah(N.pln.tarif) + ' per kWh (1.300 VA ke atas). kWh dihitung dari nominal dikurangi pajak penerangan jalan ' + (DIRI.kota(S).ppj * 100).toFixed(1).replace('.', ',') + '%; biaya admin aplikasi ' + rupiah(N.pln.admin) + '. ' +
      (meter === 'kos' ? 'Di kos: AC menyala saat kamu di kamar, kulkas 24 jam, TV dan PS saat dipakai.' : 'Di kedai: kulkas dan freezer 24 jam; mesin espresso, lampu, AC, dan TV saat buka.') + '</p>';
  }
  function layarToko() {
    return kepalaApp('Tokopedia', 'Isi kamar kos') + pesanApp() + '<ul class="daftar belanja">' + N.barangRumah.map(function (b) {
      var punya = DIRI.punya(S, b.id), jml = S.rumah.barang[b.id];
      return '<li><span><b>' + esc(b.nama) + '</b><small>' + esc(b.merek) + ' · ' + esc(b.ket) + '</small><small class="harga">' + rupiah(b.harga) + (b.banyak && jml ? ' · punya ' + jml : '') + '</small></span>' +
        '<span>' + (punya && !b.banyak ? 'sudah punya' : '<button type="button" class="chip-tombol pilih" data-aksi="barang:' + b.id + '">Beli</button>') + '</span></li>';
    }).join('') + '</ul><p class="catatan">Kos sudah ada kasur, lemari, dan AC. Barang dibayar dari rekening dan langsung dikirim ke kos. PS5: harga resmi Oktober 2026; barang lain perkiraan harga pasar.</p>';
  }

  /* ---------- aplikasi Google Maps dan Media sosial ---------- */
  function layarMaps() {
    var d = S.dunia, m = d.maps, html = kepalaApp('Google Maps', 'Kopi terdekat') + pesanApp();
    if (m.status === 'tidak') html += '<p class="catatan">Kedai belum muncul di Google Maps. Daftarkan lewat Google Bisnisku; verifikasi sekitar 5 hari.</p><div style="margin-top:10px"><button type="button" class="aksi" data-aksi="maps:1">Daftar Google Bisnisku</button></div>';
    else if (m.status === 'proses') html += '<p class="catatan">Sedang diverifikasi, muncul ' + namaTanggal(m.aktifPada) + '.</p>';
    else html += '<div class="saldo-besar"><small>Kopi Kontainer · ' + d.ulasan.length + ' ulasan</small><b>★ ' + (d.ulasan.length ? DUNIA.rataMaps(S).toFixed(1).replace('.', ',') : '-') + '</b></div>';
    if (m.status !== 'tidak') html += '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="foto:1">Tambah foto (' + m.foto + '/5)</button><button type="button" class="chip-tombol" data-aksi="ulasanPalsu:1">Beli 10 ulasan bintang 5 ' + rupiah(DUNIA.BIAYA.ulasanPalsu) + '</button></div>';
    var ul = d.ulasan.map(function (u, i) { return { u: u, i: i }; }).slice(-12).reverse();
    if (ul.length) html += '<h3 class="subjudul">Ulasan terbaru</h3><ul class="daftar pesanan">' + ul.map(function (x) {
      return '<li class="kartu-pesanan"><div><b>' + '★★★★★'.slice(0, x.u.bintang) + '<span class="pudar">' + '★★★★★'.slice(0, 5 - x.u.bintang) + '</span> ' + esc(x.u.nama) + '</b><small>' + esc(x.u.teks) + '</small><small>' + namaTanggal(x.u.hari) + (x.u.balas ? ' · sudah dibalas' : '') + '</small></div>' +
        (x.u.balas ? '' : '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="balas:' + x.i + '">Balas dengan sopan</button></div>') + '</li>';
    }).join('') + '</ul>';
    html += '<h3 class="subjudul">Kedai kopi di sekitar</h3><ul class="daftar angka">' + d.pesaing.map(function (p) {
      return baris(esc(p.nama) + '<small>' + p.jarak.toLocaleString('id-ID') + ' km · kopi susu sekitar ' + rupiah(p.harga) + (S.hari <= p.promoSampai ? ' · sedang promo' : '') + '</small>', '★ ' + p.rating.toFixed(1).replace('.', ','));
    }).join('') + '</ul><p class="catatan">Urutan di pencarian "kopi terdekat" ditentukan jarak, bintang, jumlah ulasan, dan kelengkapan foto. Ulasan palsu bisa ketahuan dan dihapus Google.</p>';
    return html;
  }
  function layarSosmed() {
    var so = S.dunia.sosmed, tren = MN.MENU.filter(function (m) { return m.id === so.tren; })[0];
    return kepalaApp('Media sosial', 'Instagram, TikTok, WhatsApp Business') + pesanApp() +
      '<ul class="daftar angka">' + baris('Pengikut Instagram', so.ig.toLocaleString('id-ID')) + baris('Pengikut TikTok', so.tiktok.toLocaleString('id-ID')) + baris('Pelanggan langganan', S.dunia.langganan + ' orang') +
      baris('Tren minggu ini', esc(tren.nama)) + (S.hari <= so.viralSampai ? baris('Status', 'Sedang viral!', 'total') : '') + '</ul>' +
      '<h3 class="subjudul">Posting (15 menit)</h3><div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="post:ig">Foto menu di Instagram</button><button type="button" class="chip-tombol" data-aksi="post:tiktok">Video racik di TikTok</button></div>' +
      '<p class="catatan">Posting paling ramai dilihat pukul 19.00–21.00, lalu jam makan siang. Konten tentang menu yang sedang tren lebih mudah ramai.</p>' +
      '<h3 class="subjudul">WhatsApp Business</h3><div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="siaran:1">Kirim siaran promo ke langganan</button></div>' +
      '<h3 class="subjudul">Berbayar</h3><div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="iklan:1">Iklan 7 hari ' + rupiah(DUNIA.BIAYA.iklanSeminggu) + '</button>' +
      DUNIA.BIAYA.endorse.map(function (b, i) { return '<button type="button" class="chip-tombol" data-aksi="endorse:' + i + '">Endorse ' + ['mikro', 'menengah', 'besar'][i] + ' ' + rupiah(b) + '</button>'; }).join('') + '</div>' +
      '<p class="catatan">Viral itu dua sisi: antrean panjang datang, dan kalau kedai tidak sanggup melayani, bintang ikut jatuh.</p>';
  }

  /* ---------- aplikasi Karyawan ---------- */
  function bintang(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
  var NAMA_SIF = { pagi: 'Sif pagi', sore: 'Sif sore', penuh: 'Seharian (lembur)', ramai: 'Jam ramai sore' };
  function layarKaryawan() {
    var umk = STAF.umk(S), kls = STAF.kelasUsaha(S);
    var html = kepalaApp('Karyawan', 'UMK ' + kotaIni().nama + ' ' + rupiah(umk) + ' · usaha ' + kls) + pesanApp();
    html += S.staf.length ? '<ul class="daftar pesanan">' + S.staf.map(function (k) {
      var j = STAF.jamKerja(S, k), status = S.hari < k.mulai ? 'Mulai kerja besok' : S.hari < k.sakitSampai ? 'Sakit' : !STAF.masuk(S, k) ? 'Libur hari ini' : NAMA_SIF[k.sif] + ' ' + jam(j[0]) + '–' + jam(j[1]);
      return '<li class="kartu-pesanan"><button type="button" class="kartu-tombol" data-aksi="staf:' + k.id + '"><b>' + esc(k.nama) + (k.paruh ? ' · paruh waktu' : '') + '</b>' +
        '<small>' + k.tugas.map(function (t) { return STAF.TUGAS[t]; }).join(', ') + '</small><small class="status">' + esc(status) + '</small>' +
        '<span class="dua-bar"><span>Tenaga' + persenBar(k.tenaga) + '</span><span>Betah' + persenBar(k.setia) + '</span></span></button></li>';
    }).join('') + '</ul>' : '<p class="catatan">Belum ada karyawan. Pasang lowongan untuk mendapat pelamar.</p>';
    html += '<h3 class="subjudul">Lowongan</h3>' + (S.lowongan ? '<p class="catatan">Lowongan terpasang di ' + (S.lowongan.lewat === 'sosmed' ? 'media sosial' : 'papan depan kedai') + ' sampai ' + namaTanggal(S.lowongan.sampai) + '. Pelamar datang tiap pagi.</p>' :
      '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="lowongan:papan">Papan depan kedai (gratis)</button><button type="button" class="chip-tombol" data-aksi="lowongan:sosmed">Iklan media sosial ' + rupiah(KK_STAF_BIAYA()) + '</button></div>');
    if (S.pelamar.length) html += '<h3 class="subjudul">Pelamar</h3><ul class="daftar pesanan">' + S.pelamar.map(function (p) {
      return '<li class="kartu-pesanan"><div><b>' + esc(p.nama) + (p.paruh ? ' · paruh waktu' : '') + '</b><small>Racik ' + bintang(p.racik) + ' · Cepat ' + bintang(p.cepat) + ' · Ramah ' + bintang(p.ramah) + ' · Jujur ?</small>' +
        '<small>' + esc(p.agama) + ' · ' + (p.paruh ? 'dibayar per jam ' + rupiah(umk / 173) + ', tunai tiap hari' : 'minta gaji ' + rupiah(p.minta) + ' sebulan' + (p.minta < umk ? ' (di bawah UMK)' : '')) + '</small>' +
        '<small class="status">Menunggu jawaban sampai ' + namaTanggal(p.sampai - 1) + '</small></div>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="terimaPelamar:' + p.id + '">Terima</button><button type="button" class="chip-tombol" data-aksi="tolakPelamar:' + p.id + '">Tolak</button></div></li>';
    }).join('') + '</ul>';
    return html + '<p class="catatan">Usaha mikro dan kecil boleh menggaji di bawah UMK berdasarkan kesepakatan (PP 36/2021), tapi karyawan jadi kurang betah. Gaji dibayar dari rekening tiap ganti bulan, bersama iuran BPJS. THR dibayar otomatis H-7 hari raya agama masing-masing.</p>';
  }
  function KK_STAF_BIAYA() { return STAF.BIAYA_LOWONGAN; }
  function layarStaf() {
    var k = STAF.cari(S, app.stafId); if (!k) { app.nama = 'karyawan'; return layarKaryawan(); }
    var umk = STAF.umk(S), sifPilihan = k.paruh ? ['pagi', 'ramai'] : ['pagi', 'sore', 'penuh'];
    return kepala(k.nama, k.agama + ' · mulai ' + namaTanggal(k.mulai) + (k.paruh ? ' · paruh waktu' : ''), '<button type="button" class="panah" data-app="karyawan" aria-label="Kembali">‹</button>') + pesanApp() +
      '<ul class="daftar angka">' + baris('Racik', bintang(k.racik)) + baris('Cepat', bintang(k.cepat)) + baris('Ramah', bintang(k.ramah)) +
      baris('Tenaga', Math.round(k.tenaga) + '%', k.tenaga < 30 ? 'rugi' : '') + baris('Betah', Math.round(k.setia) + '%', k.setia < 35 ? 'rugi' : '') + baris('Gelas dibuat', k.gelas + ' gelas') + '</ul>' +
      '<h3 class="subjudul">Tugas</h3><div class="chip-baris">' + Object.keys(STAF.TUGAS).map(function (t) { return '<button type="button" class="chip-tombol' + (k.tugas.indexOf(t) >= 0 ? ' pilih' : '') + '" data-aksi="tugas:' + t + '">' + STAF.TUGAS[t] + '</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Jadwal</h3><div class="chip-baris">' + sifPilihan.map(function (x) { return '<button type="button" class="chip-tombol' + (k.sif === x ? ' pilih' : '') + '" data-aksi="sif:' + x + '">' + NAMA_SIF[x] + '</button>'; }).join('') + '</div>' +
      (k.paruh ? '' : '<div class="chip-baris">' + N.hariSingkat.map(function (h, i) { return '<button type="button" class="chip-tombol' + (k.libur === i ? ' pilih' : '') + '" data-aksi="libur:' + i + '">Libur ' + h + '</button>'; }).join('') + '</div>' +
        '<h3 class="subjudul">Gaji</h3><div class="atur-baris"><div><b>' + rupiah(k.gaji) + ' sebulan</b><span>' + (k.gaji >= umk ? 'Di atas UMK' : 'Di bawah UMK ' + rupiah(umk)) + ' · lembur bulan ini ' + rupiah(k.lemburBulan) + '</span></div><div class="langkah"><button type="button" data-aksi="gaji:-1" aria-label="Turunkan gaji">−</button><button type="button" data-aksi="gaji:1" aria-label="Naikkan gaji">+</button></div></div>') +
      (S.usaha.cabang.length ? '<h3 class="subjudul">Tempat kerja</h3><div class="chip-baris"><button type="button" class="chip-tombol' + (!k.cabang ? ' pilih' : '') + '" data-aksi="kerjaDi:utama">Kedai utama</button>' +
        S.usaha.cabang.map(function (c) { return '<button type="button" class="chip-tombol' + (k.cabang === c.id ? ' pilih' : '') + '" data-aksi="kerjaDi:' + c.id + '">Cabang ' + esc(USAHA.LOKASI[c.lokasi].nama.toLowerCase()) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="chip-baris" style="margin-top:12px"><button type="button" class="chip-tombol" data-aksi="kursus:1">Kursus barista ' + rupiah(STAF.BIAYA_KURSUS) + '</button></div>' +
      '<button type="button" class="bahaya' + (app.yakinPecat ? ' yakin' : '') + '" data-aksi="pecat:1">' + (app.yakinPecat ? 'Tekan sekali lagi: berhentikan dan bayar pesangon' : 'Berhentikan ' + esc(k.nama)) + '</button>' +
      '<p class="catatan">Sif 7 jam; lebih dari itu dihitung lembur (jam pertama 1,5 kali, berikutnya 2 kali upah sejam). Merangkap banyak tugas membuat kerja lebih lambat. Kebersihan dan media sosial mulai berpengaruh di versi berikutnya.</p>';
  }

  var NAMA_BAYAR = { tunai: function () { return 'Bayar tunai dari laci'; }, qris: function () { return 'Bayar pakai ' + UANG.qrisIni(S).app; },
    transfer: function () { return 'Transfer dari ' + UANG.bankIni(S).nama + ' (+' + rupiah(N.biFast) + ')'; }, tempo: function () { return 'Pesan, bayar 14 hari lagi'; } };
  function layarBelanja() {
    var tab = app.tab, T = STOK.TEMPAT[tab], kr = app.keranjang[tab];
    var html = kepalaApp('Belanja', 'Harga minggu ini') +
      '<div class="chip-baris">' + ['pasar', 'grosir', 'online', 'sales'].map(function (t) { return '<button type="button" class="chip-tombol' + (t === tab ? ' pilih' : '') + '" data-aksi="tab:' + t + '">' + STOK.TEMPAT[t].nama + '</button>'; }).join('') + '</div>' +
      '<p class="catatan">' + esc(T.ket) + '</p>' + pesanApp();
    var tagihan = S.tagihanSales.map(function (t, i) { return { t: t, i: i }; }).filter(function (x) { return !x.t.dibayar; });
    var listTagihan = tab === 'sales' && tagihan.length ? '<h3 class="subjudul">Tagihan sales</h3><ul class="daftar angka">' + tagihan.map(function (x) {
      return '<li><span>' + rupiah(x.t.jml) + '<small>Jatuh tempo ' + namaTanggal(x.t.jatuhTempo) + (x.t.denda ? ' · denda ' + rupiah(x.t.denda) : '') + '</small></span><span><button type="button" class="chip-tombol" data-aksi="bayarSales:' + x.i + '">Bayar</button></span></li>';
    }).join('') + '</ul>' : '';
    if (tab === 'sales' && !STOK.salesMampir(S)) return html + listTagihan;
    if (tab === 'pasar' && (S.fase === 'buka' || S.menit >= 720)) html += '<p class="racik-pesan salah">' + (S.fase === 'buka' ? 'Kedai sedang buka. Belanja pasar bisa dilakukan pagi sebelum kedai buka.' : 'Pasar sudah tutup.') + '</p>';
    html += '<ul class="daftar belanja">' + MN.URUT_BARANG.filter(function (id) { return MN.BARANG[id].ada.indexOf(tab) >= 0; }).map(function (id) {
      var b = MN.BARANG[id], h = STOK.harga(S, id, tab), ubah = b.tetap ? 0 : STOK.perubahan(S, id), n = kr[id] || 0;
      return '<li><span><b>' + esc(b.nama) + '</b><small>' + esc(b.merek) + ' · ' + esc(b.kemasan) + ' · stok ' + STOK.sisaTeks(S, id) + '</small>' +
        '<small class="harga">' + rupiah(h) + (ubah ? ' <em class="' + (ubah > 0 ? 'naik' : 'turun') + '">' + (ubah > 0 ? '▲ ' : '▼ ') + Math.abs(ubah) + '%</em>' : '') + '</small></span>' +
        '<span class="langkah"><button type="button" data-aksi="kurang:' + id + '" aria-label="Kurangi">−</button><output>' + n + '</output><button type="button" data-aksi="tambah:' + id + '" aria-label="Tambah">+</button></span></li>';
    }).join('') + '</ul>';
    var hit = STOK.hitung(S, tab, kr);
    if (hit.sub) html += '<ul class="daftar angka" style="margin-top:10px">' + baris('Belanjaan', rupiah(hit.sub)) + (hit.ongkos ? baris(esc(T.ongkosNama), rupiah(hit.ongkos)) : '') + baris('<b>Total</b>', '<b>' + rupiah(hit.total) + '</b>', 'total') + '</ul>' +
      (T.minimal && hit.sub < T.minimal ? '<p class="racik-pesan salah">Minimal pesanan ' + rupiah(T.minimal) + ', kurang ' + rupiah(T.minimal - hit.sub) + '.</p>' : '') +
      '<div class="bayar-baris">' + T.bayar.map(function (c) { return '<button type="button" class="aksi kecil" data-aksi="beli:' + c + '">' + esc(NAMA_BAYAR[c]()) + '</button>'; }).join('') + '</div>';
    else if (S.belanjaTerakhir[tab]) html += '<div style="margin-top:12px"><button type="button" class="tombol-lain gelap" data-aksi="ulangi:1">Isi seperti belanja terakhir</button></div>';
    return html + listTagihan;
  }
  function layarStok() {
    var html = kepalaApp('Stok', 'Bahan dan kemasan di kedai') + '<ul class="daftar angka">' + MN.URUT_BARANG.map(function (id) {
      var b = MN.BARANG[id], tipis = STOK.menipis(S).indexOf(id) >= 0;
      return baris(esc(b.nama) + '<small>Nilai ' + rupiah(S.stok[id].nilai) + '</small>', STOK.sisaTeks(S, id), tipis ? 'rugi' : '');
    }).join('') + '</ul>';
    if (S.uhtBuka.sisa > 0) html += '<p class="catatan">Susu UHT terbuka ' + Math.round(S.uhtBuka.sisa) + ' ml, basi ' + Math.max(0, STOK.UHT_TAHAN_HARI - (S.hari - S.uhtBuka.hari)) + ' hari lagi.</p>';
    html += '<p class="catatan">Es batu di cool box mencair sedikit demi sedikit dan habis semalam, jadi es dibeli tiap hari. Biji kopi paling enak dipakai dalam sebulan setelah dibuka.</p>';
    if (S.kiriman.length) html += '<h3 class="subjudul">Dalam perjalanan</h3><ul class="daftar angka">' + S.kiriman.map(function (k) {
      return baris(esc(k.dari) + '<small>' + k.barang.map(function (x) { return x.n + '× ' + esc(MN.BARANG[x.id].nama); }).join(', ') + '</small>', (k.tiba.hari === S.hari ? 'hari ini ' : namaTanggal(k.tiba.hari) + ' ') + jam(k.tiba.menit));
    }).join('') + '</ul>';
    return html;
  }
  function gelapSebentar() { var el = $('gelap'); el.hidden = false; el.classList.remove('jalan'); void el.offsetWidth; el.classList.add('jalan'); setTimeout(function () { el.hidden = true; }, 1300); }
  function belanja(cara) {
    var tab = app.tab, r = STOK.beli(S, tab, app.keranjang[tab], cara);
    if (r === true || (r && r.ok)) {
      app.keranjang[tab] = {};
      if (r.waktu) { gelapSebentar(); S.menit += r.waktu; hasilAksi(true, 'Pulang dari pasar pukul ' + jam(S.menit) + '. Belanjaan sudah masuk stok.'); }
      else if (r.tiba) hasilAksi(true, 'Pesanan dibuat. Sampai ' + (r.tiba.hari === S.hari ? 'hari ini' : namaTanggal(r.tiba.hari)) + ' sekitar pukul ' + jam(r.tiba.menit) + '.');
      else hasilAksi(true, 'Barang dari sales sudah masuk stok. Tagihan dibayar 14 hari lagi.');
    } else hasilAksi(r);
  }
  function aksiHP(nama, nilai) {
    var v = nilai === 'semua' ? Infinity : +nilai;
    if (nama === 'tab') { app.tab = nilai; app.pesan = ''; }
    else if (nama === 'tambah') { var k = app.keranjang[app.tab]; k[nilai] = Math.min(50, (k[nilai] || 0) + 1); app.pesan = ''; }
    else if (nama === 'kurang') { var k2 = app.keranjang[app.tab]; k2[nilai] = Math.max(0, (k2[nilai] || 0) - 1); app.pesan = ''; }
    else if (nama === 'ulangi') { app.keranjang[app.tab] = JSON.parse(JSON.stringify(S.belanjaTerakhir[app.tab] || {})); app.pesan = ''; }
    else if (nama === 'beli') belanja(nilai);
    else if (nama === 'naik') { var rn = USAHA.naikKelas(S); hasilAksi(rn && rn.ok ? true : rn, rn && rn.ok ? 'Pembangunan dimulai, selesai ' + namaTanggal(rn.selesai) + '.' : ''); }
    else if (nama === 'alat') hasilAksi(USAHA.beliAlat(S, nilai), USAHA.ALAT[nilai].nama + ' terpasang.');
    else if (nama === 'cabang') hasilAksi(USAHA.bukaCabang(S, nilai), 'Booth cabang dipasang, buka 2 hari lagi. Tempatkan karyawan di sana.');
    else if (nama === 'meter') { app.meter = nilai; app.pesan = ''; }
    else if (nama === 'barang') hasilAksi(DIRI.beliBarang(S, nilai), DIRI.barang(nilai).nama + ' sudah sampai di kos.');
    else if (nama === 'token' && (app.meter || 'kos') === 'kos') { var rk = DIRI.beliTokenKos(S, v); hasilAksi(rk && rk.ok ? true : rk, rk && rk.ok ? 'Token kos masuk ' + rk.kwh.toFixed(1).replace('.', ',') + ' kWh, dibayar ' + rupiah(rk.bayar) + '.' : ''); }
    else if (nama === 'token') { var rt = USAHA.beliToken(S, v); hasilAksi(rt && rt.ok ? true : rt, rt && rt.ok ? 'Token kedai masuk ' + rt.kwh.toFixed(1).replace('.', ',') + ' kWh, dibayar ' + rupiah(rt.bayar) + '.' : ''); }
    else if (nama === 'racikan') { var pr = nilai.split('-'); racikan[pr[0]] = pr[0] === 'panas' ? pr[1] === 'true' : pr[1] || null; racikan.harga = 0; app.pesan = ''; }
    else if (nama === 'racikanHarga') { racikan.harga = Math.max(2000, racikan.harga + v * 500); }
    else if (nama === 'simpanMenu') { hasilAksi(USAHA.simpanMenu(S, racikan, racikan.harga), USAHA.namaUsul(racikan) + ' masuk menu. Pembeli mulai memesannya.'); DUNIA.terapkanHarga(S); }
    else if (nama === 'hapusMenu') { USAHA.hapusMenu(S, nilai); DUNIA.terapkanHarga(S); simpan(); app.pesan = ''; }
    else if (nama === 'kerjaDi') { STAF.cari(S, app.stafId).cabang = nilai === 'utama' ? null : nilai; simpan(); }
    else if (nama === 'maps') hasilAksi(DUNIA.daftarMaps(S), 'Pendaftaran dikirim. Verifikasi sekitar 5 hari.');
    else if (nama === 'foto') hasilAksi(DUNIA.tambahFoto(S), 'Foto kedai ditambahkan.');
    else if (nama === 'balas') hasilAksi(DUNIA.balas(S, +nilai), 'Ulasan sudah dibalas.');
    else if (nama === 'ulasanPalsu') hasilAksi(DUNIA.beliUlasan(S), '10 ulasan bintang 5 masuk. Semoga tidak ketahuan.');
    else if (nama === 'post') {
      var rpo = DUNIA.posting(S, nilai);
      if (rpo && rpo.ok) { if (S.fase === 'buka') lompatWaktu(15); else S.menit += 15; hasilAksi(true, 'Postingan dilihat sekitar ' + rpo.jangkauan.toLocaleString('id-ID') + ' orang, +' + rpo.baru + ' pengikut.' + (rpo.viral ? ' VIRAL! Siap-siap antrean panjang 3 hari.' : '')); }
      else hasilAksi(rpo);
    }
    else if (nama === 'siaran') hasilAksi(DUNIA.siaran(S), 'Siaran terkirim. Pesanan WhatsApp hari ini lebih ramai.');
    else if (nama === 'iklan') hasilAksi(DUNIA.iklan(S), 'Iklan berjalan 7 hari.');
    else if (nama === 'endorse') hasilAksi(DUNIA.endorse(S, +nilai), 'Selebgram sudah posting tentang kedai.');
    else if (nama === 'cekUang') hasilAksi(DUNIA.beliCekUang(S), 'Alat cek uang terpasang di laci.');
    else if (nama === 'lowongan') hasilAksi(STAF.pasangLowongan(S, nilai), 'Lowongan dipasang. Pelamar datang mulai besok pagi.');
    else if (nama === 'terimaPelamar') hasilAksi(STAF.terima(S, nilai), 'Karyawan baru mulai kerja besok.');
    else if (nama === 'tolakPelamar') { STAF.tolak(S, nilai); simpan(); app.pesan = ''; }
    else if (nama === 'staf') { app.stafId = nilai; app.nama = 'staf'; app.pesan = ''; app.yakinPecat = false; }
    else if (nama === 'tugas') { STAF.aturTugas(S, app.stafId, nilai); simpan(); }
    else if (nama === 'sif') { STAF.aturSif(S, app.stafId, nilai); simpan(); }
    else if (nama === 'libur') { STAF.aturLibur(S, app.stafId, nilai); simpan(); }
    else if (nama === 'gaji') hasilAksi(STAF.aturGaji(S, app.stafId, v), +nilai > 0 ? 'Gaji dinaikkan.' : 'Gaji diturunkan. Karyawan kecewa.');
    else if (nama === 'kursus') hasilAksi(STAF.kursus(S, app.stafId), 'Kursus dibayar. Besok ikut kursus, keahlian racik naik.');
    else if (nama === 'pecat') {
      if (!app.yakinPecat) app.yakinPecat = true;
      else { var rp2 = STAF.pecat(S, app.stafId); app.yakinPecat = false; if (rp2 && rp2.ok) { app.nama = 'karyawan'; hasilAksi(true, 'Karyawan diberhentikan, pesangon dan sisa gaji ' + rupiah(rp2.total) + '.'); } else hasilAksi(rp2); }
    }
    else if (nama === 'motorTab') { app.motorTab = nilai; app.pesan = ''; }
    else if (nama === 'tunai') { hasilAksi(MOTOR.beliTunai(S, nilai), 'Motor sudah di garasi. Bensin diisi sedikit dari dealer.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'kreditPilih') { app.kreditMotor = nilai; app.pesan = ''; app.nama = 'kredit'; }
    else if (nama === 'kreditDp') { app.kreditDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditTenor') { app.kreditTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kredit') { hasilAksi(MOTOR.beliKredit(S, app.kreditMotor, app.kreditDp || 0.1, app.kreditTenor || 35), 'Kredit disetujui. Motor sudah di garasi.'); if (S.motor) { app.nama = 'motor'; app.motorTab = 'garasi'; } }
    else if (nama === 'bekas') { hasilAksi(MOTOR.beliBekas(S, +nilai), 'Motor bekas sudah di garasi.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'bensin') { var rb = MOTOR.isiBensin(S); hasilAksi(rb && rb.ok ? true : rb, rb && rb.ok ? 'Isi ' + rb.liter.toFixed(1).replace('.', ',') + ' liter, ' + rupiah(rb.biaya) + '.' : ''); }
    else if (nama === 'oli') hasilAksi(MOTOR.rawat(S, 'oli'), 'Oli sudah diganti.');
    else if (nama === 'servis') hasilAksi(MOTOR.rawat(S, 'servis'), 'Motor sudah diservis.');
    else if (nama === 'aks') hasilAksi(MOTOR.beliAks(S, nilai), 'Perlengkapan sudah terpasang.');
    else if (nama === 'pajakMotor') hasilAksi(MOTOR.bayarPajak(S), 'Pajak motor lunas setahun.');
    else if (nama === 'daftarOjol') hasilAksi(ANTAR.daftar(S, nilai), 'Pendaftaran dikirim. Verifikasi sekitar 3 hari.');
    else if (nama === 'markup') { var pm = nilai.split('-'); ANTAR.aturMarkup(S, pm[0], +pm[1]); simpan(); app.pesan = ''; }
    else if (nama === 'bayarSales') hasilAksi(STOK.bayarSales(S, +nilai), 'Tagihan sales lunas.');
    else if (nama === 'setor') hasilAksi(UANG.setor(S, v === Infinity ? UANG.laci(S) : v), 'Setor tunai berhasil.');
    else if (nama === 'tarik') hasilAksi(UANG.tarik(S, v), 'Tarik tunai berhasil, uang masuk laci.');
    else if (nama === 'tukar') hasilAksi(UANG.tukarReceh(S, v), 'Uang besar sudah ditukar ke uang kecil.');
    else if (nama === 'tarikMerchant') hasilAksi(UANG.tarikMerchant(S), 'Saldo sudah masuk rekening.');
    else if (nama === 'bayarPajak') hasilAksi(UANG.bayarPajak(S, v), 'Pajak sudah disetor.');
    else if (nama === 'nib') hasilAksi(UANG.daftarNib(S), 'NIB terbit.');
    else if (nama === 'kurPlafon') { app.kurPlafon = v; app.pesan = ''; }
    else if (nama === 'kurTenor') { app.kurTenor = v; app.pesan = ''; }
    else if (nama === 'ajukanKur') hasilAksi(UANG.ajukanKur(S, app.kurPlafon, app.kurTenor), 'Pengajuan KUR dikirim. Hasilnya keluar dalam ' + N.kur.hariProses + ' hari.');
    var gulir = $('lembar-isi').scrollTop; bukaHP(app.nama); $('lembar-isi').scrollTop = (nama === 'beli' || nama === 'tab') ? 0 : gulir;
  }

  /* ---------- sajikan: tap menu jadi (tanpa racik bahan) ---------- */
  var WARNA_MENU = { aren: '#a8774e', klasik: '#c49a6c', hitam: '#3a2116', sanger: '#b78a5c', cokelat: '#6b3b25', teh: '#b8622a' };
  var animasi = false;
  function bukaRacik() {
    var o = JUAL.depan(); if (!o || S.fase !== 'buka') return;
    if (R && R.o === o) return;
    if (R && R.pesanan) tutupRacik();
    if (R) R.o.keadaan = 'antre';
    R = { o: o }; o.keadaan = 'dilayani';
    $('app').classList.add('meracik'); $('racik').hidden = false; $('bawah').hidden = true;
    gambarRacik('');
  }
  function tutupRacik() {
    if (!R || animasi) return;
    if (R.o.keadaan === 'dilayani') R.o.keadaan = 'antre';
    R = null; $('app').classList.remove('meracik'); $('racik').hidden = true;
    if (layar === 'main') $('bawah').hidden = false;
    perbaruiAksi();
  }
  function gambarRacik(pesan, salah) {
    var o = R.o, m = o.menu;
    $('r-nama').textContent = R.pesanan ? judulPesanan(R.pesanan) : 'Pesan ' + m.nama;
    $('r-harga').textContent = R.pesanan ? 'Siapkan ' + R.item.qty + '× ' + m.nama : rupiah(m.harga) + ' · bayar ' + (o.bayar === 'qris' ? 'QRIS' : 'tunai');
    var panas = m.panas || m.id === 'hitam' || m.id === 'sanger';
    $('r-gelas').className = 'gelas ' + (panas ? 'kertas' : 'plastik'); $('r-isi').innerHTML = '';
    $('r-resep').innerHTML = '';
    var n = R.pesanan ? R.item.qty : 1;
    $('r-bahan').innerHTML = MN.MENU.map(function (x) {
      var kurang = STOK.kurangResep(S, x, n) || (x.resep.some(function (r) { return MN.BAHAN[r[0]].butuhAlat; }) && !USAHA.bisaEspresso(S) ? 'Mesin' : null);
      return '<button type="button" class="menu-kartu' + (kurang ? ' habis' : '') + (x.id === m.id ? ' dipesan' : '') + '" data-menu="' + x.id + '"><i style="background:' + (WARNA_MENU[x.id] || '#8a6a4a') + '"></i>' +
        '<b>' + esc(x.pendek) + '</b><small>' + (kurang ? esc(kurang) + ' habis' : rupiah(x.harga)) + '</small></button>';
    }).join('');
    var p = $('r-pesan'); p.textContent = pesan || 'Tap menu yang dipesan.';
    p.className = 'racik-pesan' + (salah ? ' salah' : '');
  }
  function tapMenu(id) {
    if (!R || animasi) return;
    var o = R.o, m = MN.MENU.filter(function (x) { return x.id === id; })[0];
    if (m.id !== o.menu.id) return gambarRacik('Bukan pesanannya. Yang dipesan ' + o.menu.nama + '.', true);
    if (m.resep.some(function (r) { return MN.BAHAN[r[0]].butuhAlat; }) && !USAHA.bisaEspresso(S)) return gambarRacik('Mesin espresso mati. Cek token listrik.', true);
    var n = R.pesanan ? R.item.qty : 1, kurang = STOK.kurangResep(S, m, n);
    if (kurang) return gambarRacik(kurang + ' habis. Belanja dulu lewat HP.', true);
    var x = STOK.pakaiResep(S, m, n); S.hariIni.operasional = (S.hariIni.operasional || 0) + x.operasional;
    animasi = true; ADEGAN.racikSaja();
    var lama = 750 * DIRI.lambat(S);
    $('r-isi').innerHTML = '<i style="background:' + (WARNA_MENU[m.id] || '#8a6a4a') + ';animation-duration:' + lama + 'ms"></i>';
    var kartu = $('r-bahan').querySelector('[data-menu="' + id + '"]'); if (kartu) kartu.classList.add('jadi');
    $('r-pesan').textContent = DIRI.lambat(S) > 1 ? 'Badan capek, jadi lebih lambat...' : 'Menyiapkan...';
    setTimeout(function () { animasi = false; selesaiSaji(x.biaya); }, lama);
  }
  function selesaiSaji(biaya) {
    if (!R) return;
    S.diri.stamina = Math.max(0, S.diri.stamina - 0.3);
    if (R.pesanan) {
      var p = R.pesanan;
      if (p.status === 'batal') { S.hariIni.terbuang += biaya; R.o.keadaan = 'x'; tutupRacik(); return toast('Pesanan ini sudah dibatalkan.'); }
      ANTAR.itemSiap(S, p, R.item, biaya);
      var lanjutX = ANTAR.itemBerikut(p);
      if (lanjutX) { R = { pesanan: p, item: lanjutX, o: { menu: ANTAR.menuDari(lanjutX.menu), keadaan: 'dilayani', bayar: p.bayar } }; return gambarRacik('Lanjut menu berikutnya di pesanan ini.'); }
      R.o.keadaan = 'x'; tutupRacik();
      toast(p.jenis === 'ojol' ? 'Pesanan ' + judulPesanan(p) + ' siap, menunggu driver.' : 'Pesanan ' + judulPesanan(p) + ' siap diantar.', 2400);
      return perbaruiPesanan();
    }
    var o = R.o, hasil = JUAL.layani(S, o, biaya);
    if (hasil === false) toast('Uang kecil di laci tidak cukup untuk kembalian. Pembeli batal.', 2600);
    else if (typeof hasil === 'string' && hasil.indexOf('QRIS') >= 0) toast('Kembalian kurang, pembeli bayar pakai QRIS.', 2200);
    var lanjutO = JUAL.depan();
    if (lanjutO) { R = { o: lanjutO }; lanjutO.keadaan = 'dilayani'; gambarRacik(); }
    else tutupRacik();
    perbaruiHUD(true);
  }

  /* ---------- pesanan antar ---------- */
  function judulPesanan(p) {
    return p.jenis === 'wa' ? 'WhatsApp ' + p.nama : p.jenis === 'ojol' ? ANTAR.namaPlatform(p) + ' ' + p.nama : p.nama;
  }
  function racikPesanan(id) {
    var p = ANTAR.cari(S, id); if (!p) return;
    if (S.fase === 'malam') return toast('Kedai sudah tutup.');
    var x = ANTAR.itemBerikut(p); if (!x) return;
    if (R) { if (R.o.keadaan === 'dilayani' && !R.pesanan) R.o.keadaan = 'antre'; R = null; }
    tutupLembar();
    R = { pesanan: p, item: x, o: { menu: ANTAR.menuDari(x.menu), keadaan: 'dilayani', bayar: p.bayar } };
    $('app').classList.add('meracik'); $('racik').hidden = false; $('bawah').hidden = true;
    gambarRacik('');
  }
  function perbaruiPesanan() {
    var a = ANTAR.aktif(S), b = $('b-pesanan');
    if (!a.length) { b.hidden = true; return; }
    var baru = a.filter(function (p) { return p.status === 'baru'; }).length, racik = a.filter(function (p) { return p.status === 'racik'; }).length, siap = a.filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; }).length;
    var bagian = []; if (baru) bagian.push(baru + ' baru'); if (racik) bagian.push(racik + ' perlu diracik'); if (siap) bagian.push(siap + ' siap antar');
    b.hidden = false; b.classList.toggle('ada-baru', baru > 0);
    b.textContent = 'Pesanan antar · ' + (bagian.join(' · ') || a.length + ' berjalan');
  }
  function kartuPesanan(p) {
    var gelas = ANTAR.jumlahGelas(p), nilai = ANTAR.nilaiMenu(p), tw = ANTAR.waktu(S);
    var isi = p.items.map(function (x) { return x.qty + '× ' + ANTAR.menuDari(x.menu).pendek + (x.siap >= x.qty ? ' ✓' : ''); }).join(', ');
    var info = p.jarak.toLocaleString('id-ID') + ' km · ' + (p.jenis === 'ojol' ? 'harga aplikasi ' + rupiah(nilai) : rupiah(nilai) + (p.ongkir ? ' + ongkir ' + rupiah(p.ongkir) : ' · gratis ongkir') + ' · bayar ' + (p.bayar === 'qris' ? 'QRIS' : p.bayar));
    var status = '', tombol = '';
    if (p.jenis === 'besar') info += ' · untuk ' + (Math.floor(p.untuk / 1440) === S.hari ? 'hari ini' : namaTanggal(Math.floor(p.untuk / 1440))) + ' pukul ' + jam(p.untuk % 1440);
    if (p.status === 'baru') {
      status = p.jenis === 'besar' ? 'Minta ' + p.minta + '. Bayar transfer setelah sampai.' : 'Balas dalam ' + Math.max(1, Math.ceil(15 - (tw - p.dibuat))) + ' menit atau pembeli batal.';
      tombol = '<button type="button" class="chip-tombol pilih" data-psn="terima:' + p.id + '">Terima</button><button type="button" class="chip-tombol" data-psn="tolak:' + p.id + '">Tolak</button>';
    } else if (p.status === 'racik') {
      status = p.jenis === 'ojol' ? 'Driver datang pukul ' + jam(p.driver % 1440) + '. Batal kalau lewat ' + jam((p.dibuat + 30) % 1440) + '.' : 'Perlu diracik ' + gelas + ' gelas.';
      tombol = '<button type="button" class="chip-tombol pilih" data-psn="racik:' + p.id + '">Racik</button>';
    } else if (p.status === 'siap') {
      if (p.jenis === 'ojol') status = 'Siap. Driver mengambil pukul ' + jam(Math.max(p.driver, tw) % 1440) + '.';
      else {
        status = 'Siap sejak ' + jam(p.siapPada % 1440) + '.';
        tombol = '<button type="button" class="chip-tombol pilih" data-psn="sendiri:' + p.id + '">Antar sendiri</button>' +
          (p.bayar !== 'tunai' ? '<button type="button" class="chip-tombol" data-psn="kurir:' + p.id + '">' + esc(N.kurir.nama) + ' ' + rupiah(ANTAR.tarifKurir(p.jarak)) + '</button>' : '');
      }
    } else if (p.status === 'jalan') status = esc(N.kurir.nama) + ' mengantar, sampai sekitar pukul ' + jam(p.eta % 1440) + '.';
    return '<li class="kartu-pesanan ' + p.jenis + '"><div><b>' + esc(judulPesanan(p)) + '</b><small>' + esc(isi) + '</small><small>' + esc(info) + '</small><small class="status">' + esc(status) + '</small></div>' +
      (tombol ? '<div class="chip-baris">' + tombol + '</div>' : '') + '</li>';
  }
  function bukaPesanan(pesan) {
    var a = ANTAR.aktif(S), siapSendiri = a.filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; });
    var urut = { baru: 0, racik: 1, siap: 2, jalan: 3 };
    a.sort(function (x, y) { return urut[x.status] - urut[y.status]; });
    var selesaiHariIni = S.pesanan.filter(function (p) { return (p.status === 'selesai' || p.status === 'batal') && Math.floor((p.selesai || p.dibuat) / 1440) === S.hari; });
    bukaLembar('pesanan', kepala('Pesanan antar', 'WhatsApp, aplikasi pesan-antar, dan pesanan besar') +
      (pesan ? '<p class="racik-pesan ' + (pesan.salah ? 'salah' : 'siap') + '">' + esc(pesan.teks) + '</p>' : '') +
      (siapSendiri.length > 1 ? '<div style="margin:6px 0 10px"><button type="button" class="aksi kecil" data-psn="semua:1">Antar ' + siapSendiri.length + ' pesanan sekaligus</button></div>' : '') +
      (a.length ? '<ul class="daftar pesanan">' + a.map(kartuPesanan).join('') + '</ul>' : '<p class="catatan">Belum ada pesanan. Pesanan WhatsApp datang saat kedai buka; daftar ke GoFood, GrabFood, atau ShopeeFood lewat HP untuk pesanan dari aplikasi.</p>') +
      (selesaiHariIni.length ? '<h3 class="subjudul">Hari ini</h3><ul class="daftar angka">' + selesaiHariIni.map(function (p) { return baris(esc(judulPesanan(p)), p.status === 'selesai' ? 'selesai' : esc(p.alasan || 'batal'), p.status === 'batal' ? 'rugi' : ''); }).join('') + '</ul>' : '') +
      '<p class="catatan">Pesanan tunai harus diantar sendiri. Antar sendiri saat kedai buka berarti kedai ditinggal: pembeli yang antre bisa pergi.</p>');
  }
  /* ---------- diri: kos, makan, tidur ---------- */
  function kepalaMasuk() { return S.staf.some(function (k) { return !k.cabang && k.tugas.indexOf('kepala') >= 0 && STAF.masuk(S, k); }); }
  function pindah(ke) {
    if (R) tutupRacik();
    if (ke === 'kos' && S.fase === 'buka' && !kepalaMasuk()) return toast('Kedai masih buka. Tutup kedai dulu lewat bar kebutuhan, atau tugaskan kepala toko.', 3000);
    var km = N.jarakKos, menit = 12, ket;
    if (MOTOR.punya(S) && MOTOR.cukup(S, km)) { var r = MOTOR.jalan(S, km, 1); menit = r.menit; ket = 'naik motor'; }
    else { if (UANG.laci(S) >= N.ojekKos) { MOTOR.bayarLaci(S, N.ojekKos); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + N.ojekKos; ket = 'naik ojek ' + rupiah(N.ojekKos); } else { menit = 40; ket = 'jalan kaki'; } }
    gelapSebentar();
    S.diri.posisi = ke; lompatWaktu(menit);
    simpan(); perbaruiAksi(); perbaruiHUD(true);
    toast((ke === 'kos' ? 'Sampai di kos' : 'Sampai di kedai') + ' pukul ' + jam(S.menit) + ', ' + ket + '.', 2400);
  }
  function tidurMalam() {
    var mulai = S.menit, t = DIRI.tidur(S, Math.min(S.menit, 1439), S.diri.bangun);
    S.tidurAnim = true; setTimeout(function () { S.tidurAnim = false; }, 1600);
    gelapSebentar();
    besok(S.diri.bangun);
    toast('Tidur ' + t.jam.toFixed(1).replace('.', ',') + ' jam' + (t.ac ? ' pakai AC.' : ', AC mati karena token habis, kurang nyenyak.'), 2600);
  }
  function isiKosAksi() {
    var malam = S.fase === 'malam', ada = function (id) { return DIRI.punya(S, id); };
    var tombol = [['makan:' + (ada('ricecooker') ? 'masak' : 'ojol'), ada('ricecooker') ? 'Masak' : 'Pesan makan'], ['makan:air', 'Minum']];
    if (ada('ps5') || ada('ps5disc')) tombol.push(['istirahat:ps', 'Main PS']);
    if (ada('tv')) tombol.push(['istirahat:tv', 'Nonton TV']);
    if (!malam) tombol.push(['istirahat:tidurSiang', 'Tidur siang']);
    if (malam) tombol.push(['bangun:-60', 'Bangun lebih pagi'], ['bangun:60', 'Bangun lebih siang']);
    $('kos-aksi').innerHTML = tombol.map(function (x) { return '<button type="button" class="chip-tombol" data-diri="' + x[0] + '">' + x[1] + '</button>'; }).join('');
  }
  function aksiDiri(nama, nilai) {
    var r;
    if (nama === 'makan') r = DIRI.makan(S, nilai);
    else if (nama === 'istirahat') r = DIRI.istirahat(S, nilai);
    else if (nama === 'bangun') { S.diri.bangun = Math.max(240, Math.min(720, S.diri.bangun + +nilai)); perbaruiAksi(); return; }
    else if (nama === 'pulang') { tutupLembar(); return pindah('kos'); }
    else if (nama === 'tutup') { tutupLembar(); if (S.fase === 'buka') { tutupKedai(); } return; }
    if (r && r.ok) { if (r.menit) lompatWaktu(r.menit); toast(r.teks, 2400); simpan(); perbaruiHUD(true); }
    else if (r) toast(r, 2600);
    if (lembar === 'diri') bukaDiri();
  }
  function bar(nama, v) { return '<span>' + nama + '<i class="meteran' + (v < 20 ? ' kritis' : '') + '"><i style="width:' + Math.round(v) + '%"></i></i></span>'; }
  function bukaDiri() {
    var d = S.diri, diKedai = d.posisi === 'kedai';
    bukaLembar('diri', kepala('Kondisi badan', diKedai ? 'Di kedai' : 'Di kos') +
      '<ul class="daftar angka">' + baris('Kenyang', Math.round(d.kenyang) + '%', d.kenyang < 20 ? 'rugi' : '') + baris('Minum', Math.round(d.minum) + '%', d.minum < 20 ? 'rugi' : '') +
      baris('Stamina', Math.round(d.stamina) + '%', d.stamina < 20 ? 'rugi' : '') + baris('Melek', Math.round(d.melek) + '%', d.melek < 20 ? 'rugi' : '') + '</ul>' +
      '<div class="chip-baris">' + (diKedai ? '<button type="button" class="chip-tombol" data-diri="makan:warung">Makan di warung ' + rupiah(DIRI.kota(S).makan) + ' (30 menit)</button><button type="button" class="chip-tombol" data-diri="makan:kopi">Ngopi</button>' : '') +
      '<button type="button" class="chip-tombol" data-diri="makan:ojol">Pesan GoFood</button><button type="button" class="chip-tombol" data-diri="makan:air">Minum</button>' +
      (diKedai && S.fase !== 'buka' ? '<button type="button" class="chip-tombol pilih" data-diri="pulang:1">Pulang ke kos</button>' : '') +
      (diKedai && S.fase === 'buka' ? '<button type="button" class="chip-tombol" data-diri="tutup:1">Tutup kedai sekarang</button>' : '') + '</div>' +
      '<p class="catatan">Lapar dan haus membuat stamina cepat habis. Stamina dan melek yang rendah membuat kamu lambat melayani dan kurang ramah; kalau terlalu mengantuk bisa ketiduran. Tidur di kos memulihkan; AC mati karena token habis membuat tidur kurang nyenyak.</p>');
  }

  /* ---------- karyawan bekerja ---------- */
  var ALAT = {
    ambilPembeli: function (k) {
      var o = JUAL.antre().filter(function (x) { return x.keadaan === 'antre' && !x.oleh && (!R || R.o !== x); })[0];
      if (!o) return null; o.keadaan = 'dilayani'; o.oleh = k.id; o.olehId = k.id; return o;
    },
    lepasPembeli: function (o) { o.keadaan = 'antre'; o.oleh = null; },
    buang: function (menu) { if (STOK.kurangResep(S, menu, 1)) return 0; var x = STOK.pakaiResep(S, menu, 1); S.hariIni.terbuang += x.biaya + x.operasional; return x.biaya + x.operasional; },
    buatGelas: function (menu, n) {
      var kurang = STOK.kurangResep(S, menu, n); if (kurang) return { ok: false, habis: kurang };
      var x = STOK.pakaiResep(S, menu, n); S.hariIni.operasional = (S.hariIni.operasional || 0) + x.operasional; return { ok: true, biaya: x.biaya };
    },
    ambilPesanan: function (k) {
      var p = ANTAR.aktif(S).filter(function (x) { return x.status === 'racik' && !x.sedangOleh && (!R || R.pesanan !== x); })[0];
      if (!p) return null; var x = ANTAR.itemBerikut(p); if (!x) return null;
      p.sedangOleh = { k: k }; return { p: p, item: { x: x, qty: x.qty, menuObj: ANTAR.menuDari(x.menu) } };
    },
    lepasPesanan: function (h) { h.p.sedangOleh = null; },
    punyaMotor: function () { return MOTOR.punya(S) && ANTAR.waktu(S) >= (S.motorSibukSampai || 0); },
    antar: function () {
      var ids = ANTAR.aktif(S).filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; }).map(function (p) { return p.id; });
      if (!ids.length) return null;
      var r = ANTAR.antarSendiri(S, ids); if (r && r.ok) S.motorSibukSampai = ANTAR.waktu(S) + r.menit; return r;
    },
    esTipis: function () { return S.stok.es.jml < 2000 && !S.kiriman.some(function (k) { return k.barang.some(function (b) { return b.id === 'es'; }); }); },
    pesanEs: function () { var r = STOK.beli(S, 'grosir', { es: 1 }, 'tunai'); return r && r.ok ? true : r; }
  };
  function langkahStaf(dMenit) {
    if (!S.staf.length) return [];
    S.bonusSabar = STAF.ada(S, 'kasir') ? 1.25 : 1;
    var kabar = STAF.kerja(S, dMenit, ALAT), tw = ANTAR.waktu(S);
    JUAL.semua().forEach(function (o) {
      if (o.selesaiOleh && tw >= o.selesaiOleh.pada) { var so = o.selesaiOleh; o.selesaiOleh = null; o.oleh = null; JUAL.layani(S, o, so.biaya, STAF.cari(S, o.olehId) || null); }
    });
    S.pesanan.forEach(function (p) {
      var so = p.sedangOleh; if (!so || !so.pada || tw < so.pada) return;
      p.sedangOleh = null; if (p.status === 'racik') ANTAR.itemSiap(S, p, so.item, so.biaya);
    });
    if (STAF.ada(S, 'kepala')) S.pesanan.forEach(function (p) { if (p.status === 'baru' && p.jenis !== 'ojol') { ANTAR.terima(S, p.id); kabar.push('Kepala toko menerima pesanan ' + judulPesanan(p) + '.'); } });
    return kabar;
  }
  function lompatWaktu(menit) {
    gelapSebentar();
    var kabar = [];
    for (var i = 0; i < menit; i++) {
      if (S.fase === 'buka' && S.menit + 1 >= S.jamTutup * 60) break;
      S.menit += 1;
      if (S.fase === 'buka') JUAL.langkah(S, 1);
      STOK.jalan(S, 1); DIRI.jalan(S, 1, S.diri.posisi === 'kedai' && S.fase === 'buka'); kabar = kabar.concat(langkahStaf(1), DUNIA.jalan(S, 1, STAF.ada(S, 'bersih')), USAHA.jalan(S, 1));
      kabar = kabar.concat(ANTAR.jalan(S, 1, MN.KERAMAIAN[Math.floor(S.menit / 60) % 24]));
    }
    return kabar;
  }
  function aksiPesanan(nama, id) {
    var r, kabar;
    if (nama === 'terima') r = ANTAR.terima(S, id);
    else if (nama === 'tolak') r = ANTAR.tolak(S, id);
    else if (nama === 'racik') return racikPesanan(id);
    else if (nama === 'kurir') r = ANTAR.pakaiKurir(S, id);
    else if (nama === 'sendiri' || nama === 'semua') {
      var ids = nama === 'semua' ? ANTAR.aktif(S).filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; }).map(function (p) { return p.id; }) : [id];
      if (R) tutupRacik();
      r = ANTAR.antarSendiri(S, ids);
      if (r && r.ok) {
        kabar = r.kabar.concat(lompatWaktu(r.menit));
        simpan(); perbaruiHUD(true); perbaruiPesanan();
        return bukaLembar('hasil', kepala('Pulang mengantar', 'Pukul ' + jam(S.menit)) + '<ul class="daftar kabar">' + kabar.map(function (k) { return '<li><span>' + esc(k) + '</span></li>'; }).join('') + '</ul>' +
          '<div style="margin-top:16px"><button type="button" class="aksi" data-tutup>Kembali ke kedai</button></div>');
      }
    }
    if (r === true) { simpan(); perbaruiHUD(true); }
    perbaruiPesanan();
    bukaPesanan(r === true ? null : { teks: r, salah: true });
  }

  /* ---------- putaran waktu ---------- */
  function putar(t) {
    var dt = tPrev ? Math.min(250, t - tPrev) : 16; tPrev = t;
    var main = layar === 'main' && S;
    var dMenit = 0, depanLama = main ? JUAL.depan() : null;
    if (main && !lembar && !document.hidden && S.kec > 0 && (S.fase !== 'malam' || S.diri.posisi === 'kos') && !animasi) {
      dMenit = dt / 1000 * MENIT_PER_DETIK * S.kec;
      S.menit += dMenit;
      if (S.fase === 'buka') JUAL.langkah(S, dMenit);
      var kabarStok = STOK.jalan(S, dMenit).concat(ANTAR.jalan(S, dMenit, MN.KERAMAIAN[Math.floor(S.menit / 60) % 24]), langkahStaf(dMenit), DUNIA.jalan(S, dMenit, STAF.ada(S, 'bersih')), USAHA.jalan(S, dMenit));
      if (kabarStok.length) { perbaruiHUD(true); perbaruiPesanan(); if (R && !animasi) gambarRacik(); }
      kabarStok = kabarStok.concat(DIRI.jalan(S, dMenit, S.diri.posisi === 'kedai' && S.fase === 'buka'));
      var kirimMakan = DIRI.cekKiriman(S); if (kirimMakan) kabarStok.push(kirimMakan);
      if (kabarStok.length) toast(kabarStok.join(' '), 2600);
      if (S.diri.ketiduran) { var kt = S.diri.ketiduran; S.diri.ketiduran = 0; lompatWaktu(kt); }
      if (S.fase === 'pagi' && S.menit >= S.jamBuka * 60 && (S.diri.posisi === 'kedai' || kepalaMasuk())) bukaKedai(true);
      if (S.diri.posisi === 'kos' && S.fase === 'malam' && S.menit >= 1440 + 120) { toast('Kamu ketiduran di kos.'); tidurMalam(); }
      if (S.fase === 'buka' && S.menit >= S.jamTutup * 60) tutupKedai();
      if (S.menit - menitSimpan >= 30) simpan();
    }
    if (main) {
      JUAL.bersihkan();
      if (R && R.o.keadaan !== 'dilayani') { tutupRacik(); toast('Pembeli pergi, kelamaan menunggu.'); }
      if (JUAL.depan() !== depanLama) perbaruiAksi();
      perbaruiHUD();
    }
    var ruang = layar !== 'main' ? 0 : R ? $('racik').offsetHeight : $('bawah').offsetHeight;
    ADEGAN.gambar(main ? { posisi: S.diri.posisi, barang: S.rumah.barang, tidur: !!S.tidurAnim, acNyala: !S.rumah.padam, menit: S.menit, buka: S.fase === 'buka', kecepatan: S.kec, jalan: !lembar && S.kec > 0 && S.fase !== 'malam', pembeli: JUAL.semua(), dMenit: dMenit, ruangBawah: ruang, motorParkir: S.motor && ANTAR.waktu(S) >= (S.motorSibukSampai || 0) ? S.motor.id : null, staf: S.staf.filter(function (k) { return STAF.hadir(S, k) && STAF.punyaTugas(k, 'barista'); }).length, hujan: DUNIA.hujanSekarang(S) ? (S.dunia.cuaca.banjir ? 2 : 1) : 0, kotor: S.dunia.kotor, tier: S.usaha.tier, kayu: USAHA.punya(S, 'kursiKayu'), padam: !USAHA.listrikNyala(S) }
      : { menit: 1050, buka: true, kecepatan: 1, jalan: true, pembeli: [], dMenit: 0 }, t);
    requestAnimationFrame(putar);
  }

  /* ---------- sentuhan ---------- */
  var SAPA = ['Siap, bos!', 'Kopi hari ini wangi.', 'Mau racik apa kita?', 'Semangat jualan!', 'Es batu aman, bos.'];
  function pasangEvent() {
    $('b-baru').onclick = function () { tampil('kota'); };
    $('b-kembali').onclick = function () { tampil('awal'); };
    $('b-lanjut').onclick = function () { var d = SIMPAN.baca(); if (d) lanjut(d); };
    $('kota-daftar').onclick = function (e) { var b = e.target.closest('[data-kota]'); if (b) { kotaDipilih = b.dataset.kota; tampil('lokasi'); } };
    $('lokasi-daftar').onclick = function (e) { var b = e.target.closest('[data-lokasi]'); if (b) { lokasiDipilih = b.dataset.lokasi; tampil('qris'); } };
    $('b-kembali-lokasi').onclick = function () { tampil('kota'); };
    $('qris-daftar').onclick = function (e) {
      var b = e.target.closest('[data-qris]'); if (!b) return;
      qrisDipilih = b.dataset.qris;
      if (kotaDipilih) tampil('bank');
      else if (S) { S.qris = qrisDipilih; simpan(); lanjut(S); }
    };
    $('bank-daftar').onclick = function (e) {
      var b = e.target.closest('[data-bank]'); if (!b) return;
      if (kotaDipilih) mulaiBaru(kotaDipilih, qrisDipilih, b.dataset.bank);
      else if (S) { UANG.siapkan(S, b.dataset.bank); simpan(); lanjut(S); }
    };
    $('b-kembali-bank').onclick = function () { tampil(kotaDipilih ? 'qris' : 'awal'); };
    $('b-kembali-qris').onclick = function () { tampil(kotaDipilih ? 'lokasi' : 'awal'); };
    $('b-aksi').onclick = function () {
      if (S.diri.posisi === 'kos') { if (S.fase === 'malam') tidurMalam(); else pindah('kedai'); return; }
      if (S.fase === 'pagi') bukaKedai(false); else if (S.fase === 'buka') bukaRacik(); else if (S.fase === 'malam') { if (S.laporanDilihat) pindah('kos'); else bukaLaporan(); }
    };
    $('kos-aksi').onclick = function (e) { var b = e.target.closest('[data-diri]'); if (b) { var dd = b.dataset.diri.split(':'); aksiDiri(dd[0], dd[1]); } };
    $('h-diri').onclick = function () { bukaDiri(); };
    $('r-bahan').onclick = function (e) { var b = e.target.closest('[data-menu]'); if (b) tapMenu(b.dataset.menu); };
    $('r-tunda').onclick = tutupRacik;
    $('b-kal').onclick = function () { bukaKalender(); };
    $('b-hp').onclick = function () { app.pesan = ''; bukaHP('beranda'); };
    $('b-pesanan').onclick = function () { bukaPesanan(); };
    $('h-uang').onclick = function () { if (S && S.fase !== 'pagi') bukaLaporanSementara(); };
    $('b-atur').onclick = function () { konfirmasiUlang = false; bukaAtur(); };
    document.querySelector('.kec').onclick = function (e) {
      var b = e.target.closest('[data-kec]'); if (!b) return;
      S.kec = +b.dataset.kec; perbaruiAksi(); simpan();
    };
    $('lembar').onclick = function (e) {
      if (e.target === $('lembar') || e.target.closest('[data-tutup]')) { tutupLembar(); return; }
      var b;
      if ((b = e.target.closest('[data-besok]'))) return besok();
      if ((b = e.target.closest('[data-pulang]'))) { tutupLembar(); return pindah('kos'); }
      if ((b = e.target.closest('[data-diri]'))) { var dd = b.dataset.diri.split(':'); return aksiDiri(dd[0], dd[1]); }
      if ((b = e.target.closest('[data-psn]'))) { var ps = b.dataset.psn.split(':'); return aksiPesanan(ps[0], ps.slice(1).join(':')); }
      if ((b = e.target.closest('[data-app]'))) { app.pesan = ''; if (b.dataset.app === 'wa') return bukaPesanan(); return bukaHP(b.dataset.app); }
      if ((b = e.target.closest('[data-aksi]'))) { var pa = b.dataset.aksi.split(':'); return aksiHP(pa[0], pa[1]); }
      if ((b = e.target.closest('[data-bulan]'))) { var m = kal.m + (+b.dataset.bulan), y = kal.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } return bukaKalender(y, m); }
      if ((b = e.target.closest('[data-tg]'))) { kal.pilih = +b.dataset.tg; return bukaKalender(kal.y, kal.m); }
      if ((b = e.target.closest('[data-jam]'))) { var p = b.dataset.jam.split(':'); if (p[0] === 'harga') { DUNIA.ubahHarga(S, p[1], +p[2]); simpan(); var g1 = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = g1; return; }
        if (p.length === 3) return ubahJam('ongkir.' + p[1], +p[2]); return ubahJam(p[0], +p[1]); }
      if ((b = e.target.closest('[data-ulang]'))) {
        if (!konfirmasiUlang) { konfirmasiUlang = true; return bukaAtur(); }
        SIMPAN.hapus(); S = null; konfirmasiUlang = false; JUAL.kosongkan(); tutupLembar(); tampil('awal');
      }
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lembar) tutupLembar(); });
    $('adegan').addEventListener('pointerdown', function (e) {
      if (layar !== 'main') return;
      var r = $('adegan').getBoundingClientRect(), kena = ADEGAN.ketuk(e.clientX - r.left, e.clientY - r.top);
      if (kena === 'pembeli' && S.fase === 'buka') bukaRacik();
      else if (kena === 'barista') toast(SAPA[Math.floor(Math.random() * SAPA.length)], 1400);
      else if (kena === 'kedai' && S.dunia.kotor >= 25 && S.fase !== 'malam') { DUNIA.bersihkan(S); if (S.fase === 'buka') lompatWaktu(10); perbaruiHUD(true); toast('Meja, konter, dan lantai sudah dibersihkan (10 menit).', 2000); }
      else if (kena === 'kedai' && S.fase === 'pagi') toast('Kedai buka pukul ' + jam(S.jamBuka * 60) + ', atau tekan Buka kedai sekarang.', 2000);
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) simpan(); else tPrev = 0; });
    window.addEventListener('pagehide', simpan);
  }

  /* ---------- mulai ---------- */
  var kunciLayar = null;
  function tahanLayar() {
    try { if (navigator.wakeLock && !kunciLayar && document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(function (k) { kunciLayar = k; k.addEventListener('release', function () { kunciLayar = null; }); }).catch(function () {}); } catch (e) {}
  }
  function mulai(data) {
    document.addEventListener('pointerdown', tahanLayar);
    document.addEventListener('visibilitychange', tahanLayar);
    ADEGAN.init($('adegan'));
    pasangEvent();
    if (data && data.S) lanjut(data.S); else tampil('awal');
    requestAnimationFrame(putar);
    if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|claudeusercontent/.test(location.hostname)) {
      try { navigator.serviceWorker.register('sw.js').catch(function () {}); } catch (e) {}
    }
  }
  var hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) hot.snapshot(function () { return { S: layar === 'main' ? S : null }; });
  if (hot && hot.ready) hot.ready(mulai); else mulai(hot && hot.data ? hot.data : {});
})();
