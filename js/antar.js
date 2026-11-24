/* antar.js — pesanan antar: WhatsApp langganan, GoFood/GrabFood/ShopeeFood, dan pesanan besar.
   Rancangan bagian "Pesan antar". Angka bertanda "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, M = g.KK_MENU, KAL = g.KK_KAL;
  var WA_PER_JAM = 0.25, OJOL_PER_JAM = 0.4;      /* setelan, dikali keramaian jam */
  var PELUANG_PESANAN_BESAR = 0.12;               /* setelan, per hari */
  var DRIVER_DATANG = 10, BATAL_OJOL = 30, BATAL_WA_BARU = 15, PROSES_DAFTAR = 3;
  var BATAS_ES = 25, BATAS_ES_TAS = 40;
  var nomor = 0;

  function komplain(S, teks) { S.komplain++; if (g.KK_DUNIA) g.KK_DUNIA.catatKomplain(S, teks); }
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function menuDari(id) { return M.MENU.filter(function (m) { return m.id === id; })[0]; }
  function waktu(S) { return S.hari * 1440 + S.menit; }

  function siapkan(S) {
    S.pesanan = S.pesanan || [];
    S.aturAntar = S.aturAntar || { tarifKm: 2000, minimum: 5000, gratisGelas: 3, gratisDekat: 1, maksKm: 5 };
    S.platform = S.platform || {};
    N.platform.forEach(function (p) { S.platform[p.id] = S.platform[p.id] || { status: 'tidak', markup: 20 }; });
    S.payout = S.payout || [];
    S.komplain = S.komplain || 0;
    return S;
  }

  function ongkir(S, gelas, jarak) {
    var a = S.aturAntar;
    if (gelas >= a.gratisGelas || jarak < a.gratisDekat) return 0;
    return Math.max(a.minimum, Math.round(jarak * a.tarifKm / 500) * 500);
  }
  function jumlahGelas(p) { return p.items.reduce(function (t, x) { return t + x.qty; }, 0); }
  function nilaiMenu(p) { return p.items.reduce(function (t, x) { return t + hargaItem(p, x) * x.qty; }, 0); }
  function hargaItem(p, x) {
    var h = menuDari(x.menu).harga;
    return p.jenis === 'ojol' ? Math.round(h * (1 + p.markup / 100) / 500) * 500 : h;
  }
  function pilihMenu() { var r = Math.random(); return r < 0.35 ? 'aren' : r < 0.6 ? 'klasik' : r < 0.75 ? 'cokelat' : r < 0.87 ? 'teh' : r < 0.94 ? 'hitam' : 'sanger'; }
  function isiAcak(maks) {
    var n = 1 + Math.floor(Math.random() * maks), peta = {};
    for (var i = 0; i < n; i++) { var id = pilihMenu(); peta[id] = (peta[id] || 0) + 1; }
    return Object.keys(peta).map(function (id) { return { menu: id, qty: peta[id], siap: 0 }; });
  }

  function buatWa(S) {
    var jarak = Math.round((0.5 + Math.random() * (S.aturAntar.maksKm - 0.5)) * 10) / 10, items = isiAcak(4);
    var p = { id: ++nomor + '-' + S.hari, jenis: 'wa', nama: acak(N.namaOrang), items: items, jarak: jarak, status: 'baru', dibuat: waktu(S),
      bayar: acak(['tunai', 'tunai', 'qris', 'transfer']), biaya: 0 };
    p.ongkir = ongkir(S, jumlahGelas(p), jarak);
    return p;
  }
  function buatOjol(S, plat) {
    var jarak = Math.round((0.5 + Math.random() * 6) * 10) / 10;
    return { id: ++nomor + '-' + S.hari, jenis: 'ojol', platform: plat.id, nama: acak(N.namaOrang), items: isiAcak(3), jarak: jarak, status: 'racik', dibuat: waktu(S),
      markup: S.platform[plat.id].markup, bayar: 'platform', ongkir: 0, biaya: 0, driver: waktu(S) + DRIVER_DATANG };
  }
  function buatBesar(S, nBesok) {
    var qty = 10 + Math.floor(Math.random() * 16), jarak = Math.round((0.8 + Math.random() * 4) * 10) / 10;
    var peta = {}; for (var i = 0; i < qty; i++) { var id = Math.random() < 0.6 ? 'aren' : pilihMenu(); peta[id] = (peta[id] || 0) + 1; }
    return { id: ++nomor + '-' + S.hari, jenis: 'besar', nama: acak(N.kantor), items: Object.keys(peta).map(function (id) { return { menu: id, qty: peta[id], siap: 0 }; }),
      jarak: jarak, status: 'baru', dibuat: waktu(S), untuk: nBesok * 1440 + acak([600, 660, 780, 900]), bayar: 'transfer', ongkir: 0, minta: 'gratis ongkir', biaya: 0 };
  }

  /* ---------- tiap menit game ---------- */
  function jalan(S, dMenit, pengali) {
    var kabar = [], t = waktu(S);
    if (S.fase === 'buka' && dMenit > 0) {
      var aktifWa = S.pesanan.filter(function (p) { return p.jenis === 'wa' && p.status !== 'selesai' && p.status !== 'batal'; }).length;
      if (aktifWa < 4 && Math.random() < WA_PER_JAM * pengali * (g.KK_DUNIA ? g.KK_DUNIA.faktorAntar(S) : 1) * (g.KK_USAHA && S.usaha ? g.KK_USAHA.faktorAntar(S) : 1) * dMenit / 60) { S.pesanan.push(buatWa(S)); kabar.push('Pesanan WhatsApp baru.'); }
      N.platform.forEach(function (pl) {
        if (S.platform[pl.id].status === 'aktif' && Math.random() < OJOL_PER_JAM * pengali * (g.KK_DUNIA ? g.KK_DUNIA.faktorAntar(S) : 1) * dMenit / 60) { S.pesanan.push(buatOjol(S, pl)); kabar.push('Pesanan ' + pl.nama + ' masuk.'); }
      });
    }
    S.pesanan.forEach(function (p) {
      if (p.status === 'baru' && p.jenis === 'wa' && t - p.dibuat > BATAL_WA_BARU) { p.status = 'batal'; p.alasan = 'Tidak dibalas'; }
      if (p.jenis === 'ojol' && (p.status === 'racik') && t - p.dibuat > BATAL_OJOL) { p.status = 'batal'; p.alasan = 'Kelamaan, pembeli membatalkan'; komplain(S, 'Pesanan lewat aplikasi lama sekali, akhirnya dibatalkan.'); S.hariIni.terbuang += p.biaya; kabar.push('Pesanan ' + namaPlatform(p) + ' ' + p.nama + ' dibatalkan karena kelamaan.'); }
      if (p.jenis === 'ojol' && p.status === 'siap' && t >= p.driver) { selesai(S, p, kabar, 'Driver mengambil pesanan ' + namaPlatform(p) + ' ' + p.nama + '.'); }
      if (p.status === 'jalan' && t >= p.eta) { if (p.esCair) { komplain(S, 'Es kopinya sampai sudah cair.'); kabar.push('Es di pesanan ' + p.nama + ' cair di jalan.'); } selesai(S, p, kabar, 'Kurir sudah mengantar pesanan ' + p.nama + '.'); }
      if (p.jenis === 'besar' && p.status !== 'selesai' && p.status !== 'batal' && p.status !== 'baru' && p.status !== 'jalan' && t > p.untuk + 30) {
        p.status = 'batal'; p.alasan = 'Terlambat dari jam pesanan'; komplain(S, 'Pesanan untuk acara terlambat, mengecewakan.'); S.hariIni.terbuang += p.biaya; kabar.push(p.nama + ' membatalkan pesanan karena terlambat.');
      }
    });
    return kabar;
  }
  function namaPlatform(p) { var pl = N.platform.filter(function (x) { return x.id === p.platform; })[0]; return pl ? pl.nama : ''; }

  /* pesanan sampai di pembeli: catat uang */
  function selesai(S, p, kabar, teks) {
    var hi = S.hariIni, nilai = nilaiMenu(p), U = g.KK_UANG;
    p.status = 'selesai'; p.selesai = waktu(S);
    hi.hpp += p.biaya; hi.antar = (hi.antar || 0) + 1; hi.dilayani += jumlahGelas(p);
    p.items.forEach(function (x) { hi.menu[x.menu] = (hi.menu[x.menu] || 0) + x.qty; });
    if (p.jenis === 'ojol') {
      var pl = N.platform.filter(function (x) { return x.id === p.platform; })[0], komisi = Math.round(nilai * pl.komisi);
      hi.omzetOjol = (hi.omzetOjol || 0) + nilai; hi.komisi = (hi.komisi || 0) + komisi;
      S.payout.push({ n: S.hari, jml: nilai - komisi, dari: pl.app });
    } else {
      var total = nilai + p.ongkir;
      hi.ongkir = (hi.ongkir || 0) + p.ongkir;
      if (p.bayar === 'tunai') { S.uang.kecil += total; hi.omzetTunai += nilai; }
      else if (p.bayar === 'qris') { var mdr = g.KK_JUAL.mdr(S, total); U.terimaQris(S, total - mdr); hi.omzetQris += nilai; hi.mdr += mdr; }
      else { S.bank.saldo += total; S.bank.mutasi.unshift({ n: S.hari, ket: 'Transfer masuk dari ' + p.nama, jml: total }); hi.omzetTransfer = (hi.omzetTransfer || 0) + nilai; }
    }
    S.omzetTahun = (S.omzetTahun || 0) + nilai; S.pajak.omzetBulan += nilai;
    if (teks) kabar.push(teks);
  }

  /* ---------- aksi pemain ---------- */
  function terima(S, id) {
    var p = cari(S, id); if (!p || p.status !== 'baru') return 'Pesanan tidak ada.';
    p.status = 'racik'; return true;
  }
  function tolak(S, id) { var p = cari(S, id); if (!p) return 'Pesanan tidak ada.'; p.status = 'batal'; p.alasan = 'Ditolak'; return true; }
  function cari(S, id) { return S.pesanan.filter(function (p) { return p.id === id; })[0]; }
  function itemBerikut(p) { return p.items.filter(function (x) { return x.siap < x.qty; })[0]; }
  /* racik selesai satu jenis menu untuk qty gelas */
  function itemSiap(S, p, item, biaya) {
    item.siap = item.qty; p.biaya += biaya;
    if (!itemBerikut(p)) { p.status = 'siap'; p.siapPada = waktu(S); if (p.jenis === 'ojol') p.driver = Math.max(p.driver, waktu(S) + 2); }
  }
  function adaEs(p) { return p.items.some(function (x) { return x.menu !== 'hitam' && x.menu !== 'sanger'; }); }

  /* antar sendiri beberapa pesanan siap sekaligus. Hasil: { ok, menit, kabar } atau teks alasan */
  function antarSendiri(S, ids) {
    var MOT = g.KK_MOTOR, MOB = g.KK_MOBIL;
    if (!MOT.punya(S) && !(MOB && MOB.punya(S))) return 'Belum punya kendaraan. Pakai kurir ' + N.kurir.nama + ' atau beli motor di aplikasi Kendaraan.';
    if (S.ojek && S.ojek.online) return 'Sedang narik ojek. Matikan aplikasi driver dulu.';
    var list = ids.map(function (id) { return cari(S, id); }).filter(function (p) { return p && p.status === 'siap' && p.jenis !== 'ojol'; });
    if (!list.length) return 'Tidak ada pesanan siap antar.';
    var gelas = list.reduce(function (t, p) { return t + jumlahGelas(p); }, 0), muat = MOT.muatan(S);
    var pakaiMobil = !!(MOB && MOB.punya(S) && (!MOT.punya(S) || gelas > muat) && S.mobil.muat >= gelas);
    if (!pakaiMobil && gelas > muat) return 'Muatan ' + (MOT.punya(S) ? 'motor hanya ' + muat : 'mobil hanya ' + S.mobil.muat) + ' cup, pesanan ' + gelas + ' cup. Pasang tas atau box, atau pakai kurir.';
    var jauh = Math.max.apply(null, list.map(function (p) { return p.jarak; }));
    var km = Math.round((jauh * 2 + (list.length - 1)) * 10) / 10;
    var KEN = pakaiMobil ? MOB : MOT;
    var r = KEN.jalan(S, km, list.length); if (!r.ok) return r.alasan;
    var kabar = r.kabar.slice(), m = S.motor, batasEs = pakaiMobil || m.aks.tas || m.aks.box ? BATAS_ES_TAS : BATAS_ES;
    var tumpah = pakaiMobil ? 0.01 : m.aks.box ? 0.01 : m.aks.tatakan ? 0.025 : 0.05;
    if (!pakaiMobil && m.kuat) tumpah *= 0.7;
    var sampai = waktu(S) + r.menit;
    list.forEach(function (p) {
      var tiba = sampai - Math.round((jauh - p.jarak) / KEN.kecepatan(S) * 60);
      if (Math.random() < 0.03) { tiba += 10; kabar.push('Alamat ' + p.nama + ' sempat salah, muter 10 menit.'); }
      if (adaEs(p) && tiba - p.siapPada > batasEs) { komplain(S, 'Es kopinya sampai sudah cair.'); kabar.push('Es di pesanan ' + p.nama + ' sudah cair. Pembeli kecewa.'); }
      if (Math.random() < tumpah) {
        var x = p.items[0], refund = hargaItem(p, x); komplain(S, 'Satu cup tumpah waktu diantar.');
        p.items[0] = { menu: x.menu, qty: x.qty, siap: x.siap, refund: refund };
        kabar.push('Satu cup ' + menuDari(x.menu).pendek + ' tumpah di jalan. Uangnya dikembalikan ' + rp(refund) + '.');
        S.hariIni.refund = (S.hariIni.refund || 0) + refund;
        if (p.bayar === 'tunai') S.uang.kecil -= refund; else S.bank.saldo -= refund;
      }
      if (p.jenis === 'besar' && tiba > p.untuk + 30) { komplain(S, 'Pesanan acara datang terlambat.'); kabar.push(p.nama + ' kecewa karena pesanan terlambat.'); }
      selesai(S, p, kabar, null);
    });
    kabar.unshift('Mengantar ' + list.length + ' pesanan' + (pakaiMobil ? ' naik ' + S.mobil.nama : '') + ', ' + km.toLocaleString('id-ID') + ' km pulang-pergi, ' + r.menit + ' menit.');
    return { ok: true, menit: r.menit, kabar: kabar };
  }
  function tarifKurir(jarak) { var k = N.kurir; return k.dasar + Math.max(0, Math.ceil(jarak - k.dasarKm)) * k.perKm; }
  function pakaiKurir(S, id) {
    var p = cari(S, id); if (!p || p.status !== 'siap') return 'Pesanan belum siap.';
    if (p.bayar === 'tunai') return 'Pembeli bayar tunai di tempat, jadi harus diantar sendiri.';
    var biaya = tarifKurir(p.jarak);
    if (g.KK_UANG.bayarQris(S, biaya)) { /* dari saldo QRIS */ }
    else if (S.bank.saldo >= biaya) S.bank.saldo -= biaya;
    else return 'Saldo tidak cukup untuk ongkos ' + N.kurir.nama + '.';
    S.hariIni.kurir = (S.hariIni.kurir || 0) + biaya;
    p.status = 'jalan'; p.eta = waktu(S) + 10 + Math.round(p.jarak / 25 * 60);
    if (adaEs(p) && p.eta - p.siapPada > BATAS_ES) { p.esCair = true; }
    return true;
  }

  /* ---------- platform ---------- */
  function daftar(S, id) {
    var st = S.platform[id]; if (st.status !== 'tidak') return 'Sudah didaftarkan.';
    st.status = 'proses'; st.aktifPada = S.hari + PROSES_DAFTAR; return true;
  }
  function aturMarkup(S, id, nilai) { S.platform[id].markup = nilai; return true; }

  /* ---------- ganti hari ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], U = g.KK_UANG;
    /* pesanan antar yang belum selesai saat tutup dibatalkan, kecuali pesanan besar untuk hari lain */
    S.pesanan.forEach(function (p) {
      if (p.status === 'selesai' || p.status === 'batal') return;
      if (p.jenis === 'besar' && Math.floor(p.untuk / 1440) >= nBaru) return;
      if (p.status === 'jalan') { var k = []; selesai(S, p, k, null); return; }
      p.status = 'batal'; p.alasan = 'Kedai tutup';
    });
    S.pesanan = S.pesanan.filter(function (p) { return (p.status !== 'selesai' && p.status !== 'batal') || (p.selesai || p.dibuat) > nBaru * 1440 - 1440; });
    N.platform.forEach(function (pl) {
      var st = S.platform[pl.id];
      if (st.status === 'proses' && nBaru >= st.aktifPada) { st.status = 'aktif'; kabar.push('Kedai sudah aktif di ' + pl.nama + '. Pesanan bisa masuk saat kedai buka.'); }
    });
    if (U.hariKerja(nBaru)) {
      var cair = 0; S.payout = S.payout.filter(function (x) { if (x.n < nBaru) { cair += x.jml; return false; } return true; });
      if (cair) { S.bank.saldo += cair; S.bank.mutasi.unshift({ n: nBaru, ket: 'Pencairan pesan-antar', jml: cair }); kabar.push('Pendapatan pesan-antar ' + rp(cair) + ' cair ke rekening.'); }
    }
    var besar = S.pesanan.filter(function (p) { return p.jenis === 'besar' && p.status !== 'baru' && p.status !== 'batal' && Math.floor(p.untuk / 1440) === nBaru; });
    besar.forEach(function (p) { kabar.push('Hari ini pesanan ' + p.nama + ' ' + jumlahGelas(p) + ' gelas, diantar pukul ' + jamTeks(p.untuk % 1440) + '.'); });
    if (Math.random() < PELUANG_PESANAN_BESAR && !KAL.apakahLibur(nBaru + 1)) {
      var pb = buatBesar(S, nBaru + 1); pb.dibuat = nBaru * 1440 + 360; S.pesanan.push(pb);
      kabar.push(pb.nama + ' menelepon: pesan ' + jumlahGelas(pb) + ' gelas untuk besok. Lihat di Pesanan.');
    }
    return kabar;
  }
  function jamTeks(m) { return (m < 600 ? '0' : '') + Math.floor(m / 60) + '.' + (m % 60 < 10 ? '0' : '') + (m % 60); }

  function aktif(S) { return S.pesanan.filter(function (p) { return p.status !== 'selesai' && p.status !== 'batal'; }); }

  g.KK_ANTAR = { siapkan: siapkan, jalan: jalan, terima: terima, tolak: tolak, cari: cari, itemBerikut: itemBerikut, itemSiap: itemSiap,
    antarSendiri: antarSendiri, pakaiKurir: pakaiKurir, tarifKurir: tarifKurir, daftar: daftar, aturMarkup: aturMarkup, gantiHari: gantiHari,
    aktif: aktif, jumlahGelas: jumlahGelas, nilaiMenu: nilaiMenu, hargaItem: hargaItem, menuDari: menuDari, namaPlatform: namaPlatform, ongkir: ongkir, waktu: waktu };
})(window);
