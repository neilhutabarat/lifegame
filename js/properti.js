/* properti.js — beli rumah (KPR subsidi FLPP, KPR komersial, atau tunai), pindah dari kos ke rumah, beli dan jual tanah.
   Angka dari nyata.js bagian properti. Pindahan memakai jasa pindahan, gratis kalau punya pikap. */
(function (g) {
  'use strict';
  var N = g.KK_NYATA, KAL = g.KK_KAL, P = N.properti;

  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function M() { return g.KK_MOTOR; }
  function dataKota(S) { return P.kota[S.kota] || P.kota.jambi; }
  function siapkan(S) {
    if (!S.properti) S.properti = { rumah: null, tanah: [], pernahRumah: false, mulai: S.hari };
    return S;
  }
  function harga(S, tipe) { return dataKota(S)[tipe]; }
  function anuitas(pokok, bungaTahun, bulan) { var r = bungaTahun / 12; return r ? pokok * r / (1 - Math.pow(1 + r, -bulan)) : pokok / bulan; }
  function npoptkp(S) { return S.kota === 'jakarta' ? P.npoptkpJakarta : P.npoptkp; }
  function bphtb(S, h) { return Math.max(0, Math.round((h - npoptkp(S)) * P.bphtb)); }

  /* penghasilan sebulan: rata-rata laba kedai + ngojek 30 hari terakhir */
  function penghasilan(S) {
    var r = (S.riwayat || []).slice(-30); if (!r.length) return 0;
    return Math.round(r.reduce(function (t, x) { return t + (x.laba || 0) + (x.ojek || 0); }, 0) / r.length * 30);
  }
  function hitung(S, tipe, dp, tenorTahun, tunai) {
    var h = harga(S, tipe), K = P.komersial;
    if (tunai) { var b = bphtb(S, h), n = Math.round(h * 0.01); return { harga: h, tunai: true, bphtb: b, notaris: n, bayarAwal: h + b + n, angsuran: 0 }; }
    if (tipe === 'subsidi') {
      var dpS = Math.round(h * P.subsidi.dp), pokokS = h - dpS, angS = Math.round(anuitas(pokokS, P.subsidi.bunga, tenorTahun * 12) / 100) * 100;
      return { harga: h, dp: dpS, pokok: pokokS, bunga: P.subsidi.bunga, biaya: P.subsidi.biayaAkad, bphtb: 0, bayarAwal: dpS + P.subsidi.biayaAkad, angsuran: angS, tenor: tenorTahun * 12 };
    }
    var uangMuka = Math.round(h * dp / 1e6) * 1e6, pokok = h - uangMuka, bb = bphtb(S, h);
    var biaya = Math.round(pokok * K.provisi + h * K.notaris);
    var ang = Math.round(anuitas(pokok, K.bungaFix, tenorTahun * 12) / 100) * 100;
    var angFloat = Math.round(anuitas(pokok * 0.93, K.bungaFloating, tenorTahun * 12 - K.tahunFix * 12) / 100) * 100; /* perkiraan sisa pokok setelah masa tetap */
    return { harga: h, dp: uangMuka, pokok: pokok, bunga: K.bungaFix, biaya: biaya, bphtb: bb, bayarAwal: uangMuka + biaya + bb, angsuran: ang, angsuranFloating: angFloat, tenor: tenorTahun * 12 };
  }
  function syarat(S, tipe, x) {
    var gaji = penghasilan(S), daftar = [];
    if (x.tunai) { daftar.push({ teks: 'Saldo rekening ' + rp(x.bayarAwal), ok: S.bank.saldo >= x.bayarAwal }); return daftar; }
    daftar.push({ teks: 'Punya NIB (bukti usaha)', ok: !!S.nib });
    daftar.push({ teks: 'Usaha berjalan minimal 1 tahun (sekarang ' + (S.hariKe || 0) + ' hari)', ok: (S.hariKe || 0) >= P.syaratHari });
    daftar.push({ teks: 'Tidak ada riwayat telat bayar cicilan (SLIK OJK)', ok: !S.kreditBuruk });
    daftar.push({ teks: 'Angsuran paling besar ' + Math.round(P.dbr * 100) + '% penghasilan (' + rp(gaji) + ' sebulan)', ok: gaji > 0 && x.angsuran <= gaji * P.dbr });
    if (tipe === 'subsidi') {
      daftar.push({ teks: 'Penghasilan paling besar ' + rp(P.subsidi.batasGaji) + ' sebulan', ok: gaji <= P.subsidi.batasGaji });
      daftar.push({ teks: 'Belum pernah punya rumah', ok: !S.properti.pernahRumah });
    }
    daftar.push({ teks: 'Saldo rekening untuk uang muka dan biaya ' + rp(x.bayarAwal), ok: S.bank.saldo >= x.bayarAwal });
    return daftar;
  }
  function ajukan(S, tipe, dp, tenorTahun, tunai) {
    if (S.properti.rumah) return 'Sudah punya rumah. Jual dulu kalau mau ganti.';
    if (tipe === 'subsidi' && tunai) return 'Rumah subsidi hanya lewat KPR FLPP.';
    var x = hitung(S, tipe, dp, tenorTahun, tunai), s = syarat(S, tipe, x), gagal = s.filter(function (y) { return !y.ok; });
    if (gagal.length) return (tunai ? '' : 'Bank menolak: ') + gagal[0].teks + '.';
    var T = P.tipe[tipe];
    S.bank.saldo -= x.bayarAwal;
    M().catatBank(S, (tunai ? 'Beli tunai ' : 'Uang muka + biaya KPR ') + T.nama, -x.bayarAwal);
    S.properti.rumah = { tipe: tipe, nama: T.nama, harga: x.harga, status: 'akad', kunciPada: S.hari + P.akadHari, dihuni: false, dibeli: S.hari,
      kpr: tunai ? null : { angsuran: x.angsuran, pokok: x.pokok, bunga: x.bunga, fixSampai: tipe === 'subsidi' ? Infinity : S.hari + P.komersial.tahunFix * 365, sisa: x.tenor, tempo: Math.min(28, KAL.tgl(S.hari).d), tunggakan: 0, bulanTelat: 0 } };
    S.properti.pernahRumah = true;
    return { ok: true, kunci: S.properti.rumah.kunciPada };
  }

  /* pindah: ke rumah sendiri atau balik ke kos. Hasil { ok, menit, biaya, teks } */
  function pindah(S, ke, paksa) {
    var r = S.properti.rumah, kos = g.KK_DIRI.kota(S);
    if (ke === 'rumah') {
      if (!r || r.status !== 'siap') return 'Kunci rumah belum diterima.';
      if (r.dihuni) return 'Sudah tinggal di rumah.';
    } else if (S.rumah.jenis === 'kos') return 'Sudah tinggal di kos.';
    var pikap = g.KK_MOBIL && g.KK_MOBIL.pikap(S), biaya = pikap || paksa ? 0 : P.jasaPindahan;
    if (biaya && S.bank.saldo < biaya) return 'Saldo rekening tidak cukup untuk jasa pindahan ' + rp(biaya) + '.';
    if (biaya) { S.bank.saldo -= biaya; M().catatBank(S, 'Jasa pindahan (pikap + 2 orang)', -biaya); S.hariIni.pribadi = (S.hariIni.pribadi || 0) + biaya; }
    var barang = S.rumah.barang, infoBarang = S.rumah.infoBarang || {};
    if (ke === 'rumah') {
      r.dihuni = true;
      S.rumah = { jenis: 'rumah', tipe: r.tipe, sewa: 0, kwh: 0, barang: barang, infoBarang: infoBarang, wifi: false, tempo: S.rumah.tempo, padam: true, jarak: dataKota(S).jarak[r.tipe] };
    } else {
      if (r) r.dihuni = false;
      S.rumah = { jenis: 'kos', sewa: kos.kos, kwh: 10, barang: barang, infoBarang: infoBarang, wifi: false, tempo: Math.min(28, KAL.tgl(S.hari).d), padam: false, jarak: N.jarakKos };
      Object.keys(barang).forEach(function (id) { var b = g.KK_DIRI.barang(id); if (b && b.rumah) { delete barang[id]; delete infoBarang[id]; } });
      if (S.bank.saldo >= kos.kos) { S.bank.saldo -= kos.kos; M().catatBank(S, 'Sewa kos bulan pertama', -kos.kos); }
    }
    return { ok: true, menit: 180, biaya: biaya, pikap: pikap,
      teks: ke === 'rumah' ? 'Pindah ke ' + r.nama + (pikap ? ' pakai pikap sendiri.' : ', jasa pindahan ' + rp(biaya) + '.') + ' Meteran listrik rumah masih kosong: beli token di PLN Mobile.'
        : 'Pindah ke kos. Barang besar yang tidak muat dijual murah ke tetangga.' };
  }

  function nilaiRumah(S) { var r = S.properti.rumah; return r ? Math.round(r.harga * Math.pow(1.04, (S.hari - r.dibeli) / 365) / 1e6) * 1e6 : 0; }
  function sisaPokok(S) { var r = S.properti.rumah; return r && r.kpr ? Math.round(r.kpr.pokok + r.kpr.tunggakan) : 0; }
  function jualRumah(S) {
    var r = S.properti.rumah; if (!r) return 'Belum punya rumah.';
    if (r.status !== 'siap') return 'Rumah belum serah terima.';
    var nilai = nilaiRumah(S), pph = Math.round(nilai * P.pphJual), utang = sisaPokok(S), bersih = nilai - pph - utang;
    var pindahan = null;
    if (r.dihuni) { pindahan = pindah(S, 'kos'); if (!pindahan.ok) return pindahan; }
    S.bank.saldo += bersih; M().catatBank(S, 'Jual ' + r.nama + ' (setelah PPh ' + (P.pphJual * 100).toString().replace('.', ',') + '%' + (utang ? ' dan pelunasan KPR' : '') + ')', bersih);
    S.properti.rumah = null;
    return { ok: true, bersih: bersih, pindah: pindahan };
  }

  /* tanah */
  function indeks(S, hari) { return Math.pow(1 + P.kenaikanTanah, hari / 365); }
  function hargaTanah(S, luas) { return Math.round(dataKota(S).tanahM2 * luas * indeks(S, S.hari - S.properti.mulai) / 1e5) * 1e5; }
  function beliTanah(S, luas) {
    var h = hargaTanah(S, luas), b = bphtb(S, h), n = Math.round(h * 0.01), total = h + b + n;
    if (S.bank.saldo < total) return 'Butuh ' + rp(total) + ' (harga + BPHTB + notaris). Saldo rekening tidak cukup.';
    S.bank.saldo -= total; M().catatBank(S, 'Beli tanah ' + luas + ' m² (AJB, BPHTB, notaris)', -total);
    S.properti.tanah.push({ luas: luas, hargaBeli: h, hari: S.hari });
    return { ok: true, total: total };
  }
  function nilaiTanah(S, t) { return Math.round(t.hargaBeli * indeks(S, S.hari - t.hari) / 1e5) * 1e5; }
  function jualTanah(S, i) {
    var t = S.properti.tanah[i]; if (!t) return 'Tanah tidak ada.';
    var nilai = nilaiTanah(S, t), pph = Math.round(nilai * P.pphJual), bersih = nilai - pph;
    S.bank.saldo += bersih; M().catatBank(S, 'Jual tanah ' + t.luas + ' m² (setelah PPh)', bersih);
    S.properti.tanah.splice(i, 1);
    return { ok: true, bersih: bersih };
  }

  function gantiHari(S, nLama, nBaru) {
    var kabar = [], r = S.properti.rumah, tB = KAL.tgl(nBaru);
    if (!r) return kabar;
    if (r.status === 'akad' && nBaru >= r.kunciPada) { r.status = 'siap'; kabar.push('Kunci ' + r.nama + ' sudah diterima. Pindah lewat aplikasi Properti.'); }
    var k = r.kpr;
    if (k && k.sisa > 0 && tB.d === k.tempo) {
      if (r.tipe !== 'subsidi' && nBaru >= k.fixSampai && k.bunga !== P.komersial.bungaFloating) {
        k.bunga = P.komersial.bungaFloating; k.angsuran = Math.round(anuitas(k.pokok, k.bunga, k.sisa) / 100) * 100;
        kabar.push('Masa bunga tetap KPR habis. Bunga floating ' + (k.bunga * 100).toFixed(1).replace('.', ',') + '%, angsuran jadi ' + rp(k.angsuran) + '.');
      }
      if (S.bank.saldo >= k.angsuran) {
        S.bank.saldo -= k.angsuran; M().catatBank(S, 'Angsuran KPR ' + r.nama, -k.angsuran, nBaru);
        k.pokok = Math.max(0, k.pokok - (k.angsuran - k.pokok * k.bunga / 12)); k.sisa--;
        if (k.bulanTelat && S.bank.saldo >= k.tunggakan) { S.bank.saldo -= k.tunggakan; M().catatBank(S, 'Tunggakan KPR', -k.tunggakan, nBaru); k.tunggakan = 0; k.bulanTelat = 0; }
        kabar.push('Angsuran KPR ' + rp(k.angsuran) + ' dipotong. Sisa ' + k.sisa + ' bulan.');
      } else {
        k.tunggakan += k.angsuran; k.sisa--; k.bulanTelat++; S.kreditBuruk = true;
        kabar.push('Saldo kurang untuk angsuran KPR. Menunggak ' + k.bulanTelat + ' bulan.');
        if (k.bulanTelat >= P.sitaSetelahBulan) {
          if (r.dihuni) pindah(S, 'kos', true);
          S.properti.rumah = null; kabar.push('Bank menyita ' + r.nama + ' karena menunggak ' + k.bulanTelat + ' bulan. Kamu kembali tinggal di kos.');
          return kabar;
        }
      }
      if (k.sisa <= 0 && !k.tunggakan) { r.kpr = null; kabar.push('KPR lunas! Sertifikat rumah diambil di bank.'); }
    }
    return kabar;
  }

  g.KK_PROPERTI = { siapkan: siapkan, harga: harga, hitung: hitung, syarat: syarat, ajukan: ajukan, pindah: pindah, penghasilan: penghasilan, nilaiRumah: nilaiRumah,
    sisaPokok: sisaPokok, jualRumah: jualRumah, hargaTanah: hargaTanah, beliTanah: beliTanah, nilaiTanah: nilaiTanah, jualTanah: jualTanah, bphtb: bphtb, gantiHari: gantiHari };
})(window);
