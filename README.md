# Kopi Kontainer

Game HP simulasi usaha kedai kopi kontainer berlatar dunia nyata Indonesia masa kini. Layar tegak, semua aksi lewat tap.
Rancangan lengkap ada di dokumen "Rancangan Game Kopi Kontainer".

## Isi
- `index.html`, `css/game.css` — tampilan
- `js/kalender.js` — kalender tanpa angka tahun (tahun ke-1 = 2023) dan rumus hari raya
- `js/adegan.js` — adegan kedai di kanvas 2D
- `js/uang.js` — laci, merchant QRIS, bank, pajak, KUR
- `js/stok.js` — stok, belanja, harga bergerak, kiriman
- `js/motor.js` — motor, kredit, bensin, perawatan, jual
- `js/mobil.js` — mobil, kredit, bensin, servis, pajak, jual
- `js/ojek.js` — ngojek: daftar driver, order penumpang/barang/makanan, tarif zona
- `js/properti.js` — KPR subsidi dan komersial, pindah rumah, tanah
- `js/antar.js` — pesanan antar dan platform
- `js/karyawan.js` — karyawan, gaji, THR, BPJS
- `js/dunia.js` — rating, Maps, media sosial, pesaing, cuaca, kejadian
- `js/usaha.js` — lokasi, tempat, alat, listrik, cabang, menu sendiri
- `js/diri.js` — kebutuhan badan, kos atau rumah, isinya, tidur
- `js/jualan.js` — pembeli datang, antre, bayar
- `js/suara.js` — lagu tema orisinal (pagi, jam buka, malam) dan efek suara Web Audio API
- `js/data/menu.js` — bahan, resep, HPP, jenis pembeli
- `js/main.js` — alur game
- `js/data/rute.js` — peta antarkota (22 kota, jarak, tol, kapal Merak–Bakauheni), tarif standar
- `js/travel.js` — Travel: pool, penumpang, tujuan, tarif, percepatan 1–5 dan ⚡, istirahat, laporan
- `js/data/nyata.js` — semua nama, merek, dan angka dunia nyata (diganti di sini saat game dijual)
- `tools/bundel.py` — gabungkan jadi satu berkas HTML untuk tautan uji

## Tahap
1. Kerangka: jam, kalender, buka dan tutup kedai, laporan malam, simpan otomatis ✔
2. Jualan inti: menu, pembeli antre, racik dengan tap, bayar tunai dan QRIS, laporan malam ✔
3. Uang: laci (uang kecil dan besar), QRIS cair hari kerja berikutnya, bank, biaya admin, PPh final, NIB, KUR ✔
4. Belanja dan stok: pasar, grosir, online, sales; harga bergerak tiap Senin; es mencair, susu basi ✔
5. Motor dan antar: dealer, kredit, bekas, bensin, oli, servis, pajak; pesanan WhatsApp, GoFood/GrabFood/ShopeeFood, pesanan besar; antar sendiri atau kurir ✔
6. Karyawan: lowongan, pelamar, tugas, sif, libur, tenaga, betah, gaji UMK, lembur, THR, BPJS, pesangon ✔
7. Dunia luar: bintang tiap pembeli, Google Maps dan ulasan, Instagram/TikTok/WA Business, iklan dan endorse, pesaing, hujan dan banjir, kebersihan, kejadian acak ✔
8. Naik kelas: lokasi, booth sampai ruko, alat, sewa, token listrik PLN, cabang, racik menu sendiri ✔
9. Gambar AI, animasi, suara (menunggu gambar)
10. Uji dan setel: simulasi 400 hari tanpa galat, angka disetel ✔
A. Penyempurnaan: sajikan sekali tap, harga pasaran, layar tidak mati, token PLN asli, kebutuhan badan, kos dan isinya ✔
C1. Makan & minum di HP, QRIS sampai 3, SeaBank, pasar/swalayan kapan saja, bensin per liter, bar oli dan servis, Threads, dock Pesanan antar, layar HP terkunci lebar ✔
C2. Jadwal karyawan per jam & tugas keamanan, toko game PS1–PS5 (bekas original & baru), kartu kredit aturan BI, jual barang bekas, lagu tema 3 suasana & efek suara ✔
B. Ngojek (Gojek/Grab Driver), motor sampai moge, mobil pikap sampai sultan, KPR subsidi/komersial, pindah rumah, isi rumah, tanah ✔
O1. Mulai sebagai driver, kedai jadi usaha sampingan (opsional) ✔
O2. Peta antarkota nyata: jarak, tol, kapal penyeberangan, tarif standar yang bisa dinaik-turunkan ✔
O3–O5. Travel mobil: tunggu penumpang penuh, jemput di kota yang sama, percepatan 1–5 dan ⚡ (malam/sepi), bensin, tilang, ban bocor, penumpang minta cepat atau santai, menepi/rumah makan/rehat 2 jam/penginapan ✔
O6. Pemandangan tiap kota, jalan bergulir, kapal ✔
P1. Stamina dan melek digabung jadi satu bar, bar bensin di samping baterai HP, potret karakter dipotong ke wajah dan mengikuti gender, adegan jalan tanpa latar kedai, perjalanan pulang/berangkat beranimasi sesuai jarak ✔
