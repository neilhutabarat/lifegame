/* main.js — alur game: pilih kota dan QRIS, jam berjalan, buka-tutup kedai, racik dan jualan, laporan malam, kalender, simpan otomatis. */
(function () {
  'use strict';
  var KAL = window.KK_KAL, N = window.KK_NYATA, SIMPAN = window.KK_SIMPAN, ADEGAN = window.KK_ADEGAN, JUAL = window.KK_JUAL, MN = window.KK_MENU, UANG = window.KK_UANG, DIRI = window.KK_DIRI, STOK = window.KK_STOK, MOTOR = window.KK_MOTOR, ANTAR = window.KK_ANTAR, STAF = window.KK_STAF, DUNIA = window.KK_DUNIA, USAHA = window.KK_USAHA, MOBIL = window.KK_MOBIL, OJEK = window.KK_OJEK, PROPERTI = window.KK_PROPERTI, SUARA = window.KK_SUARA;
  var MENIT_PER_DETIK = 2.8125;         /* standar baru 1,5× lebih cepat dari sebelumnya (1,875 × 1,5) */
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
        '<span class="ciri">' + (b.tunai ? 'Tanpa biaya admin · transfer gratis ' + b.gratisTransfer + 'x sebulan · tanpa kartu ATM, setor dan tarik tunai di ' + b.tunai.tempat + ' ' + rupiah(b.tunai.biaya) : 'Admin ' + rupiah(b.admin) + ' sebulan · transfer ATM sampai ' + rupiah(b.batasTransfer) + ' sehari') + '</span></button>';
    }).join('');
  }
  /* lengkapi simpanan lama (tahap 1 dan 2) */
  function lengkapi(d) {
    d.v = 3;
    UANG.migrasi(d); d.tutupSementara = false;
    d.namaToko = d.namaToko || 'Kopi Kontainer';
    d.namaPemain = d.namaPemain || 'Pemilik';
    d.profil = d.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
    d.kec = 1; /* selalu 1,5x standar; waktu berhenti saat membuka menu HP / lembar */
    d.uang = d.uang || { laci: 0, merchant: 0 };
    if (typeof d.uang.dompet !== 'number') d.uang.dompet = 150000;
    d.hariIni = d.hariIni || JUAL.hariBaru();
    d.hariIni.tanpaKembalian = d.hariIni.tanpaKembalian || 0;
    STOK.siapkan(d); MOTOR.siapkan(d); MOBIL.siapkan(d); OJEK.siapkan(d); PROPERTI.siapkan(d); ANTAR.siapkan(d); STAF.siapkan(d); DUNIA.siapkan(d); USAHA.siapkan(d); DUNIA.terapkanHarga(d); DIRI.siapkan(d);
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
    var thn = KAL.tgl(S.hari).y, uPemain = KAL.usia(S.hari, S.profil && S.profil.tglLahir);
    $('h-tahun').textContent = thn + ' · Hari ke-' + S.hariKe + ' · ' + uPemain + ' thn';
    var ramadan = KAL.apakahRamadan(S.hari);
    var st = $('h-status');
    st.className = S.fase === 'buka' && !S.tutupSementara ? 'status-buka' : '';
    st.textContent = S.tutupSementara ? 'Tutup sementara' : (S.fase === 'pagi' && ramadan) ? 'Ramadan · Buka 16.00 (Takjil)' : S.fase === 'pagi' ? 'Buka pukul ' + jam(S.jamBuka * 60) : S.fase === 'buka' ? 'Buka sampai ' + jam(S.jamTutup * 60) : 'Tutup';
    var d = S.diri, batHp = Math.round((S.hp && S.hp.baterai != null) ? S.hp.baterai : 95);
    $('h-diri').innerHTML = bar('Makan', d.kenyang) + bar('Minum', d.minum) + bar('Stamina', d.stamina) + bar('Melek', d.melek) + bar('HB', d.hb || 0, true) + bar((S.hp && S.hp.cas ? '⚡HP' : '🔋HP'), batHp);
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', d.posisi === 'kos');
    $('h-laci').textContent = rupiahPendek(UANG.laci(S));
    if ($('h-dompet')) $('h-dompet').textContent = rupiahPendek(UANG.dompet(S));
    $('h-merchant').textContent = rupiahPendek(UANG.merchantTotal(S));
    $('h-bank').textContent = rupiahPendek(S.bank.saldo);
    $('h-bank-nama').textContent = UANG.bankIni(S).nama;
    $('h-merchant-nama').textContent = Object.keys(S.merchants).length > 1 ? 'QRIS' : qrisIni().nama;
    $('h-antre').textContent = JUAL.antre().length;
    if (paksa || Math.floor(S.menit) % 30 === 0) {
      var isi = KAL.hariIni(S.hari).filter(function (x) { return x.jenis !== 'suasana' || x.nama !== 'Car Free Day pagi' || S.menit < 600; });
      var tipis = S.fase !== 'malam' ? STOK.menipis(S) : [];
      var kelSakit = (S.keluarga || []).filter(function (kl) { return !!kl.sakit; });
      var tunggakGaji = STAF.totalTunggakanGaji ? STAF.totalTunggakanGaji(S) : 0;
      var chipDunia = (d.sakit ? '<span class="chip libur">Sakit: ' + esc(d.sakit.nama) + ' (Apotek)</span>' : '') +
        (d.hiv ? '<span class="chip libur">HIV+ · ' + ((S.kesehatan && S.kesehatan.arvSampai >= S.hari) ? 'ARV Aktif' : 'Beli ARV di Apotek!') + '</span>' : '') +
        (d.kesehatan != null && d.kesehatan < 60 ? '<span class="chip libur">Kesehatan ' + Math.round(d.kesehatan) + '%</span>' : '') +
        (tunggakGaji > 0 ? '<span class="chip libur">Tunggakan Gaji ' + STAF.maksHariTunggakan(S, S.hari) + '/90 hr (' + rupiahPendek(tunggakGaji) + ')</span>' : '') +
        (S.rentalPs && S.rentalPs.aktif ? '<span class="chip event">Rental PS: ' + S.rentalPs.unit.length + ' bilik · ' + rupiah((S.rentalPs.hariIni.omzetSewa || 0) + (S.rentalPs.hariIni.omzetMinum || 0)) + '</span>' : '') +
        (kelSakit.length ? '<span class="chip libur">' + esc(kelSakit[0].nama) + ' sakit (' + esc(kelSakit[0].sakit.nama) + ')</span>' : '') +
        ((d.hb || 0) >= 85 && DIRI.pasanganAktif(S) ? '<span class="chip event">HB memuncak · Pulang bersama ' + esc(DIRI.pasanganAktif(S).nama) + '</span>' : '') +
        (S.promoAktif ? '<span class="chip event">PROMO AKTIF</span>' : '') +
        (KAL.apakahRamadan(S.hari) ? '<span class="chip event">Ramadan Hari ke-' + KAL.apakahRamadan(S.hari) + ' · Jual Takjil 16.00</span>' : '') +
        (KAL.tanggalKembar(S.hari) ? '<span class="chip event">Diskon ' + KAL.tanggalKembar(S.hari) + ' Shopee/Tokopedia</span>' : '') +
        (S.usaha.berhentiSewa ? '<span class="chip">Fokus Ojol (sewa dihentikan)</span>' : '') +
        (S.tutupAntre ? '<span class="chip libur">Jam tutup · selesaikan antrean</span>' : '') +
        (S.ojek.online ? '<span class="chip event">Narik ' + esc(OJEK.platform(S.ojek.platform).nama) + ' · ' + S.ojek.hariIni.trip + ' order · ' + rupiah(S.ojek.hariIni.bersih) + '</span>' : '') + (S.diri.posisi === 'kos' && S.fase === 'buka' ? '<span class="chip libur">Kedai buka tanpa kamu</span>' : '') +
        (S.diri.posisi === 'kos' && S.fase === 'pagi' && S.menit >= S.jamBuka * 60 ? '<span class="chip libur">Kedai belum dibuka, kamu masih di ' + DIRI.tempat(S) + '</span>' : '') +
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
    var b = $('b-aksi'), diKos = S.diri.posisi === 'kos', ojek = S.ojek.online;
    var ka = $('kedai-aksi');
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', diKos);
    $('kos-aksi').hidden = !diKos;
    $('ojek-panel').hidden = !ojek; if (ojek) { panelOjek(true); }
    if (ka) {
      var tampilKedaiAksi = !diKos && !ojek;
      ka.hidden = !tampilKedaiAksi;
      if (tampilKedaiAksi) {
        var bisaNarik = N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
        ka.innerHTML = '<button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-kedai="promo">' + (S.promoAktif ? 'Promo ✓' : 'Promo') + '</button>' +
          '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-kedai="autoMakan">' + (S.autoMakanMinum ? 'Auto Makan ✓' : 'Auto Makan') + '</button>' +
          (S.fase === 'buka' ? '<button type="button" class="chip-tombol' + (S.tutupSementara ? ' pilih' : '') + '" data-kedai="sementara">' + (S.tutupSementara ? 'Buka kembali' : 'Tutup sementara') + '</button><button type="button" class="chip-tombol" data-kedai="tutupAwal">Tutup kedai</button>' :
            (!S.usaha.berhentiSewa ? '<button type="button" class="chip-tombol" data-kedai="bukaLagi">Buka kedai</button>' : '') +
            (bisaNarik ? '<button type="button" class="chip-tombol" data-kedai="narik">Narik ojol</button>' : '') +
            (S.fase === 'malam' ? '<button type="button" class="chip-tombol" data-kedai="laporan">Laporan</button>' : ''));
      }
    }
    if (ojek) { b.hidden = true; }
    else if (diKos) {
      b.hidden = false; b.disabled = false;
      var siapTidur = S.fase === 'malam' || (S.menit % 1440) >= 1200;
      b.textContent = siapTidur ? 'Tidur, bangun pukul ' + jam(S.diri.bangun) : 'Berangkat ke kedai';
      isiKosAksi();
    }
    else if (S.fase === 'pagi') {
      if (S.usaha.berhentiSewa) {
        b.hidden = true; /* saat tidak sewa kontainer, jangan munculkan tombol sewa kontainer di HUD */
      } else {
        var rmd = KAL.apakahRamadan(S.hari) > 0;
        b.hidden = false; b.disabled = false;
        b.textContent = (rmd && S.menit < 960) ? 'Buka jam 16.00 (Jual Takjil Ramadan)' : 'Buka kedai sekarang';
      }
    }
    else if (S.fase === 'buka') {
      var d = JUAL.depan(); b.hidden = false; b.disabled = !d || S.tutupSementara;
      b.textContent = S.tutupSementara ? 'Kedai tutup sementara' : d ? 'Sajikan ' + d.menu.pendek + (d.menu.cemilan ? '' : d.panas ? ' (Panas)' : ' (Es)') : S.tutupAntre ? 'Menutup kedai...' : 'Menunggu pembeli';
    }
    else {
      b.hidden = false; b.disabled = false;
      b.textContent = S.laporanDilihat ? 'Buka kedai lagi' : 'Lihat laporan harian';
    }
  }

  /* ---------- alur hari ---------- */
  function suasanaMusik(S) {
    if (KAL.apakahMalamTakbiran && KAL.apakahMalamTakbiran(S.hari, S.menit)) return 'takbiran';
    if (KAL.apakahRamadan && KAL.apakahRamadan(S.hari) > 0) return 'ramadan';
    return S.fase === 'buka' ? 'buka' : S.fase === 'malam' ? 'malam' : 'pagi';
  }
  function bukaKedai(otomatis) {
    if (S.fase === 'buka') return;
    if (otomatis && S.ojek && S.ojek.online) return; /* jangan paksa buka kedai saat sedang narik ojol */
    if (S.usaha && S.usaha.berhentiSewa) {
      if (!otomatis) toast('Sewa kontainer sedang dihentikan (fokus ojol). Aktifkan sewa lagi di aplikasi Usaha.', 2800);
      return;
    }
    var rmd = KAL.apakahRamadan(S.hari) > 0;
    if (rmd && S.menit < 960) {
      if (otomatis) return;
      S.menit = 960; /* Ramadan: siang tidak jualan, langsung lompat ke pukul 16.00 jualan takjil & kopi */
      gelapSebentar();
    }
    S.fase = 'buka'; S.tutupAntre = false; S.tutupSementara = false; S.tutupManualHari = -1;
    perbaruiAksi(); perbaruiHUD(true); simpan();
    if (SUARA) { SUARA.suasana(suasanaMusik(S)); SUARA.bunyi('buka'); }
    toast(rmd ? 'Pukul ' + jam(S.menit) + ', kedai buka sore spesial Ramadan & Takjil!' : otomatis ? 'Pukul ' + jam(S.menit) + ', kedai buka.' : 'Kedai dibuka pukul ' + jam(S.menit) + '.');
  }
  function tutupKedai(awal) {
    tutupRacik(); JUAL.tutup(); S.tutupSementara = false; S.tutupAntre = false;
    S.fase = 'malam';
    if (awal) S.tutupManualHari = S.hari;
    perbaruiAksi(); perbaruiHUD(true); simpan();
    if (SUARA) { SUARA.suasana(suasanaMusik(S)); SUARA.bunyi('tutup'); }
    toast(awal ? 'Kedai ditutup pukul ' + jam(S.menit) + '. Kamu bebas lanjut beraktivitas.' : 'Semua pelanggan selesai dilayani. Kedai tutup pukul ' + jam(S.menit) + '.');
    setTimeout(function () { if (S && S.fase === 'malam' && layar === 'main' && !lembar) bukaLaporan(); }, 700);
  }
  function besok(bangun) {
    var h = S.hariIni; h.tenagaKerja = STAF.biayaHarian(S); h.sewaHarian = sewaHarian(); h.rating = S.dunia.ratingHari.n ? S.dunia.ratingHari.total / S.dunia.ratingHari.n : 0;
    S.riwayat.push({ hari: S.hari, dilayani: h.dilayani, pergi: h.pergi, omzet: omzetTotal(h), laba: labaKotor(h), ojek: h.ojek || 0 });
    if (S.riwayat.length > 60) S.riwayat.shift();
    S.fase = 'pagi';
    var nLama = S.hari, kabar = UANG.gantiHari(S, S.hari, S.hari + 1);
    S.hari += 1; S.hariKe += 1; S.menit = bangun || 360; S.hariIni = JUAL.hariBaru(); JUAL.kosongkan(); S.laporanDilihat = false;
    if (SUARA) SUARA.suasana(suasanaMusik(S));
    kabar = STOK.gantiHari(S, nLama, S.hari).concat(kabar, MOTOR.gantiHari(S, nLama, S.hari), ANTAR.gantiHari(S, nLama, S.hari), STAF.gantiHari(S, nLama, S.hari), DUNIA.gantiHari(S, nLama, S.hari), USAHA.gantiHari(S, nLama, S.hari), DIRI.gantiHari(S, nLama, S.hari), MOBIL.gantiHari(S, nLama, S.hari), OJEK.gantiHari(S, nLama, S.hari), PROPERTI.gantiHari(S, nLama, S.hari));
    S.motorSibukSampai = 0;
    S.staf.forEach(function (k) {
      k.sibukSampai = 0;
      if (STAF.punyaTugas(k, 'belanja') && STAF.masuk(S, k) && S.belanjaTerakhir.pasar) {
        var rb = STOK.beli(S, 'pasar', JSON.parse(JSON.stringify(S.belanjaTerakhir.pasar)), 'tunai');
        kabar.push(rb && rb.ok ? k.nama + ' sudah belanja ke pasar seperti belanja terakhir.' : k.nama + ' tidak jadi belanja ke pasar: ' + rb);
      }
    });
    if (KAL.tgl(S.hari).y !== S.tahunOmzet) { S.tahunOmzet = KAL.tgl(S.hari).y; S.omzetTahun = 0; }
    if (S.profil && S.profil.tglLahir) {
      var tl = S.profil.tglLahir.split('-'), tb = KAL.tgl(S.hari);
      if (tl.length === 3 && tb.m === (+tl[1]) && tb.d === (+tl[2])) {
        kabar.unshift('Selamat ulang tahun ke-' + KAL.usia(S.hari, S.profil.tglLahir) + ', ' + (S.namaPemain || 'Pemilik') + '!');
      }
    }
    if (KAL.apakahRamadan(S.hari) === 1) kabar.unshift('Marhaban ya Ramadan! Selama bulan puasa, kedai tidak buka siang dan baru buka pukul 16.00 dengan menu takjil ramai.');
    if (KAL.tanggalKembar(S.hari)) kabar.unshift('Promo Tanggal Kembar ' + KAL.tanggalKembar(S.hari) + '! Ada diskon besar di Shopee dan Tokopedia hari ini.');
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
  function tutupLembar() { lembar = null; $('lembar').hidden = true; if (layar === 'main' && S) perbaruiAksi(); }

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
      baris('<b>Laba kotor kedai</b>', '<b>' + rupiah(labaKotor(h)) + '</b>', 'total') + '</ul>' +
      '<h3 class="subjudul">Closing harian (gabungan semua pekerjaan)</h3><ul class="daftar angka">' +
      baris('Laba kotor kedai kopi & cemilan', rupiah(labaKotor(h))) +
      baris('Pendapatan bersih Driver Ojol (' + S.ojek.hariIni.trip + ' order)', rupiah(h.ojek || 0)) +
      (h.mobil ? baris('Bisnis Mobil / Travel / Angkutan', rupiah(h.mobil)) : '') +
      (h.rental ? baris('Sewa & Rental Barang Milikmu', rupiah(h.rental)) : '') +
      ((h.rentalPs || (S.rentalPs && S.rentalPs.aktif)) ? baris('Usaha Rental PlayStation', rupiah(h.rentalPs || ((S.rentalPs.hariIni.omzetSewa || 0) + (S.rentalPs.hariIni.omzetMinum || 0)))) : '') +
      baris('<b>Total penghasilan bersih hari ini</b>', '<b>' + rupiah(labaKotor(h) + (h.ojek || 0) + (h.mobil || 0) + (h.rental || 0) + (h.rentalPs || (S.rentalPs && S.rentalPs.aktif ? (S.rentalPs.hariIni.omzetSewa || 0) + (S.rentalPs.hariIni.omzetMinum || 0) : 0))) + '</b>', 'total') + '</ul>' +
      '<h3 class="subjudul">Nilai dari pembeli</h3><ul class="daftar angka">' +
      baris('Rata-rata bintang hari ini', S.dunia.ratingHari.n ? '★ ' + (S.dunia.ratingHari.total / S.dunia.ratingHari.n).toFixed(1).replace('.', ',') + ' dari ' + S.dunia.ratingHari.n + ' pembeli' : '-') +
      baris('Google Maps', S.dunia.maps.status === 'aktif' ? '★ ' + DUNIA.rataMaps(S).toFixed(1).replace('.', ',') + ' · ' + S.dunia.ulasan.length + ' ulasan' : 'belum terdaftar') +
      baris('Kebersihan', S.dunia.kotor < 25 ? 'bersih' : S.dunia.kotor < 55 ? 'mulai kotor' : 'kotor', S.dunia.kotor >= 55 ? 'rugi' : '') +
      baris('Pengikut IG / Threads / TikTok', S.dunia.sosmed.ig.toLocaleString('id-ID') + ' / ' + (S.dunia.sosmed.threads || 0).toLocaleString('id-ID') + ' / ' + S.dunia.sosmed.tiktok.toLocaleString('id-ID')) + '</ul>' +
      (laris.length ? '<h3 class="subjudul">Menu terlaris</h3><ul class="daftar angka">' + laris.map(function (m) { return baris(esc(m.nama), h.menu[m.id] + ' gelas'); }).join('') + '</ul>' : '') +
      '<h3 class="subjudul">Uang sekarang</h3><ul class="daftar angka">' +
      baris('Laci: uang kecil', rupiah(S.uang.kecil)) + baris('Laci: Rp50.000 dan Rp100.000', rupiah(S.uang.besar)) +
      baris('QRIS: bisa ditarik', rupiah(UANG.tersedia(S))) +
      baris('QRIS: cair hari kerja berikutnya', rupiah(UANG.merchantTotal(S) - UANG.tersedia(S))) +
      baris('Rekening ' + esc(UANG.bankIni(S).nama), rupiah(S.bank.saldo)) + '</ul>' +
      (h.pribadi ? '<p class="catatan">Uang pribadi terpakai hari ini ' + rupiah(h.pribadi) + ' (makan, minum, barang ' + DIRI.tempat(S) + '). Tidak dihitung di laba usaha.</p>' : '') +
      (h.ojek ? '<p class="catatan">Ngojek hari ini: ' + S.ojek.hariIni.trip + ' order, pendapatan bersih ' + rupiah(h.ojek) + ' (di luar laba kedai).</p>' : '') +
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
      '<div class="bayar-baris" style="margin-top:18px"><button type="button" class="aksi" data-tutup>Lanjut beraktivitas</button><button type="button" class="tombol-lain gelap" data-pulang>Pulang ke ' + DIRI.tempat(S) + '</button></div>');
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
    var mOn = !SUARA || SUARA.musikOn(), eOn = !SUARA || SUARA.efekOn();
    var pr = S.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
    var usia = KAL.usia(S.hari, pr.tglLahir), thn = KAL.tgl(S.hari).y;
    bukaLembar('atur',
      kepala('Atur usaha', (S.namaToko || 'Kopi Kontainer') + ' · ' + k.nama + ' (' + thn + ')') +
      '<h3 class="subjudul">Identitas toko & pemain</h3>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px"><img src="img/char-pemain.jpg" alt="Pemain" style="width:60px;height:60px;border-radius:50%;object-fit:cover;border:2px solid rgba(31,138,128,.55)"><div><b>' + esc(S.namaPemain || 'Pemilik') + '</b><br><small>' + esc(S.namaToko || 'Kopi Kontainer') + ' · ' + usia + ' tahun</small></div></div>' +
      '<div class="atur-baris" style="display:block"><div><b>Nama toko</b><span>Ditampilkan di papan kontainer, Google Maps, dan laporan</span></div><input id="in-toko" class="input-teks" type="text" maxlength="24" value="' + esc(S.namaToko || 'Kopi Kontainer') + '"></div>' +
      '<div class="atur-baris" style="display:block"><div><b>Nama pemain</b><span>Nama pemilik rekening dan usaha</span></div><input id="in-pemain" class="input-teks" type="text" maxlength="24" value="' + esc(S.namaPemain || 'Pemilik') + '"></div>' +
      '<div class="atur-baris"><div><b>Gender karakter</b><span>Memengaruhi tampilan barista di kedai</span></div><div class="chip-baris" style="margin:0"><button type="button" class="chip-tombol' + (pr.gender === 'cewek' ? ' pilih' : '') + '" data-gender="cewek">Cewek</button><button type="button" class="chip-tombol' + (pr.gender === 'cowok' ? ' pilih' : '') + '" data-gender="cowok">Cowok</button></div></div>' +
      '<div class="atur-baris" style="display:block"><div><b>Tanggal lahir (TTL)</b><span>Tahun game ' + thn + ' · Usia saat ini: <b>' + usia + ' tahun</b></span></div><input id="in-ttl" class="input-teks" type="date" value="' + esc(pr.tglLahir || '1999-05-15') + '"><div style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-simpan-nama>Simpan profil & nama</button></div></div>' +
      '<h3 class="subjudul">Suara & lagu tema</h3>' +
      '<div class="atur-baris"><div><b>Lagu tema orisinal</b><span>Pagi, jam buka, dan malam beda suasana</span></div><div><button type="button" class="chip-tombol' + (mOn ? ' pilih' : '') + '" data-suara="musik">' + (mOn ? 'Nyala' : 'Mati') + '</button></div></div>' +
      '<div class="atur-baris"><div><b>Efek suara</b><span>Racik kopi, kasir, dan tombol</span></div><div><button type="button" class="chip-tombol' + (eOn ? ' pilih' : '') + '" data-suara="efek">' + (eOn ? 'Nyala' : 'Mati') + '</button></div></div>' +
      '<div class="atur-baris"><div><b>Promo</b><span>Meningkatkan pelanggan kedai, antar, & ojek/mobil secara acak 50%–80%</span></div><div><button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-promo="1">' + (S.promoAktif ? 'Aktif ✓' : 'Mati') + '</button></div></div>' +
      '<h3 class="subjudul">Jam operasional</h3>' +
      '<div class="atur-baris"><div><b>Jam buka</b><span>Kedai buka otomatis pada jam ini</span></div><div class="langkah"><button type="button" data-jam="buka:-1" aria-label="Kurangi jam buka">−</button><output>' + jam(S.jamBuka * 60) + '</output><button type="button" data-jam="buka:1" aria-label="Tambah jam buka">+</button></div></div>' +
      '<div class="atur-baris"><div><b>Jam tutup</b><span>Lalu laporan malam muncul</span></div><div class="langkah"><button type="button" data-jam="tutup:-1" aria-label="Kurangi jam tutup">−</button><output>' + jam(S.jamTutup * 60) + '</output><button type="button" data-jam="tutup:1" aria-label="Tambah jam tutup">+</button></div></div>' +
      '<div class="atur-baris"><div><b>UMK ' + esc(k.nama) + '</b><span>Patokan gaji karyawan, berlaku 2026</span></div><b>' + rupiah(k.umk) + '</b></div>' +
      '<div class="atur-baris"><div><b>QRIS terpasang</b><span>Tambah QRIS lain lewat aplikasi QRIS di HP</span></div><b>' + esc(Object.keys(S.merchants).map(function (id) { return UANG.qrisData(id).nama; }).join(', ')) + '</b></div>' +
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
    var g0 = $('lembar-isi').scrollTop;
    if (apa.indexOf('ongkir.') === 0) {
      var k = apa.slice(7), L = LANGKAH_ONGKIR[k]; S.aturAntar[k] = Math.max(L[1], Math.min(L[2], S.aturAntar[k] + d * L[0]));
      simpan(); bukaAtur(); $('lembar-isi').scrollTop = g0; return;
    }
    if (apa === 'buka') S.jamBuka = Math.max(5, Math.min(S.jamTutup - 4, S.jamBuka + d));
    else S.jamTutup = Math.max(S.jamBuka + 4, Math.min(24, S.jamTutup + d));
    simpan(); perbaruiHUD(true); bukaAtur(); $('lembar-isi').scrollTop = g0;
  }

  /* ---------- HP dalam game ---------- */
  var app = { nama: null, pesan: '', salah: false, kurPlafon: 10e6, kurTenor: 24, tab: 'pasar', gameTab: 'konsol', gameKonsolFilter: 'semua', keranjang: { pasar: {}, grosir: {}, online: {}, sales: {} } };
  function hasilAksi(r, berhasil) {
    app.pesan = r === true ? berhasil : r;
    app.salah = r !== true;
    if (SUARA) SUARA.bunyi(r === true ? 'beli' : 'salah');
    if (r === true) { simpan(); perbaruiHUD(true); perbaruiAksi(); }
  }
  function pesanApp() { return app.pesan ? '<p class="racik-pesan ' + (app.salah ? 'salah' : 'siap') + '">' + esc(app.pesan) + '</p>' : ''; }
  function tombolUang(aksi, jumlah) { return jumlah.map(function (j) { return '<button type="button" class="chip-tombol" data-aksi="' + aksi + ':' + j + '">' + (j === 'semua' ? 'Semua' : rupiah(j)) + '</button>'; }).join(''); }
  function kepalaApp(judul, sub) {
    return kepala(judul, sub, '<button type="button" class="panah" data-app="beranda" aria-label="Kembali ke beranda HP">‹</button>');
  }
  function svgIkon(isi) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + isi + '</svg>';
  }
  var APPS = [
    /* baris atas: ikon-ikon terpenting untuk aktivitas harian cepat */
    { id: 'driver', nama: function () { return 'Driver ojol'; }, warna: function () { return '#00aa13'; },
      ikon: function () { return svgIkon('<path d="M4 14a8 8 0 0 1 16 0v3H4v-3z"/><path d="M12 11h7.5v3H12z"/>'); },
      badge: function () { return S.ojek.online ? 'ON' : ''; } },
    { id: 'makan', nama: function () { return 'Makan & minum'; }, warna: function () { return '#e0675a'; },
      ikon: function () { return svgIkon('<path d="M7 3v8a2 2 0 0 0 4 0V3M9 3v18M16 3v18M16 3c2.5 0 3.5 2 3.5 5s-1 5-3.5 5"/>'); },
      badge: function () { return S.diri.kenyang < 25 || S.diri.minum < 25 ? '!' : ''; } },
    { id: 'keluarga', nama: function () { return 'Keluarga'; }, warna: function () { return '#e91e63'; },
      ikon: function () { return svgIkon('<circle cx="9" cy="7" r="3"/><circle cx="16.5" cy="9.5" r="2.3"/><path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2"/><path d="M14 19c0-2.1 1.5-3.8 3.5-3.8S21 16.9 21 19"/>'); },
      badge: function () { return (S.diri.hb || 0) >= 85 && DIRI.pasanganAktif(S) ? 'HB' : (S.keluarga && S.keluarga.length ? String(S.keluarga.length) : ''); } },
    { id: 'apotek', nama: function () { return 'Apotek K-24'; }, warna: function () { return '#00a651'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>'); },
      badge: function () { return S.diri.sakit || S.diri.hiv || (S.keluarga || []).some(function (k) { return !!k.sakit; }) ? '!' : ''; } },
    { id: 'pasarpokok', nama: function () { return 'Pasar Pokok'; }, warna: function () { return '#d87a16'; },
      ikon: function () { return svgIkon('<path d="M4 10h16l-1.5 9.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 10z"/><path d="M8 10V6.5a4 4 0 0 1 8 0V10"/>'); },
      badge: function () { return (!S.rumahTangga || (S.rumahTangga.aktifSampai || -1) < S.hari) ? '!' : ''; } },
    { id: 'rentalps', nama: function () { return 'Usaha Rental PS'; }, warna: function () { return '#1565c0'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="6" width="19" height="12" rx="3"/><path d="M7 12h4M9 10v4"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17.5" cy="13" r="1" fill="currentColor"/>'); },
      badge: function () { return S.rentalPs && S.rentalPs.aktif ? (S.rentalPs.padam ? '!' : String(S.rentalPs.unit.length)) : ''; } },
    { id: 'belanja', nama: function () { return 'Belanja'; }, warna: function () { return '#1f8a80'; },
      ikon: function () { return svgIkon('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 4h3l2.2 11h11.3l2-8H6.5"/>'); } },
    { id: 'stok', nama: function () { return 'Stok'; }, warna: function () { return '#5b6b73'; },
      ikon: function () { return svgIkon('<path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5zM3.5 8.5 12 13l8.5-4.5M12 13v7"/>'); },
      badge: function () { return STOK.menipis(S).length ? '!' : ''; } },
    { id: 'bank', nama: function () { return UANG.bankIni(S).app; }, warna: function () { return UANG.bankIni(S).warna; },
      ikon: function () { return svgIkon('<path d="M3 10h18M5 10v8M10 10v8M14 10v8M19 10v8M2 18h20M12 3 2 8v2h20V8z"/>'); } },
    { id: 'laci', nama: function () { return 'Laci & dompet'; }, warna: function () { return '#b97a46'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M15 14h3.5"/>'); } },
    { id: 'motor', nama: function () { return 'Kendaraan'; }, warna: function () { return '#d9443a'; },
      ikon: function () { return svgIkon('<path d="M4 14l2-5h12l2 5v4H4v-4z"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M6 14h12"/>'); } },
    { id: 'merchant', nama: function () { return Object.keys(S.merchants).length > 1 ? 'QRIS merchant' : UANG.qrisIni(S).app; }, warna: function () { return UANG.qrisIni(S).warna; },
      ikon: function () { return svgIkon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3h-3M14 20h7"/>'); } },
    { id: 'wa', nama: function () { return 'WhatsApp'; }, warna: function () { return '#25d366'; },
      ikon: function () { return svgIkon('<path d="M20 11.5A8 8 0 0 1 8.4 18.6L4 20l1.4-4.2A8 8 0 1 1 20 11.5z"/><path d="M9.5 9.2c.3-.5.7-.5 1 0l.7 1.3c.2.3.1.7-.2 1l-.4.4c.6 1.1 1.5 2 2.6 2.6l.4-.4c.3-.3.7-.4 1-.2l1.3.7c.5.3.5.7 0 1-.8.7-2 .9-3.1.4-2.1-.9-3.8-2.6-4.7-4.7-.5-1.1-.3-2.3.4-3.1z"/>'); },
      badge: function () { var n = ANTAR.aktif(S).filter(function (p) { return p.status === 'baru'; }).length; return n ? String(n) : ''; } },
    { id: 'ojol', nama: function () { return 'Mitra pesan-antar'; }, warna: function () { return '#00aa13'; },
      ikon: function () { return svgIkon('<circle cx="7" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M9.5 17H15l2-6h-5l-1.5 4M6 12h4l1-4H7M15 7h3l2 4"/>'); } },
    { id: 'karyawan', nama: function () { return 'Karyawan'; }, warna: function () { return '#7a4fa0'; },
      ikon: function () { return svgIkon('<circle cx="9.5" cy="8" r="3"/><path d="M3.5 19c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.2"/><path d="M17 13.5c2 0 3.5 1.3 3.5 3.5"/>'); },
      badge: function () { return S.pelamar.length ? String(S.pelamar.length) : ''; } },
    { id: 'menuku', nama: function () { return 'Racik menu'; }, warna: function () { return '#9a5a22'; },
      ikon: function () { return svgIkon('<path d="M5 10h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5v-5zM16 11h2a2.5 2.5 0 0 1 0 5h-2M8 6.5c0-1 .8-1.5.8-2.5M12 6.5c0-1 .8-1.5.8-2.5"/>'); } },
    { id: 'usaha', nama: function () { return 'Usaha'; }, warna: function () { return '#155e57'; },
      ikon: function () { return svgIkon('<path d="M3 9.5 4.8 4h14.4L21 9.5a2.5 2.5 0 0 1-4.5 1.5A2.5 2.5 0 0 1 12 11a2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 9.5zM5 12v8h14v-8"/>'); } },
    { id: 'gadget', nama: function () { return 'Gadget & Kuota'; }, warna: function () { return '#1e88e5'; },
      ikon: function () { return svgIkon('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5.5h4M12 18.5h.01"/>'); },
      badge: function () { return (S.hp && (S.hp.baterai < 20 || (!DIRI.adaWifi(S) && S.hp.kuota < 1))) ? '!' : ''; } },
    { id: 'maps', nama: function () { return 'Google Maps'; }, warna: function () { return '#4285f4'; },
      ikon: function () { return svgIkon('<path d="M12 21s6.5-5.7 6.5-11a6.5 6.5 0 1 0-13 0c0 5.3 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'); } },
    { id: 'sosmed', nama: function () { return 'Media sosial'; }, warna: function () { return '#c13584'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".8" fill="currentColor"/>'); } },
    { id: 'pln', nama: function () { return 'PLN Mobile'; }, warna: function () { return '#00a2e9'; },
      ikon: function () { return svgIkon('<path d="M13 2.5 5 13h6l-1 8.5L19 11h-6z" fill="currentColor" stroke="none"/>'); },
      badge: function () { return S.usaha.padam || S.rumah.padam ? '!' : ''; } },
    { id: 'toko', nama: function () { return 'Tokopedia'; }, warna: function () { return '#42b549'; },
      ikon: function () { return svgIkon('<path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/><circle cx="10" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/>'); },
      badge: function () { return KAL.tanggalKembar(S.hari) || ''; } },
    { id: 'shopee', nama: function () { return 'Shopee'; }, warna: function () { return '#ee4d2d'; },
      ikon: function () { return svgIkon('<path d="M5.5 8h13l1 12h-15l1-12zM9 8V6a3 3 0 0 1 6 0v2"/><path d="M14.2 12c0-.9-.9-1.5-2.2-1.5s-2.2.6-2.2 1.5c0 2 4.4 1.3 4.4 3.4 0 1-1 1.6-2.2 1.6s-2.2-.6-2.2-1.6"/>'); },
      badge: function () { return KAL.tanggalKembar(S.hari) || ''; } },
    { id: 'game', nama: function () { return 'Toko game'; }, warna: function () { return '#00439c'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.8" cy="13.5" r=".9" fill="currentColor"/>'); } },
    { id: 'properti', nama: function () { return 'Properti'; }, warna: function () { return '#8a5a2b'; },
      ikon: function () { return svgIkon('<path d="M3.5 11.5 12 4l8.5 7.5M6 10v9.5h12V10M10 19.5v-5h4v5"/>'); },
      badge: function () { return S.properti.rumah && S.properti.rumah.status === 'siap' && !S.properti.rumah.dihuni ? '!' : ''; } },
    { id: 'rental', nama: function () { return 'Sewa & Rental'; }, warna: function () { return '#6d4c41'; },
      ikon: function () { return svgIkon('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 4h3v3M14 7l2.5 2.5"/>'); },
      badge: function () { var n = Object.keys(S.sewaBarang || {}).length; return n ? String(n) : ''; } },
    { id: 'pajak', nama: function () { return 'M-Pajak'; }, warna: function () { return '#f2a516'; },
      ikon: function () { return svgIkon('<path d="M6 3.5h9l4 4V20.5H6zM15 3.5V8h4"/><path d="M9.5 16.5l5-5"/><circle cx="10" cy="11.5" r="1"/><circle cx="14.5" cy="16" r="1"/>'); } },
    { id: 'oss', nama: function () { return 'OSS'; }, warna: function () { return '#2f8f5b'; },
      ikon: function () { return svgIkon('<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3z"/><path d="M9 12.2 11.2 14.4 15.5 10"/>'); } },
    { id: 'kalender', nama: function () { return 'Kalender'; }, warna: function () { return '#d9443a'; },
      ikon: function () { return '<span style="font-size:20px;line-height:1">' + KAL.tgl(S.hari).d + '</span>'; } }
  ];
  function susunApps() {
    var urut = S.hp && S.hp.urutanApp;
    if (!urut || !urut.length) return APPS.slice();
    var map = {};
    APPS.forEach(function (a) { map[a.id] = a; });
    var hasil = [];
    urut.forEach(function (id) { if (map[id]) { hasil.push(map[id]); delete map[id]; } });
    APPS.forEach(function (a) { if (map[a.id]) hasil.push(a); });
    return hasil;
  }
  function bukaHP(nama) {
    app.nama = nama || 'beranda';
    if (app.nama === 'kalender') return bukaKalender();
    var html;
    if (app.nama === 'beranda') {
      var hm = DIRI.hpAktif(S), stHp = DIRI.infoStorageHp(S), wifiOn = DIRI.adaWifi(S), bat = Math.round((S.hp && S.hp.baterai) || 95);
      var noHp = (S.hp && S.hp.nomor) || '081256000088';
      var masaAktif = (S.hp && S.hp.masaAktif != null) ? S.hp.masaAktif : (S.hari + 30);
      var kuotaGb = S.hp ? (S.hp.kuota || 0) : 0;
      var kuotaTeks = kuotaGb.toFixed(3).replace('.', ',') + ' GB (' + Math.round(kuotaGb * 1024).toLocaleString('id-ID') + ' MB)';
      var infoBarHp = '<div class="kartu-pesanan" style="margin-bottom:10px;padding:10px 12px;border-radius:14px;background:rgba(30,136,229,.11)">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>' + esc(hm.nama) + ' (' + hm.ram + '/' + hm.storage + ' GB)</b>' +
        '<span style="font-weight:800;color:' + (bat < 20 ? '#d9443a' : '#155e57') + '">' + (S.hp && S.hp.cas ? '⚡ Cas ' : '🔋 ') + bat + '% (' + hm.mah + 'mAh · ' + hm.watt + 'W)</span></div>' +
        '<small style="display:block;margin-top:3px">📱 No. HP: <b>' + esc(noHp) + '</b> · Aktif s/d: <b>' + esc(namaTanggal(masaAktif)) + '</b> (' + Math.max(0, masaAktif - S.hari) + ' hr)</small>' +
        '<small style="display:block;margin-top:2px">' + (wifiOn ? '📶 Terhubung WiFi (Bebas Kuota)' : '📡 Kuota: <b>' + kuotaTeks + '</b>') + ' · Pulsa: <b>' + rupiah(S.hp ? S.hp.pulsa : 0) + '</b> · ROM: ' + stHp.terpakaiRom + '/' + stHp.totalRom + ' GB</small>' +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol' + (S.hp && S.hp.cas ? ' pilih' : '') + '" data-aksi="casHp:1">' + (S.hp && S.hp.cas ? '⚡ Sedang Cas (' + hm.watt + 'W)' : '🔌 Colok Charger ' + hm.watt + 'W') + '</button>' +
        '<button type="button" class="chip-tombol" data-app="gadget">Beli Kuota / Gadget / APK</button></div></div>';
      html = kepala('HP · ' + (S.namaPemain || 'Pemilik') + ' (' + noHp + ')', jam(S.menit) + ' · ' + namaTanggal(S.hari, true)) + pesanApp() + infoBarHp + '<div class="hp-grid" id="hp-grid">' + susunApps().map(function (a) {
        var bd = a.badge ? a.badge() : '';
        return '<button type="button" class="hp-app" data-app="' + a.id + '"><i style="background:' + a.warna() + '">' + a.ikon() + (bd ? '<span class="hp-badge">' + esc(bd) + '</span>' : '') + '</i>' + esc(a.nama()) + '</button>';
      }).join('') + '</div><p class="catatan">💡 Tahan & seret ikon APK untuk menyusun posisi menu HP. Waktu game otomatis jeda selama HP terbuka.</p>';
    } else if (app.nama === 'bank') html = layarBank();
    else if (app.nama === 'kur') html = layarKur();
    else if (app.nama === 'kk') html = layarKartuKredit();
    else if (app.nama === 'merchant') html = layarMerchant();
    else if (app.nama === 'laci') html = layarLaci();
    else if (app.nama === 'pajak') html = layarPajak();
    else if (app.nama === 'oss') html = layarOss();
    else if (app.nama === 'belanja') html = layarBelanja();
    else if (app.nama === 'stok') html = layarStok();
    else if (app.nama === 'motor') html = layarMotor();
    else if (app.nama === 'kredit') html = layarKredit();
    else if (app.nama === 'kreditMobil') html = layarKreditMobil();
    else if (app.nama === 'driver') html = layarDriver();
    else if (app.nama === 'makan') html = layarMakan();
    else if (app.nama === 'properti') html = layarProperti();
    else if (app.nama === 'ojol') html = layarOjol();
    else if (app.nama === 'karyawan') html = layarKaryawan();
    else if (app.nama === 'maps') html = layarMaps();
    else if (app.nama === 'usaha') html = layarUsaha();
    else if (app.nama === 'menuku') html = layarMenuku();
    else if (app.nama === 'pln') html = layarPln();
    else if (app.nama === 'toko') html = layarToko('tokopedia');
    else if (app.nama === 'shopee') html = layarToko('shopee');
    else if (app.nama === 'game') html = layarGame();
    else if (app.nama === 'sosmed') html = layarSosmed();
    else if (app.nama === 'staf') html = layarStaf();
    else if (app.nama === 'gadget') html = layarGadget();
    else if (app.nama === 'keluarga') html = layarKeluarga();
    else if (app.nama === 'apotek') html = layarApotek();
    else if (app.nama === 'rental') html = layarRental();
    else if (app.nama === 'pasarpokok') html = layarPasarPokok();
    else if (app.nama === 'rentalps') html = layarRentalPs();
    bukaLembar('hp', html);
  }
  function layarBank() {
    var b = UANG.bankIni(S), k = S.kur, kk = S.kk || {};
    var kur = k.status === 'menunggu' ? 'Pengajuan ' + rupiah(k.plafon) + ' sedang diproses' : k.status === 'aktif' ? 'Angsuran ' + rupiah(k.angsuran) + ' tiap tanggal ' + k.tempo + ', sisa ' + k.sisa + ' bulan' + (k.tunggakan ? ', tunggakan ' + rupiah(k.tunggakan) : '') : k.status === 'lunas' ? 'Lunas' : 'Belum punya';
    var infoKk = !kk.status || kk.status === 'tidak' ? 'Belum punya · bunga maks 1,75% sebulan (aturan BI)' : (kk.status === 'blokir' ? 'Diblokir sementara · ' : '') + 'Limit ' + rupiah(kk.limit) + ' · sisa ' + rupiah(UANG.sisaLimitKk(S)) + (kk.tagihan > 0 ? ' · tagihan ' + rupiah(kk.tagihan + (kk.denda || 0)) : '');
    return kepalaApp(b.app, 'Rekening ' + b.nama + ' · ' + (S.namaPemain || 'Pemilik')) +
      '<div class="saldo-besar"><small>Saldo Rekening Utama (Belanja & Operasional)</small><b>' + rupiah(S.bank.saldo) + '</b></div>' +
      '<div class="saldo-besar" style="background:#5e35b1"><small>Tabungan Gaji Karyawan (Terpisah dari pembelian)</small><b>' + rupiah(S.bank.tabunganGaji || 0) + '</b></div>' + pesanApp() +
      '<h3 class="subjudul">Sisihkan ke Tabungan Gaji Karyawan</h3><div class="chip-baris">' + tombolUang('isiTabGaji', [250000, 500000, 1200000, 3000000]) + '</div>' +
      ((S.bank.tabunganGaji || 0) > 0 ? '<h3 class="subjudul">Tarik dari Tabungan Gaji ke Rekening Utama</h3><div class="chip-baris">' + tombolUang('tarikTabGaji', [250000, 1000000, 'semua']) + '</div>' : '') +
      (!UANG.bolehKeAtm(S) ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-aksi="tutupSementara:1">Tutup sementara kedai untuk ke ATM</button></div>' :
        S.tutupSementara ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-aksi="tutupSementara:0">Buka kembali kedai</button></div>' : '') +
      '<h3 class="subjudul">Setor tunai dari laci' + (b.tunai ? ' di ' + b.tunai.tempat : '') + '</h3><div class="chip-baris">' + tombolUang('setor', b.tunai ? [100000, 500000, 1000000] : [100000, 500000, 'semua']) + '</div>' +
      '<h3 class="subjudul">Tarik tunai ke laci' + (b.tunai ? ' di ' + b.tunai.tempat : '') + '</h3><div class="chip-baris">' + tombolUang('tarik', [100000, 500000, 1000000]) + '</div>' +
      '<h3 class="subjudul">Tarik tunai ke dompet pribadi</h3><div class="chip-baris">' + tombolUang('tarikDompet', [50000, 100000, 300000]) + '</div>' +
      '<ul class="daftar angka" style="margin-top:14px">' + baris('Biaya admin', b.admin ? rupiah(b.admin) + ' sebulan' : 'gratis') +
      baris('Transfer ke bank lain', b.gratisTransfer ? 'gratis ' + Math.max(0, b.gratisTransfer - S.bank.transferBulanIni) + ' kali lagi' : rupiah(N.biFast) + ' (BI-FAST)') +
      (b.tunai ? baris('Setor dan tarik tunai<small>di ' + b.tunai.tempat + ', ' + rupiah(b.tunai.min) + '–' + rupiah(b.tunai.maks) + ' sekali, tarik maks ' + rupiah(b.tunai.tarikHarian) + ' sehari</small>', rupiah(b.tunai.biaya)) : baris('Batas transfer ATM', rupiah(b.batasTransfer) + ' sehari')) + '</ul>' +
      '<button type="button" class="baris-tombol" data-app="kk"><span><b>Kartu kredit ' + esc(b.nama) + '</b><small>' + esc(infoKk) + '</small></span><span>›</span></button>' +
      '<button type="button" class="baris-tombol" data-app="kur"><span><b>KUR mikro</b><small>' + esc(kur) + '</small></span><span>›</span></button>' +
      '<h3 class="subjudul">Mutasi</h3><ul class="daftar angka">' + (S.bank.mutasi.length ? S.bank.mutasi.slice(0, 15).map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada transaksi</span></li>') + '</ul>';
  }
  function layarKartuKredit() {
    var b = UANG.bankIni(S), kk = S.kk, K = N.kartuKredit;
    var html = kepala('Kartu kredit ' + b.nama, 'Aturan BI: bunga maks 1,75%/bln · min bayar 5%', '<button type="button" class="panah" data-app="bank" aria-label="Kembali ke bank">‹</button>') + pesanApp();
    if (!kk.status || kk.status === 'tidak') {
      var syarat = UANG.syaratKk(S), calonLimit = UANG.hitungLimitKk(S), gaji = UANG.penghasilanKk(S);
      html += '<ul class="daftar syarat">' + syarat.map(function (x) { return '<li class="' + (x.ok ? 'ok' : 'belum') + '"><span>' + (x.ok ? '✓ ' : '✗ ') + esc(x.teks) + '</span></li>'; }).join('') + '</ul>' +
        '<ul class="daftar angka" style="margin-top:10px">' +
        baris('Penghasilan bersih sebulan', rupiah(gaji)) +
        baris('Perkiraan limit awal (2,5× penghasilan)', '<b>' + rupiah(calonLimit) + '</b>', 'total') +
        baris('Bunga ritel (aturan BI)', '1,75% sebulan') +
        baris('Pembayaran minimum', '5% tagihan (min ' + rupiah(K.minRp) + ')') +
        baris('Denda keterlambatan', '1% tagihan (maks ' + rupiah(K.dendaMaks) + ')') +
        baris('Iuran tahunan', 'Gratis tahun pertama, lalu ' + rupiah(K.iuranTahunan) + '/thn') + '</ul>' +
        '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="ajukanKk:1">Ajukan kartu kredit</button></div>' +
        '<p class="catatan">Kartu kredit bisa dipakai belanja di Tokopedia, dealer motor & mobil (tunai maupun DP), dan Toko Game. Tagihan dicetak tiap tanggal 1 dan jatuh tempo tanggal 18.</p>';
      return html;
    }
    var sisa = UANG.sisaLimitKk(S), totalTagih = (kk.tagihan || 0) + (kk.denda || 0), terpakai = totalTagih + (kk.pakai || 0);
    var dibayar = kk.dibayarBulanIni || 0;
    var kurangMin = Math.max(0, (kk.minBayar || 0) - dibayar);
    html += '<div class="saldo-besar"><small>Sisa limit tersedia</small><b>' + rupiah(sisa) + '</b>' + persenBar(kk.limit ? sisa / kk.limit * 100 : 0) + '</div>' +
      (kk.status === 'blokir' ? '<p class="racik-pesan salah">Kartu diblokir sementara karena menunggak pembayaran minimum. Bayar minimal ' + rupiah(kurangMin || totalTagih) + ' untuk membuka blokir.</p>' : '') +
      '<ul class="daftar angka">' +
      baris('Limit kartu', rupiah(kk.limit)) +
      baris('Total limit terpakai', rupiah(terpakai), terpakai > 0 ? 'keluar' : '') +
      baris('Pemakaian bulan berjalan<small>cetak tagihan tanggal 1</small>', rupiah(kk.pakai || 0)) +
      baris('<b>Tagihan tercetak' + (kk.denda ? ' (+denda)' : '') + '</b><small>jatuh tempo tanggal ' + K.jatuhTempo + '</small>', '<b>' + rupiah(totalTagih) + '</b>', totalTagih > 0 ? 'total' : '') +
      (totalTagih > 0 ? baris('Pembayaran minimum (5%)', rupiah(kurangMin) + (dibayar > 0 ? ' (sudah dibayar ' + rupiah(dibayar) + ')' : ''), kurangMin > 0 ? 'rugi' : '') : '') +
      '</ul>';
    if (totalTagih > 0 || (kk.pakai || 0) > 0) {
      html += '<h3 class="subjudul">Bayar tagihan dari rekening</h3><div class="chip-baris">' +
        (totalTagih > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarKk:penuh">Bayar penuh ' + rupiah(totalTagih) + '</button>' : '') +
        (totalTagih > 0 && kurangMin > 0 && kurangMin < totalTagih ? '<button type="button" class="chip-tombol" data-aksi="bayarKk:minimal">Bayar minimal 5% (' + rupiah(kurangMin) + ')</button>' : '') +
        ((kk.pakai || 0) > 0 ? '<button type="button" class="chip-tombol" data-aksi="bayarKk:semua">Lunasi semua ' + rupiah(terpakai) + '</button>' : '') +
        '</div>';
    }
    html += '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol" data-aksi="naikLimitKk:1">Ajukan naik limit</button></div>' +
      '<h3 class="subjudul">Riwayat transaksi kartu kredit</h3><ul class="daftar angka">' +
      (kk.mutasi && kk.mutasi.length ? kk.mutasi.slice(0, 15).map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada transaksi kartu kredit</span></li>') + '</ul>' +
      '<p class="catatan">Sesuai aturan Bank Indonesia: bayar penuh sebelum tanggal ' + K.jatuhTempo + ' bebas bunga. Bila bayar minimal 5%, sisa tagihan dikenakan bunga 1,75% pada cetak tagihan bulan depan. Bila lewat tanggal ' + K.jatuhTempo + ' belum bayar minimal 5%, kena denda 1% (maks Rp100.000) dan kartu diblokir sementara.</p>';
    return html;
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
    var kelas = (S.omzetTahun || 0) > N.mdr.batasMikro ? 'kecil' : 'mikro', m = N.mdr[kelas];
    var html = kepalaApp('QRIS merchant', Object.keys(S.merchants).length + ' QRIS terpasang di kedai') + pesanApp() +
      '<div class="saldo-besar"><small>Semua QRIS bisa ditarik</small><b>' + rupiah(UANG.tersedia(S)) + '</b></div>';
    html += N.qris.map(function (q) {
      var mm = S.merchants[q.id];
      if (!mm) return '<ul class="daftar angka"><li><span><b>' + esc(q.app) + '</b><small>' + esc(q.transfer) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="pasangQris:' + q.id + '">Pasang</button></span></li></ul>';
      var sisaGratis = q.gratis === Infinity ? 'tanpa batas' : Math.max(0, q.gratis - mm.tarikBulanIni) + ' kali lagi';
      return '<h3 class="subjudul"><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.app) + '</h3><ul class="daftar angka">' +
        (mm.aktifPada && S.hari < mm.aktifPada ? baris('Status', 'aktif ' + namaTanggal(mm.aktifPada)) :
          baris('Bisa ditarik', rupiah(mm.tersedia)) + baris('Cair hari kerja berikutnya', rupiah(UANG.saldoMerchant(mm) - mm.tersedia)) + baris('Transfer gratis ke bank', sisaGratis)) + '</ul>' +
        (mm.tersedia > 0 ? '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="tarikMerchant:' + q.id + '">Tarik ke ' + esc(UANG.bankIni(S).nama) + '</button></div>' : '');
    }).join('');
    return html + '<ul class="daftar angka" style="margin-top:12px">' + baris('Kelas usaha', 'Usaha ' + kelas) + baris('MDR QRIS<small>0% sampai ' + rupiah(m.gratisSampai) + ', di atasnya ' + (m.tarif * 100).toFixed(1).replace('.', ',') + '%</small>', '') + '</ul>' +
      '<p class="catatan">Pembeli memindai salah satu stiker QRIS yang terpasang. Uang QRIS masuk keesokan hari kerja; Sabtu, Minggu, dan hari libur tidak dihitung. Pasang QRIS baru gratis, aktif besok.</p>';
  }
  function layarLaci() {
    return kepalaApp('Laci & dompet', 'Uang tunai kedai dan dompet pribadi') +
      '<div class="saldo-besar"><small>Laci kas kedai</small><b>' + rupiah(UANG.laci(S)) + '</b></div>' +
      '<div class="saldo-besar" style="background:#155e57"><small>Dompet pribadi (' + esc(S.namaPemain || 'Pemilik') + ')</small><b>' + rupiah(UANG.dompet(S)) + '</b></div>' + pesanApp() +
      '<ul class="daftar angka">' + baris('Laci: uang kecil (sampai Rp20.000)', rupiah(S.uang.kecil)) + baris('Laci: Rp50.000 dan Rp100.000', rupiah(S.uang.besar)) + '</ul>' +
      (S.dunia.cekUang ? '' : '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="cekUang:1">Beli alat cek uang palsu ' + rupiah(DUNIA.BIAYA.cekUang) + '</button></div>') +
      '<h3 class="subjudul">Ambil dari laci ke dompet</h3><div class="chip-baris">' + tombolUang('keDompet', [50000, 100000, 250000]) + '</div>' +
      '<h3 class="subjudul">Masukkan dari dompet ke laci</h3><div class="chip-baris">' + tombolUang('keLaci', [50000, 100000, 'semua']) + '</div>' +
      '<h3 class="subjudul">Tukar uang besar di laci ke uang kecil</h3><div class="chip-baris">' + tombolUang('tukar', [50000, 100000, 200000]) + '</div>' +
      '<p class="catatan">Dompet dipakai untuk pengeluaran tunai pribadi (makan di warung, masak, ojek). Laci dipakai untuk kembalian pembeli dan belanja bahan kedai. Warung sekitar bisa menukar receh sampai ' + rupiah(UANG.BATAS_TUKAR_RECEH) + ' sehari.</p>';
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
  function chipTab(aksi, daftar, pilih) { return '<div class="chip-baris">' + daftar.map(function (t) { return '<button type="button" class="chip-tombol' + (t[0] === pilih ? ' pilih' : '') + '" data-aksi="' + aksi + ':' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>'; }
  function layarMotor() {
    var tab = app.motorTab || (S.motor || S.mobil ? 'garasi' : 'dealer'), m = S.motor, html = kepalaApp('Kendaraan', [S.motor ? S.motor.nama : '', S.mobil ? S.mobil.nama : ''].filter(Boolean).join(' · ') || 'Belum punya kendaraan') +
      chipTab('motorTab', [['garasi', 'Garasi'], ['dealer', 'Dealer motor'], ['mobil', 'Dealer mobil'], ['bekas', 'Motor bekas']], tab) + pesanApp();
    if (tab === 'garasi') {
      var armada = S.armadaMotor || (m ? [m] : []);
      if (!armada.length && !S.mobil) return html + '<p class="catatan">Tanpa kendaraan, belanja ke pasar naik ojek ' + rupiah(N.ojek.pasar) + ' pulang-pergi, dan pesanan antar harus pakai kurir ' + esc(N.kurir.nama) + '. Pesanan tunai tidak bisa diantar.</p>';
      if (armada.length > 1) {
        html += '<h3 class="subjudul">Armada motor (' + armada.length + '/5 unit · dipakai sendiri & kurir)</h3><div class="chip-baris">' +
          armada.map(function (mt, idx) {
            return '<button type="button" class="chip-tombol' + (idx === (S.motorAktif || 0) ? ' pilih' : '') + '" data-aksi="pilihMotor:' + idx + '">' + (idx + 1) + '. ' + esc(mt.nama) + '</button>';
          }).join('') + '</div>';
      }
      if (m) {
        var listrik = m.bbm === 'listrik', hb = MOTOR.hargaBbm(S, m.bbm), oli = N.rawat.oliKm - (m.km - m.kmOli), sv = N.rawat.servisKm - (m.km - m.kmServis), pjk = MOTOR.tagihanPajak(S);
        html += '<h3 class="subjudul">' + esc(m.nama) + '</h3><div class="saldo-besar"><small>' + (listrik ? 'Baterai' : 'Bensin ' + N.bbm.nama[m.bbm]) + '</small><b>' + (listrik ? Math.round(m.baterai) + ' km' : m.isi.toFixed(1).replace('.', ',') + ' / ' + String(m.tangki).replace('.', ',') + ' L') + '</b>' + persenBar(listrik ? m.baterai / m.jarakPenuh * 100 : m.isi / m.tangki * 100) + '</div>' +
          '<ul class="daftar angka">' + baris('Kilometer', Math.round(m.km).toLocaleString('id-ID') + ' km') + (listrik ? '' : baris('Konsumsi', m.kml + ' km/liter')) +
          '</ul>' + barRawat('Oli', oli, N.rawat.oliKm) + barRawat('Servis', sv, N.rawat.servisKm) + '<ul class="daftar angka">' +
          (m.ngelitik ? baris('Mesin', 'ngelitik, bensin kurang sesuai', 'rugi') : '') +
          baris('Peluang mogok per perjalanan', (MOTOR.peluangMogok(S) * 100).toFixed(1).replace('.', ',') + '%') +
          baris('Muatan', MOTOR.muatan(S) + ' cup') +
          (m.bekas ? baris('Kondisi', 'Bekas ' + m.bekas.tahun + ', ' + m.bekas.kondisi) : '') +
          (m.kredit ? baris('Angsuran', rupiah(m.kredit.angsuran) + ' tiap tanggal ' + m.kredit.tempo + ', sisa ' + m.kredit.sisa + ' bulan' + (m.kredit.tunggakan ? ', nunggak ' + rupiah(m.kredit.tunggakan) : ''), m.kredit.tunggakan ? 'rugi' : '') : '') +
          baris('Pajak tahunan', pjk ? 'jatuh tempo ' + namaTanggal(m.pajakTempo) : (m.pajakTempo - S.hari) + ' hari lagi') +
          baris('Harga jual ke pedagang', m.kredit ? 'lunasi kredit dulu' : rupiah(MOTOR.nilaiJual(S, m))) + '</ul>' +
          (listrik ? '' : pompaBensin('bensin', m.bbm, m.tangki - m.isi)) +
          '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="oli:1">Ganti oli ' + rupiah(N.rawat.oli) + '</button><button type="button" class="chip-tombol" data-aksi="servis:1">Servis ' + rupiah(N.rawat.servis) + '</button>' +
          (pjk ? '<button type="button" class="chip-tombol" data-aksi="pajakMotor:1">Bayar pajak ' + rupiah(pjk) + '</button>' : '') +
          (m.kredit ? '<button type="button" class="chip-tombol" data-aksi="lunasMotor:1">Lunasi kredit</button>' : '<button type="button" class="chip-tombol" data-aksi="jualMotor:1">Jual motor</button>') + '</div>' +
          '<h3 class="subjudul">Perlengkapan antar</h3><ul class="daftar angka">' + N.aksesoris.map(function (a) {
            return '<li><span>' + esc(a.nama) + '<small>' + esc(a.ket) + '</small></span><span>' + (m.aks[a.id] ? 'terpasang' : '<button type="button" class="chip-tombol" data-aksi="aks:' + a.id + '">' + rupiah(a.harga) + '</button>') + '</span></li>';
          }).join('') + '</ul><p class="catatan">Bensin, oli, servis, dan perlengkapan motor dibayar tunai dari laci.</p>';
      }
      var c = S.mobil;
      if (c) {
        var pj = MOBIL.tagihanPajak(S), svm = N.rawatMobil.servisKm - (c.km - c.kmServis);
        html += '<h3 class="subjudul">' + esc(c.nama) + '</h3><div class="saldo-besar"><small>' + (c.bbm === 'solar' ? '' : 'Bensin ') + N.bbm.nama[c.bbm] + '</small><b>' + (c.isi * c.tangki).toFixed(0) + ' / ' + c.tangki + ' L</b>' + persenBar(c.isi * 100) + '</div>' +
          '<ul class="daftar angka">' + baris('Kilometer', Math.round(c.km).toLocaleString('id-ID') + ' km') + baris('Konsumsi', c.kml + ' km/liter') + baris('Muatan', c.muat + ' cup') +
          '</ul>' + barRawat('Servis', svm, N.rawatMobil.servisKm) + '<ul class="daftar angka">' + (c.ngelitik ? baris('Mesin', 'ngelitik, bensin kurang sesuai', 'rugi') : '') +
          (c.kredit ? baris('Angsuran', rupiah(c.kredit.angsuran) + ' tiap tanggal ' + c.kredit.tempo + ', sisa ' + c.kredit.sisa + ' bulan' + (c.kredit.tunggakan ? ', nunggak ' + rupiah(c.kredit.tunggakan) : ''), c.kredit.tunggakan ? 'rugi' : '') : '') +
          baris('Pajak tahunan', pj ? 'jatuh tempo ' + namaTanggal(c.pajakTempo) : (c.pajakTempo - S.hari) + ' hari lagi') +
          baris('Harga jual ke pedagang', c.kredit ? 'lunasi kredit dulu' : rupiah(MOTOR.nilaiJual(S, c))) + '</ul>' +
          pompaBensin('bensinMobil', c.bbm, c.tangki * (1 - c.isi)) +
          '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="servisMobil:1">Servis ' + rupiah(N.rawatMobil.servis) + '</button>' +
          (pj ? '<button type="button" class="chip-tombol" data-aksi="pajakMobil:1">Bayar pajak ' + rupiah(pj) + '</button>' : '') +
          (c.kredit ? '<button type="button" class="chip-tombol" data-aksi="lunasMobil:1">Lunasi kredit</button>' : '<button type="button" class="chip-tombol" data-aksi="jualMobil:1">Jual mobil</button>') + '</div>' +
          (MOBIL.pikap(S) ?
            '<h3 class="subjudul">Jasa Angkutan Pikap (' + esc(c.nama) + ')</h3><ul class="daftar belanja">' + (N.bisnisMobil.angkutan || []).map(function (ag) {
              return '<li><span><b>' + esc(ag.nama) + '</b><small>' + ag.km + ' km · sekitar ' + ag.jam + ' jam</small><small class="harga">Bayaran ' + rupiah(ag.bayar) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="angkutan:' + ag.id + '">Ambil</button></span></li>';
            }).join('') + '</ul>' :
            '<h3 class="subjudul">GoCar / GrabCar & Bisnis Travel Antarkota</h3>' +
            '<div class="chip-baris">' + (!S.bisnisMobil || !S.bisnisMobil.carAktif ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarCar:1">Daftar GoCar / GrabCar</button>' : '<button type="button" class="chip-tombol pilih" data-aksi="orderCar:1">Ambil 1 order GoCar/GrabCar</button>') + '</div>' +
            '<h3 class="subjudul">Rute Travel (kapasitas ' + MOBIL.kapasitasPenumpang(S) + ' penumpang)</h3><ul class="daftar belanja">' + MOBIL.ruteTravel(S).map(function (rt) {
              return '<li><span><b>Travel ke ' + esc(rt.tujuan) + '</b><small>' + rt.km + ' km · ~' + rt.jam + ' jam · ' + rupiah(rt.ongkos) + '/penumpang (maks ' + rupiah(rt.ongkos * MOBIL.kapasitasPenumpang(S)) + ')</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="travel:' + rt.id + '">Berangkat</button></span></li>';
            }).join('') + '</ul>') +
          '<p class="catatan">Mobil bisa dipakai harian, narik GoCar/GrabCar, bisnis Travel antarkota (tarif × penumpang dikurangi bensin), atau Jasa Angkutan barang jika punya pikap seperti L300/Gran Max.</p>';
      }
      return html;
    }
    if (tab === 'dealer') {
      var kls = app.kelasMotor || 'harian';
      return html + chipTab('kelasMotor', [['harian', 'Harian'], ['sport', 'Sport'], ['moge', 'Moge']], kls) + '<ul class="daftar belanja">' + N.motor.filter(function (x) { return (x.kelas || 'harian') === kls; }).map(function (x) {
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + (x.bbm === 'listrik' ? 'Listrik, sekitar ' + x.jarakPenuh + ' km sekali cas' : '±' + x.kml + ' km/l · ' + N.bbm.nama[x.bbm]) + ' · ' + esc(x.kelebihan) + '</small><small class="harga">' + rupiah(x.harga) + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="tunai:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiKk:' + x.id + '">Kartu kredit</button><button type="button" class="chip-tombol pilih" data-aksi="kreditPilih:' + x.id + '">Kredit</button></span></li>';
      }).join('') + '</ul><p class="catatan">Harga OTR 2026 varian termurah. Bisa punya sampai 5 motor (dipakai sendiri dan karyawan kurir untuk antar pesanan). Bisa bayar dari rekening, kartu kredit, atau cicilan leasing.</p>';
    }
    if (tab === 'mobil') {
      var km2 = app.kelasMobil || 'pikap';
      return html + chipTab('kelasMobil', [['pikap', 'Pikap'], ['keluarga', 'Keluarga'], ['mewah', 'Mewah'], ['sultan', 'Sultan']], km2) + '<ul class="daftar belanja">' + N.mobil.filter(function (x) { return x.kelas === km2; }).map(function (x) {
        return '<li><span><b>' + esc(x.nama) + '</b><small>±' + x.kml + ' km/l · ' + N.bbm.nama[x.bbm] + ' · muat ' + x.muat + ' cup · ' + esc(x.kelebihan) + '</small><small class="harga">' + rupiah(x.harga) + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="tunaiMobil:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiMobilKk:' + x.id + '">Kartu kredit</button><button type="button" class="chip-tombol pilih" data-aksi="kreditMobilPilih:' + x.id + '">Kredit</button></span></li>';
      }).join('') + '</ul><p class="catatan">Harga OTR Jabodetabek 2026, varian termurah. Bisa bayar lewat rekening, kartu kredit, atau kredit leasing. Satu mobil dalam satu waktu.</p>';
    }
    return html + '<ul class="daftar belanja">' + S.pasarBekas.unit.map(function (u, i) {
      var b = N.motorBekas.filter(function (x) { return x.id === u.id; })[0];
      return '<li><span><b>' + esc(b.nama.replace(' (bekas)', '')) + ' ' + u.tahun + '</b><small>' + u.km.toLocaleString('id-ID') + ' km · kondisi ' + u.kondisi + ' · ' + esc(b.kelebihan) + '</small><small class="harga">' + rupiah(u.harga) + '</small></span>' +
        '<span class="tombol-tegak"><button type="button" class="chip-tombol pilih" data-aksi="bekas:' + i + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="bekasKk:' + i + '">Kartu kredit</button></span></li>';
    }).join('') + '</ul><p class="catatan">Iklan motor bekas berganti tiap minggu. Kondisi kurang berarti lebih sering mogok.</p>';
  }
  /* bar sisa km sampai ganti oli atau servis */
  function barRawat(nama, sisa, batas) {
    var p = Math.max(0, Math.min(100, sisa / batas * 100));
    return '<div class="bar-rawat' + (sisa < batas * 0.15 ? ' kritis' : '') + '"><span>' + nama + '<small>' + (sisa >= 0 ? 'sisa ' + Math.round(sisa).toLocaleString('id-ID') + ' km' : 'lewat ' + Math.round(-sisa).toLocaleString('id-ID') + ' km') + '</small></span><div class="meteran"><i style="width:' + p.toFixed(0) + '%"></i></div></div>';
  }
  /* pompa bensin: pilih jenis, lalu isi per liter atau penuh */
  function pompaBensin(aksi, anjuran, kosong) {
    var jenisList = anjuran === 'solar' ? ['solar'] : ['pertalite', 'pertamax', 'turbo'], jenis = app.bbmPilih && jenisList.indexOf(app.bbmPilih) >= 0 ? app.bbmPilih : anjuran, h = MOTOR.hargaBbm(S, jenis);
    return '<h3 class="subjudul">Isi bensin</h3>' + (jenisList.length > 1 ? '<div class="chip-baris">' + jenisList.map(function (j) {
        return '<button type="button" class="chip-tombol' + (j === jenis ? ' pilih' : '') + '" data-aksi="bbmPilih:' + j + '">' + N.bbm.nama[j] + (j === anjuran ? ' ✓' : '') + '</button>'; }).join('') + '</div>' : '') +
      '<div class="chip-baris">' + [1, 2, 5, 'penuh'].filter(function (l) { return l === 'penuh' || l <= kosong + 0.01; }).map(function (l) {
        var lt = l === 'penuh' ? kosong : l;
        return '<button type="button" class="chip-tombol" data-aksi="' + aksi + ':' + jenis + '-' + l + '">' + (l === 'penuh' ? 'Penuh ' + lt.toFixed(1).replace('.', ',') + ' L' : l + ' L') + ' · ' + rupiah(Math.round(lt * h / 100) * 100) + '</button>'; }).join('') + '</div>' +
      '<p class="catatan" style="margin-top:4px">' + N.bbm.nama[jenis] + ' ' + rupiah(h) + ' per liter. Tanda ✓ = anjuran pabrik' + (anjuran === 'solar' ? '' : '; bensin di bawah anjuran membuat mesin ngelitik') + '.</p>';
  }
  function layarKreditMobil() {
    var x = MOBIL.model(app.kreditMobil), dp = app.kreditMobilDp || 0.2, tenor = app.kreditMobilTenor || 60, k = MOBIL.hitungKredit(x.harga, dp, tenor);
    return kepala('Kredit ' + x.nama, N.kreditMobil.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="motor" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3>' + chipTab('kreditMobilDp', N.kreditMobil.dp.map(function (d) { return [d, Math.round(d * 100) + '%']; }), dp) +
      '<h3 class="subjudul">Tenor</h3>' + chipTab('kreditMobilTenor', N.kreditMobil.tenor.map(function (t) { return [t, t + ' bulan']; }), tenor) +
      '<ul class="daftar angka" style="margin-top:10px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + ' sebulan</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div class="bayar-baris" style="margin-top:12px"><button type="button" class="aksi kecil" data-aksi="kreditMobil:bank">Ajukan (DP Rekening)</button><button type="button" class="aksi kecil" data-aksi="kreditMobil:kk">Ajukan (DP Kartu Kredit)</button></div>' +
      '<p class="catatan">Perkiraan: bunga flat sekitar 5% setahun plus asuransi all risk. Menunggak 3 bulan, mobil ditarik.</p>';
  }
  /* ---------- aplikasi Makan & minum ---------- */
  function layarMakan() {
    var d = S.diri, dekat = d.posisi === 'kedai' ? 'warung sebelah kedai' : 'warung dekat ' + DIRI.tempat(S);
    function daftarItem(list) {
      return '<ul class="daftar belanja">' + list.map(function (x) {
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + [x.kenyang ? 'kenyang +' + x.kenyang : '', x.minum ? 'minum +' + x.minum : '', x.melek ? 'melek +' + x.melek : ''].filter(Boolean).join(' · ') + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="beliMakan:' + x.id + '-warung">Warung ' + rupiah(DIRI.hargaItem(S, x)) + '</button><button type="button" class="chip-tombol pilih" data-aksi="beliMakan:' + x.id + '-gofood">GoFood ' + rupiah(DIRI.hargaGofood(S, x)) + '</button></span></li>';
      }).join('') + '</ul>';
    }
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    return kepalaApp('Makan & minum', 'Kenyang ' + Math.round(d.kenyang) + '% · minum ' + Math.round(d.minum) + '% · melek ' + Math.round(d.melek) + '%') + pesanApp() +
      '<div class="chip-baris">' +
      '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-aksi="autoMakan:1">' + (S.autoMakanMinum ? 'Auto Makan & Minum: Aktif ✓' : 'Auto Makan & Minum: Mati') + '</button>' +
      (d.posisi === 'kos' && rtAktif ? '<button type="button" class="chip-tombol pilih" data-aksi="makanRumah:1">Makan masakan rumah (Gratis!)</button>' : '') +
      '<button type="button" class="chip-tombol" data-aksi="minumAir:1">' + (d.posisi === 'kedai' ? 'Minum air galon kedai' : DIRI.punya(S, 'dispenser') ? 'Minum dari dispenser' : 'Beli air mineral') + '</button>' +
      (d.posisi === 'kedai' ? '<button type="button" class="chip-tombol" data-aksi="ngopi:1">Ngopi hitam (stok kedai)</button><button type="button" class="chip-tombol pilih" data-aksi="ngopiSusu:1">Minum Kopi Susu (stok kedai)</button>' : '') + '</div>' +
      '<h3 class="subjudul">Makanan</h3>' + daftarItem(N.makanan) + '<h3 class="subjudul">Minuman</h3>' + daftarItem(N.minuman) +
      '<p class="catatan">Warung: beli langsung di ' + dekat + ', 10–15 menit, bayar tunai dari laci' + (S.fase === 'buka' && d.posisi === 'kedai' ? ' (kedai ditinggal sebentar)' : '') + '. GoFood: diantar sekitar ' + N.makanOjol.tunggu + ' menit, harga aplikasi lebih mahal plus ongkir, bayar dari saldo QRIS atau rekening. Harga perkiraan.</p>';
  }
  /* ---------- aplikasi Driver ojol ---------- */
  function layarDriver() {
    var o = S.ojek, z = N.ojol.zona[kotaIni().zona || 1];
    var html = kepalaApp('Driver ojol', o.online ? 'Online di ' + OJEK.platform(o.platform).nama : 'Offline') + pesanApp() +
      '<div class="saldo-besar"><small>Saldo ojek (bisa ditarik)</small><b>' + rupiah(o.dompet) + '</b></div>' +
      '<ul class="daftar angka">' + baris('Hari ini', o.hariIni.trip + ' order · ' + rupiah(o.hariIni.bersih)) + baris('Total', o.total.trip + ' order · ' + rupiah(o.total.bersih)) +
      baris('Tarif zona ' + (kotaIni().zona || 1) + '<small>' + rupiah(z.minimal) + ' untuk ' + z.kmMinimal + ' km pertama, lalu ' + rupiah(z.perKm) + '/km</small>', '') + baris('Potongan aplikasi', Math.round(N.ojol.potongan * 100) + '%') + '</ul>' +
      '<h3 class="subjudul">Tarik saldo ojek & pegangan tunai</h3><div class="chip-baris">' +
      '<button type="button" class="chip-tombol pilih" data-aksi="tarikDriver:ewallet">Tarik ke E-Wallet (QRIS)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="tarikDriver:dompet">Tarik ke ATM (Dompet)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="tarikDriver:bank">Tarik ke ' + esc(UANG.bankIni(S).nama) + '</button>' +
      '<button type="button" class="chip-tombol" data-aksi="keDompet:50000">Tarik Rp50.000 dari Laci</button>' +
      '<button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-aksi="promo:1">' + (S.promoAktif ? 'Promo ✓' : 'Promo') + '</button>' +
      '</div>' +
      '<h3 class="subjudul">Akun Driver (Order harian 1–10 km & 1–4× sehari order jarak jauh s/d 30 km)</h3><ul class="daftar pesanan">' + N.ojol.platform.map(function (pl) {
        var d = o.daftar[pl.id];
        var st = !d ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarDriver:' + pl.id + '">Daftar</button>' :
          (d.status === 'proses' ? '<span style="margin-right:6px">aktif ' + namaTanggal(d.aktifPada) + '</span>' :
            (o.online && o.platform === pl.id ? '<span style="margin-right:6px"><b>ONLINE</b></span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineDriver:' + pl.id + '">Mulai narik</button>')) +
          '<button type="button" class="chip-tombol" data-aksi="putusDriver:' + pl.id + '">Putus kerjasama</button>';
        return '<li><span><b>' + esc(pl.app) + '</b><small>' + esc(pl.layanan.penumpang + ', ' + pl.layanan.barang + ', ' + pl.layanan.makanan) + '</small></span><span class="chip-baris" style="margin:0">' + st + '</span></li>';
      }).join('') + '</ul>' +
      (o.online ? '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="offlineDriver:1">Berhenti narik</button></div>' : '') +
      '<p class="catatan">Narik pakai motor sendiri, butuh SIM C dan STNK. Kamu menunggu order di samping kedai; order masuk lebih sering pagi, jam makan siang, dan pulang kerja, apalagi saat hujan. Penumpang yang bayar tunai masuk laci, potongan aplikasinya diambil dari saldo driver. Order yang sering dilewati membuat order berikutnya lebih jarang hari itu.</p>';
    return html;
  }
  /* ---------- aplikasi Properti ---------- */
  function layarProperti() {
    var P = N.properti, r = S.properti.rumah, gaji = PROPERTI.penghasilan(S), html = kepalaApp('Properti', 'Rumah dan tanah di ' + kotaIni().nama) + pesanApp();
    html += '<ul class="daftar angka">' + baris('Tempat tinggal', S.rumah.jenis === 'rumah' ? esc(r ? r.nama : 'Rumah') : 'Kos ' + rupiah(S.rumah.sewa) + ' sebulan') + baris('Penghasilan sebulan (laba kedai + ngojek)', rupiah(gaji)) + '</ul>';
    if (r) {
      var k = r.kpr;
      html += '<h3 class="subjudul">' + esc(r.nama) + '</h3><ul class="daftar angka">' +
        baris('Status', r.status === 'akad' ? 'kunci ' + namaTanggal(r.kunciPada) : r.dihuni ? 'ditempati' : 'kunci diterima') +
        baris('Harga beli', rupiah(r.harga)) + baris('Perkiraan nilai sekarang', rupiah(PROPERTI.nilaiRumah(S))) +
        (k ? baris('Angsuran KPR<small>tiap tanggal ' + k.tempo + ', bunga ' + (k.bunga * 100).toFixed(2).replace('.', ',') + '%</small>', rupiah(k.angsuran)) + baris('Sisa pokok<small>' + k.sisa + ' bulan lagi</small>', rupiah(k.pokok)) + (k.tunggakan ? baris('Tunggakan', rupiah(k.tunggakan), 'rugi') : '') : baris('Kepemilikan', 'lunas, sertifikat di tangan')) +
        baris('Jarak ke kedai', N.properti.kota[S.kota].jarak[r.tipe] + ' km') + '</ul><div class="chip-baris">' +
        (r.status === 'siap' && !r.dihuni ? '<button type="button" class="chip-tombol pilih" data-aksi="pindahRumah:1">Pindah ke rumah' + (MOBIL.pikap(S) ? ' (pakai pikap)' : ' (jasa pindahan ' + rupiah(P.jasaPindahan) + ')') + '</button>' : '') +
        (r.status === 'siap' ? '<button type="button" class="chip-tombol" data-aksi="jualRumah:1">' + (app.yakinJualRumah ? 'Yakin jual? Tap lagi' : 'Jual rumah') + '</button>' : '') + '</div>';
    } else {
      var tipe = app.tipeRumah || 'subsidi', tunai = !!app.rumahTunai && tipe !== 'subsidi', dp = app.dpRumah || (tipe === 'subsidi' ? P.subsidi.dp : P.komersial.dp[0]), tenor = app.tenorRumah || 20;
      var x = PROPERTI.hitung(S, tipe, dp, tenor, tunai), T = P.tipe[tipe];
      html += '<h3 class="subjudul">Beli rumah</h3>' + chipTab('tipeRumah', [['subsidi', 'Subsidi'], ['komersial', 'Komersial'], ['mewah', 'Mewah']], tipe) +
        '<p class="catatan">' + esc(T.nama) + ' (' + T.luas + '), ' + esc(T.ket) + '. Harga ' + rupiah(x.harga) + ', jarak ke kedai ' + N.properti.kota[S.kota].jarak[tipe] + ' km.</p>' +
        (tipe === 'subsidi' ? '' : chipTab('rumahTunai', [['0', 'KPR'], ['1', 'Tunai']], tunai ? '1' : '0')) +
        (tunai ? '' : (tipe === 'subsidi' ? '' : '<h3 class="subjudul">Uang muka</h3>' + chipTab('dpRumah', P.komersial.dp.map(function (d) { return [d, Math.round(d * 100) + '%']; }), dp)) +
          '<h3 class="subjudul">Tenor</h3>' + chipTab('tenorRumah', P[tipe === 'subsidi' ? 'subsidi' : 'komersial'].tenor.map(function (t) { return [t, t + ' tahun']; }), tenor)) +
        '<ul class="daftar angka" style="margin-top:10px">' + (tunai ? baris('Harga', rupiah(x.harga)) + baris('BPHTB 5%', rupiah(x.bphtb)) + baris('Notaris dan AJB', rupiah(x.notaris)) :
          baris('Uang muka', rupiah(x.dp)) + baris('Biaya akad (provisi, notaris, asuransi)', rupiah(x.biaya)) + baris('BPHTB', x.bphtb ? rupiah(x.bphtb) : 'bebas (rumah subsidi)') +
          baris('<b>Angsuran</b>', '<b>' + rupiah(x.angsuran) + ' sebulan</b>', 'total') + baris('Bunga<small>' + (tipe === 'subsidi' ? '5% tetap sampai lunas' : (P.komersial.bungaFix * 100).toFixed(2).replace('.', ',') + '% tetap ' + P.komersial.tahunFix + ' tahun, lalu floating ±' + (P.komersial.bungaFloating * 100).toFixed(1).replace('.', ',') + '%; angsuran jadi ±' + rupiah(x.angsuranFloating)) + '</small>', '')) +
        baris('<b>Dibayar di awal</b>', '<b>' + rupiah(x.bayarAwal) + '</b>', 'total') + '</ul>' +
        '<ul class="daftar syarat">' + PROPERTI.syarat(S, tipe, x).map(function (y) { return '<li class="' + (y.ok ? 'ok' : 'belum') + '"><span>' + (y.ok ? '✓ ' : '✗ ') + esc(y.teks) + '</span></li>'; }).join('') + '</ul>' +
        '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="beliRumah:1">' + (tunai ? 'Beli tunai' : 'Ajukan KPR') + '</button></div>';
    }
    html += '<h3 class="subjudul">Tanah kavling</h3><ul class="daftar belanja">' + P.kavling.map(function (l) {
      return '<li><span><b>Kavling ' + l + ' m²</b><small>Sertifikat SHM, pinggir kota. Ditambah BPHTB dan notaris</small><small class="harga">' + rupiah(PROPERTI.hargaTanah(S, l)) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="beliTanah:' + l + '">Beli</button></span></li>';
    }).join('') + S.properti.tanah.map(function (t, i) {
      return '<li><span><b>Tanahmu ' + t.luas + ' m²</b><small>Dibeli ' + rupiah(t.hargaBeli) + ' · nilai sekarang ' + rupiah(PROPERTI.nilaiTanah(S, t)) + '</small></span><span><button type="button" class="chip-tombol" data-aksi="jualTanah:' + i + '">Jual</button></span></li>';
    }).join('') + '</ul><p class="catatan">Harga rumah subsidi dan bunga KPR mengikuti aturan 2026; harga rumah komersial, mewah, dan tanah adalah perkiraan dari iklan. Nilai tanah naik sekitar ' + Math.round(P.kenaikanTanah * 100) + '% setahun. Jual rumah atau tanah kena PPh ' + (P.pphJual * 100).toString().replace('.', ',') + '%.</p>';
    return html;
  }
  function layarKredit() {
    var x = N.motor.filter(function (m) { return m.id === app.kreditMotor; })[0], dp = app.kreditDp || 0.1, tenor = app.kreditTenor || 35, k = MOTOR.hitungKredit(x.harga, dp, tenor);
    return kepala('Kredit ' + x.nama, N.kreditMotor.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="motor" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3><div class="chip-baris">' + N.kreditMotor.dp.map(function (d) { return '<button type="button" class="chip-tombol' + (d === dp ? ' pilih' : '') + '" data-aksi="kreditDp:' + d + '">' + Math.round(d * 100) + '%</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Tenor</h3><div class="chip-baris">' + N.kreditMotor.tenor.map(function (t) { return '<button type="button" class="chip-tombol' + (t === tenor ? ' pilih' : '') + '" data-aksi="kreditTenor:' + t + '">' + t + ' bulan</button>'; }).join('') + '</div>' +
      '<ul class="daftar angka" style="margin-top:10px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + ' sebulan</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div class="bayar-baris" style="margin-top:12px"><button type="button" class="aksi kecil" data-aksi="kredit:bank">Ajukan (DP Rekening)</button><button type="button" class="aksi kecil" data-aksi="kredit:kk">Ajukan (DP Kartu Kredit)</button></div>' +
      '<p class="catatan">Perkiraan: bunga flat sekitar 1,8% sebulan plus asuransi. Angsuran dipotong dari rekening tiap bulan; telat kena denda harian dan tercatat di riwayat kredit. Menunggak 3 bulan, motor ditarik.</p>';
  }
  function layarOjol() {
    var cair = S.payout.reduce(function (t, x) { return t + x.jml; }, 0);
    return kepalaApp('Mitra pesan-antar', 'GoFood, GrabFood, ShopeeFood') + pesanApp() +
      '<ul class="daftar pesanan">' + N.platform.map(function (pl) {
        var st = S.platform[pl.id], ket = st.status === 'aktif' ? 'Aktif. Pesanan masuk saat kedai buka.' : st.status === 'proses' ? 'Sedang diverifikasi, aktif ' + namaTanggal(st.aktifPada) + '.' : 'Belum terdaftar.';
        return '<li class="kartu-pesanan"><div><b><i class="tanda-qris" style="background:' + pl.warna + '"></i>' + esc(pl.nama) + '</b><small>' + esc(pl.app) + ' · komisi ' + Math.round(pl.komisi * 100) + '%</small><small class="status">' + esc(ket) + '</small></div>' +
          '<div class="chip-baris">' + (st.status === 'tidak' ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarOjol:' + pl.id + '">Daftar</button>' :
            [10, 20, 30].map(function (mk) { return '<button type="button" class="chip-tombol' + (mk === st.markup ? ' pilih' : '') + '" data-aksi="markup:' + pl.id + '-' + mk + '">Harga +' + mk + '%</button>'; }).join('') +
            '<button type="button" class="chip-tombol" data-aksi="putusOjol:' + pl.id + '">Putus kerjasama</button>') + '</div></li>';
      }).join('') + '</ul>' +
      '<p class="catatan">Harga di aplikasi biasanya dinaikkan untuk menutup komisi. Contoh Kopsu Aren ' + rupiah(18000) + ' dengan +20% jadi ' + rupiah(21500) + ' di aplikasi. Pendapatan cair ke rekening hari kerja berikutnya' + (cair ? '; sedang menunggu cair ' + rupiah(cair) : '') + '.</p>';
  }

  /* ---------- aplikasi Usaha, Racik menu, PLN Mobile ---------- */
  function layarUsaha() {
    var u = S.usaha, t = USAHA.tempat(S), L = USAHA.LOKASI[u.lokasi], next = USAHA.TEMPAT[u.tier + 1];
    var statusMilik = u.milikLahan ? 'Lahan & tempat milik sendiri (SHM · bebas sewa)' : u.berhentiSewa ? 'Sewa kontainer dihentikan (fokus ojol)' : u.rukoBulanan ? 'Sewa ruko bulanan' : u.milikKontainer ? 'Kontainer milik sendiri (hanya sewa lahan)' : 'Sewa kontainer & lahan';
    var sewaTeks = u.milikLahan || u.berhentiSewa ? 'Rp0' : (t.sewaTahun && !u.rukoBulanan) ? rupiah(USAHA.sewaTahun(S)) + ' setahun' : rupiah(USAHA.sewaBulan(S)) + ' sebulan';
    var html = kepalaApp('Usaha', t.nama + ' · ' + L.nama) + pesanApp() +
      '<ul class="daftar angka">' + baris('Tempat', esc(t.nama)) + baris('Status kepemilikan', esc(statusMilik)) + baris('Kursi', t.kursi + ' kursi' + (u.tier === 4 ? ' ber-AC' : '')) +
      baris('Sewa', sewaTeks) +
      baris('Listrik', t.listrik === 'numpang' ? 'numpang, ' + rupiah(t.listrikBulan) + ' sebulan' : 'PLN prabayar, sisa ' + u.kwh.toFixed(1).replace('.', ',') + ' kWh', u.padam ? 'rugi' : '') +
      (u.tunggakanSewa ? baris('Tunggakan sewa', rupiah(u.tunggakanSewa), 'rugi') : '') + '</ul>' +
      '<h3 class="subjudul">Kepemilikan, sewa ruko & fokus ojol</h3><div class="chip-baris">' +
      (!u.milikKontainer && u.tier < 4 ? '<button type="button" class="chip-tombol" data-aksi="beliKontainer:1">Beli kontainer sendiri ' + rupiah(USAHA.hargaKontainer()) + '</button>' : '') +
      (!u.milikLahan ? '<button type="button" class="chip-tombol" data-aksi="beliLahan:1">Beli lahan SHM ' + rupiah(USAHA.hargaLahan(S)) + '</button>' : '') +
      (u.tier < 4 ? '<button type="button" class="chip-tombol pilih" data-aksi="sewaRuko:1">Sewa ruko 1 lantai</button>' : '') +
      (!u.ruko2Lantai ? '<button type="button" class="chip-tombol pilih" data-aksi="sewaRuko2Lantai:1">Sewa Ruko 2 Lantai (Lt.1 Kedai + Lt.2 Rental PS)</button>' : '<span class="chip event">Ruko 2 Lantai Aktif ✓</span>') +
      '<button type="button" class="chip-tombol" data-app="rentalps">Buka / Kelola Rental PS</button>' +
      (!u.milikLahan ? '<button type="button" class="chip-tombol" data-aksi="stopSewa:' + (u.berhentiSewa ? '0' : '1') + '">' + (u.berhentiSewa ? 'Sewa lagi & buka kedai' : 'Tidak perpanjang sewa (fokus ojol)') + '</button>' : '') +
      '<button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-aksi="promo:1">' + (S.promoAktif ? 'Promo ✓' : 'Promo') + '</button>' +
      '</div><p class="catatan">' + esc(L.ket) + ' Ruko 2 Lantai memungkinkan Lantai 1 untuk Kedai Kopi & Cemilan dan Lantai 2 untuk Usaha Rental PlayStation!</p>';
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
    var resep = USAHA.susunResep(racikan), hpp = USAHA.hppResep(resep), harga = racikan.harga || Math.ceil(hpp * 2.2 / 500) * 500;
    racikan.harga = harga;
    var bintang = USAHA.perkiraanBintang(resep);
    var pil = function (judul, kunci, opsi) {
      return '<h3 class="subjudul">' + judul + '</h3><div class="chip-baris">' + opsi.map(function (o) {
        var bisa = !o[2] || USAHA.bisaEspresso(S);
        return '<button type="button" class="chip-tombol' + (racikan[kunci] === o[0] ? ' pilih' : '') + '"' + (bisa ? '' : ' disabled') + ' data-aksi="racikan:' + kunci + '-' + (o[0] || '') + '">' + o[1] + '</button>';
      }).join('') + '</div>';
    };
    var rmdMenu = KAL.apakahRamadan && KAL.apakahRamadan(S.hari) > 0;
    var menuAturList = MN.MENU.filter(function (m) { return !m.takjil || rmdMenu; });
    var jmlAktif = menuAturList.filter(function (m) { return USAHA.menuDijual(S, m.id); }).length;
    if (!{ kopi: 1, espresso: 1, cokelat: 1 }[racikan.dasar]) racikan.dasar = 'kopi';
    if (racikan.susu && !{ uht: 1, skm: 1, foam: 1 }[racikan.susu]) racikan.susu = 'uht';
    if (racikan.manis && !{ gula: 1, aren: 1 }[racikan.manis]) racikan.manis = 'aren';
    var daftarMenuHtml = '<h3 class="subjudul">Daftar menu (bebas jual / hentikan)</h3><ul class="daftar belanja">' + menuAturList.map(function (m) {
      var aktif = USAHA.menuDijual(S, m.id);
      return '<li' + (aktif ? '' : ' class="redup"') + '><span><b>' + esc(m.nama) + (m.spesial ? ' · Spesial' : m.sendiri ? ' · Racikanmu' : m.takjil ? ' · Takjil Ramadan' : m.cemilan ? ' · Cemilan' : '') + '</b><small>' + (m.cemilan ? 'Hangat' : 'Bisa Panas & Dingin') + ' · HPP ' + rupiah(m.hpp) + ' · jual ' + rupiah(m.harga) + '</small></span>' +
        '<span><button type="button" class="chip-tombol' + (aktif ? ' pilih' : '') + '" data-aksi="toggleMenu:' + m.id + '">' + (aktif ? 'Dijual ✓' : 'Tidak dijual') + '</button></span></li>';
    }).join('') + '</ul><p class="catatan">Menu yang dimatikan tidak tampil saat meracik dan bahannya otomatis disembunyikan dari toko Belanja. Kalau pembeli mencari menu yang sedang tidak dijual, sebagian pindah menu lain dan sebagian batal beli.</p>';
    return kepalaApp('Racik & atur menu', jmlAktif + ' dari ' + menuAturList.length + ' menu sedang dijual') + pesanApp() +
      daftarMenuHtml +
      '<h3 class="subjudul">Buat racikan menu baru (' + S.menuSendiri.length + '/6)</h3>' +
      pil('Panas atau es', 'panas', [[true, 'Panas'], [false, 'Es']]) +
      pil('Dasar', 'dasar', [['kopi', 'Kopi tubruk'], ['espresso', 'Espresso', true], ['cokelat', 'Cokelat']]) +
      pil('Susu', 'susu', [['', 'Tanpa susu'], ['uht', 'Susu UHT'], ['skm', 'Kental manis'], ['foam', 'Foam', true]]) +
      pil('Pemanis', 'manis', [['', 'Tanpa gula'], ['gula', 'Gula pasir'], ['aren', 'Gula aren']]) +
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
      '<div class="chip-baris"><button type="button" class="chip-tombol' + (meter === 'kos' ? ' pilih' : '') + '" data-aksi="meter:kos">Meteran ' + DIRI.tempat(S) + '</button><button type="button" class="chip-tombol' + (meter === 'kedai' ? ' pilih' : '') + '" data-aksi="meter:kedai">Meteran kedai</button></div>';
    if (meter === 'kedai' && t.listrik !== 'token') return html + '<p class="catatan">Kedai masih numpang listrik ke pemilik lahan, dibayar ' + rupiah(t.listrikBulan) + ' sebulan bersama sewa. Meteran prabayar sendiri dipasang saat naik ke kontainer 20 kaki.</p>';
    var kwh = meter === 'kos' ? S.rumah.kwh : u.kwh, padam = meter === 'kos' ? S.rumah.padam : u.padam;
    var namaMeter = meter === 'kos' ? DIRI.tempat(S) : 'kedai';
    return html + '<div class="saldo-besar" style="margin-top:10px"><small>Sisa token ' + namaMeter + '</small><b>' + kwh.toFixed(1).replace('.', ',') + ' kWh</b></div>' +
      (padam ? '<p class="racik-pesan salah">Listrik ' + namaMeter + ' padam karena token habis.</p>' : '') +
      '<ul class="daftar angka">' + N.pln.nominal.map(function (n) {
        var tk = USAHA.token(S, n);
        return '<li><span>Token ' + rupiah(n) + '<small>dapat ' + tk.kwh.toFixed(1).replace('.', ',') + ' kWh</small></span><span><button type="button" class="chip-tombol" data-aksi="token:' + n + '">Bayar ' + rupiah(tk.bayar) + '</button></span></li>';
      }).join('') + '</ul>' +
      '<p class="catatan">Tarif ' + rupiah(N.pln.tarif) + ' per kWh (1.300 VA ke atas). kWh dihitung dari nominal dikurangi pajak penerangan jalan ' + (DIRI.kota(S).ppj * 100).toFixed(1).replace('.', ',') + '%; biaya admin aplikasi ' + rupiah(N.pln.admin) + '. ' +
      (meter === 'kos' ? 'Di ' + DIRI.tempat(S) + ': AC menyala saat kamu di ' + DIRI.tempat(S) + (DIRI.adaAc(S) ? '' : ' (belum punya AC)') + ', kulkas 24 jam, TV dan PS saat dipakai.' : 'Di kedai: kulkas dan freezer 24 jam; mesin espresso, lampu, AC, dan TV saat buka.') + '</p>';
  }
  function layarToko(toko) {
    toko = toko || 'tokopedia';
    var namaToko = toko === 'shopee' ? 'Shopee' : 'Tokopedia';
    var diRumah = S.rumah.jenis === 'rumah', kat = app.tokoKat || 'semua';
    var tk = KAL.tanggalKembar(S.hari), dsk = DIRI.diskonToko(S, toko);
    var barangToko = N.barangRumah.filter(function (b) { return b.id !== 'ps5' && b.id !== 'ps5disc' && b.id !== 'kaset' && (!b.toko || b.toko === toko); });
    var katAda = (N.kategoriToko || [{ id: 'semua', nama: 'Semua' }]).filter(function (c) {
      return c.id === 'semua' || barangToko.some(function (b) { return b.kat === c.id; });
    });
    if (!katAda.some(function (c) { return c.id === kat; })) kat = 'semua';
    var daftarB = barangToko.filter(function (b) { return kat === 'semua' || b.kat === kat; });
    return kepalaApp(namaToko, (diRumah ? 'Isi rumah' : 'Isi kamar kos') + (tk ? ' · Promo ' + tk : '')) +
      (tk ? '<div class="isbat" style="margin-top:0;margin-bottom:8px">Promo Tanggal Kembar ' + tk + ' ' + namaToko + '! Diskon otomatis ' + Math.round(dsk * 100) + '% semua barang hari ini.</div>' : '') +
      chipTab('tokoKat', katAda.map(function (c) { return [c.id, c.nama]; }), kat) +
      pesanApp() + '<ul class="daftar belanja">' + daftarB.map(function (b) {
      var punya = !!S.rumah.barang[b.id], jml = S.rumah.barang[b.id];
      var info = punya ? DIRI.infoUmurBarang(S, b.id) : null;
      var hJual = punya ? DIRI.nilaiJualBarang(S, b.id) : 0;
      var hAsli = b.harga, hPromo = DIRI.hargaToko(S, b, toko);
      var ketMilik = punya ? ' · umur ' + info.hari + ' hari, dipakai ' + info.pakai + '× · harga jual ' + rupiah(hJual) : '';
      var tombolBeli = (!punya || b.banyak) ? '<button type="button" class="chip-tombol pilih" data-aksi="barang:' + b.id + '-' + toko + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="barangDompet:' + b.id + '-' + toko + '">Dompet</button><button type="button" class="chip-tombol" data-aksi="barangKk:' + b.id + '-' + toko + '">Kartu kredit</button>' : '';
      var tombolJual = punya ? '<button type="button" class="chip-tombol" data-aksi="jualBarang:' + b.id + '">Jual ' + rupiah(hJual) + '</button>' : '';
      return '<li' + (b.rumah && !diRumah ? ' class="redup"' : '') + '><span><b>' + esc(b.nama) + '</b><small>' + esc(b.merek) + ' · ' + esc(b.ket) + (b.rumah && !diRumah ? ' · khusus rumah' : '') + esc(ketMilik) + '</small><small class="harga">' + (dsk ? '<s>' + rupiah(hAsli) + '</s> ' + rupiah(hPromo) + ' <em class="turun">−' + Math.round(dsk * 100) + '%</em>' : rupiah(hAsli)) + (b.banyak && jml ? ' · punya ' + jml : '') + '</small></span>' +
        '<span class="tombol-tegak">' + tombolBeli + tombolJual + '</span></li>';
    }).join('') + '</ul><p class="catatan">' + (diRumah ? 'Rumah baru masih kosong: tidak ada AC bawaan.' : 'Kos sudah ada kasur, lemari, dan AC. Barang besar baru bisa dibeli setelah punya rumah.') + ' Pantau tanggal kembar (1.1, 2.2, …, 11.11, 12.12) untuk diskon besar Shopee & Tokopedia!</p>';
  }
  function layarGame() {
    var tab = app.gameTab || 'konsol', filterK = app.gameKonsolFilter || 'semua';
    var jmlKonsol = S.game && S.game.konsol ? Object.keys(S.game.konsol).length : 0;
    var jmlKaset = S.game && S.game.kaset ? Object.keys(S.game.kaset).length : 0;
    var html = kepalaApp('Toko game', 'PlayStation 1–5 Original · ' + jmlKonsol + ' konsol · ' + jmlKaset + ' game') +
      chipTab('gameTab', [['konsol', 'Konsol PS1–PS5'], ['kaset', 'Game Original'], ['koleksi', 'Koleksiku & Jual']], tab) + pesanApp();
    if (!DIRI.punya(S, 'tv')) html += '<p class="racik-pesan">Kamu belum punya TV di ' + DIRI.tempat(S) + '. Beli TV dulu di Tokopedia supaya konsol bisa dimainkan.</p>';
    if (tab === 'konsol') {
      var ps5Baru = (N.konsolGame || []).filter(function (k) { return !k.bekas; });
      html += '<h3 class="subjudul">PS5 Baru Resmi (Garansi Sony Indonesia)</h3><ul class="daftar belanja">' + ps5Baru.map(function (k) {
        var milik = S.game && S.game.konsol && S.game.konsol[k.id];
        var hJual = milik ? DIRI.nilaiJualKonsol(S, k.id) : 0;
        var umur = milik ? Math.max(0, S.hari - (milik.dibeli || S.hari)) : 0;
        return '<li><span><b>' + esc(k.nama) + '</b><small>' + esc(k.merek) + ' · ' + esc(k.kelengkapan) + ' · stamina +' + k.stamina + '/jam</small>' +
          (milik ? '<small>Sudah punya · umur ' + umur + ' hari, dimainkan ' + (milik.pakai || 0) + '× · nilai jual ' + rupiah(hJual) + '</small>' : '') +
          '<small class="harga">' + rupiah(k.harga) + '</small></span>' +
          '<span class="tombol-tegak">' + (milik ? '<button type="button" class="chip-tombol" data-aksi="jualKonsol:' + k.id + '">Jual ' + rupiah(hJual) + '</button>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="beliKonsol:' + k.id + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliKonsolKk:' + k.id + '">Kartu kredit</button>') + '</span></li>';
      }).join('') + '</ul>';
      var pasar = (S.game && S.game.pasar && S.game.pasar.unit) || [];
      html += '<h3 class="subjudul">PS1 – PS4 Bekas Original (Stok Minggu Ini)</h3>' + (pasar.length ? '<ul class="daftar belanja">' + pasar.map(function (u, idx) {
        var sudah = DIRI.punyaKonsol(S, u.id);
        var km = DIRI.konsolModel(u.id);
        return '<li><span><b>' + esc(u.nama) + ' (' + u.tahun + ')</b><small>Kondisi fisik: <b>' + esc(u.kondisi) + '</b> — ' + esc(u.ketKondisi) + '</small><small>' + esc(u.kelengkapan) + ' · stamina +' + (km ? km.stamina : 12) + '/jam</small><small class="harga">' + rupiah(u.harga) + '</small></span>' +
          '<span class="tombol-tegak">' + (sudah ? '<small>Sudah punya ' + esc(u.id.toUpperCase()) + '</small>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="beliKonsol:pasar:' + idx + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliKonsolKk:pasar:' + idx + '">Kartu kredit</button>') + '</span></li>';
      }).join('') + '</ul>' : '<p class="catatan">Semua unit bekas minggu ini sudah terjual. Stok baru datang minggu depan.</p>') +
      '<p class="catatan">PS1 sampai PS4 sudah tidak diproduksi baru oleh Sony, sehingga dijual bekas original dengan harga sesuai kondisi fisik dan kelengkapan. PS5 dijual baru bersegel garansi resmi Sony Indonesia.</p>';
      return html;
    }
    if (tab === 'kaset') {
      html += chipTab('gameKonsolFilter', [['semua', 'Semua'], ['ps1', 'PS1'], ['ps2', 'PS2'], ['ps3', 'PS3'], ['ps4', 'PS4'], ['ps5', 'PS5']], filterK);
      var daftarG = (N.gameKonsol || []).filter(function (g) { return filterK === 'semua' || g.konsol === filterK; });
      html += '<ul class="daftar belanja">' + daftarG.map(function (g) {
        var milik = S.game && S.game.kaset && S.game.kaset[g.id];
        var bisa = DIRI.bisaMainGame(S, g);
        var hJual = milik ? DIRI.nilaiJualGame(S, g.id) : 0;
        var labelKondisi = g.langka ? 'Original Kolektor Langka' : g.bekas ? 'Bekas Original Mulus' : 'Baru Original Segel';
        return '<li' + (!bisa && !milik ? ' class="redup"' : '') + '><span><b>[' + esc(g.konsol.toUpperCase()) + '] ' + esc(g.nama) + '</b>' +
          '<small>' + esc(g.format) + ' · ' + labelKondisi + ' · stamina +' + g.stamina + '</small>' +
          '<small>' + esc(g.ket) + (milik ? ' · dimainkan ' + (milik.pakai || 0) + '×' : !bisa ? ' · belum punya konsol ' + esc(g.konsol.toUpperCase()) : '') + '</small>' +
          '<small class="harga">' + rupiah(g.harga) + '</small></span>' +
          '<span class="tombol-tegak">' + (milik ? '<button type="button" class="chip-tombol" data-aksi="jualGame:' + g.id + '">Jual ' + rupiah(hJual) + '</button>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="beliGame:' + g.id + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliGameKk:' + g.id + '">Kartu kredit</button>') + '</span></li>';
      }).join('') + '</ul><p class="catatan">Semua kaset & Blu-ray adalah rilisan fisik original. PS2 bisa memutar CD original PS1, dan PS5 bisa memainkan game PS4.</p>';
      return html;
    }
    var kIds = Object.keys((S.game && S.game.konsol) || {}), gIds = Object.keys((S.game && S.game.kaset) || {});
    html += '<h3 class="subjudul">Konsol milikmu</h3>' + (kIds.length ? '<ul class="daftar belanja">' + kIds.map(function (id) {
      var k = S.game.konsol[id], umur = Math.max(0, S.hari - (k.dibeli || S.hari)), hj = DIRI.nilaiJualKonsol(S, id);
      return '<li><span><b>' + esc(k.nama) + (k.tahun ? ' (' + k.tahun + ')' : '') + '</b><small>Kondisi: ' + esc(k.kondisi || 'Normal') + ' · dibeli ' + rupiah(k.hargaBeli) + '</small><small>Umur ' + umur + ' hari · dipakai ' + (k.pakai || 0) + ' jam</small><small class="harga">Harga jual sekarang ' + rupiah(hj) + '</small></span>' +
        '<span><button type="button" class="chip-tombol" data-aksi="jualKonsol:' + id + '">Jual ' + rupiah(hj) + '</button></span></li>';
    }).join('') + '</ul>' : '<p class="catatan">Belum punya konsol PlayStation.</p>');
    html += '<h3 class="subjudul">Game original milikmu</h3>' + (gIds.length ? '<ul class="daftar belanja">' + gIds.map(function (id) {
      var gk = S.game.kaset[id], umur = Math.max(0, S.hari - (gk.dibeli || S.hari)), hj = DIRI.nilaiJualGame(S, id);
      return '<li><span><b>[' + esc(gk.konsol.toUpperCase()) + '] ' + esc(gk.nama) + '</b><small>' + esc(gk.format || 'Original Disc') + ' · dibeli ' + rupiah(gk.hargaBeli) + '</small><small>Umur ' + umur + ' hari · dimainkan ' + (gk.pakai || 0) + ' kali</small><small class="harga">Harga jual sekarang ' + rupiah(hj) + '</small></span>' +
        '<span><button type="button" class="chip-tombol" data-aksi="jualGame:' + id + '">Jual ' + rupiah(hj) + '</button></span></li>';
    }).join('') + '</ul>' : '<p class="catatan">Belum punya kaset/game original.</p>');
    return html + '<p class="catatan">Harga jual kembali turun sesuai umur simpan dan seberapa sering dipakai bermain. Kaset langka seperti Suikoden II memiliki nilai jual kembali lebih stabil.</p>';
  }

  /* ---------- aplikasi Google Maps dan Media sosial ---------- */
  function layarMaps() {
    var d = S.dunia, m = d.maps, html = kepalaApp('Google Maps', 'Kopi terdekat') + pesanApp();
    if (m.status === 'tidak') html += '<p class="catatan">Kedai belum muncul di Google Maps. Daftarkan lewat Google Bisnisku; verifikasi sekitar 5 hari.</p><div style="margin-top:10px"><button type="button" class="aksi" data-aksi="maps:1">Daftar Google Bisnisku</button></div>';
    else if (m.status === 'proses') html += '<p class="catatan">Sedang diverifikasi, muncul ' + namaTanggal(m.aktifPada) + '.</p>';
    else html += '<div class="saldo-besar"><small>' + esc(S.namaToko || 'Kopi Kontainer') + ' · ' + d.ulasan.length + ' ulasan</small><b>★ ' + (d.ulasan.length ? DUNIA.rataMaps(S).toFixed(1).replace('.', ',') : '-') + '</b></div>';
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
    var so = S.dunia.sosmed, tren = MN.MENU.filter(function (m) { return m.id === so.tren; })[0] || MN.MENU[0];
    return kepalaApp('Media sosial', 'Instagram, Threads, TikTok, WhatsApp Business') + pesanApp() +
      '<ul class="daftar angka">' + baris('Pengikut Instagram', so.ig.toLocaleString('id-ID')) + baris('Pengikut Threads', (so.threads || 0).toLocaleString('id-ID')) + baris('Pengikut TikTok', so.tiktok.toLocaleString('id-ID')) + baris('Pelanggan langganan', S.dunia.langganan + ' orang') +
      baris('Tren minggu ini', esc(tren ? tren.nama : 'Kopi gula aren')) + (S.hari <= so.viralSampai ? baris('Status', 'Sedang viral!', 'total') : '') + '</ul>' +
      '<h3 class="subjudul">Posting (15 menit)</h3><div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="post:ig">Foto menu di Instagram</button><button type="button" class="chip-tombol" data-aksi="post:threads">Cerita kedai di Threads</button><button type="button" class="chip-tombol" data-aksi="post:tiktok">Video racik di TikTok</button></div>' +
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
    var umk = STAF.umk(S), kls = STAF.kelasUsaha(S), tgt = S.targetBulanan || 0, capai = S.gelasBulanIni || 0;
    var totTunggak = STAF.totalTunggakanGaji ? STAF.totalTunggakanGaji(S) : 0, hrTunggak = STAF.maksHariTunggakan ? STAF.maksHariTunggakan(S, S.hari) : 0;
    var html = kepalaApp('Karyawan', 'Patokan UMKM Rp1,2 jt · UMK ' + rupiah(umk) + ' · usaha ' + kls) + pesanApp();
    /* Tabungan Gaji Karyawan & Tunggakan Gaji (Maksimal 90 Hari) */
    html += '<div class="saldo-besar" style="background:#5e35b1"><small>Tabungan Gaji Karyawan (Tidak tercampur saat pembelian)</small><b>' + rupiah(S.bank.tabunganGaji || 0) + '</b></div>' +
      '<div class="chip-baris" style="margin-bottom:8px">' + tombolUang('isiTabGaji', [250000, 500000, 1200000, 3000000]) +
      ((S.bank.tabunganGaji || 0) > 0 ? '<button type="button" class="chip-tombol" data-aksi="tarikTabGaji:semua">Tarik ke Rekening</button>' : '') + '</div>';
    if (totTunggak > 0) {
      html += '<div class="isbat peringatan" style="margin-top:0;margin-bottom:10px"><b>⚠️ Tunggakan Gaji Karyawan: ' + rupiah(totTunggak) + ' (' + hrTunggak + ' / 90 hari)</b><br>' +
        'Batas maksimal menunggak gaji adalah <b>90 hari</b>. Jika lewat 90 hari belum lunas, Disnaker & karyawan akan <b>menyita & menjual paksa aset termahalmu</b> (mobil/motor/konsol/gadget) untuk melunasi gaji, dan uang kembaliannya dikembalikan ke rekeningmu.<br>' +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="bayarTunggakanGaji:1">Lunasi Tunggakan Sekarang (' + rupiah(totTunggak) + ')</button></div></div>';
    }
    html += '<div class="saldo-besar" style="background:#155e57"><small>Target bulanan (Achieve = bonus 1× gaji → 2× gaji pokok)</small><b>' + (tgt ? capai.toLocaleString('id-ID') + ' / ' + tgt.toLocaleString('id-ID') + ' gelas' : 'Target belum dipasang') + '</b>' + (tgt ? persenBar(capai / tgt * 100) : '') + '</div>' +
      '<div class="chip-baris" style="margin-bottom:10px">' + [0, 500, 1000, 2500, 5000, 10000].map(function (n) {
        return '<button type="button" class="chip-tombol' + (tgt === n ? ' pilih' : '') + '" data-aksi="targetBulan:' + n + '">' + (n === 0 ? 'Nonaktif' : n.toLocaleString('id-ID')) + '</button>';
      }).join('') + '</div>';
    html += S.staf.length ? '<ul class="daftar pesanan">' + S.staf.map(function (k) {
      var j = STAF.jamKerja(S, k), dur = Math.round((j[1] - j[0]) / 60), status = S.hari < k.mulai ? 'Mulai kerja besok' : S.hari < k.sakitSampai ? 'Sakit' : !STAF.masuk(S, k) ? 'Libur hari ini' : 'Jam kerja ' + jam(j[0]) + '–' + jam(j[1]) + ' (' + dur + ' jam)';
      var jkLabel = (k.gender === 'cewek' ? 'Cewek' : 'Cowok') + ' · ' + STAF.usiaKaryawan(S, k) + ' thn';
      var hubStaf = k.statusHubunganStaf === 'menikah' ? ' · 💍 Menikah dgn ' + k.pasanganStafNama : k.statusHubunganStaf === 'pacaran' ? ' · 💑 Pacaran dgn ' + k.pasanganStafNama : '';
      var tgkK = k.gajiTelat ? ' · ⚠️ Nunggak ' + rupiah(k.gajiTelat) : '';
      return '<li class="kartu-pesanan"><button type="button" class="kartu-tombol" data-aksi="staf:' + k.id + '"><b>' + esc(k.nama) + ' (' + jkLabel + ')' + (k.paruh ? ' · paruh waktu' : '') + (k.punyaMotorPribadi ? ' · punya motor' : '') + esc(hubStaf) + '</b>' +
        '<small>' + k.tugas.map(function (t) { return STAF.TUGAS[t]; }).join(', ') + esc(tgkK) + '</small><small class="status">' + esc(status) + '</small>' +
        '<span class="dua-bar"><span>Tenaga' + persenBar(k.tenaga) + '</span><span>Betah' + persenBar(k.setia) + '</span></span></button></li>';
    }).join('') + '</ul>' : '<p class="catatan">Belum ada karyawan. Pasang lowongan untuk mendapat pelamar.</p>';
    html += '<h3 class="subjudul">Lowongan</h3>' + (S.lowongan ? '<p class="catatan">Lowongan terpasang di ' + (S.lowongan.lewat === 'sosmed' ? 'media sosial' : 'papan depan kedai') + ' sampai ' + namaTanggal(S.lowongan.sampai) + '. Pelamar datang tiap pagi.</p>' :
      '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="lowongan:papan">Papan depan kedai (gratis)</button><button type="button" class="chip-tombol" data-aksi="lowongan:sosmed">Iklan media sosial ' + rupiah(KK_STAF_BIAYA()) + '</button></div>');
    if (S.pelamar.length) html += '<h3 class="subjudul">Pelamar</h3><ul class="daftar pesanan">' + S.pelamar.map(function (p) {
      var jkP = (p.gender === 'cewek' ? 'Cewek' : 'Cowok') + ' · ' + STAF.usiaKaryawan(S, p) + ' thn';
      return '<li class="kartu-pesanan"><div><b>' + esc(p.nama) + ' (' + jkP + ')' + (p.paruh ? ' · paruh waktu' : '') + (p.punyaMotorPribadi ? ' · punya motor pribadi' : '') + '</b><small>Racik ' + bintang(p.racik) + ' · Cepat ' + bintang(p.cepat) + ' · Ramah ' + bintang(p.ramah) + ' · Jujur ?</small>' +
        '<small>' + esc(p.agama) + ' · ' + (p.paruh ? 'dibayar per jam Rp10.000, tunai tiap hari' : 'minta gaji ' + rupiah(p.minta) + ' sebulan') + '</small>' +
        '<small class="status">Menunggu jawaban sampai ' + namaTanggal(p.sampai - 1) + '</small></div>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="terimaPelamar:' + p.id + '">Terima</button><button type="button" class="chip-tombol" data-aksi="tolakPelamar:' + p.id + '">Tolak</button></div></li>';
    }).join('') + '</ul>';
    return html + '<p class="catatan">Gaji Rp1,2 juta ke atas sudah membuat karyawan UMKM betah (>50%). Kepala toko otomatis membeli stok kritis sesuai uang di laci. Semakin lama bekerja, bintang karyawan otomatis naik hingga penuh 5★!</p>';
  }
  function KK_STAF_BIAYA() { return STAF.BIAYA_LOWONGAN; }
  function layarStaf() {
    var k = STAF.cari(S, app.stafId); if (!k) { app.nama = 'karyawan'; return layarKaryawan(); }
    var umk = STAF.umk(S), j = STAF.jamKerja(S, k), durJam = Math.round((j[1] - j[0]) / 60), lemburJam = !k.paruh && durJam > 7 ? durJam - 7 : 0;
    var semuaKeys = Object.keys(STAF.TUGAS), semuaPilih = semuaKeys.every(function (t) { return k.tugas.indexOf(t) >= 0; });
    var upahJam = k.upahPerJam || 10000, tj = k.tunjangan || { bpjs: false, thr: false, uangMakan: 0, insentif: 0 };
    var hk = k.hariKerja || [false, true, true, true, true, true, true];
    var jkStaf = (k.gender === 'cewek' ? 'Cewek' : 'Cowok') + ' · ' + STAF.usiaKaryawan(S, k) + ' tahun';
    var gPemain = (S.profil && S.profil.gender) || 'cowok', lawanJenis = k.gender !== gPemain;
    var statusHub = k.statusHubunganStaf === 'menikah' ? 'Menikah dengan ' + k.pasanganStafNama : k.statusHubunganStaf === 'pacaran' ? 'Berpacaran dengan ' + k.pasanganStafNama : 'Lajang';
    var kdmStok = (S.kesehatan && S.kesehatan.kondom) || 0;
    return kepala(k.nama, jkStaf + ' · ' + k.agama + ' · mulai ' + namaTanggal(k.mulai) + (k.paruh ? ' · paruh waktu' : '') + (k.punyaMotorPribadi ? ' · motor pribadi' : ''), '<button type="button" class="panah" data-app="karyawan" aria-label="Kembali">‹</button>') + pesanApp() +
      '<ul class="daftar angka">' + baris('Racik', bintang(k.racik)) + baris('Cepat', bintang(k.cepat)) + baris('Ramah', bintang(k.ramah)) +
      baris('Tenaga', Math.round(k.tenaga) + '%', k.tenaga < 30 ? 'rugi' : '') + baris('Betah', Math.round(k.setia) + '%', k.setia < 35 ? 'rugi' : '') +
      baris('Status hubungan', esc(statusHub) + (k.hamil ? ' · 🤰 Sedang hamil' : '')) +
      (k.gajiTelat ? baris('Tunggakan gaji', rupiah(k.gajiTelat), 'rugi') : '') +
      baris('Pengalaman', (k.hariKerjaTotal || 0) + ' hari · ' + k.gelas + ' gelas') +
      (k.bensinInsentif ? baris('Reimburse bensin kurir bulan ini', rupiah(k.bensinInsentif)) : '') + '</ul>' +
      (lawanJenis ? '<h3 class="subjudul">Pendekatan & Hubungan Intim (HB dengan Karyawan)</h3>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="hbTarget:1|staf:' + k.id + '">HB Pakai Kondom (' + kdmStok + ')</button>' +
        '<button type="button" class="chip-tombol" data-aksi="hbTarget:0|staf:' + k.id + '">HB Tanpa Kondom (65% Hamil)</button></div>' +
        '<p class="catatan" style="margin-top:2px">Meningkatkan kesetiaan karyawan & stamina penuh, tetapi bila kamu sudah menikah ada risiko 35% ketahuan pasangan dan digugat cerai!</p>' : '') +
      '<h3 class="subjudul">Tugas (boleh satu atau semua)</h3><div class="chip-baris">' +
      semuaKeys.map(function (t) { return '<button type="button" class="chip-tombol' + (k.tugas.indexOf(t) >= 0 ? ' pilih' : '') + '" data-aksi="tugas:' + t + '">' + STAF.TUGAS[t] + '</button>'; }).join('') +
      '<button type="button" class="chip-tombol' + (semuaPilih ? ' pilih' : '') + '" data-aksi="tugas:semua">' + (semuaPilih ? 'Semua tugas ✓' : 'Pilih semua') + '</button></div>' +
      '<h3 class="subjudul">Hari kerja (tap untuk atur masuk / libur)</h3><div class="chip-baris">' +
      N.hariSingkat.map(function (h, i) { return '<button type="button" class="chip-tombol' + (hk[i] ? ' pilih' : '') + '" data-aksi="libur:' + i + '">' + h + (hk[i] ? ' ✓' : ' (Libur)') + '</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Jam kerja (' + durJam + ' jam sehari' + (lemburJam ? ' · ' + lemburJam + ' jam lembur' : '') + ')</h3>' +
      '<div class="atur-baris"><div><b>Jam masuk</b><span>Mulai bekerja di kedai</span></div><div class="langkah"><button type="button" data-aksi="jamMasuk:-1" aria-label="Majukan jam masuk">−</button><output>' + jam(j[0]) + '</output><button type="button" data-aksi="jamMasuk:1" aria-label="Mundurkan jam masuk">+</button></div></div>' +
      '<div class="atur-baris"><div><b>Jam pulang</b><span>Selesai bekerja</span></div><div class="langkah"><button type="button" data-aksi="jamPulang:-1" aria-label="Majukan jam pulang">−</button><output>' + jam(j[1]) + '</output><button type="button" data-aksi="jamPulang:1" aria-label="Mundurkan jam pulang">+</button></div></div>' +
      (k.paruh ?
        '<h3 class="subjudul">Upah paruh waktu</h3><div class="atur-baris"><div><b>' + rupiah(upahJam) + ' per jam</b><span>Sekitar ' + rupiah(upahJam * durJam) + ' sehari · dibayar tunai dari laci</span></div><div class="langkah"><button type="button" data-aksi="gaji:-1" aria-label="Turunkan upah">−</button><button type="button" data-aksi="gaji:1" aria-label="Naikkan upah">+</button></div></div>' :
        '<h3 class="subjudul">Gaji pokok bulanan</h3><div class="atur-baris"><div><b>' + rupiah(k.gaji) + ' sebulan</b><span>' + (k.gaji >= STAF.PATOKAN_UMKM ? 'Layak UMKM (betah sehat)' : 'Di bawah Rp1,2 jt (kurang betah)') + ' · lembur ' + rupiah(k.lemburBulan) + '</span></div><div class="langkah"><button type="button" data-aksi="gaji:-1" aria-label="Turunkan gaji">−</button><button type="button" data-aksi="gaji:1" aria-label="Naikkan gaji">+</button></div></div>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="gaji:0">Set Rp1,2 jt (UMKM)</button></div>') +
      '<h3 class="subjudul">Tunjangan & jaminan (opsional)</h3><div class="chip-baris">' +
      '<button type="button" class="chip-tombol' + (tj.bpjs ? ' pilih' : '') + '" data-aksi="tunj:bpjs-1">BPJS ' + (tj.bpjs ? '✓' : 'Mati') + '</button>' +
      '<button type="button" class="chip-tombol' + (tj.thr ? ' pilih' : '') + '" data-aksi="tunj:thr-1">THR ' + (tj.thr ? '✓' : 'Mati') + '</button></div>' +
      '<div class="chip-baris">' + [0, 15000, 25000].map(function (u) { return '<button type="button" class="chip-tombol' + ((tj.uangMakan || 0) === u ? ' pilih' : '') + '" data-aksi="tunj:uangMakan-' + u + '">Makan ' + (u ? rupiah(u) + '/hr' : 'Rp0') + '</button>'; }).join('') + '</div>' +
      '<div class="chip-baris">' + [0, 150000, 300000, 500000].map(function (u) { return '<button type="button" class="chip-tombol' + ((tj.insentif || 0) === u ? ' pilih' : '') + '" data-aksi="tunj:insentif-' + u + '">Insentif ' + (u ? rupiah(u) : 'Rp0') + '</button>'; }).join('') + '</div>' +
      (S.usaha.cabang.length ? '<h3 class="subjudul">Tempat kerja</h3><div class="chip-baris"><button type="button" class="chip-tombol' + (!k.cabang ? ' pilih' : '') + '" data-aksi="kerjaDi:utama">Kedai utama</button>' +
        S.usaha.cabang.map(function (c) { return '<button type="button" class="chip-tombol' + (k.cabang === c.id ? ' pilih' : '') + '" data-aksi="kerjaDi:' + c.id + '">Cabang ' + esc(USAHA.LOKASI[c.lokasi].nama.toLowerCase()) + '</button>'; }).join('') + '</div>' : '') +
      '<h3 class="subjudul">Pelatihan / Latih keahlian (' + rupiah(STAF.BIAYA_KURSUS) + ')</h3><div class="chip-baris">' +
      '<button type="button" class="chip-tombol" data-aksi="kursus:racik">Latih Racik (' + k.racik + '★)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="kursus:cepat">Latih Cepat (' + k.cepat + '★)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="kursus:ramah">Latih Ramah (' + k.ramah + '★)</button></div>' +
      '<button type="button" class="bahaya' + (app.yakinPecat ? ' yakin' : '') + '" data-aksi="pecat:1">' + (app.yakinPecat ? 'Tekan sekali lagi: berhentikan dan bayar pesangon' : 'Berhentikan ' + esc(k.nama)) + '</button>' +
      '<p class="catatan">Gaji Rp1,2 juta ke atas membuat karyawan UMKM betah. BPJS, THR, uang makan, dan insentif semuanya opsional dan menambah kesetiaan. Jika kurir memakai motor pribadi, biaya bensin otomatis masuk ke insentif bulanan.</p>';
  }

  /* ---------- aplikasi Gadget & Kuota, Keluarga, dan Sewa & Rental ---------- */
  function layarGadget() {
    var tab = app.gadgetTab || 'data', hm = DIRI.hpAktif(S), st = DIRI.infoStorageHp(S), wifi = DIRI.adaWifi(S);
    var bat = Math.round((S.hp && S.hp.baterai) || 95), wfInfo = N.paketData.wifiRumah;
    var html = kepalaApp('Gadget & Kuota', hm.nama + ' · Baterai ' + bat + '% · ' + (wifi ? 'WiFi Aktif' : 'Kuota ' + (S.hp ? S.hp.kuota : 0) + ' GB')) +
      chipTab('gadgetTab', [['data', 'Pulsa, Kuota & WiFi'], ['hp', 'HP Asli'], ['tablap', 'Tablet & Laptop'], ['apk', 'APK & Game HP']], tab) + pesanApp();
    html += '<div class="saldo-besar" style="background:#1e88e5"><small>' + esc(hm.merek + ' ' + hm.nama) + ' (' + hm.tahun + ')</small><b>' + (S.hp.cas ? '⚡ Mengisi ' : '🔋 ') + bat + '% · RAM ' + hm.ram + ' GB · ROM ' + st.terpakaiRom + '/' + st.totalRom + ' GB</b>' + persenBar(bat) + '</div>' +
      '<div class="chip-baris" style="margin-bottom:10px"><button type="button" class="chip-tombol' + (S.hp.cas ? ' pilih' : '') + '" data-aksi="casHp:1">' + (S.hp.cas ? '⚡ Cabut Charger (' + hm.watt + 'W)' : '🔌 Cas HP (' + hm.mah + ' mAh · Fast Charge ' + hm.watt + 'W)') + '</button></div>';
    if (tab === 'data') {
      var noHp = (S.hp && S.hp.nomor) || '081256000088';
      var masaAktif = (S.hp && S.hp.masaAktif != null) ? S.hp.masaAktif : (S.hari + 30);
      var sisaHariAktif = Math.max(0, masaAktif - S.hari);
      var kuotaGb = S.hp ? (S.hp.kuota || 0) : 0;
      var kuotaPresisi = kuotaGb.toFixed(3).replace('.', ',') + ' GB (' + Math.round(kuotaGb * 1024).toLocaleString('id-ID') + ' MB)';
      html += '<ul class="daftar angka">' +
        baris('Nomor HP Kartu SIM', '<b>' + esc(noHp) + '</b>') +
        baris('Masa aktif kartu<small>diperpanjang otomatis +30 s/d +60 hari setiap isi pulsa</small>', namaTanggal(masaAktif) + ' (' + (sisaHariAktif > 0 ? sisaHariAktif + ' hari lagi' : 'Masa tenggang!') + ')', sisaHariAktif <= 3 ? 'rugi' : '') +
        baris('Pulsa seluler<small>untuk telepon keluarga & beli paket internet</small>', rupiah(S.hp.pulsa || 0)) +
        baris('Sisa kuota internet (presisi)<small>dipakai saat buka sosmed, WA & Google/Apple Maps ojol</small>', kuotaPresisi, kuotaGb < 1 && !wifi ? 'rugi' : '') +
        baris('Status koneksi sekarang', wifi ? 'Terhubung WiFi (Bebas Kuota)' : 'Data Seluler (Pakai Kuota)') +
        baris('WiFi di ' + DIRI.tempat(S), S.rumah.wifi ? 'Terpasang (' + rupiah(wfInfo.hargaBulan) + '/bln)' : 'Belum pasang') +
        baris('WiFi di kedai', USAHA.punya(S, 'wifi') ? 'Terpasang' : 'Belum pasang (pasang di menu Usaha)') + '</ul>' +
        '<h3 class="subjudul">Isi Pulsa ' + esc(noHp) + ' (Memperpanjang Masa Aktif Kartu)</h3><div class="chip-baris">' +
        N.paketData.pulsa.map(function (nom) {
          return '<button type="button" class="chip-tombol" data-aksi="beliPulsa:' + nom + '-bank">Pulsa ' + (nom / 1000) + 'rb (Bank)</button>' +
            '<button type="button" class="chip-tombol" data-aksi="beliPulsa:' + nom + '-dompet">' + (nom / 1000) + 'rb (Dompet)</button>';
        }).join('') + '</div>' +
        '<h3 class="subjudul">Beli Paket Kuota Internet</h3><ul class="daftar belanja">' +
        N.paketData.kuota.map(function (pk) {
          return '<li><span><b>' + esc(pk.nama) + '</b><small>Tambah +' + pk.gb + ' GB kuota utama 4G/5G</small><small class="harga">' + rupiah(pk.harga) + '</small></span>' +
            '<span class="tombol-tegak"><button type="button" class="chip-tombol pilih" data-aksi="beliKuota:' + pk.id + '-pulsa">Pakai Pulsa</button><button type="button" class="chip-tombol" data-aksi="beliKuota:' + pk.id + '-bank">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliKuota:' + pk.id + '-dompet">Dompet</button></span></li>';
        }).join('') + '</ul>' +
        '<h3 class="subjudul">WiFi Fiber di ' + DIRI.tempat(S) + '</h3>' +
        '<div class="kartu-pesanan" style="padding:12px;border-radius:12px"><b>' + esc(wfInfo.nama) + '</b><small>Biaya pasang ' + rupiah(wfInfo.pasang) + ' · langganan ' + rupiah(wfInfo.hargaBulan) + '/bulan. Selama di ' + DIRI.tempat(S) + ', instal game/APK, main game, dan sosmed tidak memotong kuota!</small>' +
        '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol' + (S.rumah.wifi ? '' : ' pilih') + '" data-aksi="wifiRumah:1">' + (S.rumah.wifi ? 'Berhenti langganan WiFi' : 'Pasang WiFi (' + rupiah(wfInfo.pasang + wfInfo.hargaBulan) + ')') + '</button></div></div>';
      return html;
    }
    if (tab === 'hp' || tab === 'tablap') {
      var merekFilter = app.merekGadget || 'semua';
      if (tab === 'hp') {
        html += chipTab('merekGadget', [['semua', 'Semua'], ['Apple', 'Apple'], ['Samsung', 'Samsung'], ['Xiaomi', 'Xiaomi'], ['OPPO', 'OPPO'], ['Realme', 'Realme'], ['Infinix', 'Infinix'], ['Vivo', 'Vivo']], merekFilter);
      }
      var thnKini = KAL.tgl(S.hari).y;
      var listG = N.daftarGadget.filter(function (g) {
        if (tab === 'hp' && g.jenis !== 'hp') return false;
        if (tab === 'tablap' && g.jenis === 'hp') return false;
        if (tab === 'hp' && merekFilter !== 'semua' && g.merek !== merekFilter) return false;
        return true;
      });
      html += '<ul class="daftar belanja">' + listG.map(function (g) {
        var milik = S.gadget && S.gadget[g.id], dipakai = g.jenis === 'hp' && S.hp.id === g.id;
        var hJual = milik ? DIRI.nilaiJualGadget(S, g.id) : 0;
        var rilis = +(g.tahunRilis || g.tahun || 2023);
        return '<li><span><b>[' + esc(g.merek) + '] ' + esc(g.nama) + ' (' + rilis + ')</b>' +
          '<small>RAM <b>' + g.ram + ' GB</b> · Storage <b>' + g.storage + ' GB</b> · Baterai <b>' + g.mah + ' mAh</b> · Charger <b>' + g.watt + 'W</b></small>' +
          '<small>' + esc(g.ket) + (g.jenis === 'hp' ? ' · Kamera ×' + g.kamera.toFixed(2).replace('.', ',') : '') + (g.sewaHarian ? ' · Bisa disewa ' + rupiah(g.sewaHarian) + '/hr' : '') + '</small>' +
          '<small class="harga">' + rupiah(g.harga) + (rilis > thnKini ? ' · Seri ' + rilis : '') + (milik ? ' · nilai jual ' + rupiah(hJual) : '') + '</small></span>' +
          '<span class="tombol-tegak">' + (milik ?
            (g.jenis === 'hp' && !dipakai ? '<button type="button" class="chip-tombol pilih" data-aksi="pakaiHp:' + g.id + '">Pakai HP ini</button>' : dipakai ? '<small><b>Sedang dipakai ✓</b></small>' : '') +
            '<button type="button" class="chip-tombol" data-aksi="jualGadget:' + g.id + '">Jual ' + rupiah(hJual) + '</button>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="beliGadget:' + g.id + '-bank">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-dompet">Dompet</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-kk">Kartu kredit</button>') +
          '</span></li>';
      }).join('') + '</ul><p class="catatan">Spesifikasi baterai (mAh), kecepatan charger (Watt), RAM, storage, dan harga sesuai seri asli. Charger Watt besar mengisi penuh baterai jauh lebih cepat!</p>';
      return html;
    }
    /* tab === 'apk' */
    html += '<ul class="daftar angka">' +
      baris('RAM HP Aktif (' + esc(hm.nama) + ')', hm.ram + ' GB') +
      baris('Storage Internal Terpakai', st.terpakaiRom + ' GB / ' + st.totalRom + ' GB (Sisa ' + st.sisaRom + ' GB)') + '</ul>' +
      '<h3 class="subjudul">Instal Aplikasi & Game di HP</h3><ul class="daftar belanja">' +
      N.apkHp.map(function (a) {
        var sudah = !!(S.hp.apk && S.hp.apk[a.id]);
        var cukupRam = hm.ram >= a.ram;
        return '<li' + (!cukupRam && !sudah ? ' class="redup"' : '') + '><span><b>' + esc(a.nama) + '</b>' +
          '<small>Ukuran <b>' + a.rom + ' GB</b> · Minimal RAM <b>' + a.ram + ' GB</b> · Unduh ' + a.kuotaGb + ' GB</small>' +
          '<small>' + esc(a.ket) + (!cukupRam ? ' · RAM HP kurang!' : '') + '</small></span>' +
          '<span class="tombol-tegak">' + (sudah ?
            (a.jenis === 'game' ? '<button type="button" class="chip-tombol pilih" data-aksi="mainApk:' + a.id + '">Main 30m (+' + a.stamina + ')</button>' : '<small><b>Aktif ✓</b></small>') +
            '<button type="button" class="chip-tombol" data-aksi="hapusApk:' + a.id + '">Hapus (' + a.rom + ' GB)</button>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="instalApk:' + a.id + '">Instal (' + a.rom + ' GB)</button>') +
          '</span></li>';
      }).join('') + '</ul><p class="catatan">Menginstal aplikasi membutuhkan sisa Storage (ROM), kapasitas RAM yang memadai, serta kuota internet (gratis kuota jika terhubung ke WiFi).</p>';
    return html;
  }

  function layarApotek() {
    var tab = app.apotekTab || 'obat', ks = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1 };
    var kbAktif = (ks.kbSampai || -1) >= S.hari, sisaKb = kbAktif ? (ks.kbSampai - S.hari + 1) : 0;
    var html = kepalaApp('Apotek K-24', 'Obat-obatan, vitamin, dokter & kontrasepsi') +
      chipTab('apotekTab', [['obat', 'Obat & Dokter'], ['kb', 'Kontrasepsi & KB'], ['vitamin', 'Vitamin & P3K']], tab) + pesanApp();
    /* status kesehatan semua karakter */
    var daftarSakit = [];
    if (S.diri.sakit) daftarSakit.push({ id: 'pemain', nama: (S.namaPemain || 'Kamu') + ' (Pemain)', sakit: S.diri.sakit });
    (S.keluarga || []).forEach(function (kl) { if (kl.sakit) daftarSakit.push({ id: kl.id, nama: kl.nama + ' (' + DIRI.labelPeran(S, kl) + ')', sakit: kl.sakit }); });
    (S.staf || []).forEach(function (k) { if (S.hari < k.sakitSampai) daftarSakit.push({ id: 'staf:' + k.id, nama: k.nama + ' (Karyawan)', sakit: { id: 'demam', nama: 'Sakit / kecapekan', berat: false } }); });
    if (daftarSakit.length) {
      html += '<div class="isbat peringatan" style="margin-top:0;margin-bottom:8px"><b>Sedang sakit:</b> ' +
        daftarSakit.map(function (x) { return esc(x.nama) + ' — ' + esc(x.sakit.nama); }).join('; ') + '</div>';
    }
    html += '<ul class="daftar angka" style="margin-bottom:8px">' +
      baris('Kondisi kamu', S.diri.sakit ? esc(S.diri.sakit.nama) : (S.hari <= (S.diri.kebalSampai || -1) ? 'Sehat (Kebal sakit ' + (S.diri.kebalSampai - S.hari + 1) + ' hr)' : 'Sehat (' + Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + '%)'), S.diri.sakit || (S.diri.kesehatan || 100) < 50 ? 'rugi' : '') +
      (S.diri.hiv ? baris('Status HIV', (ks.arvSampai >= S.hari) ? 'HIV+ (Terapi ARV aktif ' + (ks.arvSampai - S.hari + 1) + ' hr)' : 'HIV+ (Belum minum ARV — kesehatan menurun!)', (ks.arvSampai >= S.hari) ? '' : 'rugi') : '') +
      baris('Stok pengaman (Kondom)', (ks.kondom || 0) + ' pcs' + (ks.kondomGerigi ? ' (termasuk ' + ks.kondomGerigi + ' bergerigi)' : '')) +
      baris('Perlindungan KB (Pil/Suntik)', kbAktif ? 'Aktif (' + sisaKb + ' hari lagi)' : 'Tidak aktif') + '</ul>';
    /* kotak P3K untuk minum obat yang sudah dibeli */
    var obatDimiliki = (N.apotek || []).filter(function (x) { return x.kat === 'obat' && !x.sembuhSemua && (ks.obat && ks.obat[x.id] > 0); });
    if (obatDimiliki.length && daftarSakit.length) {
      html += '<h3 class="subjudul">Kotak P3K (Berikan obat yang dimiliki)</h3><ul class="daftar pesanan">' +
        obatDimiliki.map(function (ob) {
          return '<li class="kartu-pesanan"><div><b>' + esc(ob.nama) + ' (stok ' + ks.obat[ob.id] + ')</b><small>' + esc(ob.ket) + '</small></div>' +
            '<div class="chip-baris">' + daftarSakit.map(function (t) {
              return '<button type="button" class="chip-tombol pilih" data-aksi="pakaiObat:' + ob.id + '|' + t.id + '">Obati ' + esc(t.nama.split(' (')[0]) + '</button>';
            }).join('') + '</div></li>';
        }).join('') + '</ul>';
    }
    var listA = (N.apotek || []).filter(function (x) { return x.kat === tab; });
    html += '<h3 class="subjudul">Katalog Apotek K-24 (Harga Pasar Asli)</h3><ul class="daftar belanja">' +
      listA.map(function (it) {
        var tombolDokter = it.sembuhSemua && daftarSakit.length ? daftarSakit.map(function (t) {
          return '<button type="button" class="chip-tombol pilih" data-aksi="beliApotek:' + it.id + '|bank|' + t.id + '">Berobat: ' + esc(t.nama.split(' (')[0]) + '</button>';
        }).join('') : '<button type="button" class="chip-tombol pilih" data-aksi="beliApotek:' + it.id + '|dompet|pemain">Dompet</button><button type="button" class="chip-tombol" data-aksi="beliApotek:' + it.id + '|bank|pemain">Rekening</button>';
        return '<li><span><b>' + esc(it.nama) + '</b><small>' + esc(it.kemasan) + ' · ' + esc(it.ket) + '</small><small class="harga">' + rupiah(it.harga) + '</small></span>' +
          '<span class="tombol-tegak">' + tombolDokter + '</span></li>';
      }).join('') + '</ul><p class="catatan">Semua karakter (kamu, pasangan, anak, dan karyawan) bisa jatuh sakit karena kecapekan atau kehujanan. Sedia obat P3K atau kontrasepsi di sini.</p>';
    return html;
  }

  function layarKeluarga() {
    var kel = S.keluarga || [], thn = KAL.tgl(S.hari).y;
    var prPemain = (S.profil && S.profil.gender) || 'cewek';
    var defaultPasangan = prPemain === 'cowok' ? 'istri' : 'suami';
    var pBaru = app.kelPeran || defaultPasangan, gBaru = pBaru === 'istri' ? 'cewek' : pBaru === 'suami' ? 'cowok' : (app.kelGender || 'cewek');
    var daftarPas = DIRI.daftarPasangan ? DIRI.daftarPasangan(S) : (DIRI.pasanganAktif(S) ? [DIRI.pasanganAktif(S)] : []);
    var pas = daftarPas[0] || null, rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var ks = S.kesehatan || { kondom: 0, kondomGerigi: 0, kbSampai: -1 }, kbAktif = (ks.kbSampai || -1) >= S.hari;
    var noHp = (S.hp && S.hp.nomor) || '081256000088';
    var html = kepalaApp('Keluarga', kel.length + ' anggota keluarga · Tahun ' + thn) + pesanApp();
    /* 1. Biaya Rumah Tangga & Pasar Pokok */
    html += '<div class="saldo-besar" style="background:#155e57"><small>Biaya rumah tangga & stok dapur (makan sekeluarga di rumah gratis)</small><b>' +
      (rtAktif ? 'Aktif s/d ' + namaTanggal(S.rumahTangga.aktifSampai) : 'Belum diberi uang belanja / stok dapur habis') + '</b></div>' +
      '<div class="chip-baris" style="margin-bottom:8px">' + (N.rumahTangga || []).map(function (pk) {
        return '<button type="button" class="chip-tombol' + (rtAktif && S.rumahTangga.paket === pk.id ? ' pilih' : '') + '" data-aksi="rumahTangga:' + pk.id + '">' + esc(pk.nama.split(' (')[0]) + ' ' + rupiah(DIRI.hargaRumahTangga(S, pk.id)) + '</button>';
      }).join('') +
      '<button type="button" class="chip-tombol pilih" data-app="pasarpokok">🛒 Belanja di Pasar Pokok (Sendiri / Suruh Pasangan)</button></div>' +
      '<p class="catatan" style="margin-top:0;margin-bottom:10px">Jika sudah memberi uang belanja rumah tangga atau belanja sembako di Pasar Pokok, makan di rumah/kos GRATIS untuk kamu & keluarga (pengeluaran diambil dari dompet/rekening, bukan uang laci kedai).</p>';

    /* 2. Momen Pasangan (HB Bar Pemain & HB Bar Tiap Pasangan, Poligami, Selingkuh & Jajan Nakal) */
    html += '<div class="saldo-besar" style="background:#c2185b"><small>Status Intim & Kesehatanmu · Kondom: ' + (ks.kondom || 0) + (ks.kondomGerigi ? ' (' + ks.kondomGerigi + ' bergerigi)' : '') + (kbAktif ? ' · KB Aktif' : '') + '</small>' +
      '<b>HB Kamu ' + Math.round(S.diri.hb || 0) + '% · Kesehatan ' + Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + '%' + (S.diri.rasaBersalah ? ' · Bersalah ' + Math.round(S.diri.rasaBersalah) + '%' : '') + (S.diri.hiv ? ' · ⚠️ HIV+' : '') + '</b>' + persenBar(S.diri.hb || 0) + '</div>';
    if (daftarPas.length) {
      daftarPas.forEach(function (ps, idxP) {
        var hIbu = ps.hamil || S.diri.hamil;
        var ketHamil = hIbu && hIbu.terdeteksi ? ' · 🤰 Hamil ' + Math.max(1, Math.floor((S.hari - hIbu.mulai) / 7)) + ' mgg (HPL ' + namaTanggal(hIbu.lahir) + ')' : '';
        var hbPs = Math.round(ps.hb == null ? 35 : ps.hb);
        html += '<div class="kartu-pesanan" style="margin-bottom:8px;padding:10px 12px;border-radius:12px;background:rgba(194,24,91,.09)">' +
          '<b>❤️ ' + esc(ps.nama) + ' (' + DIRI.labelPeran(S, ps) + (daftarPas.length > 1 ? ' #' + (idxP + 1) : '') + ')' + esc(ketHamil) + '</b>' +
          '<small>Bar HB ' + esc(ps.nama) + ': <b>' + hbPs + '%</b>' + (hbPs >= 65 ? ' (Ingin HB malam ini pukul 20.00+ di rumah!)' : '') + ' · Bahagia: <b>' + Math.round(ps.bahagia || 90) + '%</b></small>' +
          '<div class="chip-baris" style="margin-top:6px">' +
          '<button type="button" class="chip-tombol pilih" data-aksi="hbTarget:1|' + ps.id + '">HB Pakai Kondom (' + (ks.kondom || 0) + ')</button>' +
          '<button type="button" class="chip-tombol" data-aksi="hbTarget:0|' + ps.id + '">HB Tanpa Kondom' + (kbAktif ? ' (KB Aktif)' : ' (65% Hamil)') + '</button>' +
          '<button type="button" class="chip-tombol" data-app="apotek">Beli Kondom Bergerigi / KB</button></div></div>';
      });
    }
    /* Opsi Jajan Nakal (PSK) dengan penjelasan risiko HIV & rasa bersalah */
    var kesSkrg = Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan);
    html += '<div class="kartu-pesanan" style="margin-bottom:10px;padding:10px 12px;border-radius:12px;background:rgba(217,68,58,.09)">' +
      '<b>🔥 Hiburan Malam / Jajan Nakal (PSK · Rp300.000)</b>' +
      '<small>Meningkatkan bahagia penuh & HB bar turun ke 0%, namun menimbulkan <b>Rasa Bersalah</b>, <b>Kesehatan menurun</b>, risiko ketahuan pasangan (<b>Cerai</b>), serta risiko <b>HIV</b> (' +
      (kesSkrg < 50 ? 'kesehatanmu di bawah 50%: risiko HIV <b>89% tanpa kondom</b> & <b>30% pakai kondom</b>!' : 'saat sehat: risiko HIV <b>1,3% pakai kondom</b> & <b>18% tanpa kondom</b>') + ').</small>' +
      '<div class="chip-baris" style="margin-top:6px">' +
      '<button type="button" class="chip-tombol" data-aksi="hbTarget:1|psk">Jajan Pakai Kondom (' + (ks.kondom || 0) + ')</button>' +
      '<button type="button" class="chip-tombol" data-aksi="hbTarget:0|psk">Jajan Tanpa Kondom (Risiko Tinggi)</button></div></div>';

    /* 3. Daftar Anggota Keluarga (Bisa Edit Tanggal Lahir, Telepon/WA, Kuliah/Kerja/Sekolah, Selingkuh Adik Ipar, Cerai) */
    if (kel.length) {
      html += '<h3 class="subjudul">Anggota Keluarga (Bisa Edit Tanggal Lahir, WA & Telepon)</h3><ul class="daftar pesanan">' + kel.map(function (kl) {
        var usia = KAL.usia(S.hari, kl.tglLahir), isPas = DIRI.adalahPasangan(kl), isIpar = DIRI.adalahIpar && DIRI.adalahIpar(kl), peranLabel = DIRI.labelPeran(S, kl);
        var jk = kl.gender === 'cewek' ? 'Cewek' : 'Cowok', diKedai = kl.lokasi === 'kedai';
        var teksHamil = kl.hamil && kl.hamil.terdeteksi ? ' · 🤰 Hamil ' + Math.max(1, Math.floor((S.hari - kl.hamil.mulai) / 7)) + ' minggu' : '';
        var teksSakit = kl.sakit ? ' · 🤒 Sakit: ' + kl.sakit.nama : '';
        var bisaKontak = isPas || isIpar || usia >= 10;
        var tombolKontak = bisaKontak
          ? '<button type="button" class="chip-tombol pilih" data-aksi="kirimPesanKel:' + kl.id + '|wa">💬 Kirim WA (2 MB)</button>' +
            '<button type="button" class="chip-tombol" data-aksi="kirimPesanKel:' + kl.id + '|telepon">📞 Telepon (Pulsa Rp1.500)</button>'
          : '<small>Anak usia &lt; 10 thn belum pegang HP sendiri</small>';
        var detail = '', gelarDisp = '';
        if (isPas) {
          gelarDisp = kl.gelar ? ' (' + kl.gelar + ')' : '';
          var kuliahTeks = kl.kuliah ? 'Sedang kuliah ' + kl.kuliah.nama + ' (Smt ' + kl.kuliah.semester + '/' + kl.kuliah.totalSemester + ')' : (kl.lulus && kl.lulus.length ? 'Lulusan: ' + kl.gelar : 'Belum kuliah');
          var kerjaTeks = kl.kerja ? 'Bekerja: ' + kl.kerja.nama + ' (' + rupiah(kl.kerja.gaji) + '/bln)' : 'Di rumah (atas izinmu bisa bekerja di luar)';
          detail += '<small>' + esc(kuliahTeks) + ' · ' + esc(kerjaTeks) + ' · HB Pasangan: <b>' + Math.round(kl.hb == null ? 35 : kl.hb) + '%</b></small>' +
            '<div class="chip-baris" style="margin-top:6px">' + tombolKontak +
            '<button type="button" class="chip-tombol' + (!diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-rumah">Di rumah</button>' +
            '<button type="button" class="chip-tombol' + (diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-kedai">Bantu di kedai</button>' +
            '<button type="button" class="chip-tombol" data-aksi="ceraiPas:' + kl.id + '">💔 Cerai</button></div>' +
            '<small style="margin-top:6px"><b>Kuliah Pasangan (UKT / semester asli):</b></small><div class="chip-baris">' +
            (N.pendidikanPasangan || []).map(function (jr) {
              var sdh = (kl.lulus || []).indexOf(jr.id) >= 0;
              var jln = kl.kuliah && kl.kuliah.id === jr.id;
              return '<button type="button" class="chip-tombol' + (jln || sdh ? ' pilih' : '') + '" data-aksi="kuliahPas:' + kl.id + '|' + jr.id + '">' + esc(jr.nama.split(' / ')[0]) + (sdh ? ' ✓' : jln ? ' (Smt ' + kl.kuliah.semester + ')' : ' ' + rupiahPendek(jr.ukt)) + '</button>';
            }).join('') + '</div>' +
            '<small style="margin-top:6px"><b>Izin Kerja di Luar (' + (prPemain === 'cowok' ? 'kehendak suami' : 'kehendak istri') + '):</b></small><div class="chip-baris">' +
            '<button type="button" class="chip-tombol' + (!kl.kerja ? ' pilih' : '') + '" data-aksi="kerjaPas:' + kl.id + '|berhenti">Di rumah saja</button>' +
            (N.kerjaPasangan || []).map(function (kj) {
              var aktifK = kl.kerja && kl.kerja.id === kj.id;
              var punyaGelar = !kj.butuh || (kl.lulus || []).indexOf(kj.butuh) >= 0;
              return '<button type="button" class="chip-tombol' + (aktifK ? ' pilih' : '') + '"' + (punyaGelar ? '' : ' style="opacity:.55"') + ' data-aksi="kerjaPas:' + kl.id + '|' + kj.id + '">' + esc(kj.nama.split(' (')[0]) + ' (' + rupiahPendek(kj.gaji) + ')</button>';
            }).join('') + '</div>';
        } else if (isIpar) {
          detail += '<small>Saudara dari pasangan (' + peranLabel + ') · tinggal membantu di rumah</small>' +
            '<div class="chip-baris" style="margin-top:6px">' + tombolKontak +
            '<button type="button" class="chip-tombol' + (!diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-rumah">Di rumah</button>' +
            '<button type="button" class="chip-tombol' + (diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-kedai">Bantu di kedai</button>' +
            '<button type="button" class="chip-tombol" data-aksi="hbTarget:1|ipar:' + kl.id + '">Selingkuh HB (Kondom)</button>' +
            '<button type="button" class="chip-tombol" data-aksi="hbTarget:0|ipar:' + kl.id + '">Selingkuh HB (Tanpa Kondom · 65% Hamil)</button>' +
            (kl.gender === 'cewek' ? '<button type="button" class="chip-tombol" data-aksi="ubahStatusKel:' + kl.id + '-istri">Nikahi jadi Istri (Poligami)</button>' : '') + '</div>';
        } else {
          /* Anak: tumbuh sesuai usia, PAUD/TK usia 4+, SD usia 6+, SMP 12+, SMA 15+ */
          var tahap = usia < 1 ? 'Bayi baru lahir (0 thn)' : usia < 4 ? 'Balita (' + usia + ' thn · PAUD/TK mulai 4 thn)' : usia < 6 ? 'Usia PAUD / TK (4–5 thn)' : usia < 12 ? 'Usia SD (6–11 thn)' : usia < 15 ? 'Usia SMP (12–14 thn)' : usia < 18 ? 'Usia SMA/SMK (15–17 thn)' : 'Usia Kuliah (18+ thn)';
          var sekCocok = (N.sekolahAnak || []).filter(function (sk) { return usia >= sk.minUsia && usia <= sk.maksUsia + 2; });
          detail += '<small>' + esc(tahap) + (kl.sekolah ? ' · Sekolah: <b>' + esc(kl.sekolah.nama) + '</b>' + (kl.sekolah.spp ? ' (SPP ' + rupiah(kl.sekolah.spp) + '/bln)' : ' (SPP Gratis)') : '') + '</small>' +
            '<div class="chip-baris" style="margin-top:6px">' + tombolKontak +
            '<button type="button" class="chip-tombol' + (!diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-rumah">Di rumah</button>' +
            '<button type="button" class="chip-tombol' + (diKedai ? ' pilih' : '') + '" data-aksi="lokasiKel:' + kl.id + '-kedai">Bantu di kedai</button>' +
            '<button type="button" class="chip-tombol' + (kl.jajanHari === S.hari ? ' pilih' : '') + '" data-aksi="biayaKel:' + kl.id + '-jajan">Jajan Rp20rb' + (kl.jajanHari === S.hari ? ' ✓' : '') + '</button></div>' +
            (sekCocok.length ? '<small style="margin-top:6px"><b>Daftarkan Sekolah (harga asli):</b></small><div class="chip-baris">' + sekCocok.map(function (sk) {
              var aktifS = kl.sekolah && kl.sekolah.id === sk.id;
              return '<button type="button" class="chip-tombol' + (aktifS ? ' pilih' : '') + '" data-aksi="sekolahAnak:' + kl.id + '|' + sk.id + '">' + esc(sk.nama) + (aktifS ? ' ✓' : ' (' + rupiahPendek(sk.pangkal) + ')') + '</button>';
            }).join('') + '</div>' : '');
        }
        var fotoKel = isPas ? 'img/char-istri.jpg' : isIpar ? 'img/char-adik-ipar.jpg' : 'img/char-anak.jpg';
        return '<li class="kartu-pesanan"><div style="display:flex;align-items:center;gap:10px"><img src="' + fotoKel + '" alt="' + esc(kl.nama) + '" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(194,24,91,.35)"><div><b>' + esc(kl.nama) + esc(gelarDisp) + ' (' + peranLabel + ' · ' + jk + ' · ' + usia + ' thn)' + esc(teksHamil) + esc(teksSakit) + '</b>' +
          '<small>TTL: ' + esc(kl.tglLahir) + ' · Usia di tahun ' + thn + ': <b>' + usia + ' tahun</b> · Kebahagiaan: <b>' + Math.round(kl.bahagia || 85) + '%</b></small></div></div>' +
          '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input id="in-ttl-' + esc(kl.id) + '" class="input-teks" type="date" style="margin:0;flex:1" value="' + esc(kl.tglLahir) + '">' +
          '<button type="button" class="chip-tombol pilih" data-aksi="simpanTtlKel:' + kl.id + '">Simpan TTL</button></div>' +
          detail +
          '<div class="chip-baris" style="margin-top:6px">' + (kl.sakit ? '<button type="button" class="chip-tombol pilih" data-app="apotek">Obati di Apotek</button>' : '') +
          '<button type="button" class="chip-tombol" data-aksi="hapusKel:' + kl.id + '">Hapus</button></div></li>';
      }).join('') + '</ul>';
    }

    /* 4. Riwayat Pesan WA & Telepon Keluarga (Nomor 081256000088) */
    var logPesan = S.pesanKeluarga || [];
    if (logPesan.length) {
      html += '<h3 class="subjudul">Pesan & Telepon Keluarga (' + esc(noHp) + ')</h3><ul class="daftar pesanan">' +
        logPesan.slice(0, 6).map(function (pm) {
          return '<li class="kartu-pesanan"><div><b>' + esc(pm.dari) + ' · <span style="color:#155e57">' + esc(pm.jenis) + '</span></b>' +
            '<small>' + namaTanggal(pm.hari) + ' pukul ' + jam(pm.jam || 600) + '</small>' +
            '<small style="display:block;margin-top:3px">' + esc(pm.teks) + '</small></div></li>';
        }).join('') + '</ul>';
    }

    /* 5. Form Tambah Karakter (Istri [Poligami] / Suami / Anak / Adik Ipar / Kakak Ipar) */
    html += '<h3 class="subjudul">Tambah Karakter Keluarga (Istri / Suami / Anak / Adik & Kakak Ipar)</h3>' +
      '<div class="kartu-pesanan" style="padding:12px;border-radius:14px">' +
      '<div class="atur-baris" style="display:block;padding:4px 0"><div><b>Nama karakter</b></div><input id="in-kel-nama" class="input-teks" type="text" maxlength="22" placeholder="Contoh: Rina / Sari / Budi / Rafa" value="' + esc(app.kelNama || '') + '"></div>' +
      '<div class="atur-baris" style="padding:6px 0"><div><b>Status</b></div><div class="chip-baris" style="margin:0">' +
      '<button type="button" class="chip-tombol' + (pBaru === 'istri' ? ' pilih' : '') + '" data-aksi="kelPeran:istri">Istri (Poligami)</button>' +
      '<button type="button" class="chip-tombol' + (pBaru === 'suami' ? ' pilih' : '') + '" data-aksi="kelPeran:suami">Suami</button>' +
      '<button type="button" class="chip-tombol' + (pBaru === 'anak' ? ' pilih' : '') + '" data-aksi="kelPeran:anak">Anak</button>' +
      '<button type="button" class="chip-tombol' + (pBaru === 'adik_ipar' ? ' pilih' : '') + '" data-aksi="kelPeran:adik_ipar">Adik Ipar</button>' +
      '<button type="button" class="chip-tombol' + (pBaru === 'kakak_ipar' ? ' pilih' : '') + '" data-aksi="kelPeran:kakak_ipar">Kakak Ipar</button></div></div>' +
      (pBaru !== 'istri' && pBaru !== 'suami' ? '<div class="atur-baris" style="padding:6px 0"><div><b>Jenis kelamin</b></div><div class="chip-baris" style="margin:0"><button type="button" class="chip-tombol' + (gBaru === 'cewek' ? ' pilih' : '') + '" data-aksi="kelGender:cewek">Cewek</button><button type="button" class="chip-tombol' + (gBaru === 'cowok' ? ' pilih' : '') + '" data-aksi="kelGender:cowok">Cowok</button></div></div>' : '') +
      '<div class="atur-baris" style="display:block;padding:4px 0"><div><b>Tanggal lahir (TTL)</b><span>Usia dihitung presisi sesuai tahun game (' + thn + ')</span></div><input id="in-kel-ttl" class="input-teks" type="date" value="' + esc(app.kelTtl || (pBaru === 'anak' ? '2020-06-15' : pBaru === 'adik_ipar' ? '2003-04-12' : '1999-08-20')) + '"></div>' +
      '<div style="margin-top:10px"><button type="button" class="aksi kecil" data-aksi="tambahKeluarga:1">Tambah ke keluarga</button></div></div>';
    return html;
  }

  function layarPasarPokok() {
    var pas = DIRI.pasanganAktif(S), rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var html = kepalaApp('Pasar Pokok Rumah Tangga', pas ? 'Bisa belanja sendiri atau suruh ' + pas.nama : 'Belanja kebutuhan dapur rumah') + pesanApp() +
      '<div class="saldo-besar" style="background:#d87a16"><small>Stok Dapur & Kebutuhan Pokok Rumah Tangga</small><b>' +
      (rtAktif ? 'Cukup untuk makan gratis s/d ' + namaTanggal(S.rumahTangga.aktifSampai) : 'Stok dapur kosong · Belanja sekarang') + '</b></div>' +
      '<p class="catatan" style="margin-top:4px;margin-bottom:8px">Pembayaran hanya memakai <b>Dompet Pribadi</b> atau <b>Rekening Bank</b> (tidak pernah memakai uang laci kedai). Jika menyuruh pasangan belanja, kamu tidak kehilangan waktu kerja!</p>' +
      '<ul class="daftar belanja">' + (N.pasarPokok || []).map(function (it) {
        return '<li><span><b>' + esc(it.nama) + '</b><small>Stok makan rumah <b>+' + it.hariDapur + ' hari</b> · ' + esc(it.ket) + '</small><small class="harga">' + rupiah(it.harga) + '</small></span>' +
          '<span class="tombol-tegak">' +
          (pas ? '<button type="button" class="chip-tombol pilih" data-aksi="pasarPokok:' + it.id + '|pasangan">Suruh ' + esc(pas.nama) + ' (0m)</button>' : '') +
          '<button type="button" class="chip-tombol' + (pas ? '' : ' pilih') + '" data-aksi="pasarPokok:' + it.id + '|sendiri">Belanja Sendiri (30m)</button>' +
          '</span></li>';
      }).join('') + '</ul>';
    return html;
  }

  function layarRentalPs() {
    var rpObj = S.rentalPs || { aktif: false, unit: [], kaset: {}, tarif: {}, hariIni: {} };
    var cfg = N.rentalPsConfig || { lokasi: [], tarifDefault: {} };
    var html = kepalaApp('Usaha Rental PlayStation', rpObj.aktif ? (DIRI.infoLokasiRental(rpObj.lokasi).nama + ' · ' + rpObj.unit.length + ' bilik PS') : 'Buka usaha Rental PS baru') + pesanApp();
    if (!rpObj.aktif) {
      html += '<div class="saldo-besar" style="background:#1565c0"><small>Peluang Bisnis Baru</small><b>Buka Usaha Rental PlayStation</b></div>' +
        '<p class="catatan">Kelola bilik konsol PS1–PS5, TV LED, koleksi kaset game populer, penjaga rental, kulkas minuman dingin & mie instan, hingga token listrik PLN prabayar. Bisa ditempatkan di <b>Lantai 2 Ruko 2 Lantai</b> (hemat sewa!) atau <b>Sewa Ruko Terpisah</b> di lokasi lain.</p>' +
        (!S.usaha.ruko2Lantai ? '<div class="chip-baris" style="margin-bottom:10px"><button type="button" class="chip-tombol pilih" data-aksi="sewaRuko2Lantai:1">Upgrade Kedai ke Ruko 2 Lantai Dulu (Lt.1 Kedai + Lt.2 Rental PS)</button></div>' : '<div class="isbat" style="margin-top:0;margin-bottom:8px">Ruko 2 Lantai sudah aktif! Kamu bisa langsung membuka Rental PS di Lantai 2 tanpa bayar sewa gedung bulanan terpisah.</div>') +
        '<h3 class="subjudul">Pilih Lokasi Ruko Rental PS</h3><ul class="daftar pesanan">' +
        (cfg.lokasi || []).map(function (lok) {
          var totalAwal = lok.biayaBuka + (lok.butuhRuko2Lantai ? 0 : lok.sewaBulan);
          return '<li class="kartu-pesanan"><div><b>' + esc(lok.nama) + '</b><small>' + esc(lok.ket) + '</small>' +
            '<small>Biaya setup & interior bilik: <b>' + rupiah(lok.biayaBuka) + '</b> · Sewa bulanan: <b>' + (lok.butuhRuko2Lantai ? 'Rp0 (ikut Ruko 2 Lantai)' : rupiah(lok.sewaBulan) + '/bln') + '</b></small></div>' +
            '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="bukaRentalPs:' + lok.id + '">Buka di Sini (' + rupiah(totalAwal) + ')</button></div></li>';
        }).join('') + '</ul>';
      return html;
    }
    var lokAktif = DIRI.infoLokasiRental(rpObj.lokasi);
    var hi = rpObj.hariIni || { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 };
    var kasetRentalCount = Object.keys(rpObj.kaset || {}).length;
    html += '<div class="saldo-besar" style="background:#1565c0"><small>' + esc(lokAktif.nama) + ' · Token PLN ' + rpObj.kwh.toFixed(1).replace('.', ',') + ' kWh</small>' +
      '<b>Hari ini: ' + (hi.pengunjung || 0) + ' pelanggan · ' + rupiah((hi.omzetSewa || 0) + (hi.omzetMinum || 0)) + '</b></div>' +
      (rpObj.padam ? '<p class="racik-pesan salah">Listrik Rental PS padam karena token habis! Isi token PLN di bawah agar pelanggan bisa main lagi.</p>' : '') +
      '<ul class="daftar angka">' +
      baris('Jumlah bilik aktif', rpObj.unit.length + ' / 16 bilik (TV LED + Konsol)') +
      baris('Stok TV LED cadangan', (rpObj.tvStok || 0) + ' unit') +
      baris('Koleksi kaset game di rental', kasetRentalCount + ' judul (+koleksi pribadimu)') +
      baris('Karyawan penjaga rental', (rpObj.penjaga || 0) + ' orang (' + rupiah((rpObj.penjaga || 0) * (cfg.gajiPenjaga || 1350000)) + '/bln)') +
      baris('Kulkas minuman dingin & mie instan', (rpObj.stokMinum || 0) + ' porsi (jual ' + rupiah(cfg.hargaJualMinum || 7000) + '/porsi)') +
      baris('Omzet sewa PS hari ini', rupiah(hi.omzetSewa || 0)) +
      baris('Omzet minuman & mie hari ini', rupiah(hi.omzetMinum || 0)) +
      baris('Total omzet sepanjang waktu', rupiah((rpObj.total && rpObj.total.omzet) || 0)) + '</ul>';

    /* Tambah Bilik Konsol + TV */
    html += '<h3 class="subjudul">Tambah Bilik Rental (Paket Konsol + TV LED 32" + 2 Stik)</h3><div class="chip-baris">' +
      '<button type="button" class="chip-tombol" data-aksi="beliTvRentalPs:1">Beli TV LED 32" Cadangan (' + rupiah(cfg.hargaTvUnit || 1950000) + ')</button>' +
      ['ps2', 'ps3', 'ps4', 'ps5', 'ps5disc'].map(function (kid) {
        var km = DIRI.konsolModel(kid); if (!km) return '';
        var hKon = km.harga || Math.round((km.min + km.maks) / 2);
        var hPaket = hKon + ((rpObj.tvStok || 0) > 0 ? 0 : (cfg.hargaTvUnit || 1950000));
        return '<button type="button" class="chip-tombol pilih" data-aksi="tambahUnitRentalPs:beli|' + kid + '">+ Bilik ' + esc(kid.toUpperCase()) + ' (' + rupiahPendek(hPaket) + ')</button>';
      }).join('') + '</div>';
    var milikPribadi = Object.keys((S.game && S.game.konsol) || {});
    if (milikPribadi.length) {
      html += '<div class="chip-baris" style="margin-top:4px">' + milikPribadi.map(function (kid) {
        return '<button type="button" class="chip-tombol" data-aksi="tambahUnitRentalPs:pindah|' + kid + '">Pindahkan ' + esc(kid.toUpperCase()) + ' Pribadimu ke Rental</button>';
      }).join('') + '</div>';
    }

    /* Daftar Bilik & Atur Tarif per Jam */
    if (rpObj.unit.length) {
      html += '<h3 class="subjudul">Daftar Bilik Rental (' + rpObj.unit.length + ' unit)</h3><ul class="daftar angka">' +
        rpObj.unit.map(function (u) {
          return baris(esc(u.nama), 'Tarif ' + rupiah(rpObj.tarif[u.konsolId] || 10000) + '/jam');
        }).join('') + '</ul>';
    }
    html += '<h3 class="subjudul">Atur Tarif Sewa per Jam</h3>' +
      ['ps2', 'ps3', 'ps4', 'ps5'].map(function (kid) {
        var trf = rpObj.tarif[kid] || cfg.tarifDefault[kid] || 10000;
        return '<div class="atur-baris"><div><b>Tarif ' + esc(kid.toUpperCase()) + ' per jam</b><span>Pasaran wajar ' + rupiah(cfg.tarifDefault[kid] || 10000) + '/jam</span></div>' +
          '<div class="langkah"><button type="button" data-aksi="tarifRentalPs:' + kid + '|-1">−</button><output>' + rupiah(trf) + '</output><button type="button" data-aksi="tarifRentalPs:' + kid + '|1">+</button></div></div>';
      }).join('');

    /* Karyawan Penjaga, Jualan Minuman, Kaset Game, dan Token Listrik */
    html += '<h3 class="subjudul">Karyawan Penjaga & Kulkas Minuman/Mie Rental</h3>' +
      '<div class="atur-baris"><div><b>Penjaga Rental PS</b><span>Gaji ' + rupiah(cfg.gajiPenjaga || 1350000) + '/bln · menjaga rental tetap buka walau kamu sedang narik ojol</span></div>' +
      '<div class="langkah"><button type="button" data-aksi="penjagaRentalPs:-1">−</button><output>' + (rpObj.penjaga || 0) + ' org</output><button type="button" data-aksi="penjagaRentalPs:1">+</button></div></div>' +
      '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="stokMinumRentalPs:1">Kulakan 60 Minuman Dingin & Mie Instan (' + rupiah(cfg.modalStokMinum || 250000) + ' → Jual ' + rupiah((cfg.isiStokMinum || 60) * (cfg.hargaJualMinum || 7000)) + ')</button></div>' +
      '<h3 class="subjudul">Token Listrik PLN Rental PS (Sisa ' + rpObj.kwh.toFixed(1).replace('.', ',') + ' kWh)</h3><div class="chip-baris">' +
      [20000, 50000, 100000, 200000].map(function (nom) {
        var tk = USAHA.token(S, nom);
        return '<button type="button" class="chip-tombol" data-aksi="tokenRentalPs:' + nom + '">Token ' + (nom / 1000) + 'rb (+' + tk.kwh.toFixed(1).replace('.', ',') + ' kWh)</button>';
      }).join('') + '</div>' +
      '<h3 class="subjudul">Tambah Kaset Game Favorit Rental (Meningkatkan Keramaian)</h3><ul class="daftar belanja">' +
      (N.gameKonsol || []).filter(function (g) { return ['g_ps2_gtasa', 'g_ps2_we10', 'g_ps2_downhill', 'g_ps3_gtav', 'g_ps3_pes18', 'g_ps4_fc25', 'g_ps4_gowr', 'g_ps5_fc26', 'g_ps5_spider2', 'g_ps5_wukong'].indexOf(g.id) >= 0; }).map(function (g) {
        var sdh = !!(rpObj.kaset && rpObj.kaset[g.id]);
        return '<li><span><b>[' + esc(g.konsol.toUpperCase()) + '] ' + esc(g.nama) + '</b><small>' + esc(g.ket) + '</small><small class="harga">' + rupiah(g.harga) + '</small></span>' +
          '<span>' + (sdh ? '<small><b>Tersedia ✓</b></small>' : '<button type="button" class="chip-tombol pilih" data-aksi="beliKasetRentalPs:' + g.id + '">Beli</button>') + '</span></li>';
      }).join('') + '</ul>';
    return html;
  }

  function layarRental() {
    var daftar = DIRI.daftarBisaDisewa(S);
    var aktif = daftar.filter(function (x) { return x.aktif; });
    var totalHarian = aktif.reduce(function (t, x) { return t + x.tarif; }, 0);
    var html = kepalaApp('Sewa & Rental', aktif.length + ' barang disewakan · ' + rupiah(totalHarian) + '/hari') + pesanApp() +
      '<div class="saldo-besar" style="background:#6d4c41"><small>Pendapatan sewa pasif per hari (cair tiap pagi ke rekening)</small><b>' + rupiah(totalHarian) + ' / hari</b></div>';
    if (!daftar.length) {
      return html + '<p class="catatan">Kamu belum punya barang yang bisa disewakan. Barang yang bisa disewakan: konsol PlayStation (PS1–PS5), motor, mobil, tablet, laptop, kamera DJI Osmo Action, proyektor mini, dan sepeda lipat Polygon.</p>';
    }
    html += '<ul class="daftar belanja">' + daftar.map(function (x) {
      return '<li><span><b>[' + esc(x.kat) + '] ' + esc(x.nama) + '</b><small>' + esc(x.ket) + '</small><small class="harga">Tarif sewa ' + rupiah(x.tarif) + ' / hari</small></span>' +
        '<span><button type="button" class="chip-tombol' + (x.aktif ? ' pilih' : '') + '" data-aksi="sewaBarang:' + x.kunci + '">' + (x.aktif ? 'Disewakan ✓' : 'Sewakan') + '</button></span></li>';
    }).join('') + '</ul>' +
      '<p class="catatan">Barang yang disewakan menghasilkan uang sewa harian yang otomatis masuk ke rekening bank setiap pagi dan tercatat di Kabar Pagi serta Closing Harian.</p>';
    return html;
  }

  var NAMA_BAYAR = { tunai: function () { return 'Bayar tunai dari laci'; }, dompet: function () { return 'Bayar dari dompet pribadi'; }, qris: function () { return 'Bayar pakai saldo QRIS'; },
    transfer: function () { var bf = UANG.biayaTransfer(S); return 'Transfer dari ' + UANG.bankIni(S).nama + (bf ? ' (+' + rupiah(bf) + ')' : ' (gratis)'); },
    kk: function () { return 'Kartu kredit ' + UANG.bankIni(S).nama + (S.kk && S.kk.status === 'aktif' ? ' (sisa ' + rupiahPendek(UANG.sisaLimitKk(S)) + ')' : ' (belum aktif)'); },
    tempo: function () { return 'Pesan, bayar 14 hari lagi'; } };
  function layarBelanja() {
    var tab = app.tab, T = STOK.TEMPAT[tab], kr = app.keranjang[tab];
    var html = kepalaApp('Belanja', 'Harga minggu ini') +
      '<div class="chip-baris">' + ['pasar', 'grosir', 'online', 'sales'].map(function (t) { return '<button type="button" class="chip-tombol' + (t === tab ? ' pilih' : '') + '" data-aksi="tab:' + t + '">' + STOK.namaTempat(S, t) + '</button>'; }).join('') + '</div>' +
      '<p class="catatan">' + esc(T.ket) + '</p>' + pesanApp();
    var tagihan = S.tagihanSales.map(function (t, i) { return { t: t, i: i }; }).filter(function (x) { return !x.t.dibayar; });
    var listTagihan = tab === 'sales' && tagihan.length ? '<h3 class="subjudul">Tagihan sales</h3><ul class="daftar angka">' + tagihan.map(function (x) {
      return '<li><span>' + rupiah(x.t.jml) + '<small>Jatuh tempo ' + namaTanggal(x.t.jatuhTempo) + (x.t.denda ? ' · denda ' + rupiah(x.t.denda) : '') + '</small></span><span><button type="button" class="chip-tombol" data-aksi="bayarSales:' + x.i + '">Bayar</button></span></li>';
    }).join('') + '</ul>' : '';
    if (tab === 'sales' && !STOK.salesMampir(S)) return html + listTagihan;
    if (tab === 'pasar' && STOK.sore(S)) html += '<p class="racik-pesan">Pasar sudah tutup. Belanja ke swalayan, harganya sedikit lebih mahal.</p>';
    var dijual = STOK.bahanDijual ? STOK.bahanDijual(S) : null;
    var daftarBelanja = MN.URUT_BARANG.filter(function (id) { return MN.BARANG[id].ada.indexOf(tab) >= 0 && (!dijual || dijual[id]); });
    html += daftarBelanja.length ? '<ul class="daftar belanja">' + daftarBelanja.map(function (id) {
      var b = MN.BARANG[id], h = STOK.harga(S, id, tab), ubah = b.tetap ? 0 : STOK.perubahan(S, id), n = kr[id] || 0;
      return '<li><span><b>' + esc(b.nama) + '</b><small>' + esc(b.merek) + ' · ' + esc(b.kemasan) + ' · stok ' + STOK.sisaTeks(S, id) + '</small>' +
        '<small class="harga">' + rupiah(h) + (ubah ? ' <em class="' + (ubah > 0 ? 'naik' : 'turun') + '">' + (ubah > 0 ? '▲ ' : '▼ ') + Math.abs(ubah) + '%</em>' : '') + '</small></span>' +
        '<span class="langkah"><button type="button" data-aksi="kurang:' + id + '" aria-label="Kurangi">−</button><output>' + n + '</output><button type="button" data-aksi="tambah:' + id + '" aria-label="Tambah">+</button></span></li>';
    }).join('') + '</ul>' : '<p class="catatan">Tidak ada bahan untuk menu yang sedang dijual di tempat ini. Aktifkan menu terlebih dahulu di Racik & atur menu.</p>';
    html += '<p class="catatan" style="margin-top:8px">Store hanya menampilkan bahan dari menu makanan & minuman yang sedang dijual di kedai agar tidak bingung menyetok.</p>';
    var hit = STOK.hitung(S, tab, kr);
    if (hit.sub) html += '<ul class="daftar angka" style="margin-top:10px">' + baris('Belanjaan', rupiah(hit.sub)) + (hit.ongkos ? baris(esc(T.ongkosNama), rupiah(hit.ongkos)) : '') + baris('<b>Total</b>', '<b>' + rupiah(hit.total) + '</b>', 'total') + '</ul>' +
      (T.minimal && hit.sub < T.minimal ? '<p class="racik-pesan salah">Minimal pesanan ' + rupiah(T.minimal) + ', kurang ' + rupiah(T.minimal - hit.sub) + '.</p>' : '') +
      '<div class="bayar-baris">' + (tab === 'pasar' ? tombolPasar() : T.bayar.map(function (c) { return '<button type="button" class="aksi kecil" data-aksi="beli:' + c + '">' + esc(NAMA_BAYAR[c]()) + '</button>'; }).join('')) + '</div>';
    else if (S.belanjaTerakhir[tab]) html += '<div style="margin-top:12px"><button type="button" class="tombol-lain gelap" data-aksi="ulangi:1">Isi seperti belanja terakhir</button></div>';
    return html + listTagihan;
  }
  function tombolPasar() {
    var k = stafBelanja(), buka = S.fase === 'buka' && S.diri.posisi === 'kedai' && !kepalaMasuk();
    return '<button type="button" class="aksi kecil" data-aksi="beli:tunai-sendiri">' + (buka ? 'Pergi sendiri (Laci)' : 'Bayar dari Laci') + '</button>' +
      '<button type="button" class="aksi kecil" data-aksi="beli:dompet-sendiri">Bayar dari Dompet pribadi</button>' +
      '<button type="button" class="aksi kecil" data-aksi="beli:transfer-sendiri">Bayar dari Rekening ' + esc(UANG.bankIni(S).nama) + '</button>' +
      (k ? '<button type="button" class="aksi kecil" data-aksi="beli:tunai-karyawan">Suruh ' + esc(k.nama) + ' (ojek ' + rupiah(STOK.TEMPAT.pasar.ongkos) + ')</button>' : '');
  }
  function layarStok() {
    var dijual = STOK.bahanDijual ? STOK.bahanDijual(S) : {};
    var urut = MN.URUT_BARANG.filter(function (id) { return dijual[id] || (S.stok[id] && S.stok[id].jml > 0); });
    var html = kepalaApp('Stok', 'Bahan & kemasan untuk menu yang dijual') + '<ul class="daftar angka">' + urut.map(function (id) {
      var b = MN.BARANG[id], tipis = STOK.menipis(S).indexOf(id) >= 0;
      return baris(esc(b.nama) + (dijual[id] ? '' : '<small>(menu sedang dimatikan)</small>') + '<small>Nilai ' + rupiah(S.stok[id].nilai) + '</small>', STOK.sisaTeks(S, id), tipis ? 'rugi' : '');
    }).join('') + '</ul>';
    if (S.uhtBuka.sisa > 0) html += '<p class="catatan">Susu UHT terbuka ' + Math.round(S.uhtBuka.sisa) + ' ml, basi ' + Math.max(0, STOK.UHT_TAHAN_HARI - (S.hari - S.uhtBuka.hari)) + ' hari lagi.</p>';
    html += '<p class="catatan">Es batu di cool box mencair sedikit demi sedikit dan habis semalam, jadi es dibeli tiap hari. Biji kopi paling enak dipakai dalam sebulan setelah dibuka.</p>';
    if (S.kiriman.length) html += '<h3 class="subjudul">Dalam perjalanan</h3><ul class="daftar angka">' + S.kiriman.map(function (k) {
      return baris(esc(k.dari) + '<small>' + k.barang.map(function (x) { return x.n + '× ' + esc(MN.BARANG[x.id].nama); }).join(', ') + '</small>', (k.tiba.hari === S.hari ? 'hari ini ' : namaTanggal(k.tiba.hari) + ' ') + jam(k.tiba.menit));
    }).join('') + '</ul>';
    return html;
  }
  function gelapSebentar() { var el = $('gelap'); el.hidden = false; el.classList.remove('jalan'); void el.offsetWidth; el.classList.add('jalan'); setTimeout(function () { el.hidden = true; }, 1300); }
  function stafBelanja() {
    var ada = S.staf.filter(function (k) { return !k.cabang && STAF.hadir(S, k) && ANTAR.waktu(S) >= (k.sibukSampai || 0); });
    return ada.filter(function (k) { return STAF.punyaTugas(k, 'belanja'); })[0] || ada[0] || null;
  }
  function belanja(cara) {
    var pc = String(cara).split('-'), bayar = pc[0], siapa = pc[1] || 'sendiri', tab = app.tab, k = null;
    if (tab === 'pasar' && siapa === 'karyawan') { k = stafBelanja(); if (!k) return hasilAksi('Tidak ada karyawan yang sedang masuk dan tidak sibuk.'); }
    var nama = STOK.namaTempat(S, tab), r = STOK.beli(S, tab, app.keranjang[tab], bayar, siapa);
    if (r === true || (r && r.ok)) {
      app.keranjang[tab] = {};
      if (r.karyawan) { k.sibukSampai = ANTAR.waktu(S) + r.waktu; hasilAksi(true, k.nama + ' berangkat ke ' + nama.toLowerCase() + ' naik ojek, kembali sekitar pukul ' + jam(S.menit + r.waktu) + '. Belanjaan masuk stok.'); }
      else if (r.waktu) {
        var tutupSebentar = S.fase === 'buka' && S.diri.posisi === 'kedai' && !kepalaMasuk();
        if (tutupSebentar) { if (R) tutupRacik(); JUAL.tutup(); S.tutupSementara = true; }
        lompatWaktu(r.waktu); S.tutupSementara = false;
        hasilAksi(true, 'Pulang dari ' + nama.toLowerCase() + ' pukul ' + jam(S.menit) + '.' + (tutupSebentar ? ' Kedai tadi tutup sebentar.' : '') + ' Belanjaan sudah masuk stok.');
        perbaruiAksi();
      }
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
    else if (nama === 'beliKontainer') hasilAksi(USAHA.beliKontainer(S), 'Kontainer sekarang milik sendiri! Bulan depan hanya bayar sewa lahan.');
    else if (nama === 'beliLahan') hasilAksi(USAHA.beliLahan(S), 'Lahan SHM resmi milikmu! Bebas biaya sewa selamanya.');
    else if (nama === 'sewaRuko') hasilAksi(USAHA.sewaRukoLangsung(S), 'Pindah ke ruko berhasil! Kedai kini punya 40 kursi ber-AC.');
    else if (nama === 'sewaRuko2Lantai') hasilAksi(USAHA.sewaRuko2Lantai(S), 'Ruko 2 Lantai berhasil disewa! Lantai 1 untuk Kedai Kopi & Cemilan, Lantai 2 siap untuk Usaha Rental PS.');
    else if (nama === 'stopSewa') hasilAksi(USAHA.aturBerhentiSewa(S, nilai === '1'), nilai === '1' ? 'Sewa kontainer dihentikan. Kamu bisa fokus narik ojol tanpa biaya sewa.' : 'Sewa diaktifkan kembali. Kedai siap dibuka.');
    else if (nama === 'promo') { S.promoAktif = !S.promoAktif; hasilAksi(true, S.promoAktif ? 'Promo aktif! Pelanggan kedai, pesan-antar, dan order ojek meningkat 50%–80%.' : 'Promo dimatikan.'); }
    else if (nama === 'autoMakan') { S.autoMakanMinum = !S.autoMakanMinum; hasilAksi(true, S.autoMakanMinum ? 'Auto Makan & Minum aktif! Otomatis mencari makanan/minuman paling hemat atau gratis saat lapar/haus.' : 'Auto Makan & Minum dimatikan.'); }
    else if (nama === 'alat') hasilAksi(USAHA.beliAlat(S, nilai), USAHA.ALAT[nilai].nama + ' terpasang.');
    else if (nama === 'cabang') hasilAksi(USAHA.bukaCabang(S, nilai), 'Booth cabang dipasang, buka 2 hari lagi. Tempatkan karyawan di sana.');
    else if (nama === 'meter') { app.meter = nilai; app.pesan = ''; }
    else if (nama === 'tokoKat') { app.tokoKat = nilai; app.pesan = ''; }
    else if (nama === 'barang') { var pb2 = nilai.split('-'); hasilAksi(DIRI.beliBarang(S, pb2[0], 'bank', pb2[1]), DIRI.barang(pb2[0]).nama + ' sudah sampai di ' + DIRI.tempat(S) + '.'); }
    else if (nama === 'barangDompet') { var pb3 = nilai.split('-'); hasilAksi(DIRI.beliBarang(S, pb3[0], 'dompet', pb3[1]), DIRI.barang(pb3[0]).nama + ' dibeli dari dompet pribadi dan sampai di ' + DIRI.tempat(S) + '.'); }
    else if (nama === 'barangKk') { var pb4 = nilai.split('-'); hasilAksi(DIRI.beliBarang(S, pb4[0], 'kk', pb4[1]), DIRI.barang(pb4[0]).nama + ' dibeli pakai kartu kredit dan sampai di ' + DIRI.tempat(S) + '.'); }
    else if (nama === 'jualBarang') { var rjb = DIRI.jualBarang(S, nilai); hasilAksi(rjb && rjb.ok ? true : rjb, rjb && rjb.ok ? rjb.nama + ' terjual ' + rupiah(rjb.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'gameTab') { app.gameTab = nilai; app.pesan = ''; }
    else if (nama === 'gameKonsolFilter') { app.gameKonsolFilter = nilai; app.pesan = ''; }
    else if (nama === 'beliKonsol') hasilAksi(DIRI.beliKonsol(S, nilai, 'bank'), 'Konsol PlayStation sudah dipasang di ' + DIRI.tempat(S) + '.');
    else if (nama === 'beliKonsolKk') hasilAksi(DIRI.beliKonsol(S, nilai, 'kk'), 'Konsol PlayStation dibeli pakai kartu kredit dan dipasang di ' + DIRI.tempat(S) + '.');
    else if (nama === 'jualKonsol') { var rjk = DIRI.jualKonsol(S, nilai); hasilAksi(rjk && rjk.ok ? true : rjk, rjk && rjk.ok ? rjk.nama + ' terjual ' + rupiah(rjk.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'beliGame') hasilAksi(DIRI.beliGame(S, nilai, 'bank'), DIRI.gameModel(nilai).nama + ' masuk koleksi game.');
    else if (nama === 'beliGameKk') hasilAksi(DIRI.beliGame(S, nilai, 'kk'), DIRI.gameModel(nilai).nama + ' dibeli pakai kartu kredit.');
    else if (nama === 'jualGame') { var rjg = DIRI.jualGame(S, nilai); hasilAksi(rjg && rjg.ok ? true : rjg, rjg && rjg.ok ? rjg.nama + ' terjual ' + rupiah(rjg.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'token' && (app.meter || 'kos') === 'kos') { var rk = DIRI.beliTokenKos(S, v); hasilAksi(rk && rk.ok ? true : rk, rk && rk.ok ? 'Token kos masuk ' + rk.kwh.toFixed(1).replace('.', ',') + ' kWh, dibayar ' + rupiah(rk.bayar) + '.' : ''); }
    else if (nama === 'token') { var rt = USAHA.beliToken(S, v); hasilAksi(rt && rt.ok ? true : rt, rt && rt.ok ? 'Token kedai masuk ' + rt.kwh.toFixed(1).replace('.', ',') + ' kWh, dibayar ' + rupiah(rt.bayar) + '.' : ''); }
    else if (nama === 'racikan') { var pr = nilai.split('-'); racikan[pr[0]] = pr[0] === 'panas' ? pr[1] === 'true' : pr[1] || null; racikan.harga = 0; app.pesan = ''; }
    else if (nama === 'racikanHarga') { racikan.harga = Math.max(2000, racikan.harga + v * 500); }
    else if (nama === 'simpanMenu') { hasilAksi(USAHA.simpanMenu(S, racikan, racikan.harga), USAHA.namaUsul(racikan) + ' masuk menu. Pembeli mulai memesannya.'); DUNIA.terapkanHarga(S); }
    else if (nama === 'hapusMenu') { USAHA.hapusMenu(S, nilai); DUNIA.terapkanHarga(S); simpan(); app.pesan = ''; }
    else if (nama === 'toggleMenu') {
      var skrg = USAHA.menuDijual(S, nilai);
      USAHA.aturMenuAktif(S, nilai, !skrg);
      var mn = MN.MENU.filter(function (x) { return x.id === nilai; })[0];
      hasilAksi(true, (mn ? mn.nama : nilai) + (!skrg ? ' sekarang dijual di kedai.' : ' dinonaktifkan sementara dari menu.'));
    }
    else if (nama === 'tutupSementara') {
      S.tutupSementara = nilai === '1';
      if (S.tutupSementara && R) tutupRacik();
      hasilAksi(true, S.tutupSementara ? 'Kedai ditutup sementara. Sekarang bisa setor/tarik tunai ke ATM.' : 'Kedai dibuka kembali.');
    }
    else if (nama === 'kerjaDi') { STAF.cari(S, app.stafId).cabang = nilai === 'utama' ? null : nilai; simpan(); }
    else if (nama === 'maps') hasilAksi(DUNIA.daftarMaps(S), 'Pendaftaran dikirim. Verifikasi sekitar 5 hari.');
    else if (nama === 'foto') hasilAksi(DUNIA.tambahFoto(S), 'Foto kedai ditambahkan.');
    else if (nama === 'balas') hasilAksi(DUNIA.balas(S, +nilai), 'Ulasan sudah dibalas.');
    else if (nama === 'ulasanPalsu') hasilAksi(DUNIA.beliUlasan(S), '10 ulasan bintang 5 masuk. Semoga tidak ketahuan.');
    else if (nama === 'post') {
      var ckPost = DIRI.pakaiKuota(S, nilai === 'tiktok' ? 0.045 : 0.018); /* TikTok video 45 MB, IG/Threads 18 MB */
      if (ckPost !== true) { hasilAksi(ckPost); }
      else {
        var rpo = DUNIA.posting(S, nilai);
        if (rpo && rpo.ok) { if (S.fase === 'buka') lompatWaktu(15); else S.menit += 15; hasilAksi(true, 'Postingan dilihat sekitar ' + rpo.jangkauan.toLocaleString('id-ID') + ' orang, +' + rpo.baru + ' pengikut.' + (rpo.viral ? ' VIRAL! Siap-siap antrean panjang 3 hari.' : '')); }
        else hasilAksi(rpo);
      }
    }
    else if (nama === 'siaran') {
      var ckWa = DIRI.pakaiKuota(S, 0.005);
      if (ckWa !== true) hasilAksi(ckWa);
      else hasilAksi(DUNIA.siaran(S), 'Siaran terkirim. Pesanan WhatsApp hari ini lebih ramai.');
    }
    else if (nama === 'iklan') hasilAksi(DUNIA.iklan(S), 'Iklan berjalan 7 hari.');
    else if (nama === 'endorse') hasilAksi(DUNIA.endorse(S, +nilai), 'Selebgram sudah posting tentang kedai.');
    else if (nama === 'cekUang') hasilAksi(DUNIA.beliCekUang(S), 'Alat cek uang terpasang di laci.');
    else if (nama === 'lowongan') hasilAksi(STAF.pasangLowongan(S, nilai), 'Lowongan dipasang. Pelamar datang mulai besok pagi.');
    else if (nama === 'terimaPelamar') hasilAksi(STAF.terima(S, nilai), 'Karyawan baru mulai kerja besok.');
    else if (nama === 'tolakPelamar') { STAF.tolak(S, nilai); simpan(); app.pesan = ''; }
    else if (nama === 'staf') { app.stafId = nilai; app.nama = 'staf'; app.pesan = ''; app.yakinPecat = false; }
    else if (nama === 'tugas') { STAF.aturTugas(S, app.stafId, nilai); simpan(); }
    else if (nama === 'sif') { STAF.aturSif(S, app.stafId, nilai); simpan(); }
    else if (nama === 'jamMasuk') { STAF.aturJam(S, app.stafId, 'masuk', v); simpan(); app.pesan = ''; }
    else if (nama === 'jamPulang') { STAF.aturJam(S, app.stafId, 'pulang', v); simpan(); app.pesan = ''; }
    else if (nama === 'libur') { STAF.aturLibur(S, app.stafId, nilai); simpan(); }
    else if (nama === 'tunj') { var pt = nilai.split('-'); STAF.aturTunjangan(S, app.stafId, pt[0], +pt[1]); simpan(); app.pesan = ''; }
    else if (nama === 'targetBulan') { STAF.aturTarget(S, +nilai); hasilAksi(true, +nilai ? 'Target bulanan dipasang ' + (+nilai).toLocaleString('id-ID') + ' gelas (Achieve = 2× gaji pokok).' : 'Target bulanan dinonaktifkan.'); }
    else if (nama === 'gaji') hasilAksi(STAF.aturGaji(S, app.stafId, v), v === 0 ? 'Gaji diatur Rp1.200.000 (standar UMKM).' : v > 0 ? 'Gaji/upah dinaikkan.' : 'Gaji/upah diturunkan.');
    else if (nama === 'kursus') hasilAksi(STAF.kursus(S, app.stafId, nilai === '1' ? 'racik' : nilai), 'Pelatihan selesai! Bintang keahlian karyawan naik.');
    else if (nama === 'pecat') {
      if (!app.yakinPecat) app.yakinPecat = true;
      else { var rp2 = STAF.pecat(S, app.stafId); app.yakinPecat = false; if (rp2 && rp2.ok) { app.nama = 'karyawan'; hasilAksi(true, 'Karyawan diberhentikan, pesangon dan sisa gaji ' + rupiah(rp2.total) + '.'); } else hasilAksi(rp2); }
    }
    else if (nama === 'motorTab') { app.motorTab = nilai; app.pesan = ''; }
    else if (nama === 'kelasMotor') { app.kelasMotor = nilai; app.pesan = ''; }
    else if (nama === 'kelasMobil') { app.kelasMobil = nilai; app.pesan = ''; }
    else if (nama === 'tunaiMobil') { hasilAksi(MOBIL.beliTunai(S, nilai, 'bank'), 'Mobil sudah di garasi. Bensin terisi seperempat.'); if (S.mobil) app.motorTab = 'garasi'; }
    else if (nama === 'tunaiMobilKk') { hasilAksi(MOBIL.beliTunai(S, nilai, 'kk'), 'Mobil dibeli pakai kartu kredit dan sudah di garasi.'); if (S.mobil) app.motorTab = 'garasi'; }
    else if (nama === 'kreditMobilPilih') { app.kreditMobil = nilai; app.pesan = ''; app.nama = 'kreditMobil'; }
    else if (nama === 'kreditMobilDp') { app.kreditMobilDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobilTenor') { app.kreditMobilTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobil') { hasilAksi(MOBIL.beliKredit(S, app.kreditMobil, app.kreditMobilDp || 0.2, app.kreditMobilTenor || 60, nilai === 'kk' ? 'kk' : 'bank'), 'Kredit disetujui. Mobil sudah di garasi.'); if (S.mobil) { app.nama = 'motor'; app.motorTab = 'garasi'; } }
    else if (nama === 'bensinMobil') { var pm2 = nilai.split('-'), bm = MOBIL.isiBensin(S, pm2[0], pm2[1]); hasilAksi(bm && bm.ok ? true : bm, bm && bm.ok ? 'Isi ' + bm.liter.toLocaleString('id-ID') + ' liter, ' + rupiah(bm.biaya) + '.' : ''); }
    else if (nama === 'servisMobil') hasilAksi(MOBIL.servis(S), 'Mobil sudah diservis.');
    else if (nama === 'pajakMobil') hasilAksi(MOBIL.bayarPajak(S), 'Pajak mobil lunas setahun.');
    else if (nama === 'jualMotor') { var jm = MOTOR.jual(S); hasilAksi(jm && jm.ok ? true : jm, jm && jm.ok ? 'Motor terjual ' + rupiah(jm.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'pilihMotor') { hasilAksi(MOTOR.pilihAktif(S, +nilai), 'Motor aktif diganti ke ' + (S.motor ? S.motor.nama : '') + '.'); }
    else if (nama === 'daftarCar') { hasilAksi(MOBIL.daftarCar(S), 'Akun GoCar / GrabCar aktif! Bisa langsung ambil order.'); }
    else if (nama === 'orderCar') {
      var oc = MOBIL.ambilOrderCar(S);
      if (oc && oc.ok) { lompatWaktu(oc.menit); hasilAksi(true, oc.teks); } else hasilAksi(oc);
    }
    else if (nama === 'travel') {
      var trv = MOBIL.jalanTravel(S, nilai);
      if (trv && trv.ok) { lompatWaktu(trv.menit); hasilAksi(true, trv.teks); } else hasilAksi(trv);
    }
    else if (nama === 'angkutan') {
      var ang = MOBIL.jalanAngkutan(S, nilai);
      if (ang && ang.ok) { lompatWaktu(ang.menit); hasilAksi(true, ang.teks); } else hasilAksi(ang);
    }
    else if (nama === 'lunasMotor') { var lm = MOTOR.lunasi(S); hasilAksi(lm && lm.ok ? true : lm, lm && lm.ok ? 'Kredit motor lunas, dibayar ' + rupiah(lm.jml) + '.' : ''); }
    else if (nama === 'jualMobil') { var jb = MOBIL.jual(S); hasilAksi(jb && jb.ok ? true : jb, jb && jb.ok ? 'Mobil terjual ' + rupiah(jb.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'lunasMobil') { var lb = MOBIL.lunasi(S); hasilAksi(lb && lb.ok ? true : lb, lb && lb.ok ? 'Kredit mobil lunas, dibayar ' + rupiah(lb.jml) + '.' : ''); }
    else if (nama === 'daftarDriver') hasilAksi(OJEK.daftar(S, nilai), 'Pendaftaran dikirim. Akun aktif dalam ' + N.ojol.verifikasiHari + ' hari.');
    else if (nama === 'putusDriver') hasilAksi(OJEK.putus(S, nilai), 'Kerjasama mitra driver ' + OJEK.platform(nilai).nama + ' resmi diputus.');
    else if (nama === 'onlineDriver') return mulaiNarik(nilai);
    else if (nama === 'offlineDriver') return berhentiNarik();
    else if (nama === 'tarikDriver') { var td = OJEK.tarikSaldo(S, nilai === '1' ? 'bank' : nilai); hasilAksi(td && td.ok ? true : td, td && td.ok ? rupiah(td.jml) + ' ' + (td.ket || 'berhasil ditarik') + '.' : ''); }
    else if (nama === 'tipeRumah') { app.tipeRumah = nilai; app.dpRumah = null; app.pesan = ''; }
    else if (nama === 'rumahTunai') { app.rumahTunai = nilai === '1'; app.pesan = ''; }
    else if (nama === 'dpRumah') { app.dpRumah = +nilai; app.pesan = ''; }
    else if (nama === 'tenorRumah') { app.tenorRumah = +nilai; app.pesan = ''; }
    else if (nama === 'beliRumah') { var tp = app.tipeRumah || 'subsidi', br = PROPERTI.ajukan(S, tp, app.dpRumah || (tp === 'subsidi' ? N.properti.subsidi.dp : N.properti.komersial.dp[0]), app.tenorRumah || 20, !!app.rumahTunai && tp !== 'subsidi');
      hasilAksi(br && br.ok ? true : br, br && br.ok ? 'Disetujui! Akad dan serah terima kunci ' + namaTanggal(br.kunci) + '.' : ''); }
    else if (nama === 'pindahRumah') return pindahRumah('rumah');
    else if (nama === 'jualRumah') {
      if (!app.yakinJualRumah) { app.yakinJualRumah = true; app.pesan = ''; }
      else { app.yakinJualRumah = false; var jr = PROPERTI.jualRumah(S); hasilAksi(jr && jr.ok ? true : jr, jr && jr.ok ? 'Rumah terjual. Bersih ' + rupiah(jr.bersih) + ' masuk rekening.' + (jr.pindah ? ' Kamu kembali tinggal di kos.' : '') : ''); }
    }
    else if (nama === 'beliTanah') { var bt = PROPERTI.beliTanah(S, v); hasilAksi(bt && bt.ok ? true : bt, bt && bt.ok ? 'Tanah ' + v + ' m² sudah atas namamu. Total ' + rupiah(bt.total) + '.' : ''); }
    else if (nama === 'jualTanah') { var jt = PROPERTI.jualTanah(S, v); hasilAksi(jt && jt.ok ? true : jt, jt && jt.ok ? 'Tanah terjual, bersih ' + rupiah(jt.bersih) + '.' : ''); }
    else if (nama === 'tunai') { hasilAksi(MOTOR.beliTunai(S, nilai, 'bank'), 'Motor sudah di garasi. Bensin diisi sedikit dari dealer.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'tunaiKk') { hasilAksi(MOTOR.beliTunai(S, nilai, 'kk'), 'Motor dibeli pakai kartu kredit dan sudah di garasi.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'kreditPilih') { app.kreditMotor = nilai; app.pesan = ''; app.nama = 'kredit'; }
    else if (nama === 'kreditDp') { app.kreditDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditTenor') { app.kreditTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kredit') { hasilAksi(MOTOR.beliKredit(S, app.kreditMotor, app.kreditDp || 0.1, app.kreditTenor || 35, nilai === 'kk' ? 'kk' : 'bank'), 'Kredit disetujui. Motor sudah di garasi.'); if (S.motor) { app.nama = 'motor'; app.motorTab = 'garasi'; } }
    else if (nama === 'bekas') { hasilAksi(MOTOR.beliBekas(S, +nilai, 'bank'), 'Motor bekas sudah di garasi.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'bekasKk') { hasilAksi(MOTOR.beliBekas(S, +nilai, 'kk'), 'Motor bekas dibeli pakai kartu kredit dan sudah di garasi.'); if (S.motor) app.motorTab = 'garasi'; }
    else if (nama === 'beliMakan' || nama === 'minumAir' || nama === 'ngopi' || nama === 'ngopiSusu' || nama === 'makanRumah') {
      var bm2 = nilai.split('-'), rmk = nama === 'makanRumah' ? DIRI.makanDiRumah(S) : nama === 'minumAir' ? DIRI.makan(S, 'air') : nama === 'ngopi' ? DIRI.makan(S, 'kopi') : nama === 'ngopiSusu' ? DIRI.makan(S, 'kopisusu') : DIRI.beli(S, bm2[0], bm2[1]);
      if (rmk && rmk.ok) { if (rmk.menit) lompatWaktu(rmk.menit); hasilAksi(true, rmk.teks); } else hasilAksi(rmk);
    }
    else if (nama === 'bbmPilih') { app.bbmPilih = nilai; app.pesan = ''; }
    else if (nama === 'bensin') { var pb = nilai.split('-'), rb = MOTOR.isiBensin(S, pb[0], pb[1]); hasilAksi(rb && rb.ok ? true : rb, rb && rb.ok ? 'Isi ' + N.bbm.nama[rb.jenis] + ' ' + rb.liter.toFixed(1).replace('.', ',') + ' liter, ' + rupiah(rb.biaya) + '.' + (rb.ngelitik ? ' Mesin mulai ngelitik karena bensin di bawah anjuran.' : '') : ''); }
    else if (nama === 'oli') hasilAksi(MOTOR.rawat(S, 'oli'), 'Oli sudah diganti.');
    else if (nama === 'servis') hasilAksi(MOTOR.rawat(S, 'servis'), 'Motor sudah diservis.');
    else if (nama === 'aks') hasilAksi(MOTOR.beliAks(S, nilai), 'Perlengkapan sudah terpasang.');
    else if (nama === 'pajakMotor') hasilAksi(MOTOR.bayarPajak(S), 'Pajak motor lunas setahun.');
    else if (nama === 'daftarOjol') hasilAksi(ANTAR.daftar(S, nilai), 'Pendaftaran dikirim. Verifikasi sekitar 3 hari.');
    else if (nama === 'putusOjol') hasilAksi(ANTAR.putus(S, nilai), 'Kerjasama mitra pesan-antar resmi diputus.');
    else if (nama === 'isiTabGaji') hasilAksi(UANG.isiTabunganGaji(S, v), 'Dana berhasil disisihkan ke Tabungan Gaji Karyawan.');
    else if (nama === 'tarikTabGaji') hasilAksi(UANG.tarikTabunganGaji(S, v === Infinity ? (S.bank.tabunganGaji || 0) : v), 'Dana ditarik dari Tabungan Gaji ke rekening utama.');
    else if (nama === 'bayarTunggakanGaji') {
      var rbtg = STAF.bayarTunggakanGaji(S);
      hasilAksi(rbtg && rbtg.ok ? true : rbtg, rbtg && rbtg.ok ? 'Tunggakan gaji karyawan sebesar ' + rupiah(rbtg.jml) + ' berhasil dilunasi!' : '');
    }
    else if (nama === 'markup') { var pm = nilai.split('-'); ANTAR.aturMarkup(S, pm[0], +pm[1]); simpan(); app.pesan = ''; }
    else if (nama === 'bayarSales') hasilAksi(STOK.bayarSales(S, +nilai), 'Tagihan sales lunas.');
    else if (nama === 'setor') hasilAksi(UANG.setor(S, v === Infinity ? UANG.laci(S) : v), 'Setor tunai dari laci berhasil.');
    else if (nama === 'tarik') hasilAksi(UANG.tarik(S, v, 'laci'), 'Tarik tunai berhasil, uang masuk laci.');
    else if (nama === 'tarikDompet') hasilAksi(UANG.tarik(S, v, 'dompet'), 'Tarik tunai berhasil, uang masuk dompet pribadi.');
    else if (nama === 'keDompet') hasilAksi(UANG.pindahKeDompet(S, v), 'Uang dipindahkan dari laci ke dompet pribadi.');
    else if (nama === 'keLaci') hasilAksi(UANG.pindahKeLaci(S, v === Infinity ? UANG.dompet(S) : v), 'Uang dimasukkan dari dompet ke laci kas.');
    else if (nama === 'tukar') hasilAksi(UANG.tukarReceh(S, v), 'Uang besar sudah ditukar ke uang kecil.');
    else if (nama === 'tarikMerchant') hasilAksi(UANG.tarikMerchant(S, nilai), 'Saldo sudah masuk rekening.');
    else if (nama === 'pasangQris') hasilAksi(UANG.pasangQris(S, nilai), 'Pendaftaran QRIS ' + UANG.qrisData(nilai).nama + ' dikirim. Aktif besok.');
    else if (nama === 'bayarPajak') hasilAksi(UANG.bayarPajak(S, v), 'Pajak sudah disetor.');
    else if (nama === 'nib') hasilAksi(UANG.daftarNib(S), 'NIB terbit.');
    else if (nama === 'kurPlafon') { app.kurPlafon = v; app.pesan = ''; }
    else if (nama === 'kurTenor') { app.kurTenor = v; app.pesan = ''; }
    else if (nama === 'ajukanKur') hasilAksi(UANG.ajukanKur(S, app.kurPlafon, app.kurTenor), 'Pengajuan KUR dikirim. Hasilnya keluar dalam ' + N.kur.hariProses + ' hari.');
    else if (nama === 'ajukanKk') hasilAksi(UANG.ajukanKk(S), 'Kartu kredit ' + UANG.bankIni(S).nama + ' disetujui dengan limit ' + rupiah(S.kk.limit) + '.');
    else if (nama === 'bayarKk') { var rkk = UANG.bayarKk(S, nilai); hasilAksi(rkk && rkk.ok ? true : rkk, rkk && rkk.ok ? 'Tagihan kartu kredit dibayar ' + rupiah(rkk.jml) + '.' : ''); }
    else if (nama === 'naikLimitKk') { var rnl = UANG.naikLimitKk(S); hasilAksi(rnl && rnl.ok ? true : rnl, rnl && rnl.ok ? 'Limit kartu kredit naik menjadi ' + rupiah(rnl.limit) + '.' : ''); }
    else if (nama === 'gadgetTab') { app.gadgetTab = nilai; app.pesan = ''; }
    else if (nama === 'merekGadget') { app.merekGadget = nilai; app.pesan = ''; }
    else if (nama === 'casHp') { var rcas = DIRI.toggleCasHp(S); hasilAksi(rcas, S.hp.cas ? 'Charger ' + DIRI.hpAktif(S).watt + 'W dicolokkan. Baterai sedang diisi.' : 'Charger dicabut.'); }
    else if (nama === 'beliPulsa') { var pp = nilai.split('-'); hasilAksi(DIRI.beliPulsa(S, +pp[0], pp[1]), 'Pulsa ' + rupiah(+pp[0]) + ' berhasil diisi.'); }
    else if (nama === 'beliKuota') { var pk = nilai.split('-'); hasilAksi(DIRI.beliKuota(S, pk[0], pk[1]), 'Paket kuota internet berhasil diaktifkan!'); }
    else if (nama === 'wifiRumah') { hasilAksi(DIRI.toggleWifiRumah(S), S.rumah.wifi ? 'WiFi Fiber berhasil dipasang di ' + DIRI.tempat(S) + '! Internet bebas kuota.' : 'Langganan WiFi dihentikan.'); }
    else if (nama === 'beliGadget') { var pg = nilai.split('-'); hasilAksi(DIRI.beliGadget(S, pg[0], pg[1]), DIRI.gadgetModel(pg[0]).nama + ' berhasil dibeli!'); }
    else if (nama === 'pakaiHp') { hasilAksi(DIRI.pakaiHp(S, nilai), 'HP utama diganti ke ' + DIRI.gadgetModel(nilai).nama + '.'); }
    else if (nama === 'jualGadget') { var rjg2 = DIRI.jualGadget(S, nilai); hasilAksi(rjg2 && rjg2.ok ? true : rjg2, rjg2 && rjg2.ok ? rjg2.nama + ' terjual ' + rupiah(rjg2.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'instalApk') { hasilAksi(DIRI.instalApk(S, nilai), DIRI.apkModel(nilai).nama + ' selesai diinstal di HP!'); }
    else if (nama === 'hapusApk') { hasilAksi(DIRI.hapusApk(S, nilai), 'Aplikasi dihapus untuk mengosongkan ruang penyimpanan.'); }
    else if (nama === 'mainApk') {
      var rma = DIRI.mainGameHp(S, nilai);
      if (rma && rma.ok) { if (rma.menit) lompatWaktu(rma.menit); hasilAksi(true, rma.teks); } else hasilAksi(rma);
    }
    else if (nama === 'kelGender') {
      if ($('in-kel-nama')) app.kelNama = $('in-kel-nama').value;
      if ($('in-kel-ttl')) app.kelTtl = $('in-kel-ttl').value;
      app.kelGender = nilai; app.pesan = '';
    }
    else if (nama === 'kelPeran') {
      if ($('in-kel-nama')) app.kelNama = $('in-kel-nama').value;
      if ($('in-kel-ttl')) app.kelTtl = $('in-kel-ttl').value;
      app.kelPeran = nilai;
      if (nilai === 'istri') app.kelGender = 'cewek';
      else if (nilai === 'suami') app.kelGender = 'cowok';
      app.pesan = '';
    }
    else if (nama === 'tambahKeluarga') {
      var prDef = (S.profil && S.profil.gender === 'cowok') ? 'istri' : 'suami';
      var prPilih = app.kelPeran || prDef;
      var knm = $('in-kel-nama') ? $('in-kel-nama').value.trim() : (app.kelNama || '');
      var kttl = $('in-kel-ttl') ? $('in-kel-ttl').value : (app.kelTtl || (prPilih === 'anak' ? '2019-06-15' : '1999-08-20'));
      var kgnd = prPilih === 'istri' ? 'cewek' : prPilih === 'suami' ? 'cowok' : (app.kelGender || 'cewek');
      var rtk = DIRI.tambahKeluarga(S, knm, kgnd, kttl, prPilih);
      if (rtk === true) { app.kelNama = ''; }
      hasilAksi(rtk, knm + ' ditambahkan ke daftar keluarga.');
    }
    else if (nama === 'ubahStatusKel') {
      var pus = nilai.split('-'), idU = pus.slice(0, -1).join('-'), stU = pus[pus.length - 1];
      hasilAksi(DIRI.ubahStatusKeluarga(S, idU, stU), 'Status anggota keluarga diubah menjadi ' + (stU === 'istri' ? 'Istri' : stU === 'suami' ? 'Suami' : 'Anak') + '.');
    }
    else if (nama === 'rumahTangga') {
      var rrt = DIRI.beriRumahTangga(S, nilai);
      hasilAksi(rrt && rrt.ok ? true : rrt, rrt && rrt.ok ? rrt.teks : '');
    }
    else if (nama === 'kuliahPas') {
      var pkp = nilai.split('|'), rkp = DIRI.daftarKuliahPasangan(S, pkp[0], pkp[1]);
      hasilAksi(rkp && rkp.ok ? true : rkp, rkp && rkp.ok ? rkp.teks : '');
    }
    else if (nama === 'kerjaPas') {
      var pkj = nilai.split('|'), rkj = DIRI.aturKerjaPasangan(S, pkj[0], pkj[1]);
      hasilAksi(rkj && rkj.ok ? true : rkj, rkj && rkj.ok ? rkj.teks : '');
    }
    else if (nama === 'sekolahAnak') {
      var psa = nilai.split('|'), rsa = DIRI.daftarSekolahAnak(S, psa[0], psa[1]);
      hasilAksi(rsa && rsa.ok ? true : rsa, rsa && rsa.ok ? rsa.teks : '');
    }
    else if (nama === 'lakukanHb') return mulaiHb(nilai === '1');
    else if (nama === 'hbTarget') {
      var pht = nilai.split('|');
      return mulaiHb(pht[0] === '1', pht[1]);
    }
    else if (nama === 'simpanTtlKel') {
      var elTtl = $('in-ttl-' + nilai), ttlVal = elTtl ? elTtl.value : '';
      var rttl = DIRI.ubahTtlKeluarga(S, nilai, ttlVal);
      hasilAksi(rttl && rttl.ok ? true : rttl, rttl && rttl.ok ? rttl.teks : '');
    }
    else if (nama === 'ceraiPas') {
      var rcr = DIRI.ceraiPasangan(S, nilai, 'Keputusan perceraian');
      hasilAksi(rcr && rcr.ok ? true : rcr, rcr && rcr.ok ? rcr.teks : '');
    }
    else if (nama === 'kirimPesanKel') {
      var pkpk = nilai.split('|'), rkpk = DIRI.kirimPesanKeluarga(S, pkpk[0], pkpk[1]);
      hasilAksi(rkpk && rkpk.ok ? true : rkpk, rkpk && rkpk.ok ? rkpk.teks : '');
    }
    else if (nama === 'pasarPokok') {
      var ppp = nilai.split('|'), rpp = DIRI.belanjaPasarPokok(S, ppp[0], ppp[1], 'dompet');
      if (rpp && rpp.ok) { if (rpp.menit) lompatWaktu(rpp.menit); hasilAksi(true, rpp.teks); }
      else hasilAksi(rpp);
    }
    else if (nama === 'bukaRentalPs') {
      hasilAksi(DIRI.bukaRentalPs(S, nilai), 'Usaha Rental PlayStation resmi dibuka! Tambahkan bilik konsol & TV untuk mulai menerima pelanggan.');
    }
    else if (nama === 'beliTvRentalPs') {
      hasilAksi(DIRI.beliTvRentalPs(S), '1 unit TV LED 32" ditambahkan ke stok Rental PS.');
    }
    else if (nama === 'tambahUnitRentalPs') {
      var ptur = nilai.split('|');
      hasilAksi(DIRI.tambahUnitRentalPs(S, ptur[0], ptur[1]), 'Bilik konsol PlayStation baru siap disewakan di Rental PS!');
    }
    else if (nama === 'tarifRentalPs') {
      var ptrf = nilai.split('|');
      DIRI.aturTarifRentalPs(S, ptrf[0], +ptrf[1]);
      simpan(); app.pesan = '';
    }
    else if (nama === 'beliKasetRentalPs') {
      hasilAksi(DIRI.beliKasetRentalPs(S, nilai), 'Kaset game baru ditambahkan ke rak Rental PS!');
    }
    else if (nama === 'penjagaRentalPs') {
      DIRI.aturPenjagaRentalPs(S, +nilai);
      simpan(); app.pesan = '';
    }
    else if (nama === 'stokMinumRentalPs') {
      hasilAksi(DIRI.stokMinumRentalPs(S), 'Kulkas minuman dingin & mie instan Rental PS penuh (+60 porsi)!');
    }
    else if (nama === 'tokenRentalPs') {
      var rtrp = DIRI.beliTokenRentalPs(S, +nilai);
      hasilAksi(rtrp && rtrp.ok ? true : rtrp, rtrp && rtrp.ok ? 'Token listrik Rental PS +' + rtrp.kwh.toFixed(1).replace('.', ',') + ' kWh berhasil diisi.' : '');
    }
    else if (nama === 'apotekTab') { app.apotekTab = nilai; app.pesan = ''; }
    else if (nama === 'beliApotek') {
      var pba = nilai.split('|'), rba = DIRI.beliApotek(S, pba[0], pba[1], pba[2]);
      hasilAksi(rba && rba.ok ? true : rba, rba && rba.ok ? rba.teks : '');
    }
    else if (nama === 'pakaiObat') {
      var ppo = nilai.split('|'), rpo2 = DIRI.pakaiObat(S, ppo[0], ppo[1]);
      hasilAksi(rpo2 && rpo2.ok ? true : rpo2, rpo2 && rpo2.ok ? rpo2.teks : '');
    }
    else if (nama === 'lokasiKel') {
      var plk = nilai.split('-'), idK = plk.slice(0, -1).join('-'), lokK = plk[plk.length - 1];
      hasilAksi(DIRI.aturLokasiKeluarga(S, idK, lokK), lokK === 'kedai' ? 'Sekarang ikut bantu kerja ringan di kedai!' : 'Kembali beristirahat di rumah.');
    }
    else if (nama === 'biayaKel') {
      var pbk = nilai.split('-'), idKb = pbk.slice(0, -1).join('-'), jnsB = pbk[pbk.length - 1];
      var rbk = DIRI.beriBiayaKeluarga(S, idKb, jnsB);
      hasilAksi(rbk && rbk.ok ? true : rbk, rbk && rbk.ok ? rbk.teks : '');
    }
    else if (nama === 'hapusKel') { DIRI.hapusKeluarga(S, nilai); hasilAksi(true, 'Karakter dihapus dari daftar keluarga.'); }
    else if (nama === 'sewaBarang') { DIRI.toggleSewaBarang(S, nilai); hasilAksi(true, S.sewaBarang[nilai] ? 'Barang mulai disewakan! Pendapatan sewa cair tiap pagi.' : 'Penyewaan barang dihentikan.'); }
    var gulir = $('lembar-isi').scrollTop; bukaHP(app.nama); $('lembar-isi').scrollTop = (nama === 'beli' || nama === 'tab') ? 0 : gulir;
  }

  /* ---------- sajikan: tap menu + panas/dingin (gambar kopi realistis, kecepatan tetap tampil) ---------- */
  var WARNA_MENU = { aren: '#a8774e', susu: '#c49a6c', hitam: '#3a2116', americano: '#2c1810', arabica: '#4e2c1a', espresso: '#26140c', mocha: '#6b3b25', cappuccino: '#b98b63' };
  function svgKopi(menu, panas) {
    var id = menu ? menu.id : 'aren';
    if (menu && menu.cemilan) {
      if (id === 'kentang') {
        return '<svg class="kopi-svg" viewBox="0 0 48 56" aria-hidden="true">' +
          '<rect x="13" y="10" width="4.5" height="22" rx="1.5" fill="#f7d060" transform="rotate(-10 15 21)"/>' +
          '<rect x="19" y="8" width="4.5" height="24" rx="1.5" fill="#f2c14e"/>' +
          '<rect x="25" y="9" width="4.5" height="23" rx="1.5" fill="#f7d060" transform="rotate(6 27 20)"/>' +
          '<rect x="30" y="12" width="4.5" height="20" rx="1.5" fill="#e6b23c" transform="rotate(12 32 22)"/>' +
          '<path d="M9 26h30l-4 24H13z" fill="#d9443a" stroke="#a82a22" stroke-width="1.2"/>' +
          '<circle cx="24" cy="38" r="5" fill="#f2a516"/></svg>';
      }
      if (id === 'tahu') {
        return '<svg class="kopi-svg" viewBox="0 0 48 56" aria-hidden="true">' +
          '<ellipse cx="24" cy="40" rx="18" ry="8" fill="#e8d5b5" stroke="#c8b08a" stroke-width="1.2"/>' +
          '<rect x="11" y="24" width="12" height="12" rx="2" fill="#f5e6c8" stroke="#d8b982" stroke-width="1"/>' +
          '<rect x="24" y="22" width="12" height="12" rx="2" fill="#f5e6c8" stroke="#d8b982" stroke-width="1"/>' +
          '<rect x="17" y="28" width="12" height="12" rx="2" fill="#f5e6c8" stroke="#d8b982" stroke-width="1"/>' +
          '<path d="M13 26q6 4 12-1t10 3" fill="none" stroke="#d9443a" stroke-width="3.2" stroke-linecap="round"/>' +
          '<circle cx="23" cy="33" r="3" fill="#c9302c"/></svg>';
      }
      return '<svg class="kopi-svg" viewBox="0 0 48 56" aria-hidden="true">' +
        '<ellipse cx="24" cy="41" rx="18" ry="8" fill="#e8d5b5" stroke="#c8b08a" stroke-width="1.2"/>' +
        '<path d="M11 35q6-8 13-3t13-2" fill="none" stroke="#e0a94c" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M13 39q6-6 12-2t11-1" fill="none" stroke="#c98e34" stroke-width="3.5" stroke-linecap="round"/>' +
        '<ellipse cx="30" cy="30" rx="7" ry="5" fill="#fff" stroke="#e0dcd0"/>' +
        '<circle cx="30" cy="30" r="2.8" fill="#f2a516"/>' +
        '<rect x="12" y="25" width="9" height="4.5" rx="2.2" fill="#c85a3a" transform="rotate(-18 16 27)"/>' +
        '<rect x="15" y="30" width="8" height="4" rx="2" fill="#b8482a" transform="rotate(10 19 32)"/></svg>';
    }
    if (panas) {
      return '<svg class="kopi-svg" viewBox="0 0 48 56" aria-hidden="true">' +
        '<path d="M18 8q-2-3 0-6M25 7q-2-3 0-6M31 8q-2-3 0-6" fill="none" stroke="#9aa3a6" stroke-width="1.8" stroke-linecap="round"/>' +
        '<rect x="9" y="13" width="30" height="5" rx="2.5" fill="#2b2420"/>' +
        '<rect x="12" y="10" width="24" height="4" rx="1.5" fill="#3d342f"/>' +
        '<path d="M11 18h26l-3.5 34h-19z" fill="#f3e6d0" stroke="#d5c1a0" stroke-width="1.2"/>' +
        '<path d="M12.2 28h23.6l-1.3 13H13.5z" fill="#1f8a80"/>' +
        '<circle cx="24" cy="34.5" r="4" fill="#f2a516"/>' +
        '<ellipse cx="24" cy="34.5" rx="2.2" ry="1.4" fill="#3a2116"/>' +
        '</svg>';
    }
    var c1 = id === 'cappuccino' ? '#f5efe6' : id === 'aren' || id === 'susu' ? '#5c341d' : '#4a2817';
    var c2 = id === 'aren' ? '#dfc39a' : id === 'susu' ? '#c89f72' : id === 'mocha' ? '#7a452b' : id === 'cappuccino' ? '#b98b63' : '#351c12';
    var c3 = id === 'aren' ? '#7a3f11' : id === 'mocha' ? '#4a2414' : id === 'susu' || id === 'cappuccino' ? '#e6cfb0' : '#24120a';
    var gid = 'g_' + id + '_' + Math.floor(Math.random() * 9999);
    return '<svg class="kopi-svg" viewBox="0 0 48 56" aria-hidden="true">' +
      '<line x1="28" y1="3" x2="25" y2="24" stroke="#1f8a80" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M10 18a14 10 0 0 1 28 0z" fill="rgba(220,240,250,.75)" stroke="#b3d1df" stroke-width="1.2"/>' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + c1 + '"/><stop offset="55%" stop-color="' + c2 + '"/><stop offset="100%" stop-color="' + c3 + '"/></linearGradient></defs>' +
      '<path d="M10 19h28l-3.8 33h-20.4z" fill="url(#' + gid + ')" stroke="#b9d6e2" stroke-width="1.3"/>' +
      '<rect x="16" y="22" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.42)" transform="rotate(-10 19 25)"/>' +
      '<rect x="26" y="24" width="6" height="6" rx="1.5" fill="rgba(255,255,255,.38)" transform="rotate(12 29 27)"/>' +
      '<rect x="21" y="30" width="5" height="5" rx="1.2" fill="rgba(255,255,255,.28)"/>' +
      '<path d="M13 21l2.2 28" stroke="rgba(255,255,255,.4)" stroke-width="2.2" stroke-linecap="round"/>' +
      '<rect x="8.5" y="17" width="31" height="3.2" rx="1.5" fill="#e8f4f8" stroke="#b3d1df" stroke-width=".9"/>' +
      '</svg>';
  }
  var animasi = false;
  function bukaRacik() {
    if (S.ojek.online && S.ojek.trip) return toast('Sedang mengantar order ojol.', 1600);
    if (S.tutupSementara) return toast('Kedai sedang tutup sementara. Buka kembali dulu.', 1800);
    var o = JUAL.depan(); if (!o || S.fase !== 'buka') return;
    if (R && R.o === o) return;
    if (R && R.pesanan) tutupRacik();
    if (R) R.o.keadaan = 'antre';
    R = { o: o }; o.keadaan = 'dilayani';
    $('app').classList.add('meracik'); $('racik').hidden = false;
    gambarRacik('');
  }
  function tutupRacik() {
    if (!R || animasi) return;
    if (R.o.keadaan === 'dilayani') R.o.keadaan = 'antre';
    R = null; $('app').classList.remove('meracik'); $('racik').hidden = true;
    perbaruiAksi();
  }
  function gambarRacik(pesan, salah) {
    var o = R.o, m = o.menu, isCemilan = !!m.cemilan, isPanas = o.panas != null ? !!o.panas : !!m.panas;
    var labelSuhu = isCemilan ? 'Hangat' : isPanas ? 'Panas' : 'Dingin (Es)';
    $('r-nama').textContent = R.pesanan ? judulPesanan(R.pesanan) : 'Pesan ' + m.nama + (isCemilan ? '' : ' · ' + labelSuhu);
    $('r-harga').textContent = R.pesanan ? 'Siapkan ' + R.item.qty + '× ' + m.nama + (isCemilan ? '' : ' (' + labelSuhu + ')') : rupiah(m.harga) + ' · ' + (o.bayar === 'qris' ? 'QRIS' : 'Tunai') + (o.gantiDari ? ' · ganti dari ' + o.gantiDari : '');
    $('r-gelas').className = 'gelas';
    $('r-gelas').innerHTML = svgKopi(m, isPanas);
    $('r-resep').innerHTML = '<span class="resep-item ok">' + esc(m.pendek) + '</span><span class="resep-item ok">' + labelSuhu + '</span>';
    var n = R.pesanan ? R.item.qty : 1;
    var menuTampil = MN.MENU.filter(function (x) { return USAHA.menuDijual(S, x.id) || x.id === m.id; });
    $('r-bahan').innerHTML = menuTampil.map(function (x) {
      var cocok = x.id === m.id;
      var suhuKartu = x.cemilan ? false : (cocok ? isPanas : false);
      var kurang = STOK.kurangResep(S, x, n, suhuKartu) || (!x.cemilan && x.resep.some(function (r) { return MN.BAHAN[r[0]].butuhAlat; }) && !USAHA.bisaEspresso(S) ? 'Mesin' : null);
      var badgeSuhu = x.cemilan ? 'Hangat' : (cocok ? (isPanas ? 'Otomatis Panas' : 'Otomatis Es') : 'Panas / Es');
      return '<button type="button" class="menu-kartu' + (kurang ? ' habis' : '') + (cocok ? ' dipesan' : '') + '" data-kartu="' + x.id + '" data-menu="' + x.id + '">' +
        svgKopi(x, suhuKartu) +
        '<b>' + esc(x.pendek) + '</b><small>' + (kurang ? 'Habis' : cocok ? badgeSuhu : rupiah(x.harga)) + '</small></button>';
    }).join('');
    var p = $('r-pesan'); p.textContent = pesan || ('Tap kartu ' + m.pendek + ' — suhu ' + labelSuhu + ' otomatis sesuai pesanan.');
    p.className = 'racik-pesan' + (salah ? ' salah' : '');
  }
  function tapMenu(kode) {
    if (!R || animasi) return;
    var bagian = String(kode).split(':'), id = bagian[0];
    var o = R.o, m = MN.MENU.filter(function (x) { return x.id === id; })[0];
    var butuhPanas = o.menu.cemilan ? false : (o.panas != null ? !!o.panas : !!o.menu.panas);
    if (!m || m.id !== o.menu.id) { if (SUARA) SUARA.bunyi('salah'); return gambarRacik('Bukan pesanannya. Yang dipesan ' + o.menu.nama + (o.menu.cemilan ? '' : ' (' + (butuhPanas ? 'Panas' : 'Dingin') + ')') + '.', true); }
    if (m.resep.some(function (r) { return MN.BAHAN[r[0]].butuhAlat; }) && !USAHA.bisaEspresso(S)) { if (SUARA) SUARA.bunyi('salah'); return gambarRacik('Mesin espresso mati. Cek token listrik.', true); }
    var n = R.pesanan ? R.item.qty : 1, kurang = STOK.kurangResep(S, m, n, butuhPanas);
    if (kurang) { if (SUARA) SUARA.bunyi('salah'); return gambarRacik(kurang + ' habis. Belanja dulu lewat HP.', true); }
    var x = STOK.pakaiResep(S, m, n, butuhPanas); S.hariIni.operasional = (S.hariIni.operasional || 0) + x.operasional;
    if (SUARA) SUARA.bunyi('racik');
    animasi = true; ADEGAN.racikSaja();
    var lama = 750 * DIRI.lambat(S);
    var kartu = $('r-bahan').querySelector('[data-kartu="' + id + '"]'); if (kartu) kartu.classList.add('jadi');
    $('r-pesan').textContent = DIRI.lambat(S) > 1 ? 'Badan capek, jadi lebih lambat...' : 'Menyiapkan ' + m.pendek + (o.menu.cemilan ? ' Hangat...' : butuhPanas ? ' Panas...' : ' Dingin...');
    setTimeout(function () { animasi = false; selesaiSaji(x.biaya); }, lama);
  }
  function selesaiSaji(biaya) {
    if (!R) return;
    if (SUARA) SUARA.bunyi('bayar');
    S.diri.stamina = Math.max(0, S.diri.stamina - 0.3);
    if (R.pesanan) {
      var p = R.pesanan;
      if (p.status === 'batal') { S.hariIni.terbuang += biaya; R.o.keadaan = 'x'; tutupRacik(); return toast('Pesanan ini sudah dibatalkan.'); }
      ANTAR.itemSiap(S, p, R.item, biaya);
      var lanjutX = ANTAR.itemBerikut(p);
      if (lanjutX) { R = { pesanan: p, item: lanjutX, o: { menu: ANTAR.menuDari(lanjutX.menu), panas: !!lanjutX.panas, keadaan: 'dilayani', bayar: p.bayar } }; return gambarRacik('Lanjut menu berikutnya di pesanan ini.'); }
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
    R = { pesanan: p, item: x, o: { menu: ANTAR.menuDari(x.menu), panas: !!x.panas, keadaan: 'dilayani', bayar: p.bayar } };
    $('app').classList.add('meracik'); $('racik').hidden = false;
    gambarRacik('');
  }
  function perbaruiPesanan() {
    var a = ANTAR.aktif(S), b = $('b-pesanan');
    if (!a.length) { b.hidden = true; if ($('b-antar-lencana')) $('b-antar-lencana').hidden = true; return; }
    var baru = a.filter(function (p) { return p.status === 'baru'; }).length, racik = a.filter(function (p) { return p.status === 'racik'; }).length, siap = a.filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; }).length;
    var bagian = []; if (baru) bagian.push(baru + ' baru'); if (racik) bagian.push(racik + ' perlu diracik'); if (siap) bagian.push(siap + ' siap antar');
    b.hidden = false; b.classList.toggle('ada-baru', baru > 0);
    var lc = $('b-antar-lencana'); if (lc) { lc.hidden = false; lc.textContent = a.length; }
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
  function pindah(ke, paksaHome) {
    if (R) tutupRacik();
    if (S.ojek.online) {
      if (paksaHome && ke === 'kos') { OJEK.offline(S, true); }
      else return toast('Sedang narik. Berhenti narik dulu di aplikasi Driver ojol.', 2600);
    }
    if (ke === 'kos' && S.fase === 'buka' && !kepalaMasuk()) {
      S.tutupSementara = true;
    }
    var km = S.rumah.jarak || N.jarakKos, menit, ket, r;
    var motorBisa = MOTOR.punya(S) && MOTOR.cukup(S, km), mobilBisa = MOBIL.punya(S) && MOBIL.cukup(S, km);
    if (mobilBisa && (DUNIA.hujanSekarang(S) || !motorBisa)) { r = MOBIL.jalan(S, km, 1); menit = r.menit; ket = 'naik ' + S.mobil.nama; }
    else if (motorBisa) { r = MOTOR.jalan(S, km, 1); menit = r.menit; ket = 'naik motor'; }
    else {
      var ong = OJEK.tarif(S, km);
      if (UANG.bayarDompet(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / 25 * 60) + 8; ket = 'naik ojek ' + rupiah(ong) + ' (dompet)'; }
      else if (UANG.bayarQris(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / 25 * 60) + 8; ket = 'naik ojek ' + rupiah(ong) + ' (QRIS)'; }
      else if (S.bank.saldo >= ong) { S.bank.saldo -= ong; S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / 25 * 60) + 8; ket = 'naik ojek ' + rupiah(ong) + ' (rekening)'; }
      else { menit = Math.round(km * 12); ket = 'jalan kaki'; }
    }
    gelapSebentar();
    S.diri.posisi = ke; lompatWaktu(menit);
    simpan(); perbaruiAksi(); perbaruiHUD(true);
    toast('Sampai di ' + (ke === 'kos' ? DIRI.tempat(S) : 'kedai') + ' pukul ' + jam(S.menit) + ', ' + ket + '.' + (r && r.kabar && r.kabar.length ? ' ' + r.kabar.join(' ') : ''), 2600);
    if (ke === 'kos') cekAjakanHbPasangan();
  }
  function cekAjakanHbPasangan() {
    if (!S || S.diri.posisi !== 'kos' || (S.menit % 1440) < 1200 || S.diri.sakit || lembar) return;
    var pasList = DIRI.daftarPasangan ? DIRI.daftarPasangan(S) : [];
    var calon = pasList.filter(function (kl) { return kl.lokasi !== 'kedai' && !kl.sakit && (kl.hb == null ? 35 : kl.hb) >= 60; })[0];
    if (!calon && S.ajakanHbPasanganId) {
      calon = (S.keluarga || []).filter(function (kl) { return kl.id === S.ajakanHbPasanganId; })[0];
    }
    if (!calon || S.ajakanHbTampilHari === S.hari) return;
    S.ajakanHbTampilHari = S.hari;
    S.ajakanHbPasanganId = null;
    var kdm = (S.kesehatan && S.kesehatan.kondom) || 0;
    bukaLembar('ajakanHb',
      kepala('Ajakan Mesra ' + calon.nama, 'Pukul ' + jam(S.menit) + ' di ' + DIRI.tempat(S)) +
      '<div class="kartu-pesanan" style="padding:14px;border-radius:14px;background:rgba(194,24,91,.11)">' +
      '<b>❤️ ' + esc(calon.nama) + ' (' + DIRI.labelPeran(S, calon) + ' · Bar HB ' + Math.round(calon.hb || 75) + '%)</b>' +
      '<p style="margin:8px 0 4px">"Sayang, udah malam nih dan kamu udah di rumah. Bar HB-ku udah memuncak, yuk kita HB malam ini sebelum tidur ❤️"</p>' +
      '<small>HB bersama pasangan sah akan memulihkan Stamina 100%, Melek 100%, Kesehatan 100%, dan Bahagia 100% hingga pukul 04.00 subuh.</small></div>' +
      '<div class="bayar-baris" style="margin-top:14px">' +
      (kdm > 0 ? '<button type="button" class="aksi kecil" data-diri="hbTarget:1|' + calon.id + '">Terima (Pakai Kondom · ' + kdm + ')</button>' : '') +
      '<button type="button" class="aksi kecil" data-diri="hbTarget:0|' + calon.id + '">Terima (Tanpa Kondom · 65% Hamil)</button>' +
      '<button type="button" class="tombol-lain gelap" data-tutup>Nanti dulu, capek</button></div>');
  }
  /* animasi HB di rumah/kos -> suami naik ke kasur, layar menggelap, skip waktu 1-2 jam siang atau sampai 04.00 subuh jika >= 20.00 */
  var hbAnim = null;
  function mulaiHb(pakaiKondom, targetKode) {
    var butuhDiRumah = !targetKode || (targetKode !== 'psk' && String(targetKode).indexOf('staf:') !== 0);
    if (butuhDiRumah && S.diri.posisi !== 'kos') {
      app.pesan = 'Pulang ke ' + DIRI.tempat(S) + ' dulu (tekan tombol Home) untuk HB di rumah.'; app.salah = true;
      return bukaHP('keluarga');
    }
    var r = DIRI.lakukanHb(S, pakaiKondom, targetKode);
    if (!r || !r.ok) { app.pesan = r; app.salah = true; if (lembar === 'hp') return bukaHP(app.nama || 'keluarga'); return toast(r, 2600); }
    tutupLembar(); if (R) tutupRacik();
    animasi = true;
    hbAnim = { mulai: performance.now() };
    setTimeout(function () { gelapSebentar(); }, 1100);
    setTimeout(function () {
      animasi = false; hbAnim = null;
      if (r.malam) {
        besok(r.bangun || 240);
      } else {
        lompatWaktu(r.menit || 90);
        S.diri.hb = 0; S.diri.stamina = 100; S.diri.melek = 100;
        simpan(); perbaruiHUD(true); perbaruiAksi();
      }
      toast(r.teks, 4200);
    }, 1850);
  }
  /* pindah rumah dengan animasi pikap */
  var pindahAnim = null;
  function pindahRumah(ke) {
    if (S.ojek.online) { app.pesan = 'Berhenti narik dulu.'; app.salah = true; return bukaHP('properti'); }
    if (S.fase === 'buka' && !kepalaMasuk()) { app.pesan = 'Kedai sedang buka. Pindahan setelah kedai tutup, atau tugaskan kepala toko.'; app.salah = true; return bukaHP('properti'); }
    var r = PROPERTI.pindah(S, ke); if (!r || !r.ok) { app.pesan = r; app.salah = true; return bukaHP('properti'); }
    tutupLembar(); if (R) tutupRacik();
    animasi = true; pindahAnim = { mulai: performance.now(), pikap: r.pikap, warna: S.mobil ? S.mobil.id : null };
    simpan();
    setTimeout(function () {
      animasi = false; pindahAnim = null; S.diri.posisi = 'kos'; lompatWaktu(r.menit);
      simpan(); perbaruiAksi(); perbaruiHUD(true); toast(r.teks, 4200);
    }, 3800);
  }
  /* ngojek */
  var panelKunci = '', tawaranUmur = 0;
  function mulaiNarik(pid) {
    if (S.fase === 'buka' && !kepalaMasuk()) { app.pesan = 'Kedai sedang buka. Narik sebelum buka atau setelah tutup, atau tugaskan kepala toko.'; app.salah = true; return bukaHP('driver'); }
    var e = OJEK.bisaOnline(S); if (e) { app.pesan = e; app.salah = true; return bukaHP(lembar === 'hp' ? 'driver' : 'driver'); }
    tutupLembar(); if (R) tutupRacik();
    if (S.diri.posisi !== 'kedai') pindah('kedai');
    OJEK.online(S, pid || S.ojek.platform || 'gojek'); tawaranUmur = 0; panelKunci = '';
    perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Online di ' + OJEK.platform(S.ojek.platform).nama + '. Menunggu order di samping kedai.', 2600);
  }
  function berhentiNarik() {
    var r = OJEK.offline(S, true); if (r !== true) return toast(r, 2000);
    tutupLembar(); perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Offline dari ' + OJEK.platform(S.ojek.platform).nama + '. Hari ini ' + S.ojek.hariIni.trip + ' order, ' + rupiah(S.ojek.hariIni.bersih) + '.', 2600);
  }
  var NAMA_JENIS = { penumpang: 'penumpang', barang: 'paket', makanan: 'makanan' };
  function panelOjek(paksa) {
    var o = S.ojek, f = OJEK.fase(S), x;
    var k = !o.online ? 'off' : o.trip ? 'trip' + o.trip.x.nama + o.trip.x.km + f.status : o.tawaran ? 'tw' + o.tawaran.nama + o.tawaran.km : 'sb' + o.hariIni.trip;
    if (!paksa && k === panelKunci) return; panelKunci = k;
    var el = $('ojek-panel'), html = '';
    if (!o.online) { el.innerHTML = ''; return; }
    if (o.trip) {
      x = o.trip.x;
      var langkah = f.status === 'jemput' ? (x.jenis === 'makanan' ? 'Ke resto, ambil pesanan ' + x.nama : x.jenis === 'barang' ? 'Ambil paket di tempat ' + x.nama : 'Jemput ' + x.nama) : (x.jenis === 'penumpang' ? 'Bonceng ' + x.nama + ' ke tujuan' : 'Antar ' + NAMA_JENIS[x.jenis] + ' ke ' + x.nama);
      html = '<div class="ojek-kartu"><b>' + esc(x.layanan) + ' · ' + esc(langkah) + '</b><small>' + x.km.toLocaleString('id-ID') + ' km · kamu dapat ' + rupiah(x.bersih) + (x.tunai ? ' · bayar tunai' : '') + '</small><div class="meteran"><i id="ojek-maju"></i></div>' +
        '<div class="ojek-tombol" style="margin-top:8px"><button type="button" class="chip-tombol" data-ojek="batal">Batalkan order</button><button type="button" class="chip-tombol" data-ojek="berhenti">Berhenti narik</button></div></div>';
    } else if (o.tawaran) {
      x = o.tawaran;
      html = '<div class="ojek-kartu tawaran"><b>Order ' + esc(x.layanan) + (x.jarakJauh ? ' [JARAK JAUH 🔥]' : '') + ' · ' + rupiah(x.tarif) + '</b><small>Jemput ' + x.jemput.toLocaleString('id-ID') + ' km · antar ' + x.km.toLocaleString('id-ID') + ' km' + (x.tunai ? ' · bayar tunai' : '') + ' · kamu dapat ' + rupiah(x.bersih) + '</small>' +
        '<div class="meteran"><i id="ojek-sisa"></i></div><div class="ojek-tombol"><button type="button" class="chip-tombol" data-ojek="lewati">Lewati</button><button type="button" class="chip-tombol" data-ojek="berhenti">Berhenti</button><button type="button" class="aksi" data-ojek="ambil">Ambil order</button></div></div>';
    } else {
      html = '<div class="ojek-kartu"><b>Online di ' + esc(OJEK.platform(o.platform).nama) + ' · menunggu order</b><small>Standby di samping kedai · hari ini ' + o.hariIni.trip + ' order, ' + rupiah(o.hariIni.bersih) + '</small>' +
        '<div class="ojek-tombol"><button type="button" class="chip-tombol" data-ojek="berhenti">Berhenti narik</button></div></div>';
    }
    el.innerHTML = html;
  }
  function aksiOjek(nama) {
    if (nama === 'ambil') { var r = OJEK.ambil(S); if (r !== true) toast(r, 2200); else { tawaranUmur = 0; if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {} } }
    else if (nama === 'lewati') { OJEK.lewati(S); tawaranUmur = 0; }
    else if (nama === 'batal') {
      var rb = OJEK.batalTrip(S);
      if (rb === true) toast('Order ' + OJEK.platform(S.ojek.platform).nama + ' dibatalkan. Kamu kembali standby.', 2200);
      else toast(rb, 2000);
    }
    else if (nama === 'berhenti') return berhentiNarik();
    panelOjek(true); perbaruiHUD(true); simpan();
  }
  function tidurMalam() {
    var mulai = S.menit, t = DIRI.tidur(S, Math.min(S.menit, 1439), S.diri.bangun);
    S.tidurAnim = true; setTimeout(function () { S.tidurAnim = false; }, 1600);
    gelapSebentar();
    besok(S.diri.bangun);
    toast('Tidur ' + t.jam.toFixed(1).replace('.', ',') + ' jam' + (t.ac ? ' pakai AC.' : ', AC mati karena token habis, kurang nyenyak.'), 2600);
  }
  function isiKosAksi() {
    var malam = S.fase === 'malam' || (S.menit % 1440) >= 1200, ada = function (id) { return DIRI.punya(S, id); };
    var masak = ada('ricecooker') || ada('kompor');
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var pas = DIRI.pasanganAktif(S);
    var tombol = [];
    if (rtAktif) tombol.push(['makanRumah:1', 'Makan di rumah (Gratis)']);
    tombol.push(['app:makan', 'Makan & minum']);
    tombol.push(['autoMakan:1', S.autoMakanMinum ? 'Auto Makan ✓' : 'Auto Makan']);
    if (masak) tombol.push(['makan:masak', 'Masak']);
    if (pas && pas.lokasi !== 'kedai') {
      var kdm = (S.kesehatan && S.kesehatan.kondom) || 0;
      tombol.push([kdm > 0 ? 'hb:1' : 'hb:0', 'HB bersama ' + pas.nama + (kdm > 0 ? ' (Aman)' : '')]);
    }
    if (DIRI.adaKonsol(S)) tombol.push(['istirahat:ps', 'Main PS']);
    if (ada('tv')) tombol.push(['istirahat:tv', 'Nonton TV']);
    if (!malam) tombol.push(['istirahat:tidurSiang', 'Tidur siang']);
    if (malam) tombol.push(['bangun:-60', 'Bangun lebih pagi'], ['bangun:60', 'Bangun lebih siang']);
    $('kos-aksi').innerHTML = tombol.map(function (x) { return '<button type="button" class="chip-tombol" data-diri="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
  }
  function aksiDiri(nama, nilai) {
    var r;
    if (nama === 'makan') r = DIRI.makan(S, nilai);
    else if (nama === 'makanRumah') r = DIRI.makanDiRumah(S);
    else if (nama === 'hb') return mulaiHb(nilai === '1');
    else if (nama === 'hbTarget') { var pht2 = nilai.split('|'); return mulaiHb(pht2[0] === '1', pht2[1]); }
    else if (nama === 'istirahat') r = DIRI.istirahat(S, nilai);
    else if (nama === 'bangun') { S.diri.bangun = Math.max(240, Math.min(720, S.diri.bangun + +nilai)); perbaruiAksi(); return; }
    else if (nama === 'pulang') { tutupLembar(); return pindah('kos', true); }
    else if (nama === 'narik') return mulaiNarik();
    else if (nama === 'app') { app.pesan = ''; return bukaHP(nilai); }
    else if (nama === 'tutup') { tutupLembar(); if (S.fase === 'buka') { tutupKedai(true); } return; }
    else if (nama === 'autoMakan') { S.autoMakanMinum = !S.autoMakanMinum; toast(S.autoMakanMinum ? 'Auto Makan & Minum aktif (hemat biaya).' : 'Auto Makan & Minum mati.', 2000); simpan(); perbaruiAksi(); if (lembar === 'diri') bukaDiri(); return; }
    if (r && r.ok) { if (r.menit) lompatWaktu(r.menit); toast(r.teks, 2400); simpan(); perbaruiHUD(true); }
    else if (r) toast(r, 2600);
    if (lembar === 'diri') bukaDiri();
  }
  function bar(nama, v, isHb) {
    var cls = isHb ? (v >= 85 ? ' hb kritis' : ' hb') : (v < 20 ? ' kritis' : '');
    return '<span>' + nama + '<i class="meteran' + cls + '"><i style="width:' + Math.round(v) + '%"></i></i></span>';
  }
  function bukaDiri() {
    var d = S.diri, diKedai = d.posisi === 'kedai', hm = DIRI.hpAktif(S);
    var bisaNarik = !S.ojek.online && N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    bukaLembar('diri', kepala('Kondisi badan & HP', (diKedai ? 'Di kedai' : 'Di ' + DIRI.tempat(S)) + (d.sakit ? ' · Sakit: ' + d.sakit.nama : ' · Kesehatan ' + Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%')) +
      '<ul class="daftar angka">' + baris('Kenyang', Math.round(d.kenyang) + '%', d.kenyang < 20 ? 'rugi' : '') + baris('Minum', Math.round(d.minum) + '%', d.minum < 20 ? 'rugi' : '') +
      baris('Stamina', Math.round(d.stamina) + '%', d.stamina < 20 ? 'rugi' : '') + baris('Melek', Math.round(d.melek) + '%', d.melek < 20 ? 'rugi' : '') +
      baris('HB Bar (Gairah)', Math.round(d.hb || 0) + '%', (d.hb || 0) >= 85 ? 'rugi' : '') +
      baris('Kesehatan Badan', (d.sakit ? esc(d.sakit.nama) + ' · ' : '') + Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%', d.sakit || (d.kesehatan || 100) < 50 ? 'rugi' : '') +
      (d.rasaBersalah ? baris('Rasa Bersalah', Math.round(d.rasaBersalah) + '%', 'rugi') : '') +
      (d.hiv ? baris('Status HIV', (S.kesehatan && S.kesehatan.arvSampai >= S.hari) ? 'HIV+ (Terapi ARV Aktif)' : 'HIV+ (Butuh ARV di Apotek!)', 'rugi') : '') +
      baris('Baterai ' + esc(hm.nama) + ' (' + hm.watt + 'W)', Math.round(S.hp ? S.hp.baterai : 95) + '%' + (S.hp && S.hp.cas ? ' (Sedang Cas)' : ''), (S.hp && S.hp.baterai < 20) ? 'rugi' : '') + '</ul>' +
      '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-diri="app:makan">Beli makan & minum</button>' +
      '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-diri="autoMakan:1">' + (S.autoMakanMinum ? 'Auto Makan/Minum ✓' : 'Auto Makan/Minum') + '</button>' +
      (diKedai ? '<button type="button" class="chip-tombol" data-diri="makan:kopi">Ngopi</button>' : '') +
      '<button type="button" class="chip-tombol" data-diri="makan:air">Minum air</button>' +
      (d.sakit ? '<button type="button" class="chip-tombol pilih" data-diri="app:apotek">Ke Apotek K-24</button>' : '') +
      (diKedai ? '<button type="button" class="chip-tombol pilih" data-diri="pulang:1">Pulang ke ' + DIRI.tempat(S) + '</button>' : '') +
      (bisaNarik && (S.fase !== 'buka' || kepalaMasuk()) ? '<button type="button" class="chip-tombol" data-diri="narik:1">Narik ojol</button>' : '') +
      (diKedai && S.fase === 'buka' ? '<button type="button" class="chip-tombol" data-diri="tutup:1">Tutup kedai sekarang</button>' : '') + '</div>' +
      '<p class="catatan">Lapar, kehujanan, atau kecapekan bisa membuat sakit (obati di Apotek K-24). Jika HB bar memuncak, pulang ke rumah bersama pasangan. Tidur atau HB memulihkan stamina & melek.</p>');
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
    punyaMotor: function () { return (MOTOR.jumlah(S) > 1) || (MOTOR.punya(S) && ANTAR.waktu(S) >= (S.motorSibukSampai || 0)); },
    antar: function (k) {
      var ids = ANTAR.aktif(S).filter(function (p) { return p.status === 'siap' && p.jenis !== 'ojol'; }).map(function (p) { return p.id; });
      if (!ids.length) return null;
      if (k && k.punyaMotorPribadi && (!MOTOR.punya(S) || ANTAR.waktu(S) < (S.motorSibukSampai || 0))) {
        var list = ids.map(function (id) { return ANTAR.cari(S, id); }).filter(Boolean);
        var jauh = Math.max.apply(null, list.map(function (p) { return p.jarak; })), km = Math.round((jauh * 2 + (list.length - 1)) * 10) / 10;
        var bensinRp = Math.round(km / 45 * MOTOR.hargaBbm(S, 'pertalite') / 500) * 500;
        list.forEach(function (p) { p.status = 'selesai'; p.selesai = ANTAR.waktu(S); });
        return { ok: true, menit: Math.round(km / 25 * 60) + 6, pakaiMotorPribadi: true, bensinRp: Math.max(2000, bensinRp), kabar: ['Antar ' + list.length + ' pesanan pakai motor pribadi (' + km + ' km, bensin ' + rupiah(Math.max(2000, bensinRp)) + ' masuk insentif).'] };
      }
      var r = ANTAR.antarSendiri(S, ids); if (r && r.ok && MOTOR.jumlah(S) <= 1) S.motorSibukSampai = ANTAR.waktu(S) + r.menit; return r;
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
      if (S.fase === 'buka' && !S.tutupSementara) JUAL.langkah(S, 1);
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
    var narik = main && S.ojek.online;
    if (main && !lembar && !document.hidden && S.kec > 0 && !animasi) {
      dMenit = dt / 1000 * MENIT_PER_DETIK * S.kec * (narik && S.ojek.trip ? OJEK.CEPAT_TRIP : 1);
      S.menit += dMenit;
      if (S.fase === 'buka' && !S.tutupSementara) JUAL.langkah(S, dMenit);
      var kabarStok = STOK.jalan(S, dMenit).concat(ANTAR.jalan(S, dMenit, MN.KERAMAIAN[Math.floor(S.menit / 60) % 24]), langkahStaf(dMenit), DUNIA.jalan(S, dMenit, STAF.ada(S, 'bersih')), USAHA.jalan(S, dMenit));
      if (kabarStok.length) { perbaruiHUD(true); perbaruiPesanan(); if (R && !animasi) gambarRacik(); }
      kabarStok = kabarStok.concat(DIRI.jalan(S, dMenit, S.diri.posisi === 'kedai' && (S.fase === 'buka' || narik)));
      if (narik) {
        var kabarOjek = OJEK.jalan(S, dMenit);
        if (kabarOjek.length) { kabarStok = kabarStok.concat(kabarOjek); perbaruiHUD(true); simpan(); }
        if (!S.ojek.trip && !S.ojek.tawaran && (S.diri.stamina < 8 || S.menit >= 1440 + 60 || !MOTOR.cukup(S, 3))) {
          OJEK.offline(S); kabarStok.push(S.diri.stamina < 8 ? 'Badan sudah capek, kamu berhenti narik.' : S.menit >= 1440 + 60 ? 'Sudah lewat pukul 01.00, kamu berhenti narik.' : 'Bensin hampir habis, kamu berhenti narik.'); perbaruiAksi();
        }
      }
      var kirimMakan = DIRI.cekKiriman(S); if (kirimMakan) kabarStok.push(kirimMakan);
      if (kabarStok.length) toast(kabarStok.join(' '), 2600);
      if (S.diri.ketiduran) { var kt = S.diri.ketiduran; S.diri.ketiduran = 0; lompatWaktu(kt); }
      var jamBukaEfektif = KAL.apakahRamadan(S.hari) > 0 ? 16 : S.jamBuka;
      /* kedai hanya buka otomatis bila sedang tidak narik ojol dan tidak ditutup manual hari ini */
      if (S.fase === 'pagi' && !S.ojek.online && S.tutupManualHari !== S.hari && S.menit >= jamBukaEfektif * 60 && (S.diri.posisi === 'kedai' || kepalaMasuk())) {
        bukaKedai(true);
      }
      if (S.menit >= 1440 + 120) {
        if (S.diri.posisi !== 'kos') { S.diri.posisi = 'kos'; if (S.ojek.online) OJEK.offline(S, true); }
        toast('Sudah larut malam (02.00), kamu pulang dan tidur di ' + DIRI.tempat(S) + '.');
        tidurMalam();
      }
      if (S.fase === 'buka' && S.menit >= S.jamTutup * 60) {
        if (JUAL.antre().length > 0 || R) {
          if (!S.tutupAntre) { S.tutupAntre = true; perbaruiHUD(true); toast('Jam tutup tiba. Selesaikan dulu pelayanan pelanggan yang masih antre.', 2800); }
        } else {
          tutupKedai();
        }
      }
      if (S.menit - menitSimpan >= 30) simpan();
      if (S.ajakanHbPasanganId && S.diri.posisi === 'kos' && (S.menit % 1440) >= 1200 && !lembar) {
        cekAjakanHbPasangan();
      }
    }
    if (main && S.ojek.online) {
      panelOjek();
      if (S.ojek.tawaran) {
        if (!lembar && !document.hidden && !animasi) tawaranUmur += dt;
        var sisaT = $('ojek-sisa'); if (sisaT) sisaT.style.width = Math.max(0, 100 - tawaranUmur / 150) + '%';
        if (tawaranUmur > 15000) { OJEK.kedaluwarsa(S); tawaranUmur = 0; toast('Order terlewat.', 1400); }
      } else tawaranUmur = 0;
      var maju = $('ojek-maju'), fo = OJEK.fase(S); if (maju && fo && fo.kemajuan != null) maju.style.width = (fo.kemajuan * 100).toFixed(1) + '%';
    }
    if (main) {
      if (SUARA) SUARA.suasana(suasanaMusik(S));
      JUAL.bersihkan();
      if (R && R.o.keadaan !== 'dilayani') { tutupRacik(); toast('Pembeli pergi, kelamaan menunggu.'); }
      var dSkrg = JUAL.depan();
      var butuhSyncTombol = S.fase === 'buka' && S.diri.posisi === 'kedai' && !S.ojek.online && $('b-aksi').disabled !== (!dSkrg || !!S.tutupSementara);
      if (dSkrg !== depanLama || butuhSyncTombol) perbaruiAksi();
      perbaruiHUD();
    }
    var ruang = layar !== 'main' ? 0 : R ? ($('racik').offsetHeight + 56) : $('bawah').offsetHeight;
    var stafHadir = main ? S.staf.filter(function (k) { return STAF.hadir(S, k) && STAF.punyaTugas(k, 'barista'); }) : [];
    var anakDiKedai = main && S.keluarga ? S.keluarga.filter(function (kl) { return kl.lokasi === 'kedai'; }).map(function (kl) { return kl.gender || 'cewek'; }) : [];
    var kelDiRumah = main && S.keluarga ? S.keluarga.filter(function (kl) { return kl.lokasi !== 'kedai'; }).map(function (kl) {
      return { nama: kl.nama, gender: kl.gender || 'cewek', pasangan: DIRI.adalahPasangan(kl), hamil: !!(kl.hamil && kl.hamil.terdeteksi), usia: KAL.usia(S.hari, kl.tglLahir) };
    }) : [];
    ADEGAN.gambar(main ? { namaToko: S.namaToko || 'Kopi Kontainer', namaPemain: S.namaPemain || 'Kamu', gender: (S.profil && S.profil.gender) || 'cewek', hamilPemain: !!(S.diri.hamil && S.diri.hamil.terdeteksi), keluargaRumah: kelDiRumah, hbAnim: hbAnim ? { u: Math.min(1, (t - hbAnim.mulai) / 1100) } : null, posisi: S.diri.posisi, ojek: OJEK.fase(S), motorId: S.motor ? S.motor.id : null, mobil: S.mobil ? { id: S.mobil.id, bentuk: S.mobil.bentuk } : null, rumah: S.rumah.jenis === 'rumah' ? S.rumah.tipe : null,
      pindah: pindahAnim ? { u: (t - pindahAnim.mulai) / 3800, pikap: pindahAnim.pikap, warna: pindahAnim.warna } : null, barang: S.rumah.barang, tidur: !!S.tidurAnim, acNyala: !S.rumah.padam && DIRI.adaAc(S), menit: S.menit, buka: S.fase === 'buka' && !S.tutupSementara, kecepatan: S.kec, jalan: !lembar && S.kec > 0, pembeli: JUAL.semua(), dMenit: dMenit, ruangBawah: ruang, motorParkir: S.motor && ANTAR.waktu(S) >= (S.motorSibukSampai || 0) ? S.motor.id : null, staf: stafHadir.length, stafGender: stafHadir.map(function (k) { return k.gender || 'cewek'; }), anakBantu: anakDiKedai, hujan: DUNIA.hujanSekarang(S) ? (S.dunia.cuaca.banjir ? 2 : 1) : 0, kotor: S.dunia.kotor, tier: S.usaha.tier, kayu: USAHA.punya(S, 'kursiKayu'), padam: !USAHA.listrikNyala(S) }
      : { namaToko: 'Kopi Kontainer', menit: 1050, buka: true, kecepatan: 1, jalan: true, pembeli: [], dMenit: 0 }, t);
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
      if (S.diri.posisi === 'kos') {
        if (S.fase === 'malam' || (S.menit % 1440) >= 1200) tidurMalam();
        else pindah('kedai');
        return;
      }
      if (S.fase === 'pagi') bukaKedai(false);
      else if (S.fase === 'buka') bukaRacik();
      else if (S.fase === 'malam') { if (S.laporanDilihat) bukaKedai(false); else bukaLaporan(); }
    };
    if ($('b-home')) $('b-home').onclick = function () {
      if (!S) return;
      if (S.diri.posisi === 'kos') pindah('kedai');
      else pindah('kos', true);
    };
    $('ojek-panel').onclick = function (e) { var b = e.target.closest('[data-ojek]'); if (b) aksiOjek(b.dataset.ojek); };
    $('kos-aksi').onclick = function (e) { var b = e.target.closest('[data-diri]'); if (b) { var dd = b.dataset.diri.split(':'); aksiDiri(dd[0], dd[1]); } };
    if ($('kedai-aksi')) $('kedai-aksi').onclick = function (e) {
      var b = e.target.closest('[data-kedai]'); if (!b) return;
      if (b.dataset.kedai === 'promo') {
        S.promoAktif = !S.promoAktif;
        simpan(); perbaruiAksi(); perbaruiHUD(true);
        toast(S.promoAktif ? 'Promo aktif! Pelanggan semua usaha +50%–80%.' : 'Promo dimatikan.');
      } else if (b.dataset.kedai === 'autoMakan') {
        S.autoMakanMinum = !S.autoMakanMinum;
        simpan(); perbaruiAksi(); perbaruiHUD(true);
        toast(S.autoMakanMinum ? 'Auto Makan & Minum aktif (hemat biaya).' : 'Auto Makan & Minum dimatikan.');
      } else if (b.dataset.kedai === 'sementara') {
        S.tutupSementara = !S.tutupSementara;
        if (S.tutupSementara && R) tutupRacik();
        simpan(); perbaruiAksi(); perbaruiHUD(true);
        toast(S.tutupSementara ? 'Kedai ditutup sementara. Bisa setor/tarik uang di Bank.' : 'Kedai dibuka kembali.');
      } else if (b.dataset.kedai === 'tutupAwal') {
        tutupKedai(true);
      } else if (b.dataset.kedai === 'bukaLagi') {
        bukaKedai(false);
      } else if (b.dataset.kedai === 'narik') {
        mulaiNarik();
      } else if (b.dataset.kedai === 'laporan') {
        bukaLaporan();
      }
    };
    $('h-diri').onclick = function () { bukaDiri(); };
    $('r-bahan').onclick = function (e) { var b = e.target.closest('[data-menu]'); if (b) tapMenu(b.dataset.menu); };
    $('r-tunda').onclick = tutupRacik;
    $('b-antar').onclick = function () { bukaPesanan(); };
    $('b-hp').onclick = function () { app.pesan = ''; bukaHP('beranda'); };
    $('b-pesanan').onclick = function () { bukaPesanan(); };
    $('h-uang').onclick = function () { if (S && S.fase !== 'pagi') bukaLaporanSementara(); };
    $('b-atur').onclick = function () { konfirmasiUlang = false; bukaAtur(); };
    var kecEl = document.querySelector('.kec');
    if (kecEl) kecEl.onclick = function (e) {
      var b = e.target.closest('[data-kec]'); if (!b) return;
      S.kec = +b.dataset.kec; perbaruiAksi(); simpan();
    };
    /* hold and drag untuk menyusun ulang posisi ikon APK di HP */
    var dragHp = null, tahanTimer = null, baruSeret = false;
    $('lembar-isi').addEventListener('pointerdown', function (e) {
      var btn = e.target.closest('#hp-grid .hp-app');
      if (!btn || !S || app.nama !== 'beranda') return;
      var idAsal = btn.dataset.app, x0 = e.clientX, y0 = e.clientY;
      tahanTimer = setTimeout(function () {
        dragHp = { id: idAsal, el: btn };
        baruSeret = true;
        btn.classList.add('seret');
      }, 240);
      dragHp = { id: idAsal, el: btn, x0: x0, y0: y0, aktif: false };
    });
    window.addEventListener('pointermove', function (e) {
      if (!dragHp) return;
      if (!baruSeret && (Math.abs(e.clientX - dragHp.x0) > 10 || Math.abs(e.clientY - dragHp.y0) > 10)) {
        clearTimeout(tahanTimer); dragHp = null; return;
      }
      if (!baruSeret) return;
      var target = document.elementFromPoint(e.clientX, e.clientY);
      var kartu = target ? target.closest('#hp-grid .hp-app') : null;
      [].forEach.call(document.querySelectorAll('#hp-grid .hp-app.target-seret'), function (el) { el.classList.remove('target-seret'); });
      if (kartu && kartu.dataset.app !== dragHp.id) kartu.classList.add('target-seret');
    });
    window.addEventListener('pointerup', function (e) {
      clearTimeout(tahanTimer);
      if (!dragHp) return;
      if (baruSeret) {
        dragHp.el.classList.remove('seret');
        var target = document.elementFromPoint(e.clientX, e.clientY);
        var kartu = target ? target.closest('#hp-grid .hp-app') : null;
        [].forEach.call(document.querySelectorAll('#hp-grid .hp-app.target-seret'), function (el) { el.classList.remove('target-seret'); });
        if (kartu && kartu.dataset.app && kartu.dataset.app !== dragHp.id) {
          var list = susunApps().map(function (a) { return a.id; });
          var iAsal = list.indexOf(dragHp.id), iTujuan = list.indexOf(kartu.dataset.app);
          if (iAsal >= 0 && iTujuan >= 0) {
            list.splice(iAsal, 1);
            list.splice(iTujuan, 0, dragHp.id);
            S.hp.urutanApp = list;
            simpan();
            bukaHP('beranda');
          }
        }
        setTimeout(function () { baruSeret = false; }, 60);
      }
      dragHp = null;
    });
    $('lembar').onclick = function (e) {
      if (e.target === $('lembar') || e.target.closest('[data-tutup]')) { tutupLembar(); return; }
      var b;
      if ((b = e.target.closest('[data-besok]'))) return besok();
      if ((b = e.target.closest('[data-pulang]'))) { tutupLembar(); return pindah('kos', true); }
      if ((b = e.target.closest('[data-diri]'))) { var dd = b.dataset.diri.split(':'); return aksiDiri(dd[0], dd[1]); }
      if ((b = e.target.closest('[data-psn]'))) { var ps = b.dataset.psn.split(':'); return aksiPesanan(ps[0], ps.slice(1).join(':')); }
      if ((b = e.target.closest('[data-app]'))) {
        if (baruSeret) return;
        app.pesan = '';
        if (b.dataset.app === 'wa') return bukaPesanan();
        if (b.dataset.app === 'sosmed') {
          var ckSos = DIRI.pakaiKuota(S, 0.012); /* buka feed sosmed memakai 12 MB kuota presisi */
          if (ckSos !== true) { app.pesan = ckSos; app.salah = true; }
        }
        return bukaHP(b.dataset.app);
      }
      if ((b = e.target.closest('[data-aksi]'))) { var pa = b.dataset.aksi.split(':'); return aksiHP(pa[0], pa.slice(1).join(':')); }
      if ((b = e.target.closest('[data-gender]'))) {
        S.profil = S.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
        S.profil.gender = b.dataset.gender;
        simpan(); var gg = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = gg; return;
      }
      if ((b = e.target.closest('[data-simpan-nama]'))) {
        var nt = $('in-toko') ? $('in-toko').value.trim() : '';
        var np = $('in-pemain') ? $('in-pemain').value.trim() : '';
        var nttl = $('in-ttl') ? $('in-ttl').value : '';
        if (nt) S.namaToko = nt.slice(0, 24);
        if (np) S.namaPemain = np.slice(0, 24);
        S.profil = S.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
        if (nttl) S.profil.tglLahir = nttl;
        var gsn = $('lembar-isi').scrollTop;
        simpan(); perbaruiHUD(true); toast('Profil, nama, dan TTL disimpan.'); bukaAtur(); $('lembar-isi').scrollTop = gsn; return;
      }
      if ((b = e.target.closest('[data-promo]'))) {
        S.promoAktif = !S.promoAktif; simpan(); perbaruiHUD(true); perbaruiAksi();
        var gp = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = gp; return;
      }
      if ((b = e.target.closest('[data-suara]'))) {
        if (SUARA) {
          if (b.dataset.suara === 'musik') SUARA.aturMusik(!SUARA.musikOn());
          else SUARA.aturEfek(!SUARA.efekOn());
        }
        var gs = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = gs; return;
      }
      if ((b = e.target.closest('[data-bulan]'))) { var m = kal.m + (+b.dataset.bulan), y = kal.y; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } return bukaKalender(y, m); }
      if ((b = e.target.closest('[data-tg]'))) { kal.pilih = +b.dataset.tg; return bukaKalender(kal.y, kal.m); }
      if ((b = e.target.closest('[data-jam]'))) { var p = b.dataset.jam.split(':'); if (p[0] === 'harga') { DUNIA.ubahHarga(S, p[1], +p[2]); simpan(); var g1 = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = g1; return; }
        if (p.length === 3) return ubahJam('ongkir.' + p[1], +p[2]); return ubahJam(p[0], +p[1]); }
      if ((b = e.target.closest('[data-ulang]'))) {
        if (!konfirmasiUlang) { konfirmasiUlang = true; var gu = $('lembar-isi').scrollTop; bukaAtur(); $('lembar-isi').scrollTop = gu; return; }
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
