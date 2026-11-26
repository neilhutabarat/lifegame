/* rute.js — peta antarkota untuk Travel: kota, ruas jalan (km, tol, kapal), jalur terpendek, tarif standar.
   Sumber nyata: tarif kapal Merak–Bakauheni golongan IV Rp481.800 dan penumpang Rp22.700 (Metro TV, 2026),
   tol Jakarta–Semarang Rp473.500 golongan I (Bisnis.com, Maret 2026), travel Jakarta–Bandung Rp80.000–100.000 (Jawa Pos, Des 2025).
   Angka lain (jarak, tol ruas lain, popularitas) adalah perkiraan dan bisa disetel di sini. */
(function (g) {
  'use strict';
  /* tema = gaya pemandangan; ramai = seberapa ramai penumpang (1 = sedang) */
  var KOTA = {
    medan: { nama: 'Medan', pulau: 'Sumatra', tema: 'metropolis', ramai: 1.5, ket: 'Kota terbesar Sumatra' },
    binjai: { nama: 'Binjai', pulau: 'Sumatra', tema: 'kota', ramai: 0.9, ket: 'Kota rambutan' },
    berastagi: { nama: 'Berastagi', pulau: 'Sumatra', tema: 'gunung', ramai: 1.0, ket: 'Gunung Sibayak dan kebun jeruk' },
    tebingtinggi: { nama: 'Tebing Tinggi', pulau: 'Sumatra', tema: 'sawit', ramai: 0.7, ket: 'Kota persimpangan, kebun sawit' },
    siantar: { nama: 'Pematangsiantar', pulau: 'Sumatra', tema: 'kota', ramai: 0.9, ket: 'Kota roti ketawa' },
    parapat: { nama: 'Parapat', pulau: 'Sumatra', tema: 'danau', ramai: 1.1, ket: 'Pintu Danau Toba' },
    kisaran: { nama: 'Kisaran', pulau: 'Sumatra', tema: 'sawit', ramai: 0.6, ket: 'Kebun karet dan sawit' },
    rantauprapat: { nama: 'Rantauprapat', pulau: 'Sumatra', tema: 'sawit', ramai: 0.6, ket: 'Lintas timur Sumatra' },
    pekanbaru: { nama: 'Pekanbaru', pulau: 'Sumatra', tema: 'kotaBesar', ramai: 1.2, ket: 'Kota bertuah, Riau' },
    bukittinggi: { nama: 'Bukittinggi', pulau: 'Sumatra', tema: 'gunung', ramai: 1.1, ket: 'Jam Gadang' },
    padang: { nama: 'Padang', pulau: 'Sumatra', tema: 'pantai', ramai: 1.1, ket: 'Pantai Padang' },
    jambi: { nama: 'Kota Jambi', pulau: 'Sumatra', tema: 'sungai', ramai: 1.0, ket: 'Sungai Batanghari' },
    palembang: { nama: 'Palembang', pulau: 'Sumatra', tema: 'sungai', ramai: 1.3, ket: 'Jembatan Ampera' },
    lampung: { nama: 'Bandar Lampung', pulau: 'Sumatra', tema: 'pantai', ramai: 1.1, ket: 'Menara Siger' },
    bakauheni: { nama: 'Bakauheni', pulau: 'Sumatra', tema: 'pelabuhan', ramai: 0.5, ket: 'Pelabuhan ujung Sumatra' },
    merak: { nama: 'Merak', pulau: 'Jawa', tema: 'pelabuhan', ramai: 0.5, ket: 'Pelabuhan ujung Jawa' },
    jakarta: { nama: 'Jakarta', pulau: 'Jawa', tema: 'metropolis', ramai: 1.6, ket: 'Ibu kota, Monas' },
    bandung: { nama: 'Bandung', pulau: 'Jawa', tema: 'gunung', ramai: 1.5, ket: 'Kota kembang, kebun teh' },
    cirebon: { nama: 'Cirebon', pulau: 'Jawa', tema: 'pantai', ramai: 0.9, ket: 'Kota udang, jalur pantura' },
    semarang: { nama: 'Semarang', pulau: 'Jawa', tema: 'kotaBesar', ramai: 1.2, ket: 'Lawang Sewu' },
    yogyakarta: { nama: 'Yogyakarta', pulau: 'Jawa', tema: 'budaya', ramai: 1.4, ket: 'Tugu dan Malioboro' },
    surabaya: { nama: 'Surabaya', pulau: 'Jawa', tema: 'metropolis', ramai: 1.4, ket: 'Kota Pahlawan' },
    bandaaceh: { nama: 'Banda Aceh', pulau: 'Sumatra', tema: 'budaya', ramai: 1.0, ket: 'Masjid Raya Baiturrahman' },
    bengkulu: { nama: 'Bengkulu', pulau: 'Sumatra', tema: 'pantai', ramai: 0.85, ket: 'Pantai Panjang, Bumi Rafflesia' },
    solo: { nama: 'Solo (Surakarta)', pulau: 'Jawa', tema: 'budaya', ramai: 1.15, ket: 'Keraton Surakarta' },
    malang: { nama: 'Malang', pulau: 'Jawa', tema: 'gunung', ramai: 1.25, ket: 'Kota Apel dan Gunung Bromo' },
    banyuwangi: { nama: 'Banyuwangi', pulau: 'Jawa', tema: 'pelabuhan', ramai: 0.9, ket: 'Pelabuhan Ketapang ke Bali' },
    denpasar: { nama: 'Denpasar (Bali)', pulau: 'Bali', tema: 'pantai', ramai: 1.55, ket: 'Pulau Dewata, Kuta dan Sanur' },
    mataram: { nama: 'Mataram (Lombok)', pulau: 'NTB', tema: 'pantai', ramai: 1.05, ket: 'Pulau Lombok, Mandalika' },
    kupang: { nama: 'Kupang (NTT)', pulau: 'NTT', tema: 'pantai', ramai: 0.85, ket: 'Gerbang Nusa Tenggara Timur' },
    pontianak: { nama: 'Pontianak', pulau: 'Kalimantan', tema: 'sungai', ramai: 1.0, ket: 'Kota Khatulistiwa, Sungai Kapuas' },
    banjarmasin: { nama: 'Banjarmasin', pulau: 'Kalimantan', tema: 'sungai', ramai: 1.05, ket: 'Kota Seribu Sungai' },
    balikpapan: { nama: 'Balikpapan', pulau: 'Kalimantan', tema: 'kotaBesar', ramai: 1.25, ket: 'Kota Minyak, Gerbang IKN' },
    samarinda: { nama: 'Samarinda', pulau: 'Kalimantan', tema: 'sungai', ramai: 1.1, ket: 'Sungai Mahakam' },
    ikn: { nama: 'Nusantara (IKN)', pulau: 'Kalimantan', tema: 'kotaBesar', ramai: 1.2, ket: 'Ibu Kota Nusantara' },
    makassar: { nama: 'Makassar', pulau: 'Sulawesi', tema: 'metropolis', ramai: 1.35, ket: 'Pantai Losari, Kota Daeng' },
    parepare: { nama: 'Parepare', pulau: 'Sulawesi', tema: 'pelabuhan', ramai: 0.8, ket: 'Pelabuhan lintas Sulawesi–Kalimantan' },
    palu: { nama: 'Palu', pulau: 'Sulawesi', tema: 'pantai', ramai: 0.85, ket: 'Teluk Palu' },
    manado: { nama: 'Manado', pulau: 'Sulawesi', tema: 'pantai', ramai: 1.1, ket: 'Bunaken, Sulawesi Utara' },
    kendari: { nama: 'Kendari', pulau: 'Sulawesi', tema: 'pantai', ramai: 0.9, ket: 'Teluk Kendari' },
    ambon: { nama: 'Ambon', pulau: 'Maluku', tema: 'pantai', ramai: 0.85, ket: 'Ambon Manise, Kepulauan Maluku' },
    sorong: { nama: 'Sorong', pulau: 'Papua', tema: 'pelabuhan', ramai: 0.85, ket: 'Gerbang Raja Ampat' },
    jayapura: { nama: 'Jayapura', pulau: 'Papua', tema: 'pantai', ramai: 1.0, ket: 'Jembatan Youtefa, ujung timur Indonesia' }
  };
  /* ruas: a-b dua arah. km jalan, tol golongan I (Rp), laut = penyeberangan kapal */
  var RUAS = [
    { a: 'medan', b: 'binjai', km: 22, tol: 0 },
    { a: 'medan', b: 'berastagi', km: 66, tol: 0 },
    { a: 'medan', b: 'tebingtinggi', km: 78, tol: 60000 },
    { a: 'tebingtinggi', b: 'siantar', km: 50, tol: 0 },
    { a: 'siantar', b: 'parapat', km: 47, tol: 0 },
    { a: 'tebingtinggi', b: 'kisaran', km: 70, tol: 0 },
    { a: 'kisaran', b: 'rantauprapat', km: 135, tol: 0 },
    { a: 'rantauprapat', b: 'pekanbaru', km: 380, tol: 0 },
    { a: 'pekanbaru', b: 'bukittinggi', km: 220, tol: 0 },
    { a: 'bukittinggi', b: 'padang', km: 95, tol: 0 },
    { a: 'pekanbaru', b: 'jambi', km: 450, tol: 0 },
    { a: 'jambi', b: 'palembang', km: 275, tol: 0 },
    { a: 'palembang', b: 'lampung', km: 340, tol: 330000 },
    { a: 'lampung', b: 'bakauheni', km: 90, tol: 90000 },
    { a: 'bakauheni', b: 'merak', km: 30, tol: 0, laut: true, jam: 3.5, kapalMobil: 481800, kapalOrang: 22700 },
    { a: 'merak', b: 'jakarta', km: 105, tol: 70000 },
    { a: 'jakarta', b: 'bandung', km: 150, tol: 55000 },
    { a: 'jakarta', b: 'cirebon', km: 230, tol: 150000 },
    { a: 'bandung', b: 'cirebon', km: 130, tol: 70000 },
    { a: 'cirebon', b: 'semarang', km: 225, tol: 323500 },
    { a: 'semarang', b: 'yogyakarta', km: 120, tol: 70000 },
    { a: 'semarang', b: 'surabaya', km: 350, tol: 280000 },
    { a: 'yogyakarta', b: 'surabaya', km: 320, tol: 250000 },
    { a: 'medan', b: 'bandaaceh', km: 590, tol: 80000 },
    { a: 'palembang', b: 'bengkulu', km: 430, tol: 0 },
    { a: 'yogyakarta', b: 'solo', km: 65, tol: 40000 },
    { a: 'solo', b: 'surabaya', km: 260, tol: 210000 },
    { a: 'surabaya', b: 'malang', km: 95, tol: 55000 },
    { a: 'malang', b: 'banyuwangi', km: 260, tol: 40000 },
    { a: 'surabaya', b: 'banyuwangi', km: 290, tol: 110000 },
    { a: 'banyuwangi', b: 'denpasar', km: 140, tol: 0, laut: true, jam: 2.5, kapalMobil: 215000, kapalOrang: 12000 },
    { a: 'denpasar', b: 'mataram', km: 110, tol: 0, laut: true, jam: 4.5, kapalMobil: 450000, kapalOrang: 65000 },
    { a: 'mataram', b: 'kupang', km: 720, tol: 0, laut: true, jam: 14, kapalMobil: 950000, kapalOrang: 180000 },
    { a: 'surabaya', b: 'banjarmasin', km: 480, tol: 0, laut: true, jam: 15, kapalMobil: 1200000, kapalOrang: 250000 },
    { a: 'banjarmasin', b: 'balikpapan', km: 470, tol: 0 },
    { a: 'banjarmasin', b: 'pontianak', km: 890, tol: 0 },
    { a: 'balikpapan', b: 'ikn', km: 85, tol: 35000 },
    { a: 'balikpapan', b: 'samarinda', km: 115, tol: 125000 },
    { a: 'balikpapan', b: 'parepare', km: 350, tol: 0, laut: true, jam: 12, kapalMobil: 1100000, kapalOrang: 220000 },
    { a: 'surabaya', b: 'makassar', km: 780, tol: 0, laut: true, jam: 20, kapalMobil: 1650000, kapalOrang: 320000 },
    { a: 'makassar', b: 'parepare', km: 155, tol: 0 },
    { a: 'makassar', b: 'kendari', km: 620, tol: 0 },
    { a: 'parepare', b: 'palu', km: 590, tol: 0 },
    { a: 'palu', b: 'manado', km: 960, tol: 0 },
    { a: 'makassar', b: 'ambon', km: 950, tol: 0, laut: true, jam: 24, kapalMobil: 1900000, kapalOrang: 380000 },
    { a: 'ambon', b: 'sorong', km: 540, tol: 0, laut: true, jam: 16, kapalMobil: 1450000, kapalOrang: 280000 },
    { a: 'sorong', b: 'jayapura', km: 980, tol: 0, laut: true, jam: 24, kapalMobil: 2100000, kapalOrang: 420000 }
  ];
  /* 5 level kecepatan mobil: 1 (0-25), 2 (25-50), 3 (50-75), 4 (75-100), 5 (100 - top speed asli mobil) */
  var GIGI = [
    { id: 1, nama: '1', lo: 0, hi: 25, boros: 0.8 },
    { id: 2, nama: '2', lo: 25, hi: 50, boros: 0.85 },
    { id: 3, nama: '3', lo: 50, hi: 75, boros: 0.92 },
    { id: 4, nama: '4', lo: 75, hi: 100, boros: 1.0 },
    { id: 5, nama: '5', lo: 100, hi: 170, boros: 1.45, ngebut: true }
  ];
  /* 5 level kecepatan motor: 1 (0-15), 2 (15-30), 3 (30-45), 4 (45-60), 5 (60 - top speed asli motor) */
  var GIGI_MOTOR = [
    { id: 1, nama: '1', lo: 0, hi: 15, boros: 0.8 },
    { id: 2, nama: '2', lo: 15, hi: 30, boros: 0.85 },
    { id: 3, nama: '3', lo: 30, hi: 45, boros: 0.92 },
    { id: 4, nama: '4', lo: 45, hi: 60, boros: 1.0 },
    { id: 5, nama: '5', lo: 60, hi: 110, boros: 1.4, ngebut: true }
  ];
  var VMAX = { hatch: 160, mpv: 170, suv: 180, van: 185, sedan: 205, sport: 226, pikap: 135 };
  var VMAX_MOBIL = {
    granmax: 130, carry: 130, hilux: 145, l300: 130,
    calya: 160, sigra: 160, ayla: 155, agya: 160, brio: 165, airev: 100, binguoev: 130,
    xenia: 170, avanza: 170, ertiga: 170, terios: 170, rush: 170, xl7: 170, veloz: 175, xpander: 175, stargazer: 175,
    bydm6: 180, creta: 180, hrv: 180, zenix: 180, jimny: 145,
    fortuner: 185, pajerosport: 190, civicrs: 200, bydseal: 180, crv: 190, ioniq5: 185, camry: 210, gr86: 226,
    alphard: 180, landcruiser: 210
  };
  var VMAX_MOTOR = {
    dazz: 90, revo: 95, mio: 95, beat: 95, 'beat-bekas': 92, gear: 100, supra: 105, 'supra-bekas': 102,
    scoopy: 95, vario: 108, mxking: 132, icon: 55, aerox: 122, vario160: 122, nmax: 120, pcx160: 120,
    nex2: 95, address: 95, genio: 95, fazzio: 95, lexi155: 118, filano: 98, stylo160: 120, adv160: 120,
    vespa: 108, vespasprint: 110, xmax250: 145, forza250: 145,
    satriafu: 142, cb150r: 138, klx150: 115, w175: 118, crf150l: 115, wr155r: 128, gsxr150: 148,
    cbr150: 142, r15: 145, mt25: 168, cbr250: 179, 'cbr250-bekas': 176, ninja250: 175, r25: 175, zx25r: 187,
    rxking: 140, r6: 260, zx4rr: 220, zx6r: 265, zx10r: 299, cbr1000: 299, h2: 300
  };
  function vmaxKendaraan(S, jenis) {
    if (jenis === 'mobil') {
      var c = S && S.mobil;
      return (c && VMAX_MOBIL[c.id]) || VMAX[(c && c.bentuk) || 'mpv'] || 170;
    }
    var m = S && S.motor;
    return (m && VMAX_MOTOR[m.id]) || 100;
  }
  /* skor kenyamanan kendaraan (1.0 = standar, >1 = penumpang tetap mau walau tarif lebih tinggi) */
  function nyaman(k, jenis) {
    if (!k) return 1;
    if (jenis === 'mobil') {
      if (k.bentuk === 'pikap') return 0.7;
      if (k.kelas === 'sultan') return 1.7;
      if (k.kelas === 'mewah') return 1.45;
      if (k.harga >= 300e6) return 1.3;
      if (k.harga >= 220e6) return 1.18;
      return 1.02;
    }
    if (k.id === 'forza250' || k.id === 'xmax250') return 1.45;
    if (k.id === 'nmax' || k.id === 'pcx160' || k.id === 'adv160' || k.id === 'vespa' || k.id === 'vespasprint') return 1.32;
    if (k.id === 'vario160' || k.id === 'stylo160' || k.id === 'lexi155' || k.id === 'filano' || k.id === 'aerox' || k.id === 'scoopy') return 1.16;
    if (k.harga >= 60e6) return 1.22;
    return 1.0;
  }
  var ISTIRAHAT = {
    menepi: { nama: 'Menepi tidur sebentar', menit: 20, biaya: 0, stamina: 22 },
    makan: { nama: 'Rumah makan', menit: 45, biaya: 40000, kenyang: 70, minum: 60, stamina: 12 },
    rehat: { nama: 'Rehat 2 jam', menit: 120, biaya: 0, stamina: 55 },
    penginapan: { nama: 'Penginapan (tidur 7 jam)', menit: 420, biaya: 250000, stamina: 100 }
  };
  var DASAR = { perKm: 520, tetap: 25000, minimal: 50000, tambahLaut: 40000 };

  /* level kecepatan 1-5; hujan membatasi sampai level 4 */
  function gigiEfektif(S, jenis) {
    var gi = Math.max(1, Math.min(5, Math.round(S.gigiJalan || 2)));
    var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S);
    if (hujan && gi > 4) gi = 4;
    return gi;
  }
  function gigiInfo(S, jenis, id) {
    var gi = Math.max(1, Math.min(5, id || gigiEfektif(S, jenis))), t = (jenis === 'mobil' ? GIGI : GIGI_MOTOR)[gi - 1];
    var vmax = vmaxKendaraan(S, jenis);
    var lo = Math.min(t.lo, Math.max(0, vmax - 5));
    var hi = gi === 5 ? Math.max(lo + 5, vmax) : Math.min(t.hi, vmax);
    return { id: gi, nama: t.nama, lo: lo, hi: hi, mid: Math.max(8, (lo + hi) / 2), boros: t.boros * (jenis === 'mobil' ? 1.2 : 1.15), ngebut: !!t.ngebut, vmax: vmax };
  }
  function bolehKhususJalan(S) { var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S); return !hujan; }
  function nama(id) { return KOTA[id] ? KOTA[id].nama : id; }
  function ruasAntara(a, b) { for (var i = 0; i < RUAS.length; i++) { var r = RUAS[i]; if ((r.a === a && r.b === b) || (r.a === b && r.b === a)) return r; } return null; }
  function tetangga(id) {
    var h = [];
    RUAS.forEach(function (r) { if (r.a === id) h.push({ ke: r.b, r: r }); else if (r.b === id) h.push({ ke: r.a, r: r }); });
    return h;
  }
  /* jalur terpendek (km) dengan Dijkstra */
  function jalur(a, b) {
    if (a === b) return null;
    var dist = {}, dari = {}, sel = {}, ids = Object.keys(KOTA);
    ids.forEach(function (k) { dist[k] = Infinity; }); dist[a] = 0;
    for (var n = 0; n < ids.length; n++) {
      var u = null; ids.forEach(function (k) { if (!sel[k] && (u === null || dist[k] < dist[u])) u = k; });
      if (u === null || dist[u] === Infinity) break; sel[u] = true; if (u === b) break;
      tetangga(u).forEach(function (t) { var d = dist[u] + t.r.km; if (d < dist[t.ke]) { dist[t.ke] = d; dari[t.ke] = u; } });
    }
    if (dist[b] === Infinity) return null;
    var simpul = [b]; while (simpul[0] !== a) simpul.unshift(dari[simpul[0]]);
    var ruas = [], km = 0, tol = 0, laut = false;
    for (var i = 0; i < simpul.length - 1; i++) { var r = ruasAntara(simpul[i], simpul[i + 1]); ruas.push(r); km += r.km; tol += r.tol || 0; if (r.laut) laut = true; }
    return { simpul: simpul, ruas: ruas, km: km, tol: tol, laut: laut };
  }
  function bulat5k(n) { return Math.round(n / 5000) * 5000; }
  /* tarif standar per kursi. Jakarta–Bandung ±Rp105.000, Jakarta–Semarang ±Rp265.000 */
  function tarifStandar(j) {
    var t = Math.max(DASAR.minimal, j.km * DASAR.perKm + DASAR.tetap) + (j.laut ? DASAR.tambahLaut : 0);
    return bulat5k(t);
  }
  g.KK_RUTE = { kota: KOTA, ruas: RUAS, gigi: GIGI, gigiMotor: GIGI_MOTOR, gigiEfektif: gigiEfektif, gigiInfo: gigiInfo, bolehKhususJalan: bolehKhususJalan, vmax: VMAX, vmaxKendaraan: vmaxKendaraan, nyaman: nyaman, istirahat: ISTIRAHAT, dasar: DASAR, nama: nama, tetangga: tetangga, ruasAntara: ruasAntara, jalur: jalur, tarifStandar: tarifStandar };
})(window);
