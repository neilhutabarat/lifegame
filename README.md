# Kopi Kontainer

Game HP simulasi usaha kedai kopi kontainer berlatar dunia nyata Indonesia masa kini. Layar tegak, semua aksi lewat tap.
Rancangan lengkap ada di dokumen "Rancangan Game Kopi Kontainer".

## Isi
- `index.html`, `css/game.css` — tampilan
- `js/kalender.js` — kalender tanpa angka tahun (tahun ke-1 = 2023) dan rumus hari raya
- `js/adegan.js` — adegan kedai di kanvas 2D
- `js/uang.js` — laci, merchant QRIS, bank, pajak, KUR
- `js/stok.js` — stok, belanja, harga bergerak, kiriman
- `js/motor.js` — motor, kredit, bensin, perawatan
- `js/antar.js` — pesanan antar dan platform
- `js/karyawan.js` — karyawan, gaji, THR, BPJS
- `js/jualan.js` — pembeli datang, antre, bayar
- `js/data/menu.js` — bahan, resep, HPP, jenis pembeli
- `js/main.js` — alur game
- `js/data/nyata.js` — semua nama, merek, dan angka dunia nyata (diganti di sini saat game dijual)
- `tools/bundel.py` — gabungkan jadi satu berkas HTML untuk tautan uji

## Tahap
1. Kerangka: jam, kalender, buka dan tutup kedai, laporan malam, simpan otomatis ✔
2. Jualan inti: menu, pembeli antre, racik dengan tap, bayar tunai dan QRIS, laporan malam ✔
3. Uang: laci (uang kecil dan besar), QRIS cair hari kerja berikutnya, bank, biaya admin, PPh final, NIB, KUR ✔
4. Belanja dan stok: pasar, grosir, online, sales; harga bergerak tiap Senin; es mencair, susu basi ✔
5. Motor dan antar: dealer, kredit, bekas, bensin, oli, servis, pajak; pesanan WhatsApp, GoFood/GrabFood/ShopeeFood, pesanan besar; antar sendiri atau kurir ✔
6. Karyawan: lowongan, pelamar, tugas, sif, libur, tenaga, betah, gaji UMK, lembur, THR, BPJS, pesangon ✔
7. Dunia luar: rating, Maps, media sosial, pesaing, kejadian (berikutnya)
