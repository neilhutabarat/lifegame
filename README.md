# Juragan Energi Dunia 2000

Game simulasi perjalanan dari hobi oprek listrik & baterai compact di tahun 2000, mulai menyuplai listrik tetangga pakai genset bensin, mengembangkan alat pemanen surya generasi demi generasi (1.000+ riset bertahap), hingga menjadi satu-satunya pemasok listrik termurah di dunia untuk 300 juta bangunan lintas benua.

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
