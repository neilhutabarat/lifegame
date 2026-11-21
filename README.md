# Rental Simulator by Oneilverse (v3.0)

Game simulasi bisnis & kehidupan (*Life & Tycoon Simulator*) multi-usaha dari **Rental PS/PC, Sewa PS Harian ke Rumah, Wi-Fi Hotspot, Agen Pulsa/E-Wallet (PPOB), hingga Penginapan/Kos-kosan** mulai **Januari 2020** di Indonesia.

## Cara Deploy ke GitHub Pages
1. Ekstrak seluruh isi ZIP ini (`index.html`, `style.css`, `data.js`, `game.js`, `README.md`).
2. Upload & timpa ke root repository GitHub kamu (tetap biarkan `firebase-config.js`, `cloud.js`, `firestore.rules` jika ada — sistem save v3.0 otomatis tersimpan offline di `localStorage` dan melakukan sinkronisasi ke Firestore saat terhubung ke internet!).
3. Buka **Settings > Pages** untuk memastikan GitHub Pages aktif.

## Pembaruan Utama v3.0
1. **Perbaikan Scroll & UI Responsif HP:** Menghentikan *re-render* destruktif tiap detik sehingga scroll daftar belanja & room mulus tanpa lompat ke atas, dilengkapi navigasi bawah khusus mobile.
2. **Tombol Pause (`⏸️`) & Speed (`1x`, `2x`, `4x`, `8x`):** Jeda waktu kapan saja di sebelah tombol `1x`.
3. **Mode Developer (Modal Rp 100 Juta) vs Mode Rilis Pemain (Modal Rp 30 Juta):** Pilih mode saat mulai atau melalui menu pengaturan untuk menguji keseimbangan ekonomi rilis.
4. **Custom In-Game Modal (Tanpa Pop-up Browser):** Semua dialog (edit nama rental, diskon/tarif gratis di tiap billing room, atur voucher Wi-Fi, konfirmasi VIP 2x) menggunakan modal HTML/CSS internal yang ramah aplikasi HP/WebView.
5. **Pemisahan Saldo M-Banking Pribadi vs Deposit Saldo Bisnis PPOB + Biaya Admin Operator:** Transfer & top up e-wallet (GoPay, OVO, DANA, ShopeePay, LinkAja, Token PLN) memotong Deposit Saldo Bisnis, sementara uang pokok + margin keuntungan/admin masuk ke Laci Kasir.
6. **TV LCD & LED Terbaik Tahun 2020+ (Tanpa TV Tabung):** Katalog TV LCD & LED/UHD/QLED merk asli (TCL, Coocaa, Polytron, Sharp, LG, Samsung, Sony) dari termurah hingga termahal.
7. **Sistem Room Rental (AC, Kipas Angin, CCTV) & Ekspansi Penginapan/Kos:** Pasang kipas angin, AC, dan CCTV di setiap room rental, serta buka unit bisnis **Kos-kosan / Penginapan Harian** bertahap.
8. **Pelanggan Tanpa Penalti Reputasi & Rekomendasi Game:** Jika game favorit pelanggan belum tersedia, pelanggan dapat memilih main game lain yang ada atau pulang dengan sopan sambil merekomendasikan game tersebut (akan menjadi **Pelanggan Tetap** jika dibelikan).
9. **Sewa PS Bawa Pulang (Rental Harian):** Aktifkan layanan sewa PS harian menggunakan stok konsol & TV di gudang (di luar room) atau slot sewa khusus.
10. **Hybrid Offline + Firestore Auto-Sync:** Seluruh progres otomatis tersimpan di penyimpanan lokal (`localStorage`) saat offline dan otomatis tersinkronisasi ke Firestore ketika online.
