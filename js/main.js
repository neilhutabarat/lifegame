/* main.js — alur game: pilih kota dan QRIS, jam berjalan, buka-tutup kedai, racik dan jualan, laporan malam, kalender, simpan otomatis. */
(function () {
  'use strict';
  var KAL = window.KK_KAL, N = window.KK_NYATA, SIMPAN = window.KK_SIMPAN, ADEGAN = window.KK_ADEGAN, JUAL = window.KK_JUAL, MN = window.KK_MENU, UANG = window.KK_UANG, DIRI = window.KK_DIRI, STOK = window.KK_STOK, MOTOR = window.KK_MOTOR, ANTAR = window.KK_ANTAR, STAF = window.KK_STAF, DUNIA = window.KK_DUNIA, USAHA = window.KK_USAHA, MOBIL = window.KK_MOBIL, OJEK = window.KK_OJEK, TRAVEL = window.KK_TRAVEL, RUTE = window.KK_RUTE, PROPERTI = window.KK_PROPERTI, SUARA = window.KK_SUARA, TEMAN = window.KK_TEMAN, TOWER = window.KK_TOWER;
  var MENIT_PER_DETIK = 2;               /* 1 jam game = 30 detik nyata pada kecepatan 1x */
  var TAHUN_DASAR = 2022;               /* tahun Masehi 2023 = tahun ke-1 */
  var HARI_PERTAMA = KAL.dn(2023, 1, 2); /* Senin pertama */

  var $ = function (id) { return document.getElementById(id); };
  var S = null, layar = 'awal', lembar = null, tPrev = 0, menitSimpan = 0, toastT = 0, kotaDipilih = null, qrisDipilih = null, lokasiDipilih = null, modeDriver = true;
  var R = null; /* racik yang sedang terbuka: { o: pembeli } */
  var kal = { y: 0, m: 0, pilih: null };

  /* ---------- format ---------- */
  function rupiah(n) { n = Math.round(n); return (n < 0 ? '−Rp' : 'Rp') + Math.abs(n).toLocaleString('id-ID'); }
  function rupiahPendek(n) { return Math.abs(n) >= 10e6 ? (n < 0 ? '−' : '') + 'Rp' + (Math.abs(n) / 1e6).toFixed(1).replace('.', ',') + ' jt' : rupiah(n); }
  function dua(n) { return (n < 10 ? '0' : '') + n; }
  function jam(menit) { var m = Math.floor(menit) % 1440; return dua(Math.floor(m / 60)) + '.' + dua(m % 60); }
  function namaTanggal(n, panjang) { var t = KAL.tgl(n); return (panjang ? N.namaHari[t.dow] + ', ' : '') + t.d + ' ' + N.namaBulan[t.m - 1]; }
  function tahunKe(n) { return KAL.tgl(n).y - TAHUN_DASAR; }
  function kotaIni() { return (DIRI && DIRI.kota) ? DIRI.kota(S) : (N.kota.filter(function (k) { return k.id === S.kota; })[0] || N.kota[0]); }
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
      var nmKotaLama = k ? k.nama : (RUTE && RUTE.nama ? RUTE.nama(lama.kota) : '');
      $('info-simpan').textContent = 'Simpanan: hari ke-' + lama.hariKe + ', ' + nmKotaLama + ', ' + namaTanggal(lama.hari, true) + '.';
    } else { b.hidden = true; $('info-simpan').textContent = ''; }
  }
  function isiKota() {
    $('kota-daftar').innerHTML = N.kota.map(function (k) {
      return '<button type="button" class="kota" data-kota="' + k.id + '"><b>' + esc(k.nama) + '</b>' +
        '<span class="ciri">' + esc(k.provinsi) + '</span><span class="umk">UMK ' + rupiah(k.umk) + ' sebulan</span></button>';
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
    d.teman = d.teman || []; d.pesanan = []; d.namaToko = d.namaToko || 'The Driver'; if (d.usaha) d.usaha.berhentiSewa = true; /* kedai dihapus: semua simpanan jadi mode driver */
    d.namaPemain = d.namaPemain || 'Driver';
    d.profil = d.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
    d.kec = 1; /* selalu 1,5x standar; waktu berhenti saat membuka menu HP / lembar */
    d.uang = d.uang || { laci: 0, merchant: 0 };
    if (typeof d.uang.dompet !== 'number') d.uang.dompet = 150000;
    if (!d.bonusBank50jt && d.bank && typeof d.bank.saldo === 'number') {
      d.bank.saldo += 50000000;
      d.bank.mutasi = d.bank.mutasi || [];
      d.bank.mutasi.unshift({ n: d.hari || 0, ket: 'Dana tambahan', jml: 50000000 });
      d.bonusBank50jt = true;
    }
    if (!d.pemutihanKredit1) {
      d.kreditBuruk = false;
      d.pemutihanKredit1 = true;
    }
    if (!d.bonusBank200jt && d.bank && typeof d.bank.saldo === 'number') {
      d.bank.saldo += 200000000;
      d.bank.mutasi = d.bank.mutasi || [];
      d.bank.mutasi.unshift({ n: d.hari || 0, ket: 'Tambahan modal', jml: 200000000 });
      d.bonusBank200jt = true;
    }
    if (!d.bonusBank500jt && d.bank && typeof d.bank.saldo === 'number') {
      d.bank.saldo += 500000000;
      d.bank.mutasi = d.bank.mutasi || [];
      d.bank.mutasi.unshift({ n: d.hari || 0, ket: 'Tambahan modal 500 juta', jml: 500000000 });
      d.bonusBank500jt = true;
    }
    d.hariIni = d.hariIni || JUAL.hariBaru();
    d.hariIni.tanpaKembalian = d.hariIni.tanpaKembalian || 0;
    STOK.siapkan(d); MOTOR.siapkan(d); MOBIL.siapkan(d); OJEK.siapkan(d); PROPERTI.siapkan(d); TRAVEL.siapkan(d); ANTAR.siapkan(d); STAF.siapkan(d); DUNIA.siapkan(d); USAHA.siapkan(d); DUNIA.terapkanHarga(d); DIRI.siapkan(d); TEMAN.siap(d);
    if (!d.pemutihanKredit2) {
      var tPm = KAL.tgl(d.hari || 0), blnPm = tPm.y * 12 + tPm.m;
      d.kreditBuruk = false;
      (d.armadaMobil || []).forEach(function (mb) {
        if (mb && mb.kredit) { mb.kredit.tunggakan = 0; mb.kredit.denda = 0; mb.kredit.bulanTelat = 0; mb.kredit.terbayarSampai = Math.max(mb.kredit.terbayarSampai || 0, blnPm); }
      });
      (d.armadaMotor || []).forEach(function (mt) {
        if (mt && mt.kredit) { mt.kredit.tunggakan = 0; mt.kredit.denda = 0; mt.kredit.bulanTelat = 0; mt.kredit.terbayarSampai = Math.max(mt.kredit.terbayarSampai || 0, blnPm); }
      });
      ((d.properti && d.properti.daftarRumah) || []).forEach(function (rm) {
        if (rm && rm.kpr) { rm.kpr.tunggakan = 0; rm.kpr.bulanTelat = 0; rm.kpr.terbayarSampai = Math.max(rm.kpr.terbayarSampai || 0, blnPm); }
      });
      if (d.kk) { d.kk.denda = 0; if (d.kk.status === 'blokir') d.kk.status = 'aktif'; }
      if (d.kur) d.kur.tunggakan = 0;
      if (d.rumah) d.rumah.tunggakan = 0;
      if (d.kesehatan && d.kesehatan.bpjs) { d.kesehatan.bpjs.tunggakan = 0; if (d.kesehatan.bpjs.kelas > 0) d.kesehatan.bpjs.aktif = true; }
      d.pemutihanKredit2 = true;
    }
    if (!d.gantiRugiKk500jt && d.bank && typeof d.bank.saldo === 'number') {
      d.bank.saldo += 500000000;
      d.bank.mutasi = d.bank.mutasi || [];
      d.bank.mutasi.unshift({ n: d.hari || 0, ket: 'Ganti rugi bug Kartu Kredit + Leasing (500 juta)', jml: 500000000 });
      var mutKk = (d.kk && d.kk.mutasi) || [];
      var kkDpKet = mutKk.filter(function (x) { return /Uang muka kredit/i.test(x.ket || ''); }).map(function (x) { return String(x.ket || '').toLowerCase(); });
      if (kkDpKet.length) {
        (d.armadaMobil || []).forEach(function (mb) {
          if (mb && mb.kredit && kkDpKet.some(function (k) { return k.indexOf(String(mb.nama || '').toLowerCase()) >= 0; })) mb.kredit = null;
        });
        (d.armadaMotor || []).forEach(function (mt) {
          if (mt && mt.kredit && kkDpKet.some(function (k) { return k.indexOf(String(mt.nama || '').toLowerCase()) >= 0; })) mt.kredit = null;
        });
      }
      d.gantiRugiKk500jt = true;
    }
    if (!d.bonusBank5M && d.bank && typeof d.bank.saldo === 'number') {
      d.bank.saldo += 5000000000;
      d.bank.mutasi = d.bank.mutasi || [];
      d.bank.mutasi.unshift({ n: d.hari || 0, ket: 'Tambahan modal 5 miliar', jml: 5000000000 });
      d.bonusBank5M = true;
    }
    if (d.tagihanNafkah) d.tagihanNafkah = null;
    d.vvip = d.vvip || { aktif: false };
    d.sandbox = d.sandbox || { aktif: false, kebal: false, bukaTahun: false };
    if (TOWER && TOWER.sinkron) TOWER.sinkron(d);
    if (!d.vvip.aktif) {
      if (d.gigiJalan > 4) d.gigiJalan = 4;
      if (d.travel && d.travel.gigi > 4) d.travel.gigi = 4;
    }
    if (d.travel && TRAVEL && TRAVEL.pastikanKasTravel && (d.mobil || (d.travel.supir && d.travel.supir.length))) TRAVEL.pastikanKasTravel(d, 0);
    d.riwayat = d.riwayat || [];
    d.omzetTahun = d.omzetTahun || 0;
    d.tahunOmzet = d.tahunOmzet || KAL.tgl(d.hari).y;
    return d;
  }
  function mulaiBaru(kota, qris, bank) {
    /* game baru: modal awal bersih tepat Rp5.000.000 (Rp4.850.000 bank + Rp150.000 dompet tunai), tanpa suntikan bonus migrasi lama */
    S = lengkapi({
      v: 3, kota: kota, qris: qris, hari: HARI_PERTAMA, menit: 360, fase: 'pagi', jamBuka: 7, jamTutup: 22, kec: 1, hariKe: 1, dibuat: Date.now(),
      bonusBank50jt: true, bonusBank200jt: true, bonusBank500jt: true, gantiRugiKk500jt: true, bonusBank5M: true, pemutihanKredit1: true, pemutihanKredit2: true,
      tutorialSelesai: false
    });
    S.bank = null; S.uang = null;
    UANG.siapkan(S, bank);
    if (TOWER && TOWER.sinkron) TOWER.sinkron(S);
    S.usaha.lokasi = lokasiDipilih || 'jalan';
    if (modeDriver) S.usaha.berhentiSewa = true; /* mulai sebagai driver: kedai belum disewa, bisa dibuka belakangan di aplikasi Usaha */
    if (S.usaha.lokasi === 'spbu') S.dunia.pesaing.push({ nama: 'Point Coffee', jenis: 'waralaba', rating: 4.5, harga: 18000, jarak: 0.1, promoSampai: -1 });
    JUAL.kosongkan(); S.diri.posisi = 'kos'; simpan(); tampil('main');
    if (!S.tutorialSelesai) bukaTutorial(0);
    else toast('Hari pertama di ' + kotaIni().nama + '. Modal awal Rp5.000.000 siap dipakai!', 3200);
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
    var uPemain = KAL.usia(S.hari, S.profil && S.profil.tglLahir), gPemain = (S.profil && S.profil.gender) || 'cewek';
    var kFoto = (ADEGAN && ADEGAN.pilihChar) ? ADEGAN.pilihChar(S.namaPemain, gPemain, uPemain) : srcPemain();
    var hf = $('h-foto'); if (hf && hf.dataset.k !== kFoto) { hf.dataset.k = kFoto; hf.innerHTML = fotoWajah(srcPemain(), 36, null, S.namaPemain, gPemain, uPemain).replace(/^<span[^>]*>|<\/span>$/g, ''); }
    var thn = KAL.tgl(S.hari).y;
    $('h-tahun').textContent = thn + ' · Hari ke-' + S.hariKe + ' · ' + uPemain + ' thn';
    var ramadan = KAL.apakahRamadan(S.hari);
    var st = $('h-status');
    st.className = S.fase === 'buka' && !S.tutupSementara ? 'status-buka' : '';
    st.textContent = S.tutupSementara ? 'Tutup sementara' : (S.fase === 'pagi' && ramadan) ? 'Ramadan · Buka 16.00 (Takjil)' : S.fase === 'pagi' ? 'Buka pukul ' + jam(S.jamBuka * 60) : S.fase === 'buka' ? 'Buka sampai ' + jam(S.jamTutup * 60) : 'Tutup';
    if (S.hbRun) { st.className = ''; st.textContent = S.hbRun.metime ? 'Me time' : S.hbRun.varian === 'ciuman' ? 'Ciuman hangat 💋' : S.hbRun.varian === 'foreplay' ? 'Foreplay romantis 🔥' : 'Waktu berdua ❤️'; }
    else if (S.transit) { st.className = ''; st.textContent = 'Di jalan · ' + (S.transit.ke === 'kos' ? 'pulang' : 'berangkat'); }
    else if (S.usaha && S.usaha.berhentiSewa) {
      st.className = '';
      var adaOjol = N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
      var adaMobil = !!S.mobil, isPikap = MOBIL.pikap(S);
      if (S.ojek && S.ojek.online) {
        st.textContent = S.ojek.mode === 'mobil' ? (S.ojek.platform === 'grab' ? 'Online GrabCar' : 'Online GoCar') : 'Online ojol';
      } else if (!adaOjol && adaMobil) {
        st.textContent = isPikap ? 'Pekerjaan: Angkutan Pikap' : 'Pekerjaan: GoCar · Travel';
      } else if (adaOjol && adaMobil && !isPikap) {
        st.textContent = 'Driver Ojol · GoCar · Travel';
      } else {
        st.textContent = 'Mode driver';
      }
    }
    if (S.travel && S.travel.aktif) { st.className = ''; st.textContent = S.travel.status === 'jalan' ? 'Di jalan' : S.travel.status === 'kapal' ? 'Di kapal' : 'Pool travel · ' + RUTE.nama(S.travel.di); }
    var d = S.diri, batHp = Math.round((S.hp && S.hp.baterai != null) ? S.hp.baterai : 95);
    var pbOn = !!(S.hp && S.hp.pbPasang && DIRI.pbAktifInfo && DIRI.pbAktifInfo(S) && DIRI.pbAktifInfo(S).state.sisaMah > 0);
    var lblHp = (S.hp && S.hp.cas) ? '⚡HP' : pbOn ? '🔋PB' : '🔋HP';
    $('h-diri').innerHTML = bar('Makan', d.kenyang) + bar('Minum', d.minum) + bar('Stamina', d.stamina, false, 'stamina') + bar('HB', d.hb || 0, true, 'hb') + bar(lblHp, batHp, false, 'hp') + barBensin();
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', d.posisi === 'kos');
    var tanpaToko = !!(S.usaha && S.usaha.berhentiSewa);
    if ($('h-laci')) {
      $('h-laci').textContent = rupiahPendek(UANG.laci(S));
      if ($('h-laci').parentElement) $('h-laci').parentElement.hidden = tanpaToko;
    }
    if ($('h-dompet')) $('h-dompet').textContent = rupiahPendek(UANG.dompet(S));
    $('h-merchant').textContent = rupiahPendek(UANG.merchantTotal(S));
    $('h-bank').textContent = rupiahPendek(S.bank.saldo);
    $('h-bank-nama').textContent = UANG.bankIni(S).nama;
    $('h-merchant-nama').textContent = Object.keys(S.merchants).length > 1 ? 'QRIS' : qrisIni().nama;
    $('h-antre').textContent = JUAL.antre().length;
    if ($('h-antre').parentElement) $('h-antre').parentElement.hidden = tanpaToko;
    if (paksa || Math.floor(S.menit) % 30 === 0) {
      var isi = KAL.hariIni(S.hari).filter(function (x) { if (x.nama === 'Tanggal muda' || x.nama === 'Tanggal tua' || x.nama === 'Musim hujan') return false; return x.jenis !== 'suasana' || x.nama !== 'Car Free Day pagi' || S.menit < 600; });
      var tipis = (!tanpaToko && S.fase !== 'malam') ? STOK.menipis(S) : [];
      var kelSakit = (S.keluarga || []).filter(function (kl) { return !!kl.sakit; });
      var tunggakGaji = STAF.totalTunggakanGaji ? STAF.totalTunggakanGaji(S) : 0;
      /* Notice pembayaran & cicilan di HUD (mobil, motor, rumah KPR, PDAM, KK, nafkah, BPJS, cicilan hadiah) agar tidak lupa */
      var tSkrg = KAL.tgl(S.hari), tglSkrg = tSkrg.d, blnIniH = tSkrg.y * 12 + tSkrg.m;
      function selisihTgl(tempo) { var sd = tempo - tglSkrg; if (sd < 0) sd += 30; return sd; }
      function blnTagihH(tempo) { return blnIniH + (tglSkrg > tempo ? 1 : 0); }
      var chipBayar = '';
      if ((S.bulanTanpaNafkah || 0) > 0 && DIRI.pasanganAktif(S) && ((S.profil && S.profil.gender) === 'cowok')) {
        chipBayar += '<span class="chip libur bisa-tap" data-chipapp="keluarga">⚠️ Tanpa Nafkah ' + S.bulanTanpaNafkah + '/6 bln</span>';
      } else if (DIRI.pasanganAktif(S) && ((S.profil && S.profil.gender) === 'cowok') && (S.nafkahTerbayarSampai || 0) < blnIniH && DIRI.sisaHariNafkah && DIRI.sisaHariNafkah(S) <= 5) {
        chipBayar += '<span class="chip event bisa-tap" data-chipapp="keluarga">💝 Nafkah bln ini</span>';
      }
      (S.armadaMobil || (S.mobil ? [S.mobil] : [])).forEach(function (mb) {
        if (!mb || !mb.kredit) return;
        var kmbl = mb.kredit, hMbl = selisihTgl(kmbl.tempo), sudahBlnM = (kmbl.terbayarSampai || 0) >= blnTagihH(kmbl.tempo);
        if (kmbl.tunggakan > 0) chipBayar += '<span class="chip libur bisa-tap" data-chipapp="motor">🚗 Tunggakan ' + esc(mb.nama.split(' ')[0]) + ' ' + rupiahPendek(kmbl.tunggakan + (kmbl.denda || 0)) + '</span>';
        else if (!sudahBlnM && hMbl <= 3) chipBayar += '<span class="chip event bisa-tap" data-chipapp="motor">🚗 Cicilan ' + esc(mb.nama.split(' ')[0]) + ' ' + (hMbl === 0 ? 'Hari ini' : 'H-' + hMbl) + ' · ' + rupiahPendek(kmbl.angsuran) + '</span>';
      });
      (S.armadaMotor || (S.motor ? [S.motor] : [])).forEach(function (mt) {
        if (!mt || !mt.kredit) return;
        var kmtr = mt.kredit, hMtr = selisihTgl(kmtr.tempo), sudahBlnMt = (kmtr.terbayarSampai || 0) >= blnTagihH(kmtr.tempo);
        if (kmtr.tunggakan > 0) chipBayar += '<span class="chip libur bisa-tap" data-chipapp="motor">🏍️ Tunggakan ' + esc(mt.nama.split(' ')[0]) + ' ' + rupiahPendek(kmtr.tunggakan + (kmtr.denda || 0)) + '</span>';
        else if (!sudahBlnMt && hMtr <= 3) chipBayar += '<span class="chip event bisa-tap" data-chipapp="motor">🏍️ Cicilan ' + esc(mt.nama.split(' ')[0]) + ' ' + (hMtr === 0 ? 'Hari ini' : 'H-' + hMtr) + ' · ' + rupiahPendek(kmtr.angsuran) + '</span>';
      });
      (PROPERTI.daftarRumah ? PROPERTI.daftarRumah(S) : []).forEach(function (rm) {
        if (rm.tagihanAir > 0) chipBayar += '<span class="chip libur bisa-tap" data-chipapp="properti">💧 PDAM ' + rupiahPendek(rm.tagihanAir) + '</span>';
        if (rm.kpr) {
          var hKpr = selisihTgl(rm.kpr.tempo), sudahBlnK = (rm.kpr.terbayarSampai || 0) >= blnTagihH(rm.kpr.tempo);
          if (rm.kpr.tunggakan > 0) chipBayar += '<span class="chip libur bisa-tap" data-chipapp="properti">🏠 Tunggakan KPR ' + rupiahPendek(rm.kpr.tunggakan) + '</span>';
          else if (!sudahBlnK && hKpr <= 3) chipBayar += '<span class="chip event bisa-tap" data-chipapp="properti">🏠 KPR ' + (hKpr === 0 ? 'Hari ini' : 'H-' + hKpr) + ' · ' + rupiahPendek(rm.kpr.angsuran) + '</span>';
        }
      });
      if (S.kk && S.kk.status && S.kk.status !== 'tidak' && ((S.kk.tagihan || 0) + (S.kk.denda || 0)) > 0) {
        var totKkH = (S.kk.tagihan || 0) + (S.kk.denda || 0), hKk = selisihTgl(N.kartuKredit.jatuhTempo);
        chipBayar += '<span class="chip ' + (S.kk.status === 'blokir' || hKk <= 3 ? 'libur' : 'event') + ' bisa-tap" data-chipapp="kk">💳 Tagihan KK ' + rupiahPendek(totKkH) + ' (tgl ' + N.kartuKredit.jatuhTempo + ')</span>';
      }
      if (S.kesehatan && S.kesehatan.bpjs && S.kesehatan.bpjs.tunggakan > 0) {
        chipBayar += '<span class="chip libur bisa-tap" data-chipapp="apotek">🏥 Tunggakan BPJS ' + rupiahPendek(S.kesehatan.bpjs.tunggakan) + '</span>';
      }
      if (S.cicilanHadiah && S.cicilanHadiah.length && DIRI.sisaHariNafkah && DIRI.sisaHariNafkah(S) <= 3) {
        var belumHdh = S.cicilanHadiah.filter(function (x) { return (x.terbayarSampai || 0) < (blnIniH + 1); });
        if (belumHdh.length) {
          var totHdh = belumHdh.reduce(function (a, x) { return a + (x.angsuran || 0); }, 0);
          chipBayar += '<span class="chip event bisa-tap" data-chipapp="keluarga">🎁 Cicilan Hadiah H-' + DIRI.sisaHariNafkah(S) + ' · ' + rupiahPendek(totHdh) + '</span>';
        }
      }
      var totQrisHud = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
      if (totQrisHud > 0) {
        chipBayar += '<span class="chip event bisa-tap" data-chipapp="qriskaryawan">📲 QRIS Supir ' + rupiahPendek(totQrisHud) + '</span>';
      }
      var chipDunia = chipBayar + (d.sakit ? '<span class="chip libur bisa-tap" data-chipapp="apotek">Sakit: ' + esc(d.sakit.nama) + ' (Apotek & RS)</span>' : '') +
        (d.hiv ? '<span class="chip libur">HIV+ · ' + ((S.kesehatan && S.kesehatan.arvSampai >= S.hari) ? 'ARV Aktif' : 'Beli ARV di Apotek!') + '</span>' : '') +
        (d.kesehatan != null && d.kesehatan < 60 ? '<span class="chip libur">Kesehatan ' + Math.round(d.kesehatan) + '%</span>' : '') +
        (tunggakGaji > 0 ? '<span class="chip libur">Tunggakan Gaji ' + STAF.maksHariTunggakan(S, S.hari) + '/90 hr (' + rupiahPendek(tunggakGaji) + ')</span>' : '') +
        (S.rentalPs && S.rentalPs.aktif ? '<span class="chip event">Rental PS: ' + S.rentalPs.unit.length + ' bilik · ' + rupiah((S.rentalPs.hariIni.omzetSewa || 0) + (S.rentalPs.hariIni.omzetMinum || 0)) + '</span>' : '') +
        (kelSakit.length ? '<span class="chip libur">' + esc(kelSakit[0].nama) + ' sakit (' + esc(kelSakit[0].sakit.nama) + ')</span>' : '') +
        ((d.hb || 0) >= 85 && DIRI.pasanganAktif(S) ? '<span class="chip event">HB memuncak · Pulang bersama ' + esc(DIRI.pasanganAktif(S).nama) + '</span>' : '') +
        (TOWER && TOWER.sandboxAktif(S) ? '<span class="chip event">🧪 SANDBOX</span>' : '') +
        (S.promoAktif ? '<span class="chip event">PROMO AKTIF</span>' : '') +
        (KAL.apakahRamadan(S.hari) ? '<span class="chip event">Promo Ramadan +100%</span>' : '') +
        (KAL.tanggalKembar(S.hari) ? '<span class="chip event">Diskon ' + KAL.tanggalKembar(S.hari) + ' Shopee/Tokopedia</span>' : '') +
        (S.tutupAntre ? '<span class="chip libur">Jam tutup · selesaikan antrean</span>' : '') +
        (S.ojek.online ? '<span class="chip event">Narik ' + esc(S.ojek.mode === 'mobil' ? (S.ojek.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(S.ojek.platform).nama) + ' · ' + S.ojek.hariIni.trip + ' order · ' + rupiah(S.ojek.hariIni.bersih) + '</span>' : '') +
        (!tanpaToko && S.diri.posisi === 'kos' && S.fase === 'buka' ? '<span class="chip libur">Kedai buka tanpa kamu</span>' : '') +
        (!tanpaToko && S.diri.posisi === 'kos' && S.fase === 'pagi' && S.menit >= S.jamBuka * 60 ? '<span class="chip libur">Kedai belum dibuka, kamu masih di ' + DIRI.tempat(S) + '</span>' : '') +
        (DUNIA.hujanSekarang(S) ? '<span class="chip event">' + (S.dunia.cuaca.banjir ? 'Hujan deras, banjir' : 'Hujan') + '</span>' : '') +
        (!tanpaToko && S.dunia.kotor >= 40 && S.fase !== 'malam' ? '<span class="chip libur">Kedai kotor, tap kontainer untuk bersih-bersih</span>' : '') +
        (!tanpaToko && S.dunia.maps.status === 'aktif' && S.dunia.ulasan.length ? '<span class="chip">★ ' + DUNIA.rataMaps(S).toFixed(1).replace('.', ',') + ' Maps</span>' : '');
      $('h-chip').innerHTML = chipDunia + (tipis.length ? '<span class="chip libur">Stok menipis: ' + esc(tipis.map(function (id) { return MN.BARANG[id].nama.split(' (')[0].replace('Biji kopi robusta sangrai', 'Kopi').replace('Cup plastik 16 oz + tutup + sedotan', 'Cup plastik').replace('Cup kertas 8 oz + tutup', 'Cup kertas'); }).join(', ')) + '</span>' : '') +
        isi.map(function (x) {
        var label = x.jenis === 'libur' ? 'Libur: ' + x.nama : x.jenis === 'cuti' ? 'Cuti bersama: ' + x.nama : x.nama;
        return '<span class="chip ' + x.jenis + '">' + esc(label) + '</span>';
      }).join('');
    }
  }
  function perbaruiAksi() {
    var b = $('b-aksi'), diKos = S.diri.posisi === 'kos', ojek = S.ojek.online, trv = !!(S.travel && S.travel.aktif), tr = !!(S.transit || S.hbRun);
    $('travel-panel').hidden = !trv; if (trv) panelTravel(true);
    var ka = $('kedai-aksi');
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', diKos);
    $('kos-aksi').hidden = !diKos || tr;
    $('ojek-panel').hidden = !ojek; if (ojek) { panelOjek(true); }
    if (ka) {
      var tampilKedaiAksi = !diKos && !ojek && !trv && !tr;
      ka.hidden = !tampilKedaiAksi;
      if (tampilKedaiAksi) {
        var bisaNarik = N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
        var bisaCar = !!S.mobil && !MOBIL.pikap(S);
        ka.innerHTML = (S.usaha.berhentiSewa ? '' : '<button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-kedai="promo">' + (S.promoAktif ? 'Promo ✓' : 'Promo') + '</button>') +
          '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-kedai="autoMakan">' + (S.autoMakanMinum ? 'Auto Makan ✓' : 'Auto Makan') + '</button>' +
          (S.fase === 'buka' ? '<button type="button" class="chip-tombol' + (S.tutupSementara ? ' pilih' : '') + '" data-kedai="sementara">' + (S.tutupSementara ? 'Buka kembali' : 'Tutup sementara') + '</button><button type="button" class="chip-tombol" data-kedai="tutupAwal">Tutup kedai</button>' :
            (!S.usaha.berhentiSewa ? '<button type="button" class="chip-tombol" data-kedai="bukaLagi">Buka kedai</button>' : '') +
            (bisaNarik ? '<button type="button" class="chip-tombol" data-kedai="narik">Narik ojol</button>' : '') +
            (bisaCar ? '<button type="button" class="chip-tombol pilih" data-kedai="gocar">Narik GoCar</button><button type="button" class="chip-tombol" data-kedai="travel">Travel</button>' : '') +
            (S.fase === 'malam' ? '<button type="button" class="chip-tombol" data-kedai="laporan">Laporan</button>' : ''));
      }
    }
    if (ojek || trv || tr) { b.hidden = true; }
    else if (diKos) {
      var siapTidur = S.fase === 'malam' || (S.menit % 1440) >= 1080 || (S.ojek && S.ojek.hariIni && S.ojek.hariIni.trip > 0);
      if (S.usaha.berhentiSewa && !siapTidur) {
        b.hidden = true;
      } else {
        b.hidden = false; b.disabled = false;
        b.textContent = siapTidur ? 'Tidur, bangun pukul ' + jam(S.diri.bangun) : 'Berangkat ke kedai';
      }
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
    else if (S.usaha.berhentiSewa) { b.hidden = true; }
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
  function besok(bangun, lanjutDiJalan) {
    var h = S.hariIni; h.tenagaKerja = STAF.biayaHarian(S); h.sewaHarian = sewaHarian(); h.rating = S.dunia.ratingHari.n ? S.dunia.ratingHari.total / S.dunia.ratingHari.n : 0;
    var drvMode = !!(S.usaha && S.usaha.berhentiSewa);
    S.riwayat.push({ hari: S.hari, dilayani: h.dilayani, pergi: h.pergi, omzet: omzetTotal(h), laba: drvMode ? 0 : labaKotor(h), ojek: h.ojek || 0, mobil: (h.mobil || 0) + (h.travel || 0), rental: (h.rental || 0) + (h.rentalPs || 0) });
    if (S.riwayat.length > 60) S.riwayat.shift();
    S.fase = 'pagi';
    var nLama = S.hari, kabar = UANG.gantiHari(S, S.hari, S.hari + 1);
    S.hari += 1; S.hariKe += 1; S.menit = lanjutDiJalan ? Math.max(0, S.menit - 1440) : (bangun || 360); if (S.travel) S.travel.hariIni = { trip: 0, bersih: 0 }; S.hariIni = JUAL.hariBaru(); JUAL.kosongkan(); S.laporanDilihat = false;
    if (SUARA) SUARA.suasana(suasanaMusik(S));
    kabar = kabar.concat(MOTOR.gantiHari(S, nLama, S.hari), DUNIA.gantiHari(S, nLama, S.hari).filter(function (k) { return k.indexOf('Prakiraan cuaca') === 0; }), DIRI.gantiHari(S, nLama, S.hari), TEMAN.gantiHari ? TEMAN.gantiHari(S, nLama, S.hari) : [], MOBIL.gantiHari(S, nLama, S.hari), OJEK.gantiHari(S, nLama, S.hari, !!lanjutDiJalan), TRAVEL.gantiHari ? TRAVEL.gantiHari(S, nLama, S.hari) : [], PROPERTI.gantiHari(S, nLama, S.hari));
    S.motorSibukSampai = 0;
    if (KAL.tgl(S.hari).y !== S.tahunOmzet) { S.tahunOmzet = KAL.tgl(S.hari).y; S.omzetTahun = 0; }
    if (S.profil && S.profil.tglLahir) {
      var tl = S.profil.tglLahir.split('-'), tb = KAL.tgl(S.hari);
      if (tl.length === 3 && tb.m === (+tl[1]) && tb.d === (+tl[2])) {
        kabar.unshift('Selamat ulang tahun ke-' + KAL.usia(S.hari, S.profil.tglLahir) + ', ' + (S.namaPemain || 'Pemilik') + '!');
      }
    }
    if (KAL.apakahRamadan(S.hari) === 1) kabar.unshift('Marhaban ya Ramadan! Promo Ramadan aktif: order +100% selama sebulan penuh.');
    if (KAL.tanggalKembar(S.hari)) kabar.unshift('Promo Tanggal Kembar ' + KAL.tanggalKembar(S.hari) + '! Ada diskon besar di Shopee dan Tokopedia hari ini.');
    tutupLembar(); simpan(); perbaruiHUD(true); perbaruiAksi(); perbaruiPesanan();
    var lib = KAL.hariIni(S.hari).filter(function (x) { return x.jenis === 'libur' || x.jenis === 'cuti'; });
    toast(namaTanggal(S.hari, true) + (lib.length ? '. ' + (lib[0].jenis === 'libur' ? 'Libur ' : 'Cuti bersama ') + lib[0].nama + '.' : '.'), 2600);
    if (lanjutDiJalan) { if (kabar.length) toast(kabar.slice(0, 2).join(' '), 3600); }
    else if (kabar.length) bukaLembar('kabar', kepala('Kabar pagi', namaTanggal(S.hari, true)) +
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
    if (S.usaha && S.usaha.berhentiSewa) {
      var totDrv = (h.ojek || 0) + (h.mobil || 0) + (h.travel || 0) + (h.rental || 0) - (h.bensin || 0) - (h.bengkel || 0) - (h.listrikMotor || 0);
      return '<h3 class="subjudul">Ringkasan harian driver</h3><ul class="daftar angka">' +
        baris('Pendapatan bersih Driver Ojol (' + (S.ojek && S.ojek.hariIni ? S.ojek.hariIni.trip : 0) + ' order)', rupiah(h.ojek || 0)) +
        (h.mobil ? baris('GoCar / GrabCar / Angkutan', rupiah(h.mobil)) : '') +
        (h.travel ? baris('Travel Antarkota', rupiah(h.travel)) : '') +
        (h.rental ? baris('Sewa barang milikmu', rupiah(h.rental)) : '') +
        (h.bensin ? baris('Bensin', '−' + rupiah(h.bensin)) : '') +
        (h.listrikMotor ? baris('Cas motor listrik', '−' + rupiah(h.listrikMotor)) : '') +
        (h.bengkel ? baris('Bengkel & perawatan', '−' + rupiah(h.bengkel)) : '') +
        baris('<b>Total bersih hari ini</b>', '<b>' + rupiah(totDrv) + '</b>', 'total') + '</ul>' +
        '<h3 class="subjudul">Saldo sekarang</h3><ul class="daftar angka">' +
        baris('Dompet tunai', rupiah(UANG.dompet(S))) +
        baris('Saldo e-wallet', rupiah(UANG.merchantTotal(S))) +
        baris('Rekening ' + esc(UANG.bankIni(S).nama), rupiah(S.bank.saldo)) + '</ul>' +
        (h.pribadi ? '<p class="catatan">Pengeluaran pribadi hari ini ' + rupiah(h.pribadi) + ' (makan, minum, kebutuhan ' + DIRI.tempat(S) + ').</p>' : '');
    }
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
    var k = kotaIni();
    var mOn = !SUARA || SUARA.musikOn(), eOn = !SUARA || SUARA.efekOn();
    var pr = S.profil || { gender: 'cewek', tglLahir: '1999-05-15' };
    var usia = KAL.usia(S.hari, pr.tglLahir), thn = KAL.tgl(S.hari).y;
    bukaLembar('atur',
      kepala('Pengaturan', k.nama + ' (' + thn + ')') +
      '<h3 class="subjudul">Identitas pemain</h3>' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' + fotoWajah(srcPemain(), 60, null, S.namaPemain, pr.gender, usia) + '<div><b>' + esc(S.namaPemain || 'Driver') + '</b><small style="display:block;color:var(--tinta2)">ID Akun: <b>' + esc(S.akunId || '-') + '</b>' + (TOWER && TOWER.sandboxAktif(S) ? ' · 🧪 Sandbox' : '') + '</small></div></div>' +
        '<div class="atur-baris" style="display:block"><div><b>Nama pemain</b><span>Nama pemilik rekening</span></div><input id="in-pemain" class="input-teks" type="text" maxlength="24" value="' + esc(S.namaPemain || 'Pemilik') + '"></div>' +
      '<div class="atur-baris"><div><b>Gender karakter</b><span>Memengaruhi tampilan karakter</span></div><div class="chip-baris" style="margin:0"><button type="button" class="chip-tombol' + (pr.gender === 'cewek' ? ' pilih' : '') + '" data-gender="cewek">Cewek</button><button type="button" class="chip-tombol' + (pr.gender === 'cowok' ? ' pilih' : '') + '" data-gender="cowok">Cowok</button></div></div>' +
      '<div class="atur-baris" style="display:block"><div><b>Tanggal lahir (TTL)</b><span>Tahun game ' + thn + ' · Usia saat ini: <b>' + usia + ' tahun</b></span></div><input id="in-ttl" class="input-teks" type="date" value="' + esc(pr.tglLahir || '1999-05-15') + '"><div style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-simpan-nama>Simpan profil & nama</button></div></div>' +
      '<h3 class="subjudul">Mode VVIP (Gembok Kecepatan Level 5)</h3>' +
      '<div class="atur-baris"><div><b>' + (TRAVEL.vvipAktif(S) ? '🔓 Mode VVIP Aktif' : '🔒 Mode VVIP Terkunci') + '</b><span>' + (TRAVEL.vvipAktif(S) ? 'Kecepatan Level 5 (Top Speed) terbuka penuh.' : 'Mode normal maks Level 4 (realistis). Buka gembok VVIP (' + (S.vvip && S.vvip.pernahBeli ? 'sudah dibeli' : rupiah(TRAVEL.VVIP_HARGA || 50000000)) + ') untuk Level 5.') + '</span></div><div>' +
      (TRAVEL.vvipAktif(S)
        ? '<button type="button" class="chip-tombol" data-vvip="kunci">🔒 Kunci lagi</button>'
        : '<button type="button" class="chip-tombol pilih" data-vvip="popup">🔓 Buka Gembok</button>') +
      '</div></div>' +
      '<div class="atur-baris" style="display:block"><div><b>🎟️ Tukar Kode Aktivasi / Voucher</b><span>Masukkan kode VVIP, Mode Sandbox, atau Paket Dana dari Control Tower</span></div><div style="display:flex;gap:6px;margin-top:6px"><input id="in-voucher" class="input-teks" style="margin:0;flex:1" type="text" maxlength="28" placeholder="Contoh: TD-VVIP-XXXX-XXXX"><button type="button" class="chip-tombol pilih" data-voucher="redeem">Tukar</button></div></div>' +
      '<div class="atur-baris"><div><b>📖 Panduan Permainan</b><span>Lihat kembali tutorial dasar cara bermain</span></div><div><button type="button" class="chip-tombol" data-tut="0">Buka Tutorial</button></div></div>' +
      '<h3 class="subjudul">Suara & lagu tema</h3>' +
      '<div class="atur-baris"><div><b>Lagu tema orisinal</b><span>Pagi, siang, dan malam beda suasana</span></div><div><button type="button" class="chip-tombol' + (mOn ? ' pilih' : '') + '" data-suara="musik">' + (mOn ? 'Nyala' : 'Mati') + '</button></div></div>' +
      '<div class="atur-baris"><div><b>Efek suara</b><span>Mesin motor, notifikasi, dan tombol</span></div><div><button type="button" class="chip-tombol' + (eOn ? ' pilih' : '') + '" data-suara="efek">' + (eOn ? 'Nyala' : 'Mati') + '</button></div></div>' +
      '<button type="button" class="bahaya" data-ulang>' + (konfirmasiUlang ? 'Tekan sekali lagi untuk menghapus simpanan' : 'Mulai ulang dari awal') + '</button>');
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
  var NOMINAL_TARIK = [50000, 100000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000, 100000000];
  var NOMINAL_SEMUA = [50000, 100000, 500000, 1000000, 5000000, 10000000, 25000000, 50000000, 100000000, 'semua'];
  function labelNominal(j) {
    if (j === 'semua') return 'Semua';
    if (j >= 1e6) return (j / 1e6) + 'jt';
    return (j / 1000) + 'rb';
  }
  function tombolNominalGrid(aksi, daftar) {
    return '<div class="grid-nominal">' + daftar.map(function (j) {
      return '<button type="button" class="chip-tombol' + (j === 'semua' ? ' pilih' : '') + '" data-aksi="' + aksi + ':' + j + '">' + labelNominal(j) + '</button>';
    }).join('') + '</div>';
  }
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
      badge: function () { return (S.bulanTanpaNafkah || 0) > 0 ? '!' : ((S.diri.hb || 0) >= 85 && DIRI.pasanganAktif(S) ? 'HB' : (S.keluarga && S.keluarga.length ? String(S.keluarga.length) : '')); } },
    { id: 'teman', nama: function () { return 'Teman'; }, warna: function () { return '#3f8fd9'; },
      ikon: function () { return svgIkon('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M2.5 19c0-3.2 2.4-5.2 5.5-5.2s5.5 2 5.5 5.2M14 14.2c3 0 7 1.4 7 4.8"/>'); },
      badge: function () { return S.popupSelingkuh ? '!' : ''; } },
    { id: 'apotek', nama: function () { return 'Apotek & RS'; }, warna: function () { return '#00a651'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>'); },
      badge: function () { return S.diri.sakit || S.diri.hiv || (S.keluarga || []).some(function (k) { return !!k.sakit; }) ? '!' : ''; } },
    { id: 'merchant', nama: function () { return 'QRIS'; }, warna: function () { return '#00aed6'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 14h2.5M14 18.5h6.5M18 16.5v4"/>'); },
      badge: function () { return UANG.tersedia(S) > 0 ? 'Rp' : ''; } },
    { id: 'qriskaryawan', nama: function () { return 'QRIS Karyawan'; }, warna: function () { return '#00897b'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><circle cx="8" cy="16" r="2.5"/><path d="M4.5 21c0-2 1.5-3 3.5-3s3.5 1 3.5 3M14.5 14h6M14.5 17.5h4M14.5 21h6"/>'); },
      badge: function () { return (TRAVEL.totalQrisSupir && TRAVEL.totalQrisSupir(S) > 0) ? 'Rp' : ''; } },
    { id: 'bank', nama: function () { return UANG.bankIni(S).app; }, warna: function () { return UANG.bankIni(S).warna; },
      ikon: function () { return svgIkon('<path d="M3 10h18M5 10v8M10 10v8M14 10v8M19 10v8M2 18h20M12 3 2 8v2h20V8z"/>'); } },
    { id: 'laci', nama: function () { return 'Dompet'; }, warna: function () { return '#b97a46'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M15 14h3.5"/>'); } },
    { id: 'motor', nama: function () { return 'Kendaraan'; }, warna: function () { return '#d9443a'; },
      ikon: function () { return svgIkon('<path d="M4 14l2-5h12l2 5v4H4v-4z"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M6 14h12"/>'); } },
    { id: 'travel', nama: function () { return 'Travel'; }, warna: function () { return '#6a4fd8'; },
      ikon: function () { return svgIkon('<path d="M3.5 15l1.6-4.6A2 2 0 0 1 7 9h10a2 2 0 0 1 1.9 1.4L20.5 15v3.5h-17z"/><circle cx="7.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/><path d="M5.5 13h13"/>'); },
      badge: function () { return S.travel && S.travel.aktif ? '•' : ''; } },
    { id: 'kastravel', nama: function () { return 'Kas Travel'; }, warna: function () { return '#1565c0'; },
      ikon: function () { return svgIkon('<rect x="3" y="6.5" width="18" height="13" rx="2.5"/><path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 11.5h18M12 11.5v3"/>'); },
      badge: function () { return (S.travel && (S.travel.kas || 0) < (TRAVEL.KAS_MIN || 50000000) && S.travel.autoTopupKas === false) ? '!' : ''; } },
    { id: 'gadget', nama: function () { return 'Gadget & Kuota'; }, warna: function () { return '#1e88e5'; },
      ikon: function () { return svgIkon('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5.5h4M12 18.5h.01"/>'); },
      badge: function () { return (S.hp && (S.hp.baterai < 20 || (!DIRI.adaWifi(S) && S.hp.kuota < 1))) ? '!' : ''; } },
    { id: 'pln', nama: function () { return 'PLN Mobile'; }, warna: function () { return '#00a2e9'; },
      ikon: function () { return svgIkon('<path d="M13 2.5 5 13h6l-1 8.5L19 11h-6z" fill="currentColor" stroke="none"/>'); },
      badge: function () { return (!S.usaha.berhentiSewa && S.usaha.padam) || S.rumah.padam ? '!' : ''; } },
    { id: 'toko', nama: function () { return 'Toko online'; }, warna: function () { return '#42b549'; },
      ikon: function () { return svgIkon('<path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/><circle cx="10" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/>'); },
      badge: function () { return KAL.tanggalKembar(S.hari) || ''; } },
    { id: 'game', nama: function () { return 'Toko game'; }, warna: function () { return '#00439c'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.8" cy="13.5" r=".9" fill="currentColor"/>'); } },
    { id: 'properti', nama: function () { return 'Properti'; }, warna: function () { return '#8a5a2b'; },
      ikon: function () { return svgIkon('<path d="M3.5 11.5 12 4l8.5 7.5M6 10v9.5h12V10M10 19.5v-5h4v5"/>'); },
      badge: function () { var dr = PROPERTI.daftarRumah ? PROPERTI.daftarRumah(S) : []; return dr.some(function (r) { return r.status === 'siap' && !r.dihuni && !r.sewa; }) ? '!' : ''; } },
    { id: 'rental', nama: function () { return 'Sewa & Rental'; }, warna: function () { return '#6d4c41'; },
      ikon: function () { return svgIkon('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 4h3v3M14 7l2.5 2.5"/>'); },
      badge: function () { var n = Object.keys(S.sewaBarang || {}).length; return n ? String(n) : ''; } },
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
      html = kepala('HP · ' + (S.namaPemain || 'Pemilik') + ' (' + noHp + ')', jam(S.menit) + ' · ' + namaTanggal(S.hari, true)) + pesanApp() + '<div class="hp-grid" id="hp-grid">' + susunApps().map(function (a) {
        var bd = a.badge ? a.badge() : '';
        return '<button type="button" class="hp-app" data-app="' + a.id + '"><i style="background:' + a.warna() + '">' + a.ikon() + (bd ? '<span class="hp-badge">' + esc(bd) + '</span>' : '') + '</i>' + esc(a.nama()) + '</button>';
      }).join('') + '</div><p class="catatan">💡 Tahan & seret ikon APK untuk menyusun posisi menu HP. Waktu game otomatis jeda selama HP terbuka.</p>';
    } else if (app.nama === 'bank') html = layarBank();
    else if (app.nama === 'kur') html = layarKur();
    else if (app.nama === 'kk') html = layarKartuKredit();
    else if (app.nama === 'merchant') html = layarMerchant();
    else if (app.nama === 'qriskaryawan') html = layarQrisKaryawan();
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
    else if (app.nama === 'travel') html = layarTravel();
    else if (app.nama === 'kastravel') html = layarKasTravel();
    else if (app.nama === 'karyawan') html = layarKaryawan();
    else if (app.nama === 'maps') html = layarMaps();
    else if (app.nama === 'usaha') html = layarUsaha();
    else if (app.nama === 'menuku') html = layarMenuku();
    else if (app.nama === 'pln') html = layarPln();
    else if (app.nama === 'toko') html = layarToko();
    else if (app.nama === 'teman') html = layarTeman();
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
    var b = UANG.bankIni(S), k = S.kur, kk = S.kk || {}, tabB = app.bankTab || 'tunai';
    var kur = k.status === 'menunggu' ? 'Pengajuan ' + rupiah(k.plafon) + ' diproses' : k.status === 'aktif' ? 'Angsuran ' + rupiah(k.angsuran) + ' tgl ' + k.tempo + ', sisa ' + k.sisa + ' bln' + (k.tunggakan ? ', nunggak ' + rupiah(k.tunggakan) : '') : k.status === 'lunas' ? 'Lunas' : 'Belum punya';
    var infoKk = !kk.status || kk.status === 'tidak' ? 'Belum punya · bunga maks 1,75%/bln' : (kk.status === 'blokir' ? 'Diblokir · ' : '') + 'Limit ' + rupiahPendek(kk.limit) + ' · sisa ' + rupiahPendek(UANG.sisaLimitKk(S)) + (kk.tagihan > 0 ? ' · tagih ' + rupiahPendek(kk.tagihan + (kk.denda || 0)) : '');
    var html = kepalaApp(b.app, 'Rekening ' + b.nama + ' · Dompet ' + rupiahPendek(UANG.dompet(S))) +
      '<div class="saldo-ringkas">' +
      '<div class="saldo-besar"><small>Rekening Utama</small><b>' + rupiah(S.bank.saldo) + '</b></div>' +
      '<div class="saldo-besar" style="background:#5e35b1"><small>Tabungan Khusus</small><b>' + rupiah(S.bank.tabunganGaji || 0) + '</b></div></div>' +
      chipTab('bankTab', [['tunai', '💵 Tarik & Setor'], ['tabungan', '🏦 Tabungan'], ['kredit', '💳 KK & KUR'], ['mutasi', '📜 Mutasi']], tabB) + pesanApp();
    if (tabB === 'tunai') {
      html += '<h3 class="subjudul">Tarik Tunai ke Dompet Pribadi (Dompet: ' + rupiah(UANG.dompet(S)) + ')</h3>' +
        tombolNominalGrid('tarikDompet', NOMINAL_TARIK) +
        '<h3 class="subjudul">Setor Tunai dari Dompet Pribadi ke Bank</h3>' +
        tombolNominalGrid('setor', NOMINAL_SEMUA) +
        '<p class="catatan">' + (b.tunai ? 'Setor/tarik ≤Rp1jt via ' + esc(b.tunai.tempat) + ' (biaya ' + rupiah(b.tunai.biaya) + '); nominal besar otomatis via Teller bebas biaya.' : 'Bebas biaya tarik & setor tunai melalui ATM / Teller ' + esc(b.nama) + '.') + '</p>';
    } else if (tabB === 'tabungan') {
      html += '<h3 class="subjudul">Simpan dari Rekening Utama → Tabungan Khusus</h3>' +
        tombolNominalGrid('isiTabGaji', NOMINAL_SEMUA) +
        '<h3 class="subjudul">Tarik dari Tabungan Khusus → Rekening Utama</h3>' +
        tombolNominalGrid('tarikTabGaji', NOMINAL_SEMUA) +
        '<p class="catatan">Dana di Tabungan Khusus aman dan tidak akan pernah terpotong otomatis oleh sistem, cicilan, gaji, maupun belanja kecuali kamu tarik sendiri.</p>';
    } else if (tabB === 'kredit') {
      html += '<button type="button" class="baris-tombol" data-app="kk"><span><b>💳 Kartu Kredit ' + esc(b.nama) + '</b><small>' + esc(infoKk) + '</small></span><span>›</span></button>' +
        '<button type="button" class="baris-tombol" data-app="kur"><span><b>🏦 KUR Mikro</b><small>' + esc(kur) + '</small></span><span>›</span></button>' +
        '<button type="button" class="baris-tombol" data-app="kastravel"><span><b>💼 Kas Travel</b><small>Saldo: ' + rupiah((S.travel && S.travel.kas) || 0) + ' (Auto top-up &lt; 50jt)</small></span><span>›</span></button>' +
        '<ul class="daftar angka" style="margin-top:10px">' +
        baris('Biaya admin bulanan', b.admin ? rupiah(b.admin) : 'Gratis') +
        baris('Transfer antarbank', b.gratisTransfer ? 'Gratis ' + Math.max(0, b.gratisTransfer - S.bank.transferBulanIni) + '× lagi' : rupiah(N.biFast) + ' (BI-FAST)') +
        baris('Batas transfer harian', b.batasTransfer ? rupiah(b.batasTransfer) : 'Tanpa batas') + '</ul>';
    } else {
      html += '<h3 class="subjudul">Mutasi Terakhir (' + Math.min(20, S.bank.mutasi.length) + ')</h3><ul class="daftar angka">' + (S.bank.mutasi.length ? S.bank.mutasi.slice(0, 20).map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada transaksi</span></li>') + '</ul>';
    }
    return html;
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
        '<p class="catatan">Kartu kredit bisa dipakai belanja di Tokopedia, dealer motor & mobil (langsung lunas tanpa leasing), dan Toko Game. Limit maksimal Rp1 Miliar. Tagihan dicetak tiap tanggal 1 dan jatuh tempo tanggal 18.</p>';
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
    var dasarCicil = Math.round((kk.tagihan || 0) + (kk.pakai || 0));
    if (kk.cicilan) {
      var sisaPokokC = Math.round(kk.cicilan.pokok * kk.cicilan.sisa / kk.cicilan.n);
      html += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-top:8px"><b>Cicilan KK Berjalan</b><small>' + rupiah(kk.cicilan.per) + '/bulan · sisa ' + kk.cicilan.sisa + ' dari ' + kk.cicilan.n + ' bulan (sisa pokok ' + rupiah(sisaPokokC) + ').</small><div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="lunasCicilKk:1">💳 Lunasi Sisa Cicilan (' + rupiah(sisaPokokC) + ')</button></div></div>';
    } else if (dasarCicil >= 500000 && !kk.denda) {
      html += '<h3 class="subjudul">Ubah Pemakaian / Tagihan ' + rupiah(dasarCicil) + ' jadi Cicilan KK</h3><div class="chip-baris">' + UANG.TENOR_KK.map(function (n) { return '<button type="button" class="chip-tombol" data-aksi="cicilKk:' + n + '">' + n + ' bln · ' + rupiah(UANG.cicilanKk(dasarCicil, n)) + '</button>'; }).join('') + '</div><p class="catatan">Bunga 1,75% sebulan (bisa langsung ubah pemakaian berjalan jadi cicilan tanpa menunggu tanggal 1).</p>';
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
      '<p class="catatan">Bank menyetujui kalau angsuran tidak lebih dari separuh rata-rata penghasilan bersih sebulan. Telat bayar tercatat di riwayat kredit.</p>';
  }
  function layarMerchant() {
    S.merchants = S.merchants || {};
    var kelas = (S.omzetTahun || 0) > N.mdr.batasMikro ? 'kecil' : 'mikro', m = N.mdr[kelas];
    var html = kepalaApp('QRIS Merchant', Object.keys(S.merchants).length + ' QRIS aktif (Travel & Driver)') + pesanApp() +
      '<div class="saldo-besar"><small>Total Saldo QRIS Bisa Ditarik (' + Object.keys(S.merchants || {}).length + '/3 akun aktif)</small><b>' + rupiah(UANG.tersedia(S)) + '</b></div><ul class="daftar pesanan">';
    html += N.qris.map(function (q) {
      var mm = S.merchants[q.id];
      if (!mm) return '<li class="kartu-pesanan"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><b><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.app) + '</b><small>' + esc(q.transfer) + '</small></div><button type="button" class="chip-tombol pilih" data-aksi="pasangQris:' + q.id + '">Pasang</button></div></li>';
      var sisaGratis = q.gratis === Infinity ? 'tanpa batas' : Math.max(0, q.gratis - mm.tarikBulanIni) + '× lagi';
      var menunggu = UANG.saldoMerchant(mm) - mm.tersedia;
      return '<li class="kartu-pesanan"><div><b><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.app) + '</b>' +
        (mm.aktifPada && S.hari < mm.aktifPada
          ? '<small class="status">Aktif ' + namaTanggal(mm.aktifPada) + '</small>'
          : '<small>Tersedia: <b>' + rupiah(mm.tersedia) + '</b>' + (menunggu > 0 ? ' · Cair besok: ' + rupiah(menunggu) : '') + ' · Gratis: ' + sisaGratis + '</small>') +
        '</div><div class="chip-baris">' +
        (mm.tersedia > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tarikMerchant:' + q.id + '">Tarik ke ' + esc(UANG.bankIni(S).nama) + '</button>' : '') +
        '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="tutupQris:' + q.id + '">Tutup Akun</button></div></li>';
    }).join('') + '</ul>';
    var totQrisK = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
    return html + '<button type="button" class="baris-tombol" style="margin-top:10px" data-app="qriskaryawan"><span><b>📲 QRIS Karyawan Travel</b><small>Saldo terpisah per supir: ' + rupiah(totQrisK) + '</small></span><span>›</span></button>' +
      '<details class="kartu-lipat"><summary>ℹ️ Info Kelas Merchant & MDR QRIS</summary><ul class="daftar angka">' + baris('Kelas merchant', 'Merchant ' + kelas) + baris('MDR QRIS<small>0% s/d ' + rupiah(m.gratisSampai) + ', di atasnya ' + (m.tarif * 100).toFixed(1).replace('.', ',') + '%</small>', '') + '</ul>' +
      '<p class="catatan">Penutupan akun QRIS otomatis mencairkan seluruh sisa saldo ke rekening bank. Kamu bisa pasang lagi kapan saja.</p></details>';
  }
  function layarQrisKaryawan() {
    var T = TRAVEL.siapkan(S), listSp = T.supir || [];
    var tot = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
    var html = kepalaApp('QRIS Karyawan', listSp.length + ' QRIS khusus Supir Travel') + pesanApp() +
      '<div class="saldo-besar" style="background:#00796b"><small>Total Saldo QRIS Karyawan (Terpisah dari Bank)</small><b>' + rupiah(tot) + '</b></div>' +
      (tot > 0 ? '<div class="chip-baris" style="margin-bottom:10px"><button type="button" class="chip-tombol pilih" data-aksi="tarikQrisSupir:semua">💸 Tarik Semua ke ' + esc(UANG.bankIni(S).nama) + ' (' + rupiah(tot) + ')</button></div>' : '');
    if (!listSp.length) {
      return html + '<p class="catatan">Belum ada karyawan Supir Travel. Rekrut supir travel di aplikasi <b>Travel → Supir Travel</b> agar tiap supir punya QRIS khusus untuk menerima setoran penumpang.</p>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="travel">Buka Aplikasi Travel</button></div>';
    }
    html += '<ul class="daftar pesanan">' + listSp.map(function (sp) {
      var mSp = TRAVEL.mobilUntukSupir ? TRAVEL.mobilUntukSupir(S, sp) : null;
      var ruteTxt = sp.ruteId && sp.ruteId !== 'otomatis' && RUTE.kota[sp.ruteId] ? RUTE.nama(sp.ruteId) : 'Otomatis';
      var sld = Math.max(0, Math.round(sp.qrisSaldo || 0));
      var riw = (sp.qrisRiwayat || []).slice(0, 5);
      return '<li class="kartu-pesanan"><div><b>📲 QRIS · ' + esc(sp.nama) + '</b>' +
        '<small>Kode: <b>' + esc(sp.qrisKode || 'QRIS-TRV') + '</b> · Mobil: ' + esc(mSp ? mSp.mobil.nama : '-') + ' · Rute: <b>' + esc(ruteTxt) + '</b></small>' +
        '<div class="saldo-besar" style="margin:8px 0 6px;padding:10px 12px;background:#00695c"><small>Saldo QRIS ' + esc(sp.nama) + '</small><b>' + rupiah(sld) + '</b></div>' +
        '<div class="chip-baris">' +
        (sld > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tarikQrisSupir:' + sp.id + '">💸 Tarik ' + rupiah(sld) + ' ke ' + esc(UANG.bankIni(S).nama) + '</button>' : '<small>Belum ada saldo baru yang bisa ditarik.</small>') +
        '</div>' +
        (riw.length ? '<small style="display:block;margin-top:6px"><b>Riwayat QRIS terakhir:</b></small><ul class="daftar angka" style="margin-top:4px">' + riw.map(function (r) {
          return baris(esc(r.ket) + '<small>' + namaTanggal(r.n) + '</small>', (r.jml < 0 ? '−' : '+') + rupiah(Math.abs(r.jml)), r.jml < 0 ? 'keluar' : 'masuk');
        }).join('') + '</ul>' : '') + '</div></li>';
    }).join('') + '</ul><div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol" data-app="kastravel">💼 Buka Menu Kas Travel</button></div><p class="catatan">Setiap pendapatan bersih Supir Travel masuk ke QRIS khusus karyawan masing-masing dan tidak langsung disatukan ke rekening bankmu. Biaya bensin, tol, auto-servis, ban, dan gaji supir otomatis dipotong dari Kas Travel.</p>';
    return html;
  }
  function layarKasTravel() {
    var T = TRAVEL.siapkan(S);
    if (T.autoTopupKas !== false) TRAVEL.pastikanKasTravel(S, 0);
    var sld = Math.max(0, Math.round(T.kas || 0));
    var target = T.kasTarget || TRAVEL.KAS_MIN || 50000000;
    var autoOn = T.autoTopupKas !== false;
    var mut = (T.kasMutasi || []).slice(0, 35);
    var bankNm = UANG.bankIni(S).nama;
    return kepalaApp('Kas Travel', 'Dana operasional bensin, servis & armada') + pesanApp() +
      '<div class="saldo-besar" style="background:#1565c0"><small>Saldo Kas Travel (Auto Top-Up &lt; ' + rupiah(target) + ': ' + (autoOn ? 'AKTIF ✓' : 'NONAKTIF') + ')</small><b>' + rupiah(sld) + '</b></div>' +
      '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin:8px 0;background:rgba(21,101,192,.1)">' +
      '<b>⚙️ Auto-Transfer dari Bank ' + esc(bankNm) + '</b>' +
      '<small>Semua kebutuhan bensin/SPKLU mobil, tol, kapal, servis berkala, ganti ban, pajak mobil, auto-servis karyawan supir travel, serta gaji & BPJS supir otomatis dipotong dari <b>Kas Travel</b>. Jika saldo turun di bawah <b>' + rupiah(target) + '</b>, sistem otomatis mentransfer kekurangan dari rekening bankmu (' + rupiah(S.bank.saldo) + ').</small>' +
      '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol' + (autoOn ? ' pilih' : '') + '" data-aksi="toggleAutoKasTravel:1">' + (autoOn ? '✓ Auto Top-Up < Rp50jt Aktif' : 'Aktifkan Auto Top-Up < Rp50jt') + '</button><button type="button" class="chip-tombol" data-app="travel">🚐 Aplikasi Travel</button><button type="button" class="chip-tombol" data-app="qriskaryawan">📲 QRIS Karyawan</button></div></div>' +
      '<h3 class="subjudul">Isi Manual dari Bank ' + esc(bankNm) + '</h3>' +
      '<div class="chip-baris">' + tombolUang('isiKasTravel', [10000000, 25000000, 50000000, 100000000]) + '</div>' +
      '<div class="chip-baris" style="margin-top:6px;align-items:center"><input id="in-kas-isi" class="input-teks" type="number" step="1000000" min="100000" placeholder="Nominal isi manual (Rp)" style="margin:0;flex:1"><button type="button" class="chip-tombol pilih" data-aksi="isiKasTravel:input">Transfer ke Kas</button></div>' +
      (sld > 0 ? '<h3 class="subjudul">Tarik dari Kas Travel ke Bank ' + esc(bankNm) + '</h3><div class="chip-baris">' + tombolUang('tarikKasTravel', [10000000, 50000000, 'semua']) + '</div>' : '') +
      '<h3 class="subjudul">Riwayat Mutasi Kas Travel (' + mut.length + ')</h3><ul class="daftar angka">' + (mut.length ? mut.map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada mutasi Kas Travel.</span></li>') + '</ul>';
  }
  function layarLaci() {
    return kepalaApp('Dompet', 'Uang tunai pribadi') +
      '<div class="saldo-besar" style="background:#155e57"><small>Dompet (' + esc(S.namaPemain || 'Kamu') + ')</small><b>' + rupiah(UANG.dompet(S)) + '</b></div>' + pesanApp() +
      '<p class="catatan">Uang tunai dipakai untuk bensin, makan, dan belanja harian. Tarik dari ATM atau rekening untuk mengisi dompet.</p>';
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
  function barPerasaanHtml(v) {
    var n = Math.max(0, Math.min(100, Math.round(v == null ? 50 : v)));
    var lbl = DIRI.labelPerasaan ? DIRI.labelPerasaan(n) : (n >= 85 ? 'Penuh Cinta' : n >= 60 ? 'Sayang & Terbuka' : n >= 35 ? 'Mulai Nyaman' : 'Dingin');
    return '<div style="margin:5px 0 4px"><small>💖 Bar Perasaan: <b>' + n + '%</b> (' + esc(lbl) + ')</small><div class="meteran hb" style="margin-top:3px"><i style="width:' + n + '%"></i></div></div>';
  }
  function barHbHtml(v, ketTambahan) {
    var n = Math.max(0, Math.min(100, Math.round(v == null ? 30 : v)));
    var wrn = n >= 75 ? '#d81b60' : n >= 45 ? '#ec407a' : '#f48fb1';
    return '<div style="margin:4px 0"><small>🔥 Bar HB: <b style="color:' + wrn + '">' + n + '%</b>' + (ketTambahan ? ' ' + esc(ketTambahan) : '') + '</small><div class="meteran" style="margin-top:2px"><i style="width:' + n + '%;background:' + wrn + '"></i></div></div>';
  }
  function chipTab(aksi, daftar, pilih) { return '<div class="chip-baris">' + daftar.map(function (t) { return '<button type="button" class="chip-tombol' + (t[0] === pilih ? ' pilih' : '') + '" data-aksi="' + aksi + ':' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>'; }
  function layarMotor() {
    var tab = app.motorTab || (S.motor || S.mobil ? 'garasi' : 'dealer'), m = S.motor;
    var subKend = [
      S.motor ? S.motor.nama + ((S.armadaMotor && S.armadaMotor.length > 1) ? ' (' + S.armadaMotor.length + ' unit)' : '') : '',
      S.mobil ? S.mobil.nama + ((S.armadaMobil && S.armadaMobil.length > 1) ? ' (' + S.armadaMobil.length + ' unit)' : '') : ''
    ].filter(Boolean).join(' · ') || 'Belum punya kendaraan';
    var html = kepalaApp('Kendaraan', subKend) +
      chipTab('motorTab', [['garasi', 'Garasi'], ['dealer', 'Dealer motor'], ['mobil', 'Dealer mobil'], ['bekas', 'Motor bekas']], tab) + pesanApp();
    if (tab === 'garasi') {
      var armada = S.armadaMotor || (m ? [m] : []);
      if (!armada.length && !S.mobil) return html + '<p class="catatan">Belum punya kendaraan. Beli motor atau mobil di tab Dealer (tunai, kartu kredit, kredit leasing, atau bekas) untuk mulai narik Ojol, GoCar/GrabCar, maupun Travel.</p>';
      if (armada.length > 1) {
        html += '<h3 class="subjudul">🏍️ Armada Motor (' + armada.length + ' unit · pilih motor utama)</h3><div class="chip-baris">' +
          armada.map(function (mt, idx) {
            var akt = idx === (S.motorAktif || 0);
            return '<button type="button" class="chip-tombol' + (akt ? ' pilih' : '') + '" data-aksi="pilihMotor:' + idx + '">' + (idx + 1) + '. ' + esc(mt.nama) + (akt ? ' ★ Utama' : '') + '</button>';
          }).join('') + '</div>';
      }
      if (m) {
        var listrik = m.bbm === 'listrik', hb = MOTOR.hargaBbm(S, m.bbm), oli = N.rawat.oliKm - (m.km - m.kmOli), sv = N.rawat.servisKm - (m.km - m.kmServis), banKmM = N.rawat.banKm || 18000, sisaBanM = banKmM - (m.km - (m.kmBan || 0)), pjk = MOTOR.tagihanPajak(S);
        var lamaM = Math.max(0, S.hari - (m.dibeli == null ? S.hari : m.dibeli)), nymM = RUTE.nyaman ? RUTE.nyaman(m, 'motor') : 1;
        html += '<h3 class="subjudul">' + esc(m.nama) + '</h3><div class="saldo-besar"><small>' + (listrik ? 'Baterai' : 'Bensin ' + N.bbm.nama[m.bbm]) + '</small><b>' + (listrik ? Math.round(m.baterai) + ' km' : m.isi.toFixed(1).replace('.', ',') + ' / ' + String(m.tangki).replace('.', ',') + ' L') + '</b>' + persenBar(listrik ? m.baterai / m.jarakPenuh * 100 : m.isi / m.tangki * 100) + '</div>' +
          '<ul class="daftar angka">' + baris('Odometer', Math.round(m.km).toLocaleString('id-ID') + ' km') +
          baris('Lama dimiliki', lamaM + ' hari' + (lamaM >= 30 ? ' (' + (lamaM / 30).toFixed(1).replace('.', ',') + ' bln)' : '')) +
          baris('Total penghasilan', rupiah(m.totalHasil || 0)) +
          baris('Top speed · Kenyamanan', (RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'motor') : 100) + ' km/j · ×' + nymM.toFixed(2).replace('.', ',')) +
          (listrik ? '' : baris('Konsumsi', m.kml + ' km/liter')) +
          '</ul>' + barRawat('Oli', oli, N.rawat.oliKm) + barRawat('Servis', sv, N.rawat.servisKm) + barRawat('Ban', sisaBanM, banKmM) + '<ul class="daftar angka">' +
          (m.ngelitik ? baris('Mesin', 'ngelitik, bensin kurang sesuai', 'rugi') : '') +
          baris('Peluang mogok per perjalanan', (MOTOR.peluangMogok(S) * 100).toFixed(1).replace('.', ',') + '%') +
          (m.bekas ? baris('Kondisi', 'Bekas ' + m.bekas.tahun + ', ' + m.bekas.kondisi) : '') +
          (m.kredit ? baris('Angsuran', rupiah(m.kredit.angsuran) + ' tiap tgl ' + m.kredit.tempo + ', sisa ' + m.kredit.sisa + ' bln' + (m.kredit.tunggakan ? ', nunggak ' + rupiah(m.kredit.tunggakan) : ((m.kredit.terbayarSampai || 0) >= (KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m + (KAL.tgl(S.hari).d > m.kredit.tempo ? 1 : 0)) ? ' · ✓ Bulan ini lunas' : '')), m.kredit.tunggakan ? 'rugi' : '') : '') +
          baris('Pajak tahunan', pjk ? 'jatuh tempo ' + namaTanggal(m.pajakTempo) : (m.pajakTempo - S.hari) + ' hari lagi') +
          baris('Harga jual (usia & odometer)', m.kredit ? 'lunasi kredit dulu' : rupiah(MOTOR.nilaiJual(S, m))) + '</ul>' +
          (listrik ? '' : '<p class="catatan">Isi bensin: ketuk bar Bensin di bagian atas layar.</p>') +
          '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="bukaBensin:motor">' + (listrik ? '⚡ Cek baterai' : '⛽ Isi bensin') + '</button><button type="button" class="chip-tombol" data-aksi="oli:1">Ganti oli ' + rupiah(N.rawat.oli) + '</button><button type="button" class="chip-tombol" data-aksi="servis:1">Servis ' + rupiah(N.rawat.servis) + '</button><button type="button" class="chip-tombol" data-aksi="banMotor:1">Ganti ban ' + rupiah(MOTOR.hargaBan(m)) + '</button>' +
          (pjk ? '<button type="button" class="chip-tombol" data-aksi="pajakMotor:1">Bayar pajak ' + rupiah(pjk) + '</button>' : '') +
          (m.kredit ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarCicilanMotor:1">💳 ' + (m.kredit.tunggakan ? 'Bayar Tunggakan ' + rupiah(m.kredit.tunggakan + (m.kredit.denda || 0)) : 'Bayar Cicilan ' + rupiah(m.kredit.angsuran)) + '</button><button type="button" class="chip-tombol" data-aksi="lunasMotor:1">Lunasi semua</button>' : '<button type="button" class="chip-tombol" data-aksi="jualMotor:1">Jual motor</button>') + '</div>' +
          '<h3 class="subjudul">Perlengkapan antar</h3><ul class="daftar angka">' + N.aksesoris.map(function (a) {
            return '<li><span>' + esc(a.nama) + '<small>' + esc(a.ket) + '</small></span><span>' + (m.aks[a.id] ? 'terpasang' : '<button type="button" class="chip-tombol" data-aksi="aks:' + a.id + '">' + rupiah(a.harga) + '</button>') + '</span></li>';
          }).join('') + '</ul><p class="catatan">Bensin, oli, servis, dan perlengkapan motor dibayar tunai dari dompet.</p>';
      }
      var armadaC = S.armadaMobil || (S.mobil ? [S.mobil] : []);
      if (armadaC.length > 1) {
        html += '<h3 class="subjudul">🚗 Armada Mobil (' + armadaC.length + ' unit · pilih mobil utama yang dipakai)</h3><div class="chip-baris">' +
          armadaC.map(function (mb, idx) {
            var aktC = idx === (S.mobilAktif || 0);
            return '<button type="button" class="chip-tombol' + (aktC ? ' pilih' : '') + '" data-aksi="pilihMobil:' + idx + '">' + (idx + 1) + '. ' + esc(mb.nama) + (aktC ? ' ★ Utama' : '') + '</button>';
          }).join('') + '</div>';
      }
      var c = S.mobil;
      if (c) {
        var pj = MOBIL.tagihanPajak(S), svm = N.rawatMobil.servisKm - (c.km - c.kmServis), banKmC = N.rawatMobil.banKm || 45000, sisaBanC = banKmC - (c.km - (c.kmBan || 0)), cEv = c.bbm === 'listrik';
        var lamaC = Math.max(0, S.hari - (c.dibeli == null ? S.hari : c.dibeli)), nymC = RUTE.nyaman ? RUTE.nyaman(c, 'mobil') : 1;
        html += '<h3 class="subjudul">' + esc(c.nama) + '</h3><div class="saldo-besar"><small>' + (cEv ? 'Baterai Listrik (EV)' : (c.bbm === 'solar' ? '' : 'Bensin ') + N.bbm.nama[c.bbm]) + '</small><b>' + (c.isi * c.tangki).toFixed(cEv ? 1 : 0) + ' / ' + c.tangki + (cEv ? ' kWh' : ' L') + '</b>' + persenBar(c.isi * 100) + '</div>' +
          '<ul class="daftar angka">' + baris('Odometer', Math.round(c.km).toLocaleString('id-ID') + ' km') +
          baris('Lama dimiliki', lamaC + ' hari' + (lamaC >= 30 ? ' (' + (lamaC / 30).toFixed(1).replace('.', ',') + ' bln)' : '')) +
          baris('Total penghasilan', rupiah(c.totalHasil || 0)) +
          baris('Top speed · Kenyamanan', (RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'mobil') : 170) + ' km/j · ×' + nymC.toFixed(2).replace('.', ',')) +
          (!MOBIL.pikap(S) && RUTE.pengaliKelasMobil ? baris('Kelas tarif (GoCar & Travel)', esc(RUTE.labelKelasLayanan(c)) + ' · ×' + RUTE.pengaliKelasMobil(c).toFixed(2).replace('.', ',')) : '') +
          baris('Konsumsi', cEv ? (c.kml + ' km/kWh (~' + Math.round(c.kml * c.tangki) + ' km)') : (c.kml + ' km/liter')) +
          baris(cEv ? 'Kapasitas baterai' : 'Kapasitas tangki BBM', cEv ? (c.tangki + ' kWh (~' + Math.round(c.kml * c.tangki) + ' km/cas)') : (c.tangki + ' liter (~' + Math.round(c.kml * c.tangki) + ' km penuh)')) +
          (MOBIL.pikap(S) ? '' : baris('Kapasitas kursi', TRAVEL.kursi(S, c) + ' penumpang + 1 supir')) +
          '</ul>' + barRawat('Servis', svm, N.rawatMobil.servisKm) + barRawat('Ban (4 roda)', sisaBanC, banKmC) + '<ul class="daftar angka">' + (c.ngelitik ? baris('Mesin', 'ngelitik, bensin kurang sesuai', 'rugi') : '') +
          (c.kredit ? baris('Angsuran', rupiah(c.kredit.angsuran) + ' tiap tgl ' + c.kredit.tempo + ', sisa ' + c.kredit.sisa + ' bln' + (c.kredit.tunggakan ? ', nunggak ' + rupiah(c.kredit.tunggakan) : ((c.kredit.terbayarSampai || 0) >= (KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m + (KAL.tgl(S.hari).d > c.kredit.tempo ? 1 : 0)) ? ' · ✓ Bulan ini lunas' : '')), c.kredit.tunggakan ? 'rugi' : '') : '') +
          baris('Pajak tahunan', pj ? 'jatuh tempo ' + namaTanggal(c.pajakTempo) : (c.pajakTempo - S.hari) + ' hari lagi') +
          baris('Harga jual (usia & odometer)', c.kredit ? 'lunasi kredit dulu' : rupiah(MOTOR.nilaiJual(S, c))) + '</ul>' +
          '<p class="catatan">' + (cEv ? 'Cas baterai EV: ketuk bar Bensin/Daya di bagian atas layar.' : 'Isi bensin: ketuk bar Bensin di bagian atas layar.') + '</p>' +
          '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="bukaBensin:mobil">' + (cEv ? '⚡ Cas SPKLU' : '⛽ Isi bensin') + '</button><button type="button" class="chip-tombol" data-aksi="servisMobil:1">Servis ' + rupiah(N.rawatMobil.servis) + '</button><button type="button" class="chip-tombol" data-aksi="banMobil:1">Ganti 4 ban ' + rupiah(MOBIL.hargaBan(c)) + '</button>' +
          (pj ? '<button type="button" class="chip-tombol" data-aksi="pajakMobil:1">Bayar pajak ' + rupiah(pj) + '</button>' : '') +
          (c.kredit ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarCicilanMobil:1">💳 ' + (c.kredit.tunggakan ? 'Bayar Tunggakan ' + rupiah(c.kredit.tunggakan + (c.kredit.denda || 0)) : 'Bayar Cicilan ' + rupiah(c.kredit.angsuran)) + '</button><button type="button" class="chip-tombol" data-aksi="lunasMobil:1">Lunasi semua</button>' : '<button type="button" class="chip-tombol" data-aksi="jualMobil:1">Jual mobil</button>') + '</div>' +
          (c.kredit ? '<p class="catatan" style="margin-top:4px">Cicilan mobil otomatis autodebit dari rekening tiap tanggal ' + c.kredit.tempo + '. Kamu juga bisa bayar manual lebih awal lewat tombol di atas.</p>' : '') +
          '<h3 class="subjudul">🔧 Upgrade & Modifikasi Mobil (' + esc(c.nama) + ')</h3><ul class="daftar belanja">' +
          ['mesin', 'tangki', 'efisiensi'].map(function (uj) {
            var uInfo = MOBIL.UPGRADE_INFO[uj], uLvl = (c.upg && c.upg[uj]) || 0, maksU = MOBIL.UPGRADE_MAKS || 5;
            var biayaU = MOBIL.biayaUpgrade(c, uj);
            var statSkrg = uj === 'mesin' ? ((RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'mobil') : 170) + ' km/j')
              : uj === 'tangki' ? (c.tangki + (cEv ? ' kWh' : ' L'))
              : (c.kml + (cEv ? ' km/kWh' : ' km/L'));
            return '<li><span><b>' + esc(uInfo.nama) + ' (Lv ' + uLvl + '/' + maksU + ')</b><small>Saat ini: <b>' + statSkrg + '</b> · ' + esc(uInfo.ket) + '</small>' +
              (uLvl < maksU ? '<small class="harga">' + rupiah(biayaU) + '</small>' : '<small class="harga">MAKSIMAL ✓</small>') + '</span>' +
              '<span>' + (uLvl < maksU ? '<button type="button" class="chip-tombol pilih" data-aksi="upgradeMobil:' + uj + '">Upgrade Lv ' + (uLvl + 1) + '</button>' : '<small><b>MAX</b></small>') + '</span></li>';
          }).join('') + '</ul>' +
          (MOBIL.pikap(S) ?
            '<h3 class="subjudul">Jasa Angkutan Pikap (' + esc(c.nama) + ')</h3><ul class="daftar belanja">' + (N.bisnisMobil.angkutan || []).map(function (ag) {
              return '<li><span><b>' + esc(ag.nama) + '</b><small>' + ag.km + ' km · sekitar ' + ag.jam + ' jam</small><small class="harga">Bayaran ' + rupiah(ag.bayar) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="angkutan:' + ag.id + '">Ambil</button></span></li>';
            }).join('') + '</ul>' :
            '<h3 class="subjudul">GoCar / GrabCar & Bisnis Travel Antarkota</h3>' +
            '<div class="chip-baris">' +
            '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:gojek">Mulai narik GoCar</button>' +
            '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:grab">Mulai narik GrabCar</button></div>' +
            '<h3 class="subjudul">Travel antarkota</h3><p class="catatan">Kursi penumpang: ' + Math.max(0, MOBIL.kapasitasPenumpang(S) - 1) + '. Rute, tarif, gigi kecepatan, tol, dan kapal ada di aplikasi Travel.</p><div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="travel">Buka aplikasi Travel</button></div>') +
          '<p class="catatan">Mobil bisa dipakai harian, narik GoCar/GrabCar, bisnis Travel antarkota (tarif × penumpang dikurangi bensin), atau Jasa Angkutan barang jika punya pikap seperti L300/Gran Max.</p>';
      }
      return html;
    }
    if (tab === 'dealer') {
      var kls = app.kelasMotor || 'harian', thnM = KAL.tgl(S.hari).y, bebasThnM = !!(TOWER && TOWER.bukaSemuaTahun(S));
      var listMotor = N.motor.filter(function (x) { return (x.kelas || 'harian') === kls && (bebasThnM || (x.tahun || 2023) <= thnM); });
      return html + chipTab('kelasMotor', [['harian', 'Harian'], ['sport', 'Sport'], ['moge', 'Moge']], kls) + '<ul class="daftar belanja">' + listMotor.map(function (x) {
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + (x.bbm === 'listrik' ? 'Listrik, sekitar ' + x.jarakPenuh + ' km sekali cas' : '±' + x.kml + ' km/l · ' + N.bbm.nama[x.bbm]) + ' · ' + esc(x.kelebihan) + '</small><small class="harga">' + rupiah(x.harga) + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="tunai:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiKk:' + x.id + '">Kartu kredit</button><button type="button" class="chip-tombol pilih" data-aksi="kreditPilih:' + x.id + '">Kredit</button></span></li>';
      }).join('') + '</ul><p class="catatan">Harga OTR tahun ' + thnM + (bebasThnM ? ' (Sandbox: semua tahun terbuka)' : '') + ' varian termurah. Model rilisan tahun berikutnya otomatis muncul saat tahun berganti. Bisa punya lebih dari 1 motor tanpa batas (pilih motor utama di Garasi).</p>';
    }
    if (tab === 'mobil') {
      var km2 = app.kelasMobil || 'pikap', thnC = KAL.tgl(S.hari).y, bebasThnC = !!(TOWER && TOWER.bukaSemuaTahun(S));
      var listMobil = N.mobil.filter(function (x) { return x.kelas === km2 && (bebasThnC || (x.tahun || 2023) <= thnC); });
      return html + chipTab('kelasMobil', [['pikap', 'Pikap'], ['keluarga', 'Keluarga'], ['mewah', 'Mewah'], ['sultan', 'Sultan']], km2) + '<ul class="daftar belanja">' + listMobil.map(function (x) {
        var pnpM = x.bentuk === 'pikap' ? 0 : Math.max(0, (x.kursi || (N.bisnisMobil && N.bisnisMobil.kapasitas[x.bentuk]) || 5) - 1);
        var infoTangki = x.bbm === 'listrik'
          ? ('Listrik EV · Baterai <b>' + x.tangki + ' kWh</b> (~' + Math.round(x.kml * x.tangki) + ' km/cas)')
          : ('±' + x.kml + ' km/l · ' + N.bbm.nama[x.bbm] + ' · <b>Tangki ' + x.tangki + ' L</b> (~' + Math.round(x.kml * x.tangki) + ' km)');
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + infoTangki + (pnpM > 0 ? ' · <b>' + pnpM + ' pnp</b>' : '') + ' · ' + esc(x.kelebihan) + '</small><small class="harga">' + rupiah(x.harga) + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="tunaiMobil:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiMobilKk:' + x.id + '">Kartu kredit</button><button type="button" class="chip-tombol pilih" data-aksi="kreditMobilPilih:' + x.id + '">Kredit</button></span></li>';
      }).join('') + '</ul><p class="catatan">Harga OTR tahun ' + thnC + '. Model rilisan tahun berikutnya otomatis muncul saat tahun berganti. Beli lewat <b>Kartu kredit</b> langsung LUNAS di dealer; <b>Kredit</b> memakai cicilan leasing bulanan.</p>';
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
      '<div class="bayar-baris" style="margin-top:12px"><button type="button" class="aksi" data-aksi="kreditMobil:bank">Ajukan Kredit Leasing (DP dari Rekening)</button></div>' +
      '<p class="catatan">Perkiraan: bunga flat sekitar 5% setahun plus asuransi all risk. Menunggak 3 bulan, mobil ditarik. Ingin bayar pakai Kartu Kredit tanpa leasing? Gunakan tombol <b>Kartu kredit</b> di Dealer Mobil (limit maks Rp1 Miliar).</p>';
  }
  /* ---------- aplikasi Makan & minum ---------- */
  function layarMakan() {
    var d = S.diri, dekat = d.posisi === 'kedai' ? (S.usaha && S.usaha.berhentiSewa ? 'warung pinggir jalan' : 'warung sebelah kedai') : 'warung dekat ' + DIRI.tempat(S);
    function daftarItem(list) {
      return '<ul class="daftar belanja">' + list.map(function (x) {
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + [x.kenyang ? 'kenyang +' + x.kenyang : '', x.minum ? 'minum +' + x.minum : '', x.melek ? 'stamina +' + x.melek : ''].filter(Boolean).join(' · ') + '</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol" data-aksi="beliMakan:' + x.id + '-warung">Warung ' + rupiah(DIRI.hargaItem(S, x)) + '</button><button type="button" class="chip-tombol pilih" data-aksi="beliMakan:' + x.id + '-gofood">GoFood ' + rupiah(DIRI.hargaGofood(S, x)) + '</button></span></li>';
      }).join('') + '</ul>';
    }
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    return kepalaApp('Makan & minum', 'Kenyang ' + Math.round(d.kenyang) + '% · minum ' + Math.round(d.minum) + '% · stamina ' + Math.round(d.stamina) + '%') + pesanApp() +
      '<div class="chip-baris">' +
      '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-aksi="autoMakan:1">' + (S.autoMakanMinum ? 'Auto Makan & Minum: Aktif ✓' : 'Auto Makan & Minum: Mati') + '</button>' +
      (d.posisi === 'kos' && rtAktif ? '<button type="button" class="chip-tombol pilih" data-aksi="makanRumah:1">Makan masakan rumah (Gratis!)</button>' : '') +
      '<button type="button" class="chip-tombol" data-aksi="minumAir:1">' + (DIRI.punya(S, 'dispenser') && d.posisi === 'kos' ? 'Minum dari dispenser' : 'Beli air mineral') + '</button>' +
      '</div>' +
      '<h3 class="subjudul">Makanan</h3>' + daftarItem(N.makanan) + '<h3 class="subjudul">Minuman</h3>' + daftarItem(N.minuman) +
      '<p class="catatan">Warung: beli langsung di ' + dekat + ', 10–15 menit, bayar tunai dari dompet. GoFood: diantar sekitar ' + N.makanOjol.tunggu + ' menit, harga aplikasi lebih mahal plus ongkir, bayar dari saldo QRIS atau rekening. Harga perkiraan.</p>';
  }
  /* ---------- aplikasi Driver ojol ---------- */
  function layarDriver() {
    var o = S.ojek, z = N.ojol.zona[kotaIni().zona || 1];
    var nmOnDrv = o.mode === 'mobil' ? (o.platform === 'grab' ? 'GrabCar' : 'GoCar') : (o.platform ? OJEK.platform(o.platform).nama : 'Ojol');
    var html = kepalaApp('Driver ojol', o.online ? 'Online di ' + nmOnDrv : 'Offline') + pesanApp() +
      '<div class="saldo-besar"><small>Saldo ojek (bisa ditarik)</small><b>' + rupiah(o.dompet) + '</b></div>' +
      '<ul class="daftar angka">' + baris('Hari ini', o.hariIni.trip + ' order · ' + rupiah(o.hariIni.bersih)) + baris('Total', o.total.trip + ' order · ' + rupiah(o.total.bersih)) +
      baris('Tarif zona ' + (kotaIni().zona || 1) + '<small>' + rupiah(z.minimal) + ' untuk ' + z.kmMinimal + ' km pertama, lalu ' + rupiah(z.perKm) + '/km</small>', '') + baris('Potongan aplikasi', Math.round(N.ojol.potongan * 100) + '%') + '</ul>' +
      '<h3 class="subjudul">Tarik saldo ojek & pegangan tunai</h3><div class="chip-baris">' +
      '<button type="button" class="chip-tombol pilih" data-aksi="tarikDriver:ewallet">Tarik ke E-Wallet (QRIS)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="tarikDriver:dompet">Tarik ke ATM (Dompet)</button>' +
      '<button type="button" class="chip-tombol" data-aksi="tarikDriver:bank">Tarik ke ' + esc(UANG.bankIni(S).nama) + '</button>' +
      '<button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-aksi="promo:1">' + (S.promoAktif ? 'Promo ✓' : 'Promo') + '</button>' +
      '</div>' +
      '<h3 class="subjudul">Akun Driver (Motor Ojol & Mobil GoCar/GrabCar)</h3>' +
      (S.mobil && !MOBIL.pikap(S) ? '<div class="chip-baris" style="margin-bottom:8px">' +
        (o.online && o.mode === 'mobil' && o.platform === 'gojek' ? '<span class="chip event">🚗 GoCar ONLINE</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:gojek">🚗 Mulai narik GoCar (' + esc(S.mobil.nama) + ')</button>') +
        (o.online && o.mode === 'mobil' && o.platform === 'grab' ? '<span class="chip event">🚗 GrabCar ONLINE</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:grab">🚗 Mulai narik GrabCar</button>') + '</div>' : '') +
      '<ul class="daftar pesanan">' + N.ojol.platform.map(function (pl) {
        var d = o.daftar[pl.id];
        var st = !d ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarDriver:' + pl.id + '">Daftar</button>' :
          (d.status === 'proses' ? '<span style="margin-right:6px">aktif ' + namaTanggal(d.aktifPada) + '</span>' :
            (o.online && o.mode !== 'mobil' && o.platform === pl.id ? '<span style="margin-right:6px"><b>ONLINE</b></span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineDriver:' + pl.id + '">Mulai narik</button>')) +
          '<button type="button" class="chip-tombol" data-aksi="putusDriver:' + pl.id + '">Putus kerjasama</button>';
        return '<li><span><b>' + esc(pl.app) + '</b><small>' + esc(pl.layanan.penumpang + ', ' + pl.layanan.barang + ', ' + pl.layanan.makanan) + '</small></span><span class="chip-baris" style="margin:0">' + st + '</span></li>';
      }).join('') + '</ul>' +
      (o.online ? '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="offlineDriver:1">Berhenti narik</button></div>' : '') +
      '<p class="catatan">Narik pakai motor sendiri, butuh SIM C dan STNK. Kamu menunggu order di pinggir jalan; order masuk lebih sering pagi, jam makan siang, dan pulang kerja, apalagi saat hujan. Penumpang yang bayar tunai masuk dompet, potongan aplikasinya diambil dari saldo driver. Order yang sering dilewati membuat order berikutnya lebih jarang hari itu.</p>';
    return html;
  }
  /* ---------- aplikasi Properti ---------- */
  function layarProperti() {
    var P = N.properti, daftarR = PROPERTI.daftarRumah ? PROPERTI.daftarRumah(S) : (S.properti.rumah ? [S.properti.rumah] : []);
    var rUtama = S.properti.rumah, gaji = PROPERTI.penghasilan(S), kotaPilih = app.kotaProp || S.kota;
    var html = kepalaApp('Properti', daftarR.length + ' rumah dimiliki · seluruh Indonesia') + pesanApp();
    html += '<ul class="daftar angka">' + baris('Tempat tinggal', S.rumah.jenis === 'rumah' ? esc(rUtama ? rUtama.nama + ' (' + (rUtama.lokasiTeks || PROPERTI.namaKota(rUtama.kota || S.kota)) + ')' : 'Rumah') : 'Kos ' + rupiah(S.rumah.sewa) + ' sebulan') +
      baris('Total rumah dimiliki', daftarR.length + ' unit') + baris('Penghasilan sebulan (narik)', rupiah(gaji)) + '</ul>';
    if (daftarR.length) {
      var pilihIdx = Math.min(app.rumahPropIdx || 0, daftarR.length - 1);
      html += '<h3 class="subjudul">Daftar Rumah Milikmu (' + daftarR.length + ' unit)</h3>';
      daftarR.forEach(function (r, idx) {
        var k = r.kpr, kotaR = r.kota || S.kota, dkR = PROPERTI.dataKota(S, kotaR), airEst = PROPERTI.hitungTagihanAir(S, r.tipe);
        var stTeks = r.status === 'akad' ? 'kunci ' + namaTanggal(r.kunciPada)
          : r.dihuni ? 'sedang ditempati'
          : r.sewa ? (r.sewa.mode === 'tahun' ? 'dikontrak tahunan ' + rupiah(r.sewa.tarif) + '/thn' : 'disewakan bulanan ' + rupiah(r.sewa.tarif) + '/bln')
          : 'kosong (siap huni / sewa)';
        var tfBln = PROPERTI.tarifSewa(r, 'bulan'), tfThn = PROPERTI.tarifSewa(r, 'tahun');
        html += '<div class="kartu-pesanan" style="margin-bottom:10px;padding:12px;border-radius:12px;background:' + (idx === pilihIdx ? 'rgba(138,90,43,.13);border:1px solid rgba(138,90,43,.35)' : 'rgba(0,0,0,.04)') + '">' +
          '<b>🏠 #' + (idx + 1) + ' ' + esc(r.nama) + ' · ' + esc(r.lokasiTeks || PROPERTI.namaKota(kotaR)) + '</b>' +
          '<ul class="daftar angka" style="margin-top:6px">' +
          baris('Status', stTeks) +
          baris('Harga beli · Nilai kini', rupiah(r.harga) + ' · ' + rupiah(PROPERTI.nilaiRumah(S, r))) +
          (k ? baris('Angsuran KPR<small>tiap tgl ' + k.tempo + ', sisa ' + k.sisa + ' bln' + (!k.tunggakan && (k.terbayarSampai || 0) >= (KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m + (KAL.tgl(S.hari).d > k.tempo ? 1 : 0)) ? ' · ✓ Bulan ini lunas' : '') + '</small>', rupiah(k.angsuran)) + (k.tunggakan ? baris('Tunggakan', rupiah(k.tunggakan), 'rugi') : '') : baris('Kepemilikan', 'lunas, SHM di tangan')) +
          (!r.sewa ? baris('Air ledeng (PDAM)', r.tagihanAir > 0 ? ('Belum lunas: ' + rupiah(r.tagihanAir)) : ('Lunas (±' + rupiah(airEst) + '/bln)'), r.tagihanAir > 0 ? 'rugi' : '') : baris('Air ledeng (PDAM)', 'ditanggung penyewa')) +
          baris('Jarak ke pusat kota', (dkR.jarak[r.tipe] + ((PROPERTI.WILAYAH && PROPERTI.WILAYAH[r.wilayah] && PROPERTI.WILAYAH[r.wilayah].jarakTambah) || 0)) + ' km') + '</ul>' +
          '<div class="chip-baris" style="margin-top:6px">' +
          (k ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarKpr:' + idx + '">💳 ' + (k.tunggakan > 0 ? 'Bayar Tunggakan KPR ' + rupiah(k.tunggakan) : 'Bayar Cicilan KPR ' + rupiah(k.angsuran)) + '</button>' : '') +
          (r.tagihanAir > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarAir:' + idx + '">💧 Bayar PDAM ' + rupiah(r.tagihanAir) + '</button>' : '') +
          (r.status === 'siap' && !r.dihuni && !r.sewa ? '<button type="button" class="chip-tombol pilih" data-aksi="pindahRumah:' + idx + '">Pindah ke sini' + (MOBIL.pikap(S) ? ' (pikap)' : ' (' + rupiah(P.jasaPindahan) + ')') + '</button>' : '') +
          (r.status === 'siap' && !r.dihuni && !r.sewa ? '<button type="button" class="chip-tombol pilih" data-aksi="sewaRumah:' + idx + '|bulan">Sewakan ' + rupiahPendek(tfBln) + '/bln</button><button type="button" class="chip-tombol pilih" data-aksi="sewaRumah:' + idx + '|tahun">Kontrak ' + rupiahPendek(tfThn) + '/thn</button>' : '') +
          (r.sewa ? '<button type="button" class="chip-tombol" data-aksi="hentiSewaRumah:' + idx + '">Hentikan sewa</button>' : '') +
          '<button type="button" class="chip-tombol' + (idx === pilihIdx ? ' pilih' : '') + '" data-aksi="pilihRumahProp:' + idx + '">🛋️ Ruangan & Perabot</button>' +
          (r.status === 'siap' ? '<button type="button" class="chip-tombol" data-aksi="jualRumah:' + idx + '">' + (app.yakinJualRumah === idx ? 'Yakin jual? Tap lagi' : 'Jual rumah') + '</button>' : '') +
          '</div></div>';
      });
      var rKelola = daftarR[pilihIdx];
      var ruangList = (rKelola && rKelola.ruangan) || [], ruangIdx = Math.min(app.ruangProp || 0, Math.max(0, ruangList.length - 1));
      if (ruangList.length) {
        html += '<h3 class="subjudul">Ruangan & Instalasi Perabot — #' + (pilihIdx + 1) + ' ' + esc(rKelola.nama) + '</h3><ul class="daftar angka">' +
          ruangList.map(function (rg) {
            var isiTeks = rg.isi && rg.isi.length ? rg.isi.map(function (x) { return x.nama; }).join(', ') : 'Kosongan';
            return baris(esc(rg.nama), esc(isiTeks));
          }).join('') + '</ul>' +
          '<small style="display:block;margin:8px 0 4px"><b>Pilih ruangan untuk instalasi perabot:</b></small><div class="chip-baris">' +
          ruangList.map(function (rg, rIdx) {
            return '<button type="button" class="chip-tombol' + (rIdx === ruangIdx ? ' pilih' : '') + '" data-aksi="pilihRuang:' + rIdx + '">' + esc(rg.nama) + '</button>';
          }).join('') + '</div>' +
          '<ul class="daftar belanja">' + (PROPERTI.PERABOT_RUANG || []).map(function (it) {
            return '<li><span><b>' + esc(it.nama) + '</b><small>' + esc(it.kat) + ' · pasang di ' + esc(ruangList[ruangIdx].nama) + '</small><small class="harga">' + rupiah(it.harga) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="instalRuang:' + pilihIdx + '|' + ruangIdx + '|' + it.id + '">Beli & Instal</button></span></li>';
          }).join('') + '</ul>';
      }
    }
    var tipe = app.tipeRumah || 'subsidi', tunai = !!app.rumahTunai && tipe !== 'subsidi', dp = app.dpRumah || (tipe === 'subsidi' ? P.subsidi.dp : P.komersial.dp[0]), tenor = app.tenorRumah || 20;
    var wilP = app.wilProp || 'kota', WInfo = (PROPERTI.WILAYAH && PROPERTI.WILAYAH[wilP]) || { nama: 'Pusat Kota', jarakTambah: 0, ket: '' };
    var x = PROPERTI.hitung(S, tipe, dp, tenor, tunai, kotaPilih, wilP), T = P.tipe[tipe], dkP = PROPERTI.dataKota(S, kotaPilih);
    var semuaKota = PROPERTI.daftarKota ? PROPERTI.daftarKota() : [];
    html += '<h3 class="subjudul">Beli / KPR Rumah Baru (Bisa Punya Banyak & Disewakan)</h3>' +
      '<small style="display:block;margin-bottom:6px">Pilih Kota / Kabupaten se-Indonesia (' + semuaKota.length + ' kota):</small><div class="chip-baris" style="max-height:115px;overflow-y:auto">' +
      semuaKota.map(function (kt) {
        return '<button type="button" class="chip-tombol' + (kt.id === kotaPilih ? ' pilih' : '') + '" data-aksi="kotaProp:' + kt.id + '">' + esc(kt.nama) + '</button>';
      }).join('') + '</div>' +
      '<h3 class="subjudul">Tingkat Wilayah (Kota / Kecamatan / Desa)</h3>' +
      chipTab('wilProp', [['kota', 'Pusat Kota'], ['kecamatan', 'Kecamatan (−20%)'], ['desa', 'Desa (−40%)']], wilP) +
      '<input id="in-wil-nama" class="input-teks" type="text" maxlength="32" placeholder="' + (wilP === 'desa' ? 'Nama desa (opsional, mis. Desa Suka Maju)' : wilP === 'kecamatan' ? 'Nama kecamatan (opsional, mis. Kec. Medan Baru)' : 'Nama kawasan / kelurahan (opsional)') + '" value="' + esc(app.wilNama || '') + '">' +
      '<h3 class="subjudul">Beli / KPR di ' + esc(PROPERTI.namaKota(kotaPilih)) + ' (' + esc(WInfo.nama) + ')</h3>' + chipTab('tipeRumah', [['subsidi', 'Subsidi'], ['komersial', 'Komersial'], ['mewah', 'Mewah']], tipe) +
      '<p class="catatan">' + esc(T.nama) + ' (' + T.luas + '), ' + esc(WInfo.ket) + '. Harga ' + rupiah(x.harga) + ', jarak ke pusat kota ' + (dkP.jarak[tipe] + (WInfo.jarakTambah || 0)) + ' km. Ruangan awal kosongan, bisa beli & instal kasur/AC/TV per ruangan atau disewakan bulanan/tahunan.</p>' +
      (tipe === 'subsidi' ? '' : chipTab('rumahTunai', [['0', 'KPR'], ['1', 'Tunai']], tunai ? '1' : '0')) +
      (tunai ? '' : (tipe === 'subsidi' ? '' : '<h3 class="subjudul">Uang muka</h3>' + chipTab('dpRumah', P.komersial.dp.map(function (d) { return [d, Math.round(d * 100) + '%']; }), dp)) +
        '<h3 class="subjudul">Tenor</h3>' + chipTab('tenorRumah', P[tipe === 'subsidi' ? 'subsidi' : 'komersial'].tenor.map(function (t) { return [t, t + ' tahun']; }), tenor)) +
      '<ul class="daftar angka" style="margin-top:10px">' + (tunai ? baris('Harga', rupiah(x.harga)) + baris('BPHTB 5%', rupiah(x.bphtb)) + baris('Notaris dan AJB', rupiah(x.notaris)) :
        baris('Uang muka', rupiah(x.dp)) + baris('Biaya akad (provisi, notaris, asuransi)', rupiah(x.biaya)) + baris('BPHTB', x.bphtb ? rupiah(x.bphtb) : 'bebas (rumah subsidi)') +
        baris('<b>Angsuran</b>', '<b>' + rupiah(x.angsuran) + ' sebulan</b>', 'total') + baris('Bunga<small>' + (tipe === 'subsidi' ? '5% tetap sampai lunas' : (P.komersial.bungaFix * 100).toFixed(2).replace('.', ',') + '% tetap ' + P.komersial.tahunFix + ' tahun, lalu floating ±' + (P.komersial.bungaFloating * 100).toFixed(1).replace('.', ',') + '%; angsuran jadi ±' + rupiah(x.angsuranFloating)) + '</small>', '')) +
      baris('<b>Dibayar di awal</b>', '<b>' + rupiah(x.bayarAwal) + '</b>', 'total') + '</ul>' +
      '<ul class="daftar syarat">' + PROPERTI.syarat(S, tipe, x).map(function (y) { return '<li class="' + (y.ok ? 'ok' : 'belum') + '"><span>' + (y.ok ? '✓ ' : '✗ ') + esc(y.teks) + '</span></li>'; }).join('') + '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-aksi="beliRumah:1">' + (tunai ? 'Beli tunai' : 'Ajukan KPR') + '</button></div>';
    html += '<h3 class="subjudul">Tanah kavling</h3><ul class="daftar belanja">' + P.kavling.map(function (l) {
      return '<li><span><b>Kavling ' + l + ' m²</b><small>Sertifikat SHM, pinggir kota. Ditambah BPHTB dan notaris</small><small class="harga">' + rupiah(PROPERTI.hargaTanah(S, l)) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="beliTanah:' + l + '">Beli</button></span></li>';
    }).join('') + S.properti.tanah.map(function (t, i) {
      return '<li><span><b>Tanahmu ' + t.luas + ' m²</b><small>Dibeli ' + rupiah(t.hargaBeli) + ' · nilai sekarang ' + rupiah(PROPERTI.nilaiTanah(S, t)) + '</small></span><span><button type="button" class="chip-tombol" data-aksi="jualTanah:' + i + '">Jual</button></span></li>';
    }).join('') + '</ul><p class="catatan">Harga rumah subsidi dan bunga KPR mengikuti ketentuan tahun ' + KAL.tgl(S.hari).y + '; harga rumah komersial, mewah, dan tanah mengikuti pasaran kota. Nilai tanah naik sekitar ' + Math.round(P.kenaikanTanah * 100) + '% setahun. Jual rumah atau tanah kena PPh ' + (P.pphJual * 100).toString().replace('.', ',') + '%.</p>';
    return html;
  }
  function layarKredit() {
    var x = N.motor.filter(function (m) { return m.id === app.kreditMotor; })[0], dp = app.kreditDp || 0.1, tenor = app.kreditTenor || 35, k = MOTOR.hitungKredit(x.harga, dp, tenor);
    return kepala('Kredit ' + x.nama, N.kreditMotor.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="motor" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3><div class="chip-baris">' + N.kreditMotor.dp.map(function (d) { return '<button type="button" class="chip-tombol' + (d === dp ? ' pilih' : '') + '" data-aksi="kreditDp:' + d + '">' + Math.round(d * 100) + '%</button>'; }).join('') + '</div>' +
      '<h3 class="subjudul">Tenor</h3><div class="chip-baris">' + N.kreditMotor.tenor.map(function (t) { return '<button type="button" class="chip-tombol' + (t === tenor ? ' pilih' : '') + '" data-aksi="kreditTenor:' + t + '">' + t + ' bulan</button>'; }).join('') + '</div>' +
      '<ul class="daftar angka" style="margin-top:10px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + ' sebulan</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div class="bayar-baris" style="margin-top:12px"><button type="button" class="aksi" data-aksi="kredit:bank">Ajukan Kredit Leasing (DP dari Rekening)</button></div>' +
      '<p class="catatan">Perkiraan: bunga flat sekitar 1,8% sebulan plus asuransi. Angsuran dipotong dari rekening tiap bulan; telat kena denda harian dan tercatat di riwayat kredit. Ingin bayar pakai Kartu Kredit tanpa leasing? Gunakan tombol <b>Kartu kredit</b> di Dealer Motor.</p>';
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
      '<div class="chip-baris"><button type="button" class="chip-tombol' + (meter === 'kos' ? ' pilih' : '') + '" data-aksi="meter:kos">Meteran ' + DIRI.tempat(S) + '</button></div>';
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
  function bayarPribadi(jml, ket) {
    if (UANG.bayarDompet && UANG.bayarDompet(S, jml)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true; }
    if (S.bank.saldo >= jml) { S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -jml }); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true; }
    return false;
  }
  function layarTeman() {
    var daftar = TEMAN.siap(S), g0 = app.tmGender || 'cewek', p0 = app.tmPeran || 'teman', flt = app.tmFilter || 'semua';
    var kdm = (S.kesehatan && S.kesehatan.kondom) || 0, gPem = (S.profil && S.profil.gender) || 'cowok';
    var jmlCwk = daftar.filter(function (x) { return x.gender === 'cewek'; }).length;
    var jmlCwk2 = daftar.filter(function (x) { return x.gender === 'cowok'; }).length;
    var jmlPac = daftar.filter(function (x) { return !!x.pacarId; }).length;
    var cariQ = String(app.tmCari || '').trim().toLowerCase();
    var tampilDaftar = daftar.filter(function (x) {
      if (flt === 'cewek' && x.gender !== 'cewek') return false;
      if (flt === 'cowok' && x.gender !== 'cowok') return false;
      if (flt === 'pacaran' && !x.pacarId && x.peran !== 'pacar') return false;
      if (flt === 'jomblo' && (x.pacarId || x.peran === 'pacar')) return false;
      if (cariQ) {
        var hay = (x.nama + ' ' + (x.kerja || '') + ' ' + (x.pacarNama || '') + ' ' + String(x.tglLahir || '')).toLowerCase();
        if (hay.indexOf(cariQ) < 0) return false;
      }
      return true;
    });
    var html = kepalaApp('Teman', daftar.length + ' kontak (' + jmlCwk + ' cewek · ' + jmlCwk2 + ' cowok)') + pesanApp() +
      '<h3 class="subjudul">Tambah teman</h3>' +
      '<input id="in-tm-nama" class="input-teks" type="text" maxlength="24" placeholder="Nama" value="' + esc(app.tmNama || '') + '">' +
      chipTab('tmGender', [['cewek', 'Cewek'], ['cowok', 'Cowok']], g0) + chipTab('tmPeran', [['teman', 'Teman'], ['sahabat', 'Sahabat'], ['pacar', 'Pacar']], p0) +
      '<input id="in-tm-ttl" class="input-teks" type="date" value="' + esc(app.tmTtl || '1998-01-01') + '">' +
      '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="temanTambah:1">Tambah</button></div>';
    if (!daftar.length) return html + '<p class="catatan">Belum ada teman. Istri atau suami yang diceraikan akan masuk ke sini sebagai mantan.</p>';
    html += '<h3 class="subjudul">Daftar Karakter (' + tampilDaftar.length + ' dari ' + daftar.length + ')</h3>' +
      '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><input id="in-tm-cari" class="input-teks" type="text" maxlength="24" style="margin:0;flex:1" placeholder="Cari nama, kerja, atau tahun lahir..." value="' + esc(app.tmCari || '') + '"><button type="button" class="chip-tombol pilih" data-aksi="tmCari:1">🔍 Cari</button>' + (cariQ ? '<button type="button" class="chip-tombol" data-aksi="tmCari:reset">Reset</button>' : '') + '</div>' +
      chipTab('tmFilter', [['semua', 'Semua (' + daftar.length + ')'], ['cewek', 'Cewek (' + jmlCwk + ')'], ['cowok', 'Cowok (' + jmlCwk2 + ')'], ['pacaran', '💑 Pacaran (' + jmlPac + ')'], ['jomblo', 'Lajang']], flt) +
      '<ul class="daftar pesanan">' + tampilDaftar.map(function (x) {
      var usia = KAL.usia(S.hari, x.tglLahir), lawanJenis = x.gender !== gPem;
      var bisaHb = lawanJenis && usia >= 18 && x.hubungan > TEMAN.MIN_HB;
      var prTm = Math.round(x.perasaan == null ? (x.hubungan || 45) : x.perasaan);
      var hbTm = Math.round(x.hb == null ? 30 : x.hb);
      var statusPacar = x.peran === 'pacar' ? '❤️ Pacarmu' : x.pacarId && x.pacarNama ? ('💑 Pacaran dengan ' + esc(x.pacarNama)) : 'Status: Lajang';
      var thnLahir = String(x.tglLahir || '1998-01-01').slice(0, 4);
      return '<li class="kartu-pesanan"><div style="display:flex;align-items:center;gap:10px">' + fotoWajah(x.gender === 'cowok' ? 'char-pemain' : 'char-istri', 44, 'rgba(31,138,128,.4)', x.nama, x.gender, usia, x.peran) +
        '<div><b>' + esc(x.nama) + ' (' + TEMAN.PERAN[x.peran] + ' · ' + (x.gender === 'cowok' ? 'Cowok' : 'Cewek') + ' · ' + usia + ' thn · ' + thnLahir + ')</b>' +
        '<small>' + (x.kerja ? esc(x.kerja) + ' · ' : '') + '<b>' + statusPacar + '</b></small>' +
        '<small>Hubungan: <b>' + Math.round(x.hubungan) + '%</b> · ' + (x.hubungan >= 70 ? 'baik' : x.hubungan >= 40 ? 'biasa' : 'buruk') + (x.foreplayHari === S.hari ? ' · 🔥 Foreplay siap' : '') + '</small>' +
        (x.hadiah && x.hadiah.length ? '<small>🎁 Hadiah darimu: ' + esc(x.hadiah.join(', ')) + '</small>' : '') + '</div></div>' +
        barPerasaanHtml(prTm) + barHbHtml(hbTm) +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol" data-aksi="tmInteraksi:' + x.id + '|hubungi">Hubungi</button><button type="button" class="chip-tombol" data-aksi="tmInteraksi:' + x.id + '|traktir">Traktir Rp50rb</button><button type="button" class="chip-tombol" data-aksi="tmInteraksi:' + x.id + '|ribut">Ribut</button><button type="button" class="chip-tombol pilih" data-aksi="bukaHadiah:teman|' + x.id + '">🎁 Belikan / Kredit</button></div>' +
        (lawanJenis && usia >= 18 ? '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="momenMesra:ciuman|teman|' + x.id + '">💋 Ciuman</button><button type="button" class="chip-tombol pilih" data-aksi="momenMesra:foreplay|teman|' + x.id + '">🔥 Foreplay</button></div>' : '') +
        '<div class="chip-baris">' + ['teman', 'sahabat', 'pacar', 'mantan'].filter(function (r) { return r !== 'pacar' || lawanJenis; }).map(function (r) { return '<button type="button" class="chip-tombol' + (x.peran === r ? ' pilih' : '') + '" data-aksi="tmPeranUbah:' + x.id + '|' + r + '">' + TEMAN.PERAN[r] + '</button>'; }).join('') + '</div>' +
        (lawanJenis && usia >= 18 ? '<div class="chip-baris">' + (bisaHb ? (kdm > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tmHb:' + x.id + '|1">HB (Pakai Kondom · ' + kdm + ')</button>' : '') + '<button type="button" class="chip-tombol" data-aksi="tmHb:' + x.id + '|0">HB (Tanpa Kondom)</button>' : '<small>HB terbuka kalau hubungan di atas ' + TEMAN.MIN_HB + '%.</small>') + '</div>' : '') +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input id="in-tmn-' + x.id + '" class="input-teks" type="text" maxlength="24" style="margin:0;flex:1" value="' + esc(x.nama) + '"><button type="button" class="chip-tombol pilih" data-aksi="tmNama:' + x.id + '">Simpan nama</button></div>' +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input id="in-tmt-' + x.id + '" class="input-teks" type="date" style="margin:0;flex:1" value="' + esc(x.tglLahir) + '"><button type="button" class="chip-tombol pilih" data-aksi="tmTtl:' + x.id + '">Simpan TTL</button></div>' +
        (lawanJenis && x.peran !== 'mantan' && bisaHb ? '<small style="margin-top:6px"><b>Menikah:</b></small><div class="chip-baris">' + DIRI.PAKET_NIKAH.map(function (pk) { return '<button type="button" class="chip-tombol" data-aksi="tmNikah:' + x.id + '|' + pk.id + '">' + esc(pk.nama) + ' · ' + rupiahPendek(pk.biaya) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="tmHapus:' + x.id + '">Hapus</button></div></li>';
    }).join('') + '</ul>';
    return html;
  }
  function layarToko(toko) {
    toko = app.tokoTab || 'tokopedia';
    var namaToko = 'Toko online';
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
      chipTab('tokoTab', [['tokopedia', 'Tokopedia'], ['shopee', 'Shopee']], toko) +
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
      var thnGm = KAL.tgl(S.hari).y, bebasThnG = !!(TOWER && TOWER.bukaSemuaTahun(S));
      html += chipTab('gameKonsolFilter', [['semua', 'Semua'], ['ps1', 'PS1'], ['ps2', 'PS2'], ['ps3', 'PS3'], ['ps4', 'PS4'], ['ps5', 'PS5']], filterK);
      var daftarG = (N.gameKonsol || []).filter(function (g) {
        if (filterK !== 'semua' && g.konsol !== filterK) return false;
        var milikG = !!(S.game && S.game.kaset && S.game.kaset[g.id]);
        return milikG || bebasThnG || (g.tahun || 2023) <= thnGm;
      });
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
      }).join('') + '</ul><p class="catatan">Semua kaset & Blu-ray adalah rilisan fisik original hingga tahun ' + thnGm + ' (judul rilisan tahun berikutnya muncul otomatis saat tahun berganti). PS2 bisa memutar CD original PS1, dan PS5 bisa memainkan game PS4.</p>';
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
    /* Tabungan Khusus (tidak tertarik otomatis) & Tunggakan Gaji (Maksimal 90 Hari) */
    html += '<div class="saldo-besar" style="background:#5e35b1"><small>Tabungan Khusus (Tidak tertarik otomatis oleh sistem/gaji/belanja)</small><b>' + rupiah(S.bank.tabunganGaji || 0) + '</b></div>' +
      '<div class="chip-baris" style="margin-bottom:8px">' + tombolUang('isiTabGaji', [250000, 500000, 1200000, 3000000]) +
      ((S.bank.tabunganGaji || 0) > 0 ? '<button type="button" class="chip-tombol" data-aksi="tarikTabGaji:semua">Ambil Sendiri ke Rekening</button>' : '') + '</div>';
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
    var html = kepalaApp('Gadget & Kuota', hm.nama + ' · Baterai ' + bat + '% · ' + (wifi ? 'WiFi Aktif' : 'Kuota ' + (S.hp ? S.hp.kuota.toFixed(2).replace('.', ',') : 0) + ' GB')) +
      chipTab('gadgetTab', [['data', 'Pulsa, Kuota & WiFi'], ['hp', 'HP Asli'], ['pb', '🔋 Power Bank'], ['tablap', 'Tablet & Laptop'], ['apk', 'APK & Game HP']], tab) + pesanApp();
    var pbInfoG = DIRI.pbAktifInfo ? DIRI.pbAktifInfo(S) : null;
    html += '<div class="saldo-besar" style="background:#1e88e5"><small>' + esc(hm.merek + ' ' + hm.nama) + ' (' + hm.tahun + ')' + (S.hp.pbPasang && pbInfoG ? ' · 🔋 PB ' + pbInfoG.persen + '% Tersambung' : '') + '</small><b>' + (S.hp.cas ? '⚡ Mengisi ' : '🔋 ') + bat + '% · RAM ' + hm.ram + ' GB · ROM ' + st.terpakaiRom + '/' + st.totalRom + ' GB</b>' + persenBar(bat) + '</div>' +
      '<div class="chip-baris" style="margin-bottom:10px"><button type="button" class="chip-tombol' + (S.hp.cas ? ' pilih' : '') + '" data-aksi="casHp:1">' + (S.hp.cas ? '⚡ Cabut Charger (' + hm.watt + 'W)' : '🔌 Cas HP (' + hm.mah + ' mAh · Fast Charge ' + hm.watt + 'W)') + '</button>' +
      (pbInfoG ? '<button type="button" class="chip-tombol' + (S.hp.pbPasang ? ' pilih' : '') + '" data-aksi="togglePb:1">' + (S.hp.pbPasang ? '🔋 Cabut PB (' + pbInfoG.persen + '%)' : '🔋 Sambungkan PB (' + pbInfoG.persen + '%)') + '</button>' : '') + '</div>';
    if (tab === 'data') {
      var noHp = (S.hp && S.hp.nomor) || '081256000088';
      var masaAktif = (S.hp && S.hp.masaAktif != null) ? S.hp.masaAktif : (S.hari + 30);
      var sisaHariAktif = Math.max(0, masaAktif - S.hari);
      var kuotaGb = S.hp ? (S.hp.kuota || 0) : 0;
      var kuotaPresisi = kuotaGb.toFixed(3).replace('.', ',') + ' GB (' + Math.round(kuotaGb * 1024).toLocaleString('id-ID') + ' MB)';
      html += '<ul class="daftar angka">' +
        baris('Nomor HP Kartu SIM', '<b>' + esc(noHp) + '</b>') +
        baris('Masa aktif kartu<small>Rp5rb +7 hari · Rp10rb +15 · Rp20rb +30 · Rp25rb +40 · Rp50rb +60 · Rp100rb +90</small>', namaTanggal(masaAktif) + ' (' + (sisaHariAktif > 0 ? sisaHariAktif + ' hari lagi' : 'Masa tenggang!') + ')', sisaHariAktif <= 3 ? 'rugi' : '') +
        baris('Pulsa seluler<small>untuk telepon keluarga & beli paket internet</small>', rupiah(S.hp.pulsa || 0)) +
        baris('Sisa kuota internet (presisi)<small>dipakai saat buka sosmed, WA & Google/Apple Maps ojol</small>', kuotaPresisi, kuotaGb < 1 && !wifi ? 'rugi' : '') +
        baris('Status koneksi sekarang', wifi ? 'Terhubung WiFi (Bebas Kuota)' : 'Data Seluler (Pakai Kuota)') +
        baris('WiFi di ' + DIRI.tempat(S), S.rumah.wifi ? 'Terpasang (' + rupiah(wfInfo.hargaBulan) + '/bln)' : 'Belum pasang') +
        '</ul>' +
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
    if (tab === 'pb') {
      if (pbInfoG) {
        var sisaM = Math.round(pbInfoG.state.sisaMah).toLocaleString('id-ID'), totM = pbInfoG.model.mah.toLocaleString('id-ID');
        html += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-bottom:10px;background:rgba(0,137,123,.12)">' +
          '<b>🔋 Power Bank Aktif: ' + esc(pbInfoG.model.nama) + '</b>' +
          '<small>Sisa daya: <b>' + sisaM + ' / ' + totM + ' mAh (' + pbInfoG.persen + '%)</b> · Output ' + pbInfoG.model.wattOut + 'W · Input ' + pbInfoG.model.wattIn + 'W' + (S.hp.pbCas ? ' · ⚡ Sedang dicas di rumah' : S.hp.pbPasang ? ' · 🔌 Tersambung ke HP' : '') + '</small>' +
          '<div class="meteran" style="margin:6px 0"><i style="width:' + pbInfoG.persen + '%;background:#00897b"></i></div>' +
          '<div class="chip-baris"><button type="button" class="chip-tombol' + (S.hp.pbPasang ? ' pilih' : '') + '" data-aksi="togglePb:1">' + (S.hp.pbPasang ? '🔌 Cabut dari HP' : '🔌 Sambungkan ke HP') + '</button>' +
          '<button type="button" class="chip-tombol' + (S.hp.pbCas ? ' pilih' : '') + '" data-aksi="casPb:1">' + (S.hp.pbCas ? '⚡ Stop Cas PB' : '⚡ Cas Power Bank di Rumah') + '</button></div></div>';
      }
      html += '<h3 class="subjudul">Katalog Power Bank (5.000 mAh – 100.000 mAh)</h3><ul class="daftar belanja">' +
        (N.daftarPowerBank || []).map(function (pb) {
          var milikPb = S.hp && S.hp.pbMilik && S.hp.pbMilik[pb.id];
          var aktPb = S.hp && S.hp.pbAktif === pb.id;
          var pctPb = milikPb ? Math.round((milikPb.sisaMah / pb.mah) * 100) : 100;
          return '<li><span><b>[' + esc(pb.merek) + '] ' + esc(pb.nama) + '</b>' +
            '<small>Kapasitas <b>' + pb.mah.toLocaleString('id-ID') + ' mAh</b> · Output <b>' + pb.wattOut + 'W</b> · Input ' + pb.wattIn + 'W</small>' +
            '<small>' + esc(pb.ket) + (milikPb ? ' · Sisa <b>' + Math.round(milikPb.sisaMah).toLocaleString('id-ID') + ' mAh (' + pctPb + '%)</b>' : '') + '</small>' +
            '<small class="harga">' + rupiah(pb.harga) + '</small></span>' +
            '<span class="tombol-tegak">' + (milikPb
              ? (aktPb ? '<small><b>Dipakai ✓</b></small>' : '<button type="button" class="chip-tombol pilih" data-aksi="pakaiPb:' + pb.id + '">Pakai PB ini</button>')
              : '<button type="button" class="chip-tombol pilih" data-aksi="beliPb:' + pb.id + '-bank">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliPb:' + pb.id + '-dompet">Dompet</button><button type="button" class="chip-tombol" data-aksi="beliPb:' + pb.id + '-kk">Kartu kredit</button>') +
            '</span></li>';
        }).join('') + '</ul><p class="catatan">Kapasitas Power Bank dihitung realistis (efisiensi konversi 80%): 5.000 mAh tahan ~1 hari narik ojol, 20.000 mAh ~4 hari, dan 100.000 mAh tahan ~20–25 hari narik rutin (atau 40+ hari pemakaian harian). Saat tersambung, daya HP langsung disuplai dari Power Bank!</p>';
      return html;
    }
    if (tab === 'hp' || tab === 'tablap') {
      var merekFilter = app.merekGadget || 'semua';
      if (tab === 'hp') {
        html += chipTab('merekGadget', [['semua', 'Semua'], ['jumbo', '🔋 Jumbo ≥6000mAh'], ['Unihertz', 'Unihertz'], ['Doogee', 'Doogee'], ['Oukitel', 'Oukitel'], ['ASUS', 'ASUS'], ['TECNO', 'TECNO'], ['Apple', 'Apple'], ['Samsung', 'Samsung'], ['Xiaomi', 'Xiaomi'], ['OPPO', 'OPPO'], ['Realme', 'Realme'], ['Infinix', 'Infinix'], ['Vivo', 'Vivo']], merekFilter);
      }
      var thnKini = KAL.tgl(S.hari).y, bebasThnHp = !!(TOWER && TOWER.bukaSemuaTahun(S));
      var listG = N.daftarGadget.filter(function (g) {
        if (tab === 'hp' && g.jenis !== 'hp') return false;
        if (tab === 'tablap' && g.jenis === 'hp') return false;
        var rilisG = +(g.tahunRilis || g.tahun || 2023);
        var sudahPunya = !!(S.gadget && S.gadget[g.id]);
        if (!sudahPunya && !bebasThnHp && rilisG > thnKini) return false;
        if (tab === 'hp' && merekFilter === 'jumbo') return (g.mah || 0) >= 6000;
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
          '<small class="harga">' + rupiah(g.harga) + (milik ? ' · nilai jual ' + rupiah(hJual) : '') + '</small></span>' +
          '<span class="tombol-tegak">' + (milik ?
            (g.jenis === 'hp' && !dipakai ? '<button type="button" class="chip-tombol pilih" data-aksi="pakaiHp:' + g.id + '">Pakai HP ini</button>' : dipakai ? '<small><b>Sedang dipakai ✓</b></small>' : '') +
            '<button type="button" class="chip-tombol" data-aksi="jualGadget:' + g.id + '">Jual ' + rupiah(hJual) + '</button>' :
            '<button type="button" class="chip-tombol pilih" data-aksi="beliGadget:' + g.id + '-bank">Rekening</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-dompet">Dompet</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-kk">Kartu kredit</button>') +
          '</span></li>';
      }).join('') + '</ul><p class="catatan">Katalog tahun ' + thnKini + ': hanya menampilkan seri yang sudah rilis sampai ' + thnKini + '. Seri tahun berikutnya otomatis muncul saat tahun game berganti! Spesifikasi baterai (mAh) & charger (Watt) sesuai seri asli.</p>';
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
    var tab = app.apotekTab || 'obat', ks = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1, bpjs: { kelas: 0, aktif: false, tunggakan: 0 } };
    var bp = ks.bpjs || { kelas: 0, aktif: false, tunggakan: 0 };
    var kbAktif = (ks.kbSampai || -1) >= S.hari, sisaKb = kbAktif ? (ks.kbSampai - S.hari + 1) : 0;
    var html = kepalaApp('Apotek & Rumah Sakit', 'Obat, Rumah Sakit, BPJS Kesehatan & KB') +
      chipTab('apotekTab', [['obat', 'Obat & Dokter'], ['rs', '🏥 Rumah Sakit & BPJS'], ['kb', 'Kontrasepsi & KB'], ['vitamin', 'Vitamin & P3K']], tab) + pesanApp();
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
      baris('BPJS Kesehatan', bp.kelas > 0 ? ('Kelas ' + bp.kelas + (bp.aktif ? ' (Aktif ✓)' : ' (Nonaktif · Tunggakan ' + rupiah(bp.tunggakan || 0) + ')')) : 'Belum daftar (Pasien Umum)', bp.kelas > 0 && !bp.aktif ? 'rugi' : '') +
      (S.diri.hiv ? baris('Status HIV', (ks.arvSampai >= S.hari) ? 'HIV+ (Terapi ARV aktif ' + (ks.arvSampai - S.hari + 1) + ' hr)' : 'HIV+ (Belum minum ARV — kesehatan menurun!)', (ks.arvSampai >= S.hari) ? '' : 'rugi') : '') +
      baris('Stok pengaman (Kondom)', (ks.kondom || 0) + ' pcs' + (ks.kondomGerigi ? ' (termasuk ' + ks.kondomGerigi + ' bergerigi)' : '')) +
      baris('Perlindungan KB (Pil/Suntik)', kbAktif ? 'Aktif (' + sisaKb + ' hari lagi)' : 'Tidak aktif') + '</ul>';
    if (tab === 'rs') {
      var jmlOrg = 1 + (S.keluarga ? S.keluarga.length : 0);
      var kInfo = (DIRI.BPJS_KELAS && DIRI.BPJS_KELAS[bp.kelas]) || { nama: 'Umum', iuran: 0, diskon: 0 };
      html += '<div class="saldo-besar" style="background:' + (bp.aktif ? '#00875a' : '#8a5a2b') + '"><small>Status Kepesertaan JKN / BPJS Kesehatan (' + jmlOrg + ' orang)</small>' +
        '<b>' + esc(kInfo.nama) + (bp.kelas > 0 ? (bp.aktif ? ' · Aktif' : ' · Nonaktif') : '') + '</b></div>' +
        (bp.tunggakan > 0 ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-aksi="lunasBpjs:1">Lunasi Tunggakan BPJS ' + rupiah(bp.tunggakan) + '</button></div>' : '') +
        '<h3 class="subjudul">Pilih / Ubah Kelas BPJS Kesehatan (Iuran Resmi per Orang / Bulan)</h3>' +
        '<div class="chip-baris">' +
        [3, 2, 1, 0].map(function (kls) {
          var bki = DIRI.BPJS_KELAS[kls];
          return '<button type="button" class="chip-tombol' + (bp.kelas === kls ? ' pilih' : '') + '" data-aksi="daftarBpjs:' + kls + '">' +
            (kls === 0 ? 'Umum (Rp0)' : 'Kelas ' + kls + ' · ' + rupiahPendek(bki.iuran * jmlOrg) + '/bln') + '</button>';
        }).join('') + '</div>' +
        '<p class="catatan" style="margin-top:4px">Kelas 3: Rp35rb/org/bln (diskon RS 88%) · Kelas 2: Rp100rb/org/bln (diskon 92%) · Kelas 1: Rp150rb/org/bln (diskon 95%). Iuran otomatis dipotong tiap tanggal 1.</p>' +
        '<h3 class="subjudul">🏥 Layanan Masuk Rumah Sakit (IGD, Rawat Inap & Operasi)</h3><ul class="daftar belanja">' +
        (DIRI.LAYANAN_RS || []).map(function (l) {
          var hSkrg = DIRI.hargaRs(S, l.id), hemat = l.umum - hSkrg;
          var tombolPasien = '<button type="button" class="chip-tombol pilih" data-aksi="masukRs:' + l.id + '|pemain">Rawat Kamu</button>' +
            (S.keluarga || []).filter(function (kl) { return !!kl.sakit; }).map(function (kl) {
              return '<button type="button" class="chip-tombol" data-aksi="masukRs:' + l.id + '|' + kl.id + '">Rawat ' + esc(kl.nama) + '</button>';
            }).join('');
          return '<li><span><b>' + esc(l.nama) + '</b><small>' + l.jam + ' jam · ' + esc(l.ket) + '</small>' +
            '<small class="harga">' + (hemat > 0 ? '<s>' + rupiah(l.umum) + '</s> <b>' + rupiah(hSkrg) + '</b> <em class="turun">(BPJS Kls ' + bp.kelas + ')</em>' : rupiah(l.umum) + ' (Tarif Umum)') + '</small></span>' +
            '<span class="tombol-tegak">' + tombolPasien + '</span></li>';
        }).join('') + '</ul>' +
        '<p class="catatan">Jika kondisi kesehatanmu drop di bawah 15%, kamu akan otomatis dilarikan ke IGD Rumah Sakit! Punya BPJS aktif membuat biaya rumah sakit jauh lebih hemat.</p>';
      return html;
    }
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
    var pas = daftarPas[0] || null;
    var ks = S.kesehatan || { kondom: 0, kondomGerigi: 0, kbSampai: -1 }, kbAktif = (ks.kbSampai || -1) >= S.hari;
    var noHp = (S.hp && S.hp.nomor) || '081256000088';
    var kTab = app.kelTab || 'nafkah';
    var sisaHariN = DIRI.sisaHariNafkah ? DIRI.sisaHariNafkah(S) : 1;
    var blnIniKel = KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m;
    var sudahNafkahBln = (S.nafkahTerbayarSampai || 0) >= blnIniKel;
    var blnKosongN = S.bulanTanpaNafkah || 0;
    var sumberB = app.sumberBayar || 'suami';
    var html = kepalaApp('Keluarga', kel.length + ' anggota · HB ' + Math.round(S.diri.hb || 0) + '% · Kondom ' + (ks.kondom || 0)) +
      chipTab('kelTab', [['nafkah', '💝 Nafkah & Jalan'], ['pasangan', '❤️ Pasangan'], ['anggota', '👨‍👩‍👧 Anggota (' + kel.length + ')'], ['tambah', '➕ Tambah & WA']], kTab) + pesanApp();

    if (kTab === 'nafkah') {
      if (pas) {
        if (prPemain === 'cowok') {
          html += '<div class="kartu-pesanan" style="margin-bottom:8px;padding:10px 12px;border-radius:12px;background:' + (blnKosongN > 0 ? 'rgba(217,68,58,.14);border:1px solid rgba(217,68,58,.4)' : 'rgba(31,138,128,.12);border:1px solid rgba(31,138,128,.3)') + '">' +
            '<b>' + (blnKosongN > 0 ? ('⚠️ Tanpa Nafkah ' + blnKosongN + '/6 Bulan!') : sudahNafkahBln ? '💝 Nafkah Bulan Ini Terpenuhi ✓' : '💝 Nafkah Bulanan (Nominal Bebas)') + '</b>' +
            '<small>Sisa bulan ini: <b>' + sisaHariN + ' hr</b> · Bebas nominal (min Rp50rb). Tidak memberi nafkah 1–6 bln menurunkan keharmonisan bertahap hingga <b>0%</b>.</small>' +
            '<div class="grid-nominal">' +
            [100000, 250000, 500000, 1000000, 2000000, 5000000].map(function (nom) {
              return '<button type="button" class="chip-tombol' + (nom === 500000 ? ' pilih' : '') + '" data-aksi="bayarNafkah:' + nom + '">' + labelNominal(nom) + '</button>';
            }).join('') + '</div>' +
            '<div class="chip-baris" style="margin-top:6px;align-items:center"><input id="in-nafkah" class="input-teks" type="number" step="50000" min="50000" placeholder="Nominal bebas (Rp)" style="margin:0;flex:1;padding:7px 10px"><button type="button" class="chip-tombol pilih" data-aksi="bayarNafkah:input">Kirim</button></div></div>';
        } else {
          html += '<div class="kartu-pesanan" style="margin-bottom:8px;padding:10px 12px;border-radius:12px;background:rgba(31,138,128,.12)">' +
            '<b>💝 Nafkah dari ' + esc(pas.nama) + '</b><small>Sisa waktu: <b>' + sisaHariN + ' hari lagi</b> (tiap tgl 1). Makan di rumah gratis.</small></div>';
        }
      } else {
        html += '<p class="catatan">Belum punya pasangan. Tambah pasangan di tab <b>Tambah & WA</b> atau nikahi pacar di menu <b>Teman</b>.</p>';
      }
      if (S.mobil && !MOBIL.pikap(S) && kel.length) {
        html += '<h3 class="subjudul">🚗 Jalan-jalan Keluarga (' + esc(S.mobil.nama) + ')</h3><ul class="daftar belanja">' +
          (DIRI.JALAN_KELUARGA || []).map(function (jk) {
            return '<li><span><b>' + esc(jk.nama) + '</b><small>' + jk.km + ' km · ' + jk.jam + ' jam · Bahagia +' + jk.bahagia + '%</small><small class="harga">' + rupiah(jk.biaya) + '</small></span>' +
              '<span><button type="button" class="chip-tombol pilih" data-aksi="jalanKel:' + jk.id + '">Berangkat</button></span></li>';
          }).join('') + '</ul>';
      }
      if (S.cicilanHadiah && S.cicilanHadiah.length) {
        var blnNextK = KAL.tgl(S.hari).y * 12 + KAL.tgl(S.hari).m + 1;
        html += '<h3 class="subjudul">🎁 Cicilan Hadiah (' + S.cicilanHadiah.length + ')</h3><ul class="daftar angka">' +
          S.cicilanHadiah.map(function (ch, idxH) {
            var lunasBlnH = (ch.terbayarSampai || 0) >= blnNextK;
            return '<li><span>' + esc(ch.nama) + '<small>' + esc(ch.untuk) + ' · sisa ' + ch.sisa + ' bln' + (lunasBlnH ? ' · ✓ Lunas bln depan' : '') + '</small></span>' +
              '<span><button type="button" class="chip-tombol" data-aksi="bayarHadiah:' + idxH + '">💳 ' + rupiahPendek(ch.angsuran) + '</button></span></li>';
          }).join('') + '</ul>';
      }
      return html;
    }

    if (kTab === 'pasangan') {
      html += '<div class="saldo-besar" style="background:#c2185b"><small>Kondom: ' + (ks.kondom || 0) + (ks.kondomGerigi ? ' (' + ks.kondomGerigi + ' gerigi)' : '') + (kbAktif ? ' · KB Aktif' : '') + ' · Kesehatan ' + Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + '%' + (S.diri.rasaBersalah ? ' · Bersalah ' + Math.round(S.diri.rasaBersalah) + '%' : '') + (S.diri.hiv ? ' · ⚠️ HIV+' : '') + '</small>' +
        '<b>HB Kamu ' + Math.round(S.diri.hb || 0) + '%</b>' + persenBar(S.diri.hb || 0) + '</div>';
      if (daftarPas.length) {
        daftarPas.forEach(function (ps, idxP) {
          var hIbu = ps.hamil || S.diri.hamil;
          var ketHamil = hIbu && hIbu.terdeteksi ? ' · 🤰 Hamil ' + Math.max(1, Math.floor((S.hari - hIbu.mulai) / 7)) + ' mgg' : '';
          var hbPs = Math.round(ps.hb == null ? 35 : ps.hb);
          var prPs = Math.round(ps.perasaan == null ? 75 : ps.perasaan);
          html += '<div class="kartu-pesanan" style="margin-bottom:8px;padding:10px 12px;border-radius:12px;background:rgba(194,24,91,.09)">' +
            '<b>❤️ ' + esc(ps.nama) + ' (' + DIRI.labelPeran(S, ps) + (daftarPas.length > 1 ? ' #' + (idxP + 1) : '') + ')' + esc(ketHamil) + (ps.foreplayHari === S.hari ? ' · 🔥 Foreplay' : '') + '</b>' +
            '<small>Bahagia: <b>' + Math.round(ps.bahagia || 90) + '%</b> · Dompet: <b>' + rupiahPendek(ps.dompet || 0) + '</b> · Tab: <b>' + rupiahPendek(ps.tabungan || 0) + '</b>' + (S.utangPasangan ? ' · Utang: <b>' + rupiahPendek(S.utangPasangan) + '</b>' : '') + '</small>' +
            barPerasaanHtml(prPs) + barHbHtml(hbPs, hbPs >= 65 ? '(Ingin HB malam!)' : '') +
            '<div class="chip-baris" style="margin-top:6px">' +
            '<button type="button" class="chip-tombol pilih" data-aksi="momenMesra:ciuman|keluarga|' + ps.id + '">💋 Ciuman</button>' +
            '<button type="button" class="chip-tombol pilih" data-aksi="momenMesra:foreplay|keluarga|' + ps.id + '">🔥 Foreplay</button>' +
            '<button type="button" class="chip-tombol pilih" data-aksi="hbTarget:1|' + ps.id + '">HB Kondom (' + (ks.kondom || 0) + ')</button>' +
            '<button type="button" class="chip-tombol" data-aksi="hbTarget:0|' + ps.id + '">HB Tanpa Kondom</button>' +
            '<button type="button" class="chip-tombol" data-app="apotek">Beli KB</button></div>' +
            '<details class="kartu-lipat"><summary>💸 Pinjam & Minta Bantuan Dana</summary><div class="chip-baris">' +
            '<button type="button" class="chip-tombol" data-aksi="pinjamPas:' + ps.id + '|500000">Pinjam 500rb</button>' +
            '<button type="button" class="chip-tombol" data-aksi="pinjamPas:' + ps.id + '|2000000">Pinjam 2jt</button>' +
            (S.utangPasangan > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarUtangPas:1">Lunasi Utang</button>' : '') +
            '<button type="button" class="chip-tombol" data-aksi="mintaBantu:1000000">Bantu 1jt</button>' +
            '<button type="button" class="chip-tombol" data-aksi="mintaBantu:semua">Bantu Semua</button></div></details></div>';
        });
      } else {
        html += '<p class="catatan">Belum punya pasangan sah. Buka tab <b>Tambah & WA</b> atau aplikasi <b>Teman</b>.</p>';
      }
      var kesSkrg = Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan);
      html += '<details class="kartu-lipat" style="background:rgba(217,68,58,.08)"><summary>🔥 Hiburan Malam / Jajan Nakal (PSK · Rp300rb)</summary>' +
        '<small>HB bar turun 0%, namun berisiko Rasa Bersalah, Cerai, & HIV (' + (kesSkrg < 50 ? '89% tanpa kondom / 30% kondom' : '18% tanpa kondom / 1,3% kondom') + ').</small>' +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol" data-aksi="hbTarget:1|psk">Kondom (' + (ks.kondom || 0) + ')</button>' +
        '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="hbTarget:0|psk">Tanpa Kondom</button></div></details>';
      return html;
    }

    if (kTab === 'anggota') {
      if (!kel.length) return html + '<p class="catatan">Belum ada anggota keluarga. Tambahkan di tab <b>➕ Tambah & WA</b>.</p>';
      html += '<small style="display:block;margin-bottom:4px"><b>Sumber bayar sekolah, kuliah & kebutuhan:</b></small>' +
        chipTab('sumberBayar', [['suami', 'Sendiri'], ['istri', 'Pasangan'], ['patungan', 'Patungan 50/50']], sumberB) +
        '<ul class="daftar pesanan">' + kel.map(function (kl) {
          var usia = KAL.usia(S.hari, kl.tglLahir), isPas = DIRI.adalahPasangan(kl), isIpar = DIRI.adalahIpar && DIRI.adalahIpar(kl), peranLabel = DIRI.labelPeran(S, kl);
          var jk = kl.gender === 'cewek' ? 'Cewek' : 'Cowok';
          var teksHamil = kl.hamil && kl.hamil.terdeteksi ? ' · 🤰 Hamil ' + Math.max(1, Math.floor((S.hari - kl.hamil.mulai) / 7)) + ' mgg' : '';
          var teksSakit = kl.sakit ? ' · 🤒 ' + kl.sakit.nama : '';
          var bisaKontak = isPas || isIpar || usia >= 10;
          var tombolKontak = bisaKontak
            ? '<button type="button" class="chip-tombol pilih" data-aksi="kirimPesanKel:' + kl.id + '|wa">💬 WA</button>' +
              '<button type="button" class="chip-tombol" data-aksi="kirimPesanKel:' + kl.id + '|telepon">📞 Telp</button>'
            : '';
          var prKl = Math.round(kl.perasaan == null ? (isPas ? 75 : isIpar ? 50 : 75) : kl.perasaan);
          var gelarDisp = (isPas && kl.gelar) ? ' (' + kl.gelar + ')' : '';
          var subRingkas = isPas
            ? ((kl.kerja ? 'Kerja: ' + kl.kerja.nama + ' (' + rupiahPendek(kl.kerja.gaji) + ')' : 'Di rumah') + (kl.kuliah ? ' · Kuliah ' + kl.kuliah.nama : ''))
            : (isIpar ? ('Ipar · ' + (kl.aktivitas === 'kerja' ? 'Bekerja' : 'Di rumah')) : (kl.sekolah ? 'Sekolah: ' + kl.sekolah.nama : (kl.kuliah ? 'Kuliah: ' + kl.kuliah.nama : usia + ' thn')));
          var isiLipat = '<div style="display:flex;gap:5px;align-items:center;margin-bottom:5px"><input id="in-nama-' + esc(kl.id) + '" class="input-teks" type="text" maxlength="24" style="margin:0;flex:1;padding:6px 8px" value="' + esc(kl.nama) + '"><button type="button" class="chip-tombol pilih" data-aksi="simpanNamaKel:' + kl.id + '">Nama</button></div>' +
            '<div style="display:flex;gap:5px;align-items:center;margin-bottom:6px"><input id="in-ttl-' + esc(kl.id) + '" class="input-teks" type="date" style="margin:0;flex:1;padding:6px 8px" value="' + esc(kl.tglLahir) + '"><button type="button" class="chip-tombol pilih" data-aksi="simpanTtlKel:' + kl.id + '">TTL</button></div>';
          if (isPas) {
            isiLipat += '<small><b>Kuliah Pasangan:</b></small><div class="chip-baris">' +
              (N.pendidikanPasangan || []).map(function (jr) {
                var sdh = (kl.lulus || []).indexOf(jr.id) >= 0, jln = kl.kuliah && kl.kuliah.id === jr.id;
                return '<button type="button" class="chip-tombol' + (jln || sdh ? ' pilih' : '') + '" data-aksi="kuliahPas:' + kl.id + '|' + jr.id + '">' + esc(jr.nama.split(' / ')[0]) + (sdh ? ' ✓' : jln ? ' (Smt ' + kl.kuliah.semester + ')' : ' ' + rupiahPendek(jr.ukt)) + '</button>';
              }).join('') + '</div><small style="margin-top:5px"><b>Izin Kerja:</b></small><div class="chip-baris">' +
              '<button type="button" class="chip-tombol' + (!kl.kerja ? ' pilih' : '') + '" data-aksi="kerjaPas:' + kl.id + '|berhenti">Di rumah</button>' +
              (N.kerjaPasangan || []).map(function (kj) {
                var aktifK = kl.kerja && kl.kerja.id === kj.id, punyaGelar = !kj.butuh || (kl.lulus || []).indexOf(kj.butuh) >= 0;
                return '<button type="button" class="chip-tombol' + (aktifK ? ' pilih' : '') + '"' + (punyaGelar ? '' : ' style="opacity:.55"') + ' data-aksi="kerjaPas:' + kl.id + '|' + kj.id + '">' + esc(kj.nama.split(' (')[0]) + ' (' + rupiahPendek(kj.gaji) + ')</button>';
              }).join('') + '</div><div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol bahaya-kecil" data-aksi="ceraiPas:' + kl.id + '">💔 Cerai</button></div>';
          } else {
            var akt = kl.aktivitas || 'rumah';
            var sekCocok = (N.sekolahAnak || []).filter(function (sk) { return usia >= sk.minUsia && usia <= sk.maksUsia + 2; });
            isiLipat += '<small><b>Jajan Harian:</b></small><div class="chip-baris">' + [10000, 20000, 50000, 100000].map(function (v) { return '<button type="button" class="chip-tombol' + (kl.jajanRp === v ? ' pilih' : '') + '" data-aksi="jajanKel:' + kl.id + '|' + v + '">' + labelNominal(v) + (kl.jajanRp === v ? ' ✓' : '') + '</button>'; }).join('') + '</div>';
            if (sekCocok.length) {
              isiLipat += '<small style="margin-top:5px"><b>Sekolah:</b></small><div class="chip-baris">' + sekCocok.map(function (sk) {
                var aktifS = kl.sekolah && kl.sekolah.id === sk.id;
                return '<button type="button" class="chip-tombol' + (aktifS ? ' pilih' : '') + '" data-aksi="sekolahAnak:' + kl.id + '|' + sk.id + '">' + esc(sk.nama) + (aktifS ? ' ✓' : ' ' + rupiahPendek(sk.pangkal)) + '</button>';
              }).join('') + '</div>';
            }
            if (usia >= 17) {
              isiLipat += '<div class="chip-baris" style="margin-top:5px"><button type="button" class="chip-tombol' + (akt === 'rumah' ? ' pilih' : '') + '" data-aksi="aktivitasKel:' + kl.id + '|rumah">Di rumah</button><button type="button" class="chip-tombol' + (akt === 'kerja' ? ' pilih' : '') + '" data-aksi="aktivitasKel:' + kl.id + '|kerja">Bekerja</button></div>' +
                '<small style="margin-top:5px"><b>Kuliah:</b></small><div class="chip-baris">' + (N.pendidikanPasangan || []).map(function (jr) {
                  var sdh2 = (kl.lulus || []).indexOf(jr.id) >= 0, jln2 = kl.kuliah && kl.kuliah.id === jr.id;
                  return '<button type="button" class="chip-tombol' + (jln2 || sdh2 ? ' pilih' : '') + '" data-aksi="kuliahPas:' + kl.id + '|' + jr.id + '">' + esc(jr.nama.split(' / ')[0]) + (sdh2 ? ' ✓' : jln2 ? ' (Smt ' + kl.kuliah.semester + ')' : ' ' + rupiahPendek(jr.ukt)) + '</button>';
                }).join('') + '</div>';
            }
            if (isIpar) {
              isiLipat += '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol" data-aksi="momenMesra:ciuman|keluarga|' + kl.id + '">💋 Ciuman</button><button type="button" class="chip-tombol" data-aksi="momenMesra:foreplay|keluarga|' + kl.id + '">🔥 Foreplay</button><button type="button" class="chip-tombol" data-aksi="hbTarget:1|ipar:' + kl.id + '">HB Kondom</button><button type="button" class="chip-tombol" data-aksi="hbTarget:0|ipar:' + kl.id + '">HB Tanpa</button>' + (kl.gender === 'cewek' ? '<button type="button" class="chip-tombol pilih" data-aksi="ubahStatusKel:' + kl.id + '-istri">Nikahi jadi Istri</button>' : '') + '</div>';
            }
          }
          var fotoKel = isPas ? srcPasangan() : isIpar ? 'char-adik-ipar' : 'char-anak';
          return '<li class="kartu-pesanan"><div style="display:flex;align-items:center;gap:9px">' + fotoWajah(fotoKel, 42, 'rgba(194,24,91,.35)', kl.nama, kl.gender, usia, kl.peran) + '<div style="min-width:0;flex:1"><b>' + esc(kl.nama) + esc(gelarDisp) + ' · ' + peranLabel + ' (' + usia + ' thn)' + esc(teksHamil) + esc(teksSakit) + '</b>' +
            '<small>' + esc(subRingkas) + ' · Bahagia <b>' + Math.round(kl.bahagia || 85) + '%</b> · Perasaan ' + prKl + '%</small></div></div>' +
            (isPas || isIpar || usia >= 17 ? barHbHtml(kl.hb == null ? 30 : kl.hb) : '') +
            (kl.ketahuan ? '<div class="kartu-pesanan" style="margin-top:4px;background:rgba(200,40,60,.12)"><b>Ketahuan bersama ' + esc(kl.ketahuan.dengan) + ' (' + (kl.ketahuan.tempat === 'hotel' ? 'hotel' : 'rumah') + ').</b><div class="chip-baris"><button type="button" class="chip-tombol" data-aksi="konfrontasi:' + kl.id + '|maaf">Maafkan</button><button type="button" class="chip-tombol bahaya-kecil" data-aksi="konfrontasi:' + kl.id + '|cerai">Ceraikan</button></div></div>' : '') +
            '<div class="chip-baris" style="margin-top:4px">' + tombolKontak +
            '<button type="button" class="chip-tombol pilih" data-aksi="bukaHadiah:keluarga|' + kl.id + '">🎁 Hadiah</button>' +
            '<button type="button" class="chip-tombol" data-aksi="bayarKeb:' + kl.id + '|' + sumberB + '">💸 Kebutuhan 500rb</button>' +
            (isPas && TEMAN.sedangKeluar(kl, S) && kl.keluar.alasan !== 'kerja' ? '<button type="button" class="chip-tombol pilih" data-aksi="suruhPulang:' + kl.id + '">Suruh pulang</button>' : '') +
            (kl.sakit ? '<button type="button" class="chip-tombol pilih" data-app="apotek">Obati</button>' : '') +
            '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="hapusKel:' + kl.id + '">Hapus</button></div>' +
            '<details class="kartu-lipat"><summary>⚙️ Edit Profil, Pendidikan, Kerja & Lainnya</summary>' + isiLipat + '</details></li>';
        }).join('') + '</ul>';
      return html;
    }

    /* kTab === 'tambah' */
    html += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px">' +
      '<b>➕ Tambah Karakter Keluarga</b>' +
      '<input id="in-kel-nama" class="input-teks" type="text" maxlength="22" placeholder="Nama (mis. Rina / Budi / Rafa)" value="' + esc(app.kelNama || '') + '">' +
      '<div class="chip-baris" style="margin:6px 0">' +
      [['istri', 'Istri'], ['suami', 'Suami'], ['anak', 'Anak'], ['adik_ipar', 'Adik Ipar'], ['kakak_ipar', 'Kakak Ipar']].map(function (st) {
        return '<button type="button" class="chip-tombol' + (pBaru === st[0] ? ' pilih' : '') + '" data-aksi="kelPeran:' + st[0] + '">' + st[1] + '</button>';
      }).join('') + '</div>' +
      (pBaru !== 'istri' && pBaru !== 'suami' ? '<div class="chip-baris" style="margin-bottom:6px"><button type="button" class="chip-tombol' + (gBaru === 'cewek' ? ' pilih' : '') + '" data-aksi="kelGender:cewek">Cewek</button><button type="button" class="chip-tombol' + (gBaru === 'cowok' ? ' pilih' : '') + '" data-aksi="kelGender:cowok">Cowok</button></div>' : '') +
      '<small>Tanggal Lahir (Tahun game: ' + thn + ')</small><input id="in-kel-ttl" class="input-teks" type="date" value="' + esc(app.kelTtl || (pBaru === 'anak' ? '2020-06-15' : pBaru === 'adik_ipar' ? '2003-04-12' : '1999-08-20')) + '">' +
      '<div style="margin-top:8px"><button type="button" class="aksi kecil" data-aksi="tambahKeluarga:1">Tambah ke Keluarga</button></div></div>';
    var logPesan = S.pesanKeluarga || [];
    if (logPesan.length) {
      html += '<h3 class="subjudul">💬 Pesan & Telepon (' + esc(noHp) + ')</h3><ul class="daftar pesanan">' +
        logPesan.slice(0, 6).map(function (pm) {
          return '<li class="kartu-pesanan"><div><b>' + esc(pm.dari) + ' · <span style="color:#155e57">' + esc(pm.jenis) + '</span></b>' +
            '<small>' + namaTanggal(pm.hari) + ' · ' + jam(pm.jam || 600) + '</small><small>' + esc(pm.teks) + '</small></div></li>';
        }).join('') + '</ul>';
    }
    return html;
  }

  function layarPasarPokok() {
    var pas = DIRI.pasanganAktif(S), rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var html = kepalaApp('Pasar Pokok Rumah Tangga', pas ? 'Bisa belanja sendiri atau suruh ' + pas.nama : 'Belanja kebutuhan dapur rumah') + pesanApp() +
      '<div class="saldo-besar" style="background:#d87a16"><small>Stok Dapur & Kebutuhan Pokok Rumah Tangga</small><b>' +
      (rtAktif ? 'Cukup untuk makan gratis s/d ' + namaTanggal(S.rumahTangga.aktifSampai) : 'Stok dapur kosong · Belanja sekarang') + '</b></div>' +
      '<p class="catatan" style="margin-top:4px;margin-bottom:8px">Pembayaran hanya memakai <b>Dompet Pribadi</b> atau <b>Rekening Bank</b> . Jika menyuruh pasangan belanja, kamu tidak kehilangan waktu kerja!</p>' +
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
        '<span><button type="button" class="chip-tombol' + (x.aktif ? ' pilih' : '') + '"' + (x.terkunciSupir ? ' disabled style="opacity:.5"' : '') + ' data-aksi="sewaBarang:' + x.kunci + '">' + (x.terkunciSupir ? 'Dipakai Supir' : x.aktif ? 'Disewakan ✓' : 'Sewakan') + '</button></span></li>';
    }).join('') + '</ul>' +
      '<p class="catatan">Barang yang disewakan menghasilkan uang sewa harian yang otomatis masuk ke rekening bank setiap pagi dan tercatat di Kabar Pagi serta Closing Harian.</p>';
    return html;
  }

  var NAMA_BAYAR = { tunai: function () { return 'Bayar tunai dari dompet'; }, dompet: function () { return 'Bayar dari dompet pribadi'; }, qris: function () { return 'Bayar pakai saldo QRIS'; },
    transfer: function () { var bf = UANG.biayaTransfer(S); return 'Transfer dari ' + UANG.bankIni(S).nama + (bf ? ' (+' + rupiah(bf) + ')' : ' (gratis)'); },
    kk: function () { return 'Kartu kredit ' + UANG.bankIni(S).nama + (S.kk && S.kk.status === 'aktif' ? ' (sisa ' + rupiahPendek(UANG.sisaLimitKk(S)) + ')' : ' (belum aktif)'); },
    tempo: function () { return 'Pesan, bayar 14 hari lagi'; } };
  function layarBelanja() {
    if (S.usaha && S.usaha.berhentiSewa) {
      return kepalaApp('Belanja', 'Tidak aktif di mode driver') + pesanApp() +
        '<p class="catatan">Kebutuhan pokok rumah tangga kini otomatis diurus pasangan dari uang nafkah bulanan di menu Keluarga.</p>';
    }
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
    return '<button type="button" class="aksi kecil" data-aksi="beli:tunai-sendiri">' + 'Bayar dari Dompet' + '</button>' +
      '<button type="button" class="aksi kecil" data-aksi="beli:dompet-sendiri">Bayar dari Dompet pribadi</button>' +
      '<button type="button" class="aksi kecil" data-aksi="beli:transfer-sendiri">Bayar dari Rekening ' + esc(UANG.bankIni(S).nama) + '</button>' +
      (k ? '<button type="button" class="aksi kecil" data-aksi="beli:tunai-karyawan">Suruh ' + esc(k.nama) + ' (ojek ' + rupiah(STOK.TEMPAT.pasar.ongkos) + ')</button>' : '');
  }
  function layarStok() {
    if (S.usaha && S.usaha.berhentiSewa) {
      return kepalaApp('Stok kedai', 'Kedai sedang tidak disewa') +
        '<p class="catatan">Saat tidak menyewa atau memiliki toko, bahan-bahan makanan dan minuman kedai disembunyikan (tidak akan rusak atau basi) sampai kamu membuka/menyewa kembali toko di menu Usaha.</p>';
    }
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
    else if (nama === 'tokoTab') { app.tokoTab = nilai; app.tokoKat = 'semua'; app.pesan = ''; }
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
    else if (nama === 'cekUang') hasilAksi(DUNIA.beliCekUang(S), 'Alat cek uang terpasang.');
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
    else if (nama === 'tunaiMobil') { var rtm = MOBIL.beliTunai(S, nilai, 'bank'); hasilAksi(rtm, 'Mobil baru masuk garasi & dijadikan mobil utama. Bensin terisi seperempat.'); if (rtm === true) app.motorTab = 'garasi'; }
    else if (nama === 'tunaiMobilKk') { var rtmk = MOBIL.beliTunai(S, nilai, 'kk'); hasilAksi(rtmk, 'Mobil baru dibeli pakai kartu kredit & dijadikan mobil utama.'); if (rtmk === true) app.motorTab = 'garasi'; }
    else if (nama === 'kreditMobilPilih') { app.kreditMobil = nilai; app.pesan = ''; app.nama = 'kreditMobil'; }
    else if (nama === 'kreditMobilDp') { app.kreditMobilDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobilTenor') { app.kreditMobilTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobil') { var rkm = MOBIL.beliKredit(S, app.kreditMobil, app.kreditMobilDp || 0.2, app.kreditMobilTenor || 60, nilai === 'kk' ? 'kk' : 'bank'); hasilAksi(rkm, 'Kredit disetujui. Mobil baru masuk garasi & jadi mobil utama.'); if (rkm === true) { app.nama = 'motor'; app.motorTab = 'garasi'; } }
    else if (nama === 'bensinMobil') { var pm2 = nilai.split('-'), bm = MOBIL.isiBensin(S, pm2[0], pm2[1]); hasilAksi(bm && bm.ok ? true : bm, bm && bm.ok ? 'Isi ' + bm.liter.toLocaleString('id-ID') + ' liter, ' + rupiah(bm.biaya) + '.' : ''); }
    else if (nama === 'servisMobil') hasilAksi(MOBIL.servis(S), 'Mobil sudah diservis.');
    else if (nama === 'upgradeMobil') { var rum = MOBIL.upgrade(S, nilai); hasilAksi(rum && rum.ok ? true : rum, rum && rum.ok ? rum.teks : ''); }
    else if (nama === 'beliPb') { var ppb = nilai.split('-'), rpb = DIRI.beliPowerBank(S, ppb[0], ppb[1] || 'bank'); hasilAksi(rpb && rpb.ok ? true : rpb, rpb && rpb.ok ? rpb.teks : ''); }
    else if (nama === 'pakaiPb') { var rpkp = DIRI.pakaiPowerBank(S, nilai); hasilAksi(rpkp && rpkp.ok ? true : rpkp, rpkp && rpkp.ok ? rpkp.teks : ''); }
    else if (nama === 'togglePb') { var rtpb = DIRI.togglePowerBank(S); hasilAksi(rtpb && rtpb.ok ? true : rtpb, rtpb && rtpb.ok ? rtpb.teks : ''); }
    else if (nama === 'casPb') { var rcpb = DIRI.toggleCasPowerBank(S); hasilAksi(rcpb && rcpb.ok ? true : rcpb, rcpb && rcpb.ok ? rcpb.teks : ''); }
    else if (nama === 'pajakMobil') hasilAksi(MOBIL.bayarPajak(S), 'Pajak mobil lunas setahun.');
    else if (nama === 'jualMotor') { var jm = MOTOR.jual(S); hasilAksi(jm && jm.ok ? true : jm, jm && jm.ok ? 'Motor terjual ' + rupiah(jm.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'pilihMotor') { hasilAksi(MOTOR.pilihAktif(S, +nilai), 'Motor utama diganti ke ' + (S.motor ? S.motor.nama : '') + '.'); }
    else if (nama === 'pilihMobil') { hasilAksi(MOBIL.pilihAktif(S, +nilai), 'Mobil utama diganti ke ' + (S.mobil ? S.mobil.nama : '') + '.'); }
    else if (nama === 'mulaiTravel') return mulaiTravel();
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
    else if (nama === 'bayarCicilanMotor') { var bcm = MOTOR.bayarCicilan(S); hasilAksi(bcm && bcm.ok ? true : bcm, bcm && bcm.teks); }
    else if (nama === 'lunasMotor') { var lm = MOTOR.lunasi(S); hasilAksi(lm && lm.ok ? true : lm, lm && lm.ok ? 'Kredit motor lunas, dibayar ' + rupiah(lm.jml) + '.' : ''); }
    else if (nama === 'bayarCicilanMobil') { var bcb = MOBIL.bayarCicilan(S); hasilAksi(bcb && bcb.ok ? true : bcb, bcb && bcb.teks); }
    else if (nama === 'jualMobil') { var jb = MOBIL.jual(S); hasilAksi(jb && jb.ok ? true : jb, jb && jb.ok ? 'Mobil terjual ' + rupiah(jb.harga) + ', masuk rekening.' : ''); }
    else if (nama === 'lunasMobil') { var lb = MOBIL.lunasi(S); hasilAksi(lb && lb.ok ? true : lb, lb && lb.ok ? 'Kredit mobil lunas, dibayar ' + rupiah(lb.jml) + '.' : ''); }
    else if (nama === 'bayarKpr') { var bkp = PROPERTI.bayarCicilanKpr(S, +nilai); hasilAksi(bkp && bkp.ok ? true : bkp, bkp && bkp.teks); }
    else if (nama === 'bayarHadiah') { var bhd = DIRI.bayarCicilanHadiah(S, +nilai); hasilAksi(bhd && bhd.ok ? true : bhd, bhd && bhd.teks); }
    else if (nama === 'daftarDriver') hasilAksi(OJEK.daftar(S, nilai), 'Pendaftaran dikirim. Akun aktif dalam ' + N.ojol.verifikasiHari + ' hari.');
    else if (nama === 'putusDriver') hasilAksi(OJEK.putus(S, nilai), 'Kerjasama mitra driver ' + OJEK.platform(nilai).nama + ' resmi diputus.');
    else if (nama === 'onlineDriver') return mulaiNarik(nilai);
    else if (nama === 'offlineDriver') return berhentiNarik();
    else if (nama === 'tarikDriver') { var td = OJEK.tarikSaldo(S, nilai === '1' ? 'bank' : nilai); hasilAksi(td && td.ok ? true : td, td && td.ok ? rupiah(td.jml) + ' ' + (td.ket || 'berhasil ditarik') + '.' : ''); }
    else if (nama === 'kotaProp') { app.kotaProp = nilai; app.pesan = ''; }
    else if (nama === 'wilProp') { app.wilProp = nilai; if ($('in-wil-nama')) app.wilNama = $('in-wil-nama').value; app.pesan = ''; }
    else if (nama === 'pilihRumahProp') { app.rumahPropIdx = +nilai; app.ruangProp = 0; app.yakinJualRumah = -1; app.pesan = ''; }
    else if (nama === 'pilihRuang') { app.ruangProp = +nilai; app.pesan = ''; }
    else if (nama === 'bayarAir') { var rba2 = PROPERTI.bayarAir(S, +nilai); hasilAksi(rba2 && rba2.ok ? true : rba2, rba2 && rba2.teks); }
    else if (nama === 'sewaRumah') { var psr = nilai.split('|'), rsr = PROPERTI.sewakanRumah(S, +psr[0], psr[1]); hasilAksi(rsr && rsr.ok ? true : rsr, rsr && rsr.teks); }
    else if (nama === 'hentiSewaRumah') { var rhs = PROPERTI.hentiSewaRumah(S, +nilai); hasilAksi(rhs && rhs.ok ? true : rhs, rhs && rhs.teks); }
    else if (nama === 'instalRuang') { var pir = nilai.split('|'), rir = PROPERTI.instalPerabot(S, +pir[1], pir[2], +pir[0]); hasilAksi(rir && rir.ok ? true : rir, rir && rir.teks); }
    else if (nama === 'tipeRumah') { app.tipeRumah = nilai; app.dpRumah = null; app.pesan = ''; }
    else if (nama === 'rumahTunai') { app.rumahTunai = nilai === '1'; app.pesan = ''; }
    else if (nama === 'dpRumah') { app.dpRumah = +nilai; app.pesan = ''; }
    else if (nama === 'tenorRumah') { app.tenorRumah = +nilai; app.pesan = ''; }
    else if (nama === 'beliRumah') {
      var tp = app.tipeRumah || 'subsidi', nmWil = $('in-wil-nama') ? $('in-wil-nama').value : (app.wilNama || '');
      var br = PROPERTI.ajukan(S, tp, app.dpRumah || (tp === 'subsidi' ? N.properti.subsidi.dp : N.properti.komersial.dp[0]), app.tenorRumah || 20, !!app.rumahTunai && tp !== 'subsidi', app.kotaProp || S.kota, app.wilProp || 'kota', nmWil);
      hasilAksi(br && br.ok ? true : br, br && br.ok ? 'Disetujui! Akad dan serah terima kunci ' + namaTanggal(br.kunci) + '.' : '');
    }
    else if (nama === 'pindahRumah') return pindahRumah('rumah', +nilai);
    else if (nama === 'jualRumah') {
      var jIdx = +nilai;
      if (app.yakinJualRumah !== jIdx) { app.yakinJualRumah = jIdx; app.pesan = ''; }
      else { app.yakinJualRumah = -1; var jr = PROPERTI.jualRumah(S, jIdx); hasilAksi(jr && jr.ok ? true : jr, jr && jr.ok ? 'Rumah terjual. Bersih ' + rupiah(jr.bersih) + ' masuk rekening.' + (jr.pindah ? ' Kamu kembali tinggal di kos.' : '') : ''); }
    }
    else if (nama === 'beliTanah') { var bt = PROPERTI.beliTanah(S, v); hasilAksi(bt && bt.ok ? true : bt, bt && bt.ok ? 'Tanah ' + v + ' m² sudah atas namamu. Total ' + rupiah(bt.total) + '.' : ''); }
    else if (nama === 'jualTanah') { var jt = PROPERTI.jualTanah(S, v); hasilAksi(jt && jt.ok ? true : jt, jt && jt.ok ? 'Tanah terjual, bersih ' + rupiah(jt.bersih) + '.' : ''); }
    else if (nama === 'tunai') { var rt = MOTOR.beliTunai(S, nilai, 'bank'); hasilAksi(rt, 'Motor baru masuk garasi & dijadikan motor utama. Bensin diisi sedikit dari dealer.'); if (rt === true) app.motorTab = 'garasi'; }
    else if (nama === 'tunaiKk') { var rtk = MOTOR.beliTunai(S, nilai, 'kk'); hasilAksi(rtk, 'Motor baru dibeli pakai kartu kredit & dijadikan motor utama.'); if (rtk === true) app.motorTab = 'garasi'; }
    else if (nama === 'kreditPilih') { app.kreditMotor = nilai; app.pesan = ''; app.nama = 'kredit'; }
    else if (nama === 'kreditDp') { app.kreditDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditTenor') { app.kreditTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kredit') { var rk = MOTOR.beliKredit(S, app.kreditMotor, app.kreditDp || 0.1, app.kreditTenor || 35, nilai === 'kk' ? 'kk' : 'bank'); hasilAksi(rk, 'Kredit disetujui. Motor baru masuk garasi & jadi motor utama.'); if (rk === true) { app.nama = 'motor'; app.motorTab = 'garasi'; } }
    else if (nama === 'bekas') { var rbk = MOTOR.beliBekas(S, +nilai, 'bank'); hasilAksi(rbk, 'Motor bekas masuk garasi & dijadikan motor utama.'); if (rbk === true) app.motorTab = 'garasi'; }
    else if (nama === 'bekasKk') { var rbkk = MOTOR.beliBekas(S, +nilai, 'kk'); hasilAksi(rbkk, 'Motor bekas dibeli pakai kartu kredit & dijadikan motor utama.'); if (rbkk === true) app.motorTab = 'garasi'; }
    else if (nama === 'beliMakan' || nama === 'minumAir' || nama === 'ngopi' || nama === 'ngopiSusu' || nama === 'makanRumah') {
      var bm2 = nilai.split('-'), rmk = nama === 'makanRumah' ? DIRI.makanDiRumah(S) : nama === 'minumAir' ? DIRI.makan(S, 'air') : nama === 'ngopi' ? DIRI.makan(S, 'kopi') : nama === 'ngopiSusu' ? DIRI.makan(S, 'kopisusu') : DIRI.beli(S, bm2[0], bm2[1]);
      if (rmk && rmk.ok) { if (rmk.menit) lompatWaktu(rmk.menit); hasilAksi(true, rmk.teks); } else hasilAksi(rmk);
    }
    else if (nama === 'bbmPilih') { app.bbmPilih = nilai; app.pesan = ''; }
    else if (nama === 'bensin') { var pb = nilai.split('-'), rb = MOTOR.isiBensin(S, pb[0], pb[1]); hasilAksi(rb && rb.ok ? true : rb, rb && rb.ok ? 'Isi ' + N.bbm.nama[rb.jenis] + ' ' + rb.liter.toFixed(1).replace('.', ',') + ' liter, ' + rupiah(rb.biaya) + '.' + (rb.ngelitik ? ' Mesin mulai ngelitik karena bensin di bawah anjuran.' : '') : ''); }
    else if (nama === 'oli') hasilAksi(MOTOR.rawat(S, 'oli'), 'Oli sudah diganti.');
    else if (nama === 'servis') hasilAksi(MOTOR.rawat(S, 'servis'), 'Motor sudah diservis.');
    else if (nama === 'banMotor') { var rbm = MOTOR.gantiBan(S); hasilAksi(rbm && rbm.ok ? true : rbm, rbm && rbm.teks); }
    else if (nama === 'banMobil') { var rbc = MOBIL.gantiBan(S); hasilAksi(rbc && rbc.ok ? true : rbc, rbc && rbc.teks); }
    else if (nama === 'aks') hasilAksi(MOTOR.beliAks(S, nilai), 'Perlengkapan sudah terpasang.');
    else if (nama === 'pajakMotor') hasilAksi(MOTOR.bayarPajak(S), 'Pajak motor lunas setahun.');
    else if (nama === 'daftarOjol') hasilAksi(ANTAR.daftar(S, nilai), 'Pendaftaran dikirim. Verifikasi sekitar 3 hari.');
    else if (nama === 'putusOjol') hasilAksi(ANTAR.putus(S, nilai), 'Kerjasama mitra pesan-antar resmi diputus.');
    else if (nama === 'bankTab') { app.bankTab = nilai; app.pesan = ''; }
    else if (nama === 'kelTab') { app.kelTab = nilai; app.pesan = ''; }
    else if (nama === 'isiTabGaji') hasilAksi(UANG.isiTabunganGaji(S, v === Infinity ? 'semua' : v), 'Dana berhasil disimpan ke Tabungan Khusus (aman, tidak tertarik otomatis).');
    else if (nama === 'tarikTabGaji') hasilAksi(UANG.tarikTabunganGaji(S, v === Infinity ? 'semua' : v), 'Dana berhasil ditarik dari Tabungan Khusus ke rekening utama.');
    else if (nama === 'bayarTunggakanGaji') {
      var rbtg = STAF.bayarTunggakanGaji(S);
      hasilAksi(rbtg && rbtg.ok ? true : rbtg, rbtg && rbtg.ok ? 'Tunggakan gaji karyawan sebesar ' + rupiah(rbtg.jml) + ' berhasil dilunasi!' : '');
    }
    else if (nama === 'markup') { var pm = nilai.split('-'); ANTAR.aturMarkup(S, pm[0], +pm[1]); simpan(); app.pesan = ''; }
    else if (nama === 'bayarSales') hasilAksi(STOK.bayarSales(S, +nilai), 'Tagihan sales lunas.');
    else if (nama === 'setor') hasilAksi(UANG.setor(S, v === Infinity ? 'semua' : v, 'dompet'), 'Setor tunai dari dompet pribadi ke rekening berhasil.');
    else if (nama === 'tarikDompet') hasilAksi(UANG.tarik(S, v, 'dompet'), 'Tarik tunai berhasil, uang masuk dompet pribadi.');
    else if (nama === 'tukar') hasilAksi(UANG.tukarReceh(S, v), 'Uang besar sudah ditukar ke uang kecil.');
    else if (nama === 'tarikMerchant') hasilAksi(UANG.tarikMerchant(S, nilai), 'Saldo sudah masuk rekening.');
    else if (nama === 'pasangQris') hasilAksi(UANG.pasangQris(S, nilai), 'Pendaftaran QRIS ' + UANG.qrisData(nilai).nama + ' dikirim. Aktif besok.');
    else if (nama === 'tutupQris') { var rtq2 = UANG.tutupQris(S, nilai); hasilAksi(rtq2 && rtq2.ok ? true : rtq2, rtq2 && rtq2.teks); }
    else if (nama === 'bayarPajak') hasilAksi(UANG.bayarPajak(S, v), 'Pajak sudah disetor.');
    else if (nama === 'nib') hasilAksi(UANG.daftarNib(S), 'NIB terbit.');
    else if (nama === 'kurPlafon') { app.kurPlafon = v; app.pesan = ''; }
    else if (nama === 'kurTenor') { app.kurTenor = v; app.pesan = ''; }
    else if (nama === 'ajukanKur') hasilAksi(UANG.ajukanKur(S, app.kurPlafon, app.kurTenor), 'Pengajuan KUR dikirim. Hasilnya keluar dalam ' + N.kur.hariProses + ' hari.');
    else if (nama === 'ajukanKk') hasilAksi(UANG.ajukanKk(S), 'Kartu kredit ' + UANG.bankIni(S).nama + ' disetujui dengan limit ' + rupiah(S.kk.limit) + '.');
    else if (nama === 'cicilKk') { var rck = UANG.cicilKk(S, nilai); hasilAksi(rck && rck.ok ? true : rck, rck && rck.ok ? 'Pemakaian & tagihan dicicil ' + rck.tenor + ' bulan, ' + rupiah(rck.per) + ' per bulan.' : ''); }
    else if (nama === 'lunasCicilKk') { var rlck = UANG.lunasiCicilanKk(S); hasilAksi(rlck && rlck.ok ? true : rlck, rlck && rlck.ok ? 'Cicilan kartu kredit dilunasi penuh (' + rupiah(rlck.jml) + '). Limit tersedia kembali!' : ''); }
    else if (nama === 'bayarKk') { var rkk = UANG.bayarKk(S, nilai); hasilAksi(rkk && rkk.ok ? true : rkk, rkk && rkk.ok ? 'Tagihan kartu kredit dibayar ' + rupiah(rkk.jml) + '.' : ''); }
    else if (nama === 'naikLimitKk') { var rnl = UANG.naikLimitKk(S); hasilAksi(rnl === true ? true : rnl, 'Limit kartu kredit naik menjadi ' + rupiah(S.kk.limit) + '.'); }
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
    else if (nama === 'sumberBayar') { app.sumberBayar = nilai; app.pesan = ''; }
    else if (nama === 'kuliahPas') {
      var pkp = nilai.split('|'), rkp = DIRI.daftarKuliahPasangan(S, pkp[0], pkp[1], app.sumberBayar || 'suami');
      hasilAksi(rkp && rkp.ok ? true : rkp, rkp && rkp.ok ? rkp.teks : '');
    }
    else if (nama === 'kerjaPas') {
      var pkj = nilai.split('|'), rkj = DIRI.aturKerjaPasangan(S, pkj[0], pkj[1]);
      hasilAksi(rkj && rkj.ok ? true : rkj, rkj && rkj.ok ? rkj.teks : '');
    }
    else if (nama === 'sekolahAnak') {
      var psa = nilai.split('|'), rsa = DIRI.daftarSekolahAnak(S, psa[0], psa[1], app.sumberBayar || 'suami');
      hasilAksi(rsa && rsa.ok ? true : rsa, rsa && rsa.ok ? rsa.teks : '');
    }
    else if (nama === 'bayarKeb') {
      var pbk2 = nilai.split('|'), rbk2 = DIRI.bayarKebutuhanKeluarga(S, pbk2[0], 500000, 'Kebutuhan & pendidikan', pbk2[1] || 'suami');
      hasilAksi(rbk2 && rbk2.ok ? true : rbk2, rbk2 && rbk2.ok ? rbk2.teks : '');
    }
    else if (nama === 'jalanKel') {
      var rjk2 = DIRI.jalanKeluarga(S, nilai);
      if (rjk2 && rjk2.ok) { tutupLembar(); gelapSebentar(); lompatWaktu(rjk2.menit); cekGantiHari(); simpan(); perbaruiHUD(true); perbaruiAksi(); toast(rjk2.teks, 3800); return; }
      else hasilAksi(rjk2);
    }
    else if (nama === 'bukaHadiah') {
      var pbh = nilai.split('|');
      return bukaHadiah(pbh[0], pbh[1]);
    }
    else if (nama === 'belikanHadiah') {
      var pbh2 = nilai.split('|'), rbh = DIRI.belikanHadiah(S, pbh2[0], pbh2[1], pbh2[2], pbh2[3] === '1');
      app.nama = pbh2[0] === 'teman' ? 'teman' : 'keluarga';
      hasilAksi(rbh && rbh.ok ? true : rbh, rbh && rbh.ok ? rbh.teks : '');
    }
    else if (nama === 'momenMesra') {
      var pmm = nilai.split('|');
      return mulaiMesra(pmm[0], pmm[1], pmm[2]);
    }
    else if (nama === 'daftarBpjs') { var rdb = DIRI.daftarBpjs(S, +nilai); hasilAksi(rdb && rdb.ok ? true : rdb, rdb && rdb.teks); }
    else if (nama === 'lunasBpjs') { var rlb = DIRI.bayarTunggakanBpjs(S); hasilAksi(rlb && rlb.ok ? true : rlb, rlb && rlb.teks); }
    else if (nama === 'masukRs') {
      var prs = nilai.split('|'), rrs = DIRI.masukRumahSakit(S, prs[0], prs[1]);
      if (rrs && rrs.ok) { tutupLembar(); gelapSebentar(); lompatWaktu(rrs.menit); cekGantiHari(); simpan(); perbaruiHUD(true); perbaruiAksi(); toast(rrs.teks, 4000); return; }
      else hasilAksi(rrs);
    }
    else if (nama === 'travelTab') { app.travelTab = nilai; app.pesan = ''; }
    else if (nama === 'trvFilter') { app.trvFilter = nilai; app.pesan = ''; }
    else if (nama === 'spRekrut') {
      var rsr2 = TRAVEL.rekrutSupir(S, nilai, {
        periode: app.spPerBaru || 'bulan',
        mobilIdx: app.spMobilBaru,
        ruteId: $('in-spnew-rute') ? $('in-spnew-rute').value : (app.spRuteBaru || 'otomatis'),
        gajiPokok: $('in-spnew-gp') ? +$('in-spnew-gp').value : (app.spPerBaru === 'jalan' ? 150000 : app.spPerBaru === 'minggu' ? 900000 : 3500000),
        uangMakan: $('in-spnew-um') ? +$('in-spnew-um').value : 40000,
        insentif: $('in-spnew-ins') ? +$('in-spnew-ins').value : 25000,
        bpjs: !!app.spBpjsBaru
      });
      hasilAksi(rsr2 && rsr2.ok ? true : rsr2, rsr2 && rsr2.teks);
    }
    else if (nama === 'spPerBaru') { app.spPerBaru = nilai; app.pesan = ''; }
    else if (nama === 'spBpjsBaru') { app.spBpjsBaru = !app.spBpjsBaru; app.pesan = ''; }
    else if (nama === 'spMobilBaru') { app.spMobilBaru = +nilai; app.pesan = ''; }
    else if (nama === 'spRuteBaru') { app.spRuteBaru = nilai; app.pesan = ''; }
    else if (nama === 'spMobil') { var psm = nilai.split('|'), rsm = TRAVEL.aturSupir(S, psm[0], { mobilIdx: +psm[1] }); hasilAksi(rsm && rsm.ok ? true : rsm, rsm && rsm.teks); }
    else if (nama === 'spRute') { var psrt = nilai.split('|'), rsrt = TRAVEL.aturSupir(S, psrt[0], { ruteId: psrt[1] }); hasilAksi(rsrt && rsrt.ok ? true : rsrt, rsrt && rsrt.teks); }
    else if (nama === 'tarikQrisSupir') { var rtq = TRAVEL.tarikQrisSupir(S, nilai); hasilAksi(rtq && rtq.ok ? true : rtq, rtq && rtq.teks); }
    else if (nama === 'tmFilter') { app.tmFilter = nilai; app.pesan = ''; }
    else if (nama === 'tmCari') { app.tmCari = nilai === 'reset' ? '' : ($('in-tm-cari') ? $('in-tm-cari').value : ''); app.pesan = ''; }
    else if (nama === 'spPeriode') { var psp = nilai.split('|'), rsp2 = TRAVEL.aturSupir(S, psp[0], { periode: psp[1] }); hasilAksi(rsp2 && rsp2.ok ? true : rsp2, rsp2 && rsp2.teks); }
    else if (nama === 'spBpjs') { var spO = (S.travel.supir || []).filter(function (x) { return x.id === nilai; })[0]; var rsb = TRAVEL.aturSupir(S, nilai, { bpjs: !(spO && spO.bpjs) }); hasilAksi(rsb && rsb.ok ? true : rsb, rsb && rsb.teks); }
    else if (nama === 'spAktif') { var spA = (S.travel.supir || []).filter(function (x) { return x.id === nilai; })[0]; var rsa2 = TRAVEL.aturSupir(S, nilai, { aktif: !(spA && spA.aktif) }); hasilAksi(rsa2 && rsa2.ok ? true : rsa2, rsa2 && rsa2.teks); }
    else if (nama === 'spSimpan') {
      var rsps = TRAVEL.aturSupir(S, nilai, {
        ruteId: $('in-sp-rute-' + nilai) ? $('in-sp-rute-' + nilai).value : undefined,
        gajiPokok: $('in-sp-gp-' + nilai) ? +$('in-sp-gp-' + nilai).value : undefined,
        uangMakan: $('in-sp-um-' + nilai) ? +$('in-sp-um-' + nilai).value : undefined,
        insentif: $('in-sp-ins-' + nilai) ? +$('in-sp-ins-' + nilai).value : undefined
      });
      hasilAksi(rsps && rsps.ok ? true : rsps, rsps && rsps.teks);
    }
    else if (nama === 'spPecat') { var rspc = TRAVEL.pecatSupir(S, nilai); hasilAksi(rspc && rspc.ok ? true : rspc, rspc && rspc.teks); }
    else if (nama === 'lakukanHb') return mulaiHb(nilai === '1');
    else if (nama === 'hbTarget') {
      var pht = nilai.split('|');
      return mulaiHb(pht[0] === '1', pht[1]);
    }
    else if (nama === 'simpanNamaKel') { var rnm = DIRI.ubahNamaKeluarga(S, nilai, $('in-nama-' + nilai) ? $('in-nama-' + nilai).value : ''); hasilAksi(rnm && rnm.ok ? true : rnm, rnm && rnm.ok ? rnm.teks : ''); }
    else if (nama === 'suruhPulang') { var rsp = TEMAN.kirimPulang(S, nilai); hasilAksi(rsp && rsp.ok ? true : rsp, rsp && rsp.ok ? rsp.teks : ''); }
    else if (nama === 'konfrontasi') { var kf = nilai.split('|'), rkf = TEMAN.konfrontasi(S, kf[0], kf[1], DIRI.ceraiPasangan); hasilAksi(rkf && rkf.ok ? true : rkf, rkf && rkf.ok ? rkf.teks : ''); }
    else if (nama === 'temanTambah') {
      var gT = app.tmGender || 'cewek', pT = app.tmPeran || 'teman', nmT = $('in-tm-nama') ? $('in-tm-nama').value : '', ttT = $('in-tm-ttl') ? $('in-tm-ttl').value : '';
      var rtm = TEMAN.tambah(S, nmT, gT, pT, ttT); if (rtm && rtm.ok) { app.tmNama = ''; app.tmTtl = ''; } hasilAksi(rtm && rtm.ok ? true : rtm, rtm && rtm.ok ? rtm.teks : '');
    }
    else if (nama === 'tmGender' || nama === 'tmPeran') { app.tmNama = $('in-tm-nama') ? $('in-tm-nama').value : ''; app.tmTtl = $('in-tm-ttl') ? $('in-tm-ttl').value : ''; if (nama === 'tmGender') app.tmGender = nilai; else app.tmPeran = nilai; app.pesan = ''; }
    else if (nama === 'tmInteraksi') {
      var ti = nilai.split('|'), rti = TEMAN.interaksi(S, ti[0], ti[1], function (jml, ket) { return bayarPribadi(jml, ket); });
      hasilAksi(rti && rti.ok ? true : rti, rti && rti.ok ? rti.teks : '');
    }
    else if (nama === 'tmPeranUbah') { var tp = nilai.split('|'), rtp = TEMAN.ubahPeran(S, tp[0], tp[1]); hasilAksi(rtp && rtp.ok ? true : rtp, rtp && rtp.ok ? rtp.teks : ''); }
    else if (nama === 'tmNama') { var rtn = TEMAN.ubahNama(S, nilai, $('in-tmn-' + nilai) ? $('in-tmn-' + nilai).value : ''); hasilAksi(rtn && rtn.ok ? true : rtn, rtn && rtn.ok ? rtn.teks : ''); }
    else if (nama === 'tmTtl') { var rtt = TEMAN.ubahTtl(S, nilai, $('in-tmt-' + nilai) ? $('in-tmt-' + nilai).value : ''); hasilAksi(rtt && rtt.ok ? true : rtt, rtt && rtt.ok ? rtt.teks : ''); }
    else if (nama === 'tmNikah') { var tn = nilai.split('|'), rn = DIRI.nikahiTeman(S, tn[0], tn[1]); hasilAksi(rn && rn.ok ? true : rn, rn && rn.ok ? rn.teks : ''); }
    else if (nama === 'tmHapus') { TEMAN.hapus(S, nilai); hasilAksi(true, 'Dihapus dari daftar teman.'); }
    else if (nama === 'tmHb') { var th = nilai.split('|'); mulaiHb(th[1] === '1', 'teman:' + th[0]); return; }
    else if (nama === 'jajanKel') { var pj = nilai.split('|'), rj = DIRI.aturJajan(S, pj[0], pj[1]); hasilAksi(rj && rj.ok ? true : rj, rj && rj.ok ? rj.teks : ''); }
    else if (nama === 'simpanTtlKel') {
      var elTtl = $('in-ttl-' + nilai), ttlVal = elTtl ? elTtl.value : '';
      var rttl = DIRI.ubahTtlKeluarga(S, nilai, ttlVal);
      hasilAksi(rttl && rttl.ok ? true : rttl, rttl && rttl.ok ? rttl.teks : '');
    }
    else if (nama === 'ceraiPas') {
      var rcr = DIRI.ceraiPasangan(S, nilai, 'Keputusan perceraian');
      hasilAksi(rcr && rcr.ok ? true : rcr, rcr && rcr.ok ? rcr.teks : '');
    }
    else if (nama === 'bayarNafkah') {
      var nomNf = nilai === 'input' ? ($('in-nafkah') ? +$('in-nafkah').value : 0) : +nilai;
      var rnf = DIRI.bayarNafkah(S, nomNf);
      hasilAksi(rnf && rnf.ok ? true : rnf, rnf && rnf.teks);
    }
    else if (nama === 'isiKasTravel') {
      var nomKas = nilai === 'input' ? ($('in-kas-isi') ? +$('in-kas-isi').value : 0) : +nilai;
      var rik = TRAVEL.isiKasTravel(S, nomKas);
      hasilAksi(rik && rik.ok ? true : rik, rik && rik.teks);
    }
    else if (nama === 'tarikKasTravel') {
      var rtk2 = TRAVEL.tarikKasTravel(S, nilai === 'semua' ? 'semua' : +nilai);
      hasilAksi(rtk2 && rtk2.ok ? true : rtk2, rtk2 && rtk2.teks);
    }
    else if (nama === 'toggleAutoKasTravel') {
      var rak2 = TRAVEL.toggleAutoKasTravel(S);
      hasilAksi(rak2 && rak2.ok ? true : rak2, rak2 && rak2.teks);
    }
    else if (nama === 'pinjamPas') { var ppj = nilai.split('|'), rpj = DIRI.pinjamPasangan(S, ppj[0], +ppj[1]); hasilAksi(rpj && rpj.ok ? true : rpj, rpj && rpj.teks); }
    else if (nama === 'bayarUtangPas') { var rbu = DIRI.bayarUtangPasangan(S); hasilAksi(rbu && rbu.ok ? true : rbu, rbu && rbu.teks); }
    else if (nama === 'mintaBantu') { var rmb = DIRI.mintaBantuanPasangan(S, nilai === 'semua' ? 'semua' : +nilai); hasilAksi(rmb && rmb.ok ? true : rmb, rmb && rmb.teks); }
    else if (nama === 'aktivitasKel') { var pak = nilai.split('|'), rak = DIRI.aturAktivitasKeluarga(S, pak[0], pak[1]); hasilAksi(rak && rak.ok ? true : rak, rak && rak.teks); }
    else if (nama === 'bukaBensin') return popupBensin(null, false, nilai);
    else if (nama === 'onlineCar') return mulaiNarik(nilai || 'gojek', 'mobil');
    else if (nama === 'hbLokasi') {
      var phl = nilai.split('|');
      var loc = LOKASI_HB.filter(function (x) { return x.id === phl[0]; })[0];
      if (!loc) return;
      return mulaiHb(phl[1] === '1', phl.slice(2).join('|'), loc);
    }
    else if (nama === 'inapLuar') {
      var rin = DIRI.menginapLuar(S, nilai);
      if (rin && rin.ok) { tutupLembar(); gelapSebentar(); lompatWaktu(rin.menit); cekGantiHari(); simpan(); perbaruiHUD(true); perbaruiAksi(); toast(rin.teks, 3600); return; }
      else { toast(rin || 'Gagal menginap.', 2600); return; }
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
    else if (nama === 'sewaBarang') { var rsbw = DIRI.toggleSewaBarang(S, nilai); hasilAksi(rsbw, S.sewaBarang[nilai] ? 'Barang mulai disewakan! Pendapatan sewa cair tiap pagi.' : 'Penyewaan barang dihentikan.'); }
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
    var a = ANTAR.aktif(S), b = $('b-pesanan') || { hidden: true, style: {}, textContent: '', classList: { toggle: function () {} } };
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
    if (S.hbRun) return toast('Sedang berdua, tunggu sebentar.', 1600);
    if (S.transit) return toast('Sedang di perjalanan, tunggu sampai tiba.', 1800);
    if (R) tutupRacik();
    if (S.ojek.online) {
      if (paksaHome && ke === 'kos') { OJEK.offline(S, true); }
      else return toast('Sedang narik. Berhenti narik dulu di aplikasi Driver ojol.', 2600);
    }
    if (ke === 'kos' && S.fase === 'buka' && !kepalaMasuk()) {
      S.tutupSementara = true;
    }
    var km = (ke === 'kos' && OJEK.jarakRumah && (S.usaha.berhentiSewa || (S.ojek && S.ojek.pos && (S.ojek.pos.x || S.ojek.pos.y))))
      ? Math.max(0.5, OJEK.jarakRumah(S))
      : (S.rumah.jarak || N.jarakKos), menit, ket, r, kend = 'ojek';
    if (ke === 'kos' && MOBIL.punya(S) && !MOBIL.cukup(S, km) && km > 15) {
      MOBIL.isiBensin(S, S.mobil.bbm, 'penuh');
    }
    var motorBisa = MOTOR.punya(S) && MOTOR.cukup(S, km), mobilBisa = MOBIL.punya(S) && MOBIL.cukup(S, km);
    if (mobilBisa && (DUNIA.hujanSekarang(S) || !motorBisa || km >= 25)) { r = MOBIL.jalan(S, km, 1); menit = r.menit; ket = 'naik ' + S.mobil.nama; kend = 'mobil'; }
    else if (motorBisa) { r = MOTOR.jalan(S, km, 1); menit = r.menit; ket = 'naik motor'; kend = 'motor'; }
    else {
      var ong = Math.min(250000, OJEK.tarif(S, km));
      if (UANG.bayarDompet(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (dompet)'; }
      else if (UANG.bayarQris(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (QRIS)'; }
      else if (S.bank.saldo >= ong) { S.bank.saldo -= ong; S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (rekening)'; }
      else { menit = Math.min(180, Math.round(km * 12)); ket = 'jalan kaki / menumpang'; kend = 'kaki'; }
    }
    var kabarJalan = r && r.kabar && r.kabar.length ? r.kabar : [];
    /* jarak jauh: tampilkan perjalanannya (waktu berjalan cepat), bukan langsung tiba */
    if (km >= 2 && menit >= 5) {
      var durasi = Math.max(3, Math.min(15, km * 0.55));
      S.transit = { ke: ke, total: menit, sisa: menit, km: Math.round(km * 10) / 10, ket: ket, kabar: kabarJalan, kend: kend, mult: menit / (MENIT_PER_DETIK * durasi) };
      simpan(); perbaruiAksi(); perbaruiHUD(true);
      return;
    }
    gelapSebentar();
    S.diri.posisi = ke; lompatWaktu(menit);
    simpan(); perbaruiAksi(); perbaruiHUD(true);
    toast('Sampai di ' + (ke === 'kos' ? DIRI.tempat(S) : (S.usaha && S.usaha.berhentiSewa ? 'luar' : 'kedai')) + ' pukul ' + jam(S.menit) + ', ' + ket + '.' + (kabarJalan.length ? ' ' + kabarJalan.join(' ') : ''), 2600);
    if (ke === 'kos') { if (OJEK.resetPos) OJEK.resetPos(S, 0, 0); cekAjakanHbPasangan(); infoPulang(); }
  }
  function selesaiTransit() {
    var T = S.transit; if (!T) return;
    S.transit = null; S.diri.posisi = T.ke;
    simpan(); perbaruiAksi(); perbaruiHUD(true);
    toast('Sampai di ' + (T.ke === 'kos' ? DIRI.tempat(S) : (S.usaha && S.usaha.berhentiSewa ? 'luar' : 'kedai')) + ' pukul ' + jam(S.menit) + ', ' + T.ket + ' (' + T.km.toLocaleString('id-ID') + ' km).' + (T.kabar && T.kabar.length ? ' ' + T.kabar.join(' ') : ''), 2800);
    if (T.ke === 'kos') { if (OJEK.resetPos) OJEK.resetPos(S, 0, 0); cekAjakanHbPasangan(); infoPulang(); }
  }
  function infoPulang() {
    var kp = TEMAN.cekPulang(S); if (!kp.length) return; simpan();
    setTimeout(function () { if (S) toast(kp.join(' '), 3800); }, 2800);
  }
  var popupTimer = 0;
  function tampilPopupSelingkuh() {
    var ps = S.popupSelingkuh, el = $('popup-teman'); if (!ps || !el) return; S.popupSelingkuh = null;
    var hotel = ps.tempat === 'hotel';
    el.innerHTML = '<svg viewBox="0 0 80 80" width="100%" height="100%"><rect width="80" height="80" fill="' + (hotel ? '#3a1a3e' : '#4a2a1e') + '"/>' +
      (hotel ? '<rect x="14" y="8" width="52" height="12" rx="3" fill="#ff5c8a"/><text x="40" y="17.5" font-size="8" font-weight="800" text-anchor="middle" fill="#fff">HOTEL</text>' : '<rect x="14" y="8" width="52" height="30" rx="3" fill="#2d1b14"/>') +
      '<circle cx="31" cy="46" r="10" fill="#f1c39b"/><path d="M21 44c0-8 5-11 10-11s10 3 10 11c-3-3-6-4-10-4s-7 1-10 4z" fill="#2a1d1a"/>' +
      '<circle cx="50" cy="48" r="10" fill="#e8b48a"/><path d="M40 46c0-8 5-11 10-11s10 3 10 11c-3-3-6-4-10-4s-7 1-10 4z" fill="#4a2c2a"/>' +
      '<text x="40" y="34" font-size="12" text-anchor="middle" fill="#ff5c8a">♥</text><rect y="62" width="80" height="18" fill="rgba(0,0,0,.55)"/><text x="40" y="74" font-size="8" font-weight="700" text-anchor="middle" fill="#fff">' + esc(ps.nama.slice(0, 11)) + '</text></svg>';
    el.hidden = false; el.classList.add('muncul'); if (SUARA) SUARA.bunyi('salah');
    clearTimeout(popupTimer); popupTimer = setTimeout(function () { el.hidden = true; el.classList.remove('muncul'); }, 16000);
  }
  function cekAjakanHbPasangan() {
    if (!S || S.diri.posisi !== 'kos' || (S.menit % 1440) < 1200 || S.diri.sakit || lembar) return;
    var pasList = DIRI.daftarPasangan ? DIRI.daftarPasangan(S) : [];
    var calon = pasList.filter(function (kl) { return kl.lokasi !== 'kedai' && !kl.sakit && !TEMAN.sedangKeluar(kl, S) && (kl.hb == null ? 35 : kl.hb) >= 60; })[0];
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
      '<small>HB bersama pasangan sah akan memulihkan Stamina 100%, Kesehatan 100%, dan Bahagia 100% (durasi 1–3 jam).</small></div>' +
      '<div class="bayar-baris" style="margin-top:14px">' +
      (kdm > 0 ? '<button type="button" class="aksi kecil" data-diri="hbTarget:1|' + calon.id + '">Terima (Pakai Kondom · ' + kdm + ')</button>' : '') +
      '<button type="button" class="aksi kecil" data-diri="hbTarget:0|' + calon.id + '">Terima (Tanpa Kondom · 65% Hamil)</button>' +
      '<button type="button" class="tombol-lain gelap" data-diri="tolakHb:' + calon.id + '">Nanti dulu, capek</button></div>');
  }
  /* pilihan lokasi HB untuk pasangan, ipar, teman, atau siapa pun */
  var LOKASI_HB = [
    { id: 'kamar', nama: 'Kamar di Rumah / Kos', varian: 'kamar', biaya: 0, diRumah: true, ket: 'Gratis, nyaman di kamar sendiri' },
    { id: 'sofa', nama: 'Ruang Tamu / Sofa', varian: 'sofa', biaya: 0, diRumah: true, ket: 'Gratis, suasana santai di ruang tamu' },
    { id: 'mandi', nama: 'Kamar Mandi (Balik Uap)', varian: 'mandi', biaya: 0, diRumah: true, ket: 'Gratis, suasana hangat di balik uap' },
    { id: 'balkon', nama: 'Balkon Malam', varian: 'balkon', biaya: 0, diRumah: true, ket: 'Gratis, angin malam berdua' },
    { id: 'melati', nama: 'Penginapan Melati', varian: 'hotel', biaya: 50000, diRumah: false, ket: 'Privat di luar rumah · Rp50.000' },
    { id: 'hotel3', nama: 'Hotel Bintang 3', varian: 'hotel', biaya: 350000, diRumah: false, ket: 'Nyaman & privat · Rp350.000' },
    { id: 'hotel5', nama: 'Hotel Bintang 5 Mewah', varian: 'hotel', biaya: 1200000, diRumah: false, ket: 'Mewah & romantis · Rp1.200.000' }
  ];
  function bukaPilihLokasiHb(pakaiKondom, targetKode) {
    var kode = String(targetKode || '');
    bukaLembar('hbLokasi', kepala('Pilih Lokasi HB', 'Penginapan & Hotel 100% aman dari pasangan') +
      '<ul class="daftar belanja">' + LOKASI_HB.map(function (loc) {
        var hargaTeks = loc.biaya ? rupiah(loc.biaya) : 'Gratis';
        return '<li><span><b>' + esc(loc.nama) + '</b><small>' + esc(loc.ket) + (!loc.diRumah ? ' · Aman tidak ketahuan' : '') + '</small><small class="harga">' + hargaTeks + '</small></span>' +
          '<span><button type="button" class="chip-tombol pilih" data-aksi="hbLokasi:' + loc.id + '|' + (pakaiKondom ? '1' : '0') + '|' + esc(kode) + '">Pilih</button></span></li>';
      }).join('') + '</ul>');
  }
  function mulaiHb(pakaiKondom, targetKode, lokasiObj) {
    if (!lokasiObj) return bukaPilihLokasiHb(pakaiKondom, targetKode);
    if (lokasiObj.diRumah && S.diri.posisi !== 'kos') {
      toast('Pulang ke ' + DIRI.tempat(S) + ' dulu untuk HB di rumah, atau pilih Penginapan / Hotel.', 2800);
      return bukaPilihLokasiHb(pakaiKondom, targetKode);
    }
    var kode = String(targetKode || '');
    var biayaTempat = lokasiObj.biaya || 0;
    var butuhTotal = biayaTempat + (kode === 'psk' ? 300000 : 0);
    if (biayaTempat > 0 && ((S.uang.dompet || 0) + S.bank.saldo) < butuhTotal) {
      return toast('Uang tidak cukup untuk ' + lokasiObj.nama + ' (' + rupiah(butuhTotal) + ').', 2600);
    }
    var r = DIRI.lakukanHb(S, pakaiKondom, targetKode, lokasiObj);
    if (!r || !r.ok) { app.pesan = r; app.salah = true; if (lembar === 'hp') return bukaHP(app.nama || 'keluarga'); return toast(r, 2600); }
    if (biayaTempat > 0) {
      var drDomHb = Math.min(S.uang.dompet || 0, biayaTempat);
      if (drDomHb > 0) S.uang.dompet -= drDomHb;
      var sisaHb = biayaTempat - drDomHb;
      if (sisaHb > 0 && S.bank.saldo >= sisaHb) { S.bank.saldo -= sisaHb; S.bank.mutasi.unshift({ n: S.hari, ket: 'Lokasi HB: ' + lokasiObj.nama, jml: -sisaHb }); }
      S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biayaTempat;
    }
    tutupLembar(); if (R) tutupRacik();
    /* waktu berjalan cepat selama adegan (4x), durasi 1-3 jam */
    var total = Math.max(60, Math.min(180, r.menit || 90));
    var durasi = total / (MENIT_PER_DETIK * 4); /* HB: 4x */
    var pg = (S.profil && S.profil.gender) || 'cewek', lawanG = pg === 'cowok' ? 'cewek' : 'cowok', nmT = '';
    if (kode.indexOf('teman:') === 0) { var tx = TEMAN.cari(S, kode.slice(6)); if (tx) { nmT = tx.nama; lawanG = tx.gender; } }
    else if (kode !== 'psk' && kode.indexOf('staf:') !== 0) { var pp = kode ? (S.keluarga || []).filter(function (k) { return k.id === kode || ('ipar:' + k.id) === kode; })[0] : DIRI.pasanganAktif(S); if (kode.indexOf('ipar:') === 0) pp = (S.keluarga || []).filter(function (k) { return k.id === kode.slice(5); })[0]; if (pp) { nmT = pp.nama; lawanG = pp.gender || lawanG; } }
    S.hbRun = { total: total, sisa: total, malam: !!r.malam, bangun: r.bangun || 240, teks: r.teks + ' (Lokasi: ' + lokasiObj.nama + ')', varian: lokasiObj.varian || 'kamar', nama: nmT, gB: lawanG, mult: total / (MENIT_PER_DETIK * durasi) };
    if (!S.kec || S.kec <= 0) S.kec = 1;
    simpan(); perbaruiAksi(); perbaruiHUD(true);
  }
  /* me time: adegan siluet singkat (tanpa gambar eksplisit), waktu 4x */
  function mulaiMeTime() {
    if (S.hbRun || S.transit) return 'Tunggu sebentar.';
    var r = DIRI.meTime(S); if (!r || !r.ok) return r;
    var pg = (S.profil && S.profil.gender) || 'cewek';
    S.hbRun = { total: r.menit, sisa: r.menit, malam: false, bangun: 0, teks: r.teks, varian: 'metime', metime: true, nama: '', gB: pg, mult: 4 };
    if (!S.kec || S.kec <= 0) S.kec = 1;
    simpan(); perbaruiAksi(); perbaruiHUD(true);
    return true;
  }
  /* adegan visual Ciuman & Foreplay bersama pasangan, keluarga dewasa (ipar), atau teman */
  function mulaiMesra(aksi, targetJenis, targetId) {
    if (S.hbRun || S.transit) return toast('Tunggu adegan selesai dulu.', 1800);
    var r = DIRI.momenMesra(S, aksi, targetJenis, targetId);
    if (!r || !r.ok) {
      app.pesan = r; app.salah = true;
      if (lembar === 'hp') return bukaHP(app.nama || 'keluarga');
      return toast(r || 'Gagal melakukan aksi.', 2600);
    }
    tutupLembar(); if (R) tutupRacik();
    var target = targetJenis === 'teman'
      ? (S.teman || []).filter(function (x) { return x.id === targetId; })[0]
      : (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    var pg = (S.profil && S.profil.gender) || 'cewek', lawanG = (target && target.gender) || (pg === 'cowok' ? 'cewek' : 'cowok');
    var total = Math.max(10, r.menit || 15);
    S.hbRun = { total: total, sisa: total, malam: false, bangun: 0, teks: r.teks, varian: aksi, mesra: true, nama: (target && target.nama) || '', gB: lawanG, mult: 4 };
    if (!S.kec || S.kec <= 0) S.kec = 1;
    simpan(); perbaruiAksi(); perbaruiHUD(true);
  }
  function selesaiHb() {
    var H = S.hbRun; if (!H) return;
    S.hbRun = null;
    if (H.metime || H.mesra) { cekGantiHari(); simpan(); perbaruiHUD(true); perbaruiAksi(); return toast(H.teks, 3600); }
    if (H.malam) besok(H.bangun);
    else { S.diri.hb = 0; S.diri.stamina = 100; cekGantiHari(); simpan(); perbaruiHUD(true); perbaruiAksi(); }
    toast(H.teks, 4200);
  }
  /* modal belikan / kredit hadiah (HP, Motor, Rumah) untuk keluarga atau teman */
  function bukaHadiah(targetJenis, targetId) {
    var target = targetJenis === 'teman'
      ? (S.teman || []).filter(function (x) { return x.id === targetId; })[0]
      : (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    if (!target) return toast('Penerima tidak ditemukan.', 2000);
    var balikApp = targetJenis === 'teman' ? 'teman' : 'keluarga', thnHad = KAL.tgl(S.hari).y, bebasThnH = !!(TOWER && TOWER.bukaSemuaTahun(S));
    var listHad = (DIRI.KATALOG_HADIAH || []).filter(function (it) { return bebasThnH || (it.tahun || 2023) <= thnHad; });
    bukaLembar('hadiah', kepala('🎁 Belikan / Kredit untuk ' + target.nama, 'Pilih HP, Motor, atau Rumah (Katalog ' + thnHad + ')', '<button type="button" class="panah" data-app="' + balikApp + '" aria-label="Kembali">‹</button>') +
      '<ul class="daftar belanja">' + listHad.map(function (it) {
        var dpRp = Math.round(it.harga * it.dp / 10000) * 10000;
        var pokok = it.harga - dpRp;
        var angs = Math.round((pokok * (1 + 0.008 * it.tenor) / it.tenor) / 1000) * 1000;
        return '<li><span><b>[' + esc(it.kat) + '] ' + esc(it.nama) + '</b>' +
          '<small>Tunai: ' + rupiah(it.harga) + ' · Kredit DP ' + rupiah(dpRp) + ' + ' + rupiah(angs) + '/bln (' + it.tenor + ' bln)</small>' +
          '<small>' + (targetJenis === 'teman' ? 'Hubungan' : 'Bahagia') + ' +' + it.naik + '%</small></span>' +
          '<span class="tombol-tegak"><button type="button" class="chip-tombol pilih" data-aksi="belikanHadiah:' + targetJenis + '|' + target.id + '|' + it.id + '|0">Tunai</button>' +
          '<button type="button" class="chip-tombol" data-aksi="belikanHadiah:' + targetJenis + '|' + target.id + '|' + it.id + '|1">Kredit</button></span></li>';
      }).join('') + '</ul>' +
      '<p class="catatan">Cicilan hadiah dipotong otomatis tiap tanggal 1 dari rekening bankmu. Bisa membelikan hadiah untuk keluarga (istri/suami/anak/ipar) maupun teman!</p>');
  }
  /* pindah rumah dengan animasi pikap */
  var pindahAnim = null;
  function pindahRumah(ke, rumahIdx) {
    if (S.ojek.online) { app.pesan = 'Berhenti narik dulu.'; app.salah = true; return bukaHP('properti'); }
    if (!S.usaha.berhentiSewa && S.fase === 'buka' && !kepalaMasuk()) { app.pesan = 'Selesaikan aktivitas dulu sebelum pindahan.'; app.salah = true; return bukaHP('properti'); }
    var r = PROPERTI.pindah(S, ke, false, rumahIdx); if (!r || !r.ok) { app.pesan = r; app.salah = true; return bukaHP('properti'); }
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
  function mulaiNarik(pid, mode) {
    var md = mode === 'mobil' ? 'mobil' : 'motor';
    if (S.travel && S.travel.aktif) return toast('Selesaikan Travel dulu sebelum narik ' + (md === 'mobil' ? 'GoCar.' : 'ojol.'), 2200);
    if (!S.usaha.berhentiSewa && S.fase === 'buka' && !kepalaMasuk()) { app.pesan = 'Kedai sedang buka. Narik sebelum buka atau setelah tutup, atau tugaskan kepala toko.'; app.salah = true; return bukaHP('driver'); }
    var e = OJEK.bisaOnline(S, md);
    if (e) {
      if (/bensin|baterai/i.test(e)) return popupBensin(e, true, md);
      app.pesan = e; app.salah = true; return bukaHP('driver');
    }
    tutupLembar(); if (R) tutupRacik();
    if (S.usaha.berhentiSewa) {
      S.diri.posisi = 'kedai';
      if (OJEK.resetPos) OJEK.resetPos(S, 0, 0);
    } else if (S.diri.posisi !== 'kedai') {
      pindah('kedai');
      if (OJEK.resetPos) OJEK.resetPos(S, S.rumah.jarak || N.jarakKos, 0);
    }
    if (!S.kec || S.kec <= 0) S.kec = 1;
    var rOn = OJEK.online(S, pid || S.ojek.platform || 'gojek', md);
    if (rOn !== true) { toast(rOn || 'Gagal mulai narik.', 2400); return; }
    tawaranUmur = 0; panelKunci = '';
    perbaruiAksi(); perbaruiHUD(true); simpan();
    var nmL = md === 'mobil' ? (S.ojek.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(S.ojek.platform).nama;
    toast('Online di ' + nmL + '. Menunggu order (' + (OJEK.jarakRumah ? OJEK.jarakRumah(S).toLocaleString('id-ID') : 0) + ' km dari rumah).', 2600);
  }
  function berhentiNarik() {
    var isCar = S.ojek && S.ojek.mode === 'mobil';
    var nmOff = isCar ? (S.ojek.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(S.ojek.platform || 'gojek').nama;
    var r = OJEK.offline(S, true); if (r !== true) return toast(r, 2000);
    tutupLembar(); perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Offline dari ' + nmOff + '. Hari ini ' + S.ojek.hariIni.trip + ' order, ' + rupiah(S.ojek.hariIni.bersih) + '.', 2600);
  }
  var NAMA_JENIS = { penumpang: 'penumpang', barang: 'paket', makanan: 'makanan' };
  /* ---------- Tutorial Awal Game (Bisa Skip) & Control Tower (30x Tap) ---------- */
  var TUTORIAL_LANGKAH = [
    {
      ikon: '🚐',
      judul: 'Selamat Datang di The Driver!',
      isi: 'Kamu memulai perjalanan hidup di tahun 2023 dengan modal awal <b>Rp5.000.000</b> (Rp4.850.000 di rekening bank + Rp150.000 tunai di dompet). Mulai dari narik ojek online, naik kelas ke GoCar/GrabCar, lalu bangun armada Travel antarkota se-Indonesia!'
    },
    {
      ikon: '📊',
      judul: 'Pantau 6 Status di Dock Bawah',
      isi: 'Di bagian paling bawah layar ada 6 bar: <b>Makan, Minum, Stamina, HB, Baterai HP, dan BBM</b>. Ketuk langsung bar mana saja untuk aksi cepat — makan/minum, isi bensin, tidur, atau sambungkan Power Bank saat narik.'
    },
    {
      ikon: '📱',
      judul: 'HP = Pusat Semua Aktivitas',
      isi: 'Tekan ikon <b>HP</b> di dock bawah untuk membuka aplikasi penting: <b>Kendaraan</b> (beli motor bekas/kredit & mobil + upgrade), <b>Driver</b> (daftar Gojek/Grab), <b>Travel & Kas Travel</b> (rekrut hingga 10 supir), <b>Bank & QRIS</b>, <b>Keluarga</b>, dan <b>Properti</b>.'
    },
    {
      ikon: '🚦',
      judul: 'Kecepatan & Kondisi Jalan Realistis',
      isi: 'Mode normal menyediakan kecepatan <b>Level 1–4</b> yang memperhitungkan kondisi jalan asli (tol, aspal mulus, bergelombang, rusak, tanah) dan cuaca hujan. <b>Level 5 (Top Speed)</b> tergembok 🔒 khusus <b>Mode VVIP</b>.'
    },
    {
      ikon: '📅',
      judul: 'Hidup Sehat & Tahun Terus Berjalan',
      isi: 'Jaga kesehatan & BPJS, beri nafkah pasangan, dan bayar cicilan tepat waktu agar SLIK kredit tetap bersih. Katalog <b>HP, motor, mobil, & game</b> mengikuti tahun rilis asli — seri 2024–2026 akan muncul otomatis saat tahun berganti!'
    }
  ];
  function bukaTutorial(step) {
    var i = Math.max(0, Math.min(TUTORIAL_LANGKAH.length - 1, +step || 0));
    var t = TUTORIAL_LANGKAH[i], akhir = i >= TUTORIAL_LANGKAH.length - 1;
    var dots = TUTORIAL_LANGKAH.map(function (_, idx) { return '<i' + (idx === i ? ' class="on"' : '') + '></i>'; }).join('');
    bukaLembar('tutorial',
      kepala('📖 Panduan Bermain', 'Langkah ' + (i + 1) + ' dari ' + TUTORIAL_LANGKAH.length, '', '<button type="button" class="chip-tombol" data-tut="skip">Lewati</button>') +
      '<div class="tut-kartu"><div class="tut-ikon">' + t.ikon + '</div><h4>' + esc(t.judul) + '</h4><p>' + t.isi + '</p></div>' +
      '<div class="tut-dots">' + dots + '</div>' +
      '<div style="display:flex;gap:8px;align-items:center">' +
      (i > 0 ? '<button type="button" class="chip-tombol" style="flex:1;padding:11px" data-tut="' + (i - 1) + '">‹ Sebelumnya</button>' : '<button type="button" class="chip-tombol" style="flex:1;padding:11px" data-tut="skip">Skip Tutorial</button>') +
      (akhir
        ? '<button type="button" class="aksi" style="flex:1.4" data-tut="skip">Mulai Bermain!</button>'
        : '<button type="button" class="aksi" style="flex:1.4" data-tut="' + (i + 1) + '">Lanjut ›</button>') +
      '</div>');
  }

  var towerUI = { tab: 'akun', pilihId: null, targetDana: 'bank', kodeTerakhir: '', pesan: '', salah: false };
  function stateTower() {
    if (S) return S;
    var lama = SIMPAN.baca();
    return (lama && lama.v >= 1) ? lama : null;
  }
  function simpanStateTower(st) {
    if (!st) return;
    if (S && st === S) { simpan(); perbaruiHUD(true); perbaruiAksi(); travelKunci = ''; panelTravel(true); panelOjek(true); }
    else { SIMPAN.tulis(st); isiLayarAwal(); }
  }
  function bukaControlTower() {
    if (!TOWER) return;
    var st = stateTower();
    var daftar = TOWER.daftarAkun(st);
    if (!towerUI.pilihId || !daftar.some(function (a) { return a.id === towerUI.pilihId; })) {
      towerUI.pilihId = (st && st.akunId) || (daftar[0] && daftar[0].id) || null;
    }
    var ak = daftar.filter(function (a) { return a.id === towerUI.pilihId; })[0] || null;
    var tab = towerUI.tab || 'akun';
    var tabsHtml = '<div class="chip-baris" style="margin-bottom:8px">' +
      [['akun', '👤 Akun & Fitur'], ['uang', '💰 Suntik Dana'], ['voucher', '🎟️ Voucher'], ['dunia', '🌍 Dunia & Log']].map(function (tb) {
        return '<button type="button" class="chip-tombol' + (tab === tb[0] ? ' pilih' : '') + '" data-ct="tab:' + tb[0] + '">' + tb[1] + '</button>';
      }).join('') + '</div>';
    var pesanHtml = towerUI.pesan ? '<p class="racik-pesan ' + (towerUI.salah ? 'salah' : 'siap') + '">' + esc(towerUI.pesan) + '</p>' : '';
    var isi = '';
    if (tab === 'akun') {
      isi += '<h3 class="subjudul">Pilih Akun Target (' + daftar.length + ' terdaftar)</h3>' +
        '<div class="chip-baris">' + (daftar.length ? daftar.map(function (a) {
          var isAktif = !!(st && st.akunId === a.id);
          return '<button type="button" class="chip-tombol' + (ak && ak.id === a.id ? ' pilih' : '') + '" data-ct="pilih:' + esc(a.id) + '">' + esc(a.nama) + (isAktif ? ' ★' : '') + ' (' + esc(a.id) + ')</button>';
        }).join('') : '<small>Belum ada akun. Tambah akun baru di bawah atau mulai game dulu.</small>') + '</div>';
      if (ak) {
        var live = !!(st && st.akunId === ak.id);
        isi += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-top:8px">' +
          '<b>' + esc(ak.nama) + ' · ' + esc(ak.id) + (live ? ' (Akun Aktif ★)' : ' (Akun Terdaftar)') + '</b>' +
          '<small>' + (live ? ('Bank: ' + rupiah((st.bank && st.bank.saldo) || 0) + ' · Dompet: ' + rupiah((st.uang && st.uang.dompet) || 0) + ' · Tahun ' + KAL.tgl(st.hari).y) : ('Dana antre: ' + rupiah(ak.pendingUang || 0))) + '</small>' +
          '<div class="chip-baris" style="margin-top:8px">' +
          '<button type="button" class="chip-tombol' + (ak.vvip ? ' pilih' : '') + '" data-ct="fitur:vvip|' + (ak.vvip ? '0' : '1') + '">' + (ak.vvip ? '🔓 VVIP Lv 5: AKTIF' : '🔒 VVIP Lv 5: MATI') + '</button>' +
          '<button type="button" class="chip-tombol' + (ak.sandbox ? ' pilih' : '') + '" data-ct="fitur:sandbox|' + (ak.sandbox ? '0' : '1') + '">' + (ak.sandbox ? '🧪 Sandbox: AKTIF' : '🧪 Sandbox: MATI') + '</button>' +
          '<button type="button" class="chip-tombol' + (ak.kebal ? ' pilih' : '') + '" data-ct="fitur:kebal|' + (ak.kebal ? '0' : '1') + '">' + (ak.kebal ? '🛡️ Kebal: ON' : '🛡️ Kebal: OFF') + '</button>' +
          '<button type="button" class="chip-tombol' + (ak.bukaTahun ? ' pilih' : '') + '" data-ct="fitur:bukaTahun|' + (ak.bukaTahun ? '0' : '1') + '">' + (ak.bukaTahun ? '📅 Katalog 2023–2026: ON' : '📅 Katalog 2023–2026: OFF') + '</button>' +
          (live ? '<button type="button" class="chip-tombol" data-ct="slik:1">✅ Pemutihan SLIK</button>' : '<button type="button" class="chip-tombol" data-ct="hapus:' + esc(ak.id) + '">Hapus Akun</button>') +
          '</div></div>';
      }
      isi += '<h3 class="subjudul">Daftarkan Akun Pengguna Baru (mis. Akun Si A)</h3>' +
        '<div style="display:grid;grid-template-columns:1.2fr 1fr;gap:6px">' +
        '<input id="ct-nama" class="input-teks" style="margin:0" type="text" maxlength="24" placeholder="Nama (mis. Si A)">' +
        '<input id="ct-id" class="input-teks" style="margin:0" type="text" maxlength="14" placeholder="ID opsional (DRV-...)"></div>' +
        '<div style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-ct="tambahAkun:1">+ Tambah Akun</button></div>';
    } else if (tab === 'uang') {
      var tgt = towerUI.targetDana || 'bank';
      isi += '<p class="catatan" style="margin-top:0">Target akun: <b>' + esc(ak ? (ak.nama + ' (' + ak.id + ')') : 'Belum ada akun') + '</b></p>' +
        '<div class="chip-baris">' +
        [['bank', '🏦 Rekening Bank'], ['dompet', '👛 Dompet Tunai'], ['kastravel', '💼 Kas Travel']].map(function (t) {
          return '<button type="button" class="chip-tombol' + (tgt === t[0] ? ' pilih' : '') + '" data-ct="targetDana:' + t[0] + '">' + t[1] + '</button>';
        }).join('') + '</div>' +
        '<h3 class="subjudul">Top-Up / Beli Uang Cepat</h3>' +
        '<div class="grid-nominal">' +
        [[1e6, '+1jt'], [5e6, '+5jt'], [10e6, '+10jt'], [50e6, '+50jt'], [100e6, '+100jt'], [500e6, '+500jt'], [1e9, '+1M'], [5e9, '+5M']].map(function (x) {
          return '<button type="button" class="chip-tombol" data-ct="dana:' + x[0] + '">' + x[1] + '</button>';
        }).join('') + '</div>' +
        '<h3 class="subjudul">Nominal Bebas / Set Saldo Persis</h3>' +
        '<input id="ct-nominal" class="input-teks" type="number" min="0" step="100000" placeholder="Masukkan nominal Rp (mis. 25000000)">' +
        '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-ct="danaInput:add">+ Tambah Dana</button>' +
        '<button type="button" class="chip-tombol" data-ct="danaInput:set">= Set Saldo Persis</button>' +
        '<button type="button" class="chip-tombol" data-ct="setModal5jt:1">Reset Modal 5 Juta</button></div>';
    } else if (tab === 'voucher') {
      isi += '<p class="catatan" style="margin-top:0">Buat <b>Kode Aktivasi / Voucher</b> resmi untuk pengguna lain (mis. pengguna Si A yang membeli VVIP Lv 5, Mode Sandbox, atau Paket Uang). Pengguna cukup memasukkan kode ini di menu <b>Pengaturan</b> atau <b>Popup VVIP</b>.</p>' +
        '<h3 class="subjudul">Generate Kode Produk</h3>' +
        '<div class="chip-baris">' +
        '<button type="button" class="chip-tombol pilih" data-ct="genKode:vvip">🔓 Kode VVIP Lv 5</button>' +
        '<button type="button" class="chip-tombol pilih" data-ct="genKode:sandbox">🧪 Kode Mode Sandbox</button>' +
        '</div><div class="grid-nominal" style="margin-top:6px">' +
        ['5JT', '10JT', '50JT', '100JT', '500JT', '1M', '5M'].map(function (nk) {
          return '<button type="button" class="chip-tombol" data-ct="genKode:uang|' + nk + '">💰 ' + nk + '</button>';
        }).join('') + '</div>' +
        (towerUI.kodeTerakhir ? '<div class="kode-box">' + esc(towerUI.kodeTerakhir) + '</div><div class="chip-baris"><button type="button" class="chip-tombol" data-ct="salinKode:1">📋 Salin Kode</button>' + (st ? '<button type="button" class="chip-tombol pilih" data-ct="pakaiKodeLangsung:1">⚡ Pakai ke Akun Ini</button>' : '') + '</div>' : '');
    } else {
      isi += (st ? (
        '<h3 class="subjudul">Kontrol Waktu & Kondisi (Akun Aktif)</h3>' +
        '<div class="chip-baris">' +
        '<button type="button" class="chip-tombol pilih" data-ct="pulih:1">✨ Pulihkan 100% Semua Bar & BBM</button>' +
        '<button type="button" class="chip-tombol" data-ct="lompatHari:1">+1 Hari</button>' +
        '<button type="button" class="chip-tombol" data-ct="lompatHari:30">+30 Hari</button>' +
        '<button type="button" class="chip-tombol" data-ct="lompatHari:365">+1 Tahun</button>' +
        '</div><div class="chip-baris" style="margin-top:6px">' +
        '<button type="button" class="chip-tombol" data-ct="jam:420">🌅 07.00</button>' +
        '<button type="button" class="chip-tombol" data-ct="jam:720">☀️ 12.00</button>' +
        '<button type="button" class="chip-tombol" data-ct="jam:1020">🌇 17.00</button>' +
        '<button type="button" class="chip-tombol" data-ct="jam:1260">🌙 21.00</button>' +
        '<button type="button" class="chip-tombol" data-ct="cuaca:cerah">☀️ Cerah</button>' +
        '<button type="button" class="chip-tombol" data-ct="cuaca:hujan">🌧️ Hujan</button>' +
        '</div>'
      ) : '<p class="catatan">Masuk ke dalam game terlebih dahulu untuk memakai kontrol waktu/cuaca langsung.</p>') +
      '<h3 class="subjudul">Log Aktivitas Control Tower</h3>' +
      '<ul class="daftar">' + (TOWER.logTerbaru().length ? TOWER.logTerbaru().map(function (lg) {
        return '<li><span><small>' + esc(lg.t) + ' · ' + esc(lg.teks) + '</small></span></li>';
      }).join('') : '<li><span><small>Belum ada aktivitas tercatat.</small></span></li>') + '</ul>';
    }
    bukaLembar('tower',
      kepala('🗼 Control Tower', st ? ('Akun aktif: ' + (st.namaPemain || 'Driver') + ' (' + (st.akunId || '-') + ')') : 'Mode Layar Luar (Admin Console)') +
      '<div class="tower-banner"><small>OWNER ADMIN CONSOLE · THE DRIVER</small><b>Kontrol Akun, Mode VVIP Lv 5, Sandbox, Dana & Voucher</b></div>' +
      tabsHtml + pesanHtml + isi);
  }
  function aksiTower(cmd, val) {
    if (!TOWER) return;
    var st = stateTower();
    towerUI.pesan = ''; towerUI.salah = false;
    var sc = $('lembar-isi') ? $('lembar-isi').scrollTop : 0;
    if (cmd === 'tab') { towerUI.tab = val; return bukaControlTower(); }
    if (cmd === 'pilih') { towerUI.pilihId = val; return bukaControlTower(); }
    if (cmd === 'targetDana') { towerUI.targetDana = val; return bukaControlTower(); }
    if (cmd === 'tambahAkun') {
      var nm = $('ct-nama') ? $('ct-nama').value : '', cid = $('ct-id') ? $('ct-id').value : '';
      var rT = TOWER.tambahAkun(nm, cid);
      if (rT && rT.ok) { towerUI.pilihId = rT.akun.id; towerUI.pesan = rT.teks; } else { towerUI.pesan = rT; towerUI.salah = true; }
      return bukaControlTower();
    }
    if (cmd === 'hapus') {
      var rH = TOWER.hapusAkun(val, st);
      if (rH && rH.ok) { towerUI.pilihId = null; towerUI.pesan = rH.teks; } else { towerUI.pesan = rH; towerUI.salah = true; }
      return bukaControlTower();
    }
    if (cmd === 'fitur') {
      var p = val.split('|');
      var rF = TOWER.setFiturAkun(towerUI.pilihId, p[0], p[1] === '1', st);
      if (rF && rF.ok) { towerUI.pesan = rF.teks; simpanStateTower(st); } else { towerUI.pesan = rF; towerUI.salah = true; }
      bukaControlTower(); if ($('lembar-isi')) $('lembar-isi').scrollTop = sc; return;
    }
    if (cmd === 'slik') {
      var rS = TOWER.putihkanSlik(st);
      if (rS && rS.ok) { towerUI.pesan = rS.teks; simpanStateTower(st); } else { towerUI.pesan = rS; towerUI.salah = true; }
      return bukaControlTower();
    }
    if (cmd === 'dana') {
      var rD = TOWER.suntikDanaAkun(towerUI.pilihId, +val, towerUI.targetDana, st, false);
      if (rD && rD.ok) { towerUI.pesan = rD.teks; simpanStateTower(st); } else { towerUI.pesan = rD; towerUI.salah = true; }
      bukaControlTower(); if ($('lembar-isi')) $('lembar-isi').scrollTop = sc; return;
    }
    if (cmd === 'danaInput') {
      var nom = $('ct-nominal') ? +$('ct-nominal').value : 0;
      var rI = TOWER.suntikDanaAkun(towerUI.pilihId, nom, towerUI.targetDana, st, val === 'set');
      if (rI && rI.ok) { towerUI.pesan = rI.teks; simpanStateTower(st); } else { towerUI.pesan = rI; towerUI.salah = true; }
      bukaControlTower(); if ($('lembar-isi')) $('lembar-isi').scrollTop = sc; return;
    }
    if (cmd === 'setModal5jt') {
      if (st && st.akunId === towerUI.pilihId) {
        TOWER.suntikDanaAkun(towerUI.pilihId, 4850000, 'bank', st, true);
        TOWER.suntikDanaAkun(towerUI.pilihId, 150000, 'dompet', st, true);
        simpanStateTower(st);
        towerUI.pesan = 'Saldo akun aktif di-reset tepat ke modal awal Rp5.000.000 (Rp4.850.000 bank + Rp150.000 dompet).';
      } else {
        towerUI.pesan = 'Pilih akun aktif dulu untuk reset modal 5 juta.'; towerUI.salah = true;
      }
      return bukaControlTower();
    }
    if (cmd === 'genKode') {
      var gp = val.split('|'), akObj = TOWER.daftarAkun(st).filter(function (a) { return a.id === towerUI.pilihId; })[0];
      var kd = TOWER.buatKode(gp[0], gp[1], akObj ? akObj.nama : '');
      if (kd) { towerUI.kodeTerakhir = kd; towerUI.pesan = 'Kode aktivasi berhasil dibuat! Kirim ke pengguna target.'; }
      return bukaControlTower();
    }
    if (cmd === 'salinKode') {
      if (towerUI.kodeTerakhir && navigator.clipboard && navigator.clipboard.writeText) {
        try { navigator.clipboard.writeText(towerUI.kodeTerakhir); } catch (e) {}
      }
      towerUI.pesan = 'Kode ' + towerUI.kodeTerakhir + ' siap ditempel.';
      return bukaControlTower();
    }
    if (cmd === 'pakaiKodeLangsung') {
      var rP = TOWER.redeemKode(st, towerUI.kodeTerakhir);
      if (rP && rP.ok) { towerUI.pesan = rP.teks; simpanStateTower(st); } else { towerUI.pesan = rP; towerUI.salah = true; }
      return bukaControlTower();
    }
    if (cmd === 'pulih') {
      var rPu = TOWER.pulihkanSemua(st);
      if (rPu && rPu.ok) { towerUI.pesan = rPu.teks; simpanStateTower(st); } else { towerUI.pesan = rPu; towerUI.salah = true; }
      return bukaControlTower();
    }
    if (cmd === 'lompatHari' && st) {
      var jh = Math.max(1, +val || 1);
      st.hari += jh; st.hariKe = (st.hariKe || 1) + jh;
      simpanStateTower(st);
      towerUI.pesan = 'Waktu maju +' + jh + ' hari (sekarang ' + namaTanggal(st.hari, true) + ' ' + KAL.tgl(st.hari).y + ').';
      return bukaControlTower();
    }
    if (cmd === 'jam' && st) {
      st.menit = +val || 420;
      simpanStateTower(st);
      towerUI.pesan = 'Jam diatur ke ' + jam(st.menit) + '.';
      return bukaControlTower();
    }
    if (cmd === 'cuaca' && st) {
      st.dunia = st.dunia || { cuaca: {} };
      st.dunia.cuaca = val === 'hujan' ? { hujan: true, mulai: 0, sampai: 1440, banjir: false } : { hujan: false, mulai: 0, sampai: 0, banjir: false };
      simpanStateTower(st);
      towerUI.pesan = 'Cuaca diubah ke ' + (val === 'hujan' ? 'Hujan 🌧️' : 'Cerah ☀️') + '.';
      return bukaControlTower();
    }
  }

  /* baris percepatan (gigi) untuk kendaraan sehari-hari: normal 1–4 realistis, Level 5 terkunci 🔒 khusus Mode VVIP */
  var seretGigi = false;
  function bukaPopupVvip() {
    var aktif = TRAVEL.vvipAktif(S), pernah = !!(S.vvip && S.vvip.pernahBeli), biaya = TRAVEL.VVIP_HARGA || 50000000;
    bukaLembar('vvip',
      kepala(aktif ? '🔓 Mode VVIP Aktif' : '🔒 Gembok Mode VVIP (Level 5)', 'Kecepatan Top Speed Kendaraan') +
      '<div class="saldo-ringkas" style="background:' + (aktif ? '#1f8a80' : '#4a3a7a') + '"><div><small>Status Mode VVIP</small><b>' + (aktif ? 'TERBUKA 🔓' : 'TERKUNCI 🔒') + '</b></div>' +
      '<div><small>Biaya Buka Gembok</small><b>' + (pernah ? 'Sudah Dibeli ✓' : rupiah(biaya)) + '</b></div></div>' +
      '<ul class="daftar angka">' +
      baris('Mode Normal (Gratis)', 'Level 1 – 4 · Kecepatan realistis sesuai kondisi jalan (tol/mulus/rusak/hujan)') +
      baris('Mode VVIP (Berbayar)', 'Membuka gembok 🔒 Level 5 (Top Speed penuh mobil & motor)') +
      '</ul>' +
      '<div class="chip-baris" style="margin-top:10px">' +
      (aktif
        ? '<button type="button" class="chip-tombol" data-vvip="kunci">🔒 Kunci Kembali ke Normal (Lv 1–4)</button>'
        : '<button type="button" class="aksi" data-vvip="buka">' + (pernah ? '🔓 Buka Kembali Mode VVIP' : '🔓 Buka Gembok VVIP (' + rupiah(biaya) + ')') + '</button>') +
      '</div>' +
      (!aktif ? '<div class="atur-baris" style="display:block;margin-top:10px"><div><b>🎟️ Punya Kode Aktivasi VVIP?</b><span>Masukkan kode dari Admin / Control Tower</span></div><div style="display:flex;gap:6px;margin-top:6px"><input id="in-voucher" class="input-teks" style="margin:0;flex:1" type="text" maxlength="28" placeholder="TD-VVIP-XXXX-XXXX"><button type="button" class="chip-tombol pilih" data-voucher="redeem">Tukar</button></div></div>' : '') +
      '<p class="catatan">Tanpa Mode VVIP, batas kecepatan maksimal adalah Level 4 dengan perhitungan kecepatan asli sesuai kondisi jalan & cuaca. Mode VVIP bisa dikunci atau dibuka kembali kapan saja di Pengaturan.</p>');
  }
  function labelGigi(jenis, id) {
    var vvip = TRAVEL.vvipAktif(S);
    var gi = RUTE.gigiInfo(S, jenis === 'mobil' ? 'mobil' : 'motor', id);
    if (gi.id === 5 && !vvip) return '🔒 Level 5 (VVIP Terkunci)';
    if (jenis === 'mobil' && gi.id === 5 && S.travel && S.travel.aktif) return '🔓 Lv 5 VVIP · ' + gi.hi + ' km/j';
    if (gi.id === 5) return '🔓 Lv 5 VVIP · ' + gi.lo + '–' + gi.hi + ' km/j';
    return 'Level ' + gi.nama + ' · ' + gi.lo + '–' + gi.hi + ' km/j';
  }
  function barisGigi(jenis) {
    var vvip = TRAVEL.vvipAktif(S), gi = RUTE.gigiInfo(S, jenis);
    var val = vvip ? gi.id : Math.min(4, gi.id);
    return '<div class="gigi-slider"><span id="gigi-label">' + labelGigi(jenis, val) + '</span>' +
      '<input type="range" min="1" max="5" step="1" value="' + val + '" data-gigi="ojek:' + jenis + '" aria-label="Level kecepatan">' +
      '<button type="button" class="chip-tombol" style="padding:2px 7px;font-size:11px;flex-shrink:0" data-vvip="popup">' + (vvip ? '🔓 VVIP' : '🔒 Lv5') + '</button></div>';
  }
  function jenisKendaraanJalan() {
    if (S.ojek && S.ojek.online) return S.ojek.mode === 'mobil' ? 'mobil' : 'motor';
    if (S.travel && S.travel.aktif) return 'mobil';
    var adaOjol = N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    return (S.mobil && (!S.motor || !adaOjol)) ? 'mobil' : 'motor';
  }
  function panelOjek(paksa) {
    var o = S.ojek, f = OJEK.fase(S), x, jnK = o.mode === 'mobil' ? 'mobil' : 'motor';
    var k = (S.gigiJalan || 2) + '|' + (TRAVEL.vvipAktif(S) ? 'V' : 'N') + '|' + jnK + '|' + (o.mult || 1) + (S.hiburan || '-') + (S.motor ? S.motor.id : '') + (!o.online ? 'off' : o.trip ? 'trip' + o.trip.x.nama + o.trip.x.km + f.status : o.tawaran ? 'tw' + o.tawaran.nama + o.tawaran.km : 'sb' + o.hariIni.trip);
    if (seretGigi || (!paksa && k === panelKunci)) return; panelKunci = k;
    var el = $('ojek-panel'), html = '';
    if (!o.online) { el.innerHTML = ''; return; }
    if (o.trip) {
      x = o.trip.x;
      var langkah = f.status === 'jemput' ? (x.jenis === 'makanan' ? 'Ke resto, ambil pesanan ' + x.nama : x.jenis === 'barang' ? 'Ambil paket di tempat ' + x.nama : 'Jemput ' + x.nama) : (x.jenis === 'penumpang' ? 'Antar ' + x.nama + ' ke tujuan' : 'Antar ' + NAMA_JENIS[x.jenis] + ' ke ' + x.nama);
      html = '<div class="ojek-bare"><div class="meteran"><i id="ojek-maju"></i></div>' + barisGigi(jnK) + '</div>';
    } else if (o.tawaran) {
      x = o.tawaran;
      html = '<div class="ojek-kartu tawaran"><b>Order ' + esc(x.layanan) + (x.mobil && x.km >= 80 ? ' [ANTARKOTA 🔥]' : x.jarakJauh ? ' [JARAK JAUH 🔥]' : '') + ' · ' + rupiah(x.tarif) + '</b><small>Jemput ' + x.jemput.toLocaleString('id-ID') + ' km · antar ' + x.km.toLocaleString('id-ID') + ' km' + (x.tunai ? ' · bayar tunai' : '') + ' · kamu dapat ' + rupiah(x.bersih) + '</small>' +
        '<div class="meteran"><i id="ojek-sisa"></i></div>' + barisGigi(jnK) + '<div class="ojek-tombol"><button type="button" class="chip-tombol" data-ojek="lewati">Lewati</button><button type="button" class="chip-tombol" data-ojek="berhenti">Berhenti</button><button type="button" class="aksi" data-ojek="ambil">Ambil order</button></div></div>';
    } else {
      var mO = o.mult || 1, pct = Math.round((mO - 1) * 100), lblT = pct === 0 ? 'Standar' : (pct > 0 ? '+' + pct + '%' : pct + '%');
      var nmOn = jnK === 'mobil' ? (o.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(o.platform).nama;
      html = '<div class="ojek-kartu kecil"><b>Online ' + esc(nmOn) + ' · menunggu order</b><small>' + (OJEK.jarakRumah ? OJEK.jarakRumah(S).toLocaleString('id-ID') : 0) + ' km dari rumah · hari ini ' + o.hariIni.trip + ' order, ' + rupiah(o.hariIni.bersih) + ' · Tarif ' + lblT + '</small>' +
        barisGigi(jnK) + chipHiburan() + '<div class="ojek-tombol"><button type="button" class="chip-tombol" data-ojek="tarif:-0.1">Tarif −</button><button type="button" class="chip-tombol" data-ojek="tarif:0.1">Tarif +</button><button type="button" class="chip-tombol" data-ojek="inapMenu">Penginapan / Hotel</button><button type="button" class="chip-tombol" data-ojek="tidurJalan:2">Tidur 2j</button><button type="button" class="chip-tombol" data-ojek="berhenti">Berhenti</button></div></div>';
    }
    el.innerHTML = html;
  }
  function aksiOjek(nama) {
    if (nama.indexOf('gigi:') === 0) {
      var gn = Math.max(1, Math.min(5, +nama.split(':')[1]));
      if (gn === 5 && !TRAVEL.vvipAktif(S)) { bukaPopupVvip(); panelOjek(true); return; }
      if (gn === 5 && !RUTE.bolehKhususJalan(S)) { toast('Hujan deras: kecepatan dibatasi sampai level 4.', 2200); panelOjek(true); return; }
      S.gigiJalan = gn; simpan(); panelOjek(true); return;
    }
    if (nama.indexOf('tarif:') === 0) { OJEK.ubahTarif(S, +nama.split(':')[1]); simpan(); panelOjek(true); return; }
    if (nama === 'inapMenu') {
      bukaLembar('inapLuar', kepala('Penginapan & Hotel', 'Istirahat nyaman di luar rumah') +
        '<ul class="daftar belanja">' + (DIRI.PENGINAPAN_LUAR || []).map(function (p) {
          return '<li><span><b>' + esc(p.nama) + '</b><small>' + p.jam + ' jam · ' + esc(p.ket) + '</small><small class="harga">' + rupiah(p.harga) + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="inapLuar:' + p.id + '">Pilih</button></span></li>';
        }).join('') + '</ul>');
      return;
    }
    if (nama.indexOf('tidurJalan:') === 0) return tidurJalan(+nama.split(':')[1]);
    if (nama.indexOf('hiburan:') === 0) {
      var hk = nama.split(':')[1];
      if (S.hiburan === hk) { S.hiburan = null; toast(DIRI.HIBURAN[hk].nama + ' dihentikan.', 1600); }
      else {
        var pbOkH = !!(S.hp && S.hp.pbPasang && DIRI.pbAktifInfo && DIRI.pbAktifInfo(S) && DIRI.pbAktifInfo(S).state.sisaMah > 0);
        if (S.hp && (S.hp.baterai || 0) <= 0.5 && !pbOkH) { toast('Baterai HP habis! Cas HP atau sambungkan Power Bank dulu.', 2200); return; }
        if (!DIRI.adaWifi(S) && S.hp) {
          if (S.hp.masaAktif != null && S.hari > S.hp.masaAktif) { toast('Masa aktif kartu HP sudah habis! Isi pulsa dulu di Gadget & Kuota.', 2400); return; }
          if ((S.hp.kuota || 0) <= 0.0001 && (S.hp.pulsa || 0) < 500) { toast('Kuota internet & pulsa habis! Beli kuota/pulsa di Gadget & Kuota.', 2200); return; }
        }
        S.hiburan = hk;
        if (!S.kec || S.kec <= 0) S.kec = 1;
        toast(DIRI.HIBURAN[hk].nama + ' aktif (waktu menunggu dipercepat 8×).', 2000);
      }
      travelKunci = '';
      simpan(); panelOjek(true); if (S.travel && S.travel.aktif) panelTravel(true); perbaruiHUD(true); return;
    }
    if (nama === 'ambil') { var r = OJEK.ambil(S); if (r !== true) toast(r, 2200); else { tawaranUmur = 0; if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {} } }
    else if (nama === 'lewati') { OJEK.lewati(S); tawaranUmur = 0; }
    else if (nama === 'batal') {
      var rb = OJEK.batalTrip(S);
      var nmBtl = S.ojek.mode === 'mobil' ? (S.ojek.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(S.ojek.platform).nama;
      if (rb === true) toast('Order ' + nmBtl + ' dibatalkan. Kamu kembali standby.', 2200);
      else toast(rb, 2000);
    }
    else if (nama === 'berhenti') return berhentiNarik();
    panelOjek(true); perbaruiHUD(true); simpan();
  }
  /* ---------- Travel antarkota ---------- */
  var travelKunci = '', kosongKonfirm = false, travelMini = false;
  function jamTeks(j) { var m = Math.round(j * 60), h = Math.floor(m / 60); return h ? h + ' j' + (m % 60 ? ' ' + (m % 60) + ' m' : '') : m + ' m'; }
  function ikonTipe(t) { return t === 'cepat' ? '⚡' : t === 'santai' ? '🐢' : '🙂'; }
  function mulaiTravel() {
    var r = TRAVEL.mulai(S); if (r !== true) { app.pesan = r; app.salah = true; return bukaHP('travel'); }
    tutupLembar(); if (R) tutupRacik();
    S.diri.posisi = 'kedai'; S.travel.di = S.kota; travelKunci = ''; kosongKonfirm = false;
    if (!S.kec || S.kec <= 0) S.kec = 1;
    perbaruiAksi(); perbaruiHUD(true); simpan();
    toast('Travel dimulai di ' + RUTE.nama(S.kota) + '. Pilih tujuan, lalu tunggu kursi terisi.', 2800);
  }
  function trvLive(f) {
    var T = S.travel, m = S.mobil, mj = $('trv-maju'), ki = $('trv-info'), kh = $('trv-kmh');
    if (!T.trip || !mj) return;
    mj.style.width = ((f.mode === 'kapal' ? f.u : f.kemajuan) * 100).toFixed(1) + '%';
    var est = TRAVEL.estimasi(S), v = TRAVEL.kecepatan(S);
    if (kh) kh.textContent = f.mode === 'kapal' ? 'di kapal' : Math.round(f.kmh) + ' km/j';
    if (ki) ki.textContent = (f.mode === 'kapal' ? 'Sisa penyeberangan ±' + jamTeks(Math.max(0, T.trip.sisaKapal) / 60) : 'Sisa ' + Math.round(f.sisaKm).toLocaleString('id-ID') + ' km · tiba ±' + jamTeks(est) + ' lagi' + (f.namaKondisi ? ' · ' + f.namaKondisi : '')) +
      ' · ' + (m && m.bbm === 'listrik' ? 'baterai ' : 'bensin ') + Math.round((m ? m.isi : 0) * 100) + '%' + (v.ket && f.mode !== 'kapal' ? ' · ' + v.ket : '') + (f.namaJalan ? ' · ' + f.namaJalan : '');
  }
  function panelTravel(paksa) {
    var T = S.travel, el = $('travel-panel');
    if (!T.aktif) { el.innerHTML = ''; travelKunci = ''; return; }
    var f = TRAVEL.fase(S), key = [travelMini ? 1 : 0, S.hiburan || '-', T.status, T.tujuan, T.antri.length, T.gigi, T.mult, T.di, T.trip ? T.trip.idx : '', f.mode, TRAVEL.bolehKhusus(S) ? 1 : 0, T.jemput].join('|');
    if (!paksa && key === travelKunci) return trvLive(f);
    travelKunci = key; var html, tMini = '<button type="button" class="chip-tombol" data-trv="mini">' + (travelMini ? 'Panel ▴' : 'Ciutkan ▾') + '</button>';
    if (f.mode === 'kota') {
      var rc = T.tujuan ? TRAVEL.rencana(S, T.tujuan) : null, chips = '';
      if (travelMini) {
        html = '<div class="ojek-kartu travel mini"><b>Pool ' + esc(RUTE.nama(T.di)) + ' · ' + T.antri.length + '/' + f.kursi + ' penumpang' + (rc ? ' → ' + esc(rc.nama) : '') + (S.hiburan && DIRI.HIBURAN[S.hiburan] ? ' · 📺 ' + DIRI.HIBURAN[S.hiburan].nama + ' (8×)' : '') + '</b>' + chipHiburan() + '<div class="ojek-tombol"><button type="button" class="aksi" data-trv="berangkat"' + (rc ? '' : ' disabled') + '>Berangkat</button>' + tMini + '</div></div>';
      } else {
        T.antri.forEach(function (p) { chips += '<span class="chip-pnp ' + p.tipe + '">' + ikonTipe(p.tipe) + ' ' + esc(p.nama.split(' ')[0]) + '</span>'; });
        for (var i = T.antri.length; i < f.kursi; i++) chips += '<span class="chip-pnp kosong">○</span>';
        html = '<div class="ojek-kartu travel"><b>Pool travel · ' + esc(RUTE.nama(T.di)) + (S.hiburan && DIRI.HIBURAN[S.hiburan] ? ' · 📺 ' + DIRI.HIBURAN[S.hiburan].nama + ' (8×)' : '') + '</b><small>' +
          (rc ? esc(rc.nama) + ' · ' + rc.km.toLocaleString('id-ID') + ' km · ±' + jamTeks(rc.jam) + (rc.tol ? ' · tol ' + rupiah(rc.tol) : '') + (rc.laut ? ' · kapal ' + rupiah(rc.laut) : '') + ' · ' + rupiah(rc.tarif) + '/kursi (×' + T.mult.toLocaleString('id-ID') + ')' : 'Belum ada tujuan. Pilih kota tujuan dulu.') + '</small>' +
          '<div class="pnp-baris">' + chips + '</div>' + chipHiburan() +
          '<div class="ojek-tombol"><button type="button" class="chip-tombol pilih" data-trv="pilih">Tujuan</button>' +
          (rc ? '<button type="button" class="chip-tombol" data-trv="tarif:-0.1">Tarif −</button><button type="button" class="chip-tombol" data-trv="tarif:0.1">Tarif +</button>' : '') +
          (rc && T.antri.length < f.kursi && T.jemput < TRAVEL.JEMPUT_MAKS ? '<button type="button" class="chip-tombol" data-trv="jemput">Jemput</button>' : '') +
          '<button type="button" class="chip-tombol" data-trv="henti">Istirahat</button></div>' +
          '<div class="ojek-tombol"><button type="button" class="aksi" data-trv="berangkat"' + (rc ? '' : ' disabled') + '>' + (T.antri.length ? 'Berangkat (' + T.antri.length + ')' : 'Berangkat kosong') + '</button>' +
          (T.di === S.kota ? '<button type="button" class="chip-tombol" data-trv="selesai">Selesai</button>' : '<button type="button" class="chip-tombol" data-trv="selesaiPaksa">Selesai & Pulang ke ' + esc(RUTE.nama(S.kota)) + '</button>') + tMini + '</div></div>';
      }
    } else if (f.mode === 'kapal') {
      html = '<div class="ojek-kartu travel"><b>Menyeberang ' + esc(RUTE.nama(f.dari)) + ' → ' + esc(RUTE.nama(f.ke)) + ' · <span id="trv-kmh"></span>' + (S.hiburan && DIRI.HIBURAN[S.hiburan] ? ' · 📺 ' + DIRI.HIBURAN[S.hiburan].nama : '') + '</b><small id="trv-info"></small><div class="meteran"><i id="trv-maju"></i></div>' +
        (travelMini ? '' : '<small>Kamu dan penumpang istirahat di kapal, badan pulih pelan.</small>' + chipHiburan()) + '<div class="ojek-tombol">' + tMini + '</div></div>';
    } else {
      var vvipT = TRAVEL.vvipAktif(S), valT = vvipT ? Math.min(5, T.gigi || 3) : Math.min(4, T.gigi || 3);
      var gr = '<div class="gigi-slider"><span id="gigi-label">' + labelGigi('mobil', valT) + '</span>' +
        '<input type="range" min="1" max="5" step="1" value="' + valT + '" data-gigi="trv" aria-label="Level kecepatan">' +
        '<button type="button" class="chip-tombol" style="padding:2px 7px;font-size:11px;flex-shrink:0" data-vvip="popup">' + (vvipT ? '🔓 VVIP' : '🔒 Lv5') + '</button></div>';
      html = '<div class="ojek-bare"><div class="meteran"><i id="trv-maju"></i></div>' + gr + '<div class="ojek-tombol"><button type="button" class="chip-tombol" data-trv="henti">Berhenti / bensin / istirahat</button></div></div>';
    }
    el.innerHTML = html; if (f.mode !== 'kota') trvLive(f);
  }
  var FILTER_WIL = [
    ['semua', 'Semua'],
    ['Kalimantan Barat', 'Kalbar'],
    ['Kalimantan Tengah', 'Kalteng'],
    ['Kalimantan Selatan', 'Kalsel'],
    ['Kalimantan Timur', 'Kaltim'],
    ['Kalimantan Utara', 'Kaltara'],
    ['Sumatra', 'Sumatra'],
    ['Jawa', 'Jawa'],
    ['lain', 'Bali–Papua']
  ];
  function cocokFilterWil(k, flt) {
    if (!flt || flt === 'semua') return true;
    if (flt === 'lain') return k.pulau !== 'Kalimantan' && k.pulau !== 'Sumatra' && k.pulau !== 'Jawa';
    return k.prov === flt || k.pulau === flt;
  }
  function bukaTujuanTravel(pesan) {
    var T = S.travel, flt = app.trvFilter || 'semua';
    var ids = Object.keys(RUTE.kota).filter(function (id) { return id !== T.di && cocokFilterWil(RUTE.kota[id], flt); }).map(function (id) { return { id: id, rc: TRAVEL.rencana(S, id) }; }).filter(function (x) { return x.rc; });
    ids.sort(function (a, b) { return a.rc.km - b.rc.km; });
    var chipF = '<div class="chip-baris" style="margin-bottom:8px">' + FILTER_WIL.map(function (fw) {
      return '<button type="button" class="chip-tombol' + (fw[0] === flt ? ' pilih' : '') + '" data-trv="filter:' + fw[0] + '">' + fw[1] + '</button>';
    }).join('') + '</div>';
    bukaLembar('travelTujuan', kepala('Pilih tujuan (' + ids.length + ' daerah)', 'Dari ' + RUTE.nama(T.di) + ' · tarif ×' + T.mult.toLocaleString('id-ID')) + chipF + (pesan ? '<p class="racik-pesan salah">' + esc(pesan) + '</p>' : '') +
      '<ul class="daftar belanja">' + ids.map(function (x) {
        var rc = x.rc, k = RUTE.kota[x.id], lewat = rc.jalur.simpul.slice(1, -1).map(RUTE.nama);
        var kdLbl = (RUTE.kondisiJalan && RUTE.kondisiJalan[rc.kondisi] && RUTE.kondisiJalan[rc.kondisi].nama) || 'Aspal Mulus';
        var satBbm = S.mobil && S.mobil.bbm === 'listrik' ? ' kWh' : ' L';
        return '<li><span><b>' + esc(k.nama) + '</b>' +
          '<small>' + esc(k.prov || k.pulau) + (k.luas ? ' · Luas ' + k.luas.toLocaleString('id-ID') + ' km²' : '') + ' · ' + rc.km.toLocaleString('id-ID') + ' km · ±' + jamTeks(rc.jam) + '</small>' +
          '<small>Kondisi jalan: <b>' + esc(kdLbl) + '</b>' + (rc.namaJalan ? ' · ' + esc(rc.namaJalan) : '') + (rc.tol ? ' · tol ' + rupiah(rc.tol) : '') + (rc.laut ? ' · kapal ' + rupiah(rc.laut) : '') + '</small>' +
          '<small>' + (S.mobil && S.mobil.bbm === 'listrik' ? 'Daya' : 'BBM') + ' ±' + Math.round(rc.liter) + satBbm + ' (' + rupiah(rc.biayaBbm) + ')' + (lewat.length ? ' · lewat ' + esc(lewat.slice(0, 4).join(', ') + (lewat.length > 4 ? '…' : '')) : '') + '</small><small class="harga">' + rupiah(rc.tarif) + ' per kursi</small></span>' +
          '<span><button type="button" class="chip-tombol pilih" data-trv="tujuan:' + x.id + '">Pilih</button></span></li>';
      }).join('') + '</ul><div style="margin-top:16px"><button type="button" class="aksi" data-tutup>Batal</button></div>');
  }
  function bukaHentiTravel(pesan) {
    var T = S.travel, m = S.mobil, I = RUTE.istirahat, di = S.diri, jalan = T.status === 'jalan' || T.status === 'kapal', evT = !!(m && m.bbm === 'listrik');
    bukaLembar('travelHenti', kepala(jalan ? 'Berhenti sebentar' : 'Istirahat', 'Pukul ' + jam(S.menit)) + (pesan ? '<p class="racik-pesan salah">' + esc(pesan) + '</p>' : '') +
      '<ul class="daftar angka">' + baris('Makan', Math.round(di.kenyang) + '%') + baris('Minum', Math.round(di.minum) + '%') + baris('Stamina', Math.round(di.stamina) + '%') + baris(evT ? 'Baterai EV' : 'Bensin', Math.round((m ? m.isi : 0) * 100) + '%') + '</ul>' +
      '<ul class="daftar belanja">' + Object.keys(I).map(function (k) {
        var x = I[k], ket = (x.biaya ? rupiah(x.biaya) + ' · ' : 'Gratis · ') + (x.menit >= 60 ? (x.menit / 60) + ' jam' : x.menit + ' menit');
        var efek = k === 'makan' ? 'Isi makan dan minum' : k === 'penginapan' ? 'Pulihkan stamina penuh' : k === 'rehat' ? 'Pulihkan stamina' : 'Pulihkan stamina sedikit';
        return '<li><span><b>' + esc(x.nama) + '</b><small>' + ket + '</small><small>' + efek + (T.antri.length && (k === 'penginapan' || k === 'rehat') ? ' · penumpang bisa kesal' : '') + '</small></span><span><button type="button" class="chip-tombol pilih" data-trv="isti:' + k + '">Pilih</button></span></li>';
      }).join('') + '<li><span><b>' + (evT ? 'Cas SPKLU mobil listrik' : 'Isi bensin ' + (m ? esc(N.bbm.nama[m.bbm] || m.bbm) : '')) + '</b><small>Dibayar dari Kas Travel, 10 menit</small></span><span class="chip-baris"><button type="button" class="chip-tombol" data-trv="bbm:10">10 ' + (evT ? 'kWh' : 'L') + '</button><button type="button" class="chip-tombol pilih" data-trv="bbm:penuh">Penuh</button></span></li></ul>' +
      '<div style="margin-top:16px"><button type="button" class="aksi" data-tutup>Lanjut jalan</button></div>');
  }
  function bukaLaporanTravel() {
    var T = S.travel, L = T.laporan; if (!L) return; T.laporan = null; simpan();
    var tipeNama = { cepat: 'minta cepat', santai: 'minta santai', biasa: 'biasa' };
    bukaLembar('travelLaporan', kepala('Tiba di ' + RUTE.nama(L.ke), 'Dari ' + RUTE.nama(L.dari) + ' · pukul ' + jam(S.menit)) +
      '<ul class="daftar angka">' + baris('Jarak dan waktu', L.km.toLocaleString('id-ID') + ' km · ' + jamTeks(L.menit / 60)) + baris('Penumpang', L.penumpang.length) + baris('Ongkos penumpang', rupiah(L.pendapatan)) + (L.tip ? baris('Tip', rupiah(L.tip)) : '') +
      (L.tunai ? baris('Masuk dompet (Tunai)', rupiah(L.tunai)) : '') + (L.qris ? baris('Masuk QRIS (cair besok)', rupiah(L.qris)) : '') +
      baris('Tol', '−' + rupiah(L.tol)) + (L.kapal ? baris('Kapal', '−' + rupiah(L.kapal)) : '') + baris(L.ev ? 'Daya terpakai' : 'Bensin terpakai', L.bensinLiter.toLocaleString('id-ID') + (L.ev ? ' kWh' : ' L')) + baris('Nilai kamu sekarang', '★ ' + L.rating.toLocaleString('id-ID')) + '</ul>' +
      (L.penumpang.length ? '<h3 class="subjudul">Penumpang</h3><ul class="daftar kabar">' + L.penumpang.map(function (p) { return '<li><span>' + ikonTipe(p.tipe) + ' <b>' + esc(p.nama) + '</b> · ★ ' + p.nilai.toLocaleString('id-ID') + ' · ' + rupiah(p.bayar) + (p.ket ? '<br><small>' + esc(p.ket) + '</small>' : '') + '</span></li>'; }).join('') + '</ul>' : '') +
      (L.kejadian.length ? '<h3 class="subjudul">Di perjalanan</h3><ul class="daftar kabar">' + L.kejadian.map(function (k) { return '<li><span>' + esc(k) + '</span></li>'; }).join('') + '</ul>' : '') +
      '<div style="margin-top:16px"><button type="button" class="aksi" data-tutup>Lanjut</button></div>');
  }
  function aksiTravel(nama, nilai) {
    var r;
    if (nama === 'mini') { travelMini = !travelMini; travelKunci = ''; return panelTravel(true); }
    if (nama === 'gigiRel') { var gn = Math.max(1, Math.min(5, S.travel.gigi + (+nilai))); r = TRAVEL.setGigi(S, gn); if (r !== true) toast(r, 2000); travelKunci = ''; return panelTravel(true); }
    if (nama === 'pilih') return bukaTujuanTravel();
    if (nama === 'filter') { app.trvFilter = nilai; return bukaTujuanTravel(); }
    if (nama === 'henti') return bukaHentiTravel();
    if (nama === 'tujuan') { r = TRAVEL.pilihTujuan(S, nilai); if (r !== true) return bukaTujuanTravel(r); tutupLembar(); }
    else if (nama === 'tarif') TRAVEL.ubahTarif(S, +nilai);
    else if (nama === 'jemput') { r = TRAVEL.jemput(S); if (r && r.ok) { lompatWaktu(r.menit); toast(r.teks, 2400); } else toast(r, 2200); }
    else if (nama === 'berangkat') {
      if (!S.travel.antri.length && !kosongKonfirm) { kosongKonfirm = true; return toast('Belum ada penumpang. Tekan Berangkat lagi kalau mau jalan kosong, atau tunggu kursi terisi.', 3200); }
      kosongKonfirm = false; r = TRAVEL.berangkat(S);
      if (r && r.ok) toast(r.teks + (r.kabar.length ? ' ' + r.kabar.join(' ') : ''), 3000); else return toast(r, 2800);
    }
    else if (nama === 'gigi') { r = TRAVEL.setGigi(S, nilai); if (r !== true) toast(r, 2600); }
    else if (nama === 'isti') {
      r = TRAVEL.istirahat(S, nilai);
      if (r && r.ok) { tutupLembar(); lompatWaktu(r.menit); toast(r.teks, 2600); } else return bukaHentiTravel(r);
    }
    else if (nama === 'bbm') {
      r = TRAVEL.isiBensin(S, nilai);
      if (r && r.ok) { tutupLembar(); lompatWaktu(r.menit); toast(r.teks, 2400); } else return bukaHentiTravel(typeof r === 'string' ? r : 'Gagal isi bensin.');
    }
    else if (nama === 'selesai' || nama === 'selesaiPaksa') {
      r = TRAVEL.selesaiParkir(S, nama === 'selesaiPaksa'); if (r !== true) return toast(r, 2800);
      perbaruiAksi(); toast('Travel selesai. Mobil diparkir di ' + RUTE.nama(S.kota) + '.', 2400);
    }
    travelKunci = ''; panelTravel(true); perbaruiHUD(true); simpan();
  }
  function layarTravel() {
    var T = TRAVEL.siapkan(S), m = S.mobil, e = TRAVEL.bisaMulai(S), asal = T.aktif ? (T.di || S.kota) : S.kota, kota = RUTE.nama(asal);
    var tab = app.travelTab || 'sendiri', flt = app.trvFilter || 'semua';
    var html = kepalaApp('Travel antarkota', T.aktif ? 'Sedang di ' + kota : 'Siap berangkat dari ' + kota) +
      chipTab('travelTab', [['sendiri', '🚐 Travel Sendiri'], ['supir', '👨‍✈️ Supir Travel (' + (T.supir ? T.supir.length : 0) + ')']], tab) + pesanApp();
    if (tab === 'supir') {
      var listMblP = TRAVEL.daftarMobilPenumpang ? TRAVEL.daftarMobilPenumpang(S) : [];
      if (!listMblP.length) {
        return html + '<p class="racik-pesan salah">Butuh mobil penumpang (MPV/SUV/Sedan/Hatchback) dulu di aplikasi Kendaraan untuk mempekerjakan Supir Travel.</p>';
      }
      var aktIdxM = S.mobilAktif || 0, cadanganList = listMblP.filter(function (x) { return x.idx !== aktIdxM; });
      var perB = app.spPerBaru || 'bulan', defGp = perB === 'jalan' ? 150000 : perB === 'minggu' ? 900000 : 3500000;
      var daftarRuteSp = TRAVEL.ruteUntukSupir ? TRAVEL.ruteUntukSupir(S) : [];
      var totQrisSp = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
      html += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-bottom:8px;background:rgba(31,138,128,.1)">' +
        '<b>🚗 Mobil Utamamu (Dipakai Kamu): ' + esc(m ? m.nama : '-') + '</b>' +
        '<small>' + (cadanganList.length
          ? 'Mobil utamamu tidak akan dipakai supir! Pilih mobil cadangan (' + cadanganList.map(function (x) { return '#' + (x.idx + 1) + ' ' + esc(x.mobil.nama); }).join(', ') + ') untuk tiap supir di bawah.'
          : 'Kamu baru punya 1 mobil penumpang. Beli mobil kedua di Dealer Mobil agar supir memakai mobil terpisah (saat 1 mobil, supir hanya narik jika mobil sedang tidak kamu pakai).') + '</small>' +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-app="qriskaryawan">📲 Menu QRIS Karyawan (' + rupiah(totQrisSp) + ')</button><button type="button" class="chip-tombol" data-app="kastravel">💼 Kas Travel (' + rupiah(T.kas || 0) + ')</button></div>' +
        '<small style="display:block;margin-top:4px">🔧 Supir Travel otomatis merawat mobilnya (servis berkala, ganti ban, pajak tahunan) dan biaya bensin/tol/perawatan dipotong dari <b>Kas Travel</b>.</small></div>';
      if (T.supir && T.supir.length) {
        html += '<h3 class="subjudul">Supir Travel Aktif (' + T.supir.length + '/' + (TRAVEL.MAKS_SUPIR || 10) + ')</h3><ul class="daftar pesanan">' + T.supir.map(function (sp) {
          var puas = TRAVEL.kepuasanSupir(S, sp), lblP = TRAVEL.labelPuasSupir(puas);
          var wrnP = puas >= 75 ? '#00a651' : puas >= 45 ? '#e0a916' : '#d9443a';
          var mSpInfo = TRAVEL.mobilUntukSupir ? TRAVEL.mobilUntukSupir(S, sp) : null;
          var ruteAkt = sp.ruteId && sp.ruteId !== 'otomatis' && RUTE.kota[sp.ruteId] ? sp.ruteId : 'otomatis';
          var ruteAktNama = ruteAkt === 'otomatis' ? 'Otomatis (acak di pulau yang sama)' : (RUTE.nama(ruteAkt) + ' (' + (RUTE.kota[ruteAkt].prov || RUTE.kota[ruteAkt].pulau) + ')');
          var sldQris = Math.max(0, Math.round(sp.qrisSaldo || 0));
          var pilihMobilHtml = '<small><b>🚗 Mobil yang Dipakai Supir: ' + esc(mSpInfo ? ('#' + (mSpInfo.idx + 1) + ' ' + mSpInfo.mobil.nama) : 'Belum ada') + '</b></small><div class="chip-baris">' +
            listMblP.map(function (xm) {
              var dip = mSpInfo && mSpInfo.idx === xm.idx;
              var milikKamu = cadanganList.length > 0 && xm.idx === aktIdxM;
              return '<button type="button" class="chip-tombol' + (dip ? ' pilih' : '') + '"' + (milikKamu ? ' disabled style="opacity:.5"' : '') + ' data-aksi="spMobil:' + sp.id + '|' + xm.idx + '">' + (xm.idx + 1) + '. ' + esc(xm.mobil.nama) + (xm.idx === aktIdxM ? ' (★ Kamu)' : dip ? ' ✓' : '') + '</button>';
            }).join('') + '</div>';
          var pilihRuteHtml = '<small style="display:block;margin-top:6px"><b>🗺️ Arahkan Rute Supir (dari ' + esc(RUTE.nama(S.kota)) + '): ' + esc(ruteAktNama) + '</b></small>' +
            '<select id="in-sp-rute-' + esc(sp.id) + '" class="input-teks" style="margin:4px 0 4px">' +
            '<option value="otomatis"' + (ruteAkt === 'otomatis' ? ' selected' : '') + '>🎲 Otomatis (acak di pulau yang sama)</option>' +
            daftarRuteSp.map(function (rt) {
              return '<option value="' + rt.id + '"' + (ruteAkt === rt.id ? ' selected' : '') + '>' + esc(rt.nama) + ' (' + esc(rt.prov) + ' · ' + rt.km + ' km · ' + rupiahPendek(rt.tarif) + '/pnp)</option>';
            }).join('') + '</select>' +
            '<div class="chip-baris"><button type="button" class="chip-tombol' + (ruteAkt === 'otomatis' ? ' pilih' : '') + '" data-aksi="spRute:' + sp.id + '|otomatis">Otomatis</button>' +
            daftarRuteSp.slice(0, 5).map(function (rt) {
              return '<button type="button" class="chip-tombol' + (ruteAkt === rt.id ? ' pilih' : '') + '" data-aksi="spRute:' + sp.id + '|' + rt.id + '">' + esc(rt.nama) + ' (' + rt.km + 'km)</button>';
            }).join('') + '</div>';
          return '<li class="kartu-pesanan"><div><b>👨‍✈️ ' + esc(sp.nama) + ' (' + esc(sp.sim) + ' · ★' + sp.rating + ')</b>' +
            '<small>Pengalaman ' + sp.pengalaman + ' thn · Total ' + (sp.totalTrip || 0) + ' trip · Bersih ' + rupiah(sp.totalBersih || 0) + '</small>' +
            '<small>📲 Saldo QRIS ' + esc(sp.nama) + ': <b>' + rupiah(sldQris) + '</b> ' + (sldQris > 0 ? '<button type="button" class="chip-tombol pilih" style="padding:2px 8px;margin-left:4px" data-aksi="tarikQrisSupir:' + sp.id + '">Tarik ke Bank</button>' : '(cek di menu QRIS Karyawan)') + '</small>' +
            pilihMobilHtml + pilihRuteHtml +
            '<div style="margin:5px 0"><small>Kepuasan Gaji Pekerja: <b style="color:' + wrnP + '">' + puas + '%</b> — ' + esc(lblP) + '</small><div class="meteran" style="margin-top:3px"><i style="width:' + puas + '%;background:' + wrnP + '"></i></div></div>' +
            '<small><b>Periode Gaji:</b></small><div class="chip-baris">' +
            [['jalan', 'Per Jalan'], ['minggu', 'Per Minggu'], ['bulan', 'Per Bulan']].map(function (pr) {
              return '<button type="button" class="chip-tombol' + (sp.periode === pr[0] ? ' pilih' : '') + '" data-aksi="spPeriode:' + sp.id + '|' + pr[0] + '">' + pr[1] + '</button>';
            }).join('') + '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">' +
            '<div><small>Gaji Pokok (Rp)</small><input id="in-sp-gp-' + esc(sp.id) + '" class="input-teks" type="number" step="50000" min="0" style="margin:2px 0 0" value="' + (sp.gajiPokok || 0) + '"></div>' +
            '<div><small>Uang Makan/hr</small><input id="in-sp-um-' + esc(sp.id) + '" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0" value="' + (sp.uangMakan || 0) + '"></div>' +
            '<div><small>Insentif/trip</small><input id="in-sp-ins-' + esc(sp.id) + '" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0" value="' + (sp.insentif || 0) + '"></div></div>' +
            '<div class="chip-baris" style="margin-top:8px">' +
            '<button type="button" class="chip-tombol pilih" data-aksi="spSimpan:' + sp.id + '">💾 Simpan Rute & Gaji</button>' +
            '<button type="button" class="chip-tombol' + (sp.bpjs ? ' pilih' : '') + '" data-aksi="spBpjs:' + sp.id + '">' + (sp.bpjs ? 'BPJS Aktif ✓ (+250rb/bln)' : 'Beri BPJS (+14% Puas)') + '</button>' +
            '<button type="button" class="chip-tombol' + (sp.aktif ? ' pilih' : '') + '" data-aksi="spAktif:' + sp.id + '">' + (sp.aktif ? 'Status: Narik ✓' : 'Status: Libur') + '</button>' +
            '<button type="button" class="chip-tombol" data-aksi="spPecat:' + sp.id + '">Berhentikan</button></div></div></li>';
        }).join('') + '</ul>';
      }
      var defMobBaru = (app.spMobilBaru != null && listMblP.some(function (x) { return x.idx === app.spMobilBaru && (!cadanganList.length || x.idx !== aktIdxM); })) ? app.spMobilBaru : (cadanganList.length ? cadanganList[0].idx : listMblP[0].idx);
      app.spMobilBaru = defMobBaru;
      var defRuteBaru = app.spRuteBaru || 'otomatis';
      var previewPuas = TRAVEL.kepuasanSupir(S, { periode: perB, gajiPokok: defGp, uangMakan: 40000, insentif: 25000, bpjs: !!app.spBpjsBaru });
      html += '<h3 class="subjudul">Rekrut Supir Travel Baru</h3>' +
        '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-bottom:8px">' +
        (cadanganList.length ? '<small><b>🚗 Pilih Mobil untuk Supir Baru:</b></small><div class="chip-baris" style="margin-bottom:6px">' +
          cadanganList.map(function (xm) {
            return '<button type="button" class="chip-tombol' + (defMobBaru === xm.idx ? ' pilih' : '') + '" data-aksi="spMobilBaru:' + xm.idx + '">' + (xm.idx + 1) + '. ' + esc(xm.mobil.nama) + '</button>';
          }).join('') + '</div>' : '') +
        '<small><b>🗺️ Pilih Rute Awal Supir Baru:</b></small>' +
        '<select id="in-spnew-rute" class="input-teks" style="margin:4px 0 6px">' +
        '<option value="otomatis"' + (defRuteBaru === 'otomatis' ? ' selected' : '') + '>🎲 Otomatis (acak di pulau yang sama)</option>' +
        daftarRuteSp.map(function (rt) {
          return '<option value="' + rt.id + '"' + (defRuteBaru === rt.id ? ' selected' : '') + '>' + esc(rt.nama) + ' (' + esc(rt.prov) + ' · ' + rt.km + ' km · ' + rupiahPendek(rt.tarif) + '/pnp)</option>';
        }).join('') + '</select>' +
        '<small><b>Atur Paket Gaji Awal Pelamar:</b></small><div class="chip-baris">' +
        [['jalan', 'Per Jalan'], ['minggu', 'Per Minggu'], ['bulan', 'Per Bulan']].map(function (pr) {
          return '<button type="button" class="chip-tombol' + (perB === pr[0] ? ' pilih' : '') + '" data-aksi="spPerBaru:' + pr[0] + '">' + pr[1] + '</button>';
        }).join('') +
        '<button type="button" class="chip-tombol' + (app.spBpjsBaru ? ' pilih' : '') + '" data-aksi="spBpjsBaru:1">' + (app.spBpjsBaru ? 'BPJS: Ya ✓' : 'BPJS: Tidak') + '</button></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">' +
        '<div><small>Gaji Pokok (Rp)</small><input id="in-spnew-gp" class="input-teks" type="number" step="50000" min="0" style="margin:2px 0 0" value="' + defGp + '"></div>' +
        '<div><small>Uang Makan/hr</small><input id="in-spnew-um" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0" value="40000"></div>' +
        '<div><small>Insentif/trip</small><input id="in-spnew-ins" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0" value="25000"></div></div>' +
        '<small style="display:block;margin-top:6px">Perkiraan kepuasan awal: <b>' + previewPuas + '%</b> (' + esc(TRAVEL.labelPuasSupir(previewPuas)) + ')</small></div>' +
        '<ul class="daftar belanja">' + (T.pelamar || []).map(function (pl) {
          return '<li><span><b>' + esc(pl.nama) + '</b><small>' + esc(pl.sim) + ' · Pengalaman ' + pl.pengalaman + ' thn · ★ ' + pl.rating + '</small></span>' +
            '<span><button type="button" class="chip-tombol pilih" data-aksi="spRekrut:' + pl.id + '">Rekrut</button></span></li>';
        }).join('') + '</ul>';
      return html;
    }
    var klsTrvTxt = (m && RUTE.pengaliKelasMobil) ? (' · ' + RUTE.labelKelasLayanan(m) + ' (Tarif ×' + RUTE.pengaliKelasMobil(m).toFixed(2).replace('.', ',') + ')') : '';
    html += '<ul class="daftar angka">' + baris('Mobil', m ? esc(m.nama) + ' · ' + TRAVEL.kursi(S) + ' kursi penumpang' + esc(klsTrvTxt) : 'Belum punya mobil') + baris('Nilai dari penumpang', '★ ' + T.rating.toLocaleString('id-ID')) +
      baris('Saldo Kas Travel', rupiah(T.kas || 0)) +
      baris('Hari ini', T.hariIni.trip + ' trip · ' + rupiah(T.hariIni.bersih)) + baris('Total', T.total.trip + ' trip · ' + Math.round(T.total.km).toLocaleString('id-ID') + ' km · ' + rupiah(T.total.bersih)) + '</ul>' +
      '<div class="chip-baris" style="margin:6px 0"><button type="button" class="chip-tombol" data-app="kastravel">💼 Kelola Kas Travel</button><button type="button" class="chip-tombol" data-app="qriskaryawan">📲 QRIS Karyawan</button><button type="button" class="chip-tombol' + (TRAVEL.vvipAktif(S) ? ' pilih' : '') + '" data-vvip="popup">' + (TRAVEL.vvipAktif(S) ? '🔓 VVIP Lv 5 Aktif' : '🔒 VVIP Lv 5') + '</button></div>' +
      (T.aktif ? '<p class="catatan">Travel sedang berjalan. Tutup HP untuk melanjutkan.</p>' : e ? '<p class="racik-pesan salah">' + esc(e) + '</p>' :
        '<div style="margin:10px 0"><button type="button" class="aksi" data-aksi="mulaiTravel:1">Mulai travel dari ' + esc(kota) + '</button></div>');
    var daf = Object.keys(RUTE.kota).filter(function (id) { return id !== asal && cocokFilterWil(RUTE.kota[id], flt); }).map(function (id) { var j = RUTE.jalur(asal, id); return j ? { id: id, j: j } : null; }).filter(Boolean);
    daf.sort(function (a, b) { return a.j.km - b.j.km; });
    html += '<h3 class="subjudul">Peta & Tarif dari ' + esc(kota) + ' (' + daf.length + ' daerah)</h3>' +
      chipTab('trvFilter', FILTER_WIL, flt) +
      '<ul class="daftar angka">' + daf.map(function (x) {
        var k = RUTE.kota[x.id], r0 = x.j.ruas[0], kd = RUTE.infoKondisi ? RUTE.infoKondisi(r0) : { nama: 'Aspal Mulus' };
        return baris(esc(k.nama) + '<small>' + esc(k.prov || k.pulau) + (k.luas ? ' · ' + k.luas.toLocaleString('id-ID') + ' km²' : '') + ' · ' + x.j.km.toLocaleString('id-ID') + ' km · ' + esc(kd.nama) + (x.j.tol ? ' · tol ' + rupiah(x.j.tol) : '') + (x.j.laut ? ' · kapal' : '') + '</small>', rupiah(RUTE.tarifStandar(x.j, m)));
      }).join('') + '</ul>' +
      '<p class="catatan">Termasuk lengkap seluruh 57 kota & kabupaten di Kalimantan Barat, Tengah, Selatan, Timur (+IKN), dan Utara dengan jarak, luas wilayah, jalur asli, dan kondisi jalan (tol, aspal mulus, bergelombang, rusak, hingga jalan tanah pedalaman).</p>';
    return html;
  }
  function tidurMalam() {
    var mulai = S.menit, t = DIRI.tidur(S, Math.min(S.menit, 1439), S.diri.bangun);
    S.tidurAnim = true; setTimeout(function () { S.tidurAnim = false; }, 1600);
    gelapSebentar();
    besok(S.diri.bangun);
    toast('Tidur ' + t.jam.toFixed(1).replace('.', ',') + ' jam' + (t.ac ? ' pakai AC.' : ', AC mati karena token habis, kurang nyenyak.'), 2600);
  }
  var kosLainnya = false;
  function isiKosAksi() {
    var malam = S.fase === 'malam' || (S.menit % 1440) >= 1080 || !!S.usaha.berhentiSewa, ada = function (id) { return DIRI.punya(S, id); };
    var bisaNarikKos = N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    var bisaCarKos = !!S.mobil && !MOBIL.pikap(S);
    var masak = ada('ricecooker') || ada('kompor');
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var pas = DIRI.pasanganAktif(S);
    var tombol = [], lain = [];
    if (bisaNarikKos) tombol.push(['narik:1', 'Narik ojol']);
    if (bisaCarKos) tombol.push(['gocar:1', 'Narik GoCar'], ['travel:1', 'Travel']);
    tombol.push(['app:makan', 'Makan']);
    if (pas && pas.lokasi !== 'kedai') {
      var kdm = (S.kesehatan && S.kesehatan.kondom) || 0;
      tombol.push([kdm > 0 ? 'hb:1' : 'hb:0', 'HB' + (kdm > 0 ? ' (Aman)' : '')]);
      lain.push(['ciuman:' + pas.id, '💋 Ciuman ' + pas.nama], ['foreplay:' + pas.id, '🔥 Foreplay ' + pas.nama]);
    }
    tombol.push(['tidurMalam:1', 'Tidur']);
    if ((S.diri.hb || 0) >= 15) lain.push(['meTime:1', 'Me time']);
    if (rtAktif) lain.push(['makanRumah:1', 'Makan di rumah (gratis)']);
    if (masak) lain.push(['makan:masak', 'Masak']);
    if (DIRI.adaKonsol(S)) lain.push(['istirahat:ps', 'Main PS']);
    if (ada('tv')) lain.push(['istirahat:tv', 'Nonton TV']);
    if (!malam) lain.push(['istirahat:tidurSiang', 'Tidur siang']);
    if (malam) lain.push(['bangun:-60', 'Bangun pagi'], ['bangun:60', 'Bangun siang']);
    if (lain.length) tombol.push(['lainnya:1', kosLainnya ? 'Tutup ▴' : 'Lainnya ▾']);
    if (kosLainnya) tombol = tombol.concat(lain);
    $('kos-aksi').innerHTML = tombol.map(function (x) { return '<button type="button" class="chip-tombol" data-diri="' + x[0] + '">' + esc(x[1]) + '</button>'; }).join('');
  }
  function aksiDiri(nama, nilai) {
    var r;
    if (nama === 'makan') r = DIRI.makan(S, nilai);
    else if (nama === 'makanRumah') r = DIRI.makanDiRumah(S);
    else if (nama === 'meTime') { var rm2 = mulaiMeTime(); if (rm2 !== true) toast(rm2, 2400); return; }
    else if (nama === 'tolakHb') { TEMAN.tolakHb(S, nilai); tutupLembar(); simpan(); toast('Kamu menolak ajakan. Dia terlihat kecewa.', 2200); return; }
    else if (nama === 'lainnya') { kosLainnya = !kosLainnya; isiKosAksi(); return; }
    else if (nama === 'hb') return mulaiHb(nilai === '1');
    else if (nama === 'ciuman' || nama === 'foreplay') return mulaiMesra(nama, 'keluarga', nilai);
    else if (nama === 'hbTarget') { var pht2 = nilai.split('|'); return mulaiHb(pht2[0] === '1', pht2[1]); }
    else if (nama === 'istirahat') r = DIRI.istirahat(S, nilai);
    else if (nama === 'tidurMalam') return tidurMalam();
    else if (nama === 'bangun') { S.diri.bangun = Math.max(240, Math.min(720, S.diri.bangun + +nilai)); perbaruiAksi(); return; }
    else if (nama === 'pulang') { tutupLembar(); return pindah('kos', true); }
    else if (nama === 'narik') return mulaiNarik();
    else if (nama === 'gocar') return mulaiNarik('gojek', 'mobil');
    else if (nama === 'travel') return mulaiTravel();
    else if (nama === 'app') { app.pesan = ''; return bukaHP(nilai); }
    else if (nama === 'tutup') { tutupLembar(); if (S.fase === 'buka') { tutupKedai(true); } return; }
    else if (nama === 'autoMakan') { S.autoMakanMinum = !S.autoMakanMinum; toast(S.autoMakanMinum ? 'Auto Makan & Minum aktif (hemat biaya).' : 'Auto Makan & Minum mati.', 2000); simpan(); perbaruiAksi(); if (lembar === 'diri') bukaDiri(); return; }
    if (r && r.ok) { if (r.menit) lompatWaktu(r.menit); toast(r.teks, 2400); simpan(); perbaruiHUD(true); }
    else if (r) toast(r, 2600);
    if (lembar === 'diri') bukaDiri();
  }
  /* foto wajah bundar: potret AI dipotong ke muka. Pemain mengikuti gender, pasangan sebaliknya */
  function fotoWajah(src, ukuran, bingkai, nama, gender, usia, peran) {
    var gChar = gender || (/pemain/.test(src) ? 'cowok' : 'cewek');
    var pChar = peran || (/anak/.test(src) ? 'anak' : '');
    var kunci = (ADEGAN && ADEGAN.pilihChar) ? ADEGAN.pilihChar(nama, gChar, usia, pChar) : null;
    var jenis = gChar === 'cowok' ? 'cowok' : /anak/.test(src) ? 'anak' : 'cewek';
    var kulit = '#f1c39b', rambut = jenis === 'cowok' ? '#2a1d1a' : jenis === 'anak' ? '#3b2a20' : '#4a2c2a', bg = jenis === 'cowok' ? '#cfe6e3' : '#f6d3dc';
    var hair = jenis === 'cowok' ? '<path d="M14 30c0-12 8-18 18-18s18 6 18 18c-4-6-10-8-18-8s-14 2-18 8z" fill="' + rambut + '"/>'
      : jenis === 'anak' ? '<path d="M13 32c0-13 8-19 19-19s19 6 19 19c-3-7-9-9-19-9s-16 2-19 9z" fill="' + rambut + '"/><circle cx="16" cy="22" r="5" fill="' + rambut + '"/><circle cx="48" cy="22" r="5" fill="' + rambut + '"/>'
      : '<path d="M12 44c-2-20 6-33 20-33s22 13 20 33c-3-5-4-12-4-18-8 0-14-3-16-8-3 6-8 8-16 8 0 6-1 13-4 18z" fill="' + rambut + '"/>';
    var svg = '<svg viewBox="0 0 64 64" width="100%" height="100%"><rect width="64" height="64" fill="' + bg + '"/><path d="M10 64c2-12 10-16 22-16s20 4 22 16z" fill="' + (jenis === 'cowok' ? '#1f8a80' : '#e91e63') + '"/><circle cx="32" cy="32" r="14" fill="' + kulit + '"/>' + hair + '<circle cx="26" cy="33" r="1.8" fill="#2a1d1a"/><circle cx="38" cy="33" r="1.8" fill="#2a1d1a"/><path d="M27 39q5 4 10 0" stroke="#b5524a" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>';
    var img = kunci ? '<img src="img/char-' + kunci + '.jpg" alt="" onerror="this.style.display=\'none\'">' : '';
    return '<span class="foto-wajah" style="width:' + ukuran + 'px;height:' + ukuran + 'px;border-color:' + (bingkai || 'rgba(31,138,128,.55)') + '">' + svg + img + '</span>';
  }
  function srcPemain() { return (S && S.profil && S.profil.gender === 'cowok') ? 'char-pemain' : 'char-istri'; }
  function srcPasangan() { return (S && S.profil && S.profil.gender === 'cowok') ? 'char-istri' : 'char-pemain'; }
  /* popup dari HUD: charge HP dan isi bensin */
  function popupHp(pesan, salah) {
    var hm = DIRI.hpAktif(S), bat = Math.round((S.hp && S.hp.baterai) || 95), cas = !!(S.hp && S.hp.cas);
    var pbInfo = DIRI.pbAktifInfo ? DIRI.pbAktifInfo(S) : null;
    var pbHtml = pbInfo
      ? '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin-top:10px;background:rgba(0,137,123,.12)">' +
        '<b>🔋 ' + esc(pbInfo.model.nama) + '</b>' +
        '<small>Sisa ' + Math.round(pbInfo.state.sisaMah).toLocaleString('id-ID') + ' / ' + pbInfo.model.mah.toLocaleString('id-ID') + ' mAh (' + pbInfo.persen + '%) · ' + (S.hp.pbPasang ? '🔌 Tersambung ke HP' : S.hp.pbCas ? '⚡ Sedang dicas di rumah' : 'Tidak tersambung') + '</small>' +
        '<div class="meteran" style="margin:5px 0"><i style="width:' + pbInfo.persen + '%;background:#00897b"></i></div>' +
        '<div class="chip-baris"><button type="button" class="chip-tombol' + (S.hp.pbPasang ? ' pilih' : '') + '" data-hud="togglePb">' + (S.hp.pbPasang ? 'Cabut Power Bank' : 'Sambungkan ke HP') + '</button>' +
        '<button type="button" class="chip-tombol' + (S.hp.pbCas ? ' pilih' : '') + '" data-hud="casPb">' + (S.hp.pbCas ? 'Stop Cas PB' : 'Cas PB di Rumah') + '</button></div></div>'
      : '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol" data-hud="bukaPb">🔋 Beli Power Bank (5.000–100.000 mAh)</button></div>';
    bukaLembar('hudHp', kepala('Baterai HP & Power Bank', hm.nama) + (pesan ? '<p class="racik-pesan ' + (salah ? 'salah' : 'siap') + '">' + esc(pesan) + '</p>' : '') +
      '<div class="saldo-besar" style="background:#1e88e5"><small>' + (cas ? '⚡ Sedang mengisi' : S.hp.pbPasang && pbInfo ? '🔋 Disuplai Power Bank' : '🔋 Baterai') + ' · charger ' + hm.watt + 'W · ' + hm.mah + ' mAh</small><b>' + bat + '%</b>' + persenBar(bat) + '</div>' +
      '<div class="chip-baris" style="margin-top:10px"><button type="button" class="aksi" data-hud="casHp">' + (cas ? 'Cabut charger' : 'Colok charger ' + hm.watt + 'W') + '</button></div>' + pbHtml);
  }
  function chipHiburan() {
    return '<div class="chip-baris" style="margin:6px 0 0">' + Object.keys(DIRI.HIBURAN).map(function (k) {
      return '<button type="button" class="chip-tombol' + (S.hiburan === k ? ' pilih' : '') + '" data-ojek="hiburan:' + k + '">' + DIRI.HIBURAN[k].nama + (S.hiburan === k ? ' ✓' : '') + '</button>';
    }).join('') + '</div>';
  }
  function tidurJalan(jam) {
    var o = S.ojek; if (o.trip || o.tawaran) return toast('Selesaikan atau lewati order dulu.', 1800);
    gelapSebentar(); S.hiburan = null;
    var kabar = lompatWaktu(jam * 60);
    S.diri.stamina = Math.min(100, S.diri.stamina + jam * 14);
    cekGantiHari();
    simpan(); perbaruiHUD(true); perbaruiAksi();
    toast('Tidur ' + jam + ' jam di pinggir jalan. Stamina +' + (jam * 14) + '.' + (kabar && kabar.length ? ' ' + kabar.join(' ') : ''), 3000);
  }
  function cekGantiHari() {
    if (!S || S.transit || S.hbRun || S.menit < 1440) return false;
    besok(null, true); return true;
  }
  function popupHb(pesan, salah) {
    bukaLembar('hudHb', kepala('Bar HB', Math.round(S.diri.hb || 0) + '%') + (pesan ? '<p class="racik-pesan ' + (salah ? 'salah' : 'siap') + '">' + esc(pesan) + '</p>' : '') +
      '<div class="saldo-besar"><small>HB</small><b>' + Math.round(S.diri.hb || 0) + '%</b>' + persenBar(S.diri.hb || 0) + '</div>' +
      '<div class="chip-baris" style="margin-top:8px"><button type="button" class="aksi" data-hud="meTime">Me time (turun 25–35%)</button></div>' +
      '<p class="catatan">Hanya bisa di rumah. HB penuh dengan pasangan tetap menurunkan bar sampai 0%.</p>');
  }
  function popupStamina(pesan, salah) {
    bukaLembar('hudStamina', kepala('Stamina', Math.round(S.diri.stamina) + '%') + (pesan ? '<p class="racik-pesan ' + (salah ? 'salah' : 'siap') + '">' + esc(pesan) + '</p>' : '') +
      '<div class="saldo-besar"><small>Stamina</small><b>' + Math.round(S.diri.stamina) + '%</b>' + persenBar(S.diri.stamina) + '</div>' +
      '<h3 class="subjudul">Kopi & minuman energi</h3><div class="chip-baris">' + DIRI.ENERGI.map(function (e) {
        return '<button type="button" class="chip-tombol" data-hud="energi:' + e.id + '">' + esc(e.nama) + ' · ' + rupiah(e.harga) + ' · +' + e.stamina + '</button>';
      }).join('') + '</div><p class="catatan">Lebih dari 3 kali sehari bikin kesehatan turun. Tidur tetap cara terbaik memulihkan stamina.</p>');
  }
  function popupBensin(pesan, salah, paksaTarget) {
    if (paksaTarget) app.bensinTarget = paksaTarget;
    var punyaMtr = !!S.motor, punyaMbl = !!S.mobil;
    var mobil = app.bensinTarget ? (app.bensinTarget === 'mobil' && punyaMbl) : (jenisKendaraanJalan() === 'mobil');
    if (mobil && !punyaMbl) mobil = false;
    if (!mobil && !punyaMtr && punyaMbl) mobil = true;
    app.bensinTarget = mobil ? 'mobil' : 'motor';
    var m = mobil ? S.mobil : S.motor;
    if (!m) return toast('Belum punya kendaraan.', 1800);
    var switchTab = (punyaMtr && punyaMbl) ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol' + (!mobil ? ' pilih' : '') + '" data-hud="pilihKend:motor">🏍️ ' + esc(S.motor.nama) + '</button><button type="button" class="chip-tombol' + (mobil ? ' pilih' : '') + '" data-hud="pilihKend:mobil">🚗 ' + esc(S.mobil.nama) + '</button></div>' : '';
    if (!mobil && m.bbm === 'listrik') {
      return bukaLembar('hudBensin', kepala('Baterai motor listrik', m.nama) + switchTab +
        '<div class="saldo-besar"><small>Daya baterai</small><b>' + Math.round(m.baterai || 0) + ' / ' + (m.jarakPenuh || 60) + ' km</b>' + persenBar((m.baterai || 0) / (m.jarakPenuh || 60) * 100) + '</div>' +
        '<p class="catatan">Motor listrik dicas otomatis tiap malam di tempat tinggal.</p>');
    }
    var tangki = m.tangki || 40, isiL = mobil ? (Math.max(0, Math.min(1, Number(m.isi) || 0)) * tangki) : (Number(m.isi) || 0), kosong = Math.max(0, Math.round((tangki - isiL) * 10) / 10);
    var anjuran = m.bbm, ev = anjuran === 'listrik', sat = ev ? 'kWh' : 'L';
    var jenisList = ev ? ['listrik'] : anjuran === 'solar' ? ['solar'] : ['pertalite', 'pertamax', 'turbo'];
    var jenis = app.bbmPilih && jenisList.indexOf(app.bbmPilih) >= 0 ? app.bbmPilih : anjuran, h = MOTOR.hargaBbm(S, jenis);
    var pilih = (ev ? [5, 10, 20, 30] : [1, 2, 5, 10, 20]).filter(function (l) { return l <= kosong + 0.01; });
    bukaLembar('hudBensin', kepala(ev ? 'Cas mobil listrik' : 'Isi bensin', m.nama) + switchTab + (pesan ? '<p class="racik-pesan ' + (salah ? 'salah' : 'siap') + '">' + esc(pesan) + '</p>' : '') +
      '<div class="saldo-besar"><small>' + (ev ? 'Daya baterai' : 'Isi tangki') + '</small><b>' + isiL.toFixed(1).replace('.', ',') + ' / ' + String(tangki).replace('.', ',') + ' ' + sat + '</b>' + persenBar(isiL / tangki * 100) + '</div>' +
      (jenisList.length > 1 ? '<div class="chip-baris" style="margin-top:8px">' + jenisList.map(function (j) { return '<button type="button" class="chip-tombol' + (j === jenis ? ' pilih' : '') + '" data-hud="bbm:' + j + '">' + N.bbm.nama[j] + (j === anjuran ? ' ✓' : '') + '</button>'; }).join('') + '</div>' : '') +
      (kosong < 0.2 ? '<p class="catatan">' + (ev ? 'Baterai sudah penuh.' : 'Tangki sudah penuh.') + '</p>' :
      '<div class="chip-baris" style="margin-top:8px">' + pilih.map(function (l) { return '<button type="button" class="chip-tombol" data-hud="isi:' + jenis + '-' + l + '">' + l + ' ' + sat + ' · ' + rupiah(Math.round(l * h / 100) * 100) + '</button>'; }).join('') +
        '<button type="button" class="chip-tombol" data-hud="isi:' + jenis + '-penuh">Penuh ' + String(kosong).replace('.', ',') + ' ' + sat + ' · ' + rupiah(Math.round(kosong * h / 100) * 100) + '</button></div>' +
      '<div class="chip-baris" style="margin-top:8px;align-items:center"><input id="in-liter" class="input-teks" type="number" inputmode="decimal" min="0.5" max="' + kosong + '" step="0.5" placeholder="' + (ev ? 'Cas berapa kWh?' : 'Isi berapa liter?') + '" style="margin:0;flex:1"><button type="button" class="chip-tombol pilih" data-hud="isiLiter:' + jenis + '">' + (ev ? 'Cas' : 'Isi') + '</button></div>') +
      '<p class="catatan" style="margin-top:6px">' + (ev ? ('Tarif listrik SPKLU ' + rupiah(h) + ' per kWh. Mobil listrik tanpa bensin dan bebas ngelitik.') : (N.bbm.nama[jenis] + ' ' + rupiah(h) + ' per liter. Tanda ✓ = anjuran pabrik; bensin di bawah anjuran membuat mesin ngelitik.')) + '</p>');
  }
  function aksiHud(nama, nilai) {
    if (nama === 'pilihKend') { app.bensinTarget = nilai; app.bbmPilih = null; return popupBensin(); }
    var mobil = app.bensinTarget ? (app.bensinTarget === 'mobil' && !!S.mobil) : (jenisKendaraanJalan() === 'mobil');
    if (nama === 'casHp') { var rc = DIRI.toggleCasHp(S); if (rc === true || rc == null) { simpan(); perbaruiHUD(true); } return popupHp(rc === true || rc == null ? (S.hp && S.hp.cas ? 'Charger dicolokkan. Baterai sedang diisi.' : 'Charger dicabut.') : rc, !(rc === true || rc == null)); }
    if (nama === 'togglePb') { var rtp = DIRI.togglePowerBank(S); simpan(); perbaruiHUD(true); return popupHp(rtp && rtp.ok ? rtp.teks : rtp, !(rtp && rtp.ok)); }
    if (nama === 'casPb') { var rcp = DIRI.toggleCasPowerBank(S); simpan(); perbaruiHUD(true); return popupHp(rcp && rcp.ok ? rcp.teks : rcp, !(rcp && rcp.ok)); }
    if (nama === 'bukaPb') { app.gadgetTab = 'pb'; app.pesan = ''; return bukaHP('gadget'); }
    if (nama === 'bbm') { app.bbmPilih = nilai; return popupBensin(); }
    if (nama === 'energi') { var re = DIRI.minumEnergi(S, nilai); if (re && re.ok) { simpan(); perbaruiHUD(true); return popupStamina(re.teks, false); } return popupStamina(re, true); }
    if (nama === 'meTime') { var rm = mulaiMeTime(); if (rm === true) { tutupLembar(); return; } return popupHb(rm, true); }
    var jenis, liter;
    if (nama === 'isi') { var p = nilai.split('-'); jenis = p[0]; liter = p[1]; }
    else if (nama === 'isiLiter') { jenis = nilai; liter = $('in-liter') ? parseFloat($('in-liter').value) : 0; if (!(liter > 0)) return popupBensin('Masukkan jumlah yang valid dulu.', true); }
    var r = mobil ? MOBIL.isiBensin(S, jenis, liter) : MOTOR.isiBensin(S, jenis, liter);
    if (r && r.ok) {
      if (SUARA) SUARA.bunyi('beli'); simpan(); perbaruiHUD(true);
      var satR = r.jenis === 'listrik' ? ' kWh' : ' L';
      return popupBensin((r.jenis === 'listrik' ? 'Cas ' : 'Isi ') + N.bbm.nama[r.jenis] + ' ' + r.liter.toLocaleString('id-ID') + satR + ' · ' + rupiah(r.biaya) + '.');
    }
    if (SUARA) SUARA.bunyi('salah'); popupBensin(r, true);
  }
  /* bar bahan bakar / daya baterai kendaraan aktif di samping bar baterai HP */
  function barBensin() {
    var pakaiMobil = jenisKendaraanJalan() === 'mobil' && !!S.mobil;
    var m = pakaiMobil ? S.mobil : S.motor;
    if (!m) return '';
    var evMobil = pakaiMobil && m.bbm === 'listrik';
    var listrikMtr = !pakaiMobil && m.bbm === 'listrik' && m.jarakPenuh;
    var v = listrikMtr ? (m.baterai || 0) / m.jarakPenuh * 100 : pakaiMobil ? (Math.max(0, Math.min(1, Number(m.isi) || 0))) * 100 : (Number(m.isi) || 0) / (m.tangki || 1) * 100;
    return bar(evMobil ? '⚡Mobil' : listrikMtr ? '⚡Motor' : 'Bensin', Math.max(0, Math.min(100, v)), false, 'bensin');
  }
  function bar(nama, v, isHb, hud) {
    var cls = isHb ? (v >= 85 ? ' hb kritis' : ' hb') : (v < 20 ? ' kritis' : '');
    return '<span' + (hud ? ' data-hud="' + hud + '" class="bisa-tap"' : '') + '>' + nama + '<i class="meteran' + cls + '"><i style="width:' + Math.round(v) + '%"></i></i></span>';
  }
  function bukaDiri() {
    var d = S.diri, diKedai = d.posisi === 'kedai', hm = DIRI.hpAktif(S);
    var bisaNarik = !S.ojek.online && N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    bukaLembar('diri', kepala('Kondisi badan & HP', (diKedai ? 'Di luar' : 'Di ' + DIRI.tempat(S)) + (d.sakit ? ' · Sakit: ' + d.sakit.nama : ' · Kesehatan ' + Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%')) +
      '<ul class="daftar angka">' + baris('Kenyang', Math.round(d.kenyang) + '%', d.kenyang < 20 ? 'rugi' : '') + baris('Minum', Math.round(d.minum) + '%', d.minum < 20 ? 'rugi' : '') +
      baris('Stamina', Math.round(d.stamina) + '%', d.stamina < 20 ? 'rugi' : '') + 
      baris('HB Bar (Gairah)', Math.round(d.hb || 0) + '%', (d.hb || 0) >= 85 ? 'rugi' : '') +
      baris('Kesehatan Badan', (d.sakit ? esc(d.sakit.nama) + ' · ' : '') + Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%', d.sakit || (d.kesehatan || 100) < 50 ? 'rugi' : '') +
      (d.rasaBersalah ? baris('Rasa Bersalah', Math.round(d.rasaBersalah) + '%', 'rugi') : '') +
      (d.hiv ? baris('Status HIV', (S.kesehatan && S.kesehatan.arvSampai >= S.hari) ? 'HIV+ (Terapi ARV Aktif)' : 'HIV+ (Butuh ARV di Apotek!)', 'rugi') : '') +
      baris('Baterai ' + esc(hm.nama) + ' (' + hm.watt + 'W)', Math.round(S.hp ? S.hp.baterai : 95) + '%' + (S.hp && S.hp.cas ? ' (Sedang Cas)' : ''), (S.hp && S.hp.baterai < 20) ? 'rugi' : '') + '</ul>' +
      '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-diri="app:makan">Beli makan & minum</button>' +
      '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-diri="autoMakan:1">' + (S.autoMakanMinum ? 'Auto Makan/Minum ✓' : 'Auto Makan/Minum') + '</button>' +
      '<button type="button" class="chip-tombol" data-diri="makan:air">Minum air</button>' +
      (d.sakit ? '<button type="button" class="chip-tombol pilih" data-diri="app:apotek">Ke Apotek K-24</button>' : '') +
      (diKedai ? '<button type="button" class="chip-tombol pilih" data-diri="pulang:1">Pulang ke ' + DIRI.tempat(S) + '</button>' : '') +
      (bisaNarik && (S.fase !== 'buka' || kepalaMasuk()) ? '<button type="button" class="chip-tombol" data-diri="narik:1">Narik ojol</button>' : '') +
      '</div>' +
      '<p class="catatan">Lapar, kehujanan, atau kecapekan bisa membuat sakit (obati di Apotek K-24). Jika HB bar memuncak, pulang ke rumah bersama pasangan. Tidur atau HB memulihkan stamina.</p>');
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
      DIRI.jalan(S, 1, false); kabar = kabar.concat(DUNIA.jalan(S, 1, false), TEMAN.jalan(S)); if (S.popupSelingkuh) tampilPopupSelingkuh();
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
    var narik = main && S.ojek.online, trv = !!(main && S.travel && S.travel.aktif), tr = !!(main && (S.transit || S.hbRun));
    if (main && !lembar && !document.hidden && S.kec > 0 && !animasi) {
      var trvTunggu = trv && S.travel.status === 'tunggu';
      var trvKapal = trv && S.travel.status === 'kapal';
      dMenit = dt / 1000 * MENIT_PER_DETIK * S.kec * (narik && (S.ojek.trip || (S.hiburan && !S.ojek.tawaran)) ? OJEK.CEPAT_TRIP : 1) * (trv ? (S.hiburan && trvTunggu ? OJEK.CEPAT_TRIP : TRAVEL.cepatWaktu(S)) : 1) * (S.transit ? S.transit.mult : S.hbRun ? S.hbRun.mult : 1);
      if (S.transit) dMenit = Math.min(dMenit, S.transit.sisa); else if (S.hbRun) dMenit = Math.min(dMenit, S.hbRun.sisa);
      S.menit += dMenit;
      if (S.fase === 'buka' && !S.tutupSementara) JUAL.langkah(S, dMenit);
      var kabarStok = DUNIA.jalan(S, dMenit, false).concat(TEMAN.jalan(S)); if (S.popupSelingkuh) tampilPopupSelingkuh();
      if (kabarStok.length) { perbaruiHUD(true); perbaruiPesanan(); if (R && !animasi) gambarRacik(); }
      kabarStok = kabarStok.concat(DIRI.jalan(S, dMenit, (S.diri.posisi === 'kedai' || tr) && (S.fase === 'buka' || narik || tr || (trv && (S.travel.status === 'jalan')))));
      var menunggu = (narik && !S.ojek.trip && !S.ojek.tawaran) || trvTunggu || trvKapal;
      if (S.hiburan) {
        if (!menunggu) { S.hiburan = null; travelKunci = ''; panelOjek(true); if (trv) panelTravel(true); }
        else { var rh = DIRI.hiburanJalan(S, dMenit); if (rh) { kabarStok.push(rh); travelKunci = ''; panelOjek(true); if (trv) panelTravel(true); } }
      }
      if (narik) {
        var kabarOjek = OJEK.jalan(S, dMenit);
        if (kabarOjek.length) { kabarStok = kabarStok.concat(kabarOjek); perbaruiHUD(true); simpan(); }
        var isCarNarik = S.ojek.mode === 'mobil';
        var bbmCukup = isCarNarik ? MOBIL.cukup(S, 3) : MOTOR.cukup(S, 3);
        if (!S.ojek.trip && !S.ojek.tawaran && (S.diri.stamina < 8 || !bbmCukup)) {
          OJEK.offline(S);
          var msgHabis = isCarNarik && S.mobil && S.mobil.bbm === 'listrik' ? 'Baterai mobil listrik hampir habis, kamu berhenti narik.' : (isCarNarik ? 'Bensin mobil hampir habis, kamu berhenti narik.' : 'Bensin hampir habis, kamu berhenti narik.');
          kabarStok.push(S.diri.stamina < 8 ? 'Badan sudah capek, kamu berhenti narik. Minum kopi atau tidur dulu.' : msgHabis);
          perbaruiAksi();
        }
      }
      if (trv) {
        var kabarTrv = TRAVEL.jalan(S, dMenit);
        if (kabarTrv.length) {
          kabarStok = kabarStok.concat(kabarTrv);
          if (S.hiburan && S.travel.status === 'tunggu' && S.travel.antri.length >= TRAVEL.kursi(S)) {
            var nmHib = (DIRI.HIBURAN[S.hiburan] && DIRI.HIBURAN[S.hiburan].nama) || 'Hiburan';
            S.hiburan = null; travelKunci = '';
            kabarStok.push('🎉 Semua kursi penuh (' + S.travel.antri.length + '/' + TRAVEL.kursi(S) + ')! ' + nmHib + ' dihentikan, siap berangkat!');
          }
          perbaruiHUD(true); simpan();
        }
        if (S.travel.lompat > 0) { var ljT = S.travel.lompat; S.travel.lompat = 0; lompatWaktu(ljT); }
        if (S.travel.laporan) { perbaruiHUD(true); bukaLaporanTravel(); }
      }
      var kirimMakan = DIRI.cekKiriman(S); if (kirimMakan) kabarStok.push(kirimMakan);
      if (kabarStok.length) toast(kabarStok.join(' '), 2600);
      if (S.diri.ketiduran) { var kt = S.diri.ketiduran; S.diri.ketiduran = 0; lompatWaktu(kt); }
      var jamBukaEfektif = KAL.apakahRamadan(S.hari) > 0 ? 16 : S.jamBuka;
      /* kedai hanya buka otomatis bila sedang tidak narik ojol dan tidak ditutup manual hari ini */
      if (S.fase === 'pagi' && !S.ojek.online && !trv && S.tutupManualHari !== S.hari && S.menit >= jamBukaEfektif * 60 && (S.diri.posisi === 'kedai' || kepalaMasuk())) {
        bukaKedai(true);
      }
      if (S.transit) { S.transit.sisa -= dMenit; if (S.transit.sisa <= 0.001) selesaiTransit(); }
      else if (S.hbRun) { S.hbRun.sisa -= dMenit; if (S.hbRun.sisa <= 0.001) selesaiHb(); }
      cekGantiHari();
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
    if (main && trv) panelTravel();
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
    var kelDiRumah = main && S.keluarga ? S.keluarga.filter(function (kl) { return kl.lokasi !== 'kedai' && !TEMAN.sedangKeluar(kl, S); }).map(function (kl) {
      return { nama: kl.nama, peran: kl.peran, gender: kl.gender || 'cewek', pasangan: DIRI.adalahPasangan(kl), hamil: !!(kl.hamil && kl.hamil.terdeteksi), usia: KAL.usia(S.hari, kl.tglLahir) };
    }) : [];
    var hb = (main && S.diri) ? (S.diri.hb || 0) : 0;
    var capekP = !!(main && S.diri && (S.diri.stamina < 25));
    ADEGAN.gambar(main ? { kota: S.kota, ramadan: KAL.apakahRamadan(S.hari) > 0, namaToko: S.namaToko || 'Kopi Kontainer', namaPemain: S.namaPemain || 'Kamu', gender: (S.profil && S.profil.gender) || 'cewek', berhentiSewa: !!(S.usaha && S.usaha.berhentiSewa), sakitPemain: !!S.diri.sakit, capekPemain: capekP, hbTinggi: hb >= 75, hamilPemain: !!(S.diri.hamil && S.diri.hamil.terdeteksi), keluargaRumah: kelDiRumah, hbAnim: S.hbRun ? { u: Math.min(1, 1 - S.hbRun.sisa / S.hbRun.total), varian: S.hbRun.varian, nama: S.hbRun.nama, gB: S.hbRun.gB } : null, posisi: S.diri.posisi, transit: S.transit ? { ke: S.transit.ke, u: 1 - S.transit.sisa / S.transit.total, km: S.transit.km, kend: S.transit.kend, mult: S.transit.mult } : null, ojek: OJEK.fase(S), travel: TRAVEL.fase(S), motorId: S.motor ? S.motor.id : null, mobil: S.mobil ? { id: S.mobil.id, bentuk: S.mobil.bentuk } : null, rumah: S.rumah.jenis === 'rumah' ? S.rumah.tipe : null,
      pindah: pindahAnim ? { u: (t - pindahAnim.mulai) / 3800, pikap: pindahAnim.pikap, warna: pindahAnim.warna } : null, barang: S.rumah.barang, tidur: !!S.tidurAnim, acNyala: !S.rumah.padam && DIRI.adaAc(S), menit: S.menit, buka: S.fase === 'buka' && !S.tutupSementara, kecepatan: S.kec, jalan: !lembar && S.kec > 0, pembeli: JUAL.semua(), dMenit: dMenit, ruangBawah: ruang, motorParkir: S.motor && ANTAR.waktu(S) >= (S.motorSibukSampai || 0) ? S.motor.id : null, staf: stafHadir.length, stafGender: stafHadir.map(function (k) { return k.gender || 'cewek'; }), anakBantu: anakDiKedai, hujan: DUNIA.hujanSekarang(S) ? (S.dunia.cuaca.banjir ? 2 : 1) : 0, kotor: S.dunia.kotor, tier: S.usaha.tier, kayu: USAHA.punya(S, 'kursiKayu'), padam: !USAHA.listrikNyala(S) }
      : { latarAwal: true, namaToko: 'The Driver', menit: 1050, buka: false, kecepatan: 1, jalan: true, pembeli: [], dMenit: 0 }, t);
    requestAnimationFrame(putar);
  }

  /* ---------- sentuhan ---------- */
  var SAPA = ['Siap, bos!', 'Kopi hari ini wangi.', 'Mau racik apa kita?', 'Semangat jualan!', 'Es batu aman, bos.'];
  function pasangEvent() {
    
    if ($('b-baru-driver')) $('b-baru-driver').onclick = function () { modeDriver = true; tampil('kota'); };
    $('b-kembali').onclick = function () { tampil('awal'); };
    $('b-lanjut').onclick = function () { var d = SIMPAN.baca(); if (d) lanjut(d); };
    $('kota-daftar').onclick = function (e) { var b = e.target.closest('[data-kota]'); if (b) { kotaDipilih = b.dataset.kota; if (modeDriver) { lokasiDipilih = 'jalan'; tampil('qris'); } else tampil('lokasi'); } };
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
    $('b-kembali-qris').onclick = function () { tampil(kotaDipilih ? (modeDriver ? 'kota' : 'lokasi') : 'awal'); };
    $('b-aksi').onclick = function () {
      if (S.diri.posisi === 'kos') {
        var siapTidur = !!S.usaha.berhentiSewa || S.fase === 'malam' || (S.menit % 1440) >= 1080 || (S.ojek && S.ojek.hariIni && S.ojek.hariIni.trip > 0);
        if (siapTidur) tidurMalam();
        else pindah('kedai');
        return;
      }
      if (S.fase === 'pagi') bukaKedai(false);
      else if (S.fase === 'buka') bukaRacik();
      else if (S.fase === 'malam') { if (S.laporanDilihat) bukaKedai(false); else bukaLaporan(); }
    };
    if ($('b-home')) $('b-home').onclick = function () {
      if (!S) return;
      if (S.travel && S.travel.aktif) return toast(S.travel.di === S.kota && S.travel.status === 'tunggu' ? 'Tekan Selesai di panel travel dulu.' : 'Kamu sedang travel di ' + RUTE.nama(S.travel.di) + '. Selesaikan dulu perjalanannya.', 2400);
      if (S.diri.posisi === 'kos') {
        if (S.usaha.berhentiSewa) return toast('Kamu sudah berada di ' + DIRI.tempat(S) + '.', 1800);
        pindah('kedai');
      }
      else pindah('kos', true);
    };
    $('travel-panel').onclick = function (e) {
      var v = e.target.closest('[data-vvip]'); if (v) return aksiVvip(v.dataset.vvip);
      var o = e.target.closest('[data-ojek]'); if (o) return aksiOjek(o.dataset.ojek);
      var b = e.target.closest('[data-trv]'); if (b) { var tv = b.dataset.trv.split(':'); aksiTravel(tv[0], tv.slice(1).join(':')); }
    };
    function aksiVvip(cmd) {
      if (cmd === 'popup') return bukaPopupVvip();
      if (cmd === 'buka') {
        var r = TRAVEL.bukaVvip(S, false);
        if (r && r.ok) { toast(r.teks, 2800); simpan(); travelKunci = ''; panelTravel(true); panelOjek(true); perbaruiHUD(true); bukaPopupVvip(); }
        else toast(r || 'Gagal membuka Mode VVIP.', 2600);
        return;
      }
      if (cmd === 'kunci') {
        var rk = TRAVEL.kunciVvip(S);
        toast((rk && rk.teks) || 'Mode VVIP dikunci.', 2400);
        simpan(); travelKunci = ''; panelTravel(true); panelOjek(true); perbaruiHUD(true);
        if (lembar === 'atur') bukaAtur(); else bukaPopupVvip();
      }
    }
    function onSliderInput(e) {
      var s = e.target.closest('[data-gigi]'); if (!s) return; seretGigi = true;
      var jn = s.dataset.gigi === 'trv' ? 'mobil' : (s.dataset.gigi.split(':')[1] === 'mobil' ? 'mobil' : 'motor'), lb = $('gigi-label'); if (lb) lb.textContent = labelGigi(jn, +s.value);
    }
    function onSliderChange(e) {
      var s = e.target.closest('[data-gigi]'); if (!s) return; seretGigi = false; var n = Math.max(1, Math.min(5, +s.value));
      if (s.dataset.gigi === 'trv') {
        if (n === 5 && !TRAVEL.vvipAktif(S)) {
          s.value = Math.min(4, S.travel.gigi || 3);
          travelKunci = ''; panelTravel(true); bukaPopupVvip(); return;
        }
        var r = TRAVEL.setGigi(S, n); if (r !== true) toast(r, 2200); travelKunci = ''; panelTravel(true); simpan();
      } else {
        if (n === 5 && !TRAVEL.vvipAktif(S)) s.value = Math.min(4, S.gigiJalan || 2);
        aksiOjek('gigi:' + n);
      }
    }
    $('ojek-panel').oninput = onSliderInput;
    $('ojek-panel').onchange = onSliderChange;
    $('travel-panel').oninput = onSliderInput;
    $('travel-panel').onchange = onSliderChange;
    $('ojek-panel').onclick = function (e) {
      var v = e.target.closest('[data-vvip]'); if (v) return aksiVvip(v.dataset.vvip);
      var b = e.target.closest('[data-ojek]'); if (b) aksiOjek(b.dataset.ojek);
    };
    if ($('popup-teman')) $('popup-teman').onclick = function () { this.hidden = true; this.classList.remove('muncul'); bukaHP('keluarga'); };
    $('kos-aksi').onclick = function (e) { var b = e.target.closest('[data-diri]'); if (b) { var dd = b.dataset.diri.split(':'); aksiDiri(dd[0], dd.slice(1).join(':')); } };
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
      } else if (b.dataset.kedai === 'gocar') {
        mulaiNarik('gojek', 'mobil');
      } else if (b.dataset.kedai === 'travel') {
        mulaiTravel();
      } else if (b.dataset.kedai === 'laporan') {
        bukaLaporan();
      }
    };
    $('h-diri').onclick = function (e) { var hb = e.target.closest('[data-hud]'); if (hb && hb.dataset.hud === 'hp') return popupHp(); if (hb && hb.dataset.hud === 'bensin') return popupBensin(); if (hb && hb.dataset.hud === 'stamina') return popupStamina(); if (hb && hb.dataset.hud === 'hb') return popupHb(); bukaDiri(); };
    if ($('h-chip')) $('h-chip').onclick = function (e) { var ch = e.target.closest('[data-chipapp]'); if (ch && S) { app.pesan = ''; if (ch.dataset.chipapp === 'apotek') app.apotekTab = /BPJS/i.test(ch.textContent || '') ? 'rs' : 'obat'; bukaHP(ch.dataset.chipapp); } };
    $('r-bahan').onclick = function (e) { var b = e.target.closest('[data-menu]'); if (b) tapMenu(b.dataset.menu); };
    $('r-tunda').onclick = tutupRacik;
    
    $('b-hp').onclick = function () { app.pesan = ''; bukaHP('beranda'); };
    if ($('b-pesanan')) $('b-pesanan').onclick = function () { bukaPesanan(); };
    $('h-uang').onclick = function () { if (S && (S.fase !== 'pagi' || (S.usaha && S.usaha.berhentiSewa))) bukaLaporanSementara(); };
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
      seretGigi = false;
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
      if ((b = e.target.closest('[data-ct]'))) { var cp = b.dataset.ct.split(':'); return aksiTower(cp[0], cp.slice(1).join(':')); }
      if ((b = e.target.closest('[data-tut]'))) {
        if (b.dataset.tut === 'skip') { if (S) { S.tutorialSelesai = true; simpan(); } tutupLembar(); toast('Selamat bermain! Modal awal Rp5.000.000 siap digunakan.', 2400); return; }
        return bukaTutorial(+b.dataset.tut);
      }
      if ((b = e.target.closest('[data-voucher]'))) {
        var vk = $('in-voucher') ? $('in-voucher').value : '';
        var rv = TOWER ? TOWER.redeemKode(S, vk) : 'Sistem voucher belum siap.';
        if (rv && rv.ok) {
          simpan(); perbaruiHUD(true); perbaruiAksi(); travelKunci = ''; panelTravel(true); panelOjek(true);
          toast(rv.teks, 3200);
          if (lembar === 'vvip') bukaPopupVvip(); else bukaAtur();
        } else toast(rv || 'Kode tidak valid.', 2600);
        return;
      }
      if ((b = e.target.closest('[data-vvip]'))) return aksiVvip(b.dataset.vvip);
      if ((b = e.target.closest('[data-trv]'))) { var tv = b.dataset.trv.split(':'); return aksiTravel(tv[0], tv.slice(1).join(':')); }
      if ((b = e.target.closest('[data-hud]'))) { var hu = b.dataset.hud.split(':'); return aksiHud(hu[0], hu.slice(1).join(':')); }
      if ((b = e.target.closest('[data-besok]'))) return besok();
      if ((b = e.target.closest('[data-pulang]'))) { tutupLembar(); return pindah('kos', true); }
      if ((b = e.target.closest('[data-diri]'))) { var dd = b.dataset.diri.split(':'); return aksiDiri(dd[0], dd.slice(1).join(':')); }
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
    $('lembar').onchange = function (e) {
      var el = e.target; if (!el || !el.id || !S) return;
      if (el.id.indexOf('in-sp-rute-') === 0) {
        var spId = el.id.slice(11);
        var rs = TRAVEL.aturSupir(S, spId, { ruteId: el.value });
        app.pesan = (rs && rs.teks) || rs || ''; app.salah = !(rs && rs.ok);
        simpan(); var sc = $('lembar-isi').scrollTop; bukaHP('travel'); $('lembar-isi').scrollTop = sc;
      } else if (el.id === 'in-spnew-rute') {
        app.spRuteBaru = el.value;
      }
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lembar) tutupLembar(); });
    /* Trigger rahasia Control Tower: tap layar luar (awal/setup) atau dalam game sebanyak 30x berturut-turut */
    var ctTap = 0, ctWaktu = 0;
    document.addEventListener('pointerdown', function (e) {
      if (lembar === 'tower') return;
      if (e.target && e.target.closest && e.target.closest('input, select, textarea')) return;
      var skr = Date.now();
      if (skr - ctWaktu > 2500) ctTap = 0;
      ctWaktu = skr;
      ctTap++;
      if (ctTap >= 25 && ctTap < 30) toast('🗼 Control Tower: ' + (30 - ctTap) + ' tap lagi…', 1100);
      if (ctTap >= 30) {
        ctTap = 0;
        towerUI.pesan = ''; towerUI.salah = false;
        bukaControlTower();
      }
    }, true);
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
