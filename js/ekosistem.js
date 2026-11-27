/* ekosistem.js — Engine Ekosistem Kehidupan Realistis Indonesia (P60):
   Modular & ringan (simulasi ekonomi/sosial harian O(1), nol beban frame loop):
   1. Service Konter HP (Overheat, Ganti Baterai Ori/KW, LCD Retak)
   2. SLIK OJK (Kol 1–5) & Debt Collector + Notif Pembayaran Dekat
   3. Pegadaian (Gadai Emas / HP / BPKB & Tebus)
   4. Water Hammer Banjir 60cm (Motor matic mogok vs Trail/SUV kebal)
   5. Reputasi & Jejak Digital (Viral Baik vs Cancel Culture + Klarifikasi)
   6. Koneksi & Rekomendasi Ordal (Teman Hub >= 85%)
   7. Renovasi Rumah Bertahap (Kanopi, Pagar, Panel Surya 60%, Kolam Koi, Lantai 2)
   8. SPT Tahunan (Maret) & Pemutihan Pajak Kendaraan Daerah
   9. Pinjol Ilegal (Bunga 3%/hr + Sebar Data ke Semua Kontak jika telat!)
   10. Kesehatan Mental (Burnout), Gym, Berhenti Merokok (7-hr Sakau), & MCU
   11. Inflasi Tahunan (3–5%), Harga BBM Bulanan, & Macet/Demo Kota
   12. Peliharaan di Rumah + Lomba Burung Kicau Murai Batu
   13. Lelang Sitaan Bank / Pegadaian (Akhir Bulan, Bid vs NPC)
   14. Bisnis Kos-Kosan Pintu & Kontrakan (Passive Income + Drama Anak Kos)
   15. Orang Tua di Kampung, Kirim Uang, & Warisan Maksimal 2x (1x Ayah, 1x Ibu)
   16. Kerja Remote / Kapal Pesiar Gaji USD + Tabungan & Kurs USD Harian
   17. Modifikasi Kendaraan (Shockbreaker, Lampu BILED, Bore-Up, Cat Bodi)
   18. Pemilu Daerah/Nasional & Kenaikan UMK Tahunan
   19. Ganti Provider SIM & Kekuatan Sinyal Nyata (Kota vs Desa Pedalaman)
   20. Dana Pensiun DPLK & Mode Generasi ke-2 (Legacy Lanjut Sebagai Anak) */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, UANG = g.KK_UANG;
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function batas(v, a, b) { return Math.max(a == null ? 0 : a, Math.min(b == null ? 100 : b, v)); }

  /* ---------- Katalog Data Realistis P60 ---------- */
  var PROVIDER_LIST = [
    { id: 'telkomsel', nama: 'Telkomsel (Halo / PraBayar)', hargaMult: 1.28, kota: 4, kab: 4, desa: 3, ket: 'Paling mahal tapi sinyal kuat 4G/5G sampai desa pedalaman!' },
    { id: 'xl', nama: 'XL Axiata', hargaMult: 1.05, kota: 4, kab: 3, desa: 2, ket: 'Stabil di kota & kabupaten, lumayan di pinggiran desa' },
    { id: 'indosat', nama: 'Indosat IM3', hargaMult: 1.0, kota: 4, kab: 3, desa: 2, ket: 'Harga seimbang, kencang di pusat kota & jalur utama' },
    { id: 'byu', nama: 'by.U Digital', hargaMult: 0.92, kota: 4, kab: 3, desa: 2, ket: 'Kuota fleksibel murah (jaringan Telkomsel prioritas standar)' },
    { id: 'tri', nama: 'Tri (3) AlwaysOn', hargaMult: 0.78, kota: 4, kab: 2, desa: 1, ket: 'Kuota murah banget! Minus: di desa pedalaman sering turun ke E' },
    { id: 'smartfren', nama: 'Smartfren Unlimited', hargaMult: 0.72, kota: 3, kab: 2, desa: 0, ket: 'Termurah di kota, tapi di desa pedalaman bisa No Service (0 bar)!' }
  ];

  var RENOVASI_LIST = [
    { id: 'kanopi', nama: 'Kanopi Carport Baja Ringan', harga: 8500000, nilaiTambah: 10000000, ket: 'Lindungi motor/mobil dari hujan & panas terik di rumah' },
    { id: 'pagar', nama: 'Pagar Besi Hollow Minimalis', harga: 12000000, nilaiTambah: 14000000, ket: 'Rumah jauh lebih aman & rapi (+keamanan lingkungan)' },
    { id: 'panel_surya', nama: 'Panel Surya Atap 2.200 Wp (PLTS)', harga: 28000000, nilaiTambah: 32000000, ket: 'Hemat pemakaian listrik PLN rumah hingga 60% selamanya!' },
    { id: 'kolam_koi', nama: 'Taman & Kolam Ikan Koi Teras', harga: 15000000, nilaiTambah: 18000000, ket: 'Menurunkan stres −10 setiap pagi & bikin keluarga makin betah' },
    { id: 'lantai2', nama: 'Renovasi Dak & Tambah Lantai 2', harga: 145000000, nilaiTambah: 195000000, ket: 'Nilai rumah melonjak +35%, tidur makin nyenyak & muat semua perabot' }
  ];

  var HEWAN_LIST = [
    { id: 'kucing_kampung', nama: 'Kucing Kampung (Adopsi)', ikon: '🐱', harga: 50000, pakanMinggu: 45000, stresTurun: 6, bahagia: 4, lomba: false, ket: 'Lucu, manja & ramah kantong, meredakan penat di rumah' },
    { id: 'kucing_persia', nama: 'Kucing Persia Medium', ikon: '🐈', harga: 1800000, pakanMinggu: 120000, stresTurun: 10, bahagia: 8, lomba: false, ket: 'Bulu lebat menggemaskan, disukai pasangan & anak' },
    { id: 'anjing_jaga', nama: 'Anjing Pintar Penjaga Rumah', ikon: '🐕', harga: 2500000, pakanMinggu: 150000, stresTurun: 9, bahagia: 7, lomba: false, ket: 'Setia menemani olahraga pagi & menjaga pekarangan rumah' },
    { id: 'murai_batu', nama: 'Burung Murai Batu Medan Gacor', ikon: '🐦', harga: 3500000, pakanMinggu: 110000, stresTurun: 8, bahagia: 6, lomba: true, ket: 'Kicauan merdu & BISA IKUT Lomba Kicau akhir pekan (hadiah Rp1,5jt–Rp8jt!)' }
  ];

  var KOSAN_PAKET = [
    { id: 'kos5', nama: 'Bangun Kos-Kosan 5 Pintu', pintu: 5, modal: 165000000, sewaPintu: 850000, ket: '5 kamar kos · Passive income ~Rp4,25jt/bln otomatis tgl 1!' },
    { id: 'kos10', nama: 'Bangun Kos-Kosan 10 Pintu', pintu: 10, modal: 310000000, sewaPintu: 950000, ket: '10 kamar kos AC/kipas · Passive income ~Rp9,5jt/bln!' },
    { id: 'kos20', nama: 'Kos Eksklusif 20 Pintu (2 Lantai)', pintu: 20, modal: 680000000, sewaPintu: 1250000, ket: '20 kamar full AC · Passive income sultan ~Rp25jt/bln!' }
  ];

  var MODIF_PART = [
    { id: 'shock_ohlins', nama: 'Shockbreaker RCB / Ohlins', hargaMotor: 2400000, hargaMobil: 6800000, ket: 'Bantingan empuk anti-lubang · +rating penumpang & kenyamanan!' },
    { id: 'lampu_biled', nama: 'Lampu Utama BILED Proyektor', hargaMotor: 1450000, hargaMobil: 3800000, ket: 'Sorot lampu super terang menembus hujan deras & malam hari!' },
    { id: 'cvt_boreup', nama: 'Upgrade CVT / Remap ECU Harian', hargaMotor: 1650000, hargaMobil: 4500000, ket: 'Akselerasi lebih enteng & waktu tempuh perjalanan lebih cepat 10%' }
  ];
  var WARNA_CAT = [
    { id: 'standar', nama: 'Cat Pabrikan', hex: null, harga: 0 },
    { id: 'merah', nama: 'Merah Ferrari', hex: '#d32f2f', harga: 850000 },
    { id: 'biru', nama: 'Biru Matte', hex: '#1565c0', harga: 850000 },
    { id: 'hitam', nama: 'Hitam Doft', hex: '#1e242b', harga: 900000 },
    { id: 'putih', nama: 'Putih Mutiara', hex: '#f1f5f9', harga: 900000 },
    { id: 'hijau', nama: 'Hijau Army', hex: '#2e5939', harga: 950000 },
    { id: 'kuning', nama: 'Kuning Sport', hex: '#f2b705', harga: 950000 }
  ];

  function siapkan(S) {
    if (!S) return S;
    if (!S.eko) {
      var ortuBerada = Math.random() < 0.45;
      S.eko = {
        provider: 'telkomsel',
        reputasi: 68,
        suspendOjolSampai: -1,
        slikKol: 1,
        gadai: [],
        pinjol: null, /* { pokok, total, tempoHari, sebarData } */
        renovasi: {},
        hewan: [],
        pakanSampai: -1,
        lombaHari: -1,
        kosan: null, /* { pintu, sewaPintu, wifi, rusak, totalHasil } */
        ortu: {
          berada: ortuBerada,
          ayah: { nama: 'Ayah (Kampung)', usia: 57, hidup: true, warisanDiterima: false },
          ibu: { nama: 'Ibu (Kampung)', usia: 54, hidup: true, warisanDiterima: false },
          kirimBulan: -1,
          telpHari: -1
        },
        kursUsd: 16200,
        tabunganUsd: 0,
        inflasi: 1.0,
        faktorBbm: 1.0,
        macetHari: -1,
        sptTahun: 0,
        pemiluTahun: 0,
        umkMult: 1.0,
        burnout: false,
        paru: 100,
        sakauSampai: -1,
        gymSampai: -1,
        gymHari: -1,
        pensiun: 0,
        lelang: null,
        ordalBonus: 0,
        ordalNama: ''
      };
    }
    var e = S.eko;
    if (!e.provider) e.provider = 'telkomsel';
    if (typeof e.reputasi !== 'number') e.reputasi = 68;
    if (!Array.isArray(e.gadai)) e.gadai = [];
    if (!e.renovasi) e.renovasi = {};
    if (!Array.isArray(e.hewan)) e.hewan = [];
    if (!e.ortu) e.ortu = { berada: true, ayah: { nama: 'Ayah', usia: 57, hidup: true, warisanDiterima: false }, ibu: { nama: 'Ibu', usia: 54, hidup: true, warisanDiterima: false }, kirimBulan: -1, telpHari: -1 };
    if (typeof e.kursUsd !== 'number') e.kursUsd = 16200;
    if (typeof e.inflasi !== 'number') e.inflasi = 1.0;
    if (typeof e.paru !== 'number') e.paru = 100;
    if (typeof e.pensiun !== 'number') e.pensiun = 0;
    if (S.hp && typeof S.hp.suhu !== 'number') S.hp.suhu = 34;
    if (typeof S.generasi !== 'number') S.generasi = 1;
    return e;
  }

  /* ---------- 1. Service HP & Overheat ---------- */
  function cekOverheatHp(S, dMenit) {
    var e = siapkan(S);
    if (!S.hp) return null;
    var j = dMenit / 60;
    var cas = !!S.hp.cas, ch = g.KK_DIRI && g.KK_DIRI.chargerAktif ? g.KK_DIRI.chargerAktif(S) : null;
    var narik = S.ojek && S.ojek.online && S.ojek.trip;
    var siangPanas = (S.menit % 1440) >= 660 && (S.menit % 1440) <= 930;
    var targetSuhu = 33 + (cas ? (ch && !ch.asli ? 9 : 5) : 0) + (narik ? (siangPanas ? 10 : 6) : 0) + (S.hp.pbPasang ? 4 : 0);
    S.hp.suhu = Math.round(((S.hp.suhu || 34) + (targetSuhu - (S.hp.suhu || 34)) * Math.min(1, j * 1.5)) * 10) / 10;
    if (S.hp.suhu >= 44 && S.gadget && S.gadget[S.hp.id]) {
      var stG = S.gadget[S.hp.id];
      stG.bh = Math.max(58, (stG.bh == null ? 100 : stG.bh) - 0.12 * j);
    }
    if (!S.hp.lcdRetak && narik && Math.random() < 0.0008 * j) {
      S.hp.lcdRetak = true;
      return '📱 HP sempat terlepas dari holder & LCD retak! Perbaiki di Ekosistem → Service HP.';
    }
    return null;
  }
  function serviceHp(S, jenis) {
    siapkan(S);
    if (!S.hp || !g.KK_DIRI) return 'HP tidak ditemukan.';
    var hm = g.KK_DIRI.hpAktif(S);
    var st = (S.gadget && S.gadget[hm.id]) || null;
    if (jenis === 'dingin') {
      S.hp.suhu = 32;
      return { ok: true, menit: 15, teks: '❄️ HP diistirahatkan 15 menit hingga dingin normal (32°C).' };
    }
    var skala = Math.max(1, Math.min(4, Math.round((hm.harga || 2000000) / 5000000)));
    var biaya = jenis === 'bat_ori' ? (320000 * skala) : jenis === 'bat_kw' ? (140000 * skala) : jenis === 'lcd_ori' ? (750000 * skala) : (350000 * skala);
    var ket = jenis === 'bat_ori' ? 'Ganti Baterai Original' : jenis === 'bat_kw' ? 'Ganti Baterai OEM/KW' : jenis === 'lcd_ori' ? 'Ganti LCD Original' : 'Ganti LCD OEM';
    var by = UANG.bayarPilihan(S, biaya, 'Service HP: ' + ket + ' (' + hm.nama + ')', S._metodeBayar || 'bank');
    if (by !== true) return by;
    if (!st && S.gadget) { S.gadget[hm.id] = { id: hm.id, dibeli: S.hari, pakai: 0, hargaBeli: hm.harga, bh: 100 }; st = S.gadget[hm.id]; }
    if (jenis === 'bat_ori' && st) st.bh = 100;
    else if (jenis === 'bat_kw' && st) st.bh = 91;
    else { S.hp.lcdRetak = false; }
    S.hp.suhu = 33;
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya;
    return { ok: true, menit: 45, teks: '🔧 Service Konter HP selesai: ' + ket + ' (' + rp(biaya) + ')! ' + (jenis.indexOf('bat_') === 0 ? 'Battery Health kini ' + Math.round(st.bh) + '%.' : 'Layar mulus kembali!') };
  }

  /* ---------- 2. SLIK OJK (Kol 1–5) & Daftar Notif Pembayaran Dekat ---------- */
  function hitungSlik(S) {
    var e = siapkan(S), tgk = 0, rincian = [];
    if (S.kk && ((S.kk.denda || 0) > 0 || S.kk.status === 'blokir')) { tgk += (S.kk.tagihan || 0) + (S.kk.denda || 0); rincian.push('Kartu Kredit'); }
    if (S.paylater && (S.paylater.denda || 0) > 0) { tgk += (S.paylater.tagihan || 0) + (S.paylater.denda || 0); rincian.push('PayLater'); }
    if (S.kur && (S.kur.tunggakan || 0) > 0) { tgk += S.kur.tunggakan; rincian.push('KUR'); }
    (S.armadaMotor || (S.motor ? [S.motor] : [])).forEach(function (m) { if (m && m.kredit && m.kredit.tunggakan > 0) { tgk += m.kredit.tunggakan; rincian.push('Leasing Motor'); } });
    (S.armadaMobil || (S.mobil ? [S.mobil] : [])).forEach(function (m) { if (m && m.kredit && m.kredit.tunggakan > 0) { tgk += m.kredit.tunggakan; rincian.push('Leasing Mobil'); } });
    if (e.pinjol && S.hari > e.pinjol.tempoHari) { tgk += e.pinjol.total; rincian.push('Pinjol Ilegal'); }
    var kol = tgk === 0 ? 1 : tgk < 1500000 ? 2 : tgk < 5000000 ? 3 : tgk < 15000000 ? 4 : 5;
    e.slikKol = kol;
    var label = ['', 'Kol 1 · Lancar (Sangat Baik)', 'Kol 2 · Dalam Perhatian Khusus', 'Kol 3 · Kurang Lancar (Kredit Ditolak)', 'Kol 4 · Diragukan (Teror Tagihan)', 'Kol 5 · Macet (Kunjungan DC!)'][kol];
    return { kol: kol, label: label, totalTunggakan: tgk, rincian: rincian };
  }
  function notifBayarDekat(S) {
    var e = siapkan(S), out = [];
    var t = KAL.tgl(S.hari), d = t.d;
    /* PayLater jatuh tempo tgl 5 */
    if (S.paylater && (S.paylater.tagihan || 0) > 0) {
      var hPl = (5 - d + 30) % 30;
      if (hPl <= 4 || (S.paylater.denda || 0) > 0) out.push({ app: 'paylater', kritis: (S.paylater.denda || 0) > 0 || hPl <= 1, teks: '🧾 PayLater ' + rp(S.paylater.tagihan + (S.paylater.denda || 0)) + (hPl === 0 ? ' (Hari ini!)' : ' (H-' + hPl + ')') });
    }
    /* Pinjol Ilegal */
    if (e.pinjol) {
      var sisaPj = e.pinjol.tempoHari - S.hari;
      out.push({ app: 'dunia', kritis: sisaPj <= 1, teks: '☠️ Pinjol ' + rp(e.pinjol.total) + (sisaPj < 0 ? ' (TELAT ' + Math.abs(sisaPj) + 'hr!)' : ' (H-' + sisaPj + ')') });
    }
    /* Pegadaian mendekati jatuh tempo (hindari fungsi ganda: SPT & Pemutihan cukup di menu Ekosistem/Garasi) */
    (e.gadai || []).forEach(function (gd) {
      var sg = gd.tempoHari - S.hari;
      if (sg <= 5) out.push({ app: 'dunia', kritis: sg <= 1, teks: '⚖️ Tebus Gadai ' + gd.nama.split(' ')[0] + ' (' + (sg <= 0 ? 'Jatuh Tempo!' : 'H-' + sg) + ')' });
    });
    return out;
  }

  /* ---------- 3. Pegadaian (Gadai Emas / HP / BPKB) ---------- */
  function gadaiBarang(S, jenis, id) {
    var e = siapkan(S);
    var nama = '', nilaiTaksir = 0;
    if (jenis === 'emas') {
      var inv = S.invest && S.invest.milik && S.invest.milik.emas_antam;
      if (!inv || inv.qty <= 0) return 'Belum memiliki Emas Antam untuk digadaikan.';
      var hEmas = g.KK_HIDUP ? g.KK_HIDUP.hargaInvest(S, 'emas_antam') : 860000;
      nilaiTaksir = hEmas * inv.qty;
      nama = 'Emas Antam (' + inv.qty + '×0,5g)';
      delete S.invest.milik.emas_antam;
    } else if (jenis === 'hp') {
      if (!S.gadget || !S.gadget[id] || S.hp.id === id) return 'Pilih HP cadangan (bukan HP yang sedang dipakai) untuk digadaikan.';
      var gm = g.KK_DIRI && g.KK_DIRI.gadgetModel(id);
      nilaiTaksir = g.KK_DIRI ? g.KK_DIRI.nilaiJualGadget(S, id) : 1500000;
      nama = gm ? gm.nama : id;
      var backup = S.gadget[id];
      delete S.gadget[id];
      e.gadai.push({ jenis: 'hp', id: id, nama: nama, backup: backup, cair: Math.round(nilaiTaksir * 0.8 / 5000) * 5000, mulai: S.hari, tempoHari: S.hari + 30 });
    } else if (jenis === 'bpkb_motor') {
      if (!S.motor || S.motor.kredit) return 'Butuh motor lunas (BPKB di tangan) untuk digadaikan.';
      if (e.gadai.some(function (x) { return x.jenis === 'bpkb_motor'; })) return 'BPKB motor utama sedang digadaikan.';
      nilaiTaksir = Math.round((S.motor.harga || 20000000) * 0.65);
      nama = 'BPKB ' + S.motor.nama;
    } else return 'Jenis gadai tidak dikenal.';
    var cair = Math.round(nilaiTaksir * 0.8 / 5000) * 5000;
    if (jenis !== 'hp') e.gadai.push({ jenis: jenis, id: id || jenis, nama: nama, qtyEmas: jenis === 'emas' ? Math.round(nilaiTaksir / (g.KK_HIDUP ? g.KK_HIDUP.hargaInvest(S, 'emas_antam') : 860000)) : 0, cair: cair, mulai: S.hari, tempoHari: S.hari + 30 });
    S.bank.saldo += cair;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Pegadaian: Gadai ' + nama, jml: cair });
    return { ok: true, cair: cair, teks: '⚖️ ' + nama + ' digadaikan di Pegadaian! Dana cair ' + rp(cair) + ' ke rekening (tebus dlm 30 hari, sewa modal 2,4%).' };
  }
  function nilaiTebusGadai(S, gd) {
    var lama = Math.max(1, S.hari - (gd.mulai || S.hari));
    var blok15 = Math.max(1, Math.ceil(lama / 15));
    return Math.round(gd.cair * (1 + 0.012 * blok15) / 5000) * 5000;
  }
  function tebusGadai(S, idx) {
    var e = siapkan(S), gd = e.gadai[+idx];
    if (!gd) return 'Data gadai tidak ditemukan.';
    var tebus = nilaiTebusGadai(S, gd);
    var by = UANG.bayarPilihan(S, tebus, 'Tebus Pegadaian: ' + gd.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    if (gd.jenis === 'hp' && gd.backup) { S.gadget = S.gadget || {}; S.gadget[gd.id] = gd.backup; }
    else if (gd.jenis === 'emas') {
      S.invest = S.invest || { milik: {}, harga: {} };
      var q = Math.max(1, gd.qtyEmas || 1);
      S.invest.milik.emas_antam = { qty: ((S.invest.milik.emas_antam && S.invest.milik.emas_antam.qty) || 0) + q, modal: gd.cair };
    }
    e.gadai.splice(+idx, 1);
    return { ok: true, teks: '✅ ' + gd.nama + ' berhasil ditebus (' + rp(tebus) + ') & kembali ke tanganmu!' };
  }

  /* ---------- 4. Water Hammer Banjir 60cm ---------- */
  function cekBanjirMogok(S, mode) {
    var cw = g.KK_DUNIA && g.KK_DUNIA.infoCuacaSekarang ? g.KK_DUNIA.infoCuacaSekarang(S) : null;
    if (!cw || (cw.banjirCm || 0) < 45) return null;
    if (mode === 'mobil') {
      var mb = S.mobil;
      if (!mb || mb.bentuk === 'suv' || mb.bentuk === 'pikap') return null; /* SUV & Pikap tinggi kebal banjir 60cm! */
      if (Math.random() < 0.08) {
        mb.mogokAir = true;
        return '🌊 WATER HAMMER! Mobil rendah ' + mb.nama + ' mogok terendam banjir ' + cw.banjirCm + ' cm! Kuras mesin di Garasi (SUV/Pikap kebal banjir).';
      }
      return null;
    }
    var mt = S.motor;
    if (!mt) return null;
    var mm = (N.motor || []).filter(function (x) { return x.id === mt.id; })[0];
    if ((mm && mm.kuat) || /klx|crf|wr155/i.test(mt.id || '')) return null; /* Motor Trail kebal banjir 60cm! */
    if (Math.random() < 0.14) {
      mt.mogokAir = true;
      return '🌊 MOTOR MOGOK KENA BANJIR ' + cw.banjirCm + ' cm! Filter & oli kemasukan air (Water Hammer). Kuras mesin di Garasi (Motor Trail KLX/CRF kebal banjir!).';
    }
    return null;
  }
  function kurasMesinAir(S, jenis) {
    var knd = jenis === 'mobil' ? S.mobil : S.motor;
    if (!knd || !knd.mogokAir) return 'Kendaraan tidak sedang mogok banjir.';
    var biaya = jenis === 'mobil' ? 1450000 : 285000;
    var by = UANG.bayarPilihan(S, biaya, 'Bengkel Kuras Mesin Banjir (' + knd.nama + ')', S._metodeBayar || 'bank');
    if (by !== true) return by;
    knd.mogokAir = false;
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + biaya;
    return { ok: true, menit: 60, teks: '🔧 Mesin ' + knd.nama + ' selesai dikuras & ganti oli baru (' + rp(biaya) + '). Siap jalan lagi!' };
  }

  /* ---------- 5. Reputasi Digital & Klarifikasi ---------- */
  function klarifikasiSosmed(S) {
    var e = siapkan(S);
    if (e.reputasi >= 70 && S.hari > (e.suspendOjolSampai || -1)) return 'Reputasi digitalmu sedang baik (' + e.reputasi + '/100).';
    e.reputasi = Math.min(100, e.reputasi + 18);
    if (e.suspendOjolSampai > S.hari) e.suspendOjolSampai = S.hari;
    S.sosmedFeed = S.sosmedFeed || [];
    S.sosmedFeed.unshift({ hari: S.hari, plat: 'ig', penulis: S.namaPemain || 'Kamu', teks: '🙏 Video klarifikasi & permohonan maaf tulus. Terima kasih dukungannya warga!', suka: 140 });
    return { ok: true, menit: 30, teks: '📹 Video klarifikasi diterima positif! Reputasi naik ke ' + e.reputasi + '/100.' };
  }

  /* ---------- 6. Koneksi & Rekomendasi Ordal (Teman Hub >= 85%) ---------- */
  function infoOrdal(S) {
    var e = siapkan(S);
    var kuat = (S.teman || []).filter(function (t) { return (t.hubungan || 0) >= 85 && /Bank|RS|Kantor|Pengusaha|HRD|Akuntan|Programmer/i.test(t.kerja || ''); });
    return { daftar: kuat, aktif: e.ordalBonus > 0, nama: e.ordalNama || '', bonusPersen: Math.round((e.ordalBonus || 0) * 100) };
  }
  function mintaRekomendasi(S, temanId) {
    var e = siapkan(S);
    var tm = (S.teman || []).filter(function (x) { return x.id === temanId; })[0];
    if (!tm || (tm.hubungan || 0) < 85) return 'Butuh teman dengan hubungan minimal 85% untuk meminta surat rekomendasi / jalur ordal.';
    e.ordalBonus = 0.10;
    e.ordalNama = tm.nama + ' (' + (tm.kerja || 'Relasi') + ')';
    return { ok: true, teks: '🤝 ' + tm.nama + ' memberikan Surat Rekomendasi! Gaji pekerjaan kantoran naik +10% & lebih mudah lolos seleksi.' };
  }

  /* ---------- 7. Renovasi Rumah Bertahap ---------- */
  function beliRenovasi(S, id) {
    var e = siapkan(S);
    if (!S.rumah || S.rumah.jenis !== 'rumah') return 'Renovasi hanya untuk rumah milik sendiri (beli rumah dulu di APK Properti).';
    var rv = RENOVASI_LIST.filter(function (x) { return x.id === id; })[0];
    if (!rv) return 'Renovasi tidak dikenal.';
    if (e.renovasi[id]) return rv.nama + ' sudah terpasang di rumahmu.';
    var by = UANG.bayarPilihan(S, rv.harga, 'Renovasi Rumah: ' + rv.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.renovasi[id] = { hari: S.hari, harga: rv.harga };
    S.hariIni.pribadi = (S.hariIni.pribadi || 0) + rv.harga;
    return { ok: true, menit: 120, teks: '🏡 Renovasi ' + rv.nama + ' selesai (' + rp(rv.harga) + ')! ' + rv.ket };
  }
  function faktorHematPln(S) {
    var e = siapkan(S);
    return (S.rumah && S.rumah.jenis === 'rumah' && e.renovasi && e.renovasi.panel_surya) ? 0.40 : 1.0;
  }

  /* ---------- 8. SPT Tahunan & Pemutihan Pajak ---------- */
  function pemutihanAktif(S) {
    var t = KAL.tgl(S.hari || 0);
    return (t.m === 5 || t.m === 11) && t.d <= 20;
  }
  function laporSpt(S) {
    var e = siapkan(S), t = KAL.tgl(S.hari);
    if (e.sptTahun === t.y) return 'SPT Tahunan ' + t.y + ' sudah dilaporkan.';
    e.sptTahun = t.y;
    e.reputasi = Math.min(100, e.reputasi + 4);
    return { ok: true, menit: 20, teks: '📄 Lapor SPT Tahunan ' + t.y + ' (e-Filing DJP) selesai! Catatan pajak bersih & reputasi naik.' };
  }

  /* ---------- 9. Pinjol Ilegal (Jebakan Realistis) ---------- */
  function pinjamPinjol(S, nominal) {
    var e = siapkan(S);
    if (e.pinjol) return 'Kamu masih punya tanggungan Pinjol Ilegal aktif (' + rp(e.pinjol.total) + '). Lunasi dulu!';
    nominal = Math.max(500000, Math.min(5000000, Math.round(+nominal || 1000000)));
    var cair = Math.round(nominal * 0.85); /* potongan admin gila 15% di awal */
    e.pinjol = { pokok: nominal, total: nominal, mulai: S.hari, tempoHari: S.hari + 7, sebarData: false };
    S.bank.saldo += cair;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Dana Cepat Pinjol Ilegal (potong admin 15%)', jml: cair });
    return { ok: true, teks: '☠️ Pinjol Ilegal cair ' + rp(cair) + ' (tagihan ' + rp(nominal) + ', bunga 3%/hari, jatuh tempo 7 hari!). TELAT 1 HARI = SEBAR DATA KE SEMUA KONTAK!' };
  }
  function lunasPinjol(S) {
    var e = siapkan(S);
    if (!e.pinjol) return 'Tidak ada pinjaman Pinjol Ilegal.';
    var tot = e.pinjol.total;
    var by = UANG.bayarPilihan(S, tot, 'Pelunasan Pinjol Ilegal', S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.pinjol = null;
    if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -20);
    return { ok: true, teks: '✅ Pinjol Ilegal lunas (' + rp(tot) + ')! Teror & bunga mencekik berhenti.' };
  }

  /* ---------- 10. Kesehatan Mental, Gym, Berhenti Merokok, & MCU ---------- */
  function daftarGym(S) {
    var e = siapkan(S), biaya = 350000;
    var by = UANG.bayarPilihan(S, biaya, 'Membership Gym Bulanan', S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.gymSampai = Math.max(S.hari, e.gymSampai || S.hari) + 30;
    return { ok: true, teks: '🏋️ Member Gym aktif 30 hari (' + rp(biaya) + ')! Bisa latihan rutin untuk pulihkan burnout & paru-paru.' };
  }
  function latihanGym(S) {
    var e = siapkan(S);
    if ((e.gymSampai || -1) < S.hari) return 'Belum daftar membership Gym (Rp350rb/bln).';
    if (e.gymHari === S.hari) return 'Kamu sudah latihan Gym hari ini.';
    e.gymHari = S.hari;
    e.burnout = false;
    e.paru = Math.min(100, e.paru + 5);
    S.diri.stamina = batas((S.diri.stamina || 60) - 12);
    S.diri.kesehatan = batas((S.diri.kesehatan || 80) + 12);
    if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -24);
    return { ok: true, menit: 60, teks: '🏋️ Selesai latihan Gym 1 jam! Burnout sembuh, stres turun drastis, paru-paru ' + e.paru + '%.' };
  }
  function mulaiBerhentiRokok(S) {
    var e = siapkan(S);
    if (e.sakauSampai >= S.hari) return 'Sedang menjalani program Berhenti Merokok (sisa ' + (e.sakauSampai - S.hari + 1) + ' hari).';
    if (S.rokok) { S.rokok.pola = 'off'; S.rokok.autoBeli = false; }
    e.sakauSampai = S.hari + 7;
    return { ok: true, teks: '🚭 Program Berhenti Merokok 7 hari dimulai! Lewati fase sakau seminggu untuk memulihkan paru-paru 100%.' };
  }
  function medicalCheckup(S) {
    var e = siapkan(S), biaya = 650000;
    var by = UANG.bayarPilihan(S, biaya, 'Medical Check-Up Lengkap RS', S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.burnout = false;
    S.diri.kesehatan = 100;
    S.diri.sakit = null;
    e.paru = Math.min(100, e.paru + 15);
    return { ok: true, menit: 90, teks: '🩺 Medical Check-Up selesai (' + rp(biaya) + ')! Kesehatan 100%, paru-paru ' + e.paru + '%, burnout pulih.' };
  }

  /* ---------- 12. Peliharaan & Lomba Burung Kicau ---------- */
  function beliHewan(S, id) {
    var e = siapkan(S), h = HEWAN_LIST.filter(function (x) { return x.id === id; })[0];
    if (!h) return 'Hewan tidak ditemukan.';
    if (e.hewan.some(function (x) { return x.id === id; })) return 'Kamu sudah memelihara ' + h.nama + '.';
    var by = UANG.bayarPilihan(S, h.harga, 'Peliharaan: ' + h.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.hewan.push({ id: h.id, nama: h.nama, ikon: h.ikon, vaksin: S.hari + 180, lomba: h.lomba });
    if (e.pakanSampai < S.hari) e.pakanSampai = S.hari + 7;
    return { ok: true, teks: h.ikon + ' ' + h.nama + ' kini tinggal di rumahmu! Stres harian berkurang & keluarga makin senang.' };
  }
  function beliPakanHewan(S) {
    var e = siapkan(S);
    if (!e.hewan.length) return 'Belum punya hewan peliharaan.';
    var biaya = e.hewan.reduce(function (t, x) { var m = HEWAN_LIST.filter(function (a) { return a.id === x.id; })[0]; return t + (m ? m.pakanMinggu : 60000); }, 0) * 4;
    var by = UANG.bayarPilihan(S, biaya, 'Pakan & Vaksin Hewan Peliharaan (1 bulan)', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    e.pakanSampai = Math.max(S.hari, e.pakanSampai || S.hari) + 30;
    return { ok: true, teks: '🐾 Stok pakan & vitamin peliharaan aman untuk 30 hari (' + rp(biaya) + ')!' };
  }
  function lombaBurung(S) {
    var e = siapkan(S);
    if (!e.hewan.some(function (x) { return x.id === 'murai_batu'; })) return 'Harus memelihara Burung Murai Batu Medan untuk ikut Lomba Kicau!';
    if (e.lombaHari === S.hari) return 'Sudah ikut Lomba Kicau hari ini.';
    var daftar = 200000;
    var by = UANG.bayarPilihan(S, daftar, 'Tiket Lomba Kicau Murai Batu', S._metodeBayar || 'dompet');
    if (by !== true) return by;
    e.lombaHari = S.hari;
    var r = Math.random();
    if (r < 0.22) {
      var h1 = 6500000; S.uang.dompet = (S.uang.dompet || 0) + h1;
      return { ok: true, menit: 120, teks: '🏆 JUARA 1 LOMBA KICAU MURAI BATU! Trofi + hadiah tunai ' + rp(h1) + '!' };
    }
    if (r < 0.52) {
      var h2 = 2200000; S.uang.dompet = (S.uang.dompet || 0) + h2;
      return { ok: true, menit: 120, teks: '🥈 JUARA 2/3 Lomba Kicau Murai Batu! Dapat hadiah tunai ' + rp(h2) + '!' };
    }
    return { ok: true, menit: 120, teks: '🐦 Murai Batumu tampil gagah di gantangan tapi belum masuk podium 3 besar. Latih lagi minggu depan!' };
  }

  /* ---------- 13. Lelang Sitaan Bank / Pegadaian ---------- */
  function daftarLelang(S) {
    var e = siapkan(S), t = KAL.tgl(S.hari || 0), blnKey = t.y * 12 + t.m;
    if (e.lelang && e.lelang.bln === blnKey) return e.lelang.items;
    var items = [
      { id: 'lel_emas', jenis: 'emas', qty: 5, nama: 'Lelang Emas Antam 2,5 gr (Sitaan Pegadaian)', pasar: 4300000, bid: 2850000, terjual: false },
      { id: 'lel_hp', jenis: 'hp', hpId: 's25ultra', nama: 'Lelang Samsung S25 Ultra (Sitaan Bank)', pasar: 22999000, bid: 14500000, terjual: false },
      { id: 'lel_mtr', jenis: 'motor', motorId: 'nmax', nama: 'Lelang Yamaha NMAX 155 (Tarik Leasing)', pasar: 32175000, bid: 19800000, terjual: false },
      { id: 'lel_mbl', jenis: 'mobil', mobilId: 'avanza', nama: 'Lelang Toyota Avanza (Sitaan Bank)', pasar: 244200000, bid: 148000000, terjual: false }
    ];
    e.lelang = { bln: blnKey, items: items };
    return items;
  }
  function ikutBidLelang(S, idx) {
    var items = daftarLelang(S), it = items[+idx];
    if (!it || it.terjual) return 'Lot lelang sudah terjual.';
    if (Math.random() < 0.35) {
      it.bid = Math.round(it.bid * 1.12 / 50000) * 50000;
      return '🔨 Peserta NPC lain menaikkan tawaran! Harga bid saat ini naik ke ' + rp(it.bid) + '. Coba bid lagi!';
    }
    var by = UANG.bayarPilihan(S, it.bid, 'Menang Lelang Bank: ' + it.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    it.terjual = true;
    if (it.jenis === 'emas') {
      S.invest = S.invest || { milik: {}, harga: {} };
      var curE = S.invest.milik.emas_antam || { qty: 0, modal: 0 };
      curE.qty += it.qty; curE.modal += it.bid; S.invest.milik.emas_antam = curE;
    } else if (it.jenis === 'hp') {
      S.gadget = S.gadget || {};
      S.gadget[it.hpId] = { id: it.hpId, dibeli: S.hari, pakai: 0, hargaBeli: it.bid, bh: 94 };
    } else {
      /* nilai aset langsung masuk rekening hasil balik nama / jual cepat atau tambah modal */
      var untung = Math.round((it.pasar * 0.85) - it.bid);
      S.bank.saldo += Math.round(it.pasar * 0.85);
      S.bank.mutasi.unshift({ n: S.hari, ket: 'Flipping Lelang Bank (' + it.nama + ')', jml: Math.round(it.pasar * 0.85) });
      return { ok: true, teks: '🔨 MENANG LELANG ' + it.nama + ' (' + rp(it.bid) + ') & langsung terjual cepat di pasar profit +' + rp(Math.max(0, untung)) + '!' };
    }
    return { ok: true, teks: '🔨 MENANG LELANG! ' + it.nama + ' berhasil dimenangkan seharga ' + rp(it.bid) + ' (hemat ' + rp(it.pasar - it.bid) + ')!' };
  }

  /* ---------- 14. Bisnis Kos-Kosan Pintu & Kontrakan ---------- */
  function bangunKosan(S, paketId) {
    var e = siapkan(S), pk = KOSAN_PAKET.filter(function (x) { return x.id === paketId; })[0];
    if (!pk) return 'Paket kos-kosan tidak ditemukan.';
    var by = UANG.bayarPilihan(S, pk.modal, 'Bangun Properti Sewa: ' + pk.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    if (!e.kosan) e.kosan = { pintu: pk.pintu, sewaPintu: pk.sewaPintu, wifi: false, rusak: false, totalHasil: 0 };
    else { e.kosan.pintu += pk.pintu; e.kosan.sewaPintu = Math.max(e.kosan.sewaPintu, pk.sewaPintu); }
    return { ok: true, teks: '🏘️ ' + pk.nama + ' selesai dibangun! Total ' + e.kosan.pintu + ' pintu kos aktif menghasilkan passive income tiap tanggal 1.' };
  }
  function kelolaKosan(S, aksi) {
    var e = siapkan(S);
    if (!e.kosan) return 'Belum memiliki usaha Kos-kosan.';
    if (aksi === 'wifi') {
      if (e.kosan.wifi) return 'WiFi Kos sudah terpasang.';
      var byW = UANG.bayarPilihan(S, 3500000, 'Pasang WiFi Mesh Kos-kosan', S._metodeBayar || 'bank');
      if (byW !== true) return byW;
      e.kosan.wifi = true;
      return { ok: true, teks: '📶 WiFi Kos terpasang! Harga sewa tiap pintu naik +15% & anak kos makin betah.' };
    }
    if (aksi === 'perbaiki') {
      if (!e.kosan.rusak) return 'Kondisi bangunan kos sedang bagus.';
      var byR = UANG.bayarPilihan(S, 1500000, 'Perbaiki Atap Bocor & Keran Kos', S._metodeBayar || 'bank');
      if (byR !== true) return byR;
      e.kosan.rusak = false;
      return { ok: true, teks: '🔧 Genteng bocor & keran kos selesai diperbaiki! Pendapatan sewa kembali 100%.' };
    }
    return 'Aksi tidak dikenal.';
  }

  /* ---------- 15. Orang Tua di Kampung & Warisan Maksimal 2x (1x Ayah, 1x Ibu jika Berada) ---------- */
  function kirimOrtu(S, nominal) {
    var e = siapkan(S);
    if (!e.ortu.ayah.hidup && !e.ortu.ibu.hidup) return 'Kedua orang tua sudah tiada. Doakan selalu dari rumah.';
    nominal = Math.max(100000, Math.round(+nominal || 500000));
    var by = UANG.bayarPilihan(S, nominal, 'Kirim uang bulanan untuk Orang Tua di kampung', S._metodeBayar || 'bank');
    if (by !== true) return by;
    var t = KAL.tgl(S.hari);
    e.ortu.kirimBulan = t.y * 12 + t.m;
    if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -14);
    e.reputasi = Math.min(100, e.reputasi + 3);
    return { ok: true, teks: '💝 Kirim ' + rp(nominal) + ' ke Orang Tua di kampung. Orang tua sangat bahagia & mendoakan rezekimu makin lancar!' };
  }
  function teleponOrtu(S) {
    var e = siapkan(S);
    if (!e.ortu.ayah.hidup && !e.ortu.ibu.hidup) return 'Kedua orang tua sudah berpulang.';
    if (e.ortu.telpHari === S.hari) return 'Sudah menelepon orang tua hari ini.';
    e.ortu.telpHari = S.hari;
    if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -10);
    return { ok: true, menit: 15, teks: '📞 Ngobrol hangat 15 menit dengan Orang Tua di kampung. Hati tenang & stres mereda!' };
  }

  /* ---------- 16. Tabungan USD (Beli / Jual Valas) ---------- */
  function transaksiUsd(S, aksi, jmlUsd) {
    var e = siapkan(S), kurs = e.kursUsd || 16200;
    jmlUsd = Math.max(10, Math.round(+jmlUsd || 100));
    if (aksi === 'beli') {
      var biaya = Math.round(jmlUsd * kurs);
      var by = UANG.bayarPilihan(S, biaya, 'Beli Valas $' + jmlUsd + ' USD (kurs ' + rp(kurs) + ')', S._metodeBayar || 'bank');
      if (by !== true) return by;
      e.tabunganUsd = (e.tabunganUsd || 0) + jmlUsd;
      return { ok: true, teks: '💵 Beli $' + jmlUsd + ' USD (' + rp(biaya) + ') berhasil! Total Tabungan USD: $' + e.tabunganUsd.toLocaleString('id-ID') + '.' };
    }
    var jual = Math.min(e.tabunganUsd || 0, jmlUsd);
    if (jual <= 0) return 'Belum punya saldo Tabungan USD.';
    var cair = Math.round(jual * (kurs - 100));
    e.tabunganUsd -= jual;
    S.bank.saldo += cair;
    S.bank.mutasi.unshift({ n: S.hari, ket: 'Jual Valas $' + jual + ' USD', jml: cair });
    return { ok: true, teks: '💵 Jual $' + jual + ' USD cair ' + rp(cair) + ' ke rekening!' };
  }

  /* ---------- 17. Modifikasi Kendaraan (Part & Cat Warna Bodi) ---------- */
  function modifKendaraan(S, jenis, partId) {
    var knd = jenis === 'mobil' ? S.mobil : S.motor;
    if (!knd) return jenis === 'mobil' ? 'Belum punya mobil.' : 'Belum punya motor.';
    knd.modif = knd.modif || {};
    var pt = MODIF_PART.filter(function (x) { return x.id === partId; })[0];
    if (!pt) return 'Part modifikasi tidak dikenal.';
    if (knd.modif[partId]) return pt.nama + ' sudah terpasang di ' + knd.nama + '.';
    var h = jenis === 'mobil' ? pt.hargaMobil : pt.hargaMotor;
    var by = UANG.bayarPilihan(S, h, 'Modif ' + knd.nama + ': ' + pt.nama, S._metodeBayar || 'bank');
    if (by !== true) return by;
    knd.modif[partId] = true;
    if (partId === 'shock_ohlins' && S.ojek) S.ojek.rating = Math.min(5, Math.round(((S.ojek.rating || 4.85) + 0.06) * 100) / 100);
    S.hariIni.bengkel = (S.hariIni.bengkel || 0) + h;
    return { ok: true, menit: 45, teks: '🔧 ' + pt.nama + ' terpasang di ' + knd.nama + ' (' + rp(h) + ')! ' + pt.ket };
  }
  function catKendaraan(S, jenis, warnaId) {
    var knd = jenis === 'mobil' ? S.mobil : S.motor;
    if (!knd) return jenis === 'mobil' ? 'Belum punya mobil.' : 'Belum punya motor.';
    var w = WARNA_CAT.filter(function (x) { return x.id === warnaId; })[0];
    if (!w) return 'Warna cat tidak ditemukan.';
    var h = jenis === 'mobil' ? w.harga * 3 : w.harga;
    if (h > 0) {
      var by = UANG.bayarPilihan(S, h, 'Repaint ' + knd.nama + ': ' + w.nama, S._metodeBayar || 'bank');
      if (by !== true) return by;
    }
    knd.warnaCat = w.hex || null;
    knd.warnaNama = w.nama;
    return { ok: true, menit: 60, teks: '🎨 ' + knd.nama + ' selesai dicat ' + w.nama + (h > 0 ? ' (' + rp(h) + ')' : '') + '! Langsung terlihat di jalan.' };
  }

  /* ---------- 19. Provider SIM & Sinyal Realistis ---------- */
  function gantiProvider(S, id) {
    var e = siapkan(S), p = PROVIDER_LIST.filter(function (x) { return x.id === id; })[0];
    if (!p) return 'Provider tidak ditemukan.';
    if (e.provider === id) return 'Kartu SIM aktifmu sudah ' + p.nama + '.';
    var biaya = 35000;
    var by = UANG.bayarPilihan(S, biaya, 'Beli Kartu Perdana ' + p.nama, S._metodeBayar || 'dompet');
    if (by !== true) return by;
    e.provider = id;
    return { ok: true, teks: '📡 Kartu SIM diganti ke ' + p.nama + ' (' + rp(biaya) + ')! ' + p.ket };
  }
  function infoSinyal(S) {
    var e = siapkan(S);
    var p = PROVIDER_LIST.filter(function (x) { return x.id === e.provider; })[0] || PROVIDER_LIST[0];
    var tier = (g.KK_HIDUP && g.KK_HIDUP.tierWilayah) ? g.KK_HIDUP.tierWilayah(S) : 'kota';
    var bar = tier === 'desa' ? p.desa : tier === 'kabupaten' ? p.kab : p.kota;
    var cw = g.KK_DUNIA && g.KK_DUNIA.infoCuacaSekarang ? g.KK_DUNIA.infoCuacaSekarang(S) : null;
    if (cw && cw.hujan >= 2 && bar > 0) bar = Math.max(0, bar - 1);
    var teks = bar >= 4 ? '5G' : bar === 3 ? '4G+' : bar === 2 ? '4G' : bar === 1 ? 'E' : 'No Svc';
    var faktorOjol = bar >= 3 ? 1.0 : bar === 2 ? 0.90 : bar === 1 ? 0.55 : 0.15;
    return { provider: p, bar: bar, teks: teks, faktorOjol: faktorOjol, hilang: bar === 0 };
  }

  /* ---------- 20. Dana Pensiun & Mode Generasi ke-2 (Legacy) ---------- */
  function setorPensiun(S, nominal) {
    var e = siapkan(S);
    nominal = Math.max(100000, Math.round(+nominal || 500000));
    var by = UANG.bayarPilihan(S, nominal, 'Setor Dana Pensiun DPLK', S._metodeBayar || 'bank');
    if (by !== true) return by;
    e.pensiun = (e.pensiun || 0) + nominal;
    return { ok: true, teks: '🧓 Dana Pensiun DPLK bertambah ' + rp(nominal) + ' (Total: ' + rp(e.pensiun) + ', tumbuh 7,5%/thn & cair bulanan mulai usia 55 thn)!' };
  }
  function lanjutGenerasiAnak(S, anakId) {
    var e = siapkan(S);
    var uPem = KAL.usia(S.hari, S.profil && S.profil.tglLahir);
    var anak = (S.keluarga || []).filter(function (k) { return k.id === anakId && k.peran === 'anak'; })[0];
    if (!anak) return 'Pilih anak kandung yang akan melanjutkan generasi berikutnya.';
    var uAnak = KAL.usia(S.hari, anak.tglLahir);
    if (uPem < 48 && uAnak < 18) return 'Mode Generasi ke-2 terbuka saat usiamu ≥ 48 tahun atau anak sudah dewasa (≥ 18 tahun).';
    var namaLama = S.namaPemain || 'Orang Tua';
    S.namaPemain = anak.nama;
    S.profil.gender = anak.gender || 'cowok';
    S.profil.tglLahir = anak.tglLahir || '2006-05-15';
    S.profil.pendidikan = uAnak >= 22 ? 's1' : 'sma';
    S.profil.kedinasan = {};
    S.profil.dokterTahap = '';
    S.keluarga = (S.keluarga || []).filter(function (k) { return k.id !== anakId; });
    S.generasi = (S.generasi || 1) + 1;
    S.diri.stamina = 100; S.diri.kesehatan = 100; e.paru = 100; e.burnout = false;
    /* orang tua baru adalah karakter generasi sebelumnya! */
    e.ortu = {
      berada: (S.bank.saldo || 0) >= 100000000,
      ayah: { nama: namaLama + ' (Gen-' + (S.generasi - 1) + ')', usia: uPem, hidup: true, warisanDiterima: false },
      ibu: { nama: 'Ibu (Gen-' + (S.generasi - 1) + ')', usia: Math.max(40, uPem - 2), hidup: true, warisanDiterima: false },
      kirimBulan: -1, telpHari: -1
    };
    return { ok: true, teks: '👑 GENERASI KE-' + S.generasi + ' DIMULAI! Kini kamu bermain sebagai ' + anak.nama + ' (' + uAnak + ' thn) mewarisi seluruh rumah, kendaraan, bisnis & tabungan keluarga!' };
  }

  /* ---------- Simulasi Harian (Dipanggil 1x/hari — O(1) super ringan!) ---------- */
  function gantiHari(S, nLama, nBaru) {
    var e = siapkan(S), kabar = [], tL = KAL.tgl(nLama), tB = KAL.tgl(nBaru);
    /* 1. Fluktuasi Kurs USD harian (Rp14.800–Rp18.500) */
    var chgUsd = (Math.random() - 0.49) * 180;
    e.kursUsd = Math.round(Math.max(14800, Math.min(18500, (e.kursUsd || 16200) + chgUsd)) / 10) * 10;
    /* 2. Macet / Demo acak kota (~6%/hari di kota) */
    e.macetHari = Math.random() < 0.06 ? nBaru : -1;
    if (e.macetHari === nBaru) kabar.push('🚧 Info Lalu Lintas: Ada demo/macet padat di jalan utama hari ini, waktu tempuh sedikit lebih lama.');
    /* 3. Kesehatan Mental (Burnout) & Paru-paru & Program Berhenti Merokok */
    if ((S.diri && S.diri.stres || 0) >= 82) { e.burnout = true; kabar.push('🧠 Stres berat memicu Burnout! Istirahat, Gym, atau Medical Check-Up di APK Ekosistem.'); }
    if (S.rokok && (S.rokok.hariIni || 0) >= 24) e.paru = Math.max(45, e.paru - 1);
    if (e.sakauSampai > 0) {
      if (nBaru > e.sakauSampai) {
        e.sakauSampai = -1; e.paru = 100;
        kabar.push('🚭 SELAMAT! Kamu berhasil melewati 7 hari berhenti merokok! Paru-paru pulih 100% & stamina jauh lebih awet!');
      } else {
        kabar.push('🚭 Hari ke-' + (8 - (e.sakauSampai - nBaru)) + '/7 berhenti merokok (fase sakau — tahan godaan!).');
      }
    }
    /* 4. Peliharaan di rumah */
    if (e.hewan.length) {
      if (e.pakanSampai >= nBaru) {
        var totStr = e.hewan.reduce(function (t, x) { var m = HEWAN_LIST.filter(function (a) { return a.id === x.id; })[0]; return t + (m ? m.stresTurun : 5); }, 0);
        if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -Math.min(18, totStr));
      } else {
        kabar.push('🐾 Pakan hewan peliharaan habis! Beli pakan di APK Ekosistem → Peliharaan.');
      }
    }
    /* 5. Kolam Koi mengurangi stres tiap pagi */
    if (e.renovasi && e.renovasi.kolam_koi && g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, -10);
    /* 6. Pinjol Ilegal: bunga harian 3% & sebar data jika telat 1 hari! */
    if (e.pinjol) {
      e.pinjol.total = Math.round(e.pinjol.total * 1.03 / 5000) * 5000;
      if (nBaru > e.pinjol.tempoHari) {
        if (!e.pinjol.sebarData) {
          e.pinjol.sebarData = true;
          (S.teman || []).forEach(function (tm) { tm.hubungan = Math.max(0, (tm.hubungan || 40) - 20); });
          (S.keluarga || []).forEach(function (kl) { if (kl.bahagia != null) kl.bahagia = Math.max(0, kl.bahagia - 18); });
          if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, 30);
          kabar.push('☠️ PINJOL ILEGAL SEBAR DATA KE SELURUH KONTAK TEMAN & KELUARGA! Hubungan semua teman anjlok −20%! Segera lunasi (' + rp(e.pinjol.total) + ')!');
        } else {
          kabar.push('☠️ Teror Pinjol Ilegal berlanjut! Total tagihan membengkak jadi ' + rp(e.pinjol.total) + '.');
        }
      }
    }
    /* 7. Pegadaian: lelang otomatis jika lewat 15 hari dari jatuh tempo */
    if (e.gadai.length) {
      e.gadai = e.gadai.filter(function (gd) {
        if (nBaru > gd.tempoHari + 15) {
          kabar.push('⚖️ Barang gadai ' + gd.nama + ' dilelang Pegadaian karena lewat batas tebus.');
          return false;
        }
        return true;
      });
    }
    /* 8. Kejadian Viral Sosial Media (~2%/hari) */
    if (Math.random() < 0.022 && S.dunia && S.dunia.sosmed) {
      if (e.reputasi >= 55 && Math.random() < 0.72) {
        var fBaru = 400 + Math.floor(Math.random() * 1400), bonusV = 1250000;
        S.dunia.sosmed.ig = (S.dunia.sosmed.ig || 0) + fBaru;
        S.dunia.sosmed.viralSampai = nBaru + 4;
        e.reputasi = Math.min(100, e.reputasi + 12);
        S.bank.saldo += bonusV;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Apresiasi Viral Baik & Undangan Podcast', jml: bonusV });
        kabar.push('🌟 VIRAL POSITIF! Aksi jujurmu di jalan terekam warga (+' + fBaru + ' pengikut IG & apresiasi ' + rp(bonusV) + ')!');
      } else {
        e.reputasi = Math.max(10, e.reputasi - 22);
        e.suspendOjolSampai = nBaru + 2;
        kabar.push('📉 VIRAL NEGATIF! Video salah paham di jalan ramai di X/Threads. Reputasi turun ke ' + e.reputasi + ' & akun ojol kena suspend 2 hari (buat klarifikasi di Sosmed!).');
      }
    }
    /* 9. Pergantian Bulan: Kos-kosan Passive Income, Harga BBM, Pensiun, SLIK DC, & Pemilu */
    if (tB.m !== tL.m) {
      e.faktorBbm = Math.round((0.94 + Math.random() * 0.14) * 100) / 100;
      if (e.kosan && e.kosan.pintu > 0) {
        if (!e.kosan.rusak && Math.random() < 0.14) { e.kosan.rusak = true; kabar.push('🏚️ Drama Anak Kos: Ada atap bocor di Kos-kosan! Perbaiki di APK Ekosistem agar sewa tidak turun.'); }
        var multK = (e.kosan.wifi ? 1.15 : 1) * (e.kosan.rusak ? 0.75 : 1) * (0.88 + Math.random() * 0.12);
        var hasilKos = Math.round(e.kosan.pintu * e.kosan.sewaPintu * multK * (e.inflasi || 1) / 10000) * 10000;
        e.kosan.totalHasil = (e.kosan.totalHasil || 0) + hasilKos;
        S.bank.saldo += hasilKos;
        S.bank.mutasi.unshift({ n: nBaru, ket: 'Sewa Bulanan Kos-kosan (' + e.kosan.pintu + ' pintu)', jml: hasilKos });
        S.penghasilanBulanIni = (S.penghasilanBulanIni || 0) + hasilKos;
        kabar.push('🏘️ Passive Income Kos-kosan (' + e.kosan.pintu + ' pintu) cair ' + rp(hasilKos) + ' ke rekening!');
      }
      if (e.pensiun > 0) {
        e.pensiun = Math.round(e.pensiun * (1 + 0.075 / 12));
        var uP = KAL.usia(nBaru, S.profil && S.profil.tglLahir);
        if (uP >= 55) {
          var cairP = Math.round(e.pensiun * 0.012 / 10000) * 10000;
          S.bank.saldo += cairP;
          S.bank.mutasi.unshift({ n: nBaru, ket: 'Pencairan Bulanan Dana Pensiun DPLK', jml: cairP });
          kabar.push('🧓 Dana Pensiun bulanan cair ' + rp(cairP) + ' ke rekening!');
        }
      }
      var slk = hitungSlik(S);
      if (slk.kol >= 5) {
        if (g.KK_HIDUP) g.KK_HIDUP.ubahStres(S, 20);
        kabar.push('🚨 SLIK OJK KOL 5 (MACET): Debt Collector mendatangi rumah menagih tunggakan ' + rp(slk.totalTunggakan) + ' (' + slk.rincian.join(', ') + ')!');
      }
      if (tB.m === 3 && e.sptTahun !== tB.y) kabar.push('📄 Bulan Maret: Jangan lupa lapor SPT Tahunan ' + tB.y + ' di APK Ekosistem!');
      if (pemutihanAktif(S)) kabar.push('🏷️ Pemprov menggelar PEMUTIHAN DENDA PAJAK STNK bulan ini (s/d tgl 20)!');
    }
    /* 10. Pergantian Tahun: Inflasi 3–5%, Pemilu/UMK, & Usia Orang Tua + Warisan MAKS 2x (1x Ayah, 1x Ibu) */
    if (tB.y !== tL.y) {
      var infBaru = 0.032 + Math.random() * 0.018;
      e.inflasi = Math.round((e.inflasi || 1) * (1 + infBaru) * 1000) / 1000;
      var naikUmk = 0.04 + Math.random() * 0.035;
      e.umkMult = Math.round((e.umkMult || 1) * (1 + naikUmk) * 1000) / 1000;
      kabar.push('📊 Ekonomi ' + tB.y + ': Inflasi tahunan +' + (infBaru * 100).toFixed(1) + '% & UMK resmi naik +' + (naikUmk * 100).toFixed(1) + '%!');
      if (tB.y % 5 === 4 || tB.y % 5 === 0) {
        e.pemiluTahun = tB.y;
        kabar.push('🗳️ Tahun Politik & Pemilu ' + tB.y + '! Suasana kampanye ramai di kota/desa & kebijakan ekonomi baru menanti.');
      }
      /* Usia orang tua bertambah; jika wafat & ortu berada → warisan TEPAT 1x dari Ayah & 1x dari Ibu (maks 2 kali!) */
      ['ayah', 'ibu'].forEach(function (siapa) {
        var ot = e.ortu && e.ortu[siapa];
        if (!ot || !ot.hidup) return;
        ot.usia = (ot.usia || 56) + 1;
        var pelWafat = ot.usia >= 78 ? 0.25 : ot.usia >= 68 ? 0.09 : ot.usia >= 60 ? 0.025 : 0.005;
        if (Math.random() < pelWafat) {
          ot.hidup = false;
          if (e.ortu.berada && !ot.warisanDiterima) {
            ot.warisanDiterima = true;
            var nomW = siapa === 'ayah' ? (120000000 + Math.floor(Math.random() * 180) * 1000000) : (85000000 + Math.floor(Math.random() * 130) * 1000000);
            S.bank.saldo += nomW;
            S.bank.mutasi.unshift({ n: nBaru, ket: 'Warisan sah dari ' + (siapa === 'ayah' ? 'Almarhum Ayah' : 'Almarhumah Ibu'), jml: nomW });
            kabar.push('🕊️ Innalillahi/Turut berduka: ' + (siapa === 'ayah' ? 'Ayah' : 'Ibu') + ' (' + ot.usia + ' thn) berpulang. Kamu menerima warisan sah sebesar ' + rp(nomW) + ' (1/2 jatah warisan orang tua).');
          } else {
            kabar.push('🕊️ Berita duka dari kampung: ' + (siapa === 'ayah' ? 'Ayah' : 'Ibu') + ' (' + ot.usia + ' thn) telah berpulang dengan tenang.');
          }
        }
      });
    }
    return kabar;
  }

  g.KK_EKO = {
    PROVIDER_LIST: PROVIDER_LIST, RENOVASI_LIST: RENOVASI_LIST, HEWAN_LIST: HEWAN_LIST,
    KOSAN_PAKET: KOSAN_PAKET, MODIF_PART: MODIF_PART, WARNA_CAT: WARNA_CAT,
    siapkan: siapkan, cekOverheatHp: cekOverheatHp, serviceHp: serviceHp,
    hitungSlik: hitungSlik, notifBayarDekat: notifBayarDekat,
    gadaiBarang: gadaiBarang, nilaiTebusGadai: nilaiTebusGadai, tebusGadai: tebusGadai,
    cekBanjirMogok: cekBanjirMogok, kurasMesinAir: kurasMesinAir,
    klarifikasiSosmed: klarifikasiSosmed, infoOrdal: infoOrdal, mintaRekomendasi: mintaRekomendasi,
    beliRenovasi: beliRenovasi, faktorHematPln: faktorHematPln,
    pemutihanAktif: pemutihanAktif, laporSpt: laporSpt,
    pinjamPinjol: pinjamPinjol, lunasPinjol: lunasPinjol,
    daftarGym: daftarGym, latihanGym: latihanGym, mulaiBerhentiRokok: mulaiBerhentiRokok, medicalCheckup: medicalCheckup,
    beliHewan: beliHewan, beliPakanHewan: beliPakanHewan, lombaBurung: lombaBurung,
    daftarLelang: daftarLelang, ikutBidLelang: ikutBidLelang,
    bangunKosan: bangunKosan, kelolaKosan: kelolaKosan,
    kirimOrtu: kirimOrtu, teleponOrtu: teleponOrtu,
    transaksiUsd: transaksiUsd, modifKendaraan: modifKendaraan, catKendaraan: catKendaraan,
    gantiProvider: gantiProvider, infoSinyal: infoSinyal,
    setorPensiun: setorPensiun, lanjutGenerasiAnak: lanjutGenerasiAnak,
    gantiHari: gantiHari
  };
})(window);
