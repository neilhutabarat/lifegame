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
    surabaya: { nama: 'Surabaya', pulau: 'Jawa', tema: 'metropolis', ramai: 1.4, ket: 'Kota Pahlawan' }
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
    { a: 'yogyakarta', b: 'surabaya', km: 320, tol: 250000 }
  ];
  /* lima percepatan + satu khusus (km/jam) */
  var GIGI = [
    { id: 1, nama: '1', lo: 10, hi: 20, boros: 0.8 },
    { id: 2, nama: '2', lo: 20, hi: 30, boros: 0.85 },
    { id: 3, nama: '3', lo: 30, hi: 40, boros: 0.9 },
    { id: 4, nama: '4', lo: 40, hi: 60, boros: 1.0 },
    { id: 5, nama: '5', lo: 60, hi: 100, boros: 1.3 },
    { id: 6, nama: '⚡', lo: 100, hi: 200, boros: 2.0, khusus: true }
  ];
  /* percepatan motor dan kendaraan umum selain mobil travel */
  var GIGI_MOTOR = [
    { id: 1, nama: '1', lo: 10, hi: 20, boros: 0.8 },
    { id: 2, nama: '2', lo: 20, hi: 30, boros: 0.85 },
    { id: 3, nama: '3', lo: 30, hi: 40, boros: 0.9 },
    { id: 4, nama: '4', lo: 40, hi: 50, boros: 1.0 },
    { id: 5, nama: '5', lo: 60, hi: 80, boros: 1.3 },
    { id: 6, nama: '⚡', lo: 80, hi: 120, boros: 1.9, khusus: true }
  ];
  var VMAX = { hatch: 140, mpv: 160, suv: 170, van: 160, sedan: 200, sport: 220 };
  var ISTIRAHAT = {
    menepi: { nama: 'Menepi tidur sebentar', menit: 20, biaya: 0, stamina: 22 },
    makan: { nama: 'Rumah makan', menit: 45, biaya: 40000, kenyang: 70, minum: 60, stamina: 12 },
    rehat: { nama: 'Rehat 2 jam', menit: 120, biaya: 0, stamina: 55 },
    penginapan: { nama: 'Penginapan (tidur 7 jam)', menit: 420, biaya: 250000, stamina: 100 }
  };
  var DASAR = { perKm: 520, tetap: 25000, minimal: 50000, tambahLaut: 40000 };

  /* gigi yang sedang berlaku untuk perjalanan sehari-hari (ojek, pulang, berangkat). Hujan membatasi sampai 4, gigi ⚡ hanya malam 22.00-05.00 tanpa hujan */
  function gigiEfektif(S, jenis) {
    var gi = Math.max(1, Math.min(6, Math.round(S.gigiJalan || 2)));
    var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S), jam = (S.menit % 1440) / 60;
    if (hujan && gi > 4) gi = 4;
    if (gi === 6 && (hujan || !(jam >= 22 || jam < 5))) gi = 5;
    return gi;
  }
  function gigiInfo(S, jenis, id) {
    var gi = id || gigiEfektif(S, jenis), t = (jenis === 'mobil' ? GIGI : GIGI_MOTOR)[gi - 1];
    return { id: gi, nama: t.nama, lo: t.lo, hi: t.hi, mid: (t.lo + t.hi) / 2, boros: t.boros * (jenis === 'mobil' ? 1.2 : 1.15) /* angka pabrik lebih irit dari pemakaian kota nyata: macet, stop-go, boncengan */, khusus: !!t.khusus };
  }
  function bolehKhususJalan(S) { var hujan = g.KK_DUNIA && g.KK_DUNIA.hujanSekarang && g.KK_DUNIA.hujanSekarang(S), jam = (S.menit % 1440) / 60; return !hujan && (jam >= 22 || jam < 5); }
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
  g.KK_RUTE = { kota: KOTA, ruas: RUAS, gigi: GIGI, gigiMotor: GIGI_MOTOR, gigiEfektif: gigiEfektif, gigiInfo: gigiInfo, bolehKhususJalan: bolehKhususJalan, vmax: VMAX, istirahat: ISTIRAHAT, dasar: DASAR, nama: nama, tetangga: tetangga, ruasAntara: ruasAntara, jalur: jalur, tarifStandar: tarifStandar };
})(window);
