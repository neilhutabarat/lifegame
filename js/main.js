/* main.js — alur game: pilih kota dan QRIS, jam berjalan, buka-tutup kedai, racik dan jualan, laporan malam, kalender, simpan otomatis. */
(function () {
  'use strict';
  var KAL = window.KK_KAL, N = window.KK_NYATA, SIMPAN = window.KK_SIMPAN, ADEGAN = window.KK_ADEGAN, JUAL = window.KK_JUAL, MN = window.KK_MENU, UANG = window.KK_UANG, DIRI = window.KK_DIRI, STOK = window.KK_STOK, MOTOR = window.KK_MOTOR, ANTAR = window.KK_ANTAR, STAF = window.KK_STAF, DUNIA = window.KK_DUNIA, USAHA = window.KK_USAHA, MOBIL = window.KK_MOBIL, OJEK = window.KK_OJEK, TRAVEL = window.KK_TRAVEL, RUTE = window.KK_RUTE, PROPERTI = window.KK_PROPERTI, SUARA = window.KK_SUARA, TEMAN = window.KK_TEMAN;
  var MENIT_PER_DETIK = 2;               /* 1 jam game = 30 detik nyata pada kecepatan 1x */
  var TAHUN_DASAR = 2025;               /* tahun Masehi 2026 = tahun ke-1 (sesuai dunia nyata saat ini) */
  var HARI_PERTAMA = KAL.dn(2026, 1, 5); /* Senin pertama Januari 2026 */

  var $ = function (id) { return document.getElementById(id); };
  var S = null, layar = 'awal', lembar = null, lembarKunci = '', tPrev = 0, menitSimpan = 0, toastT = 0, kotaDipilih = null, hunianDipilih = 'kos_ac', hunianKatFilter = 'kos', qrisDipilih = null, lokasiDipilih = null, modeDriver = true, kotaPulauFilter = 'Semua', aksiCepatBuka = false;
  function tampilanDefault(gender) {
    return { kulit: 'kuning', rambut: gender === 'cowok' ? 'rapi' : 'panjang', warnaRambut: 'hitam', mata: 'cerah', mulut: 'senyum' };
  }
  var profilAwal = { nama: '', gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa', tampilan: tampilanDefault('cewek') };
  var R = null; /* racik yang sedang terbuka: { o: pembeli } */
  var kal = { y: 0, m: 0, pilih: null };

  /* ---------- format ---------- */
  function rupiah(n) { n = Math.round(n); return (n < 0 ? '−Rp' : 'Rp') + Math.abs(n).toLocaleString('id-ID'); }
  function rupiahPendek(n) {
    var a = Math.abs(Math.round(n)), sg = n < 0 ? '−' : '';
    function fmt(v, d) {
      var s = v.toFixed(d);
      if (d > 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
      return s.replace('.', ',');
    }
    if (a >= 1e12) return sg + 'Rp' + fmt(a / 1e12, a >= 1e13 ? 1 : 2) + 'T';
    if (a >= 1e9) return sg + 'Rp' + fmt(a / 1e9, a >= 1e10 ? 1 : 2) + 'M';
    if (a >= 1e6) return sg + 'Rp' + fmt(a / 1e6, a >= 1e8 ? 0 : a >= 1e7 ? 1 : 2) + 'jt';
    if (a >= 1e4) return sg + 'Rp' + fmt(a / 1e3, a >= 1e5 ? 0 : 1) + 'rb';
    return rupiah(n);
  }
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
    if ($('layar-karakter')) $('layar-karakter').hidden = nama !== 'karakter';
    $('layar-kota').hidden = nama !== 'kota';
    if ($('layar-hunian')) $('layar-hunian').hidden = nama !== 'hunian';
    $('layar-qris').hidden = nama !== 'qris';
    $('layar-bank').hidden = nama !== 'bank';
    $('layar-lokasi').hidden = nama !== 'lokasi';
    $('hud').hidden = $('bawah').hidden = nama !== 'main';
    if (nama === 'awal') isiLayarAwal();
    if (nama === 'karakter') isiKarakterAwal();
    if (nama === 'kota') isiKota();
    if (nama === 'hunian') isiHunianAwal();
    if (nama === 'qris') isiQris();
    if (nama === 'bank') isiBank();
    if (nama === 'lokasi') $('lokasi-daftar').innerHTML = Object.keys(USAHA.LOKASI).map(function (id) {
      var L = USAHA.LOKASI[id];
      return '<button type="button" class="kota" data-lokasi="' + id + '"><b>' + esc(L.nama) + '</b><span class="ciri">' + esc(L.ket) + '</span></button>';
    }).join('');
    if (nama === 'main') { aksiCepatBuka = false; perbaruiHUD(true); perbaruiAksi(); perbaruiPesanan(); }
  }
  function tampilanLengkap(tp, gender) {
    var def = tampilanDefault(gender), K = N.karakterOpsi || {};
    var out = {
      kulit: (tp && tp.kulit) || def.kulit,
      rambut: (tp && tp.rambut) || def.rambut,
      warnaRambut: (tp && tp.warnaRambut) || def.warnaRambut,
      mata: (tp && tp.mata) || def.mata,
      mulut: (tp && tp.mulut) || def.mulut
    };
    var listR = gender === 'cowok' ? (K.rambutCowok || []) : (K.rambutCewek || []);
    if (listR.length && !listR.some(function (x) { return x.id === out.rambut; })) out.rambut = listR[0].id;
    return out;
  }
  function warnaTampilanHex(tp, gender) {
    var K = N.karakterOpsi || {}, t = tampilanLengkap(tp, gender);
    var kl = (K.kulit || []).filter(function (x) { return x.id === t.kulit; })[0] || { hex: '#f5cb9f', bayang: '#d9a473' };
    var wr = (K.warnaRambut || []).filter(function (x) { return x.id === t.warnaRambut; })[0] || { hex: '#1c1817', kilau: '#3e3533' };
    return { kulitHex: kl.hex, kulitBayang: kl.bayang, rambutHex: wr.hex, rambutKilau: wr.kilau, rambut: t.rambut, mata: t.mata, mulut: t.mulut };
  }
  function perbaruiPreviewKarakter() {
    var nm = (profilAwal.nama || '').trim() || 'Driver';
    var gd = profilAwal.gender === 'cowok' ? 'cowok' : 'cewek';
    var ttl = profilAwal.tglLahir || '2000-05-15';
    var usia = KAL.usia(HARI_PERTAMA, ttl);
    profilAwal.tampilan = tampilanLengkap(profilAwal.tampilan, gd);
    var K = N.karakterOpsi || {}, tp = profilAwal.tampilan;
    if ($('awal-avatar')) $('awal-avatar').innerHTML = fotoWajah(gd === 'cowok' ? 'char-pemain' : 'char-istri', 64, null, nm, gd, usia, null, tp);
    if ($('awal-nama-prev')) $('awal-nama-prev').textContent = nm;
    if ($('awal-usia-prev')) $('awal-usia-prev').textContent = (gd === 'cowok' ? 'Cowok' : 'Cewek') + ' · Usia ' + usia + ' tahun · Tahun 2026';
    if ($('awal-info-prev')) $('awal-info-prev').textContent = (profilAwal.agama || 'Islam') + ' · Suku ' + (profilAwal.etnis || 'Jawa');
    [].forEach.call(document.querySelectorAll('[data-awal-gender]'), function (btn) {
      btn.classList.toggle('pilih', btn.dataset.awalGender === gd);
    });
    if ($('awal-kulit')) $('awal-kulit').innerHTML = (K.kulit || []).map(function (c) {
      return '<button type="button" class="swatch' + (tp.kulit === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-awal-tp="kulit:' + c.id + '"></button>';
    }).join('');
    var listR = gd === 'cowok' ? (K.rambutCowok || []) : (K.rambutCewek || []);
    if ($('awal-rambut')) $('awal-rambut').innerHTML = listR.map(function (r) {
      return '<button type="button" class="chip-tombol' + (tp.rambut === r.id ? ' pilih' : '') + '" data-awal-tp="rambut:' + r.id + '">' + esc(r.nama) + '</button>';
    }).join('');
    if ($('awal-warna-rambut')) $('awal-warna-rambut').innerHTML = (K.warnaRambut || []).map(function (c) {
      return '<button type="button" class="swatch' + (tp.warnaRambut === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-awal-tp="warnaRambut:' + c.id + '"></button>';
    }).join('');
    if ($('awal-mata')) $('awal-mata').innerHTML = (K.mata || []).map(function (m) {
      return '<button type="button" class="chip-tombol' + (tp.mata === m.id ? ' pilih' : '') + '" data-awal-tp="mata:' + m.id + '">' + esc(m.nama) + '</button>';
    }).join('');
    if ($('awal-mulut')) $('awal-mulut').innerHTML = (K.mulut || []).map(function (m) {
      return '<button type="button" class="chip-tombol' + (tp.mulut === m.id ? ' pilih' : '') + '" data-awal-tp="mulut:' + m.id + '">' + esc(m.nama) + '</button>';
    }).join('');
  }
  function isiKarakterAwal() {
    var K = N.karakterOpsi || {};
    if ($('in-awal-nama')) $('in-awal-nama').value = profilAwal.nama || '';
    if ($('in-awal-ttl')) $('in-awal-ttl').value = profilAwal.tglLahir || '2000-05-15';
    if ($('in-awal-agama')) $('in-awal-agama').innerHTML = (K.agama || ['Islam']).map(function (a) {
      return '<option value="' + esc(a) + '"' + (profilAwal.agama === a ? ' selected' : '') + '>' + esc(a) + '</option>';
    }).join('');
    if ($('in-awal-etnis')) $('in-awal-etnis').innerHTML = (K.etnis || ['Jawa']).map(function (e) {
      return '<option value="' + esc(e) + '"' + (profilAwal.etnis === e ? ' selected' : '') + '>' + esc(e) + '</option>';
    }).join('');
    perbaruiPreviewKarakter();
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
    var pulauList = ['Semua', 'Sumatera', 'Jawa', 'Bali & Nusa Tenggara', 'Kalimantan', 'Sulawesi', 'Maluku & Papua'];
    if ($('kota-filter')) {
      $('kota-filter').innerHTML = pulauList.map(function (p) {
        var jml = p === 'Semua' ? N.kota.length : N.kota.filter(function (k) { return k.pulau === p; }).length;
        return '<button type="button" class="chip-tombol' + (kotaPulauFilter === p ? ' pilih' : '') + '" data-pulau="' + esc(p) + '">' + esc(p) + ' (' + jml + ')</button>';
      }).join('');
    }
    var daftar = kotaPulauFilter === 'Semua' ? N.kota : N.kota.filter(function (k) { return k.pulau === kotaPulauFilter; });
    $('kota-daftar').innerHTML = daftar.map(function (k) {
      return '<button type="button" class="kota" data-kota="' + k.id + '"><b>' + esc(k.nama) + '</b>' +
        '<span class="ciri">Ibu kota ' + esc(k.provinsi) + ' · ' + esc(k.pulau || '') + '</span><span class="umk">UMK 2026 ' + rupiah(k.umk) + '/bln · Sewa mulai ' + rupiahPendek(Math.round(k.kos * 0.65 / 25000) * 25000) + '</span></button>';
    }).join('');
  }
  function svgPreviewHunian(id) {
    var P = {
      kos_hemat: { w1: '#ded8c8', fl: '#a89f91', bd: '#457b9d', wn: '#8ecae6', vw: 'gang', ac: false, sb: false },
      kos_ac: { w1: '#efe6d5', fl: '#c9a679', bd: '#2a9d8f', wn: '#90e0ef', vw: 'pohon', ac: true, sb: true },
      kos_eksklusif: { w1: '#e6ecf2', fl: '#8d6748', bd: '#3a5a8c', wn: '#48cae4', vw: 'balkon', ac: true, sb: true },
      kontrakan_petak: { w1: '#d8e8dc', fl: '#d9d4c7', bd: '#e07a5f', wn: '#a8dadc', vw: 'teras', ac: false, sb: false },
      kontrakan_1kt: { w1: '#f3e5d0', fl: '#e6ccb2', bd: '#b56576', wn: '#90be6d', vw: 'taman', ac: false, sb: true },
      kontrakan_2kt: { w1: '#eae4dc', fl: '#b08968', bd: '#2f6690', wn: '#76c893', vw: 'pagar', ac: true, sb: true },
      apt_rusunami: { w1: '#e2e6ea', fl: '#ced4da', bd: '#495057', wn: '#4ea8de', vw: 'kota', ac: false, sb: true },
      apt_studio: { w1: '#dfe7f2', fl: '#9c7a5b', bd: '#5e60ce', wn: '#2ec4b6', vw: 'skyline', ac: true, sb: true },
      apt_2br: { w1: '#ebe5dc', fl: '#7f5539', bd: '#7209b7', wn: '#1d3557', vw: 'penthouse', ac: true, sb: true }
    }[id] || { w1: '#efe6d5', fl: '#c9a679', bd: '#2a9d8f', wn: '#90e0ef', vw: 'pohon', ac: true, sb: true };
    var gedung = (P.vw === 'kota' || P.vw === 'skyline' || P.vw === 'penthouse')
      ? '<rect x="11" y="16" width="5" height="12" fill="#2b3a4a" opacity=".7"/><rect x="17" y="13" width="6" height="15" fill="#1d2b3a" opacity=".8"/><rect x="24" y="18" width="5" height="10" fill="#3a506b" opacity=".7"/>'
      : '<circle cx="17" cy="22" r="5" fill="#4f9d69"/><rect x="22" y="19" width="7" height="9" fill="#d48c6a"/>';
    var kasur = P.sb
      ? '<rect x="40" y="31" width="32" height="14" rx="2" fill="#5c4033"/><rect x="41" y="34" width="30" height="9" rx="2" fill="' + P.bd + '"/><rect x="43" y="32" width="8" height="4" rx="1.5" fill="#fff"/>'
      : '<rect x="41" y="38" width="30" height="6" rx="1.5" fill="' + P.bd + '"/><rect x="43" y="36" width="7" height="3" rx="1" fill="#fff"/>';
    var acSvg = P.ac ? '<rect x="46" y="8" width="22" height="6" rx="1.5" fill="#fff" stroke="#cbd5e1" stroke-width=".8"/><line x1="49" y1="12" x2="65" y2="12" stroke="#38bdf8" stroke-width="1"/>' : '';
    return '<span class="hk-thumb"><svg viewBox="0 0 78 62"><rect width="78" height="44" fill="' + P.w1 + '"/><rect y="44" width="78" height="18" fill="' + P.fl + '"/><line x1="0" y1="44" x2="78" y2="44" stroke="rgba(0,0,0,.18)" stroke-width="1.2"/>' +
      '<rect x="9" y="9" width="23" height="20" rx="1.5" fill="' + P.wn + '" stroke="#5c4b3c" stroke-width="1.5"/>' + gedung +
      '<line x1="20.5" y1="9" x2="20.5" y2="29" stroke="#5c4b3c" stroke-width="1"/>' + acSvg + kasur + '</svg></span>';
  }
  function isiHunianAwal() {
    var kObj = N.kota.filter(function (x) { return x.id === (kotaDipilih || 'pontianak'); })[0] || N.kota[0];
    if ($('hunian-sub')) $('hunian-sub').textContent = 'Di ' + kObj.nama + ' · Pilih Kos, Kontrakan, atau Apartemen (sewa ditarik mulai tgl 1 bulan depan).';
    var kats = [['kos', '🛏️ Kos-kosan'], ['kontrakan', '🏘️ Kontrakan'], ['apartemen', '🏢 Apartemen']];
    if ($('hunian-tab')) {
      $('hunian-tab').innerHTML = kats.map(function (kt) {
        return '<button type="button" class="chip-tombol' + (hunianKatFilter === kt[0] ? ' pilih' : '') + '" data-hunian-kat="' + kt[0] + '">' + kt[1] + '</button>';
      }).join('');
    }
    var listH = (N.hunianSewa || []).filter(function (h) { return h.kat === hunianKatFilter; });
    if ($('hunian-daftar')) {
      $('hunian-daftar').innerHTML = listH.map(function (h) {
        var hrg = DIRI.hargaSewaHunian ? DIRI.hargaSewaHunian(null, h.id, kObj.id) : Math.round(kObj.kos * h.faktor / 25000) * 25000;
        var fas = [h.ac ? '❄️ AC' : '🌬️ Non-AC', h.kasur === 'springbed' ? '🛏️ Springbed' : '🛌 Kasur Lantai', h.muatRumah ? '🛋️ Muat Perabot Rumah' : '', h.bonusTidur > 0 ? '⚡ Tidur +' + h.bonusTidur : ''].filter(Boolean).join(' · ');
        return '<button type="button" class="hunian-kartu' + (hunianDipilih === h.id ? ' pilih' : '') + '" data-hunian="' + h.id + '">' +
          svgPreviewHunian(h.id) +
          '<div><b>' + esc(h.nama) + '</b><div class="hk-harga">' + rupiah(hrg) + ' / bulan · ' + h.jarak + ' km</div>' +
          '<div class="hk-ket">' + esc(fas) + '</div><div class="hk-ket" style="opacity:.85">' + esc(h.suasana) + '</div></div></button>';
      }).join('');
    }
  }

  function isiQris() {
    $('qris-daftar').innerHTML = N.qris.map(function (q) {
      return '<button type="button" class="kota" data-qris="' + q.id + '"><b><i class="tanda-qris" style="background:' + q.warna + '"></i>' + esc(q.nama) + '</b>' +
        '<span class="ciri">' + esc(q.transfer) + '</span></button>';
    }).join('');
  }
  function isiBank() {
    $('bank-daftar').innerHTML = N.bank.map(function (b) {
      return '<button type="button" class="kota" data-bank="' + b.id + '"><b><i class="tanda-qris" style="background:' + b.warna + '"></i>' + esc(b.nama) + ' <span style="font-size:12px;font-weight:700;opacity:.65">(' + esc(b.app) + ')</span></b>' +
        '<span class="ciri">' + esc(b.ket || (b.tunai ? 'Tanpa biaya admin · transfer gratis ' + b.gratisTransfer + 'x sebulan · tunai di ' + b.tunai.tempat + ' ' + rupiah(b.tunai.biaya) : 'Admin ' + rupiah(b.admin) + ' sebulan · transfer ATM sampai ' + rupiah(b.batasTransfer) + ' sehari')) + '</span></button>';
    }).join('');
  }
  /* lengkapi simpanan lama (tahap 1 dan 2) */
  function lengkapi(d) {
    d.v = 3;
    UANG.migrasi(d); d.tutupSementara = false;
    d.teman = d.teman || []; d.pesanan = []; d.namaToko = d.namaToko || 'The Driver'; if (d.usaha) d.usaha.berhentiSewa = true; /* kedai dihapus: semua simpanan jadi mode driver */
    d.namaPemain = d.namaPemain || 'Driver';
    d.profil = d.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa', tampilan: tampilanDefault('cewek') };
    if (!d.profil.agama) d.profil.agama = 'Islam';
    if (!d.profil.etnis) d.profil.etnis = 'Jawa';
    d.profil.tampilan = tampilanLengkap(d.profil.tampilan, d.profil.gender || 'cewek');
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
    d.vvip = { aktif: false };
    delete d.sandbox;
    if (d.gigiJalan > 4) d.gigiJalan = 4;
    if (d.travel && d.travel.gigi > 4) d.travel.gigi = 4;
    if (d.travel && TRAVEL && TRAVEL.pastikanKasTravel && (d.mobil || (d.travel.supir && d.travel.supir.length))) TRAVEL.pastikanKasTravel(d, 0);
    d.riwayat = d.riwayat || [];
    d.omzetTahun = d.omzetTahun || 0;
    d.tahunOmzet = d.tahunOmzet || KAL.tgl(d.hari).y;
    return d;
  }
  function mulaiBaru(kota, qris, bank) {
    /* game baru: modal awal bersih tepat Rp5.000.000 (Rp4.850.000 bank + Rp150.000 dompet tunai), mulai tahun 2026 dengan profil lengkap */
    var nmAwal = (profilAwal.nama || '').trim().slice(0, 24) || 'Driver';
    var gdAwal = profilAwal.gender === 'cowok' ? 'cowok' : 'cewek';
    var prAwal = {
      gender: gdAwal,
      tglLahir: profilAwal.tglLahir || '2000-05-15',
      agama: profilAwal.agama || 'Islam',
      etnis: profilAwal.etnis || 'Jawa',
      tampilan: tampilanLengkap(profilAwal.tampilan, gdAwal)
    };
    S = lengkapi({
      v: 3, kota: kota, qris: qris, hari: HARI_PERTAMA, menit: 360, fase: 'pagi', jamBuka: 7, jamTutup: 22, kec: 1, hariKe: 1, dibuat: Date.now(),
      namaPemain: nmAwal, profil: prAwal,
      bonusBank50jt: true, bonusBank200jt: true, bonusBank500jt: true, gantiRugiKk500jt: true, bonusBank5M: true, pemutihanKredit1: true, pemutihanKredit2: true,
      tutorialSelesai: false
    });
    S.bank = null; S.uang = null;
    UANG.siapkan(S, bank);
    if (DIRI.setHunianAwal) DIRI.setHunianAwal(S, hunianDipilih || 'kos_ac');
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
    var bbmHud = S.motor ? Math.round((S.motor.bbm === 'listrik' ? S.motor.baterai : S.motor.isi) * 10) : 0;
    var bbmCar = S.mobil ? Math.round((S.mobil.isi || 0) * 100) : 0;
    var kunciHUD = S.hari + ':' + Math.floor(S.menit) + ':' + S.fase + ':' + bbmHud + ':' + bbmCar;
    if (!paksa && kunciHUD === hudTerakhir) return; hudTerakhir = kunciHUD;
    $('h-jam').textContent = jam(S.menit);
    $('h-hari').textContent = namaTanggal(S.hari, true);
    var uPemain = KAL.usia(S.hari, S.profil && S.profil.tglLahir), gPemain = (S.profil && S.profil.gender) || 'cewek';
    var tpP = S.profil && S.profil.tampilan;
    var kFoto = gPemain + '|' + (S.namaPemain || '') + '|' + (tpP ? [tpP.kulit, tpP.rambut, tpP.warnaRambut, tpP.mata, tpP.mulut].join(',') : '');
    var hf = $('h-foto'); if (hf && hf.dataset.k !== kFoto) { hf.dataset.k = kFoto; hf.innerHTML = fotoWajah(srcPemain(), 36, null, S.namaPemain, gPemain, uPemain, null, tpP).replace(/^<span[^>]*>|<\/span>$/g, ''); }
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
    var makanMinum = Math.round(((d.kenyang || 0) + (d.minum || 0)) / 2);
    var mmKritis = d.kenyang < 20 || d.minum < 20;
    $('h-diri').innerHTML = bar('Makan', makanMinum, false, null, mmKritis) + bar('Stamina', d.stamina, false, 'stamina') + bar('HB', d.hb || 0, true, 'hb') + bar(lblHp, batHp, false, 'hp') + barBensin();
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', d.posisi === 'kos');
    var tanpaToko = !!(S.usaha && S.usaha.berhentiSewa);
    if ($('h-uang')) $('h-uang').classList.toggle('mode-driver', tanpaToko);
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
    var sedangJalanOrder = !!(tr || (ojek && (S.ojek.tawaran || S.ojek.trip)) || (trv && S.travel.status !== 'tunggu'));
    if (sedangJalanOrder) aksiCepatBuka = false;
    $('travel-panel').hidden = !trv; if (trv) panelTravel(true);
    if ($('kedai-aksi')) $('kedai-aksi').hidden = true;
    if ($('b-home')) $('b-home').classList.toggle('aktif-home', diKos);
    if ($('b-aksi-cepat')) {
      $('b-aksi-cepat').disabled = sedangJalanOrder;
      $('b-aksi-cepat').classList.toggle('aktif-aksi', aksiCepatBuka && !sedangJalanOrder);
    }
    var tampilLaciAksi = aksiCepatBuka && !sedangJalanOrder;
    $('kos-aksi').hidden = !tampilLaciAksi;
    if (tampilLaciAksi) isiKosAksi();
    $('ojek-panel').hidden = !ojek; if (ojek) { panelOjek(true); }
    if (ojek || trv || tr) { b.hidden = true; }
    else if (diKos) {
      if (S.usaha.berhentiSewa) {
        b.hidden = true;
      } else {
        var siapTidur = S.fase === 'malam' || (S.menit % 1440) >= 1080 || (S.ojek && S.ojek.hariIni && S.ojek.hariIni.trip > 0);
        b.hidden = false; b.disabled = false;
        b.textContent = siapTidur ? 'Tidur, bangun pukul ' + jam(S.diri.bangun) : 'Berangkat ke kedai';
      }
    }
    else if (S.fase === 'pagi') {
      if (S.usaha.berhentiSewa) {
        b.hidden = true;
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

  /* ---------- lembar bawah (otomatis pertahankan posisi scroll saat atur apa pun di layar yang sama) ---------- */
  function kunciLembar(nama) {
    if (nama !== 'hp') return nama;
    return [
      'hp', app.nama || '', app.tab || '', app.bankTab || '', app.qrisTab || '',
      app.garasiTab || '', app.motorTab || '', app.kelasMotor || '', app.kelasMobil || '', app.bekasTab || '',
      app.makanTab || '', app.makanCara || '', app.tokoMenu || '', app.tokoTab || '', app.tokoKat || '',
      app.gameTab || '', app.gameKonsolFilter || '', app.gadgetTab || '', app.merekGadget || '',
      app.apotekTab || '', app.kelTab || '', app.propTab || '', app.hunianKat || '', app.travelTab || '', app.trvFilter || '',
      app.temanTab || '', app.temanDetailId || '', app.tmFilter || '', app.rpsTab || '', app.hadiahKat || '', app.meter || ''
    ].join('|');
  }
  function bukaLembar(nama, html) {
    aksiCepatBuka = false;
    if ($('kos-aksi')) $('kos-aksi').hidden = true;
    if ($('b-aksi-cepat')) $('b-aksi-cepat').classList.remove('aktif-aksi');
    var el = $('lembar-isi'), kunciBaru = kunciLembar(nama);
    var tetap = !$('lembar').hidden && lembar === nama && kunciBaru === lembarKunci;
    var gulirLama = tetap ? el.scrollTop : 0;
    lembar = nama; lembarKunci = kunciBaru;
    el.innerHTML = '<div class="pegangan"></div>' + html;
    $('lembar').hidden = false;
    el.scrollTop = gulirLama;
  }
  function tutupLembar() { lembar = null; lembarKunci = ''; $('lembar').hidden = true; if (layar === 'main' && S) perbaruiAksi(); }

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
    var pr = S.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa' };
    pr.tampilan = tampilanLengkap(pr.tampilan, pr.gender || 'cewek');
    var K = N.karakterOpsi || {}, tp = pr.tampilan;
    var usia = KAL.usia(S.hari, pr.tglLahir), thn = KAL.tgl(S.hari).y;
    var listR = pr.gender === 'cowok' ? (K.rambutCowok || []) : (K.rambutCewek || []);
    bukaLembar('atur',
      kepala('Pengaturan', k.nama + ' (' + thn + ')') +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' + fotoWajah(srcPemain(), 60, null, S.namaPemain, pr.gender, usia, null, tp) +
      '<div><b>' + esc(S.namaPemain || 'Driver') + '</b><div style="font-size:12px;color:var(--tinta-pudar);font-weight:700">' + (pr.gender === 'cowok' ? 'Cowok' : 'Cewek') + ' · ' + usia + ' thn · ' + esc(pr.agama || 'Islam') + ' · ' + esc(pr.etnis || 'Jawa') + '</div></div></div>' +
      '<details class="kartu-lipat"><summary>👤 Ubah Data & Tampilan Wajah Karakter</summary>' +
      '<div class="form-grid-2" style="margin-top:4px"><label class="form-lbl">Nama pemain<input id="in-pemain" class="input-teks" type="text" maxlength="24" value="' + esc(S.namaPemain || 'Driver') + '"></label>' +
      '<label class="form-lbl">Tanggal lahir<input id="in-ttl" class="input-teks" type="date" value="' + esc(pr.tglLahir || '2000-05-15') + '"></label></div>' +
      '<div class="form-grid-2" style="margin-top:6px"><label class="form-lbl">Agama<select id="in-agama" class="input-teks">' + (K.agama || ['Islam']).map(function (a) { return '<option value="' + esc(a) + '"' + (pr.agama === a ? ' selected' : '') + '>' + esc(a) + '</option>'; }).join('') + '</select></label>' +
      '<label class="form-lbl">Etnis / Suku<select id="in-etnis" class="input-teks">' + (K.etnis || ['Jawa']).map(function (e) { return '<option value="' + esc(e) + '"' + (pr.etnis === e ? ' selected' : '') + '>' + esc(e) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="form-lbl" style="margin-top:6px">Jenis kelamin<div class="opsi-chip"><button type="button" class="chip-tombol' + (pr.gender === 'cewek' ? ' pilih' : '') + '" data-gender="cewek">👩 Cewek</button><button type="button" class="chip-tombol' + (pr.gender === 'cowok' ? ' pilih' : '') + '" data-gender="cowok">👨 Cowok</button></div></div>' +
      '<div class="form-lbl" style="margin-top:6px">Warna kulit<div class="swatch-baris">' + (K.kulit || []).map(function (c) { return '<button type="button" class="swatch' + (tp.kulit === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-atur-tp="kulit:' + c.id + '"></button>'; }).join('') + '</div></div>' +
      '<div class="form-lbl" style="margin-top:6px">Gaya rambut<div class="opsi-chip">' + listR.map(function (r) { return '<button type="button" class="chip-tombol' + (tp.rambut === r.id ? ' pilih' : '') + '" data-atur-tp="rambut:' + r.id + '">' + esc(r.nama) + '</button>'; }).join('') + '</div></div>' +
      '<div class="form-lbl" style="margin-top:6px">Warna rambut<div class="swatch-baris">' + (K.warnaRambut || []).map(function (c) { return '<button type="button" class="swatch' + (tp.warnaRambut === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-atur-tp="warnaRambut:' + c.id + '"></button>'; }).join('') + '</div></div>' +
      '<div class="form-lbl" style="margin-top:6px">Jenis mata<div class="opsi-chip">' + (K.mata || []).map(function (m) { return '<button type="button" class="chip-tombol' + (tp.mata === m.id ? ' pilih' : '') + '" data-atur-tp="mata:' + m.id + '">' + esc(m.nama) + '</button>'; }).join('') + '</div></div>' +
      '<div class="form-lbl" style="margin-top:6px">Jenis mulut<div class="opsi-chip">' + (K.mulut || []).map(function (m) { return '<button type="button" class="chip-tombol' + (tp.mulut === m.id ? ' pilih' : '') + '" data-atur-tp="mulut:' + m.id + '">' + esc(m.nama) + '</button>'; }).join('') + '</div></div>' +
      '<div style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-simpan-nama>Simpan profil & identitas</button></div></details>' +
      '<h3 class="subjudul">Mode Promo & Panduan</h3>' +
      '<div class="atur-baris"><div><b>📢 Mode Promo</b><span>Order ojol, driver, & pelanggan naik +50%–80%</span></div><div><button type="button" class="chip-tombol' + (S.promoAktif ? ' pilih' : '') + '" data-promo="1">' + (S.promoAktif ? 'Aktif ✓' : 'Mati') + '</button></div></div>' +
      '<div class="atur-baris"><div><b>🔒 Kecepatan Level 5 (Top Speed)</b><span>Mode normal maks Level 4 (realistis). Level 5 terkunci.</span></div><div><button type="button" class="chip-tombol" data-vvip="popup">🔒 Terkunci</button></div></div>' +
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
    /* baris utama: pekerjaan, kebutuhan harian, keuangan & kendaraan terpisah rapi */
    { id: 'driver', nama: function () { return 'Driver ojol'; }, warna: function () { return '#00aa13'; },
      ikon: function () { return svgIkon('<path d="M4 14a8 8 0 0 1 16 0v3H4v-3z"/><path d="M12 11h7.5v3H12z"/>'); },
      badge: function () { return S.ojek.online ? 'ON' : ''; } },
    { id: 'makan', nama: function () { return 'Makan'; }, warna: function () { return '#e0675a'; },
      ikon: function () { return svgIkon('<path d="M7 3v8a2 2 0 0 0 4 0V3M9 3v18M16 3v18M16 3c2.5 0 3.5 2 3.5 5s-1 5-3.5 5"/>'); },
      badge: function () { return S.diri.kenyang < 25 || S.diri.minum < 25 ? '!' : ''; } },
    { id: 'keluarga', nama: function () { return 'Keluarga'; }, warna: function () { return '#e91e63'; },
      ikon: function () { return svgIkon('<circle cx="9" cy="7" r="3"/><circle cx="16.5" cy="9.5" r="2.3"/><path d="M3.5 19c0-3 2.5-5.2 5.5-5.2s5.5 2.2 5.5 5.2"/><path d="M14 19c0-2.1 1.5-3.8 3.5-3.8S21 16.9 21 19"/>'); },
      badge: function () { return (S.bulanTanpaNafkah || 0) > 0 ? '!' : ((S.diri.hb || 0) >= 85 && DIRI.pasanganAktif(S) ? 'HB' : (S.keluarga && S.keluarga.length ? String(S.keluarga.length) : '')); } },
    { id: 'teman', nama: function () { return 'Teman'; }, warna: function () { return '#3f8fd9'; },
      ikon: function () { return svgIkon('<circle cx="8" cy="8" r="3"/><circle cx="16" cy="9" r="2.5"/><path d="M2.5 19c0-3.2 2.4-5.2 5.5-5.2s5.5 2 5.5 5.2M14 14.2c3 0 7 1.4 7 4.8"/>'); },
      badge: function () { return S.popupSelingkuh ? '!' : ''; } },
    { id: 'bank', nama: function () { return UANG.bankIni(S).app; }, warna: function () { return UANG.bankIni(S).warna; },
      ikon: function () { return svgIkon('<path d="M3 10h18M5 10v8M10 10v8M14 10v8M19 10v8M2 18h20M12 3 2 8v2h20V8z"/>'); } },
    { id: 'merchant', nama: function () { return 'QRIS'; }, warna: function () { return '#00aed6'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 14h2.5M14 18.5h6.5M18 16.5v4"/>'); },
      badge: function () { return (UANG.tersedia(S) > 0 || (TRAVEL.totalQrisSupir && TRAVEL.totalQrisSupir(S) > 0)) ? 'Rp' : ''; } },
    { id: 'motor', nama: function () { return 'Garasi'; }, warna: function () { return '#37474f'; },
      ikon: function () { return svgIkon('<path d="M3 10.5 12 4l9 6.5V20H3z"/><path d="M7 20v-7h10v7M9.5 16h5"/>'); },
      badge: function () { var j = ((S.armadaMotor && S.armadaMotor.length) || 0) + ((S.armadaMobil && S.armadaMobil.length) || 0); return j ? String(j) : ''; } },
    { id: 'dealerMotor', nama: function () { return 'Dealer Motor'; }, warna: function () { return '#d9443a'; },
      ikon: function () { return svgIkon('<circle cx="6.5" cy="16.5" r="3"/><circle cx="17.5" cy="16.5" r="3"/><path d="M6.5 16.5 10 10h4.5l3 6.5M13 7h3"/>'); } },
    { id: 'dealerMobil', nama: function () { return 'Dealer Mobil'; }, warna: function () { return '#c62828'; },
      ikon: function () { return svgIkon('<path d="M4 14l2-5h12l2 5v4H4v-4z"/><circle cx="7.5" cy="18" r="2"/><circle cx="16.5" cy="18" r="2"/><path d="M6 14h12"/>'); } },
    { id: 'agenBekas', nama: function () { return 'Agen Bekas'; }, warna: function () { return '#e67e22'; },
      ikon: function () { return svgIkon('<path d="M4 13l2-4.5h12L20 13v4H4z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/><path d="M9 5h6"/>'); },
      badge: function () { return '★'; } },
    { id: 'travel', nama: function () { return 'Travel'; }, warna: function () { return '#6a4fd8'; },
      ikon: function () { return svgIkon('<path d="M3.5 15l1.6-4.6A2 2 0 0 1 7 9h10a2 2 0 0 1 1.9 1.4L20.5 15v3.5h-17z"/><circle cx="7.5" cy="18.5" r="1.8"/><circle cx="16.5" cy="18.5" r="1.8"/><path d="M5.5 13h13"/>'); },
      badge: function () { return S.travel && S.travel.aktif ? '•' : ''; } },
    { id: 'kastravel', nama: function () { return 'Kas Travel'; }, warna: function () { return '#1565c0'; },
      ikon: function () { return svgIkon('<rect x="3" y="6.5" width="18" height="13" rx="2.5"/><path d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 11.5h18M12 11.5v3"/>'); },
      badge: function () { return (S.travel && (S.travel.kas || 0) < (TRAVEL.KAS_MIN || 50000000) && S.travel.autoTopupKas === false) ? '!' : ''; } },
    { id: 'apotek', nama: function () { return 'Apotek & RS'; }, warna: function () { return '#00a651'; },
      ikon: function () { return svgIkon('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/>'); },
      badge: function () { return S.diri.sakit || S.diri.hiv || (S.keluarga || []).some(function (k) { return !!k.sakit; }) ? '!' : ''; } },
    { id: 'gadget', nama: function () { return 'HP & Kuota'; }, warna: function () { return '#1e88e5'; },
      ikon: function () { return svgIkon('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10 5.5h4M12 18.5h.01"/>'); },
      badge: function () { return (S.hp && (S.hp.baterai < 20 || (!DIRI.adaWifi(S) && S.hp.kuota < 1))) ? '!' : ''; } },
    { id: 'toko', nama: function () { return 'Toko Online'; }, warna: function () { return '#42b549'; },
      ikon: function () { return svgIkon('<path d="M6 8h12l1 12H5L6 8zM9 8V6a3 3 0 0 1 6 0v2"/><circle cx="10" cy="13" r="1" fill="currentColor"/><circle cx="14" cy="13" r="1" fill="currentColor"/>'); },
      badge: function () { return KAL.tanggalKembar(S.hari) || ''; } },
    { id: 'game', nama: function () { return 'Toko Game'; }, warna: function () { return '#00439c'; },
      ikon: function () { return svgIkon('<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9" fill="currentColor"/><circle cx="17.8" cy="13.5" r=".9" fill="currentColor"/>'); } },
    { id: 'properti', nama: function () { return 'Properti'; }, warna: function () { return '#8a5a2b'; },
      ikon: function () { return svgIkon('<path d="M3.5 11.5 12 4l8.5 7.5M6 10v9.5h12V10M10 19.5v-5h4v5"/>'); },
      badge: function () { var dr = PROPERTI.daftarRumah ? PROPERTI.daftarRumah(S) : []; return dr.some(function (r) { return r.status === 'siap' && !r.dihuni && !r.sewa; }) ? '!' : ''; } },
    { id: 'pln', nama: function () { return 'PLN Mobile'; }, warna: function () { return '#00a2e9'; },
      ikon: function () { return svgIkon('<path d="M13 2.5 5 13h6l-1 8.5L19 11h-6z" fill="currentColor" stroke="none"/>'); },
      badge: function () { return (!S.usaha.berhentiSewa && S.usaha.padam) || S.rumah.padam ? '!' : ''; } },
    { id: 'rental', nama: function () { return 'Sewa Aset'; }, warna: function () { return '#6d4c41'; },
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
    else if (app.nama === 'qriskaryawan') { app.qrisTab = 'supir'; app.nama = 'merchant'; html = layarMerchant(); }
    else if (app.nama === 'laci') { app.nama = 'bank'; html = layarBank(); }
    else if (app.nama === 'pajak') html = layarPajak();
    else if (app.nama === 'oss') html = layarOss();
    else if (app.nama === 'belanja') html = layarBelanja();
    else if (app.nama === 'stok') html = layarStok();
    else if (app.nama === 'motor') html = layarMotor();
    else if (app.nama === 'dealerMotor') html = layarDealerMotor();
    else if (app.nama === 'dealerMobil') html = layarDealerMobil();
    else if (app.nama === 'agenBekas') html = layarAgenBekas();
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
      segTab('bankTab', [['tunai', '💵 Tunai'], ['tabungan', '🏦 Tabungan'], ['kredit', '💳 KK & KUR'], ['mutasi', '📜 Mutasi']], tabB) + pesanApp();
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
    var tabQ = app.qrisTab || 'pribadi', totQrisK = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
    var kelas = (S.omzetTahun || 0) > N.mdr.batasMikro ? 'kecil' : 'mikro', m = N.mdr[kelas];
    var html = kepalaApp('QRIS & Dompet Digital', Object.keys(S.merchants).length + '/' + N.qris.length + ' akun aktif') +
      segTab('qrisTab', [['pribadi', '📲 QRIS Pribadi'], ['supir', '👨‍✈️ QRIS Supir' + (totQrisK > 0 ? ' (' + rupiahPendek(totQrisK) + ')' : '')]], tabQ) + pesanApp();
    if (tabQ === 'supir') {
      var T = TRAVEL.siapkan(S), listSp = T.supir || [];
      html += '<div class="saldo-besar" style="background:#00796b"><small>Total Saldo QRIS Supir Travel (' + listSp.length + ' supir)</small><b>' + rupiah(totQrisK) + '</b></div>' +
        (totQrisK > 0 ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-aksi="tarikQrisSupir:semua">💸 Tarik Semua ke ' + esc(UANG.bankIni(S).nama) + '</button></div>' : '');
      if (!listSp.length) {
        return html + '<p class="catatan">Belum ada Supir Travel. Rekrut supir di aplikasi <b>Travel → Supir</b> agar tiap supir punya QRIS setoran sendiri.</p>' +
          '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="travel">Buka Travel</button></div>';
      }
      return html + '<div class="grid-2">' + listSp.map(function (sp) {
        var mSp = TRAVEL.mobilUntukSupir ? TRAVEL.mobilUntukSupir(S, sp) : null;
        var ruteTxt = sp.ruteId && sp.ruteId !== 'otomatis' && RUTE.kota[sp.ruteId] ? RUTE.nama(sp.ruteId) : 'Otomatis';
        var sld = Math.max(0, Math.round(sp.qrisSaldo || 0));
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(sp.qrisKode || 'QRIS-TRV') + '</span></div>' +
          '<b>' + esc(sp.nama) + '</b><small>' + esc(mSp ? mSp.mobil.nama : '-') + ' · ' + esc(ruteTxt) + '</small>' +
          '<div class="ki-harga">' + rupiah(sld) + '</div></div>' +
          '<div class="ki-aksi">' + (sld > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tarikQrisSupir:' + sp.id + '">Tarik ke Bank</button>' : '<small>Saldo Rp0</small>') + '</div></div>';
      }).join('') + '</div>';
    }
    html += '<div class="saldo-besar"><small>Saldo Siap Tarik (' + Object.keys(S.merchants || {}).length + '/' + N.qris.length + ' akun)</small><b>' + rupiah(UANG.tersedia(S)) + '</b></div><div class="grid-2">';
    html += N.qris.map(function (q) {
      var mm = S.merchants[q.id];
      if (!mm) return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag" style="background:' + q.warna + ';color:#fff">' + esc(q.nama) + '</span></div><b>' + esc(q.app) + '</b><small>' + esc(q.transfer) + '</small></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="pasangQris:' + q.id + '">Pasang</button></div></div>';
      var sisaGratis = q.gratis === Infinity ? 'Gratis ∞' : q.gratis === 0 ? rupiahPendek(q.biayaLebih) + '/tarik' : Math.max(0, q.gratis - mm.tarikBulanIni) + '× gratis';
      var menunggu = UANG.saldoMerchant(mm) - mm.tersedia;
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag" style="background:' + q.warna + ';color:#fff">' + esc(q.nama) + '</span><span class="ki-tag milik">' + sisaGratis + '</span></div>' +
        '<b>' + esc(q.app) + '</b>' +
        (mm.aktifPada && S.hari < mm.aktifPada
          ? '<small>Aktif ' + namaTanggal(mm.aktifPada) + '</small>'
          : '<div class="ki-harga">' + rupiah(mm.tersedia) + '</div>' + (menunggu > 0 ? '<small>Cair besok: ' + rupiahPendek(menunggu) + '</small>' : '<small>Siap ditarik</small>')) +
        '</div><div class="ki-aksi">' +
        (mm.tersedia > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tarikMerchant:' + q.id + '">Tarik</button>' : '') +
        '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="tutupQris:' + q.id + '">Tutup</button></div></div>';
    }).join('') + '</div>';
    return html + '<details class="kartu-lipat"><summary>ℹ️ Info Kelas Merchant & MDR QRIS</summary><ul class="daftar angka">' + baris('Kelas merchant', 'Merchant ' + kelas) + baris('MDR QRIS<small>0% s/d ' + rupiah(m.gratisSampai) + ', di atasnya ' + (m.tarif * 100).toFixed(1).replace('.', ',') + '%</small>', '') + '</ul></details>';
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
      '<div class="kartu-hero" style="background:linear-gradient(135deg,#0d47a1,#1976d2)"><small>Saldo Kas Travel · Auto Top-Up &lt; ' + rupiahPendek(target) + ': ' + (autoOn ? 'AKTIF ✓' : 'MATI') + '</small><b>' + rupiah(sld) + '</b></div>' +
      '<div class="cat-strip"><button type="button" class="' + (autoOn ? 'pilih' : '') + '" data-aksi="toggleAutoKasTravel:1">' + (autoOn ? '✓ Auto Top-Up &lt; 50jt' : 'Aktifkan Auto Top-Up') + '</button><button type="button" data-app="travel">🚐 Travel</button><button type="button" data-app="qriskaryawan">📲 QRIS Supir</button></div>' +
      '<h3 class="subjudul">Isi dari Bank ' + esc(bankNm) + ' (' + rupiahPendek(S.bank.saldo) + ')</h3>' +
      tombolNominalGrid('isiKasTravel', [5000000, 10000000, 25000000, 50000000, 100000000]) +
      '<div class="chip-baris" style="margin-top:6px;align-items:center"><input id="in-kas-isi" class="input-teks" type="number" step="1000000" min="100000" placeholder="Nominal manual (Rp)" style="margin:0;flex:1"><button type="button" class="chip-tombol pilih" data-aksi="isiKasTravel:input">Transfer</button></div>' +
      (sld > 0 ? '<h3 class="subjudul">Tarik ke Bank ' + esc(bankNm) + '</h3>' + tombolNominalGrid('tarikKasTravel', [10000000, 25000000, 50000000, 100000000, 'semua']) : '') +
      '<details class="kartu-lipat"><summary>📜 Riwayat Mutasi Kas (' + mut.length + ')</summary><ul class="daftar angka">' + (mut.length ? mut.map(function (m) {
        return baris(esc(m.ket) + '<small>' + namaTanggal(m.n) + '</small>', (m.jml < 0 ? '−' : '+') + rupiah(Math.abs(m.jml)), m.jml < 0 ? 'keluar' : 'masuk');
      }).join('') : '<li><span>Belum ada mutasi.</span></li>') + '</ul></details>';
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
      '<div class="kartu-hero"><small>Batas Bebas Pajak UMKM ' + rupiahPendek(p.bebas) + '/thn (' + persen.toFixed(1) + '%)</small><b>' + rupiah(ot) + '</b></div>' +
      '<div class="stat-grid-2"><div class="stat-box"><small>Omzet Bulan Ini</small><b>' + rupiahPendek(S.pajak.omzetBulan) + '</b></div><div class="stat-box"><small>Tarif Lewat Batas</small><b>' + (p.tarif * 100).toFixed(1).replace('.', ',') + '% (tgl ' + p.jatuhTempo + ')</b></div></div>' +
      '<div class="meteran"><i style="width:' + persen.toFixed(1) + '%"></i></div>' +
      '<h3 class="subjudul">Tagihan Pajak</h3><ul class="daftar angka">' + (tagihan.length ? tagihan.map(function (x) {
        return '<li><span>PPh ' + esc(x.t.bulan) + '<small>Jatuh tempo ' + namaTanggal(x.t.jatuhTempo) + (x.t.denda ? ' · denda ' + rupiah(x.t.denda) : '') + '</small></span><span><button type="button" class="chip-tombol pilih" data-aksi="bayarPajak:' + x.i + '">Bayar ' + rupiah(x.t.jml + x.t.denda) + '</button></span></li>';
      }).join('') : '<li><span>Tidak ada tagihan pajak</span></li>') + '</ul>';
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
  function segTab(aksi, daftar, pilih) { return '<div class="seg-tab">' + daftar.map(function (t) { return '<button type="button" class="' + (t[0] === pilih ? 'pilih' : '') + '" data-aksi="' + aksi + ':' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>'; }
  function catStrip(aksi, daftar, pilih) { return '<div class="cat-strip">' + daftar.map(function (t) { return '<button type="button" class="' + (t[0] === pilih ? 'pilih' : '') + '" data-aksi="' + aksi + ':' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>'; }

  /* ---------- Garasi (khusus kendaraan milikmu), Dealer Motor, Dealer Mobil, & Agen Bekas ---------- */
  function layarMotor() {
    var armadaM = S.armadaMotor || (S.motor ? [S.motor] : []), armadaC = S.armadaMobil || (S.mobil ? [S.mobil] : []);
    var gTab = app.garasiTab || (armadaM.length ? 'motor' : armadaC.length ? 'mobil' : 'motor');
    if (gTab === 'motor' && !armadaM.length && armadaC.length) gTab = 'mobil';
    var html = kepalaApp('Garasi', armadaM.length + ' motor · ' + armadaC.length + ' mobil') +
      segTab('garasiTab', [['motor', '🏍️ Motor (' + armadaM.length + ')'], ['mobil', '🚗 Mobil (' + armadaC.length + ')']], gTab) + pesanApp();
    if (!armadaM.length && !armadaC.length) {
      return html + '<div class="kartu-hero"><small>Garasi masih kosong</small><b>Beli kendaraan pertamamu!</b></div>' +
        '<p class="catatan">Dengan modal awal Rp5jt, kamu bisa langsung kredit motor (DP mulai Rp1,5jt) di Dealer Motor atau kumpulkan dana untuk unit bekas di Agen Bekas, lalu langsung daftar & narik Ojol hari ini juga!</p>' +
        '<div class="grid-2"><button type="button" class="kartu-item" data-app="dealerMotor"><b>🏍️ Dealer Motor</b><small>Kredit DP 10% / Tunai</small></button>' +
        '<button type="button" class="kartu-item" data-app="agenBekas"><b>★ Agen Bekas</b><small>Motor & Mobil Bekas</small></button>' +
        '<button type="button" class="kartu-item" data-app="dealerMobil"><b>🚗 Dealer Mobil</b><small>Pikap, MPV, SUV, Sultan</small></button></div>';
    }
    if (gTab === 'motor') {
      var m = S.motor;
      if (!m) return html + '<p class="catatan">Belum punya motor.</p><div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="dealerMotor">Buka Dealer Motor</button><button type="button" class="chip-tombol" data-app="agenBekas">Buka Agen Bekas</button></div>';
      if (armadaM.length > 1) {
        html += catStrip('pilihMotor', armadaM.map(function (mt, idx) {
          var swM = MOTOR.disewakan && MOTOR.disewakan(S, idx);
          return [String(idx), (idx + 1) + '. ' + mt.nama + (swM ? ' 🔑' : idx === (S.motorAktif || 0) ? ' ★' : '')];
        }), String(S.motorAktif || 0));
      }
      var mDisewakan = MOTOR.disewakan && MOTOR.disewakan(S);
      var listrik = m.bbm === 'listrik', oli = N.rawat.oliKm - (m.km - m.kmOli), sv = N.rawat.servisKm - (m.km - m.kmServis), banKmM = N.rawat.banKm || 40000, sisaBanM = banKmM - (m.km - (m.kmBan || 0)), pjk = MOTOR.tagihanPajak(S);
      var lamaM = Math.max(0, S.hari - (m.dibeli == null ? S.hari : m.dibeli));
      html += '<div class="saldo-besar"><small>' + esc(m.nama) + ' · ' + (listrik ? 'Baterai EV' : N.bbm.nama[m.bbm]) + (mDisewakan ? ' · 🔑 DISEWAKAN' : '') + '</small><b>' + (listrik ? Math.round(m.baterai) + ' km' : m.isi.toFixed(1).replace('.', ',') + ' / ' + String(m.tangki).replace('.', ',') + ' L') + '</b>' + persenBar(listrik ? m.baterai / m.jarakPenuh * 100 : m.isi / m.tangki * 100) + '</div>' +
        (mDisewakan ? '<div class="isbat peringatan" style="margin:0 0 8px">🔑 Motor ini sedang <b>disewakan</b> di Sewa Aset — tidak bisa dipakai ngojol atau dikendarai sebelum sewa dihentikan.<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="sewaBarang:motor:' + (S.motorAktif || 0) + '">Hentikan Sewa Motor</button></div></div>' : '') +
        '<div class="stat-grid-2">' +
        '<div class="stat-box"><small>Odometer · Usia</small><b>' + Math.round(m.km).toLocaleString('id-ID') + ' km · ' + lamaM + ' hr</b></div>' +
        '<div class="stat-box"><small>Total Penghasilan</small><b>' + rupiahPendek(m.totalHasil || 0) + '</b></div>' +
        '<div class="stat-box"><small>Top Speed · Irit</small><b>' + (RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'motor') : 100) + ' km/j · ' + (listrik ? m.jarakPenuh + ' km' : m.kml + ' km/L') + '</b></div>' +
        '<div class="stat-box"><small>Nilai Jual · Pajak</small><b>' + (m.kredit ? 'Kredit' : rupiahPendek(MOTOR.nilaiJual(S, m))) + ' · ' + (pjk ? 'Jatuh tempo!' : (m.pajakTempo - S.hari) + ' hr') + '</b></div></div>' +
        barRawat('Oli', oli, N.rawat.oliKm) + barRawat('Servis', sv, N.rawat.servisKm) + barRawat('Ban', sisaBanM, banKmM) +
        (m.kredit ? '<p class="catatan">💳 Cicilan ' + rupiah(m.kredit.angsuran) + '/bln (tgl ' + m.kredit.tempo + ', sisa ' + m.kredit.sisa + ' bln' + (m.kredit.tunggakan ? ', nunggak ' + rupiah(m.kredit.tunggakan) : '') + ').</p>' : '') +
        '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-aksi="bukaBensin:motor">' + (listrik ? '⚡ Baterai' : '⛽ BBM') + '</button><button type="button" class="chip-tombol" data-aksi="oli:1">Oli ' + rupiahPendek(N.rawat.oli) + '</button><button type="button" class="chip-tombol" data-aksi="servis:1">Servis ' + rupiahPendek(N.rawat.servis) + '</button><button type="button" class="chip-tombol" data-aksi="banMotor:1">Ban ' + rupiahPendek(MOTOR.hargaBan(m)) + '</button>' +
        (pjk ? '<button type="button" class="chip-tombol" data-aksi="pajakMotor:1">Pajak ' + rupiahPendek(pjk) + '</button>' : '') +
        (m.kredit ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarCicilanMotor:1">💳 Cicilan</button><button type="button" class="chip-tombol" data-aksi="lunasMotor:1">Lunasi</button>' : '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualMotor:1">Jual</button>') +
        (mDisewakan ? '' : '<button type="button" class="chip-tombol pilih" data-app="driver">🛵 Narik Ojol</button>') + '</div>';
      return html;
    }
    var c = S.mobil;
    if (!c) return html + '<p class="catatan">Belum punya mobil.</p><div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="dealerMobil">Buka Dealer Mobil</button><button type="button" class="chip-tombol" data-app="agenBekas">Buka Agen Bekas</button></div>';
    if (armadaC.length > 1) {
      html += catStrip('pilihMobil', armadaC.map(function (mb, idx) {
        var swC = MOBIL.disewakan && MOBIL.disewakan(S, idx);
        return [String(idx), (idx + 1) + '. ' + mb.nama + (swC ? ' 🔑' : idx === (S.mobilAktif || 0) ? ' ★' : '')];
      }), String(S.mobilAktif || 0));
    }
    var cDisewakan = MOBIL.disewakan && MOBIL.disewakan(S);
    var pj = MOBIL.tagihanPajak(S), svm = N.rawatMobil.servisKm - (c.km - c.kmServis), banKmC = N.rawatMobil.banKm || 90000, sisaBanC = banKmC - (c.km - (c.kmBan || 0)), cEv = c.bbm === 'listrik';
    var lamaC = Math.max(0, S.hari - (c.dibeli == null ? S.hari : c.dibeli));
    html += '<div class="saldo-besar"><small>' + esc(c.nama) + ' · ' + (cEv ? 'Listrik EV' : N.bbm.nama[c.bbm]) + (cDisewakan ? ' · 🔑 DISEWAKAN' : '') + '</small><b>' + (c.isi * c.tangki).toFixed(cEv ? 1 : 0) + ' / ' + c.tangki + (cEv ? ' kWh' : ' L') + '</b>' + persenBar(c.isi * 100) + '</div>' +
      (cDisewakan ? '<div class="isbat peringatan" style="margin:0 0 8px">🔑 Mobil ini sedang <b>disewakan</b> di Sewa Aset — tidak bisa dipakai GoCar/Travel sebelum sewa dihentikan.<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="sewaBarang:mobil:' + (S.mobilAktif || 0) + '">Hentikan Sewa Mobil</button></div></div>' : '') +
      '<div class="stat-grid-2">' +
      '<div class="stat-box"><small>Odometer · Usia</small><b>' + Math.round(c.km).toLocaleString('id-ID') + ' km · ' + lamaC + ' hr</b></div>' +
      '<div class="stat-box"><small>Total Penghasilan</small><b>' + rupiahPendek(c.totalHasil || 0) + '</b></div>' +
      '<div class="stat-box"><small>Top Speed · Kursi</small><b>' + (RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'mobil') : 170) + ' km/j · ' + (MOBIL.pikap(S) ? 'Pikap' : TRAVEL.kursi(S, c) + ' pnp') + '</b></div>' +
      '<div class="stat-box"><small>Nilai Jual · Pajak</small><b>' + (c.kredit ? 'Kredit' : rupiahPendek(MOTOR.nilaiJual(S, c))) + ' · ' + (pj ? 'Jatuh tempo!' : (c.pajakTempo - S.hari) + ' hr') + '</b></div></div>' +
      barRawat('Servis', svm, N.rawatMobil.servisKm) + barRawat('4 Ban', sisaBanC, banKmC) +
      (c.kredit ? '<p class="catatan">💳 Cicilan ' + rupiah(c.kredit.angsuran) + '/bln (tgl ' + c.kredit.tempo + ', sisa ' + c.kredit.sisa + ' bln' + (c.kredit.tunggakan ? ', nunggak ' + rupiah(c.kredit.tunggakan) : '') + ').</p>' : '') +
      '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-aksi="bukaBensin:mobil">' + (cEv ? '⚡ SPKLU' : '⛽ BBM') + '</button><button type="button" class="chip-tombol" data-aksi="servisMobil:1">Servis ' + rupiahPendek(N.rawatMobil.servis) + '</button><button type="button" class="chip-tombol" data-aksi="banMobil:1">Ban ' + rupiahPendek(MOBIL.hargaBan(c)) + '</button>' +
      (pj ? '<button type="button" class="chip-tombol" data-aksi="pajakMobil:1">Pajak ' + rupiahPendek(pj) + '</button>' : '') +
      (c.kredit ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarCicilanMobil:1">💳 Cicilan</button><button type="button" class="chip-tombol" data-aksi="lunasMobil:1">Lunasi</button>' : '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualMobil:1">Jual</button>') + '</div>' +
      '<details class="kartu-lipat"><summary>🔧 Upgrade & Modifikasi (' + esc(c.nama) + ')</summary><ul class="daftar belanja">' +
      ['mesin', 'tangki', 'efisiensi'].map(function (uj) {
        var uInfo = MOBIL.UPGRADE_INFO[uj], uLvl = (c.upg && c.upg[uj]) || 0, maksU = MOBIL.UPGRADE_MAKS || 5, biayaU = MOBIL.biayaUpgrade(c, uj);
        var statSkrg = uj === 'mesin' ? ((RUTE.vmaxKendaraan ? RUTE.vmaxKendaraan(S, 'mobil') : 170) + ' km/j') : uj === 'tangki' ? (c.tangki + (cEv ? ' kWh' : ' L')) : (c.kml + (cEv ? ' km/kWh' : ' km/L'));
        return '<li><span><b>' + esc(uInfo.nama) + ' (Lv ' + uLvl + '/' + maksU + ')</b><small>' + statSkrg + '</small>' + (uLvl < maksU ? '<small class="harga">' + rupiah(biayaU) + '</small>' : '<small class="harga">MAX ✓</small>') + '</span>' +
          '<span>' + (uLvl < maksU ? '<button type="button" class="chip-tombol pilih" data-aksi="upgradeMobil:' + uj + '">Lv ' + (uLvl + 1) + '</button>' : '<small><b>MAX</b></small>') + '</span></li>';
      }).join('') + '</ul></details>' +
      (cDisewakan ? '' : MOBIL.pikap(S) ?
        '<h3 class="subjudul">Jasa Angkutan Pikap</h3><div class="grid-2">' + (N.bisnisMobil.angkutan || []).map(function (ag) {
          return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + ag.km + ' km · ' + ag.jam + 'j</span></div><b>' + esc(ag.nama) + '</b><div class="ki-harga">' + rupiahPendek(ag.bayar) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="angkutan:' + ag.id + '">Ambil</button></div></div>';
        }).join('') + '</div>' :
        '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol pilih" data-aksi="onlineCar:gojek">🚗 GoCar</button><button type="button" class="chip-tombol pilih" data-aksi="onlineCar:grab">🚗 GrabCar</button><button type="button" class="chip-tombol" data-app="travel">🚐 Travel</button></div>');
    return html;
  }
  function layarDealerMotor() {
    var kls = app.kelasMotor || 'harian', thnM = KAL.tgl(S.hari).y;
    var listMotor = N.motor.filter(function (x) { return (x.kelas || 'harian') === kls && (x.tahun || 2023) <= thnM; });
    return kepalaApp('Dealer Motor Baru', 'OTR ' + thnM + ' · ' + listMotor.length + ' model') +
      segTab('kelasMotor', [['harian', 'Harian'], ['sport', 'Sport'], ['moge', 'Moge']], kls) + pesanApp() +
      '<div class="grid-2">' + listMotor.map(function (x) {
        var spek = x.bbm === 'listrik' ? ('EV ' + x.jarakPenuh + ' km') : (x.kml + ' km/L · ' + N.bbm.nama[x.bbm]);
        var dpMin = Math.round(x.harga * 0.1 / 100000) * 100000;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(spek) + '</span></div>' +
          '<b>' + esc(x.nama) + '</b><small>' + esc(x.kelebihan) + '</small>' +
          '<div class="ki-harga">' + rupiahPendek(x.harga) + '</div><small>DP mulai ' + rupiahPendek(dpMin) + '</small></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol" data-aksi="tunai:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiKk:' + x.id + '">KK</button><button type="button" class="chip-tombol pilih" data-aksi="kreditPilih:' + x.id + '">Kredit</button></div></div>';
      }).join('') + '</div>';
  }
  function layarDealerMobil() {
    var km2 = app.kelasMobil || 'keluarga', thnC = KAL.tgl(S.hari).y;
    var listMobil = N.mobil.filter(function (x) { return x.kelas === km2 && (x.tahun || 2023) <= thnC; });
    return kepalaApp('Dealer Mobil Baru', 'OTR ' + thnC + ' · ' + listMobil.length + ' model') +
      segTab('kelasMobil', [['pikap', 'Pikap'], ['keluarga', 'Keluarga'], ['mewah', 'Mewah'], ['sultan', 'Sultan']], km2) + pesanApp() +
      '<div class="grid-2">' + listMobil.map(function (x) {
        var pnpM = x.bentuk === 'pikap' ? 0 : Math.max(0, (x.kursi || (N.bisnisMobil && N.bisnisMobil.kapasitas[x.bentuk]) || 5) - 1);
        var tag = x.bbm === 'listrik' ? ('EV ' + x.tangki + ' kWh') : (N.bbm.nama[x.bbm] + ' · ' + x.tangki + 'L');
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(tag) + '</span>' + (pnpM ? '<span class="ki-tag milik">' + pnpM + ' pnp</span>' : '') + '</div>' +
          '<b>' + esc(x.nama) + '</b><small>' + esc(x.kelebihan) + '</small>' +
          '<div class="ki-harga">' + rupiahPendek(x.harga) + '</div></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol" data-aksi="tunaiMobil:' + x.id + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="tunaiMobilKk:' + x.id + '">KK</button><button type="button" class="chip-tombol pilih" data-aksi="kreditMobilPilih:' + x.id + '">Kredit</button></div></div>';
      }).join('') + '</div>';
  }
  function layarAgenBekas() {
    var tabB = app.bekasTab || 'motor';
    var listMtr = (S.pasarBekas && S.pasarBekas.unit) || [];
    var listMbl = (S.pasarMobilBekas && S.pasarMobilBekas.unit) || [];
    var html = kepalaApp('Agen Motor & Mobil Bekas', 'Stok berganti tiap minggu · Harga miring') +
      segTab('bekasTab', [['motor', '🏍️ Motor Bekas (' + listMtr.length + ')'], ['mobil', '🚗 Mobil Bekas (' + listMbl.length + ')']], tabB) + pesanApp();
    if (tabB === 'motor') {
      if (!listMtr.length) return html + '<p class="catatan">Semua motor bekas minggu ini sudah terjual. Stok baru masuk minggu depan.</p>';
      return html + '<div class="grid-2">' + listMtr.map(function (u, i) {
        var b = N.motorBekas.filter(function (x) { return x.id === u.id; })[0]; if (!b) return '';
        var kdCls = u.kondisi === 'baik' ? 'milik' : u.kondisi === 'kurang' ? 'promo' : '';
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + u.tahun + '</span><span class="ki-tag ' + kdCls + '">' + esc(u.kondisi) + '</span></div>' +
          '<b>' + esc(b.nama.replace(' (bekas)', '')) + '</b>' +
          '<small>' + u.km.toLocaleString('id-ID') + ' km · ' + b.kml + ' km/L</small>' +
          '<div class="ki-harga">' + rupiahPendek(u.harga) + '</div></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="bekas:' + i + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="bekasKk:' + i + '">KK</button></div></div>';
      }).join('') + '</div>';
    }
    if (!listMbl.length) return html + '<p class="catatan">Semua mobil bekas minggu ini sudah terjual. Stok baru masuk minggu depan.</p>';
    return html + '<div class="grid-2">' + listMbl.map(function (u, i) {
      var b = (N.mobilBekas || []).filter(function (x) { return x.id === u.id; })[0]; if (!b) return '';
      var pnp = b.bentuk === 'pikap' ? 'Pikap' : Math.max(1, (b.kursi || 5) - 1) + ' pnp';
      var kdCls = u.kondisi === 'baik' ? 'milik' : u.kondisi === 'kurang' ? 'promo' : '';
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + u.tahun + ' · ' + pnp + '</span><span class="ki-tag ' + kdCls + '">' + esc(u.kondisi) + '</span></div>' +
        '<b>' + esc(b.nama.replace(' (bekas)', '')) + '</b>' +
        '<small>' + u.km.toLocaleString('id-ID') + ' km · ' + N.bbm.nama[b.bbm] + '</small>' +
        '<div class="ki-harga">' + rupiahPendek(u.harga) + '</div></div>' +
        '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="bekasMobil:' + i + '">Rekening</button><button type="button" class="chip-tombol" data-aksi="bekasMobilKk:' + i + '">KK</button></div></div>';
    }).join('') + '</div>';
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
    return kepala('Kredit ' + x.nama, N.kreditMobil.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="dealerMobil" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3>' + segTab('kreditMobilDp', N.kreditMobil.dp.map(function (d) { return [d, Math.round(d * 100) + '%']; }), dp) +
      '<h3 class="subjudul">Tenor</h3>' + segTab('kreditMobilTenor', N.kreditMobil.tenor.map(function (t) { return [t, t + ' bln']; }), tenor) +
      '<ul class="daftar angka" style="margin-top:8px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + '/bln</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div class="bayar-baris" style="margin-top:10px"><button type="button" class="aksi" data-aksi="kreditMobil:bank">Ajukan Kredit Leasing (DP ' + rupiahPendek(k.dp) + ')</button></div>';
  }
  /* ---------- aplikasi Makan & minum (Grid 2 kolom utuh tanpa harga kepotong) ---------- */
  function layarMakan() {
    var d = S.diri, mTab = app.makanTab || 'makanan', caraM = app.makanCara || (d.posisi === 'kos' ? 'gofood' : 'warung');
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var list = mTab === 'minuman' ? N.minuman : N.makanan;
    return kepalaApp('Makan & Minum', 'Kenyang ' + Math.round(d.kenyang) + '% · Minum ' + Math.round(d.minum) + '% · Stamina ' + Math.round(d.stamina) + '%') +
      segTab('makanTab', [['makanan', '🍽️ Makanan (' + N.makanan.length + ')'], ['minuman', '🥤 Minuman (' + N.minuman.length + ')']], mTab) +
      segTab('makanCara', [['warung', '🏪 Makan di Warung (Tunai)'], ['gofood', '🛵 Pesan GoFood (+Ongkir)']], caraM) + pesanApp() +
      '<div class="cat-strip">' +
      '<button type="button" class="' + (S.autoMakanMinum ? 'pilih' : '') + '" data-aksi="autoMakan:1">' + (S.autoMakanMinum ? '✓ Auto Makan' : 'Auto Makan') + '</button>' +
      (d.posisi === 'kos' && rtAktif ? '<button type="button" class="pilih" data-aksi="makanRumah:1">🏠 Makan Rumah (Gratis)</button>' : '') +
      '<button type="button" data-aksi="minumAir:1">' + (DIRI.punya(S, 'dispenser') && d.posisi === 'kos' ? '💧 Dispenser' : '💧 Air Mineral') + '</button>' +
      '<button type="button" data-app="pasarpokok">🛒 Dapur Rumah</button></div>' +
      '<div class="grid-2">' + list.map(function (x) {
        var efek = [x.kenyang ? '🍽️+' + x.kenyang : '', x.minum ? '💧+' + x.minum : '', x.melek ? '⚡+' + x.melek : ''].filter(Boolean).join(' ');
        var hW = DIRI.hargaItem(S, x), hGf = DIRI.hargaGofood(S, x), hPilih = caraM === 'gofood' ? hGf : hW;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + efek + '</span></div>' +
          '<b>' + esc(x.nama) + '</b>' +
          '<div class="ki-harga">' + rupiah(hPilih) + '</div>' +
          '<small>' + (caraM === 'gofood' ? 'Warung ' + rupiahPendek(hW) + ' + ongkir · QRIS/Bank' : 'Makan langsung · Dompet ' + rupiahPendek(UANG.dompet(S))) + '</small></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="beliMakan:' + x.id + '-' + caraM + '">' + (caraM === 'gofood' ? '🛵 Pesan GoFood' : '🏪 Beli di Warung') + '</button></div></div>';
      }).join('') + '</div>';
  }
  /* ---------- aplikasi Driver ojol (langsung aktif hari pertama tanpa tunggu!) ---------- */
  function layarDriver() {
    var o = S.ojek, z = N.ojol.zona[kotaIni().zona || 1];
    var nmOnDrv = o.mode === 'mobil' ? (o.platform === 'grab' ? 'GrabCar' : 'GoCar') : (o.platform ? OJEK.platform(o.platform).nama : 'Ojol');
    var html = kepalaApp('Driver Ojol & Car', o.online ? 'ONLINE · ' + nmOnDrv : 'Offline') + pesanApp() +
      '<div class="saldo-besar"><small>Saldo Driver (Siap Tarik)</small><b>' + rupiah(o.dompet) + '</b></div>' +
      '<div class="stat-grid-2"><div class="stat-box"><small>Hari Ini</small><b>' + o.hariIni.trip + ' order · ' + rupiahPendek(o.hariIni.bersih) + '</b></div>' +
      '<div class="stat-box"><small>Total Narik</small><b>' + o.total.trip + ' order · ' + rupiahPendek(o.total.bersih) + '</b></div></div>';
    if (!S.motor && !S.mobil) {
      html += '<div class="kartu-pesanan" style="padding:10px 12px;border-radius:12px;margin:6px 0;background:rgba(242,165,22,.16)">' +
        '<b>🚦 Mulai Kerja Hari Pertama!</b>' +
        '<small>Beli motor dulu (kredit DP mulai Rp1,5jt di <b>Dealer Motor</b> atau motor bekas di <b>Agen Bekas</b>), lalu daftar Gojek/Grab di bawah — <b>langsung aktif hari ini juga</b> tanpa tunggu!</small>' +
        '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-app="dealerMotor">🏍️ Dealer Motor</button><button type="button" class="chip-tombol pilih" data-app="agenBekas">★ Agen Bekas</button></div></div>';
    }
    if (S.motor && MOTOR.disewakan && MOTOR.disewakan(S)) {
      html += '<div class="isbat peringatan" style="margin:6px 0">🔑 Motor aktifmu (<b>' + esc(S.motor.nama) + '</b>) sedang <b>disewakan</b>, sehingga tidak bisa dipakai ngojol.<div class="chip-baris" style="margin-top:5px"><button type="button" class="chip-tombol pilih" data-aksi="sewaBarang:motor:' + (S.motorAktif || 0) + '">Hentikan Sewa Motor</button><button type="button" class="chip-tombol" data-app="motor">Buka Garasi</button></div></div>';
    }
    if (S.mobil && MOBIL.disewakan && MOBIL.disewakan(S)) {
      html += '<div class="isbat peringatan" style="margin:6px 0">🔑 Mobil aktifmu (<b>' + esc(S.mobil.nama) + '</b>) sedang <b>disewakan</b>, sehingga tidak bisa dipakai GoCar/GrabCar.<div class="chip-baris" style="margin-top:5px"><button type="button" class="chip-tombol pilih" data-aksi="sewaBarang:mobil:' + (S.mobilAktif || 0) + '">Hentikan Sewa Mobil</button><button type="button" class="chip-tombol" data-app="motor">Buka Garasi</button></div></div>';
    }
    html += '<div class="cat-strip">' +
      '<button type="button" class="pilih" data-aksi="tarikDriver:ewallet">Tarik → QRIS</button>' +
      '<button type="button" data-aksi="tarikDriver:dompet">Tarik → Dompet</button>' +
      '<button type="button" data-aksi="tarikDriver:bank">Tarik → ' + esc(UANG.bankIni(S).nama) + '</button>' +
      '<button type="button" class="' + (S.promoAktif ? 'pilih' : '') + '" data-aksi="promo:1">' + (S.promoAktif ? '✓ Promo' : 'Promo') + '</button></div>';
    if (S.mobil && !MOBIL.pikap(S)) {
      html += '<h3 class="subjudul">🚗 Mobil Online (' + esc(S.mobil.nama) + ')</h3><div class="grid-2">' +
        '<div class="kartu-item"><div><span class="ki-tag" style="background:#00aa13;color:#fff">GoCar</span><b>Gojek Car</b><small>Dalam kota & jarak jauh</small></div><div class="ki-aksi">' +
        (o.online && o.mode === 'mobil' && o.platform === 'gojek' ? '<span class="ki-tag milik">ONLINE</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:gojek">Mulai GoCar</button>') + '</div></div>' +
        '<div class="kartu-item"><div><span class="ki-tag" style="background:#00b14f;color:#fff">GrabCar</span><b>Grab Car</b><small>Dalam kota & jarak jauh</small></div><div class="ki-aksi">' +
        (o.online && o.mode === 'mobil' && o.platform === 'grab' ? '<span class="ki-tag milik">ONLINE</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineCar:grab">Mulai GrabCar</button>') + '</div></div></div>';
    }
    html += '<h3 class="subjudul">🛵 Mitra Driver Motor (Langsung Aktif)</h3><div class="grid-2">' + N.ojol.platform.map(function (pl) {
      var d = o.daftar[pl.id];
      var akt = d && d.status === 'aktif';
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag" style="background:' + pl.warna + ';color:#fff">' + esc(pl.nama) + '</span>' + (akt ? '<span class="ki-tag milik">Aktif</span>' : '') + '</div>' +
        '<b>' + esc(pl.app) + '</b><small>' + esc(pl.layanan.penumpang + ', ' + pl.layanan.makanan) + '</small></div>' +
        '<div class="ki-aksi">' + (!d ? '<button type="button" class="chip-tombol pilih" data-aksi="daftarDriver:' + pl.id + '">Daftar Instan</button>' :
          (o.online && o.mode !== 'mobil' && o.platform === pl.id ? '<span class="ki-tag milik">ONLINE</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="onlineDriver:' + pl.id + '">Narik</button>') +
          '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="putusDriver:' + pl.id + '">Putus</button>') + '</div></div>';
    }).join('') + '</div>' +
      (o.online ? '<div style="margin-top:10px"><button type="button" class="aksi" data-aksi="offlineDriver:1">Berhenti Narik</button></div>' : '') +
      '<p class="catatan">Tarif Zona ' + (kotaIni().zona || 1) + ': ' + rupiah(z.minimal) + ' (' + z.kmMinimal + ' km) + ' + rupiah(z.perKm) + '/km · Potongan ' + Math.round(N.ojol.potongan * 100) + '%.</p>';
    return html;
  }
  /* ---------- aplikasi Properti (Sewa Kos/Kontrakan/Apartemen, Rumah Milik, KPR & Kavling) ---------- */
  function layarProperti() {
    var P = N.properti, daftarR = PROPERTI.daftarRumah ? PROPERTI.daftarRumah(S) : (S.properti.rumah ? [S.properti.rumah] : []);
    var rUtama = S.properti.rumah, gaji = PROPERTI.penghasilan(S), kotaPilih = app.kotaProp || S.kota;
    var hSkrg = DIRI.hunianInfo ? DIRI.hunianInfo(S.rumah && S.rumah.hunianId) : null;
    var pTab = app.propTab || (daftarR.length ? 'milik' : 'sewa');
    var labelTempat = S.rumah.jenis === 'rumah' && rUtama ? (rUtama.nama + ' · ' + (rUtama.lokasiTeks || PROPERTI.namaKota(rUtama.kota || S.kota))) : ((hSkrg ? hSkrg.nama : 'Kos') + ' · ' + kotaIni().nama);
    var html = kepalaApp('Properti & Hunian', daftarR.length + ' rumah milik · ' + (S.rumah.jenis === 'rumah' ? 'Rumah sendiri' : (hSkrg ? hSkrg.nama : 'Sewa') + ' ' + rupiahPendek(S.rumah.sewa) + '/bln')) +
      '<div class="kartu-hero"><small>' + (S.rumah.jenis === 'rumah' ? 'Tempat Tinggal Milik Sendiri' : 'Hunian Sewa Aktif (' + rupiah(S.rumah.sewa) + '/bln)') + ' · Penghasilan ' + rupiahPendek(gaji) + '/bln</small>' +
      '<b>' + esc(labelTempat) + '</b></div>' +
      segTab('propTab', [['sewa', '🏢 Sewa'], ['milik', '🏠 Rumah (' + daftarR.length + ')'], ['beli', '🔑 KPR'], ['tanah', '🗺️ Tanah (' + ((S.properti.tanah && S.properti.tanah.length) || 0) + ')']], pTab) + pesanApp();
    if (pTab === 'sewa') {
      var hKat = app.hunianKat || (hSkrg ? hSkrg.kat : 'kos');
      var listHS = (N.hunianSewa || []).filter(function (x) { return x.kat === hKat; });
      var idAktifH = S.rumah.jenis !== 'rumah' ? ((S.rumah && S.rumah.hunianId) || 'kos_ac') : '';
      html += segTab('hunianKat', [['kos', '🛏️ Kos'], ['kontrakan', '🏘️ Kontrakan'], ['apartemen', '🏢 Apartemen']], hKat) +
        '<div style="display:grid;gap:8px">' + listHS.map(function (h) {
          var hrgH = DIRI.hargaSewaHunian ? DIRI.hargaSewaHunian(S, h.id, S.kota) : S.rumah.sewa;
          var sedang = idAktifH === h.id;
          var fas = [h.ac ? '❄️ AC' : '🌬️ Non-AC', h.kasur === 'springbed' ? '🛏️ Springbed' : '🛌 Kasur Lantai', h.muatRumah ? '🛋️ Muat Perabot Rumah' : '', h.bonusTidur > 0 ? '⚡ Tidur +' + h.bonusTidur : ''].filter(Boolean).join(' · ');
          return '<div class="kartu-item"><div style="display:grid;grid-template-columns:78px 1fr;gap:10px;align-items:center">' + svgPreviewHunian(h.id) +
            '<div><div class="ki-top"><span class="ki-tag">' + h.jarak + ' km</span>' + (sedang ? '<span class="ki-tag milik">Ditempati</span>' : '') + '</div>' +
            '<b>' + esc(h.nama) + '</b><div class="ki-harga">' + rupiah(hrgH) + '/bln</div><small>' + esc(fas) + '</small><small>' + esc(h.suasana) + '</small></div></div>' +
            (sedang ? '' : '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="pindahHunianSewa:' + h.id + '">🚚 Pindah ke Sini (DP 1 bln ' + rupiahPendek(hrgH) + ')</button></div>') + '</div>';
        }).join('') + '</div>';
      return html;
    }
    if (pTab === 'milik') {
      if (!daftarR.length) return html + '<p class="catatan">Belum punya rumah. Buka tab <b>Beli / KPR</b> untuk memilih rumah di kota mana saja seluruh Indonesia.</p>';
      var pilihIdx = Math.min(app.rumahPropIdx || 0, daftarR.length - 1);
      daftarR.forEach(function (r, idx) {
        var k = r.kpr, kotaR = r.kota || S.kota;
        var stTeks = r.status === 'akad' ? 'Akad · ' + namaTanggal(r.kunciPada)
          : r.dihuni ? 'Ditempati'
          : r.sewa ? (r.sewa.mode === 'tahun' ? 'Kontrak ' + rupiahPendek(r.sewa.tarif) + '/thn' : 'Sewa ' + rupiahPendek(r.sewa.tarif) + '/bln')
          : 'Kosong';
        var tfBln = PROPERTI.tarifSewa(r, 'bulan'), tfThn = PROPERTI.tarifSewa(r, 'tahun');
        html += '<div class="kartu-item" style="margin-bottom:8px;' + (idx === pilihIdx ? 'border-color:var(--kontainer)' : '') + '">' +
          '<div class="ki-top"><span class="ki-tag ' + (r.dihuni ? 'milik' : '') + '">' + esc(stTeks) + '</span><span class="ki-tag">' + (k ? 'KPR ' + k.sisa + ' bln' : 'SHM Lunas') + '</span></div>' +
          '<b>#' + (idx + 1) + ' ' + esc(r.nama) + ' · ' + esc(r.lokasiTeks || PROPERTI.namaKota(kotaR)) + '</b>' +
          '<div class="stat-grid-2"><div class="stat-box"><small>Nilai Kini</small><b>' + rupiahPendek(PROPERTI.nilaiRumah(S, r)) + '</b></div>' +
          '<div class="stat-box"><small>' + (r.tagihanAir > 0 ? 'PDAM Belum Lunas' : k ? 'Cicilan / bln' : 'Air PDAM') + '</small><b>' + (r.tagihanAir > 0 ? rupiahPendek(r.tagihanAir) : k ? rupiahPendek(k.angsuran) : 'Lunas') + '</b></div></div>' +
          '<div class="chip-baris">' +
          (k ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarKpr:' + idx + '">💳 ' + (k.tunggakan > 0 ? 'Tunggakan' : 'Bayar KPR') + '</button>' : '') +
          (r.tagihanAir > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="bayarAir:' + idx + '">💧 PDAM</button>' : '') +
          (r.status === 'siap' && !r.dihuni && !r.sewa ? '<button type="button" class="chip-tombol pilih" data-aksi="pindahRumah:' + idx + '">Pindah</button><button type="button" class="chip-tombol" data-aksi="sewaRumah:' + idx + '|bulan">Sewa ' + rupiahPendek(tfBln) + '</button><button type="button" class="chip-tombol" data-aksi="sewaRumah:' + idx + '|tahun">' + rupiahPendek(tfThn) + '/th</button>' : '') +
          (r.sewa ? '<button type="button" class="chip-tombol" data-aksi="hentiSewaRumah:' + idx + '">Stop Sewa</button>' : '') +
          '<button type="button" class="chip-tombol' + (idx === pilihIdx ? ' pilih' : '') + '" data-aksi="pilihRumahProp:' + idx + '">🛋️ Perabot</button>' +
          (r.status === 'siap' ? '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualRumah:' + idx + '">' + (app.yakinJualRumah === idx ? 'Yakin?' : 'Jual') + '</button>' : '') +
          '</div></div>';
      });
      var rKelola = daftarR[pilihIdx];
      var ruangList = (rKelola && rKelola.ruangan) || [], ruangIdx = Math.min(app.ruangProp || 0, Math.max(0, ruangList.length - 1));
      if (ruangList.length) {
        html += '<details class="kartu-lipat"><summary>🛋️ Ruangan & Perabot — #' + (pilihIdx + 1) + ' ' + esc(rKelola.nama) + '</summary>' +
          catStrip('pilihRuang', ruangList.map(function (rg, rIdx) { return [String(rIdx), rg.nama + (rg.isi && rg.isi.length ? ' (' + rg.isi.length + ')' : '')]; }), String(ruangIdx)) +
          '<div class="grid-2">' + (PROPERTI.PERABOT_RUANG || []).map(function (it) {
            return '<div class="kartu-item"><div><span class="ki-tag">' + esc(it.kat) + '</span><b>' + esc(it.nama) + '</b><div class="ki-harga">' + rupiahPendek(it.harga) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="instalRuang:' + pilihIdx + '|' + ruangIdx + '|' + it.id + '">Instal</button></div></div>';
          }).join('') + '</div></details>';
      }
      return html;
    }
    if (pTab === 'tanah') {
      html += '<h3 class="subjudul">Beli Kavling SHM (+' + Math.round(P.kenaikanTanah * 100) + '%/thn)</h3><div class="grid-2">' + P.kavling.map(function (l) {
        return '<div class="kartu-item"><div><span class="ki-tag">SHM</span><b>Kavling ' + l + ' m²</b><small>Pinggir kota (+BPHTB)</small><div class="ki-harga">' + rupiahPendek(PROPERTI.hargaTanah(S, l)) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="beliTanah:' + l + '">Beli</button></div></div>';
      }).join('') + '</div>';
      if (S.properti.tanah.length) {
        html += '<h3 class="subjudul">Kavling Milikmu</h3><div class="grid-2">' + S.properti.tanah.map(function (t, i) {
          return '<div class="kartu-item"><div><span class="ki-tag milik">Milikmu</span><b>Tanah ' + t.luas + ' m²</b><small>Beli ' + rupiahPendek(t.hargaBeli) + '</small><div class="ki-harga">' + rupiahPendek(PROPERTI.nilaiTanah(S, t)) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualTanah:' + i + '">Jual</button></div></div>';
        }).join('') + '</div>';
      }
      return html;
    }
    var tipe = app.tipeRumah || 'subsidi', tunai = !!app.rumahTunai && tipe !== 'subsidi', dp = app.dpRumah || (tipe === 'subsidi' ? P.subsidi.dp : P.komersial.dp[0]), tenor = app.tenorRumah || 20;
    var wilP = app.wilProp || 'kota';
    var x = PROPERTI.hitung(S, tipe, dp, tenor, tunai, kotaPilih, wilP), T = P.tipe[tipe];
    var semuaKota = PROPERTI.daftarKota ? PROPERTI.daftarKota() : [];
    html += '<div class="form-grid-2"><label class="form-lbl">Pilih Kota (' + semuaKota.length + ')<select id="in-prop-kota" class="input-teks">' +
      semuaKota.map(function (kt) { return '<option value="' + kt.id + '"' + (kt.id === kotaPilih ? ' selected' : '') + '>' + esc(kt.nama) + '</option>'; }).join('') + '</select></label>' +
      '<label class="form-lbl">Kawasan / Desa (opsional)<input id="in-wil-nama" class="input-teks" type="text" maxlength="32" placeholder="Mis. Kec. Baru" value="' + esc(app.wilNama || '') + '"></label></div>' +
      segTab('wilProp', [['kota', 'Pusat Kota'], ['kecamatan', 'Kecamatan −20%'], ['desa', 'Desa −40%']], wilP) +
      segTab('tipeRumah', [['subsidi', 'Subsidi 36'], ['komersial', 'Tipe 45'], ['mewah', 'Mewah 200']], tipe) +
      (tipe === 'subsidi' ? '' : segTab('rumahTunai', [['0', 'KPR'], ['1', 'Tunai']], tunai ? '1' : '0')) +
      (tunai ? '' : (tipe === 'subsidi' ? '' : segTab('dpRumah', P.komersial.dp.map(function (d) { return [d, 'DP ' + Math.round(d * 100) + '%']; }), dp)) +
        segTab('tenorRumah', P[tipe === 'subsidi' ? 'subsidi' : 'komersial'].tenor.map(function (t) { return [t, t + ' thn']; }), tenor)) +
      '<div class="stat-grid-2"><div class="stat-box"><small>' + esc(T.nama) + ' (' + T.luas + ')</small><b>' + rupiah(x.harga) + '</b></div>' +
      '<div class="stat-box"><small>' + (tunai ? 'Total + BPHTB/AJB' : 'Bayar di Awal (DP+Akad)') + '</small><b>' + rupiah(x.bayarAwal) + '</b></div>' +
      (!tunai ? '<div class="stat-box" style="grid-column:1/-1"><small>Estimasi Angsuran KPR</small><b>' + rupiah(x.angsuran) + ' / bulan</b></div>' : '') + '</div>' +
      '<ul class="daftar syarat">' + PROPERTI.syarat(S, tipe, x).map(function (y) { return '<li class="' + (y.ok ? 'ok' : 'belum') + '"><span>' + (y.ok ? '✓ ' : '✗ ') + esc(y.teks) + '</span></li>'; }).join('') + '</ul>' +
      '<div style="margin-top:10px"><button type="button" class="aksi" data-aksi="beliRumah:1">' + (tunai ? 'Beli Tunai ' + rupiahPendek(x.bayarAwal) : 'Ajukan KPR · DP ' + rupiahPendek(x.bayarAwal)) + '</button></div>';
    return html;
  }
  function layarKredit() {
    var x = N.motor.filter(function (m) { return m.id === app.kreditMotor; })[0], dp = app.kreditDp || 0.1, tenor = app.kreditTenor || 35, k = MOTOR.hitungKredit(x.harga, dp, tenor);
    return kepala('Kredit ' + x.nama, N.kreditMotor.leasing + ' · OTR ' + rupiah(x.harga), '<button type="button" class="panah" data-app="dealerMotor" aria-label="Kembali">‹</button>') + pesanApp() +
      '<h3 class="subjudul">Uang muka</h3>' + segTab('kreditDp', N.kreditMotor.dp.map(function (d) { return [d, Math.round(d * 100) + '%']; }), dp) +
      '<h3 class="subjudul">Tenor</h3>' + segTab('kreditTenor', N.kreditMotor.tenor.map(function (t) { return [t, t + ' bln']; }), tenor) +
      '<ul class="daftar angka" style="margin-top:8px">' + baris('Uang muka', rupiah(k.dp)) + baris('<b>Angsuran</b>', '<b>' + rupiah(k.angsuran) + '/bln</b>', 'total') + baris('Total dibayar', rupiah(k.total)) + '</ul>' +
      '<div class="bayar-baris" style="margin-top:10px"><button type="button" class="aksi" data-aksi="kredit:bank">Ajukan Kredit Leasing (DP ' + rupiahPendek(k.dp) + ')</button></div>';
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
    var kwh = meter === 'kos' ? S.rumah.kwh : u.kwh, padam = meter === 'kos' ? S.rumah.padam : u.padam;
    var namaMeter = meter === 'kos' ? DIRI.tempat(S) : 'kedai';
    var html = kepalaApp('PLN Mobile', 'Token listrik prabayar · ' + rupiah(N.pln.tarif) + '/kWh') + pesanApp();
    if (!u.berhentiSewa && t.listrik === 'token') {
      html += segTab('meter', [['kos', '🏠 Meteran ' + DIRI.tempat(S)], ['kedai', '☕ Meteran Kedai']], meter);
    }
    html += '<div class="kartu-hero" style="background:linear-gradient(135deg,#00608e,#00a2e9)"><small>Sisa Token Listrik ' + esc(namaMeter) + (padam ? ' · ⚠️ PADAM' : ' · Menyala Normal') + '</small><b>' + kwh.toFixed(1).replace('.', ',') + ' kWh</b></div>' +
      (padam ? '<p class="racik-pesan salah">Listrik ' + esc(namaMeter) + ' padam karena token habis!</p>' : '') +
      '<div class="grid-2">' + N.pln.nominal.map(function (n) {
        var tk = USAHA.token(S, n);
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">+' + tk.kwh.toFixed(1).replace('.', ',') + ' kWh</span></div><b>Token ' + labelNominal(n) + '</b><div class="ki-harga">' + rupiah(tk.bayar) + '</div><small>PPJ ' + (DIRI.kota(S).ppj * 100).toFixed(1).replace('.', ',') + '% + admin ' + rupiahPendek(N.pln.admin) + '</small></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="token:' + n + '">⚡ Beli Token</button></div></div>';
      }).join('') + '</div>';
    return html;
  }
  function bayarPribadi(jml, ket) {
    if (UANG.bayarDompet && UANG.bayarDompet(S, jml)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true; }
    if (S.bank.saldo >= jml) { S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -jml }); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + jml; return true; }
    return false;
  }
  function layarTeman() {
    var daftar = TEMAN.siap(S), g0 = app.tmGender || 'cewek', p0 = app.tmPeran || 'teman', flt = app.tmFilter || 'semua';
    var tTab = app.temanTab || 'daftar';
    var kdm = (S.kesehatan && S.kesehatan.kondom) || 0, gPem = (S.profil && S.profil.gender) || 'cowok';
    var jmlCwk = daftar.filter(function (x) { return x.gender === 'cewek'; }).length;
    var jmlCwk2 = daftar.filter(function (x) { return x.gender === 'cowok'; }).length;
    var jmlPac = daftar.filter(function (x) { return !!x.pacarId || x.peran === 'pacar'; }).length;

    /* Tampilan detail karakter teman saat kartu grid di-tap */
    if (app.temanDetailId) {
      var x = daftar.filter(function (it) { return it.id === app.temanDetailId; })[0];
      if (!x) { app.temanDetailId = null; }
      else {
        var usiaD = KAL.usia(S.hari, x.tglLahir), lawanJenis = x.gender !== gPem;
        var hbPenuhD = (x.hb || 0) >= 100;
        var bisaHb = lawanJenis && usiaD >= 18 && (x.hubungan > TEMAN.MIN_HB || hbPenuhD);
        var sedangBertamu = !!(S.tamuRumah && S.tamuRumah.id === x.id && S.tamuRumah.hari === S.hari);
        var prTm = Math.round(x.perasaan == null ? (x.hubungan || 45) : x.perasaan);
        var hbTm = Math.round(x.hb == null ? 30 : x.hb);
        var statusPacar = x.peran === 'pacar' ? '❤️ Pacarmu' : x.pacarId && x.pacarNama ? ('💑 Pacaran dgn ' + x.pacarNama) : 'Lajang';
        var thnLahir = String(x.tglLahir || '1998-01-01').slice(0, 4);
        return kepala(x.nama, TEMAN.PERAN[x.peran] + ' · ' + (x.gender === 'cowok' ? 'Cowok' : 'Cewek') + ' · ' + usiaD + ' thn (' + thnLahir + ')', '<button type="button" class="panah" data-aksi="tutupTeman:1" aria-label="Kembali ke daftar teman">‹</button>') + pesanApp() +
          '<div class="kartu-item" style="margin-bottom:8px"><div style="display:flex;align-items:center;gap:12px">' +
          fotoWajah(x.gender === 'cowok' ? 'char-pemain' : 'char-istri', 60, 'rgba(31,138,128,.45)', x.nama, x.gender, usiaD, x.peran, x.tampilan) +
          '<div style="min-width:0;flex:1"><b>' + esc(x.nama) + (sedangBertamu ? ' · 🏠 Di Rumah' : '') + '</b>' +
          '<small>' + (x.kerja ? esc(x.kerja) + ' · ' : '') + '<b>' + esc(statusPacar) + '</b></small>' +
          '<small>Hubungan: <b>' + Math.round(x.hubungan) + '%</b>' + (x.foreplayHari === S.hari ? ' · 🔥 Foreplay siap' : '') + (hbPenuhD ? ' · 🔥 Bar HB 100%!' : '') + '</small>' +
          (x.hadiah && x.hadiah.length ? '<small>🎁 Hadiah: ' + esc(x.hadiah.join(', ')) + '</small>' : '') + '</div></div>' +
          barPerasaanHtml(prTm) + barHbHtml(hbTm) + '</div>' +
          '<h3 class="subjudul">Interaksi & Undangan</h3>' +
          '<div class="chip-baris">' +
          (sedangBertamu ? '<button type="button" class="chip-tombol" data-aksi="tmPulangkan:1">👋 Antar Pulang</button>' : '<button type="button" class="chip-tombol pilih" data-aksi="tmUndang:' + x.id + '">🏠 Undang ke Rumah</button>') +
          '<button type="button" class="chip-tombol pilih" data-aksi="tmInteraksi:' + x.id + '|hubungi">💬 Hubungi</button><button type="button" class="chip-tombol" data-aksi="tmInteraksi:' + x.id + '|traktir">🍽️ Traktir Rp50rb</button><button type="button" class="chip-tombol pilih" data-aksi="bukaHadiah:teman|' + x.id + '">🎁 Hadiah</button><button type="button" class="chip-tombol bahaya-kecil" data-aksi="tmInteraksi:' + x.id + '|ribut">⚡ Ribut</button></div>' +
          (lawanJenis && usiaD >= 18 ? '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="momenMesra:ciuman|teman|' + x.id + '">💋 Ciuman</button><button type="button" class="chip-tombol pilih" data-aksi="momenMesra:foreplay|teman|' + x.id + '">🔥 Foreplay</button>' +
            (bisaHb ? (kdm > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tmHb:' + x.id + '|1">❤️ HB Kondom (' + kdm + ')</button>' : '') + '<button type="button" class="chip-tombol" data-aksi="tmHb:' + x.id + '|0">❤️ HB Tanpa Kondom</button>' : '<small style="align-self:center">HB terbuka di atas ' + TEMAN.MIN_HB + '% atau saat HB 100%</small>') + '</div>' : '') +
          '<h3 class="subjudul">Status Hubungan</h3>' +
          segTab('tmPeranUbah', ['teman', 'sahabat', 'pacar', 'mantan'].filter(function (r) { return r !== 'pacar' || lawanJenis; }).map(function (r) { return [x.id + '|' + r, TEMAN.PERAN[r]]; }), x.id + '|' + x.peran) +
          (lawanJenis && x.peran !== 'mantan' && bisaHb ? '<h3 class="subjudul">💍 Ajak Menikah</h3><div class="grid-2">' + DIRI.PAKET_NIKAH.map(function (pk) { return '<div class="kartu-item"><div><b>' + esc(pk.nama) + '</b><div class="ki-harga">' + rupiahPendek(pk.biaya) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="tmNikah:' + x.id + '|' + pk.id + '">Nikahi</button></div></div>'; }).join('') + '</div>' : '') +
          '<details class="kartu-lipat" style="margin-top:10px"><summary>✏️ Edit Profil (Nama, Tanggal Lahir & Hapus)</summary>' +
          '<div style="display:flex;gap:6px;align-items:center;margin-top:4px"><input id="in-tmn-' + x.id + '" class="input-teks" type="text" maxlength="24" style="margin:0;flex:1" value="' + esc(x.nama) + '"><button type="button" class="chip-tombol pilih" data-aksi="tmNama:' + x.id + '">Simpan Nama</button></div>' +
          '<div style="display:flex;gap:6px;align-items:center;margin-top:6px"><input id="in-tmt-' + x.id + '" class="input-teks" type="date" style="margin:0;flex:1" value="' + esc(x.tglLahir) + '"><button type="button" class="chip-tombol pilih" data-aksi="tmTtl:' + x.id + '">Simpan TTL</button></div>' +
          '<div class="chip-baris" style="margin-top:8px"><button type="button" class="chip-tombol bahaya-kecil" data-aksi="tmHapus:' + x.id + '">🗑️ Hapus dari Kontak</button></div></details>';
      }
    }

    var html = kepalaApp('Teman', daftar.length + ' kontak (' + jmlCwk + ' cewek · ' + jmlCwk2 + ' cowok)') +
      segTab('temanTab', [['daftar', '👥 Kontak (' + daftar.length + ')'], ['tambah', '➕ Tambah Kontak']], tTab) + pesanApp();
    if (tTab === 'tambah') {
      var K = N.karakterOpsi || {};
      app.tmTampilan = tampilanLengkap(app.tmTampilan, g0);
      var tpTm = app.tmTampilan, nmPrev = (app.tmNama || '').trim() || 'Teman Baru', ttlPrev = app.tmTtl || '2001-05-15';
      var listRTm = g0 === 'cowok' ? (K.rambutCowok || []) : (K.rambutCewek || []);
      return html + '<div class="kartu-item" style="gap:8px">' +
        '<div style="display:flex;align-items:center;gap:10px;padding-bottom:6px;border-bottom:1px solid var(--panel-garis)">' +
        fotoWajah(g0 === 'cowok' ? 'char-pemain' : 'char-istri', 56, 'rgba(31,138,128,.45)', nmPrev, g0, KAL.usia(S.hari, ttlPrev), p0, tpTm) +
        '<div style="min-width:0;flex:1"><b style="font-size:14px">' + esc(nmPrev) + '</b><small>' + (g0 === 'cowok' ? 'Cowok' : 'Cewek') + ' · ' + TEMAN.PERAN[p0] + ' · ' + KAL.usia(S.hari, ttlPrev) + ' thn</small></div></div>' +
        '<label class="form-lbl">Nama lengkap<input id="in-tm-nama" class="input-teks" type="text" maxlength="24" placeholder="Mis. Nadia / Rizky" value="' + esc(app.tmNama || '') + '"></label>' +
        segTab('tmGender', [['cewek', '👩 Cewek'], ['cowok', '👨 Cowok']], g0) +
        segTab('tmPeran', [['teman', 'Teman'], ['sahabat', 'Sahabat'], ['pacar', 'Pacar']], p0) +
        '<label class="form-lbl">Tanggal lahir<input id="in-tm-ttl" class="input-teks" type="date" value="' + esc(ttlPrev) + '"></label>' +
        '<div class="form-lbl">Warna kulit<div class="swatch-baris">' + (K.kulit || []).map(function (c) { return '<button type="button" class="swatch' + (tpTm.kulit === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-aksi="tmTp:kulit|' + c.id + '"></button>'; }).join('') + '</div></div>' +
        '<div class="form-lbl">Gaya rambut<div class="opsi-chip">' + listRTm.map(function (r) { return '<button type="button" class="chip-tombol' + (tpTm.rambut === r.id ? ' pilih' : '') + '" data-aksi="tmTp:rambut|' + r.id + '">' + esc(r.nama) + '</button>'; }).join('') + '</div></div>' +
        '<div class="form-lbl">Warna rambut<div class="swatch-baris">' + (K.warnaRambut || []).map(function (c) { return '<button type="button" class="swatch' + (tpTm.warnaRambut === c.id ? ' pilih' : '') + '" style="background:' + c.hex + '" title="' + esc(c.nama) + '" data-aksi="tmTp:warnaRambut|' + c.id + '"></button>'; }).join('') + '</div></div>' +
        '<div class="form-lbl">Jenis mata<div class="opsi-chip">' + (K.mata || []).map(function (m) { return '<button type="button" class="chip-tombol' + (tpTm.mata === m.id ? ' pilih' : '') + '" data-aksi="tmTp:mata|' + m.id + '">' + esc(m.nama) + '</button>'; }).join('') + '</div></div>' +
        '<div class="form-lbl">Jenis mulut<div class="opsi-chip">' + (K.mulut || []).map(function (m) { return '<button type="button" class="chip-tombol' + (tpTm.mulut === m.id ? ' pilih' : '') + '" data-aksi="tmTp:mulut|' + m.id + '">' + esc(m.nama) + '</button>'; }).join('') + '</div></div>' +
        '<button type="button" class="aksi kecil" style="margin-top:6px" data-aksi="temanTambah:1">Simpan Kontak</button></div>';
    }
    if (!daftar.length) return html + '<p class="catatan">Belum ada teman. Buka tab <b>➕ Tambah Kontak</b> untuk menambahkan teman baru.</p>';
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
    html += '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><input id="in-tm-cari" class="input-teks" type="text" maxlength="24" style="margin:0;flex:1;padding:8px 10px" placeholder="Cari nama, profesi, tahun..." value="' + esc(app.tmCari || '') + '"><button type="button" class="chip-tombol pilih" data-aksi="tmCari:1">🔍</button>' + (cariQ ? '<button type="button" class="chip-tombol" data-aksi="tmCari:reset">✕</button>' : '') + '</div>' +
      catStrip('tmFilter', [['semua', 'Semua (' + daftar.length + ')'], ['cewek', 'Cewek (' + jmlCwk + ')'], ['cowok', 'Cowok (' + jmlCwk2 + ')'], ['pacaran', '💑 Pacaran (' + jmlPac + ')'], ['jomblo', 'Lajang']], flt) +
      '<div class="grid-2">' + tampilDaftar.map(function (x) {
        var usia = KAL.usia(S.hari, x.tglLahir), hub = Math.round(x.hubungan || 0);
        var stTag = x.peran === 'pacar' ? '❤️ Pacarmu' : x.pacarId ? '💑 Pacaran' : TEMAN.PERAN[x.peran];
        var clsTag = x.peran === 'pacar' ? 'promo' : hub >= 70 ? 'milik' : '';
        return '<button type="button" class="kartu-item kartu-teman" data-aksi="bukaTeman:' + x.id + '">' +
          '<div class="kt-head">' + fotoWajah(x.gender === 'cowok' ? 'char-pemain' : 'char-istri', 42, 'rgba(31,138,128,.4)', x.nama, x.gender, usia, x.peran, x.tampilan) +
          '<div class="kt-info"><b>' + esc(x.nama) + '</b><small>' + usia + ' thn · ' + esc(x.kerja || (x.gender === 'cowok' ? 'Cowok' : 'Cewek')) + '</small></div></div>' +
          '<div><div class="ki-top" style="margin-top:2px"><span class="ki-tag ' + clsTag + '">' + esc(stTag) + '</span><span style="font-size:10.5px;font-weight:800;color:var(--kontainer-tua)">' + hub + '%</span></div>' +
          '<div class="meteran" style="height:5px;margin-top:4px"><i style="width:' + Math.max(0, Math.min(100, hub)) + '%"></i></div></div></button>';
      }).join('') + '</div><p class="catatan">💡 Ketuk kartu karakter untuk melihat profil lengkap, interaksi, hadiah, atau mengedit nama & TTL.</p>';
    return html;
  }
  function layarToko() {
    var menuT = app.tokoMenu || 'rumah', toko = app.tokoTab || 'tokopedia';
    var diRumah = DIRI.muatBarangRumah ? DIRI.muatBarangRumah(S) : S.rumah.jenis === 'rumah', kat = app.tokoKat || 'semua';
    var tk = KAL.tanggalKembar(S.hari), dsk = DIRI.diskonToko(S, toko);
    var html = kepalaApp('Toko Online', (tk ? 'Promo ' + tk + ' (−' + Math.round(dsk * 100) + '%)' : 'Tokopedia & Shopee · Gadget & Rumah')) +
      segTab('tokoMenu', [['rumah', '🏠 Rumah'], ['hp', '📱 HP'], ['tablap', '💻 Laptop'], ['pb', '🔋 Power Bank']], menuT) + pesanApp();
    if (menuT === 'rumah') {
      var barangToko = N.barangRumah.filter(function (b) { return b.id !== 'ps5' && b.id !== 'ps5disc' && b.id !== 'kaset' && (!b.toko || b.toko === toko); });
      var katAda = (N.kategoriToko || [{ id: 'semua', nama: 'Semua' }]).filter(function (c) { return c.id === 'semua' || barangToko.some(function (b) { return b.kat === c.id; }); });
      if (!katAda.some(function (c) { return c.id === kat; })) kat = 'semua';
      var daftarB = barangToko.filter(function (b) { return kat === 'semua' || b.kat === kat; });
      return html +
        segTab('tokoTab', [['tokopedia', '🟢 Tokopedia'], ['shopee', '🟠 Shopee']], toko) +
        catStrip('tokoKat', katAda.map(function (c) { return [c.id, c.nama]; }), kat) +
        '<div class="grid-2">' + daftarB.map(function (b) {
          var punya = !!S.rumah.barang[b.id], hAsli = b.harga, hPromo = DIRI.hargaToko(S, b, toko);
          var hJual = punya ? DIRI.nilaiJualBarang(S, b.id) : 0;
          return '<div class="kartu-item' + (b.rumah && !diRumah ? ' redup' : '') + '"><div>' +
            '<div class="ki-top"><span class="ki-tag">' + esc(b.merek) + '</span>' + (punya ? '<span class="ki-tag milik">Punya</span>' : dsk ? '<span class="ki-tag promo">−' + Math.round(dsk * 100) + '%</span>' : b.rumah && !diRumah ? '<span class="ki-tag">Rumah</span>' : '') + '</div>' +
            '<b>' + esc(b.nama) + '</b><small>' + esc(b.ket) + '</small>' +
            '<div class="ki-harga">' + (dsk ? '<s>' + rupiahPendek(hAsli) + '</s>' + rupiahPendek(hPromo) : rupiahPendek(hAsli)) + '</div></div>' +
            '<div class="ki-aksi">' + (!punya || b.banyak ? '<button type="button" class="chip-tombol pilih" data-aksi="barang:' + b.id + '-' + toko + '">Bank</button><button type="button" class="chip-tombol" data-aksi="barangDompet:' + b.id + '-' + toko + '">Tunai</button><button type="button" class="chip-tombol" data-aksi="barangKk:' + b.id + '-' + toko + '">KK</button>' : '') +
            (punya ? '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualBarang:' + b.id + '">Jual ' + rupiahPendek(hJual) + '</button>' : '') + '</div></div>';
        }).join('') + '</div>';
    }
    if (menuT === 'pb') {
      return html + '<div class="grid-2">' + (N.daftarPowerBank || []).map(function (pb) {
        var milikPb = S.hp && S.hp.pbMilik && S.hp.pbMilik[pb.id], aktPb = S.hp && S.hp.pbAktif === pb.id;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(pb.merek) + ' · ' + pb.wattOut + 'W</span>' + (aktPb ? '<span class="ki-tag milik">Dipakai</span>' : milikPb ? '<span class="ki-tag milik">Punya</span>' : '') + '</div>' +
          '<b>' + esc(pb.nama) + '</b><small>' + pb.mah.toLocaleString('id-ID') + ' mAh</small>' +
          '<div class="ki-harga">' + rupiahPendek(pb.harga) + '</div></div>' +
          '<div class="ki-aksi">' + (milikPb
            ? (aktPb ? '<button type="button" class="chip-tombol" data-app="gadget">Atur di HP</button>' : '<button type="button" class="chip-tombol pilih" data-aksi="pakaiPb:' + pb.id + '">Pakai</button>')
            : '<button type="button" class="chip-tombol pilih" data-aksi="beliPb:' + pb.id + '-bank">Bank</button><button type="button" class="chip-tombol" data-aksi="beliPb:' + pb.id + '-dompet">Tunai</button><button type="button" class="chip-tombol" data-aksi="beliPb:' + pb.id + '-kk">KK</button>') + '</div></div>';
      }).join('') + '</div>';
    }
    /* HP / Tablet & Laptop (jual-beli gadget di Toko Online, bukan di menu HP & Kuota) */
    var merekFilter = app.merekGadget || 'semua', thnKini = KAL.tgl(S.hari).y;
    if (menuT === 'hp') {
      html += catStrip('merekGadget', [['semua', 'Semua'], ['jumbo', '🔋 ≥6000mAh'], ['Apple', 'Apple'], ['Samsung', 'Samsung'], ['Xiaomi', 'Xiaomi'], ['OPPO', 'OPPO'], ['Vivo', 'Vivo'], ['Realme', 'Realme'], ['Infinix', 'Infinix'], ['ASUS', 'ASUS'], ['TECNO', 'TECNO'], ['Unihertz', 'Unihertz']], merekFilter);
    }
    var listG = N.daftarGadget.filter(function (g) {
      if (menuT === 'hp' && g.jenis !== 'hp') return false;
      if (menuT === 'tablap' && g.jenis === 'hp') return false;
      var rilisG = +(g.tahunRilis || g.tahun || 2023), sudahPunya = !!(S.gadget && S.gadget[g.id]);
      if (!sudahPunya && rilisG > thnKini) return false;
      if (menuT === 'hp' && merekFilter === 'jumbo') return (g.mah || 0) >= 6000;
      if (menuT === 'hp' && merekFilter !== 'semua' && g.merek !== merekFilter) return false;
      return true;
    });
    return html + '<div class="grid-2">' + listG.map(function (g) {
      var milik = S.gadget && S.gadget[g.id], dipakai = g.jenis === 'hp' && S.hp.id === g.id;
      var hJual = milik ? DIRI.nilaiJualGadget(S, g.id) : 0;
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(g.merek) + ' · ' + (g.tahun || 2023) + '</span>' + (dipakai ? '<span class="ki-tag milik">Dipakai</span>' : milik ? '<span class="ki-tag milik">Punya</span>' : '') + '</div>' +
        '<b>' + esc(g.nama) + '</b><small>' + g.ram + '/' + g.storage + 'GB · ' + g.mah + 'mAh · ' + g.watt + 'W</small>' +
        '<div class="ki-harga">' + rupiahPendek(g.harga) + '</div></div>' +
        '<div class="ki-aksi">' + (milik
          ? (g.jenis === 'hp' && !dipakai ? '<button type="button" class="chip-tombol pilih" data-aksi="pakaiHp:' + g.id + '">Pakai</button>' : '') + '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualGadget:' + g.id + '">Jual ' + rupiahPendek(hJual) + '</button>'
          : '<button type="button" class="chip-tombol pilih" data-aksi="beliGadget:' + g.id + '-bank">Bank</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-dompet">Tunai</button><button type="button" class="chip-tombol" data-aksi="beliGadget:' + g.id + '-kk">KK</button>') + '</div></div>';
    }).join('') + '</div>';
  }
  function layarGame() {
    var tab = app.gameTab || 'konsol', filterK = app.gameKonsolFilter || 'semua';
    var jmlKonsol = S.game && S.game.konsol ? Object.keys(S.game.konsol).length : 0;
    var jmlKaset = S.game && S.game.kaset ? Object.keys(S.game.kaset).length : 0;
    var html = kepalaApp('Toko Game', jmlKonsol + ' konsol · ' + jmlKaset + ' game original') +
      segTab('gameTab', [['konsol', '🎮 Konsol'], ['kaset', '💿 Game'], ['koleksi', '📦 Koleksi (' + (jmlKonsol + jmlKaset) + ')']], tab) + pesanApp();
    if (!DIRI.punya(S, 'tv')) html += '<p class="racik-pesan">Belum punya TV di ' + DIRI.tempat(S) + '. Beli TV di Toko Online untuk main PS.</p>';
    if (tab === 'konsol') {
      var ps5Baru = (N.konsolGame || []).filter(function (k) { return !k.bekas; });
      var pasar = (S.game && S.game.pasar && S.game.pasar.unit) || [];
      html += '<h3 class="subjudul">PS5 Resmi Sony Indonesia</h3><div class="grid-2">' + ps5Baru.map(function (k) {
        var milik = S.game && S.game.konsol && S.game.konsol[k.id], hJual = milik ? DIRI.nilaiJualKonsol(S, k.id) : 0;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">Baru Segel</span>' + (milik ? '<span class="ki-tag milik">Punya</span>' : '') + '</div>' +
          '<b>' + esc(k.nama) + '</b><small>Stamina +' + (k.pulih || 20) + '/jam</small><div class="ki-harga">' + rupiahPendek(k.harga) + '</div></div>' +
          '<div class="ki-aksi">' + (milik ? '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualKonsol:' + k.id + '">Jual ' + rupiahPendek(hJual) + '</button>' : '<button type="button" class="chip-tombol pilih" data-aksi="beliKonsol:' + k.id + '">Bank</button><button type="button" class="chip-tombol" data-aksi="beliKonsolKk:' + k.id + '">KK</button>') + '</div></div>';
      }).join('') + '</div>';
      html += '<h3 class="subjudul">PS1 – PS4 Bekas Original</h3>' + (pasar.length ? '<div class="grid-2">' + pasar.map(function (u, idx) {
        var sudah = DIRI.punyaKonsol(S, u.id);
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + u.tahun + '</span><span class="ki-tag">' + esc(u.kondisi) + '</span></div>' +
          '<b>' + esc(u.nama) + '</b><small>' + esc(u.ketKondisi) + '</small><div class="ki-harga">' + rupiahPendek(u.harga) + '</div></div>' +
          '<div class="ki-aksi">' + (sudah ? '<span class="ki-tag milik">Punya</span>' : '<button type="button" class="chip-tombol pilih" data-aksi="beliKonsol:pasar:' + idx + '">Bank</button><button type="button" class="chip-tombol" data-aksi="beliKonsolKk:pasar:' + idx + '">KK</button>') + '</div></div>';
      }).join('') + '</div>' : '<p class="catatan">Stok konsol bekas minggu ini habis.</p>');
      return html;
    }
    if (tab === 'kaset') {
      var thnGm = KAL.tgl(S.hari).y;
      html += catStrip('gameKonsolFilter', [['semua', 'Semua'], ['ps1', 'PS1'], ['ps2', 'PS2'], ['ps3', 'PS3'], ['ps4', 'PS4'], ['ps5', 'PS5']], filterK);
      var daftarG = (N.gameKonsol || []).filter(function (g) {
        if (filterK !== 'semua' && g.konsol !== filterK) return false;
        var milikG = !!(S.game && S.game.kaset && S.game.kaset[g.id]);
        return milikG || (g.tahun || 2023) <= thnGm;
      });
      return html + '<div class="grid-2">' + daftarG.map(function (g) {
        var milik = S.game && S.game.kaset && S.game.kaset[g.id], bisa = DIRI.bisaMainGame(S, g), hJual = milik ? DIRI.nilaiJualGame(S, g.id) : 0;
        return '<div class="kartu-item' + (!bisa && !milik ? ' redup' : '') + '"><div><div class="ki-top"><span class="ki-tag">' + esc(g.konsol.toUpperCase()) + '</span><span class="ki-tag">+' + g.stamina + '⚡</span></div>' +
          '<b>' + esc(g.nama) + '</b><small>' + esc(g.format) + '</small><div class="ki-harga">' + rupiahPendek(g.harga) + '</div></div>' +
          '<div class="ki-aksi">' + (milik ? '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualGame:' + g.id + '">Jual ' + rupiahPendek(hJual) + '</button>' : '<button type="button" class="chip-tombol pilih" data-aksi="beliGame:' + g.id + '">Bank</button><button type="button" class="chip-tombol" data-aksi="beliGameKk:' + g.id + '">KK</button>') + '</div></div>';
      }).join('') + '</div>';
    }
    var kIds = Object.keys((S.game && S.game.konsol) || {}), gIds = Object.keys((S.game && S.game.kaset) || {});
    html += '<h3 class="subjudul">Konsol (' + kIds.length + ')</h3>' + (kIds.length ? '<div class="grid-2">' + kIds.map(function (id) {
      var k = S.game.konsol[id], hj = DIRI.nilaiJualKonsol(S, id);
      return '<div class="kartu-item"><div><span class="ki-tag milik">Milikmu</span><b>' + esc(k.nama) + '</b><small>Dipakai ' + (k.pakai || 0) + ' jam</small><div class="ki-harga">' + rupiahPendek(hj) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualKonsol:' + id + '">Jual</button></div></div>';
    }).join('') + '</div>' : '<p class="catatan">Belum punya konsol.</p>');
    html += '<h3 class="subjudul">Game Original (' + gIds.length + ')</h3>' + (gIds.length ? '<div class="grid-2">' + gIds.map(function (id) {
      var gk = S.game.kaset[id], hj = DIRI.nilaiJualGame(S, id);
      return '<div class="kartu-item"><div><span class="ki-tag">' + esc(gk.konsol.toUpperCase()) + '</span><b>' + esc(gk.nama) + '</b><small>Main ' + (gk.pakai || 0) + '×</small><div class="ki-harga">' + rupiahPendek(hj) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol bahaya-kecil" data-aksi="jualGame:' + id + '">Jual</button></div></div>';
    }).join('') + '</div>' : '<p class="catatan">Belum punya game original.</p>');
    return html;
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

  /* ---------- aplikasi HP & Kuota (fokus pada perangkatmu: pulsa, kuota, WiFi, cas, PB, & APK) ---------- */
  function layarGadget() {
    var tab = app.gadgetTab || 'data';
    if (tab !== 'data' && tab !== 'apk' && tab !== 'pb') tab = 'data';
    var hm = DIRI.hpAktif(S), st = DIRI.infoStorageHp(S), wifi = DIRI.adaWifi(S);
    var bat = Math.round((S.hp && S.hp.baterai) || 95), wfInfo = N.paketData.wifiRumah;
    var pbInfoG = DIRI.pbAktifInfo ? DIRI.pbAktifInfo(S) : null;
    var html = kepalaApp('HP & Kuota', hm.nama + ' · ' + bat + '% · ' + (wifi ? 'WiFi' : (S.hp ? S.hp.kuota.toFixed(1).replace('.', ',') : 0) + ' GB')) +
      '<div class="saldo-besar" style="background:#1e88e5"><small>' + esc(hm.merek + ' ' + hm.nama) + (S.hp.pbPasang && pbInfoG ? ' · 🔋 PB ' + pbInfoG.persen + '%' : '') + '</small><b>' + (S.hp.cas ? '⚡ Cas ' : '🔋 ') + bat + '% · ' + hm.ram + ' GB · ' + st.terpakaiRom + '/' + st.totalRom + ' GB</b>' + persenBar(bat) + '</div>' +
      '<div class="cat-strip">' +
      '<button type="button" class="' + (S.hp.cas ? 'pilih' : '') + '" data-aksi="casHp:1">' + (S.hp.cas ? '⚡ Cabut (' + hm.watt + 'W)' : '🔌 Cas ' + hm.watt + 'W') + '</button>' +
      (pbInfoG ? '<button type="button" class="' + (S.hp.pbPasang ? 'pilih' : '') + '" data-aksi="togglePb:1">' + (S.hp.pbPasang ? '🔋 Cabut PB' : '🔋 Pakai PB ' + pbInfoG.persen + '%') + '</button>' : '') +
      '<button type="button" data-aksi="bukaTokoMenu:hp">🛒 Beli HP</button>' +
      '<button type="button" data-aksi="bukaTokoMenu:pb">🛒 Beli PB</button></div>' +
      segTab('gadgetTab', [['data', '📶 Pulsa & Kuota'], ['apk', '📲 APK & Game'], ['pb', '🔋 Power Bank']], tab) + pesanApp();
    if (tab === 'data') {
      var noHp = (S.hp && S.hp.nomor) || '081256000088';
      var masaAktif = (S.hp && S.hp.masaAktif != null) ? S.hp.masaAktif : (S.hari + 30);
      var sisaHariAktif = Math.max(0, masaAktif - S.hari), kuotaGb = S.hp ? (S.hp.kuota || 0) : 0;
      html += '<div class="stat-grid-2">' +
        '<div class="stat-box"><small>SIM · Masa Aktif</small><b>' + esc(noHp) + ' (' + sisaHariAktif + ' hr)</b></div>' +
        '<div class="stat-box"><small>Pulsa · Kuota</small><b>' + rupiahPendek(S.hp.pulsa || 0) + ' · ' + kuotaGb.toFixed(2).replace('.', ',') + ' GB</b></div></div>' +
        '<h3 class="subjudul">Isi Pulsa (Perpanjang Masa Aktif)</h3><div class="grid-2">' +
        N.paketData.pulsa.map(function (nom) {
          return '<div class="kartu-item"><div><b>Pulsa ' + (nom / 1000) + 'rb</b><div class="ki-harga">' + rupiah(nom) + '</div></div>' +
            '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="beliPulsa:' + nom + '-bank">Bank</button><button type="button" class="chip-tombol" data-aksi="beliPulsa:' + nom + '-dompet">Tunai</button></div></div>';
        }).join('') + '</div>' +
        '<h3 class="subjudul">Paket Kuota Internet</h3><div class="grid-2">' +
        N.paketData.kuota.map(function (pk) {
          return '<div class="kartu-item"><div><span class="ki-tag">+' + pk.gb + ' GB</span><b>' + esc(pk.nama.split(' (')[0]) + '</b><div class="ki-harga">' + rupiahPendek(pk.harga) + '</div></div>' +
            '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="beliKuota:' + pk.id + '-pulsa">Pulsa</button><button type="button" class="chip-tombol" data-aksi="beliKuota:' + pk.id + '-bank">Bank</button></div></div>';
        }).join('') + '</div>' +
        '<div class="kartu-item" style="margin-top:8px"><div class="ki-top"><span class="ki-tag ' + (S.rumah.wifi ? 'milik' : '') + '">' + (S.rumah.wifi ? 'WiFi Aktif' : 'Belum Pasang') + '</span></div>' +
        '<b>' + esc(wfInfo.nama) + '</b><small>Pasang ' + rupiahPendek(wfInfo.pasang) + ' · ' + rupiahPendek(wfInfo.hargaBulan) + '/bln (bebas kuota di ' + DIRI.tempat(S) + ')</small>' +
        '<div class="ki-aksi"><button type="button" class="chip-tombol' + (S.rumah.wifi ? ' bahaya-kecil' : ' pilih') + '" data-aksi="wifiRumah:1">' + (S.rumah.wifi ? 'Berhenti WiFi' : 'Pasang WiFi') + '</button></div></div>';
      return html;
    }
    if (tab === 'pb') {
      var milikKeys = Object.keys((S.hp && S.hp.pbMilik) || {});
      if (!milikKeys.length) {
        return html + '<p class="catatan">Belum punya Power Bank. Beli Power Bank 5.000–100.000 mAh di <b>Toko Online</b> agar HP tidak kehabisan baterai saat narik.</p>' +
          '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-aksi="bukaTokoMenu:pb">🛒 Beli Power Bank di Toko Online</button></div>';
      }
      return html + '<div class="grid-2">' + milikKeys.map(function (pid) {
        var pb = (N.daftarPowerBank || []).filter(function (x) { return x.id === pid; })[0]; if (!pb) return '';
        var stPb = S.hp.pbMilik[pid], aktPb = S.hp.pbAktif === pid, pct = Math.round((stPb.sisaMah / pb.mah) * 100);
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + pb.wattOut + 'W</span>' + (aktPb ? '<span class="ki-tag milik">Aktif</span>' : '') + '</div>' +
          '<b>' + esc(pb.nama) + '</b><small>' + Math.round(stPb.sisaMah).toLocaleString('id-ID') + ' / ' + pb.mah.toLocaleString('id-ID') + ' mAh (' + pct + '%)</small>' + persenBar(pct) + '</div>' +
          '<div class="ki-aksi">' + (aktPb
            ? '<button type="button" class="chip-tombol' + (S.hp.pbPasang ? ' pilih' : '') + '" data-aksi="togglePb:1">' + (S.hp.pbPasang ? 'Cabut' : 'Sambung') + '</button><button type="button" class="chip-tombol' + (S.hp.pbCas ? ' pilih' : '') + '" data-aksi="casPb:1">' + (S.hp.pbCas ? 'Stop Cas' : 'Cas PB') + '</button>'
            : '<button type="button" class="chip-tombol pilih" data-aksi="pakaiPb:' + pb.id + '">Pakai PB</button>') + '</div></div>';
      }).join('') + '</div>';
    }
    /* tab === 'apk' */
    return html + '<div class="grid-2">' + N.apkHp.map(function (a) {
      var sudah = !!(S.hp.apk && S.hp.apk[a.id]), cukupRam = hm.ram >= a.ram;
      return '<div class="kartu-item' + (!cukupRam && !sudah ? ' redup' : '') + '"><div><div class="ki-top"><span class="ki-tag">' + a.rom + ' GB · RAM ' + a.ram + 'G</span>' + (sudah ? '<span class="ki-tag milik">Terinstal</span>' : '') + '</div>' +
        '<b>' + esc(a.nama) + '</b><small>' + esc(a.ket) + '</small></div>' +
        '<div class="ki-aksi">' + (sudah
          ? (a.jenis === 'game' ? '<button type="button" class="chip-tombol pilih" data-aksi="mainApk:' + a.id + '">Main +' + a.stamina + '</button>' : '') + '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="hapusApk:' + a.id + '">Hapus</button>'
          : '<button type="button" class="chip-tombol pilih" data-aksi="instalApk:' + a.id + '">Instal</button>') + '</div></div>';
    }).join('') + '</div>';
  }

  function layarApotek() {
    var tab = app.apotekTab || 'obat', ks = S.kesehatan || { obat: {}, kondom: 0, kbSampai: -1, bpjs: { kelas: 0, aktif: false, tunggakan: 0 } };
    var bp = ks.bpjs || { kelas: 0, aktif: false, tunggakan: 0 };
    var kbAktif = (ks.kbSampai || -1) >= S.hari, sisaKb = kbAktif ? (ks.kbSampai - S.hari + 1) : 0;
    var html = kepalaApp('Apotek & RS', 'Sehat ' + Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + '% · BPJS ' + (bp.kelas > 0 ? 'Kls ' + bp.kelas : 'Umum')) +
      segTab('apotekTab', [['obat', '💊 Obat'], ['rs', '🏥 RS & BPJS'], ['kb', '🛡️ KB'], ['vitamin', '⚡ Vitamin']], tab) + pesanApp();
    var daftarSakit = [];
    if (S.diri.sakit) daftarSakit.push({ id: 'pemain', nama: (S.namaPemain || 'Kamu') + ' (Pemain)', sakit: S.diri.sakit });
    (S.keluarga || []).forEach(function (kl) { if (kl.sakit) daftarSakit.push({ id: kl.id, nama: kl.nama + ' (' + DIRI.labelPeran(S, kl) + ')', sakit: kl.sakit }); });
    (S.staf || []).forEach(function (k) { if (S.hari < k.sakitSampai) daftarSakit.push({ id: 'staf:' + k.id, nama: k.nama + ' (Karyawan)', sakit: { id: 'demam', nama: 'Sakit', berat: false } }); });
    if (daftarSakit.length) {
      html += '<div class="isbat peringatan" style="margin-top:0;margin-bottom:6px"><b>Sedang sakit:</b> ' +
        daftarSakit.map(function (x) { return esc(x.nama) + ' (' + esc(x.sakit.nama) + ')'; }).join('; ') + '</div>';
    }
    html += '<div class="stat-grid-2">' +
      '<div class="stat-box"><small>Kesehatan · BPJS</small><b>' + (S.diri.sakit ? esc(S.diri.sakit.nama) : Math.round(S.diri.kesehatan == null ? 100 : S.diri.kesehatan) + '%') + ' · ' + (bp.kelas > 0 ? 'Kls ' + bp.kelas : 'Umum') + '</b></div>' +
      '<div class="stat-box"><small>Kondom · KB</small><b>' + (ks.kondom || 0) + ' pcs · ' + (kbAktif ? sisaKb + ' hr' : 'Off') + '</b></div></div>';
    if (tab === 'rs') {
      var jmlOrg = 1 + (S.keluarga ? S.keluarga.length : 0);
      var kInfo = (DIRI.BPJS_KELAS && DIRI.BPJS_KELAS[bp.kelas]) || { nama: 'Umum', iuran: 0, diskon: 0 };
      html += '<div class="saldo-besar" style="background:' + (bp.aktif ? '#00875a' : '#8a5a2b') + '"><small>BPJS Kesehatan (' + jmlOrg + ' orang)</small><b>' + esc(kInfo.nama) + (bp.kelas > 0 ? (bp.aktif ? ' · Aktif' : ' · Nonaktif') : '') + '</b></div>' +
        (bp.tunggakan > 0 ? '<div class="chip-baris" style="margin-bottom:6px"><button type="button" class="chip-tombol pilih" data-aksi="lunasBpjs:1">Lunasi Tunggakan ' + rupiah(bp.tunggakan) + '</button></div>' : '') +
        segTab('daftarBpjs', [3, 2, 1, 0].map(function (kls) { var bki = DIRI.BPJS_KELAS[kls]; return [String(kls), kls === 0 ? 'Umum' : 'Kls ' + kls + ' (' + rupiahPendek(bki.iuran * jmlOrg) + ')']; }), String(bp.kelas)) +
        '<h3 class="subjudul">🏥 Layanan Rumah Sakit</h3><div class="grid-2">' +
        (DIRI.LAYANAN_RS || []).map(function (l) {
          var hSkrg = DIRI.hargaRs(S, l.id), hemat = l.umum - hSkrg;
          return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + l.jam + ' jam</span>' + (hemat > 0 ? '<span class="ki-tag milik">BPJS</span>' : '') + '</div>' +
            '<b>' + esc(l.nama) + '</b><small>' + esc(l.ket) + '</small>' +
            '<div class="ki-harga">' + (hemat > 0 ? '<s>' + rupiahPendek(l.umum) + '</s>' + rupiahPendek(hSkrg) : rupiahPendek(l.umum)) + '</div></div>' +
            '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="masukRs:' + l.id + '|pemain">Kamu</button>' +
            (S.keluarga || []).filter(function (kl) { return !!kl.sakit; }).slice(0, 1).map(function (kl) { return '<button type="button" class="chip-tombol" data-aksi="masukRs:' + l.id + '|' + kl.id + '">' + esc(kl.nama.split(' ')[0]) + '</button>'; }).join('') + '</div></div>';
        }).join('') + '</div>';
      return html;
    }
    var obatDimiliki = (N.apotek || []).filter(function (x) { return x.kat === 'obat' && !x.sembuhSemua && (ks.obat && ks.obat[x.id] > 0); });
    if (obatDimiliki.length && daftarSakit.length) {
      html += '<h3 class="subjudul">Kotak P3K</h3><div class="grid-2">' + obatDimiliki.map(function (ob) {
        return '<div class="kartu-item"><div><span class="ki-tag milik">Stok ' + ks.obat[ob.id] + '</span><b>' + esc(ob.nama) + '</b></div><div class="ki-aksi">' +
          daftarSakit.map(function (t) { return '<button type="button" class="chip-tombol pilih" data-aksi="pakaiObat:' + ob.id + '|' + t.id + '">' + esc(t.nama.split(' (')[0]) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
    }
    var listA = (N.apotek || []).filter(function (x) { return x.kat === tab; });
    return html + '<div class="grid-2">' + listA.map(function (it) {
      var tombolA = it.sembuhSemua && daftarSakit.length
        ? daftarSakit.slice(0, 2).map(function (t) { return '<button type="button" class="chip-tombol pilih" data-aksi="beliApotek:' + it.id + '|bank|' + t.id + '">Obati ' + esc(t.nama.split(' (')[0]) + '</button>'; }).join('')
        : '<button type="button" class="chip-tombol pilih" data-aksi="beliApotek:' + it.id + '|dompet|pemain">Tunai</button><button type="button" class="chip-tombol" data-aksi="beliApotek:' + it.id + '|bank|pemain">Bank</button>';
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(it.kemasan) + '</span></div>' +
        '<b>' + esc(it.nama) + '</b><small>' + esc(it.ket) + '</small><div class="ki-harga">' + rupiahPendek(it.harga) + '</div></div>' +
        '<div class="ki-aksi">' + tombolA + '</div></div>';
    }).join('') + '</div>';
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
      segTab('kelTab', [['nafkah', '💝 Nafkah'], ['pasangan', '❤️ Pasangan'], ['anggota', '👨‍👩‍👧 Anggota (' + kel.length + ')'], ['tambah', '➕ Tambah']], kTab) + pesanApp();

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
    var html = kepalaApp('Dapur & Pasar Pokok', pas ? 'Belanja sendiri atau suruh ' + pas.nama : 'Kebutuhan dapur rumah tangga') + pesanApp() +
      '<div class="kartu-hero" style="background:linear-gradient(135deg,#b45309,#d97706)"><small>Stok Dapur Rumah Tangga</small><b>' +
      (rtAktif ? 'Cukup s/d ' + namaTanggal(S.rumahTangga.aktifSampai) : 'Stok dapur kosong · Belanja sekarang') + '</b></div>' +
      '<div class="grid-2">' + (N.pasarPokok || []).map(function (it) {
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">+' + it.hariDapur + ' hari</span></div><b>' + esc(it.nama) + '</b><small>' + esc(it.ket) + '</small><div class="ki-harga">' + rupiah(it.harga) + '</div></div>' +
          '<div class="ki-aksi">' +
          (pas ? '<button type="button" class="chip-tombol pilih" data-aksi="pasarPokok:' + it.id + '|pasangan">Suruh ' + esc(pas.nama.split(' ')[0]) + '</button>' : '') +
          '<button type="button" class="chip-tombol' + (pas ? '' : ' pilih') + '" data-aksi="pasarPokok:' + it.id + '|sendiri">Sendiri</button></div></div>';
      }).join('') + '</div>';
    return html;
  }

  function layarRentalPs() {
    var rpObj = S.rentalPs || { aktif: false, unit: [], kaset: {}, tarif: {}, hariIni: {} };
    var cfg = N.rentalPsConfig || { lokasi: [], tarifDefault: {} };
    var rTab = app.rpsTab || 'bilik';
    var html = kepalaApp('Rental PlayStation', rpObj.aktif ? (DIRI.infoLokasiRental(rpObj.lokasi).nama + ' · ' + rpObj.unit.length + ' bilik') : 'Buka usaha Rental PS') + pesanApp();
    if (!rpObj.aktif) {
      html += '<div class="kartu-hero" style="background:linear-gradient(135deg,#0d47a1,#1565c0)"><small>Peluang Bisnis Pasif</small><b>Usaha Rental PlayStation</b></div>' +
        (!S.usaha.ruko2Lantai ? '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-aksi="sewaRuko2Lantai:1">🏢 Upgrade Ruko 2 Lantai Dulu (Hemat Sewa)</button></div>' : '<div class="isbat" style="margin:0 0 8px">Ruko 2 Lantai aktif — buka di Lt. 2 bebas sewa bulanan!</div>') +
        '<div class="grid-2">' + (cfg.lokasi || []).map(function (lok) {
          var totalAwal = lok.biayaBuka + (lok.butuhRuko2Lantai ? 0 : lok.sewaBulan);
          return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + (lok.butuhRuko2Lantai ? 'Gratis Sewa' : rupiahPendek(lok.sewaBulan) + '/bln') + '</span></div><b>' + esc(lok.nama) + '</b><small>' + esc(lok.ket) + '</small><div class="ki-harga">' + rupiahPendek(totalAwal) + '</div></div>' +
            '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="bukaRentalPs:' + lok.id + '">Buka Rental</button></div></div>';
        }).join('') + '</div>';
      return html;
    }
    var lokAktif = DIRI.infoLokasiRental(rpObj.lokasi);
    var hi = rpObj.hariIni || { pengunjung: 0, omzetSewa: 0, omzetMinum: 0, listrik: 0 };
    var kasetRentalCount = Object.keys(rpObj.kaset || {}).length;
    html += '<div class="kartu-hero" style="background:linear-gradient(135deg,#0d47a1,#1565c0)"><small>' + esc(lokAktif.nama) + ' · Token ' + rpObj.kwh.toFixed(1).replace('.', ',') + ' kWh · ' + (rpObj.penjaga || 0) + ' penjaga</small>' +
      '<b>Hari ini: ' + (hi.pengunjung || 0) + ' org · ' + rupiah((hi.omzetSewa || 0) + (hi.omzetMinum || 0)) + '</b></div>' +
      (rpObj.padam ? '<p class="racik-pesan salah">Listrik Rental PS padam! Isi token PLN di tab Game & Token.</p>' : '') +
      segTab('rpsTab', [['bilik', '🎮 Bilik (' + rpObj.unit.length + ')'], ['tarif', '⚙️ Tarif & Staf'], ['game', '💿 Game & PLN']], rTab);
    if (rTab === 'bilik') {
      html += '<div class="stat-grid-2"><div class="stat-box"><small>Bilik · TV Cadangan</small><b>' + rpObj.unit.length + '/16 · ' + (rpObj.tvStok || 0) + ' TV</b></div>' +
        '<div class="stat-box"><small>Total Omzet Rental</small><b>' + rupiahPendek((rpObj.total && rpObj.total.omzet) || 0) + '</b></div></div>' +
        '<div class="cat-strip"><button type="button" data-aksi="beliTvRentalPs:1">+ TV LED 32" (' + rupiahPendek(cfg.hargaTvUnit || 1950000) + ')</button>' +
        Object.keys((S.game && S.game.konsol) || {}).map(function (kid) { return '<button type="button" data-aksi="tambahUnitRentalPs:pindah|' + kid + '">Pindah ' + esc(kid.toUpperCase()) + '</button>'; }).join('') + '</div>' +
        '<div class="grid-2">' + ['ps2', 'ps3', 'ps4', 'ps5', 'ps5disc'].map(function (kid) {
          var km = DIRI.konsolModel(kid); if (!km) return '';
          var hKon = km.harga || Math.round((km.min + km.maks) / 2);
          var hPaket = hKon + ((rpObj.tvStok || 0) > 0 ? 0 : (cfg.hargaTvUnit || 1950000));
          return '<div class="kartu-item"><div><span class="ki-tag">Paket Bilik</span><b>' + esc(kid.toUpperCase()) + ' + TV</b><div class="ki-harga">' + rupiahPendek(hPaket) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="tambahUnitRentalPs:beli|' + kid + '">+ Tambah</button></div></div>';
        }).join('') + '</div>';
      return html;
    }
    if (rTab === 'tarif') {
      return html + ['ps2', 'ps3', 'ps4', 'ps5'].map(function (kid) {
        var trf = rpObj.tarif[kid] || cfg.tarifDefault[kid] || 10000;
        return '<div class="atur-baris"><div><b>Tarif ' + esc(kid.toUpperCase()) + '/jam</b><span>Pasaran ' + rupiah(cfg.tarifDefault[kid] || 10000) + '</span></div>' +
          '<div class="langkah"><button type="button" data-aksi="tarifRentalPs:' + kid + '|-1">−</button><output>' + rupiah(trf) + '</output><button type="button" data-aksi="tarifRentalPs:' + kid + '|1">+</button></div></div>';
      }).join('') +
      '<div class="atur-baris"><div><b>Penjaga Rental</b><span>' + rupiah(cfg.gajiPenjaga || 1350000) + '/bln</span></div>' +
      '<div class="langkah"><button type="button" data-aksi="penjagaRentalPs:-1">−</button><output>' + (rpObj.penjaga || 0) + ' org</output><button type="button" data-aksi="penjagaRentalPs:1">+</button></div></div>' +
      '<div style="margin-top:8px"><button type="button" class="aksi kecil" data-aksi="stokMinumRentalPs:1">🥤 Kulakan 60 Minuman & Mie (' + rupiahPendek(cfg.modalStokMinum || 250000) + ' · Sisa ' + (rpObj.stokMinum || 0) + ')</button></div>';
    }
    return html + '<h3 class="subjudul">⚡ Token PLN Rental (' + rpObj.kwh.toFixed(1).replace('.', ',') + ' kWh)</h3><div class="grid-2">' +
      [20000, 50000, 100000, 200000].map(function (nom) {
        var tk = USAHA.token(S, nom);
        return '<div class="kartu-item"><div><span class="ki-tag">+' + tk.kwh.toFixed(1).replace('.', ',') + ' kWh</span><b>Token ' + (nom / 1000) + 'rb</b></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="tokenRentalPs:' + nom + '">Beli</button></div></div>';
      }).join('') + '</div>' +
      '<h3 class="subjudul">💿 Koleksi Kaset (' + kasetRentalCount + ' judul)</h3><div class="grid-2">' +
      (N.gameKonsol || []).filter(function (g) { return ['g_ps2_gtasa', 'g_ps2_we10', 'g_ps2_downhill', 'g_ps3_gtav', 'g_ps3_pes18', 'g_ps4_fc25', 'g_ps4_gowr', 'g_ps5_fc26', 'g_ps5_spider2', 'g_ps5_wukong'].indexOf(g.id) >= 0; }).map(function (g) {
        var sdh = !!(rpObj.kaset && rpObj.kaset[g.id]);
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(g.konsol.toUpperCase()) + '</span>' + (sdh ? '<span class="ki-tag milik">Ada</span>' : '') + '</div><b>' + esc(g.nama) + '</b><div class="ki-harga">' + rupiahPendek(g.harga) + '</div></div>' +
          '<div class="ki-aksi">' + (sdh ? '<small>Tersedia ✓</small>' : '<button type="button" class="chip-tombol pilih" data-aksi="beliKasetRentalPs:' + g.id + '">Beli</button>') + '</div></div>';
      }).join('') + '</div>';
  }

  function layarRental() {
    var daftar = DIRI.daftarBisaDisewa(S);
    var aktif = daftar.filter(function (x) { return x.aktif; });
    var totalHarian = aktif.reduce(function (t, x) { return t + x.tarif; }, 0);
    var html = kepalaApp('Sewa Aset', aktif.length + ' unit disewakan · ' + rupiahPendek(totalHarian) + '/hari') + pesanApp() +
      '<div class="kartu-hero" style="background:linear-gradient(135deg,#4e342e,#6d4c41)"><small>Pendapatan Sewa Pasif Harian (Cair Tiap Pagi)</small><b>' + rupiah(totalHarian) + ' / hari</b></div>';
    if (!daftar.length) {
      return html + '<p class="catatan">Belum punya aset yang bisa disewakan (motor, mobil, konsol PS, tablet, laptop, kamera, proyektor, atau sepeda lipat). Catatan: kendaraan yang disewakan tidak bisa dipakai ngojol/jalan sampai sewa dihentikan.</p>';
    }
    html += '<div class="grid-2">' + daftar.map(function (x) {
      return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(x.kat) + '</span>' + (x.aktif ? '<span class="ki-tag milik">Disewakan</span>' : x.terkunciSupir ? '<span class="ki-tag promo">Supir</span>' : '') + '</div>' +
        '<b>' + esc(x.nama) + '</b><small>' + esc(x.ket) + '</small><div class="ki-harga">' + rupiah(x.tarif) + '/hr</div></div>' +
        '<div class="ki-aksi"><button type="button" class="chip-tombol' + (x.aktif ? ' bahaya-kecil' : ' pilih') + '"' + (x.terkunciSupir ? ' disabled style="opacity:.5"' : '') + ' data-aksi="sewaBarang:' + x.kunci + '">' + (x.terkunciSupir ? 'Dipakai Supir' : x.aktif ? 'Hentikan Sewa' : '🔑 Sewakan') + '</button></div></div>';
    }).join('') + '</div><p class="catatan">💡 Motor atau mobil yang sedang disewakan otomatis terkunci dari ngojol/GoCar/Travel hingga kamu menekan Hentikan Sewa.</p>';
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
    else if (nama === 'token' && (app.meter || 'kos') === 'kos') { var rk = DIRI.beliTokenKos(S, v); hasilAksi(rk && rk.ok ? true : rk, rk && rk.ok ? 'Token ' + DIRI.tempat(S) + ' masuk ' + rk.kwh.toFixed(1).replace('.', ',') + ' kWh, dibayar ' + rupiah(rk.bayar) + '.' : ''); }
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
    else if (nama === 'garasiTab') { app.garasiTab = nilai; app.pesan = ''; }
    else if (nama === 'bekasTab') { app.bekasTab = nilai; app.pesan = ''; }
    else if (nama === 'makanTab') { app.makanTab = nilai; app.pesan = ''; }
    else if (nama === 'makanCara') { app.makanCara = nilai; app.pesan = ''; }
    else if (nama === 'hunianKat') { app.hunianKat = nilai; app.pesan = ''; }
    else if (nama === 'rpsTab') { app.rpsTab = nilai; app.pesan = ''; }
    else if (nama === 'hadiahKat') { app.hadiahKat = nilai; return bukaHadiah(app.hadiahTargetJenis || 'keluarga', app.hadiahTargetId || ''); }
    else if (nama === 'pindahHunianSewa') {
      if (S.ojek.online) { app.pesan = 'Berhenti narik dulu sebelum pindah hunian.'; app.salah = true; return bukaHP('properti'); }
      if (S.travel && S.travel.aktif) { app.pesan = 'Selesaikan Travel dulu sebelum pindah hunian.'; app.salah = true; return bukaHP('properti'); }
      var rph = DIRI.pindahHunianSewa(S, nilai);
      if (!rph || !rph.ok) { app.pesan = rph; app.salah = true; return bukaHP('properti'); }
      tutupLembar(); if (R) tutupRacik();
      animasi = true; pindahAnim = { mulai: performance.now(), pikap: !!(S.mobil && MOBIL.pikap(S) && MOBIL.siapPakai(S)), warna: S.mobil ? S.mobil.id : null };
      simpan();
      setTimeout(function () {
        animasi = false; pindahAnim = null; S.diri.posisi = 'kos'; lompatWaktu(rph.menit || 45);
        simpan(); perbaruiAksi(); perbaruiHUD(true); toast(rph.teks, 3800);
      }, 2600);
      return;
    }
    else if (nama === 'qrisTab') { app.qrisTab = nilai; app.pesan = ''; }
    else if (nama === 'tokoMenu') { app.tokoMenu = nilai; app.pesan = ''; }
    else if (nama === 'bukaTokoMenu') { app.nama = 'toko'; app.tokoMenu = nilai; app.pesan = ''; }
    else if (nama === 'kelasMotor') { app.kelasMotor = nilai; app.pesan = ''; }
    else if (nama === 'kelasMobil') { app.kelasMobil = nilai; app.pesan = ''; }
    else if (nama === 'tunaiMobil') { var rtm = MOBIL.beliTunai(S, nilai, 'bank'); hasilAksi(rtm, 'Mobil masuk Garasi! Bisa langsung narik GoCar/GrabCar atau Travel sekarang.'); if (rtm === true) { app.nama = 'motor'; app.garasiTab = 'mobil'; } }
    else if (nama === 'tunaiMobilKk') { var rtmk = MOBIL.beliTunai(S, nilai, 'kk'); hasilAksi(rtmk, 'Mobil dibeli pakai KK & masuk Garasi! Langsung siap narik.'); if (rtmk === true) { app.nama = 'motor'; app.garasiTab = 'mobil'; } }
    else if (nama === 'kreditMobilPilih') { app.kreditMobil = nilai; app.pesan = ''; app.nama = 'kreditMobil'; }
    else if (nama === 'kreditMobilDp') { app.kreditMobilDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobilTenor') { app.kreditMobilTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kreditMobil') { var rkm = MOBIL.beliKredit(S, app.kreditMobil, app.kreditMobilDp || 0.2, app.kreditMobilTenor || 60, nilai === 'kk' ? 'kk' : 'bank'); hasilAksi(rkm, 'Kredit mobil disetujui! Masuk Garasi & langsung siap narik GoCar/Travel.'); if (rkm === true) { app.nama = 'motor'; app.garasiTab = 'mobil'; } }
    else if (nama === 'bekasMobil') { var rbm = MOBIL.beliBekas(S, +nilai, 'bank'); hasilAksi(rbm, 'Mobil bekas masuk Garasi! Langsung siap narik GoCar/Travel.'); if (rbm === true) { app.nama = 'motor'; app.garasiTab = 'mobil'; } }
    else if (nama === 'bekasMobilKk') { var rbmk = MOBIL.beliBekas(S, +nilai, 'kk'); hasilAksi(rbmk, 'Mobil bekas dibeli pakai KK & masuk Garasi!'); if (rbmk === true) { app.nama = 'motor'; app.garasiTab = 'mobil'; } }
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
    else if (nama === 'daftarDriver') hasilAksi(OJEK.daftar(S, nilai), 'Verifikasi e-KYC selesai! Akun ' + OJEK.platform(nilai).nama + ' LANGSUNG AKTIF — siap narik sekarang!');
    else if (nama === 'putusDriver') hasilAksi(OJEK.putus(S, nilai), 'Kerjasama mitra driver ' + OJEK.platform(nilai).nama + ' resmi diputus.');
    else if (nama === 'onlineDriver') return mulaiNarik(nilai);
    else if (nama === 'offlineDriver') return berhentiNarik();
    else if (nama === 'tarikDriver') { var td = OJEK.tarikSaldo(S, nilai === '1' ? 'bank' : nilai); hasilAksi(td && td.ok ? true : td, td && td.ok ? rupiah(td.jml) + ' ' + (td.ket || 'berhasil ditarik') + '.' : ''); }
    else if (nama === 'kotaProp') { app.kotaProp = nilai; app.pesan = ''; }
    else if (nama === 'propTab') { app.propTab = nilai; app.pesan = ''; }
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
    else if (nama === 'tunai') { var rt = MOTOR.beliTunai(S, nilai, 'bank'); hasilAksi(rt, 'Motor masuk Garasi! Buka Driver Ojol untuk langsung daftar & narik hari ini.'); if (rt === true) { app.nama = 'motor'; app.garasiTab = 'motor'; } }
    else if (nama === 'tunaiKk') { var rtk = MOTOR.beliTunai(S, nilai, 'kk'); hasilAksi(rtk, 'Motor dibeli pakai KK & masuk Garasi! Langsung daftar Ojol sekarang.'); if (rtk === true) { app.nama = 'motor'; app.garasiTab = 'motor'; } }
    else if (nama === 'kreditPilih') { app.kreditMotor = nilai; app.pesan = ''; app.nama = 'kredit'; }
    else if (nama === 'kreditDp') { app.kreditDp = +nilai; app.pesan = ''; }
    else if (nama === 'kreditTenor') { app.kreditTenor = +nilai; app.pesan = ''; }
    else if (nama === 'kredit') { var rk = MOTOR.beliKredit(S, app.kreditMotor, app.kreditDp || 0.1, app.kreditTenor || 35, nilai === 'kk' ? 'kk' : 'bank'); hasilAksi(rk, 'Kredit motor disetujui! Masuk Garasi — buka Driver Ojol untuk langsung narik hari ini.'); if (rk === true) { app.nama = 'motor'; app.garasiTab = 'motor'; } }
    else if (nama === 'bekas') { var rbk = MOTOR.beliBekas(S, +nilai, 'bank'); hasilAksi(rbk, 'Motor bekas masuk Garasi & dijadikan motor utama!'); if (rbk === true) { app.nama = 'motor'; app.garasiTab = 'motor'; } }
    else if (nama === 'bekasKk') { var rbkk = MOTOR.beliBekas(S, +nilai, 'kk'); hasilAksi(rbkk, 'Motor bekas dibeli pakai KK & masuk Garasi!'); if (rbkk === true) { app.nama = 'motor'; app.garasiTab = 'motor'; } }
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
    else if (nama === 'temanTab') { app.temanTab = nilai; app.temanDetailId = null; app.pesan = ''; }
    else if (nama === 'bukaTeman') { app.temanDetailId = nilai; app.pesan = ''; }
    else if (nama === 'tutupTeman') { app.temanDetailId = null; app.pesan = ''; }
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
      var tpT = tampilanLengkap(app.tmTampilan, gT);
      var rtm = TEMAN.tambah(S, nmT, gT, pT, ttT, tpT); if (rtm && rtm.ok) { app.tmNama = ''; app.tmTtl = ''; app.tmTampilan = null; app.temanTab = 'daftar'; } hasilAksi(rtm && rtm.ok ? true : rtm, rtm && rtm.ok ? rtm.teks : '');
    }
    else if (nama === 'tmGender' || nama === 'tmPeran') { app.tmNama = $('in-tm-nama') ? $('in-tm-nama').value : ''; app.tmTtl = $('in-tm-ttl') ? $('in-tm-ttl').value : ''; if (nama === 'tmGender') { app.tmGender = nilai; app.tmTampilan = tampilanLengkap(app.tmTampilan, nilai); } else app.tmPeran = nilai; app.pesan = ''; }
    else if (nama === 'tmTp') {
      app.tmNama = $('in-tm-nama') ? $('in-tm-nama').value : '';
      app.tmTtl = $('in-tm-ttl') ? $('in-tm-ttl').value : '';
      var ptp = nilai.split('|');
      app.tmTampilan = tampilanLengkap(app.tmTampilan, app.tmGender || 'cewek');
      app.tmTampilan[ptp[0]] = ptp[1];
      app.pesan = '';
    }
    else if (nama === 'tmInteraksi') {
      var ti = nilai.split('|'), rti = TEMAN.interaksi(S, ti[0], ti[1], function (jml, ket) { return bayarPribadi(jml, ket); });
      hasilAksi(rti && rti.ok ? true : rti, rti && rti.ok ? rti.teks : '');
    }
    else if (nama === 'tmPeranUbah') { var tp = nilai.split('|'), rtp = TEMAN.ubahPeran(S, tp[0], tp[1]); hasilAksi(rtp && rtp.ok ? true : rtp, rtp && rtp.ok ? rtp.teks : ''); }
    else if (nama === 'tmNama') { var rtn = TEMAN.ubahNama(S, nilai, $('in-tmn-' + nilai) ? $('in-tmn-' + nilai).value : ''); hasilAksi(rtn && rtn.ok ? true : rtn, rtn && rtn.ok ? rtn.teks : ''); }
    else if (nama === 'tmTtl') { var rtt = TEMAN.ubahTtl(S, nilai, $('in-tmt-' + nilai) ? $('in-tmt-' + nilai).value : ''); hasilAksi(rtt && rtt.ok ? true : rtt, rtt && rtt.ok ? rtt.teks : ''); }
    else if (nama === 'tmNikah') { var tn = nilai.split('|'), rn = DIRI.nikahiTeman(S, tn[0], tn[1]); if (rn && rn.ok) app.temanDetailId = null; hasilAksi(rn && rn.ok ? true : rn, rn && rn.ok ? rn.teks : ''); }
    else if (nama === 'tmUndang') { var rund = TEMAN.undangKeRumah(S, nilai); hasilAksi(rund && rund.ok ? true : rund, rund && rund.ok ? rund.teks : ''); }
    else if (nama === 'tmPulangkan') { var rpul = TEMAN.pulangkanTamu(S); hasilAksi(rpul && rpul.ok ? true : rpul, rpul && rpul.ok ? rpul.teks : ''); }
    else if (nama === 'hbDurasi') { app.hbDurasi = nilai; return bukaPilihLokasiHb(app.hbKondomTmp, app.hbTargetTmp); }
    else if (nama === 'tmHapus') { TEMAN.hapus(S, nilai); app.temanDetailId = null; hasilAksi(true, 'Dihapus dari daftar teman.'); }
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
    bukaHP(app.nama);
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
    var modeSebelum = S.ojek && S.ojek.online ? (S.ojek.mode || 'motor') : null;
    if (S.ojek.online) {
      if (paksaHome && ke === 'kos') { OJEK.offline(S, true); }
      else return toast('Sedang narik. Berhenti narik dulu di aplikasi Driver ojol.', 2600);
    }
    if (ke === 'kos' && S.fase === 'buka' && !kepalaMasuk()) {
      S.tutupSementara = true;
    }
    var km = (ke === 'kos' && OJEK.jarakRumah && (S.usaha.berhentiSewa || (S.ojek && S.ojek.pos && (S.ojek.pos.x || S.ojek.pos.y))))
      ? Math.max(0.5, OJEK.jarakRumah(S))
      : (S.rumah.jarak || N.jarakKos), menit, ket, r, kend = 'ojek', bbmDipakai = 0, bbmTarget = null;
    if (ke === 'kos' && modeSebelum !== 'motor' && MOBIL.siapPakai(S) && !MOBIL.cukup(S, km) && km > 15) {
      MOBIL.isiBensin(S, S.mobil.bbm, 'penuh');
    }
    var motorBisa = MOTOR.siapPakai(S) && MOTOR.cukup(S, km), mobilBisa = MOBIL.siapPakai(S) && MOBIL.cukup(S, km);
    var pakaiMobil = mobilBisa && modeSebelum !== 'motor' && (modeSebelum === 'mobil' || DUNIA.hujanSekarang(S) || !motorBisa || km >= 25);
    if (pakaiMobil) {
      var isiMbl0 = S.mobil.isi;
      r = MOBIL.jalan(S, km, 1); menit = r.menit; ket = 'naik ' + S.mobil.nama; kend = 'mobil';
      bbmDipakai = Math.max(0, isiMbl0 - S.mobil.isi); bbmTarget = 'mobil';
      if (km >= 2 && menit >= 5 && bbmDipakai > 0) S.mobil.isi = isiMbl0;
    }
    else if (motorBisa) {
      var evMtr = S.motor.bbm === 'listrik', isiMtr0 = evMtr ? S.motor.baterai : S.motor.isi;
      r = MOTOR.jalan(S, km, 1); menit = r.menit; ket = 'naik ' + S.motor.nama; kend = 'motor';
      bbmDipakai = Math.max(0, isiMtr0 - (evMtr ? S.motor.baterai : S.motor.isi)); bbmTarget = evMtr ? 'motorEv' : 'motor';
      if (km >= 2 && menit >= 5 && bbmDipakai > 0) { if (evMtr) S.motor.baterai = isiMtr0; else S.motor.isi = isiMtr0; }
    }
    else {
      var ong = Math.min(250000, OJEK.tarif(S, km));
      if (UANG.bayarDompet(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (dompet)'; }
      else if (UANG.bayarQris(S, ong)) { S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (QRIS)'; }
      else if (S.bank.saldo >= ong) { S.bank.saldo -= ong; S.hariIni.pribadi = (S.hariIni.pribadi || 0) + ong; menit = Math.round(km / (km > 30 ? 55 : 25) * 60) + 8; ket = 'naik transportasi ' + rupiah(ong) + ' (rekening)'; }
      else { menit = Math.min(180, Math.round(km * 12)); ket = 'jalan kaki / menumpang'; kend = 'kaki'; }
    }
    var kabarJalan = r && r.kabar && r.kabar.length ? r.kabar : [];
    /* jarak jauh: tampilkan perjalanannya (bensin berkurang bertahap real-time selama pulang!) */
    if (km >= 2 && menit >= 5) {
      var durasi = Math.max(3, Math.min(15, km * 0.55));
      S.transit = { ke: ke, total: menit, sisa: menit, km: Math.round(km * 10) / 10, ket: ket, kabar: kabarJalan, kend: kend, bbmTarget: bbmTarget, bbmSisa: bbmDipakai, mult: menit / (MENIT_PER_DETIK * durasi) };
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
    if (T.bbmSisa > 0 && T.bbmTarget) {
      if (T.bbmTarget === 'mobil' && S.mobil) S.mobil.isi = Math.max(0, S.mobil.isi - T.bbmSisa);
      else if (T.bbmTarget === 'motorEv' && S.motor) S.motor.baterai = Math.max(0, S.motor.baterai - T.bbmSisa);
      else if (T.bbmTarget === 'motor' && S.motor) S.motor.isi = Math.max(0, S.motor.isi - T.bbmSisa);
    }
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
    { id: 'kamar', nama: 'Kasur Kamar', varian: 'kamar', biaya: 0, diRumah: true, ket: 'Gratis, nyaman di ranjang kamar' },
    { id: 'sofa', nama: 'Kursi / Sofa Ruang Tamu', varian: 'sofa', biaya: 0, diRumah: true, ket: 'Gratis, suasana kursi ruang tamu' },
    { id: 'tv', nama: 'Depan TV Ruang Santai', varian: 'tv', biaya: 0, diRumah: true, ket: 'Gratis, karpet hangat di depan layar TV' },
    { id: 'mandi', nama: 'Kamar Mandi (Balik Uap)', varian: 'mandi', biaya: 0, diRumah: true, ket: 'Gratis, suasana hangat di balik uap' },
    { id: 'balkon', nama: 'Balkon Malam', varian: 'balkon', biaya: 0, diRumah: true, ket: 'Gratis, angin malam berdua' },
    { id: 'melati', nama: 'Penginapan Melati', varian: 'hotel', biaya: 50000, diRumah: false, ket: 'Privat di luar rumah · Rp50.000' },
    { id: 'hotel3', nama: 'Hotel Bintang 3', varian: 'hotel', biaya: 350000, diRumah: false, ket: 'Nyaman & privat · Rp350.000' },
    { id: 'hotel5', nama: 'Hotel Bintang 5 Mewah', varian: 'hotel', biaya: 1200000, diRumah: false, ket: 'Mewah & romantis · Rp1.200.000' }
  ];
  function bukaPilihLokasiHb(pakaiKondom, targetKode) {
    var kode = String(targetKode || '');
    app.hbKondomTmp = !!pakaiKondom; app.hbTargetTmp = kode;
    var dur = app.hbDurasi || 'long';
    bukaLembar('hbLokasi', kepala('Pilih Durasi & Lokasi HB', 'Tiap lokasi punya suasana animasi berbeda') +
      segTab('hbDurasi', [['short', '⚡ Short Time (45m)'], ['long', '🔥 Long Time + Foreplay (2j)']], dur) +
      '<div class="grid-2">' + LOKASI_HB.map(function (loc) {
        var hargaTeks = loc.biaya ? rupiah(loc.biaya) : 'Gratis';
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag ' + (!loc.diRumah ? 'milik' : '') + '">' + (!loc.diRumah ? '🔒 Privat' : '🏠 Rumah') + '</span></div>' +
          '<b>' + esc(loc.nama) + '</b><small>' + esc(loc.ket) + '</small><div class="ki-harga">' + hargaTeks + '</div></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="hbLokasi:' + loc.id + '|' + (pakaiKondom ? '1' : '0') + '|' + esc(kode) + '">Pilih</button></div></div>';
      }).join('') + '</div>');
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
    var r = DIRI.lakukanHb(S, pakaiKondom, targetKode, lokasiObj, app.hbDurasi || 'long');
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
    app.hadiahTargetJenis = targetJenis; app.hadiahTargetId = targetId;
    var target = targetJenis === 'teman'
      ? (S.teman || []).filter(function (x) { return x.id === targetId; })[0]
      : (S.keluarga || []).filter(function (x) { return x.id === targetId; })[0];
    if (!target) return toast('Penerima tidak ditemukan.', 2000);
    var balikApp = targetJenis === 'teman' ? 'teman' : 'keluarga', thnHad = KAL.tgl(S.hari).y;
    var hKat = app.hadiahKat || 'semua';
    var semuaHad = (DIRI.KATALOG_HADIAH || []).filter(function (it) { return (it.tahun || 2023) <= thnHad; });
    var katsH = [['semua', 'Semua']];
    semuaHad.forEach(function (it) { if (!katsH.some(function (k) { return k[0] === it.kat; })) katsH.push([it.kat, it.kat]); });
    var listHad = semuaHad.filter(function (it) { return hKat === 'semua' || it.kat === hKat; });
    bukaLembar('hadiah', kepala('🎁 Hadiah untuk ' + target.nama, 'Katalog ' + thnHad + ' · Tunai atau Kredit', '<button type="button" class="panah" data-app="' + balikApp + '" aria-label="Kembali">‹</button>') +
      catStrip('hadiahKat', katsH, hKat) +
      '<div class="grid-2">' + listHad.map(function (it) {
        var dpRp = Math.round(it.harga * it.dp / 10000) * 10000;
        var pokok = it.harga - dpRp;
        var angs = Math.round((pokok * (1 + 0.008 * it.tenor) / it.tenor) / 1000) * 1000;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + esc(it.kat) + '</span><span class="ki-tag milik">+' + it.naik + '% ❤️</span></div>' +
          '<b>' + esc(it.nama) + '</b><div class="ki-harga">' + rupiahPendek(it.harga) + '</div>' +
          '<small>DP ' + rupiahPendek(dpRp) + ' · ' + rupiahPendek(angs) + '×' + it.tenor + 'bln</small></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="belikanHadiah:' + targetJenis + '|' + target.id + '|' + it.id + '|0">Tunai</button>' +
          '<button type="button" class="chip-tombol" data-aksi="belikanHadiah:' + targetJenis + '|' + target.id + '|' + it.id + '|1">Kredit</button></div></div>';
      }).join('') + '</div>');
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
  /* ---------- Tutorial Awal Game (Bisa Skip) ---------- */
  var TUTORIAL_LANGKAH = [
    {
      ikon: '🚐',
      judul: 'Selamat Datang di The Driver (2026)!',
      isi: 'Kamu memulai perjalanan hidup di tahun <b>2026</b> dengan modal awal <b>Rp5.000.000</b> (Rp4.850.000 di rekening bank + Rp150.000 tunai di dompet). Narik ojol, naik kelas ke GoCar/GrabCar, lalu bangun armada Travel di seluruh 38 provinsi Indonesia!'
    },
    {
      ikon: '📊',
      judul: 'Pantau 5 Status di Dock Bawah',
      isi: 'Di bagian bawah layar ada 5 bar presisi: <b>Makan/Minum, Stamina, HB, Baterai HP, dan BBM</b>. Ketuk langsung bar mana saja untuk aksi cepat — makan/minum, isi bensin, tidur, atau sambungkan Power Bank.'
    },
    {
      ikon: '📱',
      judul: 'HP = Pusat Semua Aktivitas',
      isi: 'Tekan ikon <b>HP</b> di dock bawah untuk membuka <b>Kendaraan</b> (motor & mobil + upgrade), <b>Driver</b> (Gojek/Grab), <b>Travel & Kas Travel</b> (maks 10 supir), <b>Bank & Dompet Digital</b>, <b>Keluarga</b>, dan <b>Properti</b>.'
    },
    {
      ikon: '🚦',
      judul: 'Kecepatan & Kondisi Jalan Realistis',
      isi: 'Mode normal menyediakan kecepatan <b>Level 1–4</b> yang memperhitungkan kondisi jalan asli (tol, mulus, bergelombang, rusak, tanah) dan cuaca hujan. <b>Level 5 (Top Speed)</b> tergembok 🔒 khusus <b>Mode VVIP</b>.'
    },
    {
      ikon: '📅',
      judul: 'Realisme 2026 & Kehidupan Nyata',
      isi: 'Jaga kesehatan & BPJS, beri nafkah pasangan, dan bayar cicilan tepat waktu. Seluruh katalog <b>HP, motor, mobil, UMK, BBM, bank, dan dompet digital</b> mengikuti kebijakan asli Indonesia tahun 2026.'
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

  /* baris percepatan (gigi) untuk kendaraan sehari-hari: normal 1–4 realistis, Level 5 tergembok 🔒 */
  var seretGigi = false;
  function bukaPopupVvip() {
    bukaLembar('vvip',
      kepala('🔒 Kecepatan Level 5 (Terkunci)', 'Mode VVIP · Top Speed Kendaraan') +
      '<div class="saldo-ringkas" style="background:#4a3a7a"><div><small>Status Level 5</small><b>TERKUNCI 🔒</b></div>' +
      '<div><small>Mode Aktif</small><b>Normal (Lv 1–4)</b></div></div>' +
      '<ul class="daftar angka">' +
      baris('Mode Normal (Aktif)', 'Level 1 – 4 · Kecepatan realistis sesuai kondisi jalan (tol/mulus/rusak/tanah/hujan)') +
      baris('Level 5 (Top Speed)', '🔒 Masih tergembok sementara (khusus Mode VVIP mendatang)') +
      '</ul>' +
      '<div style="margin-top:12px"><button type="button" class="aksi" data-tutup>Mengerti</button></div>' +
      '<p class="catatan">Mode normal membatasi kecepatan hingga Level 4 dengan perhitungan kecepatan asli sesuai kondisi jalan dan cuaca.</p>');
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
  function tombolHiburanRingkas() {
    if (S.hiburan && DIRI.HIBURAN[S.hiburan]) {
      return '<button type="button" class="chip-tombol pilih" data-ojek="hiburan:' + S.hiburan + '">🎬 ' + esc(DIRI.HIBURAN[S.hiburan].nama) + ' 8× ✕</button>';
    }
    return '<button type="button" class="chip-tombol" data-ojek="hiburanMenu">🎬 Santai 8×</button>';
  }
  function bukaHiburan() {
    bukaLembar('hiburan', kepala('🎬 Hiburan Saat Menunggu (8×)', 'Percepat waktu tunggu order / penumpang tanpa menutupi layar') +
      '<div class="grid-2">' + Object.keys(DIRI.HIBURAN).map(function (k) {
        var h = DIRI.HIBURAN[k], akt = S.hiburan === k;
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + (h.gbPerJam ? (h.gbPerJam * 1024).toFixed(0) + ' MB/jam' : 'Hemat Data') + '</span>' + (akt ? '<span class="ki-tag milik">Aktif 8×</span>' : '') + '</div>' +
          '<b>' + esc(h.nama) + '</b><small>Baterai −' + (h.bateraiJam || 6) + '%/jam · Waktu jalan 8×</small></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol' + (akt ? ' bahaya-kecil' : ' pilih') + '" data-diri="hiburan:' + k + '">' + (akt ? 'Hentikan' : 'Mulai 8×') + '</button></div></div>';
      }).join('') + '</div>');
  }
  function panelOjek(paksa) {
    var o = S.ojek, f = OJEK.fase(S), x, jnK = o.mode === 'mobil' ? 'mobil' : 'motor';
    var k = (S.gigiJalan || 2) + '|' + (TRAVEL.vvipAktif(S) ? 'V' : 'N') + '|' + jnK + '|' + (o.mult || 1) + (S.hiburan || '-') + (S.motor ? S.motor.id : '') + (!o.online ? 'off' : o.trip ? 'trip' + o.trip.x.nama + o.trip.x.km + f.status : o.tawaran ? 'tw' + o.tawaran.nama + o.tawaran.km : 'sb' + o.hariIni.trip);
    if (seretGigi || (!paksa && k === panelKunci)) return; panelKunci = k;
    var el = $('ojek-panel'), html = '';
    if (!o.online) { el.innerHTML = ''; return; }
    if (o.trip) {
      if (aksiCepatBuka) { aksiCepatBuka = false; if ($('kos-aksi')) $('kos-aksi').hidden = true; if ($('b-aksi-cepat')) $('b-aksi-cepat').classList.remove('aktif-aksi'); }
      html = '<div class="ojek-bare"><div class="meteran"><i id="ojek-maju"></i></div>' + barisGigi(jnK) + '</div>';
    } else if (o.tawaran) {
      if (aksiCepatBuka) { aksiCepatBuka = false; if ($('kos-aksi')) $('kos-aksi').hidden = true; if ($('b-aksi-cepat')) $('b-aksi-cepat').classList.remove('aktif-aksi'); }
      x = o.tawaran;
      html = '<div class="ojek-kartu tawaran"><b>Order ' + esc(x.layanan) + (x.mobil && x.km >= 80 ? ' [ANTARKOTA 🔥]' : x.jarakJauh ? ' [JAUH 🔥]' : '') + ' · ' + rupiah(x.tarif) + '</b><small>Jemput ' + x.jemput.toLocaleString('id-ID') + ' km · antar ' + x.km.toLocaleString('id-ID') + ' km' + (x.tunai ? ' · Tunai' : ' · QRIS') + ' · bersih <b>' + rupiah(x.bersih) + '</b></small>' +
        '<div class="meteran"><i id="ojek-sisa"></i></div><div class="ojek-tombol"><button type="button" class="chip-tombol" data-ojek="lewati">Lewati</button><button type="button" class="chip-tombol" data-ojek="berhenti">Offline</button><button type="button" class="aksi" data-ojek="ambil">Ambil Order</button></div></div>';
    } else {
      var mO = o.mult || 1, pct = Math.round((mO - 1) * 100), lblT = pct === 0 ? 'Standar' : (pct > 0 ? '+' + pct + '%' : pct + '%');
      var nmOn = jnK === 'mobil' ? (o.platform === 'grab' ? 'GrabCar' : 'GoCar') : OJEK.platform(o.platform).nama;
      html = '<div class="ojek-kartu kecil"><b>Online ' + esc(nmOn) + ' · ' + o.hariIni.trip + ' order (' + rupiahPendek(o.hariIni.bersih) + ')</b><small>' + (OJEK.jarakRumah ? OJEK.jarakRumah(S).toLocaleString('id-ID') : 0) + ' km dari rumah · Tarif ' + lblT + '</small>' +
        barisGigi(jnK) + '<div class="ojek-tombol">' + tombolHiburanRingkas() + '<button type="button" class="chip-tombol" data-ojek="tarif:-0.1">Tarif −</button><button type="button" class="chip-tombol" data-ojek="tarif:0.1">Tarif +</button><button type="button" class="chip-tombol" data-ojek="inapMenu">Istirahat</button><button type="button" class="chip-tombol bahaya-kecil" data-ojek="berhenti">Offline</button></div></div>';
    }
    el.innerHTML = html;
  }
  function aksiOjek(nama) {
    if (nama === 'hiburanMenu') return bukaHiburan();
    if (nama.indexOf('gigi:') === 0) {
      var gn = Math.max(1, Math.min(5, +nama.split(':')[1]));
      if (gn === 5 && !TRAVEL.vvipAktif(S)) { bukaPopupVvip(); panelOjek(true); return; }
      if (gn === 5 && !RUTE.bolehKhususJalan(S)) { toast('Hujan deras: kecepatan dibatasi sampai level 4.', 2200); panelOjek(true); return; }
      S.gigiJalan = gn; simpan(); panelOjek(true); return;
    }
    if (nama.indexOf('tarif:') === 0) { OJEK.ubahTarif(S, +nama.split(':')[1]); simpan(); panelOjek(true); return; }
    if (nama === 'inapMenu') {
      bukaLembar('inapLuar', kepala('Istirahat & Penginapan', 'Pulihkan stamina di luar rumah') +
        '<div class="chip-baris" style="margin-bottom:8px"><button type="button" class="chip-tombol pilih" data-diri="tidurJalan:2">😴 Tidur Pinggir Jalan 2 Jam (Gratis · +28⚡)</button></div>' +
        '<div class="grid-2">' + (DIRI.PENGINAPAN_LUAR || []).map(function (p) {
          return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + p.jam + ' jam</span></div><b>' + esc(p.nama) + '</b><small>' + esc(p.ket) + '</small><div class="ki-harga">' + rupiah(p.harga) + '</div></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="inapLuar:' + p.id + '">Menginap</button></div></div>';
        }).join('') + '</div>');
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
        html = '<div class="ojek-kartu travel kecil"><b>Pool ' + esc(RUTE.nama(T.di)) + ' · ' + T.antri.length + '/' + f.kursi + ' pnp' + (rc ? ' → ' + esc(rc.nama) : '') + '</b><div class="ojek-tombol">' + tombolHiburanRingkas() + '<button type="button" class="aksi" data-trv="berangkat"' + (rc ? '' : ' disabled') + '>Berangkat</button>' + tMini + '</div></div>';
      } else {
        T.antri.forEach(function (p) { chips += '<span class="chip-pnp ' + p.tipe + '">' + ikonTipe(p.tipe) + ' ' + esc(p.nama.split(' ')[0]) + '</span>'; });
        for (var i = T.antri.length; i < f.kursi; i++) chips += '<span class="chip-pnp kosong">○</span>';
        html = '<div class="ojek-kartu travel kecil"><b>Pool travel · ' + esc(RUTE.nama(T.di)) + '</b><small>' +
          (rc ? esc(rc.nama) + ' · ' + rc.km.toLocaleString('id-ID') + ' km · ±' + jamTeks(rc.jam) + (rc.tol ? ' · tol ' + rupiahPendek(rc.tol) : '') + ' · ' + rupiahPendek(rc.tarif) + '/kursi (×' + T.mult.toLocaleString('id-ID') + ')' : 'Pilih kota tujuan terlebih dahulu.') + '</small>' +
          '<div class="pnp-baris">' + chips + '</div>' +
          '<div class="ojek-tombol"><button type="button" class="chip-tombol pilih" data-trv="pilih">Tujuan</button>' + tombolHiburanRingkas() +
          (rc ? '<button type="button" class="chip-tombol" data-trv="tarif:-0.1">Tarif −</button><button type="button" class="chip-tombol" data-trv="tarif:0.1">Tarif +</button>' : '') +
          (rc && T.antri.length < f.kursi && T.jemput < TRAVEL.JEMPUT_MAKS ? '<button type="button" class="chip-tombol" data-trv="jemput">Jemput</button>' : '') +
          '<button type="button" class="chip-tombol" data-trv="henti">Istirahat</button></div>' +
          '<div class="ojek-tombol"><button type="button" class="aksi" data-trv="berangkat"' + (rc ? '' : ' disabled') + '>' + (T.antri.length ? 'Berangkat (' + T.antri.length + ')' : 'Berangkat kosong') + '</button>' +
          (T.di === S.kota ? '<button type="button" class="chip-tombol" data-trv="selesai">Selesai</button>' : '<button type="button" class="chip-tombol" data-trv="selesaiPaksa">Pulang</button>') + tMini + '</div></div>';
      }
    } else if (f.mode === 'kapal') {
      html = '<div class="ojek-kartu travel kecil"><b>⛴️ ' + esc(RUTE.nama(f.dari)) + ' → ' + esc(RUTE.nama(f.ke)) + ' · <span id="trv-kmh"></span></b><small id="trv-info"></small><div class="meteran"><i id="trv-maju"></i></div>' +
        '<div class="ojek-tombol">' + tombolHiburanRingkas() + tMini + '</div></div>';
    } else {
      var vvipT = TRAVEL.vvipAktif(S), valT = vvipT ? Math.min(5, T.gigi || 3) : Math.min(4, T.gigi || 3);
      var gr = '<div class="gigi-slider"><span id="gigi-label">' + labelGigi('mobil', valT) + '</span>' +
        '<input type="range" min="1" max="5" step="1" value="' + valT + '" data-gigi="trv" aria-label="Level kecepatan">' +
        '<button type="button" class="chip-tombol" style="padding:2px 7px;font-size:11px;flex-shrink:0" data-vvip="popup">' + (vvipT ? '🔓 VVIP' : '🔒 Lv5') + '</button>' +
        '<button type="button" class="chip-tombol" style="padding:2px 8px;font-size:11px;flex-shrink:0" data-trv="henti">⛽ Rehat</button></div>';
      html = '<div class="ojek-bare"><div class="meteran"><i id="trv-maju"></i></div>' + gr + '</div>';
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
    var chipF = '<div class="cat-strip">' + FILTER_WIL.map(function (fw) {
      return '<button type="button" class="' + (fw[0] === flt ? 'pilih' : '') + '" data-trv="filter:' + fw[0] + '">' + fw[1] + '</button>';
    }).join('') + '</div>';
    bukaLembar('travelTujuan', kepala('Pilih Tujuan (' + ids.length + ' kota)', 'Dari ' + RUTE.nama(T.di) + ' · tarif ×' + T.mult.toLocaleString('id-ID')) + chipF + (pesan ? '<p class="racik-pesan salah">' + esc(pesan) + '</p>' : '') +
      '<div class="grid-2">' + ids.map(function (x) {
        var rc = x.rc, k = RUTE.kota[x.id];
        var kdLbl = (RUTE.kondisiJalan && RUTE.kondisiJalan[rc.kondisi] && RUTE.kondisiJalan[rc.kondisi].nama) || 'Aspal Mulus';
        var satBbm = S.mobil && S.mobil.bbm === 'listrik' ? 'kWh' : 'L';
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + rc.km.toLocaleString('id-ID') + ' km · ±' + jamTeks(rc.jam) + '</span>' + (rc.laut ? '<span class="ki-tag">⛴️</span>' : '') + '</div>' +
          '<b>' + esc(k.nama) + '</b><small>' + esc(kdLbl) + ' · ±' + Math.round(rc.liter) + satBbm + (rc.tol ? ' · Tol ' + rupiahPendek(rc.tol) : '') + '</small>' +
          '<div class="ki-harga">' + rupiah(rc.tarif) + '/kursi</div></div>' +
          '<div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-trv="tujuan:' + x.id + '">Pilih Tujuan</button></div></div>';
      }).join('') + '</div>');
  }
  function bukaHentiTravel(pesan) {
    var T = S.travel, m = S.mobil, I = RUTE.istirahat, di = S.diri, jalan = T.status === 'jalan' || T.status === 'kapal', evT = !!(m && m.bbm === 'listrik');
    bukaLembar('travelHenti', kepala(jalan ? 'Rest Area & BBM' : 'Istirahat Pool', 'Pukul ' + jam(S.menit)) + (pesan ? '<p class="racik-pesan salah">' + esc(pesan) + '</p>' : '') +
      '<div class="stat-grid-2"><div class="stat-box"><small>Makan · Minum</small><b>' + Math.round(di.kenyang) + '% · ' + Math.round(di.minum) + '%</b></div>' +
      '<div class="stat-box"><small>Stamina · ' + (evT ? 'EV' : 'BBM') + '</small><b>' + Math.round(di.stamina) + '% · ' + Math.round((m ? m.isi : 0) * 100) + '%</b></div></div>' +
      '<div class="kartu-item" style="margin-bottom:8px"><div><span class="ki-tag">Kas Travel</span><b>' + (evT ? '⚡ Cas SPKLU Mobil Listrik' : '⛽ Isi BBM ' + (m ? esc(N.bbm.nama[m.bbm] || m.bbm) : '')) + '</b></div>' +
      '<div class="ki-aksi"><button type="button" class="chip-tombol" data-trv="bbm:10">+10 ' + (evT ? 'kWh' : 'L') + '</button><button type="button" class="chip-tombol pilih" data-trv="bbm:penuh">Isi Penuh</button></div></div>' +
      '<div class="grid-2">' + Object.keys(I).map(function (k) {
        var x = I[k], ket = (x.biaya ? rupiah(x.biaya) : 'Gratis') + ' · ' + (x.menit >= 60 ? (x.menit / 60) + ' jam' : x.menit + 'm');
        return '<div class="kartu-item"><div><span class="ki-tag">' + ket + '</span><b>' + esc(x.nama) + '</b></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-trv="isti:' + k + '">Pilih</button></div></div>';
      }).join('') + '</div>');
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
    var html = kepalaApp('Travel Antarkota', T.aktif ? 'Sedang di ' + kota : 'Pool ' + kota) +
      segTab('travelTab', [['sendiri', '🚐 Travel'], ['rute', '🗺️ Tarif & Rute'], ['supir', '👨‍✈️ Supir (' + (T.supir ? T.supir.length : 0) + ')']], tab) + pesanApp();
    if (tab === 'supir') {
      var listMblP = TRAVEL.daftarMobilPenumpang ? TRAVEL.daftarMobilPenumpang(S) : [];
      if (!listMblP.length) {
        return html + '<p class="racik-pesan salah">Butuh mobil penumpang (MPV/SUV/Sedan) di Dealer Mobil / Agen Bekas untuk merekrut Supir Travel.</p>' +
          '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-app="dealerMobil">Dealer Mobil</button><button type="button" class="chip-tombol" data-app="agenBekas">Agen Bekas</button></div>';
      }
      var aktIdxM = S.mobilAktif || 0, cadanganList = listMblP.filter(function (x) { return x.idx !== aktIdxM; });
      var perB = app.spPerBaru || 'bulan', defGp = perB === 'jalan' ? 150000 : perB === 'minggu' ? 900000 : 3500000;
      var daftarRuteSp = TRAVEL.ruteUntukSupir ? TRAVEL.ruteUntukSupir(S) : [];
      var totQrisSp = TRAVEL.totalQrisSupir ? TRAVEL.totalQrisSupir(S) : 0;
      html += '<div class="stat-grid-2"><div class="stat-box"><small>Supir Aktif · Kas</small><b>' + (T.supir ? T.supir.length : 0) + '/' + (TRAVEL.MAKS_SUPIR || 10) + ' · ' + rupiahPendek(T.kas || 0) + '</b></div>' +
        '<div class="stat-box"><small>QRIS Supir · Mobil Utama</small><b>' + rupiahPendek(totQrisSp) + ' · ' + esc(m ? m.nama.split(' ')[0] : '-') + '</b></div></div>' +
        '<div class="cat-strip"><button type="button" class="pilih" data-app="qriskaryawan">📲 QRIS Supir</button><button type="button" data-app="kastravel">💼 Kas Travel</button></div>';
      if (T.supir && T.supir.length) {
        html += T.supir.map(function (sp) {
          var puas = TRAVEL.kepuasanSupir(S, sp), mSpInfo = TRAVEL.mobilUntukSupir ? TRAVEL.mobilUntukSupir(S, sp) : null;
          var ruteAkt = sp.ruteId && sp.ruteId !== 'otomatis' && RUTE.kota[sp.ruteId] ? sp.ruteId : 'otomatis';
          var ruteAktNama = ruteAkt === 'otomatis' ? 'Otomatis' : RUTE.nama(ruteAkt);
          var sldQris = Math.max(0, Math.round(sp.qrisSaldo || 0));
          return '<div class="kartu-item" style="margin-bottom:7px"><div class="ki-top"><span class="ki-tag ' + (sp.aktif ? 'milik' : '') + '">' + (sp.aktif ? 'Narik' : 'Libur') + '</span><span class="ki-tag">Puas ' + puas + '%</span></div>' +
            '<b>👨‍✈️ ' + esc(sp.nama) + ' (' + esc(sp.sim) + ' · ★' + sp.rating + ')</b>' +
            '<small>' + esc(mSpInfo ? mSpInfo.mobil.nama : '-') + ' · Rute: ' + esc(ruteAktNama) + ' · QRIS ' + rupiahPendek(sldQris) + '</small>' +
            '<div class="chip-baris">' + (sldQris > 0 ? '<button type="button" class="chip-tombol pilih" data-aksi="tarikQrisSupir:' + sp.id + '">Tarik ' + rupiahPendek(sldQris) + '</button>' : '') +
            '<button type="button" class="chip-tombol" data-aksi="spAktif:' + sp.id + '">' + (sp.aktif ? 'Liburkan' : 'Aktifkan') + '</button>' +
            '<button type="button" class="chip-tombol bahaya-kecil" data-aksi="spPecat:' + sp.id + '">Pecat</button></div>' +
            '<details class="kartu-lipat"><summary>⚙️ Atur Mobil, Rute & Gaji</summary>' +
            '<div class="chip-baris">' + listMblP.map(function (xm) {
              var dip = mSpInfo && mSpInfo.idx === xm.idx, milikKamu = cadanganList.length > 0 && xm.idx === aktIdxM;
              return '<button type="button" class="chip-tombol' + (dip ? ' pilih' : '') + '"' + (milikKamu ? ' disabled style="opacity:.5"' : '') + ' data-aksi="spMobil:' + sp.id + '|' + xm.idx + '">' + (xm.idx + 1) + '. ' + esc(xm.mobil.nama.split(' ').slice(0, 2).join(' ')) + (xm.idx === aktIdxM ? ' ★' : '') + '</button>';
            }).join('') + '</div>' +
            '<select id="in-sp-rute-' + esc(sp.id) + '" class="input-teks" style="margin:5px 0"><option value="otomatis"' + (ruteAkt === 'otomatis' ? ' selected' : '') + '>🎲 Rute Otomatis</option>' +
            daftarRuteSp.map(function (rt) { return '<option value="' + rt.id + '"' + (ruteAkt === rt.id ? ' selected' : '') + '>' + esc(rt.nama) + ' (' + rt.km + ' km · ' + rupiahPendek(rt.tarif) + ')</option>'; }).join('') + '</select>' +
            segTab('spPeriode', [['jalan', 'Per Jalan'], ['minggu', 'Mingguan'], ['bulan', 'Bulanan']].map(function (pr) { return [sp.id + '|' + pr[0], pr[1]]; }), sp.id + '|' + sp.periode) +
            '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin-top:4px">' +
            '<div><small>Pokok</small><input id="in-sp-gp-' + esc(sp.id) + '" class="input-teks" type="number" step="50000" min="0" style="margin:2px 0 0;padding:6px" value="' + (sp.gajiPokok || 0) + '"></div>' +
            '<div><small>Makan/hr</small><input id="in-sp-um-' + esc(sp.id) + '" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0;padding:6px" value="' + (sp.uangMakan || 0) + '"></div>' +
            '<div><small>Insentif</small><input id="in-sp-ins-' + esc(sp.id) + '" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0;padding:6px" value="' + (sp.insentif || 0) + '"></div></div>' +
            '<div class="chip-baris" style="margin-top:6px"><button type="button" class="chip-tombol pilih" data-aksi="spSimpan:' + sp.id + '">💾 Simpan</button><button type="button" class="chip-tombol' + (sp.bpjs ? ' pilih' : '') + '" data-aksi="spBpjs:' + sp.id + '">' + (sp.bpjs ? 'BPJS ✓' : '+ BPJS') + '</button></div></details></div>';
        }).join('');
      }
      var defMobBaru = (app.spMobilBaru != null && listMblP.some(function (x) { return x.idx === app.spMobilBaru && (!cadanganList.length || x.idx !== aktIdxM); })) ? app.spMobilBaru : (cadanganList.length ? cadanganList[0].idx : listMblP[0].idx);
      app.spMobilBaru = defMobBaru;
      var defRuteBaru = app.spRuteBaru || 'otomatis';
      html += '<details class="kartu-lipat"' + (!(T.supir && T.supir.length) ? ' open' : '') + '><summary>➕ Rekrut Supir Baru (' + ((T.pelamar && T.pelamar.length) || 0) + ' pelamar)</summary>' +
        (cadanganList.length ? '<div class="chip-baris">' + cadanganList.map(function (xm) { return '<button type="button" class="chip-tombol' + (defMobBaru === xm.idx ? ' pilih' : '') + '" data-aksi="spMobilBaru:' + xm.idx + '">' + (xm.idx + 1) + '. ' + esc(xm.mobil.nama.split(' ').slice(0, 2).join(' ')) + '</button>'; }).join('') + '</div>' : '') +
        '<select id="in-spnew-rute" class="input-teks" style="margin:5px 0"><option value="otomatis"' + (defRuteBaru === 'otomatis' ? ' selected' : '') + '>🎲 Rute Otomatis</option>' +
        daftarRuteSp.map(function (rt) { return '<option value="' + rt.id + '"' + (defRuteBaru === rt.id ? ' selected' : '') + '>' + esc(rt.nama) + ' (' + rt.km + ' km)</option>'; }).join('') + '</select>' +
        segTab('spPerBaru', [['jalan', 'Per Jalan'], ['minggu', 'Mingguan'], ['bulan', 'Bulanan']], perB) +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;margin:4px 0">' +
        '<div><small>Pokok</small><input id="in-spnew-gp" class="input-teks" type="number" step="50000" min="0" style="margin:2px 0 0;padding:6px" value="' + defGp + '"></div>' +
        '<div><small>Makan/hr</small><input id="in-spnew-um" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0;padding:6px" value="40000"></div>' +
        '<div><small>Insentif</small><input id="in-spnew-ins" class="input-teks" type="number" step="5000" min="0" style="margin:2px 0 0;padding:6px" value="25000"></div></div>' +
        '<div class="chip-baris" style="margin-bottom:6px"><button type="button" class="chip-tombol' + (app.spBpjsBaru ? ' pilih' : '') + '" data-aksi="spBpjsBaru:1">' + (app.spBpjsBaru ? 'BPJS: Ya ✓' : 'BPJS: Tidak') + '</button></div>' +
        '<div class="grid-2">' + (T.pelamar || []).map(function (pl) {
          return '<div class="kartu-item"><div><span class="ki-tag">' + esc(pl.sim) + ' · ★' + pl.rating + '</span><b>' + esc(pl.nama) + '</b><small>' + pl.pengalaman + ' thn pengalaman</small></div><div class="ki-aksi"><button type="button" class="chip-tombol pilih" data-aksi="spRekrut:' + pl.id + '">Rekrut</button></div></div>';
        }).join('') + '</div></details>';
      return html;
    }
    if (tab === 'rute') {
      var daf = Object.keys(RUTE.kota).filter(function (id) { return id !== asal && cocokFilterWil(RUTE.kota[id], flt); }).map(function (id) { var j = RUTE.jalur(asal, id); return j ? { id: id, j: j } : null; }).filter(Boolean);
      daf.sort(function (a, b) { return a.j.km - b.j.km; });
      return html + catStrip('trvFilter', FILTER_WIL, flt) + '<div class="grid-2">' + daf.map(function (x) {
        var k = RUTE.kota[x.id], r0 = x.j.ruas[0], kd = RUTE.infoKondisi ? RUTE.infoKondisi(r0) : { nama: 'Mulus' };
        return '<div class="kartu-item"><div><div class="ki-top"><span class="ki-tag">' + x.j.km.toLocaleString('id-ID') + ' km</span><span class="ki-tag">' + (x.j.laut ? '⛴️ Feri' : esc(kd.nama.split(' ')[0])) + '</span></div>' +
          '<b>' + esc(k.nama) + '</b><small>' + esc(k.prov || k.pulau) + (x.j.tol ? ' · Tol ' + rupiahPendek(x.j.tol) : '') + '</small>' +
          '<div class="ki-harga">' + rupiahPendek(RUTE.tarifStandar(x.j, m)) + '/kursi</div></div></div>';
      }).join('') + '</div>';
    }
    /* tab === 'sendiri' (super ringkas & fokus langsung jalan!) */
    var klsTrv = (m && RUTE.labelKelasLayanan) ? RUTE.labelKelasLayanan(m) : '';
    return html + '<div class="kartu-hero" style="background:linear-gradient(135deg,#3e2c82,#6a4fd8)"><small>Armada Aktif · ' + (m ? esc(klsTrv) : 'Belum ada mobil') + '</small><b>' + (m ? esc(m.nama) : 'Beli mobil penumpang dulu') + '</b></div>' +
      '<div class="stat-grid-2">' +
      '<div class="stat-box"><small>Kursi · Rating</small><b>' + (m ? TRAVEL.kursi(S) + ' pnp' : '—') + ' · ★' + T.rating.toLocaleString('id-ID') + '</b></div>' +
      '<div class="stat-box"><small>Saldo Kas Travel</small><b>' + rupiahPendek(T.kas || 0) + '</b></div>' +
      '<div class="stat-box"><small>Hari Ini</small><b>' + T.hariIni.trip + ' trip · ' + rupiahPendek(T.hariIni.bersih) + '</b></div>' +
      '<div class="stat-box"><small>Total Travel</small><b>' + T.total.trip + ' trip · ' + rupiahPendek(T.total.bersih) + '</b></div></div>' +
      (T.aktif ? '<p class="catatan">Travel sedang berjalan. Tutup HP untuk melanjutkan.</p>' : e ? '<p class="racik-pesan salah">' + esc(e) + '</p>' :
        '<div style="margin:10px 0"><button type="button" class="aksi" data-aksi="mulaiTravel:1">🚐 Mulai Travel dari ' + esc(kota) + '</button></div>') +
      '<div class="cat-strip"><button type="button" data-app="kastravel">💼 Kas Travel</button><button type="button" data-app="qriskaryawan">📲 QRIS Supir</button><button type="button" data-vvip="popup">🔒 Lv 5 VVIP</button></div>';
  }
  function tidurMalam() {
    var mulai = S.menit, t = DIRI.tidur(S, Math.min(S.menit, 1439), S.diri.bangun);
    S.tidurAnim = true; setTimeout(function () { S.tidurAnim = false; }, 1600);
    gelapSebentar();
    besok(t.bangunEf || S.diri.bangun);
    toast('Tidur ' + t.jam.toFixed(1).replace('.', ',') + ' jam' + (t.gelisah ? ' (gelisah karena Bar HB penuh, bangun +30 mnt & stamina kurang maksimal).' : t.ac ? ' pakai AC.' : ', AC mati karena token habis, kurang nyenyak.'), 3000);
  }
  var kosLainnya = false;
  function isiKosAksi() {
    var diKos = S.diri.posisi === 'kos', ojek = !!(S.ojek && S.ojek.online), trv = !!(S.travel && S.travel.aktif);
    var malam = S.fase === 'malam' || (S.menit % 1440) >= 1080 || !!S.usaha.berhentiSewa, ada = function (id) { return DIRI.punya(S, id); };
    var bisaNarikKos = MOTOR.siapPakai(S) && N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    var bisaCarKos = MOBIL.siapPakai(S) && !MOBIL.pikap(S);
    var tombol = [], lain = [];
    if (!diKos) {
      var sedangTunggu = (ojek && !S.ojek.trip && !S.ojek.tawaran) || (trv && S.travel.status === 'tunggu');
      if (!ojek && !trv) {
        if (bisaNarikKos) tombol.push(['narik:1', '🛵 Narik Ojol']);
        if (bisaCarKos) tombol.push(['gocar:1', '🚗 GoCar'], ['travel:1', '🚐 Travel']);
        tombol.push(['pulang:1', '🏠 Pulang']);
      }
      tombol.push(['app:makan', '🍽️ Makan'], ['bensinHud:1', '⛽ Isi BBM']);
      tombol.push(['autoMakan:1', S.autoMakanMinum ? '✓ Auto Makan' : 'Auto Makan'], ['promoKedai:1', S.promoAktif ? '✓ Promo' : '📢 Promo']);
      if (sedangTunggu) {
        Object.keys(DIRI.HIBURAN || {}).forEach(function (hk) {
          tombol.push(['hiburan:' + hk, (S.hiburan === hk ? '✓ ' : '🎬 ') + DIRI.HIBURAN[hk].nama]);
        });
      }
      $('kos-aksi').innerHTML = tombol.map(function (x) {
        var isAkt = x[1].indexOf('✓ ') === 0;
        return '<button type="button" class="chip-tombol' + (isAkt ? ' pilih' : '') + '" data-diri="' + x[0] + '">' + esc(x[1]) + '</button>';
      }).join('');
      return;
    }
    var masak = ada('ricecooker') || ada('kompor');
    var rtAktif = S.rumahTangga && (S.rumahTangga.aktifSampai || -1) >= S.hari;
    var pas = DIRI.pasanganAktif(S);
    if (bisaNarikKos) tombol.push(['narik:1', '🛵 Ojol']);
    if (bisaCarKos) tombol.push(['gocar:1', '🚗 GoCar'], ['travel:1', '🚐 Travel']);
    tombol.push(['app:makan', '🍽️ Makan']);
    if (pas && pas.lokasi !== 'kedai') {
      var kdm = (S.kesehatan && S.kesehatan.kondom) || 0;
      tombol.push([kdm > 0 ? 'hb:1' : 'hb:0', '❤️ HB']);
      lain.push(['ciuman:' + pas.id, '💋 Ciuman'], ['foreplay:' + pas.id, '🔥 Foreplay']);
    }
    tombol.push(['tidurMalam:1', '😴 Tidur']);
    tombol.push(['autoMakan:1', S.autoMakanMinum ? '✓ Auto Makan' : 'Auto Makan'], ['promoKedai:1', S.promoAktif ? '✓ Promo' : '📢 Promo']);
    lain.push(['istirahat:olahraga', '🏃 Olahraga']);
    if ((S.diri.hb || 0) >= 15) lain.push(['meTime:1', 'Me time']);
    if (rtAktif) lain.push(['makanRumah:1', 'Makan Rumah']);
    if (masak) lain.push(['makan:masak', 'Masak']);
    if (DIRI.adaKonsol(S)) lain.push(['istirahat:ps', 'Main PS']);
    if (ada('tv')) lain.push(['istirahat:tv', 'Nonton TV']);
    if (!malam) lain.push(['istirahat:tidurSiang', 'Tidur Siang']);
    if (malam) lain.push(['bangun:-60', 'Bangun −1j'], ['bangun:60', 'Bangun +1j']);
    if (lain.length) tombol.push(['lainnya:1', kosLainnya ? 'Ringkas ▴' : 'Lainnya ▾']);
    if (kosLainnya) tombol = tombol.concat(lain);
    $('kos-aksi').innerHTML = tombol.map(function (x) {
      var isAkt2 = x[1].indexOf('✓ ') === 0;
      return '<button type="button" class="chip-tombol' + (isAkt2 ? ' pilih' : '') + '" data-diri="' + x[0] + '">' + esc(x[1]) + '</button>';
    }).join('');
  }
  function aksiDiri(nama, nilai) {
    var r;
    if (nama !== 'lainnya' && nama !== 'bangun') {
      aksiCepatBuka = false;
      if ($('kos-aksi')) $('kos-aksi').hidden = true;
      if ($('b-aksi-cepat')) $('b-aksi-cepat').classList.remove('aktif-aksi');
    }
    if (nama === 'hiburan') { tutupLembar(); return aksiOjek('hiburan:' + nilai); }
    if (nama === 'tidurJalan') { tutupLembar(); return tidurJalan(+nilai); }
    if (nama === 'bensinHud') { tutupLembar(); return popupBensin(); }
    if (nama === 'promoKedai') { S.promoAktif = !S.promoAktif; simpan(); perbaruiHUD(true); perbaruiAksi(); toast(S.promoAktif ? 'Promo aktif!' : 'Promo dimatikan.'); return; }
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
  /* potret wajah vektor 100% SVG bergaya tampan/cantik dengan kustomisasi kulit, rambut, mata, mulut */
  function fotoWajah(src, ukuran, bingkai, nama, gender, usia, peran, tampil) {
    var gChar = gender || (/pemain/.test(src) ? 'cowok' : 'cewek');
    var isAnak = peran === 'anak' || /anak/.test(src) || (usia != null && usia < 12);
    var jenis = isAnak ? 'anak' : (gChar === 'cowok' ? 'cowok' : 'cewek');
    var h = 0, nm = String(nama || src || '');
    for (var i = 0; i < nm.length; i++) h = ((h * 31) + nm.charCodeAt(i)) >>> 0;
    var K = N.karakterOpsi || {};
    var klList = K.kulit || [{ id: 'kuning', hex: '#f5cb9f', bayang: '#d9a473' }];
    var wrList = K.warnaRambut || [{ id: 'hitam', hex: '#1c1817', kilau: '#3e3533' }];
    var rcList = K.rambutCowok || [{ id: 'rapi' }];
    var rpList = K.rambutCewek || [{ id: 'panjang' }];
    var mtList = K.mata || [{ id: 'cerah' }];
    var mlList = K.mulut || [{ id: 'senyum' }];
    var tp = tampil || {
      kulit: klList[h % Math.min(4, klList.length)].id,
      warnaRambut: wrList[h % Math.min(3, wrList.length)].id,
      rambut: jenis === 'cowok' ? rcList[h % (rcList.length - 1)].id : rpList[h % (rpList.length - 1)].id,
      mata: mtList[h % Math.min(4, mtList.length)].id,
      mulut: mlList[h % Math.min(4, mlList.length)].id
    };
    var klObj = klList.filter(function (x) { return x.id === tp.kulit; })[0] || klList[1] || klList[0];
    var wrObj = wrList.filter(function (x) { return x.id === tp.warnaRambut; })[0] || wrList[0];
    var kulit = klObj.hex, bayang = klObj.bayang || '#c89268', rambut = wrObj.hex, kilau = wrObj.kilau || '#473c39';
    var bajuCwk = ['#1b6b63', '#235789', '#2b3a55', '#3c5a4b', '#4d3b68'];
    var bajuCwkP = ['#c94872', '#d46b53', '#6d4c8c', '#1f7a72', '#b84b62'];
    var bgCwk = ['#d6ece9', '#d7e6f5', '#e2ebd9', '#e6e0f2'];
    var bgCwkP = ['#fce2ea', '#fde8d8', '#eee3f7', '#daf0ec'];
    var baju = jenis === 'cowok' ? bajuCwk[h % bajuCwk.length] : bajuCwkP[h % bajuCwkP.length];
    var bg = jenis === 'cowok' ? bgCwk[h % bgCwk.length] : bgCwkP[h % bgCwkP.length];
    var gayaR = tp.rambut || (jenis === 'cowok' ? 'rapi' : 'panjang');
    var gayaM = tp.mata || 'cerah', gayaB = tp.mulut || 'senyum';
    var hairBack = '', hairFront = '', bajuSvg = '';
    /* latar lembut & bahu/baju modern */
    if (jenis === 'cowok') {
      bajuSvg = '<path d="M9 64c2-11 10-16 23-16s21 5 23 16z" fill="' + baju + '"/><path d="M24 49l8 8 8-8" fill="#fff" opacity=".92"/><path d="M26 48l6 6 6-6" fill="' + kulit + '"/>';
    } else if (gayaR === 'hijab') {
      bajuSvg = '<path d="M8 64c2-13 11-18 24-18s22 5 24 18z" fill="' + baju + '"/><path d="M16 42c1 10 6 19 16 22 10-3 15-12 16-22z" fill="' + baju + '" opacity=".88"/>';
    } else {
      bajuSvg = '<path d="M11 64c2-11 9-15 21-15s19 4 21 15z" fill="' + baju + '"/><path d="M25 49q7 6 14 0" fill="' + kulit + '"/>';
    }
    /* rambut belakang */
    if (isAnak) {
      hairBack = '<circle cx="17" cy="24" r="6" fill="' + rambut + '"/><circle cx="47" cy="24" r="6" fill="' + rambut + '"/>';
    } else if (jenis === 'cowok') {
      if (gayaR === 'gondrong') hairBack = '<path d="M15 28c-2 10-1 19 3 23h28c4-4 5-13 3-23-3-10-9-16-17-16s-14 6-17 16z" fill="' + rambut + '"/>';
      else if (gayaR === 'ikal') hairBack = '<circle cx="20" cy="20" r="7" fill="' + rambut + '"/><circle cx="32" cy="15" r="8" fill="' + rambut + '"/><circle cx="44" cy="20" r="7" fill="' + rambut + '"/>';
    } else {
      if (gayaR === 'hijab') hairBack = '<path d="M13 34c0-14 8-23 19-23s19 9 19 23c0 12-4 22-7 28H20c-3-6-7-16-7-28z" fill="' + baju + '"/><path d="M16 33c0-11 7-19 16-19s16 8 16 19" fill="none" stroke="rgba(255,255,255,.32)" stroke-width="1.4"/>';
      else if (gayaR === 'gelombang') hairBack = '<path d="M12 31c-2 12 2 22 6 27h28c4-5 8-15 6-27-2-12-9-20-20-20S14 19 12 31z" fill="' + rambut + '"/><circle cx="14" cy="43" r="5" fill="' + rambut + '"/><circle cx="50" cy="43" r="5" fill="' + rambut + '"/>';
      else if (gayaR === 'bob') hairBack = '<path d="M13 30c-1 9 2 16 6 19h26c4-3 7-10 6-19-2-11-8-18-19-18S15 19 13 30z" fill="' + rambut + '"/>';
      else if (gayaR === 'kuncir') hairBack = '<path d="M43 22c8-2 13 6 11 18-3-4-6-6-10-6z" fill="' + rambut + '"/><circle cx="44" cy="22" r="2.6" fill="#f2a516"/>';
      else hairBack = '<path d="M13 31c-1 13 1 22 5 28h28c4-6 6-15 5-28-2-12-8-20-19-20S15 19 13 31z" fill="' + rambut + '"/>';
    }
    /* leher, telinga, kontur wajah tampan/cantik */
    var wajahSvg = '<rect x="27.5" y="42" width="9" height="9" rx="4" fill="' + bayang + '"/>' +
      (gayaR !== 'hijab' ? '<circle cx="18.5" cy="34" r="3" fill="' + kulit + '"/><circle cx="45.5" cy="34" r="3" fill="' + kulit + '"/>' : '') +
      (jenis === 'cowok'
        ? '<path d="M19 30c0-9 5.5-15 13-15s13 6 13 15c0 9-4 15.5-13 16.5C23 45.5 19 39 19 30z" fill="' + kulit + '"/>'
        : '<path d="M19.5 31c0-9 5.5-15 12.5-15s12.5 6 12.5 15c0 8.5-4.8 14.8-12.5 15.5-7.7-.7-12.5-7-12.5-15.5z" fill="' + kulit + '"/>') +
      '<ellipse cx="24" cy="37.5" rx="3" ry="1.6" fill="#e87a82" opacity="' + (jenis === 'cowok' ? '.22' : '.36') + '"/>' +
      '<ellipse cx="40" cy="37.5" rx="3" ry="1.6" fill="#e87a82" opacity="' + (jenis === 'cowok' ? '.22' : '.36') + '"/>' +
      '<path d="M31.6 33.5l-.6 3.6q1 .7 2 0" fill="none" stroke="' + bayang + '" stroke-width="1.15" stroke-linecap="round"/>';
    /* mata berbinar & alis rapi */
    var alisW = jenis === 'cowok' ? '1.7' : '1.2';
    var mataSvg = '<path d="M23 29.2q3.2-1.8 6.2-.4M34.8 28.8q3-1.4 6.2.4" fill="none" stroke="' + rambut + '" stroke-width="' + alisW + '" stroke-linecap="round"/>';
    if (gayaM === 'sipit') {
      mataSvg += '<path d="M23.5 33.4q2.8-1.6 5.5 0M35 33.4q2.8-1.6 5.5 0" fill="none" stroke="#1e1513" stroke-width="1.8" stroke-linecap="round"/>' +
        '<circle cx="26.2" cy="33.4" r="1.4" fill="#1e1513"/><circle cx="37.8" cy="33.4" r="1.4" fill="#1e1513"/><circle cx="26.7" cy="32.9" r=".5" fill="#fff"/><circle cx="38.3" cy="32.9" r=".5" fill="#fff"/>';
    } else if (gayaM === 'tajam') {
      mataSvg += '<path d="M23 32.5l6 .9-1.2 1.8-4-.4zM41 32.5l-6 .9 1.2 1.8 4-.4z" fill="#fff"/>' +
        '<circle cx="26.3" cy="33.6" r="1.8" fill="#231815"/><circle cx="37.7" cy="33.6" r="1.8" fill="#231815"/>' +
        '<path d="M22.8 32.3l6.5.9M41.2 32.3l-6.5.9" stroke="#1b1311" stroke-width="1.5" stroke-linecap="round"/>' +
        '<circle cx="26.9" cy="33" r=".65" fill="#fff"/><circle cx="38.3" cy="33" r=".65" fill="#fff"/>';
    } else if (gayaM === 'lembut') {
      mataSvg += '<ellipse cx="26.2" cy="33.5" rx="2.7" ry="2.2" fill="#fff"/><ellipse cx="37.8" cy="33.5" rx="2.7" ry="2.2" fill="#fff"/>' +
        '<circle cx="26.2" cy="33.7" r="1.9" fill="#3a251d"/><circle cx="37.8" cy="33.7" r="1.9" fill="#3a251d"/>' +
        '<circle cx="26.8" cy="33" r=".7" fill="#fff"/><circle cx="38.4" cy="33" r=".7" fill="#fff"/>' +
        '<path d="M23.4 32.4q2.8-1.5 5.6 0M35 32.4q2.8-1.5 5.6 0" fill="none" stroke="#1e1513" stroke-width="1.3" stroke-linecap="round"/>';
    } else {
      mataSvg += '<ellipse cx="26.2" cy="33.4" rx="2.9" ry="2.5" fill="#fff"/><ellipse cx="37.8" cy="33.4" rx="2.9" ry="2.5" fill="#fff"/>' +
        '<circle cx="26.3" cy="33.5" r="2.05" fill="#221714"/><circle cx="37.7" cy="33.5" r="2.05" fill="#221714"/>' +
        '<circle cx="27" cy="32.7" r=".75" fill="#fff"/><circle cx="38.4" cy="32.7" r=".75" fill="#fff"/>' +
        '<circle cx="25.6" cy="34.2" r=".4" fill="#fff" opacity=".75"/><circle cx="37" cy="34.2" r=".4" fill="#fff" opacity=".75"/>' +
        '<path d="M23 32.2q3.2-1.8 6.2-.2M34.8 32q3-1.6 6.2.2" fill="none" stroke="#1b1311" stroke-width="' + (jenis === 'cewek' ? '1.6' : '1.3') + '" stroke-linecap="round"/>';
    }
    if (gayaM === 'kacamata') {
      mataSvg += '<rect x="21.5" y="30.4" width="9.2" height="6.2" rx="2.3" fill="rgba(255,255,255,.18)" stroke="#2c353d" stroke-width="1.3"/>' +
        '<rect x="33.3" y="30.4" width="9.2" height="6.2" rx="2.3" fill="rgba(255,255,255,.18)" stroke="#2c353d" stroke-width="1.3"/>' +
        '<path d="M30.7 33.2h2.6" stroke="#2c353d" stroke-width="1.3"/>';
    }
    /* mulut & bibir natural */
    var wrnBibir = jenis === 'cowok' ? '#b3665d' : '#d65a6e';
    var mulutSvg = gayaB === 'lebar' ? '<path d="M27.2 39.6q4.8 4.4 9.6 0z" fill="#fff" stroke="' + wrnBibir + '" stroke-width="1.2" stroke-linejoin="round"/>'
      : gayaB === 'kalem' ? '<path d="M28.6 40.3q3.4 1.3 6.8 0" fill="none" stroke="' + wrnBibir + '" stroke-width="1.5" stroke-linecap="round"/>'
      : gayaB === 'smirk' ? '<path d="M28.5 40.6q4 .6 7.4-1.5" fill="none" stroke="' + wrnBibir + '" stroke-width="1.55" stroke-linecap="round"/>'
      : gayaB === 'mungil' ? '<path d="M29.4 40.2q2.6 2 5.2 0" fill="none" stroke="' + wrnBibir + '" stroke-width="1.8" stroke-linecap="round"/>'
      : '<path d="M27.6 39.8q4.4 3.4 8.8 0" fill="none" stroke="' + wrnBibir + '" stroke-width="1.6" stroke-linecap="round"/>';
    /* rambut depan & highlight */
    if (jenis === 'cowok') {
      if (gayaR === 'koma') hairFront = '<path d="M18 30c0-11 6-17 14-17s14 6 14 17c-2-5-5-8-9-9-1 4-4 6-6 6 2-2 2-5 1-7-5 0-10 4-14 10z" fill="' + rambut + '"/><path d="M24 19q7-3 14 0" stroke="' + kilau + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
      else if (gayaR === 'undercut') hairFront = '<path d="M19 26c1-9 6-14 13-14s12 5 13 14c-3-4-7-6-13-6s-10 2-13 6z" fill="' + rambut + '"/><path d="M25 16q7-2 14 1" stroke="' + kilau + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
      else if (gayaR === 'ikal') hairFront = '<path d="M18 28c0-9 6-15 14-15s14 6 14 15c-3-3-5-5-8-5-2 2-6 2-8 0-3 0-6 2-12 5z" fill="' + rambut + '"/>';
      else if (gayaR === 'gondrong') hairFront = '<path d="M17 32c0-12 6-19 15-19s15 7 15 19c-3-6-7-10-12-11-4 4-9 5-18 11z" fill="' + rambut + '"/>';
      else if (gayaR === 'peci') hairFront = '<path d="M18 27c0-7 6-11 14-11s14 4 14 11c-4-3-9-4-14-4s-10 1-14 4z" fill="' + rambut + '"/><rect x="18" y="10" width="28" height="12" rx="3" fill="#17191d"/><path d="M20 14h24" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>';
      else hairFront = '<path d="M18 29c0-11 6-16 14-16s14 5 14 16c-3-5-8-8-14-8-5 0-9 2-14 8z" fill="' + rambut + '"/><path d="M23 19q8-3 15 0" stroke="' + kilau + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    } else if (gayaR === 'hijab') {
      hairFront = '<path d="M18.5 31c0-9.5 6-16 13.5-16s13.5 6.5 13.5 16c0-6-5-11-13.5-11s-13.5 5-13.5 11z" fill="' + baju + '"/><path d="M19 32c0-8 5.5-13 13-13s13 5 13 13" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/>';
    } else if (gayaR === 'poni') {
      hairFront = '<path d="M17 31c0-11 6-17 15-17s15 6 15 17c-2-5-4-7-7-7h-16c-3 0-5 2-7 7z" fill="' + rambut + '"/><path d="M23 24l1-5M32 24v-5M41 24l-1-5" stroke="' + kulit + '" stroke-width=".9" opacity=".6"/>';
    } else {
      hairFront = '<path d="M17 31c0-11 6-18 15-18s15 7 15 18c-3-6-7-10-13-11-3 5-8 8-17 11z" fill="' + rambut + '"/><path d="M23 19q9-3 16 1" stroke="' + kilau + '" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
    }
    var svg = '<svg viewBox="0 0 64 64" width="100%" height="100%"><rect width="64" height="64" fill="' + bg + '"/>' + hairBack + bajuSvg + wajahSvg + mataSvg + mulutSvg + hairFront + '</svg>';
    return '<span class="foto-wajah" style="width:' + ukuran + 'px;height:' + ukuran + 'px;border-color:' + (bingkai || 'rgba(31,138,128,.55)') + '">' + svg + '</span>';
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
    var hbN = Math.round(S.diri.hb || 0);
    bukaLembar('hudHb', kepala('Bar HB', hbN + '%') + (pesan ? '<p class="racik-pesan ' + (salah ? 'salah' : 'siap') + '">' + esc(pesan) + '</p>' : '') +
      '<div class="saldo-besar" style="background:#ad1457"><small>Bar HB' + (hbN >= 95 ? ' · ⚠️ Penuh (fokus & tidur terganggu)' : '') + '</small><b>' + hbN + '%</b>' + persenBar(hbN) + '</div>' +
      '<div class="chip-baris" style="margin-top:8px"><button type="button" class="aksi" data-hud="meTime">Me time (−25–35%)</button><button type="button" class="chip-tombol pilih" style="width:100%;padding:10px" data-hud="olahraga">🏃 Olahraga / Jogging (−28% HB · +Sehat)</button></div>' +
      '<p class="catatan">Jika dibiarkan penuh (95–100%), tidur jadi gelisah, fokus kerja turun, dan hubungan pasangan menegang. Atasi dengan HB bersama pasangan, Me Time di rumah, atau Olahraga.</p>');
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
    if (nama === 'bukaPb') { app.tokoMenu = 'pb'; app.pesan = ''; return bukaHP('toko'); }
    if (nama === 'bbm') { app.bbmPilih = nilai; return popupBensin(); }
    if (nama === 'energi') { var re = DIRI.minumEnergi(S, nilai); if (re && re.ok) { simpan(); perbaruiHUD(true); return popupStamina(re.teks, false); } return popupStamina(re, true); }
    if (nama === 'meTime') { var rm = mulaiMeTime(); if (rm === true) { tutupLembar(); return; } return popupHb(rm, true); }
    if (nama === 'olahraga') { var rol = DIRI.istirahat(S, 'olahraga'); if (rol && rol.ok) { lompatWaktu(rol.menit); simpan(); perbaruiHUD(true); tutupLembar(); toast(rol.teks, 2600); return; } return popupHb(rol, true); }
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
  /* bar bahan bakar / daya baterai kendaraan aktif di dock bawah (5 bar simetris selalu penuh) */
  function barBensin() {
    var pakaiMobil = jenisKendaraanJalan() === 'mobil' && !!S.mobil;
    var m = pakaiMobil ? S.mobil : S.motor;
    if (!m) return '<span data-hud="bensin" class="bisa-tap"><span class="bar-lbl"><span>BBM</span><em>—</em></span><i class="meteran"><i style="width:0%"></i></i></span>';
    var evMobil = pakaiMobil && m.bbm === 'listrik';
    var listrikMtr = !pakaiMobil && m.bbm === 'listrik' && m.jarakPenuh;
    var v = listrikMtr ? (m.baterai || 0) / m.jarakPenuh * 100 : pakaiMobil ? (Math.max(0, Math.min(1, Number(m.isi) || 0))) * 100 : (Number(m.isi) || 0) / (m.tangki || 1) * 100;
    return bar(evMobil || listrikMtr ? '⚡EV' : 'BBM', Math.max(0, Math.min(100, v)), false, 'bensin');
  }
  function bar(nama, v, isHb, hud, paksaKritis) {
    var n = Math.max(0, Math.min(100, Math.round(v || 0)));
    var cls = isHb ? (n >= 85 ? ' hb kritis' : ' hb') : (paksaKritis || n < 20 ? ' kritis' : '');
    return '<span' + (hud ? ' data-hud="' + hud + '" class="bisa-tap"' : '') + '><span class="bar-lbl"><span>' + nama + '</span><em>' + n + '%</em></span><i class="meteran' + cls + '"><i style="width:' + n + '%"></i></i></span>';
  }
  function bukaDiri() {
    var d = S.diri, diKedai = d.posisi === 'kedai', hm = DIRI.hpAktif(S);
    var bisaNarik = !S.ojek.online && MOTOR.siapPakai(S) && N.ojol.platform.some(function (p) { return OJEK.aktif(S, p.id); });
    bukaLembar('diri', kepala('Kondisi Badan & HP', (diKedai ? 'Di luar' : 'Di ' + DIRI.tempat(S)) + (d.sakit ? ' · Sakit: ' + d.sakit.nama : ' · Sehat ' + Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%')) +
      '<div class="stat-grid-2">' +
      '<div class="stat-box"><small>🍽️ Kenyang · 💧 Minum</small><b>' + Math.round(d.kenyang) + '% · ' + Math.round(d.minum) + '%</b></div>' +
      '<div class="stat-box"><small>⚡ Stamina · ❤️ HB</small><b>' + Math.round(d.stamina) + '% · ' + Math.round(d.hb || 0) + '%</b></div>' +
      '<div class="stat-box"><small>🏥 Kesehatan</small><b>' + (d.sakit ? esc(d.sakit.nama) : Math.round(d.kesehatan == null ? 100 : d.kesehatan) + '%') + (d.hiv ? ' · HIV+' : '') + '</b></div>' +
      '<div class="stat-box"><small>📱 ' + esc(hm.nama) + '</small><b>' + Math.round(S.hp ? S.hp.baterai : 95) + '%' + (S.hp && S.hp.cas ? ' ⚡' : '') + '</b></div></div>' +
      '<div class="chip-baris"><button type="button" class="chip-tombol pilih" data-diri="app:makan">🍽️ Makan & Minum</button>' +
      '<button type="button" class="chip-tombol' + (S.autoMakanMinum ? ' pilih' : '') + '" data-diri="autoMakan:1">' + (S.autoMakanMinum ? '✓ Auto Makan' : 'Auto Makan') + '</button>' +
      '<button type="button" class="chip-tombol" data-diri="makan:air">💧 Minum Air</button>' +
      (d.sakit ? '<button type="button" class="chip-tombol pilih" data-diri="app:apotek">🏥 Apotek & RS</button>' : '') +
      (diKedai ? '<button type="button" class="chip-tombol pilih" data-diri="pulang:1">🏠 Pulang</button>' : '') +
      (bisaNarik && (S.fase !== 'buka' || kepalaMasuk()) ? '<button type="button" class="chip-tombol pilih" data-diri="narik:1">🛵 Narik Ojol</button>' : '') +
      '</div>');
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
      if (S.transit) {
        if (S.transit.bbmSisa > 0 && S.transit.bbmTarget && S.transit.total > 0) {
          var kurBbm = Math.min(S.transit.bbmSisa, (S.transit.bbmSisa / Math.max(0.1, S.transit.sisa)) * dMenit);
          S.transit.bbmSisa -= kurBbm;
          if (S.transit.bbmTarget === 'mobil' && S.mobil) S.mobil.isi = Math.max(0, S.mobil.isi - kurBbm);
          else if (S.transit.bbmTarget === 'motorEv' && S.motor) S.motor.baterai = Math.max(0, S.motor.baterai - kurBbm);
          else if (S.transit.bbmTarget === 'motor' && S.motor) S.motor.isi = Math.max(0, S.motor.isi - kurBbm);
        }
        S.transit.sisa -= dMenit;
        if (S.transit.sisa <= 0.001) selesaiTransit();
      }
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
    if (main && S.tamuRumah) {
      if (S.tamuRumah.hari !== S.hari || (S.menit % 1440) >= S.tamuRumah.sampaiJam) S.tamuRumah = null;
      else kelDiRumah.push({ nama: S.tamuRumah.nama, peran: S.tamuRumah.peran || 'teman', gender: S.tamuRumah.gender || 'cewek', pasangan: false, hamil: false, usia: 24 });
    }
    var hb = (main && S.diri) ? (S.diri.hb || 0) : 0;
    var capekP = !!(main && S.diri && (S.diri.stamina < 25));
    ADEGAN.gambar(main ? { kota: S.kota, ramadan: KAL.apakahRamadan(S.hari) > 0, namaToko: S.namaToko || 'Kopi Kontainer', namaPemain: S.namaPemain || 'Kamu', gender: (S.profil && S.profil.gender) || 'cewek', tampilan: warnaTampilanHex(S.profil && S.profil.tampilan, (S.profil && S.profil.gender) || 'cewek'), berhentiSewa: !!(S.usaha && S.usaha.berhentiSewa), sakitPemain: !!S.diri.sakit, capekPemain: capekP, hbTinggi: hb >= 75, hamilPemain: !!(S.diri.hamil && S.diri.hamil.terdeteksi), keluargaRumah: kelDiRumah, hbAnim: S.hbRun ? { u: Math.min(1, 1 - S.hbRun.sisa / S.hbRun.total), varian: S.hbRun.varian, nama: S.hbRun.nama, gB: S.hbRun.gB } : null, posisi: S.diri.posisi, transit: S.transit ? { ke: S.transit.ke, u: 1 - S.transit.sisa / S.transit.total, km: S.transit.km, kend: S.transit.kend, mult: S.transit.mult } : null, ojek: OJEK.fase(S), travel: TRAVEL.fase(S), motorId: S.motor ? S.motor.id : null, mobil: S.mobil ? { id: S.mobil.id, bentuk: S.mobil.bentuk } : null, rumah: S.rumah.jenis === 'rumah' ? S.rumah.tipe : null, hunianId: (S.rumah && S.rumah.hunianId) || 'kos_ac',
      pindah: pindahAnim ? { u: (t - pindahAnim.mulai) / 3800, pikap: pindahAnim.pikap, warna: pindahAnim.warna } : null, barang: S.rumah.barang, tidur: !!S.tidurAnim, acNyala: !S.rumah.padam && DIRI.adaAc(S), menit: S.menit, buka: S.fase === 'buka' && !S.tutupSementara, kecepatan: S.kec, jalan: !lembar && S.kec > 0, pembeli: JUAL.semua(), dMenit: dMenit, ruangBawah: ruang, motorParkir: S.motor && ANTAR.waktu(S) >= (S.motorSibukSampai || 0) ? S.motor.id : null, staf: stafHadir.length, stafGender: stafHadir.map(function (k) { return k.gender || 'cewek'; }), anakBantu: anakDiKedai, hujan: DUNIA.hujanSekarang(S) ? (S.dunia.cuaca.banjir ? 2 : 1) : 0, kotor: S.dunia.kotor, tier: S.usaha.tier, kayu: USAHA.punya(S, 'kursiKayu'), padam: !USAHA.listrikNyala(S) }
      : { latarAwal: true, namaToko: 'The Driver', menit: 1050, buka: false, kecepatan: 1, jalan: true, pembeli: [], dMenit: 0 }, t);
    requestAnimationFrame(putar);
  }

  /* ---------- sentuhan ---------- */
  var SAPA = ['Siap, bos!', 'Kopi hari ini wangi.', 'Mau racik apa kita?', 'Semangat jualan!', 'Es batu aman, bos.'];
  function pasangEvent() {
    
    if ($('b-baru-driver')) $('b-baru-driver').onclick = function () { modeDriver = true; tampil('karakter'); };
    if ($('layar-karakter')) {
      $('layar-karakter').onclick = function (e) {
        var gBtn = e.target.closest('[data-awal-gender]');
        if (gBtn) { profilAwal.gender = gBtn.dataset.awalGender; profilAwal.tampilan = tampilanLengkap(profilAwal.tampilan, profilAwal.gender); perbaruiPreviewKarakter(); return; }
        var tpBtn = e.target.closest('[data-awal-tp]');
        if (tpBtn) {
          var pt = tpBtn.dataset.awalTp.split(':');
          profilAwal.tampilan = tampilanLengkap(profilAwal.tampilan, profilAwal.gender);
          profilAwal.tampilan[pt[0]] = pt[1];
          perbaruiPreviewKarakter();
        }
      };
      if ($('in-awal-nama')) $('in-awal-nama').oninput = function () { profilAwal.nama = this.value; perbaruiPreviewKarakter(); };
      if ($('in-awal-ttl')) $('in-awal-ttl').onchange = function () { profilAwal.tglLahir = this.value || '2000-05-15'; perbaruiPreviewKarakter(); };
      if ($('in-awal-agama')) $('in-awal-agama').onchange = function () { profilAwal.agama = this.value || 'Islam'; perbaruiPreviewKarakter(); };
      if ($('in-awal-etnis')) $('in-awal-etnis').onchange = function () { profilAwal.etnis = this.value || 'Jawa'; perbaruiPreviewKarakter(); };
      if ($('b-lanjut-karakter')) $('b-lanjut-karakter').onclick = function () {
        var nm = ($('in-awal-nama') ? $('in-awal-nama').value : '').trim();
        if (!nm) { toast('Isi nama karaktermu dulu ya!', 2000); if ($('in-awal-nama')) $('in-awal-nama').focus(); return; }
        profilAwal.nama = nm.slice(0, 24);
        profilAwal.tglLahir = ($('in-awal-ttl') && $('in-awal-ttl').value) || '2000-05-15';
        profilAwal.agama = ($('in-awal-agama') && $('in-awal-agama').value) || 'Islam';
        profilAwal.etnis = ($('in-awal-etnis') && $('in-awal-etnis').value) || 'Jawa';
        tampil('kota');
      };
      if ($('b-kembali-karakter')) $('b-kembali-karakter').onclick = function () { tampil('awal'); };
    }
    if ($('kota-filter')) $('kota-filter').onclick = function (e) {
      var fp = e.target.closest('[data-pulau]');
      if (fp) { kotaPulauFilter = fp.dataset.pulau; isiKota(); }
    };
    $('b-kembali').onclick = function () { tampil('karakter'); };
    $('b-lanjut').onclick = function () { var d = SIMPAN.baca(); if (d) lanjut(d); };
    $('kota-daftar').onclick = function (e) { var b = e.target.closest('[data-kota]'); if (b) { kotaDipilih = b.dataset.kota; if (modeDriver) { lokasiDipilih = 'jalan'; tampil('hunian'); } else tampil('lokasi'); } };
    if ($('hunian-tab')) $('hunian-tab').onclick = function (e) {
      var tb = e.target.closest('[data-hunian-kat]');
      if (tb) { hunianKatFilter = tb.dataset.hunianKat; isiHunianAwal(); }
    };
    if ($('hunian-daftar')) $('hunian-daftar').onclick = function (e) {
      var hb = e.target.closest('[data-hunian]');
      if (hb) { hunianDipilih = hb.dataset.hunian; tampil('qris'); }
    };
    if ($('b-kembali-hunian')) $('b-kembali-hunian').onclick = function () { tampil('kota'); };
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
    $('b-kembali-qris').onclick = function () { tampil(kotaDipilih ? (modeDriver ? 'hunian' : 'lokasi') : 'awal'); };
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
    
    if ($('b-aksi-cepat')) $('b-aksi-cepat').onclick = function () {
      if (!S) return;
      if (S.transit || S.hbRun || (S.ojek && (S.ojek.tawaran || S.ojek.trip)) || (S.travel && S.travel.aktif && S.travel.status !== 'tunggu')) return;
      aksiCepatBuka = !aksiCepatBuka;
      if (!aksiCepatBuka) kosLainnya = false;
      perbaruiAksi();
    };
    $('b-hp').onclick = function () { aksiCepatBuka = false; app.pesan = ''; bukaHP('beranda'); };
    if ($('b-pesanan')) $('b-pesanan').onclick = function () { aksiCepatBuka = false; bukaPesanan(); };
    $('h-uang').onclick = function () { if (S && (S.fase !== 'pagi' || (S.usaha && S.usaha.berhentiSewa))) bukaLaporanSementara(); };
    $('b-atur').onclick = function () { aksiCepatBuka = false; konfirmasiUlang = false; bukaAtur(); };
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
      if ((b = e.target.closest('[data-tut]'))) {
        if (b.dataset.tut === 'skip') { if (S) { S.tutorialSelesai = true; simpan(); } tutupLembar(); toast('Selamat bermain! Modal awal Rp5.000.000 siap digunakan.', 2400); return; }
        return bukaTutorial(+b.dataset.tut);
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
        S.profil = S.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa' };
        S.profil.gender = b.dataset.gender;
        S.profil.tampilan = tampilanLengkap(S.profil.tampilan, S.profil.gender);
        simpan(); perbaruiHUD(true); bukaAtur();
        var dtp = $('lembar-isi').querySelector('.kartu-lipat'); if (dtp) dtp.open = true;
        return;
      }
      if ((b = e.target.closest('[data-atur-tp]'))) {
        var atp = b.dataset.aturTp.split(':');
        S.profil = S.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa' };
        S.profil.tampilan = tampilanLengkap(S.profil.tampilan, S.profil.gender || 'cewek');
        S.profil.tampilan[atp[0]] = atp[1];
        simpan(); perbaruiHUD(true); bukaAtur();
        var dtp2 = $('lembar-isi').querySelector('.kartu-lipat'); if (dtp2) dtp2.open = true;
        return;
      }
      if ((b = e.target.closest('[data-simpan-nama]'))) {
        var nt = $('in-toko') ? $('in-toko').value.trim() : '';
        var np = $('in-pemain') ? $('in-pemain').value.trim() : '';
        var nttl = $('in-ttl') ? $('in-ttl').value : '';
        var nag = $('in-agama') ? $('in-agama').value : '';
        var net = $('in-etnis') ? $('in-etnis').value : '';
        if (nt) S.namaToko = nt.slice(0, 24);
        if (np) S.namaPemain = np.slice(0, 24);
        S.profil = S.profil || { gender: 'cewek', tglLahir: '2000-05-15', agama: 'Islam', etnis: 'Jawa' };
        if (nttl) S.profil.tglLahir = nttl;
        if (nag) S.profil.agama = nag;
        if (net) S.profil.etnis = net;
        simpan(); perbaruiHUD(true); toast('Profil, identitas & tampilan disimpan.'); bukaAtur(); return;
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
      } else if (el.id === 'in-prop-kota') {
        app.kotaProp = el.value; app.pesan = ''; bukaHP('properti');
      }
    };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lembar) tutupLembar(); });
    $('adegan').addEventListener('pointerdown', function (e) {
      if (layar !== 'main') return;
      if (aksiCepatBuka) { aksiCepatBuka = false; kosLainnya = false; perbaruiAksi(); return; }
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
