# PHYNthagoras — Media Pembelajaran Teorema Pythagoras

**Nama:** Nasywaa Zaafarani Kurniawan · **NIM:** 2225250002 · **Mata kuliah:** Algoritma Pemrograman

🌐 **Website:** https://nasywaa-zaafarani-kurniawan.github.io/2225250002_Nasywaa-Zaafarani-Kurniawan/

PHYNthagoras adalah media pembelajaran Teorema Pythagoras untuk siswa SMP. Fiturnya disusun
berdasarkan hasil wawancara dengan siswa kelas 9 SMP 10 Kota Serang (kesulitan menghafal rumus,
soal dengan banyak segitiga, soal cerita tanpa gambar, dan kebutuhan kertas coretan).

## Fitur

| Halaman | Isi |
|---|---|
| Halaman awal | Gambar interaktif (segitiga, persegi panjang, layang-layang, belah ketupat, tangga) |
| Beranda | Progres belajar, tantangan harian + streak, game Tebak Kilat, fakta seru |
| Materi | 9 topik dari *Modul 5 Teorema Pythagoras* dan *Buku Matematika Kelas VIII Bab 2*, dengan kuis yang menjelaskan letak kesalahan |
| Contoh Soal | 41 soal dalam 7 sub-bab, pembahasan *Diketahui → Ditanya → Jawab → Jadi* |
| Latihan | 18 level dalam 3 dunia (bantuan berkurang tiap dunia), soal acak, salah = mundur 1 level, ujian akhir dengan rekomendasi materi |
| Lainnya | Kertas coretan, bisa dipasang seperti aplikasi (PWA) dan dibuka offline, akun siswa (Firebase) |

## Pembagian Python dan JavaScript

Browser hanya bisa menjalankan **JavaScript**, jadi semua bagian yang interaktif saat siswa
mengklik ditulis dalam JavaScript. **Python** dipakai di sisi "dapur": menyusun halaman dan
membangun web siap online.

### Python

| File | Fungsi |
|---|---|
| `app.py` | Aplikasi **Flask**: route setiap halaman, data daftar materi (`TOPIK`) dan sub-bab contoh soal (`KATEGORI_CONTOH`), pembuat gambar SVG, manifest aplikasi, dan *service worker* (daftar file offline + nomor versi otomatis dari *hash* isi file) |
| `build.py` | Menjalankan semua route Flask lalu menyimpan hasilnya sebagai file HTML statis di folder `docs/`, karena GitHub Pages tidak bisa menjalankan Python |
| `templates/` | Template **Jinja** (bagian dari Flask), misalnya `kerangka.html` sebagai kerangka bersama dan `materi/*.html` untuk isi tiap materi |

### JavaScript (berjalan di browser siswa)

| File | Fungsi |
|---|---|
| `static/materi.js` | Langkah demi langkah, kuis + catatan kesalahan, kertas coretan |
| `static/latihan.js` | Pembuat 24 jenis soal acak, peta level, aturan mundur level, ujian & rekomendasi materi |
| `static/beranda.js` | Sapaan, progres, tantangan harian, Tebak Kilat |
| `static/hujan.js`, `static/jejak.js` | Hujan apel & clover, jejak kursor |
| `static/pasang.js` | Pasang sebagai aplikasi + pemberitahuan "Web sedang diupdate" |
| `static/akun.js`, `static/akun-gabung.js` | Login siswa dan penyimpanan progres online (Firebase) |

## Menjalankan di laptop

```bash
pip install -r requirements.txt
python app.py
```

Lalu buka http://127.0.0.1:5000/

## Memperbarui website online

```bash
python build.py
git add .
git commit -m "pesan perubahan"
git push
```

GitHub Pages memperbarui website dalam 1–2 menit. Siswa yang sedang membuka web akan melihat
pemberitahuan **"🔄 Web sedang diupdate…"** lalu otomatis mendapat versi terbaru.

## Akun siswa (opsional)

Isi `static/firebase-config.js` dengan konfigurasi dari Firebase Console, aktifkan login Google dan
Email/Password, lalu pasang aturan Firestore berikut agar setiap siswa hanya bisa mengakses
progresnya sendiri:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /progres/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Selama `firebase-config.js` kosong, fitur akun mati dan progres hanya tersimpan di browser.

## Sumber materi

- Kemendikbudristek. (2021). *Modul Pembelajaran SMP Terbuka Matematika Kelas VIII, Modul 5: Teorema Pythagoras.*
- Tohir, M., dkk. (2022). *Matematika untuk SMP/MTs Kelas VIII*, Bab 2: Teorema Pythagoras. Kemendikbudristek.
