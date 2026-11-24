/* simulasi.js — uji main tanpa tampilan untuk menyetel angka.
   Pakai: node tools/simulasi.js <hari> <kota> <lokasi> <jumlah barista> <menit racik per gelas> [tanpa]
   TIER=2 node tools/simulasi.js 45 medan jalan 2 7   (langsung mulai di kontainer 20 kaki) */
global.window = global;
const R = require('path').join(__dirname, '..', 'js') + '/';
['data/nyata.js','data/menu.js','kalender.js','uang.js','stok.js','motor.js','antar.js','karyawan.js','dunia.js','usaha.js','jualan.js'].forEach(f => require(R + f));
const { KK_KAL: KAL, KK_JUAL: JUAL, KK_UANG: UANG, KK_STOK: STOK, KK_MOTOR: MOTOR, KK_ANTAR: ANTAR, KK_STAF: STAF, KK_DUNIA: DUNIA, KK_USAHA: USAHA, KK_MENU: MN } = global;
const opsi = { hari: +process.argv[2] || 90, kota: process.argv[3] || 'medan', lokasi: process.argv[4] || 'jalan', staf: +process.argv[5] || 0, menitRacik: +process.argv[6] || 7, maps: process.argv[7] !== 'tanpa' };
function labaKotor(h) { const o = h.omzetTunai + h.omzetQris + (h.omzetTransfer||0) + (h.omzetOjol||0);
  return o + (h.ongkir||0) - h.mdr - (h.komisi||0) - h.hpp - h.terbuang - (h.rusak||0) - (h.operasional||0) - (h.kurir||0) - (h.bensin||0) - (h.bengkel||0) - (h.listrikMotor||0) - (h.refund||0) - (h.tenagaKerja||0) - (h.pemasaran||0) - (h.uangPalsu||0) - (h.listrik||0) - (h.sewaHarian||0); }
let S = { v: 3, kota: opsi.kota, qris: 'gopay', hari: KAL.dn(2023,1,2), menit: 360, fase: 'pagi', jamBuka: 7, jamTutup: 22, kec: 1, hariKe: 1, uang: null, hariIni: JUAL.hariBaru(), riwayat: [], omzetTahun: 0, tahunOmzet: 2023 };
UANG.siapkan(S, 'bca'); STOK.siapkan(S); MOTOR.siapkan(S); ANTAR.siapkan(S); STAF.siapkan(S); DUNIA.siapkan(S); USAHA.siapkan(S, opsi.lokasi); DUNIA.terapkanHarga(S);
if (opsi.maps) { S.dunia.maps.status = 'proses'; S.dunia.maps.aktifPada = S.hari + 5; }
const TARGET = { es: 7000, kopi: 1200, uht: 7000, skm: 1500, gula: 1500, aren: 1200, cokelat: 600, teh: 200, cupPlastik: 70, cupKertas: 30, gas: 800, galon: 4000 };
function belanjaPagi() {
  const pasar = {}, grosir = {};
  for (const id in TARGET) { const kurang = TARGET[id] - S.stok[id].jml; if (kurang <= 0) continue; const n = Math.ceil(kurang / MN.BARANG[id].isi);
    if (MN.BARANG[id].ada.includes('pasar')) pasar[id] = n; else grosir[id] = n; }
  let r1 = Object.keys(pasar).length ? STOK.beli(S, 'pasar', pasar, 'tunai') : true;
  if (r1 !== true && !(r1 && r1.ok)) { r1 = STOK.beli(S, 'grosir', pasar, 'transfer'); }
  if (Object.keys(grosir).length) STOK.beli(S, 'grosir', grosir, 'transfer');
  S.menit = 360;
}
const log = []; let sibuk = 0, sedang = null, staf = 0;
const ALAT = {
  ambilPembeli: k => { const o = JUAL.antre().filter(x => x.keadaan === 'antre' && !x.oleh)[0]; if (!o) return null; o.keadaan = 'dilayani'; o.oleh = k.id; o.olehId = k.id; return o; },
  lepasPembeli: o => { o.keadaan = 'antre'; o.oleh = null; },
  buang: m => { if (STOK.kurangResep(S, m, 1)) return 0; const x = STOK.pakaiResep(S, m, 1); S.hariIni.terbuang += x.biaya; return x.biaya; },
  buatGelas: (m, n) => { const k = STOK.kurangResep(S, m, n); if (k) return { ok: false, habis: k }; const x = STOK.pakaiResep(S, m, n); S.hariIni.operasional = (S.hariIni.operasional||0) + x.operasional; return { ok: true, biaya: x.biaya }; },
  ambilPesanan: () => null, lepasPesanan: () => {}, punyaMotor: () => false, antar: () => null, esTipis: () => false, pesanEs: () => true
};
function rekrut() {
  S.staf.push({ id: 'k' + S.staf.length, nama: 'Uji', agama: 'Islam', hariRaya: 'Idulfitri', paruh: false, cepat: 3, ramah: 3, racik: 3, jujur: 4, gaji: STAF.umk(S), mulai: S.hari, tugas: ['barista'], sif: S.staf.length % 2 ? 'sore' : 'pagi', libur: 0, tenaga: 100, setia: 70, capekHari: 0, sakitSampai: 0, lemburBulan: 0, gelas: 0, sibukSampai: 0 });
}
for (let i = 0; i < opsi.staf; i++) rekrut();
if (process.env.TIER) { S.usaha.tier = +process.env.TIER; S.usaha.kwh = 9999; if (+process.env.TIER >= 2) { S.usaha.alat.espresso1 = {}; S.usaha.alat.freezer = {}; } }
for (let d = 0; d < opsi.hari; d++) {
  belanjaPagi();
  S.fase = 'buka'; S.menit = S.jamBuka * 60;
  while (S.menit < S.jamTutup * 60) {
    S.menit += 1;
    JUAL.langkah(S, 1); STOK.jalan(S, 1); USAHA.jalan(S, 1); DUNIA.jalan(S, 1, false);
    const ka = ANTAR.jalan(S, 1, MN.KERAMAIAN[Math.floor(S.menit/60)%24]);
    S.pesanan.forEach(p => { if (p.status === 'baru') { if (p.bayar === 'tunai') ANTAR.tolak(S, p.id); else ANTAR.terima(S, p.id); } });
    if (S.staf.length) { STAF.kerja(S, 1, ALAT); const tw = S.hari*1440+S.menit;
      JUAL.semua().forEach(o => { if (o.selesaiOleh && tw >= o.selesaiOleh.pada) { const so = o.selesaiOleh; o.selesaiOleh = null; o.oleh = null; JUAL.layani(S, o, so.biaya, STAF.cari(S, o.olehId)); } }); }
    if (sedang && S.menit >= sibuk) {
      if (sedang.pesanan) { const p = sedang.pesanan, x = ANTAR.itemBerikut(p); if (x && !STOK.kurangResep(S, ANTAR.menuDari(x.menu), x.qty)) { const r = STOK.pakaiResep(S, ANTAR.menuDari(x.menu), x.qty); ANTAR.itemSiap(S, p, x, r.biaya); if (p.status === 'siap' && p.jenis !== 'ojol') ANTAR.pakaiKurir(S, p.id); } }
      else { const o = sedang.o; if (o.keadaan === 'dilayani') { if (STOK.kurangResep(S, o.menu, 1)) { o.keadaan = 'antre'; log.push('habis ' + STOK.kurangResep(S, o.menu, 1)); } else { const r = STOK.pakaiResep(S, o.menu, 1); S.hariIni.operasional = (S.hariIni.operasional||0) + r.operasional; JUAL.layani(S, o, r.biaya, null); } } }
      sedang = null;
    }
    if (!sedang) {
      const o = JUAL.depan();
      if (o && o.keadaan === 'antre') { o.keadaan = 'dilayani'; sedang = { o }; sibuk = S.menit + opsi.menitRacik; }
      else { const p = ANTAR.aktif(S).find(p => p.status === 'racik'); if (p) { const x = ANTAR.itemBerikut(p); sedang = { pesanan: p }; sibuk = S.menit + opsi.menitRacik + 1.2 * (x.qty - 1); } }
    }
    JUAL.semua().forEach(o => { if (o.keadaan === 'pulang') o.hilang = true; }); JUAL.bersihkan();
    if (S.dunia.kotor > 40) S.dunia.kotor = 0;
  }
  if (sedang && sedang.o && sedang.o.keadaan === 'dilayani') sedang.o.keadaan = 'antre';
  sedang = null; JUAL.tutup(); S.fase = 'malam'; S.menit = S.jamTutup * 60;
  UANG.setor(S, S.uang.besar); UANG.tarikMerchant(S);
  const h = S.hariIni; h.tenagaKerja = STAF.biayaHarian(S);
  const t = USAHA.tempat(S); h.sewaHarian = Math.round(USAHA.sewaBulan(S)/30 + (t.listrikBulan||0)/30);
  const laba = labaKotor(h), omzet = h.omzetTunai + h.omzetQris + (h.omzetTransfer||0) + (h.omzetOjol||0);
  log.push({ d: S.hariKe, tgl: KAL.kunci(S.hari), gelas: h.dilayani, pergi: h.pergi, penuh: h.penuh, kmb: h.tanpaKembalian, omzet, hpp: h.hpp, rusak: Math.round(h.rusak||0), buang: h.terbuang, laba: Math.round(laba), bintang: S.dunia.ratingHari.n ? (S.dunia.ratingHari.total/S.dunia.ratingHari.n).toFixed(2) : '-', maps: S.dunia.ulasan.length ? DUNIA.rataMaps(S).toFixed(2)+'/'+S.dunia.ulasan.length : '-', kas: Math.round(S.bank.saldo + UANG.laci(S) + UANG.merchantTotal(S)), pesanan: h.antar||0 });
  S.riwayat.push({ hari: S.hari, laba }); if (S.riwayat.length > 60) S.riwayat.shift();
  S.fase = 'pagi'; const nL = S.hari; UANG.gantiHari(S, S.hari, S.hari+1);
  S.hari++; S.hariKe++; S.menit = 360; S.hariIni = JUAL.hariBaru(); JUAL.kosongkan();
  STOK.gantiHari(S, nL, S.hari); MOTOR.gantiHari(S, nL, S.hari); ANTAR.gantiHari(S, nL, S.hari); STAF.gantiHari(S, nL, S.hari); DUNIA.gantiHari(S, nL, S.hari); USAHA.gantiHari(S, nL, S.hari);
  if (KAL.tgl(S.hari).y !== S.tahunOmzet) { S.tahunOmzet = KAL.tgl(S.hari).y; S.omzetTahun = 0; }
}
const hari = log.filter(x => typeof x === 'object'), habis = log.filter(x => typeof x === 'string');
const rata = k => Math.round(hari.reduce((t, x) => t + (+x[k] || 0), 0) / hari.length);
if (process.argv.includes('--rinci')) hari.forEach(x => console.log(JSON.stringify(x)));
else hari.filter((x, i) => i % 10 === 0 || i === hari.length - 1).forEach(x => console.log(JSON.stringify(x)));
console.log('RATA', JSON.stringify({ gelas: rata('gelas'), pergi: rata('pergi'), penuh: rata('penuh'), omzet: rata('omzet'), hpp: rata('hpp'), rusak: rata('rusak'), laba: rata('laba'), pesanan: rata('pesanan') }));
console.log('KAS AKHIR', hari[hari.length-1].kas, '| stok habis:', habis.length, [...new Set(habis)].slice(0,5).join(','), '| staf', S.staf.length, S.staf.map(k=>Math.round(k.setia)+'%').join(','));
