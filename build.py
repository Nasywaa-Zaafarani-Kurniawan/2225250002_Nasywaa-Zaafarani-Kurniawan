"""
Membekukan (freeze) web Flask menjadi file HTML statis di folder docs/
supaya bisa di-hosting gratis di GitHub Pages.

Cara pakai:  python build.py
Lalu commit & push folder docs/ ke GitHub.
"""

import shutil
from pathlib import Path

from app import app, TOPIK, KATEGORI_CONTOH

FOLDER_HASIL = Path("docs")

# Alamat di Flask  ->  nama file di docs/
HALAMAN = {
    "/": "index.html",
    "/beranda.html": "beranda.html",
    "/materi.html": "materi.html",
    "/contoh.html": "contoh.html",
    "/latihan.html": "latihan.html",
    "/gambar/segitiga.svg": "gambar/segitiga.svg",
    "/gambar/persegi.svg": "gambar/persegi.svg",
    "/gambar/tangga.svg": "gambar/tangga.svg",
}

# File aplikasi (PWA)
HALAMAN["/manifest.webmanifest"] = "manifest.webmanifest"
HALAMAN["/sw.js"] = "sw.js"

# Satu halaman untuk setiap sub-bab contoh soal
for _k in KATEGORI_CONTOH:
    HALAMAN[f"/contoh-{_k['slug']}.html"] = f"contoh-{_k['slug']}.html"

# Satu halaman untuk setiap topik materi
for _t in TOPIK:
    HALAMAN[f"/materi-{_t['slug']}.html"] = f"materi-{_t['slug']}.html"


def main():
    # Hapus file lama supaya tidak ada yang tertinggal.
    # Foldernya sendiri tidak dihapus, karena OneDrive sering menguncinya.
    if FOLDER_HASIL.exists():
        for file_lama in FOLDER_HASIL.rglob("*"):
            if file_lama.is_file():
                file_lama.unlink()
    FOLDER_HASIL.mkdir(exist_ok=True)

    klien = app.test_client()

    for alamat, nama_file in HALAMAN.items():
        respons = klien.get(alamat)
        if respons.status_code != 200:
            raise SystemExit(f"Gagal membuat {alamat} (status {respons.status_code})")

        tujuan = FOLDER_HASIL / nama_file
        tujuan.parent.mkdir(parents=True, exist_ok=True)
        tujuan.write_bytes(respons.data)
        print("✓", nama_file)

    # Salin CSS dan file statis lain
    shutil.copytree("static", FOLDER_HASIL / "static", dirs_exist_ok=True)
    print("✓ static/")

    # Supaya GitHub Pages tidak memproses ulang file dengan Jekyll
    (FOLDER_HASIL / ".nojekyll").touch()

    print(f"\nSelesai! Hasil ada di folder {FOLDER_HASIL}/")


if __name__ == "__main__":
    main()
