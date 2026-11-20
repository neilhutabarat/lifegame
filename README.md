# Warnet Juragan 2008

Game simulasi bisnis warnet dan rental PS/Xbox di Indonesia, mulai tahun 2008. Satu halaman web tanpa build step.

## Isi repo
- `index.html`: game (simpanan lokal di browser tetap jalan tanpa Firebase)
- `cloud.js`: login Google dan simpan ke Firestore
- `firebase-config.js`: isi config Firebase kamu di sini
- `firestore.rules`: aturan keamanan Firestore

## Pasang Firestore (sekali saja)
1. Buka Firebase Console, buat proyek.
2. Build > Authentication > Sign-in method > aktifkan **Google**.
3. Build > Firestore Database > Create database (production mode).
4. Tab Rules: tempel isi `firestore.rules`, lalu Publish.
5. Project settings > Your apps > tambah **Web app**, salin config ke `firebase-config.js`.
6. Authentication > Settings > Authorized domains: tambahkan `USERNAME.github.io` (dan `localhost` untuk uji lokal).

## Jalankan lokal
Modul ES tidak jalan dari `file://`, jadi pakai server kecil:

    python3 -m http.server 8000

lalu buka http://localhost:8000

## Pasang di GitHub Pages
1. Push semua file ke repo.
2. Settings > Pages > Deploy from a branch > `main` / root.
3. Buka `https://USERNAME.github.io/NAMA-REPO/`.

## Cara kerja simpanan
- Simpanan lokal selalu aktif (browser).
- Setelah login Google, progres juga disimpan di dokumen `saves/{uid}` tiap akhir bulan game, atau lewat tombol "Simpan ke cloud".
- Saat login, yang lebih baru (lokal atau cloud) yang dipakai.

## Catatan
- Config Firebase di sisi klien bukan rahasia. Keamanan data ada di `firestore.rules`. Jangan pernah commit service account key.
- Angka inflasi 2008 sampai 2025 adalah perkiraan dari data BPS. Cocokkan dengan sumber resmi bila perlu.
