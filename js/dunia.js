/* dunia.js — rating pembeli, Google Maps, media sosial, pesaing, cuaca, dan kejadian acak.
   Rancangan bagian "Pembeli, rating, Maps, media sosial, pesaing". Angka bertanda "setelan" disetel di tahap 10. */
(function (g) {
  'use strict';
  var M = g.KK_MENU, KAL = g.KK_KAL, N = g.KK_NYATA;
  var BIAYA = { ulasanPalsu: 100000, iklanSeminggu: 350000, cekUang: 150000, endorse: [300000, 1000000, 5000000] }; /* perkiraan */
  var WARALABA = ['Kopi Kenangan', 'Janji Jiwa', 'Tomoro Coffee', 'Point Coffee'];
  var LOKAL = ['Warkop Pak Lubis', 'Kedai Kopi Senja', 'Kopi Tiam Asia', 'Warung Kopi Sidikalang', 'Kopi Kampus'];

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function acak(a) { return a[Math.floor(Math.random() * a.length)]; }
  function batas(x, a, b) { return Math.max(a, Math.min(b, x)); }

  function siapkan(S) {
    if (S.dunia) return S;
    S.dunia = {
      maps: { status: 'tidak', foto: 0, dibalas: 0 }, ulasan: [],
      sosmed: { ig: 0, tiktok: 0, viralSampai: -1, iklanSampai: -1, siaranHari: -1, endorseSampai: -1, tren: 'aren', postHari: -1 },
      pesaing: [{ nama: 'Warkop Pak Lubis', jenis: 'warkop', rating: 4.2, harga: 6000, jarak: 0.4, promoSampai: -1 }],
      cuaca: null, kotor: 0, langganan: 0, ratingHari: { n: 0, total: 0 }, palsuKetahuan: 0, cekUang: false, parkirSampai: -1, padamSampai: -1, bloggerHari: -1
    };
    M.MENU.forEach(function (m) { if (m.hargaAwal == null) m.hargaAwal = m.harga; });
    return S;
  }
  /* harga jual menu bisa diubah pemain */
  function terapkanHarga(S) {
    S.hargaMenu = S.hargaMenu || {};
    M.MENU.forEach(function (m) { if (m.hargaAwal == null) m.hargaAwal = m.harga; m.harga = S.hargaMenu[m.id] || m.hargaAwal; });
  }
  function ubahHarga(S, id, d) {
    var m = M.MENU.filter(function (x) { return x.id === id; })[0];
    S.hargaMenu[id] = Math.max(2000, Math.min(60000, m.harga + d * 500)); terapkanHarga(S); return true;
  }

  /* ---------- cuaca & suhu realistis daerah Indonesia (°C per jam & musim) ---------- */
  var SUHU_DASAR = {
    pontianak: 29.8, banjarmasin: 29.5, palangkaraya: 29.3, samarinda: 29.2, tanjungselor: 29.0,
    jakarta: 29.5, surabaya: 30.2, semarang: 29.4, serang: 29.0, yogyakarta: 28.4, bandung: 23.2,
    medan: 29.0, pekanbaru: 29.8, palembang: 29.6, padang: 28.5, bandaaceh: 28.8, jambi: 29.4, bengkulu: 28.2, bandarlampung: 28.8, pangkalpinang: 28.9, tanjungpinang: 29.2,
    denpasar: 28.8, mataram: 28.6, kupang: 30.4, makassar: 29.4, manado: 28.4, palu: 30.0, kendari: 29.0, gorontalo: 29.2, mamuju: 28.8,
    ambon: 28.0, sofifi: 28.4, jayapura: 28.6, manokwari: 28.4, sorong: 28.6, nabire: 28.0, merauke: 28.5, jayawijaya: 19.5
  };
  function suhuSekarang(S) {
    if (!S) return { c: 29, ikon: '☀️', ket: 'Cerah', kulminasi: false };
    var t = KAL.tgl(S.hari), jam = ((S.menit || 480) % 1440) / 60;
    var base = SUHU_DASAR[S.kota] != null ? SUHU_DASAR[S.kota] : 29.0;
    /* kurva suhu harian: paling sejuk ~05.00, paling panas ~14.00 */
    var diurnal = -Math.cos(((jam - 5) / 24) * Math.PI * 2) * 4.4;
    var kemarau = (t.m >= 6 && t.m <= 9) ? 1.2 : (t.m >= 11 || t.m <= 2) ? -0.8 : 0.3;
    var hujan = hujanSekarang(S);
    var deras = hujan && S.dunia && S.dunia.cuaca && S.dunia.cuaca.banjir;
    var kulminasi = S.kota === 'pontianak' && ((t.m === 3 || t.m === 9) && t.d >= 21 && t.d <= 23);
    var koreksiHujan = deras ? -5.2 : hujan ? -3.8 : 0;
    var variasi = Math.sin(S.hari * 0.73) * 0.9;
    var c = Math.round(base + diurnal + kemarau + koreksiHujan + (kulminasi && jam >= 10 && jam <= 15 ? 2.2 : 0) + variasi);
    var malam = jam >= 18.2 || jam < 5.5;
    var ikon = deras ? '⛈️' : hujan ? '🌧️' : malam ? '🌙' : (kulminasi && jam >= 11 && jam <= 14 ? '☀️' : c >= 33 ? '🥵' : jam >= 6 && jam < 17 ? '☀️' : '⛅');
    var ket = deras ? 'Hujan Deras' : hujan ? 'Hujan' : (kulminasi && jam >= 11 && jam <= 14 ? 'Kulminasi Khatulistiwa' : c >= 34 ? 'Terik Panas' : malam ? 'Malam Cerah' : c <= 23 ? 'Sejuk' : 'Cerah Berawan');
    return { c: c, ikon: ikon, ket: ket, kulminasi: kulminasi };
  }
  function hujanSekarang(S) { var c = S.dunia && S.dunia.cuaca; return !!(c && c.hari === S.hari && S.menit >= c.mulai && S.menit < c.selesai); }
  function aturCuaca(S, n) {
    var t = KAL.tgl(n), hujanMusim = t.m >= 11 || t.m <= 3, peluang = hujanMusim ? 0.5 : (t.m >= 6 && t.m <= 9) ? 0.1 : 0.3;
    if (Math.random() < peluang) {
      var mulai = 600 + Math.floor(Math.random() * 10) * 60, lama = 120 + Math.floor(Math.random() * 3) * 60;
      S.dunia.cuaca = { hari: n, mulai: mulai, selesai: mulai + lama, banjir: hujanMusim && Math.random() < 0.06 };
    } else S.dunia.cuaca = null;
  }

  /* ---------- pengali keramaian ---------- */
  function rataMaps(S) {
    var u = S.dunia.ulasan; if (!u.length) return 0;
    return u.reduce(function (t, x) { return t + x.bintang; }, 0) / u.length;
  }
  function faktor(S) {
    var d = S.dunia, f = 1, n = S.hari;
    if (d.maps.status === 'aktif') {
      var r = rataMaps(S), jml = d.ulasan.length;
      f *= 1 + (jml ? (r - 3.8) * 0.18 : 0) + Math.log(1 + jml) / Math.LN10 * 0.08 + d.maps.foto * 0.01;
    }
    f *= 1 + (d.sosmed.ig + d.sosmed.tiktok + (d.sosmed.threads || 0)) / 8000;
    if (n <= d.sosmed.viralSampai) f *= 1.8;
    if (n <= d.sosmed.iklanSampai) f *= 1.1;
    if (n <= d.sosmed.endorseSampai) f *= 1.25;
    f *= 1 + Math.min(0.3, d.langganan * 0.002);
    d.pesaing.forEach(function (p) { if (p.jarak < 1) f *= n <= p.promoSampai ? 0.85 : 0.94; });
    if (n <= d.parkirSampai) f *= 0.9;
    if (hujanSekarang(S)) f *= d.cuaca.banjir ? 0.2 : 0.5;
    return batas(f, 0.1, 4);
  }
  function faktorAntar(S) {
    var f = faktor(S);
    if (hujanSekarang(S)) f = f / (S.dunia.cuaca.banjir ? 0.2 : 0.5) * 1.5;
    if (S.dunia.sosmed.siaranHari === S.hari) f *= 2;
    return f;
  }

  /* ---------- harga pasaran: harga kedai sejenis di kota, dikoreksi harga pesaing di sekitar ---------- */
  function pasaran(S, m) {
    var k = N.kota.filter(function (x) { return x.id === S.kota; })[0], dasar = (m.hargaAwal || m.harga) * ((k && k.hargaKopi) || 1);
    var p = S.dunia ? S.dunia.pesaing.filter(function (x) { return x.jarak < 1.5 && x.jenis !== 'warkop'; }) : [];
    if (p.length) { var rata = p.reduce(function (t, x) { return t + x.harga; }, 0) / p.length; dasar *= 0.85 + 0.15 * (rata / 15000); }
    var t = Math.round(dasar / 500) * 500;
    return { tengah: t, min: Math.round(t * 0.88 / 500) * 500, maks: Math.round(t * 1.12 / 500) * 500 };
  }
  /* ---------- rating pembeli ---------- */
  var KATA = {
    rasa: ['Kopinya enak', 'Rasanya pas', 'Kopinya kurang nendang'],
    harga: ['harganya bersahabat', 'harga masih masuk', 'agak mahal untuk ukuran kontainer'],
    tunggu: ['cepat disajikan', 'nunggunya lumayan', 'antre lama banget'],
    ramah: ['pelayannya ramah', 'pelayanan biasa', 'pelayannya jutek'],
    bersih: ['tempatnya bersih', 'meja agak kotor', 'kotor, banyak sampah'],
    suasana: ['tempatnya nyaman buat nongkrong', 'tempat duduknya terbatas', 'tempatnya sempit dan panas']
  };
  function teksUlasan(nilai) {
    var urut = Object.keys(nilai).sort(function (a, b) { return nilai[b] - nilai[a]; });
    var baik = urut[0], buruk = urut[urut.length - 1];
    var bagus = function (k) { return KATA[k][nilai[k] >= 4.2 ? 0 : nilai[k] >= 3 ? 1 : 2]; };
    return bagus(baik).charAt(0).toUpperCase() + bagus(baik).slice(1) + (nilai[buruk] < 3.5 ? ', tapi ' + bagus(buruk).toLowerCase() : ', ' + bagus(urut[1]).toLowerCase()) + '.';
  }
  /* pelayan: karyawan atau null (pemain) */
  function nilaiPembeli(S, o, pelayan) {
    var p = M.PEMBELI[o.jenis], suka = p.suka[o.menu.id] || 0, maks = Math.max.apply(null, Object.keys(p.suka).map(function (k) { return p.suka[k]; }));
    var rasio = o.menu.harga / pasaran(S, o.menu).tengah;
    var nilai = {
      rasa: batas(3.3 + 1.5 * suka / maks + (pelayan ? (pelayan.racik - 4) * 0.3 : 0.2) + (g.KK_USAHA ? g.KK_USAHA.bonusRasa(S) : 0), 1, 5),
      suasana: g.KK_USAHA ? g.KK_USAHA.suasana(S) : 3.5,
      harga: batas(4.2 - (rasio - 1) * 6, 1, 5),
      tunggu: batas(5 - 4 * Math.max(0, S.menit - o.datang) / (o.sabarAwal || 40), 1, 5),
      ramah: pelayan ? batas(1.8 + pelayan.ramah * 0.65 - (pelayan.tenaga < 30 ? 0.8 : 0), 1, 5) : (g.KK_DIRI ? g.KK_DIRI.ramah(S) : 4.4),
      bersih: batas(5 - S.dunia.kotor / 22, 1, 5)
    };
    var bobot = { rasa: 0.3, harga: o.jenis === 'mahasiswa' || o.jenis === 'ojol' ? 0.3 : 0.18, tunggu: o.jenis === 'kantor' ? 0.3 : 0.2, ramah: 0.12, bersih: 0.12, suasana: 0.1 };
    var total = 0, bb = 0; for (var k in nilai) { total += nilai[k] * bobot[k]; bb += bobot[k]; }
    var bintang = batas(Math.round(total / bb + (Math.random() - 0.5) * 0.8), 1, 5);
    return { bintang: bintang, nilai: nilai };
  }
  function catatPembeli(S, o, pelayan) {
    var d = S.dunia, r = nilaiPembeli(S, o, pelayan);
    d.kotor = Math.min(100, d.kotor + 1.2);
    d.ratingHari.n++; d.ratingHari.total += r.bintang;
    if (r.bintang >= 5 && Math.random() < 0.25) d.langganan++;
    var peluang = (o.jenis === 'konten' ? 0.06 : 0.012) + (r.bintang <= 2 ? 0.05 : 0); /* setelan tahap 10: sekitar 1 ulasan tiap 2 hari di booth */
    if (d.bloggerHari === S.hari && o.blogger) peluang = 1;
    if (d.maps.status === 'aktif' && Math.random() < peluang) d.ulasan.push({ bintang: r.bintang, teks: (o.blogger ? '[Food blogger] ' : '') + teksUlasan(r.nilai), hari: S.hari, nama: acak(N.namaOrang), balas: false });
    return r.bintang;
  }
  function catatPergi(S, o) {
    var d = S.dunia; d.ratingHari.n++; d.ratingHari.total += 1;
    if (d.maps.status === 'aktif' && Math.random() < 0.06) d.ulasan.push({ bintang: 1, teks: 'Antre lama, tidak dilayani-layani. Akhirnya pergi.', hari: S.hari, nama: acak(N.namaOrang), balas: false });
  }
  function catatKomplain(S, teks) {
    var d = S.dunia; d.ratingHari.n++; d.ratingHari.total += 2;
    if (d.maps.status === 'aktif' && Math.random() < 0.25) d.ulasan.push({ bintang: 2, teks: teks, hari: S.hari, nama: acak(N.namaOrang), balas: false });
  }

  /* ---------- aksi ---------- */
  function daftarMaps(S) { var m = S.dunia.maps; if (m.status !== 'tidak') return 'Sudah didaftarkan.'; m.status = 'proses'; m.aktifPada = S.hari + 5; return true; }
  function tambahFoto(S) { var m = S.dunia.maps; if (m.status === 'tidak') return 'Daftarkan kedai di Google Bisnisku dulu.'; if (m.foto >= 5) return 'Foto sudah lengkap.'; m.foto++; return true; }
  function balas(S, i) { var u = S.dunia.ulasan[i]; if (!u || u.balas) return 'Sudah dibalas.'; u.balas = true; if (u.bintang <= 2) u.bintang = Math.min(5, u.bintang + 1); return true; }
  function bayarBank(S, jml, ket) {
    if (S.bank.saldo < jml) return false; S.bank.saldo -= jml; S.bank.mutasi.unshift({ n: S.hari, ket: ket, jml: -jml }); S.hariIni.pemasaran = (S.hariIni.pemasaran || 0) + jml; return true;
  }
  function beliUlasan(S) {
    if (S.dunia.maps.status !== 'aktif') return 'Kedai belum muncul di Google Maps.';
    if (!bayarBank(S, BIAYA.ulasanPalsu, 'Jasa ulasan bintang 5')) return 'Saldo rekening tidak cukup.';
    for (var i = 0; i < 10; i++) S.dunia.ulasan.push({ bintang: 5, teks: acak(['Mantap!', 'Recommended banget', 'Enak', 'Top']), hari: S.hari, nama: acak(N.namaOrang), balas: false, palsu: true });
    return true;
  }
  function posting(S, jenis, otomatisStaf) {
    var so = S.dunia.sosmed;
    if (so.postHari === S.hari && so.postJenis && so.postJenis.indexOf(jenis) >= 0) return 'Sudah posting di sini hari ini. Besok lagi supaya tidak dianggap spam.';
    if (!otomatisStaf && g.KK_DIRI && g.KK_DIRI.pakaiKuota) {
      var ck = g.KK_DIRI.pakaiKuota(S, jenis === 'tiktok' ? 0.35 : 0.2);
      if (ck !== true) return ck;
    }
    var jamBagus = S.menit >= 1140 && S.menit <= 1260 ? 1.5 : S.menit >= 690 && S.menit <= 780 ? 1.2 : 0.8;
    var tren = acak(M.MENU).id === so.tren ? 1.3 : 1, dasar = jenis === 'tiktok' ? 60 : jenis === 'threads' ? 25 : 35;
    var akun = jenis === 'tiktok' ? 'tiktok' : jenis === 'threads' ? 'threads' : 'ig';
    var baru = Math.round((dasar + Math.random() * dasar) * jamBagus * tren * (1 + S.dunia.langganan / 200) * (g.KK_DIRI ? g.KK_DIRI.kameraHp(S) : 1));
    so[akun] = (so[akun] || 0) + baru;
    if (so.postHari !== S.hari) { so.postHari = S.hari; so.postJenis = []; }
    so.postJenis.push(jenis);
    var viral = Math.random() < (jenis === 'tiktok' ? 0.04 : jenis === 'threads' ? 0.03 : 0.02) * jamBagus;
    if (viral) { so.viralSampai = S.hari + 2; so[akun] += 800; }
    return { ok: true, baru: baru, viral: viral, jangkauan: baru * (15 + Math.floor(Math.random() * 20)) };
  }
  function siaran(S) { if (S.dunia.sosmed.siaranHari === S.hari) return 'Siaran hari ini sudah dikirim.'; if (S.dunia.langganan < 5) return 'Belum cukup pelanggan langganan di daftar kontak (minimal 5).'; S.dunia.sosmed.siaranHari = S.hari; return true; }
  function iklan(S) { if (S.hari <= S.dunia.sosmed.iklanSampai) return 'Iklan masih berjalan.'; if (!bayarBank(S, BIAYA.iklanSeminggu, 'Iklan media sosial 7 hari')) return 'Saldo rekening tidak cukup.'; S.dunia.sosmed.iklanSampai = S.hari + 6; S.dunia.sosmed.ig += 150; return true; }
  function endorse(S, i) {
    var biaya = BIAYA.endorse[i]; if (!bayarBank(S, biaya, 'Endorse selebgram lokal')) return 'Saldo rekening tidak cukup.';
    S.dunia.sosmed.endorseSampai = S.hari + [2, 4, 7][i]; S.dunia.sosmed.ig += [300, 1200, 6000][i];
    if (Math.random() < [0.05, 0.12, 0.3][i]) S.dunia.sosmed.viralSampai = S.hari + 2;
    return true;
  }
  function beliCekUang(S) { if (S.dunia.cekUang) return 'Sudah punya.'; if (g.KK_UANG.laci(S) < BIAYA.cekUang) return 'Uang di laci tidak cukup.'; g.KK_MOTOR.bayarLaci(S, BIAYA.cekUang); S.dunia.cekUang = true; return true; }
  function bersihkan(S) { S.dunia.kotor = 0; return true; }

  /* ---------- tiap menit: kejadian di siang hari ---------- */
  function jalan(S, dMenit, adaPembersih) {
    var kabar = [], d = S.dunia;
    if (S.fase !== 'buka' || dMenit <= 0) return kabar;
    if (adaPembersih) d.kotor = Math.max(0, d.kotor - dMenit * 0.5);
    var c = d.cuaca;
    if (c && c.hari === S.hari) {
      var drvOnly = !!(S.usaha && S.usaha.berhentiSewa);
      if (S.menit >= c.mulai && S.menit - dMenit < c.mulai) kabar.push(drvOnly ? (c.banjir ? 'Hujan deras, beberapa ruas jalan banjir. Order ojol & GoCar naik!' : 'Hujan turun. Order ojol & GoCar makin ramai!') : (c.banjir ? 'Hujan deras, jalan depan kedai banjir. Pembeli jarang datang.' : 'Hujan turun. Pembeli berkurang, pesanan antar naik.'));
      if (S.menit >= c.selesai && S.menit - dMenit < c.selesai) kabar.push('Hujan reda.');
    }
    var p = dMenit / 60;
    if (Math.random() < 0.004 * p && S.hari > d.padamSampai) {
      d.padamSampai = S.hari; S.uhtBuka.hari = Math.min(S.uhtBuka.hari, S.hari - 2);
      kabar.push('Listrik PLN padam beberapa jam. Kulkas mati, susu yang sudah dibuka cepat basi.');
    }
    var adaKeamanan = g.KK_STAF && S.staf && g.KK_STAF.ada(S, 'keamanan');
    if (adaKeamanan && d.parkirSampai >= S.hari) d.parkirSampai = -1;
    if (Math.random() < (adaKeamanan ? 0.0004 : 0.002) * p && !d.cekUang && S.uang.besar >= 50000) {
      var palsu = acak([50000, 100000]); S.uang.besar = Math.max(0, S.uang.besar - palsu); S.hariIni.uangPalsu = (S.hariIni.uangPalsu || 0) + palsu;
      kabar.push('Ada uang palsu ' + rp(palsu) + ' di laci. Alat cek uang bisa mencegahnya.');
    }
    if (Math.random() < 0.003 * p && d.bloggerHari !== S.hari) { d.bloggerHari = S.hari; d.bloggerMenunggu = true; kabar.push('Food blogger lokal mampir. Layani dengan cepat dan rapi!'); }
    return kabar;
  }

  /* ---------- ganti hari ---------- */
  function gantiHari(S, nLama, nBaru) {
    var kabar = [], d = S.dunia, t = KAL.tgl(nBaru);
    d.ratingHari = { n: 0, total: 0 };
    d.kotor = Math.max(0, d.kotor - 30);
    aturCuaca(S, nBaru);
    if (d.cuaca) kabar.push('Prakiraan cuaca: hujan sekitar pukul ' + Math.floor(d.cuaca.mulai / 60) + '.00–' + Math.floor(d.cuaca.selesai / 60) + '.00.');
    if (d.maps.status === 'proses' && nBaru >= d.maps.aktifPada) { d.maps.status = 'aktif'; kabar.push('Kedai sudah muncul di Google Maps.'); }
    if (t.dow === 1) {
      var mBaru = acak(M.MENU);
      d.sosmed.tren = mBaru ? mBaru.id : 'aren';
      kabar.push('Tren minggu ini di media sosial: ' + (mBaru ? mBaru.nama : 'Kopi gula aren') + '.');
      if (d.ulasan.some(function (u) { return u.palsu; }) && Math.random() < 0.3) {
        d.ulasan = d.ulasan.filter(function (u) { return !u.palsu; }); d.palsuKetahuan++;
        for (var i = 0; i < 3; i++) d.ulasan.push({ bintang: 1, teks: 'Ulasannya banyak yang palsu. Jangan percaya bintangnya.', hari: nBaru, nama: acak(N.namaOrang), balas: false });
        kabar.push('Google menghapus ulasan palsu kedai. Pembeli mulai curiga.');
      }
    }
    /* pesaing */
    if (Math.random() < 0.025) {
      var w = Math.random() < 0.5, nama = w ? acak(WARALABA) : acak(LOKAL);
      if (!d.pesaing.some(function (p) { return p.nama === nama; })) {
        d.pesaing.push({ nama: nama, jenis: w ? 'waralaba' : 'lokal', rating: Math.round((4 + Math.random() * 0.8) * 10) / 10, harga: w ? 18000 + Math.floor(Math.random() * 6) * 1000 : 12000 + Math.floor(Math.random() * 5) * 1000, jarak: Math.round((0.2 + Math.random() * 1.5) * 10) / 10, promoSampai: nBaru + 7 });
        kabar.push(nama + ' buka ' + d.pesaing[d.pesaing.length - 1].jarak.toLocaleString('id-ID') + ' km dari kedai, dengan promo pembukaan seminggu.');
      }
    }
    d.pesaing.forEach(function (p) { if (p.jenis !== 'warkop' && nBaru > p.promoSampai && Math.random() < 0.03) { p.promoSampai = nBaru + 3; kabar.push(p.nama + ' sedang promo besar-besaran 3 hari.'); } });
    var adaKeamananHari = S.staf && S.staf.some(function (k) { return k.tugas.indexOf('keamanan') >= 0 && k.mulai <= nBaru && nBaru >= (k.sakitSampai || 0); });
    if (adaKeamananHari) d.parkirSampai = -1;
    else if (Math.random() < 0.02 && nBaru > d.parkirSampai) { d.parkirSampai = nBaru + 7; kabar.push('Juru parkir liar mulai menarik Rp3.000 di depan kedai. Sebagian pembeli malas mampir.'); }
    /* komplain viral kalau rating rendah dan ulasan buruk tidak dibalas */
    var buruk = d.ulasan.filter(function (u) { return u.bintang <= 2 && !u.balas && nLama - u.hari <= 2; });
    if (buruk.length >= 3 && Math.random() < 0.3) { d.sosmed.ig = Math.max(0, d.sosmed.ig - 100); for (var j = 0; j < 4; j++) d.ulasan.push({ bintang: 1, teks: 'Ikut-ikutan dari postingan viral: pelayanan buruk.', hari: nBaru, nama: acak(N.namaOrang), balas: false }); kabar.push('Keluhan pembeli viral di media sosial. Balas ulasan buruk supaya tidak melebar.'); }
    if (d.sosmed.postHari !== nLama && S.staf && S.staf.some(function (k) { return k.tugas.indexOf('sosmed') >= 0 && k.mulai <= nLama; })) { var r = posting(S, Math.random() < 0.5 ? 'ig' : 'tiktok', true); if (r.ok) kabar.push('Admin media sosial memposting kemarin malam, +' + r.baru + ' pengikut.' + (r.viral ? ' Postingannya viral!' : '')); }
    return kabar;
  }

  g.KK_DUNIA = { pasaran: pasaran, BIAYA: BIAYA, siapkan: siapkan, terapkanHarga: terapkanHarga, ubahHarga: ubahHarga, faktor: faktor, faktorAntar: faktorAntar, hujanSekarang: hujanSekarang, suhuSekarang: suhuSekarang,
    catatPembeli: catatPembeli, catatPergi: catatPergi, catatKomplain: catatKomplain, rataMaps: rataMaps, daftarMaps: daftarMaps, tambahFoto: tambahFoto, balas: balas,
    beliUlasan: beliUlasan, posting: posting, siaran: siaran, iklan: iklan, endorse: endorse, beliCekUang: beliCekUang, bersihkan: bersihkan, jalan: jalan, gantiHari: gantiHari };
})(window);
