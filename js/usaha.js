/* usaha.js — lokasi, tahapan tempat (booth sampai ruko), alat, listrik PLN (token), sewa, cabang, dan racik menu sendiri.
   Rancangan bagian "Tempat usaha & naik kelas" dan "Menu awal, resep & HPP". Harga tempat dan alat: perkiraan. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, M = g.KK_MENU;
  var TARIF = 1445; /* Rp/kWh, perkiraan tarif 1.300 VA ke atas */

  var LOKASI = {
    kampus: { nama: 'Dekat kampus', ket: 'Mahasiswa, ramai malam. Sepi saat libur semester.', sewa: 1, ramai: 1, campur: { mahasiswa: 1.8 } },
    kantor: { nama: 'Perkantoran', ket: 'Pekerja pagi dan siang. Sepi akhir pekan dan saat mudik.', sewa: 1.4, ramai: 1.1, campur: { kantor: 2 } },
    jalan: { nama: 'Pinggir jalan besar', ket: 'Ojol dan pelintas. Parkir sempit, juru parkir liar lebih sering.', sewa: 1, ramai: 1, campur: { ojol: 1.6 } },
    perumahan: { nama: 'Perumahan', ket: 'Keluarga dan pesan antar. Sewa murah, pembeli datang lebih sedikit.', sewa: 0.6, ramai: 0.75, campur: { keluarga: 2 }, antar: 1.5 },
    spbu: { nama: 'Dekat SPBU atau minimarket', ket: 'Pelintas dan ojol. Sewa mahal, waralaba dekat.', sewa: 1.4, ramai: 1.2, campur: { ojol: 1.3 } }
  };
  var SEWA_KOTA = { jakarta: 1.6, medan: 1, pekanbaru: 0.95, jambi: 0.8 }; /* perkiraan */
  var TEMPAT = [
    null,
    { nama: 'Booth kontainer mini 2×1 m', biaya: 0, sewa: 1000000, listrik: 'numpang', listrikBulan: 200000, kursi: 4, ramai: 1, hari: 0 },
    { nama: 'Kontainer 20 kaki', biaya: 60000000, sewa: 2500000, listrik: 'token', kursi: 12, ramai: 1.6, hari: 3 },
    { nama: 'Dua kontainer + rooftop', biaya: 200000000, sewa: 4000000, listrik: 'token', kursi: 30, ramai: 2.3, hari: 5 },
    { nama: 'Ruko sewa', biaya: 30000000, sewaTahun: 60000000, listrik: 'token', kursi: 40, ramai: 2.8, hari: 5, butuhNib: true }
  ];
  var ALAT = {
    grinder: { nama: 'Grinder listrik', harga: 1500000, tier: 1, ket: 'Racik lebih cepat, rasa lebih wangi' },
    espresso1: { nama: 'Mesin espresso 1 grup', harga: 8000000, tier: 2, ket: 'Membuka espresso dan foam untuk racik menu sendiri. Butuh listrik sendiri' },
    espresso2: { nama: 'Mesin espresso 2 grup', harga: 35000000, tier: 3, butuh: 'espresso1', ket: 'Dua gelas sekaligus, barista jauh lebih cepat' },
    freezer: { nama: 'Freezer', harga: 3000000, tier: 2, ket: 'Es tidak habis mencair semalam' },
    kursiKayu: { nama: 'Kursi dan meja kayu', harga: 2500000, tier: 1, ket: 'Suasana lebih nyaman, bintang naik' },
    tv: { nama: 'TV untuk nobar', harga: 3500000, tier: 2, ket: 'Malam nonton bola jadi ramai' },
    wifi: { nama: 'Langganan wifi', harga: 350000, bulanan: true, tier: 2, ket: 'Mahasiswa betah lebih lama. Rp350.000 sebulan' }
  };
  var WATT = { lampu: 0.1, kulkas: 0.1, freezer: 0.15, espresso: 0.45, ac: 1, tv: 0.1 }; /* kW rata-rata, perkiraan */

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function siapkan(S, lokasi) {
    if (!S.usaha) S.usaha = { lokasi: lokasi || 'jalan', tier: 1, alat: {}, kwh: 0, padam: false, bangun: null, cabang: [], tunggakanSewa: 0, sewaTahunTempo: null };
    S.menuSendiri = S.menuSendiri || [];
    terapkanMenu(S);
    return S;
  }
  function tempat(S) { return TEMPAT[S.usaha.tier]; }
  function faktorSewa(S, lokasi) { return (SEWA_KOTA[S.kota] || 1) * LOKASI[lokasi || S.usaha.lokasi].sewa; }
  function sewaBulan(S, tier) { var t = TEMPAT[tier || S.usaha.tier]; return t.sewa ? Math.round(t.sewa * faktorSewa(S) / 50000) * 50000 : 0; }
  function sewaTahun(S) { var t = tempat(S); return t.sewaTahun ? Math.round(t.sewaTahun * faktorSewa(S) / 100000) * 100000 : 0; }
  function punya(S, id) { return !!S.usaha.alat[id]; }
  function listrikNyala(S) { return tempat(S).listrik === 'numpang' || (!S.usaha.padam && S.usaha.kwh > 0); }
  function bisaEspresso(S) { return punya(S, 'espresso1') && listrikNyala(S); }
  function bahanTersedia(S, id) { var b = M.BAHAN[id]; if (b.butuhAlat) return bisaEspresso(S); return true; }

  /* ---------- pengaruh ke jualan ---------- */
  function faktor(S) {
    var u = S.usaha, L = LOKASI[u.lokasi], t = KAL.tgl(S.hari), f = tempat(S).ramai * L.ramai;
    if (u.lokasi === 'kampus' && ((t.m === 7 || t.m === 8) || (t.m === 12 && t.d > 20) || (t.m === 1 && t.d < 15))) f *= 0.6;
    if (u.lokasi === 'kantor' && (t.dow === 0 || t.dow === 6)) f *= 0.5;
    if (u.tier >= 3 && t.dow === 6 && S.menit >= 1140) f *= 1.3; /* musik akustik malam Minggu */
    if (punya(S, 'tv') && S.menit >= 1140 && (t.dow === 2 || t.dow === 5) && S.hari % 3 === 0) f *= 1.4; /* nobar */
    if (punya(S, 'kursiKayu')) f *= 1.05;
    return f;
  }
  function campuran(S, peta) {
    var c = LOKASI[S.usaha.lokasi].campur, hasil = {};
    for (var k in peta) hasil[k] = peta[k] * (c[k] || 1);
    if (punya(S, 'wifi') && hasil.mahasiswa) hasil.mahasiswa *= 1.3;
    return hasil;
  }
  function faktorAntar(S) { return LOKASI[S.usaha.lokasi].antar || 1; }
  function kecepatan(S) { return (punya(S, 'grinder') ? 0.85 : 1) * (punya(S, 'espresso2') && listrikNyala(S) ? 0.7 : punya(S, 'espresso1') && listrikNyala(S) ? 0.85 : 1); }
  function bonusRasa(S) { return (punya(S, 'grinder') ? 0.2 : 0) + (bisaEspresso(S) ? 0.3 : 0); }
  function suasana(S) {
    var t = tempat(S), m = S.menit;
    return Math.min(5, 3 + S.usaha.tier * 0.35 + (punya(S, 'kursiKayu') ? 0.4 : 0) + (S.usaha.tier === 4 ? 0.3 : 0) + (m >= 1080 ? 0.2 : 0) - (t.kursi < 5 && m >= 1080 ? 0.3 : 0));
  }
  function sabar(S) { return (punya(S, 'wifi') ? 1.15 : 1) * (S.usaha.tier === 4 ? 1.15 : 1); }
  function esTahan(S) { return punya(S, 'freezer') && listrikNyala(S); }

  /* ---------- listrik ---------- */
  function pakaiListrik(S, menit, buka) {
    var u = S.usaha; if (tempat(S).listrik !== 'token' || u.padam) return [];
    var kw = WATT.kulkas + (punya(S, 'freezer') ? WATT.freezer : 0);
    if (buka) kw += WATT.lampu + (punya(S, 'espresso1') ? WATT.espresso * (punya(S, 'espresso2') ? 2 : 1) : 0) + (u.tier === 4 ? WATT.ac : 0) + (punya(S, 'tv') ? WATT.tv : 0);
    u.kwh -= kw * menit / 60;
    S.hariIni.listrik = (S.hariIni.listrik || 0) + kw * menit / 60 * TARIF;
    if (u.kwh <= 0) { u.kwh = 0; u.padam = true; return ['Token listrik habis! Kulkas, freezer, dan mesin mati. Beli token di aplikasi PLN Mobile.']; }
    if (u.kwh < 5 && !u.peringatan) { u.peringatan = true; return ['Token listrik tinggal ' + u.kwh.toFixed(1).replace('.', ',') + ' kWh.']; }
    return [];
  }
  function beliToken(S, nominal) {
    if (tempat(S).listrik !== 'token') return 'Listrik masih numpang, dibayar bulanan ke pemilik lahan.';
    if (S.bank.saldo < nominal) return 'Saldo rekening tidak cukup.';
    S.bank.saldo -= nominal; S.bank.mutasi.unshift({ n: S.hari, ket: 'Token listrik PLN', jml: -nominal });
    S.usaha.kwh += nominal / TARIF; S.usaha.padam = false; S.usaha.peringatan = false;
    return { ok: true, kwh: nominal / TARIF };
  }

  /* ---------- naik kelas, alat, cabang ---------- */
  function bayar(S, jml, ket) { if (S.bank.saldo < jml) return false; S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -jml }); return true; }
  function naikKelas(S) {
    var u = S.usaha, t = TEMPAT[u.tier + 1];
    if (!t) return 'Sudah di tempat terbesar. Buka cabang untuk tumbuh lagi.';
    if (u.bangun) return 'Pembangunan sedang berjalan.';
    if (t.butuhNib && !S.nib) return 'Pindah ke ruko butuh NIB. Daftar gratis di aplikasi OSS.';
    var biaya = t.biaya + (t.sewaTahun ? Math.round(t.sewaTahun * faktorSewa(S) / 100000) * 100000 : 0);
    if (!bayar(S, biaya, (t.sewaTahun ? 'Renovasi dan sewa setahun ' : 'Bangun ') + t.nama)) return 'Saldo rekening kurang ' + rp(biaya - S.bank.saldo) + '. Bisa pakai KUR.';
    u.bangun = { tier: u.tier + 1, selesai: S.hari + t.hari };
    return { ok: true, selesai: u.bangun.selesai };
  }
  function beliAlat(S, id) {
    var a = ALAT[id], u = S.usaha;
    if (punya(S, id)) return 'Sudah punya.';
    if (u.tier < a.tier) return a.nama + ' baru bisa dipasang di ' + TEMPAT[a.tier].nama.toLowerCase() + ' atau lebih besar.';
    if (a.butuh && !punya(S, a.butuh)) return 'Butuh ' + ALAT[a.butuh].nama + ' dulu.';
    if (!bayar(S, a.harga, (a.bulanan ? 'Pasang ' : 'Beli ') + a.nama)) return 'Saldo rekening tidak cukup.';
    u.alat[id] = { sejak: S.hari };
    return true;
  }
  function bukaCabang(S, lokasi) {
    if (!S.nib) return 'Buka cabang butuh NIB.';
    if (S.usaha.tier < 2) return 'Naikkan kedai utama ke kontainer 20 kaki dulu.';
    var biaya = 12000000;
    if (!bayar(S, biaya, 'Booth cabang ' + LOKASI[lokasi].nama)) return 'Saldo rekening kurang untuk booth cabang ' + rp(biaya) + '.';
    S.usaha.cabang.push({ id: 'c' + S.hari + '-' + S.usaha.cabang.length, lokasi: lokasi, buka: S.hari + 2, riwayat: [], tunggakan: 0 });
    return true;
  }
  /* hasil satu cabang sehari (disederhanakan): dijalankan kepala toko dan barista yang ditempatkan di sana */
  function hasilCabang(S, c, n) {
    var staf = (S.staf || []).filter(function (k) { return k.cabang === c.id && n >= k.mulai && n >= (k.sakitSampai || 0); });
    var kepala = staf.some(function (k) { return k.tugas.indexOf('kepala') >= 0; }), barista = staf.filter(function (k) { return k.tugas.indexOf('barista') >= 0; });
    var L = LOKASI[c.lokasi], rating = g.KK_DUNIA && S.dunia.ulasan.length ? g.KK_DUNIA.rataMaps(S) : 4;
    var gelas = !barista.length ? 0 : Math.round(38 * L.ramai * (rating / 4) * (kepala ? 1 : 0.6) * Math.min(1.4, 0.7 + barista.length * 0.35) * (0.85 + Math.random() * 0.3));
    var omzet = gelas * 13000, hpp = Math.round(omzet * 0.47), sewa = Math.round(1000000 * faktorSewa(S, c.lokasi) / 30), listrik = Math.round(200000 / 30);
    return { gelas: gelas, omzet: omzet, hpp: hpp, biaya: sewa + listrik, laba: omzet - hpp - sewa - listrik, kepala: kepala, barista: barista.length };
  }

  /* ---------- racik menu sendiri ---------- */
  function profil(resep) {
    var p = [0, 0, 0, 0, 0];
    resep.forEach(function (r) { var x = M.PROFIL[r[0]]; if (x) for (var i = 0; i < 5; i++) p[i] += x[i]; });
    var tot = p.reduce(function (a, b) { return a + b; }, 0) || 1;
    return p.map(function (v) { return v / tot; });
  }
  function skorSelera(resep, jenis) {
    var p = profil(resep), s = M.SELERA[jenis], v = 0; for (var i = 0; i < 5; i++) v += p[i] * s[i];
    return v; /* kira-kira 0,2 sampai 0,9 */
  }
  function perkiraanBintang(resep) {
    var h = {}; Object.keys(M.SELERA).forEach(function (j) { h[j] = Math.max(1, Math.min(5, 2.4 + skorSelera(resep, j) * 3.2)); }); return h;
  }
  function hppResep(resep) { return resep.reduce(function (t, r) { return t + M.biaya(r[0], r[1]); }, 0); }
  function susunResep(pilih) {
    var r = [[pilih.panas ? 'cupKertas' : 'cupPlastik', 1]];
    if (!pilih.panas) r.push(['es', 1]);
    var porsi = { kopi: 15, espresso: 18, teh: 3, matcha: 5, cokelat: 25, uht: 150, oat: 150, skm: 30, foam: 60, gula: 15, aren: 25, sirup: 20 };
    [pilih.dasar, pilih.susu, pilih.manis].forEach(function (b) { if (b) r.push([b, porsi[b]]); });
    if (pilih.panas && !pilih.susu && pilih.dasar !== 'cokelat') r.push(['air', 1]);
    return r;
  }
  var NAMA_BAGIAN = { kopi: 'Kopi', espresso: 'Espresso', teh: 'Teh', matcha: 'Matcha', cokelat: 'Cokelat', uht: 'Susu', oat: 'Oat', skm: 'Susu Manis', foam: 'Latte', gula: '', aren: 'Aren', sirup: 'Sirup' };
  function namaUsul(pilih) {
    var n = (pilih.panas ? '' : 'Es ') + NAMA_BAGIAN[pilih.dasar];
    if (pilih.dasar === 'espresso' && pilih.susu === 'foam') n = (pilih.panas ? '' : 'Es ') + 'Caffe Latte';
    else if (pilih.susu) n += ' ' + NAMA_BAGIAN[pilih.susu];
    if (pilih.manis && NAMA_BAGIAN[pilih.manis]) n += ' ' + NAMA_BAGIAN[pilih.manis];
    return n.trim();
  }
  function simpanMenu(S, pilih, harga) {
    if (S.menuSendiri.length >= 6) return 'Paling banyak 6 menu racikan sendiri. Hapus salah satu dulu.';
    var resep = susunResep(pilih), nama = namaUsul(pilih);
    if (M.MENU.some(function (m) { return m.nama === nama; })) return 'Sudah ada menu dengan nama ' + nama + '.';
    S.menuSendiri.push({ id: 'x' + S.hari + '-' + S.menuSendiri.length + Math.floor(Math.random() * 99), nama: nama, pendek: nama.replace(/^Es /, 'Es ').slice(0, 14), harga: harga, resep: resep, panas: !!pilih.panas });
    terapkanMenu(S); return true;
  }
  function hapusMenu(S, id) { S.menuSendiri = S.menuSendiri.filter(function (m) { return m.id !== id; }); terapkanMenu(S); return true; }
  function terapkanMenu(S) {
    for (var i = M.MENU.length - 1; i >= 0; i--) if (M.MENU[i].sendiri) M.MENU.splice(i, 1);
    Object.keys(M.PEMBELI).forEach(function (j) { for (var k in M.PEMBELI[j].suka) if (k.charAt(0) === 'x') delete M.PEMBELI[j].suka[k]; });
    (S.menuSendiri || []).forEach(function (c) {
      var m = { id: c.id, nama: c.nama, pendek: c.pendek, harga: c.harga, hargaAwal: c.harga, resep: c.resep, sendiri: true, panas: c.panas };
      m.hpp = hppResep(c.resep);
      if (S.hargaMenu && S.hargaMenu[c.id]) m.harga = S.hargaMenu[c.id];
      M.MENU.push(m);
      Object.keys(M.PEMBELI).forEach(function (j) { M.PEMBELI[j].suka[c.id] = Math.round(Math.max(1, (skorSelera(c.resep, j) - 0.25) * 60) + (j === 'konten' ? 8 : 0)); });
    });
  }

  /* ---------- tiap menit dan ganti hari ---------- */
  function jalan(S, dMenit) { return dMenit > 0 ? pakaiListrik(S, dMenit, S.fase === 'buka') : []; }
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], u = S.usaha, tB = KAL.tgl(nBaru), tL = KAL.tgl(nLama);
    /* malam: kulkas dan freezer tetap menyala */
    kabar = kabar.concat(pakaiListrik(S, Math.max(0, 1440 - (S.jamTutup - S.jamBuka) * 60), false));
    if (u.bangun && nBaru >= u.bangun.selesai) {
      u.tier = u.bangun.tier; u.bangun = null;
      if (tempat(S).listrik === 'token' && u.kwh < 20) { u.kwh += 20; kabar.push('PLN memasang meteran prabayar baru dengan token awal 20 kWh.'); }
      if (tempat(S).sewaTahun) u.sewaTahunTempo = nBaru + 365;
      kabar.push('Pembangunan selesai! Kedai sekarang ' + tempat(S).nama.toLowerCase() + ' dengan ' + tempat(S).kursi + ' kursi.');
    }
    if (tB.m !== tL.m) {
      var t = tempat(S), sewa = sewaBulan(S), lain = (t.listrik === 'numpang' ? t.listrikBulan : 0) + (punya(S, 'wifi') ? ALAT.wifi.harga : 0);
      var total = sewa + lain + u.tunggakanSewa;
      if (total > 0) {
        if (bayar(S, total, 'Sewa lahan' + (lain ? ', listrik numpang, wifi' : '') + ' ' + N.namaBulan[tL.m - 1])) { kabar.push('Sewa dan tagihan bulanan ' + rp(total) + ' sudah dibayar.'); u.tunggakanSewa = 0; }
        else { u.tunggakanSewa = total; kabar.push('Saldo kurang untuk sewa ' + rp(total) + '. Pemilik lahan memberi peringatan.'); }
      }
    }
    if (u.sewaTahunTempo && nBaru === u.sewaTahunTempo) {
      var st = sewaTahun(S);
      if (bayar(S, st, 'Sewa ruko setahun')) { u.sewaTahunTempo += 365; kabar.push('Sewa ruko setahun ' + rp(st) + ' sudah dibayar.'); }
      else { u.tunggakanSewa += st; u.sewaTahunTempo += 365; kabar.push('Saldo kurang untuk sewa ruko tahun depan.'); }
    }
    u.cabang.forEach(function (c) {
      if (nLama < c.buka) return;
      var h = hasilCabang(S, c, nLama);
      c.riwayat.push({ n: nLama, gelas: h.gelas, omzet: h.omzet, laba: h.laba }); if (c.riwayat.length > 30) c.riwayat.shift();
      S.bank.saldo += h.omzet - h.hpp - h.biaya; S.bank.mutasi.unshift({ n: nBaru, ket: 'Setoran cabang ' + LOKASI[c.lokasi].nama, jml: h.omzet - h.hpp - h.biaya });
      kabar.push('Cabang ' + LOKASI[c.lokasi].nama + ': ' + h.gelas + ' gelas, laba ' + rp(h.laba) + (h.barista ? '' : ' (tidak ada barista)') + (h.kepala ? '' : ', tanpa kepala toko') + '.');
    });
    return kabar;
  }

  g.KK_USAHA = { LOKASI: LOKASI, TEMPAT: TEMPAT, ALAT: ALAT, TARIF: TARIF, siapkan: siapkan, tempat: tempat, sewaBulan: sewaBulan, sewaTahun: sewaTahun, punya: punya,
    listrikNyala: listrikNyala, bisaEspresso: bisaEspresso, bahanTersedia: bahanTersedia, faktor: faktor, campuran: campuran, faktorAntar: faktorAntar, kecepatan: kecepatan,
    bonusRasa: bonusRasa, suasana: suasana, sabar: sabar, esTahan: esTahan, beliToken: beliToken, naikKelas: naikKelas, beliAlat: beliAlat, bukaCabang: bukaCabang,
    hasilCabang: hasilCabang, perkiraanBintang: perkiraanBintang, hppResep: hppResep, susunResep: susunResep, namaUsul: namaUsul, simpanMenu: simpanMenu, hapusMenu: hapusMenu,
    terapkanMenu: terapkanMenu, jalan: jalan, gantiHari: gantiHari };
})(window);
